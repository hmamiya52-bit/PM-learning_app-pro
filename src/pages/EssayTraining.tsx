import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { essayProblems, getEssayProblemById } from '../data/essayProblems'
import { getEssaySampleAnswer } from '../data/essaySampleAnswers'
import EssayTimer from '../components/essay/EssayTimer'
import EssayCharCounter from '../components/essay/EssayCharCounter'
import EssaySelfReview from '../components/essay/EssaySelfReview'
import EssayAttemptHistory from '../components/essay/EssayAttemptHistory'
import {
  loadActive,
  saveActive,
  clearActive,
  elapsedSecOf,
  pauseSession,
  resumeSession,
  startSession,
  saveAttempt,
  getAttemptsByProblem,
} from '../lib/essay'
import { applyEssayComplete } from '../lib/gamification'
import { addActivityEvent } from '../lib/activityLog'
import { defaultSelfReview, formatRecommendedChars } from '../lib/essayReview'
import BadgeUnlockToast from '../components/gamification/BadgeUnlockToast'
import type { BadgeDefinition } from '../data/badges'
import type {
  EssayActiveSession,
  EssaySelfReview as EssaySelfReviewType,
} from '../types'

/**
 * 論述トレーニング 練習画面（/essay/:id）
 *
 * 設計書 v0.15 §2.6 Step 6 + §2.6 line 1264-1306 に基づく:
 * - タイマー + 設問ごとの解答エリア（設問ア→解答欄アの順で近接表示）
 * - 「下書き保存」ボタン（即座保存）
 * - 入力停止 3秒後の自動保存（debounce）
 * - 「採点へ進む」 → 5項目×5段階自己評価 → 振り返り → 「保存して終了」
 * - active session 復帰（同じ problemId で既存セッションがあれば復元）
 *
 * step 遷移: writing → reviewing → reflecting
 */

function countChars(s: string | undefined): number {
  return (s ?? '').length
}

