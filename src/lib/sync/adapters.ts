import type { ActivityEvent } from '../activityLog'
import type { GamificationState } from '../gamification'
import type { PracticeRecord } from '../tracker'
import type { AnswerRecord, Bookmark, StudySession, MorningRecord, EssayAttempt } from '../../types'
import type { DailyXpLedger, LocalSyncState } from './types'
import type { MasteryState } from '../storage'
import { getTotalXpFromSyncEvents } from './events'
import { loadSyncMeta } from './device'
import { BADGES } from '../../data/badges'
import { questions } from '../../data/questions'
import {
  loadAllSavedAnswerSnapshots,
  saveAllSavedAnswerSnapshots,
  type AfternoonSavedAnswerSnapshot,
} from '../afternoonSavedAnswers'

const KEYS = {
  // === NW踏襲（prefix 置換済み） ===
  ANSWER_RECORDS: 'pmap:answer_records',
  USER_PROGRESS: 'pmap:user_progress_v2',
  STUDY_SESSIONS: 'pmap:study_sessions',
  BOOKMARKS: 'pmap:bookmarks',
  QUESTION_MASTERY: 'pmap:question_mastery',
  NOTE_UNDERSTANDING: 'pmap:note_understanding',
  TRACKER_RECORDS: 'pmap:tracker:records',
  // TRACKER_PLANS: 'pmap:tracker:plans',  // ★F1-P-1 D-LIB-05: F1段階は同期対象外（NW踏襲）。F2-P4 で最終決定
  GAMIFICATION: 'pmap:gamification',
  ACTIVITY_LOG: 'pmap:activityLog',
  DAILY_XP_LEDGER: 'pmap:sync:daily_xp_ledger',
  NOTE_META: 'pmap:sync:note_meta',
  PLAN_META: 'pmap:sync:plan_meta',  // plans 本体ではなく更新タイムスタンプのみ同期

  // === PM追加（F1-P2 開始） ===
  IMPORTANT_QUESTIONS: 'pmap:important_questions',  // ★F1-P2 重要マーク
  MORNING_RECORDS: 'pmap:morning:records',           // ★F1-P4 公式午前Ⅱ 解答履歴
  ESSAY_ATTEMPTS: 'pmap:essay:attempts',             // ★F1-P5 論述 練習履歴
  ESSAY_PLANS: 'pmap:essay:plans',                   // ★F1-P5 論述 学習計画日
  // ESSAY_ACTIVE は同期対象外（端末ローカルの離脱復帰用）
} as const

const COMPLETE_BADGE_ID = 'complete-1'
const COMPLETE_BADGE = BADGES.find((badge) => badge.id === COMPLETE_BADGE_ID)

interface StoredProgress {
  topicId: string
  mcAttempts: number
  mcCorrect: number
  wrAttempts: number
  wrCorrect: number
  lastStudiedAt: string
  isBookmarked: boolean
}

export interface LocalMergeStats {
  addedAnswerRecordCount: number
  updatedDailyXpDayCount: number
  addedAfternoonRecordCount: number
  addedMorningRecordCount: number
  addedBadgeCount: number
}

const DEFAULT_GAMIFICATION: GamificationState = {
  xp: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  writtenCorrect: 0,
  currentStreak: 0,
  maxStreak: 0,
  correctQuestionIds: [],
  writtenCorrectQuestionIds: [],
  recentResults: [],
  recentWrittenResults: [],
  unlockedBadgeIds: [],
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function uniqueBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    map.set(keyOf(item), item)
  }
  return Array.from(map.values())
}

function sortByIso<T>(items: T[], keyOf: (item: T) => string): T[] {
  return [...items].sort((a, b) => keyOf(a).localeCompare(keyOf(b)))
}

function answerRecordKey(record: AnswerRecord): string {
  return [
    record.questionId,
    record.mode,
    record.isCorrect ? '1' : '0',
    record.answeredAt,
    record.userAnswer,
  ].join('|')
}

// 午前Ⅱ記録の内容キー（id ではなく内容で重複排除）。
// wire 経由の記録は id を内容から決定的に再構成するため、id だと端末ローカルの
// UUID 記録と二重計上されてしまう。分解像度（QRの圧縮粒度）でタイムスタンプを丸めて
// 往復同期でも同一記録が重複しないようにする。
function morningRecordKey(record: MorningRecord): string {
  // selectedIndex は wire で同期しないためキーに含めない（local UUID 記録と wire 復元記録を揃える）
  const minute = Math.floor((Date.parse(record.answeredAt) || 0) / 60000)
  return [record.questionId, record.isCorrect ? '1' : '0', minute].join('|')
}

