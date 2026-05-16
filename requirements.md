# 要件定義書: プロジェクトマネージャ試験 学習アプリ

> バージョン: 0.5（ドラフト）
> 作成日: 2026-05-06
> ベースアプリ: NW-learning_app-pro v1.3
> ステータス: ドラフト（3視点レビュー反映済み、実装フェーズ移行可能）

---

## 1. プロジェクト概要

### 1.1 目的
情報処理技術者試験「プロジェクトマネージャ（PM）」試験の合格を目的とした学習Webアプリ。
NW-learning_app-proと同等の学習体験を、PM試験の知識領域・過去問に置き換え、論述トレーニングを追加して提供する。

### 1.2 学習コンセプト
- **ノート**: 試験範囲の知識をカテゴリ別にまとめた読み物（赤字隠し可）
- **クイズ**: ノートで学んだ知識を4択／記述で問う確認問題
- **公式午前II問題**: IPA公式の午前II過去問を別モードで取り込み
- **午後I**: 過去問の自己採点・記録による実戦練習
- **論述トレーニング**: 午後II対応。設問確認 → 時間計測 → 字数カウント → 解答保存 → 自己採点 → 振り返り
- **ゲーミフィケーション**: バッジ・レベル・XP・連続正解・論述回数で継続を支援

### 1.3 対象ユーザ
**実務経験の浅いインフラエンジニア**でPM試験合格を目指す受験者を主対象とする。
- ノートの文体・例示・難易度はこの層に合わせる
- PMBOK用語の前提知識は最小限を仮定

### 1.4 ブランディング
- **ベースカラー**: `#9d5b8b`
- **ロゴテキスト**（3行）:
  ```
  PM
  Project Manager
  Learning App by MAMIYA
  ```
- ロゴの文字色をベースカラーに揃える
- NW版の `#1e40af`（ネイビー）からPMアプリは `#9d5b8b` 系に統一

### 1.5 バージョニング方針
- **v1.0**: 全コンテンツ投入完了時のみ正式版とする
- **v0.x**: フェーズ1骨組み完成〜フェーズ2途中までは「開発中バージョン」として `v0.x` のみ使用
- バージョン表記をホーム画面・設定画面・PWA manifestで「Beta」または「v0.x（開発中）」と明示し、ユーザの期待値を整える
- `package.json` の version も `0.x.y` を維持し、フェーズ2完了で `1.0.0` に上げる

### 1.6 コンテンツ品質保証体制（パイロット運用）
- **パイロットフェーズ（フェーズ1.5）**: フェーズ1骨組み完成後、**1カテゴリ（ステークホルダー）のみ完成形コンテンツを投入**してパイロット運用
- パイロット中はユーザが1週間〜2週間使用し、設計の致命欠陥・コンテンツ品質を検証
- フィードバックを反映してから残りカテゴリへ着手
- **ノート品質保証**: Claude生成 → **Codex レビュー（構造・型・誤字）** → **ユーザ最終確認（PMBOK整合・コンテンツ妥当性）** のフロー（2026-05-16: 体制変更によりGeminiレビュー廃止）

---

## 2. スコープ

### 2.1 含むもの
| 区分 | 内容 |
|---|---|
| ノート | PM試験範囲の知識を分野別にまとめた読み物 |
| クイズ | ノート連動の4択／記述問題 |
| 公式午前II | IPA公式の午前II過去問取り込みモード |
| 午後I | 過去問の解答欄記入・答え合わせ・記録（NWと同形式） |
| 論述トレーニング（午後II） | 設問確認・時間計測・字数カウント・解答保存・自己採点・振り返り |
| 重要マーク | ユーザが手動で問題に重要フラグを立てる機能 |
| ゲーミフィケーション | バッジ（論述回数を含む条件）・レベル・XP・活動履歴 |
| デバイス間同期 | QRコード経由のローカルストレージ同期 |
| PWA | オフライン動作・ホーム画面追加 |

