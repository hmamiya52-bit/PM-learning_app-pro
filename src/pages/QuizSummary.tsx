import { Link } from 'react-router-dom'
import type { Question } from '../types'

interface AnswerLog {
  question: Question
  userAnswer: string
  isCorrect: boolean
  mode: 'multiple-choice' | 'written'
}

interface Props {
  logs: AnswerLog[]
  sessionMode: string
  onRetryWrong: () => void
}

function rateColor(rate: number) {
  if (rate >= 80) return 'text-emerald-600'
  if (rate >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function rateBarColor(rate: number) {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

export default function QuizSummary({ logs, sessionMode, onRetryWrong }: Props) {
  const total = logs.length
  const correct = logs.filter((l) => l.isCorrect).length
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrongLogs = logs.filter((l) => !l.isCorrect)

  return (
    <div className="flex flex-col gap-6">
      {/* 大きなスコア表示 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">セッション結果</p>
        <p className={`text-6xl font-black tabular-nums leading-none ${rateColor(rate)}`}>
          {rate}<span className="text-3xl">%</span>
        </p>
        <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${rateBarColor(rate)}`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-3">
          {total} 問中 <span className="font-bold text-slate-700">{correct} 問</span> 正解
        </p>
        <p className="text-xs text-slate-400 mt-1">
          モード: {sessionMode}
        </p>
      </div>

      {/* 間違えた問題の復習 */}
      {wrongLogs.length > 0 && (
        <div>
          <button
            onClick={onRetryWrong}
            className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-bold rounded-xl py-4 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            ❌ 間違えた {wrongLogs.length} 問を復習する
          </button>
        </div>
      )}

      {/* 解答一覧 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          解答一覧
        </h3>
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {logs.map((log, i) => (
            <li key={log.question.id} className="px-4 py-3 flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  log.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {log.isCorrect ? '○' : '×'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 line-clamp-2">
                  <span className="text-slate-400 mr-1">{i + 1}.</span>
                  {log.question.questionText.replace('{{blank}}', `[${log.question.correctAnswer}]`)}
                </p>
                {!log.isCorrect && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    あなた: <span className="text-red-500">{log.userAnswer}</span>
                    　正解: <span className="text-blue-600 font-medium">{log.question.correctAnswer}</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ホームへ */}
      <Link
        to="/"
        className="block w-full text-center bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