function aggregateDailyXp(events: ActivityEvent[]): Record<string, number> {
  const daily: Record<string, number> = {}
  for (const event of events) {
    daily[event.date] = (daily[event.date] ?? 0) + event.xp
  }
  return daily
}

function normalizeBadgeIds(ids: string[]): string[] {
  const unlockedSet = new Set(ids)
  return BADGES
    .filter((badge) => unlockedSet.has(badge.id))
    .map((badge) => badge.id)
}

function hasAllNonCompleteBadges(ids: string[]): boolean {
  const unlockedSet = new Set(ids)
  return BADGES.every((badge) => badge.id === COMPLETE_BADGE_ID || unlockedSet.has(badge.id))
}

function mergeUnlockedBadgeIds(currentIds: string[], incomingIds: string[]): string[] {
  const merged = new Set(normalizeBadgeIds([...currentIds, ...incomingIds]))
  if (!merged.has(COMPLETE_BADGE_ID) && hasAllNonCompleteBadges(Array.from(merged))) {
    merged.add(COMPLETE_BADGE_ID)
  }
  return BADGES
    .filter((badge) => merged.has(badge.id))
    .map((badge) => badge.id)
}

function countLedgerDays(ledger: DailyXpLedger): number {
  const days = new Set<string>()
  for (const daily of Object.values(ledger)) {
    for (const date of Object.keys(daily)) {
      days.add(date)
    }
  }
  return days.size
}

function normalizeLedger(value: DailyXpLedger | undefined): DailyXpLedger {
  if (!value || typeof value !== 'object') return {}
  const normalized: DailyXpLedger = {}
  for (const [deviceId, daily] of Object.entries(value)) {
    if (!daily || typeof daily !== 'object') continue
    const normalizedDaily: Record<string, number> = {}
    for (const [date, xp] of Object.entries(daily)) {
      if (typeof xp === 'number' && Number.isFinite(xp) && xp > 0) {
        normalizedDaily[date] = Math.round(xp)
      }
    }
    if (Object.keys(normalizedDaily).length > 0) {
      normalized[deviceId] = normalizedDaily
    }
  }
  return normalized
}

function mergeDailyXpLedger(
  current: DailyXpLedger,
  incoming: DailyXpLedger | undefined,
): { value: DailyXpLedger; updatedCount: number } {
  const merged = normalizeLedger(current)
  let updatedCount = 0

  for (const [deviceId, daily] of Object.entries(normalizeLedger(incoming))) {
    merged[deviceId] ??= {}
    for (const [date, xp] of Object.entries(daily)) {
      const currentXp = merged[deviceId][date] ?? 0
      if (xp > currentXp) {
        merged[deviceId][date] = xp
        updatedCount += 1
      }
    }
  }

  return { value: merged, updatedCount }
}

function snapshotTimestamp(snapshot: AfternoonSavedAnswerSnapshot | undefined): number {
  const parsed = Date.parse(snapshot?.savedAt ?? '')
  return Number.isFinite(parsed) ? parsed : 0
}

function mergeSavedAnswerSnapshots(
  current: Record<string, AfternoonSavedAnswerSnapshot>,
  incoming: Record<string, AfternoonSavedAnswerSnapshot> | undefined,
): Record<string, AfternoonSavedAnswerSnapshot> {
  const merged = { ...current }
  for (const [recordId, snapshot] of Object.entries(incoming ?? {})) {
    if (!merged[recordId] || snapshotTimestamp(snapshot) >= snapshotTimestamp(merged[recordId])) {
      merged[recordId] = snapshot
    }
  }
  return merged
}

function refreshLocalDailyXpLedger(): DailyXpLedger {
  const meta = loadSyncMeta()
  const current = normalizeLedger(loadJson<DailyXpLedger>(KEYS.DAILY_XP_LEDGER, {}))
  const localDaily = aggregateDailyXp(loadJson<ActivityEvent[]>(KEYS.ACTIVITY_LOG, []))
  const merged = mergeDailyXpLedger(current, { [meta.deviceId]: localDaily }).value
  saveJson(KEYS.DAILY_XP_LEDGER, merged)
  return merged
}

