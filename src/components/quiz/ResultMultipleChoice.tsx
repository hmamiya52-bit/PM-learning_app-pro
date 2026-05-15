import type { Question } from '../../types'
import XpGain from './XpGain'

interface Props {
  question: Question
  selected: string
  isCorrect: boolean
  onNext: () => void
  isLast: boolean
  xpGained?: number
}

export default function ResultMultipleChoice({ question, selected, isCorrect, onNext, isLast, xpGained = 0 }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* 判定バナー */}
      <div
        className={`rounded-2xl p-5 flex items-center gap-4 ${
          isCorrect ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-red-50 border-2 border-red-400'
        }`}
      >
        <span className="text-4xl" aria-hidden="true">{isCorrect ? '⭕' : '❌'}</span>
        <div>
          <p className={`text-lg font-black ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {isCorrect ? '正解！' : '不正解'}
          </p>
          <XpGain xpGained={xpGained} isCorrect={isCorrect} />
          {!isCorrect && (
            <p className="text-sm text-slate-600 mt-0.5">
              あなたの解答: <span className="font-semibold text-red-600">{selected}</span>
            </p>
          )}
        </div>
      </div>

      {/* 正解 */}
      {!isCorrect && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">正解</p>
          <p className="text-base font-bold text-brand-darker">{question.correctAnswer}</p>
        </div>
      )}

      {/* 解説 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">解説</p>
        <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
      </div>

      {/* 次へ */}
      <button
        onClick={onNext}
        className="w-full bg-brand-darker hover:bg-brand-dark active:bg-brand-darker text-white font-bold rounded-xl py-4 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {isLast ? '結果を見る' : '次の問題へ →'}
      </button>
    </div>
  )
}
