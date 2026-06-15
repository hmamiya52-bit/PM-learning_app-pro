import { BADGES, type BadgeDefinition } from '../data/badges'
import { getLevelFromXp } from '../data/levels'
import { getQuestionMastery } from './storage'
import { categories } from '../data/categories'
import { questions as allQuestions } from '../data/questions'
import { afternoonProblems } from '../data/afternoonProblems'
import { loadRecords } from './tracker'
import { loadAttempts } from './essay'
import { loadMorningRecords } from './morningRecords'
import { essayProblems } from '../data/essayProblems'
import { officialMorningQuestions } from '../data/officialMorningQuestions'
import type { EssayAttempt } from '../types'

const STORAGE_KEY = 'pmap:gamification'
const COMPLETE_BADGE_ID = 'complete-1'
/** F2-P7 でバッジID/条件を刷新。旧解放を再検証するための版数（loadGamification で移行） */
const BADGE_SCHEMA_VERSION = 2

export interface GamificationState {
  xp: number
  totalAnswered: number
  totalCorrect: number
  writtenCorrect: number
  currentStreak: number
  maxStreak: number
  /** 1問でも正解したことのある questionId の配列（踏破率用） */
  correctQuestionIds: string[]
  /** 記述モードで正解したことのある questionId（written-4 全問正解判定用） */
  writtenCorrectQuestionIds: string[]
  /** 直近20問の正誤（true/false）—最新が末尾 */
  recentResults: boolean[]
  /** 直近20問の記述モード正誤（mastery 判定用） */
  recentWrittenResults: boolean[]
  /** 解放済みバッジ ID の配列 */
  unlockedBadgeIds: string[]
  /** バッジ定義スキーマ版数（F2-P7 移行用。未設定=旧スキーマ） */
  badgeSchemaVersion?: number
}

export interface AnswerEvent {
  questionId: string
  topicId: string
  isCorrect: boolean
  /** F1-P4 D-LIB-07: 'morning' = 公式午前Ⅱ */
  mode: 'multiple-choice' | 'written' | 'morning'
  isImportant: boolean
  difficulty: number
}

export interface AnswerGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

export interface AfternoonGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  writtenCorrect: 0,
  currentStreak: 0,
  maxStreak: 0,
  correctQuestionIds: [],
  writtenCorrectQuestionIds: [],
  recentResults: [],
  recentWrittenResults: [],
  unlockedBadgeIds: [],
  badgeSchemaVersion: BADGE_SCHEMA_VERSION,
}

function countUnlockedValidBadges(unlockedIds: string[]): number {
  const validBadgeIds = new Set(BADGES.map((badge) => badge.id))
  return new Set(unlockedIds.filter((id) => validBadgeIds.has(id))).size
}

function countUnlockedNonCompleteBadges(unlockedIds: string[]): number {
  const validNonCompleteBadgeIds = new Set(
    BADGES
      .filter((badge) => badge.id !== COMPLETE_BADGE_ID)
      .map((badge) => badge.id),
  )
  return new Set(unlockedIds.filter((id) => validNonCompleteBadgeIds.has(id))).size
}

function hasUnlockedAllNonCompleteBadges(unlockedIds: string[]): boolean {
  const requiredCount = BADGES.filter((badge) => badge.id !== COMPLETE_BADGE_ID).length
  return countUnlockedNonCompleteBadges(unlockedIds) >= requiredCount
}

export function loadGamification(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<GamificationState>
    const state = { ...DEFAULT_STATE, ...parsed } as GamificationState
    // 移行判定は「生データ」の版数で行う（DEFAULT_STATE の既定値にマスクされないように）
    if (parsed.badgeSchemaVersion === BADGE_SCHEMA_VERSION) return state
    return migrateBadgeSchema(state)
  } catch {
    return { ...DEFAULT_STATE }
  }
}

/**
 * F2-P7 バッジ再設計に伴う移行。
 * 旧スキーマでは別条件だった同一ID（例: 旧 coverage-3=50% → 新 coverage-3=全問制覇）の
 * 解放が新バッジに誤って引き継がれるため、現在の条件を満たすバッジのみへ再検証する（XP は据え置き）。
 */
