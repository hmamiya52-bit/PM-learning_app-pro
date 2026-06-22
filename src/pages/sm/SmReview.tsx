import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock, FilePenLine, FileText, Layers, ListChecks, RotateCcw, Sparkles, Target, Wrench } from 'lucide-react'
import type { SmReviewPart } from '../../lib/sm/progress'
import {
  clearSmReviewChecks,
  getSmReviewQueue,
  getSmSummary,
  loadSmReviewChecks,
  setSmReviewCheck,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

type ReviewFilter = 'all' | SmReviewPart

function isUnstartedReason(reason: string): boolean {
  return ['未演習', '未記録', '回答未記録', '骨子・論述未記録', '未チェック', '未実施'].some((keyword) => reason.includes(keyword))
}

const partLabel: Record<SmReviewPart, string> = {
  morning: '午前Ⅱ',
  case: '根拠',
  afternoon: '午後Ⅰ',
  essay: '午後Ⅱ',
  knowledge: '知識',
  answer: '答案',
  simulation: '模試',
  prescription: '対策',
}

const partIcon = {
  morning: ListChecks,
  case: Layers,
  afternoon: FileText,
  essay: FilePenLine,
  knowledge: BookOpen,
  answer: Sparkles,
  simulation: Clock,
  prescription: Wrench,
} as const

const filters: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'morning', label: '午前Ⅱ' },
  { id: 'case', label: '根拠' },
  { id: 'answer', label: '答案' },
  { id: 'prescription', label: '対策' },
  { id: 'simulation', label: '模試' },
  { id: 'afternoon', label: '午後Ⅰ' },
  { id: 'essay', label: '午後Ⅱ' },
  { id: 'knowledge', label: '知識' },
]

export default function SmReview() {
  const summary = getSmSummary()
  const [checks, setChecks] = useState(() => loadSmReviewChecks())
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const queue = useMemo(() => getSmReviewQueue(), [])
  const visibleQueue = filter === 'all' ? queue : queue.filter((item) => item.part === filter)
  const completedCount = queue.filter((item) => checks[item.id]).length
  const remainingQueue = queue.filter((item) => !checks[item.id])
  const weaknessQueue = remainingQueue.filter((item) => !isUnstartedReason(item.reason))
  const unstartedQueue = remainingQueue.filter((item) => isUnstartedReason(item.reason))
  const todaySet = [...weaknessQueue.slice(0, 5), ...unstartedQueue.slice(0, 3)].slice(0, 8)
  const todayMinutes = todaySet.reduce((sum, item) => sum + item.minutes, 0)
  const doneRate = queue.length > 0 ? Math.round((completedCount / queue.length) * 100) : 100
  const sRemaining = remainingQueue.filter((item) => item.priority === 'S').length

  const toggle = (id: string, title: string, checked: boolean) => {
    setSmReviewCheck(id, checked, title)
    setChecks(loadSmReviewChecks())
  }

  const reset = () => {
    if (!confirm('弱点集中の完了チェックだけをリセットしますか？')) return
    clearSmReviewChecks()
    setChecks({})
  }

  return (
    <SmPageChrome
      title="弱点集中"
      description="演習記録と答案パーツから、今見直すべき午前Ⅱ・根拠ドリル・午後Ⅰ・午後Ⅱを自動で並べます。"
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">復習進捗</p>
          <p className="text-xl font-black text-slate-900 mt-1">{doneRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount}/{queue.length}項目</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">今日の弱点</p>
          <p className="text-xl font-black text-slate-900 mt-1">{weaknessQueue.length}件</p>
          <p className="text-[11px] text-slate-500 mt-1">今日のセット {todaySet.length}件 / 目安 {todayMinutes}分</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">頻出Sの残り</p>
          <p className="text-xl font-black text-slate-900 mt-1">{sRemaining}</p>
          <p className="text-[11px] text-slate-500 mt-1">先に見直す候補</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400">根拠ドリル</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.evidenceDrills.attemptCount}回</p>
          <p className="text-[11px] text-slate-500 mt-1">平均 {summary.evidenceDrills.averageScore ?? '-'} / 5</p>
        </div>
      </section>

      {todaySet.length > 0 ? (
        <section className="bg-slate-900 text-white rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-200" />
                <h2 className="text-sm font-black">今日の順番</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                まず点数や自己評価に出た弱点を優先し、残り時間で未着手を埋めます。未着手が多くても、今日のセットは最大8件に絞ります。
              </p>
            </div>
            <Link
              to={todaySet[0].route}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700 flex-shrink-0"
            >
              最初を開く
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">
            {todaySet.slice(0, 4).map((item, index) => {
              const Icon = partIcon[item.part]
              return (
                <Link key={item.id} to={item.route} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 hover:border-cyan-400">
                  <p className="text-[10px] font-black text-cyan-200">STEP {index + 1}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Icon className="w-4 h-4 text-cyan-200 flex-shrink-0" />
                    <p className="text-xs font-black leading-snug">{item.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">{item.reason}</p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">復習キューは空です</h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                記録上は大きな抜けがありません。直前仕上げで本番前チェックへ進めます。
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  filter === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-cyan-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            弱点 {weaknessQueue.length}件 / 未着手 {unstartedQueue.length}件
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-rose-300 hover:text-rose-700 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            チェックをリセット
          </button>
        </div>
      </section>

      <section className="grid gap-2">
        {visibleQueue.map((item) => {
          const Icon = partIcon[item.part]
          const checked = !!checks[item.id]
          return (
            <article
              key={item.id}
              className={`rounded-xl border px-4 py-3 ${
                checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      <Icon className="w-3 h-3" />
                      {partLabel[item.part]} / {item.minutes}分
                    </span>
                    <FrequencyBadge value={item.priority} />
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      テーマ#{item.themeRank}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-slate-900 leading-snug mt-2">{item.title}</h2>
                  <p className="text-xs text-rose-700 leading-relaxed mt-1">{item.reason}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.action}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <label className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggle(item.id, item.title, event.target.checked)}
                    />
                    完了
                  </label>
                  <Link
                    to={item.route}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
                  >
                    開く
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="bg-white border border-cyan-100 rounded-xl px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-start gap-2">
            <ClipboardCheck className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-black text-slate-900">復習後の確認</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                復習キューを終えたら、仕上げレポートでテーマ別スコアと本番前チェックを確認します。
              </p>
            </div>
          </div>
          <Link
            to="/it-service-manager/report"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-50"
          >
            レポートへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SmPageChrome>
  )
}
