/**
 * ユーザの表示設定を LocalStorage で管理する軽量モジュール。
 * 同期対象外（端末ローカルの好みのため、デバイス同期では運ばない）。
 */

const MORNING_FONT_SIZE_KEY = 'pmap:morning_font_size'
const MORNING_CHOICE_SHUFFLE_KEY = 'pmap:morning_choice_shuffle'

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

export function getMorningChoiceShuffle(): boolean {
  try {
    const v = localStorage.getItem(MORNING_CHOICE_SHUFFLE_KEY)
    return v === null ? true : v === 'true'
  } catch {
    return true
  }
}

export function setMorningChoiceShuffle(enabled: boolean): void {
  try {
    localStorage.setItem(MORNING_CHOICE_SHUFFLE_KEY, String(enabled))
  } catch {
    // localStorage 不可な環境（プライベートブラウジング等）は無視
  }
}
