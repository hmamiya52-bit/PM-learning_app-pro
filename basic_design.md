# 基本設計書: プロジェクトマネージャ試験 学習アプリ

> バージョン: 0.9（ドラフト・3視点レビュー反映）
> 作成日: 2026-05-06
> 関連: [requirements.md v0.4](./requirements.md)
> ベースアプリ: NW-learning_app-pro v1.3
> ステータス: ドラフト（整合性レビュー反映済み）

---

## 0. 本書の位置づけ

要件定義書（v0.3）を受け、システム全体構成・画面・機能・データ・共通モジュール・非機能要件を**実装に着手できる粒度**まで具体化する。
NWアプリの既存実装で確定している部分は「NW準拠」と簡潔に示し、PM固有の差分・新規部分を厚く記述する。

凡例:
- 🔵 完全流用（NWからコード変更なし）
- 🟡 部分改変（既存コードを修正して使う）
- 🟢 新規作成
- 🔴 削除

---

## 1. システム全体構成

### 1.0 デプロイ先（予定）

| 項目 | 値 |
|---|---|
| ホスティング | Vercel |
| URL | `https://mamiya-pmapp.vercel.app/`（準備中） |
| 公開設定 | 個人学習用途。著作権表記は §4.4.3 |

### 1.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (PWA)                                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ React Application (SPA)                              │    │
│  │                                                      │    │
│  │  Pages (画面)                                        │    │
│  │   ↓ uses                                             │    │
│  │  Components (UI部品)                                 │    │
│  │   ↓ uses                                             │    │
│  │  Lib (ドメインロジック・ストレージAPI)                │    │
│  │   ↓ reads/writes                                     │    │
│  │  LocalStorage (永続化)                               │    │
│  │                                                      │    │
│  │  Static Data (categories, questions, ノート 等)      │    │
│  │   - import で直接バンドル                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Service Worker (Workbox)                                    │
│   - 静的アセットキャッシュ                                    │
│   - オフライン動作                                           │
└─────────────────────────────────────────────────────────────┘

           QR同期                       Vercel
       (端末↔端末ローカル)         (静的ホスティング)
