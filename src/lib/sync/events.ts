import { allocateSyncSeq, loadSyncMeta, saveSyncMeta, updateKnownVector } from './device'
import type { SyncEvent, SyncEventType } from './types'

const EVENTS_KEY = 'nwsp:sync:events'

let suppressSyncEvents = false

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

export function runWithoutSyncEvents<T>(fn: () => T): T {
  const prev = suppressSyncEvents
  suppressSyncEvents = true
  try {
    return fn()
  } finally {
    suppressSyncEvents = prev
  }
}

export function loadSyncEvents(): SyncEvent[] {
  const events = loadJson<SyncEvent[]>(EVENTS_KEY, [])
  return Array.isArray(events) ? events.filter(isSyncEvent) : []
}

function saveSyncEvents(events: SyncEvent[]): void {
  saveJson(EVENTS_KEY, dedupeEvents(events))
}

function isSyncEvent(value: unknown): value is SyncEvent {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.deviceId === 'string' &&
    typeof v.seq === 'number' &&
    typeof v.type === 'string' &&
    typeof v.occurredAt === 'string' &&
    typeof v.xpDelta === 'number'
  )
}

function dedupeEvents(events: SyncEvent[]): SyncEvent[] {
  const map = new Map<string, SyncEvent>()
  for (const event of events) {
    map.set(event.id, event)
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.deviceId === b.deviceId) return a.seq - b.seq
    return a.occurredAt.localeCompare(b.occurredAt)
  })
}

export function appendSyncEvent<TPayload>(
  type: SyncEventType,
  payload: TPayload,
  xpDelta = 0,
  occurredAt = new Date().toISOString(),
): SyncEvent<TPayload> | null {
  if (suppressSyncEvents) return null

  const { deviceId, seq, id } = allocateSyncSeq()
  const event: SyncEvent<TPayload> = {
    id,
    deviceId,
    seq,
    type,
    occurredAt,
    xpDelta,
    payload,
  }
  saveSyncEvents([...loadSyncEvents(), event])
  return event
}

export function mergeSyncEvents(incoming: SyncEvent[]): { added: SyncEvent[]; skipped: number } {
  const current = loadSyncEvents()
  const ids = new Set(current.map((event) => event.id))
  const added = incoming.filter((event) => !ids.has(event.id))
  if (added.length > 0) {
    saveSyncEvents([...current, ...added])
  }

  const vector: Record<string, number> = {}
  for (const event of incoming) {
    vector[event.deviceId] = Math.max(vector[event.deviceId] ?? 0, event.seq)
  }
  updateKnownVector(vector)

  return { added, skipped: incoming.length - added.length }
}

export function getSyncVector(events = loadSyncEvents()): Record<string, number> {
  const meta = loadSyncMeta()
  const vector = { ...meta.knownVector }
  for (const event of events) {
    vector[event.deviceId] = Math.max(vector[event.deviceId] ?? 0, event.seq)
  }
  return vector
}

export function getTotalXpFromSyncEvents(events = loadSyncEvents()): number {
  return events.reduce((sum, event) => sum + event.xpDelta, 0)
}

export function syncEventExists(type: SyncEventType): boolean {
  return loadSyncEvents().some((event) => event.type === type)
}

export function setLocalKnownToLatest(): void {
  const meta = loadSyncMeta()
  const vector = getSyncVector()
  saveSyncMeta({ ...meta, knownVector: vector })
}
