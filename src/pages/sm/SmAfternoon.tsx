import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calculator, ClipboardCheck, Layers, TimerReset } from 'lucide-react'
import { smAfternoonProblems, smEvidenceDrills, smFrequentThemes } from '../../data/sm/content'
import { addSmAfternoonRecord, deleteSmAfternoonRecord, loadSmAfternoonRecords } from '../../lib/sm/progress'
import { FrequencyBadge, SmPageChrome, SourceLinks } from './SmPageChrome'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const rubricItems = [
  ['reading', '本文条件を解答に使えた', '数値、役割、制約、時系列を解答に使えている。'],
  ['cause', '原因・根拠が明確', '本文の根拠から、なぜその解答になるかを説明できている。'],
  ['answer', '設問要求に合う', '問われた対象、粒度、語尾に合わせて答えている。'],
  ['terms', 'SM用語が正確', 'SLA、インシデント、問題、変更、供給者などを混同していない。'],
  ['review', '再発防止まで見える', '単発対応で終わらず、改善・管理・確認に落とせている。'],
] as const

type RubricState = Record<(typeof rubricItems)[number][0], number>

type AfternoonDraft = {
  answerMemo: string
  reflection: string
  score: string
  rubric: RubricState
}

function emptyRubric(): RubricState {
  return {
    reading: 0,
    cause: 0,
    answer: 0,
    terms: 0,
    review: 0,
  }
}

function emptyDraft(): AfternoonDraft {
  return {
    answerMemo: '',
    reflection: '',
    score: '',
    rubric: emptyRubric(),
  }
}

