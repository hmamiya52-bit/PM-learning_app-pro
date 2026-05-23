# Codex 作業指示書: F2-P4 午後I 全年度 OCR + 整形 + 配点マップ機械適用（共通テンプレ）

> 作成: Claude（2026-05-23）
> 対象タスク: F2-P4（午後I 全年度 H25〜R6 = 12 年度 × 2〜3 問）
> 想定所要時間: 1 年度あたり 3〜5h（問題冊子 OCR + 公式解答 OCR + 構造化 + scoringMap 機械適用 + 検証）
> **本指示書は「全年度共通の手順」**。各回の対象年度は `tasks/codex/F2-P4_queue.md` を参照。

## 0. はじめに（毎回必ず読むこと）

- 本指示書は Codex 専用。Claude が並行して同年度を作業することはない（ターン制）。
- 作業開始前に必ず `git pull origin main` する。
- 作業完了後に必ず `git add → commit → push` する。
- コミットプリフィックス（規約）:
  - 着手時: `[X] F2-P4 <年度> OCR 着手`
  - データ投入後: `[X] F2-P4 <年度> 午後I 投入（インデックス + 公式解答 + 配点マップ）`
  - キュー更新: `[X] F2-P4 <年度> キュー更新`
- 不明点・判断つかない箇所があれば**自己判断で穴埋めしない**で、`tasks/questions/F2-P4_<年度>.md` に記録して push（実装はそこで停止）。

## 1. 作業概要

IPA 公式の **指定年度の PM 試験 午後I 問題冊子 と 公式解答例** を OCR・テキスト抽出して、以下 3 ファイルに **当該年度分を追記**する。

| 出力ファイル | 役割 | 構造 |
|---|---|---|
| `src/data/afternoonProblems.ts` | 問題インデックス | `AfternoonProblem` |
| `src/data/officialAnswers.ts` | 公式解答テキスト化 | `OfficialAnswerSet` + `AnswerRow[]` |
| `src/data/scoringMap.ts` | 配点マップ | `RowScore[]`（行インデックスで対応） |

**役割分担**:
- **Codex（本タスク）**: OCR → AfternoonProblem インデックス整形 → OfficialAnswerSet 整形 → scoringMap 機械適用 → 検証 → コミット
- **Claude（次工程）**: 投入結果の構造レビュー、合計点 100 点調整の最終判断、コンテンツ妥当性確認

### 対象年度の選定方法

1. `tasks/codex/F2-P4_queue.md` を開く
2. **状態が「未着手」の最上位の年度**を 1 つ選ぶ
3. 該当年度の問題冊子 URL / 解答例 URL を取得
4. 作業開始時に queue.md の状態を「進行中（Codex 担当 / YYYY-MM-DD）」に更新してコミット（最初の commit）
5. 作業完了時に状態を「完了」に更新（最終 commit）

**1 セッションで 1 年度のみ** 処理する（複数年度の一括処理は禁止、コンフリクトリスク回避）。

## 2. 前提

### 関連ドキュメント

- `detailed_design.md` §2.7e.2 F2-P4（フロー・完了条件）
- `detailed_design.md` §8.3〜§8.4（午後I モード / 配点マップ詳細）
- `memory/phase2_content_creation.md`（NWルール踏襲ベース）
- `src/data/afternoonProblems.ts`（既存: F1 サンプル 2 件あり）
- `src/data/officialAnswers.ts`（既存: F1 サンプル 2 件あり）
- `src/data/scoringMap.ts`（既存: F1 サンプル 2 件あり）

### IPA 著作権規約（必須遵守、F2-P3 と同じ）

- 教育目的の引用は許諾・使用料不要
- **問題文・公式解答例は IPA 公式のまま一字一句引用（改変禁止）**
- 改変している場合は注記必須
- 出典明記必須: `pdfUrl` で IPA 直リンクを指定

## 3. 入力データ

`tasks/codex/F2-P4_queue.md` の対象年度行に記載された:

- **問題冊子 PDF URL**（画像ベース、OCR 必須）
- **解答例 PDF URL**（テキスト抽出可な場合と OCR 必要な場合の両方あり）
- **年度ラベル**（例: `R5`, `H30`）
- **yearLabel 表示用**（例: `令和5（2023）`、`平成30（2018）`）
- **era**（`reiwa` または `heisei`）

## 4. 出力ファイル（編集対象）

### 4.1 `src/data/afternoonProblems.ts`

`afternoonProblems` 配列に **当該年度の各問インデックス（通常 2〜3 件）** を追記。

