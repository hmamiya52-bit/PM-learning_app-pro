import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { NOTE_CATEGORY_IDS, NOTE_SECTION_INDEX } from './NoteDetail'
import { getNoteUnderstanding, type UnderstandingLevel } from '../lib/storage'

const NOTE_AVAILABLE = new Set(NOTE_CATEGORY_IDS)

// 弱点フィルタ（理解度ベース）。'all' は絞り込みなし
type WeakFilter = 'all' | 'red' | 'yellow'

const WEAK_FILTERS: { value: WeakFilter; label: string; dot: string; activeClass: string }[] = [
  { value: 'all', label: 'すべて', dot: '', activeClass: 'text-white border-transparent' },
  { value: 'red', label: 'まだ難しい', dot: '#ef4444', activeClass: 'bg-red-500 text-white border-red-500' },
  { value: 'yellow', label: 'なんとなく', dot: '#f59e0b', activeClass: 'bg-amber-500 text-white border-amber-500' },
]

const CARD_BORDER_COLORS: string[] = [
  'border-l-blue-300',
  'border-l-emerald-300',
  'border-l-amber-300',
  'border-l-purple-300',
  'border-l-red-300',
  'border-l-teal-300',
  'border-l-orange-300',
  'border-l-indigo-300',
  'border-l-pink-300',
]

function BookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 9.5a7.5 7.5 0 0013.15 7.15z" />
    </svg>
  )
}

// マッチした部分をハイライト表示
function highlight(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-slate-900 px-0.5 rounded">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function UnderstandingBadges({ categoryId }: { categoryId: string }) {
  const understanding = useMemo(() => getNoteUnderstanding(), [])
  const sections = useMemo(
    () => NOTE_SECTION_INDEX.filter((e) => e.categoryId === categoryId),
    [categoryId],
  )
  const green = sections.filter((e) => understanding[`${categoryId}:${e.sectionIndex}`] === 'green').length
  const yellow = sections.filter((e) => understanding[`${categoryId}:${e.sectionIndex}`] === 'yellow').length
  const red = sections.filter((e) => understanding[`${categoryId}:${e.sectionIndex}`] === 'red').length
  if (green + yellow + red === 0) return null
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {green > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          {green}
        </span>
      )}
      {yellow > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          {yellow}
        </span>
      )}
      {red > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          {red}
        </span>
      )}
    </div>
  )
}

