# レビュー: F2-P1 planning + project-work 統合レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: 28fb5fc
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB.planning` / `NOTE_DB['project-work']` の構造・型・ビルドは問題なし。明確なマークアップ規約違反、インデント不整合、仕様上の軽微な欠落を対象2カテゴリ内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P1_planning_and_project-work_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB.planning` / `NOTE_DB['project-work']` 内のみ。stakeholder / team / development-approach は未編集。
- planning: ○ `sections` は 33 要素、heading は `1. ` 〜 `33. ` の連番、`exam_tips` は 10 要素で非空。
- project-work: ○ `sections` は 27 要素、heading は `1. ` 〜 `27. ` の連番、`exam_tips` は 10 要素で非空。
- カテゴリキー: ○ `planning` / `project-work`。`src/data/categories.ts` の `name: '計画'` / `name: 'プロジェクト作業'` と一致。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 5件 (stakeholder, team, development-approach, planning, project-work)` と `[OK] 全データの整合性確認完了` を確認。
- diff check: ○ `git diff --check` 成功。Git の LF→CRLF 予告のみで、空白エラーはなし。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ `stakeholder`, `team`, `development-approach`, `planning`, `project-work` の5件。
- LocalStorageキー / brandカラー / `pmap:` prefix: ○ 変更なし。
- 他カテゴリ: ○ diff上、既存3カテゴリへの変更なし。

### インデント整合性
- 全角スペースインデント: ○ 包含関係のある子項目は全角スペース `　` で表現。
- 半角スペース / タブ混入: ○ 検出なし。
- 最大階層: ○ 深さ2以内。project-work §2 / §17 / §23 / §24 の3層構造も孫レベル2で表現。
- 親見出し直後: ○ `:` / `：` で終わる親項目の直後に同階層の子項目が続く箇所は修正後 0 件。
- planning指定セクション: ○ §2, §6, §9, §10, §15, §16, §17, §20, §22, §23, §24, §28, §32, §33 を確認。§2 はサブシディアリー10件。
- project-work指定セクション: ○ §2, §9, §10, §11, §12, §13, §14, §15, §17, §18, §20, §23, §24, §25, §26, §27 を確認。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- 指示書範囲 L1998-L3046 の奇数行検査: ○ 0件。
- `===` / `___` / `====` / `____`: ○ 0件。
- 全角イコール `＝`: ○ 修正後 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。
- `navyItems` token text 内マークアップ: ○ 修正後 `==` / `__` 残存なし。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` を確認。空白入り表記なし。
- planning固有: ○ `WBS`, `PDM`, `CPM`, `PERT`, `EVM` を確認。「クリティカル・パス」「ベース・ライン」「アクティビティー」なし。
- project-work固有: ○ `請負`, `準委任`, `下請代金支払遅延等防止法`, `職務著作`, `FFP`, `FPIF`, `FP-EPA`, `CPFF`, `CPIF`, `CPAF`, `RFP`, `RFQ`, `RFI`, `SOW`, `CCB` を確認。
- 契約表記: ○ 「契約タイプ」混在なし。見出し/本文は「契約形態」を主に使用。

### PMBOK第6版／第7版 統合確認
- planning §30 / §31: ○ PMBOK第7版「計画」パフォーマンス領域と PMBOK第6版との対応関係を明示。
- project-work §1 / §2: ○ PMBOK第7版「プロジェクト作業」パフォーマンス領域と PMBOK第6版の対応知識エリアを明示。
- navyItems: ○ 第6版/第7版/IPA/関連参照が token text 内に通常文字列として記載され、マークアップ混入なし。
- 相互参照: ○ planning §27 → stakeholder §32、project-work §2 / §19 → team §28、project-work §2 / §8 → planning §28 を確認。

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
- `src/pages/NoteDetail.tsx:2025`: planning §2 のサブシディアリー計画書が9件だったため、指示書の「10種類」に合わせて `要求事項マネジメント計画書` を追加。
- `src/pages/NoteDetail.tsx:2269`: `navyItems` の token text 内に残っていた `==使い分け基準==` を通常表記へ変更。
- `src/pages/NoteDetail.tsx:2541`: `スコープ・ベースライン＝...` の全角イコールを避け、`スコープ・ベースラインは...` に変更。
- `src/pages/NoteDetail.tsx:2574` 以降: project-work §2 の第4/9/10/12章対応リストを親見出し配下に全角スペースで階層化。
- `src/pages/NoteDetail.tsx:2840` 以降: project-work §17 の「データ → 情報 → 報告書」3段階を親見出し配下に階層化し、`情報を意思決定可能な形式に整理` の赤字分割を自然な語句単位へ修正。
- `src/pages/NoteDetail.tsx:2942` 以降: project-work §23 の主要法令リストを親見出し配下に階層化。
- `src/pages/NoteDetail.tsx:2961` 以降: project-work §24 の請負契約/準委任契約リストを親見出し配下に階層化。

## 次のタスクへの教訓
- `navyItems` は通常の `items` と描画系が違うため、token text 内の `==...==` / `__...__` は AST で別検査すると取りこぼしにくい。
- 親見出しの直後だけでなく、3層構造にしたいセクションは「親0 → 子1 → 孫2」の深度を集計すると、平坦化ミスを早く見つけられる。
