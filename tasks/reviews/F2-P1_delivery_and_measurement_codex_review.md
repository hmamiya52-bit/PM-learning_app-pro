# レビュー: F2-P1 delivery + measurement 統合レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: 62abce4
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB.delivery` / `NOTE_DB.measurement` の構造・型・ビルドは問題なし。明確なマークアップ規約違反 8 件とインデント深度違反 1 件を対象2カテゴリ内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P1_delivery_and_measurement_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB.delivery` / `NOTE_DB.measurement` 内のみ。既存5カテゴリおよび後続カテゴリは未編集。
- delivery: ○ `sections` は 29 要素、heading は `1. ` 〜 `29. ` の連番、`exam_tips` は 10 要素で非空。
- measurement: ○ `sections` は 24 要素、heading は `1. ` 〜 `24. ` の連番、`exam_tips` は 10 要素で非空。
- カテゴリキー: ○ `delivery` / `measurement`。`src/data/categories.ts` の `name: 'デリバリー'` / `name: '測定'` と一致。
- カテゴリ数: ○ 現在の main では後続 `uncertainty` / `integration` も投入済みのため、`validate-data` は指示書作成時の7件ではなく9件を表示。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 9件 (stakeholder, team, development-approach, planning, project-work, delivery, measurement, uncertainty, integration)` と `[OK] 全データの整合性確認完了` を確認。
- diff check: ○ `git diff --check` 成功。Git の LF→CRLF 予告のみで、空白エラーはなし。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ 9件。delivery / measurement 以外のカテゴリに差分なし。
- LocalStorageキー / brandカラー / `pmap:` prefix: ○ 変更なし。
- F2-figures: ○ `figures` フィールドや図表基盤には未介入。

### インデント整合性
- 全角スペースインデント: ○ 包含関係のある子項目は全角スペース `　` で表現。
- 半角スペース / タブ混入: ○ 検出なし。
- 最大階層: ○ 修正後、深さ2以内。
- 親見出し直後: ○ `:` / `：` で終わる親項目の直後に同階層の子項目が続く箇所は 0 件。
- delivery指定セクション: ○ §3, §7-10, §12-19, §21-23, §28-29 を確認。
- measurement指定セクション: ○ §2, §4-8, §11-13, §17-18, §23-24 を確認。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- 指示書範囲 L3050-L4090 の奇数行検査: ○ 0件。
- `===` / `___` / `====` / `____`: ○ 修正後 0件。
- 全角イコール `＝`: ○ 修正後 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。
- `navyItems` token text 内マークアップ: ○ `==` / `__` 残存なし。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` を確認。空白入り表記なし。
- delivery固有: ○ 7QC道具、新7QC道具、`DMAIC` / `DMADV` / `PDCA` / `PDSA`、`ISO 9001:2015`、`DoD` / `TDD` / `BDD` / `UAT` / `CSAT` / `NPS` を確認。
- measurement固有: ○ `PV` / `EV` / `AC` / `BAC` / `CV` / `SV` / `CPI` / `SPI` / `EAC` / `ETC` / `VAC` / `TCPI` / `ES` を確認。
- measurement固有: ○ 「アーンドバリュー」「アーンドスケジュール」「バーンダウン」「バーンアップ」「リードタイム」「サイクルタイム」「スループット」「ベロシティ」「リトルの法則」を確認。

### PMBOK第6版／第7版 統合確認
- delivery §3 / §29: ○ PMBOK第6版 第8章と PMBOK第7版「デリバリー」パフォーマンス領域の対応を明示。
- measurement §1 / §24: ○ PMBOK第6版 EVM/監視領域と PMBOK第7版「測定」パフォーマンス領域の対応を明示。
- navyItems: ○ 第6版/第7版/関連参照が token text 内に通常文字列として記載され、マークアップ混入なし。
- 相互参照: ○ delivery §6 → planning §6、delivery §22 → development-approach §30、measurement §11 → development-approach §22、measurement §19 → planning §24、measurement §20 → project-work §18 を確認。

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
- `src/pages/NoteDetail.tsx:3354`: `==±2σ===95.45%` / `==±3σ===99.73%` を `==±2σ==は95.45%` / `==±3σ==は99.73%` に変更。
- `src/pages/NoteDetail.tsx:3564`: `==±3σ===99.73%` を `==±3σ==は99.73%` に変更。
- `src/pages/NoteDetail.tsx:3583`: `==6σ===3.4不良/百万` / `==3σ===99.7%適合` を `==6σ==は...` / `==3σ==は...` に変更。
- `src/pages/NoteDetail.tsx:3593` / `src/pages/NoteDetail.tsx:3594`: exam_tips 内の `6σ===...` / `3σ管理===...` を文章化。
- `src/pages/NoteDetail.tsx:3597`: `==UAT==＝...` の全角イコールを避け、`==UAT==は...` に変更。
- `src/pages/NoteDetail.tsx:3730`: measurement §7 の深さ3インデントを深さ2へ修正。
- `src/pages/NoteDetail.tsx:3812`: `==水平===...` / `==上昇===...` を `==水平==は...` / `==上昇==は...` に変更。
- `src/pages/NoteDetail.tsx:4053`: `==±3σ===99.73%` を `==±3σ==は99.73%` に変更。

## 次のタスクへの教訓
- 数式や統計値の `=` を赤字マークアップ直後に置くと `===` になりやすい。強調語句の直後は「は」や「:」で文章化すると安定する。
- インデントは全角スペース個数を AST で集計すると、見た目で紛れやすい深さ3の混入を拾いやすい。
