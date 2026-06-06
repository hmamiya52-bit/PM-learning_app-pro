import { smAfternoonProblems, smEssayCases, smEssayProblems, smFrequentThemes, smMorningQuestions } from '../../data/sm/content'
import type { SmFrequentTheme } from '../../data/sm/types'
import type { SmChoice, SmEssayLabel } from '../../data/sm/types'

const KEYS = {
  MORNING_RECORDS: 'pmap:sm:morning:records',
  AFTERNOON_RECORDS: 'pmap:sm:afternoon:records',
  ESSAY_ATTEMPTS: 'pmap:sm:essay:attempts',
  ESSAY_DRAFTS: 'pmap:sm:essay:drafts',
  SELECTED_ESSAY_CASE: 'pmap:sm:essay:selected-case',
  STUDY_PLAN_CHECKS: 'pmap:sm:study-plan:checks',
  EVENTS: 'pmap:sm:events',
} as const

export interface SmMorningRecord {
  id: string
  questionId: string
  selected: SmChoice
  isCorrect: boolean
  answeredAt: string
}

export interface SmAfternoonRecord {
  id: string
  problemId: string
  score: number
  answerMemo: string
  reflection: string
  recordedAt: string
}

export interface SmEssayReview {
  relevance: number
  specificity: number
  serviceManagement: number
  structure: number
  reflection: string
}

export interface SmEssayAttempt {
  id: string
  problemId: string
  outline: string
  bodyByLabel: Partial<Record<SmEssayLabel, string>>
  review: SmEssayReview
  recordedAt: string
}

export interface SmEssayDraft {
  problemId: string
  outline: string
  bodyByLabel: Partial<Record<SmEssayLabel, string>>
  updatedAt: string
}

export interface SmSelectedEssayCase {
  caseId: string
  selectedAt: string
}

export type SmEventType =
  | 'morning-answer'
  | 'afternoon-record'
  | 'essay-attempt'
  | 'essay-sample-view'
  | 'essay-case-select'
  | 'study-plan-check'

export interface SmHistoryEvent {
  id: string
  type: SmEventType
  label: string
  detail: string
  createdAt: string
}

export interface SmThemeReadiness {
  theme: SmFrequentTheme
  score: number
  status: 'ready' | 'review' | 'start'
  morning: {
    total: number
    attempted: number
    correct: number
    wrong: number
  }
  afternoon: {
    total: number
    attempted: number
    bestScore: number | null
    lowScoreCount: number
  }
  essay: {
    total: number
    attempts: number
    averageReview: number | null
    lowReviewCount: number
  }
  reasons: string[]
  nextAction: string
  nextRoute: string
}

export type SmStudyPlanChecks = Record<string, boolean>

