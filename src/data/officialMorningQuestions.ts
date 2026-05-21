/**
 * 公式午前II（PM 午前II）問題データ
 *
 * 設計書 v0.16 §2.7b / F1.5-P4、および F2-P3 に従い、PM 午前II問題を投入。
 * 投入済み年度: 令和6年度 秋期、令和5年度 秋期、令和4年度 秋期、令和3年度 秋期、令和2年度 10月、平成31年度 春期、平成30年度 春期、平成29年度 春期、平成28年度 春期
 * - 問題文・選択肢: IPA 公式 PDF を Codex が OCR で抽出（一字一句引用、改変なし。H28 問2のみ公式誤問のため注記付き改題）
 * - 正解: IPA 公式解答例 PDF と照合済（H28 問2は公式「全員正解」措置のため、改題版の正解を設定）
 * - 解説: Claude が独自作成（PMBOK第7版＋IPA PM試験シラバス Ver7.1 ベース）
 *   - H29 / H28 は OCR 投入フェーズのため、次工程で追記予定
 *
 * IPA 著作権規約（memory/risks.md R1 参照）:
 * - 教育目的の引用は許諾・使用料不要
 * - 出典明記必須: 「出典：<年度> <期> プロジェクトマネージャ試験 午前II 問<番号>」
 * - 問題文・選択肢は IPA 公式のまま引用（改変なし）。解説のみ独自作成。
 * - 例外: H28 問2は IPA 公式が「問題誤りにつき受験者全員正解」としたため、学習用に注記付きで改題。
 *
 * 図表入り問題について:
 * - 問4（EVMグラフ）・問5（アローダイアグラム）・問6（PDM）: SVG として figure に格納
 * - 問12（開発要員投入計画）: HTML テーブルとして figure に格納
 * - 問10（数式選択肢）: 図表なし、選択肢自体に数式記号
 * - R4 問9・問10・問13・問18、R3 問4・問11、R2 問7・問9・問10、R1 問2・問8・問10・問13、H30 問6・問7・問8・問9、H29 問6・問10・問13・問15・問21、H28 問8・問11・問12: SVG/table として figure に格納
 * - レンダリングは OfficialMorningSession.tsx の QuestionFigureView コンポーネントが担当
 * - SVG は viewBox で自動スケール、テーブルは横スクロール対応でモバイル表示崩れ防止
 */

import type { OfficialMorningQuestion } from '../types'

export const MORNING_YEARS = ['R6', 'R5', 'R4', 'R3', 'R2', 'R1', 'H30', 'H29', 'H28'] as const

const R6_AUTUMN_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_am2_qs.pdf'

const R5_AUTUMN_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_am2_qs.pdf'

const R4_AUTUMN_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_am2_qs.pdf'

const R3_AUTUMN_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_am2_qs.pdf'

const R2_OCTOBER_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_am2_qs.pdf'

const R1_SPRING_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_am2_qs.pdf'

const H30_SPRING_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_am2_qs.pdf'

const H29_SPRING_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_am2_qs.pdf'

