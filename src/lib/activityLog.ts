import type { BadgeTier } from '../data/badges'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface QuizSessionPayload {
  sessionId: string
  mode: 'topic' | 'weakness' | 'random' | 'important'
  categoryId: string | null
  categoryName: string | null
  questionCount: number
  correctCount: number
  answerMode: 'multiple-choice' | 'written'
}

export interface NoteCheckPayload {
  noteId: string
  noteName: string
  level: 'green' | 'yellow' | 'red'
  sectionLabel: string
}

export interface BadgePayload {
  badgeId: string
  badgeName: string
  tier: BadgeTier
}

export interface AfternoonPayload {
  problemId: string
  year: string        // e.g. 'R6', 'H25'
  section: 'G1' | 'G2'
  number: number
  title: string
  score: number
  recordId: string
}

export type ActivityEvent =
  | { id: string; type: 'quiz-session';      date: string; createdAt: string; xp: number; payload: QuizSessionPayload }
  | { id: string; type: 'note-check';        date: string; createdAt: string; xp: number; payload: NoteCheckPayload }
  | { id: string; type: 'badge-unlock';      date: string; createdAt: string; xp: number; payload: BadgePayload }
  | { id: string; type: 'afternoon-record';  date: string; createdAt: string; xp: number; payload: AfternoonPayload }

export interface DaySummary {
  date: string
  totalXp: number
  events: ActivityEvent[]
  syncedOnlyXp?: number
}

// ----------------------------------------------------------------
// Storage
// ----------------------------------------------------------------

const KEY = 'pmap:activityLog'
const DAILY_XP_LEDGER_KEY = 'pmap:sync:daily_xp_ledger'
const SYNC_META_KEY = 'pmap:sync:meta'
const MAX_EVENTS = 500

type DailyXpLedger = Record<string, Record<string, number>>

interface StoredSyncMeta {
  deviceId?: unknown
}

export function loadActivityLog(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ActivityEvent[]) : []
  } catch {
    return []
  }
}

export function addActivityEvent(event: Omit<ActivityEvent, 'id'>): void {
  const events = loadActivityLog()
  const newEvent = { ...event, id: crypto.randomUUID() } as ActivityEvent
  events.push(newEvent)
  const pruned = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events
  localStorage.setItem(KEY, JSON.stringify(pruned))
}

/** quiz-session イベントを sessionId で upsert する（1問ごとに呼び出す） */
export function upsertQuizSessionEvent(
  sessionId: string,
  data: Omit<QuizSessionPayload, 'sessionId'> & { xp: number },
): void {
  const events = loadActivityLog()
  const idx = events.findIndex(
    e => e.type === 'quiz-session' && (e as ActivityEvent & { type: 'quiz-session' }).payload.sessionId === sessionId,
  )
  const payload: QuizSessionPayload = { sessionId, ...data }
  if (idx >= 0) {
    const existing = events[idx] as ActivityEvent & { type: 'quiz-session' }
    events[idx] = { ...existing, xp: data.xp, payload }
  } else {
    const now = new Date()
    events.push({
      id: crypto.randomUUID(),
      type: 'quiz-session',
      date: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      xp: data.xp,
      payload,
    } as ActivityEvent)
  }
  const pruned = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events
  localStorage.setItem(KEY, JSON.stringify(pruned))
}

// ----------------------------------------------------------------
// Aggregation
// ----------------------------------------------------------------

function loadDailyXpLedger(): DailyXpLedger {
  try {
    const raw = localStorage.getItem(DAILY_XP_LEDGER_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const ledger: DailyXpLedger = {}
    for (const [deviceId, daily] of Object.entries(parsed as Record<string, unknown>)) {
      if (!daily || typeof daily !== 'object') continue
      for (const [date, xp] of Object.entries(daily as Record<string, unknown>)) {
        if (typeof xp !== 'number' || !Number.isFinite(xp) || xp <= 0) continue
        ledger[deviceId] ??= {}
        ledger[deviceId][date] = Math.round(xp)
      }
    }
    return ledger
  } catch {
    return {}
  }
}

function loadLocalDeviceId(): string | null {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSyncMeta
    return typeof parsed.deviceId === 'string' ? parsed.deviceId : null
  } catch {
    return null
  }
}

function getLedgerXpForDate(
  ledger: DailyXpLedger,
  date: string,
  localDeviceId: string | null,
  localEventXp: number,
): { totalXp: number; syncedOnlyXp: number } {
  let ledgerTotal = 0
  let localLedgerXp = 0
  let otherDeviceXp = 0

  for (const [deviceId, daily] of Object.entries(ledger)) {
    const xp = daily[date] ?? 0
    if (xp <= 0) continue
    ledgerTotal += xp
    if (localDeviceId && deviceId === localDeviceId) {
      localLedgerXp += xp
    } else {
      otherDeviceXp += xp
    }
  }

  if (!localDeviceId) {
    const totalXp = Math.max(localEventXp, ledgerTotal)
    return {
      totalXp,
      syncedOnlyXp: Math.max(0, totalXp - localEventXp),
    }
  }

  const totalXp = otherDeviceXp + Math.max(localLedgerXp, localEventXp)
  return {
    totalXp,
    syncedOnlyXp: Math.max(0, otherDeviceXp + Math.max(0, localLedgerXp - localEventXp)),
  }
}

export function getDaySummaries(events: ActivityEvent[]): DaySummary[] {
  const map = new Map<string, ActivityEvent[]>()
  for (const e of events) {
    const arr = map.get(e.date) ?? []
    arr.push(e)
    map.set(e.date, arr)
  }
  const ledger = loadDailyXpLedger()
  const localDeviceId = loadLocalDeviceId()
  const dates = new Set(map.keys())
  for (const daily of Object.values(ledger)) {
    for (const date of Object.keys(daily)) {
      dates.add(date)
    }
  }

  return Array.from(dates)
    .map((date) => {
      const evts = map.get(date) ?? []
      const localEventXp = evts.reduce((s, e) => s + e.xp, 0)
      const ledgerXp = getLedgerXpForDate(ledger, date, localDeviceId, localEventXp)
      return {
        date,
        totalXp: ledgerXp.totalXp,
        syncedOnlyXp: ledgerXp.syncedOnlyXp,
        events: evts.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getRecentDaySummaries(n: number): DaySummary[] {
  return getDaySummaries(loadActivityLog()).slice(0, n)
}

export function getAllDaySummaries(): DaySummary[] {
  return getDaySummaries(loadActivityLog())
}
