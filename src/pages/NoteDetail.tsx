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
      'プロジェクトに影響を与える、または影響を受ける個人・組織を識別し、分析・優先順位付け・エンゲージメント計画・監視を行う活動領域。PMBOK第7版では独立したパフォーマンス領域として扱われ、PM試験 午前Ⅱ・午後I 双方で頻出。',
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
          '__主要技法__: 質問書・ブレーンストーミング／ステークホルダー分析・文書分析／マッピング（マトリクス・登録簿）／キックオフでの集合的識別',
          '組織図・プロジェクト憲章・調達文書も識別の入力となる',
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
          'コミュニケーション・マネジメント計画の重要な入力となる',
        ],
        navyItems: [[{ text: '登録簿の構成項目・更新タイミングは午前Ⅱ・午後I 双方で頻出', style: 'navy' }]],
      },
      {
        heading: '10. 識別の入力情報',
        items: [
          '__主要インプット__: ==プロジェクト憲章==（スポンサー・主要顧客が記載）／ビジネス文書／合意書・契約書（外部ステークホルダーが規定）／調達文書',
          '過去プロジェクトの登録簿テンプレート・教訓も活用する',
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
          '目的: 関与戦略・コミュニケーション要求の決定根拠を作る。アウトプットは分析マトリクスと優先順位付きリスト',
          '分析手法に__単一の正解はない__。複数手法を組み合わせて多角的に分析する',
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
          '__計画書の主な項目__: 望ましい関与レベルと現状の差分／必要な情報の種類・頻度・配布方法・時間枠',
          '==コミュニケーション・マネジメント計画書==と密接に連動する',
        ],
        navyItems: [[{ text: '第6版では 13.2「エンゲージメントの計画」（計画プロセス群）の主要アウトプット', style: 'navy' }]],
      },
      {
        heading: '20. エンゲージメント戦略の決定要因',
        items: [
          '__決定要因__: ステークホルダーの優先順位／プロジェクトのフェーズ／組織文化／文化的多様性／過去の教訓／チームの能力',
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
          '上記6Wをコミュニケーション・マネジメント計画書に統合する',
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
        navyItems: [[{ text: '第6版では 13.4「エンゲージメントの監視」（監視・コントロール群）が対応', style: 'navy' }]],
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
          '変更管理委員会（CCB）でステークホルダー視点を考慮した影響評価を実施',
          '承認された変更はコミュニケーション計画・登録簿・分析マトリクスに反映',
        ],
      },

      // ── F+. PMBOK第6版 統合（F2-P0 で追加） ──
      {
        heading: '32. PMBOK第6版「ステークホルダー・マネジメント」知識エリアの4プロセス',
        items: [
          'PMBOK第6版は第13章の知識エリアとして==4プロセス==で整理する。プロセス群所属がひっかけ頻出',
          '__13.1 ステークホルダーの特定__: ==立上げプロセス群==（計画群と誤答しやすい）。主要アウトプットは==ステークホルダー登録簿==',
          '__13.2 エンゲージメントの計画__: 計画プロセス群。主要アウトプットは==エンゲージメント計画書==',
          '__13.3 エンゲージメントのマネジメント__: 実行プロセス群。関与の実践・期待への対応',
          '__13.4 エンゲージメントの監視__: 監視・コントロール群。関与評価マトリクスで現状を評価',
        ],
      },
      {
        heading: '33. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==（49プロセス・ITTO形式）／__第7版__: ==原則ベース==（12原則＋8パフォーマンス領域）',
          '__IPA PM試験__: 午前Ⅱは第6版用語（登録簿・エンゲージメント計画書・13.x）中心。第7版概念（サーバントリーダーシップ・価値実現）も増加',
        ],
      },

      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '34. 過去問頻出論点（午前Ⅱ）',
        items: [
          '==ステークホルダー登録簿==の記載項目（識別情報・評価情報・分類）',
          '==Power/Interest Grid==の象限と対応戦略',
          '==サリエンスモデル==の3属性（Power/Legitimacy/Urgency）',
          '==関与レベル==5段階（不認識〜主導）',
          '==13.1 特定==は立上げプロセス群（プロセス群所属のひっかけ）',
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
        navyItems: [[{ text: '本アプリは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '36. 午後Ⅰの定石（ステークホルダー）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのステークホルダー系設問は「対立・抵抗・巻き込み不足」の状況に定石を当てはめ、理由を30〜40字で書く。以下を解答の根拠に使う',
          '__1. 全社案件は経営層を後ろ盾に__: 部門をまたぐ協力要請は、経営層の==承認・コミットメント==を先に取り付けトップダウンで通す（R2問1・R4問3）',
          '__2. ステークホルダーは会議体の外まで探す__: 声の大きい出席者だけでなく、影響を受けるのに不在の関係者（他部門・利用部門・規制対応）を洗い出す（H26問1・H25問2）',
          '__3. 影響を受ける人は構想段階から巻き込む__: 完成後に見せると抵抗になる。要件定義・検証へ==早期に参加==させ協働で作る（H28問1・R2問3）',
          '__4. 抵抗には理由のヒアリングから__: キーパーソンの反対は放置せず、==懸念を聞いて解消策を示す==。メリットだけでなく本人の不安に答える（H30問3・H25問3）',
          '__5. 直接説得できない相手は経路を設計__: 本人が信頼する人物（上司・先輩・現場リーダー）==経由で間接的に働きかける==（H27問1）',
          '__6. 会議体の格を合わせる__: 決めたいことに対して==決定権限を持つ人が出る会議体==を設計する。権限のない場で議論しても決まらない（H30問3）',
          '__7. 都合の悪い情報ほど早く開示__: デメリットや遅延予兆を隠すと信頼を失う。==早期の正確な開示==が協力関係の土台（H27問1・H28問2）',
          '__8. 対立部門には共通の利益を示す__: 利害が対立する相手とは、双方が得をする==利害の一致点==を見つけて合意を形成する（H26問1・R4問2）',
          '__9. 経営・出資元の期待はマネジメントする__: 期待を放置すると現場への圧力になる。進め方を説明し==納得を得て==調整する（R5問1）',
          '__10. マルチベンダは境界を共同で確認__: ベンダ間の作業境界の不整合は==共同レビュー==・定例の場で早期に発見する（R3問3・R1問2）',
          '__11. 信頼の役割分担まで設計する__: 誰がどのステークホルダーの信頼を担うかを決めて臨む（R6問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】ステークホルダー登録簿の3区分（識別情報／評価情報／分類）は午前Ⅱ頻出。記載項目を空で言えるレベルまで暗記。',
      '【マトリクス】Power/Interest Grid の4象限と対応戦略（緊密に管理／満足を保つ／情報提供／監視）を図で覚える。',
      '【関与レベル】5段階（不認識→抵抗→中立→支持→主導）と C/D 表記の意味（現状/望ましい状態）を区別。',
      '【サリエンスモデル】3属性（Power/Legitimacy/Urgency）と所持数による分類（Latent=1, Expectant=2, Definitive=3）。',
      '【ひっかけ】Influence と Impact、Power と Influence、登録簿と計画書、13.1 の所属（立上げ群）を正確に。',
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
          'PMBOK第7版「チーム」パフォーマンス領域 = 第6版の==資源マネジメント==知識エリア（旧 人的資源マネジメント・6プロセス）に対応',
          'チームの構築・育成・マネジメント・コンフリクト解決を扱う',
        ],
      },
      {
        heading: '2. チームとグループの違い／プロジェクトチームの構成',
        items: [
          '==グループ==: 共通の目的を持つ個人の集まり。個別の責任で動く',
          '==チーム==: ==共通目標==と==相互依存==を持ち、==共同責任==で動く集団',
          '__専任チーム__（100%割当）と__パートタイムチーム__（機能部門と兼務、マトリクス組織で発生）',
        ],
      },
      {
        heading: '3. リーダーシップとマネジメントの違い',
        items: [
          '==リーダーシップ==: ビジョンを示し人々を動機づける能力。「==正しいことをする==」',
          '==マネジメント==: 計画・組織化・統制で結果を出す能力。「==物事を正しく行う==」',
          'リーダーシップは__役職に依存しない__（メンバーも発揮できる）。PMBOK第7版はリーダーシップを強調',
        ],
      },
      {
        heading: '4. PMBOK第7版 リーダーシップ・スキル',
        items: [
          '__主要スキル__: ビジョン提示／==批判的思考==（仮定を疑い証拠で判断）／モチベーション／対人スキル／==政治的感覚==（利害関係を読み解く）／誠実さと倫理',
          'これらは役割によらずチーム全員に求められる（リーダーシップは分散される）',
        ],
      },
      {
        heading: '5. PMI Talent Triangle — プロジェクトマネージャに求められる役割',
        items: [
          '==PMI Talent Triangle==: PMのコア・コンピテンシーを3軸（テクニカル／リーダーシップ／戦略・ビジネス）で整理し、バランスよく高める',
        ],
      },
      {
        heading: '6. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==（49プロセス・ITTO形式）／__第7版__: ==原則ベース==（12原則＋8パフォーマンス領域）',
          '__IPA PM試験__: 午前Ⅱは第6版用語中心。第7版概念（サーバントリーダーシップ・テーラリング）も増加',
        ],
        navyItems: [[{ text: '試験対策上は両版用語の混同が頻出ひっかけ', style: 'navy' }]],
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
          '__X理論__（McGregor）: 人間は本来==怠惰==で仕事を嫌う → 監督・統制・罰則が必要',
          '__Y理論__（McGregor）: 人間は==自己実現==を求め能動的に働く → 自主性・参画を促す',
          '__Z理論__（Ouchi）: ==日本型経営==に着想。終身雇用・集団意思決定・人間尊重が特徴',
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
          '__主要特性__: オープン・コミュニケーション／共有された理解と当事者意識／信頼／コラボレーション／適応性／==レジリエンス==（回復力）／==エンパワーメント==（権限委譲）／貢献の認知',
        ],
      },
      {
        heading: '20. チーム憲章・グランドルール',
        items: [
          '==チーム憲章==（Team Charter）: チームの価値観・運営ルールを成文化した文書。==資源マネジメント計画==プロセスのアウトプット（9.1）',
          '　記載項目: 価値観／コミュニケーション・ガイドライン／意思決定基準／コンフリクト解決プロセス',
          '==グランドルール==: 日常的な振る舞いの基本ルール（例: 会議は時間通り開始・発言を遮らない）',
          'チーム形成期に==全員参加==で策定することで自主性が生まれる',
        ],
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
          '==バーチャルチーム==（Virtual Team）: 物理的に離れた場所で働くチーム',
          '利点は地理的制約の解消・多様な人材確保。課題はコミュニケーション低下・孤立感・タイムゾーン',
          '__成功要因__: 非同期／同期コミュニケーションの使い分け・ツールの標準化・キックオフ対面で信頼の基盤づくり',
        ],
      },
      {
        heading: '23. PMBOK第6版「チームの育成」プロセス（9.4）',
        items: [
          '==9.4 チームの育成==: ==実行プロセス群==。メンバーのコンピテンシーと相互交流を高めチーム環境を改善する',
          '__代表的な技法__: ==コロケーション==（同じ場所に集める）／==表彰と報奨==／トレーニング／対人スキル',
          '__主要アウトプット__: ==チーム・パフォーマンス評価==',
        ],
        navyItems: [[{ text: '第7版では「チーム」パフォーマンス領域に統合', style: 'navy' }]],
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
          'IPA午前Ⅱ頻出: 弱・均衡・強の特徴一覧',
        ],
      },
      {
        heading: '26. 責任分担マトリクス（RAM）とRACIチャート',
        items: [
          '==RAM==（Responsibility Assignment Matrix, 責任分担マトリクス）: 作業と担当者の対応関係を表で示す（行=WBS要素、列=メンバー、セル=役割）',
          '==RACI==は最も一般的なRAM形式',
          '__R（Responsible, 実行責任）__: ==実際に作業==を行う担当者',
          '__A（Accountable, 説明責任）__: ==最終承認==・==説明責任==を負う者（==1人だけ==）',
          '__C（Consulted, 協議）__: ==助言を求める==専門家。==双方向==コミュニケーション',
          '__I（Informed, 報告先）__: ==結果を報告==される関係者。==一方向==コミュニケーション',
          '==Aは必ず1人==、==R は複数可==。試験頻出ルール',
          '派生形式: ==RACI-VS==（V=Verify、S=Sign-off を追加）／==RASCI==（S=Support）',
        ],
      },
      {
        heading: '27. PMBOK第6版「資源マネジメント計画」プロセス（9.1）',
        items: [
          '==9.1 資源マネジメント計画==: 計画プロセス群。チーム資源と物的資源の見積・獲得・管理の方法を計画する',
          '__主要アウトプット__: ==資源マネジメント計画書==と==チーム憲章==（別アウトプットである点がひっかけ）',
        ],
      },
      {
        heading: '28. PMBOK第6版「活動資源見積もり／資源獲得／資源コントロール」',
        items: [
          '__9.2 活動資源の見積もり__（計画群）: アクティビティに必要な資源の種類と数量を見積もる。アウトプットに==資源ブレークダウン・ストラクチャー==（RBS）',
          '__9.3 資源の獲得__（実行群）: メンバー・施設・設備を獲得。技法に==事前割当==・交渉',
          '__9.6 資源のコントロール__（監視・コントロール群）: ==物的資源==のみが対象。チームの監視は==9.5==（この区別がひっかけ頻出）',
        ],
      },
      {
        heading: '29. 要員管理計画・要員育成・キャリア開発',
        items: [
          '__要員管理計画の主要要素__: 要員獲得／参画期間（資源カレンダー）／==要員解放計画==（終結時の復帰計画）／トレーニング／認知と報奨',
          'プロジェクト経験をスキル獲得の場とし、メンバーのキャリアパスを意識した役割割当を行う',
        ],
      },
      {
        heading: '30. PMO の役割と類型',
        items: [
          '==PMO==（Project Management Office）: プロジェクト管理の標準化・支援を行う組織横断的な部署',
          '　__支援型__（Supportive）: テンプレート提供・ベストプラクティス共有。コントロール度==低==',
          '　__コントロール型__（Controlling）: フレームワーク強制・準拠状況の監査。コントロール度==中==',
          '　__指揮型__（Directive）: プロジェクトを直接管理。コントロール度==高==',
          '他の機能: リソースの組織横断配置／ポートフォリオ管理／方法論策定',
        ],
      },
      // ── F. 紛争マネジメント ──
      {
        heading: '31. プロジェクトでの紛争の発生源',
        items: [
          '__主要発生源7つ__: ==スケジュール==（最頻発）／優先順位／要員／技術的意見／管理手続き／コスト／==個性==（解決最難）',
          '紛争は否定すべきものではなく、適切にマネジメントすることで創造性を生む',
        ],
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
          '==9.5 チームのマネジメント==: ==実行プロセス群==。メンバーのパフォーマンスを追跡しフィードバック・問題解決を行う',
          '__代表的な技法__: ==コンフリクト・マネジメント==（§32 のキルマン5モード）／==感情的知性==／影響力',
          '注: 9.5 は==チーム==の管理、9.6 は==物的資源==のコントロール（混同しない）',
        ],
      },
      {
        heading: '34. 紛争解決の優先順位とエスカレーション',
        items: [
          '__解決の優先順位__: __1.__ ==当事者間で解決==（最優先）→ __2.__ 第三者に仲介依頼 → __3.__ PMが非公式に仲介 → __4.__ PMが公式に調停 → __5.__ 機能部門マネージャへ → __6.__ スポンサー／経営層へ==エスカレーション==（最終手段）',
          '解決できない場合は早期エスカレーションが長期化を防ぐ。条件はチーム憲章に事前明文化',
        ],
      },
      {
        heading: '35. 多文化チーム・多様性への配慮',
        items: [
          '__文化次元__（==Hofstede==）: 権力格差／個人主義vs集団主義／男性性vs女性性／不確実性回避／長期志向vs短期志向／放縦vs抑制の6次元',
          '__配慮事項__: 言語・タイムゾーン（会議時間の輪番）・祝祭日・コミュニケーション・スタイル（直接的／間接的）',
          '文化的差異はコンフリクトの源にも創造性の源にもなる',
        ],
        navyItems: [[{ text: 'Hofstede 文化次元理論。1980年初版、2010年6次元に拡張', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '36. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__リーダーシップ理論__: ==マネジリアル・グリッド==の座標／==SL理論==の4スタイル／==サーバントリーダーシップ==の特徴',
          '__モチベーション理論__: ==マズロー==の階層（特に承認欲求）／==ハーズバーグ==の動機づけ要因 vs 衛生要因／==期待理論==の3要素／==XY理論==の対比',
          '__タックマンモデル__: 5段階の==順序==と==特徴==（特に混乱期の対処）',
          '__RACI__: A は==1人だけ==／R と A の違い／C は==双方向==・I は==一方向==',
          '__組織形態__: 機能型／マトリクス（弱・均衡・強）／プロジェクト型のPM権限',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '38. 午後Ⅰの定石（チーム）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのチーム系設問は「報告が上がらない・指示待ち・育たない」状況に定石を当てはめ、理由を30〜40字で書く',
          '__1. 心理的安全性が問題報告の土台__: 悪い報告こそ歓迎する場を作ると、問題・予兆が==早期に共有==される。非難する場では隠蔽が起きる（H28問2・R4問3・R2問2）',
          '__2. 細かい指示は自発性を奪う__: 統制型の管理は指示待ちを生む。==任せて支える==（自律を促す育成）へ転換する（R4問3・R2問2）',
          '__3. リーダーシップは相手で使い分け__: 前向き・自律的なメンバーには==支援型==、経験不足には指示型。固定しない（R6問3・R5問1）',
          '__4. 朝会で障壁を早期発見__: ==デイリースタンドアップ==の短い共有が、週次把握では深刻化する遅れを防ぐ（R6問3）',
          '__5. 発言しない人の意見を取りに行く__: 全員参加の仕掛け（==無記名アンケート==・個別ヒアリング）で本音・少数意見を拾う（H28問2・R4問3）',
          '__6. 兼務は専任化で立ち上げを加速__: 重要フェーズは==兼務を解消==し集中させる（R2問1）',
          '__7. 要員追加は直後に生産性が落ちる__: 新規要員の==教育・習熟==の間、既存要員の工数も食われる。追加時期と教育コストを織り込む（H27問3）',
          '__8. 属人化は分散する__: 特定個人への==要員集中==は病欠・退職で全体が止まるリスク。知識共有・ペア化で分散（H26問2）',
          '__9. スキル不足は内製育成＋外部知見__: 専門家の支援でギャップを埋めつつ、==技術移転==で内製化する（R4問2・R2問1）',
          '__10. 将来の展開要員を今から参加させる__: 横展開を見据え、次の担い手を==プロジェクト内で育成==する（R2問1・H30問3）',
          '__11. グラウンドルールで行動を揃える__: 行動の基本原則を==全員で策定==すると自分事になる（R2問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==サーバントリーダーシップ==／==SL理論==のS1〜S4／==マネジリアル・グリッド==の9,9 は午前Ⅱ頻出。',
      '【モチベーション】==マズロー==5階層／==ハーズバーグ==二要因（給与=衛生・承認=動機づけ）／==期待理論==（E×I×V）の対比。',
      '【タックマン】5段階の==順序==（形成→混乱→規範→遂行→解散）。混乱期はスキップ不可。',
      '【RACI】==A は1人だけ==、==R は複数可==、C は==双方向==、I は==一方向==。',
      '【ひっかけ】==期待理論 vs 公平理論==、==XY vs Z==、==9.5（チーム）vs 9.6（物的資源）==、マトリクス弱・均衡・強の混同に注意。',
    ],
  },

  // ───────────────────────────────────────────
  // 3. 開発アプローチ（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'development-approach': {
    summary:
      'プロジェクトを進める手順とリリース戦略を扱う活動領域。予測型（ウォーターフォール）／適応型（アジャイル）／ハイブリッドの3類型を中心に、選定基準・スクラム・カンバン・XPを学ぶ。アジャイルマニフェスト・INVEST・スクラム役割／イベント／成果物が試験頻出。',
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
        navyItems: [[{ text: '第6版では §1.2.4 と アジャイル実務ガイドが該当', style: 'navy' }]],
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
          '__メリット__: ==計画が明確==（スコープ・コストを事前把握）／進捗の定量管理が容易／文書化で監査・規制に対応',
          '__デメリット__: ==変更対応が困難==（上流確定後の変更はコスト高）／フィードバックと==価値実現が遅い==（完成まで触れない）',
        ],
      },
      {
        heading: '10. 予測型が適する条件・適さない条件',
        items: [
          '__適する条件__: ==要件が明確で変化しない==／==技術が成熟==／規制が厳格（医療・金融）／固定価格契約',
          '__適さない条件__: ==要件が変動==する／フィードバックが必要／技術探索的',
          '試験頻出: 適さない場面で予測型を選ぶ選択肢が誤答パターン',
        ],
      },
      // ── C. 適応型ライフサイクル ──
      {
        heading: '11. アジャイル思想の起源とリーン思想',
        items: [
          '__アジャイルの起源__: ==2001年==に17名の有志が==アジャイルマニフェスト==を発表。XP・Scrum 等の手法はそれ以前から存在',
          '__リーン思想の影響__: ==トヨタ生産方式==由来の==ムダ排除==・ジャストインタイム・カイゼン',
        ],
      },
      {
        heading: '12. アジャイルソフトウェア開発宣言（4価値・12原則）',
        items: [
          '__4つの価値__（左辺より==右辺==により価値を置く）:',
          '　==プロセスやツールよりも個人と対話を==',
          '　==包括的なドキュメントよりも動くソフトウェアを==',
          '　==契約交渉よりも顧客との協調を==',
          '　==計画に従うことよりも変化への対応を==',
          '左辺にも価値があることを認めながらも、右辺により価値を置く',
          '__12原則__の主要キーワード: 顧客満足／変化を歓迎／短期間の動くソフトウェア／自己組織化チーム／振り返り',
          '試験頻出: 4価値の==右辺・左辺==の逆転や、別文言への差し替えがひっかけパターン',
        ],
        navyItems: [[{ text: 'IPA午前Ⅱ R6秋期 問17 で出題実績', style: 'navy' }]],
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
          '__メリット__: ==変化対応==（変更を歓迎）／==早期価値提供==（短期サイクル）／フィードバックで方向修正／リスクの早期発見',
          '__デメリット__: ==スコープ・全体見積もりの管理が難しい==／==固定価格契約と相性が悪い==／文書化が軽視されやすい',
        ],
      },
      {
        heading: '15. 適応型が適する条件・適さない条件',
        items: [
          '__適する条件__: ==不確実性が高い==（要件・技術）／==フィードバックが必要==／価値の早期実現／==顧客が常時関与可能==',
          '__適さない条件__: ==規制が厳格==で文書化必須／==固定価格契約==で全スコープ事前合意が必要／システム重要度が極高（航空・原子力）／顧客関与が困難',
        ],
      },
      {
        heading: '16. 予測型 vs 適応型の比較',
        items: [
          '8項目の対比は下表参照。特に頻出は__変更管理__（==CCBで厳格管理== vs ==バックログで歓迎==）と__成功基準__（==QCD遵守== vs ==価値実現==）',
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
        navyItems: [[{ text: 'Jeff Sutherland & Ken Schwaber 作成', style: 'navy' }]],
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
        navyItems: [[{ text: 'IPA午前Ⅱ R6秋期 問16 で INVEST 観点が出題。Bill Wake 2003年提唱', style: 'navy' }]],
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
        ],
      },
      {
        heading: '25. その他のアジャイル手法',
        items: [
          '__DSDM__: タイムボックスと==MoSCoW==（Must/Should/Could/Won\'t have）優先順位付けが特徴',
          '__Crystal__: チーム規模と重要度に応じた手法ファミリー／__FDD__: フィーチャー単位の開発',
          '__リーン・ソフトウェア開発__: トヨタ生産方式の応用。==ムダ排除==・決定遅延・早期提供など7原則',
        ],
      },
      {
        heading: '26. スケーリングフレームワーク',
        items: [
          '__スケーリング__: 複数チーム・大規模組織でのアジャイル適用',
          '　==SAFe==（Scaled Agile Framework）: 最も採用率が高い',
          '　==LeSS==（Large-Scale Scrum）: スクラムをそのまま大規模化',
          '　Nexus／Scrum@Scale／DAD などもある',
          '規模拡大はコミュニケーションコスト増でアジリティが低下しやすい',
        ],
        navyItems: [[{ text: '試験頻出度: SAFe > LeSS の順', style: 'navy' }]],
      },
      // ── F. ハイブリッド型と契約・周辺概念 ──
      {
        heading: '27. ハイブリッド・アプローチの設計',
        items: [
          '==ハイブリッド==: 予測型と適応型を組み合わせて使う',
          '__組合せのパターン__: __フェーズ別__（要件・基本設計は予測型、開発は適応型スプリント）／__成果物別__（HWは予測型・SWは適応型）／__段階移行__',
          '規制・契約・組織制約で完全アジャイル化が困難な場合の現実解。実態として多くの企業が採用',
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
          '==T&M==（時間と材料）が最も相性良く、==固定価格==は相性が悪い（スコープ固定と変化歓迎が矛盾）',
          '日本では==準委任契約==で柔軟性を確保するのが一般的（請負・固定価格の発注慣行と相性が悪いため）',
          '工夫: スプリント単位の増分契約／同等規模の機能と交換できる変更条項',
        ],
        navyItems: [[{ text: '経済産業省「DXレポート」「情報システム・モデル取引・契約書」がアジャイル契約のガイドを提供', style: 'navy' }]],
      },
      {
        heading: '30. DevOps・CI/CD と継続的デリバリー',
        items: [
          '==DevOps==: 開発（Dev）と運用（Ops）の==組織・プロセス統合==。リードタイム短縮・デプロイ頻度向上が目的',
          '==CI==（Continuous Integration, 継続的インテグレーション）: 頻繁な統合・自動テスト',
          '==CD==:',
          '　==Continuous Delivery==（継続的デリバリー）: 本番リリース==可能な状態==を常に維持',
          '　==Continuous Deployment==（継続的デプロイメント）: 本番に==自動デプロイ==',
          '==DevSecOps==: セキュリティをDevOpsに統合（==Shift Left==アプローチ）',
          'アジャイルが「==作り方==」、DevOpsが「==届け方==」の革新',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '31. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋アジャイル実務ガイドを統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '33. 午後Ⅰの定石（開発アプローチ）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのアプローチ系設問は「進め方の選択理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 要求が固まらないなら適応型__: 初めにほぼ固まるなら予測型、走りながら順次変わるなら==適応型==。両者を混ぜる==ハイブリッド==も実務では一般的（R6問3・R5問3）',
          '__2. 経験のない取り組みは小刻みに確認__: 成果を小さく出して確認し==計画を修正==しながら進める。出資元に経験のない新価値創出はアジャイルが向く（R5問1）',
          '__3. 新技術は仮説検証で見極める__: いきなり本採用せず、==探索的アプローチ==（PoC・プロトタイプ）で技術リスクを先に潰す（R5問3）',
          '__4. SaaSはFit to Standard__: カスタマイズを最小化し==業務を標準機能に合わせる==のが短期導入のカギ。標準への準拠が将来の改善も受け取れる（R2問3・R4問1・H30問1）',
          '__5. パッケージはFit&Gap分析__: 標準機能と業務の==差分を早期に分析==し、適合しないリスク（追加開発の膨張）を見極める（H27問2・H25問1）',
          '__6. プロトタイプで認識を合わせる__: 文書より==動くもの・デモ==が要求の解釈ずれを防ぎ、仕様確定を早める（R4問1・H26問1・H28問3）',
          '__7. 新技術採用のリスクは3点セット__: ==要員==（経験者不足）・==品質==・==スケジュール==へ波及する。教育・支援体制を計画に織り込む（H25問2）',
          '__8. 予測型でも品質活動を計画に織り込む__: 期限固定でも、追加ニーズの収集・改修・検証を==あらかじめ計画に組み込む==（R6問1）',
          '__9. DevOpsで開発と運用を一体化__: リリース高速化と==安定運用の両立==が狙い。部門間のミッション対立は上位目的で調整（R4問2）',
          '__10. 状況が読めないときはOODA__: 計画前提のPDCAでなく==観察→判断→決定→行動==を高速に回して即応する（R5問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==アジャイルマニフェスト==の4価値は右辺・左辺を完全に暗記。R6秋期 問17 のような改変パターンを見抜けるレベルまで。',
      '【スクラム】役割（PO/SM/開発者）／5イベント／3成果物／DoD を一覧で暗記。タイムボックスも数字で覚える。',
      '【INVEST】6要素を頭文字で暗記。==Valuable== の主体は==顧客==（開発者ではない、ひっかけ多発）。',
      '【カンバン】==WIP制限==／==プル方式==／==リトルの法則==（WIP=スループット×リードタイム）。',
      '【ひっかけ】PO（何を）vs SM（どう）／反復型（洗練）vs 漸進型（積み上げ）／レビューとレトロの順序。',
    ],
  },

  // ───────────────────────────────────────────
  // 4. 計画（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  planning: {
    summary:
      'プロジェクトのスコープ・スケジュール・コスト・リスクを計画する活動領域。PMBOK第6版では第5/6/7章の3知識エリアで詳細化、第7版では「計画」パフォーマンス領域として統合的に扱う。WBS・クリティカルパス法・3点見積もり・EVMが試験頻出。',
    sections: [
      // ── A. 計画領域概観 ──
      {
        heading: '1. 計画パフォーマンス領域の目的と概観',
        items: [
          'PMBOK第7版「計画」パフォーマンス領域 = 第6版の3知識エリア（__第5章 スコープ__／__第6章 スケジュール__／__第7章 コスト__）を統合した活動領域',
          '__計画は反復的__: 進行に伴い==段階的詳細化==（progressive elaboration）される',
        ],
      },
      {
        heading: '2. プロジェクトマネジメント計画書とサブシディアリー計画書',
        items: [
          '__プロジェクトマネジメント計画書__（Project Management Plan）: プロジェクト全体の実行・監視・終結の基準を統合',
          '__サブシディアリー計画書__（subsidiary plans, 補助計画書）= 各知識エリアの計画書:',
          '　スコープ／要求事項／スケジュール／コスト／品質／資源／コミュニケーション／リスク／調達／ステークホルダー・エンゲージメントの10計画書',
          '__ベースライン__: ==スコープ／スケジュール／コスト==の3つ（変更管理の基準）',
          '計画書は__生きた文書__で、変更承認とともに更新',
        ],
      },
      {
        heading: '3. 計画のテーラリング',
        items: [
          '==テーラリング==（Tailoring）: プロジェクト特性に応じてプロセス／手法／成果物を調整',
          '__判断軸__: 規模・複雑性・リスクレベル・組織成熟度・規制環境（大規模・複雑・高リスク・厳格規制ほど詳細な計画に）',
          '「__計画書のための計画__」を避ける（オーバーエンジニアリング禁止）',
        ],
      },
      {
        heading: '4. アジャイル計画（リリース計画・イテレーション計画）',
        items: [
          '__アジャイル計画の階層__（==ローリングウェーブ計画==の典型）: ビジョン → ロードマップ → リリース計画 → イテレーション計画 → デイリー',
          '__段階的詳細化__: 近期は詳細に、遠期は粗く計画する',
          '__プランニング・ポーカー__（Planning Poker）: チームでストーリーポイントを相対見積もり',
        ],
      },
      // ── B. スコープマネジメント（PMBOK6 第5章） ──
      {
        heading: '5. 5.1 スコープマネジメント計画',
        items: [
          'スコープの計画／妥当性確認／コントロールの方法を文書化するプロセス',
          '__主要アウトプット__: スコープマネジメント計画書と==要求事項マネジメント計画書==（後者も本プロセスのアウトプットである点がひっかけ）',
        ],
      },
      {
        heading: '6. 5.2 要求事項収集',
        items: [
          'ステークホルダーのニーズを識別・文書化するプロセス',
          '__主要技法__: インタビュー／ワークショップ／プロトタイピング／親和図 など',
          '==要求事項トレーサビリティ・マトリクス==（RTM）: 要求の出自・優先度・実装・テストを追跡',
        ],
        navyItems: [[{ text: 'RTM は午前Ⅱ・午後I 双方で頻出。「要求 → 設計 → 実装 → テスト」の追跡が機能', style: 'navy' }]],
      },
      {
        heading: '7. 5.3 スコープ定義',
        items: [
          '==プロジェクト・スコープ記述書==を作成し、プロジェクトと製品の境界を確定するプロセス',
          '__記述書の構成要素__: 製品スコープ記述／成果物／==受入基準==／==除外事項==（「やらないこと」の明示がスコープ争いを防ぐ）／前提・制約条件',
          '==スコープ・クリープ==（scope creep）: 未承認の機能追加。記述書と変更管理で防止',
        ],
      },
      {
        heading: '8. 5.4 WBS作成（作業分解構成図）',
        items: [
          // 赤字密度メモ: WBS は午前Ⅱ最頻出のため 7 個許容（方針書 §7）
          '==WBS==（Work Breakdown Structure）: プロジェクト全体を==成果物指向==で階層分解した図',
          '__最下位の要素__ = ==ワークパッケージ==（Work Package）',
          '__分解の指針__: 成果物指向（作業順序ではない）・MECE（漏れなく重複なく）・==8/80ルール==（8〜80時間の粒度）',
          '==100%ルール==: WBSはプロジェクト全スコープを過不足なく表す',
          '__主要アウトプット__: ==スコープ・ベースライン==（プロジェクト・スコープ記述書＋WBS＋WBS辞書）',
          '==WBS辞書==: 各WBS要素の詳細記述（作業内容・責任者・期間・コスト）',
        ],
        navyItems: [[{ text: 'WBS は午前Ⅱ 最頻出キーワード。8/80ルール・100%ルール・成果物指向は必須暗記', style: 'navy' }]],
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
          '__WBS の階層__: プロジェクト → フェーズ/主要成果物 → 中間成果物 → ワークパッケージ（最下位）→ アクティビティ（§12）',
          '==コントロール・アカウント==（Control Account, CA）: スコープ・コスト・スケジュールを統合管理する単位',
          '==プランニング・パッケージ==（Planning Package）: 計画詳細化前の仮置き単位',
        ],
      },
      {
        heading: '10. 5.5 スコープ妥当性確認 / 5.6 スコープコントロール',
        items: [
          '__妥当性確認__: 完成した成果物を顧客／スポンサーが正式に受け入れる。技法は==検査==',
          '__スコープコントロール__: スコープの状態を監視しベースライン変更を管理。スコープ・クリープを検出・是正（両プロセスとも監視・コントロール群）',
          '==妥当性確認==（Validation, 顧客の受入）vs ==品質コントロール==（Verification, 仕様への適合）の違いに注意',
        ],
      },
      // ── C. スケジュールマネジメント（PMBOK6 第6章） ──
      {
        heading: '11. 6.1 スケジュールマネジメント計画',
        items: [
          '単位・精度・ベースライン更新ルール・EVM 適用方針など、スケジュール管理の方法を定めるプロセス',
        ],
      },
      {
        heading: '12. 6.2 アクティビティ定義',
        items: [
          'WBS のワークパッケージをアクティビティに分解するプロセス',
          '__マイルストーン__は==所要時間 0==。成果物・イベントを表す（作業ではない）',
        ],
      },
      {
        heading: '13. 6.3 アクティビティ順序設定',
        items: [
          // 赤字密度メモ: PDM 4関係は判別問題の核心のため 8 個許容（方針書 §7）
          '__依存関係の4種類__（==PDM==: Precedence Diagramming Method）:',
          '　==FS==（Finish-to-Start）: 前作業完了後に後作業開始（最も一般的）',
          '　==FF==（Finish-to-Finish）: 前作業完了後に後作業完了',
          '　==SS==（Start-to-Start）: 前作業開始後に後作業開始',
          '　==SF==（Start-to-Finish）: 前作業開始後に後作業完了（最も稀）',
          '__依存関係の性質__: ==強制／任意／外部／内部==の4分類（物理的必須か・選好か・プロジェクト外か内か）',
          '==リード==（前倒し）／==ラグ==（遅延）: 依存関係に時間調整を加える',
        ],
        navyItems: [[{ text: '試験頻出: 4依存関係（特にFSとSF）の例示問題', style: 'navy' }]],
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
          // 赤字密度メモ: ES/EF/LS/LF は CPM 計算の基礎語のため 7 個許容（方針書 §7）
          '==AON==（Activity-On-Node）: ノード=アクティビティ、矢印=依存関係。PDM がこの形式（PMBOK第6版の標準）',
          '==AOA==（Activity-On-Arrow）: 矢印=アクティビティ、ノード=イベント。ADM／PERT図がこの形式（現在は非主流）',
          '==ダミー作業==（dummy activity): AOAで論理関係を表現するための所要時間0の仮想作業（点線矢印）',
          '__ノードの4つの日付__:',
          '　==最早開始（ES）==／==最早完了（EF）==: 前から詰めて最も早く着手・完了できる日',
          '　==最遅開始（LS）==／==最遅完了（LF）==: 全体を遅らせずに済む最も遅い着手・完了日',
          '計算手順（フォワードパス／バックワードパス）は §16 参照',
        ],
      },
      {
        heading: '15. 6.4 アクティビティ所要時間見積もり',
        items: [
          // 赤字密度メモ: 見積もり4技法+PERT式は午前Ⅱ最頻出のため 7 個許容（方針書 §7）
          '__主要技法__:',
          '　==類推見積もり==（Analogous）: 過去の類似プロジェクトからトップダウン。早い・安いが精度低',
          '　==パラメトリック見積もり==（Parametric）: 単価×数量等の統計的関係。例: 1000行=1人月 → 5000行=5人月',
          '　==3点見積もり==（Three-Point）: 楽観値(O)・最確値(M)・悲観値(P)から算出',
          '　　三角分布: (O+M+P)/3',
          '　　ベータ分布（==PERT==）: 期待値 ==(O+4M+P)/6==（最確値を4倍で重み付け）',
          '　==ボトムアップ見積もり==（Bottom-Up）: WBS各要素を積み上げ。最も精度が高い',
          '__予備期間__: コンティンジェンシー予備（既知のリスク）／マネジメント予備（未知のリスク）→ §22',
          '試験頻出: PERT の期待値式と標準偏差 ==σ = (P-O)/6==',
        ],
        navyItems: [[{ text: 'PERT 期待値 (O+4M+P)/6 と σ = (P-O)/6 は午前Ⅱ 必須暗記', style: 'navy' }]],
      },
      {
        heading: '16. 6.5 スケジュール作成（クリティカルパス法 CPM）',
        items: [
          // 赤字密度メモ: CPM は午前Ⅱ/午後Ⅰ双方の計算問題核心のため 14 個許容（方針書 §7）
          '==クリティカルパス法==（CPM, Critical Path Method）: ==最長==の経路をクリティカルパスとし、プロジェクトの==最短期間==を算出（経路は最長・期間は最短）',
          '__計算手順__（午後Ⅰの日数計算はこの2パスで解く）:',
          '　__1.__ ==フォワードパス==（開始→終了）: ES・EF を計算。EF = ES + 所要時間。合流点では先行 EF の==最大値==を取る',
          '　__2.__ ==バックワードパス==（終了→開始）: LF・LS を計算。LS = LF - 所要時間。分岐点では後続 LS の==最小値==を取る',
          '　__3.__ フロートを計算し、==TF = 0== の経路がクリティカルパス',
          '__フロート計算__:',
          '　==トータルフロート==（TF）= LS - ES = LF - EF（プロジェクト全体を遅らせない余裕）',
          '　==フリーフロート==（FF）= 後続の ES - 当該の EF（後続アクティビティを遅らせない余裕）',
          '　クリティカルパス上のアクティビティ遅延は、そのままプロジェクト全体の遅延になる',
          '==クリティカルチェーン法==（CCM）: 資源制約を考慮した CPM 拡張。==プロジェクトバッファ==／フィーディングバッファで保護',
          '__資源最適化技法__: ==資源平準化==（Leveling, 期間延長を許して山崩し）／==資源平滑化==（Smoothing, フロート内で調整）',
        ],
        navyItems: [[{ text: 'CPM・トータルフロート計算は午前Ⅱ/午後I 双方で必出。合流は最大・分岐は最小の取り違えが定番の失点', style: 'navy' }]],
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
          // 赤字密度メモ: 2手法の定義と短所の対比は午後Ⅰ記述の定番のため 7 個許容（方針書 §7）
          '__スケジュール短縮の2手法__:',
          '　==クラッシング==（Crashing）: 資源追加で工期短縮（残業・要員追加・外注等）。短所は==コスト増大==',
          '　==ファストトラッキング==（Fast Tracking）: 本来順次のアクティビティを==並列==実行。短所は==リスク増大==（手戻り・品質低下）',
          '__選択基準__: 追加コストを許容できるならクラッシング、コスト増を避けたいが手戻りリスクを許容できるならファストトラッキング',
          '__コスト・スロープ__: コスト増分÷短縮日数。クラッシングは==小さい順==に適用するのが最も経済的',
          '__注意__: どちらの手法も==クリティカルパス上==のアクティビティが対象（非クリティカルにかけても全体は縮まない）',
        ],
        navyItems: [[{ text: '試験頻出: 短縮対象の選定（CP上・コストスロープ最小）は午後Ⅰの計算・記述の定番', style: 'navy' }]],
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
          'ベースラインに対する進捗監視と変更管理（監視・コントロール群）',
          '__主要技法__: EVM による差異分析／クリティカルパス分析／スケジュール短縮（§17）',
        ],
      },
      // ── D. コストマネジメント（PMBOK6 第7章） ──
      {
        heading: '19. 7.1 コストマネジメント計画',
        items: [
          '測定単位・精度・コントロール・スレッショルド（差異の閾値）・EVM 適用方針など、コスト管理の方法を定めるプロセス',
        ],
      },
      {
        heading: '20. 7.2 コスト見積もり',
        items: [
          '__見積もり技法__: 類推／パラメトリック／ボトムアップ／3点の4技法（§15 と共通）',
          '__精度のクラス__:',
          '　==ROM 見積もり==（Rough Order of Magnitude, 超概算）: ==-25%〜+75%==',
          '　==確定見積もり==（Definitive）: ==-5%〜+10%==',
        ],
        navyItems: [[{ text: 'ROM と確定見積もりの精度範囲は午前Ⅱ 出題実績あり', style: 'navy' }]],
      },
      {
        heading: '21. 見積もり手法の比較と適用条件',
        items: [
          '__精度の序列__: ==ボトムアップが最高==・==類推が最低==（この対比が頻出。各技法の特徴は §15）',
          '__フェーズ別の使い分け__: 立上げ=類推（情報不足）→ 計画初期=パラメトリック → 計画詳細=ボトムアップ。複数技法の併用が推奨',
        ],
      },
      {
        heading: '22. 7.3 予算設定（コスト・ベースライン）',
        items: [
          'コスト見積もりを集約し==コスト・ベースライン==を作成するプロセス',
          '__構成__（積層構造・下から上へ）:',
          '　アクティビティ・コスト見積もり（最小単位）',
          '　コントロール・アカウント単位の集計',
          '　==コンティンジェンシー予備==（既知リスク用、ベースラインに含む）',
          '　コスト・ベースライン（タイム・フェーズド予算、累積 S カーブ）',
          '　==マネジメント予備==（未知リスク用、ベースライン外）',
          '　==プロジェクト予算==（コスト・ベースライン＋マネジメント予備）',
          '__重要な区別__: コスト・ベースラインはマネジメント予備を==含まない==',
          'マネジメント予備の使用には正式な変更承認が必要',
        ],
        navyItems: [[{ text: 'コスト・ベースライン vs プロジェクト予算 vs マネジメント予備の階層は午前Ⅱ 頻出', style: 'navy' }]],
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
          '==EVM==で PV／EV／AC から CV・SV・CPI・SPI・EAC 等を算出（監視・コントロール群）。公式・計算は measurement §4〜§8 で詳細に扱う',
        ],
        navyItems: [[{ text: 'EVM 公式は measurement カテゴリで詳細扱い。本セクションは概観のみ', style: 'navy' }]],
      },
      {
        heading: '24. 経済性評価（NPV / ROI / IRR / 回収期間）',
        items: [
          // 赤字密度メモ: 経済性評価は計算問題頻出のため 7 個許容（方針書 §7）
          '__プロジェクト選定の経済性評価指標__:',
          '　==NPV==（Net Present Value, 正味現在価値）: 将来キャッシュフローを現在価値に割り引いた合計',
          '　　==NPV > 0== なら採算ありと判定',
          '　==ROI==（Return on Investment, 投資収益率）= (利益 - 投資) / 投資',
          '　==IRR==（Internal Rate of Return, 内部収益率）: NPV = 0 となる割引率',
          '　　==IRR > 資本コスト== なら採算あり',
          '　==回収期間==（Payback Period）: 投資を回収するまでの期間。短いほど良い（回収後の利益を考慮しない欠点）',
          '==埋没費用==（sunk cost）: 既に支出済みのコストは意思決定に含めない',
        ],
        navyItems: [[{ text: '午前Ⅱ の経済性評価問題は計算式の理解で解ける。割引率と現在価値計算の式は暗記', style: 'navy' }]],
      },
      // ── E. リスク・調達計画 ──
      {
        heading: '25. リスク識別とリスク・ブレークダウン・ストラクチャー（RBS）',
        items: [
          '__識別技法__: ブレーンストーミング／チェックリスト／インタビュー／==SWOT==分析／==プロンプトリスト==（PESTLE・TECOP・VUCA）など',
          '==RBS==（Risk Breakdown Structure）: リスクをカテゴリ別に階層分解',
          '　例: 技術リスク / 外部リスク / 組織リスク / プロジェクトマネジメントリスク',
          'リスクは「==事象・原因・影響==」の3要素を明確化して記述する',
          '脅威（マイナスリスク）と機会（プラスリスク）の両方を扱う（詳細は uncertainty カテゴリ）',
        ],
        navyItems: [[{ text: 'RBS は WBS の派生概念。リスク管理の詳細は uncertainty カテゴリで別途扱う', style: 'navy' }]],
      },
      {
        heading: '26. リスク登録簿の構造と更新タイミング',
        items: [
          '==リスク登録簿==（Risk Register）: リスク情報の中心リポジトリ',
          '__主要記載項目__:',
          '　リスクID／リスク記述／カテゴリ（RBSで分類）',
          '　確率／影響度／リスク・スコア（確率×影響度）',
          '　==リスク所有者==（オーナー: 対応の責任者を必ず決める）',
          '　対応戦略',
          '　==トリガー==（risk trigger, 発生の前兆となる早期警報サイン）',
          '__更新タイミング__: 各リスクプロセスの都度／フェーズ・ゲート／変更承認時／定例リスク・レビュー',
          '__リスク・レポート__: リスク全体の傾向・上位リスクのサマリー',
        ],
      },
      {
        heading: '27. 計画段階のステークホルダー登録簿との連携',
        items: [
          '==ステークホルダー登録簿==は計画の各所で参照される（要求収集の対象者・マイルストーン承認者・CCB メンバー・リスク影響者・サプライヤ選定）',
          '__エンゲージメント計画書__とコミュニケーション計画書の整合性に注意',
        ],
        navyItems: [[{ text: 'ステークホルダー詳細は stakeholder カテゴリ §32（PMBOK6 13.x プロセス）参照', style: 'navy' }]],
      },
      {
        heading: '28. 調達計画（make-or-buy 決定）',
        items: [
          '__主要意思決定__: ==make-or-buy 分析==（内製か外注か）',
          '__判断基準__: コストだけでなく、スキル/能力・スケジュール・==コア・コンピタンス==（戦略的重要度）・知的財産・調達先の信頼性も含めて判断',
          '__主要アウトプット__:',
          '　調達マネジメント計画書／調達戦略（契約形態・支払条件・選定基準）',
          '　入札文書（==RFP==／==RFQ==）',
          '　調達作業範囲記述書（==SOW==, Statement of Work）',
          '　==独立コスト見積もり==（ベンダー見積もりの妥当性を確認する基準値）',
          '契約形態の詳細は project-work カテゴリで扱う',
        ],
        navyItems: [[{ text: '契約形態（固定価格・実費精算・T&M）は project-work §9-11 で詳細扱い', style: 'navy' }]],
      },
      // ── F. 計画統合と PMBOK7 ──
      {
        heading: '29. プロジェクト統合マネジメント計画書（PMBOK6 第4章）',
        items: [
          'サブシディアリー計画書（§2）を統合して全体計画書を作成するプロセス',
          '計画書はキックオフ会議で合意を得て、承認後にベースライン化。以降の変更は統合変更管理で扱う',
        ],
      },
      {
        heading: '30. PMBOK第7版「計画」パフォーマンス領域',
        items: [
          '__第7版の8パフォーマンス領域__の1つ（概観は §1、テーラリングは §3 を参照）',
          '__主な検討事項__: スコープ・スケジュール・予算のバランス、チーム能力、組織の方針・標準、市場環境',
        ],
      },
      {
        heading: '31. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセス・ITTO==で詳細記述（第5/6/7章・16プロセス）／__第7版__: 「計画」==パフォーマンス領域==として統合記述',
          '__IPA PM試験__: 午前Ⅱは第6版用語（WBS・CPM・PERT・EVM）中心。午後Ⅰも第6版プロセスベースのシナリオが多い',
        ],
        navyItems: [[{ text: '計画系は PM試験 最頻出領域。第6版用語の暗記が直接得点に繋がる', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '32. 過去問頻出論点（午前Ⅱ）',
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
          '__調達計画__: ==make-or-buy 分析==・==SOW==・入札文書（==RFP==/==RFQ==）',
        ],
      },
      {
        heading: '33. ひっかけパターン',
        items: [
          '__妥当性確認 vs 品質コントロール__: 妥当性確認 = 顧客の==受入==（Validation）、品質コントロール = 仕様への==適合==（Verification）',
          '__コスト・ベースライン vs プロジェクト予算__: ==マネジメント予備==の==含む／含まない==',
          '__コンティンジェンシー予備 vs マネジメント予備__: 既知リスク（ベースラインに==含まれる==）vs 未知リスク（==含まれない==）',
          '__クラッシング vs ファストトラッキング__: コスト増 vs リスク増。どちらも==クリティカルパス上==のアクティビティが対象',
          '__PERT 公式__: 期待値は==重み付き==(O+4M+P)/6、標準偏差は==(P-O)/6==',
          '__フロート__: トータルフロート vs フリーフロート（フリー = 後続を遅らせない）',
          '__見積もり精度__: ==ボトムアップが最高==・==類推が最低==',
          '__依存関係__: ==FS==（最頻出）vs ==SF==（最稀）の例示混同',
          '__PMBOK6 vs PMBOK7__: ==プロセス・ITTO==（第6版）vs ==パフォーマンス領域==（第7版）',
          '__make-or-buy__: コストだけでなく==戦略・コア・コンピタンス==も判断軸',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '34. 午後Ⅰの定石（計画・スケジュール・コスト）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7、§32/33 と同扱い）
          '午後Ⅰの計画系設問は知識の再現ではなく「本文の状況に定石を当てはめ、理由を30〜40字で書く」形式。以下の定石を解答の根拠に使う',
          '__1. 必達期限は逆算＋クリティカルパス死守__: 期限固定の案件は==クリティカルパス==を特定し、CP上の作業の遅延予兆を最優先で監視する。短縮策もCP上に打つ（H25問1・H29問1・R1問3）',
          '__2. 遅延リカバリは定量把握→CP→対策の順__: SPI等で遅延を定量把握し、クリティカルパスへの影響を確認してから対策を選ぶ。要員追加は==教育・習熟==の間、既存要員の生産性まで下げる点を考慮（H28問3・H27問3）',
          '__3. 間に合わないならスコープを分割__: 全機能が期限に収まらないときは優先度で分割し==段階的リリース==にする。取捨の基準は業務継続・事業価値・法令対応（R4問1・H29問1・R2問3）',
          '__4. 不確実な工程は段階的詳細化__: 遠い工程は粗く・近い工程は詳細に計画し、詳細化のタイミング自体を計画に組み込む（==ローリングウェーブ計画==）（R3問1）',
          '__5. 予備費は種類と承認者で使い分け__: 特定済みリスクには==コンティンジェンシー予備==（PM権限で使用）、想定外には==マネジメント予備==（上位の承認が必要）。どちらから充当するかが問われる（R3問3）',
          '__6. WBSの漏れは全計画を狂わせる__: 見積もり・進捗管理の土台はWBS。==100%ルール==を満たすかレビューし、漏れ作業を早期に発見する（R1問2）',
          '__7. 進捗は自己申告でなく出来高で測る__: 「90%完了」の自己申告は当てにならない。==出来高==（成果物の完成基準・重み付け）で客観測定する（H26問2）',
          '__8. 与えられた前提・スコープを疑う__: 計画の前提（既存資産の流用可否・データ品質等）に誤りがないか計画段階で検証する。前提崩れは最大の手戻り要因（H25問2）',
          '__9. 見積もりの妥当性は比較で確認__: 1社見積もりを鵜呑みにせず==相見積り==や独立コスト見積もりと比較して妥当性を確認する（H26問3）',
          '__10. 制約がリスクの源__: 必達期限・固定予算・限られた要員という制約からリスクを洗い出し、対応を計画に織り込む（R1問1・H29問1）',
          '__11. 兼任要員は稼働率を明示__: 他業務と掛け持ちのメンバーは稼働割合を明確化し、業務間の優先度調整ルールを事前に決める（R6問2）',
          '__12. 環境変化はスコープから見直す__: 合併・制度変更などが起きたら、まずスコープへの影響を判断し、その後にスケジュール・コストを見直す（H25問3）',
          '__13. 標準プロセスはテーラリングして使う__: 組織標準をそのまま強制せず、案件特性に合わせ==修整（テーラリング）==する。全体で揃える所とチームに任せる所を見極める（R6問3）',
          '__14. 設問の限定語で解答の向きを固定__: 「事業の観点で」「理由を」等の限定語が解答の方向を決める。因果（〜だから〜する）で書き、本文の言葉を言い換えて使う（R6問1ほか全問共通）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==WBS==（8/80ルール・100%ルール・成果物指向）／==CPM==（クリティカルパス・フロート計算）／==PERT==（期待値・標準偏差）は午前Ⅱ 必出。',
      '【スケジュール】==PDM==の4依存関係（==FS/FF/SS/SF==）。==クラッシング==（コスト増）vs ==ファストトラッキング==（リスク増）。',
      '【コスト】==コスト・ベースライン==はマネジメント予備を==含まない==。見積もり精度は==ボトムアップが最高==・==類推が最低==。',
      '【経済性評価】==NPV==計算（現在価値割引）／==IRR==と資本コスト／==回収期間==の長短評価。',
      '【ひっかけ】==Validation==（顧客受入）vs ==Verification==（仕様適合）／==コンティンジェンシー==vs ==マネジメント予備==／==FS vs SF==の混同。',
    ],
  },

  // ───────────────────────────────────────────
  // 5. プロジェクト作業（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'project-work': {
    summary:
      'プロジェクトの実行・調達・知識管理・コミュニケーションを扱う活動領域。PMBOK第6版では第4/9/10/12章に分散、第7版では「プロジェクト作業」パフォーマンス領域として統合。契約形態（FP/CR/T&M）と請負・準委任が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. プロジェクト作業パフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「プロジェクト作業」パフォーマンス領域は、実行・監視・物理的資源・調達・コミュニケーションを統合的に扱う',
        ],
      },
      {
        heading: '2. PMBOK第6版での対応知識エリア',
        items: [
          '第6版の実行・監視系プロセスを統合した領域。__第4章 統合__（4.3〜4.6）／__第9章 資源__（9.3/9.6 → team §28）／__第10章 コミュニケーション__（10.2/10.3）／__第12章 調達__（12.1〜12.3）',
        ],
        navyItems: [[{ text: 'team / planning カテゴリと相互参照。本カテゴリは「実行・調達・知識管理」に集中', style: 'navy' }]],
      },
      {
        heading: '3. プロジェクト作業の活動範囲',
        items: [
          '__実行__（計画通りに作業し成果物を生成）→ __監視__（実績との差異を追跡）→ __コントロール__（==是正処置==・==予防処置==）の継続的ループ',
          '作業パフォーマンスの3段階（データ→情報→報告書）は §17 参照',
        ],
      },
      // ── B. 統合管理（実行・監視） ──
      {
        heading: '4. 4.3 プロジェクト作業の指揮・マネジメント',
        items: [
          '計画書の通りに作業を指揮し、承認された変更を実装する実行プロセス群の中心プロセス',
          '__主要アウトプット__: 成果物／==作業パフォーマンス・データ==（生の実績値）／==問題ログ==／変更要求',
        ],
      },
      {
        heading: '5. 4.4 プロジェクト知識のマネジメント',
        items: [
          '既存知識の活用と新規知識の創出を扱うプロセス（==第6版で新設==・実行プロセス群）',
          '__主要アウトプット__: ==教訓登録簿==（lessons learned register）',
          '教訓は==継続的に==収集する（プロジェクト終結時だけでない）。形式知・暗黙知の詳細は §20',
        ],
      },
      {
        heading: '6. 4.5 プロジェクト作業の監視・コントロール',
        items: [
          'プロジェクト全体の進捗・パフォーマンスを監視し、計画からの差異を是正する（監視・コントロール群）',
          '__主要アウトプット__: ==作業パフォーマンス報告書==（§17）／変更要求',
        ],
      },
      {
        heading: '7. 4.6 統合変更管理',
        items: [
          '全変更要求を一元管理して影響評価・承認・実装する（監視・コントロール群）',
          '__中心概念__: ==変更管理委員会==（CCB, Change Control Board）が変更要求を評価・==承認/却下==・延期',
          '__変更管理ワークフロー__: 変更要求 → ==影響分析==（コスト・スケジュール・品質・リスク）→ CCB審議 → 承認/却下 → 実装 → 検証 → 文書化',
          '変更管理のルールは計画段階で決めておく（変更管理計画書）。詳細は integration カテゴリ',
        ],
        navyItems: [[{ text: 'CCB・統合変更管理プロセスは午前Ⅱ/午後I 双方で頻出', style: 'navy' }]],
      },
      // ── C. 調達マネジメント ──
      {
        heading: '8. 12.1 調達マネジメント計画（make-or-buy 分析）',
        items: [
          '==make-or-buy 分析==（内製か外注か）を行い調達方針を決める。詳細は planning §28 参照',
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
        navyItems: [[{ text: '契約形態の3類型と派生形は午前Ⅱ 頻出。リスク配分が判別ポイント', style: 'navy' }]],
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
          '==FFP==（Firm Fixed Price, 確定固定価格）: 完全固定。スコープ明確な短期契約向け',
          '==FPIF==（Fixed Price Incentive Fee）: 固定価格＋==パフォーマンス連動インセンティブ==。価格上限あり',
          '==FP-EPA==（経済価格調整条項付固定価格）: ==長期契約==で物価・為替変動を指標連動で反映',
        ],
      },
      {
        heading: '11. 実費精算契約（CR）の派生形',
        items: [
          '==CPFF==（Cost Plus Fixed Fee）: ==実費＋固定報酬==。報酬額は契約時に確定',
          '==CPIF==（Cost Plus Incentive Fee）: ==実費＋パフォーマンス連動インセンティブ==。目標との差を買い手と売り手で分担',
          '==CPAF==（Cost Plus Award Fee）: ==実費＋成果報酬==。報酬は==買い手の主観評価==で決定',
          '廃止形式 CPPC（実費＋実費の一定％）は売り手のコスト膨張を招くため禁止',
        ],
        navyItems: [[{ text: 'CPFF/CPIF/CPAF の違いは午前Ⅱ 頻出。報酬計算式の理解が判別ポイント', style: 'navy' }]],
      },
      {
        heading: '12. 12.2 調達の実施',
        items: [
          '入札・提案評価・契約締結を行う実行プロセス群のプロセス',
          '__主要技法__: ==入札説明会==（全候補者に同一情報を提供）／提案評価／==独立コスト見積もり==との比較／交渉',
          '__調達文書__: ==RFP==（提案依頼書）／==RFQ==（見積依頼書）／==RFI==（情報提供依頼書）の使い分けが頻出',
        ],
      },
      {
        heading: '13. 入札方式（一般競争・指名競争・随意契約）',
        items: [
          '　==一般競争入札==: 公告で広く募集。透明性高',
          '　==指名競争入札==: 実績のある業者を指名（参加者限定）',
          '　==随意契約==: 1社に特定して契約（競争なし）。緊急性・専門性・少額が許容条件',
          '__総合評価方式__: 価格と技術提案を両方評価（公共調達で増加傾向）',
        ],
        navyItems: [[{ text: '日本の公共調達制度は IPA 試験で時折出題（特にIT 調達）', style: 'navy' }]],
      },
      {
        heading: '14. 12.3 調達のコントロール',
        items: [
          '契約履行の監視・パフォーマンス管理・変更管理を行う（監視・コントロール群）',
          '__クレーム管理__: 契約条件の==解釈の相違==による紛争の管理。==ADR==（代替的紛争解決: 調停・仲裁）を活用',
          '契約終結は全成果物受入後に正式に行う',
        ],
      },
      // ── D. コミュニケーション ──
      {
        heading: '15. 10.2 コミュニケーションのマネジメント',
        items: [
          '情報の収集・配信・保管・適時適切な利用を行う実行プロセス',
          '__コミュニケーション方法__: ==プッシュ型==（送信者主導）／==プル型==（受信者主導）／==インタラクティブ型==（双方向）→ 詳細は stakeholder §24',
        ],
      },
      {
        heading: '16. 10.3 コミュニケーションの監視',
        items: [
          'コミュニケーション・ニーズが満たされていることを確認する（監視・コントロール群）。関与評価マトリクスで効果を測る',
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
        navyItems: [[{ text: '3段階の階層は午前Ⅱ 頻出。「データ → 情報 → 報告書」の生成順序を区別', style: 'navy' }]],
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
          '9.3 資源の獲得（実行群）と 9.6 資源のコントロール（監視・コントロール群）は team §28 で扱う',
          '__注意__: 9.6 は==物的資源==が対象。チームの監視は 9.5（この区別がひっかけ頻出）',
        ],
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
          '__回顧的レビュー__: アジャイルはスプリント・レトロスペクティブ、予測型はフェーズ・ゲートで実施',
          '__代表技法__: ==KPT==（Keep / Problem / Try）',
        ],
        navyItems: [[{ text: '教訓登録簿は PMBOK第6版で新設。「収集タイミングは継続的」が試験頻出', style: 'navy' }]],
      },
      {
        heading: '22. 知識共有のリポジトリとコミュニティ・オブ・プラクティス',
        items: [
          '__ナレッジ・リポジトリ__: 文書・テンプレート・教訓の中央集積所',
          '==コミュニティ・オブ・プラクティス==（CoP）: 共通の関心を持つ専門家の==自発的==な集まり。知識の横展開に有効',
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
          '==NDA==（Non-Disclosure Agreement, 守秘義務契約）: 秘密情報の取扱いを規定する契約。プロジェクト開始前・入札参加時に締結',
          '　主要規定: 秘密情報の定義／使用目的の限定／第三者開示の禁止／契約終了後の義務',
          '__知的財産権の帰属__: ==契約で明示==することが重要。デフォルトでは制作者（ベンダー）に帰属する場合が多い',
        ],
        navyItems: [[{ text: 'NDA・知財帰属は調達契約で頻出論点。経済産業省「情報システム・モデル取引・契約書」が参考資料', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '26. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '28. 午後Ⅰの定石（調達・契約・知識管理）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの調達系設問は「契約形態の制約」と「委託先の管理」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 請負に直接指揮命令はできない__: 請負契約の要員へ発注者が直接指示すると==偽装請負==。作業指示は==受託側リーダー経由==で行う（H29問2・R3問3）',
          '__2. 請負でもスケジュールのリスクは移らない__: 完成責任は移せても==失った時間は取り戻せない==。遅延の予兆は隠さず==共同で管理==し最速で検知・協調対処（R5問2）',
          '__3. 契約は特性で使い分け__: 要件が固まる部分は==請負==、変動・探索的な部分は==準委任==。一括で決めず工程・作業単位で選ぶ（H26問3・H25問4・H29問2）',
          '__4. 意欲低下はインセンティブで補う__: 準委任への移行で下がりがちな完成への意欲は、==成果連動報酬==（CPIF等）や成果完成型で補完（R5問2）',
          '__5. 委託先の品質は契約と工程完了条件で作り込む__: RFP・契約に==品質基準・検収条件・工程完了条件==を明記し、プロセス遵守を記録で確認（H29問2・H26問3）',
          '__6. サプライヤ評価はエビデンスで__: 実績・記録に基づいて評価し、==見極めてから任せる範囲を広げる==（H29問2・H25問4）',
          '__7. 新規委託先は管理負荷を見込む__: 初取引のベンダーには標準の説明・レビュー強化など==管理工数を計画に織り込む==（H28問1）',
          '__8. 委託しても管理責任は残る__: 外部委託後も==管理レポート・監査==で統制する。丸投げは統制喪失（H25問1）',
          '__9. 暗黙知は形式知化して継承__: ベテランの勘・ノウハウは==文書化＋OJT==の組み合わせで移転する（R5問3・R2問1）',
          '__10. 知財・秘密保持は契約で明示__: 業務委託で生まれる成果物の==知財帰属==・秘密情報の扱いは契約に明記（R5問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】契約形態の==3類型==（FP/CR/T&M）の==リスク配分==（FP=売り手リスク大・CR=買い手リスク大）。',
      '【契約形態】==請負契約==（成果物完成義務・==契約不適合責任==）vs ==準委任契約==（業務遂行義務・==善管注意義務==）。アジャイルは準委任が一般的。',
      '【調達文書】==RFP==（提案）／==RFQ==（見積）／==RFI==（情報）／==SOW==（作業範囲）の使い分け。',
      '【知識管理】==形式知 vs 暗黙知==／==SECI モデル==／==教訓登録簿==は==継続的==に更新。',
      '【ひっかけ】==CPFF/CPIF/CPAF==の報酬決定方式（固定／連動／主観評価）／==職務著作==は法人帰属／==9.5 vs 9.6==。',
    ],
  },

  // ───────────────────────────────────────────
  // 6. デリバリー（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  delivery: {
    summary:
      'プロジェクトの成果物と価値を提供する活動領域。PMBOK第6版では第8章「品質マネジメント」3プロセス、第7版では「デリバリー」パフォーマンス領域として統合。品質コスト（COQ）・7QC道具・PDCA・UATが試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. デリバリーパフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「デリバリー」パフォーマンス領域は、スコープと品質に着目し成果物と価値を提供する活動を扱う',
          '__PMBOK第6版での対応__: 第8章 品質マネジメント（3プロセス）＋第5章 スコープの受入関連',
        ],
      },
      {
        heading: '2. 要求事項マネジメントと価値実現',
        items: [
          '__要求事項の種類__: ==業務要求==（ビジネス価値）／==ステークホルダー要求==／==ソリューション要求==（機能・非機能）／==移行要求==',
          '__価値実現の流れ__: 要求 → 設計 → 実装 → 受入 → 運用 → 便益測定',
        ],
      },
      {
        heading: '3. PMBOK第6版「品質マネジメント」第8章 概観',
        items: [
          '3プロセスで構成: 8.1 計画（計画群）／8.2 品質マネジメント（==実行群==）／8.3 品質コントロール（==監視・コントロール群==）→ §7〜§9',
          '__品質哲学の系譜__: ==デミング==（PDCA・14原則）／==ジュラン==（品質トリロジー）／==クロスビー==（「==品質は無償==」）／==石川馨==（特性要因図・QCサークル）',
        ],
      },
      // ── B. 要求とトレーサビリティ ──
      {
        heading: '4. 要求事項収集の技法',
        items: [
          '主要技法は planning §6 参照（インタビュー／ワークショップ／プロトタイピング等）',
          '==QFD==（Quality Function Deployment, 品質機能展開）: 顧客要求を==品質特性に展開==する手法。「品質の家」が中心',
        ],
      },
      {
        heading: '5. 要求事項トレーサビリティ・マトリクス（RTM）',
        items: [
          '==RTM==: 要求事項を出自から設計・実装・テストまで追跡する表（planning §6 参照）',
          '__メリット__: ==変更影響分析==／==テストカバレッジ確認==／スコープ・クリープ防止',
        ],
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
          '品質要求事項と品質基準を識別し、品質マネジメントの方法を文書化する（計画プロセス群）',
          '__主要アウトプット__: 品質マネジメント計画書と==品質メトリクス==（§10）',
        ],
      },
      {
        heading: '8. 8.2 品質マネジメント（実行）',
        items: [
          '品質計画を実行可能な品質活動に変え、組織の品質方針を運用する（==実行プロセス群==）',
          '__代表的な技法__: ==品質監査==（プロセス遵守の独立評価）／根本原因分析／品質改善手法（PDCA・シックスシグマ）',
        ],
      },
      {
        heading: '9. 8.3 品質コントロール（監視）',
        items: [
          '品質活動の==結果==を監視しパフォーマンスを評価する（==監視・コントロールプロセス群==）',
          '__代表的な技法__: ==検査==／テスト・評価／==管理図==（§17）等のデータ表現',
          '__主要アウトプット__: ==検証済みの成果物==（→ 5.5 スコープ妥当性確認で顧客が受入れ）',
        ],
        navyItems: [[{ text: '8.2 vs 8.3 の混同に注意。8.2は「実行プロセス群」、8.3は「監視・コントロールプロセス群」', style: 'navy' }]],
      },
      {
        heading: '10. 品質マネジメント計画書と品質メトリクス',
        items: [
          '__品質マネジメント計画書__: 品質基準・品質目標・役割と責任・レビュー対象・使用ツールを定める',
          '==品質メトリクス==: 品質を定量測定する基準。例: ==欠陥密度==（バグ数／KLOC）／==テストカバレッジ==／==MTBF==（平均故障間隔）／==MTTR==（平均修復時間）',
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
        navyItems: [[{ text: '7QC道具は午前Ⅱ 必出。石川馨「品質管理入門」1965年が起源', style: 'navy' }]],
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
          '==デミング14原則==の核心: ==検査依存からの脱却==（プロセスで品質を作り込む）・部門間の障壁除去・システム改善重視',
          '__赤玉実験__: 個人の努力ではなく==システムの問題==が品質を決めることを示す実験',
        ],
        navyItems: [[{ text: 'デミング14原則は1986年「Out of the Crisis」で提唱。日本の品質向上に貢献', style: 'navy' }]],
      },
      {
        heading: '16. シックスシグマと DMAIC',
        items: [
          '==シックスシグマ==（Six Sigma）: モトローラ発、GE が普及させた==統計的品質改善手法==',
          '__目標__: ==100万機会あたり3.4不良==以下（±6σ）',
          '==DMAIC==: 既存プロセス改善の5段階（==Define==定義 → ==Measure==測定 → ==Analyze==分析 → ==Improve==改善 → ==Control==コントロール）',
          '==DMADV==: 新プロセス設計の5段階（改善のDMAICとの使い分けがひっかけ）',
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
          '__異常判定__: 管理限界外の1点のほか、連続7点が中心線の同側・連続上昇等のパターンも異常とみなす',
          '==正規分布==: ±1σは68.27%、==±2σ==は95.45%、==±3σ==は==99.73%==',
          '__プロセス能力指数__: ==Cp==／==Cpk==（規格幅とばらつきの比）',
        ],
        navyItems: [[{ text: '3σ管理・正規分布のパーセンテージは午前Ⅱ 計算問題で必出', style: 'navy' }]],
      },
      // ── E. 品質規格・モデル ──
      {
        heading: '18. ISO 9000シリーズ',
        items: [
          '==ISO 9000シリーズ==: 品質マネジメントシステムの国際規格。==ISO 9001==が要求事項（==認証対象==）、JIS Q 9001 が日本版',
          '__7つの品質マネジメント原則__: ==顧客重視==／リーダーシップ／人々の積極的参加／==プロセス・アプローチ==／改善／客観的事実に基づく意思決定／関係性管理',
          'PDCAと==リスク思考==（リスクに基づく考え方）を要求事項に組み込む（2015年改訂）',
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
          '試験頻出: 成熟度レベルの==順序==と各レベルの特徴',
        ],
      },
      {
        heading: '20. JIS Q 9001:2015',
        items: [
          'ISO 9001:2015 の日本工業規格版（§18 参照）',
          '要求事項の骨子: 組織のコンテキスト決定／品質方針／プロセス・アプローチ／==内部監査==／==マネジメントレビュー==（経営層による定期評価）',
        ],
      },
      // ── F. アジャイル品質 ──
      {
        heading: '21. アジャイル品質（DoD・自動テスト・TDD）',
        items: [
          'アジャイル品質の特徴: 継続的検証・早期フィードバック・チーム責任',
          '==DoD==（Definition of Done, 完了の定義）: 「完了」とみなす==共通基準==（レビュー済・テスト合格等）。スプリント単位で厳格に適用',
          '==回帰テスト==（Regression Test）: 改修時に既存機能が壊れていないことを検証。自動化が定石',
          '__テスティング・ピラミッド__: 単体（多）→ 統合（中）→ E2E（少）',
        ],
      },
      {
        heading: '22. CI/CD と品質の継続的検証',
        items: [
          '==CI/CD==: 自動ビルド・自動テスト・自動デプロイによる品質の==継続的検証パイプライン==（development-approach §30 参照）',
          '==シフトレフト==（Shift Left）: 品質確認を==上流に==移す思想（欠陥の早期検出でコスト削減）',
        ],
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
          '==受入基準==（Acceptance Criteria）: 成果物が==顧客に受入れられる条件==。Given-When-Then やチェックリスト形式で定義',
          '__非機能要求__も含める: ==性能==（応答時間）／==可用性==（稼働率）／セキュリティ／使用性',
        ],
      },
      {
        heading: '25. UAT（User Acceptance Test, 受入テスト）',
        items: [
          '==UAT==: ==実ユーザ==による==最終受入テスト==。ビジネス要求への適合を確認（テストレベルの階層は development-approach §8 の V字モデル参照）',
          '__UAT の種類__: ==アルファテスト==（開発者環境）／==ベータテスト==（限定ユーザ環境）／==運用受入テスト==（OAT, 運用部門）',
        ],
      },
      {
        heading: '26. プロジェクト終結とサインオフ',
        items: [
          '==4.7 プロジェクトまたはフェーズの終結==: すべての活動を終結し正式に完了する（==終結プロセス群==）',
          '__主要アウトプット__: ==最終報告書==／教訓登録簿の最終化／成果物・サービスへの==移行==',
          '__サインオフ__: 顧客／スポンサーの正式承認。成果物受入・契約終結・リソース解放を確認',
          '__早期終結__: ビジネス価値喪失や予算超過で途中終了する場合も正式な終結手順を踏む',
        ],
      },
      {
        heading: '27. ベネフィット実現と効果測定',
        items: [
          '==ベネフィット実現マネジメント==: プロジェクト投資がビジネス便益を生むことを保証する活動',
          '__有形ベネフィット__（売上増・コスト削減）と__無形ベネフィット__（ブランド・満足度）',
          'プロジェクト終結後も==ベネフィット・レビュー==（6ヶ月〜数年後）で効果を測定する',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '28. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '30. 午後Ⅰの定石（品質・レビュー・検証）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの品質系設問は「品質指標の解釈」と「検証の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 品質は上流で作り込む__: 欠陥の修正コストは後工程ほど増大（==1-10-100の法則==）。要求の解釈ずれは==上流の認識合わせ==で防ぐ（H27問3・H28問2）',
          '__2. レビューは早く・当事者を巻き込む__: ==早期レビュー==が欠陥・認識ギャップを安く検出する。ベンダ間の境界は==共同レビュー==で（R1問3・R3問3）',
          '__3. 欠陥は混入工程まで遡って分析__: 摘出した工程でなく==混入した工程==を特定し、前工程の弱点（レビュー不足等）を是正する（H30問2・H25問4）',
          '__4. 品質指標は前提条件とセットで判断__: バグ密度・摘出率は==管理目標の前提==（テストケース量・有意差・暫定値の仮定）を確認してから解釈する（H29問3・H30問2）',
          '__5. テストで上げられる品質には上限がある__: ==設計限界品質==。設計品質が低いとテストをいくら増やしても届かない（H30問2）',
          '__6. テストの見逃しは下流へ流出する__: テスト技法の特性（WB/BB）を理解し、レビューとテストの==組み合わせ==で補完する（H29問3）',
          '__7. 本番に近い環境・データで検証__: 操作性・性能は==本番相当の環境・データ==でしか正しく評価できない。移行テストは本番データの代表性に限界がある（R6問1・R4問1・H26問3）',
          '__8. 非機能（性能）の検証は早めに__: 性能問題は作り込み後の対処が高くつく。検証時期を==前倒し==で計画する（H27問2）',
          '__9. 利用者参加型の反復検証__: ==同じ利用者==が要件定義→設計→テストを通して評価すると、主観的な品質特性のズレを早期発見できる（R6問1・R2問3）',
          '__10. 改修時は回帰テスト__: 既存機能が壊れていないことを==リグレッションテスト==で確認する（R3問2）',
          '__11. 品質の作り込みは記録で可視化__: 出来高でなく==品質活動の実施状況・記録==（レビュー記録・テスト消化）で確認する（H25問4・H29問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==7QC道具==（数値データ）と==新7QC道具==（言語データ）の対比・各ツールの用途は午前Ⅱ 必出。',
      '【品質コスト】==適合コスト==（予防＋評価）vs ==不適合コスト==（内部不良＋外部不良）。==1-10-100の法則==。',
      '【統計】==±3σ==は==99.73%==。==6σ==は3.4不良/百万。==DMAIC==（既存改善）vs ==DMADV==（新規設計）。',
      '【アジャイル品質】==DoD==／==TDD==（Red-Green-Refactor）／==BDD==（Given-When-Then）。',
      '【ひっかけ】==品質 vs グレード==／==予防 vs 評価==／==内部不良 vs 外部不良==（出荷前後）／==8.2（実行）vs 8.3（監視）==。',
    ],
  },

  // ───────────────────────────────────────────
  // 7. 測定（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  measurement: {
    summary:
      'プロジェクトのパフォーマンスを定量的に測定し、意思決定と継続的改善を支援する活動領域。PMBOK第6版では第7章 EVM 中心、第7版では「測定」パフォーマンス領域として統合。EVM 公式（PV/EV/AC/CPI/SPI/EAC/ETC/VAC/TCPI）は午前Ⅱ 最頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 測定パフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「測定」パフォーマンス領域は、パフォーマンスを監視・評価し適切な対応を取る活動を扱う。第6版では第7章コスト（EVM 中心）が対応',
        ],
      },
      {
        heading: '2. メトリクスの分類',
        items: [
          '==リーディング指標==（先行指標）: 将来を予測する指標（例: パイプライン件数）',
          '==ラギング指標==（遅行指標）: 結果確定後の指標（例: 売上・利益）',
          '成果メトリクス（結果に焦点）と実行メトリクス（活動量に焦点）の区別も問われる',
        ],
      },
      {
        heading: '3. KPI と KRI の違い',
        items: [
          '==KPI==（Key Performance Indicator）: 「どれだけうまくいっているか」を測る==業績指標==（例: CPI・顧客満足度）',
          '==KRI==（Key Risk Indicator）: 「どれだけ危ない状況か」を測る==リスク指標==（例: 離職率・バグ密度・遅延日数）',
          'KPI の設定は__SMART 原則__（具体的・測定可能・達成可能・関連性・期限付き）で',
        ],
      },
      // ── B. EVM ──
      {
        heading: '4. EVM の基本概念（PV / EV / AC / BAC）',
        items: [
          '==EVM==（Earned Value Management, アーンドバリュー法）: ==スコープ・スケジュール・コスト==を統合管理する手法',
          '__4つの基本値__:',
          '　==PV==（Planned Value, 計画値）: 当初計画で今までに完了しているはずのコスト（別名 BCWS）',
          '　==EV==（Earned Value, 出来高）: 実際に完了した作業の==当初計画コスト==（別名 BCWP）',
          '　==AC==（Actual Cost, 実コスト）: 実際に完了した作業に実際にかかったコスト（別名 ACWP）',
          '　==BAC==（Budget at Completion, 完成時総予算）: プロジェクト全体の計画予算',
          '__EV の計算方法__:',
          '　==0/100 法==: 完了時のみ100%',
          '　==50/50 法==: 開始時50%、完了時100%',
          '　==パーセント完了法==: 進捗率で按分',
          '　==重み付けマイルストーン法==: 主要マイルストーンに重み配分',
        ],
        navyItems: [[{ text: 'PV/EV/AC/BAC は EVM の最重要4値。午前Ⅱ で必ず出題される', style: 'navy' }]],
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
        navyItems: [[{ text: '本セクションは午前Ⅱ/午後I の計算問題の参照シート。全式暗記必須', style: 'navy' }]],
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
          '__限界__: ==スコープ変更に弱い==（ベースライン再設定が必要）／品質は測れない／SPI の終盤収束（§9）',
          '__適用条件__: スコープが明確・WBS完備・ベースライン承認済・==進捗測定方法が事前合意済==（0/100法等）',
          'アジャイルではバーンダウン・ベロシティ（§11・§13）が代替',
        ],
      },
      // ── C. スケジュール・進捗測定 ──
      {
        heading: '11. バーンダウン・バーンアップチャート',
        items: [
          '==バーンダウン・チャート==: ==残作業==を時系列でプロット。右下がりが理想、==水平は停滞==・==上昇はスコープ追加か手戻り==',
          '==バーンアップ・チャート==: 完了量と総スコープの2線。==スコープ変更が見えやすい==',
          '詳細は development-approach §22 参照',
        ],
      },
      {
        heading: '12. リードタイム・サイクルタイム・スループット',
        items: [
          '==リードタイム==: 顧客が要求してから受領するまで（顧客視点）／==サイクルタイム==: 作業開始から完了まで（開発視点）',
          '==スループット==: 単位時間あたりの完了量',
          '==リトルの法則==: ==WIP = スループット × サイクルタイム==。WIP を下げるとサイクルタイムが下がる',
        ],
        navyItems: [[{ text: 'リトルの法則は午前Ⅱ 計算問題で出題。WIP/スループット/リードタイム の関係を暗記', style: 'navy' }]],
      },
      {
        heading: '13. ベロシティとキャパシティ計画',
        items: [
          '==ベロシティ==: 1スプリントで完了したストーリーポイントの合計。過去数スプリントの平均で将来を予測',
          '__注意__: ==チーム固有の値==でチーム間比較は無意味',
          '__キャパシティ計画__: 稼働可能時間×稼働率で算出し、休暇・会議を控除',
        ],
      },
      // ── D. 品質・成果測定 ──
      {
        heading: '14. 欠陥率と欠陥密度',
        items: [
          '==欠陥密度==（Defect Density）= 欠陥数 ÷ プロダクトサイズ（例: ==バグ数 / KLOC==）',
          '==欠陥率== = 欠陥数 ÷ 検査数。単位は % または ==DPMO==（百万機会あたり欠陥数）',
          '欠陥は==重大度==（Severity）と==優先度==（Priority）を分けて管理する',
        ],
      },
      {
        heading: '15. 顧客満足度メトリクス（CSAT / NPS）',
        items: [
          '==CSAT==: 「どれくらい満足ですか」の満足回答割合。短期・取引単位の評価',
          '==NPS==（Net Promoter Score）: 「知人に推奨しますか」0-10点で、==推奨者(9-10)% − 批判者(0-6)%==。中立者(7-8)は計算から除外。範囲 -100〜+100',
        ],
        navyItems: [[{ text: 'NPS の計算（中立者除外）は判別ポイント', style: 'navy' }]],
      },
      {
        heading: '16. プロダクトメトリクス（DAU/MAU/解約率）',
        items: [
          'SaaS 系の代表指標: ==DAU/MAU==（アクティブユーザ）／==解約率==（Churn Rate）／==LTV==（顧客生涯価値）／CAC（顧客獲得コスト）',
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
          '__戦略マップ__: 4視点間の==因果関係==を矢印で図示。財務・非財務／先行・遅行のバランスが特長',
        ],
      },
      {
        heading: '18. OKR（Objectives and Key Results）',
        items: [
          '==OKR==: ==Objective==（定性的で野心的な目標）と==Key Results==（定量的な達成基準 3-5個）で構成する目標管理フレームワーク',
          '特徴: 全社公開の透明性／==70%達成が標準==の野心的目標設定／報酬と切り離す',
          '__BSC との違い__: BSC は多次元のバランス重視、OKR は野心的目標への集中',
        ],
      },
      {
        heading: '19. 経済性評価（NPV / ROI / IRR / 回収期間）',
        items: [
          '詳細は planning §24 参照（NPV > 0 で採算あり／IRR > 資本コスト／回収期間は短いほど良い）',
          '__使い分け__: ==NPV==は規模が違う案件の比較、==IRR==は投資効率の比較、回収期間は流動性重視時',
        ],
      },
      // ── F. パフォーマンス・レポート ──
      {
        heading: '20. 報告書の種類',
        items: [
          '==ステータス==（現状）／==トレンド==（傾向）／==予測==（EAC・完了時期）／==バリアンス==（計画との差異）の4種類。詳細は project-work §18',
        ],
      },
      {
        heading: '21. ダッシュボードと可視化',
        items: [
          '==ダッシュボード==: KPI/メトリクスを一画面で可視化。==RAG ステータス==（Red/Amber/Green）で直感的に判定',
          'グラフは目的に応じて使い分ける（折れ線=時系列／棒=比較／円=構成比／散布=相関）',
        ],
      },
      {
        heading: '22. パフォーマンス・レビュー会議',
        items: [
          '__主要な会議体__: デイリースタンドアップ（15分）／スプリント・レビュー／==ステアリングコミッティ==（経営判断・月次）／==フェーズゲート==での go/no-go 判定',
          '原則: データ駆動・アクション指向・タイムボックス・決定事項のフォローアップ',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '23. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '25. 午後Ⅰの定石（進捗・定量マネジメント）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの進捗系設問は「数値の解釈」と「測定方法の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 進捗は自己申告でなく出来高で測る__: 「90%完了」の申告は当てにならない。==EVM==・成果物の完成基準・==重み付け==で客観測定する（R1問3・H26問2）',
          '__2. 数値で掴み、CPへの影響を見てから動く__: ==SPI/CPI==で遅延・超過を定量把握し、==クリティカルパス==上かを確認してから対策を選ぶ（H28問3）',
          '__3. 集計値は部分の問題を隠す__: 全体 SPI が 1 に近くても、特定工程・チームの深刻な遅れが==平均に埋もれる==。層別・工程別に見る（H28問3）',
          '__4. 進捗線の読みは前提の確認から__: イナズマ線・出来高は==計上ルール（完了基準）が揃っている==ことが前提。ルールが曖昧なら数字は信用できない（H26問2）',
          '__5. 管理目標は前提条件とセットで判断__: 指標が目標内でも、前提（テストケース密度・母数）が崩れていれば意味がない（H29問3・H30問2）',
          '__6. 改善は弱みに集中、強みは横展開__: プロセス改善は==弱点工程を優先==し、強い工程のやり方を他へ広げる（R1問3）',
          '__7. 効果は顧客視点で測る__: 作業量・アウトプットでなく==顧客体験価値==・広義の生産性で効果を測定する（R3問2・R2問2）',
          '__8. 予兆はしきい値で機械的に検知__: ==KRI にしきい値==を設け、超えたら対応を発動する仕組みにする（発見を個人の注意力に頼らない）（R6問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・EVM】==CV=EV-AC==、==SV=EV-PV==、==CPI=EV/AC==、==SPI=EV/PV==。==分子は常に EV==。',
      '【TCPI】==BAC維持==なら ==(BAC-EV)/(BAC-AC)==、==EAC維持==なら ==(BAC-EV)/(EAC-AC)==。R6秋期 問4 の出題実績。',
      '【EAC 3公式】標準=BAC/CPI、残作業計画通り=AC+(BAC-EV)、両方継続=AC+(BAC-EV)/(CPI×SPI)。',
      '【リトルの法則】==WIP = スループット × サイクルタイム==。WIP制限で時間短縮。',
      '【NPS】==推奨者(9-10)% − 批判者(0-6)%==。中立者(7-8)は計算除外。',
      '【ひっかけ】SPI は終盤で必ず1に収束（ES が代替）／KPI（業績）vs KRI（リスク）／リーディング vs ラギング。',
    ],
  },

  // ───────────────────────────────────────────
  // 8. 不確かさ・リスク（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  uncertainty: {
    summary:
      'リスク（不確かな事象の影響）と機会（プラスのリスク）を識別・分析・対応・監視する活動領域。PMBOK第6版では第11章「リスクマネジメント」7プロセス、第7版では「不確かさ」パフォーマンス領域。確率影響度マトリクス・EMV・脅威/機会5戦略が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 不確かさパフォーマンス領域の目的と成果',
        items: [
          'PMBOK第7版「不確かさ」パフォーマンス領域は、リスクに加え==曖昧さ==・==複雑性==・==変動性==も扱う（§24）。第6版では第11章 リスクマネジメント 7プロセスが対応',
        ],
      },
      {
        heading: '2. リスクの定義（脅威と機会）',
        items: [
          '==リスク==: 発生が不確かで、発生するとプロジェクト目標に影響を与える事象または状態',
          '　==脅威==（Threat, マイナスリスク）と==機会==（Opportunity, プラスリスク）の両方を扱う',
          'リスクは「==事象・原因・影響==」の3要素で記述する',
          '==リスク・スコア== = ==確率 × 影響度==',
        ],
        navyItems: [[{ text: '「脅威」「機会」両方を扱うのが PMBOK の特徴。日常では「リスク=脅威」と捉えがちなひっかけ', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第6版 第11章 リスクマネジメント 7プロセス',
        items: [
          '__7プロセスの群分布__: 11.1 計画〜11.5 対応計画の==5つが計画プロセス群==／==11.6 対応実行==（実行群・第6版で新設）／==11.7 監視==（監視・コントロール群）',
          '試験頻出: ==プロセス群所属==の判別問題（計画5・実行1・監視1）',
        ],
        navyItems: [[{ text: '11.6 は2017年改訂で新設', style: 'navy' }]],
      },
      // ── B. リスク特定 ──
      {
        heading: '4. 11.1 リスクマネジメント計画',
        items: [
          'リスク管理活動の実施方法を定義するプロセス。アウトプットはリスクマネジメント計画書',
          '計画書では==リスク選好==・==リスク許容度==・==リスク・スレッショルド==（§20）や確率影響度の定義・RBS を定める',
        ],
      },
      {
        heading: '5. 11.2 リスクの特定（RBS・SWOT・プロンプトリスト）',
        items: [
          '__主要技法__: ブレーンストーミング／チェックリスト／根本原因分析／前提条件分析／==SWOT==分析',
          '==プロンプトリスト==: 網羅性を高める観点リスト。==PESTLE==（政治・経済・社会・技術・法・環境）／TECOP／VUCA',
          '__主要アウトプット__: ==リスク登録簿==・リスク・レポート',
        ],
        navyItems: [[{ text: 'プロンプトリストはリスク特定の網羅性を高めるためのフレームワーク。試験頻出', style: 'navy' }]],
      },
      {
        heading: '6. RBS（リスク・ブレークダウン・ストラクチャー）',
        items: [
          '==RBS==（Risk Breakdown Structure）: リスクを==カテゴリ別に階層分解==した図（WBS は作業、RBS はリスクを分解）',
          '__典型カテゴリ__: ==技術==／==外部==（規制・市場）／==組織==（資源・優先度）／==プロジェクトマネジメント==（見積もり・計画）',
        ],
      },
      // ── C. 定性的・定量的分析 ──
      {
        heading: '7. 11.3 定性的リスク分析と確率影響度マトリクス',
        items: [
          '個別リスクの==確率==と==影響度==を評価し==優先順位==を付ける（全リスクが対象・数値化はしない）',
          '==確率影響度マトリクス==: 縦軸=確率×横軸=影響度のセルで==リスク・スコア==を算出。==RAG==（Red/Amber/Green）色分けで優先度を視覚化',
        ],
        navyItems: [[{ text: '確率影響度マトリクスは午前Ⅱ/午後I 頻出。RAG 区分の判断が出る', style: 'navy' }]],
      },
      {
        heading: '8. 11.4 定量的リスク分析',
        items: [
          '個別リスクとプロジェクト全体リスクを==数値化==する（==重要リスクのみ==対象・==省略可能==なプロセス）',
          '__主要技法__: ==モンテカルロ法==（シミュレーション）／==感度分析==（トルネード図）／==決定木分析==',
          '__定性 vs 定量__: 定性は==すべてのリスク==を優先順位付け／定量は==重要リスクのみ==数値化（この対比がひっかけ）',
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
        navyItems: [[{ text: 'EMV/決定木は午前Ⅱ 計算問題で頻出。状況設定から最適選択肢を求める', style: 'navy' }]],
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
          '==プロジェクト全体リスク==: 個別リスクの集合では捉えきれない==相互作用==を含む、プロジェクト全体の不確かさ',
          '指標は累積コスト超過確率・成功確率など。==ステアリングコミッティ==で経営判断の対象になる',
        ],
      },
      // ── D. リスク対応 ──
      {
        heading: '12. 11.5 リスク対応計画',
        items: [
          '個別リスクと全体リスクへの==対応戦略==（§13・§14）を選定・計画するプロセス',
          '各リスクに==リスク・オーナー==（対応の担当者）を割り当てる',
          '==コンティンジェント対応戦略==: トリガー発生時のみ実行する事前定義の対応',
        ],
      },
      {
        heading: '13. 脅威への5戦略',
        items: [
          '__PMBOK第6版が定める脅威（マイナスリスク）への5戦略__:',
          '　__1.__ ==回避==（Avoid）: ==脅威の原因を除去==（スコープ縮小・代替技術採用等）',
          '　__2.__ ==転嫁==（Transfer）: ==第三者に責任を移転==（保険・契約条項・アウトソース）',
          '　__3.__ ==軽減==（Mitigate）: 確率または影響度を==下げる==（プロトタイプ・予備プラン）',
          '　__4.__ ==受容==（Accept）: 特別な対応をしない',
          '　　==能動的受容==: ==コンティンジェンシー予備==を用意／==受動的受容==: 何もしない',
          '　__5.__ ==エスカレーション==（Escalate）: ==PMの権限外==のため上位レベルへ',
          '__選択基準__: 影響度が極めて高い→回避・転嫁／中→軽減／低→受容／権限外→エスカレーション',
        ],
        navyItems: [[{ text: '脅威5戦略は午前Ⅱ 必出。「回避」「転嫁」「軽減」「受容」「エスカレーション」の正確な名称', style: 'navy' }]],
      },
      {
        heading: '14. 機会への5戦略',
        items: [
          '__PMBOK第6版が定める機会（プラスリスク）への5戦略__:',
          '　__1.__ ==活用==（Exploit）: ==機会を確実に==実現させる（脅威の「回避」の逆）',
          '　__2.__ ==共有==（Share）: ==機会を第三者と共有==して両者にメリット（アライアンス・JV）',
          '　__3.__ ==強化==（Enhance）: 確率または影響度を==上げる==（脅威の「軽減」の逆）',
          '　__4.__ ==受容==（Accept）: 特別な対応をしない',
          '　__5.__ ==エスカレーション==（Escalate）: PMの権限外のため上位レベルへ',
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
          '計画されたリスク対応策を実行するプロセス（==実行プロセス群==・==PMBOK第6版で新設==）',
          '新設の背景: 旧版では「計画したが実行されない」問題があった。11.5 計画と 11.6 実行は==別プロセス==',
        ],
        navyItems: [[{ text: 'PMBOK第6版で新設。「計画」と「実行」の分離で実装漏れを防ぐ', style: 'navy' }]],
      },
      {
        heading: '16. 11.7 リスクの監視',
        items: [
          '対応策の有効性の監視・新規リスクの特定・登録簿の更新を行う（監視・コントロール群）',
          '__代表的な技法__: リスクの再評価／==リザーブの分析==（予備の残量確認）／==リスク監査==（管理プロセスの有効性を独立評価）',
        ],
      },
      // ── E. リスク文書・関連概念 ──
      {
        heading: '17. リスク登録簿',
        items: [
          '==リスク登録簿==（Risk Register）: リスク管理の中央データベース。==生きた文書==として各プロセスの都度更新',
          '__主要記載項目__: リスク記述（事象・原因・影響）／カテゴリ／確率・影響度・スコア／==リスク・オーナー==／対応戦略／==残存リスク・二次リスク==／==トリガー==',
        ],
        navyItems: [[{ text: 'リスク登録簿の構成項目は午前Ⅱ/午後I で記載項目を問う設問が頻出', style: 'navy' }]],
      },
      {
        heading: '18. リスク・レポート',
        items: [
          '==リスク・レポート==: ==全体俯瞰==と上位リスクのサマリー（第6版で新設）。経営層・ステアリングコミッティ向け',
          '__登録簿との違い__: 登録簿は==個別リスクの詳細==DB／レポートは==全体のサマリー==（この対比がひっかけ）',
        ],
      },
      {
        heading: '19. 二次リスク・残存リスク',
        items: [
          '==残存リスク==（Residual Risk）: 対応策実施後も==残っているリスク==（元のリスクの消えない部分）。コンティンジェンシー予備でカバー',
          '==二次リスク==（Secondary Risk）: 対応策の実施によって==新たに発生==するリスク（例: 人員追加→コミュニケーション複雑化）',
          '試験頻出: 二次リスクと残存リスクの混同（新発生 vs 残り）',
        ],
        navyItems: [[{ text: '二次リスク vs 残存リスクは午前Ⅱ 必出ひっかけ。例で確実に区別', style: 'navy' }]],
      },
      {
        heading: '20. リスク選好・リスク許容度・スレッショルド',
        items: [
          '__3階層__: ==リスク選好==（戦略レベルで取りに行く量）→ ==リスク許容度==（許容できる範囲）→ ==リスク・スレッショルド==（エスカレーション発動の==具体的な境界値==）',
          '例: 「成長のため多少の超過は許容（選好）」→「最大15%まで（許容度）」→「15%超でエスカレーション（スレッショルド）」',
          'リスクマネジメント計画書に明記する。試験頻出: 3概念の==階層関係==',
        ],
      },
      {
        heading: '21. リスク・プロファイル',
        items: [
          '==リスク・プロファイル==: 組織・個人のリスク選好・許容度のパターン（回避型／中立型／選好型）',
          '業界・組織文化・過去の経験・規制環境で形成される（金融・原子力=回避型、スタートアップ=選好型）',
        ],
      },
      // ── F. アジャイル・特殊リスク ──
      {
        heading: '22. アジャイルでのリスク対応',
        items: [
          'アジャイルではリスク管理が業務に組み込まれる: ==高リスク項目を早期スプリントに取り込み==・短期反復で早期発見・デモで要求リスク低減',
          '==スパイク==（Spike）: 技術リスク検証のための短期調査タスク',
        ],
      },
      {
        heading: '23. プロジェクト統合リスクと依存関係リスク',
        items: [
          '__統合リスク__: 複数サブシステム・サプライヤの==統合時==に発生（インターフェース不整合等）',
          '__依存関係リスク__: 外部（ベンダー・規制）・内部（他プロジェクト・コア要員）への依存に起因。==依存関係マップ==で可視化し、クリティカルな依存から対応',
        ],
      },
      {
        heading: '24. 曖昧さ・複雑性・変動性（PMBOK7 視点）',
        items: [
          '__不確かさの4要素__: ==リスク==（確率と影響を推定可能）／==曖昧さ==（意味が不明確）／==複雑性==（要素間の関係が予測困難）／==変動性==（変化が速い）',
          '__対応__: 曖昧さ→プロトタイピング・段階的詳細化／複雑性→小さな試行・アジャイル／変動性→適応型ライフサイクル',
        ],
        navyItems: [[{ text: 'PMBOK第7版は「リスクマネジメント」を「不確かさ」に拡張。VUCA への対応が明示', style: 'navy' }]],
      },
      // ── G. 早期警戒システムとトリガー管理 ──
      {
        heading: '25. リスク・トリガーと早期警戒システム',
        items: [
          '==リスク・トリガー==: リスク発生の直前に観測できる==兆候==（例: 台風接近→物流遅延リスク）',
          '__早期警戒システム__: ==KRI==＋==閾値==（例: SPI < 0.9 で警告）＋アラート＋対応手順で、予兆検知を仕組み化する',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '26. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '28. 午後Ⅰの定石（リスクマネジメント）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのリスク系設問は「リスクの見つけ方」と「対応の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 制約と新規性がリスクの源__: 必達期限・固定予算・限られた要員・==初めての技術や業務==からリスクを洗い出す（R1問1・H29問1・H25問2）',
          '__2. 特定したリスクは対応とセットで計画__: 洗い出しで終わらせず、==対応策・担当者・発動条件==まで決めて計画に織り込む（R1問1・H28問1）',
          '__3. しきい値で扱いを分ける__: 発生確率・影響度を評価し、==しきい値==で「現場対応／上位へエスカレーション」を機械的に振り分ける（R6問3・R3問1）',
          '__4. 予兆は隠さず共同管理__: 遅延・品質低下の==予兆段階での共有==が最速の対処を生む。請負相手でも予兆情報は共有させる（R5問2・H28問2・R5問3）',
          '__5. 遅延の事業インパクトで優先度を決める__: リスクの大きさは作業への影響でなく==事業への影響==（機会損失・法令期限）で測る（R1問2）',
          '__6. 新技術・新基盤のリスクは3点セット__: ==要員==（経験者不足）・==品質==・==スケジュール==に波及する。検証と支援体制で抑える（H25問2）',
          '__7. 移行はリハーサルで品質を作り込む__: 本番切替のリスクは==移行リハーサル==・利用者訓練・環境分離で事前に潰す（R1問1）',
          '__8. 予備費は種類と権限で使い分け__: 特定済みリスクには==コンティンジェンシー予備==（PM権限）、想定外には==マネジメント予備==（上位承認）を充てる（R3問3）',
          '__9. キーパーソンの受容性もリスク__: 技術だけでなく==人の抵抗・受容性==をリスクとして特定し、実地確認や巻き込みで対応（H27問2）',
          '__10. 情報セキュリティは具体策で__: 可搬端末の紛失・個人情報の扱いは==具体的な管理策==（暗号化・持出制限・アクセス制御）で答える（H28問1・H26問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】7プロセスの群所属（==計画5・実行1・監視1==）。11.6 対応実行は第6版で新設。',
      '【脅威5戦略】==回避==／==転嫁==／==軽減==／==受容==（能動・受動）／==エスカレーション==。',
      '【機会5戦略】==活用==／==共有==／==強化==／==受容==／==エスカレーション==。対応関係: 回避↔活用・転嫁↔共有・軽減↔強化。',
      '【EMV】==確率 × 影響額==。脅威マイナス・機会プラス。決定木は末端から計算し決定ノードで最大を選ぶ。',
      '【ひっかけ】==二次リスク==（新発生）vs ==残存リスク==（残り）／定性（全リスク）vs 定量（重要リスクのみ）／登録簿（個別詳細）vs レポート（全体俯瞰）。',
    ],
  },

  // ───────────────────────────────────────────
  // 9. 統合・変更管理（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  integration: {
    summary:
      'プロジェクトの全要素を統合し、変更と構成を管理する活動領域。PMBOK第6版では第4章「統合マネジメント」7プロセス（4.1〜4.7）。プロジェクト憲章・統合変更管理（CCB）・構成管理が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 統合マネジメントの目的',
        items: [
          '==統合マネジメント==: 他の知識エリアの活動を調整・統合し、==トレードオフ==（スコープ・スケジュール・コスト・品質のバランス）を意思決定する。PMの中心的な役割',
        ],
      },
      {
        heading: '2. PMBOK第6版 第4章 7プロセス概観',
        items: [
          '__7プロセスの群分布__: 4.1 憲章（==立上げ==）／4.2 計画書（計画）／4.3 指揮・4.4 知識（実行）／4.5 監視・==4.6 統合変更管理==（監視・コントロール）／4.7 終結（終結）',
          '統合は10知識エリアで唯一、==5プロセス群すべて==にプロセスを持つ',
        ],
        navyItems: [[{ text: 'プロセス群分布（立上1・計画1・実行2・監視2・終結1）は判別問題で頻出', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第7版との対応',
        items: [
          '第7版では統合マネジメントは==独立領域として消滅==し、12原則（システム思考等）とパフォーマンス領域に分散。試験は第6版用語（4.1〜4.7）が中心',
        ],
      },
      // ── B. プロジェクト憲章 ──
      {
        heading: '4. 4.1 プロジェクト憲章作成',
        items: [
          'プロジェクトを==正式に認可==し PM を特定する（==立上げプロセス群==）',
          '__主要インプット__: ==ビジネスケース==等のビジネス文書（§6）',
          '__発行者__: ==スポンサー==または上位組織（PMが起草しても==承認はスポンサー==）',
        ],
        navyItems: [[{ text: 'プロジェクト憲章は PM の権限の根拠。スポンサー承認が必須', style: 'navy' }]],
      },
      {
        heading: '5. プロジェクト憲章の構成要素',
        items: [
          '__主要記載項目__: 目的／==測定可能な目標・成功基準==／上位レベルの要求・リスク・予算／マイルストーン／==PMの責任と権限レベル==／スポンサー',
          '__特徴__: ==上位レベル==の記述（詳細は計画書で）。基本的に変更しない文書',
          '試験頻出: 憲章と計画書・スコープ記述書との混同',
        ],
        navyItems: [[{ text: 'プロジェクト憲章 vs 計画書 vs スコープ記述書 の使い分けは午前Ⅱ で頻出', style: 'navy' }]],
      },
      {
        heading: '6. ビジネス文書との関係',
        items: [
          '==ビジネスケース==: プロジェクト投資の==正当化==（ニーズ・代替案分析・推奨案）',
          '流れ: ビジネス・ニーズ → ビジネスケース → ==憲章== → プロジェクト',
          'ビジネス文書は==PM以外==（スポンサー・事業部門）が作成し、PMはそれを入力に憲章を起草する',
        ],
      },
      // ── C. 計画書作成と実行 ──
      {
        heading: '7. 4.2 プロジェクトマネジメント計画書作成（再確認）',
        items: [
          'サブシディアリー計画書とベースラインを統合して全体計画書を作る（詳細は planning §29）。承認時に==ベースライン化==され、以降の変更は 4.6 経由',
        ],
      },
      {
        heading: '8. 4.3 プロジェクト作業の指揮・マネジメント（再確認）',
        items: [
          '計画書の通りに作業を実行し、各知識エリアの実行プロセスを同期させる（詳細は project-work §4）',
        ],
      },
      {
        heading: '9. 4.4 プロジェクト知識のマネジメント（再確認）',
        items: [
          '既存知識の活用と新規知識の創出（詳細は project-work §5、SECIモデルは §20）。教訓は==継続的に==収集する',
        ],
      },
      // ── D. 監視・コントロール ──
      {
        heading: '10. 4.5 プロジェクト作業の監視・コントロール',
        items: [
          '各知識エリアの監視プロセスからの==作業パフォーマンス情報を統合==し、プロジェクト全体の進捗を監視・是正する',
          '__主要アウトプット__: ==作業パフォーマンス報告書==／変更要求',
        ],
      },
      {
        heading: '11. EVM 連携と統合的監視',
        items: [
          '==EVM==は 4.5 の中核技法。スコープ（EV）・コスト（AC）・スケジュール（PV）を==一元評価==できる（詳細は measurement §4-8）',
        ],
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
        navyItems: [[{ text: '是正処置 vs 予防処置 vs 欠陥修正の区別は午前Ⅱ 頻出', style: 'navy' }]],
      },
      // ── E. 統合変更管理 ──
      {
        heading: '13. 4.6 統合変更管理',
        items: [
          '全変更要求を==一元管理==して影響評価・承認・実装する（==監視・コントロールプロセス群==、実行群と誤答しやすい）',
          '各知識エリアから分散的に発生する変更要求を一元化し、スコープ・スケジュール・コスト・品質への影響を==同時評価==する',
        ],
        navyItems: [[{ text: 'CCB（変更管理委員会）は本プロセスの中核', style: 'navy' }]],
      },
      {
        heading: '14. 変更要求の種類',
        items: [
          '__変更要求の4種類__: ==是正処置==／==予防処置==／==欠陥修正==（§12）／==更新==（文書・計画書）',
          '変更要求書には変更内容・==影響評価==（スコープ・スケジュール・コスト・品質・リスク）・代替案を記載し、==変更ログ==で全変更を追跡',
        ],
      },
      {
        heading: '15. CCB（変更管理委員会）',
        items: [
          '==CCB==（Change Control Board, 変更管理委員会）: 変更要求を審議・==承認/却下・延期==する正式組織',
          '__構成__: スポンサー・PM・主要ステークホルダーの代表（+必要に応じ技術専門家）',
          '__権限レベル__: 重大変更=スポンサー/経営層＋CCB／中規模=CCB／==軽微変更のみ PM 単独==（事前承認の範囲）',
        ],
        navyItems: [[{ text: 'CCB は午前Ⅱ 必出。構成・役割・権限レベルを暗記', style: 'navy' }]],
      },
      {
        heading: '16. 変更影響評価',
        items: [
          '__影響評価の軸__: スコープ・スケジュール・コスト・品質＋リスク・ステークホルダー・契約への影響を==同時に==評価',
          '各知識エリアの専門家が共同で評価し、==定量化==した結果を文書化する',
        ],
      },
      {
        heading: '17. 変更管理ワークフロー',
        items: [
          '__標準ワークフロー__: 起票 → PM の初期スクリーニング（軽微なら単独承認）→ ==影響評価== → ==CCB 審議== → 承認/却下/延期 → 実装 → ==ベースライン更新== → 関係者へ通知 → 変更ログ更新',
          '却下時は要求者へ理由を説明する。変更要求番号でトレーサビリティを確保',
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
        navyItems: [[{ text: 'ISO 10007 が国際規格', style: 'navy' }]],
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
        navyItems: [[{ text: 'ベースラインの種類と凍結概念は午前Ⅱ 頻出。「変更」と「ベースライン更新」の関係', style: 'navy' }]],
      },
      {
        heading: '20. バージョン管理',
        items: [
          '==バージョン管理==: 文書・成果物の==変更履歴==を追跡する',
          '__セマンティック・バージョニング__: Major（互換性なし）.Minor（後方互換の機能追加）.Patch（バグ修正）',
          '文書は Draft → Review → Approved（v1.0 正式版）の状態遷移で管理',
        ],
      },
      // ── G. プロジェクト終結 ──
      {
        heading: '21. 4.7 プロジェクトまたはフェーズの終結（再確認）',
        items: [
          '全知識エリアの活動を終結し、教訓・テンプレートを==組織資産へ移転==する（詳細は delivery §26）',
        ],
      },
      {
        heading: '22. 文書化と教訓の活用',
        items: [
          '終結時は==教訓登録簿の最終化==・最終報告書・アーカイブ・契約終結を行う',
          '教訓は組織リポジトリ・テンプレート・プロセス改善に反映して次に活かす（project-work §21）',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '23. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '25. 午後Ⅰの定石（変更管理・統合）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの変更管理系設問は「変更・課題の統制の仕組み」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 後から来る要求は変更管理で統制__: 無秩序に取り込むと計画が崩れる。==判定・付議・承認の手続き==と「誰がどこまで決めるか」を明確にする（R6問3・R3問2）',
          '__2. 変更は影響波及まで確認__: 一箇所の変更が関連機能・他ベンダー・文書へ==波及する範囲==を洗い出してから承認する（R3問3・H27問3）',
          '__3. 追加開発は構成管理で迷子を防ぐ__: 取込んだ変更は==構成管理==で管理し、設計書を最新に保つ（H27問3・H29問3・R6問2）',
          '__4. 環境変化はスコープ起点で見直す__: 合併・制度変更が起きたら、まず==スコープへの影響==を判断し、スケジュール・コストへ展開する（H25問3）',
          '__5. 課題は「場の設計」で早期に決める__: 課題は放置するほど遅延の火種になる。==誰がいつどこで決めるか==（会議体・エスカレーション先）を仕組み化する（R6問2・H28問3）',
          '__6. 未決事項は一覧で追跡__: ==課題管理表・未決事項一覧==で担当・期限を管理し、進捗会議でフォローする（H28問3）',
          '__7. 成果物は一元管理__: 課やベンダーを越えて参照できる==共通の管理基盤==に成果物を集約する（R6問2）',
          '__8. 憲章で経営の承認と体制を固める__: 立上げ時に==プロジェクト憲章==で目的・権限・体制の承認を得ることが、後の協力要請の土台になる（R2問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】第4章のプロセス群分布: 立上1（4.1）・計画1（4.2）・実行2（4.3/4.4）・監視2（4.5/4.6）・終結1（4.7）。==5群すべて==に保有は統合のみ。',
      '【プロジェクト憲章】PM の==権限の根拠==・上位レベル記述・==スポンサー承認==。計画書・スコープ記述書との区別。',
      '【統合変更管理】==CCB==で審議・承認。変更要求は==是正/予防/欠陥修正/更新==の4種類。4.6 は==監視・コントロール群==（実行ではない）。',
      '【是正/予防/欠陥修正】是正=過去問題、予防=将来問題、欠陥修正=成果物の不具合。',
      '【ひっかけ】変更管理（プロセス）vs 構成管理（成果物）／計画値（当初）vs ベースライン（承認済み・変更後は更新）。',
    ],
  },

  // ───────────────────────────────────────────
  // 10. ガバナンス・組織論（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  governance: {
    summary:
      'プロジェクトを組織の戦略と整合させ、意思決定と権限の枠組みを提供する活動領域。ポートフォリオ／プログラム／プロジェクトの3階層、PMO、ステアリングコミッティ、COBIT・JIS Q 38500、プロジェクト監査が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. プロジェクト・ガバナンスの定義',
        items: [
          '==プロジェクト・ガバナンス==: プロジェクトの意思決定・報告・==監督の枠組み==',
          '__マネジメントとの違い__: マネジメントは==実行==（計画通りに動かす）／ガバナンスは==監督==（正しい方向か判断）',
        ],
      },
      {
        heading: '2. プロジェクト・ガバナンス・フレームワーク',
        items: [
          '__主要要素__: ガバナンス・ボディ（==ステアリングコミッティ==・CCB）／役割と責任／意思決定プロセス／報告構造／==エスカレーション・プロセス==／監査',
          '組織の成熟度・規模・リスクレベルに応じてテーラリングする',
        ],
      },
      {
        heading: '3. PMBOK第7版「スチュワードシップ」「価値」原則',
        items: [
          '第7版はガバナンスを独立領域でなく12原則で扱う。関連原則: ==スチュワードシップ==（責任ある運営）／==価値==／==システム思考==（全体最適）',
        ],
      },
      // ── B. 階層構造 ──
      {
        heading: '4. ポートフォリオ／プログラム／プロジェクト 3階層',
        items: [
          '　==ポートフォリオ==: 戦略目標達成のためのプロジェクト・プログラムの==集合==。目的は==価値最大化・戦略整合==',
          '　==プログラム==: ==相互関連==する複数プロジェクトの統合管理。目的は==便益実現==（単独では得られない便益）',
          '　==プロジェクト==: 有期の取り組み。目的は==成果物デリバリー==',
          '試験頻出: 3階層の==目的の違い==を問う設問',
        ],
      },
      {
        heading: '5. OPM（Organizational Project Management）',
        items: [
          '==OPM==（Organizational Project Management）: ポートフォリオ・プログラム・プロジェクトを統合し、==戦略から実行への一貫性==を確保するフレームワーク',
          '==OPM3==: 組織のプロジェクト管理成熟度を==5段階==で評価（アドホック→反復可能→定義済み→管理→最適化）',
        ],
      },
      {
        heading: '6. 戦略整合（Strategic Alignment）',
        items: [
          '==戦略整合==: プロジェクトが組織戦略と整合している状態。ビジョン → 戦略目標 → ポートフォリオ → プロジェクトの階層で繋がる',
          '__仕組み__: ==ビジネスケース==（選定時）／==フェーズゲート・レビュー==（継続確認）',
          '戦略が変化したら==プロジェクト終結・再定義==も選択肢（続けることが目的化しない）',
        ],
      },
      {
        heading: '7. プログラム・マネジメントの特徴',
        items: [
          '==プログラム・マネジメント==: 相互関連プロジェクトを統合管理して==プログラム便益==を実現',
          '__プロジェクトとの違い__: プログラムの成果は==便益==・変化を前提／プロジェクトの成果は==成果物==',
        ],
      },
      // ── C. PMO 詳細 ──
      {
        heading: '8. PMO 3類型の詳細（team §30 詳細）',
        items: [
          '__支援型__（コントロール度==低==）: テンプレート・ベストプラクティス提供。強制力なし',
          '__コントロール型__（==中==）: フレームワーク強制・==準拠状況監査==',
          '__指揮型__（==高==）: プロジェクトを直接管理。PM を PMO に配属',
          '概観は team §30 参照',
        ],
      },
      {
        heading: '9. PMO のサービス',
        items: [
          '__主要サービス__: 方法論策定・標準テンプレート／トレーニング／プロジェクト支援・監督／==教訓リポジトリ==等の知識管理／==組織横断的リソース配分==／ポートフォリオ管理',
        ],
      },
      {
        heading: '10. PMO 成熟度モデル',
        items: [
          '成熟度モデル（OPM3・Kerzner PMMM 等）は典型的に==5段階==: アドホック → 反復可能 → ==定義済み==（標準化）→ ==管理==（測定）→ ==最適化==（継続的改善）',
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
        navyItems: [[{ text: 'ステアリングコミッティと CCB の違いは午前Ⅱ 頻出', style: 'navy' }]],
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
          '__判定基準__: 成果物の品質・受入／予実比較／リスク状況／==ビジネスケースの妥当性==（戦略・市場変化を反映）',
          '__判定結果__: ==Go==／==No-Go==（中止）のほか ==Hold==（条件付き再判定）／==Recycle==（前フェーズに戻る）もある',
        ],
        navyItems: [[{ text: 'Cooper の Stage-Gate プロセスが起源。新製品開発で広く採用', style: 'navy' }]],
      },
      {
        heading: '13. 意思決定権限の階層',
        items: [
          '__意思決定の階層__: 経営層・ポートフォリオ委員会（投資配分・選定・中止）→ ==ステアリングコミッティ==（フェーズゲート・重大変更）→ PM・==CCB==（日常運営・通常変更）',
          '__エスカレーション・パス__: PM → ステアリングコミッティ → ポートフォリオ委員会 → 経営層。権限と責任は憲章等で明文化',
        ],
      },
      // ── E. IT ガバナンスと標準 ──
      {
        heading: '14. COBIT 概観',
        items: [
          '==COBIT==: ==IT ガバナンス==・IT マネジメントの国際標準フレームワーク（==ISACA==提供）',
          'IT 投資の価値最大化・IT リスクの最適化が目的。ITIL（運用）・ISO/IEC 27001（セキュリティ）と補完的',
        ],
        navyItems: [[{ text: '情報処理試験では概念問題で出題', style: 'navy' }]],
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
      },
      {
        heading: '16. ISO/IEC 27001（情報セキュリティ）と関連標準',
        items: [
          '==ISO/IEC 27001==: 情報セキュリティマネジメントシステム（==ISMS==）の国際規格。情報資産を==機密性・完全性・可用性==（CIA）の観点で保護',
          '関連標準: ISO 9001（品質）／ISO/IEC 20000（ITサービス）／ISO 31000（リスク）／ISO 21500（プロジェクトマネジメント）',
        ],
      },
      // ── F. 倫理・コンプライアンス・監査 ──
      {
        heading: '17. PMI 倫理規程・行動規範',
        items: [
          '==PMI 倫理規程==の4つの価値観: ==責任==・==尊重==・==公正==・==誠実==',
          '各価値観に==願望基準==（理想）と==必須基準==（違反は処分対象）がある',
        ],
      },
      {
        heading: '18. コンプライアンス・法令遵守',
        items: [
          '==コンプライアンス==: 法令・規制・業界基準・組織方針の遵守',
          '__プロジェクトでの主要対象__: 労働法／==下請法==／==個人情報保護法==／独占禁止法／著作権法（職務著作）→ project-work §23',
          'コンプライアンス要件はプロジェクト計画書に明記する',
        ],
      },
      {
        heading: '19. プロジェクト監査',
        items: [
          '==プロジェクト監査==: プロジェクトの==独立した評価==。プロセス監査／パフォーマンス監査／コンプライアンス監査等',
          '__実施者__: ==内部監査==（社内監査部門）／==外部監査==（独立第三者）',
          '__実施タイミング__: フェーズゲート前・終結時・重大問題発生時（==進行中も実施==する点がひっかけ）',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '20. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋PMI関連標準を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
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
          '　ガバナンスは枠組み、マネジメントは実行、リーダーシップは動かす',
          '　3層構造を意識して各カテゴリを横断的に学習',
        ],
        navyItems: [[{ text: '相互参照ガイド。ガバナンスは横断的領域のため、他カテゴリと併読推奨', style: 'navy' }]],
      },
      {
        heading: '23. 午後Ⅰの定石（ガバナンス・組織）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのガバナンス系設問は「組織としての統制・支援の仕組み」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. PMOは横串を通す役回り__: 複数チーム・課を横断して==標準化・調整・統制==を担う。チームの上に立つのではなく横串（R6問2・R1問2・H27問1）',
          '__2. トップのコミットメントを引き出す__: 全社変革は==経営層の関与と目標の柔軟化==がなければ現場が動けない（R4問3・R2問1）',
          '__3. 決める場に決められる人を__: 意思決定には==権限を持つ人が出る会議体==を設計する。ステアリングコミッティと現場会議の使い分け（H30問3）',
          '__4. ガバナンスと安定運用の両立__: 統制を強めるほど俊敏さが落ちる。==リスクに応じた統制の強弱==を設計する（R4問2）',
          '__5. 委託・プロセスの遵守は記録と監査で__: 統制は仕組み（==管理レポート・監査・エビデンス==）で担保する。性善説の丸投げは統制喪失（H25問1・H29問2）',
          '__6. 戦略が変わったら続けない勇気__: フェーズゲートで==ビジネスケースの妥当性==を再確認し、価値を失った計画は変更・中止する（H25問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==ポートフォリオ／プログラム／プロジェクト==の3階層と目的の違い（価値最大化／便益／成果物）。',
      '【PMO 3類型】支援型（低）・コントロール型（中）・指揮型（高）のコントロール度。',
      '【ステアリングコミッティ】戦略的判断・フェーズゲート判定。==CCB==（変更管理特化）との違いに注意。',
      '【JIS Q 38500】6原則（責任・戦略・取得・パフォーマンス・適合・==人間行動==）と3タスク（評価・指示・モニター）。',
      '【ひっかけ】マネジメント（実行）vs ガバナンス（監督）／監査は進行中も実施／フェーズゲートには Hold/Recycle もある。',
    ],
  },

  // ───────────────────────────────────────────
  // 11. テーラリング・モデル（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'tailoring-models': {
    summary:
      'プロジェクト特性に応じてプロセス・手法・成果物を調整する活動領域。テーラリング判断要素・コンプレクシティモデル（Cynefin・Stacey）・変革モデル（ADKAR・コッターの8段階）が試験頻出。',
    sections: [
      // ── A. テーラリング概観 ──
      {
        heading: '1. テーラリングの定義と重要性',
        items: [
          '==テーラリング==（Tailoring）: プロジェクト特性に応じてプロセス・手法・成果物を==調整==する活動',
          '__目的__: ==オーバーエンジニアリング==（過剰な管理）と==アンダーマネジメント==（管理不足）の両方を回避',
          'PMBOK第7版では==12原則==の1つに格上げされた中核概念',
        ],
      },
      {
        heading: '2. テーラリングの判断要素',
        items: [
          '__主要判断要素__: ==規模==（大→詳細プロセス）／==複雑性==／==不確実性==（高→適応型）／==チーム経験==（低→詳細ガイダンス）／==規制環境==（厳格→フル文書化）／戦略重要度',
        ],
      },
      {
        heading: '3. PMBOK第7版におけるテーラリングの位置づけ',
        items: [
          '__テーラリングの4ステップ__: 初期アプローチ選択 → ==組織に合わせて調整== → ==プロジェクトに合わせて調整== → 継続的改善',
        ],
      },
      {
        heading: '4. テーラリング・プロセス',
        items: [
          '__実践の流れ__: 状況評価 → 標準を選定（出発点）→ 調整（==追加・削除・修正==）→ パイロットで試行 → 改善',
          'テーラリング理由は計画書に明記し、結果は組織標準（OPAs）へフィードバック',
        ],
      },
      // ── B. PMBOK第7版 主要モデル ──
      {
        heading: '5. PMBOK第7版 主要モデルの概観',
        items: [
          'PMBOK第7版は主要モデルを分類して提示: __状況対応__／__プロセス__／__変革__／__コンプレクシティ__の各モデル群',
          'モデルは現実を単純化した枠組み。==テーラリング==して使う（現実を完全には反映しない）',
        ],
      },
      {
        heading: '6. 状況対応モデル（リーダーシップ・コミュニケーション）',
        items: [
          '__主要モデル__（詳細は各カテゴリ参照）: SL理論・マネジリアル・グリッド（team §8-9）／プッシュ・プル・インタラクティブ（stakeholder §24）／トーマス・キルマン（team §32）',
        ],
      },
      {
        heading: '7. プロセスモデル（PDCA・DMAIC・継続的改善）',
        items: [
          '__使い分け__: ==PDCA==（既存プロセスの改善）／==DMAIC==（データ駆動改善）／==DMADV==（新規設計）／==OODA==（高変動環境での即応）',
        ],
      },
      {
        heading: '8. 変革モデル（ADKAR・コッターの8段階）',
        items: [
          '==ADKAR==（個人の変革の5段階）: ==Awareness==（認識）→ ==Desire==（意欲）→ ==Knowledge==（方法）→ ==Ability==（実行能力）→ ==Reinforcement==（定着）',
          '==コッターの8段階==（組織変革）: ==危機感の醸成==から始まり、推進連合→ビジョン→伝達→エンパワーメント→==短期的成果==→活用→==文化への定着==',
          '大規模システム導入・新業務プロセス導入での抵抗対策に活用する',
        ],
        navyItems: [[{ text: 'ADKAR=個人の変革（5段階）／コッター=組織の変革（8段階）の対比がひっかけ', style: 'navy' }]],
      },
      {
        heading: '9. コンプレクシティモデル（Cynefin・Stacey）',
        items: [
          '==Cynefin フレームワーク==: 状況を==単純==（ベストプラクティス）／==困難==（専門家の分析）／==複雑==（実験・創発）／==混沌==（まず行動）＋無秩序に分類',
          '==Stacey マトリクス==: ==要求×技術の不確実性==の2軸。==複雑==領域が==アジャイル適用==の理論的根拠',
          '示唆: 単純・困難→予測型／複雑→適応型／混沌→危機管理対応',
        ],
        navyItems: [[{ text: 'Cynefin／Stacey はアジャイル適用判断の理論的根拠', style: 'navy' }]],
      },
      // ── C. PMBOK第7版 主要手法 ──
      {
        heading: '10. PMBOK第7版 主要手法の概観',
        items: [
          'PMBOK第7版は主要手法をカテゴリ別に整理（データ収集・分析／見積もり／会議・対人／==曖昧さ管理==）。必要な手法だけを選択して使う',
        ],
      },
      {
        heading: '11. データ収集・分析手法',
        items: [
          '__主要手法__: ブレーンストーミング／インタビュー／==SWOT分析==／根本原因分析（5 Why・特性要因図）／代替案分析／感度分析。詳細は各カテゴリ参照',
        ],
      },
      {
        heading: '12. 見積もり手法',
        items: [
          '4大手法（類推／パラメトリック／ボトムアップ／3点）は planning §15 参照',
          '__派生手法__: ==プランニング・ポーカー==（相対見積もり）／==ワイドバンド・デルファイ==（専門家の独立見積もりを収束）／==ファンクションポイント法==（機能規模測定）',
        ],
      },
      {
        heading: '13. 会議・対人手法',
        items: [
          '__主要会議体__: キックオフ／デイリースタンドアップ／ステアリングコミッティ／==レトロスペクティブ==（振り返り・改善）',
          '__対人手法__: ==ファシリテーション==／アクティブ・リスニング／コーチング・メンタリング／交渉',
        ],
      },
      {
        heading: '14. 曖昧さ管理手法',
        items: [
          '__主要手法__: ==プロトタイピング==（早期検証）／==実験==（仮説検証）／==スパイク==（技術検証）／==MVP==（最小実用製品）／段階的詳細化',
          '短い反復で学習し==早期失敗==（Fail Fast）を促す。予測型でもパイロットとして活用可能',
        ],
        navyItems: [[{ text: 'PMBOK第7版で「曖昧さ管理」が体系化。VUCA 時代の必須スキル', style: 'navy' }]],
      },
      // ── D. PMBOK第7版 主要成果物 ──
      {
        heading: '15. PMBOK第7版 主要成果物の概観',
        items: [
          '成果物を戦略文書／計画書／報告書／監査・終結文書に分類。必要な成果物だけ選択して==過剰な文書化を回避==する',
        ],
      },
      {
        heading: '16. 戦略文書（憲章・ビジネスケース）',
        items: [
          '==ビジネスケース==（投資の正当化）と==プロジェクト憲章==が代表。詳細は integration §4-6',
        ],
      },
      {
        heading: '17. 計画書・管理計画書',
        items: [
          'PM計画書 = 3ベースライン＋10サブシディアリー計画書＋補助計画書。詳細は planning §2・integration §7',
        ],
      },
      {
        heading: '18. 報告書・監査・終結文書',
        items: [
          '報告書4種（project-work §18）／教訓登録簿（project-work §21）／最終報告書。結果は==OPAs へフィードバック==',
        ],
      },
      // ── E. テーラリングの実践 ──
      {
        heading: '19. テーラリング判断ワークシート',
        items: [
          '==テーラリング判断ワークシート==: 判断要素（規模・複雑性・不確実性・経験・規制）を低中高で評価し==推奨アプローチ==を導出するツール',
          '使用タイミング: プロジェクト開始時・フェーズゲート・重大変更時',
        ],
      },
      {
        heading: '20. アジャイル vs ウォーターフォール テーラリング',
        items: [
          '__判断のヒント__: ==規制厳格==→予測型寄り／==顧客フィードバック要・スコープ不確実==→適応型寄り／チーム経験少→予測型から==段階移行==',
          '実態として==ハイブリッドが最多==（パターンは development-approach §27 参照）',
          '__成功要因__: 組織変革管理の伴走・経験者（コーチ）の配置・継続的改善の文化',
        ],
        navyItems: [[{ text: 'development-approach §27 ハイブリッド・アプローチも併読推奨', style: 'navy' }]],
      },
      // ── F. IPA PM試験 出題傾向 ──
      {
        heading: '21. 過去問頻出論点（午前Ⅱ）',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '23. 午後Ⅰの定石（テーラリング）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのテーラリング系設問（R5以降増加）は「なぜその修整をしたか」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 標準は修整して使う__: 組織標準をそのまま強制せず、==案件特性に合わせて修整==する。足りない要素を補い余分を削る（R6問3・R3問2）',
          '__2. 揃える所と任せる所を見極める__: 全部統一でも全部自由でもなく、==共通化する部分==（成果物管理・報告）と==チーム裁量の部分==を分ける（R6問2）',
          '__3. 混ぜて使うのが実務__: 予測型標準に==適応型の要素==（反復・頻繁な確認）を織り込むハイブリッドが現実解（R6問3・R5問3）',
          '__4. 手段と目的を切り分ける__: 標準・手法は目的でなく手段。==目的に照らして==採否を判断する（H27問2）',
          '__5. 重要度に応じてメリハリ__: 全てに同じ厳格さを求めず、==重要度の高い所に管理を厚く==する（パレート的発想）（H25問4）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・テーラリング】PMBOK第7版で==12原則==の1つに格上げ。判断要素（規模・複雑性・不確実性・チーム経験・規制）を暗記。',
      '【Cynefin】==単純==（ベストプラクティス）・==困難==（専門家）・==複雑==（実験）・==混沌==（まず行動）。アジャイル適用は複雑領域。',
      '【変革モデル】==ADKAR==（個人の5段階）／==コッター==（組織の8段階）の対比。',
      '【曖昧さ管理】プロトタイピング・実験・==スパイク==・==MVP==（リリース可能な最小実用製品、プロトタイプとの違いに注意）。',
      '【ひっかけ】PDCA（改善）vs DMAIC（データ駆動改善）vs DMADV（新規設計）／Stacey の==複雑==領域がアジャイル適用の根拠。',
    ],
  },

  // ───────────────────────────────────────────
  // 12. サービスマネジメント（F2-P1 投入 / ITIL + ISO/IEC 20000 + IPA法務）
  // ───────────────────────────────────────────
  'service-management': {
    summary:
      'IT サービスの提供・運用・継続的改善を扱う活動領域。ITIL・ISO/IEC 20000・SLA/OLA/UC・インシデント vs 問題管理・システム監査・関連法令が試験頻出。プロジェクト完了後の運用引継ぎで PM が関わる。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. サービスマネジメントの定義とプロジェクトとの関係',
        items: [
          '==サービスマネジメント==: サービスの形態で顧客に==価値==を提供するための組織能力の集合（ITIL）',
          '__プロジェクトとの違い__: プロジェクトは==有期==・成果物指向／サービスマネジメントは==継続的==なサービス提供',
          'PM試験では==運用引継ぎ==（§22）・==SLA==・法務が出題される',
        ],
      },
      {
        heading: '2. ITIL の歴史と位置づけ（v3 → v4）',
        items: [
          '==ITIL==: IT サービスマネジメントの==ベストプラクティス集==（デファクトスタンダード）',
          '==v3==（2007）はサービスライフサイクル5フェーズ、==ITIL 4==（2019）はバリューシステム中心に再構築',
          '情報処理試験は v3 用語が中心（v4 概念も近年出題）',
        ],
      },
      {
        heading: '3. ISO/IEC 20000（JIS Q 20000）概観',
        items: [
          '==ISO/IEC 20000==: IT サービスマネジメントシステム（==SMS==）の国際規格。JIS Q 20000 が日本版',
          '__ITIL との関係__: ITIL は==どう実施==するか（ベストプラクティス）／ISO/IEC 20000 は==何を満たす==べきか（要件・==組織単位で認証==）',
        ],
        navyItems: [[{ text: 'R6 秋期 問18 で ISO/IEC 20000 が出題', style: 'navy' }]],
      },
      // ── B. ITIL v3 ライフサイクル ──
      {
        heading: '4. サービス戦略（Service Strategy）',
        items: [
          '==サービス戦略==: 顧客ニーズと市場機会に基づきサービスを戦略的に計画（ライフサイクルの出発点）',
          '主要成果物: ==サービスポートフォリオ==（パイプライン・カタログ・廃止）',
        ],
      },
      {
        heading: '5. サービス設計（Service Design、SLAを含む）',
        items: [
          '==サービス設計==: 新規・変更サービスの設計。==SLA==（§13-14）はこの段階で策定される',
          '主要プロセス: ==サービスレベル管理==（SLM）／可用性管理／キャパシティ管理／IT サービス継続性管理',
        ],
      },
      {
        heading: '6. サービス移行（Service Transition）',
        items: [
          '==サービス移行==: 新規・変更サービスを==本番環境に移行==。本番影響の最小化と==ロールバック準備==が目的',
          '主要プロセス: 変更管理（§17）／構成管理（§18）／リリース・展開管理（§19）',
          'プロジェクトの==運用引継ぎ==（§22）が本フェーズに該当',
        ],
      },
      {
        heading: '7. サービス運用（Service Operation）',
        items: [
          '==サービス運用==: 日常的なサービス提供・サポート。SLA 達成と安定提供が目的',
          '主要プロセス: イベント管理／インシデント管理・問題管理（§16）／要求実現／アクセス管理',
          '==サービスデスク==は利用者との==単一窓口==（SPOC, Single Point of Contact）',
        ],
      },
      {
        heading: '8. 継続的サービス改善（CSI, Continual Service Improvement）',
        items: [
          '==CSI==: ==PDCA==サイクルでサービス・プロセスを改善。==CSF==（重要成功要因）と KPI で追跡し、ライフサイクル全体に横断的に適用',
        ],
      },
      // ── C. ITIL 4 ──
      {
        heading: '9. サービスバリューシステム（SVS, Service Value System）',
        items: [
          '==SVS==（Service Value System）: ITIL 4 の中核フレームワーク。需要・機会をインプットに==価値を共創==する',
          '構成要素: ガイディング原則（§12）／ガバナンス／==サービスバリューチェーン==（§10）／==プラクティス==（v3 のプロセスに相当・より広い概念）',
        ],
      },
      {
        heading: '10. サービスバリューチェーン（SVC）',
        items: [
          '==SVC==: ITIL 4 の==6つの活動==（計画／改善／エンゲージ／設計と移行／取得・構築／デリバリーとサポート）',
          'v3 のライフサイクルと違い==順序はない==。バリューストリームに応じて活動を組み合わせる',
        ],
      },
      {
        heading: '11. ITIL 4 の 4側面（4 Dimensions）',
        items: [
          '==4側面==: __組織と人々__／__情報と技術__／__パートナーとサプライヤー__／__バリューストリームとプロセス__。PESTLE 的な外部要因が4側面に影響する',
        ],
      },
      {
        heading: '12. ITIL 4 ガイディング原則 7つ',
        items: [
          '__7原則__: ==価値に注力==／==現状から始める==（ゼロから作らない）／フィードバックを得てイテレーティブに／コラボレーションと可視性／包括的に考える／==シンプルさと実用性==／==最適化と自動化==',
          'アジャイル思想・テーラリングの考え方と親和性が高い',
        ],
      },
      // ── D. SLA / OLA / UC ──
      {
        heading: '13. SLA / OLA / UC の階層',
        items: [
          '　==SLA==（Service Level Agreement）: ==顧客==とサービスプロバイダの合意',
          '　==OLA==（Operational Level Agreement）: プロバイダ==内部==の部門間合意',
          '　==UC==（Underpinning Contract）: プロバイダと==外部サプライヤ==の契約',
          '__階層関係__: SLA（顧客向け）を OLA（内部）が支え、それを UC（外部）が支える。外部・内部のレベルが SLA を下回ると顧客への約束を守れない',
          '試験頻出: 3者の違い（==内部か外部か==）と階層関係',
        ],
        navyItems: [[{ text: 'SLA/OLA/UC の階層は午前Ⅱ 頻出。「内部」「外部」の判別が問われる', style: 'navy' }]],
      },
      {
        heading: '14. SLA の主要項目',
        items: [
          '__主要記載項目__: サービス時間／==可用性==／応答時間／サポート体制／バックアップ・復旧（RPO/RTO）／==違反時の対応==（ペナルティ・サービスクレジット）',
          '__可用性計算__: (稼働時間 − 停止時間) ÷ 稼働時間 × 100%',
          '　==99.9%==（スリーナイン）は年==8.76時間==の停止許容／==99.99%==は年==52.6分==',
          '試験頻出: 可用性% から==許容停止時間==を計算する問題',
        ],
        navyItems: [[{ text: '可用性パーセンテージと停止時間の計算は午前Ⅱ 頻出', style: 'navy' }]],
      },
      {
        heading: '15. SLM（Service Level Management）プロセス',
        items: [
          '==SLM==（Service Level Management）: SLA の==策定・監視・報告・改善==を回すプロセス',
          '流れ: 顧客ニーズ収集 → ==SLR==（要件）文書化 → SLA 合意 → OLA/UC と整合 → 監視・定期報告 → 改善',
          'SLA 違反時はサービスクレジット・是正処置・根本原因分析を行う',
        ],
      },
      // ── E. ITIL プロセス詳細 ──
      {
        heading: '16. インシデント管理 vs 問題管理',
        items: [
          '==インシデント管理==: ==迅速なサービス回復==が目的（根本原因は問わない）。サービスデスクが主担当。KPI は ==MTTR==（平均修復時間）',
          '==問題管理==: インシデントの==根本原因==を特定し==再発防止==する。成果物は ==KEDB==（既知エラーDB）。KPI は ==MTBF==（平均故障間隔）',
          '__違い__: インシデントは==症状==への対処（早く回復）／問題は==原因==への対処（再発防止）',
          '試験頻出: ==MTTR==（短いほど良い）vs ==MTBF==（長いほど良い）',
        ],
        navyItems: [[{ text: 'MTTR と MTBF の混同は午前Ⅱ 頻出ひっかけ', style: 'navy' }]],
      },
      {
        heading: '17. 変更管理（IT 視点）',
        items: [
          '==変更管理==（ITIL）: IT サービスの変更を計画的に管理し、サービス影響を最小化・==ロールバック==を準備する',
          '__変更の3類型__: ==標準変更==（事前承認済み・定型的）／==通常変更==（==CAB==の審議が必要）／==緊急変更==（==ECAB==で迅速承認）',
          '流れ: ==RFC==（変更要求）起票 → 影響評価 → CAB 審議 → 実装 → 事後レビュー',
          '__注意__: PMBOK の統合変更管理はプロジェクト内の成果物変更、ITIL は==運用中サービス==の変更（別物）',
        ],
        navyItems: [[{ text: 'ITIL 変更管理 vs PMBOK 統合変更管理（integration §13）の違いは午前Ⅱ 頻出', style: 'navy' }]],
      },
      {
        heading: '18. 構成管理（CMDB）',
        items: [
          '==構成管理==（ITIL）: 構成項目（CI）の情報を==CMDB==（構成管理データベース）で中央管理',
          'CI はハードウェア・ソフトウェア・文書・サービスなど。==CI 間の関係==（依存・包含）も記録するため==影響分析==に使える',
        ],
        navyItems: [[{ text: 'CMDB と PMBOK 構成管理（integration §18）の対応関係', style: 'navy' }]],
      },
      {
        heading: '19. リリース管理・展開管理',
        items: [
          '==リリース管理==: 変更をまとめて本番環境に展開する（計画→ビルド・テスト→デプロイ→検証）',
          '__デプロイ手法__: ==ブルー・グリーン==（2環境を切替）／==カナリア・リリース==（一部ユーザに先行公開）／ローリング・アップデート',
        ],
      },
      {
        heading: '20. キャパシティ管理 / 可用性管理',
        items: [
          '==キャパシティ管理==: コスト効率の高い容量計画（事業／サービス／コンポーネントの3レベル）',
          '==可用性管理==: 合意した可用性の確保。==可用性 = MTBF ÷ (MTBF + MTTR) × 100%==',
          '　==信頼性== = MTBF（故障しにくさ）／==保守性== = MTTR（直しやすさ）',
        ],
        navyItems: [[{ text: '可用性の計算式（MTBF/MTTR）は午前Ⅱ 計算問題で必出', style: 'navy' }]],
      },
      {
        heading: '21. IT サービス継続性管理（ITSCM / IT-BCP）',
        items: [
          '==ITSCM==: 災害・重大障害時のサービス継続。==BCP==（事業継続計画）の IT 部分',
          '　==RPO==（目標復旧時点）: ==データの最大許容損失==（どこまで巻き戻ってよいか）',
          '　==RTO==（目標復旧時間）: ==サービスの最大許容停止時間==',
          '__流れ__: リスク評価・==事業影響度分析==（BIA）→ 継続戦略選定（ホット／ウォーム／コールドサイト）→ 計画 → ==テスト（演習）== → 維持',
          '試験頻出: ==RPO==（データ）vs ==RTO==（時間）の区別',
        ],
        navyItems: [[{ text: 'RPO と RTO の区別は午前Ⅱ 必出。時間軸の捉え方が異なる', style: 'navy' }]],
      },
      // ── F. 運用引継ぎ・監査 ──
      {
        heading: '22. 運用引継ぎ（プロジェクト → 運用）',
        items: [
          '==運用引継ぎ==: プロジェクト完了 → 運用フェーズへの==移行==',
          '__プロジェクトの責任範囲__: 成果物リリース時点まで',
          '__運用の責任範囲__: リリース後の==継続運用==・==保守==',
          '__引継ぎ項目__:',
          '　==成果物==（システム・サービス）',
          '　==運用文書==（運用マニュアル・障害対応手順）',
          '　==構成情報==（CMDB 更新）',
          '　==SLA==・==OLA==の確立',
          '　==運用要員のトレーニング==',
          '　==監視設定==・==アラート設定==',
          '　==バックアップ==・==復旧手順==',
          '__引継ぎ会議__:',
          '　==プロジェクトチーム==・==運用チーム==合同',
          '　==成果物受入==の正式承認',
          '　==懸念事項==・==制約事項==の共有',
          '__注意__:',
          '　==運用要件==は==プロジェクト計画段階==で考慮（運用性・保守性）',
          '　==並行運用期間==（プロジェクト期間 + 運用初期）の設置が一般的',
          '__PMBOK との接点__: integration §21 終結プロセス',
        ],
        navyItems: [[{ text: '運用引継ぎは PMBOK プロジェクト終結と ITIL サービス移行の接点', style: 'navy' }]],
      },
      {
        heading: '23. システム監査の目的と種類',
        items: [
          '==システム監査==: 情報システムの信頼性・安全性・効率性を==独立した立場==で評価する',
          '__種類__: ==内部監査==（組織内の独立部門）／==外部監査==（監査法人等）／法定監査（J-SOX 等）／任意監査',
        ],
      },
      {
        heading: '24. システム監査基準・実施プロセス',
        items: [
          '==システム監査基準==（監査の判断尺度）と==システム管理基準==（監査対象の管理基準）は経済産業省が策定',
          '__監査人の3独立性__: ==精神的==（中立・公正）・==外観的==・==組織的==独立性',
          '__実施プロセス__: 監査計画 → 予備調査 → ==本調査==（証拠の入手・評価）→ ==監査報告==（指摘事項・改善提案）→ フォローアップ',
        ],
      },
      // ── G. 関連法令 ──
      {
        heading: '25. 個人情報保護法・GDPR',
        items: [
          '==個人情報保護法==の主要義務: ==利用目的の通知・公表==／同意の取得／==安全管理措置==／==第三者提供の制限==／本人開示・訂正への対応',
          '==要配慮個人情報==（人種・信条・病歴等）は取得に原則同意が必要',
          '==GDPR==（EU 一般データ保護規則）: EU 域内の個人データ保護。高額制裁金・==忘れられる権利==が特徴',
        ],
      },
      {
        heading: '26. サイバーセキュリティ基本法・不正アクセス禁止法',
        items: [
          '==サイバーセキュリティ基本法==: 国・地方公共団体・==重要社会基盤事業者==（重要インフラ14分野）の責務を規定',
          '==不正アクセス禁止法==: ==識別符号==（ID・パスワード）の不正使用のほか==不正取得・保管・助長==も禁止',
        ],
        navyItems: [[{ text: 'サイバーセキュリティ基本法は重要インフラ事業者の責務が問われる', style: 'navy' }]],
      },
      {
        heading: '27. 著作権法・不正競争防止法（営業秘密）',
        items: [
          '==著作権法==: ==プログラムの著作物==が保護対象。==職務著作==は法人に帰属（project-work §23）。保護期間は著作者の==死後70年==',
          '==営業秘密の3要件==（不正競争防止法）: ==秘密管理性==・==有用性==・==非公知性==',
          'プロジェクトでは退職者の持出防止・委託先への NDA・OSS ライセンス遵守に注意',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '28. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__ITIL v3 ライフサイクル__: 5フェーズ（戦略・設計・移行・運用・CSI）',
          '__SLA / OLA / UC__: 階層関係と対象（顧客／内部部門／外部サプライヤ）',
          '__可用性%__: 99.9% / 99.99% から==許容停止時間==の計算',
          '__インシデント vs 問題__: ==サービス回復==（早く）vs ==根本原因==（再発防止）',
          '__MTTR vs MTBF__: 短い vs 長いが良い指標',
          '__変更管理__: 標準/通常/緊急変更・CAB の役割',
          '__CMDB__: 構成項目の中央DB・影響分析・コンプライアンス',
          '__RPO vs RTO__: データ巻き戻し許容 vs サービス停止許容',
          '__ISO/IEC 20000__: SMS 要件規格（R6秋期 問18 出題）',
          '__個人情報保護法__: 取扱事業者の義務・要配慮個人情報',
          '__サイバーセキュリティ基本法__: 重要インフラ事業者の責務',
          '__不正アクセス禁止法__: アクセス制御の不正回避',
          '__システム監査__: 3独立性・4段階プロセス',
        ],
      },
      {
        heading: '29. ひっかけパターン',
        items: [
          '__SLA vs OLA vs UC__: 対象の違い（顧客／内部／外部）',
          '__インシデント vs 問題__: 早期回復 vs 根本原因解決',
          '__MTTR vs MTBF__: ==MTTR==（修復時間、==短いほど良い==）vs ==MTBF==（故障間隔、==長いほど良い==）',
          '__可用性%計算__: 99.9% = 月43.2分、99.99% = 月4.32分の停止許容',
          '__標準変更 vs 通常変更__: 事前承認済み（標準）vs CAB審議（通常）',
          '__RPO vs RTO__: データ巻き戻し時間 vs サービス停止時間',
          '__変更管理__: ITIL（運用変更）vs PMBOK 4.6（プロジェクト変更）',
          '__構成管理__: CMDB（運用）vs PMBOK 4.6（プロジェクト）',
          '__ITIL v3 vs v4__: v3=ライフサイクル、v4=バリューチェーン',
          '__個人情報__: 取扱事業者の取扱件数による義務軽減は==撤廃==済み',
          '__著作権__: プログラムは==職務著作==で法人帰属',
          '__営業秘密3要件__: 秘密管理性・有用性・非公知性',
          '__プロジェクトとサービス__: ==有期== vs ==継続==',
        ],
        navyItems: [[{ text: '本ノートは ITIL v3/v4 + ISO/IEC 20000 + 関連法令を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '30. 午後Ⅰの定石（移行・運用引継ぎ）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの移行系設問は「本番切替の安全策」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 移行はリハーサルで品質を作り込む__: ==移行リハーサル==で手順・時間・体制を本番前に検証し、問題を事前に潰す（R1問1）',
          '__2. 利用者の訓練で移行を定着させる__: システムを切り替えても使えなければ移行は失敗。==利用者の訓練・習熟==を移行計画に含める（R1問1・H25問3）',
          '__3. 環境は分離して干渉を避ける__: 移行作業・検証は==本番と分離した環境==で行い、既存業務への影響を避ける（R1問1）',
          '__4. データ移行は品質が要__: ==源泉データの品質==（重複・欠損）を移行前に整理・検証する。移行範囲の最小化も有効（H28問1・H25問2・H30問1）',
          '__5. 並行運用と切り戻しが安全網__: 新旧を==並行運用==して確認し、問題時の==切り戻し（ロールバック）==手順を準備してから切り替える（H26問3・H27問3）',
          '__6. 移行テストの限界を知る__: テスト環境のデータは==本番データの代表性==に限界がある。本番相当データでの検証を検討（H26問3）',
          '__7. 段階的導入と先行準備__: 一斉切替のリスクが高い場合は==拠点・機能単位で段階導入==し、先行準備で立ち上げを軽くする（R2問3）',
          '__8. 運用を見据えた技術移転__: 引継ぎは文書だけでなく、運用要員の==プロジェクト参加・訓練==で内製運用できる状態を作る（R2問1）',
          '__9. SLAと費用はトレードオフ__: 高可用性の要求はコストに直結。==業務影響に見合ったサービスレベル==を設定する（H30問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==SLA==（顧客）／==OLA==（内部）／==UC==（外部サプライヤ）の階層と「内部か外部か」の判別。',
      '【可用性計算】==可用性 = MTBF ÷ (MTBF + MTTR)==。99.9% は年8.76時間の停止許容。',
      '【インシデント vs 問題】==サービス回復==（早期・MTTR）vs ==根本原因解決==（再発防止・MTBF/KEDB）。',
      '【RPO vs RTO】RPO は==データ==の最大許容損失（巻き戻し）／RTO は==サービス==の最大許容停止時間。',
      '【変更管理】標準／通常（==CAB==審議）／緊急の3類型。ITIL 変更管理と PMBOK 統合変更管理は==別物==。',
      '【法令】個人情報保護法（利用目的・同意・安全管理）／==職務著作==は法人帰属／==営業秘密3要件==（秘密管理性・有用性・非公知性）。',
    ],
  },
}

// ─────────────────────────────────────────────
// PMBOK 第8版 統合補足（2026-05-28 追加 / detailed_design.md §2.7e.2 F2-P6 v0.22）
//
// 経緯:
// - 当初設計（〜v0.21）では独立カテゴリ `pmbok8-diff` を新設予定だった
// - 実データ分析（午前II 300問・午後I 37問・午後II 24問）で第8版固有用語は ≒ 0%
// - PMBOK 第8版は 2026-04 日本語版リリース、PMP 試験反映は 2026-07-09
// - IPA 試験要綱は 2022-05 第7版反映のまま、第8版反映の出題は早くても 2027-2028 春期
// - 「闇雲に量を増やす」リスクを避けるため、各カテゴリ末尾に注記セクションのみ追加
//
// 第8版の概要:
// - 6 原則（第7版の 12 原則を統合）: 全体的視点 / 価値焦点 / 品質組込 / 責任あるリーダー /
//   持続可能性 / 自律的文化
// - 7 パフォーマンス領域（第7版の 8 領域を統合・改名）: ガバナンス / ステークホルダー /
//   スコープ（品質含む）/ 資源 / スケジュール / リスク / ファイナンス
// - 第6版の知識エリア体系（スコープ・スケジュール・リスク等）に回帰する統合
//
// 詳細マッピング: docs/pmbok_v7_to_v8_mapping.md
// ─────────────────────────────────────────────
const PMBOK_V8_APPENDIX: Record<string, NoteSection> = {
  stakeholder: {
    heading: '37. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==ステークホルダー==」は引き続き独立した__パフォーマンス領域__として継続（7 領域のひとつ）',
      '新原則「==責任あるリーダーであること==（Be an Accountable Leader）」が追加され、ステークホルダーへの__説明責任__・__信頼関係構築__の観点が原則として明文化',
      '第7版 12 原則の「ステークホルダーと効果的に関与する」「リーダーシップを示す」などが第8版で 6 原則に統合',
      'IPA 試験への影響: 試験要綱は 2022-05 第7版反映のまま、第8版要素の出題は 2027-2028 以降の見込み。本ノートの第6版＋第7版内容を優先して学習',
    ],
    navyItems: [[{ text: '第8版は第7版の原則を 12→6 に統合、領域を 8→7 に統合。試験対策の優先度は第6版・第7版より低い。', style: 'navy' }]],
  },
  team: {
    heading: '39. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版では第7版の「==チーム==」パフォーマンス領域が「==資源==」領域に統合・改名（人的資源・物的資源を包括的に扱う）',
      '新原則「==自律的な文化を築くこと==（Build an Empowered Culture）」が明文化され、チームの__エンパワーメント__・__心理的安全性__・__自律性__が原則レベルに格上げ',
      '第7版の「リーダーシップを示す」「チームの協働環境を作る」などの原則は第8版で 6 原則に統合され、責任あるリーダーシップ + 自律的文化の 2 軸で整理',
      'IPA 試験への影響: 「資源マネジメント」（第6版）と「チーム」（第7版）の用語両方を引き続き学習。第8版の「資源」回帰は第6版と用語が一致し、混乱は少ない',
    ],
    navyItems: [[{ text: '第8版の「資源」領域は第6版の「資源マネジメント」知識エリアに用語回帰。サーバントリーダーシップ・テックマンモデル・RACI 等の試験頻出概念は版変更の影響を受けない。', style: 'navy' }]],
  },
  'development-approach': {
    heading: '34. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域には「==開発アプローチとライフサイクル==」領域が単独で存在せず、__テーラリング__の文脈と原則「==価値に焦点を当てること==」「==全体的な視点を持つこと==」に分散統合',
      '予測型・反復型・適応型・ハイブリッドの選択は__プロジェクト特性に応じたテーラリング決定事項__として扱われ、第7版の領域から第8版の原則レベルへ概念的に格上げ',
      'アジャイル・スクラム・カンバン等の個別手法は引き続き「適応型」の選択肢として記述されており、用語自体に変更なし',
      'IPA 試験への影響: 開発アプローチの選択基準（プロジェクト特性 → 進め方）は第7版から第8版で枠組みが変わるが、出題される__判断基準__自体は普遍。第6版＋第7版の知識でカバー可能',
    ],
    navyItems: [[{ text: '第8版で開発アプローチが領域から外れたのは「全プロジェクトに適用される横断的視点」として原則・テーラリングに昇格したため。試験対策上は影響なし。', style: 'navy' }]],
  },
  planning: {
    heading: '35. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==計画==」パフォーマンス領域は「==スコープ==」「==スケジュール==」「==ファイナンス==」の 3 領域に分割・細分化（__第6版の知識エリア体系に回帰__）',
      '第6版の「==スコープマネジメント==」「==スケジュールマネジメント==」「==コストマネジメント==」知識エリアと第8版の領域名がほぼ一致',
      '計画立案・段階的詳細化・ローリングウェーブ計画法などの基本概念は版を超えて維持。==計画書==＋==ベースライン==の二段構成も継続',
      'IPA 試験への影響: 第6版の用語（スコープ・WBS・スケジュール・ベースライン）が第8版でも領域名として復活するため、本ノートの第6版要素は版を超えて有効',
    ],
    navyItems: [[{ text: '第8版は第6版の知識エリア体系に回帰する統合。計画関連の用語は第6版 → 第8版で命名が一致し、第7版「計画」領域がむしろ過渡的な命名だったと言える。', style: 'navy' }]],
  },
  'project-work': {
    heading: '29. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==プロジェクト作業==」領域は存在せず、調達・コミュニケーション・物理リソース等は__他領域に分散__（資源／ガバナンス／ステークホルダー等）',
      '第7版の「プロジェクト作業」の概念は第8版で領域横断的な__実行・運営要素__として再整理され、原則「全体的な視点」「価値焦点」と組み合わせて理解する位置づけに',
      '調達マネジメント・コミュニケーションマネジメント等の第6版知識エリアは第8版でも各領域内のサブ概念として保持',
      'IPA 試験への影響: 第6版の「プロジェクト作業」「調達」「コミュニケーション」用語は引き続き出題対象。第7版・第8版の領域構造より__第6版のプロセス分解__を主軸に学習が効率的',
    ],
    navyItems: [[{ text: 'プロジェクト作業は版ごとに位置づけが変わる代表的な概念。試験対策上は「何を扱うか」（調達・コミュニケーション・物理資源）を押さえれば、どの版でも対応可能。', style: 'navy' }]],
  },
  delivery: {
    heading: '31. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==デリバリー==」領域は存在せず、デリバリー概念は原則「==価値に焦点を当てること==」「==品質をプロセスと成果物に組み込むこと==」に統合',
      '「品質」は第7版の独立領域から第8版で「==スコープ==」領域に内包（スコープと品質の不可分性を強調）',
      '価値駆動の考え方（ベネフィット重視・継続的デリバリー）は第7版から第8版でさらに原則として強化',
      'IPA 試験への影響: 第6版の「品質マネジメント」知識エリアは引き続き重要。第7版のデリバリー領域・第8版の価値原則・品質統合の流れを並列で押さえる',
    ],
    navyItems: [[{ text: '第8版で「品質はスコープに内包」されたのは「品質基準を満たさなければスコープを完了したとは言えない」という思想の明文化。試験では第6版「品質マネジメント」用語で出題されることが多い。', style: 'navy' }]],
  },
  measurement: {
    heading: '26. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==測定==」パフォーマンス領域は「==ファイナンス==」領域に統合・改名（コスト測定・EVM・ベネフィット測定を一体的に扱う）',
      'EVM（==アーンドバリュー・マネジメント==）、KPI、リードタイム等の測定手法は版を超えて維持。__メトリクス選択__・__ダッシュボード設計__の重要性も継続',
      '新原則「価値に焦点を当てること」と組み合わせ、測定対象は__成果物の量__から__価値・ベネフィットの実現__へシフト',
      'IPA 試験への影響: 第6版の「コストマネジメント」「EVM」「品質指標」は引き続き頻出。第8版「ファイナンス」領域の枠組みは試験未反映のため、第6版＋第7版用語で対応',
    ],
    navyItems: [[{ text: 'EVM の SPI/CPI/SV/CV など計算問題は第6版以来一貫して出題される。第8版で「ファイナンス」領域に統合されても、計算式や解釈は不変。', style: 'navy' }]],
  },
  uncertainty: {
    heading: '29. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==不確かさ==（Uncertainty）」パフォーマンス領域は「==リスク==」領域に名称変更・統合（__第6版の「リスクマネジメント」知識エリアに用語回帰__）',
      '「不確かさ」概念は第7版で導入された比較的新しい用語で、第8版では従来の「リスク」に統合（混乱の解消）',
      '機会（Opportunity）と脅威（Threat）の両面を扱うリスクマネジメントの枠組みは第6版から第8版まで一貫',
      'IPA 試験への影響: 第6版「リスクマネジメント」用語と第7版「不確かさ」用語の両方が混在出題される可能性。本ノートでは両方を統合的に記述、第8版の用語回帰は学習者にとってむしろ自然',
    ],
    navyItems: [[{ text: '第7版で「不確かさ」と命名した後、第8版で「リスク」に戻したのは試験対策的に追い風（用語が安定）。第6版の 7 つのリスクマネジメントプロセスは引き続き押さえるべき。', style: 'navy' }]],
  },
  integration: {
    heading: '26. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==統合==」領域は存在せず、統合の概念は原則「==全体的な視点を持つこと==（Adopt a Holistic View）」として__原則レベルに格上げ__',
      '第6版の「==統合マネジメント==」知識エリア（プロジェクト憲章・PM 計画書・変更管理）は第8版で領域構造から原則・横断要素へ整理されたが、__扱う対象は同じ__',
      'プロジェクト憲章・PM 計画書・変更管理委員会（CCB）等の試験頻出概念は版を超えて維持',
      'IPA 試験への影響: 統合マネジメントの試験頻度は高い（特に変更管理）。第6版用語で覚えれば第8版の原則理解にも自然につながる',
    ],
    navyItems: [[{ text: '統合は「全体観」という原則に昇格したが、実務的に扱う対象（憲章・PM 計画書・変更管理）は不変。試験では第6版「統合マネジメント」プロセスとして出題される。', style: 'navy' }]],
  },
  governance: {
    heading: '24. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==ガバナンス==」は引き続き独立した__パフォーマンス領域__として継続（7 領域のひとつ）',
      '新原則「==持続可能性をすべてのプロジェクト領域に統合すること==（Integrate Sustainability）」が追加され、ガバナンスに__長期的視点__・__環境/社会的責任__の観点が明文化',
      '組織標準・PMO・コンプライアンス・ステークホルダー説明責任等の従来要素は版を超えて維持',
      'IPA 試験への影響: ガバナンスは試験では PMO の役割・組織標準・統制プロセスとして出題される。持続可能性原則は IPA シラバスに反映前のため、優先度は低い',
    ],
    navyItems: [[{ text: '持続可能性原則は ESG・SDGs の文脈を反映した第8版の特徴。IPA 試験への反映は当面未定だが、近年の DX・サステナビリティ重視の社会潮流とも整合する。', style: 'navy' }]],
  },
  'tailoring-models': {
    heading: '24. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==テーラリング==」は領域から__横断的なプロセス・原則レベル__に格上げ。原則「全体的な視点」「価値焦点」と連動して全プロジェクト適用が前提に',
      '第7版の「==テーラリング==」モデル（プロセス調整の方法論）は第8版でも維持。プロジェクト特性・組織標準・リスクに応じた__選択・調整__の考え方は不変',
      'PMBOK 各版で「テーラリング」の位置づけは段階的に重要性が増しており、第8版で最も中心的概念に',
      'IPA 試験への影響: テーラリングは R5（2023）午後II で出題された比較的新しい概念。第7版＋第8版で扱う範囲は重なるため、本ノートの記述は版を問わず有効',
    ],
    navyItems: [[{ text: 'テーラリング R5 出題以降、IPA 試験で本概念の重要性が増している。第8版で「全体観」「価値」原則と連動する位置づけが明確化したため、学習する意義は高い。', style: 'navy' }]],
  },
  'service-management': {
    heading: '31. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==サービスマネジメント==」は PMBOK の領域構造に直接の対応はないが、新原則「==持続可能性==」「==価値焦点==」と「==ファイナンス==」領域がサービス運用の長期視点と整合',
      'ITIL v4 / ISO/IEC 20000 等のサービスマネジメント標準は PMBOK と独立して進化しており、第8版発刊の影響は受けない',
      'インシデント管理・問題管理・変更管理・SLA 等の試験頻出概念は ITIL 系標準のものを引き続き学習',
      'IPA 試験への影響: サービスマネジメント関連の出題は ITIL v4 + ISO/IEC 20000 ベースが中心。PMBOK 版次変更の影響はほぼなし',
    ],
    navyItems: [[{ text: 'PMBOK 第8版の「持続可能性」原則と ITIL v4 の「継続的改善（CSI）」は思想的に親和性が高い。試験対策上は ITIL / ISO 系の用語を主軸に。', style: 'navy' }]],
  },
}

// PMBOK_V8_APPENDIX を各カテゴリの sections に追記する（モジュールロード時）
// この方法により、NOTE_SECTION_INDEX / 検索 / 表示すべてに自動反映される
for (const categoryId of Object.keys(PMBOK_V8_APPENDIX)) {
  const note = NOTE_DB[categoryId]
  const section = PMBOK_V8_APPENDIX[categoryId]
  if (note && section) {
    note.sections.push(section)
  }
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
