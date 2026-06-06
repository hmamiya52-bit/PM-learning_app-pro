# Codex 作業指示書: 午後I 独自解説（全37問）機械QA ＋ detail マークアップ検査拡張

> 作成: Claude（2026-06-06）
> 対象: `src/data/afternoonExplanations.ts`（午後I 独自解説・全37問完成済）の**機械的整合性の網羅検証**
> 想定所要時間: 2〜3h
> 担当: Codex単独（🅧）。完了後 Claude がレビュー。

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。
- 作業開始前に必ず `git pull origin main`。
- 作業完了後に必ず `git add（明示ファイルのみ・-A 厳禁）→ commit → push`。コミット prefix は `[X]`。
- 不明点は `tasks/questions/F2-P8_afternoon1_QA.md` に記録して停止。
- **最重要: コンテンツ本文の「内容・正誤・分かりやすさ・根拠の妥当性・マークアップ位置の良し悪し」は一切判断・修正しない**（＝品質判断は Claude/ユーザ担当）。本タスクは **機械的・構造的な整合検証ツールの実装と、検出結果のレポート化まで**。検出された違反の**コンテンツ側修正はしない**（Claude が後で対応）。

## 1. 背景・目的
F2-P8 で午後I 独自解説（`afternoonExplanations.ts`）が **37/37問 完成**した（R6〜H25 全年度）。各問は `overview` ＋ `rows[]`（officialAnswers と rowKey で1:1）＋ `detail`（`problemSections` / `figures` / `questionDetails` / `keyKnowledge` / `solvingTips`）から成る。

現状の `npm run validate-data` のマークアップ検査（MK1〜MK7）は **`rows`/`overview` のみ走査し、`detail` 配下を走査しない**（`docs/afternoon_explanation_authoring_rules.md` §6 に「将来候補: detail にも拡張」と明記）。量産では「==開き → __閉じ の不整合」「全角 `＝` 混入」を `detail` で頻発させやすく、現状は Claude の手動 python チェックに依存している。本タスクで**機械検査を `detail` まで拡張**し、さらに**rowKey/件数/figures構造/modelAnswer逐語の構造監査**を一括で行う。

本タスクで行うこと:
- (A) `validate-static-data.ts` のマークアップ検査を **`afternoonExplanations[].detail` 配下の文字列フィールドにも拡張**。
- (B) 午後I 解説の**構造整合監査**（37問の rowKey 完全一致／件数一致／figures 構造／modelAnswer 逐語）を実装し全件レポート。
- (C) `validate-data` / `build` / `tsc` / `lint` を走らせ、結果と全検出を `tasks/reviews/F2-P8_afternoon1_codex_QA.md` に記録。

## 2. 前提・対象ファイル
- **編集してよいファイル**:
  - `scripts/validate-static-data.ts`（検査関数を追記）
  - `tasks/reviews/F2-P8_afternoon1_codex_QA.md`（新規・レポート）
- **読むだけ（編集禁止）**: `src/data/afternoonExplanations.ts`, `src/data/officialAnswers.ts`, `src/data/scoringMap.ts`, `docs/afternoon_explanation_authoring_rules.md`, `docs/note_markup_rules.md`
- **絶対に触らないこと**: `src/data/afternoonExplanations.ts` の中身（コンテンツ）。`officialAnswers.ts` / `scoringMap.ts`（IPA引用データ）。UIコンポーネント。

## 3. (A) detail マークアップ検査の拡張

既存の MK1〜MK6（`docs/note_markup_rules.md` §6 / 既存実装）を、`afternoonExplanations` の各エントリの **detail 配下の素文字列フィールド**にも適用する。**`errorCount` には加算しない**（既存 exit code を変えない。`markupNg`/`markupWarn` 相当の専用カウンタで集計）。

### 3.1 走査対象フィールド（detail 配下）
`import { afternoonExplanations } from '../src/data/afternoonExplanations'`：
- `exp.detail.problemSections[].heading`（string）
- `exp.detail.problemSections[].body`（string）
- `exp.detail.figures[]`:
  - compare: `.title`, `.note?`, `.columns[]`, `.rows[].label`, `.rows[].cells[]`
  - diagram: `.title`, `.note?`, `.nodes[].label`, `.edges[].label?`
- `exp.detail.questionDetails[].asked`（string）
- `exp.detail.questionDetails[].thinkingProcess[]`（string[]）
- `exp.detail.questionDetails[].commentary`（string）
- `exp.detail.keyKnowledge[].term`, `.description`（string）
- `exp.detail.solvingTips[]`（string[] / 任意）

