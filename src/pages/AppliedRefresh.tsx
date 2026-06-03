import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  appliedRefreshDiagnosticQuestions,
  appliedRefreshDetails,
  appliedRefreshFinalQuestions,
  appliedRefreshTopics,
  type AppliedRefreshQuestion,
  type AppliedRefreshTopic,
} from '../data/appliedRefresh'

type Screen = 'diagnostic' | 'refresh' | 'quiz' | 'roadmap'

interface RefreshState {
  diagnosticAnswers: Record<string, number>
  finalAnswers: Record<string, number>
  topicCheckAnswers: Record<string, number>
  completedTopicIds: string[]
  updatedAt?: string
}

const STORAGE_KEY = 'pmap:appliedRefresh:v1'

const EMPTY_STATE: RefreshState = {
  diagnosticAnswers: {},
  finalAnswers: {},
  topicCheckAnswers: {},
  completedTopicIds: [],
}

function loadState(): RefreshState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<RefreshState>
    return {
      diagnosticAnswers: parsed.diagnosticAnswers ?? {},
      finalAnswers: parsed.finalAnswers ?? {},
      topicCheckAnswers: parsed.topicCheckAnswers ?? {},
      completedTopicIds: parsed.completedTopicIds ?? [],
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return EMPTY_STATE
  }
}

function persistState(state: RefreshState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }))
  } catch {
    // This mode is intentionally local-only. If storage fails, the current session still works.
  }
}

function scoreQuestions(questions: AppliedRefreshQuestion[], answers: Record<string, number>): number {
  return questions.reduce((score, question) => (
    answers[question.id] === question.answerIndex ? score + 1 : score
  ), 0)
}

function getWeakTopicIds(questions: AppliedRefreshQuestion[], answers: Record<string, number>): string[] {
  const weakIds = new Set<string>()
  for (const question of questions) {
    if (answers[question.id] !== undefined && answers[question.id] !== question.answerIndex) {
      weakIds.add(question.topicId)
    }
  }
  return Array.from(weakIds)
}

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

// HIGHLIGHT_GROUPS: 2026-05-26 改修
// 旧: 4 グループ × 47 語（rose 警戒語・amber 行動語含む）→ 1 段落あたり 5〜10 語ハイライトで過剰
// 新: 2 グループ × 22 語に絞り込み（本編ノート規約の 2 色＝重要語/構造ラベルに準拠）
//   - emerald: PM 試験識別子（学習導線を示す強い文脈付け）
//   - indigo:  応用情報レベルで覚えるべき固有・技術用語のみ
// 削除した語:
//   - 普通すぎる単語: 要求, 要件, 仕様, 品質, レビュー, テスト, リスク, ベースライン
//   - 警戒語（rose）: 確認不足, 合意不足, 漏れ, 不足, 遅延, 不具合, 障害, 手戻り, 混同, 後工程, リスクが高い
//   - 行動語（amber）: 最初, まず, 必要, 確認, 合意, 分析, 分類, 測定, 承認, 影響, 判断
const HIGHLIGHT_GROUPS = [
  {
    className: 'font-black text-emerald-700 bg-emerald-50 rounded px-0.5',
    terms: ['PM試験', 'PM本編', '午後Ⅰ', '午前Ⅱ', 'PM'],
  },
  {
    className: 'font-black text-indigo-700 bg-indigo-50 rounded px-0.5',
    terms: [
      '非機能要件',
      'ステークホルダ',
      'インシデント管理',
      '問題管理',
      '変更管理',
      'テーラリング',
      'プロダクトバックログ',
      'バックアップ',
      'トランザクション',
      'ロードバランサ',
      'WBS',
      'EVM',
      'RTO',
      'RPO',
      'SLA',
      '認証',
      '認可',
      '監査',
      '請負',
      '準委任',
      '派遣',
    ],
  },
] as const

const HIGHLIGHT_CLASS_BY_TERM = new Map<string, string>(
  HIGHLIGHT_GROUPS.flatMap((group) => group.terms.map((term) => [term, group.className] as [string, string])),
)

const HIGHLIGHT_PATTERN = new RegExp(
  `(${Array.from(HIGHLIGHT_CLASS_BY_TERM.keys())
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})`,
  'g',
)

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(HIGHLIGHT_PATTERN).map((part, index) => {
        const className = HIGHLIGHT_CLASS_BY_TERM.get(part)
        if (!className) return part
        return (
          <span key={`${part}-${index}`} className={className}>
            {part}
          </span>
        )
      })}
    </>
  )
}

