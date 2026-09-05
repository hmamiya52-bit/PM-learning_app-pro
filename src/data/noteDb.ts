// ─────────────────────────────────────────────
// ノートコンテンツ静的データ（PM 12カテゴリ）
//
// 2026-07-20: NoteDetail.tsx（約5,900行）から機械的に分離。
// コンポーネント編集時の事故リスク低減と、将来のカテゴリ別 lazy load への布石。
// データ内容・セクション構成は分離前と一字一句同一（理解度記録が
// categoryId:sectionIndex キーで保存されるため、順序・件数の変更は破壊的）。
//
// NOTE_DB / NOTE_CATEGORY_IDS / NOTE_SECTION_INDEX は既存 import 互換のため
// NoteDetail.tsx からも re-export している。
// ─────────────────────────────────────────────
import type { QuestionFigure } from '../types'

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
// 強調トークン（記号マークアップ廃止のための構造化データ）
export type EmphasisStyle = 'red' | 'navy' | 'plain'
export interface EmphasisToken {
  text: string
  style: EmphasisStyle
}

// ヘッダ構成図（HTML表＋色分け＋赤字隠し対応）
export interface HeaderDiagramCell {
  label: string
  span?: number          // colspan（既定 1）
  bg?: string            // 背景色（CSS color string）
  isRed?: boolean        // ラベルを赤字＋マスク対象にする
  maskDigits?: boolean   // ラベル内の数字だけ赤字＋マスク対象（記号や単位は残す）
  small?: boolean        // 小さめのフォント
}
export interface HeaderDiagramRow {
  cells: HeaderDiagramCell[]
}
export interface HeaderDiagram {
  title: string
  rows: HeaderDiagramRow[]
  caption?: string       // 図の下に表示する補足
  totalCols?: number     // テーブルの列数（colspan 計算用）
}

export interface NoteSection {
  heading: string
  items?: string[]
  headerDiagrams?: HeaderDiagram[]           // ヘッダ構成図（HTML表）
  navyItems?: EmphasisToken[][]              // ネイビー強調のみで残す既存項目（各セクション末尾）
  figures?: QuestionFigure[]                 // SVG/table 図表（F2-figures で導入。マトリクス/ベン図/キューブ/フロー等）
}

export interface NoteData {
  summary: string
  sections: NoteSection[]
  exam_tips: string[]
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
      'プロジェクトに影響を与える、または影響を受ける個人・組織を識別し、分析・優先順位付け・エンゲージメント計画・監視を行う活動領域。PMBOK第7版では独立したパフォーマンス領域として扱われ、PM試験 午前Ⅱ・午後I 双方で頻出。',
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
        heading: '4. プロジェクトへの関与レベル（関与度）の5段階',
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
          '　__成果1__: ステークホルダーとの==生産的な作業関係==の構築',
          '　__成果2__: ステークホルダーが==プロジェクト目的に合意==している状態',
          '　__成果3__: 利益を受けるステークホルダーが==支持者==となる',
          '　__成果4__: 反対するステークホルダーが==プロジェクトに悪影響を及ぼさない==',
          '活動サイクル: ==識別 → 理解 → 分析 → 優先順位付け → 関与 → 監視==',
          'PMBOK7 では「予測型」「適応型」いずれのライフサイクルでも同じ成果が適用される',
        ],
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
        navyItems: [[{ text: '第6版では 13.1「ステークホルダーの特定」プロセスが対応（立上げプロセス群、§32 参照）', style: 'navy' }]],
      },
      {
        heading: '8. 識別の技法',
        items: [
          '__主要技法__: 質問書・ブレーンストーミング／ステークホルダー分析・文書分析／マッピング（マトリクス・登録簿）／キックオフでの集合的識別',
          '組織図・プロジェクト憲章・調達文書も識別の入力となる',
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
          'コミュニケーション・マネジメント計画の重要な入力となる',
        ],
        navyItems: [[{ text: '登録簿の構成項目・更新タイミングは午前Ⅱ・午後I 双方で頻出', style: 'navy' }]],
      },
      {
        heading: '10. 識別の入力情報',
        items: [
          '__主要インプット__: ==プロジェクト憲章==（スポンサー・主要顧客が記載）／ビジネス文書／合意書・契約書（外部ステークホルダーが規定）／調達文書',
          '過去プロジェクトの登録簿テンプレート・教訓も活用する',
        ],
      },
      {
        heading: '11. 識別漏れのリスクと対策',
        items: [
          '識別漏れの典型例: __間接的影響者__（地域住民・労組）、__規制当局__、__退職予定の現業ユーザ__',
          'リスク: プロジェクト終盤の==スコープ変更要求==・==受入拒否==・__訴訟__',
          '　__対策1__: __複数視点__で識別する（PM・スポンサー・ベテラン・現場の4視点）',
          '　__対策2__: __類似プロジェクトの教訓__を必ず参照する',
          '　__対策3__: ==フェーズゲート==で識別の妥当性をレビューする',
          'IPA午後Ⅰでは「識別漏れの典型シナリオ」が記述問題として頻出',
        ],
      },

      // ── C. 分析・優先順位付け ──
      {
        heading: '12. ステークホルダー分析の目的とアウトプット',
        items: [
          '目的: 関与戦略・コミュニケーション要求の決定根拠を作る。アウトプットは分析マトリクスと優先順位付きリスト',
          '分析手法に__単一の正解はない__。複数手法を組み合わせて多角的に分析する',
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
        figures: [
          {
            type: 'table',
            caption: '権力／影響度グリッド: Power × Influence の4象限',
            headers: ['', '影響力 低', '影響力 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['権力 高', '満足を保つ: 公式権限は高いが波及力は限定的', '緊密に管理: 意思決定権と影響力が高いコア'],
              ['権力 低', '監視: 最小工数で変化を確認', '情報共有: 非公式影響力が高いキーパーソン'],
            ],
          },
        ],
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
        figures: [
          {
            type: 'table',
            caption: '影響／インパクト・マトリクス: 縦軸は Power ではなく Influence',
            headers: ['', 'Impact 低', 'Impact 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['Influence 高', '巻き込み: 変更説明の協力者にする', '重点対応: 影響大かつ他者も動かす'],
              ['Influence 低', '観察: 必要時に情報提供', '個別ケア: 影響を受ける当事者として支援'],
            ],
          },
        ],
      },
      {
        heading: '16. サリエンスモデル（Salience Model）',
        items: [
          '__3つの属性__で分析: Power・Legitimacy・Urgency',
          '　==Power（権力）==: 自分の意思を相手に実行させる能力',
          '　==Legitimacy（合法性／正当性）==: 関与が__社会的に妥当__と認められているか',
          '　==Urgency（緊急性）==: 即時の対応を要求する度合い',
          '3属性のうち__いくつ持つか__でステークホルダーを分類（1属性=Latent、2属性=Expectant、3属性=Definitive）',
          '権力だけでなく__正当性・緊急性__を加えた多次元分析が特徴',
        ],
        navyItems: [[{ text: '3属性すべてを持つ Definitive Stakeholder が最優先対応対象', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'サリエンスモデル: 属性数が多いほど優先度が上がる',
            ariaLabel: 'Power Legitimacy Urgency の3属性でステークホルダーを分類するベン図',
            viewBox: '0 0 640 430',
            content: `
              <defs>
                <style>
                  .salience-power { fill: #fee2e2; stroke: #dc2626; stroke-width: 2; fill-opacity: 0.58; }
                  .salience-legitimacy { fill: #9d5b8b15; stroke: #9d5b8b; stroke-width: 2; fill-opacity: 0.72; }
                  .salience-urgency { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; fill-opacity: 0.62; }
                </style>
              </defs>
              <rect x="18" y="18" width="604" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <text x="320" y="44" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">
                属性数: 1 = Latent / 2 = Expectant / 3 = Definitive
              </text>
              <circle cx="260" cy="170" r="128" class="salience-power" />
              <circle cx="380" cy="170" r="128" class="salience-legitimacy" />
              <circle cx="320" cy="272" r="128" class="salience-urgency" />
              <text x="180" y="86" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Power</text>
              <text x="460" y="86" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Legitimacy</text>
              <text x="320" y="390" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Urgency</text>
              <text x="208" y="160" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="208" dy="0">Latent</tspan><tspan x="208" dy="16">Dormant</tspan>
              </text>
              <text x="432" y="160" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="432" dy="0">Latent</tspan><tspan x="432" dy="16">Discretionary</tspan>
              </text>
              <text x="320" y="342" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Latent</tspan><tspan x="320" dy="16">Demanding</tspan>
              </text>
              <text x="320" y="132" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Expectant</tspan><tspan x="320" dy="16">Dominant</tspan>
              </text>
              <text x="264" y="244" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="264" dy="0">Expectant</tspan><tspan x="264" dy="16">Dangerous</tspan>
              </text>
              <text x="376" y="244" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">
                <tspan x="376" dy="0">Expectant</tspan><tspan x="376" dy="16">Dependent</tspan>
              </text>
              <text x="320" y="204" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="16" font-weight="700" text-anchor="middle">
                <tspan x="320" dy="0">Definitive</tspan><tspan x="320" dy="19">3属性</tspan>
              </text>
            `,
          },
        ],
      },
      {
        heading: '17. 方向性キューブ（Directions of Influence）',
        items: [
          'ステークホルダーをPMから見た__4方向__で分類',
          '　==上方向==（Upward）: 経営層・スポンサー・運営委員会',
          '　==下方向==（Downward）: チームメンバ・専門家',
          '　==外方向==（Outward）: 外部顧客・サプライヤ・規制当局・エンドユーザ',
          '　==横方向==（Sideward）: 他PM・社内同僚・機能部門マネジャー',
          '方向ごとに__コミュニケーション・スタイル__と__説得アプローチ__を変える',
        ],
        figures: [
          {
            type: 'svg',
            caption: '方向性キューブ: PMを中心に影響先を4方向で捉える',
            ariaLabel: 'PMを中心に上方向下方向外方向横方向の4方向ステークホルダーを示す図',
            viewBox: '0 0 640 420',
            content: `
              <defs>
                <marker id="dir-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="604" height="384" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <circle cx="320" cy="210" r="42" fill="#9d5b8b" stroke="white" stroke-width="3" />
              <text x="320" y="216" fill="white" stroke="white" stroke-width="3" paint-order="stroke" font-size="18" font-weight="700" text-anchor="middle">PM</text>
              <line x1="320" y1="166" x2="320" y2="82" stroke="#dc2626" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="320" y1="254" x2="320" y2="338" stroke="#10b981" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="276" y1="210" x2="108" y2="210" stroke="#f59e0b" stroke-width="4" marker-end="url(#dir-arrow)" />
              <line x1="364" y1="210" x2="532" y2="210" stroke="#9d5b8b" stroke-width="4" marker-end="url(#dir-arrow)" />
              <rect x="214" y="44" width="212" height="54" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <rect x="214" y="322" width="212" height="54" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <rect x="36" y="172" width="178" height="76" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="426" y="172" width="178" height="76" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="320" y="66" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Upward</text>
              <text x="320" y="84" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">経営層・スポンサー</text>
              <text x="320" y="344" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Downward</text>
              <text x="320" y="362" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">チーム・専門家</text>
              <text x="125" y="202" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Outward</text>
              <text x="125" y="220" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">顧客・規制当局</text>
              <text x="125" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">サプライヤ</text>
              <text x="515" y="202" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">Sideward</text>
              <text x="515" y="220" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">他PM・同僚</text>
              <text x="515" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">機能部門</text>
            `,
          },
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
        navyItems: [[{ text: '第6版では 13.2 計画／13.4 監視で本マトリクス（ステークホルダー関与評価マトリクス）を使用（§32 参照）', style: 'navy' }]],
      },
      {
        heading: '19. ステークホルダー・エンゲージメント計画書の構造',
        items: [
          '__計画書の主な項目__: 望ましい関与レベルと現状の差分／必要な情報の種類・頻度・配布方法・時間枠',
          '==コミュニケーション・マネジメント計画書==と密接に連動する',
        ],
        navyItems: [[{ text: '第6版では 13.2「エンゲージメントの計画」（計画プロセス群）の主要アウトプット', style: 'navy' }]],
      },
      {
        heading: '20. エンゲージメント戦略の決定要因',
        items: [
          '__決定要因__: ステークホルダーの優先順位／プロジェクトのフェーズ／組織文化／文化的多様性／過去の教訓／チームの能力',
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
          '上記6Wをコミュニケーション・マネジメント計画書に統合する',
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
        navyItems: [[{ text: '第6版では 13.4「エンゲージメントの監視」（監視・コントロール群）が対応', style: 'navy' }]],
      },
      {
        heading: '30. 関与レベルの変化への対応・是正処置',
        items: [
          '関与レベル低下の典型シグナル: __会議欠席__、__レビュー遅延__、__非協力的態度__',
          '　__対応1__: __1on1__で個別ヒアリング、懸念の把握',
          '　__対応2__: __コミュニケーション頻度・内容__の見直し',
          '　__対応3__: __計画への参加__機会を提供（共同設計）',
          '　__対応4__: __スポンサー経由__での働きかけ',
          '是正処置は==ステークホルダー登録簿==に記録し、教訓として保存',
        ],
      },
      {
        heading: '31. 課題ログ／変更要求への連携',
        items: [
          '==課題ログ==（Issue Log）: 発生中の課題を一元管理（責任者・期限・状況）',
          'ステークホルダー起因の課題は==登録簿==にも反映',
          '==変更要求==はステークホルダーの新しい要求・期待から発生することが多い',
          '変更管理委員会（CCB）でステークホルダー視点を考慮した影響評価を実施',
          '承認された変更はコミュニケーション計画・登録簿・分析マトリクスに反映',
        ],
      },

      // ── F+. PMBOK第6版 統合（F2-P0 で追加） ──
      {
        heading: '32. PMBOK第6版「ステークホルダー・マネジメント」知識エリアの4プロセス',
        items: [
          'PMBOK第6版は第13章の知識エリアとして==4プロセス==で整理する。プロセス群所属がひっかけ頻出',
          '__13.1 ステークホルダーの特定__: ==立上げプロセス群==（計画群と誤答しやすい）。主要アウトプットは==ステークホルダー登録簿==',
          '__13.2 エンゲージメントの計画__: 計画プロセス群。主要アウトプットは==エンゲージメント計画書==',
          '__13.3 エンゲージメントのマネジメント__: 実行プロセス群。関与の実践・期待への対応',
          '__13.4 エンゲージメントの監視__: 監視・コントロール群。関与評価マトリクスで現状を評価',
        ],
      },
      {
        heading: '33. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==（49プロセス・ITTO形式）／__第7版__: ==原則ベース==（12原則＋8パフォーマンス領域）',
          '__IPA PM試験__: 午前Ⅱは第6版用語（登録簿・エンゲージメント計画書・13.x）中心。第7版概念（サーバントリーダーシップ・価値実現）も増加',
        ],
      },

      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '34. 過去問頻出論点（午前Ⅱ）',
        items: [
          '==ステークホルダー登録簿==の記載項目（識別情報・評価情報・分類）',
          '==Power/Interest Grid==の象限と対応戦略',
          '==サリエンスモデル==の3属性（Power/Legitimacy/Urgency）',
          '==関与レベル==5段階（不認識〜主導）',
          '==13.1 特定==は立上げプロセス群（プロセス群所属のひっかけ）',
        ],
      },
      {
        heading: '35. IPA PM試験 ひっかけパターン',
        items: [
          '__Influence vs Impact__: 「影響力」と「影響度」を取り違える誤答選択肢に注意',
          '__Power vs Influence__: 公式権威（Power）と非公式影響力（Influence）の区別',
          '__関与レベルの段階__: 「中立」と「支持」、「抵抗」と「不認識」の境界を問う設問',
          '__登録簿 vs 計画書__: ステークホルダー登録簿（識別アウトプット）と==エンゲージメント計画書==（戦略文書）の混同',
          '__プッシュ／プル／インタラクティブ__: それぞれの適用シーンの誤認',
          '__サリエンスモデルの属性数__: 1属性のみ（Latent）と2属性（Expectant）の分類混同',
          '出典の混同: PMBOK第6版（プロセス群）と==第7版==（パフォーマンス領域）の枠組み違い',
        ],
        navyItems: [[{ text: '本アプリは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '36. 午後Ⅰの定石（ステークホルダー）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのステークホルダー系設問は「対立・抵抗・巻き込み不足」の状況に定石を当てはめ、理由を30〜40字で書く。以下を解答の根拠に使う',
          '__1. 全社案件は経営層を後ろ盾に__: 部門をまたぐ協力要請は、経営層の==承認・コミットメント==を先に取り付けトップダウンで通す（R2問1・R4問3）',
          '__2. ステークホルダーは会議体の外まで探す__: 声の大きい出席者だけでなく、影響を受けるのに不在の関係者（他部門・利用部門・規制対応）を洗い出す（H26問1・H25問2）',
          '__3. 影響を受ける人は構想段階から巻き込む__: 完成後に見せると抵抗になる。要件定義・検証へ==早期に参加==させ協働で作る（H28問1・R2問3）',
          '__4. 抵抗には理由のヒアリングから__: キーパーソンの反対は放置せず、==懸念を聞いて解消策を示す==。メリットだけでなく本人の不安に答える（H30問3・H25問3）',
          '__5. 直接説得できない相手は経路を設計__: 本人が信頼する人物（上司・先輩・現場リーダー）==経由で間接的に働きかける==（H27問1）',
          '__6. 会議体の格を合わせる__: 決めたいことに対して==決定権限を持つ人が出る会議体==を設計する。権限のない場で議論しても決まらない（H30問3）',
          '__7. 都合の悪い情報ほど早く開示__: デメリットや遅延予兆を隠すと信頼を失う。==早期の正確な開示==が協力関係の土台（H27問1・H28問2）',
          '__8. 対立部門には共通の利益を示す__: 利害が対立する相手とは、双方が得をする==利害の一致点==を見つけて合意を形成する（H26問1・R4問2）',
          '__9. 経営・出資元の期待はマネジメントする__: 期待を放置すると現場への圧力になる。進め方を説明し==納得を得て==調整する（R5問1）',
          '__10. マルチベンダは境界を共同で確認__: ベンダ間の作業境界の不整合は==共同レビュー==・定例の場で早期に発見する（R3問3・R1問2）',
          '__11. 信頼の役割分担まで設計する__: 誰がどのステークホルダーの信頼を担うかを決めて臨む（R6問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】ステークホルダー登録簿の3区分（識別情報／評価情報／分類）は午前Ⅱ頻出。記載項目を空で言えるレベルまで暗記。',
      '【マトリクス】Power/Interest Grid の4象限と対応戦略（緊密に管理／満足を保つ／情報提供／監視）を図で覚える。',
      '【関与レベル】5段階（不認識→抵抗→中立→支持→主導）と C/D 表記の意味（現状/望ましい状態）を区別。',
      '【サリエンスモデル】3属性（Power/Legitimacy/Urgency）と所持数による分類（Latent=1, Expectant=2, Definitive=3）。',
      '【ひっかけ】Influence と Impact、Power と Influence、登録簿と計画書、13.1 の所属（立上げ群）を正確に。',
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
          'PMBOK第7版「チーム」パフォーマンス領域 = 第6版の==資源マネジメント==知識エリア（旧 人的資源マネジメント・6プロセス）に対応',
          'チームの構築・育成・マネジメント・コンフリクト解決を扱う',
        ],
      },
      {
        heading: '2. チームとグループの違い／プロジェクトチームの構成',
        items: [
          '==グループ==: 共通の目的を持つ個人の集まり。個別の責任で動く',
          '==チーム==: ==共通目標==と==相互依存==を持ち、==共同責任==で動く集団',
          '__専任チーム__（100%割当）と__パートタイムチーム__（機能部門と兼務、マトリクス組織で発生）',
        ],
      },
      {
        heading: '3. リーダーシップとマネジメントの違い',
        items: [
          '==リーダーシップ==: ビジョンを示し人々を動機づける能力。「==正しいことをする==」',
          '==マネジメント==: 計画・組織化・統制で結果を出す能力。「==物事を正しく行う==」',
          'リーダーシップは__役職に依存しない__（メンバーも発揮できる）。PMBOK第7版はリーダーシップを強調',
        ],
      },
      {
        heading: '4. PMBOK第7版 リーダーシップ・スキル',
        items: [
          '__主要スキル__: ビジョン提示／==批判的思考==（仮定を疑い証拠で判断）／モチベーション／対人スキル／==政治的感覚==（利害関係を読み解く）／誠実さと倫理',
          'これらは役割によらずチーム全員に求められる（リーダーシップは分散される）',
        ],
      },
      {
        heading: '5. PMI Talent Triangle — プロジェクトマネージャに求められる役割',
        items: [
          '==PMI Talent Triangle==: PMのコア・コンピテンシーを3軸（テクニカル／リーダーシップ／戦略・ビジネス）で整理し、バランスよく高める',
        ],
      },
      {
        heading: '6. PMBOK第6版と第7版の対応関係（試験での扱い）',
        items: [
          '__第6版__: ==プロセスベース==（49プロセス・ITTO形式）／__第7版__: ==原則ベース==（12原則＋8パフォーマンス領域）',
          '__IPA PM試験__: 午前Ⅱは第6版用語中心。第7版概念（サーバントリーダーシップ・テーラリング）も増加',
        ],
        navyItems: [[{ text: '試験対策上は両版用語の混同が頻出ひっかけ', style: 'navy' }]],
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
          '　__1,1 無関心型__（Impoverished）: 両方低い。最低限の労力',
          '　__9,1 仕事中心型__（Authority-Compliance）: 業績重視・人間軽視',
          '　__1,9 人間中心型__（Country Club）: 人間関係重視・業績軽視',
          '　__5,5 中道型__（Middle-of-the-Road）: 両方そこそこ',
          '　__9,9 チームマネジメント型__（Team Management）: 両方高い。==理想型==',
          '試験ではグリッド座標（例: 9,1）から該当スタイルを答えさせる設問が頻出',
        ],
        navyItems: [[{ text: '英語名は Managerial Grid。Blake & Mouton 1964年提唱', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: 'マネジリアル・グリッド: 人間への関心 × 業績への関心',
            headers: ['', '業績 低', '業績 中', '業績 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['人間 高', '1,9 人間中心型', '', '9,9 チーム型（理想）'],
              ['人間 中', '', '5,5 中道型', ''],
              ['人間 低', '1,1 無関心型', '', '9,1 仕事中心型'],
            ],
          },
        ],
      },
      {
        heading: '9. 状況対応リーダーシップ理論（SL理論：Hersey & Blanchard）',
        items: [
          'メンバーの==成熟度==（Readiness）に応じてリーダーシップ・スタイルを切り替えるべきという理論',
          '4つのスタイル:',
          '　__S1 指示型__（Telling）: 高指示・低支援。未熟なメンバー向け',
          '　__S2 説得型__（Selling／Coaching）: 高指示・高支援。意欲はあるが能力不足',
          '　__S3 参加型__（Participating／Supporting）: 低指示・高支援。能力はあるが意欲不足',
          '　__S4 委任型__（Delegating）: 低指示・低支援。能力・意欲とも高い',
          '成熟度はM1（低）→M4（高）の4段階で評価し、対応するスタイルS1〜S4を選択',
          '==成熟度に応じた柔軟な切替==が本理論の核心',
        ],
        navyItems: [[{ text: 'SL理論=Situational Leadership。Hersey & Blanchard 1969年提唱。試験頻出', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: 'SL理論: 指示度 × 支援度 と M1〜M4 成熟度の対応',
            headers: ['', '指示度 低', '指示度 高'],
            rowHeaderFirstCol: true,
            rows: [
              ['支援度 高', 'S3 参加型: M3 能力あり・意欲不足', 'S2 説得型: M2 意欲あり・能力不足'],
              ['支援度 低', 'S4 委任型: M4 能力・意欲とも高い', 'S1 指示型: M1 未熟'],
            ],
          },
        ],
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
          '　__障害物の除去__（Impediment Removal）: メンバーの作業を阻む要因を取り除く',
          '　__傾聴__（Active Listening）: メンバーの声を聞く',
          '　__エンパワーメント__（Empowerment）: メンバーに権限と責任を委譲',
          '　__成長支援__（Growth Support）: スキル習得・キャリア発展を支援',
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
          '　__生理的欲求__（Physiological）: 食欲・睡眠など生存に直結',
          '　__安全欲求__（Safety）: 身体的・経済的安全',
          '　__社会的欲求__（Belongingness）: 所属感・愛情',
          '　__承認欲求__（Esteem）: 尊敬・自尊心',
          '　__自己実現欲求__（Self-actualization）: 自分らしさの発揮',
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
          '__X理論__（McGregor）: 人間は本来==怠惰==で仕事を嫌う → 監督・統制・罰則が必要',
          '__Y理論__（McGregor）: 人間は==自己実現==を求め能動的に働く → 自主性・参画を促す',
          '__Z理論__（Ouchi）: ==日本型経営==に着想。終身雇用・集団意思決定・人間尊重が特徴',
        ],
      },
      {
        heading: '17. ブルームの期待理論／アダムスの公平理論',
        items: [
          '__期待理論__（Vroom）: 動機づけは ==期待==（Expectancy）×==手段性==（Instrumentality）×==誘意性==（Valence）の積で決まる',
          '　==期待==: 努力すれば成果が出るという見込み',
          '　==手段性==: 成果が報酬につながるという見込み',
          '　==誘意性==: 報酬が魅力的かどうかの主観的価値',
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
          '　__1. 形成期__（Forming）: メンバーが集まり==互いを探り合う==段階。礼儀正しいが==生産性は低い==',
          '　__2. 混乱期__（Storming, ==動乱期==とも訳す）: 役割・価値観・進め方で==コンフリクト==が発生する段階。==最も困難==な時期',
          '　__3. 規範期__（Norming）: 規範・グランドルールが==確立==し協力が始まる',
          '　__4. 遂行期__（Performing）: ==ハイパフォーマンス==で自律的に成果を出す段階',
          '　__5. 解散期__（Adjourning）: プロジェクト終結とともにチームが==解散==、振り返りと祝福',
          '__順序は固定__。スキップ不可。混乱期で適切な対処をしないとチームは機能しない',
          'リーダーは段階に応じて関与レベルを変える（形成期は指示型→遂行期は委任型）',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'タックマンモデル: 5段階の順序と生産性の変化',
            ariaLabel: 'タックマンモデルの形成期から解散期までの5段階と生産性カーブを示す図',
            viewBox: '0 0 720 280',
            content: `
              <defs>
                <marker id="tuckman-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="244" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <path d="M58 220 C128 206, 168 238, 226 216 C288 192, 348 180, 412 148 C476 114, 554 98, 638 132" fill="none" stroke="#9d5b8b" stroke-width="4" />
              <text x="66" y="206" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">生産性</text>
              <line x1="62" y1="150" x2="658" y2="150" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <g>
                <rect x="38" y="68" width="112" height="58" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
                <text x="94" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">1. 形成期</text>
                <text x="94" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Forming</text>
              </g>
              <line x1="154" y1="97" x2="178" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="184" y="68" width="112" height="58" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
                <text x="240" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">2. 混乱期</text>
                <text x="240" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Storming</text>
              </g>
              <line x1="300" y1="97" x2="324" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="330" y="68" width="112" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
                <text x="386" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">3. 規範期</text>
                <text x="386" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Norming</text>
              </g>
              <line x1="446" y1="97" x2="470" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="476" y="68" width="112" height="58" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
                <text x="532" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">4. 遂行期</text>
                <text x="532" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Performing</text>
              </g>
              <line x1="592" y1="97" x2="616" y2="97" stroke="#64748b" stroke-width="2" marker-end="url(#tuckman-arrow)" />
              <g>
                <rect x="622" y="68" width="60" height="58" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
                <text x="652" y="91" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">5. 解散</text>
                <text x="652" y="110" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Adjourn</text>
              </g>
              <text x="240" y="154" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">コンフリクト発生</text>
              <text x="532" y="154" fill="#10b981" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">自律的に成果</text>
            `,
          },
        ],
      },
      {
        heading: '19. チームの編成とチームビルディング',
        items: [
          '__編成__（シラバス 1-5）: 誰を何人集め、どの役割を負わせるかを決める段階。育成より前にここがある',
          '　==役割規定書==: 各メンバーの__役割・責任・権限__を文書で明確にする。__曖昧なまま始めると__責任の押し付け合いが起きる',
          '　__人数の決め方__: 作業量だけでなく、__コミュニケーション経路の数__（n人でn(n-1)/2）が増えることを織り込む。増やすほど調整コストが増える',
          '　__組織横断型チーム__: 部門をまたいで人を集める編成。__縦割りの壁を壊せる__反面、指揮命令系統が二重になりやすい',
          '==チームビルディング==: 集めた個人を__相互に依存して動く集団__に育てる活動。タックマンの各段階（§18）で打ち手が変わる',
          '　形成期は__顔合わせと目的の共有__、混乱期は__対立を表に出して裁く__、規範期は__ルールの明文化__、遂行期は__権限委譲__',
          '==セルフリーダーシップ==: メンバー一人ひとりが__指示を待たず自分で判断して動く__状態。支援型リーダーシップが目指す到達点',
          '　__午後Ⅰで頻出__。「指示待ちのチームを自律型に変える」型の設問では、細かい指示をやめて__判断の基準と裁量を与える__のが解答の方向（R5問1・R4問3・R2問2）',
          '__ハイパフォーマンスチームの特性__（PMBOK7）: オープンなコミュニケーション／共有された理解と当事者意識／信頼／コラボレーション／適応性／==レジリエンス==（回復力）／==エンパワーメント==（権限委譲）／貢献の認知',
        ],
        navyItems: [[{ text: 'シラバスは 1-5「プロジェクトチームの編成」と 3-3「プロジェクトチームの開発」を分けている。集める段階と育てる段階は別物', style: 'navy' }]],
      },
      {
        heading: '20. チーム憲章・グランドルール',
        items: [
          '==チーム憲章==（Team Charter）: チームの価値観・運営ルールを成文化した文書。==資源マネジメント計画==プロセスのアウトプット（9.1）',
          '　記載項目: 価値観／コミュニケーション・ガイドライン／意思決定基準／コンフリクト解決プロセス',
          '==グランドルール==: 日常的な振る舞いの基本ルール（例: 会議は時間通り開始・発言を遮らない）',
          'チーム形成期に==全員参加==で策定することで自主性が生まれる',
        ],
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
          '==バーチャルチーム==（Virtual Team）: 物理的に離れた場所で働くチーム',
          '利点は地理的制約の解消・多様な人材確保。課題はコミュニケーション低下・孤立感・タイムゾーン',
          '__成功要因__: 非同期／同期コミュニケーションの使い分け・ツールの標準化・キックオフ対面で信頼の基盤づくり',
        ],
      },
      {
        heading: '23. PMBOK第6版「チームの育成」プロセス（9.4）',
        items: [
          '==9.4 チームの育成==: ==実行プロセス群==。メンバーのコンピテンシーと相互交流を高めチーム環境を改善する',
          '__代表的な技法__: ==コロケーション==（同じ場所に集める）／==表彰と報奨==／トレーニング／対人スキル',
          '__主要アウトプット__: ==チーム・パフォーマンス評価==',
        ],
        navyItems: [[{ text: '第7版では「チーム」パフォーマンス領域に統合', style: 'navy' }]],
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
          'IPA午前Ⅱ頻出: 弱・均衡・強の特徴一覧',
        ],
      },
      {
        heading: '26. 責任分担マトリクス（RAM）とRACIチャート',
        items: [
          '==RAM==（Responsibility Assignment Matrix, 責任分担マトリクス）: 作業と担当者の対応関係を表で示す（行=WBS要素、列=メンバー、セル=役割）',
          '==RACI==は最も一般的なRAM形式',
          '__R（Responsible, 実行責任）__: ==実際に作業==を行う担当者',
          '__A（Accountable, 説明責任）__: ==最終承認==・==説明責任==を負う者（==1人だけ==）',
          '__C（Consulted, 協議）__: ==助言を求める==専門家。==双方向==コミュニケーション',
          '__I（Informed, 報告先）__: ==結果を報告==される関係者。==一方向==コミュニケーション',
          '==Aは必ず1人==、==R は複数可==。試験頻出ルール',
          '派生形式: ==RACI-VS==（V=Verify、S=Sign-off を追加）／==RASCI==（S=Support）',
        ],
      },
      {
        heading: '27. PMBOK第6版「資源マネジメント計画」プロセス（9.1）',
        items: [
          '==9.1 資源マネジメント計画==: 計画プロセス群。チーム資源と物的資源の見積・獲得・管理の方法を計画する',
          '__主要アウトプット__: ==資源マネジメント計画書==と==チーム憲章==（別アウトプットである点がひっかけ）',
        ],
      },
      {
        heading: '28. PMBOK第6版「活動資源見積もり／資源獲得／資源コントロール」',
        items: [
          '__9.2 活動資源の見積もり__（計画群）: アクティビティに必要な資源の種類と数量を見積もる。アウトプットに==資源ブレークダウン・ストラクチャー==（RBS）',
          '__9.3 資源の獲得__（実行群）: メンバー・施設・設備を獲得。技法に==事前割当==（IPA は ==先行割当て==）・交渉',
          '__9.6 資源のコントロール__（監視・コントロール群）: ==物的資源==のみが対象。チームの監視は==9.5==（この区別がひっかけ頻出）',
        ],
      },
      {
        heading: '29. 要員管理計画・要員育成・キャリア開発',
        items: [
          '__要員管理計画の主要要素__: 要員獲得／参画期間（資源カレンダー）／==要員解放計画==（終結時の復帰計画）／トレーニング／認知と報奨',
          'プロジェクト経験をスキル獲得の場とし、メンバーのキャリアパスを意識した役割割当を行う',
        ],
      },
      {
        heading: '30. PMO の役割と類型',
        items: [
          '==PMO==（Project Management Office）: プロジェクト管理の標準化・支援を行う組織横断的な部署',
          '　__支援型__（Supportive）: テンプレート提供・ベストプラクティス共有。コントロール度==低==',
          '　__コントロール型__（Controlling）: フレームワーク強制・準拠状況の監査。コントロール度==中==',
          '　__指揮型__（Directive）: プロジェクトを直接管理。コントロール度==高==',
          '他の機能: リソースの組織横断配置／ポートフォリオ管理／方法論策定',
        ],
      },
      // ── F. 紛争マネジメント ──
      {
        heading: '31. プロジェクトでの紛争の発生源',
        items: [
          '__主要発生源7つ__: ==スケジュール==（最頻発）／優先順位／要員／技術的意見／管理手続き／コスト／==個性==（解決最難）',
          '紛争は否定すべきものではなく、適切にマネジメントすることで創造性を生む',
        ],
      },
      {
        heading: '32. トーマス-キルマンの5つの対処モード',
        items: [
          'Thomas-Kilmann コンフリクト・モデル: ==自己主張==（縦軸）×==協調==（横軸）の2軸で5モードを整理',
          '　__1. 撤退／回避__（Withdraw／Avoid）: 自己主張==低==・協調==低==。「触れない」。==一時退避==に有効、根本解決にならない',
          '　__2. 鎮静／受容__（Smooth／Accommodate）: 自己主張==低==・協調==高==。「相手に合わせる」。==関係維持==重視',
          '　__3. 妥協／和解__（Compromise／Reconcile）: 自己主張==中==・協調==中==。「中間を取る」。==双方一部不満==',
          '　__4. 強制／指示__（Force／Direct）: 自己主張==高==・協調==低==。「権限で押し通す」。==緊急時==に有効',
          '　__5. 協力／問題解決__（Collaborate／Problem Solve）: 自己主張==高==・協調==高==。「Win-Win」。==最も望ましい==解決方法',
          'PMBOK第6版／第7版とも==問題解決==を==推奨==',
          '状況に応じて使い分け、==問題解決==を==デフォルト==に',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'トーマス-キルマン: 自己主張 × 協調の5モード',
            ariaLabel: '自己主張と協調の2軸上にキルマンの5つの対処モードを配置した図',
            viewBox: '0 0 640 430',
            content: `
              <defs>
                <marker id="kilmann-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#1e293b" />
                </marker>
              </defs>
              <rect x="20" y="18" width="600" height="388" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <line x1="96" y1="340" x2="552" y2="340" stroke="#1e293b" stroke-width="2" marker-end="url(#kilmann-arrow)" />
              <line x1="96" y1="340" x2="96" y2="72" stroke="#1e293b" stroke-width="2" marker-end="url(#kilmann-arrow)" />
              <line x1="96" y1="206" x2="552" y2="206" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="324" y1="340" x2="324" y2="72" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <text x="324" y="382" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">協調（Cooperativeness）低 → 高</text>
              <text x="50" y="206" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle" transform="rotate(-90 50 206)">自己主張（Assertiveness）低 → 高</text>
              <rect x="120" y="86" width="148" height="70" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="194" y="113" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">強制／指示</text>
              <text x="194" y="132" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Force / Direct</text>
              <rect x="380" y="86" width="148" height="70" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="454" y="113" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">協力／問題解決</text>
              <text x="454" y="132" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Collaborate</text>
              <rect x="250" y="188" width="148" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="324" y="215" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">妥協／和解</text>
              <text x="324" y="234" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Compromise</text>
              <rect x="120" y="286" width="148" height="70" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="194" y="313" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">撤退／回避</text>
              <text x="194" y="332" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Withdraw / Avoid</text>
              <rect x="380" y="286" width="148" height="70" rx="8" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="454" y="313" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" text-anchor="middle">鎮静／受容</text>
              <text x="454" y="332" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Accommodate</text>
            `,
          },
        ],
      },
      {
        heading: '33. PMBOK第6版「チームのマネジメント」プロセス（9.5）',
        items: [
          '==9.5 チームのマネジメント==: ==実行プロセス群==。メンバーのパフォーマンスを追跡しフィードバック・問題解決を行う',
          '__代表的な技法__: ==コンフリクト・マネジメント==（§32 のキルマン5モード）／==感情的知性==／影響力',
          '注: 9.5 は==チーム==の管理、9.6 は==物的資源==のコントロール（混同しない）',
        ],
      },
      {
        heading: '34. 紛争解決の優先順位とエスカレーション',
        items: [
          '__解決の優先順位__: __1.__ ==当事者間で解決==（最優先）→ __2.__ 第三者に仲介依頼 → __3.__ PMが非公式に仲介 → __4.__ PMが公式に調停 → __5.__ 機能部門マネージャへ → __6.__ スポンサー／経営層へ==エスカレーション==（最終手段）',
          '解決できない場合は早期エスカレーションが長期化を防ぐ。条件はチーム憲章に事前明文化',
        ],
      },
      {
        heading: '35. 多文化チーム・多様性への配慮',
        items: [
          '__文化次元__（==Hofstede==）: 権力格差／個人主義vs集団主義／男性性vs女性性／不確実性回避／長期志向vs短期志向／放縦vs抑制の6次元',
          '__配慮事項__: 言語・タイムゾーン（会議時間の輪番）・祝祭日・コミュニケーション・スタイル（直接的／間接的）',
          '文化的差異はコンフリクトの源にも創造性の源にもなる',
        ],
        navyItems: [[{ text: 'Hofstede 文化次元理論。1980年初版、2010年6次元に拡張', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '36. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__リーダーシップ理論__: ==マネジリアル・グリッド==の座標／==SL理論==の4スタイル／==サーバントリーダーシップ==の特徴',
          '__モチベーション理論__: ==マズロー==の階層（特に承認欲求）／==ハーズバーグ==の動機づけ要因 vs 衛生要因／==期待理論==の3要素／==XY理論==の対比',
          '__タックマンモデル__: 5段階の==順序==と==特徴==（特に混乱期の対処）',
          '__RACI__: A は==1人だけ==／R と A の違い／C は==双方向==・I は==一方向==',
          '__組織形態__: 機能型／マトリクス（弱・均衡・強）／プロジェクト型のPM権限',
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
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '38. 午後Ⅰの定石（チーム）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのチーム系設問は「報告が上がらない・指示待ち・育たない」状況に定石を当てはめ、理由を30〜40字で書く',
          '__1. 心理的安全性が問題報告の土台__: 悪い報告こそ歓迎する場を作ると、問題・予兆が==早期に共有==される。非難する場では隠蔽が起きる（H28問2・R4問3・R2問2）',
          '__2. 細かい指示は自発性を奪う__: 統制型の管理は指示待ちを生む。==任せて支える==（自律を促す育成）へ転換する（R4問3・R2問2）',
          '__3. リーダーシップは相手で使い分け__: 前向き・自律的なメンバーには==支援型==、経験不足には指示型。固定しない（R6問3・R5問1）',
          '__4. 朝会で障壁を早期発見__: ==デイリースタンドアップ==の短い共有が、週次把握では深刻化する遅れを防ぐ（R6問3）',
          '__5. 発言しない人の意見を取りに行く__: 全員参加の仕掛け（==無記名アンケート==・個別ヒアリング）で本音・少数意見を拾う（H28問2・R4問3）',
          '__6. 兼務は専任化で立ち上げを加速__: 重要フェーズは==兼務を解消==し集中させる（R2問1）',
          '__7. 要員追加は直後に生産性が落ちる__: 新規要員の==教育・習熟==の間、既存要員の工数も食われる。追加時期と教育コストを織り込む（H27問3）',
          '__8. 属人化は分散する__: 特定個人への==要員集中==は病欠・退職で全体が止まるリスク。知識共有・ペア化で分散（H26問2）',
          '__9. スキル不足は内製育成＋外部知見__: 専門家の支援でギャップを埋めつつ、==技術移転==で内製化する（R4問2・R2問1）',
          '__10. 将来の展開要員を今から参加させる__: 横展開を見据え、次の担い手を==プロジェクト内で育成==する（R2問1・H30問3）',
          '__11. グラウンドルールで行動を揃える__: 行動の基本原則を==全員で策定==すると自分事になる（R2問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==サーバントリーダーシップ==／==SL理論==のS1〜S4／==マネジリアル・グリッド==の9,9 は午前Ⅱ頻出。',
      '【モチベーション】==マズロー==5階層／==ハーズバーグ==二要因（給与=衛生・承認=動機づけ）／==期待理論==（E×I×V）の対比。',
      '【タックマン】5段階の==順序==（形成→混乱→規範→遂行→解散）。混乱期はスキップ不可。',
      '【RACI】==A は1人だけ==、==R は複数可==、C は==双方向==、I は==一方向==。',
      '【ひっかけ】==期待理論 vs 公平理論==、==XY vs Z==、==9.5（チーム）vs 9.6（物的資源）==、マトリクス弱・均衡・強の混同に注意。',
    ],
  },

  // ───────────────────────────────────────────
  // 3. 開発アプローチ（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'development-approach': {
    summary:
      'プロジェクトを進める手順とリリース戦略を扱う活動領域。予測型（ウォーターフォール）／適応型（アジャイル）／ハイブリッドの3類型を中心に、選定基準・スクラム・カンバン・XPを学ぶ。アジャイルマニフェスト・INVEST・スクラム役割／イベント／成果物が試験頻出。',
    sections: [
      // ── A. 定義・基本概念 ──
      {
        heading: '1. プロジェクトライフサイクルの定義と特性',
        items: [
          '==プロジェクトライフサイクル==: プロジェクトの==開始から完了==までに通過する一連の==フェーズ==',
          '__フェーズの構成要素__: 名称・成果物・終結基準・関与する組織',
          '__コスト/要員配分カーブ__: 序盤低・中盤ピーク・終盤逓減（==typical S字型==）',
          '__フェーズゲート（Phase Gate）__: フェーズ間で==Go/No-Go==判定を行う意思決定ポイント',
          '__ステークホルダー影響力__: 序盤が==最大==、終盤に向けて低下',
          '__変更コスト__: 序盤が==最小==、終盤が==最大==',
          'PMBOK第6版 §1.2.4 で4種類のライフサイクル（予測型／反復型／漸進型／適応型）を整理',
          'PMBOK第7版は==ライフサイクル==と==開発アプローチ==を==パフォーマンス領域==の中心概念に格上げ',
        ],
      },
      {
        heading: '2. 開発アプローチの3類型（予測型／適応型／ハイブリッド）',
        items: [
          '__3類型__:',
          '　==予測型==（Predictive）: 計画駆動。要件・スコープを==上流で確定==し順次実行。「==プロジェクト型==」「==ウォーターフォール==」と同義扱い',
          '　==適応型==（Adaptive）: 価値駆動。要件を==段階的に詳細化==し、==短い反復==で動くものを出す。==アジャイル==の総称',
          '　==ハイブリッド==（Hybrid）: 予測型と適応型を==組み合わせ==。フェーズや成果物単位で使い分け',
          '3類型は==離散的ではなく連続体==（continuum）として捉える',
          'PMBOK第6版 §1.2.4 ではさらに==反復型==（iterative）と==漸進型==（incremental）を別カテゴリで定義',
          '__反復型__（iterative）: 全体を作りつつ繰り返し==洗練==する',
          '__漸進型__（incremental）: 部分機能を順次==完成==させて積み上げる',
          'アジャイル = 反復型 + 漸進型の==両方==を採用',
        ],
      },
      {
        heading: '3. PMBOK第7版「開発アプローチとライフサイクル」パフォーマンス領域',
        items: [
          '第7版の==8パフォーマンス領域==の1つ',
          '__目的__: プロジェクトの==成果物と価値==を最も効果的に提供するため、適切な==開発アプローチ==と==ライフサイクル==を選択・適応する',
          '__成果1__: 最終成果物に整合する==開発アプローチ==',
          '__成果2__: 価値を==早期に提供==できるライフサイクル',
          '__成果3__: チーム・組織・ステークホルダーが==容易に取り組める==プロセス',
          '__主な検討事項__: 成果物の性質／納期／組織・市場の状況／チーム能力',
          '__テーラリング__の対象: アプローチ選定そのものがテーラリング',
        ],
        navyItems: [[{ text: '第6版では §1.2.4 と アジャイル実務ガイドが該当', style: 'navy' }]],
      },
      {
        heading: '4. PMBOK第6版とアジャイル実務ガイドの関係',
        items: [
          'PMBOK第6版==本体==は==予測型中心==で記述',
          'PMBOK第6版に==付属書==として==アジャイル実務ガイド==（Agile Practice Guide）が同梱',
          'アジャイル実務ガイドの位置づけ: 各知識エリアの==アジャイル/ハイブリッド適用==を補足解説',
          'アジャイル実務ガイドの主要章: ==ライフサイクル選定==／==アジャイル環境作り==／==アジャイル組織変革==／==スクラム==／==XP==／==カンバン==等',
          '__注意__: アジャイル実務ガイドは==PMBOK第6版の一部==として扱われる（試験対象）',
          'PMBOK第7版で==アジャイルがメインストリーム化==され、本体に統合された',
        ],
      },
      {
        heading: '5. 開発アプローチの選定基準',
        items: [
          '__選定の主要判断軸__:',
          '　==要件の安定性==: 安定 → 予測型／変化が前提 → 適応型',
          '　==不確実性レベル==: 低 → 予測型／高 → 適応型',
          '　==顧客フィードバック頻度==: 少 → 予測型／多 → 適応型',
          '　==リリース戦略==: 一括 → 予測型／段階的・継続的 → 適応型',
          '　==規制環境==: 厳格（医療・金融・原子力等）→ 予測型寄り',
          '　==チーム経験==: アジャイル未経験 → ハイブリッドで段階移行',
          '__Stacey マトリクス__: ==要求の不確実性==×==技術の不確実性==で適用領域を判定',
          '__Cynefin フレームワーク__: ==単純==／==困難==／==複雑==／==混沌==の4領域でアプローチを変える',
          '試験頻出: 「適応型が==適する条件==／適さない条件」の判別問題',
        ],
      },
      // ── B. 予測型ライフサイクル ──
      {
        heading: '6. 予測型（プロジェクト型）の特徴・進め方',
        items: [
          '==予測型==: 計画駆動（plan-driven）のアプローチ',
          '__基本思想__: ==上流で詳細計画==を確定し、計画通り実行する',
          '__フェーズ進行__: 要件 → 設計 → 実装 → テスト → 運用（==順次完了==）',
          '変更は==厳密に管理==（変更管理委員会／CCB）',
          '__文書化重視__: 設計書・仕様書を成果物として作成',
          '__規模__: 大規模・長期プロジェクトに伝統的に適用',
          'PMBOK第6版 49プロセスは==基本的に予測型==を前提とする',
        ],
      },
      {
        heading: '7. ウォーターフォール・モデル',
        items: [
          '==ウォーターフォール==（Waterfall Model）: 1970年 Royce が提唱（ただし本人は批判的）',
          '__フェーズ__: ==要求定義== → ==基本設計== → ==詳細設計== → ==実装== → ==テスト== → ==運用・保守==',
          '__特徴__: 上から下への==一方向==、前フェーズ完了後に次へ進む',
          '__利点__: フェーズ管理が容易、文書化が明確、進捗が見えやすい',
          '__欠点__: 戻りが困難（==ゲート通過後の変更コスト高==）、要件不確実時に破綻',
          '日本の伝統的SI開発で広く採用',
          'PMBOK上は==予測型==の代表例として扱われる',
        ],
      },
      {
        heading: '8. V字モデル',
        items: [
          '==V字モデル==: ウォーターフォールの==検証・妥当性確認==を強化したモデル',
          '__左側（設計）と右側（テスト）の対応__:',
          '　==要件定義== ↔ ==システムテスト==（受入テスト）',
          '　==基本設計== ↔ ==結合テスト==',
          '　==詳細設計== ↔ ==単体テスト==',
          '__検証（Verification）__: 「正しく作っているか」（仕様への適合）',
          '__妥当性確認（Validation）__: 「正しいものを作っているか」（要求への適合）',
          '__W字モデル__: V字に==早期テスト==（テスト設計を設計段階から実施）を加えた発展形',
          '組込み系・制御系で広く採用',
        ],
        navyItems: [[{ text: 'V字モデルは IPA午後I で開発工程と対応するテスト工程を問う形で頻出', style: 'navy' }]],
      },
      {
        heading: '9. 予測型のメリット・デメリット',
        items: [
          '__メリット__: ==計画が明確==（スコープ・コストを事前把握）／進捗の定量管理が容易／文書化で監査・規制に対応',
          '__デメリット__: ==変更対応が困難==（上流確定後の変更はコスト高）／フィードバックと==価値実現が遅い==（完成まで触れない）',
        ],
      },
      {
        heading: '10. 予測型が適する条件・適さない条件',
        items: [
          '__適する条件__: ==要件が明確で変化しない==／==技術が成熟==／規制が厳格（医療・金融）／固定価格契約',
          '__適さない条件__: ==要件が変動==する／フィードバックが必要／技術探索的',
          '試験頻出: 適さない場面で予測型を選ぶ選択肢が誤答パターン',
        ],
      },
      // ── C. 適応型ライフサイクル ──
      {
        heading: '11. アジャイル思想の起源とリーン思想',
        items: [
          '__アジャイルの起源__: ==2001年==に17名の有志が==アジャイルマニフェスト==を発表。XP・Scrum 等の手法はそれ以前から存在',
          '__リーン思想の影響__: ==トヨタ生産方式==由来の==ムダ排除==・ジャストインタイム・カイゼン',
        ],
      },
      {
        heading: '12. アジャイルソフトウェア開発宣言（4価値・12原則）',
        items: [
          '__4つの価値__（左辺より==右辺==により価値を置く）:',
          '　==プロセスやツールよりも個人と対話を==',
          '　==包括的なドキュメントよりも動くソフトウェアを==',
          '　==契約交渉よりも顧客との協調を==',
          '　==計画に従うことよりも変化への対応を==',
          '左辺にも価値があることを認めながらも、右辺により価値を置く',
          '__12原則__の主要キーワード: 顧客満足／変化を歓迎／短期間の動くソフトウェア／自己組織化チーム／振り返り',
          '試験頻出: 4価値の==右辺・左辺==の逆転や、別文言への差し替えがひっかけパターン',
        ],
        navyItems: [[{ text: 'IPA午前Ⅱ R6秋期 問17 で出題実績', style: 'navy' }]],
      },
      {
        heading: '13. イテラティブ vs インクリメンタル（適応型の2つの軸）',
        items: [
          '__イテラティブ__（反復型, Iterative）: ==全体を作って洗練==を繰り返す',
          '　例: 絵を==下書き→着色→修正==で完成度を上げる',
          '__インクリメンタル__（漸進型, Incremental）: ==部分を順次完成==させて積み上げ',
          '　例: 家を==キッチン → 寝室 → リビング==の順で完成',
          '__アジャイル__ = ==反復型 + 漸進型==の組合せ',
          '　各スプリントで「==小さな範囲==の機能を==動く形==で完成」（インクリメント）',
          '　次スプリントで前回のフィードバックを反映して==洗練==（イテレーション）',
          '__予測型__ = ==一度に全部==（反復なし、漸進なし）',
          '試験頻出: 「反復型」と「漸進型」の単独定義を問う設問',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'イテラティブは全体を洗練、インクリメンタルは部分を積み上げる',
            ariaLabel: 'イテラティブとインクリメンタルの違いを上下2段で比較する図',
            viewBox: '0 0 720 360',
            content: `
              <defs>
                <marker id="iter-inc-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="324" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <text x="72" y="78" fill="#dc2626" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">反復型</text>
              <text x="72" y="96" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Iterative</text>
              <rect x="130" y="50" width="120" height="76" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="190" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体の下書き</text>
              <path d="M160 105 Q190 70 220 105" fill="none" stroke="#64748b" stroke-width="2" />
              <line x1="256" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="310" y="50" width="120" height="76" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="370" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体を着色</text>
              <path d="M340 105 Q370 58 400 105" fill="none" stroke="#9d5b8b" stroke-width="3" />
              <line x1="436" y1="88" x2="480" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="490" y="50" width="120" height="76" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="550" y="76" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">全体を修正</text>
              <path d="M520 105 Q550 48 580 105" fill="none" stroke="#10b981" stroke-width="3" />
              <text x="370" y="146" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">同じ全体像を何度も洗練する</text>
              <line x1="46" y1="178" x2="674" y2="178" stroke="#cbd5e1" stroke-width="1" />
              <text x="72" y="232" fill="#9d5b8b" stroke="white" stroke-width="3" paint-order="stroke" font-size="15" font-weight="700" text-anchor="middle">漸進型</text>
              <text x="72" y="250" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Incremental</text>
              <rect x="130" y="210" width="120" height="76" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="190" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">キッチン完成</text>
              <line x1="256" y1="248" x2="300" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="310" y="210" width="120" height="76" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <rect x="310" y="210" width="60" height="76" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="370" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">寝室を追加</text>
              <line x1="436" y1="248" x2="480" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#iter-inc-arrow)" />
              <rect x="490" y="210" width="120" height="76" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <line x1="530" y1="210" x2="530" y2="286" stroke="#10b981" stroke-width="2" />
              <line x1="570" y1="210" x2="570" y2="286" stroke="#10b981" stroke-width="2" />
              <text x="550" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">リビング追加</text>
              <text x="370" y="306" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">完成済みの部分を順に増やす</text>
            `,
          },
        ],
      },
      {
        heading: '14. 適応型のメリット・デメリット',
        items: [
          '__メリット__: ==変化対応==（変更を歓迎）／==早期価値提供==（短期サイクル）／フィードバックで方向修正／リスクの早期発見',
          '__デメリット__: ==スコープ・全体見積もりの管理が難しい==／==固定価格契約と相性が悪い==／文書化が軽視されやすい',
        ],
      },
      {
        heading: '15. 適応型が適する条件・適さない条件',
        items: [
          '__適する条件__: ==不確実性が高い==（要件・技術）／==フィードバックが必要==／価値の早期実現／==顧客が常時関与可能==',
          '__適さない条件__: ==規制が厳格==で文書化必須／==固定価格契約==で全スコープ事前合意が必要／システム重要度が極高（航空・原子力）／顧客関与が困難',
        ],
      },
      {
        heading: '16. 予測型 vs 適応型の比較',
        items: [
          '8項目の対比は下表参照。特に頻出は__変更管理__（==CCBで厳格管理== vs ==バックログで歓迎==）と__成功基準__（==QCD遵守== vs ==価値実現==）',
        ],
        navyItems: [[{ text: '試験頻出の対比表。両者は二者択一ではなく連続体として理解', style: 'navy' }]],
        figures: [
          {
            type: 'table',
            caption: '予測型 vs 適応型: 試験頻出の8項目比較',
            headers: ['項目', '予測型', '適応型'],
            rowHeaderFirstCol: true,
            rows: [
              ['計画粒度', '全体を詳細化', '近期詳細・遠期粗'],
              ['変更管理', 'CCBで厳格管理', 'バックログで歓迎'],
              ['リリース', '終盤に一括', '継続的・反復的'],
              ['顧客関与', '要件定義時とUAT', '常時関与'],
              ['リスク管理', '上流で網羅', '反復ごとに継続'],
              ['成功基準', 'QCD遵守', '価値実現・顧客満足'],
              ['文書化', '重視', '必要最小限'],
              ['チーム', '階層型', '自己組織化'],
            ],
          },
        ],
      },
      // ── D. スクラム ──
      {
        heading: '17. スクラム概観・経験主義の3本柱',
        items: [
          '==スクラム==: アジャイル手法の代表格。==経験主義==（empiricism）に基づく軽量フレームワーク',
          '__3本柱__:',
          '　==透明性==（Transparency）: 進捗・成果物・障害を==全員が見える化==',
          '　==検査==（Inspection）: 定期的に==状況を確認==',
          '　==適応==（Adaptation）: 検査結果に基づき==プロセスや成果物を調整==',
          '__タイムボックス制__: イベントごとに==時間上限==を設定',
          '__自己組織化チーム__: チームが==自律的==に作業計画・実行',
          '__経験的プロセス制御__: 計画通りではなく==実績に基づく==調整',
          '__複雑な領域__（要求と技術が両方不確実）に最も適する',
        ],
        navyItems: [[{ text: 'Jeff Sutherland & Ken Schwaber 作成', style: 'navy' }]],
      },
      {
        heading: '18. スクラムチームの役割',
        items: [
          '__スクラムチームの3役割__（合計 約10名以下が推奨）:',
          '　==プロダクトオーナー==（PO, Product Owner）: ==プロダクトの価値最大化==に責任を持つ',
          '　　主な責務: ==プロダクトゴール==の策定／==プロダクトバックログ==の管理／優先順位付け／受入判断',
          '　==スクラムマスター==（SM, Scrum Master）: ==スクラムの実践支援==・障害除去（==サーバントリーダー==）',
          '　　主な責務: スクラムの==コーチング==／==障害物の除去==／チームの==自己組織化==促進',
          '　==開発者==（Developer）: ==インクリメント作成==に責任を持つ',
          '　　主な責務: ==スプリントバックログ==の作成と実行／==完了の定義==の遵守',
          '__POとSMの違い__（試験頻出ひっかけ）: PO は「==何を==作るか」、SM は「==どう==作るか」を支援',
          'スクラムチームは==自己組織化==・==機能横断型==（cross-functional）',
        ],
        navyItems: [[{ text: '2020年版 Scrum Guide で「開発チーム」が「開発者」に変更、PO/SM もスクラムチームの一員と明確化', style: 'navy' }]],
      },
      {
        heading: '19. スクラムイベント（5つ）',
        items: [
          '__5つのイベント__（すべてタイムボックス制）:',
          '　==スプリント==（Sprint）: ==1-4週==間（最大1ヶ月）の==コンテナイベント==。他の4イベントを内包',
          '　==スプリント計画==（Sprint Planning）: スプリント開始時。最大==8時間==（1ヶ月スプリントの場合）',
          '　　決定事項: ==なぜ==このスプリントが価値ある？／==何を==できる？／==どう==実現する？',
          '　==デイリースクラム==（Daily Scrum）: 毎日 ==15分==。==開発者==が主催',
          '　　目的: 進捗共有／障害特定／次の24時間の計画',
          '　==スプリントレビュー==（Sprint Review）: スプリント末。最大==4時間==',
          '　　目的: ==ステークホルダー==と成果物を確認／フィードバック収集／バックログ更新',
          '　==スプリントレトロスペクティブ==（Sprint Retrospective）: レビュー後・次スプリント前。最大==3時間==',
          '　　目的: ==チームの改善==（プロセス・関係性・道具）',
          '試験頻出: イベント名・順序・タイムボックス・主催者',
        ],
        figures: [
          {
            type: 'svg',
            caption: 'スクラムイベント: スプリントをコンテナとして4イベントを配置',
            ariaLabel: 'スプリント内のスクラムイベントの順序とタイムボックスを示す図',
            viewBox: '0 0 720 340',
            content: `
              <defs>
                <marker id="scrum-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="684" height="304" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <rect x="70" y="78" width="580" height="184" rx="12" fill="#9d5b8b15" stroke="#9d5b8b" stroke-width="2" />
              <text x="360" y="58" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="16" font-weight="700" text-anchor="middle">Sprint（1〜4週 / 最大1か月）</text>
              <rect x="94" y="118" width="126" height="66" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="157" y="142" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">スプリント計画</text>
              <text x="157" y="162" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大8h</text>
              <line x1="224" y1="151" x2="270" y2="151" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="282" y="112" width="156" height="78" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="360" y="136" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">デイリースクラム</text>
              <text x="360" y="156" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">毎日15分</text>
              <text x="360" y="176" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">進捗・障害・24h計画</text>
              <line x1="442" y1="151" x2="488" y2="151" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="500" y="118" width="126" height="66" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="2" />
              <text x="563" y="142" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">レビュー</text>
              <text x="563" y="162" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大4h</text>
              <line x1="563" y1="188" x2="563" y2="214" stroke="#64748b" stroke-width="2" marker-end="url(#scrum-arrow)" />
              <rect x="500" y="220" width="126" height="56" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="563" y="242" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle">レトロ</text>
              <text x="563" y="260" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">最大3h</text>
              <text x="104" y="292" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">開始: 計画</text>
              <text x="498" y="292" fill="#475569" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="start">終了: レビュー → レトロ</text>
              <circle cx="330" cy="210" r="7" fill="#9d5b8b" />
              <circle cx="360" cy="210" r="7" fill="#9d5b8b" />
              <circle cx="390" cy="210" r="7" fill="#9d5b8b" />
              <text x="360" y="236" fill="#1e293b" stroke="white" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle">Daily repeats</text>
            `,
          },
        ],
      },
      {
        heading: '20. スクラム成果物と完了の定義',
        items: [
          '__3つの成果物__:',
          '　==プロダクトバックログ==（Product Backlog）: プロダクト改善に必要な==すべての項目==の優先順位付きリスト',
          '　　責任者: ==プロダクトオーナー==',
          '　　==コミットメント==: ==プロダクトゴール==',
          '　==スプリントバックログ==（Sprint Backlog）: 当該スプリントで取り組む項目＋計画',
          '　　責任者: ==開発者==',
          '　　==コミットメント==: ==スプリントゴール==',
          '　==インクリメント==（Increment）: ==動作する==プロダクトの==検査可能==な成果',
          '　　==コミットメント==: ==完了の定義==（DoD）',
          '__完了の定義__（Definition of Done, DoD）: 「==完了==」とみなす品質基準（テスト済・レビュー済・ドキュメント済等）',
          '__ストーリーポイント__: 相対見積もりの単位（フィボナッチ数列 1/2/3/5/8/13...）',
        ],
      },
      {
        heading: '21. ユーザストーリーと INVEST',
        items: [
          '==ユーザストーリー==: 価値を==ユーザ視点==で表現する短文形式',
          '__標準フォーマット__: 「==As a== (ユーザ役割) , ==I want== (機能) , ==so that== (価値)」',
          '__例__: 「As a 営業担当, I want 月次レポート自動生成, so that 月初業務時間を削減できる」',
          '__INVEST 観点__（良いユーザストーリーの6基準）:',
          '　==Independent==（独立）: 他ストーリーから独立して着手・完了できる',
          '　==Negotiable==（交渉可能）: 詳細はチーム・POと交渉で決める',
          '　==Valuable==（価値あり）: ==ユーザまたは顧客==にとって価値がある',
          '　==Estimable==（見積可能）: 規模を見積もれる',
          '　==Small==（小さい）: ==1スプリント以内==で完了できる',
          '　==Testable==（テスト可能）: ==受入基準==で検証できる',
          '__受入基準__（Acceptance Criteria）: 「完了」とみなす条件（Given-When-Then 形式が一般的）',
          '試験頻出: INVEST の6要素、特に==Valuable==の主体（開発者ではなく顧客）',
        ],
        navyItems: [[{ text: 'IPA午前Ⅱ R6秋期 問16 で INVEST 観点が出題。Bill Wake 2003年提唱', style: 'navy' }]],
      },
      {
        heading: '22. ベロシティ・バーンダウン・バーンアップ',
        items: [
          '==ベロシティ==（Velocity）: 1スプリントで==完了==したストーリーポイントの合計',
          '__使い方__: 過去数スプリントの==平均==から将来の見積もり',
          '__注意__: チーム固有の値であり、==チーム間比較は無意味==',
          '==バーンダウンチャート==（Burndown Chart）: ==残作業==を時間軸でプロット',
          '　縦軸: 残りストーリーポイント（または時間）、横軸: スプリント日数',
          '　右下がりが理想。水平 → 進捗停滞、右上 → 増加（要警戒）',
          '==バーンアップチャート==（Burnup Chart）: ==完了量==と==スコープ==を時間軸でプロット',
          '　バーンダウンより==スコープ変更==が見えやすい',
          '__予測線__: ベロシティから==完了時期予測==',
          '試験頻出: バーンダウンの読み取り（残作業ベース）／バーンアップとの違い',
        ],
      },
      // ── E. その他のアジャイル手法 ──
      {
        heading: '23. カンバン',
        items: [
          '==カンバン==（Kanban）: ==トヨタ生産方式==由来のプル方式生産制御',
          '__基本要素__:',
          '　==プル方式==（Pull System）: 後工程が引っ張る。==WIP制限==で過剰生産を防ぐ',
          '　==WIP制限==（Work In Progress Limit）: 各段階で同時進行可能な作業数を制限',
          '　==バリューストリーム==の可視化（==カンバンボード==）',
          '　==カイゼン==（Kaizen）: ボトルネック発見と継続的改善',
          '　==プルポリシー==・==サービスレベル合意==の明示',
          '__リトルの法則__: ==WIP = スループット × リードタイム==',
          '　WIPを下げるとリードタイムが下がる',
          '__スクラムとの違い__: タイムボックスなし・役割固定なし・継続フロー',
          '__スクラムバン__（Scrumban）: スクラムにカンバン要素を取り入れたハイブリッド',
        ],
      },
      {
        heading: '24. XP（Extreme Programming）',
        items: [
          '==XP==（Extreme Programming）: 1996年 Kent Beck らが提唱。==技術プラクティス==重視のアジャイル手法',
          '__主要プラクティス__:',
          '　==ペアプログラミング==（Pair Programming）: 2人で1台のPC、コードの==共同所有==',
          '　==TDD==（Test-Driven Development）: ==テストファースト==。Red→Green→Refactor サイクル',
          '　==リファクタリング==: 動作を変えずコード構造を改善',
          '　==継続的インテグレーション==（CI）: 頻繁な統合・自動テスト',
          '　==シンプル設計==（KISS／YAGNI: You Aren\'t Gonna Need It）',
          '　==オンサイト顧客==（On-site Customer）: 顧客がチームに常駐',
        ],
      },
      {
        heading: '25. その他のアジャイル手法',
        items: [
          '__DSDM__: タイムボックスと==MoSCoW==（Must/Should/Could/Won\'t have）優先順位付けが特徴',
          '__Crystal__: チーム規模と重要度に応じた手法ファミリー／__FDD__: フィーチャー単位の開発',
          '__リーン・ソフトウェア開発__: トヨタ生産方式の応用。==ムダ排除==・決定遅延・早期提供など7原則',
        ],
      },
      {
        heading: '26. スケーリングフレームワーク',
        items: [
          '__スケーリング__: 複数チーム・大規模組織でのアジャイル適用',
          '　==SAFe==（Scaled Agile Framework）: 最も採用率が高い',
          '　==LeSS==（Large-Scale Scrum）: スクラムをそのまま大規模化',
          '　Nexus／Scrum@Scale／DAD などもある',
          '規模拡大はコミュニケーションコスト増でアジリティが低下しやすい',
        ],
        navyItems: [[{ text: '試験頻出度: SAFe > LeSS の順', style: 'navy' }]],
      },
      // ── F. ハイブリッド型と契約・周辺概念 ──
      {
        heading: '27. ハイブリッド・アプローチの設計',
        items: [
          '==ハイブリッド==: 予測型と適応型を組み合わせて使う',
          '__組合せのパターン__: __フェーズ別__（要件・基本設計は予測型、開発は適応型スプリント）／__成果物別__（HWは予測型・SWは適応型）／__段階移行__',
          '規制・契約・組織制約で完全アジャイル化が困難な場合の現実解。実態として多くの企業が採用',
        ],
      },
      {
        heading: '28. 段階的詳細化とローリングウェーブ計画',
        items: [
          '==段階的詳細化==（Progressive Elaboration）: 計画を==段階的に詳細化==する手法',
          '　PMBOK第6版 §1.2.3 で定義',
          '　不確実な情報が==確定するに従い==計画を精緻化',
          '==ローリングウェーブ計画==（Rolling Wave Planning）: 段階的詳細化の実践形',
          '　==近期==は詳細に、==遠期==は粗くプランする',
          '　例: 直近スプリントは時間単位、3ヶ月後はストーリー単位、1年後はテーマ単位',
          '__適応型でのバックログ__: プロダクトバックログ自体が==段階的詳細化==の典型',
          '　==リファインメント==（Backlog Refinement）: 上位項目を段階的に詳細化',
          '予測型でも適応型でも適用可能な==計画技法==',
        ],
      },
      {
        heading: '29. アジャイル契約',
        items: [
          '==T&M==（時間と材料）が最も相性良く、==固定価格==は相性が悪い（スコープ固定と変化歓迎が矛盾）',
          '日本では==準委任契約==で柔軟性を確保するのが一般的（請負・固定価格の発注慣行と相性が悪いため）',
          '工夫: スプリント単位の増分契約／同等規模の機能と交換できる変更条項',
        ],
        navyItems: [[{ text: '経済産業省「DXレポート」「情報システム・モデル取引・契約書」がアジャイル契約のガイドを提供', style: 'navy' }]],
      },
      {
        heading: '30. DevOps・CI/CD と継続的デリバリー',
        items: [
          '==DevOps==: 開発（Dev）と運用（Ops）の==組織・プロセス統合==。リードタイム短縮・デプロイ頻度向上が目的',
          '==CI==（Continuous Integration, 継続的インテグレーション）: 頻繁な統合・自動テスト',
          '==CD==:',
          '　==Continuous Delivery==（継続的デリバリー）: 本番リリース==可能な状態==を常に維持',
          '　==Continuous Deployment==（継続的デプロイメント）: 本番に==自動デプロイ==',
          '==DevSecOps==: セキュリティをDevOpsに統合（==Shift Left==アプローチ）',
          'アジャイルが「==作り方==」、DevOpsが「==届け方==」の革新',
        ],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '31. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__アジャイルマニフェスト__: ==4価値==の右辺・左辺対比／別文言への差し替えひっかけ',
          '__INVEST__: 6要素（Independent/Negotiable/Valuable/Estimable/Small/Testable）と==Valuable==の主体',
          '__スクラム役割__: PO（==何を==）／SM（==どう==）／開発者の責任範囲',
          '__スクラムイベント__: 5イベントの==名前==・==順序==・==タイムボックス==',
          '__スクラム成果物__: プロダクトバックログ／スプリントバックログ／インクリメント／DoD',
          '__バーンダウン__: 残作業ベースの読み取り／バーンアップとの違い',
          '__カンバン__: ==WIP制限==／==リトルの法則==／==プル方式==',
          '__XP__: ペアプロ／TDD／リファクタリング／オンサイト顧客',
          '__予測型 vs 適応型__: 選定基準・適する条件',
          '__段階的詳細化__／==ローリングウェーブ計画==',
        ],
      },
      {
        heading: '32. ひっかけパターン',
        items: [
          '__PO vs SM__: PO は==何を==作るか（プロダクト責任）、SM は==どう==作るか（プロセス支援）',
          '__スクラムイベント順序__: 計画→デイリー→レビュー→レトロスペクティブ（レビューとレトロの逆転に注意）',
          '__タイムボックス__: スプリント最大1ヶ月／デイリー15分／計画8h／レビュー4h／レトロ3h',
          '__アジャイル宣言__: 右辺と左辺の入れ替え／別文言への改変（R6秋期 問17 事例）',
          '__INVEST__: ==Valuable==の主体は==顧客/ユーザ==（開発者ではない）',
          '__反復型 vs 漸進型__: 反復は洗練、漸進は積み上げ。アジャイルは両方',
          '__カンバン vs スクラム__: カンバンはタイムボックスなし／役割固定なし',
          '__予測型 vs 適応型__: 規制厳格・固定価格は予測型、不確実性高・フィードバック要は適応型',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==。試験は両版混在',
          '__DevOps vs アジャイル__: DevOps は「==届け方==」、アジャイルは「==作り方==」',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋アジャイル実務ガイドを統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '33. 午後Ⅰの定石（開発アプローチ）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのアプローチ系設問は「進め方の選択理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 要求が固まらないなら適応型__: 初めにほぼ固まるなら予測型、走りながら順次変わるなら==適応型==。両者を混ぜる==ハイブリッド==も実務では一般的（R6問3・R5問3）',
          '__2. 経験のない取り組みは小刻みに確認__: 成果を小さく出して確認し==計画を修正==しながら進める。出資元に経験のない新価値創出はアジャイルが向く（R5問1）',
          '__3. 新技術は仮説検証で見極める__: いきなり本採用せず、==探索的アプローチ==（PoC・プロトタイプ）で技術リスクを先に潰す（R5問3）',
          '__4. SaaSはFit to Standard__: カスタマイズを最小化し==業務を標準機能に合わせる==のが短期導入のカギ。標準への準拠が将来の改善も受け取れる（R2問3・R4問1・H30問1）',
          '__5. パッケージはFit&Gap分析__: 標準機能と業務の==差分を早期に分析==し、適合しないリスク（追加開発の膨張）を見極める（H27問2・H25問1）',
          '__6. プロトタイプで認識を合わせる__: 文書より==動くもの・デモ==が要求の解釈ずれを防ぎ、仕様確定を早める（R4問1・H26問1・H28問3）',
          '__7. 新技術採用のリスクは3点セット__: ==要員==（経験者不足）・==品質==・==スケジュール==へ波及する。教育・支援体制を計画に織り込む（H25問2）',
          '__8. 予測型でも品質活動を計画に織り込む__: 期限固定でも、追加ニーズの収集・改修・検証を==あらかじめ計画に組み込む==（R6問1）',
          '__9. DevOpsで開発と運用を一体化__: リリース高速化と==安定運用の両立==が狙い。部門間のミッション対立は上位目的で調整（R4問2）',
          '__10. 状況が読めないときはOODA__: 計画前提のPDCAでなく==観察→判断→決定→行動==を高速に回して即応する（R5問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==アジャイルマニフェスト==の4価値は右辺・左辺を完全に暗記。R6秋期 問17 のような改変パターンを見抜けるレベルまで。',
      '【スクラム】役割（PO/SM/開発者）／5イベント／3成果物／DoD を一覧で暗記。タイムボックスも数字で覚える。',
      '【INVEST】6要素を頭文字で暗記。==Valuable== の主体は==顧客==（開発者ではない、ひっかけ多発）。',
      '【カンバン】==WIP制限==／==プル方式==／==リトルの法則==（WIP=スループット×リードタイム）。',
      '【ひっかけ】PO（何を）vs SM（どう）／反復型（洗練）vs 漸進型（積み上げ）／レビューとレトロの順序。',
    ],
  },

  // ───────────────────────────────────────────
  // 4. 計画（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  planning: {
    summary:
      'プロジェクトのスコープ・スケジュール・コスト・リスクを計画する活動領域。PMBOK第6版では第5/6/7章の3知識エリアで詳細化、第7版では「計画」パフォーマンス領域として統合的に扱う。WBS・クリティカルパス法・3点見積もり・EVMが試験頻出。',
    sections: [
      // ── A. 計画の全体像 ──
      {
        heading: '1. 計画で決めること（計画書・ベースライン・段階的詳細化）',
        items: [
          // 赤字密度メモ: 計画書とベースラインの体系語のため 8 個許容（方針書 §7）
          '__計画で決めるのは3つ__: 何を作るか（スコープ）・いつまでに（スケジュール）・いくらで（コスト）。この3つは__互いに縛り合う__ので、1つを動かせば他も動く',
          '　PMBOK第7版は「計画」パフォーマンス領域、第6版は__第5章スコープ／第6章スケジュール／第7章コスト__の3知識エリア',
          '　__本ノートは第6版のプロセス番号を軸に扱う__。午前Ⅱは WBS・CPM・PERT・EVM といった第6版用語が中心で、午後Ⅰも第6版プロセスのシナリオが多いため',
          '__計画書の構造__:',
          '　==プロジェクトマネジメント計画書==: 全体を束ねる親。実行・監視・終結の基準になる',
          '　==サブシディアリー計画書==（補助計画書）: 知識エリアごとの子。スコープ／要求事項／スケジュール／コスト／品質／資源／コミュニケーション／リスク／調達／ステークホルダーの10種',
          '　==ベースライン==: ==スコープ・スケジュール・コスト== の3つ。__変更管理の基準線になるのはこの3つだけ__',
          '　計画書は__生きた文書__。キックオフで合意してベースライン化し、以降は変更が承認されるたびに更新する',
          '__計画は一度で終わらない__:',
          '　==段階的詳細化==: 進むにつれて情報が増え、計画が詳しくなる。__最初から全部決められない前提__で作る',
          '　==ローリングウェーブ計画==: 近い工程は詳細に、遠い工程は粗く計画し、時期が来たら詳細化する',
          '　__アジャイルの計画__も同じ考え方。ビジョン → ロードマップ → リリース計画 → イテレーション計画 → デイリー、と階層で詳細化する。見積もりは ==プランニング・ポーカー== で相対評価',
          '__計画の厚みは案件で変える__（==テーラリング==）:',
          '　__厚くする方向__: 規模が大きい・複雑・高リスク・組織が未成熟・規制が厳しい',
          '　__避けるべきは「計画書のための計画」__。管理のための文書が目的化すると、作る労力に見合わなくなる',
        ],
        navyItems: [[{ text: 'ベースラインは3つ（スコープ・スケジュール・コスト）。品質やリスクの計画書はあるがベースラインではない、が頻出のひっかけ', style: 'navy' }]],
      },
      // ── B. スコープマネジメント（PMBOK6 第5章） ──
      {
        heading: '2. スコープの計画と要求事項の収集（5.1 / 5.2）',
        items: [
          '__5.1 スコープマネジメント計画__: スコープをどう定義し、どう受け入れてもらい、どう変更を統制するかの__やり方を先に決める__',
          '　__出るのは2つの計画書__: スコープマネジメント計画書と ==要求事項マネジメント計画書==',
          '　　__後者もこのプロセスの成果物__である点がひっかけ。要求事項の計画書だから 5.2 の成果物、と考えると間違う',
          '__5.2 要求事項収集__: ステークホルダーが本当に欲しいものを引き出して文書にする',
          '　__主な技法と使い分け__:',
          '　　インタビュー: 個別に深く聞く。__少人数のキーパーソン__向け',
          '　　ワークショップ: 関係者を集めて__その場で合意__まで持っていく。利害が対立するときに有効',
          '　　==プロトタイピング==: 動くものを見せて反応を引き出す。__言葉にできない要求__を掘るのに効く（午後Ⅰ頻出）',
          '　　親和図: 大量に出た意見を似たもの同士でまとめて整理する',
          '　==要求事項トレーサビリティ・マトリクス==（RTM）: 各要求の__出自・優先度・実装先・テスト__を1本の線で追える表',
          '　　__効くのは変更が起きたとき__。どの要求がどの成果物とテストに繋がっているか分かるので、影響範囲を漏れなく特定できる',
        ],
        navyItems: [[{ text: 'RTM は「要求 → 設計 → 実装 → テスト」を追跡できることが本質。変更影響分析とテスト漏れ防止の両方に使う', style: 'navy' }]],
      },
      {
        heading: '3. スコープ定義と WBS 作成（5.3 / 5.4）',
        items: [
          // 赤字密度メモ: WBS は午前Ⅱ最頻出のため 10 個許容（方針書 §7）
          '__5.3 スコープ定義__: ==プロジェクト・スコープ記述書== を作り、__どこまでがこのプロジェクトか__の境界を確定する',
          '　__記述書に書くもの__: 製品スコープ記述／成果物／==受入基準==（何をもって完成とするか）／==除外事項==／前提・制約条件',
          '　　__除外事項の明示が効く__。「やらないこと」を先に書いておくと、後の「やってくれると思っていた」を防げる',
          '　==スコープ・クリープ==: __未承認のまま__機能が膨らんでいくこと。記述書と変更管理で止める',
          '__5.4 WBS 作成__: スコープを階層に分解して、抜けも重複もない作業の一覧にする',
          '　==WBS==（Work Breakdown Structure）: プロジェクト全体を ==成果物指向== で階層分解した図',
          '　　__成果物指向とは__、「設計する・作る・テストする」（作業順）ではなく「設計書・プログラム・テスト報告書」（成果物）で割ること',
          '　__分解の指針__: 成果物指向・MECE（漏れなく重複なく）・==8/80ルール==（1つが8〜80時間に収まる粒度）',
          '　==100%ルール==: WBS は__プロジェクトの全スコープを過不足なく__表す。__足りなければ作業漏れ、多ければスコープ外の作業__',
          '　__最下位の要素__が ==ワークパッケージ==。ここが見積もりと進捗管理の単位になる',
          '　==WBS辞書==: 各要素の詳細（作業内容・責任者・期間・コスト）を書いた付属文書',
          '　__成果物__は ==スコープ・ベースライン==（スコープ記述書 ＋ WBS ＋ WBS辞書 の3点セット）',
          '__WBS の下位の単位__:',
          '　==コントロール・アカウント==（CA）: スコープ・コスト・スケジュールを__まとめて管理する単位__。EVM の測定単位になる',
          '　==プランニング・パッケージ==: CA の中で__まだ詳細化していない__仮置きの塊。後で WP に割る',
          '__WBS の親戚__（何を軸に分解するかが違うだけ）:',
          '　==OBS==（組織ブレークダウンストラクチャ）: __誰が担当するか__で分解。WBS と掛け合わせると責任分担マトリクスになる',
          '　==CBS==（コストブレークダウンストラクチャ）: __費目__で分解。予算の集計軸',
          '　==RBS==（リスクブレークダウンストラクチャ）: __リスクのカテゴリ__で分解（uncertainty §5）',
        ],
        navyItems: [[{ text: '8/80ルール・100%ルール・成果物指向の3つはWBS問題の核。「作業順で分解する」は誤りの選択肢として頻出', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'WBS: 成果物指向でプロジェクト全スコープを階層分解する',
            ariaLabel: 'プロジェクトからフェーズ、主要成果物、ワークパッケージへ分解するWBS階層図',
            viewBox: '0 0 680 430',
            content: `
              <defs>
                <marker id="wbs-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="18" y="18" width="644" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
              <rect x="230" y="42" width="220" height="48" rx="8" fill="#9d5b8b" stroke="#6b3b61" stroke-width="2" />
              <text x="340" y="72" fill="white" font-size="16" font-weight="700" text-anchor="middle">プロジェクト</text>
              <line x1="340" y1="90" x2="340" y2="118" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <rect x="80" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <rect x="260" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <rect x="440" y="120" width="160" height="48" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="160" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ1</text>
              <text x="340" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ2</text>
              <text x="520" y="150" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">フェーズ3</text>
              <path d="M340 104 L340 112 M160 112 L520 112 M160 112 L160 120 M340 112 L340 120 M520 112 L520 120" fill="none" stroke="#64748b" stroke-width="2" />
              <line x1="160" y1="168" x2="160" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <line x1="340" y1="168" x2="340" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <line x1="520" y1="168" x2="520" y2="204" stroke="#64748b" stroke-width="2" marker-end="url(#wbs-arrow)" />
              <rect x="68" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <rect x="248" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <rect x="428" y="206" width="184" height="54" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="160" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="160" y="246" fill="#1e293b" font-size="12" text-anchor="middle">成果物指向</text>
              <text x="340" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="340" y="246" fill="#1e293b" font-size="12" text-anchor="middle">MECE</text>
              <text x="520" y="228" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">主要成果物</text>
              <text x="520" y="246" fill="#1e293b" font-size="12" text-anchor="middle">100%ルール</text>
              <path d="M340 260 L340 286 M160 286 L520 286 M160 286 L160 302 M340 286 L340 302 M520 286 L520 302" fill="none" stroke="#64748b" stroke-width="2" />
              <rect x="72" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="252" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <rect x="432" y="304" width="176" height="58" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="160" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="160" y="346" fill="#1e293b" font-size="12" text-anchor="middle">最下位要素</text>
              <text x="340" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="340" y="346" fill="#1e293b" font-size="12" text-anchor="middle">8〜80時間目安</text>
              <text x="520" y="327" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">ワークパッケージ</text>
              <text x="520" y="346" fill="#1e293b" font-size="12" text-anchor="middle">WBS辞書で詳細化</text>
              <text x="340" y="392" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">上位から下位へ「何を作るか」を分解し、作業順序は別途アクティビティで扱う</text>
            `,
          },
        ],
      },
      {
        heading: '4. スコープの妥当性確認とコントロール（5.5 / 5.6）',
        items: [
          '__作ったスコープを「受け入れてもらう」と「守る」の2プロセス__（どちらも監視・コントロール群）',
          '　==スコープ妥当性確認==（5.5）: 完成した成果物を__顧客／スポンサーが正式に受け入れる__手続き。技法は ==検査==',
          '　　__受入基準__（§3）と照らして合否を判断する。受入基準を先に決めていないと、ここで揉める',
          '　==スコープコントロール==（5.6）: スコープの状態を監視し、ベースラインへの変更を統制する。==スコープ・クリープ== を検出して是正する',
          '__間違えやすい対__:',
          '　==妥当性確認==（Validation）: __顧客が受け入れるか__。使い手の視点',
          '　==品質コントロール==（Verification）: __仕様どおり作れているか__。作り手の視点',
          '　__順序は 品質コントロール → 妥当性確認__。仕様どおりであることを自分で確かめてから、顧客に受け取ってもらう',
        ],
        navyItems: [[{ text: '「検証済みの成果物（8.3 の出力）」が「受入済みの成果物（5.5 の出力）」になる、という流れで覚える', style: 'navy' }]],
      },
      // ── C. スケジュールマネジメント（PMBOK6 第6章） ──
      {
        heading: '5. アクティビティの定義と順序設定（6.1 / 6.2 / 6.3）',
        items: [
          // 赤字密度メモ: PDM 4関係は判別問題の核心のため 9 個許容（方針書 §7）
          '__6.1 スケジュールマネジメント計画__: 単位・精度・ベースラインの更新ルール・EVM の適用方針など、__スケジュールをどう管理するか__を先に決める',
          '__6.2 アクティビティ定義__: WBS のワークパッケージを、__実際にやる作業__（アクティビティ）へ分解する',
          '　__マイルストーン__は ==所要時間 0==。「基本設計完了」のような__節目の出来事__を表すもので、作業ではない',
          '__6.3 アクティビティ順序設定__: 作業同士のつながりを決める',
          '__依存関係の4種類__（==PDM==、==プレシデンスダイアグラム法==。設問はカタカナ表記で出る）:',
          '　==FS==（Finish-to-Start）: 前作業完了後に後作業開始（最も一般的）',
          '　==FF==（Finish-to-Finish）: 前作業完了後に後作業完了',
          '　==SS==（Start-to-Start）: 前作業開始後に後作業開始',
          '　==SF==（Start-to-Finish）: 前作業開始後に後作業完了（最も稀）',
          '__依存関係の性質__: ==強制／任意／外部／内部==の4分類（物理的必須か・選好か・プロジェクト外か内か）',
          '==リード==（前倒し）／==ラグ==（遅延）: 依存関係に時間調整を加える',
        ],
        navyItems: [[{ text: '試験頻出: 4依存関係（特にFSとSF）の例示問題', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'PDMの4依存関係: FSが最頻出、SFは最も稀',
            ariaLabel: 'PDMのFS FF SS SFの4種類の依存関係を示す図',
            // モバイル優先の viewBox（幅400）
            viewBox: '0 0 400 396',
            content: `
              <defs>
                <marker id="pdm-arrow" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#475569" />
                </marker>
              </defs>
              <text x="14" y="20" fill="#475569" font-size="14" font-weight="700">前の作業の「何」が、後の作業の「何」を決めるか</text>

              <rect x="10" y="32" width="380" height="80" rx="9" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <text x="26" y="58" fill="#dc2626" font-size="17" font-weight="700">FS</text>
              <text x="66" y="58" fill="#1e293b" font-size="13.5" font-weight="700">完了 → 開始（最も一般的）</text>
              <rect x="26" y="70" width="120" height="30" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="86" y="90" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">A 完了</text>
              <line x1="150" y1="85" x2="230" y2="85" stroke="#475569" stroke-width="2.5" marker-end="url(#pdm-arrow)" />
              <rect x="242" y="70" width="120" height="30" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="302" y="90" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">B 開始</text>

              <rect x="10" y="122" width="380" height="80" rx="9" fill="#ffffff" stroke="#7c3aed" stroke-width="2" />
              <text x="26" y="148" fill="#7c3aed" font-size="17" font-weight="700">FF</text>
              <text x="66" y="148" fill="#1e293b" font-size="13.5" font-weight="700">完了 → 完了（終わりを揃える）</text>
              <rect x="26" y="160" width="120" height="30" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
              <text x="86" y="180" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">A 完了</text>
              <line x1="150" y1="175" x2="230" y2="175" stroke="#475569" stroke-width="2.5" marker-end="url(#pdm-arrow)" />
              <rect x="242" y="160" width="120" height="30" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="302" y="180" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">B 完了</text>

              <rect x="10" y="212" width="380" height="80" rx="9" fill="#ffffff" stroke="#16a34a" stroke-width="2" />
              <text x="26" y="238" fill="#16a34a" font-size="17" font-weight="700">SS</text>
              <text x="66" y="238" fill="#1e293b" font-size="13.5" font-weight="700">開始 → 開始（並行で走らせる）</text>
              <rect x="26" y="250" width="120" height="30" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="86" y="270" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">A 開始</text>
              <line x1="150" y1="265" x2="230" y2="265" stroke="#475569" stroke-width="2.5" marker-end="url(#pdm-arrow)" />
              <rect x="242" y="250" width="120" height="30" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="302" y="270" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">B 開始</text>

              <rect x="10" y="302" width="380" height="80" rx="9" fill="#ffffff" stroke="#f59e0b" stroke-width="2" />
              <text x="26" y="328" fill="#b45309" font-size="17" font-weight="700">SF</text>
              <text x="66" y="328" fill="#1e293b" font-size="13.5" font-weight="700">開始 → 完了（最も稀）</text>
              <rect x="26" y="340" width="120" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="86" y="360" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">A 開始</text>
              <line x1="150" y1="355" x2="230" y2="355" stroke="#475569" stroke-width="2.5" marker-end="url(#pdm-arrow)" />
              <rect x="242" y="340" width="120" height="30" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="302" y="360" fill="#1e293b" font-size="13" font-weight="700" text-anchor="middle">B 完了</text>
            `,
          },
        ],
      },
      {
        heading: '6. ネットワーク図とクリティカルパス法（6.5）',
        items: [
          // 赤字密度メモ: CPM は午前Ⅱ・午後Ⅰとも必出のため 14 個許容（方針書 §7）
          '__図の2形式__:',
          '　==AON==（Activity-On-Node）: __ノードが作業__、矢印が依存関係。PDM がこの形式で、__第6版の標準__',
          '　==AOA==（Activity-On-Arrow）: __矢印が作業__、ノードが結合点。アローダイアグラム／PERT図がこの形式',
          '　　==ダミー作業==: AOA で__順序関係だけ__を表すための所要時間0の仮想作業（点線矢印）',
          '__各ノードが持つ4つの日付__:',
          '　==最早開始（ES）== ／ ==最早完了（EF）==: 前から詰めて__最も早く__着手・完了できる日',
          '　==最遅開始（LS）== ／ ==最遅完了（LF）==: 全体を遅らせずに済む__最も遅い__着手・完了日',
          '==クリティカルパス法==（CPM）: ==最長== の経路をクリティカルパスとし、そこからプロジェクトの ==最短期間== を求める',
          '　__経路は最長・期間は最短__。最長の道のりを通らないと終われないから、それが全体の最短期間になる',
          '__日数の求め方__（午後Ⅰの計算はこの2パスで解ける）:',
          '　__1.__ ==フォワードパス==（開始→終了）: ES・EF を出す。EF = ES + 所要時間。__合流点では先行 EF の最大値__を取る',
          '　__2.__ ==バックワードパス==（終了→開始）: LF・LS を出す。LS = LF − 所要時間。__分岐点では後続 LS の最小値__を取る',
          '　__3.__ フロートを計算し、==TF = 0== の経路がクリティカルパス',
          '　__合流は最大・分岐は最小__。ここの取り違えが計算問題の定番の失点',
          '__2つのフロート__:',
          '　==トータルフロート==（TF、IPA は ==総余裕時間==）= LS − ES = LF − EF。__プロジェクト全体を遅らせない__余裕',
          '　==フリーフロート==（FF）= 後続の ES − 当該の EF。__後続作業を遅らせない__余裕',
          '　CP 上の作業が遅れると、そのままプロジェクト全体の遅れになる',
          '==クリティカルチェーン法==（CCPM）: CPM に __資源の制約__ を加えた発展形',
          '　各作業の見積もりから__安全余裕を抜き__、経路の最後にまとめて ==プロジェクトバッファ== として置く',
          '　CP へ合流する枝には __フィーディングバッファ__ を置き、__バッファの消費率__で進捗を管理する',
          '　__狙い__: 作業ごとに余裕を持たせると__余裕分だけ使い切ってしまう__（学生症候群・パーキンソンの法則）ため、余裕を1か所に集めて共有する',
          '__資源最適化__: ==資源平準化==（期間の延長を許して山を崩す）／==資源平滑化==（フロートの範囲内だけで調整し期間は変えない）',
        ],
        navyItems: [[{ text: 'クリティカルチェーン法は12年で8回出題（R5問6/R5問8/R3問7/R1問4/H29問1/H27問7/H26問9/H25問7）。バッファをどこに置くかが問われる', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '最長の経路がクリティカルパス。ここが遅れると全体が遅れる',
            ariaLabel: 'A3日B4日D5日の経路が合計12日でクリティカルパス、C2日E3日の経路は余裕があることを示すネットワーク図',
            viewBox: '0 0 400 300',
            content: `
              <defs>
                <marker id="cpm2-arrow" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#94a3b8" />
                </marker>
                <marker id="cpm2-red" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#dc2626" />
                </marker>
              </defs>
              <text x="20" y="22" fill="#991b1b" font-size="14" font-weight="700">クリティカルパス: A → B → D ＝ 12日</text>

              <path d="M52 96 L96 68" fill="none" stroke="#dc2626" stroke-width="3.5" />
              <path d="M148 60 L186 60" fill="none" stroke="#dc2626" stroke-width="3.5" marker-end="url(#cpm2-red)" />
              <path d="M238 60 L276 60" fill="none" stroke="#dc2626" stroke-width="3.5" marker-end="url(#cpm2-red)" />
              <path d="M328 68 L354 96" fill="none" stroke="#dc2626" stroke-width="3.5" marker-end="url(#cpm2-red)" />

              <path d="M52 116 L96 168" fill="none" stroke="#94a3b8" stroke-width="2.5" />
              <path d="M148 176 L186 176" fill="none" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#cpm2-arrow)" />
              <path d="M238 176 L340 118" fill="none" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#cpm2-arrow)" />

              <circle cx="34" cy="106" r="24" fill="#ffffff" stroke="#475569" stroke-width="2" />
              <text x="34" y="103" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">開始</text>
              <text x="34" y="118" fill="#64748b" font-size="10" text-anchor="middle">0日</text>

              <circle cx="122" cy="60" r="26" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
              <text x="122" y="56" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">A</text>
              <text x="122" y="72" fill="#991b1b" font-size="10" text-anchor="middle">3日 TF0</text>

              <circle cx="212" cy="60" r="26" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
              <text x="212" y="56" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">B</text>
              <text x="212" y="72" fill="#991b1b" font-size="10" text-anchor="middle">4日 TF0</text>

              <circle cx="302" cy="60" r="26" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
              <text x="302" y="56" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">D</text>
              <text x="302" y="72" fill="#991b1b" font-size="10" text-anchor="middle">5日 TF0</text>

              <circle cx="122" cy="176" r="26" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="122" y="172" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">C</text>
              <text x="122" y="188" fill="#1d4ed8" font-size="10" text-anchor="middle">2日</text>

              <circle cx="212" cy="176" r="26" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="212" y="172" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">E</text>
              <text x="212" y="188" fill="#1d4ed8" font-size="10" text-anchor="middle">3日</text>

              <circle cx="372" cy="106" r="24" fill="#ffffff" stroke="#475569" stroke-width="2" />
              <text x="372" y="103" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">終了</text>
              <text x="372" y="118" fill="#64748b" font-size="10" text-anchor="middle">12日</text>

              <text x="20" y="238" fill="#991b1b" font-size="13" font-weight="700">赤い経路: 余裕ゼロ（TF0）。1日遅れると終了日も1日遅れる</text>
              <text x="20" y="262" fill="#1d4ed8" font-size="13" font-weight="700">青い経路: 3+2+3 ＝ 8日なので4日の余裕がある</text>
              <text x="20" y="288" fill="#475569" font-size="12.5" font-weight="700">短縮策は赤い経路に打つ。青を縮めても全体は変わらない</text>
            `,
          },
        ],
      },
      {
        heading: '7. 所要時間・工数の見積もり（6.4）',
        items: [
          // 赤字密度メモ: 見積もり4技法+PERT式は午前Ⅱ最頻出のため 8 個許容（方針書 §7）
          '__4つの技法は「精度」と「かかる手間」のトレードオフ__:',
          '　==類推見積もり==: 過去の類似案件から丸ごと当てはめる。__早くて安いが精度は最低__。情報が乏しい立上げ期向け',
          '　==パラメトリック見積もり==: 単価×数量の統計的関係を使う（例: 1,000行で1人月なら5,000行は5人月）。__規模が測れれば速い__',
          '　==3点見積もり==: 楽観値(O)・最確値(M)・悲観値(P)から算出する。__ばらつきを織り込める__',
          '　　三角分布: (O+M+P)/3 ／ ベータ分布（==PERT==）: ==(O+4M+P)/6==（最確値を4倍に重み付け）',
          '　　標準偏差 ==σ = (P−O)/6==。楽観と悲観の幅が広いほど不確かさが大きい',
          '　==ボトムアップ見積もり==: WBS の各要素を積み上げる。__最も精度が高いが最も手間がかかる__',
          '__精度の序列__: ==ボトムアップが最高・類推が最低==。この対比がそのまま出題される',
          '__フェーズで使い分ける__: 立上げは類推（情報不足）→ 計画初期はパラメトリック → 計画詳細はボトムアップ。__複数技法を併用して突き合わせる__のが実務',
          '==学習曲線==（習熟曲線）: 同じ作業を繰り返すほど__単位あたりの時間が短くなる__という経験則。後半工程を短く見込む根拠になる',
          '　__逆向きにも効く__。新技術や新規メンバーの投入直後は習熟前なので生産性が落ちる。__要員追加が即戦力にならない__のはこのため',
          '__予備期間__: コンティンジェンシー予備（既知のリスク用）／マネジメント予備（未知のリスク用）→ §11',
        ],
        navyItems: [[{ text: 'PERT 期待値 (O+4M+P)/6 と σ = (P-O)/6 は必須暗記。M を4倍する点と、σ は6で割る点を混同しない', style: 'navy' }]],
      },
      {
        heading: '8. スケジュール短縮（クラッシング・ファストトラッキング）',
        items: [
          // 赤字密度メモ: 2手法の定義と短所の対比は午後Ⅰ記述の定番のため 7 個許容（方針書 §7）
          '__スケジュール短縮の2手法__:',
          '　==クラッシング==（Crashing）: 資源追加で工期短縮（残業・要員追加・外注等）。短所は==コスト増大==',
          '　==ファストトラッキング==（Fast Tracking）: 本来順次のアクティビティを==並列==実行。短所は==リスク増大==（手戻り・品質低下）',
          '__選択基準__: 追加コストを許容できるならクラッシング、コスト増を避けたいが手戻りリスクを許容できるならファストトラッキング',
          '__コスト・スロープ__: コスト増分÷短縮日数。クラッシングは==小さい順==に適用するのが最も経済的',
          '__注意__: どちらの手法も==クリティカルパス上==のアクティビティが対象（非クリティカルにかけても全体は縮まない）',
        ],
        navyItems: [[{ text: '試験頻出: 短縮対象の選定（CP上・コストスロープ最小）は午後Ⅰの計算・記述の定番', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'スケジュール短縮: クラッシングはコスト増、ファストトラッキングはリスク増',
            ariaLabel: 'クラッシングとファストトラッキングの違いを比較する図',
            viewBox: '0 0 700 430',
            content: `
              <rect x="18" y="18" width="664" height="394" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <rect x="42" y="52" width="292" height="318" rx="10" fill="#ffffff" stroke="#cbd5e1" />
              <rect x="366" y="52" width="292" height="318" rx="10" fill="#ffffff" stroke="#cbd5e1" />
              <text x="188" y="84" fill="#1e293b" font-size="17" font-weight="700" text-anchor="middle">クラッシング</text>
              <text x="512" y="84" fill="#1e293b" font-size="17" font-weight="700" text-anchor="middle">ファストトラッキング</text>
              <text x="188" y="108" fill="#475569" font-size="12" text-anchor="middle">追加資源で期間短縮</text>
              <text x="512" y="108" fill="#475569" font-size="12" text-anchor="middle">順次作業を並列化</text>
              <line x1="86" y1="154" x2="290" y2="154" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
              <line x1="86" y1="154" x2="290" y2="154" stroke="#64748b" stroke-width="20" stroke-linecap="round" />
              <text x="188" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">通常 10日</text>
              <line x1="86" y1="216" x2="244" y2="216" stroke="#dc2626" stroke-width="20" stroke-linecap="round" />
              <text x="165" y="222" fill="white" font-size="12" font-weight="700" text-anchor="middle">短縮 7日</text>
              <path d="M252 204 L286 188 L286 238 Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="282" y="218" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">￥+</text>
              <rect x="82" y="270" width="212" height="52" rx="8" fill="#fee2e2" stroke="#dc2626" />
              <text x="188" y="292" fill="#991b1b" font-size="13" font-weight="700" text-anchor="middle">コスト増大</text>
              <text x="188" y="310" fill="#991b1b" font-size="12" text-anchor="middle">残業・要員追加・外注</text>
              <line x1="410" y1="154" x2="520" y2="154" stroke="#2563eb" stroke-width="20" stroke-linecap="round" />
              <line x1="532" y1="154" x2="620" y2="154" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />
              <text x="465" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">A</text>
              <text x="576" y="160" fill="white" font-size="12" font-weight="700" text-anchor="middle">B</text>
              <text x="512" y="184" fill="#475569" font-size="12" text-anchor="middle">通常: A完了後にB開始</text>
              <line x1="410" y1="230" x2="548" y2="230" stroke="#2563eb" stroke-width="20" stroke-linecap="round" />
              <line x1="486" y1="256" x2="620" y2="256" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />
              <text x="479" y="236" fill="white" font-size="12" font-weight="700" text-anchor="middle">A</text>
              <text x="553" y="262" fill="white" font-size="12" font-weight="700" text-anchor="middle">B</text>
              <text x="512" y="296" fill="#475569" font-size="12" text-anchor="middle">短縮: 一部を重ねる</text>
              <rect x="406" y="318" width="212" height="34" rx="8" fill="#fef3c7" stroke="#f59e0b" />
              <text x="512" y="340" fill="#92400e" font-size="13" font-weight="700" text-anchor="middle">リスク増大・手戻り注意</text>
              <text x="350" y="396" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">どちらもクリティカルパス上の作業を短縮対象にするのが原則</text>
            `,
          },
        ],
      },
      {
        heading: '9. スケジュールコントロールと工程管理図表（6.6）',
        items: [
          // 赤字密度メモ: 工程管理図表の名称がそのまま解答語のため 7 個許容（方針書 §7）
          'ベースラインに対する進捗監視と変更管理を行う（監視・コントロール群）',
          '__主要技法__: EVM による差異分析／クリティカルパス分析／スケジュール短縮（§17）',
          '__工程管理図表__は「何が読み取れるか」で使い分ける。__この判別が午前Ⅱで繰り返し出る__（R3問5・R2問6・R1問3・H29問8・H27問8）',
          '　==ガントチャート==: 横軸に時間、作業ごとに__横棒__を引く。__各作業の開始・終了と現在の進み具合__が一目で分かる',
          '　　__弱点は作業間の関係が分からない__こと。どれが遅れると全体が遅れるかは読めない',
          '　==アローダイアグラム==（==PERT図==）: 作業を矢印、結合点を丸で表す。__作業の順序・依存関係とクリティカルパス__が読める',
          '　　__弱点は個々の進捗が分からない__こと。ガントチャートと補い合う関係',
          '　==イナズマ線==: ガントチャート上に、評価日の実績到達点を結んだ折れ線を引く。__どの作業がどれだけ進み・遅れているか__が視覚化される',
          '　　__前提__: 成果が日ごとに一定量ずつ増えること。計上ルールが揃っていないと線の意味が崩れる',
          '　==トレンドチャート==: 累積の計画と実績を時系列で比べ、__このままの傾向でどうなるか__を見る',
          '__覚え方__: __棒なら各作業の期間（ガント）／矢印なら順序と経路（アロー）／折れ線なら進捗のズレ（イナズマ）__',
        ],
        navyItems: [[{ text: '設問は「工程管理図表の特徴に関する記述のうち、ガントチャートのものはどれか」の形。作業間の関連が分かるかどうかが選択肢の分かれ目', style: 'navy' }]],
      },
      // ── D. コストマネジメント（PMBOK6 第7章） ──
      {
        heading: '10. コストの見積もりと精度（7.1 / 7.2）',
        items: [
          '__7.1 コストマネジメント計画__: 測定単位・精度・==スレッショルド==（差異がどこを超えたら手を打つかの閾値）・EVM の適用方針を先に決める',
          '__7.2 コスト見積もり__: 技法は所要時間の見積もり（§7）と同じ4つ（類推／パラメトリック／ボトムアップ／3点）',
          '__精度は段階で変わる__。__同じ「見積もり」でも精度が桁違い__である点が問われる',
          '　==ROM 見積もり==（超概算, Rough Order of Magnitude）: ==-25%〜+75%==。__構想段階__。ざっくり桁が合っていればよい',
          '　==確定見積もり==（Definitive）: ==-5%〜+10%==。__詳細設計後__。契約や予算の根拠にできる',
          '　__精度が上がるのは情報が増えるから__。早い段階で確定見積もりを求められても出せない、というのが実務の論点',
          '__コストに含めるもの__: 人件費だけでなく、設備・ライセンス・外注費・移行費・予備費まで含める。__運用開始後の費用__を含めるかは計画時に定義する',
        ],
        navyItems: [[{ text: 'ROM は -25%〜+75%、確定見積もりは -5%〜+10%。数字がそのまま選択肢になる', style: 'navy' }]],
      },
      {
        heading: '11. 予算設定とコスト・ベースライン（7.3）',
        items: [
          'コスト見積もりを集約し==コスト・ベースライン==を作成するプロセス',
          '__構成__（積層構造・下から上へ）:',
          '　アクティビティ・コスト見積もり（最小単位）',
          '　コントロール・アカウント単位の集計',
          '　==コンティンジェンシー予備==（既知リスク用、ベースラインに含む）',
          '　コスト・ベースライン（タイム・フェーズド予算、累積 S カーブ）',
          '　==マネジメント予備==（未知リスク用、ベースライン外）',
          '　==プロジェクト予算==（コスト・ベースライン＋マネジメント予備）',
          '__重要な区別__: コスト・ベースラインはマネジメント予備を==含まない==',
          'マネジメント予備の使用には正式な変更承認が必要',
        ],
        navyItems: [[{ text: 'コスト・ベースライン vs プロジェクト予算 vs マネジメント予備の階層は午前Ⅱ 頻出', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'コスト階層: コスト・ベースラインはマネジメント予備を含まない',
            ariaLabel: 'アクティビティ見積もりからコストベースラインとプロジェクト予算までの階層図',
            viewBox: '0 0 700 470',
            content: `
              <rect x="18" y="18" width="664" height="434" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="350" y="48" fill="#1e293b" font-size="16" font-weight="700" text-anchor="middle">予算設定の積層構造</text>
              <rect x="150" y="334" width="400" height="46" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="350" y="362" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">アクティビティ・コスト見積もり</text>
              <rect x="150" y="282" width="400" height="46" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="350" y="310" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">コントロール・アカウント集計</text>
              <rect x="150" y="230" width="400" height="46" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="350" y="258" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">コンティンジェンシー予備（既知リスク）</text>
              <rect x="122" y="166" width="456" height="52" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
              <text x="350" y="188" fill="#991b1b" font-size="15" font-weight="700" text-anchor="middle">コスト・ベースライン</text>
              <text x="350" y="207" fill="#991b1b" font-size="12" font-weight="700" text-anchor="middle">ここまでが承認済みのタイムフェーズド予算</text>
              <rect x="122" y="104" width="456" height="46" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2" />
              <text x="350" y="132" fill="#1e293b" font-size="14" font-weight="700" text-anchor="middle">マネジメント予備（未知リスク・ベースライン外）</text>
              <rect x="94" y="70" width="512" height="326" rx="12" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="8 6" />
              <text x="610" y="88" fill="#475569" font-size="13" font-weight="700">プロジェクト予算</text>
              <path d="M582 108 L632 108 L632 380 L582 380" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M594 104 L612 108 L594 112" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M594 376 L612 380 L594 384" fill="none" stroke="#64748b" stroke-width="2" />
              <path d="M108 166 L78 166 L78 218 L108 218" fill="none" stroke="#dc2626" stroke-width="3" />
              <text x="72" y="188" fill="#991b1b" font-size="12" font-weight="700" text-anchor="end">ベースライン</text>
              <text x="72" y="206" fill="#991b1b" font-size="12" font-weight="700" text-anchor="end">管理対象</text>
              <text x="350" y="424" fill="#475569" font-size="12" font-weight="700" text-anchor="middle">試験では「マネジメント予備はコスト・ベースラインに含まない」を最優先で確認する</text>
            `,
          },
        ],
      },
      {
        heading: '12. コストコントロールと経済性評価（7.4）',
        items: [
          '__7.4 コストコントロール__: ==EVM== で PV／EV／AC から CV・SV・CPI・SPI・EAC を算出し、差異を追う（監視・コントロール群）',
          '　公式と計算は measurement カテゴリで扱う。ここでは__コストの良し悪しを何で判断するか__を押さえる',
          '__案件をやるかどうかの判断は経済性評価__。プロジェクト選定や、途中の継続判断で使う',
          // 赤字密度メモ: 経済性評価は計算問題頻出のため 8 個許容（方針書 §7）
          '　==NPV==（正味現在価値）: 将来のキャッシュフローを__現在の価値に割り引いて__合計する。==NPV > 0== なら採算あり',
          '　　__割り引く理由__: 同じ100万円でも今もらう方が価値が高いから。将来の金額をそのまま足すと過大評価になる',
          '　==IRR==（内部収益率）: __NPV がちょうど 0 になる割引率__。==IRR > 資本コスト== なら採算あり',
          '　　__NPV と IRR の使い分け__: 規模の違う案件を比べるなら NPV（金額）、投資効率を比べるなら IRR（率）',
          '　==ROI==（投資収益率）= (利益 − 投資) ÷ 投資。__単純で分かりやすいが時間価値を無視する__',
          '　==回収期間==: 投資を回収するまでの期間。__短いほど良い__が、__回収後の利益を評価できない__欠点がある',
          '　　資金繰りが厳しいときや不確実性が高いときは、回収期間を重視する判断もある',
          '==埋没費用==（sunk cost）: __すでに支出して戻らないコスト__。継続か中止かの判断に__含めてはいけない__',
          '　「ここまで投資したのだから続けよう」は誤り。__これから先の費用と便益__だけで判断する',
        ],
        navyItems: [[{ text: 'NPV>0／IRR>資本コスト／回収期間は短いほど良い、の3判定を確実に。埋没費用は判断に含めないのが原則', style: 'navy' }]],
      },
      // ── E. リスク・調達計画 ──
      {
        heading: '13. 計画段階のリスク識別とリスク登録簿',
        items: [
          '__計画の一部としてリスクを洗い出す__。リスクの分析・対応の詳細は uncertainty カテゴリで扱う',
          '__識別の技法__: ブレーンストーミング／チェックリスト／インタビュー／==SWOT==分析／==プロンプトリスト==（PESTLE・TECOP・VUCA といった観点の型）',
          '　==RBS==（リスク・ブレークダウン・ストラクチャー）: リスクを__カテゴリ別に階層分解__した枠組み',
          '　　例: 技術／外部／組織／プロジェクトマネジメント。__枠があると漏れに気づける__のが効用（WBS と同じ発想）',
          '__書き方の型__: リスクは「==事象・原因・影響==」の3点セットで書く',
          '　「テストが遅れる」だけでは動けない。「__要員の確保が遅れたため__（原因）__結合テストが2週間遅延し__（事象）__本番稼働に間に合わない__（影響）」まで書く',
          '__脅威（マイナス）と機会（プラス）の両方__を扱うのが PMBOK の立場',
          '==リスク登録簿==: リスク情報を集約する中心の文書',
          '　__記載項目__: リスクID／記述（事象・原因・影響）／カテゴリ／確率／影響度／リスク・スコア（確率×影響度）／==リスク・オーナー==／対応戦略／==トリガー==',
          '　　==リスク・オーナー==は__必ず決める__。「みんなで見る」は誰も見ない',
          '　　==トリガー==は__発生の前兆__。これを決めておくと、起きてからでなく__予兆の段階で__動ける',
          '　__更新するタイミング__: 各リスクプロセスの都度／フェーズゲート／変更承認時／定例リスクレビュー。__作って終わりの文書ではない__',
        ],
        navyItems: [[{ text: '「事象・原因・影響」の3要素とリスク・オーナー、トリガーは午後Ⅰの記述でそのまま使える', style: 'navy' }]],
      },
      {
        heading: '14. 調達計画とステークホルダー登録簿の活用',
        items: [
          '__調達計画で決める最大の論点__は ==make-or-buy 分析==（内製にするか外に出すか）',
          '　__コストだけで決めない__。スキルと能力／スケジュール／==コア・コンピタンス==（戦略的に手放してよいか）／知的財産の帰属／調達先の信頼性を合わせて判断する',
          '　__中核技術を外に出すと__、短期的には安くても長期的に自社に知見が残らない',
          '__計画段階で作る文書__:',
          '　調達マネジメント計画書・調達戦略（契約形態・支払条件・選定基準）',
          '　入札文書 ==RFP==（提案依頼）／==RFQ==（見積依頼）',
          '　==SOW==（調達作業範囲記述書）: 委託する作業の範囲を定義する',
          '　==独立コスト見積もり==: 相手の提示額が妥当かを__自前の見積もりで検証する__ための基準値',
          '　契約形態（固定価格・実費精算・T&M）の詳細は project-work カテゴリで扱う',
          '__ステークホルダー登録簿は計画の各所で参照される__: 要求収集の対象者／マイルストーンの承認者／CCB メンバー／リスクの影響を受ける人／供給者の選定',
          '　__エンゲージメント計画書とコミュニケーション計画書の整合__に注意。誰にいつ何を伝えるかが食い違うと、承認が滞る',
        ],
        navyItems: [[{ text: 'make-or-buy はコスト比較に見えて、実際は「自社の強みを手放さないか」を問われることが多い', style: 'navy' }]],
      },
      // ── F. 計画統合と PMBOK7 ──
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '15. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__WBS__: ==8/80ルール==・==100%ルール==・==成果物指向==・ワークパッケージ',
          '__依存関係__: PDM ==FS/FF/SS/SF==の例示判別',
          '__CPM__: ==クリティカルパス==特定・==トータルフロート==計算・遅延影響',
          '__PERT__: 期待値 (O+4M+P)/6 ・標準偏差 (P-O)/6 の計算',
          '__スケジュール短縮__: ==クラッシング==（コスト追加）vs ==ファストトラッキング==（並列化・リスク増）',
          '__見積もり技法__: 4技法（==類推==／==パラメトリック==／==ボトムアップ==／==3点==）の特徴対比',
          '__コスト・ベースライン__: ==マネジメント予備==を含まない（プロジェクト予算 = ベースライン + マネジメント予備）',
          '__経済性評価__: ==NPV==計算・==IRR==と資本コスト・==回収期間==',
          '__リスク識別__: ==RBS==・==SWOT==・プロンプトリスト（PESTLE）',
          '__調達計画__: ==make-or-buy 分析==・==SOW==・入札文書（==RFP==/==RFQ==）',
        ],
      },
      {
        heading: '16. ひっかけパターン',
        items: [
          '__妥当性確認 vs 品質コントロール__: 妥当性確認 = 顧客の==受入==（Validation）、品質コントロール = 仕様への==適合==（Verification）',
          '__コスト・ベースライン vs プロジェクト予算__: ==マネジメント予備==の==含む／含まない==',
          '__コンティンジェンシー予備 vs マネジメント予備__: 既知リスク（ベースラインに==含まれる==）vs 未知リスク（==含まれない==）',
          '__クラッシング vs ファストトラッキング__: コスト増 vs リスク増。どちらも==クリティカルパス上==のアクティビティが対象',
          '__PERT 公式__: 期待値は==重み付き==(O+4M+P)/6、標準偏差は==(P-O)/6==',
          '__フロート__: トータルフロート vs フリーフロート（フリー = 後続を遅らせない）',
          '__見積もり精度__: ==ボトムアップが最高==・==類推が最低==',
          '__依存関係__: ==FS==（最頻出）vs ==SF==（最稀）の例示混同',
          '__PMBOK6 vs PMBOK7__: ==プロセス・ITTO==（第6版）vs ==パフォーマンス領域==（第7版）',
          '__make-or-buy__: コストだけでなく==戦略・コア・コンピタンス==も判断軸',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '17. 午後Ⅰの定石（計画・スケジュール・コスト）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7、§32/33 と同扱い）
          '午後Ⅰの計画系設問は知識の再現ではなく「本文の状況に定石を当てはめ、理由を30〜40字で書く」形式。以下の定石を解答の根拠に使う',
          '__1. 必達期限は逆算＋クリティカルパス死守__: 期限固定の案件は==クリティカルパス==を特定し、CP上の作業の遅延予兆を最優先で監視する。短縮策もCP上に打つ（H25問1・H29問1・R1問3）',
          '__2. 遅延リカバリは定量把握→CP→対策の順__: SPI等で遅延を定量把握し、クリティカルパスへの影響を確認してから対策を選ぶ。要員追加は==教育・習熟==の間、既存要員の生産性まで下げる点を考慮（H28問3・H27問3）',
          '__3. 間に合わないならスコープを分割__: 全機能が期限に収まらないときは優先度で分割し==段階的リリース==にする。取捨の基準は業務継続・事業価値・法令対応（R4問1・H29問1・R2問3）',
          '__4. 不確実な工程は段階的詳細化__: 遠い工程は粗く・近い工程は詳細に計画し、詳細化のタイミング自体を計画に組み込む（==ローリングウェーブ計画==）（R3問1）',
          '__5. 予備費は種類と承認者で使い分け__: 特定済みリスクには==コンティンジェンシー予備==（PM権限で使用）、想定外には==マネジメント予備==（上位の承認が必要）。どちらから充当するかが問われる（R3問3）',
          '__6. WBSの漏れは全計画を狂わせる__: 見積もり・進捗管理の土台はWBS。==100%ルール==を満たすかレビューし、漏れ作業を早期に発見する（R1問2）',
          '__7. 進捗は自己申告でなく出来高で測る__: 「90%完了」の自己申告は当てにならない。==出来高==（成果物の完成基準・重み付け）で客観測定する（H26問2）',
          '__8. 与えられた前提・スコープを疑う__: 計画の前提（既存資産の流用可否・データ品質等）に誤りがないか計画段階で検証する。前提崩れは最大の手戻り要因（H25問2）',
          '__9. 見積もりの妥当性は比較で確認__: 1社見積もりを鵜呑みにせず==相見積り==や独立コスト見積もりと比較して妥当性を確認する（H26問3）',
          '__10. 制約がリスクの源__: 必達期限・固定予算・限られた要員という制約からリスクを洗い出し、対応を計画に織り込む（R1問1・H29問1）',
          '__11. 兼任要員は稼働率を明示__: 他業務と掛け持ちのメンバーは稼働割合を明確化し、業務間の優先度調整ルールを事前に決める（R6問2）',
          '__12. 環境変化はスコープから見直す__: 合併・制度変更などが起きたら、まずスコープへの影響を判断し、その後にスケジュール・コストを見直す（H25問3）',
          '__13. 標準プロセスはテーラリングして使う__: 組織標準をそのまま強制せず、案件特性に合わせ==修整（テーラリング）==する。全体で揃える所とチームに任せる所を見極める（R6問3）',
          '__14. 設問の限定語で解答の向きを固定__: 「事業の観点で」「理由を」等の限定語が解答の方向を決める。因果（〜だから〜する）で書き、本文の言葉を言い換えて使う（R6問1ほか全問共通）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==WBS==（8/80ルール・100%ルール・成果物指向）／==CPM==（クリティカルパス・フロート計算）／==PERT==（期待値・標準偏差）は午前Ⅱ 必出。',
      '【スケジュール】==PDM==の4依存関係（==FS/FF/SS/SF==）。==クラッシング==（コスト増）vs ==ファストトラッキング==（リスク増）。',
      '【コスト】==コスト・ベースライン==はマネジメント予備を==含まない==。見積もり精度は==ボトムアップが最高==・==類推が最低==。',
      '【経済性評価】==NPV==計算（現在価値割引）／==IRR==と資本コスト／==回収期間==の長短評価。',
      '【ひっかけ】==Validation==（顧客受入）vs ==Verification==（仕様適合）／==コンティンジェンシー==vs ==マネジメント予備==／==FS vs SF==の混同。',
    ],
  },

  // ───────────────────────────────────────────
  // 5. プロジェクト作業（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'project-work': {
    summary:
      'プロジェクトの実行・調達・知識管理・コミュニケーションを扱う活動領域。PMBOK第6版では第4/9/10/12章に分散、第7版では「プロジェクト作業」パフォーマンス領域として統合。契約形態（FP/CR/T&M）と請負・準委任が試験頻出。',
    sections: [
      // ── A. 全体像 ──
      {
        heading: '1. プロジェクト作業とは（実行・監視・コントロールのループ）',
        items: [
          'このカテゴリが扱うのは__計画を実際に回す段階__。計画どおりに作業し、ずれを見つけ、直す、の繰り返しである',
          '__3つの活動が回り続ける__:',
          '　__実行__: 計画どおりに作業して成果物を作る。ここで出てくるのが==作業パフォーマンス・データ==（完了率・実コストといった生の数字）',
          '　__監視__: 計画と実績のずれを追跡する。生データを分析して「何が起きているか」が分かる形にする',
          '　__コントロール__: ずれを埋める手を打つ。すでに起きた問題を直すのが==是正処置==、起きそうな問題を先に防ぐのが==予防処置==',
          '__このループが止まると__、作業は進んでいるのに問題が見えない状態になる。監視とコントロールは実行の後工程ではなく、実行と同時に回し続けるもの',
          '__PMBOK上の位置づけ__: 第7版の「プロジェクト作業」パフォーマンス領域。第6版では統合（第4章）・資源（第9章）・コミュニケーション（第10章）・調達（第12章）に分散していた実行系・監視系プロセスをまとめた領域',
        ],
        navyItems: [[{ text: 'このカテゴリの重心は調達と契約。午前Ⅱ・午後Ⅰとも出題の大半が契約形態・請負/準委任・委託先管理に集中する', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '実行で数字が出て、監視でずれが見え、コントロールで手を打つ',
            ariaLabel: '実行、監視、コントロールが縦に並び、コントロールから実行へ戻る循環を示す図',
            viewBox: '0 0 400 320',
            content: `
              <defs>
                <marker id="pwloop-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto">
                  <polygon points="0 0, 9 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="70" y="26" width="310" height="72" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="88" y="54" fill="#1d4ed8" font-size="17" font-weight="700">実行</text>
              <text x="88" y="78" fill="#1e293b" font-size="13">計画どおり作業し、成果物と生データを出す</text>
              <line x1="225" y1="98" x2="225" y2="118" stroke="#64748b" stroke-width="2.5" marker-end="url(#pwloop-arrow)" />
              <text x="238" y="114" fill="#475569" font-size="12">作業パフォーマンス・データ</text>

              <rect x="70" y="122" width="310" height="72" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="88" y="150" fill="#15803d" font-size="17" font-weight="700">監視</text>
              <text x="88" y="174" fill="#1e293b" font-size="13">計画と実績のずれを追跡して原因を掴む</text>
              <line x1="225" y1="194" x2="225" y2="214" stroke="#64748b" stroke-width="2.5" marker-end="url(#pwloop-arrow)" />
              <text x="238" y="210" fill="#475569" font-size="12">差異・予測</text>

              <rect x="70" y="218" width="310" height="72" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="88" y="246" fill="#b45309" font-size="17" font-weight="700">コントロール</text>
              <text x="88" y="270" fill="#1e293b" font-size="13">是正処置（直す）・予防処置（防ぐ）を打つ</text>

              <path d="M70 254 L38 254 L38 62 L66 62" fill="none" stroke="#64748b" stroke-width="2.5" marker-end="url(#pwloop-arrow)" />
              <text x="16" y="164" fill="#475569" font-size="12" font-weight="700" transform="rotate(-90 16 164)">繰り返す</text>
            `,
          },
        ],
      },
      {
        heading: '2. 実行のプロセス群（作業の指揮・知識・資源・情報配信）',
        items: [
          '__実行プロセス群でやること__は4つ。いずれも「計画を動かして、動いた記録を残す」ための活動',
          '　==4.3 プロジェクト作業の指揮・マネジメント==: 実行の中心プロセス。計画書どおりに作業させ、==承認された変更==を実装する',
          '　　ここから出るもの: 成果物／==作業パフォーマンス・データ==／==問題ログ==（発生した問題と担当・期限）／変更要求',
          '　　__承認された変更だけを実装する__のが要点。現場判断で仕様を変えると計画と実績が突き合わなくなる',
          '　==4.4 プロジェクト知識のマネジメント==: 既存の知識を使い、新しい知識を生む活動（第6版で新設）。成果物は==教訓登録簿==（→ §10）',
          '　==9.3 資源の獲得==: 要員・設備・資材を確保する。要員の獲得と育成は team カテゴリで扱う',
          '　==10.2 コミュニケーションのマネジメント==: 情報を集め、届け、保管する。__届け方は3つ__:',
          '　　==プッシュ型==: 送り手から一方的に届ける（メール・報告書）。__読んだ保証はない__',
          '　　==プル型==: 受け手が取りに行く（共有フォルダ・ポータル）。__大量情報向き__',
          '　　==インタラクティブ型==: その場でやり取りする（会議・打合せ）。__認識合わせに最も確実__',
          '　　__使い分け__: 合意や意思決定が要るならインタラクティブ型。周知だけならプッシュ型、参照用ならプル型',
        ],
        navyItems: [[{ text: '午後Ⅰでは「重要な合意をメールだけで済ませた」ことが失敗要因として問われる。認識合わせは対面・会議が定石', style: 'navy' }]],
      },
      {
        heading: '3. 監視・コントロールのプロセス群と統合変更管理',
        items: [
          '__監視・コントロール群でやること__は「ずれを見つけて、直す手続きに乗せる」こと',
          '　==4.5 プロジェクト作業の監視・コントロール==: 全体の進捗・パフォーマンスを監視し、==作業パフォーマンス報告書==（→ §4）と変更要求を出す',
          '　==4.6 統合変更管理==: すべての変更要求を__一箇所で__評価・承認・実装する。個別に握らせないことが目的',
          '　==9.6 資源のコントロール==: __物的資源__（設備・材料）が対象。__チームの管理は 9.5__ で別プロセス。この 9.5 と 9.6 の取り違えが午前Ⅱのひっかけ',
          '　==10.3 コミュニケーションの監視==: 情報が届いて理解されているかを確認する',
          '__変更管理の流れ__（この順序が問われる）:',
          '　変更要求 → ==影響分析==（コスト・スケジュール・品質・リスクへの波及を評価）→ ==CCB==で審議 → 承認/却下/延期 → 実装 → 検証 → 文書化',
          '　==CCB==（Change Control Board, 変更管理委員会）: 変更を審議する正式な組織。__スポンサー・PM・主要ステークホルダー__で構成する',
          '　__影響分析を飛ばさない__のが鉄則。「小さい変更だから」と評価せず通すと、他システムへの波及が後で発覚する',
          '__軽微な変更のみ PM 単独__で決められる。その範囲は計画段階で変更管理計画書に定めておく',
        ],
        navyItems: [[{ text: 'CCB と変更管理の流れは午前Ⅱ・午後Ⅰ双方で頻出。午後Ⅰでは「変更を承認する前に他への波及を確認したか」が論点になる', style: 'navy' }]],
      },
      {
        heading: '4. 作業パフォーマンス: データ → 情報 → 報告書と4種の報告書',
        items: [
          '__同じ実績でも、加工の段階で呼び名と使い道が変わる__。この3段階の区別が午前Ⅱで問われる',
          '　==作業パフォーマンス・データ==: __生の測定値__。「完了80件」「実コスト500万円」など、それだけでは良し悪しが分からない数字',
          '　　出どころは ==4.3 プロジェクト作業の指揮・マネジメント==（実行の現場）',
          '　==作業パフォーマンス情報==: データに__文脈を足したもの__。「計画比で20件不足」「CPI 0.9」など、計画と突き合わせて初めて意味が出る',
          '　　出どころは各__監視プロセス__（分析する段階）',
          '　==作業パフォーマンス報告書==: 情報を__意思決定できる形__にまとめたもの。ステークホルダーへ配信し、変更要求や是正処置の判断材料になる',
          '　　出どころは ==4.5 プロジェクト作業の監視・コントロール==（統合する段階）',
          '__報告書は「何に答えるか」で4種類__:',
          '　==ステータス・レポート==: 今どうなっているか（現時点の進捗・コスト・品質・リスク・課題）',
          '　==トレンド・レポート==: どちらへ向かっているか（時系列で改善／悪化の傾向）',
          '　==予測レポート==: このままだとどうなるか（==EAC==・完了時期の予測）',
          '　==バリアンス・レポート==: 計画とどれだけ違うか（CV・SV などの差異）',
          '__配信の頻度と形式__（週次／月次、メール／ダッシュボード／会議）は計画段階で決めておく。決めずに始めると報告が属人化する',
        ],
        navyItems: [[{ text: '「データ → 情報 → 報告書」は生成される順序。データを出すのが 4.3、報告書にまとめるのが 4.5 という対応まで押さえる', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '生の数字は、文脈を足して初めて判断材料になる',
            ariaLabel: '作業パフォーマンスデータ、情報、報告書の3段階と、それぞれの出所プロセスを縦に並べた図',
            viewBox: '0 0 400 360',
            content: `
              <defs>
                <marker id="wp3-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto">
                  <polygon points="0 0, 9 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="14" y="20" width="372" height="90" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="32" y="46" fill="#1d4ed8" font-size="16" font-weight="700">データ</text>
              <text x="32" y="70" fill="#1e293b" font-size="13">生の測定値。完了80件・実コスト500万円</text>
              <text x="32" y="94" fill="#64748b" font-size="12">出どころ: 4.3 作業の指揮・マネジメント</text>
              <line x1="200" y1="110" x2="200" y2="132" stroke="#64748b" stroke-width="2.5" marker-end="url(#wp3-arrow)" />
              <text x="212" y="128" fill="#475569" font-size="12" font-weight="700">計画と突き合わせる</text>

              <rect x="14" y="136" width="372" height="90" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="32" y="162" fill="#15803d" font-size="16" font-weight="700">情報</text>
              <text x="32" y="186" fill="#1e293b" font-size="13">文脈つき。計画比20件不足・CPI 0.9</text>
              <text x="32" y="210" fill="#64748b" font-size="12">出どころ: 各監視プロセス</text>
              <line x1="200" y1="226" x2="200" y2="248" stroke="#64748b" stroke-width="2.5" marker-end="url(#wp3-arrow)" />
              <text x="212" y="244" fill="#475569" font-size="12" font-weight="700">意思決定できる形へ</text>

              <rect x="14" y="252" width="372" height="90" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="32" y="278" fill="#991b1b" font-size="16" font-weight="700">報告書</text>
              <text x="32" y="302" fill="#1e293b" font-size="13">ステータス／トレンド／予測／バリアンス</text>
              <text x="32" y="326" fill="#64748b" font-size="12">出どころ: 4.5 作業の監視・コントロール</text>
            `,
          },
        ],
      },
      {
        heading: '5. 調達の流れ（内製か外注か → 発注 → 履行管理）',
        items: [
          '__用語__: IPA の設問では発注先を ==供給者== と呼ぶ（PMBOK の「売り手」「サプライヤ」、実務の「ベンダー」「委託先」と同じもの）。__出題文はほぼ「供給者」__',
          '調達は__3つの段階__で進む。午後Ⅰではどの段階が抜けたかが失敗要因として問われる',
          '　__1. 何を外に出すか決める__（12.1 調達マネジメント計画）',
          '　　==make-or-buy 分析==: 内製か外注かの判断。__コストだけで決めない__のが要点',
          '　　判断軸は、コスト／自社に能力と余力があるか／__自社の強みの中核か__（中核技術は外に出さない）／納期に間に合うか',
          '　__2. 供給者を選んで契約する__（12.2 調達の実施／シラバス 3-6 供給者の選定）',
          '　　==調達仕様書==: 何をどこまで作らせるかを定義した文書。__これが曖昧だと後の紛争の元__になる',
          '　　==供給者選定基準==: 価格だけでなく、技術力・実績・体制・財務健全性など__先に基準を決めてから__募集する',
          '　　==入札説明会==: 全候補者に__同じ情報を同時に__与える場。ここで差をつけると公正性を失う',
          '　　==独立コスト見積もり==: 発注者が自前で作る見積もり。提案価格が妥当かを__相手の言い値以外の物差し__で検証する',
          '　__3. 契約どおり動いているか見る__（12.3 調達のコントロール）',
          '　　履行状況の監視・支払管理・契約変更の管理を行う',
          '　　==クレーム管理==: 契約条件の__解釈の食い違い__から起きる紛争の管理。訴訟の前に ==ADR==（調停・仲裁）で解決を図る',
          '　　契約終結は__全成果物を受け入れた後__に正式に行う',
          '__外に出しても管理責任は残る__。丸投げは統制の喪失であり、管理レポートと監査で見続ける（→ §14 定石8）',
        ],
        navyItems: [[{ text: 'make-or-buy はコスト比較の問題に見えて、実際は「自社の強みを手放さないか」を問われることが多い', style: 'navy' }]],
      },
      {
        heading: '6. 契約形態の3類型とリスク配分（FP / CR / T&M）',
        items: [
          // 赤字密度メモ: 契約形態と派生形は午前Ⅱ最頻出のため 9 個許容（方針書 §7）
          '発注者と受注者の__どちらがコスト超過を被るか__で3類型に分かれる。この一点が判別の軸になる',
          '　==固定価格契約==（FP, Fixed Price）: 総額を先に固定する。__超過分は売り手が被る__',
          '　　スコープが明確なときに使う。買い手は予算が読める代わりに、変更のたびに再交渉が要る',
          '　==実費精算契約==（CR, Cost-Reimbursable）: かかった実費に手数料を上乗せする。__超過分は買い手が被る__',
          '　　スコープが読めない探索的な案件で使う。買い手はコストを見張る手間を負う',
          '　==タイム＆マテリアル契約==（T&M, Time ＆ Materials）: 単価×数量で払う。両者の中間',
          '　　短期・小規模や、要員を借りる形の契約に向く',
          '__派生形の違いは「報酬をどう決めるか」__:',
          '　FP系: ==FFP==（完全固定）／==FPIF==（固定＋成果連動の報奨・上限あり）／==FP-EPA==（長期契約で物価・為替の変動を指標連動で調整）',
          '　CR系: ==CPFF==（実費＋固定報酬）／==CPIF==（実費＋成果連動の報奨）／==CPAF==（実費＋買い手の主観評価で決まる報酬）',
          '　　CPPC（実費＋実費の一定％）は__売り手がコストを膨らませるほど儲かる__構造のため禁止されている',
          '__日本の契約との対応__: 請負契約は FP に近く、準委任契約は T&M に近い（→ §7）',
        ],
        navyItems: [[{ text: '午前Ⅱは「誰がコスト超過リスクを負うか」と「報酬の決め方（固定／成果連動／主観評価）」の2点で判別できる', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: 'コスト超過を誰が被るか。FPは売り手、CRは買い手、T&Mは中間',
            ariaLabel: '固定価格契約、タイムアンドマテリアル契約、実費精算契約のコスト超過リスクの配分を縦に並べた図',
            viewBox: '0 0 400 330',
            content: `
              <text x="20" y="24" fill="#475569" font-size="15" font-weight="700">コスト超過を誰が被るか</text>

              <rect x="14" y="38" width="372" height="84" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="32" y="66" fill="#991b1b" font-size="18" font-weight="700">FP</text>
              <text x="76" y="66" fill="#1e293b" font-size="14" font-weight="700">固定価格</text>
              <text x="32" y="90" fill="#991b1b" font-size="13" font-weight="700">売り手が被る</text>
              <text x="32" y="112" fill="#475569" font-size="13">総額固定。スコープが明確なとき</text>

              <rect x="14" y="132" width="372" height="84" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="32" y="160" fill="#92400e" font-size="18" font-weight="700">T&amp;M</text>
              <text x="90" y="160" fill="#1e293b" font-size="14" font-weight="700">単価 × 数量</text>
              <text x="32" y="184" fill="#92400e" font-size="13" font-weight="700">中間</text>
              <text x="32" y="206" fill="#475569" font-size="13">短期・小規模、要員を借りる形</text>

              <rect x="14" y="226" width="372" height="84" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="32" y="254" fill="#1d4ed8" font-size="18" font-weight="700">CR</text>
              <text x="76" y="254" fill="#1e293b" font-size="14" font-weight="700">実費精算</text>
              <text x="32" y="278" fill="#1d4ed8" font-size="13" font-weight="700">買い手が被る</text>
              <text x="32" y="300" fill="#475569" font-size="13">実費＋手数料。スコープが読めないとき</text>
            `,
          },
        ],
      },
      {
        heading: '7. 請負契約 vs 準委任契約（日本のIT開発契約）',
        items: [
          // 赤字密度メモ: 午後Ⅰ最頻出の論点のため 8 個許容（方針書 §7）
          '日本のIT開発契約はこの2つ。違いは__何を約束したか__の一点',
          '　==請負契約==: ==成果物の完成==を約束する。完成しなければ責任を負う',
          '　　引き渡した物に欠陥があったときの責任が ==契約不適合責任==（2020年民法改正前は瑕疵担保責任）',
          '　　性質は FP に近い。スコープが固まった工程に向く',
          '　==準委任契約==: ==業務の遂行==を約束する。__完成の責任は負わない__',
          '　　求められるのは ==善管注意義務==（専門家として当然払うべき注意を尽くすこと）',
          '　　性質は T&M に近い。要件が動く工程・運用保守・コンサルに向く',
          '　　2020年改正で ==成果完成型== が新設され、準委任でも成果に対して報酬を払う形が選べるようになった',
          '__どちらを選ぶか__: 成果物を確定できる工程は請負、__仕様が固まらない工程は準委任__。契約を一括で決めず__工程単位で使い分ける__のが実務（H26問3・H25問4）',
          '　アジャイル開発は__スコープが動く前提__なので準委任が一般的',
          '__午後Ⅰで最も問われる制約__: 請負・準委任とも、発注者は__受託側の要員に直接指示できない__。直接指示すると ==偽装請負== になる',
          '　作業の指示は__受託会社のリーダー経由__で行う。「発注者が現場に直接指示していないか」は繰り返し出題される（H29問2・R3問3）',
        ],
        navyItems: [[{ text: '「完成義務があるか」で請負／準委任を判別し、「直接指揮命令をしていないか」で偽装請負を判別する', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '約束したものが違う。請負は完成、準委任は遂行',
            ariaLabel: '請負契約と準委任契約の約束内容、責任、向く工程を上下に並べて比較した図',
            viewBox: '0 0 400 336',
            content: `
              <rect x="14" y="16" width="372" height="140" rx="10" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect x="18" y="26" width="5" height="120" rx="2.5" fill="#dc2626" />
              <text x="34" y="46" fill="#991b1b" font-size="17" font-weight="700">請負契約</text>
              <text x="34" y="74" fill="#1e293b" font-size="14" font-weight="700">約束するもの: 成果物の完成</text>
              <text x="34" y="100" fill="#475569" font-size="13">欠陥の責任: 契約不適合責任</text>
              <text x="34" y="122" fill="#475569" font-size="13">向く工程: 仕様が固まった開発</text>
              <text x="34" y="144" fill="#475569" font-size="13">性質は FP 契約に近い</text>

              <rect x="14" y="172" width="372" height="140" rx="10" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
              <rect x="18" y="182" width="5" height="120" rx="2.5" fill="#2563eb" />
              <text x="34" y="202" fill="#1d4ed8" font-size="17" font-weight="700">準委任契約</text>
              <text x="34" y="230" fill="#1e293b" font-size="14" font-weight="700">約束するもの: 業務の遂行</text>
              <text x="34" y="256" fill="#475569" font-size="13">求められる: 善管注意義務</text>
              <text x="34" y="278" fill="#475569" font-size="13">向く工程: 要件が動く・運用保守</text>
              <text x="34" y="300" fill="#475569" font-size="13">性質は T&amp;M 契約に近い</text>

              <text x="20" y="330" fill="#b45309" font-size="13" font-weight="700">どちらも発注者から受託要員への直接指示は不可（偽装請負）</text>
            `,
          },
        ],
      },
      {
        heading: '8. 入札方式と調達文書（RFI / RFP / RFQ / SOW）',
        items: [
          // 赤字密度メモ: 方式名・文書名がそのまま解答語のため 8 個許容（方針書 §7）
          '__入札方式は「競争の広さ」で3つ__:',
          '　==一般競争入札==: 公告して__誰でも参加できる__。透明性は高いが、実力の見極めに手間がかかる',
          '　==指名競争入札==: 実績のある業者を__指名して__競わせる。品質は担保しやすいが参加者は限られる',
          '　==随意契約==: 競争させず__1社と直接__契約する。緊急・特殊技術・少額など、競争しない理由が要る',
          '　==総合評価方式==: 価格だけでなく__技術提案も点数化__して選ぶ。公共のIT調達で主流',
          '__調達文書は「相手に何を出してほしいか」で使い分ける__:',
          '　==RFI==（情報提供依頼書）: __市場に何があるか__を知りたい段階。選定前の情報収集',
          '　==RFP==（提案依頼書）: __どう実現するかの提案__がほしい。要件を示して方式・体制・価格を求める',
          '　==RFQ==（見積依頼書）: __価格だけ__知りたい。仕様が固まっていて数量と単価が論点のとき',
          '　==SOW==（作業範囲記述書）: 委託する__作業の範囲__を定義した文書。RFP に添付して認識のずれを防ぐ',
          '　__順番で覚える__: 情報を集める（RFI）→ 提案を求める（RFP）→ 値段を詰める（RFQ）',
        ],
        navyItems: [[{ text: 'RFI・RFP・RFQ は調達が進む順に並んでいる。求めるものが「情報 → 提案 → 価格」と具体化していく', style: 'navy' }]],
      },
      // ── C. 知識と教訓 ──
      {
        heading: '9. 知識のマネジメント（暗黙知・形式知・SECI）',
        items: [
          '__知識には2種類ある__。この区別が、ベテランのノウハウをどう引き継ぐかの出発点になる',
          '　==暗黙知==: 本人の__経験や勘__に宿っていて、言葉にしにくい知識',
          '　　例: 熟練エンジニアが異常の予兆を感じ取る力、場を収めるファシリテーションの間合い',
          '　==形式知==: __文書や手順に書き出された__知識。誰でも読めば使える',
          '　　例: マニュアル・設計書・チェックリスト',
          '__SECI モデル__（野中郁次郎）: この2つを__循環__させて組織の知識を増やす考え方',
          '　==共同化==（Socialization）: 暗黙知 → 暗黙知。__一緒に仕事をして__身につける（OJT・メンタリング）',
          '　==表出化==（Externalization）: 暗黙知 → 形式知。__言葉にして書き出す__（手順書化・モデル化）',
          '　==連結化==（Combination）: 形式知 → 形式知。__集めて組み替える__（統合・整理・DB化）',
          '　==内面化==（Internalization）: 形式知 → 暗黙知。__読んで実践し__自分のものにする',
          '__午後Ⅰでの使い方__: 「ベテランの退職でノウハウが失われる」型の設問は、__表出化（文書化）と共同化（OJT）を組み合わせる__のが定石。どちらか片方では継承できない（R5問3・R2問1）',
        ],
        navyItems: [[{ text: '4プロセスは「暗黙知と形式知のどちらからどちらへ動くか」で覚える。名称だけの暗記だと選択肢で迷う', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '暗黙知と形式知を行き来させて、個人の勘を組織の資産に変える',
            ariaLabel: 'SECIモデルの共同化、表出化、連結化、内面化の4段階を、暗黙知と形式知の変換方向とともに縦に並べた図',
            viewBox: '0 0 400 424',
            content: `
              <defs>
                <marker id="seci-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto">
                  <polygon points="0 0, 9 4, 0 8" fill="#64748b" />
                </marker>
              </defs>
              <rect x="14" y="14" width="372" height="82" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="32" y="40" fill="#1d4ed8" font-size="16" font-weight="700">共同化</text>
              <text x="104" y="40" fill="#475569" font-size="13">暗黙知 → 暗黙知</text>
              <text x="32" y="64" fill="#1e293b" font-size="13.5">一緒に仕事をして身につける</text>
              <text x="32" y="86" fill="#64748b" font-size="12.5">OJT・メンタリング・現場同行</text>
              <line x1="200" y1="96" x2="200" y2="112" stroke="#64748b" stroke-width="2.5" marker-end="url(#seci-arrow)" />

              <rect x="14" y="116" width="372" height="82" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="32" y="142" fill="#15803d" font-size="16" font-weight="700">表出化</text>
              <text x="104" y="142" fill="#475569" font-size="13">暗黙知 → 形式知</text>
              <text x="32" y="166" fill="#1e293b" font-size="13.5">言葉にして書き出す</text>
              <text x="32" y="188" fill="#64748b" font-size="12.5">手順書化・モデル化・チェックリスト</text>
              <line x1="200" y1="198" x2="200" y2="214" stroke="#64748b" stroke-width="2.5" marker-end="url(#seci-arrow)" />

              <rect x="14" y="218" width="372" height="82" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="32" y="244" fill="#b45309" font-size="16" font-weight="700">連結化</text>
              <text x="104" y="244" fill="#475569" font-size="13">形式知 → 形式知</text>
              <text x="32" y="268" fill="#1e293b" font-size="13.5">集めて組み替える</text>
              <text x="32" y="290" fill="#64748b" font-size="12.5">統合・整理・データベース化</text>
              <line x1="200" y1="300" x2="200" y2="316" stroke="#64748b" stroke-width="2.5" marker-end="url(#seci-arrow)" />

              <rect x="14" y="320" width="372" height="82" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="32" y="346" fill="#991b1b" font-size="16" font-weight="700">内面化</text>
              <text x="104" y="346" fill="#475569" font-size="13">形式知 → 暗黙知</text>
              <text x="32" y="370" fill="#1e293b" font-size="13.5">読んで実践し自分のものにする</text>
              <text x="32" y="392" fill="#64748b" font-size="12.5">訓練・体験・繰り返し</text>

              <text x="20" y="418" fill="#475569" font-size="12.5" font-weight="700">ここで生まれた新しい暗黙知が、次の共同化の入口になる</text>
            `,
          },
        ],
      },
      {
        heading: '10. 教訓の収集と組織への還元',
        items: [
          '__教訓__（Lessons Learned）: 「なぜうまくいったか」「なぜ失敗したか」の記録。次に同じ失敗を繰り返さないための資産',
          '__いつ集めるか__: ==継続的==に集める。フェーズ末・スプリント末・問題が起きたときに随時',
          '　__終結時だけでは遅い__。記憶が薄れるうえ、そのプロジェクト自身が教訓を活かせない（この点が午前Ⅱのひっかけ）',
          '__置き場所を2つに分ける__:',
          '　==教訓登録簿==（Lessons Learned Register）: __進行中のプロジェクト__の中で更新し続ける記録',
          '　==教訓リポジトリ==（Lessons Learned Repository）: __組織全体__の蓄積。終結時にここへ移し、他プロジェクトが使えるようにする',
          '__振り返りの場__: アジャイルは==レトロスペクティブ==（スプリントごと）、予測型はフェーズ・ゲートで行う',
          '　進め方の代表が ==KPT==（Keep 続けること／Problem 問題／Try 次に試すこと）',
          '__知識を横に広げる仕組み__:',
          '　__ナレッジ・リポジトリ__: 文書・テンプレート・教訓の置き場',
          '　==コミュニティ・オブ・プラクティス==（CoP）: 同じ関心を持つ人が__自発的に__集まる場。組織図をまたいで知識が伝わる',
          '__記録するだけでは資産にならない__。検索できる形に整え、次の計画時に参照する運用までを設計して初めて回る',
        ],
        navyItems: [[{ text: '「収集タイミングは継続的（終結時だけではない）」と「登録簿は案件内・リポジトリは組織横断」の2点が出題ポイント', style: 'navy' }]],
      },
      // ── D. 法律・契約周辺 ──
      {
        heading: '11. 関連法令・NDA・知的財産権',
        items: [
          // 赤字密度メモ: 法令名と要件語がそのまま解答語のため 11 個許容（方針書 §7）
          'PMが押さえる法令は5つ。__共通するのは「発注者が立場の強さを濫用しないための規制」__という点',
          '　==下請法==（下請代金支払遅延等防止法）: 親事業者と下請事業者の取引を規制する',
          '　　禁じられるのは__代金の支払遅延__・__不当な返品__・__買い叩き__・一方的な減額',
          '　==独占禁止法==: 不公正な取引方法を禁止。下請けへの不当な圧力は ==優越的地位の濫用== に当たる',
          '　==著作権法==: プログラムも著作物として保護される',
          '　　==職務著作==: 業務として作成したプログラムの著作権は__法人に帰属__する（作った個人ではない）',
          '　==個人情報保護法==: 取扱事業者の義務は、利用目的の通知・公表／同意の取得／__安全管理措置__／__第三者提供の制限__',
          '　==不正競争防止法==: ==営業秘密== を保護する',
          '　　__3要件をすべて満たして初めて__営業秘密になる: ==秘密管理性==（秘密として管理）・==有用性==（事業に有用）・==非公知性==（公然と知られていない）',
          '__契約で守るもの__:',
          '　==NDA==（守秘義務契約）: 秘密情報の扱いを定める。__プロジェクト開始前・入札参加時__に結ぶ',
          '　　定めるのは、秘密情報の範囲／使用目的の限定／第三者への開示禁止／__契約終了後も続く義務__',
          '　__知的財産権の帰属__: 委託で生まれた成果物の権利は、__契約に明記しないと受託側に残る__ことが多い。着手前に決めておく（R5問3）',
        ],
        navyItems: [[{ text: '職務著作は法人帰属、営業秘密は3要件すべて必要。この2つは断定的に問われるので確実に', style: 'navy' }]],
      },
      // ── E. IPA PM試験 出題傾向 ──
      {
        heading: '12. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__契約形態__: 3類型（==FP/CR/T&M==）のリスク配分・選択基準',
          '__FP派生形__: ==FFP==／==FPIF==／==FP-EPA==の特徴',
          '__CR派生形__: ==CPFF==／==CPIF==／==CPAF==の特徴',
          '__入札方式__: ==一般競争==／==指名競争==／==随意契約==の使い分け',
          '__調達文書__: ==RFP==／==RFQ==／==RFI==／==SOW==の役割区別',
          '__統合変更管理__: ==CCB==・変更要求ワークフロー',
          '__作業パフォーマンス__: ==データ → 情報 → 報告書==の3階層',
          '__報告書種別__: ==ステータス==／==トレンド==／==予測==／==バリアンス==',
          '__知識管理__: ==形式知 vs 暗黙知==／==SECI モデル==／==教訓登録簿==',
          '__法律__: ==下請法==／==職務著作==／==請負 vs 準委任==／==NDA==',
        ],
      },
      {
        heading: '13. ひっかけパターン',
        items: [
          '__請負 vs 準委任__: ==成果物完成義務==（請負）vs ==業務遂行義務==（準委任）',
          '__FP vs CR__: 売り手リスク==大==（FP）vs 買い手リスク==大==（CR）',
          '__CPFF vs CPIF vs CPAF__: 報酬の決定方式（==固定==／==パフォーマンス連動==／==主観評価==）',
          '__RFP vs RFQ vs RFI__: ==提案依頼==／==見積依頼==／==情報依頼==の使い分け',
          '__作業パフォーマンス3階層__: データ（生）／情報（中間）／報告書（意思決定可能）の生成順序',
          '__教訓収集__: ==継続的==（プロジェクト終結時だけではない）',
          '__職務著作__: 業務上作成したプログラムは==法人==に帰属（個人ではない）',
          '__個人情報__: ==取得時の利用目的通知==・==同意==・==第三者提供制限==',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
          '__9.5 vs 9.6__: チームの管理（9.5, team §33）vs ==物的資源==のコントロール（9.6）',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '14. 午後Ⅰの定石（調達・契約・知識管理）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの調達系設問は「契約形態の制約」と「委託先の管理」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 請負に直接指揮命令はできない__: 請負契約の要員へ発注者が直接指示すると==偽装請負==。作業指示は==受託側リーダー経由==で行う（H29問2・R3問3）',
          '__2. 請負でもスケジュールのリスクは移らない__: 完成責任は移せても==失った時間は取り戻せない==。遅延の予兆は隠さず==共同で管理==し最速で検知・協調対処（R5問2）',
          '__3. 契約は特性で使い分け__: 要件が固まる部分は==請負==、変動・探索的な部分は==準委任==。一括で決めず工程・作業単位で選ぶ（H26問3・H25問4・H29問2）',
          '__4. 意欲低下はインセンティブで補う__: 準委任への移行で下がりがちな完成への意欲は、==成果連動報酬==（CPIF等）や成果完成型で補完（R5問2）',
          '__5. 委託先の品質は契約と工程完了条件で作り込む__: RFP・契約に==品質基準・検収条件・工程完了条件==を明記し、プロセス遵守を記録で確認（H29問2・H26問3）',
          '__6. サプライヤ評価はエビデンスで__: 実績・記録に基づいて評価し、==見極めてから任せる範囲を広げる==（H29問2・H25問4）',
          '__7. 新規委託先は管理負荷を見込む__: 初取引のベンダーには標準の説明・レビュー強化など==管理工数を計画に織り込む==（H28問1）',
          '__8. 委託しても管理責任は残る__: 外部委託後も==管理レポート・監査==で統制する。丸投げは統制喪失（H25問1）',
          '__9. 暗黙知は形式知化して継承__: ベテランの勘・ノウハウは==文書化＋OJT==の組み合わせで移転する（R5問3・R2問1）',
          '__10. 知財・秘密保持は契約で明示__: 業務委託で生まれる成果物の==知財帰属==・秘密情報の扱いは契約に明記（R5問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】契約形態の==3類型==（FP/CR/T&M）の==リスク配分==（FP=売り手リスク大・CR=買い手リスク大）。',
      '【契約形態】==請負契約==（成果物完成義務・==契約不適合責任==）vs ==準委任契約==（業務遂行義務・==善管注意義務==）。アジャイルは準委任が一般的。',
      '【調達文書】==RFP==（提案）／==RFQ==（見積）／==RFI==（情報）／==SOW==（作業範囲）の使い分け。設問は発注先を ==供給者== と呼ぶ。',
      '【知識管理】==形式知 vs 暗黙知==／==SECI モデル==／==教訓登録簿==は==継続的==に更新。',
      '【ひっかけ】==CPFF/CPIF/CPAF==の報酬決定方式（固定／連動／主観評価）／==職務著作==は法人帰属／==9.5 vs 9.6==。',
    ],
  },

  // ───────────────────────────────────────────
  // 6. デリバリー（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  delivery: {
    summary:
      'プロジェクトの成果物と価値を提供する活動領域。PMBOK第6版では第8章「品質マネジメント」3プロセス、第7版では「デリバリー」パフォーマンス領域として統合。品質コスト（COQ）・7QC道具・PDCA・UATが試験頻出。',
    sections: [
      // ── A. 何を届けるか ──
      {
        heading: '1. デリバリーとは（届けるものと2つのスコープ）',
        items: [
          'このカテゴリが扱うのは__「何を作り、それが要求を満たしているか」__。第7版の「デリバリー」パフォーマンス領域で、第6版では第8章 品質マネジメントと第5章 スコープの受入が対応する',
          '__要求事項は4層に分かれる__。__どの層の話をしているか__を取り違えると答案がずれる',
          '　==業務要求==: 事業として何を実現したいか（売上を伸ばす・コストを下げる）',
          '　==ステークホルダー要求==: 個々の関係者が求めること',
          '　==ソリューション要求==: それを満たすための機能・非機能',
          '　==移行要求==: 現行から新システムへ移るために必要なこと（データ移行・並行運用・訓練）',
          '　　__移行要求は忘れられやすい__。作る要求だけ拾って移行を落とすと稼働直前に破綻する',
          '__価値が実現するまでの流れ__: 要求 → 設計 → 実装 → 受入 → 運用 → __便益測定__',
          '　__作って終わりではない__。便益が出たかを後で測るところまでが射程（→ §12）',
          '__スコープは2種類あり、指す範囲が違う__:',
          '　==プロジェクト・スコープ==: __プロジェクトとして行う作業__の範囲（設計・開発・テスト・導入・トレーニング）',
          '　==プロダクト・スコープ==: __成果物が持つ機能と特徴__（ログイン機能・レポート出力・性能要件）',
          '　__包含関係__: プロジェクト・スコープ ⊃ プロダクト・スコープ。__プロダクトを作ることはプロジェクト作業の一部__',
          '　　だから __プロダクト・スコープが変わればプロジェクト・スコープも動く__（機能が増えれば作業も増える）',
          '　__見分け方__: 「作業の範囲」を問われたらプロジェクト、「成果物の機能」を問われたらプロダクト',
          '　==スコープ・クリープ==: __未承認のまま__範囲が膨らむこと。__両方のスコープで起こり得る__',
        ],
        navyItems: [[{ text: '2つのスコープの定義の違いは頻出。プロダクトは成果物の中身、プロジェクトはそれを作る作業まで含む', style: 'navy' }]],
      },
      // ── B. 要求とトレーサビリティ ──
      {
        heading: '2. 要求事項の収集と追跡（QFD・RTM）',
        items: [
          '__収集の技法__はインタビュー／ワークショップ／プロトタイピングなど（planning §2 に詳しい）',
          '==QFD==（品質機能展開）: 顧客が言った要求を __測れる品質特性へ翻訳する__ 手法',
          '　「使いやすくしてほしい」→「主要操作を3クリック以内」のように、__検証できる形__に落とす',
          '　変換の表が「__品質の家__」と呼ばれる',
          '==RTM==（要求事項トレーサビリティ・マトリクス）: 各要求の __出自・設計・実装・テスト__ を1本の線で追える表',
          '　__効くのは2つの場面__:',
          '　　__変更が来たとき__: その要求がどの成果物とテストに繋がっているかが分かり、==変更影響分析== を漏れなくできる',
          '　　__テスト設計のとき__: どの要求が未テストかが見えるので ==テストカバレッジ== を確認できる',
          '　結果として、__出自の分からない機能__が紛れ込むスコープ・クリープも防げる',
        ],
        navyItems: [[{ text: 'QFD は「曖昧な要望を測れる特性に変える」、RTM は「要求と成果物を繋いで追える形にする」。目的で覚える', style: 'navy' }]],
      },
      // ── C. 品質マネジメント（PMBOK6 第8章） ──
      {
        heading: '3. 品質マネジメントの3プロセスと計画書',
        items: [
          '__第6版の品質マネジメントは3プロセス__。プロセス群がそれぞれ違うのが判別点',
          '　__8.1 品質マネジメント計画__（計画群）: 品質要求事項と品質基準を識別し、__どう品質を作り込むか__を文書化する',
          '　__8.2 品質マネジメント__（実行群）: 計画を実際の品質活動に変える（→ §4 の品質保証）',
          '　__8.3 品質コントロール__（監視・コントロール群）: 出来上がりを検査して評価する（→ §4 の品質管理）',
          '__8.1 で作るもの__:',
          '　__品質マネジメント計画書__: 品質基準・品質目標・役割と責任・レビュー対象・使用ツールを定める',
          '　==品質メトリクス==（IPA は ==品質尺度==）: 品質を定量測定する基準',
          '　　例: ==欠陥密度==（バグ数／KLOC）／==テストカバレッジ==／==MTBF==（平均故障間隔）／==MTTR==（平均修復時間）',
          '　　__基準を先に決める__のが要点。作り終えてから「何点なら合格か」を議論すると揉める',
          '__品質の考え方を作った4人__（名前と業績の対応が問われる）:',
          '　==デミング==: ==PDCA== と14原則。__検査に頼らずプロセスで作り込む__',
          '　==ジュラン==: 品質トリロジー（計画・管理・改善）。__品質は使用適合性__',
          '　==クロスビー==: 「==品質は無償==」。__予防に投資すれば失敗コストが減って元が取れる__',
          '　==石川馨==: 特性要因図・QCサークル。__現場が自分たちで改善する__文化',
        ],
        navyItems: [[{ text: '8.1（計画群）／8.2（実行群）／8.3（監視・コントロール群）のプロセス群の違いが頻出。人名と業績の対応も問われる', style: 'navy' }]],
      },
      {
        heading: '4. 品質保証（QA）と品質管理（QC）の違い',
        items: [
          '__品質の活動は2つに分かれる__。__やり方を正すか、出来上がりを見るか__が分かれ目',
          '　==品質保証==（QA, Quality Assurance）: __プロセス__が正しく守られているかを見る。「良い作り方をしていれば良い物ができる」という考え方',
          '　　PMBOK第6版では ==8.2 品質マネジメント== に改称された（==実行プロセス群==）。IPA のシラバスは __3-5「品質保証の遂行」__ として品質保証の名で扱う',
          '　　代表的な技法は ==品質監査==（プロセス遵守を独立した立場で評価）・根本原因分析・プロセス改善（PDCA・シックスシグマ）',
          '　==品質管理==（QC, Quality Control）: __出来上がった成果物__が基準を満たすかを見る',
          '　　PMBOK第6版では ==8.3 品質コントロール==（==監視・コントロールプロセス群==）',
          '　　技法は ==検査==・テスト・==管理図==（→ §9）。出てくるのは ==検証済みの成果物== で、これが 5.5 スコープ妥当性確認へ渡る',
          '__見分け方__: __プロセスが対象なら品質保証、成果物が対象なら品質管理__',
          '　「レビュー手順を守っているか監査した」→ 品質保証／「テストで欠陥数を測った」→ 品質管理',
          '__検証（Verification）と妥当性確認（Validation）も同じ軸で対になる__:',
          '　==検証==: __仕様どおりに作れているか__（作り手の視点）→ 品質コントロール',
          '　==妥当性確認==: __顧客の要求を満たしているか__（使い手の視点）→ 5.5 スコープ妥当性確認',
        ],
        navyItems: [[{ text: 'QA はプロセス・QC は成果物。PMBOK6 の改称（品質保証→品質マネジメント）で名前が変わったが、IPA シラバスは品質保証の語を使い続けている', style: 'navy' }]],
      },

      {
        heading: '5. 品質とグレードの違い',
        items: [
          '__この2つは別の軸__。混同させる設問が繰り返し出る',
          '　==品質==: __要求事項をどれだけ満たしているか__の度合い（ISO 9000 は「本質的特性の集まりが要求事項を満たす程度」と定義）',
          '　==グレード==: __機能の多さや豪華さのクラス__（自動車のグレード、ホテルの星の数）',
          '　__決定的な違い__: 品質は__満たすべき約束__、グレードは__最初から選べる水準__',
          '__だから許容される組合せと、されない組合せがある__:',
          '　==高品質・低グレード== は __問題ない__。機能は少ないが、約束したことは確実に動く（十分テストされた簡素なツール）',
          '　==低品質== は __グレードに関係なく問題__。豪華でもバグだらけなら要求を満たしていない',
          '　__「低グレードだから品質が低い」は誤り__。ここが選択肢の分かれ目',
          '__適合という軸__:',
          '　==適合==: 仕様への準拠。==不適合== はそこからの逸脱',
          '　==設計品質==: __設計そのものの良さ__（そもそも正しいものを設計できているか）',
          '　==適合品質==: __設計どおりに作れているか__の忠実さ',
          '　　__テストで上げられるのは適合品質まで__。設計品質が低ければ、いくら作り込んでも上限は超えない（→ §15 定石5）',
        ],
        navyItems: [[{ text: '「品質はサービス／製品が要求を満たす程度、グレードは特性のクラス」と区別', style: 'navy' }]],
      },
      {
        heading: '6. 品質コスト（COQ）',
        items: [
          '==COQ==（品質コスト）: __品質に関わる費用をすべて足したもの__。「品質にお金をかけるか」ではなく「__どこにかけるか__」の話',
          '__2つに分かれる__。__不適合を出さないために使う__か、__出てしまって使う__か',
          '　==適合コスト==: 不適合を __防ぐために__ かける費用',
          '　　==予防コスト==: そもそも起こさないための費用（トレーニング・プロセス文書化・設備保守）',
          '　　==評価コスト==: 出す前に見つけるための費用（検査・テスト・監査）',
          '　==不適合コスト==: 不適合が __起きたために__ かかる費用',
          '　　==内部不良コスト==: __出荷前__に見つかった分（手戻り・スクラップ・再テスト）',
          '　　==外部不良コスト==: __出荷後__に見つかった分（苦情対応・保証・訴訟・ブランド毀損）',
          '　　__内部と外部の境目は「顧客に届いたかどうか」__。ここが判別点',
          '__予防に投資すると全体が下がる__: 予防・評価に使う額は増えるが、__不良コストがそれ以上に減る__',
          '　これがクロスビーの「==品質は無償==」の意味。__品質向上の費用は、失敗コストの削減で元が取れる__という主張',
          '　__最適点__は適合コストと不適合コストの __合計が最小__ になるところ',
          '==1-10-100の法則==: 修正コストは __設計段階で1、製造段階で10、市場に出てから100__',
          '　__早く見つけるほど安い__。シフトレフト（→ §11）やレビュー前倒し（→ §15 定石2）の根拠になる',
        ],
      },
      // ── D. 品質ツール・技法 ──
      {
        heading: '7. QC道具（7QC道具と新7QC道具）',
        items: [
          // 赤字密度メモ: 7つの道具名そのものが解答語のため 9 個許容（方針書 §7）
          '==7QC道具==: __数値データ__で品質問題を分析する7つの図（石川馨が体系化）',
          '__覚え方は名前でなく用途__。試験は「この目的にはどの図か」を問う形で出る',
          '　==パレート図==: __どの原因から手を打つか__を決める図。不良原因を頻度順の棒グラフにし、累積曲線を重ねる',
          '　　少数の原因が問題の大半を占めること（==80-20の法則==）が読み取れたら、その少数に==重点対策==を打つのが定石（H30問13・H26問15）',
          '　==特性要因図==（==フィッシュボーン図==）: __なぜ起きたか__を洗い出す図。結果に向かう原因を魚の骨状に分類する（人・機械・材料・方法）',
          '　==管理図==: __工程が安定しているか__を見る図。時系列データに==管理限界線==（UCL/LCL）を引き、外に出たら偶然でない異常原因があると判断',
          '　==散布図==: __2つの量に関係があるか__を見る図。点の散らばり方で相関の有無と向きを判断',
          '　==ヒストグラム==: __ばらつきの形__を見る図。度数分布を棒グラフにし、中心・広がり・偏りを読む',
          '　==チェックシート==: データを__漏れなく数える__ための記録用紙。分析の入口',
          '　==層別==: データを__グループに分けて__見る考え方。単独の図ではなく、他の6つと組み合わせて使う',
          '==新7QC道具==: __言語データ__（意見・要望・課題の文章）を整理する7つの図。数値を扱う7QC道具と対をなす',
          '　__問われるのは対比ひとつだけ__: 7QC道具は ==数値データ==、新7QC道具は ==言語データ==',
          '　__押さえるのは3つで足りる__:',
          '　　==親和図==: バラバラな意見を__似たもの同士でグループ化__する（KJ法とほぼ同じ）',
          '　　==連関図==: 原因が絡み合って一本道にならないとき、__要素間の因果を矢印で結んで__主要因を見つける',
          '　　==系統図==: 目的を__手段へ枝分かれさせて__具体策まで落とす',
          '　残る4つ（マトリクス図・マトリクスデータ解析・PDPC・アローダイアグラム）は__名前だけ__でよい。__12年度300問で単独出題0回__',
        ],
        navyItems: [[{ text: '午前Ⅱ出題はパレート図に集中（H30問13・H26問15）。ヒストグラム・チェックシートの単独出題は12年度で0回', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '7QC道具: 「何を知りたいか」から図を選ぶ',
            ariaLabel: '知りたいことと対応する7QC道具を4行で対比した図。重点を絞るならパレート図、原因を洗い出すなら特性要因図、工程の安定を見るなら管理図、2量の関係を見るなら散布図',
            // モバイル優先の viewBox（幅400）。375px 端末でも文字が約11px で読める寸法にする
            viewBox: '0 0 400 664',
            content: `
              <text x="20" y="24" fill="#475569" font-size="15" font-weight="700">何を知りたいか → どの図を使うか</text>

              <rect x="10" y="40" width="380" height="142" rx="10" fill="#ffffff" stroke="#f59e0b" stroke-width="2" />
              <rect x="14" y="50" width="5" height="122" rx="2.5" fill="#f59e0b" />
              <text x="30" y="70" fill="#1e293b" font-size="15" font-weight="700">どの原因から手を打つか</text>
              <text x="30" y="98" fill="#b45309" font-size="17" font-weight="700">パレート図</text>
              <text x="30" y="126" fill="#475569" font-size="13.5">頻度順の棒＋累積曲線</text>
              <text x="30" y="148" fill="#475569" font-size="13.5">少数の原因に重点対策</text>
              <rect x="266" y="152" width="15" height="10" fill="#f59e0b" /><rect x="285" y="140" width="15" height="22" fill="#fbbf24" />
              <rect x="266" y="120" width="15" height="42" fill="#f59e0b" /><rect x="304" y="150" width="15" height="12" fill="#fbbf24" />
              <rect x="323" y="156" width="15" height="6" fill="#fbbf24" />
              <polyline points="273,112 292,96 311,88 330,84" fill="none" stroke="#b45309" stroke-width="2" />
              <line x1="260" y1="162" x2="348" y2="162" stroke="#94a3b8" stroke-width="1.5" />

              <rect x="10" y="196" width="380" height="142" rx="10" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
              <rect x="14" y="206" width="5" height="122" rx="2.5" fill="#2563eb" />
              <text x="30" y="226" fill="#1e293b" font-size="15" font-weight="700">なぜ起きたか（原因を洗い出す）</text>
              <text x="30" y="254" fill="#1d4ed8" font-size="17" font-weight="700">特性要因図</text>
              <text x="30" y="282" fill="#475569" font-size="13.5">結果に向かう原因を</text>
              <text x="30" y="304" fill="#475569" font-size="13.5">魚の骨状に分類</text>
              <line x1="258" y1="288" x2="352" y2="288" stroke="#2563eb" stroke-width="2" />
              <line x1="278" y1="266" x2="292" y2="288" stroke="#2563eb" stroke-width="2" />
              <line x1="312" y1="266" x2="326" y2="288" stroke="#2563eb" stroke-width="2" />
              <line x1="278" y1="310" x2="292" y2="288" stroke="#2563eb" stroke-width="2" />
              <line x1="312" y1="310" x2="326" y2="288" stroke="#2563eb" stroke-width="2" />
              <polygon points="352,282 366,288 352,294" fill="#2563eb" />

              <rect x="10" y="352" width="380" height="142" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2" />
              <rect x="14" y="362" width="5" height="122" rx="2.5" fill="#16a34a" />
              <text x="30" y="382" fill="#1e293b" font-size="15" font-weight="700">工程は安定しているか</text>
              <text x="30" y="410" fill="#15803d" font-size="17" font-weight="700">管理図</text>
              <text x="30" y="438" fill="#475569" font-size="13.5">限界線の外に出たら</text>
              <text x="30" y="460" fill="#475569" font-size="13.5">異常原因あり</text>
              <line x1="258" y1="410" x2="346" y2="410" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3" />
              <line x1="258" y1="462" x2="346" y2="462" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3" />
              <polyline points="260,450 274,440 288,452 302,438 316,444 330,402 344,446" fill="none" stroke="#15803d" stroke-width="2" />
              <circle cx="330" cy="402" r="4.5" fill="#dc2626" />
              <text x="350" y="414" fill="#dc2626" font-size="11" font-weight="700">UCL</text>
              <text x="350" y="466" fill="#dc2626" font-size="11" font-weight="700">LCL</text>

              <rect x="10" y="508" width="380" height="142" rx="10" fill="#ffffff" stroke="#7c3aed" stroke-width="2" />
              <rect x="14" y="518" width="5" height="122" rx="2.5" fill="#7c3aed" />
              <text x="30" y="538" fill="#1e293b" font-size="15" font-weight="700">2つの量に関係があるか</text>
              <text x="30" y="566" fill="#6d28d9" font-size="17" font-weight="700">散布図</text>
              <text x="30" y="594" fill="#475569" font-size="13.5">点の散らばりで</text>
              <text x="30" y="616" fill="#475569" font-size="13.5">相関の有無と向き</text>
              <line x1="262" y1="622" x2="356" y2="622" stroke="#94a3b8" stroke-width="1.5" />
              <line x1="262" y1="622" x2="262" y2="546" stroke="#94a3b8" stroke-width="1.5" />
              <circle cx="278" cy="610" r="3.5" fill="#7c3aed" /><circle cx="294" cy="598" r="3.5" fill="#7c3aed" />
              <circle cx="308" cy="604" r="3.5" fill="#7c3aed" /><circle cx="322" cy="586" r="3.5" fill="#7c3aed" />
              <circle cx="336" cy="574" r="3.5" fill="#7c3aed" /><circle cx="348" cy="580" r="3.5" fill="#7c3aed" />
              <circle cx="330" cy="592" r="3.5" fill="#7c3aed" />
            `,
          },
        ],
      },

      {
        heading: '8. 改善の型（PDCA・デミング・シックスシグマ）',
        items: [
          '==PDCAサイクル==: 継続的改善の基本形',
          '　==Plan==（目標設定・計画）→ ==Do==（実施）→ ==Check==（計画と比較して評価）→ ==Act==（標準化・是正）',
          '　__Act が「標準化」__である点が要点。良かったやり方を標準に取り込んで初めて次の Plan が上がる',
          '==デミング14原則==の核心は ==検査依存からの脱却==。__検査で不良を弾くのではなく、プロセスで作り込む__',
          '　あわせて部門間の障壁除去、システムの改善を重視する',
          '　__赤玉実験__: 作業者がどれだけ努力しても結果が変わらないことを示した実験。__品質を決めるのは個人でなくシステム__という主張',
          '==シックスシグマ==: モトローラ発・GE が普及させた __統計に基づく品質改善手法__',
          '　__目標__: ==100万機会あたり3.4不良== 以下（±6σ）',
          '　==DMAIC==: __既存プロセスの改善__。==Define==（定義）→ ==Measure==（測定）→ ==Analyze==（分析）→ ==Improve==（改善）→ ==Control==（定着）',
          '　==DMADV==: __新しいプロセスの設計__。改善か新規かで使い分ける',
          '　__見分け方__: 直すなら DMAIC、__ゼロから作るなら DMADV__',
        ],
        navyItems: [[{ text: 'デミング14原則は1986年「Out of the Crisis」。DMAIC（改善）と DMADV（新規設計）の取り違えがひっかけ', style: 'navy' }]],
      },
      {
        heading: '9. 統計的品質管理（管理図・正規分布）',
        items: [
          '==統計的品質管理==（SQC, Statistical Quality Control）: 統計的手法によるプロセス管理',
          '==管理図==（Control Chart）:',
          '　==中心線==（CL, Central Line）: 平均値',
          '　==上方管理限界==（UCL, Upper Control Limit）= μ + 3σ',
          '　==下方管理限界==（LCL, Lower Control Limit）= μ - 3σ',
          '　管理限界外を==異常==と判定（==3σ管理==）',
          '__異常判定__: 管理限界外の1点のほか、連続7点が中心線の同側・連続上昇等のパターンも異常とみなす',
          '==正規分布==: ±1σは68.27%、==±2σ==は95.45%、==±3σ==は==99.73%==',
          '__プロセス能力指数__: ==Cp==／==Cpk==（規格幅とばらつきの比）',
        ],
        navyItems: [[{ text: '3σ管理・正規分布のパーセンテージは午前Ⅱ 計算問題で必出', style: 'navy' }]],
      },
      // ── E. 品質規格・モデル ──
      {
        heading: '10. 品質の標準（ISO 9001・CMMI）',
        items: [
          '__2つは測る対象が違う__。ISO 9001 は __仕組みが要件を満たすか__、CMMI は __プロセスがどこまで成熟したか__',
          '==ISO 9000シリーズ==: 品質マネジメントシステムの国際規格',
          '　==ISO 9001== が __要求事項__ を定める規格で、==認証の対象== になるのはこれ。日本版が JIS Q 9001',
          '　__7つの品質マネジメント原則__: ==顧客重視==／リーダーシップ／人々の積極的参加／==プロセス・アプローチ==／改善／客観的事実に基づく意思決定／関係性管理',
          '　2015年改訂で入ったのが ==リスク思考==（リスクに基づく考え方）。PDCA とあわせて要求事項に組み込まれた',
          '　要求事項の骨子: 組織のコンテキスト決定／品質方針／プロセス・アプローチ／==内部監査==／==マネジメントレビュー==（経営層による定期評価）',
          '==CMMI==: ソフトウェア開発・サービス・調達の __プロセス成熟度モデル__（カーネギーメロン大学 ==CMU/SEI== 発）',
          '　__5段階__。__順序と各段階の特徴__がそのまま問われる',
          '　　==レベル1 初期==: プロセスが定義されておらず __個人の力量頼み__',
          '　　==レベル2 管理された==: プロジェクト単位で基本的な管理ができている',
          '　　==レベル3 定義された==: __組織標準のプロセス__がある',
          '　　==レベル4 定量的に管理された==: __数値で測って__管理している',
          '　　==レベル5 最適化された==: 測定結果をもとに __継続的に改善__ している',
          '　__覚え方__: 個人頼み → 案件ごと管理 → 組織標準 → 測る → 改善し続ける。__「標準化してから測る」__順序が肝',
        ],
        navyItems: [[{ text: 'ISO 9001 は認証対象、CMMI は成熟度の5段階。CMMI の順序（標準化 → 定量管理 → 最適化）がそのまま選択肢になる', style: 'navy' }]],
      },
      // ── F. アジャイル品質 ──
      {
        heading: '11. アジャイルでの品質（DoD・CI/CD・TDD / BDD）',
        items: [
          '__アジャイルの品質は「最後に検査する」から「常に検証し続ける」へ__。継続的検証・早期フィードバック・チーム全体の責任が特徴',
          '==DoD==（完了の定義）: __何をもって完了とするか__のチーム共通基準（レビュー済み・テスト合格・ドキュメント更新済み など）',
          '　__スプリントごとに厳格に適用する__。DoD が曖昧だと「終わったはず」の作業が後で戻ってくる',
          '==回帰テスト==: 改修で __既存機能が壊れていないか__ を確認するテスト。__自動化が前提__（手動では回数に耐えられない）',
          '　__テスティング・ピラミッド__: 単体（多）→ 統合（中）→ E2E（少）。__下ほど速くて安いので厚くする__',
          '==CI/CD==: ビルド・テスト・デプロイを自動化し、__変更のたびに検証が回る__仕組み',
          '==シフトレフト==: 品質確認を __上流へ前倒しする__ 考え方。1-10-100の法則（→ §6）が根拠',
          '__テストを先に書く手法__:',
          '　==TDD==（テスト駆動開発）: ==テストファースト==。__Red-Green-Refactor__ のサイクルで回す',
          '　　==Red==（失敗するテストを書く）→ ==Green==（通す最小限のコード）→ ==Refactor==（テストを通したまま構造を改善）',
          '　　__効果__: 仕様が明確になる／デグレを防げる／__テストしやすい設計になる__',
          '　==BDD==（振る舞い駆動開発）: TDD を __利用者の振る舞い__ の側から書く形',
          '　　==Given-When-Then==（前提 → 操作 → 期待結果）で記述するので、__開発者以外にも読める__',
          '　　代表ツールは ==Cucumber==（BDD）／JUnit・Jest（TDD）',
          '　==ATDD==（受入テスト駆動開発）: 受入基準をテストとして先に定義する',
        ],
        navyItems: [[{ text: 'TDD は Red-Green-Refactor、BDD は Given-When-Then。BDD は「関係者が読める形で書く」ことが目的', style: 'navy' }]],
      },
      // ── G. 受入とサインオフ ──
      {
        heading: '12. 受入から終結・便益測定まで',
        items: [
          '__作り終えてから価値が確定するまで__の一連の流れ。ここを落とすと「納品したのに評価されない」ことになる',
          '==受入基準==: 成果物が __顧客に受け入れられる条件__。Given-When-Then やチェックリストの形で __着手前に__ 決めておく',
          '　__非機能要求も含める__: ==性能==（応答時間）／==可用性==（稼働率）／セキュリティ／使用性',
          '　　__機能だけ書いて非機能を落とす__のがよくある失敗。「動くが遅い」で揉める',
          '==UAT==（受入テスト）: ==実ユーザ== が行う __最終の受入確認__。仕様どおりかではなく __業務が回るか__ を見る',
          '　==アルファテスト==（開発者側の環境）／==ベータテスト==（限定ユーザの実環境）／==運用受入テスト==（OAT, 運用部門が運用手順を確認）',
          '　__本番に近い環境とデータで行う__のが要点。性能や操作性はテスト環境では正しく測れない（→ §15 定石7）',
          '__終結__（4.7 プロジェクトまたはフェーズの終結・終結プロセス群）:',
          '　__サインオフ__: 顧客／スポンサーの __正式な承認__。成果物の受入・契約終結・要員の解放を確認する',
          '　出てくるもの: ==最終報告書==／教訓登録簿の最終化／運用部門への ==移行==（service-management §8）',
          '　__早期終結でも手順は同じ__。価値を失って中止する場合も、__正式な終結手続きを踏んで__記録と教訓を残す',
          '==ベネフィット実現マネジメント==: 投資が __実際に便益を生んだか__ を確かめる活動',
          '　__有形の便益__（売上増・コスト削減）と __無形の便益__（ブランド・満足度）',
          '　__測るのは終結後__。==ベネフィット・レビュー== を6か月〜数年後に行う。__プロジェクトが終わった時点では便益はまだ出ていない__',
        ],
        navyItems: [[{ text: '受入基準は着手前に決める、UAT は本番相当環境で行う、便益は終結後に測る。この3点が午後Ⅰで問われる', style: 'navy' }]],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '13. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__7QC道具__: ==パレート図==・==特性要因図==・==管理図==・==ヒストグラム==・==散布図==・==チェックシート==・==層別==',
          '__新7QC道具__: ==親和図==・==連関図==・==系統図==・==マトリクス図==・==PDPC==・==アローダイアグラム==・==マトリクスデータ解析==',
          '__7QC vs 新7QC__: 数値データ vs 言語データ',
          '__品質コスト__: ==適合コスト==（予防・評価）vs ==不適合コスト==（内部不良・外部不良）。==1-10-100の法則==',
          '__品質 vs グレード__: 品質=要求充足度、グレード=機能特性のクラス',
          '__PDCAサイクル__: Plan-Do-Check-Act の継続的改善',
          '__DMAIC__: シックスシグマの5段階（Define-Measure-Analyze-Improve-Control）',
          '__3σ管理__: ==±3σ==は99.73%。プロセス能力指数 Cp/Cpk',
          '__CMMI 成熟度レベル__: 初期/管理/定義/定量的管理/最適化 の5段階',
          '__ISO 9001__: 7つの品質マネジメント原則／PDCAとリスク思考',
          '__DoD__: スクラムの完了の定義（development-approach §20 参照）',
          '__TDD__: Red-Green-Refactor サイクル',
          '__UAT__: 実ユーザによる最終受入テスト',
        ],
      },
      {
        heading: '14. ひっかけパターン',
        items: [
          '__7QC vs 新7QC__: 数値データ用 vs 言語データ用の混同',
          '__パレート図 vs ヒストグラム__: 不良原因の頻度順 vs 度数分布',
          '__特性要因図__: 別名「フィッシュボーン」「石川ダイアグラム」（同じもの）',
          '__予防コスト vs 評価コスト__: 予防=不良を防ぐ事前コスト、評価=検査による検出コスト',
          '__内部不良 vs 外部不良__: 出荷前 vs 出荷後',
          '__品質 vs グレード__: 品質は==要求充足度==、グレードは==機能のクラス==',
          '__8.2 vs 8.3__: 8.2=実行プロセス群、8.3=監視・コントロールプロセス群',
          '__DMAIC vs DMADV__: 既存プロセス改善 vs 新プロセス設計',
          '__σ レベル__: ==6σ==は3.4不良/百万、==3σ==は99.7%適合',
          '__TDD vs BDD__: テスト中心 vs ユーザ行動中心。Red-Green-Refactor vs Given-When-Then',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '15. 午後Ⅰの定石（品質・レビュー・検証）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの品質系設問は「品質指標の解釈」と「検証の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 品質は上流で作り込む__: 欠陥の修正コストは後工程ほど増大（==1-10-100の法則==）。要求の解釈ずれは==上流の認識合わせ==で防ぐ（H27問3・H28問2）',
          '__2. レビューは早く・当事者を巻き込む__: ==早期レビュー==が欠陥・認識ギャップを安く検出する。ベンダ間の境界は==共同レビュー==で（R1問3・R3問3）',
          '__3. 欠陥は混入工程まで遡って分析__: 摘出した工程でなく==混入した工程==を特定し、前工程の弱点（レビュー不足等）を是正する（H30問2・H25問4）',
          '__4. 品質指標は前提条件とセットで判断__: バグ密度・摘出率は==管理目標の前提==（テストケース量・有意差・暫定値の仮定）を確認してから解釈する（H29問3・H30問2）',
          '__5. テストで上げられる品質には上限がある__: ==設計限界品質==。設計品質が低いとテストをいくら増やしても届かない（H30問2）',
          '__6. テストの見逃しは下流へ流出する__: テスト技法の特性（WB/BB）を理解し、レビューとテストの==組み合わせ==で補完する（H29問3）',
          '__7. 本番に近い環境・データで検証__: 操作性・性能は==本番相当の環境・データ==でしか正しく評価できない。移行テストは本番データの代表性に限界がある（R6問1・R4問1・H26問3）',
          '__8. 非機能（性能）の検証は早めに__: 性能問題は作り込み後の対処が高くつく。検証時期を==前倒し==で計画する（H27問2）',
          '__9. 利用者参加型の反復検証__: ==同じ利用者==が要件定義→設計→テストを通して評価すると、主観的な品質特性のズレを早期発見できる（R6問1・R2問3）',
          '__10. 改修時は回帰テスト__: 既存機能が壊れていないことを==リグレッションテスト==で確認する（R3問2）',
          '__11. 品質の作り込みは記録で可視化__: 出来高でなく==品質活動の実施状況・記録==（レビュー記録・テスト消化）で確認する（H25問4・H29問2）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==7QC道具==（数値データ）と==新7QC道具==（言語データ）の対比・各ツールの用途は午前Ⅱ 必出。',
      '【QA vs QC】==品質保証==は__プロセス__が対象（品質監査）、==品質管理==は__成果物__が対象（検査・テスト）。IPA は「品質保証」の語を使う。',
      '【品質コスト】==適合コスト==（予防＋評価）vs ==不適合コスト==（内部不良＋外部不良）。==1-10-100の法則==。',
      '【統計】==±3σ==は==99.73%==。==6σ==は3.4不良/百万。==DMAIC==（既存改善）vs ==DMADV==（新規設計）。',
      '【アジャイル品質】==DoD==／==TDD==（Red-Green-Refactor）／==BDD==（Given-When-Then）。',
      '【ひっかけ】==品質 vs グレード==／==予防 vs 評価==／==内部不良 vs 外部不良==（出荷前後）／==8.2（実行）vs 8.3（監視）==。',
    ],
  },

  // ───────────────────────────────────────────
  // 7. 測定（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  measurement: {
    summary:
      'プロジェクトのパフォーマンスを定量的に測定し、意思決定と継続的改善を支援する活動領域。PMBOK第6版では第7章 EVM 中心、第7版では「測定」パフォーマンス領域として統合。EVM 公式（PV/EV/AC/CPI/SPI/EAC/ETC/VAC/TCPI）と規模見積もり（FP法・COCOMO）が午前Ⅱ 最頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 何のために測るか（指標の分類・KPI と KRI）',
        items: [
          'PMBOK第7版「==測定==」パフォーマンス領域: パフォーマンスを監視・評価し、適切な手を打つための活動。第6版では第7章コスト（EVM 中心）が対応する',
          '__測定は手段であって目的ではない__。「この数字で何を判断するか」を決めてから指標を選ぶ',
          '　__測っているのに何も変わらない__状態が最悪。判断に使わない数字を集めるのは工数の無駄になる',
          '__いつ動く指標か__で2つに分かれる:',
          '　==リーディング指標==（先行指標）: 結果が出る__前__に動く。__まだ手を打てる__のが利点（レビュー指摘密度・要員稼働率）',
          '　==ラギング指標==（遅行指標）: 結果が__確定した後__に分かる。正確だが__対策が間に合わない__（売上・最終欠陥数）',
          '　__使い分け__: 事後評価はラギング、__早く手を打ちたい__ならリーディングを併用する',
          '　==成果メトリクス==（結果に焦点）と ==実行メトリクス==（活動量に焦点）の区別も問われる',
          '__何を見る指標か__で2つに分かれる:',
          '　==KPI==（Key Performance Indicator）: 「どれだけうまくいっているか」を測る ==業績指標==（CPI・顧客満足度）',
          '　==KRI==（Key Risk Indicator）: 「どれだけ危ない状況か」を測る ==リスク指標==（離職率・バグ密度・遅延日数）',
          '　__どちらを置くか__: 達成度を評価したいなら KPI、__予兆を検知して先に手を打ちたい__なら KRI',
          '　KRI は ==しきい値== とセットで設計する。__超えたら対応が自動的に発動する__形にしないと、結局見逃す（→ §14 定石8）',
          'KPI の設定は __SMART 原則__（具体的・測定可能・達成可能・関連性・期限付き）に沿って行う',
        ],
        navyItems: [[{ text: 'リーディング／ラギングは「手を打てるか」、KPI／KRI は「成果を見るか危険を見るか」。2つの軸を混同しない', style: 'navy' }]],
      },
      // ── B. EVM ──
      {
        heading: '2. EVM の基本（PV / EV / AC / BAC）',
        items: [
          // 赤字密度メモ: EVM の基本4値は午前Ⅱ最頻出のため 7 個許容（方針書 §7）
          '==EVM==（Earned Value Management, アーンドバリュー法）: スコープ・スケジュール・コストを__1つの金額尺度__に載せて統合管理する手法',
          '__4つの基本値__:',
          '　==PV==（Planned Value, 計画値）: 当初計画で今までに完了しているはずのコスト（別名 BCWS）',
          '　==EV==（Earned Value, 出来高）: 実際に完了した作業の==当初計画コスト==（別名 BCWP）',
          '　==AC==（Actual Cost, 実コスト）: 実際に完了した作業に実際にかかったコスト（別名 ACWP）',
          '　==BAC==（Budget at Completion, 完成時総予算）: プロジェクト全体の計画予算',
          '__EV だけが「計画のものさしで測った実績」__。ここを実コストと取り違えると CV/SV/CPI/SPI がすべて崩れる',
          '__EV の計上ルール__: ==0/100法==（完了時のみ100%）／50/50法（開始50%・完了100%）／パーセント完了法／重み付けマイルストーン法',
          '　ルールは__着手前に合意__しておく。担当者の自己申告に委ねると出来高が水増しされる（→ §25 定石1・定石4）',
        ],
        navyItems: [[{ text: 'PV/EV/AC/BAC は EVM の最重要4値。午前Ⅱ で必ず出題される', style: 'navy' }]],
      },
      {
        heading: '3. 差異と効率指数（CV / SV / CPI / SPI）',
        items: [
          // 赤字密度メモ: EVM の差異と効率指数は午前Ⅱ最頻出のため 12 個許容（方針書 §7）
          '__同じ4値から「引き算」と「割り算」の2系統が出る__。ここを押さえれば全部つながる',
          '__差異（引き算）__ — 単位はコスト。__プラスが良い__',
          '　==CV==（コスト差異）= ==EV - AC==。CV > 0 なら ==コスト節約==／CV < 0 なら超過',
          '　==SV==（スケジュール差異）= ==EV - PV==。SV > 0 なら ==スケジュール先行==／SV < 0 なら遅延',
          '__効率指数（割り算）__ — 比率で無次元。__1を境に判定__',
          '　==CPI==（コスト効率指数）= ==EV / AC==。==CPI > 1== ならコスト効率良好／1未満なら悪化',
          '　==SPI==（スケジュール効率指数）= ==EV / PV==。==SPI > 1== ならスケジュール先行／1未満なら遅延',
          '__覚え方の型__: 4つとも __分子（引かれる側）は必ず EV__。相手が AC ならコストの話、PV ならスケジュールの話',
          '__なぜ差異と指数を両方使うのか__:',
          '　差異は__金額や日数の大きさ__が分かるが、規模の違う工程どうしを比べられない',
          '　指数は比率なので ==規模に依存しない==。__工程間・チーム間・案件間を同じ物差しで比べられる__',
          '__健全性の4象限__: CV・SV とも正なら順調／CV 正・SV 負は「安いが遅い」／CV 負・SV 正は「速いが高い」／両方負なら危機的',
          '__SPI の限界__: 終盤は EV も PV も BAC に近づくため、__遅れていても必ず1に収束する__。終盤の遅延判定には ==アーンドスケジュール（ES）== を使う（→ §6）',
        ],
        navyItems: [[{ text: '4指標すべて分子は EV。相手が AC ならコスト、PV ならスケジュール。この一点で式を復元できる', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '同じ3値から、引き算で差異・割り算で効率指数が出る',
            ariaLabel: 'PV EV AC の3値から、引き算でCVとSV、割り算でCPIとSPIが導かれることを示す図',
            viewBox: '0 0 400 330',
            content: `
              <defs>
                <marker id="evm-arrow" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#64748b" />
                </marker>
              </defs>
              <rect x="10" y="14" width="380" height="58" rx="10" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />
              <text x="200" y="40" fill="#1e293b" font-size="15" font-weight="700" text-anchor="middle">EV（出来高）を中心に置く</text>
              <text x="200" y="60" fill="#475569" font-size="12.5" text-anchor="middle">相手が AC ならコスト、PV ならスケジュール</text>

              <line x1="120" y1="72" x2="90" y2="98" stroke="#64748b" stroke-width="2.5" marker-end="url(#evm-arrow)" />
              <line x1="280" y1="72" x2="310" y2="98" stroke="#64748b" stroke-width="2.5" marker-end="url(#evm-arrow)" />

              <rect x="10" y="104" width="182" height="106" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
              <text x="101" y="128" fill="#1d4ed8" font-size="15" font-weight="700" text-anchor="middle">引き算 → 差異</text>
              <text x="101" y="152" fill="#1e293b" font-size="13.5" text-anchor="middle">CV ＝ EV − AC</text>
              <text x="101" y="174" fill="#1e293b" font-size="13.5" text-anchor="middle">SV ＝ EV − PV</text>
              <text x="101" y="198" fill="#1d4ed8" font-size="12.5" font-weight="700" text-anchor="middle">プラスなら良い</text>

              <rect x="208" y="104" width="182" height="106" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <text x="299" y="128" fill="#15803d" font-size="15" font-weight="700" text-anchor="middle">割り算 → 効率指数</text>
              <text x="299" y="152" fill="#1e293b" font-size="13.5" text-anchor="middle">CPI ＝ EV ÷ AC</text>
              <text x="299" y="174" fill="#1e293b" font-size="13.5" text-anchor="middle">SPI ＝ EV ÷ PV</text>
              <text x="299" y="198" fill="#15803d" font-size="12.5" font-weight="700" text-anchor="middle">1より大きければ良い</text>

              <rect x="10" y="226" width="380" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
              <text x="200" y="252" fill="#475569" font-size="12.5" font-weight="700" text-anchor="middle">差異は「どれだけ」が分かる／指数は規模の違う対象を比べられる</text>

              <rect x="10" y="278" width="380" height="42" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
              <text x="200" y="304" fill="#b45309" font-size="12.5" font-weight="700" text-anchor="middle">SPI は終盤に必ず1へ収束する。遅延判定は ES を使う</text>
            `,
          },
        ],
      },
      {
        heading: '4. 完了予測（EAC / ETC / VAC / TCPI）',
        items: [
          // 赤字密度メモ: 公式そのものが解答語のため 11 個許容（方針書 §7）。意味づけは本節、暗記シートは §8
          '__完了予測__の4指標:',
          '　==EAC==（Estimate at Completion, 完成時総コスト予測）— 3公式を__状況で使い分ける__:',
          '　　今の効率がこの先も続くとみる（最も一般的）: ==EAC = BAC / CPI==',
          '　　超過は一過性で残作業は計画どおり戻るとみる: ==EAC = AC + (BAC - EV)==',
          '　　コストとスケジュールの両方の悪化が続くとみる: ==EAC = AC + (BAC - EV) / (CPI × SPI)==',
          '　==ETC==（Estimate to Complete, 残作業コスト予測）= ==EAC - AC==',
          '　==VAC==（Variance at Completion, 完成時差異）= ==BAC - EAC==。__正なら__ BAC 内で完了見込み',
          '　==TCPI==（To-Complete Performance Index, 残作業効率指数）= __残作業__ ÷ __残予算__',
          '　　BAC を死守する場合: ==TCPI = (BAC - EV) / (BAC - AC)==',
          '　　EAC に目標を切り替えた場合: ==TCPI = (BAC - EV) / (EAC - AC)==',
          '　　__1が分岐点__: ==TCPI > 1== なら今より高い効率が要る（達成は厳しい）／1未満なら現状より緩い効率で足りる',
        ],
        navyItems: [[{ text: 'TCPI 計算は R6秋期 問4 で出題実績。TCPI=1.1 のような値が答え', style: 'navy' }]],
      },
      {
        heading: '5. EVM 計算式まとめ',
        items: [
          '__基本値__:',
          '　PV / EV / AC / BAC',
          '__差異__:',
          '　CV = EV - AC',
          '　SV = EV - PV',
          '__効率指数__:',
          '　CPI = EV / AC',
          '　SPI = EV / PV',
          '__完了予測__:',
          '　EAC = BAC / CPI（標準式）',
          '　EAC = AC + (BAC - EV)（残作業計画通り）',
          '　EAC = AC + (BAC - EV) / (CPI × SPI)（両方継続）',
          '　ETC = EAC - AC',
          '　VAC = BAC - EAC',
          '　TCPI = (BAC - EV) / (BAC - AC)（BAC維持）',
          '　TCPI = (BAC - EV) / (EAC - AC)（EAC維持）',
          '__暗記のコツ__:',
          '　==差は引き算==（CV/SV）／==効率は割り算==（CPI/SPI）',
          '　==分子は EV==（CV/SV/CPI/SPI すべて）',
        ],
        navyItems: [[{ text: '本セクションは午前Ⅱ/午後I の計算問題の参照シート。全式暗記必須', style: 'navy' }]],
      },
      {
        heading: '6. EVM が使えない場面とアーンドスケジュール（ES）',
        items: [
          '__EVM は万能ではない__。使える前提と、苦手なことを知っておく',
          '__使うための前提条件__: スコープが明確・WBS が完備・ベースラインが承認済み・==進捗の測定方法が事前に合意済み==（0/100法など）',
          '　__測定方法の事前合意が特に重要__。決めずに始めると出来高が自己申告になり、数字が信用できなくなる',
          '__EVM の限界__:',
          '　==スコープ変更に弱い==。変更のたびにベースラインを引き直す必要があり、頻繁に変わる案件では追随できない',
          '　__品質は測れない__。予定どおり安く早く作っても、中身が粗ければ EVM の数字は良く出る',
          '　__SPI が終盤に1へ収束する__（→ §3）。遅れているのに数字上は正常に見える',
          '　__アジャイルではバーンダウンやベロシティ__が代替になる（→ §7・§8）',
          '==ES==（アーンドスケジュール）: SPI の __終盤収束問題を解決する__ 代替指標',
          '　__考え方__: 金額でなく __時間で測る__。「今の出来高（EV）は、計画上いつの時点に相当するか」を求める',
          '　==ES== の定義: 現在の EV と __同じ値の PV に達していたはずの時点__',
          '　　==SV(t)== = ES − 現在の時点／==SPI(t)== = ES ÷ 現在の時点',
          '　__計算例__: 現在 t=10 で EV=100。計画では PV=100 になるのが t=12 だった',
          '　　→ ES=12、SV(t) = 12 − 10 = +2（2単位の先行）、SPI(t) = 12 ÷ 10 = 1.2',
          '　__利点__: 時間単位で表せるので __終盤でも意味を持つ__。長期プロジェクトで有効',
        ],
        navyItems: [[{ text: 'ES は 2003年 Walter Lipke 提唱。PMBOK第6版で言及はあるが適用は組織判断。SPI の終盤収束への答えとして覚える', style: 'navy' }]],
      },
      // ── C. スケジュール・進捗・規模の測定 ──
      {
        heading: '7. アジャイル系の進捗指標（バーンダウン・リードタイム）',
        items: [
          '==バーンダウン・チャート==: __残作業__を時系列でプロットする。右下がりが理想',
          '　__線の読み方__: 水平は ==停滞==（着手はしても完了していない）／上昇は ==スコープ追加== か ==手戻り==',
          '==バーンアップ・チャート==: __完了量__と__総スコープ__の2本線を描く。総スコープ線が動くため ==スコープ変更== が見える',
          '　__使い分け__: 残りだけ追うならバーンダウン、__スコープが動く__案件ならバーンアップ',
          '__時間の測り方は2つ__。どこからどこまでを測るかが違う',
          '　==リードタイム==: __顧客が要求してから受け取るまで__（顧客視点）',
          '　==サイクルタイム==: __作業に着手してから完了するまで__（開発視点）',
          '　__差は着手待ち__。サイクルタイムが同じでも、順番待ちの行列が長ければリードタイムは伸びる',
          '　　__顧客が体感するのはリードタイム__。作業を速くするだけでなく、待ち行列を短くする必要がある',
          '==スループット==: 単位時間あたりに完了する量',
          '==リトルの法則==: ==WIP = スループット × サイクルタイム==',
          '　__使いどころ__: スループットが一定なら、==WIP を減らすとサイクルタイムが縮む==。__仕掛かりを絞る根拠__になる',
          '　同時に10件抱えるより3件ずつ片付ける方が、1件あたりは早く終わる',
        ],
        navyItems: [[{ text: '本ノートは「WIP = スループット × サイクルタイム」で統一（サイクルタイムは着手〜完了）。午前Ⅱでの単独出題は12年で0回', style: 'navy' }]],
      },
      {
        heading: '8. 規模・工数の見積もり（FP法・COCOMO・ベロシティ）',
        items: [
          // 赤字密度メモ: FP法・COSMIC法・COCOMO・ベロシティの4論点（午前Ⅱ延べ11問）を1セクションに
          // 収容するため 7 個許容（方針書 §7・planning §8 と同水準）。
          // 機能種別（ILF/EIF/EI/EO/EQ）を赤字にしないのは、出題が「名称」でなく「2グループへの分類」を
          // 問う形式のため（H29問13 ほか）。種別名は見せたまま分類名を隠すのが出題形式に合う。
          '==ファンクションポイント法==（FP法）: __機能の数と複雑さ__からソフトウェア規模を測る。行数と違い__設計段階で見積もれる__',
          '　__IFPUG 法の機能種別__（名称でなく__この2グループへの分類__が問われる。H29問13・H27問11・H25問12）:',
          '　　==データファンクション==（データの保管）: __ILF__（内部論理ファイル・自システムが更新）／__EIF__（外部インタフェースファイル・他システムが更新）',
          '　　==トランザクションファンクション==（データの処理）: __EI__（外部入力）／__EO__（外部出力）／__EQ__（外部照会）',
          '　　__見分け方__: __ファイル__ならデータ、__データの出入り__ならトランザクション',
          '　__調整済FP__ = 未調整FP × __調整係数__（R5問10）',
          '==COSMIC 法==: データ移動を__エントリ／エグジット／読込み／書込み__の4種に分類して数える規模測定法。__機能プロセス単位__で測る点が FP法 と異なる（R3問9）',
          '==COCOMO==: 開発規模から工数を見積もるモデル。工数 = 定数 × 開発規模^指数（例: 3.0 × 規模^1.12）',
          '　__開発生産性__ = 開発規模 ÷ 開発工数（問題文に定義が示されるので暗記より使い方が大事）',
          '　__指数が1を超える__ため==規模が大きいほど生産性は下がる==（規模の不経済）。生産性のグラフは__右下がり__になる（R4問10・R2問9・H30問8・H28問11・H26問14）',
          '==ベロシティ==: 1スプリントで完了したストーリーポイントの合計。過去数スプリントの平均で将来を予測。__チーム固有の値__でチーム間比較は無意味',
          '__キャパシティ計画__: 稼働可能時間×稼働率で算出し、休暇・会議を控除',
        ],
        navyItems: [[{ text: '規模見積もりは午前Ⅱ 問9〜11 の常連。FP法は分類、COCOMO は「規模が増えると生産性が落ちる」の一点が問われる', style: 'navy' }]],
      },
      // ── D. 品質・成果測定 ──
      {
        heading: '9. 品質と顧客のメトリクス',
        items: [
          '__品質を測る__:',
          '　==欠陥密度== = 欠陥数 ÷ プロダクトサイズ（==バグ数 / KLOC== など）。__規模で割る__ので大小の異なるモジュールを比べられる',
          '　==欠陥率== = 欠陥数 ÷ 検査数。単位は % または ==DPMO==（百万機会あたりの欠陥数）',
          '　欠陥は ==重大度==（Severity, どれだけ困るか）と ==優先度==（Priority, どれだけ早く直すか）を__分けて管理する__',
          '　　__重大度が高くても優先度が低い__ことはある（滅多に通らない画面の致命的バグ）',
          '__顧客の満足を測る__:',
          '　==CSAT==: 「どれくらい満足ですか」に対する満足回答の割合。__取引ごと・短期__の評価',
          '　==NPS==（Net Promoter Score）: 「知人に薦めますか」を 0〜10 点で聞き、==推奨者(9-10)% − 批判者(0-6)%== で算出',
          '　　__中立者(7-8)は計算から除外する__のが特徴。範囲は -100 〜 +100',
          '　　__使い分け__: 目先の満足度なら CSAT、__継続してくれるか（ロイヤルティ）__なら NPS',
          '__プロダクトの利用を測る__（SaaS 系）: ==DAU/MAU==（アクティブユーザ）／==解約率==（Churn Rate）／==LTV==（顧客生涯価値）／CAC（顧客獲得コスト）',
        ],
        navyItems: [[{ text: 'NPS は中立者を除外する点が判別ポイント。欠陥は重大度と優先度が別軸であることも問われる', style: 'navy' }]],
      },
      // ── E. 戦略的測定 ──
      {
        heading: '10. 戦略を測る（BSC・OKR・経済性評価）',
        items: [
          '==BSC==（バランススコアカード）: 戦略の実行を__多面的に__評価する枠組み（Kaplan ＆ Norton, 1992年）',
          '　__財務だけ見ると短期志向になる__ので、財務以外の視点を組み合わせるのが狙い',
          '　__4つの視点__（下が土台、上が結果）:',
          '　　==財務の視点==: 株主への価値（売上・利益・ROE）',
          '　　==顧客の視点==: 顧客満足・市場シェア・顧客維持率',
          '　　==業務プロセスの視点==: 業務効率・品質・革新',
          '　　==学習と成長の視点==: 従業員スキル・組織能力・情報技術',
          '　__順番で覚える__: 人が育つ（学習と成長）→ 業務が回る（プロセス）→ 顧客が満足する → 財務に表れる',
          '　　この ==因果関係== を矢印で図示したものが __戦略マップ__',
          '==OKR==: ==Objective==（定性的で野心的な目標）と ==Key Results==（定量的な達成基準 3〜5個）の組で管理する手法',
          '　特徴: 全社に公開する透明性／==70%達成が標準== という野心的な設定／__報酬と切り離す__',
          '　　__報酬と切り離す理由__: 評価に直結すると、達成しやすい低い目標を置くようになる',
          '　__BSC との違い__: BSC は__多次元のバランス__、OKR は__野心的な少数目標への集中__',
        ],
        navyItems: [[{ text: 'BSC は4視点とその因果順序、OKR は「70%達成が標準・報酬と切り離す」が判別ポイント', style: 'navy' }]],
      },
      // ── F. パフォーマンス・レポート ──
      {
        heading: '11. 測った結果をどう伝えるか（報告・可視化・会議）',
        items: [
          '__経済性評価も測定の一部__。式と判定は planning §12 で扱う',
          '　__使い分け__: ==NPV== は規模の違う案件の比較、==IRR== は投資効率の比較、==回収期間== は資金繰りを重視するとき',
          '__報告書は「答える問い」で4種類__に分かれる（project-work §4）',
          '　==ステータス==: 今どうなっているか（現状）',
          '　==トレンド==: どちらへ向かっているか（傾向）',
          '　==予測==: このままだとどうなるか（EAC・完了時期）',
          '　==バリアンス==: 計画とどれだけ違うか（差異）',
          '==ダッシュボード==: 指標を一画面にまとめて可視化する。==RAG ステータス==（Red / Amber / Green）で直感的に判定できるようにする',
          '　__グラフは目的で選ぶ__: 折れ線は時系列、棒は比較、円は構成比、散布は相関',
          '__会議体は判断の粒度で分ける__:',
          '　デイリースタンドアップ（15分・日次の障害共有）／スプリント・レビュー（成果物の確認）',
          '　==ステアリングコミッティ==（経営判断・月次）／==フェーズゲート== での Go/No-Go 判定（governance §6）',
          '　__会議の原則__: データに基づく・打ち手を決める・時間を区切る・決めたことを追いかける',
          '　　__報告して終わる会議は意味がない__。決定と担当と期限が残って初めて機能する',
        ],
        navyItems: [[{ text: '報告書4種は「現状／傾向／予測／差異」。誰にどの粒度で伝えるかを設計するのが測定の出口', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '12. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__EVM 基本値__: ==PV==・==EV==・==AC==・==BAC== の定義と計算',
          '__EVM 差異__: ==CV== = EV-AC、==SV== = EV-PV',
          '__EVM 効率指数__: ==CPI== = EV/AC、==SPI== = EV/PV',
          '__EVM 完了予測__: ==EAC==・==ETC==・==VAC==・==TCPI== の公式',
          '__TCPI 計算__: ==(BAC-EV)/(BAC-AC)==（R6秋期 問4 で出題）',
          '__規模見積もり__: ==FP法==の機能種別分類（H29問13・H27問11・H25問12）／==COCOMO==の生産性グラフ（R4問10 ほか計5回）',
          '__バーンダウン__: 残作業の時系列読み取り',
          '__顧客満足度__: ==NPS== = 推奨者% - 批判者%',
          '__BSC__: 4視点（財務／顧客／業務プロセス／学習と成長）',
          '__OKR__: Objectives（定性的）と Key Results（定量的）',
          '__経済性評価__: NPV / IRR / 回収期間（planning §24 参照）',
          '__3σ管理__: ==±3σ==は99.73% 適合（delivery §17 参照）',
        ],
      },
      {
        heading: '13. ひっかけパターン',
        items: [
          '__PV vs EV vs AC__: PV=計画、EV=出来高（の計画コスト）、AC=実コスト',
          '__CV vs SV__: CV=コスト差異、SV=スケジュール差異。両方とも==EV - X==の形',
          '__CPI vs SPI__: 両方とも==EV を分子==（EV/AC、EV/PV）',
          '__TCPI の分母__: BAC 維持なら ==(BAC-AC)==、EAC 維持なら ==(EAC-AC)==',
          '__SPI の限界__: 終盤で必ず1に近づく（ES が代替）',
          '__データF vs トランザクションF__: ILF/EIF は==保管==、EI/EO/EQ は==処理==（H29問13 ほか）',
          '__リーディング vs ラギング__: リーディング=先行指標、ラギング=遅行指標',
          '__KPI vs KRI__: 業績指標 vs リスク指標',
          '__CSAT vs NPS__: 単発満足 vs ロイヤリティ',
          '__BSC vs OKR__: 多次元バランス vs 野心的目標',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '14. 午後Ⅰの定石（進捗・定量マネジメント）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの進捗系設問は「数値の解釈」と「測定方法の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 進捗は自己申告でなく出来高で測る__: 「90%完了」の申告は当てにならない。==EVM==・成果物の完成基準・==重み付け==で客観測定する（R1問3・H26問2）',
          '__2. 数値で掴み、CPへの影響を見てから動く__: ==SPI/CPI==で遅延・超過を定量把握し、==クリティカルパス==上かを確認してから対策を選ぶ（H28問3）',
          '__3. 集計値は部分の問題を隠す__: 全体 SPI が 1 に近くても、特定工程・チームの深刻な遅れが==平均に埋もれる==。層別・工程別に見る（H28問3）',
          '__4. 進捗線の読みは前提の確認から__: イナズマ線・出来高は==計上ルール（完了基準）が揃っている==ことが前提。ルールが曖昧なら数字は信用できない（H26問2）',
          '__5. 管理目標は前提条件とセットで判断__: 指標が目標内でも、前提（テストケース密度・母数）が崩れていれば意味がない（H29問3・H30問2）',
          '__6. 改善は弱みに集中、強みは横展開__: プロセス改善は==弱点工程を優先==し、強い工程のやり方を他へ広げる（R1問3）',
          '__7. 効果は顧客視点で測る__: 作業量・アウトプットでなく==顧客体験価値==・広義の生産性で効果を測定する（R3問2・R2問2）',
          '__8. 予兆はしきい値で機械的に検知__: ==KRI にしきい値==を設け、超えたら対応を発動する仕組みにする（発見を個人の注意力に頼らない）（R6問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・EVM】==CV=EV-AC==、==SV=EV-PV==、==CPI=EV/AC==、==SPI=EV/PV==。==分子は常に EV==。',
      '【TCPI】==BAC維持==なら ==(BAC-EV)/(BAC-AC)==、==EAC維持==なら ==(BAC-EV)/(EAC-AC)==。R6秋期 問4 の出題実績。',
      '【EAC 3公式】標準=BAC/CPI、残作業計画通り=AC+(BAC-EV)、両方継続=AC+(BAC-EV)/(CPI×SPI)。',
      '【規模見積もり】==FP法==は ILF/EIF が==データ==、EI/EO/EQ が==トランザクション==。==COCOMO==は「規模が増えるほど==生産性は下がる==」。',
      '【NPS】==推奨者(9-10)% − 批判者(0-6)%==。中立者(7-8)は計算除外。',
      '【ひっかけ】SPI は終盤で必ず1に収束（ES が代替）／KPI（業績）vs KRI（リスク）／リーディング vs ラギング。',
    ],
  },

  // ───────────────────────────────────────────
  // 8. 不確かさ・リスク（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  uncertainty: {
    summary:
      'リスク（不確かな事象の影響）と機会（プラスのリスク）を識別・分析・対応・監視する活動領域。PMBOK第6版では第11章「リスクマネジメント」7プロセス、第7版では「不確かさ」パフォーマンス領域。確率影響度マトリクス・EMV・脅威/機会5戦略が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. リスクとは何か（脅威・機会・不確かさの4要素）',
        items: [
          '==リスク==: __まだ起きていないが、起きたらプロジェクトの目標に影響する__事象や状態',
          '　__すでに起きていることは「課題」__であってリスクではない。この区別が答案の書き分けに効く',
          '　__PMBOK は良い方向の不確かさも「リスク」に含める__: ==脅威==（マイナス）と ==機会==（プラス）の両方',
          '　　日常語では「リスクは悪いこと」と捉えるので、__機会もリスクである__という点がひっかけになる',
          '__リスクは3要素で書く__: 「==事象・原因・影響==」',
          '　「テストが遅れる」だけでは動けない。__「要員確保が遅れたため（原因）結合テストが2週間遅延し（事象）本番稼働に間に合わない（影響）」__まで書いて初めて対応を設計できる',
          '==リスク・スコア== = ==確率 × 影響度==。優先順位づけの基本尺度',
          '__PMBOK第7版は範囲を広げて「不確かさ」と呼ぶ__。リスク以外に3つの不確かさがある',
          '　==曖昧さ==: __意味や条件がはっきりしない__（何を作るか固まらない）→ プロトタイピング・段階的詳細化で減らす',
          '　==複雑性==: __要素が絡み合って結果が読めない__（多数の連携先）→ 小さく試して反応を見る・アジャイル',
          '　==変動性==: __前提そのものが速く変わる__（市場・法制度）→ 適応型ライフサイクル',
          '　__リスクとの違い__: リスクは__確率と影響を見積もれる__もの。見積もれないものが残り3つ',
          '　第6版では第11章「リスクマネジメント」7プロセスが対応する',
        ],
        navyItems: [[{ text: '「まだ起きていないならリスク、すでに起きたなら課題」の区別と、機会もリスクに含む点が出題の起点', style: 'navy' }]],
      },
      {
        heading: '2. リスクマネジメントの7プロセスと計画（11.1）',
        items: [
          '__7つのうち5つが計画__。ここが判別問題の答えになる',
          '　==計画プロセス群が5つ==: 11.1 計画／11.2 特定／11.3 定性的分析／11.4 定量的分析／11.5 対応計画',
          '　==11.6 リスク対応策の実行== が __実行プロセス群__（第6版で新設）',
          '　==11.7 リスクの監視== が __監視・コントロールプロセス群__',
          '　__11.6 が新設された理由__: 旧版では「計画したのに実行されない」ことが起きたため、__実行を独立したプロセスとして切り出した__',
          '__11.1 リスクマネジメント計画__: リスクをどう管理するかの__やり方を先に決める__プロセス',
          '　計画書に定めるもの: ==リスク選好==・==リスク許容度==・==リスク・スレッショルド==（→ §10）／確率と影響度の定義／RBS／リスク・オーナーの決め方／予備の方針',
          '　__確率と影響度の物差しを先に揃える__のが要点。人によって「高・中・低」の感覚が違うと優先順位が付けられない',
        ],
        navyItems: [[{ text: 'プロセス群の内訳（計画5・実行1・監視1）は頻出。11.6 だけが実行群、という形で覚える', style: 'navy' }]],
      },
      // ── B. リスク特定 ──
      {
        heading: '3. リスクの特定（11.2）— 漏れなく洗い出す仕組み',
        items: [
          '__特定の難しさは「思いつかないものは書けない」こと__。だから__枠組みを使って強制的に視野を広げる__',
          '__技法__: ブレーンストーミング／チェックリスト／根本原因分析／__前提条件分析__／==SWOT==分析',
          '　__前提条件分析が実務で効く__。計画が置いている前提（既存資産が流用できる・要員が確保できる）が崩れる可能性を洗う',
          '==RBS==（リスク・ブレークダウン・ストラクチャー）: リスクを__カテゴリ別に階層分解__した枠組み',
          '　__WBS は作業を分解、RBS はリスクを分解__。発想は同じで、__枠があると「この枠が空欄だ」と漏れに気づける__',
          '　__典型カテゴリ__: ==技術==／==外部==（規制・市場・天災）／==組織==（資源・優先度）／==プロジェクトマネジメント==（見積もり・計画の甘さ）',
          '==プロンプトリスト==: 観点を与えて網羅性を高めるリスト',
          '　==PESTLE==: 政治・経済・社会・技術・法・環境。__外部環境のリスク__を洗うのに使う',
          '　TECOP（技術・環境・商業・運営・政治）／VUCA（変動性・不確実性・複雑性・曖昧さ）',
          '__出てくるもの__: ==リスク登録簿==（個別リスクの一覧 → §9）とリスク・レポート（全体像 → §9）',
        ],
        navyItems: [[{ text: 'プロンプトリストと RBS はどちらも「漏れを防ぐ枠組み」。何のためにあるかで覚えると選択肢を切れる', style: 'navy' }]],
      },
      // ── C. 定性的・定量的分析 ──
      {
        heading: '4. 定性的分析と定量的分析の違い（11.3 / 11.4）',
        items: [
          '__2段構えになっている__。__まず全部をふるいにかけ、残った重要なものだけ数値で詰める__',
          '　==11.3 定性的リスク分析==: __すべてのリスク__が対象。確率と影響度を評価して ==優先順位== を付ける。__数値化はしない__',
          '　==11.4 定量的リスク分析==: __重要なリスクだけ__が対象。金額や日数に ==数値化== する。__省略できるプロセス__',
          '　__この対比がそのままひっかけ__: 「全リスクが対象か」「数値化するか」「省略できるか」の3点で切れる',
          '==確率影響度マトリクス==（定性的分析の道具）: 縦軸に確率、横軸に影響度をとり、交点のセルで ==リスク・スコア== を決める',
          '　==RAG==（Red / Amber / Green）で色分けし、__どこから手を付けるかを一目で分かる__ようにする',
          '　__低確率・高影響__のリスクを見落としやすい。確率が低くても影響が致命的なら対応が要る',
          '__定量的分析の技法__: ==モンテカルロ法==／==感度分析==（→ §6）／==決定木分析==（→ §5）',
        ],
        navyItems: [[{ text: '定性は「全部・優先順位・数値化しない」、定量は「重要なものだけ・数値化・省略可」。3点セットで区別する', style: 'navy' }]],
      },
      {
        heading: '5. 期待金額価値（EMV）と決定木分析',
        items: [
          '==EMV==（Expected Monetary Value, 期待金額価値）: リスクの==期待値==を==金額==で表現',
          '__計算式__: ==EMV = 確率 × 影響額==',
          '__脅威の EMV__: ==マイナスの値==（コスト増）',
          '__機会の EMV__: ==プラスの値==（コスト減・利益）',
          '__合計 EMV__: 全リスクの EMV を合計（プラスとマイナスを通算）',
          '==決定木分析==（==デシジョンツリー==。設問はカタカナ表記が多い）: ==選択肢ごとの EMV==を計算して==最適な選択肢==を選ぶ',
          '__決定木の構成要素__:',
          '　==決定ノード==（四角）: 意思決定の分岐',
          '　==確率ノード==（円）: 不確実な分岐',
          '　==末端ノード==（三角）: 最終結果（金額）',
          '__計算手順__:',
          '　1. 末端から==EMV==を計算',
          '　2. 確率ノードで==確率×金額==の合計',
          '　3. 決定ノードで==最大 EMV==の選択肢を選ぶ',
          '試験頻出: EMV 計算問題・決定木計算問題',
        ],
        navyItems: [[{ text: 'EMV/決定木は午前Ⅱ 計算問題で頻出。状況設定から最適選択肢を求める', style: 'navy' }]],
      },
      {
        heading: '6. モンテカルロ法と感度分析',
        items: [
          '==モンテカルロ法==（Monte Carlo Simulation）: ==乱数==を使って==確率分布==を生成するシミュレーション手法',
          '__プロジェクトでの用途__:',
          '　==スケジュール==: 各アクティビティ所要時間の==確率分布==から完了日の==確率分布==を導出',
          '　==コスト==: 各コスト要素の確率分布から総コストの確率分布を導出',
          '__主要アウトプット__:',
          '　==S字曲線==（累積確率分布）',
          '　==確実度==（例: P50 = 50% で達成可能な値）',
          '　==P80==・==P90==等のリスク許容度に応じた値',
          '__典型例__: 「==P80== の完了日」= 80% の確率で間に合う日付',
          '==感度分析==（Sensitivity Analysis）: ==どのリスクが==プロジェクト目標に==最も影響するか==を分析',
          '__トルネード図__（Tornado Diagram）: 要因別の影響度を==棒グラフ==で長い順に並べた図（竜巻型）',
          '　==上位リスク==に==優先対応==',
          '__両者は補完的__: モンテカルロ=全体予測、感度分析=要因識別',
        ],
      },
      // ── D. リスク対応 ──
      {
        heading: '7. リスク対応計画と脅威・機会への5戦略（11.5）',
        items: [
          // 赤字密度メモ: 10戦略の名称がそのまま解答語のため 14 個許容（方針書 §7）
          '__11.5 リスク対応計画__: 個別リスクと全体リスクに__どう手を打つかを決める__プロセス',
          '　各リスクに ==リスク・オーナー==（対応の担当者）を必ず割り当てる',
          '　==コンティンジェント対応戦略==: __トリガーが起きたときだけ__実行する、あらかじめ決めておく対応',
          '__脅威と機会の戦略は鏡写し__。片方を覚えればもう片方が出る',
          '__脅威（マイナス）への5戦略__:',
          '　==回避==: __原因そのものを取り除く__（スコープを削る・実績ある技術に替える）。__リスクをゼロにする__',
          '　==転嫁==: __責任を第三者へ移す__（保険・契約条項・外注）。__リスクは消えず移るだけ__',
          '　==軽減==: 確率か影響度を__下げる__（プロトタイプで先に確かめる・予備プランを用意）',
          '　==受容==: 特別な手を打たない',
          '　　==能動的受容==: ==コンティンジェンシー予備==を用意して備える／==受動的受容==: 何もしない',
          '　==エスカレーション==: __PM の権限を超える__ので上位へ上げる',
          '__機会（プラス）への5戦略__:',
          '　==活用==: __機会を確実に手に入れる__（脅威の「回避」の裏返し。確率を100%にする）',
          '　==共有==: __第三者と組んで__両者が得をする（アライアンス・共同出資）',
          '　==強化==: 確率か影響度を__上げる__（脅威の「軽減」の裏返し）',
          '　==受容==・==エスカレーション== は脅威と共通',
          '__対応関係__: 回避 ↔ 活用（確率を0か100に）／転嫁 ↔ 共有（第三者を使う）／軽減 ↔ 強化（確率・影響を動かす）',
          '　__軽減 ↔ 強化__が最も間違えやすい。どちらも「程度を動かす」戦略',
          '__どれを選ぶか__: 影響度が極めて高い → 回避か転嫁／中くらい → 軽減／低い → 受容／権限外 → エスカレーション',
          '__版による違い__: 脅威・機会とも第5版までは4戦略。第6版で ==エスカレーション== が両方に追加され、5戦略になった',
          '　機会への4戦略（活用・共有・強化・受容）は__第5版にも存在した__。第6版で新設されたのはエスカレーションの方',
        ],
        navyItems: [[{ text: '「回避は原因を消す／転嫁は人に移す／軽減は小さくする」と動詞で覚えると、機会側の活用・共有・強化が自動的に出る', style: 'navy' }]],
      },
      {
        heading: '8. リスク対応の実行と監視（11.6 / 11.7）と二次・残存リスク',
        items: [
          '__11.6 リスク対応策の実行__: 計画した対応策を__実際に実施する__（==実行プロセス群==・第6版で新設）',
          '　__分離された理由__: 旧版では計画だけして実行されない事態が起きたため。__11.5 計画と 11.6 実行は別プロセス__',
          '__11.7 リスクの監視__: 対応策が効いているかを見て、新しいリスクを見つけ、登録簿を更新する（監視・コントロール群）',
          '　__技法__: リスクの再評価／==リザーブの分析==（予備がどれだけ残っているかの確認）／==リスク監査==（リスク管理のやり方自体を独立した立場で評価）',
          '__対応を打った後に残る／生まれるリスク__。この2つの区別が必出',
          '　==残存リスク==: 対応してもなお __残ってしまう__ 部分。__元のリスクの一部__。コンティンジェンシー予備でカバーする',
          '　==二次リスク==: 対応したこと __自体が生む新しい__ リスク。__元とは別のリスク__',
          '　　例: 遅れを取り戻すため要員を追加した → コミュニケーション経路が増えて調整が破綻する',
          '　__見分け方__: __「残り」なら残存、「新発生」なら二次__',
        ],
        navyItems: [[{ text: '11.5 計画と 11.6 実行が別プロセスなのは「計画倒れ」を防ぐため。残存は残り、二次は新発生で切る', style: 'navy' }]],
      },
      // ── E. リスク文書・関連概念 ──
      {
        heading: '9. リスク登録簿とリスク・レポート',
        items: [
          '__2つの文書は粒度が違う__。__誰に見せるか__で使い分ける',
          '　==リスク登録簿==: __個別リスクを1件ずつ__記録する中央データベース。実務者が使う',
          '　　記載項目: リスク記述（事象・原因・影響）／カテゴリ／確率・影響度・スコア／==リスク・オーナー==／対応戦略／==残存リスク・二次リスク==／==トリガー==',
          '　　==生きた文書==として、各プロセスの都度更新する。__作って終わりではない__',
          '　==リスク・レポート==: __プロジェクト全体を俯瞰__し、上位リスクをまとめたもの（第6版で新設）',
          '　　経営層やステアリングコミッティ向け。__1件ずつではなく全体の傾向__を伝える',
          '　__ひっかけ__: 登録簿は__個別の詳細__、レポートは__全体のサマリー__',
        ],
        navyItems: [[{ text: '個別の詳細なら登録簿、全体の俯瞰ならレポート。リスク・レポートは第6版で新設された点も問われる', style: 'navy' }]],
      },
      {
        heading: '10. リスク選好・許容度・スレッショルドと予兆の検知',
        items: [
          '__3つは抽象から具体へ降りていく階層__。この順序が問われる',
          '　==リスク選好==: 組織が __戦略レベルでどれだけ取りに行くか__ という姿勢',
          '　==リスク許容度==: __許容できる範囲__。選好を受けて幅にしたもの',
          '　==リスク・スレッショルド==: __エスカレーションを発動する具体的な境界値__。数字まで落ちる',
          '　__具体例__: 「成長のため多少の超過は許容する」（選好）→「コスト超過は最大15%まで」（許容度）→「15%を超えたら即エスカレーション」（スレッショルド）',
          '　いずれもリスクマネジメント計画書に明記する',
          '==リスク・プロファイル==: 組織や個人のリスクへの姿勢のパターン（回避型／中立型／選好型）',
          '　業界・組織文化・過去の経験・規制環境で決まる。金融や原子力は回避型、スタートアップは選好型',
          '__予兆を捕まえる仕組み__:',
          '　==リスク・トリガー==: リスクが起きる__直前に観測できる兆候__（台風接近 → 物流遅延、離職率上昇 → 要員不足）',
          '　__早期警戒システム__: ==KRI== に ==閾値== を設定し（例: SPI < 0.9 で警告）、超えたらアラートと対応手順が動く形にする',
          '　__個人の注意力に頼らない__のが要点。「気づいた人が報告する」運用は必ず漏れる（→ §14 定石3）',
        ],
        navyItems: [[{ text: '選好 → 許容度 → スレッショルドは「姿勢 → 範囲 → 数値」。抽象から具体への順序で覚える', style: 'navy' }]],
      },
      // ── F. アジャイル・特殊リスク ──
      {
        heading: '11. 全体リスク・統合リスクとアジャイルでの扱い',
        items: [
          '==プロジェクト全体リスク==: __個別リスクを足し合わせただけでは捉えられない__、プロジェクト全体としての不確かさ',
          '　個々は小さくても__相互作用で全体が破綻する__ことがある。指標は累積コスト超過確率・成功確率など',
          '　__経営判断の対象__なので ==ステアリングコミッティ== に上げる（governance §5）',
          '__つなぎ目に出るリスク__:',
          '　__統合リスク__: 複数のサブシステムやベンダーを __つなぐ時__ に出る（インターフェース不整合・性能劣化）',
          '　__依存関係リスク__: 外部（ベンダー・規制・他社サービス）や内部（他プロジェクト・特定の要員）への依存から生じる',
          '　　==依存関係マップ== で可視化し、__クリティカルな依存から__順に手を打つ',
          '__アジャイルでは管理が進め方に組み込まれる__:',
          '　==高リスク項目を早いスプリントに入れる==。__不確かさの大きいものを先に潰す__のが原則',
          '　短い反復とデモで、要求のずれを__早い段階で__見つける',
          '　==スパイク==: 技術的な不確かさを潰すための __短期の調査タスク__。作る前に確かめる',
        ],
        navyItems: [[{ text: '「高リスクを先にやる」がアジャイルのリスク対応の核。後回しにするほど手戻りが大きくなる', style: 'navy' }]],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '12. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__PMBOK6 第11章 7プロセス__: 11.1〜11.7 のプロセス群所属（計画5・実行1・監視1）',
          '__脅威5戦略__: ==回避==／==転嫁==／==軽減==／==受容==／==エスカレーション==',
          '__機会5戦略__: ==活用==／==共有==／==強化==／==受容==／==エスカレーション==',
          '__脅威/機会の対応関係__: 回避↔活用、転嫁↔共有、軽減↔強化',
          '__能動的受容 vs 受動的受容__: コンティンジェンシー予備の有無',
          '__確率影響度マトリクス__: 縦×横の優先順位付け',
          '__EMV 計算__: ==確率 × 影響額==・脅威はマイナス・機会はプラス',
          '__決定木__: 末端から計算・確率ノード=確率×金額の合計・決定ノード=最大選択',
          '__モンテカルロ__: 確率分布シミュレーション・P50/P80',
          '__感度分析__: ==トルネード図==で要因影響度',
          '__RBS__: リスク・カテゴリの階層分解',
          '__二次リスク vs 残存リスク__: 新発生 vs 残存部分',
          '__リスク選好/許容度/スレッショルド__: 戦略→プロジェクト→数値の階層',
          '__プロンプトリスト__: PESTLE/TECOP/VUCA',
        ],
      },
      {
        heading: '13. ひっかけパターン',
        items: [
          '__脅威 vs 機会__: 機会も「リスク」として扱う（プラスのリスク）',
          '__リスク vs 課題__: まだ起きていないのがリスク／すでに起きたのが課題',
          '__回避 vs 軽減__: 回避=原因除去、軽減=確率/影響度を下げる',
          '__転嫁 vs 受容__: 転嫁=第三者へ責任移転、受容=何もしない（または予備のみ）',
          '__能動的受容 vs 受動的受容__: コンティンジェンシー予備の==有無==',
          '__活用 vs 強化__: 活用=機会を確実に実現、強化=確率/影響度を上げる',
          '__脅威/機会の対応__: 軽減↔強化（覚えにくいひっかけ）',
          '__11.6 vs 11.7__: 実行 vs 監視（11.6 は PMBOK6 で新設）',
          '__二次リスク vs 残存リスク__: 新発生 vs 元リスクの残り',
          '__定性的 vs 定量的__: すべてのリスク（定性） vs 重要リスクのみ数値化（定量）',
          '__EMV の符号__: 脅威=マイナス、機会=プラス',
          '__リスク登録簿 vs リスク・レポート__: 個別詳細 vs 全体俯瞰',
          '__リスク選好 vs 許容度 vs スレッショルド__: 戦略→範囲→具体的数値の階層',
          '__確率 vs 影響度__: 確率は発生可能性、影響度は発生時の大きさ',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==パフォーマンス領域==（リスク含む不確かさ）',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '14. 午後Ⅰの定石（リスクマネジメント）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのリスク系設問は「リスクの見つけ方」と「対応の設計理由」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 制約と新規性がリスクの源__: 必達期限・固定予算・限られた要員・==初めての技術や業務==からリスクを洗い出す（R1問1・H29問1・H25問2）',
          '__2. 特定したリスクは対応とセットで計画__: 洗い出しで終わらせず、==対応策・担当者・発動条件==まで決めて計画に織り込む（R1問1・H28問1）',
          '__3. しきい値で扱いを分ける__: 発生確率・影響度を評価し、==しきい値==で「現場対応／上位へエスカレーション」を機械的に振り分ける（R6問3・R3問1）',
          '__4. 予兆は隠さず共同管理__: 遅延・品質低下の==予兆段階での共有==が最速の対処を生む。請負相手でも予兆情報は共有させる（R5問2・H28問2・R5問3）',
          '__5. 遅延の事業インパクトで優先度を決める__: リスクの大きさは作業への影響でなく==事業への影響==（機会損失・法令期限）で測る（R1問2）',
          '__6. 新技術・新基盤のリスクは3点セット__: ==要員==（経験者不足）・==品質==・==スケジュール==に波及する。検証と支援体制で抑える（H25問2）',
          '__7. 移行はリハーサルで品質を作り込む__: 本番切替のリスクは==移行リハーサル==・利用者訓練・環境分離で事前に潰す（R1問1）',
          '__8. 予備費は種類と権限で使い分け__: 特定済みリスクには==コンティンジェンシー予備==（PM権限）、想定外には==マネジメント予備==（上位承認）を充てる（R3問3）',
          '__9. キーパーソンの受容性もリスク__: 技術だけでなく==人の抵抗・受容性==をリスクとして特定し、実地確認や巻き込みで対応（H27問2）',
          '__10. 情報セキュリティは具体策で__: 可搬端末の紛失・個人情報の扱いは==具体的な管理策==（暗号化・持出制限・アクセス制御）で答える（H28問1・H26問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】7プロセスの群所属（==計画5・実行1・監視1==）。11.6 対応実行は第6版で新設。',
      '【脅威5戦略】==回避==／==転嫁==／==軽減==／==受容==（能動・受動）／==エスカレーション==。',
      '【機会5戦略】==活用==／==共有==／==強化==／==受容==／==エスカレーション==。対応関係: 回避↔活用・転嫁↔共有・軽減↔強化。',
      '【EMV】==確率 × 影響額==。脅威マイナス・機会プラス。決定木は末端から計算し決定ノードで最大を選ぶ。',
      '【ひっかけ】==二次リスク==（新発生）vs ==残存リスク==（残り）／定性（全リスク）vs 定量（重要リスクのみ）／登録簿（個別詳細）vs レポート（全体俯瞰）。',
    ],
  },

  // ───────────────────────────────────────────
  // 9. 統合・変更管理（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  integration: {
    summary:
      'プロジェクトの全要素を統合し、変更と構成を管理する活動領域。PMBOK第6版では第4章「統合マネジメント」7プロセス（4.1〜4.7）。プロジェクト憲章・統合変更管理（CCB）・構成管理が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. 統合マネジメントの目的',
        items: [
          '==統合マネジメント==: 他の知識エリアの活動を調整・統合し、==トレードオフ==（スコープ・スケジュール・コスト・品質のバランス）を意思決定する。PMの中心的な役割',
        ],
      },
      {
        heading: '2. PMBOK第6版 第4章 7プロセス概観',
        items: [
          '__7プロセスの群分布__: 4.1 憲章（==立上げ==）／4.2 計画書（計画）／4.3 指揮・4.4 知識（実行）／4.5 監視・==4.6 統合変更管理==（監視・コントロール）／4.7 終結（終結）',
          '統合は10知識エリアで唯一、==5プロセス群すべて==にプロセスを持つ',
        ],
        navyItems: [[{ text: 'プロセス群分布（立上1・計画1・実行2・監視2・終結1）は判別問題で頻出', style: 'navy' }]],
      },
      {
        heading: '3. PMBOK第7版との対応',
        items: [
          '第7版では統合マネジメントは==独立領域として消滅==し、12原則（システム思考等）とパフォーマンス領域に分散。試験は第6版用語（4.1〜4.7）が中心',
        ],
      },
      // ── B. プロジェクト憲章 ──
      {
        heading: '4. 4.1 プロジェクト憲章作成',
        items: [
          'プロジェクトを==正式に認可==し PM を特定する（==立上げプロセス群==）',
          '__主要インプット__: ==ビジネスケース==等のビジネス文書（§6）',
          '__発行者__: ==スポンサー==または上位組織（PMが起草しても==承認はスポンサー==）',
        ],
        navyItems: [[{ text: 'プロジェクト憲章は PM の権限の根拠。スポンサー承認が必須', style: 'navy' }]],
      },
      {
        heading: '5. プロジェクト憲章の構成要素',
        items: [
          '__主要記載項目__: 目的／==測定可能な目標・成功基準==／上位レベルの要求・リスク・予算／マイルストーン／==PMの責任と権限レベル==／スポンサー',
          '__特徴__: ==上位レベル==の記述（詳細は計画書で）。基本的に変更しない文書',
          '試験頻出: 憲章と計画書・スコープ記述書との混同',
        ],
        navyItems: [[{ text: 'プロジェクト憲章 vs 計画書 vs スコープ記述書 の使い分けは午前Ⅱ で頻出', style: 'navy' }]],
      },
      {
        heading: '6. 憲章より前の段階（個別システム化計画とビジネス文書）',
        items: [
          '__プロジェクトは憲章から始まるのではない__。その前に「やる価値があるか」を判断する段階がある',
          '　==ビジネスケース==: 投資を==正当化==する文書（ニーズ・代替案分析・推奨案・費用対効果）',
          '　==個別システム化計画==: IPA が使う語。__1つのシステム化案件について__、目標・便益・マイルストーン・予算・必要資源・体制を__概要レベルで__まとめた計画',
          '　　作るのは主に ==IT ストラテジスト==（ST）で、PM はそれを支援する立場。__PM が単独で作るものではない__点が問われる',
          '　　記述するのは、==便益==（成果物が生む価値）／課題とリスク／影響するステークホルダー／外的要因／運用組織・保守組織との協働の形',
          '　==承認組織==: 個別システム化計画を審査・承認する組織。__組織の戦略と合っているか__を見て可否を判断する',
          '__流れ__: ビジネスニーズ → ビジネスケース／個別システム化計画 → __承認組織の承認__ → ==憲章== → プロジェクト開始',
          'ビジネス文書は__PM以外__（スポンサー・事業部門・ST）が作成し、PM はそれを入力に憲章を起草する',
        ],
        navyItems: [[{ text: 'シラバス 1-1〜1-2 の領域。午後Ⅱ論述では「プロジェクトの目的をどう理解したか」の形で立ち上げ段階が問われる', style: 'navy' }]],
      },
      // ── C. 計画書作成と実行 ──
      {
        heading: '7. 4.2 プロジェクトマネジメント計画書作成（再確認）',
        items: [
          'サブシディアリー計画書とベースラインを統合して全体計画書を作る（詳細は planning §29）。承認時に==ベースライン化==され、以降の変更は 4.6 経由',
        ],
      },
      {
        heading: '8. 4.3 プロジェクト作業の指揮・マネジメント（再確認）',
        items: [
          '計画書の通りに作業を実行し、各知識エリアの実行プロセスを同期させる（詳細は project-work §4）',
        ],
      },
      {
        heading: '9. 4.4 プロジェクト知識のマネジメント（再確認）',
        items: [
          '既存知識の活用と新規知識の創出（詳細は project-work §5、SECIモデルは §20）。教訓は==継続的に==収集する',
        ],
      },
      // ── D. 監視・コントロール ──
      {
        heading: '10. 4.5 プロジェクト作業の監視・コントロール',
        items: [
          '各知識エリアの監視プロセスからの==作業パフォーマンス情報を統合==し、プロジェクト全体の進捗を監視・是正する',
          '__主要アウトプット__: ==作業パフォーマンス報告書==／変更要求',
        ],
      },
      {
        heading: '11. EVM 連携と統合的監視',
        items: [
          '==EVM==は 4.5 の中核技法。スコープ（EV）・コスト（AC）・スケジュール（PV）を==一元評価==できる（詳細は measurement §4-8）',
        ],
      },
      {
        heading: '12. 是正処置・予防処置・欠陥修正',
        items: [
          '__作業のパフォーマンス__が計画から乖離した場合の==3種類の処置==:',
          '　==是正処置==（Corrective Action）: ==過去==に発生した==問題==を==修正==',
          '　　例: 遅延スケジュールの巻き返し・コスト超過対応',
          '　==予防処置==（Preventive Action）: ==将来予測される==問題を==事前に防止==',
          '　　例: リスク対応策の事前実施',
          '　==欠陥修正==（Defect Repair）: ==成果物の不具合==を==修正==',
          '　　例: バグ修正・仕様不適合の改修',
          '__判断軸__:',
          '　時系列: 是正=過去問題、予防=将来問題',
          '　対象: 是正/予防=プロセス、欠陥修正=成果物',
          '__統合変更管理__（4.6）で==変更要求==として扱う',
          '__注意__: 3種類とも==承認==が必要（CCB 経由）',
          '試験頻出: 3処置の==違い==を問う設問',
        ],
        navyItems: [[{ text: '是正処置 vs 予防処置 vs 欠陥修正の区別は午前Ⅱ 頻出', style: 'navy' }]],
      },
      // ── E. 統合変更管理 ──
      {
        heading: '13. 4.6 統合変更管理',
        items: [
          '全変更要求を==一元管理==して影響評価・承認・実装する（==監視・コントロールプロセス群==、実行群と誤答しやすい）',
          '各知識エリアから分散的に発生する変更要求を一元化し、スコープ・スケジュール・コスト・品質への影響を==同時評価==する',
        ],
        navyItems: [[{ text: 'CCB（変更管理委員会）は本プロセスの中核', style: 'navy' }]],
      },
      {
        heading: '14. 変更要求の種類',
        items: [
          '__変更要求の4種類__: ==是正処置==／==予防処置==／==欠陥修正==（§12）／==更新==（文書・計画書）',
          '変更要求書には変更内容・==影響評価==（スコープ・スケジュール・コスト・品質・リスク）・代替案を記載し、==変更ログ==（IPA は ==変更登録簿==）で全変更を追跡',
        ],
      },
      {
        heading: '15. CCB（変更管理委員会）',
        items: [
          '==CCB==（Change Control Board, 変更管理委員会）: 変更要求を審議・==承認/却下・延期==する正式組織',
          '__構成__: スポンサー・PM・主要ステークホルダーの代表（+必要に応じ技術専門家）',
          '__権限レベル__: 重大変更=スポンサー/経営層＋CCB／中規模=CCB／==軽微変更のみ PM 単独==（事前承認の範囲）',
        ],
        navyItems: [[{ text: 'CCB は午前Ⅱ 必出。構成・役割・権限レベルを暗記', style: 'navy' }]],
      },
      {
        heading: '16. 変更影響評価',
        items: [
          '__影響評価の軸__: スコープ・スケジュール・コスト・品質＋リスク・ステークホルダー・契約への影響を==同時に==評価',
          '各知識エリアの専門家が共同で評価し、==定量化==した結果を文書化する',
        ],
      },
      {
        heading: '17. 変更管理ワークフロー',
        items: [
          '__標準ワークフロー__: 起票 → PM の初期スクリーニング（軽微なら単独承認）→ ==影響評価== → ==CCB 審議== → 承認/却下/延期 → 実装 → ==ベースライン更新== → 関係者へ通知 → 変更ログ更新',
          '却下時は要求者へ理由を説明する。変更要求番号でトレーサビリティを確保',
        ],
      },
      // ── F. 構成管理 ──
      {
        heading: '18. 構成項目（CI）と構成管理',
        items: [
          '==構成管理==（Configuration Management）: ==製品==・==プロジェクト情報==の==バージョン==を==管理==',
          '__構成項目__（CI, Configuration Item）: 構成管理の==対象単位==',
          '　例: ==ソフトウェアモジュール==／==設計文書==／==テストスクリプト==／==計画書==',
          '__構成管理の主要活動__:',
          '　==構成項目の識別==: 何を構成項目とするか定義',
          '　==構成項目のコントロール==: 変更承認プロセスを通じてのみ変更',
          '　==構成ステータス会計==: 各構成項目の==現状==を追跡',
          '　==構成監査==: 構成項目が==仕様通り==であることを確認',
          '__バージョン管理__:',
          '　==バージョン番号==（Major.Minor.Patch）',
          '　==リポジトリ==（Git/SVN 等）',
          '　==ブランチ戦略==（master/develop/feature）',
          '__統合変更管理との関係__: 変更管理は==プロセス==、構成管理は==成果物==',
        ],
        navyItems: [[{ text: 'ISO 10007 が国際規格', style: 'navy' }]],
      },
      {
        heading: '19. ベースラインと変更管理',
        items: [
          '==ベースライン==（Baseline）: 計画書・成果物の==承認された参照点==',
          '__3大ベースライン__:',
          '　==スコープ・ベースライン==: プロジェクト・スコープ記述書＋WBS＋WBS辞書',
          '　==スケジュール・ベースライン==: 承認されたスケジュール',
          '　==コスト・ベースライン==: 承認された予算（タイムフェーズ）',
          '__パフォーマンス測定ベースライン__（PMB）: 上記3つの==統合==',
          '__ベースラインの特徴__:',
          '　==凍結==（freeze）: 承認後は変更不可',
          '　==変更==: 統合変更管理プロセスを通じてのみ',
          '　==バージョン==: 変更ごとにバージョン更新',
          '__計画値（Plan）との違い__:',
          '　計画値 = 当初の値',
          '　ベースライン = ==承認された==計画値（変更後は更新される）',
          '__EVM での使用__: PV はベースライン上の値（measurement §4 参照）',
        ],
        navyItems: [[{ text: 'ベースラインの種類と凍結概念は午前Ⅱ 頻出。「変更」と「ベースライン更新」の関係', style: 'navy' }]],
      },
      {
        heading: '20. バージョン管理',
        items: [
          '==バージョン管理==: 文書・成果物の==変更履歴==を追跡する',
          '__セマンティック・バージョニング__: Major（互換性なし）.Minor（後方互換の機能追加）.Patch（バグ修正）',
          '文書は Draft → Review → Approved（v1.0 正式版）の状態遷移で管理',
        ],
      },
      // ── G. プロジェクト終結 ──
      {
        heading: '21. 4.7 プロジェクトまたはフェーズの終結',
        items: [
          '全知識エリアの活動を終結し、教訓・テンプレートを==組織資産へ移転==する（==終結プロセス群==）',
          '__終結する単位は2つある__: プロジェクト全体の終結と、==プロジェクトフェーズ==ごとの終結',
          '　__フェーズ終結を置く理由__: 区切りで成果と教訓を確定させ、__次フェーズへ進むか判断する__ため（フェーズゲート → governance §12）',
          '__終結でやること__:',
          '　==成果物の正式受入==を得る（顧客の署名・検収）。受入なしに終結してはいけない',
          '　==契約終結==: 未決のクレーム・支払いを片付ける',
          '　==完了報告書==（終結報告書）: 目標の達成度・実績と計画の差異・残課題をまとめる',
          '　==教訓登録簿==の最終化と組織リポジトリへの移転（project-work §10）',
          '　資源の解放とチームの解散、文書のアーカイブ',
          '__中止の場合も終結プロセスを通す__。「途中でやめた」まま放置せず、理由と到達点を記録して資産化する',
        ],
        navyItems: [[{ text: 'シラバス 5-1「プロジェクトフェーズ又はプロジェクトの終結」。フェーズ単位でも終結手続きを踏む点が問われる', style: 'navy' }]],
      },
      {
        heading: '22. 文書化と教訓の活用',
        items: [
          '終結時は==教訓登録簿の最終化==・最終報告書・アーカイブ・契約終結を行う',
          '教訓は組織リポジトリ・テンプレート・プロセス改善に反映して次に活かす（project-work §21）',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '23. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__PMBOK6 第4章 7プロセス__: 4.1〜4.7 のプロセス群所属（立上1・計画1・実行2・監視2・終結1）',
          '__4.6 統合変更管理__・==CCB==の構成と役割',
          '__プロジェクト憲章__: 主要記載項目・スポンサー承認',
          '__計画書 vs 憲章 vs スコープ記述書__: 役割の違い',
          '__変更要求__の3種類: ==是正処置==／==予防処置==／==欠陥修正==',
          '__構成管理__: ==構成項目==（CI）と==バージョン管理==',
          '__ベースライン__: 3大ベースライン（スコープ・スケジュール・コスト）と凍結',
          '__プロジェクト終結__: 教訓登録簿の最終化',
          '__統合的監視__: 各知識エリアの作業パフォーマンス情報を統合（4.5）',
          '__プロジェクト知識マネジメント__: 暗黙知 vs 形式知（SECI モデル）',
          '__作業パフォーマンス3階層__: データ → 情報 → 報告書（project-work §17 参照）',
        ],
      },
      {
        heading: '24. ひっかけパターン',
        items: [
          '__プロジェクト憲章 vs 計画書__: 憲章=立上げで作成・上位レベル／計画書=計画で詳細化',
          '__プロジェクト憲章 vs スコープ記述書__: 憲章=PM の権限の根拠／スコープ記述書=境界の詳細',
          '__是正処置 vs 予防処置 vs 欠陥修正__: 時系列（過去/将来）と対象（プロセス/成果物）',
          '__変更管理 vs 構成管理__: 変更管理はプロセス／構成管理は成果物のバージョン',
          '__CCB__: スポンサー・PM・主要ステークホルダーで構成、PM 単独では却下不可',
          '__ベースライン__: 凍結後は==統合変更管理==経由でのみ更新',
          '__4.4 知識マネジメント__: PMBOK第6版で==新設==（旧第5版なし）',
          '__4.6 統合変更管理__: 監視・コントロールプロセス群（実行ではない）',
          '__プロセス群分布__: 統合は==5プロセス群すべて==にプロセス保有（唯一）',
          '__PMBOK7 では独立領域消滅__: 概念は12原則・8パフォーマンス領域に分散',
          '__計画値 vs ベースライン__: 計画値=当初／ベースライン=承認済み（変更後は更新）',
          '__PMBOK6 vs PMBOK7__: 第6版は==プロセス・ITTO==、第7版は==原則・パフォーマンス領域==',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '25. 午後Ⅰの定石（変更管理・統合）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの変更管理系設問は「変更・課題の統制の仕組み」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 後から来る要求は変更管理で統制__: 無秩序に取り込むと計画が崩れる。==判定・付議・承認の手続き==と「誰がどこまで決めるか」を明確にする（R6問3・R3問2）',
          '__2. 変更は影響波及まで確認__: 一箇所の変更が関連機能・他ベンダー・文書へ==波及する範囲==を洗い出してから承認する（R3問3・H27問3）',
          '__3. 追加開発は構成管理で迷子を防ぐ__: 取込んだ変更は==構成管理==で管理し、設計書を最新に保つ（H27問3・H29問3・R6問2）',
          '__4. 環境変化はスコープ起点で見直す__: 合併・制度変更が起きたら、まず==スコープへの影響==を判断し、スケジュール・コストへ展開する（H25問3）',
          '__5. 課題は「場の設計」で早期に決める__: 課題は放置するほど遅延の火種になる。==誰がいつどこで決めるか==（会議体・エスカレーション先）を仕組み化する（R6問2・H28問3）',
          '__6. 未決事項は一覧で追跡__: ==課題管理表・未決事項一覧==で担当・期限を管理し、進捗会議でフォローする（H28問3）',
          '__7. 成果物は一元管理__: 課やベンダーを越えて参照できる==共通の管理基盤==に成果物を集約する（R6問2）',
          '__8. 憲章で経営の承認と体制を固める__: 立上げ時に==プロジェクト憲章==で目的・権限・体制の承認を得ることが、後の協力要請の土台になる（R2問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】第4章のプロセス群分布: 立上1（4.1）・計画1（4.2）・実行2（4.3/4.4）・監視2（4.5/4.6）・終結1（4.7）。==5群すべて==に保有は統合のみ。',
      '【プロジェクト憲章】PM の==権限の根拠==・上位レベル記述・==スポンサー承認==。計画書・スコープ記述書との区別。',
      '【統合変更管理】==CCB==で審議・承認。変更要求は==是正/予防/欠陥修正/更新==の4種類。4.6 は==監視・コントロール群==（実行ではない）。',
      '【是正/予防/欠陥修正】是正=過去問題、予防=将来問題、欠陥修正=成果物の不具合。',
      '【ひっかけ】変更管理（プロセス）vs 構成管理（成果物）／計画値（当初）vs ベースライン（承認済み・変更後は更新）。',
    ],
  },

  // ───────────────────────────────────────────
  // 10. ガバナンス・組織論（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  governance: {
    summary:
      'プロジェクトを組織の戦略と整合させ、意思決定と権限の枠組みを提供する活動領域。ポートフォリオ／プログラム／プロジェクトの3階層、PMO、ステアリングコミッティ、COBIT・JIS Q 38500、プロジェクト監査が試験頻出。',
    sections: [
      // ── A. 領域概観 ──
      {
        heading: '1. ガバナンスとマネジメントの違い',
        items: [
          '__この2つは別の仕事__。ここが出題の起点になる',
          '　==プロジェクト・ガバナンス==: __正しい方向へ進んでいるかを監督する__枠組み。意思決定・報告・監督のルールを定める',
          '　__マネジメント__: __計画どおりに動かす__実行の仕事',
          '　__見分け方__: 「予定どおり進んでいるか」を見るのがマネジメント、__「そもそもこれを続けてよいか」__を見るのがガバナンス',
          '　__3層で覚える__: __ガバナンスは枠組み、マネジメントは実行、リーダーシップは人を動かす__',
          '__ガバナンスを構成するもの__:',
          '　__会議体__: ==ステアリングコミッティ==（戦略的な判断 → §5）／CCB（変更の審議）',
          '　__決めごと__: 役割と責任／意思決定プロセス／報告構造／==エスカレーション・プロセス==／監査',
          '　__組織の成熟度・規模・リスクに応じてテーラリングする__。小規模案件に重い統制を課すと現場が動けなくなる',
          '__PMBOK第7版での扱い__: ガバナンスは独立した領域ではなく __12原則__ の中で分散して扱われる',
          '　関連する原則は ==スチュワードシップ==（受託者として責任をもって管理する姿勢）／==価値==／==システム思考==（全体最適）',
        ],
        navyItems: [[{ text: '「実行 vs 監督」がガバナンス問題の判別軸。PMO・会議体・監査はすべて監督側の仕組み', style: 'navy' }]],
      },
      // ── B. 階層構造 ──
      {
        heading: '2. ポートフォリオ・プログラム・プロジェクトの3階層',
        items: [
          '__3つは「何を目的にしているか」が違う__。ここだけ押さえれば選択肢を切れる',
          '　==ポートフォリオ==: プロジェクトとプログラムの__集合__。目的は ==価値最大化== と ==戦略整合==',
          '　　__やるか・やめるかを決める層__。投資の配分、優先順位づけ、中止の判断を担う',
          '　==プログラム==: ==相互に関連する==複数プロジェクトの統合管理。目的は ==便益実現==',
          '　　__単独のプロジェクトでは得られない便益__を生むために束ねる、というのが定義の核心',
          '　　例: 基幹システム刷新・業務プロセス改革・人材育成を束ねて「DX推進プログラム」にする',
          '　==プロジェクト==: 有期の取り組み。目的は ==成果物のデリバリー==',
          '__プログラムとプロジェクトの違い__:',
          '　プログラムの成果は__便益__。__途中で変わることを前提__に管理する',
          '　プロジェクトの成果は__成果物__。__確定させて引き渡す__',
          '　だからプログラムは「便益が出なくなったら中止」もあり得るが、プロジェクトは合意した成果物を作り切るのが基本',
        ],
        navyItems: [[{ text: '「単独では得られない便益のために束ねる」がプログラムの定義。単に複数プロジェクトを並べただけではプログラムではない', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '上の層ほど「やるかどうか」、下の層ほど「どう作るか」',
            ariaLabel: 'ポートフォリオがプログラムとプロジェクトを含み、プログラムがプロジェクトを含む3階層と、それぞれの目的を示す図',
            viewBox: '0 0 400 316',
            content: `
              <rect x="10" y="14" width="380" height="290" rx="12" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2" />
              <text x="26" y="40" fill="#6d28d9" font-size="16" font-weight="700">ポートフォリオ</text>
              <text x="26" y="60" fill="#475569" font-size="12.5">目的: 価値最大化・戦略整合／やるか・やめるかを決める</text>

              <rect x="26" y="74" width="348" height="152" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
              <text x="42" y="100" fill="#1d4ed8" font-size="15" font-weight="700">プログラム</text>
              <text x="42" y="120" fill="#475569" font-size="12.5">目的: 便益実現／単独では得られない価値のため束ねる</text>

              <rect x="42" y="134" width="150" height="76" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="2" />
              <text x="117" y="160" fill="#15803d" font-size="13.5" font-weight="700" text-anchor="middle">プロジェクト</text>
              <text x="117" y="180" fill="#475569" font-size="12" text-anchor="middle">成果物を</text>
              <text x="117" y="198" fill="#475569" font-size="12" text-anchor="middle">作って引き渡す</text>

              <rect x="208" y="134" width="150" height="76" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="2" />
              <text x="283" y="160" fill="#15803d" font-size="13.5" font-weight="700" text-anchor="middle">プロジェクト</text>
              <text x="283" y="180" fill="#475569" font-size="12" text-anchor="middle">成果物を</text>
              <text x="283" y="198" fill="#475569" font-size="12" text-anchor="middle">作って引き渡す</text>

              <rect x="26" y="238" width="348" height="52" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="2" />
              <text x="200" y="260" fill="#15803d" font-size="13.5" font-weight="700" text-anchor="middle">単独のプロジェクト</text>
              <text x="200" y="280" fill="#475569" font-size="12" text-anchor="middle">プログラムに属さないものもポートフォリオに入る</text>
            `,
          },
        ],
      },
      {
        heading: '3. 戦略との整合と組織の成熟度（OPM / OPM3）',
        items: [
          '==戦略整合==: プロジェクトが組織の戦略と噛み合っている状態',
          '　__繋がりの階層__: ビジョン → 戦略目標 → ポートフォリオ → プログラム → プロジェクト',
          '　__整合を保つ仕組みは2つ__: ==ビジネスケース==（始める時の投資判断）と ==フェーズゲート・レビュー==（続けてよいかの継続確認 → §6）',
          '　__戦略が変わったら中止・再定義も選択肢__。「始めたから完遂する」が目的化するのが最悪の形',
          '==OPM==（組織のプロジェクトマネジメント）: ポートフォリオ・プログラム・プロジェクトを束ねて、==戦略から実行までの一貫性==を確保する枠組み',
          '__組織の成熟度は5段階で測る__（==OPM3==・Kerzner PMMM などに共通）:',
          '　アドホック（場当たり）→ 反復可能 → ==定義済み==（標準化されている）→ ==管理==（測定している）→ ==最適化==（継続的に改善している）',
          '　__標準化と測定の順序__に注意。標準を定めてから測る、が順番',
          '==デジタルガバナンスコード==: 経済産業省が示す DX 推進の指針。__ビジョン・ビジネスモデル／戦略／成果と重要な成果指標／ガバナンスシステム__の柱からなる',
          '　立ち上げ時に個別システム化計画（integration §6）がこの指針と整合しているかを見る、という文脈で問われる',
        ],
        navyItems: [[{ text: '成熟度5段階は「アドホック → 反復可能 → 定義済み → 管理 → 最適化」。順序がそのまま選択肢になる', style: 'navy' }]],
      },
      // ── C. PMO 詳細 ──
      {
        heading: '4. PMO（3類型とサービス）',
        items: [
          '==PMO==: プロジェクトを__横断して__標準化・支援・統制を担う組織。__個々のプロジェクトの上に立つのではなく、横串を通す役回り__',
          '__3類型はコントロールの強さで分かれる__。__どこまで口を出すか__が違うだけで、目的は同じ',
          '　==支援型==（コントロール度 __低__）: テンプレートやベストプラクティスを__提供する__。使うかどうかは各PMの裁量で、__強制力はない__',
          '　==コントロール型==（__中__）: フレームワークの適用を__求め__、==準拠状況を監査==する',
          '　==指揮型==（__高__）: プロジェクトを__直接管理__する。PM 自身が PMO に所属する形',
          '　__選び方__: 組織が未成熟で標準が浸透していないほど強い型が要るが、__強くするほど現場の自律性は下がる__',
          '__PMO が提供するもの__:',
          '　方法論と標準テンプレートの策定／トレーニング／プロジェクトの支援と監督',
          '　==教訓リポジトリ==など__組織の知識の蓄積__（project-work §10）',
          '　==組織横断的なリソース配分==とポートフォリオ管理',
          '　__横断しているから見える価値__: 個々のPMには見えない「案件間の要員の取り合い」「同じ失敗の繰り返し」を発見できる',
        ],
        navyItems: [[{ text: '午後Ⅰでは「PMO を置く理由」が問われる。答えは横断的な標準化・調整・統制で、チームの上位組織を作ることではない', style: 'navy' }]],
      },
      // ── D. ガバナンス・ボディと意思決定 ──
      {
        heading: '5. ステアリングコミッティと意思決定の階層',
        items: [
          '==ステアリングコミッティ==（運営委員会）: プロジェクトの ==上位意思決定機関==。__PM の権限を超える判断__をする場',
          '　__決めること__: プロジェクト方針／==フェーズゲート==の Go/No-Go 判定／==重要な変更要求==の承認／重大リスク・重大問題への対応',
          '　__構成__: ==スポンサー==（議長）／経営層の代表／主要な部門長／__PM は報告役__で議決権を持たない',
          '　　__PM に議決権がない__のが要点。PM が自分の案を自分で承認できてしまうと監督にならない',
          '　__開催__: 通常は月次。フェーズゲートや重大問題の発生時は臨時招集する',
          '__CCB との違い__: ステアリングコミッティは __戦略的な判断__、==CCB== は __変更管理に特化__',
          '　「この変更を認めるか」は CCB、「このプロジェクトを続けるか」はステアリングコミッティ',
          '__意思決定の階層__（どこまでを誰が決めるか）:',
          '　__経営層・ポートフォリオ委員会__: 投資配分・案件の選定と中止',
          '　__ステアリングコミッティ__: フェーズゲート判定・重大な変更',
          '　__PM・CCB__: 日常運営・通常の変更',
          '__エスカレーションの経路__: PM → ステアリングコミッティ → ポートフォリオ委員会 → 経営層',
          '　__権限と責任は憲章などで先に明文化する__。決める場が決まっていないと、判断が止まる（→ §12 定石3）',
        ],
        navyItems: [[{ text: '午後Ⅰでは「決めたいことに対して決定権限のある人が出る会議体になっているか」が論点になる', style: 'navy' }]],
      },
      {
        heading: '6. フェーズゲート（段階的コミット）',
        items: [
          '==フェーズゲート==（==Stage Gate==）: フェーズの区切りに置く ==Go/No-Go の判定ポイント==',
          '__なぜ置くのか__: 一度に全額を投じず、__区切りごとに投資を判断し直す__ため（==段階的コミット==）',
          '　__途中でやめる選択肢を残す__のが最大の目的。ここが無いと、価値を失った案件が惰性で続く',
          '　あわせて、戦略との整合を確認し、リスクを早い段階で見つける',
          '__何を見て判定するか__: 成果物の品質と受入状況／予実の比較／リスクの状況／==ビジネスケースの妥当性==',
          '　__ビジネスケースの再確認が肝__。市場や戦略が変わっていれば、計画どおり進んでいても中止が正解になる',
          '__判定結果は Go / No-Go だけではない__:',
          '　==Go==（次へ進む）／==No-Go==（中止）／==Hold==（条件付きで保留・再判定）／==Recycle==（前フェーズへ差し戻し）',
          '　__Hold と Recycle があること__がひっかけとして問われる',
        ],
        navyItems: [[{ text: 'Cooper の Stage-Gate プロセスが起源。判定結果が2択だと思い込むと選択肢を落とす', style: 'navy' }]],
      },
      // ── E. IT ガバナンスと標準 ──
      {
        heading: '7. IT ガバナンスの標準（JIS Q 38500・COBIT・ISO/IEC 27001）',
        items: [
          // 赤字密度メモ: JIS Q 38500 の6原則・3タスクがそのまま解答語のため 13 個許容（方針書 §7）
          '==JIS Q 38500==（==ISO/IEC 38500==）: 組織の __IT ガバナンス__ に関する国際規格',
          '　__誰のための規格か__: ==経営層== が IT の現在と将来の利用を判断するための指針。__情報システム部門の実務手順書ではない__',
          '　__3つのタスク__（経営層が回すサイクル）: ==評価==（現状と将来を評価）→ ==指示==（計画と方針を示す）→ ==モニター==（実績と適合を監視）',
          '　__6つの原則__:',
          '　　==責任==: IT の責任を明確に割り当てる',
          '　　==戦略==: IT 戦略を事業戦略に合わせる',
          '　　==取得==: IT の取得を適切に評価して決める',
          '　　==パフォーマンス==: 事業要件を満たす水準を保つ',
          '　　==適合==: 法令・規制を守る',
          '　　==人間行動==: __人への影響を尊重する__',
          '　　__「人間行動」が6原則に入っている__のがひっかけ。技術と手続きだけの規格ではない',
          '==COBIT==: IT ガバナンスと IT マネジメントの実装フレームワーク（==ISACA== が提供）',
          '　__JIS Q 38500 との関係__: 規格が__「何を満たすべきか」__、COBIT が__「どう実装するか」__。COBIT は JIS Q 38500 の実装手段',
          '　__ITIL との違い__: COBIT は __IT ガバナンス全体__、ITIL は __IT サービスの運用__（service-management §1）',
          '==ISO/IEC 27001==: 情報セキュリティマネジメントシステム（==ISMS==）の国際規格。情報資産を ==機密性・完全性・可用性==（CIA）で守る',
          '__関連規格の並び__: ISO 9001（品質）／ISO/IEC 20000（IT サービス）／ISO 31000（リスク）／ISO 21500（プロジェクトマネジメント）',
        ],
        navyItems: [[{ text: 'JIS Q 38500 は「6原則・3タスク（評価・指示・モニター）」がそのまま設問になる。COBIT は実装側、という関係で覚える', style: 'navy' }]],
      },
      // ── F. 倫理・コンプライアンス・監査 ──
      {
        heading: '8. 倫理とコンプライアンス',
        items: [
          '==PMI 倫理規程==（行動規範）の __4つの価値観__: ==責任==・==尊重==・==公正==・==誠実==',
          '　各価値観に2段階がある: ==願望基準==（こうありたいという理想）と ==必須基準==（__違反すると処分対象__になる最低線）',
          '　__この2段階の区別__が問われる。「望ましい」と「守らねばならない」は別',
          '==コンプライアンス==: 法令・規制・業界基準・組織方針を守ること',
          '　__プロジェクトで関わる主な法令__: 労働法規（労働基準法・36協定 → §9 参照の労務管理）／==下請法==／==個人情報保護法==／独占禁止法／著作権法（職務著作）',
          '　　法令の中身は project-work §11 で扱う。ここでは__計画書に明記して統制対象にする__ことが要点',
          '__技術者倫理__: 技術者が専門家として負う責任。試験では次の2つが問われる',
          '　==集団思考==（groupthink）: 結束の強い集団で__反対意見が出にくくなり__、誤った判断が通ってしまう現象',
          '　　「心の警備」（自分たちに都合の悪い情報を遮る）など8つの兆候がある（R6問22・R1問23）',
          '　==ホイッスルブローイング==（内部告発）: 組織の不正を__公益のために外部へ通報する__こと（R3問22）',
          '　　__自己の利益のための暴露とは区別される__。公益性が要件',
        ],
        navyItems: [[{ text: 'PMI 倫理は4価値観と「願望基準 vs 必須基準」。技術者倫理は集団思考とホイッスルブローイングが12年で3回出題', style: 'navy' }]],
      },
      {
        heading: '9. プロジェクト監査',
        items: [
          '==プロジェクト監査==: プロジェクトを __独立した立場から評価する__こと',
          '　__独立性が肝__。当事者が自己点検しても監査にはならない',
          '　__種類__: プロセス監査（手順どおりか）／パフォーマンス監査（成果は出ているか）／コンプライアンス監査（法令や規程を守っているか）',
          '__実施者__: ==内部監査==（社内の独立した監査部門）／==外部監査==（独立した第三者）',
          '__いつ実施するか__: フェーズゲート前・終結時・重大な問題が起きたとき',
          '　==進行中も実施する== のがひっかけ。__終結時だけのものではない__。進行中に見つけるから是正できる',
        ],
        navyItems: [[{ text: '「監査は終結時に行う」は誤り。進行中の実施が是正の機会になる、という理由まで押さえる', style: 'navy' }]],
      },
      // ── G. IPA PM試験 出題傾向 ──
      {
        heading: '10. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__ポートフォリオ／プログラム／プロジェクト 3階層__: 目的の違い（価値最大化／便益／成果物）',
          '__技術者倫理__: ==集団思考==（反対意見が出にくくなる）／==ホイッスルブローイング==（公益のための内部告発）',
          '__労働法規__: ==労働基準法==の36協定・就業規則、労働者派遣（→ §8）',
          '__PMO 3類型__: 支援型／コントロール型／指揮型のコントロール度',
          '__ステアリングコミッティ vs CCB__: 戦略判断 vs 変更管理',
          '__フェーズゲート__: Go/No-Go 判定・段階的コミット',
          '__COBIT__: ==IT ガバナンス==フレームワーク・ISACA 提供',
          '__JIS Q 38500__: 6原則・3タスク（評価・指示・モニター）',
          '__OPM3__: 5段階成熟度モデル',
          '__PMI 倫理規程__: 4価値観（責任・尊重・公正・誠実）',
          '__プロジェクト監査__: 内部監査 vs 外部監査・実施タイミング',
          '__コンプライアンス__: 下請法・個人情報保護法・独占禁止法・著作権法',
        ],
      },
      {
        heading: '11. ひっかけパターン',
        items: [
          '__プロジェクトマネジメント vs ガバナンス__: 実行 vs 監督',
          '__ポートフォリオ vs プログラム vs プロジェクト__: 戦略 vs 便益 vs 成果物',
          '__PMO 3類型__: 支援型（低）・コントロール型（中）・指揮型（高）のコントロール度の混同',
          '__ステアリングコミッティ vs CCB__: 戦略的判断（前者）vs 変更管理（後者）',
          '__フェーズゲート__: Go/No-Go だけでなく Hold/Recycle もある',
          '__COBIT vs ITIL__: COBIT=IT ガバナンス全体、ITIL=IT サービス運用（service-management §15 参照）',
          '__JIS Q 38500__: 6原則のうち「人間行動」が含まれる',
          '__PMI 倫理__: 願望基準 vs 必須基準の区別',
          '__プロジェクト監査__: 進行中も実施（終結時だけではない）',
          '__PMBOK6 vs PMBOK7__: 第6版は分散記述、第7版は12原則「スチュワードシップ」「価値」で扱う',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版＋PMI関連標準を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '12. 午後Ⅰの定石（ガバナンス・組織）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのガバナンス系設問は「組織としての統制・支援の仕組み」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. PMOは横串を通す役回り__: 複数チーム・課を横断して==標準化・調整・統制==を担う。チームの上に立つのではなく横串（R6問2・R1問2・H27問1）',
          '__2. トップのコミットメントを引き出す__: 全社変革は==経営層の関与と目標の柔軟化==がなければ現場が動けない（R4問3・R2問1）',
          '__3. 決める場に決められる人を__: 意思決定には==権限を持つ人が出る会議体==を設計する。ステアリングコミッティと現場会議の使い分け（H30問3）',
          '__4. ガバナンスと安定運用の両立__: 統制を強めるほど俊敏さが落ちる。==リスクに応じた統制の強弱==を設計する（R4問2）',
          '__5. 委託・プロセスの遵守は記録と監査で__: 統制は仕組み（==管理レポート・監査・エビデンス==）で担保する。性善説の丸投げは統制喪失（H25問1・H29問2）',
          '__6. 戦略が変わったら続けない勇気__: フェーズゲートで==ビジネスケースの妥当性==を再確認し、価値を失った計画は変更・中止する（H25問3）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==ポートフォリオ／プログラム／プロジェクト==の3階層と目的の違い（価値最大化／便益／成果物）。',
      '【PMO 3類型】支援型（低）・コントロール型（中）・指揮型（高）のコントロール度。',
      '【ステアリングコミッティ】戦略的判断・フェーズゲート判定。==CCB==（変更管理特化）との違いに注意。',
      '【JIS Q 38500】6原則（責任・戦略・取得・パフォーマンス・適合・==人間行動==）と3タスク（評価・指示・モニター）。',
      '【ひっかけ】マネジメント（実行）vs ガバナンス（監督）／監査は進行中も実施／フェーズゲートには Hold/Recycle もある。',
    ],
  },

  // ───────────────────────────────────────────
  // 11. テーラリング・モデル（F2-P1 投入 / PMBOK第6版＋第7版統合）
  // ───────────────────────────────────────────
  'tailoring-models': {
    summary:
      'プロジェクト特性に応じてプロセス・手法・成果物を調整する活動領域。テーラリング判断要素・コンプレクシティモデル（Cynefin・Stacey）・変革モデル（ADKAR・コッターの8段階）が試験頻出。',
    sections: [
      // ── A. テーラリング概観 ──
      {
        heading: '1. テーラリングの定義と重要性',
        items: [
          '==テーラリング==（Tailoring）: プロジェクト特性に応じてプロセス・手法・成果物を==調整==する活動',
          '__目的__: ==オーバーエンジニアリング==（過剰な管理）と==アンダーマネジメント==（管理不足）の両方を回避',
          'PMBOK第7版では==12原則==の1つに格上げされた中核概念',
        ],
      },
      {
        heading: '2. テーラリングの判断要素',
        items: [
          '__主要判断要素__: ==規模==（大→詳細プロセス）／==複雑性==／==不確実性==（高→適応型）／==チーム経験==（低→詳細ガイダンス）／==規制環境==（厳格→フル文書化）／戦略重要度',
        ],
      },
      {
        heading: '3. PMBOK第7版におけるテーラリングの位置づけ',
        items: [
          '__テーラリングの4ステップ__: 初期アプローチ選択 → ==組織に合わせて調整== → ==プロジェクトに合わせて調整== → 継続的改善',
        ],
      },
      {
        heading: '4. テーラリング・プロセス',
        items: [
          '__実践の流れ__: 状況評価 → 標準を選定（出発点）→ 調整（==追加・削除・修正==）→ パイロットで試行 → 改善',
          'テーラリング理由は計画書に明記し、結果は組織標準（OPAs）へフィードバック',
        ],
      },
      // ── B. PMBOK第7版 主要モデル ──
      {
        heading: '5. PMBOK第7版 主要モデルの概観',
        items: [
          'PMBOK第7版は主要モデルを分類して提示: __状況対応__／__プロセス__／__変革__／__コンプレクシティ__の各モデル群',
          'モデルは現実を単純化した枠組み。==テーラリング==して使う（現実を完全には反映しない）',
        ],
      },
      {
        heading: '6. 状況対応モデル（リーダーシップ・コミュニケーション）',
        items: [
          '__主要モデル__（詳細は各カテゴリ参照）: SL理論・マネジリアル・グリッド（team §8-9）／プッシュ・プル・インタラクティブ（stakeholder §24）／トーマス・キルマン（team §32）',
        ],
      },
      {
        heading: '7. プロセスモデル（PDCA・DMAIC・継続的改善）',
        items: [
          '__使い分け__: ==PDCA==（既存プロセスの改善）／==DMAIC==（データ駆動改善）／==DMADV==（新規設計）／==OODA==（高変動環境での即応）',
        ],
      },
      {
        heading: '8. 変革モデル（ADKAR・コッターの8段階）',
        items: [
          '==ADKAR==（個人の変革の5段階）: ==Awareness==（認識）→ ==Desire==（意欲）→ ==Knowledge==（方法）→ ==Ability==（実行能力）→ ==Reinforcement==（定着）',
          '==コッターの8段階==（組織変革）: ==危機感の醸成==から始まり、推進連合→ビジョン→伝達→エンパワーメント→==短期的成果==→活用→==文化への定着==',
          '大規模システム導入・新業務プロセス導入での抵抗対策に活用する',
        ],
        navyItems: [[{ text: 'ADKAR=個人の変革（5段階）／コッター=組織の変革（8段階）の対比がひっかけ', style: 'navy' }]],
      },
      {
        heading: '9. コンプレクシティモデル（Cynefin・Stacey）',
        items: [
          '==Cynefin フレームワーク==: 状況を==単純==（ベストプラクティス）／==困難==（専門家の分析）／==複雑==（実験・創発）／==混沌==（まず行動）＋無秩序に分類',
          '==Stacey マトリクス==: ==要求×技術の不確実性==の2軸。==複雑==領域が==アジャイル適用==の理論的根拠',
          '示唆: 単純・困難→予測型／複雑→適応型／混沌→危機管理対応',
        ],
        navyItems: [[{ text: 'Cynefin／Stacey はアジャイル適用判断の理論的根拠', style: 'navy' }]],
      },
      // ── C. PMBOK第7版 主要手法 ──
      {
        heading: '10. PMBOK第7版 主要手法の概観',
        items: [
          'PMBOK第7版は主要手法をカテゴリ別に整理（データ収集・分析／見積もり／会議・対人／==曖昧さ管理==）。必要な手法だけを選択して使う',
        ],
      },
      {
        heading: '11. データ収集・分析手法',
        items: [
          '__主要手法__: ブレーンストーミング／インタビュー／==SWOT分析==／根本原因分析（5 Why・特性要因図）／代替案分析／感度分析。詳細は各カテゴリ参照',
        ],
      },
      {
        heading: '12. 見積もり手法',
        items: [
          '4大手法（類推／パラメトリック／ボトムアップ／3点）は planning §15 参照',
          '__派生手法__: ==プランニング・ポーカー==（相対見積もり）／==ワイドバンド・デルファイ==（専門家の独立見積もりを収束）／==ファンクションポイント法==（機能規模測定）',
        ],
      },
      {
        heading: '13. 会議・対人手法',
        items: [
          '__主要会議体__: キックオフ／デイリースタンドアップ／ステアリングコミッティ／==レトロスペクティブ==（振り返り・改善）',
          '__対人手法__: ==ファシリテーション==／アクティブ・リスニング／コーチング・メンタリング／交渉',
        ],
      },
      {
        heading: '14. 曖昧さ管理手法',
        items: [
          '__主要手法__: ==プロトタイピング==（早期検証）／==実験==（仮説検証）／==スパイク==（技術検証）／==MVP==（最小実用製品）／段階的詳細化',
          '短い反復で学習し==早期失敗==（Fail Fast）を促す。予測型でもパイロットとして活用可能',
        ],
        navyItems: [[{ text: 'PMBOK第7版で「曖昧さ管理」が体系化。VUCA 時代の必須スキル', style: 'navy' }]],
      },
      // ── D. PMBOK第7版 主要成果物 ──
      {
        heading: '15. PMBOK第7版 主要成果物の概観',
        items: [
          '成果物を戦略文書／計画書／報告書／監査・終結文書に分類。必要な成果物だけ選択して==過剰な文書化を回避==する',
        ],
      },
      {
        heading: '16. 戦略文書（憲章・ビジネスケース）',
        items: [
          '==ビジネスケース==（投資の正当化）と==プロジェクト憲章==が代表。詳細は integration §4-6',
        ],
      },
      {
        heading: '17. 計画書・管理計画書',
        items: [
          'PM計画書 = 3ベースライン＋10サブシディアリー計画書＋補助計画書。詳細は planning §2・integration §7',
        ],
      },
      {
        heading: '18. 報告書・監査・終結文書',
        items: [
          '報告書4種（project-work §18）／教訓登録簿（project-work §21）／最終報告書。結果は==OPAs へフィードバック==',
        ],
      },
      // ── E. テーラリングの実践 ──
      {
        heading: '19. テーラリング判断ワークシート',
        items: [
          '==テーラリング判断ワークシート==: 判断要素（規模・複雑性・不確実性・経験・規制）を低中高で評価し==推奨アプローチ==を導出するツール',
          '使用タイミング: プロジェクト開始時・フェーズゲート・重大変更時',
        ],
      },
      {
        heading: '20. アジャイル vs ウォーターフォール テーラリング',
        items: [
          '__判断のヒント__: ==規制厳格==→予測型寄り／==顧客フィードバック要・スコープ不確実==→適応型寄り／チーム経験少→予測型から==段階移行==',
          '実態として==ハイブリッドが最多==（パターンは development-approach §27 参照）',
          '__成功要因__: 組織変革管理の伴走・経験者（コーチ）の配置・継続的改善の文化',
        ],
        navyItems: [[{ text: 'development-approach §27 ハイブリッド・アプローチも併読推奨', style: 'navy' }]],
      },
      // ── F. IPA PM試験 出題傾向 ──
      {
        heading: '21. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__テーラリングの定義__・PMBOK7 における重要性',
          '__判断要素__: 規模・複雑性・不確実性・チーム経験・規制',
          '__Cynefin__: 4領域（単純・困難・複雑・混沌）+ 無秩序',
          '__Stacey マトリクス__: 要求×技術の不確実性4領域',
          '__PDCA / DMAIC / DMADV__: 改善モデルの違い',
          '__ADKAR__: 5段階（Awareness/Desire/Knowledge/Ability/Reinforcement）',
          '__コッターの8段階__: 危機感→連合→ビジョン→伝達→エンパワー→短期成果→活用→定着',
          '__見積もり手法__: 類推/パラメトリック/ボトムアップ/3点（PERT 含む）',
          '__曖昧さ管理__: プロトタイピング・実験・スパイク・MVP',
          '__ハイブリッド・アプローチ__: フェーズ別・成果物別・段階移行',
        ],
      },
      {
        heading: '22. ひっかけパターン',
        items: [
          '__テーラリング vs カスタマイズ__: 意図的な調整 vs 個別対応（同義に近いが文脈で区別）',
          '__Cynefin の領域__: 単純（Clear）・困難（Complicated）・複雑（Complex）・混沌（Chaotic）の混同',
          '__PDCA vs DMAIC vs DMADV__: 用途の違い（改善 vs データ駆動改善 vs 新規設計）',
          '__ADKAR vs コッター__: 個人の変革（5段階）vs 組織の変革（8段階）',
          '__モデル vs 手法 vs 成果物__: PMBOK7 の3分類の区別',
          '__段階的詳細化 vs ローリングウェーブ__: 同義に近いが、後者は==計画の粒度==に焦点',
          '__スパイク vs プロトタイピング__: スパイク=アジャイルの技術検証スプリント',
          '__MVP vs プロトタイプ__: MVP=実用最小版（リリース可能）、プロトタイプ=検証用（リリース不可）',
          '__PMBOK6 vs PMBOK7__: 第6版は付録 X1 + 章末、第7版は==独立セクション==で体系化',
          '__テーラリング判断__: ==オーバーエンジニアリング==と==アンダーマネジメント==の両方を回避',
        ],
        navyItems: [[{ text: '本ノートは PMBOK第6版＋第7版を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '23. 午後Ⅰの定石（テーラリング）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰのテーラリング系設問（R5以降増加）は「なぜその修整をしたか」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 標準は修整して使う__: 組織標準をそのまま強制せず、==案件特性に合わせて修整==する。足りない要素を補い余分を削る（R6問3・R3問2）',
          '__2. 揃える所と任せる所を見極める__: 全部統一でも全部自由でもなく、==共通化する部分==（成果物管理・報告）と==チーム裁量の部分==を分ける（R6問2）',
          '__3. 混ぜて使うのが実務__: 予測型標準に==適応型の要素==（反復・頻繁な確認）を織り込むハイブリッドが現実解（R6問3・R5問3）',
          '__4. 手段と目的を切り分ける__: 標準・手法は目的でなく手段。==目的に照らして==採否を判断する（H27問2）',
          '__5. 重要度に応じてメリハリ__: 全てに同じ厳格さを求めず、==重要度の高い所に管理を厚く==する（パレート的発想）（H25問4）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要・テーラリング】PMBOK第7版で==12原則==の1つに格上げ。判断要素（規模・複雑性・不確実性・チーム経験・規制）を暗記。',
      '【Cynefin】==単純==（ベストプラクティス）・==困難==（専門家）・==複雑==（実験）・==混沌==（まず行動）。アジャイル適用は複雑領域。',
      '【変革モデル】==ADKAR==（個人の5段階）／==コッター==（組織の8段階）の対比。',
      '【曖昧さ管理】プロトタイピング・実験・==スパイク==・==MVP==（リリース可能な最小実用製品、プロトタイプとの違いに注意）。',
      '【ひっかけ】PDCA（改善）vs DMAIC（データ駆動改善）vs DMADV（新規設計）／Stacey の==複雑==領域がアジャイル適用の根拠。',
    ],
  },

  // ───────────────────────────────────────────
  // 12. サービスマネジメント（F2-P1 投入 / ITIL + ISO/IEC 20000 + IPA法務）
  // ───────────────────────────────────────────
  'service-management': {
    summary:
      'IT サービスの提供・運用・継続的改善を扱う活動領域。ITIL・ISO/IEC 20000・SLA/OLA/UC・インシデント vs 問題管理・システム監査・関連法令が試験頻出。プロジェクト完了後の運用引継ぎで PM が関わる。',
    sections: [
      // ── A. 全体像 ──
      {
        heading: '1. サービスマネジメントとは（ITIL と ISO/IEC 20000）',
        items: [
          '__プロジェクトとサービスの違いは「終わりがあるか」__。この対比が出題の起点になる',
          '　__プロジェクト__: __有期__。決めた成果物を作って終わる',
          '　==サービスマネジメント==: __継続的__。サービスの形で顧客に価値を提供し続ける組織の能力（ITIL の定義）',
          '　__PM がここに関わる場面__: 作ったシステムを運用へ引き渡すとき（→ §8）。引継ぎの設計を誤ると稼働後に破綻する',
          '__2つの標準を混同しない__:',
          '　==ITIL==: __どう実施するか__ のベストプラクティス集。デファクトスタンダードで、認証の対象ではない',
          '　==ISO/IEC 20000==（JIS Q 20000）: __何を満たすべきか__ の要件規格。==組織単位で認証== を受けられる（R6秋期 問18）',
          '　__覚え方__: ITIL は「やり方の手本」、ISO/IEC 20000 は「合格ライン」',
          '__ITIL の版__: ==v3==（2007）はライフサイクル5フェーズ、==ITIL 4==（2019）はバリューシステム中心に再構築',
          '　情報処理試験は __v3 の用語が中心__。v4 の概念も近年出題される（→ §3）',
        ],
        navyItems: [[{ text: '「ITIL は認証されない／ISO/IEC 20000 は組織が認証を受ける」の区別が問われる', style: 'navy' }]],
      },
      // ── B. ITIL v3 ライフサイクル ──
      {
        heading: '2. ITIL v3 のライフサイクル5フェーズ',
        items: [
          // 赤字密度メモ: 5フェーズ名がそのまま解答語のため 9 個許容（方針書 §7）
          '__5つのフェーズが順に回る__。各フェーズの「何のためにあるか」で覚える',
          '　==サービス戦略==: __何を提供するか__を決める。顧客ニーズと市場機会が入力。ライフサイクルの出発点',
          '　　成果物は ==サービスポートフォリオ==（構想中／提供中のカタログ／廃止予定の一覧）',
          '　==サービス設計==: __どう作るか__を設計する。SLA を決めるのもこの段階（→ §4）',
          '　　主なプロセス: サービスレベル管理／可用性管理／キャパシティ管理／IT サービス継続性管理（→ §7）',
          '　==サービス移行==: __本番環境へ移す__。本番への影響を最小化し、戻せる準備をしておくのが目的',
          '　　主なプロセス: 変更管理・構成管理・リリース管理（→ §6）。PM の運用引継ぎ（→ §8）はここに当たる',
          '　==サービス運用==: __日々提供し続ける__。SLA を守り安定させるのが目的',
          '　　==サービスデスク== が利用者との ==単一窓口==（SPOC）。問い合わせも障害連絡もここに集約する',
          '　==CSI==（継続的サービス改善）: ==PDCA== で改善し続ける。他の4フェーズ__すべてに横断的に__かかる',
        ],
        navyItems: [[{ text: '「戦略 → 設計 → 移行 → 運用」が直列、CSI だけが全体に横断してかかる、という形で覚える', style: 'navy' }]],
      },
      // ── C. ITIL 4 ──
      {
        heading: '3. ITIL 4 の考え方（v3 との違い）',
        items: [
          '__v3 と v4 の一番の違いは「順序があるか」__。v3 は直列のライフサイクル、v4 は必要な活動を組み合わせる形',
          '　==SVS==（サービスバリューシステム）: ITIL 4 の全体枠組み。需要・機会を入力に、__関係者が一緒に価値を作る__（価値の共創）',
          '　==SVC==（サービスバリューチェーン）: SVS の中核にある __6つの活動__ ',
          '　　計画／改善／エンゲージ／設計と移行／取得・構築／デリバリーとサポート',
          '　　__v3 と違い決まった順序はない__。案件ごとに必要な活動をつないで使う（この点が v3 との対比で問われる）',
          '　==プラクティス==: v3 の「プロセス」に相当するが、人・技術・パートナーまで含む__より広い概念__',
          '__4側面__（サービスを見る4つの視点）: 組織と人々／情報と技術／パートナーとサプライヤー／バリューストリームとプロセス',
          '__ガイディング原則7つ__のうち試験で拾われやすいのは3つ:',
          '　==価値に注力==（何のためかを見失わない）／==現状から始める==（ゼロから作り直さない）／==シンプルさと実用性==',
          '　残り4つ（イテレーティブに進める・協働と可視化・包括的に考える・最適化と自動化）はアジャイルの考え方と同じ',
        ],
        navyItems: [[{ text: 'v3=ライフサイクル（順序あり）、v4=バリューチェーン（順序なし）。この一点で選択肢を切れる', style: 'navy' }]],
      },
      // ── D. SLA / OLA / UC ──
      {
        heading: '4. SLA / OLA / UC と可用性の計算',
        items: [
          '__3つの合意は「誰と誰の約束か」で分かれる__。顧客への約束を、内部と外部が下から支える構造',
          '　==SLA==（Service Level Agreement）: __顧客__ とサービスプロバイダの合意。__これが守るべき本丸__',
          '　==OLA==（Operational Level Agreement）: プロバイダ __内部__ の部門間の合意',
          '　==UC==（Underpinning Contract）: プロバイダと __外部サプライヤ__ との契約',
          '　__なぜ階層なのか__: 内部（OLA）や外部（UC）の水準が SLA を下回ると、__顧客への約束が構造的に守れない__。SLA を決めたら下位も揃える',
          '__SLA に書く項目__: サービス時間／可用性／応答時間／サポート体制／バックアップと復旧（RPO・RTO → §7）／__違反時の対応__（ペナルティ・サービスクレジット）',
          '__可用性の計算__:（稼働時間 − 停止時間）÷ 稼働時間 × 100%',
          '　==99.9%==（スリーナイン）で __年8.76時間__（月43.2分）まで停止してよい',
          '　==99.99%==（フォーナイン）で __年52.6分__（月4.32分）まで',
          '　__ナインが1つ増えると許容停止は1/10__。この関係を覚えておけば計算が速い',
          '__SLM__（サービスレベル管理）: SLA を作って終わりにせず、__監視 → 報告 → 改善__ を回すプロセス',
          '　流れ: 顧客ニーズ収集 → SLR（要件）を文書化 → SLA 合意 → OLA/UC と整合 → 監視・定期報告 → 改善',
        ],
        navyItems: [[{ text: '「内部か外部か」で SLA/OLA/UC を判別する。可用性は年単位・月単位のどちらで問われても答えられるように', style: 'navy' }]],
      },
      // ── E. ITIL プロセス詳細 ──
      {
        heading: '5. インシデント管理 vs 問題管理',
        items: [
          '__同じ障害でも、見ている時間軸が違う__。片方は「今すぐ直す」、もう片方は「二度と起こさない」',
          '　==インシデント管理==: __とにかく早くサービスを回復する__のが目的。__根本原因は後回しでよい__（暫定対処で復旧させてよい）',
          '　　主担当は__サービスデスク__。指標は ==MTTR==（平均修復時間）で、__短いほど良い__',
          '　==問題管理==: インシデントの ==根本原因== を突き止めて ==再発防止== するのが目的',
          '　　成果物は ==KEDB==（既知エラーデータベース）。指標は ==MTBF==（平均故障間隔）で、__長いほど良い__',
          '__どちらの話か見分ける__: 「復旧を優先した」ならインシデント管理、「原因を分析して恒久対策」なら問題管理',
          '　__両方必要__。復旧だけ続けると同じ障害が繰り返され、原因究明だけでは目の前の利用者が止まったまま',
        ],
        navyItems: [[{ text: 'MTTR は「直す時間」なので短いほど良い、MTBF は「壊れない間隔」なので長いほど良い。逆に覚えると失点する', style: 'navy' }]],
        figures: [
          {
            type: 'svg',
            caption: '早く直すのがインシデント管理、二度と起こさないのが問題管理',
            ariaLabel: 'インシデント管理と問題管理の目的、担当、指標を上下に並べて比較した図',
            viewBox: '0 0 400 300',
            content: `
              <rect x="14" y="14" width="372" height="126" rx="10" fill="#ffffff" stroke="#dc2626" stroke-width="2" />
              <rect x="18" y="24" width="5" height="106" rx="2.5" fill="#dc2626" />
              <text x="34" y="44" fill="#991b1b" font-size="16" font-weight="700">インシデント管理</text>
              <text x="34" y="70" fill="#1e293b" font-size="13.5">目的: とにかく早く回復させる</text>
              <text x="34" y="92" fill="#475569" font-size="13">担当: サービスデスク</text>
              <text x="34" y="114" fill="#475569" font-size="13">指標: MTTR（修復時間）</text>
              <text x="34" y="134" fill="#991b1b" font-size="12.5" font-weight="700">短いほど良い</text>

              <rect x="14" y="156" width="372" height="126" rx="10" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
              <rect x="18" y="166" width="5" height="106" rx="2.5" fill="#2563eb" />
              <text x="34" y="186" fill="#1d4ed8" font-size="16" font-weight="700">問題管理</text>
              <text x="34" y="212" fill="#1e293b" font-size="13.5">目的: 根本原因を絶って再発を防ぐ</text>
              <text x="34" y="234" fill="#475569" font-size="13">成果物: KEDB（既知エラーDB）</text>
              <text x="34" y="256" fill="#475569" font-size="13">指標: MTBF（故障間隔）</text>
              <text x="34" y="276" fill="#1d4ed8" font-size="12.5" font-weight="700">長いほど良い</text>

              <text x="20" y="298" fill="#b45309" font-size="12.5" font-weight="700">復旧だけでは繰り返す。原因究明だけでは今の利用者が止まる</text>
            `,
          },
        ],
      },
      {
        heading: '6. サービス移行の3プロセス（変更管理・構成管理・リリース管理）',
        items: [
          // 赤字密度メモ: 3プロセスと変更3類型がそのまま解答語のため 9 個許容（方針書 §7）
          '本番環境をいじる作業を安全にするための3点セット。__止めないための仕組み__として理解する',
          '　==変更管理==: 変更を計画的に通し、__サービスへの影響を最小化する__。戻せる準備（ロールバック）まで含めて計画する',
          '　　__変更は3類型__。__どれだけ審議に手間をかけるか__で分かれる',
          '　　==標準変更==: __事前に承認済み__の定型作業。都度の審議は不要（パスワードリセット等）',
          '　　==通常変更==: ==CAB==（変更諮問委員会）の審議が必要。大半はこれ',
          '　　==緊急変更==: 障害対応など待てないもの。==ECAB==（緊急CAB）が迅速に承認する',
          '　　流れ: ==RFC==（変更要求）を起票 → 影響評価 → CAB 審議 → 実装 → 事後レビュー',
          '　==構成管理==: 構成項目（CI）の情報を ==CMDB== で一元管理する',
          '　　CI はハードウェア・ソフトウェア・文書・サービスなど。__CI 同士の関係__（依存・包含）も記録するので、__変更の影響範囲を追える__のが本来の価値',
          '　==リリース管理==: 変更をまとめて本番へ展開する（計画 → ビルド・テスト → デプロイ → 検証）',
          '　　__止めずに切り替える手法__: ==ブルー・グリーン==（同等の2環境を用意して切替）／==カナリア・リリース==（一部利用者に先行公開して様子を見る）／ローリング・アップデート（順次入れ替え）',
          '__PMBOK の統合変更管理とは別物__: PMBOK 4.6 は__プロジェクト内__の成果物・計画の変更、ITIL 変更管理は__稼働中サービス__の変更。構成管理も同じ理由で別物',
        ],
        navyItems: [[{ text: '「標準変更は事前承認済みなので CAB を通さない」が頻出。ITIL とPMBOK の変更管理を混同させる選択肢にも注意', style: 'navy' }]],
      },
      {
        heading: '7. キャパシティ・可用性・IT サービス継続性（RPO / RTO）',
        items: [
          '__どれも「止めない」ための管理__だが、備える相手が違う',
          '　==キャパシティ管理==: __処理能力が足りなくなる__ことに備える。事業／サービス／コンポーネントの3レベルで容量を計画する',
          '　==可用性管理==: __壊れて止まる__ことに備える。==可用性 = MTBF ÷ (MTBF + MTTR) × 100%==',
          '　　__信頼性__ は MTBF（壊れにくさ）、__保守性__ は MTTR（直しやすさ）。__どちらを上げても可用性は上がる__',
          '　==ITSCM==（IT サービス継続性管理）: __災害・大規模障害__に備える。==BCP==（事業継続計画）の IT 部分',
          '__ITSCM の2つの目標値は測る軸が違う__。ここが必出',
          '　==RPO==（目標復旧時点）: __どこまでデータが失われてよいか__。障害時点から__過去へ__さかのぼる幅',
          '　　RPO 1時間なら、バックアップは1時間ごとに取る必要がある',
          '　==RTO==（目標復旧時間）: __どれだけ止まってよいか__。障害時点から__未来へ__向かう幅',
          '　　RTO 4時間なら、4時間以内にサービスを戻す体制が要る',
          '__ITSCM の進め方__: リスク評価と ==事業影響度分析==（BIA）→ 継続戦略の選定（ホット／ウォーム／コールドサイト）→ 計画 → __演習__ → 維持',
          '　__演習まで含めて初めて計画__。手順書があっても訓練していなければ本番で動かない',
        ],
        navyItems: [[{ text: 'RPO は「データをどこまで巻き戻すか（過去向き）」、RTO は「いつまでに戻すか（未来向き）」。時間軸の向きで覚える', style: 'navy' }]],
      },
      // ── F. 運用引継ぎ・監査 ──
      {
        heading: '8. 運用引継ぎ（プロジェクト → 運用）',
        items: [
          '==運用引継ぎ==: プロジェクトが作ったものを、運用チームが__回し続けられる状態にして渡す__こと。PM の仕事はリリースで終わらない',
          '　__責任の境目__: プロジェクトは成果物のリリース時点まで、運用はその後の継続運用・保守',
          '__渡すのは「モノ」だけではない__。この3種類が揃って初めて引継ぎが成立する',
          '　__1. モノ__: 成果物本体／==構成情報==（CMDB の更新）／監視・アラートの設定／バックアップと復旧手順',
          '　__2. 決めごと__: ==SLA==・OLA の確立。__どの水準で運用するかを決めずに渡すと__、障害時に責任の押し付け合いになる',
          '　__3. 人__: ==運用要員のトレーニング==。手順書だけ渡しても回らない（→ §13 定石8）',
          '__引継ぎ会議__: プロジェクトチームと運用チームが合同で行い、__成果物受入の正式承認__と、残っている懸念・制約の共有をする',
          '__最も重要な注意__: ==運用要件は計画段階で織り込む==。運用性・保守性は後から付けられない',
          '　「作ってから運用を考える」と、監視できない・直せないシステムが出来上がる',
          '__並行運用期間__を置くのが一般的。新旧を並走させ、問題があれば戻せる状態で慣らす',
        ],
        navyItems: [[{ text: '午後Ⅰでは「運用要員をプロジェクトに参加させたか」「訓練を計画に含めたか」が繰り返し問われる', style: 'navy' }]],
      },
      {
        heading: '9. システム監査',
        items: [
          '==システム監査==: 情報システムの信頼性・安全性・効率性を __独立した立場__ で評価すること',
          '　__独立した立場__というのが肝。運用している当人が自己点検しても監査にはならない',
          '__監査人に求められる3つの独立性__:',
          '　==精神的独立性==: 中立・公正な精神状態を保つ（内面の独立）',
          '　==外観的独立性==: 第三者から見て独立して見えること（見た目の独立）',
          '　==組織的独立性==: 被監査部門から組織上分離していること',
          '__種類__: ==内部監査==（組織内の独立部門が実施）／==外部監査==（監査法人等）／法定監査（J-SOX 等）／任意監査',
          '__2つの基準は役割が違う__（どちらも経済産業省が策定）:',
          '　==システム監査基準==: __監査人が従う__判断尺度・行為規範',
          '　==システム管理基準==: __監査される側__が満たすべき管理のあり方',
          '__実施プロセス__: 監査計画 → 予備調査 → ==本調査==（証拠を入手して評価）→ ==監査報告==（指摘事項と改善提案）→ __フォローアップ__',
          '　__フォローアップまでが監査__。報告して終わりでは改善されたか分からない',
        ],
        navyItems: [[{ text: '「監査基準は監査人向け／管理基準は被監査側向け」の取り違えが頻出。3独立性も名称で問われる', style: 'navy' }]],
      },
      // ── G. 関連法令 ──
      {
        heading: '10. 関連法令（個人情報・セキュリティ・著作権）',
        items: [
          // 赤字密度メモ: 法令名と要件語がそのまま解答語のため 12 個許容（方針書 §7）
          '__個人データを扱う__:',
          '　==個人情報保護法==: 取扱事業者の義務は、__利用目的の通知・公表__／同意の取得／==安全管理措置==／==第三者提供の制限==／本人からの開示・訂正請求への対応',
          '　　==要配慮個人情報==（人種・信条・病歴・犯罪歴など）は、__取得の時点で原則本人同意が必要__。通常の個人情報より一段厳しい',
          '　==GDPR==（EU 一般データ保護規則）: EU 域内の個人データを守る規則。高額な制裁金と ==忘れられる権利== が特徴',
          '__セキュリティ__:',
          '　==サイバーセキュリティ基本法==: 国・地方公共団体・==重要社会基盤事業者==（重要インフラ14分野）の責務を定める',
          '　==不正アクセス禁止法==: ==識別符号==（ID・パスワード）の不正使用に加え、__不正な取得・保管・助長__も禁じる',
          '　　__自分で使わなくても違反__になる点が問われる（他人のIDを集める・教える行為も対象）',
          '__知的財産__:',
          '　==著作権法==: プログラムも著作物。==職務著作== により、業務で作ったプログラムの権利は __法人に帰属__ する',
          '　　保護期間は著作者の __死後70年__',
          '　==営業秘密==（不正競争防止法）: ==秘密管理性==・==有用性==・==非公知性== の __3要件すべて__ を満たして初めて保護される',
          '　　__1つでも欠けると営業秘密ではない__。「秘密として管理していなかった」で保護されない例が多い',
          '__プロジェクトでの実務__: 退職者の情報持出防止、委託先との NDA、OSS ライセンスの遵守が主な論点',
        ],
      },
      // ── H. IPA PM試験 出題傾向 ──
      {
        heading: '11. 過去問頻出論点（午前Ⅱ）',
        items: [
          '__ITIL v3 ライフサイクル__: 5フェーズ（戦略・設計・移行・運用・CSI）',
          '__SLA / OLA / UC__: 階層関係と対象（顧客／内部部門／外部サプライヤ）',
          '__可用性%__: 99.9% / 99.99% から==許容停止時間==の計算',
          '__インシデント vs 問題__: ==サービス回復==（早く）vs ==根本原因==（再発防止）',
          '__MTTR vs MTBF__: 短い vs 長いが良い指標',
          '__変更管理__: 標準/通常/緊急変更・CAB の役割',
          '__CMDB__: 構成項目の中央DB・影響分析・コンプライアンス',
          '__RPO vs RTO__: データ巻き戻し許容 vs サービス停止許容',
          '__ISO/IEC 20000__: SMS 要件規格（R6秋期 問18 出題）',
          '__個人情報保護法__: 取扱事業者の義務・要配慮個人情報',
          '__サイバーセキュリティ基本法__: 重要インフラ事業者の責務',
          '__不正アクセス禁止法__: アクセス制御の不正回避',
          '__システム監査__: 3独立性・4段階プロセス',
        ],
      },
      {
        heading: '12. ひっかけパターン',
        items: [
          '__SLA vs OLA vs UC__: 顧客／内部部門／外部サプライヤ。「内部か外部か」で切る',
          '__インシデント vs 問題__: 早期回復 vs 根本原因解決',
          '__MTTR vs MTBF__: ==MTTR==（修復時間・==短いほど良い==）vs ==MTBF==（故障間隔・==長いほど良い==）',
          '__標準変更 vs 通常変更__: 事前承認済みで CAB を通さない（標準）vs CAB 審議が要る（通常）',
          '__RPO vs RTO__: RPO は__データを過去へ巻き戻す幅__、RTO は__復旧までの未来の時間__',
          '__ITIL vs PMBOK__: 変更管理も構成管理も、ITIL は__稼働中サービス__・PMBOK 4.6 は__プロジェクト内__',
          '__ITIL v3 vs v4__: v3 はライフサイクル（順序あり）、v4 はバリューチェーン（順序なし）',
          '__監査基準 vs 管理基準__: ==システム監査基準==は監査人向け、==システム管理基準==は被監査側向け',
          '__個人情報__: 取扱件数による義務の軽減は==撤廃==済み（少件数でも義務は同じ）',
          '__著作権__: プログラムは==職務著作==で法人帰属',
          '__営業秘密3要件__: 秘密管理性・有用性・非公知性は__すべて必要__（1つでも欠ければ対象外）',
          '__プロジェクトとサービス__: ==有期== vs ==継続==',
        ],
        navyItems: [[{ text: '本ノートは ITIL v3/v4 + ISO/IEC 20000 + 関連法令を統合的に扱う。第8版での位置づけは本ノートの最終セクション参照', style: 'navy' }]],
      },
      {
        heading: '13. 午後Ⅰの定石（移行・運用引継ぎ）',
        items: [
          // 定石集はまとめ系セクションのため赤字密度の上限適用外（方針書 §7）
          '午後Ⅰの移行系設問は「本番切替の安全策」を状況根拠つきで書く。以下を解答の根拠に使う',
          '__1. 移行はリハーサルで品質を作り込む__: ==移行リハーサル==で手順・時間・体制を本番前に検証し、問題を事前に潰す（R1問1）',
          '__2. 利用者の訓練で移行を定着させる__: システムを切り替えても使えなければ移行は失敗。==利用者の訓練・習熟==を移行計画に含める（R1問1・H25問3）',
          '__3. 環境は分離して干渉を避ける__: 移行作業・検証は==本番と分離した環境==で行い、既存業務への影響を避ける（R1問1）',
          '__4. データ移行は品質が要__: ==源泉データの品質==（重複・欠損）を移行前に整理・検証する。移行範囲の最小化も有効（H28問1・H25問2・H30問1）',
          '__5. 並行運用と切り戻しが安全網__: 新旧を==並行運用==して確認し、問題時の==切り戻し（ロールバック）==手順を準備してから切り替える（H26問3・H27問3）',
          '__6. 移行テストの限界を知る__: テスト環境のデータは==本番データの代表性==に限界がある。本番相当データでの検証を検討（H26問3）',
          '__7. 段階的導入と先行準備__: 一斉切替のリスクが高い場合は==拠点・機能単位で段階導入==し、先行準備で立ち上げを軽くする（R2問3）',
          '__8. 運用を見据えた技術移転__: 引継ぎは文書だけでなく、運用要員の==プロジェクト参加・訓練==で内製運用できる状態を作る（R2問1）',
          '__9. SLAと費用はトレードオフ__: 高可用性の要求はコストに直結。==業務影響に見合ったサービスレベル==を設定する（H30問1）',
        ],
        navyItems: [[{ text: '各定石末尾の（）は出題実績。定石名を見て「なぜそうするか」を自答できれば午後Ⅰ対応力が付く', style: 'navy' }]],
      },
    ],
    exam_tips: [
      '【最重要】==SLA==（顧客）／==OLA==（内部）／==UC==（外部サプライヤ）の階層と「内部か外部か」の判別。',
      '【可用性計算】==可用性 = MTBF ÷ (MTBF + MTTR)==。99.9% は年8.76時間の停止許容。',
      '【インシデント vs 問題】==サービス回復==（早期・MTTR）vs ==根本原因解決==（再発防止・MTBF/KEDB）。',
      '【RPO vs RTO】RPO は==データ==の最大許容損失（巻き戻し）／RTO は==サービス==の最大許容停止時間。',
      '【変更管理】標準／通常（==CAB==審議）／緊急の3類型。ITIL 変更管理と PMBOK 統合変更管理は==別物==。',
      '【法令】個人情報保護法（利用目的・同意・安全管理）／==職務著作==は法人帰属／==営業秘密3要件==（秘密管理性・有用性・非公知性）。',
    ],
  },
}

// ─────────────────────────────────────────────
// PMBOK 第8版 統合補足（2026-05-28 追加 / detailed_design.md §2.7e.2 F2-P6 v0.22）
//
// 経緯:
// - 当初設計（〜v0.21）では独立カテゴリ `pmbok8-diff` を新設予定だった
// - 実データ分析（午前II 300問・午後I 37問・午後II 24問）で第8版固有用語は ≒ 0%
// - PMBOK 第8版は 2026-04 日本語版リリース、PMP 試験反映は 2026-07-09
// - IPA 試験要綱は 2022-05 第7版反映のまま、第8版反映の出題は早くても 2027-2028 春期
// - 「闇雲に量を増やす」リスクを避けるため、各カテゴリ末尾に注記セクションのみ追加
//
// 第8版の概要:
// - 6 原則（第7版の 12 原則を統合）: 全体的視点 / 価値焦点 / 品質組込 / 責任あるリーダー /
//   持続可能性 / 自律的文化
// - 7 パフォーマンス領域（第7版の 8 領域を統合・改名）: ガバナンス / ステークホルダー /
//   スコープ（品質含む）/ 資源 / スケジュール / リスク / ファイナンス
// - 第6版の知識エリア体系（スコープ・スケジュール・リスク等）に回帰する統合
//
// 詳細マッピング: docs/pmbok_v7_to_v8_mapping.md
// ─────────────────────────────────────────────
const PMBOK_V8_APPENDIX: Record<string, NoteSection> = {
  stakeholder: {
    heading: '37. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==ステークホルダー==」は引き続き独立した__パフォーマンス領域__として継続（7 領域のひとつ）',
      '新原則「==責任あるリーダーであること==（Be an Accountable Leader）」が追加され、ステークホルダーへの__説明責任__・__信頼関係構築__の観点が原則として明文化',
      '第7版 12 原則の「ステークホルダーと効果的に関与する」「リーダーシップを示す」などが第8版で 6 原則に統合',
      'IPA 試験への影響: 試験要綱は 2022-05 第7版反映のまま、第8版要素の出題は 2027-2028 以降の見込み。本ノートの第6版＋第7版内容を優先して学習',
    ],
    navyItems: [[{ text: '第8版は第7版の原則を 12→6 に統合、領域を 8→7 に統合。試験対策の優先度は第6版・第7版より低い。', style: 'navy' }]],
  },
  team: {
    heading: '39. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版では第7版の「==チーム==」パフォーマンス領域が「==資源==」領域に統合・改名（人的資源・物的資源を包括的に扱う）',
      '新原則「==自律的な文化を築くこと==（Build an Empowered Culture）」が明文化され、チームの__エンパワーメント__・__心理的安全性__・__自律性__が原則レベルに格上げ',
      '第7版の「リーダーシップを示す」「チームの協働環境を作る」などの原則は第8版で 6 原則に統合され、責任あるリーダーシップ + 自律的文化の 2 軸で整理',
      'IPA 試験への影響: 「資源マネジメント」（第6版）と「チーム」（第7版）の用語両方を引き続き学習。第8版の「資源」回帰は第6版と用語が一致し、混乱は少ない',
    ],
    navyItems: [[{ text: '第8版の「資源」領域は第6版の「資源マネジメント」知識エリアに用語回帰。サーバントリーダーシップ・テックマンモデル・RACI 等の試験頻出概念は版変更の影響を受けない。', style: 'navy' }]],
  },
  'development-approach': {
    heading: '34. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域には「==開発アプローチとライフサイクル==」領域が単独で存在せず、__テーラリング__の文脈と原則「==価値に焦点を当てること==」「==全体的な視点を持つこと==」に分散統合',
      '予測型・反復型・適応型・ハイブリッドの選択は__プロジェクト特性に応じたテーラリング決定事項__として扱われ、第7版の領域から第8版の原則レベルへ概念的に格上げ',
      'アジャイル・スクラム・カンバン等の個別手法は引き続き「適応型」の選択肢として記述されており、用語自体に変更なし',
      'IPA 試験への影響: 開発アプローチの選択基準（プロジェクト特性 → 進め方）は第7版から第8版で枠組みが変わるが、出題される__判断基準__自体は普遍。第6版＋第7版の知識でカバー可能',
    ],
    navyItems: [[{ text: '第8版で開発アプローチが領域から外れたのは「全プロジェクトに適用される横断的視点」として原則・テーラリングに昇格したため。試験対策上は影響なし。', style: 'navy' }]],
  },
  planning: {
    heading: '18. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==計画==」パフォーマンス領域は「==スコープ==」「==スケジュール==」「==ファイナンス==」の 3 領域に分割・細分化（__第6版の知識エリア体系に回帰__）',
      '第6版の「==スコープマネジメント==」「==スケジュールマネジメント==」「==コストマネジメント==」知識エリアと第8版の領域名がほぼ一致',
      '計画立案・段階的詳細化・ローリングウェーブ計画法などの基本概念は版を超えて維持。==計画書==＋==ベースライン==の二段構成も継続',
      'IPA 試験への影響: 第6版の用語（スコープ・WBS・スケジュール・ベースライン）が第8版でも領域名として復活するため、本ノートの第6版要素は版を超えて有効',
    ],
    navyItems: [[{ text: '第8版は第6版の知識エリア体系に回帰する統合。計画関連の用語は第6版 → 第8版で命名が一致し、第7版「計画」領域がむしろ過渡的な命名だったと言える。', style: 'navy' }]],
  },
  'project-work': {
    heading: '15. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==プロジェクト作業==」領域は存在せず、調達・コミュニケーション・物理リソース等は__他領域に分散__（資源／ガバナンス／ステークホルダー等）',
      '第7版の「プロジェクト作業」の概念は第8版で領域横断的な__実行・運営要素__として再整理され、原則「全体的な視点」「価値焦点」と組み合わせて理解する位置づけに',
      'IPA 試験への影響: 第6版の「プロジェクト作業」「調達」「コミュニケーション」用語は引き続き出題対象。第7版・第8版の領域構造より__第6版のプロセス分解__を主軸に学習するのが効率的',
    ],
    navyItems: [[{ text: 'プロジェクト作業は版ごとに位置づけが変わる概念。試験対策上は「何を扱うか」（調達・コミュニケーション・物理資源）を押さえればどの版でも対応できる。', style: 'navy' }]],
  },
  delivery: {
    heading: '16. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==デリバリー==」領域は存在せず、デリバリー概念は原則「==価値に焦点を当てること==」「==品質をプロセスと成果物に組み込むこと==」に統合',
      '「品質」は第7版の独立領域から第8版で「==スコープ==」領域に内包（スコープと品質の不可分性を強調）',
      '価値駆動の考え方（ベネフィット重視・継続的デリバリー）は第7版から第8版でさらに原則として強化',
      'IPA 試験への影響: 第6版の「品質マネジメント」知識エリアは引き続き重要。第7版のデリバリー領域・第8版の価値原則・品質統合の流れを並列で押さえる',
    ],
    navyItems: [[{ text: '第8版で「品質はスコープに内包」されたのは「品質基準を満たさなければスコープを完了したとは言えない」という思想の明文化。試験では第6版「品質マネジメント」用語で出題されることが多い。', style: 'navy' }]],
  },
  measurement: {
    heading: '15. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==測定==」パフォーマンス領域は「==ファイナンス==」領域に統合・改名（コスト測定・EVM・ベネフィット測定を一体的に扱う）',
      'EVM（==アーンドバリュー・マネジメント==）、KPI、リードタイム等の測定手法は版を超えて維持。__メトリクス選択__・__ダッシュボード設計__の重要性も継続',
      '新原則「価値に焦点を当てること」と組み合わせ、測定対象は__成果物の量__から__価値・ベネフィットの実現__へシフト',
      'IPA 試験への影響: 第6版の「コストマネジメント」「EVM」「品質指標」は引き続き頻出。第8版「ファイナンス」領域の枠組みは試験未反映のため、第6版＋第7版用語で対応',
    ],
    navyItems: [[{ text: 'EVM の SPI/CPI/SV/CV など計算問題は第6版以来一貫して出題される。第8版で「ファイナンス」領域に統合されても、計算式や解釈は不変。', style: 'navy' }]],
  },
  uncertainty: {
    heading: '15. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で第7版「==不確かさ==（Uncertainty）」パフォーマンス領域は「==リスク==」領域に名称変更・統合（__第6版の「リスクマネジメント」知識エリアに用語回帰__）',
      '「不確かさ」概念は第7版で導入された比較的新しい用語で、第8版では従来の「リスク」に統合（混乱の解消）',
      '機会（Opportunity）と脅威（Threat）の両面を扱うリスクマネジメントの枠組みは第6版から第8版まで一貫',
      'IPA 試験への影響: 第6版「リスクマネジメント」用語と第7版「不確かさ」用語の両方が混在出題される可能性。本ノートでは両方を統合的に記述、第8版の用語回帰は学習者にとってむしろ自然',
    ],
    navyItems: [[{ text: '第7版で「不確かさ」と命名した後、第8版で「リスク」に戻したのは試験対策的に追い風（用語が安定）。第6版の 7 つのリスクマネジメントプロセスは引き続き押さえるべき。', style: 'navy' }]],
  },
  integration: {
    heading: '26. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版 7 領域に「==統合==」領域は存在せず、統合の概念は原則「==全体的な視点を持つこと==（Adopt a Holistic View）」として__原則レベルに格上げ__',
      '第6版の「==統合マネジメント==」知識エリア（プロジェクト憲章・PM 計画書・変更管理）は第8版で領域構造から原則・横断要素へ整理されたが、__扱う対象は同じ__',
      'プロジェクト憲章・PM 計画書・変更管理委員会（CCB）等の試験頻出概念は版を超えて維持',
      'IPA 試験への影響: 統合マネジメントの試験頻度は高い（特に変更管理）。第6版用語で覚えれば第8版の原則理解にも自然につながる',
    ],
    navyItems: [[{ text: '統合は「全体観」という原則に昇格したが、実務的に扱う対象（憲章・PM 計画書・変更管理）は不変。試験では第6版「統合マネジメント」プロセスとして出題される。', style: 'navy' }]],
  },
  governance: {
    heading: '13. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==ガバナンス==」は引き続き独立した__パフォーマンス領域__として継続（7 領域のひとつ）',
      '新原則「==持続可能性をすべてのプロジェクト領域に統合すること==（Integrate Sustainability）」が追加され、ガバナンスに__長期的視点__・__環境/社会的責任__の観点が明文化',
      '組織標準・PMO・コンプライアンス・ステークホルダー説明責任等の従来要素は版を超えて維持',
      'IPA 試験への影響: ガバナンスは試験では PMO の役割・組織標準・統制プロセスとして出題される。持続可能性原則は IPA シラバスに反映前のため、優先度は低い',
    ],
    navyItems: [[{ text: '持続可能性原則は ESG・SDGs の文脈を反映した第8版の特徴。IPA 試験への反映は当面未定だが、近年の DX・サステナビリティ重視の社会潮流とも整合する。', style: 'navy' }]],
  },
  'tailoring-models': {
    heading: '24. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==テーラリング==」は領域から__横断的なプロセス・原則レベル__に格上げ。原則「全体的な視点」「価値焦点」と連動して全プロジェクト適用が前提に',
      '第7版の「==テーラリング==」モデル（プロセス調整の方法論）は第8版でも維持。プロジェクト特性・組織標準・リスクに応じた__選択・調整__の考え方は不変',
      'PMBOK 各版で「テーラリング」の位置づけは段階的に重要性が増しており、第8版で最も中心的概念に',
      'IPA 試験への影響: テーラリングは R5（2023）午後II で出題された比較的新しい概念。第7版＋第8版で扱う範囲は重なるため、本ノートの記述は版を問わず有効',
    ],
    navyItems: [[{ text: 'テーラリング R5 出題以降、IPA 試験で本概念の重要性が増している。第8版で「全体観」「価値」原則と連動する位置づけが明確化したため、学習する意義は高い。', style: 'navy' }]],
  },
  'service-management': {
    heading: '14. PMBOK 第8版での位置づけ（補足）',
    items: [
      '第8版で「==サービスマネジメント==」は PMBOK の領域構造に直接の対応はないが、新原則「==持続可能性==」「==価値焦点==」と「==ファイナンス==」領域がサービス運用の長期視点と整合',
      'ITIL v4 / ISO/IEC 20000 等のサービスマネジメント標準は PMBOK と独立して進化しており、第8版発刊の影響は受けない',
      'IPA 試験への影響: サービスマネジメント関連の出題は ITIL v4 + ISO/IEC 20000 ベースが中心。PMBOK 版次変更の影響はほぼなし',
    ],
    navyItems: [[{ text: 'PMBOK 第8版の「持続可能性」原則と ITIL v4 の「継続的改善（CSI）」は思想的に親和性が高い。試験対策上は ITIL / ISO 系の用語を主軸に。', style: 'navy' }]],
  },
}

// PMBOK_V8_APPENDIX を各カテゴリの sections に追記する（モジュールロード時）
// この方法により、NOTE_SECTION_INDEX / 検索 / 表示すべてに自動反映される
for (const categoryId of Object.keys(PMBOK_V8_APPENDIX)) {
  const note = NOTE_DB[categoryId]
  const section = PMBOK_V8_APPENDIX[categoryId]
  if (note && section) {
    note.sections.push(section)
  }
}

// ─────────────────────────────────────────────
// セクション見出しインデックス（Notes 一覧の検索機能で使用）
// ─────────────────────────────────────────────
export interface NoteSectionIndexEntry {
  categoryId: string
  /** exam-tips エントリは -1（セクションではないため） */
  sectionIndex: number
  heading: string
  /** 本文の平文。全文検索・スニペット生成に使う */
  searchText: string
  /** 通常セクションか、カテゴリ末尾の「試験で狙われるポイント」か */
  kind: 'section' | 'exam-tips'
  /** ジャンプ先アンカー（/notes/<categoryId>#<anchor>） */
  anchor: string
}

/** 検索用にマークアップ記号（== / __）と先頭の全角空白インデントを除去する */
function stripMarkup(text: string): string {
  return text.replace(/^　+/, '').replace(/==/g, '').replace(/__/g, '')
}

// セクション本文を検索用の平文へ変換する。
// items / navyItems に加え、headerDiagrams の図タイトル・キャプション・セルラベルも
// 対象にする（定石セクションも自動的に含まれる）。
function toSearchText(section: NoteSection): string {
  const parts: string[] = []
  for (const item of section.items ?? []) {
    parts.push(stripMarkup(item))
  }
  for (const tokens of section.navyItems ?? []) {
    parts.push(stripMarkup(tokens.map((t) => t.text).join('')))
  }
  for (const dg of section.headerDiagrams ?? []) {
    parts.push(dg.title)
    if (dg.caption) parts.push(dg.caption)
    for (const row of dg.rows) {
      for (const cell of row.cells) parts.push(cell.label)
    }
  }
  return parts.join(' ')
}

/** 「★ 試験で狙われるポイント」ブロックのアンカー（NoteDetail 側の id と一致させる） */
export const EXAM_TIPS_ANCHOR = 'note-exam-tips'
export const EXAM_TIPS_HEADING = '★ 試験で狙われるポイント'

export const NOTE_SECTION_INDEX: NoteSectionIndexEntry[] = NOTE_CATEGORY_IDS.flatMap(
  (categoryId) => {
    const note = NOTE_DB[categoryId]
    if (!note) return []
    const sections: NoteSectionIndexEntry[] = note.sections.map((section, sectionIndex) => ({
      categoryId,
      sectionIndex,
      heading: section.heading,
      searchText: toSearchText(section),
      kind: 'section',
      anchor: `note-section-${sectionIndex}`,
    }))
    // exam_tips はセクション配下ではないため、カテゴリごとに1エントリを足して検索可能にする
    if (note.exam_tips.length > 0) {
      sections.push({
        categoryId,
        sectionIndex: -1,
        heading: EXAM_TIPS_HEADING,
        searchText: note.exam_tips.map(stripMarkup).join(' '),
        kind: 'exam-tips',
        anchor: EXAM_TIPS_ANCHOR,
      })
    }
    return sections
  },
)
