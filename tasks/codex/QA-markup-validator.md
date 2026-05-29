# Codex 作業指示書: マークアップ整合チェッカー実装 ＋ 機械レビュー

> 作成: Claude（2026-05-29）
> 対象: 横断QA（全コンテンツのマークアップ整合検証ツール新設 ＋ build/lint/validate-data/死コード走査）
> 想定所要時間: 2〜3.5h
> 担当: Codex単独（🅧）。完了後 Claude がレビュー。

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。
- 作業開始前に必ず `git pull origin main`。
- 作業完了後に必ず `git add（明示ファイルのみ・-A 禁止）→ commit → push`。
- コミット prefix は `[X]`（例: `[X] QA マークアップ整合チェッカー実装＋機械レビュー`）。
- 不明点は `tasks/questions/QA-markup-validator.md` に記録して停止。
- **重要: コンテンツ本文の内容・正誤・マークアップ位置の妥当性は判断・修正しない**（コンテンツ品質判断は Claude/ユーザ担当）。本タスクは「機械的検出ツールの実装」と「検出結果のレポート化」まで。**検出された違反のコンテンツ側修正は一切しない**。

## 1. 背景・目的
`scripts/validate-static-data.ts`（`npm run validate-data`）は categories / choices / NOTE_DB 構造 / scoringMap×officialAnswers / essayProblems の整合は検証済だが、**マークアップ整合チェック（`docs/note_markup_rules.md` §6）が未実装**。これは過剰強調（応用情報 M2 教訓）・開閉ミスマッチ・全角`＝`混入の再発防止に直結し、今後の F2-P8/P9 新コンテンツにも効く再利用ツールになる。

本タスクで以下を行う:
- (A) `validate-static-data.ts` に **マークアップ整合チェック関数**を追加実装。
- (B) build / lint / validate-data の全採用を走らせ、死コード・未使用export・TODO/FIXME を走査し、**機械レビューレポート**を作成。

## 2. 前提・対象ファイル
- **編集してよいファイル**:
  - `scripts/validate-static-data.ts`（チェック関数を追記）
  - `tasks/reviews/QA-markup-validator_codex_review.md`（新規・レポート）
- **読むだけ（編集禁止）**: `src/data/*`, `src/pages/NoteDetail.tsx`, `docs/note_markup_rules.md`
- **触らないこと**: コンテンツデータ（`questions.ts` / `NoteDetail.tsx` の NOTE_DB / `officialAnswers.ts` / `afternoonExplanations.ts` 等）の中身。

## 3. (A) マークアップ整合チェッカーの仕様

`docs/note_markup_rules.md` §6 のチェックリストを機械化する。対象は **`==`/`__` を含みうる素文字列フィールド** と **トークン配列**。

### 3.1 走査対象フィールド
NOTE_DB（`import { NOTE_DB } from '../src/pages/NoteDetail'`）:
- `note.summary`（string）
- `note.exam_tips`（string[]）
- `section.heading`（string）
- `section.items`（string[] / 任意）
- `section.navyItems` / `section.richItems`（token[][] / 任意）→ §3.6 用に `token.text` を検査

クイズ（`import { questions } from '../src/data/questions'`）:
- `question.explanation`（string / マークアップを含みうる）

午後I解説（`import { afternoonExplanations } from '../src/data/afternoonExplanations'`）:
- `exp.overview`、`exp.rows[].point/basis/reasoning/pitfall`（現状マップは空。将来分の備えとして走査コードは入れておく）

> `essaySampleAnswers.ts` はまだ存在しないため対象外（import しない）。

### 3.2 検査ルール（素文字列フィールド）
各対象文字列 `s` について:

| ID | ルール | 区分 |
|---|---|---|
| MK1 | `(s.match(/==/g)?.length ?? 0)` が偶数（開閉ペア成立） | NG |
| MK2 | `(s.match(/__/g)?.length ?? 0)` が偶数 | NG |
| MK3 | 全角イコール `＝`(U+FF1D) を含まない | NG |
| MK4 | `===` / `____` 等の連続記号を含まない（正規表現 `/={3,}/` `/_{3,}/`） | NG |
| MK5 | 赤字直後の半角 `=`（`==X==` の閉じ直後に `=` が続く `== ... ===` 形）→ MK4 で概ね捕捉。追加で `/==[^=]+===/` を検出 | NG |
| MK6 | **過剰強調**: 1 文字列中の `==...==` ペア数が **3 以上**、または `__...__` ペア数が **3 以上** | WARN |

### 3.3 検査ルール（navyItems / richItems の token.text）§3.6
| ID | ルール | 区分 |
|---|---|---|
| MK7 | `token.text` 内に `==` または `__` を含まない（トークン化済みフィールドに生マークアップ禁止） | NG |

