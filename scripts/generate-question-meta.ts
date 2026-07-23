/**
 * 問題メタデータ生成スクリプト
 *
 * src/data/questions と src/data/officialMorningQuestions から
 * id・topicId だけを射影して src/data/questionMeta.ts を再生成する。
 *
 * 目的: ホームのダッシュボード集計・バッジ判定・同期コーデックが
 * 問題本体（問題文・選択肢・解説）を読み込まずに済むようにし、
 * 初期バンドルを小さく保つ（M1 Step3）。
 *
 * 実行: npm run gen:meta
 * 問題を追加・削除した後は必ず実行すること。
 * 実行漏れは npm run validate-data が検出する。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { questions } from '../src/data/questions'
import { officialMorningQuestions } from '../src/data/officialMorningQuestions'

const TARGET = 'src/data/questionMeta.ts'
const START = '// GENERATED-START'
const END = '// GENERATED-END'

const metaLines = questions
  .map((q) => `  { id: '${q.id}', topicId: '${q.topicId}' },`)
  .join('\n')
const morningLines = officialMorningQuestions
  .map((q) => `  { id: '${q.id}', year: '${q.year}' },`)
  .join('\n')

const generated = [
  START,
  `export const questionMeta: QuestionMeta[] = [`,
  metaLines,
  `]`,
  `export const morningQuestionMeta: MorningQuestionMeta[] = [`,
  morningLines,
  `]`,
  `export const officialMorningQuestionIds: string[] = morningQuestionMeta.map((q) => q.id)`,
  END,
].join('\n')

const current = readFileSync(TARGET, 'utf8')
const startIdx = current.indexOf(START)
const endIdx = current.indexOf(END)
if (startIdx === -1 || endIdx === -1) {
  throw new Error(`${TARGET} に ${START} / ${END} のマーカーが見つかりません`)
}

const next = current.slice(0, startIdx) + generated + current.slice(endIdx + END.length)
writeFileSync(TARGET, next, 'utf8')

console.log(`[gen:meta] ${TARGET} を更新しました`)
console.log(`  questionMeta: ${questions.length} 件`)
console.log(`  officialMorningQuestionIds: ${officialMorningQuestions.length} 件`)
