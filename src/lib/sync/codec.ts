import LZString from 'lz-string'
import { BADGES } from '../../data/badges'
import { afternoonProblems } from '../../data/afternoonProblems'
import { questions } from '../../data/questions'
import {
  SYNC_APP_ID,
  SYNC_PREFIX,
  SYNC_SCHEMA_VERSION,
  type DailyXpLedger,
  type LocalSyncState,
  type SyncEvent,
  type SyncPackage,
} from './types'
import type { AnswerRecord, Bookmark } from '../../types'
import type { GamificationState } from '../gamification'
import type { PracticeRecord } from '../tracker'
import type { MasteryState } from '../storage'

type SyncPackageWithoutChecksum = Omit<SyncPackage, 'checksum'>
type Ref = number | string
type CompactAnswerRecord = [Ref, 0 | 1, 0 | 1, number, string?]
type CompactBookmark = [Ref, number]
type CompactQuestionMastery = [Ref, 1 | 2 | 3] | [Ref, 0 | 1, 1 | 2 | 3]
type CompactTrackerRecord = [string, Ref, number, number, string?]
type CompactDailyXpLedger = [string, [number, number][]][]
type CompactEvent = [string, string, number, string, number, number, unknown?]
type CompactGamification = [
  number,
  number,
  number,
  number,
  number,
  number,
  Ref[],
  Ref[],
  string,
  Ref[],
]

interface CompactState {
  a: CompactAnswerRecord[]
  b: CompactBookmark[]
  q: CompactQuestionMastery[]
  p: CompactTrackerRecord[]
  g: CompactGamification
  x: CompactDailyXpLedger
}

interface CompactWirePackage {
  v: typeof SYNC_SCHEMA_VERSION
  a: typeof SYNC_APP_ID
  c: string
  d: string
  f: Record<string, number>
  b?: Record<string, number>
  t?: Record<string, number>
  e: CompactEvent[]
  s: CompactState
  m: SyncPackage['summary']
  h: string
}

type CompactWirePackageWithoutChecksum = Omit<CompactWirePackage, 'h'>

const DAY_MS = 86_400_000
const MINUTE_MS = 60_000
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString
const questionIdByIndex = questions.map((question) => question.id)
const questionIndexById = new Map(questionIdByIndex.map((id, index) => [id, index]))
const problemIdByIndex = afternoonProblems.map((problem) => problem.id)
const problemIndexById = new Map(problemIdByIndex.map((id, index) => [id, index]))
const badgeIdByIndex = BADGES.map((badge) => badge.id)
const badgeIndexById = new Map(badgeIdByIndex.map((id, index) => [id, index]))

function stripCompactChecksum(pkg: CompactWirePackage): CompactWirePackageWithoutChecksum {
  const rest = { ...pkg }
  delete (rest as Partial<CompactWirePackage>).h
  return rest
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return toHex(hash)
}

function encodeQuestionRef(questionId: string): Ref {
  return questionIndexById.get(questionId) ?? questionId
}

function decodeQuestionRef(ref: Ref): string {
  return typeof ref === 'number' ? questionIdByIndex[ref] ?? String(ref) : ref
}

function decodeQuestionMasteryKey(record: CompactQuestionMastery): { key: string; rank: 1 | 2 | 3 } {
  if (record.length === 3) {
    const mode = record[1] === 1 ? 'written' : 'multiple-choice'
    return {
      key: `${decodeQuestionRef(record[0])}:${mode}`,
      rank: record[2],
    }
  }
  return {
    key: decodeQuestionRef(record[0]),
    rank: record[1],
  }
}

function encodeProblemRef(problemId: string): Ref {
  return problemIndexById.get(problemId) ?? problemId
}

function decodeProblemRef(ref: Ref): string {
  return typeof ref === 'number' ? problemIdByIndex[ref] ?? String(ref) : ref
}

function encodeBadgeRef(badgeId: string): Ref {
  return badgeIndexById.get(badgeId) ?? badgeId
}

function decodeBadgeRef(ref: Ref): string {
  return typeof ref === 'number' ? badgeIdByIndex[ref] ?? String(ref) : ref
}

function encodeTimestamp(value: string): number {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? Math.floor(parsed / MINUTE_MS) : 0
}

function decodeTimestamp(value: number): string {
  const timestamp = value > 10_000_000_000 ? value : value * MINUTE_MS
  return new Date(timestamp || 0).toISOString()
}

