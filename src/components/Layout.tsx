import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import PwaInstallPrompt from './PwaInstallPrompt'
import { VERSION_LABEL } from '../version'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

// ----------------------------------------------------------------
// SVG Icons (inline, no external dependency)
// ----------------------------------------------------------------

function IconHouse() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function IconShuffle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5l3 8h5m0 0l-3 3m3-3l-3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h5l7-8" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function IconList() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconGear() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconAfternoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconMedal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

function IconSync() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0118.5 6M4.582 9H9m11 11v-5h-.581m0 0A7.5 7.5 0 015.5 18m13.919-3H15" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ----------------------------------------------------------------
// Navigation items data
// ----------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', to: '/', icon: <IconHouse /> },
  { label: 'カテゴリ一覧', to: '/#categories', icon: <IconGrid /> },
  { label: 'ノートモード', to: '/notes', icon: <IconBook /> },
  { label: 'ランダム出題', to: '/quiz?mode=random', icon: <IconShuffle /> },
  { label: '弱点克服', to: '/quiz?mode=weakness', icon: <IconChart /> },
  { label: '問題検索', to: '/search', icon: <IconSearch /> },
  { label: '午後問題演習', to: '/afternoon', icon: <IconAfternoon /> },
  { label: 'プロトコル一覧', to: '/protocols', icon: <IconList /> },
  { label: '勲章コレクション', to: '/badges', icon: <IconMedal /> },
  { label: 'PC・スマホ同期', to: '/sync', icon: <IconSync /> },
  { label: '設定', to: '/settings', icon: <IconGear /> },
]

const STORAGE_KEY = 'pmap:sidebar_open'

// ----------------------------------------------------------------
// Layout
// ----------------------------------------------------------------

export default function Layout() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // モバイルでは常に閉じた状態（localStorage の値に関わらず）
    if (window.innerWidth < 768) return false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) return JSON.parse(stored) as boolean
    } catch {
      // ignore parse errors
    }
    // デスクトップのデフォルト: 開いた状態
    return true
  })

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768)
  const navigate = useNavigate()

  // Sync open state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen))
    } catch {
      // ignore storage errors
    }
  }, [isOpen])

  // Respond to viewport changes
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const close = useCallback(() => setIsOpen(false), [])

  // On mobile, close sidebar when navigating
  const handleNavClick = useCallback(
    (to: string) => {
      if (isMobile) close()
      // Handle anchor links (e.g. /#categories)
      if (to.includes('#')) {
        const [path, hash] = to.split('#')
        navigate(path || '/')
        setTimeout(() => {
          const el = document.getElementById(hash)
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        return
      }
    },
    [isMobile, close, navigate]
  )

  // Sidebar width values (used via inline style for dynamic values only)
  const sidebarWidth = isOpen ? 240 : 56
  const contentMargin = isMobile ? 0 : sidebarWidth

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ===== Header ===== */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center h-12 px-3 gap-3 text-white shadow-md"
        style={{ backgroundColor: '#1a3a5c' }}
      >
        {/* Hamburger toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors flex-shrink-0"
          aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isOpen}
          aria-controls="sidebar"
        >
          {isOpen && isMobile ? <IconClose /> : <IconMenu />}
        </button>

        {/* Title */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          aria-label="NW 試験学習 ホームへ"
        >
          <img src="/pwa-192x192.png" alt="" className="w-8 h-8 rounded-md flex-shrink-0" />
          <span className="text-sm font-medium text-blue-200 leading-none truncate">試験学習</span>
        </Link>

        {/* Settings shortcut */}
        <Link
          to="/settings"
          className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors flex-shrink-0"
          aria-label="設定"
        >
          <IconGear />
        </Link>
      </header>

      <div className="flex flex-1 pt-12">
        {/* ===== Mobile backdrop ===== */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40"
            style={{ top: 48 }}
            onClick={close}
            aria-hidden="true"
          />
        )}

        {/* ===== Sidebar ===== */}
        <nav
          id="sidebar"
          aria-label="メインナビゲーション"
          className="fixed top-12 bottom-0 z-20 flex flex-col overflow-hidden transition-[width] duration-200 ease-in-out"
          style={{
            width: isMobile ? (isOpen ? 240 : 0) : sidebarWidth,
            backgroundColor: '#1a3a5c',
          }}
        >
          <ul className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map((item) => {
              // For query-param routes (e.g. /quiz?mode=important), match by full `to`
              const isQueryRoute = item.to.includes('?') || item.to.includes('#')
              return (
                <li key={item.to}>
                  {isQueryRoute ? (
                    <button
                      onClick={() => {
                        handleNavClick(item.to)
                        if (!item.to.includes('#')) {
                          navigate(item.to)
                        }
                      }}
                      title={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                      style={{ minWidth: 240 }}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span
                        className="text-sm font-medium whitespace-nowrap transition-opacity duration-150"
                        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
                      >
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <NavLink
                      to={item.to}
                      onClick={() => handleNavClick(item.to)}
                      end={item.to === '/'}
                      title={item.label}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white',
                          isActive
                            ? 'text-white bg-white/20'
                            : 'text-white/80 hover:text-white hover:bg-white/10',
                        ].join(' ')
                      }
                      style={{ minWidth: 240 }}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span
                        className="text-sm font-medium whitespace-nowrap transition-opacity duration-150"
                        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Sidebar footer */}
          {isOpen && (
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="" className="w-6 h-6 rounded" />
                <p className="text-[10px] text-white/40 whitespace-nowrap">NW試験学習</p>
              </div>
              <p className="text-[10px] text-white/40 font-mono mt-1.5 whitespace-nowrap">
                {VERSION_LABEL}
              </p>
            </div>
          )}
        </nav>

        {/* ===== Main content ===== */}
        <main
          className="flex-1 min-w-0 transition-[margin-left] duration-200 ease-in-out"
          style={{ marginLeft: contentMargin }}
        >
          <Outlet />
        </main>
      </div>

      {/* ===== PWA Install Prompt ===== */}
      <PwaInstallPrompt />
    </div>
  )
}