export default function SmAfternoon() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedProblemId = searchParams.get('problem')
  const initialProblemId = smAfternoonProblems.some((problem) => problem.id === requestedProblemId)
    ? requestedProblemId ?? ''
    : smAfternoonProblems[0]?.id ?? ''
  const [selectedId, setSelectedId] = useState(initialProblemId)
  const [records, setRecords] = useState(() => loadSmAfternoonRecords())
  const [answerMemo, setAnswerMemo] = useState('')
  const [reflection, setReflection] = useState('')
  const [score, setScore] = useState('')
  const [mockSelection, setMockSelection] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, AfternoonDraft>>({})
  const [rubric, setRubric] = useState<RubricState>(() => emptyRubric())
  const selected = smAfternoonProblems.find((problem) => problem.id === selectedId) ?? smAfternoonProblems[0]
  const rubricScore = rubricItems.reduce((sum, [key]) => sum + rubric[key], 0)
  const selectedMockProblems = smAfternoonProblems.filter((problem) => mockSelection[problem.id])

  const problemRecords = useMemo(
    () => records.filter((record) => record.problemId === selected.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [records, selected.id],
  )

  const selectProblem = (id: string) => {
    if (id === selected.id) return
    setDrafts((current) => ({
      ...current,
      [selected.id]: { answerMemo, reflection, score, rubric },
    }))
    const nextDraft = drafts[id] ?? emptyDraft()
    setSelectedId(id)
    setAnswerMemo(nextDraft.answerMemo)
    setReflection(nextDraft.reflection)
    setScore(nextDraft.score)
    setRubric(nextDraft.rubric)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('problem', id)
    setSearchParams(nextParams, { replace: true })
  }

  const save = () => {
    if (!answerMemo.trim()) {
      alert('自分の解答メモを入力してから記録してください。')
      return
    }
    if (!score.trim()) {
      alert('自己採点した点数を入力してください。')
      return
    }
    const parsed = Number(score)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 50) {
      alert('点数は0〜50で入力してください。')
      return
    }
    addSmAfternoonRecord({
      problemId: selected.id,
      score: parsed,
      answerMemo,
      reflection,
    })
    setRecords(loadSmAfternoonRecords())
    setAnswerMemo('')
    setReflection('')
    setScore('')
    setRubric(emptyRubric())
    setDrafts((current) => {
      const next = { ...current }
      delete next[selected.id]
      return next
    })
  }

  return (
    <SmPageChrome
      title="午後Ⅰ演習"
      description="令和7年度春期の午後Ⅰ3問を、2問選択の判断、解答メモ、採点ポイント、振り返りまで一画面で復習します。"
    >
      <section className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-3">
        <div className="flex items-start gap-2">
          <TimerReset className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-slate-900">本番は90分で3問から2問を選ぶ</h2>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              3問すべてを練習素材として使いながら、本番では最初の5分で2問を選び、1問40分前後で解く前提で判断します。得意テーマ、設問量、本文の読みやすさで選択を決めます。
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {smAfternoonProblems.map((problem) => (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => setMockSelection((current) => ({ ...current, [problem.id]: !current[problem.id] }))}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    mockSelection[problem.id]
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-white border-cyan-200 text-cyan-800 hover:bg-cyan-50'
                  }`}
                >
                  問{problem.number}
                </button>
              ))}
            </div>
            <p className={`text-[11px] leading-relaxed mt-2 ${selectedMockProblems.length === 2 ? 'text-emerald-700' : 'text-amber-700'}`}>
              選択中: {selectedMockProblems.length > 0 ? selectedMockProblems.map((problem) => `問${problem.number}`).join('・') : 'なし'}。
              {selectedMockProblems.length === 2 ? 'この2問で90分リハーサルに入れます。' : '本番想定では2問に絞ります。'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
        <aside className="space-y-2">
          {smAfternoonProblems.map((problem) => {
            const latest = records
              .filter((record) => record.problemId === problem.id)
              .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
            return (
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
                <p className="text-[11px] text-slate-500 mt-1">{latest ? `最新 ${latest.score}/50点` : '未記録'}</p>
              </button>
            )
          })}
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
            <p className="text-sm text-slate-700 leading-relaxed mt-2">{selected.purpose}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{selected.evidenceNote}</p>
            <div className="mt-3">
              <SourceLinks {...selected.source} />
            </div>
          </div>

          <section>
            <h3 className="text-xs font-black text-slate-500 mb-2">自分の解答メモ</h3>
            <textarea
              value={answerMemo}
              onChange={(event) => setAnswerMemo(event.target.value)}
              rows={7}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="PDFを見ながら、設問ごとの自分の解答をここにまとめる。"
            />
          </section>

          <section className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-700" />
                  <h3 className="text-xs font-black text-cyan-900">採点メーター</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  5観点を10点ずつで見て、50点満点の記録に反映できます。点数は自動では保存されません。
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{rubricScore}/50</p>
                <button
                  type="button"
                  onClick={() => setScore(String(rubricScore))}
                  className="text-[11px] font-bold text-cyan-700 hover:underline"
                >
                  この点数を使う
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rubricItems.map(([key, label, helper]) => (
                <label key={key} className="text-xs font-bold text-slate-700">
                  <span className="flex items-center justify-between gap-2">
                    {label}
                    <span>{rubric[key]}/10</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={rubric[key]}
                    onChange={(event) => setRubric((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                    className="w-full"
                  />
                  <span className="block text-[10px] font-normal text-slate-500 leading-relaxed">{helper}</span>
                </label>
              ))}
            </div>
            <Link to="/it-service-manager/report" className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:underline mt-3">
              <ClipboardCheck className="w-3.5 h-3.5" />
              記録後に仕上げレポートで確認
            </Link>
            <Link to="/it-service-manager/cases" className="ml-3 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:underline mt-3">
              <Layers className="w-3.5 h-3.5" />
              根拠ドリルを見る（{smEvidenceDrills.length}本）
            </Link>
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-500 mb-2">公式解答例と設問別の採点要素</h3>
            <div className="grid gap-2">
              {selected.answerItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-black text-cyan-700">{item.label}</p>
                  <p className="text-sm text-slate-800 leading-relaxed mt-1">{item.answer}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">採点要素: {item.point}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-500 mb-2">採点講評からの注意</h3>
              <ul className="space-y-1">
                {selected.commentary.map((item) => (
                  <li key={item} className="text-xs text-slate-700 leading-relaxed rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-500 mb-2">失点しやすい罠</h3>
              <ul className="space-y-1">
                {selected.traps.map((item) => (
                  <li key={item} className="text-xs text-slate-700 leading-relaxed rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <h3 className="text-xs font-black text-slate-500 mb-2">50点満点で記録</h3>
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-2">
              <input
                type="number"
                min={0}
                max={50}
                value={score}
                onChange={(event) => setScore(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="点数"
              />
              <input
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="振り返り（例: 設問3の根拠が不足している）"
              />
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-black text-white hover:bg-cyan-700"
              >
                記録
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">記録日: {today()} / この問の振り返りに残ります。</p>
          </section>

          {problemRecords.length > 0 && (
            <section>
              <h3 className="text-xs font-black text-slate-500 mb-2">この問の記録</h3>
              <div className="grid gap-1">
                {problemRecords.map((record) => (
                  <div key={record.id} className="rounded-lg border border-slate-100 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{record.score}/50点</p>
                        <p className="text-[11px] text-slate-500">{record.reflection || record.recordedAt.slice(0, 10)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          deleteSmAfternoonRecord(record.id)
                          setRecords(loadSmAfternoonRecords())
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                    {record.answerMemo && (
                      <details className="mt-2 rounded-md bg-slate-50 border border-slate-100 px-2 py-2">
                        <summary className="cursor-pointer text-[11px] font-black text-slate-600">保存した自分の解答メモ</summary>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mt-2">{record.answerMemo}</p>
                      </details>
                    )}
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