### 2.2 含まないもの（明確に除外）
| 除外項目 | 理由 |
|---|---|
| 午前I対策 | 高度共通免除前提 |
| 論述の自動添削 | 主観評価のため。ユーザによる自己採点・振り返りに留める |
| プロトコル一覧 | NW固有機能 |
| コラム（NW版の `/column`） | PMアプリでは削除（メニュー・ルート共に） |

### 2.3 v0.1からの変更点
- 論述（午後II）対応を **「除外」→「シンプルな論述トレーニングモードを新設」** に変更
- 公式午前II過去問を **「取り込まない」→「別モードで取り込む」** に変更
- 「重要問題（公式定義）」概念を廃止し、**ユーザの手動チェック方式**に変更
- コラムをスコープから削除
- 対象ユーザを「実務経験の浅いインフラエンジニア」に明確化
- ブランディング（カラー・ロゴ）を確定

---

## 3. NWアプリ資産の分類（流用 / 改変 / 新規 / 削除）

### 3.1 完全流用（コード変更なし、または定数差し替えのみ）

#### 3.1.1 認証・基盤
| パス | 備考 |
|---|---|
| `src/auth/AuthGuard.tsx` | そのまま |
| `src/auth/credentials.ts` | パスワードのみPMアプリ用に再設定 |
| `src/auth/hash.ts` | そのまま |
| `src/auth/useAuth.ts` | LocalStorageキーをprefix変更 |
| `src/main.tsx` | そのまま |
| `src/index.css` | そのまま |

#### 3.1.2 共通UI / レイアウト
| パス | 備考 |
|---|---|
| `src/components/PwaInstallPrompt.tsx` | そのまま |
| `src/components/CategoryCard.tsx` | そのまま |
| `src/components/StudyModeButton.tsx` | そのまま |

> `Layout.tsx` はサイドバー項目の追加・削除を伴うため §3.2 部分改変に分類。

#### 3.1.3 クイズ機能（ノート連動クイズ）
| パス | 備考 |
|---|---|
| `src/components/quiz/ModeSelect.tsx` | そのまま |
| `src/components/quiz/QuizQuestion.tsx` | そのまま |
| `src/components/quiz/ResultMultipleChoice.tsx` | そのまま |
| `src/components/quiz/ResultWritten.tsx` | そのまま |
| `src/components/quiz/XpGain.tsx` | そのまま |
| `src/pages/Quiz.tsx` | 「重要問題」モードの集計ロジックをユーザフラグ参照に変更 |
| `src/pages/QuizSummary.tsx` | そのまま |

#### 3.1.4 午後I機能
| パス | 備考 |
|---|---|
| `src/pages/AfternoonProblems.tsx` | G2タブ削除（午後IIは別モード化）。構造流用 |
| `src/pages/AfternoonMyAnswer.tsx` | そのまま |
| `src/pages/AfternoonAnswerDetail.tsx` | そのまま |
| `src/lib/tracker.ts` | LocalStorageキーprefix変更のみ |

#### 3.1.5 ゲーミフィケーション
| パス | 備考 |
|---|---|
| `src/components/gamification/LevelWidget.tsx` | そのまま |
| `src/components/gamification/BadgeUnlockToast.tsx` | そのまま |
| `src/components/badges/BadgeMedal.tsx` | そのまま |
| `src/pages/Badges.tsx` | そのまま |
| `src/data/levels.ts` | XP閾値そのまま |
| `src/lib/gamification.ts` | XP計算ロジック流用、論述完了時のXP加算ルールを追加 |

#### 3.1.6 履歴・活動ログ
| パス | 備考 |
|---|---|
| `src/components/history/StudyHistoryList.tsx` | そのまま |
| `src/components/history/XpChart.tsx` | そのまま |
| `src/pages/ActivityHistory.tsx` | 論述イベントを表示できるよう微修正 |
| `src/lib/activityLog.ts` | LocalStorageキーprefix変更、論述イベント種別追加 |

#### 3.1.7 デバイス同期（QR）
| パス | 備考 |
|---|---|
| `src/components/sync/*` | そのまま |
| `src/pages/DeviceSync.tsx` | そのまま |
| `src/lib/sync/*` | LocalStorageキー名一覧をPM用に更新（同期対象に論述・公式午前IIを追加） |

