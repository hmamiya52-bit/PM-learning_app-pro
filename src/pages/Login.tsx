import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { VERSION_LABEL } from '../version'

// ─────────────────────────────────────────────
// 装飾用 SVG アイコン（絵文字を使わず洗練された印象に）
// 単色（currentColor）で塗り、line-art 中心のミニマル設計。
// ─────────────────────────────────────────────

function IconAbout({ className }: { className?: string }) {
  // ネットワーク・ノートを連想させる線画
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="13" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="14.5" x2="11" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="20.5" cy="14.5" r="1" fill="currentColor" opacity="0.55" />
      <line x1="18.5" y1="9" x2="20.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function IconAudience({ className }: { className?: string }) {
  // ターゲット（同心円）+ ピン
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11" cy="13" r="4.5" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <circle cx="11" cy="13" r="1.6" fill="currentColor" />
      <line x1="11" y1="13" x2="19.5" y2="4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.5 4.5 L17.5 4.5 L19.5 6.5 Z" fill="currentColor" />
    </svg>
  )
}

function IconFeatures({ className }: { className?: string }) {
  // 重なるカード（機能の集合）
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6.5" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" fill="white" />
      <line x1="9.5" y1="7.5" x2="16.5" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="10.5" x2="14.5" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function IconNote({ className }: { className?: string }) {
  // 開いた本＋ハイライト
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 5.5 C5 5 8 5 11 6 V19 C8 18 5 18 3 18.5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 5.5 C19 5 16 5 13 6 V19 C16 18 19 18 21 18.5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="11" y1="6" x2="11" y2="19" stroke="currentColor" strokeWidth="1.2" />
      <rect x="14.5" y="9" width="4.5" height="1.6" rx="0.5" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

function IconQuiz({ className }: { className?: string }) {
  // チェックリスト
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9 L9.2 10.2 L11 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14.5 L9.2 15.7 L11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="9" x2="16.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13" y1="14.5" x2="16.5" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconAfternoon({ className }: { className?: string }) {
  // 棒グラフ＋カレンダー
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.4" />
      <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="3.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="6" y="13" width="1.6" height="3" fill="currentColor" />
      <rect x="9" y="11" width="1.6" height="5" fill="currentColor" />
      <rect x="12" y="9.5" width="1.6" height="6.5" fill="currentColor" />
      <path d="M17.5 13 L20 13 L20 19 L17.5 19 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="17.5" y1="15.5" x2="20" y2="15.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

// ─────────────────────────────────────────────

const LOGIN_VERSION_LABEL = VERSION_LABEL

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 既にログイン済みなら元の場所へ
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    const result = await login(id, password)
    setSubmitting(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.reason)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-sm mx-auto">
        {/* ロゴ・タイトル — モバイルでもログイン枠が画面内に収まる範囲で大きめに表示 */}
        <div className="text-center mb-4 sm:mb-5">
          <img
            src="/pwa-192x192.png"
            alt=""
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl shadow-md mb-3"
          />
          <h1 className="text-base sm:text-lg font-black" style={{ color: '#9d5b8b' }}>
            PM Learning App
          </h1>
          <p className="text-sm text-slate-400 mt-1">{LOGIN_VERSION_LABEL}</p>
        </div>

        {/* フォーム */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          {/* 申請フォーム案内（フォーム枠の中・ID入力欄の上） */}
          <p className="text-[11px] text-slate-500 leading-relaxed bg-brand-light border border-brand-light rounded-lg px-3 py-2">
            アカウント未登録の方は、
            <a
              href="https://forms.gle/9w5ofDFeYDx3y4aq9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand-dark underline font-semibold"
            >
              申請フォーム
            </a>
            から登録してください。
          </p>

          <div>
            <label htmlFor="login-id" className="text-xs font-bold text-slate-500 block mb-1">
              ID
            </label>
            <input
              id="login-id"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={submitting}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-slate-50"
              required
            />
          </div>
          <div>
            <label htmlFor="login-pw" className="text-xs font-bold text-slate-500 block mb-1">
              パスワード
            </label>
            <input
              id="login-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-slate-50"
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#9d5b8b' }}
          >
            {submitting ? '確認中…' : 'ログイン'}
          </button>
        </form>

        {/* ===== ログインフォームの下：アプリ概要 ===== */}
        <div className="mt-6 space-y-4">
          {/* このアプリは何？ */}
          <section className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <IconAbout className="w-5 h-5 text-brand" />
              <span>このアプリについて</span>
            </h2>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              一言でいうと、プロジェクトマネージャ試験（PM）対策のために、分野別ノート・過去問演習・午後問題の記録／計画を1つにまとめた学習アプリです。アプリ作成者の「こんなアプリがあったら良かった」を形にしました。
            </p>
          </section>

          {/* 対象者 */}
          <section className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <IconAudience className="w-5 h-5 text-emerald-600" />
              <span>こんな方におすすめ</span>
            </h2>
            <ul className="text-[12px] text-slate-600 leading-relaxed space-y-1 list-disc ml-5">
              <li>PM試験（午前Ⅱ・午後Ⅰ・午後Ⅱ論述）対策を一元化したい方</li>
              <li>スキマ時間でPMの重要キーワードを反復したい方</li>
              <li>午後問題の演習記録・学習計画を管理したい方</li>
            </ul>
          </section>

          {/* 主な機能 */}
          <section className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <IconFeatures className="w-5 h-5 text-indigo-600" />
              <span>主な機能</span>
            </h2>
            <ul className="text-[12px] text-slate-600 leading-relaxed space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                  <IconNote className="w-4 h-4 text-teal-600" />
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="text-slate-800">ノートモード</strong>：
                  12 分野の重要知識を 1 ページで確認。赤字を隠した暗記テストにも対応。
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center">
                  <IconQuiz className="w-4 h-4 text-brand" />
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="text-slate-800">問題演習</strong>：
                  午前Ⅱ過去問（4択）と分野別クイズ。午後を解くための基礎知識を固める。
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <IconAfternoon className="w-4 h-4 text-indigo-600" />
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="text-slate-800">午後問題演習補助</strong>：
                  午後Ⅰの自己採点・記録、午後Ⅱ論述の練習・参考答案までサポート。
                </span>
              </li>
            </ul>
          </section>

          {/* フッター注記 */}
          <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-1">
            ご不明点・不具合は LINE でお知らせください。
          </p>
        </div>
      </div>
    </div>
  )
}
