import { BADGES, type BadgeDefinition } from '../data/badges'
import { getLevelFromXp } from '../data/levels'
import { getQuestionMastery } from './storage'
import { categories } from '../data/categories'
import { questions as allQuestions } from '../data/questions'
import { afternoonProblems } from '../data/afternoonProblems'
import { loadRecords } from './tracker'

const STORAGE_KEY = 'nwsp:gamification'
const COMPLETE_BADGE_ID = 'complete-1'

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
}

export interface AnswerEvent {
  questionId: string
  topicId: string
  isCorrect: boolean
  mode: 'multiple-choice' | 'written'
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
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as GamificationState
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function saveGamification(state: GamificationState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** XP 計算（正解時のみ） */
function calcXp(event: AnswerEvent, newStreak: number): number {
  // 記述20・4択3
  let xp = event.mode === 'written' ? 20 : 3

  // 難易度ボーナス
  if (event.difficulty === 2) xp += 2
  if (event.difficulty === 3) xp += 5

  // 重要問題ボーナス
  if (event.isImportant) xp += 5

  // 連続正解ボーナス
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

/** 午後問題関連バッジの判定材料を集約 */
function computeAfternoonStats() {
  const records = loadRecords()
  const total = records.length
  const sectionByProblemId = new Map(afternoonProblems.map(p => [p.id, p.section]))
  let g1Over40 = 0
  let g2Over80 = 0
  // 各 problemId について最高得点を集計（万里一空判定用）
  const bestScoreByProblem = new Map<string, number>()
  for (const r of records) {
    const sec = sectionByProblemId.get(r.problemId)
    if (sec === 'G1' && r.score >= 40) g1Over40++
    if (sec === 'G2' && r.score >= 80) g2Over80++
    const prev = bestScoreByProblem.get(r.problemId) ?? -1
    if (r.score > prev) bestScoreByProblem.set(r.problemId, r.score)
  }
  // 万里一空: 全 afternoonProblems で section に応じた閾値（G1=30,G2=60）以上の記録が存在
  let allClearedSixty = afternoonProblems.length > 0
  for (const p of afternoonProblems) {
    const best = bestScoreByProblem.get(p.id) ?? -1
    const threshold = p.section === 'G1' ? 30 : 60
    if (best < threshold) {
      allClearedSixty = false
      break
    }
  }
  return { total, g1Over40, g2Over80, allClearedSixty }
}

/** バッジ解放チェック */
function checkBadges(
  state: GamificationState,
  alreadyUnlocked: Set<string>
): BadgeDefinition[] {
  const newBadges: BadgeDefinition[] = []
  const totalQuestions = allQuestions.length
  const coveragePct = totalQuestions > 0
    ? (state.correctQuestionIds.length / totalQuestions) * 100
    : 0
  const recentWrLen = state.recentWrittenResults.length
  const recentWrCorrect = state.recentWrittenResults.filter(Boolean).length
  const recentWrAccPct = recentWrLen >= 20 ? (recentWrCorrect / 20) * 100 : -1

  // カテゴリ制覇: 達成率（連続正解状態の問題比率）が 80% を超えるカテゴリ数
  const masterCategoryCount = countMasteredCategories(0.8)
  const totalCategories = categories.length

  // 午後問題演習統計
  const afternoonStats = computeAfternoonStats()

  for (const badge of BADGES) {
    if (alreadyUnlocked.has(badge.id)) continue

    let unlocked = false
    switch (badge.id) {
      // 学習継続
      case 'study-1': unlocked = state.totalAnswered >= 1; break
      case 'study-2': unlocked = state.totalAnswered >= 50; break
      case 'study-3': unlocked = state.totalAnswered >= 200; break
      case 'study-4': unlocked = state.totalAnswered >= 500; break
      case 'study-5': unlocked = state.totalAnswered >= 1000; break
      // 連続正答
      case 'streak-2': unlocked = state.maxStreak >= 5; break
      case 'streak-3': unlocked = state.maxStreak >= 10; break
      case 'streak-5': unlocked = state.maxStreak >= 30; break
      case 'streak-6': unlocked = state.maxStreak >= 75; break
      // 記述モード
      case 'written-1': unlocked = state.writtenCorrect >= 1; break
      case 'written-2': unlocked = state.writtenCorrect >= 20; break
      case 'written-3': unlocked = state.writtenCorrect >= 100; break
      case 'written-4': unlocked = state.writtenCorrectQuestionIds.length >= totalQuestions && totalQuestions > 0; break
      // 踏破率
      case 'coverage-1': unlocked = coveragePct >= 10; break
      case 'coverage-2': unlocked = coveragePct >= 25; break
      case 'coverage-3': unlocked = coveragePct >= 50; break
      case 'coverage-4': unlocked = coveragePct >= 75; break
      case 'coverage-6': unlocked = coveragePct >= 100; break
      // 習熟（記述モード対象）
      case 'mastery-1': unlocked = recentWrAccPct >= 50; break
      case 'mastery-2': unlocked = recentWrAccPct >= 70; break
      case 'mastery-4': unlocked = recentWrAccPct >= 100; break
      // カテゴリ制覇
      case 'category-1': unlocked = masterCategoryCount >= 1; break
      case 'category-2': unlocked = masterCategoryCount >= 7; break
      case 'category-4': unlocked = masterCategoryCount >= totalCategories; break
      // 午後問題演習
      case 'afternoon-1': unlocked = afternoonStats.total >= 3; break
      case 'afternoon-2': unlocked = afternoonStats.total >= 30; break
      case 'afternoon-3': unlocked = afternoonStats.g1Over40 >= 10; break
      case 'afternoon-4': unlocked = afternoonStats.g2Over80 >= 5; break
      case 'afternoon-5': unlocked = afternoonStats.allClearedSixty; break
      // コンプリート（自分以外の全バッジ）
      case COMPLETE_BADGE_ID: unlocked = hasUnlockedAllNonCompleteBadges(state.unlockedBadgeIds); break
    }

    if (unlocked) newBadges.push(badge)
  }

  return newBadges
}

/** 全勲章コンプ判定 */
function isAllBadgesUnlocked(unlockedIds: string[]): boolean {
  return countUnlockedValidBadges(unlockedIds) >= BADGES.length
}

/** 解答を記録して XP/バッジを更新する */
export function recordGamificationAnswer(event: AnswerEvent): AnswerGamificationResult {
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

/**
 * 午後問題演習の結果に応じて XP を付与し、関連バッジを判定する。
 * @returns 付与した XP、解放されたバッジ、レベル情報
 */
export function recordAfternoonXp(section: 'G1' | 'G2', score: number): AfternoonGamificationResult {
  let xp = 0
  if (section === 'G1') {
    if (score < 30)      xp = score * 3
    else if (score < 40) xp = score * 5
    else                 xp = Math.min(score * 10, 500)
  } else {
    if (score < 40)      xp = score * 3
    else if (score < 60) xp = score * 4
    else if (score < 80) xp = score * 8
    else                 xp = Math.min(score * 15, 1500)
  }

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
