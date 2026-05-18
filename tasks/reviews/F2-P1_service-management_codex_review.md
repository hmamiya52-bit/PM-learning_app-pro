# F2-P1 service-management Codex レビュー

> 実施日: 2026-05-18
> 対象: `src/pages/NoteDetail.tsx` の `NOTE_DB['service-management']`
> 判定: 🟡 PASS with fixes

## 1. サマリー

`service-management` の構造化トークン、インデント、表記、コードレベル整合性をレビューした。

軽微な `===` マークアップ崩れを 2 件修正し、修正後の検証はすべて PASS。
コンテンツ妥当性そのものは指示範囲外のため未判定。

## 2. 修正内容

1. `exam_tips`「インシデント vs 問題」
   - 修正前: `インシデント===サービス回復==（早期）、問題===根本原因解決==（再発防止）`
   - 修正後: `インシデントは==サービス回復==（早期）、問題は==根本原因解決==（再発防止）`
   - 理由: 赤字直後の `=` により `===` が発生していたため。

2. `exam_tips`「RPO vs RTO」
   - 修正前: `RPO===データの最大許容損失時間==（巻き戻し）、RTO===サービスの最大許容停止時間==`
   - 修正後: `RPOは==データの最大許容損失時間==（巻き戻し）、RTOは==サービスの最大許容停止時間==`
   - 理由: 赤字直後の `=` により `===` が発生していたため。

## 3. レビュー結果

- `service-management`: 29 sections / summary 非空 / exam_tips 10 件 / 見出し連番 1〜29
- `__` / `==` 奇数行: 0 件
- 全角イコール `＝`: 0 件
- `===` / `___`: 0 件
- `navyItems` token text 内の `==X==` / `__X__`: 0 件
- インデント簡易検査: OK
- `categories.ts`: `id: 'service-management'`, `name: 'サービスマネジメント'` と整合
- 相互参照: `integration §13`, `integration §18`, `development-approach §30`, `integration §21`, `project-work §23`, `project-work §25` を確認
- 既存 11 カテゴリへの意図しない変更: なし
- `NOTE_CATEGORY_IDS` 変更: なし

## 4. 検証

- `npm install`: PASS（up to date / vulnerabilities 0）
- `npm run validate-data`: PASS（NOTE_DB 投入済カテゴリ 12 件）
- `npm run build`: PASS
  - 備考: Vite の chunk size warning のみ。ビルド自体は成功。

## 5. 残リスク

ITIL / ISO / 法令内容の妥当性・試験対策としての正確性は本レビュー範囲外。
ユーザまたは Claude による最終確認対象。
