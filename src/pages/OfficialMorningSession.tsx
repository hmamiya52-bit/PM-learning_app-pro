import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { officialMorningQuestions } from '../data/officialMorningQuestions'
import type { OfficialMorningQuestion } from '../types'
import { QuestionFigureView } from '../components/QuestionFigureView'
import { addMorningRecord } from '../lib/morningRecords'
import { applyAnswer } from '../lib/gamification'
import { addActivityEvent, upsertQuizSessionEvent } from '../lib/activityLog'
import { isImportant as isImportantMark } from '../lib/importantMarks'
import ImportantToggle from '../components/ImportantToggle'
import BadgeUnlockToast from '../components/gamification/BadgeUnlockToast'
import MathText from '../components/MathText'
import { getMorningFontSize, setMorningFontSize, type FontSize } from '../lib/preferences'
import type { BadgeDefinition } from '../data/badges'

/**
 * 公式午前II 出題画面（没入型、/morning/session）
 *
 * 設計書 v0.15 §2.5 / §7 に基づく:
 * - location.state.questionIds から問題リストを復元
 * - 4択選択 → 即時正誤判定 → 独自解説表示 → 次の問題へ
 * - 各問題で ImportantToggle ☆ を表示
 * - 全問終了で /morning/summary へ navigate
 *
 * 直接 URL アクセスや state 喪失時はトップへリダイレクト。
 */

const ANSWER_LABELS = ['ア', 'イ', 'ウ', 'エ'] as const
const DISPLAY_LABELS = ['①', '②', '③', '④'] as const

interface SessionLog {
  question: OfficialMorningQuestion
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
}

interface LocationState {
  questionIds?: string[]
  scope?: 'random' | 'year' | 'important' | 'single' | 'category'
  yearLabel?: string
}

function findQuestion(id: string): OfficialMorningQuestion | undefined {
  return officialMorningQuestions.find((q) => q.id === id)
}

