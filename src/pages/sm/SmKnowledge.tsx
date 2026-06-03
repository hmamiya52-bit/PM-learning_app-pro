import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { smFrequentThemes, smKnowledgeSections, smQuickDrills } from '../../data/sm/content'
import { FrequencyBadge, SmPageChrome } from './SmPageChrome'

export default function SmKnowledge() {
  const sortedSections = [...smKnowledgeSections].sort((a, b) => {
    const rankA = smFrequentThemes.find((theme) => theme.id === a.themeId)?.rank ?? 99
    const rankB = smFrequentThemes.find((theme) => theme.id === b.themeId)?.rank ?? 99
    return rankA - rankB
  })
  const [openId, setOpenId] = useState(sortedSections[0]?.id ?? '')
  const [revealedDrills, setRevealedDrills] = useState<Record<string, boolean>>({})

  return (
    <SmPageChrome
      title="知識ノート"
      description="頻出テーマを、午前Ⅱの暗記、午後Ⅰの読解、午後Ⅱの論述へつなげるための短期集中ノートです。"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
        <aside className="bg-white border border-slate-200 rounded-xl p-2 h-fit">
          {sortedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setOpenId(section.id)}
              className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                openId === section.id ? 'bg-cyan-50 text-cyan-900' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black leading-snug">{section.title}</span>
                <FrequencyBadge value={section.frequency} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{section.minutes}分目安</p>
            </button>
          ))}
        </aside>

        <section className="space-y-3">
          {sortedSections
            .filter((section) => section.id === openId)
            .map((section) => {
              const theme = smFrequentThemes.find((item) => item.id === section.themeId)
              const drills = smQuickDrills.filter((item) => item.themeId === section.themeId)
              return (
                <article key={section.id} className="bg-white border border-slate-200 rounded-xl px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{section.title}</h2>
                    <FrequencyBadge value={section.frequency} />
                    {theme && <span className="text-[11px] text-slate-400">頻出テーマ #{theme.rank}</span>}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mt-3">{section.summary}</p>

                  <div className="mt-4">
                    <h3 className="text-xs font-black text-slate-500 mb-2">要点</h3>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point) => (
                        <li key={point} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700 leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-3">
                      <p className="text-[11px] font-black text-cyan-800 mb-1">午前Ⅱ</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{section.morningUse}</p>
                    </div>
                    <div className="rounded-lg border border-violet-100 bg-violet-50/70 p-3">
                      <p className="text-[11px] font-black text-violet-800 mb-1">午後Ⅰ</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{section.afternoonUse}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-[11px] font-black text-emerald-800 mb-1">午後Ⅱ</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{section.essayUse}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900 text-white px-4 py-3 mt-4">
                    <p className="text-[11px] font-black text-cyan-200">ミニ確認</p>
                    <p className="text-sm leading-relaxed mt-1">{section.miniCheck.question}</p>
                    <p className="text-xs leading-relaxed text-slate-300 mt-2">{section.miniCheck.answer}</p>
                  </div>

                  {drills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-black text-slate-500 mb-2">論点ドリル</h3>
                      <div className="grid gap-2">
                        {drills.map((drill) => {
                          const revealed = !!revealedDrills[drill.id]
                          return (
                            <div key={drill.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                  <span className="inline-flex rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                    {drill.part}
                                  </span>
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed mt-2">{drill.question}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setRevealedDrills((current) => ({ ...current, [drill.id]: !revealed }))}
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-cyan-300"
                                >
                                  {revealed ? '答えを隠す' : '答えを見る'}
                                </button>
                              </div>
                              {revealed && (
                                <div className="mt-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                                  <p className="text-sm text-slate-800 leading-relaxed">{drill.answer}</p>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2">{drill.point}</p>
                                  <Link
                                    to={drill.route}
                                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-cyan-700 hover:underline"
                                  >
                                    演習へ
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
        </section>
      </div>
    </SmPageChrome>
  )
}