export default function EssayTraining() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const problem = id ? getEssayProblemById(id) : undefined

  // ── アクティブセッション復元 ─────────────────────────────
  const [session, setSession] = useState<EssayActiveSession | null>(() => {
    if (!id) return null
    const existing = loadActive()
    if (existing && existing.problemId === id) return existing
    return null
  })

  // 初回マウント時に「未着手」なら新規開始しない（ユーザがタイマー操作 or 入力したタイミングで作成）
  // 既存 active session が別問題のとき：そちらを優先表示してこのページは復帰モーダル… ではなく、
  //   シンプルに「別問題に未保存セッションあり」警告だけ出して新規上書き可能とする
  const conflictSession = useMemo(() => {
    const existing = loadActive()
    if (!existing) return null
    if (!id) return null
    return existing.problemId !== id ? existing : null
  }, [id])
  const [conflictAck, setConflictAck] = useState(false)

  // タイマー（1秒ごと再描画用）
  const [, setNowTick] = useState(0)
  useEffect(() => {
    if (!session || session.pausedAt) return
    const t = setInterval(() => setNowTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [session?.pausedAt, session?.lastResumedAt])  // eslint-disable-line react-hooks/exhaustive-deps

  const elapsedSec = session ? elapsedSecOf(session) : 0
  const timerRunning = !!session && !session.pausedAt

  // ── 解答本文の state（ア/イ/ウ） ────────────────────────
  const [bodyA, setBodyA] = useState<string>(session?.bodyByLabel['ア'] ?? '')
  const [bodyI, setBodyI] = useState<string>(session?.bodyByLabel['イ'] ?? '')
  const [bodyU, setBodyU] = useState<string>(session?.bodyByLabel['ウ'] ?? '')

  // ── 自動保存（3秒 debounce） ───────────────────────────
  // ★F1-P5 バグ修正:
  //   旧実装は useEffect の closure 内で `session` を直接参照していたため、
  //   タイマー予約後にユーザが「採点へ進む」を押して step='reviewing' に
  //   遷移しても、3秒後に発火する callback は古い writing 状態の session を
  //   そのまま saveActive + setSession で書き戻し、画面が writing に「勝手に戻る」
  //   バグがあった（クロージャキャプチャ問題）。
  //   修正: sessionRef で常に最新の session を参照 + writing ステップ中のみ
  //   自動保存をスケジュール（二重防御）。
  const sessionRef = useRef(session)
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    // writing ステップ以外（reviewing/reflecting）では自動保存を走らせない
    // → step 遷移後に古いタイマーが残っていても、ガード条件で何もしない
    if (!session || session.step !== 'writing') return

    autosaveTimer.current = setTimeout(() => {
      const latest = sessionRef.current
      // 発火時点で session が消滅 / step が writing 以外なら no-op
      if (!latest || latest.step !== 'writing') return
      const next: EssayActiveSession = {
        ...latest,
        bodyByLabel: { 'ア': bodyA, 'イ': bodyI, 'ウ': bodyU },
      }
      saveActive(next)
      setSession(next)
    }, 3000)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [bodyA, bodyI, bodyU, session?.step])  // eslint-disable-line react-hooks/exhaustive-deps

  // 即座保存（「下書き保存」ボタン）
  const saveDraftNow = useCallback(() => {
    if (!session) return
    const next: EssayActiveSession = {
      ...session,
      bodyByLabel: { 'ア': bodyA, 'イ': bodyI, 'ウ': bodyU },
    }
    saveActive(next)
    setSession(next)
  }, [session, bodyA, bodyI, bodyU])

  // 入力開始時に session が未作成なら作成（タイマー開始は明示ボタン）
  const ensureSession = useCallback((): EssayActiveSession => {
    if (session) return session
    if (!id) throw new Error('No problem id')
    const fresh = startSession(id)
    saveActive(fresh)
    setSession(fresh)
    return fresh
  }, [session, id])

  const handleStartTimer = () => {
    const s = session ?? ensureSession()
    if (s.pausedAt || (!s.lastResumedAt && s.accumulatedSec === 0)) {
      const resumed = resumeSession(s)
      const next: EssayActiveSession = {
        ...resumed,
        lastResumedAt: new Date().toISOString(),  // 新規開始時にも更新
      }
      saveActive(next)
      setSession(next)
    }
  }
  const handlePauseTimer = () => {
    if (!session) return
    const next = pauseSession(session)
    saveActive(next)
    setSession(next)
  }
  const handleResumeTimer = () => {
    if (!session) return
    const next = resumeSession(session)
    saveActive(next)
    setSession(next)
  }

  // 採点へ進む
  const goReview = () => {
    if (!session) return
    const next: EssayActiveSession = pauseSession({
      ...session,
      bodyByLabel: { 'ア': bodyA, 'イ': bodyI, 'ウ': bodyU },
      step: 'reviewing',
    })
    saveActive(next)
    setSession(next)
  }
  const goWriting = () => {
    if (!session) return
    const next: EssayActiveSession = { ...session, step: 'writing' }
    saveActive(next)
    setSession(next)
  }
  const goReflecting = () => {
    if (!session) return
    const next: EssayActiveSession = { ...session, step: 'reflecting' }
    saveActive(next)
    setSession(next)
  }

  // 自己評価 / 振り返り
  const [selfReview, setSelfReview] = useState<EssaySelfReviewType>(defaultSelfReview)
  const [reflection, setReflection] = useState('')
  const [pendingBadges, setPendingBadges] = useState<BadgeDefinition[]>([])

  // 保存して終了
  const handleComplete = () => {
    if (!session || !problem) return
    const elapsed = elapsedSecOf(session)
    const now = new Date()
    const attemptId = crypto.randomUUID()
    const totalChars = countChars(bodyA) + countChars(bodyI) + countChars(bodyU)

    saveAttempt({
      id: attemptId,
      problemId: problem.id,
      startedAt: session.startedAt,
      endedAt: now.toISOString(),
      elapsedSec: elapsed,
      bodyByLabel: { 'ア': bodyA, 'イ': bodyI, 'ウ': bodyU },
      selfReview,
      reflection,
    })

    // XP+200 加算 & バッジ判定
    const gr = applyEssayComplete({
      problemId: problem.id,
      attemptId,
      categoryIds: problem.categoryIds,
    })

    addActivityEvent({
      type: 'essay-complete',
      date: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      xp: gr.xpGained,
      payload: {
        attemptId,
        problemId: problem.id,
        yearLabel: problem.yearLabel,
        theme: problem.theme,
        elapsedSec: elapsed,
        totalChars,
      },
    })

    if (gr.newBadges.length > 0) {
      setPendingBadges(gr.newBadges)
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

    clearActive()
    setSession(null)

    // 完了 → 履歴詳細へ
    navigate(`/essay/${problem.id}/attempts/${attemptId}`, { replace: true })
  }

  // 過去履歴
  const pastAttempts = useMemo(
    () => (id ? getAttemptsByProblem(id) : []),
    [id],
  )

  // ── 競合セッション警告 ─────────────────────────────────
  if (conflictSession && !conflictAck) {
    const conflictProblem = essayProblems.find((p) => p.id === conflictSession.problemId)
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-md bg-white border border-amber-200 rounded-2xl px-6 py-6 shadow-md">
          <p className="text-lg font-bold text-amber-700">⚠️ 別の問題で進行中のセッションがあります</p>
          <p className="text-sm text-slate-600 mt-2">
            {conflictProblem ? `${conflictProblem.yearLabel} 問${conflictProblem.number}「${conflictProblem.theme}」` : conflictSession.problemId}
            <br />
            このまま新しい問題に進むと、進行中のセッションは保持されたまま、こちらに新規セッションが作られます。
          </p>
          <div className="flex gap-2 mt-5">
            <Link
              to={`/essay/${conflictSession.problemId}`}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 text-center hover:bg-slate-50"
            >
              中断中のセッションへ戻る
            </Link>
            <button
              onClick={() => setConflictAck(true)}
              className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark"
            >
              この問題で新規開始
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <p className="text-slate-500">問題が見つかりません</p>
        <Link to="/essay" className="text-brand underline text-sm">論述トレーニング一覧へ戻る</Link>
      </div>
    )
  }

  const step = session?.step ?? 'writing'

  // 採点・振り返りモードで使う「設問 + 自分の解答（読取専用）」ブロック
  // 折りたたみ可能（details, デフォルト open）。各設問の文字数も再掲。
  const renderAnswersReadonly = () =>
    problem.setsumons.map((q) => {
      const body = q.label === 'ア' ? bodyA : q.label === 'イ' ? bodyI : bodyU
      return (
        <details
          key={q.label}
          className="bg-white border border-slate-200 rounded-xl group"
          open
        >
          <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between">
            <p className="text-xs font-bold text-brand-dark">
              設問{q.label}
              <span className="ml-2 text-[10px] text-slate-400 font-normal tabular-nums">
                {body.length}字 / 推奨 {formatRecommendedChars(q.recommendedChars)}
              </span>
            </p>
            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-4 pb-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">{q.text}</p>
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-md p-3">
              {body || <span className="text-slate-300 italic">（未入力）</span>}
            </div>
          </div>
        </details>
      )
    })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl lg:max-w-6xl xl:max-w-[92rem] mx-auto px-4 lg:px-6 pb-16 pt-4 space-y-4">

        {/* Breadcrumb + ヘッダ */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/essay" className="hover:text-brand transition-colors">論述トレーニング</Link>
          <span>/</span>
          <span className="text-slate-600">{problem.yearLabel} 問{problem.number}</span>
        </nav>

        <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
          <p className="text-[11px] text-white/70">
            {problem.yearLabel} プロジェクトマネージャ試験 午後II 問{problem.number}
          </p>
          <h1 className="text-base font-black leading-snug mt-0.5">{problem.theme}</h1>
        </header>

        {(problem.questionPdfUrl || problem.answerPdfUrl || problem.commentaryPdfUrl) && (
          <div className="flex flex-wrap gap-2">
            {problem.questionPdfUrl && (
              <a
                href={problem.questionPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-brand hover:text-brand"
              >
                公式問題冊子
              </a>
            )}
            {problem.answerPdfUrl && (
              <a
                href={problem.answerPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-brand hover:text-brand"
              >
                出題趣旨
              </a>
            )}
            {problem.commentaryPdfUrl && (
              <a
                href={problem.commentaryPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-brand hover:text-brand"
              >
                採点講評
              </a>
            )}
          </div>
        )}

        {/* 参考答案へ（論述例の一つ。書く前でも閲覧可） */}
        {getEssaySampleAnswer(problem.id) && (
          <Link
            to={`/essay/${problem.id}/sample`}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-slate-50"
            style={{ borderColor: '#9d5b8b', color: '#9d5b8b' }}
          >
            📝 この問題の参考答案（論述例）を見る
          </Link>
        )}

        {/* ステップインジケータ */}
        <div className="flex items-center gap-2 text-[11px]">
          {(['writing', 'reviewing', 'reflecting'] as const).map((s, idx, arr) => {
            const labels = { writing: '解答', reviewing: '自己評価', reflecting: '振り返り' } as const
            const active = step === s
            return (
              <div key={s} className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {idx + 1}. {labels[s]}
                </span>
                {idx < arr.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            )
          })}
        </div>

        {/* 問題文（冒頭）— 折りたたみ。解答画面でいつでも参照できる */}
        {problem.preamble && (
          <details className="bg-white border border-slate-200 rounded-xl group">
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">問題文（冒頭）を読む</span>
              <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 border-t border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pt-2">{problem.preamble}</p>
            </div>
          </details>
        )}

        {/* ============================================
            STEP: writing
            ============================================ */}
        {step === 'writing' && (
          <>
            {/* タイマー */}
            <EssayTimer
              elapsedSec={elapsedSec}
              running={timerRunning}
              onStart={handleStartTimer}
              onPause={handlePauseTimer}
              onResume={handleResumeTimer}
            />

            {/* 設問 + 解答エリア */}
            {problem.setsumons.map((q) => {
              const value = q.label === 'ア' ? bodyA : q.label === 'イ' ? bodyI : bodyU
              const setter = q.label === 'ア' ? setBodyA : q.label === 'イ' ? setBodyI : setBodyU
              return (
                // PC版（lg以上）は左右2分割: 左＝問題, 右＝解答欄。モバイルは縦積み（従来どおり）
                <section key={q.label} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
                    {/* 左: 問題（設問文） */}
                    <div className="px-4 py-3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/80">
                      <p className="text-xs font-bold text-brand-dark">
                        設問{q.label}（推奨 {formatRecommendedChars(q.recommendedChars)}）
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed mt-1">{q.text}</p>
                    </div>
                    {/* 右: 解答欄 */}
                    <div className="px-4 py-3">
                      <textarea
                        value={value}
                        onChange={(e) => {
                          setter(e.target.value)
                          // 入力時に session が未作成なら作成
                          if (!session) ensureSession()
                        }}
                        placeholder="ここに解答を入力…（入力停止3秒後に自動保存）"
                        className="w-full min-h-[180px] lg:min-h-[420px] text-sm text-slate-800 border border-slate-200 rounded-lg p-3 outline-none focus:border-brand resize-y leading-relaxed"
                      />
                      <div className="mt-1.5">
                        <EssayCharCounter
                          value={countChars(value)}
                          min={q.recommendedChars.min}
                          max={q.recommendedChars.max}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}

            {/* アクションボタン */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveDraftNow}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-brand hover:text-brand transition-colors"
              >
                💾 下書きを保存
              </button>
              <button
                type="button"
                onClick={goReview}
                disabled={!session}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                採点へ進む →
              </button>
            </div>

            {/* 過去履歴 */}
            {pastAttempts.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  この問題の過去履歴（{pastAttempts.length}件）
                </h2>
                <EssayAttemptHistory problemId={problem.id} attempts={pastAttempts} />
              </section>
            )}
          </>
        )}

        {/* ============================================
            STEP: reviewing
            ============================================ */}
        {step === 'reviewing' && (
          <>
            <section className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700">採点モード</p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                設問と自分の解答を確認しながら、5項目を5段階で自己評価してください。
              </p>
            </section>

            {/* 設問 + 自分の解答（読取専用、F1-P5 ユーザフィードバック反映） */}
            {renderAnswersReadonly()}

            <EssaySelfReview value={selfReview} onChange={setSelfReview} />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goWriting}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-brand hover:text-brand"
              >
                ← 解答に戻る
              </button>
              <button
                type="button"
                onClick={goReflecting}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark"
              >
                振り返りへ →
              </button>
            </div>
          </>
        )}

        {/* ============================================
            STEP: reflecting
            ============================================ */}
        {step === 'reflecting' && (
          <>
            <section className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-emerald-700">最後に振り返り</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                今回の練習で気づいたこと、次回に活かしたいことを自由記述してください（任意）。
              </p>
            </section>

            {/* 設問 + 自分の解答（振り返り時の確認用） */}
            {renderAnswersReadonly()}

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="今回の練習で気づいた点・改善点…"
              className="w-full min-h-[140px] text-sm text-slate-800 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand resize-y leading-relaxed bg-white"
            />

            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 space-y-0.5">
              <p>経過時間: <span className="font-bold text-slate-700 tabular-nums">{Math.floor(elapsedSec / 60)}分 {elapsedSec % 60}秒</span></p>
              <p>総文字数: <span className="font-bold text-slate-700 tabular-nums">{countChars(bodyA) + countChars(bodyI) + countChars(bodyU)}字</span></p>
              <p>完了で <span className="font-bold text-amber-600">+200 XP</span> 獲得します。</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goReview()}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-brand hover:text-brand"
              >
                ← 採点に戻る
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
              >
                保存して終了 ✓
              </button>
            </div>
          </>
        )}
      </div>

      {pendingBadges.length > 0 && (
        <BadgeUnlockToast
          badges={pendingBadges}
          onDone={() => setPendingBadges([])}
        />
      )}
    </div>
  )
}
