import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'pmap:install_prompt_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if dismissed recently
    try {
      const raw = localStorage.getItem(DISMISSED_KEY)
      if (raw) {
        const dismissedAt = parseInt(raw, 10)
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) {
          // Still within dismiss period — don't show
          return
        }
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      // ignore
    }
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div
      role="complementary"
      aria-label="ホーム画面に追加"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] rounded-t-2xl border-t border-slate-200"
    >
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          ホーム画面に追加できます
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          オフラインでも学習できます
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
          style={{ backgroundColor: '#9d5b8b' }}
        >
          追加する
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
