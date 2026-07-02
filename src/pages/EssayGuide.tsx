import { Link } from 'react-router-dom'

/**
 * 論述ガイド（/essay/guide）
 *
 * 午後II（論述式）の演習を始める前に読む「良い論述を書くためのコツ」ページ。
 * - §1 出題方式（120分・2問中1問選択・設問ア/イ/ウの字数）
 * - §2 採点のしくみ（A〜D評価・IPA公表の評価項目・評価を下げる要因）
 * - §3 高評価の7原則
 * - §4 インフラエンジニアがPM目線で題材化するコツ（作業者目線→PM目線の変換）
 * - §5 試験当日120分の時間配分
 * - §6 よくあるNGパターン
 * - §7 本アプリでの学習手順（参考答案→骨子→全文→自己評価5項目）
 *
 * 一覧画面（/essay）ヘッダー直下の「はじめにお読みください」カードから遷移する。
 */

// ── §1 設問構成 ─────────────────────────────────────────
const SETSUMON_FORMAT = [
  {
    label: 'ア',
    chars: '800字以内',
    role: 'プロジェクトの特徴・背景',
    detail: '論述の舞台となるプロジェクトの概要と、テーマに関わる特徴・制約を設定する「状況説明」。イ・ウの伏線をここで張る。',
  },
  {
    label: 'イ',
    chars: '800字以上 1,600字以内',
    role: 'あなたの施策（論文の主役）',
    detail: '課題に対して、PMとして何を考え、何を判断し、どう行動したか。工夫と理由を最も厚く書く。合否はほぼここで決まる。',
  },
  {
    label: 'ウ',
    chars: '600字以上 1,200字以内',
    role: '結果・評価・改善',
    detail: 'イの施策の結果と、それに対する評価・反省・今後の改善。うまくいった点だけでなく課題も述べると深みが出る。',
  },
]

// ── §2 評価ランク ───────────────────────────────────────
const RANKS = [
  { rank: 'A', desc: '合格水準にある', pass: true },
  { rank: 'B', desc: '合格水準まであと一歩である', pass: false },
  { rank: 'C', desc: '内容が不十分である', pass: false },
  { rank: 'D', desc: '内容が著しく不十分である', pass: false },
]

// IPA が問題冊子で公表している論述式試験の評価項目
const EVAL_ITEMS_CONTENT = ['設問で要求した項目の充足度', '論述の具体性', '内容の妥当性', '論理の一貫性']
const EVAL_ITEMS_ABILITY = ['見識に基づく主張', '洞察力・行動力', '独創性・先見性', '表現力・文章作成能力']

const RANK_DOWN_FACTORS = [
  '規定字数に達していない（設問イ・ウの下限割れは致命傷）',
  '設問で要求された項目の一部に答えていない',
  '問題文の趣旨から逸脱している（用意した論文の丸写しなど）',
  '「プロジェクトの概要」（質問書）の記入内容と本文が矛盾している',
  '一般論・教科書的な解説に終始し、自分の行動が書かれていない',
]

// ── §3 高評価の7原則 ────────────────────────────────────
const PRINCIPLES = [
  {
    title: '設問文を分解し、要求項目をすべて見出しにする',
    body: '設問文には「〜、〜、及び〜について述べよ」と要求項目が列挙されている。これを分解して「1.1 ／ 1.2 …」の章立てに変換すれば、書き漏らし（充足度の減点）を防ぎ、採点者も探しやすい。',
  },
  {
    title: '問題文（趣旨）のキーワードを論文に反映する',
    body: '問題文の前半には出題者が期待する進め方・観点が書かれている。そこに登場する言葉（例:「ステークホルダと合意」「モニタリング」）を自分の論述にも使うと、題意適合が明確に伝わる。',
  },
  {
    title: '「私は」を主語に、判断・行動・理由をセットで書く',
    body: '「〜が実施された」「チームで対応した」ではPMの能力が伝わらない。「私は〜と考え、〜と判断し、〜を指示した。なぜなら〜」の形で、意思決定の主体が自分であることを示す。',
  },
  {
    title: '数値で具体化する',
    body: '期間・要員数・金額・工数・遅延日数・削減率など、数値が入ると一気に「実体験らしさ」が出る。「大規模な」ではなく「開発工数120人月、期間10か月、要員最大15名」のように書く。',
  },
  {
    title: '施策には「理由」と「工夫」を添える',
    body: '施策の羅列は教科書と同じ。なぜその施策を選んだのか（プロジェクトの特徴との関係）、標準のやり方にどんな独自の工夫を加えたのかを書くと、見識・独創性の評価につながる。',
  },
  {
    title: 'ア→イ→ウを1本のストーリーとして一貫させる',
    body: 'アで述べた特徴や制約が、イの施策の理由になり、ウの評価につながる構成にする。アで書いた特徴がイで一度も使われないなら、その特徴は書き直した方がよい。',
  },
  {
    title: '結論を先に、1文を短く',
    body: '手書きの長文でも読みやすさは表現力の評価対象。見出し直後に結論を書き、1文は60字程度まで。接続詞（そこで・しかし・その結果）で論理の流れを明示する。',
  },
]

