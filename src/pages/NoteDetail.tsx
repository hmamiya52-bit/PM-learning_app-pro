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
        navyItems: [[{ text: '出典: PMBOK第7版「ステークホルダー・パフォーマンス領域」／IPA PM試験シラバス Ver7.1 §1', style: 'navy' }]],
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
          '__成果1__: ステークホルダーとの==生産的な作業関係==の構築',
          '__成果2__: ステークホルダーが==プロジェクト目的に合意==している状態',
          '__成果3__: 利益を受けるステークホルダーが==支持者==となる',
          '__成果4__: 反対するステークホルダーが==プロジェクトに悪影響を及ぼさない==',
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
        navyItems: [[{ text: 'PM試験 午前II・午後I で登録簿の構成項目・更新タイミングが頻出', style: 'navy' }]],
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
          '__対策1__: __複数視点__で識別する（PM・スポンサー・ベテラン・現場の4視点）',
          '__対策2__: __類似プロジェクトの教訓__を必ず参照する',
          '__対策3__: ==フェーズゲート==で識別の妥当性をレビューする',
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
      },
      {
        heading: '16. サリエンスモデル（Salience Model）',
        items: [
          '__3つの属性__で分析: Power・Legitimacy・Urgency',
          '==Power（権力）==: 自分の意思を相手に実行させる能力',
          '==Legitimacy（合法性／正当性）==: 関与が__社会的に妥当__と認められているか',
          '==Urgency（緊急性）==: 即時の対応を要求する度合い',
          '3属性のうち__いくつ持つか__でステークホルダーを分類（1属性=Latent、2属性=Expectant、3属性=Definitive）',
          '権力だけでなく__正当性・緊急性__を加えた多次元分析が特徴',
        ],
        navyItems: [[{ text: '3属性すべてを持つ Definitive Stakeholder が最優先対応対象', style: 'navy' }]],
      },
      {
        heading: '17. 方向性キューブ（Directions of Influence）',
        items: [
          'ステークホルダーをPMから見た__4方向__で分類',
          '==上方向==（Upward）: 経営層・スポンサー・運営委員会',
          '==下方向==（Downward）: チームメンバ・専門家',
          '==外方向==（Outward）: 外部顧客・サプライヤ・規制当局・エンドユーザ',
          '==横方向==（Sideward）: 他PM・社内同僚・機能部門マネジャー',
          '方向ごとに__コミュニケーション・スタイル__と__説得アプローチ__を変える',
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
      },
      {
        heading: '30. 関与レベルの変化への対応・是正処置',
        items: [
          '関与レベル低下の典型シグナル: __会議欠席__、__レビュー遅延__、__非協力的態度__',
          '__対応1__: __1on1__で個別ヒアリング、懸念の把握',
          '__対応2__: __コミュニケーション頻度・内容__の見直し',
          '__対応3__: __計画への参加__機会を提供（共同設計）',
          '__対応4__: __スポンサー経由__での働きかけ',
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
      },

      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '32. IPA PM試験 過去問頻出論点',
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
        heading: '33. IPA PM試験 ひっかけパターン',
        items: [
          '__Influence vs Impact__: 「影響力」と「影響度」を取り違える誤答選択肢に注意',
          '__Power vs Influence__: 公式権威（Power）と非公式影響力（Influence）の区別',
          '__関与レベルの段階__: 「中立」と「支持」、「抵抗」と「不認識」の境界を問う設問',
          '__登録簿 vs 計画書__: ステークホルダー登録簿（識別アウトプット）と==エンゲージメント計画書==（戦略文書）の混同',
          '__プッシュ／プル／インタラクティブ__: それぞれの適用シーンの誤認',
          '__サリエンスモデルの属性数__: 1属性のみ（Latent）と2属性（Expectant）の分類混同',
          '出典の混同: PMBOK第6版（プロセス群）と==第7版==（パフォーマンス領域）の枠組み違い',
        ],
        navyItems: [[{ text: '本アプリは PMBOK 第7版を一次ソースとする。第6版/第8版差分は別カテゴリ「pmbok8-diff」で管理予定（F2-P6）', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】ステークホルダー登録簿の3区分（識別情報／評価情報／分類）は午前II頻出。記載項目を空で言えるレベルまで暗記。',
      '【マトリクス】Power/Interest Grid の4象限と対応戦略（緊密に管理／満足を保つ／情報提供／監視）を図で覚える。',
      '【関与レベル】5段階（不認識→抵抗→中立→支持→主導）と C/D 表記の意味（現状/望ましい状態）を区別。',
      '【サリエンスモデル】3属性（Power/Legitimacy/Urgency）と所持数による分類（Latent=1, Expectant=2, Definitive=3）。',
      '【ひっかけ】Influence と Impact、Power と Influence、登録簿と計画書、を区別できるよう用語の正確な理解を。',
      '【午後Ⅰ対策】「識別漏れ→終盤の変更要求」「関与レベル低下→懸念ヒアリング」のシナリオパターンを記述で再現できるように。',
      '【PMBOK版差分】本ノートは第7版ベース。第6版のプロセス群分類との違いに注意（試験は両版混在の可能性）。',
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
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
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
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-brand hover:text-brand-dark transition-colors min-w-0"
              >
                <span className="flex-shrink-0">←</span>
                <span className="truncate">{prevCategory.name}</span>
              </Link>
            ) : <div className="flex-1" />}
            {nextCategory ? (
              <Link
                to={`/notes/${nextCategory.id}`}
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
