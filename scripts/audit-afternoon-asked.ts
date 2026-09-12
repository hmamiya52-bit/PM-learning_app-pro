/**
 * 午後Ⅰ「設問の要点」(afternoonExplanations.detail.questionDetails.asked) の機械監査
 *
 * asked は IPA 公式の設問文そのものではなく本アプリ独自の要約のため、公式との
 * 食い違いが混入しうる。全文照合は PDF を読むしかないが、以下は機械的に検出できる:
 *
 * - LIMIT   : asked が主張する字数条件と、IPA 公式解答例の実長が矛盾している
 *             （公式解答例は必ず字数条件を満たすので、矛盾すれば asked 側が誤り）
 * - HEADING : heading が rowKey（設問番号・小問番号）と一致しない
 * - MODEL   : modelAnswer が officialAnswers の解答例と一致しない
 *             ※複数解答の区切りが ／ か改行かの違いだけのものは実害なし
 * - MISSING : 解答行に対応する questionDetail が無い
 *
 * 実行: npm run audit:asked
 */

import { officialAnswers } from '../src/data/officialAnswers'
import { getAfternoonExplanation, makeRowKey } from '../src/data/afternoonExplanations'
import { getAfternoonQuestionTexts } from '../src/data/afternoonQuestionTexts'

/**
 * asked（Claude 著作の設問要約）の機械的な整合性監査。
 * IPA 公式解答例は必ず設問の字数条件を満たすので、
 * 「asked が主張する字数条件」と「公式解答例の実長」が矛盾していれば asked 側が誤り。
 */

const LIMIT_RE = /(\d+)\s*字以内/g
const RANGE_RE = /(\d+)\s*字以上\s*(\d+)\s*字以内/

function len(s: string) { return [...s.replace(/\s/g, '')].length }

type Issue = { kind: string; id: string; rowKey: string; detail: string }
const issues: Issue[] = []

let rows = 0, withLimit = 0, noLimit = 0

for (const set of officialAnswers) {
  const exp = getAfternoonExplanation(set.id)
  const qds = exp?.detail?.questionDetails ?? []
  const byKey = new Map(qds.map(q => [q.rowKey, q]))

  for (const row of set.answers) {
    rows++
    const key = makeRowKey(row.s, row.q, row.t)
    const qd = byKey.get(key)
    if (!qd) { issues.push({ kind: 'MISSING', id: set.id, rowKey: key, detail: 'questionDetail なし' }); continue }

    // 1) heading と rowKey の整合
    const expectHeading = `設問${row.s}${row.q ?? ''}`
    if (!qd.heading.startsWith(expectHeading)) {
      issues.push({ kind: 'HEADING', id: set.id, rowKey: key, detail: `heading="${qd.heading}" 期待="${expectHeading}*"` })
    }

    // 2) modelAnswer と公式解答例の一致
    const norm = (s: string) => s.replace(/\s+/g, '')
    if (norm(qd.modelAnswer) !== norm(row.a)) {
      issues.push({ kind: 'MODEL', id: set.id, rowKey: key, detail: `modelAnswer≠公式\n    model: ${qd.modelAnswer}\n    公式 : ${row.a}` })
    }

    // 3) asked の字数条件 vs 公式解答例の実長
    const range = qd.asked.match(RANGE_RE)
    const limits = [...qd.asked.matchAll(LIMIT_RE)].map(m => Number(m[1]))
    if (limits.length === 0 && !range) { noLimit++; continue }
    withLimit++

    const max = range ? Number(range[2]) : Math.max(...limits)
    const min = range ? Number(range[1]) : 0
    // 公式解答例は改行区切りで複数案ある場合がある。各案が条件を満たすはず
    const candidates = row.a.split('\n').map(s => s.trim()).filter(Boolean)
    for (const c of candidates) {
      const L = len(c)
      if (L > max) {
        issues.push({ kind: 'LIMIT', id: set.id, rowKey: key, detail: `asked="${max}字以内" だが公式解答例は ${L}字\n    公式 : ${c}\n    asked: ${qd.asked}` })
      } else if (min > 0 && L < min) {
        issues.push({ kind: 'LIMIT', id: set.id, rowKey: key, detail: `asked="${min}字以上" だが公式解答例は ${L}字\n    公式 : ${c}` })
      }
    }
  }
}

// 公式設問文の転記カバレッジ
let done = 0
const pending: string[] = []
for (const set of officialAnswers) {
  const texts = getAfternoonQuestionTexts(set.id)
  const n = set.answers.filter(r => !!texts[makeRowKey(r.s, r.q, r.t)]).length
  done += n
  if (n < set.answers.length) pending.push(`${set.id}(${n}/${set.answers.length})`)
}
console.log(`=== 公式設問文の転記: ${done} / ${rows} 行 (${Math.round(done / rows * 100)}%) ===`)
if (pending.length) console.log(`未転記: ${pending.join(' ')}`)
console.log('')
console.log(`=== asked（要約）の監査: ${officialAnswers.length}問 / ${rows}行 ===`)
console.log(`字数条件を明記している asked: ${withLimit} 行 / 明記なし: ${noLimit} 行`)
console.log('')
const byKind = issues.reduce<Record<string, number>>((m, i) => { m[i.kind] = (m[i.kind] ?? 0) + 1; return m }, {})
console.log('検出:', JSON.stringify(byKind))
console.log('')
for (const kind of ['LIMIT', 'HEADING', 'MODEL', 'MISSING']) {
  const list = issues.filter(i => i.kind === kind)
  if (!list.length) continue
  console.log(`--- ${kind} (${list.length}件) ---`)
  list.slice(0, 12).forEach(i => console.log(`  [${i.id} ${i.rowKey}] ${i.detail}`))
  if (list.length > 12) console.log(`  ... 他 ${list.length - 12} 件`)
  console.log('')
}