function encodeDate(value: string): number {
  const parsed = Date.parse(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsed) ? Math.floor(parsed / DAY_MS) : 0
}

function decodeDate(value: number): string {
  return new Date(value * DAY_MS).toISOString().slice(0, 10)
}

function rankToMastery(rank: number): MasteryState | undefined {
  if (rank === 1) return 'incorrect'
  if (rank === 2) return 'correct'
  if (rank === 3) return 'consecutive'
  return undefined
}

function encodeAnswerRecord(record: AnswerRecord): CompactAnswerRecord {
  const base: CompactAnswerRecord = [
    encodeQuestionRef(record.questionId),
    record.mode === 'written' ? 1 : 0,
    record.isCorrect ? 1 : 0,
    encodeTimestamp(record.answeredAt),
  ]
  if (record.userAnswer) base.push(record.userAnswer)
  return base
}

function decodeAnswerRecord(record: CompactAnswerRecord): AnswerRecord {
  const questionId = decodeQuestionRef(record[0])
  const mode = record[1] === 1 ? 'written' : 'multiple-choice'
  const isCorrect = record[2] === 1
  const answeredAt = decodeTimestamp(record[3])
  const userAnswer = record[4] ?? ''
  return {
    id: `a:${questionId}:${mode}:${isCorrect ? 1 : 0}:${record[3]}:${userAnswer}`,
    questionId,
    mode,
    isCorrect,
    userAnswer,
    answeredAt,
  }
}

function encodeBookmark(bookmark: Bookmark): CompactBookmark {
  return [encodeQuestionRef(bookmark.questionId), encodeTimestamp(bookmark.createdAt)]
}

function decodeBookmark(bookmark: CompactBookmark): Bookmark {
  return {
    questionId: decodeQuestionRef(bookmark[0]),
    createdAt: decodeTimestamp(bookmark[1]),
  }
}

function encodeTrackerRecord(record: PracticeRecord): CompactTrackerRecord {
  const base: CompactTrackerRecord = [
    record.id,
    encodeProblemRef(record.problemId),
    encodeDate(record.date),
    record.score,
  ]
  if (record.memo) base.push(record.memo)
  return base
}

function decodeTrackerRecord(record: CompactTrackerRecord): PracticeRecord {
  return {
    id: record[0],
    problemId: decodeProblemRef(record[1]),
    date: decodeDate(record[2]),
    score: record[3],
    memo: record[4],
  }
}

function encodeDailyXpLedger(ledger: DailyXpLedger): CompactDailyXpLedger {
  return Object.entries(ledger).map(([deviceId, daily]) => [
    deviceId,
    Object.entries(daily).map(([date, xp]) => [encodeDate(date), xp]),
  ])
}

function decodeDailyXpLedger(ledger: CompactDailyXpLedger): DailyXpLedger {
  const decoded: DailyXpLedger = {}
  for (const [deviceId, daily] of ledger) {
    decoded[deviceId] = {}
    for (const [date, xp] of daily) {
      decoded[deviceId][decodeDate(date)] = xp
    }
  }
  return decoded
}

function encodeGamification(state: GamificationState): CompactGamification {
  return [
    state.xp,
    state.totalAnswered,
    state.totalCorrect,
    state.writtenCorrect,
    state.currentStreak,
    state.maxStreak,
    [],
    [],
    state.recentResults.map((result) => (result ? '1' : '0')).join(''),
    state.unlockedBadgeIds.map(encodeBadgeRef),
  ]
}

function decodeGamification(state: CompactGamification): GamificationState {
  return {
    xp: state[0],
    totalAnswered: state[1],
    totalCorrect: state[2],
    writtenCorrect: state[3],
    currentStreak: state[4],
    maxStreak: state[5],
    correctQuestionIds: state[6].map(decodeQuestionRef),
    writtenCorrectQuestionIds: state[7].map(decodeQuestionRef),
    recentResults: state[8].split('').map((value) => value === '1'),
    recentWrittenResults: [],
    unlockedBadgeIds: state[9].map(decodeBadgeRef),
  }
}

function encodeEventType(type: SyncEvent['type']): string {
  if (type === 'legacy-baseline') return 'b'
  if (type === 'xp-delta') return 'x'
  return type
}

function decodeEventType(type: string): SyncEvent['type'] {
  if (type === 'b') return 'legacy-baseline'
  if (type === 'x') return 'xp-delta'
  return type as SyncEvent['type']
}

