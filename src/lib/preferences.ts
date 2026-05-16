/**
 * ユーザの表示設定を LocalStorage で管理する軽量モジュール。
 * 同期対象外（端末ローカルの好みのため、デバイス同期では運ばない）。
 */

const MORNING_FONT_SIZE_KEY = 'pmap:morning_font_size'

export type FontSize = 'compact' | 'comfortable'

const isValid = (v: unknown): v is FontSize =>
  v === 'compact' || v === 'comfortable'

export function getMorningFontSize(): FontSize {
  try {
    const v = localStorage.getItem(MORNING_FONT_SIZE_KEY)
    return isValid(v) ? v : 'compact'
  } catch {
    return 'compact'
  }
}

export function setMorningFontSize(size: FontSize): void {
  try {
    localStorage.setItem(MORNING_FONT_SIZE_KEY, size)
  } catch {
    // localStorage 不可な環境（プライベートブラウジング等）は無視
  }
}
