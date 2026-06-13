import { Link, NavLink } from 'react-router-dom'
import { ArrowLeft, BarChart3, BookOpen, ClipboardCheck, Clock, FilePenLine, FileText, History, Home, Layers, ListChecks, Map, RotateCcw, Sparkles, Target, TimerReset, Wrench } from 'lucide-react'
import type { SmSourceLinks } from '../../data/sm/types'

const links = [
  { to: '/it-service-manager', label: '概要', icon: Home },
  { to: '/it-service-manager/strategy', label: '攻略', icon: Map },
  { to: '/it-service-manager/review', label: '復習', icon: RotateCcw },
  { to: '/it-service-manager/prescriptions', label: '処方', icon: Wrench },
  { to: '/it-service-manager/answer-parts', label: '答案', icon: Sparkles },
  { to: '/it-service-manager/simulation', label: '模試', icon: TimerReset },
  { to: '/it-service-manager/cases', label: 'ケース', icon: Layers },
  { to: '/it-service-manager/plan', label: 'プラン', icon: Clock },
  { to: '/it-service-manager/themes', label: 'テーマ', icon: BarChart3 },
  { to: '/it-service-manager/knowledge', label: 'ノート', icon: BookOpen },
  { to: '/it-service-manager/morning', label: '午前Ⅱ', icon: ListChecks },
  { to: '/it-service-manager/afternoon', label: '午後Ⅰ', icon: FileText },
  { to: '/it-service-manager/essay', label: '午後Ⅱ', icon: FilePenLine },
  { to: '/it-service-manager/final', label: '直前', icon: Target },
  { to: '/it-service-manager/report', label: 'レポート', icon: ClipboardCheck },
  { to: '/it-service-manager/history', label: '履歴', icon: History },
]

export function SmPageChrome({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-4 space-y-4">
        <header className="rounded-xl bg-slate-900 text-white px-4 py-4 shadow-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ホームへ戻る
          </Link>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-cyan-200 tracking-wider uppercase">IT Service Manager</p>
            <h1 className="text-lg sm:text-2xl font-black leading-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{description}</p>
          </div>
        </header>

        <nav className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5" aria-label="ITサービスマネージャ内メニュー">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/it-service-manager'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-bold transition-colors ${
                  isActive
                    ? 'bg-cyan-600 border-cyan-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {children}
      </div>
    </div>
  )
}

export function FrequencyBadge({ value }: { value: 'S' | 'A' | 'B' }) {
  const className =
    value === 'S'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : value === 'A'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${className}`}>
      頻出{value}
    </span>
  )
}

export function SourceLinks({
  question,
  answer,
  commentary,
  ipaPageUrl,
  questionPdfUrl,
  answerPdfUrl,
  commentaryPdfUrl,
  sourceLabel,
  checkedAt,
}: SmSourceLinks) {
  const questionUrl = questionPdfUrl ?? question
  const answerUrl = answerPdfUrl ?? answer
  const commentaryUrl = commentaryPdfUrl ?? commentary

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        <a href={questionUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800">
          問題PDF
        </a>
        {answerUrl && (
          <a href={answerUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white border border-slate-300 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-cyan-400">
            解答例PDF
          </a>
        )}
        {commentaryUrl && (
          <a href={commentaryUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white border border-slate-300 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-cyan-400">
            採点講評PDF
          </a>
        )}
        <a href={ipaPageUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white border border-slate-300 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-cyan-400">
          IPA年度ページ
        </a>
      </div>
      <p className="text-[10px] text-slate-400">
        出典: {sourceLabel} / 最終確認日: {checkedAt}
      </p>
    </div>
  )
}
