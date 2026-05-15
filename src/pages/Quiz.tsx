import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { questions as allQuestions } from '../data/questions'
import { categories } from '../data/categories'
import { addAnswerRecord, getAllProgress, saveStudySession, updateProgress, updateQuestionMastery } from '../lib/storage'
import type { Question, StudySession } from '../types'
import ModeSelect from '../components/quiz/ModeSelect'
import { NOTE_CATEGORY_IDS } from './NoteDetail'
import QuizQuestion from '../components/quiz/QuizQuestion'
import ResultMultipleChoice from '../components/quiz/ResultMultipleChoice'
import ResultWritten from '../components/quiz/ResultWritten'
import QuizSummary from './QuizSummary'
import { applyAnswer } from '../lib/gamification'  // F1-P-1 D-LIB-01 リネーム
import BadgeUnlockToast from '../components/gamification/BadgeUnlockToast'
import type { BadgeDefinition } from '../data/badges'
import { addActivityEvent, upsertQuizSessionEvent } from '../lib/activityLog'
import { getImportantIds, isImportant as isImportantMark } from '../lib/importantMarks'

type Phase = 'mode-select' | 'question' | 'result-mc' | 'result-wr' | 'summary'
type AnswerMode = 'multiple-choice' | 'written'

interface AnswerLog {
  question: Question
  userAnswer: string
  isCorrect: boolean
  mode: AnswerMode
}

// ---------- 問題フィルタリング ----------
function filterQuestions(
  mode: string | null,
  categoryId: string | null,
  onlyImportant: boolean = false,
): Question[] {
  let pool: Question[]
  if (mode === 'topic' && categoryId) {
    pool = allQuestions.filter((q) => q.topicId === categoryId)
  } else if (mode === 'weakness') {
    const progress = getAllProgress()
    const rateMap = new Map(
      progress.map((p) => [
        p.topicId,
        p.totalAttempts > 0 ? p.correctCount / p.totalAttempts : 0,
      ])
    )
    // 正答率 60% 未満 or 未学習（totalAttempts=0）の問題
    pool = allQuestions.filter((q) => {
      const rate = rateMap.get(q.topicId)
      return rate === undefined || rate < 0.6
    })
  } else if (mode === 'important') {
    // ★F1-P2: 重要マークモード — ユーザがマーク済みのクイズ問題（q-* 接頭辞）のみ
    const importantIds = new Set(
      getImportantIds().filter((id) => id.startsWith('q-')),
    )
    pool = allQuestions.filter((q) => importantIds.has(q.id))
  } else {
    // random: 全問シャッフル
    pool = [...allQuestions].sort(() => Math.random() - 0.5)
  }
  if (onlyImportant) {
    // ★F1-P2: 静的フラグから動的マーク参照へ
    const importantIds = new Set(
      getImportantIds().filter((id) => id.startsWith('q-')),
    )
    pool = pool.filter((q) => importantIds.has(q.id))
  }
  return pool
}

function modeLabel(mode: string | null): string {
  switch (mode) {
    case 'weakness': return '弱点克服モード'
    case 'random': return 'ランダム出題'
    case 'important': return '重要問題モード'  // ★F1-P2
    case 'topic': return 'カテゴリ別学習'
    default: return '学習'
  }
}

