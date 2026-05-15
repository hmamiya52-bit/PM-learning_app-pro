import { Link } from 'react-router-dom'

type AnswerMode = 'multiple-choice' | 'written'

interface Props {
  questionCount: number
  onSelect: (mode: AnswerMode) => void
  onBack: () => void
  /** ノートが用意されているカテゴリのID。null/undefined ならノートリンクを非表示 */
  noteCategoryId?: string | null
  /** ノートリンクに表示するカテゴリ名（任意）。 */
  noteCategoryName?: string
  /** 重要問題のみに絞り込むチェックボックスの状態 */
  onlyImportant?: boolean
  onChangeOnlyImportant?: (v: boolean) => void
}

export default function ModeSelect({
  questionCount,
  onSelect,
  onBack,
  noteCategoryId,
  noteCategoryName,
  onlyImportant,
  onChangeOnlyImportant,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6">
      <div className="text-center">
        <p className="text-slate-500 text-sm mb-1">全 {questionCount} 問</p>
        <h2 className="text-xl font-bold text-slate-800">解答モードを選んでください</h2>
      </div>

      {/* 重要問題のみ絞り込み（重要マーク付き問題のみに限定） */}
      {onChangeOnlyImportant && (
        <label className="w-full max-w-sm flex items-center gap-2.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
          <input
            type="checkbox"
            checked={!!onlyImportant}
            onChange={(e) => onChangeOnlyImportant(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm text-amber-900 font-bold">★ 重要問題のみを出題</span>
          <span className="ml-auto text-[11px] text-amber-700">出題 {questionCount} 問</span>
        </label>
      )}

      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* 4択モード */}
        <button
          onClick={() => onSelect('multiple-choice')}
          className="w-full bg-brand-darker hover:bg-brand-dark active:bg-brand-darker text-white rounded-2xl p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5" aria-hidden="true">🔘</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-base">4択モード</p>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 leading-none">おすすめ</span>
              </div>
              <p className="text-white/85 text-sm mt-1 leading-snug">選択肢を選ぶだけ。すぐに正誤がわかります。<br />まずはこちらから始めましょう。</p>
            </div>
          </div>
        </button>

        {/* 記述モード */}
        <button
          onClick={() => onSelect('written')}
          className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-200 rounded-2xl p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5" aria-hidden="true">✍️</span>
            <div>
              <p className="font-bold text-base">記述モード</p>
              <p className="text-slate-500 text-sm mt-1 leading-snug">自分で答えを書いて、正解を見て自分でマルバツをつけます。<br />4択に慣れたら挑戦してみましょう。</p>
            </div>
          </div>
        </button>

        {/* ノートを開く（該当カテゴリのみ） */}
        {noteCategoryId && (
          <Link
            to={`/notes/${noteCategoryId}`}
            className="w-full bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 border-2 border-teal-200 rounded-2xl p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex items-center gap-3"
            aria-label={`${noteCategoryName ? noteCategoryName + 'の' : ''}ノートを見る`}
          >
            <span className="text-2xl flex-shrink-0" aria-hidden="true">📖</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">
                {noteCategoryName ? `${noteCategoryName}のノートを見る` : 'ノートを見る'}
              </p>
              <p className="text-teal-700 text-xs mt-0.5 leading-snug">
                解く前に重要知識を確認できます
              </p>
            </div>
            <span className="text-teal-400 flex-shrink-0" aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <button
        onClick={onBack}
        className="text-slate-400 hover:text-slate-600 text-sm underline-offset-2 hover:underline transition-colors"
      >
        ← 戻る
      </button>
    </div>
  )
}