export function readLocalSyncState(): LocalSyncState {
  const dailyXpLedger = refreshLocalDailyXpLedger()

  return {
    answerRecords: loadJson<AnswerRecord[]>(KEYS.ANSWER_RECORDS, []),
    studySessions: loadJson<StudySession[]>(KEYS.STUDY_SESSIONS, []),
    bookmarks: loadJson<Bookmark[]>(KEYS.BOOKMARKS, []),
    questionMastery: loadJson<Record<string, MasteryState>>(KEYS.QUESTION_MASTERY, {}),
    trackerRecords: loadJson<PracticeRecord[]>(KEYS.TRACKER_RECORDS, []),
    gamification: {
      ...DEFAULT_GAMIFICATION,
      ...loadJson<Partial<GamificationState>>(KEYS.GAMIFICATION, {}),
    },
    dailyXpLedger,
    importantQuestions: loadJson<string[]>(KEYS.IMPORTANT_QUESTIONS, []),       // ★F1-P2
    morningRecords: loadJson<MorningRecord[]>(KEYS.MORNING_RECORDS, []),         // ★F1-P4
    essayAttempts: loadJson<EssayAttempt[]>(KEYS.ESSAY_ATTEMPTS, []),            // ★F1-P5
    essayPlans: loadJson<Record<string, string>>(KEYS.ESSAY_PLANS, {}),          // ★F1-P5
    savedAnswerSnapshots: loadAllSavedAnswerSnapshots(),
  }
}

export function touchNoteUnderstandingSyncMeta(
  categoryId: string,
  sectionIndex: number,
  updatedAt = new Date().toISOString(),
): void {
  const meta = loadJson<Record<string, string>>(KEYS.NOTE_META, {})
  meta[`${categoryId}:${sectionIndex}`] = updatedAt
  saveJson(KEYS.NOTE_META, meta)
}

export function touchAfternoonPlanSyncMeta(
  problemId: string,
  updatedAt = new Date().toISOString(),
): void {
  const meta = loadJson<Record<string, string>>(KEYS.PLAN_META, {})
  meta[problemId] = updatedAt
  saveJson(KEYS.PLAN_META, meta)
}

export function ensureStateMetadata(): void {
  readLocalSyncState()
}

function masteryRank(value: MasteryState | undefined): number {
  switch (value) {
    case 'incorrect': return 1
    case 'correct': return 2
    case 'consecutive': return 3
    default: return 0
  }
}

function mergeQuestionMastery(
  current: Record<string, MasteryState>,
  incoming: Record<string, MasteryState>,
): Record<string, MasteryState> {
  const merged = { ...current }
  for (const [key, value] of Object.entries(incoming)) {
    if (masteryRank(value) > masteryRank(merged[key])) {
      merged[key] = value
    }
  }
  return merged
}

function nextMasteryState(current: MasteryState | undefined, isCorrect: boolean): MasteryState {
  if (!current) return isCorrect ? 'correct' : 'incorrect'
  if (current === 'correct') return isCorrect ? 'consecutive' : 'incorrect'
  if (current === 'consecutive') return isCorrect ? 'consecutive' : 'incorrect'
  return isCorrect ? 'correct' : 'incorrect'
}

function rebuildQuestionMasteryFromAnswers(answerRecords: AnswerRecord[]): Record<string, MasteryState> {
  const rebuilt: Record<string, MasteryState> = {}
  for (const record of sortByIso(answerRecords, (item) => item.answeredAt)) {
    const key = `${record.questionId}:${record.mode}`
    rebuilt[key] = nextMasteryState(rebuilt[key], record.isCorrect)
  }
  return rebuilt
}

function rebuildProgress(answerRecords: AnswerRecord[], bookmarks: Bookmark[]): StoredProgress[] {
  const map = new Map<string, StoredProgress>()
  const bookmarkedQuestionIds = new Set(bookmarks.map((bookmark) => bookmark.questionId))
  const topicByQuestion = new Map(questions.map((question) => [question.id, question.topicId]))

  for (const record of answerRecords) {
    const topicId = topicByQuestion.get(record.questionId)
    if (!topicId) continue
    const existing = map.get(topicId)
    const progress = existing ?? {
      topicId,
      mcAttempts: 0,
      mcCorrect: 0,
      wrAttempts: 0,
      wrCorrect: 0,
      lastStudiedAt: '',
      isBookmarked: bookmarkedQuestionIds.has(record.questionId),
    }
    if (record.mode === 'multiple-choice') {
      progress.mcAttempts += 1
      if (record.isCorrect) progress.mcCorrect += 1
    } else {
      progress.wrAttempts += 1
      if (record.isCorrect) progress.wrCorrect += 1
    }
    if (record.answeredAt > progress.lastStudiedAt) {
      progress.lastStudiedAt = record.answeredAt
    }
    map.set(topicId, progress)
  }

  return Array.from(map.values())
}

