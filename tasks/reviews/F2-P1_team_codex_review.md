# レビュー: F2-P1 team ノート構造レビュー

> レビュー日時: 2026-05-17
> レビュー対象commit: b84707d
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `NOTE_DB.team` の構造・型・ビルドは問題なし。明確な表記/マークアップ検査上の軽微不整合 4 件を `NOTE_DB.team` 内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P1_team_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/pages/NoteDetail.tsx` の `NOTE_DB.team` 内のみ。stakeholder や他カテゴリは未編集。
- セクション数: ○ `sections` は 37 要素、heading は `1. ` 〜 `37. ` の連番。
- exam_tips: ○ 9 要素で非空。
- summary: ○ 非空。
- headerDiagrams: ○ team では未使用。指示書上「無くてもOK」の範囲内。

### コード品質
- 型エラー: ○ `npm run build` 成功。
- 静的データ検証: ○ `npm run validate-data` 成功。`[INFO] NOTE_DB 投入済カテゴリ: 2件 (stakeholder, team)` と `[OK] 全データの整合性確認完了` を確認。
- ESLint: - 指示書DoD対象外のため未実行。
- 依存関係: ○ `npm install` は `up to date`、脆弱性 0。

### 既存コードとの整合
- `NOTE_DB` export: ○ 維持。
- `NOTE_CATEGORY_IDS`: ○ 変更なし。
- NOTE_DB投入済カテゴリ: ○ `stakeholder`, `team` の2件のみ。
- `categories.ts` 整合: ○ `id: 'team'`, `name: 'チーム'` と一致。
- LocalStorageキー / `pmap:` prefix: ○ 変更なし。
- stakeholder セクション: ○ diff上、変更なし。

### 構造化トークン
- `__` 出現回数奇数: ○ 0件。
- `==` 出現回数奇数: ○ 0件。
- `===` / `___`: ○ 0件。
- `__X==Y__` 型の開閉不整合: ○ 0件。
- 全角イコール `＝`: ○ 修正後 0件。
- `navyItems`: ○ 全 token が `{ text, style: 'navy' }`。
- `EmphasisToken.style`: ○ `red | navy | plain` 以外なし。

### 表記揺れ
- リーダーシップ: ○ 「リーダシップ」なし。
- マネジメント: ○ 「マネージメント」なし。
- モチベーション: ○ 「モーチベーション」なし。
- マネジリアル・グリッド: ○ 日本語表記を一本化。別名補足は英語名 `Managerial Grid` に変更。
- サーバントリーダーシップ: ○ 「サーヴァント」なし。
- タックマンモデル: ○ 「タックマン・モデル」「タックマンのモデル」なし。
- マトリクス: ○ 「マトリックス」なし。
- グランドルール: ○ 「グラウンドルール」なし。
- PMBOK版表記: ○ `PMBOK第6版` / `PMBOK第7版` に統一。

### PMBOK第6版／第7版 統合確認
- §6: ○ `PMBOK第6版と第7版の対応関係` セクションあり。第6版/第7版の枠組み差分を説明。
- §23: ○ `チームの育成` 9.4 セクションあり。
- §27: ○ `資源マネジメント計画` 9.1 セクションあり。
- §28: ○ 9.2 / 9.3 / 9.6 を同セクション内で扱う。
- §33: ○ `チームのマネジメント` 9.5 セクションあり。
- §37: ○ `PMBOK6 vs PMBOK7 用語` の混同をひっかけパターンとして明記。
- navyItems: ○ PMBOK第6版の章番号付き出典、PMBOK第7版の領域/原則出典が該当セクションで明示されている。

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
- 指示書に参照先として記載されている `memory/feedback_note_markup.md` はリポジトリ内で見つからなかった。今回は指示書本文にマークアップ規約が明記されていたため、それに従ってレビューを実施した。

## Codexによる追加修正
- `src/pages/NoteDetail.tsx:988`: `マネジメント・グリッド` という別名補足を避け、`Managerial Grid` の英語名補足へ変更して `マネジリアル・グリッド` 表記に一本化。
- `src/pages/NoteDetail.tsx:1032`: 全角イコール `＝` を避け、「スクラムマスターはサーバントリーダーとして振る舞う」に変更。
- `src/pages/NoteDetail.tsx:1320`: heading の `トーマス＝キルマン` を `トーマス-キルマン` に変更。
- `src/pages/NoteDetail.tsx:1402`: `X＝怠惰／Y＝自律`、`Z＝日本型` を `Xは怠惰／Yは自律`、`Zは日本型` に変更。

## 次のタスクへの教訓
- `__` と `==` が同じ行に混在する正常ケースが多いため、単純な正規表現ではなく、奇数個数・三連続記号・全角記号・開閉順で分けて検査すると誤検出が減る。
- 全角イコールは内容上自然に入りやすいので、マークアップ検査対象カテゴリでは文章化または半角ハイフンに寄せると安定する。
