# レビュー: F2-P2 measurement クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: 56b2830
> レビューア: Codex

## 結果サマリー
- 🟢 PASS: `src/data/questions/measurement.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・表記揺れ・EVM 数値検算・ノート照合の観点で致命問題なし。データ修正は不要と判断。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_measurement_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ レビュー記録のみ作成。`src/data/questions/measurement.ts`、`src/pages/NoteDetail.tsx`、他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `measurement`。
- import / spread: ○ `src/data/questions/index.ts` で `measurementQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'measurement'`, `name: '測定'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-ms-001` 〜 `pm-ms-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-ms-\d{3}$` に準拠。

### 型・選択肢
- `questionText`: ○ 全件 `{{blank}}` が1個。
- `correctAnswer`: ○ 全件非空。
- `choices`: ○ 全件4択。
- 正解含有: ○ 全件 `choices` に `correctAnswer` を含む。
- 重複選択肢: ○ 全件なし。
- 空文字選択肢: ○ 全件なし。
- `explanation`: ○ 全件非空。
- `difficulty`: ○ 全件 `1 | 2 | 3`。
- `excludeFromWritten`: ○ 省略または boolean。
- プレースホルダ: ○ `TODO` / `TBD` / `FIXME` の混入なし。

### 難易度分布
- difficulty 1: ○ 14問。
- difficulty 2: ○ 26問。
- difficulty 3: ○ 10問。
- 設計目標: ○ 14 / 26 / 10 と一致。

### excludeFromWritten
- 件数: ○ 11件。
- 対象id: ○ `pm-ms-007, pm-ms-008, pm-ms-022, pm-ms-034, pm-ms-038, pm-ms-039, pm-ms-040, pm-ms-042, pm-ms-043, pm-ms-044, pm-ms-046`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 混入なし。
- EVM 略語: ○ `PV` / `EV` / `AC` / `BAC` / `EAC` / `ETC` / `VAC` / `TCPI` / `CV` / `SV` / `CPI` / `SPI` を確認。
- EVM 用語: ○ `アーンドバリュー` / `アーンドスケジュール` を確認。
- アジャイル指標: ○ `ベロシティ` / `スループット` / `リードタイム` / `サイクルタイム` を確認。
- 経営・プロダクト指標: ○ `KPI` / `KGI` / `KRI` / `CSF` / `OKR` / `BSC` / `CSAT` / `NPS` / `DAU` / `MAU` を確認。
- 数式記号: ○ EVM 式は `−`、計算問題の正負記号は `−` / `＋` で統一。

### EVM 数値検算
- pm-ms-013: ○ `CV = EV − AC`。
- pm-ms-014: ○ `SV = EV − PV`。
- pm-ms-016: ○ `CPI = EV / AC`。
- pm-ms-017: ○ `SPI = EV / PV`。
- pm-ms-019: ○ `EAC = BAC / CPI`。
- pm-ms-022: ○ `TCPI = (BAC − EV) / (BAC − AC)`。
- pm-ms-023: ○ `CV = 7,000 − 8,500 = −1,500`。
- pm-ms-024: ○ `CPI = 40 / 60 = 2/3`, `EAC = 100 / (2/3) = 150`。
- pm-ms-025: ○ `TCPI = (100 − 34) / (100 − 40) = 66 / 60 = 1.1`。
- pm-ms-037: ○ 欠陥密度は `欠陥数 / KLOC` または `欠陥数 / FP` の説明と整合。

### ノート整合性
- pm-ms-013 〜 018: ○ EVM 4式（CV/SV/CPI/SPI）の符号と意味は NoteDetail §5〜§6 と整合。
- pm-ms-019 〜 022: ○ EAC/ETC/VAC/TCPI の定義は NoteDetail §7〜§8 と整合。
- pm-ms-026: ○ アーンドスケジュールは NoteDetail §9 と整合。
- pm-ms-031 〜 033: ○ リードタイム / サイクルタイム / スループットの区別は NoteDetail §12 と整合。
- pm-ms-034: ○ リトルの法則 `WIP = TH × CT` は指示書指定および NoteDetail §12 の関係式と整合。
- pm-ms-038 / 039: ○ CSAT と NPS の違いは NoteDetail §15 と整合。
- pm-ms-042: ○ BSC 4視点は NoteDetail §17 と整合。
- pm-ms-043: ○ OKR の O と KR の役割は NoteDetail §18 と整合。
- pm-ms-044 〜 047: ○ NPV / ROI / IRR / 回収期間の定義は NoteDetail §19 と整合。

### 動作確認
- git pull: ○ `Already up to date.`。
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし

### 改善推奨
- なし

## Codexによる追加修正
- なし

## 補足
- NoteDetail の頻出論点にはリトルの法則を `WIP = スループット × リードタイム` とする表記もあるが、本タスク指示書は `WIP = TH × CT` を明示しているため、問題データ `pm-ms-034` は指示書および NoteDetail §12 の式に整合していると判断。
- コンテンツ妥当性の最終判断はユーザ / Claude 側。
