# レビュー: F2-P2 team クイズ50問 構造レビュー

> レビュー日時: 2026-05-20
> レビュー対象commit: 3a5e7f9
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/team.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・ノート照合の観点で致命問題なし。表記統一の軽微不整合 1 件（`マトリックス` → `マトリクス`）を同ファイル内で修正済み。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_team_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/team.ts` のみ。`src/pages/NoteDetail.tsx` や他カテゴリは未編集。
- 対象カテゴリ: ○ `topicId` は全件 `team`。
- import / spread: ○ `src/data/questions/index.ts` で `teamQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'team'`, `name: 'チーム'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-tm-001` 〜 `pm-tm-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-tm-\d{3}$` に準拠。

### 型・選択肢
- `questionText`: ○ 全件 `{{blank}}` が1個。
- `correctAnswer`: ○ 全件非空。
- `choices`: ○ 全件4択。
- 正解含有: ○ 全件 `choices` に `correctAnswer` を含む。
- 重複選択肢: ○ 全件なし。
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
- 対象id: ○ `pm-tm-002, 005, 006, 012, 020, 026, 028, 040, 044, 046, 049`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 0件。
- `リーダシップ` / `リーダ・シップ`: ○ 混入なし。
- `マネージメント`: ○ 混入なし。
- `マトリックス`: ○ 修正後 0件。
- `コンティンジェンシ` 系の長音抜け: ○ 混入なし。
- `TODO` / `??`: ○ 混入なし。
- `マネジリアル・グリッド`: ○ ノートと中黒あり表記で一致。
- `サーバントリーダーシップ`: ○ ノートと表記一致。

### ノート整合性
- pm-tm-009: ○ リッカートのシステム4 = 集団参画型 と NoteDetail §7 が一致。
- pm-tm-013: ○ SL理論 M3 = 能力あり・意欲不足、S3 参加型 と NoteDetail §9 が一致。
- pm-tm-014 / 015: ○ パスゴール理論 House、Fiedler の LPC スコアと NoteDetail §10 が一致。
- pm-tm-016 / 018: ○ Bass の変革型リーダーシップ、Greenleaf のサーバントリーダーシップと NoteDetail §11 / §12 が一致。
- pm-tm-020: ○ マズロー 4階層目 = 承認欲求 と NoteDetail §14 が一致。設問側の `尊厳欲求` 併記は補足として構造上問題なし。
- pm-tm-022 / 023: ○ ハーズバーグの動機づけ要因 / 衛生要因の例と NoteDetail §15 が一致。
- pm-tm-025: ○ Z理論 = Ouchi / オオウチ と NoteDetail §16 が一致。
- pm-tm-026 / 027: ○ 期待理論 Vroom の積、アダムス公平理論の投入/成果比と NoteDetail §17 が一致。
- pm-tm-046: ○ PMI 紛争7要因の Personality 系要因を確認。設問側は `人格（パーソナリティ）`、ノート側は `個性（Personality）` で表記差はあるが、英語概念は一致し、指示書指定の `人格` は設問に含まれるため修正対象外。

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
- `src/data/questions/team.ts:424`: 選択肢 `責任分担マトリックス` を、NoteDetail §26 / §27 と同じ `責任分担マトリクス` に修正。

## 次のタスクへの教訓
- クイズ構造レビューでは `validate-data` に加えて、ASTベースで `{{blank}}` 数・選択肢重複・difficulty分布・`excludeFromWritten` 設計との差分を確認すると検出漏れが減る。
- カタカナ用語は誤答選択肢にも表記ゆれが入りやすいため、正答だけでなく `choices` 全体を検索対象にする。
