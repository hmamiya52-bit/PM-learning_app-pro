export interface LevelDefinition {
  level: number
  title: string
  xpRequired: number
}

export const LEVELS: LevelDefinition[] = [
  { level: 1,  title: '未経験者',                    xpRequired: 0 },
  { level: 2,  title: '駆け出し',                    xpRequired: 200 },
  { level: 3,  title: '見習い',                      xpRequired: 600 },
  { level: 4,  title: '一人前',                      xpRequired: 1400 },
  { level: 5,  title: '中堅',                        xpRequired: 4000 },
  { level: 6,  title: '熟練者',                      xpRequired: 8000 },
  { level: 7,  title: '達人',                        xpRequired: 20000 },
  { level: 8,  title: '名人',                        xpRequired: 50000 },
  { level: 9,  title: 'ネットワークエキスパート',    xpRequired: 85000 },
  // Lv10 は XP しきい値だけでなく勲章コンプも必須（getLevelFromXp の第2引数で判定）
  { level: 10, title: 'ネットワークスペシャリスト', xpRequired: 150000 },
  // Lv11 は Lv10（勲章コンプ必須）を経由しないと到達不可
  { level: 11, title: '神',                          xpRequired: 500000 },
]

export const MAX_LEVEL_REQUIRES_ALL_BADGES = true

/**
 * XP から現在レベルを返す。
 * @param xp 現在の総獲得XP
 * @param allBadgesUnlocked 全勲章コンプ済みか（false の場合 Lv9 までで打ち止め）
 */
export function getLevelFromXp(
  xp: number,
  allBadgesUnlocked: boolean = false,
): LevelDefinition {
  let result = LEVELS[0]
  for (const lv of LEVELS) {
    // Lv10 は勲章コンプ必須（Lv11 は Lv10 経由が必須なので実質同じ制約）
    if (lv.level === 10 && !allBadgesUnlocked) break
    if (xp >= lv.xpRequired) result = lv
    else break
  }
  return result
}

/** 次のレベルまで必要な XP を返す（最大レベルなら null） */
export function getNextLevel(currentLevel: number): LevelDefinition | null {
  return LEVELS.find((lv) => lv.level === currentLevel + 1) ?? null
}
