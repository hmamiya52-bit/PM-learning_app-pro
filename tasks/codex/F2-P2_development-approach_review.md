# Codex 作業指示書: F2-P2 development-approach クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2（クイズ550問）development-approach カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_team_review.md`（team レビューと同方針）

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]`（`[X] F2-P2 development-approach Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_development-approach.md` に記録して実装停止

## 1. 作業概要
Claude が投入した `src/data/questions/development-approach.ts`（50問）に対し，型整合性・choices 配列の正解含有・id 一意性・データ品質を観点とする構造レビューを実施する。

## 2. 前提
- 関連ドキュメント:
  - `src/types/index.ts`（`Question` 型定義）
  - `src/data/categories.ts`（development-approach カテゴリ定義）
  - `src/pages/NoteDetail.tsx` の NOTE_DB['development-approach']（1704〜2323行）
- 前タスク: Claude commit `[C] F2-P2 development-approach 50問投入`（本セッション）
- レビュー対象commit: 該当 `[C]` commit（git log で確認）

## 3. 入力ファイル（読むだけ）
- `src/data/questions/development-approach.ts`（50問・新規）
- `src/data/questions/index.ts`（developmentApproachQuestions の import / spread）
- `src/types/index.ts`
- `src/pages/NoteDetail.tsx` の NOTE_DB['development-approach'] 全範囲（1704〜2323行）
- `scripts/validate-static-data.ts`

## 4. 出力ファイル（作成または編集）
- `tasks/reviews/F2-P2_development-approach_codex_review.md`（新規・必須）
- 修正が必要な場合のみ: `src/data/questions/development-approach.ts` 内のみ

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -5
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 設問数が **ちょうど50件**
- [ ] id が **重複なく** `pm-da-001` 〜 `pm-da-050` で連続
- [ ] 全 id が `^pm-da-\d{3}$` パターンに準拠
- [ ] 全エントリの `topicId === 'development-approach'`

### Step 3: 型整合性チェック（team レビューと同じ）
各 Question について `id` / `topicId` / `questionText` (`{{blank}}` 1個) / `correctAnswer` / `choices`（長さ4・正解含有・重複なし）/ `explanation` / `difficulty` (1|2|3) / `excludeFromWritten`（省略 or boolean）を確認。

### Step 4: choices の品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答（実質的に複数正解扱いになるリスク）
- 空文字・プレースホルダ混入なし
- 句読点統一

### Step 5: 難易度分布チェック
- [ ] diff 1: **おおむね 12〜16問**（設計目標 14問）
- [ ] diff 2: **おおむね 22〜30問**（設計目標 26問）
- [ ] diff 3: **おおむね 8〜12問**（設計目標 10問）

### Step 6: 構造的整合性チェック
- [ ] `excludeFromWritten: true` のものは複合語・列挙・記号入りの正答
- [ ] 設計上 excludeFromWritten 該当の 11件:
  `pm-da-004, 011, 014, 023, 030, 031, 032, 035, 038, 040, 046`

### Step 7: 誤字脱字・表記揺れ
development-approach 特有の表記統一チェック:
- [ ] 「アジャイル」表記統一（カタカナ表記，英語 Agile の混在チェック）
- [ ] 「スクラム」表記統一（Scrum との混在）
- [ ] 「ウォーターフォール」表記統一（「ウォータフォール」混入なし）
- [ ] 「マニフェスト」表記統一（「マニュフェスト」誤記なし）
- [ ] 「プロダクトオーナー」「スクラムマスター」表記統一
- [ ] 「インクリメント」「イテレーション」表記統一
- [ ] 「テスト」表記統一（「テスト」「テスティング」混在なし）
- [ ] PMBOK 用語の括弧書きの半角全角・スペース統一
- [ ] 半角英数・全角記号の混在チェック（DevOps, CI/CD, INVEST, WIP 等の英略語）
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック（重要）
理論名・年代・提唱者名のひっかけが多いため，以下を NoteDetail.tsx NOTE_DB['development-approach'] と照合:
- [ ] アジャイルマニフェスト発表年 = 2001（pm-da-021）
- [ ] ウォーターフォール提唱者 Royce + 提唱年 1970（pm-da-013）
- [ ] アジャイル宣言 4 価値の正確な文言（pm-da-023, 024）
- [ ] アジャイル宣言 12 原則の数（pm-da-025）
- [ ] スクラムの 3 役割 = PO / SM / Developers（pm-da-032）
- [ ] スクラム経験主義 3 本柱 = 透明性・検査・適応（pm-da-031）
- [ ] スクラム 5 イベント（pm-da-035）
- [ ] スクラム 3 成果物 = PB / SB / Increment（pm-da-038）
- [ ] INVEST 6 要素（pm-da-040）
- [ ] スプリント期間 = 1 か月以内（pm-da-037）
- [ ] XP 5 価値 = Communication/Simplicity/Feedback/Courage/Respect（pm-da-046）
- [ ] V字モデルの工程対応（pm-da-015）

### Step 9: 検証スクリプト・ビルド再実行
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_development-approach_codex_review.md` を新規作成。F2 系レビュー（例: `tasks/reviews/F2-P0_stakeholder_codex_review.md`）と同形式で記録。

### Step 11（任意）: 軽微な修正
誤字・表記揺れ・型外しなど明確な誤りは同セッション内で修正可。コンテンツの妥当性判断はユーザ最終確認担当。

## 6. 完了条件（DoD）
- [ ] レビュー記録が存在し，PASS / PASS with fixes / RESTART が明示
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK
- [ ] 致命指摘は具体的な id・該当文字列を記載

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない
- ❌ `npm install` で新規パッケージ追加なし
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性判断は禁止（ユーザ担当）
- ⚠️ 意味的変更禁止（誤字修正のみ可）

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_development-approach_codex_review.md
# 修正があれば:
git add src/data/questions/development-approach.ts
git commit -m "[X] F2-P2 development-approach Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude が確認済の事項（Codex 二重チェック対象）
- 検証スクリプト pass
- typecheck/build pass
- 50問存在（pm-da-001 〜 pm-da-050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件（上記 Step 6 参照）
- ノート §1〜§32 のうち 27 セクションをカバー（§25 その他のアジャイル手法は他カテゴリに散在のため省略，§28 段階的詳細化は planning で扱う，§31-32 過去問頻出・ひっかけは F2-P3 と重複のため除外）