> **除外（走査しない）**: `exp.detail.questionDetails[].modelAnswer`（IPA解答例の逐語コピーで、素のまま描画する設計のためマークアップ非対象）。`exp.detail.questionDetails[].heading`（「設問1」等の固定ラベル）は走査して構わない（実害なし）。
> 既存の `rows`/`overview` 走査はそのまま残す（重複しても可）。

### 3.2 検査ルール（既存 MK を流用）
| ID | ルール | 区分 |
|---|---|---|
| MK1 | `==` の出現数が偶数（開閉ペア成立） | NG |
| MK2 | `__` の出現数が偶数 | NG |
| MK3 | 全角イコール `＝`(U+FF1D) を含まない | NG |
| MK4 | `={3,}` / `_{3,}` の連続記号を含まない | NG |
| MK6 | 1文字列中の `==...==` ペアが3以上、または `__...__` ペアが3以上（過剰強調） | WARN |

- **stray marker 検査（重要・最頻出の不具合）**: 各文字列で「`==[^=]+==` と `__[^_]+__` を除去した後に `==` または `__` が残らない」ことを確認する（＝開き記号と閉じ記号の種類ミスマッチ `==X__` を検出）。MK1/MK2 の偶数判定だけでは `==X__ ... __Y==` のような相殺ケースを見逃すため、**この残存検査を NG として必ず入れる**。
- 「場所」は特定できる粒度で出力（例 `afternoonExplanations[H25-PM1-1].detail.problemSections[2].body`, `...questionDetails[3|(1)|].commentary`, `...figures[1].rows[0].cells[1]`）。抜粋は先頭60字に truncate。

## 4. (B) 午後I 解説の構造整合監査

`afternoonExplanations` の各エントリについて以下を検証し、違反を**全件レポート**（NG/INFO を区別。`errorCount` 非加算）。`makeRowKey(s,q,t)` は `afternoonExplanations.ts` から export 済（`${s}|${q??''}|${t??''}`）。`officialAnswers` から対象 id の `answers[]` を引く。

### 4.1 件数・存在
- B1: `afternoonExplanations` の id 数が **37**（R6/R5/R4/R3/R2/R1/H30/H29/H28/H27/H26 各3 ＝ 33 ＋ H25 ×4 ＝ 37）。
- B2: 各 id が `officialAnswers` に**同一 id で存在**し、その `section` が `PM1` である。
- B3: 各エントリで `exp.id === （マップのキー）`（キーと id プロパティの一致）。

### 4.2 rowKey 完全一致（最重要）
各 id について、`officialAnswers[id].answers[]` から期待 rowKey 集合 `E = { makeRowKey(s,q,t) }`（**順序保持・重複なし**）を作り：
- B4: `exp.rows[].rowKey` の集合・順序が **E と完全一致**（欠落・余剰・順序違いを NG 報告。**t 部分まで厳密**に。例 `2|(1)|a`, `3|(3)|開発要員の手配`, `2|(2)|使用頻度が`）。
- B5: `exp.detail.questionDetails[].rowKey` の集合が **E と完全一致**（順序は問わないが欠落・余剰を NG 報告）。
- B6: `exp.rows.length === exp.detail.questionDetails.length === officialAnswers[id].answers.length`。

### 4.3 modelAnswer 逐語一致（INFO 報告）
各 `questionDetails[rowKey].modelAnswer` を、対応する `officialAnswers` の解答 `a` と比較：
- 期待値 `expected = a.replace(/\n/g, '／')`（複数解答は本文では `\n`、detail では全角スラッシュ `／` で連結する規約）。
- B7: `modelAnswer === expected` でなければ **INFO** として `<rowKey> 期待:<expected 抜粋> 実際:<modelAnswer 抜粋>` を報告（**NG にしない**。意図的な差異もあり得るため Claude がレビューする）。
  - 比較は**正規化なしの厳密一致**で行う（半角スペース「K 社」「W 社」「M 社」「U 社」「1 月」・全角カンマ「，」・末尾句点「。」を保持しているかの検出が目的）。

### 4.4 figures 構造
各 `exp.detail.figures[]`：
- B8（compare）: `kind==='compare'` のとき `columns.length <= 3` かつ **すべての `rows[].cells.length === columns.length - 1`**（観点列ぶんを除く）。違反は NG。
- B9（diagram）: `kind==='diagram'` のとき
  - すべての `nodes[].col` が `0 <= col <= 1.0`（モバイル375可読性のため col は 0〜1 制約）。範囲外は NG。
  - すべての `nodes[].accent`（指定時）が `{ 'brand','indigo','emerald','amber','rose','slate' }` のいずれか。違反は NG。
  - すべての `edges[].from` / `edges[].to` が `nodes[].id` のいずれかに存在。未解決参照は NG。