- **F1 サンプル 2 件（R6-PM1-1 / R6-PM1-2）は本タスクで本データに上書き**してよい（フェーズ 1 サンプルなので破棄可）
- id 規則: `<年度>-PM1-<問番号>`（例: `R5-PM1-1`, `R5-PM1-2`, `R5-PM1-3`）
- `keywords` は問題テーマから 2〜3 個（12 カテゴリ ID とは独立のフリーキーワード）

### 4.2 `src/data/officialAnswers.ts`

`officialAnswers` 配列に **当該年度の各問の公式解答セット** を追記。

- 1 問あたり 12〜18 設問程度
- 設問構造は `s`（設問番号 "1"〜"4"）、`q`（小問 "(1)" "(2)"）、`t`（ラベル "a" "①" "ア"）、`a`（解答例本文）、`essay`（記述式なら true）

### 4.3 `src/data/scoringMap.ts`

`scoringMap` の対象 id（`<年度>-PM1-<問番号>`）に **`officialAnswers.answers` の行数と一致する `RowScore[]`** を追記。行インデックスで対応する仕様（`questionPath` ではなく行順序）。

- NWルール機械適用（§ 5 Step 6 参照）
- 1 問の合計が 50 点になるよう調整（午後 I は 2 問選択 × 50 点 = 100 点満点）
- 最終的な合計点調整は Claude が後工程で確認

### 4.4 `tasks/codex/F2-P4_queue.md`

当該年度の状態を「完了（Codex / YYYY-MM-DD / commit <hash>）」に更新。

### 4.5 `tasks/reviews/F2-P4_<年度>_codex.md`

新規作成。OCR 手段・使用ツール・誤認識箇所のメモ・問ごとの設問数・配点合計の集計。

## 5. 作業手順

### Step 1: 環境セットアップと現状確認

```bash
git pull origin main
git log --oneline -5
ls src/data/afternoonProblems.ts src/data/officialAnswers.ts src/data/scoringMap.ts
```

`tasks/codex/F2-P4_queue.md` で対象年度を 1 つ選定し、状態を「進行中（Codex 担当 / YYYY-MM-DD）」に更新してコミット:

```bash
git add tasks/codex/F2-P4_queue.md
git commit -m "[X] F2-P4 <年度> OCR 着手"
git push origin main
```

### Step 2: PDF をダウンロード

```bash
mkdir -p tmp/<年度>_p4
curl -o tmp/<年度>_p4/qs.pdf  <問題冊子URL>
curl -o tmp/<年度>_p4/ans.pdf <解答例URL>
```

### Step 3: 問題冊子 OCR（問題本文・設問テキスト抽出）

午後I 問題冊子は画像ベースで OCR 必須。F2-P3 と同じ手段（Tesseract jpn + jpn_vert、または easyocr / paddleocr）。

```bash
pdftoppm -r 300 -png tmp/<年度>_p4/qs.pdf tmp/<年度>_p4/qs-page
# 各ページに OCR を実行してテキスト出力（手段は F2-P3 と同様）
```

問題冊子からは以下を抽出:
- 問題タイトル（例: 「業務システムの再構築」）
- 問題テーマのキーワード（2〜3 個）
- 設問構造（設問 1 (1)(2)(3) / 設問 2 (1)(2) など）

問題本文の全文 OCR は不要（本データ構造では問題文を持たない）。**タイトル**と**設問の階層構造**だけ把握すれば十分。

### Step 4: 公式解答例 OCR（解答テキストの構造化抽出）

公式解答 PDF はテキスト抽出可能な場合があるので先に `pdftotext` で試す:

```bash
pdftotext tmp/<年度>_p4/ans.pdf tmp/<年度>_p4/ans.txt
head -100 tmp/<年度>_p4/ans.txt
```

テキスト抽出不可の場合は `pdftoppm` + OCR を実施。

#### 解答テキストの構造化ガイド

IPA 公式解答例は通常以下のパターン:

```
問1
設問1 (1) ア: <文字列>
        b: <文字列>
     (2) <記述式の解答例文章>
設問2 (1) <記述式>
     (2) ① <記号>
        ② <記号>
...
```

これを以下の `AnswerRow[]` 形式に変換:

```ts
{ s: '1', q: '(1)', t: 'a', a: '<文字列>' },
{ s: '1', q: '(1)', t: 'b', a: '<文字列>' },
{ s: '1', q: '(2)', a: '<記述式の解答例>', essay: true },
{ s: '2', q: '(1)', a: '<記述式>', essay: true },
{ s: '2', q: '(2)', t: '①', a: '<記号>' },
{ s: '2', q: '(2)', t: '②', a: '<記号>' },
```

#### `essay` 判定ルール