#### 3.1.8 検索・設定・使い方
| パス | 備考 |
|---|---|
| `src/pages/Search.tsx` | 検索対象にノート・クイズ・公式午前IIを含める拡張（ロジックは流用） |
| `src/pages/Settings.tsx` | LocalStorageキーprefixのみ変更 |
| `src/pages/HowToUse.tsx` | 文言差し替え（PM用、論述モード説明追加） |
| `src/pages/Login.tsx` | ロゴ・タイトル差し替え |

#### 3.1.9 ストレージ / 型定義
| パス | 備考 |
|---|---|
| `src/lib/storage.ts` | LocalStorageキーprefix `nwsp:` → **`pmap:`** に変更 |
| `src/lib/answerTable.ts` | そのまま |
| `src/types/index.ts` | 既存型は流用、論述・公式午前II用の新規型を追加 |

#### 3.1.10 ビルド設定
| パス | 備考 |
|---|---|
| `vite.config.ts` | PWAアプリ名・theme_color（`#9d5b8b`）差し替え |
| `tailwind.config.js` | `theme.extend.colors.brand` に `#9d5b8b` を定義 |
| `postcss.config.js` | そのまま |
| `tsconfig.*` / `eslint.config.js` | そのまま |
| `package.json` | name/version調整、依存はそのまま |
| `vercel.json` | そのまま |

### 3.2 部分改変

| パス | 改変内容 |
|---|---|
| `src/data/categories.ts` | NW 19カテゴリ → **PM 12カテゴリ**に差し替え |
| `src/data/afternoonProblems.ts` | PM版（H25〜現行）に差し替え。`section: 'PM1'` のみ |
| `src/components/Layout.tsx` | ① サイドバーから「プロトコル一覧」「コラム」削除<br>② サイドバーに「論述トレーニング」「公式午前II」追加<br>③ 配色をベースカラー `#9d5b8b` 系に差し替え |
| `src/pages/Home.tsx` メニューカード | 同上の追加・削除 |
| `src/pages/Notes.tsx` の `NOTE_CATEGORY_IDS` | PM 12カテゴリIDに差し替え |
| `src/data/badges.ts` | NW午後II関連バッジ削除 + **論述トレーニング回数バッジ**を新設 |
| `index.html` / `public/` | タイトル・PWAアイコンをPM用に作成（ロゴ仕様に従う） |
| Tailwind色クラス全般 | `bg-blue-*` 等のNW固有色を `bg-brand` 系に置換 |

### 3.3 新規作成

| パス | 内容 | 規模感 |
|---|---|---|
| `src/data/categories.ts` | PM 12カテゴリ定義 | 小 |
| `src/data/questions/<categoryId>.ts` × 12 | カテゴリ別クイズ問題 | 大（手作り） |
| `src/data/questions/index.ts` | 統合 | 小 |
| `src/data/officialMorningQuestions.ts` | **公式午前II過去問データ**（年度別） | 大（IPA公式データ取り込み） |
| `src/pages/OfficialMorningQuiz.tsx` | **公式午前IIモードページ**（新規） | 中 |
| `src/pages/NoteDetail.tsx` のNOTE_DB | カテゴリ別ノート本文 | 特大 |
| `src/data/afternoonProblems.ts` | PM午後I過去問インデックス（H25〜） | 中 |
| `src/data/officialAnswers.ts` | PM午後I公式解答例 | 中〜大 |
| `src/data/scoringMap.ts` | 設問配点マップ | 中 |
| `src/data/essayProblems.ts` | **PM午後II過去問インデックス（論述用）** | 中 |
| `src/pages/EssayTraining.tsx` | **論述トレーニングモード**（新規） | 中 |
| `src/lib/essay.ts` | **論述LocalStorage CRUD**（新規） | 中 |
| `src/data/badges.ts` | バッジ定義をPM化 + 論述バッジ追加 | 中 |

### 3.4 削除

