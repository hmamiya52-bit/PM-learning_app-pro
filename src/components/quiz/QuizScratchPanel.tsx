import { useCallback, useState } from 'react'
import ScratchCalculator from './ScratchCalculator'

/**
 * 演習画面のサイドパネル（PC 版のみ・保存なし）
 *
 * 問題を解いている「その場」でだけ使う計算用スペース。
 * - 上: 自由記入メモ（下書き・図の書き写し・途中計算）
 * - 下: 式が書ける電卓（重み付け計算などを 1 行で）
 *
 * 設計上の割り切り（ユーザ要望）:
 * - LocalStorage 等への永続化はしない
 * - 問題が切り替わったら破棄する（呼び出し側で key に questionId を渡して再マウントする）
 * - 画面幅が狭い端末では表示しない（呼び出し側の xl: ブレークポイントで制御）
 */
export default function QuizScratchPanel() {
  const [memo, setMemo] = useState('')

  /** 電卓の「結果をメモへ」からの追記（末尾へ 1 行足す） */
  const appendToMemo = useCallback((line: string) => {
    setMemo((prev) => (prev === '' ? line : prev.replace(/\n+$/, '') + '\n' + line))
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* メモ欄 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">メモ</h2>
          <button
            type="button"
            onClick={() => setMemo('')}
            disabled={memo === ''}
            className="text-[10px] text-slate-400 hover:text-brand disabled:opacity-40 disabled:hover:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1"
          >
            クリア
          </button>
        </div>
        {/* 高さは画面の高さに追従（電卓の高さ 約 564px を差し引いた残りを 120〜260px の範囲で使う）。
            低い画面でも電卓の = ボタンまで一画面に収まるようにするため。 */}
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={'計算メモ・下書き用\n（保存されません）'}
          aria-label="計算メモ（保存されません）"
          spellCheck={false}
          className="w-full h-[clamp(120px,calc(100vh-564px),260px)] resize-none rounded-lg border-2 border-slate-200 focus:border-brand bg-slate-50 px-2.5 py-2 text-[13px] leading-relaxed font-mono text-slate-800 outline-none transition-colors placeholder:text-slate-300"
        />
      </section>

      {/* 電卓 */}
      <ScratchCalculator onSendToMemo={appendToMemo} />
    </div>
  )
}
