import { smAfternoonProblems, smAnswerPartPacks, smEssayCases, smEssayProblems, smEvidenceDrills, smFrequentThemes, smMorningQuestions, smSimulationSets, smWeaknessPrescriptions } from '../../data/sm/content'
import type { SmFrequentTheme } from '../../data/sm/types'
import type { SmChoice, SmEssayLabel, SmFrequency } from '../../data/sm/types'

const KEYS = {
  MORNING_RECORDS: 'pmap:sm:morning:records',
  AFTERNOON_RECORDS: 'pmap:sm:afternoon:records',
  ESSAY_ATTEMPTS: 'pmap:sm:essay:attempts',
  ESSAY_DRAFTS: 'pmap:sm:essay:drafts',
  SELECTED_ESSAY_CASE: 'pmap:sm:essay:selected-case',
  EVIDENCE_DRILL_CHECKS: 'pmap:sm:evidence-drills:checks',
  EVIDENCE_DRILL_ATTEMPTS: 'pmap:sm:evidence-drills:attempts',
  STUDY_PLAN_CHECKS: 'pmap:sm:study-plan:checks',
  FINAL_SPRINT_CHECKS: 'pmap:sm:final-sprint:checks',
  REVIEW_CHECKS: 'pmap:sm:review:checks',
  ANSWER_PART_CHECKS: 'pmap:sm:answer-parts:checks',
  SIMULATION_ATTEMPTS: 'pmap:sm:simulation:attempts',
  PRESCRIPTION_CHECKS: 'pmap:sm:prescriptions:checks',
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
  relevance?: number
  promptFit?: number
  specificity: number
  serviceManagement?: number
  validity?: number
  structure?: number
  consistency?: number
  insight?: number
  expression?: number
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

export interface SmEvidenceDrillAttempt {
  id: string
  drillId: string
  answer: string
  selfScore: number
  reflection: string
  recordedAt: string
}

export interface SmSimulationAttempt {
  id: string
  setId: string
  selfScore: number
  withinTime: boolean
  reflection: string
  nextFix: string
  recordedAt: string
}

export type SmEventType =
  | 'morning-answer'
  | 'afternoon-record'
  | 'essay-attempt'
  | 'essay-sample-view'
  | 'essay-case-select'
  | 'evidence-drill-check'
  | 'evidence-drill-attempt'
  | 'study-plan-check'
  | 'final-sprint-check'
  | 'review-check'
  | 'answer-part-check'
  | 'simulation-attempt'
  | 'prescription-check'

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
    evidenceTotal: number
    evidenceCompleted: number
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

export type SmReviewPart = 'morning' | 'afternoon' | 'essay' | 'case' | 'knowledge' | 'answer' | 'simulation' | 'prescription'

export interface SmReviewQueueItem {
  id: string
  part: SmReviewPart
  priority: SmFrequency
  themeId: string
  themeRank: number
  title: string
  reason: string
  action: string
  route: string
  minutes: number
}

export type SmStudyPlanChecks = Record<string, boolean>
export type SmEvidenceDrillChecks = Record<string, boolean>
export type SmFinalSprintChecks = Record<string, boolean>
export type SmReviewChecks = Record<string, boolean>
export type SmAnswerPartChecks = Record<string, boolean>
export type SmPrescriptionChecks = Record<string, boolean>

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

export function loadSmEvidenceDrillChecks(): SmEvidenceDrillChecks {
  return loadJson<SmEvidenceDrillChecks>(KEYS.EVIDENCE_DRILL_CHECKS, {})
}

export function setSmEvidenceDrillCheck(drillId: string, checked: boolean): void {
  const checks = loadSmEvidenceDrillChecks()
  const next = {
    ...checks,
    [drillId]: checked,
  }
  saveJson(KEYS.EVIDENCE_DRILL_CHECKS, next)
  const drill = smEvidenceDrills.find((item) => item.id === drillId)
  addEvent({
    type: 'evidence-drill-check',
    label: checked ? '根拠ドリル完了' : '根拠ドリル再開',
    detail: drill?.title ?? '根拠ドリル',
  })
}

export function loadSmEvidenceDrillAttempts(): SmEvidenceDrillAttempt[] {
  return loadJson<SmEvidenceDrillAttempt[]>(KEYS.EVIDENCE_DRILL_ATTEMPTS, [])
}

export function addSmEvidenceDrillAttempt(data: Omit<SmEvidenceDrillAttempt, 'id' | 'recordedAt'>): SmEvidenceDrillAttempt {
  const attempt: SmEvidenceDrillAttempt = {
    id: genId(),
    recordedAt: new Date().toISOString(),
    ...data,
  }
  saveJson(KEYS.EVIDENCE_DRILL_ATTEMPTS, [...loadSmEvidenceDrillAttempts(), attempt])
  const drill = smEvidenceDrills.find((item) => item.id === data.drillId)
  addEvent({
    type: 'evidence-drill-attempt',
    label: '根拠ドリル回答',
    detail: `${drill?.title ?? '根拠ドリル'} / ${data.selfScore}/5`,
  })
  return attempt
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

export function loadSmFinalSprintChecks(): SmFinalSprintChecks {
  return loadJson<SmFinalSprintChecks>(KEYS.FINAL_SPRINT_CHECKS, {})
}

export function setSmFinalSprintCheck(id: string, checked: boolean, label: string): void {
  const checks = loadSmFinalSprintChecks()
  const next = {
    ...checks,
    [id]: checked,
  }
  saveJson(KEYS.FINAL_SPRINT_CHECKS, next)
  addEvent({
    type: 'final-sprint-check',
    label: checked ? '直前仕上げ完了' : '直前仕上げ再開',
    detail: label,
  })
}

export function clearSmFinalSprintChecks(): void {
  saveJson(KEYS.FINAL_SPRINT_CHECKS, {})
}

export function loadSmReviewChecks(): SmReviewChecks {
  return loadJson<SmReviewChecks>(KEYS.REVIEW_CHECKS, {})
}

export function setSmReviewCheck(id: string, checked: boolean, label: string): void {
  const checks = loadSmReviewChecks()
  const next = {
    ...checks,
    [id]: checked,
  }
  saveJson(KEYS.REVIEW_CHECKS, next)
  addEvent({
    type: 'review-check',
    label: checked ? '弱点復習完了' : '弱点復習再開',
    detail: label,
  })
}

export function clearSmReviewChecks(): void {
  saveJson(KEYS.REVIEW_CHECKS, {})
}

export function loadSmAnswerPartChecks(): SmAnswerPartChecks {
  return loadJson<SmAnswerPartChecks>(KEYS.ANSWER_PART_CHECKS, {})
}

export function setSmAnswerPartCheck(id: string, checked: boolean, label: string): void {
  const checks = loadSmAnswerPartChecks()
  const next = {
    ...checks,
    [id]: checked,
  }
  saveJson(KEYS.ANSWER_PART_CHECKS, next)
  addEvent({
    type: 'answer-part-check',
    label: checked ? '答案パーツ完了' : '答案パーツ再開',
    detail: label,
  })
}

export function clearSmAnswerPartChecks(): void {
  saveJson(KEYS.ANSWER_PART_CHECKS, {})
}

export function loadSmSimulationAttempts(): SmSimulationAttempt[] {
  return loadJson<SmSimulationAttempt[]>(KEYS.SIMULATION_ATTEMPTS, [])
}

export function addSmSimulationAttempt(data: Omit<SmSimulationAttempt, 'id' | 'recordedAt'>): SmSimulationAttempt {
  const attempt: SmSimulationAttempt = {
    id: genId(),
    recordedAt: new Date().toISOString(),
    ...data,
  }
  saveJson(KEYS.SIMULATION_ATTEMPTS, [...loadSmSimulationAttempts(), attempt])
  const set = smSimulationSets.find((item) => item.id === data.setId)
  addEvent({
    type: 'simulation-attempt',
    label: '本番リハーサル',
    detail: `${set?.title ?? 'リハーサル'} / ${data.selfScore}/5${data.withinTime ? ' / 時間内' : ' / 時間超過'}`,
  })
  return attempt
}

export function clearSmSimulationAttempts(): void {
  saveJson(KEYS.SIMULATION_ATTEMPTS, [])
}

export function loadSmPrescriptionChecks(): SmPrescriptionChecks {
  return loadJson<SmPrescriptionChecks>(KEYS.PRESCRIPTION_CHECKS, {})
}

export function setSmPrescriptionCheck(id: string, checked: boolean, label: string): void {
  const checks = loadSmPrescriptionChecks()
  const next = {
    ...checks,
    [id]: checked,
  }
  saveJson(KEYS.PRESCRIPTION_CHECKS, next)
  addEvent({
    type: 'prescription-check',
    label: checked ? '弱点対策完了' : '弱点対策再開',
    detail: label,
  })
}

export function clearSmPrescriptionChecks(): void {
  saveJson(KEYS.PRESCRIPTION_CHECKS, {})
}

export function averageReview(review: SmEssayReview): number {
  const values = [
    review.promptFit ?? review.relevance,
    review.specificity,
    review.validity ?? review.serviceManagement,
    review.consistency ?? review.structure,
    review.insight ?? review.serviceManagement,
    review.expression ?? review.structure,
  ].filter((value): value is number => typeof value === 'number')
  if (values.length === 0) return 0
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
  const evidenceChecks = loadSmEvidenceDrillChecks()
  const evidenceAttempts = loadSmEvidenceDrillAttempts()
  const completedEvidenceDrills = smEvidenceDrills.filter((drill) => evidenceChecks[drill.id]).length
  const evidenceAverageScore = evidenceAttempts.length > 0
    ? Math.round((evidenceAttempts.reduce((sum, attempt) => sum + attempt.selfScore, 0) / evidenceAttempts.length) * 10) / 10
    : null
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
    evidenceDrills: {
      completed: completedEvidenceDrills,
      total: smEvidenceDrills.length,
      attemptCount: evidenceAttempts.length,
      averageScore: evidenceAverageScore,
      rate: smEvidenceDrills.length > 0 ? Math.round((completedEvidenceDrills / smEvidenceDrills.length) * 100) : 0,
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
  const evidenceChecks = loadSmEvidenceDrillChecks()

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
      const afternoonBestScores = themeAfternoonProblems
        .map((problem) => {
          const records = themeAfternoonRecords.filter((record) => record.problemId === problem.id)
          return records.length > 0 ? Math.max(...records.map((record) => record.score)) : null
        })
      const attemptedAfternoonBestScores = afternoonBestScores.filter((score): score is number => score !== null)
      const afternoonBestScore = attemptedAfternoonBestScores.length > 0
        ? Math.max(...attemptedAfternoonBestScores)
        : null
      const afternoonLowScoreCount = attemptedAfternoonBestScores.filter((score) => score < 30).length
      const themeEvidenceDrills = smEvidenceDrills.filter((drill) => drill.themeId === theme.id)
      const themeEvidenceCompleted = themeEvidenceDrills.filter((drill) => evidenceChecks[drill.id]).length

      const themeEssayProblems = smEssayProblems.filter((problem) => problem.themeIds.includes(theme.id))
      const themeEssayProblemIds = new Set(themeEssayProblems.map((problem) => problem.id))
      const themeEssayAttempts = essayAttempts.filter((attempt) => themeEssayProblemIds.has(attempt.problemId))
      const essayReviewValues = themeEssayProblems
        .map((problem) => {
          const values = themeEssayAttempts
            .filter((attempt) => attempt.problemId === problem.id)
            .map((attempt) => averageReview(attempt.review))
          return values.length > 0 ? Math.max(...values) : null
        })
        .filter((value): value is number => value !== null)
      const essayAverageReview = essayReviewValues.length > 0
        ? Math.round((essayReviewValues.reduce((sum, value) => sum + value, 0) / essayReviewValues.length) * 10) / 10
        : null
      const essayLowReviewCount = essayReviewValues.filter((value) => value < 4).length

      const morningScore = themeQuestions.length > 0
        ? ((themeQuestionRecords.length / themeQuestions.length) * 0.4 + (morningCorrect / themeQuestions.length) * 0.6) * 100
        : 50
      const afternoonScore = themeAfternoonProblems.length > 0
        ? (((new Set(themeAfternoonRecords.map((record) => record.problemId)).size / themeAfternoonProblems.length) * 0.5
            + ((afternoonBestScore ?? 0) / 50) * 0.5) * 75)
            + (themeEvidenceDrills.length > 0 ? (themeEvidenceCompleted / themeEvidenceDrills.length) * 25 : 25)
        : themeEvidenceDrills.length > 0
          ? (themeEvidenceCompleted / themeEvidenceDrills.length) * 100
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
      if (afternoonLowScoreCount > 0) reasons.push(`午後Ⅰの30点未満 ${afternoonLowScoreCount}問`)
      if (themeEvidenceDrills.length > themeEvidenceCompleted) reasons.push(`根拠ドリル未完了 ${themeEvidenceDrills.length - themeEvidenceCompleted}本`)
      if (themeEssayProblems.length > 0 && themeEssayAttempts.length === 0) reasons.push('午後Ⅱの骨子・論述が未記録')
      if (essayLowReviewCount > 0) reasons.push(`午後Ⅱの自己評価4.0未満 ${essayLowReviewCount}問`)

      let nextAction = '知識ノートで午後問題へのつなげ方を確認する'
      let nextRoute = '/it-service-manager/knowledge'
      if (morningWrong > 0 || themeQuestions.length > themeQuestionRecords.length) {
        nextAction = '午前Ⅱで用語と違いを整理する'
        nextRoute = `/it-service-manager/morning?theme=${encodeURIComponent(theme.id)}`
      } else if (themeAfternoonProblems.length > 0 && (themeAfternoonRecords.length === 0 || afternoonLowScoreCount > 0)) {
        nextAction = '午後Ⅰで本文から根拠を見つける'
        nextRoute = `/it-service-manager/afternoon?problem=${encodeURIComponent(themeAfternoonProblems[0]?.id ?? '')}`
      } else if (themeEvidenceDrills.length > themeEvidenceCompleted) {
        nextAction = 'ケースで午後Ⅰの根拠ドリルを進める'
        nextRoute = `/it-service-manager/cases?drill=${encodeURIComponent(themeEvidenceDrills.find((drill) => !evidenceChecks[drill.id])?.id ?? themeEvidenceDrills[0]?.id ?? '')}`
      } else if (themeEssayProblems.length > 0 && (themeEssayAttempts.length === 0 || essayLowReviewCount > 0)) {
        nextAction = '午後Ⅱで骨子と評価観点を見直す'
        nextRoute = `/it-service-manager/essay?problem=${encodeURIComponent(themeEssayProblems[0]?.id ?? '')}`
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
          evidenceTotal: themeEvidenceDrills.length,
          evidenceCompleted: themeEvidenceCompleted,
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

function themeOf(themeId: string): SmFrequentTheme {
  return smFrequentThemes.find((theme) => theme.id === themeId) ?? smFrequentThemes[0]
}

function priorityValue(value: SmFrequency): number {
  return value === 'S' ? 0 : value === 'A' ? 1 : 2
}

function latestEvidenceAttempt(drillId: string, attempts: SmEvidenceDrillAttempt[]): SmEvidenceDrillAttempt | undefined {
  return attempts
    .filter((attempt) => attempt.drillId === drillId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
}

function latestSimulationAttempt(setId: string, attempts: SmSimulationAttempt[]): SmSimulationAttempt | undefined {
  return attempts
    .filter((attempt) => attempt.setId === setId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
}

export function getSmReviewQueue(): SmReviewQueueItem[] {
  const morningRecords = loadSmMorningRecords()
  const latestByQuestion = new Map<string, SmMorningRecord>()
  for (const record of [...morningRecords].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))) {
    if (!latestByQuestion.has(record.questionId)) latestByQuestion.set(record.questionId, record)
  }
  const afternoonRecords = loadSmAfternoonRecords()
  const essayAttempts = loadSmEssayAttempts()
  const evidenceChecks = loadSmEvidenceDrillChecks()
  const evidenceAttempts = loadSmEvidenceDrillAttempts()
  const answerPartChecks = loadSmAnswerPartChecks()
  const simulationAttempts = loadSmSimulationAttempts()
  const prescriptionChecks = loadSmPrescriptionChecks()
  const queue: SmReviewQueueItem[] = []

  smMorningQuestions.forEach((question) => {
    const record = latestByQuestion.get(question.id)
    if (record?.isCorrect) return
    const theme = themeOf(question.themeId)
    queue.push({
      id: `morning:${question.id}`,
      part: 'morning',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `午前Ⅱ 問${question.number}: ${question.topic}`,
      reason: record ? `直近不正解（${record.selected}を選択）` : '未演習',
      action: question.reviewNote,
      route: `/it-service-manager/morning?theme=${encodeURIComponent(question.themeId)}`,
      minutes: 4,
    })
  })

  smEvidenceDrills.forEach((drill) => {
    const attempt = latestEvidenceAttempt(drill.id, evidenceAttempts)
    const checked = !!evidenceChecks[drill.id]
    if (checked && attempt && attempt.selfScore >= 4) return
    const theme = themeOf(drill.themeId)
    queue.push({
      id: `evidence:${drill.id}`,
      part: 'case',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `根拠ドリル: ${drill.title}`,
      reason: !attempt ? '回答未記録' : attempt.selfScore < 4 ? `直近自己採点 ${attempt.selfScore}/5` : '完了チェック未完了',
      action: drill.practiceSteps[0] ?? '設問要求、本文根拠、答案骨子を分けて書く',
      route: `/it-service-manager/cases?drill=${encodeURIComponent(drill.id)}`,
      minutes: Number.parseInt(drill.timeBox, 10) || 8,
    })
  })

  smAfternoonProblems.forEach((problem) => {
    const records = afternoonRecords.filter((record) => record.problemId === problem.id)
    const bestScore = records.length > 0 ? Math.max(...records.map((record) => record.score)) : null
    if (bestScore !== null && bestScore >= 30) return
    const theme = problem.themeIds.map(themeOf).sort((a, b) => priorityValue(a.frequency) - priorityValue(b.frequency) || a.rank - b.rank)[0]
    queue.push({
      id: `afternoon:${problem.id}`,
      part: 'afternoon',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `午後Ⅰ 問${problem.number}: ${problem.title}`,
      reason: bestScore === null ? '未記録' : `最高 ${bestScore}/50点`,
      action: problem.traps[0] ?? '公式解答例と採点講評で、根拠不足を確認する',
      route: `/it-service-manager/afternoon?problem=${encodeURIComponent(problem.id)}`,
      minutes: 35,
    })
  })

  smEssayProblems.forEach((problem) => {
    const attempts = essayAttempts.filter((attempt) => attempt.problemId === problem.id)
    const bestReview = attempts.length > 0
      ? Math.max(...attempts.map((attempt) => averageReview(attempt.review)))
      : null
    if (bestReview !== null && bestReview >= 4) return
    const theme = problem.themeIds.map(themeOf).sort((a, b) => priorityValue(a.frequency) - priorityValue(b.frequency) || a.rank - b.rank)[0]
    queue.push({
      id: `essay:${problem.id}`,
      part: 'essay',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `午後Ⅱ 問${problem.number}: ${problem.title}`,
      reason: bestReview === null ? '骨子・論述未記録' : `最高自己評価 ${bestReview}/5`,
      action: problem.evaluationCriteria[0] ?? '問いへの適合、具体性、SM活動、構成を見直す',
      route: `/it-service-manager/essay?problem=${encodeURIComponent(problem.id)}`,
      minutes: 45,
    })
  })

  smAnswerPartPacks.forEach((pack) => {
    if (answerPartChecks[pack.id]) return
    const theme = themeOf(pack.themeId)
    queue.push({
      id: `answer:${pack.id}`,
      part: 'answer',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `答案パーツ: ${pack.title}`,
      reason: '未チェック',
      action: pack.reusablePhrases[0] ?? pack.strongAnswer,
      route: `/it-service-manager/answer-parts?pack=${encodeURIComponent(pack.id)}#${encodeURIComponent(pack.id)}`,
      minutes: Number.parseInt(pack.timeBox, 10) || 8,
    })
  })

  smSimulationSets.forEach((set) => {
    const attempt = latestSimulationAttempt(set.id, simulationAttempts)
    if (attempt && attempt.selfScore >= 4 && attempt.withinTime) return
    const theme = set.themeIds.map(themeOf).sort((a, b) => priorityValue(a.frequency) - priorityValue(b.frequency) || a.rank - b.rank)[0]
    queue.push({
      id: `simulation:${set.id}`,
      part: 'simulation',
      priority: theme.frequency,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `本番リハ: ${set.title}`,
      reason: !attempt ? '未実施' : attempt.selfScore < 4 ? `自己評価 ${attempt.selfScore}/5` : '時間内完了が未達',
      action: set.retryPlan,
      route: `/it-service-manager/simulation#${encodeURIComponent(set.id)}`,
      minutes: set.minutes,
    })
  })

  smWeaknessPrescriptions.forEach((prescription) => {
    if (prescriptionChecks[prescription.id]) return
    const theme = prescription.themeIds.map(themeOf).sort((a, b) => priorityValue(a.frequency) - priorityValue(b.frequency) || a.rank - b.rank)[0]
    queue.push({
      id: `prescription:${prescription.id}`,
      part: 'prescription',
      priority: prescription.priority,
      themeId: theme.id,
      themeRank: theme.rank,
      title: `弱点対策: ${prescription.title}`,
      reason: prescription.symptom,
      action: prescription.quickFix,
      route: `/it-service-manager/prescriptions#${encodeURIComponent(prescription.id)}`,
      minutes: prescription.minutes,
    })
  })

  getSmThemeReadiness()
    .filter((item) => item.status !== 'ready')
    .slice(0, 8)
    .forEach((item) => {
      queue.push({
        id: `knowledge:${item.theme.id}`,
        part: 'knowledge',
        priority: item.theme.frequency,
        themeId: item.theme.id,
        themeRank: item.theme.rank,
        title: `知識確認: ${item.theme.title}`,
        reason: item.reasons[0] ?? `仕上がり ${item.score}%`,
        action: item.nextAction,
        route: `/it-service-manager/knowledge?theme=${encodeURIComponent(item.theme.id)}#${encodeURIComponent(item.theme.id)}`,
        minutes: 10,
      })
    })

  const partOrder: Record<SmReviewPart, number> = {
    morning: 0,
    case: 1,
    answer: 2,
    simulation: 3,
    prescription: 4,
    afternoon: 5,
    essay: 6,
    knowledge: 7,
  }

  return queue.sort((a, b) =>
    priorityValue(a.priority) - priorityValue(b.priority)
    || a.themeRank - b.themeRank
    || partOrder[a.part] - partOrder[b.part]
    || a.title.localeCompare(b.title)
  )
}
