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
]

/** ID で問題取得 */
export function getEssayProblemById(id: string): EssayProblem | undefined {
  return essayProblems.find((p) => p.id === id)
}
