# Codex 向け プロジェクト・ブリーフィング

> このファイルは、Codex セッション開始時に**毎回読み込む**必読ドキュメントです。
> Claude が事前に作成した設計書を Codex が安全に実装できるよう、運用ルール・指示書フォーマット・レビュー前提をまとめています。

---

## 📌 あなた（Codex）の役割

PM試験対策学習アプリ「PM Learning App」開発における **下請け実装担当**。
プロジェクト全体は Claude が中核を担い、あなた（Codex）は機械的・反復的な実装作業を担当します。

### 担当する作業
- ✅ 仕様が明確に書かれた**新規ファイルの作成**（コード全文または明確なテンプレが指示書にある）
- ✅ Mechanical置換（grep/sed/全置換）
- ✅ 静的データファイル投入（categories.ts, types追加など）
- ✅ App.tsx へのRoute追記など追加だけの変更
- ✅ 単純なJSXコンポーネント（props/state少、表示中心）

### 担当しない作業（Claudeが担当）
- ❌ 既存大規模ファイルの部分改修（NoteDetail.tsx等）
- ❌ ロジックを伴うlibモジュール（タイマー、active session管理）
- ❌ 状態遷移が複雑なページ（Quiz, EssayTraining, OfficialMorningSession）
- ❌ コンテンツ生成（ノート本文、クイズ問題、独自解説）

---

## 🎯 プロジェクト概要

| 項目 | 値 |
|---|---|
| プロジェクト名 | PM Learning App |
| GitHub | https://github.com/hmamiya52-bit/PM-learning_app-pro |
| ローカル | `D:\Claude\PMpro\PM-learning_app-pro\` |
| Vercel | `https://mamiya-pmapp.vercel.app/`（準備中） |
| ベースアプリ | NW-learning_app-pro v1.3（`D:\Claude\PMpro\NW-learning_app-pro\`） |
| 技術スタック | React 19 + TypeScript + Vite 8 + Tailwind v3 + PWA |
| 対象ユーザ | 実務経験の浅いインフラエンジニア（PM試験受験者） |

---

## 📚 必読ドキュメント（順番に読む）

セッション開始時に以下の順で読み込み、プロジェクト方針を把握してください。

### 1. 本書（CODEX_BRIEFING.md）
あなたへの指示書。**毎セッション最初に読む**。

### 2. IMPLEMENTATION_KICKOFF.md
実装着手前の1ページチェック。プロジェクト全体像と必須ルール。

### 3. requirements.md（v0.5以上）
要件定義書。**スコープ外の作業を絶対しない**ためのリファレンス。

### 4. basic_design.md（v0.9以上）
基本設計書。**API契約・型定義・LocalStorageスキーマ**を把握。

### 5. detailed_design.md（v0.14以上）
詳細設計書。**実装手順・コードサンプル**が記載。**指示書はここを参照する**。
特に重要な章:
- §1.4 Claude/Codex役割分担
- §1.5 Git ワークフロー
- §2 各実装フェーズ（F1-P-1 〜 F2-P7）
- 付録A: Codex作業指示書テンプレート（あなたが受け取る形式）
- 付録B: Claude レビュー観点（あなたの作業がどうレビューされるか）

### 6. wbs.html
作業分解構造。**現在どのタスクを実施中か**を把握。ブラウザで開いて参照。

### 7. memory/risks.md
リスクレジスタ。著作権・データ消失・PMBOK改訂等のリスク認識。

---

## 🔄 セッション開始時の必須手順

```bash
# 1. プロジェクトディレクトリへ
cd D:/Claude/PMpro/PM-learning_app-pro

# 2. 最新を取り込む（必ず実行）
git pull origin main

# 3. 現在のタスクを確認
ls tasks/codex/       # 未着手の指示書をチェック
ls tasks/questions/   # 自分が以前残した質問への回答が来ているか確認

