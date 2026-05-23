/**
 * 静的データ検証スクリプト
 *
 * basic_design §5.9 準拠。
 * F2-P1 ノート投入・F2-P2 クイズ投入時のデータ品質保証用。
 *
 * F1.5-P2 で stakeholder ノート投入と同時に有効化。
 *
 * 実行: npm run validate-data
 */
import { categories } from '../src/data/categories'
import { questions } from '../src/data/questions'
import { NOTE_DB } from '../src/pages/NoteDetail'
import { afternoonProblems } from '../src/data/afternoonProblems'
import { officialAnswers } from '../src/data/officialAnswers'
import { scoringMap } from '../src/data/scoringMap'

type EmphasisStyle = 'red' | 'navy' | 'plain'
const VALID_STYLES: ReadonlySet<EmphasisStyle> = new Set(['red', 'navy', 'plain'])

let errorCount = 0
const error = (msg: string) => {
  console.error(`[NG] ${msg}`)
  errorCount++
}

// ─────────────────────────────────────────────
// 1. カテゴリID整合性（Question.topicId が categories に存在するか）
//    F1.5 段階では NW 22カテゴリの問題データが残置されているため
//    PM 12カテゴリの topicId に紐付かない問題が大量に存在する。
//    F2-P2 で全置換するまでは「warn のみ」に留め、エラーカウントしない。
// ─────────────────────────────────────────────
const categoryIds = new Set(categories.map((c) => c.id))
const orphanQuestions: string[] = []
for (const q of questions) {
  if (!categoryIds.has(q.topicId)) {
    orphanQuestions.push(`${q.id} (topicId=${q.topicId})`)
  }
}
if (orphanQuestions.length > 0) {
  console.warn(
    `[WARN] ${orphanQuestions.length} 件の Question で topicId が categories に未定義 ` +
      `(F2-P2 で PM 12カテゴリへ全置換するまでの既知の暫定状態)`
  )
}

// ─────────────────────────────────────────────
// 2. クイズ問題の choices に correctAnswer が含まれる / choices.length === 4
// ─────────────────────────────────────────────
for (const q of questions) {
  if (!q.choices.includes(q.correctAnswer)) {
    error(`Question ${q.id} の choices に correctAnswer "${q.correctAnswer}" が含まれない`)
  }
  if (q.choices.length !== 4) {
    error(`Question ${q.id} の choices が4個でない（${q.choices.length}個）`)
  }
}

// ─────────────────────────────────────────────
// 3. ノート構造化トークンの整合性
//    - 各カテゴリの sections が空でない
//    - section の heading が空文字でない
//    - richItems / navyItems の EmphasisToken.style が 'red' | 'navy' | 'plain'
//    - headerDiagrams の各 row.cells が空でない
//    - summary / exam_tips が存在
// ─────────────────────────────────────────────
const noteCategoryIds = Object.keys(NOTE_DB)
console.log(`[INFO] NOTE_DB 投入済カテゴリ: ${noteCategoryIds.length}件 (${noteCategoryIds.join(', ')})`)