export default function OfficialMorningSession() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  // 問題リストを復元
  const questionList = useMemo<OfficialMorningQuestion[]>(() => {
    if (!state.questionIds) return []
    return state.questionIds
      .map(findQuestion)
      .filter((q): q is OfficialMorningQuestion => q !== undefined)
  }, [state.questionIds])

  // session 管理用 ref
  const sessionId = useRef(crypto.randomUUID())
  const sessionStartedAt = useRef('')
  const sessionXpRef = useRef(0)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [logs, setLogs] = useState<SessionLog[]>([])
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | 2 | 3 | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [lastXpGained, setLastXpGained] = useState(0)
  const [pendingBadges, setPendingBadges] = useState<BadgeDefinition[]>([])
  // ★デバッグモード（正式版 v1.0.0 では削除予定 / detailed_design §2.7e.x 参照）
  //   - 解説を常時表示（選択肢クリック不要）
  //   - 問題の前後ナビゲーションを表示
  //   - 解答記録（addMorningRecord / applyAnswer / addActivityEvent）に書き込まない
  //   - URL クエリ ?debug=1 で起動時 ON も可能
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('debug') === '1'
  })
  // 文字サイズ設定（端末ローカル、LocalStorage 永続化）
  const [fontSize, setFontSize] = useState<FontSize>(() => getMorningFontSize())
  const toggleFontSize = () => {
    const next: FontSize = fontSize === 'compact' ? 'comfortable' : 'compact'
    setFontSize(next)
    setMorningFontSize(next)
  }
  const textClass = fontSize === 'comfortable' ? 'text-base' : 'text-[13px]'

  const currentQuestion = questionList[currentIndex]
  const isLast = currentIndex === questionList.length - 1
  const isCorrect = selectedIndex !== null && currentQuestion && selectedIndex === currentQuestion.correctIndex

  // ★F1-P4 ユーザフィードバック対応: 4択の表示順をランダムにシャッフル
  //   {originalIndex} を保持しておくことで、データ側の correctIndex（元の choices 配列）と
  //   selectedIndex を整合させたまま、画面上の並びだけランダム化する。
  //   useMemo の依存は currentQuestion.id のみ（同じ問題内でのリレンダーでは固定）。
  const shuffledChoices = useMemo(() => {
    if (!currentQuestion) return [] as { originalIndex: 0 | 1 | 2 | 3; text: string }[]
    const indexed = currentQuestion.choices.map((text, i) => ({
      originalIndex: i as 0 | 1 | 2 | 3,
      text,
    }))
    // Fisher–Yates シャッフル
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]]
    }
    return indexed
  }, [currentQuestion?.id])  // eslint-disable-line react-hooks/exhaustive-deps

  // セッション初期化（初回マウント時のみ）
  useEffect(() => {
    if (!sessionStartedAt.current) {
      sessionStartedAt.current = new Date().toISOString()
    }
  }, [])

  // state 喪失時の防御リダイレクト
  useEffect(() => {
    if (!state.questionIds || questionList.length === 0) {
      navigate('/morning', { replace: true })
    }
  }, [state.questionIds, questionList.length, navigate])

  const handleSelect = useCallback(
    (idx: 0 | 1 | 2 | 3) => {
      if (showExplanation || !currentQuestion) return
      const correct = idx === currentQuestion.correctIndex

      // ★デバッグモード: 解答記録・XP加算・バッジ判定をすべてスキップ
      if (debugMode) {
        setSelectedIndex(idx)
        setShowExplanation(true)
        return
      }

      // 記録保存
      addMorningRecord({
        questionId: currentQuestion.id,
        selectedIndex: idx,
        isCorrect: correct,
      })

      // XP 加算（applyAnswer、mode='morning'）
      const gr = applyAnswer({
        questionId: currentQuestion.id,
        topicId: currentQuestion.categoryId ?? '',
        isCorrect: correct,
        mode: 'morning',
        isImportant: isImportantMark(currentQuestion.id),
        difficulty: 1,  // 公式午前IIには difficulty 概念なし、ダミー1（calcXp で morning は difficulty ボーナススキップ）
      })
      setLastXpGained(gr.xpGained)
      sessionXpRef.current += gr.xpGained

      if (gr.newBadges.length > 0) {
        setPendingBadges((prev) => [...prev, ...gr.newBadges])
        const now = new Date()
        for (const badge of gr.newBadges) {
          addActivityEvent({
            type: 'badge-unlock',
            date: now.toISOString().slice(0, 10),
            createdAt: now.toISOString(),
            xp: badge.xpBonus,
            payload: { badgeId: badge.id, badgeName: badge.name, tier: badge.tier },
          })
        }
      }

      setSelectedIndex(idx)
      setShowExplanation(true)
    },
    [currentQuestion, showExplanation, debugMode],
  )

  // ★デバッグモード: 問題切替時に解説を自動表示
  useEffect(() => {
    if (debugMode && currentQuestion) {
      setShowExplanation(true)
      setSelectedIndex(currentQuestion.correctIndex)  // 正解を選択した状態にして解説の正誤判定を「正解」として表示
    }
  }, [debugMode, currentQuestion])

  // ★デバッグモード: 前後ナビゲーション（解答記録なし、進捗カウントなし）
  const handleDebugPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setSelectedIndex(null)
      setShowExplanation(false)
      setLastXpGained(0)
    }
  }, [currentIndex])

  const handleDebugNext = useCallback(() => {
    if (currentIndex < questionList.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedIndex(null)
      setShowExplanation(false)
      setLastXpGained(0)
    }
  }, [currentIndex, questionList.length])

  // ★デバッグモード ON/OFF 切替
  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => {
      const next = !prev
      if (!next) {
        // OFF にしたら表示をリセット（次に選択肢を押すまで解説非表示）
        setShowExplanation(false)
        setSelectedIndex(null)
      }
      return next
    })
  }, [])

  const handleNext = useCallback(() => {
    if (!currentQuestion || selectedIndex === null) return

    // ★デバッグモード: 記録せず単に次へ進む（最後なら何もしない）
    if (debugMode) {
      if (currentIndex < questionList.length - 1) {
        handleDebugNext()
      }
      return
    }

    const newLog: SessionLog = {
      question: currentQuestion,
      selectedIndex,
      isCorrect: !!isCorrect,
    }
    const newLogs = [...logs, newLog]
    setLogs(newLogs)

    // 1問ごとに upsert（途中離脱でも記録が残る、設計書 §3.7 XP発生源単一化に従い表示用 xp 渡す）
    const correctCount = newLogs.filter((l) => l.isCorrect).length
    upsertQuizSessionEvent(sessionId.current, {
      mode: 'random',  // 互換用、実際の scope は state.scope
      categoryId: null,
      categoryName: state.yearLabel ? `公式午前II ${state.yearLabel}` : '公式午前II',
      questionCount: newLogs.length,
      correctCount,
      answerMode: 'multiple-choice',
      xp: sessionXpRef.current,
    })

    if (isLast) {
      // セッション完了 → morning-session イベント記録 → サマリーへ
      const now = new Date()
      addActivityEvent({
        type: 'morning-session',
        date: now.toISOString().slice(0, 10),
        createdAt: now.toISOString(),
        xp: sessionXpRef.current,
        payload: {
          sessionId: sessionId.current,
          scope: state.scope ?? 'random',
          yearLabel: state.yearLabel,
          questionCount: newLogs.length,
          correctCount,
        },
      })
      navigate('/morning/summary', {
        state: {
          logs: newLogs.map((l) => ({
            questionId: l.question.id,
            selectedIndex: l.selectedIndex,
            isCorrect: l.isCorrect,
          })),
          scope: state.scope,
          yearLabel: state.yearLabel,
        },
        replace: true,
      })
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedIndex(null)
      setShowExplanation(false)
      setLastXpGained(0)
    }
  }, [currentQuestion, selectedIndex, isCorrect, logs, isLast, navigate, state.scope, state.yearLabel, debugMode, currentIndex, questionList.length, handleDebugNext])

  if (!currentQuestion) {
    return null  // リダイレクト処理中
  }

  const progress = ((currentIndex + 1) / questionList.length) * 100

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* ヘッダー（没入型: brand 色、Layout ヘッダー h-12 の下に sticky） */}
      <header className="bg-brand text-white shadow-lg sticky top-12 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/morning')}
            className="p-2 rounded-lg hover:bg-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0"
            aria-label="トップへ戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">
              公式午前II {state.yearLabel ?? ''}
              {debugMode && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-yellow-900 align-middle">DEBUG</span>}
            </p>
            <p className="text-white/80 text-xs">{questionList.length} 問</p>
          </div>
          {/* ★デバッグモードトグル（正式版 v1.0.0 で削除） */}
          <button
            onClick={toggleDebugMode}
            className={`flex-shrink-0 px-2 py-1 rounded text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              debugMode
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                : 'bg-brand-dark text-white/80 hover:bg-brand-dark/80'
            }`}
            title="デバッグモード（解説常時表示・記録なし）"
            aria-pressed={debugMode}
          >
            🐛 DEBUG
          </button>
          <span className="flex-shrink-0 text-xs bg-brand-dark text-white/90 rounded-full px-2.5 py-1">
            {currentIndex + 1} / {questionList.length}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">

        {/* 進捗バー + 重要マーク */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">問題 {currentIndex + 1}</span>
            <ImportantToggle questionId={currentQuestion.id} size="sm" />
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ★デバッグモード: 問題上に前後ナビ（記録に影響しない） */}
        {debugMode && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-300">
            <button
              onClick={handleDebugPrev}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-yellow-300 text-sm font-bold text-yellow-900 hover:bg-yellow-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← 前へ
            </button>
            <span className="flex-1 text-center text-xs text-yellow-800 font-medium">
              DEBUG: 解説常時表示・記録なし
            </span>
            <button
              onClick={handleDebugNext}
              disabled={currentIndex >= questionList.length - 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-yellow-300 text-sm font-bold text-yellow-900 hover:bg-yellow-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              次へ →
            </button>
          </div>
        )}

        {/* 問題文 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-[11px] text-slate-400 flex-1 min-w-0 break-keep">
              出典：{currentQuestion.yearLabel} プロジェクトマネージャ試験 午前II 問{currentQuestion.number}
            </p>
            <button
              type="button"
              onClick={toggleFontSize}
              className="flex-shrink-0 inline-flex items-baseline gap-0.5 px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:border-brand hover:text-brand transition-colors"
              title={`文字サイズ: ${fontSize === 'compact' ? '標準（クリックで大きく）' : '大（クリックで標準に）'}`}
              aria-label="文字サイズ切替"
            >
              <span className="text-[10px] leading-none">A</span>
              <span className="text-[14px] leading-none font-bold">A</span>
            </button>
          </div>
          <p className={`${textClass} text-slate-800 leading-relaxed whitespace-pre-wrap`}>
            <MathText text={currentQuestion.questionText} />
          </p>
          {currentQuestion.figure && <QuestionFigureView figure={currentQuestion.figure} />}
        </div>

        {/* 4択（シャッフル後の表示順） */}
        <div className="flex flex-col gap-3" role="group" aria-label="選択肢">
          {shuffledChoices.map((choice, displayIdx) => {
            const originalIdx = choice.originalIndex
            const isSelected = selectedIndex === originalIdx
            const isAnswer = originalIdx === currentQuestion.correctIndex
            const showCorrectness = showExplanation
            let buttonClass = 'bg-white border-2 border-slate-200 hover:border-brand hover:bg-brand-light/30'
            if (showCorrectness && isSelected && isCorrect) buttonClass = 'bg-emerald-50 border-2 border-emerald-500'
            else if (showCorrectness && isSelected && !isCorrect) buttonClass = 'bg-red-50 border-2 border-red-500'
            else if (showCorrectness && isAnswer && !isSelected) buttonClass = 'bg-emerald-50 border-2 border-emerald-400'
            return (
              <button
                key={originalIdx}
                onClick={() => handleSelect(originalIdx)}
                disabled={showExplanation}
                className={`w-full text-left rounded-xl px-3.5 py-3 ${textClass} text-slate-700 font-medium leading-relaxed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-default ${buttonClass}`}
              >
                <span className="inline-block text-xs font-bold text-brand-dark mr-2">
                  {showExplanation ? ANSWER_LABELS[originalIdx] : DISPLAY_LABELS[displayIdx]}.
                </span>
                <MathText text={choice.text} />
              </button>
            )
          })}
        </div>

        {/* 正誤判定 + 解説 */}
        {showExplanation && (
          <div className="mt-5 space-y-3">
            {/* 正誤判定ブロック（デバッグモード時は非表示） */}
            {!debugMode && (
              <div
                className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                  isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
                  <p className={`text-sm font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isCorrect ? '正解！' : '不正解'}
                    {!isCorrect && selectedIndex !== null && (
                      <span className="text-xs font-normal ml-2 text-slate-500">
                        あなたの解答: {ANSWER_LABELS[selectedIndex]} / 正解: {ANSWER_LABELS[currentQuestion.correctIndex]}
                      </span>
                    )}
                  </p>
                </div>
                {lastXpGained > 0 && (
                  <span className="text-xs font-bold text-amber-600">+{lastXpGained} XP</span>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                解説{debugMode && <span className="ml-2 text-yellow-700">（DEBUG: 正解=={ANSWER_LABELS[currentQuestion.correctIndex]}）</span>}
              </p>
              <p className={`${textClass} text-slate-700 leading-relaxed whitespace-pre-wrap`}>
                <MathText text={currentQuestion.explanation} />
              </p>
            </div>

            {/* 次の問題へボタン（デバッグモード時は非表示、前後ナビで移動） */}
            {!debugMode && (
              <button
                onClick={handleNext}
                className="w-full bg-brand text-white font-bold rounded-xl py-3.5 hover:bg-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {isLast ? 'サマリーへ' : '次の問題へ →'}
              </button>
            )}
          </div>
        )}
      </main>

      {pendingBadges.length > 0 && (
        <BadgeUnlockToast
          badges={pendingBadges}
          onDone={() => setPendingBadges([])}
        />
      )}
    </div>
  )
}
