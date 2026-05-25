export interface AppliedRefreshQuestion {
  id: string
  topicId: string
  prompt: string
  choices: [string, string, string, string]
  answerIndex: number
  explanation: string
}

export interface AppliedRefreshTopic {
  id: string
  title: string
  shortTitle: string
  domain: string
  minutes: number
  overview: string
  keyPoints: string[]
  pmBridge: string[]
  flashcards: { front: string; back: string }[]
  check: AppliedRefreshQuestion
}

export const appliedRefreshTopics: AppliedRefreshTopic[] = [
  {
    id: 'requirements',
    title: '要件定義と利害関係者',
    shortTitle: '要件定義',
    domain: '開発・マネジメント',
    minutes: 8,
    overview:
      '応用情報レベルでは、要求・要件・仕様の違いと、利用者や関係部門の期待を整理する流れを押さえる。PM試験では「誰のどんなニーズを確認しなかったか」が午後Ⅰの失点原因になりやすい。',
    keyPoints: [
      '要求は利用者の希望や課題、要件はシステムが満たすべき条件、仕様は実装・設計上の具体化。',
      '業務要件、機能要件、非機能要件を混ぜない。特に性能・可用性・運用性は後工程で効く。',
      'ステークホルダの期待、権限、影響度、関与度を早めに整理する。',
    ],
    pmBridge: [
      '午前Ⅱでは要件定義・ステークホルダ分析の用語確認として出る。',
      '午後Ⅰでは「なぜ確認不足が問題になったか」「誰を巻き込むべきか」を記述する土台になる。',
    ],
    flashcards: [
      { front: '要求と要件の違いは？', back: '要求は利用者側の望みや課題。要件はシステムやプロジェクトが満たすべき条件に整理したもの。' },
      { front: '非機能要件の代表例は？', back: '性能、可用性、信頼性、セキュリティ、運用性、保守性、移行性など。' },
    ],
    check: {
      id: 'requirements-check',
      topicId: 'requirements',
      prompt: '利用部門の「月末処理を早く終えたい」という発言を、要件定義で最初に確認すべきこととして最も適切なものはどれか。',
      choices: [
        '画面の配色',
        '現状の処理時間、目標時間、処理量の条件',
        '開発言語',
        '本番サーバのラック位置',
      ],
      answerIndex: 1,
      explanation: '性能要件に落とすには、現状値・目標値・前提となる処理量を確認する必要がある。',
    },
  },
  {
    id: 'project-basics',
    title: 'プロジェクト管理の基本',
    shortTitle: 'PM基礎',
    domain: 'マネジメント',
    minutes: 9,
    overview:
      'WBS、スケジュール、コスト、リスク、変更管理の基本を復習する。PM試験では高度な用語よりも、計画と実績を比べて次の打ち手を選ぶ力が問われる。',
    keyPoints: [
      'WBSは成果物を分解して作業範囲を明確にする。100%ルールを意識する。',
      '進捗遅延は原因、影響、対策、承認要否を分けて考える。',
      '変更は影響分析、承認、ベースライン更新、関係者通知までが一連の流れ。',
    ],
    pmBridge: [
      '午前ⅡではWBS、クリティカルパス、変更管理、EVMの基本が頻出。',
      '午後Ⅰでは「計画との差異をどう検知し、誰と合意して是正するか」の説明に直結する。',
    ],
    flashcards: [
      { front: 'WBSの100%ルールとは？', back: '上位成果物に必要な作業を漏れなく含め、不要な作業は含めないという考え方。' },
      { front: '変更要求で最初に行うことは？', back: '受け入れ可否を即断せず、スコープ・期間・コスト・品質・リスクへの影響を分析する。' },
    ],
    check: {
      id: 'project-basics-check',
      topicId: 'project-basics',
      prompt: '承認済みの仕様変更要求に対して、PMが行うべき対応として最も適切なものはどれか。',
      choices: [
        '変更内容だけを開発者に口頭で伝える',
        '影響を反映して計画・ベースライン・関係者への通知を更新する',
        '納期は必ず守るためテストを省略する',
        '変更要求を履歴に残さず進める',
      ],
      answerIndex: 1,
      explanation: '承認後は計画やベースラインに反映し、関係者が同じ前提で動けるようにする。',
    },
  },
  {
    id: 'development-process',
    title: '開発プロセスとテーラリング',
    shortTitle: '開発プロセス',
    domain: '開発',
    minutes: 7,
    overview:
      'ウォーターフォール、反復型、アジャイルの特徴を整理し、プロジェクト特性に合わせて進め方を調整する考え方を復習する。',
    keyPoints: [
      '要件が安定し承認手続が重い場合は、段階的な計画とレビューが効きやすい。',
      '不確実性が高く利用者確認が重要な場合は、短いサイクルで検証する。',
      'テーラリングは手順を省くことではなく、目的に合わせてプロセスを調整すること。',
    ],
    pmBridge: [
      '午前Ⅱでは開発モデルやアジャイル用語の識別で問われる。',
      '午後Ⅰでは「このプロジェクトではなぜ反復的に確認するべきか」の理由付けになる。',
    ],
    flashcards: [
      { front: 'アジャイルで短い反復を行う狙いは？', back: '早くフィードバックを得て、価値や要求のズレを小さくするため。' },
      { front: 'テーラリングで守るべき観点は？', back: 'プロジェクトの規模、リスク、契約、組織標準、関係者の成熟度に合わせる。' },
    ],
    check: {
      id: 'development-process-check',
      topicId: 'development-process',
      prompt: '利用者ニーズが不明確な新サービス開発で、試作品を短い周期で確認する主な目的はどれか。',
      choices: [
        '文書化を完全に不要にするため',
        '早期に仮説を検証し、要求のズレを小さくするため',
        '品質保証活動を省略するため',
        'PMの承認を不要にするため',
      ],
      answerIndex: 1,
      explanation: '不確実性が高いときは、短い周期で利用者の反応を確認し、方向修正することが重要になる。',
    },
  },
  {
    id: 'quality-test',
    title: '品質管理とテスト',
    shortTitle: '品質・テスト',
    domain: '品質',
    minutes: 8,
    overview:
      '品質は「最後にテストで作るもの」ではなく、計画、レビュー、測定、改善で作り込むもの。応用情報レベルのテスト観点をPMの品質管理へつなげる。',
    keyPoints: [
      'レビューは欠陥を早期に見つける活動。テストだけに頼ると手戻りが大きい。',
      'テストは単体、結合、システム、受入の目的を区別する。',
      '品質指標は欠陥件数、レビュー密度、テスト消化、障害傾向などを組み合わせる。',
    ],
    pmBridge: [
      '午前Ⅱではテスト工程、レビュー、品質管理手法が出る。',
      '午後Ⅰでは「品質悪化の兆候をどう見つけ、どの工程へ戻すか」を説明する材料になる。',
    ],
    flashcards: [
      { front: '受入テストの主目的は？', back: '利用者・発注者の観点で、業務要件を満たしているかを確認すること。' },
      { front: 'レビューを前倒しする効果は？', back: '後工程で見つかる欠陥を減らし、修正コストとスケジュール影響を抑える。' },
    ],
    check: {
      id: 'quality-test-check',
      topicId: 'quality-test',
      prompt: '結合テストで多数のインタフェース不具合が見つかった。PMが確認すべき根本原因として最も適切なものはどれか。',
      choices: [
        '画面デザインの好み',
        '外部設計やインタフェース仕様のレビュー不足',
        'プロジェクト名の長さ',
        '会議室の予約方法',
      ],
      answerIndex: 1,
      explanation: '結合時の不具合は、仕様の不整合やレビュー不足が原因になりやすい。',
    },
  },
  {
    id: 'security-risk',
    title: 'セキュリティとリスク',
    shortTitle: 'セキュリティ',
    domain: 'リスク',
    minutes: 8,
    overview:
      '応用情報で扱う基本的な脅威、認証、暗号、脆弱性対策を、PMとしてのリスク管理に接続する。',
    keyPoints: [
      '機密性、完全性、可用性のどれを守る話かを切り分ける。',
      '認証、認可、監査ログを混同しない。',
      'セキュリティ対策は技術だけでなく、運用ルール、教育、委託先管理も含む。',
    ],
    pmBridge: [
      '午前Ⅱでは暗号、認証、脆弱性、リスク対応の基礎が問われる。',
      '午後Ⅰでは「リスクを事前に識別し、誰にどの対策を依頼するか」の記述に効く。',
    ],
    flashcards: [
      { front: '認証と認可の違いは？', back: '認証は本人確認。認可は認証済み利用者に許可する操作範囲を決めること。' },
      { front: 'リスク軽減とは？', back: '発生確率または影響を下げる対策を取ること。例: 追加レビュー、冗長化、教育。' },
    ],
    check: {
      id: 'security-risk-check',
      topicId: 'security-risk',
      prompt: '外部委託先が個人情報を扱う開発で、PMがリスク管理として重視すべきことはどれか。',
      choices: [
        '委託先の作業場所を問わず自由に持ち出しを許す',
        'アクセス権、持ち出し制御、監査、契約上の責任を確認する',
        '納期優先のためログ取得を止める',
        'セキュリティは運用開始後にだけ考える',
      ],
      answerIndex: 1,
      explanation: '個人情報を扱う場合は技術・運用・契約の観点を合わせて管理する必要がある。',
    },
  },
  {
    id: 'data-network',
    title: 'DB・ネットワーク・可用性',
    shortTitle: 'DB/ネットワーク',
    domain: '基盤',
    minutes: 9,
    overview:
      'PM試験でも、基盤の詳細設計までは問われなくても、障害・性能・可用性の会話を理解するための応用情報レベルの基礎は必要になる。',
    keyPoints: [
      'DBでは正規化、トランザクション、排他制御、バックアップの目的を押さえる。',
      'ネットワークではDNS、HTTP、TLS、ルーティング、負荷分散の役割を大づかみにする。',
      '可用性は冗長化、監視、復旧手順、RTO/RPOを組み合わせて考える。',
    ],
    pmBridge: [
      '午前Ⅱでは可用性計算、RTO/RPO、DB・ネットワーク基礎が選択肢で出る。',
      '午後Ⅰでは「障害時にどの情報を確認し、復旧優先度をどう決めるか」に効く。',
    ],
    flashcards: [
      { front: 'RTOとRPOの違いは？', back: 'RTOは復旧までに許容できる時間。RPOは失ってもよいデータの時点。' },
      { front: '負荷分散の主な目的は？', back: '複数サーバに処理を分散し、性能と可用性を高めること。' },
    ],
    check: {
      id: 'data-network-check',
      topicId: 'data-network',
      prompt: '業務停止を最長2時間までに抑える必要がある。この条件を表す指標はどれか。',
      choices: ['RPO', 'RTO', 'MTBF', 'CPU使用率'],
      answerIndex: 1,
      explanation: '復旧までに許容される時間はRTO。RPOはデータ損失の許容時点を表す。',
    },
  },
  {
    id: 'service-operations',
    title: 'ITサービス管理と運用',
    shortTitle: 'サービス管理',
    domain: '運用',
    minutes: 7,
    overview:
      '運用開始後のサービス品質を保つため、インシデント管理、問題管理、変更管理、SLAの基本を復習する。',
    keyPoints: [
      'インシデント管理は早期復旧、問題管理は根本原因の除去が主目的。',
      'SLAはサービス提供者と利用者で合意したサービス水準。',
      '運用引継ぎでは監視、手順、体制、連絡経路、教育を準備する。',
    ],
    pmBridge: [
      '午前ⅡではITIL系の用語、SLA/OLA/UC、変更管理が出る。',
      '午後Ⅰでは移行・運用定着・サービス品質低下のシナリオで使う。',
    ],
    flashcards: [
      { front: 'インシデント管理と問題管理の違いは？', back: 'インシデント管理は復旧優先。問題管理は根本原因を特定し再発を防ぐ。' },
      { front: 'SLAに入れる代表項目は？', back: '稼働率、応答時間、サポート時間、復旧時間、報告方法など。' },
    ],
    check: {
      id: 'service-operations-check',
      topicId: 'service-operations',
      prompt: '同じ障害が繰り返し発生している。再発防止のため根本原因を分析する活動はどれか。',
      choices: ['インシデント管理', '問題管理', '構成品目の棚卸しだけ', '利用者アンケートだけ'],
      answerIndex: 1,
      explanation: '繰り返し発生する障害は、問題管理で根本原因を特定し恒久対策につなげる。',
    },
  },
  {
    id: 'business-contract',
    title: '経営・会計・契約の基礎',
    shortTitle: '経営・契約',
    domain: 'ストラテジ',
    minutes: 8,
    overview:
      'PMは技術だけでなく、投資効果、契約、調達、ステークホルダの意思決定も扱う。応用情報レベルの経営・会計・契約知識を薄く広く復習する。',
    keyPoints: [
      '費用対効果、投資回収、現在価値などは意思決定の根拠になる。',
      '請負、準委任、派遣では責任範囲や指揮命令関係が異なる。',
      '調達では評価基準、契約条件、受入条件、リスク配分を明確にする。',
    ],
    pmBridge: [
      '午前Ⅱでは契約形態、経済性評価、調達管理が出る。',
      '午後Ⅰでは「委託先との役割分担」「成果物の受入」「契約上の制約」を読む力になる。',
    ],
    flashcards: [
      { front: '請負契約の特徴は？', back: '仕事の完成が目的で、完成した成果物に対する責任が中心になる。' },
      { front: '準委任契約の特徴は？', back: '一定の業務遂行が目的で、善管注意義務が中心。完成責任とは性質が異なる。' },
    ],
    check: {
      id: 'business-contract-check',
      topicId: 'business-contract',
      prompt: '成果物の完成責任を負う契約形態として最も適切なものはどれか。',
      choices: ['請負契約', '派遣契約', '雇用契約', '秘密保持契約のみ'],
      answerIndex: 0,
      explanation: '請負契約は仕事の完成を目的とし、成果物の完成責任が中心になる。',
    },
  },
]