以下のいずれかに該当すれば `essay: true`:
- 解答例本文が 15 文字以上
- 文末が「。」「だ」「である」など文章として完結している
- 公式解答 PDF 内に「○○字以内で答えよ」等の指示がある問

それ以外（記号・略語・数字・短い単語）は `essay: false`（または `essay` 省略）。

### Step 5: AfternoonProblem インデックス整形

`src/data/afternoonProblems.ts` の `afternoonProblems` 配列に追記:

```ts
{
  id: 'R5-PM1-1',                      // 年度-セクション-問番号
  year: 'R5',
  yearLabel: '令和5（2023）',
  era: 'reiwa',                         // R: reiwa, H: heisei
  section: 'PM1',
  number: 1,
  title: '<問題タイトル（IPA公式の見出しを使用）>',
  keywords: ['<主題>', '<副題>'],      // 2〜3 個
  questionPdfUrl: '<問題冊子URL>',
},
```

### Step 6: OfficialAnswerSet 整形

`src/data/officialAnswers.ts` の `officialAnswers` 配列に追記:

```ts
{
  id: 'R5-PM1-1',                      // afternoonProblems の id と一致
  year: 'R5',
  section: 'PM1',
  number: 1,
  pdfUrl: '<解答例URL>',
  answers: [
    { s: '1', q: '(1)', t: 'a', a: '<記号/単語>' },
    { s: '1', q: '(2)', a: '<記述例>', essay: true },
    // ... 12〜18 行
  ],
},
```

### Step 7: scoringMap 機械適用

`src/data/scoringMap.ts` の `scoringMap` に当該 id ごとに `RowScore[]` を追記。

#### NW ルール機械適用（必須・自動化）

各 `AnswerRow` を見て以下のルールで `RowScore` を生成:

```ts
function determineScore(row: AnswerRow): RowScore {
  if (row.essay) {
    // 記述式: 文字数比例
    const charCount = row.a.length
    const correct = Math.max(5, Math.min(10, Math.floor(charCount / 10)))
    return { correct, partial: Math.floor(correct / 2) }
  }
  // 数字判定（数字・カンマ・小数点・スラッシュ・範囲記号、IPアドレス含む）
  if (/^[\d.,/\-〜～:]+$/.test(row.a)) {
    return { correct: 3, partial: 1 }
  }
  // それ以外は記号・単語
  return { correct: 2, partial: 1 }
}
```

#### 合計点 50 点調整（重要）

午後I は **2 問選択 × 50 点 = 100 点満点**。1 問あたりの `correct` 合計が **50 点になるよう調整**する。

機械適用後の合計が 50 点と異なる場合の対応:
- 50 点を超える場合: `correct` の大きい記述式行から比例縮小（最低 5 点は維持）
- 50 点未満の場合: 公式の配点配分情報がないため、近い値で投入し、`tasks/reviews/F2-P4_<年度>_codex.md` に「合計 N 点（50 点に未達／超過）」を記録 → Claude が後工程で最終調整

#### 入力フォーマット

`s()` ヘルパー関数を使う既存形式に従う:

```ts
'R5-PM1-1': s([
  [2, 1],   // 設問1 (1) a
  [2, 1],   // 設問1 (1) b
  [8, 4],   // 設問1 (2) essay 80字相当
  [10, 5],  // 設問2 (1) essay 100字相当
  [2, 1],   // 設問2 (2) ア
  [2, 1],   // 設問2 (2) イ
  // ...
]),
```

### Step 8: 検証

```bash
npm run validate-data    # [OK] 期待
npm run build            # pass 期待
```

`validate-data` は以下を **自動チェック** する（Claude が本タスク準備時に午後I 系の検証を追加済み）:

- `afternoonProblems` の id 重複なし
- `afternoonProblems` / `officialAnswers` / `scoringMap` の id 集合が完全一致
- `scoringMap[id].length === officialAnswers[id].answers.length`（行数一致）
- `RowScore` の `correct >= partial >= 0`

いずれか不一致なら `[NG] N 件のエラー` で落ちるため、エラーメッセージに従って修正すること。

### Step 9: レビュー記録作成

`tasks/reviews/F2-P4_<年度>_codex.md` を新規作成。フォーマット例:

```markdown
# F2-P4 <年度> 午後I Codex 作業メモ

## 実施内容
- 問題冊子 OCR / 公式解答例 OCR / インデックス整形 / 配点マップ機械適用

## 投入問数
- <年度>-PM1-1: 設問X / 合計Y点
- <年度>-PM1-2: 設問X / 合計Y点
- <年度>-PM1-3: 設問X / 合計Y点（存在する場合のみ）

## OCR 使用ツール
- Tesseract jpn / pdftotext / etc

## 誤認識・修正箇所
- ページN: <修正前> → <修正後>

## essay 判定
- 全体XX件、うち essay=true がYY件

## 合計点（50点調整）
- <年度>-PM1-1: 合計 N 点（target 50） / 調整理由: ...

## 検証結果
- npm run validate-data: OK
- npm run build: OK

## Claude 次工程への申し送り
- 合計点 50 点に未達 / 超過した問題: ...
- 公式解答 PDF からの判断が難しかった行: ...
```

