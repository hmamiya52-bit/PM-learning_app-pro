import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Wand2 } from 'lucide-react'
import { smEssayProblems, smFrequentThemes } from '../../data/sm/content'
import type { SmEssayLabel } from '../../data/sm/types'
import {
  addSmEssayAttempt,
  loadSmEssayAttempts,
  loadSmEssayDrafts,
  markSmEssaySampleViewed,
  saveSmEssayDraft,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome, SourceLinks } from './SmPageChrome'

const labels: SmEssayLabel[] = ['ア', 'イ', 'ウ']
const sectionGuide: Record<SmEssayLabel, { target: string; helper: string; placeholder: string }> = {
  ア: {
    target: '600〜800字',
    helper: '対象サービス、利用者、SLA、体制、問題が起きた背景を書く。',
    placeholder: '対象サービス、利用者、サービス目標、運用体制、発生した問題を書く。',
  },
  イ: {
    target: '900〜1,200字',
    helper: '分析、関係者調整、対策、工夫、サービスマネジメント活動を具体化する。',
    placeholder: '問題の分析、関係者との調整、実施した対策、工夫した点を書く。',
  },
  ウ: {
    target: '500〜700字',
    helper: '評価結果、残課題、継続的改善、再発防止を数値や観点で締める。',
    placeholder: '対策の評価、得られた効果、残った課題、今後の改善を書く。',
  },
}

function charCount(value: string): number {
  return Array.from(value.replace(/\s/g, '')).length
}

