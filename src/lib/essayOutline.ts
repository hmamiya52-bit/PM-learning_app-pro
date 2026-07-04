/**
 * 骨子練習モード CRUD + 下書き管理
 *
 * 論述ガイド §6 STEP 1〜2（設問分解→骨子メモ）だけを繰り返す練習モード用。
 * - `pmap:essay:outline:attempts`: 完了した骨子練習の履歴
 * - `pmap:essay:outline:draft`  : 入力中の下書き（離脱復帰用・全体で1件）
 *
 * 全文練習（lib/essay.ts の attempts）とは独立して保存し、一覧の練習回数・
 * XP/バッジ・端末間同期（sync package）には影響させない。
 * ※ 同期対象・設定画面のモード別リセットへの追加は将来課題。
 *
 * 下書きは EssayActiveSession と同じ形（step は 'writing' 固定）で持ち、
 * タイマーの状態遷移は lib/essay.ts の pause/resume/elapsedSecOf を流用する。
 */

import type { EssayActiveSession, EssayOutlineAttempt } from '../types'

const ATTEMPTS_KEY = 'pmap:essay:outline:attempts'
const DRAFT_KEY = 'pmap:essay:outline:draft'

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
    console.error('[essayOutline] 保存に失敗しました:', e)
    throw e
  }
}

// ──────────────────────────────────────────────────
// Attempts CRUD
// ──────────────────────────────────────────────────

export function loadOutlineAttempts(): EssayOutlineAttempt[] {
  const list = loadJson<EssayOutlineAttempt[]>(ATTEMPTS_KEY, [])
  return Array.isArray(list) ? list : []
}

export function getOutlineAttemptsByProblem(problemId: string): EssayOutlineAttempt[] {
  return loadOutlineAttempts()
    .filter((a) => a.problemId === problemId)
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
}

export function saveOutlineAttempt(attempt: EssayOutlineAttempt): void {
  const list = loadOutlineAttempts()
  const idx = list.findIndex((a) => a.id === attempt.id)
  if (idx >= 0) list[idx] = attempt
  else list.push(attempt)
  saveJson(ATTEMPTS_KEY, list)
}

// ──────────────────────────────────────────────────
// 下書き（離脱復帰用・全体で1件）
// ──────────────────────────────────────────────────

export function loadOutlineDraft(): EssayActiveSession | null {
  return loadJson<EssayActiveSession | null>(DRAFT_KEY, null)
}

export function saveOutlineDraft(draft: EssayActiveSession): void {
  saveJson(DRAFT_KEY, draft)
}

export function clearOutlineDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* noop */
  }
}