function genId(): string {
  return crypto.randomUUID()
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

function addEvent(data: Omit<SmHistoryEvent, 'id' | 'createdAt'>): void {
  const event: SmHistoryEvent = {
    id: genId(),
    createdAt: new Date().toISOString(),
    ...data,
  }
  saveJson(KEYS.EVENTS, [event, ...loadSmEvents()].slice(0, 100))
}

export function loadSmMorningRecords(): SmMorningRecord[] {
  return loadJson<SmMorningRecord[]>(KEYS.MORNING_RECORDS, [])
}

export function addSmMorningRecord(questionId: string, selected: SmChoice): SmMorningRecord {
  const question = smMorningQuestions.find((q) => q.id === questionId)
  const record: SmMorningRecord = {
    id: genId(),
    questionId,
    selected,
    isCorrect: question ? question.correct === selected : false,
    answeredAt: new Date().toISOString(),
  }
  saveJson(KEYS.MORNING_RECORDS, [...loadSmMorningRecords(), record])
  addEvent({
    type: 'morning-answer',
    label: `午前Ⅱ 問${question?.number ?? ''}`,
    detail: record.isCorrect ? '正解' : `不正解（選択: ${selected}）`,
  })
  return record
}

export function clearSmMorningRecords(): void {
  saveJson(KEYS.MORNING_RECORDS, [])
}

export function loadSmAfternoonRecords(): SmAfternoonRecord[] {
  return loadJson<SmAfternoonRecord[]>(KEYS.AFTERNOON_RECORDS, [])
}

export function addSmAfternoonRecord(data: Omit<SmAfternoonRecord, 'id' | 'recordedAt'>): SmAfternoonRecord {
  const record: SmAfternoonRecord = {
    id: genId(),
    recordedAt: new Date().toISOString(),
    ...data,
  }
  saveJson(KEYS.AFTERNOON_RECORDS, [...loadSmAfternoonRecords(), record])
  const problem = smAfternoonProblems.find((p) => p.id === data.problemId)
  addEvent({
    type: 'afternoon-record',
    label: `午後Ⅰ 問${problem?.number ?? ''}`,
    detail: `${record.score}/50点`,
  })
  return record
}

export function deleteSmAfternoonRecord(id: string): void {
  saveJson(KEYS.AFTERNOON_RECORDS, loadSmAfternoonRecords().filter((r) => r.id !== id))
}

export function loadSmEssayAttempts(): SmEssayAttempt[] {
  return loadJson<SmEssayAttempt[]>(KEYS.ESSAY_ATTEMPTS, [])
}

export function addSmEssayAttempt(data: Omit<SmEssayAttempt, 'id' | 'recordedAt'>): SmEssayAttempt {
  const attempt: SmEssayAttempt = {
    id: genId(),
    recordedAt: new Date().toISOString(),
    ...data,
  }
  saveJson(KEYS.ESSAY_ATTEMPTS, [...loadSmEssayAttempts(), attempt])
  const problem = smEssayProblems.find((p) => p.id === data.problemId)
  addEvent({
    type: 'essay-attempt',
    label: `午後Ⅱ 問${problem?.number ?? ''}`,
    detail: `自己評価 ${averageReview(data.review)}/5`,
  })
  return attempt
}

export function loadSmEssayDrafts(): Record<string, SmEssayDraft> {
  return loadJson<Record<string, SmEssayDraft>>(KEYS.ESSAY_DRAFTS, {})
}

export function saveSmEssayDraft(draft: Omit<SmEssayDraft, 'updatedAt'>): void {
  const drafts = loadSmEssayDrafts()
  drafts[draft.problemId] = {
    ...draft,
    updatedAt: new Date().toISOString(),
  }
  saveJson(KEYS.ESSAY_DRAFTS, drafts)
}

export function loadSmSelectedEssayCase(): SmSelectedEssayCase | null {
  const selected = loadJson<SmSelectedEssayCase | null>(KEYS.SELECTED_ESSAY_CASE, null)
  if (!selected || !smEssayCases.some((item) => item.id === selected.caseId)) return null
  return selected
}

export function setSmSelectedEssayCase(caseId: string): SmSelectedEssayCase {
  const selected: SmSelectedEssayCase = {
    caseId,
    selectedAt: new Date().toISOString(),
  }
  saveJson(KEYS.SELECTED_ESSAY_CASE, selected)
  const caseItem = smEssayCases.find((item) => item.id === caseId)
  addEvent({
    type: 'essay-case-select',
    label: '午後Ⅱ 題材選択',
    detail: caseItem?.title ?? '題材を選択',
  })
  return selected
}

export function markSmEssaySampleViewed(problemId: string, sampleTitle: string): void {
  const problem = smEssayProblems.find((p) => p.id === problemId)
  addEvent({
    type: 'essay-sample-view',
    label: `午後Ⅱ 問${problem?.number ?? ''} 参考答案`,
    detail: sampleTitle,
  })
}

export function loadSmEvents(): SmHistoryEvent[] {
  return loadJson<SmHistoryEvent[]>(KEYS.EVENTS, [])
}

export function loadSmStudyPlanChecks(): SmStudyPlanChecks {
  return loadJson<SmStudyPlanChecks>(KEYS.STUDY_PLAN_CHECKS, {})
}

export function setSmStudyPlanCheck(id: string, checked: boolean, label: string): void {
  const checks = loadSmStudyPlanChecks()
  const next = {
    ...checks,
    [id]: checked,
  }
  saveJson(KEYS.STUDY_PLAN_CHECKS, next)
  addEvent({
    type: 'study-plan-check',
    label: checked ? 'プラン完了' : 'プラン再開',
    detail: label,
  })
}

export function clearSmStudyPlanChecks(): void {
  saveJson(KEYS.STUDY_PLAN_CHECKS, {})
}

export function averageReview(review: SmEssayReview): number {
  const values = [review.relevance, review.specificity, review.serviceManagement, review.structure]
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export function getSmSummary() {
  const morningRecords = loadSmMorningRecords()
  const latestByQuestion = new Map<string, SmMorningRecord>()
  for (const record of [...morningRecords].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))) {
    if (!latestByQuestion.has(record.questionId)) latestByQuestion.set(record.questionId, record)
  }
  const attemptedMorning = latestByQuestion.size
  const correctMorning = Array.from(latestByQuestion.values()).filter((r) => r.isCorrect).length
  const afternoonRecords = loadSmAfternoonRecords()
  const essayAttempts = loadSmEssayAttempts()
  return {
    morning: {
      attempted: attemptedMorning,
      total: smMorningQuestions.length,
      correct: correctMorning,
      rate: attemptedMorning > 0 ? Math.round((correctMorning / attemptedMorning) * 100) : 0,
      wrongIds: Array.from(latestByQuestion.values()).filter((r) => !r.isCorrect).map((r) => r.questionId),
    },
    afternoon: {
      attemptedProblems: new Set(afternoonRecords.map((r) => r.problemId)).size,
      totalProblems: smAfternoonProblems.length,
      recordCount: afternoonRecords.length,
      bestScore: afternoonRecords.length > 0 ? Math.max(...afternoonRecords.map((r) => r.score)) : null,
    },
    essay: {
      attemptedProblems: new Set(essayAttempts.map((a) => a.problemId)).size,
      totalProblems: smEssayProblems.length,
      attemptCount: essayAttempts.length,
      averageReview: essayAttempts.length > 0
        ? Math.round((essayAttempts.reduce((sum, a) => sum + averageReview(a.review), 0) / essayAttempts.length) * 10) / 10
        : null,
    },
  }
}

