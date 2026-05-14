import { useEffect, useState } from 'react'
import { CREDENTIALS, AUTH_SESSION_DAYS } from './credentials'
import { sha256 } from './hash'

const STORAGE_KEY = 'nwsp:auth'

interface AuthSession {
  userId: string
  loggedInAt: string
  expiresAt: string
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (!session.userId || !session.expiresAt) return null
    if (new Date(session.expiresAt).getTime() < Date.now()) return null
    return session
  } catch {
    return null
  }
}

function saveSession(userId: string): AuthSession {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000)
  const session: AuthSession = {
    userId,
    loggedInAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  // 別タブでログイン/ログアウトされた時に同期
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(loadSession())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  async function login(id: string, password: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    const trimmedId = id.trim()
    if (!trimmedId || !password) return { ok: false, reason: 'IDとパスワードを入力してください' }

    const passwordHash = await sha256(password)
    const found = CREDENTIALS.find((c) => c.id === trimmedId && c.passwordHash === passwordHash)
    if (!found) return { ok: false, reason: 'IDまたはパスワードが正しくありません' }

    const newSession = saveSession(trimmedId)
    setSession(newSession)
    return { ok: true }
  }

  function logout() {
    clearSession()
    setSession(null)
  }

  return {
    isAuthenticated: session !== null,
    userId: session?.userId ?? null,
    expiresAt: session?.expiresAt ?? null,
    login,
    logout,
  }
}
