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
import { essayProblems } from '../src/data/essayProblems'
import { afternoonExplanations, makeRowKey } from '../src/data/afternoonExplanations'

type EmphasisStyle = 'red' | 'navy' | 'plain'
const VALID_STYLES: ReadonlySet<EmphasisStyle> = new Set(['red', 'navy', 'plain'])

let errorCount = 0
const error = (msg: string) => {
  console.error(`[NG] ${msg}`)
  errorCount++
}

type MarkupSeverity = 'NG' | 'WARN'
type TokenLike = { text: string }

interface MarkupFinding {
  severity: MarkupSeverity
  location: string
  rule: string
  excerpt: string
}

const markupFindings: MarkupFinding[] = []

const countOccurrences = (text: string, needle: string): number => text.split(needle).length - 1

const excerpt = (text: string, max = 80): string => {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  return singleLine.length > max ? `${singleLine.slice(0, max - 1)}...` : singleLine
}

const addMarkupFinding = (
  severity: MarkupSeverity,
  location: string,
  rule: string,
  sample: string
) => {
  const finding: MarkupFinding = {
    severity,
    location,
    rule,
    excerpt: excerpt(sample),
  }
  markupFindings.push(finding)
  const prefix = severity === 'NG' ? 'MARKUP-NG' : 'MARKUP-WARN'
  console.log(`[${prefix}] ${finding.location} : ${finding.rule} ${finding.excerpt}`)
}

const countMatches = (text: string, pattern: RegExp): number => [...text.matchAll(pattern)].length

const redMarkupPairPattern = /==(?:(?!==)(?!__)[\s\S])+?==/g
const navyMarkupPairPattern = /__(?:(?!__)(?!==)[\s\S])+?__/g

const hasStrayMarkupMarker = (text: string): boolean => {
  const textWithoutBalancedPairs = text
    .replace(redMarkupPairPattern, '')
    .replace(navyMarkupPairPattern, '')
  return textWithoutBalancedPairs.includes('==') || textWithoutBalancedPairs.includes('__')
}

const checkMarkupString = (location: string, value: unknown) => {
  if (typeof value !== 'string') return

  if (countOccurrences(value, '==') % 2 !== 0) {
    addMarkupFinding('NG', location, 'MK1 unmatched == marker count is odd', value)
  }
  if (countOccurrences(value, '__') % 2 !== 0) {
    addMarkupFinding('NG', location, 'MK2 unmatched __ marker count is odd', value)
  }
  if (value.includes('＝')) {
    addMarkupFinding('NG', location, 'MK3 fullwidth equals is not allowed', value)
  }
  if (/={3,}|_{3,}/.test(value)) {
    addMarkupFinding('NG', location, 'MK4 triple-or-more markup marker is not allowed', value)
  }
  if (hasStrayMarkupMarker(value)) {
    addMarkupFinding(
      'NG',
      location,
      'MK1/MK2 stray marker remains after balanced pair removal',
      value
    )
  }
  if (/==[^=]+===/.test(value)) {
    addMarkupFinding('NG', location, 'MK5 red marker is directly followed by =', value)
  }

  const redPairCount = countMatches(value, redMarkupPairPattern)
  const navyPairCount = countMatches(value, navyMarkupPairPattern)
  if (redPairCount >= 3) {
    addMarkupFinding('WARN', location, `MK6 red emphasis appears ${redPairCount} times`, value)
  }
  if (navyPairCount >= 3) {
    addMarkupFinding('WARN', location, `MK6 navy emphasis appears ${navyPairCount} times`, value)
  }
}

const isTokenLike = (value: unknown): value is TokenLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof (value as { text?: unknown }).text === 'string'
  )
}

const checkMarkupTokens = (location: string, rows: unknown) => {
  if (!Array.isArray(rows)) return

  rows.forEach((tokens, rowIndex) => {
    if (!Array.isArray(tokens)) return
    tokens.forEach((token, tokenIndex) => {
      if (!isTokenLike(token)) return
      if (token.text.includes('==') || token.text.includes('__')) {
        addMarkupFinding(
          'NG',
          `${location}[${rowIndex}][${tokenIndex}].text`,
          'MK7 token text must not contain raw == or __ markup',
          token.text
        )
      }
    })
  })
}

