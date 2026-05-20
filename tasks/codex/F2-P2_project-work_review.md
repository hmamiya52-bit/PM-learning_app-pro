# Codex 作業指示書: F2-P2 project-work クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 project-work カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_planning_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 project-work Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_project-work.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/project-work.ts`（50問）の構造レビューを実施。型整合性・choices 配列の正解含有・id 一意性・データ品質を確認する。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB['project-work']（3121〜3748行）
- 対象commit: 本セッションの `[C] F2-P2 project-work ...` commit

## 3. 入力ファイル
- `src/data/questions/project-work.ts`（50問・新規）
- `src/data/questions/index.ts`（projectWorkQuestions の import/spread）
- `scripts/validate-static-data.ts`

## 4. 出力ファイル
- `tasks/reviews/F2-P2_project-work_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/project-work.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
git log --oneline -5
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-pw-001〜050 連続，重複なし）
- [ ] 全 id `^pm-pw-\d{3}$`
- [ ] 全 `topicId === 'project-work'`

### Step 3: 型整合性チェック
team / planning と同じ Question 型のフィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答（実質的に複数正解扱いになるリスク）
- 空文字・プレースホルダ混入なし
- 句読点統一

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14（基礎）
- [ ] diff 2 = 26（応用）
- [ ] diff 3 = 10（応用+）

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-pw-010, 013, 018, 019, 020, 021, 022, 023, 033, 039, 042`

### Step 7: 誤字脱字・表記揺れ
project-work 特有の表記統一チェック:
- [ ] 契約形態略語の表記統一: FP / CR / T&M / FFP / FPIF / FPEPA / CPFF / CPIF / CPAF
- [ ] 「実費精算」「コストプラス」表記統一
- [ ] 「請負」「準委任」表記統一
- [ ] 「コミュニケーション」表記統一
- [ ] 「ステークホルダー」「ステークホルダ」のうち本ノート系統との一致
- [ ] 「下請代金支払遅延等防止法」「下請法」併記の整合
- [ ] PMBOK プロセス番号（例: 4.3, 12.1）の半角統一
- [ ] 半角英数・全角記号の混在チェック（NDA / RFP / RFI / RFQ / SECI / CoP / CCB）
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] 契約形態 FP/CR/T&M とリスク負担の対応（pm-pw-013, 017）
- [ ] FFP / FPIF / FPEPA / CPFF / CPIF / CPAF の定義（pm-pw-018〜023）
- [ ] CPIF 計算（pm-pw-024）の数値整合
- [ ] make-or-buy 分析（pm-pw-011, 012）
- [ ] コミュニケーションチャネル数 n(n-1)/2（pm-pw-031）
- [ ] 下請法 60日（pm-pw-044）
- [ ] 著作権の無方式主義（pm-pw-045）
- [ ] 請負 = 仕事完成義務 / 準委任 = 善管注意義務（pm-pw-046〜048）
- [ ] SECI モデル 4ステップの順序（pm-pw-039）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_project-work_codex_review.md` を作成。

### Step 11（任意）: 軽微な修正
- 誤字・表記揺れ・型外しなど明確な誤りは修正可
- コンテンツの妥当性判断はユーザ最終確認担当

## 6. 完了条件
- [ ] レビュー記録，🟢/🟡/🔴 明示
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル編集禁止
- ❌ `npm install` 新規パッケージ追加禁止
- ❌ コンテンツの正確性判断は禁止

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_project-work_codex_review.md
# 修正があれば: git add src/data/questions/project-work.ts
git commit -m "[X] F2-P2 project-work Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-pw-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§25 をカバー（§26-27 過去問頻出・ひっかけは F2-P3 と重複のため除外）