export function getSmThemeReadiness(): SmThemeReadiness[] {
  const morningRecords = loadSmMorningRecords()
  const latestByQuestion = new Map<string, SmMorningRecord>()
  for (const record of [...morningRecords].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))) {
    if (!latestByQuestion.has(record.questionId)) latestByQuestion.set(record.questionId, record)
  }

  const afternoonRecords = loadSmAfternoonRecords()
  const essayAttempts = loadSmEssayAttempts()

  return smFrequentThemes
    .map((theme) => {
      const themeQuestions = smMorningQuestions.filter((question) => question.themeId === theme.id)
      const themeQuestionRecords = themeQuestions
        .map((question) => latestByQuestion.get(question.id))
        .filter((record): record is SmMorningRecord => !!record)
      const morningCorrect = themeQuestionRecords.filter((record) => record.isCorrect).length
      const morningWrong = themeQuestionRecords.filter((record) => !record.isCorrect).length

      const themeAfternoonProblems = smAfternoonProblems.filter((problem) => problem.themeIds.includes(theme.id))
      const themeAfternoonProblemIds = new Set(themeAfternoonProblems.map((problem) => problem.id))
      const themeAfternoonRecords = afternoonRecords.filter((record) => themeAfternoonProblemIds.has(record.problemId))
      const afternoonBestScore = themeAfternoonRecords.length > 0
        ? Math.max(...themeAfternoonRecords.map((record) => record.score))
        : null
      const afternoonLowScoreCount = themeAfternoonRecords.filter((record) => record.score < 30).length

      const themeEssayProblems = smEssayProblems.filter((problem) => problem.themeIds.includes(theme.id))
      const themeEssayProblemIds = new Set(themeEssayProblems.map((problem) => problem.id))
      const themeEssayAttempts = essayAttempts.filter((attempt) => themeEssayProblemIds.has(attempt.problemId))
      const essayReviewValues = themeEssayAttempts.map((attempt) => averageReview(attempt.review))
      const essayAverageReview = essayReviewValues.length > 0
        ? Math.round((essayReviewValues.reduce((sum, value) => sum + value, 0) / essayReviewValues.length) * 10) / 10
        : null
      const essayLowReviewCount = essayReviewValues.filter((value) => value < 3.5).length

      const morningScore = themeQuestions.length > 0
        ? ((themeQuestionRecords.length / themeQuestions.length) * 0.4 + (morningCorrect / themeQuestions.length) * 0.6) * 100
        : 50
      const afternoonScore = themeAfternoonProblems.length > 0
        ? ((new Set(themeAfternoonRecords.map((record) => record.problemId)).size / themeAfternoonProblems.length) * 0.5
            + ((afternoonBestScore ?? 0) / 50) * 0.5) * 100
        : 50
      const essayScore = themeEssayProblems.length > 0
        ? (Math.min(themeEssayAttempts.length / themeEssayProblems.length, 1) * 0.45
            + ((essayAverageReview ?? 0) / 5) * 0.55) * 100
        : 50
      const score = Math.round(morningScore * 0.4 + afternoonScore * 0.3 + essayScore * 0.3)

      const reasons: string[] = []
      if (morningWrong > 0) reasons.push(`午前Ⅱの直近不正解 ${morningWrong}問`)
      if (themeQuestions.length > themeQuestionRecords.length) reasons.push(`午前Ⅱの未演習 ${themeQuestions.length - themeQuestionRecords.length}問`)
      if (themeAfternoonProblems.length > 0 && themeAfternoonRecords.length === 0) reasons.push('午後Ⅰが未記録')
      if (afternoonLowScoreCount > 0) reasons.push(`午後Ⅰの30点未満 ${afternoonLowScoreCount}回`)
      if (themeEssayProblems.length > 0 && themeEssayAttempts.length === 0) reasons.push('午後Ⅱの骨子・論述が未記録')
      if (essayLowReviewCount > 0) reasons.push(`午後Ⅱの自己評価3.5未満 ${essayLowReviewCount}回`)

      let nextAction = '知識ノートで午後問題への使い方を確認する'
      let nextRoute = '/it-service-manager/knowledge'
      if (morningWrong > 0 || themeQuestions.length > themeQuestionRecords.length) {
        nextAction = '午前Ⅱで用語と違いを固める'
        nextRoute = '/it-service-manager/morning'
      } else if (themeAfternoonProblems.length > 0 && (themeAfternoonRecords.length === 0 || afternoonLowScoreCount > 0)) {
        nextAction = '午後Ⅰで本文から根拠を拾う'
        nextRoute = '/it-service-manager/afternoon'
      } else if (themeEssayProblems.length > 0 && (themeEssayAttempts.length === 0 || essayLowReviewCount > 0)) {
        nextAction = '午後Ⅱで骨子と評価観点を見直す'
        nextRoute = '/it-service-manager/essay'
      }

      const status: SmThemeReadiness['status'] = score >= 75 && reasons.length === 0 ? 'ready' : score >= 45 ? 'review' : 'start'

      return {
        theme,
        score,
        status,
        morning: {
          total: themeQuestions.length,
          attempted: themeQuestionRecords.length,
          correct: morningCorrect,
          wrong: morningWrong,
        },
        afternoon: {
          total: themeAfternoonProblems.length,
          attempted: new Set(themeAfternoonRecords.map((record) => record.problemId)).size,
          bestScore: afternoonBestScore,
          lowScoreCount: afternoonLowScoreCount,
        },
        essay: {
          total: themeEssayProblems.length,
          attempts: themeEssayAttempts.length,
          averageReview: essayAverageReview,
          lowReviewCount: essayLowReviewCount,
        },
        reasons,
        nextAction,
        nextRoute,
      }
    })
    .sort((a, b) => a.score - b.score || a.theme.rank - b.theme.rank)
}