type AfternoonExplanationEntry = (typeof afternoonExplanations)[string]
type AfternoonDetail = NonNullable<AfternoonExplanationEntry['detail']>

const checkAfternoonDetailMarkup = (id: string, detail: AfternoonDetail | undefined) => {
  if (!detail) return

  const baseLocation = `afternoonExplanations[${id}].detail`

  detail.problemSections.forEach((section, sectionIndex) => {
    checkMarkupString(`${baseLocation}.problemSections[${sectionIndex}].heading`, section.heading)
    checkMarkupString(`${baseLocation}.problemSections[${sectionIndex}].body`, section.body)
  })

  detail.figures?.forEach((figure, figureIndex) => {
    const figureLocation = `${baseLocation}.figures[${figureIndex}]`
    checkMarkupString(`${figureLocation}.title`, figure.title)
    checkMarkupString(`${figureLocation}.note`, figure.note)

    if (figure.kind === 'compare') {
      figure.columns.forEach((column, columnIndex) => {
        checkMarkupString(`${figureLocation}.columns[${columnIndex}]`, column)
      })
      figure.rows.forEach((row, rowIndex) => {
        checkMarkupString(`${figureLocation}.rows[${rowIndex}].label`, row.label)
        row.cells.forEach((cell, cellIndex) => {
          checkMarkupString(`${figureLocation}.rows[${rowIndex}].cells[${cellIndex}]`, cell)
        })
      })
    } else {
      figure.nodes.forEach((node, nodeIndex) => {
        checkMarkupString(`${figureLocation}.nodes[${nodeIndex}].label`, node.label)
      })
      figure.edges?.forEach((edge, edgeIndex) => {
        checkMarkupString(`${figureLocation}.edges[${edgeIndex}].label`, edge.label)
      })
    }
  })

  detail.questionDetails.forEach((questionDetail, detailIndex) => {
    const rowRef = questionDetail.rowKey || `index-${detailIndex}`
    const questionLocation = `${baseLocation}.questionDetails[${rowRef}]`
    checkMarkupString(`${questionLocation}.heading`, questionDetail.heading)
    checkMarkupString(`${questionLocation}.asked`, questionDetail.asked)
    questionDetail.thinkingProcess.forEach((step, stepIndex) => {
      checkMarkupString(`${questionLocation}.thinkingProcess[${stepIndex}]`, step)
    })
    checkMarkupString(`${questionLocation}.commentary`, questionDetail.commentary)
  })

  detail.keyKnowledge.forEach((knowledge, knowledgeIndex) => {
    checkMarkupString(`${baseLocation}.keyKnowledge[${knowledgeIndex}].term`, knowledge.term)
    checkMarkupString(
      `${baseLocation}.keyKnowledge[${knowledgeIndex}].description`,
      knowledge.description
    )
  })

  detail.solvingTips?.forEach((tip, tipIndex) => {
    checkMarkupString(`${baseLocation}.solvingTips[${tipIndex}]`, tip)
  })
}

type StructureSeverity = 'NG' | 'INFO'

interface StructureFinding {
  severity: StructureSeverity
  check: string
  location: string
  message: string
}

const structureFindings: StructureFinding[] = []

const addStructureFinding = (
  severity: StructureSeverity,
  check: string,
  location: string,
  message: string
) => {
  structureFindings.push({ severity, check, location, message })
  console.log(`[AFTERNOON-STRUCTURE-${severity}] ${check} ${location} : ${message}`)
}

const uniqueInOrder = (values: string[]): string[] => {
  const seen = new Set<string>()
  return values.filter((value) => {
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

const findDuplicates = (values: string[]): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value)
    } else {
      seen.add(value)
    }
  })
  return Array.from(duplicates)
}

const formatKeyList = (values: string[], max = 8): string => {
  if (values.length === 0) return 'なし'
  const head = values.slice(0, max).join(', ')
  return values.length > max ? `${head} ... (+${values.length - max})` : head
}

