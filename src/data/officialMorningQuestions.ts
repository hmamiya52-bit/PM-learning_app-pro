/**
 * 公式午前II（PM 午前II）問題データ
 *
 * 設計書 v0.16 §2.7b / F1.5-P4 に従い、令和6年度 秋期 PM 午前II 25問を投入。
 * 解説（explanation）は Claude 次工程で独自作成するため、本タスクでは空文字にする。
 *
 * IPA 著作権規約（memory/risks.md R1 参照）:
 * - 教育目的の引用は許諾・使用料不要
 * - 出典明記必須: 「出典：<年度> <期> プロジェクトマネージャ試験 午前II 問<番号>」
 * - 問題文・選択肢は IPA 公式のまま引用（改変なし）。解説のみ独自作成。
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
    categoryId: 'team',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-4',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 4,
    questionText:
      'EVM で管理しているプロジェクトがある。図は，プロジェクトの開始日から完了予定日までの期間の半分が経過した時点での状況である。完成時総予算 (BAC) どおりに完了させるために達成することが必要となるコスト効率の指標である残作業効率指数 (TCPI) の値はどれか。ここで，TCPI は小数第 2 位を四捨五入するものとする。\n[図: 現時点で BAC=100，PV=50，AC=40，EV=34]',
    choices: ['0.6', '0.9', '1.1', '1.3'],
    correctIndex: 2,
    explanation: '',
    categoryId: 'measurement (figure)',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-5',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 5,
    questionText:
      'あるプロジェクトの作業が図のとおり計画されているとき，最短日数で終了するためには，作業 H はプロジェクトの開始から遅くとも何日経過した後に開始しなければならないか。\n[図: 作業 A=8，B=5，C=12，D=10，E=9，F=8，G=12，H=5，I=4。D/E 後の結合点から H 前の結合点へのダミー作業あり]',
    choices: ['12', '14', '18', '21'],
    correctIndex: 3,
    explanation: '',
    categoryId: 'planning (figure)',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-6',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 6,
    questionText:
      '四つのアクティビティ A～D によって実行する開発プロジェクトがある。図は，各アクティビティの PDM (プレシデンスダイアグラム法) における依存関係を表す。条件に従ってアクティビティを実行するとき，この開発プロジェクトの最少所要日数は何日か。\n〔アクティビティの依存関係〕開始→A(8日間)→C(5日間)→D(5日間)→終了，開始→B(12日間)→終了。A→C，C→D は FS。\n〔条件〕\n・各アクティビティは，最終 3 日間に，連続して試験設備を使用する。\n・試験設備は 1 台であって，同時に複数のアクティビティが使用することはできない。\n・試験設備以外の資源にアクティビティ間の競合はない。',
    choices: ['18', '19', '20', '21'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'planning (figure)',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
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
    explanation: '',
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
    explanation: '',
    categoryId: 'measurement',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-9',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 9,
    questionText:
      'あるソフトウェア開発部門では，開発工数 E (人月) と開発規模 L (k ステップ) との関係を，E=5.2L^0.98 としている。L=10 としたときの生産性 (k ステップ／人月) は，およそ幾らか。',
    choices: ['0.2', '0.5', '1.9', '5.2'],
    correctIndex: 0,
    explanation: '',
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
      '(X＋Y＋Z)／3',
      '1／X＋1／Y＋1／Z',
      '1／(1／X＋1／Y＋1／Z)',
    ],
    correctIndex: 3,
    explanation: '',
    categoryId: 'measurement (figure)',
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
    explanation: '',
    categoryId: 'uncertainty',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
  },
  {
    id: 'om-R6-12',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 12,
    questionText:
      '新しく編成するプロジェクトチームの開発要員投入計画に基づいて PC をレンタルで調達する。調達の条件を満たすレンタル費用の最低金額は何千円か。\n〔開発要員投入計画（単位 人）〕設計者: 1月0，2月2，3月4，4月4，5月4，6月2，7月2，8月2，9月2，10月2，11月2，12月0。プログラマ: 1月0，2月0，3月0，4月3，5月3，6月5，7月5，8月3，9月3，10月2，11月2，12月0。テスタ: 1月0，2月0，3月0，4月0，5月0，6月4，7月4，8月4，9月6，10月0，11月0，12月0。計: 1月0，2月2，3月4，4月7，5月7，6月11，7月11，8月9，9月11，10月4，11月4，12月0。\n〔調達の条件〕\n(1) PC のレンタル契約は月初日から月末日までの 1 か月単位であって，日割りによる精算は行わない。\n(2) PC 1 台のレンタル料金は月額 5 千円である。\n(3) 台数にかかわらず，レンタル PC の受入れ時のセットアップに 2 週間，返却時のデータ消去に 1 週間を要し，この期間はレンタル期間に含める。\n(4) セットアップとデータ消去は，プロジェクトチームの開発要員とは別の要員が行う。\n(5) 開発要員は月初日に着任し，月末日に離任する。\n(6) 開発要員の役割にかかわらず，共通仕様の PC を 1 人が 1 台使用する。\n(7) レンタル期間中に PC を他の開発要員に引き渡す場合，データ消去，セットアップ及び引渡しの期間は不要である。',
    choices: ['350', '470', '480', '500'],
    correctIndex: 1,
    explanation: '',
    categoryId: 'project-work (figure)',
    sourceUrl: R6_AUTUMN_PM_AM2_SOURCE_URL,
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
    explanation: '',
    categoryId: 'delivery',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
    categoryId: 'service-management',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
    explanation: '',
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