### 3.4 出力・終了コードの扱い（重要）
- **NG / WARN ともに、本タスクでは `errorCount` に加算しない**（＝ `validate-data` の既存 exit code を変えない）。理由: 既存コンテンツに違反があってもコンテンツ修正は Claude 担当であり、Codex 作業の失敗扱いにしないため。
- 代わりに専用カウンタ（例 `markupNg` / `markupWarn`）で集計し、`[MARKUP-NG] <場所> : <ルールID> <抜粋>` / `[MARKUP-WARN] ...` 形式で**全件 console 出力**し、末尾に集計サマリを出す。
- 「場所」は特定できる粒度で（例 `NOTE_DB[planning].sections[3].items[2]`, `questions[om-R6-2].explanation`）。
- **設計コメントに「将来 errorCount に昇格しハードゲート化できる」と明記**（Claude が違反を解消後に切替予定）。

### 3.5 実装上の注意
- 既存のスタイルに合わせ、チェックは独立関数（例 `function checkMarkup() {...}`）に切り出し、末尾の集計前に呼ぶ。
- 抜粋は長すぎないよう先頭 60 文字程度に truncate。
- token 型は既存 import（`EmphasisToken` 等）または `any` 回避で `{ style: string; text: string }` 的に最小型付け。lint を通すこと。

## 4. (B) 機械レビュー（コード変更を伴わない調査）
以下を実行し結果をレポートに記録（**修正はしない**。発見のみ）:
1. `npm run validate-data`（新チェック込み）の全出力（MARKUP 集計を含む）
2. `npm run build`（PASS/FAIL）
3. `npm run lint`（warning/error 件数と主な内容）
4. 未使用 export / 死コードの目視・grep 走査（明らかなもののみ列挙。網羅でなくてよい）
5. `TODO` / `FIXME` / `XXX` / `デバッグ` コメントの grep 一覧（ファイル:行）

## 5. 検証手順
```bash
git pull origin main
npm install
npm run validate-data   # 実装前の baseline 確認
# (A) 実装
npm run validate-data   # 新チェックが動き MARKUP 集計が出ること
npm run build           # PASS 必須
npm run lint            # 件数記録
```

## 6. 完了条件（DoD）
- [ ] `scripts/validate-static-data.ts` にマークアップチェック（MK1〜MK7）が追加され、`npm run validate-data` で MARKUP 集計が出力される。
- [ ] 新チェックは `errorCount` を変えない（既存の OK/NG 挙動を壊さない）。
- [ ] `npm run build` が PASS。
- [ ] `npm run lint` がエラー増加なし（新規コードが lint を通る）。
- [ ] `tasks/reviews/QA-markup-validator_codex_review.md` に §4 の結果と MARKUP 検出全件（NG/WARN 別）を記録。
- [ ] コンテンツデータの中身は一切変更していない（diff は `scripts/` と `tasks/reviews/` のみ）。

## 7. 注意事項・禁止事項
- ❌ コンテンツ（NOTE_DB / questions / officialAnswers 等）の本文・マークアップを修正しない。検出のみ。
- ❌ `npm install` で新規パッケージを追加しない。
- ❌ 指示書外のファイルを編集しない（UI コンポーネント等）。
- ❌ `git add -A` 禁止。`scripts/validate-static-data.ts` と `tasks/reviews/QA-markup-validator_codex_review.md` を明示 add。
- ⚠️ MK5/MK4 の正規表現は MathText（`frac{}{}` `^{}` `_{}`）を誤検出しうる。`__`(アンダースコア2連) と MathText の `_{` は別物。MK2/MK7 は `__`（連続2アンダースコア）のみを対象とし、`_{` 単体は対象外であることをコードコメントで明記。

## 8. 完了後の git 操作
```bash
git add scripts/validate-static-data.ts
git add tasks/reviews/QA-markup-validator_codex_review.md
git commit -m "[X] QA マークアップ整合チェッカー実装＋機械レビュー"
git push origin main
```

## 9. レビュー記録テンプレート（`tasks/reviews/QA-markup-validator_codex_review.md`）
```md
# QA マークアップ整合チェッカー＋機械レビュー Codex 作業メモ

## 実施内容
- validate-static-data.ts に MK1〜MK7 を追加（errorCount 非加算）

## MARKUP 検出結果
### NG（要 Claude 対応）
- <場所> : MKx <抜粋>
- ...（全件）
### WARN（過剰強調の疑い）
- <場所> : MK6 <抜粋>
- ...（全件）
### 集計
- NG: N 件 / WARN: M 件

## 機械レビュー結果
- npm run validate-data: OK / NG（既存 errorCount=…）
- npm run build: PASS / FAIL
- npm run lint: error N / warning M（主な内容）
- 未使用export/死コード候補: …
- TODO/FIXME 一覧: …（file:line）

## 所見（任意・機械的事実のみ。品質判断はしない）
```
