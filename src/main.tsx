import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { migrateNoteUnderstanding } from './lib/storage'

// ─────────────────────────────────────────────
// ノートのセクション統合に伴う理解度記録のインデックス移行。
// 描画前に一度だけ実行する（スキーマ版が最新なら即 return）。
// ─────────────────────────────────────────────
migrateNoteUnderstanding()

// ─────────────────────────────────────────────
// PWA: 新 SW がアクティブ化したらページをリロード
// （ハッシュ違いの古いチャンクをロードしようとして失敗するのを防ぐ）
// ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  let didReloadOnUpdate = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (didReloadOnUpdate) return
    didReloadOnUpdate = true
    window.location.reload()
  })
}

// ─────────────────────────────────────────────
// チャンクロード失敗時の自動リカバリ
// （デプロイ直後に古い HTML が新ハッシュのチャンクを取りに行って 404 → 強制リロード）
// ─────────────────────────────────────────────
const RELOAD_KEY = '__pmap_chunk_reload_at__'
function isChunkLoadError(message: unknown): boolean {
  if (typeof message !== 'string') return false
  return (
    /Loading chunk \d+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /ChunkLoadError/i.test(message)
  )
}
function tryRecover(message: unknown) {
  if (!isChunkLoadError(message)) return
  // 直近10秒以内に1度しかリロードしない（無限ループ防止）
  const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? '0')
  if (Date.now() - last < 10_000) return
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  window.location.reload()
}
window.addEventListener('error', (e) => tryRecover(e.message))
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason
  tryRecover(typeof reason === 'string' ? reason : reason?.message)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