function rebuildGamification(
  answerRecords: AnswerRecord[],
  current: GamificationState,
  incoming: GamificationState,
): GamificationState {
  const sorted = sortByIso(answerRecords, (record) => record.answeredAt)
  let currentStreak = 0
  let maxStreak = 0
  const recentResults: boolean[] = []
  const recentWrittenResults: boolean[] = []
  const correctQuestionIds = new Set<string>([
    ...current.correctQuestionIds,
    ...incoming.correctQuestionIds,
  ])
  const writtenCorrectQuestionIds = new Set<string>([
    ...current.writtenCorrectQuestionIds,
    ...incoming.writtenCorrectQuestionIds,
  ])
  const unlockedBadgeIds = mergeUnlockedBadgeIds(
    current.unlockedBadgeIds,
    incoming.unlockedBadgeIds,
  )
  const completeBadgeAddedByMerge =
    unlockedBadgeIds.includes(COMPLETE_BADGE_ID) &&
    !current.unlockedBadgeIds.includes(COMPLETE_BADGE_ID) &&
    !incoming.unlockedBadgeIds.includes(COMPLETE_BADGE_ID)
  const baseXp = Math.max(getTotalXpFromSyncEvents(), current.xp, incoming.xp)

  for (const record of sorted) {
    currentStreak = record.isCorrect ? currentStreak + 1 : 0
    maxStreak = Math.max(maxStreak, currentStreak)
    recentResults.push(record.isCorrect)
    if (record.mode === 'written') recentWrittenResults.push(record.isCorrect)
    if (record.isCorrect) {
      correctQuestionIds.add(record.questionId)
      if (record.mode === 'written') writtenCorrectQuestionIds.add(record.questionId)
    }
  }

  return {
    xp: baseXp + (completeBadgeAddedByMerge ? (COMPLETE_BADGE?.xpBonus ?? 0) : 0),
    totalAnswered: sorted.length,
    totalCorrect: sorted.filter((record) => record.isCorrect).length,
    writtenCorrect: sorted.filter((record) => record.isCorrect && record.mode === 'written').length,
    currentStreak,
    maxStreak: Math.max(maxStreak, current.maxStreak, incoming.maxStreak),
    correctQuestionIds: Array.from(correctQuestionIds),
    writtenCorrectQuestionIds: Array.from(writtenCorrectQuestionIds),
    recentResults: recentResults.slice(-20),
    recentWrittenResults: recentWrittenResults.slice(-20),
    unlockedBadgeIds,
  }
}

