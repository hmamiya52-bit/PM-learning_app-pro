/**
 * 論述 練習履歴の一覧（同一問題内）
 *
 * 設計書 v0.15 §2.6 line 1256 / basic_design §6.5.5。
 * EssayTraining 画面下部や EssayList の問題詳細で利用。
 * 各行をクリックすると EssayAttemptDetail へ遷移する。
 */

import { Link } from 'react-router-dom'
import type { EssayAttempt } from '../../types'

interface Props {
  problemId: string
  attempts: EssayAttempt[]
}

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}時間${m}分`
  return `${m}分`
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function avgReview(a: EssayAttempt): number {
  const { relevance, structure, concreteness, consistency, charCount } = a.selfReview
  return Math.round(((relevance + structure + concreteness + consistency + charCount) / 5) * 10) / 10
}

function totalChars(a: EssayAttempt): number {
  return (
    (a.bodyByLabel['ア']?.length ?? 0) +
    (a.bodyByLabel['イ']?.length ?? 0) +
    (a.bodyByLabel['ウ']?.length ?? 0)
  )
}

export default function EssayAttemptHistory({ problemId, attempts }: Props) {
  if (attempts.length === 0) {
    return (
      <p className="text-[12px] text-slate-400 italic">まだ練習履歴がありません</p>
    )
  }
  return (
    <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
      {attempts.map((a, i) => (
        <li key={a.id}>
          <Link
            to={`/essay/${problemId}/attempts/${a.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
          >
            <span className="flex-shrink-0 text-[10px] text-slate-400 w-6 text-right tabular-nums">
              #{attempts.length - i}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700">
                {fmtDate(a.endedAt)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                経過 {fmtElapsed(a.elapsedSec)}
                <span className="mx-1.5 text-slate-300">|</span>
                総文字数 {totalChars(a)}字
                <span className="mx-1.5 text-slate-300">|</span>
                自己評価 平均 {avgReview(a)} / 5
              </p>
              {a.reflection && (
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  💬 {a.reflection}
                </p>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  )
}
