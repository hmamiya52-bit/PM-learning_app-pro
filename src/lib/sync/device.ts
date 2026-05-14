import type { SyncCheckpoint, SyncMeta } from './types'

const META_KEY = 'pmap:sync:meta'
const CHECKPOINT_KEY = 'pmap:sync:checkpoint'

const DEFAULT_VECTOR: Record<string, number> = {}

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

function createDeviceId(): string {
  const ua = navigator.userAgent.toLowerCase()
  const prefix = /android|iphone|ipad|mobile/.test(ua) ? 'phone' : 'pc'
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function loadSyncMeta(): SyncMeta {
  const stored = loadJson<Partial<SyncMeta>>(META_KEY, {})
  if (stored.deviceId && typeof stored.nextSeq === 'number') {
    return {
      deviceId: stored.deviceId,
      nextSeq: stored.nextSeq,
      knownVector: stored.knownVector ?? DEFAULT_VECTOR,
      baselineCreatedAt: stored.baselineCreatedAt,
      lastCreatedAt: stored.lastCreatedAt,
      lastImportedAt: stored.lastImportedAt,
    }
  }

  const deviceId = createDeviceId()
  const meta: SyncMeta = {
    deviceId,
    nextSeq: 1,
    knownVector: { [deviceId]: 0 },
  }
  saveSyncMeta(meta)
  return meta
}

export function saveSyncMeta(meta: SyncMeta): void {
  saveJson(META_KEY, meta)
}

export function allocateSyncSeq(): { deviceId: string; seq: number; id: string } {
  const meta = loadSyncMeta()
  const seq = meta.nextSeq
  const next: SyncMeta = {
    ...meta,
    nextSeq: seq + 1,
    knownVector: {
      ...meta.knownVector,
      [meta.deviceId]: Math.max(meta.knownVector[meta.deviceId] ?? 0, seq),
    },
  }
  saveSyncMeta(next)
  return { deviceId: meta.deviceId, seq, id: `${meta.deviceId}:${seq}` }
}

export function updateKnownVector(vector: Record<string, number>): void {
  const meta = loadSyncMeta()
  const knownVector = { ...meta.knownVector }
  for (const [deviceId, seq] of Object.entries(vector)) {
    knownVector[deviceId] = Math.max(knownVector[deviceId] ?? 0, seq)
  }
  saveSyncMeta({ ...meta, knownVector })
}

export function markBaselineCreated(createdAt: string): void {
  const meta = loadSyncMeta()
  saveSyncMeta({ ...meta, baselineCreatedAt: createdAt })
}

export function markPackageCreated(createdAt: string): void {
  const meta = loadSyncMeta()
  saveSyncMeta({ ...meta, lastCreatedAt: createdAt })
}

export function markPackageImported(importedAt: string): void {
  const meta = loadSyncMeta()
  saveSyncMeta({ ...meta, lastImportedAt: importedAt })
}

export function loadSyncCheckpoint(): SyncCheckpoint | null {
  const stored = loadJson<Partial<SyncCheckpoint> | null>(CHECKPOINT_KEY, null)
  if (
    stored &&
    typeof stored.createdAt === 'string' &&
    stored.vector &&
    typeof stored.vector === 'object' &&
    stored.state &&
    typeof stored.state === 'object'
  ) {
    return stored as SyncCheckpoint
  }
  return null
}

export function saveSyncCheckpoint(checkpoint: SyncCheckpoint): void {
  saveJson(CHECKPOINT_KEY, checkpoint)
}
