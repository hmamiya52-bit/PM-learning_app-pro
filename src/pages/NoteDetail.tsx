import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { getNoteUnderstanding, setNoteUnderstanding, type UnderstandingLevel } from '../lib/storage'
import { addActivityEvent } from '../lib/activityLog'
import type { QuestionFigure } from '../types'
import { QuestionFigureView } from '../components/QuestionFigureView'

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
  figures?: QuestionFigure[]                 // SVG/table 図表（F2-figures で導入。マトリクス/ベン図/キューブ/フロー等）
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
    <span className="font-bold" style={{ color: '#9d5b8b' }}>
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
      dotClass: palette === 'blue' ? 'bg-brand' : 'bg-slate-400',
      dotSize: 'w-1.5 h-1.5',
      textClass: 'text-slate-700',
    }
  }
  if (level === 1) {
    return {
      padClass: 'ml-5',
      dotClass: palette === 'blue' ? 'bg-brand-light' : 'bg-slate-300',
      dotSize: 'w-1.5 h-1.5',
      textClass: 'text-slate-700',
    }
  }
  // level >= 2
  return {
    padClass: 'ml-10',
    dotClass: palette === 'blue' ? 'bg-brand-light' : 'bg-slate-300',
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
// Render helper:
//   ==text== → RedWord（赤字・マスク可、暗記対象キーワード用）
//   __text__ → NavyWord（ネイビー・マスクなし、ラベルや構造的強調用）
// ─────────────────────────────────────────────
function renderText(text: string, hideRed: boolean, version: number): React.ReactNode {
  const parts = text.split(/(==.+?==|__.+?__)/g)
  return parts.map((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      const inner = part.slice(2, -2)
      return <RedWord key={i} text={inner} masked={hideRed} version={version} />
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      const inner = part.slice(2, -2)
      return <NavyWord key={i} text={inner} />
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
// Note content database (PM 12 categories)
//
// マークアップ規約:
//   ==重要語==  → RedWord（赤字・マスクトグル対象）
//                 試験で問われる固有用語・PMBOK/IPA 用語・暗記対象キーワード
//   __ラベル__  → NavyWord（ネイビー #9d5b8b・マスクなし）
//                 番号ラベル（成果1/対策1/対応1）、列挙の頭、一般語の構造的強調、
//                 ひっかけ観点の見出しなど、隠す必要のない強調
//
// 判断軸:「答えとして暗記すべきか」を基準に分ける。
//   - PMBOK の正式用語・分類・プロセス名 → 赤字
//   - 列挙ラベル・章番号・一般語・観点見出し → ネイビー
//
// F1.5-P2 (2026-05-16): stakeholder を投入（パイロットカテゴリ）
// 残 11 カテゴリは F2-P1 で投入予定（PMBOK第7版＋IPA PM試験シラバスベース）
// ─────────────────────────────────────────────
export const NOTE_DB: Record<string, NoteData> = {
  // ───────────────────────────────────────────
  // 1. ステークホルダー（パイロットカテゴリ / F1.5-P2 投入）
  // ───────────────────────────────────────────
  stakeholder: {
    summary:
      'プロジェクトに影響を与える、または影響を受ける個人・組織を識別し、分析・優先順位付け・エンゲージメント計画・監視を行う活動領域。PMBOK第7版では独立したパフォーマンス領域として扱われ、PM試験 午前II・午後I 双方で頻出。',
    sections: [
      // ── A. 定義・基本概念 ──
      {
        heading: '1. ステークホルダーとは',
        items: [
          'プロジェクトの結果に影響を与える、または影響を受ける可能性のある__個人__または__組織__の総称',
          'PMBOK第7版では==ステークホルダー・パフォーマンス領域==として独立した章で扱われる（PMBOK7th p.8, p.10）',
          'ステークホルダーは__プロジェクトのライフサイクル全体__で変動するため、継続的な再識別が必要',
          '効果的なステークホルダー関与は__プロジェクト成功確率__を直接的に高める',
          '個人だけでなくグループ・部門・組織・規制当局など__法人格を持たない集団__も含む',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第13章「ステークホルダー・マネジメント」／PMBOK第7版「ステークホルダー・パフォーマンス領域」／IPA PM試験シラバス Ver7.1 §1', style: 'navy' }]],
      },
      {
        heading: '2. ステークホルダーの分類軸',
        items: [
          '==内部ステークホルダー==: 組織内部の関係者。スポンサー・PM・チーム・機能部門マネジャー・経営層など',
          '==外部ステークホルダー==: 組織外の関係者。顧客・ユーザ・サプライヤ・規制当局・地域社会・競合など',
          '==顕在ステークホルダー==: 関与が明示的で識別済みの関係者',
          '==潜在ステークホルダー==: 識別されていないが影響を受ける可能性のある関係者',
          '==主要ステークホルダー==: プロジェクト成功に直接的影響を持つ関係者',
          '==副次的ステークホルダー==: 間接的に影響する関係者',
          '分類軸は重ね合わせて使う（例: 「外部かつ主要」=顧客は最優先対応）',
        ],
      },
      {
        heading: '3. ステークホルダーの影響と関心',
        items: [
          '==Power（権力）==: 意思決定を強制する能力。組織階層・契約条件・予算権限などの公式権威に由来',
          '==Influence（影響力）==: 他者を動かす能力。非公式ネットワーク・専門性・人脈に基づく',
          '==Impact（インパクト）==: プロジェクトの変更を引き起こす、または受ける度合い',
          '==Interest（関心）==: プロジェクト結果への注目度・関与意欲',
          '4軸（Power/Influence/Impact/Interest）の組合せで分析マトリクスを構築する',
          'Influence と Impact は混同されやすい（試験頻出のひっかけポイント）',
        ],
        navyItems: [[{ text: 'Power は「強制力」、Influence は「説得・誘導力」と区別すると覚えやすい', style: 'navy' }]],
      },
      {
        heading: '4. プロジェクトへの関与レベル（5段階）',
        items: [
          '==不認識==（Unaware）: プロジェクトの存在自体を知らない',
          '==抵抗==（Resistant）: プロジェクトを認識しているが反対している',
          '==中立==（Neutral）: 認識しているが支持も反対もしない',
          '==支持==（Supportive）: プロジェクトを認識し成功を望んでいる',
          '==主導==（Leading）: 積極的にプロジェクトを推進する',
          '各レベルは現状（Current, ==C==）と望ましい状態（Desired, ==D==）の2軸で評価する',
          'C と D のギャップが関与戦略の出発点となる',
        ],
      },
      {
        heading: '5. 要求と期待の違い',
        items: [
          '==要求==（Requirements）: 明示的・文書化されたニーズ。契約・要件定義書に記載',
          '==期待==（Expectations）: 暗黙的・前提とされているニーズ。明示されないことが多い',
          '期待を要求に変換するプロセスが==要求事項収集==（インタビュー・ワークショップ等）',
          '期待の不一致は==スコープ・クリープ==や紛争・受入拒否の主因となる',
          'PM試験では「明示的要求と暗黙的期待のどちらに分類されるか」を問う設問が頻出',
        ],
      },
      {
        heading: '6. パフォーマンス領域の目的と成果',
        items: [
          '　__成果1__: ステークホルダーとの==生産的な作業関係==の構築',
          '　__成果2__: ステークホルダーが==プロジェクト目的に合意==している状態',
          '　__成果3__: 利益を受けるステークホルダーが==支持者==となる',
          '　__成果4__: 反対するステークホルダーが==プロジェクトに悪影響を及ぼさない==',
          '活動サイクル: ==識別 → 理解 → 分析 → 優先順位付け → 関与 → 監視==',
          'PMBOK7 では「予測型」「適応型」いずれのライフサイクルでも同じ成果が適用される',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「ステークホルダー・パフォーマンス領域」目的セクション', style: 'navy' }]],
      },

      // ── B. 識別プロセス ──
      {
        heading: '7. 識別のタイミングと反復性',
        items: [
          '識別は__プロジェクト開始時__の1回だけでは不十分',
          'プロジェクトのライフサイクル全体を通じて==反復的==に実施する',
          '識別のトリガー: 体制変更・スコープ変更・フェーズゲート・課題発生時',
          '適応型ライフサイクル（アジャイル）では__各イテレーション開始時__に再識別',
          '識別漏れは__プロジェクト後半での要件追加__・受入拒否のリスクを高める',
        ],
        navyItems: [[{ text: '第6版では 13.1「ステークホルダーの特定」プロセスが対応（立上げプロセス群、§32 参照）', style: 'navy' }]],
      },
      {
        heading: '8. 識別の技法',
        items: [
          '==エキスパート判断==: 経験豊富なPM・コンサルタントへの相談',
          '==データ収集==: 質問書・アンケート、ブレーンストーミング',
          '==データ分析==: ステークホルダー分析・文書分析（過去プロジェクトの記録）',
          '==データ表現==: ステークホルダー・マッピング／表現（マトリクス、登録簿）',
          '==会議==: キックオフ・ワークショップでの集合的識別',
          '組織内の==組織図==・==プロジェクト憲章==・==調達文書==も識別の入力となる',
        ],
      },
      {
        heading: '9. ステークホルダー登録簿の構造',
        items: [
          'ステークホルダー識別の__主要なアウトプット__',
          '==識別情報==: 氏名・組織内の位置・役割・所在地・連絡先・プロジェクトでの責任',
          '==評価情報==: 主な要求事項・期待・潜在的な影響度・特に関心のあるフェーズ',
          '==ステークホルダー分類==: 内部/外部・支持/中立/反対・主要/副次など',
          '登録簿は__生きた文書__であり、関与状況の変化に応じて随時更新する',
          'ステークホルダー登録簿は==コミュニケーション・マネジメント計画==の重要な入力となる',
        ],
        navyItems: [[{ text: 'PM試験 午前II・午後I で登録簿の構成項目・更新タイミングが頻出。第6版では 13.1.3.1 主要アウトプット（§32 参照）', style: 'navy' }]],
      },
      {
        heading: '10. 識別の入力情報',
        items: [
          '==プロジェクト憲章==: 主要ステークホルダー（スポンサー・主要顧客）が記載されている',
          '==ビジネス文書==: ビジネスケース・ベネフィット・マネジメント計画書',
          '==合意書==: 契約書・覚書（MOU）に外部ステークホルダーが規定されている',
          '==調達文書==: ベンダー・サプライヤ・規制要件への準拠',
          '==組織体の環境要因==: 組織文化・政治情勢・市場動向',
          '==組織のプロセス資産==: 過去プロジェクトの登録簿テンプレート・教訓',
        ],
      },
      {
        heading: '11. 識別漏れのリスクと対策',
        items: [
          '識別漏れの典型例: __間接的影響者__（地域住民・労組）、__規制当局__、__退職予定の現業ユーザ__',
          'リスク: プロジェクト終盤の==スコープ変更要求==・==受入拒否==・__訴訟__',
          '　__対策1__: __複数視点__で識別する（PM・スポンサー・ベテラン・現場の4視点）',
          '　__対策2__: __類似プロジェクトの教訓__を必ず参照する',
          '　__対策3__: ==フェーズゲート==で識別の妥当性をレビューする',
          'IPA午後Ⅰでは「識別漏れの典型シナリオ」が記述問題として頻出',
        ],
      },

      // ── C. 分析・優先順位付け ──
      {
        heading: '12. ステークホルダー分析の目的とアウトプット',
        items: [
          '目的: ==関与戦略==・==コミュニケーション要求==の決定根拠を作る',
          '入力: ステークホルダー登録簿・プロジェクト憲章・組織情報',
          'アウトプット: ==分析マトリクス==・優先順位付きリスト',
          '分析手法は__単一の正解はない__（プロジェクト特性に応じて選択）',
          '複数手法を組み合わせて__多角的に分析__することが推奨される',
        ],
      },
      {
        heading: '13. 権力／関心度グリッド（Power/Interest Grid）',
        items: [
          '横軸: ==関心度==（Interest, 低 → 高）',
          '縦軸: ==権力==（Power, 低 → 高）',
          '4象限の対応戦略は下の図表参照',
          '最も基本的なステークホルダー分析手法で__PM試験頻出__',
        ],
        headerDiagrams: [
          {
            title: '権力／関心度グリッド（Power/Interest Grid）',
            rows: [
              {
                cells: [
                  { label: '', bg: '#f8fafc' },
                  { label: '関心度 低', bg: '#e2e8f0' },
                  { label: '関心度 高', bg: '#e2e8f0' },
                ],
              },
              {
                cells: [
                  { label: '権力 高', bg: '#e2e8f0' },
                  { label: '満足を保つ\n(Keep Satisfied)', bg: '#fef3c7', isRed: true },
                  { label: '緊密に管理\n(Manage Closely)', bg: '#fee2e2', isRed: true },
                ],
              },
              {
                cells: [
                  { label: '権力 低', bg: '#e2e8f0' },
                  { label: '監視\n(Monitor)', bg: '#f1f5f9' },
                  { label: '情報提供\n(Keep Informed)', bg: '#dbeafe', isRed: true },
                ],
              },
            ],
            caption: '最重要は右上「緊密に管理」（権力高・関心高）。左下「監視」は最小工数で対応。',
            totalCols: 3,
          },
        ],
      },
      {
        heading: '14. 権力／影響度グリッド（Power/Influence Grid）',
        items: [
          '横軸: ==影響度==（Influence, 低 → 高）',
          '縦軸: ==権力==（Power, 低 → 高）',
          'Power/Interest との違い: ==Interest（関心）== ではなく ==Influence（影響力）== を見る',
          '権力は弱いが影響力の強い人物（__社長秘書__・__現場主任__）を見逃さないために使う',
          '非公式権力（informal power）の把握に有効',
        ],
        navyItems: [[{ text: '権力は公式権威、影響力は非公式に他者を動かす力、と区別する', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: '権力／影響度グリッド: Power × Influence の4象限',
            headers: ['', '影響力 低', '影響力 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['権力 高', '満足を保つ: 公式権限は高いが波及力は限定的', '緊密に管理: 意思決定権と影響力が高いコア'],
              ['権力 低', '監視: 最小工数で変化を確認', '情報共有: 非公式影響力が高いキーパーソン'],
            ],
          },
        ],
      },
      {
        heading: '15. 影響／インパクト・マトリクス',
        items: [
          '横軸: ==Impact==（プロジェクトへ与える/受ける影響の大きさ）',
          '縦軸: ==Influence==（他者への影響力）',
          'Power/Influence との違い: 縦軸が==Power（権力）== ではなく ==Influence== である点',
          'ステークホルダーが__プロジェクト変更にどれだけ影響__されるかを評価する観点',
          '主に==変更管理==・==リスク対応==の文脈で使われる',
        ],
        figures: [
          {
            type: 'table',
            caption: '影響／インパクト・マトリクス: 縦軸は Power ではなく Influence',
            headers: ['', 'Impact 低', 'Impact 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['Influence 高', '巻き込み: 変更説明の協力者にする', '重点対応: 影響大かつ他者も動かす'],
              ['Influence 低', '観察: 必要時に情報提供', '個別ケア: 影響を受ける当事者として支援'],
            ],
          },
        ],
      },
      {
        heading: '16. サリエンスモデル（Salience Model）',
        items: [
          '__3つの属性__で分析: Power・Legitimacy・Urgency',
          '　==Power（権力）==: 自分の意思を相手に実行させる能力',
          '　==Legitimacy（合法性／正当性）==: 関与が__社会的に妥当__と認められているか',
          '　==Urgency（緊急性）==: 即時の対応を要求する度合い',
          '3属性のうち__いくつ持つか__でステークホルダーを分類（1属性=Latent、2属性=Expectant、3属性=Definitive）',
          '権力だけでなく__正当性・緊急性__を加えた多次元分析が特徴',
        ],
        navyItems: [[{ text: '3属性すべてを持つ Definitive Stakeholder が最優先対応対象', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'サリエンスモデル: 属性数が多いほど優先度が上がる',
            ariaLabel: 'Power Legitimacy Urgency の3属性でステークホルダーを分類するベン図',
            viewBox: '0 0 640 430',
            content: `
              <defs>
                <style>
                  .salience-power { fill: #fee2e2; stroke: #dc2626; stroke-width: 2; fill-opacity: 0.58; }
                  .salience-legitimacy { fill: #9d5b8b15; stroke: #9d5b8b; stroke-width: 2; fill-opacity: 0.72; }
                  .salience-urgency { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; fill-opacity: 0.62; }
                </style>
              </defs>
              <rect x="18" y="18" width="604" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <text x="320" y="44" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">
                属性数: 1 = Latent / 2 = Expectant / 3 = Definitive
              </text>
              <circle cx="260" cy="170" r="128" class="salience-power" />
              <circle cx="380" cy="170" r="128" class="salience-legitimacy" />
              <circle cx="320" cy="272" r="128" class="salience-urgency" />
              <text x="180" y="86" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Power</text>
              <text x="460" y="86" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Legitimacy</text>
              <text x="320" y="390" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Urgency</text>
              <text x="208" y="160" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="208" dy="0">Latent</tspan><tspan x="208" dy="16">Dormant</tspan>
              </text>
              <text x="432" y="160" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="432" dy="0">Latent</tspan><tspan x="432" dy="16">Discretionary</tspan>
              </text>
              <text x="320" y="342" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Latent</tspan><tspan x="320" dy="16">Demanding</tspan>
              </text>
              <text x="320" y="132" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Expectant</tspan><tspan x="320" dy="16">Dominant</tspan>
              </text>
              <text x="264" y="244" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="264" dy="0">Expectant</tspan><tspan x="264" dy="16">Dangerous</tspan>
              </text>
              <text x="376" y="244" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="376" dy="0">Expectant</tspan><tspan x="376" dy="16">Dependent</tspan>
              </text>
              <text x="320" y="204" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="16" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Definitive</tspan><tspan x="320" dy="19">3属性</tspan>
              </text>
            `,
          },
        ],
      },
      {
        heading: '17. 方向性キューブ（Directions of Influence）',
        items: [
          'ステークホルダーをPMから見た__4方向__で分類',
          '　==上方向==（Upward）: 経営層・スポンサー・運営委員会',
          '　==下方向==（Downward）: チームメンバ・専門家',
          '　==外方向==（Outward）: 外部顧客・サプライヤ・規制当局・エンドユーザ',
          '　==横方向==（Sideward）: 他PM・社内同僚・機能部門マネジャー',
          '方向ごとに__コミュニケーション・スタイル__と__説得アプローチ__を変える',
        ],
        figures: [
          {
            type: 'svg',
            caption: '方向性キューブ: PMを中心に影響先を4方向で捉える',
            ariaLabel: 'PMを中心に上方向下方向外方向横方向の4方向ステークホルダーを示す図',
            viewBox: '0 0 640 420',
            content: `
              <defs>
                <marker id="dir-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="604" height="384" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <circle cx="320" cy="210" r="42" fill="#9d5b8b" stroke="white" stroke-width="3" />
              <text x="320" y="216" fill="white" stroke="white" stroke-width="3" paint-order="stroke" font-size="18" font-weight="700" text-anchor="middle">PM</text>
              <line x1="320" y1="166" x2="320" y2="82" stroke="#dc2626" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="320" y1="254" x2="320" y2="338" stroke="#10b981" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="276" y1="210" x2="108" y2="210" stroke="#f59e0b" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="364" y1="210" x2="532" y2="210" stroke="#9d5b8b" stroke-width="4" marker-end="url(#dir-arrow)" />
              <rect x="214" y="44" width="212" height="54" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <rect x="214" y="322" width="212" height="54" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <rect x="36" y="172" width="178" height="76" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="426" y="172" width="178" height="76" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="320" y="66" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Upward</text>
              <text x="320" y="84" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">経営層・スポンサー</text>
              <text x="320" y="344" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Downward</text>
              <text x="320" y="362" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">チーム・専門家</text>
              <text x="125" y="202" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Outward</text>
              <text x="125" y="220" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">顧客・規制当局</text>
              <text x="125" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">サプライヤ</text>
              <text x="515" y="202" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Sideward</text>
              <text x="515" y="220" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">他PM・同僚</text>
              <text x="515" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">機能部門</text>
            `,
          },
        ],
      },

      // ── D. エンゲージメント計画 ──
      {
        heading: '18. エンゲージメント・レベル評価マトリクス',
        items: [
          '5段階の関与レベル（§4 参照）に対し、各ステークホルダーの==現状 C==と==望ましい状態 D==をマッピング',
          '__C と D が一致__している場合、追加施策不要',
          '__C と D が異なる__場合、ギャップを埋める関与戦略を立案',
          '例: 「抵抗(C)→中立(D)」の場合、反対理由を理解し懸念を解消する施策が必要',
        ],
        headerDiagrams: [
          {
            title: 'エンゲージメント評価マトリクス例',
            rows: [
              {
                cells: [
                  { label: 'ステークホルダー', bg: '#e2e8f0' },
                  { label: '不認識', bg: '#f1f5f9', small: true },
                  { label: '抵抗', bg: '#f1f5f9', small: true },
                  { label: '中立', bg: '#f1f5f9', small: true },
                  { label: '支持', bg: '#f1f5f9', small: true },
                  { label: '主導', bg: '#f1f5f9', small: true },
                ],
              },
              {
                cells: [
                  { label: 'スポンサーA', bg: '#fef3c7', small: true },
                  { label: '', bg: '#ffffff', small: true },
                  { label: '', bg: '#ffffff', small: true },
                  { label: '', bg: '#ffffff', small: true },
                  { label: 'C', bg: '#fee2e2', isRed: true, small: true },
                  { label: 'D', bg: '#dbeafe', isRed: true, small: true },
                ],
              },
              {
                cells: [
                  { label: '現業ユーザB', bg: '#fef3c7', small: true },
                  { label: '', bg: '#ffffff', small: true },
                  { label: 'C', bg: '#fee2e2', isRed: true, small: true },
                  { label: 'D', bg: '#dbeafe', isRed: true, small: true },
                  { label: '', bg: '#ffffff', small: true },
                  { label: '', bg: '#ffffff', small: true },
                ],
              },
            ],
            caption: 'C=現状、D=望ましい状態。両者のギャップを埋める施策を計画する。',
            totalCols: 6,
          },
        ],
        navyItems: [[{ text: '第6版では 13.2 計画／13.4 監視で本マトリクス（ステークホルダー関与評価マトリクス）を使用（§32 参照）', style: 'navy' }]],
      },
      {
        heading: '19. ステークホルダー・エンゲージメント計画書の構造',
        items: [
          '__計画書の主な項目__:',
          '　==望ましい関与レベル==（ステークホルダー別）',
          '　==現在の関与レベル==との差分',
          '　==必要な情報==の種類・形式・提供頻度',
          '　==情報の配布理由==（なぜ提供するか）',
          '　==時間枠==（いつ・どの間隔で）',
          '　==情報配布方法==（メール・会議・ダッシュボード等）',
          '計画書は==コミュニケーション・マネジメント計画書==と密接に連動する',
        ],
        navyItems: [[{ text: '第6版では 13.2「ステークホルダー・エンゲージメントの計画」プロセス（計画プロセス群）の主要アウトプット（13.2.3.1, §32 参照）', style: 'navy' }]],
      },
      {
        heading: '20. エンゲージメント戦略の決定要因',
        items: [
          '==ステークホルダーの優先順位==（分析結果に基づく）',
          '==プロジェクトのフェーズ==（立上げ/計画/実行/監視/終結）',
          '==組織文化==（フォーマル/インフォーマル、ハイコンテキスト/ローコンテキスト）',
          '==文化的多様性==（言語・地域・タイムゾーン）',
          '==過去プロジェクトの教訓==',
          '==プロジェクト・チームの能力==（コミュニケーションスキル）',
          '戦略は__一度決めたら不変ではなく__、関与状況に応じて見直す',
        ],
      },
      {
        heading: '21. コミュニケーション要求事項の整理',
        items: [
          '__誰に__（受信者）',
          '__何を__（情報の内容）',
          '__いつ__（タイミング・頻度）',
          '__どこで__（媒体・場所）',
          '__どのように__（プッシュ/プル/インタラクティブ）',
          '__なぜ__（情報配布の理由）',
          '上記6Wを==コミュニケーション・マネジメント計画書==に統合する',
        ],
      },
      {
        heading: '22. 主要ステークホルダーへの個別対応戦略',
        items: [
          '__スポンサー__: 定期的な1on1、重要決定の事前合意、エスカレーション窓口の確立',
          '__顧客／エンドユーザ__: 受入基準の合意、定期デモ、UATへの早期巻込み',
          '__機能部門マネジャー__: リソース調整、優先順位の明確化',
          '__チームメンバ__: 役割明確化、定期1on1、心理的安全性の確保',
          '__規制当局__: 早期確認、文書化された承認の取得',
          '__サプライヤ__: 契約条件の明確化、パフォーマンス・レビュー',
        ],
      },
      {
        heading: '23. 文化的・組織的多様性への配慮',
        items: [
          '__言語__: 母国語の違いによる誤解・専門用語の翻訳問題',
          '__文化__: 直接的/間接的コミュニケーション、合意形成プロセスの違い',
          '__タイムゾーン__: 会議時間・レスポンス期待値の調整',
          '__階層意識__: 国・組織による上下関係の強さの違い',
          '__意思決定スタイル__: トップダウン/ボトムアップ、コンセンサス重視',
          'グローバルプロジェクトでは==文化的能力==（Cultural Intelligence, CQ）が重要',
        ],
      },

      // ── E. コミュニケーション・関与 ──
      {
        heading: '24. プッシュ／プル／インタラクティブ・コミュニケーション',
        items: [
          '==プッシュ型==: 送り手が一方的に配布（メール・レポート・メモ）',
          '　メリット: 一斉配信・記録性',
          '　デメリット: 受信確認・理解確認ができない',
          '==プル型==: 受け手が必要時に取得（ポータル・ナレッジリポジトリ・ダッシュボード）',
          '　メリット: 大量情報の集約・参照性',
          '　デメリット: 受け手の能動的アクセスが必要',
          '==インタラクティブ型==: 双方向のリアルタイム（会議・電話・ビデオ会議）',
          '　メリット: 即時の理解確認・誤解の解消',
          '　デメリット: 時間的・地理的制約',
          '情報の__重要度__と__緊急度__で使い分ける',
        ],
      },
      {
        heading: '25. コミュニケーション・モデル',
        items: [
          '==送信者==（Sender）→ ==符号化==（Encode）→ ==メディア==（Medium）→ ==復号==（Decode）→ ==受信者==（Receiver）',
          '途中に==ノイズ==（Noise）が介在: 物理的雑音・心理的バイアス・文化的解釈',
          '==フィードバック==（Feedback）で受信者の理解を確認',
          '誤解の原因の多くは__符号化／復号__段階で発生',
          '対策: 平易な言葉・図解・要約の復唱・確認質問',
        ],
      },
      {
        heading: '26. 報告と会議体の設計',
        items: [
          '__定例会議__: 進捗報告（週次・隔週）、ステアリングコミッティ（月次）',
          '__アドホック会議__: 課題対応・意思決定・キックオフ',
          '__報告書__: ステータスレポート、トレンドレポート、予測レポート、バリアンスレポート',
          '会議体の設計原則: __目的__・__参加者__・__時間__・__アジェンダ__を事前定義',
          '__アクションアイテム__は責任者・期限とともに記録し、次回会議で進捗確認',
        ],
      },
      {
        heading: '27. エスカレーションの基準とルート',
        items: [
          '==エスカレーション基準==: 影響度・緊急度・PM権限範囲の超過',
          '基準の例: 予算/期間/品質への重大影響、契約条件変更、組織横断調整',
          '==エスカレーション・ルート==: PM → スポンサー → ステアリングコミッティ → 経営層',
          '基準はプロジェクト開始時に__合意・文書化__しておく',
          'ステークホルダーの__過剰なエスカレーション__は信頼を損なうため、基準遵守が重要',
        ],
      },
      {
        heading: '28. 信頼関係構築の技法',
        items: [
          '==積極的傾聴==（Active Listening）: 相手の発言を要約して確認、共感的応答',
          '==ファシリテーション==: 会議・ワークショップの議論を中立的に導く',
          '==交渉==: Win-Win 解決の探索、BATNA（合意できない場合の最良代替案）の理解',
          '==紛争解決==: 撤退/緩和/妥協/強制/協調の5戦略を状況で使い分け',
          '==感情的知性==（EQ）: 自己認識・自己管理・社会的認識・関係管理',
          'PMBOK7 は==対人スキル==（Interpersonal Skills）を重要視',
        ],
      },

      // ── F. 監視・コントロール ──
      {
        heading: '29. エンゲージメント状況の監視',
        items: [
          '監視の目的: 関与レベルが__計画通りか__、変化があれば早期検知',
          '__KPI 例__: 会議出席率、レビュー反応時間、アンケートスコア',
          '__指標__: ステークホルダー満足度、変更要求件数、エスカレーション件数',
          '監視は__定量__（数値）と__定性__（観察・対話）の両面で実施',
          '異常検知時は==根本原因分析==（5 Why、フィッシュボーン）を実施',
        ],
        navyItems: [[{ text: '第6版では 13.4「ステークホルダー・エンゲージメントの監視」プロセス（監視・コントロールプロセス群）が対応。ツール&技法に根本原因分析・ステークホルダー分析を含む（§32 参照）', style: 'navy' }]],
      },
      {
        heading: '30. 関与レベルの変化への対応・是正処置',
        items: [
          '関与レベル低下の典型シグナル: __会議欠席__、__レビュー遅延__、__非協力的態度__',
          '　__対応1__: __1on1__で個別ヒアリング、懸念の把握',
          '　__対応2__: __コミュニケーション頻度・内容__の見直し',
          '　__対応3__: __計画への参加__機会を提供（共同設計）',
          '　__対応4__: __スポンサー経由__での働きかけ',
          '是正処置は==ステークホルダー登録簿==に記録し、教訓として保存',
        ],
      },
      {
        heading: '31. 課題ログ／変更要求への連携',
        items: [
          '==課題ログ==（Issue Log）: 発生中の課題を一元管理（責任者・期限・状況）',
          'ステークホルダー起因の課題は==登録簿==にも反映',
          '==変更要求==はステークホルダーの新しい要求・期待から発生することが多い',
          '変更管理委員会（CCB）でステークホルダー視点を考慮した==影響評価==を実施',
          '承認された変更は==コミュニケーション計画==・==登録簿==・==分析マトリクス==に反映',
        ],
        navyItems: [[{ text: '第6版では 13.3「ステークホルダー・エンゲージメントのマネジメント」（実行）／13.4「監視」の主要アウトプットとして変更要求・問題ログが対応（§32 参照）', style: 'navy' }]],
      },

      // ── F+. PMBOK第6版 統合（F2-P0 で追加） ──
      {
        heading: '32. PMBOK第6版「ステークホルダー・マネジメント」知識エリアの4プロセス',
        items: [
          'PMBOK第6版は==ステークホルダー・マネジメント==を独立した==第13章==の知識エリアとして定義し、==4プロセス==で整理する',
          '__プロセス群との対応__: 立上げ（13.1）／計画（13.2）／実行（13.3）／監視・コントロール（13.4）',
          '__13.1 ステークホルダーの特定__（Identify Stakeholders, 立上げプロセス群）:',
          '　主要インプット: ==プロジェクト憲章==／==ビジネス文書==／==合意書==／==調達文書==',
          '　主要ツール&技法: 専門家の判断／==データ収集==（質問書）／==データ分析==（ステークホルダー分析）／==データ表現==（マッピング）／会議',
          '　主要アウトプット: ==ステークホルダー登録簿==／変更要求／プロジェクト文書の更新',
          '__13.2 ステークホルダー・エンゲージメントの計画__（Plan Stakeholder Engagement, 計画プロセス群）:',
          '　主要インプット: ==プロジェクトマネジメント計画書==／==ステークホルダー登録簿==',
          '　主要ツール&技法: 専門家の判断／==データ収集==（ベンチマーキング）／==データ分析==（仮定分析）／==データ表現==（評価マトリクス）／会議',
          '　主要アウトプット: ==ステークホルダー・エンゲージメント計画書==',
          '__13.3 ステークホルダー・エンゲージメントのマネジメント__（Manage Stakeholder Engagement, 実行プロセス群）:',
          '　主要インプット: プロジェクトマネジメント計画書／問題ログ／変更ログ',
          '　主要ツール&技法: ==コミュニケーション・スキル==（フィードバック）／==対人スキル==（紛争マネジメント／文化的認識／交渉／観察と対話／政治的認識）／==基本ルール==／会議',
          '　主要アウトプット: 変更要求／プロジェクトマネジメント計画書の更新／問題ログ',
          '__13.4 ステークホルダー・エンゲージメントの監視__（Monitor Stakeholder Engagement, 監視・コントロールプロセス群）:',
          '　主要インプット: 作業パフォーマンス・データ／問題ログ／プロジェクトマネジメント計画書',
          '　主要ツール&技法: ==データ分析==（==代替案分析==／==根本原因分析==／==ステークホルダー分析==）／==意思決定==（多基準意思決定分析）／==データ表現==（==ステークホルダー関与評価マトリクス==）／==コミュニケーション・スキル==／==対人スキル==／会議',
          '　主要アウトプット: 作業パフォーマンス情報／変更要求／プロジェクトマネジメント計画書の更新',
          '__試験頻出ポイント__: ITTOの主要項目（==データ表現==／==対人スキル==／==データ分析==）、==ステークホルダー登録簿==と==エンゲージメント計画書==の位置づけ、各プロセスのプロセス群所属',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第13章「ステークホルダー・マネジメント」', style: 'navy' }]],
      },
      {
        heading: '33. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==。5プロセス群（立上・計画・実行・監視・終結）×10知識エリア = 49プロセス。==ITTO==（インプット・ツール&技法・アウトプット）形式',
          '__第7版__: ==原則ベース==。==12原則==＋==8パフォーマンス領域==＋テーラリング',
          '__本領域での対応__: 第6版「ステークホルダー・マネジメント」知識エリア = 第7版「==ステークホルダー==」パフォーマンス領域',
          '__IPA PM試験 午前II__ は==第6版用語==に依拠した設問が多数（==ステークホルダー登録簿==／==エンゲージメント計画書==／==13.x プロセス==）',
          '近年は第7版概念も出題（==パフォーマンス領域==／==サーバントリーダーシップ==／==価値実現==）',
          '本アプリは両版を併記。試験頻出の==赤字==は第6版用語を優先付与（team カテゴリと同方針）',
          '__両版の枠組み比較__:',
          '　==第6版==は「==プロセスを実行する==」視点（手順とアウトプット重視）',
          '　==第7版==は「==成果を達成する==」視点（原則と価値実現重視）',
          '__試験対策上の意味__: 用語の出典が第6版／第7版どちらか判別できるようにする（ひっかけ対策）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第13章 / PMBOK第7版「ステークホルダー」パフォーマンス領域 / IPA PM試験シラバス Ver7.1', style: 'navy' }]],
      },

      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '34. IPA PM試験 過去問頻出論点',
        items: [
          '__午前II 頻出__:',
          '　==ステークホルダー登録簿==の記載項目（識別情報・評価情報・分類）',
          '　==Power/Interest Grid==の象限と対応戦略',
          '　==サリエンスモデル==の3属性（Power/Legitimacy/Urgency）',
          '　==関与レベル==5段階（不認識〜主導）',
          '__午後Ⅰ 頻出__:',
          '　ステークホルダー==識別漏れ==の典型シナリオ',
          '　==関与レベル変化==の原因分析と対応策',
          '　==コミュニケーション計画==とエンゲージメント計画の連動',
          '　==エスカレーション基準==の妥当性判断',
        ],
      },
      {
        heading: '35. IPA PM試験 ひっかけパターン',
        items: [
          '__Influence vs Impact__: 「影響力」と「影響度」を取り違える誤答選択肢に注意',
          '__Power vs Influence__: 公式権威（Power）と非公式影響力（Influence）の区別',
          '__関与レベルの段階__: 「中立」と「支持」、「抵抗」と「不認識」の境界を問う設問',
          '__登録簿 vs 計画書__: ステークホルダー登録簿（識別アウトプット）と==エンゲージメント計画書==（戦略文書）の混同',
          '__プッシュ／プル／インタラクティブ__: それぞれの適用シーンの誤認',
          '__サリエンスモデルの属性数__: 1属性のみ（Latent）と2属性（Expectant）の分類混同',
          '出典の混同: PMBOK第6版（プロセス群）と==第7版==（パフォーマンス領域）の枠組み違い',
        ],
        navyItems: [[{ text: '本アプリは PMBOK第6版＋第7版を統合的に扱う。第6版要素は §32-33 に集約。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】ステークホルダー登録簿の3区分（識別情報／評価情報／分類）は午前II頻出。記載項目を空で言えるレベルまで暗記。',
      '【マトリクス】Power/Interest Grid の4象限と対応戦略（緊密に管理／満足を保つ／情報提供／監視）を図で覚える。',
      '【関与レベル】5段階（不認識→抵抗→中立→支持→主導）と C/D 表記の意味（現状/望ましい状態）を区別。',
      '【サリエンスモデル】3属性（Power/Legitimacy/Urgency）と所持数による分類（Latent=1, Expectant=2, Definitive=3）。',
      '【ひっかけ】Influence と Impact、Power と Influence、登録簿と計画書、を区別できるよう用語の正確な理解を。',
      '【午後Ⅰ対策】「識別漏れ→終盤の変更要求」「関与レベル低下→懸念ヒアリング」のシナリオパターンを記述で再現できるように。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。第6版「ステークホルダー・マネジメント」4プロセス（13.1-13.4）は §32 に集約、版対応関係は §33。試験は両版混在で出題される。',
      '【PMBOK6 4プロセス】13.1 特定（立上げ）／13.2 計画／13.3 マネジメント（実行）／13.4 監視、の順序を暗記。',
      '【PMBOK6 ITTO】各プロセスの ITTO 主要項目（特にツール&技法）が午前II頻出。',
    ],
  },

  // ───────────────────────────────────────────
  // 2. チーム（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  team: {
    summary:
      'プロジェクトチームの形成・育成・マネジメント・コンフリクト解決を扱う活動領域。PMBOK第6版では「資源マネジメント」知識エリア（6プロセス）、第7版では「チーム」パフォーマンス領域として整理され、リーダーシップ理論／モチベーション理論／タックマンモデル／RACI／組織形態が試験頻出。本ノートは第6版＋第7版を統合的に記述する。',
    sections: [
      // ── A. 定義・基本概念 ──
      {
        heading: '1. チーム・パフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「チーム」パフォーマンス領域はプロジェクトを推進する__人々の集合体__の構築と維持を扱う',
          '　__成果1__: ==共有されたオーナーシップ==（チーム全員が結果責任を共有）',
          '　__成果2__: ==ハイパフォーマンスチーム==の形成',
          '　__成果3__: ==リーダーシップとソフトスキル==が全員に発揮されている',
          'PMBOK第6版では同領域は==資源マネジメント==知識エリア（旧 人的資源マネジメント、第5版から名称変更）として扱われ、6プロセスで構成される',
          '第7版は「原則・領域」、第6版は「プロセス・ITTO」の枠組みで、IPA PM試験は両方の用語が出題される',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「チーム・パフォーマンス領域」／PMBOK第6版 第9章「資源マネジメント」／IPA PM試験シラバス Ver7.1 §3.4', style: 'navy' }]],
      },
      {
        heading: '2. チームとグループの違い／プロジェクトチームの構成',
        items: [
          '==グループ==: 共通の目的を持つ個人の集まり。個別の責任で動く',
          '==チーム==: ==共通目標==と==相互依存==を持ち、==共同責任==で動く集団',
          'プロジェクトチームは__明確な開始と終了__を持つ点で部門組織と異なる',
          '構成要素: ==プロジェクトマネージャ==／==コアチーム==（常駐）／==拡張チーム==（必要時参加）／==サブジェクト・マター・エキスパート（SME）==',
          '__専任チーム__: メンバーは100%プロジェクトに割り当て',
          '__パートタイムチーム__: 機能部門業務と兼務（マトリクス組織で発生）',
          'バーチャル化・分散化により__物理的に同じ場所にいないチーム__が一般化',
        ],
      },
      {
        heading: '3. リーダーシップとマネジメントの違い',
        items: [
          '==リーダーシップ==: __ビジョン__を示し人々を==動機づけ==る能力。「正しいことをする」',
          '==マネジメント==: 計画・組織化・統制で==結果を出す==能力。「物事を正しく行う」',
          '__コッターの整理__: リーダーシップは「変革」、マネジメントは「複雑性への対処」',
          'PMには両方が必要だが、PMBOK第7版はリーダーシップを==強調==している',
          '伝統的なPM（第6版以前）は==マネジメント寄り==、近年は==リーダーシップ寄り==にシフト',
          'リーダーシップは__役職に依存しない__（メンバーも発揮できる）',
        ],
        navyItems: [[{ text: 'Kotter「リーダーシップ論」が概念整理の古典。PMBOK7 はこの枠組みを踏襲', style: 'navy' }]],
      },
      {
        heading: '4. PMBOK第7版 リーダーシップ・スキル',
        items: [
          '==ビジョン提示==: プロジェクトの目的と方向性を明示し共有する',
          '==批判的思考==（Critical Thinking）: 仮定を疑い証拠に基づいて判断する',
          '==モチベーション==: 内発的動機づけを引き出し継続させる',
          '==対人スキル==: 傾聴・共感・フィードバック・交渉・調整',
          '==政治的感覚==（Political Acumen）: ステークホルダーの利害関係を読み解き対応する',
          '==誠実さ==（Integrity）と==倫理==（Ethics）: PMI 行動規範に基づく振る舞い',
          'これらは__役割によらず__チーム全員に求められる（リーダーシップは分散される）',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「リーダーシップ」原則', style: 'navy' }]],
      },
      {
        heading: '5. PMI Talent Triangle — プロジェクトマネージャに求められる役割',
        items: [
          'PMI Talent Triangle はPMの==コア・コンピテンシー==を3軸で整理',
          '==Technical Project Management==（テクニカル）: PMBOK知識・ツール・手法の習熟',
          '==Leadership==（リーダーシップ）: 人を動かす能力・ソフトスキル',
          '==Strategic and Business Management==（戦略・ビジネス）: 組織戦略との整合・ビジネス価値の理解',
          '2023年改訂で==Power Skills==（対人）／==Business Acumen==（ビジネス）／==Ways of Working==（仕事の進め方）の新3軸に再編',
          'PMP・PMI-ACP 等の継続教育（PDU）はこの3軸に沿って蓄積',
          'PMはこの3軸を==バランスよく==高める必要がある',
        ],
      },
      {
        heading: '6. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==。5プロセス群（立上・計画・実行・監視・終結）×10知識エリア = 49プロセス。==ITTO==（インプット・ツール&技法・アウトプット）形式',
          '__第7版__: ==原則ベース==。==12原則==＋==8パフォーマンス領域==＋テーラリング',
          'IPA PM試験（午前II）は==第6版用語==に依拠した設問が多数（例: 「資源マネジメント計画書」「コスト・ベースライン」「変更管理委員会」）',
          '近年は第7版の概念（==サーバントリーダーシップ==／==テーラリング==／==価値実現==）も出題',
          'チーム領域での対応: 第6版「資源マネジメント」=第7版「チーム」パフォーマンス領域',
          '本アプリは両版を==併記==。試験頻出の==赤字==は第6版用語を優先付与',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9 / 第7版「チーム」領域。試験対策上は両版用語の混同が頻出ひっかけ', style: 'navy' }]],
      },
      // ── B. リーダーシップ理論 ──
      {
        heading: '7. 行動アプローチ — レビン／リッカート',
        items: [
          '==行動アプローチ==は「リーダーの行動スタイル」に着目した理論群（特性論の後継）',
          '__クルト・レビンの3類型__: ==専制型==（独裁的）／==民主型==（参加型）／==放任型==（自由放任）',
          '民主型が一般に==高い生産性==と==高い満足度==をもたらすとされる',
          '__リッカートのシステム4__: ==独善的専制型==（システム1）／==温情的専制型==（システム2）／==相談型==（システム3）／==集団参画型==（システム4）',
          'システム4（集団参画型）が最も==高い業績==につながるとされる',
          'これらは==状況を考慮しない==単一最適解アプローチで、後のSL理論・パスゴール理論に発展',
        ],
      },
      {
        heading: '8. マネジリアル・グリッド（Blake & Mouton）',
        items: [
          '==2軸モデル==: ==業績への関心==（Concern for Production, 横軸）と==人間への関心==（Concern for People, 縦軸）を各9段階で評価',
          '5つの代表スタイル:',
          '　__1,1 無関心型__（Impoverished）: 両方低い。最低限の労力',
          '　__9,1 仕事中心型__（Authority-Compliance）: 業績重視・人間軽視',
          '　__1,9 人間中心型__（Country Club）: 人間関係重視・業績軽視',
          '　__5,5 中道型__（Middle-of-the-Road）: 両方そこそこ',
          '　__9,9 チームマネジメント型__（Team Management）: 両方高い。==理想型==',
          '試験ではグリッド座標（例: 9,1）から該当スタイルを答えさせる設問が頻出',
        ],
        navyItems: [[{ text: '英語名は Managerial Grid。Blake & Mouton 1964年提唱', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: 'マネジリアル・グリッド: 人間への関心 × 業績への関心',
            headers: ['', '業績 低', '業績 中', '業績 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['人間 高', '1,9 人間中心型', '', '9,9 チーム型（理想）'],
              ['人間 中', '', '5,5 中道型', ''],
              ['人間 低', '1,1 無関心型', '', '9,1 仕事中心型'],
            ],
          },
        ],
      },
      {
        heading: '9. 状況対応リーダーシップ理論（SL理論：Hersey & Blanchard）',
        items: [
          'メンバーの==成熟度==（Readiness）に応じてリーダーシップ・スタイルを切り替えるべきという理論',
          '4つのスタイル:',
          '　__S1 指示型__（Telling）: 高指示・低支援。未熟なメンバー向け',
          '　__S2 説得型__（Selling／Coaching）: 高指示・高支援。意欲はあるが能力不足',
          '　__S3 参加型__（Participating／Supporting）: 低指示・高支援。能力はあるが意欲不足',
          '　__S4 委任型__（Delegating）: 低指示・低支援。能力・意欲とも高い',
          '成熟度はM1（低）→M4（高）の4段階で評価し、対応するスタイルS1〜S4を選択',
          '==成熟度に応じた柔軟な切替==が本理論の核心',
        ],
        navyItems: [[{ text: 'SL理論=Situational Leadership。Hersey & Blanchard 1969年提唱。試験頻出', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: 'SL理論: 指示度 × 支援度 と M1〜M4 成熟度の対応',
            headers: ['', '指示度 低', '指示度 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['支援度 高', 'S3 参加型: M3 能力あり・意欲不足', 'S2 説得型: M2 意欲あり・能力不足'],
              ['支援度 低', 'S4 委任型: M4 能力・意欲とも高い', 'S1 指示型: M1 未熟'],
            ],
          },
        ],
      },
      {
        heading: '10. パスゴール理論／コンティンジェンシー理論',
        items: [
          '__パスゴール理論__（House）: リーダーは部下が==目標達成==への==経路==（Path）を見出せるよう支援すべき',
          'パスゴール4スタイル: ==指示型==（Directive）／==支援型==（Supportive）／==参加型==（Participative）／==達成志向型==（Achievement-oriented）',
          '部下特性（能力・経験）×環境特性（タスク構造・公式権威）で最適スタイルが決まる',
          '__コンティンジェンシー理論__（Fiedler）: リーダーの==特性==は固定的、状況に応じて適合性が変わる',
          'Fiedler の==LPC==（Least Preferred Coworker）スコアでリーダー特性を分類',
          '高LPC=人間関係志向、低LPC=タスク志向',
          '状況好意性（リーダー－メンバー関係／タスク構造／地位パワー）で最適タイプが決まる',
        ],
      },
      {
        heading: '11. 変革型リーダーシップ・取引型リーダーシップ',
        items: [
          '__変革型リーダーシップ__（Transformational Leadership, Bass）: ==ビジョン==で人を==鼓舞==し変革を促す',
          '4要素: ==理想化された影響力==（Idealized Influence）／==鼓舞による動機づけ==（Inspirational Motivation）／==知的刺激==（Intellectual Stimulation）／==個別配慮==（Individualized Consideration）',
          '__取引型リーダーシップ__（Transactional Leadership）: ==報酬と罰則==による交換関係でメンバーを動かす',
          '2要素: ==条件付き報酬==（Contingent Reward）／==例外による管理==（Management by Exception）',
          '変革型は==長期的成長==、取引型は==短期的達成==に向く',
          '実務では両方を==状況に応じて使い分け==る',
        ],
      },
      {
        heading: '12. サーバントリーダーシップ（PMBOK第7版が推奨）',
        items: [
          '==サーバントリーダーシップ==（Servant Leadership, Greenleaf）: リーダーは==メンバーに奉仕==し成長を支援する',
          'PMBOK第7版が==推奨==するリーダーシップ・スタイル',
          '==アジャイル==・==スクラム==との親和性が高い（スクラムマスターはサーバントリーダーとして振る舞う）',
          '主要行動:',
          '　__障害物の除去__（Impediment Removal）: メンバーの作業を阻む要因を取り除く',
          '　__傾聴__（Active Listening）: メンバーの声を聞く',
          '　__エンパワーメント__（Empowerment）: メンバーに権限と責任を委譲',
          '　__成長支援__（Growth Support）: スキル習得・キャリア発展を支援',
          '管理職と現場の==上下関係を反転==させる発想（逆ピラミッド組織）',
        ],
        navyItems: [[{ text: 'PMBOK第7版 リーダーシップ原則／アジャイル実務ガイド。試験頻出キーワード', style: 'navy' }]],
      },
      // ── C. モチベーション理論 ──
      {
        heading: '13. 内発的動機づけ vs 外発的動機づけ',
        items: [
          '==内発的動機づけ==（Intrinsic Motivation）: ==興味・好奇心・達成感==など個人の内側から生じる動機',
          '==外発的動機づけ==（Extrinsic Motivation）: ==報酬・罰則・評価==など外部要因による動機',
          '==アンダーマイニング効果==: 元々内発的に動機づけられた行動に外発的報酬を与えると内発的動機が==低下==する現象',
          '__エンハンシング効果__: 言語的報酬（褒める）は内発的動機を高める場合がある',
          'PMBOK第7版は==内発的動機づけ==を重視（自律・熟達・目的の3要素：Daniel Pink）',
          '伝統的な金銭的インセンティブは__短期的効果__にとどまることが多い',
        ],
      },
      {
        heading: '14. マズローの欲求階層説',
        items: [
          '人間の欲求は==5階層==のピラミッド構造で、低次から順に満たされる',
          '　__生理的欲求__（Physiological）: 食欲・睡眠など生存に直結',
          '　__安全欲求__（Safety）: 身体的・経済的安全',
          '　__社会的欲求__（Belongingness）: 所属感・愛情',
          '　__承認欲求__（Esteem）: 尊敬・自尊心',
          '　__自己実現欲求__（Self-actualization）: 自分らしさの発揮',
          '低次欲求が満たされないと高次欲求は表れない（==欠乏動機==と==成長動機==の区別）',
          'プロジェクトでは==安全欲求==（雇用継続）と==承認欲求==（評価・賞賛）が動機づけに重要',
        ],
        navyItems: [[{ text: 'Maslow 1943年提唱。後期には超越欲求を6階層目に追加', style: 'navy' }]],
      },
      {
        heading: '15. ハーズバーグの動機づけ・衛生理論（二要因理論）',
        items: [
          '満足要因と不満要因は==独立した次元==という理論',
          '==動機づけ要因==（Motivators）: ==達成・承認・仕事自体・責任・昇進・成長==。満たされると==満足==',
          '==衛生要因==（Hygiene Factors）: ==給与・対人関係・作業条件・会社方針・上司の質==。満たされても満足は生まないが、欠けると==不満==',
          '__重要__: 衛生要因を改善しても==動機づけにはならない==（不満を防ぐだけ）',
          '動機づけのためには==動機づけ要因==を強化する必要がある',
          '試験頻出: 「給与は衛生要因」「承認は動機づけ要因」の分類問題',
        ],
        navyItems: [[{ text: 'Herzberg 1959年提唱。別名「二要因理論」「動機づけ衛生理論」', style: 'navy' }]],
      },
      {
        heading: '16. マグレガーのXY理論／オオウチのZ理論',
        items: [
          '__X理論__（McGregor）: 人間は本来==怠惰==で仕事を嫌う。==監督・統制・罰則==が必要',
          '__Y理論__（McGregor）: 人間は==自己実現==を求め能動的に働く。==自主性・参画==を促すべき',
          'X理論は==専制型==、Y理論は==民主・参加型==のマネジメントと対応',
          '__Z理論__（Ouchi）: 日本型経営に着想を得た理論。==終身雇用・集団意思決定・人間尊重==を特徴とする',
          'Z理論は==長期的視点==と==コミットメント==を重視',
          'プロジェクトでは__自律性のあるチーム__を作るY理論・Z理論が現代的',
        ],
      },
      {
        heading: '17. ブルームの期待理論／アダムスの公平理論',
        items: [
          '__期待理論__（Vroom）: 動機づけは ==期待==（Expectancy）×==手段性==（Instrumentality）×==誘意性==（Valence）の積で決まる',
          '　==期待==: 努力すれば成果が出るという見込み',
          '　==手段性==: 成果が報酬につながるという見込み',
          '　==誘意性==: 報酬が魅力的かどうかの主観的価値',
          'いずれか1つでもゼロなら動機はゼロ',
          '__公平理論__（Adams）: 自分の==投入==／==成果==比を==他者と比較==して公平性を評価',
          '不公平を感じると==努力低減==または==離脱==で均衡を取ろうとする',
          '試験頻出ひっかけ: 期待理論と公平理論の混同',
        ],
        navyItems: [[{ text: 'Vroom 期待理論 1964年／Adams 公平理論 1965年', style: 'navy' }]],
      },
      // ── D. チーム開発 ──
      {
        heading: '18. タックマンモデル（チーム形成の5段階）',
        items: [
          'Tuckman 1965年提唱、1977年に5段階目（Adjourning）を追加',
          '　__1. 形成期__（Forming）: メンバーが集まり==互いを探り合う==段階。礼儀正しいが==生産性は低い==',
          '　__2. 混乱期__（Storming）: 役割・価値観・進め方で==コンフリクト==が発生する段階。==最も困難==な時期',
          '　__3. 規範期__（Norming）: 規範・グランドルールが==確立==し協力が始まる',
          '　__4. 遂行期__（Performing）: ==ハイパフォーマンス==で自律的に成果を出す段階',
          '　__5. 解散期__（Adjourning）: プロジェクト終結とともにチームが==解散==、振り返りと祝福',
          '__順序は固定__。スキップ不可。混乱期で適切な対処をしないとチームは機能しない',
          'リーダーは段階に応じて関与レベルを変える（形成期は指示型→遂行期は委任型）',
        ],
        navyItems: [[{ text: '出典: Bruce Tuckman 1965年 / PMBOK第6版 §9.4.2.3 チーム開発技法', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'タックマンモデル: 5段階の順序と生産性の変化',
            ariaLabel: 'タックマンモデルの形成期から解散期までの5段階と生産性カーブを示す図',
            viewBox: '0 0 720 280',
            content: `
              <defs>
                <marker id="tuckman-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="244" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <path d="M58 220 C128 206, 168 238, 226 216 C288 192, 348 180, 412 148 C476 114, 554 98, 638 132" fill="none" stroke="#9d5b8b" stroke-width="4" />
              <text x="66" y="206" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">生産性</text>
              <line x1="62" y1="150" x2="658" y2="150" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <g>
                <rect x="38" y="68" width="112" height="58" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
                <text x="94" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">1. 形成期</text>
                <text x="94" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Forming</text>
              </g>
              <line x1="154" y1="97" x2="178" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="184" y="68" width="112" height="58" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
                <text x="240" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">2. 混乱期</text>
                <text x="240" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Storming</text>
              </g>
              <line x1="300" y1="97" x2="324" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="330" y="68" width="112" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
                <text x="386" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">3. 規範期</text>
                <text x="386" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Norming</text>
              </g>
              <line x1="446" y1="97" x2="470" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="476" y="68" width="112" height="58" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
                <text x="532" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">4. 遂行期</text>
                <text x="532" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Performing</text>
              </g>
              <line x1="592" y1="97" x2="616" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="622" y="68" width="60" height="58" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
                <text x="652" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">5. 解散</text>
                <text x="652" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Adjourn</text>
              </g>
              <text x="240" y="154" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">コンフリクト発生</text>
              <text x="532" y="154" fill="#10b981" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">自律的に成果</text>
            `,
          },
        ],
      },
      {
        heading: '19. ハイパフォーマンスチームの特性（PMBOK7）',
        items: [
          'PMBOK第7版はハイパフォーマンスチームの特性を9点挙げる',
          '　==オープン・コミュニケーション==: 心理的安全性のもと自由に発言できる',
          '　==共有された理解==: 目的・役割・進捗が全員にクリア',
          '　==共有された当事者意識==: 全員が結果に責任を持つ',
          '　==信頼==: メンバー間・リーダーとメンバー間の信頼',
          '　==コラボレーション==: 競争でなく協力',
          '　==適応性==: 変化への柔軟な対応',
          '　==レジリエンス==: 困難からの回復力',
          '　==エンパワーメント==: メンバーへの権限委譲',
          '　==認知==（Recognition）: 貢献への適切な評価',
        ],
      },
      {
        heading: '20. チーム憲章・グランドルール',
        items: [
          '==チーム憲章==（Team Charter）: チームの==価値観・運営ルール==を==成文化==した文書',
          'PMBOK第6版では==資源マネジメント計画==プロセスのアウトプット（9.1.3.2）',
          '主要記載項目: ==チームの価値観==／==コミュニケーション・ガイドライン==／==意思決定基準==／==コンフリクト解決プロセス==／==会議体==／==合意の取り方==',
          '==グランドルール==（Ground Rules）: 日常的な振る舞いの==基本ルール==',
          '例: 「会議は時間通り開始」「発言を遮らない」「決定事項は議事録で共有」',
          'チーム==形成期==に==全員参加==で策定することで==自主性==が生まれる',
          'チームメンバーの==入れ替わり==時には==見直し==が必要',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.1.3.2 チーム憲章', style: 'navy' }]],
      },
      {
        heading: '21. 心理的安全性とチーム規範',
        items: [
          '==心理的安全性==（Psychological Safety, Edmondson）: メンバーが==非難を恐れず==に発言・提案・失敗報告できる状態',
          'Google 「Project Aristotle」で==最も重要==な要素として実証',
          '心理的安全性が低いチームは==失敗を隠蔽==し==学習機会==を失う',
          '高める方法:',
          '__リーダーの脆弱性開示__: リーダー自身が「分からない」「失敗した」と言う',
          '__好奇心の表現__: 質問を歓迎しジャッジしない',
          '__貢献の認知__: 小さな貢献も==言語化==して認める',
          '==規範==（Norms）: 明文化されていない==暗黙のルール==。新メンバーへの==オンボーディング==で伝達される',
          '不健全な規範（例: 「残業が当然」）は==チーム憲章で書き換え==る',
        ],
        navyItems: [[{ text: 'Amy Edmondson 1999年論文 / Google Project Aristotle 2015年公開', style: 'navy' }]],
      },
      {
        heading: '22. バーチャルチーム・分散チームのマネジメント',
        items: [
          '==バーチャルチーム==（Virtual Team）: 物理的に==離れた場所==で働くチーム',
          '利点: ==地理的制約の解消==／==コスト削減==／==多様な人材確保==／==24時間体制==',
          '課題: ==コミュニケーション低下==／==文化差==／==孤立感==／==タイムゾーン==',
          '成功要因:',
          '　==非同期コミュニケーション==の活用（メール／チャット／文書）',
          '　==同期コミュニケーション==の確保（定期ビデオ会議／集合イベント）',
          '　==コラボレーション・ツール==の標準化（Slack／Teams／Jira／Confluence 等）',
          '　==文化的多様性==への配慮（タイムゾーン・言語・祝祭日）',
          '　==キックオフ対面==で信頼関係の基盤を築く',
          'COVID-19 以降は==ハイブリッドワーク==が一般化',
        ],
      },
      {
        heading: '23. PMBOK第6版「チームの育成」プロセス（9.4）',
        items: [
          '==9.4 チームの育成==（Develop Team）: ==実行プロセス群==に属し、メンバーの==コンピテンシー==と==相互交流==を高めチーム環境を改善する',
          '__主要インプット__: ==資源マネジメント計画書==／==チーム憲章==／==プロジェクト・チームの任命==／==スケジュール==／==プロジェクト・カレンダー==',
          '__主要ツール&技法__:',
          '　__コロケーション__（Co-location）: 物理的に==同じ場所==に集める',
          '　__バーチャル・チーム__: 分散環境の構築',
          '　__コミュニケーション技術__',
          '　__対人スキル__（傾聴・コーチング・対立解決）',
          '　__表彰と報奨__: 望ましい行動を認知し強化',
          '　__トレーニング__: スキルギャップ解消',
          '　__個人とチームのアセスメント__（=性格診断・360度評価）',
          '__主要アウトプット__: ==チーム・パフォーマンス評価==／==エンタープライズ環境要因の更新==',
          '試験頻出: ITTOの主要項目（特にツール&技法）を覚えること',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.4。第7版では「チーム」パフォーマンス領域に統合', style: 'navy' }]],
      },
      // ── E. 組織と役割 ──
      {
        heading: '24. プロジェクト組織形態',
        items: [
          'プロジェクトを実施する組織は3つの基本形態に分類される',
          '__機能型組織__（Functional）: 機能部門（営業・開発・運用等）を縦割りで配置。==機能部門マネージャ==が==強い権限==、PMは==調整役==',
          '__マトリクス型組織__（Matrix）: 機能部門と==プロジェクト==の==2軸==で人員を配置。PMと機能部門マネージャが==権限を共有==',
          '__プロジェクト型組織__（Projectized）: ==プロジェクト==を主軸に編成。PMが==最大権限==、メンバーは==専任==',
          '__組織形態によるPM権限の違い__は試験頻出',
          '機能型: PM権限==低==／プロジェクト型: PM権限==高==',
          '実態は==ハイブリッド==が多い（プロジェクトごとに異なる形態が混在）',
        ],
      },
      {
        heading: '25. マトリクス組織の3区分と権限分布',
        items: [
          'マトリクス組織は==PMの権限の強さ==で3区分される（PMBOK第6版 §2.4.1）',
          '__弱いマトリクス__（Weak Matrix）: PMは==コーディネータ==または==エクスペダイタ==（連絡係）。==決定権なし==',
          '__均衡マトリクス__（Balanced Matrix）: PMと機能部門マネージャの==権限が均衡==。コンフリクト発生しやすい',
          '__強いマトリクス__（Strong Matrix）: PMが==主要権限==。機能部門マネージャは==リソース提供者==',
          '__権限分布の例__: 予算統制／要員割当／優先順位決定／評価権限の所在',
          '__利点__: ==専門性の維持==（機能部門所属）／==プロジェクト推進力==（PM配置）',
          '__欠点__: ==指揮命令系統の二重==／==忠誠の対立==（two-boss problem）',
          'IPA午前II頻出: 弱・均衡・強の特徴一覧',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §2.4.1.2 / 第7版「テーラリング」', style: 'navy' }]],
      },
      {
        heading: '26. 責任分担マトリクス（RAM）とRACIチャート',
        items: [
          '==RAM==（Responsibility Assignment Matrix, 責任分担マトリクス）: ==作業==と==担当者==の==対応関係==を表で示す',
          '行 = ==WBS要素==（作業）、列 = ==メンバー==、セル = ==役割==',
          '==RACI==は最も一般的なRAM形式',
          '__R（Responsible, 実行責任）__: ==実際に作業==を行う担当者',
          '__A（Accountable, 説明責任）__: ==最終承認==・==説明責任==を負う者（==1人だけ==）',
          '__C（Consulted, 協議）__: ==助言を求める==専門家。==双方向==コミュニケーション',
          '__I（Informed, 報告先）__: ==結果を報告==される関係者。==一方向==コミュニケーション',
          '==Aは必ず1人==、==R は複数可==。試験頻出ルール',
          '派生形式: ==RACI-VS==（V=Verify、S=Sign-off を追加）／==RASCI==（S=Support）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.1.2.1 データ表現「責任分担マトリクス」', style: 'navy' }]],
      },
      {
        heading: '27. PMBOK第6版「資源マネジメント計画」プロセス（9.1）',
        items: [
          '==9.1 資源マネジメント計画==（Plan Resource Management）: ==計画プロセス群==。==チーム資源==と==物的資源==の見積・獲得・管理の方法を==計画==する',
          '__主要インプット__: ==プロジェクト憲章==／==プロジェクトマネジメント計画書==／==要求事項文書==／==リスク登録簿==／==EEFs/OPAs==',
          '__主要ツール&技法__: ==専門家の判断==／==データ表現==（=階層図／責任分担マトリクス／テキスト形式）／==組織理論==／==会議==',
          '__主要アウトプット__:',
          '　__1. 資源マネジメント計画書__: 資源獲得・役割と責任・組織図・育成・チーム憲章策定方針',
          '　__2. チーム憲章__: チームの価値観・運営ルール（§20参照）',
          '　__3. プロジェクト文書の更新__',
          '__資源マネジメント計画書の構成__:',
          '　==資源の特定==／==獲得==／==役割と責任==／==組織図==／==育成計画==／==チーム管理==／==認知と報奨==／==コンプライアンス==',
          '試験頻出: 計画書とチーム憲章は==別アウトプット==で混同しないこと',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.1', style: 'navy' }]],
      },
      {
        heading: '28. PMBOK第6版「活動資源見積もり／資源獲得／資源コントロール」',
        items: [
          '__9.2 活動資源の見積もり__（Estimate Activity Resources, 計画）: 各==アクティビティ==に必要な==チーム資源==と==資材・設備・サプライ==の種類と数量を==見積もる==',
          '　主要技法: ==ボトムアップ見積もり==／==類推見積もり==／==パラメトリック見積もり==／==代替案分析==',
          '　アウトプット: ==資源要求事項==／==見積もりの根拠==／==資源ブレークダウン・ストラクチャー==（RBS）',
          '__9.3 資源の獲得__（Acquire Resources, 実行）: ==計画書通り==にチームメンバー・施設・設備等を==獲得==',
          '　主要技法: ==事前割当==／==交渉==／==獲得==（外部から採用）／==バーチャルチーム==',
          '　アウトプット: ==物的資源の割当==／==プロジェクトチームの任命==／==資源カレンダー==',
          '__9.6 資源のコントロール__（Control Resources, 監視・コントロール）: ==物的資源==が==計画通り==に利用されているか監視し是正',
          '　主要技法: ==データ分析==（=コストパフォーマンス分析・トレンド分析）／==問題解決==',
          '　アウトプット: ==作業パフォーマンス情報==／==変更要求==',
          '__注意__: 9.6 は==物的資源==のみが対象。==チーム==の監視は==9.5 チームのマネジメント==',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.2 / §9.3 / §9.6', style: 'navy' }]],
      },
      {
        heading: '29. 要員管理計画・要員育成・キャリア開発',
        items: [
          '==要員管理計画==は資源マネジメント計画書の一部',
          '主要要素:',
          '　==要員獲得==（Staff Acquisition）: 内部／外部からの調達方針',
          '　==スケジュール==（Resource Calendar）: メンバーの参画期間と作業時間',
          '　==要員解放計画==（Release Plan）: プロジェクト終結時のメンバー復帰計画',
          '　==トレーニング・ニーズ==: スキルギャップと教育計画',
          '　==認知と報奨==（Recognition & Rewards）: 望ましい行動の強化',
          '　==コンプライアンス==: 法令・規制・組織方針への準拠',
          '　==キャリア開発==: メンバーの==成長機会==の提供（プロジェクト経験を==スキル獲得==の場とする）',
          'PMはメンバーの==キャリアパス==を意識した==役割割当==を行うべき',
        ],
      },
      {
        heading: '30. PMO の役割と類型',
        items: [
          '==PMO==（Project Management Office）: プロジェクト管理の==標準化・支援==を行う==組織横断的==な部署',
          'PMBOK第6版 §2.4.4.3 は3類型を定義',
          '　__支援型 PMO__（Supportive）: ==テンプレート提供==／==ベストプラクティス共有==／==トレーニング==。==コントロール度==: ==低==',
          '　__コントロール型 PMO__（Controlling）: ==フレームワーク強制==／==準拠状況の監査==。==コントロール度==: ==中==',
          '　__指揮型 PMO__（Directive）: ==プロジェクトを直接管理==／PM を==PMO に配属==。==コントロール度==: ==高==',
          '__他の機能__:',
          '　==リソース管理==（メンバーの組織横断的配置）',
          '　==ポートフォリオ管理==（戦略整合性の確保）',
          '　==方法論策定==（PMBOK採用／独自テーラリング）',
          '　==組織変革管理==',
          '試験頻出: 3類型のコントロール度と提供サービスの対応',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §2.4.4.3 PMO の種類', style: 'navy' }]],
      },
      // ── F. 紛争マネジメント ──
      {
        heading: '31. プロジェクトでの紛争の発生源',
        items: [
          'PMBOK は紛争（コンフリクト）の主要発生源を7つ挙げる',
          '　==スケジュール==: 締切・優先順位の認識違い（==最頻発==）',
          '　==プロジェクトの優先順位==: 複数案件の優先付け',
          '　==要員==（Resources）: 人員配置の不一致',
          '　==技術的意見==: 設計・実装方針の対立',
          '　==管理上の手続き==: 進め方・承認プロセスの違い',
          '　==コスト==: 予算配分',
          '　==個性==（Personality）: 個人の性格・価値観の対立（==解決最難==）',
          '紛争は==否定すべきものではなく==、適切に==マネジメント==することで==創造性==を生む',
          '==サプレッシング==（抑圧）は短期的に有効でも長期的には悪化',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.5.2.1 対人スキル「コンフリクト・マネジメント」', style: 'navy' }]],
      },
      {
        heading: '32. トーマス-キルマンの5つの対処モード',
        items: [
          'Thomas-Kilmann コンフリクト・モデル: ==自己主張==（縦軸）×==協調==（横軸）の2軸で5モードを整理',
          '　__1. 撤退／回避__（Withdraw／Avoid）: 自己主張==低==・協調==低==。「触れない」。==一時退避==に有効、根本解決にならない',
          '　__2. 鎮静／受容__（Smooth／Accommodate）: 自己主張==低==・協調==高==。「相手に合わせる」。==関係維持==重視',
          '　__3. 妥協／和解__（Compromise／Reconcile）: 自己主張==中==・協調==中==。「中間を取る」。==双方一部不満==',
          '　__4. 強制／指示__（Force／Direct）: 自己主張==高==・協調==低==。「権限で押し通す」。==緊急時==に有効',
          '　__5. 協力／問題解決__（Collaborate／Problem Solve）: 自己主張==高==・協調==高==。「Win-Win」。==最も望ましい==解決方法',
          'PMBOK第6版／第7版とも==問題解決==を==推奨==',
          '状況に応じて使い分け、==問題解決==を==デフォルト==に',
        ],
        navyItems: [[{ text: '出典: Thomas & Kilmann 1974年 / PMBOK第6版 §9.5.2.1', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'トーマス-キルマン: 自己主張 × 協調の5モード',
            ariaLabel: '自己主張と協調の2軸上にキルマンの5つの対処モードを配置した図',
            viewBox: '0 0 640 430',
            content: `
              <defs>
                <marker id="kilmann-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#1e293b" />
                </marker>
              </defs>
              <rect x="20" y="18" width="600" height="388" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <line x1="96" y1="340" x2="552" y2="340" stroke="#1e293b" stroke-width="2" marker-end="url(#kilmann-arrow)" />
              <line x1="96" y1="340" x2="96" y2="72" stroke="#1e293b" stroke-width="2" marker-end="url(#kilmann-arrow)" />
              <line x1="96" y1="206" x2="552" y2="206" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="324" y1="340" x2="324" y2="72" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <text x="324" y="382" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">協調（Cooperativeness）低 → 高</text>
              <text x="50" y="206" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle" transform="rotate(-90 50 206)">自己主張（Assertiveness）低 → 高</text>
              <rect x="120" y="86" width="148" height="70" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="194" y="113" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">強制／指示</text>
              <text x="194" y="132" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Force / Direct</text>
              <rect x="380" y="86" width="148" height="70" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="454" y="113" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">協力／問題解決</text>
              <text x="454" y="132" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Collaborate</text>
              <rect x="250" y="188" width="148" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="324" y="215" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">妥協／和解</text>
              <text x="324" y="234" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Compromise</text>
              <rect x="120" y="286" width="148" height="70" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="194" y="313" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">撤退／回避</text>
              <text x="194" y="332" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Withdraw / Avoid</text>
              <rect x="380" y="286" width="148" height="70" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="454" y="313" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">鎮静／受容</text>
              <text x="454" y="332" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Accommodate</text>
            `,
          },
        ],
      },
      {
        heading: '33. PMBOK第6版「チームのマネジメント」プロセス（9.5）',
        items: [
          '==9.5 チームのマネジメント==（Manage Team）: ==実行プロセス群==。チームメンバーの==パフォーマンス==を==追跡==し==フィードバック==／==問題解決==／==変更管理==を行う',
          '__主要インプット__: ==プロジェクトマネジメント計画書==（特に資源マネジメント計画書）／==チーム憲章==／==チーム・パフォーマンス評価==／==問題ログ==／==作業パフォーマンス報告書==',
          '__主要ツール&技法__:',
          '　__対人スキル__:',
          '　　==コンフリクト・マネジメント==（§32 のキルマン5モード）',
          '　　==意思決定==',
          '　　==感情的知性==（Emotional Intelligence）',
          '　　==影響力==（Influencing）',
          '　　==リーダーシップ==',
          '　__プロジェクトマネジメント情報システム__（PMIS）',
          '__主要アウトプット__: ==変更要求==／==プロジェクトマネジメント計画書の更新==／==プロジェクト文書の更新==',
          '注: 9.5 は==チーム==の管理、9.6 は==物的資源==のコントロール（混同しない）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.5', style: 'navy' }]],
      },
      {
        heading: '34. 紛争解決の優先順位とエスカレーション',
        items: [
          'PMBOK は紛争解決の==優先順位==を示す',
          '　__1.__ 当事者間で解決を試みる（==自律的解決==）',
          '　__2.__ 当事者の合意で==第三者==（PM等）に==仲介依頼==',
          '　__3.__ PMが==非公式==に==仲介==',
          '　__4.__ PMが==公式==に==調停==',
          '　__5.__ 機能部門マネージャに==エスカレーション==',
          '　__6.__ スポンサー／==経営層==に==エスカレーション==（==最終手段==）',
          '==当事者間解決==が==望ましい==が、解決できない場合は==早期エスカレーション==が長期化を防ぐ',
          '==エスカレーション==の条件は==チーム憲章==に==事前明文化==しておく',
        ],
      },
      {
        heading: '35. 多文化チーム・多様性への配慮',
        items: [
          'グローバル化・リモートワーク普及で==多文化チーム==が一般化',
          '__文化次元__（Hofstede）:',
          '　==権力格差==（Power Distance）: 階層・権威への受容度',
          '　==個人主義 vs 集団主義==',
          '　==男性性 vs 女性性==',
          '　==不確実性回避==',
          '　==長期志向 vs 短期志向==',
          '　==放縦 vs 抑制==',
          '__配慮事項__: ==言語==（共通語＋翻訳）／==タイムゾーン==（会議時間の輪番）／==祝祭日==／==コミュニケーション・スタイル==（直接的／間接的）',
          '__ダイバーシティ&インクルージョン__（D&I）: 多様な背景・属性を==活かす==姿勢',
          '__無意識バイアス__（Unconscious Bias）の認識と==是正==',
          '==文化的差異==は==コンフリクトの源==にも==創造性の源==にもなる',
        ],
        navyItems: [[{ text: 'Hofstede 文化次元理論。1980年初版、2010年6次元に拡張', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '36. 過去問頻出論点（午前II）',
        items: [
          '__リーダーシップ理論__: ==マネジリアル・グリッド==の座標／==SL理論==の4スタイル／==サーバントリーダーシップ==の特徴',
          '__モチベーション理論__: ==マズロー==の階層（特に承認欲求）／==ハーズバーグ==の動機づけ要因 vs 衛生要因／==期待理論==の3要素／==XY理論==の対比',
          '__タックマンモデル__: 5段階の==順序==と==特徴==（特に混乱期の対処）',
          '__RACI__: A は==1人だけ==／R と A の違い／C は==双方向==・I は==一方向==',
          '__組織形態__: 機能型／マトリクス（弱・均衡・強）／プロジェクト型のPM権限',
          '__資源マネジメント・プロセス（PMBOK6）__: 6プロセスのうちどれが==計画==／==実行==／==監視==に属するか',
          '__ITTO__: ==チームの育成==（9.4）／==チームのマネジメント==（9.5）の==ツール&技法==',
          '__コンフリクト__: ==問題解決==が最善／==キルマンの5モード==の対比',
          '__PMO__: ==支援型==／==コントロール型==／==指揮型==の==コントロール度==',
        ],
      },
      {
        heading: '37. ひっかけパターン',
        items: [
          '__期待理論 vs 公平理論__: ==Vroom==（E×I×V の積）と==Adams==（他者比較の公平感）の混同',
          '__XY理論 vs Z理論__: ==McGregor==（Xは怠惰／Yは自律）と==Ouchi==（Zは日本型）の混同',
          '__衛生要因 vs 動機づけ要因__: ==給与==は衛生（不満防止）、==承認==は動機づけ（満足促進）',
          '__SL理論のスタイル名__: S1 指示／S2 説得／S3 参加／S4 委任の==順序==',
          '__タックマン段階__: 「形成期」と「規範期」の混同／「混乱期」をスキップしないこと',
          '__RACI__: A は==必ず1人==、R は==複数可==／C と I の==方向性==',
          '__マトリクス組織__: ==弱==（PM弱）・==均衡==（権限均等）・==強==（PM強）の==逆順==',
          '__PMBOK6 vs PMBOK7 用語__: ==資源マネジメント==（第6版）vs ==チーム・パフォーマンス領域==（第7版）',
          '__9.5 vs 9.6__: 9.5 は==チーム==、9.6 は==物的資源==',
          '__コンフリクト発生源__: ==スケジュール==が==最頻発==（個性ではない）',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】PMBOK第6版「資源マネジメント」6プロセス（9.1〜9.6）の==プロセス群==（計画／実行／監視）と==ITTO主要項目==を空で言えるレベルまで暗記。',
      '【リーダーシップ】==マネジリアル・グリッド==の9,9（チーム型）／==SL理論==のS1〜S4／==サーバントリーダーシップ==の特徴は午前II頻出。',
      '【モチベーション】==マズロー==5階層／==ハーズバーグ==二要因／==XY理論==／==期待理論== の対比を表で覚える。',
      '【タックマン】5段階の==順序==（形成→混乱→規範→遂行→解散）と各段階のリーダーシップ・スタイルの対応。',
      '【RACI】==A は1人だけ==、==R は複数可==、C は==双方向==、I は==一方向==。試験頻出ルール。',
      '【組織形態】機能型／マトリクス3区分／プロジェクト型のPM権限の==強さ順==を覚える（弱→均衡→強→プロジェクト型）。',
      '【コンフリクト】キルマン5モードのうち==問題解決==（Collaborate）が==最善==。==スケジュール==が==最頻発==の発生源。',
      '【ひっかけ】==期待理論 vs 公平理論==、==XY vs Z==、==衛生要因 vs 動機づけ要因==、==9.5 vs 9.6==、==PMBOK6 vs PMBOK7 用語==の混同に注意。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロセス・ITTO==は第6版、==パフォーマンス領域・サーバントリーダーシップ==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 3. 開発アプローチ（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'development-approach': {
    summary:
      'プロジェクトを進める手順とリリース戦略を扱う活動領域。==予測型==（ウォーターフォール）／==適応型==（アジャイル）／==ハイブリッド==の3類型を中心に、ライフサイクル選定基準・スクラム・カンバン・XP・スケーリング手法を学ぶ。PMBOK第6版は本体＋==アジャイル実務ガイド==で対応、第7版は「==開発アプローチとライフサイクル==」パフォーマンス領域として独立章化。IPA PM試験では==アジャイルマニフェスト==・==INVEST==・スクラム役割／イベント／成果物が頻出。',
    sections: [
      // ── A. 定義・基本概念 ──
      {
        heading: '1. プロジェクトライフサイクルの定義と特性',
        items: [
          '==プロジェクトライフサイクル==: プロジェクトの==開始から完了==までに通過する一連の==フェーズ==',
          '__フェーズの構成要素__: 名称・成果物・終結基準・関与する組織',
          '__コスト/要員配分カーブ__: 序盤低・中盤ピーク・終盤逓減（==typical S字型==）',
          '__フェーズゲート（Phase Gate）__: フェーズ間で==Go/No-Go==判定を行う意思決定ポイント',
          '__ステークホルダー影響力__: 序盤が==最大==、終盤に向けて低下',
          '__変更コスト__: 序盤が==最小==、終盤が==最大==',
          'PMBOK第6版 §1.2.4 で4種類のライフサイクル（予測型／反復型／漸進型／適応型）を整理',
          'PMBOK第7版は==ライフサイクル==と==開発アプローチ==を==パフォーマンス領域==の中心概念に格上げ',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §1.2.4 プロジェクトライフサイクル／PMBOK第7版「開発アプローチとライフサイクル」パフォーマンス領域', style: 'navy' }]],
      },
      {
        heading: '2. 開発アプローチの3類型（予測型／適応型／ハイブリッド）',
        items: [
          '__3類型__:',
          '　==予測型==（Predictive）: 計画駆動。要件・スコープを==上流で確定==し順次実行。「==プロジェクト型==」「==ウォーターフォール==」と同義扱い',
          '　==適応型==（Adaptive）: 価値駆動。要件を==段階的に詳細化==し、==短い反復==で動くものを出す。==アジャイル==の総称',
          '　==ハイブリッド==（Hybrid）: 予測型と適応型を==組み合わせ==。フェーズや成果物単位で使い分け',
          '3類型は==離散的ではなく連続体==（continuum）として捉える',
          'PMBOK第6版 §1.2.4 ではさらに==反復型==（iterative）と==漸進型==（incremental）を別カテゴリで定義',
          '__反復型__（iterative）: 全体を作りつつ繰り返し==洗練==する',
          '__漸進型__（incremental）: 部分機能を順次==完成==させて積み上げる',
          'アジャイル = 反復型 + 漸進型の==両方==を採用',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §1.2.4.2-4 / アジャイル実務ガイド §3', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第7版「開発アプローチとライフサイクル」パフォーマンス領域',
        items: [
          '第7版の==8パフォーマンス領域==の1つ',
          '__目的__: プロジェクトの==成果物と価値==を最も効果的に提供するため、適切な==開発アプローチ==と==ライフサイクル==を選択・適応する',
          '__成果1__: 最終成果物に整合する==開発アプローチ==',
          '__成果2__: 価値を==早期に提供==できるライフサイクル',
          '__成果3__: チーム・組織・ステークホルダーが==容易に取り組める==プロセス',
          '__主な検討事項__: 成果物の性質／納期／組織・市場の状況／チーム能力',
          '__テーラリング__の対象: アプローチ選定そのものがテーラリング',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「開発アプローチとライフサイクル」パフォーマンス領域。第6版では §1.2.4 と アジャイル実務ガイドが該当', style: 'navy' }]],
      },
      {
        heading: '4. PMBOK第6版とアジャイル実務ガイドの関係',
        items: [
          'PMBOK第6版==本体==は==予測型中心==で記述',
          'PMBOK第6版に==付属書==として==アジャイル実務ガイド==（Agile Practice Guide）が同梱',
          'アジャイル実務ガイドの位置づけ: 各知識エリアの==アジャイル/ハイブリッド適用==を補足解説',
          'アジャイル実務ガイドの主要章: ==ライフサイクル選定==／==アジャイル環境作り==／==アジャイル組織変革==／==スクラム==／==XP==／==カンバン==等',
          '__注意__: アジャイル実務ガイドは==PMBOK第6版の一部==として扱われる（試験対象）',
          'PMBOK第7版で==アジャイルがメインストリーム化==され、本体に統合された',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 アジャイル実務ガイド（PMI/Agile Alliance 共同制作）', style: 'navy' }]],
      },
      {
        heading: '5. 開発アプローチの選定基準',
        items: [
          '__選定の主要判断軸__:',
          '　==要件の安定性==: 安定 → 予測型／変化が前提 → 適応型',
          '　==不確実性レベル==: 低 → 予測型／高 → 適応型',
          '　==顧客フィードバック頻度==: 少 → 予測型／多 → 適応型',
          '　==リリース戦略==: 一括 → 予測型／段階的・継続的 → 適応型',
          '　==規制環境==: 厳格（医療・金融・原子力等）→ 予測型寄り',
          '　==チーム経験==: アジャイル未経験 → ハイブリッドで段階移行',
          '__Stacey マトリクス__: ==要求の不確実性==×==技術の不確実性==で適用領域を判定',
          '__Cynefin フレームワーク__: ==単純==／==困難==／==複雑==／==混沌==の4領域でアプローチを変える',
          '試験頻出: 「適応型が==適する条件==／適さない条件」の判別問題',
        ],
        navyItems: [[{ text: '出典: アジャイル実務ガイド §3「ライフサイクルの選定」', style: 'navy' }]],
      },
      // ── B. 予測型ライフサイクル ──
      {
        heading: '6. 予測型（プロジェクト型）の特徴・進め方',
        items: [
          '==予測型==: 計画駆動（plan-driven）のアプローチ',
          '__基本思想__: ==上流で詳細計画==を確定し、計画通り実行する',
          '__フェーズ進行__: 要件 → 設計 → 実装 → テスト → 運用（==順次完了==）',
          '変更は==厳密に管理==（変更管理委員会／CCB）',
          '__文書化重視__: 設計書・仕様書を成果物として作成',
          '__規模__: 大規模・長期プロジェクトに伝統的に適用',
          'PMBOK第6版 49プロセスは==基本的に予測型==を前提とする',
        ],
      },
      {
        heading: '7. ウォーターフォール・モデル',
        items: [
          '==ウォーターフォール==（Waterfall Model）: 1970年 Royce が提唱（ただし本人は批判的）',
          '__フェーズ__: ==要求定義== → ==基本設計== → ==詳細設計== → ==実装== → ==テスト== → ==運用・保守==',
          '__特徴__: 上から下への==一方向==、前フェーズ完了後に次へ進む',
          '__利点__: フェーズ管理が容易、文書化が明確、進捗が見えやすい',
          '__欠点__: 戻りが困難（==ゲート通過後の変更コスト高==）、要件不確実時に破綻',
          '日本の伝統的SI開発で広く採用',
          'PMBOK上は==予測型==の代表例として扱われる',
        ],
      },
      {
        heading: '8. V字モデル',
        items: [
          '==V字モデル==: ウォーターフォールの==検証・妥当性確認==を強化したモデル',
          '__左側（設計）と右側（テスト）の対応__:',
          '　==要件定義== ↔ ==システムテスト==（受入テスト）',
          '　==基本設計== ↔ ==結合テスト==',
          '　==詳細設計== ↔ ==単体テスト==',
          '__検証（Verification）__: 「正しく作っているか」（仕様への適合）',
          '__妥当性確認（Validation）__: 「正しいものを作っているか」（要求への適合）',
          '__W字モデル__: V字に==早期テスト==（テスト設計を設計段階から実施）を加えた発展形',
          '組込み系・制御系で広く採用',
        ],
        navyItems: [[{ text: 'V字モデルは IPA午後I で開発工程と対応するテスト工程を問う形で頻出', style: 'navy' }]],
      },
      {
        heading: '9. 予測型のメリット・デメリット',
        items: [
          '__メリット__:',
          '　==計画明確==: 全体スコープ・スケジュール・コストが事前に把握可能',
          '　==進捗管理容易==: ガントチャート・EVMで定量管理',
          '　==文書化==: 引き継ぎ・監査・規制対応がしやすい',
          '　==コスト予測精度==: 早期に正確な見積もり',
          '__デメリット__:',
          '　==変更対応困難==: 上流確定後の要件変更がコスト高',
          '　==要件不確実時に破綻==: 計画と実態の乖離',
          '　==フィードバック遅延==: 完成までユーザが触れない',
          '　==価値実現遅延==: 一括リリースまで価値を出せない',
        ],
      },
      {
        heading: '10. 予測型が適する条件・適さない条件',
        items: [
          '__適する条件__:',
          '　==要件が明確で変化しない==',
          '　==技術が成熟==している（実績・標準化済）',
          '　==規制が厳格==（医療機器・金融・原子力等）',
          '　==システム重要度が極高==（ライフクリティカル）',
          '　==外部ベンダー契約==（固定価格・スコープ）',
          '__適さない条件__:',
          '　==要件が変動==する（市場・顧客ニーズの変化）',
          '　==フィードバックが必要==（新製品開発）',
          '　==技術探索的==（プロトタイピング要）',
          '　==価値の早期実現==が必要',
          '試験頻出: 適さない場面で予測型を選ぶ選択肢が誤答パターン',
        ],
      },
      // ── C. 適応型ライフサイクル ──
      {
        heading: '11. アジャイル思想の起源とリーン思想',
        items: [
          '__アジャイルの起源__: ==2001年== ユタ州 ==Snowbird== で17名の有志が==アジャイルマニフェスト==を発表',
          '__起源となる手法__（マニフェスト以前から存在）:',
          '　==XP==（Extreme Programming, 1996, Kent Beck）',
          '　==Scrum==（1995, Jeff Sutherland & Ken Schwaber）',
          '　==FDD==（Feature-Driven Development, 1997）',
          '　==DSDM==（Dynamic Systems Development Method, 1994）',
          '　==Crystal==（Alistair Cockburn）',
          '__リーン思想の影響__: ==トヨタ生産方式==（TPS）由来の==ムダ排除==／==ジャストインタイム==／==カイゼン==／==自働化==',
          'アジャイル ⊂ リーン思想（リーン・ソフトウェア開発が橋渡し）',
        ],
        navyItems: [[{ text: '出典: Agile Manifesto agilemanifesto.org / リーン思想は大野耐一「トヨタ生産方式」', style: 'navy' }]],
      },
      {
        heading: '12. アジャイルソフトウェア開発宣言（4価値・12原則）',
        items: [
          '__4つの価値__（左辺より==右辺==により価値を置く）:',
          '　==プロセスやツールよりも個人と対話を==',
          '　==包括的なドキュメントよりも動くソフトウェアを==',
          '　==契約交渉よりも顧客との協調を==',
          '　==計画に従うことよりも変化への対応を==',
          '左辺にも価値があることを==認めながらも==、右辺により価値を置く',
          '__12原則__の主要なもの:',
          '　==顧客満足==（価値ある成果物の継続的提供）',
          '　==変化を歓迎==',
          '　==短期間の動くソフトウェア==の提供',
          '　==ビジネスと開発者の協働==',
          '　==自己組織化チーム==',
          '　==継続的な技術的卓越性==',
          '　==シンプルさ==（やらないことの最大化）',
          '　==振り返り==による定期的な調整',
          '試験頻出: 4価値の==右辺・左辺==の逆転や、別文言への差し替えがひっかけパターン',
        ],
        navyItems: [[{ text: '出典: agilemanifesto.org（2001年）。IPA午前II R6秋期 問17 で出題実績', style: 'navy' }]],
      },
      {
        heading: '13. イテラティブ vs インクリメンタル（適応型の2つの軸）',
        items: [
          '__イテラティブ__（反復型, Iterative）: ==全体を作って洗練==を繰り返す',
          '　例: 絵を==下書き→着色→修正==で完成度を上げる',
          '__インクリメンタル__（漸進型, Incremental）: ==部分を順次完成==させて積み上げ',
          '　例: 家を==キッチン → 寝室 → リビング==の順で完成',
          '__アジャイル__ = ==反復型 + 漸進型==の組合せ',
          '　各スプリントで「==小さな範囲==の機能を==動く形==で完成」（インクリメント）',
          '　次スプリントで前回のフィードバックを反映して==洗練==（イテレーション）',
          '__予測型__ = ==一度に全部==（反復なし、漸進なし）',
          '試験頻出: 「反復型」と「漸進型」の単独定義を問う設問',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'イテラティブは全体を洗練、インクリメンタルは部分を積み上げる',
            ariaLabel: 'イテラティブとインクリメンタルの違いを上下2段で比較する図',
            viewBox: '0 0 720 360',
            content: `
              <defs>
                <marker id="iter-inc-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="324" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <text x="72" y="78" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">反復型</text>
              <text x="72" y="96" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Iterative</text>
              <rect x="130" y="50" width="120" height="76" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="190" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体の下書き</text>
              <path d="M160 105 Q190 70 220 105" fill="none" stroke="#64748b" stroke-width="2" />
              <line x1="256" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="310" y="50" width="120" height="76" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="370" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体を着色</text>
              <path d="M340 105 Q370 58 400 105" fill="none" stroke="#9d5b8b" stroke-width="3" />
              <line x1="436" y1="88" x2="480" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="490" y="50" width="120" height="76" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="550" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体を修正</text>
              <path d="M520 105 Q550 48 580 105" fill="none" stroke="#10b981" stroke-width="3" />
              <text x="370" y="146" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">同じ全体像を何度も洗練する</text>
              <line x1="46" y1="178" x2="674" y2="178" stroke="#cbd5e1" stroke-width="1" />
              <text x="72" y="232" fill="#9d5b8b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">漸進型</text>
              <text x="72" y="250" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Incremental</text>
              <rect x="130" y="210" width="120" height="76" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="190" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">キッチン完成</text>
              <line x1="256" y1="248" x2="300" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="310" y="210" width="120" height="76" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <rect x="310" y="210" width="60" height="76" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="370" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">寝室を追加</text>
              <line x1="436" y1="248" x2="480" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="490" y="210" width="120" height="76" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <line x1="530" y1="210" x2="530" y2="286" stroke="#10b981" stroke-width="2" />
              <line x1="570" y1="210" x2="570" y2="286" stroke="#10b981" stroke-width="2" />
              <text x="550" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">リビング追加</text>
              <text x="370" y="306" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">完成済みの部分を順に増やす</text>
            `,
          },
        ],
      },
      {
        heading: '14. 適応型のメリット・デメリット',
        items: [
          '__メリット__:',
          '　==変化対応==: 要件変更を歓迎し随時取り込み',
          '　==早期価値提供==: 短期サイクルで動くものを出す',
          '　==顧客満足==: フィードバックで方向修正',
          '　==リスク低減==: 早期発見・早期対応',
          '　==チーム自律==: 自己組織化で意思決定速度向上',
          '__デメリット__:',
          '　==スコープ管理難==: 全体像が見えにくい',
          '　==契約難==: 固定価格契約と相性悪い',
          '　==見積もり難==: 全体コスト・期間の予測が困難',
          '　==組織変革必要==: 命令統制型組織と相性悪い',
          '　==文書化軽視==: 引き継ぎ・規制対応で課題',
        ],
      },
      {
        heading: '15. 適応型が適する条件・適さない条件',
        items: [
          '__適する条件__:',
          '　==不確実性が高い==（要件・技術）',
          '　==フィードバックが必要==（新製品・ユーザビリティ重視）',
          '　==技術探索的==',
          '　==価値の早期実現==が必要',
          '　==顧客が常時関与可能==',
          '__適さない条件__:',
          '　==規制が厳格==で文書化必須',
          '　==固定価格契約==で全スコープ事前合意必要',
          '　==システム重要度が極高==（航空・原子力・医療機器）',
          '　==顧客関与が困難==',
          '　==ハードウェア重心==で物理的に分割困難',
        ],
      },
      {
        heading: '16. 予測型 vs 適応型の比較',
        items: [
          '__計画粒度__: 予測型 = ==全体詳細==／適応型 = ==近期詳細・遠期粗==（ローリングウェーブ）',
          '__変更管理__: 予測型 = ==CCBで厳格管理==／適応型 = ==バックログで歓迎==',
          '__リリース時期__: 予測型 = ==終盤一括==／適応型 = ==継続的・反復的==',
          '__顧客関与__: 予測型 = ==要件定義時とUAT==／適応型 = ==常時関与==（PO等）',
          '__リスク管理__: 予測型 = ==上流で網羅==／適応型 = ==反復ごとに継続==',
          '__成功基準__: 予測型 = ==QCD遵守==／適応型 = ==価値実現・顧客満足==',
          '__文書化__: 予測型 = ==重視==／適応型 = ==必要最小限==',
          '__チーム__: 予測型 = ==階層型==／適応型 = ==自己組織化==',
        ],
        navyItems: [[{ text: '試験頻出の対比表。両者は二者択一ではなく連続体として理解', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: '予測型 vs 適応型: 試験頻出の8項目比較',
            headers: ['項目', '予測型', '適応型'],
            rowHeaderFirstCol: true,
            rows: [
              ['計画粒度', '全体を詳細化', '近期詳細・遠期粗'],
              ['変更管理', 'CCBで厳格管理', 'バックログで歓迎'],
              ['リリース', '終盤に一括', '継続的・反復的'],
              ['顧客関与', '要件定義時とUAT', '常時関与'],
              ['リスク管理', '上流で網羅', '反復ごとに継続'],
              ['成功基準', 'QCD遵守', '価値実現・顧客満足'],
              ['文書化', '重視', '必要最小限'],
              ['チーム', '階層型', '自己組織化'],
            ],
          },
        ],
      },
      // ── D. スクラム ──
      {
        heading: '17. スクラム概観・経験主義の3本柱',
        items: [
          '==スクラム==: アジャイル手法の代表格。==経験主義==（empiricism）に基づく軽量フレームワーク',
          '__3本柱__:',
          '　==透明性==（Transparency）: 進捗・成果物・障害を==全員が見える化==',
          '　==検査==（Inspection）: 定期的に==状況を確認==',
          '　==適応==（Adaptation）: 検査結果に基づき==プロセスや成果物を調整==',
          '__タイムボックス制__: イベントごとに==時間上限==を設定',
          '__自己組織化チーム__: チームが==自律的==に作業計画・実行',
          '__経験的プロセス制御__: 計画通りではなく==実績に基づく==調整',
          '__複雑な領域__（要求と技術が両方不確実）に最も適する',
        ],
        navyItems: [[{ text: '出典: Scrum Guide（最新版 2020年）。Jeff Sutherland & Ken Schwaber 作成', style: 'navy' }]],
      },
      {
        heading: '18. スクラムチームの役割',
        items: [
          '__スクラムチームの3役割__（合計 約10名以下が推奨）:',
          '　==プロダクトオーナー==（PO, Product Owner）: ==プロダクトの価値最大化==に責任を持つ',
          '　　主な責務: ==プロダクトゴール==の策定／==プロダクトバックログ==の管理／優先順位付け／受入判断',
          '　==スクラムマスター==（SM, Scrum Master）: ==スクラムの実践支援==・障害除去（==サーバントリーダー==）',
          '　　主な責務: スクラムの==コーチング==／==障害物の除去==／チームの==自己組織化==促進',
          '　==開発者==（Developer）: ==インクリメント作成==に責任を持つ',
          '　　主な責務: ==スプリントバックログ==の作成と実行／==完了の定義==の遵守',
          '__POとSMの違い__（試験頻出ひっかけ）: PO は「==何を==作るか」、SM は「==どう==作るか」を支援',
          'スクラムチームは==自己組織化==・==機能横断型==（cross-functional）',
        ],
        navyItems: [[{ text: '2020年版 Scrum Guide で「開発チーム」が「開発者」に変更、PO/SM もスクラムチームの一員と明確化', style: 'navy' }]],
      },
      {
        heading: '19. スクラムイベント（5つ）',
        items: [
          '__5つのイベント__（すべてタイムボックス制）:',
          '　==スプリント==（Sprint）: ==1-4週==間（最大1ヶ月）の==コンテナイベント==。他の4イベントを内包',
          '　==スプリント計画==（Sprint Planning）: スプリント開始時。最大==8時間==（1ヶ月スプリントの場合）',
          '　　決定事項: ==なぜ==このスプリントが価値ある？／==何を==できる？／==どう==実現する？',
          '　==デイリースクラム==（Daily Scrum）: 毎日 ==15分==。==開発者==が主催',
          '　　目的: 進捗共有／障害特定／次の24時間の計画',
          '　==スプリントレビュー==（Sprint Review）: スプリント末。最大==4時間==',
          '　　目的: ==ステークホルダー==と成果物を確認／フィードバック収集／バックログ更新',
          '　==スプリントレトロスペクティブ==（Sprint Retrospective）: レビュー後・次スプリント前。最大==3時間==',
          '　　目的: ==チームの改善==（プロセス・関係性・道具）',
          '試験頻出: イベント名・順序・タイムボックス・主催者',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'スクラムイベント: スプリントをコンテナとして4イベントを配置',
            ariaLabel: 'スプリント内のスクラムイベントの順序とタイムボックスを示す図',
            viewBox: '0 0 720 340',
            content: `
              <defs>
                <marker id="scrum-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="304" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <rect x="70" y="78" width="580" height="184" rx="12" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="360" y="58" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="16" font-weight="700" text-anchor="middle">Sprint（1〜4週 / 最大1か月）</text>
              <rect x="94" y="118" width="126" height="66" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="157" y="142" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">スプリント計画</text>
              <text x="157" y="162" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大8h</text>
              <line x1="224" y1="151" x2="270" y2="151" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="282" y="112" width="156" height="78" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="360" y="136" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">デイリースクラム</text>
              <text x="360" y="156" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">毎日15分</text>
              <text x="360" y="176" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">進捗・障害・24h計画</text>
              <line x1="442" y1="151" x2="488" y2="151" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="500" y="118" width="126" height="66" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="563" y="142" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">レビュー</text>
              <text x="563" y="162" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大4h</text>
              <line x1="563" y1="188" x2="563" y2="214" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="500" y="220" width="126" height="56" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="563" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">レトロ</text>
              <text x="563" y="260" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大3h</text>
              <text x="104" y="292" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">開始: 計画</text>
              <text x="498" y="292" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">終了: レビュー → レトロ</text>
              <circle cx="330" cy="210" r="7" fill="#9d5b8b" />
              <circle cx="360" cy="210" r="7" fill="#9d5b8b" />
              <circle cx="390" cy="210" r="7" fill="#9d5b8b" />
              <text x="360" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Daily repeats</text>
            `,
          },
        ],
      },
      {
        heading: '20. スクラム成果物と完了の定義',
        items: [
          '__3つの成果物__:',
          '　==プロダクトバックログ==（Product Backlog）: プロダクト改善に必要な==すべての項目==の優先順位付きリスト',
          '　　責任者: ==プロダクトオーナー==',
          '　　==コミットメント==: ==プロダクトゴール==',
          '　==スプリントバックログ==（Sprint Backlog）: 当該スプリントで取り組む項目＋計画',
          '　　責任者: ==開発者==',
          '　　==コミットメント==: ==スプリントゴール==',
          '　==インクリメント==（Increment）: ==動作する==プロダクトの==検査可能==な成果',
          '　　==コミットメント==: ==完了の定義==（DoD）',
          '__完了の定義__（Definition of Done, DoD）: 「==完了==」とみなす品質基準（テスト済・レビュー済・ドキュメント済等）',
          '__ストーリーポイント__: 相対見積もりの単位（フィボナッチ数列 1/2/3/5/8/13...）',
        ],
      },
      {
        heading: '21. ユーザストーリーと INVEST',
        items: [
          '==ユーザストーリー==: 価値を==ユーザ視点==で表現する短文形式',
          '__標準フォーマット__: 「==As a== (ユーザ役割) , ==I want== (機能) , ==so that== (価値)」',
          '__例__: 「As a 営業担当, I want 月次レポート自動生成, so that 月初業務時間を削減できる」',
          '__INVEST 観点__（良いユーザストーリーの6基準）:',
          '　==Independent==（独立）: 他ストーリーから独立して着手・完了できる',
          '　==Negotiable==（交渉可能）: 詳細はチーム・POと交渉で決める',
          '　==Valuable==（価値あり）: ==ユーザまたは顧客==にとって価値がある',
          '　==Estimable==（見積可能）: 規模を見積もれる',
          '　==Small==（小さい）: ==1スプリント以内==で完了できる',
          '　==Testable==（テスト可能）: ==受入基準==で検証できる',
          '__受入基準__（Acceptance Criteria）: 「完了」とみなす条件（Given-When-Then 形式が一般的）',
          '試験頻出: INVEST の6要素、特に==Valuable==の主体（開発者ではなく顧客）',
        ],
        navyItems: [[{ text: 'IPA午前II R6秋期 問16 で INVEST 観点が出題。Bill Wake 2003年提唱', style: 'navy' }]],
      },
      {
        heading: '22. ベロシティ・バーンダウン・バーンアップ',
        items: [
          '==ベロシティ==（Velocity）: 1スプリントで==完了==したストーリーポイントの合計',
          '__使い方__: 過去数スプリントの==平均==から将来の見積もり',
          '__注意__: チーム固有の値であり、==チーム間比較は無意味==',
          '==バーンダウンチャート==（Burndown Chart）: ==残作業==を時間軸でプロット',
          '　縦軸: 残りストーリーポイント（または時間）、横軸: スプリント日数',
          '　右下がりが理想。水平 → 進捗停滞、右上 → 増加（要警戒）',
          '==バーンアップチャート==（Burnup Chart）: ==完了量==と==スコープ==を時間軸でプロット',
          '　バーンダウンより==スコープ変更==が見えやすい',
          '__予測線__: ベロシティから==完了時期予測==',
          '試験頻出: バーンダウンの読み取り（残作業ベース）／バーンアップとの違い',
        ],
      },
      // ── E. その他のアジャイル手法 ──
      {
        heading: '23. カンバン',
        items: [
          '==カンバン==（Kanban）: ==トヨタ生産方式==由来のプル方式生産制御',
          '__基本要素__:',
          '　==プル方式==（Pull System）: 後工程が引っ張る。==WIP制限==で過剰生産を防ぐ',
          '　==WIP制限==（Work In Progress Limit）: 各段階で同時進行可能な作業数を制限',
          '　==バリューストリーム==の可視化（==カンバンボード==）',
          '　==カイゼン==（Kaizen）: ボトルネック発見と継続的改善',
          '　==プルポリシー==・==サービスレベル合意==の明示',
          '__リトルの法則__: ==WIP = スループット × リードタイム==',
          '　WIPを下げるとリードタイムが下がる',
          '__スクラムとの違い__: タイムボックスなし・役割固定なし・継続フロー',
          '__スクラムバン__（Scrumban）: スクラムにカンバン要素を取り入れたハイブリッド',
        ],
        navyItems: [[{ text: '出典: David J. Anderson「カンバン仕事術」／アジャイル実務ガイド §A3.3', style: 'navy' }]],
      },
      {
        heading: '24. XP（Extreme Programming）',
        items: [
          '==XP==（Extreme Programming）: 1996年 Kent Beck らが提唱。==技術プラクティス==重視のアジャイル手法',
          '__主要プラクティス__:',
          '　==ペアプログラミング==（Pair Programming）: 2人で1台のPC、コードの==共同所有==',
          '　==TDD==（Test-Driven Development）: ==テストファースト==。Red→Green→Refactor サイクル',
          '　==リファクタリング==: 動作を変えずコード構造を改善',
          '　==継続的インテグレーション==（CI）: 頻繁な統合・自動テスト',
          '　==シンプル設計==（KISS／YAGNI: You Aren\'t Gonna Need It）',
          '　==オンサイト顧客==（On-site Customer）: 顧客がチームに常駐',
          '　==短いリリースサイクル==',
          '　==計画ゲーム==（Planning Game）: 顧客と開発者の協働見積もり',
          '__コアバリュー__: ==コミュニケーション==／==シンプルさ==／==フィードバック==／==勇気==／==尊敬==',
        ],
      },
      {
        heading: '25. その他のアジャイル手法',
        items: [
          '__DSDM__（Dynamic Systems Development Method）: 1994年, 英国発',
          '　特徴: ==タイムボックス==・==MoSCoW==（Must/Should/Could/Won\'t have）優先順位付け',
          '__Crystal__（Alistair Cockburn）: ==チーム規模==と==重要度==に応じた手法ファミリー（Clear/Yellow/Orange/Red）',
          '__FDD__（Feature-Driven Development）: ==フィーチャー==単位の開発',
          '　5プロセス: 全体モデル開発／フィーチャーリスト作成／フィーチャーごとの計画／設計／構築',
          '__Lean Software Development__（リーン・ソフトウェア開発）: トヨタ生産方式のソフトウェア応用',
          '　7原則: ==ムダ排除==／==学習増幅==／==決定遅延==／==早期提供==／==チームエンパワーメント==／==統合性==／==全体最適化==',
          '__Disciplined Agile__（DA）: PMIが買収したアジャイルフレームワーク。プロセス選択肢を体系化',
        ],
      },
      {
        heading: '26. スケーリングフレームワーク',
        items: [
          '__スケーリング__: 複数チーム・大規模組織でのアジャイル適用',
          '__代表的フレームワーク__:',
          '　==SAFe==（Scaled Agile Framework）: 最も採用率が高い。レベル別構成（Essential/Large Solution/Portfolio/Full）',
          '　==LeSS==（Large-Scale Scrum）: スクラムをそのまま大規模化（最大8チーム / LeSS Huge は8チーム超）',
          '　==Nexus==（Ken Schwaber）: 3-9チームのスクラム統合フレームワーク',
          '　==Scrum@Scale==（Jeff Sutherland）: スクラム・オブ・スクラムを発展',
          '　==DAD==（Disciplined Agile Delivery）: プロセス選択肢の体系化',
          '__共通の課題__: 複数チーム==調整==／==依存関係==／==共有バックログ==／==リリース同期==／==アーキテクチャ整合==',
          '__規模拡大の代償__: アジリティが==低下==しやすい（コミュニケーションコスト増）',
        ],
        navyItems: [[{ text: '試験頻出度: SAFe > LeSS > Nexus > Scrum@Scale の順。SAFe の用語（PI/ART/Train）が出題されることあり', style: 'navy' }]],
      },
      // ── F. ハイブリッド型と契約・周辺概念 ──
      {
        heading: '27. ハイブリッド・アプローチの設計',
        items: [
          '==ハイブリッド==: 予測型と適応型を==組み合わせ==て使う',
          '__組合せのパターン__:',
          '　==フェーズ別==: 要件・基本設計は予測型、開発は適応型',
          '　==成果物別==: ハードウェアは予測型、ソフトウェアは適応型',
          '　==組織別==: 一部チームのみ適応型から開始',
          '　==段階移行==: 予測型から徐々にアジャイル要素を導入',
          '__代表例__:',
          '　==ウォーターフォール＋スクラム==: 上流は予測型、開発フェーズは2週スプリント',
          '　==アジャイル＋ステージゲート==: スプリント単位だがフェーズ間に予測型ゲート',
          '__選択理由__: 規制・契約・組織制約で完全アジャイル化が困難なケース',
          '実態として==多くの企業==がハイブリッド型を採用（純粋アジャイルは少数派）',
        ],
      },
      {
        heading: '28. 段階的詳細化とローリングウェーブ計画',
        items: [
          '==段階的詳細化==（Progressive Elaboration）: 計画を==段階的に詳細化==する手法',
          '　PMBOK第6版 §1.2.3 で定義',
          '　不確実な情報が==確定するに従い==計画を精緻化',
          '==ローリングウェーブ計画==（Rolling Wave Planning）: 段階的詳細化の実践形',
          '　==近期==は詳細に、==遠期==は粗くプランする',
          '　例: 直近スプリントは時間単位、3ヶ月後はストーリー単位、1年後はテーマ単位',
          '__適応型でのバックログ__: プロダクトバックログ自体が==段階的詳細化==の典型',
          '　==リファインメント==（Backlog Refinement）: 上位項目を段階的に詳細化',
          '予測型でも適応型でも適用可能な==計画技法==',
        ],
      },
      {
        heading: '29. アジャイル契約',
        items: [
          '__契約形態の選択肢__:',
          '　==時間と材料==（T&M, Time & Materials）: 工数ベース。アジャイルと最も相性が良い',
          '　==固定価格==（Fixed Price）: スコープ固定で総額固定。アジャイルと相性悪い',
          '　==増分契約==（Incremental Contract）: スプリント単位等で契約更新',
          '　==キャップド T&M==: 上限付き工数契約',
          '　==価値ベース契約==: 成果価値に応じた報酬',
          '__変更対応条項__: ==トレード可能==（同等規模の機能と交換）',
          '__課題__: 日本の発注慣行（請負契約・固定価格）と相性悪い',
          '__対策__: ==準委任契約==で柔軟性確保／==小さな単位での契約更新==',
        ],
        navyItems: [[{ text: '経済産業省「DXレポート」「情報システム・モデル取引・契約書」がアジャイル契約のガイドを提供', style: 'navy' }]],
      },
      {
        heading: '30. DevOps・CI/CD と継続的デリバリー',
        items: [
          '==DevOps==: 開発（Dev）と運用（Ops）の==組織・プロセス統合==',
          '　目的: ==リードタイム短縮==／==デプロイ頻度向上==／==失敗率低減==／==復旧時間短縮==',
          '　==CALMS==: Culture / Automation / Lean / Measurement / Sharing',
          '==CI==（Continuous Integration, 継続的インテグレーション）: 頻繁な統合・自動テスト',
          '　XP のプラクティス起源',
          '==CD==:',
          '　==Continuous Delivery==（継続的デリバリー）: 本番リリース==可能な状態==を常に維持',
          '　==Continuous Deployment==（継続的デプロイメント）: 本番に==自動デプロイ==',
          '==DevSecOps==: セキュリティをDevOpsに統合（==Shift Left==アプローチ）',
          'アジャイルが「==作り方==」、DevOpsが「==届け方==」の革新',
        ],
        navyItems: [[{ text: '出典: Forsgren et al.「Accelerate」DORA Metrics（4キーメトリクス）', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '31. 過去問頻出論点（午前II）',
        items: [
          '__アジャイルマニフェスト__: ==4価値==の右辺・左辺対比／別文言への差し替えひっかけ',
          '__INVEST__: 6要素（Independent/Negotiable/Valuable/Estimable/Small/Testable）と==Valuable==の主体',
          '__スクラム役割__: PO（==何を==）／SM（==どう==）／開発者の責任範囲',
          '__スクラムイベント__: 5イベントの==名前==・==順序==・==タイムボックス==',
          '__スクラム成果物__: プロダクトバックログ／スプリントバックログ／インクリメント／DoD',
          '__バーンダウン__: 残作業ベースの読み取り／バーンアップとの違い',
          '__カンバン__: ==WIP制限==／==リトルの法則==／==プル方式==',
          '__XP__: ペアプロ／TDD／リファクタリング／オンサイト顧客',
          '__予測型 vs 適応型__: 選定基準・適する条件',
          '__段階的詳細化__／==ローリングウェーブ計画==',
        ],
      },
      {
        heading: '32. ひっかけパターン',
        items: [
          '__PO vs SM__: PO は==何を==作るか（プロダクト責任）、SM は==どう==作るか（プロセス支援）',
          '__スクラムイベント順序__: 計画→デイリー→レビュー→レトロスペクティブ（レビューとレトロの逆転に注意）',
          '__タイムボックス__: スプリント最大1ヶ月／デイリー15分／計画8h／レビュー4h／レトロ3h',
          '__アジャイル宣言__: 右辺と左辺の入れ替え／別文言への改変（R6秋期 問17 事例）',
          '__INVEST__: ==Valuable==の主体は==顧客/ユーザ==（開発者ではない）',
          '__反復型 vs 漸進型__: 反復は洗練、漸進は積み上げ。アジャイルは両方',
          '__カンバン vs スクラム__: カンバンはタイムボックスなし／役割固定なし',
          '__予測型 vs 適応型__: 規制厳格・固定価格は予測型、不確実性高・フィードバック要は適応型',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==。試験は両版混在',
          '__DevOps vs アジャイル__: DevOps は「==届け方==」、アジャイルは「==作り方==」',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋アジャイル実務ガイドを統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==アジャイルマニフェスト==の4価値は右辺・左辺を完全に暗記。R6秋期 問17 のような改変パターンを見抜けるレベルまで。',
      '【スクラム】役割（PO/SM/開発者）／5イベント／3成果物／DoD を一覧で暗記。タイムボックスも数字で覚える。',
      '【INVEST】6要素を頭文字で暗記。==Valuable== の主体は==顧客==（開発者ではない、ひっかけ多発）。',
      '【カンバン】==WIP制限==／==プル方式==／==リトルの法則==（WIP=スループット×リードタイム）。',
      '【XP】ペアプロ／TDD／リファクタリング／オンサイト顧客／継続的インテグレーション。',
      '【予測型vs適応型】選定基準（要件安定性／不確実性／フィードバック頻度／規制／チーム経験）。',
      '【V字モデル】開発工程と対応するテスト工程の関係（要件↔システムテスト 等）。',
      '【スケーリング】SAFe / LeSS / Nexus / Scrum@Scale。SAFe が試験頻度最高。',
      '【ハイブリッド】完全アジャイル化が困難な場合の現実解。多くの企業が採用。',
      '【PMBOK版差分】本ノートは第6版（アジャイル実務ガイド含む）＋第7版を統合。第6版は「ガイド」、第7版は「パフォーマンス領域」。',
    ],
  },

  // ───────────────────────────────────────────
  // 4. 計画（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  planning: {
    summary:
      'プロジェクトの==スコープ==・==スケジュール==・==コスト==・リスクを==計画==する活動領域。PMBOK第6版では第5/6/7章の3知識エリアで詳細化、第7版では「==計画==」パフォーマンス領域として統合的に扱う。==WBS==・==クリティカルパス法==・==3点見積もり==・==EVM 基礎==が試験頻出。',
    sections: [
      // ── A. 計画領域概観 ──
      {
        heading: '1. 計画パフォーマンス領域の目的と概観',
        items: [
          'PMBOK第7版「==計画==」パフォーマンス領域は、==スコープ／スケジュール／コスト==等を==十分かつ協調的に==組織化する活動を扱う',
          '__成果__:',
          '　==プロジェクト目標==に対する==進捗の組織化==・整合化・連携',
          '　==価値創出==を実現するアプローチの選定',
          '　==ステークホルダー期待==への対応',
          'PMBOK第6版では3つの==知識エリア==で詳細化:',
          '　==第5章 スコープマネジメント==（6プロセス）',
          '　==第6章 スケジュールマネジメント==（6プロセス）',
          '　==第7章 コストマネジメント==（4プロセス）',
          '__計画は反復的__: 進行に伴い段階的に詳細化（==progressive elaboration==）',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「計画」パフォーマンス領域 / PMBOK第6版 第5/6/7章', style: 'navy' }]],
      },
      {
        heading: '2. プロジェクトマネジメント計画書とサブシディアリー計画書',
        items: [
          '==プロジェクトマネジメント計画書==（Project Management Plan）: プロジェクト全体の==実行・監視・終結==の基準を統合',
          '__サブシディアリー計画書__（subsidiary plans, 補助計画書）= 各知識エリアの計画書:',
          '　==スコープマネジメント計画書==',
          '　==要求事項マネジメント計画書==',
          '　==スケジュールマネジメント計画書==',
          '　==コストマネジメント計画書==',
          '　==品質マネジメント計画書==',
          '　==資源マネジメント計画書==',
          '　==コミュニケーション・マネジメント計画書==',
          '　==リスク・マネジメント計画書==',
          '　==調達マネジメント計画書==',
          '　==ステークホルダー・エンゲージメント計画書==',
          '__ベースライン__: ==スコープ==／==スケジュール==／==コスト==の3つ（変更管理の基準）',
          '計画書は==生きた文書==で、変更承認とともに更新',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §4.2 プロジェクトマネジメント計画書の作成', style: 'navy' }]],
      },
      {
        heading: '3. 計画のテーラリング',
        items: [
          '==テーラリング==（Tailoring）: プロジェクト特性に応じて==プロセス／手法／成果物==を==調整==',
          '__判断軸__:',
          '　==規模==: 大規模 → 詳細計画／小規模 → 軽量計画',
          '　==複雑性==: 複雑 → 詳細／単純 → 簡素',
          '　==リスクレベル==: 高 → 詳細リスク計画／低 → 標準対応',
          '　==組織成熟度==: 高 → カスタマイズ／低 → 標準テンプレート',
          '　==規制環境==: 厳格 → フル文書化',
          '__7原則__（PMBOK7）でテーラリングが==積極的==に推奨される',
          '「==計画書のための計画==」を避ける（オーバーエンジニアリング禁止）',
        ],
      },
      {
        heading: '4. アジャイル計画（リリース計画・イテレーション計画）',
        items: [
          '__アジャイル計画の階層__（==ローリングウェーブ計画==の典型）:',
          '　==プロダクトビジョン==: 製品の方向性',
          '　==プロダクトロードマップ==: 数四半期〜数年の見通し',
          '　==リリース計画==: 数スプリント〜数ヶ月の中期計画',
          '　==イテレーション計画==（スプリント計画）: 1〜4週の詳細計画',
          '　==デイリープラン==（==デイリースクラム==）: 24時間単位',
          '__段階的詳細化__: 近期は詳細、遠期は粗',
          '__計画ポーカー__（Planning Poker）: チームで==ストーリーポイント==を相対見積もり',
          '__プランニング・オニオン__: 階層を玉ねぎ状に図示',
        ],
        navyItems: [[{ text: '出典: アジャイル実務ガイド §3 / Scrum Guide', style: 'navy' }]],
      },
      // ── B. スコープマネジメント（PMBOK6 第5章） ──
      {
        heading: '5. 5.1 スコープマネジメント計画',
        items: [
          '==5.1 スコープマネジメント計画==（Plan Scope Management, 計画プロセス群）',
          '__目的__: スコープの==計画／妥当性確認／コントロール==方法を文書化',
          '__主要アウトプット__:',
          '　==スコープマネジメント計画書==: 詳細スコープの作成方法・WBS 作成方法・受入基準',
          '　==要求事項マネジメント計画書==: 要求事項の==識別・分析・追跡==方法',
          '__インプット__: プロジェクト憲章／PM 計画書／EEFs・OPAs',
          '__技法__: 専門家の判断／データ分析／会議',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §5.1', style: 'navy' }]],
      },
      {
        heading: '6. 5.2 要求事項収集',
        items: [
          '==5.2 要求事項収集==（Collect Requirements, 計画プロセス群）',
          '__目的__: ステークホルダーのニーズを==識別・文書化・管理==',
          '__主要技法__:',
          '　==インタビュー==／==フォーカスグループ==／==ワークショップ==',
          '　==アンケート==／==観察==／==プロトタイピング==',
          '　==ベンチマーキング==／==コンテキスト・ダイアグラム==',
          '　==ブレーンストーミング==／==親和図==／==マインドマップ==',
          '　==投票==／==独裁==／==多基準意思決定分析==（意思決定技法）',
          '__主要アウトプット__:',
          '　==要求事項文書==（業務／ステークホルダー／ソリューション／品質／プロジェクトの5分類）',
          '　==要求事項トレーサビリティ・マトリクス==（RTM）: 要求の出自・優先度・実装・テストを追跡',
        ],
        navyItems: [[{ text: 'RTM は午前II・午後I 双方で頻出。「要求 → 設計 → 実装 → テスト」の追跡が機能', style: 'navy' }]],
      },
      {
        heading: '7. 5.3 スコープ定義',
        items: [
          '==5.3 スコープ定義==（Define Scope, 計画プロセス群）',
          '__目的__: ==プロジェクト・スコープ記述書==の作成（プロジェクトと製品の==境界==を確定）',
          '__主要技法__: 専門家の判断／==プロダクト分析==／==代替案分析==／==ファシリテーション==',
          '__主要アウトプット__ — ==プロジェクト・スコープ記述書==の構成要素:',
          '　==製品スコープ記述==（特徴・機能）',
          '　==成果物==（deliverables）',
          '　==受入基準==（acceptance criteria）',
          '　==プロジェクトからの除外事項==（exclusions）',
          '　==前提条件と制約条件==（assumptions and constraints）',
          '__スコープ・クリープ__（scope creep）: ==未承認==の機能追加。記述書で防止',
        ],
      },
      {
        heading: '8. 5.4 WBS作成（作業分解構成図）',
        items: [
          '==5.4 WBS作成==（Create WBS, 計画プロセス群）',
          '==WBS==（Work Breakdown Structure）: プロジェクト全体を==成果物指向==で階層分解した図',
          '__最下位の要素__ = ==ワークパッケージ==（Work Package）',
          '__作成技法__: ==分解==（decomposition）、専門家の判断',
          '__分解の指針__:',
          '　==成果物指向==（フェーズや作業順序ではない）',
          '　==MECE==（漏れなく重複なく）',
          '　==適切な粒度==（==8/80ルール==: 8〜80時間でできるレベル）',
          '__100%ルール__: WBSはプロジェクト==全スコープ==を==過不足なく==表す',
          '__主要アウトプット__: ==スコープ・ベースライン==（プロジェクト・スコープ記述書＋WBS＋WBS辞書）',
          '__WBS辞書__: 各WBS要素の==詳細記述==（作業内容・責任者・期間・コスト）',
        ],
        navyItems: [[{ text: 'WBS は午前II 最頻出キーワード。8/80ルール・100%ルール・成果物指向は必須暗記', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'WBS: 成果物指向でプロジェクト全スコープを階層分解する',
            ariaLabel: 'プロジェクトからフェーズ、主要成果物、ワークパッケージへ分解するWBS階層図',
            viewBox: '0 0 680 430',
            content: `
              <defs>
                <marker id="wbs-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="644" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <rect x="230" y="42" width="220" height="48" rx="8" fill="#9d5b8b" stroke="#6b3b61" stroke-width="2" />
              <text x="340" y="72" fill="white" font-size="16" font-weight="700" text-anchor="middle">プロジェクト</text>
              <line x1="340" y1="90" x2="340" y2="118" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <rect x="80" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <rect x="260" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <rect x="440" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="160" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ1</text>
              <text x="340" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ2</text>
              <text x="520" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ3</text>
              <path d="M340 104 L340 112 M160 112 L520 112 M160 112 L160 120 M340 112 L340 120 M520 112 L520 120" fill="none" stroke="#64748b" stroke-width="2" />
              <line x1="160" y1="168" x2="160" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <line x1="340" y1="168" x2="340" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <line x1="520" y1="168" x2="520" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <rect x="68" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <rect x="248" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <rect x="428" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="160" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="160" y="246" fill="#1e293b" font-size="12" text-anchor="middle">成果物指向</text>
              <text x="340" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="340" y="246" fill="#1e293b" font-size="12" text-anchor="middle">MECE</text>
              <text x="520" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="520" y="246" fill="#1e293b" font-size="12" text-anchor="middle">100%ルール</text>
              <path d="M340 260 L340 286 M160 286 L520 286 M160 286 L160 302 M340 286 L340 302 M520 286 L520 302" fill="none" stroke="#64748b" stroke-width="2" />
              <rect x="72" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="252" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="432" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="160" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="160" y="346" fill="#1e293b" font-size="12" text-anchor="middle">最下位要素</text>
              <text x="340" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="340" y="346" fill="#1e293b" font-size="12" text-anchor="middle">8〜80時間目安</text>
              <text x="520" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="520" y="346" fill="#1e293b" font-size="12" text-anchor="middle">WBS辞書で詳細化</text>
              <text x="340" y="392" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">上位から下位へ「何を作るか」を分解し、作業順序は別途アクティビティで扱う</text>
            `,
          },
        ],
      },
      {
        heading: '9. WBS構成要素とコントロール・アカウント',
        items: [
          '__WBS の階層構造__（上位 → 下位）:',
          '　==プロジェクト==（レベル0）',
          '　==フェーズ== / ==主要成果物==（レベル1）',
          '　==中間成果物==（レベル2〜N-1）',
          '　==ワークパッケージ==（最下位）',
          '__コントロール・アカウント__（Control Account, CA）: スコープ・コスト・スケジュールを統合==管理する単位==',
          '__プランニング・パッケージ__（Planning Package）: 計画詳細化前の==仮置き==単位',
          '__ワークパッケージ__は==アクティビティ==（§12 で扱う）に分解される',
          '__コードオブアカウント__（Code of Accounts）: WBS 要素の==識別番号==',
          '試験頻出: WBS要素・コントロール・アカウント・ワークパッケージ・アクティビティの==階層関係==',
        ],
      },
      {
        heading: '10. 5.5 スコープ妥当性確認 / 5.6 スコープコントロール',
        items: [
          '==5.5 スコープ妥当性確認==（Validate Scope, 監視・コントロールプロセス群）',
          '__目的__: 完成した成果物を==顧客／スポンサー==が==正式受入==',
          '__技法__: ==検査==／意思決定（==投票==等）',
          '__アウトプット__: ==受入された成果物==／変更要求／作業パフォーマンス情報',
          '__妥当性確認__（顧客視点の Validation） vs ==品質コントロール==（プロセス視点の Verification）の違いに注意',
          '==5.6 スコープコントロール==（Control Scope, 監視・コントロールプロセス群）',
          '__目的__: スコープの==状態を監視==し、ベースライン変更を管理',
          '__技法__: ==データ分析==（差異分析・傾向分析）',
          '__アウトプット__: ==作業パフォーマンス情報==／変更要求／計画書/スコープ・ベースラインの更新',
          '__スコープ・クリープ__は本プロセスで==検出==・是正',
        ],
      },
      // ── C. スケジュールマネジメント（PMBOK6 第6章） ──
      {
        heading: '11. 6.1 スケジュールマネジメント計画',
        items: [
          '==6.1 スケジュールマネジメント計画==（Plan Schedule Management, 計画プロセス群）',
          '__主要アウトプット__: ==スケジュールマネジメント計画書==',
          '　単位（時間・日・週）、精度、測定単位、プロセスリンク',
          '　組織のプロセス資産との連携、ベースライン更新ルール',
          '　パフォーマンス測定ルール（==EVM==の使用方針等）',
          'スケジュール作成のための==方法論==・==ツール==の選定を含む',
        ],
      },
      {
        heading: '12. 6.2 アクティビティ定義',
        items: [
          '==6.2 アクティビティ定義==（Define Activities, 計画プロセス群）',
          '__目的__: WBS のワークパッケージを==アクティビティ==に分解',
          '__技法__: ==分解==／==ローリングウェーブ計画==／専門家の判断／会議',
          '__主要アウトプット__:',
          '　==アクティビティ・リスト==（全アクティビティの一覧）',
          '　==アクティビティ属性==（識別・進行記述・先行アクティビティ・リソース）',
          '　==マイルストーン・リスト==（重要な時点・期限点）',
          '__マイルストーン__は==所要時間 0==、==成果物・イベント==を表す',
        ],
      },
      {
        heading: '13. 6.3 アクティビティ順序設定',
        items: [
          '==6.3 アクティビティ順序設定==（Sequence Activities, 計画プロセス群）',
          '__目的__: アクティビティ間の==論理的依存関係==を確立',
          '__依存関係の4種類__（==PDM==: Precedence Diagramming Method）:',
          '　==FS==（Finish-to-Start）: 前作業==完了==後に後作業==開始==（==最も一般的==）',
          '　==FF==（Finish-to-Finish）: 前作業完了後に後作業完了',
          '　==SS==（Start-to-Start）: 前作業開始後に後作業開始',
          '　==SF==（Start-to-Finish）: 前作業開始後に後作業完了（==最も稀==）',
          '__依存関係の種類別__:',
          '　==強制依存==（mandatory）: 物理的・契約的に必須',
          '　==任意依存==（discretionary）: ベストプラクティス・選好',
          '　==外部依存==（external）: プロジェクト外部要因',
          '　==内部依存==（internal）: プロジェクト内部要因',
          '__リード__（前倒し）／==ラグ==（遅延）: 依存関係に==時間調整==を加える',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §6.3。試験頻出: 4依存関係（特にFSとSF）の例示問題', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'PDMの4依存関係: FSが最頻出、SFは最も稀',
            ariaLabel: 'PDMのFS FF SS SFの4種類の依存関係を示す図',
            viewBox: '0 0 680 520',
            content: `
              <defs>
                <marker id="pdm-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#475569" />
                </marker>
              </defs>
              <rect x="18" y="18" width="644" height="484" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <text x="340" y="46" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">Precedence Diagramming Method</text>
              <g transform="translate(42 74)">
                <rect x="0" y="0" width="596" height="84" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="20" y="32" fill="#dc2626" font-size="17" font-weight="700">FS</text>
                <text x="20" y="54" fill="#475569" font-size="12">Finish-to-Start</text>
                <rect x="180" y="20" width="120" height="44" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
                <rect x="390" y="20" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                <text x="240" y="47" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">A 完了</text>
                <text x="450" y="47" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">B 開始</text>
                <line x1="300" y1="42" x2="388" y2="42" stroke="#475569" stroke-width="3" marker-end="url(#pdm-arrow)" />
                <text x="344" y="30" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">最も一般的</text>
              </g>
              <g transform="translate(42 174)">
                <rect x="0" y="0" width="596" height="84" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="20" y="32" fill="#7c3aed" font-size="17" font-weight="700">FF</text>
                <text x="20" y="54" fill="#475569" font-size="12">Finish-to-Finish</text>
                <rect x="180" y="14" width="120" height="44" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
                <rect x="390" y="24" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                <text x="240" y="41" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">A 完了</text>
                <text x="450" y="51" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">B 完了</text>
                <path d="M300 36 C340 36 350 46 388 46" fill="none" stroke="#475569" stroke-width="3" marker-end="url(#pdm-arrow)" />
                <text x="344" y="70" fill="#475569" font-size="12" text-anchor="middle">前作業完了後に後作業完了</text>
              </g>
              <g transform="translate(42 274)">
                <rect x="0" y="0" width="596" height="84" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="20" y="32" fill="#16a34a" font-size="17" font-weight="700">SS</text>
                <text x="20" y="54" fill="#475569" font-size="12">Start-to-Start</text>
                <rect x="180" y="24" width="120" height="44" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
                <rect x="390" y="14" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                <text x="240" y="51" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">A 開始</text>
                <text x="450" y="41" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">B 開始</text>
                <path d="M300 46 C340 46 350 36 388 36" fill="none" stroke="#475569" stroke-width="3" marker-end="url(#pdm-arrow)" />
                <text x="344" y="72" fill="#475569" font-size="12" text-anchor="middle">開始を連動させる</text>
              </g>
              <g transform="translate(42 374)">
                <rect x="0" y="0" width="596" height="84" rx="8" fill="#ffffff" stroke="#cbd5e1" />
                <text x="20" y="32" fill="#f59e0b" font-size="17" font-weight="700">SF</text>
                <text x="20" y="54" fill="#475569" font-size="12">Start-to-Finish</text>
                <rect x="180" y="14" width="120" height="44" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
                <rect x="390" y="24" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                <text x="240" y="41" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">A 開始</text>
                <text x="450" y="51" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">B 完了</text>
                <path d="M300 36 C340 36 350 46 388 46" fill="none" stroke="#475569" stroke-width="3" marker-end="url(#pdm-arrow)" />
                <text x="344" y="72" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">最も稀</text>
              </g>
            `,
          },
        ],
      },
      {
        heading: '14. ネットワーク図（AON / AOA）',
        items: [
          '__AON__（Activity-On-Node, アクティビティ・オン・ノード）: ノード=アクティビティ、矢印=依存関係',
          '　==PDM==がこの形式（PMBOK第6版の標準）',
          '　ノードに==所要時間==・==早期/最遅==開始/完了を記載',
          '__AOA__（Activity-On-Arrow, アクティビティ・オン・アロー）: 矢印=アクティビティ、ノード=イベント',
          '　==ADM==（Arrow Diagramming Method）／==PERT図==がこの形式',
          '　現在ではあまり使われない（PMBOK第6版以降は非主流）',
          '__ダミー作業__（dummy activity）: AOAで論理関係を表現するための==所要時間0==の仮想作業',
          '__早期開始__（ES, Early Start）／==早期完了==（EF）／==最遅開始==（LS）／==最遅完了==（LF）',
          '__フォワードパス__（前進計算）: ES と EF を求める',
          '__バックワードパス__（後進計算）: LS と LF を求める',
        ],
      },
      {
        heading: '15. 6.4 アクティビティ所要時間見積もり',
        items: [
          '==6.4 アクティビティ所要時間見積もり==（Estimate Activity Durations, 計画プロセス群）',
          '__主要技法__:',
          '　==類推見積もり==（Analogous）: 過去の類似プロジェクトから==トップダウン==',
          '　　長所: 早い・安い／短所: 精度が低い',
          '　==パラメトリック見積もり==（Parametric）: ==単価×数量==等の統計的関係',
          '　　例: 1人月で 1000 行のコード → 5000 行は 5人月',
          '　==3点見積もり==（Three-Point）: ==楽観値(O)==・==悲観値(P)==・==最確値(M)==',
          '　　==三角分布==: (O+M+P)/3',
          '　　==ベータ分布==（==PERT==）: (O+4M+P)/6 （重み付き）',
          '　==ボトムアップ見積もり==（Bottom-Up）: WBS各要素を積み上げ。==最も精度高==',
          '　==データ分析==／==意思決定==／==会議==',
          '__予備期間__: ==コンティンジェンシー予備==（既知のリスク）／==マネジメント予備==（未知のリスク）',
          '試験頻出: ==PERT==の重み付き計算式と==標準偏差==σ = (P-O)/6',
        ],
        navyItems: [[{ text: 'PERT 期待値 (O+4M+P)/6 と σ = (P-O)/6 は午前II 必須暗記', style: 'navy' }]],
      },
      {
        heading: '16. 6.5 スケジュール作成（クリティカルパス法 CPM）',
        items: [
          '==6.5 スケジュール作成==（Develop Schedule, 計画プロセス群）',
          '==クリティカルパス法==（CPM, Critical Path Method）: ==最長==の経路を==クリティカルパス==とし、プロジェクト==最短期間==を算出',
          '__クリティカルパス特性__:',
          '　==トータルフロート==（TF, Total Float）= 0',
          '　==フリーフロート==（FF, Free Float）= 後続アクティビティの ES を遅らせない余裕',
          '　クリティカルパス上のアクティビティ遅延は==プロジェクト全体の遅延==',
          '__フロート計算__:',
          '　TF = LS - ES = LF - EF',
          '　FF = 後続アクティビティの ES - 当アクティビティの EF',
          '__クリティカルチェーン法__（CCM, Critical Chain Method）: ==資源制約==を考慮した CPM 拡張',
          '　==フィーディングバッファ==／==プロジェクトバッファ==で保護',
          '__資源最適化技法__: ==資源平準化==（Resource Leveling）／==資源平滑化==（Resource Smoothing）',
        ],
        navyItems: [[{ text: 'CPM・トータルフロート計算は午前II/午後I 双方で必出', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'CPM: 最長経路がクリティカルパス、遅延は全体遅延になる',
            ariaLabel: '6ノードのネットワーク図でクリティカルパスを赤線で示す図',
            viewBox: '0 0 700 430',
            content: `
              <defs>
                <marker id="cpm-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
                <marker id="cpm-red-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#dc2626" />
                </marker>
              </defs>
              <rect x="18" y="18" width="664" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="46" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">小規模ネットワーク例</text>
              <path d="M92 216 L178 132 L312 132 L468 132 L600 216" fill="none" stroke="#dc2626" stroke-width="5" marker-end="url(#cpm-red-arrow)" />
              <path d="M92 216 L184 288 L338 288 L600 216" fill="none" stroke="#64748b" stroke-width="3" marker-end="url(#cpm-arrow)" />
              <path d="M236 132 L338 288" fill="none" stroke="#64748b" stroke-width="3" marker-end="url(#cpm-arrow)" />
              <g>
                <circle cx="80" cy="216" r="34" fill="#ffffff" stroke="#475569" stroke-width="2" />
                <text x="80" y="211" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">Start</text>
                <text x="80" y="228" fill="#64748b" font-size="11" text-anchor="middle">0日</text>
              </g>
              <g>
                <circle cx="210" cy="132" r="38" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
                <text x="210" y="128" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">A</text>
                <text x="210" y="146" fill="#1e293b" font-size="12" text-anchor="middle">3日 / TF0</text>
              </g>
              <g>
                <circle cx="350" cy="132" r="38" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
                <text x="350" y="128" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">B</text>
                <text x="350" y="146" fill="#1e293b" font-size="12" text-anchor="middle">4日 / TF0</text>
              </g>
              <g>
                <circle cx="500" cy="132" r="38" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
                <text x="500" y="128" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">D</text>
                <text x="500" y="146" fill="#1e293b" font-size="12" text-anchor="middle">5日 / TF0</text>
              </g>
              <g>
                <circle cx="210" cy="288" r="38" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                <text x="210" y="284" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">C</text>
                <text x="210" y="302" fill="#1e293b" font-size="12" text-anchor="middle">2日</text>
              </g>
              <g>
                <circle cx="360" cy="288" r="38" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
                <text x="360" y="284" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">E</text>
                <text x="360" y="302" fill="#1e293b" font-size="12" text-anchor="middle">3日</text>
              </g>
              <g>
                <circle cx="620" cy="216" r="34" fill="#ffffff" stroke="#475569" stroke-width="2" />
                <text x="620" y="211" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">End</text>
                <text x="620" y="228" fill="#64748b" font-size="11" text-anchor="middle">12日</text>
              </g>
              <rect x="198" y="56" width="328" height="34" rx="8" fill="#fee2e2" stroke="#dc2626" />
              <text x="362" y="78" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">クリティカルパス: A → B → D = 12日</text>
              <text x="350" y="374" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">赤線上の作業はトータルフロート0。どれかが遅れると終了日も遅れる。</text>
            `,
          },
        ],
      },
      {
        heading: '17. スケジュール短縮（クラッシング・ファストトラッキング）',
        items: [
          '__スケジュール短縮の2手法__:',
          '　==クラッシング==（Crashing）: ==コスト追加==で工期短縮（残業・要員追加・外注等）',
          '　　長所: 期間短縮／短所: ==コスト増大==',
          '　==ファストトラッキング==（Fast Tracking）: 本来順次のアクティビティを==並列==実行',
          '　　長所: コスト増大なし／短所: ==リスク増大==（手戻り・品質低下）',
          '__選択基準__: ==コスト==重視ならファストトラッキング、==リスク==重視ならクラッシング',
          '__クラッシング・コスト・スロープ__: コスト増分／時間短縮分。小さい順に適用',
          '__注意__: クラッシングは==クリティカルパス==上のアクティビティが対象（非クリティカルにかけても効果なし）',
        ],
        navyItems: [[{ text: '試験頻出: クラッシングとファストトラッキングの使い分け基準の混同に注意', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'スケジュール短縮: クラッシングはコスト増、ファストトラッキングはリスク増',
            ariaLabel: 'クラッシングとファストトラッキングの違いを比較する図',
            viewBox: '0 0 700 430',
            content: `
              <rect x="18" y="18" width="664" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <rect x="42" y="52" width="292" height="318" rx="10" fill="#ffffff" stroke="#cbd5e1" />
              <rect x="366" y="52" width="292" height="318" rx="10" fill="#ffffff" stroke="#cbd5e1" />
              <text x="188" y="84" fill="#1e293b" font-size="17" font-weight="700" text-anchor="middle">クラッシング</text>
              <text x="512" y="84" fill="#1e293b" font-size="17" font-weight="700" text-anchor="middle">ファストトラッキング</text>
              <text x="188" y="108" fill="#475569" font-size="12" text-anchor="middle">追加資源で期間短縮</text>
              <text x="512" y="108" fill="#475569" font-size="12" text-anchor="middle">順次作業を並列化</text>
              <line x1="86" y1="154" x2="290" y2="154" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
              <line x1="86" y1="154" x2="290" y2="154" stroke="#64748b" stroke-width="20" stroke-linecap="round" />
              <text x="188" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">通常 10日</text>
              <line x1="86" y1="216" x2="244" y2="216" stroke="#dc2626" stroke-width="20" stroke-linecap="round" />
              <text x="165" y="222" fill="white" font-size="12" font-weight="700" text-anchor="middle">短縮 7日</text>
              <path d="M252 204 L286 188 L286 238 Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="282" y="218" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">￥+</text>
              <rect x="82" y="270" width="212" height="52" rx="8" fill="#fee2e2" stroke="#dc2626" />
              <text x="188" y="292" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">コスト増大</text>
              <text x="188" y="310" fill="#991b1b" font-size="12" text-anchor="middle">残業・要員追加・外注</text>
              <line x1="410" y1="154" x2="520" y2="154" stroke="#2563eb" stroke-width="20" stroke-linecap="round" />
              <line x1="532" y1="154" x2="620" y2="154" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />
              <text x="465" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">A</text>
              <text x="576" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">B</text>
              <text x="512" y="184" fill="#475569" font-size="12" text-anchor="middle">通常: A完了後にB開始</text>
              <line x1="410" y1="230" x2="548" y2="230" stroke="#2563eb" stroke-width="20" stroke-linecap="round" />
              <line x1="486" y1="256" x2="620" y2="256" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />
              <text x="479" y="236" fill="white" font-size="12" font-weight="700" text-anchor="middle">A</text>
              <text x="553" y="262" fill="white" font-size="12" font-weight="700" text-anchor="middle">B</text>
              <text x="512" y="296" fill="#475569" font-size="12" text-anchor="middle">短縮: 一部を重ねる</text>
              <rect x="406" y="318" width="212" height="34" rx="8" fill="#fef3c7" stroke="#f59e0b" />
              <text x="512" y="340" fill="#92400e" font-size="13" font-weight="700" text-anchor="middle">リスク増大・手戻り注意</text>
              <text x="350" y="396" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">どちらもクリティカルパス上の作業を短縮対象にするのが原則</text>
            `,
          },
        ],
      },
      {
        heading: '18. 6.6 スケジュールコントロール',
        items: [
          '==6.6 スケジュールコントロール==（Control Schedule, 監視・コントロールプロセス群）',
          '__目的__: ==スケジュール・ベースライン==に対する==進捗監視==と==変更管理==',
          '__技法__:',
          '　==データ分析==: ==EVM==／==アーンドスケジュール==／==トレンド分析==／==差異分析==',
          '　==クリティカルパス分析==',
          '　==プロジェクトマネジメント情報システム==（PMIS）',
          '　==スケジュール短縮==（必要時）',
          '__主要アウトプット__: 作業パフォーマンス情報／==スケジュール予測==／変更要求／計画書・スケジュール・ベースラインの更新',
        ],
      },
      // ── D. コストマネジメント（PMBOK6 第7章） ──
      {
        heading: '19. 7.1 コストマネジメント計画',
        items: [
          '==7.1 コストマネジメント計画==（Plan Cost Management, 計画プロセス群）',
          '__主要アウトプット__: ==コストマネジメント計画書==',
          '　==測定単位==（時間／金額の通貨）',
          '　==精度==（丸めルール）',
          '　==組織手続きとの連携==',
          '　==コントロール・スレッショルド==（差異の閾値）',
          '　==パフォーマンス測定ルール==（EVM 適用方針）',
          '　==報告フォーマット==',
        ],
      },
      {
        heading: '20. 7.2 コスト見積もり',
        items: [
          '==7.2 コスト見積もり==（Estimate Costs, 計画プロセス群）',
          '__見積もり技法__（スケジュール所要時間見積もりと同じ4技法）:',
          '　==類推見積もり==: 早い・安いが精度低',
          '　==パラメトリック見積もり==: 統計的関係に基づく',
          '　==ボトムアップ見積もり==: WBS各要素積み上げ・==最高精度==',
          '　==3点見積もり==: 不確実性反映',
          '__精度のクラス__（PMBOK6 §7.2.2.4）:',
          '　==ROM 見積もり==（Rough Order of Magnitude）: -25%〜+75%',
          '　==確定見積もり==（Definitive）: -5%〜+10%',
          '__予備分析__: コンティンジェンシー予備／マネジメント予備の見積もり',
          '__コスト・オブ・クオリティ__（COQ）: 品質コスト（適合コスト＋不適合コスト）も含む',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §7.2.2', style: 'navy' }]],
      },
      {
        heading: '21. 見積もり手法の比較と適用条件',
        items: [
          '__4技法の比較__:',
          '　==類推==: 過去類似プロジェクト, トップダウン, 早期・安価, 精度低（-50%〜+50% 程度）',
          '　==パラメトリック==: 単価×数量, 中速・中精度, 統計的関係要',
          '　==ボトムアップ==: WBS積み上げ, 遅い・高価, ==最高精度==',
          '　==3点==: O/M/P 推定, 不確実性表現, PERT/三角分布',
          '__プロジェクトフェーズ別__:',
          '　==立上げ==: 類推（情報不足）',
          '　==計画初期==: パラメトリック',
          '　==計画詳細==: ボトムアップ',
          '　==全フェーズ==: 3点（不確実性管理）',
          '__複数技法併用__が推奨（==トライアンギュレーション==）',
        ],
      },
      {
        heading: '22. 7.3 予算設定（コスト・ベースライン）',
        items: [
          '==7.3 予算設定==（Determine Budget, 計画プロセス群）',
          '__目的__: コスト見積もりを集約し==コスト・ベースライン==を作成',
          '__構成__（積層構造）:',
          '　==アクティビティ・コスト見積もり==（最小単位）',
          '　==コントロール・アカウント==単位の集計',
          '　==コンティンジェンシー予備==（既知リスク用、各見積もりに含む）',
          '　==コスト・ベースライン==（タイム・フェーズド予算、累積==Sカーブ==）',
          '　==マネジメント予備==（未知リスク用、ベースライン==外==）',
          '　==プロジェクト予算==（コスト・ベースライン＋マネジメント予備）',
          '__重要な区別__: ==コスト・ベースライン==は==マネジメント予備==を==含まない==',
          'マネジメント予備の使用には==正式な変更承認==が必要',
        ],
        navyItems: [[{ text: 'コスト・ベースライン vs プロジェクト予算 vs マネジメント予備の階層は午前II 頻出', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'コスト階層: コスト・ベースラインはマネジメント予備を含まない',
            ariaLabel: 'アクティビティ見積もりからコストベースラインとプロジェクト予算までの階層図',
            viewBox: '0 0 700 470',
            content: `
              <rect x="18" y="18" width="664" height="434" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="48" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">予算設定の積層構造</text>
              <rect x="150" y="334" width="400" height="46" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="350" y="362" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">アクティビティ・コスト見積もり</text>
              <rect x="150" y="282" width="400" height="46" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="350" y="310" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">コントロール・アカウント集計</text>
              <rect x="150" y="230" width="400" height="46" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="350" y="258" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">コンティンジェンシー予備（既知リスク）</text>
              <rect x="122" y="166" width="456" height="52" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
              <text x="350" y="188" fill="#991b1b" font-size="15" font-weight="700" text-anchor="middle">コスト・ベースライン</text>
              <text x="350" y="207" fill="#991b1b" font-size="12" font-weight="700" text-anchor="middle">ここまでが承認済みのタイムフェーズド予算</text>
              <rect x="122" y="104" width="456" height="46" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
              <text x="350" y="132" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">マネジメント予備（未知リスク・ベースライン外）</text>
              <rect x="94" y="70" width="512" height="326" rx="12" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="8 6" />
              <text x="610" y="88" fill="#475569" font-size="13" font-weight="700">プロジェクト予算</text>
              <path d="M582 108 L632 108 L632 380 L582 380" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M594 104 L612 108 L594 112" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M594 376 L612 380 L594 384" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M108 166 L78 166 L78 218 L108 218" fill="none" stroke="#dc2626" stroke-width="3" />
              <text x="72" y="188" fill="#991b1b" font-size="12" font-weight="700" text-anchor="end">ベースライン</text>
              <text x="72" y="206" fill="#991b1b" font-size="12" font-weight="700" text-anchor="end">管理対象</text>
              <text x="350" y="424" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">試験では「マネジメント予備はコスト・ベースラインに含まない」を最優先で確認する</text>
            `,
          },
        ],
      },
      {
        heading: '23. 7.4 コストコントロール',
        items: [
          '==7.4 コストコントロール==（Control Costs, 監視・コントロールプロセス群）',
          '__主要技法__: ==EVM==（Earned Value Management, アーンドバリュー法）',
          '　==計画値==（PV, Planned Value）／==出来高==（EV, Earned Value）／==実コスト==（AC, Actual Cost）',
          '　==コスト差異==（CV = EV - AC）／==スケジュール差異==（SV = EV - PV）',
          '　==コスト効率指数==（CPI = EV / AC）／==スケジュール効率指数==（SPI = EV / PV）',
          '　==EAC==（完成時総コスト予測）／==ETC==（完成までのコスト予測）',
          'EVM の==詳細==は ==measurement==カテゴリで別途扱う',
          '__予測技法__: ==TCPI==（To-Complete Performance Index）／==バリアンス分析==',
        ],
        navyItems: [[{ text: 'EVM 公式は measurement カテゴリで詳細扱い予定。本セクションは概観のみ', style: 'navy' }]],
      },
      {
        heading: '24. 経済性評価（NPV / ROI / IRR / 回収期間）',
        items: [
          '__プロジェクト選定の経済性評価指標__:',
          '　==NPV==（Net Present Value, 正味現在価値）: 将来キャッシュフローを==現在価値==に割り引いた合計',
          '　　==NPV > 0== なら採算ありと判定',
          '　==ROI==（Return on Investment, 投資収益率）= (利益 - 投資) / 投資',
          '　==IRR==（Internal Rate of Return, 内部収益率）: NPV = 0 となる==割引率==',
          '　　==IRR > 資本コスト== なら採算あり',
          '　==回収期間==（Payback Period）: 投資を回収するまでの期間',
          '　　==短いほど==良い（ただし回収後の利益を考慮しない欠点）',
          '　==損益分岐点分析==（Break-Even Analysis）',
          '__コスト・ベネフィット分析__（CBA）: 便益／コスト比',
          '__sunk cost__（埋没費用）: 既支出は==意思決定に含めない==',
          '試験頻出: NPV計算問題、IRR と資本コストの関係',
        ],
        navyItems: [[{ text: '午前II の経済性評価問題は計算式の理解で解ける。割引率と現在価値計算の式は暗記', style: 'navy' }]],
      },
      // ── E. リスク・調達計画 ──
      {
        heading: '25. リスク識別とリスク・ブレークダウン・ストラクチャー（RBS）',
        items: [
          '==11.1 リスクマネジメント計画==（Plan Risk Management, 計画プロセス群）',
          '==11.2 リスクの特定==（Identify Risks, 計画プロセス群）',
          '__識別技法__:',
          '　==専門家の判断==／==データ収集==（ブレーンストーミング・チェックリスト・インタビュー）',
          '　==データ分析==（==根本原因分析==・前提条件分析・==SWOT==・文書分析）',
          '　==対人スキル==（ファシリテーション）／==プロンプトリスト==（==PESTLE==・==TECOP==・==VUCA==）',
          '==RBS==（Risk Breakdown Structure, リスク・ブレークダウン・ストラクチャー）: リスクを==カテゴリ別==に階層分解',
          '　例: 技術リスク / 外部リスク / 組織リスク / プロジェクトマネジメントリスク',
          'リスクは「==事象==」と「==原因==」と「==影響==」の3要素を明確化',
          '__脅威__（threats, マイナスリスク）と==機会==（opportunities, プラスリスク）の両方を扱う',
        ],
        navyItems: [[{ text: 'RBS は WBS の派生概念。リスク管理の詳細は uncertainty カテゴリで別途扱う', style: 'navy' }]],
      },
      {
        heading: '26. リスク登録簿の構造と更新タイミング',
        items: [
          '==リスク登録簿==（Risk Register）: リスクの==中心リポジトリ==',
          '__主要記載項目__:',
          '　==リスク ID==／==リスク記述==／==カテゴリ==（RBSで分類）',
          '　==確率==／==影響度==（後続プロセスで定量化）',
          '　==リスク・スコア==（確率×影響度）',
          '　==リスク所有者==（オーナー）',
          '　==対応戦略==（後続プロセスで決定）',
          '　==トリガー==（risk trigger, 早期警報サイン）',
          '__更新タイミング__:',
          '　各リスクマネジメント・プロセス（識別・分析・対応・監視）の都度',
          '　==フェーズ・ゲート==・==変更要求==承認時',
          '　==リスク・レビュー==（定例）',
          '__リスク・レポート__: リスク全体の傾向・上位リスクのサマリー',
        ],
      },
      {
        heading: '27. 計画段階のステークホルダー登録簿との連携',
        items: [
          'ステークホルダー識別の結果である==ステークホルダー登録簿==は、計画段階で頻繁に参照される',
          '__計画プロセスとステークホルダー登録簿の連携__:',
          '　==スコープ計画==: 要求事項収集の対象者を特定',
          '　==スケジュール計画==: マイルストーンの==承認者==・==報告先==を特定',
          '　==コスト計画==: ==予算承認者==・==CCB メンバー==を特定',
          '　==リスク計画==: ==リスク影響を受けるステークホルダー==を特定',
          '　==調達計画==: ==サプライヤ==・==契約承認者==を特定',
          '計画書全体の==承認プロセス==にステークホルダー登録簿が反映',
          '__エンゲージメント計画書__と==コミュニケーション計画書==の整合性に注意',
        ],
        navyItems: [[{ text: 'ステークホルダー詳細は stakeholder カテゴリ §32（PMBOK6 13.x プロセス）参照', style: 'navy' }]],
      },
      {
        heading: '28. 調達計画（make-or-buy 決定）',
        items: [
          '==12.1 調達マネジメント計画==（Plan Procurement Management, 計画プロセス群）',
          '__主要意思決定__: ==make-or-buy 分析==（内製か外注か）',
          '__make-or-buy 判断基準__:',
          '　==コスト==（内製コスト vs 調達コスト）',
          '　==スキル/能力==（社内に専門性があるか）',
          '　==スケジュール==（時間制約）',
          '　==コア・コンピタンス==（戦略的重要度）',
          '　==知的財産==・機密性',
          '　==調達先の信頼性==',
          '__主要アウトプット__:',
          '　==調達マネジメント計画書==',
          '　==調達戦略==（契約形態・支払条件・選定基準）',
          '　==入札文書==（RFP/RFQ）',
          '　==調達作業範囲==（SOW, Statement of Work）',
          '　==独立コスト見積もり==',
          '契約形態の詳細は==project-work カテゴリ==で扱う',
        ],
        navyItems: [[{ text: '契約形態（固定価格・実費精算・T&M）は project-work §9-11 で詳細扱い', style: 'navy' }]],
      },
      // ── F. 計画統合と PMBOK7 ──
      {
        heading: '29. プロジェクト統合マネジメント計画書（PMBOK6 第4章）',
        items: [
          '==4.2 プロジェクトマネジメント計画書作成==（Develop Project Management Plan, 計画プロセス群）',
          '__目的__: ==サブシディアリー計画書==（§2）を==統合==して全体計画書を作成',
          '__統合される要素__:',
          '　==3つのベースライン==（スコープ／スケジュール／コスト）',
          '　==10のサブシディアリー計画書==（§2 参照）',
          '　==補助計画書==（変更管理・構成管理・パフォーマンス測定）',
          '　==プロジェクトライフサイクル選定==（開発アプローチ）',
          '__主要技法__: 専門家の判断／データ収集（ブレーンストーミング）／対人スキル（ファシリテーション）／会議',
          '__計画書のキックオフ会議__で==合意==を得る',
          '計画書は==承認後==に==ベースライン==化され、変更は==統合変更管理==で扱う',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §4.2', style: 'navy' }]],
      },
      {
        heading: '30. PMBOK第7版「計画」パフォーマンス領域',
        items: [
          '__第7版の8パフォーマンス領域__の1つ',
          '__目的__: プロジェクト==成果物の十分かつ協調的なデリバリ==',
          '__成果__:',
          '　==プロジェクト目標==に向けた進捗の組織化',
          '　==価値創出==アプローチの選定',
          '　==成果物の品質確保==',
          '　==ステークホルダー期待==への対応',
          '__主な検討事項__:',
          '　==スコープ==・==スケジュール==・==予算==の==バランス==',
          '　==チーム能力==',
          '　==組織の方針・標準==',
          '　==市場環境==',
          '__テーラリング__: 規模・複雑性・リスクに応じた計画の==精緻度==調整',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「計画」パフォーマンス領域', style: 'navy' }]],
      },
      {
        heading: '31. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセス・ITTO==による詳細記述。第5/6/7章で==16プロセス==（計画プロセス群中心）',
          '__第7版__: 「==計画==」==パフォーマンス領域==として統合記述（プロセス分解は省略）',
          '__本領域での対応__:',
          '　第6版 §5（スコープ）+ §6（スケジュール）+ §7（コスト）= 第7版「計画」パフォーマンス領域',
          '__IPA PM試験__:',
          '　==午前II==: 第6版用語（==WBS==・==CPM==・==PERT==・==EVM==・==コスト・ベースライン==）が中心',
          '　==午後I==: 第6版プロセスベースのシナリオが多い',
          '本アプリは両版を併記。試験頻出（==赤字==）は第6版用語を優先付与',
        ],
        navyItems: [[{ text: '計画系は PM試験 最頻出領域。PMBOK6 ITTO の暗記が直接得点に繋がる', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '32. 過去問頻出論点（午前II）',
        items: [
          '__WBS__: ==8/80ルール==・==100%ルール==・==成果物指向==・ワークパッケージ',
          '__依存関係__: PDM ==FS/FF/SS/SF==の例示判別',
          '__CPM__: ==クリティカルパス==特定・==トータルフロート==計算・遅延影響',
          '__PERT__: 期待値 (O+4M+P)/6 ・標準偏差 (P-O)/6 の計算',
          '__スケジュール短縮__: ==クラッシング==（コスト追加）vs ==ファストトラッキング==（並列化・リスク増）',
          '__見積もり技法__: 4技法（==類推==／==パラメトリック==／==ボトムアップ==／==3点==）の特徴対比',
          '__コスト・ベースライン__: ==マネジメント予備==を含まない（プロジェクト予算 = ベースライン + マネジメント予備）',
          '__経済性評価__: ==NPV==計算・==IRR==と資本コスト・==回収期間==',
          '__リスク識別__: ==RBS==・==SWOT==・プロンプトリスト（PESTLE）',
          '__調達計画__: ==make-or-buy 分析==・==SOW==・==入札文書==（RFP/RFQ）',
        ],
      },
      {
        heading: '33. ひっかけパターン',
        items: [
          '__妥当性確認 vs 品質コントロール__: 妥当性確認 = 顧客の==受入==（Validation）、品質コントロール = 仕様への==適合==（Verification）',
          '__コスト・ベースライン vs プロジェクト予算__: ==マネジメント予備==の==含む／含まない==',
          '__コンティンジェンシー予備 vs マネジメント予備__: 既知リスク==（含まれる）== vs 未知リスク==（含まれない）==',
          '__クラッシング vs ファストトラッキング__: コスト増 vs リスク増。==クリティカルパス上==のアクティビティが対象（クラッシング）',
          '__PERT 公式__: 期待値は==重み付き==(O+4M+P)/6、標準偏差は==(P-O)/6==',
          '__フロート__: トータルフロート vs フリーフロート（フリー = 後続を遅らせない）',
          '__見積もり精度__: ボトムアップ==最高==・類推==最低==',
          '__依存関係__: FS（==最頻出==）vs SF（==最稀==）の例示混同',
          '__PMBOK6 vs PMBOK7__: ==プロセス・ITTO==（第6版）vs ==パフォーマンス領域==（第7版）',
          '__make-or-buy__: ==コスト==だけでなく==戦略・コア・コンピタンス==も判断軸',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==WBS==（8/80ルール・100%ルール・成果物指向）／==CPM==（クリティカルパス・フロート計算）／==PERT==（期待値・標準偏差）／==見積もり4技法==は午前II 必出。',
      '【スケジュール】==PDM==の4依存関係（==FS/FF/SS/SF==）と==リード/ラグ==。==クラッシング==（コスト増）vs ==ファストトラッキング==（リスク増）の使い分け。',
      '【コスト】==コスト・ベースライン==（マネジメント予備==含まない==）vs ==プロジェクト予算==（==含む==）。==コンティンジェンシー予備==は既知リスク用。',
      '【経済性評価】==NPV==計算（現在価値割引）／==IRR==と資本コスト／==回収期間==の長短評価。',
      '【見積もり技法】==ボトムアップ==が最高精度、==類推==が最低精度。==3点見積もり（PERT）==の重み付き式 (O+4M+P)/6。',
      '【スコープ】==スコープ・ベースライン==は記述書＋WBS＋WBS辞書。==スコープ妥当性確認==（顧客受入）vs ==スコープコントロール==（変更管理）。',
      '【リスク】==RBS==・==SWOT==・==プロンプトリスト==（PESTLE/TECOP）。リスクは「事象・原因・影響」の3要素で記述。',
      '【調達計画】==make-or-buy 分析==は==コスト==・==スキル==・==戦略==・==知財==で判断。==SOW==・==RFP/RFQ==・==独立コスト見積もり==が成果物。',
      '【ひっかけ】==Validation==（顧客受入）vs ==Verification==（仕様適合）／==コンティンジェンシー==vs ==マネジメント予備==／==FS vs SF==の混同。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロセス・ITTO==は第6版、==パフォーマンス領域==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 5. プロジェクト作業（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'project-work': {
    summary:
      'プロジェクトの==実行==・==調達==・==知識管理==・==コミュニケーション==を扱う活動領域。PMBOK第6版では第4章（統合管理 実行）・第10章（コミュニケーション 実行/監視）・第12章（調達）・第9章（資源 実行）に分散、第7版では「==プロジェクト作業==」パフォーマンス領域として統合。==契約形態==（FP/CR/T&M）と==入札方式==が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. プロジェクト作業パフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「==プロジェクト作業==」パフォーマンス領域は、==実行・監視・物理的資源・調達・コミュニケーション==を統合的に扱う',
          '__成果__:',
          '　==効率的かつ効果的な==プロジェクト・パフォーマンス',
          '　==プロジェクト環境==への適切な対応',
          '　==ステークホルダーへの良好なコミュニケーション==',
          '　==物理的資源==の==管理==',
          '　==チーム学習==の==促進==',
          '__主な検討事項__: プロセス・制約・チーム能力・組織変革管理・継続学習',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「プロジェクト作業」パフォーマンス領域', style: 'navy' }]],
      },
      {
        heading: '2. PMBOK第6版での対応知識エリア',
        items: [
          'PMBOK第7版「プロジェクト作業」=第6版の以下の知識エリアの==実行・監視==プロセスを統合:',
          '　__第4章 プロジェクト統合マネジメント__:',
          '　　==4.3 プロジェクト作業の指揮・マネジメント==（実行）',
          '　　==4.4 プロジェクト知識のマネジメント==（実行）',
          '　　==4.5 プロジェクト作業の監視・コントロール==（監視）',
          '　　==4.6 統合変更管理==（監視）',
          '　__第9章 資源マネジメント__: ==9.3 資源獲得==（実行）／==9.6 資源コントロール==（監視）※詳細は team §28 参照',
          '　__第10章 コミュニケーション・マネジメント__:',
          '　　==10.2 コミュニケーションのマネジメント==（実行）',
          '　　==10.3 コミュニケーションの監視==（監視）',
          '　__第12章 調達マネジメント__:',
          '　　==12.1 調達計画==（計画、planning §28 参照）',
          '　　==12.2 調達の実施==（実行）',
          '　　==12.3 調達のコントロール==（監視）',
        ],
        navyItems: [[{ text: 'team / planning カテゴリと相互参照。重複記述を避けて本カテゴリは「実行・監視・調達・知識管理」に集中', style: 'navy' }]],
      },
      {
        heading: '3. プロジェクト作業の活動範囲',
        items: [
          '__活動範囲__:',
          '　==実行==（Execute）: 計画通りに作業を==実施==し成果物を生成',
          '　==監視==（Monitor）: 計画と==実績の差異==を==追跡==',
          '　==コントロール==（Control）: 差異に対する==是正処置==・==予防処置==',
          '__中心成果物__:',
          '　==成果物==（deliverables）: プロジェクト要件を満たす==有形/無形==の生成物',
          '　==作業パフォーマンス・データ==: 生の測定値',
          '　==作業パフォーマンス情報==: データに文脈を加えた中間情報',
          '　==作業パフォーマンス報告書==: 情報を==意思決定可能==な形式に整理',
          '__管理プロセスの相互作用__: 実行→監視→コントロール→是正→実行（==継続的なループ==）',
        ],
      },
      // ── B. 統合管理（実行・監視） ──
      {
        heading: '4. 4.3 プロジェクト作業の指揮・マネジメント',
        items: [
          '==4.3 プロジェクト作業の指揮・マネジメント==（Direct and Manage Project Work, 実行プロセス群）',
          '__目的__: ==計画書==の通りに作業を==指揮==し、==承認された変更==を実装',
          '__主要技法__:',
          '　専門家の判断',
          '　==プロジェクトマネジメント情報システム==（PMIS）',
          '　==会議==（キックオフ・進捗・問題解決）',
          '__主要アウトプット__:',
          '　==成果物==（deliverables, 生成物）',
          '　==作業パフォーマンス・データ==（実績値）',
          '　==問題ログ==（issue log, 発生中の問題）',
          '　==変更要求==',
          '　==プロジェクト文書の更新==',
          'PMの==中心実行プロセス==で、他の実行プロセスを==統合==する',
        ],
      },
      {
        heading: '5. 4.4 プロジェクト知識のマネジメント',
        items: [
          '==4.4 プロジェクト知識のマネジメント==（Manage Project Knowledge, 実行プロセス群、==第6版で新設==）',
          '__目的__: ==既存知識==の活用と==新規知識==の創出',
          '__2種類の知識__:',
          '　==形式知==（Explicit Knowledge）: ==文書化==された知識（マニュアル・手順書）',
          '　==暗黙知==（Tacit Knowledge）: 個人の==経験・直感==に基づく知識',
          '__技法__:',
          '　==知識マネジメント==: ==ナレッジ・カフェ==・==ワークショップ==・==コミュニティ・オブ・プラクティス==',
          '　==情報マネジメント==: ==リポジトリ==・==ライブラリ==・==Wiki==',
          '　==対人スキル==: ==アクティブ・リスニング==・==ネットワーキング==',
          '__主要アウトプット__: ==教訓登録簿==（lessons learned register）／プロジェクト文書の更新',
          '__教訓__は==継続的に==収集（プロジェクト終結時だけでない）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §4.4。形式知 vs 暗黙知（野中郁次郎 SECIモデル）は試験頻出', style: 'navy' }]],
      },
      {
        heading: '6. 4.5 プロジェクト作業の監視・コントロール',
        items: [
          '==4.5 プロジェクト作業の監視・コントロール==（Monitor and Control Project Work, 監視・コントロールプロセス群）',
          '__目的__: ==プロジェクト全体==の進捗・パフォーマンスを==監視==し、計画書からの==差異==を==是正==',
          '__主要技法__:',
          '　==データ分析==: ==代替案分析==／==コスト便益分析==／==EVA==／==トレンド分析==／==差異分析==',
          '　==意思決定==: 投票／独裁／多基準意思決定分析',
          '　==専門家の判断==／==会議==',
          '__主要アウトプット__:',
          '　==作業パフォーマンス報告書==',
          '　==変更要求==',
          '　==プロジェクト文書・計画書の更新==',
          '__報告書の種類__:',
          '　==ステータス・レポート==（現状）／==トレンド・レポート==（傾向）／==予測レポート==（将来予測）／==バリアンス・レポート==（差異）',
        ],
      },
      {
        heading: '7. 4.6 統合変更管理',
        items: [
          '==4.6 統合変更管理==（Perform Integrated Change Control, 監視・コントロールプロセス群）',
          '__目的__: ==全変更要求==を==一元管理==して==影響評価==・==承認==・==実装==',
          '__中心概念__: ==変更管理委員会==（CCB, Change Control Board）',
          '__CCBの役割__:',
          '　変更要求の==評価==・==承認/却下==・==延期==',
          '　==影響範囲分析==（コスト・スケジュール・品質・リスク）',
          '　==構成管理==との連携',
          '__変更管理ワークフロー__: 変更要求 → ==影響分析== → CCB審議 → ==承認/却下== → ==実装== → ==検証== → ==文書化==',
          '__構成管理__（Configuration Management）: 製品・プロジェクト情報の==バージョン管理==',
          '__主要アウトプット__: 承認された変更要求／プロジェクトマネジメント計画書の更新',
          '変更管理は==計画段階でルール化==（変更管理計画書）',
        ],
        navyItems: [[{ text: 'CCB・統合変更管理プロセスは午前II/午後I 双方で頻出', style: 'navy' }]],
      },
      // ── C. 調達マネジメント ──
      {
        heading: '8. 12.1 調達マネジメント計画（make-or-buy 分析）',
        items: [
          '==12.1 調達マネジメント計画==（Plan Procurement Management, 計画プロセス群）',
          '※詳細は planning §28 参照。本セクションは概観のみ',
          '__make-or-buy 分析__の主要判断軸:',
          '　==コスト==（内製 vs 外注）',
          '　==スキル==（社内に専門性があるか）',
          '　==スケジュール==',
          '　==コア・コンピタンス==・戦略的重要度',
          '　==知的財産==',
          '__主要アウトプット__:',
          '　==調達マネジメント計画書==',
          '　==調達戦略==・==入札文書==（RFP/RFQ）',
          '　==調達作業範囲==（SOW, Statement of Work）',
        ],
      },
      {
        heading: '9. 契約形態の3類型',
        items: [
          '__PMBOK第6版が定める3類型__:',
          '　==固定価格契約==（FP, Fixed Price）: ==総額固定==。買い手リスク小・売り手リスク大',
          '　==実費精算契約==（CR, Cost-Reimbursable）: ==実費＋手数料==。買い手リスク大・売り手リスク小',
          '　==タイム＆マテリアル契約==（T&M, Time & Materials）: ==単価×数量==（中間形態）',
          '__リスク配分__:',
          '　FP: 売り手が==コスト超過リスク==を負う',
          '　CR: 買い手が==コスト超過リスク==を負う',
          '　T&M: 中間',
          '__選択基準__:',
          '　==スコープ明確== → FP',
          '　==スコープ不確実== → CR または T&M',
          '　==短期/小規模== → T&M',
          '__日本の請負契約__は FP に近い、==準委任契約==は T&M に近い',
        ],
        navyItems: [[{ text: '契約形態の3類型と派生形は午前II 頻出。リスク配分が判別ポイント', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '契約リスク配分: FPは売り手リスク高、CRは買い手リスク高、T&Mは中間',
            ariaLabel: '固定価格契約、タイムアンドマテリアル契約、実費精算契約のリスク配分を軸で示す図',
            viewBox: '0 0 700 360',
            content: `
              <defs>
                <marker id="contract-arrow-left" markerWidth="10" markerHeight="8" refX="1" refY="4" orient="auto">
                  <polygon points="10 0, 0 4, 10 8" fill="#64748b" />
                </marker>
                <marker id="contract-arrow-right" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="664" height="324" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="48" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">契約形態のリスク連続体</text>
              <line x1="104" y1="176" x2="596" y2="176" stroke="#64748b" stroke-width="5" marker-start="url(#contract-arrow-left)" marker-end="url(#contract-arrow-right)" />
              <text x="104" y="130" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">売り手リスク高</text>
              <text x="596" y="130" fill="#1d4ed8" font-size="13" font-weight="700" text-anchor="middle">買い手リスク高</text>
              <rect x="72" y="146" width="156" height="74" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="150" y="171" fill="#991b1b" font-size="17" font-weight="700" text-anchor="middle">FP</text>
              <text x="150" y="191" fill="#1e293b" font-size="12" text-anchor="middle">固定価格</text>
              <text x="150" y="209" fill="#1e293b" font-size="12" text-anchor="middle">スコープ明確</text>
              <rect x="272" y="146" width="156" height="74" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="350" y="171" fill="#92400e" font-size="17" font-weight="700" text-anchor="middle">T&M</text>
              <text x="350" y="191" fill="#1e293b" font-size="12" text-anchor="middle">単価 × 数量</text>
              <text x="350" y="209" fill="#1e293b" font-size="12" text-anchor="middle">短期・小規模</text>
              <rect x="472" y="146" width="156" height="74" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="550" y="171" fill="#1d4ed8" font-size="17" font-weight="700" text-anchor="middle">CR</text>
              <text x="550" y="191" fill="#1e293b" font-size="12" text-anchor="middle">実費精算</text>
              <text x="550" y="209" fill="#1e293b" font-size="12" text-anchor="middle">不確実性高</text>
              <rect x="58" y="256" width="584" height="44" rx="8" fill="#ffffff" stroke="#cbd5e1" />
              <text x="350" y="282" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">買い手は予算確実性を重視するとFP、柔軟性を重視するとCR/T&Mを選びやすい</text>
              <text x="350" y="318" fill="#475569" font-size="12" text-anchor="middle">PM試験では「誰がコスト超過リスクを負うか」で判別する</text>
            `,
          },
        ],
      },
      {
        heading: '10. 固定価格契約（FP）の派生形',
        items: [
          '==FFP==（Firm Fixed Price, 確定固定価格）: ==完全固定==。最もシンプル',
          '__使用条件__: ==スコープが明確==で変動なし',
          '==FPIF==（Fixed Price Incentive Fee, 固定価格インセンティブ・フィー）: 固定価格＋==パフォーマンス連動インセンティブ==',
          '__価格上限__（Price Ceiling, PC）あり',
          '__計算例__: 目標コスト達成で==ボーナス==、超過で==ペナルティ==',
          '==FP-EPA==（Fixed Price with Economic Price Adjustment, 経済価格調整条項付固定価格）: ==長期契約==で==物価変動==を反映',
          '__使用条件__: ==為替変動==・==原材料価格変動==・==金利変動==が想定される複数年契約',
          '__指標連動__: ==CPI==（消費者物価指数）等',
          '__選択基準__:',
          '　短期・スコープ明確 → ==FFP==',
          '　パフォーマンス重視 → ==FPIF==',
          '　長期・市場変動懸念 → ==FP-EPA==',
        ],
      },
      {
        heading: '11. 実費精算契約（CR）の派生形',
        items: [
          '==CPFF==（Cost Plus Fixed Fee, コスト・プラス・固定報酬）: ==実費＋固定の報酬==',
          '__特徴__: 報酬額は契約時に確定（コスト変動の影響を受けない）',
          '==CPIF==（Cost Plus Incentive Fee, コスト・プラス・インセンティブ・フィー）: ==実費＋パフォーマンス連動インセンティブ==',
          '__計算式__: 目標コスト・実コストの差を==買い手と売り手で分担==（==分担率==で配分）',
          '==CPAF==（Cost Plus Award Fee, コスト・プラス・アワード・フィー）: ==実費＋成果報酬==',
          '__特徴__: 報酬は==買い手の主観評価==で決定（業績評価レビュー）',
          '__廃止形式__: CPPC（Cost Plus Percentage of Cost）= ==実費＋実費の一定％==。==売り手のコスト膨張インセンティブ==が問題で禁止',
          '__選択基準__:',
          '　==安定したインセンティブ== → CPFF',
          '　==パフォーマンス連動== → CPIF',
          '　==主観的成果評価== → CPAF',
        ],
        navyItems: [[{ text: 'CPFF/CPIF/CPAF の違いは午前II 頻出。報酬計算式の理解が判別ポイント', style: 'navy' }]],
      },
      {
        heading: '12. 12.2 調達の実施',
        items: [
          '==12.2 調達の実施==（Conduct Procurements, 実行プロセス群）',
          '__目的__: ==入札==・==提案評価==・==契約締結==',
          '__主要技法__:',
          '　==入札説明会==（bidder conference）: 全候補者に==同一情報==を提供',
          '　==プロポーザル評価==（提案評価）: ==評価基準==に基づく採点',
          '　==独立コスト見積もり==との==比較==',
          '　==交渉==（contract negotiation）',
          '__主要アウトプット__:',
          '　==選定された売り手==',
          '　==合意書==（agreements, 契約書）',
          '　==変更要求==',
          '　==プロジェクト文書の更新==',
          '__調達文書__: ==RFP==（Request for Proposal, 提案依頼書）／==RFQ==（Request for Quotation, 見積依頼書）／==RFI==（Request for Information, 情報提供依頼書）',
          '__選定基準__: ==最低価格==／==総合評価==／==スコアリング・モデル==',
        ],
      },
      {
        heading: '13. 入札方式（一般競争・指名競争・随意契約）',
        items: [
          '__日本の公共調達における3方式__（地方自治法 §234 等）:',
          '　==一般競争入札==: ==公告==で==広く参加者を募集==。==透明性高==・==コスト低減==が期待',
          '　==指名競争入札==: ==実績のある業者==を==指名==して入札（参加者限定）',
          '　==随意契約==: 業者を==1社に特定==して契約（競争なし）',
          '__選択基準__:',
          '　原則: 一般競争入札',
          '　例外: 緊急性・専門性・少額（随意契約の許容条件）',
          '__民間調達__では==プロポーザル方式==（技術提案）が一般的',
          '__総合評価方式__: 価格と技術提案を==両方評価==（公共調達で増加傾向）',
          '__不正防止__: ==談合==の排除・==適正な競争==の確保',
        ],
        navyItems: [[{ text: '日本の公共調達制度は IPA 試験で時折出題（特にIT 調達）', style: 'navy' }]],
      },
      {
        heading: '14. 12.3 調達のコントロール',
        items: [
          '==12.3 調達のコントロール==（Control Procurements, 監視・コントロールプロセス群）',
          '__目的__: ==契約履行==の==監視==・==パフォーマンス管理==・==変更管理==',
          '__主要技法__:',
          '　==契約変更コントロール・システム==',
          '　==データ分析==: ==パフォーマンス評価==／==EVA==／==トレンド分析==',
          '　==検査==／==監査==',
          '　==クレーム管理==（Claims Administration）',
          '__主要アウトプット__: ==終結された調達==／==作業パフォーマンス情報==／==調達文書の更新==／変更要求',
          '__クレーム管理__: 契約条件の==解釈の相違==による==紛争==の管理',
          '　ADR（Alternative Dispute Resolution, ==代替的紛争解決==）: ==調停==・==仲裁==',
          '__契約終結__: 全成果物受入後の==正式終結==（規定の終結条件遵守）',
        ],
      },
      // ── D. コミュニケーション ──
      {
        heading: '15. 10.2 コミュニケーションのマネジメント',
        items: [
          '==10.2 コミュニケーションのマネジメント==（Manage Communications, 実行プロセス群）',
          '__目的__: ==情報==の==収集==・==配信==・==保管==・==検索==・==適時/適切==な利用',
          '__主要技法__:',
          '　==コミュニケーション技術==（同期/非同期・対面/リモート）',
          '　==コミュニケーション・モデル==（送信者・符号化・媒体・復号・受信者・フィードバック）',
          '　==コミュニケーション方法==:',
          '　　==プッシュ型==（送信者主導、メール・レポート）',
          '　　==プル型==（受信者主導、ポータル・ダッシュボード）',
          '　　==インタラクティブ型==（双方向、会議・電話）',
          '　==対人スキル==（==アクティブ・リスニング==・==非言語==・==プレゼンテーション==・==ファシリテーション==）',
          '　==PMIS==',
          '__主要アウトプット__:',
          '　==プロジェクト・コミュニケーション==（情報・通知）',
          '　==プロジェクト計画書の更新==',
          '　==プロジェクト文書・OPAs の更新==',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §10.2。コミュニケーションの3方法（プッシュ/プル/インタラクティブ）は stakeholder §24 と整合', style: 'navy' }]],
      },
      {
        heading: '16. 10.3 コミュニケーションの監視',
        items: [
          '==10.3 コミュニケーションの監視==（Monitor Communications, 監視・コントロールプロセス群）',
          '__目的__: ==コミュニケーション・ニーズ==が==満たされている==ことを==確認==',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==PMIS==',
          '　==データ分析==: ==ステークホルダー関与評価マトリクス==',
          '　==対人スキル==',
          '　==会議==',
          '__主要アウトプット__:',
          '　==作業パフォーマンス情報==（コミュニケーション活動の効果）',
          '　==変更要求==',
          '　==プロジェクト文書・計画書の更新==',
        ],
      },
      {
        heading: '17. 作業パフォーマンス・データ → 情報 → 報告書 の流れ',
        items: [
          'PMBOK では作業パフォーマンスを==3段階==で扱う:',
          '　__1. 作業パフォーマンス・データ__（Work Performance Data）',
          '　　==生の測定値==（完了率・実コスト・実時間）',
          '　　==4.3 プロジェクト作業の指揮・マネジメント==の主要アウトプット',
          '　__2. 作業パフォーマンス情報__（Work Performance Information）',
          '　　==データに文脈==を加えた==中間情報==（計画 vs 実績の差異・予測）',
          '　　==監視・コントロール==プロセスのアウトプット',
          '　__3. 作業パフォーマンス報告書__（Work Performance Reports）',
          '　　情報を==意思決定可能な形式==に整理',
          '　　==4.5 プロジェクト作業の監視・コントロール==の主要アウトプット',
          '__配信先__: ステークホルダー（コミュニケーション計画に基づく）',
        ],
        navyItems: [[{ text: '3段階の階層は午前II 頻出。「データ → 情報 → 報告書」の生成順序を区別', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '作業パフォーマンス: データ → 情報 → 報告書 の順に意思決定可能になる',
            ariaLabel: '作業パフォーマンスデータから情報、報告書へ変換される流れを示す図',
            viewBox: '0 0 700 390',
            content: `
              <defs>
                <marker id="workperf-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="664" height="354" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="48" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">Work Performance の3階層</text>
              <rect x="56" y="108" width="170" height="112" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="141" y="134" fill="#1d4ed8" font-size="15" font-weight="700" text-anchor="middle">データ</text>
              <text x="141" y="154" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">Work Performance Data</text>
              <text x="141" y="180" fill="#1e293b" font-size="12" text-anchor="middle">生の測定値</text>
              <text x="141" y="198" fill="#1e293b" font-size="12" text-anchor="middle">完了率・実コスト</text>
              <text x="141" y="216" fill="#1e293b" font-size="12" text-anchor="middle">4.3 のアウトプット</text>
              <rect x="266" y="108" width="170" height="112" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="351" y="134" fill="#166534" font-size="15" font-weight="700" text-anchor="middle">情報</text>
              <text x="351" y="154" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">Work Performance Info</text>
              <text x="351" y="180" fill="#1e293b" font-size="12" text-anchor="middle">文脈を付与</text>
              <text x="351" y="198" fill="#1e293b" font-size="12" text-anchor="middle">計画 vs 実績</text>
              <text x="351" y="216" fill="#1e293b" font-size="12" text-anchor="middle">監視プロセスで生成</text>
              <rect x="476" y="108" width="170" height="112" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="561" y="134" fill="#991b1b" font-size="15" font-weight="700" text-anchor="middle">報告書</text>
              <text x="561" y="154" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">Work Performance Reports</text>
              <text x="561" y="180" fill="#1e293b" font-size="12" text-anchor="middle">意思決定可能</text>
              <text x="561" y="198" fill="#1e293b" font-size="12" text-anchor="middle">予測・差異・傾向</text>
              <text x="561" y="216" fill="#1e293b" font-size="12" text-anchor="middle">4.5 のアウトプット</text>
              <line x1="226" y1="164" x2="264" y2="164" stroke="#64748b" stroke-width="4" marker-end="url(#workperf-arrow)" />
              <line x1="436" y1="164" x2="474" y2="164" stroke="#64748b" stroke-width="4" marker-end="url(#workperf-arrow)" />
              <text x="245" y="146" fill="#475569" font-size="11" font-weight="700" text-anchor="middle">分析</text>
              <text x="455" y="146" fill="#475569" font-size="11" font-weight="700" text-anchor="middle">整理</text>
              <rect x="78" y="268" width="544" height="48" rx="8" fill="#ffffff" stroke="#cbd5e1" />
              <text x="350" y="290" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">生成順序: 4.3でデータを集め、各監視プロセスで情報化し、4.5で報告書に統合</text>
              <text x="350" y="308" fill="#475569" font-size="12" text-anchor="middle">報告書はステークホルダーへ配信され、変更要求や是正処置の判断材料になる</text>
            `,
          },
        ],
      },
      {
        heading: '18. 報告書の種類（ステータス・トレンド・予測・バリアンス）',
        items: [
          '__4つの主要報告書__:',
          '　==ステータス・レポート==（Status Report）: ==現時点==のプロジェクト状況',
          '　　含む内容: 進捗・コスト・品質・リスク・問題',
          '　==トレンド・レポート==（Trend Report）: ==時系列==での==傾向==',
          '　　パフォーマンスが==改善==／==悪化==のトレンドを示す',
          '　==予測レポート==（Forecast Report）: ==将来予測==',
          '　　==EAC==／==ETC==等の予測値、完成時期予測',
          '　==バリアンス・レポート==（Variance Report）: ==計画 vs 実績==の==差異==',
          '　　CV・SV 等の差異分析',
          '__配信頻度__: 計画書で定義（週次／月次／フェーズ末等）',
          '__配信形式__: メール／ダッシュボード／対面会議',
        ],
      },
      // ── E. 資源・知識管理 ──
      {
        heading: '19. 資源獲得・資源コントロール（参照: team §28）',
        items: [
          '==9.3 資源の獲得==（Acquire Resources, 実行プロセス群）',
          '__目的__: 計画書通りに==チームメンバー==・==施設==・==設備==等を==獲得==',
          '__主要技法__: ==事前割当==／==交渉==／==獲得==（外部採用）／==バーチャルチーム==',
          '==9.6 資源のコントロール==（Control Resources, 監視・コントロールプロセス群）',
          '__目的__: ==物的資源==が==計画通り==に利用されているか==監視==・==是正==',
          '__主要技法__: ==データ分析==（コストパフォーマンス分析・トレンド分析）／==問題解決==',
          '__注意__: 9.6 は==物的資源==が対象。==チーム==の監視は 9.5 チームのマネジメント（team §33 参照）',
          '__詳細__は==team カテゴリ §28==を参照',
        ],
        navyItems: [[{ text: 'team カテゴリ §28 で9.2/9.3/9.6 を統合的に扱う。本セクションは概観のみ', style: 'navy' }]],
      },
      {
        heading: '20. プロジェクト知識管理（暗黙知 vs 形式知）',
        items: [
          '==知識マネジメント==は PMBOK第6版で==新設==された重要トピック',
          '__2種類の知識（野中郁次郎の SECI モデル）__:',
          '　==暗黙知==（Tacit Knowledge）: ==個人の経験・直感・スキル==に基づく知識',
          '　　例: ==熟練エンジニアの勘==・==ファシリテーションの感覚==',
          '　==形式知==（Explicit Knowledge）: ==言語化・文書化==された知識',
          '　　例: ==マニュアル==・==設計書==・==チェックリスト==',
          '__SECI モデルの4プロセス__:',
          '　==共同化==（Socialization）: 暗黙知 → 暗黙知（メンタリング）',
          '　==表出化==（Externalization）: 暗黙知 → 形式知（==文書化==）',
          '　==連結化==（Combination）: 形式知 → 形式知（==統合・整理==）',
          '　==内面化==（Internalization）: 形式知 → 暗黙知（==実践・体験==）',
          '__知識の循環__で組織の知識資産が==増大==',
        ],
        navyItems: [[{ text: '野中郁次郎・竹内弘高「知識創造企業」1995年。PMBOK第6版 §4.4 で参照', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'SECIモデル: 暗黙知と形式知を循環させて組織知を増やす',
            ariaLabel: 'SECIモデルの共同化、表出化、連結化、内面化を4象限で示す図',
            viewBox: '0 0 700 500',
            content: `
              <defs>
                <marker id="seci-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="664" height="464" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="48" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">SECI Knowledge Spiral</text>
              <text x="350" y="78" fill="#475569" font-size="13" font-weight="700" text-anchor="middle">知識変換: From（左）→ To（上）</text>
              <text x="246" y="112" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">To: 暗黙知</text>
              <text x="496" y="112" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">To: 形式知</text>
              <text x="78" y="204" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle" transform="rotate(-90 78 204)">From: 暗黙知</text>
              <text x="78" y="354" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle" transform="rotate(-90 78 354)">From: 形式知</text>
              <line x1="370" y1="128" x2="370" y2="408" stroke="#64748b" stroke-width="2" />
              <line x1="120" y1="268" x2="620" y2="268" stroke="#64748b" stroke-width="2" />
              <rect x="132" y="136" width="218" height="116" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="241" y="168" fill="#1d4ed8" font-size="18" font-weight="700" text-anchor="middle">共同化</text>
              <text x="241" y="190" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">Socialization</text>
              <text x="241" y="216" fill="#1e293b" font-size="12" text-anchor="middle">暗黙知 → 暗黙知</text>
              <text x="241" y="234" fill="#1e293b" font-size="12" text-anchor="middle">メンタリング・OJT</text>
              <rect x="392" y="136" width="218" height="116" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="501" y="168" fill="#166534" font-size="18" font-weight="700" text-anchor="middle">表出化</text>
              <text x="501" y="190" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">Externalization</text>
              <text x="501" y="216" fill="#1e293b" font-size="12" text-anchor="middle">暗黙知 → 形式知</text>
              <text x="501" y="234" fill="#1e293b" font-size="12" text-anchor="middle">文書化・モデル化</text>
              <rect x="392" y="292" width="218" height="116" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="501" y="324" fill="#92400e" font-size="18" font-weight="700" text-anchor="middle">連結化</text>
              <text x="501" y="346" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">Combination</text>
              <text x="501" y="372" fill="#1e293b" font-size="12" text-anchor="middle">形式知 → 形式知</text>
              <text x="501" y="390" fill="#1e293b" font-size="12" text-anchor="middle">統合・整理・DB化</text>
              <rect x="132" y="292" width="218" height="116" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="241" y="324" fill="#991b1b" font-size="18" font-weight="700" text-anchor="middle">内面化</text>
              <text x="241" y="346" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">Internalization</text>
              <text x="241" y="372" fill="#1e293b" font-size="12" text-anchor="middle">形式知 → 暗黙知</text>
              <text x="241" y="390" fill="#1e293b" font-size="12" text-anchor="middle">実践・訓練・体験</text>
              <path d="M350 194 L388 194" stroke="#64748b" stroke-width="3" marker-end="url(#seci-arrow)" />
              <path d="M501 252 L501 288" stroke="#64748b" stroke-width="3" marker-end="url(#seci-arrow)" />
              <path d="M392 350 L354 350" stroke="#64748b" stroke-width="3" marker-end="url(#seci-arrow)" />
              <path d="M241 292 L241 256" stroke="#64748b" stroke-width="3" marker-end="url(#seci-arrow)" />
              <text x="350" y="456" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">共同化 → 表出化 → 連結化 → 内面化 の循環で、個人知が組織知へ広がる</text>
            `,
          },
        ],
      },
      {
        heading: '21. 教訓（lessons learned）と回顧的レビュー',
        items: [
          '==教訓==（Lessons Learned）: プロジェクトで得た==成功要因==・==失敗要因==・==良い実践==',
          '__収集タイミング__:',
          '　==継続的==（フェーズ末・スプリント末・問題発生時）',
          '　==プロジェクト終結時==（最終教訓）',
          '__成果物__:',
          '　==教訓登録簿==（Lessons Learned Register）: プロジェクト==進行中==',
          '　==教訓リポジトリ==（Lessons Learned Repository）: 組織横断・==全プロジェクト共有==',
          '__回顧的レビュー__:',
          '　==アジャイル==: ==スプリント・レトロスペクティブ==（毎スプリント末）',
          '　==予測型==: ==フェーズ・ゲート==／プロジェクト終結時',
          '__技法__:',
          '　==KPT==（Keep / Problem / Try）',
          '　==4Ls==（Liked / Learned / Lacked / Longed For）',
          '　==FISHBONE==（特性要因図）',
        ],
        navyItems: [[{ text: '教訓登録簿は PMBOK第6版で新設。「収集タイミングは継続的」が試験頻出', style: 'navy' }]],
      },
      {
        heading: '22. 知識共有のリポジトリとコミュニティ・オブ・プラクティス',
        items: [
          '__組織レベルの知識管理基盤__:',
          '　==ナレッジ・リポジトリ==: 文書・テンプレート・教訓の==中央集積所==',
          '　==Wiki==・==Confluence==・==SharePoint==等のツール',
          '__コミュニティ・オブ・プラクティス__（CoP, Community of Practice）: 共通の関心を持つ専門家の==自発的==な集まり',
          '　==知識の横展開==・==専門家ネットワーク形成==',
          '　==社内勉強会==・==技術ブログ==・==社内 LT==',
          '__ナレッジ・カフェ__: 非公式な==対話の場==（暗黙知の表出化）',
          '__ワークショップ__: 構造化された==共創==の場',
          '__プロジェクト後__: ==事例研究==・==社外発信==（カンファレンス登壇）も知識資産化',
          '__組織学習__: 個人 → チーム → 組織 → 業界の==階層拡散==',
        ],
      },
      // ── F. 法律・契約周辺 ──
      {
        heading: '23. 関連法令・標準（独占禁止法・下請法・知財）',
        items: [
          'IT プロジェクトに関連する==主要法令==:',
          '　__独占禁止法__（独禁法）: ==不公正な取引方法==・==優越的地位の濫用==の禁止',
          '　　==下請けへの不当な圧力==・==代金減額==が違反対象',
          '　__下請代金支払遅延等防止法__（下請法）:',
          '　　==親事業者==と==下請事業者==の関係を規制',
          '　　==代金支払遅延==・==不当返品==・==買い叩き==の禁止',
          '　__著作権法__:',
          '　　==プログラムの著作物==は著作権で保護',
          '　　==職務著作==（法人著作）: 業務上作成したプログラムは==法人==に帰属（個人ではなく）',
          '　__個人情報保護法__:',
          '　　==個人情報取扱事業者==の義務',
          '　　==安全管理措置==・==第三者提供制限==',
          '　__不正競争防止法__: ==営業秘密==の保護',
        ],
        navyItems: [[{ text: '下請法・職務著作・個人情報保護法は IT 系試験で頻出', style: 'navy' }]],
      },
      {
        heading: '24. 契約条件（請負契約 vs 準委任契約）',
        items: [
          '日本の IT 開発契約で重要な==2区分==:',
          '　__請負契約__（Contract for Work）:',
          '　　==成果物完成==を==義務==とする契約',
          '　　==瑕疵担保責任==（旧）／==契約不適合責任==（民法改正後）',
          '　　==FP 契約==に近い性質',
          '　　例: ウォーターフォール型開発・固定価格 SES',
          '　__準委任契約__（Quasi-Mandate Contract）:',
          '　　==業務遂行==を==義務==とする契約（成果物保証なし）',
          '　　==善管注意義務==（善良な管理者の注意義務）',
          '　　==T&M 契約==に近い性質',
          '　　例: ==アジャイル開発==・運用保守・コンサルティング',
          '__選択基準__:',
          '　==スコープ明確== → 請負',
          '　==スコープ不確実==／変更前提 → 準委任',
          '__アジャイル開発__は==準委任==が一般的（経済産業省 DXレポートも推奨）',
        ],
        navyItems: [[{ text: '2020年民法改正で「瑕疵担保責任」が「契約不適合責任」に変更。試験で時折問われる', style: 'navy' }]],
      },
      {
        heading: '25. NDA（守秘義務契約）と知的財産権',
        items: [
          '==NDA==（Non-Disclosure Agreement, 守秘義務契約）: ==秘密情報==の==取扱いを規定==する契約',
          '__主要規定__:',
          '　==秘密情報の定義==（範囲・例外）',
          '　==使用目的の限定==',
          '　==第三者開示の禁止==',
          '　==違反時の損害賠償==',
          '　==契約期間==・==契約終了後の義務==',
          '__締結タイミング__:',
          '　==プロジェクト開始前==',
          '　==入札参加時==（プロポーザル評価のため）',
          '　==M&A・業務提携==前',
          '__知的財産権の帰属__:',
          '　==契約で明示==することが重要',
          '　==デフォルト==: 制作者（=ベンダー）に帰属する場合が多い',
          '　==買い手側==が知財を欲する場合は==明示的に契約==で規定',
          '　==オープンソース==の取扱い（ライセンス遵守）も契約で明示',
        ],
        navyItems: [[{ text: 'NDA・知財帰属は調達契約で頻出論点。経済産業省「情報システム・モデル取引・契約書」が参考資料', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '26. 過去問頻出論点（午前II）',
        items: [
          '__契約形態__: 3類型（==FP/CR/T&M==）のリスク配分・選択基準',
          '__FP派生形__: ==FFP==／==FPIF==／==FP-EPA==の特徴',
          '__CR派生形__: ==CPFF==／==CPIF==／==CPAF==の特徴',
          '__入札方式__: ==一般競争==／==指名競争==／==随意契約==の使い分け',
          '__調達文書__: ==RFP==／==RFQ==／==RFI==／==SOW==の役割区別',
          '__統合変更管理__: ==CCB==・変更要求ワークフロー',
          '__作業パフォーマンス__: ==データ → 情報 → 報告書==の3階層',
          '__報告書種別__: ==ステータス==／==トレンド==／==予測==／==バリアンス==',
          '__知識管理__: ==形式知 vs 暗黙知==／==SECI モデル==／==教訓登録簿==',
          '__法律__: ==下請法==／==職務著作==／==請負 vs 準委任==／==NDA==',
        ],
      },
      {
        heading: '27. ひっかけパターン',
        items: [
          '__請負 vs 準委任__: ==成果物完成義務==（請負）vs ==業務遂行義務==（準委任）',
          '__FP vs CR__: 売り手リスク==大==（FP）vs 買い手リスク==大==（CR）',
          '__CPFF vs CPIF vs CPAF__: 報酬の決定方式（==固定==／==パフォーマンス連動==／==主観評価==）',
          '__RFP vs RFQ vs RFI__: ==提案依頼==／==見積依頼==／==情報依頼==の使い分け',
          '__作業パフォーマンス3階層__: データ（生）／情報（中間）／報告書（意思決定可能）の生成順序',
          '__教訓収集__: ==継続的==（プロジェクト終結時だけではない）',
          '__職務著作__: 業務上作成したプログラムは==法人==に帰属（個人ではない）',
          '__個人情報__: ==取得時の利用目的通知==・==同意==・==第三者提供制限==',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
          '__9.5 vs 9.6__: チームの管理（9.5, team §33）vs ==物的資源==のコントロール（9.6）',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】契約形態の==3類型==（FP/CR/T&M）の==リスク配分==／派生形（==FFP/FPIF/FP-EPA==・==CPFF/CPIF/CPAF==）の特徴を表で覚える。',
      '【調達文書】==RFP==（提案）／==RFQ==（見積）／==RFI==（情報）／==SOW==（作業範囲）の使い分け。',
      '【入札方式】==一般競争==／==指名競争==／==随意契約==の原則と例外。',
      '【統合変更管理】==CCB==・影響評価・承認/却下・実装・検証・文書化の==ワークフロー==。',
      '【作業パフォーマンス】==データ → 情報 → 報告書==の3階層と生成プロセス。',
      '【知識管理】==形式知 vs 暗黙知==／==SECI モデル==（共同化・表出化・連結化・内面化）／==教訓登録簿==は==継続的==に更新。',
      '【契約形態】==請負契約==（成果物完成義務）vs ==準委任契約==（業務遂行義務）。アジャイルは==準委任==が一般的。',
      '【法律】==下請法==／==職務著作==（法人帰属）／==個人情報保護法==／==営業秘密==（不正競争防止法）。',
      '【ひっかけ】==FP vs CR==のリスク配分／==CPFF/CPIF/CPAF==の報酬決定方式／==9.5 vs 9.6==（チーム vs 物的資源）。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロセス・ITTO==は第6版、==パフォーマンス領域==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 6. デリバリー（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  delivery: {
    summary:
      'プロジェクトの==成果物==と==価値==を==十分かつ協調的==に提供する活動領域。PMBOK第6版では第8章「==品質マネジメント==」3プロセス＋第5章スコープ受入関連、第7版では「==デリバリー==」パフォーマンス領域として統合。==品質コスト（COQ）==・==7QC道具==・==PDCA==・==DoD==・==UAT==が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. デリバリーパフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「==デリバリー==」パフォーマンス領域は、==スコープ==と==品質==に着目し、==成果物と価値==を提供する活動を扱う',
          '__成果__:',
          '　==事業目標==への貢献',
          '　==計画通りの便益実現==',
          '　==合意された範囲==での価値提供',
          '　==ステークホルダーが受入れる品質==',
          '__主な検討事項__: スコープと要求／品質計画／受入基準／継続的価値提供／適応型vs予測型のデリバリー方式',
          '__PMBOK第6版での対応__: 第8章 品質マネジメント（3プロセス）＋第5章 スコープマネジメントの受入関連',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「デリバリー」パフォーマンス領域 / PMBOK第6版 第8章 品質マネジメント', style: 'navy' }]],
      },
      {
        heading: '2. 要求事項マネジメントと価値実現',
        items: [
          '==要求事項==は==デリバリーの起点==であり、価値実現の基準',
          '__要求事項の種類__:',
          '　==業務要求事項==（Business Requirements）: ビジネス価値・戦略目標',
          '　==ステークホルダー要求事項==（Stakeholder Requirements）: 個別ステークホルダーのニーズ',
          '　==ソリューション要求事項==（Solution Requirements）: 機能要求・非機能要求',
          '　==移行要求事項==（Transition Requirements）: 現状→新状態への移行ニーズ',
          '　==プロジェクト要求事項==／==品質要求事項==',
          '__価値実現__の流れ: 要求 → 設計 → 実装 → ==受入== → ==運用== → ==便益測定==',
          '==アジャイル==では==プロダクトオーナー==が価値判断責任を持つ（development-approach §18 参照）',
        ],
      },
      {
        heading: '3. PMBOK第6版「品質マネジメント」第8章 概観',
        items: [
          'PMBOK第6版 第8章 品質マネジメントは==3プロセス==で構成:',
          '　==8.1 品質マネジメント計画==（Plan Quality Management, 計画プロセス群）',
          '　==8.2 品質マネジメント==（Manage Quality, 実行プロセス群）',
          '　==8.3 品質コントロール==（Control Quality, 監視・コントロールプロセス群）',
          '__品質マネジメントの目的__: ==顧客満足==／==予防==／==継続的改善==／==マネジメント責任==',
          '__品質哲学の系譜__:',
          '　==デミング==（W. Edwards Deming）: 14原則・PDCA・赤玉実験',
          '　==ジュラン==（Joseph Juran）: 品質トリオロジー（計画・コントロール・改善）',
          '　==クロスビー==（Philip Crosby）: 「品質は無償」「ゼロ・デフェクト」',
          '　==石川馨==: 特性要因図（フィッシュボーン）／QCサークル',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第8章「品質マネジメント」', style: 'navy' }]],
      },
      // ── B. 要求とトレーサビリティ ──
      {
        heading: '4. 要求事項収集の技法',
        items: [
          '==5.2 要求事項収集==（planning §6 で詳細扱い済み、ここではデリバリー視点で再確認）',
          '__主要技法__:',
          '　==インタビュー==: 個別ヒアリング（構造化／非構造化）',
          '　==フォーカスグループ==: 6-12名のグループ討議',
          '　==ファシリテーション・ワークショップ==: JAD（Joint Application Design）／QFD（品質機能展開）',
          '　==ブレーンストーミング==／==親和図==／==マインドマップ==',
          '　==アンケート==／==観察==／==プロトタイピング==',
          '　==ベンチマーキング==',
          '　==コンテキスト・ダイアグラム==: システムと外部の境界を図示',
          '__QFD__（Quality Function Deployment）: 顧客要求を==品質特性に展開==する手法。==品質の家==（House of Quality）が中心',
        ],
      },
      {
        heading: '5. 要求事項トレーサビリティ・マトリクス（RTM）',
        items: [
          '==RTM==（Requirements Traceability Matrix）: 要求事項を==出自から実装・テストまで追跡==する表',
          '__主要記載項目__:',
          '　==要求ID==／==要求記述==',
          '　==出自==（誰のニーズか／ビジネスケース由来か）',
          '　==優先度==',
          '　==バージョン==（変更履歴）',
          '　==WBS要素==との対応',
          '　==設計成果物==との対応',
          '　==テストケース==との対応',
          '　==実装ステータス==',
          '__メリット__: ==変更影響分析==／==テストカバレッジ確認==／==スコープ・クリープ防止==',
          'RTM は==生きた文書==で、進行中も更新',
        ],
        navyItems: [[{ text: 'RTM は午前II・午後I 双方で頻出。「要求 → 設計 → 実装 → テスト」の追跡が機能', style: 'navy' }]],
      },
      {
        heading: '6. プロジェクト・スコープ vs プロダクト・スコープ',
        items: [
          '__プロジェクト・スコープ__（Project Scope）: ==プロジェクトとして実施する作業==の範囲',
          '　例: 設計・開発・テスト・導入・トレーニング',
          '__プロダクト・スコープ__（Product Scope）: ==成果物の機能と特徴==',
          '　例: ユーザログイン機能・レポート出力機能・性能要件',
          '__両者の関係__:',
          '　プロジェクト・スコープ ⊃ プロダクト・スコープ（プロジェクト作業の一部としてプロダクトを作る）',
          '　プロダクト・スコープが==変更される==とプロジェクト・スコープも==影響を受ける==',
          '__スコープ・クリープ__: ==未承認==のスコープ拡大。両スコープともに発生し得る',
          '試験頻出: 2つのスコープの==定義の違い==を問う設問',
        ],
      },
      // ── C. 品質マネジメント（PMBOK6 第8章） ──
      {
        heading: '7. 8.1 品質マネジメント計画',
        items: [
          '==8.1 品質マネジメント計画==（Plan Quality Management, 計画プロセス群）',
          '__目的__: ==品質要求事項==と==品質基準==を識別し、==品質マネジメントの方法==を文書化',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==データ収集==（ベンチマーキング・ブレーンストーミング・インタビュー）',
          '　==データ分析==（==コスト便益分析==・==品質コスト分析==）',
          '　==意思決定==（==多基準意思決定分析==）',
          '　==データ表現==（==フローチャート==・==ロジカル・データ・モデル==・==マトリクス図==・==マインドマップ==）',
          '　==テスト・検査計画==',
          '　==会議==',
          '__主要アウトプット__:',
          '　==品質マネジメント計画書==',
          '　==品質メトリクス==',
          '　==プロジェクトマネジメント計画書の更新==',
          '　==プロジェクト文書の更新==（==リスク登録簿==・==ステークホルダー登録簿==等）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §8.1', style: 'navy' }]],
      },
      {
        heading: '8. 8.2 品質マネジメント（実行）',
        items: [
          '==8.2 品質マネジメント==（Manage Quality, 実行プロセス群）',
          '__目的__: 品質計画書を==実行可能な品質活動==に変え、==組織の品質方針==を運用',
          '__技法__:',
          '　==データ収集==（チェックリスト）',
          '　==データ分析==（==代替案分析==・==文書分析==・==プロセス分析==・==根本原因分析==）',
          '　==意思決定==（==多基準意思決定分析==）',
          '　==データ表現==（==親和図==・==特性要因図==・==フローチャート==・==ヒストグラム==・==マトリクス図==・==散布図==）',
          '　==監査==（==品質監査==）: ==プロセス遵守==の独立評価',
          '　==X-functional design==（==X 機能設計==、品質設計の包括手法）',
          '　==問題解決==',
          '　==品質改善手法==（==PDCA==・==シックスシグマ==・==リーン==）',
          '__主要アウトプット__:',
          '　==品質報告書==',
          '　==テスト・評価文書==',
          '　==変更要求==',
        ],
      },
      {
        heading: '9. 8.3 品質コントロール（監視）',
        items: [
          '==8.3 品質コントロール==（Control Quality, 監視・コントロールプロセス群）',
          '__目的__: ==品質活動の結果==を==監視==し、==パフォーマンス評価==と==必要な変更の推奨==',
          '__技法__:',
          '　==データ収集==（==チェックリスト==・==チェックシート==・==統計的サンプリング==・==アンケート==）',
          '　==データ分析==（==パフォーマンス・レビュー==・==根本原因分析==）',
          '　==検査==',
          '　==テスト/評価==',
          '　==データ表現==（==特性要因図==・==管理図==・==ヒストグラム==・==散布図==）',
          '　==会議==',
          '__主要アウトプット__:',
          '　==品質コントロール測定==',
          '　==検証済みの成果物==',
          '　==作業パフォーマンス情報==',
          '　==変更要求==',
        ],
        navyItems: [[{ text: '8.2 vs 8.3 の混同に注意。8.2は「実行プロセス群」、8.3は「監視・コントロールプロセス群」', style: 'navy' }]],
      },
      {
        heading: '10. 品質マネジメント計画書と品質メトリクス',
        items: [
          '==品質マネジメント計画書==の構成要素:',
          '　==組織が採用する品質基準==',
          '　==プロジェクトの品質目標==',
          '　==品質に関する役割と責任==',
          '　==品質レビュー対象の成果物・プロセス==',
          '　==品質コントロール／品質管理の活動==',
          '　==使用される品質ツール==',
          '　==主要な手続きへの言及==（不適合の取り扱い・是正・継続的改善）',
          '==品質メトリクス==（Quality Metrics）: 品質を==定量的に測定==する基準',
          '　例: ==欠陥密度==（バグ数／KLOC）／==失敗率==／==適合率==／==テストカバレッジ==／==平均故障間隔==（MTBF）／==平均修復時間==（MTTR）',
          '__SMART原則__: メトリクスは==Specific==／==Measurable==／==Achievable==／==Relevant==／==Time-bound==',
        ],
      },
      {
        heading: '11. 品質・グレード・適合の概念',
        items: [
          '==品質==（Quality）: 製品やプロセスが==要求事項==を==満たしている度合==',
          '__品質の定義__（ISO 9000）: 「==本質的特性==の集まりが要求事項を満たす程度」',
          '==グレード==（Grade）: 同一機能の==機能特性のクラス==（例: 自動車のグレード、ホテルの星）',
          '__品質とグレードの関係__:',
          '　==高品質・低グレード== は==許容可能==（信頼性高いが機能が少ない）',
          '　==低品質== は==問題==（要求を満たさない）',
          '==適合==（Conformance）: ==仕様への準拠==',
          '==不適合==（Nonconformance）: 仕様からの==逸脱==',
          '==適合品質==（Quality of Conformance）: 設計仕様にどれだけ忠実か',
          '==設計品質==（Quality of Design）: 設計そのものの品質',
          '試験頻出: 品質とグレードの==違い==の説明問題',
        ],
        navyItems: [[{ text: '「品質はサービス／製品が要求を満たす程度、グレードは特性のクラス」と区別', style: 'navy' }]],
      },
      {
        heading: '12. 品質コスト（COQ, Cost of Quality）',
        items: [
          '==COQ==（Cost of Quality, 品質コスト）: ==品質に関する全コスト==',
          '__2大カテゴリ__:',
          '　==適合コスト==（Cost of Conformance）: 不適合を==防ぐコスト==',
          '　　==予防コスト==（Prevention Costs）: トレーニング・プロセス文書化・設備保守',
          '　　==評価コスト==（Appraisal Costs）: 検査・テスト・監査',
          '　==不適合コスト==（Cost of Nonconformance）: 不適合により==発生するコスト==',
          '　　==内部不良コスト==（Internal Failure Costs）: 手戻り・スクラップ・再テスト',
          '　　==外部不良コスト==（External Failure Costs）: 苦情対応・保証・訴訟・ブランド毀損',
          '__最適点__: 適合コストと不適合コストの==合計が最小==になる点',
          '__予防に投資__することで全体コストが下がる（フィリップ・クロスビー「==品質は無償==」）',
          '__1-10-100の法則__: 設計段階での修正コスト1、製造段階10、市場段階100',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §8.1.2.2 / Crosby「品質は無償」1979年', style: 'navy' }]],
      },
      // ── D. 品質ツール・技法 ──
      {
        heading: '13. 7QC道具（7つの基本ツール）',
        items: [
          '==7QC道具==（Seven Basic Tools of Quality）: 石川馨が体系化',
          '　==パレート図==（Pareto Chart）: 不良原因を==頻度順==で並べた棒グラフ＋累積曲線。==80-20の法則==',
          '　==特性要因図==（Cause-and-Effect Diagram, ==フィッシュボーン図==・==石川ダイアグラム==）: 結果と原因の関係',
          '　==チェックシート==（Check Sheet）: 観察結果を記録する定型用紙',
          '　==ヒストグラム==（Histogram）: 度数分布の棒グラフ',
          '　==散布図==（Scatter Diagram）: 2変量の相関',
          '　==管理図==（Control Chart）: 時系列データの==管理限界線==付き折れ線',
          '　==層別==（Stratification）: データを==グループに分類==して傾向分析',
          '__用途__: ==問題発見==／==原因分析==／==データ可視化==に幅広く使う',
          '試験頻出: 各ツールの==正確な名称==と==用途==の対応',
        ],
        navyItems: [[{ text: '7QC道具は午前II 必出。石川馨「品質管理入門」1965年が起源', style: 'navy' }]],
      },
      {
        heading: '14. 新7QC道具',
        items: [
          '==新7QC道具==（New Seven Tools）: 言語データを扱う7ツール（1979年提唱）',
          '　==親和図==（Affinity Diagram, ==KJ法==に近い）: 大量の情報を==類似性==でグループ化',
          '　==連関図==（Relations Diagram）: ==因果関係==が複雑な要素間の関係を矢印で結ぶ',
          '　==系統図==（Tree Diagram）: 目的→手段の==階層展開==',
          '　==マトリクス図==（Matrix Diagram）: 2軸の対応関係（==L型==・==T型==・==X型==・==Y型==）',
          '　==マトリクスデータ解析==（Matrix Data Analysis）: 多変量解析の一種',
          '　==PDPC==（Process Decision Program Chart）: 想定外事象への==対応シナリオ==',
          '　==アローダイアグラム==（Arrow Diagram, ==PERT/CPM==の図表現）',
          '__7QC道具との違い__:',
          '　7QC道具: ==数値データ==の分析',
          '　新7QC道具: ==言語データ==の整理・分析',
          '試験頻出: 7QC vs 新7QCの==扱うデータの違い==',
        ],
        navyItems: [[{ text: '新7QC道具は QC七つ道具の数値解析に対して言語解析を補完する位置づけ', style: 'navy' }]],
      },
      {
        heading: '15. PDCAサイクルとデミング14原則',
        items: [
          '==PDCAサイクル==（Plan-Do-Check-Act）: 継続的改善の基本サイクル',
          '　==Plan==（計画）: 目標設定・計画立案',
          '　==Do==（実行）: 計画に基づき実施',
          '　==Check==（評価）: 実施結果を計画と比較',
          '　==Act==（改善）: 評価に基づく標準化・是正',
          '__派生__: ==PDSA==（Plan-Do-Study-Act）／==OODA==（Observe-Orient-Decide-Act）',
          '==デミング14原則==（W. Edwards Deming）: 品質と生産性向上の14項目',
          '　代表的なもの:',
          '　　==目的の不変性==（製品・サービスの改善）',
          '　　==恐怖を取り除く==',
          '　　==部門間の障壁を取り除く==',
          '　　==スローガンを排する==（具体的方法を示す）',
          '　　==検査依存からの脱却==（プロセスで品質を作り込む）',
          '　　==成果主義からの脱却==（システム改善が主）',
          '__赤玉実験__: 個人の努力ではなく==システムの問題==が品質を決めることを示す実験',
        ],
        navyItems: [[{ text: 'デミング14原則は1986年「Out of the Crisis」で提唱。日本の品質向上に貢献', style: 'navy' }]],
      },
      {
        heading: '16. シックスシグマと DMAIC',
        items: [
          '==シックスシグマ==（Six Sigma）: モトローラ発、GE が普及させた==統計的品質改善手法==',
          '__目標__: ==100万機会あたり3.4不良==以下（±6σ）',
          '__σ（シグマ）__: ==標準偏差==。プロセスばらつきの尺度',
          '__シグマレベル__:',
          '　3σ: 99.7% 適合（30万不良／百万）',
          '　4σ: 99.99%',
          '　5σ: 99.9997%',
          '　==6σ==: 99.99966%（3.4不良／百万）',
          '==DMAIC==: 既存プロセス改善の5段階',
          '　==Define==（定義）: 問題・顧客要求・目標',
          '　==Measure==（測定）: 現状データ収集',
          '　==Analyze==（分析）: 根本原因特定',
          '　==Improve==（改善）: 解決策実装',
          '　==Control==（コントロール）: 改善維持',
          '==DMADV==: 新プロセス設計の5段階（Define-Measure-Analyze-Design-Verify）',
          '__役割__: ==チャンピオン==／==マスター・ブラックベルト==／==ブラックベルト==／==グリーンベルト==',
        ],
      },
      {
        heading: '17. 統計的品質管理（管理図・正規分布）',
        items: [
          '==統計的品質管理==（SQC, Statistical Quality Control）: 統計的手法によるプロセス管理',
          '==管理図==（Control Chart）:',
          '　==中心線==（CL, Central Line）: 平均値',
          '　==上方管理限界==（UCL, Upper Control Limit）= μ + 3σ',
          '　==下方管理限界==（LCL, Lower Control Limit）= μ - 3σ',
          '　管理限界外を==異常==と判定（==3σ管理==）',
          '__管理図の種類__:',
          '　==計量値管理図==: ==X-R図==（平均と範囲）・==X-s図==',
          '　==計数値管理図==: ==p図==（不良率）・==c図==（欠点数）',
          '__管理状態を示す8パターン__（西電気規則）:',
          '　1点が3σ外／連続7点が中心線同側／6点連続上昇 等',
          '==正規分布==: ±1σは68.27%、==±2σ==は95.45%、==±3σ==は99.73%',
          '__プロセス能力指数__: ==Cp==／==Cpk==（規格幅とばらつきの比）',
        ],
        navyItems: [[{ text: '3σ管理・正規分布のパーセンテージは午前II 計算問題で必出', style: 'navy' }]],
      },
      // ── E. 品質規格・モデル ──
      {
        heading: '18. ISO 9000シリーズ',
        items: [
          '==ISO 9000シリーズ==: 品質マネジメントシステムの==国際規格==',
          '__主要規格__:',
          '　==ISO 9000==: 基本概念・用語',
          '　==ISO 9001==: 品質マネジメントシステム要求事項（==認証対象==）',
          '　==ISO 9004==: パフォーマンス改善の指針',
          '　==ISO 19011==: 監査の指針',
          '__7つの品質マネジメント原則__（ISO 9001:2015）:',
          '　==顧客重視==',
          '　==リーダーシップ==',
          '　==人々の積極的参加==',
          '　==プロセス・アプローチ==',
          '　==改善==',
          '　==客観的事実に基づく意思決定==',
          '　==関係性管理==',
          '__PDCAとリスク思考__を要求事項に組み込む',
          '__JIS Q 9001__: ISO 9001の日本版',
        ],
        navyItems: [[{ text: 'ISO 9001:2015 は2015年改訂版。リスク思考が新規導入された', style: 'navy' }]],
      },
      {
        heading: '19. CMMI（能力成熟度モデル統合）',
        items: [
          '==CMMI==（Capability Maturity Model Integration）: ソフトウェア開発・サービス・調達の==プロセス成熟度モデル==',
          '__起源__: ==CMU/SEI==（カーネギーメロン大学ソフトウェア工学研究所）',
          '__成熟度レベル（5段階）__:',
          '　==レベル1 初期==（Initial）: プロセス未定義・個人依存',
          '　==レベル2 管理された==（Managed）: 基本的プロセス管理',
          '　==レベル3 定義された==（Defined）: 組織標準プロセス',
          '　==レベル4 定量的に管理された==（Quantitatively Managed）: 統計的管理',
          '　==レベル5 最適化された==（Optimizing）: 継続的改善',
          '__代表的なバージョン__:',
          '　==CMMI for Development==（CMMI-DEV）: 開発',
          '　==CMMI for Services==（CMMI-SVC）: サービス',
          '　==CMMI for Acquisition==（CMMI-ACQ）: 調達',
          '試験頻出: 成熟度レベルの==順序==と各レベルの特徴',
        ],
      },
      {
        heading: '20. JIS Q 9001:2015',
        items: [
          '==JIS Q 9001:2015==: ISO 9001:2015 の==日本工業規格版==',
          '__組織のコンテキスト__:',
          '　==外部・内部の課題==の決定',
          '　==利害関係者==のニーズと期待',
          '　==QMSの適用範囲==',
          '__リーダーシップ要求事項__:',
          '　経営者のコミットメント',
          '　==品質方針==',
          '　==組織の役割・責任・権限==',
          '__プロセス・アプローチ__:',
          '　==プロセス==の特定と適用',
          '　==プロセス間の相互関係==の管理',
          '　==PDCA==の各プロセスへの適用',
          '__リスクに基づく考え方__: ==機会の活用==と==リスクの抑制==',
          '__内部監査__: ==計画的な独立評価==',
          '__マネジメントレビュー__: 経営層による定期評価',
        ],
      },
      // ── F. アジャイル品質 ──
      {
        heading: '21. アジャイル品質（DoD・自動テスト・TDD）',
        items: [
          '==アジャイル品質==の特徴: ==継続的検証==・==早期フィードバック==・==チーム責任==',
          '==DoD==（Definition of Done, 完了の定義）: 「==完了==」とみなす==共通基準==',
          '　例: コーディング完了・コードレビュー済・単体テスト合格・統合テスト合格・ドキュメント更新済・受入基準合格',
          'スプリント単位で==厳格==に適用（development-approach §20 参照）',
          '==自動テスト==:',
          '　==単体テスト==（Unit Test）',
          '　==統合テスト==（Integration Test）',
          '　==システムテスト==',
          '　==受入テスト==',
          '　==回帰テスト==（Regression Test）: 既存機能の継続検証',
          '__テスティング・ピラミッド__: 単体（多）→ 統合（中）→ E2E（少）',
          '__テスト・カバレッジ__: ==文カバレッジ==／==分岐カバレッジ==／==条件カバレッジ==',
        ],
      },
      {
        heading: '22. CI/CD と品質の継続的検証',
        items: [
          '==CI/CD==（Continuous Integration / Continuous Delivery）: 品質の==継続的検証パイプライン==',
          '==CI==の要素:',
          '　==頻繁なコミット==（最低1日1回）',
          '　==自動ビルド==',
          '　==自動テスト==（単体・統合・回帰）',
          '　==静的解析==（==Lint==・==SonarQube==等）',
          '　==フィードバック==の即時通知',
          '==CD==の要素:',
          '　==自動デプロイ==',
          '　==ブルーグリーン・デプロイ==（無停止切替）',
          '　==カナリア・リリース==（段階的展開）',
          '　==フィーチャートグル==（機能の動的ON/OFF）',
          '==DevOps==との関係（development-approach §30 参照）',
          '__シフトレフト__（Shift Left）: 品質確認を==上流に==移す思想',
          '__シフトライト__（Shift Right）: 本番環境での観測強化',
        ],
        navyItems: [[{ text: 'CI/CD の詳細は development-approach §30 参照。本セクションは品質視点での扱い', style: 'navy' }]],
      },
      {
        heading: '23. TDD と BDD',
        items: [
          '==TDD==（Test-Driven Development, テスト駆動開発）: ==テストファースト==の開発手法',
          '__Red-Green-Refactor サイクル__:',
          '　==Red==: 失敗するテストを書く',
          '　==Green==: テストを通す最小限のコード',
          '　==Refactor==: コード構造を改善（テストは通したまま）',
          '__メリット__: 仕様の==明確化==／==デグレ防止==／==設計改善==',
          '==BDD==（Behavior-Driven Development, ビヘイビア駆動開発）: ==ユーザ行動==を中心にしたTDD拡張',
          '__Given-When-Then__形式:',
          '　==Given==（前提条件）',
          '　==When==（実行操作）',
          '　==Then==（期待結果）',
          '__代表ツール__: ==Cucumber==（BDD）／==JUnit/Jest==（TDD）',
          '==ATDD==（Acceptance Test-Driven Development）: 受入テストドリブン',
        ],
      },
      // ── G. 受入とサインオフ ──
      {
        heading: '24. 受入基準（Acceptance Criteria）',
        items: [
          '==受入基準==（Acceptance Criteria）: 成果物が==顧客に受入れられる条件==',
          '__標準フォーマット__:',
          '　==Given-When-Then==（BDD 風）',
          '　==チェックリスト==（条件箇条書き）',
          '　==機能仕様==＋==非機能要求==',
          '__非機能要求の例__:',
          '　==性能==（応答時間・スループット）',
          '　==可用性==（稼働率・MTBF）',
          '　==セキュリティ==（認証・暗号化・監査ログ）',
          '　==使用性==（UI/UX）',
          '　==移植性==／==保守性==',
          '__SMART な受入基準__: 具体的・測定可能・達成可能・関連性ある・期限付き',
          'ユーザストーリーごとに受入基準を定義（development-approach §21 参照）',
        ],
      },
      {
        heading: '25. UAT（User Acceptance Test, 受入テスト）',
        items: [
          '==UAT==（User Acceptance Test）: ==実ユーザ==による==最終受入テスト==',
          '__目的__: ==ビジネス要求==への適合確認',
          '__テスト・レベルの階層__（V字モデル参照、development-approach §8）:',
          '　==単体テスト==（UT）: 個別モジュール',
          '　==結合テスト==（IT）: モジュール間',
          '　==システムテスト==（ST）: システム全体',
          '　==受入テスト==（UAT/AT）: ユーザによる検証',
          '__UAT の種類__:',
          '　==アルファテスト==: 開発者環境で実施',
          '　==ベータテスト==: 限定ユーザ環境で実施',
          '　==運用受入テスト==（OAT）: 運用部門による検証',
          '　==契約受入テスト==（CAT）: 契約条件の確認',
          '__UAT の成果物__: ==テスト・シナリオ==／==テスト・データ==／==テスト結果報告書==／==サインオフ・ドキュメント==',
        ],
      },
      {
        heading: '26. プロジェクト終結とサインオフ',
        items: [
          '==4.7 プロジェクトまたはフェーズの終結==（Close Project or Phase, 終結プロセス群）',
          '__目的__: ==すべての活動==を==終結==し、==正式に完了==',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==データ分析==（==文書分析==・==回帰分析==・==トレンド分析==・==差異分析==）',
          '　==会議==',
          '__主要アウトプット__:',
          '　==プロジェクト文書の更新==（==教訓登録簿==最終化）',
          '　==最終成果物・サービスへの移行==',
          '　==最終報告書==',
          '　==OPAsの更新==',
          '__サインオフ__: ==顧客／スポンサー==の正式承認',
          '__プロジェクト終結チェックリスト__:',
          '　成果物完成・受入完了・契約終結・財務終結・リソース解放・教訓記録・最終報告',
          '__早期終結__（Early Closure）: ビジネス価値喪失や予算超過で途中終了する場合の手順',
        ],
      },
      {
        heading: '27. ベネフィット実現と効果測定',
        items: [
          '==ベネフィット実現マネジメント==（Benefits Realization Management）: プロジェクト==投資==が==ビジネス便益==を生むことを保証',
          '__ベネフィットの種類__:',
          '　==有形ベネフィット==: 売上増・コスト削減・収益向上（数値化可）',
          '　==無形ベネフィット==: ブランド向上・顧客満足度・従業員モラル（数値化困難）',
          '__ベネフィット実現サイクル__:',
          '　==特定==（Identify）: ビジネスケース策定時',
          '　==実現==（Realize）: プロジェクト実行中',
          '　==サステイン==（Sustain）: プロジェクト終結後の継続的実現',
          '　==測定==（Measure）: 定期的な効果検証',
          '__ベネフィット・マネジメント計画書__:',
          '　ベネフィット項目／測定指標／達成期限／担当オーナー／前提条件・依存関係',
          '__プロジェクト後__の評価（==ベネフィット・レビュー==）: 6ヶ月〜数年後の効果測定',
        ],
        navyItems: [[{ text: 'ベネフィット実現は PMBOK第7版で重要視される概念。プロジェクト「成果」と「価値」の橋渡し', style: 'navy' }]],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '28. 過去問頻出論点（午前II）',
        items: [
          '__7QC道具__: ==パレート図==・==特性要因図==・==管理図==・==ヒストグラム==・==散布図==・==チェックシート==・==層別==',
          '__新7QC道具__: ==親和図==・==連関図==・==系統図==・==マトリクス図==・==PDPC==・==アローダイアグラム==・==マトリクスデータ解析==',
          '__7QC vs 新7QC__: 数値データ vs 言語データ',
          '__品質コスト__: ==適合コスト==（予防・評価）vs ==不適合コスト==（内部不良・外部不良）。==1-10-100の法則==',
          '__品質 vs グレード__: 品質=要求充足度、グレード=機能特性のクラス',
          '__PDCAサイクル__: Plan-Do-Check-Act の継続的改善',
          '__DMAIC__: シックスシグマの5段階（Define-Measure-Analyze-Improve-Control）',
          '__3σ管理__: ==±3σ==は99.73%。プロセス能力指数 Cp/Cpk',
          '__CMMI 成熟度レベル__: 初期/管理/定義/定量的管理/最適化 の5段階',
          '__ISO 9001__: 7つの品質マネジメント原則／PDCAとリスク思考',
          '__DoD__: スクラムの完了の定義（development-approach §20 参照）',
          '__TDD__: Red-Green-Refactor サイクル',
          '__UAT__: 実ユーザによる最終受入テスト',
        ],
      },
      {
        heading: '29. ひっかけパターン',
        items: [
          '__7QC vs 新7QC__: 数値データ用 vs 言語データ用の混同',
          '__パレート図 vs ヒストグラム__: 不良原因の頻度順 vs 度数分布',
          '__特性要因図__: 別名「フィッシュボーン」「石川ダイアグラム」（同じもの）',
          '__予防コスト vs 評価コスト__: 予防=不良を防ぐ事前コスト、評価=検査による検出コスト',
          '__内部不良 vs 外部不良__: 出荷前 vs 出荷後',
          '__品質 vs グレード__: 品質は==要求充足度==、グレードは==機能のクラス==',
          '__8.2 vs 8.3__: 8.2=実行プロセス群、8.3=監視・コントロールプロセス群',
          '__DMAIC vs DMADV__: 既存プロセス改善 vs 新プロセス設計',
          '__σ レベル__: ==6σ==は3.4不良/百万、==3σ==は99.7%適合',
          '__TDD vs BDD__: テスト中心 vs ユーザ行動中心。Red-Green-Refactor vs Given-When-Then',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==7QC道具==（パレート図・特性要因図・管理図・ヒストグラム・散布図・チェックシート・層別）と==新7QC道具==の対比は午前II 必出。',
      '【品質コスト】==適合コスト==（予防＋評価）vs ==不適合コスト==（内部不良＋外部不良）。==1-10-100の法則==。',
      '【シックスシグマ】==DMAIC==（既存改善）vs ==DMADV==（新規設計）。==6σ==は3.4不良/百万。',
      '【統計】==3σ管理==は99.73%。プロセス能力指数 Cp/Cpk。管理限界 UCL/LCL。',
      '【規格】==ISO 9001:2015==の7原則と==PDCA+リスク思考==。==CMMI==の5成熟度レベル。',
      '【アジャイル品質】==DoD==／==TDD==（Red-Green-Refactor）／==BDD==（Given-When-Then）／==CI/CD==。',
      '【受入】==UAT==は実ユーザの最終受入。==アルファ==／==ベータ==／==OAT==／==CAT==の使い分け。',
      '【ベネフィット】プロジェクト==成果==と==ビジネス便益==の違い。実現サイクル（特定→実現→サステイン→測定）。',
      '【ひっかけ】==品質 vs グレード==／==予防 vs 評価==／==8.2 vs 8.3==／==DMAIC vs DMADV==の混同。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロセス・ITTO==は第6版、==パフォーマンス領域==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 7. 測定（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  measurement: {
    summary:
      'プロジェクトの==パフォーマンス==を==定量的==に測定し、==意思決定==と==継続的改善==を支援する活動領域。PMBOK第6版では第7章 EVM 中心、第7版では「==測定==」パフォーマンス領域として統合。==EVM 公式==（PV/EV/AC/CPI/SPI/EAC/ETC/VAC/TCPI）は午前II 最頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 測定パフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「==測定==」パフォーマンス領域は、==プロジェクトのパフォーマンス==を==監視・評価==し、==適切な対応==を取る活動を扱う',
          '__成果__:',
          '　==プロジェクト目標==に対する==進捗の信頼できる理解==',
          '　==意思決定のための実用的なデータ==',
          '　==適切な対応==（タイムリーかつ適切）',
          '　==プロジェクト目標==の達成',
          '__主な検討事項__: 何を測定するか／どう測定するか／誰に報告するか／頻度／予測の活用',
          '__PMBOK第6版での対応__: 第7章 コスト（EVM 中心）／第6章 スケジュール監視／第4章 統合監視',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「測定」パフォーマンス領域 / PMBOK第6版 §7.4 コストコントロール', style: 'navy' }]],
      },
      {
        heading: '2. メトリクスの分類',
        items: [
          '__メトリクス__（Metrics）: 定量的な==測定値==',
          '__主な分類軸__:',
          '　==成果メトリクス==（Outcome Metrics）: ==結果==に焦点（売上・顧客満足度・市場シェア）',
          '　==実行メトリクス==（Output Metrics）: ==活動==に焦点（作業時間・成果物数・テストケース数）',
          '__時間軸での分類__:',
          '　==リーディング指標==（Leading Indicator）: ==将来予測==の指標（先行指標）',
          '　　例: パイプライン件数、ユーザ獲得数（売上の先行指標）',
          '　==ラギング指標==（Lagging Indicator）: ==結果確定後==の指標（遅行指標）',
          '　　例: 売上、利益、顧客流出率',
          '__予測メトリクス__:',
          '　==EAC==（完成時総コスト予測）',
          '　==ETC==（残作業コスト予測）',
          '　==バーンレート==（消費速度）',
          '__プロセス・メトリクス__: ==プロセス品質==（不良率・サイクルタイム・スループット）',
        ],
      },
      {
        heading: '3. KPI と KRI の違い',
        items: [
          '==KPI==（Key Performance Indicator, 主要業績評価指標）: ==パフォーマンス==の==主要指標==',
          '　例: ==プロジェクト進捗率==・==コスト効率指数==（CPI）・==顧客満足度==',
          '__KPI の SMART 原則__:',
          '　==Specific==（具体的）',
          '　==Measurable==（測定可能）',
          '　==Achievable==（達成可能）',
          '　==Relevant==（関連性）',
          '　==Time-bound==（期限付き）',
          '==KRI==（Key Risk Indicator, 主要リスク指標）: ==リスク==の==主要指標==',
          '　例: ==離職率==・==バグ密度==・==スケジュール遅延日数==・==コスト超過率==',
          '__KPI vs KRI__:',
          '　KPI: 「==どれだけうまくいっているか==」を測る（業績指標）',
          '　KRI: 「==どれだけ危ない状況か==」を測る（リスク指標）',
          '__両者は相補的__: KPI が良くてもリスクが高まる場合あり',
        ],
        navyItems: [[{ text: 'KPI と KRI は経営報告で並列に使われる。KRI は主に uncertainty カテゴリと関連', style: 'navy' }]],
      },
      // ── B. EVM ──
      {
        heading: '4. EVM の基本概念（PV / EV / AC / BAC）',
        items: [
          '==EVM==（Earned Value Management, アーンドバリュー法）: ==スコープ・スケジュール・コスト==を統合管理する手法',
          '__4つの基本値__:',
          '　==PV==（Planned Value, 計画値）: ==当初計画==で==今までに完了しているはず==のコスト',
          '　　別名: ==BCWS==（Budgeted Cost of Work Scheduled）',
          '　==EV==（Earned Value, 出来高）: ==実際に完了した作業==の==当初計画コスト==',
          '　　別名: ==BCWP==（Budgeted Cost of Work Performed）',
          '　==AC==（Actual Cost, 実コスト）: ==実際に完了した作業==の==実際にかかったコスト==',
          '　　別名: ==ACWP==（Actual Cost of Work Performed）',
          '　==BAC==（Budget at Completion, 完成時総予算）: プロジェクト==全体==の==計画予算==',
          '__EV の計算方法__:',
          '　==0/100 法==: 完了時のみ100%',
          '　==50/50 法==: 開始時50%、完了時100%',
          '　==パーセント完了法==: 進捗率で按分',
          '　==重み付けマイルストーン法==: 主要マイルストーンに重み配分',
        ],
        navyItems: [[{ text: 'PV/EV/AC/BAC は EVM の最重要4値。午前II で必ず出題される', style: 'navy' }]],
      },
      {
        heading: '5. 差異分析（CV / SV）と健全性判定',
        items: [
          '__差異分析__の2指標:',
          '　==CV==（Cost Variance, コスト差異）= ==EV - AC==',
          '　　==CV > 0==: ==コスト節約==（予算より安く済んでいる）',
          '　　==CV < 0==: ==コスト超過==',
          '　==SV==（Schedule Variance, スケジュール差異）= ==EV - PV==',
          '　　==SV > 0==: ==スケジュール先行==',
          '　　==SV < 0==: ==スケジュール遅延==',
          '__健全性判定の組合せ__:',
          '　CV > 0 & SV > 0: ==順調==（コスト節約＋スケジュール先行）',
          '　CV > 0 & SV < 0: ==コスト節約だが遅延==（要因究明要）',
          '　CV < 0 & SV > 0: ==前倒しだがコスト超過==',
          '　CV < 0 & SV < 0: ==危機的==（コスト超過＋遅延）',
          '__単位__: CV/SV はコスト単位（円・ドル）',
        ],
      },
      {
        heading: '6. パフォーマンス効率指数（CPI / SPI）',
        items: [
          '__効率指数__の2指標:',
          '　==CPI==（Cost Performance Index, コスト効率指数）= ==EV / AC==',
          '　　==CPI > 1==: ==コスト効率良好==',
          '　　==CPI < 1==: ==コスト効率悪化==',
          '　==SPI==（Schedule Performance Index, スケジュール効率指数）= ==EV / PV==',
          '　　==SPI > 1==: ==スケジュール先行==',
          '　　==SPI < 1==: ==スケジュール遅延==',
          '__単位__: 比率（無次元）',
          '__利点__: CV/SV と違い==規模に依存しない==（プロジェクト間比較可）',
          '__注意__:',
          '　SPI は ==プロジェクト終盤==で==必ず 1==に近づく（EV→BAC、PV→BAC）',
          '　代替指標として==アーンドスケジュール（ES）==を使う場合あり（§9参照）',
          '試験頻出: CPI/SPI の==計算式==と==1を境とした判定==',
        ],
        navyItems: [[{ text: 'CPI = EV/AC、SPI = EV/PV。EVを分子にすることを暗記', style: 'navy' }]],
      },
      {
        heading: '7. 完了予測（EAC / ETC / VAC / TCPI）',
        items: [
          '__完了予測__の4指標:',
          '　==EAC==（Estimate at Completion, 完成時総コスト予測）',
          '　　最も一般的: ==EAC = BAC / CPI==（現在の効率が続く前提）',
          '　　他: ==EAC = AC + (BAC - EV)==（残作業が当初計画通り）',
          '　　効率継続: ==EAC = AC + (BAC - EV) / (CPI × SPI)==（コストと時間両方）',
          '　==ETC==（Estimate to Complete, 残作業コスト予測）= ==EAC - AC==',
          '　==VAC==（Variance at Completion, 完成時差異）= ==BAC - EAC==',
          '　　==VAC > 0==: ==BAC内で完了見込み==',
          '　==TCPI==（To-Complete Performance Index, 残作業効率指数）= ==(BAC - EV) / (BAC - AC)==',
          '　　==TCPI > 1==: 残作業で==より高い効率==が必要（厳しい）',
          '　　==TCPI < 1==: 残作業で==現在より緩い効率==で OK',
          '__BAC で完了させたい場合__: TCPI = (BAC - EV) / (BAC - AC)',
          '__EAC で完了させたい場合__: TCPI = (BAC - EV) / (EAC - AC)',
        ],
        navyItems: [[{ text: 'TCPI 計算は R6秋期 問4 で出題実績。TCPI=1.1 のような値が答え', style: 'navy' }]],
      },
      {
        heading: '8. EVM 計算式まとめ',
        items: [
          '__基本値__:',
          '　PV / EV / AC / BAC',
          '__差異__:',
          '　CV = EV - AC',
          '　SV = EV - PV',
          '__効率指数__:',
          '　CPI = EV / AC',
          '　SPI = EV / PV',
          '__完了予測__:',
          '　EAC = BAC / CPI（標準式）',
          '　EAC = AC + (BAC - EV)（残作業計画通り）',
          '　EAC = AC + (BAC - EV) / (CPI × SPI)（両方継続）',
          '　ETC = EAC - AC',
          '　VAC = BAC - EAC',
          '　TCPI = (BAC - EV) / (BAC - AC)（BAC維持）',
          '　TCPI = (BAC - EV) / (EAC - AC)（EAC維持）',
          '__暗記のコツ__:',
          '　==差は引き算==（CV/SV）／==効率は割り算==（CPI/SPI）',
          '　==分子は EV==（CV/SV/CPI/SPI すべて）',
        ],
        navyItems: [[{ text: '本セクションは午前II/午後I の計算問題の参照シート。全式暗記必須', style: 'navy' }]],
      },
      {
        heading: '9. アーンドスケジュール（ES）',
        items: [
          '==ES==（Earned Schedule, アーンドスケジュール）: SPI の==終盤収束問題==を解決する代替指標',
          '__問題意識__: 従来の SPI は==プロジェクト終盤==で必ず1に近づく（EV→BAC、PV→BAC）',
          '__ES の定義__: 現在の EV と==同等の値の PV==に達した==時点==',
          '__SV(t)__（Time-based SV）= ES - 現在の時点',
          '__SPI(t)__（Time-based SPI）= ES / 現在の時点',
          '__メリット__: ==時間単位==で表現でき、終盤でも有効',
          '__計算例__:',
          '　現在時点 t=10、EV=100。PV カーブで PV=100 になる時点が t=12。',
          '　→ ES=12、SV(t) = 12 - 10 = +2（2時間単位の先行）、SPI(t) = 12/10 = 1.2',
          '__使用は任意__。標準 EVM では SPI が一般的だが、長期プロジェクトでは ES 推奨',
        ],
        navyItems: [[{ text: 'ES は 2003年 Walter Lipke 提唱。PMBOK第6版で言及されているが、適用は組織判断', style: 'navy' }]],
      },
      {
        heading: '10. EVM の限界と適用条件',
        items: [
          '__EVM の限界__:',
          '　==スコープ変更に弱い==（ベースライン再設定が必要）',
          '　==品質測定なし==（量的測定のみ）',
          '　==SPI の終盤収束==（§9 参照）',
          '　==サブプロジェクト統合==が複雑',
          '　==設定コスト高==（適切なベースライン設定が必須）',
          '__適用条件__:',
          '　==スコープが明確==',
          '　==WBS が完備==',
          '　==コスト・ベースライン==が承認済',
          '　==進捗測定方法==が事前合意済（0/100法・パーセント完了法等）',
          '　==組織的成熟度==が十分（メトリクス文化）',
          '__代替手法__:',
          '　==アジャイル==: バーンダウン・ベロシティ・リリース予測（§11参照）',
          '　==カンバン==: リードタイム・スループット（§12参照）',
        ],
      },
      // ── C. スケジュール・進捗測定 ──
      {
        heading: '11. バーンダウン・バーンアップチャート',
        items: [
          'アジャイル開発で用いられる==進捗可視化チャート==',
          '==バーンダウン・チャート==（Burndown Chart）:',
          '　縦軸: ==残りストーリーポイント==（または残時間）',
          '　横軸: ==時間==（日／スプリント）',
          '　==右下がり==が理想',
          '　==水平==は進捗停滞、==上昇==はスコープ追加または手戻り',
          '==バーンアップ・チャート==（Burnup Chart）:',
          '　縦軸: ==完了量==と==総スコープ==の2線',
          '　==スコープ変更==が見えやすい（総スコープ線の上昇）',
          '__予測線__: ベロシティから将来の完了時期を予測',
          '__リリース・バーンダウン__: 複数スプリントを通じたリリース全体の進捗',
          '__スプリント・バーンダウン__: 1スプリント内の進捗',
          '試験頻出: バーンダウン読み取り（残作業ベース）／バーンアップとの違い',
        ],
        navyItems: [[{ text: 'バーンダウン/バーンアップは development-approach §22 でも扱う。本セクションはデータ視点', style: 'navy' }]],
      },
      {
        heading: '12. リードタイム・サイクルタイム・スループット',
        items: [
          '__リーン由来の3指標__（カンバンで重視）:',
          '　==リードタイム==（Lead Time）: ==顧客が要求してから受領するまで==の時間（顧客視点）',
          '　==サイクルタイム==（Cycle Time）: ==作業開始から完了まで==の時間（開発視点）',
          '　==スループット==（Throughput）: ==単位時間あたりの完了量==',
          '__リトルの法則__（Little\'s Law）: ==WIP = スループット × サイクルタイム==',
          '　WIP を下げると==サイクルタイムが下がる==（フロー効率向上）',
          '__最適化__:',
          '　==WIP制限==で過剰生産防止',
          '　==ボトルネック特定==（制約理論 TOC）',
          '　==カイゼン==で継続的改善',
          '__SLA との関係__:',
          '　==SLA==（Service Level Agreement）でリードタイム目標を設定',
          '　例: 「99%のチケットを48時間以内に解決」',
          'カンバンの詳細は development-approach §23 参照',
        ],
        navyItems: [[{ text: 'リトルの法則は午前II 計算問題で出題。WIP/スループット/リードタイム の関係を暗記', style: 'navy' }]],
      },
      {
        heading: '13. ベロシティとキャパシティ計画',
        items: [
          '==ベロシティ==（Velocity）: 1スプリントで完了した==ストーリーポイント==の合計',
          '__使い方__:',
          '　過去3〜5スプリントの==平均==で将来予測',
          '　==バーンダウン==の予測線に使用',
          '　==リリース計画==（リリース時期予測）',
          '__注意__:',
          '　==チーム固有の値==（チーム間比較は無意味）',
          '　==ストーリーポイント定義の安定性==が前提',
          '　==チーム構成変更==で再較正必要',
          '==キャパシティ計画==（Capacity Planning）:',
          '　チームメンバーの==稼働可能時間==×==稼働率==で利用可能リソースを算出',
          '　==休暇==・==トレーニング==・==会議==を控除',
          '　==サステナブル・ペース==（持続可能な速度）を維持',
          '__YOSO__（Yet One Standard Off）: スプリントごとに少量の余裕を持つ運用',
        ],
      },
      // ── D. 品質・成果測定 ──
      {
        heading: '14. 欠陥率と欠陥密度',
        items: [
          '==欠陥率==（Defect Rate）= ==欠陥数 / 検査数==',
          '__単位__: %（パーセント）または==DPMO==（Defects Per Million Opportunities, 百万あたり欠陥数）',
          '__シックスシグマ__: 3.4 DPMO（delivery §16 参照）',
          '==欠陥密度==（Defect Density）= ==欠陥数 / プロダクトサイズ==',
          '　例: ==バグ数 / KLOC==（千行コードあたりバグ数）',
          '　例: ==欠陥数 / ファンクションポイント==',
          '__業界ベンチマーク__:',
          '　==組込み==: 1-3 / KLOC',
          '　==商用ソフトウェア==: 5-50 / KLOC',
          '　==オープンソース==: バラツキ大',
          '__欠陥追跡__:',
          '　==欠陥報告==（バグレポート）',
          '　==重大度==（Severity）と==優先度==（Priority）',
          '　==解決時間==（MTTR, Mean Time To Repair）',
          '　==再オープン率==',
        ],
      },
      {
        heading: '15. 顧客満足度メトリクス（CSAT / NPS）',
        items: [
          '==CSAT==（Customer Satisfaction Score, 顧客満足度スコア）:',
          '　単一質問: 「==どれくらい満足ですか？==」（5段階または7段階）',
          '　計算: ==満足回答（4-5）の割合==',
          '　短期的・取引単位の評価に適す',
          '==NPS==（Net Promoter Score, 推奨度スコア）:',
          '　単一質問: 「==知人に推奨しますか？==」（0-10点）',
          '　==推奨者==（Promoters, 9-10）',
          '　==中立者==（Passives, 7-8）',
          '　==批判者==（Detractors, 0-6）',
          '　計算: ==NPS = 推奨者%% - 批判者%%==（中立者は計算除外）',
          '　範囲: ==-100 〜 +100==',
          '==CES==（Customer Effort Score, 顧客努力スコア）: タスク完了の容易さ',
          '__選択ガイド__:',
          '　CSAT: 短期・取引評価／NPS: 長期ロイヤリティ／CES: 体験のしやすさ',
        ],
        navyItems: [[{ text: 'NPS は Bain & Company が2003年に提唱。多くの企業が標準採用', style: 'navy' }]],
      },
      {
        heading: '16. プロダクトメトリクス（DAU/MAU/解約率）',
        items: [
          '__SaaS／プロダクトでよく使われる指標__:',
          '　==DAU==（Daily Active Users, デイリーアクティブユーザ）: 1日の利用者数',
          '　==MAU==（Monthly Active Users, マンスリーアクティブユーザ）: 1ヶ月の利用者数',
          '　==DAU/MAU 比率==: ==スティッキネス==（粘着度）、20-50% が良好',
          '　==解約率==（Churn Rate）= ==解約顧客数 / 期初顧客数==',
          '　　月次解約率1% = 年間 約12% 解約',
          '　==継続率==（Retention Rate）= 1 - 解約率',
          '　==LTV==（Customer Lifetime Value, 顧客生涯価値）= ==平均月次収入 / 解約率==',
          '　==CAC==（Customer Acquisition Cost, 顧客獲得コスト）',
          '　==LTV/CAC 比==: ==3:1==以上が健全（SaaS基準）',
          '　==コンバージョン率==（Conversion Rate）: 行動完了率',
          '__プロダクト・アナリティクス__: Google Analytics・Mixpanel・Amplitude 等',
        ],
      },
      // ── E. 戦略的測定 ──
      {
        heading: '17. バランススコアカード（BSC）',
        items: [
          '==BSC==（Balanced Scorecard, バランススコアカード）: ==戦略実行==のための==多次元評価フレームワーク==（Kaplan & Norton, 1992年）',
          '__4つの視点__:',
          '　==財務の視点==（Financial Perspective）: 株主への価値（売上・利益・ROE）',
          '　==顧客の視点==（Customer Perspective）: 顧客満足・市場シェア・顧客維持率',
          '　==業務プロセスの視点==（Internal Process）: 業務効率・品質・革新',
          '　==学習と成長の視点==（Learning & Growth）: 従業員スキル・組織能力・情報技術',
          '__戦略マップ__: 4視点間の==因果関係==を矢印で図示',
          '__KPI 設定__: 各視点で ==SMART== な目標と指標を設定',
          '__メリット__:',
          '　==短期 vs 長期==・==財務 vs 非財務==・==遅行 vs 先行==指標のバランス',
          '　==戦略と日々の業務==を繋ぐ',
        ],
        navyItems: [[{ text: 'BSC は Robert Kaplan and David Norton 1992年論文・1996年書籍で体系化', style: 'navy' }]],
      },
      {
        heading: '18. OKR（Objectives and Key Results）',
        items: [
          '==OKR==（Objectives and Key Results, 目標と主要結果）: Intel発祥、Google が普及させた==目標管理フレームワーク==',
          '__構造__:',
          '　==Objective==（目標）: ==定性的==で==野心的==な目標（3-5個）',
          '　==Key Results==（主要結果）: ==定量的==に測定可能な達成基準（各目標に3-5個）',
          '__例__:',
          '　Objective: 「業界トップのカスタマーサポート品質を達成する」',
          '　KR1: 顧客満足度を 80% から 95% に引き上げ',
          '　KR2: 平均応答時間を 24時間から 2時間に短縮',
          '　KR3: NPS を 30 から 60 に向上',
          '__特徴__:',
          '　==透明性==（全社員に公開）',
          '　==野心的目標==（70% 達成が標準、100% は野心不足）',
          '　==四半期ごとの設定==',
          '　==報酬と切り離す==（評価は別仕組み）',
          '__BSC との違い__:',
          '　BSC: 多次元の==バランス==重視／OKR: ==野心的な単一目標==重視',
        ],
        navyItems: [[{ text: 'OKR は John Doerr「Measure What Matters」2018年で広く普及。Andrew Grove が Intel で実践', style: 'navy' }]],
      },
      {
        heading: '19. 経済性評価（NPV / ROI / IRR / 回収期間）',
        items: [
          '__プロジェクト選定の経済性評価指標__（planning §24 参照）:',
          '　==NPV==（Net Present Value, 正味現在価値）',
          '　　将来キャッシュフローを==現在価値==に==割引==した合計',
          '　　==NPV > 0==: 採算あり',
          '　==ROI==（Return on Investment, 投資収益率）= (==利益 - 投資==) / ==投資==',
          '　　==高いほど==良い',
          '　==IRR==（Internal Rate of Return, 内部収益率）: ==NPV = 0==となる==割引率==',
          '　　==IRR > 資本コスト==: 採算あり',
          '　==回収期間==（Payback Period）: 投資を==回収==するまでの==期間==',
          '　　==短いほど==良い（ただし回収後の利益を考慮しない欠点）',
          '__単純回収期間 vs 割引回収期間__:',
          '　単純: ==割引なし==で計算',
          '　割引: ==NPV ベース==で計算',
          '__使い分け__:',
          '　==NPV==: 規模が違うプロジェクトの比較に適す',
          '　==IRR==: 投資効率の比較に適す',
          '　==回収期間==: ==流動性==重視時に有用',
          '試験頻出: ==NPV計算==／==IRR と資本コスト==の関係',
        ],
        navyItems: [[{ text: '経済性評価の詳細は planning §24 参照。本セクションは測定視点での再確認', style: 'navy' }]],
      },
      // ── F. パフォーマンス・レポート ──
      {
        heading: '20. 報告書の種類',
        items: [
          'project-work §18 参照。本セクションは測定視点でのまとめ',
          '__4つの主要報告書__:',
          '　==ステータス・レポート==（Status Report）: ==現時点==の状況（進捗・コスト・品質・リスク・問題）',
          '　==トレンド・レポート==（Trend Report）: ==時系列==の==傾向==（改善／悪化）',
          '　==予測レポート==（Forecast Report）: ==将来予測==（EAC／ETC／完了時期）',
          '　==バリアンス・レポート==（Variance Report）: ==計画 vs 実績==の==差異==（CV／SV）',
          '__配信頻度__: 計画書で定義（==週次==／==月次==／==フェーズ末==）',
          '__配信形式__: ==メール==／==ダッシュボード==／==対面会議==',
          '__配信対象__: ==ステークホルダー登録簿==に基づき特定（stakeholder §19 参照）',
          '__コミュニケーション計画書__で報告ルールを事前定義（project-work §15 参照）',
        ],
      },
      {
        heading: '21. ダッシュボードと可視化',
        items: [
          '==ダッシュボード==: ==KPI/メトリクス==を==一画面==で可視化',
          '__種類__:',
          '　==運用ダッシュボード==（Operational）: リアルタイム監視',
          '　==分析ダッシュボード==（Analytical）: 詳細データ分析',
          '　==戦略ダッシュボード==（Strategic）: 経営判断用（BSC ベース）',
          '__可視化のベストプラクティス__:',
          '　==目的に応じた表現==（折れ線=時系列／棒=比較／円=構成比／散布=相関）',
          '　==1ページに収める==（スクロール不要）',
          '　==重要指標を上部・左上==に配置',
          '　==RAG ステータス==（Red/Amber/Green）で直感的判定',
          '　==色だけでなくラベル==も付ける（アクセシビリティ）',
          '　==更新時刻==を明示',
          '__ツール例__: ==Tableau==／==Power BI==／==Looker==／==Grafana==',
          '__PMIS__（プロジェクトマネジメント情報システム）の中核機能',
        ],
      },
      {
        heading: '22. パフォーマンス・レビュー会議',
        items: [
          '__主要なレビュー会議__:',
          '　==デイリースタンドアップ==（Daily Stand-up）: 15分、進捗・障害の共有（アジャイル）',
          '　==スプリント・レビュー==: スプリント末、ステークホルダー含めて成果確認',
          '　==スプリント・レトロスペクティブ==: チーム内、プロセス改善',
          '　==ステアリングコミッティ==（Steering Committee）: 経営判断・主要意思決定（月次）',
          '　==プロジェクト・レビュー==（Project Review）: フェーズゲートでの go/no-go 判定',
          '　==マネジメント・レビュー==: 経営層による定期評価（ISO 9001 要求事項）',
          '__効果的なレビュー会議の原則__:',
          '　==データ駆動==（事実に基づく議論）',
          '　==アクション指向==（次の手を決める）',
          '　==タイムボックス==（時間内に終わる）',
          '　==役割明確==（議長・記録・参加者）',
          '　==フォローアップ==（決定事項の追跡）',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '23. 過去問頻出論点（午前II）',
        items: [
          '__EVM 基本値__: ==PV==・==EV==・==AC==・==BAC== の定義と計算',
          '__EVM 差異__: ==CV== = EV-AC、==SV== = EV-PV',
          '__EVM 効率指数__: ==CPI== = EV/AC、==SPI== = EV/PV',
          '__EVM 完了予測__: ==EAC==・==ETC==・==VAC==・==TCPI== の公式',
          '__TCPI 計算__: ==(BAC-EV)/(BAC-AC)==（R6秋期 問4 で出題）',
          '__バーンダウン__: 残作業の時系列読み取り',
          '__リトルの法則__: ==WIP = スループット × リードタイム==',
          '__カンバン__: WIP制限／プル方式',
          '__顧客満足度__: ==NPS== = 推奨者% - 批判者%',
          '__BSC__: 4視点（財務／顧客／業務プロセス／学習と成長）',
          '__OKR__: Objectives（定性的）と Key Results（定量的）',
          '__経済性評価__: NPV / IRR / 回収期間（planning §24 参照）',
          '__3σ管理__: ==±3σ==は99.73% 適合（delivery §17 参照）',
        ],
      },
      {
        heading: '24. ひっかけパターン',
        items: [
          '__PV vs EV vs AC__: PV=計画、EV=出来高（の計画コスト）、AC=実コスト',
          '__CV vs SV__: CV=コスト差異、SV=スケジュール差異。両方とも==EV - X==の形',
          '__CPI vs SPI__: 両方とも==EV を分子==（EV/AC、EV/PV）',
          '__EAC の3公式__: 状況に応じた使い分け（標準／残作業計画通り／両方継続）',
          '__TCPI の分母__: BAC 維持なら ==(BAC-AC)==、EAC 維持なら ==(EAC-AC)==',
          '__SPI の限界__: 終盤で必ず1に近づく（ES が代替）',
          '__リーディング vs ラギング__: リーディング=先行指標、ラギング=遅行指標',
          '__KPI vs KRI__: 業績指標 vs リスク指標',
          '__CSAT vs NPS__: 単発満足 vs ロイヤリティ',
          '__BSC vs OKR__: 多次元バランス vs 野心的目標',
          '__リトルの法則__: ==WIP = スループット × リードタイム==（順序に注意）',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・EVM】==PV/EV/AC/BAC== の定義と==CV/SV/CPI/SPI/EAC/ETC/VAC/TCPI== の公式を全暗記。午前II/午後I 双方で計算問題が必出。',
      '【EVM 計算暗記】==CV=EV-AC==、==SV=EV-PV==、==CPI=EV/AC==、==SPI=EV/PV==。==分子は常に EV==。',
      '【TCPI】==BAC維持==なら ==(BAC-EV)/(BAC-AC)==、==EAC維持==なら ==(BAC-EV)/(EAC-AC)==。R6秋期 問4 の出題実績。',
      '【EAC 3公式】標準=BAC/CPI、残作業計画通り=AC+(BAC-EV)、両方継続=AC+(BAC-EV)/(CPI×SPI)。',
      '【リトルの法則】==WIP = スループット × リードタイム==。WIP制限でリードタイム短縮。',
      '【NPS】==推奨者(9-10) - 批判者(0-6) の割合==。中立者(7-8)は計算除外。範囲 -100〜+100。',
      '【BSC】4視点（==財務==／==顧客==／==業務プロセス==／==学習と成長==）と==戦略マップ==の因果関係。',
      '【OKR】Objective（定性・野心的）と Key Results（定量・3-5個）。==70%達成==が標準（野心的）。',
      '【経済性】NPV計算（割引）／IRR と資本コストの関係／回収期間の長短評価（planning §24 参照）。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==EVM プロセス==は第6版 §7.4、==測定パフォーマンス領域==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 8. 不確かさ・リスク（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  uncertainty: {
    summary:
      '==リスク==（不確かな事象が発生した場合の影響）と==機会==（プラスのリスク）を==識別==・==分析==・==対応==・==監視==する活動領域。PMBOK第6版では第11章「==リスクマネジメント==」7プロセス、第7版では「==不確かさ==」パフォーマンス領域。==確率影響度マトリクス==・==EMV==・==脅威/機会5戦略==が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 不確かさパフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「==不確かさ==」パフォーマンス領域は、==リスク==・==曖昧さ==・==複雑性==・==変動性==を扱う',
          '__成果__:',
          '　==不確かさ==の認識',
          '　==プラス／マイナス==両方のリスクへの対応',
          '　==プロジェクト==が事業環境の不確かさに耐える能力',
          '__主な検討事項__:',
          '　==一般的環境==の不確かさ（市場・規制・技術変化）',
          '　==プロジェクト固有==の不確かさ（要件・リソース・依存関係）',
          '　==機会==の活用と==脅威==の管理',
          '__PMBOK第6版での対応__: 第11章 リスクマネジメント 7プロセス（11.1〜11.7）',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「不確かさ」パフォーマンス領域 / PMBOK第6版 第11章 リスクマネジメント', style: 'navy' }]],
      },
      {
        heading: '2. リスクの定義（脅威と機会）',
        items: [
          '==リスク==（Risk）: ==不確かな事象==が==発生した場合==に==プロジェクト目標==に==影響を与える==事象または状態',
          '__2種類のリスク__:',
          '　==脅威==（Threat, マイナスリスク）: ==悪影響==を与えるリスク',
          '　==機会==（Opportunity, プラスリスク）: ==好影響==を与えるリスク',
          '__3要素__:',
          '　==事象==（Event）: 何が起こるか',
          '　==原因==（Cause）: 何故起こるか',
          '　==影響==（Impact / Effect）: 起きたらどうなるか',
          '__確率と影響度__:',
          '　==確率==（Probability）: 発生可能性（0-100%）',
          '　==影響度==（Impact）: 発生時の影響の大きさ',
          '　==リスク・スコア==（Risk Score）= ==確率 × 影響度==',
          '__個別リスク__と==プロジェクト全体リスク==の区別（後者はポートフォリオ視点）',
        ],
        navyItems: [[{ text: '「脅威」「機会」両方を扱うのが PMBOK の特徴。日常では「リスク=脅威」と捉えがちなひっかけ', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第6版 第11章 リスクマネジメント 7プロセス',
        items: [
          'PMBOK第6版 第11章は==7プロセス==で構成:',
          '　==11.1 リスクマネジメント計画==（Plan Risk Management, 計画プロセス群）',
          '　==11.2 リスクの特定==（Identify Risks, 計画プロセス群）',
          '　==11.3 定性的リスク分析==（Perform Qualitative Risk Analysis, 計画プロセス群）',
          '　==11.4 定量的リスク分析==（Perform Quantitative Risk Analysis, 計画プロセス群）',
          '　==11.5 リスク対応計画==（Plan Risk Responses, 計画プロセス群）',
          '　==11.6 リスク対応策の実行==（Implement Risk Responses, 実行プロセス群）',
          '　==11.7 リスクの監視==（Monitor Risks, 監視・コントロールプロセス群）',
          '__プロセス群分布__: ==計画== 5プロセス（11.1-11.5）／==実行== 1プロセス（11.6）／==監視== 1プロセス（11.7）',
          '__11.6 は PMBOK第6版で新設__（旧第5版にはなかった）',
          '試験頻出: ==プロセス群所属==の判別問題',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第11章。11.6 は2017年改訂で新設', style: 'navy' }]],
      },
      // ── B. リスク特定 ──
      {
        heading: '4. 11.1 リスクマネジメント計画',
        items: [
          '==11.1 リスクマネジメント計画==（Plan Risk Management, 計画プロセス群）',
          '__目的__: リスク管理活動の==実施方法==を==定義==',
          '__主要技法__: 専門家の判断／データ分析／会議',
          '__主要アウトプット__: ==リスクマネジメント計画書==',
          '__計画書の構成要素__:',
          '　==リスクの戦略==',
          '　==方法論==',
          '　==役割と責任==',
          '　==資金調達==',
          '　==タイミング==',
          '　==リスク・カテゴリ==（==RBS==）',
          '　==リスクの確率と影響度の定義==',
          '　==確率影響度マトリクス==',
          '　==報告のフォーマット==',
          '　==追跡==',
          '__リスク選好__（Risk Appetite）・==リスク許容度==（Risk Tolerance）・==リスク・スレッショルド==（Risk Threshold）を計画書で定義',
        ],
      },
      {
        heading: '5. 11.2 リスクの特定（RBS・SWOT・プロンプトリスト）',
        items: [
          '==11.2 リスクの特定==（Identify Risks, 計画プロセス群）',
          '__主要技法__:',
          '　==データ収集==:',
          '　　==ブレーンストーミング==',
          '　　==チェックリスト==（過去プロジェクトの教訓）',
          '　　==インタビュー==',
          '　==データ分析==:',
          '　　==根本原因分析==（Root Cause Analysis）',
          '　　==前提条件・制約条件分析==',
          '　　==SWOT==（Strengths/Weaknesses/Opportunities/Threats）',
          '　　==文書分析==',
          '　==対人スキル==: ファシリテーション',
          '　==プロンプトリスト==:',
          '　　==PESTLE==（Political/Economic/Social/Technological/Legal/Environmental）',
          '　　==TECOP==（Technical/Environmental/Commercial/Operational/Political）',
          '　　==VUCA==（Volatility/Uncertainty/Complexity/Ambiguity）',
          '__主要アウトプット__: ==リスク登録簿==・==リスク・レポート==',
        ],
        navyItems: [[{ text: 'プロンプトリストはリスク特定の網羅性を高めるためのフレームワーク。試験頻出', style: 'navy' }]],
      },
      {
        heading: '6. RBS（リスク・ブレークダウン・ストラクチャー）',
        items: [
          '==RBS==（Risk Breakdown Structure, リスク・ブレークダウン・ストラクチャー）: リスクを==カテゴリ別==に==階層分解==した図',
          '__典型的なカテゴリ__:',
          '　==技術リスク==（Technical Risks）: 要件・技術・性能・品質',
          '　==外部リスク==（External Risks）: 規制・市場・顧客・天候',
          '　==組織リスク==（Organizational Risks）: 資源・優先度・依存関係',
          '　==プロジェクトマネジメントリスク==（Project Management Risks）: 見積もり・計画・コミュニケーション',
          '__メリット__:',
          '　==網羅性==の確保（特定漏れ防止）',
          '　==カテゴリ別==の優先順位付け',
          '　==組織横断的==な知識共有',
          '__WBS との対比__:',
          '　WBS: ==作業==を分解',
          '　RBS: ==リスク==を分解',
          '__利用タイミング__: 11.1 計画段階で定義、11.2 特定で参照',
        ],
        navyItems: [[{ text: 'RBS は WBS と並ぶブレークダウン構造。planning §25 でも触れる', style: 'navy' }]],
      },
      // ── C. 定性的・定量的分析 ──
      {
        heading: '7. 11.3 定性的リスク分析と確率影響度マトリクス',
        items: [
          '==11.3 定性的リスク分析==（Perform Qualitative Risk Analysis, 計画プロセス群）',
          '__目的__: 個別リスクの==確率==と==影響度==を==評価==し、==優先順位==を付ける',
          '__主要技法__:',
          '　==データ収集==（インタビュー）',
          '　==データ分析==: ==リスクデータ品質評価==／==リスク確率影響度評価==／==他のリスクパラメータ評価==',
          '　==対人スキル==: ファシリテーション',
          '　==リスク分類==',
          '　==データ表現==: ==確率影響度マトリクス==',
          '　==階層図==',
          '==確率影響度マトリクス==:',
          '　縦軸: ==確率==（低-中-高 または 1-3-5）',
          '　横軸: ==影響度==（低-中-高 または 1-3-5）',
          '　セル: ==確率 × 影響度==の積で==リスク・スコア==',
          '　==RAG==（Red/Amber/Green）色分けで優先度視覚化',
          '__主要アウトプット__: ==リスク登録簿の更新==・==リスク・レポートの更新==',
        ],
        navyItems: [[{ text: '確率影響度マトリクスは午前II/午後I 頻出。RAG 区分の判断が出る', style: 'navy' }]],
      },
      {
        heading: '8. 11.4 定量的リスク分析',
        items: [
          '==11.4 定量的リスク分析==（Perform Quantitative Risk Analysis, 計画プロセス群）',
          '__目的__: 個別リスクと==プロジェクト全体リスク==を==数値化==',
          '__主要技法__:',
          '　==データ収集==（インタビュー）',
          '　==データ分析==:',
          '　　==シミュレーション==（==モンテカルロ法==）',
          '　　==感度分析==（==トルネード図==）',
          '　　==決定木分析==',
          '　　==影響度ダイアグラム==',
          '__主要アウトプット__:',
          '　==プロジェクト文書の更新==（リスク・レポート）',
          '　==プロジェクト全体リスク・エクスポージャ==',
          '　==詳細な確率分析==',
          '　==推奨対応策の優先順位==',
          '__定性 vs 定量__:',
          '　==定性==: ==すべてのリスク==が対象、確率影響度マトリクスで優先順位',
          '　==定量==: ==重要リスク==のみ対象、数値で確率分布・影響額を算出',
          '__注意__: 11.4 は==省略可能==。コスト・複雑性が見合うプロジェクトのみ',
        ],
        navyItems: [[{ text: '11.3 と 11.4 の対象範囲（全リスク vs 重要リスク）と数値化の有無を区別', style: 'navy' }]],
      },
      {
        heading: '9. 期待金額価値（EMV）と決定木分析',
        items: [
          '==EMV==（Expected Monetary Value, 期待金額価値）: リスクの==期待値==を==金額==で表現',
          '__計算式__: ==EMV = 確率 × 影響額==',
          '__脅威の EMV__: ==マイナスの値==（コスト増）',
          '__機会の EMV__: ==プラスの値==（コスト減・利益）',
          '__合計 EMV__: 全リスクの EMV を合計（プラスとマイナスを通算）',
          '==決定木分析==（Decision Tree Analysis）: ==選択肢ごとの EMV==を計算して==最適な選択肢==を選ぶ',
          '__決定木の構成要素__:',
          '　==決定ノード==（四角）: 意思決定の分岐',
          '　==確率ノード==（円）: 不確実な分岐',
          '　==末端ノード==（三角）: 最終結果（金額）',
          '__計算手順__:',
          '　1. 末端から==EMV==を計算',
          '　2. 確率ノードで==確率×金額==の合計',
          '　3. 決定ノードで==最大 EMV==の選択肢を選ぶ',
          '試験頻出: EMV 計算問題・決定木計算問題',
        ],
        navyItems: [[{ text: 'EMV/決定木は午前II 計算問題で頻出。状況設定から最適選択肢を求める', style: 'navy' }]],
      },
      {
        heading: '10. モンテカルロ法と感度分析',
        items: [
          '==モンテカルロ法==（Monte Carlo Simulation）: ==乱数==を使って==確率分布==を生成するシミュレーション手法',
          '__プロジェクトでの用途__:',
          '　==スケジュール==: 各アクティビティ所要時間の==確率分布==から完了日の==確率分布==を導出',
          '　==コスト==: 各コスト要素の確率分布から総コストの確率分布を導出',
          '__主要アウトプット__:',
          '　==S字曲線==（累積確率分布）',
          '　==確実度==（例: P50 = 50% で達成可能な値）',
          '　==P80==・==P90==等のリスク許容度に応じた値',
          '__典型例__: 「==P80== の完了日」= 80% の確率で間に合う日付',
          '==感度分析==（Sensitivity Analysis）: ==どのリスクが==プロジェクト目標に==最も影響するか==を分析',
          '__トルネード図__（Tornado Diagram）: 要因別の影響度を==棒グラフ==で長い順に並べた図（竜巻型）',
          '　==上位リスク==に==優先対応==',
          '__両者は補完的__: モンテカルロ=全体予測、感度分析=要因識別',
        ],
      },
      {
        heading: '11. プロジェクト全体リスク（Overall Project Risk）',
        items: [
          '==プロジェクト全体リスク==: ==個別リスク==の==集合体==としてのリスク',
          '__個別リスク__: 1つのアクション・要素に関するリスク',
          '__全体リスク__: プロジェクト==全体の不確かさ==（=全個別リスクの相互作用）',
          '__指標__:',
          '　==累積コスト超過確率==',
          '　==累積スケジュール遅延確率==',
          '　==成功確率==',
          '__管理方法__:',
          '　==ポートフォリオ==・==プログラム==レベルでの統合',
          '　==プロジェクトバッファ==の確保',
          '　==早期警戒システム==の構築',
          '__全体リスクの監視__: ==ステアリングコミッティ==で経営判断',
          'PMBOK第6版で==明示的に概念化==された（旧版は個別リスクのみ）',
        ],
        navyItems: [[{ text: 'PMBOK第6版 §11.0 で導入された新概念。個別リスクの集合では捉えきれない相互作用を扱う', style: 'navy' }]],
      },
      // ── D. リスク対応 ──
      {
        heading: '12. 11.5 リスク対応計画',
        items: [
          '==11.5 リスク対応計画==（Plan Risk Responses, 計画プロセス群）',
          '__目的__: 個別リスクと全体リスクへの==対応戦略==を==選定==・==計画==',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==データ収集==（インタビュー）',
          '　==対人スキル==: ファシリテーション',
          '　==脅威への戦略==（5つ、§13参照）',
          '　==機会への戦略==（5つ、§14参照）',
          '　==コンティンジェント対応戦略==',
          '　==全体リスクへの戦略==',
          '　==データ分析==: ==代替案分析==・==コスト便益分析==・==決定分析==',
          '　==意思決定==: ==多基準意思決定分析==',
          '__主要アウトプット__:',
          '　==変更要求==（対応策実装のため）',
          '　==プロジェクト文書の更新==',
          '　==計画書の更新==',
          '__リスク・オーナー__: 各リスクに==担当者==を割り当て',
        ],
      },
      {
        heading: '13. 脅威への5戦略',
        items: [
          '__PMBOK第6版が定める脅威（マイナスリスク）への5戦略__:',
          '　==1. 回避==（Avoid）: ==脅威の原因を除去==（スコープ縮小・代替技術採用等）',
          '　==2. 転嫁==（Transfer）: ==第三者に責任を移転==（保険・契約条項・アウトソース）',
          '　==3. 軽減==（Mitigate）: 確率または影響度を==下げる==（プロトタイプ・予備プラン）',
          '　==4. 受容==（Accept）: ==特別な対応をしない==',
          '　　==能動的受容==（Active）: ==コンティンジェンシー予備==を用意',
          '　　==受動的受容==（Passive）: 何もしない（影響度小の場合）',
          '　==5. エスカレーション==（Escalate）: ==PMの権限外==のためプログラム／ポートフォリオレベルへ',
          '__選択基準__:',
          '　影響度==極高==→ ==回避== または ==転嫁==',
          '　影響度==中==→ ==軽減==',
          '　影響度==低==→ ==受容==',
          '　PM権限外→ ==エスカレーション==',
        ],
        navyItems: [[{ text: '脅威5戦略は午前II 必出。「回避」「転嫁」「軽減」「受容」「エスカレーション」の正確な名称', style: 'navy' }]],
      },
      {
        heading: '14. 機会への5戦略',
        items: [
          '__PMBOK第6版が定める機会（プラスリスク）への5戦略__:',
          '　==1. 活用==（Exploit）: ==機会を確実に==実現させる（脅威の「回避」の逆）',
          '　==2. 共有==（Share）: ==機会を第三者と共有==して両者にメリット（アライアンス・JV）',
          '　==3. 強化==（Enhance）: 確率または影響度を==上げる==（脅威の「軽減」の逆）',
          '　==4. 受容==（Accept）: ==特別な対応をしない==',
          '　==5. エスカレーション==（Escalate）: ==PMの権限外==のため上位レベルへ',
          '__脅威戦略との対応__:',
          '　脅威 ==回避== ↔ 機会 ==活用==',
          '　脅威 ==転嫁== ↔ 機会 ==共有==',
          '　脅威 ==軽減== ↔ 機会 ==強化==',
          '　脅威・機会とも ==受容==・==エスカレーション== は共通',
          '__注意__: 旧第5版以前は機会戦略がなく、第6版で==正式追加==された',
        ],
        navyItems: [[{ text: '機会戦略は PMBOK第6版で正式追加。試験で「機会」への対応を問う設問が増加', style: 'navy' }]],
      },
      {
        heading: '15. 11.6 リスク対応策の実行',
        items: [
          '==11.6 リスク対応策の実行==（Implement Risk Responses, 実行プロセス群）',
          '==PMBOK第6版で新設==されたプロセス',
          '__目的__: ==計画されたリスク対応策==を==実行==',
          '__新設の背景__: 旧版では「計画したが実行されない」リスクがあった',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==対人スキル==: ==影響力==',
          '　==PMIS==',
          '__主要アウトプット__:',
          '　==変更要求==',
          '　==プロジェクト文書の更新==（リスク登録簿・教訓・問題ログ等）',
          '__注意__: 11.5 計画と 11.6 実行は==別プロセス==。実行のフォローが必要',
        ],
        navyItems: [[{ text: 'PMBOK第6版で新設。「計画」と「実行」の分離で実装漏れを防ぐ', style: 'navy' }]],
      },
      {
        heading: '16. 11.7 リスクの監視',
        items: [
          '==11.7 リスクの監視==（Monitor Risks, 監視・コントロールプロセス群）',
          '__目的__: ==対応策の有効性==を監視・==新規リスク特定==・==リスク登録簿更新==',
          '__主要技法__:',
          '　==データ分析==:',
          '　　==技術パフォーマンスの分析==',
          '　　==リスクの再評価==',
          '　　==リザーブの分析==',
          '　==監査==:',
          '　　==リスク監査==: リスク管理プロセスの==有効性==を独立評価',
          '　==会議==:',
          '　　==リスク・レビュー==: 定期的なリスク状況確認',
          '__主要アウトプット__:',
          '　==作業パフォーマンス情報==',
          '　==変更要求==',
          '　==プロジェクト文書の更新==',
          '　==計画書の更新==',
          '　==OPAs の更新==',
        ],
      },
      // ── E. リスク文書・関連概念 ──
      {
        heading: '17. リスク登録簿',
        items: [
          '==リスク登録簿==（Risk Register）: リスク管理の==中央データベース==',
          '__主要記載項目__:',
          '　==リスク ID==',
          '　==リスク記述==（「事象・原因・影響」の3要素）',
          '　==カテゴリ==（RBS で分類）',
          '　==確率==・==影響度==（11.3 で評価）',
          '　==リスク・スコア==（確率×影響度）',
          '　==リスク・オーナー==（担当者）',
          '　==対応戦略==（11.5 で決定）',
          '　==対応策==の詳細',
          '　==残存リスク==・==二次リスク==',
          '　==コンティンジェンシー予備==',
          '　==トリガー==（早期警報サイン）',
          '　==ステータス==（オープン／クローズ／実現／監視中）',
          '__更新タイミング__: 11.2〜11.7 各プロセスの都度',
          '__生きた文書__として継続更新',
        ],
        navyItems: [[{ text: 'リスク登録簿の構成項目は午前II/午後I で記載項目を問う設問が頻出', style: 'navy' }]],
      },
      {
        heading: '18. リスク・レポート',
        items: [
          '==リスク・レポート==（Risk Report）: PMBOK第6版で==新設==された文書',
          '__目的__: ==リスク全体==の==サマリー==・==上位リスク==の俯瞰',
          '__主要記載項目__:',
          '　==プロジェクト全体リスク==のサマリー（成功確率・累積コスト超過確率等）',
          '　==上位個別リスク==の概要',
          '　==合意された対応策==の進捗',
          '　==トレンド==（前回比）',
          '__配信先__: ==ステアリングコミッティ==・==スポンサー==・==上位経営層==',
          '__配信頻度__: 月次／フェーズ末／重大リスク発生時',
          '__リスク登録簿との違い__:',
          '　==登録簿==: ==個別リスク==の詳細データベース',
          '　==レポート==: ==全体俯瞰==と==上位リスク==のサマリー',
          '　両者は==相補的==',
        ],
      },
      {
        heading: '19. 二次リスク・残存リスク',
        items: [
          '==残存リスク==（Residual Risk）: ==対応策実施後==も==残っているリスク==',
          '　例: 軽減策実施でリスクが小さくなっても==完全には消えない==',
          '__管理__: コンティンジェンシー予備でカバー（受容戦略）',
          '==二次リスク==（Secondary Risk）: ==対応策の実施==によって==新たに発生==するリスク',
          '　例: 「人員追加」で軽減 → 「コミュニケーション複雑化」という新リスク',
          '__管理__: ==対応策の計画時==に==事前識別==',
          '__両者の違い__:',
          '　==残存==: ==元のリスク==の==消えない部分==',
          '　==二次==: ==新たに生まれた==別のリスク',
          '__対応策の効果検証__: 残存リスクと二次リスクを==合計==して評価',
          '試験頻出: 二次リスクと残存リスクの==混同==',
        ],
        navyItems: [[{ text: '二次リスク vs 残存リスクは午前II 必出ひっかけ。例で確実に区別', style: 'navy' }]],
      },
      {
        heading: '20. リスク選好・リスク許容度・スレッショルド',
        items: [
          '__3つの関連概念__:',
          '　==リスク選好==（Risk Appetite）: 組織が==積極的に取りに行く==リスクの==量==',
          '　　例: 「成長機会のためなら20%のコスト超過は許容」',
          '　==リスク許容度==（Risk Tolerance）: ==許容できる範囲==',
          '　　例: 「コスト超過は最大15%まで」',
          '　==リスク・スレッショルド==（Risk Threshold）: 許容度の==境界値==',
          '　　例: 「コスト超過15%を超えたらエスカレーション」',
          '__階層__:',
          '　リスク選好（戦略レベル、抽象的）',
          '　→ リスク許容度（プロジェクトレベル、範囲）',
          '　→ リスク・スレッショルド（具体的な数値）',
          '__文書化__: ==リスクマネジメント計画書==に明記',
          '__組織文化__:',
          '　==リスク回避型==組織: 低いリスク選好',
          '　==リスク選好型==組織: 高いリスク選好',
          '試験頻出: 3つの概念の==階層関係==',
        ],
        navyItems: [[{ text: 'リスク選好/許容度/スレッショルドの3階層は組織のリスクマネジメント文化を反映', style: 'navy' }]],
      },
      {
        heading: '21. リスク・プロファイル',
        items: [
          '==リスク・プロファイル==（Risk Profile）: 組織または個人の==リスク選好==・==許容度==の==パターン==',
          '__プロファイルの要素__:',
          '　==リスク選好==の傾向（回避型／中立型／選好型）',
          '　==領域別==のリスク態度（コスト／スケジュール／品質）',
          '　==経験・履歴==に基づく学習結果',
          '__組織プロファイルの形成要因__:',
          '　==業界==（金融・原子力 = 回避型／スタートアップ = 選好型）',
          '　==組織文化==',
          '　==過去の経験==（成功・失敗）',
          '　==規制環境==',
          '__プロジェクト・マネジャー個人__のプロファイルも影響',
          '__プロファイルとリスク戦略__:',
          '　回避型 → 脅威への==回避==／機会への==受容==',
          '　選好型 → 脅威への==軽減==／機会への==活用==',
        ],
      },
      // ── F. アジャイル・特殊リスク ──
      {
        heading: '22. アジャイルでのリスク対応',
        items: [
          'アジャイル開発では==継続的==にリスクを管理',
          '__アジャイル特有のリスク対応__:',
          '　==スプリント計画==で==リスクの高い項目==を==早期取込み==（==高リスク順==）',
          '　==短期反復==で==リスクの早期発見==',
          '　==リファインメント==で要件不確実性を==継続削減==',
          '　==スパイク==（Spike）: 技術検証のための==短期調査==スプリント',
          '　==デモ==で==顧客フィードバック==を早期取得（要求リスク低減）',
          '　==レトロスペクティブ==で==プロセスリスク==を継続改善',
          '__リスク調整バックログ__: バックログ項目に==リスクスコア==を付与',
          '__バーンダウン__で==スコープリスク==を可視化',
          '__バーン__-==アップ==で==スコープ変更==の影響を追跡',
          '__カンバンでのリスク対応__: ==WIP制限==で==過負荷リスク==を抑制',
          '予測型と適応型でリスク管理アプローチが大きく異なる',
        ],
        navyItems: [[{ text: 'アジャイルでは「リスク管理プロセス」というよりリスク管理が業務に組み込まれている', style: 'navy' }]],
      },
      {
        heading: '23. プロジェクト統合リスクと依存関係リスク',
        items: [
          '__統合リスク__: 複数の==サブシステム==・==サプライヤ==・==チーム==の統合時に発生',
          '　例: モジュール間インターフェース不整合・データ連携問題',
          '__依存関係リスク__: ==外部要素==への依存に起因',
          '　==外部依存==: ベンダー・規制・親会社の意思決定',
          '　==内部依存==: 他プロジェクト・共通基盤・コア要員',
          '__管理手法__:',
          '　==依存関係マップ==: 全依存先を可視化',
          '　==クリティカル依存==の優先対応',
          '　==SLA==の締結（外部依存先）',
          '　==バックアップ計画==（代替先の確保）',
          '__プログラム／ポートフォリオレベル__で扱うべき依存関係も多い',
          '　→ エスカレーション戦略の対象',
        ],
      },
      {
        heading: '24. 曖昧さ・複雑性・変動性（PMBOK7 視点）',
        items: [
          'PMBOK第7版「不確かさ」パフォーマンス領域は==リスク==以外も扱う',
          '__不確かさの4要素__:',
          '　==リスク==（Risk）: 確率と影響を==推定可能==な事象',
          '　==曖昧さ==（Ambiguity）: ==意味・選択肢==が==不明確==',
          '　==複雑性==（Complexity）: ==要素間の関係==が==複雑==で予測困難',
          '　==変動性==（Volatility）: ==変化の頻度==と==速さ==',
          '__VUCA__（Volatility/Uncertainty/Complexity/Ambiguity）に通じる',
          '__対応戦略__:',
          '　==リスク==: 上記5戦略（脅威・機会）',
          '　==曖昧さ==: ==プロトタイピング==・==実験==・==段階的詳細化==',
          '　==複雑性==: ==小さな試行==・==創発的アプローチ==・==アジャイル==',
          '　==変動性==: ==アジリティ==・==適応型ライフサイクル==',
          'PMBOK第7版で==リスク以外の不確かさ==を体系化',
        ],
        navyItems: [[{ text: 'PMBOK第7版は「リスクマネジメント」を「不確かさ」に拡張。VUCA への対応が明示', style: 'navy' }]],
      },
      // ── G. 早期警戒システムとトリガー管理 ──
      {
        heading: '25. リスク・トリガーと早期警戒システム',
        items: [
          '==リスク・トリガー==（Risk Trigger）: リスクが==発生する直前==に==観測可能==な==兆候==',
          '　例: 「天候情報で台風接近」 → 「物流遅延リスクのトリガー」',
          '__早期警戒システム__（Early Warning System）: トリガーを==自動監視==してアラート',
          '__構成要素__:',
          '　==監視対象指標==（KRI = Key Risk Indicator）',
          '　==閾値==（リスク・スレッショルド）',
          '　==アラート機構==（メール・ダッシュボード通知）',
          '　==対応プロトコル==（アラート発生時の対応手順）',
          '__指標例__:',
          '　==スケジュール==: SPI < 0.9 で警告',
          '　==コスト==: CPI < 0.9 で警告',
          '　==品質==: 欠陥率 > 閾値で警告',
          '　==離職==: 退職率 > 月3% で警告',
          '__ダッシュボード__で==リアルタイム可視化==が一般的',
        ],
        navyItems: [[{ text: 'KRI（Key Risk Indicator）は measurement §3 で扱う。本セクションはリスク監視視点', style: 'navy' }]],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '26. 過去問頻出論点（午前II）',
        items: [
          '__PMBOK6 第11章 7プロセス__: 11.1〜11.7 のプロセス群所属（計画5・実行1・監視1）',
          '__脅威5戦略__: ==回避==／==転嫁==／==軽減==／==受容==／==エスカレーション==',
          '__機会5戦略__: ==活用==／==共有==／==強化==／==受容==／==エスカレーション==',
          '__脅威/機会の対応関係__: 回避↔活用、転嫁↔共有、軽減↔強化',
          '__能動的受容 vs 受動的受容__: コンティンジェンシー予備の有無',
          '__確率影響度マトリクス__: 縦×横の優先順位付け',
          '__EMV 計算__: ==確率 × 影響額==・脅威はマイナス・機会はプラス',
          '__決定木__: 末端から計算・確率ノード=確率×金額の合計・決定ノード=最大選択',
          '__モンテカルロ__: 確率分布シミュレーション・P50/P80',
          '__感度分析__: ==トルネード図==で要因影響度',
          '__RBS__: リスク・カテゴリの階層分解',
          '__二次リスク vs 残存リスク__: 新発生 vs 残存部分',
          '__リスク選好/許容度/スレッショルド__: 戦略→プロジェクト→数値の階層',
          '__プロンプトリスト__: PESTLE/TECOP/VUCA',
        ],
      },
      {
        heading: '27. ひっかけパターン',
        items: [
          '__脅威 vs 機会__: 機会も「リスク」として扱う（プラスのリスク）',
          '__回避 vs 軽減__: 回避=原因除去、軽減=確率/影響度を下げる',
          '__転嫁 vs 受容__: 転嫁=第三者へ責任移転、受容=何もしない（または予備のみ）',
          '__能動的受容 vs 受動的受容__: コンティンジェンシー予備の==有無==',
          '__活用 vs 強化__: 活用=機会を確実に実現、強化=確率/影響度を上げる',
          '__脅威/機会の対応__: 軽減↔強化（覚えにくいひっかけ）',
          '__11.6 vs 11.7__: 実行 vs 監視（11.6 は PMBOK6 で新設）',
          '__二次リスク vs 残存リスク__: 新発生 vs 元リスクの残り',
          '__定性的 vs 定量的__: すべてのリスク（定性） vs 重要リスクのみ数値化（定量）',
          '__EMV の符号__: 脅威=マイナス、機会=プラス',
          '__リスク登録簿 vs リスク・レポート__: 個別詳細 vs 全体俯瞰',
          '__リスク選好 vs 許容度 vs スレッショルド__: 戦略→範囲→具体的数値の階層',
          '__確率 vs 影響度__: 確率は発生可能性、影響度は発生時の大きさ',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==（リスク含む不確かさ）',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
      // 合計27セクション（A:3 + B:3 + C:5 + D:5 + E:5 + F:3 + G:1 + H:2 = 27）
      // 章構成案では30だが、実装時に統合した。
    ],
    exam_tips: [
      '【最重要・PMBOK6 第11章 7プロセス】11.1 計画／11.2 特定／11.3 定性分析／11.4 定量分析／11.5 対応計画／11.6 対応実行／11.7 監視。プロセス群所属（計画5・実行1・監視1）を暗記。',
      '【脅威5戦略】==回避==／==転嫁==／==軽減==／==受容==（能動・受動）／==エスカレーション==。',
      '【機会5戦略】==活用==／==共有==／==強化==／==受容==／==エスカレーション==。脅威↔機会の対応（回避↔活用・転嫁↔共有・軽減↔強化）を暗記。',
      '【確率影響度マトリクス】縦軸確率×横軸影響度、リスク・スコア=確率×影響度。RAG 色分け。',
      '【EMV】==確率 × 影響額==。脅威マイナス・機会プラス。決定木で最適選択。',
      '【モンテカルロ】確率分布シミュレーション・P50/P80。感度分析の==トルネード図==で要因識別。',
      '【RBS】リスク・カテゴリの階層分解（技術／外部／組織／PM）。WBS と並ぶ分解構造。',
      '【二次リスク vs 残存リスク】対応策で==新発生==vs ==残り==の区別。',
      '【リスク選好/許容度/スレッショルド】戦略→範囲→具体的数値の3階層。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロセス・ITTO==は第6版 第11章、==不確かさパフォーマンス領域==は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 9. 統合・変更管理（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  integration: {
    summary:
      'プロジェクトの==全要素==を==統合==し、==変更==と==構成==を管理する活動領域。PMBOK第6版では第4章「==統合マネジメント==」7プロセス（4.1〜4.7）、第7版では==原則==に基づく横断的活動。==プロジェクト憲章==・==統合変更管理==（CCB）・==構成管理==が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 統合マネジメントの目的',
        items: [
          '==統合マネジメント==（Integration Management）: プロジェクトの==他の知識エリア==の活動を==調整・統合==する',
          '__目的__:',
          '　==全要素==を==整合==させる',
          '　==トレードオフ==の意思決定（スコープ・スケジュール・コスト・品質のバランス）',
          '　==リソース==の最適化',
          '　==プロジェクト全体==の==成功==への責任',
          '__プロジェクトマネージャ__の==中心的な役割==',
          '__統合の特徴__:',
          '　他の知識エリアは==並列==、統合は==それらを束ねる==',
          '　==プロジェクト・ライフサイクル==全体に渡る',
          '　==戦略目標==と==プロジェクト目標==の整合',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 第4章「プロジェクト統合マネジメント」', style: 'navy' }]],
      },
      {
        heading: '2. PMBOK第6版 第4章 7プロセス概観',
        items: [
          'PMBOK第6版 第4章は==7プロセス==で構成（10知識エリアで==最多==）:',
          '　==4.1 プロジェクト憲章作成==（Develop Project Charter, 立上げプロセス群）',
          '　==4.2 プロジェクトマネジメント計画書作成==（Develop Project Management Plan, 計画プロセス群）',
          '　==4.3 プロジェクト作業の指揮・マネジメント==（Direct and Manage Project Work, 実行プロセス群）',
          '　==4.4 プロジェクト知識のマネジメント==（Manage Project Knowledge, 実行プロセス群）',
          '　==4.5 プロジェクト作業の監視・コントロール==（Monitor and Control Project Work, 監視・コントロール）',
          '　==4.6 統合変更管理==（Perform Integrated Change Control, 監視・コントロール）',
          '　==4.7 プロジェクトまたはフェーズの終結==（Close Project or Phase, 終結プロセス群）',
          '__プロセス群分布__: 立上 1／計画 1／実行 2／監視 2／終結 1',
          '__5プロセス群__すべてに統合プロセスが==配置==されている特徴',
        ],
        navyItems: [[{ text: '統合マネジメントは10知識エリアで唯一、5プロセス群すべてにプロセスを持つ', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第7版との対応',
        items: [
          'PMBOK第7版は==プロセスベースから原則ベース==に変更',
          '__第7版での扱い__: 統合マネジメントは==独立領域として消滅==、複数の==原則==と==パフォーマンス領域==に==分散==',
          '__主な関連先__:',
          '　==プロジェクト・ライフサイクル==の指揮 → 統合の中心',
          '　==チーム==パフォーマンス領域 → リーダーシップ視点',
          '　==プロジェクト作業==パフォーマンス領域 → 4.3, 4.4, 4.5 の機能',
          '　==12原則==の「==システム思考==」「==リーダーシップ==」「==適応性==」',
          '__統合的視点の重要性__は第7版でも変わらず重要',
          '__試験対応__:',
          '　午前II は==第6版用語==（4.1〜4.7 プロセス）が中心',
          '　午後I シナリオは==統合的判断==を問う設問',
          '本アプリは両版を併記。試験頻出（==赤字==）は第6版用語を優先',
        ],
        navyItems: [[{ text: '統合は第7版で消滅したが、概念は分散している。試験は第6版ベース', style: 'navy' }]],
      },
      // ── B. プロジェクト憲章 ──
      {
        heading: '4. 4.1 プロジェクト憲章作成',
        items: [
          '==4.1 プロジェクト憲章作成==（Develop Project Charter, 立上げプロセス群）',
          '__目的__: プロジェクトを==正式==に==認可==し、==プロジェクトマネージャ==を==特定==',
          '__主要インプット__:',
          '　==ビジネス文書==（==ビジネスケース==・==ベネフィット・マネジメント計画書==）',
          '　==合意書==（外部プロジェクトの場合）',
          '　==EEFs==（組織体の環境要因）／==OPAs==（組織のプロセス資産）',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==データ収集==（ブレーンストーミング・フォーカスグループ・インタビュー）',
          '　==対人スキル==（==コンフリクト・マネジメント==・ファシリテーション）',
          '　==会議==',
          '__主要アウトプット__:',
          '　==プロジェクト憲章==（最重要）',
          '　==前提条件ログ==',
          '__発行者__: ==スポンサー==または==上位組織==（PMが書くこともあるが==承認はスポンサー==）',
        ],
        navyItems: [[{ text: 'プロジェクト憲章は PM の権限の根拠。スポンサー承認が必須', style: 'navy' }]],
      },
      {
        heading: '5. プロジェクト憲章の構成要素',
        items: [
          '__プロジェクト憲章__の主要記載項目:',
          '　==プロジェクトの目的==',
          '　==測定可能な目標==・==成功基準==',
          '　==上位レベル要求事項==',
          '　==上位レベル記述==（境界・成果物）',
          '　==上位レベル・リスク==',
          '　==マイルストーン・スケジュール==',
          '　==上位レベル予算==',
          '　==承認要求事項==',
          '　==プロジェクトの終結基準==',
          '　==プロジェクトマネージャー==・==責任==・==権限レベル==',
          '　==スポンサー==・==承認者==の名前と権限',
          '　==プロジェクト基本構造==',
          '__特徴__:',
          '　==上位レベル==の記述（詳細は計画書で）',
          '　==生きた文書==ではない（基本的に変更しない）',
          '　==承認後変更==はスポンサー再承認必要',
          '試験頻出: 憲章と==計画書==・==スコープ記述書==との混同',
        ],
        navyItems: [[{ text: 'プロジェクト憲章 vs 計画書 vs スコープ記述書 の使い分けは午前II で頻出', style: 'navy' }]],
      },
      {
        heading: '6. ビジネス文書との関係',
        items: [
          '__プロジェクト立上げ前__に作成される==ビジネス文書==:',
          '　==ビジネスケース==（Business Case）: プロジェクト==投資==の==正当化==',
          '　　含む内容: ビジネス・ニーズ／代替案分析／推奨案／成功評価基準',
          '　==ベネフィット・マネジメント計画書==（Benefits Management Plan）: ==便益実現==の計画',
          '　　含む内容: ターゲット便益／戦略整合性／実現時期／オーナー／測定指標',
          '__関係__:',
          '　ビジネス・ニーズ → ==ビジネスケース== → ==憲章== → ==プロジェクト==',
          '　プロジェクト → 成果物 → ==ベネフィット実現== → ==戦略目標達成==',
          '__注意__:',
          '　ビジネス文書は==PM 以外==（==スポンサー==・==ビジネス部門==）が作成',
          '　PM はビジネス文書を==入力==として==憲章==を作成',
          '__延長線上__: ベネフィットは delivery §27 でも扱う',
        ],
      },
      // ── C. 計画書作成と実行 ──
      {
        heading: '7. 4.2 プロジェクトマネジメント計画書作成（再確認）',
        items: [
          '==4.2 プロジェクトマネジメント計画書作成==（Develop Project Management Plan, 計画プロセス群）',
          '※詳細は==planning §29==参照。本セクションは統合視点での再確認',
          '__目的__: 全==サブシディアリー計画書==と==ベースライン==を==統合==',
          '__主要アウトプット__: ==プロジェクトマネジメント計画書==（統合済み）',
          '__統合される要素__:',
          '　==3ベースライン==（スコープ／スケジュール／コスト）',
          '　==10のサブシディアリー計画書==',
          '　==補助計画書==（変更管理／構成管理／パフォーマンス測定）',
          '　==プロジェクトライフサイクル選定==',
          '計画書は==生きた文書==',
          '　==承認時にベースライン==化',
          '　==変更時には統合変更管理プロセス==（4.6）',
        ],
      },
      {
        heading: '8. 4.3 プロジェクト作業の指揮・マネジメント（再確認）',
        items: [
          '==4.3 プロジェクト作業の指揮・マネジメント==（Direct and Manage Project Work, 実行プロセス群）',
          '※詳細は==project-work §4==参照。本セクションは統合視点での再確認',
          '__目的__: ==計画書==の通りに==作業を実行==',
          '__統合視点での重要性__: ==他の知識エリア==の==実行プロセス==を==調整==',
          '　各知識エリアの実行プロセスを==同期==させる',
          '__主要アウトプット__:',
          '　==成果物==',
          '　==作業パフォーマンス・データ==',
          '　==問題ログ==',
          '　==変更要求==',
          '　==プロジェクト文書の更新==',
        ],
      },
      {
        heading: '9. 4.4 プロジェクト知識のマネジメント（再確認）',
        items: [
          '==4.4 プロジェクト知識のマネジメント==（Manage Project Knowledge, 実行プロセス群）',
          '※詳細は==project-work §5==参照。本セクションは統合視点での再確認',
          '__目的__: ==既存知識==の活用と==新規知識==の創出',
          '__統合視点での重要性__: 知識は==プロジェクト横断==で価値を生む',
          '__SECI モデル__（project-work §20 参照）:',
          '　==共同化==（暗黙知→暗黙知）',
          '　==表出化==（暗黙知→形式知）',
          '　==連結化==（形式知→形式知）',
          '　==内面化==（形式知→暗黙知）',
          '__主要アウトプット__: ==教訓登録簿==／==プロジェクト文書の更新==',
          '__教訓は__継続的==に収集==（プロジェクト終結時だけでない）',
        ],
      },
      // ── D. 監視・コントロール ──
      {
        heading: '10. 4.5 プロジェクト作業の監視・コントロール',
        items: [
          '==4.5 プロジェクト作業の監視・コントロール==（Monitor and Control Project Work, 監視・コントロールプロセス群）',
          '__目的__: ==プロジェクト全体==の==進捗==・==パフォーマンス==を==監視==・==是正==',
          '__統合視点での重要性__: 他の監視プロセスからの==情報を統合==',
          '__主要インプット__:',
          '　他の知識エリアからの==作業パフォーマンス情報==',
          '　計画書・ベースライン',
          '__主要技法__:',
          '　==データ分析==（==代替案分析==／==コスト便益分析==／==EVA==／==トレンド分析==／==差異分析==）',
          '　==意思決定==',
          '　==会議==',
          '__主要アウトプット__:',
          '　==作業パフォーマンス報告書==',
          '　==変更要求==',
          '　==プロジェクト文書・計画書の更新==',
        ],
      },
      {
        heading: '11. EVM 連携と統合的監視',
        items: [
          'measurement §4-8 で扱う==EVM==は、4.5 の==中核技法==',
          '__統合的監視__の特徴:',
          '　==スコープ==（EV）・==コスト==（AC）・==スケジュール==（PV/SPI）を==一元評価==',
          '　==単一指標==（CPI/SPI）で==全体健全性==判定',
          '__統合された情報フロー__:',
          '　各知識エリアの監視プロセス → 作業パフォーマンス情報',
          '　→ 4.5 で==統合==',
          '　→ 4.6 で==変更要求の判断==',
          '__統合的監視のメリット__:',
          '　==スコープ膨張==の早期発見',
          '　==トレードオフ==の数値ベース判断',
          '　==予測の信頼性==',
          '__限界__:',
          '　==品質==の数値化が困難',
          '　==アジャイル==では別指標（バーンダウン・ベロシティ）',
        ],
        navyItems: [[{ text: 'EVM の詳細は measurement §4-8。本セクションは統合監視の視点', style: 'navy' }]],
      },
      {
        heading: '12. 是正処置・予防処置・欠陥修正',
        items: [
          '__作業のパフォーマンス__が計画から乖離した場合の==3種類の処置==:',
          '　==是正処置==（Corrective Action）: ==過去==に発生した==問題==を==修正==',
          '　　例: 遅延スケジュールの巻き返し・コスト超過対応',
          '　==予防処置==（Preventive Action）: ==将来予測される==問題を==事前に防止==',
          '　　例: リスク対応策の事前実施',
          '　==欠陥修正==（Defect Repair）: ==成果物の不具合==を==修正==',
          '　　例: バグ修正・仕様不適合の改修',
          '__判断軸__:',
          '　時系列: 是正=過去問題、予防=将来問題',
          '　対象: 是正/予防=プロセス、欠陥修正=成果物',
          '__統合変更管理__（4.6）で==変更要求==として扱う',
          '__注意__: 3種類とも==承認==が必要（CCB 経由）',
          '試験頻出: 3処置の==違い==を問う設問',
        ],
        navyItems: [[{ text: '是正処置 vs 予防処置 vs 欠陥修正の区別は午前II 頻出', style: 'navy' }]],
      },
      // ── E. 統合変更管理 ──
      {
        heading: '13. 4.6 統合変更管理',
        items: [
          '==4.6 統合変更管理==（Perform Integrated Change Control, 監視・コントロールプロセス群）',
          '__目的__: ==全変更要求==を==一元管理==して==影響評価==・==承認==・==実装==',
          '__統合的な特徴__:',
          '　各知識エリアから==分散的に発生==する変更要求を==一元化==',
          '　==スコープ==・==スケジュール==・==コスト==・==品質==への影響を==同時評価==',
          '__主要インプット__:',
          '　==プロジェクトマネジメント計画書==',
          '　==作業パフォーマンス報告書==',
          '　==変更要求==',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==変更管理ツール==（==構成管理システム==・==変更管理システム==）',
          '　==データ分析==（==代替案分析==・==コスト便益分析==）',
          '　==意思決定==（==投票==・==独裁==・==多基準意思決定分析==）',
          '　==会議==（CCB ミーティング）',
          '__主要アウトプット__:',
          '　==承認された変更要求==',
          '　==プロジェクトマネジメント計画書の更新==',
          '　==プロジェクト文書の更新==',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §4.6。CCB（変更管理委員会）は本プロセスの中核', style: 'navy' }]],
      },
      {
        heading: '14. 変更要求の種類',
        items: [
          '__変更要求__（Change Request）の4種類:',
          '　==是正処置==（Corrective Action）: 過去問題の修正（§12 参照）',
          '　==予防処置==（Preventive Action）: 将来問題の防止（§12 参照）',
          '　==欠陥修正==（Defect Repair）: 成果物の不具合修正（§12 参照）',
          '　==更新==（Updates）: 文書・計画書の更新',
          '__発生源__:',
          '　==外部要因==: 規制変更・市場変化・顧客要求',
          '　==内部要因==: 技術的問題・リスク発生・スコープ膨張',
          '__フォーマット__:',
          '　==変更要求書==の主要記載項目:',
          '　　==変更ID==／==要求者==／==要求日==',
          '　　==変更内容==（What/Why）',
          '　　==影響評価==（スコープ・スケジュール・コスト・品質・リスク）',
          '　　==代替案==',
          '　　==推奨対応==',
          '　　==承認者の署名==',
          '__変更ログ__で全変更を追跡',
        ],
      },
      {
        heading: '15. CCB（変更管理委員会）',
        items: [
          '==CCB==（Change Control Board, 変更管理委員会）: 変更要求を==審議==・==承認==する==正式組織==',
          '__構成__:',
          '　==スポンサー==',
          '　==プロジェクトマネージャ==',
          '　==主要ステークホルダー==の代表',
          '　==技術専門家==（必要に応じて）',
          '__役割__:',
          '　==変更要求の評価==・==承認/却下==・==延期==',
          '　==影響範囲分析==の指示',
          '　==構成管理==との連携',
          '__権限レベル__:',
          '　==重大変更==: スポンサー／経営層 + CCB',
          '　==中規模変更==: CCB',
          '　==軽微変更==: PM 単独（==事前承認==の範囲）',
          '__開催頻度__: 定例（週次／隔週）+ 必要時臨時',
          '__決定の文書化__: ==変更ログ==で履歴管理',
        ],
        navyItems: [[{ text: 'CCB は午前II 必出。構成・役割・権限レベルを暗記', style: 'navy' }]],
      },
      {
        heading: '16. 変更影響評価',
        items: [
          '__変更影響評価__の4軸:',
          '　==スコープ影響==: 成果物・機能の追加／削除／変更',
          '　==スケジュール影響==: 工程遅延／前倒し',
          '　==コスト影響==: 追加予算／節約',
          '　==品質影響==: 品質目標への影響',
          '__追加考慮事項__:',
          '　==リスク影響==',
          '　==ステークホルダー影響==',
          '　==契約影響==（外部ベンダーがいる場合）',
          '__評価担当__: 各知識エリアの==専門家==が==共同==で評価',
          '__判定基準__:',
          '　==損益分析==',
          '　==戦略整合性==',
          '　==実現可能性==',
          '__文書化__: ==影響評価書==に==定量化==した結果を記載',
        ],
      },
      {
        heading: '17. 変更管理ワークフロー',
        items: [
          '__標準的な変更管理ワークフロー__:',
          '　==1. 変更要求の起票==（誰でも可）',
          '　==2. 初期スクリーニング==（PM）: 軽微なら PM 単独承認',
          '　==3. 影響評価==（専門家チーム）',
          '　==4. CCB 審議==（中規模以上）',
          '　==5. 承認／却下／延期==の決定',
          '　==6. 承認された変更の実装==（プロセス 4.3 で）',
          '　==7. ベースラインの更新==',
          '　==8. ステークホルダーへの通知==',
          '　==9. 変更ログの更新==',
          '__逆経路__:',
          '　却下 → ==要求者への説明==',
          '　延期 → ==再審議スケジュール==の設定',
          '__追跡__:',
          '　==変更要求番号==で==トレーサビリティ==',
          '　==監査==の対象',
        ],
      },
      // ── F. 構成管理 ──
      {
        heading: '18. 構成項目（CI）と構成管理',
        items: [
          '==構成管理==（Configuration Management）: ==製品==・==プロジェクト情報==の==バージョン==を==管理==',
          '__構成項目__（CI, Configuration Item）: 構成管理の==対象単位==',
          '　例: ==ソフトウェアモジュール==／==設計文書==／==テストスクリプト==／==計画書==',
          '__構成管理の主要活動__:',
          '　==構成項目の識別==: 何を構成項目とするか定義',
          '　==構成項目のコントロール==: 変更承認プロセスを通じてのみ変更',
          '　==構成ステータス会計==: 各構成項目の==現状==を追跡',
          '　==構成監査==: 構成項目が==仕様通り==であることを確認',
          '__バージョン管理__:',
          '　==バージョン番号==（Major.Minor.Patch）',
          '　==リポジトリ==（Git/SVN 等）',
          '　==ブランチ戦略==（master/develop/feature）',
          '__統合変更管理との関係__: 変更管理は==プロセス==、構成管理は==成果物==',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §4.6.2.2 構成管理ツール。ISO 10007 が国際規格', style: 'navy' }]],
      },
      {
        heading: '19. ベースラインと変更管理',
        items: [
          '==ベースライン==（Baseline）: 計画書・成果物の==承認された参照点==',
          '__3大ベースライン__:',
          '　==スコープ・ベースライン==: プロジェクト・スコープ記述書＋WBS＋WBS辞書',
          '　==スケジュール・ベースライン==: 承認されたスケジュール',
          '　==コスト・ベースライン==: 承認された予算（タイムフェーズ）',
          '__パフォーマンス測定ベースライン__（PMB）: 上記3つの==統合==',
          '__ベースラインの特徴__:',
          '　==凍結==（freeze）: 承認後は変更不可',
          '　==変更==: 統合変更管理プロセスを通じてのみ',
          '　==バージョン==: 変更ごとにバージョン更新',
          '__計画値（Plan）との違い__:',
          '　計画値 = 当初の値',
          '　ベースライン = ==承認された==計画値（変更後は更新される）',
          '__EVM での使用__: PV はベースライン上の値（measurement §4 参照）',
        ],
        navyItems: [[{ text: 'ベースラインの種類と凍結概念は午前II 頻出。「変更」と「ベースライン更新」の関係', style: 'navy' }]],
      },
      {
        heading: '20. バージョン管理',
        items: [
          '==バージョン管理==（Version Control）: 文書・成果物の==変更履歴==を==追跡==',
          '__バージョン番号体系__:',
          '　==セマンティック・バージョニング==（Semver）: Major.Minor.Patch',
          '　　Major: ==互換性なし==の変更',
          '　　Minor: ==後方互換性あり==の機能追加',
          '　　Patch: ==バグ修正==のみ',
          '__文書のバージョン管理__:',
          '　==Draft==（草案）→ ==Review==（レビュー中）→ ==Approved==（承認済み）',
          '　==v0.1==／==v0.2==／==v1.0==（正式版）',
          '__ツール__:',
          '　==ソースコード==: ==Git==／==SVN==／==Mercurial==',
          '　==文書==: ==SharePoint==／==Confluence==／==Google Docs==',
          '　==設計==: ==Figma==／==Adobe Cloud==',
          '__ブランチ戦略__:',
          '　==Git Flow==（develop/feature/release/hotfix/master）',
          '　==GitHub Flow==（master + feature）',
          '　==Trunk Based Development==（master 中心）',
        ],
      },
      // ── G. プロジェクト終結 ──
      {
        heading: '21. 4.7 プロジェクトまたはフェーズの終結（再確認）',
        items: [
          '==4.7 プロジェクトまたはフェーズの終結==（Close Project or Phase, 終結プロセス群）',
          '※詳細は==delivery §26==参照。本セクションは統合視点での再確認',
          '__統合視点での重要性__:',
          '　==全知識エリア==の活動を==終結==',
          '　==組織資産==（教訓・テンプレート）への==知識移転==',
          '__主要技法__:',
          '　==専門家の判断==',
          '　==データ分析==（==文書分析==／==回帰分析==／==トレンド分析==／==差異分析==）',
          '　==会議==',
          '__主要アウトプット__:',
          '　==プロジェクト文書の更新==（教訓登録簿最終化）',
          '　==最終成果物・サービスへの移行==',
          '　==最終報告書==',
          '　==OPAs の更新==',
        ],
      },
      {
        heading: '22. 文書化と教訓の活用',
        items: [
          '__プロジェクト終結時の文書化__:',
          '　==教訓登録簿==の最終化（lessons learned）',
          '　==最終報告書==の作成',
          '　==アーカイブ==（プロジェクト文書のリポジトリ移行）',
          '　==契約終結==の正式手続き',
          '__教訓の活用__:',
          '　==組織知識リポジトリ==への登録',
          '　==テンプレート==への反映',
          '　==プロセス改善==への活用',
          '　==トレーニング==への組み込み',
          '__プロジェクト後評価__:',
          '　==サクセス・レビュー==: 成功要因・失敗要因の分析',
          '　==ベネフィット・レビュー==: 6ヶ月〜数年後の効果測定（delivery §27 参照）',
          '__組織学習__: 個人 → チーム → 組織 → 業界 の階層拡散',
        ],
        navyItems: [[{ text: '教訓は project-work §21、ベネフィット実現は delivery §27 で詳細扱い', style: 'navy' }]],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '23. 過去問頻出論点（午前II）',
        items: [
          '__PMBOK6 第4章 7プロセス__: 4.1〜4.7 のプロセス群所属（立上1・計画1・実行2・監視2・終結1）',
          '__4.6 統合変更管理__・==CCB==の構成と役割',
          '__プロジェクト憲章__: 主要記載項目・スポンサー承認',
          '__計画書 vs 憲章 vs スコープ記述書__: 役割の違い',
          '__変更要求__の3種類: ==是正処置==／==予防処置==／==欠陥修正==',
          '__構成管理__: ==構成項目==（CI）と==バージョン管理==',
          '__ベースライン__: 3大ベースライン（スコープ・スケジュール・コスト）と凍結',
          '__プロジェクト終結__: 教訓登録簿の最終化',
          '__統合的監視__: 各知識エリアの作業パフォーマンス情報を統合（4.5）',
          '__プロジェクト知識マネジメント__: 暗黙知 vs 形式知（SECI モデル）',
          '__作業パフォーマンス3階層__: データ → 情報 → 報告書（project-work §17 参照）',
        ],
      },
      {
        heading: '24. ひっかけパターン',
        items: [
          '__プロジェクト憲章 vs 計画書__: 憲章=立上げで作成・上位レベル／計画書=計画で詳細化',
          '__プロジェクト憲章 vs スコープ記述書__: 憲章=PM の権限の根拠／スコープ記述書=境界の詳細',
          '__是正処置 vs 予防処置 vs 欠陥修正__: 時系列（過去/将来）と対象（プロセス/成果物）',
          '__変更管理 vs 構成管理__: 変更管理はプロセス／構成管理は成果物のバージョン',
          '__CCB__: スポンサー・PM・主要ステークホルダーで構成、PM 単独では却下不可',
          '__ベースライン__: 凍結後は==統合変更管理==経由でのみ更新',
          '__4.4 知識マネジメント__: PMBOK第6版で==新設==（旧第5版なし）',
          '__4.6 統合変更管理__: 監視・コントロールプロセス群（実行ではない）',
          '__プロセス群分布__: 統合は==5プロセス群すべて==にプロセス保有（唯一）',
          '__PMBOK7 では独立領域消滅__: 概念は12原則・8パフォーマンス領域に分散',
          '__計画値 vs ベースライン__: 計画値=当初／ベースライン=承認済み（変更後は更新）',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==原則・パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・PMBOK6 第4章】4.1 憲章作成／4.2 計画書作成／4.3 作業の指揮／4.4 知識管理／4.5 監視・コントロール／4.6 統合変更管理／4.7 終結。==7プロセス==＋プロセス群所属を暗記。',
      '【プロセス群分布】立上1（4.1）・計画1（4.2）・実行2（4.3, 4.4）・監視2（4.5, 4.6）・終結1（4.7）。==5プロセス群すべて==にプロセス保有は統合のみ。',
      '【プロジェクト憲章】上位レベル記述・PM 特定・スポンサー承認。==主要記載項目==（目的・目標・成功基準・上位リスク・予算等）を暗記。',
      '【憲章 vs 計画書 vs スコープ記述書】憲章=PM 権限根拠／計画書=詳細実行計画／スコープ記述書=スコープ境界の詳細。',
      '【統合変更管理】==CCB==（スポンサー・PM・主要ステークホルダー）で審議・承認。変更要求は==是正/予防/欠陥修正/更新==の4種類。',
      '【是正/予防/欠陥修正】是正=過去問題、予防=将来問題、欠陥修正=成果物の不具合。3者の==違い==を区別。',
      '【構成管理】==構成項目==（CI）・==バージョン管理==・==ベースライン==。変更管理はプロセス、構成管理は成果物。',
      '【ベースライン】3大（スコープ・スケジュール・コスト）と==パフォーマンス測定ベースライン==（PMB）。==凍結==と==承認後変更==の関係。',
      '【ひっかけ】憲章 vs 計画書／是正 vs 予防 vs 欠陥修正／変更管理 vs 構成管理／4.6 = 監視（実行ではない）。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==第4章 7プロセス==は第6版、第7版では==独立領域消滅==し12原則・パフォーマンス領域に分散。',
    ],
  },

  // ───────────────────────────────────────────
  // 10. ガバナンス・組織論（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  governance: {
    summary:
      'プロジェクトを==組織の戦略==と==整合==させ、==意思決定==と==権限==の枠組みを提供する活動領域。PMBOK第6版では第2章「環境」・第13章「ステークホルダー」・PMI Standard for Program/Portfolio Management、第7版では「==スチュワードシップ==」「リーダーシップ」「価値」などの12原則として横断的に扱う。==ポートフォリオ／プログラム／プロジェクト==の3階層、==PMO==、==ステアリングコミッティ==、==COBIT==・==JIS Q 38500==、==プロジェクト監査==が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. プロジェクト・ガバナンスの定義',
        items: [
          '==プロジェクト・ガバナンス==（Project Governance）: プロジェクトの==意思決定==・==報告==・==監督==の==枠組み==',
          '__目的__:',
          '　==戦略的整合==の確保（プロジェクト → 組織戦略）',
          '　==説明責任==の明確化',
          '　==意思決定の効率化==',
          '　==リスク管理==の体系化',
          '__プロジェクトマネジメントとの違い__:',
          '　==マネジメント==: ==実行==の側面（計画通りに動かす）',
          '　==ガバナンス==: ==監督==の側面（正しい方向か判断）',
          '__コーポレートガバナンス__（企業統治）の==下位概念==として位置づけられる',
          '__プログラムガバナンス__・==ポートフォリオガバナンス==も同様の構造',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §2.4.5 プロジェクト・ガバナンス / PMI Standard for Program Management', style: 'navy' }]],
      },
      {
        heading: '2. プロジェクト・ガバナンス・フレームワーク',
        items: [
          '__フレームワークの主要要素__:',
          '　==ガバナンス・ボディ==（==ステアリングコミッティ==・==CCB==等）',
          '　==役割と責任==の定義',
          '　==意思決定プロセス==',
          '　==報告構造==（フェーズゲート報告・定例報告）',
          '　==エスカレーション・プロセス==',
          '　==コンプライアンス==・==監査==',
          '　==パフォーマンス測定==・==報告==',
          '__カスタマイズ__:',
          '　==組織の成熟度==・==プロジェクト規模==・==リスクレベル==に応じてテーラリング',
          '__効果__:',
          '　==説明責任==の明確化',
          '　==意思決定の迅速化==',
          '　==戦略整合==の維持',
        ],
      },
      {
        heading: '3. PMBOK第7版「スチュワードシップ」「価値」原則',
        items: [
          'PMBOK第7版は「ガバナンス」を独立領域でなく==12原則==として扱う',
          '__主な関連原則__:',
          '　==スチュワードシップ==（Stewardship）: 誠実・尊重・思いやりを持って==責任ある運営==',
          '　==価値==（Value）: ==価値の最大化==にフォーカス',
          '　==リーダーシップ==（Leadership）: 効果的なリーダーシップ行動を示す',
          '　==チーム==（Team）: ==協働的==なプロジェクトチーム環境',
          '　==システム思考==（Systems Thinking）: ==全体最適==の視点',
          '　==テーラリング==（Tailoring）: 状況に応じたアプローチ調整',
          '__組織レベル__:',
          '　==倫理的責任==（PMI 倫理規程）',
          '　==社会的責任==（持続可能性・SDGs）',
          '　==透明性==の確保',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版 第3章「プロジェクトマネジメントの原則」12原則のうちガバナンス関連', style: 'navy' }]],
      },
      // ── B. 階層構造 ──
      {
        heading: '4. ポートフォリオ／プログラム／プロジェクト 3階層',
        items: [
          'PMI が定める==3階層構造==:',
          '　==ポートフォリオ==（Portfolio）: 戦略目標達成のための==プロジェクト・プログラム==の==集合==',
          '　　例: 「2026年度 DX 推進ポートフォリオ」',
          '　==プログラム==（Program）: ==相互関連==する==複数プロジェクト==を==統合管理==',
          '　　例: 「新基幹システム導入プログラム」（インフラ・アプリ・データ移行の3プロジェクト）',
          '　==プロジェクト==（Project）: ==有期==の取り組み',
          '__管理目的の違い__:',
          '　==ポートフォリオ==: ==価値最大化==・==戦略整合==',
          '　==プログラム==: ==便益実現==（プロジェクト単独では得られない便益）',
          '　==プロジェクト==: ==成果物デリバリー==',
          '__階層の上位ほど不確実性が高い__・==戦略寄り==',
          '試験頻出: 3階層の==目的の違い==を問う設問',
        ],
        navyItems: [[{ text: '出典: PMI Standard for Portfolio Management / PMI Standard for Program Management', style: 'navy' }]],
      },
      {
        heading: '5. OPM（Organizational Project Management）',
        items: [
          '==OPM==（Organizational Project Management, 組織的プロジェクトマネジメント）: ポートフォリオ・プログラム・プロジェクトの==統合管理==フレームワーク',
          '__目的__:',
          '　==戦略==から==実行==への==一貫性==',
          '　==組織全体==のプロジェクト管理==成熟度==向上',
          '__主要要素__:',
          '　==ポートフォリオ管理==（戦略整合）',
          '　==プログラム管理==（便益管理）',
          '　==プロジェクト管理==（成果物管理）',
          '　==組織能力==（人材・プロセス・ツール）',
          '__OPM3__（Organizational Project Management Maturity Model）: 組織の==プロジェクト管理成熟度==を==5段階==で評価',
          '　==レベル1==: アドホック',
          '　==レベル2==: 反復可能',
          '　==レベル3==: 定義済み',
          '　==レベル4==: 管理',
          '　==レベル5==: 最適化',
        ],
      },
      {
        heading: '6. 戦略整合（Strategic Alignment）',
        items: [
          '==戦略整合==: プロジェクトが==組織戦略==と==整合==している状態',
          '__整合の階層__:',
          '　==組織ビジョン==・==ミッション==',
          '　==戦略目標==（中期計画）',
          '　==ポートフォリオ==（投資配分）',
          '　==プログラム==・==プロジェクト==（実行）',
          '__整合のための仕組み__:',
          '　==ビジネスケース==（プロジェクト選定段階）',
          '　==ベネフィット・マネジメント計画書==（便益実現の追跡）',
          '　==フェーズゲート・レビュー==（戦略整合の継続確認）',
          '　==ポートフォリオ・ダッシュボード==（経営層への可視化）',
          '__戦略の変化__への対応:',
          '　==プロジェクト終結==（戦略変更で不要になった場合）',
          '　==プロジェクト再定義==（スコープ調整）',
          '　==ポートフォリオ再構成==',
          '試験頻出: 「戦略整合の確認」フェーズゲートが正解の設問',
        ],
      },
      {
        heading: '7. プログラム・マネジメントの特徴',
        items: [
          '==プログラム・マネジメント==: 複数の==相互関連プロジェクト==を==統合管理==して==プログラム便益==を実現',
          '__プロジェクトとの違い__:',
          '　==スコープ==: プログラム=大規模・長期、プロジェクト=有期・成果物指向',
          '　==成果==: プログラム===便益==、プロジェクト===成果物==',
          '　==変化==: プログラム=変化を前提、プロジェクト=計画通り',
          '　==役割==: プログラム・マネージャ vs プロジェクト・マネージャ',
          '__主要活動__:',
          '　==プログラム便益マネジメント==',
          '　==プログラム・ステークホルダー・エンゲージメント==',
          '　==プログラム・ガバナンス==',
          '　==プログラム・ライフサイクル管理==',
          '__プロジェクト依存関係__:',
          '　==順序依存==（プロジェクトA → プロジェクトB）',
          '　==並列実行==（同時進行）',
          '　==共有資源依存==',
        ],
        navyItems: [[{ text: '出典: PMI Standard for Program Management 第4版', style: 'navy' }]],
      },
      // ── C. PMO 詳細 ──
      {
        heading: '8. PMO 3類型の詳細（team §30 詳細）',
        items: [
          '※ team §30 で概観済み。本セクションは詳細展開',
          '__支援型 PMO__（Supportive）:',
          '　==コントロール度==: ==低==',
          '　==サービス==: ==テンプレート==／==ベストプラクティス==／==トレーニング==／==情報資源==',
          '　==適用シーン==: PMの成熟度が高く、自律的な組織',
          '　==メリット==: PMの自由度を保持、組織知識の共有',
          '　==デメリット==: 標準遵守の強制力なし',
          '__コントロール型 PMO__（Controlling）:',
          '　==コントロール度==: ==中==',
          '　==サービス==: 支援型 + ==フレームワーク強制==／==準拠状況監査==／==ガバナンス==',
          '　==適用シーン==: 標準化が必要、ガバナンス強化',
          '　==メリット==: 一貫性、リスク管理',
          '　==デメリット==: 官僚的になり得る',
          '__指揮型 PMO__（Directive）:',
          '　==コントロール度==: ==高==',
          '　==サービス==: ==プロジェクト直接管理==／PM を==PMO に配属==',
          '　==適用シーン==: 大規模・戦略重要プロジェクト群',
          '　==メリット==: 完全な一貫性、明確な権限',
          '　==デメリット==: 柔軟性低下、PM の自律性なし',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §2.4.4.3 / Kerzner Project Management Maturity Model', style: 'navy' }]],
      },
      {
        heading: '9. PMO のサービス',
        items: [
          '__PMO の主要サービス__:',
          '　==方法論策定==: ==PMBOK==採用／独自==テーラリング==／==標準テンプレート==',
          '　==トレーニング==: PM スキル開発・認定資格支援',
          '　==プロジェクト支援==: ==コーチング==／==コンサルティング==',
          '　==プロジェクト監督==: 進捗監視・リスク監視・パフォーマンス測定',
          '　==知識管理==: ==教訓リポジトリ==／==事例集==／==コミュニティ==',
          '　==リソース管理==: ==組織横断的リソース配分==',
          '　==ポートフォリオ管理==: ==戦略整合==の確保',
          '　==組織変革管理==: アジャイル導入支援等',
          '__価値指標__:',
          '　==プロジェクト成功率==の改善',
          '　==プロジェクト期間==の短縮',
          '　==コスト超過==の削減',
          '　==顧客満足度==の向上',
        ],
      },
      {
        heading: '10. PMO 成熟度モデル',
        items: [
          '==PMO 成熟度==: PMO の能力・実績の==発展段階==',
          '__代表的なモデル__:',
          '　==PMI OPM3==（Organizational Project Management Maturity Model）: 5段階',
          '　==Kerzner PMMM==（Project Management Maturity Model）: 5段階',
          '　==P3M3==（Portfolio, Programme, Project Management Maturity Model）',
          '__典型的な5段階__:',
          '　==レベル1==: ==アドホック==（場当たり的）',
          '　==レベル2==: ==反復可能==（プロセスはあるが文書化不足）',
          '　==レベル3==: ==定義済み==（プロセス標準化）',
          '　==レベル4==: ==管理==（測定・コントロール）',
          '　==レベル5==: ==最適化==（継続的改善）',
          '__成熟度向上の効果__:',
          '　プロジェクト成功率の向上、コスト・期間の最適化、戦略整合の向上',
        ],
      },
      // ── D. ガバナンス・ボディと意思決定 ──
      {
        heading: '11. ステアリングコミッティ',
        items: [
          '==ステアリングコミッティ==（Steering Committee, 運営委員会）: プロジェクトの==上位意思決定機関==',
          '__主な役割__:',
          '　==プロジェクト方針==の決定',
          '　==フェーズゲート==判定（Go/No-Go）',
          '　==重要変更要求==の承認（PM・CCB の権限外）',
          '　==重大リスク==・==重大問題==への対応',
          '　==スポンサー==への報告',
          '__構成__:',
          '　==スポンサー==（議長）',
          '　==経営層代表==',
          '　==主要ステークホルダー部門長==',
          '　==プロジェクトマネージャ==（報告役、議決権なし）',
          '__開催頻度__: 通常==月次==、フェーズゲート時は==臨時招集==',
          '__CCB との違い__: ステアリングコミッティ=戦略的判断、CCB=変更管理に特化',
          '試験頻出: ステアリングコミッティと CCB の==役割の違い==',
        ],
        navyItems: [[{ text: 'ステアリングコミッティと CCB の違いは午前II 頻出', style: 'navy' }]],
      },
      {
        heading: '12. フェーズゲート（段階的コミット）',
        items: [
          '==フェーズゲート==（Phase Gate, ==Stage Gate==）: フェーズ間の==Go/No-Go 判定ポイント==',
          '__目的__:',
          '　==段階的コミット==（途中で中止する選択肢を残す）',
          '　==戦略整合==の継続確認',
          '　==リスクの早期検出==',
          '　==投資判断==の合理化',
          '__判定基準__:',
          '　==成果物の品質==・受入完了',
          '　==スケジュール==・==コスト==の予実比較',
          '　==リスク==の状況',
          '　==ビジネスケース==の妥当性（戦略・市場変化を反映）',
          '__判定結果__:',
          '　==Go==（次フェーズへ進む）',
          '　==No-Go==（プロジェクト中止）',
          '　==Hold==（条件付き、修正後再判定）',
          '　==Recycle==（前フェーズに戻る）',
          '__Phase Gate 方式__は予測型ライフサイクルに親和、アジャイルでも==リリース・ゲート==として活用',
        ],
        navyItems: [[{ text: 'Cooper の Stage-Gate プロセスが起源。新製品開発で広く採用', style: 'navy' }]],
      },
      {
        heading: '13. 意思決定権限の階層',
        items: [
          '__プロジェクト・ガバナンスの意思決定階層__:',
          '　==ポートフォリオレベル==:',
          '　　==経営層==・==ポートフォリオ委員会==',
          '　　決定対象: 投資配分・プロジェクト選定・中止',
          '　==プログラムレベル==:',
          '　　==プログラム・マネージャ==・==プログラム運営委員会==',
          '　　決定対象: プログラム便益・プロジェクト間調整',
          '　==プロジェクトレベル==:',
          '　　==ステアリングコミッティ==',
          '　　決定対象: フェーズゲート・重大変更',
          '　==プロジェクト内==:',
          '　　==プロジェクトマネージャ==・==CCB==',
          '　　決定対象: 日常運営・通常変更',
          '__エスカレーション・パス__:',
          '　PM → ステアリングコミッティ → ポートフォリオ委員会 → 経営層',
          '__権限と責任の明文化__が重要（プロジェクト憲章・ガバナンス計画書）',
        ],
      },
      // ── E. IT ガバナンスと標準 ──
      {
        heading: '14. COBIT 概観',
        items: [
          '==COBIT==（Control Objectives for Information and Related Technologies）: ==IT ガバナンス==・==IT マネジメント==の==国際標準フレームワーク==',
          '__提供元__: ==ISACA==（Information Systems Audit and Control Association）',
          '__最新版__: COBIT 2019',
          '__目的__:',
          '　==IT 投資==の==価値最大化==',
          '　==IT リスク==の==最適化==',
          '　==IT 資源==の==最適活用==',
          '__主要要素__:',
          '　==ガバナンス目標==（5領域）',
          '　==マネジメント目標==（5領域・35プロセス）',
          '　==パフォーマンス管理==',
          '　==設計ファクター==（テーラリング要因）',
          '__他フレームワークとの関係__:',
          '　ITIL（運用）, ISO/IEC 27001（セキュリティ）, PMBOK（プロジェクト）と==補完的==',
          '__試験出題__: 主に「IT ガバナンスのフレームワーク」として概念問題',
        ],
        navyItems: [[{ text: '出典: ISACA COBIT 2019。情報処理試験では概念問題で出題', style: 'navy' }]],
      },
      {
        heading: '15. JIS Q 38500（IT ガバナンス）',
        items: [
          '==JIS Q 38500==（==ISO/IEC 38500==）: ==組織の IT ガバナンス==に関する==国際規格==',
          '__目的__: ==経営層==が IT の==現在・将来の利用==を==評価・指示・モニター==するための==指針==',
          '__6つの原則__:',
          '　==責任==（Responsibility）: IT の責任を==明確に割当==',
          '　==戦略==（Strategy）: IT 戦略を==事業戦略==に整合',
          '　==取得==（Acquisition）: IT 取得は==適切に評価==',
          '　==パフォーマンス==（Performance）: ==事業要件==を満たす',
          '　==適合==（Conformance）: ==法令・規制==を遵守',
          '　==人間行動==（Human Behaviour）: ==人間==への影響を尊重',
          '__3つのタスク__:',
          '　==評価==（Evaluate）: 現状と将来を評価',
          '　==指示==（Direct）: 計画・方針を指示',
          '　==モニター==（Monitor）: パフォーマンスと適合を監視',
          '__COBIT との関係__: COBIT は JIS Q 38500 の==実装==フレームワーク',
        ],
        navyItems: [[{ text: '出典: JIS Q 38500:2015（ISO/IEC 38500:2015 翻訳）', style: 'navy' }]],
      },
      {
        heading: '16. ISO/IEC 27001（情報セキュリティ）と関連標準',
        items: [
          '==ISO/IEC 27001==: ==情報セキュリティマネジメントシステム==（ISMS）の==国際規格==',
          '__目的__: 組織の==情報資産==を==機密性・完全性・可用性==（CIA）の観点で保護',
          '__PDCA サイクル__で継続的改善',
          '__プロジェクトとの関係__:',
          '　プロジェクト成果物にセキュリティ要件を組み込む',
          '　ベンダー・委託先のセキュリティ管理',
          '　プロジェクト文書・コードのアクセス管理',
          '__関連標準__:',
          '　==ISO 9001==（品質マネジメント）',
          '　==ISO/IEC 20000==（IT サービスマネジメント、service-management §15 参照）',
          '　==ISO 31000==（リスクマネジメント）',
          '　==ISO 21500==（プロジェクトマネジメント）',
          '__プロジェクト・ガバナンスとの統合__: 複数の ISO 規格を==統合マネジメント==',
        ],
      },
      // ── F. 倫理・コンプライアンス・監査 ──
      {
        heading: '17. PMI 倫理規程・行動規範',
        items: [
          '==PMI 倫理規程==（PMI Code of Ethics and Professional Conduct）: PMI 認定資格者の==倫理基準==',
          '__4つの価値観__:',
          '　==責任==（Responsibility）: ==自らの行動==に責任を持つ',
          '　==尊重==（Respect）: ==自分と他者==を尊重する',
          '　==公正==（Fairness）: ==偏見なく==公正に判断',
          '　==誠実==（Honesty）: ==正直==にコミュニケーション',
          '__各価値観__:',
          '　==願望基準==（Aspirational）: 達成すべき理想',
          '　==必須基準==（Mandatory）: 違反は処分対象',
          '__主な違反例__:',
          '　==機密情報==の漏洩',
          '　==利益相反==の隠蔽',
          '　==データ偽装==',
          '　==贈収賄==',
          '__PMI 認定資格者__は==違反通報==義務あり',
          '日本では「==情報処理技術者倫理綱領==」も類似（IPA）',
        ],
        navyItems: [[{ text: '出典: PMI Code of Ethics and Professional Conduct（2007年制定、改訂継続）', style: 'navy' }]],
      },
      {
        heading: '18. コンプライアンス・法令遵守',
        items: [
          '==コンプライアンス==（Compliance）: ==法令==・==規制==・==業界基準==・==組織方針==の遵守',
          '__プロジェクトでの主要対象__:',
          '　==労働法==（労働時間・残業・休日）',
          '　==下請法==（project-work §23 参照）',
          '　==個人情報保護法==（GDPR 含む）',
          '　==独占禁止法==',
          '　==著作権法==（職務著作）',
          '　==業界規制==（金融・医療・原子力等の個別法令）',
          '　==国際規制==（GDPR・CCPA・米国輸出規制）',
          '__コンプライアンス・プログラム__:',
          '　==規程整備==',
          '　==教育・研修==',
          '　==監査==',
          '　==通報制度==（whistleblower hotline）',
          '　==違反対応プロセス==',
          '__プロジェクト計画書__にコンプライアンス要件を==明記==',
        ],
      },
      {
        heading: '19. プロジェクト監査',
        items: [
          '==プロジェクト監査==（Project Audit）: プロジェクトの==独立した評価==',
          '__種類__:',
          '　==プロセス監査==: ==PM プロセス==の==遵守==状況',
          '　==パフォーマンス監査==: ==コスト==・==スケジュール==・==品質==の評価',
          '　==コンプライアンス監査==: ==法令==・==規程==の遵守',
          '　==セキュリティ監査==: ==情報セキュリティ==の評価',
          '__実施者__:',
          '　==内部監査==（==社内監査部門==）',
          '　==外部監査==（==独立第三者==）',
          '　==自己評価==（==プロジェクトチーム自身==、教訓と並行）',
          '__実施タイミング__:',
          '　==フェーズゲート==前',
          '　==プロジェクト終結==時',
          '　==重大問題発生==時',
          '　==定例==（大規模プロジェクト）',
          '__成果物__: ==監査報告書==・==是正処置勧告==',
          '__PMO__が監査の==コーディネート==を担うことが多い',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '20. 過去問頻出論点（午前II）',
        items: [
          '__ポートフォリオ／プログラム／プロジェクト 3階層__: 目的の違い（価値最大化／便益／成果物）',
          '__PMO 3類型__: 支援型／コントロール型／指揮型のコントロール度',
          '__ステアリングコミッティ vs CCB__: 戦略判断 vs 変更管理',
          '__フェーズゲート__: Go/No-Go 判定・段階的コミット',
          '__COBIT__: ==IT ガバナンス==フレームワーク・ISACA 提供',
          '__JIS Q 38500__: 6原則・3タスク（評価・指示・モニター）',
          '__OPM3__: 5段階成熟度モデル',
          '__PMI 倫理規程__: 4価値観（責任・尊重・公正・誠実）',
          '__プロジェクト監査__: 内部監査 vs 外部監査・実施タイミング',
          '__コンプライアンス__: 下請法・個人情報保護法・独占禁止法・著作権法',
        ],
      },
      {
        heading: '21. ひっかけパターン',
        items: [
          '__プロジェクトマネジメント vs ガバナンス__: 実行 vs 監督',
          '__ポートフォリオ vs プログラム vs プロジェクト__: 戦略 vs 便益 vs 成果物',
          '__PMO 3類型__: 支援型（低）・コントロール型（中）・指揮型（高）のコントロール度の混同',
          '__ステアリングコミッティ vs CCB__: 戦略的判断（前者）vs 変更管理（後者）',
          '__フェーズゲート__: Go/No-Go だけでなく Hold/Recycle もある',
          '__COBIT vs ITIL__: COBIT=IT ガバナンス全体、ITIL=IT サービス運用（service-management §15 参照）',
          '__JIS Q 38500__: 6原則のうち「人間行動」が含まれる',
          '__PMI 倫理__: 願望基準 vs 必須基準の区別',
          '__プロジェクト監査__: 進行中も実施（終結時だけではない）',
          '__PMBOK6 vs PMBOK7__: 第6版は分散記述、第7版は12原則「スチュワードシップ」「価値」で扱う',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋PMI関連標準を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
      {
        heading: '22. ガバナンスと他カテゴリの相互参照',
        items: [
          '本カテゴリは他カテゴリと==深く関連==:',
          '　==team §30== PMO 3類型概観（本カテゴリ §8 で詳細）',
          '　==stakeholder §32== PMBOK6 ステークホルダー・マネジメント 4プロセス',
          '　==integration §6== ビジネス文書（戦略整合）',
          '　==integration §13== 統合変更管理・CCB',
          '　==project-work §23== コンプライアンス（下請法・著作権）',
          '　==service-management §15== ITIL・ISO/IEC 20000（後述）',
          '__統合的理解__:',
          '　ガバナンス＝枠組み、マネジメント＝実行、リーダーシップ＝動かす',
          '　3層構造を意識して各カテゴリを横断的に学習',
        ],
        navyItems: [[{ text: '相互参照ガイド。ガバナンスは横断的領域のため、他カテゴリと併読推奨', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==ポートフォリオ／プログラム／プロジェクト==の3階層と目的の違い（価値最大化／便益／成果物）。',
      '【PMO 3類型】支援型（低）・コントロール型（中）・指揮型（高）のコントロール度。',
      '【ステアリングコミッティ】戦略的判断・フェーズゲート判定・重大変更承認。==CCB との違い==に注意。',
      '【フェーズゲート】Go/No-Go 判定・段階的コミット。Hold/Recycle もあり得る。',
      '【COBIT】ISACA 提供の IT ガバナンス・IT マネジメント国際フレームワーク。',
      '【JIS Q 38500】6原則（責任・戦略・取得・パフォーマンス・適合・人間行動）と3タスク（評価・指示・モニター）。',
      '【OPM3】5段階成熟度（アドホック → 反復可能 → 定義済み → 管理 → 最適化）。',
      '【PMI 倫理】4価値観（==責任==・==尊重==・==公正==・==誠実==）と願望/必須基準の区別。',
      '【プロジェクト監査】内部/外部監査・実施タイミング（フェーズゲート前・終結時・問題発生時・定例）。',
      '【PMBOK版差分】本ノートは第6版＋第7版を統合。==プロジェクト・ガバナンス==は第6版 §2.4.5、==スチュワードシップ==原則は第7版が出典。',
    ],
  },

  // ───────────────────────────────────────────
  // 11. テーラリング・モデル（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'tailoring-models': {
    summary:
      'プロジェクト特性に応じて==プロセス==・==手法==・==成果物==を==調整==する活動領域。PMBOK第6版では各章末「テーラリング」と==付録 X1==、第7版では==独立セクション==として体系化＋==主要モデル/手法/成果物==の一覧化。==テーラリング判断要素==・==コンプレクシティモデル==（==Cynefin==・==Stacey==）・==変革モデル==（==ADKAR==・==コッターの8段階==）が試験頻出。',
    sections: [
      // ── A. テーラリング概観 ──
      {
        heading: '1. テーラリングの定義と重要性',
        items: [
          '==テーラリング==（Tailoring）: プロジェクト特性に応じて==プロセス==・==手法==・==成果物==を==調整==する活動',
          '__目的__:',
          '　プロジェクトの==成功確率==を最大化',
          '　==オーバーエンジニアリング==の回避',
          '　==アンダーマネジメント==の回避',
          '__テーラリングの対象__:',
          '　==プロセス==（実施する/しない・どの順序で）',
          '　==成果物==（必要なものだけ作成）',
          '　==役割と責任==（規模に応じた配置）',
          '　==ライフサイクル==（予測型/適応型/ハイブリッド）',
          '　==ツール==・==ガバナンス==',
          '__PMBOK第7版が特に強調__: 「==テーラリング==」が==12原則==の1つ',
          '__PMBOK第6版__: 各知識エリアの章末に「テーラリング考慮事項」を記載 + 付録 X1',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 付録 X1 / PMBOK第7版「テーラリング」セクション', style: 'navy' }]],
      },
      {
        heading: '2. テーラリングの判断要素',
        items: [
          '__主要判断要素__:',
          '　==プロジェクト規模==:',
          '　　大規模 → 詳細プロセス・完全な文書化',
          '　　小規模 → 軽量プロセス・最小限の文書',
          '　==複雑性==:',
          '　　複雑 → 段階的詳細化・反復',
          '　　単純 → 直線的進行',
          '　==不確実性レベル==:',
          '　　高 → 適応型・反復アプローチ',
          '　　低 → 予測型・計画駆動',
          '　==チーム経験==:',
          '　　高 → 自律的アプローチ',
          '　　低 → 詳細ガイダンス',
          '　==組織成熟度==:',
          '　　高 → カスタマイズ',
          '　　低 → 標準テンプレート',
          '　==規制環境==:',
          '　　厳格 → フル文書化・監査対応',
          '　　緩い → 軽量プロセス',
          '　==戦略重要度==:',
          '　　高 → 経営層関与・ガバナンス強化',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版「テーラリング」§3', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第7版におけるテーラリングの位置づけ',
        items: [
          'PMBOK第7版は==テーラリングを中核概念==として扱う',
          '__12原則__の1つ「==テーラリング==」:',
          '　「プロジェクト固有のコンテキストに基づいて==テーラリング==する」',
          '__テーラリングの4ステップ__:',
          '　==1. 初期アプローチ選択==（予測型/適応型/ハイブリッド）',
          '　==2. 組織に合わせて調整==',
          '　==3. プロジェクトに合わせて調整==',
          '　==4. 継続的改善==',
          '__第6版との違い__:',
          '　第6版: ==各プロセス==の==テーラリング考慮事項==',
          '　第7版: ==アプローチ全体==の==テーラリング==',
          '__テーラリング判断ワークシート__:',
          '　各要素を評価して==推奨アプローチ==を導出するツール',
          '　例: 「不確実性高 + チーム経験少」→ 「ハイブリッド・経験豊富な PM 配置」',
        ],
      },
      {
        heading: '4. テーラリング・プロセス',
        items: [
          '__推奨されるテーラリング・プロセスの5ステップ__:',
          '　==1. 状況評価==',
          '　　プロジェクト特性・組織コンテキスト・ステークホルダーの把握',
          '　==2. 標準を選定==',
          '　　組織標準 / 業界標準 / PMBOK ガイド から==出発点==を選ぶ',
          '　==3. 調整==',
          '　　==追加==（必要なプロセスを足す）',
          '　　==削除==（不要なプロセスを省く）',
          '　　==修正==（プロセスの==粒度==・==順序==を変える）',
          '　==4. 試行==',
          '　　==小規模テスト==・==パイロット==で確認',
          '　==5. 改善==',
          '　　教訓を反映、組織標準にフィードバック',
          '__テーラリング結果の文書化__:',
          '　==プロジェクトマネジメント計画書==に==テーラリング理由==を明記',
          '　==組織のプロセス資産==（OPAs）に==フィードバック==',
        ],
      },
      // ── B. PMBOK第7版 主要モデル ──
      {
        heading: '5. PMBOK第7版 主要モデルの概観',
        items: [
          'PMBOK第7版は==主要モデル==を==分類==して提示（第4章 §4.1）',
          '__モデルの定義__: ==現実==を==単純化==して==理解==・==予測==・==制御==するための==枠組み==',
          '__モデルのカテゴリ__:',
          '　==状況対応モデル==: リーダーシップ・コミュニケーション・対人スタイル',
          '　==プロセスモデル==: PDCA・DMAIC・継続的改善',
          '　==変革モデル==: 組織変革・人々の変革管理',
          '　==コンプレクシティモデル==: Cynefin・Stacey・複雑系対応',
          '　==プロジェクト・ライフサイクル==: 予測型/適応型/ハイブリッド（development-approach §2 参照）',
          '__モデル使用の利点__:',
          '　==共通言語==の確立',
          '　==判断==の==合理化==',
          '　==経験==の==継承==',
          '__注意__: モデルは==現実を完全には反映しない==。状況に応じた==テーラリング==が必要',
        ],
        navyItems: [[{ text: '出典: PMBOK第7版 §4.1 主要モデル', style: 'navy' }]],
      },
      {
        heading: '6. 状況対応モデル（リーダーシップ・コミュニケーション）',
        items: [
          '__主要な状況対応モデル__（既出カテゴリの参照を含む）:',
          '　==リーダーシップ==:',
          '　　==SL理論==（Hersey & Blanchard, team §9 参照）',
          '　　==マネジリアル・グリッド==（Blake & Mouton, team §8 参照）',
          '　　==パスゴール理論==（House, team §10 参照）',
          '　==コミュニケーション==:',
          '　　==プッシュ/プル/インタラクティブ==（stakeholder §24 参照）',
          '　　==コミュニケーション・モデル==（送信者・符号化・媒体・復号・受信者, stakeholder §25 参照）',
          '　==対人スタイル==:',
          '　　==DISC モデル==（Dominance/Influence/Steadiness/Conscientiousness）',
          '　　==MBTI==（Myers-Briggs Type Indicator）',
          '　==紛争対応==:',
          '　　==トーマス・キルマン==（team §32 参照）',
          '__テーラリング__:',
          '　チーム・ステークホルダーの==特性==に応じてモデルを選択',
        ],
      },
      {
        heading: '7. プロセスモデル（PDCA・DMAIC・継続的改善）',
        items: [
          '__主要プロセスモデル__:',
          '　==PDCA==（Plan-Do-Check-Act, Deming サイクル, delivery §18 参照）',
          '　==DMAIC==（Define-Measure-Analyze-Improve-Control, Six Sigma, delivery §17 参照）',
          '　==DMADV==（Define-Measure-Analyze-Design-Verify, 新規設計）',
          '　==PDSA==（Plan-Do-Study-Act, PDCA の派生）',
          '　==OODA==（Observe-Orient-Decide-Act, 軍事起源・適応型）',
          '　==カイゼン==（リーン思想, development-approach §11 参照）',
          '__選定基準__:',
          '　==PDCA==: 既存プロセスの改善',
          '　==DMAIC==: 既存プロセスの==データ駆動改善==',
          '　==DMADV==: ==新規==プロセス・製品設計',
          '　==OODA==: ==高変動==環境での意思決定',
          '__プロジェクトでの活用__:',
          '　==継続的改善==の==基盤フレームワーク==',
          '　==パフォーマンス測定==と組み合わせ',
        ],
      },
      {
        heading: '8. 変革モデル（ADKAR・コッターの8段階）',
        items: [
          '__組織変革モデル__:',
          '　==ADKAR==（Prosci, 個人の変革プロセス）:',
          '　　==Awareness==（変革の認識）',
          '　　==Desire==（変革への意欲）',
          '　　==Knowledge==（変革の方法）',
          '　　==Ability==（実行能力）',
          '　　==Reinforcement==（定着）',
          '　==コッターの8段階==（Kotter, 組織変革の段階）:',
          '　　==1. 危機感の醸成==',
          '　　==2. 変革推進連合==の構築',
          '　　==3. ビジョン==・==戦略==の創出',
          '　　==4. ビジョンの伝達==',
          '　　==5. エンパワーメント==',
          '　　==6. 短期的成果==',
          '　　==7. 成果の活用==・==更なる変革==',
          '　　==8. 文化への定着==',
          '　==Bridges Transition Model==:',
          '　　==終わり==（Ending）→ ==中立圏==（Neutral Zone）→ ==始まり==（New Beginning）',
          '__プロジェクトでの活用__:',
          '　大規模システム導入・組織再編・新業務プロセス導入',
          '__組織変革管理__は PMI 認定資格 ==PMI-OCP==（Organizational Change Practitioner）でも扱う',
        ],
        navyItems: [[{ text: 'ADKAR（Prosci, 1990s）／コッターの8段階（1996）／Bridges Transition Model は変革管理の3代表モデル', style: 'navy' }]],
      },
      {
        heading: '9. コンプレクシティモデル（Cynefin・Stacey）',
        items: [
          '__複雑性管理モデル__: ==状況の複雑性==に応じたアプローチ選定',
          '==Cynefin フレームワーク==（David Snowden）:',
          '　==単純==（Simple/Clear）: ベストプラクティス、原因-結果が==明確==',
          '　==困難==（Complicated）: 専門知識で分析可能、原因-結果が==分析で判明==',
          '　==複雑==（Complex）: 創発的、原因-結果は==事後==に==判明==',
          '　==混沌==（Chaotic）: 危機状態、まず==行動==',
          '　==無秩序==（Disorder）: どの領域か==不明==',
          '　アプローチ:',
          '　　==単純==: ベストプラクティス遵守',
          '　　==困難==: グッドプラクティス・専門家',
          '　　==複雑==: 創発的プラクティス・実験',
          '　　==混沌==: 新規プラクティス・行動優先',
          '==Stacey マトリクス==（Ralph Stacey）:',
          '　縦軸: ==要求の不確実性==',
          '　横軸: ==技術の不確実性==',
          '　4領域: ==単純==・==複雑==・==複雑系==・==無秩序==',
          '　==アジャイル適用領域==: ==複雑==・==複雑系==',
          '__プロジェクトへの示唆__:',
          '　単純・困難 → 予測型',
          '　複雑・複雑系 → 適応型（アジャイル）',
          '　混沌 → 危機管理対応',
        ],
        navyItems: [[{ text: 'Cynefin（1999, IBM）／Stacey（1996）。アジャイル適用判断の理論的根拠', style: 'navy' }]],
      },
      // ── C. PMBOK第7版 主要手法 ──
      {
        heading: '10. PMBOK第7版 主要手法の概観',
        items: [
          'PMBOK第7版は==主要手法==を==カテゴリ別==に整理（第4章 §4.2）',
          '__手法のカテゴリ__:',
          '　==データ収集・分析==: ブレーンストーミング・インタビュー・SWOT・チェックリスト',
          '　==見積もり==: 類推・パラメトリック・ボトムアップ・3点（PERT）（planning §15/20 参照）',
          '　==会議・対人==: ファシリテーション・キックオフ・レトロスペクティブ',
          '　==曖昧さ管理==: プロトタイピング・実験・スパイク',
          '　==変更管理==: CCB・統合変更管理（integration §13 参照）',
          '__手法 vs プロセス__:',
          '　==プロセス==（PMBOK6 第6版）: 入力→技法→出力の==連続体==',
          '　==手法==（PMBOK7 第7版）: ==単独==で使える==ツール==',
          '__テーラリング__:',
          '　プロジェクトに必要な手法だけを==選択==・==組合せ==',
        ],
      },
      {
        heading: '11. データ収集・分析手法',
        items: [
          '__データ収集手法__:',
          '　==ブレーンストーミング==: アイデアの==量==重視',
          '　==フォーカスグループ==: 6〜10名の構造化議論',
          '　==インタビュー==: 1対1・構造化/半構造化',
          '　==アンケート==・==調査==: 大規模・統計的',
          '　==観察==: 行動の==直接観察==',
          '　==プロトタイピング==: 動くモデルでフィードバック取得',
          '　==ベンチマーキング==: 業界ベストプラクティス比較',
          '__データ分析手法__:',
          '　==根本原因分析==: 5 Why・特性要因図（フィッシュボーン, delivery §22 参照）',
          '　==SWOT分析==: 強み/弱み/機会/脅威',
          '　==代替案分析==: 複数選択肢の比較',
          '　==プロセス分析==: バリューストリームマッピング・フローチャート',
          '　==コスト便益分析==: NPV・IRR・回収期間（planning §24 参照）',
          '　==トレンド分析==: 時系列での傾向把握（measurement §13 参照）',
          '　==差異分析==: 計画 vs 実績',
          '　==感度分析==: トルネード図（uncertainty §10 参照）',
        ],
      },
      {
        heading: '12. 見積もり手法',
        items: [
          '__4つの主要見積もり手法__（planning §15/§20 で詳細扱い）:',
          '　==類推見積もり==（Analogous）: 過去類似プロジェクトから==トップダウン==',
          '　==パラメトリック見積もり==（Parametric）: ==単価×数量==の統計的関係',
          '　==ボトムアップ見積もり==（Bottom-Up）: WBS 各要素積み上げ、==最高精度==',
          '　==3点見積もり==（Three-Point）: 楽観値/最確値/悲観値',
          '　　==三角分布==: (O+M+P)/3',
          '　　==ベータ分布（PERT）==: (O+4M+P)/6',
          '__派生手法__:',
          '　==プランニング・ポーカー==: アジャイルでのストーリーポイント相対見積もり',
          '　==Tシャツサイズ==: XS/S/M/L/XL の粒度見積もり',
          '　==ワイドバンド・デルファイ==: 専門家の==独立見積もり==の収束',
          '　==ファンクションポイント法==: 機能規模測定',
          '　==COCOMO==（Constructive Cost Model）: ソフトウェア開発見積もり',
        ],
      },
      {
        heading: '13. 会議・対人手法',
        items: [
          '__主要会議体__:',
          '　==キックオフ・ミーティング==: プロジェクト開始時',
          '　==デイリースタンドアップ==: アジャイルの日次15分',
          '　==ステアリングコミッティ==: 月次・フェーズゲート判定（§11 参照）',
          '　==ステータスレビュー==: 進捗報告',
          '　==リスクレビュー==: リスク状況確認',
          '　==スプリント・レビュー==: アジャイルのデモ',
          '　==レトロスペクティブ==: チームの==振り返り==・==改善==',
          '__対人手法__:',
          '　==ファシリテーション==: 中立的な議論進行',
          '　==アクティブ・リスニング==: 相手の発言を要約・確認',
          '　==コーチング==: 部下・メンバーの成長支援',
          '　==メンタリング==: 経験豊富な人材による継続的指導',
          '　==フィードバック==: 行動への評価・改善提案',
          '　==交渉==: Win-Win 解決の探索',
          '　==コンフリクト・マネジメント==: トーマス・キルマン5モード（team §32 参照）',
        ],
      },
      {
        heading: '14. 曖昧さ管理手法',
        items: [
          'PMBOK第7版で新たに体系化された==曖昧さ管理==の手法',
          '__目的__: ==不確かさ==・==複雑性==・==変動性==への==実践的対応==',
          '__主要手法__:',
          '　==プロトタイピング==: 動くモデルで==早期検証==',
          '　==実験==（Experiment）: 仮説の==検証==・==反証==',
          '　==スパイク==（Spike）: アジャイルの==技術検証スプリント==',
          '　==MVP==（Minimum Viable Product, 最小実用製品）',
          '　==段階的詳細化==（Progressive Elaboration, planning §3 参照）',
          '　==ローリングウェーブ計画==',
          '　==オプションリアル==（Real Options）: 段階的投資判断',
          '__アジャイル親和性__:',
          '　==短い反復==で==学習==',
          '　==早期失敗==（Fail Fast）の促進',
          '　==適応性==の確保',
          '__予測型でも活用可能__: フィージビリティ・スタディ・パイロット',
        ],
        navyItems: [[{ text: 'PMBOK第7版で「曖昧さ管理」が体系化。VUCA 時代の必須スキル', style: 'navy' }]],
      },
      // ── D. PMBOK第7版 主要成果物 ──
      {
        heading: '15. PMBOK第7版 主要成果物の概観',
        items: [
          'PMBOK第7版は==主要成果物==を==カテゴリ別==に整理（第4章 §4.3）',
          '__成果物のカテゴリ__:',
          '　==戦略文書==: ビジネスケース・プロジェクト憲章',
          '　==計画書==: PMP・サブシディアリー計画書',
          '　==報告書==: ステータスレポート・トレンドレポート・予測レポート',
          '　==監査・終結文書==: 監査報告書・最終報告書・教訓登録簿',
          '__成果物 vs 副産物__:',
          '　==成果物==（Deliverable）: ==プロジェクト目的==を達成するためのアウトプット',
          '　==副産物==（By-product）: 副次的に生成（教訓・関係性等）',
          '__テーラリング__:',
          '　必要な成果物だけを==選択==して作成',
          '　==過剰な文書化==（オーバーエンジニアリング）の回避',
        ],
      },
      {
        heading: '16. 戦略文書（憲章・ビジネスケース）',
        items: [
          '__戦略文書__: プロジェクトの==戦略的根拠==・==方向性==を示す文書',
          '__主要戦略文書__:',
          '　==ビジネスケース==（Business Case）:',
          '　　投資の==正当化==・==代替案分析==・==推奨案==・==成功評価基準==',
          '　　プロジェクト==前==に作成（integration §6 参照）',
          '　==ベネフィット・マネジメント計画書==:',
          '　　==便益実現==の計画・ターゲット便益・実現時期・オーナー',
          '　==プロジェクト憲章==（integration §4/§5 参照）',
          '　==プロジェクト・スコープ記述書==（planning §7 参照）',
          '__戦略文書の特徴__:',
          '　==上位レベル==の記述',
          '　==プロジェクト全体==を通じて==参照==される',
          '　==承認==が必要（スポンサー・経営層）',
        ],
      },
      {
        heading: '17. 計画書・管理計画書',
        items: [
          '__計画書の階層__:',
          '　==プロジェクトマネジメント計画書==（PMP, integration §7 参照）',
          '　　==3ベースライン==（スコープ・スケジュール・コスト）',
          '　　==10サブシディアリー計画書==',
          '　==サブシディアリー計画書==（10種類、planning §2 参照）:',
          '　　スコープ・スケジュール・コスト・品質・資源',
          '　　コミュニケーション・リスク・調達・ステークホルダー',
          '　　要求事項マネジメント',
          '　==補助計画書==:',
          '　　変更管理・構成管理・パフォーマンス測定',
          '__計画書の特徴__:',
          '　==生きた文書==（プロジェクト進行中に更新）',
          '　==ベースライン承認後==は==統合変更管理==経由で更新',
          '　==テーラリング対象==（規模に応じて簡素化可能）',
        ],
      },
      {
        heading: '18. 報告書・監査・終結文書',
        items: [
          '__報告書__（project-work §18 参照）:',
          '　==ステータスレポート==・==トレンドレポート==・==予測レポート==・==バリアンスレポート==',
          '__監査・終結文書__:',
          '　==監査報告書==（§19 参照、ガバナンスカテゴリ）',
          '　==最終プロジェクト報告書==（Final Report）:',
          '　　プロジェクト全体の総括・成功要因・失敗要因',
          '　==教訓登録簿==（Lessons Learned Register, project-work §21 参照）',
          '　==プロジェクト終結文書==:',
          '　　成果物受入確認書・契約終結書・資源解放通知',
          '__組織のプロセス資産__（OPAs）への==フィードバック==:',
          '　==テンプレート==の改訂',
          '　==プロセス改善==の反映',
          '　==知識リポジトリ==への登録',
        ],
      },
      // ── E. テーラリングの実践 ──
      {
        heading: '19. テーラリング判断ワークシート',
        items: [
          '==テーラリング判断ワークシート==: 各要素を==評価==して==推奨アプローチ==を導出するツール',
          '__典型的な構成__:',
          '　==要素==（行）: 規模・複雑性・不確実性・チーム経験・規制・戦略重要度',
          '　==評価軸==（列）: 低・中・高',
          '　==推奨アプローチ==（セル）: 予測型/適応型/ハイブリッドの度合い',
          '__例__:',
          '　規模 大 + 複雑性 高 + 不確実性 中 → ==ハイブリッド==（PMO 関与）',
          '　規模 小 + 複雑性 低 + 不確実性 低 → ==軽量予測型==',
          '　規模 中 + 不確実性 高 + 規制 緩い → ==適応型==（アジャイル）',
          '__使用タイミング__:',
          '　==プロジェクト開始時==（初期アプローチ選定）',
          '　==フェーズゲート==（継続的調整）',
          '　==重大変更==時（アプローチ見直し）',
          '__組織標準__に==テーラリング・ガイド==として保持することが多い',
        ],
      },
      {
        heading: '20. アジャイル vs ウォーターフォール テーラリング',
        items: [
          '__テーラリングの代表的選択肢__:',
          '　==ピュア・アジャイル==:',
          '　　全工程アジャイル、Scrum/XP 等',
          '　　==適合==: 小規模・高不確実・チーム経験豊富',
          '　==ピュア・ウォーターフォール==:',
          '　　予測型、フェーズ順次',
          '　　==適合==: 大規模・低不確実・規制厳格',
          '　==ハイブリッド==（実態として==最多==）:',
          '　　==フェーズ別==: 要件は予測型・開発は適応型',
          '　　==成果物別==: ハードは予測型・ソフトは適応型',
          '　　==組織別==: 一部チームのみ適応型',
          '　　==段階移行==: 予測型から徐々にアジャイル導入',
          '__判断のヒント__:',
          '　==規制厳格== → 予測型寄り',
          '　==顧客フィードバック要== → 適応型寄り',
          '　==チーム経験少== → 予測型から段階移行',
          '　==スコープ不確実== → 適応型',
          '__成功要因__:',
          '　==組織変革管理==の伴走',
          '　==経験者==の配置（コーチ・スクラムマスター）',
          '　==継続的改善==の文化',
        ],
        navyItems: [[{ text: 'development-approach §27 ハイブリッド・アプローチも併読推奨', style: 'navy' }]],
      },
      // ── F. IPA PM試験 出題傾向 ──
      {
        heading: '21. 過去問頻出論点（午前II）',
        items: [
          '__テーラリングの定義__・PMBOK7 における重要性',
          '__判断要素__: 規模・複雑性・不確実性・チーム経験・規制',
          '__Cynefin__: 4領域（単純・困難・複雑・混沌）+ 無秩序',
          '__Stacey マトリクス__: 要求×技術の不確実性4領域',
          '__PDCA / DMAIC / DMADV__: 改善モデルの違い',
          '__ADKAR__: 5段階（Awareness/Desire/Knowledge/Ability/Reinforcement）',
          '__コッターの8段階__: 危機感→連合→ビジョン→伝達→エンパワー→短期成果→活用→定着',
          '__見積もり手法__: 類推/パラメトリック/ボトムアップ/3点（PERT 含む）',
          '__曖昧さ管理__: プロトタイピング・実験・スパイク・MVP',
          '__ハイブリッド・アプローチ__: フェーズ別・成果物別・段階移行',
        ],
      },
      {
        heading: '22. ひっかけパターン',
        items: [
          '__テーラリング vs カスタマイズ__: 意図的な調整 vs 個別対応（同義に近いが文脈で区別）',
          '__Cynefin の領域__: 単純（Clear）・困難（Complicated）・複雑（Complex）・混沌（Chaotic）の混同',
          '__PDCA vs DMAIC vs DMADV__: 用途の違い（改善 vs データ駆動改善 vs 新規設計）',
          '__ADKAR vs コッター__: 個人の変革（5段階）vs 組織の変革（8段階）',
          '__モデル vs 手法 vs 成果物__: PMBOK7 の3分類の区別',
          '__段階的詳細化 vs ローリングウェーブ__: 同義に近いが、後者は==計画の粒度==に焦点',
          '__スパイク vs プロトタイピング__: スパイク=アジャイルの技術検証スプリント',
          '__MVP vs プロトタイプ__: MVP=実用最小版（リリース可能）、プロトタイプ=検証用（リリース不可）',
          '__PMBOK6 vs PMBOK7__: 第6版は付録 X1 + 章末、第7版は==独立セクション==で体系化',
          '__テーラリング判断__: ==オーバーエンジニアリング==と==アンダーマネジメント==の両方を回避',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・テーラリング】PMBOK第7版で==12原則==の1つに格上げ。判断要素（規模・複雑性・不確実性・チーム経験・規制）を暗記。',
      '【Cynefin】4領域（==単純==・==困難==・==複雑==・==混沌==）+ ==無秩序==。アジャイル適用は==複雑==領域。',
      '【Stacey マトリクス】要求×技術の不確実性。アジャイル領域は==複雑==・==複雑系==。',
      '【プロセスモデル】==PDCA==（改善）／==DMAIC==（データ駆動改善）／==DMADV==（新規設計）／==OODA==（高変動環境）。',
      '【変革モデル】==ADKAR==（個人の5段階）／==コッター==（組織の8段階）／==Bridges==（終わり→中立圏→始まり）。',
      '【見積もり手法】類推（低精度）／パラメトリック（中）／ボトムアップ（最高）／3点（PERT, (O+4M+P)/6）。',
      '【曖昧さ管理】プロトタイピング・実験・==スパイク==（アジャイル）・==MVP==・段階的詳細化。',
      '【主要モデル/手法/成果物】PMBOK7 第4章で==分類==して提示。テーラリング対象。',
      '【ハイブリッド】フェーズ別／成果物別／組織別／段階移行。==実態として最多==。',
      '【PMBOK版差分】第6版は付録 X1 + 各章末テーラリング、第7版は独立セクション + 主要モデル/手法/成果物を==体系化==。',
    ],
  },
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
          <Link to="/notes" className="hover:text-brand transition-colors">ノートモード</Link>
          <span>/</span>
          <span className="text-slate-600">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-2"
                style={{ backgroundColor: '#9d5b8b' }}
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
                highlightedSection === i ? 'border-brand ring-2 ring-brand' : 'border-slate-200'
              }`}
            >
              <div
                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2"
                style={{ backgroundColor: '#9d5b8b' }}
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
                            : 'bg-brand-dark text-white/85 hover:bg-brand-dark'
                        }`}
                      >
                        {protoMask === 'name' ? '名前が赤字 ✓' : '名前を赤字に'}
                      </button>
                      <button
                        onClick={() => setProtoMaskMode(protoMask === 'port' ? 'none' : 'port')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          protoMask === 'port'
                            ? 'bg-red-500 text-white'
                            : 'bg-brand-dark text-white/85 hover:bg-brand-dark'
                        }`}
                      >
                        {protoMask === 'port' ? 'ポートが赤字 ✓' : 'ポートを赤字に'}
                      </button>
                      <div className="w-px h-4 bg-brand-dark mx-0.5" />
                    </>
                  )}
                  {(['green', 'yellow', 'red'] as UnderstandingLevel[]).map((level) => {
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
                  })}
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
              ) : section.navyItems && !section.items ? (
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
                  {(section.items ?? []).map((item, j) => {
                    const m = item.match(/^(　+)/)
                    const level = m ? Math.min(m[1].length, 2) : 0
                    const stripped = m ? item.slice(m[1].length) : item
                    const s = indentStyles(level, 'blue')
                    return (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm leading-relaxed ${s.padClass} ${s.textClass}`}
                      >
                        <span className={`flex-shrink-0 mt-1.5 rounded-full ${s.dotSize} ${s.dotClass}`} />
                        <span>{renderText(stripped, hideRed, maskVersion)}</span>
                      </li>
                    )
                  })}
                  {section.navyItems?.map((tokens, j) => {
                    const { level, stripped } = detectIndent(tokens)
                    const s = indentStyles(level, 'slate')
                    return (
                      <li
                        key={`navy-${j}`}
                        className={`flex items-start gap-2 text-sm leading-relaxed pt-1 ${s.padClass} ${s.textClass}`}
                      >
                        <span className={`flex-shrink-0 mt-1.5 rounded-full ${s.dotSize} ${s.dotClass}`} />
                        <span>{renderTokens(stripped, hideRed, maskVersion)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
              {/* SVG/table 図表（F2-figures で導入） — items/navyItems/その他レンダリングの直後に表示 */}
              {section.figures && section.figures.length > 0 && (
                <div className="px-5 pb-4 space-y-2">
                  {section.figures.map((fig, k) => (
                    <QuestionFigureView key={k} figure={fig} />
                  ))}
                </div>
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
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-brand hover:text-brand-dark transition-colors min-w-0"
              >
                <span className="flex-shrink-0">←</span>
                <span className="truncate">{prevCategory.name}</span>
              </Link>
            ) : <div className="flex-1" />}
            {nextCategory ? (
              <Link
                to={`/notes/${nextCategory.id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-brand hover:text-brand-dark transition-colors min-w-0"
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand-dark transition-colors"
          >
            ← ノート一覧へ
          </Link>
          <Link
            to={`/quiz?mode=topic&category=${category.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#9d5b8b' }}
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