# 4. 指示書を読む
cat tasks/codex/<task-id>.md
```

---

## 📋 タスク受け取り方

### 指示書の場所
`tasks/codex/<task-id>_<short-desc>.md`

例:
- `tasks/codex/F1-P0_step02_delete_files.md`
- `tasks/codex/F1-P1_categories.md`

### 指示書フォーマット（あなたが受け取る）
詳細は `detailed_design.md` 付録A を参照。各指示書には以下9セクションが含まれる:

1. はじめに（毎回必ず読むこと）
2. 作業概要
3. 前提
4. 入力ファイル（読むだけ）
5. 出力ファイル（作成・編集対象）
6. 作業手順（コマンド・コード片提示）
7. 完了条件（DoD）
8. 注意事項・禁止事項
9. 完了後のgit操作

### 指示書を読んで作業
- **指示書の範囲外のファイルは絶対に編集しない**
- コマンド・コード片はそのまま使用OK（指示書は実装可能な状態で渡される）
- 不明点があれば**自己判断せず**、§「不明点が出たら」参照

---

## ✅ 完了後の手順

```bash
# 1. 変更ファイルを確認
git status

# 2. 該当ファイルを明示的に add（git add -A は使わない）
git add <変更ファイル1> <変更ファイル2> ...

# 3. コミット（prefix [X] 必須）
git commit -m "[X] <タスクID> <短い内容>"

# 例:
# git commit -m "[X] F1-P1 populate categories.ts with 12 PM categories"

# 4. push
git push origin main
```

### コミットメッセージprefix一覧
| Prefix | 意味 |
|---|---|
| **`[X]`** | **あなた（Codex）が使う** |
| `[C]` | Claude単独実装（あなたは使わない） |
| `[Review]` | Claude のレビュー後修正（あなたは使わない） |
| `[Doc]` | ドキュメント更新（指示書による） |
| `[Fix]` | バグ修正（指示書による） |

---

## ❓ 不明点が出たら

**自己判断せず**、以下のフォーマットでファイルを作成して push:

```bash
# ファイル作成
cat > tasks/questions/<task-id>.md << 'EOF'
# 質問: <タスクID>

## Codex（私）からの質問
- Q1: <質問1>
- Q2: <質問2>

## 試そうとした内容
- <調べたこと・推測>

## Claude からの回答（Claudeが後で追記）
- A1:
- A2:
EOF

# add → commit → push
git add tasks/questions/<task-id>.md
git commit -m "[X] <タスクID> question raised"
git push origin main
```

**実装はそこで停止し、次の Claude セッションで回答を待つ。**

---

## ⚠️ 絶対に守る禁止事項

### 1. ターン制ルール
- Claude セッションと **絶対に同時に作業しない**（ローカル編集衝突を避ける）
- セッション開始時 `git pull origin main` を必ず実行
- セッション終了時 `git push origin main` を必ず実行

### 2. 範囲遵守
- ❌ **指示書外のファイルを編集しない**
- ❌ **`npm install` で新規パッケージを追加しない**（既存依存のみ使用、必要時は質問機構へ）
- ❌ **既存コードの大規模リファクタリングは禁止**（指示書の範囲だけ変更）
- ❌ **`git push --force` 禁止**

### 3. データ・秘密情報
- ❌ APIキー・パスワード・秘密情報をハードコードしない
- ❌ `.env` ファイルをコミットしない
- ❌ `dangerouslySetInnerHTML` 等の危険APIを使わない

### 4. コミット作法
- `git add <ファイル名>` で**明示的に**add（`git add -A` は使わない）
- コミットメッセージは prefix `[X]` から開始
- 1コミット1関心事（複数タスクをまとめない）

---

## 🧪 動作確認（DoD = Definition of Done）

各指示書には「完了条件」セクションがあります。**全項目を目視で確認してから commit**:

```bash
# 例: F1-P0 完了時
npm run build              # エラーなしで完了
npm run dev                # localhost:5173 で表示確認
# DevTools → Application → Local Storage で pmap: prefix 確認
```

完了条件を満たさない場合、未完了状態としてコミットせず、**質問機構**へエスカレーション。

---

## 🔬 Claude によるレビュー

あなたの `[X]` commit 後、Claude が**必ずレビューセッション**を開きます。
レビューは `tasks/reviews/<task-id>_review.md` に記録されます。

レビュー観点（`detailed_design.md` 付録B 参照）:
1. **仕様適合**: 完了条件を満たすか、範囲外を編集していないか
2. **コード品質**: 型エラー・ESLintエラーがないか、命名規約準拠か
3. **既存コードとの整合**: importパス・型重複・LocalStorageキー prefix
4. **動作確認**: `npm run dev` で起動・該当画面が正しく表示
5. **セキュリティ**: 秘密情報のハードコードがないか

#### レビュー結果
- 🟢 **PASS**: 修正不要、次タスクへ
- 🟡 **PASS with fixes**: Claude が `[Review]` prefix で軽微修正を追加
- 🔴 **RESTART**: 指示書を改訂して再依頼

---

## 🛠 実装フェーズの全体フロー

```
F1-P-1（NW精読）← Claude
   ↓
