// カテゴリ
export interface Category {
  id: string
  name: string
  order: number
  description: string
}

// トピック
export interface Topic {
  id: string
  categoryId: string
  name: string
  order: number
  content: string  // HTML文字列
  source: 'pdf' | 'r7-exam'
}

// 問題（穴埋め形式のみ。4択/記述はUIで切り替え）
// ★F1-P2: 静的 isImportant フィールド廃止。重要マークは lib/importantMarks（pmap:important_questions）で動的管理。
export interface Question {
  id: string
  topicId: string
  questionText: string  // 空欄を {{blank}} でマーク
  correctAnswer: string
  choices: string[]     // 4択用（正解1 + 誤答3）
  explanation: string
  difficulty: 1 | 2 | 3  // 1:基礎, 2-3:応用
  // 記述モードから除外（複数空欄でセット概念のため、自由記述では学習効果が薄い問題）
  // 4択モードでは通常通り出題される。
  excludeFromWritten?: boolean
}

// 解答記録
export interface AnswerRecord {
  id: string
  questionId: string
  mode: 'multiple-choice' | 'written'
  isCorrect: boolean
  userAnswer: string
  answeredAt: string  // ISO 8601
}

// トピック別学習進捗（4択／記述で別カウント。totalAttempts／correctCount は派生）
export interface UserProgress {
  topicId: string
  // 4択モードの集計
  mcAttempts: number
  mcCorrect: number
  // 記述モードの集計
  wrAttempts: number
  wrCorrect: number
  // 派生（mc + wr）— 既存ロジック後方互換用
  totalAttempts: number
  correctCount: number
  lastStudiedAt: string  // ISO 8601
  isBookmarked: boolean
}

export type AnswerMode = 'multiple-choice' | 'written'

// 学習セッション
export interface StudySession {
  id: string
  startedAt: string
  endedAt: string | null
  mode: 'topic' | 'weakness' | 'random' | 'important'
  categoryId: string | null
  questionCount: number
  correctCount: number
}

// ブックマーク
export interface Bookmark {
  questionId: string
  createdAt: string
}