```

- バックエンド・サーバAPI・DBは**持たない**（純粋なクライアントサイドSPA）
- すべてのユーザデータはブラウザのLocalStorage
- 試験コンテンツ（ノート・問題等）はTypeScriptソースに静的にバンドル
- 端末間データ移行はQRコード経由のみ

### 1.2 技術スタック（確定）

| 層 | 技術 | バージョン |
|---|---|---|
| 言語 | TypeScript | 5.9系 |
| フレームワーク | React | 19系 |
| ビルド | Vite | 8系 |
| ルーティング | react-router-dom | 7系 |
| スタイリング | Tailwind CSS | 3系 |
| PWA | vite-plugin-pwa | 1系 |
| QR | @zxing/browser, @zxing/library, qrcode | NWバージョン踏襲 |
| 圧縮 | lz-string | 1.5 |
| アイコン | lucide-react | 1.7 |
| 静的解析 | ESLint, typescript-eslint | NWバージョン踏襲 |

依存はNWアプリ（package.json）と同一。**PMアプリ固有の追加依存は無い**。

### 1.3 ディレクトリ構成（PMアプリ）

```
PM-learning_app-pro/
├── src/
│   ├── main.tsx                            🔵
│   ├── App.tsx                             🟡 (ルート差分)
│   ├── index.css                           🔵
│   ├── version.ts                          🟢 (PM版バージョン)
│   ├── assets/                             🟢 (ロゴ・hero画像等)
│   ├── auth/
│   │   ├── AuthGuard.tsx                   🔵
│   │   ├── credentials.ts                  🟡 (パス変更)
│   │   ├── hash.ts                         🔵
│   │   └── useAuth.ts                      🟡 (キー名)
│   ├── types/
│   │   └── index.ts                        🟡 (PM固有型を追記)
│   ├── data/
│   │   ├── categories.ts                   🟡 (12カテゴリ)
│   │   ├── badges.ts                       🟡 (P9で再設計)
│   │   ├── levels.ts                       🔵
│   │   ├── questions/                      🟡 (PM 12カテゴリ別)
│   │   │   ├── index.ts
│   │   │   └── <categoryId>.ts × 12
│   │   ├── officialMorningQuestions.ts     🟢 (公式午前II)
│   │   ├── afternoonProblems.ts            🟡 (PM版過去問)
│   │   ├── officialAnswers.ts              🟡 (PM版公式解答)
│   │   ├── scoringMap.ts                   🟡 (PM版配点)
│   │   └── essayProblems.ts                🟢 (午後II一覧)
│   ├── lib/
│   │   ├── storage.ts                      🟡 (キーprefix)
│   │   ├── activityLog.ts                  🟡 (キー + 論述イベント)
│   │   ├── tracker.ts                      🟡 (キーprefix)
│   │   ├── essay.ts                        🟢 (論述CRUD)
│   │   ├── importantMarks.ts               🟢 (重要マークCRUD)
│   │   ├── morningRecords.ts               🟢 (公式午前II履歴CRUD)
│   │   ├── gamification.ts                 🟡 (論述XP追加)
│   │   ├── answerTable.ts                  🔵
│   │   └── sync/                           🟡 (同期対象キー追加)
│   ├── components/
│   │   ├── Layout.tsx                      🟡 (メニュー差分・配色)
│   │   ├── PwaInstallPrompt.tsx            🔵
│   │   ├── CategoryCard.tsx                🔵
│   │   ├── StudyModeButton.tsx             🔵
│   │   ├── ImportantToggle.tsx             🟢 (重要マーク用)
│   │   ├── quiz/                           🔵 (5ファイル全て)
│   │   ├── badges/                         🔵
│   │   ├── gamification/                   🔵 (2ファイル)
│   │   ├── history/                        🔵 (2ファイル)
│   │   ├── sync/                           🔵 (3ファイル)
│   │   └── essay/                          🟢 (新規)
│   │       ├── EssayTimer.tsx
│   │       ├── EssayCharCounter.tsx
│   │       ├── EssaySelfReview.tsx
│   │       └── EssayAttemptHistory.tsx
│   └── pages/
│       ├── Home.tsx                        🟡 (メニュー差分)
│       ├── Login.tsx                       🟡 (ロゴ)
│       ├── HowToUse.tsx                    🟡 (文言)
│       ├── Notes.tsx                       🟡 (NOTE_CATEGORY_IDS)
│       ├── NoteDetail.tsx                  🟡 (本文は別途、構造は流用)
│       ├── Quiz.tsx                        🟡 (重要モードロジック)
│       ├── QuizSummary.tsx                 🔵
│       ├── OfficialMorningQuiz.tsx         🟢 (公式午前II トップ)
│       ├── OfficialMorningSession.tsx      🟢 (公式午前II 出題・没入型)
│       ├── OfficialMorningSummary.tsx      🟢 (公式午前II サマリー・没入型)
│       ├── AfternoonProblems.tsx           🟡 (G2タブ削除)
│       ├── AfternoonMyAnswer.tsx           🔵
│       ├── AfternoonAnswerDetail.tsx       🔵
│       ├── EssayList.tsx                   🟢 (論述一覧)
│       ├── EssayTraining.tsx               🟢 (論述練習)
│       ├── EssayAttemptDetail.tsx          🟢 (論述履歴閲覧)
│       ├── ImportantMarks.tsx              🟢 (重要マーク管理 - 設定内)
│       ├── Search.tsx                      🟡 (検索対象拡張)
│       ├── Settings.tsx                    🟡 (リセットキー)
│       ├── Badges.tsx                      🔵
│       ├── ActivityHistory.tsx             🟡 (論述イベント)
│       └── DeviceSync.tsx                  🔵
├── public/
│   ├── favicon.svg                         🟢 (PMロゴ)
│   ├── favicon-32.png                      🟢
│   ├── pwa-192x192.png                     🟢
│   ├── pwa-512x512.png                     🟢
│   ├── logo-source.svg                     🟢
│   └── how-to-use/                         🟢 (キャプチャ画像、後追い)
├── index.html                              🟡 (タイトル・theme-color)
├── package.json                            🟡 (name)
├── vite.config.ts                          🟡 (PWA manifest)
├── tailwind.config.js                      🟡 (brand色追加)
├── postcss.config.js                       🔵
├── tsconfig*.json                          🔵
├── eslint.config.js                        🔵
├── vercel.json                             🔵
├── requirements.md                         🟢 (本プロジェクト要件)
├── basic_design.md                         🟢 (本書)
└── STRUCTURE.md                            🟢 (PMアプリ用に書き直し)
```

🔴 NWから持ち込まないもの:
- `src/pages/Protocols.tsx`, `src/pages/Column.tsx`
- `src/data/protocols.ts`, `src/data/topics.ts`
- `src/data/questions/protocol-review.ts`
- `extracted_text.txt`, `令和7-8年.txt`, `復習ノート.pdf`, `scripts/*.py`

### 1.4 レイヤ構成と依存方向

```
[Pages]    →  ユーザインタラクション、URL紐付け、状態オーケストレーション
   │
   ↓
[Components] → 再利用UI部品（プレゼンテーション中心）
   │
   ↓
[Lib]      →  ドメインロジック、LocalStorage CRUD、XP計算、同期コーデック
   │
   ↓
[Storage]  →  window.localStorage / IndexedDB(未使用) / メモリ
```

依存は単方向。PagesがLibを直接呼び出すケースが多い（NW踏襲）。

---

## 2. 画面設計

### 2.1 画面一覧

**認証**列の凡例:
- ✕（開発版）: 開発期間中は全画面で認証不要（アプリ起動→トップ直接表示）
- ◎（正式版）: 正式版リリース時に認証必須

| ID | URL | 画面名 | 認証(開発版) | 認証(正式版) | Layout | 種別 | 備考 |
|---|---|---|---|---|---|---|---|
| S01 | `/login` | ログイン | — | — | なし | 🟡 | **開発版では未使用**。コード残置・正式版で復活 |
| S02 | `/` | ホーム | ✕ | ◎ | あり | 🟡 | 起動時に直接表示 |
| S03 | `/how-to-use` | アプリの使い方 | ✕ | ◎ | あり | 🟡 | 文言差し替え、論述説明追加 |
| S04 | `/notes` | ノート一覧 | ✕ | ◎ | あり | 🟡 | 12カテゴリ |
| S05 | `/notes/:categoryId` | ノート詳細 | ✕ | ◎ | あり | 🟡 | 本文は別途投入 |
| S06 | `/quiz` | クイズ（没入型） | ✕ | ◎ | なし | 🟡 | クエリで4モード切替 |
| S07 | `/quiz/summary` 相当 | クイズサマリー | ✕ | ◎ | なし | 🔵 | NW踏襲（NWでは内部state） |
| S08 | `/morning` | 公式午前II トップ | ✕ | ◎ | あり | 🟢 | 年度選択／ランダム |
| S09 | `/morning/session` | 公式午前II 出題 | ✕ | ◎ | なし | 🟢 | 没入型 |
| S10 | `/morning/summary` | 公式午前II サマリー | ✕ | ◎ | なし | 🟢 | 没入型 |
| S11 | `/afternoon` | 午後I 一覧 | ✕ | ◎ | あり | 🟡 | G2タブ削除 |
| S12 | `/afternoon/answers/:id` | 午後I 公式解答 | ✕ | ◎ | あり | 🔵 | |
| S13 | `/afternoon/answers/:id/myAnswer` | 午後I 自己採点 | ✕ | ◎ | あり | 🔵 | |
| S14 | `/essay` | 論述 一覧 | ✕ | ◎ | あり | 🟢 | |
| S15 | `/essay/:id` | 論述 練習 | ✕ | ◎ | あり | 🟢 | 設問・タイマー・解答・採点・振り返り |
| S16 | `/essay/:id/attempts/:attemptId` | 論述 履歴詳細 | ✕ | ◎ | あり | 🟢 | |
| S17 | `/search` | 検索 | ✕ | ◎ | あり | 🟡 | 検索対象拡張 |
| S18 | `/badges` | バッジ | ✕ | ◎ | あり | 🔵 | |
| S19 | `/history` | 学習履歴 | ✕ | ◎ | あり | 🟡 | 論述イベント追加 |
| S20 | `/sync` | デバイス同期 | ✕ | ◎ | あり | 🔵 | |
| S21 | `/settings` | 設定 | ✕ | ◎ | あり | 🟡 | リセットキー追加 |
| S22 | `/settings/important` | 重要マーク管理 | ✕ | ◎ | あり | 🟢 | Settings配下のサブ画面 |

🔴 削除: `/protocols`, `/column`

**S01 ログインの扱い（開発版）**:
- ルーティングから外す（`App.tsx` で `<Route path="/login" />` を登録しない）
- アプリ起動 → `/` ホーム画面が直接表示
- `Login.tsx` / `AuthGuard.tsx` / `useAuth.ts` / `credentials.ts` / `hash.ts` のコード自体は**削除せず残置**
- 正式版リリース時にルーティング復活＋AuthGuardでラップする手順をP9（仕上げ）で実施

### 2.2 画面遷移図（主要動線）

```
                  （開発版: 起動 → 直接S02 / 正式版: S01 → S02）
                    ┌──────────────┐
        ┌───────────┤  S02 ホーム  ├───────────┐
        │           └──────┬───────┘           │
        │                  │                   │
        ▼                  ▼                   ▼
  ┌──────────┐     ┌──────────────┐     ┌──────────┐
  │ S04 ノート│     │ S06 クイズ    │     │ S08 公式  │
  │ 一覧     │     │ (4モード)    │     │ 午前II    │
  └────┬─────┘     └──────┬───────┘     └────┬─────┘
       ▼                  ▼                  ▼
  ┌──────────┐     ┌──────────────┐     ┌──────────┐
  │ S05 ノート│     │ S07 サマリー │     │ S09→S10  │
  │ 詳細     │     └──────────────┘     │ 出題＋計  │
  └──────────┘                           └──────────┘

        ┌────────────────┐         ┌──────────────┐
        │ S11 午後I一覧   │         │ S14 論述一覧  │
        └────────┬───────┘         └──────┬───────┘
                 ▼                        ▼
        ┌────────────────┐         ┌──────────────┐
        │ S12 公式解答    │         │ S15 論述練習  │
        └────────┬───────┘         └──────┬───────┘
                 ▼                        ▼
        ┌────────────────┐         ┌──────────────┐
        │ S13 自己採点    │         │ S16 履歴詳細  │
        └────────────────┘         └──────────────┘

  共通: S17検索・S18バッジ・S19履歴・S20同期・S21設定 へはサイドバーから常時遷移可能
```

### 2.3 共通レイアウト

NWの`Layout.tsx`を流用。サイドバー項目は以下に再構成（順序）:

1. ホーム
2. アプリの使い方
3. ノートモード
4. 重要問題モード（重要マーク済み問題のみ）
5. 弱点克服モード
6. ランダム出題
7. カテゴリ別学習
8. 公式午前II問題 🟢
9. 午後問題（午後Iのみ）
10. 論述トレーニング 🟢
11. 検索
12. バッジ
13. 学習履歴
14. デバイス同期
15. 設定

🔴 削除: プロトコル一覧、コラム

サイドバーのアクセント色をベースカラー `#9d5b8b` に変更（Tailwind `bg-brand` 系）。
没入型画面（S06/S07/S09/S10）はLayoutを使わない（NW準拠）。

### 2.4 主要画面のレイアウト概要

#### S02 ホーム
- ヘッダ: ロゴ + レベルウィジェット
- 中央: メニューカードのグリッド（モバイル1列、デスクトップ2-3列）
- カードの並びは2.3のサイドバー順を踏襲
- フッタ: アプリバージョン

#### S08 公式午前II トップ 🟢
- 上段: 「全範囲ランダム」ボタン（強調）
- 中段: 年度カードのグリッド（H25〜現行、各年度の正答率バッジ）
- 下段: 「重要マークのみ」「未挑戦のみ」フィルタ
- 画面下部フッタ: IPA出典表記（小文字、目立たない）

#### S15 論述練習 🟢
レイアウト構成（縦スクロール）:
1. **設問パネル**: 設問ア・イ・ウのテキスト表示（折りたたみ可、PDFリンク）
2. **タイマーパネル**: スタート/一時停止/再開、経過時間（HH:MM:SS）
3. **解答エリア**: 設問ごとのテキストエリア（高さ可変）
   - 各エリアの右上に文字数 / 推奨レンジ表示（推奨内: 緑、超過: 黄、不足: 赤）
4. **保存ボタン**: 入力中はオートセーブ（下書き）、明示的に「採点へ進む」で確定
5. **自己採点パネル**: 5項目を5段階で評価
6. **振り返り入力**: テキストエリア（任意、改善点メモ）
7. **保存完了モーダル**: XP獲得通知、履歴ページへの導線

タイマーは画面遷移してもLocalStorageに状態を保持し、復帰可能（`pmap:essay:active`）。

#### S22 重要マーク管理 🟢
- マーク済み問題の一覧（クイズ・公式午前II混在）
- 各行: モードバッジ / 問題文抜粋 / 解除ボタン
- 上部: 「全解除」ボタン

---

## 3. 機能設計

### 3.1 機能一覧

| ID | 機能名 | 種別 | 関連画面 |
|---|---|---|---|
| F01 | ログイン認証 | 🟡 | S01 |
| F02 | ノート閲覧 | 🟡 | S04, S05 |
| F03 | ノート理解度記録 | 🔵 | S05 |
| F04 | クイズ出題（4モード） | 🟡 | S06 |
| F05 | クイズ採点・XP・進捗更新 | 🔵 | S06 |
| F06 | 重要マーク（トグル） | 🟢 | S06, S09, S22 |
| F07 | 公式午前II 出題 | 🟢 | S08, S09 |
| F08 | 公式午前II サマリー・履歴 | 🟢 | S10 |
| F09 | 午後I 一覧・計画日設定 | 🟡 | S11 |
| F10 | 午後I 公式解答表示 | 🔵 | S12 |
| F11 | 午後I 自己採点・スコア記録 | 🔵 | S13 |
| F12 | 論述 一覧・計画日設定 | 🟢 | S14 |
| F13 | 論述 練習（タイマー・字数・採点・振り返り） | 🟢 | S15 |
| F14 | 論述 履歴閲覧 | 🟢 | S16 |
| F15 | 全文検索（ノート・クイズ・公式午前II） | 🟡 | S17 |
| F16 | バッジ判定・解錠 | 🟡 | S18, バックグラウンド |
| F17 | XP・レベル算出 | 🟡 | 共通 |
| F18 | 学習履歴可視化 | 🟡 | S19 |
| F19 | デバイス同期（QR） | 🔵 | S20 |
| F20 | データリセット | 🟡 | S21 |
| F21 | PWAインストール | 🔵 | 共通 |

### 3.2 各モードの状態遷移（主要）

#### F04 クイズ出題（4モード）

```
 [Home/Sidebar]──選択──→ [モード判定]
                          ├─ topic     → 指定categoryIdの全Question
                          ├─ random    → 全questionsをシャッフル
                          ├─ important → important_questions ∩ questions
                          └─ weakness  → mastery=incorrect or 未挑戦優先
                                       ↓
                              [問題表示] ← (4択 or 記述)
                                       ↓ 回答
                              [採点・記録]
                              ・answerRecords追加
                              ・user_progress更新
                              ・question_mastery更新
                              ・XP加算
                              ・activityLog追加
                                       ↓
                              [次の問題 or サマリー]
```

#### F07 公式午前II 出題

```
 [S08]
  ├─ 「全範囲ランダム」→ 全officialMorningQuestionsシャッフル
  ├─ 年度選択         → 該当年度25問を順序通り
  └─ 「重要マークのみ」→ important_questions ∩ officialMorningQuestions
                                   ↓
                          [S09 4択画面]
                          ・選択肢ア/イ/ウ/エ
                          ・選択 → 正誤判定
                          ・解説（独自）表示
                          ・重要マーク トグル可
                                   ↓
                          [次の問題]
                                   ↓
                          [S10 サマリー]
                          ・正答率、誤答リスト
                          ・記録: morning:records
```

#### F13 論述練習

```
 [S14] ──選択──→ [S15]
                  │
                  ├─ 設問表示
                  ├─ タイマー開始
                  │   ├─ 一時停止/再開可
                  │   └─ pmap:essay:activeに状態保存（離脱時復帰用）
                  ├─ 解答入力（ア/イ/ウ）
                  │   └─ 文字数リアルタイム表示
                  ├─ 「採点へ進む」
                  │   ├─ 自己採点5項目
                  │   └─ 振り返り入力
                  └─ 「保存」
                      ├─ EssayAttemptをessay:attemptsに追加
                      ├─ pmap:essay:active削除
                      ├─ XP加算
                      ├─ activityLog追加
                      └─ バッジ判定
                                ↓
                  [S16 履歴詳細] or [S14 一覧へ戻る]
```

### 3.3 重要マーク機能（F06）詳細

- 各問題画面（クイズ・公式午前II）に**☆トグルボタン**を配置
- 押下で `pmap:important_questions` に `questionId` を追加/削除
- クイズ画面の `Question.id` と公式午前IIの `OfficialMorningQuestion.id` は名前空間が衝突しないよう以下のID規約とする:
  - クイズ問題: `q-<連番>` （NWと同様）
  - 公式午前II: `om-<年度>-<番号>`（例: `om-r6-q3`）
- 「重要問題モード」（F04 important）はクイズ問題のみを抽出
- 「公式午前IIで重要マークのみ」フィルタは公式午前II側のIDのみを抽出
- 設定画面 `S22` では両方を統合表示

### 3.4 採点・進捗更新ロジック

クイズ・公式午前IIともに以下の流れ（NW踏襲、対象キーが増えるのみ）:

1. `addAnswerRecord(record)` — 解答記録追加
2. `updateProgress(topicId, isCorrect, mode)` — カテゴリ別進捗更新（クイズのみ。公式午前IIは別ストア `morning:records`）
3. `updateQuestionMastery(questionId, mode, isCorrect)` — 問題ごとの習得状態更新
4. `gamification.addXp(event)` — XP加算
5. `activityLog.addEvent(event)` — 活動ログ追加
6. `badges.evaluate()` — バッジ判定（解錠通知あり）

### 3.5 検索機能（F15）拡張

NWの`Search.tsx`は問題本文・解説を全文検索する実装。PMでは検索対象を以下に拡張:

| 対象 | キー | 表示 |
|---|---|---|
| クイズ問題 | `id`, `questionText`, `correctAnswer`, `explanation` | 問題詳細にジャンプ |
| ノート（本文） | `categoryId`, `sectionHeading`, `body` | ノート詳細にスクロール |
| 公式午前II | `id`, `questionText`, `choices`, `explanation` | 公式午前II個別表示 |

タブで検索対象を切替可能とする（NWは問題のみ）。

---

## 4. データ設計

### 4.1 静的データ（バンドル時固定）

```
src/data/
├── categories.ts              [Category × 12]
├── questions/
│   └── <categoryId>.ts × 12   [Question × N]
├── officialMorningQuestions.ts [OfficialMorningQuestion × 全年度×25問]
├── afternoonProblems.ts       [AfternoonProblem × 年度×2-3問]
├── officialAnswers.ts         [OfficialAnswerSet × 上記と同数]
├── scoringMap.ts              [問題ID → 設問配点]
├── essayProblems.ts           [EssayProblem × 年度×2問]
├── badges.ts                  [Badge × N]
└── levels.ts                  [Level × N]
```

### 4.2 型定義（PMアプリ）

`src/types/index.ts` に以下を集約。

```ts
// === 既存型（NW流用） ===
export interface Category {
  id: string
  name: string
  order: number
  description: string
}

export interface Question {
  id: string                    // 'q-001' 形式
  topicId: string               // = categoryId（12種のいずれか）
  questionText: string          // {{blank}} で穴埋めマーク
  correctAnswer: string
  choices: string[]             // [正解, 誤答, 誤答, 誤答]
  explanation: string
  difficulty: 1 | 2 | 3
  excludeFromWritten?: boolean
  // NWの isImportant フィールドは廃止（ユーザマークに置換）
}

export interface AnswerRecord {
  id: string
  questionId: string            // クイズ問題ID 'q-*' のみ（公式午前IIはMorningRecord側）
  mode: 'multiple-choice' | 'written'
  isCorrect: boolean
  userAnswer: string
  answeredAt: string
}

export interface UserProgress {
  topicId: string
  mcAttempts: number
  mcCorrect: number
  wrAttempts: number
  wrCorrect: number
  totalAttempts: number         // 派生
  correctCount: number          // 派生
  lastStudiedAt: string
  isBookmarked: boolean
}

// クイズ解答モード（公式午前IIは別系統で MorningRecord を使うため含めない）
export type AnswerMode = 'multiple-choice' | 'written'

export interface StudySession {
  id: string
  startedAt: string
  endedAt: string | null
  mode: 'topic' | 'weakness' | 'random' | 'important' | 'single' | 'morning' | 'essay'
  categoryId: string | null
  questionCount: number
  correctCount: number
}

export interface Bookmark {
  questionId: string
  createdAt: string
}

// === 新規型 ===

// 公式午前II問題
export interface OfficialMorningQuestion {
  id: string                    // 'om-r6-q3'
  year: string                  // 'R6'
  yearLabel: string             // '令和6（2024）'
  number: number                // 1〜25
  questionText: string
  choices: [string, string, string, string]  // ア/イ/ウ/エ
  correctIndex: 0 | 1 | 2 | 3
  explanation: string           // 独自解説（必須）
  categoryId?: string           // 12カテゴリのいずれか（任意）
  sourceUrl: string             // IPA公式PDF
}

// 公式午前II 解答記録
export interface MorningRecord {
  id: string
  questionId: string            // 'om-*'
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
  answeredAt: string
}

// 午後I（NWのAfternoonProblemを section: 'PM1' に簡略化）
export type ProblemSection = 'PM1'
export interface AfternoonProblem {
  id: string                    // 'H25-PM1-1'
  year: string
  yearLabel: string
  era: 'heisei' | 'reiwa'
  section: ProblemSection
  number: number
  title: string
  keywords: string[]
  questionPdfUrl?: string
}

// 午後I 公式解答（NWのOfficialAnswerSetをsection限定）
export interface AnswerRow {
  s: string
  q?: string
  t?: string
  a: string
  essay?: boolean
}
export interface OfficialAnswerSet {
  id: string
  year: string
  section: 'PM1'
  number: number
  pdfUrl: string
  answers: AnswerRow[]
}

// 午後I 採点記録（NWのPracticeRecordそのまま）
export interface PracticeRecord {
  id: string
  problemId: string
  date: string                  // 'YYYY-MM-DD'
  score: number
  memo?: string
}

// 午後II 論述問題
export interface EssayProblem {
  id: string                    // 'R6-PM2-1'
  year: string
  yearLabel: string
  number: 1 | 2
  theme: string
  setsumons: EssaySetsumon[]
  categoryIds: string[]         // 関連カテゴリ
  questionPdfUrl?: string
}

export type SetsumonLabel = 'ア' | 'イ' | 'ウ'
export interface EssaySetsumon {
  label: SetsumonLabel
  text: string
  recommendedChars: { min: number; max: number }
}

// 論述 練習履歴
export interface EssayAttempt {
  id: string                    // crypto.randomUUID()
  problemId: string
  startedAt: string             // ISO 8601
  endedAt: string
  elapsedSec: number
  bodyByLabel: Record<SetsumonLabel, string>
  selfReview: EssaySelfReview
  reflection: string
}

export interface EssaySelfReview {
  relevance: 1 | 2 | 3 | 4 | 5     // 題意適合
  structure: 1 | 2 | 3 | 4 | 5     // 構造
  concreteness: 1 | 2 | 3 | 4 | 5  // 具体性
  consistency: 1 | 2 | 3 | 4 | 5   // 一貫性
  charCount: 1 | 2 | 3 | 4 | 5     // 字数達成
}

// 論述 アクティブセッション（離脱復帰用）
export interface EssayActiveSession {
  problemId: string
  startedAt: string                  // 最初に開始した時刻（参考用）
  pausedAt: string | null            // 一時停止時刻（動作中は null）
  lastResumedAt: string | null       // 最後の再開時刻（動作中の経過秒計算用、初回開始時は startedAt と同値）
  accumulatedSec: number             // 一時停止までの確定経過秒
  bodyByLabel: Partial<Record<SetsumonLabel, string>>
  step: 'writing' | 'reviewing' | 'reflecting'
}
```

### 4.3 LocalStorageスキーマ

| キー | 型 | 内容 |
|---|---|---|
| `pmap:auth:session` | `{ authedAt: string }` | ログイン状態（**正式版のみ使用**、開発版は未使用） |
| `pmap:answer_records` | `AnswerRecord[]` | **クイズの解答記録のみ**（公式午前IIは `pmap:morning:records` に分離） |
| `pmap:user_progress_v2` | `StoredProgress[]` | カテゴリ別進捗（クイズ） |
| `pmap:study_sessions` | `StudySession[]` | 学習セッション |
| `pmap:bookmarks` | `Bookmark[]` | NW踏襲のブックマーク（重要マーク機能と役割が重複するため、詳細設計時に運用整理） |
| `pmap:important_questions` | `string[]` | **重要マークID配列（クイズ・公式午前II共通）** |
| `pmap:question_mastery` | `Record<string, MasteryState>` | 問題ごとの習得状態 |
| `pmap:note_understanding` | `Record<string, 'green'\|'yellow'\|'red'>` | ノート理解度 |
| `pmap:tracker:records` | `PracticeRecord[]` | 午後I 採点記録 |
| `pmap:tracker:plans` | `Record<problemId, YYYY-MM-DD>` | 午後I 学習計画 |
| `pmap:myAnswer:<problemId>` | `Record<questionPath, string>` | 午後I 自己採点中の解答（保存ボタン押下までの一時バッファ）。同期対象外 |
| `pmap:savedAnswers:<recordId>` | `Record<questionPath, string>` | 午後I 採点完了時の解答スナップショット（履歴閲覧用）。同期対象 |
| `pmap:morning:records` | `MorningRecord[]` | 公式午前II 解答履歴 |
| `pmap:essay:attempts` | `EssayAttempt[]` | 論述 練習履歴 |
| `pmap:essay:plans` | `Record<problemId, YYYY-MM-DD>` | 論述 学習計画 |
| `pmap:essay:active` | `EssayActiveSession \| null` | **離脱復帰用 アクティブ論述セッション** |
| `pmap:activity_log` | `ActivityEvent[]` | 活動ログ |
| `pmap:gamification:xp` | `{ totalXp: number }` | 累積XP |
| `pmap:gamification:badges` | `string[]` | 解錠済みバッジID |
| `pmap:sync:device_id` | `string` | デバイス識別UUID（QR同期用） |
| `pmap:sync:meta` | object | 同期メタ（NW踏襲） |
| `pmap:install_prompt_dismissed` | `boolean` | PWAインストール案内表示制御 |
| `pmap:tutorial:important_seen` | `boolean` | 重要マークチュートリアル表示済みフラグ（v0.9 U5対応） |

### 4.4 データ間の関係

```
Category (静的) ──1:N── Question (静的)
                              │
                              ├──N:M── important_questions[] (LS)
                              ├──1:N── AnswerRecord (LS)
                              └──1:1── MasteryState (LS)

Category ──1:N── NoteSection (静的) ──1:1── note_understanding (LS)

OfficialMorningQuestion (静的) ──1:N── MorningRecord (LS)
                              └──N:M── important_questions[] (LS) (共有)

AfternoonProblem (静的) ──1:N── PracticeRecord (LS)
                       └──1:1── tracker:plans (LS)

EssayProblem (静的) ──1:N── EssayAttempt (LS)
                   └──1:1── essay:plans (LS)
                   └──0:1── essay:active (LS)  (現在練習中のみ)

ActivityEvent (LS) ←── 全モードからの記録集約
GamificationXP (LS) ←── 全モードからのXP加算集約
```

---

## 5. 共通モジュール設計

### 5.1 `src/lib/storage.ts` 🟡（NW踏襲、キーprefix変更のみ）

公開API（NWと同一シグネチャ）:
```ts
getAnswerRecords(): AnswerRecord[]
addAnswerRecord(record: AnswerRecord): void
getAllProgress(): UserProgress[]
getProgress(topicId): UserProgress
updateProgress(topicId, isCorrect, mode): void
toggleBookmark(topicId): void
getStudySessions(): StudySession[]
saveStudySession(session): void
getBookmarks(): Bookmark[]
toggleQuestionBookmark(questionId): boolean
calcCorrectRate(topicId): number
calcCorrectRateByMode(topicId, mode): number | null
resetAllData(): void
getQuestionMastery(): MasteryMap
updateQuestionMastery(questionId, mode, isCorrect): void
getNoteUnderstanding(): NoteUnderstandingMap
setNoteUnderstanding(categoryId, sectionIndex, level | null): void
```

変更点:
- すべての内部キー定数を `nwsp:` → `pmap:` に変更
- `AnswerMode` は `'multiple-choice' | 'written'` のみ（公式午前IIは別系統 `morningRecords.ts` で扱う）
- `resetAllData` 内の追加キー削除リストを更新

### 5.2 `src/lib/importantMarks.ts` 🟢（新規）

```ts
const KEY = 'pmap:important_questions'

export function getImportantIds(): string[]
export function isImportant(questionId: string): boolean
export function toggleImportant(questionId: string): boolean   // 戻り値: 新状態
export function clearAllImportant(): void
export function clearImportantOfMode(prefix: 'q-' | 'om-'): void
```

QR同期対象。マージ戦略は後勝ち集合和（NWのbookmarkと同様）。

### 5.3 `src/lib/morningRecords.ts` 🟢（新規）

```ts
const RECORDS_KEY = 'pmap:morning:records'

export function loadMorningRecords(): MorningRecord[]
export function addMorningRecord(record: Omit<MorningRecord, 'id' | 'answeredAt'>): MorningRecord
export function getCorrectRateByYear(year: string): number    // 0〜100、未挑戦null
export function getCorrectRateOverall(): number
export function getRecentAttempts(questionId: string, limit?: number): MorningRecord[]
```

### 5.4 `src/lib/essay.ts` 🟢（新規）

```ts
const ATTEMPTS_KEY = 'pmap:essay:attempts'
const PLANS_KEY = 'pmap:essay:plans'
const ACTIVE_KEY = 'pmap:essay:active'

// Attempts
export function loadAttempts(): EssayAttempt[]
export function getAttemptsByProblem(problemId: string): EssayAttempt[]
export function getAttempt(id: string): EssayAttempt | null
export function saveAttempt(attempt: EssayAttempt): void
export function deleteAttempt(id: string): void

// Plans
export function loadPlans(): Record<string, string>
export function setPlan(problemId: string, date: string): void
export function removePlan(problemId: string): void

// Active session（離脱復帰用）
export function loadActive(): EssayActiveSession | null
export function saveActive(session: EssayActiveSession): void
export function clearActive(): void
export function elapsedSecOf(session: EssayActiveSession): number  // 一時停止/再開を考慮した経過秒
```

### 5.5 `src/lib/tracker.ts` 🟡（キーprefixのみ変更）

NW踏襲。`nwsp:tracker:*` → `pmap:tracker:*`。

### 5.6 `src/lib/gamification.ts` 🟡（XPルール拡張）

NWの計算式を踏襲しつつ、論述・公式午前II完了のXP加算ルールを追加:

```ts
export type XpEvent =
  | { type: 'quiz_correct', mode: 'multiple-choice' | 'written' }
  | { type: 'quiz_incorrect' }
  | { type: 'morning_correct' }
  | { type: 'morning_incorrect' }
  | { type: 'afternoon_session_complete', score: number, maxScore: number }
  | { type: 'essay_complete' }                         // 論述1回完了
  | { type: 'note_section_understood' }
```

XPテーブル（暫定値・実装時に微調整）:
| イベント | XP |
|---|---|
| `quiz_correct` mc | 10 |
| `quiz_correct` wr | 15 |
| `quiz_incorrect` | 2 |
| `morning_correct` | 12 |
| `morning_incorrect` | 2 |
| `afternoon_session_complete` | floor(score/maxScore × 100) |
| `essay_complete` | 200 |
| `note_section_understood` | 5 |

### 5.7 `src/lib/activityLog.ts` 🟡（イベント種別拡張）

NWのイベント種別に以下を追加:
```ts
type ActivityEventType =
  | 'quiz_session_complete'      // 既存
  | 'note_section_understood'    // 既存
  | 'afternoon_record'           // 既存
  | 'morning_session_complete'   // 🟢
  | 'essay_complete'             // 🟢
  | 'badge_unlocked'             // 既存
```

### 5.8 マイグレーション戦略 🟢（v0.9 で追加）

**E3対応**: 将来のスキーマ変更に備え、各LocalStorageキー名に **`_v1` バージョン記号**を含める。

#### 命名規約

```
pmap:<domain>:<entity>_v<n>

例:
pmap:answer_records_v1
pmap:user_progress_v2          ← NW踏襲（既にv2）
pmap:essay:attempts_v1
pmap:morning:records_v1
pmap:important_questions_v1
```

#### マイグレーション関数

```ts
// src/lib/migrations.ts 🟢（新規）
type Migrator = (oldData: unknown) => unknown

const MIGRATIONS: Record<string, { from: number; to: number; migrate: Migrator }[]> = {
  'pmap:essay:attempts': [
    // 例: v1 → v2 で新フィールド追加した場合
    // { from: 1, to: 2, migrate: (old) => ({ ...old, newField: defaultValue }) },
  ],
}

export function loadWithMigration<T>(domain: string, fallback: T): T {
  // 各バージョンキーを順に確認、最新まで自動マイグレーション
  // 詳細は detailed_design §3 で
}
```

#### 担当
- v1 命名規約適用: 🅧（F1-P0時の機械置換）
- migrations.ts 実装: 🅒（実装慎重）

### 5.9 静的データ検証スクリプト 🟢（v0.9 で追加）

**E5対応**: F2-P1 ノート投入・F2-P2 クイズ投入時のデータ品質保証。

#### 実装

```ts
// scripts/validate-static-data.ts 🟢（新規）
import { categories } from '../src/data/categories'
import { questions } from '../src/data/questions'
// import { NOTE_DB } from '../src/pages/NoteDetail'  // F2-P1完了後

function validate() {
  let errorCount = 0

  // 1. カテゴリID整合性
  const categoryIds = new Set(categories.map(c => c.id))
  for (const q of questions) {
    if (!categoryIds.has(q.topicId)) {
      console.error(`[NG] Question ${q.id} の topicId "${q.topicId}" が categories に存在しない`)
      errorCount++
    }
  }

  // 2. クイズ問題の choices に正解が含まれているか
  for (const q of questions) {
    if (!q.choices.includes(q.correctAnswer)) {
      console.error(`[NG] Question ${q.id} の choices に correctAnswer が含まれない`)
      errorCount++
    }
    if (q.choices.length !== 4) {
      console.error(`[NG] Question ${q.id} の choices が4個でない（${q.choices.length}個）`)
      errorCount++
    }
  }

  // 3. ノート構造化トークンの整合性（F2-P1後に有効化）
  // - EmphasisToken の style が 'red' | 'navy' | 'plain' のいずれか
  // - sectionIndex の重複なし

  if (errorCount === 0) {
    console.log('[OK] 全データの整合性確認完了')
  } else {
    console.error(`[NG] 計 ${errorCount} 件のエラー`)
    process.exit(1)
  }
}

validate()
```

#### 実行

```bash
npm run validate-data        # package.json scripts に追加
```

CIで `npm run build` 前に必ず実行する想定。

#### 担当
- 🅒（検証ロジック設計）+ 🅧（追加項目の実装）

### 5.10 `src/lib/sync/*` 🟡

NWの構造を踏襲。`adapters.ts` の同期対象キー一覧を更新:
- 追加: `pmap:important_questions`, `pmap:morning:records`, `pmap:essay:attempts`, `pmap:essay:plans`
- 除外: `pmap:essay:active`（端末ローカル状態のため同期対象外）

マージ戦略は配列キーは集合和、Mapキーは新しいタイムスタンプ優先（NW準拠）。

---

## 6. UI / ブランディング設計

### 6.1 カラーパレット（確定）

| 用途 | 色 | Tailwindクラス |
|---|---|---|
| ブランドプライマリ | `#9d5b8b` | `bg-brand`, `text-brand` |
| ブランドダーク（hover・focus・border） | `#7d4570` | `bg-brand-dark`, `text-brand-dark` |
| ブランドダーカー（強調テキスト） | `#5e3354` | `text-brand-darker` |
| ブランドライト（カード背景・タグ） | `#f5e9f1` | `bg-brand-light` |
| 成功 | Tailwind emerald-500/600 | NW踏襲 |
| 警告 | Tailwind amber-500/600 | NW踏襲 |
| エラー | Tailwind red-500/600 | NW踏襲 |
| 中立 | Tailwind slate-* | NW踏襲 |

> 採用案: 暫定推奨セット（A案）。プレビューは `color_samples.html` 参照。

### 6.2 Tailwind設定（`tailwind.config.js`）

```js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9d5b8b',
          light:   '#f5e9f1',  // カード背景・タグ・hover背景
          dark:    '#7d4570',  // hover・focus・border強調
          darker:  '#5e3354',  // 強調テキスト
        },
      },
    },
  },
}
```

NWの `bg-blue-*`, `text-blue-*` を `bg-brand`, `text-brand` 系へ機械的に置換可能。

### 6.3 ロゴ仕様（NW準拠）

- ロゴテキスト:
  ```
  PM
  Project Manager
  Learning App by MAMIYA
  ```
- 文字色: `#9d5b8b`、背景: 白
- ファイル: `public/pwa-192x192.png`（PWAアイコンと同一画像をUI内でも流用）+ `public/pwa-512x512.png` + `public/favicon.svg` + `public/favicon-32.png`
- 表示位置・サイズ（NW Layoutに準拠）:

| 表示箇所 | サイズ | Tailwindクラス | 備考 |
|---|---|---|---|
| `Layout.tsx` ヘッダ左 | 32×32px | `w-8 h-8 rounded-md` | `<img src="/pwa-192x192.png" />` |
| `Layout.tsx` サイドバー下部 | 24×24px | `w-6 h-6 rounded` | 縮小版 |
| ヘッダ高さ | 48px | `h-12` | NW踏襲 |
| `Login.tsx` 中央 | 96×96px 程度 | （正式版で決定） | 正式版のみ |

**NWアプリ同様、PWAアイコン画像をそのままUI内のロゴ表示に流用する**運用。専用のSVGロゴファイルは作らず、`public/pwa-*.png` を直接 `<img>` で参照する。

### 6.4 PWAアイコン仕様

**アプリロゴをそのまま流用**（専用アイコンは作らない）。UI内のロゴ表示・PWAアイコン・faviconすべて同一画像を共有。

| ファイル | サイズ | 用途 |
|---|---|---|
| `public/pwa-192x192.png` | 192×192 | PWAアイコン（標準）+ Layoutヘッダ・サイドバーのロゴ |
| `public/pwa-512x512.png` | 512×512 | PWAアイコン（高解像度）+ Loginロゴ |
| `public/favicon-32.png` | 32×32 | ブラウザタブfavicon |
| `public/favicon.svg` | ベクタ | 高DPIブラウザ用favicon |

#### アイコン生成手順（P0スキャフォールド時）
1. ロゴ用SVGを作成（3行テキスト、文字色 `#9d5b8b`、背景白、正方形ビューボックス、内側に10%程度のpadding）
2. `sharp`（NW依存に既に含まれる）でPNG生成
3. theme color `#9d5b8b` をmanifestに反映（§8.1）

### 6.5 共通コンポーネント

#### 6.5.1 `<ImportantToggle questionId={...} />` 🟢

- props: `questionId: string`, `size?: 'sm' | 'md'`
- 状態: `useState<boolean>(() => isImportant(questionId))` でフリッカー回避（v0.9 E6対応）
- `toggleImportant` 呼び出しで状態切替
- 表示: 星アイコン（lucide `Star` / `StarOff`）、ON時は`text-brand`

> **E6 対応（v0.9）**: 初期値を `useEffect` ではなく useState 初期化関数で同期取得することで、初回render時に「マーク済みなのに☆空」のフリッカーを防止する。

#### 6.5.2 `<EssayTimer />` 🟢
- 経過秒（HH:MM:SS）表示
- スタート / 一時停止 / 再開ボタン
- 内部状態は `requestAnimationFrame` または `setInterval(1s)` で更新
- 一時停止/再開は `EssayActiveSession.pausedAt` / `accumulatedSec` を更新

#### 6.5.3 `<EssayCharCounter text={...} min={...} max={...} />` 🟢
- 現在文字数 / 推奨レンジ表示
- 状態色: 推奨内 `text-emerald-600`、超過 `text-amber-600`、不足 `text-red-500`

#### 6.5.4 `<EssaySelfReview value={...} onChange={...} />` 🟢
- 5項目 × 5段階のラジオグループ
- 表示: 5つの☆を横に並べ、クリックで選択

#### 6.5.5 `<ImportantTutorialTooltip />` 🟢（v0.9 で追加）

**U5対応**: 重要マーク機能の発見性向上のための初回チュートリアル。

- props: なし（自己完結）
- 状態管理:
  - LocalStorage `pmap:tutorial:important_seen` を確認し、`true` なら何も表示しない
  - 未表示の場合、クイズ画面または公式午前II画面初回マウント時に1度だけ表示
- 表示: ☆ボタンの近くに矢印付きツールチップ
  ```
  ┌─────────────────────────┐
  │ ⭐ をタップで重要マーク │
  │ 後でまとめて復習できます │
  │ [OK・閉じる]            │
  └─────────────────────────┘
            ↓
        ☆ボタン
  ```
- 「OK・閉じる」タップで `pmap:tutorial:important_seen = 'true'` を保存
- 設定画面に「チュートリアルをリセット」ボタンも用意（再表示要望対応）

#### 担当
- 🅒（新規ページ判断あり） + 🅧（実装はテンプレ的）

---

## 7. 認証設計（F01）🟡

### 7.1 開発版（当面のフェーズ）

- **ログイン画面・認証ガードを無効化**
- アプリ起動 → トップページ（`/`）を直接表示
- `App.tsx` のルート構成は `<Route path="/login" />` を登録せず、Layoutも `AuthGuard` でラップしない
- `pmap:auth:session` キーは使用しない
- `Login.tsx` / `AuthGuard.tsx` / `useAuth.ts` / `credentials.ts` / `hash.ts` の**コードは残置**（削除しない）

#### 開発版の `App.tsx` ルート構成（参考）
```tsx
<BrowserRouter>
  <Routes>
    {/* 没入型画面（Layout なし） */}
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/morning/session" element={<OfficialMorningSession />} />
    <Route path="/morning/summary" element={<OfficialMorningSummary />} />

    {/* Layout 付き画面 */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/morning" element={<OfficialMorningQuiz />} />   {/* 公式午前II トップ */}
      {/* ...他の各画面のRoute... */}
    </Route>
  </Routes>
</BrowserRouter>
```

### 7.2 正式版（リリース時に復活）

NW準拠:
- 共有パスワードのSHA256ハッシュを `src/auth/credentials.ts` に静的に保持
- ログイン成功時 `pmap:auth:session = { authedAt: ISO8601 }` 保存
- `AuthGuard` が `pmap:auth:session` 存在で認証済み判定
- セッション有効期限はNWと同じ
- パスワードは `hash.ts` でハッシュ生成→`credentials.ts`に貼り付け

#### 復活時の作業（P9で実施）
1. `App.tsx` に `<Route path="/login" element={<Login />} />` を再登録
2. Layoutおよび没入型画面のRouteを `<AuthGuard>` でラップ
3. `Login.tsx` のロゴ・配色がベースカラーで仕上がっているか最終確認
4. 共有パスワードを確定し、ハッシュを `credentials.ts` に投入

---

## 8. PWA設計

### 8.1 manifest（vite.config.ts）

```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'PM Learning App',
    short_name: 'PM Learn',
    description: 'プロジェクトマネージャ試験 学習アプリ',
    theme_color: '#9d5b8b',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: { /* NW踏襲 */ },
})
```

### 8.2 オフライン

- 静的アセット・JSバンドル・問題データはService Workerでキャッシュ → オフライン全画面動作
- LocalStorageは元々オフライン動作
- 例外: PDFリンク（IPA公式PDF）はオンラインのみ

---

## 9. デバイス同期設計（F19）🔵

NWの実装をそのまま踏襲。同期対象キーリストのみPM用に更新（§5.8）。
- ペイロード形式: NW踏襲（lz-string圧縮 → QRコード分割）
- マージ戦略: NW踏襲

---

## 10. 非機能設計

### 10.1 パフォーマンス

- 初期バンドルサイズ目標: 1MB以下（NW実績程度）
- ノートは非同期コード分割は行わない（NW踏襲、データ量が大きい場合P9で再検討）
- LocalStorage I/O は同期APIだがアプリ規模では問題にならない

### 10.2 セキュリティ

| 観点 | 対策 |
|---|---|
| 認証 | 共有パスワードハッシュ。学習用途であり厳格認証は要件外 |
| 機密データ | LocalStorageに学習履歴のみ。PII相当なし |
| XSS | NoteDetailの本文を文字列＋構造化トークンで管理（NW準拠）。`dangerouslySetInnerHTML` は使用しない |
| QR同期 | 圧縮ペイロードのみ、暗号化なし（端末間ローカル運用前提） |
| デプロイ | Vercel HTTPS強制 |

### 10.3 エラー処理方針

- LocalStorageアクセスは try-catch 包囲、JSON parse失敗時はfallbackを返す（NWの`load<T>`関数を踏襲）
- 静的データの読み込み失敗は基本的に発生しない（バンドル時に解決）
- ネットワーク接続要否: 初回読み込み・PWA更新・PDFリンク以外は不要

### 10.4 ログ

- ブラウザconsoleに`console.error`のみ（NW踏襲）
- 外部送信なし

---

## 11. 移行・初期化

### 11.1 新規アプリのため移行不要

PMアプリは新規。既存ユーザのデータ移行はない。

### 11.2 ストレージ初期化

- 初回起動時、各キーは存在しない状態。各 `load*` 関数のfallbackで空配列・空オブジェクトを返す
- 設定画面の「すべてのデータをリセット」で全 `pmap:*` キーを削除

---

## 12. 制約・前提

| 区分 | 内容 |
|---|---|
| ブラウザ要件 | LocalStorage 5MB上限。論述本文を多数保存しても収まる範囲を想定（1Attempt平均6KB × 100Attempts = 600KB程度） |
| IPA著作権 | 公式問題の引用はあくまで個人学習用途。公開デプロイ時は出典明記（§4.4.3）と利用範囲の最終確認をユーザに委ねる |
| ロゴ | "Manager" 表記で確定 |
| 試験範囲 | PMBOK第7版＋IPA PMシラバスの守備範囲。試験変更があった場合カテゴリ追加で対応 |

---

## 13. 後続フェーズへの引き継ぎ

### 13.1 詳細設計で扱うもの
- 各画面のフルレイアウト（モバイル/デスクトップそれぞれ）
- 各コンポーネントのprops契約・状態管理の詳細
- バッジ条件の最終リスト（NW477行のコピー → PM用再設計）
- XPテーブルの最終値
- ノート本文・クイズ問題・公式午前II問題・午後I/II データの**コンテンツ作成計画**（範囲・参考文献）

### 13.2 確認事項

#### 確定済み（v0.3）
- [x] ロゴ綴り = "Project Manager"
- [x] PWAアイコン制作方針 = アプリロゴをそのまま流用（§6.4）
- [x] ログイン画面 = 開発版では未使用、正式版でNW準拠の認証を復活（§7.1, §7.2）
- [x] ブランドカラーパレット（§6.1）= 暫定推奨セット（A案）で確定
  - DEFAULT `#9d5b8b` / dark `#7d4570` / darker `#5e3354` / light `#f5e9f1`
- [x] ロゴ表示サイズ = NW準拠（ヘッダ32px / サイドバー24px / ヘッダ高48px、§6.3）
- [x] Vercelデプロイ先URL = `mamiya-pmapp.vercel.app`（準備中、§1.0）

#### 正式版リリース時
- [ ] Login画面パスワードの確定とハッシュ投入
- [ ] Login画面のロゴ表示サイズ（暫定96×96px、最終決定はリリース直前）
- [ ] `App.tsx` のルート構成を認証付きに復元（§7.2 復活手順）
- [ ] `pmap:auth:session` キーの動作確認

---

## 14. 用語

| 用語 | 定義 |
|---|---|
| 没入型画面 | サイドバー非表示でコンテンツに集中させる画面（NWの命名踏襲） |
| アクティブセッション | 練習中で未保存の状態。離脱しても復帰可能 |
| 重要マーク | ユーザが任意の問題に手動で付与するブックマーク的フラグ |
| morning | 公式午前II モード（コードの内部識別子として使用） |
| essay | 論述トレーニング モード（コードの内部識別子として使用） |
