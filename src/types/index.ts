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

// ─────────────────────────────────────────────────
// 公式午前II（F1-P4 で追加）
// 設計書 v0.15 §2.5 / basic_design §4.4 に従う
// ─────────────────────────────────────────────────

/**
 * 公式午前II 問題（IPA 過去問の引用）
 * id 接頭辞は 'om-'（重要マークの prefix と整合）
 */
export interface OfficialMorningQuestion {
  id: string                          // e.g. 'om-R6-1'
  year: string                        // e.g. 'R6'
  yearLabel: string                   // e.g. '令和6（2024）'
  number: number                      // 問題番号 1〜25
  questionText: string                // IPA公式の問題文（改変なし）
  choices: [string, string, string, string]  // ア・イ・ウ・エの4択
  correctIndex: 0 | 1 | 2 | 3
  explanation: string                 // 独自作成解説（PM 著作物）
  categoryId?: string                 // 関連 PM 12カテゴリの ID
  sourceUrl: string                   // IPA 出典 URL
}

/**
 * 公式午前II 解答記録（DP-P2-1 のため、自動解除なし）
 */
export interface MorningRecord {
  id: string                          // UUID
  questionId: string                  // OfficialMorningQuestion.id
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
  answeredAt: string                  // ISO 8601
}
