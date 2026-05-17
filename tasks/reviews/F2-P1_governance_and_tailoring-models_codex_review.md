# F2-P1 governance + tailoring-models Codex レビュー

> 実施日: 2026-05-18
> 対象: `src/pages/NoteDetail.tsx` の `NOTE_DB.governance` / `NOTE_DB['tailoring-models']`
> 判定: 🟡 PASS with fixes

## 1. サマリー

`governance` / `tailoring-models` の構造化トークン、インデント、表記、コードレベル整合性をレビューした。

軽微なマークアップ/表記崩れを 2 件修正し、修正後の検証はすべて PASS。
コンテンツ妥当性そのものは指示範囲外のため未判定。

## 2. 修正内容

1. `governance` §7「プログラム・マネジメントの特徴」
   - 修正前: `プログラム===便益==、プロジェクト===成果物==`
   - 修正後: `プログラムは==便益==、プロジェクトは==成果物==`
   - 理由: 赤字直後の `=` により `===` が発生していたため。

2. `governance` §22「既存カテゴリとの相互参照」
   - 修正前: `ガバナンス＝枠組み、マネジメント＝実行、リーダーシップ＝動かす`
   - 修正後: `ガバナンスは枠組み、マネジメントは実行、リーダーシップは動かす`
   - 理由: 全角イコール `＝` を除去するため。

`tailoring-models` 側の修正はなし。

## 3. レビュー結果

- `governance`: 22 sections / summary 非空 / exam_tips 10 件 / 見出し連番 1〜22
- `tailoring-models`: 22 sections / summary 非空 / exam_tips 10 件 / 見出し連番 1〜22
- `__` / `==` 奇数行: 0 件
- 全角イコール `＝`: 0 件
- `===` / `___`: 0 件
- `navyItems` token text 内の `==X==` / `__X__`: 0 件
- インデント簡易検査: OK
- `categories.ts`: `governance` = `ガバナンス・組織論`、`tailoring-models` = `テーラリング・モデル` と整合
- 既存 9 カテゴリへの意図しない変更: なし

## 4. 検証

- `npm install`: PASS（up to date / vulnerabilities 0）
- `npm run validate-data`: PASS（NOTE_DB 投入済カテゴリ 11 件）
- `npm run build`: PASS
  - 備考: Vite の chunk size warning のみ。ビルド自体は成功。

## 5. 残リスク

PMBOK 等の内容妥当性・試験対策としての正確性は本レビュー範囲外。
ユーザまたは Claude による最終確認対象。
