# Codex 作業指示書: F2-P2 integration クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 integration カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_uncertainty_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 integration Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_integration.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/integration.ts`（50問）の構造レビューを実施。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.integration（5349〜5843行）
- 対象commit: 本セッションの `[C] F2-P2 integration ...` commit

## 3. 入力ファイル
- `src/data/questions/integration.ts`（50問・新規）
- `src/data/questions/index.ts`（integrationQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_integration_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/integration.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-ig-001〜050 連続，重複なし）
- [ ] 全 id `^pm-ig-\d{3}$`
- [ ] 全 `topicId === 'integration'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし（特に是正処置/予防処置/欠陥修正の3種類の混同問題）
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-ig-006, 018, 022, 025, 030, 033, 035, 042, 047, 049, 050`

### Step 7: 誤字脱字・表記揺れ
integration 特有の表記統一チェック:
- [ ] PMBOK プロセス番号（4.1〜4.7）の半角統一
- [ ] 「プロジェクト憲章」「PM 計画書」表記統一
- [ ] 「ビジネスケース」表記統一
- [ ] 「サブシディアリ」表記統一（「サブシディアリー」混入なし）
- [ ] 「ベースライン」「コスト・ベースライン」表記統一
- [ ] 「是正処置」「予防処置」「欠陥修正」表記統一
- [ ] CCB / CI / OPA / EEF / SemVer / CalVer など略語表記
- [ ] 「構成項目」「構成管理」「構成状況の記録」表記統一
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] PMBOK6 7プロセス（pm-ig-003）
- [ ] プロジェクト憲章 vs ビジネスケース vs PM 計画書（pm-ig-007, 009, 010, 012）
- [ ] 是正処置 vs 予防処置 vs 欠陥修正の違い（pm-ig-019〜022, 025）
- [ ] CCB の構成と権限（pm-ig-026〜028）
- [ ] 変更影響評価の5観点（スコープ/コスト/スケジュール/品質/リスク）（pm-ig-029, 030）
- [ ] ベースライン更新は統合変更管理プロセス経由（pm-ig-037）
- [ ] 構成管理 vs 変更管理（pm-ig-035）
- [ ] 教訓レジスター → 組織のプロセス資産（OPA）（pm-ig-044〜046）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_integration_codex_review.md` を作成。

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
git add tasks/reviews/F2-P2_integration_codex_review.md
# 修正があれば: git add src/data/questions/integration.ts
git commit -m "[X] F2-P2 integration Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-ig-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§22 をカバー（§23-24 過去問頻出・ひっかけは F2-P3 と重複のため除外）
