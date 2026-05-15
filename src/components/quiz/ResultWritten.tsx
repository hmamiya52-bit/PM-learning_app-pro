import type { Question } from '../../types'
import XpGain from './XpGain'

interface Props {
  question: Question
  written: string
  onJudge: (isCorrect: boolean) => void
  onNext: () => void
  isAutoCorrect: boolean
  isLast: boolean
  xpGained?: number
}

export default function ResultWritten({ question, written, onJudge, onNext, isAutoCorrect, isLast, xpGained = 0 }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* あなたの解答 */}
      <div className={`border rounded-xl p-4 ${isAutoCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isAutoCorrect ? 'text-emerald-600' : 'text-slate-500'}`}>あなたの解答</p>
          {isAutoCorrect && (
            <span className="text-xs font-bold bg-emerald-500 text-white rounded-full px-2.5 py-0.5">
              ✓ 自動正解
            </span>
          )}
        </div>
        <p className={`text-base font-bold ${isAutoCorrect ? 'text-emerald-800' : 'text-slate-800'}`}>{written || '（未入力）'}</p>
      </div>

      {/* 正解 */}
      <div className="bg-brand-light border border-brand-light rounded-xl p-4">
        <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-1">正解</p>
        <p className="text-base font-bold text-brand-darker">{question.correctAnswer}</p>
      </div>

      {/* 解説 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">解説</p>
        <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
      </div>

      {/* 自動正解 or 自己判定 */}
      {isAutoCorrect ? (
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className="text-sm text-emerald-600 font-semibold text-center">
              解答が完全一致したため、自動で正解と判定されました
            </p>
            <XpGain xpGained={xpGained} isCorrect={true} />
          </div>
          <button
            onClick={onNext}
            className="w-full bg-brand-darker hover:bg-brand-dark active:bg-brand-darker text-white font-bold rounded-xl py-4 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {isLast ? '結果を見る' : '次の問題へ'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-slate-600 text-center mb-3">
            正解でしたか？ 自分で判定してください
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onJudge(true)}
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl py-4 text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              ⭕ 正解
            </button>
            <button
              onClick={() => onJudge(false)}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-xl py-4 text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              ❌ 不正解
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            表記が異なっても意味が合っていれば正解にしてOK
          </p>
          <p className="text-xs text-slate-400 text-center mt-0.5">
            判定後、{isLast ? '結果画面' : '次の問題'}に進みます
          </p>
        </div>
      )}
    </div>
  )
}
