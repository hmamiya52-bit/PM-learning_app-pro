/**
 * モード別の学習データリセット（設定画面 §データ管理）。
 *
 * 各「学習モード」が持つドメイン記録（解答・正答率・採点・答案）だけを削除する。
 * XP・レベル・バッジ（gamification）／アクティビティ履歴（activityLog）／重要マークは
 * 横断的な累積実績のため、ここでは保持する（既存 resetAllData の方針を踏襲）。
 *
 * - quiz      : 一問一答（カテゴリ別）… 解答履歴 / 正答率 / セッション / ブックマーク / マスタリー
 * - morning   : 午前Ⅱ（公式過去問）  … 出題・正誤記録
 * - afternoon : 午後Ⅰ               … 演習記録 + 保存解答スナップショット（学習計画日は保持）
 * - essay     : 午後Ⅱ（論述）        … 答案履歴 + 編集中セッション（学習計画日は保持）
 */

import { resetAllData, resetQuizData } from './storage'
import { clearAllMorningRecords } from './morningRecords'
import { clearAllRecords as clearAfternoonRecords } from './tracker'
import { clearAllSavedAnswerSnapshots } from './afternoonSavedAnswers'
import { clearAllAttempts as clearEssayAttempts, clearActive as clearEssayActive } from './essay'

export type StudyModeKey = 'quiz' | 'morning' | 'afternoon' | 'essay'

/** 指定したモードの学習データのみをリセットする。 */
export function resetModeData(mode: StudyModeKey): void {
  switch (mode) {
    case 'quiz':
      resetQuizData()
      break
    case 'morning':
      clearAllMorningRecords()
      break
    case 'afternoon':
      clearAfternoonRecords()
      clearAllSavedAnswerSnapshots()
      break
    case 'essay':
      clearEssayAttempts()
      clearEssayActive()
      break
  }
}

/**
 * 全モードの学習データをリセットする（設定画面「すべての学習データをリセット」）。
 * resetAllData（クイズ＋ノート理解度＋マスタリー＋サイドバー状態）に加え、
 * 午前Ⅱ・午後Ⅰ・午後Ⅱのドメイン記録も削除する。
 */
export function resetAllStudyData(): void {
  resetAllData()
  clearAllMorningRecords()
  clearAfternoonRecords()
  clearAllSavedAnswerSnapshots()
  clearEssayAttempts()
  clearEssayActive()
}
