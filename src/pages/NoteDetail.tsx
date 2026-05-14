import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { getNoteUnderstanding, setNoteUnderstanding, type UnderstandingLevel } from '../lib/storage'
import { addActivityEvent } from '../lib/activityLog'

// NOTE_DB に存在するカテゴリIDの順序リスト（前後ナビ用 / Notes 一覧フィルタ用）
// PM Learning App: PMBOK第7版ベース 12カテゴリ（categories.ts と同順序）
// F1-P1 段階では NOTE_DB 自体は空（全カテゴリ「準備中」表示）。
// フェーズ2 F2-P1 以降でカテゴリごとに NoteData を投入する。
export const NOTE_CATEGORY_IDS: string[] = [
  'stakeholder', 'team', 'development-approach', 'planning',
  'project-work', 'delivery', 'measurement', 'uncertainty',
  'integration', 'governance', 'tailoring-models', 'service-management',
]

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ProtocolEntry {
  name: string
  transport: string
  ports: string
}

// 強調トークン（記号マークアップ廃止のための構造化データ）
type EmphasisStyle = 'red' | 'navy' | 'plain'
interface EmphasisToken {
  text: string
  style: EmphasisStyle
}

// 復習ノート準拠のリッチプロトコル
interface RichProtocolEntry {
  name: string
  nameStyle?: EmphasisStyle      // プロトコル名の強調（既定 plain）
  layer?: string                 // "レイヤ2" / "レイヤ3" / "レイヤ4" 等（下位レイヤ表用）。数字部分のみ赤字化される
  portTokens?: EmphasisToken[]   // ポート番号トークン（上位レイヤ表用）
  description: EmphasisToken[]   // 説明文（強調混在）
}

interface RichProtocolTable {
  heading: string                // テーブル見出し
  hasPort: boolean               // ポート列を表示するか
  rows: RichProtocolEntry[]
}

// ヘッダ構成図（HTML表＋色分け＋赤字隠し対応）
interface HeaderDiagramCell {
  label: string
  span?: number          // colspan（既定 1）
  bg?: string            // 背景色（CSS color string）
  isRed?: boolean        // ラベルを赤字＋マスク対象にする
  maskDigits?: boolean   // ラベル内の数字だけ赤字＋マスク対象（記号や単位は残す）
  small?: boolean        // 小さめのフォント
}
interface HeaderDiagramRow {
  cells: HeaderDiagramCell[]
}
interface HeaderDiagram {
  title: string
  rows: HeaderDiagramRow[]
  caption?: string       // 図の下に表示する補足
  totalCols?: number     // テーブルの列数（colspan 計算用）
}

interface NoteSection {
  heading: string
  items?: string[]
  protocols?: ProtocolEntry[]
  richProtocolTables?: RichProtocolTable[]   // 復習ノート準拠のプロトコル表
  richItems?: EmphasisToken[][]              // 構造化された箇条書き（赤・ネイビー混在可）
  headerDiagrams?: HeaderDiagram[]           // ヘッダ構成図（HTML表）
  navyItems?: EmphasisToken[][]              // ネイビー強調のみで残す既存項目（各セクション末尾）
}

interface NoteData {
  summary: string
  sections: NoteSection[]
  exam_tips: string[]
}

// ─────────────────────────────────────────────
// 赤字ワードのトグルコンポーネント
// ─────────────────────────────────────────────
interface RedWordProps {
  text: string
  masked: boolean
  version: number // この値が変わると revealed がリセットされる
}

function RedWord({ text, masked, version }: RedWordProps) {
  const [revealed, setRevealed] = useState(false)

  // マスクモードが再度 ON になったらリセット
  useEffect(() => {
    if (masked) setRevealed(false)
  }, [masked, version])

  if (!masked) {
    return <span className="text-red-600 font-bold">{text}</span>
  }
  if (revealed) {
    return (
      <span
        role="button"
        tabIndex={0}
        className="text-red-600 font-bold cursor-pointer underline decoration-dotted"
        title="クリックで再び隠す"
        onClick={() => setRevealed(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(false) } }}
      >
        {text}
      </span>
    )
  }
  return (
    <span
      role="button"
      tabIndex={0}
      className="rounded px-0.5 cursor-pointer select-none"
      style={{ backgroundColor: '#c0392b', color: 'transparent' }}
      title="クリックで表示"
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(true) } }}
    >
      {text}
    </span>
  )
}

