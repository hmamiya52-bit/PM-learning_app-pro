import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { NOTE_DB, NOTE_CATEGORY_IDS } from '../data/noteDb'
import type { EmphasisToken } from '../data/noteDb'
import { renderTokens, renderText } from '../components/NoteMarkup'
import { getNoteHideRed, setNoteHideRed } from '../lib/storage'

// ─────────────────────────────────────────────
// 午後Ⅰ定石一覧（試験直前の通し読み用）
//
// 各カテゴリノート末尾の「午後Ⅰの定石（〜）」セクションを NOTE_DB から動的に抽出して
// 1ページに集約する。NOTE_DB 側は一切変更しない（理解度記録が categoryId:sectionIndex
// キーで保存されているため、セクションの増減・順序変更は破壊的）。
// ─────────────────────────────────────────────

const TIP_HEADING_MARK = '午後Ⅰの定石'

interface TipGroup {
  categoryId: string
  categoryName: string
  sectionIndex: number
  heading: string
  intro: string[]          // 冒頭の導入文（__ で始まらない項目）
  tips: string[]           // 定石本体（__N. 名称__: 〜 の形式）
  navyItems: EmphasisToken[][]
}

// NOTE_DB から定石セクションを抽出（モジュールロード時に一度だけ）
const TIP_GROUPS: TipGroup[] = NOTE_CATEGORY_IDS.flatMap((categoryId) => {
  const note = NOTE_DB[categoryId]
  if (!note) return []
  const sectionIndex = note.sections.findIndex((s) => s.heading.includes(TIP_HEADING_MARK))
  if (sectionIndex === -1) return []
  const section = note.sections[sectionIndex]
  const items = section.items ?? []
  return [{
    categoryId,
    categoryName: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
    sectionIndex,
    heading: section.heading,
    // 定石本体は「__1. 名称__: 〜」形式。冒頭の導入文だけが __ で始まらない
    intro: items.filter((t) => !t.startsWith('__')),
    tips: items.filter((t) => t.startsWith('__')),
    navyItems: section.navyItems ?? [],
  }]
})

const TOTAL_TIPS = TIP_GROUPS.reduce((s, g) => s + g.tips.length, 0)

