interface Props {
  value: string
  onChange: (value: string) => void
  /** 入力欄のプレースホルダ */
  placeholder?: string
  /** 見出しの横に出す補足（例「保存されません」） */
  note?: string
  /** 高さ・リサイズなど、呼び出し側で決めたい textarea のクラス */
  textareaClassName?: string
}

/**
 * その場限りの下書きメモ（保存しない）
 *
 * 演習中の計算・根拠の書き出し用。value / onChange を呼び出し側が持つ制御コンポーネントで、
 * 永続化は一切しない（呼び出し側も LocalStorage 等へは保存しない前提）。
 * 午前Ⅱ（サイドパネル）と午後Ⅰ（ページ下部）で共用する。
 */
export default function ScratchMemo({
  value,
  onChange,
  placeholder = '計算メモ・下書き用\n（保存されません）',
  note,
  textareaClassName = 'h-[200px]',
}: Props) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">メモ</h2>
          {note && <span className="text-[10px] text-slate-400 truncate">{note}</span>}
        </div>
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={value === ''}
          className="flex-shrink-0 text-[10px] text-slate-400 hover:text-brand disabled:opacity-40 disabled:hover:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1"
        >
          クリア
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="メモ（保存されません）"
        spellCheck={false}
        className={`w-full resize-none rounded-lg border-2 border-slate-200 focus:border-brand bg-slate-50 px-2.5 py-2 text-[13px] leading-relaxed font-mono text-slate-800 outline-none transition-colors placeholder:text-slate-300 ${textareaClassName}`}
      />
    </section>
  )
}
