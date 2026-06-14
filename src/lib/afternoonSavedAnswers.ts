export type AfternoonAnswerMap = Record<string, string>
export type AfternoonMarking = 'correct' | 'partial' | 'wrong'
export type AfternoonScoringMap = Record<string, AfternoonMarking>

export interface AfternoonSavedAnswerSnapshot {
  version: 1
  answers: AfternoonAnswerMap
  scorings: AfternoonScoringMap
  score?: number
  savedAt?: string
}

const SAVED_ANSWERS_PREFIX = 'pmap:savedAnswers:'

export function savedAnswersKey(recordId: string): string {
  return `${SAVED_ANSWERS_PREFIX}${recordId}`
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeAnswers(value: unknown): AfternoonAnswerMap {
  if (!isPlainRecord(value)) return {}
  const normalized: AfternoonAnswerMap = {}
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === 'string') normalized[key] = answer
  }
  return normalized
}

function isMarking(value: unknown): value is AfternoonMarking {
  return value === 'correct' || value === 'partial' || value === 'wrong'
}

function normalizeScorings(value: unknown): AfternoonScoringMap {
  if (!isPlainRecord(value)) return {}
  const normalized: AfternoonScoringMap = {}
  for (const [key, marking] of Object.entries(value)) {
    if (isMarking(marking)) normalized[key] = marking
  }
  return normalized
}

export function normalizeSavedAnswerSnapshot(value: unknown): AfternoonSavedAnswerSnapshot | null {
  if (!isPlainRecord(value)) return null

  if ('answers' in value || 'scorings' in value) {
    return {
      version: 1,
      answers: normalizeAnswers(value.answers),
      scorings: normalizeScorings(value.scorings),
      score: typeof value.score === 'number' ? value.score : undefined,
      savedAt: typeof value.savedAt === 'string' ? value.savedAt : undefined,
    }
  }

  return {
    version: 1,
    answers: normalizeAnswers(value),
    scorings: {},
  }
}

export function loadSavedAnswerSnapshot(recordId: string): AfternoonSavedAnswerSnapshot | null {
  try {
    const raw = localStorage.getItem(savedAnswersKey(recordId))
    return raw ? normalizeSavedAnswerSnapshot(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function loadSavedAnswers(recordId: string): AfternoonAnswerMap {
  return loadSavedAnswerSnapshot(recordId)?.answers ?? {}
}

export function loadSavedScorings(recordId: string): AfternoonScoringMap {
  return loadSavedAnswerSnapshot(recordId)?.scorings ?? {}
}

export function saveSavedAnswerSnapshot(
  recordId: string,
  snapshot: Omit<AfternoonSavedAnswerSnapshot, 'version'>,
): void {
  try {
    localStorage.setItem(savedAnswersKey(recordId), JSON.stringify({
      version: 1,
      ...snapshot,
    }))
  } catch {
    // localStorage access can fail in private modes or on quota overflow.
    // The tracker record itself is stored separately and still proceeds,
    // so swallow here to avoid breaking the save / sync flow.
  }
}

export function savedAnswerSnapshotExists(recordId: string): boolean {
  try {
    return localStorage.getItem(savedAnswersKey(recordId)) !== null
  } catch {
    return false
  }
}

export function deleteSavedAnswerSnapshot(recordId: string): void {
  try {
    localStorage.removeItem(savedAnswersKey(recordId))
  } catch {
    // localStorage access can fail in private modes; record deletion should still proceed.
  }
}

export function loadAllSavedAnswerSnapshots(): Record<string, AfternoonSavedAnswerSnapshot> {
  const snapshots: Record<string, AfternoonSavedAnswerSnapshot> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(SAVED_ANSWERS_PREFIX)) continue
      const recordId = key.slice(SAVED_ANSWERS_PREFIX.length)
      const snapshot = loadSavedAnswerSnapshot(recordId)
      if (snapshot) snapshots[recordId] = snapshot
    }
  } catch {
    return snapshots
  }
  return snapshots
}

export function saveAllSavedAnswerSnapshots(
  snapshots: Record<string, AfternoonSavedAnswerSnapshot>,
): void {
  for (const [recordId, snapshot] of Object.entries(snapshots)) {
    saveSavedAnswerSnapshot(recordId, snapshot)
  }
}
