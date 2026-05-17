// アプリバージョン
// ルール: コード修正ごとに +0.0.1、GitHubプッシュごとに +0.1.0、メジャーは手動で +1.0.0
// 2026-05-17: NWアプリ流用時の値（1.1.0）から PM 体験版用に 0.1.1 へリセット
export const APP_VERSION = '0.1.1'

// 1.0.0 未満は体験版
export const IS_TRIAL = APP_VERSION.startsWith('0.')

export const VERSION_LABEL = IS_TRIAL ? `v.${APP_VERSION} 体験版` : `v.${APP_VERSION}`
