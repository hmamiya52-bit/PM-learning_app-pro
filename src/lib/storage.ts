import type { AnswerRecord, AnswerMode, UserProgress, StudySession, Bookmark } from '../types'
import { touchNoteUnderstandingSyncMeta } from './sync/adapters'

export type MasteryState = 'consecutive' | 'correct' | 'incorrect'
type MasteryMap = Record<string, MasteryState>

// KEY を v2 にすることで旧スキーマのデータを自動的に無効化（リセット）
const KEYS = {
  ANSWER_RECORDS: 'pmap:answer_records',
  USER_PROGRESS: 'pmap:user_progress_v2',
  USER_PROGRESS_LEGACY: 'pmap:user_progress',
  STUDY_SESSIONS: 'pmap:study_sessions',
  BOOKMARKS: 'pmap:bookmarks',
} as const

// 永続化用のスキーマ（派生フィールドを除く）
interface StoredProgress {
  topicId: string
  mcAttempts: number
  mcCorrect: number
  wrAttempts: number
  wrCorrect: number
  lastStudiedAt: string
  isBookmarked: boolean
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// 旧スキーマが localStorage に残っていれば一度だけ削除（リセット）
function clearLegacyProgress(): void {
  try {
    if (localStorage.getItem(KEYS.USER_PROGRESS_LEGACY) !== null) {
      localStorage.removeItem(KEYS.USER_PROGRESS_LEGACY)
    }
  } catch {
    /* noop */
  }
}
clearLegacyProgress()

// --- AnswerRecord ---
export function getAnswerRecords(): AnswerRecord[] {
  return load(KEYS.ANSWER_RECORDS, [])
}
export function addAnswerRecord(record: AnswerRecord): void {
  const records = getAnswerRecords()
  save(KEYS.ANSWER_RECORDS, [...records, record])
}

// --- UserProgress ---
function withDerived(p: StoredProgress): UserProgress {
  const totalAttempts = p.mcAttempts + p.wrAttempts
  const correctCount = p.mcCorrect + p.wrCorrect
  return { ...p, totalAttempts, correctCount }
}

function emptyStored(topicId: string): StoredProgress {
  return {
    topicId,
    mcAttempts: 0,
    mcCorrect: 0,
    wrAttempts: 0,
    wrCorrect: 0,
    lastStudiedAt: '',
    isBookmarked: false,
  }
}

export function getAllProgress(): UserProgress[] {
  return load<StoredProgress[]>(KEYS.USER_PROGRESS, []).map(withDerived)
}

function getStored(topicId: string): StoredProgress {
  const all = load<StoredProgress[]>(KEYS.USER_PROGRESS, [])
  return all.find((p) => p.topicId === topicId) ?? emptyStored(topicId)
}

export function getProgress(topicId: string): UserProgress {
  return withDerived(getStored(topicId))
}

export function updateProgress(
  topicId: string,
  isCorrect: boolean,
  mode: AnswerMode = 'multiple-choice',
): void {
  const all = load<StoredProgress[]>(KEYS.USER_PROGRESS, [])
  const existing = all.find((p) => p.topicId === topicId)
  const base: StoredProgress = existing ?? emptyStored(topicId)
  const updated: StoredProgress = {
    ...base,
    mcAttempts: base.mcAttempts + (mode === 'multiple-choice' ? 1 : 0),
    mcCorrect: base.mcCorrect + (mode === 'multiple-choice' && isCorrect ? 1 : 0),
    wrAttempts: base.wrAttempts + (mode === 'written' ? 1 : 0),
    wrCorrect: base.wrCorrect + (mode === 'written' && isCorrect ? 1 : 0),
    lastStudiedAt: new Date().toISOString(),
  }
  const next = existing
    ? all.map((p) => (p.topicId === topicId ? updated : p))
    : [...all, updated]
  save(KEYS.USER_PROGRESS, next)
}

export function toggleBookmark(topicId: string): void {
  const all = load<StoredProgress[]>(KEYS.USER_PROGRESS, [])
  const existing = all.find((p) => p.topicId === topicId)
  if (existing) {
    save(
      KEYS.USER_PROGRESS,
      all.map((p) =>
        p.topicId === topicId ? { ...p, isBookmarked: !p.isBookmarked } : p,
      ),
    )
  }
}

// --- StudySession ---
export function getStudySessions(): StudySession[] {
  return load(KEYS.STUDY_SESSIONS, [])
}
export function saveStudySession(session: StudySession): void {
  const sessions = getStudySessions()
  const next = sessions.find((s) => s.id === session.id)
    ? sessions.map((s) => (s.id === session.id ? session : s))
    : [...sessions, session]
  save(KEYS.STUDY_SESSIONS, next)
}

// --- Bookmarks (Question-level) ---
export function getBookmarks(): Bookmark[] {
  return load(KEYS.BOOKMARKS, [])
}
export function toggleQuestionBookmark(questionId: string): boolean {
  const bookmarks = getBookmarks()
  const exists = bookmarks.some((b) => b.questionId === questionId)
  if (exists) {
    save(KEYS.BOOKMARKS, bookmarks.filter((b) => b.questionId !== questionId))
    return false
  } else {
    save(KEYS.BOOKMARKS, [...bookmarks, { questionId, createdAt: new Date().toISOString() }])
    return true
  }
}

// --- 統計ヘルパー ---
export function calcCorrectRate(topicId: string): number {
  const p = getProgress(topicId)
  if (p.totalAttempts === 0) return 0
  return Math.round((p.correctCount / p.totalAttempts) * 100)
}

// モード別の正答率（未挑戦時は null）
export function calcCorrectRateByMode(
  topicId: string,
  mode: AnswerMode,
): number | null {
  const p = getProgress(topicId)
  const attempts = mode === 'multiple-choice' ? p.mcAttempts : p.wrAttempts
  const correct = mode === 'multiple-choice' ? p.mcCorrect : p.wrCorrect
  if (attempts === 0) return null
  return Math.round((correct / attempts) * 100)
}

export function resetAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  localStorage.removeItem('pmap:note_understanding')
  localStorage.removeItem('pmap:question_mastery')
}

