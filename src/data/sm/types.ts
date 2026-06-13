export type SmExamPart = 'morning' | 'afternoon' | 'essay'
export type SmFrequency = 'S' | 'A' | 'B'
export type SmChoice = 'ア' | 'イ' | 'ウ' | 'エ'
export type SmEssayLabel = 'ア' | 'イ' | 'ウ'
export type SmAnswerPartUse = 'afternoon' | 'essay' | 'both'
export type SmSimulationPart = SmExamPart | 'mixed'
export type SmPrescriptionPart = SmExamPart | 'foundation' | 'cross'

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

export interface SmFinalSprintTask {
  id: string
  title: string
  part: SmExamPart | 'all'
  minutes: number
  goal: string
  actions: string[]
  successLine: string
  route: string
  themeIds: string[]
}

export interface SmExamDayStep {
  id: string
  title: string
  timeBox: string
  actions: string[]
  avoid: string
}

export interface SmMorningFocusCard {
  id: string
  themeId: string
  title: string
  priority: SmFrequency
  questionNumbers: number[]
  terms: string[]
  distinguish: string[]
  afternoonUse: string
  essayUse: string
  oneLine: string
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

export interface SmEssayAdaptationTemplate {
  id: string
  title: string
  themeIds: string[]
  problemIds?: string[]
  useWhen: string
  fitNote: string
  conversionSteps: string[]
  sectionGuides: {
    label: SmEssayLabel
    focus: string
    mustInclude: string[]
    phraseStarters: string[]
    avoid: string
  }[]
  fitChecks: string[]
}

export interface SmEssayQualityRubric {
  id: string
  title: string
  scoreTarget: string
  passImage: string
  weakSignals: string[]
  fixActions: string[]
}

export interface SmEssayRewritePattern {
  id: string
  title: string
  appliesTo: SmEssayLabel[]
  weak: string
  strong: string
  why: string
}

export interface SmEvidenceDrill {
  id: string
  title: string
  themeId: string
  timeBox: string
  scene: string
  question: string
  requirements: string[]
  evidence: string[]
  answerSkeleton: string
  modelAnswer: string
  scoringPoints: string[]
  practiceSteps: string[]
  relatedKnowledge: string[]
  avoid: string
}

export interface SmAnswerPartPack {
  id: string
  title: string
  themeId: string
  use: SmAnswerPartUse
  timeBox: string
  trigger: string
  weakAnswer: string
  strongAnswer: string
  reusablePhrases: string[]
  scoringKeys: string[]
  afternoonUse: string
  essayUse: string
  avoid: string
}

export interface SmSimulationSet {
  id: string
  title: string
  part: SmSimulationPart
  minutes: number
  purpose: string
  steps: {
    label: string
    detail: string
    route: string
  }[]
  output: string
  passLine: string
  failureSignals: string[]
  retryPlan: string
  retryRoute: string
  themeIds: string[]
}

export interface SmWeaknessPrescription {
  id: string
  title: string
  part: SmPrescriptionPart
  priority: SmFrequency
  minutes: number
  symptom: string
  likelyCause: string
  quickFix: string
  drillSteps: string[]
  passLine: string
  badPatterns: string[]
  routes: {
    label: string
    to: string
  }[]
  themeIds: string[]
}