F1-P0（スキャフォールド）← 14ステップ、Codex/Claude混在
   ↓
F1-P1〜P6 ← Codex/Claude混在
   ↓ ===== フェーズ1完了 =====
F1.5-P1〜P6（パイロット運用、1〜2週間）
   ↓ ===== フェーズ1.5完了、Go/No-Go =====
F2-P1〜P7（残コンテンツ投入＋正式版）
   ↓
v1.0.0 リリース
```

各タスクの担当（Codex/Claude/協業）は `wbs.html` または `detailed_design.md` §2 を参照。

---

## 📂 ディレクトリ構成

```
D:\Claude\PMpro\PM-learning_app-pro\
├── CODEX_BRIEFING.md                ← 本書（あなたが毎回読む）
├── IMPLEMENTATION_KICKOFF.md        ← 着手前チェック
├── requirements.md                  ← 要件定義
├── basic_design.md                  ← 基本設計
├── detailed_design.md               ← 詳細設計（最重要）
├── wbs.html                         ← 作業分解構造
├── color_samples.html               ← カラーサンプル
├── tasks/
│   ├── codex/                       ← Claude がここに指示書を置く（あなたが読む）
│   ├── reviews/                     ← Claude のレビュー記録
│   ├── questions/                   ← あなたが質問を置く場所
│   └── nw-readthrough.md           ← NW実装精読メモ（F1-P-1完了後）
├── src/                             ← 実装対象（F1-P0以降に発生）
├── public/
└── (NW-learning_app-pro/) は別ディレクトリ
```

---

## 🚦 トラブル時の対応

| 状況 | 対応 |
|---|---|
| `git pull` で衝突 | `git pull --rebase origin main` で解消、不可なら質問機構へ |
| `npm install` 失敗 | エラーログを `tasks/questions/` に貼って質問 |
| 指示書の手順通りに動かない | 自己判断せず質問機構へ。「やってみたが◯◯エラー」も書く |
| 指示書の範囲外を変更したい | 必ず質問機構経由で Claude に確認 |
| 完了条件の一部だけ満たせない | コミットせずに質問機構へ |

---

## ✨ 起動時プロンプト（コピペ用）

ユーザがあなた（Codex）のセッション開始時に、以下のプロンプトをコピペして渡します:

```
PM Learning App プロジェクトの Codex 担当を引き受けてください。

【セッション開始時の手順】
1. cd D:/Claude/PMpro/PM-learning_app-pro
2. git pull origin main
3. CODEX_BRIEFING.md を読む（必読）
4. tasks/codex/ に未着手の指示書がないか確認
5. tasks/questions/ に Claude からの回答が来ていないか確認

【担当タスク】
（ここに今回のタスクID、または「最新の指示書を実施」と記載）

【絶対に守ること】
- ターン制（Claude と同時編集禁止）
- 指示書の範囲外を編集しない
- 不明点は自己判断せず tasks/questions/ に記録
- コミット prefix は [X]
- 完了したら git push まで実施

詳細は CODEX_BRIEFING.md と detailed_design.md 付録A 参照。
```

---

## 📝 補足

### バージョン管理
- ドキュメントのバージョンは v0.5（requirements） / v0.9（basic）/ v0.14（detailed）以上を確認
- バージョンが古い場合は `git pull` で最新化

### 環境
- Windows 10、Git Bash推奨
- Node.js v24以降、npm v11以降
- Vercel CLI（F1-P6で必要）

### 連絡経路
- Claude への質問: `tasks/questions/<task-id>.md`
- ユーザへの報告: コミットメッセージで簡潔に。緊急時はチャット経由

---

> **このドキュメントは Codex セッションの土台です。**
> 不明点があれば必ず質問機構を使い、推測で実装を進めないでください。
