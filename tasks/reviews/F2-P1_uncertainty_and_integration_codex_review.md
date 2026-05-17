# レビュー: F2-P1 uncertainty + integration 統合レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: 866fada
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB.uncertainty` / `NOTE_DB.integration` の構造・型・ビルドは問題なし。`uncertainty` は修正不要、`integration` の明確な全角イコール 2 件とインデント不整合 1 件を対象カテゴリ内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P1_uncertainty_and_integration_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB.integration` 内のみ。既存7カテゴリおよび `NOTE_DB.uncertainty` は未編集。
- uncertainty: ○ `sections` は 27 要素、heading は `1. ` 〜 `27. ` の連番、`exam_tips` は 10 要素で非空。
- integration: ○ `sections` は 24 要素、heading は `1. ` 〜 `24. ` の連番、`exam_tips` は 10 要素で非空。
- カテゴリキー: ○ `uncertainty` / `integration`。`src/data/categories.ts` の `name: '不確かさ・リスク'` / `name: '統合・変更管理'` と一致。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 9件 (stakeholder, team, development-approach, planning, project-work, delivery, measurement, uncertainty, integration)` と `[OK] 全データの整合性確認完了` を確認。
- diff check: ○ `git diff --check` 成功。Git の LF→CRLF 予告のみで、空白エラーはなし。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ 9件。integration 以外のカテゴリに差分なし。
- LocalStorageキー / brandカラー / `pmap:` prefix: ○ 変更なし。
- F2-figures / F2-P3 OCR: ○ 未介入。

### インデント整合性
- 全角スペースインデント: ○ 包含関係のある子項目は全角スペース `　` で表現。
- 半角スペース / タブ混入: ○ 検出なし。
- 最大階層: ○ 深さ2以内。
- 親見出し直後: ○ `:` / `：` で終わる親項目の直後に同階層の子項目が続く箇所は修正後 0 件。
- uncertainty指定セクション: ○ §3, §4, §5, §6, §7, §9, §13, §14, §17, §20, §26, §27 を確認。
- integration指定セクション: ○ §2, §5, §13, §14, §15, §17, §19, §23, §24 を確認。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- 指示書範囲 L4089-L5150 の奇数行検査: ○ 0件。
- `===` / `___` / `====` / `____`: ○ 0件。
- 全角イコール `＝`: ○ 修正後 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。
- `navyItems` token text 内マークアップ: ○ `==` / `__` 残存なし。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- uncertainty固有: ○ 脅威5戦略、機会5戦略、`EMV`, `RBS`, `PESTLE`, `TECOP`, `VUCA`, 「モンテカルロ」「トルネード図」「リスク選好」「リスク許容度」「リスク・スレッショルド」を確認。
- integration固有: ○ PMBOK 4.1〜4.7 プロセス名、`CCB`、ベースライン、是正処置、予防処置、欠陥修正、構成項目、構成管理、セマンティック・バージョニング、Git Flow、GitHub Flow を確認。
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` を確認。空白入り表記なし。
- 禁止/揺れ候補: ○ 「モンテ・カルロ」「トルネードチャート」「ベース・ライン」なし。

### PMBOK第6版／第7版 統合確認
- uncertainty §1 / §3 / §24 / §27: ○ PMBOK第6版 第11章と PMBOK第7版「不確かさ」パフォーマンス領域の対応を明示。
- integration §1 / §3 / §24: ○ PMBOK第6版 第4章と PMBOK第7版で独立領域が消滅し横断概念化している点を明示。
- navyItems: ○ 第6版/第7版/関連参照が token text 内に通常文字列として記載され、マークアップ混入なし。
- 相互参照: ○ uncertainty §6 → planning §25、integration §11 → measurement §4-8、integration §21 → delivery §26、integration §9 / §22 → project-work §5 / §21 を確認。

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
- `src/pages/NoteDetail.tsx:4922` 〜 `src/pages/NoteDetail.tsx:4927`: integration §14 の変更要求書記載項目を、親項目 `変更要求書の主要記載項目:` の配下として全角2スペースに階層化。
- `src/pages/NoteDetail.tsx:5119`: `変更管理＝プロセス／構成管理＝成果物のバージョン` の全角イコールを避け、`変更管理はプロセス／構成管理は成果物のバージョン` に変更。
- `src/pages/NoteDetail.tsx:5139`: exam_tips 内の `変更管理＝プロセス、構成管理＝成果物` を `変更管理はプロセス、構成管理は成果物` に変更。

## 次のタスクへの教訓
- `:` で終わる子レベル項目の下にさらに列挙を置く場合、孫レベル（全角2スペース）まで落とす必要がある。
- 「A＝B」型の短い対比はひっかけ文で入りやすいため、全角イコール検査は exam_tips まで含めて実施する。
