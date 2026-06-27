/**
 * 論述トレーニング CRUD + Active Session 管理
 *
 * 設計書 v0.15 §2.6 / basic_design §5.4 に従う:
 * - `pmap:essay:attempts`: 完了済み練習履歴
 * - `pmap:essay:plans`: 学習計画日（問題ID → YYYY-MM-DD）
 * - `pmap:essay:active`: 入力中のアクティブセッション（離脱復帰用）
 *
 * Active session の経過秒は一時停止/再開を考慮して計算（elapsedSecOf）。
 */

import type { EssayAttempt, EssayActiveSession } from '../types'

const ATTEMPTS_KEY = 'pmap:essay:attempts'
const PLANS_KEY = 'pmap:essay:plans'
const ACTIVE_KEY = 'pmap:essay:active'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[essay] 保存に失敗しました:', e)
    throw e
  }
}

// ──────────────────────────────────────────────────
// Attempts CRUD
// ──────────────────────────────────────────────────

export function loadAttempts(): EssayAttempt[] {
  const list = loadJson<EssayAttempt[]>(ATTEMPTS_KEY, [])
  return Array.isArray(list) ? list : []
}

export function getAttemptsByProblem(problemId: string): EssayAttempt[] {
  return loadAttempts()
    .filter((a) => a.problemId === problemId)
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
}

export function getAttempt(id: string): EssayAttempt | null {
  return loadAttempts().find((a) => a.id === id) ?? null
}

export function saveAttempt(attempt: EssayAttempt): void {
  const list = loadAttempts()
  const idx = list.findIndex((a) => a.id === attempt.id)
  if (idx >= 0) list[idx] = attempt
  else list.push(attempt)
  saveJson(ATTEMPTS_KEY, list)
}

export function deleteAttempt(id: string): void {
  saveJson(ATTEMPTS_KEY, loadAttempts().filter((a) => a.id !== id))
}

/** 論述（午後Ⅱ）の答案履歴を全件削除（設定画面のモード別リセット用）。学習計画日（plans）は保持する。 */
export function clearAllAttempts(): void {
  try {
    localStorage.removeItem(ATTEMPTS_KEY)
  } catch (e) {
    console.error('[essay] 答案履歴の削除に失敗しました:', e)
    throw e
  }
}

// ──────────────────────────────────────────────────
// Plans CRUD（学習計画日）
// ──────────────────────────────────────────────────

export function loadEssayPlans(): Record<string, string> {
  const map = loadJson<Record<string, string>>(PLANS_KEY, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

export function setEssayPlan(problemId: string, date: string): void {
  const map = loadEssayPlans()
  map[problemId] = date
  saveJson(PLANS_KEY, map)
}

export function removeEssayPlan(problemId: string): void {
  const map = loadEssayPlans()
  delete map[problemId]
  saveJson(PLANS_KEY, map)
}

// ──────────────────────────────────────────────────
// Active Session（離脱復帰用、同期対象外）
// ──────────────────────────────────────────────────

export function loadActive(): EssayActiveSession | null {
  return loadJson<EssayActiveSession | null>(ACTIVE_KEY, null)
}

export function saveActive(session: EssayActiveSession): void {
  saveJson(ACTIVE_KEY, session)
}

export function clearActive(): void {
  try {
    localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* noop */
  }
}

/**
 * 一時停止/再開を考慮した経過秒
 *
 * - `pausedAt` が null（動作中）→ accumulatedSec + (now - lastResumedAt)
 * - `pausedAt` が非null（一時停止中）→ accumulatedSec のまま
 */
export function elapsedSecOf(session: EssayActiveSession): number {
  const base = session.accumulatedSec ?? 0
  if (session.pausedAt) return base
  if (!session.lastResumedAt) return base
  const now = Date.now()
  const last = new Date(session.lastResumedAt).getTime()
  if (!Number.isFinite(last)) return base
  return base + Math.max(0, Math.floor((now - last) / 1000))
}

// ──────────────────────────────────────────────────
// セッション操作ヘルパー（タイマー周辺の状態遷移）
// ──────────────────────────────────────────────────

export function pauseSession(session: EssayActiveSession): EssayActiveSession {
  if (session.pausedAt) return session  // すでに停止中
  const elapsed = elapsedSecOf(session)
  return {
    ...session,
    pausedAt: new Date().toISOString(),
    accumulatedSec: elapsed,
  }
}

export function resumeSession(session: EssayActiveSession): EssayActiveSession {
  if (!session.pausedAt) return session  // すでに動作中
  return {
    ...session,
    pausedAt: null,
    lastResumedAt: new Date().toISOString(),
  }
}

/** 新規セッション作成 */
export function startSession(problemId: string): EssayActiveSession {
  const now = new Date().toISOString()
  return {
    problemId,
    startedAt: now,
    pausedAt: null,
    lastResumedAt: now,
    accumulatedSec: 0,
    bodyByLabel: {},
    step: 'writing',
  }
}