// ── §4 作業者目線→PM目線の変換例 ─────────────────────────
const CONVERSIONS = [
  {
    ng: '私は手順書に従い、深夜作業でサーバを新環境へ切り替えた。',
    ok: '私は切替失敗時の業務影響を最小化するため、利用部門と停止可能時間帯を調整した上で、「切替開始2時間後までに正常性確認が完了しない場合は切り戻す」という判断基準を事前に関係者と合意した。',
    point: '作業の実施ではなく、リスクへの備えと合意形成という「マネジメント行動」を書く',
  },
  {
    ng: '検証環境で移行テストを実施し、問題ないことを確認した。',
    ok: '私は本番同等構成での切替リハーサルを2回計画した。1回目で手順の不備を洗い出して手順書を改訂し、2回目で所要時間を実測して切替当日のタイムチャートの妥当性を検証した。',
    point: 'テストを「品質・スケジュールリスクを下げるための計画的な活動」として位置付ける',
  },
  {
    ng: 'ベンダーに構築を依頼し、完了報告を受けた。',
    ok: '私はベンダーの作業進捗を週次の定例会で成果物ベースで確認し、構築完了率が計画を10%下回った時点で、遅延原因の分析と要員1名の追加をベンダーPMに要請した。',
    point: '丸投げではなく、定量的な進捗把握と早期の是正措置を自分の判断として書く',
  },
]

// インフラ案件の素材 → PM試験テーマへのマッピング
const INFRA_THEME_MAP = [
  { theme: 'スケジュール', infra: 'ハードウェア保守切れ（EOL）や契約満了という「動かせない期限」への対応、機器納期の遅延リスク' },
  { theme: 'コスト', infra: 'クラウド移行での従量課金の見積りの不確かさ、機器調達費の変動、予備費の設定と取り崩しの判断' },
  { theme: '品質', infra: '可用性・性能などの非機能要件の合意、切替リハーサル、並行稼働による段階検証' },
  { theme: 'リスク', infra: '切替失敗と切戻し（フォールバック）計画、データ移行の欠損、旧環境との共存期間のトラブル' },
  { theme: 'ステークホルダー', infra: '利用部門との停止時間調整、運用チームへの引継ぎ、複数ベンダー間の役割分担の調整' },
  { theme: 'チーム・育成', infra: 'ベンダー混成チームの体制づくり、特定有識者への依存の解消、若手メンバーへの技術移転' },
]

// ── §5 当日120分の時間配分 ──────────────────────────────
const TIME_PLAN = [
  {
    time: '0〜5分',
    title: '問題選択',
    detail: '2問の設問イを読み比べ、「イの要求に自分の経験・準備で答えられるか」で選ぶ。テーマの好みではなく書ける方を選ぶ。',
  },
  {
    time: '5〜15分',
    title: '質問書の記入 + 骨子メモ',
    detail: '「プロジェクトの概要」（質問書）を記入し、設問ア・イ・ウそれぞれの見出しと要点を問題冊子の余白にメモする。ここで設計を終えてから書き始める。',
  },
  {
    time: '15〜40分',
    title: '設問ア（〜800字）',
    detail: 'プロジェクトの特徴と制約を、イ・ウの伏線になるように書く。時間をかけすぎない。',
  },
  {
    time: '40〜85分',
    title: '設問イ（800〜1,600字）',
    detail: '論文の主役。判断・行動・理由・工夫を最も厚く。1,000〜1,200字程度を目安に、下限800字は必ず超える。',
  },
  {
    time: '85〜110分',
    title: '設問ウ（600〜1,200字）',
    detail: '結果と評価、今後の改善。イとの対応を確認しながら書く。下限600字を必ず超える。',
  },
  {
    time: '110〜120分',
    title: '見直し',
    detail: '設問の要求項目の書き漏らし、字数、質問書との矛盾、誤字を最終確認する。',
  },
]

// ── §6 書く手順（実例つき）────────────────────────────────
// 実例は本アプリ収録の R6 問1「予測型のシステム開発プロジェクトにおける
// コストのマネジメント」に、クラウド移行案件（§4の題材例）で挑む想定。