function migrateBadgeSchema(state: GamificationState): GamificationState {
  const satisfied = computeSatisfiedBadgeIds(state)
  const migrated: GamificationState = {
    ...state,
    unlockedBadgeIds: BADGES.map((b) => b.id).filter((id) => satisfied.has(id)),
    badgeSchemaVersion: BADGE_SCHEMA_VERSION,
  }
  saveGamification(migrated)
  return migrated
}

function saveGamification(state: GamificationState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/**
 * XP 計算（正解時のみ）
 *
 * F1-P4 D-LIB-07: 'morning' モード追加。設計書 §3.7 line 2356 の式に従う。
 * - 記述: 20
 * - 公式午前Ⅱ: 5（4択より少し高い）
 * - 4択: 3
 * 難易度ボーナスは 'morning' には適用しない。
 * 重要マーク・連続正解ボーナスは全モード共通。
 */
function calcXp(event: AnswerEvent, newStreak: number): number {
  // ベースXP
  let xp: number
  if (event.mode === 'written') xp = 20
  else if (event.mode === 'morning') xp = 5   // ★F1-P4 公式午前Ⅱ
  else xp = 3                                  // 4択

  // 難易度ボーナス（公式午前Ⅱには適用しない）
  if (event.mode !== 'morning') {
    if (event.difficulty === 2) xp += 2
    if (event.difficulty === 3) xp += 5
  }

  // 重要マークボーナス（呼び出し側で importantMarks.isImportant(q.id) を動的取得）
  if (event.isImportant) xp += 5

  // 連続正解ボーナス（NW踏襲）
  if (newStreak >= 75) xp += 200
  else if (newStreak >= 30) xp += 75
  else if (newStreak >= 10) xp += 20
  else if (newStreak >= 5)  xp += 10

  return xp
}

/** カテゴリごとの達成率（連続正解状態の問題比率）が threshold を超えるカテゴリ数 */
function countMasteredCategories(threshold: number): number {
  const mastery = getQuestionMastery()
  // category(topicId) -> 全問題数
  const totalByCat = new Map<string, number>()
  for (const q of allQuestions) {
    totalByCat.set(q.topicId, (totalByCat.get(q.topicId) ?? 0) + 1)
  }
  // category(topicId) -> 連続正解状態の問題集合（mode を問わずどちらか consecutive なら達成）
  const consecutiveByCat = new Map<string, Set<string>>()
  for (const q of allQuestions) {
    const mc = mastery[`${q.id}:multiple-choice`]
    const wr = mastery[`${q.id}:written`]
    if (mc === 'consecutive' || wr === 'consecutive') {
      let set = consecutiveByCat.get(q.topicId)
      if (!set) {
        set = new Set<string>()
        consecutiveByCat.set(q.topicId, set)
      }
      set.add(q.id)
    }
  }
  let count = 0
  for (const cat of categories) {
    const total = totalByCat.get(cat.id) ?? 0
    if (total === 0) continue
    const ach = consecutiveByCat.get(cat.id)?.size ?? 0
    if (ach / total > threshold) count++
  }
  return count
}

/**
 * 午後問題（PM1）関連バッジの判定材料を集約
 *
 * F1-P3 PM化: NW の G1/G2 二分割を廃止し、PM1（50点満点）一本で集計。
 * 既存 badges.ts の `g1Over40` / `g2Over80` バッジ ID 互換のため、
 * 変数名は維持（PM1 で 40点以上 / 45点以上）。F2-P6 でバッジ再設計予定。
 */
function computeAfternoonStats() {
  const records = loadRecords()
  const total = records.length
  let g1Over40 = 0   // PM1 で 40点以上
  let g2Over80 = 0   // PM1 で 45点以上（旧ID互換の変数名）
  let timeSec = 0    // F2-P7: 午後Ⅰ 累計学習時間（PracticeRecord.elapsedSec 総和）
  // 各 problemId について最高得点を集計（全問6割判定用）
  const bestScoreByProblem = new Map<string, number>()
  for (const r of records) {
    if (r.score >= 40) g1Over40++
    if (r.score >= 45) g2Over80++
    timeSec += r.elapsedSec ?? 0
    const prev = bestScoreByProblem.get(r.problemId) ?? -1
    if (r.score > prev) bestScoreByProblem.set(r.problemId, r.score)
  }
  // 万里一空: 全 afternoonProblems で 30点以上の記録が存在（PM1 50点満点で60% = 30点）
  let clearedSixty = 0
  for (const p of afternoonProblems) {
    const best = bestScoreByProblem.get(p.id) ?? -1
    if (best >= 30) clearedSixty += 1
  }
  const allClearedSixty = afternoonProblems.length > 0 && clearedSixty >= afternoonProblems.length
  return {
    total, g1Over40, g2Over80, allClearedSixty,
    clearedSixty, afternoonTotal: afternoonProblems.length,
    timeHours: timeSec / 3600,
  }
}

/** 論述答案が自己評価Aか（5項目合計20点以上=80%） */
function isEssayAttemptA(attempt: EssayAttempt): boolean {
  const r = attempt.selfReview
  if (!r) return false
  const sum = r.relevance + r.structure + r.concreteness + r.consistency + r.charCount
  return sum >= 20
}

/** 午後Ⅱ 論述バッジの判定材料を集約（量・質・時間） */
function computeEssayStats() {
  const attempts = loadAttempts()
  const total = attempts.length
  let aCount = 0
  let timeSec = 0
  const writtenProblemIds = new Set<string>()
  for (const a of attempts) {
    writtenProblemIds.add(a.problemId)
    timeSec += a.elapsedSec ?? 0
    if (isEssayAttemptA(a)) aCount++
  }
  const allWritten = essayProblems.length > 0 && writtenProblemIds.size >= essayProblems.length
  return {
    total, aCount, allWritten,
    distinctCount: writtenProblemIds.size, essayTotal: essayProblems.length,
    timeHours: timeSec / 3600,
  }
}

/** 公式午前Ⅱバッジの判定材料を集約（正解問題数・年度制覇・全問正解） */
function computeMorningStats() {
  const records = loadMorningRecords()
  const correctIds = new Set<string>()
  for (const r of records) {
    if (r.isCorrect) correctIds.add(r.questionId)
  }
  const correctCount = correctIds.size
  // 年度ごとに「全問正解済み」かを判定
  const byYear = new Map<string, { total: number; correct: number }>()
  for (const q of officialMorningQuestions) {
    const e = byYear.get(q.year) ?? { total: 0, correct: 0 }
    e.total += 1
    if (correctIds.has(q.id)) e.correct += 1
    byYear.set(q.year, e)
  }
  let yearComplete = 0
  for (const e of byYear.values()) {
    if (e.total > 0 && e.correct >= e.total) yearComplete += 1
  }
  const allCorrect = officialMorningQuestions.length > 0 && correctCount >= officialMorningQuestions.length
  return { correctCount, yearComplete, allCorrect }
}

/** バッジ判定用に集約した指標（checkBadges / 再検証 / 進捗表示で共用） */
interface BadgeContext {
  totalAnswered: number
  maxStreak: number
  writtenCorrect: number
  coverageCount: number
  totalQuestions: number
  coveragePct: number
  recentWrAccPct: number   // 直近20問が揃わない場合 -1
  masterCategoryCount: number
  totalCategories: number
  afternoon: ReturnType<typeof computeAfternoonStats>
  essay: ReturnType<typeof computeEssayStats>
  morning: ReturnType<typeof computeMorningStats>
}

function buildBadgeContext(state: GamificationState): BadgeContext {
  const totalQuestions = allQuestions.length
  const coverageCount = state.correctQuestionIds.length
  const recentWrLen = state.recentWrittenResults.length
  const recentWrCorrect = state.recentWrittenResults.filter(Boolean).length
  return {
    totalAnswered: state.totalAnswered,
    maxStreak: state.maxStreak,
    writtenCorrect: state.writtenCorrect,
    coverageCount,
    totalQuestions,
    coveragePct: totalQuestions > 0 ? (coverageCount / totalQuestions) * 100 : 0,
    recentWrAccPct: recentWrLen >= 20 ? (recentWrCorrect / 20) * 100 : -1,
    masterCategoryCount: countMasteredCategories(0.8),
    totalCategories: categories.length,
    afternoon: computeAfternoonStats(),
    essay: computeEssayStats(),
    morning: computeMorningStats(),
  }
}

/** 非コンプリート系バッジの解放条件を満たすか（純関数） */
function badgeConditionMet(id: string, ctx: BadgeContext): boolean {
  switch (id) {
    case 'study-1': return ctx.totalAnswered >= 1
    case 'study-2': return ctx.totalAnswered >= 500
    case 'study-3': return ctx.totalAnswered >= 2000
    case 'streak-1': return ctx.maxStreak >= 5
    case 'streak-2': return ctx.maxStreak >= 30
    case 'streak-3': return ctx.maxStreak >= 75
    case 'coverage-1': return ctx.coveragePct >= 25
    case 'coverage-2': return ctx.coveragePct >= 50
    case 'coverage-3': return ctx.coveragePct >= 100
    case 'written-1': return ctx.writtenCorrect >= 1
    case 'written-2': return ctx.recentWrAccPct >= 80
    case 'category-1': return ctx.masterCategoryCount >= 1
    case 'category-2': return ctx.masterCategoryCount >= 7
    case 'category-3': return ctx.masterCategoryCount >= ctx.totalCategories
    case 'morning-1': return ctx.morning.correctCount >= 50
    case 'morning-2': return ctx.morning.correctCount >= 150
    case 'morning-3': return ctx.morning.yearComplete >= 1
    case 'morning-4': return ctx.morning.allCorrect
    case 'afternoon-1': return ctx.afternoon.total >= 3
    case 'afternoon-2': return ctx.afternoon.g1Over40 >= 10
    case 'afternoon-3': return ctx.afternoon.g2Over80 >= 5
    case 'afternoon-4': return ctx.afternoon.allClearedSixty
    case 'afternoon-time': return ctx.afternoon.timeHours >= 20
    case 'essay-1': return ctx.essay.total >= 1
    case 'essay-2': return ctx.essay.aCount >= 1
    case 'essay-3': return ctx.essay.aCount >= 5
    case 'essay-4': return ctx.essay.aCount >= 15
    case 'essay-time': return ctx.essay.timeHours >= 30
    case 'essay-5': return ctx.essay.allWritten
    default: return false
  }
}

/** バッジ解放チェック（新規解放分を返す） */
function checkBadges(
  state: GamificationState,
  alreadyUnlocked: Set<string>,
): BadgeDefinition[] {
  const ctx = buildBadgeContext(state)
  const newBadges: BadgeDefinition[] = []
  for (const badge of BADGES) {
    if (alreadyUnlocked.has(badge.id)) continue
    const unlocked = badge.id === COMPLETE_BADGE_ID
      ? hasUnlockedAllNonCompleteBadges(state.unlockedBadgeIds)
      : badgeConditionMet(badge.id, ctx)
    if (unlocked) newBadges.push(badge)
  }
  return newBadges
}

/** 現在の条件を満たすバッジID集合（移行時の再検証用） */
function computeSatisfiedBadgeIds(state: GamificationState): Set<string> {
  const ctx = buildBadgeContext(state)
  const satisfied = new Set<string>()
  let nonCompleteCount = 0
  for (const badge of BADGES) {
    if (badge.id === COMPLETE_BADGE_ID) continue
    nonCompleteCount += 1
    if (badgeConditionMet(badge.id, ctx)) satisfied.add(badge.id)
  }
  if (satisfied.size >= nonCompleteCount) satisfied.add(COMPLETE_BADGE_ID)
  return satisfied
}

/** 開発者モード用: 各バッジの取得進捗（current / target） */
export interface BadgeProgress {
  current: number
  target: number
  unit?: string
}

export function getBadgeProgress(): Record<string, BadgeProgress> {
  const state = loadGamification()
  const ctx = buildBadgeContext(state)
  const accNow = ctx.recentWrAccPct >= 0 ? Math.round(ctx.recentWrAccPct) : 0
  const nonCompleteTotal = BADGES.filter((b) => b.id !== COMPLETE_BADGE_ID).length
  return {
    'study-1': { current: Math.min(ctx.totalAnswered, 1), target: 1, unit: '問' },
    'study-2': { current: Math.min(ctx.totalAnswered, 500), target: 500, unit: '問' },
    'study-3': { current: Math.min(ctx.totalAnswered, 2000), target: 2000, unit: '問' },
    'streak-1': { current: Math.min(ctx.maxStreak, 5), target: 5, unit: '連続' },
    'streak-2': { current: Math.min(ctx.maxStreak, 30), target: 30, unit: '連続' },
    'streak-3': { current: Math.min(ctx.maxStreak, 75), target: 75, unit: '連続' },
    'coverage-1': { current: ctx.coverageCount, target: Math.ceil(ctx.totalQuestions * 0.25), unit: '問' },
    'coverage-2': { current: ctx.coverageCount, target: Math.ceil(ctx.totalQuestions * 0.5), unit: '問' },
    'coverage-3': { current: ctx.coverageCount, target: ctx.totalQuestions, unit: '問' },
    'written-1': { current: Math.min(ctx.writtenCorrect, 1), target: 1, unit: '問' },
    'written-2': { current: accNow, target: 80, unit: '%' },
    'category-1': { current: Math.min(ctx.masterCategoryCount, 1), target: 1, unit: 'カテゴリ' },
    'category-2': { current: Math.min(ctx.masterCategoryCount, 7), target: 7, unit: 'カテゴリ' },
    'category-3': { current: ctx.masterCategoryCount, target: ctx.totalCategories, unit: 'カテゴリ' },
    'morning-1': { current: Math.min(ctx.morning.correctCount, 50), target: 50, unit: '問' },
    'morning-2': { current: Math.min(ctx.morning.correctCount, 150), target: 150, unit: '問' },
    'morning-3': { current: ctx.morning.yearComplete, target: 1, unit: '年度' },
    'morning-4': { current: ctx.morning.correctCount, target: 300, unit: '問' },
    'afternoon-1': { current: Math.min(ctx.afternoon.total, 3), target: 3, unit: '回' },
    'afternoon-2': { current: Math.min(ctx.afternoon.g1Over40, 10), target: 10, unit: '回' },
    'afternoon-3': { current: Math.min(ctx.afternoon.g2Over80, 5), target: 5, unit: '回' },
    'afternoon-4': { current: ctx.afternoon.clearedSixty, target: ctx.afternoon.afternoonTotal, unit: '問' },
    'afternoon-time': { current: Math.min(Math.floor(ctx.afternoon.timeHours), 20), target: 20, unit: 'h' },
    'essay-1': { current: Math.min(ctx.essay.total, 1), target: 1, unit: '本' },
    'essay-2': { current: Math.min(ctx.essay.aCount, 1), target: 1, unit: '回' },
    'essay-3': { current: Math.min(ctx.essay.aCount, 5), target: 5, unit: '回' },
    'essay-4': { current: Math.min(ctx.essay.aCount, 15), target: 15, unit: '回' },
    'essay-time': { current: Math.min(Math.floor(ctx.essay.timeHours), 30), target: 30, unit: 'h' },
    'essay-5': { current: ctx.essay.distinctCount, target: ctx.essay.essayTotal, unit: '本' },
    'complete-1': { current: countUnlockedNonCompleteBadges(state.unlockedBadgeIds), target: nonCompleteTotal, unit: '枚' },
  }
}

/** 全勲章コンプ判定 */
function isAllBadgesUnlocked(unlockedIds: string[]): boolean {
  return countUnlockedValidBadges(unlockedIds) >= BADGES.length
}

/**
 * 解答を記録して XP/バッジを更新する。
 *
 * F1-P-1 D-LIB-01: NW の `recordGamificationAnswer` を PM で `applyAnswer` にリネーム。
 * 機能・ロジックは NW踏襲。引数 `isImportant` は呼び出し側で動的取得（importantMarks.isImportant(q.id)）。
 */
export function applyAnswer(event: AnswerEvent): AnswerGamificationResult {
  const state = loadGamification()
  const prevLevel = getLevelFromXp(state.xp, isAllBadgesUnlocked(state.unlockedBadgeIds)).level
  const alreadyUnlocked = new Set(state.unlockedBadgeIds)

  // ストリーク更新
  const newStreak = event.isCorrect ? state.currentStreak + 1 : 0
  const newMaxStreak = Math.max(state.maxStreak, newStreak)

  // XP 計算
  const xpGained = event.isCorrect ? calcXp(event, newStreak) : 0

  // 直近20問更新
  const recentResults = [...state.recentResults, event.isCorrect].slice(-20)
  const recentWrittenResults = event.mode === 'written'
    ? [...state.recentWrittenResults, event.isCorrect].slice(-20)
    : state.recentWrittenResults

  // 踏破率用 Set
  const correctSet = new Set(state.correctQuestionIds)
  if (event.isCorrect) correctSet.add(event.questionId)

  // 記述全問正解用 Set
  const writtenCorrectSet = new Set(state.writtenCorrectQuestionIds)
  if (event.isCorrect && event.mode === 'written') writtenCorrectSet.add(event.questionId)

  const newState: GamificationState = {
    ...state,
    xp: state.xp + xpGained,
    totalAnswered: state.totalAnswered + 1,
    totalCorrect: state.totalCorrect + (event.isCorrect ? 1 : 0),
    writtenCorrect: state.writtenCorrect + (event.isCorrect && event.mode === 'written' ? 1 : 0),
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
    recentResults,
    recentWrittenResults,
    correctQuestionIds: Array.from(correctSet),
    writtenCorrectQuestionIds: Array.from(writtenCorrectSet),
    unlockedBadgeIds: state.unlockedBadgeIds, // 後で更新
  }

  // バッジ判定（新 state で）
  const newBadges = checkBadges(newState, alreadyUnlocked)
  if (newBadges.length > 0) {
    newState.unlockedBadgeIds = [
      ...newState.unlockedBadgeIds,
      ...newBadges.map((b) => b.id),
    ]
    // complete-1 を再チェック
    const completeSet = new Set(newState.unlockedBadgeIds)
    if (!completeSet.has(COMPLETE_BADGE_ID)) {
      const completeBadge = BADGES.find((b) => b.id === COMPLETE_BADGE_ID)!
      if (hasUnlockedAllNonCompleteBadges(newState.unlockedBadgeIds)) {
        newState.unlockedBadgeIds.push(COMPLETE_BADGE_ID)
        newBadges.push(completeBadge)
      }
    }
    // バッジボーナス XP
    const bonusXp = newBadges.reduce((sum, b) => sum + b.xpBonus, 0)
    newState.xp += bonusXp
  }

  saveGamification(newState)

  const newLevel = getLevelFromXp(newState.xp, isAllBadgesUnlocked(newState.unlockedBadgeIds)).level
  return {
    xpGained,
    newBadges,
    didLevelUp: newLevel > prevLevel,
    newLevel,
    newXp: newState.xp,
  }
}

/** 午後I（PM1, 50点満点）XP 計算式（20/30/40点で段階化） */
function calcPm1Xp(score: number): number {
  if (score < 20)      return score * 3
  if (score < 30)      return score * 4
  if (score < 40)      return score * 8
  return Math.min(score * 15, 1500)
}

/**
 * 午後問題（PM1）演習の結果に応じて XP を付与し、関連バッジを判定する。
 *
 * F1-P-1 D-LIB-01: NW の `recordAfternoonXp(section, score)` を PM で
 * `applyAfternoonRecord(score, problemId)` にリネーム。section は PM1 のみのため省略、
 * 代わりに将来のバッジ判定（problemId 別の集計）で使えるよう problemId を引数に。
 *
 * @returns 付与した XP、解放されたバッジ、レベル情報
 */
export function applyAfternoonRecord(score: number, _problemId: string): AfternoonGamificationResult {
  const xp = calcPm1Xp(score)

  const state = loadGamification()
  const prevLevel = getLevelFromXp(state.xp, isAllBadgesUnlocked(state.unlockedBadgeIds)).level
  const alreadyUnlocked = new Set(state.unlockedBadgeIds)

  const newState: GamificationState = {
    ...state,
    xp: state.xp + xp,
  }

  // バッジ判定（午後系を含む全バッジを評価）
  const newBadges = checkBadges(newState, alreadyUnlocked)
  if (newBadges.length > 0) {
    newState.unlockedBadgeIds = [
      ...newState.unlockedBadgeIds,
      ...newBadges.map((b) => b.id),
    ]
    // complete-1 再チェック
    const completeSet = new Set(newState.unlockedBadgeIds)
    if (!completeSet.has(COMPLETE_BADGE_ID)) {
      const completeBadge = BADGES.find((b) => b.id === COMPLETE_BADGE_ID)!
      if (hasUnlockedAllNonCompleteBadges(newState.unlockedBadgeIds)) {
        newState.unlockedBadgeIds.push(COMPLETE_BADGE_ID)
        newBadges.push(completeBadge)
      }
    }
    const bonusXp = newBadges.reduce((sum, b) => sum + b.xpBonus, 0)
    newState.xp += bonusXp
  }

  saveGamification(newState)

  const newLevel = getLevelFromXp(newState.xp, isAllBadgesUnlocked(newState.unlockedBadgeIds)).level
  return {
    xpGained: xp,
    newBadges,
    didLevelUp: newLevel > prevLevel,
    newLevel,
    newXp: newState.xp,
  }
}

/** リセット（設定画面用） */
export function resetGamification(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ──────────────────────────────────────────────────
// F1-P5 D-LIB-06 / 設計書 §3.7 line 2317: 論述完了 XP
// ──────────────────────────────────────────────────

/** 論述完了固定 XP（F1段階の暫定値、F2-P6 で再調整可） */
const ESSAY_COMPLETE_XP = 200

export interface EssayGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

/**
 * 論述セッション完了時に XP+200 を加算し、関連バッジを判定する。
 *
 * 設計書 §3.7 line 2317-2321:
 *   applyEssayComplete(payload: { problemId, attemptId, categoryIds }): EssayGamificationResult
 *
 * F1段階: 論述系バッジは未追加（F2-P6 で再設計）。
 *   既存バッジが論述で解放されることは（NW由来の定義上は）少ないが、
 *   念のため checkBadges を呼んで整合性を維持する。
 */
export function applyEssayComplete(_payload: {
  problemId: string
  attemptId: string
  categoryIds: string[]
}): EssayGamificationResult {
  const state = loadGamification()
  const prevLevel = getLevelFromXp(state.xp, isAllBadgesUnlocked(state.unlockedBadgeIds)).level
  const alreadyUnlocked = new Set(state.unlockedBadgeIds)

  const newState: GamificationState = {
    ...state,
    xp: state.xp + ESSAY_COMPLETE_XP,
  }

  // バッジ判定（F2-P6 で論述系バッジ追加時にこの呼び出しが効く）
  const newBadges = checkBadges(newState, alreadyUnlocked)
  if (newBadges.length > 0) {
    newState.unlockedBadgeIds = [
      ...newState.unlockedBadgeIds,
      ...newBadges.map((b) => b.id),
    ]
    const completeSet = new Set(newState.unlockedBadgeIds)
    if (!completeSet.has(COMPLETE_BADGE_ID)) {
      const completeBadge = BADGES.find((b) => b.id === COMPLETE_BADGE_ID)!
      if (hasUnlockedAllNonCompleteBadges(newState.unlockedBadgeIds)) {
        newState.unlockedBadgeIds.push(COMPLETE_BADGE_ID)
        newBadges.push(completeBadge)
      }
    }
    const bonusXp = newBadges.reduce((sum, b) => sum + b.xpBonus, 0)
    newState.xp += bonusXp
  }

  saveGamification(newState)

  const newLevel = getLevelFromXp(newState.xp, isAllBadgesUnlocked(newState.unlockedBadgeIds)).level
  return {
    xpGained: ESSAY_COMPLETE_XP,
    newBadges,
    didLevelUp: newLevel > prevLevel,
    newLevel,
    newXp: newState.xp,
  }
}