// --- QuestionMastery ---
const QUESTION_MASTERY_KEY = 'pmap:question_mastery'

export function getQuestionMastery(): MasteryMap {
  return load(QUESTION_MASTERY_KEY, {})
}

export function updateQuestionMastery(
  questionId: string,
  mode: AnswerMode,
  isCorrect: boolean,
): void {
  const map = getQuestionMastery()
  const key = `${questionId}:${mode}`
  const current = map[key]

  let next: MasteryState
  if (!current) {
    next = isCorrect ? 'correct' : 'incorrect'
  } else if (current === 'correct') {
    next = isCorrect ? 'consecutive' : 'incorrect'
  } else if (current === 'consecutive') {
    next = isCorrect ? 'consecutive' : 'incorrect'
  } else {
    // incorrect
    next = isCorrect ? 'correct' : 'incorrect'
  }

  map[key] = next
  save(QUESTION_MASTERY_KEY, map)
}

// --- NoteUnderstanding ---
export type UnderstandingLevel = 'green' | 'yellow' | 'red'
type NoteUnderstandingMap = Record<string, UnderstandingLevel>

const NOTE_UNDERSTANDING_KEY = 'pmap:note_understanding'

export function getNoteUnderstanding(): NoteUnderstandingMap {
  return load(NOTE_UNDERSTANDING_KEY, {})
}

export function setNoteUnderstanding(
  categoryId: string,
  sectionIndex: number,
  level: UnderstandingLevel | null,
): void {
  const map = getNoteUnderstanding()
  const key = `${categoryId}:${sectionIndex}`
  if (level === null) {
    delete map[key]
  } else {
    map[key] = level
  }
  save(NOTE_UNDERSTANDING_KEY, map)
  touchNoteUnderstandingSyncMeta(categoryId, sectionIndex)
}