export function mergeLocalSyncState(incoming: LocalSyncState): LocalMergeStats {
  const current = readLocalSyncState()

  const answerRecords = sortByIso(
    uniqueBy([...current.answerRecords, ...incoming.answerRecords], answerRecordKey),
    (record) => record.answeredAt,
  )
  const studySessions = sortByIso(
    uniqueBy([...current.studySessions, ...incoming.studySessions], (session) => session.id),
    (session) => session.startedAt,
  )
  const bookmarks = sortByIso(
    uniqueBy([...current.bookmarks, ...incoming.bookmarks], (bookmark) => bookmark.questionId),
    (bookmark) => bookmark.createdAt,
  )
  const trackerRecords = sortByIso(
    uniqueBy([...current.trackerRecords, ...incoming.trackerRecords], (record) => record.id),
    (record) => record.date,
  )
  const questionMastery = mergeQuestionMastery(
    rebuildQuestionMasteryFromAnswers(answerRecords),
    incoming.questionMastery,
  )
  const gamification = rebuildGamification(answerRecords, current.gamification, incoming.gamification)
  const currentBadges = new Set(normalizeBadgeIds(current.gamification.unlockedBadgeIds))
  const dailyXpLedger = mergeDailyXpLedger(current.dailyXpLedger, incoming.dailyXpLedger)

  // ★F1-P2 importantQuestions: 集合和（unique）でマージ
  const importantQuestions = Array.from(
    new Set([...current.importantQuestions, ...incoming.importantQuestions]),
  ).filter((v): v is string => typeof v === 'string')

  // ★午前Ⅱ morningRecords: 内容キーでユニーク化（wire の決定的id と端末UUIDの二重計上を防ぐ）+ answeredAt 昇順
  const morningRecords = sortByIso(
    uniqueBy([...current.morningRecords, ...incoming.morningRecords], morningRecordKey),
    (r) => r.answeredAt,
  )

  // ★F1-P5 essayAttempts: id でユニーク化 + endedAt 昇順
  const essayAttempts = sortByIso(
    uniqueBy([...current.essayAttempts, ...incoming.essayAttempts], (a) => a.id),
    (a) => a.endedAt,
  )

  // ★F1-P5 essayPlans: 単純 spread（incoming 優先、タイムスタンプは持っていないため）
  const essayPlans: Record<string, string> = { ...current.essayPlans, ...incoming.essayPlans }
  const savedAnswerSnapshots = mergeSavedAnswerSnapshots(
    current.savedAnswerSnapshots,
    incoming.savedAnswerSnapshots,
  )

  saveJson(KEYS.ANSWER_RECORDS, answerRecords)
  saveJson(KEYS.STUDY_SESSIONS, studySessions)
  saveJson(KEYS.BOOKMARKS, bookmarks)
  saveJson(KEYS.USER_PROGRESS, rebuildProgress(answerRecords, bookmarks))
  saveJson(KEYS.QUESTION_MASTERY, questionMastery)
  saveJson(KEYS.TRACKER_RECORDS, trackerRecords)
  saveJson(KEYS.DAILY_XP_LEDGER, dailyXpLedger.value)
  saveJson(KEYS.GAMIFICATION, gamification)
  saveJson(KEYS.IMPORTANT_QUESTIONS, importantQuestions)  // ★F1-P2
  saveJson(KEYS.MORNING_RECORDS, morningRecords)           // ★F1-P4
  saveJson(KEYS.ESSAY_ATTEMPTS, essayAttempts)             // ★F1-P5
  saveJson(KEYS.ESSAY_PLANS, essayPlans)                   // ★F1-P5
  saveAllSavedAnswerSnapshots(savedAnswerSnapshots)

  return {
    addedAnswerRecordCount: answerRecords.length - current.answerRecords.length,
    updatedDailyXpDayCount: dailyXpLedger.updatedCount,
    addedAfternoonRecordCount: trackerRecords.length - current.trackerRecords.length,
    addedMorningRecordCount: morningRecords.length - current.morningRecords.length,
    addedBadgeCount: gamification.unlockedBadgeIds.filter((badgeId) => !currentBadges.has(badgeId)).length,
  }
}

export function countPotentialStateChanges(incoming: LocalSyncState): LocalMergeStats {
  const current = readLocalSyncState()
  const currentAnswerKeys = new Set(current.answerRecords.map(answerRecordKey))
  const currentAfternoonIds = new Set(current.trackerRecords.map((record) => record.id))
  const currentMorningKeys = new Set(current.morningRecords.map(morningRecordKey))
  const currentBadges = new Set(normalizeBadgeIds(current.gamification.unlockedBadgeIds))
  const mergedBadgeIds = mergeUnlockedBadgeIds(
    current.gamification.unlockedBadgeIds,
    incoming.gamification.unlockedBadgeIds,
  )
  const dailyXpLedger = mergeDailyXpLedger(current.dailyXpLedger, incoming.dailyXpLedger)

  return {
    addedAnswerRecordCount: incoming.answerRecords.filter((record) => !currentAnswerKeys.has(answerRecordKey(record))).length,
    updatedDailyXpDayCount: dailyXpLedger.updatedCount,
    addedAfternoonRecordCount: incoming.trackerRecords.filter((record) => !currentAfternoonIds.has(record.id)).length,
    addedMorningRecordCount: incoming.morningRecords.filter((record) => !currentMorningKeys.has(morningRecordKey(record))).length,
    addedBadgeCount: mergedBadgeIds.filter((badgeId) => !currentBadges.has(badgeId)).length,
  }
}

export function getDailyXpDayCount(ledger: DailyXpLedger): number {
  return countLedgerDays(normalizeLedger(ledger))
}
