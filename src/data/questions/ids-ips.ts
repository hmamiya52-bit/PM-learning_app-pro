import type { Question } from '../../types'

export const idsIpsQuestions: Question[] = [
  {
    id: 'q-090',
    topicId: 'firewall',
    questionText: 'IDS/IPSの検知方式のうち、既知の攻撃パターンと照合する方式を{{blank}}という。',
    correctAnswer: 'シグネチャ型（パターンマッチング型）',
    choices: ['シグネチャ型（パターンマッチング型）', 'アノマリ型（異常検知型）', '統計的解析型', 'ヒューリスティック型'],
    isImportant: true,
    explanation: 'シグネチャ型は既知の攻撃パターン（シグネチャ）と照合し検知する。未知の攻撃（ゼロデイ）は検知できない。アノマリ型は正常な振る舞いからの逸脱を検知するため未知の攻撃にも対応できるが誤検知が多い。',
    difficulty: 1,
  },
  {
    id: 'q-091',
    topicId: 'firewall',
    questionText: 'IPSがネットワーク上でインライン配置される場合、通信を{{blank}}できるが、障害時には通信が遮断されるリスクがある。',
    correctAnswer: 'ブロック（遮断）',
    choices: ['ブロック（遮断）', '記録（ログ）のみ', '迂回（バイパス）', 'キャプチャ（取得）'],
    isImportant: false,
    explanation: 'IPSはインライン配置で通信をブロックできる。IDSはアウトオブバンド（ミラーポート等）配置で検知・通知のみ。IPSの障害でも通信を継続するフェールオープン設定が必要な場合がある。',
    difficulty: 2,
  },
  {
    id: 'q-092',
    topicId: 'firewall',
    questionText: 'WAF（Web Application Firewall）が防御対象とする攻撃に該当しないものは{{blank}}である。',
    correctAnswer: 'DDoS攻撃（帯域消費型）',
    choices: ['DDoS攻撃（帯域消費型）', 'SQLインジェクション', 'XSS（クロスサイトスクリプティング）', 'パスワードブルートフォース'],
    isImportant: false,
    explanation: 'WAFはHTTPレベルのアプリ攻撃（SQLi・XSS・CSRF等）を防御する。帯域消費型DDoSはL3/L4レベルの攻撃であり、上位ISPやCDNでの対策が必要。WAFでは対処困難。',
    difficulty: 2,
  },
]