### 4.5 補助（INFO）
- B10: 各エントリに `detail` が存在し、`problemSections.length >= 1` かつ `keyKnowledge.length >= 1`（空 detail の検出。INFO）。

## 5. 検証手順
```bash
git pull origin main
npm install
npm run validate-data   # baseline（既存 exit code を控える）
# (A)(B) 実装
npm run validate-data   # 拡張検査＋構造監査の集計が出ること。既存 errorCount を変えないこと
npm run build           # PASS 必須
npx tsc --noEmit        # PASS
npm run lint            # 件数記録
```

## 6. 完了条件（DoD）
- [ ] `validate-static-data.ts` のマークアップ検査が `afternoonExplanations[].detail` 配下（§3.1）まで走査し、stray marker 残存検査を含む（MK1〜MK4/MK6）。
- [ ] §4 の構造監査（B1〜B10）が実装され、`npm run validate-data` で集計が出力される。
- [ ] 拡張検査・構造監査とも `errorCount` を変えない（既存の OK/NG 挙動・exit code を壊さない）。
- [ ] `npm run build` PASS / `npx tsc --noEmit` PASS / `npm run lint` エラー増加なし。
- [ ] `tasks/reviews/F2-P8_afternoon1_codex_QA.md` に §3/§4 の検出を**全件**記録（NG/WARN/INFO 別）。
- [ ] コンテンツ（`afternoonExplanations.ts` 等）の中身は一切変更していない（diff は `scripts/` と `tasks/reviews/` のみ）。

## 7. 注意事項・禁止事項
- ❌ コンテンツ本文・マークアップを修正しない（検出のみ）。品質・分かりやすさ・根拠妥当性は判断しない。
- ❌ `npm install` で新規パッケージを追加しない。
- ❌ 指示書外のファイルを編集しない。
- ❌ `git add -A` 厳禁。`scripts/validate-static-data.ts` と `tasks/reviews/F2-P8_afternoon1_codex_QA.md` のみ明示 add。
- ⚠️ `__`（連続2アンダースコア）と MathText の `_{`（下付き）は別物。検査対象は `__` のみ。`afternoonExplanations` には MathText はほぼ無いが、誤検出回避のため `==`/`__` の2連記号だけを対象にする。
- ⚠️ B7（modelAnswer）は **NG ではなく INFO**。逐語コピーの差異は Claude が個別判断するため、検出して並べるだけにする。

## 8. 完了後の git 操作
```bash
git add scripts/validate-static-data.ts
git add tasks/reviews/F2-P8_afternoon1_codex_QA.md
git commit -m "[X] 午後I解説 全37問 機械QA＋detailマークアップ検査拡張"
git push origin main
```

## 9. レビュー記録テンプレート（`tasks/reviews/F2-P8_afternoon1_codex_QA.md`）
```md
# 午後I解説 全37問 機械QA Codex 作業メモ

## 実施内容
- validate-static-data.ts に detail マークアップ検査（§3）＋構造監査（§4）を追加（errorCount 非加算）

## (A) detail マークアップ検出
### NG（stray marker / 全角＝ / === 等）
- <場所> : MKx <抜粋>
- ...（全件。無ければ「なし」）
### WARN（MK6 過剰強調）
- <場所> : MK6 <抜粋>
- ...（全件）

## (B) 構造監査
- B1 id数: 37 / 実際 N
- B2/B3 id存在・key一致: OK / NG（<id> ...）
- B4 rows rowKey 完全一致: 全37問 OK / NG（<id>: 欠落/余剰/順序 ...）
- B5 questionDetails rowKey 一致: OK / NG（...）
- B6 件数一致 rows==details==answers: OK / NG（<id>: r=.. d=.. a=..）
- B7 modelAnswer 逐語（INFO・全件）: <id> <rowKey> 期待/実際 ...
- B8 compare cells長: OK / NG（<id> figures[i] ...）
- B9 diagram col範囲/accent/edge参照: OK / NG（...）
- B10 detail存在: OK / INFO（...）

## 機械検証
- npm run validate-data: 既存 errorCount=… を変えず / MARKUP・構造集計 …
- npm run build: PASS / FAIL
- npx tsc --noEmit: PASS / FAIL
- npm run lint: error N / warning M

## 所見（機械的事実のみ。品質判断はしない）
```
