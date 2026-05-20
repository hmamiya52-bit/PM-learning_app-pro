# レビュー: F2-P2 project-work クイズ50問 構造レビュー

> レビュー日時: 2026-05-20
> レビュー対象commit: 0b19a2b
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/project-work.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・ノート照合の観点で致命問題なし。`{{blank}}` 前スペース 1 件と CPIF 計算の数値不整合 1 件を同ファイル内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_project-work_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/project-work.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `project-work`。
- import / spread: ○ `src/data/questions/index.ts` で `projectWorkQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'project-work'`, `name: 'プロジェクト作業'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-pw-001` 〜 `pm-pw-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-pw-\d{3}$` に準拠。

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

### 難易度分布
- difficulty 1: ○ 14問。
- difficulty 2: ○ 26問。
- difficulty 3: ○ 10問。
- 設計目標: ○ 14 / 26 / 10 と一致。

### excludeFromWritten
- 件数: ○ 11件。
- 対象id: ○ `pm-pw-010, 013, 018, 019, 020, 021, 022, 023, 033, 039, 042`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後 0件。
- `コミニュケーション`: ○ 混入なし。
- `ステークホルダ` 長音抜け: ○ 混入なし。
- `実費清算`: ○ 混入なし。`実費精算` に統一。
- `コスト・プラス`: ○ 混入なし。設問側は `コストプラス` 表記。
- `準委託`: ○ 混入なし。
- `TODO` / `??`: ○ 混入なし。
- 略語: ○ `FP`, `CR`, `T&M`, `FFP`, `FPIF`, `FPEPA`, `CPFF`, `CPIF`, `CPAF`, `NDA`, `RFP`, `RFI`, `RFQ`, `SECI`, `CoP`, `CCB` の表記を確認。
- PMBOKプロセス番号: ○ `4.3`, `4.4`, `4.5`, `4.6`, `10.2`, `10.3`, `12.1`, `12.2`, `12.3` の半角表記を確認。

### ノート整合性
- pm-pw-011 / 012: ○ make-or-buy 分析の判断軸は NoteDetail §8 / planning §28 と整合。
- pm-pw-013 / 017: ○ 契約形態 FP / CR / T&M とリスク負担の対応は NoteDetail §9 と一致。
- pm-pw-018〜023: ○ FFP / FPIF / FPEPA / CPFF / CPIF / CPAF の定義は NoteDetail §10 / §11 と一致。
- pm-pw-024: ○ CPIF 計算を確認。修正後、`800 + 100 + 100 = 1,000` で数値整合。
- pm-pw-031: ○ コミュニケーションチャネル数 `n(n−1)/2` は指示書要件に一致。
- pm-pw-033: ○ 作業パフォーマンスの `データ → 情報 → 報告書` は NoteDetail §17 と一致。
- pm-pw-039: ○ SECI モデルの順序 `Socialization → Externalization → Combination → Internalization` は NoteDetail §20 と一致。
- pm-pw-044: ○ 下請法 60日ルールは設問・解説で確認。
- pm-pw-045: ○ 著作権の無方式主義は設問・解説で確認。
- pm-pw-046〜048: ○ 請負 = 仕事完成義務、準委任 = 業務遂行義務 / 善管注意義務 は NoteDetail §24 と一致。

### 動作確認
- git pull: ○ `Already up to date.`
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- git diff --check: ○ 空白エラーなし。Git の LF→CRLF 予告のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし

### 改善推奨
- なし

## Codexによる追加修正
- `src/data/questions/project-work.ts:246`: CPIF 計算設問の `correctAnswer` を `950` から `1,000` に修正。節約額 200 の売手シェア 100 を加えるため、売手受取は `800 + 100 + 100 = 1,000`。
- `src/data/questions/project-work.ts:248`: 上記に合わせて explanation の総受取額 / 総支払額を `1,000` に修正。
- `src/data/questions/project-work.ts:332`: `作業パフォーマンス情報 → {{blank}}` を `作業パフォーマンス情報 →{{blank}}` に修正。

## 次のタスクへの教訓
- 計算設問は `choices` に正解が含まれていても、`correctAnswer` と explanation の算術結果がずれることがあるため、指示書で指定された計算問題は手計算で再確認する。
- `{{blank}}` 周辺スペースは AST チェックと固定文字列検索の両方で確認すると漏れにくい。
