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
          '__成果1__: ==共有されたオーナーシップ==（チーム全員が結果責任を共有）',
          '__成果2__: ==ハイパフォーマンスチーム==の形成',
          '__成果3__: ==リーダーシップとソフトスキル==が全員に発揮されている',
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
          '__1,1 無関心型__（Impoverished）: 両方低い。最低限の労力',
          '__9,1 仕事中心型__（Authority-Compliance）: 業績重視・人間軽視',
          '__1,9 人間中心型__（Country Club）: 人間関係重視・業績軽視',
          '__5,5 中道型__（Middle-of-the-Road）: 両方そこそこ',
          '__9,9 チームマネジメント型__（Team Management）: 両方高い。==理想型==',
          '試験ではグリッド座標（例: 9,1）から該当スタイルを答えさせる設問が頻出',
        ],
        navyItems: [[{ text: '英語名は Managerial Grid。Blake & Mouton 1964年提唱', style: 'navy' }]],
      },
      {
        heading: '9. 状況対応リーダーシップ理論（SL理論：Hersey & Blanchard）',
        items: [
          'メンバーの==成熟度==（Readiness）に応じてリーダーシップ・スタイルを切り替えるべきという理論',
          '4つのスタイル:',
          '__S1 指示型__（Telling）: 高指示・低支援。未熟なメンバー向け',
          '__S2 説得型__（Selling／Coaching）: 高指示・高支援。意欲はあるが能力不足',
          '__S3 参加型__（Participating／Supporting）: 低指示・高支援。能力はあるが意欲不足',
          '__S4 委任型__（Delegating）: 低指示・低支援。能力・意欲とも高い',
          '成熟度はM1（低）→M4（高）の4段階で評価し、対応するスタイルS1〜S4を選択',
          '==成熟度に応じた柔軟な切替==が本理論の核心',
        ],
        navyItems: [[{ text: 'SL理論=Situational Leadership。Hersey & Blanchard 1969年提唱。試験頻出', style: 'navy' }]],
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
          '__障害物の除去__（Impediment Removal）: メンバーの作業を阻む要因を取り除く',
          '__傾聴__（Active Listening）: メンバーの声を聞く',
          '__エンパワーメント__（Empowerment）: メンバーに権限と責任を委譲',
          '__成長支援__（Growth Support）: スキル習得・キャリア発展を支援',
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
          '__生理的欲求__（Physiological）: 食欲・睡眠など生存に直結',
          '__安全欲求__（Safety）: 身体的・経済的安全',
          '__社会的欲求__（Belongingness）: 所属感・愛情',
          '__承認欲求__（Esteem）: 尊敬・自尊心',
          '__自己実現欲求__（Self-actualization）: 自分らしさの発揮',
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
          '==期待==: 努力すれば成果が出るという見込み',
          '==手段性==: 成果が報酬につながるという見込み',
          '==誘意性==: 報酬が魅力的かどうかの主観的価値',
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
          '__1. 形成期__（Forming）: メンバーが集まり==互いを探り合う==段階。礼儀正しいが==生産性は低い==',
          '__2. 混乱期__（Storming）: 役割・価値観・進め方で==コンフリクト==が発生する段階。==最も困難==な時期',
          '__3. 規範期__（Norming）: 規範・グランドルールが==確立==し協力が始まる',
          '__4. 遂行期__（Performing）: ==ハイパフォーマンス==で自律的に成果を出す段階',
          '__5. 解散期__（Adjourning）: プロジェクト終結とともにチームが==解散==、振り返りと祝福',
          '__順序は固定__。スキップ不可。混乱期で適切な対処をしないとチームは機能しない',
          'リーダーは段階に応じて関与レベルを変える（形成期は指示型→遂行期は委任型）',
        ],
        navyItems: [[{ text: '出典: Bruce Tuckman 1965年 / PMBOK第6版 §9.4.2.3 チーム開発技法', style: 'navy' }]],
      },
      {
        heading: '19. ハイパフォーマンスチームの特性（PMBOK7）',
        items: [
          'PMBOK第7版はハイパフォーマンスチームの特性を9点挙げる',
          '==オープン・コミュニケーション==: 心理的安全性のもと自由に発言できる',
          '==共有された理解==: 目的・役割・進捗が全員にクリア',
          '==共有された当事者意識==: 全員が結果に責任を持つ',
          '==信頼==: メンバー間・リーダーとメンバー間の信頼',
          '==コラボレーション==: 競争でなく協力',
          '==適応性==: 変化への柔軟な対応',
          '==レジリエンス==: 困難からの回復力',
          '==エンパワーメント==: メンバーへの権限委譲',
          '==認知==（Recognition）: 貢献への適切な評価',
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
          '==非同期コミュニケーション==の活用（メール／チャット／文書）',
          '==同期コミュニケーション==の確保（定期ビデオ会議／集合イベント）',
          '==コラボレーション・ツール==の標準化（Slack／Teams／Jira／Confluence 等）',
          '==文化的多様性==への配慮（タイムゾーン・言語・祝祭日）',
          '==キックオフ対面==で信頼関係の基盤を築く',
          'COVID-19 以降は==ハイブリッドワーク==が一般化',
        ],
      },
      {
        heading: '23. PMBOK第6版「チームの育成」プロセス（9.4）',
        items: [
          '==9.4 チームの育成==（Develop Team）: ==実行プロセス群==に属し、メンバーの==コンピテンシー==と==相互交流==を高めチーム環境を改善する',
          '__主要インプット__: ==資源マネジメント計画書==／==チーム憲章==／==プロジェクト・チームの任命==／==スケジュール==／==プロジェクト・カレンダー==',
          '__主要ツール&技法__:',
          '__コロケーション__（Co-location）: 物理的に==同じ場所==に集める',
          '__バーチャル・チーム__: 分散環境の構築',
          '__コミュニケーション技術__',
          '__対人スキル__（傾聴・コーチング・対立解決）',
          '__表彰と報奨__: 望ましい行動を認知し強化',
          '__トレーニング__: スキルギャップ解消',
          '__個人とチームのアセスメント__（=性格診断・360度評価）',
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
          '__1. 資源マネジメント計画書__: 資源獲得・役割と責任・組織図・育成・チーム憲章策定方針',
          '__2. チーム憲章__: チームの価値観・運営ルール（§20参照）',
          '__3. プロジェクト文書の更新__',
          '__資源マネジメント計画書の構成__:',
          '==資源の特定==／==獲得==／==役割と責任==／==組織図==／==育成計画==／==チーム管理==／==認知と報奨==／==コンプライアンス==',
          '試験頻出: 計画書とチーム憲章は==別アウトプット==で混同しないこと',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.1', style: 'navy' }]],
      },
      {
        heading: '28. PMBOK第6版「活動資源見積もり／資源獲得／資源コントロール」',
        items: [
          '__9.2 活動資源の見積もり__（Estimate Activity Resources, 計画）: 各==アクティビティ==に必要な==チーム資源==と==資材・設備・サプライ==の種類と数量を==見積もる==',
          '主要技法: ==ボトムアップ見積もり==／==類推見積もり==／==パラメトリック見積もり==／==代替案分析==',
          'アウトプット: ==資源要求事項==／==見積もりの根拠==／==資源ブレークダウン・ストラクチャー==（RBS）',
          '__9.3 資源の獲得__（Acquire Resources, 実行）: ==計画書通り==にチームメンバー・施設・設備等を==獲得==',
          '主要技法: ==事前割当==／==交渉==／==獲得==（外部から採用）／==バーチャルチーム==',
          'アウトプット: ==物的資源の割当==／==プロジェクトチームの任命==／==資源カレンダー==',
          '__9.6 資源のコントロール__（Control Resources, 監視・コントロール）: ==物的資源==が==計画通り==に利用されているか監視し是正',
          '主要技法: ==データ分析==（=コストパフォーマンス分析・トレンド分析）／==問題解決==',
          'アウトプット: ==作業パフォーマンス情報==／==変更要求==',
          '__注意__: 9.6 は==物的資源==のみが対象。==チーム==の監視は==9.5 チームのマネジメント==',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.2 / §9.3 / §9.6', style: 'navy' }]],
      },
      {
        heading: '29. 要員管理計画・要員育成・キャリア開発',
        items: [
          '==要員管理計画==は資源マネジメント計画書の一部',
          '主要要素:',
          '==要員獲得==（Staff Acquisition）: 内部／外部からの調達方針',
          '==スケジュール==（Resource Calendar）: メンバーの参画期間と作業時間',
          '==要員解放計画==（Release Plan）: プロジェクト終結時のメンバー復帰計画',
          '==トレーニング・ニーズ==: スキルギャップと教育計画',
          '==認知と報奨==（Recognition & Rewards）: 望ましい行動の強化',
          '==コンプライアンス==: 法令・規制・組織方針への準拠',
          '==キャリア開発==: メンバーの==成長機会==の提供（プロジェクト経験を==スキル獲得==の場とする）',
          'PMはメンバーの==キャリアパス==を意識した==役割割当==を行うべき',
        ],
      },
      {
        heading: '30. PMO の役割と類型',
        items: [
          '==PMO==（Project Management Office）: プロジェクト管理の==標準化・支援==を行う==組織横断的==な部署',
          'PMBOK第6版 §2.4.4.3 は3類型を定義',
          '__支援型 PMO__（Supportive）: ==テンプレート提供==／==ベストプラクティス共有==／==トレーニング==。==コントロール度==: ==低==',
          '__コントロール型 PMO__（Controlling）: ==フレームワーク強制==／==準拠状況の監査==。==コントロール度==: ==中==',
          '__指揮型 PMO__（Directive）: ==プロジェクトを直接管理==／PM を==PMO に配属==。==コントロール度==: ==高==',
          '__他の機能__:',
          '==リソース管理==（メンバーの組織横断的配置）',
          '==ポートフォリオ管理==（戦略整合性の確保）',
          '==方法論策定==（PMBOK採用／独自テーラリング）',
          '==組織変革管理==',
          '試験頻出: 3類型のコントロール度と提供サービスの対応',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §2.4.4.3 PMO の種類', style: 'navy' }]],
      },
      // ── F. 紛争マネジメント ──
      {
        heading: '31. プロジェクトでの紛争の発生源',
        items: [
          'PMBOK は紛争（コンフリクト）の主要発生源を7つ挙げる',
          '==スケジュール==: 締切・優先順位の認識違い（==最頻発==）',
          '==プロジェクトの優先順位==: 複数案件の優先付け',
          '==要員==（Resources）: 人員配置の不一致',
          '==技術的意見==: 設計・実装方針の対立',
          '==管理上の手続き==: 進め方・承認プロセスの違い',
          '==コスト==: 予算配分',
          '==個性==（Personality）: 個人の性格・価値観の対立（==解決最難==）',
          '紛争は==否定すべきものではなく==、適切に==マネジメント==することで==創造性==を生む',
          '==サプレッシング==（抑圧）は短期的に有効でも長期的には悪化',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.5.2.1 対人スキル「コンフリクト・マネジメント」', style: 'navy' }]],
      },
      {
        heading: '32. トーマス-キルマンの5つの対処モード',
        items: [
          'Thomas-Kilmann コンフリクト・モデル: ==自己主張==（縦軸）×==協調==（横軸）の2軸で5モードを整理',
          '__1. 撤退／回避__（Withdraw／Avoid）: 自己主張==低==・協調==低==。「触れない」。==一時退避==に有効、根本解決にならない',
          '__2. 鎮静／受容__（Smooth／Accommodate）: 自己主張==低==・協調==高==。「相手に合わせる」。==関係維持==重視',
          '__3. 妥協／和解__（Compromise／Reconcile）: 自己主張==中==・協調==中==。「中間を取る」。==双方一部不満==',
          '__4. 強制／指示__（Force／Direct）: 自己主張==高==・協調==低==。「権限で押し通す」。==緊急時==に有効',
          '__5. 協力／問題解決__（Collaborate／Problem Solve）: 自己主張==高==・協調==高==。「Win-Win」。==最も望ましい==解決方法',
          'PMBOK第6版／第7版とも==問題解決==を==推奨==',
          '状況に応じて使い分け、==問題解決==を==デフォルト==に',
        ],
        navyItems: [[{ text: '出典: Thomas & Kilmann 1974年 / PMBOK第6版 §9.5.2.1', style: 'navy' }]],
      },
      {
        heading: '33. PMBOK第6版「チームのマネジメント」プロセス（9.5）',
        items: [
          '==9.5 チームのマネジメント==（Manage Team）: ==実行プロセス群==。チームメンバーの==パフォーマンス==を==追跡==し==フィードバック==／==問題解決==／==変更管理==を行う',
          '__主要インプット__: ==プロジェクトマネジメント計画書==（特に資源マネジメント計画書）／==チーム憲章==／==チーム・パフォーマンス評価==／==問題ログ==／==作業パフォーマンス報告書==',
          '__主要ツール&技法__:',
          '__対人スキル__:',
          '==コンフリクト・マネジメント==（§32 のキルマン5モード）',
          '==意思決定==',
          '==感情的知性==（Emotional Intelligence）',
          '==影響力==（Influencing）',
          '==リーダーシップ==',
          '__プロジェクトマネジメント情報システム__（PMIS）',
          '__主要アウトプット__: ==変更要求==／==プロジェクトマネジメント計画書の更新==／==プロジェクト文書の更新==',
          '注: 9.5 は==チーム==の管理、9.6 は==物的資源==のコントロール（混同しない）',
        ],
        navyItems: [[{ text: '出典: PMBOK第6版 §9.5', style: 'navy' }]],
      },
      {
        heading: '34. 紛争解決の優先順位とエスカレーション',
        items: [
          'PMBOK は紛争解決の==優先順位==を示す',
          '__1.__ 当事者間で解決を試みる（==自律的解決==）',
          '__2.__ 当事者の合意で==第三者==（PM等）に==仲介依頼==',
          '__3.__ PMが==非公式==に==仲介==',
          '__4.__ PMが==公式==に==調停==',
          '__5.__ 機能部門マネージャに==エスカレーション==',
          '__6.__ スポンサー／==経営層==に==エスカレーション==（==最終手段==）',
          '==当事者間解決==が==望ましい==が、解決できない場合は==早期エスカレーション==が長期化を防ぐ',
          '==エスカレーション==の条件は==チーム憲章==に==事前明文化==しておく',
        ],
      },
      {
        heading: '35. 多文化チーム・多様性への配慮',
        items: [
          'グローバル化・リモートワーク普及で==多文化チーム==が一般化',
          '__文化次元__（Hofstede）:',
          '==権力格差==（Power Distance）: 階層・権威への受容度',
          '==個人主義 vs 集団主義==',
          '==男性性 vs 女性性==',
          '==不確実性回避==',
          '==長期志向 vs 短期志向==',
          '==放縦 vs 抑制==',
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
                  {(section.items ?? []).map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
                      <span>{renderText(item, hideRed, maskVersion)}</span>
                    </li>
                  ))}
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