// 執筆前に確認する論文の作法
const WRITING_RULES = [
  '文体は「である調」で統一する（ですます調と混在させない）',
  '一人称は「私」。判断の主語を明確にする',
  '見出し（1.1 など）は1行を使って明示する',
  '1文は60字以内を目安に短く切る',
  '略語は初出で定義する（例: プロジェクトマネージャ（以下、PM））',
  '質問書に書いた数値（期間・規模・役割）と本文を一致させる',
]

// STEP 2 骨子メモの実例（問題冊子の余白に書く想定）
const SKELETON_MEMO = [
  { sec: '1.1', memo: 'EC企業A社の基幹システムをクラウドへ移行。10か月・12名・8,000万円。私=SI企業のPM' },
  { sec: '1.2', memo: '経営層の要求=移行後3年で運用費20%減・初年度予算8,000万円厳守' },
  { sec: '1.3', memo: '従量課金が本番負荷に依存し±30%の振れ→計画段階では固定見積りできない' },
  { sec: '1.4', memo: '見積りの前提と振れ幅を数値で提示し、再見積りの時期と予備費の扱いを合意' },
  { sec: '2.1', memo: '予測活動=3段階の実測（PoC→性能試験→先行移行）。A社情シスと役割分担' },
  { sec: '2.2', memo: '再見積り=各段階の完了時。差異が予備費8%以内=PM判断、超過=変更管理委員会' },
  { sec: '3.1', memo: 'PoC完了時の再見積りで月額運用費15%超過が判明（ピーク負荷が想定超え）' },
  { sec: '3.2', memo: 'リザーブド契約+ストレージ階層化で3%まで圧縮→経営層に報告し承認' },
]

// STEP 6 提出前チェックリスト
const FINAL_CHECKS = [
  '設問の要求項目が、すべて見出しと本文に対応している',
  '字数: ア700字前後 / イ800字超 / ウ600字超（下限は絶対）',
  '質問書と本文の数値（期間・規模・役割）が一致している',
  '各施策に「私は〜と考えた」という判断の文が入っている',
  '数値が論文全体で5か所以上ある',
  '文体が「である調」で統一されている',
]

// ── §7 よくあるNG ──────────────────────────────────────
const NG_PATTERNS = [
  {
    ng: '一般論・教科書の解説に終始する',
    fix: '「EVMとは〜である」のような知識の説明は評価されない。知識は「私はこう使った」という行動の形で示す。',
  },
  {
    ng: '設問の要求項目を取りこぼす',
    fix: '設問文の「〜、〜、及び〜」に下線を引いて番号を振り、全項目を見出しに対応させてから書き始める。',
  },
  {
    ng: '字数の下限に届かない',
    fix: '設問イ800字・ウ600字の下限割れは、内容以前に評価を大きく下げる。施策の理由・工夫・具体例で厚みを出す。',
  },
  {
    ng: '時系列の作業報告になる',
    fix: '「4月に〜した。5月に〜した」の事実列挙ではなく、「課題 → 私の判断 → 行動 → 結果」の因果で構成する。',
  },
  {
    ng: '技術詳細に潜りすぎる',
    fix: '機器の型番・パラメータ設定・コマンドの話はPMの論文には不要。技術は「判断の材料」として一言で触れる程度にする。',
  },
  {
    ng: '準備した論文をそのまま書き写す',
    fix: '事前準備は「部品」として使い、当日の設問の言葉に合わせて組み替える。題意とズレた完成論文は趣旨逸脱でC評価に直結する。',
  },
]

// ── §8 このアプリでの学習手順 ────────────────────────────
const APP_STEPS = [
  {
    step: '1',
    title: '参考答案を読んで「合格レベルの型」を知る',
    detail: '一覧画面の「📝 参考答案」から、章立て・数値の入れ方・私を主語にした書き方を観察する。まず2〜3本読むと基準ができる。',
  },
  {
    step: '2',
    title: '骨子だけ作る練習（30分）',
    detail: 'いきなり全文を書かず、設問ア・イ・ウの見出しと要点だけを作る練習を繰り返す。骨子が15分で組めるようになると本番が安定する。',
  },
  {
    step: '3',
    title: 'タイマーを使って全文を書き切る（120分）',
    detail: '練習画面のタイマーと字数カウンタで、時間感覚と字数感覚を体に入れる。本番は手書きなので、仕上げ期には紙に書く練習も挟む。',
  },
  {
    step: '4',
    title: '自己評価5項目で振り返る',
    detail: '保存時の自己評価（題意適合・構造・具体性・一貫性・字数達成）を付け、参考答案と見比べて弱点を特定する。',
  },
  {
    step: '5',
    title: '別テーマで繰り返し、「部品」を蓄積する',
    detail: 'プロジェクト概要・体制・リスク対応・進捗管理などの部品は複数テーマで使い回せる。周回するほど当日の組み立てが速くなる。',
  },
]

