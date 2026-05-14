import { useMemo, useState } from 'react'
import type { Question } from '../../types'

interface Props {
  question: Question
  index: number
  total: number
  answerMode: 'multiple-choice' | 'written'
  onAnswerMultipleChoice: (selected: string) => void
  onAnswerWritten: (written: string) => void
}

/** questionText の {{blank}} を下線付きスペースに置換して表示 */
function QuestionText({ text, answer }: { text: string; answer?: string }) {
  const parts = text.split('{{blank}}')
  return (
    <p className="text-lg font-medium text-slate-800 leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            answer
              ? <span className="inline-block border-b-2 border-blue-500 text-blue-700 font-bold px-1 mx-0.5">{answer}</span>
              : <span className="inline-block border-b-2 border-slate-400 w-24 mx-1 align-bottom" aria-label="空欄" />
          )}
        </span>
      ))}
    </p>
  )
}

export default function QuizQuestion({
  question,
  index,
  total,
  answerMode,
  onAnswerMultipleChoice,
  onAnswerWritten,
}: Props) {
  const [writtenValue, setWrittenValue] = useState('')
  const shuffledChoices = useMemo(
    () => [...question.choices].sort(() => Math.random() - 0.5),
    [question.id]
  )

  const progress = ((index + 1) / total) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* 進捗バー & カウンター */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{index + 1} / {total} 問</span>
          {question.isImportant && (
            <span className="text-amber-500 font-semibold">★ 重要</span>
          )}
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題文 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <QuestionText text={question.questionText} />
        <p className="text-xs text-slate-400 mt-3">
          難易度: {'●'.repeat(question.difficulty)}{'○'.repeat(3 - question.difficulty)}
        </p>
      </div>

      {/* 解答エリア */}
      {answerMode === 'multiple-choice' ? (
        /* ── 4択 ── */
        <div className="flex flex-col gap-3" role="group" aria-label="選択肢">
          {shuffledChoices.map((choice) => (
            <button
              key={choice}
              onClick={() => onAnswerMultipleChoice(choice)}
              className="w-full text-left bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 rounded-xl px-4 py-3.5 text-slate-700 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        /* ── 記述 ── */
        <div className="flex flex-col gap-3">
          <label htmlFor="written-answer" className="text-sm font-medium text-slate-600">
            空欄に入る語句を入力してください
          </label>
          <input
            id="written-answer"
            type="text"
            value={writtenValue}
            onChange={(e) => setWrittenValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && writtenValue.trim()) {
                onAnswerWritten(writtenValue.trim())
              }
            }}
            placeholder="解答を入力…"
            className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 text-base outline-none transition-colors"
            autoComplete="off"
            autoFocus
          />
          <button
            onClick={() => {
              if (writtenValue.trim()) onAnswerWritten(writtenValue.trim())
            }}
            disabled={!writtenValue.trim()}
            className="w-full bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-blue-800 active:bg-blue-950 text-white font-bold rounded-xl py-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            解答する
          </button>
        </div>
      )}
    </div>
  )
}
