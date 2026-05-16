/**
 * 公式午前II 問題の SVG figure をスタンドアロン .svg ファイル＋PNG に書き出すスクリプト。
 *
 * 用途: SVG 作成時のセルフチェック（Claude が Read ツールで PNG を目視確認するため）。
 *
 * 実行:
 *   npx vite-node scripts/render-morning-figures.ts
 *   inkscape を使って PNG に変換（scripts/render-morning-figures.py を後段で実行）
 */
import { writeFileSync, mkdirSync } from 'fs'
import { officialMorningQuestions } from '../src/data/officialMorningQuestions'

const OUT_DIR = 'tmp/figures'
mkdirSync(OUT_DIR, { recursive: true })

let count = 0
for (const q of officialMorningQuestions) {
  if (!q.figure || q.figure.type !== 'svg') continue
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${q.figure.viewBox}" width="800">
${q.figure.content}
</svg>`
  const fname = `${OUT_DIR}/${q.id}.svg`
  writeFileSync(fname, svg)
  console.log(`wrote ${fname}`)
  count++
}
console.log(`Total: ${count} SVG files`)
