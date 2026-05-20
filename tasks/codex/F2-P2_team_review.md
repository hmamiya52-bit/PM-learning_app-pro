# Codex 作業指示書: F2-P2 team クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2（クイズ550問）team カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F1.5-P3_review.md`（stakeholder レビューと同方針）

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用（修正があれば `[X] F2-P2 team Codex review: PASS with fixes`、指摘のみで修正なしは `[X] F2-P2 team Codex review: PASS`）
- 不明点があれば**自己判断せず**、`tasks/questions/F2-P2_team.md` に記録して push（実装はそこで停止）

## 1. 作業概要
Claude が投入した `src/data/questions/team.ts`（50問）に対し、stakeholder のときと同じく **型整合性・choices 配列の正解含有・id 一意性・データ品質** を観点とする構造レビューを実施する。誤答の妥当性や難易度バランスはユーザ最終確認担当。

## 2. 前提
- 関連ドキュメント:
  - `detailed_design.md` §2.7b（フェーズ1.5 パイロット運用フロー）
  - `src/types/index.ts`（`Question` 型定義）
  - `src/data/categories.ts`（team カテゴリ定義）
  - `src/pages/NoteDetail.tsx` の NOTE_DB.team（1047〜1703行、用語整合性チェック用）
- 前タスク: Claude commit `3a5e7f9` で team 50問投入済
- レビュー対象commit: `3a5e7f9` [C] F2-P2 team カテゴリ クイズ 50問投入 + 章構成設計確立

## 3. 入力ファイル（読むだけ）
- `src/data/questions/team.ts`（50問・新規）
- `src/data/questions/index.ts`（teamQuestions の import / spread 確認）
- `src/types/index.ts`（Question 型）
- `src/pages/NoteDetail.tsx` の NOTE_DB.team 全範囲（1047〜1703行）
- `scripts/validate-static-data.ts`

## 4. 出力ファイル（作成または編集）
- `tasks/reviews/F2-P2_team_codex_review.md`（新規・必須）— F1.5-P3 のレビュー記録（`tasks/reviews/F1.5-P3_*.md` がもしあれば参照、なければ F2-P0/F2-P1 系の `tasks/reviews/F2-P0_stakeholder_codex_review.md` を雛形として使用）
- 修正が必要な場合のみ: `src/data/questions/team.ts`（team 内のみ。他ファイル変更禁止）

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -3                # 最新 [C] F2-P2 team commit を確認
npm install
npm run validate-data               # [OK] が出ること（team 追加が反映される）
npm run build                       # tsc + vite build pass を確認
```

### Step 2: 件数・採番チェック
- [ ] 設問数が **ちょうど50件**
- [ ] id が **重複なく** `pm-tm-001` 〜 `pm-tm-050` で連続
- [ ] 全 id が `^pm-tm-\d{3}$` パターンに準拠
- [ ] 全エントリの `topicId === 'team'`

### Step 3: 型整合性チェック（Question 型）
各 Question について以下を検証:
- [ ] `id`: string、空でない
- [ ] `topicId`: 'team' に固定
- [ ] `questionText`: string、`{{blank}}` を **ちょうど1つ** 含む（複数空欄なし）
- [ ] `correctAnswer`: string、空でない
- [ ] `choices`: `string[]` で **長さ4**
- [ ] `choices` に `correctAnswer` が **完全一致で含まれる**（validate-data でチェック済だが二重確認）
- [ ] `choices` 内に **重複なし**
- [ ] `explanation`: string、空でない
- [ ] `difficulty`: `1 | 2 | 3` のいずれか
- [ ] `excludeFromWritten` は省略 or `boolean`（typoで他値混入なし）

### Step 4: choices の品質チェック
- [ ] 各設問の誤答3つが **互いに異なる**
- [ ] 誤答が `correctAnswer` と紛らわしすぎないか（特に類義語問題は注意）
- [ ] 誤答が **空文字** や **プレースホルダ（`TODO`、`?` 等）** でない
- [ ] 末尾の `、`「・」「。」など句読点の有無が同一設問内で統一されている

### Step 5: 難易度分布チェック
- [ ] diff 1: **おおむね 12〜16問**（設計目標 14問）
- [ ] diff 2: **おおむね 22〜30問**（設計目標 26問）
- [ ] diff 3: **おおむね 8〜12問**（設計目標 10問）
- [ ] 設計目標との合致: diff 1 = 14 / diff 2 = 26 / diff 3 = 10

### Step 6: 構造的整合性チェック
- [ ] `excludeFromWritten: true` のものは **正答が複合語・長い列挙・記号入り** であり、記述モードで一意判定が困難なもの
- [ ] 設計上 excludeFromWritten 該当の 11件:
  `pm-tm-002, 005, 006, 012, 020, 026, 028, 040, 044, 046, 049`
- [ ] 用語表記が NoteDetail.tsx NOTE_DB.team と一致するか（後述 Step 7 と関連）

### Step 7: 誤字脱字・表記揺れ
team ノート特有の表記統一チェック:
- [ ] 「リーダーシップ」表記統一（「リーダシップ」「リーダ・シップ」等混入なし）
- [ ] 「マネジメント」表記統一（「マネージメント」混入なし）
- [ ] 「マネジリアル・グリッド」表記統一（中黒の有無）
- [ ] 「サーバントリーダーシップ」表記統一
- [ ] 「タックマン」表記統一（「タックマンモデル」「Tuckman」表記混在なし、ノート本文と整合）
- [ ] 「マトリクス」表記統一（「マトリックス」混入なし）
- [ ] 「コンティンジェンシー」表記統一
- [ ] PMBOK 用語の括弧書き（例: `（PMBOK第6版 9.4）`）の半角全角・スペース統一
- [ ] 半角英数・全角記号の混在チェック（特に Power Skills / Talent Triangle 等の英語表記）
- [ ] `{{blank}}` の前後にスペース不要（NW実装に倣う）

### Step 8: ノート整合性チェック（重要）
team 領域は理論名と提唱者名のひっかけが多いため、以下を NoteDetail.tsx NOTE_DB.team と照合:
- [ ] リッカートのシステム4の「集団参画型」（pm-tm-009）
- [ ] SL理論の M3 = 「能力あり・意欲不足」と S3 参加型の対応（pm-tm-013）
- [ ] パスゴール理論の提唱者 House（pm-tm-014）
- [ ] Fiedler の LPC スコア（pm-tm-015）
- [ ] 変革型リーダーシップ提唱者 Bass（pm-tm-016）
- [ ] サーバントリーダーシップ提唱者 Greenleaf（pm-tm-018）
- [ ] マズロー 4階層目 = 「承認欲求（尊厳欲求）」（pm-tm-020）
- [ ] ハーズバーグ動機づけ要因 / 衛生要因の例（pm-tm-022, 023）
- [ ] Z理論提唱者 オオウチ（pm-tm-025）
- [ ] ブルーム期待理論 V×I×E（pm-tm-026）
- [ ] アダムス公平理論の Outcome/Input 比較（pm-tm-027）
- [ ] PMI 紛争7要因の列挙が「人格」を含む（pm-tm-046）

### Step 9: 検証スクリプト・ビルド再実行
```bash
npm run validate-data
npm run build
```
両方 pass で完了条件達成。

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_team_codex_review.md` を新規作成。F2-P0/F2-P1 のレビュー記録（例: `tasks/reviews/F2-P0_stakeholder_codex_review.md`）と同形式で、観点別に ○/△/✕ で記録。指摘事項は致命／改善推奨に分けて列挙。