function IconSeed() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0C8 13 5 10.5 5 7V4h3c3.5 0 6 2.5 6 6v3Zm0 0c4 0 7-2.5 7-6V4h-3c-3.5 0-6 2.5-6 6" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  )
}

function Stat({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>
    </div>
  )
}

function ChoiceQuestion({
  question,
  selected,
  onSelect,
}: {
  question: AppliedRefreshQuestion
  selected: number | undefined
  onSelect: (choiceIndex: number) => void
}) {
  const answered = selected !== undefined

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <p className="text-sm font-bold text-slate-800 leading-relaxed">{question.prompt}</p>
      <div className="grid gap-2 mt-3">
        {question.choices.map((choice, index) => {
          const isSelected = selected === index
          const isCorrect = answered && index === question.answerIndex
          const isWrong = answered && isSelected && !isCorrect

          return (
            <button
              key={choice}
              type="button"
              onClick={() => onSelect(index)}
              className={cx(
                'text-left rounded-lg border px-3 py-2 text-xs leading-relaxed transition-colors',
                isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-900',
                isWrong && 'border-rose-300 bg-rose-50 text-rose-900',
                !isCorrect && !isWrong && isSelected && 'border-brand bg-brand-light text-brand-dark',
                !isCorrect && !isWrong && !isSelected && 'border-slate-200 bg-white text-slate-700 hover:border-brand hover:bg-brand-light/50',
              )}
            >
              <span className="font-black mr-2">{String.fromCharCode(65 + index)}.</span>
              {choice}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className="text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mt-3 leading-relaxed">
          <span className={cx(
            'font-black rounded px-1 py-0.5 mr-1',
            selected === question.answerIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
          )}>
            {selected === question.answerIndex ? '正解' : '確認ポイント'}
          </span>
          <RichText text={question.explanation} />
        </p>
      )}
    </div>
  )
}

function TopicPill({
  topic,
  active,
  completed,
  weak,
  onClick,
}: {
  topic: AppliedRefreshTopic
  active: boolean
  completed: boolean
  weak: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
        active ? 'border-brand bg-brand-light text-brand-dark' : 'border-slate-200 bg-white hover:border-brand hover:bg-brand-light/50',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cx(
          'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0',
          completed ? 'bg-emerald-500 text-white' : weak ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500',
        )}>
          {completed ? <IconCheck /> : <span className="text-[10px] font-black">{topic.minutes}</span>}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black truncate">{topic.shortTitle}</p>
          <p className="text-[10px] text-slate-400 truncate">{topic.domain}</p>
        </div>
      </div>
      {weak && <p className="text-[10px] text-amber-600 font-bold mt-1">診断で復習推奨</p>}
    </button>
  )
}

