# Codex 作業指示書: F2-P2 planning クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2（クイズ550問）planning カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_team_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 planning Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_planning.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/planning.ts`（50問）に対し，型整合性・choices 配列の正解含有・id 一意性・データ品質を観点とする構造レビューを実施する。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.planning（2324〜3120行）
- 対象commit: 本セッションの `[C] F2-P2 planning ...` commit

## 3. 入力ファイル
- `src/data/questions/planning.ts`（50問・新規）
- `src/data/questions/index.ts`（planningQuestions の import/spread 確認）
- `scripts/validate-static-data.ts`

## 4. 出力ファイル
- `tasks/reviews/F2-P2_planning_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/planning.ts`（内容のみ）

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
- [ ] 50件（pm-pl-001〜050 連続，重複なし）
- [ ] 全 id `^pm-pl-\d{3}$`
- [ ] 全 `topicId === 'planning'`

### Step 3: 型整合性チェック
team/dev-approach と同じ Question 型のフィールドチェック（id / topicId / questionText の {{blank}} 1個 / correctAnswer / choices 長さ4・正解含有・重複なし / explanation / difficulty 1|2|3 / excludeFromWritten 省略 or boolean）。

### Step 4: choices の品質チェック
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
  `pm-pl-016, 017, 021, 023, 027, 035, 036, 038, 040, 043, 050`
- [ ] 計算式 explanation の式が正確か（特に三点見積もり PERT 期待値）

### Step 7: 誤字脱字・表記揺れ
planning 特有の表記統一チェック:
- [ ] 「クリティカルパス」「クリティカルチェーン」表記統一
- [ ] 「アクティビティ」表記統一（「アクテビティ」誤記なし）
- [ ] 「ベースライン」「コスト・ベースライン」表記統一
- [ ] 「コンティンジェンシー」表記統一
- [ ] 「ローリングウェーブ」表記統一
- [ ] 「アーンドバリュー」「EVM」「EVA」表記の整合
- [ ] 略語と日本語の併記スタイル（例: `EAC（完成時総コスト見積り）`）の統一
- [ ] 半角英数・全角記号の混在チェック（NPV / ROI / IRR / RBS / WBS / CPM / CCM / PDM / AOA / AON / FS/FF/SS/SF）
- [ ] 数式表記の半角統一（`(O + 4M + P) ÷ 6` 等）
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック（重要）
planning は計算問題と用語の混同が多いので NoteDetail.tsx NOTE_DB.planning と照合:
- [ ] WBS 100% ルール定義（pm-pl-011）
- [ ] PDM 4依存関係（pm-pl-016, 017）
- [ ] リード（先取り）vs ラグ（待ち）（pm-pl-018）
- [ ] AON / AOA の違い（pm-pl-019）
- [ ] PERT 期待値 = (O + 4M + P) / 6（pm-pl-021）
- [ ] フリーフロート（FF）の定義（pm-pl-023）
- [ ] クラッシング vs ファストトラッキングのトレードオフ（pm-pl-025, 026, 027）
- [ ] コンティンジェンシー予備（既知）vs マネジメント予備（未知）（pm-pl-035, 036）
- [ ] NPV/ROI/IRR/PB の定義の正確さ（pm-pl-038〜041）
- [ ] RBS / WBS / OBS / PBS の使い分け（pm-pl-043）
- [ ] CCM のバッファ概念（pm-pl-050）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_planning_codex_review.md` を作成。team/dev-approach のレビュー記録と同形式で 🟢/🟡/🔴 サマリを明示。

### Step 11（任意）: 軽微な修正
- 誤字・表記揺れ・型外しなど明確な誤りは修正可
- コンテンツの妥当性判断はユーザ最終確認担当

## 6. 完了条件
- [ ] レビュー記録存在，🟢/🟡/🔴 明示
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル編集禁止
- ❌ `npm install` 新規パッケージ追加禁止
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性判断は禁止
- ⚠️ 50問の意味的変更禁止（誤字修正のみ可）

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_planning_codex_review.md
# 修正があれば: git add src/data/questions/planning.ts
git commit -m "[X] F2-P2 planning Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-pl-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§30 のうち 28 セクションをカバー（§11 スケジュールマネジメント計画は他カテゴリ概念で代表化，§27 ステークホルダー連携は stakeholder/team で扱う，§31-33 PMBOK対応・過去問・ひっかけは他で重複のため除外）
