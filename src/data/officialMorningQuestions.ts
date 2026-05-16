/**
 * 公式午前II（PM 午前II）問題データ
 *
 * 設計書 v0.16 §2.7b / F1.5-P4 に従い、令和6年度 秋期 PM 午前II 25問を投入。
 * - 問題文・選択肢: IPA 公式 PDF を Codex が OCR で抽出（一字一句引用、改変なし）
 * - 正解: IPA 公式解答例 PDF と照合済（25問全件一致）
 * - 解説: Claude が独自作成（PMBOK第7版＋IPA PM試験シラバス Ver7.1 ベース）
 *
 * IPA 著作権規約（memory/risks.md R1 参照）:
 * - 教育目的の引用は許諾・使用料不要
 * - 出典明記必須: 「出典：<年度> <期> プロジェクトマネージャ試験 午前II 問<番号>」
 * - 問題文・選択肢は IPA 公式のまま引用（改変なし）。解説のみ独自作成。
 *
 * 図表入り問題について:
 * - 問4（EVMグラフ）・問5（アローダイアグラム）・問6（PDM）: SVG として figure に格納
 * - 問12（開発要員投入計画）: HTML テーブルとして figure に格納
 * - 問10（数式選択肢）: 図表なし、選択肢自体に数式記号
 * - レンダリングは OfficialMorningSession.tsx の QuestionFigureView コンポーネントが担当
 * - SVG は viewBox で自動スケール、テーブルは横スクロール対応でモバイル表示崩れ防止
 */

import type { OfficialMorningQuestion } from '../types'

export const MORNING_YEARS = ['R6'] as const

const R6_AUTUMN_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_am2_qs.pdf'