const arraysEqual = (left: string[], right: string[]): boolean => {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

const describeRowKeyDiff = (
  expected: string[],
  actual: string[],
  requireOrder: boolean
): string => {
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)
  const missing = expected.filter((key) => !actualSet.has(key))
  const extra = actual.filter((key) => !expectedSet.has(key))
  const duplicates = findDuplicates(actual)
  const messages: string[] = []

  if (missing.length > 0) messages.push(`欠落=${formatKeyList(missing)}`)
  if (extra.length > 0) messages.push(`余剰=${formatKeyList(extra)}`)
  if (duplicates.length > 0) messages.push(`重複=${formatKeyList(duplicates)}`)
  if (requireOrder && messages.length === 0 && !arraysEqual(expected, actual)) {
    messages.push(
      `順序違い 期待先頭=${formatKeyList(expected, 6)} / 実際先頭=${formatKeyList(actual, 6)}`
    )
  }
  if (messages.length === 0 && expected.length !== actual.length) {
    messages.push(`件数違い 期待=${expected.length} / 実際=${actual.length}`)
  }

  return messages.join(' / ')
}

const summarizeText = (value: string): string => excerpt(value, 60)

const runAfternoonExplanationStructureAudit = () => {
  const entries = Object.entries(afternoonExplanations)
  const officialAnswerById = new Map(officialAnswers.map((answerSet) => [answerSet.id, answerSet]))
  const allowedAccents = new Set(['brand', 'indigo', 'emerald', 'amber', 'rose', 'slate'])

  if (entries.length !== 37) {
    addStructureFinding('NG', 'B1', 'afternoonExplanations', `id数 期待=37 / 実際=${entries.length}`)
  }

  for (const [id, explanation] of entries) {
    const officialAnswer = officialAnswerById.get(id)

    if (!officialAnswer) {
      addStructureFinding('NG', 'B2', `afternoonExplanations[${id}]`, 'officialAnswers に同一 id が存在しない')
      continue
    }

    if ((officialAnswer.section as string) !== 'PM1') {
      addStructureFinding(
        'NG',
        'B2',
        `officialAnswers[${id}].section`,
        `section が PM1 ではない（${officialAnswer.section}）`
      )
    }

    if (explanation.id !== id) {
      addStructureFinding(
        'NG',
        'B3',
        `afternoonExplanations[${id}].id`,
        `キーと id プロパティが不一致（${explanation.id}）`
      )
    }

    const expectedRowKeys = uniqueInOrder(
      officialAnswer.answers.map((answer) => makeRowKey(answer.s, answer.q, answer.t))
    )
    const rowKeys = explanation.rows.map((row) => row.rowKey)
    const rowKeyDiff = describeRowKeyDiff(expectedRowKeys, rowKeys, true)
    if (rowKeyDiff) {
      addStructureFinding('NG', 'B4', `afternoonExplanations[${id}].rows`, rowKeyDiff)
    }

    const detail = explanation.detail
    const questionDetails = detail?.questionDetails ?? []
    const questionDetailKeys = questionDetails.map((questionDetail) => questionDetail.rowKey)
    const questionDetailDiff = describeRowKeyDiff(expectedRowKeys, questionDetailKeys, false)
    if (questionDetailDiff) {
      addStructureFinding(
        'NG',
        'B5',
        `afternoonExplanations[${id}].detail.questionDetails`,
        questionDetailDiff
      )
    }

    if (
      explanation.rows.length !== questionDetails.length ||
      explanation.rows.length !== officialAnswer.answers.length
    ) {
      addStructureFinding(
        'NG',
        'B6',
        `afternoonExplanations[${id}]`,
        `rows=${explanation.rows.length} / details=${questionDetails.length} / answers=${officialAnswer.answers.length}`
      )
    }

    const expectedAnswerByRowKey = new Map(
      officialAnswer.answers.map((answer) => [
        makeRowKey(answer.s, answer.q, answer.t),
        answer.a.replace(/\n/g, '／'),
      ])
    )
    questionDetails.forEach((questionDetail) => {
      const expectedAnswer = expectedAnswerByRowKey.get(questionDetail.rowKey)
      if (expectedAnswer !== undefined && questionDetail.modelAnswer !== expectedAnswer) {
        addStructureFinding(
          'INFO',
          'B7',
          `afternoonExplanations[${id}].detail.questionDetails[${questionDetail.rowKey}].modelAnswer`,
          `期待:${summarizeText(expectedAnswer)} / 実際:${summarizeText(questionDetail.modelAnswer)}`
        )
      }
    })

    detail?.figures?.forEach((figure, figureIndex) => {
      const figureLocation = `afternoonExplanations[${id}].detail.figures[${figureIndex}]`

      if (figure.kind === 'compare') {
        if (figure.columns.length > 3) {
          addStructureFinding(
            'NG',
            'B8',
            `${figureLocation}.columns`,
            `columns.length=${figure.columns.length}（上限3）`
          )
        }
        figure.rows.forEach((row, rowIndex) => {
          const expectedCells = figure.columns.length - 1
          if (row.cells.length !== expectedCells) {
            addStructureFinding(
              'NG',
              'B8',
              `${figureLocation}.rows[${rowIndex}].cells`,
              `cells.length=${row.cells.length} / 期待=${expectedCells}`
            )
          }
        })
      } else {
        const nodeIds = new Set(figure.nodes.map((node) => node.id))
        figure.nodes.forEach((node, nodeIndex) => {
          if (typeof node.col !== 'number' || node.col < 0 || node.col > 1) {
            addStructureFinding(
              'NG',
              'B9',
              `${figureLocation}.nodes[${nodeIndex}].col`,
              `col=${node.col}（許容 0〜1）`
            )
          }
          const accent = node.accent as string | undefined
          if (accent !== undefined && !allowedAccents.has(accent)) {
            addStructureFinding(
              'NG',
              'B9',
              `${figureLocation}.nodes[${nodeIndex}].accent`,
              `accent=${accent}（許容: ${Array.from(allowedAccents).join(', ')}）`
            )
          }
        })
        figure.edges?.forEach((edge, edgeIndex) => {
          if (!nodeIds.has(edge.from)) {
            addStructureFinding(
              'NG',
              'B9',
              `${figureLocation}.edges[${edgeIndex}].from`,
              `未解決参照 ${edge.from}`
            )
          }
          if (!nodeIds.has(edge.to)) {
            addStructureFinding(
              'NG',
              'B9',
              `${figureLocation}.edges[${edgeIndex}].to`,
              `未解決参照 ${edge.to}`
            )
          }
        })
      }
    })

    if (!detail) {
      addStructureFinding('INFO', 'B10', `afternoonExplanations[${id}].detail`, 'detail が存在しない')
    } else {
      if (detail.problemSections.length < 1) {
        addStructureFinding(
          'INFO',
          'B10',
          `afternoonExplanations[${id}].detail.problemSections`,
          'problemSections が空'
        )
      }
      if (detail.keyKnowledge.length < 1) {
        addStructureFinding(
          'INFO',
          'B10',
          `afternoonExplanations[${id}].detail.keyKnowledge`,
          'keyKnowledge が空'
        )
      }
    }
  }

  const structureNg = structureFindings.filter((finding) => finding.severity === 'NG').length
  const structureInfo = structureFindings.filter((finding) => finding.severity === 'INFO').length
  console.log(`[AFTERNOON-STRUCTURE] NG: ${structureNg} / INFO: ${structureInfo}`)
}

