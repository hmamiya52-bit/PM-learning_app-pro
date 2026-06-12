/**
 * 午後II（PM2）論述問題データ
 *
 * 設計書 v0.15 §2.6 / basic_design §4.2 に基づく PM 試験 午後II 論述問題。
 * F2-P5 で新しい年度から順に公式設問へ差し替え。
 *
 * IPA 著作権規約: 教育目的引用OK、出典明記必須、解説（自己評価項目）のみ独自作成。
 */

import type { EssayProblem } from '../types'

export const essayProblems: EssayProblem[] = [
  {
    id: 'R6-PM2-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 1,
    theme: '予測型のシステム開発プロジェクトにおけるコストのマネジメントについて',
    preamble: [
      '　予測型のシステム開発プロジェクトでは，将来に対する予測に基づきプロジェクト計画を作成するが，システム開発に影響する事業改革の進め方が未定，新たに適用するデジタル技術の効果が不明などといった，正確な予測を妨げる要因（以下，不確かさという）が存在するプロジェクトもある。このようなプロジェクトでは，予測の精度を上げる活動（以下，予測活動という）を計画して，実行する必要がある。',
      '　不確かさは，コストの見積りにも影響を与える。したがって，予算を含むステークホルダのコストに関する要求事項を確認した上で，不確かさがコストの見積りに与える影響についての認識をステークホルダと共有して，コストの見積りに関わる予測活動を計画し，実行することによって，コストをマネジメントする必要がある。',
      '　計画段階では，予測活動の内容，コストの再見積りのタイミングを決める条件，予測活動における役割分担などのステークホルダとの協力の内容，及び再見積りしたコストと予算との差異への対応方針を，ステークホルダと合意する。',
      '　実行段階では，ステークホルダと協力して予測活動を行う。そして，予測精度の向上を考慮した適切なタイミングで再見積りし，再見積りしたコストと予算との差異に対して，対応方針に沿って予算の見直しやコスト削減などの対応策を作成し，ステークホルダに報告して承認を得る。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった予測型のシステム開発プロジェクトにおける，予算を含むステークホルダのコストに関する要求事項，不確かさ及び不確かさがコストの見積りに与える影響，影響についての認識をステークホルダと共有するために実施したことについて，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた不確かさに関して，計画段階でステークホルダと合意した，予測活動の内容，コストの再見積りのタイミングを決める条件，予測活動におけるステークホルダとの協力の内容，及び再見積りしたコストと予算との差異への対応方針について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '実行段階での，予測精度の向上を考慮して実施した再見積りのタイミング，再見積りしたコストと予算との差異の内容，及びステークホルダに報告して承認を得た差異への対応策について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['planning', 'measurement', 'uncertainty', 'stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R6-PM2-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    number: 2,
    theme: 'メンバーの状況に応じたリーダーシップの選択について',
    preamble: [
      '　システム開発プロジェクトでは，プロジェクトを支持している影響力のあるステークホルダの異動，プロジェクト外部の要因によるスコープやスケジュールの変更要求など，プロジェクト実行中に起こるプロジェクトの活動を阻害するおそれのある外部環境の変化に対応する。プロジェクトチームのリーダーは，このような外部環境の変化によってプロジェクトチームの状態が悪化した場合，リーダーシップを発揮して悪化した状態を改善する。この際，個々のメンバーの状況を把握して，状況に応じたリーダーシップを選択し，これに基づき行動を使い分ける必要がある。',
      '　例えば，メンバー間で対立が継続している状態の場合は，対立しているメンバーの双方と積極的なコミュニケーションを行う。メンバーだけでは対立の解消が困難な状況にあるときは，指示的なリーダーシップを選択し，これに基づき早急に対立を解消するためにリーダーが考える対策を適用させる行動をとる。一方で，対立の影響で士気が低下している状態の場合は，メンバーの不安や不満に耳を傾ける。士気の回復に向けて動機付けが必要な状況にあるときは，支援的なリーダーシップを選択し，これに基づき自主的な行動を促す行動をとる。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたがマネジメントに携わったプロジェクトチームの特性，プロジェクト実行中に起きたプロジェクトの活動を阻害するおそれのある外部環境の変化，阻害するおそれがあると考えた理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた外部環境の変化によって悪化したプロジェクトチームの状態，悪化した状態の改善に向けて把握した個々のメンバーの状況，それらの状況に応じて選択したリーダーシップとこれに基づく具体的な行動，それぞれの行動を使い分けた理由について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べたリーダーシップを発揮した後の，改善したプロジェクトチームの状態，及び状態の改善に対する評価について，プロジェクトの活動を阻害するおそれのある外部環境の変化への対応結果を含めて，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['team', 'stakeholder', 'uncertainty'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R5-PM2-1',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 1,
    theme: 'プロジェクトマネジメント計画の修整（テーラリング）について',
    preamble: [
      '　システム開発プロジェクトでは，プロジェクトの目標を達成するために，時間，コスト，品質以外に，リスク，スコープ，ステークホルダ，プロジェクトチーム，コミュニケーションなどもプロジェクトマネジメントの対象として重要である。プロジェクトマネジメント計画を作成するに当たっては，これらの対象に関するマネジメントの方法としてマネジメントの役割，責任，組織，プロセスなどを定義する必要がある。',
      '　その際に，マネジメントの方法として定められた標準や過去に経験した事例を参照することは，プロジェクトマネジメント計画を作成する上で，効率が良くまた効果的である。しかし，個々のプロジェクトには，プロジェクトを取り巻く環境，スコープ定義の精度，ステークホルダの関与度や影響度，プロジェクトチームの成熟度やチームメンバーの構成，コミュニケーションの手段や頻度などに関して独自性がある。',
      '　システム開発プロジェクトを適切にマネジメントするためには，参照したマネジメントの方法を，個々のプロジェクトの独自性を考慮して修整し，プロジェクトマネジメント計画を作成することが求められる。',
      '　さらに，修整したマネジメントの方法の実行に際しては，修整の有効性をモニタリングし，その結果を評価して，必要に応じて対応する。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの目標，その目標を達成するために，時間，コスト，品質以外に重要と考えたプロジェクトマネジメントの対象，及び重要と考えた理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトマネジメントの対象のうち，マネジメントの方法を修整したものは何か。修整が必要と判断した理由，及び修整した内容について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた修整したマネジメントの方法の実行に際して，修整の有効性をどのようにモニタリングしたか。モニタリングの結果とその評価，必要に応じて行った対応について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['tailoring-models', 'planning', 'measurement', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R5-PM2-2',
    year: 'R5',
    yearLabel: '令和5（2023）',
    number: 2,
    theme: '組織のプロジェクトマネジメント能力の向上につながるプロジェクト終結時の評価について',
    preamble: [
      '　プロジェクトチームには，プロジェクト目標を達成することが求められる。しかし，過去の経験や実績に基づく方法やプロセスに従ってマネジメントを実施しても，重要な目標の一部を達成できずにプロジェクトを終結すること（以下，目標未達成という）がある。このようなプロジェクトの終結時の評価の際には，今後のプロジェクトの教訓として役立てるために，プロジェクトチームとして目標未達成の原因を究明して再発防止策を立案する。',
      '　目標未達成の原因を究明する場合，目標未達成を直接的に引き起こした原因（以下，直接原因という）の特定にとどまらず，プロジェクトの独自性を踏まえた因果関係の整理や段階的な分析などの方法によって根本原因を究明する必要がある。その際，プロジェクトチームのメンバーだけでなく，ステークホルダからも十分な情報を得る。さらに客観的な立場で根本原因の究明に参加する第三者を加えたり，組織内外の事例を参照したりして，それらの知見を活用することも有効である。',
      '　究明した根本原因を基にプロジェクトマネジメントの観点で再発防止策を立案する。再発防止策は，マネジメントプロセスを煩雑にしたりマネジメントの負荷を大幅に増加させたりしないような工夫をして，教訓として組織への定着を図り，組織のプロジェクトマネジメント能力の向上につなげることが重要である。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの独自性，未達成となった目標と目標未達成となった経緯，及び目標未達成がステークホルダに与えた影響について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた目標未達成の直接原因の内容，根本原因を究明するために行ったこと，及び根本原因の内容について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた根本原因を基にプロジェクトマネジメントの観点で立案した再発防止策，及び再発防止策を組織に定着させるための工夫について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['measurement', 'governance', 'integration', 'stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R4-PM2-1',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 1,
    theme: 'システム開発プロジェクトにおける事業環境の変化への対応について',
    preamble: [
      '　システム開発プロジェクトでは，事業環境の変化に対応して，プロジェクトチームの外部のステークホルダからプロジェクトの実行中に計画変更の要求を受けることがある。このような計画変更には，プロジェクトにプラスの影響を与える機会とマイナスの影響を与える脅威が伴う。計画変更を効果的に実施するためには，機会を生かす対応策と脅威を抑える対応策の策定が重要である。',
      '　例えば，競合相手との差別化を図る機能の提供を目的とするシステム開発プロジェクトの実行中に，競合相手が同種の新機能を提供することを公表し，これに対応する営業部門から，差別化を図る機能の提供時期を，予算を追加してでも前倒しする計画変更が要求されたとする。この計画変更で，短期開発への挑戦というプラスの影響を与える機会が生まれ，プロジェクトチームの成長が期待できる。この機会を生かすために，短期開発の経験者をプロジェクトチームに加え，メンバーがそのノウハウを習得するという対応策を策定する。一方で，スケジュールの見直しというマイナスの影響を与える脅威が生まれ，プロジェクトチームが混乱したり生産性が低下したりする。この脅威を抑えるために，差別化に寄与する度合いの高い機能から段階的に前倒しして提供していくという対応策を策定する。',
      '　策定した対応策を反映した上で，計画変更の内容を確定して実施し，事業環境の変化に迅速に対応する。',
      '　あなたの経験と考えに基づいて，設問ア～設問ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの概要と目的，計画変更の背景となった事業環境の変化，及びプロジェクトチームの外部のステークホルダからプロジェクトの実行中に受けた計画変更の要求の内容について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた計画変更の要求を受けて策定した，機会を生かす対応策，脅威を抑える対応策，及び確定させた計画変更の内容について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた計画変更の実施の状況及びその結果による事業環境の変化への対応の評価について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['uncertainty', 'integration', 'stakeholder', 'planning'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R4-PM2-2',
    year: 'R4',
    yearLabel: '令和4（2022）',
    number: 2,
    theme: 'プロジェクト目標の達成のためのステークホルダとのコミュニケーションについて',
    preamble: [
      '　システム開発プロジェクトでは，プロジェクト目標（以下，目標という）を達成するために，目標の達成に大きな影響を与えるステークホルダ（以下，主要ステークホルダという）と積極的にコミュニケーションを行うことが求められる。',
      '　プロジェクトの計画段階においては，主要ステークホルダへのヒアリングなどを通じて，その要求事項に基づくスコープを定義して合意する。その際，スコープとしては明確に定義されなかったプロジェクトへの期待があることを想定して，プロジェクトへの過大な期待や主要ステークホルダ間の相反する期待の有無を確認する。過大な期待や相反する期待に対しては，適切にマネジメントしないと目標の達成が妨げられるおそれがある。そこで，主要ステークホルダと積極的にコミュニケーションを行い，過大な期待や相反する期待によって目標の達成が妨げられないように努める。',
      '　プロジェクトの実行段階においては，コミュニケーションの不足などによって，主要ステークホルダに認識の齟齬や誤解（以下，認識の不一致という）が生じることがある。これによって目標の達成が妨げられるおそれがある場合，主要ステークホルダと積極的にコミュニケーションを行って認識の不一致の解消に努める。',
      '　あなたの経験と考えに基づいて，設問ア～設問ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの概要，目標，及び主要ステークホルダが目標の達成に与える影響について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトに関し，“計画段階”において確認した主要ステークホルダの過大な期待や相反する期待の内容，過大な期待や相反する期待によって目標の達成が妨げられるおそれがあると判断した理由，及び“計画段階”において目標の達成が妨げられないように積極的に行ったコミュニケーションについて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問アで述べたプロジェクトに関し，“実行段階”において生じた認識の不一致とその原因，及び“実行段階”において認識の不一致を解消するために積極的に行ったコミュニケーションについて，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['stakeholder', 'planning', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R3-PM2-1',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 1,
    theme: 'システム開発プロジェクトにおけるプロジェクトチーム内の対立の解消について',
    preamble: [
      '　プロジェクトマネージャ（PM）は，プロジェクトの目標の達成に向け継続的にプロジェクトチームをマネジメントし，プロジェクトを円滑に推進しなければならない。',
      '　プロジェクトの実行中には，作業の進め方をめぐって様々な意見や認識の相違がプロジェクトチーム内に生じることがある。チームで作業するからにはこれらの相違が発生することは避けられないが，これらの相違がなくならない状態が続くと，プロジェクトの円滑な推進にマイナスの影響を与えるような事態（以下，対立という）に発展することがある。',
      '　PMは，プロジェクトチームの意識を統一するための行動の基本原則を定め，メンバに周知し，遵守させる。プロジェクトの実行中に，プロジェクトチームの状況から対立の兆候を察知した場合，対立に発展しないように行動の基本原則に従うように促し，プロジェクトチーム内の関係を改善する。',
      '　しかし，行動の基本原則に従っていても意見や認識の相違が対立に発展してしまうことがある。その場合は，原因を分析して対立を解消するとともに，行動の基本原則を改善し，遵守を徹底させることによって，継続的にプロジェクトチームをマネジメントする必要がある。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴，あなたが定めた行動の基本原則とプロジェクトチームの状況から察知した対立の兆候について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトの実行中に作業の進め方をめぐって発生した対立と，あなたが実施した対立の解消策及び行動の基本原則の改善策について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた対立の解消策と行動の基本原則の改善策の実施状況及び評価と，今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['team', 'stakeholder', 'governance'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R3-PM2-2',
    year: 'R3',
    yearLabel: '令和3（2021）',
    number: 2,
    theme: 'システム開発プロジェクトにおけるスケジュールの管理について',
    preamble: [
      '　プロジェクトマネージャ（PM）には，プロジェクトの計画時にシステム開発プロジェクト全体のスケジュールを作成した上で，プロジェクトが所定の期日に完了するように，スケジュールの管理を適切に実施することが求められる。',
      '　PMは，スケジュールの管理において一定期間内に投入したコストや資源，成果物の出来高と品質などを評価し，承認済みのスケジュールベースラインに対する現在の進捗の実績を確認する。そして，進捗の差異を監視し，差異の状況に応じて適切な処置をとる。',
      '　PMは，このようなスケジュールの管理の仕組みで把握した進捗の差異がプロジェクトの完了期日に対して遅延を生じさせると判断した場合，差異の発生原因を明確にし，発生原因に対する対応策，続いて，遅延に対するばん回策を立案し，それぞれ実施する。',
      '　なお，これらを立案する場合にプロジェクト計画の変更が必要となるとき，変更についてステークホルダの承認を得ることが必要である。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴と目標，スケジュールの管理の概要について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたスケジュールの管理の仕組みで把握した，プロジェクトの完了期日に対して遅延を生じさせると判断した進捗の差異の状況，及び判断した根拠は何か。また，差異の発生原因に対する対応策と遅延に対するばん回策はどのようなものか。800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた対応策とばん回策の実施状況及び評価と，今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['planning', 'measurement', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000apad-att/2021r03a_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R2-PM2-1',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 1,
    theme: '未経験の技術やサービスを利用するシステム開発プロジェクトについて',
    preamble: [
      '　プロジェクトマネージャ（PM）は，システム化の目的を実現するために，組織にとって未経験の技術やサービス（以下，新技術という）を利用するプロジェクトをマネジメントすることがある。',
      '　このようなプロジェクトでは，新技術を利用して機能，性能，運用などのシステム要件を完了時期や予算などのプロジェクトへの要求事項を満たすように実現できること（以下，実現性という）を，システム開発に先立って検証することが必要になる場合がある。このような場合，プロジェクトライフサイクルの中で，システム開発などのプロジェクトフェーズ（以下，開発フェーズという）に先立って，実現性を検証するプロジェクトフェーズ（以下，検証フェーズという）を設けることがある。検証する内容はステークホルダと合意する必要がある。検証フェーズでは，品質目標を定めたり，開発フェーズの活動期間やコストなどを詳細に見積もったりするための情報を得る。PMは，それらの情報を活用して，必要に応じ開発フェーズの計画を更新する。',
      '　さらに，検証フェーズで得た情報や更新した開発フェーズの計画を示すなどして，検証結果の評価についてステークホルダの理解を得る。場合によっては，システム要件やプロジェクトへの要求事項を見直すことについて協議して理解を得ることもある。',
      '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
    ].join('\n'),
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった新技術を利用したシステム開発プロジェクトにおけるプロジェクトとしての特徴，システム要件，及びプロジェクトへの要求事項について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたシステム要件とプロジェクトへの要求事項について，検証フェーズで実現性をどのように検証したか。検証フェーズで得た情報を開発フェーズの計画の更新にどのように活用したか。また，ステークホルダの理解を得るために行ったことは何か。800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた検証フェーズで検証した内容，及び得た情報の活用について，それぞれの評価及び今後の改善点を，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['development-approach', 'delivery', 'planning', 'stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R2-PM2-2',
    year: 'R2',
    yearLabel: '令和2（2020）',
    number: 2,
    theme: 'システム開発プロジェクトにおけるリスクのマネジメントについて',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴と目標，外部のステークホルダに起因するプロジェクトの目標の達成にマイナスの影響を与えると計画時に特定した様々なリスク，及びこれらのリスクを特定した理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた様々なリスクについてどのように評価し，どのような対応策を策定したか。また，リスクをどのような方法で監視したか。800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べたリスクへの対応策とリスクの監視の実施状況，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['uncertainty', 'stakeholder', 'measurement', 'planning'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R1-PM2-1',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 1,
    theme: 'システム開発プロジェクトにおけるコスト超過の防止について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴とコストの管理の概要について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトの実行中，コストの管理を通じてコスト超過が予測される前に，PM としての知識や経験に基づいて察知した，コスト超過につながると懸念した兆候はどのようなものか。コスト超過につながると懸念した根拠は何か。また，兆候の原因と立案したコスト超過を防止する対策は何か。800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた対策の実施状況，対策の評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['planning', 'measurement', 'uncertainty'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'R1-PM2-2',
    year: 'R1',
    yearLabel: '令和元（2019）',
    number: 2,
    theme: 'システム開発プロジェクトにおける，助言や他のプロジェクトの知見などを活用した問題の迅速な解決について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴，及びプロジェクト内の取組だけでは解決できなかった品質，納期，コストに影響し得る問題について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた問題に対して，解決に役立つ観点や手段などを見いだすために，有識者や参考とするプロジェクトの特定及び助言や知見などの分析をどのように行ったか。また，見いだした観点や手段などをどのように活用して，問題の迅速な解決に取り組んだか。800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた特定や分析，問題解決の取組について，それらの有効性の評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['stakeholder', 'project-work', 'measurement', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H30-PM2-1',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 1,
    theme: 'システム開発プロジェクトにおける非機能要件に関する関係部門との連携について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの特徴，代表的な非機能要件の概要，並びにその非機能要件に関して関係部門と連携を図る際に注意を払う必要があった点及びその理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた代表的な非機能要件に関し，関係部門と十分な連携を図るために検討して実施した取組みについて，主なタスクの内容と関係部門，及び関係部門の役割とともに，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた取組みに関する実施結果の評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['stakeholder', 'planning', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H30-PM2-2',
    year: 'H30',
    yearLabel: '平成30（2018）',
    number: 2,
    theme: 'システム開発プロジェクトにおける本稼働間近で発見された問題への対応について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴，本稼働間近で発見され，予定された稼働日までに解決することが困難であった問題，及び困難と判断した理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた問題の状況をどのように把握し，影響などをどのように分析したか。また，暫定的な稼働を迎えるために立案した問題に対する当面の対応策は何か。関係部門との調整や合意の内容を含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた対応策の実施状況と評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['delivery', 'uncertainty', 'stakeholder', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H29-PM2-1',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 1,
    theme: 'システム開発プロジェクトにおける信頼関係の構築・維持について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴，信頼関係を構築したステークホルダ，及びステークホルダとの信頼関係の構築が重要と考えた理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたステークホルダとの信頼関係を構築するための取組み，及び信頼関係を維持していくための取組みはそれぞれ，どのようなものであったか。工夫した点を含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問アで述べたプロジェクトにおいて，ステークホルダとの信頼関係が解決に貢献した問題，その解決において信頼関係が果たした役割，及び今後に向けて改善が必要と考えた点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['stakeholder', 'team', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H29-PM2-2',
    year: 'H29',
    yearLabel: '平成29（2017）',
    number: 2,
    theme: 'システム開発プロジェクトにおける品質管理について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトの特徴，品質面の要求事項，及び品質管理計画を策定する上でプロジェクトの特徴に応じて考慮した点について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた考慮した点を踏まえて，どのような品質管理計画を策定し，どのように品質管理を実施したかについて，考慮した点と特に関連が深い工程を中心に，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた品質管理計画の内容の評価，実施結果の評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['measurement', 'governance', 'planning', 'delivery'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H28-PM2-1',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 1,
    theme: '他の情報システムの成果物を再利用した情報システムの構築について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった情報システム構築プロジェクトにおけるプロジェクトの特徴，並びに他の情報システムの成果物を再利用した際の再利用の範囲・方法，及びその決定理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた成果物の再利用に関し，期待した効果，有効利用を図る上での課題と対策，及び対策の実施状況について，特に工夫をした点を含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた期待した効果の実現状況と評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['development-approach', 'delivery', 'integration', 'planning'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H28-PM2-2',
    year: 'H28',
    yearLabel: '平成28（2016）',
    number: 2,
    theme: '情報システム開発プロジェクトの実行中におけるリスクのコントロールについて',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった情報システム開発プロジェクトにおけるプロジェクトの特徴，及びプロジェクトの実行中に察知したプロジェクト目標の達成を阻害するリスクにつながる兆候について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた兆候をそのままにした場合に顕在化すると考えたリスクとそのように考えた理由，対応が必要と判断したリスクへの予防処置，及びリスクの顕在化に備えて策定した対応計画について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べたリスクへの予防処置の実施状況と評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['uncertainty', 'measurement', 'planning', 'integration'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H27-PM2-1',
    year: 'H27',
    yearLabel: '平成27（2015）',
    number: 1,
    theme: '情報システム開発プロジェクトにおけるサプライヤの管理について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった情報システム開発プロジェクトにおけるプロジェクトの特徴，及び外部のサプライヤから請負で調達した範囲とその理由について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトにおいて，発注者とサプライヤの間で作成した進捗の管理と品質の管理の仕組みについて，請負で調達する場合を考慮して工夫した点を含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた進捗の管理と品質の管理の仕組みの実施状況と評価，及び今後の改善点について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['governance', 'stakeholder', 'delivery', 'measurement'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H27-PM2-2',
    year: 'H27',
    yearLabel: '平成27（2015）',
    number: 2,
    theme: '情報システム開発プロジェクトにおける品質の評価，分析について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わった情報システム開発プロジェクトの目標や特徴，評価指標や評価指標値の目標範囲などを定めた工程のうち，実績値が目標範囲を逸脱した工程を挙げて，その工程で評価指標や評価指標値の目標範囲などをどのように定めたかについて，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた評価指標で，実績値が目標範囲をどのように逸脱し，その原因をどのように分析して，どのような原因を特定したか。また，影響をどのように分析したか。重要と考えた点を中心に，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで特定した原因や影響への対応策，同様の事象の再発を防ぐための改善策，及びそれらの策を実施する上で必要となった見直し内容とそれらの策の実施状況の監視方法について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['measurement', 'delivery', 'governance', 'project-work'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H26-PM2-1',
    year: 'H26',
    yearLabel: '平成26（2014）',
    number: 1,
    theme: 'システム開発プロジェクトにおける工数の見積りとコントロールについて',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴と，見積りのために入手した情報について，あなたがどの時点で工数を見積もったかを含めて，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べた見積り時点において，プロジェクトの特徴，入手した情報の精度などの特徴を踏まえてどのように工数を見積もったか。見積りをできるだけ正確に行うために工夫したことを含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問アで述べたプロジェクトにおいて，見積りどおりに工数をコントロールするためのプロジェクト運営面での施策，その実施状況及び評価について，あなたが重要と考えた施策を中心に，発見した問題とその対策を含めて，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['planning', 'measurement', 'project-work'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H26-PM2-2',
    year: 'H26',
    yearLabel: '平成26（2014）',
    number: 2,
    theme: 'システム開発プロジェクトにおける要員のマネジメントについて',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの特徴，プロジェクト組織体制，要員に期待した能力について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトの遂行中に，要員に期待した能力が十分に発揮されていないと認識した事態，立案した対応策とその工夫，及び対応策の実施状況について，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた事態が発生した根本原因と立案した再発防止策について，再発防止策の実施状況を含めて，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['team', 'planning', 'governance', 'project-work'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H25-PM2-1',
    year: 'H25',
    yearLabel: '平成25（2013）',
    number: 1,
    theme: 'システム開発業務における情報セキュリティの確保について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトのプロジェクトとしての特徴，情報セキュリティ上のリスクが特定された開発業務及び特定されたリスクについて，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたリスクに対してどのような運営面の予防策をどのように立案したか。また，立案した予防策をどのようにメンバに周知したか。重要と考えた点を中心に，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イで述べた予防策をメンバが遵守していることを確認するためのモニタリングの仕組み，及び発見された問題とその対処について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['uncertainty', 'governance', 'project-work'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_cmnt.pdf',
  },
  {
    id: 'H25-PM2-2',
    year: 'H25',
    yearLabel: '平成25（2013）',
    number: 2,
    theme: 'システム開発プロジェクトにおけるトレードオフの解消について',
    setsumons: [
      {
        label: 'ア',
        text:
          'あなたが携わったシステム開発プロジェクトにおけるプロジェクトの概要とプロジェクトの制約条件について，800字以内で述べよ。',
        recommendedChars: { min: 0, max: 800 },
      },
      {
        label: 'イ',
        text:
          '設問アで述べたプロジェクトの遂行中に発生した問題の中で，トレードオフの解消が必要になった問題とそのトレードオフはどのようなものであったか。また，このトレードオフをどのように解消したかについて，工夫した点を含めて，800字以上1,600字以内で具体的に述べよ。',
        recommendedChars: { min: 800, max: 1600 },
      },
      {
        label: 'ウ',
        text:
          '設問イのトレードオフの解消策に対する評価，残された問題，その解決方針について，600字以上1,200字以内で具体的に述べよ。',
        recommendedChars: { min: 600, max: 1200 },
      },
    ],
    categoryIds: ['integration', 'planning', 'uncertainty', 'stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_qs.pdf',
    answerPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_ans.pdf',
    commentaryPdfUrl: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_pm2_cmnt.pdf',
  },
]

/** ID で問題取得 */
export function getEssayProblemById(id: string): EssayProblem | undefined {
  return essayProblems.find((p) => p.id === id)
}