export const appliedRefreshDiagnosticQuestions: AppliedRefreshQuestion[] = [
  {
    id: 'diag-requirements-1',
    topicId: 'requirements',
    prompt: '要件定義で「利用者が何を達成したいか」を確認する主な理由はどれか。',
    choices: ['実装担当を減らすため', '解決すべき業務課題とシステム要件を対応付けるため', '設計書を作らないため', 'テストを省くため'],
    answerIndex: 1,
    explanation: '要件は業務上の目的と結び付いていないと、作った機能が価値につながらない。',
  },
  {
    id: 'diag-project-1',
    topicId: 'project-basics',
    prompt: 'WBSを作成する目的として最も適切なものはどれか。',
    choices: ['作業範囲を成果物単位で明確にする', '会議時間を増やす', 'リスクを隠す', '品質基準を不要にする'],
    answerIndex: 0,
    explanation: 'WBSはスコープを分解し、見積り・役割分担・進捗管理の土台にする。',
  },
  {
    id: 'diag-development-1',
    topicId: 'development-process',
    prompt: '不確実性が高い開発で、短いサイクルの確認が有効な理由はどれか。',
    choices: ['承認が一切不要になるため', '利用者の反応を早く得て方向修正できるため', '品質管理が不要になるため', '契約を無視できるため'],
    answerIndex: 1,
    explanation: '早期フィードバックは要求のズレや価値の不足を早く見つけるのに役立つ。',
  },
  {
    id: 'diag-quality-1',
    topicId: 'quality-test',
    prompt: 'レビューを早い工程で行う主な狙いはどれか。',
    choices: ['欠陥を早期発見し手戻りを減らす', 'テスト担当を不要にする', '要件変更を禁止する', '進捗報告をなくす'],
    answerIndex: 0,
    explanation: '早期の欠陥検出は修正コストとスケジュール影響を小さくする。',
  },
  {
    id: 'diag-security-1',
    topicId: 'security-risk',
    prompt: '認証の説明として最も適切なものはどれか。',
    choices: ['利用者本人であることを確認する', '利用できる機能範囲を決める', '通信量を増やす', 'DBを正規化する'],
    answerIndex: 0,
    explanation: '認証は本人確認。権限範囲を決めるのは認可。',
  },
  {
    id: 'diag-data-1',
    topicId: 'data-network',
    prompt: 'RPOが表すものはどれか。',
    choices: ['復旧に許容される時間', '失ってもよいデータの時点', '平均故障間隔', '回線速度'],
    answerIndex: 1,
    explanation: 'RPOはデータ損失の許容範囲。RTOは復旧時間の許容範囲。',
  },
  {
    id: 'diag-service-1',
    topicId: 'service-operations',
    prompt: 'SLAの説明として最も適切なものはどれか。',
    choices: ['サービス水準に関する合意', '開発者の勤務表', 'ソースコード規約だけ', '画面一覧だけ'],
    answerIndex: 0,
    explanation: 'SLAはサービス提供者と利用者が合意するサービス水準を示す。',
  },
  {
    id: 'diag-business-1',
    topicId: 'business-contract',
    prompt: '請負契約の特徴として最も適切なものはどれか。',
    choices: ['指揮命令を発注者が直接行う', '仕事の完成を目的とする', '成果物責任がない', '秘密保持だけを定める'],
    answerIndex: 1,
    explanation: '請負契約は仕事の完成を目的とする。派遣とは指揮命令関係も異なる。',
  },
]

export const appliedRefreshFinalQuestions: AppliedRefreshQuestion[] = [
  ...appliedRefreshTopics.map((topic) => topic.check),
  {
    id: 'final-integrated-1',
    topicId: 'project-basics',
    prompt: '進捗遅延が発生したとき、PMが最初に整理すべき観点として最も適切なものはどれか。',
    choices: [
      '担当者名だけ',
      '原因、影響範囲、対策案、承認が必要な変更の有無',
      '会議室の広さ',
      '過去の成功事例だけ',
    ],
    answerIndex: 1,
    explanation: '遅延対応では、原因と影響を切り分け、計画変更や関係者合意の要否を判断する。',
  },
  {
    id: 'final-integrated-2',
    topicId: 'requirements',
    prompt: '非機能要件の確認漏れが後工程で問題化しやすい理由はどれか。',
    choices: [
      '画面名が変わるだけだから',
      '性能・可用性・運用性などは設計や基盤構成に大きく影響するから',
      '利用者には関係がないから',
      '必ずテストで自然に解決するから',
    ],
    answerIndex: 1,
    explanation: '非機能要件は設計・基盤・運用体制に影響するため、後からの修正は手戻りが大きい。',
  },
]