| パス | 削除理由 |
|---|---|
| `src/pages/Protocols.tsx` | NW固有 |
| `src/pages/Column.tsx` | スコープ外 |
| `src/data/protocols.ts` | NW固有 |
| `src/data/topics.ts` | 実質スタブ |
| `src/data/questions/protocol-review.ts` | NW固有 |
| ルート `/protocols`, `/column` | 上記に伴い削除 |
| `requirements.md`（NW版） | PM版に置換済み |
| `extracted_text.txt` / `令和7-8年.txt` / `復習ノート.pdf` / `scripts/*.py` | NW固有の中間データ |
| `STRUCTURE.md` | PM用に書き直し（後続タスク） |

---

## 4. 機能要件

### 4.1 ホーム画面（`/`）
メニューカード構成（NW準拠＋差分）:
- アプリの使い方
- ノートモード
- **重要問題モード**（ユーザがマークした問題のみ）
- 弱点克服モード
- ランダム出題
- カテゴリ別学習
- **公式午前II問題**（新規）
- 午後問題（午後Iのみ表示）
- **論述トレーニング**（新規・午後II）
- 検索
- バッジ
- 学習履歴
- デバイス同期
- 設定

> NW版の「プロトコル一覧」「コラム」は削除。

### 4.2 ノートモード（`/notes`, `/notes/:categoryId`）
NW準拠。理解度（緑/黄/赤）記録、赤字マスク機能を流用。
ノート本文の作成は本要件のスコープ外（別途進行）。

#### 4.2.1 ノート → クイズへの遷移導線（v0.5で追加）
- ノート詳細画面（S05）下部に **「このカテゴリのクイズに挑戦 →」ボタン** を配置
- クリックで `/quiz?mode=topic&category=<categoryId>` へ遷移
- 学習サイクル（読む → 解く）を1タップで完結させる

#### 4.2.2 重要マーク チュートリアル（v0.5で追加）
- 初回起動時に1度だけ、クイズ画面または公式午前II画面で**☆ボタンの使い方をtooltip風に表示**
- LocalStorage `pmap:tutorial:important_seen = true` で再表示を制御
- ユーザが「OK・閉じる」をタップで完了

### 4.3 クイズモード（`/quiz`）— ノート連動
NWのモード仕様を踏襲しつつ「重要」の意味を変更:

| モード | URL | 内容 |
|---|---|---|
| カテゴリ別 | `?mode=topic&category=<id>` | 指定カテゴリの全問 |
| ランダム | `?mode=random` | 全カテゴリからランダム |
| **重要（ユーザマーク）** | `?mode=important` | **ユーザが手動でマークした問題のみ** |
| 弱点 | `?mode=weakness` | 不正解・連続不正解の問題優先 |

#### 4.3.1 重要マーク機能（変更点）
- `Question.isImportant` 静的フラグは廃止
- 各問題画面に**「重要マーク」トグルボタン**を配置
- LocalStorageで管理: `pmap:important_questions`（`questionId[]`）
- 重要マークは**クイズ・公式午前II 両モードで同一のLocalStorageを共有**（モードを跨いで横断管理）
- 設定画面に「重要マーク一覧」と「全解除」を提供

### 4.4 公式午前IIモード（`/morning`）— 新規
IPA公式の午前II過去問を年度別／全ランダムで解くモード。

#### 4.4.1 機能
- **年度選択**（H25〜現行、**全年度取り込む**）
- **全範囲ランダム**（年度横断）
- **重要マーク**（4.3.1とLocalStorageを**共通**）
- 4択選択 → 即時正誤判定 → 独自解説表示
- 正答率・履歴を記録（クイズモードと統計を分離）

#### 4.4.2 データ型
```ts
// src/data/officialMorningQuestions.ts
export interface OfficialMorningQuestion {
  id: string                  // 'om-r6-q3' 形式（小文字 om- prefix で重要マークの名前空間衝突を回避）
  year: string                // 'R6'
  yearLabel: string           // '令和6（2024）'
  number: number              // 1〜25
  questionText: string        // 設問文
  choices: string[]           // 選択肢（ア/イ/ウ/エ）
  correctIndex: 0 | 1 | 2 | 3
  explanation: string         // **独自解説（必須）**。IPA公式は解説を出さないため著者が作成
  categoryId?: string         // 12カテゴリのいずれかにタグ付け（任意）
  sourceUrl: string           // IPA公式PDF URL
}
```

