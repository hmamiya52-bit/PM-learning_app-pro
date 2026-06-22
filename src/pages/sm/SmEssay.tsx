import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, GitBranch, Layers, Wand2 } from 'lucide-react'
import {
  smEssayAdaptationTemplates,
  smEssayCases,
  smEssayProblems,
  smEssayQualityRubrics,
  smEssayRewritePatterns,
  smFrequentThemes,
} from '../../data/sm/content'
import type { SmEssayAdaptationTemplate, SmEssayCase, SmEssayLabel } from '../../data/sm/types'
import {
  addSmEssayAttempt,
  loadSmEssayAttempts,
  loadSmEssayDrafts,
  loadSmSelectedEssayCase,
  markSmEssaySampleViewed,
  saveSmEssayDraft,
} from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome, SourceLinks } from './SmPageChrome'

const labels: SmEssayLabel[] = ['ア', 'イ', 'ウ']
const sectionGuide: Record<SmEssayLabel, { target: string; min: number; max: number; helper: string; placeholder: string }> = {
  ア: {
    target: '400〜800字',
    min: 400,
    max: 800,
    helper: '対象サービス、利用者、SLA、体制、問題が起きた背景を書く。',
    placeholder: '対象サービス、利用者、サービス目標、運用体制、発生した問題を書く。',
  },
  イ: {
    target: '800〜1,600字',
    min: 800,
    max: 1600,
    helper: '分析、関係者調整、対策、工夫、サービスマネジメント活動を具体化する。',
    placeholder: '問題の分析、関係者との調整、実施した対策、工夫した点を書く。',
  },
  ウ: {
    target: '600〜1,200字',
    min: 600,
    max: 1200,
    helper: '評価結果、残課題、継続的改善、再発防止を数値や観点で締める。',
    placeholder: '対策の評価、得られた効果、残った課題、今後の改善を書く。',
  },
}

const reviewItems = [
  ['promptFit', '設問要求を満たした', '問われた対象、条件、字数、設問ア・イ・ウの役割を外していない。'],
  ['specificity', '具体性がある', 'サービス、体制、関係者、数値、時期、判断基準が具体的である。'],
  ['validity', '対策が妥当', '原因と対策が対応し、サービス目標や顧客影響に照らして納得できる。'],
  ['consistency', '論理が一貫している', '背景、問題、対応、評価がつながり、途中で論点が変わらない。'],
  ['insight', '見識と行動が見える', '自分が判断し、関係者を動かし、継続的改善まで進めている。'],
  ['expression', '表現が読みやすい', '抽象語だけで逃げず、短く自然な文で採点者が追いやすい。'],
] as const

function charCount(value: string): number {
  return Array.from(value.replace(/\s/g, '')).length
}

function findAngle(caseItem: SmEssayCase, label: SmEssayLabel): string {
  return caseItem.essayAngles.find((item) => item.label === label)?.text ?? ''
}

function buildCaseOutline(caseItem: SmEssayCase): string {
  return [
    `ア: ${caseItem.service}。${caseItem.situation}`,
    `イ: ${caseItem.actions.join(' / ')}`,
    `ウ: ${caseItem.metrics.join(' / ')}。${findAngle(caseItem, 'ウ')}`,
  ].join('\n')
}

function buildCaseBody(caseItem: SmEssayCase): Partial<Record<SmEssayLabel, string>> {
  return {
    ア: [
      `対象サービス: ${caseItem.service}`,
      `自分の立場: ${caseItem.role}`,
      `状況: ${caseItem.situation}`,
      `問題: ${caseItem.problem}`,
      `設問アで強調する点: ${findAngle(caseItem, 'ア')}`,
    ].join('\n'),
    イ: [
      '実施した対応・工夫:',
      ...caseItem.actions.map((item) => `・${item}`),
      `設問イで強調する点: ${findAngle(caseItem, 'イ')}`,
      `使える表現: ${caseItem.reusablePhrases.slice(0, 2).join(' / ')}`,
    ].join('\n'),
    ウ: [
      '評価に使う数字:',
      ...caseItem.metrics.map((item) => `・${item}`),
      `設問ウで強調する点: ${findAngle(caseItem, 'ウ')}`,
      `避けること: ${caseItem.traps[0] ?? '技術作業だけで終わらせない'}`,
    ].join('\n'),
  }
}

