import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEssayProblemById } from '../data/essayProblems'
import { essaySampleAnswers } from '../data/essaySampleAnswers'
import EssayTimer from '../components/essay/EssayTimer'
import PreambleDetails from '../components/essay/PreambleDetails'
import { elapsedSecOf, pauseSession, resumeSession, startSession } from '../lib/essay'
import {
  clearOutlineDraft,
  getOutlineAttemptsByProblem,
  loadOutlineDraft,
  saveOutlineAttempt,
  saveOutlineDraft,
} from '../lib/essayOutline'
import type { EssayActiveSession, EssayOutlineAttempt, SetsumonLabel } from '../types'

/**
 * 骨子練習モード（/essay/:id/outline）
 *
 * 論述ガイド §6 STEP 1〜2（設問分解→章立て→骨子メモ）だけを、タイマー付きで
 * 繰り返すための軽量練習画面。全文は書かず「見出し＋結論1行＋数値」だけを作る。
 * - 目標15分（15分超で注意表示、30分超で警告表示）
 * - 下書きは 3秒 debounce で自動保存（lib/essayOutline、全体で1件）
 * - 保存した骨子は問題ごとの履歴としてページ下部に表示
 * - 全文練習（EssayTraining）・XP・端末間同期には影響しない
 */

const LABELS: SetsumonLabel[] = ['ア', 'イ', 'ウ']