// ---------- コンポーネント ----------
export default function Quiz() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode')
  const categoryId = searchParams.get('category')

  // セッションID（リトライのたびに更新）
  const sessionId = useRef(crypto.randomUUID())
  // セッション中の累積 XP（セッション完了時に activityLog へ記録）
  const sessionXpRef = useRef(0)

  // セッション開始時刻（完了時に上書きしないよう ref で保持）
  const sessionStartedAt = useRef('')

  // 再挑戦用問題リスト（nullの場合は通常フィルタリング）
  const [retryList, setRetryList] = useState<Question[] | null>(null)

  // 解答モード選択画面で「重要問題のみを出題」が ON か
  const [onlyImportant, setOnlyImportant] = useState(false)

  const [phase, setPhase] = useState<Phase>('mode-select')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('multiple-choice')

  // 問題リスト（retryListがあればそちらを優先）
  const baseList = useMemo(
    () => filterQuestions(mode, categoryId, onlyImportant),
    [mode, categoryId, onlyImportant]
  )
  // 答えモードに応じて記述非対応問題を除外
  const questionList = useMemo(() => {
    const src = retryList ?? baseList
    if (answerMode === 'written') {
      return src.filter((q) => !q.excludeFromWritten)
    }
    return src
  }, [retryList, baseList, answerMode])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [logs, setLogs] = useState<AnswerLog[]>([])
  const [lastSelected, setLastSelected] = useState('')
  const [lastWritten, setLastWritten] = useState('')
  const [lastIsCorrect, setLastIsCorrect] = useState(false)
  const [autoCorrect, setAutoCorrect] = useState(false)
  const [lastXpGained, setLastXpGained] = useState(0)
  const [pendingBadges, setPendingBadges] = useState<BadgeDefinition[]>([])

  // セッション開始（sessionIdが変わるたびにリセット）
  const startedSessionId = useRef('')
  useEffect(() => {
    if (phase === 'question' && startedSessionId.current !== sessionId.current) {
      startedSessionId.current = sessionId.current
      sessionStartedAt.current = new Date().toISOString()
      sessionXpRef.current = 0
      const session: StudySession = {
        id: sessionId.current,
        startedAt: sessionStartedAt.current,
        endedAt: null,
        mode: (mode as StudySession['mode']) ?? 'random',
        categoryId: categoryId,
        questionCount: questionList.length,
        correctCount: 0,
      }
      saveStudySession(session)
    }
  }, [phase, mode, categoryId, questionList.length])

  const currentQuestion = questionList[currentIndex]
  const isLast = currentIndex === questionList.length - 1

  // ---------- 解答ハンドラ（4択）----------
  const handleAnswerMC = useCallback(
    (selected: string) => {
      const isCorrect = selected === currentQuestion.correctAnswer
      setLastSelected(selected)
      setLastIsCorrect(isCorrect)
      addAnswerRecord({
        id: crypto.randomUUID(),
        questionId: currentQuestion.id,
        mode: 'multiple-choice',
        isCorrect,
        userAnswer: selected,
        answeredAt: new Date().toISOString(),
      })
      updateProgress(currentQuestion.topicId, isCorrect, 'multiple-choice')
      updateQuestionMastery(currentQuestion.id, 'multiple-choice', isCorrect)
      const gr = applyAnswer({
        questionId: currentQuestion.id,
        topicId: currentQuestion.topicId,
        isCorrect,
        mode: 'multiple-choice',
        isImportant: isImportantMark(currentQuestion.id),  // ★F1-P2 動的取得
        difficulty: currentQuestion.difficulty,
      })
      setLastXpGained(gr.xpGained)
      sessionXpRef.current += gr.xpGained
      if (gr.newBadges.length > 0) {
        setPendingBadges((prev) => [...prev, ...gr.newBadges])
        const now = new Date()
        for (const badge of gr.newBadges) {
          addActivityEvent({ type: 'badge-unlock', date: now.toISOString().slice(0, 10), createdAt: now.toISOString(), xp: badge.xpBonus, payload: { badgeId: badge.id, badgeName: badge.name, tier: badge.tier } })
        }
      }
      setPhase('result-mc')
    },
    [currentQuestion]
  )

  // ---------- 解答ハンドラ（記述）----------
  const handleAnswerWritten = useCallback(
    (written: string) => {
      setLastWritten(written)
      const isExactMatch = written.trim() === currentQuestion.correctAnswer.trim()
      if (isExactMatch) {
        // 完全一致 → 自動正解判定（保存まで即座に行う）
        addAnswerRecord({
          id: crypto.randomUUID(),
          questionId: currentQuestion.id,
          mode: 'written',
          isCorrect: true,
          userAnswer: written,
          answeredAt: new Date().toISOString(),
        })
        updateProgress(currentQuestion.topicId, true, 'written')
        updateQuestionMastery(currentQuestion.id, 'written', true)
        const gr = applyAnswer({
          questionId: currentQuestion.id,
          topicId: currentQuestion.topicId,
          isCorrect: true,
          mode: 'written',
          isImportant: isImportantMark(currentQuestion.id),  // ★F1-P2 動的取得
          difficulty: currentQuestion.difficulty,
        })
        setLastXpGained(gr.xpGained)
        sessionXpRef.current += gr.xpGained
        if (gr.newBadges.length > 0) {
          setPendingBadges((prev) => [...prev, ...gr.newBadges])
          const now = new Date()
          for (const badge of gr.newBadges) {
            addActivityEvent({ type: 'badge-unlock', date: now.toISOString().slice(0, 10), createdAt: now.toISOString(), xp: badge.xpBonus, payload: { badgeId: badge.id, badgeName: badge.name, tier: badge.tier } })
          }
        }
        setLastIsCorrect(true)
        setAutoCorrect(true)
      } else {
        setAutoCorrect(false)
      }
      setPhase('result-wr')
    },
    [currentQuestion]
  )

  // ---------- 次の問題へ / 終了 ----------
  const advanceOrFinish = useCallback(
    (isCorrect: boolean) => {
      const newLog: AnswerLog = {
        question: currentQuestion,
        userAnswer: answerMode === 'multiple-choice' ? lastSelected : lastWritten,
        isCorrect,
        mode: answerMode,
      }
      const newLogs = [...logs, newLog]
      setLogs(newLogs)

      // 1問ごとに upsert（途中離脱でも記録が残る）
      const correctCount = newLogs.filter((l) => l.isCorrect).length
      upsertQuizSessionEvent(sessionId.current, {
        mode: (mode as 'topic' | 'weakness' | 'random' | 'important') ?? 'random',
        categoryId,
        categoryName: categoryId ? (categories.find(c => c.id === categoryId)?.name ?? null) : null,
        questionCount: newLogs.length,
        correctCount,
        answerMode,
        xp: sessionXpRef.current,
      })

      if (isLast) {
        // セッション完了（開始時刻は sessionStartedAt.current を再利用）
        saveStudySession({
          id: sessionId.current,
          startedAt: sessionStartedAt.current,
          endedAt: new Date().toISOString(),
          mode: (mode as StudySession['mode']) ?? 'random',
          categoryId: categoryId,
          questionCount: questionList.length,
          correctCount,
        })
        sessionXpRef.current = 0
        setPhase('summary')
      } else {
        setCurrentIndex((i) => i + 1)
        setPhase('question')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion, answerMode, lastSelected, lastWritten, logs, isLast, mode, categoryId, questionList.length]
  )

  // ---------- 自己判定（記述）----------
  const handleJudge = useCallback(
    (isCorrect: boolean) => {
      addAnswerRecord({
        id: crypto.randomUUID(),
        questionId: currentQuestion.id,
        mode: 'written',
        isCorrect,
        userAnswer: lastWritten,
        answeredAt: new Date().toISOString(),
      })
      updateProgress(currentQuestion.topicId, isCorrect, 'written')
      updateQuestionMastery(currentQuestion.id, 'written', isCorrect)
      const gr = applyAnswer({
        questionId: currentQuestion.id,
        topicId: currentQuestion.topicId,
        isCorrect,
        mode: 'written',
        isImportant: isImportantMark(currentQuestion.id),  // ★F1-P2 動的取得
        difficulty: currentQuestion.difficulty,
      })
      setLastXpGained(gr.xpGained)
      sessionXpRef.current += gr.xpGained
      if (gr.newBadges.length > 0) {
        setPendingBadges((prev) => [...prev, ...gr.newBadges])
        const now = new Date()
        for (const badge of gr.newBadges) {
          addActivityEvent({ type: 'badge-unlock', date: now.toISOString().slice(0, 10), createdAt: now.toISOString(), xp: badge.xpBonus, payload: { badgeId: badge.id, badgeName: badge.name, tier: badge.tier } })
        }
      }
      setLastIsCorrect(isCorrect)
      advanceOrFinish(isCorrect)
    },
    [currentQuestion, lastWritten, advanceOrFinish]
  )

  // 4択の「次へ」
  const handleNextMC = useCallback(() => {
    advanceOrFinish(lastIsCorrect)
  }, [advanceOrFinish, lastIsCorrect])

  // 自動正解時の「次へ」（addAnswerRecord/updateProgress は handleAnswerWritten で実施済み）
  const handleNextAutoCorrect = useCallback(() => {
    advanceOrFinish(true)
  }, [advanceOrFinish])

  // ---------- 間違えた問題を再挑戦 ----------
  const handleRetryWrong = useCallback(() => {
    const wrongQuestions = logs
      .filter((l) => !l.isCorrect)
      .map((l) => l.question)
    if (wrongQuestions.length === 0) {
      navigate('/')
      return
    }
    // セッションIDをリフレッシュ
    sessionId.current = crypto.randomUUID()
    sessionXpRef.current = 0
    // 状態をリセットして再スタート
    setRetryList(wrongQuestions)
    setLogs([])
    setCurrentIndex(0)
    setLastSelected('')
    setLastWritten('')
    setLastIsCorrect(false)
    setPhase('mode-select')
  }, [logs, navigate])

  // ---------- 問題なし ----------
  if (questionList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-500 text-center">
          このモードで出題できる問題がありません。
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-darker text-white font-bold rounded-xl px-6 py-3 hover:bg-brand-dark transition-colors"
        >
          ホームへ戻る
        </button>
      </div>
    )
  }

  // ---------- カテゴリ名（ヘッダー表示用）----------
  const categoryName = categoryId
    ? categories.find((c) => c.id === categoryId)?.name ?? ''
    : ''
  const headerTitle = mode === 'topic' && categoryName ? categoryName : modeLabel(mode)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-brand-darker text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0"
            aria-label="ホームへ戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{headerTitle}</p>
            {phase !== 'mode-select' && phase !== 'summary' && (
              <p className="text-white/80 text-xs">{questionList.length} 問</p>
            )}
          </div>
          {/* モードバッジ */}
          {phase !== 'mode-select' && phase !== 'summary' && (
            <span className="flex-shrink-0 text-xs bg-brand-dark text-white/85 rounded-full px-2.5 py-1">
              {answerMode === 'multiple-choice' ? '4択' : '記述'}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {/* ── モード選択 ── */}
        {phase === 'mode-select' && (
          <ModeSelect
            questionCount={questionList.length}
            onSelect={(m) => {
              setAnswerMode(m)
              setPhase('question')
            }}
            onBack={() => navigate('/')}
            noteCategoryId={
              categoryId && NOTE_CATEGORY_IDS.includes(categoryId) ? categoryId : null
            }
            noteCategoryName={categoryName || undefined}
            onlyImportant={onlyImportant}
            onChangeOnlyImportant={setOnlyImportant}
          />
        )}

        {/* ── 問題 ── */}
        {/* key={currentQuestion.id}: 問題切替時に再マウントし writtenValue・入力状態をリセットする。この key を除去しないこと */}
        {phase === 'question' && currentQuestion && (
          <QuizQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            total={questionList.length}
            answerMode={answerMode}
            onAnswerMultipleChoice={handleAnswerMC}
            onAnswerWritten={handleAnswerWritten}
          />
        )}

        {/* ── 4択 結果 ── */}
        {phase === 'result-mc' && currentQuestion && (
          <ResultMultipleChoice
            question={currentQuestion}
            selected={lastSelected}
            isCorrect={lastIsCorrect}
            onNext={handleNextMC}
            isLast={isLast}
            xpGained={lastXpGained}
          />
        )}

        {/* ── 記述 結果・自己判定 ── */}
        {phase === 'result-wr' && currentQuestion && (
          <ResultWritten
            question={currentQuestion}
            written={lastWritten}
            onJudge={handleJudge}
            onNext={handleNextAutoCorrect}
            isAutoCorrect={autoCorrect}
            isLast={isLast}
            xpGained={lastXpGained}
          />
        )}

        {/* ── サマリー ── */}
        {phase === 'summary' && (
          <QuizSummary
            logs={logs}
            sessionMode={modeLabel(mode)}
            onRetryWrong={handleRetryWrong}
          />
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
