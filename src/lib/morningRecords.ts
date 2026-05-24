/**
 * 公式午前Ⅱ（PM 午前Ⅱ）解答履歴 CRUD
 *
 * 設計書 v0.15 §2.5 / basic_design §5.3 に従う。
 * - LocalStorage キー: `pmap:morning:records`
 * - 値: MorningRecord[]
 * - 採点済みの解答を時系列で保持し、サマリー画面と統計表示に利用
 */

import type { MorningRecord } from '../types'

const KEY = 'pmap:morning:records'

function load(): MorningRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MorningRecord[]) : []
  } catch {
    return []
  }
}

function save(records: MorningRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch (e) {
    console.error('[morningRecords] 保存に失敗しました:', e)
    throw e
  }
}

function genId(): string {
  return crypto.randomUUID()
}

/** すべての記録を取得（時系列、新しい順） */
export function loadMorningRecords(): MorningRecord[] {
  return load().sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
}

/** 新規記録を追加 */
export function addMorningRecord(
  data: Omit<MorningRecord, 'id' | 'answeredAt'>,
): MorningRecord {
  const record: MorningRecord = {
    id: genId(),
    ...data,
    answeredAt: new Date().toISOString(),
  }
  const records = load()
  records.push(record)
  save(records)
  return record
}

/** 指定 questionId の記録（直近順） */
export function getRecordsByQuestionId(questionId: string): MorningRecord[] {
  return load()
    .filter((r) => r.questionId === questionId)
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
}

/** 全件削除（設定画面からのリセット用） */
export function clearAllMorningRecords(): void {
  save([])
}

/** 統計用ヘルパー: 全体正答率 */
export function getOverallAccuracy(): { total: number; correct: number; rate: number } {
  const records = load()
  const total = records.length
  const correct = records.filter((r) => r.isCorrect).length
  return {
    total,
    correct,
    rate: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}

/** 問題ごとの直近の正誤を Map で返す（重要マーク管理画面などで使用） */
export function getLatestResultByQuestionId(): Map<string, boolean> {
  const result = new Map<string, boolean>()
  for (const r of loadMorningRecords()) {
    if (!result.has(r.questionId)) {
      result.set(r.questionId, r.isCorrect)
    }
  }
  return result
}