// ─────────────────────────────────────────────
// 共通の解き方（カテゴリ横断）
//
// planning §34「午後Ⅰの定石（計画・スケジュール・コスト）」の冒頭行と §34-14
// 「設問の限定語で解答の向きを固定」を軸に、午後Ⅰ全体で使う共通論として再構成。
// ─────────────────────────────────────────────
const COMMON_TECHNIQUES: { title: string; body: string[] }[] = [
  {
    title: '限定語が解答の向きを決める',
    body: [
      '設問の==限定語==を最初に押さえる。「__事業の観点で__」「__理由を__」「__〜に限定して__」「__本文中の語句を用いて__」が代表例で、限定語を外すと内容が正しくても得点にならない',
      '「__本文中の語句を用いて__」と指定された場合は、==本文の表現をそのまま使う==。自分の言葉に置き換えると、採点者が本文との対応を取れなくなる',
      '「__〜に限定して__」は解答範囲の指定。指定された範囲の外にある要素を書くと、その分が無駄になる',
    ],
  },
  {
    title: '因果型で書く（原因→結果を1文で）',
    body: [
      '午後Ⅰの「理由を述べよ」は==因果==（〜だから〜する／〜すると〜になる）で書くのが基本形。原因と結果を1文でつなぐ',
      '本文の状況を==原因==に置き、定石から導いた打ち手や帰結を==結果==に置く。定石は「結論」ではなく「因果をつなぐ根拠」として使う',
      '本文の言葉を==言い換えて==使うと、状況を読み取れていることが伝わる（丸写しと没個性な一般論の中間を狙う）',
    ],
  },
  {
    title: '字数感覚（要素数の見当をつける）',
    body: [
      '==30字==前後は==1要素==（原因1つ→結果1つ）。無理に2つ詰め込むと因果が崩れる',
      '==40〜50字==は==2要素==（原因2つ、または原因1つ＋条件・前提1つ）。字数が増えたら「何をもう1つ書かせたいか」を設問から読み取る',
      '各カテゴリの定石は「理由を30〜40字で書く」ことを前提に整理されている。定石名を見て30字で言い切れるかを自答すると練習になる',
    ],
  },
]

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export default function AfternoonTips() {
  // 赤字マスクはノート詳細と同じ LocalStorage の設定を共有する
  // （暗記テスト中にこのページへ来てもマスクが解除されないようにするため）
  const [hideRed, setHideRed] = useState(() => getNoteHideRed())
  // マスクモードを ON にするたびにインクリメントして RedWord をリセット
  const [maskVersion, setMaskVersion] = useState(0)

  const toggleHide = () => {
    const next = !hideRed
    setHideRed(next)
    setNoteHideRed(next)
    if (next) setMaskVersion((k) => k + 1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-32 pt-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Link to="/notes" className="hover:text-brand transition-colors">ノートモード</Link>
          <span>/</span>
          <span className="text-slate-600">午後Ⅰ定石一覧</span>
        </nav>

        {/* Header */}
        <div className="mb-5">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-2"
            style={{ backgroundColor: '#9d5b8b' }}
          >
            午後Ⅰ対策
          </div>
          <h1 className="text-2xl font-black text-slate-800">午後Ⅰ定石一覧</h1>
          <p className="text-sm text-slate-500 mt-1">
            全 {TIP_GROUPS.length} カテゴリ・{TOTAL_TIPS} 定石を通し読み。試験直前の総ざらい用
          </p>

          {/* 凡例 */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-wrap mt-3">
            <span className="text-red-600 font-bold">赤字</span>
            <span>= 重要暗記ワード</span>
            <span className="mx-1 text-slate-300">|</span>
            {hideRed ? (
              <span className="flex items-center gap-1 flex-wrap">
                <span className="inline-block w-10 rounded text-center text-xs" style={{ backgroundColor: '#c0392b', color: 'transparent' }}>隠れ</span>
                <span>をタップで表示 / もう一度タップで再び隠す</span>
              </span>
            ) : (
              <span>画面下の「赤字を隠す」で暗記テストができます</span>
            )}
            <span className="mx-1 text-slate-300">|</span>
            <span>定石末尾の（）は出題実績</span>
          </div>
        </div>

        {/* 共通の解き方 */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 bg-amber-100">
            <h2 className="text-sm font-bold text-amber-800">★ 共通の解き方（全カテゴリ共通）</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            {COMMON_TECHNIQUES.map((block, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-amber-900 mb-1.5">
                  {i + 1}. {block.title}
                </h3>
                <ul className="space-y-1.5">
                  {block.body.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{renderText(line, hideRed, maskVersion)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* カテゴリ別の定石 */}
        <div className="space-y-5">
          {TIP_GROUPS.map((g) => (
            <div key={g.categoryId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* カテゴリヘッダ（該当ノートのセクションへリンク） */}
              <Link
                to={`/notes/${g.categoryId}#note-section-${g.sectionIndex}`}
                className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#9d5b8b' }}
              >
                <h2 className="text-sm font-bold text-white leading-snug flex-1 min-w-0">
                  {g.categoryName}
                  <span className="font-normal text-white/70 ml-2 text-xs">{g.tips.length} 定石</span>
                </h2>
                <span className="text-xs text-white/80 flex-shrink-0 whitespace-nowrap">ノートで見る →</span>
              </Link>

              {/* 導入文 */}
              {g.intro.length > 0 && (
                <div className="px-5 pt-3 pb-1">
                  {g.intro.map((line, j) => (
                    <p key={j} className="text-xs text-slate-500 leading-relaxed">
                      {renderText(line, hideRed, maskVersion)}
                    </p>
                  ))}
                </div>
              )}

              {/* 定石本体 */}
              <ul className="px-5 py-3 space-y-2">
                {g.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
                    <span>{renderText(tip, hideRed, maskVersion)}</span>
                  </li>
                ))}
              </ul>

              {/* 補足（navyItems） */}
              {g.navyItems.length > 0 && (
                <div className="px-5 pb-4 space-y-1">
                  {g.navyItems.map((tokens, j) => (
                    <p key={j} className="text-xs text-slate-500 leading-relaxed">
                      {renderTokens(tokens, hideRed, maskVersion)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            to="/notes"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand-dark transition-colors"
          >
            <BackIcon />
            ノート一覧へ
          </Link>
          <Link
            to="/afternoon"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#9d5b8b' }}
          >
            午後Ⅰ問題演習へ →
          </Link>
        </div>
      </div>

      {/* ─── スティッキーフッター：赤字を隠す ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex justify-center sm:justify-end">
          <button
            onClick={toggleHide}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${
              hideRed
                ? 'bg-red-600 border-red-600 text-white shadow-red-200'
                : 'bg-white border-red-400 text-red-600 hover:bg-red-50'
            }`}
            aria-pressed={hideRed}
          >
            <span className="text-base">{hideRed ? '👁' : '📕'}</span>
            {hideRed ? '赤字を表示する' : '赤字を隠す'}
          </button>
        </div>
      </div>
    </div>
  )
}
