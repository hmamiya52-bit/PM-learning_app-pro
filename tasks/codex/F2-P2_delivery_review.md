# Codex 作業指示書: F2-P2 delivery クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 delivery カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_project-work_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 delivery Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_delivery.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/delivery.ts`（50問）の構造レビューを実施。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.delivery（3749〜4301行）
- 対象commit: 本セッションの `[C] F2-P2 delivery ...` commit

## 3. 入力ファイル
- `src/data/questions/delivery.ts`（50問・新規）
- `src/data/questions/index.ts`（deliveryQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_delivery_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/delivery.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-dv-001〜050 連続，重複なし）
- [ ] 全 id `^pm-dv-\d{3}$`
- [ ] 全 `topicId === 'delivery'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型のフィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-dv-006, 015, 018, 026, 031, 036, 040, 041, 042, 044, 046`

### Step 7: 誤字脱字・表記揺れ
delivery 特有の表記統一チェック:
- [ ] 「品質マネジメント」「品質コントロール」「品質保証」表記統一
- [ ] 「適合（コンフォーマンス）」「妥当性確認」表記
- [ ] 「パレート図」「特性要因図」「ヒストグラム」「散布図」「管理図」「チェックシート」「層別」の7QC統一
- [ ] 「シックスシグマ」表記統一（カタカナ表記）
- [ ] 「ISO 9001」「JIS Q 9001:2015」の半角スペースとコロン
- [ ] 「CMMI」「DMAIC」「DoD」「DoR」「AC」「UAT」「TDD」「BDD」「CI/CD」など略語表記
- [ ] PMBOK プロセス番号（8.1, 8.2, 8.3）の半角統一
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] 品質 vs グレード（pm-dv-013）
- [ ] COQ 適合 vs 不適合（pm-dv-016, 017）
- [ ] 7QC道具7つの列挙（pm-dv-018）
- [ ] 新7QC道具 親和図 / 連関図（pm-dv-026, 027）
- [ ] PDCA Act（pm-dv-028）
- [ ] DMAIC 5ステップ（pm-dv-031）
- [ ] 管理図 ±3σ / 正規分布 68-95-99.7%（pm-dv-032, 033）
- [ ] ISO 9001 / JIS Q 9001:2015（pm-dv-035, 037）
- [ ] CMMI 5レベル（pm-dv-036）
- [ ] DoD vs DoR vs AC の使い分け（pm-dv-038, 043, 044）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_delivery_codex_review.md` を作成。

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
git add tasks/reviews/F2-P2_delivery_codex_review.md
# 修正があれば: git add src/data/questions/delivery.ts
git commit -m "[X] F2-P2 delivery Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-dv-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§27 をカバー（§28-29 過去問頻出・ひっかけは F2-P3 と重複のため除外）