// 設問ごとの骨子メモ入力欄のプレースホルダ（ガイド§6 STEP 2 の型に合わせる）
const PLACEHOLDERS: Record<SetsumonLabel, string> = {
  ア: '1.1 プロジェクトの特徴: 業種・目的・期間/要員/費用・私の立場・テーマの伏線\n1.2 〔設問の要求②〕: 結論＋数値\n1.3 …',
  イ: '2.1 施策1: 課題→私の判断→実施→工夫\n2.2 施策2: …',
  ウ: '3.1 結果: 数値で着地\n3.2 評価と今後の改善: …',
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}分${String(s).padStart(2, '0')}秒`
}

/** この問題の過去の骨子練習履歴（開閉式） */
function OutlineHistory({ attempts }: { attempts: EssayOutlineAttempt[] }) {
  if (attempts.length === 0) return null
  return (
    <section>
      <h2 className="text-xs font-bold text-slate-500 mb-1.5">この問題の骨子練習履歴（{attempts.length}回）</h2>
      <ul className="space-y-1.5">
        {attempts.map((a) => (
          <li key={a.id}>
            <details className="bg-white border border-slate-200 rounded-xl group">
              <summary className="px-3.5 py-2.5 cursor-pointer list-none flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{fmtDateTime(a.endedAt)}</span>
                <span className="text-[11px] text-slate-400 tabular-nums">{fmtDuration(a.elapsedSec)}</span>
                <span className="ml-auto text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-3.5 pb-3 pt-2 border-t border-slate-100 space-y-2">
                {LABELS.map((l) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold text-brand-dark mb-0.5">設問{l}</p>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {a.bodyByLabel[l]?.trim() ? a.bodyByLabel[l] : '（未記入）'}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function EssayOutline() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const problem = id ? getEssayProblemById(id) : undefined

  // ── 下書き復元（同じ問題の下書きのみ。離脱中の時間を数えないよう一時停止状態で復元）──
  const [session, setSession] = useState<EssayActiveSession | null>(() => {
    if (!id) return null
    const d = loadOutlineDraft()
    if (!d || d.problemId !== id) return null
    return d.pausedAt ? d : { ...d, pausedAt: new Date().toISOString(), lastResumedAt: null }
  })
  const sessionRef = useRef(session)
  useEffect(() => {
    sessionRef.current = session
  })

  // 別問題の下書きがある場合の警告（入力を始めると上書きされる）
  const conflictDraft = useMemo(() => {
    if (!id) return null
    const d = loadOutlineDraft()
    return d && d.problemId !== id ? d : null
  }, [id])
  const conflictProblem = conflictDraft ? getEssayProblemById(conflictDraft.problemId) : undefined

  // ── 骨子本文（ア/イ/ウ）──────────────────────────
  const [bodies, setBodies] = useState<Record<SetsumonLabel, string>>({
    ア: session?.bodyByLabel['ア'] ?? '',
    イ: session?.bodyByLabel['イ'] ?? '',
    ウ: session?.bodyByLabel['ウ'] ?? '',
  })
  const bodiesRef = useRef(bodies)
  useEffect(() => {
    bodiesRef.current = bodies
  })

  // ── 完了ステップ ─────────────────────────────────
  const [savedAttempt, setSavedAttempt] = useState<EssayOutlineAttempt | null>(null)

  // ── タイマー（1秒ごと再描画）─────────────────────
  const [, setNowTick] = useState(0)
  useEffect(() => {
    if (!session || session.pausedAt) return
    const t = setInterval(() => setNowTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [session?.pausedAt, session?.lastResumedAt])  // eslint-disable-line react-hooks/exhaustive-deps

  const elapsedSec = session ? elapsedSecOf(session) : 0
  const timerRunning = !!session && !session.pausedAt

  // ── 自動保存（3秒 debounce。経過秒を確定した形で保存）──
  const autosaveTimer = useRef<number | null>(null)
  const snapshotForSave = (cur: EssayActiveSession): EssayActiveSession => ({
    ...cur,
    accumulatedSec: elapsedSecOf(cur),
    lastResumedAt: cur.pausedAt ? cur.lastResumedAt : new Date().toISOString(),
    bodyByLabel: { ...bodiesRef.current },
  })
  const scheduleAutosave = () => {
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
    autosaveTimer.current = window.setTimeout(() => {
      const cur = sessionRef.current
      if (!cur) return
      const next = snapshotForSave(cur)
      saveOutlineDraft(next)
      setSession(next)
    }, 3000)
  }

  // アンマウント時: 予約をクリアして最終保存（保存/破棄後は session=null なので何もしない）
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
      const cur = sessionRef.current
      if (cur) saveOutlineDraft({ ...cur, accumulatedSec: elapsedSecOf(cur), bodyByLabel: { ...bodiesRef.current } })
    }
  }, [])

  // ── セッション操作 ────────────────────────────────
  const ensureSession = (): EssayActiveSession => {
    const cur = sessionRef.current
    if (cur) return cur
    if (!problem) throw new Error('problem not found')
    const next = startSession(problem.id)
    setSession(next)
    saveOutlineDraft(next)
    return next
  }

  const handleStart = () => {
    ensureSession()
  }
  const handlePause = () => {
    const cur = sessionRef.current
    if (!cur) return
    const next = { ...pauseSession(cur), bodyByLabel: { ...bodiesRef.current } }
    setSession(next)
    saveOutlineDraft(next)
  }
  const handleResume = () => {
    const cur = sessionRef.current
    if (!cur) return
    const next = resumeSession(cur)
    setSession(next)
    saveOutlineDraft(next)
  }

  const handleChange = (label: SetsumonLabel, value: string) => {
    setBodies((prev) => ({ ...prev, [label]: value }))
    bodiesRef.current = { ...bodiesRef.current, [label]: value }
    ensureSession()
    scheduleAutosave()
  }

  const hasAnyBody = LABELS.some((l) => bodies[l].trim().length > 0)

  // ── 保存して終了 ─────────────────────────────────
  const handleFinish = () => {
    const cur = sessionRef.current
    if (!cur || !problem) return
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
    const attempt: EssayOutlineAttempt = {
      id: crypto.randomUUID(),
      problemId: problem.id,
      startedAt: cur.startedAt,
      endedAt: new Date().toISOString(),
      elapsedSec: elapsedSecOf(cur),
      bodyByLabel: { ...bodiesRef.current },
    }
    saveOutlineAttempt(attempt)
    clearOutlineDraft()
    setSession(null)
    setSavedAttempt(attempt)
    window.scrollTo(0, 0)
  }

  // ── 破棄 ─────────────────────────────────────────
  const handleDiscard = () => {
    if (hasAnyBody && !window.confirm('入力した骨子を破棄して一覧へ戻ります。よろしいですか？')) return
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
    clearOutlineDraft()
    setSession(null)
    navigate('/essay')
  }

  // ── 過去の骨子履歴（保存直後は再取得）──────────────
  const pastAttempts = useMemo(
    () => (problem ? getOutlineAttemptsByProblem(problem.id) : []),
    [problem, savedAttempt],  // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (!problem) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
          <p className="text-sm text-slate-500">問題が見つかりませんでした</p>
          <Link to="/essay" className="inline-block text-sm font-bold text-brand hover:underline">
            論述トレーニング一覧へ戻る
          </Link>
        </div>
      </div>
    )
  }

  const hasSample = Boolean(essaySampleAnswers[problem.id])

  // ── 完了ビュー ────────────────────────────────────
  if (savedAttempt) {
    const within15 = savedAttempt.elapsedSec <= 15 * 60
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-4">
          <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
            <p className="text-[10px] font-bold tracking-wide text-white/70">✏ 骨子練習モード</p>
            <h1 className="text-base font-black leading-snug mt-0.5">骨子を保存しました</h1>
          </header>

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-4 space-y-2">
            <p className="text-sm text-slate-700">
              所要時間 <span className="font-bold tabular-nums">{fmtDuration(savedAttempt.elapsedSec)}</span>
              <span className="mx-1.5 text-slate-300">|</span>
              {within15 ? (
                <span className="font-bold text-brand-dark">目標の15分以内です。本番でも同じ手順で組めます 👏</span>
              ) : (
                <span className="text-slate-500">目標は15分。骨子の型（§6 STEP 1〜2）を意識して周回しましょう</span>
              )}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              次は参考答案と見比べて、見出しの立て方・数値の入れ方の差分を確認するのがおすすめです。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hasSample && (
              <Link
                to={`/essay/${problem.id}/sample`}
                className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-brand-dark transition-colors"
              >
                📝 参考答案と見比べる
              </Link>
            )}
            <Link
              to={`/essay/${problem.id}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 shadow-sm hover:border-brand hover:text-brand-darker transition-colors"
            >
              この問題を全文で書く
            </Link>
            <Link
              to="/essay"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 shadow-sm hover:border-brand hover:text-brand-darker transition-colors"
            >
              一覧へ戻る
            </Link>
          </div>

          <OutlineHistory attempts={pastAttempts} />
        </div>
      </div>
    )
  }

  // ── 練習ビュー ────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <header className="rounded-xl bg-brand text-white px-4 py-3 shadow-md">
          <p className="text-[10px] font-bold tracking-wide text-white/70">
            ✏ 骨子練習モード
            <span className="mx-1.5 opacity-50">|</span>
            {problem.yearLabel} 問{problem.number}
          </p>
          <h1 className="text-base font-black leading-snug mt-0.5">{problem.theme}</h1>
          <p className="text-xs text-white/80 mt-1">
            全文は書かず「見出し＋結論1行＋数値」だけ。<span className="font-bold">目標15分</span>で設計図を完成させます。
          </p>
        </header>

        {/* 別問題の下書き警告 */}
        {conflictDraft && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3">
            <p className="text-[11px] font-bold text-amber-700">⚠ 別の問題の骨子下書きがあります</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {conflictProblem ? `${conflictProblem.yearLabel} 問${conflictProblem.number} ${conflictProblem.theme}` : conflictDraft.problemId}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              この問題で入力を始めると上書きされます。
              <Link to={`/essay/${conflictDraft.problemId}/outline`} className="font-bold text-brand hover:underline ml-1">
                そちらを開く →
              </Link>
            </p>
          </div>
        )}

        {/* タイマー */}
        <EssayTimer
          elapsedSec={elapsedSec}
          running={timerRunning}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
        />
        {elapsedSec >= 15 * 60 && (
          <p className={`text-[11px] font-bold ${elapsedSec >= 30 * 60 ? 'text-rose-600' : 'text-amber-600'}`}>
            {elapsedSec >= 30 * 60
              ? '⚠ 30分経過。本番ならとっくに書き始めている時間です。埋まらない節を仮置きして締めましょう'
              : '⏱ 目標の15分を超えました。細部は捨てて、全節に結論1行を置くことを優先しましょう'}
          </p>
        )}

        {/* 問題文（冒頭） */}
        {problem.preamble && <PreambleDetails preamble={problem.preamble} />}

        {/* 設問ごとの骨子入力 */}
        {problem.setsumons.map((s) => (
          <section key={s.label} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-brand-dark mb-1">設問{s.label}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{s.text}</p>
            </div>
            <div className="px-4 py-3">
              <textarea
                value={bodies[s.label]}
                onChange={(e) => handleChange(s.label, e.target.value)}
                rows={6}
                placeholder={PLACEHOLDERS[s.label]}
                className="w-full text-sm text-slate-800 leading-relaxed border border-slate-200 rounded-lg px-3 py-2 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-y"
              />
            </div>
          </section>
        ))}

        {/* 操作 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFinish}
            disabled={!hasAnyBody}
            className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            骨子を保存して終了
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600 transition-colors"
          >
            破棄
          </button>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          ※ 下書きは自動保存されます（このモードの記録は練習回数・XPには含まれません）。
          書き方の型は<Link to="/essay/guide#write-steps" className="font-bold text-brand hover:underline">論述ガイド §6</Link>を参照。
        </p>

        <OutlineHistory attempts={pastAttempts} />

      </div>
    </div>
  )
}
