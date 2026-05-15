import { useParams, useNavigate, Link } from 'react-router-dom'
import { officialAnswers } from '../data/officialAnswers'
import type { OfficialAnswerSet } from '../data/officialAnswers'
import { afternoonProblems } from '../data/afternoonProblems'
import { processRows, BORDER_OUTER, BORDER_INNER, BORDER_HEAD } from '../lib/answerTable'

// ----------------------------------------------------------------
// Answer table
// ----------------------------------------------------------------

function AnswerTable({ answerSet }: { answerSet: OfficialAnswerSet }) {
  const rows = processRows(answerSet.answers)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs" style={{ border: BORDER_OUTER }}>
        <colgroup>
          {/* 設問列: 小問なし時は colspan=2 で自然に拡張されるため幅固定は不要だが
              小問あり行と揃えるため最小幅を指定 */}
          <col style={{ width: '4rem' }} />
          <col style={{ width: '3.5rem' }} />
          <col />
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            {/* ヘッダーの「設問」は隣の空セルと結合 */}
            <th
              colSpan={2}
              className="py-1.5 px-2 text-center font-bold text-slate-700"
              style={{ border: BORDER_HEAD }}
            >
              設問
            </th>
            <th
              className="py-1.5 px-2 text-left font-bold text-slate-700"
              style={{ border: BORDER_HEAD }}
            >
              解答例・解答の要点
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            // 小問セルを表示するか: showQ かつ qLabel が空でない場合のみ
            const renderQ = row.showQ && row.qLabel !== ''
            // qLabel が空 (純粋な essay 行など) の場合は解答セルを colspan=2 で広げる
            const answerColspan = row.showQ && row.qLabel === '' ? 2 : 1

            return (
              <tr key={i} className="align-top">
                {/* 設問セル (rowspan で複数行分をまとめる) */}
                {row.showS && (
                  <td
                    rowSpan={row.sRowspan}
                    className="py-1.5 px-1 font-bold text-slate-700 whitespace-nowrap align-middle text-center"
                    style={{ border: BORDER_INNER }}
                  >
                    設問{row.s}
                  </td>
                )}

                {/* 小問セル: qLabel が空でない場合のみ表示 */}
                {renderQ && (
                  <td
                    rowSpan={row.qRowspan}
                    className="py-1.5 px-1 text-slate-600 whitespace-nowrap align-middle text-center"
                    style={{ border: BORDER_INNER }}
                  >
                    {row.qLabel}
                  </td>
                )}

                {/* 解答セル */}
                <td
                  colSpan={answerColspan}
                  className="text-slate-800 leading-snug p-0"
                  style={{ border: BORDER_INNER }}
                >
                  {row.inlineT !== undefined ? (
                    /* q+t 両方ある行: t ラベルを縦罫線で区切って解答セル内にインライン表示 */
                    <div className="flex items-stretch">
                      <div
                        className="flex items-center justify-center flex-shrink-0 text-slate-500 text-[11px] py-1.5 px-1.5 whitespace-nowrap"
                        style={{ borderRight: BORDER_INNER }}
                      >
                        {row.inlineT}
                      </div>
                      <div className="px-2 py-1.5 flex-1">{row.a}</div>
                    </div>
                  ) : (
                    <div className="px-2 py-1.5">{row.a}</div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="px-3 py-2 flex justify-end">
        <a
          href={answerSet.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline"
        >
          公式 PDF を開く →
        </a>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function AfternoonAnswerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const answerSet = officialAnswers.find(a => a.id === id)
  const problem = answerSet ? afternoonProblems.find(p => p.id === answerSet.id) : null

  if (!answerSet) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center space-y-3">
          <p className="text-slate-500">解答例が見つかりません</p>
          <Link to="/afternoon" className="text-indigo-600 text-sm hover:underline">← 問題一覧に戻る</Link>
        </div>
      </div>
    )
  }

  // F1-P3: PMでは PM1 のみ。section 分岐廃止 + brand 系色
  const sectionLabel = '午後Ⅰ'
  const sectionColor = 'bg-brand-light text-brand-dark'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <section>
          <div className="rounded-xl bg-indigo-700 text-white px-4 py-3 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {/* 年度バッジ */}
              <span className="text-[11px] font-bold bg-indigo-500 rounded-full px-2 py-0.5 flex-shrink-0">
                {answerSet.year}
              </span>
              {/* 午後Ⅰ/Ⅱ・問番号バッジ */}
              <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${sectionColor}`}>
                {sectionLabel} 問{answerSet.number}
              </span>
              <h1 className="text-sm font-black leading-snug truncate">{problem?.title ?? '公式解答例'}</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-[11px] text-indigo-300 hover:text-white transition-colors flex-shrink-0"
            >
              ← 戻る
            </button>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          {problem?.questionPdfUrl && (
            <a
              href={problem.questionPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              問題PDF
            </a>
          )}
          <Link
            to={`/afternoon/answers/${id}/myAnswer`}
            className="text-xs font-bold text-teal-600 border border-teal-300 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition-colors"
          >
            解答欄で練習する
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <AnswerTable answerSet={answerSet} />
        </div>

        {/* 問題一覧へ戻る */}
        <div className="flex justify-center">
          <Link
            to="/afternoon"
            className="text-xs text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-lg px-4 py-2 hover:border-indigo-300 transition-colors"
          >
            ← 問題一覧へ戻る
          </Link>
        </div>

        <p className="text-[10px] text-slate-400 text-center">
          © 独立行政法人情報処理推進機構（IPA）<br />
          {answerSet.year} プロジェクトマネージャ試験 {sectionLabel} 問{answerSet.number}
        </p>

      </div>
    </div>
  )
}
