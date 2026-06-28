import { countPotentialStateChanges, mergeLocalSyncState, readLocalSyncState } from './adapters'
import { markPackageImported, saveSyncCheckpoint, updateKnownVector } from './device'
import { getSyncVector, mergeSyncEvents, loadSyncEvents } from './events'
import { ensureLocalSyncCheckpoint } from './package'
import {
  SYNC_APP_ID,
  SYNC_SCHEMA_VERSION,
  type ImportPreview,
  type ImportResult,
  type SyncPackage,
} from './types'

export function validateSyncPackage(pkg: SyncPackage): void {
  if (pkg.schemaVersion !== SYNC_SCHEMA_VERSION || pkg.app !== SYNC_APP_ID) {
    throw new Error('unsupported-version')
  }
  if (!pkg.fromDeviceId || !pkg.createdAt || !Array.isArray(pkg.events) || !pkg.state) {
    throw new Error('invalid-package')
  }
}

export function buildImportPreview(pkg: SyncPackage): ImportPreview {
  validateSyncPackage(pkg)
  const localEventIds = new Set(loadSyncEvents().map((event) => event.id))
  const newEvents = pkg.events.filter((event) => !localEventIds.has(event.id))
  const stateChanges = countPotentialStateChanges(pkg.state)

  return {
    fromDeviceId: pkg.fromDeviceId,
    createdAt: pkg.createdAt,
    newEventCount: newEvents.length,
    skippedEventCount: pkg.events.length - newEvents.length,
    addedAnswerRecordCount: stateChanges.addedAnswerRecordCount,
    updatedDailyXpDayCount: stateChanges.updatedDailyXpDayCount,
    addedAfternoonRecordCount: stateChanges.addedAfternoonRecordCount,
    addedMorningRecordCount: stateChanges.addedMorningRecordCount,
    addedXp: newEvents.reduce((sum, event) => sum + event.xpDelta, 0),
    addedBadgeCount: stateChanges.addedBadgeCount,
  }
}

export function applySyncPackage(pkg: SyncPackage): ImportResult {
  validateSyncPackage(pkg)
  ensureLocalSyncCheckpoint()
  const previewBefore = buildImportPreview(pkg)
  const eventResult = mergeSyncEvents(pkg.events)
  const stateResult = mergeLocalSyncState(pkg.state)
  updateKnownVector(pkg.fromVector)
  const importedAt = new Date().toISOString()
  markPackageImported(importedAt)
  if (pkg.targetVector) {
    saveSyncCheckpoint({
      createdAt: importedAt,
      vector: getSyncVector(),
      state: readLocalSyncState(),
    })
  }

  return {
    ...previewBefore,
    imported: true,
    newEventCount: eventResult.added.length,
    skippedEventCount: eventResult.skipped,
    addedAnswerRecordCount: stateResult.addedAnswerRecordCount,
    updatedDailyXpDayCount: stateResult.updatedDailyXpDayCount,
    addedAfternoonRecordCount: stateResult.addedAfternoonRecordCount,
    addedMorningRecordCount: stateResult.addedMorningRecordCount,
    addedBadgeCount: stateResult.addedBadgeCount,
    addedXp: eventResult.added.reduce((sum, event) => sum + event.xpDelta, 0),
  }
}
