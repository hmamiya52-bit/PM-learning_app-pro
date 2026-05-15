/**
 * 重要マーク（importantMarks）CRUD
 *
 * 設計書 v0.15 §3.3 / §2.3 に従う、ユーザ手動トグル式の重要マーク機能。
 *
 * - クイズ問題 `q-*` と公式午前II問題 `om-*` の両方を1つの配列で管理
 * - LocalStorage キー: `pmap:important_questions`
 * - 値: 重要マーク済みの questionId の配列（string[]）
 * - 正解しても自動解除されない（DP-P2-1 ユーザ確定）
 */

const KEY = 'pmap:important_questions'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string')
  } catch {
    return []
  }
}

function save(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch (e) {
    console.error('[importantMarks] 保存に失敗しました:', e)
    throw e
  }
}

/** すべての重要マーク済み questionId を取得 */
export function getImportantIds(): string[] {
  return load()
}

/** 指定の questionId が重要マークされているか */
export function isImportant(questionId: string): boolean {
  return load().includes(questionId)
}

/**
 * 指定 questionId の重要マークをトグル
 * @returns トグル後の状態（true = マーク済み, false = 解除）
 */
export function toggleImportant(questionId: string): boolean {
  const ids = load()
  const idx = ids.indexOf(questionId)
  if (idx >= 0) {
    ids.splice(idx, 1)
    save(ids)
    return false
  }
  ids.push(questionId)
  save(ids)
  return true
}

/** 全マークをクリア */
export function clearAllImportant(): void {
  save([])
}

/**
 * モード別に重要マークをクリア
 * @param prefix 'q-' = クイズ問題, 'om-' = 公式午前II問題
 */
export function clearImportantOfMode(prefix: 'q-' | 'om-'): void {
  save(load().filter((id) => !id.startsWith(prefix)))
}

/** モード別の件数取得（UI 表示用ヘルパー） */
export function countImportantByPrefix(prefix: 'q-' | 'om-'): number {
  return load().filter((id) => id.startsWith(prefix)).length
}
