import { readLocalSyncState, ensureStateMetadata, getDailyXpDayCount } from './adapters'
import { encodeSyncPackage } from './codec'
import {
  loadSyncCheckpoint,
  loadSyncMeta,
  markBaselineCreated,
  markPackageCreated,
  saveSyncCheckpoint,
} from './device'
import {
  appendSyncEvent,
  getSyncVector,
  getTotalXpFromSyncEvents,
  loadSyncEvents,
  setLocalKnownToLatest,
} from './events'
import {
  SYNC_APP_ID,
  SYNC_SCHEMA_VERSION,
  type DailyXpLedger,
  type LocalSyncState,
  type SyncPackage,
  type SyncPackageSummary,
} from './types'
import type { MasteryState } from '../storage'

export interface CreatedSyncPackage {
  pkg: SyncPackage
  text: string
}

function createSummary(pkg: Omit<SyncPackage, 'checksum' | 'summary'>): SyncPackageSummary {
  return {
    eventCount: pkg.events.length,
    xpTotalInPayload: pkg.events.reduce((sum, event) => sum + event.xpDelta, 0),
    answerRecordCount: pkg.state.answerRecords.length,
    dailyXpDayCount: getDailyXpDayCount(pkg.state.dailyXpLedger),
    afternoonRecordCount: pkg.state.trackerRecords.length,
    badgeCount: pkg.state.gamification.unlockedBadgeIds.length,
  }
}

function filterEventsForTarget(targetVector: Record<string, number> | undefined) {
  const events = loadSyncEvents()
  if (!targetVector) return events
  return events.filter((event) => event.seq > (targetVector[event.deviceId] ?? 0))
}

function vectorsEqual(a: Record<string, number> | undefined, b: Record<string, number> | undefined): boolean {
  if (!a || !b) return false
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false
  }
  return true
}

function answerRecordKey(record: LocalSyncState['answerRecords'][number]): string {
  return [
    record.questionId,
    record.mode,
    record.isCorrect ? '1' : '0',
    record.answeredAt,
    record.userAnswer,
  ].join('|')
}

function uniqueBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    map.set(keyOf(item), item)
  }
  return Array.from(map.values())
}

function masteryRank(value: MasteryState | undefined): number {
  switch (value) {
    case 'incorrect': return 1
    case 'correct': return 2
    case 'consecutive': return 3
    default: return 0
  }
}

function compactDailyXpLedger(current: DailyXpLedger, target: DailyXpLedger | undefined): DailyXpLedger {
  const compact: DailyXpLedger = {}
  for (const [deviceId, daily] of Object.entries(current)) {
    for (const [date, xp] of Object.entries(daily)) {
      if (xp > (target?.[deviceId]?.[date] ?? 0)) {
        compact[deviceId] ??= {}
        compact[deviceId][date] = xp
      }
    }
  }
  return compact
}

function mergeDailyXpLedgerForTarget(base: DailyXpLedger, incoming: DailyXpLedger): DailyXpLedger {
  const merged: DailyXpLedger = {}
  for (const [deviceId, daily] of Object.entries(base)) {
    merged[deviceId] = { ...daily }
  }
  for (const [deviceId, daily] of Object.entries(incoming)) {
    merged[deviceId] ??= {}
    for (const [date, xp] of Object.entries(daily)) {
      merged[deviceId][date] = Math.max(merged[deviceId][date] ?? 0, xp)
    }
  }
  return merged
}

function mergeTargetStates(base: LocalSyncState, incoming: LocalSyncState): LocalSyncState {
  const questionMastery: Record<string, MasteryState> = { ...base.questionMastery }
  for (const [key, value] of Object.entries(incoming.questionMastery)) {
    if (masteryRank(value) > masteryRank(questionMastery[key])) {
      questionMastery[key] = value
    }
  }

  return {
    answerRecords: uniqueBy([...base.answerRecords, ...incoming.answerRecords], answerRecordKey),
    studySessions: uniqueBy([...base.studySessions, ...incoming.studySessions], (session) => session.id),
    bookmarks: uniqueBy([...base.bookmarks, ...incoming.bookmarks], (bookmark) => bookmark.questionId),
    questionMastery,
    trackerRecords: uniqueBy([...base.trackerRecords, ...incoming.trackerRecords], (record) => record.id),
    gamification: {
      ...incoming.gamification,
      xp: Math.max(base.gamification.xp, incoming.gamification.xp),
      totalAnswered: Math.max(base.gamification.totalAnswered, incoming.gamification.totalAnswered),
      totalCorrect: Math.max(base.gamification.totalCorrect, incoming.gamification.totalCorrect),
      writtenCorrect: Math.max(base.gamification.writtenCorrect, incoming.gamification.writtenCorrect),
      currentStreak: Math.max(base.gamification.currentStreak, incoming.gamification.currentStreak),
      maxStreak: Math.max(base.gamification.maxStreak, incoming.gamification.maxStreak),
      correctQuestionIds: Array.from(new Set([
        ...base.gamification.correctQuestionIds,
        ...incoming.gamification.correctQuestionIds,
      ])),
      writtenCorrectQuestionIds: Array.from(new Set([
        ...base.gamification.writtenCorrectQuestionIds,
        ...incoming.gamification.writtenCorrectQuestionIds,
      ])),
      unlockedBadgeIds: Array.from(new Set([
        ...base.gamification.unlockedBadgeIds,
        ...incoming.gamification.unlockedBadgeIds,
      ])),
    },
    dailyXpLedger: mergeDailyXpLedgerForTarget(base.dailyXpLedger, incoming.dailyXpLedger),
    // ★F1-P2: importantQuestions は集合和でマージ
    importantQuestions: Array.from(
      new Set([
        ...(base.importantQuestions ?? []),
        ...(incoming.importantQuestions ?? []),
      ]),
    ),
    // ★F1-P4: morningRecords は id でユニーク化
    morningRecords: uniqueBy(
      [...(base.morningRecords ?? []), ...(incoming.morningRecords ?? [])],
      (r) => r.id,
    ),
  }
}