const H28_SPRING_PM_AM2_SOURCE_URL =
  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_am2_qs.pdf'

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
  {
    id: 'om-R5-1',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 1,
    questionText:
      'アジャイル開発プロジェクトの状況について，振り返りで得られた教訓のうち，“アジャイル宣言の背後にある原則”に照らして適切なものはどれか。\n〔プロジェクトの状況〕\nイテレーション1～6から成る開発を計画し，イテレーションごとに動くソフトウェアのデモを顧客に対して実施することによって，進捗状況を報告していた。イテレーション4のデモの後に顧客から機能追加の要求が提示された。顧客と対面による議論を行った結果，その要求に価値があると判断し，機能追加を受け入れることにした。機能追加を行うことによって，追加機能を含むイテレーション5の全機能の完成が間に合わなくなることが分かったので，イテレーション5の期間を延長してこの機能追加を行うことにした。イテレーション5で予定していた全ての機能を実装してイテレーション5のデモを行ったときに，追加した機能の使い勝手に問題があることが分かった。その時点で，当初予定した開発期間は終了した。',
    choices: [
      '開発の後期に提示された顧客からの機能追加の要求は受け入れず，拒否すべきであった。',
      '追加機能を含む機能の優先順位を顧客と合意し，イテレーション5の期間を延長せずに，優先順位の高い機能から開発すべきであった。',
      '使い勝手に関する認識の食い違いが発生しないように，対面ではなくメールによって記録を残す形で議論すべきであった。',
      'デモは顧客からの変更要望が出やすくなるので，進捗状況を完成度合いの数値で表して報告すべきであった。',
    ],
    correctIndex: 1,
    explanation: 'アジャイル宣言の背後にある原則は，「要求の変更はたとえ開発の後期であっても歓迎する」「動くソフトウェアを頻繁に提供する」を掲げ，変化に追随しつつ持続可能なペースを保つことを重視する。優先順位を合意して期間を延長せずに高優先機能から消化するイは原則と整合する。アは「変更を拒否」する点が原則に反し，ウは「対面の会話が最も効率的」という原則に反し，エは「動くソフトウェア」より進捗率報告を優先しており不適切。',
    categoryId: 'development-approach',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-2',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 2,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，プロジェクトマネジメントに関する計画のプロセス群のプロセス “プロジェクト全体計画の作成” を実施する目的として，適切なものはどれか。',
    choices: [
      '活動リストの活動ごとに必要な資源を決定する。',
      'どのようにしてプロジェクトを実行し，管理し，終結するのかを文書化する。',
      'プロジェクトに関係する全ての当事者から必要な全てのコミットメントを得る。',
      'プロジェクトの目標を達成するために完了する必要がある作業を表すための，階層的分割の枠組みを提供する。',
    ],
    correctIndex: 1,
    explanation: 'JIS Q 21500:2018「プロジェクト全体計画の作成」は，プロジェクトをどのように実行・管理・終結するかを文書化することが目的のプロセスである。ア は「アクティビティ資源の見積り」，ウ は「プロジェクト組織の定義」，エ は「WBS の作成」の目的。',
    categoryId: 'planning',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-3',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 3,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，プロジェクトマネジメントのプロセスのうち，計画のプロセス群に属するプロセスはどれか。',
    choices: ['スコープの定義', '品質保証の遂行', 'プロジェクト憲章の作成', 'プロジェクトチームの編成'],
    correctIndex: 0,
    explanation: 'JIS Q 21500:2018 では「スコープの定義」は計画のプロセス群に属する。イ「品質保証の遂行」とエ「プロジェクトチームの編成」は実行のプロセス群，ウ「プロジェクト憲章の作成」は立ち上げのプロセス群に属する。',
    categoryId: 'planning',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-4',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 4,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，プロジェクトマネージャがステークホルダの貢献をプロジェクトに最大限利用することができるように，プロセス “ステークホルダのマネジメント” で行う活動はどれか。',
    choices: [
      'ステークホルダ及びステークホルダがプロジェクトに及ぼす影響を詳細に分析する。',
      'ステークホルダのコミュニケーションのニーズを確実に満足し，コミュニケーションの課題を解決する。',
      'ステークホルダの情報のニーズ及び全ての法令要求に従った情報のニーズを特定し，そのニーズを満たすための適切な手段を明確にする。',
      'プロジェクトに影響されるか，又は影響を及ぼす個人，集団又は組織を明らかにし，その利害及び関係に関連する情報を文書化する。',
    ],
    correctIndex: 0,
    explanation: 'JIS Q 21500:2018「ステークホルダのマネジメント」プロセスは，貢献を最大限利用するために，ステークホルダ及びそのプロジェクトへの影響を詳細に分析することを活動として含む。イ・ウ はコミュニケーション系プロセス（コミュニケーションのマネジメント／コミュニケーションの計画），エ は「ステークホルダの特定」プロセスの活動。',
    categoryId: 'stakeholder',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-5',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 5,
    questionText:
      'ある組織では，プロジェクトのスケジュールとコストの管理にアーンドバリューマネジメントを用いている。期間10日間のプロジェクトの，5日目の終了時点の状況は表のとおりである。この時点でのコスト効率が今後も続くとしたとき，完成時総コスト見積り (EAC) は何万円か。',
    choices: ['110', '120', '135', '150'],
    correctIndex: 3,
    explanation: 'コスト効率指数 CPI = EV / AC = 40 / 60 = 2/3。コスト効率が今後も続く前提なので完成時総コスト見積りは EAC = BAC / CPI = 100 / (2/3) = 150 万円。EAC は残作業のコスト効率に応じた4式があるが，本問は「現在のコスト効率が継続」のパターン。',
    categoryId: 'measurement',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔5日目の終了時点の状況〕',
      headers: ['管理項目', '金額（万円）'],
      rows: [
        ['完成時総予算（BAC）', 100],
        ['プランドバリュー（PV）', 50],
        ['アーンドバリュー（EV）', 40],
        ['実コスト（AC）', 60],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R5-6',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 6,
    questionText:
      '表は，あるプロジェクトにおける作業①～④の担当者，所要日数の見積り，前作業を示している。条件に従って，クリティカルチェーンプロジェクトマネジメント (CCPM) によって日程計画を策定するとき，プロジェクトバッファを含めた全体の所要日数は何日か。\n〔条件〕\n・各作業は，前作業が終了してから開始する。\n・担当者が異なる作業は，並行して実施可能である。\n・各作業の余裕日数は，式 “HP－ABP” によって算出する。\n・プロジェクトバッファは，クリティカルチェーン上の作業の余裕日数の合計の半分とする。\n注1) HP (Highly Possible) による所要日数のこと。“まず大丈夫” と考えて見積もった所要日数であり，実現の確率は約90%である。\n注2) ABP (Aggressive But Possible) による所要日数のこと。“厳しそうだが，やればできる” と考えて見積もった所要日数であり，実現の確率は約50%である。',
    choices: ['11', '13', '14', '15'],
    correctIndex: 1,
    explanation: 'CCPM は ABP（50% 見積り）でスケジュールを組み，余裕日数の合計の半分をプロジェクトバッファとして末尾に置く。担当者 A は ① → ② → ④ の連続作業となり，これがクリティカルチェーン。ABP の合計 = 6+2+3 = 11 日。余裕日数（HP−ABP）合計 = 2+1+1 = 4 日 → バッファ = 4÷2 = 2 日。全体 = 11+2 = 13 日。',
    categoryId: 'planning',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔作業別の担当者，所要日数の見積り，前作業〕',
      headers: ['作業', '担当者', 'HP', 'ABP', '前作業'],
      rows: [
        ['①', 'A', 8, 6, 'なし'],
        ['②', 'A', 3, 2, '①'],
        ['③', 'B', 5, 3, 'なし'],
        ['④', 'A', 4, 3, '②，③'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R5-7',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 7,
    questionText:
      '四つのアクティビティA～Dによって実行する開発プロジェクトがある。図は，各アクティビティの依存関係を PDM (プレシデンスダイアグラム法) によって表している。各アクティビティの実行に当たっては，同じ専門チームの支援が必要である。条件に従ってアクティビティを実行するとき，開発プロジェクトの最少の所要日数は何日か。\n〔アクティビティの依存関係〕\n〔条件〕\n・各アクティビティの所要日数及び実行に当たっての専門チームの支援期間は，次のとおりである。\n・専門チームは，同時に複数のアクティビティの支援をすることはできない。\n・専門チームは，各アクティビティを連続した日程で支援する。\n・専門チーム以外の資源にアクティビティ間の競合はない。',
    choices: ['15', '16', '17', '18'],
    correctIndex: 1,
    explanation: '専門チームの支援は同時に1アクティビティしか行えないので，支援の競合解消が制約になる。A を 1〜10 日（支援 1〜4 日），C を支援が空く 5〜14 日（支援 5〜8 日）に配置し，B は A 終了後の 11〜15 日（支援 11〜12 日），D は支援が空く 13〜16 日に置けば 16 日で終了できる。各アクティビティの支援要件と先行関係を満たす最少日数として 16 日（イ）が成立する。',
    categoryId: 'planning',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'PDM図。開始からAへ進み、AからFSでBへ進み終了へ向かう。開始からCとDにも分岐し、それぞれ終了前の合流点へ向かう。下部にAからDの所要日数と専門チーム支援期間の表がある。',
      caption: '〔アクティビティの依存関係と専門チームの支援期間〕',
      viewBox: '0 0 560 372',
      content: `
        <defs>
          <marker id="amR5q7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <circle cx="58" cy="75" r="30" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="58" y="80" text-anchor="middle" font-size="14" fill="#1e293b">開始</text>
        <rect x="125" y="50" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="76" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">A</text>
        <rect x="285" y="50" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="332" y="76" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">B</text>
        <rect x="125" y="120" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="146" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">C</text>
        <rect x="125" y="190" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="216" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">D</text>
        <circle cx="485" cy="75" r="30" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="485" y="80" text-anchor="middle" font-size="14" fill="#1e293b">終了</text>
        <line x1="88" y1="75" x2="123" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <line x1="220" y1="75" x2="283" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <text x="252" y="64" text-anchor="middle" font-size="12" fill="#475569" font-weight="bold">FS</text>
        <line x1="380" y1="75" x2="453" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <path d="M 88 78 L 95 78 L 95 141 L 123 141" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <path d="M 88 82 L 95 82 L 95 211 L 123 211" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <path d="M 220 141 L 430 141 L 430 75 L 453 75" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <path d="M 220 211 L 430 211 L 430 75 L 453 75" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amR5q7)"/>
        <rect x="35" y="255" width="490" height="88" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="35" y1="277" x2="525" y2="277" stroke="#1e293b" stroke-width="1"/>
        <line x1="35" y1="299" x2="525" y2="299" stroke="#1e293b" stroke-width="1"/>
        <line x1="35" y1="321" x2="525" y2="321" stroke="#1e293b" stroke-width="1"/>
        <line x1="145" y1="255" x2="145" y2="343" stroke="#1e293b" stroke-width="1"/>
        <line x1="250" y1="255" x2="250" y2="343" stroke="#1e293b" stroke-width="1"/>
        <line x1="525" y1="255" x2="525" y2="343" stroke="#1e293b" stroke-width="1"/>
        <text x="90" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">アクティビティ名</text>
        <text x="197" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">所要日数（日）</text>
        <text x="388" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">専門チームの支援期間</text>
        <text x="90" y="294" text-anchor="middle" font-size="12" fill="#1e293b">A</text>
        <text x="197" y="294" text-anchor="middle" font-size="12" fill="#1e293b">10</text>
        <text x="388" y="294" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の4日間</text>
        <text x="90" y="316" text-anchor="middle" font-size="12" fill="#1e293b">B</text>
        <text x="197" y="316" text-anchor="middle" font-size="12" fill="#1e293b">5</text>
        <text x="388" y="316" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の2日間</text>
        <text x="90" y="338" text-anchor="middle" font-size="12" fill="#1e293b">C</text>
        <text x="197" y="338" text-anchor="middle" font-size="12" fill="#1e293b">10</text>
        <text x="388" y="338" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の4日間</text>
        <rect x="35" y="343" width="490" height="22" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="145" y1="343" x2="145" y2="365" stroke="#1e293b" stroke-width="1"/>
        <line x1="250" y1="343" x2="250" y2="365" stroke="#1e293b" stroke-width="1"/>
        <text x="90" y="358" text-anchor="middle" font-size="12" fill="#1e293b">D</text>
        <text x="197" y="358" text-anchor="middle" font-size="12" fill="#1e293b">4</text>
        <text x="388" y="358" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の全て</text>
      `,
    },
  },
  {
    id: 'om-R5-8',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 8,
    questionText:
      'プロジェクトのスケジュール管理で使用する “クリティカルチェーン法” の実施例はどれか。',
    choices: [
      '限りある資源とプロジェクトの不確実性とに対応するために，合流バッファとプロジェクトバッファとを設ける。',
      'クリティカルパス上の作業に，生産性を向上させるための開発ツールを導入する。',
      'クリティカルパス上の作業に，要員を追加投入する。',
      'クリティカルパス上の先行作業の全てが終了する前に後続作業に着手し，一部を並行して実施する。',
    ],
    correctIndex: 0,
    explanation: 'クリティカルチェーン法は，資源制約とプロジェクトの不確実性に対応するため，合流バッファ（非クリティカルチェーンの合流点に置く）とプロジェクトバッファ（クリティカルチェーン末尾に置く）を設ける手法。イ・ウ はクリティカルパス法上での生産性向上策・要員追加策，エ はファストトラッキング（並行化）の説明。',
    categoryId: 'planning',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-9',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 9,
    questionText:
      '従業員が週に40時間働くソフトウェア会社がある。この会社が，1人で開発すると440人時のプログラム開発を引き受けた。開発コストを次の条件で見積もるとき，10人のチームで開発する場合のコストは，1人で開発する場合のコストの何倍になるか。ここで，倍率は小数第2位を切り捨てて小数第1位まで求めるものとする。\n〔条件〕\n(1) 10人のチームでは，コミュニケーションをとるための工数が余分に発生する。\n(2) コミュニケーションはチームのメンバーが総当たりでとり，その工数は2人1組の組合せごとに週当たり4人時 (1人につき2時間) である。\n(3) 従業員の週当たりのコストは従業員間で差がない。\n(4) (1)～(3) 以外の条件は無視できる。',
    choices: ['1.2', '1.5', '1.8', '2.1'],
    correctIndex: 2,
    explanation: '10 人のコミュニケーション組合せは 10C2 = 45 組，週あたりの追加工数は 45 × 4 = 180 人時/週。チーム週稼働 10 × 40 = 400 人時/週から差し引き，開発に充てられるのは 220 人時/週なので 440 人時を完了するのに 2 週かかる。総コストは 400 × 2 = 800 人時。1 人開発時のコスト 440 人時との比は 800 ÷ 440 ≒ 1.81 → 切り捨てて 1.8 倍。',
    categoryId: 'measurement',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-10',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 10,
    questionText:
      '売上管理を行うアプリケーションソフトウェアの規模を，条件に従ってファンクションポイント法で見積もる。調整要因も加味したファンクションポイント数は幾つか。ここで，未調整ファンクションポイントの算出は，JIS X 0142:2010 (ソフトウェア技術－機能規模測定－IFPUG機能規模測定手法 (IFPUG 4.1版未調整ファンクションポイント) 計測マニュアル) による。\n〔条件〕\n・トランザクションファンクションの未調整ファンクションポイントの算出には，表1～表4を用いる。\n・データファンクションの未調整ファンクションポイントは，33である。\n・調整要因は，0.9である。',
    choices: ['45', '46', '49', '50'],
    correctIndex: 0,
    explanation: '各要素処理の複雑さを表2・表3で判定し，表4で FP 値に変換する。①外部入力(関連1, データ8) → 低=3，②外部照会(関連3, データ21) → 高=6，③外部照会(関連1, データ12) → 低=3，④外部出力(関連2, データ10) → 中=5。トランザクション小計 = 3+6+3+5 = 17。データファンクション 33 と合計して未調整 FP = 50。調整要因 0.9 を掛けて 50 × 0.9 = 45。',
    categoryId: 'measurement',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'ファンクションポイント法の表。表1は要素処理、表2は外部入力の複雑さ、表3は外部出力と外部照会の複雑さ、表4は未調整ファンクションポイントを示す。',
      caption: '表1〜表4　ファンクションポイント算出用の表',
      viewBox: '0 0 620 430',
      content: `
        <defs>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <text x="145" y="18" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">表1 要素処理</text>
        <rect x="20" y="28" width="260" height="140" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="20" y1="58" x2="280" y2="58" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="86" x2="280" y2="86" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="114" x2="280" y2="114" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="142" x2="280" y2="142" stroke="#1e293b" stroke-width="1"/>
        <line x1="72" y1="28" x2="72" y2="168" stroke="#1e293b" stroke-width="1"/>
        <line x1="152" y1="28" x2="152" y2="168" stroke="#1e293b" stroke-width="1"/>
        <line x1="220" y1="28" x2="220" y2="168" stroke="#1e293b" stroke-width="1"/>
        <text x="46" y="48" text-anchor="middle" font-size="11" fill="#1e293b">要素処理</text>
        <text x="112" y="48" text-anchor="middle" font-size="11" fill="#1e293b">ファンクション型</text>
        <text x="186" y="43" text-anchor="middle" font-size="11" fill="#1e293b">関連</text>
        <text x="186" y="55" text-anchor="middle" font-size="11" fill="#1e293b">ファイル数</text>
        <text x="250" y="43" text-anchor="middle" font-size="11" fill="#1e293b">データ</text>
        <text x="250" y="55" text-anchor="middle" font-size="11" fill="#1e293b">項目数</text>
        <text x="46" y="78" text-anchor="middle" font-size="12" fill="#1e293b">①</text><text x="112" y="78" text-anchor="middle" font-size="11" fill="#1e293b">外部入力</text><text x="186" y="78" text-anchor="middle" font-size="12" fill="#1e293b">1</text><text x="250" y="78" text-anchor="middle" font-size="12" fill="#1e293b">8</text>
        <text x="46" y="106" text-anchor="middle" font-size="12" fill="#1e293b">②</text><text x="112" y="106" text-anchor="middle" font-size="11" fill="#1e293b">外部照会</text><text x="186" y="106" text-anchor="middle" font-size="12" fill="#1e293b">3</text><text x="250" y="106" text-anchor="middle" font-size="12" fill="#1e293b">21</text>
        <text x="46" y="134" text-anchor="middle" font-size="12" fill="#1e293b">③</text><text x="112" y="134" text-anchor="middle" font-size="11" fill="#1e293b">外部照会</text><text x="186" y="134" text-anchor="middle" font-size="12" fill="#1e293b">1</text><text x="250" y="134" text-anchor="middle" font-size="12" fill="#1e293b">12</text>
        <text x="46" y="162" text-anchor="middle" font-size="12" fill="#1e293b">④</text><text x="112" y="162" text-anchor="middle" font-size="11" fill="#1e293b">外部出力</text><text x="186" y="162" text-anchor="middle" font-size="12" fill="#1e293b">2</text><text x="250" y="162" text-anchor="middle" font-size="12" fill="#1e293b">10</text>

        <text x="465" y="18" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">表2 複雑さ（外部入力）</text>
        <rect x="330" y="28" width="260" height="150" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="330" y1="58" x2="590" y2="58" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="88" x2="590" y2="88" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="118" x2="590" y2="118" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="148" x2="590" y2="148" stroke="#1e293b" stroke-width="1"/>
        <line x1="410" y1="28" x2="410" y2="178" stroke="#1e293b" stroke-width="1"/>
        <line x1="470" y1="58" x2="470" y2="178" stroke="#1e293b" stroke-width="1"/>
        <line x1="530" y1="58" x2="530" y2="178" stroke="#1e293b" stroke-width="1"/>
        <text x="370" y="51" text-anchor="middle" font-size="11" fill="#1e293b">関連ファイル数</text>
        <text x="500" y="45" text-anchor="middle" font-size="11" fill="#1e293b">データ項目数</text>
        <text x="440" y="76" text-anchor="middle" font-size="11" fill="#1e293b">1〜4</text><text x="500" y="76" text-anchor="middle" font-size="11" fill="#1e293b">5〜15</text><text x="560" y="76" text-anchor="middle" font-size="11" fill="#1e293b">16以上</text>
        <text x="370" y="106" text-anchor="middle" font-size="11" fill="#1e293b">0〜1</text><text x="440" y="106" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="500" y="106" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="560" y="106" text-anchor="middle" font-size="12" fill="#1e293b">中</text>
        <text x="370" y="136" text-anchor="middle" font-size="11" fill="#1e293b">2</text><text x="440" y="136" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="500" y="136" text-anchor="middle" font-size="12" fill="#1e293b">中</text><text x="560" y="136" text-anchor="middle" font-size="12" fill="#1e293b">高</text>
        <text x="370" y="160" text-anchor="middle" font-size="11" fill="#1e293b">3以上</text><text x="440" y="160" text-anchor="middle" font-size="12" fill="#1e293b">中</text><text x="500" y="160" text-anchor="middle" font-size="12" fill="#1e293b">高</text><text x="560" y="160" text-anchor="middle" font-size="12" fill="#1e293b">高</text>

        <text x="145" y="218" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">表3 複雑さ（外部出力，外部照会）</text>
        <rect x="20" y="228" width="260" height="150" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="20" y1="258" x2="280" y2="258" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="288" x2="280" y2="288" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="318" x2="280" y2="318" stroke="#1e293b" stroke-width="1"/>
        <line x1="20" y1="348" x2="280" y2="348" stroke="#1e293b" stroke-width="1"/>
        <line x1="100" y1="228" x2="100" y2="378" stroke="#1e293b" stroke-width="1"/>
        <line x1="160" y1="258" x2="160" y2="378" stroke="#1e293b" stroke-width="1"/>
        <line x1="220" y1="258" x2="220" y2="378" stroke="#1e293b" stroke-width="1"/>
        <text x="60" y="251" text-anchor="middle" font-size="11" fill="#1e293b">関連ファイル数</text>
        <text x="190" y="245" text-anchor="middle" font-size="11" fill="#1e293b">データ項目数</text>
        <text x="130" y="276" text-anchor="middle" font-size="11" fill="#1e293b">1〜5</text><text x="190" y="276" text-anchor="middle" font-size="11" fill="#1e293b">6〜19</text><text x="250" y="276" text-anchor="middle" font-size="11" fill="#1e293b">20以上</text>
        <text x="60" y="306" text-anchor="middle" font-size="11" fill="#1e293b">0〜1</text><text x="130" y="306" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="190" y="306" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="250" y="306" text-anchor="middle" font-size="12" fill="#1e293b">中</text>
        <text x="60" y="336" text-anchor="middle" font-size="11" fill="#1e293b">2〜3</text><text x="130" y="336" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="190" y="336" text-anchor="middle" font-size="12" fill="#1e293b">中</text><text x="250" y="336" text-anchor="middle" font-size="12" fill="#1e293b">高</text>
        <text x="60" y="366" text-anchor="middle" font-size="11" fill="#1e293b">4以上</text><text x="130" y="366" text-anchor="middle" font-size="12" fill="#1e293b">中</text><text x="190" y="366" text-anchor="middle" font-size="12" fill="#1e293b">高</text><text x="250" y="366" text-anchor="middle" font-size="12" fill="#1e293b">高</text>

        <text x="465" y="218" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">表4 未調整ファンクションポイント</text>
        <rect x="330" y="228" width="260" height="150" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="330" y1="258" x2="590" y2="258" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="288" x2="590" y2="288" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="318" x2="590" y2="318" stroke="#1e293b" stroke-width="1"/>
        <line x1="330" y1="348" x2="590" y2="348" stroke="#1e293b" stroke-width="1"/>
        <line x1="430" y1="228" x2="430" y2="378" stroke="#1e293b" stroke-width="1"/>
        <line x1="484" y1="258" x2="484" y2="378" stroke="#1e293b" stroke-width="1"/>
        <line x1="538" y1="258" x2="538" y2="378" stroke="#1e293b" stroke-width="1"/>
        <text x="380" y="245" text-anchor="middle" font-size="11" fill="#1e293b">ファンクション型</text>
        <text x="511" y="245" text-anchor="middle" font-size="11" fill="#1e293b">複雑さ</text>
        <text x="457" y="276" text-anchor="middle" font-size="12" fill="#1e293b">低</text><text x="511" y="276" text-anchor="middle" font-size="12" fill="#1e293b">中</text><text x="564" y="276" text-anchor="middle" font-size="12" fill="#1e293b">高</text>
        <text x="380" y="306" text-anchor="middle" font-size="11" fill="#1e293b">外部入力</text><text x="457" y="306" text-anchor="middle" font-size="12" fill="#1e293b">3</text><text x="511" y="306" text-anchor="middle" font-size="12" fill="#1e293b">4</text><text x="564" y="306" text-anchor="middle" font-size="12" fill="#1e293b">6</text>
        <text x="380" y="336" text-anchor="middle" font-size="11" fill="#1e293b">外部出力</text><text x="457" y="336" text-anchor="middle" font-size="12" fill="#1e293b">4</text><text x="511" y="336" text-anchor="middle" font-size="12" fill="#1e293b">5</text><text x="564" y="336" text-anchor="middle" font-size="12" fill="#1e293b">7</text>
        <text x="380" y="366" text-anchor="middle" font-size="11" fill="#1e293b">外部照会</text><text x="457" y="366" text-anchor="middle" font-size="12" fill="#1e293b">3</text><text x="511" y="366" text-anchor="middle" font-size="12" fill="#1e293b">4</text><text x="564" y="366" text-anchor="middle" font-size="12" fill="#1e293b">6</text>
      `,
    },
  },
  {
    id: 'om-R5-11',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 11,
    questionText: 'リスクマネジメントに使用する EMV (期待金額価値) の算出に用いる式はどれか。',
    choices: [
      'リスク事象発生時の影響金額×リスク事象の発生確率',
      'リスク事象発生時の影響金額÷リスク事象の発生確率',
      'リスク事象発生時の影響金額×リスク対応に掛かるコスト',
      'リスク事象発生時の影響金額÷リスク対応に掛かるコスト',
    ],
    correctIndex: 0,
    explanation: 'EMV（期待金額価値）= リスク事象発生時の影響金額 × 発生確率。脅威ならマイナス，好機ならプラスの符号を付けてリスク事象ごとに算出し，総和でポートフォリオの期待値を求める。除算や対応コストを掛ける式（イ・ウ・エ）はいずれも EMV の定義ではない。',
    categoryId: 'uncertainty',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-12',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 12,
    questionText:
      'JIS Q 21500:2018 (プロジェクトマネジメントの手引) によれば，プロセス “リスクの特定” 及びプロセス “リスクの評価” は，どのプロセス群に属するか。',
    choices: ['管理', '計画', '実行', '終結'],
    correctIndex: 1,
    explanation: 'JIS Q 21500:2018 のリスク主題群では，計画のプロセス群に「リスクの特定」「リスクの評価」が，実行のプロセス群に「リスクへの対応」が，管理のプロセス群に「リスクの管理」が配置されている。特定と評価はいずれも対応策を計画する前段の活動なので計画に属する。',
    categoryId: 'uncertainty',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-13',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 13,
    questionText:
      'a～c の説明に対応するレビューの名称として，適切な組合せはどれか。\na 参加者全員が持ち回りでレビュー責任者を務めながらレビューを行うので，参加者全員の参画意欲が高まる。\nb レビュー対象物の作成者が説明者になって，参加者は質問をし，かつ，要検討事項となり得るものについてコメントしてレビューを行う。\nc 資料を事前に準備し，進行役の議長や読み上げ係といった，参加者の役割をあらかじめ決めておくとともに，焦点を絞って厳密にレビューし，結果を分析して，レビュー対象物を公式に評価する。',
    choices: [
      'a: インスペクション，b: ウォークスルー，c: ラウンドロビン',
      'a: ウォークスルー，b: インスペクション，c: ラウンドロビン',
      'a: ラウンドロビン，b: インスペクション，c: ウォークスルー',
      'a: ラウンドロビン，b: ウォークスルー，c: インスペクション',
    ],
    correctIndex: 3,
    explanation: 'a の「参加者が持ち回りでレビュー責任者を務める」のはラウンドロビン，b の「作成者が説明者になり参加者が質問する」のはウォークスルー，c の「議長・読み上げ係を決め公式に評価する」のはインスペクションである。最も公式度が高いインスペクションは欠陥検出と記録，フォローアップまで含む点が特徴。',
    categoryId: 'delivery',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔レビュー名称の組合せ〕',
      headers: ['', 'a', 'b', 'c'],
      rows: [
        ['ア', 'インスペクション', 'ウォークスルー', 'ラウンドロビン'],
        ['イ', 'ウォークスルー', 'インスペクション', 'ラウンドロビン'],
        ['ウ', 'ラウンドロビン', 'インスペクション', 'ウォークスルー'],
        ['エ', 'ラウンドロビン', 'ウォークスルー', 'インスペクション'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R5-14',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 14,
    questionText: 'オブジェクト指向における汎化の説明として，適切なものはどれか。',
    choices: [
      'あるクラスを基に，これに幾つかの性質を付加することによって，新しいクラスを定義する。',
      '幾つかのクラスに共通する性質をもつクラスを定義する。',
      'オブジェクトのデータ構造から所有の関係を見つける。',
      '同一名称のメソッドをもつオブジェクトを抽象化してクラスを定義する。',
    ],
    correctIndex: 1,
    explanation: '汎化（generalization）とは，複数のクラスに共通する性質を抽出して上位のクラスとして定義する関係であり，下位（具象クラス）は上位（抽象クラス）の特化として位置付けられる。ア は逆方向の「特化」，ウ は所有関係である「集約」，エ は同名メソッドを束ねる「ポリモーフィズム（インタフェース抽象化）」の説明。',
    categoryId: 'tailoring-models',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-15',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 15,
    questionText: 'アジャイル開発のフレームワークであるスクラムのルールとして，適切なものはどれか。',
    choices: ['1か月以内のスプリント', '構造化言語による仕様の記述', '頻繁なリファクタリング', 'ペアプログラミング'],
    correctIndex: 0,
    explanation: 'スクラムガイドは，スプリントを 1 か月以内の固定期間（タイムボックス）で実施することを定めている。イ「構造化言語による仕様記述」はスクラムのルールではなく構造化分析の話。ウ「リファクタリング」とエ「ペアプログラミング」はエクストリームプログラミング（XP）のプラクティスであり，スクラム自体のルールではない。',
    categoryId: 'development-approach',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-16',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 16,
    questionText:
      'JIS X 0160:2021 (ソフトウェアライフサイクルプロセス) によれば，ソフトウェアシステムのライフサイクルで実行するプロセスグループの説明のうち，テクニカルプロセスの説明はどれか。',
    choices: [
      '取得者及び供給者の双方が，それらの組織のために価値を実現し，ビジネス戦略を支援することを可能にする。',
      '組織の管理者によって割り当てられた資源及び資産を管理すること，並びに一つ以上の組織が行った合意を果たすために資源及び資産を適用することに関係する。',
      'プロジェクトが組織の利害関係者のニーズ及び期待を満たすことができるように，必要な資源を提供することに関係する。',
      '利害関係者のニーズを製品又はサービスに変換し，その製品を適用するか，又はそのサービスを運用することによって，利害関係者要件を満たし，顧客満足を獲得できるようにする。',
    ],
    correctIndex: 3,
    explanation: 'JIS X 0160:2021 のテクニカルプロセスは，利害関係者ニーズを製品・サービスに変換し，それを適用または運用することで利害関係者要件を満たすことを目的とする。ア は合意プロセス，イ はプロジェクトプロセス，ウ は組織のプロジェクトイネーブリングプロセスの説明。',
    categoryId: 'development-approach',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-17',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 17,
    questionText:
      '組込み機器用のソフトウェアを開発委託する契約書に開発成果物の著作権の帰属先が記載されていない場合，委託元であるソフトウェア発注者に発生するおそれがある問題はどれか。ここで，当該ソフトウェアの開発は委託先が全て行うものとする。',
    choices: [
      '開発成果物を，委託元で開発する別のソフトウェアに適用できなくなる。',
      '当該ソフトウェアのソースコードを公開することが義務付けられる。',
      '当該ソフトウェアを他社に販売する場合，バイナリ形式では販売できるが，ソースコードは販売できなくなる。',
      '当該ソフトウェアを組み込んだ機器のハードウェア部分の特許を取得できなくなる。',
    ],
    correctIndex: 0,
    explanation: '著作権法上，受託者が単独で開発したプログラムの著作権は，契約で明示しない限り受託者（委託先）に帰属する。委託元が成果物を別ソフトに転用するには利用許諾や著作権譲渡が必要となる。イ ソースコード公開はオープンソース由来の義務で本件と無関係，ウ 他社販売の制限は別論点，エ ハードウェア特許は著作権ではなく特許権の話。',
    categoryId: 'project-work',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-18',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 18,
    questionText:
      '新システムの開発を計画している。提案された4案の中で，TCO (総所有費用) が最小のものはどれか。ここで，このシステムは開発後，3年間使用するものとする。',
    choices: ['A案', 'B案', 'C案', 'D案'],
    correctIndex: 2,
    explanation: '初期費用＋3年分のランニング費用で TCO を比較する。A 案 = (30+30+5) + (20+6+6)×3 = 65 + 96 = 161，B 案 = 85 + (20+5+4)×3 = 85 + 87 = 172，C 案 = 75 + (15+5+6)×3 = 75 + 78 = 153，D 案 = 85 + (15+5+4)×3 = 85 + 72 = 157。最小は C 案 = 153 百万円。',
    categoryId: 'measurement',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔提案された4案（単位：百万円）〕',
      headers: ['', 'A案', 'B案', 'C案', 'D案'],
      rows: [
        ['ハードウェア導入費用', 30, 30, 40, 40],
        ['システム開発費用', 30, 50, 30, 40],
        ['導入教育費用', 5, 5, 5, 5],
        ['ネットワーク通信費用／年', 20, 20, 15, 15],
        ['保守費用／年', 6, 5, 5, 5],
        ['システム運用費用／年', 6, 4, 6, 4],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R5-19',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 19,
    questionText:
      'JIS Q 20000-1:2020 (サービスマネジメントシステム要求事項) を適用している組織において，サービスマネジメントシステム (SMS) が次の要求事項に適合している状況にあるか否かに関する情報を提供するために，あらかじめ定めた間隔で組織が実施するものはどれか。\n〔要求事項〕\n・SMS に関して，組織自体が規定した要求事項\n・JIS Q 20000-1:2020 の要求事項',
    choices: ['監視，測定，分析及び評価', 'サービスの報告', '内部監査', 'マネジメントレビュー'],
    correctIndex: 2,
    explanation: 'JIS Q 20000-1:2020 では「内部監査」は，組織が自ら規定した要求事項と本規格の要求事項に SMS が適合しているかどうかの情報を得るため，あらかじめ定めた間隔で行うことを要求している。ア 監視・測定はパフォーマンスの把握，イ サービスの報告は顧客向けの情報提供，エ マネジメントレビューはトップマネジメントによる適切性・妥当性・有効性の評価。',
    categoryId: 'service-management',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-20',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 20,
    questionText:
      '要件定義プロセスにおいて，要件を評価する際には，矛盾している要件，検証できない要件などを識別することが求められている。次のうち，要件が検証可能である例はどれか。',
    choices: [
      '個々の要件に，対応必須，対応すべき，できれば対応，対応不要といったように重要性のランク付けがなされている。',
      'システムのライフサイクルの全期間を通して，システムに正当な利害関係をもつ個々の利害関係者が識別できている。',
      'システムやソフトウェアが，要件定義書の記述内容を満たすか否かをチェックするための方法があり，チェック作業が妥当な費用内で行える。',
      '実現可能か否かにはこだわらず，全ての利害関係者のニーズ及び期待が漏れなく要件定義書に盛り込まれている。',
    ],
    correctIndex: 2,
    explanation: '検証可能な要件とは「要件を満たすか否かを妥当な費用・労力で確認できる方法」が存在する要件であり，ウ がこれに該当する。ア は重要度のランク付けで「優先度の明確化」，イ は利害関係者の網羅性で「完全性」，エ はニーズの網羅で「完全性」を述べているが，いずれも検証可能性とは別の品質特性。',
    categoryId: 'delivery',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-21',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 21,
    questionText:
      'プロバイダ責任制限法が定める特定電気通信役務提供者が行う送信防止措置に関する記述として，適切なものはどれか。',
    choices: [
      '明らかに不当な権利侵害がなされている場合でも，情報の発信者から事前に承諾を得ていなければ，特定電気通信役務提供者は送信防止措置の結果として情報の発信者に生じた損害の賠償責任を負う。',
      '権利侵害を防ぐための送信防止措置の結果，情報の発信者に損害が生じた場合でも，一定の条件を満たしていれば，特定電気通信役務提供者は賠償責任を負わない。',
      '情報発信者に対して表現の自由を保障し，通信の秘密を確保するために，特定電気通信役務提供者は，裁判所の決定を受けなければ送信防止措置を実施することができない。',
      '特定電気通信による情報の流通によって権利を侵害された者が，個人情報保護委員会に苦情を申し立て，被害が認定された際に特定電気通信役務提供者に対して命令される措置である。',
    ],
    correctIndex: 1,
    explanation: 'プロバイダ責任制限法は，権利侵害情報の流通に対する送信防止措置を講じた場合，「権利侵害情報が流通していると信ずるに足りる相当の理由がある」など一定の条件を満たせば，特定電気通信役務提供者は発信者への損害賠償責任を負わないと定める（同法 4 条）。ア は事前承諾を必須化しており不適切，ウ 裁判所決定の要件は同法にない，エ 個人情報保護委員会ではなく被害者から直接の申出に対応する仕組み。',
    categoryId: 'governance',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-22',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 22,
    questionText: '労働基準法で定める制度のうち，いわゆる36協定と呼ばれる労使協定に関する制度はどれか。',
    choices: [
      '業務遂行の手段，時間配分の決定などを大幅に労働者に委ねる業務に適用され，労働時間の算定は，労使協定で定めた労働時間の労働とみなす制度',
      '業務の繁閑に応じた労働時間の配分などを行い，労使協定によって1か月以内の期間を平均して1週の法定労働時間を超えないようにする制度',
      '時間外労働，休日労働についての労使協定を書面で締結し，労働基準監督署に届け出ることによって，法定労働時間を超える時間外労働が認められる制度',
      '労使協定によって1か月以内の一定期間の総労働時間を定め，1日の固定勤務時間以外では，労働者に始業・終業時刻の決定を委ねる制度',
    ],
    correctIndex: 2,
    explanation: '36 協定（労働基準法 36 条）は，時間外労働・休日労働について労使協定を書面で締結し，労働基準監督署に届け出ることで法定労働時間を超える時間外労働を可能にする制度。ア は裁量労働制，イ は変形労働時間制（1 か月単位），エ はフレックスタイム制の説明。',
    categoryId: 'governance',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-23',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 23,
    questionText: 'セキュリティ評価基準である ISO/IEC 15408 の説明はどれか。',
    choices: [
      'IT 製品のセキュリティ機能を，IT 製品の仕様書，ガイダンス，開発プロセスなどの様々な視点から評価するための国際規格である。',
      'IT 製品やシステムを利用する要員に対するセキュリティ教育やセキュリティ監査の実施といった，組織でのセキュリティ管理を評価するための国際規格である。',
      '暗号モジュールに暗号アルゴリズムが適切に実装されているかどうかを評価するための国際規格である。',
      '評価保証レベル (Evaluation Assurance Level : EAL) の要件に基づいて，セキュリティ機能の強度を評価するための国際規格である。',
    ],
    correctIndex: 0,
    explanation: 'ISO/IEC 15408（コモンクライテリア，CC）は，IT 製品のセキュリティ機能を仕様書・ガイダンス・開発プロセスなど多面的に評価するための国際規格。イ は組織管理（ISO/IEC 27001 等）の領域，ウ は暗号モジュール評価（ISO/IEC 19790 / FIPS 140），エ は EAL の要件のみを述べた断片的な説明で誤り（CC は EAL に加え機能要件 PP・ST も評価対象）。',
    categoryId: 'service-management',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-24',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 24,
    questionText: 'デジタルフォレンジックスに該当するものはどれか。',
    choices: [
      '画像，音楽などのデジタルコンテンツに著作権者などの情報を埋め込む。',
      'コンピュータやネットワークのセキュリティ上の弱点を発見するテストとして，システムを実際に攻撃して侵入を試みる。',
      '巧みな話術，盗み聞き，盗み見などの手段によって，ネットワークの管理者，利用者などから，パスワードなどのセキュリティ上重要な情報を入手する。',
      '犯罪に関する証拠となり得るデータを保全し，調査，分析，その後の訴訟などに備える。',
    ],
    correctIndex: 3,
    explanation: 'デジタルフォレンジックスは，犯罪・インシデントの証拠となり得る電子データを改ざんなく保全・収集し，調査・分析することで，訴訟や原因究明に備える技術・手続きである。ア はデジタル透かし，イ はペネトレーションテスト，ウ はソーシャルエンジニアリングの説明。',
    categoryId: 'service-management',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R5-25',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 25,
    questionText: '脆弱性検査手法の一つであるファジングはどれか。',
    choices: [
      '既知の脆弱性に対するシステムの対応状況に注目し，システムに導入されているソフトウェアのバージョン及びパッチの適用状況の検査を行う。',
      'ソフトウェアの，データの入出力に注目し，問題を引き起こしそうなデータを大量に多様なパターンで入力して挙動を観察し，脆弱性を見つける。',
      'ソフトウェアの内部構造に注目し，ソースコードの構文をチェックすることによって脆弱性を見つける。',
      'ベンダーや情報セキュリティ関連機関が提供するセキュリティアドバイザリなどの最新のセキュリティ情報に注目し，ソフトウェアの脆弱性の検査を行う。',
    ],
    correctIndex: 1,
    explanation: 'ファジングは，ソフトウェアの入出力に注目し，問題を引き起こしそうな大量かつ多様なパターンのデータを入力して挙動を観察し，例外的・想定外の振る舞いから脆弱性を見つける動的な検査手法。ア はパッチ管理・バージョン管理の検査，ウ は静的解析（ホワイトボックス検査），エ はセキュリティアドバイザリ照合の説明。',
    categoryId: 'service-management',
    sourceUrl: R5_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-1',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 1,
    questionText:
      'JIS Q 21500:2018(プロジェクトマネジメントの手引)によれば，プロジェクトマネジメントのプロセス群には，立ち上げ，計画，実行，管理及び終結がある。これらのうち，"変更要求"の提出を契機に相互作用するプロセス群の組みはどれか。',
    choices: ['計画，実行', '実行，管理', '実行，終結', '管理，終結'],
    correctIndex: 1,
    explanation: '変更要求は，実行のプロセス群で作業中に必要性が認識されて提出され，管理のプロセス群の「変更の管理」プロセスで評価・承認・却下が行われる。承認されればベースラインを更新して実行に戻すため，実行と管理が相互作用する組合せ（イ）が正しい。',
    categoryId: 'integration',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-2',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 2,
    questionText: 'プロジェクトマネジメントにおけるプロジェクト憲章の説明として，適切なものはどれか。',
    choices: [
      '組織のニーズ，目標ベネフィットなどを記述することによって，プロジェクトの目標について，またプロジェクトがどのように事業目的に貢献するかについて明確にした文書',
      'どのようにプロジェクトを実施し，監視し，管理するのかを定めるために，プロジェクトを実施するためのベースライン，並びにプロジェクトの実行，管理，及び終結する方法を明確にした文書',
      'プロジェクトの最終状態を定義することによって，プロジェクトの目標，成果物，要求事項及び境界を含むプロジェクトスコープを明確にした文書',
      'プロジェクトを正式に許可する文書であって，プロジェクトマネージャを特定して適切な責任と権限を明確にし，ビジネスニーズ，目標，期待される結果などを明確にした文書',
    ],
    correctIndex: 3,
    explanation: 'プロジェクト憲章は，プロジェクトを正式に許可し，プロジェクトマネージャを特定して権限を付与する文書で，ビジネスニーズ・目標・期待される結果などが盛り込まれる。ア はビジネスケース，イ はプロジェクトマネジメント計画書，ウ はプロジェクトスコープ記述書の説明。',
    categoryId: 'integration',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-3',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 3,
    questionText:
      'JIS Q 21500:2018(プロジェクトマネジメントの手引)において，管理のプロセス群を構成するプロセスのうち，WBSが主要なインプットの一つとして示されているものはどれか。',
    choices: ['スコープの管理', '品質管理の遂行', '変更の管理', 'リスクの管理'],
    correctIndex: 0,
    explanation: 'JIS Q 21500:2018「スコープの管理」は，作業実績と承認されたスコープ・WBS との差異を監視するプロセスで，WBS が主要インプットとなる。イ「品質管理の遂行」は品質計画書と作業実績，ウ「変更の管理」は変更要求と計画書，エ「リスクの管理」はリスク登録簿が主要インプット。',
    categoryId: 'planning',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-4',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 4,
    questionText:
      'プロジェクトマネジメントで使用する責任分担マトリックス(RAM)の一つに，RACIチャートがある。RACIチャートで示す四つの"役割又は責任"の組合せのうち，適切なものはどれか。',
    choices: [
      '実行責任，情報提供，説明責任，相談対応',
      '実行責任，情報提供，説明責任，リスク管理',
      '実行責任，情報提供，相談対応，リスク管理',
      '実行責任，説明責任，相談対応，リスク管理',
    ],
    correctIndex: 0,
    explanation: 'RACI チャートは R=Responsible（実行責任），A=Accountable（説明責任），C=Consulted（相談対応），I=Informed（情報提供）の 4 役割を割り当てる責任分担マトリックス。リスク管理は責任分担の項目ではないため，これを含むイ・ウ・エ はいずれも誤り。',
    categoryId: 'team',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-5',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 5,
    questionText:
      'チームの発展段階を五つに区分したタックマンモデルによれば，メンバーの異なる考え方や価値観が明確になり，メンバーがそれぞれの意見を主張し合う段階はどれか。',
    choices: ['安定期(Norming)', '遂行期(Performing)', '成立期(Forming)', '動乱期(Storming)'],
    correctIndex: 3,
    explanation: 'タックマンモデルは Forming（成立期）→ Storming（動乱期）→ Norming（安定期）→ Performing（遂行期）→ Adjourning（解散期）の 5 段階で進む。価値観や考え方の違いが顕在化してメンバーが意見を主張し合うのは Storming（動乱期）の特徴。ア Norming は対立解消・ルール形成，イ Performing は高パフォーマンス，ウ Forming は様子見・遠慮の段階。',
    categoryId: 'team',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-6',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 6,
    questionText:
      'JIS Q 21500:2018(プロジェクトマネジメントの手引)によれば，対象群"資源"に属するプロセスである"資源の管理"の目的はどれか。',
    choices: [
      '活動リストの活動ごとに必要な資源を決定する。',
      '継続的にプロジェクトチーム構成員のパフォーマンス及び相互関係を改善する。',
      'チームのパフォーマンスを最大限に引き上げ，フィードバックを提供し，課題を解決し，コミュニケーションを促し，変更を調整して，プロジェクトの成功を達成する。',
      'プロジェクトの要求事項を満たすように，プロジェクト作業の実施に必要な資源を確保し，必要な方法で配分する。',
    ],
    correctIndex: 3,
    explanation: 'JIS Q 21500:2018「資源の管理」は，プロジェクト作業の実施に必要な資源を確保し，要求事項を満たすように配分することが目的のプロセス。ア は「アクティビティ資源の見積り」，イ は「プロジェクトチームの育成」，ウ は「プロジェクトチームのマネジメント」プロセスの目的。',
    categoryId: 'team',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-7',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 7,
    questionText:
      'EVMを使用してマネジメントをしているプロジェクトで，進捗に関する指標値は次のとおりであった。このプロジェクトに対する適切な評価と対策はどれか。\n〔進捗に関する指標値〕\nCPI(コスト効率指数)：0.9\nSPI(スケジュール効率指数)：1.1\nBAC(完成時総予算)に基づくTCPI(残作業効率指数)：1.2',
    choices: [
      'コストが予算を超えているが，スケジュールには余裕があり，残作業のコスト効率を計画よりも上げる必要はないので，CPIに基づいて完成までに必要なコストを予測する。',
      'コストが予算を超えているので，完成時総予算を超過するおそれがあるが，スケジュールには余裕があるので，残作業のコスト効率を上げる対策を検討するか，コンティンジェンシー予備費の使用を検討する。',
      'コストには余裕があるが，スケジュールが予定より遅れており，残作業のコスト効率を計画よりも上げる必要があるので，ファストトラッキングなどを用いたスケジュール短縮を検討するとともに，コンティンジェンシー予備費の使用を検討する。',
      'コストには余裕があるので，残作業のコスト効率を計画よりも上げる必要はないが，スケジュールが予定より遅れているので，クラッシングなどを用いたスケジュール短縮を検討する。',
    ],
    correctIndex: 1,
    explanation: 'CPI=0.9 < 1.0 はコスト超過，SPI=1.1 > 1.0 はスケジュール先行，TCPI=1.2 > 1.0 は残作業を今より高いコスト効率で消化しないと BAC を超えてしまうことを意味する。よってコスト超過リスクへの対策（効率改善）と，必要に応じてコンティンジェンシー予備費の使用を検討するイが適切。ア は「TCPI > 1.0」を見落としており，ウ・エ は「CPI < 1.0 = コスト超過」を「コストに余裕」と誤って解釈している。',
    categoryId: 'measurement',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-8',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 8,
    questionText: 'ソフトウェア開発プロジェクトにおいてWBSを使用する目的として，適切なものはどれか。',
    choices: [
      '開発の期間と費用がトレードオフの関係にある場合に，総費用の最適化を図る。',
      '作業の順序関係を明確にして，重点管理すべきクリティカルパスを把握する。',
      '作業の日程を横棒(バー)で表して，作業の開始や終了時点，現時点の進捗を明確にする。',
      '作業を階層的に詳細化して，管理可能な大きさに細分化する。',
    ],
    correctIndex: 3,
    explanation: 'WBS（Work Breakdown Structure）はプロジェクトのスコープを階層的に詳細化し，管理可能な大きさのワークパッケージへ細分化するための成果物指向の分解構造。ア は CPM/PERT，イ はネットワーク図（PDM）の目的，ウ はガントチャートの説明。',
    categoryId: 'planning',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-9',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 9,
    questionText:
      '図のアローダイアグラムから読み取れることとして，適切なものはどれか。ここで，プロジェクトの開始日を1日目とする。',
    choices: [
      '作業Cを最も早く開始できるのは6日目である。',
      '作業Dはクリティカルパス上の作業である。',
      '作業Eの総余裕時間は30日である。',
      '作業Fを最も遅く開始できるのは11日目である。',
    ],
    correctIndex: 2,
    explanation: 'クリティカルパスは B(10)→C(20)→G(20)→H(10) = 60 日（B 後の合流点へ A はダミーで合流）。E は B(10)→E(10)→H(10) 経路で，H の最遅完了 60 日から逆算すると E の最遅終了 50 日，B 終了 10 日から最早開始 10 日・所要 10 日で最早終了 20 日，余裕は 50−20 = 30 日。ア C の最早開始は 10 日終了の翌日（11 日目），イ D は経由しない非クリティカル，エ F の最遅開始は 40 日目（H 直前のダミー合流まで余裕がある）。',
    categoryId: 'planning',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'アローダイアグラム。開始からA 5日とB 10日に分岐し、BからA後の結合点へダミー作業がある。結合点からC 20日、D 30日、E 10日に分岐し、B後の点からF 10日でE後の点へ進む。C後からG 20日、D、E後の点からのダミーが合流し、H 10日で終了する。',
      caption: '図　アローダイアグラム',
      viewBox: '0 0 640 310',
      content: `
        <defs>
          <marker id="amR4q9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <circle cx="54" cy="140" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="205" cy="140" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="130" cy="235" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="340" cy="62" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="340" cy="235" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="485" cy="140" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="590" cy="140" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <line x1="76" y1="140" x2="181" y2="140" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="128" y="125" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">A</text>
        <text x="128" y="154" text-anchor="middle" font-size="14" fill="#1e293b">5</text>
        <line x1="70" y1="158" x2="114" y2="216" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="88" y="196" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">B</text>
        <text x="108" y="209" text-anchor="middle" font-size="14" fill="#1e293b">10</text>
        <line x1="147" y1="218" x2="188" y2="160" stroke="#334155" stroke-width="1.6" stroke-dasharray="7 5" marker-end="url(#amR4q9)"/>
        <line x1="220" y1="125" x2="321" y2="79" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="273" y="89" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">C</text>
        <text x="285" y="108" text-anchor="middle" font-size="14" fill="#1e293b">20</text>
        <line x1="227" y1="140" x2="461" y2="140" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="345" y="124" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">D</text>
        <text x="345" y="154" text-anchor="middle" font-size="14" fill="#1e293b">30</text>
        <line x1="222" y1="155" x2="320" y2="216" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="265" y="198" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">E</text>
        <text x="289" y="207" text-anchor="middle" font-size="14" fill="#1e293b">10</text>
        <line x1="152" y1="235" x2="316" y2="235" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="235" y="219" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">F</text>
        <text x="235" y="249" text-anchor="middle" font-size="14" fill="#1e293b">10</text>
        <line x1="360" y1="78" x2="468" y2="124" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="410" y="88" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">G</text>
        <text x="424" y="108" text-anchor="middle" font-size="14" fill="#1e293b">20</text>
        <line x1="357" y1="218" x2="469" y2="157" stroke="#334155" stroke-width="1.6" stroke-dasharray="7 5" marker-end="url(#amR4q9)"/>
        <line x1="507" y1="140" x2="566" y2="140" stroke="#334155" stroke-width="1.8" marker-end="url(#amR4q9)"/>
        <text x="536" y="124" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">H</text>
        <text x="536" y="154" text-anchor="middle" font-size="14" fill="#1e293b">10</text>
        <text x="485" y="224" text-anchor="middle" font-size="12" fill="#475569">作業名</text>
        <line x1="432" y1="244" x2="520" y2="244" stroke="#334155" stroke-width="1.6" marker-end="url(#amR4q9)"/>
        <text x="476" y="265" text-anchor="middle" font-size="12" fill="#475569">所要日数</text>
        <line x1="432" y1="285" x2="520" y2="285" stroke="#334155" stroke-width="1.4" stroke-dasharray="7 5" marker-end="url(#amR4q9)"/>
        <text x="553" y="289" text-anchor="middle" font-size="12" fill="#475569">ダミー作業</text>
      `,
    },
  },
  {
    id: 'om-R4-10',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 10,
    questionText:
      'COCOMOには，システム開発の工数を見積もる式の一つとして次式がある。\n開発工数＝3.0×(開発規模)^{1.12}\nこの式を基に，開発規模と開発生産性(開発規模／開発工数)の関係を表したグラフはどれか。ここで，開発工数の単位は人月，開発規模の単位はキロ行とする。',
    choices: [
      '選択肢アのグラフ',
      '選択肢イのグラフ',
      '選択肢ウのグラフ',
      '選択肢エのグラフ',
    ],
    correctIndex: 3,
    explanation: '開発生産性 = 開発規模 ÷ 開発工数 = 規模 ÷ (3.0 × 規模^{1.12}) = 規模^{−0.12} ÷ 3.0。指数が −0.12（負だが小さい絶対値）なので，規模が増えると生産性は単調に低下し，かつ低下の度合いは次第に緩やかになる。よって右下がりで次第に緩やかな曲線（エ）が正しい。',
    categoryId: 'measurement',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '開発規模を横軸、開発生産性を縦軸とする四つの候補グラフ。アは右上がりで次第に緩やか、イは右上がりで次第に急、ウは右下がりで次第に急、エは右下がりで次第に緩やかになる。',
      caption: '図　開発規模と開発生産性の関係の候補',
      viewBox: '0 0 620 360',
      content: `
        <defs>
          <marker id="amR4q10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(35 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ア</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <path d="M 35 112 C 55 60, 105 44, 176 39" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">イ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <path d="M 35 112 C 88 111, 135 88, 176 36" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(35 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ウ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <path d="M 35 36 C 85 38, 142 68, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">エ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR4q10)"/>
          <path d="M 35 36 C 48 74, 88 103, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
      `,
    },
  },
  {
    id: 'om-R4-11',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 11,
    questionText:
      '工程別の生産性が次のとおりのとき，全体の生産性を表す式はどれか。\n〔工程別の生産性〕\n設計工程：Xステップ／人月\n製造工程：Yステップ／人月\n試験工程：Zステップ／人月',
    choices: [
      'X＋Y＋Z',
      'frac{X＋Y＋Z}{3}',
      'frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}',
      'frac{1}{frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}}',
    ],
    correctIndex: 3,
    explanation: '1 ステップを生産するのに必要な総工数は，設計 1/X，製造 1/Y，試験 1/Z 人月で合計 1/X+1/Y+1/Z 人月。全体生産性（ステップ/人月）はその逆数 1 ÷ (1/X+1/Y+1/Z) となる。これは生産性の調和平均的な合成で，工程直列のスループットを表す。',
    categoryId: 'measurement',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-12',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 12,
    questionText:
      '工場の生産能力を増強する方法として，新規システムを開発する案と既存システムを改修する案とを検討している。次の条件で，期待金額価値の高い案を採用するとき，採用すべき案と期待金額価値との組合せのうち，適切なものはどれか。ここで，期待金額価値は，収入と投資額との差で求める。\n〔条件〕\n新規システムを開発する場合の投資額は100億円であり，既存システムを改修する場合の投資額は50億円である。\n需要が拡大する確率は70%であり，需要が縮小する確率は30%である。\n新規システムを開発した場合，需要が拡大したときは180億円の収入が見込まれ，需要が縮小したときは50億円の収入が見込まれる。\n既存システムを改修した場合，需要が拡大したときは120億円の収入が見込まれ，需要が縮小したときは40億円の収入が見込まれる。\n他の条件は考慮しない。',
    choices: [
      '既存システムの改修，46億円',
      '既存システムの改修，96億円',
      '新規システムの開発，41億円',
      '新規システムの開発，130億円',
    ],
    correctIndex: 0,
    explanation: 'EMV = 期待収入 − 投資額 で算出する。新規開発 = 0.7×180 + 0.3×50 − 100 = 126 + 15 − 100 = 41 億円。既存改修 = 0.7×120 + 0.3×40 − 50 = 84 + 12 − 50 = 46 億円。EMV が高い既存改修（46 億円）を採用する。',
    categoryId: 'uncertainty',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-13',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 13,
    questionText:
      'A～Dの機能をもつソフトウェアの基本設計書のレビューを行った。表は，各機能の開発規模の見積り値と基本設計書レビューでの指摘件数の実績値である。基本設計工程における品質の定量的評価基準に従うとき，品質評価指標の視点での品質に問題があると判定される機能の組みはどれか。\n〔基本設計工程における品質の定量的評価基準〕\n品質評価指標は，基本設計書レビューにおける開発規模の見積り値の単位規模当たりの指摘件数とする。\n品質評価指標の値が，基準値の0.9倍～1.1倍の範囲内であれば，品質に問題がないと判定する。\n基準値は開発規模の見積り値1kステップ当たり5.0件とする。',
    choices: ['A，C', 'B，C', 'B，D', 'C，D'],
    correctIndex: 0,
    explanation: '基準値 5.0 件/kステップに対し許容範囲は 0.9 倍〜1.1 倍 = 4.5〜5.5 件/kステップ。A=130÷30≒4.33（範囲外），B=120÷24=5.00（範囲内），C=64÷16=4.00（範囲外），D=46÷10=4.60（範囲内）。範囲外で品質に問題があるのは A と C → ア。',
    categoryId: 'delivery',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔開発規模の見積り値と指摘件数の実績値〕',
      headers: ['機能', '開発規模の見積り値（kステップ）', '指摘件数の実績値（件）'],
      rows: [
        ['A', 30, 130],
        ['B', 24, 120],
        ['C', 16, 64],
        ['D', 10, 46],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R4-14',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 14,
    questionText:
      'JIS X 25010:2013(システム及びソフトウェア製品の品質要求及び評価(SQuaRE)－システム及びソフトウェア品質モデル)で規定された品質副特性の説明のうち，信頼性の品質副特性の説明はどれか。',
    choices: [
      '製品又はシステムが，それらを運用操作しやすく，制御しやすくする属性をもっている度合い',
      '製品若しくはシステムの一つ以上の部分への意図した変更が製品若しくはシステムに与える影響を総合評価すること，欠陥若しくは故障の原因を診断すること，又は修正しなければならない部分を識別することが可能であることについての有効性及び効率性の度合い',
      '中断時又は故障時に，製品又はシステムが直接的に影響を受けたデータを回復し，システムを希望する状態に復元することができる度合い',
      '二つ以上のシステム，製品又は構成要素が情報を交換し，既に交換された情報を使用することができる度合い',
    ],
    correctIndex: 2,
    explanation: 'JIS X 25010:2013 における信頼性の品質副特性は，成熟性・可用性・障害許容性・回復性の 4 つ。「中断時・故障時に影響を受けたデータを回復し，希望状態に復元できる度合い」は回復性の定義で，信頼性の副特性に該当する。ア は使用性の運用操作性（運用性），イ は保守性の解析性／修正性，エ は互換性の相互運用性。',
    categoryId: 'delivery',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-15',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 15,
    questionText: '"アジャイルソフトウェア開発宣言"で述べている価値に関する記述のうち，適切なものはどれか。',
    choices: [
      '計画に従うことに価値があることを認めながらも，自己組織化されたチームによる裁量に，より価値をおく。',
      '契約交渉に価値があることを認めながらも，顧客の競争力と満足度の向上に，より価値をおく。',
      'プロセスやツールに価値があることを認めながらも，実用的なプラクティスに，より価値をおく。',
      '包括的なドキュメントに価値があることを認めながらも，動くソフトウェアに，より価値をおく。',
    ],
    correctIndex: 3,
    explanation: 'アジャイルソフトウェア開発宣言の 4 つの価値の一つは「包括的なドキュメントよりも，動くソフトウェアを」である。左側にも価値があるとしつつ右側により大きな価値を置く形で記述されており，エ がこの形式に正確に対応する。ア「計画 vs 自己組織化チーム」，イ「契約交渉 vs 顧客満足」，ウ「プロセスやツール vs 実用的プラクティス」はいずれも宣言にない対比。',
    categoryId: 'development-approach',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-16',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 16,
    questionText: 'XP(Extreme Programming)のプラクティスの一つであるものはどれか。',
    choices: ['構造化プログラミング', 'コンポーネント指向プログラミング', 'ビジュアルプログラミング', 'ペアプログラミング'],
    correctIndex: 3,
    explanation: 'XP（エクストリームプログラミング）の主なプラクティスにはペアプログラミング・テスト駆動開発（TDD）・リファクタリング・継続的インテグレーション・シンプル設計などがある。ア の構造化プログラミングは古典的な制御構造のスタイル，イ・ウ はそれぞれコンポーネント再利用やビジュアル開発の概念で，XP 固有のプラクティスではない。',
    categoryId: 'development-approach',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-17',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 17,
    questionText: 'ユースケース駆動開発の利点はどれか。',
    choices: [
      '開発を反復するので，新しい要求やビジネス目標の変化に柔軟に対応しやすい。',
      '開発を反復するので，リスクが高い部分に対して初期段階で対処しやすく，プロジェクト全体のリスクを減らすことができる。',
      '基本となるアーキテクチャをプロジェクトの初期に決定するので，コンポーネントを再利用しやすくなる。',
      'ひとまとまりの要件を1単位として設計からテストまで実施するので，要件ごとに開発状況が把握できる。',
    ],
    correctIndex: 3,
    explanation: 'ユースケース駆動開発は，ユーザがシステムをどう使うかを示すユースケースを開発の中心軸に据え，ひとまとまりの要件（ユースケース）単位で分析・設計・実装・テストを進める。ユースケース単位の進捗が見えやすい点が利点。ア は反復型開発（変化への対応），イ はリスク駆動の反復（スパイラルモデル等），ウ はアーキテクチャ駆動開発の特徴。',
    categoryId: 'development-approach',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-18',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 18,
    questionText:
      'ある業務を新たにシステム化するに当たって，A～Dのシステム化案の初期費用，運用費及びシステム化によって削減される業務費を試算したところ，表のとおりであった。システムの利用期間を5年とするとき，最も投資利益率の高いシステム化案はどれか。ここで，投資利益率は次式によって算出する。また，利益の増加額は削減される業務費から投資額を減じたものとし，投資額は初期費用と運用費の合計とする。\n投資利益率＝利益の増加額÷投資額',
    choices: ['A', 'B', 'C', 'D'],
    correctIndex: 3,
    explanation: '5 年間の投資額＝初期＋運用×5，利益＝削減×5 − 投資額。A: 投資 50，利益 75，ROI 1.5。B: 投資 50，利益 50，ROI 1.0。C: 投資 40，利益 35，ROI 0.875。D: 投資 40，利益 70，ROI 1.75。最大は D（1.75）。',
    categoryId: 'measurement',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔システム化案別の費用と削減額（単位 百万円）〕',
      headers: ['システム化案', '初期費用', '1年間の運用費', '削減される1年間の業務費'],
      rows: [
        ['A', 30, 4, 25],
        ['B', 20, 6, 20],
        ['C', 20, 4, 15],
        ['D', 15, 5, 22],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R4-19',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 19,
    questionText: 'バックアップサイトを用いたサービス復旧方法の説明のうち，ウォームスタンバイの説明として，最も適切なものはどれか。',
    choices: [
      '同じようなシステムを運用する外部の企業や組織と協定を結び，緊急時には互いのシステムを貸し借りして，サービスを復旧する。',
      '緊急時にはバックアップシステムを持ち込んでシステムを再開し，サービスを復旧する。',
      '常にデータの同期が取れているバックアップシステムを用意しておき，緊急時にはバックアップシステムに切り替えて直ちにサービスを復旧する。',
      'バックアップシステムを用意しておき，緊急時にはバックアップシステムを起動して，データを最新状態にする処理を行った後にサービスを復旧する。',
    ],
    correctIndex: 3,
    explanation: 'ウォームスタンバイは，バックアップ機を待機させておき，緊急時に起動してデータを最新化したうえでサービスを再開する方式。常時データ同期＋即時切替の ウ はホットスタンバイ，イ「持ち込んで再開」はコールドスタンバイ，ア は相互救援協定（リカバリーパートナー）に近い説明。',
    categoryId: 'service-management',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-20',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 20,
    questionText:
      'IoTを活用した工場管理システムの開発を行う。システムを構築し，サービスを運営するA社は，B社にボード開発を定額契約で委託した。B社はボードの納入前のネットワーク試験のため，工場の設備を管理するC社と実費償還契約を締結し，工場の一部区画とネットワークを借用した。C社のネットワーク設備に故障はなく，B社の人的リソース不足が原因でネットワーク試験の作業が遅延し，追加の費用が発生したとき，その費用を負担すべき会社はどれか。ここで，各社は契約を正当に履行するものとする。また，定額契約を交わした時点では，開発のスコープは十分明確で，契約以降の変更はないものとする。',
    choices: ['A社', 'A社及びB社', 'B社', 'B社及びC社'],
    correctIndex: 2,
    explanation: 'A-B 間は定額契約でスコープ確定済みのため，B 社内の人的リソース不足による追加コストを A 社に請求できない。B-C 間は実費償還契約で C 社は実費を請求できるが，C 社設備に故障はなく追加費用の発生原因は B 社にある。よって追加費用は B 社のみが負担する（ウ）。',
    categoryId: 'project-work',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-21',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 21,
    questionText: '基準値を超える鉛，水銀などの有害物質を電気・電子機器に使用することを制限するために，欧州連合が制定し，施行しているものはどれか。',
    choices: ['ISO 14001', 'RoHS指令', 'WEEE指令', 'グリーン購入法'],
    correctIndex: 1,
    explanation: 'RoHS 指令（Restriction of Hazardous Substances）は，EU が制定した電気・電子機器における特定有害物質（鉛・水銀・カドミウム等）の使用制限指令。ア ISO 14001 は環境マネジメントシステムの国際規格，ウ WEEE 指令は廃電気・電子機器の回収・リサイクルを定める指令，エ グリーン購入法は日本の法律。',
    categoryId: 'governance',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-22',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 22,
    questionText: 'SDGsの説明として，適切なものはどれか。',
    choices: [
      '温室効果ガスの人為的な排出量と吸収源による除去量とを世界規模で均衡させようという取組',
      '企業が社会的責任を果たすべきであるとする考え方で，環境，人権などの活動に取り組むことを推進する考え方',
      '国連環境計画が提唱する，プラスチックごみによる海洋汚染，環境問題などを解決しようとする取組',
      '地球環境などの課題において2030年を年限とする持続可能でより良い世界を目指す国際目標',
    ],
    correctIndex: 3,
    explanation: 'SDGs（Sustainable Development Goals）は，2015 年の国連サミットで採択された 2030 年を年限とする 17 の国際目標で，貧困・飢餓・気候変動など持続可能な世界の実現を目指す。ア はカーボンニュートラル，イ は CSR（企業の社会的責任），ウ は UNEP の海洋プラごみ問題への取組の説明。',
    categoryId: 'governance',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-23',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 23,
    questionText: '認証局が発行するCRLに関する記述のうち，適切なものはどれか。',
    choices: [
      'CRLには，失効したデジタル証明書に対応する秘密鍵が登録される。',
      'CRLには，有効期限内のデジタル証明書のうち失効したデジタル証明書のシリアル番号と失効した日時の対応が提示される。',
      'CRLは，鍵の漏えい，失効申請の状況をリアルタイムに反映するプロトコルである。',
      '有効期限切れで失効したデジタル証明書は，所有者が新たなデジタル証明書を取得するまでの間，CRLに登録される。',
    ],
    correctIndex: 1,
    explanation: 'CRL（証明書失効リスト）は，認証局が発行したデジタル証明書のうち，有効期限内に失効されたものについて，シリアル番号と失効日時を提示するリスト。ア 秘密鍵は CRL に登録されない，ウ リアルタイムに照会するのは OCSP，エ 有効期限切れの証明書は自然に失効するため CRL には登録されない。',
    categoryId: 'service-management',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-24',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 24,
    questionText: 'Webサーバでのシングルサインオンの実装方式に関する記述のうち，適切なものはどれか。',
    choices: [
      'cookieを使ったシングルサインオンの場合，Webサーバごとの認証情報を含んだcookieをクライアントで生成し，各Webサーバ上で保存，管理する。',
      'cookieを使ったシングルサインオンの場合，認証対象のWebサーバを，異なるインターネットドメインに配置する必要がある。',
      'リバースプロキシを使ったシングルサインオンの場合，認証対象のWebサーバを，異なるインターネットドメインに配置する必要がある。',
      'リバースプロキシを使ったシングルサインオンの場合，利用者認証においてパスワードの代わりにデジタル証明書を用いることができる。',
    ],
    correctIndex: 3,
    explanation: 'リバースプロキシ方式の SSO では，すべての認証をリバースプロキシで一元化するため，バックエンド Web サーバの認証手段に依存せずデジタル証明書認証など強固な認証手段を利用できる。ア cookie はクライアントではなくサーバが発行・保存，イ cookie 方式は同一インターネットドメインに配置が必要（cookie のドメインスコープのため），ウ リバースプロキシ方式は逆に同一ドメインで構成しても問題ない。',
    categoryId: 'service-management',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R4-25',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 25,
    questionText: 'サイバーセキュリティ演習での参加チームの役割のうち，レッドチームの役割として，最も適切なものはどれか。',
    choices: [
      'あらかじめ設定された攻撃範囲を超えた行動を演習参加チームがしていないことを監視する。',
      '演習時に行うサイバー攻撃に対して，防御，検知，対応を行う。',
      '脅威シナリオに基づいて対象組織に攻撃を仕掛ける。',
      '人的リソース，データ，ナレッジを共有し，演習の効果の最大化を図る。',
    ],
    correctIndex: 2,
    explanation: 'サイバーセキュリティ演習でのレッドチームは，脅威シナリオに基づき対象組織に攻撃を仕掛ける側のチーム。ア はホワイトチーム（演習ルールの監督），イ はブルーチーム（防御・検知・対応），エ はパープルチーム（レッド／ブルー間の知見共有）に近い説明。',
    categoryId: 'service-management',
    sourceUrl: R4_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-1',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 1,
    questionText:
      'あるプロジェクトのステークホルダとして，プロジェクトスポンサ，プロジェクトマネージャ，プロジェクトマネジメントオフィス及びプロジェクトマネジメントチームが存在する。ステークホルダのうち，JIS Q 21500:2018（プロジェクトマネジメントの手引）によれば，主として標準化，プロジェクトマネジメントの教育訓練及びプロジェクトの監視といった役割を担うのはどれか。',
    choices: [
      'プロジェクトスポンサ',
      'プロジェクトマネージャ',
      'プロジェクトマネジメントオフィス',
      'プロジェクトマネジメントチーム',
    ],
    correctIndex: 2,
    explanation: 'JIS Q 21500:2018 でプロジェクトマネジメントオフィス（PMO）は，プロジェクトマネジメントの標準化（テンプレート・手法整備），教育訓練，プロジェクトの監視・支援などを担うと定義されている。ア スポンサは資金提供と意思決定，イ プロジェクトマネージャは個別プロジェクトの責任者，エ プロジェクトマネジメントチームは PM 配下の運営支援チームで，標準化や教育全般を担う役割ではない。',
    categoryId: 'governance',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-2',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 2,
    questionText:
      '表は，RACI チャートを用いた，あるプロジェクトの責任分担マトリックスである。設計アクティビティにおいて，説明責任をもつ要員は誰か。',
    choices: ['阿部', '伊藤と佐藤', '鈴木と田中', '野村'],
    correctIndex: 3,
    explanation: 'RACI チャートにおける説明責任（A=Accountable）は，アクティビティに対して 1 人が担うのが原則。設計行を見ると 阿部=R，伊藤=I，佐藤=I，鈴木=C，田中=C，野村=A となっており，A をもつのは野村のみ。',
    categoryId: 'team',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔RACI チャートによる責任分担マトリックス〕',
      headers: ['アクティビティ', '阿部', '伊藤', '佐藤', '鈴木', '田中', '野村'],
      rows: [
        ['要件定義', 'C', 'A', 'I', 'I', 'I', 'R'],
        ['設計', 'R', 'I', 'I', 'C', 'C', 'A'],
        ['開発', 'A', '－', 'R', '－', 'R', 'I'],
        ['テスト', 'I', 'I', 'C', 'R', 'A', 'C'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R3-3',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 3,
    questionText: 'PMBOK ガイド第6版によれば，組織のプロセス資産に分類されるものはどれか。',
    choices: [
      '課題と欠陥のマネジメント上の手続き',
      '既存の施設や資本設備などのインフラストラクチャ',
      'ステークホルダーのリスク許容度',
      '組織構造，組織の文化，マネジメントの実務，持続可能性',
    ],
    correctIndex: 0,
    explanation: 'PMBOK ガイド第 6 版において，組織のプロセス資産（OPA）はプロセス／方針／手続き／組織知識ベースが該当し，「課題と欠陥のマネジメント上の手続き」は典型例。一方，イ インフラ，ウ ステークホルダーのリスク許容度，エ 組織構造・文化・実務などは「組織体の環境要因（EEF）」に分類される。',
    categoryId: 'project-work',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-4',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 4,
    questionText:
      'アクティビティ A～E によって実施する開発プロジェクトがある。図は，各アクティビティの依存関係を PDM（プレシデンスダイアグラム法）で表している。開発プロジェクトの最少の所要日数は何日か。ここで，FS－n は先行アクティビティが終了する n 日前に後続アクティビティが開始できることを，FS＋n は先行アクティビティが終了した n 日後に後続アクティビティが開始できることを示している。',
    choices: ['10', '11', '12', '13'],
    correctIndex: 2,
    explanation: 'A=2 日(0→2)。B は A の FS で開始(2→5)。C は B の FS−2 なので B 終了 2 日前から開始可 = 3 日目開始(3→7)。D は A の FS+2 なので A 終了 2 日後 = 4 日目開始(4→8)。E は C と D の両方終了後 = max(7,8) = 8 日目開始(8→12)。最少所要日数 = 12 日。',
    categoryId: 'planning',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'PDM図。開始からアクティビティA 2日へ進み、AからB 3日へ進む。BからFS-2でC 4日に進む。AからFS+2でD 4日に進む。CとDがアクティビティE 4日に合流し、終了へ進む。',
      caption: '図　PDMによるアクティビティの依存関係',
      viewBox: '0 0 700 260',
      content: `
        <defs>
          <marker id="amR3q4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <circle cx="45" cy="80" r="28" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="45" y="85" text-anchor="middle" font-size="14" fill="#1e293b">開始</text>
        <rect x="105" y="55" width="130" height="50" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="170" y="76" text-anchor="middle" font-size="14" fill="#1e293b">アクティビティA</text>
        <text x="170" y="96" text-anchor="middle" font-size="14" fill="#1e293b">2日</text>
        <rect x="280" y="55" width="130" height="50" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="345" y="76" text-anchor="middle" font-size="14" fill="#1e293b">アクティビティB</text>
        <text x="345" y="96" text-anchor="middle" font-size="14" fill="#1e293b">3日</text>
        <rect x="330" y="130" width="130" height="50" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="395" y="151" text-anchor="middle" font-size="14" fill="#1e293b">アクティビティC</text>
        <text x="395" y="171" text-anchor="middle" font-size="14" fill="#1e293b">4日</text>
        <rect x="330" y="205" width="130" height="50" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="395" y="226" text-anchor="middle" font-size="14" fill="#1e293b">アクティビティD</text>
        <text x="395" y="246" text-anchor="middle" font-size="14" fill="#1e293b">4日</text>
        <rect x="515" y="170" width="130" height="50" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="580" y="191" text-anchor="middle" font-size="14" fill="#1e293b">アクティビティE</text>
        <text x="580" y="211" text-anchor="middle" font-size="14" fill="#1e293b">4日</text>
        <circle cx="675" cy="195" r="22" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="675" y="200" text-anchor="middle" font-size="13" fill="#1e293b">終了</text>
        <line x1="73" y1="80" x2="103" y2="80" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <line x1="235" y1="80" x2="278" y2="80" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <path d="M 410 80 L 430 80 L 430 117 L 320 117 L 320 155 L 328 155" fill="none" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <text x="300" y="157" text-anchor="middle" font-size="14" fill="#1e293b">FS－2</text>
        <path d="M 235 88 L 260 88 L 260 230 L 328 230" fill="none" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <text x="300" y="232" text-anchor="middle" font-size="14" fill="#1e293b">FS＋2</text>
        <path d="M 460 155 L 492 155 L 492 195 L 513 195" fill="none" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <line x1="460" y1="230" x2="513" y2="203" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <line x1="645" y1="195" x2="653" y2="195" stroke="#334155" stroke-width="1.6" marker-end="url(#amR3q4)"/>
        <text x="555" y="55" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="bold">凡例</text>
        <rect x="505" y="67" width="110" height="40" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <text x="560" y="84" text-anchor="middle" font-size="12" fill="#1e293b">アクティビティ名</text>
        <text x="560" y="101" text-anchor="middle" font-size="12" fill="#1e293b">所要日数</text>
      `,
    },
  },
  {
    id: 'om-R3-5',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 5,
    questionText: '工程管理図表の特徴に関する記述のうち，ガントチャートのものはどれか。',
    choices: [
      '計画と実績の時間的推移を表現するのに適し，進み具合及びその傾向がよく分かり，プロジェクト全体の費用と進捗の管理に利用される。',
      '作業の順序や作業相互の関係を表現したり，重要作業を把握したりするのに適しており，プロジェクトの作業計画などに利用される。',
      '作業の相互関係の把握には適さないが，作業計画に対する実績を把握するのに適しており，個人やグループの進捗管理に利用される。',
      '進捗管理上のマイルストーンを把握するのに適しており，プロジェクト全体の進捗管理などに利用される。',
    ],
    correctIndex: 2,
    explanation: 'ガントチャートは作業を横棒で表し，計画と実績を時間軸上に並べることで個人・グループの進捗管理に適する一方，作業間の依存関係（順序）の把握には向かない。ア は EVM（コストと進捗を時間推移で示す），イ はネットワーク図／CPM（順序関係・重要作業），エ はマイルストーンチャートの説明。',
    categoryId: 'planning',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-6',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 6,
    questionText: 'プロジェクトマネジメントにおけるクラッシングの例として，適切なものはどれか。',
    choices: [
      'クリティカルパス上のアクティビティの開始が遅れたので，ここに人的資源を追加した。',
      'コストを削減するために，これまで承認されていた残業を禁止した。',
      '仕様の確定が大幅に遅れたので，プロジェクトの完了予定日を延期した。',
      '設計が終わったモジュールから順にプログラム開発を実施するように，スケジュールを変更した。',
    ],
    correctIndex: 0,
    explanation: 'クラッシングは，コスト増を許容してクリティカルパス上の作業に資源（人員・設備）を追加投入し，スケジュールを短縮する技法。ア はまさにこの定義に合致。イ は単なるコスト削減策で短縮の話ではない，ウ は単なる延期，エ は先行作業の完了を待たず並行化するファストトラッキングの説明。',
    categoryId: 'planning',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-7',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 7,
    questionText: 'プロジェクトのスケジュール管理で使用する “クリティカルチェーン法” の実施例はどれか。',
    choices: [
      '限りある資源とプロジェクトの不確実性に対応するために，合流バッファとプロジェクトバッファを設ける。',
      'クリティカルパス上の作業に，生産性を向上させるための開発ツールを導入する。',
      'クリティカルパス上の作業に，要員を追加投入する。',
      'クリティカルパス上の先行作業の全てが終了する前に後続作業に着手し，一部を並行して実施する。',
    ],
    correctIndex: 0,
    explanation: 'クリティカルチェーン法は，資源制約と不確実性に対応するため，非クリティカルチェーンの合流点に合流バッファを，クリティカルチェーンの末尾にプロジェクトバッファを置く手法。イ・ウ はクリティカルパス法上の生産性向上策・クラッシング，エ はファストトラッキングの説明。',
    categoryId: 'planning',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-8',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 8,
    questionText:
      'あるプロジェクトは 4 月から 9 月までの 6 か月間で開発を進めており，現在のメンバ全員が 9 月末まで作業すれば完了する見込みである。しかし，他のプロジェクトで発生した緊急の案件に対応するために，8 月初めから，4 人のメンバがプロジェクトから外れることになった。9 月末に予定どおり開発を完了させるために，7 月の半ばからメンバを増員する。条件に従うとき，人件費は何万円増加するか。\n〔条件〕\n・元のメンバと増員するメンバの，プロジェクトにおける生産性は等しい。\n・7 月の半ばから 7 月末までの 0.5 か月間，元のメンバ 4 人から増員するメンバに引継ぎを行う。\n・引継ぎの期間中は，元のメンバ 4 人と増員するメンバはプロジェクトの開発作業を実施しないが，人件費は全額をこのプロジェクトに計上する。\n・人件費は，1 人月当たり 100 万円とする。',
    choices: ['200', '250', '450', '700'],
    correctIndex: 2,
    explanation: '離脱 4 人が 8〜9 月に開発するはずの 4×2 = 8 人月と，引継ぎ 0.5 か月で離脱予定 4 人が開発できない 4×0.5 = 2 人月，合計 10 人月が不足する。増員 X 人は引継ぎ後の 8〜9 月の 2 か月で実作業に投入されるので 2X = 10 → X = 5 人。増加人件費 = 増員 5 人×2.5 か月×100 − 離脱 4 人×2 か月×100 = 1,250 − 800 = 450 万円。',
    categoryId: 'planning',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-9',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 9,
    questionText:
      'ソフトウェアの規模の見積り方法のうち，利用者機能要件と機能プロセスに着目して，機能プロセスごとに①～③の手順で見積りを行うものはどれか。\n①　データ移動を型として識別し，エントリ，エグジット，読込み及び書込みの 4 種類に分類する。\n②　データ移動の型ごとに，その個数に単位規模を乗じる。\n③　②で得た型ごとの値の合計を，機能プロセスの機能規模とする。',
    choices: ['COCOMO', 'COSMIC 法', '積み上げ法', '類推法'],
    correctIndex: 1,
    explanation: 'COSMIC 法（ISO/IEC 19761）は，機能プロセスごとにデータ移動をエントリ・エグジット・読込み・書込みの 4 種類に識別し，それぞれの個数に単位規模を乗じて機能規模を求める機能規模測定手法。ア COCOMO は規模（LOC）から工数を見積もる回帰モデル，ウ 積み上げ法はボトムアップで作業を積み上げる手法，エ 類推法は過去類似案件と比較して見積もる手法。',
    categoryId: 'measurement',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-10',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 10,
    questionText:
      'JIS Q 21500:2018（プロジェクトマネジメントの手引）によれば，プロセス “リスクの特定” 及びプロセス “リスクの評価” は，どのプロセス群に属するか。',
    choices: ['管理', '計画', '実行', '終結'],
    correctIndex: 1,
    explanation: 'JIS Q 21500:2018 のリスク主題群では，計画のプロセス群に「リスクの特定」「リスクの評価」が，実行のプロセス群に「リスクへの対応」が，管理のプロセス群に「リスクの管理」が配置されている。特定と評価はいずれも対応策を計画する前段の活動なので計画に属する。',
    categoryId: 'uncertainty',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-11',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 11,
    questionText:
      'どのリスクがプロジェクトに対して最も影響が大きいかを判断するのに役立つ定量的リスク分析とモデル化の技法として，感度分析がある。感度分析の結果を示した次の図を何と呼ぶか。',
    choices: ['確率分布', 'デシジョンツリーダイアグラム', 'トルネード図', 'リスクブレークダウンストラクチャ'],
    correctIndex: 2,
    explanation: '感度分析の結果を，影響の大きいリスクから上位に並べた横棒グラフで示し，竜巻型の形状をもつ図をトルネード図と呼ぶ。ア 確率分布は値とその発生確率の分布を示す図，イ デシジョンツリーダイアグラムは意思決定の分岐とその期待値を表す図，エ RBS（Risk Breakdown Structure）はリスクをカテゴリ別に階層化した分解構造。',
    categoryId: 'uncertainty',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '感度分析の結果を示す横棒グラフ。リスク1からリスク5までが上から順に並び、マイナスの影響はゼロより左に点模様、プラスの影響はゼロより右に斜線模様で表示される。棒は上ほど長く下ほど短い。',
      caption: '図　感度分析の結果',
      viewBox: '0 0 680 300',
      content: `
        <defs>
          <pattern id="dotsR3q11" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#475569"/>
            <circle cx="6" cy="6" r="1.1" fill="#475569"/>
          </pattern>
          <pattern id="diagR3q11" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="2"/>
          </pattern>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <line x1="145" y1="25" x2="145" y2="212" stroke="#1e293b" stroke-width="1.4"/>
        <line x1="465" y1="25" x2="465" y2="212" stroke="#1e293b" stroke-width="1.4"/>
        <line x1="198" y1="25" x2="198" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="252" y1="25" x2="252" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="305" y1="25" x2="305" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="358" y1="25" x2="358" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="412" y1="25" x2="412" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <text x="145" y="232" text-anchor="middle" font-size="13" fill="#1e293b">-10,000</text>
        <text x="198" y="232" text-anchor="middle" font-size="13" fill="#1e293b">-5,000</text>
        <text x="252" y="232" text-anchor="middle" font-size="13" fill="#1e293b">0</text>
        <text x="305" y="232" text-anchor="middle" font-size="13" fill="#1e293b">5,000</text>
        <text x="358" y="232" text-anchor="middle" font-size="13" fill="#1e293b">10,000</text>
        <text x="412" y="232" text-anchor="middle" font-size="13" fill="#1e293b">15,000</text>
        <text x="465" y="232" text-anchor="middle" font-size="13" fill="#1e293b">20,000</text>
        <text x="86" y="56" text-anchor="end" font-size="15" fill="#1e293b">リスク1</text>
        <text x="86" y="91" text-anchor="end" font-size="15" fill="#1e293b">リスク2</text>
        <text x="86" y="126" text-anchor="end" font-size="15" fill="#1e293b">リスク3</text>
        <text x="86" y="161" text-anchor="end" font-size="15" fill="#1e293b">リスク4</text>
        <text x="86" y="196" text-anchor="end" font-size="15" fill="#1e293b">リスク5</text>
        <rect x="160" y="37" width="92" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="37" width="202" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="182" y="72" width="70" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="72" width="142" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="198" y="107" width="54" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="107" width="100" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="212" y="142" width="40" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="142" width="64" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="230" y="177" width="22" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="177" width="36" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="515" y="74" font-size="14" fill="#1e293b" font-weight="bold">凡例</text>
        <rect x="515" y="90" width="38" height="22" fill="url(#diagR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="565" y="106" font-size="14" fill="#1e293b">プラスの影響</text>
        <rect x="515" y="125" width="38" height="22" fill="url(#dotsR3q11)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="565" y="141" font-size="14" fill="#1e293b">マイナスの影響</text>
      `,
    },
  },
  {
    id: 'om-R3-12',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 12,
    questionText: 'プロジェクトマネジメントで使用する分析技法のうち，傾向分析の説明はどれか。',
    choices: [
      '個々の選択肢とそれぞれを選択した場合に想定されるシナリオの関係を図に表し，それぞれのシナリオにおける期待値を計算して，最善の策を選択する。',
      '個々のリスクが現実のものとなったときの，プロジェクトの目標に与える影響の度合いを調べる。',
      '時間の経過に伴うプロジェクトのパフォーマンスの変動を分析する。',
      '発生した障害とその要因の関係を魚の骨のような図にして分析する。',
    ],
    correctIndex: 2,
    explanation: '傾向分析（trend analysis）は，時間の経過に伴うプロジェクトのパフォーマンス（コスト・スケジュール・品質指標等）の変動を分析する技法。ア はデシジョンツリー分析，イ は感度分析（影響度分析），エ は特性要因図（フィッシュボーン）の説明。',
    categoryId: 'measurement',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-13',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 13,
    questionText:
      '新しく編成するプロジェクトチームの開発要員投入計画に基づいて PC をレンタルで調達する。調達の条件を満たすレンタル費用の最低金額は何千円か。\n〔調達の条件〕\n(1) PC のレンタル契約は月初日から月末日までの 1 か月単位であり，日割りによる精算は行わない。\n(2) PC 1 台のレンタル料金は月額 5 千円である。\n(3) 台数にかかわらず，レンタル PC の受入れ時のセットアップに 2 週間，返却時のデータ消去に 1 週間を要し，この期間はレンタル期間に含める。\n(4) セットアップとデータ消去は，プロジェクトチームの開発要員とは別の要員が行う。\n(5) 開発要員は月初日に着任し，月末日に離任する。\n(6) 開発要員の役割にかかわらず，共通仕様の PC を 1 人が 1 台使用する。\n(7) レンタル期間中に PC を他の開発要員に引き渡す場合，データ消去，セットアップ及び引渡しの期間は不要である。',
    choices: ['350', '470', '480', '500'],
    correctIndex: 1,
    explanation: 'ピーク 11 台のうち継続して使う PC を 4 グループに分け，受入時 2 週間と返却時 1 週間のレンタル計上を加味して最小化する。例: PC1〜2（1 月セットアップ＋2〜11 月稼働＋12 月消去）= 12 か月×2 = 24，PC3〜4（2 月セット＋3〜11 月＋12 月）= 11×2 = 22，PC5〜7（3 月セット＋4〜9 月＋10 月）= 8×3 = 24，PC8〜11（5 月セット＋6〜9 月＋10 月）= 6×4 = 24。合計 94 か月×5 千円 = 470 千円。',
    categoryId: 'project-work',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔開発要員投入計画（単位：人　列は月）〕',
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
    id: 'om-R3-14',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 14,
    questionText:
      'JIS Q 21500:2018（プロジェクトマネジメントの手引）によれば，プロセス “コミュニケーションのマネジメント” の目的はどれか。',
    choices: [
      'チームのパフォーマンスを最大限に引き上げ，フィードバックを提供し，課題を解決し，コミュニケーションを促し，変更を調整して，プロジェクトの成功を達成すること',
      'プロジェクトのステークホルダのコミュニケーションのニーズを確実に満足し，コミュニケーションの課題が発生したときにそれを解決すること',
      'プロジェクトのステークホルダの情報及びコミュニケーションのニーズを決定すること',
      'プロセス “コミュニケーションの計画” で定めたように，プロジェクトのステークホルダに対し要求した情報を利用可能にすること及び情報に対する予期せぬ具体的な要求に対応すること',
    ],
    correctIndex: 1,
    explanation: 'JIS Q 21500:2018「コミュニケーションのマネジメント」は，ステークホルダのコミュニケーションニーズを確実に満足し，コミュニケーション課題が発生した際にそれを解決することが目的のプロセス。ア は「プロジェクトチームのマネジメント」，ウ は「コミュニケーションの計画」，エ は「情報の配布」プロセスの目的。',
    categoryId: 'project-work',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-15',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 15,
    questionText: 'オブジェクト指向開発におけるロバストネス分析で行うことはどれか。',
    choices: [
      'オブジェクトの確定，構造の定義，サブジェクトの定義，属性の定義，及びサービスの定義という五つの作業項目を並行して実施する。',
      'オブジェクトモデル，動的モデル，機能モデルという三つのモデルをこの順に作成して図に表す。',
      'ユースケースから抽出したクラスを，バウンダリクラス，コントロールクラス，エンティティクラスの三つに分類し，クラス間の関連を定義して図に表す。',
      '論理的な観点，物理的な観点，及び動的な観点の三つの観点で仕様の作成を行う。',
    ],
    correctIndex: 2,
    explanation: 'ロバストネス分析（Robustness Analysis）は，ユースケースから抽出したクラスをバウンダリ（境界）・コントロール（制御）・エンティティ（情報）の 3 種類に分類し，それらのクラス間関連を図に表す手法。ICONIX プロセスの中核技法で，ユースケースと設計クラス図の橋渡しを担う。ア は SA/SD（オブジェクト指向分析）の段階定義，イ は OMT（オブジェクトモデリング技法）の 3 モデル，エ は OOSE などの観点別仕様化に関する記述。',
    categoryId: 'development-approach',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-16',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 16,
    questionText: 'リーンソフトウェア開発の説明として，適切なものはどれか。',
    choices: [
      '経験的プロセス制御の理論を基本としており，スプリントと呼ばれる周期で “検査と適応” を繰り返しながら開発を進める。',
      '製造業の現場から生まれた考え方をアジャイル開発のプラクティスに適用したものであり，“ムダをなくす”，“品質を作り込む” といった，七つの原則を重視して，具体的な開発プロセスやプラクティスを策定する。',
      '比較的小規模な開発に適した，プログラミングに焦点を当てた開発アプローチであり，“コミュニケーション” などの五つの価値を定義し，それらを高めるように具体的な開発プロセスやプラクティスを策定する。',
      '利用者から見て価値があるまとまりを一つの機能単位とし，その単位ごとに，設計や構築などの五つのプロセスを繰り返しながら開発を進める。',
    ],
    correctIndex: 1,
    explanation: 'リーンソフトウェア開発は，トヨタ生産方式に代表される製造業のリーン思想をソフトウェア開発に適用したアジャイル系手法で，「ムダをなくす」「品質を作り込む」「知識を作り出す」「決定を遅らせる」「早く提供する」「人を尊重する」「全体を最適化する」の 7 原則を掲げる。ア はスクラム，ウ は XP（5 価値），エ は FDD（Feature Driven Development）の特徴。',
    categoryId: 'development-approach',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-17',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 17,
    questionText: 'マッシュアップの説明はどれか。',
    choices: [
      '既存のプログラムから，そのプログラムの仕様を導き出す。',
      '既存のプログラムを部品化し，それらの部品を組み合わせて，新規プログラムを開発する。',
      'クラスライブラリを利用して，新規プログラムを開発する。',
      '公開されている複数のサービスを利用して，新たなサービスを提供する。',
    ],
    correctIndex: 3,
    explanation: 'マッシュアップは，Web 上で公開されている複数のサービス（API）を組み合わせ，新たな付加価値のサービスを生成する開発手法。ア はリバースエンジニアリング，イ はコンポーネントベース開発（CBD），ウ はクラスライブラリ利用の説明で，いずれもマッシュアップの本質的特徴（外部の公開サービスを組合せて統合する）には合致しない。',
    categoryId: 'development-approach',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-18',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 18,
    questionText:
      'システムの改善に向けて提出された案 1～4 について，評価項目を設定して採点した結果を，採点結果表に示す。効果及びリスクについては 5 段階評価とし，それぞれの評価項目の重要度に応じて，重み付け表に示すとおりの重み付けを行った上で，次式で総合評価点を算出する。総合評価点が最も高い改善案はどれか。\n総合評価点 ＝ 効果の総評価点 － リスクの総評価点',
    choices: ['案 1', '案 2', '案 3', '案 4'],
    correctIndex: 2,
    explanation: '効果＝Σ(評価点×重み)，リスクも同様に算出して総合評価点＝効果−リスク。案 1：効果 5×3+2×2+3×4 = 31，リスク 4×3+2×8 = 28，総合 3。案 2：効果 4×3+4×2+4×4 = 36，リスク 1×3+4×8 = 35，総合 1。案 3：効果 2×3+2×2+5×4 = 30，リスク 5×3+1×8 = 23，総合 7。案 4：効果 4×3+5×2+2×4 = 30，リスク 1×3+5×8 = 43，総合 −13。最大は案 3。',
    categoryId: 'measurement',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔採点結果表・重み付け表〕',
      headers: ['区分', '評価項目', '案1', '案2', '案3', '案4', '重み'],
      rows: [
        ['効果', '作業コスト削減', 5, 4, 2, 4, 3],
        ['効果', 'システム運用品質向上', 2, 4, 2, 5, 2],
        ['効果', 'セキュリティ強化', 3, 4, 5, 2, 4],
        ['リスク', '技術リスク', 4, 1, 5, 1, 3],
        ['リスク', 'スケジュールリスク', 2, 4, 1, 5, 8],
      ],
      rowHeaderFirstCol: false,
    },
  },
  {
    id: 'om-R3-19',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 19,
    questionText: '情報システムの設計の例のうち，フェールソフトの考え方を適用した例はどれか。',
    choices: [
      'UPS を設置することによって，停電時に手順どおりにシステムを停止できるようにする。',
      '制御プログラムの障害時に，システムの暴走を避け，安全に運転を停止できるようにする。',
      'ハードウェアの障害時に，パフォーマンスは低下するが，構成を縮小して運転を続けられるようにする。',
      '利用者の誤操作や誤入力を未然に防ぐことによって，システムの誤動作を防止できるようにする。',
    ],
    correctIndex: 2,
    explanation: 'フェールソフトは，障害発生時に構成を縮小しつつパフォーマンスが低下しても運転を継続する設計思想（縮退運転）。ア・イ は障害時に「安全に停止」させるフェールセーフ，エ は誤入力・誤操作を未然防止するフールプルーフの説明。',
    categoryId: 'service-management',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-20',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 20,
    questionText: 'システムの要件を検討する際に用いる UX デザインの説明として，適切なものはどれか。',
    choices: [
      'システム設計時に，システム稼働後の個人情報保護などのセキュリティ対策を組み込む設計思想のこと',
      'システムを構成する個々のアプリケーションソフトウェアを利用者が享受するサービスと捉え，サービスを組み合わせることによってシステムを構築する設計思想のこと',
      'システムを利用する際にシステムの機能が利用者にもたらす有効性，操作性などに加え，快適さ，安心感，楽しさなどの体験価値を重視する設計思想のこと',
      '接続仕様や仕組みが公開されている他社のアプリケーションソフトウェアを活用してシステムを構築することによって，システム開発の生産性を高める設計思想のこと',
    ],
    correctIndex: 2,
    explanation: 'UX デザインは，ユーザがシステムを利用する際の有効性・操作性に加えて，快適さ・安心感・楽しさなど一連の体験価値（ユーザエクスペリエンス）を重視する設計思想。ア はセキュリティバイデザイン，イ は SOA（Service Oriented Architecture），エ は公開 API 活用（マッシュアップ含む）の説明。',
    categoryId: 'delivery',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-21',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 21,
    questionText:
      '常時 10 名以上の従業員を有するソフトウェア開発会社が，社内の情報セキュリティ管理を強化するために，秘密情報を扱う担当従業員の扱いを見直すこととした。労働法に照らし，適切な行為はどれか。',
    choices: [
      '就業規則に業務上知り得た秘密の漏えい禁止の一般的な規定があるときに，担当従業員の職務に即して秘密の内容を特定する個別合意を行う。',
      '就業規則には業務上知り得た秘密の漏えい禁止の規定がないときに，漏えい禁止と処分の規定を従業員の意見を聴かずに就業規則に追加する。',
      '情報セキュリティ事故を起こした場合の懲戒処分について，担当従業員との間で，就業規則の規定よりも重くした個別合意を行う。',
      '情報セキュリティに関連する規定は就業規則に記載してはいけないので，就業規則に規定を設けずに，各従業員と個別合意を行う。',
    ],
    correctIndex: 0,
    explanation: '就業規則に一般的な秘密保持規定があるとき，担当者の職務に即して具体的な秘密内容を個別合意で特定する行為は，労働契約と就業規則の整合を保ちつつ運用を強化する手段として労働法上適切。イ は就業規則変更時に従業員代表の意見聴取が義務（労基法 90 条），ウ は就業規則を上回る個別合意は労働者に不利な場合は無効，エ は秘密保持に関する制裁規定はむしろ就業規則の必要的記載事項に該当しうるため，記載してはいけないという前提が誤り。',
    categoryId: 'governance',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-22',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 22,
    questionText: '技術者倫理におけるホイッスルブローイングの説明として，適切なものはどれか。',
    choices: [
      '画期的なアイディアによって経済・社会に大きな変革をもたらすこと',
      'コミュニケーションを通じて自ら問題を解決できる人材を育成すること',
      '法令又は社会的規範を逸脱する行為を第三者などに知らしめること',
      'リスクが発生したときの対処方法をあらかじめ準備しておくこと',
    ],
    correctIndex: 2,
    explanation: 'ホイッスルブローイング（whistleblowing）は，組織内部の人物が，法令違反や社会的規範を逸脱する行為を組織内外の第三者（監督官庁・マスコミ等）に通報する行為，いわゆる内部告発を指す。ア はイノベーション，イ はコーチング／人材育成，エ はコンティンジェンシープランの説明。',
    categoryId: 'governance',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-23',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 23,
    questionText: '暗号技術のうち，共通鍵暗号方式はどれか。',
    choices: ['AES', 'ElGamal 暗号', 'RSA', '楕円曲線暗号'],
    correctIndex: 0,
    explanation: 'AES（Advanced Encryption Standard）は，DES の後継として米国 NIST が標準化した代表的な共通鍵（対称鍵）暗号方式。イ ElGamal 暗号，ウ RSA，エ 楕円曲線暗号 はいずれも公開鍵（非対称鍵）暗号方式。',
    categoryId: 'service-management',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-24',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 24,
    questionText: 'テンペスト攻撃の説明とその対策として，適切なものはどれか。',
    choices: [
      '通信路の途中でパケットの内容を改ざんする攻撃であり，その対策としては，ディジタル署名を利用して改ざんを検知する。',
      'ディスプレイなどから放射される電磁波を傍受し，表示内容を解析する攻撃であり，その対策としては，電磁波を遮断する。',
      'マクロマルウェアを使う攻撃であり，その対策としては，マルウェア対策ソフトを導入し，最新のマルウェア定義ファイルを適用する。',
      '無線 LAN の信号を傍受し，通信内容を解析する攻撃であり，その対策としては，通信パケットを暗号化する。',
    ],
    correctIndex: 1,
    explanation: 'テンペスト攻撃（TEMPEST）は，ディスプレイ・ケーブル・キーボードなどから漏れる電磁波（漏えい電磁波）を遠隔で傍受し，表示・処理内容を解析する攻撃。対策は電磁シールドで電磁波を遮断するのが基本。ア は中間者攻撃（MITM）と署名検証，ウ はマクロウイルス対策，エ は無線 LAN 盗聴と通信暗号化の説明。',
    categoryId: 'service-management',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R3-25',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 25,
    questionText: 'DNSSEC の機能はどれか。',
    choices: [
      'DNS キャッシュサーバの設定によって，再帰的な問合せを受け付ける送信元の範囲が最大になるようにする。',
      'DNS サーバから受け取るリソースレコードに対するディジタル署名を利用して，リソースレコードの送信者の正当性とデータの完全性を検証する。',
      'ISP などに設置されたセカンダリ DNS サーバを利用して権威 DNS サーバを二重化することによって，名前解決の可用性を高める。',
      '共通鍵暗号とハッシュ関数を利用したセキュアな方法によって，DNS 更新要求が許可されているエンドポイントを特定して認証する。',
    ],
    correctIndex: 1,
    explanation: 'DNSSEC は，DNS リソースレコードに認証局相当の鍵によるディジタル署名を付け，リゾルバ側で署名検証することで送信者の正当性とデータの完全性を保証する仕組み。ア はオープンリゾルバ問題に逆行する設定で攻撃悪用される側，ウ はセカンダリ DNS による冗長化（可用性向上）で DNSSEC とは別技術，エ は TSIG（Transaction SIGnature）による DNS 更新認証の説明。',
    categoryId: 'service-management',
    sourceUrl: R3_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-1',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 1,
    questionText:
      'JIS Q 21500:2018(プロジェクトマネジメントの手引)によれば，プロジェクトマネジメントのプロセス群には，立ち上げ，計画，実行，管理及び終結の五つがある。これらのうち，"変更要求"の提出を契機に相互作用するプロセス群の組みはどれか。',
    choices: ['計画，実行', '実行，管理', '実行，終結', '管理，終結'],
    correctIndex: 1,
    explanation: '変更要求は，実行のプロセス群で作業中に必要性が認識されて提出され，管理のプロセス群の「変更の管理」プロセスで評価・承認・却下が行われる。承認されればベースラインを更新して実行に戻すため，実行と管理が相互作用する組合せ（イ）が正しい。',
    categoryId: 'integration',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-2',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 2,
    questionText: 'JIS Q 21500:2018(プロジェクトマネジメントの手引)によれば，プロセス"プロジェクト作業の管理"の目的はどれか。',
    choices: [
      '確定したプロジェクトの目標，品質要求事項及び規格を満たしそうかどうかを明らかにし，不満足なパフォーマンスの原因及びそれを取り除くための方法を特定すること',
      'チームのパフォーマンスを最大限に引き上げ，フィードバックを提供し，課題を解決し，コミュニケーションを促し，変更を調整して，プロジェクトの成功を達成すること',
      'プロジェクト及び成果物に加えられる変更を管理し，次の実施の前に，これらの変更の受け入れ又は棄却を公式にすること',
      'プロジェクト全体計画に従って，統合的な方法でプロジェクト活動を完了すること',
    ],
    correctIndex: 3,
    explanation: 'JIS Q 21500:2018「プロジェクト作業の管理」は，プロジェクト全体計画に従い，統合的にプロジェクト活動を完了することが目的のプロセス。ア は「進捗の管理」（パフォーマンス監視と課題特定），イ は「プロジェクトチームのマネジメント」，ウ は「変更の管理」プロセスの目的。',
    categoryId: 'integration',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-3',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 3,
    questionText: 'プロジェクトマネジメントにおけるプロジェクト憲章の説明として，適切なものはどれか。',
    choices: [
      '組織のニーズ，目標ベネフィットなどを記述することによって，プロジェクトの目標について，またプロジェクトがどのように事業目的に貢献するかについて明確にした文書',
      'どのようにプロジェクトを実施し，監視し，管理するのかを定めるために，プロジェクトを実施するためのベースライン，並びにプロジェクトの実行，管理，及び終結する方法を明確にした文書',
      'プロジェクトの最終状態を定義することによって，プロジェクトの目標，成果物，要求事項及び境界を含むプロジェクトスコープを明確にした文書',
      'プロジェクトを正式に許可する文書であり，プロジェクトマネージャを特定して適切な責任と権限を明確にし，ビジネスニーズ，目標，期待される結果などを明確にした文書',
    ],
    correctIndex: 3,
    explanation: 'プロジェクト憲章は，プロジェクトを正式に許可し，プロジェクトマネージャを特定して権限を付与する文書で，ビジネスニーズ・目標・期待される結果などが盛り込まれる。ア はビジネスケース，イ はプロジェクトマネジメント計画書，ウ はプロジェクトスコープ記述書の説明。',
    categoryId: 'integration',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-4',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 4,
    questionText:
      'プロジェクトマネジメントで使用する責任分担マトリックス(RAM)の一つに，RACIチャートがある。RACIチャートで示す4種類の役割及び責任の組合せのうち，適切なものはどれか。',
    choices: [
      '実行責任，情報提供，説明責任，相談対応',
      '実行責任，情報提供，説明責任，リスク管理',
      '実行責任，情報提供，相談対応，リスク管理',
      '実行責任，説明責任，相談対応，リスク管理',
    ],
    correctIndex: 0,
    explanation: 'RACI チャートは R=Responsible（実行責任），A=Accountable（説明責任），C=Consulted（相談対応），I=Informed（情報提供）の 4 役割を割り当てる責任分担マトリックス。リスク管理は責任分担の項目ではないため，これを含むイ・ウ・エ はいずれも誤り。',
    categoryId: 'team',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-5',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 5,
    questionText:
      'プロジェクト期間の80%を経過した時点での出来高が全体の70%，発生したコストは8,500万円であった。完成時総予算は1億円であり，プランドバリューはプロジェクトの経過期間に比例する。このときの状況の説明のうち，正しいものはどれか。',
    choices: [
      'アーンドバリューは8,500万円である。',
      'コスト差異は－1,500万円である。',
      '実コストは7,000万円である。',
      'スケジュール差異は－500万円である。',
    ],
    correctIndex: 1,
    explanation: 'BAC=10,000，経過 80% で PV=BAC×0.8=8,000 万円，出来高 70% で EV=BAC×0.7=7,000 万円，AC=8,500 万円。コスト差異 CV = EV − AC = 7,000 − 8,500 = −1,500 万円（コスト超過）。ア EV は 7,000 万円，ウ AC は問題文の 8,500 万円，エ スケジュール差異 SV = EV − PV = 7,000 − 8,000 = −1,000 万円。',
    categoryId: 'measurement',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-6',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 6,
    questionText: 'プロジェクトの工程管理や進捗管理に使用されるガントチャートの特徴はどれか。',
    choices: [
      '各作業の開始時点と終了時点が一目で把握できる。',
      '各作業の構成要素を示しているので，管理がしやすい。',
      '各作業の前後関係が明確になり，クリティカルパスが把握できる。',
      '各作業の余裕日数が容易に把握できる。',
    ],
    correctIndex: 0,
    explanation: 'ガントチャートは横軸を時間，縦軸を作業として横棒で各作業の開始・終了時点を示す図表で，開始終了時期と進捗が一目で把握できる。イ「構成要素」は WBS，ウ「前後関係・クリティカルパス」はアローダイアグラム／ネットワーク図，エ「余裕日数」も同様にネットワーク図の特徴。',
    categoryId: 'planning',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-7',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 7,
    questionText:
      'あるプロジェクトの作業が図のとおり計画されているとき，最短日数で終了するためには，作業Hはプロジェクトの開始から遅くとも何日経過した後に開始しなければならないか。',
    choices: ['12', '14', '18', '21'],
    correctIndex: 3,
    explanation: '全経路を辿ると最長は A(8)→D(10)→G(12) = 30 日でこれが最短日数（クリティカルパス）。H に続く後続作業は I(4) のみで，H と I を合わせた所要は 5+4 = 9 日。30 日以内に完了するには H の最遅開始は 30 − 9 = 21 日後となる。',
    categoryId: 'planning',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'アローダイアグラム。開始からA 8日で上の点、B 5日で中央左の点、C 12日で下の点へ分岐する。上の点からD 10日で中央点、F 8日で終了前の点へ進む。中央左の点からE 9日で中央点へ進む。中央点からG 12日で終了前の点、ダミー作業で下の点へ進む。下の点からH 5日、I 4日で終了前の点へ進む。',
      caption: '図　作業ネットワーク',
      viewBox: '0 0 640 260',
      content: `
        <defs>
          <marker id="amR2q7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <circle cx="50" cy="118" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="190" cy="48" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="155" cy="118" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="270" cy="118" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="330" cy="188" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="430" cy="188" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="500" cy="118" r="17" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <line x1="66" y1="110" x2="174" y2="56" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="123" y="82" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">A</text>
        <text x="130" y="102" text-anchor="middle" font-size="13" fill="#1e293b">8</text>
        <line x1="67" y1="118" x2="136" y2="118" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="100" y="105" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">B</text>
        <text x="102" y="132" text-anchor="middle" font-size="13" fill="#1e293b">5</text>
        <line x1="65" y1="126" x2="313" y2="181" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="214" y="148" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">C</text>
        <text x="218" y="168" text-anchor="middle" font-size="13" fill="#1e293b">12</text>
        <line x1="204" y1="60" x2="258" y2="103" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="235" y="83" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">D</text>
        <text x="232" y="105" text-anchor="middle" font-size="13" fill="#1e293b">10</text>
        <line x1="172" y1="118" x2="251" y2="118" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="212" y="104" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">E</text>
        <text x="212" y="133" text-anchor="middle" font-size="13" fill="#1e293b">9</text>
        <line x1="206" y1="52" x2="482" y2="114" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="356" y="70" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">F</text>
        <text x="360" y="91" text-anchor="middle" font-size="13" fill="#1e293b">8</text>
        <line x1="287" y1="118" x2="481" y2="118" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="384" y="104" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">G</text>
        <text x="384" y="133" text-anchor="middle" font-size="13" fill="#1e293b">12</text>
        <line x1="282" y1="131" x2="317" y2="174" stroke="#334155" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#amR2q7)"/>
        <line x1="347" y1="188" x2="411" y2="188" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="380" y="174" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">H</text>
        <text x="380" y="202" text-anchor="middle" font-size="13" fill="#1e293b">5</text>
        <line x1="442" y1="176" x2="488" y2="132" stroke="#334155" stroke-width="1.6" marker-end="url(#amR2q7)"/>
        <text x="470" y="156" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="bold">I</text>
        <text x="468" y="176" text-anchor="middle" font-size="13" fill="#1e293b">4</text>
        <text x="548" y="96" font-size="13" fill="#1e293b" font-weight="bold">凡例</text>
        <circle cx="548" cy="125" r="14" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <circle cx="610" cy="125" r="14" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <line x1="562" y1="125" x2="594" y2="125" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q7)"/>
        <text x="580" y="114" text-anchor="middle" font-size="12" fill="#1e293b">作業名</text>
        <text x="580" y="141" text-anchor="middle" font-size="12" fill="#1e293b">所要日数</text>
        <line x1="548" y1="166" x2="608" y2="166" stroke="#334155" stroke-width="1.4" stroke-dasharray="6 4" marker-end="url(#amR2q7)"/>
        <text x="626" y="170" text-anchor="middle" font-size="12" fill="#1e293b">ダミー作業</text>
      `,
    },
  },
  {
    id: 'om-R2-8',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 8,
    questionText:
      'PMBOKガイド第6版によれば，プロジェクト・スケジュール・マネジメントにおけるプロセス"スケジュールの作成"のツールと技法の特徴のうち，資源平準化の特徴はどれか。',
    choices: [
      'アクティビティの開始日と終了日を調整するので，クリティカル・パスが変わる原因になることが多い。',
      'アクティビティは，属しているフリー・フロート及びトータル・フロートの大きさの範囲内に限って遅らせることができる。',
      'アクティビティを調整しても，クリティカル・パスが変わることはなく，完了日を遅らせるようなこともない。',
      'スケジュール・モデル内で，論理ネットワーク・パスにおけるスケジュールの柔軟性が評価できる。',
    ],
    correctIndex: 0,
    explanation: '資源平準化（resource leveling）は，資源制約に合わせて開始日・終了日を調整するため，フロートを超えて作業を移動することがありクリティカルパスが変わる原因になりやすい。イ・ウ はフロート内に収める「資源スムージング」の特徴で，CP が変わらない点が両者の決定的な違い。エ は論理ネットワーク・パスの柔軟性を見る「クリティカルパス法」の説明。',
    categoryId: 'planning',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-9',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 9,
    questionText:
      'COCOMOには，システム開発の工数を見積もる式の一つとして次式がある。\n開発工数＝3.0×(開発規模)^{1.12}\nこの式を基に，開発規模と開発生産性（開発規模／開発工数）の関係を表したグラフはどれか。ここで，開発工数の単位は人月，開発規模の単位はキロ行とする。',
    choices: ['選択肢アのグラフ', '選択肢イのグラフ', '選択肢ウのグラフ', '選択肢エのグラフ'],
    correctIndex: 3,
    explanation: '開発生産性 = 開発規模 ÷ 開発工数 = 規模 ÷ (3.0 × 規模^{1.12}) = 規模^{−0.12} ÷ 3.0。指数が −0.12（負だが小さい絶対値）なので，規模が増えると生産性は単調に低下し，かつ低下の度合いは次第に緩やかになる。よって右下がりで次第に緩やかな曲線（エ）が正しい。',
    categoryId: 'measurement',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '開発規模を横軸、開発生産性を縦軸とする四つの候補グラフ。アは右上がりで次第に緩やか、イは右上がりで次第に急、ウは右下がりで次第に急、エは右下がりで次第に緩やかになる。',
      caption: '図　開発規模と開発生産性の関係の候補',
      viewBox: '0 0 620 360',
      content: `
        <defs>
          <marker id="amR2q9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(35 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ア</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <path d="M 35 112 C 55 60, 105 44, 176 39" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">イ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <path d="M 35 112 C 88 111, 135 88, 176 36" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(35 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ウ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <path d="M 35 36 C 85 38, 142 68, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">エ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amR2q9)"/>
          <path d="M 35 36 C 48 74, 88 103, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
      `,
    },
  },
  {
    id: 'om-R2-10',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 10,
    questionText:
      'プロジェクトにどのツールを導入するかを，EMV(期待金額価値)を用いて検討する。デシジョンツリーが次の図のとき，ツールAを導入するEMVがツールBを導入するEMVを上回るのは，Xが幾らよりも大きい場合か。',
    choices: ['120', '150', '200', '240'],
    correctIndex: 2,
    explanation: 'EMV(A) = 0.6X + 0.4×90 − 120 = 0.6X − 84。EMV(B) = 0.6×120 + 0.4×60 − 60 = 36。EMV(A) > EMV(B) すなわち 0.6X − 84 > 36 を解くと 0.6X > 120 → X > 200。よって 200 万円より大きいとき A が有利。',
    categoryId: 'uncertainty',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'デシジョンツリー。どのツールを導入するかの決定ノードから、ツールAを導入とツールBを導入に分岐する。ツールAは費用120万円、効果が大きい場合60%で効果額X万円、効果が小さい場合40%で90万円。ツールBは費用60万円、効果が大きい場合60%で120万円、効果が小さい場合40%で60万円。',
      caption: '図　ツール導入のデシジョンツリー',
      viewBox: '0 0 660 330',
      content: `
        <defs>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <rect x="28" y="133" width="118" height="52" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="87" y="153" text-anchor="middle" font-size="13" fill="#1e293b">どのツールを</text>
        <text x="87" y="171" text-anchor="middle" font-size="13" fill="#1e293b">導入するか</text>
        <rect x="178" y="154" width="14" height="14" fill="#111827" stroke="#111827" stroke-width="1.2"/>
        <rect x="252" y="70" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="93" text-anchor="middle" font-size="13" fill="#1e293b">ツールAを導入</text>
        <text x="327" y="113" text-anchor="middle" font-size="13" fill="#1e293b">（費用 120万円）</text>
        <rect x="252" y="205" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="228" text-anchor="middle" font-size="13" fill="#1e293b">ツールBを導入</text>
        <text x="327" y="248" text-anchor="middle" font-size="13" fill="#1e293b">（費用 60万円）</text>
        <circle cx="435" cy="99" r="9" fill="#111827"/>
        <circle cx="435" cy="234" r="9" fill="#111827"/>
        <rect x="525" y="34" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="54" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="72" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 X 万円）</text>
        <rect x="525" y="110" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="130" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="148" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 90万円）</text>
        <rect x="525" y="187" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="207" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="225" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 120万円）</text>
        <rect x="525" y="263" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="283" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="301" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 60万円）</text>
        <line x1="146" y1="159" x2="178" y2="161" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="402" y1="99" x2="426" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="99" x2="488" y2="58" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="58" x2="525" y2="58" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="48" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="99" x2="488" y2="135" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="135" x2="525" y2="135" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="130" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <line x1="402" y1="234" x2="426" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="234" x2="488" y2="212" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="212" x2="525" y2="212" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="202" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="234" x2="488" y2="288" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="288" x2="525" y2="288" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="278" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <text x="42" y="242" font-size="13" fill="#1e293b">〔凡例〕</text>
        <rect x="43" y="254" width="12" height="12" fill="#111827"/>
        <text x="63" y="266" font-size="13" fill="#1e293b">決定ノード</text>
        <circle cx="49" cy="285" r="7" fill="#111827"/>
        <text x="63" y="289" font-size="13" fill="#1e293b">機会ノード</text>
      `,
    },
  },
  {
    id: 'om-R2-11',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 11,
    questionText:
      'PMBOKガイド第6版によれば，リスクにはプロジェクト目標にマイナスの影響を及ぼす"脅威"と，プラスの影響を及ぼす"好機"がある。リスクに対応する戦略のうち，"好機"に対する戦略である"強化"に該当するものはどれか。',
    choices: [
      'アクティビティを予定よりも早く終了させるために，計画よりも多くの資源を投入する。',
      'リスク共有のパートナーシップ，チーム，ジョイント・ベンチャーなどを形成する。',
      'リスクに対処するために，時間，資金，資源の量などに関してコンティンジェンシー予備を設ける。',
      'リスクを定期的にレビューする以外の行動はとらず，リスクが顕在化したときにプロジェクト・チームが対処する。',
    ],
    correctIndex: 0,
    explanation: '好機の対応戦略は「活用 (Exploit)」「強化 (Enhance)」「共有 (Share)」「受容 (Accept)」の 4 つ。強化は好機の発生確率や影響を増大させる施策で，資源を追加投入して好機を高める ア が該当する。イ はリスク共有，ウ ・エ はそれぞれ脅威・好機どちらにも適用される受容（コンティンジェンシー予備による積極的受容と，特別対応をしない消極的受容）の説明。',
    categoryId: 'uncertainty',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-12',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 12,
    questionText: '品質の定量的評価の指標のうち，ソフトウェアの保守性の評価指標になるものはどれか。',
    choices: [
      '（最終成果物に含まれる誤りの件数）÷（最終成果物の量）',
      '（修正時間の合計）÷（修正件数）',
      '（変更が必要となるソースコードの行数）÷（移植するソースコードの行数）',
      '（利用者からの改良要求件数）÷（出荷後の経過月数）',
    ],
    correctIndex: 1,
    explanation: '保守性は「修正のしやすさ」を評価する品質特性で，1 件あたりの平均修正時間（修正時間合計 ÷ 修正件数）は保守性の代表的な定量指標。ア は欠陥密度（信頼性），ウ は移植性，エ は機能適合性や使用性の改良要求の発生頻度を示す指標で，いずれも保守性そのものの指標ではない。',
    categoryId: 'delivery',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-13',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 13,
    questionText:
      '次の契約条件でコストプラスインセンティブフィー契約を締結した。完成時の実コストが8,000万円の場合，受注者のインセンティブフィーは何万円か。\n〔契約条件〕\n(1) 目標コスト\n9,000万円\n(2) 目標コストで完成したときのインセンティブフィー\n1,000万円\n(3) 実コストが目標コストを下回ったときのインセンティブフィー\n目標コストと実コストとの差額の70%を1,000万円に加えた額。\n(4) 実コストが目標コストを上回ったときのインセンティブフィー\n実コストと目標コストとの差額の70%を1,000万円から減じた額。ただし，1,000万円から減じる額は，1,000万円を限度とする。',
    choices: ['700', '1,000', '1,400', '1,700'],
    correctIndex: 3,
    explanation: '実コスト 8,000 万円は目標コスト 9,000 万円を下回るので条件 (3) を適用。差額 9,000 − 8,000 = 1,000 万円，その 70% = 700 万円を基本フィー 1,000 万円に加算してインセンティブフィー = 1,000 + 700 = 1,700 万円。',
    categoryId: 'project-work',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-14',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 14,
    questionText: 'JIS Q 21500:2018(プロジェクトマネジメントの手引)によれば，プロセス"コミュニケーションの計画"の目的はどれか。',
    choices: [
      'プロジェクトに影響されるか，又は影響を及ぼす個人，集団又は組織を明らかにし，その利害及び関係に関連する情報を文書化すること',
      'プロジェクトのステークホルダに対し要求した情報を利用可能にすること及び情報に対する予期せぬ具体的な要求に対応すること',
      'プロジェクトのステークホルダのコミュニケーションニーズを確実に満足し，コミュニケーションの問題が発生したときにそれを解決すること',
      'プロジェクトのステークホルダの情報及びコミュニケーションのニーズを決定すること',
    ],
    correctIndex: 3,
    explanation: 'JIS Q 21500:2018「コミュニケーションの計画」は，プロジェクトステークホルダの情報及びコミュニケーションのニーズを決定することが目的のプロセス。ア は「ステークホルダの特定」，イ は「情報の配布」，ウ は「コミュニケーションのマネジメント」の目的。',
    categoryId: 'project-work',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-15',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 15,
    questionText:
      '新システムの受入れ支援において，利用者への教育訓練に対する教育効果の測定を，カークパトリックモデルの4段階評価を用いて行う。レベル1(Reaction)，レベル2(Learning)，レベル3(Behavior)，レベル4(Results)の各段階にそれぞれ対応したa～dの活動のうち，レベル2のものはどれか。\na　受講者にアンケートを実施し，教育訓練プログラムの改善に活用する。\nb　受講者に行動計画を作成させ，後日，新システムの活用状況を確認する。\nc　受講者の行動による組織業績の変化を分析し，ROIなどを算出する。\nd　理解度確認テストを実施し，テスト結果を受講者にフィードバックする。',
    choices: ['a', 'b', 'c', 'd'],
    correctIndex: 3,
    explanation: 'カークパトリックモデルの 4 段階は Lv1 Reaction（反応：満足度・感想），Lv2 Learning（学習：知識・理解度の獲得），Lv3 Behavior（行動：現場での行動変容），Lv4 Results（結果：業績・ROI）。a は受講後アンケート＝Lv1，b は行動変容の確認＝Lv3，c は業績インパクト＝Lv4，d は理解度テストで学習成果を測る＝Lv2 に該当する。',
    categoryId: 'delivery',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-16',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 16,
    questionText: 'SOAでサービスを設計する際の注意点のうち，適切なものはどれか。',
    choices: [
      '可用性を高めるために，ステートフルなインタフェースとする。',
      '業務からの独立性を確保するために，サービスの名称は抽象的なものとする。',
      '業務の変化に対応しやすくするために，サービス間の関係は疎結合にする。',
      'セキュリティを高めるために，一度開発したサービスの設計は再利用しない。',
    ],
    correctIndex: 2,
    explanation: 'SOA（Service Oriented Architecture）はサービス間を疎結合に設計し，個々のサービスの変更が他に波及しないようにすることで，業務変化への追随性を高める。ア は可用性向上のためにステートレスにすべき（拡張容易性とフェールオーバを確保），イ は業務概念に対応した具体名にして使いやすくする，エ は SOA の本質である再利用性を否定しており不適切。',
    categoryId: 'development-approach',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-17',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 17,
    questionText: 'ユースケース駆動開発の利点はどれか。',
    choices: [
      '開発を反復するので，新しい要求やビジネス目標の変化に柔軟に対応しやすい。',
      '開発を反復するので，リスクが高い部分に対して初期段階で対処しやすく，プロジェクト全体のリスクを減らすことができる。',
      '基本となるアーキテクチャをプロジェクトの初期に決定するので，コンポーネントを再利用しやすくなる。',
      'ひとまとまりの要件を1単位として設計からテストまで実施するので，要件ごとに開発状況が把握できる。',
    ],
    correctIndex: 3,
    explanation: 'ユースケース駆動開発は，ユーザがシステムをどう使うかを示すユースケースを開発の中心軸に据え，ひとまとまりの要件（ユースケース）単位で分析・設計・実装・テストを進める。ユースケース単位の進捗が見えやすい点が利点。ア は反復型開発（変化への対応），イ はリスク駆動の反復（スパイラルモデル等），ウ はアーキテクチャ駆動開発の特徴。',
    categoryId: 'development-approach',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-18',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 18,
    questionText:
      '基幹業務システムの構築及び運用において，データ管理者(DA)とデータベース管理者(DBA)を別々に任命した場合のDAの役割として，適切なものはどれか。',
    choices: [
      '業務データ量の増加傾向を把握し，ディスク装置の増設などを計画して実施する。',
      'システム開発の設計工程では，主に論理データベース設計を行い，データ項目を管理して標準化する。',
      'システム開発のテスト工程では，主にパフォーマンスチューニングを担当する。',
      'システム障害が発生した場合には，データの復旧や整合性のチェックなどを行う。',
    ],
    correctIndex: 1,
    explanation: 'DA（Data Administrator）はデータそのものの全社視点の管理者で，論理データベース設計やデータ項目の標準化を担う。一方 DBA（Database Administrator）はデータベースという物理製品の管理者で，ア の容量計画・ディスク増設，ウ のパフォーマンスチューニング，エ の障害復旧などを担当する。',
    categoryId: 'service-management',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-19',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 19,
    questionText:
      '空調計画における冷房負荷には，"外気負荷"，"室内負荷"，"伝熱負荷"，"日射負荷"などがある。冷房負荷の軽減策のうち，"伝熱負荷"の軽減策として，最も適切なものはどれか。',
    choices: [
      '使用を終えたら，その都度PCの電源を切る。',
      '隙間風や換気による影響を少なくする。',
      '日光が当たる南に面したガラス窓をむやみに大きなものにしない。',
      '屋根や壁面の断熱をおろそかにしない。',
    ],
    correctIndex: 3,
    explanation: '伝熱負荷は，屋根・壁・床などの建物外殻を通じて伝わる熱による負荷であり，断熱性能を高めることで軽減できる。ア は機器発熱を抑える室内負荷（内部負荷）対策，イ は隙間風・換気の外気負荷対策，ウ は日射負荷（窓ガラスからの太陽放射熱）対策。',
    categoryId: 'service-management',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-20',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 20,
    questionText: 'スタンフォード大学ハッソ・プラットナー・デザイン研究所によるデザイン思考の説明はどれか。',
    choices: [
      '与えられた問題に対して一つの正しい解決策を見つけるために，アイディア出しの段階で，テーマに制限を設けてアイディアが発散しないようにする手法',
      '本質的な問題がどこにあるのかを絞り込むために，利用者との対話よりも，過去のデータや経験を分析することを重視する手法',
      '利用者の立場から問題解決に取り組む方法論であり，現場を観察することによって利用者を理解し，共感することから始め，問題定義，アイディア出し，試作，試行を繰り返す手法',
      '類似の問題が発生した場合に，迅速に解決策を探り当てるために，過去の問題とその解決策をナレッジデータベースとして蓄積する手法',
    ],
    correctIndex: 2,
    explanation: 'スタンフォード d.school のデザイン思考は，共感 (Empathize) → 問題定義 (Define) → アイディア出し (Ideate) → 試作 (Prototype) → 試行 (Test) の 5 ステップを反復する人間中心の問題解決アプローチで，利用者観察・共感から始める点が特徴。ア はアイディア発散を抑える収束思考でデザイン思考と逆，イ は対話より分析優先で「共感」原則と相反，エ はナレッジマネジメントの説明。',
    categoryId: 'development-approach',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-21',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 21,
    questionText: '個人情報保護法が保護の対象としている個人情報に関する記述のうち，適切なものはどれか。',
    choices: [
      '企業が管理している顧客に関する情報に限られる。',
      '個人が秘密にしているプライバシーに関する情報に限られる。',
      '生存している個人に関する情報に限られる。',
      '日本国籍を有する個人に関する情報に限られる。',
    ],
    correctIndex: 2,
    explanation: '個人情報保護法の「個人情報」は，生存する個人に関する情報で，氏名・生年月日その他の記述により特定の個人を識別できるもの（個人識別符号を含む）と定義される。ア 顧客限定，イ プライバシー限定，エ 日本国籍限定はいずれも法の定義にはなく，従業員・取引先など広く対象となり，国籍も問わない。',
    categoryId: 'governance',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-22',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 22,
    questionText:
      '労働者派遣事業における派遣労働者の労働時間，休日，休暇などの具体的な就業に関する枠組み設定のうち，労働関連の法に照らして適切なものはどれか。',
    choices: [
      '派遣元と派遣先との間で設定し，派遣労働者はその条件に従わなければならない。',
      '派遣先が設定し，それを派遣元と派遣労働者に通知することになっている。',
      '派遣先と派遣労働者との間で設定し，両者の間の労働契約に盛り込む必要がある。',
      '派遣元と派遣労働者との間で設定し，派遣先はその範囲内で派遣労働者を指揮命令の下に労働させなければならない。',
    ],
    correctIndex: 3,
    explanation: '労働者派遣では，派遣元と派遣労働者の間に労働契約が成立し，労働時間・休日・休暇などの就業条件はその労働契約で定める。派遣先は派遣契約と労働者派遣法の範囲内で指揮命令ができるだけで，労働条件そのものを直接決定する立場にはない。よって エ が正しく，ア・イ・ウ はそれぞれ派遣の二面性を取り違えている。',
    categoryId: 'governance',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-23',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 23,
    questionText: 'シングルサインオンの実装方式に関する記述のうち，適切なものはどれか。',
    choices: [
      'cookieを使ったシングルサインオンの場合，サーバごとの認証情報を含んだcookieをクライアントで生成し，各サーバ上で保存，管理する。',
      'cookieを使ったシングルサインオンの場合，認証対象の各サーバを，異なるインターネットドメインに配置する必要がある。',
      'リバースプロキシを使ったシングルサインオンの場合，認証対象のWebサーバを，異なるインターネットドメインに配置する必要がある。',
      'リバースプロキシを使ったシングルサインオンの場合，利用者認証においてパスワードの代わりにデジタル証明書を用いることができる。',
    ],
    correctIndex: 3,
    explanation: 'リバースプロキシ方式の SSO では，すべての認証をリバースプロキシで一元化するため，バックエンド Web サーバの認証手段に依存せずデジタル証明書認証など強固な認証手段を利用できる。ア cookie はサーバが発行し，クライアントが保存する，イ cookie 方式は同一インターネットドメインに配置する必要がある，ウ リバースプロキシ方式は単一の入口に認証を集約するため，バックエンドが同一ドメインでも問題なく動作する。',
    categoryId: 'service-management',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-24',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 24,
    questionText: '共通脆弱性評価システム(CVSS)の特徴として，適切なものはどれか。',
    choices: [
      'CVSSv2とCVSSv3は，脆弱性の深刻度の算出方法が同じであり，どちらのバージョンで算出しても同じ値になる。',
      '情報システムの脆弱性の深刻度に対するオープンで汎用的な評価手法であり，特定ベンダーに依存しない評価方法を提供する。',
      '脆弱性の深刻度を0から100の数値で表す。',
      '脆弱性を評価する基準は，現状評価基準と環境評価基準の二つである。',
    ],
    correctIndex: 1,
    explanation: 'CVSS（Common Vulnerability Scoring System）は，IT 製品の脆弱性に対するベンダー非依存・オープンな汎用評価手法。ア CVSSv2 と v3 はメトリックや計算式が異なり同じ値にならない，ウ スコアは 0.0〜10.0 の範囲で表現する，エ 評価基準は基本評価基準・現状評価基準・環境評価基準の 3 つで構成される。',
    categoryId: 'service-management',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R2-25',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 25,
    questionText: '脆弱性検査手法の一つであるファジングはどれか。',
    choices: [
      '既知の脆弱性に対するシステムの対応状況に注目し，システムに導入されているソフトウェアのバージョン及びパッチの適用状況の検査を行う。',
      'ソフトウェアの，データの入出力に注目し，問題を引き起こしそうなデータを大量に多様なパターンで入力して挙動を観察し，脆弱性を見つける。',
      'ベンダーや情報セキュリティ関連機関が提供するセキュリティアドバイザリなどの最新のセキュリティ情報に注目し，ソフトウェアの脆弱性の検査を行う。',
      'ホワイトボックス検査の一つであり，ソフトウェアの内部構造に注目し，ソースコードの構文をチェックすることによって脆弱性を見つける。',
    ],
    correctIndex: 1,
    explanation: 'ファジングは，ソフトウェアの入出力に注目し，問題を引き起こしそうな大量かつ多様なパターンのデータを入力して挙動を観察し，例外的・想定外の振る舞いから脆弱性を見つける動的な検査手法。ア はパッチ管理・バージョン管理の検査，ウ はセキュリティアドバイザリ照合，エ は静的解析（ホワイトボックス検査）の説明。',
    categoryId: 'service-management',
    sourceUrl: R2_OCTOBER_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-1',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 1,
    questionText:
      'あるプロジェクトのステークホルダとして，プロジェクトスポンサ，プロジェクトマネージャ，プロジェクトマネジメントオフィス及びプロジェクトマネジメントチームが存在する。JIS Q 21500:2018（プロジェクトマネジメントの手引）によれば，組織としての標準化，プロジェクトマネジメントの教育訓練，プロジェクトの計画及びプロジェクトの監視などの役割を主として担うのはどれか。',
    choices: [
      'プロジェクトスポンサ',
      'プロジェクトマネージャ',
      'プロジェクトマネジメントオフィス',
      'プロジェクトマネジメントチーム',
    ],
    correctIndex: 2,
    explanation: 'JIS Q 21500:2018 でプロジェクトマネジメントオフィス（PMO）は，組織横断的にプロジェクトマネジメントの標準化・教育訓練・計画支援・監視・支援などを担う。ア スポンサは資金提供と意思決定，イ プロジェクトマネージャは個別プロジェクトの責任者，エ プロジェクトマネジメントチームは PM 配下の運営支援チーム。',
    categoryId: 'governance',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-2',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 2,
    questionText:
      '表は，RACI チャートを用いた，あるプロジェクトの責任分担マトリクスである。設計アクティビティにおいて，説明責任をもつ要員は誰か。',
    choices: ['阿部', '伊藤と佐藤', '鈴木と田中', '野村'],
    correctIndex: 3,
    explanation: 'RACI チャートにおける説明責任（A=Accountable）は，アクティビティに対して 1 人が担うのが原則。設計行を見ると 阿部=R，伊藤=I，佐藤=I，鈴木=C，田中=C，野村=A となっており，A をもつのは野村のみ。',
    categoryId: 'team',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔RACI チャートによる責任分担マトリクス〕',
      headers: ['アクティビティ', '阿部', '伊藤', '佐藤', '鈴木', '田中', '野村'],
      rows: [
        ['要件定義', 'C', 'A', 'I', 'I', 'I', 'R'],
        ['設計', 'R', 'I', 'I', 'C', 'C', 'A'],
        ['開発', 'A', '－', 'R', '－', 'R', 'I'],
        ['テスト', 'I', 'I', 'C', 'R', 'A', 'C'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R1-3',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 3,
    questionText: '工程管理図表の特徴に関する記述のうち，ガントチャートのものはどれか。',
    choices: [
      '計画と実績の時間的推移を表現するのに適し，進み具合及びその傾向がよく分かり，プロジェクト全体の費用と進捗の管理に利用される。',
      '作業の順序や作業相互の関係を表現したり，重要作業を把握したりするのに適しており，プロジェクトの作業計画などに利用される。',
      '作業の相互関係の把握には適さないが，作業計画に対する実績を把握するのに適しており，個人やグループの進捗管理に利用される。',
      '進捗管理上のマイルストーンを把握するのに適しており，プロジェクト全体の進捗管理などに利用される。',
    ],
    correctIndex: 2,
    explanation: 'ガントチャートは横軸を時間，縦軸を作業として横棒で各作業の開始・終了時点を示し，計画と実績の対比による進捗管理に適する一方，作業間の依存関係（順序）の把握には向かない。ア は EVM（コストと進捗を時間推移で示す），イ はネットワーク図／CPM（順序関係・重要作業），エ はマイルストーンチャートの説明。',
    categoryId: 'planning',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-4',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 4,
    questionText: 'プロジェクトのスケジュール管理で使用する “クリティカルチェーン法” の実施例はどれか。',
    choices: [
      '限りある資源とプロジェクトの不確実性に対応するために，合流バッファとプロジェクトバッファを設ける。',
      'クリティカルパス上の作業に，生産性を向上させるための開発ツールを導入する。',
      'クリティカルパス上の作業に，要員を追加投入する。',
      'クリティカルパス上の先行作業が終了する前に後続作業に着手し，並行して実施する。',
    ],
    correctIndex: 0,
    explanation: 'クリティカルチェーン法は，資源制約とプロジェクトの不確実性に対応するため，非クリティカルチェーンの合流点に合流バッファを，クリティカルチェーン末尾にプロジェクトバッファを置く手法。イ・ウ はクリティカルパス法上の生産性向上策・クラッシング，エ はファストトラッキング（並行化）の説明。',
    categoryId: 'planning',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-5',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 5,
    questionText:
      'JIS Q 21500:2018（プロジェクトマネジメントの手引）によれば，対象群 “リスク” の活動内容のうち，プロセス “リスクへの対応” で実施するものはどれか。',
    choices: [
      'プロジェクトの混乱を最小限にするために，リスク対応の有効性を評価しながらのリスク対応の進捗をレビューする。',
      'プロジェクトの目標への脅威を軽減するために，プロジェクトの予算及びスケジュールに資源と活動を投入することによって，リスクを扱う。',
      'プロジェクトのライフサイクルを通じて，プロジェクトの目標に影響を与えることがあるリスク事象及びその特性の決定を繰り返す。',
      'リスクの優先順位を定めるために，各リスクの発生確率及びそのリスクが発生した場合にプロジェクトの目標に及ぼす結果を推定する。',
    ],
    correctIndex: 1,
    explanation: 'JIS Q 21500:2018「リスクへの対応」は実行のプロセス群に属し，プロジェクト目標への脅威の軽減や好機の活用のために予算・スケジュールに資源と活動を投入する。ア は管理プロセス群の「リスクの管理」，ウ は「リスクの特定」（計画群で反復的に実施），エ は「リスクの評価」の活動。',
    categoryId: 'uncertainty',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-6',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 6,
    questionText:
      'WBS を構成する個々のワークパッケージの進捗率を測定する方法のうち，ワークパッケージの期間が比較的長い作業に適した，重み付けマイルストーン法の説明はどれか。',
    choices: [
      '作業を開始したら 50%，作業が完了したら 100%というように，作業の “開始” と “完了” の 2 時点について，計上する進捗率を決めておく。',
      '設計書の作成作業において，“複雑な入出力に関する記述を終えたら 70%とする” というように，計測者の主観で進捗率を決める。',
      '設計書のレビューを完了したら 60%，社内承認を得たら 80%というように，あらかじめ設定した作業の区切りを過ぎるごとに計上する進捗率を決めておく。',
      '全部で 10 日間の作業のうち 5 日を経過したら 50%というように，全作業期間に対する経過した作業期間の比で進捗率を決める。',
    ],
    correctIndex: 2,
    explanation: '重み付けマイルストーン法は，期間の長い作業で「区切り（マイルストーン）」ごとにあらかじめ計上する進捗率（例: レビュー完了 60%／社内承認 80%）を設定し，区切り通過時に計上する手法。ア は 50/50 ルール（開始 50％・完了 100％）に類する 2 時点固定法，イ は主観法（推奨されない），エ は経過期間按分法。',
    categoryId: 'measurement',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-7',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 7,
    questionText: 'PMBOK ガイド第6版によれば，“ステークホルダー・エンゲージメントのマネジメント” で行う活動はどれか。',
    choices: [
      '交渉やコミュニケーションを通してステークホルダーの期待をマネジメントする。',
      'ステークホルダーの権限レベルとプロジェクト成果に関する懸念レベルに応じて，ステークホルダーを分類する。',
      'ステークホルダーのリスク選好を決めるためのステークホルダー分析をする。',
      'プロジェクト・コミュニケーション活動のための適切な取組み方と計画を策定する。',
    ],
    correctIndex: 0,
    explanation: 'PMBOK第6版「ステークホルダー・エンゲージメントのマネジメント」は，交渉やコミュニケーションを通じてステークホルダーの期待をマネジメントし，懸念に対処してプロジェクトの成功確度を高めるプロセス。イ は「ステークホルダーの分類（権限／関心グリッド）」で識別後の分析活動，ウ もステークホルダー分析の例，エ は「コミュニケーション・マネジメント計画」の活動。',
    categoryId: 'stakeholder',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-8',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 8,
    questionText:
      'あるシステムの設計から結合テストまでの作業について，開発工程ごとの見積工数を表 1 に，開発工程ごとの上級技術者と初級技術者の要員割当てを表 2 に示す。上級技術者は，初級技術者に比べて，プログラム作成・単体テストにおいて 2 倍の生産性を有する。表 1 の見積工数は，上級技術者の生産性を基に算出している。\n全ての開発工程に対して，上級技術者を 1 人追加して割り当てると，この作業に要する期間は何か月短縮できるか。ここで，開発工程の期間は重複させないものとし，要員全員が 1 か月当たり 1 人月の工数を投入するものとする。',
    choices: ['1', '2', '3', '4'],
    correctIndex: 3,
    explanation: '上級 1 人月/月，初級 0.5 人月/月（プログラム作成・単体テストのみ）。現状の各工程期間: 設計 6÷2＝3 か月，PG 12÷(2+2×0.5)＝4 か月，結合 12÷2＝6 か月，計 13 か月。上級 1 人追加後: 設計 6÷3＝2 か月，PG 12÷(3+2×0.5)＝3 か月，結合 12÷3＝4 か月，計 9 か月。短縮は 13−9＝4 か月。',
    categoryId: 'planning',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔表1 見積工数・表2 要員割当て〕',
      headers: ['開発工程', '見積工数（人月）', '上級技術者（人）', '初級技術者（人）'],
      rows: [
        ['設計', 6, 2, 0],
        ['プログラム作成・単体テスト', 12, 2, 2],
        ['結合テスト', 12, 2, 0],
        ['合計', 30, '', ''],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R1-9',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 9,
    questionText:
      '工程別の生産性が次のとおりのとき，全体の生産性を表す式はどれか。\n〔工程別の生産性〕\n設計工程：Xステップ／人月\n製造工程：Yステップ／人月\n試験工程：Zステップ／人月',
    choices: ['X＋Y＋Z', 'frac{X＋Y＋Z}{3}', 'frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}', 'frac{1}{frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}}'],
    correctIndex: 3,
    explanation: '1 ステップを生産するのに必要な総工数は，設計 1/X，製造 1/Y，試験 1/Z 人月で合計 1/X+1/Y+1/Z 人月。全体生産性（ステップ/人月）はその逆数 1 ÷ (1/X+1/Y+1/Z) となる。これは生産性の調和平均的な合成で，工程直列のスループットを表す。',
    categoryId: 'measurement',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-10',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 10,
    questionText:
      'どのリスクがプロジェクトに対して最も影響が大きいかを判断するのに役立つ定量的リスク分析とモデル化の技法として，感度分析がある。感度分析の結果を示した次の図を何と呼ぶか。',
    choices: ['確率分布', 'デシジョンツリーダイアグラム', 'トルネード図', 'リスクブレークダウンストラクチャ'],
    correctIndex: 2,
    explanation: '感度分析の結果を，影響の大きいリスクから上位に並べた横棒グラフで示し，竜巻型の形状をもつ図をトルネード図と呼ぶ。ア 確率分布は値とその発生確率の分布を示す図，イ デシジョンツリーダイアグラムは意思決定の分岐と期待値を表す図，エ RBS（Risk Breakdown Structure）はリスクをカテゴリ別に階層化した分解構造。',
    categoryId: 'uncertainty',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '感度分析の結果を示す横棒グラフ。リスク1からリスク5までが上から順に並び、マイナスの影響はゼロより左に点模様、プラスの影響はゼロより右に斜線模様で表示される。棒は上ほど長く下ほど短い。',
      caption: '図　感度分析の結果',
      viewBox: '0 0 680 300',
      content: `
        <defs>
          <pattern id="dotsR1q10" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#475569"/>
            <circle cx="6" cy="6" r="1.1" fill="#475569"/>
          </pattern>
          <pattern id="diagR1q10" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="2"/>
          </pattern>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <line x1="145" y1="25" x2="145" y2="212" stroke="#1e293b" stroke-width="1.4"/>
        <line x1="465" y1="25" x2="465" y2="212" stroke="#1e293b" stroke-width="1.4"/>
        <line x1="198" y1="25" x2="198" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="252" y1="25" x2="252" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="305" y1="25" x2="305" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="358" y1="25" x2="358" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="412" y1="25" x2="412" y2="212" stroke="#1e293b" stroke-width="1.2"/>
        <text x="145" y="232" text-anchor="middle" font-size="13" fill="#1e293b">-10,000</text>
        <text x="198" y="232" text-anchor="middle" font-size="13" fill="#1e293b">-5,000</text>
        <text x="252" y="232" text-anchor="middle" font-size="13" fill="#1e293b">0</text>
        <text x="305" y="232" text-anchor="middle" font-size="13" fill="#1e293b">5,000</text>
        <text x="358" y="232" text-anchor="middle" font-size="13" fill="#1e293b">10,000</text>
        <text x="412" y="232" text-anchor="middle" font-size="13" fill="#1e293b">15,000</text>
        <text x="465" y="232" text-anchor="middle" font-size="13" fill="#1e293b">20,000</text>
        <text x="86" y="56" text-anchor="end" font-size="15" fill="#1e293b">リスク1</text>
        <text x="86" y="91" text-anchor="end" font-size="15" fill="#1e293b">リスク2</text>
        <text x="86" y="126" text-anchor="end" font-size="15" fill="#1e293b">リスク3</text>
        <text x="86" y="161" text-anchor="end" font-size="15" fill="#1e293b">リスク4</text>
        <text x="86" y="196" text-anchor="end" font-size="15" fill="#1e293b">リスク5</text>
        <rect x="160" y="37" width="92" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="37" width="202" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="182" y="72" width="70" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="72" width="142" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="198" y="107" width="54" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="107" width="100" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="212" y="142" width="40" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="142" width="64" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="230" y="177" width="22" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <rect x="252" y="177" width="36" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="515" y="74" font-size="14" fill="#1e293b" font-weight="bold">凡例</text>
        <rect x="515" y="90" width="38" height="22" fill="url(#diagR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="565" y="106" font-size="14" fill="#1e293b">プラスの影響</text>
        <rect x="515" y="125" width="38" height="22" fill="url(#dotsR1q10)" stroke="#1e293b" stroke-width="1.2"/>
        <text x="565" y="141" font-size="14" fill="#1e293b">マイナスの影響</text>
      `,
    },
  },
  {
    id: 'om-R1-11',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 11,
    questionText: 'プロジェクトマネジメントで使用する分析技法のうち，傾向分析の説明はどれか。',
    choices: [
      '個々の選択肢とそれぞれを選択した場合に想定されるシナリオの関係を図に表し，それぞれのシナリオにおける期待値を計算して，最善の策を選択する。',
      '個々のリスクが現実のものとなったときの，プロジェクトの目標に与える影響の度合いを調べる。',
      '時間の経過に伴うプロジェクトのパフォーマンスの変動を分析する。',
      '発生した障害とその要因の関係を魚の骨のような図にして分析する。',
    ],
    correctIndex: 2,
    explanation: '傾向分析（trend analysis）は，時間の経過に伴うプロジェクトのパフォーマンス（コスト・スケジュール・品質指標等）の変動を分析する技法。ア はデシジョンツリー分析，イ は感度分析（影響度分析），エ は特性要因図（フィッシュボーン）の説明。',
    categoryId: 'measurement',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-12',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 12,
    questionText: 'PMBOK ガイド第6版によれば，WBS の構成要素であるワーク・パッケージに関する記述のうち，適切なものはどれか。',
    choices: [
      'ワーク・パッケージとその一つ上位の成果物との関係は，1対1である。',
      'ワーク・パッケージは，OBS（組織ブレークダウン・ストラクチャー）のチームに，担当する人員を割り当てたものである。',
      'ワーク・パッケージは，通常，アクティビティに分解される。',
      'ワーク・パッケージは，プロジェクトに関連がある成果物をまとめたものである。',
    ],
    correctIndex: 2,
    explanation: 'PMBOK第6版ではワーク・パッケージは WBS の最下層要素で，スケジュール作成時にさらにアクティビティへ分解される。ア 上位成果物とは多対1（複数の WP が 1 つの上位成果物を構成）の関係，イ OBS は別の分解構造（組織分解）で WP の定義ではない，エ ワーク・パッケージは成果物の「まとめ」ではなく，まとめは上位の WBS 要素。',
    categoryId: 'planning',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-13',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 13,
    questionText:
      '新しく編成するプロジェクトチームの開発要員投入計画に基づいて PC をレンタルで調達する。調達の条件を満たすレンタル費用の最低金額は何千円か。\n〔調達の条件〕\n(1) PC のレンタル契約は月初日から月末日までの 1 か月単位であり，日割りによる精算は行わない。\n(2) PC 1 台のレンタル料金は月額 5 千円である。\n(3) 台数にかかわらず，レンタル PC の受入れ時のセットアップに 2 週間，返却時のデータ消去に 1 週間を要し，この期間はレンタル期間に含める。\n(4) セットアップとデータ消去は，プロジェクトチームの開発要員とは別の要員が行う。\n(5) 開発要員は月初日に着任し，月末日に離任する。\n(6) 開発要員の役割にかかわらず，共通仕様の PC を 1 人が 1 台使用する。\n(7) レンタル期間中に PC を他の開発要員に引き渡す場合，データ消去，セットアップ及び引渡しの期間は不要である。',
    choices: ['350', '470', '480', '500'],
    correctIndex: 1,
    explanation: 'ピーク 11 台のうち継続して使う PC を 4 グループに分け，受入時 2 週間と返却時 1 週間のレンタル計上を加味して最小化する。例: PC1〜2（1 月セットアップ＋2〜11 月稼働＋12 月消去）= 12 か月×2 = 24，PC3〜4（2 月セット＋3〜11 月＋12 月）= 11×2 = 22，PC5〜7（3 月セット＋4〜9 月＋10 月）= 8×3 = 24，PC8〜11（5 月セット＋6〜9 月＋10 月）= 6×4 = 24。合計 94 か月×5 千円 = 470 千円。',
    categoryId: 'project-work',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔開発要員投入計画（単位：人　列は月）〕',
      headers: ['開発要員 ＼ 時期', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      rows: [
        ['設計者', '', 2, 4, 4, 4, 2, 2, 2, 2, 2, 2, ''],
        ['プログラマ', '', '', '', 3, 3, 5, 5, 3, 3, 2, 2, ''],
        ['テスタ', '', '', '', '', '', 4, 4, 4, 6, '', '', ''],
        ['計', 0, 2, 4, 7, 7, 11, 11, 9, 11, 4, 4, 0],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-R1-14',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 14,
    questionText:
      '顧客に提出した進捗状況の報告書に対して，顧客から成果物ごとの進捗状況についての問合せが繰り返しあった。今後このような事態が発生しないようにするためには，プロジェクトのコミュニケーションマネジメント計画書のどの内容を是正する必要があるか。',
    choices: ['情報伝達の手段', '情報を受け取る人又はグループ', '情報を配布するスケジュール', '伝達すべき情報の内容，表現形式及び詳細度'],
    correctIndex: 3,
    explanation: '顧客が成果物ごとの進捗を繰り返し問い合わせるのは，報告書に必要な詳細度・粒度・表現形式が不足しているため。コミュニケーションマネジメント計画書のうちエ（情報の内容・表現形式・詳細度）を見直すのが妥当。ア 手段，イ 受け手，ウ 配布スケジュールはこの問題の本質的原因ではない。',
    categoryId: 'project-work',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-15',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 15,
    questionText: 'PMBOK ガイド第6版によれば，プロジェクト・スコープ・マネジメントにおいて作成するプロジェクト・スコープ記述書の説明のうち，適切なものはどれか。',
    choices: [
      'インプット情報として与えられる WBS やスコープ・ベースラインを用いて，プロジェクトのスコープを記述する。',
      'プロジェクトのスコープに含まれないものは，記述の対象外である。',
      'プロジェクトの成果物と，これらの成果物を生成するために必要な作業について記述する。',
      'プロジェクトの予算見積りやスケジュール策定を実施して，これらをプロジェクトの前提条件として記述する。',
    ],
    correctIndex: 2,
    explanation: 'プロジェクト・スコープ記述書は，プロジェクトの成果物と，それらを生み出すために必要な作業を記述する文書。ア WBS とスコープ・ベースラインは記述書からの派生物（インプットではなくアウトプット側），イ 「除外事項」も記述書の必須項目，エ 予算見積りやスケジュール策定は別プロセスのアウトプット。',
    categoryId: 'planning',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-16',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 16,
    questionText:
      'テストケースを作成する技法のうち，直交表によるテストケースの作成条件を緩和し，2因子間の取り得る値の組合せが同一回数でなくても，1回以上存在すればよいとしてテストケースを設計する技法はどれか。',
    choices: ['All-Pair 法（ペアワイズ法）', '決定表', '原因結果グラフ法', '同値分割法'],
    correctIndex: 0,
    explanation: 'All-Pair 法（ペアワイズ法）は，直交表より緩い「2 因子間の全組合せを 1 回以上カバーすればよい」ルールでテストケースを生成する技法。テストケース数を抑えつつ 2 因子間の相互作用バグを検出できる。イ 決定表は条件と動作のマトリクス，ウ 原因結果グラフは論理結線図，エ 同値分割は入力範囲を等価クラスで代表させる手法。',
    categoryId: 'delivery',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-17',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 17,
    questionText: 'マッシュアップに該当するものはどれか。',
    choices: [
      '既存のプログラムから，そのプログラムの仕様を導き出す。',
      '既存のプログラムを部品化し，それらの部品を組み合わせて，新規プログラムを開発する。',
      'クラスライブラリを利用して，新規プログラムを開発する。',
      '公開されている複数のサービスを利用して，新たなサービスを提供する。',
    ],
    correctIndex: 3,
    explanation: 'マッシュアップは，Web 上で公開されている複数のサービス（API）を組み合わせ，新たな付加価値のサービスを生成する開発手法。ア はリバースエンジニアリング，イ はコンポーネントベース開発（CBD），ウ はクラスライブラリ利用の説明で，いずれもマッシュアップの本質（外部の公開サービスの組合せ統合）には合致しない。',
    categoryId: 'development-approach',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-18',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 18,
    questionText:
      '企業間で，商用目的で締結されたソフトウェアの開発請負契約書に著作権の帰属に関する内容が記載されていない場合の著作権の帰属先として，適切なものはどれか。ここで，ソフトウェアは請負人が開発するものとする。',
    choices: ['請負人，注文者のどちらにも帰属しない。', '請負人と注文者が共有する。', '請負人に帰属する。', '注文者に帰属する。'],
    correctIndex: 2,
    explanation: '著作権法上，著作物の著作権は原則として実際に作成した者（請負人）に帰属する。契約書で「注文者に帰属する」と明示しない限り，請負人が著作権者となるため，注文者が成果物を他用途で利用するには別途許諾や譲渡契約が必要。',
    categoryId: 'governance',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-19',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 19,
    questionText: 'サービスマネジメントにおいて，事業関係マネージャが責任をもつ事項として，適切なものはどれか。',
    choices: [
      'サービスカタログの認可',
      'サービス提供者と個別の供給者との関係の管理',
      '将来の事業上の要求事項の理解及び計画立案',
      '容量・能力及びパフォーマンスのデータの分析及びレビュー',
    ],
    correctIndex: 2,
    explanation: '事業関係マネージャ（BRM: Business Relationship Manager）は，顧客側との関係を維持し，事業の現在および将来の要求を理解して計画立案を行う役割。ア サービスカタログ管理，イ 供給者管理（サプライヤマネージャ）の責務，エ キャパシティマネージャの責務で，いずれも別の役割。',
    categoryId: 'service-management',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-20',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 20,
    questionText:
      'データの追加・変更・削除が，少ないながらも一定の頻度で行われるデータベースがある。このデータベースのフルバックアップを磁気テープに取得する時間間隔を今までの 2 倍にした。このとき，データベースのバックアップ又は復旧に関する記述のうち，適切なものはどれか。',
    choices: [
      '復旧時に行うログ情報の反映の平均処理時間が約 2 倍になる。',
      'フルバックアップ取得 1 回当たりの磁気テープ使用量が約 2 倍になる。',
      'フルバックアップ取得 1 回当たりの磁気テープ使用量が約半分になる。',
      'フルバックアップ取得の平均処理時間が約 2 倍になる。',
    ],
    correctIndex: 0,
    explanation: 'フルバックアップ間隔を 2 倍にすると，前回フルバックアップから現在までの間に蓄積されるログ量が約 2 倍となり，復旧時のログ反映時間も約 2 倍になる。イ・ウ フル取得 1 回あたりの磁気テープ使用量は DB サイズ（少しずつしか変動しない）でほぼ一定，エ フル取得自体の処理時間も DB サイズ依存で取得間隔と無関係。',
    categoryId: 'service-management',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-21',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 21,
    questionText: 'RFI を説明したものはどれか。',
    choices: [
      'サービス提供者と顧客との間で，提供するサービスの内容，品質などに関する保証範囲やペナルティについてあらかじめ契約としてまとめた文書',
      'システム化に当たって，現在の状況において利用可能な技術・製品，ベンダにおける導入実績など実現手段に関する情報提供をベンダに依頼する文書',
      'システムの調達のために，調達側からベンダに技術的要件，サービスレベル要件，契約条件などを提示し，指定した期限内で実現策の提案を依頼する文書',
      '要件定義との整合性を図り，利用者と開発要員及び運用要員の共有物とするために，業務処理の概要，入出力情報の一覧，データフローなどをまとめた文書',
    ],
    correctIndex: 1,
    explanation: 'RFI（Request for Information）は，システム化に当たって利用可能な技術・製品やベンダの導入実績などの情報提供を依頼する文書。発注前の情報収集段階で用いる。ア は SLA（Service Level Agreement），ウ は RFP（Request for Proposal，提案依頼書），エ は業務処理概要や入出力情報をまとめた要件定義書／業務フロー資料。',
    categoryId: 'project-work',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-22',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 22,
    questionText:
      '下請代金支払遅延等防止法の対象となる下請事業者から納品されたプログラムに，下請事業者側の事情を原因とする重大なバグが発見され，プログラムの修正が必要となった。このとき，支払期日を改めて定めようとする場合，下請代金支払遅延等防止法で認められている期間（60 日）の起算日はどれか。',
    choices: ['当初のプログラムの検査が終了した日', '当初のプログラムを下請事業者に返却した日', '修正済プログラムが納品された日', '修正済プログラムの検査が終了した日'],
    correctIndex: 2,
    explanation: '下請代金支払遅延等防止法は「給付の受領日」から 60 日以内の支払を求める。修正の場合は，修正済プログラムが再納品された日（給付を改めて受領した日）が起算日となる。ア・イ 当初プログラム関連は欠陥があり給付として確定していない，エ 検査終了日ではなく受領日が法定の起算点。',
    categoryId: 'governance',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-23',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 23,
    questionText: '技術者倫理の遵守を妨げる要因の一つとして，集団思考というものがある。集団思考の説明として，適切なものはどれか。',
    choices: [
      '自分とは違った視点から事態を見ることができず，客観性に欠けること',
      '組織内の権威に無批判的に服従すること',
      '正しいことが何かは知っているが，それを実行する勇気や決断力に欠けること',
      '強い連帯性をもつチームが批判的思考を欠くことによって，不合理な合意へと達すること',
    ],
    correctIndex: 3,
    explanation: '集団思考（Groupthink, Janis）は，強い連帯感をもつチームが批判的思考や反対意見を抑制し，不合理な合意に達する現象。ア は視野狭窄（バイアスの一種），イ は権威への服従（ミルグラム的服従），ウ は道徳的勇気の欠如で，いずれも集団思考とは別概念。',
    categoryId: 'governance',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-24',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 24,
    questionText: 'NIST が制定した，AES における鍵長の条件はどれか。',
    choices: [
      '128 ビット，192 ビット，256 ビットから選択する。',
      '256 ビット未満で任意に指定する。',
      '暗号化処理単位のブロック長よりも 32 ビット長くする。',
      '暗号化処理単位のブロック長よりも 32 ビット短くする。',
    ],
    correctIndex: 0,
    explanation: 'NIST が 2001 年に制定した AES（FIPS 197）の鍵長は 128 ビット・192 ビット・256 ビットの 3 種類から選択する。ブロック長は 128 ビット固定で，鍵長とは独立した別パラメータ。任意指定（イ）やブロック長依存（ウ・エ）は規格に存在しない。',
    categoryId: 'service-management',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R1-25',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 25,
    questionText: 'DNSSEC の機能はどれか。',
    choices: [
      'DNS キャッシュサーバの設定によって，再帰的な問合せを受け付ける送信元の範囲が最大になるようにする。',
      'DNS サーバから受け取るリソースレコードに対するディジタル署名を利用して，リソースレコードの送信者の正当性とデータの完全性を検証する。',
      'ISP などに設置されたセカンダリ DNS サーバを利用して DNS コンテンツサーバを二重化することによって，名前解決の可用性を高める。',
      '共通鍵暗号技術とハッシュ関数を利用したセキュアな方法によって，DNS 更新要求が許可されているエンドポイントを特定して認証する。',
    ],
    correctIndex: 1,
    explanation: 'DNSSEC は，DNS リソースレコードに認証局相当の鍵によるディジタル署名を付け，リゾルバ側で署名検証することで送信者の正当性とデータの完全性を保証する仕組み。ア はオープンリゾルバ問題に逆行する設定で攻撃悪用される側，ウ はセカンダリ DNS による冗長化（可用性向上）で DNSSEC とは別技術，エ は TSIG（Transaction SIGnature）による DNS 更新認証の説明。',
    categoryId: 'service-management',
    sourceUrl: R1_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-1',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 1,
    questionText:
      'ISO 21500:2012(プロジェクトマネジメントの手引き(英和対訳版))によれば，プロジェクトマネジメントのプロセスグループには，立上げ，計画，実行，コントロール及び終結の五つがある。これらのうち，"変更要求"の申請を契機に相互に作用するプロセスグループの組みはどれか。',
    choices: ['計画，実行', '実行，コントロール', '実行，終結', 'コントロール，終結'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'integration',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-2',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 2,
    questionText: 'プロジェクトマネジメントにおけるプロジェクト憲章の説明として，適切なものはどれか。',
    choices: [
      '組織のビジョン，目標及びビジネスニーズとともに，プロジェクトが提供するプロダクト，サービス，又は所産の特性を明確にした文書',
      'どのようにプロジェクトを実施し，監視し，コントロールするのかを定めるために，プロジェクトを実施するためのベースライン，並びにプロジェクトの実行，コントロール，及び終結する方法を明確にした文書',
      'プロジェクトの最終状態を定義することによって，プロジェクトの目的，成果物，要求事項及び境界を含むプロジェクトスコープを明確にした文書',
      'プロジェクトを正式に承認する文書であり，プロジェクトマネージャを特定して適切な責任と権限を明確にし，ビジネスニーズ，目標，期待される結果などを明確にした文書',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'integration',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-3',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 3,
    questionText:
      'PMBOKガイド第5版の統合変更管理プロセスにおいて，プロジェクトのプロダクト，サービス，所産，構成要素などに対する変更と実施状況を記録・報告したり，要求事項への適合性を検証するためのプロダクト，所産又は構成要素に対する監査を支援したりする活動はどれか。',
    choices: [
      'アーンド・バリュー・マネジメント',
      'コンフィギュレーション・マネジメント',
      'コンフリクト・マネジメント',
      'ポートフォリオマネジメント',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'integration',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-4',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 4,
    questionText:
      'プロジェクトマネジメントで使用する責任分担表(RAM)の一つである，RACIチャートで示す4種類の役割及び責任の組合せのうち，適切なものはどれか。',
    choices: [
      '実行責任，情報提供，説明責任，相談対応',
      '実行責任，情報提供，説明責任，リスク管理',
      '実行責任，情報提供，相談対応，リスク管理',
      '実行責任，説明責任，相談対応，リスク管理',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'team',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-5',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 5,
    questionText:
      'ISO 21500:2012(プロジェクトマネジメントの手引き(英和対訳版))によれば，資源サブジェクトグループのプロセスの目的のうち，資源のコントロールプロセスのものはどれか。',
    choices: [
      'アクティビティリストのアクティビティごとに必要な資源を決定する。',
      '継続的にプロジェクトチームメンバーのパフォーマンス及び相互関係を改善する。',
      'プロジェクト作業の実施に必要な資源を確保し，プロジェクト要求事項を満たせるように資源を配分する。',
      'プロジェクトの完遂に必要な人的資源を得る。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'team',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-6',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 6,
    questionText:
      '図1に示すプロジェクト活動について，作業Cの終了がこの計画から2日遅れたので，このままでは当初に計画した総所要日数で終了できなくなった。\n作業を見直したところ，作業Iは作業Gの全てが完了していなくても開始できることが分かったので，ファストトラッキングを適用して，図2に示すように計画を変更した。\nこの計画変更によって，変更後の総所要日数はどのように変化するか。',
    choices: ['当初計画から4日減少する。', '当初計画から2日減少する。', '当初計画から1日増加する。', '当初計画から2日増加する。'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '図1は作業AからJまでのプロジェクト活動ネットワーク。図2は作業Cが12日となり、作業GをG1とG2に分割し、G2から結合点へダミー作業を追加した変更後ネットワーク。',
      caption: '図1・図2　プロジェクト活動',
      viewBox: '0 0 620 450',
      content: `
        <defs>
          <marker id="amH30q6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(20 18)">
          <text x="285" y="8" text-anchor="middle" font-size="15" font-weight="bold" fill="#1e293b">図1　プロジェクト活動（当初の計画）</text>
          <circle cx="30" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="115" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="190" cy="35" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="190" cy="155" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="275" cy="35" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="275" cy="155" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="365" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="455" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <line x1="44" y1="95" x2="101" y2="95" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="127" y1="86" x2="178" y2="44" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="127" y1="104" x2="178" y2="146" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="190" y1="49" x2="190" y2="141" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="204" y1="35" x2="261" y2="35" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="202" y1="146" x2="263" y2="44" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="204" y1="155" x2="261" y2="155" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="287" y1="45" x2="353" y2="85" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="287" y1="146" x2="353" y2="104" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="379" y1="95" x2="441" y2="95" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <text x="72" y="87" font-size="13" fill="#1e293b">A</text><text x="73" y="111" font-size="13" fill="#1e293b">4</text>
          <text x="150" y="58" font-size="13" fill="#1e293b">B</text><text x="158" y="75" font-size="13" fill="#1e293b">5</text>
          <text x="150" y="132" font-size="13" fill="#1e293b">C</text><text x="150" y="151" font-size="13" fill="#1e293b">10</text>
          <text x="198" y="94" font-size="13" fill="#1e293b">D</text><text x="178" y="103" font-size="13" fill="#1e293b">4</text>
          <text x="232" y="25" font-size="13" fill="#1e293b">E</text><text x="232" y="50" font-size="13" fill="#1e293b">2</text>
          <text x="232" y="83" font-size="13" fill="#1e293b">F</text><text x="222" y="101" font-size="13" fill="#1e293b">4</text>
          <text x="232" y="147" font-size="13" fill="#1e293b">G</text><text x="232" y="171" font-size="13" fill="#1e293b">7</text>
          <text x="320" y="62" font-size="13" fill="#1e293b">H</text><text x="316" y="80" font-size="13" fill="#1e293b">6</text>
          <text x="320" y="130" font-size="13" fill="#1e293b">I</text><text x="317" y="148" font-size="13" fill="#1e293b">4</text>
          <text x="410" y="87" font-size="13" fill="#1e293b">J</text><text x="410" y="111" font-size="13" fill="#1e293b">8</text>
        </g>
        <g transform="translate(20 238)">
          <text x="285" y="8" text-anchor="middle" font-size="15" font-weight="bold" fill="#1e293b">図2　プロジェクト活動（変更後の計画）</text>
          <circle cx="30" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="115" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="190" cy="35" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="190" cy="155" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="275" cy="35" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="275" cy="155" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="365" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="365" cy="155" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="455" cy="95" r="14" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <line x1="44" y1="95" x2="101" y2="95" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="127" y1="86" x2="178" y2="44" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="127" y1="104" x2="178" y2="146" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="190" y1="49" x2="190" y2="141" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="204" y1="35" x2="261" y2="35" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="202" y1="146" x2="263" y2="44" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="204" y1="155" x2="261" y2="155" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="289" y1="155" x2="351" y2="155" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="287" y1="45" x2="353" y2="85" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="287" y1="146" x2="353" y2="104" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <line x1="365" y1="141" x2="365" y2="109" stroke="#334155" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#amH30q6)"/>
          <line x1="379" y1="95" x2="441" y2="95" stroke="#334155" stroke-width="1.6" marker-end="url(#amH30q6)"/>
          <text x="72" y="87" font-size="13" fill="#1e293b">A</text><text x="73" y="111" font-size="13" fill="#1e293b">4</text>
          <text x="150" y="58" font-size="13" fill="#1e293b">B</text><text x="158" y="75" font-size="13" fill="#1e293b">5</text>
          <text x="150" y="132" font-size="13" fill="#1e293b">C</text><text x="150" y="151" font-size="13" fill="#1e293b">12</text>
          <text x="198" y="94" font-size="13" fill="#1e293b">D</text><text x="178" y="103" font-size="13" fill="#1e293b">4</text>
          <text x="232" y="25" font-size="13" fill="#1e293b">E</text><text x="232" y="50" font-size="13" fill="#1e293b">2</text>
          <text x="232" y="83" font-size="13" fill="#1e293b">F</text><text x="222" y="101" font-size="13" fill="#1e293b">4</text>
          <text x="232" y="147" font-size="13" fill="#1e293b">G1</text><text x="232" y="171" font-size="13" fill="#1e293b">2</text>
          <text x="318" y="179" font-size="13" fill="#1e293b">G2</text><text x="355" y="179" font-size="13" fill="#1e293b">5</text>
          <text x="320" y="62" font-size="13" fill="#1e293b">H</text><text x="316" y="80" font-size="13" fill="#1e293b">6</text>
          <text x="333" y="124" font-size="13" fill="#1e293b">I</text><text x="346" y="138" font-size="13" fill="#1e293b">4</text>
          <text x="410" y="87" font-size="13" fill="#1e293b">J</text><text x="410" y="111" font-size="13" fill="#1e293b">8</text>
          <text x="482" y="138" font-size="13" fill="#1e293b">破線: ダミー作業</text>
        </g>
      `,
    },
  },
  {
    id: 'om-H30-7',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 7,
    questionText:
      '過去のプロジェクトの開発実績から構築した作業配分モデルがある。システム要件定義からシステム内部設計までをモデルどおりに228日で完了し，プログラム開発を開始した。現在，200本のプログラムのうち100本のプログラム開発を完了し，残り100本は未着手の状況である。プログラム開発以降もモデルどおりに進捗すると仮定するとき，プロジェクト全体の完了まで，あと何日掛かるか。ここで，各プログラムの開発に掛かる工数及び期間は，全てのプログラムで同一であるものとする。',
    choices: ['140', '150', '161', '172'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔作業配分モデル〕',
      headers: ['', 'システム要件定義', 'システム外部設計', 'システム内部設計', 'プログラム開発', 'システム結合', 'システムテスト'],
      rows: [
        ['工数比', '0.17', '0.21', '0.16', '0.16', '0.11', '0.19'],
        ['期間比', '0.25', '0.21', '0.11', '0.11', '0.11', '0.21'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-H30-8',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 8,
    questionText:
      'COCOMOには，システム開発の工数を見積もる式の一つに\n開発工数＝3.0×(開発規模)^{1.12}\nがある。開発規模と開発生産性(開発規模／開発工数)の関係を表したグラフはどれか。ここで，開発工数の単位は人月，開発規模の単位はキロ行である。',
    choices: ['選択肢アのグラフ', '選択肢イのグラフ', '選択肢ウのグラフ', '選択肢エのグラフ'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '開発規模を横軸、開発生産性を縦軸とする四つの候補グラフ。アは右上がりで次第に緩やか、イは右上がりで次第に急、ウは右下がりで次第に急、エは右下がりで次第に緩やかになる。',
      caption: '図　開発規模と開発生産性の関係の候補',
      viewBox: '0 0 620 360',
      content: `
        <defs>
          <marker id="amH30q8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(35 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ア</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <path d="M 35 112 C 55 60, 105 44, 176 39" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">イ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <path d="M 35 112 C 88 111, 135 88, 176 36" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(35 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ウ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <path d="M 35 36 C 85 38, 142 68, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">エ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH30q8)"/>
          <path d="M 35 36 C 48 74, 88 103, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
      `,
    },
  },
  {
    id: 'om-H30-9',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 9,
    questionText:
      'プロジェクトにどのツールを導入するかを，EMV(期待金額価値)を用いて検討する。デシジョンツリーが次の図のとき，ツールAを導入するEMVがツールBを導入するEMVを上回るのは，Xが幾らよりも大きい場合か。',
    choices: ['120', '150', '200', '240'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'デシジョンツリー。どのツールを導入するかの決定ノードから、ツールAを導入とツールBを導入に分岐する。ツールAは費用120万円、効果が大きい場合60%で効果額X万円、効果が小さい場合40%で90万円。ツールBは費用60万円、効果が大きい場合60%で120万円、効果が小さい場合40%で60万円。',
      caption: '図　ツール導入のデシジョンツリー',
      viewBox: '0 0 660 330',
      content: `
        <defs>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <rect x="28" y="133" width="118" height="52" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="87" y="153" text-anchor="middle" font-size="13" fill="#1e293b">どのツールを</text>
        <text x="87" y="171" text-anchor="middle" font-size="13" fill="#1e293b">導入するか</text>
        <rect x="178" y="154" width="14" height="14" fill="#111827" stroke="#111827" stroke-width="1.2"/>
        <rect x="252" y="70" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="93" text-anchor="middle" font-size="13" fill="#1e293b">ツールAを導入</text>
        <text x="327" y="113" text-anchor="middle" font-size="13" fill="#1e293b">（費用 120万円）</text>
        <rect x="252" y="205" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="228" text-anchor="middle" font-size="13" fill="#1e293b">ツールBを導入</text>
        <text x="327" y="248" text-anchor="middle" font-size="13" fill="#1e293b">（費用 60万円）</text>
        <circle cx="435" cy="99" r="9" fill="#111827"/>
        <circle cx="435" cy="234" r="9" fill="#111827"/>
        <rect x="525" y="34" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="54" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="72" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 X 万円）</text>
        <rect x="525" y="110" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="130" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="148" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 90万円）</text>
        <rect x="525" y="187" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="207" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="225" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 120万円）</text>
        <rect x="525" y="263" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="283" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="301" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 60万円）</text>
        <line x1="146" y1="159" x2="178" y2="161" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="402" y1="99" x2="426" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="99" x2="488" y2="58" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="58" x2="525" y2="58" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="48" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="99" x2="488" y2="135" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="135" x2="525" y2="135" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="130" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <line x1="402" y1="234" x2="426" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="234" x2="488" y2="212" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="212" x2="525" y2="212" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="202" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="234" x2="488" y2="288" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="288" x2="525" y2="288" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="278" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <text x="42" y="242" font-size="13" fill="#1e293b">〔凡例〕</text>
        <rect x="43" y="254" width="12" height="12" fill="#111827"/>
        <text x="63" y="266" font-size="13" fill="#1e293b">決定ノード</text>
        <circle cx="49" cy="285" r="7" fill="#111827"/>
        <text x="63" y="289" font-size="13" fill="#1e293b">機会ノード</text>
      `,
    },
  },
  {
    id: 'om-H30-10',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 10,
    questionText:
      'PMBOK第5版のプロジェクト・リスク・マネジメントにおけるリスク対応戦略に関する記述のうち，適切なものはどれか。',
    choices: [
      '強化は，マイナスのリスクに対して使用される戦略である。',
      '共有は，プラスのリスクとマイナスのリスクのどちらにも使用される戦略である。',
      '受容は，プラスのリスクとマイナスのリスクのどちらにも使用される戦略である。',
      '転嫁は，プラスのリスクに対して使用される戦略である。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-11',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 11,
    questionText:
      'PMBOK第5版によれば，プロジェクト・リスク・マネジメントでは，定性的リスク分析でリスクの優先順位を査定し，定量的リスク分析でリスクがプロジェクト目標全体に与える影響を数値的に分析する。定性的リスク分析で使用されるものはどれか。',
    choices: ['感度分析', '期待金額価値分析', 'デシジョン・ツリー', '発生確率・影響度マトリックス'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-12',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 12,
    questionText:
      'システム開発のプロジェクトにおいて，リスク識別を効率よく行うための手段として，"JIS X 25010:2013(システム及びソフトウェア製品の品質要求及び評価(SQuaRE)－システム及びソフトウェア品質モデル)"が規定する利用時の品質特性を用いてソフトウェアの品質に関するリスクを分類することにした。"満足性"に対するリスクとして分類される，リスクとその評価の事例はどれか。',
    choices: [
      'システムが稼働する環境に依存した機能を使用しているので，現在の稼働環境とは異なる環境のプラットフォームに展開できず，柔軟でないと評価される。',
      '操作に習熟していない利用者が，誤った使い方をしたときの対処方法が分からずに困惑し，快適でないと評価される。',
      'ソフトウェアパッケージを導入した際に，消耗品が多く必要となって，コストが膨らみ，効率的でないと評価される。',
      '導入したソフトウェアパッケージの目新しさだけが目立ち，業務の一部を手作業で補完しなければならず，有効でないと評価される。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-13',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 13,
    questionText:
      'プロジェクトで発生している品質問題を解決するに当たって，図を作成して原因の傾向を分析したところ，発生した問題の80%以上が少数の原因で占められていることが判明した。作成した図はどれか。',
    choices: ['管理図', '散布図', '特性要因図', 'パレート図'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-14',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 14,
    questionText:
      'PMBOKガイド第5版によれば，プロジェクト品質マネジメントは，品質マネジメント計画，品質保証，品質コントロールの三つのプロセスで構成されている。品質マネジメント計画プロセスのアウトプットであって，品質保証プロセス及び品質コントロール・プロセスのインプットになるものはどれか。',
    choices: ['検証済み成果物', '妥当性確認済み変更', '品質尺度', '変更要求'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-15',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 15,
    questionText: 'PMBOKガイド第5版によれば，プロジェクト調達マネジメントにおける調達作業範囲記述書に記載すべき項目はどれか。',
    choices: ['プロジェクト完了後の調達品の運用サポートの内容', 'プロジェクト全体のWBS', 'プロジェクト全体の予算', 'プロジェクトのリスク'],
    correctIndex: 0,
    explanation: '',
    categoryId: 'project-work',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-16',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 16,
    questionText:
      '共通フレーム2013におけるシステム開発プロセスのアクティビティであるシステム適格性確認テストの説明として，最も適切なものはどれか。',
    choices: [
      'システムが運用環境に適合し，利用者の用途を満足しているかどうかを，実運用環境又は擬似運用環境において評価する。',
      'システムが業務運用時に使いやすいかどうかを定期的に評価する。',
      'システムの投資効果及び業務効果の実績を評価する。',
      'システム要件について実装の適合性をテストし，システムの納入準備ができているかどうかを評価する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-17',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 17,
    questionText: 'エクストリームプログラミング(XP：eXtreme Programming)における"テスト駆動開発"の説明はどれか。',
    choices: [
      '最初のテストで，なるべく多くのバグを摘出する。',
      'テストケースの改善を繰り返す。',
      'テストでのカバレージを高めることを重視する。',
      'プログラムを書く前にテストケースを作成する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-18',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 18,
    questionText: 'リーンソフトウェア開発の説明として，適切なものはどれか。',
    choices: [
      '経験的プロセス制御の理論を基本としており，スプリントと呼ばれる周期で"検査と適応"を繰り返しながら開発を進める。',
      '製造業の現場から生まれた考え方をアジャイル開発のプラクティスに適用したものであり，"ムダをなくす"，"品質を作り込む"など，七つの原則を重視しながら開発を進める。',
      '比較的小規模な開発に適した，プログラミングに焦点を当てた開発アプローチであり，"コミュニケーション"など五つの価値を定義し，それらを高めるように開発を進める。',
      '利用者から見て価値があるまとまりを一つの機能単位とし，その単位ごとに，設計や構築などの五つのプロセスを繰り返しながら開発を進める。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-19',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 19,
    questionText: 'ITIL 2011 editionによれば，インシデントに対する一連の活動のうち，イベント管理プロセスが分担する活動はどれか。',
    choices: [
      'インシデントの発生後に，その原因などをエラーレコードとして記録する。',
      'インシデントの発生後に，問題の根本原因を分析して記録する。',
      'インシデントの発生時に，ITサービスを迅速に復旧するための対策を講じる。',
      'インシデントの発生を検知して，関連するプロセスに通知する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-20',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 20,
    questionText:
      'JIS Q 20000-1:2012(サービスマネジメントシステム要求事項)の"サービスマネジメントシステムの監視及びレビュー"の要求事項のうち，適切なものはどれか。',
    choices: [
      '監査員は，自らの仕事を監査してはならない。',
      '監査の基準は，文書化された手順の中に定義してはならない。',
      '特定された不適合，懸念事項は，利害関係者であっても開示してはならない。',
      'レビューの間隔は，あらかじめ定めてはならない。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-21',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 21,
    questionText:
      'システム開発を請負契約でベンダに委託する場合，ベンダに起因する，機密漏えいなどの情報セキュリティ事故を防止するために，委託する側がとるべき手段として，適切なものはどれか。',
    choices: [
      '委託業務に関する情報セキュリティレベルを取り決め，情報セキュリティ対策実施状況の定期的な報告を義務付け，適時に監査を実施する。',
      '情報セキュリティに関するルールの違反者個人に対する高額なペナルティを取り決める。',
      'ベンダの業務手順，体制図を提示させ，委託する側でプロジェクト全体の情報セキュリティ対策手順，詳細な体制図を作成して指揮命令する。',
      'ベンダの選定条件を厳しく設定し，選定後はベンダに情報セキュリティ対策の管理を一任する。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'project-work',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-22',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 22,
    questionText: '労働基準法及び労働契約法が定める，就業規則に係る使用者の義務の記述のうち，適切なものはどれか。',
    choices: [
      '就業規則の基準に達しない労働条件を労働契約で定める場合には，使用者が労働者から個別に合意を得ることが義務付けられている。',
      '使用者は，就業規則を労働者に周知するために，見やすい場所に掲示したり，書面を交付したりするなどの措置を行うことが義務付けられている。',
      '使用する労働者の数が常時10名以上の使用者は，就業規則を作成する義務はあるが，就業規則を行政官庁へ届け出ることは義務付けられていない。',
      '労働組合がない事業場において，使用者が就業規則を作成する場合，労働者の意見を聴くことは義務付けられていない。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-23',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 23,
    questionText: '基準値を超える鉛，水銀などの有害物質を電気・電子機器に使用することを制限するために，欧州連合が制定し，施行しているものはどれか。',
    choices: ['ISO 14001', 'RoHS 指令', 'WEEE 指令', 'グリーン購入法'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-24',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 24,
    questionText: '公開鍵暗号方式を使った暗号通信をn人が相互に行う場合，全部で何個の異なる鍵が必要になるか。ここで，一組の公開鍵と秘密鍵は2個と数える。',
    choices: ['n＋1', '2n', 'frac{n(n－1)}{2}', 'log_{2} n'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H30-25',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 25,
    questionText: 'テンペスト攻撃の説明とその対策として，適切なものはどれか。',
    choices: [
      '通信路の途中でパケットの内容を改ざんする攻撃であり，その対策としては，ディジタル署名を利用して改ざんを検知する。',
      'ディスプレイなどから放射される電磁波を傍受し，表示内容を解析する攻撃であり，その対策としては，電磁波を遮断する。',
      'マクロウイルスを使う攻撃であり，その対策としては，ウイルス対策ソフトを導入し，最新のウイルス定義ファイルを適用する。',
      '無線 LAN の信号を傍受し，通信内容を解析する攻撃であり，その対策としては，通信パケットを暗号化する。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H30_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-1',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 1,
    questionText: 'プロジェクトのスケジュールを管理するときに使用する “クリティカルチェーン法” の実施例はどれか。',
    choices: [
      'クリティカルパス上の作業に生産性を向上させるための開発ツールを導入する。',
      'クリティカルパス上の作業に要員を追加投入する。',
      'クリティカルパス上の先行作業が終了する前に後続作業に着手し，並行して実施する。',
      'クリティカルパスを守るために，合流バッファとプロジェクトバッファを設ける。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-2',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 2,
    questionText: 'PMBOK ガイド 第 5 版によれば，組織のプロセス資産に分類されるものはどれか。',
    choices: ['課題と欠陥のマネジメントの手順', 'ステークホルダのリスク許容度', '組織のインフラストラクチャ', '組織の文化，体制，ガバナンス'],
    correctIndex: 0,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-3',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 3,
    questionText: 'PMBOK ガイド 第 5 版によれば，プロジェクトへの変更要求のうち，是正処置はどれか。',
    choices: [
      'あるサブシステムの成果物の品質が，要求されるレベルを満たさないことが予想されるので，設計ドキュメントのレビューに有識者を参加させる。',
      'あるタスクが，プロジェクトマネジメント計画書に記載したスケジュールから遅れたので，遅れを解消させるために要員を追加する。',
      '受入れテストにおいて，あるサブシステムのプログラムが要求仕様を満たしていないことが判明したので，プログラムを修正する。',
      '法規制が改定されたので，新しい法規制に対応するための活動を WBS に追加する。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'integration',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-4',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 4,
    questionText: 'PMBOK ガイド 第 5 版によれば，プロジェクトスコープマネジメントにおいて，WBS の作成に用いるローリングウェーブ計画法の説明はどれか。',
    choices: [
      'WBS を補完するために，WBS 要素ごとに詳細な作業の内容などを記述する。',
      '過去に実施したプロジェクトの WBS をテンプレートとして，新たな WBS を作成する。',
      '将来実施予定の作業については，上位レベルの WBS にとどめておき，詳細が明確になってから，要素分解して詳細な WBS を作成する。',
      'プロジェクトの作業をより階層的に分解して，WBS の最下位レベルの作業内容や要素成果物を定義する。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-5',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 5,
    questionText: 'WBS の構成要素であるワークパッケージに関する記述のうち，適切なものはどれか。',
    choices: [
      'ワークパッケージは，OBS（組織ブレークダウンストラクチャ）のチームに，担当する人員を割り当てたものである。',
      'ワークパッケージは，関連がある成果物をまとめたものである。',
      'ワークパッケージは，通常，アクティビティに分解される。',
      'ワークパッケージは，一つ上位の成果物と 1 対 1 に対応する。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-6',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 6,
    questionText: '表は RACI チャートを用いた，あるプロジェクトの責任分担マトリックスである。設計アクティビティにおいて，説明責任をもつ要員は誰か。',
    choices: ['阿部', '伊藤と佐藤', '鈴木と田中', '野村'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'team',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '表　RACI チャートによる責任分担マトリックス',
      headers: ['アクティビティ', '阿部', '伊藤', '佐藤', '鈴木', '田中', '野村'],
      rows: [
        ['要件定義', 'C', 'A', 'I', 'I', 'I', 'R'],
        ['設計', 'R', 'I', 'I', 'C', 'C', 'A'],
        ['開発', 'A', '－', 'R', '－', 'R', 'I'],
        ['テスト', 'I', 'I', 'C', 'R', 'A', 'C'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-H29-7',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 7,
    questionText: 'チームの発展段階を五つに区分したタックマンモデルによれば，メンバの異なる考え方や価値観が明確になり，メンバがそれぞれの意見を主張し合う段階はどれか。',
    choices: ['安定期 (Norming)', '遂行期 (Performing)', '成立期 (Forming)', '動乱期 (Storming)'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'team',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-8',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 8,
    questionText: '工程管理図表の特徴に関する記述のうち，ガントチャートのものはどれか。',
    choices: [
      '計画と実績の時間的推移を表現するのに適し，進み具合及びその傾向がよく分かり，プロジェクト全体の費用と進捗の管理に利用される。',
      '作業の順序や作業相互の関係を表現したり，重要作業を把握したりするのに適しており，プロジェクトの作業計画などに利用される。',
      '作業の相互関係の把握には適さないが，作業計画に対する実績を把握するのに適しており，個人やグループの進捗管理に利用される。',
      '進捗管理上のマイルストーンを把握するのに適しており，プロジェクト全体の進捗管理などに利用される。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-9',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 9,
    questionText: 'プロジェクトマネジメントにおけるクラッシングの例として，適切なものはどれか。',
    choices: [
      'クリティカルパス上の遅れているアクティビティに人員を増強した。',
      'コストを削減するために，これまで承認されていた残業を禁止した。',
      '仕様の確定が大幅に遅れたので，プロジェクトの完了予定日を延期した。',
      '設計が終わったモジュールから順に並行してプログラム開発を実施するように，スケジュールを変更した。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-10',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 10,
    questionText:
      '四つのアクティビティ A～D によって実行する開発プロジェクトがある。図は，各アクティビティの依存関係を PDM（プレシデンスダイアグラム法）によって表している。各アクティビティの実行に当たっては，専門チームの支援が必要である。条件に従ってアクティビティを実行するとき，開発プロジェクトの最少の所要日数は何日か。\n〔アクティビティの依存関係〕\n〔条件〕\n・各アクティビティの所要日数及び実行に当たっての専門チームの支援期間は，次のとおりである。\n・専門チームは，同時に複数のアクティビティの支援をすることはできない。\n・専門チームは，各アクティビティを連続した日程で支援する。\n・専門チーム以外の資源に各アクティビティ間の競合はない。',
    choices: ['15', '16', '17', '18'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel: 'PDM図。開始からAへ進み、AからFSでBへ進み終了へ向かう。開始からCとDにも分岐し、それぞれ終了前の合流点へ向かう。下部にAからDの所要日数と専門チーム支援期間の表がある。',
      caption: '〔アクティビティの依存関係と専門チームの支援期間〕',
      viewBox: '0 0 560 372',
      content: `
        <defs>
          <marker id="amH29q10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <circle cx="58" cy="75" r="30" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="58" y="80" text-anchor="middle" font-size="14" fill="#1e293b">開始</text>
        <rect x="125" y="50" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="76" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">A</text>
        <rect x="285" y="50" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="332" y="76" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">B</text>
        <rect x="125" y="120" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="146" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">C</text>
        <rect x="125" y="190" width="95" height="42" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="172" y="216" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="bold">D</text>
        <circle cx="485" cy="75" r="30" fill="white" stroke="#1e293b" stroke-width="1.5"/>
        <text x="485" y="80" text-anchor="middle" font-size="14" fill="#1e293b">終了</text>
        <line x1="88" y1="75" x2="123" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <line x1="220" y1="75" x2="283" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <text x="252" y="64" text-anchor="middle" font-size="12" fill="#475569" font-weight="bold">FS</text>
        <line x1="380" y1="75" x2="453" y2="75" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <path d="M 88 78 L 95 78 L 95 141 L 123 141" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <path d="M 88 82 L 95 82 L 95 211 L 123 211" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <path d="M 220 141 L 430 141 L 430 75 L 453 75" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <path d="M 220 211 L 430 211 L 430 75 L 453 75" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#amH29q10)"/>
        <rect x="35" y="255" width="490" height="88" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="35" y1="277" x2="525" y2="277" stroke="#1e293b" stroke-width="1"/>
        <line x1="35" y1="299" x2="525" y2="299" stroke="#1e293b" stroke-width="1"/>
        <line x1="35" y1="321" x2="525" y2="321" stroke="#1e293b" stroke-width="1"/>
        <line x1="145" y1="255" x2="145" y2="343" stroke="#1e293b" stroke-width="1"/>
        <line x1="250" y1="255" x2="250" y2="343" stroke="#1e293b" stroke-width="1"/>
        <line x1="525" y1="255" x2="525" y2="343" stroke="#1e293b" stroke-width="1"/>
        <text x="90" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">アクティビティ名</text>
        <text x="197" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">所要日数（日）</text>
        <text x="388" y="272" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">専門チームの支援期間</text>
        <text x="90" y="294" text-anchor="middle" font-size="12" fill="#1e293b">A</text>
        <text x="197" y="294" text-anchor="middle" font-size="12" fill="#1e293b">10</text>
        <text x="388" y="294" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の4日間</text>
        <text x="90" y="316" text-anchor="middle" font-size="12" fill="#1e293b">B</text>
        <text x="197" y="316" text-anchor="middle" font-size="12" fill="#1e293b">5</text>
        <text x="388" y="316" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の2日間</text>
        <text x="90" y="338" text-anchor="middle" font-size="12" fill="#1e293b">C</text>
        <text x="197" y="338" text-anchor="middle" font-size="12" fill="#1e293b">10</text>
        <text x="388" y="338" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の最初の4日間</text>
        <rect x="35" y="343" width="490" height="22" fill="white" stroke="#1e293b" stroke-width="1.2"/>
        <line x1="145" y1="343" x2="145" y2="365" stroke="#1e293b" stroke-width="1"/>
        <line x1="250" y1="343" x2="250" y2="365" stroke="#1e293b" stroke-width="1"/>
        <text x="90" y="358" text-anchor="middle" font-size="12" fill="#1e293b">D</text>
        <text x="197" y="358" text-anchor="middle" font-size="12" fill="#1e293b">4</text>
        <text x="388" y="358" text-anchor="middle" font-size="11" fill="#1e293b">実行する期間の全て</text>
      `,
    },
  },
  {
    id: 'om-H29-11',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 11,
    questionText: 'アジャイル型開発プロジェクトの管理に用いるベロシティの説明はどれか。',
    choices: [
      '開発規模を見積もる際の規模の単位であり，ユーザーストーリー同士を比較し，相対的な量で表すものである。',
      '完了待ちのプロダクト要求事項と成果物を組み合わせたものをビジネスにおける優先度順に並べたものである。',
      '定められた期間で完了した作業量と残作業量をグラフにして進捗状況を表すものである。',
      'チームの生産性の測定単位であり，定められた期間で製造，妥当性確認，及び受入れが行われた成果物の量を示すものである。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-12',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 12,
    questionText: 'EVM を採用しているプロジェクトにおける，ある時点の CPI が 1.0 を下回っていた場合の対処として，適切なものはどれか。',
    choices: [
      '実コストが予算コストを下回っているので，CPI に基づいて完成時総コストを下方修正する。',
      '実コストを CPI で割った値を使って，完成時総コストを見積もり，予想値とする。',
      '超過コストの原因を明確にし，CPI の改善策に取り組むとともに，CPI の値を監視する。',
      'プロジェクトの完成時には CPI が 1.0 となることを利用して，CPI が 1.0 となる完成時期を予測し，スケジュールを見直す。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-13',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 13,
    questionText:
      'ファンクションポイント法の一つである IFPUG 法では，機能を機能種別に従ってデータファンクションとトランザクションファンクションとに分類する。機能種別を適切に分類したものはどれか。\n〔機能種別〕\nEI：外部入力\nEO：外部出力\nILF：内部論理ファイル\nEIF：外部インタフェースファイル\nEQ：外部照会',
    choices: ['選択肢アの分類', '選択肢イの分類', '選択肢ウの分類', '選択肢エの分類'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '機能種別の分類候補',
      headers: ['', 'データファンクション', 'トランザクションファンクション'],
      rows: [
        ['ア', 'EI，EO，EQ', 'EIF，ILF'],
        ['イ', 'EIF，EQ，ILF', 'EI，EO'],
        ['ウ', 'EIF，ILF', 'EI，EO，EQ'],
        ['エ', 'ILF', 'EI，EIF，EO，EQ'],
      ],
      rowHeaderFirstCol: true,
    },
  },
  {
    id: 'om-H29-14',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 14,
    questionText:
      '工程別の生産性が次のとおりのとき，全体の生産性を表す式はどれか。\n〔工程別の生産性〕\n設計工程：Xステップ／人月\n製造工程：Yステップ／人月\n試験工程：Zステップ／人月',
    choices: ['X＋Y＋Z', 'frac{X＋Y＋Z}{3}', 'frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}', 'frac{1}{frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}}'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-15',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 15,
    questionText:
      '新しく編成するプロジェクトチームの開発要員投入計画に基づいて PC をレンタルで調達する。調達の条件を満たすレンタル費用の最低金額は何千円か。\n〔開発要員投入計画〕\n〔調達の条件〕\n(1) PC のレンタル契約は月初日から月末日までの 1 か月単位であり，日割りによる精算は行わない。\n(2) PC 1 台のレンタル料金は月額 5 千円である。\n(3) 台数にかかわらず，レンタル PC の受入れ時のセットアップに 2 週間，返却時のデータ消去に 1 週間を要し，この期間はレンタル期間に含める。\n(4) セットアップとデータ消去は，プロジェクトチームの開発要員とは別の要員が行う。\n(5) 開発要員は月初日に着任し，月末日に離任する。\n(6) 開発要員の役割にかかわらず，共通仕様の PC を 1 人が 1 台使用する。\n(7) レンタル期間中に PC を他の開発要員に引き渡す場合，データ消去，セットアップ及び引渡しの期間は不要である。',
    choices: ['350', '470', '480', '500'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'project-work',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '〔開発要員投入計画（単位：人　列は月）〕',
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
    id: 'om-H29-16',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 16,
    questionText:
      '製品を出荷前に全数検査することによって，出荷後の故障品数を減少させ，全体の費用を低減させたい。次の条件で全数検査を行ったときに低減させられる費用は何万円か。ここで，検査時に故障が発見された製品は修理して出荷するものとする。\n〔条件〕\n(1) 製造する個数：500 個\n(2) 全数検査を実施しなかった場合の，出荷個数に対する故障品の発生率：3%\n(3) 全数検査における，製造個数に対する故障品の発見率：2%\n(4) 全数検査を実施した場合の，出荷個数に対する故障品の発生率：1%\n(5) 検査費用：1 万円／個\n(6) 出荷前の故障品の修理費用：50 万円／個\n(7) 出荷後の故障品の修理費用：200 万円／個',
    choices: ['1,000', '1,500', '2,000', '2,250'],
    correctIndex: 0,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-17',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 17,
    questionText: 'マッシュアップを利用して Web コンテンツを表示している例として，最も適切なものはどれか。',
    choices: [
      'Web ブラウザにプラグインを組み込み，動画やアニメーションを表示する。',
      '地図上のカーソル移動に伴い，Web ページを切り替えずにスクロール表示する。',
      '鉄道経路の探索結果上に，各鉄道会社の Web ページへのリンクを表示する。',
      '店舗案内の Web ページ上に，他のサイトが提供する地図検索機能を利用して出力された情報を表示する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-18',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 18,
    questionText: 'ソフトウェアのリファクタリングの説明はどれか。',
    choices: [
      '外部から見た振る舞いを変更せずに保守性の高いプログラムに書き直す。',
      'ソースコードから設計書を作成する。',
      'ソフトウェア部品を組み合わせてシステムを開発する。',
      'プログラムの修正が他の部分に影響していないかどうかをテストする。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-19',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 19,
    questionText:
      'データの追加・変更・削除が，少ないながらも一定の頻度で行われるデータベースがある。このデータベースのフルバックアップを磁気テープに取得する時間間隔を今までの 2 倍にした。このとき，データベースのバックアップ又は復旧に関する記述のうち，適切なものはどれか。',
    choices: [
      'フルバックアップ 1 回当たりの磁気テープ使用量が約 2 倍になる。',
      'フルバックアップ 1 回当たりの磁気テープ使用量が約半分になる。',
      'フルバックアップ取得の平均処理時間が約 2 倍になる。',
      'ログ情報を用いて復旧するときの平均処理時間が平均して約 2 倍になる。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-20',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 20,
    questionText: 'データ管理者 (DA) とデータベース管理者 (DBA) を別々に任命した場合の DA の役割として，適切なものはどれか。',
    choices: [
      '業務データ量の増加傾向を把握し，ディスク装置の増設などを計画して実施する。',
      'システム開発の設計工程では，主に論理データベース設計を行い，データ項目を管理して標準化する。',
      'システム開発のテスト工程では，主にパフォーマンスチューニングを担当する。',
      'システム障害が発生した場合には，データの復旧や整合性のチェックなどを行う。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-21',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 21,
    questionText:
      'ベンダ X 社に対して，図に示すように要件定義フェーズから運用テストフェーズまでを委託したい。X 社との契約に当たって，“情報システム・モデル取引・契約書” に照らし，各フェーズの契約形態を整理した。a～d の契約形態のうち，準委任型が適切であるとされるものはどれか。',
    choices: ['a，b', 'a，d', 'b，c', 'b，d'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'project-work',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'table',
      caption: '図　フェーズ別の契約形態',
      headers: ['要件定義', 'システム外部設計', 'システム内部設計', 'ソフトウェア設計，プログラミング，ソフトウェアテスト', 'システム結合', 'システムテスト', '運用テスト'],
      rows: [['a', '準委任型又は請負型', 'b', '請負型', 'c', '準委任型又は請負型', 'd']],
      rowHeaderFirstCol: false,
    },
  },
  {
    id: 'om-H29-22',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 22,
    questionText: '労働基準法で定める制度のうち，36 協定がよりどころとしている制度はどれか。',
    choices: [
      '業務遂行の手段，時間配分の決定などを大幅に労働者に委ねる業務に適用され，労働時間の算定は，労使協定で定めた労働時間の労働とみなす制度',
      '業務の繁閑に応じた労働時間の配分などを行い，労使協定によって 1 か月以内の期間を平均して 1 週の法定労働時間を超えないようにする制度',
      '時間外労働，休日労働についての労使協定を書面で締結し，行政官庁に届け出ることによって，法定労働時間外の労働が認められる制度',
      '労使協定によって 1 か月以内の一定期間の総労働時間を定め，1 日の固定勤務時間以外では，労働者に始業・終業時刻の決定を委ねる制度',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-23',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 23,
    questionText: '派遣労働者の受入れに関する記述のうち，適切なものはどれか。',
    choices: [
      '派遣先責任者は，派遣先管理台帳の管理，派遣労働者から申出を受けた苦情への対応，派遣元事業主との連絡調整，派遣労働者の人事記録と考課などの任務を行わなければならない。',
      '派遣先責任者は，派遣就業場所が複数ある場合でも，一人に絞って選任されなければならない。',
      '派遣先責任者は，派遣労働者が従事する業務全般を統括する管理職位の者の内から選任されなければならない。',
      '派遣先責任者は，派遣労働者に直接指揮命令する者に対して，労働者派遣法などの関連法規の規定，労働者派遣契約の内容，派遣元事業主からの通知などを周知しなければならない。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-24',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 24,
    questionText: 'CSIRT の説明として，適切なものはどれか。',
    choices: [
      'JIS Q 15001:2006 に適合して，個人情報について適切な保護措置を講じる体制を整備・運用している事業者などを認定する組織',
      '企業や行政機関などに設置され，コンピュータセキュリティインシデントに対応する活動を行う組織',
      '電子政府のセキュリティを確保するために，安全性及び実装性に優れると判断される暗号技術を選出する組織',
      '内閣官房に設置され，サイバーセキュリティ政策に関する総合調整を行いつつ，“世界を率先する” “強靭で” “活力ある” サイバー空間の構築に向けた活動を行う組織',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H29-25',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 25,
    questionText: 'ペネトレーションテストに該当するものはどれか。',
    choices: [
      '暗号化で使用している暗号方式と鍵長が，設計仕様と一致することを確認する。',
      '対象プログラムの入力に対する出力結果が，出力仕様と一致することを確認する。',
      'ファイアウォールが単位時間当たりに処理できるセッション数を確認する。',
      'ファイアウォールや公開サーバに侵入できないかどうかを確認する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H29_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-1',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 1,
    questionText:
      '情報システムの企画，開発，運用，保守作業に関わる国際標準の一つである SPA(Software Process Assessment) の説明として，適切なものはどれか。',
    choices: [
      'ソフトウェアプロセスがどの程度の能力水準にあり，継続的に改善されているかを判定することを目的としている。',
      'ソフトウェアライフサイクルを合意プロセス，テクニカルプロセス，運用・サービスプロセスなどのプロセス群に分け，作業内容を定めている。',
      '品質保証に関する要求項目を体系的に規定した国際規格の一部である。',
      'プロジェクトマネジメントの知識体系と応用のためのガイドである。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-2',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 2,
    questionText:
      '【注記】IPA公式では，この問2は問題誤りにより受験者全員正解の措置済み。本アプリでは学習用に，選択肢イが一意に正解となるように問題文を改題している。\nPMBOK におけるコスト見積りプロセスでインプットとして使用し，品質計画プロセスではプロジェクトマネジメント計画書の一部として参照されるものはどれか。',
    choices: ['人的資源計画書', 'スコープベースライン', 'ステークホルダ登録簿', '品質尺度'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-3',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 3,
    questionText: 'PMBOK によれば，多くのプロジェクトのライフサイクルに共通する特性はどれか。',
    choices: [
      'プロジェクト完成時のコストに対してステークホルダが及ぼす影響の度合いは，プロジェクトの終盤が最も高い。',
      'プロジェクトの不確実性の度合いは，プロジェクトの開始時が最も高い。',
      'プロジェクト要員の必要人数は，プロジェクトの終了時が最も多い。',
      '変更やエラー訂正に掛かるコストは，プロジェクトの初期段階が最も高い。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-4',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 4,
    questionText: 'プロジェクトの開始を公式に承認する文書の作成を依頼された者の行動として，適切なものはどれか。',
    choices: [
      '契約書を作成し，プロジェクトマネージャに文書の承認を求めた。',
      'プロジェクト憲章を作成し，プロジェクトスポンサに文書の承認を求めた。',
      'プロジェクト作業範囲記述書を作成し，プロジェクトマネージャに文書の承認を求めた。',
      'プロジェクトマネジメント計画書を作成し，プロジェクトスポンサに文書の承認を求めた。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'integration',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-5',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 5,
    questionText: 'プロジェクトマネジメントにおけるスコープコントロールの活動はどれか。',
    choices: [
      '開発ツールの新機能の教育が必要と分かったので，開発ツールの教育期間を2日間延長した。',
      '要件定義完了時に再見積りをしたところ，当初見積もった開発費用を超過することが判明したので，追加予算を確保した。',
      '連携する計画であった外部システムのリリースが延期になったので，この外部システムとの連携に関わる作業は別プロジェクトで実施することにした。',
      '割り当てたテスト担当者が期待した成果を出せなかったので，経験豊富なテスト担当者に交代した。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-6',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 6,
    questionText:
      'プロジェクトマネジメントで使用する責任分担表（RAM）の一つである，RACIチャートで示す4種類の役割及び責任の組合せのうち，適切なものはどれか。',
    choices: [
      '実行責任，情報提供，説明責任，相談対応',
      '実行責任，情報提供，説明責任，リスク管理',
      '実行責任，情報提供，相談対応，リスク管理',
      '実行責任，説明責任，相談対応，リスク管理',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'team',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-7',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 7,
    questionText: 'PMBOK によれば，アクティビティの所要期間を見積もる際の資源カレンダーの用途として，適切なものはどれか。',
    choices: [
      'アクティビティが必要とする資源の種類と量を特定する。',
      'アクティビティが必要とする資源を区分と類型別に階層表示し，必要な資源を明確にする。',
      'アクティビティが必要とする資源を利用できる作業日及びシフトを取得する。',
      '過去のプロジェクトにおいて類似のアクティビティが必要とした資源の種類と量を取得する。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-8',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 8,
    questionText:
      'プロジェクトの進捗管理を EVM（Earned Value Management）で行っている。コストが超過せず，納期にも遅れないと予想されるプロジェクトの状況を表しているのはどれか。ここで，それぞれのプロジェクトの今後の開発生産性は現在までと変わらないものとする。',
    choices: ['選択肢アのグラフ', '選択肢イのグラフ', '選択肢ウのグラフ', '選択肢エのグラフ'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'EVMの四つの候補グラフ。アは現在時点で実コストがアーンドバリューより大きく、イは実コストとプランドバリューがアーンドバリューより大きい。ウはアーンドバリューがプランドバリューと実コストの両方より大きい。エはプランドバリューがアーンドバリューより大きく、アーンドバリューが実コストより大きい。',
      caption: '図　EVM によるプロジェクト状況の候補',
      viewBox: '0 0 760 520',
      content: `
        <defs>
          <marker id="amH28q8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(36 28)">
          <text x="0" y="0" font-size="18" fill="#1e293b" font-weight="bold">ア</text>
          <line x1="50" y1="178" x2="242" y2="178" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="50" y1="178" x2="50" y2="24" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="162" y1="24" x2="162" y2="184" stroke="#111827" stroke-width="1.4" stroke-dasharray="6 5"/>
          <path d="M50 178 C 88 136, 115 84, 162 54" stroke="#111827" stroke-width="2" stroke-dasharray="3 4" fill="none"/>
          <path d="M50 178 C 82 132, 122 82, 162 88 C 182 96, 196 110, 222 124" stroke="#111827" stroke-width="4" fill="none"/>
          <path d="M50 178 C 95 143, 154 124, 224 96" stroke="#111827" stroke-width="2" fill="none"/>
          <text x="160" y="204" text-anchor="middle" font-size="13" fill="#1e293b">現在</text>
          <text x="236" y="199" text-anchor="middle" font-size="13" fill="#1e293b">時間</text>
          <text x="33" y="72" transform="rotate(-90 33 72)" text-anchor="middle" font-size="13" fill="#1e293b">金額</text>
          <text x="170" y="51" font-size="13" fill="#1e293b">実コスト(AC)</text>
          <text x="168" y="88" font-size="13" fill="#1e293b">アーンド<tspan x="168" dy="16">バリュー(EV)</tspan></text>
          <text x="185" y="124" font-size="13" fill="#1e293b">プランド<tspan x="185" dy="16">バリュー(PV)</tspan></text>
        </g>
        <g transform="translate(420 28)">
          <text x="0" y="0" font-size="18" fill="#1e293b" font-weight="bold">イ</text>
          <line x1="50" y1="178" x2="242" y2="178" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="50" y1="178" x2="50" y2="24" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="162" y1="24" x2="162" y2="184" stroke="#111827" stroke-width="1.4" stroke-dasharray="6 5"/>
          <path d="M50 178 C 82 126, 102 58, 162 48" stroke="#111827" stroke-width="2" stroke-dasharray="3 4" fill="none"/>
          <path d="M50 178 C 95 130, 150 98, 222 54" stroke="#111827" stroke-width="2" fill="none"/>
          <path d="M50 178 C 96 158, 134 136, 162 120 C 182 113, 195 103, 222 86" stroke="#111827" stroke-width="4" fill="none"/>
          <text x="160" y="204" text-anchor="middle" font-size="13" fill="#1e293b">現在</text>
          <text x="236" y="199" text-anchor="middle" font-size="13" fill="#1e293b">時間</text>
          <text x="33" y="72" transform="rotate(-90 33 72)" text-anchor="middle" font-size="13" fill="#1e293b">金額</text>
          <text x="174" y="55" font-size="13" fill="#1e293b">実コスト(AC)</text>
          <text x="178" y="104" font-size="13" fill="#1e293b">プランド<tspan x="178" dy="16">バリュー(PV)</tspan></text>
          <text x="178" y="148" font-size="13" fill="#1e293b">アーンド<tspan x="178" dy="16">バリュー(EV)</tspan></text>
        </g>
        <g transform="translate(36 272)">
          <text x="0" y="0" font-size="18" fill="#1e293b" font-weight="bold">ウ</text>
          <line x1="50" y1="178" x2="242" y2="178" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="50" y1="178" x2="50" y2="24" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="162" y1="24" x2="162" y2="184" stroke="#111827" stroke-width="1.4" stroke-dasharray="6 5"/>
          <path d="M50 178 C 88 118, 112 60, 162 42 C 178 38, 196 40, 222 46" stroke="#111827" stroke-width="4" fill="none"/>
          <path d="M50 178 C 94 140, 154 124, 224 96" stroke="#111827" stroke-width="2" fill="none"/>
          <path d="M50 178 C 110 168, 150 150, 222 126" stroke="#111827" stroke-width="2" stroke-dasharray="3 4" fill="none"/>
          <text x="160" y="204" text-anchor="middle" font-size="13" fill="#1e293b">現在</text>
          <text x="236" y="199" text-anchor="middle" font-size="13" fill="#1e293b">時間</text>
          <text x="33" y="72" transform="rotate(-90 33 72)" text-anchor="middle" font-size="13" fill="#1e293b">金額</text>
          <text x="174" y="42" font-size="13" fill="#1e293b">アーンド<tspan x="174" dy="16">バリュー(EV)</tspan></text>
          <text x="182" y="100" font-size="13" fill="#1e293b">プランド<tspan x="182" dy="16">バリュー(PV)</tspan></text>
          <text x="174" y="138" font-size="13" fill="#1e293b">実コスト(AC)</text>
        </g>
        <g transform="translate(420 272)">
          <text x="0" y="0" font-size="18" fill="#1e293b" font-weight="bold">エ</text>
          <line x1="50" y1="178" x2="242" y2="178" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="50" y1="178" x2="50" y2="24" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q8)"/>
          <line x1="162" y1="24" x2="162" y2="184" stroke="#111827" stroke-width="1.4" stroke-dasharray="6 5"/>
          <path d="M50 178 C 90 112, 124 82, 162 50 C 180 36, 202 24, 224 15" stroke="#111827" stroke-width="2" fill="none"/>
          <path d="M50 178 C 86 146, 124 116, 162 94 C 178 83, 197 75, 222 62" stroke="#111827" stroke-width="4" fill="none"/>
          <path d="M50 178 C 102 154, 148 136, 222 112" stroke="#111827" stroke-width="2" stroke-dasharray="3 4" fill="none"/>
          <text x="160" y="204" text-anchor="middle" font-size="13" fill="#1e293b">現在</text>
          <text x="236" y="199" text-anchor="middle" font-size="13" fill="#1e293b">時間</text>
          <text x="33" y="72" transform="rotate(-90 33 72)" text-anchor="middle" font-size="13" fill="#1e293b">金額</text>
          <text x="174" y="49" font-size="13" fill="#1e293b">プランド<tspan x="174" dy="16">バリュー(PV)</tspan></text>
          <text x="174" y="102" font-size="13" fill="#1e293b">アーンド<tspan x="174" dy="16">バリュー(EV)</tspan></text>
          <text x="176" y="146" font-size="13" fill="#1e293b">実コスト(AC)</text>
        </g>
      `,
    },
  },
  {
    id: 'om-H28-9',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 9,
    questionText: 'プロジェクト管理で使用する分析技法のうち，傾向分析の説明はどれか。',
    choices: [
      '個々の選択肢とそれぞれを選択した場合に想定されるシナリオの関係を図に表し，それぞれのシナリオにおける期待値を計算して，最善の策を選択する。',
      '個々のリスクが現実のものとなったときの，プロジェクトの目標に与える影響の度合いを調べる。',
      '時間の経過に伴うプロジェクトのパフォーマンスの変動を分析する。',
      '発生した障害とその要因の関係を魚の骨のような図にして分析する。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-10',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 10,
    questionText:
      '社員が週に40時間働くソフトウェア会社がある。この会社が，1人で開発すると440人時のプログラム開発を引き受けた。開発コストを次の条件で見積もるとき，10人のチームで開発する場合のコストは，1人で開発する場合のコストの約何倍になるか。\n\n〔条件〕\n(1) 10人のチームでは，コミュニケーションをとるための工数が余分に発生する。\n(2) コミュニケーションはチームのメンバが総当たりでとり，その工数は2人1組の組合せごとに週当たり4人時（1人につき2時間）である。\n(3) 社員の週当たりコストは社員間で差がない。\n(4) (1)～(3)以外の条件は無視できる。',
    choices: ['1.2', '1.5', '1.8', '2.1'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'planning',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-11',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 11,
    questionText:
      'COCOMOにはシステム開発の工数を見積もる式の一つに\nMM=3.0×(KDSI)^{1.12}\nがある。開発規模（KDSI）と開発生産性（KDSI／MM）の関係を表したグラフはどれか。ここで，MM は開発工数（人月），KDSI は開発規模（注釈を除いたソースコードの行数，単位は k 行）である。',
    choices: ['選択肢アのグラフ', '選択肢イのグラフ', '選択肢ウのグラフ', '選択肢エのグラフ'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        '開発規模を横軸、開発生産性を縦軸とする四つの候補グラフ。アは右上がりで次第に緩やか、イは右上がりで次第に急、ウは右下がりで次第に急、エは右下がりで次第に緩やかになる。',
      caption: '図　開発規模と開発生産性の関係の候補',
      viewBox: '0 0 620 360',
      content: `
        <defs>
          <marker id="amH28q11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
          </marker>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <g transform="translate(35 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ア</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <path d="M 35 112 C 55 60, 105 44, 176 39" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 28)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">イ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <path d="M 35 112 C 88 111, 135 88, 176 36" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(35 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">ウ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <path d="M 35 36 C 85 38, 142 68, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
        <g transform="translate(350 205)">
          <text x="112" y="0" text-anchor="middle" font-size="18" fill="#1e293b" font-weight="bold">エ</text>
          <line x1="24" y1="124" x2="190" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <line x1="24" y1="124" x2="24" y2="18" stroke="#334155" stroke-width="1.4" marker-end="url(#amH28q11)"/>
          <path d="M 35 36 C 48 74, 88 103, 176 112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
          <text x="8" y="72" transform="rotate(-90 8 72)" text-anchor="middle" font-size="12" fill="#1e293b">開発生産性</text>
          <text x="110" y="149" text-anchor="middle" font-size="12" fill="#1e293b">開発規模</text>
        </g>
      `,
    },
  },
  {
    id: 'om-H28-12',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 12,
    questionText:
      'プロジェクトにどのツールを導入するかを，EMV（期待金額価値）を用いて検討する。デシジョンツリーが次の図のとき，ツールAを導入するEMVがツールBを導入するEMVを上回るのは，Xが幾らよりも大きい場合か。',
    choices: ['120', '150', '200', '240'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
    figure: {
      type: 'svg',
      ariaLabel:
        'デシジョンツリー。どのツールを導入するかの決定ノードから、ツールAを導入とツールBを導入に分岐する。ツールAは費用120万円、効果が大きい場合60%で効果額X万円、効果が小さい場合40%で90万円。ツールBは費用60万円、効果が大きい場合60%で120万円、効果が小さい場合40%で60万円。',
      caption: '図　ツール導入のデシジョンツリー',
      viewBox: '0 0 660 330',
      content: `
        <defs>
          <style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
        </defs>
        <rect x="28" y="133" width="118" height="52" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="87" y="153" text-anchor="middle" font-size="13" fill="#1e293b">どのツールを</text>
        <text x="87" y="171" text-anchor="middle" font-size="13" fill="#1e293b">導入するか</text>
        <rect x="178" y="154" width="14" height="14" fill="#111827" stroke="#111827" stroke-width="1.2"/>
        <rect x="252" y="70" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="93" text-anchor="middle" font-size="13" fill="#1e293b">ツールAを導入</text>
        <text x="327" y="113" text-anchor="middle" font-size="13" fill="#1e293b">（費用 120万円）</text>
        <rect x="252" y="205" width="150" height="58" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="327" y="228" text-anchor="middle" font-size="13" fill="#1e293b">ツールBを導入</text>
        <text x="327" y="248" text-anchor="middle" font-size="13" fill="#1e293b">（費用 60万円）</text>
        <circle cx="435" cy="99" r="9" fill="#111827"/>
        <circle cx="435" cy="234" r="9" fill="#111827"/>
        <rect x="525" y="34" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="54" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="72" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 X 万円）</text>
        <rect x="525" y="110" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="130" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="148" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 90万円）</text>
        <rect x="525" y="187" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="207" text-anchor="middle" font-size="13" fill="#1e293b">効果が大きい</text>
        <text x="585" y="225" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 120万円）</text>
        <rect x="525" y="263" width="120" height="50" fill="white" stroke="#1e293b" stroke-width="1.3"/>
        <text x="585" y="283" text-anchor="middle" font-size="13" fill="#1e293b">効果が小さい</text>
        <text x="585" y="301" text-anchor="middle" font-size="13" fill="#1e293b">（効果額 60万円）</text>
        <line x1="146" y1="159" x2="178" y2="161" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="192" y1="161" x2="252" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="402" y1="99" x2="426" y2="99" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="99" x2="488" y2="58" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="58" x2="525" y2="58" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="48" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="99" x2="488" y2="135" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="135" x2="525" y2="135" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="130" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <line x1="402" y1="234" x2="426" y2="234" stroke="#334155" stroke-width="1.5"/>
        <line x1="444" y1="234" x2="488" y2="212" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="212" x2="525" y2="212" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="202" text-anchor="middle" font-size="13" fill="#1e293b">60%</text>
        <line x1="444" y1="234" x2="488" y2="288" stroke="#334155" stroke-width="1.5"/>
        <line x1="488" y1="288" x2="525" y2="288" stroke="#334155" stroke-width="1.5"/>
        <text x="475" y="278" text-anchor="middle" font-size="13" fill="#1e293b">40%</text>
        <text x="42" y="242" font-size="13" fill="#1e293b">〔凡例〕</text>
        <rect x="43" y="254" width="12" height="12" fill="#111827"/>
        <text x="63" y="266" font-size="13" fill="#1e293b">決定ノード</text>
        <circle cx="49" cy="285" r="7" fill="#111827"/>
        <text x="63" y="289" font-size="13" fill="#1e293b">機会ノード</text>
      `,
    },
  },
  {
    id: 'om-H28-13',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 13,
    questionText: 'プロジェクトのリスクを，デルファイ法を利用して抽出しているものはどれか。',
    choices: [
      'ステークホルダや経験豊富なプロジェクトマネージャといった専門家にインタビューし，回答を収集してリスクとしてまとめる。',
      '複数のお互いに関係がないステークホルダやプロジェクトマネージャにアンケートを行い，その結果を要約する。さらに，要約結果を用いてアンケートを行い，結果を要約することを繰り返してリスクをまとめる。',
      'プロジェクトチームのメンバに PMO のメンバやステークホルダを複数名加え，一堂に会して会議をし，リスクに対する意見を出し合い，進行役がリスクとしてまとめる。',
      'プロジェクトを強み，弱み，好機，脅威のそれぞれの観点及びその組合せで分析し，リスクをまとめる。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-14',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 14,
    questionText: 'PMBOK によれば，プロジェクトリスクマネジメントにおける定性的リスク分析で実施することのうち，適切なものはどれか。',
    choices: [
      '感度分析によって，プロジェクトに与える影響が大きいリスクを明確にする。',
      '定量的リスク分析の結果に基づいて，リスクの優先順位付けをする。',
      'リスク対応計画に基づいて，発生するおそれがあるリスクを具体的に特定する。',
      'リスクの発生確率と影響度を査定した結果に基づいて，リスク登録簿を更新する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-15',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 15,
    questionText: 'PMBOK のリスクマネジメントにおけるリスク対応戦略の適用に関する記述のうち，適切なものはどれか。',
    choices: [
      '強化は，マイナスのリスクに対して使用される戦略である。',
      '共有は，プラスのリスクとマイナスのリスクのどちらにも使用される戦略である。',
      '受容は，プラスのリスクとマイナスのリスクのどちらにも使用される戦略である。',
      '転嫁は，プラスのリスクに対して使用される戦略である。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-16',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 16,
    questionText:
      'JIS X 0160 において，“開発者は，ソフトウェア結合のために暫定的なテスト要求事項及びスケジュールを定義し，文書化する。”というタスクを実施するプロセスはどれか。',
    choices: ['ソフトウェア結合', 'ソフトウェア詳細設計', 'ソフトウェア適格性確認テスト', 'ソフトウェア方式設計'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-17',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 17,
    questionText: 'フェールセーフの考えに基づいて設計したものはどれか。',
    choices: [
      '乾電池のプラスとマイナスを逆にすると，乾電池が装填できないようにする。',
      '交通管制システムが故障したときには，信号機に赤色が点灯するようにする。',
      'ネットワークカードのコントローラを二重化しておき，故障したコントローラの方を切り離しても運用できるようにする。',
      'ハードディスクに RAID1 を採用して，MTBF で示される信頼性が向上するようにする。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-18',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 18,
    questionText: 'CMMI の目的として，最も適切なものはどれか。',
    choices: [
      '各種のソフトウェア設計・開発技法を使って開発作業を自動化し，ソフトウェア開発の生産性の向上を図る。',
      '共通の物差しとして用いることによって，国内におけるシステム及びソフトウェア開発とその取引の明確化を可能にする。',
      '組織がプロセスを改善することに役立つ，ベストプラクティスの適用に対する手引を提供する。',
      '特定の購入者と製作者の間で授受されるソフトウェア製品の品質保証を行い，顧客満足度の向上を図る。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-19',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 19,
    questionText: 'XP（eXtreme Programming）のプラクティスの一つに取り入れられているものはどれか。',
    choices: ['構造化プログラミング', 'コンポーネント指向プログラミング', 'ビジュアルプログラミング', 'ペアプログラミング'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'development-approach',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-20',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 20,
    questionText: 'ITIL で定義されるサービスのライフサイクルにおける，サービストランジション段階の説明はどれか。',
    choices: [
      '規定された要件と制約に沿って，サービスを運用に移行し，確実に稼働させることである。',
      'サービスの効率，有効性，費用対効果の観点で運用状況を継続的に測定し，改善していくことである。',
      'サービスの内容を具体的に決めることである。',
      '戦略的資産として，どのようにサービスマネジメントを設計，開発，導入するかについての手引を提供することである。',
    ],
    correctIndex: 0,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-21',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 21,
    questionText: '情報システムの設計のうち，フェールソフトの考え方を適用した例はどれか。',
    choices: [
      'UPS を設置することによって，停電時に手順どおりにシステムを停止できるようにし，データを保全する。',
      '制御プログラムの障害時に，システムの暴走を避け，安全に運転を停止できるようにする。',
      'ハードウェアの障害時に，パフォーマンスは低下するが，構成を縮小して運転を続けられるようにする。',
      '利用者の誤操作や誤入力を未然に防ぐことによって，システムの誤動作を防止できるようにする。',
    ],
    correctIndex: 2,
    explanation: '',
    categoryId: 'delivery',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-22',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 22,
    questionText: 'IT 投資効果の評価に用いられる手法のうち，ROI によるものはどれか。',
    choices: [
      '一定期間のキャッシュフローを，将来発生するものは割引率を設定して現在価値に換算した上で，キャッシュフローの合計値を求め，その大小で評価する。',
      'キャッシュフロー上で初年度の投資によるキャッシュアウトフローが何年後に回収できるかによって評価する。',
      '金銭価値の時間的変化を考慮して，現在価値に換算されたキャッシュフローの一定期間の合計値がゼロとなるような割引率を求め，その大小で評価する。',
      '投資額を分母に，投資による収益を分子とした比率を算出し，その大小で評価する。',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-23',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 23,
    questionText: '労働基準法及び労働契約法が定める，就業規則に係る使用者の義務の記述のうち，適切なものはどれか。',
    choices: [
      '就業規則の基準に達しない労働条件を労働契約で定める場合には，使用者が労働者から個別に合意を得ることが義務付けられている。',
      '使用者は，就業規則を労働者に周知するために，見やすい場所に掲示したり，書面を交付したりするなどの措置を行うことが義務付けられている。',
      '使用する労働者の数が常時10名以上の使用者は，就業規則を作成する義務はあるが，就業規則を行政官庁へ届け出ることは義務付けられていない。',
      '労働組合がない事業場において，使用者が就業規則を作成する場合，労働者の意見を聴くことは義務付けられていない。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'governance',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-24',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 24,
    questionText: 'シャドーIT に該当するものはどれか。',
    choices: [
      'IT 製品や IT を活用して地球環境への負荷を低減する取組み',
      'IT 部門の公式な許可を得ずに，従業員又は部門が業務に利用しているデバイスやクラウドサービス',
      '攻撃対象者のディスプレイやキータイプを物陰から盗み見て，情報を盗み出すこと',
      'ネットワーク上のコンピュータに侵入する準備として，攻撃対象の弱点を探るために個人や組織などの情報を収集すること',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-H28-25',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 25,
    questionText: 'DNSSEC の機能はどれか。',
    choices: [
      'DNS キャッシュサーバの設定によって再帰的な問合せの受付範囲が最大になるようにする。',
      'DNS サーバから受け取るリソースレコードに対するデジタル署名を利用して，リソースレコードの送信者の正当性とデータの完全性を検証する。',
      'ISP などのセカンダリ DNS サーバを利用して DNS コンテンツサーバを二重化することによって，名前解決の可用性を高める。',
      '共通鍵暗号技術とハッシュ関数を利用したセキュアな方法によって，DNS 更新要求が許可されているエンドポイントを特定して認証する。',
    ],
    correctIndex: 1,
    explanation: '',
    categoryId: 'service-management',
    sourceUrl: H28_SPRING_PM_AM2_SOURCE_URL,
  },
]

/** 年度別問題リスト（OfficialMorningQuiz トップ画面の年度カード用） */
export function getMorningQuestionsByYear(year: string): OfficialMorningQuestion[] {
  return officialMorningQuestions
    .filter((q) => q.year === year)
    .sort((a, b) => a.number - b.number)
}