function bestTemplateId(problemId: string, themeIds: string[], caseItem?: SmEssayCase): string {
  const caseThemeIds = caseItem?.themeIds ?? []
  return smEssayAdaptationTemplates.find((template) => template.problemIds?.includes(problemId))?.id
    ?? smEssayAdaptationTemplates.find((template) => template.themeIds.some((themeId) => themeIds.includes(themeId)))?.id
    ?? smEssayAdaptationTemplates.find((template) => template.themeIds.some((themeId) => caseThemeIds.includes(themeId)))?.id
    ?? smEssayAdaptationTemplates[0]?.id
    ?? ''
}

function templateSection(template: SmEssayAdaptationTemplate, label: SmEssayLabel) {
  return template.sectionGuides.find((item) => item.label === label)
}

function buildAdaptedOutline(template: SmEssayAdaptationTemplate, caseItem?: SmEssayCase): string {
  const caseLine = caseItem
    ? `題材: ${caseItem.title} / ${caseItem.service}`
    : '題材: 自分の経験に近いインフラ運用事例'
  return [
    caseLine,
      `問われ方: ${template.title}`,
    `ア: ${templateSection(template, 'ア')?.focus ?? ''}`,
    `イ: ${template.conversionSteps.join(' / ')}`,
    `ウ: ${templateSection(template, 'ウ')?.focus ?? ''}`,
  ].join('\n')
}

function buildAdaptedBody(template: SmEssayAdaptationTemplate, caseItem?: SmEssayCase): Partial<Record<SmEssayLabel, string>> {
  const base = caseItem ? buildCaseBody(caseItem) : {}
  const sectionA = templateSection(template, 'ア')
  const sectionB = templateSection(template, 'イ')
  const sectionC = templateSection(template, 'ウ')
  return {
    ア: [
      base.ア,
      `問われ方への合わせ方: ${sectionA?.focus ?? ''}`,
      '必ず入れる要素:',
      ...(sectionA?.mustInclude.map((item) => `・${item}`) ?? []),
      `書き出し例: ${sectionA?.phraseStarters[0] ?? ''}`,
    ].filter(Boolean).join('\n'),
    イ: [
      base.イ,
      `問われ方への合わせ方: ${sectionB?.focus ?? ''}`,
      '組み替え手順:',
      ...template.conversionSteps.map((item) => `・${item}`),
      `書き出し例: ${sectionB?.phraseStarters[0] ?? ''}`,
    ].filter(Boolean).join('\n'),
    ウ: [
      base.ウ,
      `問われ方への合わせ方: ${sectionC?.focus ?? ''}`,
      '合格答案チェック:',
      ...template.fitChecks.map((item) => `・${item}`),
      `書き出し例: ${sectionC?.phraseStarters[0] ?? ''}`,
    ].filter(Boolean).join('\n'),
  }
}

