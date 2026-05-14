import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { getNoteUnderstanding, setNoteUnderstanding, type UnderstandingLevel } from '../lib/storage'
import { addActivityEvent } from '../lib/activityLog'

// NOTE_DB に存在するカテゴリIDの順序リスト（前後ナビ用 / Notes 一覧フィルタ用）
export const NOTE_CATEGORY_IDS = [
  'layer1-3', 'layer4-7', 'firewall', 'wireless', 'routing',
  'vrrp', 'wan', 'load-balancer', 'dhcp', 'dns',
  'mail', 'voip', 'ipsec', 'sdn', 'ssl-tls',
  'security', 'threat', 'ipv6',
  'proxy', 'network-mgmt', 'protocol-review', 'iot',
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
  'layer1-3': {
    summary: '復習ノート「レイヤ1〜3基礎」準拠。イーサネット・L2SW・VLAN・VXLAN・パケットキャプチャ・IPアドレス・STP/RSTP・LA・スタック・MAC・ARP/GARP・マルチキャスト。',
    sections: [
      {
        heading: 'LAN',
        richItems: [
          [
            { text: '有線LANの規格の総称：', style: 'plain' },
            { text: 'イーサネット', style: 'red' },
          ],
          [
            { text: 'イーサネットにおけるデータ送信の単位：', style: 'plain' },
            { text: 'フレーム', style: 'red' },
            { text: '（複数のPCがほぼ同時に複数のPCと通信可能）', style: 'plain' },
          ],
          [
            { text: 'イーサネットフレームの構造（下図）', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'イーサネットフレームの構造',
            rows: [
              {
                cells: [
                  { label: '宛先MAC',  bg: '#dbeafe', isRed: true },
                  { label: '送信元MAC', bg: '#dbeafe', isRed: true },
                  { label: 'タイプ',    bg: '#e0e7ff' },
                  { label: 'データ\n(L3)', bg: '#dcfce7', span: 2 },
                  { label: 'FCS',       bg: '#e2e8f0' },
                ],
              },
            ],
            caption: '青＝L2(MAC) / 紺＝タイプ / 緑＝L3ペイロード / 灰＝トレーラ。赤字はマスク対象。',
          },
        ],
      },
      {
        heading: 'スイッチ（L2SW）',
        richItems: [
          [
            { text: 'シェアードハブ：受信したフレームを', style: 'plain' },
            { text: '全てのポート', style: 'red' },
            { text: 'に転送', style: 'plain' },
          ],
          [
            { text: 'スイッチングハブ：フレームの宛先MACアドレスを見て、', style: 'plain' },
            { text: '該当するホスト', style: 'red' },
            { text: 'が接続されているポートにのみ転送', style: 'plain' },
          ],
          [
            { text: 'フレームが同一', style: 'plain' },
            { text: 'セグメント', style: 'red' },
            { text: '宛てであれば L3SW が ', style: 'plain' },
            { text: 'L2SW', style: 'red' },
            { text: ' として動作することもある（イーサネットヘッダを変更しない）', style: 'plain' },
          ],
          [
            { text: 'スイッチのMACアドレス学習：', style: 'plain' },
            { text: '該当ポート', style: 'red' },
            { text: 'にのみフレームを転送するため、フレームの送信元MACアドレスを見て学習', style: 'plain' },
          ],
          [
            { text: 'ストレートケーブルとクロスケーブル — 1Gbps以上の通信を行う機器は ', style: 'plain' },
            { text: 'Auto MDI/MDI-X', style: 'red' },
            { text: ' 機能が実装', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'VLAN',
        richItems: [
          [
            { text: 'ポートベースVLAN — 上限：2の', style: 'plain' },
            { text: '16', style: 'red' },
            { text: '乗 = ', style: 'plain' },
            { text: '65536', style: 'red' },
            { text: '個（フレームの変化なし）', style: 'plain' },
          ],
          [
            { text: 'ポートVLANが設定されたポート：アクセスポート', style: 'plain' },
          ],
          [
            { text: 'タグVLANが設定されたポート：', style: 'plain' },
            { text: 'トランク', style: 'red' },
            { text: 'ポート', style: 'plain' },
          ],
          [
            { text: 'VLANタグ（802.1Qヘッダ）のサイズ：', style: 'plain' },
            { text: '32', style: 'red' },
            { text: 'ビット（フレーム構造ではMACアドレスとタイプの間に入る）', style: 'plain' },
          ],
          [
            { text: 'VLAN IDは', style: 'plain' },
            { text: '12', style: 'red' },
            { text: 'ビットなので、VLAN最大数は', style: 'plain' },
            { text: '4094', style: 'red' },
            { text: '（両端の0と4095は使用不可）', style: 'plain' },
          ],
          [
            { text: 'VLANはレイヤ', style: 'plain' },
            { text: '2', style: 'red' },
            { text: ' で閉じた技術', style: 'plain' },
          ],
          [
            { text: 'VLANの問題点（複数組織が混ざるNW）⇒「', style: 'plain' },
            { text: '重複', style: 'red' },
            { text: '」と「', style: 'plain' },
            { text: '上限', style: 'red' },
            { text: '」⇒', style: 'plain' },
            { text: 'VXLAN', style: 'red' },
            { text: ' で解決可能', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'VLANタグ付きフレーム（IEEE 802.1Q）',
            rows: [
              {
                cells: [
                  { label: '宛先MAC',  bg: '#dbeafe' },
                  { label: '送信元MAC', bg: '#dbeafe' },
                  { label: 'VLANタグ\n(32bit)', bg: '#fde68a', maskDigits: true },
                  { label: 'タイプ',    bg: '#e0e7ff' },
                  { label: 'データ\n(L3)', bg: '#dcfce7' },
                  { label: 'FCS',       bg: '#e2e8f0' },
                ],
              },
            ],
            caption: 'タグはMACアドレスとタイプの間に挿入。32bit（TPID 16bit + TCI 16bit、うちVLAN ID は12bit）。',
          },
        ],
      },
      {
        heading: 'VXLAN',
        richItems: [
          [
            { text: 'VXLAN', style: 'red' },
            { text: '：レイヤ3（アンダーレイ）上にレイヤ2（オーバーレイ）を作る技術', style: 'plain' },
          ],
          [
            { text: 'VXLANヘッダ中の VNI は ', style: 'plain' },
            { text: '24', style: 'red' },
            { text: ' ビットなので、約1677万個のL2ネットワークを構築可能', style: 'plain' },
          ],
          [
            { text: 'VXLANパケットの構造：IPv4ヘッダ / ', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: 'ヘッダ / ', style: 'plain' },
            { text: 'VXLAN', style: 'red' },
            { text: 'ヘッダ / イーサネットフレーム', style: 'plain' },
          ],
          [
            { text: 'トンネリング全般、ヘッダ追加でフラグメントが起き、NW機器の負荷を増やすので MSS の調整が必要', style: 'plain' },
          ],
          [
            { text: 'L2トンネリングしたらブロードキャストドメインは同一', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'VXLANパケットの構造',
            rows: [
              {
                cells: [
                  { label: '新IPv4ヘッダ', bg: '#fce7f3' },
                  { label: 'UDPヘッダ',     bg: '#fef3c7', isRed: true },
                  { label: 'VXLANヘッダ\n(VNI 24bit)', bg: '#f3e8ff', maskDigits: true },
                  { label: 'イーサネット\nフレーム（オリジナル）', bg: '#dbeafe', span: 2 },
                ],
              },
            ],
            caption: 'L3（アンダーレイ）上にL2（オーバーレイ）を作るカプセル化。VNIは24bit ⇒ 約1677万L2NWを構築可能。',
          },
        ],
      },
      {
        heading: 'パケットキャプチャ',
        richItems: [
          [
            { text: 'スイッチSWは', style: 'plain' },
            { text: '宛先の端末が繋がっているポート', style: 'red' },
            { text: 'にのみフレームを転送する', style: 'plain' },
          ],
          [
            { text: 'スイッチに必要な設定：', style: 'plain' },
            { text: 'ミラーリング', style: 'red' },
            { text: 'の設定', style: 'plain' },
          ],
          [
            { text: 'PCに必要な設定：NICの動作モードを ', style: 'plain' },
            { text: 'プロミスキャス', style: 'red' },
            { text: ' モードに設定（自分宛以外のフレームを受信するため）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IPアドレス',
        richItems: [
          [
            { text: 'IPv4のIPアドレスは ', style: 'plain' },
            { text: '32', style: 'red' },
            { text: ' ビット', style: 'plain' },
          ],
          [
            { text: 'IPv6のIPアドレスは ', style: 'plain' },
            { text: '128', style: 'red' },
            { text: ' ビット', style: 'plain' },
          ],
          [
            { text: 'IPv6の省略ルール：2001:0db8:0000:0000:0000:ff00:0042:8329 → 2001:', style: 'plain' },
            { text: 'db8::ff00:42:', style: 'red' },
            { text: '8329', style: 'plain' },
          ],
          [
            { text: 'fe80で始まるIPv6アドレス：', style: 'plain' },
            { text: 'リンクローカルユニキャストアドレス', style: 'red' },
            { text: '。', style: 'plain' },
            { text: 'ルータ', style: 'red' },
            { text: ' を介さずに直接接続できる相手との通信にだけ使用', style: 'plain' },
          ],
          [
            { text: 'IPv6とIPv4は互換性無し', style: 'plain' },
          ],
          [
            { text: 'ルータの前後で', style: 'plain' },
            { text: 'ネットワーク', style: 'red' },
            { text: 'アドレスの重複は ✖', style: 'plain' },
          ],
          [
            { text: 'IPヘッダとパケット構造（下図）', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'IPヘッダとパケット構造',
            rows: [
              {
                cells: [
                  { label: '送信元IP\nアドレス',  bg: '#dcfce7', isRed: true },
                  { label: '宛先IP\nアドレス',    bg: '#dcfce7', isRed: true },
                  { label: 'プロトコル',          bg: '#bbf7d0' },
                  { label: 'その他',              bg: '#bbf7d0' },
                  { label: 'データ\n(L4)',        bg: '#fef3c7', span: 2 },
                ],
              },
            ],
            caption: '緑＝L3(IP)ヘッダ／黄＝L4ペイロード。赤字（送信元・宛先）はマスク対象。',
          },
        ],
      },
      {
        heading: 'LANの冗長化（STP / RSTP）',
        richItems: [
          [
            { text: '複数のL2SWをループ状に循環構成にすると発生 ⇒ ', style: 'plain' },
            { text: 'ブロードキャストストーム', style: 'red' },
            { text: '（フレームが無限に流れ続け通信不能）', style: 'plain' },
          ],
          [
            { text: 'スイッチングハブは ', style: 'plain' },
            { text: 'ブロードキャスト', style: 'red' },
            { text: ' フレームを無条件で別の全ポートに転送するため発生（ユニキャスト・マルチキャストでは発生', style: 'plain' },
            { text: 'しない', style: 'red' },
            { text: '）', style: 'plain' },
          ],
          [
            { text: 'STP：レイヤ', style: 'plain' },
            { text: '2', style: 'red' },
            { text: '。目的は ', style: 'plain' },
            { text: 'ループの回避', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: '冗長性の確保', style: 'red' },
          ],
          [
            { text: 'STPでループ検出に利用するフレーム：', style: 'plain' },
            { text: 'BPDU', style: 'red' },
            { text: '（Bridge Protocol Data Unit）。', style: 'plain' },
            { text: 'ルート', style: 'red' },
            { text: 'ブリッジが送る。複数経路から ', style: 'plain' },
            { text: 'BPDU', style: 'red' },
            { text: ' を受け取るとループを検知', style: 'plain' },
          ],
          [
            { text: 'STPルートブリッジの決定：ブリッジの ', style: 'plain' },
            { text: '優先度', style: 'red' },
            { text: ' とMACアドレスを用い、MACアドレスが ', style: 'plain' },
            { text: '小さい', style: 'red' },
            { text: ' 方が優先', style: 'plain' },
          ],
          [
            { text: 'STPの4つの状態：ブロッキング、リスニング、ラーニング、', style: 'plain' },
            { text: 'フォワーディング', style: 'red' },
          ],
          [
            { text: 'STPの経路切り替え時間：最大で ', style: 'plain' },
            { text: '50', style: 'red' },
            { text: ' 秒かかる', style: 'plain' },
          ],
          [
            { text: 'STPポートの役割：ルートポート、', style: 'plain' },
            { text: '指定', style: 'red' },
            { text: 'ポート、非指定ポートのいずれか（ルートブリッジである L3SW では全ポートが指定ポート）', style: 'plain' },
          ],
          [
            { text: 'STPより障害復旧を高速化 ⇒ ', style: 'plain' },
            { text: 'RSTP', style: 'red' },
            { text: '（', style: 'plain' },
            { text: 'Rapid', style: 'red' },
            { text: ' STP）', style: 'plain' },
          ],
          [
            { text: '状態遷移の ', style: 'plain' },
            { text: '待ち', style: 'red' },
            { text: ' 時間が無く、', style: 'plain' },
            { text: '代替', style: 'red' },
            { text: ' ポートと ', style: 'plain' },
            { text: 'バックアップ', style: 'red' },
            { text: ' ポートが予め決まっている', style: 'plain' },
          ],
          [
            { text: '【ネスペ対策】STPがあったら絶対NW構成図に ', style: 'plain' },
            { text: '全て', style: 'red' },
            { text: ' のブロックポートを書き込む（見落とすと引っ掛けで失点）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'リンクアグリゲーション（LA）',
        richItems: [
          [
            { text: 'LAの目的：①帯域の拡大、②冗長性の確保', style: 'plain' },
          ],
          [
            { text: '10Gbpsケーブル1本より1Gbpsケーブル4本でLAを組む利点：インタフェースが ', style: 'plain' },
            { text: '安', style: 'red' },
            { text: 'い／', style: 'plain' },
            { text: '冗長化', style: 'red' },
            { text: ' できるため信頼性が高い（一本断でも通信可能）', style: 'plain' },
          ],
          [
            { text: 'STPと比較したLAの利点：①', style: 'plain' },
            { text: '障害時の中断時間が短い', style: 'red' },
            { text: '、②', style: 'plain' },
            { text: '帯域拡大が可能', style: 'red' },
          ],
          [
            { text: 'LAの設定方法：静的設定／LACP（Link Aggregation Control Protocol）による ', style: 'plain' },
            { text: '動的', style: 'red' },
            { text: ' 設定', style: 'plain' },
          ],
          [
            { text: 'LACPの利点：', style: 'plain' },
            { text: '対向の機器', style: 'red' },
            { text: ' が正常か確認できる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'スタック',
        richItems: [
          [
            { text: '2台のスイッチングハブをスタック接続する利点：', style: 'plain' },
            { text: '信頼性', style: 'red' },
            { text: ' 向上、', style: 'plain' },
            { text: 'ポート', style: 'red' },
            { text: ' の増加（さらにLAと組み合わせて ', style: 'plain' },
            { text: '帯域', style: 'red' },
            { text: ' 増加）', style: 'plain' },
          ],
          [
            { text: 'スタック接続したときのIPアドレスとconfigは共通', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'MACアドレス',
        richItems: [
          [
            { text: '複数のNICを一つのMACアドレスで用いる技術 ⇒ ', style: 'plain' },
            { text: 'チーミング', style: 'red' },
          ],
          [
            { text: 'L2SWは同一セグメントの機器間に限り通信可能。異なるセグメントにはフレームを ', style: 'plain' },
            { text: '送れない', style: 'red' },
            { text: '（送る場合は ', style: 'plain' },
            { text: 'ルーティング', style: 'red' },
            { text: '（L3SW等）の処理が必要）', style: 'plain' },
          ],
          [
            { text: 'MACアドレス認証が不十分な理由①：MACアドレスは ', style: 'plain' },
            { text: '盗聴', style: 'red' },
            { text: ' が可能（暗号化したら通信相手が分からなくなるため暗号化できない）', style: 'plain' },
          ],
          [
            { text: 'MACアドレス認証が不十分な理由②：MACアドレスは ', style: 'plain' },
            { text: '書き換え', style: 'red' },
            { text: ' が容易', style: 'plain' },
          ],
          [
            { text: 'MACアドレスは48bit構成。前半 ', style: 'plain' },
            { text: '24', style: 'red' },
            { text: ' bit は ', style: 'plain' },
            { text: 'OUI', style: 'red' },
            { text: ' と呼ばれ、', style: 'plain' },
            { text: '製造者', style: 'red' },
            { text: ' ごとに固有の番号', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'ARP / GARP',
        richItems: [
          [
            { text: 'ARPテーブル：', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: 'MACアドレス', style: 'red' },
            { text: ' の対応を保持', style: 'plain' },
          ],
          [
            { text: 'ARP要求は ', style: 'plain' },
            { text: 'ブロード', style: 'red' },
            { text: 'キャストにより送る', style: 'plain' },
          ],
          [
            { text: 'ARPテーブルを更新するためのパケット：', style: 'plain' },
            { text: 'GARP', style: 'red' },
          ],
          [
            { text: 'GARPはVRRPのマスタルータ切替時、バックアップルータに接続されているSWの ', style: 'plain' },
            { text: 'MACアドレス', style: 'red' },
            { text: 'テーブル書き換えにも利用される（ARPテーブル＝IPに対するMAC は変わらない／MACアドレステーブル＝MACに対するSWのポート）', style: 'plain' },
          ],
          [
            { text: 'ARPは認証機能が無いので、送られたARP応答を無条件に信じる', style: 'plain' },
          ],
          [
            { text: 'ARPを利用したサイバー攻撃：', style: 'plain' },
            { text: 'ARPスプーフィング', style: 'red' },
            { text: '（ARPフレームに偽情報を入れて相手のARPテーブルに嘘を登録させ、通信を妨害／盗聴）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'マルチキャスト',
        richItems: [
          [
            { text: 'PIM：L3装置間のマルチキャストルーティング', style: 'plain' },
          ],
          [
            { text: 'IGMP：L3SW〜端末間の管理', style: 'plain' },
          ],
          [
            { text: 'SSM：L3で送信元を特定する', style: 'plain' },
          ],
          [
            { text: '224.0.0.', style: 'plain' },
            { text: '2', style: 'red' },
            { text: '：サブネット上の全てのマルチキャスト対応ルータ向け', style: 'plain' },
          ],
          [
            { text: '224.0.0.', style: 'plain' },
            { text: '1', style: 'red' },
            { text: '：サブネット上の全てのマルチキャスト対応ホスト向け', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：データ単位（参考）',
        navyItems: [
          [
            { text: 'L1（物理層）：', style: 'plain' },
            { text: 'ビット', style: 'navy' },
          ],
          [
            { text: 'L2（データリンク層）：', style: 'plain' },
            { text: 'フレーム', style: 'navy' },
          ],
          [
            { text: 'L3（ネットワーク層）：', style: 'plain' },
            { text: 'パケット', style: 'navy' },
          ],
          [
            { text: 'L4（トランスポート層）：', style: 'plain' },
            { text: 'セグメント', style: 'navy' },
            { text: '（TCP）/ ', style: 'plain' },
            { text: 'データグラム', style: 'navy' },
            { text: '（UDP）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：ドメインの分割（参考）',
        navyItems: [
          [
            { text: 'ブロードキャストドメインは ', style: 'plain' },
            { text: 'ルータ（L3）', style: 'navy' },
            { text: ' で分割', style: 'plain' },
          ],
          [
            { text: 'コリジョンドメインは ', style: 'plain' },
            { text: 'SW（L2）', style: 'navy' },
            { text: ' で分割', style: 'plain' },
          ],
          [
            { text: 'MACアドレステーブル未登録 → ', style: 'plain' },
            { text: 'フラッディング', style: 'navy' },
            { text: '（受信ポート以外へ転送）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'STPとRSTPの違い（収束時間）は頻出',
      '802.1Qのタグ構造（==4==バイト：TPID 2B + TCI 2B）',
      '==ループの回避==と==冗長性の確保==がSTPの2大目的',
      'VLAN最大数 ==4094==（12bit、両端0/4095除く）',
      'VXLAN VNI ==24==bit ⇒ 約1677万個のL2NWが構築可能',
      'GARPは==VRRPマスタ切替==／重複検査／ARPキャッシュ更新で多用される',
    ],
  },

  'layer4-7': {
    summary: '復習ノート「レイヤ4,7基礎」準拠。TCPとUDP（L4）／DoS・DDoS攻撃／HTTP・HTTP/2・Cookie・セッション管理を中心に整理。',
    sections: [
      {
        heading: 'TCPとUDP（レイヤ4プロトコル）',
        richItems: [
          [
            { text: 'レイヤ', style: 'plain' },
            { text: '4', style: 'red' },
            { text: '：トランスポート層', style: 'plain' },
          ],
          [
            { text: 'UDPを使うアプリケーション例：', style: 'plain' },
            { text: 'SIP', style: 'red' },
            { text: ', ', style: 'plain' },
            { text: 'ARP', style: 'red' },
            { text: ', ', style: 'plain' },
            { text: 'SNMP', style: 'red' },
            { text: ', ', style: 'plain' },
            { text: 'NTP', style: 'red' },
            { text: ', ', style: 'plain' },
            { text: 'DNS', style: 'red' },
            { text: ', ', style: 'plain' },
            { text: 'DHCP', style: 'red' },
            { text: ' 等', style: 'plain' },
          ],
          [
            { text: 'TCPヘッダとセグメント構造：', style: 'plain' },
            { text: '送信元', style: 'red' },
            { text: 'ポート番号 / ', style: 'plain' },
            { text: '宛先', style: 'red' },
            { text: 'ポート番号 / その他のヘッダ / データ', style: 'plain' },
          ],
          [
            { text: 'TCPヘッダの中で、パケットの順番を管理するための番号 ⇒ ', style: 'plain' },
            { text: 'シーケンス', style: 'red' },
            { text: '番号', style: 'plain' },
          ],
          [
            { text: 'TCPで動作するプロトコル（HTTP, SMTP 等）は事実上IPアドレスの詐称が ', style: 'plain' },
            { text: '不可', style: 'red' },
            { text: '（IPアドレスを偽装すると ', style: 'plain' },
            { text: '3ウェイハンドシェイク', style: 'red' },
            { text: ' が成立しないため）', style: 'plain' },
          ],
          [
            { text: 'IPパケットの最大サイズは ', style: 'plain' },
            { text: 'MTU', style: 'red' },
            { text: '。通常は ', style: 'plain' },
            { text: '1500', style: 'red' },
            { text: ' バイト', style: 'plain' },
          ],
          [
            { text: 'TCP/IPヘッダを除いたデータ部分を ', style: 'plain' },
            { text: 'MSS', style: 'red' },
            { text: '（Maximum Segment Size）。最大サイズは ', style: 'plain' },
            { text: '1460', style: 'red' },
            { text: ' バイト（IPヘッダとTCPヘッダが各 ', style: 'plain' },
            { text: '20', style: 'red' },
            { text: ' バイトのため）', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'TCPヘッダとセグメント構造',
            rows: [
              {
                cells: [
                  { label: '送信元\nポート番号', bg: '#fef3c7', isRed: true },
                  { label: '宛先\nポート番号',   bg: '#fef3c7', isRed: true },
                  { label: 'その他のヘッダ\n(シーケンス番号 等)', bg: '#fde68a', span: 2 },
                  { label: 'データ',             bg: '#dcfce7', span: 2 },
                ],
              },
            ],
            caption: '黄＝L4ヘッダ／緑＝L4ペイロード。シーケンス番号でパケット順序を管理。',
          },
        ],
      },
      {
        heading: 'DoS攻撃／DDoS攻撃',
        richItems: [
          [
            { text: 'DoS攻撃：大量のパケットをサーバに送り付け、サービス提供に影響を与えるサイバー攻撃', style: 'plain' },
          ],
          [
            { text: 'DoS攻撃は ', style: 'plain' },
            { text: '送信元IPアドレス', style: 'red' },
            { text: ' を偽装して行われることがある', style: 'plain' },
          ],
          [
            { text: '偽装理由①：自分の身元を明かさず攻撃するため', style: 'plain' },
          ],
          [
            { text: '偽装理由②：FW などのフィルタリング機能で簡単に防御されないため', style: 'plain' },
          ],
          [
            { text: '送信元IPアドレスを偽装し、ICMPの応答パケットを大量発生させ攻撃対象に送る ', style: 'plain' },
            { text: '分散', style: 'red' },
            { text: '型DoS攻撃（DDoS）⇒ ', style: 'plain' },
            { text: 'スマーフ', style: 'red' },
            { text: ' 攻撃。送信元IPアドレスを ', style: 'plain' },
            { text: '攻撃対象', style: 'red' },
            { text: ' のサーバに偽装', style: 'plain' },
          ],
          [
            { text: 'SYNフラッド攻撃：SYNパケットを送り付けた後、', style: 'plain' },
            { text: 'ACK', style: 'red' },
            { text: ' パケットが攻撃対象のホストに届かないようにし、未完了の接続開始処理を大量発生させる（メモリを大量消費）', style: 'plain' },
          ],
          [
            { text: 'DNSリフレクタ', style: 'red' },
            { text: '（DNSアンプ）攻撃：送信元IPアドレスを攻撃対象に偽装したDNS問合せを大量に送付。応答パケットを大きくするため一般的に ', style: 'plain' },
            { text: 'TXT', style: 'red' },
            { text: ' レコードを問い合わせる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'HTTP — メソッドとステータスコード',
        richItems: [
          [
            { text: 'HTTPのメソッド：', style: 'plain' },
            { text: 'GET', style: 'red' },
            { text: '（Webサーバからのコンテンツ取得）／POST（Webサーバへのデータ送信）', style: 'plain' },
          ],
          [
            { text: 'CONNECT', style: 'red' },
            { text: '：', style: 'plain' },
            { text: 'プロキシ', style: 'red' },
            { text: ' サーバへのHTTPS中継依頼。PCから ', style: 'plain' },
            { text: 'プロキシ', style: 'red' },
            { text: ' サーバに対して利用', style: 'plain' },
          ],
          [
            { text: 'HTTPSはPCとWEBサーバ間で暗号化通信が行われるが、プロキシは暗号鍵が分からないので暗号を解いた中継処理ができない。CONNECTメソッドが適用されると、プロキシはHTTPS通信に対して何もせず通過させる', style: 'plain' },
          ],
          [
            { text: 'CONNECTは制限しないとTCP/', style: 'plain' },
            { text: '443', style: 'red' },
            { text: ' 以外のポートでも使えてしまう（なので制限すべき）', style: 'plain' },
          ],
          [
            { text: 'HTTPレスポンスに含まれる3桁の数字 ⇒ ステータスコード', style: 'plain' },
          ],
          [
            { text: 'ステータスコード：', style: 'plain' },
            { text: '200', style: 'red' },
            { text: '（リクエスト成功）／', style: 'plain' },
            { text: '404', style: 'red' },
            { text: '（指定ページが無い）／302（', style: 'plain' },
            { text: 'リダイレクト', style: 'red' },
            { text: '）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'セッション管理とCookie',
        richItems: [
          [
            { text: 'クライアントとサーバ間でログイン情報を保持・管理する仕組み ⇒ ', style: 'plain' },
            { text: 'セッション', style: 'red' },
            { text: ' 管理', style: 'plain' },
          ],
          [
            { text: 'セッションとTCPの違い：セッションは上位層（L5〜7）の処理／TCPはトランスポート層のコネクション（3ウェイハンドシェイクが行われる一連の通信）', style: 'plain' },
          ],
          [
            { text: 'Cookie', style: 'red' },
            { text: '：セッション管理でよく利用される、クライアントとサーバ間で保持される情報', style: 'plain' },
          ],
          [
            { text: 'CookieのセッションIDを発行するのは ', style: 'plain' },
            { text: 'サーバ', style: 'red' },
            { text: ' 側。WebサーバはHTTPレスポンスの "', style: 'plain' },
            { text: 'Set-Cookie', style: 'red' },
            { text: '" ヘッダフィールドにセッションIDを書き込む', style: 'plain' },
          ],
          [
            { text: 'Secure', style: 'red' },
            { text: ' 属性：暗号化された通信（HTTPS）のみCookieを送り、HTTPでは ', style: 'plain' },
            { text: '送らない', style: 'red' },
          ],
          [
            { text: 'Domain', style: 'red' },
            { text: ' 属性：ドメインを指定しないと ', style: 'plain' },
            { text: '発行したサーバ', style: 'red' },
            { text: ' にしかCookieが送られない', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'HTTPヘッダ／URI／HTTP/2',
        richItems: [
          [
            { text: 'URLは ', style: 'plain' },
            { text: 'ホスト', style: 'red' },
            { text: ' ヘッダフィールドに埋め込まれる。ヘッダにFQDNをもつのはHTTPだけ（LB等で他プロトコルはFQDNで振り分けられない）', style: 'plain' },
          ],
          [
            { text: 'Upgrade ヘッダ：別のプロトコルに切り替えを要求', style: 'plain' },
          ],
          [
            { text: 'Request-URI：接続先のFQDN（ホスト名）やポート番号が含まれる', style: 'plain' },
          ],
          [
            { text: 'HTTP/2：HTTP1.1の問題点を解消し、一つのTCPコネクションで複数のファイルを同時にやりとりできるプロトコル', style: 'plain' },
          ],
          [
            { text: 'ストリーム', style: 'red' },
            { text: '：HTTP/2 において、TCPコネクション上で作られる仮想的な通信路 ⇒ ', style: 'plain' },
            { text: '順序', style: 'red' },
            { text: ' の制約がなくなる', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：輻輳制御（参考）',
        navyItems: [
          [
            { text: 'スロースタート', style: 'navy' },
            { text: '：ウィンドウを1から', style: 'plain' },
            { text: '指数的', style: 'navy' },
            { text: 'に増加（ssthreshまで）', style: 'plain' },
          ],
          [
            { text: '輻輳回避', style: 'navy' },
            { text: '：ssthresh到達後は', style: 'plain' },
            { text: '線形増加', style: 'navy' },
            { text: '（1 MSS/RTT）', style: 'plain' },
          ],
          [
            { text: '高速再転送', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '3つのDuplicate ACK', style: 'navy' },
            { text: 'でタイムアウト前に再送', style: 'plain' },
          ],
          [
            { text: 'RED（Random Early Detection）：キュー満杯前にランダムドロップで輻輳崩壊を防止', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：ICMPタイプ（参考）',
        navyItems: [
          [
            { text: 'Type ', style: 'plain' },
            { text: '8', style: 'navy' },
            { text: '（Echo Request）/ Type ', style: 'plain' },
            { text: '0', style: 'navy' },
            { text: '（Echo Reply）：ping', style: 'plain' },
          ],
          [
            { text: 'Type ', style: 'plain' },
            { text: '11', style: 'navy' },
            { text: '（Time Exceeded）：TTL=0でルータが返す。traceroute', style: 'plain' },
          ],
          [
            { text: 'Type ', style: 'plain' },
            { text: '3', style: 'navy' },
            { text: '（Destination Unreachable）：到達不能。コード3はポート到達不能', style: 'plain' },
          ],
          [
            { text: 'DFビット', style: 'navy' },
            { text: '（Don\'t Fragment）：PMTUDに使用', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：HTTPバージョン（参考）',
        navyItems: [
          [
            { text: 'HTTP/1.1：テキストベース。Keep-Alive対応。', style: 'plain' },
            { text: 'HoLブロッキング', style: 'navy' },
            { text: 'あり', style: 'plain' },
          ],
          [
            { text: 'HTTP/2：バイナリフレーム・', style: 'plain' },
            { text: 'マルチプレキシング', style: 'navy' },
            { text: '・HPACK圧縮・サーバプッシュ', style: 'plain' },
          ],
          [
            { text: 'HTTP/3', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'QUIC', style: 'navy' },
            { text: '（UDP）上で動作。TCPのHoLブロッキングを', style: 'plain' },
            { text: '根本解決', style: 'navy' },
            { text: '。TLS 1.3が統合', style: 'plain' },
          ],
          [
            { text: 'QUIC：', style: 'plain' },
            { text: '0-RTT接続', style: 'navy' },
            { text: '／ストリーム独立再送制御／接続移行', style: 'plain' },
          ],
          [
            { text: 'QUIC（UDP）はNAPT変換エントリーの', style: 'plain' },
            { text: 'エージングタイム', style: 'navy' },
            { text: 'を短く設定／FWで', style: 'plain' },
            { text: 'UDP 443', style: 'navy' },
            { text: 'を許可', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：HTTPS／証明書（参考）',
        navyItems: [
          [
            { text: 'OCSP', style: 'navy' },
            { text: '：証明書の失効状態をリアルタイム確認', style: 'plain' },
          ],
          [
            { text: 'HSTS', style: 'navy' },
            { text: '：常にHTTPS接続するようブラウザに指示するヘッダ', style: 'plain' },
          ],
          [
            { text: 'OCSP Stapling', style: 'navy' },
            { text: '：サーバ自身がOCSP応答をキャッシュしてクライアントに提示（レイテンシ削減）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'TCPで動作するプロトコルは==IPアドレスの詐称が不可==（3ウェイハンドシェイクが成立しないため）',
      'MTU=1500、MSS=1460（IP/TCPヘッダ各20バイト）は数値で覚える',
      'スマーフ攻撃と==DNSリフレクタ==攻撃はDDoSの代表例',
      'SYNフラッドは==ACK==を返さない＝半開コネクションでメモリ消費',
      'CONNECTメソッドは==TCP/443==以外で使われ得るのでプロキシで制限すべき',
      '==Secure属性==／==Domain属性==はCookieセキュリティで頻出',
    ],
  },

  firewall: {
    summary: '復習ノート「ファイアウォール」準拠。FW（フィルタリング・動的フィルタリング・冗長化）、IDS/IPS、WAFを整理。',
    sections: [
      {
        heading: 'FW（ファイアウォール）— 基本',
        richItems: [
          [
            { text: '統合脅威管理機能を持つFW：', style: 'plain' },
            { text: 'UTM', style: 'red' },
            { text: '（アンチウイルス機能、URLフィルタリング機能をもつ）', style: 'plain' },
          ],
          [
            { text: 'FWの基本的な機能：', style: 'plain' },
            { text: 'フィルタリング', style: 'red' },
            { text: ' 機能（特定のIPアドレスやポート番号の通信だけを許可する）', style: 'plain' },
          ],
          [
            { text: '用いるパケットの情報：宛先・送信元', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' ／ 宛先・送信元', style: 'plain' },
            { text: 'ポート番号', style: 'red' },
            { text: ' ／ ', style: 'plain' },
            { text: 'プロトコル', style: 'red' },
          ],
          [
            { text: 'FWはホワイトリスト方式 ⇒ ', style: 'plain' },
            { text: '許可', style: 'red' },
            { text: ' するものだけ書けばよい（答案のコツ）。拒否するものは暗黙のdeny', style: 'plain' },
          ],
          [
            { text: 'FWでは、DMZ上の機器がインターネットからのpingに応答しないように、プロトコルが ', style: 'plain' },
            { text: 'ICMP', style: 'red' },
            { text: ' のパケットを通過禁止に設定', style: 'plain' },
          ],
          [
            { text: 'スマホが接続する場合、送信元IPアドレスは ', style: 'plain' },
            { text: 'ANY', style: 'red' },
          ],
          [
            { text: 'VoIPのためのFWの穴は SIP と RTP の2経路を考える', style: 'plain' },
          ],
        ],
      },
      {
        heading: '動的フィルタリング（ステートフルインスペクション）',
        richItems: [
          [
            { text: '動的フィルタリング：', style: 'plain' },
            { text: '戻り', style: 'red' },
            { text: ' のパケットを自動で許可する。', style: 'plain' },
            { text: 'ステートフルインスペクション', style: 'red' },
            { text: ' といわれることもある', style: 'plain' },
          ],
          [
            { text: '通過したパケットの状態を保持しておく必要がある（送信元・宛先IPアドレス、プロトコル、送信元・宛先ポート番号などの組み合わせ）', style: 'plain' },
          ],
          [
            { text: '注意：L3SWのACLはステートフルではなく、', style: 'plain' },
            { text: '静', style: 'red' },
            { text: ' 的パケットフィルタリングなので戻りが自動許可されない', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'FWの冗長化',
        richItems: [
          [
            { text: 'FWの冗長化：VRRPを用いず、独自のプロトコルで行うことが一般的（ステートフルインスペクションで動的にセッションを管理しており、', style: 'plain' },
            { text: 'セッション維持', style: 'red' },
            { text: ' のため）', style: 'plain' },
          ],
          [
            { text: 'FW間はフェールオーバリンクと呼ばれる専用の線で結ばれ、設定情報やセッション情報を同期する', style: 'plain' },
          ],
          [
            { text: 'ActiveのFW故障時にセッション情報を引き継ぐ機能 ⇒ ', style: 'plain' },
            { text: 'ステートフルフェールオーバ', style: 'red' },
            { text: '（PCからインターネットへの通信を維持）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IDSとIPS',
        richItems: [
          [
            { text: 'IDSとIPSの違い：IDSは ', style: 'plain' },
            { text: '検知', style: 'red' },
            { text: ' までしかできない（Detection）／IPSは ', style: 'plain' },
            { text: '防御', style: 'red' },
            { text: ' まで行える（Prevention）', style: 'plain' },
          ],
          [
            { text: 'FWとIDS/IPSの違い：FWはパケットの ', style: 'plain' },
            { text: 'ヘッダ情報', style: 'red' },
            { text: ' のみを確認／IDS/IPSは ', style: 'plain' },
            { text: 'データの中身', style: 'red' },
            { text: ' まで確認', style: 'plain' },
          ],
          [
            { text: 'IDS/IPSはFWの ', style: 'plain' },
            { text: '内', style: 'red' },
            { text: ' 側（', style: 'plain' },
            { text: 'DMZ', style: 'red' },
            { text: ' 側）に設置（', style: 'plain' },
            { text: '負荷', style: 'red' },
            { text: ' を減らすため。FWの外側だとFWで許可しないパケットも検査が必要となり、アラート・ログ・警告メールが大量になる）', style: 'plain' },
          ],
          [
            { text: 'IDS/IPSの設置場所：IPSは防御のため ', style: 'plain' },
            { text: 'インライン（通信経路上）', style: 'red' },
            { text: ' に設置／IDSは ', style: 'plain' },
            { text: 'インライン', style: 'red' },
            { text: ' または SW の ', style: 'plain' },
            { text: 'ミラーポート', style: 'red' },
            { text: ' に接続', style: 'plain' },
          ],
          [
            { text: 'インライン', style: 'red' },
            { text: ' 設置はIDSが故障すると通信できない／', style: 'plain' },
            { text: 'ミラーポート', style: 'red' },
            { text: ' 設置は構成変更が少ない', style: 'plain' },
          ],
          [
            { text: 'IDS/IPSをインライン設置する場合、機器の故障に備えて必要な機能：', style: 'plain' },
            { text: '通信をそのまま通過させ、遮断しない', style: 'red' },
            { text: ' 機能（バイパス）', style: 'plain' },
          ],
          [
            { text: 'IDSをSWのミラーポートに接続する場合、IDS側のNWポートを ', style: 'plain' },
            { text: 'ミラーポート', style: 'red' },
            { text: ' に接続して ', style: 'plain' },
            { text: 'プロミスキャス', style: 'red' },
            { text: ' モードにすることで、IDS以外を宛先とする通信を取り込む', style: 'plain' },
          ],
          [
            { text: 'IDS側のポートに ', style: 'plain' },
            { text: 'IP', style: 'red' },
            { text: ' アドレスを割り当てなければ、IDS自体がレイヤ', style: 'plain' },
            { text: '3', style: 'red' },
            { text: ' の攻撃を受けることを回避できる', style: 'plain' },
          ],
          [
            { text: 'IDS自体に不正パケットを防止する機能は無い。IDSは ', style: 'plain' },
            { text: 'RST', style: 'red' },
            { text: ' パケット送付によりコネクション切断で防御可能。ただしレイヤ4が ', style: 'plain' },
            { text: 'TCP', style: 'red' },
            { text: ' のときのみ。', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: ' では不可（UDPなら ICMP unreachable 送り付け）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'WAF（Web Application Firewall）',
        richItems: [
          [
            { text: 'WAFで主にブロックするアプリケーション層プロトコル ⇒ ', style: 'plain' },
            { text: 'HTTP', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: 'HTTPS', style: 'red' },
          ],
          [
            { text: 'FWで防御できないがWAFで防御できる攻撃の例：', style: 'plain' },
            { text: 'SQLインジェクション', style: 'red' },
            { text: ' ／ ', style: 'plain' },
            { text: 'クロスサイトスクリプティング', style: 'red' },
            { text: ' 等', style: 'plain' },
          ],
          [
            { text: 'Webサーバへの通信をクラウド事業者の ', style: 'plain' },
            { text: 'クラウドWAF', style: 'red' },
            { text: ' 経由にするために必要な設定：DNSサーバでWebサーバの別名をWAFにするように ', style: 'plain' },
            { text: 'CNAME', style: 'red' },
            { text: ' レコードを設定', style: 'plain' },
          ],
          [
            { text: 'AレコードではなくCNAMEレコードなら、WAFサービス事業者がIPアドレスを変更してもDNSの設定変更が不要', style: 'plain' },
          ],
          [
            { text: 'HTTPSで動作するWebサーバの場合、Webサーバの証明書はクラウドWAFに配置（SSLで暗号化された通信をWAFで復号してセキュリティチェックを行うため）', style: 'plain' },
          ],
          [
            { text: 'WebサーバのIPアドレスを直接指定するなどしてWAFを経由せずに通信を試みる攻撃者への対策：', style: 'plain' },
            { text: 'WAFのIPアドレス以外', style: 'red' },
            { text: ' からのWebサーバへの通信をFWで遮断', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：NAT / NAPT（参考）',
        navyItems: [
          [
            { text: '静的NAT', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '1対1', style: 'navy' },
            { text: 'のIPアドレス変換', style: 'plain' },
          ],
          [
            { text: 'NAPT', style: 'navy' },
            { text: '（IPマスカレード）：', style: 'plain' },
            { text: 'IPアドレス＋ポート番号', style: 'navy' },
            { text: 'の変換。1つのグローバルIPで複数端末が通信可能', style: 'plain' },
          ],
          [
            { text: 'DNAT', style: 'navy' },
            { text: '（Destination NAT）：宛先IPを書き換えてDMZ内サーバへ転送。ポートフォワーディング', style: 'plain' },
          ],
          [
            { text: 'SNAT', style: 'navy' },
            { text: '（Source NAT）：送信元IPを書き換える（インターネットへの出口で使用）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：DMZ（参考）',
        navyItems: [
          [
            { text: '外部公開サーバ（Web・Mail・DNS）を内部LANとも外部とも', style: 'plain' },
            { text: '分離したゾーン', style: 'navy' },
          ],
          [
            { text: 'FWで「外部→DMZ」と「', style: 'plain' },
            { text: 'DMZ', style: 'navy' },
            { text: '→', style: 'plain' },
            { text: '内部', style: 'navy' },
            { text: '」のアクセスを個別に制御', style: 'plain' },
          ],
          [
            { text: '典型的な', style: 'plain' },
            { text: '3ゾーン', style: 'navy' },
            { text: '構成：外部（Internet）/ DMZ / 内部（Internal）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：検知方式（参考）',
        navyItems: [
          [
            { text: 'シグネチャ型', style: 'navy' },
            { text: '（パターンマッチング型）：既知の攻撃パターンと照合。', style: 'plain' },
            { text: '誤検知が少ない', style: 'navy' },
            { text: 'が', style: 'plain' },
            { text: '未知の攻撃に無力', style: 'navy' },
          ],
          [
            { text: 'アノマリ型', style: 'navy' },
            { text: '（異常検知型）：ベースラインからの逸脱を検知。', style: 'plain' },
            { text: '未知の攻撃にも対応', style: 'navy' },
            { text: 'できるが', style: 'plain' },
            { text: '誤検知が多い', style: 'navy' },
          ],
        ],
      },
    ],
    exam_tips: [
      'FWは==許可==するものだけ書けばよい（拒否は暗黙のdeny）',
      '動的フィルタリング＝==ステートフルインスペクション==。L3SW ACLは静的なので戻りが自動許可されない',
      'FWの冗長化は==独自プロトコル==＋フェールオーバリンクで==ステートフルフェールオーバ==',
      'IPSは==インライン==で防御／IDSは==ミラーポート==で検知のみ',
      'IDSはL4が==TCP==のとき==RST==送付で切断、UDPは ICMP unreachable',
      'WAFは==SQLインジェクション==／==XSS==を防御、L3/L4の帯域消費型DDoSは対象外',
      'クラウドWAFはDNSの==CNAME==レコードで切替、IPアドレス以外をFWで遮断',
    ],
  },

  wireless: {
    summary: '復習ノート「無線LAN」準拠。基礎・規格・WLC・PoE・無線LANセキュリティ（WPA/WPA2/WPA3）・802.1X認証・ハンドオーバを整理。',
    sections: [
      {
        heading: '無線LANの基礎',
        richItems: [
          [
            { text: 'アクセスポイント（AP）からクライアントに対して自分の存在を通知する信号：', style: 'plain' },
            { text: 'ビーコン', style: 'red' },
          ],
          [
            { text: '無線LANを識別するためのID：', style: 'plain' },
            { text: 'SSID', style: 'red' },
          ],
          [
            { text: '異なる周波数帯の規格での互換性はない', style: 'plain' },
          ],
          [
            { text: 'IEEE 802.11g：1から13までのチャネルがある。5チャネル離れている組み合わせ（1, 6, 11ch等）では周波数が重ならないため、干渉しづらい', style: 'plain' },
          ],
          [
            { text: '無線LANではアクセス制御に ', style: 'plain' },
            { text: 'CSMA/CA', style: 'red' },
            { text: ' 方式を用いる', style: 'plain' },
          ],
        ],
      },
      {
        heading: '無線LANの規格（IEEE）',
        richItems: [
          [
            { text: '802.11b：2.4GHz、11Mbps', style: 'plain' },
          ],
          [
            { text: '802.11g', style: 'red' },
            { text: '：2.4GHz、20MHz、54Mbps', style: 'plain' },
          ],
          [
            { text: '802.11a', style: 'red' },
            { text: '：5GHz、20MHz、54Mbps', style: 'plain' },
          ],
          [
            { text: '802.11n', style: 'red' },
            { text: '：2.4/5GHz、20/40MHz、600Mbps', style: 'plain' },
          ],
          [
            { text: '802.11ac', style: 'red' },
            { text: '：5GHz、20/40/80/160MHz、6.93Gbps（MU-MIMOは ', style: 'plain' },
            { text: 'ac', style: 'red' },
            { text: ' から）', style: 'plain' },
          ],
          [
            { text: '802.11ax', style: 'red' },
            { text: '：2.4/5GHz、9.6Gbps', style: 'plain' },
          ],
        ],
      },
      {
        heading: '無線LANコントローラ（WLC）',
        richItems: [
          [
            { text: '無線LANが大規模になるにつれて、設定の一元管理を目的としてWLCを用いることが多くなる', style: 'plain' },
          ],
          [
            { text: 'WLCの機能：APの ', style: 'plain' },
            { text: '構成', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: '設定', style: 'red' },
            { text: ' を管理／APのステータス（', style: 'plain' },
            { text: 'リンクダウン', style: 'red' },
            { text: '、', style: 'plain' },
            { text: '接続端末数', style: 'red' },
            { text: ' 等）監視／AP同士の電波干渉の検知／APの ', style: 'plain' },
            { text: '負荷分散', style: 'red' },
            { text: ' 制御', style: 'plain' },
          ],
          [
            { text: 'PMK', style: 'red' },
            { text: ' の保持などによる ', style: 'plain' },
            { text: 'ハンドオーバ', style: 'red' },
            { text: ' 制御（', style: 'plain' },
            { text: 'PMK', style: 'red' },
            { text: ' を用いて事前 ', style: 'plain' },
            { text: '認証', style: 'red' },
            { text: ' をしておく）', style: 'plain' },
          ],
          [
            { text: '利用者認証', style: 'red' },
            { text: '、', style: 'plain' },
            { text: '認証VLAN', style: 'red' },
            { text: ' などのセキュリティ対策機能', style: 'plain' },
          ],
          [
            { text: 'WLCを導入したら、APは ', style: 'plain' },
            { text: '通信をただ転送', style: 'red' },
            { text: ' するスイッチングハブのような役割になる。認証機能などはほぼ全てWLCに任せる', style: 'plain' },
          ],
          [
            { text: 'WLCの2つのモード', style: 'plain' },
          ],
          [
            { text: '　モードA：', style: 'plain' },
            { text: '管理機能だけ', style: 'red' },
            { text: ' をWLCが行い、実際の通信はWLCを経由しない', style: 'plain' },
          ],
          [
            { text: '　　【モードA利点①】WLCへの ', style: 'plain' },
            { text: '通信負荷集中', style: 'red' },
            { text: ' を抑制可能', style: 'plain' },
          ],
          [
            { text: '　　【モードA利点②】認証後にWLCに障害が発生しても、その ', style: 'plain' },
            { text: '無線LAN端末は通信が継続可能', style: 'red' },
          ],
          [
            { text: '　モードB：', style: 'plain' },
            { text: '実際の通信もWLCを経由', style: 'red' },
            { text: ' させる', style: 'plain' },
          ],
          [
            { text: 'モバイルWi-Fiルータには、利用者ID・パスワード・', style: 'plain' },
            { text: 'APN', style: 'red' },
            { text: '（LTE回線からインターネットへのゲートウェイの指定）の情報を設定', style: 'plain' },
          ],
        ],
      },
      {
        heading: '電波干渉と高速化技術',
        richItems: [
          [
            { text: '電波干渉を防ぐには：', style: 'plain' },
            { text: '周波数帯', style: 'red' },
            { text: ' を変える／', style: 'plain' },
            { text: 'チャネル', style: 'red' },
            { text: ' を変える（', style: 'plain' },
            { text: 'チャネル', style: 'red' },
            { text: ' を ', style: 'plain' },
            { text: '離す', style: 'red' },
            { text: '）／AP等の距離を離す', style: 'plain' },
          ],
          [
            { text: 'MIMO', style: 'red' },
            { text: '：複数のアンテナを束ねて同時に通信することで高速化（.11nや.11ac等）', style: 'plain' },
          ],
          [
            { text: 'チャネルボンディング', style: 'red' },
            { text: '：帯域幅を重ねる技術（通常20MHzを2倍の40MHzで通信＝速度2倍）', style: 'plain' },
          ],
          [
            { text: 'MIMOとチャネルボンディングは併用できる', style: 'plain' },
          ],
          [
            { text: 'デュアル', style: 'red' },
            { text: ' バンド：2.4GHzと5GHzの2つの周波数帯を併用。3つ使うなら ', style: 'plain' },
            { text: 'トライ', style: 'red' },
            { text: ' バンド。目的：多数の端末を ', style: 'plain' },
            { text: '安定', style: 'red' },
            { text: ' して接続させる（高速化ではない。一つの端末が使える周波数帯は変わらない）', style: 'plain' },
          ],
          [
            { text: '2.4GHz帯を利用する近距離・低消費電力の無線通信技術 ⇒ ', style: 'plain' },
            { text: 'Bluetooth', style: 'red' },
          ],
        ],
      },
      {
        heading: 'PoE（Power over Ethernet）',
        richItems: [
          [
            { text: '有線LANを利用した電力供給。天井などの電源コンセントが無い場所に無線APを設置するときに有用', style: 'plain' },
          ],
          [
            { text: 'IEEE ', style: 'plain' },
            { text: '802.3af', style: 'red' },
            { text: '：消費電力15.4W、別名PoE', style: 'plain' },
          ],
          [
            { text: 'IEEE ', style: 'plain' },
            { text: '802.3at', style: 'red' },
            { text: '：消費電力 ', style: 'plain' },
            { text: '30', style: 'red' },
            { text: 'W、別名 ', style: 'plain' },
            { text: 'PoE+', style: 'red' },
          ],
          [
            { text: 'IEEE ', style: 'plain' },
            { text: '802.3bt', style: 'red' },
            { text: '：消費電力 ', style: 'plain' },
            { text: '60', style: 'red' },
            { text: 'W、別名PoE++', style: 'plain' },
          ],
        ],
      },
      {
        heading: '無線LANのセキュリティ',
        richItems: [
          [
            { text: '無線LANは有線LANに比べてセキュリティ対策を十分に行う必要がある（電波の届く範囲なら壁を越えどこでも通信可能で、第三者が盗聴などの不正行為をしやすい）', style: 'plain' },
          ],
          [
            { text: 'any', style: 'red' },
            { text: ' 接続拒否：無線LANのAP設定で、SSIDが空白または ', style: 'plain' },
            { text: 'any', style: 'red' },
            { text: ' での接続要求を拒否する機能', style: 'plain' },
          ],
          [
            { text: 'APで定期的に送信するビーコン信号を停止する機能 ⇒ SSIDの ', style: 'plain' },
            { text: 'ステルス', style: 'red' },
            { text: ' 機能', style: 'plain' },
          ],
          [
            { text: 'SSIDやMACアドレスは ', style: 'plain' },
            { text: '暗号化', style: 'red' },
            { text: ' できないため、無線LANの認証に適さない', style: 'plain' },
          ],
          [
            { text: '代表的な無線LANセキュリティ方式：WEP、WPA、WPA2', style: 'plain' },
          ],
          [
            { text: 'WPAでは ', style: 'plain' },
            { text: 'RC4', style: 'red' },
            { text: ' を利用／WPA2ではより強固な ', style: 'plain' },
            { text: 'AES', style: 'red' },
            { text: ' を利用', style: 'plain' },
          ],
          [
            { text: 'WPA2ではPSKを使ったが、新規格のWPA3では事前共有鍵をより安全にやりとりする ', style: 'plain' },
            { text: 'SAE', style: 'red' },
            { text: ' という技術に改良。SAEはパスワードと ', style: 'plain' },
            { text: 'MACアドレス', style: 'red' },
            { text: '、乱数で暗号化を行う', style: 'plain' },
          ],
          [
            { text: 'TKIP — フェーズ1：一時鍵、IV、無線LAN端末のMACアドレスの3つを混合してキーストリーム1を生成／フェーズ2：キーストリーム1にIVの拡張部分を混合して暗号鍵であるキーストリーム2を生成', style: 'plain' },
          ],
          [
            { text: 'WPA（WPA2）の2種類認証：パーソナルモードの ', style: 'plain' },
            { text: 'PSK', style: 'red' },
            { text: '（', style: 'plain' },
            { text: '事前共有', style: 'red' },
            { text: ' 鍵）／エンタープライズモードの ', style: 'plain' },
            { text: 'IEEE 802.1X', style: 'red' },
            { text: ' 認証', style: 'plain' },
          ],
          [
            { text: 'IEEE 802.1X認証：ユーザID/パスワードによる認証である ', style: 'plain' },
            { text: 'PEAP', style: 'red' },
            { text: '、クライアント証明書を使った ', style: 'plain' },
            { text: 'EAP-TLS', style: 'red' },
            { text: ' がある', style: 'plain' },
          ],
          [
            { text: '来訪者にパーソナルモードで無線LANを設定してもらうときに教える情報 ⇒ ', style: 'plain' },
            { text: 'SSID', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: 'PSK', style: 'red' },
          ],
        ],
      },
      {
        heading: 'ハンドオーバ',
        richItems: [
          [
            { text: 'PMK（Pairwise Master Key）：無線LANの暗号化通信の鍵を乱数を組み合わせて毎回変更するために使う、もとになる鍵', style: 'plain' },
          ],
          [
            { text: 'ハンドオーバ：無線LAN端末を移動しながら利用しているとき、接続APが変わること（接続するAPに改めてPMKの作成などの認証処理が発生するため、一瞬通信ができなくなる＝ハンドオーバ時間）', style: 'plain' },
          ],
          [
            { text: 'WPA2で実装、ハンドオーバ時間短縮機能①：', style: 'plain' },
            { text: '事前認証', style: 'red' },
            { text: '。APが切り替わるタイミングで認証するのではなく、同じNWに接続されている他のAPとは、接続しているAP経由で事前に認証をしておく', style: 'plain' },
          ],
          [
            { text: '機能②：', style: 'plain' },
            { text: '認証キー', style: 'red' },
            { text: ' の保持（PMKキャッシュ）。一度認証した認証キーをAPが保持', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：Wi-Fi 6 / Wi-Fi 7（参考）',
        navyItems: [
          [
            { text: '802.11ax', style: 'navy' },
            { text: '（Wi-Fi 6）：', style: 'plain' },
            { text: 'OFDMA', style: 'navy' },
            { text: '・', style: 'plain' },
            { text: '1024-QAM', style: 'navy' },
            { text: '・', style: 'plain' },
            { text: 'TWT', style: 'navy' },
            { text: '（省電力）', style: 'plain' },
          ],
          [
            { text: '802.11ax 6E（Wi-Fi 6E）：', style: 'plain' },
            { text: '6GHz帯', style: 'navy' },
            { text: '追加', style: 'plain' },
          ],
          [
            { text: '802.11be', style: 'navy' },
            { text: '（Wi-Fi 7）：', style: 'plain' },
            { text: '320', style: 'navy' },
            { text: 'MHz・', style: 'plain' },
            { text: '4096-QAM', style: 'navy' },
            { text: '・', style: 'plain' },
            { text: 'MLO', style: 'navy' },
            { text: '・プリアンブルパンクチャリング。最大', style: 'plain' },
            { text: '46', style: 'navy' },
            { text: 'Gbps', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'CSMA/CAは無線LANのアクセス制御方式',
      'IEEE規格と周波数・最大速度の表は丸暗記',
      'WLCのモードA／Bの違い（通信が経由するかどうか）は頻出',
      'PoE: ==802.3af== 15.4W / ==802.3at== 30W (PoE+) / ==802.3bt== 60W (PoE++)',
      'WPA=RC4 / WPA2=AES / WPA3=SAE',
      'PSK＋SSIDでパーソナルモード設定、IEEE 802.1Xでエンタープライズモード',
      'ハンドオーバ高速化＝事前認証＋PMKキャッシュ',
    ],
  },

  routing: {
    summary: '復習ノート「ルーティング」準拠。RIP（距離ベクトル型）・OSPF（リンクステート型）・BGP（パスベクトル型）を整理。',
    sections: [
      {
        heading: 'ルーティングの分類',
        richItems: [
          [
            { text: '静', style: 'red' },
            { text: ' 的ルーティング：ルータに「手動」で記載する', style: 'plain' },
          ],
          [
            { text: '動', style: 'red' },
            { text: ' 的ルーティング：ルータ同士で経路情報を交換する', style: 'plain' },
          ],
          [
            { text: '動的のメリット：', style: 'plain' },
            { text: '自動で最適なルート選択', style: 'red' },
            { text: ' が可能／', style: 'plain' },
            { text: '障害時に自動で経路変更', style: 'red' },
            { text: ' が可能／設定が ', style: 'plain' },
            { text: '簡単', style: 'red' },
            { text: ' になる', style: 'plain' },
          ],
          [
            { text: 'ルーティングループ：2つの機器間でデフォルトルートが互いを向いていたらループが発生する（構成変更の問題でありがち）', style: 'plain' },
          ],
          [
            { text: 'ポリシーベース', style: 'red' },
            { text: ' ルーティング：特定のポート、IPアドレスを識別してルーティング', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'RIP',
        richItems: [
          [
            { text: '距離ベクトル型アルゴリズムを用いたルーティング', style: 'plain' },
          ],
          [
            { text: '距離は通過するルータの数である ', style: 'plain' },
            { text: 'ホップ数', style: 'red' },
            { text: ' で表す', style: 'plain' },
          ],
          [
            { text: '問題点①：', style: 'plain' },
            { text: '経路変更に時間がかかる', style: 'red' },
            { text: '（経路集束に最大3分）', style: 'plain' },
          ],
          [
            { text: '問題点②：ホップ数だけで判断するので、ネットワークの ', style: 'plain' },
            { text: '回線速', style: 'red' },
            { text: '度', style: 'red' },
            { text: ' を考慮できない（最適な経路を選べない）', style: 'plain' },
          ],
          [
            { text: 'RIPのルーティング情報の更新方式に使うフレームの種類：', style: 'plain' },
            { text: 'ブ', style: 'red' },
            { text: 'ロード', style: 'red' },
            { text: 'キャスト', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'OSPF',
        richItems: [
          [
            { text: 'Open Shortest Path First — ', style: 'plain' },
            { text: 'リンクステート', style: 'red' },
            { text: ' 型アルゴリズムを使用', style: 'plain' },
          ],
          [
            { text: '経路選択において、回線速度を考慮するために、', style: 'plain' },
            { text: 'コスト', style: 'red' },
            { text: ' という概念を導入', style: 'plain' },
          ],
          [
            { text: 'OSPFではネットワークをエリアと呼ぶ単位に分割する。目的：', style: 'plain' },
            { text: 'ルータ負荷を軽減', style: 'red' },
            { text: ' する', style: 'plain' },
          ],
          [
            { text: '必ず存在する必要があるエリア：', style: 'plain' },
            { text: 'バックボーン', style: 'red' },
            { text: 'エリア（エリア番号：', style: 'plain' },
            { text: '0', style: 'red' },
            { text: '）', style: 'plain' },
          ],
          [
            { text: 'エリア0とその他のエリアを相互接続するルータを ', style: 'plain' },
            { text: 'エ', style: 'red' },
            { text: 'リア境界ルータ', style: 'red' },
            { text: '（', style: 'plain' },
            { text: 'ABR', style: 'red' },
            { text: '）という。ABRではエリア内の経路情報を ', style: 'plain' },
            { text: '集約', style: 'red' },
            { text: ' して他のエリアに送る（ルータの負荷軽減・集束時間短縮）', style: 'plain' },
          ],
          [
            { text: '大規模NWではセグメント内に複数ルータが存在することもあり、全ルータが経路交換するのは無駄。セグメント内で経路情報の交換を行うルータを ', style: 'plain' },
            { text: '代表ルータ（DR）', style: 'red' },
            { text: ' および ', style: 'plain' },
            { text: 'バックアップ代表', style: 'red' },
            { text: ' ', style: 'plain' },
            { text: 'ルータ（BDR）', style: 'red' },
            { text: ' として定める', style: 'plain' },
          ],
          [
            { text: '選出方法：OSPFの ', style: 'plain' },
            { text: 'プライオリティ', style: 'red' },
            { text: ' が高いルータからDR、BDRになる。選出されたくない場合は ', style: 'plain' },
            { text: '0', style: 'red' },
            { text: ' にする', style: 'plain' },
          ],
          [
            { text: 'OSPFのルーティング情報の更新方式に使うフレームの種類：', style: 'plain' },
            { text: 'マルチ', style: 'red' },
            { text: ' キャスト', style: 'plain' },
          ],
          [
            { text: 'OSPFルータは、', style: 'plain' },
            { text: '隣接', style: 'red' },
            { text: ' するルータ同士で ', style: 'plain' },
            { text: 'リンクステートアドバ', style: 'red' },
            { text: 'タイズメント', style: 'red' },
            { text: '（', style: 'plain' },
            { text: 'LSA', style: 'red' },
            { text: '）と呼ばれる情報を交換し、NW内のリンク情報を集めてLSDB（Link State Data Base）を構築', style: 'plain' },
          ],
          [
            { text: 'OSPFの各ルータは、集めたLSAを基に ', style: 'plain' },
            { text: 'ダイクストラ', style: 'red' },
            { text: ' アルゴリズムを用いた最短経路計算を行い、ルーティングテーブルを動的に作成', style: 'plain' },
          ],
          [
            { text: 'ループバックインタフェース：仮想的なインタフェース。複数の物理インタフェースに付与して ', style: 'plain' },
            { text: '物理冗長', style: 'red' },
            { text: ' を図る（OSPFが一緒に動作されることが多い）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'OSPF — LSAタイプ',
        richItems: [
          [
            { text: 'Type1 ルータLSA：', style: 'plain' },
            { text: '全ルータ', style: 'red' },
            { text: ' が生成。ルータ自身に関する情報（接続情報やコスト）を他のルータに伝達', style: 'plain' },
          ],
          [
            { text: 'Type2 ネットワークLSA：', style: 'plain' },
            { text: 'DR（代表', style: 'red' },
            { text: ' ルータ）が生成。', style: 'plain' },
            { text: 'エリア内', style: 'red' },
            { text: ' ルータの接続情報をエリア内のルータに伝達', style: 'plain' },
          ],
          [
            { text: 'Type3 サマリーLSA：', style: 'plain' },
            { text: 'ABR（境界', style: 'red' },
            { text: ' ルータ）が生成。各エリアの経路情報を他のエリアに伝達', style: 'plain' },
          ],
          [
            { text: 'Type4 ASBRサマリーLSA：', style: 'plain' },
            { text: 'ABR', style: 'red' },
            { text: ' が生成。', style: 'plain' },
            { text: 'ASBR', style: 'red' },
            { text: ' から受信した経路情報を他のエリアに伝達', style: 'plain' },
          ],
          [
            { text: 'Type5 外部LSA：', style: 'plain' },
            { text: 'ASBR（再', style: 'red' },
            { text: ' 配布するルータ）が生成。', style: 'plain' },
            { text: '外部NW', style: 'red' },
            { text: '（BGP等）から受信した経路情報を他のルータに伝達', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'BGP',
        richItems: [
          [
            { text: 'Border Gateway Protocol — BGPにおいて単一のルーティングポリシによって管理されるネットワーク ⇒ ', style: 'plain' },
            { text: 'AS', style: 'red' },
            { text: '（自律システム）', style: 'plain' },
          ],
          [
            { text: 'AS間のルーティング：EGP（BGP等）／AS内のルーティング：IGP（OSPF, RIP等）', style: 'plain' },
          ],
          [
            { text: 'BGPは ', style: 'plain' },
            { text: 'パスベクトル', style: 'red' },
            { text: ' 型アルゴリズムを使用', style: 'plain' },
          ],
          [
            { text: 'AS', style: 'red' },
            { text: 'パス（', style: 'plain' },
            { text: 'PATH', style: 'red' },
            { text: '）の情報によって経路情報を決定。ASパスには通過したAS番号が書き込まれ、自身のAS番号が含まれていたら ', style: 'plain' },
            { text: 'ループ', style: 'red' },
            { text: ' していると判断し経路情報を ', style: 'plain' },
            { text: '破棄', style: 'red' },
          ],
          [
            { text: 'BGP接続を行うルータ間の経路情報交換：', style: 'plain' },
            { text: 'BGPピア', style: 'red' },
            { text: '（ポート番号：', style: 'plain' },
            { text: 'TCP', style: 'red' },
            { text: '/', style: 'plain' },
            { text: '179', style: 'red' },
            { text: '）', style: 'plain' },
          ],
          [
            { text: '異なるルーティングプロトコルでは経路交換ができない。OSPFで学習した経路情報をBGPが動作するNWに通知する方法 ⇒ ', style: 'plain' },
            { text: '再配布', style: 'red' },
            { text: '。再配布された経路を再配布するとループが発生するので、基本的に再々配布は ', style: 'plain' },
            { text: 'しない', style: 'red' },
            { text: ' 設定にする', style: 'plain' },
          ],
          [
            { text: '1つのルータが複数の経路情報を受け取ったときは、ルーティングプロトコルの ', style: 'plain' },
            { text: 'アドミニストレーティブディスタンス', style: 'red' },
            { text: ' 値が ', style: 'plain' },
            { text: '小さい', style: 'red' },
            { text: ' 方が優先される（優先度高 ', style: 'plain' },
            { text: 'BGP', style: 'red' },
            { text: ' < ', style: 'plain' },
            { text: 'OSPF', style: 'red' },
            { text: ' < RIP 優先度低）', style: 'plain' },
          ],
          [
            { text: 'BGPで設定する優先度：MEDとLOCAL_PREF。前者はeBGP（外部）、後者は', style: 'plain' },
            { text: 'i', style: 'red' },
            { text: 'BGP（内部）に通知', style: 'plain' },
          ],
          [
            { text: '最適経路選択をする際、ASパスの長さが最も ', style: 'plain' },
            { text: '短い', style: 'red' },
            { text: ' 経路が優先され、同じ場合、MEDの値が小さい経路が優先される', style: 'plain' },
          ],
          [
            { text: 'BGPにおいて、同じコストの経路を複数設定することで経路の負荷分散を行う技術：', style: 'plain' },
            { text: 'BGPマルチパス', style: 'red' },
          ],
          [
            { text: 'BGPでは、', style: 'plain' },
            { text: 'KEEPALIVEメッセージ', style: 'red' },
            { text: ' を定期的に送信する。受信しなくなることでピアリングが切断され、AS内の各機器は経路情報をクリア・更新する', style: 'plain' },
          ],
          [
            { text: 'iBGP — 同一AS内のBGP。ネクストホップを自身のIPアドレスに書き換える／別のルータに経路をアドバタイズしない（ループ防止）／通常フルメッシュ構成にする', style: 'plain' },
          ],
          [
            { text: 'ルートリフレクタ：iBGPで経路情報を他のルータに反射 ⇒ iBGPの ', style: 'plain' },
            { text: 'ピア', style: 'red' },
            { text: ' を減らせる。ループ防止のため ', style: 'plain' },
            { text: 'クラスター', style: 'red' },
            { text: 'IDを設定し、自分のクラスターIDが含まれた経路広告は破棄する', style: 'plain' },
          ],
          [
            { text: 'プライベートAS：プライベートIPのAS版。組織が自由に使える', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'RIPは==ホップ数==／OSPFは==コスト==／BGPは==ASパス==',
      'OSPFの経路集束は ABR で ==集約== することで高速化',
      'OSPFのDR/BDRはマルチキャストで効率化（==224.0.0.5/6==）',
      'BGPは==TCP/179==。LSDB・LSAタイプはOSPFの典型出題',
      '優先度高 ==BGP < OSPF < RIP== 低',
    ],
  },

  vrrp: {
    summary: '復習ノート「VRRP」準拠。デフォルトゲートウェイ（ルータ）冗長化のためのプロトコル。',
    sections: [
      {
        heading: 'VRRP（Virtual Router Redundancy Protocol）',
        richItems: [
          [
            { text: 'デフォルトゲートウェイ（ルータ）', style: 'red' },
            { text: ' 冗長化が目的', style: 'plain' },
          ],
          [
            { text: 'VRRPを構成したルータは、', style: 'plain' },
            { text: '仮想IPアドレス', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: '仮想MACアドレス', style: 'red' },
            { text: ' の両方を持つ', style: 'plain' },
          ],
          [
            { text: '2台のルータでVRRPを機能させるには、それぞれに ', style: 'plain' },
            { text: '実IPアドレス', style: 'red' },
            { text: '、', style: 'plain' },
            { text: '仮想IPアドレス', style: 'red' },
            { text: '、', style: 'plain' },
            { text: 'VRRPグループ', style: 'red' },
            { text: '、', style: 'plain' },
            { text: '優先度', style: 'red' },
            { text: ' を設定する（仮想MACアドレスは自動付与）', style: 'plain' },
          ],
          [
            { text: '優先度が高いルータ ⇒ ', style: 'plain' },
            { text: 'マスタルータ', style: 'red' },
            { text: '／低いルータ ⇒ ', style: 'plain' },
            { text: 'バックアップルータ', style: 'red' },
          ],
          [
            { text: 'PCがVRRPルータと通信するには、デフォルトゲートウェイをVRRPの ', style: 'plain' },
            { text: '仮想IPアドレス', style: 'red' },
            { text: ' に設定する', style: 'plain' },
          ],
          [
            { text: 'マスタルータが故障したとき、バックアップルータが検知する方法：一定時間 ', style: 'plain' },
            { text: 'VRRPアドバタイズメント', style: 'red' },
            { text: ' が流れないと検知。このときバックアップルータはマスタルータに昇格', style: 'plain' },
          ],
          [
            { text: 'PCから送られた仮想MACアドレス宛のフレームは、L2SWのスイッチングにより、マスタルータのみに転送される', style: 'plain' },
          ],
          [
            { text: 'マスタルータが変わるときは、L2SWのMACアドレステーブルを書き換える必要があるため、バックアップルータ（マスタルータに昇格）が ', style: 'plain' },
            { text: 'GARP', style: 'red' },
            { text: ' を送信する', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      '仮想IPアドレスと仮想MACアドレスは ==自動付与== される',
      '昇格時には==GARP==でL2SWのMACアドレステーブルを書き換える',
      'マスタ／バックアップは==優先度==で決まる',
      'FW自体の冗長化はVRRPではなく独自プロトコル（ステートフルフェールオーバ）',
    ],
  },

  wan: {
    summary: '復習ノート「WAN」準拠。専用線／広域イーサネット／IP-VPN／SD-WAN／クラウド／高速化を整理。',
    sections: [
      {
        heading: '主なWANサービス',
        richItems: [
          [
            { text: 'レイヤ1サービス：', style: 'plain' },
            { text: '専用線', style: 'red' },
          ],
          [
            { text: 'レイヤ2サービス：', style: 'plain' },
            { text: '広域イーサネット', style: 'red' },
          ],
          [
            { text: 'レイヤ3サービス：', style: 'plain' },
            { text: 'IP-VPN', style: 'red' },
          ],
          [
            { text: '専用線を敷設する場合、利用者拠点側に、アナログ回線の場合は ', style: 'plain' },
            { text: 'DSU', style: 'red' },
            { text: '、光回線の場合は ', style: 'plain' },
            { text: 'ONU', style: 'red' },
            { text: ' という装置を設置（専用線は高額、拠点数が増えると回線が増え複雑になる）', style: 'plain' },
          ],
          [
            { text: '広域イーサネットでは、', style: 'plain' },
            { text: 'タグVLAN', style: 'red' },
            { text: ' により、異なる利用者を論理的にグループ分けする', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IP-VPN（MPLS）',
        richItems: [
          [
            { text: 'MPLS', style: 'red' },
            { text: ' というスイッチング方式を使用。パケットに ', style: 'plain' },
            { text: 'ラベル', style: 'red' },
            { text: ' と呼ばれる短い固定長のタグ情報を付与し、この情報を基にルーティング', style: 'plain' },
          ],
          [
            { text: 'ラベルには2種類：①利用者を識別するラベル／②IP-VPN網内での経路情報のための転送ラベル', style: 'plain' },
          ],
          [
            { text: '利用者拠点〜IP-VPN網の接続点：利用者が設置するルータ＝', style: 'plain' },
            { text: 'CEルータ', style: 'red' },
            { text: '、通信事業者側の利用者に近いルータ＝', style: 'plain' },
            { text: 'PEルータ', style: 'red' },
          ],
          [
            { text: '複数のプロバイダと契約した回線を冗長化する仕組み ⇒ ', style: 'plain' },
            { text: 'マルチホーミング', style: 'red' },
          ],
        ],
      },
      {
        heading: 'WAN高速化装置（WAS）',
        richItems: [
          [
            { text: 'データの ', style: 'plain' },
            { text: '圧縮', style: 'red' },
          ],
          [
            { text: 'キャッシュ', style: 'red' },
            { text: ' 蓄積（通信したデータをWASにキャッシュとして保存）', style: 'plain' },
          ],
          [
            { text: '代理応答', style: 'red' },
            { text: '：対向機器の代わりにWASがACKを返す。ターンアラウンドタイムが大きいとき効果大', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SD-WAN／PPPoE',
        richItems: [
          [
            { text: 'SD-WAN', style: 'red' },
            { text: '：', style: 'plain' },
            { text: 'SDN', style: 'red' },
            { text: ' によって制御されるIPsecルータ', style: 'plain' },
          ],
          [
            { text: 'SDNの構成：', style: 'plain' },
            { text: 'データプレーン', style: 'red' },
            { text: '（利用者の通信トラフィックを転送）／', style: 'plain' },
            { text: 'コントロールプレーン', style: 'red' },
            { text: '（通信装置を集中制御）', style: 'plain' },
          ],
          [
            { text: 'ブロードバンドからインターネットに接続するときなど、シリアル回線で使用するデータリンクのコネクション確立やデータ転送をLAN上で実現するプロトコル：', style: 'plain' },
            { text: 'PPPoE', style: 'red' },
          ],
        ],
      },
      {
        heading: 'クラウド',
        richItems: [
          [
            { text: 'SaaS', style: 'red' },
            { text: '（Software）：サーバの中のソフトウェアを提供', style: 'plain' },
          ],
          [
            { text: 'PaaS', style: 'red' },
            { text: '（Platform）：サーバの中のOS環境（プラットフォーム）を提供', style: 'plain' },
          ],
          [
            { text: 'IaaS', style: 'red' },
            { text: '（Infrastructure）：サーバやNW機器などのハードウェアを提供', style: 'plain' },
          ],
          [
            { text: 'AWS等のクラウドサービスにおいて、利用者ごとに独立した仮想ネットワークを ', style: 'plain' },
            { text: 'VPC', style: 'red' },
            { text: '（Virtual Private Cloud）という', style: 'plain' },
          ],
          [
            { text: 'ハウジング：ラックやスペースごと借りる（家みたいな）／ホスティング：レンタルサーバ（ホストとなるコンピュータ）を借りる', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：アクセス系回線（参考）',
        navyItems: [
          [
            { text: 'ADSL', style: 'navy' },
            { text: '：非対称DSL。下り最大数十Mbps。電話線使用', style: 'plain' },
          ],
          [
            { text: 'VDSL', style: 'navy' },
            { text: '：短距離高速DSL。集合住宅のFTTB構成で利用', style: 'plain' },
          ],
          [
            { text: 'FTTH', style: 'navy' },
            { text: '：光ファイバを建物内まで引き込む。', style: 'plain' },
            { text: 'PON', style: 'navy' },
            { text: '（Passive Optical Network）方式が主流', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'WANサービス：L1=専用線 / L2=広域イーサネット / L3=IP-VPN',
      'IP-VPNはMPLSのラベル方式。==CEルータ==（利用者）と==PEルータ==（事業者側）',
      'WAS：圧縮／キャッシュ／代理応答',
      'SD-WANはSDNで制御されるIPsecルータ',
      'クラウド：==SaaS==／==PaaS==／==IaaS==の階層を理解',
    ],
  },

  'load-balancer': {
    summary: '復習ノート「負荷分散装置（LB）」準拠。LBの目的・分散アルゴリズム・セッション維持機能・冗長化全体まとめを整理。',
    sections: [
      {
        heading: 'LB導入のメリット',
        richItems: [
          [
            { text: '接続先の負荷を分散 ⇒ サーバの ', style: 'plain' },
            { text: '処理能力向上', style: 'red' },
          ],
          [
            { text: '冗長性の確保（', style: 'plain' },
            { text: '可用性', style: 'red' },
            { text: ' の向上）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '負荷分散アルゴリズム',
        richItems: [
          [
            { text: '単純に順番に振り分ける方法：', style: 'plain' },
            { text: 'ラウンドロビン', style: 'red' },
          ],
          [
            { text: 'その他、最もコネクションが少ないサーバに振り分ける方式などもある', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'LBの仮想IPとセッション維持',
        richItems: [
          [
            { text: 'LBには振り分け用の ', style: 'plain' },
            { text: '仮想IPアドレス', style: 'red' },
            { text: ' と、自身の ', style: 'plain' },
            { text: '物理IPアドレス', style: 'red' },
            { text: ' がある', style: 'plain' },
          ],
          [
            { text: '同じアクセス元の2回目以降の通信を1回目と同じサーバに振り分けるためのLBの機能：', style: 'plain' },
            { text: 'セッション維持', style: 'red' },
            { text: ' 機能', style: 'plain' },
          ],
          [
            { text: 'レイヤ3方式：リクエスト元の ', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' に基づいて振り分ける', style: 'plain' },
          ],
          [
            { text: 'レイヤ7方式：Webサーバにアクセスしたユーザに関する情報を保持する ', style: 'plain' },
            { text: 'Cookie', style: 'red' },
            { text: ' に埋め込まれた ', style: 'plain' },
            { text: 'セッションID', style: 'red' },
            { text: ' に基づいて振り分ける', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'ネットワーク冗長化の仕組み・技術まとめ',
        richItems: [
          [
            { text: 'レイヤ1：', style: 'plain' },
            { text: 'スタック接続', style: 'red' },
          ],
          [
            { text: 'レイヤ2：', style: 'plain' },
            { text: 'STP', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'リンクアグリゲーション', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'チーミング', style: 'red' },
          ],
          [
            { text: 'レイヤ3：', style: 'plain' },
            { text: 'VRRP', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'ルーティング（OSPF, BGP等）', style: 'red' },
            { text: ' による冗長化（コスト値を等しくする）／', style: 'plain' },
            { text: '負荷分散装置', style: 'red' },
          ],
          [
            { text: 'レイヤ4以上：', style: 'plain' },
            { text: 'DNSラウンドロビン', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'FW独自機能', style: 'red' },
            { text: ' による冗長化', style: 'plain' },
          ],
          [
            { text: '※リンクアグリゲーション・チーミング・ルーティングはActive-Activeに設定することでスループット向上にも寄与', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'LBの仮想IPと物理IPは別物',
      'L3セッション維持＝送信元IP／L7セッション維持＝CookieのセッションID',
      '冗長化は==レイヤ別==に整理して覚える（L1スタック／L2 STP・LA／L3 VRRP・OSPF／L4以上 DNS RR・FW）',
    ],
  },

  dhcp: {
    summary: '復習ノート「DHCP」準拠。DORA・リレーエージェント・複数セグメント時の払い出し・スヌーピングを整理。',
    sections: [
      {
        heading: 'DHCPサーバの設定と利点',
        richItems: [
          [
            { text: 'DHCPサーバに設定する主な情報：', style: 'plain' },
            { text: 'サブネットマスク', style: 'red' },
            { text: '、', style: 'plain' },
            { text: 'ネットワークアドレス', style: 'red' },
            { text: '、払い出すIPアドレスの ', style: 'plain' },
            { text: '範囲', style: 'red' },
            { text: '、DNSサーバ等', style: 'plain' },
          ],
          [
            { text: 'DHCPサーバ設定の利点①：', style: 'plain' },
            { text: '固定でIPアドレスを割り当てる', style: 'red' },
            { text: ' 手間の削減', style: 'plain' },
          ],
          [
            { text: '利点②：', style: 'plain' },
            { text: '払い出したIPアドレス', style: 'red' },
            { text: ' や端末をDHCPサーバにて ', style: 'plain' },
            { text: '一元', style: 'red' },
            { text: ' 管理できる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DHCPメッセージ4種',
        richItems: [
          [
            { text: '①', style: 'plain' },
            { text: 'DHCPディスカバー', style: 'red' },
            { text: '（DISCOVER）：', style: 'plain' },
            { text: 'ブロード', style: 'red' },
            { text: 'キャスト', style: 'plain' },
          ],
          [
            { text: '②', style: 'plain' },
            { text: 'DHCPオファー', style: 'red' },
            { text: '（OFFER）', style: 'plain' },
          ],
          [
            { text: '③', style: 'plain' },
            { text: 'DHCPリクエスト', style: 'red' },
            { text: '（REQUEST）：', style: 'plain' },
            { text: 'ブロード', style: 'red' },
            { text: 'キャスト', style: 'plain' },
          ],
          [
            { text: '④', style: 'plain' },
            { text: 'DHCPアック', style: 'red' },
            { text: '（ACK）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DHCPリレーエージェント',
        richItems: [
          [
            { text: 'PCからのDHCPリクエストをルータ等が中継する仕組み ⇒ ', style: 'plain' },
            { text: 'DHCPリレーエージェント', style: 'red' },
          ],
          [
            { text: '複数のセグメントからIP要求が来た場合の払い出すIPの決め方：', style: 'plain' },
          ],
          [
            { text: 'リレーエージェントのルータ：DHCPブロードキャストを受信したインタフェース（要求元PC側）の ', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' を含めてDHCPサーバにDHCPリクエストを転送', style: 'plain' },
          ],
          [
            { text: 'DHCPサーバ：上記IPアドレスと ', style: 'plain' },
            { text: '同一セグメント', style: 'red' },
            { text: ' のIPアドレスを払い出す', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DHCPスヌーピング',
        richItems: [
          [
            { text: 'DHCPスヌーピング：スイッチングハブの機能。DHCPのパケットをのぞき見して不正な通信をブロック', style: 'plain' },
          ],
          [
            { text: '具体的に禁止する不正な接続：', style: 'plain' },
            { text: '不正なDHCPサーバ', style: 'red' },
            { text: ' からのIPアドレス取得／', style: 'plain' },
            { text: '固定でIPアドレスを割り当てた', style: 'red' },
            { text: ' PCからの接続', style: 'plain' },
          ],
          [
            { text: '不正なDHCPサーバ設置の防止：SWにおいて、DHCPスヌーピングの設定として、正規のDHCPサーバを接続する ', style: 'plain' },
            { text: 'ポート', style: 'red' },
            { text: ' を指定', style: 'plain' },
          ],
          [
            { text: 'DHCPスヌーピングでは、', style: 'plain' },
            { text: '正規', style: 'red' },
            { text: ' のDHCPサーバからIPアドレスを割り当てたPCだけを通信させる。PCの特定は ', style: 'plain' },
            { text: 'MACアドレス', style: 'red' },
            { text: ' で行う（正規DHCPサーバから払い出したDHCPのフレームを見て、許可するPCの ', style: 'plain' },
            { text: 'MACアドレス', style: 'red' },
            { text: ' を入手）', style: 'plain' },
          ],
          [
            { text: 'DHCPリレーエージェント設定時、ポートごとにスヌーピングをする／しないの設定をする（ポートを信頼するかしないか）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      '==DHCPメッセージ4種==の順序は必ず暗記（ディスカバー→オファー→リクエスト→アック）',
      'リレーエージェントはどの層の機器がどう動作するかを整理',
      'DHCPスヌーピングはDHCP/ARP攻撃両方への対策になる',
    ],
  },

  dns: {
    summary: '復習ノート「DNS」準拠。DNSの階層・コンテンツ／キャッシュ・ゾーン転送・主要レコード・冗長化・キャッシュポイズニング対策を整理。',
    sections: [
      {
        heading: 'DNSの基礎',
        richItems: [
          [
            { text: 'PC起動直後、PCからWebサーバに通信するとき最初に送られるフレームは、PC→', style: 'plain' },
            { text: 'デフォルトゲートウェイ', style: 'red' },
            { text: ' へのARP', style: 'plain' },
          ],
          [
            { text: 'DNSサーバに問い合わせを行うPCのソフトウェア：', style: 'plain' },
            { text: 'リゾルバ', style: 'red' },
          ],
          [
            { text: 'DNSは多数のDNSサーバで構成される分散型データベース。ツリー構造の頂点にあるサーバ：', style: 'plain' },
            { text: 'ルート', style: 'red' },
            { text: 'DNSサーバ', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'ゾーン転送',
        richItems: [
          [
            { text: 'ゾーン転送の流れ①：ゾーン転送を要求（', style: 'plain' },
            { text: 'セカンダリ', style: 'red' },
            { text: 'DNSサーバ→', style: 'plain' },
            { text: 'プライマリ', style: 'red' },
            { text: 'DNSサーバ）', style: 'plain' },
          ],
          [
            { text: '②ゾーン情報が更新されていた場合、ゾーン転送（', style: 'plain' },
            { text: 'プライマリ', style: 'red' },
            { text: 'DNSサーバ→', style: 'plain' },
            { text: 'セカンダリ', style: 'red' },
            { text: 'DNSサーバ）', style: 'plain' },
          ],
          [
            { text: '※プライマリDNSサーバはゾーン情報を更新すると、セカンダリにリアルタイムで更新通知（', style: 'plain' },
            { text: 'NOTIFY', style: 'red' },
            { text: 'メッセージ）を送信する', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'コンテンツDNSとキャッシュDNS',
        richItems: [
          [
            { text: 'コンテンツ', style: 'red' },
            { text: 'DNSサーバ（権威DNSサーバ）：', style: 'plain' },
            { text: 'ドメイン', style: 'red' },
            { text: ' 情報を持つ', style: 'plain' },
          ],
          [
            { text: 'キャッシュDNSサーバ（', style: 'plain' },
            { text: 'フル', style: 'red' },
            { text: ' リゾルバ）：名前解決を最後まで行う。ドメイン情報を持たず、PCからの問い合わせに対してコンテンツDNSサーバに問い合わせて回答する', style: 'plain' },
          ],
          [
            { text: '上位ドメインの権威サーバから下位ドメインの権威サーバまで繰り返して行う問い合わせ ⇒ ', style: 'plain' },
            { text: '反復', style: 'red' },
            { text: ' 問い合わせ', style: 'plain' },
          ],
          [
            { text: 'キャッシュDNSサーバの目的：①DNS問い合わせの高速化、②DNS問い合わせトラフィックの減少', style: 'plain' },
          ],
          [
            { text: 'PCのネットワーク設定で指定するDNSサーバは ', style: 'plain' },
            { text: 'キャッシュ', style: 'red' },
            { text: 'DNSサーバ', style: 'plain' },
          ],
          [
            { text: 'スタブリゾルバ：クライアントPCの名前解決ソフトウェア。PCからキャッシュDNSサーバに対する問い合わせ ⇒ ', style: 'plain' },
            { text: '再帰', style: 'red' },
            { text: ' 問い合わせ', style: 'plain' },
          ],
          [
            { text: 'hosts', style: 'red' },
            { text: ' ファイル：OS内でホスト名とIPアドレスの対応を管理するファイル（ほぼDNS）', style: 'plain' },
          ],
          [
            { text: 'DNS', style: 'plain' },
            { text: 'フォワーダ', style: 'red' },
            { text: '：フルサービスリゾルバに名前解決要求を転送するサーバ', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DNSレコード',
        richItems: [
          [
            { text: 'A', style: 'red' },
            { text: ' レコード：ホスト名に対する ', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' を登録（例：www IN A 203.0.113.123）', style: 'plain' },
          ],
          [
            { text: '同一ホスト名に対して複数のAレコードを登録すると、IPアドレスが異なる複数のサーバに ', style: 'plain' },
            { text: '負荷分散', style: 'red' },
            { text: ' が可能 ⇒ ', style: 'plain' },
            { text: 'DNSラウンドロビン', style: 'red' },
          ],
          [
            { text: 'MX', style: 'red' },
            { text: ' レコード：メールサーバの ', style: 'plain' },
            { text: 'FQDN', style: 'red' },
            { text: '、プライオリティ（例：(ドメイン名) IN MX 10 mx1.mamiya.com）。MXレコードの ', style: 'plain' },
            { text: 'プリファレンス', style: 'red' },
            { text: ' は ', style: 'plain' },
            { text: '小さい', style: 'red' },
            { text: ' 方が優先', style: 'plain' },
          ],
          [
            { text: 'CNAMEレコード：', style: 'plain' },
            { text: 'ホスト名', style: 'red' },
            { text: ' に別名をつける（例：web.name.com. IN CNAME www.betumei.com）', style: 'plain' },
          ],
          [
            { text: 'NS', style: 'red' },
            { text: ' レコード：そのゾーン自身や下位ドメインに関するDNSサーバのホスト名を指定する', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DNSの冗長化',
        richItems: [
          [
            { text: 'VRRPとの違い：VRRPは1台だけActive、DNSでは複数台のサーバがActive', style: 'plain' },
          ],
          [
            { text: 'DNSでは、設定情報を ', style: 'plain' },
            { text: 'マスタ', style: 'red' },
            { text: 'DNSサーバから ', style: 'plain' },
            { text: 'スレーブ', style: 'red' },
            { text: 'DNSサーバにコピー（VRRPは両方に設定情報を投入）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DNSのセキュリティ',
        richItems: [
          [
            { text: 'コンテンツDNSサーバ：', style: 'plain' },
            { text: 'DMZ', style: 'red' },
            { text: ' 内（外部からの問い合わせに応答するため、フルリゾルバ機能は無効にする）', style: 'plain' },
          ],
          [
            { text: 'キャッシュDNSサーバ：', style: 'plain' },
            { text: '内部LAN', style: 'red' },
            { text: '（外部からの問い合わせを拒否するため。社内PCからのDNS問合せのみ受け付ける）', style: 'plain' },
          ],
          [
            { text: '内部DNSサーバ：', style: 'plain' },
            { text: '内部LAN', style: 'red' },
            { text: ' のゾーン情報を管理。当該ゾーンに存在しないホストの名前解決要求は外部DNSサーバに転送（転送の観点から「', style: 'plain' },
            { text: 'フォワーダ', style: 'red' },
            { text: '」とよぶ）', style: 'plain' },
          ],
          [
            { text: 'DNSキャッシュポイズニング', style: 'red' },
            { text: ' 攻撃：DNSサーバに偽のDNS情報を入れ、利用者に ', style: 'plain' },
            { text: '偽サイト', style: 'red' },
            { text: ' ', style: 'plain' },
            { text: 'にアクセス', style: 'red' },
            { text: ' させるサイバー攻撃', style: 'plain' },
          ],
          [
            { text: 'DNSサーバは、DNS問合せに関して、複数の応答があった場合、', style: 'plain' },
            { text: '先', style: 'red' },
            { text: ' にきた情報を正しいと判断する', style: 'plain' },
          ],
          [
            { text: 'DNSキャッシュポイズニングを成功させる方法：IPアドレスやポート番号を正しく偽装する必要／全ての問合せIDを付与してパケットを送信する', style: 'plain' },
          ],
          [
            { text: '対策①：送信元 ', style: 'plain' },
            { text: 'ポート番号', style: 'red' },
            { text: ' のランダム化', style: 'plain' },
          ],
          [
            { text: '対策②：DNSサーバを、', style: 'plain' },
            { text: 'コンテンツ', style: 'red' },
            { text: ' サーバと ', style: 'plain' },
            { text: 'キャッシュ', style: 'red' },
            { text: ' サーバに分け、', style: 'plain' },
            { text: 'キャッシュ', style: 'red' },
            { text: ' サーバを内部LANに配置', style: 'plain' },
          ],
          [
            { text: '対策③：DNSSEC ⇒ ', style: 'plain' },
            { text: 'デジタル署名', style: 'red' },
            { text: ' を用いて、DNSキャッシュサーバの応答が正しく、', style: 'plain' },
            { text: '改ざん', style: 'red' },
            { text: ' されていないことを確認', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'コンテンツDNS（権威）と==キャッシュDNS（フルリゾルバ）==を分けて配置',
      '==反復==問い合わせ（フル → 権威）と==再帰==問い合わせ（PC → フル）の違い',
      'Aレコード複数登録 ⇒ ==DNSラウンドロビン==',
      'MXは数値の==小さい==方が優先',
      'コンテンツDNSは==DMZ==、キャッシュDNSは==内部LAN==',
      'DNSSECは==デジタル署名==で改ざん検知',
    ],
  },

  mail: {
    summary: '復習ノート「メール」準拠。SMTP系・POP3/IMAP4・SMTPセッション・OP25B・SPF・DKIM・配置を整理。',
    sections: [
      {
        heading: 'メール送信プロトコル',
        richItems: [
          [
            { text: 'SMTP：メール送信プロトコル（SimpleにMailをTransferする）。ポート番号：', style: 'plain' },
            { text: '25', style: 'red' },
            { text: '。認証機能が無い', style: 'plain' },
          ],
          [
            { text: 'SMTPを改良して認証を加えたプロトコル例：', style: 'plain' },
            { text: 'POP', style: 'red' },
            { text: ' before ', style: 'plain' },
            { text: 'SMTP', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'SMTP AUTH', style: 'red' },
            { text: '（ユーザ名とパスワードで認証、ポート番号：', style: 'plain' },
            { text: '587', style: 'red' },
            { text: '）', style: 'plain' },
          ],
          [
            { text: 'SMTPS（SMTP over TLS）：非暗号のSMTP通信をTLSで暗号化するもの。ポート番号：', style: 'plain' },
            { text: '465', style: 'red' },
          ],
        ],
      },
      {
        heading: 'メール受信プロトコル',
        richItems: [
          [
            { text: 'POP3：メール受信プロトコル。ポート番号：', style: 'plain' },
            { text: '110', style: 'red' },
            { text: '。問題点：', style: 'plain' },
            { text: '複数のPC', style: 'red' },
            { text: ' から ', style: 'plain' },
            { text: '同じメールを読む', style: 'red' },
            { text: ' ことが不可能', style: 'plain' },
          ],
          [
            { text: 'POP3を改良したプロトコル：', style: 'plain' },
            { text: 'IMAP4', style: 'red' },
            { text: '。ポート番号：', style: 'plain' },
            { text: '143', style: 'red' },
            { text: '。サーバ上でメールを保管・管理する', style: 'plain' },
          ],
          [
            { text: 'POP3S：POP通信をSSLで暗号化するプロトコル。ポート番号：', style: 'plain' },
            { text: '995', style: 'red' },
          ],
        ],
      },
      {
        heading: 'SMTPセッション・エンベロープ情報',
        richItems: [
          [
            { text: 'HELO', style: 'red' },
            { text: '（または EHLO）：通信の開始', style: 'plain' },
          ],
          [
            { text: 'MAIL FROM', style: 'red' },
            { text: '：送信元メールアドレスの通知', style: 'plain' },
          ],
          [
            { text: 'RCPT TO', style: 'red' },
            { text: '：宛先メールアドレスの通知', style: 'plain' },
          ],
          [
            { text: 'DATA：本文', style: 'plain' },
          ],
          [
            { text: 'エンベロープ情報のメアド：Envelope-FROM', style: 'plain' },
          ],
          [
            { text: 'メールヘッダのメアド：', style: 'plain' },
            { text: 'Header', style: 'red' },
            { text: ' FROM', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'メールセキュリティ',
        richItems: [
          [
            { text: 'メールサーバにおいて、他社から他社へのメールが転送できてしまう状態：', style: 'plain' },
            { text: 'オープンリレー', style: 'red' },
            { text: '（迷惑メールの踏み台に使われるリスク大）', style: 'plain' },
          ],
          [
            { text: 'メールの踏み台の対策として自社メールサーバで行う設定：', style: 'plain' },
            { text: '宛先が自社以外のメールアドレス以外は中継処理しない', style: 'red' },
          ],
          [
            { text: 'SMTPは認証をせずにメールを送れるので、攻撃者が自分の身元を隠して大量の迷惑メール送信が可能', style: 'plain' },
          ],
          [
            { text: 'OP25B', style: 'red' },
            { text: '：動的IPアドレスのPCから外部のネットワークへのSMTP送信（', style: 'plain' },
            { text: '25', style: 'red' },
            { text: '番ポート）を禁止する仕組み。', style: 'plain' },
            { text: '内部のメールサーバ', style: 'red' },
            { text: ' への送信と、', style: 'plain' },
            { text: '固定IPアドレス', style: 'red' },
            { text: ' からの送信は禁止されない', style: 'plain' },
          ],
          [
            { text: '外部のメールサーバを利用してメールを送信したい場合：', style: 'plain' },
            { text: 'サブミッション', style: 'red' },
            { text: ' ポート（ポート番号 ', style: 'plain' },
            { text: '587', style: 'red' },
            { text: '）を使い、SMTP-AUTHによって認証する', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SPFによるなりすまし防止',
        richItems: [
          [
            { text: 'DNSのTXTレコードに記載された送信メールサーバの ', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' と、受信したパケットの送信元IPアドレスを比較して認証する', style: 'plain' },
          ],
          [
            { text: '注意：DNSのMXレコードに記載されるメールサーバは ', style: 'plain' },
            { text: '受信', style: 'red' },
            { text: ' サーバの ', style: 'plain' },
            { text: 'FQDN', style: 'red' },
            { text: '／DNSのTXTレコードに記載されるメールサーバは ', style: 'plain' },
            { text: '送信', style: 'red' },
            { text: ' メールサーバの ', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
          ],
          [
            { text: '受信したパケットのメールアドレスは、', style: 'plain' },
            { text: 'Envelope', style: 'red' },
            { text: '-FROMを使って検証する', style: 'plain' },
          ],
          [
            { text: 'SPF運用：送信側 — ', style: 'plain' },
            { text: 'DNSサーバのTXTレコードに送信サーバのIPア', style: 'red' },
            { text: 'ドレスを入れる', style: 'red' },
          ],
          [
            { text: 'SPF運用：受信側 — メールサーバを ', style: 'plain' },
            { text: 'SPF対応', style: 'red' },
            { text: ' にする（送信側のメールサーバにTXTレコードを問い合わせる動作をさせる）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'DKIM・配置',
        richItems: [
          [
            { text: 'DKIM：送信メールサーバでデジタル署名を電子メールのヘッダに付与して、受信側メールサーバで検証する', style: 'plain' },
          ],
          [
            { text: '外部メールサーバ：', style: 'plain' },
            { text: 'DMZ', style: 'red' },
            { text: ' に設置（', style: 'plain' },
            { text: 'インターネット', style: 'red' },
            { text: ' からの通信を受け付ける必要があるから）', style: 'plain' },
          ],
          [
            { text: '内部メールサーバ：社内LANに設置（外部から通信できないセグメントにメールボックスを設置するため）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'SMTP=25 / SMTP AUTH=587 / SMTPS=465 / POP3=110 / POP3S=995 / IMAP4=143',
      'SMTP コマンド HELO → MAIL FROM → RCPT TO → DATA',
      'OP25Bは==動的IP==からの==25==番ポートSMTP送信を禁止',
      'SPFの送信側はDNSの==TXT==レコードにIPを登録、受信側はEnvelope-FROMで照合',
      'DKIMは==デジタル署名==でなりすましと改ざんを検知',
    ],
  },

  voip: {
    summary: '復習ノート「音声とVoIP」準拠。VoIP・呼制御（SIP）・RTP・SDP・音声符号化・B2BUAを整理。',
    sections: [
      {
        heading: '音声通話の基礎',
        richItems: [
          [
            { text: '一回の通話＝呼。単位時間当たりの呼＝呼量（単位：アーラン）', style: 'plain' },
          ],
          [
            { text: 'VoIP：音声をパケット化してIP上で通信する技術（一般的にアナログ信号の音声がデジタル信号に変換される）', style: 'plain' },
          ],
          [
            { text: 'アナログ電話機の音声をVoIP化するときに利用される機器：VoIPゲートウェイ', style: 'plain' },
          ],
          [
            { text: '普通のアナログ電話機：アナログ電話線を使用、アナログ電話用のプロトコル', style: 'plain' },
          ],
          [
            { text: 'IP電話機：LANケーブルを使用、IPを使用', style: 'plain' },
          ],
        ],
      },
      {
        heading: '呼制御（SIP）',
        richItems: [
          [
            { text: '呼制御：電話をかけたり相手を呼び出したり切断したりする制御', style: 'plain' },
          ],
          [
            { text: '呼制御を行う代表的なプロトコル：', style: 'plain' },
            { text: 'SIP', style: 'red' },
          ],
          [
            { text: '呼制御を行う代表的な機器：', style: 'plain' },
            { text: 'SIPサーバ', style: 'red' },
            { text: '、', style: 'plain' },
            { text: 'IP-PBX', style: 'red' },
          ],
          [
            { text: 'VoIPで電話をかけるときの流れ — 電話機1→SIPサーバ：通話要求（', style: 'plain' },
            { text: 'INVITE', style: 'red' },
            { text: ' メッセージ）を送る', style: 'plain' },
          ],
          [
            { text: 'SIPサーバで：電話情報のデータベースから該当するIPアドレスを検索／通話相手の電話機2に通話要求を転送', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'RTP・SDP',
        richItems: [
          [
            { text: '音声通話に用いるプロトコル：', style: 'plain' },
            { text: 'RTP', style: 'red' },
            { text: '。アプリケーション層のプロトコル。トランスポート層には ', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: ' を用いる', style: 'plain' },
          ],
          [
            { text: '電話機間において、SIPはSIPサーバを経由するが、', style: 'plain' },
            { text: 'RTP', style: 'red' },
            { text: ' ではSIPサーバを ', style: 'plain' },
            { text: '経由しない', style: 'red' },
          ],
          [
            { text: 'SIPメッセージのヘッダ：通話元・通話先等の情報が記載', style: 'plain' },
          ],
          [
            { text: 'SIPメッセージのボディ部：', style: 'plain' },
            { text: 'SDP', style: 'red' },
            { text: ' というセッション記述プロトコルに従う', style: 'plain' },
          ],
          [
            { text: '音声通話のシーケンス：INVITE → 200 OK → ACK で通話開始／切るときは ', style: 'plain' },
            { text: 'BYE', style: 'red' },
          ],
        ],
      },
      {
        heading: '音声符号化・B2BUA',
        richItems: [
          [
            { text: 'PCM：', style: 'plain' },
            { text: '64', style: 'red' },
            { text: ' kbps', style: 'plain' },
          ],
          [
            { text: 'CS-ACELP：', style: 'plain' },
            { text: '8', style: 'red' },
            { text: ' kbps', style: 'plain' },
          ],
          [
            { text: '異なるSIPネットワーク間の境界に配置される仲介役 ⇒ ', style: 'plain' },
            { text: 'B2B UA', style: 'red' },
            { text: '。具体的な装置：VoIPゲートウェイが該当', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：QoS（参考）',
        navyItems: [
          [
            { text: 'ジッタ', style: 'navy' },
            { text: '：パケット到着間隔のばらつき。ジッタバッファで吸収するが遅延が増加', style: 'plain' },
          ],
          [
            { text: 'DSCP', style: 'navy' },
            { text: '（Differentiated Services Code Point）：IPヘッダのTOSフィールド上位', style: 'plain' },
            { text: '6', style: 'navy' },
            { text: 'ビット。', style: 'plain' },
            { text: 'EF', style: 'navy' },
            { text: '（Expedited Forwarding）が音声に最適', style: 'plain' },
          ],
          [
            { text: '推奨遅延：片方向', style: 'plain' },
            { text: '150', style: 'navy' },
            { text: 'ms以内／ジッタ：', style: 'plain' },
            { text: '30', style: 'navy' },
            { text: 'ms以内／パケットロス：', style: 'plain' },
            { text: '1', style: 'navy' },
            { text: '%以下', style: 'plain' },
          ],
          [
            { text: 'RTCP', style: 'navy' },
            { text: '：RTPと対で動作しQoS統計（パケットロス率・ジッタ・RTT）を報告', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'SIPはシグナリング、RTPはメディア（実音声）',
      'RTPは==SIPサーバを経由しない==',
      'SIPシーケンス：INVITE → 200 OK → ACK → BYE',
      'PCM=64kbps / CS-ACELP=8kbps',
      'B2BUAは異なるSIP網の境界（VoIPゲートウェイが該当）',
    ],
  },

  ipsec: {
    summary: '復習ノート「IPsecとGRE」準拠。インターネットVPN・IPsec（ESP/AH/IKE）・通信モード・通信フェーズ・NATトラバーサル・GRE・GRE over IPsecを整理。',
    sections: [
      {
        heading: 'インターネットVPN／IPsec基礎',
        richItems: [
          [
            { text: '暗号化によって ', style: 'plain' },
            { text: '盗聴', style: 'red' },
            { text: ' は防げるが、暗号化だけでは ', style: 'plain' },
            { text: '改ざん', style: 'red' },
            { text: ' や ', style: 'plain' },
            { text: 'なりすまし', style: 'red' },
            { text: ' の脅威は防げない。これらは適切にVPNを用いることで対処が可能', style: 'plain' },
          ],
          [
            { text: 'インターネットVPN：インターネット上に構築する仮想的なネットワーク。専用線や広域イーサに比べて ', style: 'plain' },
            { text: '安価', style: 'red' },
            { text: '・広帯域なWANを構築可能', style: 'plain' },
          ],
          [
            { text: 'IP-VPNとの違い：IP-VPNは通信事業者の ', style: 'plain' },
            { text: '閉域IP網', style: 'red' },
            { text: '／インターネットVPNはインターネット回線を用いる。インターネットVPNはIP-VPNより安価だが ', style: 'plain' },
            { text: 'セキュリティリスク', style: 'red' },
            { text: ' は高い', style: 'plain' },
          ],
          [
            { text: 'IPsec：', style: 'plain' },
            { text: '認証', style: 'red' },
            { text: ' と ', style: 'plain' },
            { text: '暗号化', style: 'red' },
            { text: ' の機能を持った規格', style: 'plain' },
          ],
          [
            { text: 'ESP', style: 'red' },
            { text: '：', style: 'plain' },
            { text: '暗号化と認証', style: 'red' },
            { text: ' の両方の機能をもつ', style: 'plain' },
          ],
          [
            { text: 'AH', style: 'red' },
            { text: '：', style: 'plain' },
            { text: '認証の機能のみ', style: 'red' },
            { text: ' をもつ', style: 'plain' },
          ],
          [
            { text: 'ESPヘッダには、TCPとUDPと違って ', style: 'plain' },
            { text: 'ポート番号', style: 'red' },
            { text: ' が無い', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IPsecの通信モード',
        richItems: [
          [
            { text: 'トランスポート', style: 'red' },
            { text: ' モード：端末間でIPsec通信を行う', style: 'plain' },
          ],
          [
            { text: 'トンネル', style: 'red' },
            { text: ' モード：VPN装置間でIPsec通信を行う（VPNルータにIPsec設定をすればPCに個別のIPsec設定が不要のため、一般的な企業間でよく利用）', style: 'plain' },
          ],
          [
            { text: 'トンネルモードにする目的：', style: 'plain' },
            { text: 'プライベートIPアドレス', style: 'red' },
            { text: ' のままだと通信できないから。両端が ', style: 'plain' },
            { text: 'グローバルアドレス', style: 'red' },
            { text: ' ならトランスポートモードでOK', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IKE（鍵交換）と通信フェーズ',
        richItems: [
          [
            { text: 'IPsecにおける鍵交換プロトコル：', style: 'plain' },
            { text: 'IKE', style: 'red' },
            { text: '。ポート番号：', style: 'plain' },
            { text: '500', style: 'red' },
          ],
          [
            { text: 'IKEのモード：', style: 'plain' },
            { text: 'メイン', style: 'red' },
            { text: ' モード（接続相手のVPN装置が ', style: 'plain' },
            { text: '固定IPアドレス', style: 'red' },
            { text: '。双方とも固定IPでなければ通信できない。利点：IPアドレスを使って認証するのでセキュリティが強固）', style: 'plain' },
          ],
          [
            { text: 'アグレッシブ', style: 'red' },
            { text: ' モード（接続相手が ', style: 'plain' },
            { text: '動的IPアドレス', style: 'red' },
            { text: '。接続先のIPアドレスを認証情報として利用しない。利点：固定IP取得費用がかからずコスト面で有利）', style: 'plain' },
          ],
          [
            { text: 'IKEフェーズ1：', style: 'plain' },
            { text: 'ISAKMP SA', style: 'red' },
            { text: ' と呼ばれる制御用のSAを生成。SA: Security Association（セッション的なやつ）。暗号化方式などの決定と暗号鍵の生成。このSAをフェーズ2で利用', style: 'plain' },
          ],
          [
            { text: 'IKEフェーズ2：', style: 'plain' },
            { text: 'IPsec SA', style: 'red' },
            { text: ' と呼ばれる通信用のSAを生成。暗号化方式などの決定と暗号鍵の生成。このSAをIPsec通信で使用', style: 'plain' },
          ],
          [
            { text: 'IPsec通信：', style: 'plain' },
            { text: 'セキュアな通信', style: 'red' },
          ],
          [
            { text: 'SAの生存時間：', style: 'plain' },
            { text: 'ライフタイム', style: 'red' },
            { text: '（終了するとSAは消滅）。再生成の処理を ', style: 'plain' },
            { text: 'リキー', style: 'red' },
            { text: '（ReKey）という。一定時間でSAを廃止する理由：第三者による暗号解読を防ぐため', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'ESPパケットとNATトラバーサル',
        richItems: [
          [
            { text: 'ESPパケットの構造（下図）。暗号化範囲はピンク〜紫の部分', style: 'plain' },
          ],
          [
            { text: 'IPsecではTCP（UDP）ヘッダが ', style: 'plain' },
            { text: '暗号化', style: 'red' },
            { text: ' される ⇒ NATがあると ', style: 'plain' },
            { text: 'ポート番号', style: 'red' },
            { text: ' がないため通信に失敗することがある', style: 'plain' },
          ],
          [
            { text: 'NATトラバーサル', style: 'red' },
            { text: ' という技術を使い、ESPパケットに ', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: ' パケットを付与する（下図：トランスポートモード+NAT-T）', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'ESPパケット — トランスポートモード',
            rows: [
              {
                cells: [
                  { label: 'オリジナル\nIPヘッダ', bg: '#dbeafe' },
                  { label: 'ESP\nヘッダ',         bg: '#fce7f3' },
                  { label: 'TCP',                 bg: '#e9d5ff' },
                  { label: 'データ',              bg: '#e9d5ff' },
                  { label: 'ESP\nトレーラ',       bg: '#e9d5ff' },
                  { label: 'ESP\n認証データ',     bg: '#fce7f3' },
                ],
              },
            ],
            caption: 'ピンク（ESPヘッダ／認証データ）が認証範囲。紫（TCP〜トレーラ）が暗号化範囲。',
          },
          {
            title: 'ESPパケット — トンネルモード（IPヘッダを新しく付与）',
            rows: [
              {
                cells: [
                  { label: '新IP\nヘッダ',        bg: '#fef3c7' },
                  { label: 'ESP\nヘッダ',         bg: '#fce7f3' },
                  { label: 'オリジナル\nIPヘッダ', bg: '#e9d5ff' },
                  { label: 'TCP',                 bg: '#e9d5ff' },
                  { label: 'データ',              bg: '#e9d5ff' },
                  { label: 'ESP\nトレーラ',       bg: '#e9d5ff' },
                  { label: 'ESP\n認証データ',     bg: '#fce7f3' },
                ],
              },
            ],
            caption: 'オリジナルIPヘッダごと暗号化される。VPN装置間のトンネル化。',
          },
          {
            title: 'ESPパケット — トランスポートモード + NAT-T（UDPカプセル化）',
            rows: [
              {
                cells: [
                  { label: '新IP\nヘッダ',        bg: '#fef3c7' },
                  { label: '新UDP\nヘッダ',       bg: '#bae6fd' },
                  { label: 'オリジナル\nIPヘッダ', bg: '#dbeafe' },
                  { label: 'ESP\nヘッダ',         bg: '#fce7f3' },
                  { label: '暗号化された\nデータ', bg: '#e9d5ff' },
                  { label: 'ESP\n認証データ',     bg: '#fce7f3' },
                ],
              },
            ],
            caption: '青のUDPヘッダを追加することで、NAPT越えを実現する（NATトラバーサル）。',
          },
        ],
      },
      {
        heading: 'IPsecの接続方式',
        richItems: [
          [
            { text: 'ハブアンドスポーク', style: 'red' },
            { text: ' 方式：本社などをハブとし、支店をスポークとして接続する構成。利点：', style: 'plain' },
            { text: '安価', style: 'red' },
          ],
          [
            { text: 'フルメッシュ', style: 'red' },
            { text: ' 方式：全ての拠点でIPsecトンネルを張る構成。利点：', style: 'plain' },
            { text: '信頼性が高い', style: 'red' },
          ],
          [
            { text: 'NHRP', style: 'red' },
            { text: '：動的にIPsecを確立するためのプロトコル（Next Hop Resolution Protocol）。IPsecトンネル確立に必要な対向側IPアドレス情報を、トンネル確立時に動的に得るのに利用される', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'GRE（Generic Routing Encapsulation）',
        richItems: [
          [
            { text: 'レイヤ', style: 'plain' },
            { text: '3', style: 'red' },
            { text: ' のトンネルプロトコル', style: 'plain' },
          ],
          [
            { text: 'IPsecと比べた違い：GREは通信を ', style: 'plain' },
            { text: '暗号化しない', style: 'red' },
          ],
          [
            { text: 'GREは ', style: 'plain' },
            { text: 'マルチキャスト', style: 'red' },
            { text: ' も転送できる（IPsec単独は ', style: 'plain' },
            { text: 'ユニキャスト', style: 'red' },
            { text: ' のみ）', style: 'plain' },
          ],
          [
            { text: 'GREによるマルチキャスト転送の活用：複数拠点間で ', style: 'plain' },
            { text: 'OSPF', style: 'red' },
            { text: ' のようなルーティングプロトコルを使用するケース（OSPFのLSA交換はマルチキャストが必要）', style: 'plain' },
          ],
          [
            { text: 'IPsec上でGREを動作させる技術：', style: 'plain' },
            { text: 'GRE over IPsec', style: 'red' },
            { text: '。', style: 'plain' },
            { text: '暗号化', style: 'red' },
            { text: ' できない・', style: 'plain' },
            { text: 'マルチキャスト', style: 'red' },
            { text: ' できない弱点を補完', style: 'plain' },
          ],
          [
            { text: 'GRE等でヘッダを付与すると、', style: 'plain' },
            { text: 'MTU', style: 'red' },
            { text: ' サイズが ', style: 'plain' },
            { text: '1500', style: 'red' },
            { text: ' バイトを超え ', style: 'plain' },
            { text: 'フラグメント', style: 'red' },
            { text: ' が発生する場合があるため、ルータ等でMTUを調整する必要がある', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'AHは==暗号化なし==、ESPは==暗号化あり==',
      'トランスポートモード＝端末間／トンネルモード＝VPN装置間',
      'IKEはUDP==500==、IKEフェーズ1（ISAKMP SA）→ フェーズ2（IPsec SA）',
      'メインモード（固定IP）／アグレッシブモード（動的IP）',
      'NATトラバーサルはESPに==UDP==ヘッダを付与（ESPにポート番号が無いため）',
      'GRE over IPsec：暗号化＋マルチキャスト両立',
    ],
  },

  sdn: {
    summary: '復習ノート「SDN」準拠。代表技術OpenFlow、OFC／OFSの役割分担、メッセージの種類、フローテーブルを整理。',
    sections: [
      {
        heading: 'SDN（Software Defined Network）',
        richItems: [
          [
            { text: '代表的な技術：', style: 'plain' },
            { text: 'OpenFlow', style: 'red' },
          ],
          [
            { text: '従来のNW機器は1台で①管理・制御機能、②データ転送機能を実現', style: 'plain' },
          ],
          [
            { text: 'OpenFlowでは：', style: 'plain' },
            { text: 'OFC', style: 'red' },
            { text: '（OpenFlowコントローラ）が①管理制御機能／', style: 'plain' },
            { text: 'OFS', style: 'red' },
            { text: '（OpenFlowスイッチ）が②データ転送', style: 'plain' },
          ],
          [
            { text: 'OFSは起動するとOFCとの間でTCPコネクションを確立し、OFCはOFSの存在を知る', style: 'plain' },
          ],
          [
            { text: 'OFCの導入時には、自分のIPアドレスとOFCのIPアドレスさえ設定すればよいので導入が容易（VLAN・STP・NWの各種設定は不要）', style: 'plain' },
          ],
          [
            { text: 'OFCからフローテーブルの作成や更新が行われ、OFSに通信メッセージが送られる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'OpenFlowメッセージ',
        richItems: [
          [
            { text: 'OFSとOFCは管理のための専用ネットワークを介して通信メッセージを交換する', style: 'plain' },
          ],
          [
            { text: 'Packet-In', style: 'red' },
            { text: '：OFSがOFCにパケットの処理方法を問い合わせるメッセージ', style: 'plain' },
          ],
          [
            { text: 'Packet-Out', style: 'red' },
            { text: '：OFCがOFSにパケットの送信指示を出すメッセージ', style: 'plain' },
          ],
          [
            { text: 'Flow Mod', style: 'red' },
            { text: '：OFCがOFSにフローテーブルの登録・変更の指示を出すメッセージ', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'フローテーブルとエントリ',
        richItems: [
          [
            { text: '管理テーブル：どのようなときにどう動作するか記載したルール（エントリ）', style: 'plain' },
          ],
          [
            { text: 'エントリは ', style: 'plain' },
            { text: 'パケット識別子', style: 'red' },
            { text: '（', style: 'plain' },
            { text: 'MF: Match Field', style: 'red' },
            { text: '）と ', style: 'plain' },
            { text: 'パケットの処理（Action）', style: 'red' },
            { text: ' からなる', style: 'plain' },
          ],
          [
            { text: 'MFの例：IPアドレス、MACアドレス、プロトコル、ポート番号など', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'OFC＝管理制御／OFS＝データ転送 の分離が SDN の根幹',
      'メッセージは Packet-In／Packet-Out／Flow Mod の3種',
      'エントリは MF（Match Field）＋Action',
      'SD-WAN は SDN によって制御される IPsecルータ',
    ],
  },

  security: {
    summary: '復習ノート「セキュリティ」準拠。標的型攻撃・認証（チャレンジレスポンス・証明書）・SSO・SSL/TLSを整理。SSL-VPN は SSL/TLS・PKI ノートを参照。',
    sections: [
      {
        heading: '標的型攻撃',
        richItems: [
          [
            { text: '標的型攻撃では、攻撃者はマルウェアを送り込み、侵入したマルウェアが ', style: 'plain' },
            { text: 'C&Cサーバ', style: 'red' },
            { text: ' を経由して命令を送る', style: 'plain' },
          ],
          [
            { text: 'FWで外部から通信を全て拒否しているのにPCで遠隔操作できる理由：FWで内部LAN→外部NWの通信が許可されている場合、マルウェアからC&Cサーバに接続させ、その応答パケットで命令を送れるため', style: 'plain' },
          ],
          [
            { text: 'マルウェアがC&Cサーバと通信しないようにするためには、', style: 'plain' },
            { text: 'プロキシ', style: 'red' },
            { text: ' サーバの導入が有効。内部LANからインターネットへの通信は、プロキシサーバ経由でのみ許可する（プロキシサーバの設定を知らないマルウェアに有効）', style: 'plain' },
          ],
          [
            { text: 'プロキシサーバの設定を調査してくるマルウェアへの対策：プロキシサーバで ', style: 'plain' },
            { text: '認証', style: 'red' },
            { text: ' 設定を行う', style: 'plain' },
          ],
        ],
      },
      {
        heading: '認証',
        richItems: [
          [
            { text: 'チャレンジ・レスポンス認証：NWを介してパスワードを安全に送信する仕組み（乱数を暗号化して共通鍵を確認）', style: 'plain' },
          ],
          [
            { text: 'レスポンス自体は第三者に盗聴される可能性がある。安全な理由：利用者は毎回 ', style: 'plain' },
            { text: '異なるパスワード（レスポンス）', style: 'red' },
            { text: ' をサーバに送ることになるから', style: 'plain' },
          ],
          [
            { text: 'ディジタル証明書：本人の ', style: 'plain' },
            { text: '公開鍵', style: 'red' },
            { text: ' であることを証明する', style: 'plain' },
          ],
          [
            { text: 'ルート', style: 'red' },
            { text: ' 証明書：認証局（CA）の公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'サーバ', style: 'red' },
            { text: ' 証明書：サーバの公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'クライアント', style: 'red' },
            { text: ' 証明書：クライアント（PC）の公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'クライアント証明書をPCに配布する際にPC側で必要な情報 ⇒ クライアントの ', style: 'plain' },
            { text: '秘密鍵', style: 'red' },
            { text: '（無いとデータの暗号化ができない）。「クライアント証明書」ときたら「秘密鍵」!', style: 'plain' },
          ],
          [
            { text: '証明書の中には公開鍵がある。持ち主はメッセージのハッシュ値を秘密鍵で暗号化して送る', style: 'plain' },
          ],
          [
            { text: 'サーバ証明書では、接続するFQDNと証明書の ', style: 'plain' },
            { text: 'CN', style: 'red' },
            { text: ' が一致しているか確認する', style: 'plain' },
          ],
          [
            { text: 'CAは誰でも作れる。信頼できる認証機関＝', style: 'plain' },
            { text: '第三者認証局', style: 'red' },
          ],
          [
            { text: 'CAサーバの自社運用は、セキュリティ対策や故障対応で手間がかかる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SSO（シングルサインオン）',
        richItems: [
          [
            { text: 'リバースプロキシ', style: 'red' },
            { text: ' 方式と ', style: 'plain' },
            { text: 'エージェント', style: 'red' },
            { text: ' 方式がある', style: 'plain' },
          ],
          [
            { text: 'ネスペにおけるSSOの問題は基本的に国語', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SSL/TLS',
        richItems: [
          [
            { text: 'Secure Socket Layer / Transport Layer Security — データを暗号化したり認証したりしてセキュアな通信路を確保するプロトコル', style: 'plain' },
          ],
          [
            { text: '代表例：HTTPS（HTTP over SSL/TLS）。ポート番号は ', style: 'plain' },
            { text: '443', style: 'red' },
          ],
          [
            { text: 'SSLの通信シーケンス①：クライアント→サーバ：', style: 'plain' },
            { text: 'Client Hello', style: 'red' },
            { text: ' を送信。利用可能な暗号化アルゴリズムの一覧を伝える', style: 'plain' },
          ],
          [
            { text: 'SSLの通信シーケンス②：サーバ→クライアント：', style: 'plain' },
            { text: 'Server Hello', style: 'red' },
            { text: ' を送信。使用するアルゴリズムを通知する', style: 'plain' },
          ],
          [
            { text: 'TLS通信の前は認証・鍵交換で、暗号化アルゴリズムを使用', style: 'plain' },
          ],
          [
            { text: 'ハッシュはメッセージ認証', style: 'plain' },
          ],
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：TLSハンドシェイク（参考）',
        navyItems: [
          [
            { text: '①', style: 'plain' },
            { text: 'ClientHello', style: 'navy' },
            { text: '（TLSバージョン・乱数・暗号スイート候補）', style: 'plain' },
          ],
          [
            { text: '②', style: 'plain' },
            { text: 'ServerHello', style: 'navy' },
            { text: '（選択した暗号スイート）+ Certificate（サーバ証明書）+ ServerHelloDone', style: 'plain' },
          ],
          [
            { text: '③', style: 'plain' },
            { text: 'ClientKeyExchange', style: 'navy' },
            { text: '（プリマスタシークレット送付）', style: 'plain' },
          ],
          [
            { text: '④', style: 'plain' },
            { text: 'ChangeCipherSpec', style: 'navy' },
            { text: ' + Finished（マスタシークレットで鍵生成、以降暗号化）', style: 'plain' },
          ],
          [
            { text: 'TLS 1.3', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '0-RTT', style: 'navy' },
            { text: '／RSA鍵交換廃止（ECDHEのみ）／前方秘匿性', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：認証連携（参考）',
        navyItems: [
          [
            { text: 'RADIUS', style: 'navy' },
            { text: '：サプリカント／NAS（Authenticator）／RADIUSサーバ。AAA。', style: 'plain' },
            { text: 'UDP 1812', style: 'navy' },
            { text: '（認証）／', style: 'plain' },
            { text: 'UDP 1813', style: 'navy' },
            { text: '（アカウンティング）', style: 'plain' },
          ],
          [
            { text: 'LDAP', style: 'navy' },
            { text: '：X.500ベース。', style: 'plain' },
            { text: 'TCP 389', style: 'navy' },
            { text: '（平文）／', style: 'plain' },
            { text: 'TCP 636', style: 'navy' },
            { text: '（LDAPS）', style: 'plain' },
          ],
          [
            { text: 'Kerberos', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'TGT', style: 'navy' },
            { text: ' → ', style: 'plain' },
            { text: 'ST', style: 'navy' },
            { text: ' の2段階チケット認証', style: 'plain' },
          ],
          [
            { text: 'SAML', style: 'navy' },
            { text: '：XMLベースSSO。IdPとSP間でアサーション交換', style: 'plain' },
          ],
          [
            { text: 'OAuth 2.0', style: 'navy' },
            { text: '：認可フレームワーク／', style: 'plain' },
            { text: 'OpenID Connect', style: 'navy' },
            { text: '：OAuth上の認証層', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：Webアプリ攻撃（参考）',
        navyItems: [
          [
            { text: 'SQLインジェクション', style: 'navy' },
            { text: '：入力値にSQL構文を埋め込みDB不正操作（対策：プリペアドステートメント）', style: 'plain' },
          ],
          [
            { text: 'XSS', style: 'navy' },
            { text: '（クロスサイトスクリプティング）：悪意のスクリプトを反射／格納（対策：エスケープ・CSP）', style: 'plain' },
          ],
          [
            { text: 'CSRF', style: 'navy' },
            { text: '：認証済みセッションを悪用（対策：CSRFトークン／SameSite Cookie）', style: 'plain' },
          ],
          [
            { text: 'ディレクトリトラバーサル', style: 'navy' },
            { text: '：../でパスをさかのぼる（対策：入力値検証）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'C&Cサーバ対策＝プロキシ強制（＋認証）',
      'チャレンジレスポンス：毎回==異なるレスポンス==で安全',
      'クライアント証明書配布時には==秘密鍵==が必要',
      'サーバ証明書は接続FQDNと==CN==の一致確認',
    ],
  },

  proxy: {
    summary: '復習ノート「プロキシサーバ」準拠。プロキシの目的・PACファイル・HTTPS時のCONNECT・復号処理を整理。',
    sections: [
      {
        heading: 'プロキシサーバの基礎',
        richItems: [
          [
            { text: 'プロキシサーバの目的：', style: 'plain' },
            { text: 'キャッシュ', style: 'red' },
            { text: ' によるアクセスの ', style: 'plain' },
            { text: '高速化', style: 'red' },
            { text: '／', style: 'plain' },
            { text: 'セキュリティ', style: 'red' },
            { text: ' の強化', style: 'plain' },
          ],
          [
            { text: 'プロキシサーバの設定は、PCのブラウザ設定画面から行う', style: 'plain' },
          ],
          [
            { text: 'プロキシ自動設定ファイル（', style: 'plain' },
            { text: 'PAC', style: 'red' },
            { text: ' ファイル）をWebサーバに登録する方法もある', style: 'plain' },
          ],
          [
            { text: 'PACのメリット：プログラムを書くことで柔軟な設定が可能（プロキシAがダウンしたらBに接続させる等）。PACは対応ブラウザだけが使える', style: 'plain' },
          ],
          [
            { text: 'プロキシサーバのログで取得できる情報：日時、送信元IPアドレス、接続先のURL、HTTPメソッド等', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'HTTPS通信とプロキシ',
        richItems: [
          [
            { text: 'HTTPS通信において、', style: 'plain' },
            { text: 'CONNECT', style: 'red' },
            { text: ' メソッドを利用する目的：HTTPS通信であることをプロキシサーバに通知し、通信をそのまま通過させるように依頼する', style: 'plain' },
          ],
          [
            { text: '通常のプロキシサーバはHTTPS通信の暗号を ', style: 'plain' },
            { text: '復号できない', style: 'red' },
            { text: ' ⇒ 十分なセキュリティチェックが不可能（アンチウイルス、URLフィルタリング等ができない。URLも見えない＝データ部にあるため）', style: 'plain' },
          ],
          [
            { text: 'PC→プロキシサーバ→Webサーバの構成でHTTPS通信を行うとき、PCからWebサーバに向けて発出されるパケットの宛先IPアドレスは ', style: 'plain' },
            { text: 'プロキシサーバ', style: 'red' },
          ],
          [
            { text: 'プロキシサーバ経由でインターネット上のWebサーバに接続するとき、ドメインの名前解決は ', style: 'plain' },
            { text: 'プロキシサーバ', style: 'red' },
            { text: ' が行う', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'プロキシサーバによる復号処理',
        richItems: [
          [
            { text: 'HTTPS通信であっても、セキュリティ対策のためプロキシサーバで復号処理をすることがある', style: 'plain' },
          ],
          [
            { text: '復号機能を持つプロキシサーバを介した通信の流れ：HTTPS通信をプロキシサーバで一旦終端する → 通信を復号してセキュリティチェックを行う → その後、再度暗号化してHTTPS通信を行う', style: 'plain' },
          ],
          [
            { text: 'PCとプロキシサーバ間でもHTTPS通信をするので、プロキシサーバに ', style: 'plain' },
            { text: 'サーバ証明書', style: 'red' },
            { text: ' が配置される。この証明書はプロキシサーバが生成する（ディジタル署名を付与するのはプロキシサーバ）', style: 'plain' },
          ],
          [
            { text: 'PCには、プロキシサーバの ', style: 'plain' },
            { text: 'ルート証明書', style: 'red' },
            { text: ' を入れる', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'プロキシ目的：キャッシュ高速化＋セキュリティ強化',
      'CONNECTメソッド＝HTTPSトンネル要求',
      'HTTPS通信時の宛先IPは==プロキシ==、名前解決もプロキシが行う',
      'HTTPS復号のため、PCには==ルート証明書==を入れる',
    ],
  },

  'network-mgmt': {
    summary: '復習ノート「ネットワーク管理」「SNMP」準拠。管理の分類・ping／SYSLOG／REST／LLDP／BFD・SNMP（マネージャ／エージェント／コミュニティ／ポーリング／Trap／インフォーム／MIB）を整理。',
    sections: [
      {
        heading: 'ネットワーク管理',
        richItems: [
          [
            { text: 'ネットワーク管理の分類：', style: 'plain' },
            { text: '障害管理', style: 'red' },
            { text: '（障害の検知）／', style: 'plain' },
            { text: '構成管理', style: 'red' },
            { text: '（IPアドレスや物理構成などの構成情報）／', style: 'plain' },
            { text: '機能管理', style: 'red' },
            { text: '（応答時間などのNW機能を管理）', style: 'plain' },
          ],
          [
            { text: 'L2SWにSNMPやSSLでアクセスできるようにするためには、', style: 'plain' },
            { text: 'IPアドレス', style: 'red' },
            { text: ' を設定する必要がある', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'pingによる監視（ICMPポーリング）',
        richItems: [
          [
            { text: 'レイヤ3のレベルまでなら ', style: 'plain' },
            { text: 'ping', style: 'red' },
            { text: ' による監視（ICMPポーリング）。pingは監視サーバから監視対象機器に送る', style: 'plain' },
          ],
          [
            { text: 'pingの応答がない場合の要因：機器の故障／通信経路上の機器の故障／監視対象機器がFW機能やアクセスリスト等によりpingを拒否している', style: 'plain' },
          ],
          [
            { text: 'pingによる監視は不十分：L2SWはIPが一つしかないのでどのポートが故障したか分からない／レイヤ3のダウンという単純な情報しか分からない／レイヤ7レベルでの不具合は分からない', style: 'plain' },
          ],
          [
            { text: 'ICMPは ', style: 'plain' },
            { text: '輻輳の検知', style: 'red' },
            { text: ' にも向かない（起きていても届くし、起きてなくても別の障害で届かないことがある）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SYSLOG・REST・LLDP・BFD',
        richItems: [
          [
            { text: 'SYSLOG監視：', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: ' を用いる。ping監視と異なり、監視対象機器から監視サーバにダウン情報等を伝達する', style: 'plain' },
          ],
          [
            { text: 'インタフェースがダウンした場合、', style: 'plain' },
            { text: 'リアルタイム', style: 'red' },
            { text: ' にログを送ることができる（ping監視は一定間隔のため故障検知が遅れる）', style: 'plain' },
          ],
          [
            { text: 'REST', style: 'red' },
            { text: '（Representational State Transfer）：NW機器やサーバと接続し、設定情報を取得したり、設定変更が行えたりする便利な仕組み', style: 'plain' },
          ],
          [
            { text: 'LLDP', style: 'red' },
            { text: '（Link Layer Discovery Protocol）：隣接機器に対して、自身の情報（装置名、ポート番号等）を通知するプロトコル', style: 'plain' },
          ],
          [
            { text: 'BFD', style: 'red' },
            { text: '（双方向フォワーディング検出）：ルータ同士が定期的にメッセージを送り合う。', style: 'plain' },
            { text: '高速', style: 'red' },
            { text: ' に障害を検知できる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SNMP（Simple Network Management Protocol）',
        richItems: [
          [
            { text: 'NW構成機器を集中管理するためのプロトコル。ポート番号：', style: 'plain' },
            { text: 'UDP', style: 'red' },
            { text: ' ', style: 'plain' },
            { text: '161/162', style: 'red' },
          ],
          [
            { text: 'SNMP', style: 'plain' },
            { text: 'マネージャ', style: 'red' },
            { text: '：機器を管理する側', style: 'plain' },
          ],
          [
            { text: 'SNMP', style: 'plain' },
            { text: 'エージェント', style: 'red' },
            { text: '：管理されるネットワーク機器やサーバ', style: 'plain' },
          ],
          [
            { text: 'SNMPマネージャ側で管理すべきこと：エージェントとマネージャの設定で ', style: 'plain' },
            { text: 'コミュニティ', style: 'red' },
            { text: ' というグループを指定し、コミュニティ単位で情報を管理', style: 'plain' },
          ],
          [
            { text: 'コミュニティのデフォルト名：', style: 'plain' },
            { text: 'public', style: 'red' },
          ],
        ],
      },
      {
        heading: 'SNMPの監視の種類',
        richItems: [
          [
            { text: 'ポーリング', style: 'red' },
            { text: '：ping監視と同様に、マネージャからエージェントへ ', style: 'plain' },
            { text: '一定間隔', style: 'red' },
            { text: ' で監視を行う', style: 'plain' },
          ],
          [
            { text: 'Trap', style: 'red' },
            { text: '：SYSLOG監視と同様に、エージェントからマネージャに ', style: 'plain' },
            { text: 'リアルタイム', style: 'red' },
            { text: ' で異常を通知する', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SNMPインフォーム・MIB',
        richItems: [
          [
            { text: 'SNMPインフォームにより解消されるTrapのデメリット：Trapを送信してもNWの障害（STP再計算等）によりTrapがSNMPマネージャに届かない場合がある', style: 'plain' },
          ],
          [
            { text: 'SNMPインフォームを設定した場合、エージェントは ', style: 'plain' },
            { text: '確認応答がマネージャから届かない', style: 'red' },
            { text: ' とき、', style: 'plain' },
            { text: '再送', style: 'red' },
            { text: ' する。これによりTrapを確実に届けることができる', style: 'plain' },
          ],
          [
            { text: 'SNMPエージェントでは、各種の管理情報を ', style: 'plain' },
            { text: 'MIB', style: 'red' },
            { text: ' と呼ばれる機器の中にあるデータベースに保存する（MIB: Management Information Base）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'その他ネスペ試験的なこと',
        richItems: [
          [
            { text: '「変更」ときたら「差分」（元からあるやつを回答に入れない）', style: 'plain' },
          ],
          [
            { text: '検知の問題点2つときたら、フォールスポジティブ・ネガティブの両側面で考える', style: 'plain' },
          ],
          [
            { text: '新旧のNWが混ざるとき、IPアドレスの重複に注意', style: 'plain' },
          ],
          [
            { text: '接続できない ⇒ ルーティングループを疑う。特にデフォルトルート', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'ネスペ管理3分類：障害管理／構成管理／機能管理',
      'ping＝マネージャ→対象（一定間隔）／Trap＝対象→マネージャ（リアルタイム）',
      'SNMPはUDP==161==（Get/Set）＋==162==（Trap）',
      'コミュニティのデフォルト名は==public==（変更必須）',
      'SNMPインフォーム：Trap到達失敗時に==再送==',
      'BFD：ルータ間定期メッセージで==高速障害検知==',
    ],
  },

  'protocol-review': {
    summary: '復習ノート準拠。ネスペ午後で問われる主要プロトコルを2表に整理。赤字＝最重要、ネイビー＝重要。',
    sections: [
      {
        heading: '下位レイヤ(L4以下)のプロトコル',
        richProtocolTables: [
          {
            heading: '下位レイヤ(L4以下)',
            hasPort: false,
            rows: [
              { name: 'IP',   layer: 'レイヤ3',
                description: [{ text: 'ネットワーク上の住所', style: 'plain' }] },
              { name: 'TCP',  layer: 'レイヤ4',
                description: [
                  { text: '３ウェイ', style: 'plain' },
                  { text: 'ハンドシェイク', style: 'red' },
                  { text: 'による信頼性の高い通信', style: 'plain' },
                ] },
              { name: 'UDP',  layer: 'レイヤ4',
                description: [
                  { text: '高速性を重視する', style: 'plain' },
                  { text: 'コネクションレス', style: 'red' },
                  { text: '型通信', style: 'plain' },
                ] },
              { name: 'STP',  nameStyle: 'red', layer: 'レイヤ2',
                description: [{ text: 'ループ構成によるブロードキャストストームの防止', style: 'plain' }] },
              { name: 'LACP', nameStyle: 'red', layer: 'レイヤ2',
                description: [{ text: '動的なリンクアグリゲーション設定', style: 'plain' }] },
              { name: 'PPP',  nameStyle: 'red', layer: 'レイヤ2',
                description: [{ text: 'WAN を介した 2 地点間（1 対 1）のデータ通信', style: 'plain' }] },
              { name: 'PPPoE', layer: 'レイヤ2',
                description: [{ text: 'PPP フレームを MAC フレームでカプセル化して LAN 上で転送', style: 'plain' }] },
              { name: 'CHAP', layer: 'レイヤ2',
                description: [{ text: 'PPP でパスワードを暗号化して送る', style: 'plain' }] },
              { name: 'EAP',  nameStyle: 'red', layer: 'レイヤ2',
                description: [
                  { text: 'PPP を拡張したプロトコル。無線 LAN に使う。\nEAP-PEAP：ユーザID/パスワードを使用\nEAP-TLS：クライアント証明書を使用', style: 'plain' },
                ] },
              { name: 'L2TP', layer: 'レイヤ2',
                description: [{ text: 'レイヤ 2 のプロトコル（PPP 等）をトンネリング', style: 'plain' }] },
              { name: 'LLDP', layer: 'レイヤ2',
                description: [{ text: '隣接機器に対して自身の情報を通知', style: 'plain' }] },
              { name: 'ICMP', nameStyle: 'red', layer: 'レイヤ3',
                description: [
                  { text: '機器の正常性確認。', style: 'plain' },
                  { text: 'ping', style: 'red' },
                  { text: ' や traceroute', style: 'plain' },
                ] },
              { name: 'VRRP', nameStyle: 'red', layer: 'レイヤ3',
                description: [{ text: 'ルータの冗長化', style: 'plain' }] },
              { name: 'ARP',  nameStyle: 'red', layer: 'レイヤ3',
                description: [
                  { text: 'IP', style: 'red' },
                  { text: ' アドレスに対応した ', style: 'plain' },
                  { text: 'MAC', style: 'red' },
                  { text: ' アドレスを問合せ／回答', style: 'plain' },
                ] },
              { name: 'GARP', nameStyle: 'red', layer: 'レイヤ3',
                description: [{ text: '自分自身の IP アドレスを同一セグメント内のノードに通知し、ARP テーブルを更新させる。自身の IP アドレスの重複検査にも使う。', style: 'plain' }] },
              { name: 'RIP',  nameStyle: 'red', layer: 'レイヤ3',
                description: [{ text: '距離ベクトル型アルゴリズムを用いるルーティングプロトコル', style: 'plain' }] },
              { name: 'OSPF', nameStyle: 'red', layer: 'レイヤ3',
                description: [{ text: 'リンクステート型アルゴリズムを用いるルーティングプロトコル', style: 'plain' }] },
              { name: 'BGP',  nameStyle: 'red', layer: 'レイヤ3',
                description: [{ text: 'AS 間で用いるパスベクトル型アルゴリズムのルーティングプロトコル', style: 'plain' }] },
              { name: 'IGMP', layer: 'レイヤ3',
                description: [{ text: 'クライアントがルータに、マルチキャストグループの参加・離脱を通知', style: 'plain' }] },
              { name: 'GRE',  layer: 'レイヤ3',
                description: [{ text: 'レイヤ 3 プロトコル（IP, IPsec 等）をトンネリング（暗号化機能なし）', style: 'plain' }] },
            ],
          },
        ],
      },
      {
        heading: '上位レイヤ(L5以上)のプロトコル',
        richProtocolTables: [
          {
            heading: '上位レイヤ(L5以上)',
            hasPort: true,
            rows: [
              { name: 'HTTP',  nameStyle: 'red',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '80', style: 'red' },
                ],
                description: [{ text: 'PC（ブラウザ）と Web サーバ間の通信', style: 'plain' }] },
              { name: 'SSL/TLS',
                portTokens: [{ text: '(レイヤ5)', style: 'plain' }],
                description: [{ text: 'データ暗号化プロトコル。盗聴だけでなく、データの改ざん、なりすましを防止', style: 'plain' }] },
              { name: 'HTTPS', nameStyle: 'red',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '443', style: 'red' },
                ],
                description: [{ text: 'HTTP を SSL で暗号化した通信', style: 'plain' }] },
              { name: 'DNS',   nameStyle: 'red',
                portTokens: [
                  { text: 'UDP ', style: 'plain' },
                  { text: '53', style: 'red' },
                  { text: ' / TCP ', style: 'plain' },
                  { text: '53', style: 'red' },
                ],
                description: [{ text: 'ホスト名から IP アドレスの問合せ／回答。問合せは UDP、ゾーン転送は TCP を使用', style: 'plain' }] },
              { name: 'DHCP',  nameStyle: 'red',
                portTokens: [
                  { text: 'UDP ', style: 'red' },
                  { text: '67/68', style: 'plain' },
                ],
                description: [{ text: 'IP アドレスの払い出し、一元管理を行う。サーバ→クライアントのポート番号が 68', style: 'plain' }] },
              { name: 'FTP',
                portTokens: [{ text: 'TCP 20/21', style: 'plain' }],
                description: [{ text: 'ファイルの転送', style: 'plain' }] },
              { name: 'SNMP',
                portTokens: [
                  { text: 'UDP', style: 'red' },
                  { text: '（161/162）', style: 'plain' },
                ],
                description: [{ text: 'NW 管理情報（故障情報やトラフィック情報）のやり取り', style: 'plain' }] },
              { name: 'SMTP',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '25', style: 'red' },
                ],
                description: [{ text: 'シンプルなメール送信', style: 'plain' }] },
              { name: 'POP3',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '110', style: 'red' },
                ],
                description: [{ text: 'メールサーバから PC へのメール受信', style: 'plain' }] },
              { name: 'SMTP AUTH',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '587', style: 'red' },
                ],
                description: [
                  { text: 'ユーザ名・パスワードで認証を行うメール送信。TCP ', style: 'plain' },
                  { text: '587', style: 'red' },
                  { text: '：', style: 'plain' },
                  { text: 'サブミッション', style: 'red' },
                  { text: 'ポート', style: 'plain' },
                ] },
              { name: 'SMTPS',
                portTokens: [
                  { text: 'TCP ', style: 'plain' },
                  { text: '465', style: 'red' },
                ],
                description: [
                  { text: 'TLS', style: 'red' },
                  { text: ' で暗号化した SMTP', style: 'plain' },
                ] },
              { name: 'IMAP4',
                portTokens: [{ text: 'TCP 143', style: 'plain' }],
                description: [{ text: 'POP3 の改良版。複数 PC から同一メールを見れる', style: 'plain' }] },
              { name: 'IKE',
                portTokens: [
                  { text: 'UDP ', style: 'plain' },
                  { text: '500', style: 'red' },
                ],
                description: [{ text: 'IPsec における鍵交換プロトコル', style: 'plain' }] },
              { name: 'SIP',
                portTokens: [
                  { text: 'UDP', style: 'red' },
                  { text: '（5060）', style: 'plain' },
                ],
                description: [{ text: 'VoIP の呼制御', style: 'plain' }] },
              { name: 'RTP',
                portTokens: [{ text: '動的に変化', style: 'plain' }],
                description: [{ text: 'リアルタイムのデータ伝送（VoIP 等）', style: 'plain' }] },
              { name: 'SDP',
                portTokens: [{ text: '(TCP/UDP 5060)', style: 'plain' }],
                description: [{ text: 'セッション記述プロトコル。VoIP 等で使用', style: 'plain' }] },
              { name: 'IMAPS',
                portTokens: [{ text: 'TCP 993', style: 'plain' }],
                description: [{ text: '認証やメール本文の受信など、IMAP 通信の全てを TLS によって暗号化', style: 'plain' }] },
            ],
          },
        ],
      },
      // ── 復習ノートに無い既存項目（ネイビー強調のみで残す） ──────────
      {
        heading: '補足：トランスポート層（L4）の追加情報',
        navyItems: [
          [
            { text: 'TCP', style: 'navy' },
            { text: '（IPプロトコル番号：', style: 'plain' },
            { text: '6', style: 'navy' },
            { text: '）：コネクション型・信頼性転送・フロー制御・輻輳制御・3ウェイハンドシェイク', style: 'plain' },
          ],
          [
            { text: 'UDP', style: 'navy' },
            { text: '（IPプロトコル番号：', style: 'plain' },
            { text: '17', style: 'navy' },
            { text: '）：コネクションレス・低遅延・再送なし。VoIP・DNS・DHCP・QUIC に使用', style: 'plain' },
          ],
          [
            { text: 'SCTP', style: 'navy' },
            { text: '（IPプロトコル番号：', style: 'plain' },
            { text: '132', style: 'navy' },
            { text: '）：マルチホーミング・マルチストリーム対応。信頼性はTCP相当', style: 'plain' },
          ],
          [
            { text: 'ウェルノウンポート：', style: 'plain' },
            { text: '0〜1023', style: 'navy' },
            { text: '（システムサービス用・root権限が必要）', style: 'plain' },
          ],
          [
            { text: '登録ポート：', style: 'plain' },
            { text: '1024〜49151', style: 'navy' },
            { text: '（アプリケーションが登録して使用）', style: 'plain' },
          ],
          [
            { text: 'エフェメラルポート：', style: 'plain' },
            { text: '49152〜65535', style: 'navy' },
            { text: '（クライアントが一時的に使用する動的ポート）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '補足：IPプロトコル番号一覧（L3）',
        navyItems: [
          [{ text: 'ICMP：プロトコル番号 ', style: 'plain' }, { text: '1', style: 'navy' }],
          [{ text: 'TCP：プロトコル番号 ', style: 'plain' },  { text: '6', style: 'navy' }],
          [{ text: 'UDP：プロトコル番号 ', style: 'plain' },  { text: '17', style: 'navy' }],
          [{ text: 'GRE：プロトコル番号 ', style: 'plain' },  { text: '47', style: 'navy' }],
          [{ text: 'ESP（IPsec）：プロトコル番号 ', style: 'plain' }, { text: '50', style: 'navy' }],
          [{ text: 'AH（IPsec）：プロトコル番号 ', style: 'plain' },  { text: '51', style: 'navy' }],
          [{ text: 'OSPF：プロトコル番号 ', style: 'plain' }, { text: '89', style: 'navy' }],
          [{ text: 'SCTP：プロトコル番号 ', style: 'plain' }, { text: '132', style: 'navy' }],
        ],
      },
      {
        heading: '補足：ICMPタイプ番号（L3）',
        navyItems: [
          [{ text: 'Type ', style: 'plain' }, { text: '0', style: 'navy' }, { text: '：Echo Reply（ping 応答）', style: 'plain' }],
          [{ text: 'Type ', style: 'plain' }, { text: '3', style: 'navy' }, { text: '：Destination Unreachable（到達不能）。Code 3 = Port Unreachable', style: 'plain' }],
          [{ text: 'Type ', style: 'plain' }, { text: '5', style: 'navy' }, { text: '：Redirect（より良い経路をホストに通知）', style: 'plain' }],
          [{ text: 'Type ', style: 'plain' }, { text: '8', style: 'navy' }, { text: '：Echo Request（ping 要求）', style: 'plain' }],
          [{ text: 'Type ', style: 'plain' }, { text: '11', style: 'navy' }, { text: '：Time Exceeded（TTL=0。traceroute に使用）', style: 'plain' }],
        ],
      },
      {
        heading: '補足：マルチキャストアドレス（L3）',
        navyItems: [
          [{ text: '224.0.0.5', style: 'navy' }, { text: '：全 OSPF ルータ宛', style: 'plain' }],
          [{ text: '224.0.0.6', style: 'navy' }, { text: '：OSPF の DR/BDR 宛', style: 'plain' }],
          [{ text: '224.0.0.9', style: 'navy' }, { text: '：RIPv2 ルータ宛', style: 'plain' }],
          [{ text: '224.0.0.18', style: 'navy' }, { text: '：VRRP 宛', style: 'plain' }],
          [{ text: 'ff02::1', style: 'navy' }, { text: '：リンクローカル全ノード（IPv6）', style: 'plain' }],
          [{ text: 'ff02::2', style: 'navy' }, { text: '：リンクローカル全ルータ（IPv6）', style: 'plain' }],
          [{ text: 'ff02::5', style: 'navy' }, { text: '：OSPFv3 全ルータ（IPv6）', style: 'plain' }],
        ],
      },
      {
        heading: '補足：物理層（L1）— 主要イーサネット規格',
        navyItems: [
          [{ text: '100BASE-TX', style: 'navy' }, { text: '：Fast Ethernet。UTP Cat5。最大 100m', style: 'plain' }],
          [{ text: '1000BASE-T', style: 'navy' }, { text: '：GbE。UTP Cat5e。最大 100m', style: 'plain' }],
          [{ text: '1000BASE-SX', style: 'navy' }, { text: '：GbE。マルチモードファイバ（MMF）。最大 550m', style: 'plain' }],
          [{ text: '1000BASE-LX', style: 'navy' }, { text: '：GbE。シングルモードファイバ（SMF）。最大 5km', style: 'plain' }],
          [{ text: '10GBASE-T', style: 'navy' }, { text: '：10GbE。UTP Cat6a。最大 100m', style: 'plain' }],
          [{ text: '10GBASE-SR', style: 'navy' }, { text: '：10GbE。マルチモードファイバ（MMF）。最大 300m', style: 'plain' }],
          [{ text: '10GBASE-LR', style: 'navy' }, { text: '：10GbE。シングルモードファイバ（SMF）。最大 10km', style: 'plain' }],
          [{ text: '40GBASE-SR4', style: 'navy' }, { text: '：40GbE。MMF×4 レーン（QSFP+）。最大 150m', style: 'plain' }],
          [{ text: '100GBASE-SR4', style: 'navy' }, { text: '：100GbE。MMF×4 レーン（QSFP28）。最大 100m', style: 'plain' }],
        ],
      },
    ],
    exam_tips: [
      'ポート番号は==平文 vs 暗号化版==をセットで暗記（HTTP:80/HTTPS:443、SMTP:25/587、POP3:110/995、IMAP4:143/993、LDAP:389/636）',
      '==UDP 使用プロトコル==：DNS・SNMP・NTP・TFTP・DHCP・Syslog・RADIUS・QUIC（HTTP/3）',
      '==BGP は TCP 179==（OSPF・RIP・VRRP は IP を直接使用）',
      'IP プロトコル番号：==ICMP=1==・==TCP=6==・==UDP=17==・==GRE=47==・==ESP=50==・==AH=51==・==OSPF=89==',
      'ICMP タイプ：==0/8==（ping 応答/要求）・==11==（TTL 超過・traceroute）・==3==（到達不能）',
      'Ethertype：==0x0800==（IPv4）・==0x0806==（ARP）・==0x86DD==（IPv6）・==0x8100==（VLAN）',
    ],
  },

  iot: {
    summary: 'MQTT・CoAP・LPWA（令和7年）とSASE・ZTNA・Wi-Fi 7（令和8年予想）が最重要。',
    sections: [
      {
        heading: 'IoT通信プロトコル',
        richItems: [
          [
            { text: 'MQTT', style: 'navy' },
            { text: '（', style: 'plain' },
            { text: 'TCP 1883/8883', style: 'navy' },
            { text: '）：', style: 'plain' },
            { text: 'Pub/Subモデル', style: 'navy' },
            { text: '。ブローカーを介してPublisher→Subscriberにメッセージ配信。', style: 'plain' },
            { text: 'QoS 0/1/2', style: 'navy' },
          ],
          [
            { text: 'CoAP', style: 'navy' },
            { text: '（', style: 'plain' },
            { text: 'UDP 5683', style: 'navy' },
            { text: '）：RESTfulなHTTP互換の軽量プロトコル。', style: 'plain' },
            { text: 'Confirmable/Non-confirmable', style: 'navy' },
            { text: ' で信頼性を選択', style: 'plain' },
          ],
          [
            { text: 'AMQP：メッセージキューイングプロトコル。エンタープライズ向け（MQTTよりリッチ）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'LPWA（Low Power Wide Area）',
        richItems: [
          [
            { text: 'LoRaWAN', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'チャープ変調（CSS）', style: 'navy' },
            { text: '。', style: 'plain' },
            { text: '920MHz帯', style: 'navy' },
            { text: '。数km〜数十kmの長距離通信', style: 'plain' },
          ],
          [
            { text: 'Sigfox', style: 'navy' },
            { text: '：Ultra-Narrow Band変調。月単位の電池駆動。最大 ', style: 'plain' },
            { text: '12', style: 'navy' },
            { text: ' バイト/メッセージ', style: 'plain' },
          ],
          [
            { text: 'NB-IoT / LTE-M', style: 'navy' },
            { text: '：3GPP標準。既存LTE基地局活用。キャリアサービス', style: 'plain' },
          ],
          [
            { text: 'Wi-SUN', style: 'navy' },
            { text: '：スマートメーター向けメッシュネットワーク（日本標準）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SASE・ゼロトラスト（令和8年予想）',
        richItems: [
          [
            { text: 'SASE', style: 'red' },
            { text: '（Secure Access Service Edge）：', style: 'plain' },
            { text: 'SD-WAN', style: 'navy' },
            { text: '＋SWG・', style: 'plain' },
            { text: 'CASB', style: 'red' },
            { text: '・', style: 'plain' },
            { text: 'ZTNA', style: 'navy' },
            { text: '・FWaaS をクラウドで統合', style: 'plain' },
          ],
          [
            { text: 'ZTNA', style: 'navy' },
            { text: '（Zero Trust Network Access）：「', style: 'plain' },
            { text: '常に認証・常に最小権限', style: 'navy' },
            { text: '」。VPN不要でアプリ単位アクセス制御', style: 'plain' },
          ],
          [
            { text: 'CASB', style: 'red' },
            { text: '（Cloud Access Security Broker）：クラウドサービス利用の可視化・制御', style: 'plain' },
          ],
          [
            { text: 'SWG', style: 'navy' },
            { text: '（Secure Web Gateway）：クラウド型プロキシ。URLフィルタ・マルウェアスキャン・DLP', style: 'plain' },
          ],
        ],
      },
      {
        heading: '試験制度変更（令和8年度）',
        richItems: [
          [
            { text: 'CBT', style: 'navy' },
            { text: '（Computer Based Testing）方式に完全移行', style: 'plain' },
          ],
          [
            { text: '科目A-2（旧午前Ⅱ）・科目B（旧午後Ⅰ/Ⅱ → B-1/B-2）に名称変更', style: 'plain' },
          ],
          [
            { text: '記述解答→', style: 'plain' },
            { text: 'キーボード入力（タイピング）', style: 'navy' },
            { text: ' 方式に変更', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'MQTT（TCP・Pub/Sub）とCoAP（UDP・RESTful）の違いは令和7年に出題',
      'LPWAの各技術（LoRa・Sigfox・NB-IoT）の特徴の違い',
      '==SASE== = SD-WAN + セキュリティ（SWG+==CASB==+ZTNA+FWaaS）という構成を覚える',
    ],
  },
  // ─────────────────────────────────────────────
  // SSL/TLS・PKI
  // ─────────────────────────────────────────────
  'ssl-tls': {
    summary: '復習ノート「SSL/TLS」「セキュリティ」より。TLSハンドシェイク／PKI（証明書・認証局）／SSL-VPNの3方式を整理。',
    sections: [
      {
        heading: 'SSL/TLS の基本',
        richItems: [
          [
            { text: 'Secure Socket Layer / Transport Layer Security — データを', style: 'plain' },
            { text: '暗号化', style: 'red' },
            { text: '・', style: 'plain' },
            { text: '認証', style: 'red' },
            { text: ' してセキュアな通信路を確保するプロトコル', style: 'plain' },
          ],
          [
            { text: '代表例：HTTPS（HTTP over SSL/TLS）。ポート番号は ', style: 'plain' },
            { text: '443', style: 'red' },
          ],
          [
            { text: 'TLS通信の前は ', style: 'plain' },
            { text: '認証・鍵交換', style: 'red' },
            { text: ' で、暗号化アルゴリズムを使用', style: 'plain' },
          ],
          [
            { text: 'ハッシュは ', style: 'plain' },
            { text: 'メッセージ認証', style: 'red' },
            { text: ' に使われる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SSL通信シーケンス',
        richItems: [
          [
            { text: '①クライアント → サーバ：', style: 'plain' },
            { text: 'Client Hello', style: 'red' },
            { text: ' を送信。利用可能な暗号化アルゴリズムの一覧を伝える', style: 'plain' },
          ],
          [
            { text: '②サーバ → クライアント：', style: 'plain' },
            { text: 'Server Hello', style: 'red' },
            { text: ' を送信。使用するアルゴリズムを通知する', style: 'plain' },
          ],
          [
            { text: '③続いてサーバ証明書送付・鍵交換・Finished で暗号化通信を確立', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: '補足（TLS 1.2 詳細）：', style: 'plain' },
            { text: 'ClientHello', style: 'navy' },
            { text: ' → ', style: 'plain' },
            { text: 'ServerHello', style: 'navy' },
            { text: ' + Certificate + ServerHelloDone → ', style: 'plain' },
            { text: 'ClientKeyExchange', style: 'navy' },
            { text: '（プリマスタシークレット送付）→ ', style: 'plain' },
            { text: 'ChangeCipherSpec', style: 'navy' },
            { text: ' + Finished', style: 'plain' },
          ],
          [
            { text: 'TLS 1.3', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '0-RTT', style: 'navy' },
            { text: ' / RSA鍵交換廃止（ECDHEのみ）/ 前方秘匿性', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'PKI / ディジタル証明書',
        richItems: [
          [
            { text: 'ディジタル証明書：本人の ', style: 'plain' },
            { text: '公開鍵', style: 'red' },
            { text: ' であることを証明する', style: 'plain' },
          ],
          [
            { text: 'ルート', style: 'red' },
            { text: ' 証明書：認証局（CA）の公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'サーバ', style: 'red' },
            { text: ' 証明書：サーバの公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'クライアント', style: 'red' },
            { text: ' 証明書：クライアント（PC）の公開鍵を証明', style: 'plain' },
          ],
          [
            { text: 'クライアント証明書をPCに配布する際に必要な情報 ⇒ クライアントの ', style: 'plain' },
            { text: '秘密鍵', style: 'red' },
            { text: '（無いとデータの暗号化ができない）。「クライアント証明書」ときたら「秘密鍵」!', style: 'plain' },
          ],
          [
            { text: '証明書の中には公開鍵がある。持ち主はメッセージのハッシュ値を秘密鍵で暗号化して送る', style: 'plain' },
          ],
          [
            { text: 'サーバ証明書では、接続するFQDNと証明書の ', style: 'plain' },
            { text: 'CN', style: 'red' },
            { text: ' が一致しているか確認する', style: 'plain' },
          ],
          [
            { text: 'CAは誰でも作れる。信頼できる認証機関＝', style: 'plain' },
            { text: '第三者認証局', style: 'red' },
          ],
          [
            { text: 'CAサーバの自社運用は、セキュリティ対策や故障対応で手間がかかる', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'X.509', style: 'navy' },
            { text: '：証明書のフォーマット規格', style: 'plain' },
          ],
          [
            { text: 'CRL', style: 'navy' },
            { text: '（証明書失効リスト）／', style: 'plain' },
            { text: 'OCSP', style: 'navy' },
            { text: '（Online Certificate Status Protocol：失効状態をリアルタイム問い合わせ）', style: 'plain' },
          ],
          [
            { text: 'HSTS', style: 'navy' },
            { text: '（HTTP Strict Transport Security）：HTTPSへ強制リダイレクトをブラウザに記憶させる', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SSL-VPN',
        richItems: [
          [
            { text: 'IPsecはESPを用いて ', style: 'plain' },
            { text: 'レイヤ3', style: 'red' },
            { text: ' で通信する／SSL-VPNはTCP', style: 'plain' },
            { text: '443', style: 'red' },
            { text: '番（HTTPS）を用いた ', style: 'plain' },
            { text: 'レイヤ4', style: 'red' },
            { text: ' 通信', style: 'plain' },
          ],
          [
            { text: 'SSL-VPNの方式①：', style: 'plain' },
            { text: 'リバースプロキシ', style: 'red' },
            { text: '。リバースプロキシサーバ（SSL-VPN装置）をWebサーバの前段に設置。Webサーバの改ざんを防ぐことが目的。外部からのアクセスはプロキシが代理応答するので、オリジナルのWebサーバにアクセスできない。改ざん防止以外には、アクセス負荷分散や、キャッシュによる表示速度向上も期待できる。Webブラウザで動作しないアプリには使用できない', style: 'plain' },
          ],
          [
            { text: 'SSL-VPNの方式②：', style: 'plain' },
            { text: 'ポートフォワーディング', style: 'red' },
            { text: '。SSL-VPN装置で、サーバのIPアドレスとポート番号を事前に定義。通信中に動的にサーバのポート番号が変化するアプリケーションには使えない', style: 'plain' },
          ],
          [
            { text: 'SSL-VPNの方式③：', style: 'plain' },
            { text: 'L2フォワーディング', style: 'red' },
            { text: '。PCに専用のソフトウェアをインストール。PCとSSL-VPN装置間でSSLのトンネルを作成。レイヤ2レベルの通信が行えるので、同一LAN内にいるかのような通信が行える。PCには仮想のIPアドレスが払い出される。使用するプロトコルの制限が無い', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'HTTPS のポートは ==443==',
      'TLSハンドシェイクは ==ClientHello → ServerHello== の順',
      'クライアント証明書配布時には ==秘密鍵== が必要',
      'サーバ証明書は接続FQDNと ==CN== の一致確認',
      'SSL-VPN：==リバースプロキシ==／==ポートフォワーディング==／==L2フォワーディング== の3方式',
      'IPsec は ==L3==／SSL-VPN は ==L4==',
    ],
  },
  // ─────────────────────────────────────────────
  // 脅威・攻撃手法
  // ─────────────────────────────────────────────
  threat: {
    summary: '復習ノート全体に散らばる攻撃手法を整理。DoS/DDoS（SYNフラッド・スマーフ・DNSリフレクタ）／ARPスプーフィング／SQLインジェクション／XSS／標的型攻撃（C&C）。',
    sections: [
      {
        heading: 'DoS / DDoS 攻撃',
        richItems: [
          [
            { text: 'DoS攻撃：1台から大量パケットを送って対象を停止させる攻撃', style: 'plain' },
          ],
          [
            { text: 'DDoS攻撃：', style: 'plain' },
            { text: '多数', style: 'red' },
            { text: ' のホストから一斉に攻撃する分散型のDoS（踏み台にされた多数のPCから一斉に通信）', style: 'plain' },
          ],
          [
            { text: 'SYNフラッド：TCPの3wayハンドシェイクを悪用。', style: 'plain' },
            { text: 'SYN', style: 'red' },
            { text: ' を大量送信し、サーバを ', style: 'plain' },
            { text: 'SYN_RECV', style: 'red' },
            { text: ' 状態で滞留させてリソースを枯渇', style: 'plain' },
          ],
          [
            { text: 'スマーフ', style: 'red' },
            { text: ' 攻撃：送信元を被害者に偽装した', style: 'plain' },
            { text: 'ICMP Echo Request', style: 'red' },
            { text: ' をブロードキャスト宛に送り、応答（Echo Reply）を被害者に集中させる', style: 'plain' },
          ],
          [
            { text: 'DNSリフレクタ', style: 'red' },
            { text: ' 攻撃（DNSアンプ）：送信元を被害者に偽装した小さなDNSクエリを送り、', style: 'plain' },
            { text: 'TXT', style: 'red' },
            { text: ' レコードなど大きな応答を被害者に返させて回線を圧迫', style: 'plain' },
          ],
          [
            { text: 'ACK', style: 'red' },
            { text: ' リフレクション攻撃：偽装SYNを多数のサーバに送り、応答 SYN/', style: 'plain' },
            { text: 'ACK', style: 'red' },
            { text: ' を被害者に集中させる', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: '対策：', style: 'plain' },
            { text: 'IPS', style: 'navy' },
            { text: '／', style: 'plain' },
            { text: 'WAF', style: 'navy' },
            { text: '／DDoS対策サービス（クラウド型WAF・スクラビングセンタ）', style: 'plain' },
          ],
          [
            { text: 'BCP38', style: 'navy' },
            { text: '：送信元IPの偽装パケットをISP側で破棄するベストプラクティス', style: 'plain' },
          ],
        ],
      },
      {
        heading: '中間者攻撃 / 経路傍受',
        richItems: [
          [
            { text: 'ARPスプーフィング', style: 'red' },
            { text: '：偽のARP応答を返してデフォルトGW等のMACアドレスを攻撃者PCに紐付け、通信を傍受する攻撃', style: 'plain' },
          ],
          [
            { text: '対策：L2SWの ', style: 'plain' },
            { text: 'ダイナミックARPインスペクション', style: 'red' },
            { text: '（DAI）／DHCPスヌーピングと組み合わせる', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'DNSキャッシュポイズニング', style: 'navy' },
            { text: '：キャッシュDNSサーバに偽の応答を覚え込ませる（対策：', style: 'plain' },
            { text: 'DNSSEC', style: 'navy' },
            { text: '・ソースポートランダム化）', style: 'plain' },
          ],
          [
            { text: 'セッションハイジャック', style: 'navy' },
            { text: '：Cookie等のセッションIDを盗んで成りすまし', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'Webアプリ攻撃',
        richItems: [
          [
            { text: 'SQLインジェクション', style: 'red' },
            { text: '：入力値にSQL構文を埋め込み、DBを不正操作する攻撃', style: 'plain' },
          ],
          [
            { text: '対策：', style: 'plain' },
            { text: 'プリペアドステートメント', style: 'red' },
            { text: '（バインド機構）', style: 'plain' },
          ],
          [
            { text: 'クロスサイトスクリプティング', style: 'red' },
            { text: '（XSS）：悪意のスクリプトを反射／格納してブラウザで実行させる', style: 'plain' },
          ],
          [
            { text: '対策：出力時の ', style: 'plain' },
            { text: 'エスケープ', style: 'red' },
            { text: '／CSP（Content Security Policy）', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'CSRF', style: 'navy' },
            { text: '：認証済みセッションを悪用して意図しないリクエストを送らせる（対策：CSRFトークン／SameSite Cookie）', style: 'plain' },
          ],
          [
            { text: 'ディレクトリトラバーサル', style: 'navy' },
            { text: '：../ でパスをさかのぼってファイルにアクセス（対策：入力値検証）', style: 'plain' },
          ],
          [
            { text: 'OSコマンドインジェクション', style: 'navy' },
            { text: '：入力値からシェルコマンドを実行（対策：シェル経由呼び出しを避ける）', style: 'plain' },
          ],
        ],
      },
      {
        heading: '標的型攻撃（C&C）',
        richItems: [
          [
            { text: '標的型攻撃では、攻撃者はマルウェアを送り込み、侵入したマルウェアが ', style: 'plain' },
            { text: 'C&Cサーバ', style: 'red' },
            { text: ' を経由して命令を送る', style: 'plain' },
          ],
          [
            { text: 'FWで外部からの通信を全て拒否しているのにPCで遠隔操作できる理由：FWで内部LAN→外部NWの通信が許可されている場合、マルウェアからC&Cサーバに接続させ、その応答パケットで命令を送れるため', style: 'plain' },
          ],
          [
            { text: 'マルウェアがC&Cサーバと通信しないようにするためには、', style: 'plain' },
            { text: 'プロキシ', style: 'red' },
            { text: ' サーバの導入が有効。内部LANからインターネットへの通信は、プロキシサーバ経由でのみ許可する', style: 'plain' },
          ],
          [
            { text: 'プロキシサーバの設定を調査してくるマルウェアへの対策：プロキシサーバで ', style: 'plain' },
            { text: '認証', style: 'red' },
            { text: ' 設定を行う', style: 'plain' },
          ],
        ],
      },
      {
        heading: '無線LAN特有の攻撃',
        navyItems: [
          [
            { text: 'Evil Twin', style: 'navy' },
            { text: '：正規APと同じSSIDの偽APを設置して接続を奪う', style: 'plain' },
          ],
          [
            { text: 'デオーセンティケーション攻撃', style: 'navy' },
            { text: '：管理フレームを偽造して切断させる（対策：Management Frame Protection／IEEE 802.11w）', style: 'plain' },
          ],
          [
            { text: 'KRACK', style: 'navy' },
            { text: '：WPA2 4ウェイハンドシェイクの再送悪用（対策：WPA3／パッチ適用）', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'SYNフラッド = ==SYN== を投げ続ける／対策は ==SYN Cookie==',
      'スマーフ攻撃 = ==ICMP Echo== をブロードキャスト送信',
      'DNSリフレクタ攻撃は ==TXT== レコードで応答増幅',
      'ARPスプーフィング対策 = L2SWの ==DAI==（ダイナミックARPインスペクション）',
      'SQLインジェクション対策 = ==プリペアドステートメント==',
      'C&Cサーバ対策 = ==プロキシ強制==（＋認証）',
    ],
  },
  // ─────────────────────────────────────────────
  // IPv6
  // ─────────────────────────────────────────────
  ipv6: {
    summary: '復習ノート「レイヤ1〜3基礎」のIPv6項より。アドレス体系（128bit・省略ルール・リンクローカル）／NDP／SLAAC／IPv4からの移行技術。',
    sections: [
      {
        heading: 'IPv6 アドレスの基本',
        richItems: [
          [
            { text: 'IPv4のIPアドレスは ', style: 'plain' },
            { text: '32', style: 'red' },
            { text: ' ビット／IPv6のIPアドレスは ', style: 'plain' },
            { text: '128', style: 'red' },
            { text: ' ビット', style: 'plain' },
          ],
          [
            { text: 'IPv6 は ', style: 'plain' },
            { text: '16', style: 'red' },
            { text: ' ビットずつ ', style: 'plain' },
            { text: ':', style: 'red' },
            { text: ' で区切り、16進数で8ブロック表記', style: 'plain' },
          ],
          [
            { text: 'IPv6の省略ルール：2001:0db8:0000:0000:0000:ff00:0042:8329 → 2001:', style: 'plain' },
            { text: 'db8::ff00:42:', style: 'red' },
            { text: '8329（連続する 0 のブロックは ', style: 'plain' },
            { text: '::', style: 'red' },
            { text: ' で1か所だけ省略可能、各ブロックの先頭の 0 も省略可能）', style: 'plain' },
          ],
          [
            { text: 'IPv6とIPv4は ', style: 'plain' },
            { text: '互換性無し', style: 'red' },
            { text: '（同一NW上で動かすには両方のスタックが必要）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IPv6 アドレスの種別',
        richItems: [
          [
            { text: 'fe80', style: 'red' },
            { text: ' で始まるIPv6アドレス：', style: 'plain' },
            { text: 'リンクローカルユニキャストアドレス', style: 'red' },
            { text: '。', style: 'plain' },
            { text: 'ルータ', style: 'red' },
            { text: ' を介さずに直接接続できる相手との通信にだけ使用', style: 'plain' },
          ],
          [
            { text: 'IPv6にはブロードキャストが ', style: 'plain' },
            { text: '無い', style: 'red' },
            { text: '。代わりに ', style: 'plain' },
            { text: 'マルチキャスト', style: 'red' },
            { text: ' を使用', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'グローバルユニキャスト', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '2000::/3', style: 'navy' },
            { text: '（先頭3ビットが 001）— インターネット上で一意', style: 'plain' },
          ],
          [
            { text: 'リンクローカル', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'fe80::/10', style: 'navy' },
            { text: ' — 同一リンク内のみ', style: 'plain' },
          ],
          [
            { text: 'ユニークローカル', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'fc00::/7', style: 'navy' },
            { text: ' — IPv4 のプライベート相当', style: 'plain' },
          ],
          [
            { text: 'マルチキャスト', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: 'ff00::/8', style: 'navy' },
            { text: '（', style: 'plain' },
            { text: 'ff02::1', style: 'navy' },
            { text: '＝全ノード／', style: 'plain' },
            { text: 'ff02::2', style: 'navy' },
            { text: '＝全ルータ／', style: 'plain' },
            { text: 'ff02::5', style: 'navy' },
            { text: '＝OSPFv3）', style: 'plain' },
          ],
          [
            { text: 'ループバック', style: 'navy' },
            { text: '：', style: 'plain' },
            { text: '::1/128', style: 'navy' },
            { text: '（IPv4 の 127.0.0.1 相当）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IPv6 ヘッダ',
        richItems: [
          [
            { text: 'IPv6 ヘッダは ', style: 'plain' },
            { text: '40', style: 'red' },
            { text: ' バイトの固定長（IPv4 は可変長）。オプションは拡張ヘッダで実現', style: 'plain' },
          ],
          [
            { text: 'チェックサムは ', style: 'plain' },
            { text: '無い', style: 'red' },
            { text: '（L2／L4 で検査するため）', style: 'plain' },
          ],
          [
            { text: 'ルータでフラグメント化を ', style: 'plain' },
            { text: 'しない', style: 'red' },
            { text: '（送信元のみが行う／パスMTU探索を使用）', style: 'plain' },
          ],
          [
            { text: 'IPv6パケット構造（下図）', style: 'plain' },
          ],
        ],
        headerDiagrams: [
          {
            title: 'IPv6 ヘッダ構造（40バイト固定長）',
            rows: [
              {
                cells: [
                  { label: 'バージョン\n(6)', bg: '#dcfce7' },
                  { label: 'トラフィック\nクラス', bg: '#dcfce7' },
                  { label: 'フローラベル', bg: '#dcfce7' },
                  { label: 'ペイロード長', bg: '#bbf7d0' },
                  { label: '次ヘッダ', bg: '#bbf7d0' },
                  { label: 'ホップ\nリミット', bg: '#bbf7d0' },
                ],
              },
              {
                cells: [
                  { label: '送信元IPv6アドレス（128bit）', bg: '#fef3c7', maskDigits: true, span: 6 },
                ],
              },
              {
                cells: [
                  { label: '宛先IPv6アドレス（128bit）', bg: '#fef3c7', maskDigits: true, span: 6 },
                ],
              },
              {
                cells: [
                  { label: 'データ（L4 ペイロード）', bg: '#fee2e2', span: 6 },
                ],
              },
            ],
            caption: '緑＝制御フィールド／黄＝アドレス（赤字マスク対象）／橙＝ペイロード。',
          },
        ],
      },
      {
        heading: 'NDP（近隣探索プロトコル）',
        richItems: [
          [
            { text: 'IPv6 ではARPが廃止され、', style: 'plain' },
            { text: 'NDP', style: 'red' },
            { text: '（Neighbor Discovery Protocol）が代わりに使われる', style: 'plain' },
          ],
          [
            { text: 'NDP は ', style: 'plain' },
            { text: 'ICMPv6', style: 'red' },
            { text: ' のメッセージで動作（タイプ133〜137）', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'RS', style: 'navy' },
            { text: '（Router Solicitation）：ホストがルータを探すメッセージ', style: 'plain' },
          ],
          [
            { text: 'RA', style: 'navy' },
            { text: '（Router Advertisement）：ルータがプレフィックス情報を通知', style: 'plain' },
          ],
          [
            { text: 'NS', style: 'navy' },
            { text: '（Neighbor Solicitation）：相手のMACアドレスを問い合わせ（ARP相当）', style: 'plain' },
          ],
          [
            { text: 'NA', style: 'navy' },
            { text: '（Neighbor Advertisement）：自分のMACアドレスを応答', style: 'plain' },
          ],
          [
            { text: 'リダイレクト', style: 'navy' },
            { text: '：より良い経路をホストに通知', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'SLAAC（自動アドレス設定）',
        richItems: [
          [
            { text: 'SLAAC', style: 'red' },
            { text: '（Stateless Address Auto Configuration）：DHCPサーバ無しでホストが自動的にIPv6アドレスを生成する仕組み', style: 'plain' },
          ],
          [
            { text: '手順：ホストが ', style: 'plain' },
            { text: 'RS', style: 'red' },
            { text: ' を送信 → ルータが ', style: 'plain' },
            { text: 'RA', style: 'red' },
            { text: ' でプレフィックス通知 → ホストがプレフィックス＋インタフェースIDで自身のアドレスを生成', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: 'インタフェースID（下位64bit）の生成方式：', style: 'plain' },
            { text: 'EUI-64', style: 'navy' },
            { text: '（MACアドレスから生成）またはランダム（プライバシー拡張：RFC 4941）', style: 'plain' },
          ],
          [
            { text: 'DHCPv6', style: 'navy' },
            { text: ' は SLAAC と併用される（DNSサーバ等の追加情報配布用、ステートフル運用も可）', style: 'plain' },
          ],
        ],
      },
      {
        heading: 'IPv4 → IPv6 移行技術',
        richItems: [
          [
            { text: 'デュアルスタック', style: 'red' },
            { text: '：1台でIPv4・IPv6 両方のスタックを動かす最も基本的な移行方式', style: 'plain' },
          ],
          [
            { text: 'トンネリング', style: 'red' },
            { text: '：IPv6パケットをIPv4パケットでカプセル化して、IPv4網を通す', style: 'plain' },
          ],
        ],
        navyItems: [
          [
            { text: '6to4', style: 'navy' },
            { text: '：IPv4アドレスからIPv6プレフィックス（', style: 'plain' },
            { text: '2002::/16', style: 'navy' },
            { text: '）を生成して自動トンネル', style: 'plain' },
          ],
          [
            { text: 'NAT64 / DNS64', style: 'navy' },
            { text: '：IPv6 のみのクライアントから IPv4 サーバへアクセスさせる変換技術', style: 'plain' },
          ],
          [
            { text: 'IPv4 over IPv6', style: 'navy' },
            { text: '（', style: 'plain' },
            { text: 'MAP-E', style: 'navy' },
            { text: '／', style: 'plain' },
            { text: 'DS-Lite', style: 'navy' },
            { text: '）：日本のフレッツ回線で利用される IPoE 方式', style: 'plain' },
          ],
        ],
      },
    ],
    exam_tips: [
      'IPv6 アドレスは ==128== ビット／IPv4 は ==32== ビット',
      '省略ルール：連続0は ==::== で1か所だけ省略可能',
      '==fe80::/10== はリンクローカル（==ルータ==を越えない）',
      'IPv6 では ARP 廃止 ⇒ ==NDP==（ICMPv6）',
      '==SLAAC== は ==RS==／==RA== でアドレス自動生成',
      'IPv6 にはブロードキャストが ==無い==（マルチキャストで代替）',
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

  if (!category || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <p className="text-slate-500">ノートが見つかりません</p>
        <Link to="/notes" className="text-blue-600 underline text-sm">ノート一覧へ戻る</Link>
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