for (const [categoryId, note] of Object.entries(NOTE_DB)) {
  if (!categoryIds.has(categoryId)) {
    error(`NOTE_DB の categoryId "${categoryId}" が categories に存在しない`)
  }
  if (!note.summary || note.summary.trim() === '') {
    error(`NOTE_DB[${categoryId}].summary が空`)
  }
  if (!note.exam_tips || note.exam_tips.length === 0) {
    error(`NOTE_DB[${categoryId}].exam_tips が空`)
  }
  if (!note.sections || note.sections.length === 0) {
    error(`NOTE_DB[${categoryId}].sections が空`)
    continue
  }
  note.sections.forEach((section, idx) => {
    if (!section.heading || section.heading.trim() === '') {
      error(`NOTE_DB[${categoryId}].sections[${idx}].heading が空`)
    }
    const hasContent =
      (section.items && section.items.length > 0) ||
      (section.richItems && section.richItems.length > 0) ||
      (section.navyItems && section.navyItems.length > 0) ||
      (section.headerDiagrams && section.headerDiagrams.length > 0) ||
      (section.richProtocolTables && section.richProtocolTables.length > 0) ||
      (section.protocols && section.protocols.length > 0)
    if (!hasContent) {
      error(`NOTE_DB[${categoryId}].sections[${idx}] "${section.heading}" にコンテンツがない`)
    }
    if (section.richItems) {
      section.richItems.forEach((tokens, ri) => {
        tokens.forEach((tok, ti) => {
          if (!VALID_STYLES.has(tok.style)) {
            error(
              `NOTE_DB[${categoryId}].sections[${idx}].richItems[${ri}][${ti}] ` +
                `style "${tok.style}" が不正（許容: red|navy|plain）`
            )
          }
        })
      })
    }
    if (section.navyItems) {
      section.navyItems.forEach((tokens, ri) => {
        tokens.forEach((tok, ti) => {
          if (!VALID_STYLES.has(tok.style)) {
            error(
              `NOTE_DB[${categoryId}].sections[${idx}].navyItems[${ri}][${ti}] ` +
                `style "${tok.style}" が不正`
            )
          }
        })
      })
    }
    if (section.headerDiagrams) {
      section.headerDiagrams.forEach((dg, di) => {
        if (!dg.title || dg.title.trim() === '') {
          error(`NOTE_DB[${categoryId}].sections[${idx}].headerDiagrams[${di}].title が空`)
        }
        if (!dg.rows || dg.rows.length === 0) {
          error(`NOTE_DB[${categoryId}].sections[${idx}].headerDiagrams[${di}].rows が空`)
        } else {
          dg.rows.forEach((row, ri) => {
            if (!row.cells || row.cells.length === 0) {
              error(
                `NOTE_DB[${categoryId}].sections[${idx}].headerDiagrams[${di}].rows[${ri}].cells が空`
              )
            }
          })
        }
      })
    }
  })
}

// ─────────────────────────────────────────────
// 4. 午後I データ（afternoonProblems / officialAnswers / scoringMap）の整合性
//    - id 重複なし
//    - afternoonProblems / officialAnswers / scoringMap の id 集合が一致
//    - scoringMap[id].length === officialAnswers[id].answers.length
//    - RowScore: correct >= partial >= 0
// ─────────────────────────────────────────────
const apIds = new Set<string>()
for (const p of afternoonProblems) {
  if (apIds.has(p.id)) error(`afternoonProblems の id "${p.id}" が重複`)
  apIds.add(p.id)
}

const oaIdSet = new Set<string>()
const oaAnswerCount = new Map<string, number>()
for (const o of officialAnswers) {
  if (oaIdSet.has(o.id)) error(`officialAnswers の id "${o.id}" が重複`)
  oaIdSet.add(o.id)
  oaAnswerCount.set(o.id, o.answers.length)
}

const smIdSet = new Set<string>(Object.keys(scoringMap))

// 3 集合一致
for (const id of apIds) {
  if (!oaIdSet.has(id)) error(`afternoonProblems の "${id}" が officialAnswers に存在しない`)
  if (!smIdSet.has(id)) error(`afternoonProblems の "${id}" が scoringMap に存在しない`)
}
for (const id of oaIdSet) {
  if (!apIds.has(id)) error(`officialAnswers の "${id}" が afternoonProblems に存在しない`)
}
for (const id of smIdSet) {
  if (!apIds.has(id)) error(`scoringMap の "${id}" が afternoonProblems に存在しない`)
}

// 行数一致 & RowScore 範囲
for (const id of smIdSet) {
  const rows = scoringMap[id]
  const expected = oaAnswerCount.get(id)
  if (expected !== undefined && rows.length !== expected) {
    error(
      `scoringMap[${id}] の行数 ${rows.length} が officialAnswers[${id}].answers.length ${expected} と不一致`
    )
  }
  rows.forEach((r, i) => {
    if (typeof r.correct !== 'number' || typeof r.partial !== 'number') {
      error(`scoringMap[${id}][${i}] が RowScore 型でない`)
      return
    }
    if (r.correct < 0 || r.partial < 0) {
      error(`scoringMap[${id}][${i}] が負値（correct=${r.correct}, partial=${r.partial}）`)
    }
    if (r.partial > r.correct) {
      error(`scoringMap[${id}][${i}] で partial > correct（${r.partial} > ${r.correct}）`)
    }
  })
  const totalScore = rows.reduce((sum, r) => sum + r.correct, 0)
  if (totalScore !== 50) {
    error(`scoringMap[${id}] の合計点 ${totalScore} が午後I満点 50 と不一致`)
  }
}

// ─────────────────────────────────────────────
// 結果
// ─────────────────────────────────────────────
if (errorCount === 0) {
  console.log('[OK] 全データの整合性確認完了')
  process.exit(0)
} else {
  console.error(`[NG] 計 ${errorCount} 件のエラー`)
  process.exit(1)
}