// ─────────────────────────────────────────────
// ネイビー強調（隠す機能なし）
// ─────────────────────────────────────────────
function NavyWord({ text }: { text: string }) {
  return (
    <span className="font-bold" style={{ color: '#1a3a5c' }}>
      {text}
    </span>
  )
}

// ─────────────────────────────────────────────
// ヘッダ構成図ビュー（HTML表＋色分け＋赤字隠し）
// ─────────────────────────────────────────────
function HeaderDiagramView({
  dg,
  hideRed,
  version,
}: {
  dg: HeaderDiagram
  hideRed: boolean
  version: number
}) {
  return (
    <figure className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <figcaption className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border-b border-slate-200">
        {dg.title}
      </figcaption>
      <div className="overflow-x-auto p-3">
        <table className="w-full border-collapse text-[11px]" style={{ tableLayout: 'fixed' }}>
          <tbody>
            {dg.rows.map((row, ri) => (
              <tr key={ri}>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    colSpan={cell.span ?? 1}
                    className="border border-slate-300 text-center align-middle whitespace-pre-line leading-tight"
                    style={{
                      backgroundColor: cell.bg ?? '#ffffff',
                      padding: cell.small ? '4px 2px' : '6px 4px',
                      fontSize: cell.small ? '10px' : undefined,
                    }}
                  >
                    {cell.maskDigits ? (
                      <span className="text-slate-800 font-medium">
                        {cell.label.split(/(\d+)/g).map((part, pi) =>
                          /^\d+$/.test(part) ? (
                            <RedWord key={pi} text={part} masked={hideRed} version={version} />
                          ) : (
                            <span key={pi}>{part}</span>
                          ),
                        )}
                      </span>
                    ) : cell.isRed ? (
                      <RedWord text={cell.label} masked={hideRed} version={version} />
                    ) : (
                      <span className="text-slate-800 font-medium">{cell.label}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dg.caption && (
        <p className="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-200 bg-slate-50">
          {dg.caption}
        </p>
      )}
    </figure>
  )
}

// ─────────────────────────────────────────────
// 階層インデント検出
//   箇条書きの先頭トークンに含まれる全角スペース（　）の数で
//   インデントレベルを判定（最大2）。先頭の全角スペースは
//   レンダリング時に剥がし、視覚的なインデント／小さめのドットで表現する。
// ─────────────────────────────────────────────
function detectIndent(tokens: EmphasisToken[]): {
  level: number
  stripped: EmphasisToken[]
} {
  if (tokens.length === 0) return { level: 0, stripped: tokens }
  const first = tokens[0]
  const m = first.text.match(/^(　+)/)
  if (!m) return { level: 0, stripped: tokens }
  const level = Math.min(m[1].length, 2) // 最大2レベル
  const head = { ...first, text: first.text.slice(m[1].length) }
  // 剥がしたあと先頭が空文字になったらドロップ
  const rest = head.text === '' ? tokens.slice(1) : [head, ...tokens.slice(1)]
  return { level, stripped: rest }
}

// インデントレベル別のスタイル
function indentStyles(level: number, palette: 'blue' | 'slate' = 'blue') {
  if (level === 0) {
    return {
      padClass: '',
      dotClass: palette === 'blue' ? 'bg-blue-400' : 'bg-slate-400',
      dotSize: 'w-1.5 h-1.5',
      textClass: 'text-slate-700',
    }
  }
  if (level === 1) {
    return {
      padClass: 'ml-5',
      dotClass: palette === 'blue' ? 'bg-blue-300' : 'bg-slate-300',
      dotSize: 'w-1.5 h-1.5',
      textClass: 'text-slate-700',
    }
  }
  // level >= 2
  return {
    padClass: 'ml-10',
    dotClass: palette === 'blue' ? 'bg-blue-200' : 'bg-slate-300',
    dotSize: 'w-1 h-1',
    textClass: 'text-slate-600',
  }
}

// ─────────────────────────────────────────────
// 強調トークン配列 → React ノード（記号マークアップ不使用）
// ─────────────────────────────────────────────
function renderTokens(
  tokens: EmphasisToken[],
  hideRed: boolean,
  version: number,
): React.ReactNode {
  return tokens.map((tok, i) => {
    if (tok.style === 'red') {
      return <RedWord key={i} text={tok.text} masked={hideRed} version={version} />
    }
    if (tok.style === 'navy') {
      return <NavyWord key={i} text={tok.text} />
    }
    return <span key={i}>{tok.text}</span>
  })
}

// ─────────────────────────────────────────────
// Render helper: ==text== → RedWord コンポーネント
// ─────────────────────────────────────────────
function renderText(text: string, hideRed: boolean, version: number): React.ReactNode {
  const parts = text.split(/(==.+?==)/g)
  return parts.map((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      const inner = part.slice(2, -2)
      return <RedWord key={i} text={inner} masked={hideRed} version={version} />
    }
    return <span key={i}>{part}</span>
  })
}

// ─────────────────────────────────────────────
// プロトコルテーブル用：名前/ポートを個別トグル
// ─────────────────────────────────────────────
interface ProtoCellProps {
  text: string
  isRed: boolean    // この列が「赤字対象」か
  isHidden: boolean // 赤字を隠す状態か（= isRed && hideRed）
  isPort?: boolean  // ポート列：数字のみ赤字・マスク、記号は残す
  version: number
}

function ProtoCell({ text, isRed, isHidden, isPort, version }: ProtoCellProps) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setRevealed(false)
  }, [isRed, isHidden, version])

  // 赤字対象でない → 通常表示
  if (!isRed) {
    return <span className="font-semibold text-slate-800">{text}</span>
  }

  // ── ポート列：数字のみ対象 ──
  if (isPort) {
    const parts = text.split(/(\d+)/g)
    const renderParts = (numClass: string) =>
      parts.map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className={numClass}>{part}</span>
        ) : (
          <span key={i} className="text-slate-600">{part}</span>
        )
      )

    if (!isHidden) {
      // 赤字表示（非マスク）：数字だけ赤
      return <span>{renderParts('text-red-600 font-bold')}</span>
    }
    // マスク状態
    return (
      <span
        role="button" tabIndex={0}
        className="cursor-pointer"
        title={revealed ? 'タップで再び隠す' : 'タップで表示'}
        onClick={() => setRevealed((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed((v) => !v) } }}
      >
        {parts.map((part, i) =>
          /^\d+$/.test(part) ? (
            revealed ? (
              <span key={i} className="text-red-600 font-bold underline decoration-dotted">{part}</span>
            ) : (
              <span
                key={i}
                className="rounded select-none"
                style={{ backgroundColor: '#c0392b', color: 'transparent', padding: '0 2px' }}
              >{part}</span>
            )
          ) : (
            <span key={i} className="text-slate-500">{part}</span>
          )
        )}
      </span>
    )
  }

  // ── 名前列：全体を対象 ──
  if (!isHidden) {
    // 赤字表示（非マスク）
    return <span className="text-red-600 font-bold">{text}</span>
  }
  // マスク状態
  if (revealed) {
    return (
      <span
        role="button" tabIndex={0}
        className="text-red-600 font-bold cursor-pointer underline decoration-dotted"
        title="タップで再び隠す"
        onClick={() => setRevealed(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(false) } }}
      >
        {text}
      </span>
    )
  }
  return (
    <span
      role="button" tabIndex={0}
      className="rounded px-0.5 cursor-pointer select-none"
      style={{ backgroundColor: '#c0392b', color: 'transparent' }}
      title="タップで表示"
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(true) } }}
    >
      {text}
    </span>
  )
}

