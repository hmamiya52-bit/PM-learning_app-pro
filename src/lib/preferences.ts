/**
 * ユーザの表示設定を LocalStorage で管理する軽量モジュール。
 * 同期対象外（端末ローカルの好みのため、デバイス同期では運ばない）。
 */

const MORNING_FONT_SIZE_KEY = 'pmap:morning_font_size'
const MORNING_CHOICE_SHUFFLE_KEY = 'pmap:morning_choice_shuffle'
const DEV_MODE_KEY = 'pmap:dev'

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
    return v === null ? false : v === 'true'
  } catch {
    return false
  }
}

export function setMorningChoiceShuffle(enabled: boolean): void {
  try {
    localStorage.setItem(MORNING_CHOICE_SHUFFLE_KEY, String(enabled))
  } catch {
    // localStorage 不可な環境（プライベートブラウジング等）は無視
  }
}

/**
 * 開発者モード（F2-P7 バッジ再設計）。
 * ON の間、勲章画面で全バッジを完全表示する（通常はブロンズ＋獲得済のみ表示）。
 * トグル UI は開発ビルド（import.meta.env.DEV）でのみ表示する想定。端末ローカル・同期対象外。
 */
export function getDevMode(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setDevMode(enabled: boolean): void {
  try {
    localStorage.setItem(DEV_MODE_KEY, String(enabled))
  } catch {
    // localStorage 不可な環境（プライベートブラウジング等）は無視
  }
}