function encodeEvent(event: SyncEvent): CompactEvent {
  const compact: CompactEvent = [
    event.id,
    event.deviceId,
    event.seq,
    encodeEventType(event.type),
    encodeTimestamp(event.occurredAt),
    event.xpDelta,
  ]
  if (event.payload !== undefined) compact.push(event.payload)
  return compact
}

function decodeEvent(event: CompactEvent): SyncEvent {
  return {
    id: event[0],
    deviceId: event[1],
    seq: event[2],
    type: decodeEventType(event[3]),
    occurredAt: decodeTimestamp(event[4]),
    xpDelta: event[5],
    payload: event[6],
  }
}

function encodeState(state: LocalSyncState): CompactState {
  return {
    a: state.answerRecords.map(encodeAnswerRecord),
    b: state.bookmarks.map(encodeBookmark),
    q: [],
    p: state.trackerRecords.map(encodeTrackerRecord),
    g: encodeGamification(state.gamification),
    x: encodeDailyXpLedger(state.dailyXpLedger),
  }
}

function decodeState(state: CompactState): LocalSyncState {
  const questionMastery: Record<string, MasteryState> = {}
  for (const record of state.q) {
    const { key, rank } = decodeQuestionMasteryKey(record)
    const value = rankToMastery(rank)
    if (value) questionMastery[key] = value
  }

  return {
    answerRecords: state.a.map(decodeAnswerRecord),
    studySessions: [],
    bookmarks: state.b.map(decodeBookmark),
    questionMastery,
    trackerRecords: state.p.map(decodeTrackerRecord),
    gamification: decodeGamification(state.g),
    dailyXpLedger: decodeDailyXpLedger(state.x),
    // ★F1-P2/P4/P5: CompactState には importantQuestions / morningRecords / essayAttempts / essayPlans
    //   未含み。F2-P4 で wire format 拡張時に対応
    importantQuestions: [],
    morningRecords: [],
    essayAttempts: [],
    essayPlans: {},
  }
}

function compactPackage(pkg: SyncPackageWithoutChecksum): CompactWirePackageWithoutChecksum {
  return {
    v: SYNC_SCHEMA_VERSION,
    a: SYNC_APP_ID,
    c: pkg.createdAt,
    d: pkg.fromDeviceId,
    f: pkg.fromVector,
    b: pkg.baseVector,
    t: pkg.targetVector,
    e: pkg.events.map(encodeEvent),
    s: encodeState(pkg.state),
    m: pkg.summary,
  }
}

function expandPackage(pkg: CompactWirePackage): SyncPackage {
  return {
    schemaVersion: SYNC_SCHEMA_VERSION,
    app: SYNC_APP_ID,
    createdAt: pkg.c,
    fromDeviceId: pkg.d,
    fromVector: pkg.f,
    baseVector: pkg.b,
    targetVector: pkg.t,
    events: pkg.e.map(decodeEvent),
    state: decodeState(pkg.s),
    summary: pkg.m,
    checksum: pkg.h,
  }
}

export async function encodeSyncPackage(pkgWithoutChecksum: SyncPackageWithoutChecksum): Promise<string> {
  const compactWithoutChecksum = compactPackage(pkgWithoutChecksum)
  const checksum = await sha256(JSON.stringify(compactWithoutChecksum))
  const pkg: CompactWirePackage = { ...compactWithoutChecksum, h: checksum }
  const compressed = compressToEncodedURIComponent(JSON.stringify(pkg))
  return `${SYNC_PREFIX}${compressed}`
}

async function decodeCompactSyncString(payload: string): Promise<SyncPackage> {
  const json = decompressFromEncodedURIComponent(payload)
  if (!json) {
    throw new Error('invalid-payload')
  }

  const parsed = JSON.parse(json) as CompactWirePackage
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalid-json')
  }

  const expected = await sha256(JSON.stringify(stripCompactChecksum(parsed)))
  if (parsed.h !== expected) {
    throw new Error('checksum-mismatch')
  }

  return expandPackage(parsed)
}

export async function decodeSyncString(input: string): Promise<SyncPackage> {
  const trimmed = input.trim()
  if (trimmed.startsWith(SYNC_PREFIX)) {
    return decodeCompactSyncString(trimmed.slice(SYNC_PREFIX.length))
  }
  throw new Error('invalid-prefix')
}