export default function Notes() {
  const [query, setQuery] = useState('')
  const [weakFilter, setWeakFilter] = useState<WeakFilter>('all')
  const trimmed = query.trim()

  // 表示用のカテゴリ一覧（ノート未収録は除外）
  const availableCategories = useMemo(
    () => categories.filter((cat) => NOTE_AVAILABLE.has(cat.id)),
    [],
  )

  // 理解度マップ（このページ上では変化しないためマウント時に一度だけ読む）
  const understanding = useMemo(() => getNoteUnderstanding(), [])

  // 理解度レベルごとの総セクション数（チップに表示）
  const weakCounts = useMemo(() => {
    const counts: Record<UnderstandingLevel, number> = { green: 0, yellow: 0, red: 0 }
    for (const e of NOTE_SECTION_INDEX) {
      const level = understanding[`${e.categoryId}:${e.sectionIndex}`]
      if (level) counts[level] += 1
    }
    return counts
  }, [understanding])

  // 弱点フィルタ結果：該当理解度のセクションを持つカテゴリのみ
  const weakResults = useMemo(() => {
    if (weakFilter === 'all') return null
    const byCat = new Map<string, { sectionIndex: number; heading: string }[]>()
    for (const e of NOTE_SECTION_INDEX) {
      if (understanding[`${e.categoryId}:${e.sectionIndex}`] !== weakFilter) continue
      const arr = byCat.get(e.categoryId) ?? []
      arr.push({ sectionIndex: e.sectionIndex, heading: e.heading })
      byCat.set(e.categoryId, arr)
    }
    return availableCategories
      .map((cat) => ({ cat, headings: byCat.get(cat.id) ?? [] }))
      .filter((x) => x.headings.length > 0)
  }, [weakFilter, understanding, availableCategories])

  // 検索結果：カテゴリごとにマッチした見出しを集める
  const searchResults = useMemo(() => {
    if (!trimmed) return null
    const q = trimmed.toLowerCase()

    // セクション見出しにマッチしたエントリ
    const matchedEntries = NOTE_SECTION_INDEX.filter((e) =>
      e.heading.toLowerCase().includes(q),
    )

    // カテゴリ ID → マッチ見出しリスト
    const byCat = new Map<string, { sectionIndex: number; heading: string }[]>()
    for (const e of matchedEntries) {
      const arr = byCat.get(e.categoryId) ?? []
      arr.push({ sectionIndex: e.sectionIndex, heading: e.heading })
      byCat.set(e.categoryId, arr)
    }

    // カテゴリ名 / 説明文にもマッチさせる（見出しヒット無しでもカテゴリは表示）
    const result = availableCategories
      .map((cat) => {
        const headings = byCat.get(cat.id) ?? []
        const nameHit = cat.name.toLowerCase().includes(q)
        const descHit = (cat.description ?? '').toLowerCase().includes(q)
        if (headings.length === 0 && !nameHit && !descHit) return null
        return { cat, headings, nameHit, descHit }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    return result
  }, [trimmed, availableCategories])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-6">

        {/* Page header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <BookIcon className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-black text-slate-800">ノートモード</h1>
          </div>
          <p className="text-sm text-slate-500">各分野の重要知識を1ページで確認</p>
        </div>

        {/* Search box */}
        <div className="mb-5">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // 検索とフィルタは併用しない（検索優先）
                if (e.target.value.trim()) setWeakFilter('all')
              }}
              placeholder="セクション見出しを検索（例: EVM、クラッシング、サーバントリーダーシップ）"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand"
              aria-label="ノート内のセクション見出しを検索"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 px-1.5"
                aria-label="検索をクリア"
              >
                ×
              </button>
            )}
          </div>
          {trimmed && (
            <p className="mt-2 text-xs text-slate-500">
              「<span className="font-bold text-slate-700">{trimmed}</span>」の検索結果：
              {searchResults && searchResults.length > 0
                ? `${searchResults.length}カテゴリ・${searchResults.reduce((s, r) => s + r.headings.length, 0)}見出し`
                : '一致なし'}
            </p>
          )}

          {/* 弱点フィルタ（理解度ベース） */}
          <div className="flex items-center gap-2 mt-3 flex-wrap" role="group" aria-label="理解度で絞り込み">
            {WEAK_FILTERS.map(({ value, label, dot, activeClass }) => {
              const isActive = weakFilter === value
              const count = value === 'all' ? null : weakCounts[value]
              return (
                <button
                  key={value}
                  onClick={() => {
                    setWeakFilter(value)
                    // フィルタ選択時は検索を解除（検索優先のため両立させない）
                    if (value !== 'all') setQuery('')
                  }}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                    isActive
                      ? activeClass
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  style={isActive && value === 'all' ? { backgroundColor: '#9d5b8b' } : undefined}
                >
                  {dot && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isActive ? '#ffffff' : dot }}
                    />
                  )}
                  <span>{label}</span>
                  {count !== null && (
                    <span className={isActive ? 'text-white/80' : 'text-slate-400'}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 通常モード：カテゴリ一覧 */}
        {!trimmed && weakFilter === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableCategories.map((cat, idx) => {
              const borderColor = CARD_BORDER_COLORS[idx % CARD_BORDER_COLORS.length]
              return (
                <Link
                  key={cat.id}
                  to={`/notes/${cat.id}`}
                  className={`group flex items-center gap-3 bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} px-4 py-3 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`}
                  aria-label={`${cat.name}のノートを開く`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-brand-dark transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {cat.description}
                    </p>
                    <UnderstandingBadges categoryId={cat.id} />
                  </div>
                  <div className="text-slate-300 group-hover:text-brand transition-colors flex-shrink-0">
                    <ArrowRightIcon />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* 弱点フィルタモード：該当理解度のセクションを持つカテゴリ + 見出しリスト */}
        {!trimmed && weakResults && weakResults.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-10 text-center">
            <p className="text-sm text-slate-500">
              「{WEAK_FILTERS.find((f) => f.value === weakFilter)?.label}」を付けたセクションはありません
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              各ノートのセクション見出し右のチェックボックスで理解度を記録できます
            </p>
          </div>
        )}
        {!trimmed && weakResults && weakResults.length > 0 && (
          <>
            <p className="mb-3 text-xs text-slate-500">
              「<span className="font-bold text-slate-700">
                {WEAK_FILTERS.find((f) => f.value === weakFilter)?.label}
              </span>」のセクション：
              {`${weakResults.length}カテゴリ・${weakResults.reduce((s, r) => s + r.headings.length, 0)}見出し`}
            </p>
            <div className="space-y-3">
              {weakResults.map(({ cat, headings }, idx) => {
                const borderColor = CARD_BORDER_COLORS[idx % CARD_BORDER_COLORS.length]
                const dotColor = weakFilter === 'red' ? '#ef4444' : '#f59e0b'
                return (
                  <div
                    key={cat.id}
                    className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} overflow-hidden`}
                  >
                    {/* カテゴリヘッダ */}
                    <Link
                      to={`/notes/${cat.id}`}
                      className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">
                        {headings.length}件
                      </span>
                      <ArrowRightIcon />
                    </Link>

                    {/* 該当セクション見出し */}
                    <ul className="px-4 py-2 divide-y divide-slate-100">
                      {headings.map(({ sectionIndex, heading }) => (
                        <li key={sectionIndex}>
                          <Link
                            to={`/notes/${cat.id}#note-section-${sectionIndex}`}
                            className="flex items-center gap-2 py-2 text-sm text-slate-700 hover:text-brand-dark transition-colors"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: dotColor }}
                            />
                            <span className="flex-1 min-w-0 truncate">{heading}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 検索モード：マッチしたカテゴリ + 見出しリスト */}
        {trimmed && searchResults && searchResults.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            一致するセクション見出しが見つかりませんでした
          </div>
        )}
        {trimmed && searchResults && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map(({ cat, headings, nameHit, descHit }, idx) => {
              const borderColor = CARD_BORDER_COLORS[idx % CARD_BORDER_COLORS.length]
              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} overflow-hidden`}
                >
                  {/* カテゴリヘッダ */}
                  <Link
                    to={`/notes/${cat.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {nameHit ? highlight(cat.name, trimmed) : cat.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                        {descHit ? highlight(cat.description ?? '', trimmed) : cat.description}
                      </p>
                    </div>
                    <ArrowRightIcon />
                  </Link>

                  {/* マッチしたセクション見出し */}
                  {headings.length > 0 && (
                    <ul className="px-4 py-2 divide-y divide-slate-100">
                      {headings.map(({ sectionIndex, heading }) => (
                        <li key={sectionIndex}>
                          <Link
                            to={`/notes/${cat.id}#note-section-${sectionIndex}`}
                            className="flex items-center gap-2 py-2 text-sm text-slate-700 hover:text-brand-dark transition-colors"
                          >
                            <span className="text-slate-300 text-xs">▶</span>
                            <span className="flex-1 min-w-0 truncate">
                              {highlight(heading, trimmed)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