#### 4.4.3 著作権表記
- IPA出典である旨を**画面下部のフッタ等、目立たない位置**に小さく表示
- **表記フォーマット（IPA規約準拠）**: 各問題ごとに「出典：<年度> 春期 プロジェクトマネージャ試験 午前II 問<番号>」を表示
  - 例（出題画面、各問のメタ情報部）: `出典：令和6年度 春期 プロジェクトマネージャ試験 午前II 問3`
  - 例（一覧画面のフッタ全般）: `本アプリは独立行政法人情報処理推進機構（IPA）が公開する情報処理技術者試験 過去問題を引用しています。`
- 各問題のIPA公式PDFへのリンクも併記
- **改変している場合は「改変あり」を明示**（解説のみの改変は問題改変ではないため通常不要）

> IPA著作権規約調査結果（2026-05-06時点）: 試験制度の意義に反しない教育目的の利用は許諾・使用料不要。出典明記が必須要件。詳細は `memory/risks.md` 参照。

### 4.5 午後I問題（`/afternoon`, `/afternoon/answers/:id`, `/afternoon/answers/:id/myAnswer`）
NWの午後I（G1）機能を流用。`AfternoonProblem.section = 'PM1'` のみ。

### 4.6 論述トレーニングモード（`/essay`, `/essay/:id`）— 新規

#### 4.6.1 一覧画面（`/essay`）
- 過去問一覧（年度×問番号）
- 各過去問の練習回数・最新練習日・学習計画日
- フィルタ: 全件 / 練習済み / 未着手

#### 4.6.2 練習画面（`/essay/:id`）
1. **設問確認**: 設問文（ア・イ・ウ）を表示。PDFリンクも提供
2. **時間計測**: スタート→経過時間表示。中断・再開可
3. **解答入力**: 設問ア・イ・ウごとにテキストエリア
4. **文字数カウント**: 設問ごとにリアルタイム表示。各設問の問題文に明記された推奨字数レンジ（`recommendedChars`）との対比
5. **保存**: 解答内容＋経過時間＋日付をLocalStorageに保存
   - **明示的な「下書き保存」ボタン**: 設問ごとに即時保存
   - **自動保存**（v0.5で追加）: 解答エリアでの**入力停止後3秒**で `pmap:essay:active` に自動的に書き込み、誤閉じ・クラッシュによる消失を防ぐ
6. **自己採点**: 5項目（題意適合 / 構造 / 具体性 / 一貫性 / 字数）を5段階で自己評価
7. **振り返り入力**: フリーテキストの振り返りメモ
8. **過去の練習履歴**: 同一問題の過去Attemptsを一覧表示・閲覧可

#### 4.6.3 データ型
```ts
// src/data/essayProblems.ts
export interface EssayProblem {
  id: string                  // 'R6-PM2-1'
  year: string
  yearLabel: string
  number: 1 | 2               // 午後IIは2問から1問選択
  theme: string               // タイトル
  setsumons: {
    label: 'ア' | 'イ' | 'ウ'
    text: string
    recommendedChars: { min: number; max: number }   // 設問ごとに個別指定（共通レンジは持たない）
  }[]
  categoryIds: string[]       // 関連カテゴリ（弱点抽出に使用）
  questionPdfUrl?: string
}

// src/lib/essay.ts
export interface EssayAttempt {
  id: string                  // crypto.randomUUID()
  problemId: string
  startedAt: string           // ISO 8601
  endedAt: string             // ISO 8601
  elapsedSec: number
  bodyByLabel: Record<'ア' | 'イ' | 'ウ', string>
  selfReview: {
    relevance: 1|2|3|4|5      // 題意適合
    structure: 1|2|3|4|5      // 構造
    concreteness: 1|2|3|4|5   // 具体性
    consistency: 1|2|3|4|5    // 一貫性
    charCount: 1|2|3|4|5      // 字数達成
  }
  reflection: string          // 振り返りメモ
}
```