const runMarkupValidation = () => {
  for (const [categoryId, note] of Object.entries(NOTE_DB)) {
    checkMarkupString(`NOTE_DB[${categoryId}].summary`, note.summary)
    note.exam_tips?.forEach((tip, index) => {
      checkMarkupString(`NOTE_DB[${categoryId}].exam_tips[${index}]`, tip)
    })
    note.sections?.forEach((section, sectionIndex) => {
      checkMarkupString(`NOTE_DB[${categoryId}].sections[${sectionIndex}].heading`, section.heading)
      section.items?.forEach((item, itemIndex) => {
        checkMarkupString(
          `NOTE_DB[${categoryId}].sections[${sectionIndex}].items[${itemIndex}]`,
          item
        )
      })
      checkMarkupTokens(
        `NOTE_DB[${categoryId}].sections[${sectionIndex}].richItems`,
        section.richItems
      )
      checkMarkupTokens(
        `NOTE_DB[${categoryId}].sections[${sectionIndex}].navyItems`,
        section.navyItems
      )
    })
  }

  for (const q of questions) {
    checkMarkupString(`questions[${q.id}].explanation`, q.explanation)
  }

  for (const [id, explanation] of Object.entries(afternoonExplanations)) {
    checkMarkupString(`afternoonExplanations[${id}].overview`, explanation.overview)
    explanation.rows.forEach((row, rowIndex) => {
      checkMarkupString(`afternoonExplanations[${id}].rows[${rowIndex}].point`, row.point)
      checkMarkupString(`afternoonExplanations[${id}].rows[${rowIndex}].basis`, row.basis)
      checkMarkupString(`afternoonExplanations[${id}].rows[${rowIndex}].reasoning`, row.reasoning)
      checkMarkupString(`afternoonExplanations[${id}].rows[${rowIndex}].pitfall`, row.pitfall)
    })
    checkAfternoonDetailMarkup(id, explanation.detail)
  }

  const markupNg = markupFindings.filter((finding) => finding.severity === 'NG').length
  const markupWarn = markupFindings.filter((finding) => finding.severity === 'WARN').length
  const detailMarkupFindings = markupFindings.filter((finding) =>
    finding.location.startsWith('afternoonExplanations[') && finding.location.includes('].detail.')
  )
  const detailMarkupNg = detailMarkupFindings.filter((finding) => finding.severity === 'NG').length
  const detailMarkupWarn = detailMarkupFindings.filter(
    (finding) => finding.severity === 'WARN'
  ).length

  // MARKUP findings are an advisory gate for now. Promote this to errorCount when data cleanup is complete.
  console.log(`[MARKUP] NG: ${markupNg} / WARN: ${markupWarn}`)
  console.log(`[AFTERNOON-DETAIL-MARKUP] NG: ${detailMarkupNg} / WARN: ${detailMarkupWarn}`)
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
// 5. 午後II 論述データ（essayProblems）の整合性
//    - id 重複なし
//    - categoryIds が categories に存在
//    - 設問ア・イ・ウが1件ずつ存在
//    - 推奨字数 range が 0 <= min <= max
// ─────────────────────────────────────────────
const essayIds = new Set<string>()
const expectedEssayLabels = ['ア', 'イ', 'ウ'] as const
for (const p of essayProblems) {
  if (essayIds.has(p.id)) error(`essayProblems の id "${p.id}" が重複`)
  essayIds.add(p.id)
  if (!p.theme || p.theme.trim() === '') {
    error(`essayProblems ${p.id} の theme が空`)
  }
  if (p.theme.includes('サンプル')) {
    error(`essayProblems ${p.id} にサンプル表記が残っている`)
  }
  if (!p.categoryIds || p.categoryIds.length === 0) {
    error(`essayProblems ${p.id} の categoryIds が空`)
  }
  for (const categoryId of p.categoryIds) {
    if (!categoryIds.has(categoryId)) {
      error(`essayProblems ${p.id} の categoryId "${categoryId}" が categories に存在しない`)
    }
  }
  const labels = p.setsumons.map((s) => s.label)
  for (const label of expectedEssayLabels) {
    if (labels.filter((v) => v === label).length !== 1) {
      error(`essayProblems ${p.id} の設問${label}が1件ではない`)
    }
  }
  for (const s of p.setsumons) {
    if (!s.text || s.text.trim() === '') {
      error(`essayProblems ${p.id} 設問${s.label}の text が空`)
    }
    if (s.recommendedChars.min < 0) {
      error(`essayProblems ${p.id} 設問${s.label}の recommendedChars.min が負値`)
    }
    if (s.recommendedChars.max <= 0) {
      error(`essayProblems ${p.id} 設問${s.label}の recommendedChars.max が0以下`)
    }
    if (s.recommendedChars.min > s.recommendedChars.max) {
      error(`essayProblems ${p.id} 設問${s.label}で min > max`)
    }
  }
}

// ─────────────────────────────────────────────
// 結果
// ─────────────────────────────────────────────
runMarkupValidation()
runAfternoonExplanationStructureAudit()

if (errorCount === 0) {
  console.log('[OK] 全データの整合性確認完了')
  process.exit(0)
} else {
  console.error(`[NG] 計 ${errorCount} 件のエラー`)
  process.exit(1)
}
