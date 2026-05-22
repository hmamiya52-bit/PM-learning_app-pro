# 午前II 選択肢ラベル切替 Codex 作業メモ

## 実施内容
- `OfficialMorningSession.tsx` に `DISPLAY_LABELS` 定数を追加
- 解答前後を通じて選択肢本体のラベルは表示順ベースの `①②③④` で維持
- 解答後だけ各選択肢の上に `解答記号：ア/イ/ウ/エ` を追加し、元順序の公式記号を明示
- 不正解時の「あなたの解答 / 正解」と DEBUG の「正解==」表示も元順序ラベルに統一
- 旧表示位置ラベル用の `selectedDisplayIndex` / `correctDisplayIndex` は未使用になるため削除

## 変更箇所
- `src/pages/OfficialMorningSession.tsx` L28 付近: `DISPLAY_LABELS` 定数追加
- `src/pages/OfficialMorningSession.tsx` L407 付近: 解答後の `解答記号：X` 補助行追加、選択肢本体ラベルは `①②③④` で維持
- `src/pages/OfficialMorningSession.tsx` L430 付近: 「あなたの解答 / 正解」を元順序ラベルに修正
- `src/pages/OfficialMorningSession.tsx` L445 付近: DEBUG 表示を元順序ラベルに修正

## 検証結果
- `npm run validate-data`: OK
- `npm run build`: OK
- ブラウザ確認: `http://127.0.0.1:5173`
- H27 問12:
  - 解答前: `①②③④` で表示し、`解答記号：` 補助行は非表示
  - 誤答後: 各選択肢の上に `解答記号：エ/イ/ウ/ア` が表示され、本文側の `①②③④` は維持
  - `発生確率・影響度マトリックス` に `解答記号：エ` が表示
  - 不正解時の補足表示は `あなたの解答: イ / 正解: エ`
  - DEBUG 表示は `DEBUG: 正解==エ`
- H27 問13:
  - 現行データでは `品質保証教育訓練費` は `correctIndex=2` のため `ウ` として表示
  - 解説中の `ア クレーム調査費` / `イ 損害賠償費` / `エ プログラム不具合修正費` と元順序ラベルが一致
  - DEBUG 表示は `DEBUG: 正解==ウ`
- DEBUG OFF 後の同一問題:
  - 解説と `解答記号：` 補助行が非表示に戻り、選択肢本体は `①②③④` のまま表示されることを確認
- ブラウザ console error/warning: なし

## スクリーンショット
- `tasks/reviews/F2-P3_answer_labels_q12_before.png`
- `tasks/reviews/F2-P3_answer_labels_q12_after.png`

## 補足
- 指示書では H27 問13 の正解ラベル例が `ア` と記載されていたが、現行データは `choices = ['クレーム調査費', '損害賠償費', '品質保証教育訓練費', 'プログラム不具合修正費']` / `correctIndex = 2` のため、実装確認では `ウ` を正として扱った。