// ─────────────────────────────────────────────
// Note content database (all 19 categories)
// ==重要語== で赤字マーク
// ─────────────────────────────────────────────
const NOTE_DB: Record<string, NoteData> = {
  // フェーズ2 F2-P1 以降でカテゴリごとの NoteData を投入する（現状は全カテゴリ「準備中」表示）
}

// ─────────────────────────────────────────────
// セクション見出しインデックス（Notes 一覧の検索機能で使用）
// ─────────────────────────────────────────────
export interface NoteSectionIndexEntry {
  categoryId: string
  sectionIndex: number
  heading: string
}

export const NOTE_SECTION_INDEX: NoteSectionIndexEntry[] = NOTE_CATEGORY_IDS.flatMap(
  (categoryId) => {
    const note = NOTE_DB[categoryId]
    if (!note) return []
    return note.sections.map((section, sectionIndex) => ({
      categoryId,
      sectionIndex,
      heading: section.heading,
    }))
  },
)

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function NoteDetail() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const location = useLocation()
  const category = categories.find((c) => c.id === categoryId)
  const note = categoryId ? NOTE_DB[categoryId] : undefined
  const [hideRed, setHideRed] = useState(false)
  // 検索ジャンプ時のハイライト対象セクション
  const [highlightedSection, setHighlightedSection] = useState<number | null>(null)
  // マスクモードを ON にするたびにインクリメントして RedWord をリセット
  const [maskVersion, setMaskVersion] = useState(0)
  // プロトコルテーブル専用マスクモード（protocol-review ページのみ）
  const [protoMask, setProtoMask] = useState<'none' | 'name' | 'port'>('none')
  const [protoVersion, setProtoVersion] = useState(0)

  const setProtoMaskMode = (mode: 'none' | 'name' | 'port') => {
    setProtoMask(mode)
    setProtoVersion((v) => v + 1)
  }

  const [understanding, setUnderstanding] = useState(() => getNoteUnderstanding())

  const handleUnderstanding = (sectionIndex: number, level: UnderstandingLevel) => {
    const key = `${categoryId}:${sectionIndex}`
    const next = understanding[key] === level ? null : level
    setNoteUnderstanding(categoryId!, sectionIndex, next)
    setUnderstanding(getNoteUnderstanding())
    if (next !== null) {
      const now = new Date()
      addActivityEvent({
        type: 'note-check',
        date: now.toISOString().slice(0, 10),
        createdAt: now.toISOString(),
        xp: 0,
        payload: {
          noteId: categoryId!,
          noteName: category?.name ?? categoryId!,
          level: next,
          sectionLabel: note?.sections[sectionIndex]?.heading ?? `セクション${sectionIndex + 1}`,
        },
      })
    }
  }

  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleHide = () => {
    setHideRed((v) => {
      const next = !v
      if (next) {
        setMaskVersion((k) => k + 1) // ONにするとき全リセット
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        setToastVisible(true)
        toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000)
      }
      return next
    })
  }

  // 検索ジャンプ：URLのハッシュ #note-section-N に対応するセクションへスクロール＆ハイライト
  useEffect(() => {
    const m = location.hash.match(/^#note-section-(\d+)$/)
    if (!m) {
      setHighlightedSection(null)
      return
    }
    const idx = parseInt(m[1], 10)
    if (!note || idx < 0 || idx >= note.sections.length) return
    setHighlightedSection(idx)
    // 描画後にスクロール
    const timer = setTimeout(() => {
      const el = document.getElementById(`note-section-${idx}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    // 2秒後にハイライトを解除
    const fadeTimer = setTimeout(() => setHighlightedSection(null), 2200)
    return () => {
      clearTimeout(timer)
      clearTimeout(fadeTimer)
    }
  }, [location.hash, note, categoryId])

  // 前後のノートカテゴリ
  const currentIdx = categoryId ? NOTE_CATEGORY_IDS.indexOf(categoryId) : -1
  const prevId = currentIdx > 0 ? NOTE_CATEGORY_IDS[currentIdx - 1] : null
  const nextId = currentIdx < NOTE_CATEGORY_IDS.length - 1 ? NOTE_CATEGORY_IDS[currentIdx + 1] : null
  const prevCategory = prevId ? categories.find((c) => c.id === prevId) : null
  const nextCategory = nextId ? categories.find((c) => c.id === nextId) : null

  // カテゴリ自体が見つからない → URL ミスマッチなので汎用エラー
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <p className="text-slate-500">カテゴリが見つかりません</p>
        <Link to="/notes" className="text-brand underline text-sm">ノート一覧へ戻る</Link>
      </div>
    )
  }

  // カテゴリは存在するが NOTE_DB にエントリ無し → F1-P1 段階の「準備中」表示
  // フェーズ2 F2-P1 以降で各カテゴリの NoteData を投入したら、この分岐は自然と通らなくなる
  if (!note) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto px-4 pb-32 pt-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to="/notes" className="hover:text-brand transition-colors">ノートモード</Link>
            <span>/</span>
            <span className="text-slate-600">{category.name}</span>
          </nav>
          <div className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm">
            <h1 className="text-xl font-black text-slate-800 mb-3">{category.name} ノート</h1>
            <p className="text-slate-500 text-sm">
              このカテゴリのノートは <span className="font-bold text-brand-dark">準備中</span> です。
            </p>
            <p className="text-slate-400 text-xs mt-2">フェーズ2 でコンテンツを順次投入します。</p>
            <Link
              to="/notes"
              className="inline-block mt-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm font-bold"
            >
              ← ノート一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-32 pt-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Link to="/notes" className="hover:text-blue-600 transition-colors">ノートモード</Link>
          <span>/</span>
          <span className="text-slate-600">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-2"
                style={{ backgroundColor: '#1a3a5c' }}
              >
                {category.name}
              </div>
              <h1 className="text-2xl font-black text-slate-800">{category.name} ノート</h1>
            </div>

          </div>

          {/* 凡例 */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-wrap">
            <span className="text-red-600 font-bold">赤字</span>
            <span>= 重要暗記ワード</span>
            <span className="mx-1 text-slate-300">|</span>
            {hideRed || (categoryId === 'protocol-review' && protoMask !== 'none') ? (
              <span className="flex items-center gap-1 flex-wrap">
                <span className="inline-block w-10 rounded text-center text-xs" style={{ backgroundColor: '#c0392b', color: 'transparent' }}>隠れ</span>
                <span>をタップで表示 / もう一度タップで再び隠す</span>
              </span>
            ) : (
              <span>画面下の「赤字を隠す」で暗記テストができます</span>
            )}
            <span className="mx-1 text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" fill="#10b981" stroke="#10b981" strokeWidth="1.75"/>
                <path d="M5.5 10.5 L8.5 13.5 L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>チェックボックスで理解度を記録できます</span>
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {note.sections.map((section, i) => (
            <div
              key={i}
              id={`note-section-${i}`}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden scroll-mt-20 transition-all ${
                highlightedSection === i ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200'
              }`}
            >
              <div
                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2"
                style={{ backgroundColor: '#1a3a5c' }}
              >
                <h2 className="text-sm font-bold text-white leading-snug flex-1">{section.heading}</h2>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {section.protocols && (
                    <>
                      <button
                        onClick={() => setProtoMaskMode(protoMask === 'name' ? 'none' : 'name')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          protoMask === 'name'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                        }`}
                      >
                        {protoMask === 'name' ? '名前が赤字 ✓' : '名前を赤字に'}
                      </button>
                      <button
                        onClick={() => setProtoMaskMode(protoMask === 'port' ? 'none' : 'port')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          protoMask === 'port'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                        }`}
                      >
                        {protoMask === 'port' ? 'ポートが赤字 ✓' : 'ポートを赤字に'}
                      </button>
                      <div className="w-px h-4 bg-blue-700 mx-0.5" />
                    </>
                  )}
                  {(section.richItems || section.protocols || section.richProtocolTables || section.headerDiagrams) && (
                    (['green', 'yellow', 'red'] as UnderstandingLevel[]).map((level) => {
                      const isActive = understanding[`${categoryId}:${i}`] === level
                      const fillColor = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' }[level]
                      const labelMap = {
                        green: '理解できた',
                        yellow: 'なんとなく',
                        red: 'まだ難しい',
                      }
                      return (
                        <button
                          key={level}
                          onClick={(e) => { e.stopPropagation(); handleUnderstanding(i, level) }}
                          title={labelMap[level]}
                          aria-label={labelMap[level]}
                          aria-pressed={isActive}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect
                              x="1.5" y="1.5" width="17" height="17" rx="3.5"
                              fill={fillColor}
                              fillOpacity={isActive ? 1 : 0.35}
                              stroke={fillColor}
                              strokeOpacity={isActive ? 1 : 0.5}
                              strokeWidth="1.75"
                            />
                            <path
                              d="M5.5 10.5 L8.5 13.5 L14.5 7"
                              stroke="white"
                              strokeOpacity={isActive ? 1 : 0.6}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
              {section.protocols ? (
                <div className="px-5 py-3 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-100">
                        <th className="text-left pb-2 pr-4 font-semibold">プロトコル</th>
                        <th className="text-left pb-2 pr-4 font-semibold w-20">種別</th>
                        <th className="text-left pb-2 font-semibold">ポート / 番号</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.protocols.map((entry, j) => (
                        <tr key={j} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-1.5 pr-4">
                            <ProtoCell
                              text={entry.name}
                              isRed={protoMask === 'name'}
                              isHidden={protoMask === 'name' && hideRed}
                              version={protoVersion + maskVersion}
                            />
                          </td>
                          <td className="py-1.5 pr-4 text-slate-400 text-xs font-mono">{entry.transport}</td>
                          <td className="py-1.5 font-mono text-xs">
                            <ProtoCell
                              text={entry.ports}
                              isRed={protoMask === 'port'}
                              isHidden={protoMask === 'port' && hideRed}
                              isPort
                              version={protoVersion + maskVersion}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : section.richProtocolTables ? (
                <div className="px-5 py-3 space-y-4">
                  {section.richProtocolTables.map((tbl, ti) => (
                    <div key={ti} className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="text-xs text-slate-400 border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-2 px-2 font-semibold w-28">プロトコル名</th>
                            {!tbl.hasPort && (
                              <th className="text-left py-2 px-2 font-semibold w-20">レイヤ</th>
                            )}
                            {tbl.hasPort && (
                              <th className="text-left py-2 px-2 font-semibold w-32">ポート番号</th>
                            )}
                            <th className="text-left py-2 px-2 font-semibold">説明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tbl.rows.map((row, j) => (
                            <tr key={j} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors align-top">
                              <td className="py-2 px-2 font-mono text-xs whitespace-nowrap">
                                {row.nameStyle === 'red' ? (
                                  <RedWord text={row.name} masked={hideRed} version={maskVersion} />
                                ) : row.nameStyle === 'navy' ? (
                                  <NavyWord text={row.name} />
                                ) : (
                                  <span className="font-bold text-slate-800">{row.name}</span>
                                )}
                              </td>
                              {!tbl.hasPort && (
                                <td className="py-2 px-2 text-xs whitespace-nowrap">
                                  {row.layer ? (() => {
                                    const m = row.layer.match(/^(レイヤ)(\d+)$/)
                                    if (m) {
                                      return (
                                        <span className="text-slate-500">
                                          {m[1]}
                                          <RedWord text={m[2]} masked={hideRed} version={maskVersion} />
                                        </span>
                                      )
                                    }
                                    return <span className="text-slate-500">{row.layer}</span>
                                  })() : <span className="text-slate-300">—</span>}
                                </td>
                              )}
                              {tbl.hasPort && (
                                <td className="py-2 px-2 font-mono text-xs whitespace-nowrap">
                                  {row.portTokens
                                    ? renderTokens(row.portTokens, hideRed, maskVersion)
                                    : <span className="text-slate-300">—</span>}
                                </td>
                              )}
                              <td className="py-2 px-2 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                {renderTokens(row.description, hideRed, maskVersion)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : section.richItems ? (
                <ul className="px-5 py-4 space-y-2">
                  {section.richItems.map((tokens, j) => {
                    const { level, stripped } = detectIndent(tokens)
                    const s = indentStyles(level, 'blue')
                    return (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm leading-relaxed ${s.padClass} ${s.textClass}`}
                      >
                        <span className={`flex-shrink-0 mt-1.5 rounded-full ${s.dotSize} ${s.dotClass}`} />
                        <span>{renderTokens(stripped, hideRed, maskVersion)}</span>
                      </li>
                    )
                  })}
                  {section.headerDiagrams && section.headerDiagrams.length > 0 && (
                    <li className="list-none pt-2 space-y-4">
                      {section.headerDiagrams.map((dg, k) => (
                        <HeaderDiagramView key={k} dg={dg} hideRed={hideRed} version={maskVersion} />
                      ))}
                    </li>
                  )}
                </ul>
              ) : section.headerDiagrams ? (
                <div className="px-5 py-4 space-y-4">
                  {section.headerDiagrams.map((dg, k) => (
                    <HeaderDiagramView key={k} dg={dg} hideRed={hideRed} version={maskVersion} />
                  ))}
                </div>
              ) : section.navyItems ? (
                <ul className="px-5 py-4 space-y-2">
                  {section.navyItems.map((tokens, j) => {
                    const { level, stripped } = detectIndent(tokens)
                    const s = indentStyles(level, 'slate')
                    return (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm leading-relaxed ${s.padClass} ${s.textClass}`}
                      >
                        <span className={`flex-shrink-0 mt-1.5 rounded-full ${s.dotSize} ${s.dotClass}`} />
                        <span>{renderTokens(stripped, hideRed, maskVersion)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <ul className="px-5 py-4 space-y-2">
                  {(section.items ?? []).map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{renderText(item, hideRed, maskVersion)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Exam Tips */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 bg-amber-100">
            <h2 className="text-sm font-bold text-amber-800">★ 試験で狙われるポイント</h2>
          </div>
          <ul className="px-5 py-4 space-y-2">
            {note.exam_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900 leading-relaxed">
                <span className="flex-shrink-0 mt-0.5 text-amber-500 font-bold">!</span>
                <span>{renderText(tip, false, maskVersion)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 前後ナビ */}
        {(prevCategory || nextCategory) && (
          <div className="mt-6 flex gap-3">
            {prevCategory ? (
              <Link
                to={`/notes/${prevCategory.id}`}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors min-w-0"
              >
                <span className="flex-shrink-0">←</span>
                <span className="truncate">{prevCategory.name}</span>
              </Link>
            ) : <div className="flex-1" />}
            {nextCategory ? (
              <Link
                to={`/notes/${nextCategory.id}`}
                className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors min-w-0"
              >
                <span className="truncate">{nextCategory.name}</span>
                <span className="flex-shrink-0">→</span>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/notes"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
          >
            ← ノート一覧へ
          </Link>
          <Link
            to={`/quiz?mode=topic&category=${category.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#1a3a5c' }}
          >
            問題を解く →
          </Link>
        </div>
      </div>
      {/* ─── トースト通知 ─── */}
      {toastVisible && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 bg-slate-800 text-white text-sm rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 whitespace-nowrap"
          role="status"
          aria-live="polite"
        >
          <span>👆</span>
          <span>赤字をタップすると答えが表示されます</span>
        </div>
      )}
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
