# Codex 作業指示書: F2-P2 tailoring-models クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 tailoring-models カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_governance_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 tailoring-models Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_tailoring-models.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/tailoring-models.ts`（50問）の構造レビューを実施。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB['tailoring-models']（6305〜6779行）
- 対象commit: 本セッションの `[C] F2-P2 tailoring-models ...` commit

## 3. 入力ファイル
- `src/data/questions/tailoring-models.ts`（50問・新規）
- `src/data/questions/index.ts`（tailoringModelsQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_tailoring-models_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/tailoring-models.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-tl-001〜050 連続，重複なし）
- [ ] 全 id `^pm-tl-\d{3}$`
- [ ] 全 `topicId === 'tailoring-models'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし（特に変革モデル ADKAR vs コッターの混同問題）
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-tl-003, 007, 014, 016, 017, 022, 031, 033, 034, 043, 047`

### Step 7: 誤字脱字・表記揺れ
tailoring-models 特有の表記統一チェック:
- [ ] 「テーラリング」表記統一（「テイラリング」誤記なし）
- [ ] PMBOK7 3軸: 「モデル・手法・成果物」表記統一
- [ ] DMAIC / PDCA / OODA / SECI / ADKAR / GoF / MVC / MVP / MVVM など略語表記
- [ ] 「カイゼン」「Cynefin」「Stacey」「PERT」「PoC」など固有名詞
- [ ] 「ファシリテーション」「アクティブリスニング」表記統一
- [ ] 「サブシディアリ」表記統一
- [ ] デザインパターン名: Singleton / Factory / Observer / Strategy
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] テーラリングの 4 ステップ（pm-tl-007）
- [ ] PMBOK7 3軸（モデル・手法・成果物）（pm-tl-008）
- [ ] DMAIC 5ステップの順序（pm-tl-014）
- [ ] ADKAR 5要素（pm-tl-016）
- [ ] コッターの8段階（pm-tl-017）
- [ ] Cynefin / Stacey の違い（pm-tl-019, 020）
- [ ] 見積もり手法の区別（pm-tl-024, 025, 026）
- [ ] GoF デザインパターン 3分類（pm-tl-043〜046）
- [ ] MVC / MVP / MVVM の違い（pm-tl-047）
- [ ] アジャイル三角形（時間コスト固定 vs スコープ固定）（pm-tl-040, 041）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_tailoring-models_codex_review.md` を作成。

### Step 11（任意）: 軽微な修正
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
git add tasks/reviews/F2-P2_tailoring-models_codex_review.md
# 修正があれば: git add src/data/questions/tailoring-models.ts
git commit -m "[X] F2-P2 tailoring-models Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-tl-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§20 をカバー + GoF/MVC 補完問題（§21-22 過去問頻出・ひっかけは F2-P3 と重複のため除外）
