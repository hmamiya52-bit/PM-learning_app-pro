import { useCallback, useMemo, useRef, useState } from 'react'
import {
  evaluateExpression,
  formatCalcNumber,
  sanitizeExpressionInput,
} from '../../lib/calcExpression'

interface Props {
  /** 「結果をメモへ」ボタンの送り先。未指定なら同ボタンを表示しない。 */
  onSendToMemo?: (line: string) => void
}

interface HistoryEntry {
  id: number
  expr: string
  value: number
}

/** ボタン 1 個分の定義（label は表示、token は式へ挿入する文字） */
interface KeyDef {
  label: string
  token: string
  kind: 'num' | 'op' | 'fn'
  ariaLabel?: string
}

const KEYS: KeyDef[] = [
  { label: 'AC', token: 'AC', kind: 'fn', ariaLabel: 'すべて消去' },
  { label: '⌫', token: 'BS', kind: 'fn', ariaLabel: '1文字消去' },
  { label: '(', token: '(', kind: 'op' },
  { label: ')', token: ')', kind: 'op' },
  { label: '7', token: '7', kind: 'num' },
  { label: '8', token: '8', kind: 'num' },
  { label: '9', token: '9', kind: 'num' },
  { label: '÷', token: '/', kind: 'op', ariaLabel: '割る' },
  { label: '4', token: '4', kind: 'num' },
  { label: '5', token: '5', kind: 'num' },
  { label: '6', token: '6', kind: 'num' },
  { label: '×', token: '*', kind: 'op', ariaLabel: '掛ける' },
  { label: '1', token: '1', kind: 'num' },
  { label: '2', token: '2', kind: 'num' },
  { label: '3', token: '3', kind: 'num' },
  { label: '−', token: '-', kind: 'op', ariaLabel: '引く' },
  { label: '0', token: '0', kind: 'num' },
  { label: '.', token: '.', kind: 'num', ariaLabel: '小数点' },
  { label: '+', token: '+', kind: 'op', ariaLabel: '足す' },
  { label: '=', token: '=', kind: 'fn', ariaLabel: '計算する' },
]

/** 式を見た目に戻す（* → ×、/ → ÷）。履歴とメモ送りの表示に使う。 */
function toDisplayExpression(expr: string): string {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷')
}

/**
 * 演習サイドパネル用の簡易電卓（PC 版のみ表示）
 *
 * - 式をそのまま入力できる（3*4+2*2-(2*8) のような重み付け計算を 1 行で）
 * - 入力中はリアルタイムに計算結果をプレビュー表示
 * - Enter / = で確定すると履歴に積み、その結果から続けて計算できる
 * - 保存はしない（問題が切り替わるとリセットされる）
 */
export default function ScratchCalculator({ onSendToMemo }: Props) {
  const [expr, setExpr] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const historySeq = useRef(0)

  // 入力中のライブプレビュー（式が未完成のうちは何も出さない）
  const preview = useMemo(() => {
    const trimmed = expr.trim()
    if (trimmed === '') return null
    const r = evaluateExpression(trimmed)
    if (!r.ok) return null
    const formatted = formatCalcNumber(r.value)
    // 「12」のような数値そのままの入力では = を出さない
    if (formatted === trimmed) return null
    return formatted
  }, [expr])

  const updateExpr = useCallback((next: string) => {
    setExpr(next)
    setError(null)
  }, [])

  /** Enter / = : 計算を確定して履歴へ積み、結果から計算を続けられるようにする */
  const commit = useCallback(() => {
    const trimmed = expr.trim()
    if (trimmed === '') return
    const r = evaluateExpression(trimmed)
    if (!r.ok) {
      setError(r.error)
      return
    }
    const formatted = formatCalcNumber(r.value)
    if (formatted !== trimmed) {
      historySeq.current += 1
      const entry: HistoryEntry = { id: historySeq.current, expr: trimmed, value: r.value }
      setHistory((prev) => [entry, ...prev].slice(0, 5))
    }
    setExpr(formatted)
    setError(null)
  }, [expr])

  const handleKey = useCallback(
    (key: KeyDef) => {
      if (key.token === 'AC') {
        setExpr('')
        setError(null)
      } else if (key.token === 'BS') {
        updateExpr(expr.slice(0, -1))
      } else if (key.token === '=') {
        commit()
      } else {
        updateExpr(expr + key.token)
      }
      inputRef.current?.focus()
    },
    [expr, commit, updateExpr],
  )

  const handleSendToMemo = useCallback(() => {
    if (!onSendToMemo) return
    const trimmed = expr.trim()
    if (trimmed === '') return
    const r = evaluateExpression(trimmed)
    const display = toDisplayExpression(trimmed)
    onSendToMemo(r.ok ? display + ' = ' + formatCalcNumber(r.value) : display)
  }, [expr, onSendToMemo])

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">電卓</h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setHistory([])}
            className="text-[10px] text-slate-400 hover:text-brand transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1"
          >
            履歴を消す
          </button>
        )}
      </div>

      {/* 計算履歴（新しい順・最大5件、クリックで値を式に挿入） */}
      {history.length > 0 && (
        <ul className="mb-2 max-h-12 overflow-y-auto space-y-0.5">
          {history.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => updateExpr(expr + formatCalcNumber(h.value))}
                title="この結果を式に挿入"
                className="w-full text-right text-[11px] text-slate-400 hover:text-brand transition-colors font-mono truncate px-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {toDisplayExpression(h.expr)} = <span className="font-bold">{formatCalcNumber(h.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 式入力 + ライブプレビュー */}
      <div className="rounded-lg border-2 border-slate-200 focus-within:border-brand transition-colors px-2.5 py-2 bg-slate-50">
        <input
          ref={inputRef}
          type="text"
          value={expr}
          onChange={(e) => updateExpr(sanitizeExpressionInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setExpr('')
              setError(null)
            }
          }}
          placeholder="3*4+2*2-(2*8)"
          aria-label="計算式"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent text-right text-base font-mono text-slate-800 outline-none placeholder:text-slate-300 placeholder:text-sm"
        />
        <p
          className="text-right text-lg font-bold font-mono text-brand-dark leading-tight min-h-[1.5rem]"
          aria-live="polite"
        >
          {error ? (
            <span className="text-xs font-normal text-red-500">{error}</span>
          ) : preview !== null ? (
            <>= {preview}</>
          ) : null}
        </p>
      </div>

      {/* キーパッド */}
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {KEYS.map((key) => {
          let cls = 'bg-white border border-slate-200 text-slate-700 hover:border-brand hover:bg-brand-light/40'
          if (key.kind === 'op') cls = 'bg-brand-light/60 border border-brand-light text-brand-dark font-bold hover:bg-brand-light'
          if (key.token === 'AC') cls = 'bg-white border border-red-200 text-red-500 font-bold hover:bg-red-50'
          if (key.token === 'BS') cls = 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          if (key.token === '=') cls = 'bg-brand border border-brand text-white font-bold hover:bg-brand-dark'
          return (
            <button
              key={key.token}
              type="button"
              onClick={() => handleKey(key)}
              aria-label={key.ariaLabel ?? key.label}
              className={`h-8 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${cls}`}
            >
              {key.label}
            </button>
          )
        })}
      </div>

      {onSendToMemo && (
        <button
          type="button"
          onClick={handleSendToMemo}
          disabled={expr.trim() === ''}
          className="mt-1.5 w-full h-8 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-500 hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:cursor-default transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          ↑ 結果をメモへ書き出す
        </button>
      )}
    </section>
  )
}