export default function AppliedRefresh() {
  const initialState = (() => loadState())()
  // M4 修正: 既存進捗があれば最後に触ったテーマ or 弱点 1 件目を初期 active に。
  // 初回訪問時のみトピック先頭。これにより refresh タブを開いた直後から本文がすぐ読める。
  const initialActiveTopic = (() => {
    const initialWeak = getWeakTopicIds(appliedRefreshDiagnosticQuestions, initialState.diagnosticAnswers)
    if (initialWeak.length > 0) return initialWeak[0]
    return appliedRefreshTopics[0]?.id ?? ''
  })()
  // M4 修正: 既存進捗があれば 2 回目以降の訪問者を弱点復習画面（または quiz）にダイレクト
  const initialScreen: Screen = (() => {
    const hasDiagnostic = Object.keys(initialState.diagnosticAnswers).length > 0
    if (!hasDiagnostic) return 'diagnostic'
    const diagnosticDone =
      Object.keys(initialState.diagnosticAnswers).length === appliedRefreshDiagnosticQuestions.length
    return diagnosticDone ? 'refresh' : 'diagnostic'
  })()
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [state, setState] = useState<RefreshState>(initialState)
  const [activeTopicId, setActiveTopicId] = useState(initialActiveTopic)

  function updateState(updater: (current: RefreshState) => RefreshState) {
    setState((current) => {
      const next = updater(current)
      persistState(next)
      return next
    })
  }

  const activeTopic = appliedRefreshTopics.find((topic) => topic.id === activeTopicId) ?? appliedRefreshTopics[0]
  const diagnosticAnswered = Object.keys(state.diagnosticAnswers).length
  const diagnosticScore = scoreQuestions(appliedRefreshDiagnosticQuestions, state.diagnosticAnswers)
  const diagnosticDone = diagnosticAnswered === appliedRefreshDiagnosticQuestions.length
  const weakTopicIds = useMemo(
    () => getWeakTopicIds(appliedRefreshDiagnosticQuestions, state.diagnosticAnswers),
    [state.diagnosticAnswers],
  )
  const completedSet = useMemo(() => new Set(state.completedTopicIds), [state.completedTopicIds])
  const weakSet = useMemo(() => new Set(weakTopicIds), [weakTopicIds])
  const completedCount = state.completedTopicIds.length
  const finalAnswered = Object.keys(state.finalAnswers).length
  const finalScore = scoreQuestions(appliedRefreshFinalQuestions, state.finalAnswers)
  const activeDetail = appliedRefreshDetails[activeTopic.id]
  const recommendedTopics = diagnosticDone && weakTopicIds.length > 0
    ? appliedRefreshTopics.filter((topic) => weakSet.has(topic.id))
    : appliedRefreshTopics.slice(0, 4)

  function answerDiagnostic(questionId: string, choiceIndex: number) {
    updateState((current) => ({
      ...current,
      diagnosticAnswers: { ...current.diagnosticAnswers, [questionId]: choiceIndex },
    }))
  }

  function answerFinal(questionId: string, choiceIndex: number) {
    updateState((current) => ({
      ...current,
      finalAnswers: { ...current.finalAnswers, [questionId]: choiceIndex },
    }))
  }

  function answerTopicCheck(questionId: string, choiceIndex: number) {
    // M3 修正: topic.check に正解した時点で対象トピックを自動的に completed に追加。
    // 自己申告ボタンを廃止し、客観指標（正誤）で達成度を判定する。
    const question = appliedRefreshTopics
      .map((t) => t.check)
      .find((c) => c.id === questionId)
    const topicId = question?.topicId
    const isCorrect = question ? choiceIndex === question.answerIndex : false
    updateState((current) => {
      const nextTopicCheck = { ...current.topicCheckAnswers, [questionId]: choiceIndex }
      const shouldComplete =
        isCorrect && topicId && !current.completedTopicIds.includes(topicId)
      return {
        ...current,
        topicCheckAnswers: nextTopicCheck,
        completedTopicIds: shouldComplete
          ? [...current.completedTopicIds, topicId]
          : current.completedTopicIds,
      }
    })
  }

  function resetMode() {
    persistState(EMPTY_STATE)
    setState(EMPTY_STATE)
    setActiveTopicId(appliedRefreshTopics[0]?.id ?? '')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-4 space-y-4">
        <section className="bg-emerald-700 text-white rounded-xl px-4 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold bg-white/15 rounded-full px-2.5 py-1 mb-2">
                <IconSeed />
                PM学習の助走モード
              </div>
              <h1 className="text-lg sm:text-xl font-black leading-snug">
                <span className="block">応用情報マネジメント</span>
                <span className="block text-sm sm:text-base font-extrabold text-emerald-100">Re: APから始めるPM対策</span>
              </h1>
              <p className="text-xs text-emerald-50 mt-1 leading-relaxed">
                PM本編に入る前に、応用情報レベルの前提知識だけを短く復習します。
              </p>
            </div>
            <Link
              to="/"
              className="text-[11px] text-emerald-100 hover:text-white border border-white/25 rounded-lg px-2.5 py-1.5 flex-shrink-0"
            >
              ホームへ
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Stat
            label="診断"
            value={`${diagnosticScore}/${appliedRefreshDiagnosticQuestions.length}`}
            helper={`${diagnosticAnswered}問回答済み`}
          />
          <Stat
            label="復習"
            value={`${completedCount}/${appliedRefreshTopics.length}`}
            helper="完了モジュール"
          />
          <Stat
            label="確認"
            value={`${percent(finalScore, appliedRefreshFinalQuestions.length)}%`}
            helper={`${finalAnswered}問回答済み`}
          />
        </section>

        <nav className="grid grid-cols-4 gap-2" aria-label="応用情報マネジメントの画面切替">
          {([
            ['diagnostic', '初回診断'],
            ['refresh', '弱点復習'],
            ['quiz', '確認テスト'],
            ['roadmap', 'ロードマップ'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              className={cx(
                'rounded-lg border px-2 py-2 text-[11px] sm:text-xs font-bold transition-colors',
                screen === id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300',
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {screen === 'diagnostic' && (
          <section className="space-y-3" aria-labelledby="diagnostic-heading">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="diagnostic-heading" className="text-sm font-black text-slate-800">初回診断</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    8問で、PM学習前に戻すべき基礎を見つけます。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    {diagnosticAnswered}/{appliedRefreshDiagnosticQuestions.length}問
                  </span>
                  <button
                    type="button"
                    onClick={resetMode}
                    className="text-[11px] font-bold text-slate-500 border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50"
                  >
                    リセット
                  </button>
                </div>
              </div>
              {diagnosticDone && (
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-xs font-bold text-emerald-800">
                    診断完了: {diagnosticScore}/{appliedRefreshDiagnosticQuestions.length}問正解
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    {weakTopicIds.length > 0
                      ? `まずは ${recommendedTopics.map((topic) => topic.shortTitle).join('、')} を復習しましょう。`
                      : '基礎はかなり整っています。確認テストで軽く仕上げましょう。'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen('refresh')}
                    className="mt-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 py-1.5"
                  >
                    復習へ進む
                  </button>
                </div>
              )}
            </div>
            {appliedRefreshDiagnosticQuestions.map((question) => (
              <ChoiceQuestion
                key={question.id}
                question={question}
                selected={state.diagnosticAnswers[question.id]}
                onSelect={(choiceIndex) => answerDiagnostic(question.id, choiceIndex)}
              />
            ))}
          </section>
        )}

        {screen === 'refresh' && (
          <section className="grid lg:grid-cols-[240px_1fr] gap-3" aria-labelledby="refresh-heading">
            {/* M4 修正: モバイル幅では本文を先頭に置きたいため lg 未満ではトピック一覧を折畳み（details）化 */}
            <div className="space-y-2 lg:order-first">
              <details className="lg:hidden bg-white border border-slate-200 rounded-xl group" open={!activeTopicId}>
                <summary className="px-3 py-3 cursor-pointer flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">弱点別リフレッシュ</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      テーマを切り替えるにはタップ（現在: <span className="text-brand-dark font-bold">{activeTopic.shortTitle}</span>）
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform ml-2">▼</span>
                </summary>
                <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-2 border-t border-slate-100">
                  {appliedRefreshTopics.map((topic) => (
                    <TopicPill
                      key={topic.id}
                      topic={topic}
                      active={activeTopic.id === topic.id}
                      completed={completedSet.has(topic.id)}
                      weak={weakSet.has(topic.id)}
                      onClick={() => {
                        setActiveTopicId(topic.id)
                        // モバイルでは選択後すぐ本文へスクロール
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          requestAnimationFrame(() => {
                            document
                              .getElementById('refresh-topic-article')
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          })
                        }
                      }}
                    />
                  ))}
                </div>
              </details>
              <div className="hidden lg:block bg-white border border-slate-200 rounded-xl px-3 py-3">
                <h2 id="refresh-heading" className="text-sm font-black text-slate-800">弱点別リフレッシュ</h2>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  1テーマ約7〜9分。診断で弱かったテーマには印が付きます。
                </p>
              </div>
              <div className="hidden lg:contents">
                {appliedRefreshTopics.map((topic) => (
                  <TopicPill
                    key={topic.id}
                    topic={topic}
                    active={activeTopic.id === topic.id}
                    completed={completedSet.has(topic.id)}
                    weak={weakSet.has(topic.id)}
                    onClick={() => setActiveTopicId(topic.id)}
                  />
                ))}
              </div>
            </div>

            <article id="refresh-topic-article" className="bg-white border border-slate-200 rounded-xl overflow-hidden lg:order-last">
              <div className="px-4 py-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                    {activeTopic.domain}
                  </span>
                  <span className="text-[11px] text-slate-400">{activeTopic.minutes}分</span>
                  {weakSet.has(activeTopic.id) && (
                    <span className="text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 px-2 py-0.5">
                      復習推奨
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black text-slate-800">{activeTopic.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <RichText text={activeTopic.overview} />
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-0 border-b border-slate-100">
                <div className="px-4 py-4 border-b md:border-b-0 md:border-r border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 mb-2">まず押さえること</h3>
                  <ul className="space-y-2">
                    {activeTopic.keyPoints.map((point) => (
                      <li key={point} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span><RichText text={point} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-4">
                  <h3 className="text-xs font-black text-slate-700 mb-2">PM試験へのつながり</h3>
                  <ul className="space-y-2">
                    {activeTopic.pmBridge.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                        <span className="text-emerald-600 font-black">→</span>
                        <span><RichText text={item} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {activeDetail && (
                <>
                  <div className="px-4 py-4 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-700 mb-3">深掘りノート</h3>
                    <div className="space-y-3">
                      {activeDetail.lessonBlocks.map((block) => (
                        <section key={block.heading} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <h4 className="text-xs font-black text-slate-800">{block.heading}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            <RichText text={block.body} />
                          </p>
                          <ul className="grid sm:grid-cols-3 gap-2 mt-3">
                            {block.bullets.map((bullet) => (
                              <li key={bullet} className="rounded-lg bg-white border border-slate-200 px-2.5 py-2 text-[11px] text-slate-600 leading-relaxed">
                                <RichText text={bullet} />
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1fr_220px] gap-0 border-b border-slate-100">
                    <div className="px-4 py-4 border-b lg:border-b-0 lg:border-r border-slate-100">
                      <h3 className="text-xs font-black text-slate-700 mb-2">典型シナリオ: {activeDetail.scenario.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <RichText text={activeDetail.scenario.situation} />
                      </p>
                      <ul className="space-y-2 mt-3">
                        {activeDetail.scenario.readAsPm.map((item) => (
                          <li key={item} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                            <span className="text-emerald-600 font-black">PM</span>
                            <span><RichText text={item} /></span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-700 leading-relaxed mt-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                        <span className="font-black text-slate-800">最初の一手: </span>
                        <RichText text={activeDetail.scenario.firstAction} />
                      </p>
                    </div>
                    <div className="px-4 py-4">
                      <h3 className="text-xs font-black text-slate-700 mb-2">混同しやすい点</h3>
                      <ul className="space-y-2">
                        {activeDetail.traps.map((trap) => (
                          <li key={trap} className="text-[11px] text-slate-600 leading-relaxed rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-2">
                            <RichText text={trap} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="px-4 py-4 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-700 mb-2">1分ミニ演習</h3>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                      <p className="text-xs font-bold text-amber-900 leading-relaxed">
                        <RichText text={activeDetail.miniDrill.prompt} />
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeDetail.miniDrill.hints.map((hint) => (
                          <span key={hint} className="text-[10px] font-bold rounded-full bg-white border border-amber-200 text-amber-700 px-2 py-0.5">
                            <RichText text={hint} />
                          </span>
                        ))}
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-[11px] font-black text-amber-800">解答例を見る</summary>
                        <p className="text-xs text-amber-900 leading-relaxed mt-2">
                          <RichText text={activeDetail.miniDrill.modelAnswer} />
                        </p>
                      </details>
                    </div>
                  </div>
                </>
              )}

              <div className="px-4 py-4 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-700 mb-2">フラッシュカード</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {activeTopic.flashcards.map((card) => (
                    <details key={card.front} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-bold text-slate-700">
                        <RichText text={card.front} />
                      </summary>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        <RichText text={card.back} />
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 space-y-3">
                <ChoiceQuestion
                  question={activeTopic.check}
                  selected={state.topicCheckAnswers[activeTopic.check.id]}
                  onSelect={(choiceIndex) => answerTopicCheck(activeTopic.check.id, choiceIndex)}
                />
                {/* M3 修正: 自己申告ボタンを廃止し、確認問題の正誤による客観的な達成度表示へ変更 */}
                <div className="flex justify-end">
                  {(() => {
                    const selected = state.topicCheckAnswers[activeTopic.check.id]
                    if (selected === undefined) {
                      return (
                        <span className="text-[11px] text-slate-400 font-bold rounded-lg border border-slate-200 bg-white px-3 py-2">
                          確認問題に挑戦して達成度を更新
                        </span>
                      )
                    }
                    const isCorrect = selected === activeTopic.check.answerIndex
                    if (isCorrect) {
                      return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-black rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2">
                          <IconCheck />
                          このテーマは復習完了（確認問題に正解）
                        </span>
                      )
                    }
                    return (
                      <span className="text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2">
                        確認問題に再挑戦してください
                      </span>
                    )
                  })()}
                </div>
              </div>
            </article>
          </section>
        )}

        {screen === 'quiz' && (
          <section className="space-y-3" aria-labelledby="quiz-heading">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="quiz-heading" className="text-sm font-black text-slate-800">確認テスト</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    復習テーマから10問。PM本編へ進む前の軽い仕上げです。
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800">
                    {finalScore}/{appliedRefreshFinalQuestions.length}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {percent(finalScore, appliedRefreshFinalQuestions.length)}%
                  </p>
                </div>
              </div>
              {finalAnswered === appliedRefreshFinalQuestions.length && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3">
                  {finalScore >= 8
                    ? 'かなり良いです。午前Ⅱ・午後Ⅰへ進む準備は整っています。'
                    : '間違えたテーマだけ、弱点復習でもう一周すると滑らかに本編へ入れます。'}
                </p>
              )}
            </div>
            {appliedRefreshFinalQuestions.map((question) => (
              <ChoiceQuestion
                key={question.id}
                question={question}
                selected={state.finalAnswers[question.id]}
                onSelect={(choiceIndex) => answerFinal(question.id, choiceIndex)}
              />
            ))}
          </section>
        )}

        {screen === 'roadmap' && (() => {
          // M1 修正: 診断結果に応じてロードマップを個別化
          // - 診断未完了: Day1 で診断を促す + 固定 Day2-5
          // - 診断完了 + 弱点なし: Day1 診断完了表示 + Day2 確認テスト直行ルート
          // - 診断完了 + 弱点あり: Day1 診断完了 + 弱点トピックを Day 形式で並べる + 最終 Day で確認テスト
          type RoadmapStep = {
            id: string
            day: string
            title: string
            body: string
            action?: () => void
            actionLabel?: string
            tone: 'pending' | 'done' | 'highlight' | 'final'
          }

          const weakCount = weakTopicIds.length
          const weakTopicsList = appliedRefreshTopics.filter((t) => weakSet.has(t.id))
          const steps: RoadmapStep[] = []

          if (!diagnosticDone) {
            steps.push({
              id: 'day1-diag',
              day: 'Day 1',
              title: '初回診断',
              body: `${diagnosticAnswered}/${appliedRefreshDiagnosticQuestions.length} 問解答済み。残りを解いて弱点を決めます。`,
              action: () => setScreen('diagnostic'),
              actionLabel: '診断を開く',
              tone: 'highlight',
            })
            steps.push({
              id: 'day2-dev',
              day: 'Day 2',
              title: '開発・要件',
              body: '要件定義、開発プロセス、品質を復習。',
              tone: 'pending',
            })
            steps.push({
              id: 'day3-pm',
              day: 'Day 3',
              title: 'PM基礎',
              body: 'WBS、変更管理、リスク、進捗対応を復習。',
              tone: 'pending',
            })
            steps.push({
              id: 'day4-infra',
              day: 'Day 4',
              title: '基盤・運用',
              body: 'セキュリティ、可用性、サービス管理を復習。',
              tone: 'pending',
            })
            steps.push({
              id: 'day5-final',
              day: 'Day 5',
              title: '確認テスト',
              body: '確認テストで仕上げ、午前Ⅱ または 午後Ⅰ へ進む。',
              tone: 'final',
            })
          } else if (weakCount === 0) {
            // 弱点ゼロ短縮ルート
            steps.push({
              id: 'day1-done',
              day: 'Day 1',
              title: '診断完了',
              body: `${diagnosticScore}/${appliedRefreshDiagnosticQuestions.length} 問正解。基礎は整っています。`,
              tone: 'done',
            })
            steps.push({
              id: 'day2-final-fast',
              day: 'Day 2',
              title: '確認テスト',
              body: '弱点が見つからなかったため、確認テストで仕上げてから PM 本編へ進めます。',
              action: () => setScreen('quiz'),
              actionLabel: '確認テストへ',
              tone: 'final',
            })
          } else {
            // 弱点あり個別化ルート
            steps.push({
              id: 'day1-done',
              day: 'Day 1',
              title: '診断完了',
              body: `${diagnosticScore}/${appliedRefreshDiagnosticQuestions.length} 問正解。弱点 ${weakCount} テーマを復習します。`,
              tone: 'done',
            })
            // 弱点トピックを Day 形式で並べる（最大 4 枠まで）
            const displayWeakTopics = weakTopicsList.slice(0, 4)
            displayWeakTopics.forEach((topic, index) => {
              const isCompleted = completedSet.has(topic.id)
              steps.push({
                id: `day${index + 2}-weak-${topic.id}`,
                day: `Day ${index + 2}`,
                title: `${isCompleted ? '✓ ' : ''}${topic.shortTitle}`,
                body: `${topic.domain} / ${topic.minutes} 分${isCompleted ? '・復習完了済' : ''}`,
                action: () => {
                  setActiveTopicId(topic.id)
                  setScreen('refresh')
                },
                actionLabel: isCompleted ? '再復習する' : 'このテーマを復習',
                tone: isCompleted ? 'done' : 'highlight',
              })
            })
            // 4 件超過分は注記
            if (weakTopicsList.length > 4) {
              const more = weakTopicsList.length - 4
              steps.push({
                id: `day-more`,
                day: '+',
                title: `他 ${more} テーマ`,
                body: '弱点復習タブから個別に開けます。',
                action: () => setScreen('refresh'),
                actionLabel: '弱点復習へ',
                tone: 'pending',
              })
            }
            steps.push({
              id: 'day-final',
              day: `Day ${Math.min(displayWeakTopics.length + 2, 6)}`,
              title: '確認テスト',
              body: '弱点復習が一通り終わったら、別問題の確認テストで定着を確認。',
              action: () => setScreen('quiz'),
              actionLabel: '確認テストへ',
              tone: 'final',
            })
          }

          const headlineText = !diagnosticDone
            ? '診断 → 弱点復習 → 確認テストの順に進めます'
            : weakCount === 0
              ? '基礎が整っています。確認テストで仕上げて PM 本編へ。'
              : `あなたの弱点 ${weakCount} テーマを順番に復習する個別ロードマップです`

          return (
            <section className="bg-white border border-slate-200 rounded-xl px-4 py-4" aria-labelledby="roadmap-heading">
              <h2 id="roadmap-heading" className="text-sm font-black text-slate-800">
                {!diagnosticDone ? 'PM本編へ戻るロードマップ' : 'あなた向けロードマップ'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{headlineText}</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                {steps.map((step) => {
                  const toneClasses: Record<RoadmapStep['tone'], string> = {
                    pending: 'border-slate-200 bg-slate-50',
                    done: 'border-emerald-200 bg-emerald-50',
                    highlight: 'border-amber-200 bg-amber-50',
                    final: 'border-brand bg-brand-light/30',
                  }
                  const dayColor: Record<RoadmapStep['tone'], string> = {
                    pending: 'text-slate-500',
                    done: 'text-emerald-600',
                    highlight: 'text-amber-700',
                    final: 'text-brand-dark',
                  }
                  return (
                    <div
                      key={step.id}
                      className={cx(
                        'rounded-xl border px-3 py-3 flex flex-col gap-1',
                        toneClasses[step.tone],
                      )}
                    >
                      <p className={cx('text-[10px] font-black', dayColor[step.tone])}>{step.day}</p>
                      <p className="text-xs font-black text-slate-800">{step.title}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{step.body}</p>
                      {step.action && (
                        <button
                          type="button"
                          onClick={step.action}
                          className="mt-1 text-[11px] font-bold rounded-md bg-white border border-slate-200 text-slate-700 px-2 py-1 hover:bg-slate-100 self-start"
                        >
                          {step.actionLabel} →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {!diagnosticDone ? (
                  <button
                    type="button"
                    onClick={() => setScreen('diagnostic')}
                    className="text-xs font-bold rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700"
                  >
                    診断から始める
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScreen('refresh')}
                    className="text-xs font-bold rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700"
                  >
                    弱点復習を開く
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setScreen('quiz')}
                  className="text-xs font-bold rounded-lg border border-slate-200 text-slate-600 px-3 py-2 hover:bg-slate-50"
                >
                  確認テストを開く
                </button>
              </div>
            </section>
          )
        })()}
      </div>
    </div>
  )
}
