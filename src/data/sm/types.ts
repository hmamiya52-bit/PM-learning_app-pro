export type SmExamPart = 'morning' | 'afternoon' | 'essay'
export type SmFrequency = 'S' | 'A' | 'B'
export type SmChoice = 'ア' | 'イ' | 'ウ' | 'エ'
export type SmEssayLabel = 'ア' | 'イ' | 'ウ'

export interface SmSourceLinks {
  question: string
  answer?: string
  commentary?: string
  ipaPageUrl: string
  questionPdfUrl: string
  answerPdfUrl?: string
  commentaryPdfUrl?: string
  sourceLabel: string
  checkedAt: string
}

export interface SmFrequentTheme {
  id: string
  title: string
  rank: number
  frequency: SmFrequency
  appearsIn: SmExamPart[]
  years: string[]
  summary: string
  mustKnow: string[]
  morningPattern: string
  afternoonPattern: string
  essayPattern: string
  infraExamples: string[]
  relatedProblemIds: string[]
  evidenceNote: string
}

export interface SmKnowledgeSection {
  id: string
  title: string
  themeId: string
  frequency: SmFrequency
  minutes: number
  summary: string
  keyPoints: string[]
  morningUse: string
  afternoonUse: string
  essayUse: string
  miniCheck: {
    question: string
    answer: string
  }
}

export interface SmStudyPlanPhase {
  id: string
  order: number
  title: string
  hours: string
  goal: string
  actions: string[]
  actionRoutes?: string[]
  deliverable: string
  route: string
  themeIds: string[]
}

export interface SmMorningQuestion {
  id: string
  yearLabel: string
  number: number
  correct: SmChoice
  themeId: string
  topic: string
  focus: string
  reviewNote: string
  source: SmSourceLinks
}

export interface SmAfternoonAnswerItem {
  label: string
  answer: string
  point: string
}

export interface SmAfternoonProblem {
  id: string
  yearLabel: string
  number: number
  title: string
  themeIds: string[]
  purpose: string
  source: SmSourceLinks
  answerItems: SmAfternoonAnswerItem[]
  commentary: string[]
  traps: string[]
  evidenceNote: string
}

export interface SmEssaySection {
  label: SmEssayLabel
  text: string
}

export interface SmEssaySampleAnswer {
  id: string
  title: string
  scenario: string
  sections: SmEssaySection[]
}

export interface SmEssayProblem {
  id: string
  yearLabel: string
  number: number
  title: string
  themeIds: string[]
  promptSummary: string
  source: SmSourceLinks
  expectedViewpoints: string[]
  outlineSamples: {
    title: string
    bullets: string[]
  }[]
  evaluationCriteria: string[]
  sampleAnswers: SmEssaySampleAnswer[]
  evidenceNote: string
}

export interface SmEssayCase {
  id: string
  title: string
  themeIds: string[]
  service: string
  role: string
  situation: string
  problem: string
  actions: string[]
  metrics: string[]
  essayAngles: {
    label: SmEssayLabel
    text: string
  }[]
  reusablePhrases: string[]
  traps: string[]
}

export interface SmEvidenceDrill {
  id: string
  title: string
  themeId: string
  scene: string
  question: string
  requirements: string[]
  evidence: string[]
  answerSkeleton: string
  avoid: string
}