export const officialMorningQuestions: OfficialMorningQuestion[] = [
  {
    id: 'om-R6-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 1,
    questionText:
      'プロジェクトマネジメントにおけるプロジェクトマネジメント計画書の説明として，適切なものはどれか。',
    choices: [
      '組織のニーズ，目標ベネフィットなどを記述することによって，プロジェクトの目標について，また，プロジェクトがどのように事業目的に貢献するかについて明確にした文書',
      'どのようにプロジェクトを実施し，監視し，管理するのかを定めるために，プロジェクトを実施するためのベースライン，及び，プロジェクトを実行し，管理し，終結する方法を明確にした文書',
      'プロジェクトの最終状態を定義することによって，プロジェクトの目標，成果物，要求事項及び境界を含むプロジェクトスコープを明確にした文書',
      'プロジェクトを正式に許可する文書であって，プロジェクトマネージャを特定して適切な責任と権限を明確にし，ビジネスニーズ，目標，期待される結果などを明確にした文書',
    ],
    correctIndex: 1,
    explanation: 'プロジェクトマネジメント計画書は，プロジェクトの実行・監視・管理の方法を定義し，スコープ・スケジュール・コストなどのベースラインを統合した文書である。ア はビジネスケース，ウ はプロジェクトスコープ記述書，エ はプロジェクト憲章の説明。',
    categoryId: 'planning',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 2,
    questionText:
      'プロジェクトマネジメントで使用する責任分担マトリックス (RAM) の一つに，RACI チャートがある。RACI チャートで示す四つの “役割又は責任” の組みのうち，適切なものはどれか。',
    choices: [
      '実行責任，情報提供，説明責任，相談対応',
      '実行責任，情報提供，説明責任，リスク管理',
      '実行責任，情報提供，相談対応，リスク管理',
      '実行責任，説明責任，相談対応，リスク管理',
    ],
    correctIndex: 0,
    explanation: 'RACI チャートは責任分担マトリックスの一形式で，R=Responsible（実行責任），A=Accountable（説明責任），C=Consulted（相談対応），I=Informed（情報提供）の四つの役割を割り当てる。「リスク管理」を含む選択肢はいずれも誤り。',
    categoryId: 'team',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-3',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 3,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，プロセス “プロジェクト組織の定義” の目的はどれか。',
    choices: [
      '活動リストの活動ごとに必要な資源を決定すること',
      'プロジェクトに影響されるか，又は影響を及ぼす個人，集団又は組織を明らかにし，その利害及び関係に関連する情報を文書化すること',
      'プロジェクトに関連する役割，責任及び権限について，プロジェクトに関係する全ての当事者から必要な全てのコミットメントを得ること',
      'プロジェクトの完遂に必要な人的資源を得ること',
    ],
    correctIndex: 2,
    explanation: 'JIS Q 21500:2018「プロジェクト組織の定義」プロセスは，役割・責任・権限について すべての当事者から必要なコミットメントを得ることが目的。ア は「アクティビティ資源の見積り」，イ は「ステークホルダーの特定」，エ は「プロジェクトチームの編成」プロセスの目的。',
    categoryId: 'team',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-4',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 4,
    questionText:
      'EVM で管理しているプロジェクトがある。図は，プロジェクトの開始日から完了予定日までの期間の半分が経過した時点での状況である。完成時総予算 (BAC) どおりに完了させるために達成することが必要となるコスト効率の指標である残作業効率指数 (TCPI) の値はどれか。ここで，TCPI は小数第 2 位を四捨五入するものとする。',
    choices: ['0.6', '0.9', '1.1', '1.3'],
    correctIndex: 2,
    explanation: 'TCPI = (BAC − EV) / (BAC − AC) = (100 − 34) / (100 − 40) = 66 / 60 = 1.1。TCPI は BAC（完成時総予算）どおりに完了させるため，残予算で残作業を消化するのに必要なコスト効率指数。1.0 を超えるとそれまで以上のコスト効率が必要であることを意味する。',
    categoryId: 'measurement',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'EVMグラフ。横軸は時間（開始日・現時点・完了予定日）、縦軸は金額換算値。現時点で BAC=100、PV=50、AC=40、EV=34',
      caption: '図　BAC・PV・AC・EVの位置関係（現時点は中間点）',
      viewBox: '0 0 380 220',
      content: `
        <defs>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <rect x="55" y="25" width="290" height="160" fill="#fafafa"/>
        <line x1="55" y1="18" x2="55" y2="190" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="51,22 59,22 55,12" fill="#1e293b"/>
        <line x1="47" y1="185" x2="370" y2="185" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="368,181 368,189 378,185" fill="#1e293b"/>
        <text x="80" y="14" text-anchor="middle" font-size="10" fill="#475569" stroke-width="0">金額換算値</text>
        <line x1="53" y1="35" x2="57" y2="35" stroke="#1e293b" stroke-width="1"/>
        <text x="48" y="38" text-anchor="end" font-size="10" fill="#1e293b">100</text>
        <line x1="53" y1="110" x2="57" y2="110" stroke="#1e293b" stroke-width="1"/>
        <text x="48" y="113" text-anchor="end" font-size="10" fill="#1e293b">50</text>
        <line x1="53" y1="125" x2="57" y2="125" stroke="#1e293b" stroke-width="1"/>
        <text x="48" y="128" text-anchor="end" font-size="10" fill="#1e293b">40</text>
        <line x1="53" y1="134" x2="57" y2="134" stroke="#1e293b" stroke-width="1"/>
        <text x="48" y="142" text-anchor="end" font-size="10" fill="#1e293b">34</text>
        <line x1="195" y1="35" x2="195" y2="185" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="335" y1="35" x2="335" y2="185" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="55" y1="185" x2="335" y2="35" stroke="#1e293b" stroke-width="1.6"/>
        <line x1="55" y1="185" x2="195" y2="125" stroke="#1e293b" stroke-width="1.6"/>
        <line x1="55" y1="185" x2="195" y2="134" stroke="#1e293b" stroke-width="1.6"/>
        <text x="342" y="39" font-size="12" fill="#1e293b" font-weight="bold">BAC</text>
        <text x="202" y="108" font-size="12" fill="#1e293b" font-weight="bold">← PV</text>
        <text x="202" y="125" font-size="12" fill="#1e293b" font-weight="bold">← AC</text>
        <text x="202" y="146" font-size="12" fill="#1e293b" font-weight="bold">← EV</text>
        <text x="55" y="205" text-anchor="middle" font-size="11" fill="#1e293b">開始日</text>
        <text x="195" y="205" text-anchor="middle" font-size="11" fill="#1e293b">現時点</text>
        <text x="335" y="205" text-anchor="middle" font-size="11" fill="#1e293b">完了予定日</text>
      `,
    },
  },
  {
    id: 'om-R6-5',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 5,
    questionText:
      'あるプロジェクトの作業が図のとおり計画されているとき，最短日数で終了するためには，作業 H はプロジェクトの開始から遅くとも何日経過した後に開始しなければならないか。',
    choices: ['12', '14', '18', '21'],
    correctIndex: 3,
    explanation: 'クリティカルパスは A(8)+D(10)+G(12)=30 日。Hの後続は H(5)+I(4)=9 日。HはダミーによりD/E完了後に開始可能なので，全体30日を超えないために H の最遅開始は 30 − 9 = 21日後。なおC(12)単独経由よりA+D(18)経由が長く，これがHの最早開始制約。よって答えはエ。',
    categoryId: 'planning',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'アローダイアグラム。A=8, B=5, C=12, D=10, E=9, F=8, G=12, H=5, I=4。DとEの合流点からHの開始ノードへダミー作業あり。',
      caption: '図　矢印上＝作業名，矢印下＝所要日数，破線＝ダミー作業',
      viewBox: '0 0 620 290',
      content: `
        <defs>
          <marker id="am5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3.5px; stroke-linejoin: round; }</style>
        </defs>
        <line x1="55" y1="135" x2="167" y2="58" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="92" y="88" font-size="13" fill="#1e293b" font-weight="bold">A</text>
        <text x="92" y="103" font-size="12" fill="#475569">8</text>
        <line x1="56" y1="140" x2="166" y2="140" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="100" y="132" font-size="13" fill="#1e293b" font-weight="bold">B</text>
        <text x="100" y="155" font-size="12" fill="#475569">5</text>
        <line x1="54" y1="146" x2="326" y2="216" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="160" y="178" font-size="13" fill="#1e293b" font-weight="bold">C</text>
        <text x="160" y="200" font-size="12" fill="#475569">12</text>
        <line x1="194" y1="55" x2="326" y2="86" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="246" y="58" font-size="13" fill="#1e293b" font-weight="bold">D</text>
        <text x="246" y="84" font-size="12" fill="#475569">10</text>
        <line x1="194" y1="135" x2="326" y2="96" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="246" y="120" font-size="13" fill="#1e293b" font-weight="bold">E</text>
        <text x="246" y="144" font-size="12" fill="#475569">9</text>
        <line x1="354" y1="94" x2="546" y2="135" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="436" y="102" font-size="13" fill="#1e293b" font-weight="bold">F</text>
        <text x="436" y="128" font-size="12" fill="#475569">8</text>
        <path d="M 354 102 Q 440 180 546 144" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#am5)"/>
        <text x="436" y="160" font-size="13" fill="#1e293b" font-weight="bold">G</text>
        <text x="436" y="195" font-size="12" fill="#475569">12</text>
        <line x1="340" y1="106" x2="340" y2="204" stroke="#475569" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#am5)"/>
        <line x1="356" y1="220" x2="444" y2="220" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="391" y="212" font-size="13" fill="#1e293b" font-weight="bold">H</text>
        <text x="391" y="237" font-size="12" fill="#475569">5</text>
        <line x1="474" y1="215" x2="546" y2="148" stroke="#475569" stroke-width="1.5" marker-end="url(#am5)"/>
        <text x="522" y="170" font-size="13" fill="#1e293b" font-weight="bold">I</text>
        <text x="498" y="195" font-size="12" fill="#475569">4</text>
        <circle cx="40" cy="140" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="180" cy="50" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="180" cy="140" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="340" cy="90" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="340" cy="220" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="460" cy="220" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="560" cy="140" r="16" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <line x1="20" y1="278" x2="50" y2="278" stroke="#475569" stroke-width="1.5" stroke-dasharray="5,3"/>
        <text x="55" y="282" font-size="11" fill="#475569">：ダミー作業</text>
      `,
    },
  },
  {
    id: 'om-R6-6',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 6,
    questionText:
      '四つのアクティビティ A～D によって実行する開発プロジェクトがある。図は，各アクティビティの PDM (プレシデンスダイアグラム法) における依存関係を表す。条件に従ってアクティビティを実行するとき，この開発プロジェクトの最少所要日数は何日か。\n〔条件〕\n・各アクティビティは，最終 3 日間に，連続して試験設備を使用する。\n・試験設備は 1 台であって，同時に複数のアクティビティが使用することはできない。\n・試験設備以外の資源にアクティビティ間の競合はない。',
    choices: ['18', '19', '20', '21'],
    correctIndex: 1,
    explanation: 'PDM 上の FS 依存に従う最早完了は A(8)+C(5)+D(5)=18 日，B=12 日でクリティカルパスは 18 日。ただし試験設備は 1 台で，各アクティビティの「最終 3 日間」が競合する。設備使用区間が重ならないように 1 日ずらすと最少所要日数は 19 日となる。',
    categoryId: 'planning',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'PDMプレシデンスダイアグラム。開始→A(8日間)→C(5日間)→D(5日間)→終了 の経路、および 開始→B(12日間)→終了 の経路。A→C と C→D は FS 依存。',
      caption: '図　アクティビティの依存関係（FS：Finish-to-Start）',
      viewBox: '0 0 480 180',
      content: `
        <defs>
          <marker id="am6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <rect x="20" y="55" width="50" height="30" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="45" y="74" text-anchor="middle" font-size="12" fill="#1e293b" font-weight="bold">開始</text>
        <rect x="100" y="30" width="70" height="50" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="135" y="50" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">A</text>
        <text x="135" y="68" text-anchor="middle" font-size="11" fill="#475569">(8日間)</text>
        <rect x="200" y="30" width="70" height="50" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="235" y="50" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">C</text>
        <text x="235" y="68" text-anchor="middle" font-size="11" fill="#475569">(5日間)</text>
        <rect x="300" y="30" width="70" height="50" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="335" y="50" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">D</text>
        <text x="335" y="68" text-anchor="middle" font-size="11" fill="#475569">(5日間)</text>
        <rect x="100" y="105" width="70" height="50" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="135" y="125" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">B</text>
        <text x="135" y="143" text-anchor="middle" font-size="11" fill="#475569">(12日間)</text>
        <rect x="400" y="55" width="50" height="30" fill="white" stroke="#1e293b" stroke-width="1.5" rx="3"/>
        <text x="425" y="74" text-anchor="middle" font-size="12" fill="#1e293b" font-weight="bold">終了</text>
        <line x1="70" y1="62" x2="98" y2="48" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
        <line x1="170" y1="55" x2="198" y2="55" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
        <text x="184" y="48" text-anchor="middle" font-size="10" fill="#475569" font-weight="bold">FS</text>
        <line x1="270" y1="55" x2="298" y2="55" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
        <text x="284" y="48" text-anchor="middle" font-size="10" fill="#475569" font-weight="bold">FS</text>
        <line x1="370" y1="55" x2="398" y2="62" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
        <line x1="70" y1="80" x2="98" y2="120" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
        <line x1="170" y1="125" x2="398" y2="80" stroke="#475569" stroke-width="1.5" marker-end="url(#am6)"/>
      `,
    },
  },
  {
    id: 'om-R6-7',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 7,
    questionText: 'アジャイル型開発プロジェクトの管理に用いるベロシティの説明はどれか。',
    choices: [
      '開発規模を見積もる際の規模の単位であって，ユーザーストーリー同士を比較し，相対的な量で表すものである。',
      '完了待ちのプロダクト要求事項と成果物とを組み合わせたものをビジネスにおける優先順に並べたものである。',
      '定められた期間で完了した作業量と残作業量とをグラフにして進捗状況を表すものである。',
      '定められた期間に受入れが行われたチームの成果物の量を表すものである。',
    ],
    correctIndex: 3,
    explanation: 'ベロシティは「定められた期間（1 スプリント）に受入が完了したチームの成果物の量」であり，チームの実績生産性を計測する指標。ア はストーリーポイント，イ はプロダクトバックログ，ウ はバーンダウンチャートの説明。',
    categoryId: 'development-approach',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-8',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 8,
    questionText:
      'EVM を採用しているプロジェクトにおいて，ある時点の CPI が 1.0 を下回っていた場合の対処として，適切なものはどれか。',
    choices: [
      '実コストが予算コストを下回っているので，CPI に基づいて完成時総コストを下方修正する。',
      '実コストを CPI で割った値を使って，完成時総コストを見積もり，これを予想値とする。',
      '超過コストの原因を明確にし，コスト効率を向上させるための対策に取り組むとともに，CPI の値を監視する。',
      'プロジェクトの完成時には CPI が 1.0 となることを利用して，CPI が 1.0 となる完成時期を予測し，スケジュールを見直す。',
    ],
    correctIndex: 2,
    explanation: 'CPI<1.0 はコストが超過している状態。原因を分析し是正処置を実施したうえで CPI を継続監視するのが定石。ア は逆方向の修正，イ は値が完成時総コスト見積りとして妥当でない計算，エ は CPI が自然に 1.0 になる保証がないため不適切。',
    categoryId: 'measurement',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-9',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 9,
    questionText:
      'あるソフトウェア開発部門では，開発工数 E (人月) と開発規模 L (k ステップ) との関係を，E=5.2L^{0.98} としている。L=10 としたときの生産性 (k ステップ／人月) は，およそ幾らか。',
    choices: ['0.2', '0.5', '1.9', '5.2'],
    correctIndex: 0,
    explanation: 'E = 5.2 × 10^{0.98} ≒ 5.2 × 9.55 ≒ 49.66 人月。生産性 = L / E = 10 / 49.66 ≒ 0.20 k ステップ/人月。指数が 1 に近いためほぼ線形だが，0.98 の影響でわずかに L 増加効率が低下している。',
    categoryId: 'measurement',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-10',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 10,
    questionText:
      '工程別の生産性が次のとおりのとき，全体の生産性を表す式はどれか。\n〔工程別の生産性〕\n設計工程: X ステップ／人月\n製造工程: Y ステップ／人月\n試験工程: Z ステップ／人月',
    choices: [
      'X＋Y＋Z',
      'frac{X＋Y＋Z}{3}',
      'frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}',
      'frac{1}{frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}}',
    ],
    correctIndex: 3,
    explanation: '直列の工程を 1 人月で通過させると考えると，各工程で 1/X，1/Y，1/Z 人月を消費するため，合計所要人月は 1/X + 1/Y + 1/Z。よって全体の生産性（ステップ/人月）はこの逆数 1 / (1/X + 1/Y + 1/Z) となる。これは並列ではなく直列工程の調和平均的合成式。',
    categoryId: 'measurement',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-11',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 11,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，対象群 “リスク” の活動内容のうち，プロセス “リスクへの対応” で実施するものはどれか。',
    choices: [
      'プロジェクトの混乱を最小限にするために，リスク対応の有効性を評価しながらリスク対応の進捗をレビューする。',
      'プロジェクトの目標への脅威を軽減するために，プロジェクトの予算及びスケジュールに資源と活動とを投入することによって，リスクを扱う。',
      'プロジェクトのライフサイクルを通じて，プロジェクトの目標に影響を与えることがある潜在的リスク事象及びその特性の決定を繰り返す。',
      'リスクの優先順位を定めるために，各リスクの発生確率及びそのリスクが発生した場合にプロジェクトの目標に及ぼす結果を推定する。',
    ],
    correctIndex: 1,
    explanation: '「リスクへの対応」（Treat Risks）プロセスは，特定・評価したリスクに対し予算・スケジュール・資源・活動を 投入して対処する実行プロセス。ア は「リスクの管理」，ウ は「リスクの特定」，エ は「リスクの評価」プロセスの説明。',
    categoryId: 'uncertainty',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-12',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 12,
    questionText:
      '新しく編成するプロジェクトチームの開発要員投入計画に基づいて PC をレンタルで調達する。調達の条件を満たすレンタル費用の最低金額は何千円か。\n〔調達の条件〕\n(1) PC のレンタル契約は月初日から月末日までの 1 か月単位であって，日割りによる精算は行わない。\n(2) PC 1 台のレンタル料金は月額 5 千円である。\n(3) 台数にかかわらず，レンタル PC の受入れ時のセットアップに 2 週間，返却時のデータ消去に 1 週間を要し，この期間はレンタル期間に含める。\n(4) セットアップとデータ消去は，プロジェクトチームの開発要員とは別の要員が行う。\n(5) 開発要員は月初日に着任し，月末日に離任する。\n(6) 開発要員の役割にかかわらず，共通仕様の PC を 1 人が 1 台使用する。\n(7) レンタル期間中に PC を他の開発要員に引き渡す場合，データ消去，セットアップ及び引渡しの期間は不要である。',
    choices: ['350', '470', '480', '500'],
    correctIndex: 1,
    explanation: '月別必要 PC 台数は要員計画の合計欄から導かれる（最大は 6月／7月／9月の 11 台）。セットアップ 2 週間・データ消去 1 週間がレンタル期間に含まれること，月途中の解約や日割り精算ができないことを考慮して必要月数を計算し，月額 5 千円/台で総額を算出すると最低 470 千円となる。',
    categoryId: 'project-work',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔開発要員投入計画（単位：人　列は月）〕',
      // モバイル幅（360px）でも横スクロール無しで収まるよう、列ヘッダは月数字のみ
      headers: ['要員 ＼ 月', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      rows: [
        ['設計者', 0, 2, 4, 4, 4, 2, 2, 2, 2, 2, 2, 0],
        ['プログラマ', 0, 0, 0, 3, 3, 5, 5, 3, 3, 2, 2, 0],
        ['テスタ', 0, 0, 0, 0, 0, 4, 4, 4, 6, 0, 0, 0],
        ['計', 0, 2, 4, 7, 7, 11, 11, 9, 11, 4, 4, 0],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R6-13',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 13,
    questionText: 'ソフトウェアパターンのうち，GoF のデザインパターンの説明はどれか。',
    choices: [
      'Java のパターンとして，引数オブジェクト，オブジェクトの可変性などで構成される。',
      'オブジェクト指向開発のためのパターンであって，生成，構造，振る舞いの三つのカテゴリに分類される。',
      '構造，分散システム，対話型システム及び適合型システムの四つのカテゴリに分類される。',
      '抽象度が異なる要素を分割して階層化するための Layers，コンポーネント分割のための Broker などで構成される。',
    ],
    correctIndex: 1,
    explanation: 'GoF（Gang of Four）デザインパターンはオブジェクト指向設計のための 23 パターンで，Creational（生成）・Structural（構造）・Behavioral（振る舞い）の 3 カテゴリに分類される。ア・ウ・エ は別パターン体系（J2EE，アーキテクチャパターン，POSA など）の説明。',
    categoryId: 'tailoring-models',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-14',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 14,
    questionText:
      '基幹システムの更改に伴って，移行リハーサルを実施した。移行リハーサルの目的に照らして移行リハーサルの完了の仕方として，適切なものはどれか。',
    choices: [
      '移行作業中に，環境に起因する問題が発生したが，その場で対応して移行手順どおりに移行作業を終了した。発生した問題については，移行作業終了後に，本番の環境では発生しないことが確認できたので，移行リハーサルを完了した。',
      '移行作業中に問題が発生しなかったので，計画していた切り戻しの作業は実施せずに，移行リハーサルを完了した。',
      '一部の移行作業の担当者が移行作業中に不在となる時間があったので，計画していた移行作業の作業順を入れ替えて計画時間内に移行作業を終了し，移行リハーサルを完了した。',
      '計画していた移行作業の時間を超過したが，手順どおりに移行作業を終了したので，移行リハーサルを完了した。',
    ],
    correctIndex: 0,
    explanation: '移行リハーサルの目的は本番移行のリスク洗い出しと手順検証。発生問題は原因究明と本番非発生の確認が完了条件であり，ア が適切。イ は切戻し検証を省略，ウ は計画外の作業順変更，エ は時間超過が放置されており，いずれも目的未達。',
    categoryId: 'integration',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-15',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 15,
    questionText: 'CMMI モデル V2.0 における成熟度レベルの状態のうち，レベル 4 の状態はどれか。',
    choices: [
      '企業組織は，継続的な改善に焦点を合わせ，機会と変化に対して方向転換や対応ができるよう構築される。組織の安定性が，プラットフォームに機敏性と革新をもたらす。',
      '企業組織は，定量的な実績の改善目標 (予測可能) とともにデータで運営され，内外の利害関係者のニーズを満たすように調整する。',
      '組織全体の標準が，プロジェクト，プログラム，及びポートフォリオにわたって手引を提供する。',
      'プロジェクトレベルで管理されている。プロジェクトは，計画され，実施され，測定され，そして制御されている。',
    ],
    correctIndex: 1,
    explanation: 'CMMI V2.0 成熟度レベルは 1=Initial / 2=Managed / 3=Defined / 4=Quantitatively Managed / 5=Optimizing。レベル 4 は「定量的な実績目標とともにデータで運営される」段階。ア はレベル 5，ウ はレベル 3，エ はレベル 2 の説明。',
    categoryId: 'governance',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-16',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 16,
    questionText:
      'アジャイル開発において，質の高いユーザーストーリーを作成するための観点として “INVEST” がある。ユーザーストーリーに対する評価のうち，“INVEST” の観点に合致したものはどれか。',
    choices: [
      '開発者にとって，価値があるものになっている。',
      '作業期間に対して適切な大きさになっている。',
      '詳細な要件や実装方法が定義され，議論や交渉の余地がない状態になっている。',
      '他のユーザーストーリーとの依存関係をもっている。',
    ],
    correctIndex: 1,
    explanation: 'INVEST は I=Independent，N=Negotiable，V=Valuable（顧客にとって価値），E=Estimable，S=Small（作業期間に対し適切な大きさ），T=Testable の頭字語。イ は S に対応する。ア は顧客ではなく開発者の価値，ウ は N に反し，エ は I に反する。',
    categoryId: 'development-approach',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-17',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 17,
    questionText:
      '“アジャイルソフトウェア開発宣言” で述べている価値に関する記述のうち，適切なものはどれか。',
    choices: [
      '計画に従うことに価値があることを認めながらも，自己組織化されたチームによる裁量に，より価値をおく。',
      '契約交渉に価値があることを認めながらも，顧客の競争力と満足度の向上に，より価値をおく。',
      'プロセスやツールに価値があることを認めながらも，実用的なプラクティスに，より価値をおく。',
      '包括的なドキュメントに価値があることを認めながらも，動くソフトウェアに，より価値をおく。',
    ],
    correctIndex: 3,
    explanation: 'アジャイルソフトウェア開発宣言の四つの価値観は「プロセスやツールよりも個人と対話を」「包括的なドキュメントよりも動くソフトウェアを」「契約交渉よりも顧客との協調を」「計画に従うことよりも変化への対応を」。エ は「包括的なドキュメントよりも動くソフトウェアを」に一致し正解。ア は右辺が宣言では「変化への対応」だが「自己組織化されたチームによる裁量」に改変されており誤り。イ は右辺が宣言では「顧客との協調」だが「顧客の競争力と満足度の向上」に改変されており誤り。ウ は右辺が宣言では「個人と対話」だが「実用的なプラクティス」に改変されており誤り。',
    categoryId: 'development-approach',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-18',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 18,
    questionText:
      'JIS Q 20000-1:2020 (サービスマネジメントシステム要求事項) が規定しているものはどれか。',
    choices: [
      'サービスの計画，運用，維持，改善を支援する製品又はツールの仕様に関する要求事項',
      'サービスマネジメントシステムを確立し，実施し，維持し，継続的に改善するための組織に対する要求事項',
      'サービスマネジメントシステムを適用する組織の形態若しくは規模，又は提供するサービスの性質に応じた要求事項',
      '組織が使用しているサービスマネジメントの用語を，当該規格で使用している用語に置き換えるための要求事項',
    ],
    correctIndex: 1,
    explanation: 'ISO/IEC 20000-1（JIS Q 20000-1:2020）はサービスマネジメントシステム（SMS）の要求事項を規定する規格で，組織が SMS を確立・実施・維持・改善するための要件を定める。ア・ウ・エ は規格のスコープに含まれない。',
    categoryId: 'service-management',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-19',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 19,
    questionText:
      'データの追加・変更・削除が，少ないながらも一定の頻度で行われるデータベースがある。このデータベースのフルバックアップを磁気テープに取得する時間間隔を今までの 2 倍にした。このとき，データベースのバックアップ又は復旧に関する記述のうち，適切なものはどれか。',
    choices: [
      '復旧時に行うログ情報反映の平均処理時間が約 2 倍になる。',
      'フルバックアップ取得 1 回当たりの磁気テープ使用量が約 2 倍になる。',
      'フルバックアップ取得 1 回当たりの磁気テープ使用量が約半分になる。',
      'フルバックアップ取得の平均処理時間が約 2 倍になる。',
    ],
    correctIndex: 0,
    explanation: 'フルバックアップ間隔を 2 倍にすると，前回バックアップから現時点までのログ蓄積量が約 2 倍となり，復旧時に行うログ反映（ロールフォワード）の処理時間が約 2 倍に増える。バックアップ 1 回当たりの容量・取得時間はデータベース総量で決まり間隔には依存しない。',
    categoryId: 'service-management',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-20',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 20,
    questionText:
      'システム開発における発注者と受注者であるベンダーとの契約方法のうち，実費償還契約はどれか。',
    choices: [
      '委託業務の進行中に発生するリスクはベンダーが負い，発注者は注文時に合意した価格を支払う。',
      'インフレ率や特定の製品の調達コストの変化に応じて，あらかじめ取り決められた契約金額を調整する。',
      '契約時に，目標とするコスト，利益，利益配分率，上限額を合意し，目標とするコストと実際に発生したコストの差異に基づいて利益を配分する。',
      'ベンダーの役務や技術に対する報酬に加え，委託業務の遂行に要した費用の全てをベンダーに支払う。',
    ],
    correctIndex: 3,
    explanation: '実費償還契約（Cost Reimbursable）は，ベンダーが負担した実費に報酬（フィー）を加えて支払う契約形態。ア は完全定額契約（FFP），イ は価格調整付き定額契約，ウ はインセンティブフィー（CPIF）の説明。',
    categoryId: 'project-work',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-21',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 21,
    questionText:
      '経済産業省が公表した “AI・データの利用に関する契約ガイドライン 1.1 版” における，AI 技術を利用したソフトウェアの開発・利用に関するユーザーとベンダー間の契約についての記述のうち，適切なものはどれか。',
    choices: [
      'AI 技術の発展・普及に伴い，法律は適宜改正されており，AI 技術を利用したソフトウェアの開発・利用に関するユーザーとベンダー間の契約に関する権利関係や責任関係は，全て法律で規定されている。',
      'AI 技術を利用したソフトウェアの開発でユーザーがベンダーに提供するデータは，一般に公表されているデータだけを使うので，その経済的価値や，秘匿性に関して，契約上考慮する必要はない。',
      'ユーザーとベンダー間で AI 技術を利用したソフトウェアの開発・利用に関する契約プラクティスが確立していないことが，AI 技術を利用したソフトウェアに関する法的問題が発生する一因である。',
      'ユーザーとベンダー間で AI 技術を利用したソフトウェアの開発・利用に関する契約を締結するときに，法的拘束力を有するこのガイドラインにのっとって責任分担を明確にしなければならない。',
    ],
    correctIndex: 2,
    explanation: '経済産業省「AI・データの利用に関する契約ガイドライン」は法的拘束力をもたず，AI 開発・利用の契約プラクティスが未確立であることを背景に，参考枠組みを提示するもの。ア は法律で全て規定されている前提が誤り，イ はデータの経済価値や秘匿性は考慮必須，エ はガイドラインに法的拘束力なしのため誤り。',
    categoryId: 'project-work',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-22',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 22,
    questionText:
      '技術者倫理における集団思考の問題点として，アーヴィング・ジャニスが指摘した八つの兆候のうちの “心の警備” の説明として，適切なものはどれか。',
    choices: [
      '自分の所属している集団は失敗することがなく，又は万が一失敗しても集団は存続すると考える。',
      '集団に新しく加わったメンバーなどが異議を唱える場合には，それを阻止して，集団を保護しようとする。',
      '他のメンバーから特に意見が出されず，発言者以外の全メンバーが沈黙している場合は，その意見を集団組織の一致した意見とみなす。',
      '反対する少数メンバーがいる場合は，そのメンバーに圧力を加えて統一した意見にさせる。',
    ],
    correctIndex: 1,
    explanation: '「心の警備（Mindguard）」は，集団思考を脅かす情報や異議を遮断して集団を保護する役割を指す。ア は「不死身の幻想」，ウ は「全会一致の幻想」，エ は「異議者への直接圧力」で，ジャニスの集団思考 8 兆候の別項目に該当する。',
    categoryId: 'governance',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-23',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 23,
    questionText: '複数のシステムやサービスの間で利用される SAML はどれか。',
    choices: [
      'システムの負荷や動作状況に関する情報を送信するための仕様',
      '脆弱性に関する情報や脅威情報を交換するための仕様',
      '通信を暗号化し，VPN を実装するための仕様',
      '認証や認可に関する情報を交換するための仕様',
    ],
    correctIndex: 3,
    explanation: 'SAML（Security Assertion Markup Language）は，ID プロバイダとサービスプロバイダの間で 認証・認可に関する情報を XML 形式で交換する仕様で，シングルサインオン（SSO）の基盤として広く利用される。ア・イ・ウ は SAML の機能ではない。',
    categoryId: 'service-management',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-24',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 24,
    questionText:
      'JPCERT コーディネーションセンター “CSIRT ガイド” におけるインシデントマネジメントの業務のうち，インシデントハンドリングに含まれるものはどれか。',
    choices: ['インシデント対応演習', 'インシデント対応マニュアルの整備', '脆弱性情報ハンドリング', 'トリアージ'],
    correctIndex: 3,
    explanation: 'JPCERT/CC「CSIRT ガイド」のインシデントハンドリングは検知 → トリアージ → 対応 → 報告の流れで構成される。トリアージは緊急度・影響度を評価し対応優先順位を決める活動で，ハンドリングの中核。ア・イ は事前準備，ウ は別業務（脆弱性ハンドリング）。',
    categoryId: 'service-management',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-25',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 25,
    questionText:
      '公開された実証コード (PoC: Proof of Concept) を使って，インターネットから Web サーバを狙う攻撃がある。こういった攻撃に自社の Web サーバが侵害される被害を未然に防ぐ対策として，最も効果があるものはどれか。',
    choices: [
      'JIS Q 27001:2023 で規定される “人的管理策” にのっとり，自社の Web サーバについての秘密情報を持ち出すおそれがない人物か，職員採用時に厳格な適格性検査を行う。',
      'SNS サイトやダークウェブを巡回し，自社の Web サーバについて秘密として管理している情報が売買されていないことを確認する。',
      '自社の Web サーバで使用しているソフトウェアの脆弱性情報を確認し，ワークアラウンドの実施又は脆弱性修正プログラムの適用を行う。',
      'ファイアウォールを用いて外部との通信を記録し，自社の Web サーバから不審な宛先への通信が発生していないか調査する。',
    ],
    correctIndex: 2,
    explanation: '公開 PoC は既知の脆弱性を悪用する。最も効果的な未然防止策は，使用ソフトウェアの脆弱性情報を確認し，修正プログラムを適用（または一時的なワークアラウンドを実施）すること。ア は外部攻撃と直接関係せず，イ は事後検知，エ は侵害後の検知策で予防策ではない。',
    categoryId: 'service-management',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
]

/** 年度別問題リスト（OfficialMorningQuiz トップ画面の年度カード用） */
export function getMorningQuestionsByYear(year: string): OfficialMorningQuestion[] {
  return officialMorningQuestions
    .filter((q) => q.year === year)
    .sort((a, b) => a.number - b.number)
}