### Step 11（任意）: 軽微な修正
- 誤字・表記揺れ・型外しなど **明確な誤り** は同セッション内で修正してよい
- 修正範囲は `team.ts` 内のみ
- コミットは指摘 + 修正をまとめて 1 つの `[X]` コミットでよい
- **コンテンツの中身（正答の妥当性・誤答の妥当性・難易度判断・解説の正確性）に対する変更は禁止** → ユーザ最終確認担当

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P2_team_codex_review.md` が存在し、F2 系レビューと同テンプレに沿って記入されている
- [ ] `npm run validate-data` が `[OK] 全データの整合性確認完了` で終了
- [ ] `npm run build` がエラーなく完了
- [ ] レビュー結果サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれかで明示されている
- [ ] 致命指摘がある場合は具体的な id・該当文字列が記載されている

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない（他カテゴリの問題追加・design doc 更新等は禁止）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止（ユーザ最終確認担当）
- ⚠️ team 50問の意味的変更禁止（構造を保ったまま誤字修正のみ可）

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_team_codex_review.md
# 修正があれば:
git add src/data/questions/team.ts
git commit -m "[X] F2-P2 team Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. レビュー
Codex push 後、Claude が `tasks/reviews/F2-P2_team_codex_review.md` の内容を確認。問題なければユーザ最終確認（誤答妥当性・難易度バランス・解説正確性レビュー）へ進む。

## 10. 参考: Claude が確認済の事項（Codex 二重チェック対象）
以下は Claude 投入時に確認済だが、Codex も独立に再確認すること:
- 検証スクリプト pass（50問追加後も choices 整合性 OK）
- typecheck/build pass
- 50問存在（pm-tm-001 〜 pm-tm-050）
- 難易度分布: diff 1 = 14問 / diff 2 = 26問 / diff 3 = 10問
- excludeFromWritten 付与: 11件（上記 Step 6 参照）
- ノート §1〜§35 のうち 33 セクションをカバー（§28・§33 は §27・§31-34 で代表化、§36-37 は午前II の F2-P3 と重複のため除外）