#### 4.6.4 LocalStorageキー
- `pmap:essay:attempts` — `EssayAttempt[]`
- `pmap:essay:plans` — `Record<problemId, YYYY-MM-DD>`

### 4.7 ゲーミフィケーション

#### 4.7.1 XP加算ルール（NW準拠＋論述追加）
| 行動 | XP |
|---|---|
| クイズ4択正解 | 既存ルール踏襲 |
| クイズ記述自己○ | 既存ルール踏襲 |
| 公式午前II正解 | クイズと同等 |
| 午後I採点完了（1問あたり） | 既存ルール踏襲 |
| **論述トレーニング1回完了** | 新規（自己採点まで完了で固定XP付与） |

#### 4.7.2 バッジ
NWのバッジ定義（477行）から:
- **方針**: NWの既存バッジ定義（`badges.ts` 477行）を**まずそのままコピー**し、P9フェーズで以下の方針で再設計する
  - **削除**: NWの午後II関連バッジ（およびNW固有用語のバッジ）
  - **新設**: 論述トレーニング回数系バッジ
    - 論述初回完了（1回）
    - 論述継続（5回 / 10回 / 30回）
    - 全カテゴリ論述（`categoryIds` 全網羅）
    - 重要マーク活用バッジ（任意）
  - **改名・条件調整**: NW固有の用語をPM用語に置換、条件のしきい値はPMアプリの想定学習量に合わせる

### 4.8 認証
NWと同一（共有パスワード方式）。本番デプロイ前にPMアプリ用パスワードを再設定。

---

## 5. データ設計

### 5.1 カテゴリ（PMBOK第7版 + IPAシラバス補完 = 12カテゴリ + 第8版差分1カテゴリ）

#### 5.1.1 メインカテゴリ（12個、PMBOK第7版ベース）

| # | id | 名称 | 範囲 |
|---|---|---|---|
| 1 | stakeholder | ステークホルダー | 特定・分析・エンゲージメント計画 |
| 2 | team | チーム | リーダーシップ・組織・要員管理 |
| 3 | development-approach | 開発アプローチ・ライフサイクル | 予測型／適応型／ハイブリッド・アジャイル |
| 4 | planning | 計画 | スコープ・WBS・スケジュール・コスト・見積技法 |
| 5 | project-work | プロジェクト作業 | 調達・契約・リソース・知識管理 |
| 6 | delivery | デリバリー | 品質・要求・受入 |
| 7 | measurement | 測定 | EVM・KPI・予測・パフォーマンス測定 |
| 8 | uncertainty | 不確かさ・リスク | リスク特定・分析・対応・機会管理 |
| 9 | integration | 統合・変更管理 | 統合管理・変更要求・構成管理 |
| 10 | governance | ガバナンス・組織論 | PMO・ポートフォリオ・プログラム・組織構造 |
| 11 | tailoring-models | テーラリング・モデル・手法 | PMBOK第7版モデル・手法・成果物 |
| 12 | service-management | サービスマネジメント・関連知識 | ITIL・SLA・運用引継ぎ・システム監査・法務 |

#### 5.1.2 PMBOK第8版 追加要素カテゴリ（v0.5 で新設）

| # | id | 名称 | 範囲 |
|---|---|---|---|
| 13 | pmbok8-diff | PMBOK第8版 追加・変更要素 | 6原理・原則（旧12から再定義）/ 7パフォーマンス領域（旧8から再編）/ 復活したプロセス（49→40）/ AI活用付録 |

> **方針**: ノート・クイズの土台はPMBOK第7版で構築し、第8版の追加・変更箇所だけを **`pmbok8-diff` カテゴリ** に集約する。試験出題が第7版・第8版どちらでも対応可能。
> **補足**: IPA PM試験のシラバスがPMBOK第8版を取り込むタイミングを定期ウォッチ。F2-P1着手時のIPAシラバス公開状況により、`pmbok8-diff` カテゴリを「メイン12カテゴリに統合」する判断もあり得る。

### 5.2 LocalStorageキー命名（**`pmap:`** prefix）