export default function SmEssay() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedProblemId = searchParams.get('problem')
  const initialProblemId = smEssayProblems.some((problem) => problem.id === requestedProblemId)
    ? requestedProblemId ?? ''
    : smEssayProblems[0]?.id ?? ''
  const [selectedId, setSelectedId] = useState(initialProblemId)
  const selected = smEssayProblems.find((problem) => problem.id === selectedId) ?? smEssayProblems[0]
  const selectedCase = smEssayCases.find((item) => item.id === loadSmSelectedEssayCase()?.caseId)
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => bestTemplateId(selected.id, selected.themeIds, selectedCase))
  const drafts = loadSmEssayDrafts()
  const initialDraft = drafts[selected.id]
  const [outline, setOutline] = useState(initialDraft?.outline ?? '')
  const [bodyByLabel, setBodyByLabel] = useState<Partial<Record<SmEssayLabel, string>>>(initialDraft?.bodyByLabel ?? {})
  const [attempts, setAttempts] = useState(() => loadSmEssayAttempts())
  const [review, setReview] = useState({
    promptFit: 3,
    specificity: 3,
    validity: 3,
    consistency: 3,
    insight: 3,
    expression: 3,
    reflection: '',
  })

  const selectProblem = (id: string) => {
    saveSmEssayDraft({ problemId: selected.id, outline, bodyByLabel })
    const nextDraft = loadSmEssayDrafts()[id]
    const nextProblem = smEssayProblems.find((problem) => problem.id === id) ?? selected
    setSelectedId(id)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('problem', id)
    setSearchParams(nextParams, { replace: true })
    setSelectedTemplateId(bestTemplateId(nextProblem.id, nextProblem.themeIds, selectedCase))
    setOutline(nextDraft?.outline ?? '')
    setBodyByLabel(nextDraft?.bodyByLabel ?? {})
  }

  const saveDraft = () => {
    saveSmEssayDraft({ problemId: selected.id, outline, bodyByLabel })
    alert('ITSM午後Ⅱの下書きを保存しました。')
  }

  const saveAttempt = () => {
    const shortLabels = labels.filter((label) => charCount(bodyByLabel[label] ?? '') < sectionGuide[label].min)
    if (shortLabels.length > 0 && !confirm(`設問${shortLabels.join('・')}が目安字数の下限を下回っています。途中答案として記録しますか？`)) return
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

  const applySelectedCaseTemplate = () => {
    if (!selectedCase) return
    const hasDraft = outline.trim() || labels.some((label) => (bodyByLabel[label] ?? '').trim())
    if (hasDraft && !confirm('現在の骨子・本文メモを選んだ題材で置き換えますか？')) return
    setOutline(buildCaseOutline(selectedCase))
    setBodyByLabel(buildCaseBody(selectedCase))
  }

  const applyAdaptationTemplate = () => {
    if (!selectedAdaptation) return
    const hasDraft = outline.trim() || labels.some((label) => (bodyByLabel[label] ?? '').trim())
    if (hasDraft && !confirm('現在の骨子・本文メモを問われ方別テンプレートで置き換えますか？')) return
    setOutline(buildAdaptedOutline(selectedAdaptation, selectedCase))
    setBodyByLabel(buildAdaptedBody(selectedAdaptation, selectedCase))
  }

  const totalChars = labels.reduce((sum, label) => sum + charCount(bodyByLabel[label] ?? ''), 0)
  const problemAttempts = attempts.filter((attempt) => attempt.problemId === selected.id)
  const selectedCaseFitsProblem = selectedCase
    ? selectedCase.themeIds.some((themeId) => selected.themeIds.includes(themeId))
    : false
  const matchingTemplates = smEssayAdaptationTemplates.filter((template) => {
    if (template.problemIds?.includes(selected.id)) return true
    if (template.themeIds.some((themeId) => selected.themeIds.includes(themeId))) return true
    return selectedCase ? template.themeIds.some((themeId) => selectedCase.themeIds.includes(themeId)) : false
  })
  const templateOptions = matchingTemplates.length > 0 ? matchingTemplates : smEssayAdaptationTemplates
  const selectedAdaptation = templateOptions.find((template) => template.id === selectedTemplateId) ?? templateOptions[0]

  return (
    <SmPageChrome
      title="午後Ⅱ論述"
      description={`令和7年度春期SMの2テーマに、骨子・評価観点・参考答案・問われ方別テンプレート${smEssayAdaptationTemplates.length}本、IPA寄りの自己評価6観点を用意しています。`}
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
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-2">
              字数は令和7年度春期午後Ⅱ問題冊子の指定範囲です。範囲内に収めた上で、評価、残課題、継続的改善まで書き切ります。
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
                骨子テンプレートを入れる
              </button>
              <button
                type="button"
                onClick={applyBodyTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                本文テンプレートを入れる
              </button>
              <Link
                to="/it-service-manager/report"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                仕上げを見る
              </Link>
              <Link
                to="/it-service-manager/cases"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-cyan-300"
              >
                <Layers className="w-3.5 h-3.5" />
                事例バンクを見る
              </Link>
            </div>

            <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-3">
              {selectedCase ? (
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                      <p className="text-xs font-black text-cyan-900">午後Ⅱで使う題材</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        selectedCaseFitsProblem ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {selectedCaseFitsProblem ? 'このテーマに合う' : '問われ方に合わせて調整'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-snug mt-1">{selectedCase.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {selectedCase.service} / {selectedCase.problem}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={applySelectedCaseTemplate}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      題材から骨子を作る
                    </button>
                    <Link
                      to="/it-service-manager/cases"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-50"
                    >
                      別の題材を選ぶ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-cyan-900">午後Ⅱの題材を先に決める</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      インフラ案件の題材を選ぶと、骨子と本文メモに展開できます。
                    </p>
                  </div>
                  <Link
                    to="/it-service-manager/cases"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"
                  >
                    題材を選ぶ
                    <Layers className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {selectedAdaptation && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-emerald-700" />
                    <p className="text-xs font-black text-emerald-900">問われ方別テンプレート</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      選んだ題材を、問われ方に合わせて強調し直します。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyAdaptationTemplate}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 flex-shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    問われ方に合わせる
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-3 mt-3">
                  <div className="space-y-1">
                    {templateOptions.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          selectedAdaptation.id === template.id ? 'bg-white border border-emerald-300 text-emerald-900' : 'bg-white/70 border border-transparent text-slate-700 hover:border-emerald-200'
                        }`}
                      >
                        <p className="text-xs font-black leading-snug">{template.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{template.useWhen}</p>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-lg bg-white border border-emerald-100 px-3 py-3">
                    <p className="text-sm font-black text-slate-900">{selectedAdaptation.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{selectedAdaptation.fitNote}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      {selectedAdaptation.sectionGuides.map((guide) => (
                        <div key={guide.label} className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="text-[11px] font-black text-emerald-800">設問{guide.label}</p>
                          <p className="text-xs text-slate-700 leading-relaxed mt-1">{guide.focus}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            注意: {guide.avoid}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[11px] font-black text-slate-500">組み替え手順</p>
                        <ul className="space-y-1 mt-1">
                          {selectedAdaptation.conversionSteps.map((item) => (
                            <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-500">合格答案チェック</p>
                        <ul className="space-y-1 mt-1">
                          {selectedAdaptation.fitChecks.map((item) => (
                            <li key={item} className="text-xs text-slate-700 leading-relaxed">・{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    {(() => {
                      const count = charCount(bodyByLabel[label] ?? '')
                      const guide = sectionGuide[label]
                      const status = count < guide.min ? '不足' : count > guide.max ? '超過' : '範囲内'
                      const statusClass = count < guide.min
                        ? 'text-rose-700 bg-rose-50 border-rose-100'
                        : count > guide.max
                          ? 'text-amber-700 bg-amber-50 border-amber-100'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                      return (
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass}`}>
                          {count}字 / {guide.target} / {status}
                        </span>
                      )
                    })()}
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

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <h3 className="text-xs font-black text-slate-500 mb-2">採点ルーブリック</h3>
              <div className="space-y-2">
                {smEssayQualityRubrics.map((rubric, index) => (
                  <details key={rubric.id} open={index === 0} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-black text-slate-900">
                      {rubric.title}
                      <span className="ml-2 text-[10px] font-black text-cyan-700">{rubric.scoreTarget}</span>
                    </summary>
                    <p className="text-xs text-slate-700 leading-relaxed mt-2">{rubric.passImage}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="rounded-md bg-white border border-rose-100 px-2 py-2">
                        <p className="text-[10px] font-black text-rose-700">改善が必要なサイン</p>
                        <ul className="space-y-1 mt-1">
                          {rubric.weakSignals.map((item) => (
                            <li key={item} className="text-[11px] text-slate-600 leading-relaxed">・{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-md bg-white border border-emerald-100 px-2 py-2">
                        <p className="text-[10px] font-black text-emerald-700">直し方</p>
                        <ul className="space-y-1 mt-1">
                          {rubric.fixActions.map((item) => (
                            <li key={item} className="text-[11px] text-slate-600 leading-relaxed">・{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <h3 className="text-xs font-black text-slate-500 mb-2">表現を改善する</h3>
              <div className="space-y-2">
                {smEssayRewritePatterns.map((pattern, index) => (
                  <details key={pattern.id} open={index === 0} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-black text-slate-900">
                      {pattern.title}
                      <span className="ml-2 text-[10px] font-black text-cyan-700">設問{pattern.appliesTo.join('・')}</span>
                    </summary>
                    <div className="grid gap-2 mt-2">
                      <div className="rounded-md bg-rose-50 border border-rose-100 px-2 py-2">
                        <p className="text-[10px] font-black text-rose-700">改善前</p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">{pattern.weak}</p>
                      </div>
                      <div className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-2">
                        <p className="text-[10px] font-black text-emerald-700">改善後</p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">{pattern.strong}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{pattern.why}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3">
            <h3 className="text-xs font-black text-slate-500 mb-3">自己評価</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviewItems.map(([key, label, helper]) => (
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
                  <span className="block text-[10px] font-normal text-slate-500 leading-relaxed">{helper}</span>
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
            <h3 className="text-xs font-black text-slate-500 mb-2">参考答案（公式字数レンジの完成例）</h3>
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
                    これは公式字数レンジ内で書いた論述例の一つです。唯一の正解ではありません。
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
