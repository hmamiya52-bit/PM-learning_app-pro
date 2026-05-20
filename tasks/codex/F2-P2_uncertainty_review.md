# Codex 作業指示書: F2-P2 uncertainty クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 uncertainty カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_measurement_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 uncertainty Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_uncertainty.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/uncertainty.ts`（50問）の構造レビューを実施。EMV 計算問題は数値も検算対象。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.uncertainty（4787〜5348行）
- 対象commit: 本セッションの `[C] F2-P2 uncertainty ...` commit

## 3. 入力ファイル
- `src/data/questions/uncertainty.ts`（50問・新規）
- `src/data/questions/index.ts`（uncertaintyQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_uncertainty_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/uncertainty.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-un-001〜050 連続，重複なし）
- [ ] 全 id `^pm-un-\d{3}$`
- [ ] 全 `topicId === 'uncertainty'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし（特に脅威5戦略 vs 機会5戦略の組合せ問題）
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-un-010, 012, 018, 021, 025, 029, 031, 039, 042, 044, 047`

### Step 7: 誤字脱字・表記揺れ
uncertainty 特有の表記統一チェック:
- [ ] 「脅威」「機会（好機）」「リスク」表記統一
- [ ] 5戦略の日本語: 回避・軽減・転嫁・エスカレーション・受容 ／ 活用・強化・共有・エスカレーション・受容
- [ ] EMV / RBS / SWOT / EWS など略語表記
- [ ] 「リスク・スレッショルド」「リスク・プロファイル」中黒の有無
- [ ] PMBOK プロセス番号（11.1〜11.7）の半角統一
- [ ] 「コンティンジェンシー」表記統一
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: 数値検算（EMV 計算問題は必ず検算）
- [ ] pm-un-016: スコア = 確率 × 影響度（一般式）
- [ ] pm-un-018: EMV = 影響金額 × 発生確率（一般式）
- [ ] pm-un-019: 0.3×(−100) + 0.5×200 = −30 + 100 = +70 万円 ✓

### Step 9: ノート整合性チェック
- [ ] PMBOK6 7プロセス（pm-un-006）
- [ ] 脅威5戦略（pm-un-025〜030）と機会5戦略（pm-un-031〜034）の対応関係
- [ ] 二次リスク vs 残存リスク（pm-un-039, 040）の違い
- [ ] リスク選好 vs リスク許容度 vs スレッショルド（pm-un-041, 042, 043）
- [ ] 決定木（pm-un-020）の選択肢ノード（□）と機会ノード（○）

### Step 10: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 11: レビュー記録の作成
`tasks/reviews/F2-P2_uncertainty_codex_review.md` を作成。

### Step 12（任意）: 軽微な修正
- 誤字・表記揺れ・型外しの修正可
- コンテンツの妥当性判断はユーザ担当

## 6. 完了条件
- [ ] レビュー記録，🟢/🟡/🔴 明示
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル編集禁止
- ❌ コンテンツの正確性判断は禁止

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_uncertainty_codex_review.md
# 修正があれば: git add src/data/questions/uncertainty.ts
git commit -m "[X] F2-P2 uncertainty Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-un-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§25 をカバー（§26-27 過去問頻出・ひっかけは F2-P3 と重複のため除外）
- EMV 計算問題 1 問（pm-un-019）は数値検算済み
