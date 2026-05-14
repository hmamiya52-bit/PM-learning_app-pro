import { touchAfternoonPlanSyncMeta } from './sync/adapters'

export interface PracticeRecord {
  id: string
  problemId: string
  date: string      // YYYY-MM-DD
  score: number
  memo?: string
}

type PlanMap = Record<string, string>  // problemId → YYYY-MM-DD

const RECORDS_KEY = 'nwsp:tracker:records'
const PLANS_KEY = 'nwsp:tracker:plans'

function genId(): string {
  return crypto.randomUUID()
}

function isRecord(v: unknown): v is PracticeRecord {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.problemId === 'string' &&
    typeof r.date === 'string' &&
    typeof r.score === 'number'
  )
}

export function loadRecords(): PracticeRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecord)
  } catch {
    return []
  }
}

function saveRecords(records: PracticeRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  } catch (e) {
    console.error('[tracker] 記録の保存に失敗しました:', e)
    throw e
  }
}

export function addRecord(data: Omit<PracticeRecord, 'id'>): PracticeRecord {
  const record: PracticeRecord = { id: genId(), ...data }
  const records = loadRecords()
  records.push(record)
  saveRecords(records)
  return record
}

export function deleteRecord(id: string): void {
  saveRecords(loadRecords().filter(r => r.id !== id))
}

function isPlanMap(v: unknown): v is PlanMap {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  return Object.entries(v as object).every(
    ([k, val]) => typeof k === 'string' && typeof val === 'string'
  )
}

export function loadPlans(): PlanMap {
  try {
    const parsed = JSON.parse(localStorage.getItem(PLANS_KEY) ?? '{}')
    return isPlanMap(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function savePlans(plans: PlanMap): void {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
  } catch (e) {
    console.error('[tracker] 計画日の保存に失敗しました:', e)
    throw e
  }
}

export function setPlan(problemId: string, date: string): void {
  const plans = loadPlans()
  plans[problemId] = date
  savePlans(plans)
  touchAfternoonPlanSyncMeta(problemId)
}

export function removePlan(problemId: string): void {
  const plans = loadPlans()
  delete plans[problemId]
  savePlans(plans)
  touchAfternoonPlanSyncMeta(problemId)
}

export function getMaxScore(section: 'G1' | 'G2'): number {
  return section === 'G1' ? 50 : 100
}