function resolveTargetState(targetPackage: Pick<SyncPackage, 'baseVector' | 'state'>): LocalSyncState {
  const checkpoint = loadSyncCheckpoint()
  if (checkpoint && vectorsEqual(checkpoint.vector, targetPackage.baseVector)) {
    return mergeTargetStates(checkpoint.state, targetPackage.state)
  }
  return targetPackage.state
}

function compactStateForTarget(state: LocalSyncState, target: LocalSyncState | undefined): LocalSyncState {
  if (!target) return state

  const targetAnswerKeys = new Set((target.answerRecords ?? []).map((record) => [
    record.questionId,
    record.mode,
    record.isCorrect ? '1' : '0',
    record.answeredAt,
    record.userAnswer,
  ].join('|')))
  const targetSessionIds = new Set((target.studySessions ?? []).map((session) => session.id))
  const targetBookmarkIds = new Set((target.bookmarks ?? []).map((bookmark) => bookmark.questionId))
  const targetTrackerIds = new Set((target.trackerRecords ?? []).map((record) => record.id))
  const questionMastery: Record<string, MasteryState> = {}

  for (const [key, value] of Object.entries(state.questionMastery)) {
    if (masteryRank(value) > masteryRank(target.questionMastery?.[key])) {
      questionMastery[key] = value
    }
  }

  return {
    answerRecords: state.answerRecords.filter((record) => !targetAnswerKeys.has([
      record.questionId,
      record.mode,
      record.isCorrect ? '1' : '0',
      record.answeredAt,
      record.userAnswer,
    ].join('|'))),
    studySessions: state.studySessions.filter((session) => !targetSessionIds.has(session.id)),
    bookmarks: state.bookmarks.filter((bookmark) => !targetBookmarkIds.has(bookmark.questionId)),
    questionMastery,
    trackerRecords: state.trackerRecords.filter((record) => !targetTrackerIds.has(record.id)),
    gamification: state.gamification,
    dailyXpLedger: compactDailyXpLedger(state.dailyXpLedger, target.dailyXpLedger),
    // ★F1-P2: importantQuestions の差分のみ送る（受信側 target に無い ID のみ）
    importantQuestions: (state.importantQuestions ?? []).filter(
      (id) => !(target.importantQuestions ?? []).includes(id),
    ),
    // ★F1-P4: morningRecords の差分のみ送る（受信側 target に無い id のみ）
    morningRecords: (() => {
      const targetIds = new Set((target.morningRecords ?? []).map((r) => r.id))
      return (state.morningRecords ?? []).filter((r) => !targetIds.has(r.id))
    })(),
  }
}

export function ensureLocalSyncCheckpoint(): void {
  const now = new Date().toISOString()
  ensureStateMetadata()

  const meta = loadSyncMeta()
  const state = readLocalSyncState()
  if (!meta.baselineCreatedAt) {
    appendSyncEvent(
      'legacy-baseline',
      {
        answerRecords: state.answerRecords.length,
        dailyXpDays: getDailyXpDayCount(state.dailyXpLedger),
        afternoonRecords: state.trackerRecords.length,
        badges: state.gamification.unlockedBadgeIds.length,
      },
      state.gamification.xp,
      now,
    )
    markBaselineCreated(now)
  }

  const totalXp = getTotalXpFromSyncEvents()
  const currentXp = readLocalSyncState().gamification.xp
  if (currentXp > totalXp) {
    appendSyncEvent('xp-delta', { reason: 'local-xp-checkpoint' }, currentXp - totalXp, now)
  }

  setLocalKnownToLatest()
}

export async function createSyncPackage(
  targetPackage?: Pick<SyncPackage, 'baseVector' | 'fromVector' | 'state'>,
): Promise<CreatedSyncPackage> {
  ensureLocalSyncCheckpoint()
  const createdAt = new Date().toISOString()
  const meta = loadSyncMeta()
  const localState = readLocalSyncState()
  const checkpoint = targetPackage ? null : loadSyncCheckpoint()
  const targetVectorForFiltering = targetPackage?.fromVector ?? checkpoint?.vector
  const targetState = targetPackage ? resolveTargetState(targetPackage) : checkpoint?.state
  const events = filterEventsForTarget(targetVectorForFiltering)
  const state = compactStateForTarget(localState, targetState)
  const base = {
    schemaVersion: SYNC_SCHEMA_VERSION,
    app: SYNC_APP_ID,
    createdAt,
    fromDeviceId: meta.deviceId,
    fromVector: getSyncVector(),
    baseVector: targetPackage ? undefined : checkpoint?.vector,
    targetVector: targetPackage?.fromVector,
    events,
    state,
  } satisfies Omit<SyncPackage, 'checksum' | 'summary'>
  const pkgWithoutChecksum = {
    ...base,
    summary: createSummary(base),
  }
  const text = await encodeSyncPackage(pkgWithoutChecksum)
  const pkg = {
    ...pkgWithoutChecksum,
    checksum: '',
  } as SyncPackage
  markPackageCreated(createdAt)
  if (targetPackage) {
    saveSyncCheckpoint({
      createdAt,
      vector: getSyncVector(),
      state: localState,
    })
  }
  return { pkg, text }
}
