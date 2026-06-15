import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetAllData, getAllProgress, getAnswerRecords, getStudySessions } from '../lib/storage'
import { questions } from '../data/questions'
import { categories } from '../data/categories'
import { VERSION_LABEL } from '../version'
import { useAuth } from '../auth/useAuth'
import { loadRecords } from '../lib/tracker'
import { loadSyncMeta } from '../lib/sync/device'
import { getImportantIds } from '../lib/importantMarks'
import { getDevMode, setDevMode } from '../lib/preferences'

function formatLastSyncAt(value: string | undefined): string {
  if (!value) return '----/--/-- --:--'
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function Settings() {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [devMode, setDevModeState] = useState(() => getDevMode())

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // 統計サマリー
  const progress = getAllProgress()
  const records = getAnswerRecords()
  const sessions = getStudySessions()
  const afternoonRecords = loadRecords()
  const syncMeta = loadSyncMeta()

  const totalAttempts = records.length
  const totalCorrect = records.filter((r) => r.isCorrect).length
  const overallRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  const completedCategories = progress.filter((p) => p.totalAttempts > 0).length
  const lastSyncAt = formatLastSyncAt(syncMeta.lastImportedAt)

  // 重要マーク件数（F1-P2）
  const importantCount = useMemo(() => getImportantIds().length, [])

  const handleReset = () => {
    resetAllData()
    setResetDone(true)
    setShowConfirm(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-brand-darker text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-brand-dark transition-colors"
            aria-label="ホームへ戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="font-bold text-sm">設定</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12 space-y-6">

        {/* 学習統計サマリー */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">学習統計</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
              <StatCell label="総回答数" value={`${totalAttempts} 問`} />
              <StatCell label="総正解数" value={`${totalCorrect} 問`} />
              <StatCell label="総合正答率" value={`${overallRate}%`} highlight />
              <StatCell label="学習済みカテゴリ" value={`${completedCategories} / ${categories.length}`} />
              <StatCell label="セッション数" value={`${sessions.length} 回`} />
              <StatCell label="午後問題演習回数" value={`${afternoonRecords.length} 回`} />
            </div>
          </div>
        </section>

        {/* アプリ情報 */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">アプリ情報</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            <InfoRow label="バージョン" value={VERSION_LABEL} />
            <InfoRow label="問題数" value={`${questions.length} 問`} />
            <InfoRow label="データ保存" value="ブラウザ（LocalStorage）" />
            <InfoRow label="オフライン" value="対応（PWA）" />
            <InfoRow label="PCとスマホの最終同期日時" value={lastSyncAt} />
          </div>
        </section>

        {/* アカウント */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">アカウント</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">ログイン中のID</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{userId ?? '—'}</span>
            </div>

            {showLogoutConfirm ? (
              <div className="space-y-3 pt-1">
                <p className="text-sm font-bold text-slate-700">ログアウトしますか？</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                ログアウト
              </button>
            )}
          </div>
        </section>

        {/* マーク管理（F1-P2 で追加） */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">マーク管理</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Link
              to="/settings/important"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-brand text-brand flex-shrink-0"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">重要マーク管理</p>
                <p className="text-[11px] text-slate-400 mt-0.5">マーク済み問題の一覧・解除</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{importantCount}件</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* データリセット */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">データ管理</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-sm text-slate-600 mb-4">
              学習履歴・正答率・セッション記録をすべて削除します。この操作は取り消せません。
            </p>

            {resetDone ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-medium">すべてのデータをリセットしました</p>
              </div>
            ) : showConfirm ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-red-600">本当にすべての学習データを削除しますか？</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    削除する
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
              >
                学習データをリセット
              </button>
            )}
          </div>
        </section>

        {/* 使い方ヒント */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">使い方</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 text-sm">
            <HintRow icon="⭐" title="重要問題モード" desc="問題画面の☆をタップしてマークした問題のみを集中学習できます。" />
            <HintRow icon="🎯" title="弱点克服モード" desc="正答率60%未満のカテゴリの問題を優先的に出題します。" />
            <HintRow icon="✏️" title="記述モード" desc="自由記述→正解確認→自己判定の流れで深い理解を促します。" />
            <HintRow icon="📶" title="オフライン対応" desc="一度アクセスすればWi-Fiなしでも学習できます（PWA）。" />
          </div>
        </section>

        {/* 開発者モード（開発ビルドのみ表示／F2-P7） */}
        {import.meta.env.DEV && (
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">開発者</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">開発者モード</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">勲章画面で全バッジを表示（本番ビルドでは非表示）</p>
                </div>
                <button
                  type="button"
                  onClick={() => { const next = !devMode; setDevMode(next); setDevModeState(next) }}
                  role="switch"
                  aria-checked={devMode}
                  aria-label="開発者モード"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${devMode ? 'bg-brand' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${devMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-brand-darker' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

function HintRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