// ── 小物コンポーネント ───────────────────────────────────
function SectionCard({ id, num, title, sub, children }: {
  id: string
  num: string
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="bg-white border border-slate-200 rounded-xl px-4 py-4 scroll-mt-16">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand text-white text-sm font-black flex items-center justify-center">
          {num}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-900 leading-snug">{title}</h2>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

// §6 の手順ステップ（番号＋時間帯つきカード）
function StepBlock({ step, time, title, children }: {
  step: string
  time: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand text-white text-xs font-black flex items-center justify-center">
          {step}
        </span>
        <p className="text-sm font-bold text-slate-800 leading-snug">{title}</p>
        <span className="ml-auto flex-shrink-0 text-[10px] font-bold text-slate-400 whitespace-nowrap">{time}</span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  )
}

// §6 の実例・実文例ボックス
function ExampleBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-lg bg-brand-light/60 border border-brand/20 px-3 py-2.5">
      <p className="text-[10px] font-black text-brand-dark mb-1.5">✍ {label}</p>
      {children}
    </div>
  )
}

export default function EssayGuide() {
  const toc = [
    { href: '#format', label: '§1 出題方式' },
    { href: '#scoring', label: '§2 採点のしくみ' },
    { href: '#principles', label: '§3 高評価の7原則' },
    { href: '#infra', label: '§4 インフラ経験をPM目線に変換する' },
    { href: '#timeplan', label: '§5 当日120分の使い方' },
    { href: '#write-steps', label: '§6 書く手順（実例つき）' },
    { href: '#ng', label: '§7 よくあるNG' },
    { href: '#steps', label: '§8 このアプリでの学習手順' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4 space-y-4">

        {/* Header */}
        <header className="rounded-xl bg-brand text-white px-4 py-4 shadow-md">
          <p className="text-[10px] font-bold tracking-wide text-white/70">論述トレーニング GUIDE</p>
          <h1 className="text-lg font-black leading-snug mt-0.5">良い論述を書くためのコツ</h1>
          <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
            午後IIは知識ではなく「PMとしての経験と考え」を文章で示す試験です。
            出題方式と採点のしくみを知り、正しい型で練習すれば、実務でPM経験がなくてもA評価は狙えます。
            演習を始める前に一読してください。
          </p>
        </header>

        {/* 目次 */}
        <nav aria-label="目次" className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 mb-1.5">目次</p>
          <ul className="flex flex-wrap gap-1.5">
            {toc.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="inline-block text-[11px] font-bold text-brand-dark bg-brand-light rounded-full px-2.5 py-1 hover:bg-brand hover:text-white transition-colors"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* §1 出題方式 */}
        <SectionCard id="format" num="1" title="出題方式を知る" sub="120分・2問中1問選択・合計2,200〜3,600字の手書き論述">
          <ul className="text-xs text-slate-600 leading-relaxed space-y-1 mb-3">
            <li className="flex gap-2"><span className="text-brand font-bold flex-shrink-0">・</span><span>試験時間は<span className="font-bold text-slate-800">120分</span>。2問出題され、<span className="font-bold text-slate-800">1問を選択</span>して論述する。</span></li>
            <li className="flex gap-2"><span className="text-brand font-bold flex-shrink-0">・</span><span>解答は原稿用紙形式の解答用紙に<span className="font-bold text-slate-800">手書き</span>。本文とは別に、冒頭で「<span className="font-bold text-slate-800">論述の対象とするプロジェクトの概要</span>」（質問書）に記入する。</span></li>
            <li className="flex gap-2"><span className="text-brand font-bold flex-shrink-0">・</span><span>問題は「問題文（趣旨）＋設問ア・イ・ウ」で構成され、<span className="font-bold text-slate-800">あなたの経験と考え</span>に基づいて論述することが求められる。</span></li>
          </ul>
          <div className="space-y-2">
            {SETSUMON_FORMAT.map((s) => (
              <div key={s.label} className="border border-slate-200 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-md bg-brand-light text-brand-darker text-xs font-black flex items-center justify-center flex-shrink-0">{s.label}</span>
                  <span className="text-sm font-bold text-slate-800">{s.role}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap ml-auto">{s.chars}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{s.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
            ※ ア＝状況設定、イ＝施策、ウ＝結果と評価。この「ア・イ・ウの型」はどの年度・テーマでも共通です。
          </p>
        </SectionCard>

        {/* §2 採点のしくみ */}
        <SectionCard id="scoring" num="2" title="採点のしくみ" sub="A〜Dの4段階評価。A評価のみ合格">
          {/* ランク表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
            {RANKS.map((r) => (
              <div
                key={r.rank}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
                  r.pass ? 'border-brand bg-brand-light' : 'border-slate-200 bg-white'
                }`}
              >
                <span className={`w-7 h-7 rounded-full text-sm font-black flex items-center justify-center flex-shrink-0 ${
                  r.pass ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {r.rank}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 leading-snug">{r.desc}</p>
                  {r.pass && <p className="text-[10px] font-bold text-brand-dark">→ 合格</p>}
                </div>
              </div>
            ))}
          </div>

          {/* 評価項目 */}
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            IPAは問題冊子で、論述を次の項目で評価すると公表しています。前半4つは「書き方の技術」でカバーでき、
            後半4つは「PMらしい考え方」を示せるかで決まります。
          </p>
          <div className="space-y-2 mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-1">内容面（型で対策できる）</p>
              <div className="flex flex-wrap gap-1.5">
                {EVAL_ITEMS_CONTENT.map((e) => (
                  <span key={e} className="text-[11px] font-bold text-brand-darker bg-brand-light rounded-full px-2.5 py-1">{e}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-1">能力面（PMらしさを示す）</p>
              <div className="flex flex-wrap gap-1.5">
                {EVAL_ITEMS_ABILITY.map((e) => (
                  <span key={e} className="text-[11px] font-bold text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 評価を下げる要因 */}
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p className="text-xs font-bold text-rose-700 mb-1.5">評価を下げる主な要因</p>
            <ul className="space-y-1">
              {RANK_DOWN_FACTORS.map((f) => (
                <li key={f} className="flex gap-2 text-[11px] text-rose-800/80 leading-relaxed">
                  <span className="flex-shrink-0 font-bold">✕</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
            ※ 逆に言えば、「設問に全部答える・字数を満たす・具体的に書く・矛盾させない」だけでB以上が見えてきます。
            採点は減点合戦ではなく、<span className="font-bold text-slate-500">PMとしての能力・経験が伝わるか</span>の確認です。
          </p>
        </SectionCard>

        {/* §3 高評価の7原則 */}
        <SectionCard id="principles" num="3" title="高評価の7原則" sub="A評価答案に共通する書き方">
          <ol className="space-y-2.5">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="flex gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-brand text-brand text-xs font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-snug">{p.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* §4 インフラ経験をPM目線に変換する */}
        <SectionCard
          id="infra"
          num="4"
          title="インフラ経験をPM目線に変換する"
          sub="経験の浅いインフラエンジニアが題材を作るコツ"
        >
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            「開発PMの経験がないと書けない」は誤解です。サーバ・ネットワーク更改、クラウド移行、基盤構築などの
            インフラ案件は、<span className="font-bold text-slate-800">動かせない期限・切替リスク・多数の関係者調整</span>という
            PM論点の宝庫であり、要件定義から移行まで工程をもつ立派な「システム開発プロジェクト」として論述できます。
            大切なのは題材の派手さではなく、<span className="font-bold text-slate-800">PMの椅子から見て書くこと</span>です。
          </p>

          {/* 最大の罠: 作業者目線 */}
          <p className="text-sm font-bold text-slate-800 mb-1.5">最大の罠は「作業者目線」</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            採点者が見たいのは、作業の内容ではなくマネジメントの中身です。同じ経験でも、書き方で評価は一変します。
          </p>
          <div className="space-y-2 mb-4">
            {CONVERSIONS.map((c) => (
              <div key={c.point} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-black text-rose-500 mr-1">✕</span>{c.ng}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-black text-brand mr-1">◯</span>{c.ok}
                  </p>
                  <p className="text-[10px] font-bold text-brand-dark mt-1.5">💡 {c.point}</p>
                </div>
              </div>
            ))}
          </div>

          {/* テーママッピング */}
          <p className="text-sm font-bold text-slate-800 mb-1.5">インフラ案件の素材は全テーマに変換できる</p>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 mb-4">
            {INFRA_THEME_MAP.map((m) => (
              <div key={m.theme} className="px-3 py-2 flex gap-3 items-start">
                <span className="flex-shrink-0 w-28 text-[11px] font-bold text-brand-darker bg-brand-light rounded px-1.5 py-0.5 text-center mt-0.5">
                  {m.theme}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed min-w-0">{m.infra}</p>
              </div>
            ))}
          </div>

          {/* 1年目の戦い方 */}
          <p className="text-sm font-bold text-slate-800 mb-1.5">経験1年目の戦い方</p>
          <ul className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <li className="flex gap-2">
              <span className="text-brand font-bold flex-shrink-0">・</span>
              <span><span className="font-bold text-slate-800">自分が参加した案件を「PMの椅子」から見直す。</span>PM・リーダーが何を判断し、誰と何を調整していたかを観察・質問し、その判断を自分の一人称で語れるように再構成する。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold flex-shrink-0">・</span>
              <span><span className="font-bold text-slate-800">モデルプロジェクトを1本用意する。</span>期間6か月〜1年・要員10名前後・費用数千万円〜1億円程度の中規模案件が、質問書とも整合させやすく破綻しにくい。これを核に、テーマに応じて細部を組み替える。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold flex-shrink-0">・</span>
              <span><span className="font-bold text-slate-800">立場は「プロジェクトマネージャとして」書き切る。</span>試験で問われるのは肩書ではなくマネジメント行動の中身。遠慮して「補助として〜」と書くと、判断の主体が曖昧になり評価されない。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold flex-shrink-0">・</span>
              <span><span className="font-bold text-slate-800">技術詳細に逃げない。</span>製品名・パラメータ・コマンドを書きたくなったら黄色信号。技術は判断の材料として一言で触れ、紙面は判断・調整・管理に使う。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold flex-shrink-0">・</span>
              <span><span className="font-bold text-slate-800">数値はメモ帳に「相場表」を作って覚える。</span>工数（人月）・期間・要員数・予備費率・レビュー指摘密度など、自分のモデルプロジェクトの数値を固定しておくと、当日迷わず矛盾も生まれない。</span>
            </li>
          </ul>
        </SectionCard>

        {/* §5 当日120分の使い方 */}
        <SectionCard id="timeplan" num="5" title="試験当日 120分の使い方" sub="書き始める前に設計する。時間配分は目安">
          <ol className="relative border-l-2 border-brand/25 ml-3 space-y-3 py-1">
            {TIME_PLAN.map((t) => (
              <li key={t.time} className="ml-4 relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-brand border-2 border-white" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black text-brand-dark bg-brand-light rounded px-1.5 py-0.5 whitespace-nowrap tabular-nums">{t.time}</span>
                  <span className="text-sm font-bold text-slate-800">{t.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.detail}</p>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
            ※ 最重要は「5〜15分の骨子設計」。ここを削って書き始めると、途中で話が破綻して書き直す方が高くつきます。
            残り時間が苦しくても、イ・ウの<span className="font-bold text-slate-500">字数下限だけは死守</span>してください。
            各時間帯で実際に何をどう書くかは、次の§6で実例つきで分解します。
          </p>
        </SectionCard>

        {/* §6 書く手順（実例つき） */}
        <SectionCard
          id="write-steps"
          num="6"
          title="書く手順を実例で分解する"
          sub="令和6年 問1「コストのマネジメント」×クラウド移行案件の通し実例"
        >
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            §5の時間割の中で実際に手を動かす作業を、STEP 1〜6に分解します。実例は、本アプリ収録の
            <span className="font-bold text-slate-800">令和6年 問1（予測型プロジェクトのコストのマネジメント）</span>に、
            §4の題材例である<span className="font-bold text-slate-800">クラウド移行案件</span>で挑む想定です。
            問題が変わっても手順は同じです。
          </p>

          <div className="space-y-3">
            {/* STEP 1 */}
            <StepBlock step="1" time="開始〜10分" title="設問文を分解して章立てを作る">
              <p className="text-xs text-slate-600 leading-relaxed">
                設問文を読点と「及び」で区切って要求項目に①②…と番号を振り、
                <span className="font-bold text-slate-800">要求項目1つ＝節（見出し）1つ</span>に変換する。
                設問ア＝第1章、イ＝第2章、ウ＝第3章。見出しは設問の言葉をほぼそのまま使ってよい
                （採点者が要求との対応を確認しやすくなる）。
              </p>
              <ExampleBox label="実例 — 設問アを分解して章立てへ">
                <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                  令和6年 問1の設問アの要求は、①予算を含むステークホルダのコストに関する要求事項 /
                  ②不確かさ、及びそれがコストの見積りに与える影響 /
                  ③影響についての認識を共有するために実施したこと、の3つに分解できる。
                  これに「プロジェクトの概要」（設問に明示されなくても冒頭に必須）を加えて章立てにする。
                </p>
                <div className="bg-white border border-slate-200 rounded px-3 py-2 text-[11px] text-slate-700 leading-relaxed">
                  <p className="font-bold">第1章　プロジェクトの特徴とコストに関する要求事項</p>
                  <p>　1.1　プロジェクトの特徴 <span className="text-slate-400">← 概要＋テーマの伏線</span></p>
                  <p>　1.2　コストに関する要求事項 <span className="text-slate-400">← ①</span></p>
                  <p>　1.3　不確かさとコスト見積りへの影響 <span className="text-slate-400">← ②</span></p>
                  <p>　1.4　認識の共有のために実施したこと <span className="text-slate-400">← ③</span></p>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                  同様に、イ（計画段階で合意した4点）は「2.1 予測活動の計画と協力の内容 /
                  2.2 再見積りの条件と差異への対応方針」、ウ（実行段階）は
                  「3.1 再見積りの実施と差異の内容 / 3.2 差異への対応策と承認」へ振り分ける。
                </p>
              </ExampleBox>
            </StepBlock>

            {/* STEP 2 */}
            <StepBlock step="2" time="〜15分" title="各節に「結論1行＋数値」の骨子メモを書く">
              <p className="text-xs text-slate-600 leading-relaxed">
                文章にせず、キーワードと数値だけで各節の結論をメモする。これが論文の設計図。
                <span className="font-bold text-slate-800">埋まらない節がある＝その題材では書けない</span>ということなので、
                この時点で題材の細部（または選択する問題）を調整する。書き始めてからの破綻を防ぐ最重要ステップ。
              </p>
              <ExampleBox label="実例 — 骨子メモ（問題冊子の余白に書く想定）">
                <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100">
                  {SKELETON_MEMO.map((m) => (
                    <div key={m.sec} className="flex gap-2 px-2.5 py-1.5 items-start">
                      <span className="flex-shrink-0 w-8 text-[11px] font-black text-brand-dark tabular-nums">{m.sec}</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed min-w-0">{m.memo}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                  ここまでできれば、残りは「メモを日本語の文章にする」作業になる。
                  質問書（プロジェクトの概要）も 1.1 のメモと同じ数値で記入し、本文との矛盾を防ぐ。
                </p>
              </ExampleBox>
            </StepBlock>

            {/* 執筆の作法 */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-bold text-slate-700 mb-1.5">✒ 執筆前に確認 — 論文の作法</p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {WRITING_RULES.map((r) => (
                  <li key={r} className="flex gap-1.5 text-[11px] text-slate-600 leading-relaxed">
                    <span className="text-brand font-bold flex-shrink-0">・</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* STEP 3 */}
            <StepBlock step="3" time="15〜40分" title="設問ア — 概要と「イの伏線」を書く">
              <p className="text-xs text-slate-600 leading-relaxed">
                1.1は「業種と事業規模 → プロジェクトの目的 → 規模数値（期間・要員・費用）→ 私の立場 →
                テーマに関わる特徴（イの伏線）」の順で書くと自然にまとまる。
                字数配分の目安は、1.1に300字前後、1.2〜1.4に各150〜200字で計700〜800字。
              </p>
              <ExampleBox label="実文例 — 1.1 プロジェクトの特徴（冒頭）">
                <div className="bg-white border border-slate-200 rounded px-3 py-2 text-[11px] text-slate-700 leading-relaxed space-y-1">
                  <p>　A社は年商300億円規模の消費財ECを営む企業である。A社では基幹システムの老朽化を契機に、オンプレミス環境からパブリッククラウドへ移行するプロジェクトを立ち上げた。期間は10か月、要員は最大12名、予算は8,000万円であり、私はSI企業B社に所属するプロジェクトマネージャ（以下、PM）として、本プロジェクトのマネジメント全般を担った。</p>
                  <p>　本プロジェクトの特徴は、移行後の運用費が従量課金であり、本番稼働時の負荷が確定しない計画段階では、コストの見積りに大きな不確かさを含むことであった。</p>
                </div>
                <p className="text-[10px] font-bold text-brand-dark mt-1.5">
                  💡 この2段落で「業種・目的・数値・立場・テーマの伏線」がすべて入る。最後の1文が第2章の施策の理由付けになる。
                </p>
              </ExampleBox>
            </StepBlock>

            {/* STEP 4 */}
            <StepBlock step="4" time="40〜85分" title="設問イ — 「課題→判断→実施→工夫」で書く">
              <p className="text-xs text-slate-600 leading-relaxed">
                イの各節は「①課題の提示 → ②私の判断とその理由（私は〜と考えた）→ ③実施内容（具体的・数値入り）→
                ④独自の工夫」の4段構成で書く。1施策あたり400〜600字、2本柱＋導入で1,000〜1,200字が目安。
                <span className="font-bold text-slate-800">工夫を1施策に1つ</span>入れることが、独創性・見識の得点源になる。
              </p>
              <ExampleBox label="実文例 — 2.1 予測活動の計画（抜粋）">
                <div className="bg-white border border-slate-200 rounded px-3 py-2 text-[11px] text-slate-700 leading-relaxed space-y-1">
                  <p>　計画段階の最大の課題は、従量課金の振れ幅±30%をどう縮小するかであった。私は、机上の試算を重ねるより実測に基づいて精度を上げるべきだと考え、予測活動として3段階の実測を計画した。具体的には、(1)主要3機能のPoCで単位負荷当たりの課金額を実測する、(2)性能試験で本番相当のピーク負荷を再現して月額に換算する、(3)先行移行した1業務の実課金で検証する、というものである。</p>
                  <p>　さらに私は、実測値をそのまま用いない工夫として、A社の販売計画に基づく負荷の季節変動（最繁忙月は平均月の1.8倍）を加味した補正式をA社情報システム部と共同で作成し、再見積りの根拠とすることにした。</p>
                </div>
                <p className="text-[10px] font-bold text-brand-dark mt-1.5">
                  💡 1段落目＝課題→判断→実施、2段落目＝工夫。「私は〜と考え」「工夫として」が、判断力・独創性を採点者に示す目印になる。
                </p>
              </ExampleBox>
            </StepBlock>

            {/* STEP 5 */}
            <StepBlock step="5" time="85〜110分" title="設問ウ — 結果は数値で着地させる">
              <p className="text-xs text-slate-600 leading-relaxed">
                ウは「実施したこと → 結果（数値）→ 締め」。アで設定した数値（予算・期限）に対して
                どう着地したかを必ず数値で示す。目安は700〜900字。
              </p>
              <ExampleBox label="実文例 — 3.2 差異への対応策と承認（抜粋）">
                <div className="bg-white border border-slate-200 rounded px-3 py-2 text-[11px] text-slate-700 leading-relaxed space-y-1">
                  <p>　私は対応方針に沿って対応策を作成した。具体的には、稼働が安定した基盤部分に1年間のリザーブド契約を適用し、アクセス頻度の低いデータを低価格のストレージ階層へ移す設計変更によって、15%の超過を予備費8%の範囲内である3%まで圧縮した。私はこの対応策を再見積りの結果とともに経営層に報告し、承認を得た。最終的に、本プロジェクトは予算8,000万円の範囲内で移行を完了した。</p>
                </div>
                <p className="text-[10px] font-bold text-brand-dark mt-1.5">
                  💡 年度によっては設問ウで「評価」「今後の改善」まで要求される。その場合は
                  「〜が有効に機能したと評価している。一方で〜という課題が残った。今後は〜したい」の型で締める。
                </p>
              </ExampleBox>
            </StepBlock>

            {/* STEP 6 */}
            <StepBlock step="6" time="110〜120分" title="提出前チェック">
              <ul className="space-y-1.5">
                {FINAL_CHECKS.map((c) => (
                  <li key={c} className="flex gap-2 items-start text-xs text-slate-600 leading-relaxed">
                    <span className="flex-shrink-0 w-3.5 h-3.5 mt-0.5 rounded-sm border-2 border-brand" aria-hidden="true" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </StepBlock>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
            ※ 本番で最も差がつくのはSTEP 1〜2です。この2ステップだけを15分で回す練習（§8の骨子練習）を繰り返すと、
            どのテーマが来ても「メモを日本語にするだけ」の状態で書き始められるようになります。
          </p>
        </SectionCard>

        {/* §7 よくあるNG */}
        <SectionCard id="ng" num="7" title="よくあるNGと処方箋" sub="不合格答案の典型パターン">
          <div className="space-y-2">
            {NG_PATTERNS.map((n) => (
              <div key={n.ng} className="border border-slate-200 rounded-lg px-3 py-2.5">
                <p className="text-xs font-bold text-rose-600 leading-snug">✕ {n.ng}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1"><span className="font-bold text-brand-dark">→ </span>{n.fix}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* §8 このアプリでの学習手順 */}
        <SectionCard id="steps" num="8" title="このアプリでの学習手順" sub="参考答案 → 骨子 → 全文 → 自己評価 → 周回">
          <ol className="space-y-2.5 mb-3">
            {APP_STEPS.map((s) => (
              <li key={s.step} className="flex gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand text-white text-xs font-black flex items-center justify-center mt-0.5">
                  {s.step}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-snug">{s.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ※ 自己評価の5項目（題意適合・構造・具体性・一貫性・字数達成）は、§2の評価項目のうち
            「型で対策できる内容面」に対応しています。まずこの5つを安定させることがA評価への最短路です。
          </p>
        </SectionCard>

        {/* CTA */}
        <div className="rounded-xl bg-brand-light border border-brand/30 px-4 py-4 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 leading-relaxed">
            コツは掴めましたか？<br className="sm:hidden" />
            まずは参考答案を1本読むところから始めましょう。
          </p>
          <Link
            to="/essay"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark transition-colors"
          >
            論述トレーニングを始める →
          </Link>
        </div>

      </div>
    </div>
  )
}
