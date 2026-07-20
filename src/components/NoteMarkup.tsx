// ─────────────────────────────────────────────
// ノート本文のマークアップ描画ヘルパー（共通）
//
// 2026-07-20: NoteDetail.tsx から抽出。午後Ⅰ定石一覧（AfternoonTips）でも
// 同じ描画を使うため共通化した。強調ワードのコンポーネント本体は NoteWords.tsx。
//
// マークアップ規約:
//   ==text== → RedWord（赤字・マスク可、暗記対象キーワード用）
//   __text__ → NavyWord（ネイビー #9d5b8b・マスクなし、ラベルや構造的強調用）
// ─────────────────────────────────────────────
import type { EmphasisToken } from '../data/noteDb'
import { RedWord, NavyWord } from './NoteWords'

// ─────────────────────────────────────────────
// 強調トークン配列 → React ノード（記号マークアップ不使用）
// ─────────────────────────────────────────────
export function renderTokens(
  tokens: EmphasisToken[],
  hideRed: boolean,
  version: number,
): React.ReactNode {
  return tokens.map((tok, i) => {
    if (tok.style === 'red') {
      return <RedWord key={i} text={tok.text} masked={hideRed} version={version} />
    }
    if (tok.style === 'navy') {
      return <NavyWord key={i} text={tok.text} />
    }
    return <span key={i}>{tok.text}</span>
  })
}

// ─────────────────────────────────────────────
// Render helper:
//   ==text== → RedWord（赤字・マスク可、暗記対象キーワード用）
//   __text__ → NavyWord（ネイビー・マスクなし、ラベルや構造的強調用）
// ─────────────────────────────────────────────
export function renderText(text: string, hideRed: boolean, version: number): React.ReactNode {
  const parts = text.split(/(==.+?==|__.+?__)/g)
  return parts.map((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      const inner = part.slice(2, -2)
      return <RedWord key={i} text={inner} masked={hideRed} version={version} />
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      const inner = part.slice(2, -2)
      return <NavyWord key={i} text={inner} />
    }
    return <span key={i}>{part}</span>
  })
}
