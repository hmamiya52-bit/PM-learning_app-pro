# レビュー: F2-P0 stakeholder ノート 第6版要素 遡及補完レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: 7d8e906
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB.stakeholder` の第6版遡及補完は構造・型・インデント・ビルドいずれも問題なし。明確な軽微不整合 2 件を `NOTE_DB.stakeholder` 内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P0_stakeholder_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB.stakeholder` 内のみ。team や他カテゴリは未編集。
- セクション数: ○ `sections` は 35 要素、heading は `1. ` 〜 `35. ` の連番。
- 新規セクション: ○ §32「PMBOK第6版 ステークホルダー・マネジメント 4プロセス」および §33「PMBOK第6版と第7版の対応関係」が存在。
- 旧セクション改番: ○ 旧 §32 / §33 は現 §34 / §35 へ改番済み。items 内容は変更なし。
- exam_tips: ○ 修正後 9 要素で非空。第6版補足を含む。
- summary: ○ 非空。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 2件 (stakeholder, team)` と `[OK] 全データの整合性確認完了` を確認。
- diff check: ○ `git diff --check` 成功。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ `stakeholder`, `team` の2件のみ。
- `categories.ts` 整合: ○ `id: 'stakeholder'`, `name: 'ステークホルダー'` と一致。
- LocalStorageキー / `pmap:` prefix: ○ 変更なし。
- team セクション: ○ diff上、変更なし。

### インデント整合性
- 全角スペースインデント: ○ 包含関係のある子項目は全角スペース `　` で表現。
- 半角スペース / タブ混入: ○ 検出なし。
- 最大階層: ○ 深さ2以内。
- §32: ○ 4プロセスそれぞれの主要インプット／主要ツール&技法／主要アウトプットがインデント1で揃っている。
- §33: ○ 両版の枠組み比較2項目がインデント1。
- 既存インデント維持: ○ §6 / §11 / §16 / §17 / §19 / §24 / §30 / §34 の全角スペースインデントに崩れなし。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- `===` / `___` / `====` / `____`: ○ 0件。
- 全角イコール `＝`: ○ 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。修正後、`navyItems` の token text 内に `==` / `__` 残存なし。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- ステークホルダー: ○ 「ステイクホルダー」「ステイクホルダ」なし。
- エンゲージメント: ○ 「エンゲイジメント」なし。
- マネジメント: ○ 「マネージメント」なし。
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` に統一。
- プロセス番号: ○ `13.1` / `13.2` / `13.3` / `13.4` の表記あり。
- プロセス英語名: ○ `Identify Stakeholders` / `Plan Stakeholder Engagement` / `Manage Stakeholder Engagement` / `Monitor Stakeholder Engagement` を確認。

### 第6版補足の配置
- §1: ○ 第6版 第13章の出典補足あり。
- §7: ○ 第6版 13.1 対応の navyItems あり。
- §9: ○ 第6版 13.1.3.1 主要アウトプット補足あり。
- §18: ○ 第6版 13.2 / 13.4 で評価マトリクスを使用する補足あり。
- §19: ○ 第6版 13.2.3.1 主要アウトプット補足あり。
- §29: ○ 第6版 13.4 監視プロセス補足あり。
- §31: ○ 第6版 13.3 / 13.4 の変更要求・問題ログ対応補足あり。

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
- `src/pages/NoteDetail.tsx:822`: `navyItems` の token text 内に残っていた `==根本原因分析==` / `==ステークホルダー分析==` を通常表記に変更。`navyItems` は構造化 token として描画されるため、文字列マークアップを残さない形に統一。
- `src/pages/NoteDetail.tsx:928` / `src/pages/NoteDetail.tsx:929`: 1件の長い `exam_tips` を「4プロセス順序」と「ITTO主要項目」の2件に分割し、DoD の 9 件以上を満たすよう修正。内容は既存 tip の分割で、新規論点追加はなし。

## 次のタスクへの教訓
- `navyItems` は `renderTokens` で描画されるため、token text 内の `==...==` は赤字として解釈されない。`items` と `navyItems` でマークアップ検査を分けると検出しやすい。
- `exam_tips` の件数は `validate-data` では検出されないため、カテゴリレビュー用の機械チェックで明示的に確認する。
