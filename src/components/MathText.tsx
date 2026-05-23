import { Fragment, type ReactNode } from 'react'

/**
 * 数式・強調マークアップを含むテキストを React 要素にレンダリングする。
 *
 * 数式マークアップ（LaTeX サブセット風、波括弧でネスト可）:
 *   frac{num}{den}  → 分数（縦積み、横線あり）
 *   ^{exp}          → 上付き（指数）
 *   _{sub}          → 下付き
 *
 * 強調マークアップ（ノート規約と同じ、F2-P3 解説品質向上で追加）:
 *   ==X==           → 赤字・太字（暗記対象キーワード相当、解説中の重要語句）
 *   __X__           → ネイビー (#9d5b8b)・太字（構造ラベル / 「ア」「イ」等の選択肢ラベル）
 *
 * 例:
 *   'E=5.2L^{0.98}'                       → E=5.2L^0.98 風
 *   'frac{1}{X}+frac{1}{Y}+frac{1}{Z}'     → 1/X + 1/Y + 1/Z（積み分数）
 *   '==プロジェクト憲章==は立ち上げで作成' → 「プロジェクト憲章」が赤字太字
 *   '__ア__ は EVM の説明'                  → 「ア」がネイビー太字
 *
 * パース順序: == → __ → frac → ^ → _ の順で先取りマッチ
 * （`__X__` が `_{` より先に評価されるため衝突しない）
 *
 * 数学記号・強調記号を含まない文字列はそのまま表示される（コスト最小）。
 */

function findBalancedClose(s: string, openIdx: number): number {
  if (s[openIdx] !== '{') return -1
  let depth = 1
  for (let i = openIdx + 1; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function parseMath(text: string, keyPrefix = 'm'): ReactNode {
  const out: ReactNode[] = []
  let buf = ''
  let i = 0
  let n = 0

  const flush = () => {
    if (buf) {
      out.push(<Fragment key={`${keyPrefix}-t${n++}`}>{buf}</Fragment>)
      buf = ''
    }
  }

  while (i < text.length) {
    // ==X== 赤字・太字（強調マークアップ、解説中の重要語句用）
    if (text.startsWith('==', i)) {
      const closeIdx = text.indexOf('==', i + 2)
      if (closeIdx > i + 2) {
        flush()
        out.push(
          <span key={`${keyPrefix}-r${n++}`} className="text-red-600 font-bold">
            {parseMath(text.slice(i + 2, closeIdx), `${keyPrefix}-r${n - 1}`)}
          </span>,
        )
        i = closeIdx + 2
        continue
      }
    }
    // __X__ ネイビー・太字（構造ラベル「ア/イ/ウ/エ」等）
    if (text.startsWith('__', i)) {
      const closeIdx = text.indexOf('__', i + 2)
      if (closeIdx > i + 2) {
        flush()
        out.push(
          <span
            key={`${keyPrefix}-nv${n++}`}
            className="font-bold"
            style={{ color: '#9d5b8b' }}
          >
            {parseMath(text.slice(i + 2, closeIdx), `${keyPrefix}-nv${n - 1}`)}
          </span>,
        )
        i = closeIdx + 2
        continue
      }
    }
    // frac{num}{den}
    if (text.startsWith('frac{', i)) {
      const numClose = findBalancedClose(text, i + 4)
      if (numClose > 0 && text[numClose + 1] === '{') {
        const denClose = findBalancedClose(text, numClose + 1)
        if (denClose > 0) {
          flush()
          const num = text.slice(i + 5, numClose)
          const den = text.slice(numClose + 2, denClose)
          out.push(
            <span
              key={`${keyPrefix}-f${n++}`}
              className="inline-flex flex-col items-center mx-1 align-middle leading-none"
              style={{ verticalAlign: 'middle' }}
            >
              <span className="px-1 pb-0.5 border-b border-current">
                {parseMath(num, `${keyPrefix}-f${n - 1}n`)}
              </span>
              <span className="px-1 pt-0.5">
                {parseMath(den, `${keyPrefix}-f${n - 1}d`)}
              </span>
            </span>,
          )
          i = denClose + 1
          continue
        }
      }
    }
    // ^{...}
    if (text[i] === '^' && text[i + 1] === '{') {
      const close = findBalancedClose(text, i + 1)
      if (close > 0) {
        flush()
        out.push(
          <sup key={`${keyPrefix}-s${n++}`} className="text-[0.7em]">
            {parseMath(text.slice(i + 2, close), `${keyPrefix}-s${n - 1}`)}
          </sup>,
        )
        i = close + 1
        continue
      }
    }
    // _{...}
    if (text[i] === '_' && text[i + 1] === '{') {
      const close = findBalancedClose(text, i + 1)
      if (close > 0) {
        flush()
        out.push(
          <sub key={`${keyPrefix}-b${n++}`} className="text-[0.7em]">
            {parseMath(text.slice(i + 2, close), `${keyPrefix}-b${n - 1}`)}
          </sub>,
        )
        i = close + 1
        continue
      }
    }
    buf += text[i]
    i++
  }
  flush()
  return <>{out}</>
}

interface MathTextProps {
  text: string
  /** 数式以外の改行を <br/> 相当で保持するかどうか（whitespace-pre-wrap を親に任せる場合は不要） */
  preserveWhitespace?: boolean
  className?: string
}

/**
 * 数式マークアップ付きテキストを表示するコンポーネント。
 * - 親に `whitespace-pre-wrap` が指定されていれば改行も保持される。
 * - 数式以外の部分はプレーンテキストと同等で、コストはほぼゼロ。
 */
export default function MathText({ text, preserveWhitespace, className }: MathTextProps) {
  const node = parseMath(text)
  if (preserveWhitespace) {
    return <span className={`whitespace-pre-wrap ${className ?? ''}`}>{node}</span>
  }
  return <span className={className}>{node}</span>
}
