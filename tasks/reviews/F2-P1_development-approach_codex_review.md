# レビュー: F2-P1 development-approach ノート構造レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: 228ae26
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB['development-approach']` の構造・型・インデント・ビルドは問題なし。明確なマークアップ規約違反 1 件（全角イコール）を `NOTE_DB['development-approach']` 内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P1_development-approach_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB['development-approach']` 内のみ。stakeholder / team は未編集。
- セクション数: ○ `sections` は 32 要素、heading は `1. ` 〜 `32. ` の連番。
- exam_tips: ○ 10 要素で非空。
- summary: ○ 非空。
- カテゴリキー: ○ `development-approach`。`src/data/categories.ts` の `id: 'development-approach'`, `name: '開発アプローチ'` と一致。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 3件 (stakeholder, team, development-approach)` と `[OK] 全データの整合性確認完了` を確認。
- diff check: ○ `git diff --check` 成功。Git の LF→CRLF 予告のみで、空白エラーはなし。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ `stakeholder`, `team`, `development-approach` の3件。
- LocalStorageキー / brandカラー / `pmap:` prefix: ○ 変更なし。
- 他カテゴリ: ○ diff上、stakeholder / team への変更なし。

### インデント整合性
- 全角スペースインデント: ○ 包含関係のある子項目は全角スペース `　` で表現。
- 半角スペース / タブ混入: ○ 検出なし。
- 最大階層: ○ 深さ2以内。§18 / §19 / §20 の3層構造は孫レベル2で表現。
- 親見出し直後: ○ `:` / `：` で終わる親項目の直後に同階層の子項目が続く箇所は 0 件。
- 指定セクション: ○ §2, §5, §9, §10, §12, §18, §19, §20, §21, §23, §24, §25, §26, §27, §29, §30 は親子関係の全角インデントを確認。
- 直接列挙セクション: ○ §16 / §31 / §32 はセクション見出し直下の直接列挙として整合し、半角インデントや階層崩れなし。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- `===` / `___` / `====` / `____`: ○ 0件。
- 全角イコール `＝`: ○ 修正後 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。
- `navyItems` token text 内マークアップ: ○ `==` / `__` 残存なし。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- アジャイル / スクラム: ○ 基本表記は日本語で統一。`Scrum Guide` / `Scrum@Scale` / 英語正式名併記は意図的なものとして確認。
- プロダクトオーナー: ○ 「プロダクト・オーナー」なし。
- スクラムマスター: ○ 「スクラム・マスター」なし。
- ウォーターフォール: ○ 「ウォータフォール」なし。
- ライフサイクル: ○ 「ライフ・サイクル」なし。
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` を確認。`PMBOK 第6版` 等の空白入り表記なし。
- スクラムイベント英語名: ○ `Sprint Planning` / `Daily Scrum` / `Sprint Review` / `Sprint Retrospective` を確認。
- アジャイル手法 / スケーリング: ○ `XP`, `Scrum`, `FDD`, `DSDM`, `Crystal`, `Lean`, `Kanban`, `SAFe`, `LeSS`, `Nexus`, `Scrum@Scale`, `DAD` を確認。

### PMBOK第6版／第7版 統合確認
- §3: ○ `PMBOK第7版「開発アプローチとライフサイクル」パフォーマンス領域` を明示。
- §4: ○ `PMBOK第6版とアジャイル実務ガイドの関係` を明示し、アジャイル実務ガイドの位置づけを説明。
- §32: ○ `PMBOK6 vs PMBOK7` の混同をひっかけパターンとして明記。
- navyItems: ○ 第6版/第7版/アジャイル実務ガイド/IPA/関連一次資料の出典補足を構造化 token で記載。token text 内マークアップなし。
- 赤字キーワード: ○ 予測型/適応型、スクラム役割・イベント・成果物、INVEST、WIP制限など試験頻出語に付与されている。

### 動作確認
- git pull: ○ `Already up to date.`
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし

### 改善推奨
- なし

## Codexによる追加修正
- `src/pages/NoteDetail.tsx:1972`: `反復＝洗練、漸進＝積み上げ` の全角イコールを避け、`反復は洗練、漸進は積み上げ` に変更。内容解釈は変えず、`docs/note_markup_rules.md` §3.3 / §6 の全角イコール禁止に合わせた。

## 次のタスクへの教訓
- `navyItems` は `renderTokens` で描画されるため、`items` の文字列マークアップ検査とは別に token style と token text を検査すると安全。
- 全角イコールは試験対比の短文に入りやすいので、F2-P1 の残カテゴリでも `＝` を明示的に検査する。