### Step 10: キュー更新

`tasks/codex/F2-P4_queue.md` で当該年度の状態を「完了（Codex / YYYY-MM-DD / commit <ハッシュ>）」に更新。

### Step 11: コミット & プッシュ

```bash
git add src/data/afternoonProblems.ts src/data/officialAnswers.ts src/data/scoringMap.ts \
        tasks/reviews/F2-P4_<年度>_codex.md tasks/codex/F2-P4_queue.md
git commit -m "[X] F2-P4 <年度> 午後I 投入（インデックス + 公式解答 + 配点マップ）"
git push origin main
```

## 6. 完了条件（DoD）

- [ ] 対象年度の 2〜3 問が `afternoonProblems` に追加（id 連番）
- [ ] 各問の `OfficialAnswerSet` が `officialAnswers` に追加（answers 行数 = 設問数）
- [ ] 各問の `scoringMap` が追加（行数 = answers 行数）
- [ ] `essay` 判定が `15 文字以上 / 文末が文章 / 字数指定あり` のいずれかで一貫
- [ ] 各問の `correct` 合計が **50 点に近い値**（±5 点以内が望ましい、超過時は明示）
- [ ] `pdfUrl` / `questionPdfUrl` が IPA 公式の有効な URL
- [ ] `npm run validate-data` PASS
- [ ] `npm run build` PASS
- [ ] `tasks/reviews/F2-P4_<年度>_codex.md` 作成済
- [ ] `tasks/codex/F2-P4_queue.md` の状態が「完了」に更新済

## 7. 注意事項・禁止事項

- ❌ 問題タイトル・公式解答例の改変禁止（IPA 著作権規約違反）
- ❌ OCR が不明瞭な箇所を推測で穴埋め禁止 — 元 PDF を必ず目視確認、判断つかなければ `tasks/questions/` に記録して停止
- ❌ 配点の手動チューニングは原則禁止（NWルール機械適用が原則）。合計 50 点超過時のみ最低限の比例縮小可
- ❌ Claude が担当する **コンテンツ妥当性確認** は禁止（次工程の Claude タスク）
- ❌ 既存 F1 サンプル（R6-PM1-1 / R6-PM1-2）以外の他年度データの改変禁止
- ❌ 複数年度を 1 セッションで処理しない（コンフリクトリスク回避、1 年度ずつ）
- ❌ `types/index.ts` や UI コンポーネントの変更禁止（データ投入だけに集中）
- ❌ `git push --force` 禁止

## 8. 次工程（Claude 担当 / 別タスク）

Codex push 完了後、Claude が以下を実施（**別セッションで対応**）:

1. `tasks/reviews/F2-P4_<年度>_codex.md` を確認
2. `git diff` で投入内容を抜き取り検査
3. 合計点 50 点未達／超過の問について最終調整判断
4. `essay` 判定の妥当性スポットチェック（10〜20%）
5. 設問構造 `(s, q, t)` の解釈が公式解答と整合しているか確認
6. `[Review]` commit で軽微修正
7. ユーザにレビュー依頼

## 9. 参考

- F2-P3 OCR テンプレ: `tasks/codex/F2-P3_ocr_template.md`（午前II 用、構造の参考）
- F2-P3 OCR キュー: `tasks/codex/F2-P3_ocr_queue.md`（年度別 URL 取得方法）
- 配点マップ詳細: `detailed_design.md` §8.4
- NW ルール: `memory/phase2_content_creation.md`
- IPA 過去問本体: https://www.ipa.go.jp/shiken/mondai-kaiotu/

## 10. URL 命名規則（推定）

R6 午前II の URL: `2024r06a_pm_am2_qs.pdf` / `2024r06a_pm_am2_ans.pdf`

午後I の URL 命名規則（推定、各年度の IPA ページで実際の URL を確認すること）:
- 末尾 `_pm_pm1_qs.pdf` = 午後I 問題冊子
- 末尾 `_pm_pm1_ans.pdf` = 午後I 解答例

ただし IPA の URL 命名は年度ごとに微妙に異なるため、各年度の IPA トップページから直リンクを取得すること（`tasks/codex/F2-P4_queue.md` に取得済 URL を記録）。
