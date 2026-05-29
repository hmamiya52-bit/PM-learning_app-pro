import React from 'react'

/**
 * インライン強調マークアップの描画（マスク機能なし）。
 *   ==text== → 赤太字（重要語・暗記対象・解答の核心）
 *   __text__ → ネイビー(ブランド)太字（構造ラベル・本文中の参照箇所）
 *
 * 記法は `docs/note_markup_rules.md` と共通。午後I解説（答え合わせ／詳細解説）の
 * 重要箇所強調に使う。ノートの RedWord と異なりマスク（隠す）機能は持たない。
 */
export function MarkupText({ text }: { text: string }) {
  const parts = text.split(/(==.+?==|__.+?__)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <span key={i} className="font-bold text-red-600">
              {part.slice(2, -2)}
            </span>
          )
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return (
            <span key={i} className="font-bold" style={{ color: '#9d5b8b' }}>
              {part.slice(2, -2)}
            </span>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

export default MarkupText