| キー | 内容 |
|---|---|
| `pmap:answer_records` | クイズの解答記録（公式午前IIは `pmap:morning:records` に分離） |
| `pmap:user_progress_v2` | カテゴリ別進捗 |
| `pmap:study_sessions` | 学習セッション |
| `pmap:bookmarks` | ブックマーク（既存仕様継続） |
| `pmap:important_questions` | **ユーザ手動の重要マーク**（新規。questionId配列） |
| `pmap:question_mastery` | 問題ごとの習得状態 |
| `pmap:note_understanding` | ノート理解度 |
| `pmap:tracker:records` | 午後I採点記録 |
| `pmap:tracker:plans` | 午後I学習計画 |
| `pmap:morning:records` | **公式午前II解答履歴**（新規） |
| `pmap:essay:attempts` | **論述トレーニング履歴**（新規） |
| `pmap:essay:plans` | **論述学習計画**（新規） |
| `pmap:auth:*` | 認証関連 |

### 5.3 マイグレーション
新規アプリのため不要。NWアプリと同一ブラウザでも `pmap:` / `nwsp:` で衝突しない。

---

## 6. 非機能要件

### 6.1 技術スタック（NW準拠）
- React 19 / TypeScript / Vite 8
- Tailwind CSS v3（`brand: '#9d5b8b'` を `theme.extend.colors` に追加）
- React Router v7
- vite-plugin-pwa（autoUpdate, standalone, オフライン対応）
- @zxing/browser, @zxing/library, qrcode, lz-string
- lucide-react

### 6.2 ブラウザ対応
最新Chrome / Safari / Firefox / Edge。スマホPWA動作必須。

### 6.3 デプロイ先
Vercel（NWと同一構成）。

### 6.4 オフライン
PWA Workboxによる静的アセットキャッシュで、初回読み込み後はオフライン全機能動作。

---

## 7. 実装フェーズ案（v0.5で再構成）

3フェーズ構成に変更:
- **フェーズ1**: 骨組み実装（F1-P-1〜F1-P6）
- **フェーズ1.5**: パイロット運用（1カテゴリ完成→ユーザ検証）
- **フェーズ2**: 残りコンテンツ投入＋正式版リリース（F2-P1〜F2-P6）

詳細は `detailed_design.md` §1.2・§2 参照。各フェーズ・タスクには **Go/No-Go判定基準** を設定する。

---

## 8. 確定事項ログ（v0.2 オープン論点の解決）

| # | 論点 | 確定内容 |
|---|---|---|
| 1 | ロゴ綴り | "Project Manager"（正しい綴り）に確定 |
| 2 | 公式午前II 著作権表記 | 画面下部の目立たない位置に小さく表示（§4.4.3） |
| 3 | 論述推奨字数 | 共通レンジは持たず、**設問ごとに個別指定**（`recommendedChars`） |
| 4 | 論述自己採点5項目 | 提案どおり（題意適合・構造・具体性・一貫性・字数）で確定 |
| 5 | 公式午前II 解説 | **独自解説を作成**（`explanation` 必須） |
| 6 | 公式午前II 範囲 | **全年度取り込み**（H25〜現行） |
| 7 | 重要マーク | クイズと公式午前IIで**LocalStorageを共通利用** |
| 8 | バッジ再設計 | NWの`badges.ts`を**コピーしてP9で再設計** |

要件定義としての主要な未決事項は解消。以降は実装フェーズに着手可能。

---

## 9. 用語定義

| 用語 | 定義 |
|---|---|
| ノート | 試験範囲を分野別にまとめた静的読み物 |
| クイズ | ノート内容を確認する4択／記述問題（自作） |
| 公式午前II | IPA公式の午前II過去問を取り込んだモード |
| 午後I | PM試験午後I（記述）。過去問の自己採点機能 |
| 論述トレーニング | 午後II対応モード。練習・自己採点・振り返り |
| 重要マーク | ユーザが任意の問題に付与するブックマーク的フラグ |
| カテゴリ | 学習分野の最上位区分。本アプリでは12カテゴリ |