export default function SmEssay() {
  const [selectedId, setSelectedId] = useState(smEssayProblems[0]?.id ?? '')
  const selected = smEssayProblems.find((problem) => problem.id === selectedId) ?? smEssayProblems[0]
  const drafts = loadSmEssayDrafts()
  const initialDraft = drafts[selected.id]
  const [outline, setOutline] = useState(initialDraft?.outline ?? '')
  const [bodyByLabel, setBodyByLabel] = useState<Partial<Record<SmEssayLabel, string>>>(initialDraft?.bodyByLabel ?? {})
  const [attempts, setAttempts] = useState(() => loadSmEssayAttempts())
  const [review, setReview] = useState({
    relevance: 3,
    specificity: 3,
    serviceManagement: 3,
    structure: 3,
    reflection: '',
  })

  const selectProblem = (id: string) => {
    saveSmEssayDraft({ problemId: selected.id, outline, bodyByLabel })
    const nextDraft = loadSmEssayDrafts()[id]
    setSelectedId(id)
    setOutline(nextDraft?.outline ?? '')
    setBodyByLabel(nextDraft?.bodyByLabel ?? {})
  }

  const saveDraft = () => {
    saveSmEssayDraft({ problemId: selected.id, outline, bodyByLabel })
    alert('ITSM午後Ⅱの下書きを保存しました。')
  }

  const saveAttempt = () => {
    addSmEssayAttempt({
      problemId: selected.id,
      outline,
      bodyByLabel,
      review,
    })
    setAttempts(loadSmEssayAttempts())
    saveSmEssayDraft({ problemId: selected.id, outline, bodyByLabel })
  }

  const applyOutlineTemplate = () => {
    if (outline.trim() && !confirm('現在の骨子をテンプレートで置き換えますか？')) return
    const template = selected.outlineSamples[0]?.bullets.join('\n') ?? ''
    setOutline(template)
  }

  const applyBodyTemplate = () => {
    const hasBody = labels.some((label) => (bodyByLabel[label] ?? '').trim())
    if (hasBody && !confirm('現在の本文をテンプレートで置き換えますか？')) return
    setBodyByLabel({
      ア: '対象サービス:\n利用者・顧客:\nサービス目標・SLA:\n運用体制:\n発生した問題:',
      イ: '分析した原因・影響:\n関係者との調整:\n実施した対策:\nサービスマネジメント上の工夫:\n苦労した点:',
      ウ: '評価方法・結果:\n改善できた点:\n残った課題:\n今後の継続的改善:',
    })
  }

  const totalChars = labels.reduce((sum, label) => sum + charCount(bodyByLabel[label] ?? ''), 0)
  const problemAttempts = attempts.filter((attempt) => attempt.problemId === selected.id)

  return (
    <SmPageChrome
      title="午後Ⅱ論述"
      description="令和7年度春期SMの2テーマに、骨子・評価観点・インフラ案件の参考答案2本ずつを用意しています。"
    >
      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
        <aside className="space-y-2">
          {smEssayProblems.map((problem) => (
            <button
              key={problem.id}
              type="button"
              onClick={() => selectProblem(problem.id)}
              className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                selectedId === problem.id ? 'bg-cyan-50 border-cyan-300' : 'bg-white border-slate-200 hover:border-cyan-200'
              }`}
            >
              <p className="text-[11px] text-slate-400">問{problem.number}</p>
              <p className="text-sm font-black text-slate-900 leading-snug mt-0.5">{problem.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                練習 {attempts.filter((attempt) => attempt.problemId === problem.id).length}本
              </p>
            </button>
          ))}
        </aside>

        <article className="bg-white border border-slate-200 rounded-xl px-4 py-4 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">問{selected.number} {selected.title}</h2>
              {selected.themeIds.map((id) => {
                const theme = smFrequentThemes.find((item) => item.id === id)
                return theme ? <FrequencyBadge key={id} value={theme.frequency} /> : null
              })}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">{selected.promptSummary}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              {selected.evidenceNote} / 本番は120分で1問選択
            </p>
            <div className="mt-3">
              <SourceLinks {...selected.source} />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={applyOutlineTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                骨子テンプレを入れる
              </button>
              <button
                type="button"
                onClick={applyBodyTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                本文テンプレを入れる
              </button>
              <Link
                to="/it-service-manager/report"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                仕上げを見る
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-500 mb-2">評価観点</h3>
              <ul className="space-y-1">
                {selected.expectedViewpoints.map((item) => (
                  <li key={item} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-500 mb-2">骨子例</h3>
              <div className="space-y-2">
                {selected.outlineSamples.map((outlineSample) => (
                  <details key={outlineSample.title} className="rounded-lg bg-cyan-50 border border-cyan-100 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-black text-cyan-900">{outlineSample.title}</summary>
                    <ul className="mt-2 space-y-1">
                      {outlineSample.bullets.map((bullet) => (
                        <li key={bullet} className="text-xs text-slate-700 leading-relaxed">・{bullet}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-500 mb-2">自分の骨子</h3>
            <textarea
              value={outline}
              onChange={(event) => setOutline(event.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="ア: 背景 / イ: 対応 / ウ: 評価と改善、の順で骨子を書く。"
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-slate-500">論述本文</h3>
              <p className="text-[11px] text-slate-500">合計 {totalChars}字</p>
            </div>
            <div className="grid gap-2">
              {labels.map((label) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-700">設問{label}</label>
                    <span className="text-[11px] text-slate-400">{charCount(bodyByLabel[label] ?? '')}字 / 目安 {sectionGuide[label].target}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-1">{sectionGuide[label].helper}</p>
                  <textarea
                    value={bodyByLabel[label] ?? ''}
                    onChange={(event) => setBodyByLabel((prev) => ({ ...prev, [label]: event.target.value }))}
                    rows={label === 'イ' ? 8 : 5}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder={sectionGuide[label].placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-500 mb-2">合格答案チェック</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selected.evaluationCriteria.map((item) => (
                <label key={item} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3">
            <h3 className="text-xs font-black text-slate-500 mb-3">自己評価</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                ['relevance', '題意適合'],
                ['specificity', '具体性'],
                ['serviceManagement', 'SM活動として書けたか'],
                ['structure', '構成'],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-xs font-bold text-slate-700">
                  <span className="flex items-center justify-between">
                    {label}
                    <span>{review[key]}/5</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={review[key]}
                    onChange={(event) => setReview((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                    className="w-full"
                  />
                </label>
              ))}
            </div>
            <input
              value={review.reflection}
              onChange={(event) => setReview((prev) => ({ ...prev, reflection: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="振り返り（例: クラウドサービスの責任分界が薄い）"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" onClick={saveDraft} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-cyan-300">
                下書き保存
              </button>
              <button type="button" onClick={saveAttempt} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700">
                練習完了として記録
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-500 mb-2">参考答案（論述例の一つ）</h3>
            <div className="grid gap-2">
              {selected.sampleAnswers.map((sample) => (
                <details
                  key={sample.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                  onToggle={(event) => {
                    if (event.currentTarget.open) markSmEssaySampleViewed(selected.id, sample.title)
                  }}
                >
                  <summary className="cursor-pointer text-sm font-black text-slate-900">{sample.title}</summary>
                  <p className="text-[11px] text-slate-500 mt-2">{sample.scenario}</p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-2">
                    これは論述例の一つです。唯一の正解ではありません。
                  </p>
                  <div className="space-y-3 mt-3">
                    {sample.sections.map((section) => (
                      <div key={section.label}>
                        <p className="text-xs font-black text-cyan-700">設問{section.label}</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-1">{section.text}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {problemAttempts.length > 0 && (
            <section>
              <h3 className="text-xs font-black text-slate-500 mb-2">このテーマの練習履歴</h3>
              <div className="grid gap-1">
                {problemAttempts
                  .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
                  .map((attempt) => (
                    <div key={attempt.id} className="rounded-lg border border-slate-100 px-3 py-2">
                      <p className="text-xs font-bold text-slate-800">{attempt.recordedAt.slice(0, 10)}</p>
                      <p className="text-[11px] text-slate-500">{attempt.review.reflection || '振り返りなし'}</p>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </article>
      </section>
    </SmPageChrome>
  )
}
