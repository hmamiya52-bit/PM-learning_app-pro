# Codex 作業指示書: F2-P2 measurement クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 measurement カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_delivery_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 measurement Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_measurement.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/measurement.ts`（50問）の構造レビューを実施。EVM 計算問題は数値も検算対象。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.measurement（4302〜4786行）
- 対象commit: 本セッションの `[C] F2-P2 measurement ...` commit

## 3. 入力ファイル
- `src/data/questions/measurement.ts`（50問・新規）
- `src/data/questions/index.ts`（measurementQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_measurement_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/measurement.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-ms-001〜050 連続，重複なし）
- [ ] 全 id `^pm-ms-\d{3}$`
- [ ] 全 `topicId === 'measurement'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

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
  `pm-ms-007, 008, 022, 034, 038, 039, 040, 042, 043, 044, 046`

### Step 7: 誤字脱字・表記揺れ
measurement 特有の表記統一チェック:
- [ ] EVM 略語表記: PV / EV / AC / BAC / EAC / ETC / VAC / TCPI / CV / SV / CPI / SPI
- [ ] 「アーンドバリュー」「アーンドスケジュール」表記統一
- [ ] 「ベロシティ」「スループット」「リードタイム」「サイクルタイム」表記統一
- [ ] KPI / KGI / KRI / CSF / OKR / BSC / CSAT / NPS / DAU / MAU など略語表記
- [ ] 数式の符号統一（半角マイナス vs 全角マイナス）
- [ ] 「±」記号の使用（全角/半角）
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: 数値検算（EVM 計算問題は必ず検算）
- [ ] pm-ms-013: CV = EV − AC のみ（一般式）
- [ ] pm-ms-014: SV = EV − PV のみ（一般式）
- [ ] pm-ms-016: CPI = EV / AC（一般式）
- [ ] pm-ms-017: SPI = EV / PV（一般式）
- [ ] pm-ms-019: EAC = BAC / CPI（一般式）
- [ ] pm-ms-022: TCPI = (BAC − EV) / (BAC − AC)（一般式）
- [ ] pm-ms-023: CV = 7,000 − 8,500 = −1,500 ✓
- [ ] pm-ms-024: CPI = 40/60 = 2/3，EAC = 100 / (2/3) = 150 ✓
- [ ] pm-ms-025: TCPI = (100−34)/(100−40) = 66/60 = 1.1 ✓
- [ ] pm-ms-037: 欠陥密度 = 欠陥数 / KLOC（または FP）

### Step 9: ノート整合性チェック
- [ ] EVM 4 式（CV/SV/CPI/SPI）の符号と意味（pm-ms-013〜018）
- [ ] EAC/ETC/VAC/TCPI の定義（pm-ms-019〜022）
- [ ] アーンドスケジュール（pm-ms-026）
- [ ] リードタイム vs サイクルタイム vs スループット（pm-ms-031〜033）
- [ ] リトルの法則 WIP = TH × CT（pm-ms-034）
- [ ] CSAT vs NPS の違い（pm-ms-038, 039）
- [ ] BSC 4視点（pm-ms-042）
- [ ] OKR の O と KR の役割（pm-ms-043）
- [ ] NPV / ROI / IRR / 回収期間の定義（pm-ms-044〜047）

### Step 10: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 11: レビュー記録の作成
`tasks/reviews/F2-P2_measurement_codex_review.md` を作成。

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
git add tasks/reviews/F2-P2_measurement_codex_review.md
# 修正があれば: git add src/data/questions/measurement.ts
git commit -m "[X] F2-P2 measurement Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-ms-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§22 をカバー（§23-24 過去問頻出・ひっかけは F2-P3 と重複のため除外）
- EVM 計算問題 3 問（pm-ms-023〜025）は数値検算済み
