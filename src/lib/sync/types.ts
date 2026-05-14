import type { GamificationState } from '../gamification'
import type { PracticeRecord } from '../tracker'
import type { AnswerRecord, Bookmark, StudySession } from '../../types'
import type { MasteryState } from '../storage'

export const SYNC_PREFIX = 'PMAP-SYNC-v1:'
export const SYNC_SCHEMA_VERSION = 2 as const
export const SYNC_APP_ID = 'pmap-learning-app' as const

export type SyncEventType =
  | 'legacy-baseline'
  | 'xp-delta'

export interface SyncMeta {
  deviceId: string
  nextSeq: number
  knownVector: Record<string, number>
  baselineCreatedAt?: string
  lastCreatedAt?: string
  lastImportedAt?: string
}

export interface SyncCheckpoint {
  createdAt: string
  vector: Record<string, number>
  state: LocalSyncState
}

export interface SyncEvent<TPayload = unknown> {
  id: string
  deviceId: string
  seq: number
  type: SyncEventType
  occurredAt: string
  xpDelta: number
  payload: TPayload
}

export interface TimestampedValue<T> {
  value: T
  updatedAt: string
}

export type DailyXpLedger = Record<string, Record<string, number>>

export interface LocalSyncState {
  answerRecords: AnswerRecord[]
  studySessions: StudySession[]
  bookmarks: Bookmark[]
  questionMastery: Record<string, MasteryState>
  trackerRecords: PracticeRecord[]
  gamification: GamificationState
  dailyXpLedger: DailyXpLedger
}

export interface SyncPackageSummary {
  eventCount: number
  xpTotalInPayload: number
  answerRecordCount: number
  dailyXpDayCount: number
  afternoonRecordCount: number
  badgeCount: number
}

export interface SyncPackage {
  schemaVersion: typeof SYNC_SCHEMA_VERSION
  app: typeof SYNC_APP_ID
  createdAt: string
  fromDeviceId: string
  fromVector: Record<string, number>
  baseVector?: Record<string, number>
  targetVector?: Record<string, number>
  summary: SyncPackageSummary
  events: SyncEvent[]
  state: LocalSyncState
  checksum: string
}

export interface ImportPreview {
  fromDeviceId: string
  createdAt: string
  newEventCount: number
  skippedEventCount: number
  addedAnswerRecordCount: number
  updatedDailyXpDayCount: number
  addedAfternoonRecordCount: number
  addedXp: number
  addedBadgeCount: number
}

export interface ImportResult extends ImportPreview {
  imported: true
}
