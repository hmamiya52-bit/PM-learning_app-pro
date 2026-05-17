# Codex 作業指示書: F2-P3 公式午前II 全年度 OCR + 構造化投入（共通テンプレ）

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P3（公式午前II 全年度 約325問）の OCR フェーズ
> 想定所要時間: 1年度あたり 2〜3h（OCR + 25問抽出 + 検証）
> **本指示書は「全年度共通の手順」**。各回の対象年度は `tasks/codex/F2-P3_ocr_queue.md` を参照。

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P3 <年度ラベル> 午前II OCR 投入（解説は次工程）`
- 不明点があれば**自己判断せず**、`tasks/questions/F2-P3_<年度>.md` に記録して push（実装はそこで停止）

## 1. 作業概要

IPA 公式の **指定年度の PM 試験 午前II 問題冊子（25問）** を OCR で読み取り、`src/data/officialMorningQuestions.ts` の `officialMorningQuestions` 配列に構造化データとして追記する。

**役割分担**（F1.5-P4 と同じ）:
- **Codex（本タスク）**: OCR → 問題文・選択肢・正解の構造化データ作成（`explanation` は空文字 `''` でOK）
- **Claude（次工程）**: 各問の独自解説（`explanation`）を生成 + 図表処理（SVG/table）

### 対象年度の選定方法
1. `tasks/codex/F2-P3_ocr_queue.md` を開く
2. **状態が「未着手」の最上位の年度**を1つ選ぶ
3. 該当年度の問題冊子 URL / 解答例 URL を取得
4. 作業開始時に queue.md の状態を「進行中（Codex 担当）」に更新してコミット（最初の commit）
5. 作業完了時に状態を「完了」に更新（最終 commit）

**1セッションで1年度のみ**処理する（複数年度の一括処理は禁止、コンフリクトリスク回避）。

## 2. 前提

### 関連ドキュメント
- `detailed_design.md` v0.20 §2.7e.2 F2-P3（フロー・完了条件）
- `docs/morning_question_authoring_rules.md` v1.0 ★必読（午前II作成ルール、図表 SVG セルフチェックを含む）
- `memory/risks.md` R1（IPA 著作権規約）
- `src/types/index.ts` line 88〜122（`OfficialMorningQuestion` 型 / `QuestionFigure`）
- `src/data/officialMorningQuestions.ts`（既存: F1.5-P4 R6 秋期 25問投入済）

### IPA 著作権規約（必須遵守、F1.5-P4 と同じ）
- 教育目的の引用は許諾・使用料不要
- **問題文・選択肢は IPA 公式のまま一字一句引用（改変禁止）**
- 改変している場合は明記
- 出典明記必須: `sourceUrl` で IPA URL を指定

## 3. 入力データ

`tasks/codex/F2-P3_ocr_queue.md` の対象年度行に記載された:
- **問題冊子 PDF URL**（画像ベース、OCR 必須）
- **解答例 PDF URL**（テキスト抽出可、正解一覧）
- **年度ラベル**（例: `R5`, `H30`）
- **yearLabel 表示用**（例: `令和5（2023）`、`平成30（2018）`）

## 4. 出力ファイル

- `src/data/officialMorningQuestions.ts`（編集）— `officialMorningQuestions` 配列に **当該年度 25問を追記**
  - 既存の R6 秋期 25問 や他年度の投入済みデータは **削除・改変禁止**
  - 新規 25問の id は `om-<年度>-1` 〜 `om-<年度>-25`（例: `om-R5-1` 〜 `om-R5-25`）
- `MORNING_YEARS` 定数を更新（例: `['R6', 'R5'] as const` → `['R6', 'R5', 'R4'] as const`）
- `tasks/codex/F2-P3_ocr_queue.md`（編集）— 状態を「完了」に更新
- `tasks/reviews/F2-P3_<年度>_codex_ocr.md`（新規）— OCR 手段・使用ツール・誤認識箇所のメモ

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -5
ls src/data/officialMorningQuestions.ts
```

`tasks/codex/F2-P3_ocr_queue.md` で対象年度を1つ選定し、状態を「進行中（Codex 担当 / YYYY-MM-DD）」に更新してコミット:
```bash
git add tasks/codex/F2-P3_ocr_queue.md
git commit -m "[X] F2-P3 <年度> OCR 着手"
git push origin main
```

### Step 2: PDF をダウンロード
```bash
mkdir -p tmp/<年度>_ocr
# 問題冊子と解答例を取得（queue.md に記載のURLを使用）
curl -o tmp/<年度>_ocr/qs.pdf <問題冊子URL>
curl -o tmp/<年度>_ocr/ans.pdf <解答例URL>
```

### Step 3: 解答例 PDF から正解一覧を抽出
解答例 PDF はテキスト抽出可能なので、`pdftotext` 等で抽出:
```bash
pdftotext tmp/<年度>_ocr/ans.pdf - | head -100
```
問1〜25 の正解（ア/イ/ウ/エ）を一覧化。`ア=0, イ=1, ウ=2, エ=3` で `correctIndex` に変換。

### Step 4: OCR 環境のセットアップ
F1.5-P4 で確立した手段を再利用:
- **Tesseract**（jpn / jpn_vert）が最有力
- 代替: `easyocr`, `paddleocr`
- 最終手段: 手動 OCR

### Step 5: PDF をページ画像に変換
```bash
# pdftoppm（poppler-utils）
pdftoppm -r 300 -png tmp/<年度>_ocr/qs.pdf tmp/<年度>_ocr/page

# または Python pdf2image
python -c "
from pdf2image import convert_from_path
images = convert_from_path('tmp/<年度>_ocr/qs.pdf', dpi=300)
for i, img in enumerate(images, 1):
    img.save(f'tmp/<年度>_ocr/page-{i:02d}.png')
"
```

### Step 6: OCR 実行 + テキスト抽出
F1.5-P4 と同じ手順。各ページの問題文・選択肢をテキストファイルに保存。

### Step 7: 構造化データへの整形

OCR 結果を `OfficialMorningQuestion` 型に整形して `officialMorningQuestions` 配列に追記:

```ts
{
  id: 'om-R5-1',           // 年度に応じて変える
  year: 'R5',
  yearLabel: '令和5（2023）',
  number: 1,
  questionText: '<IPA公式の問題文を一字一句正確に>',
  choices: [
    'ア の選択肢の本文',     // 「ア」プレフィックスは含めない
    'イ の選択肢の本文',
    'ウ の選択肢の本文',
    'エ の選択肢の本文',
  ],
  correctIndex: 1,         // 解答例より
  explanation: '',         // Claude が後工程で追記（OCR フェーズでは空）
  categoryId: 'stakeholder', // 12カテゴリから推定、判断つかなければ省略可
  sourceUrl: '<問題冊子URL>',
  // figure: 図表は OCR フェーズでは扱わない（Claude が後工程で SVG/table 化）
  //         図表ありの問題は categoryId 末尾に '(figure)' を付ける
}
```

#### categoryId 推定ガイド（12カテゴリ）
- `stakeholder` — ステークホルダー識別・分析・エンゲージメント
- `team` — チーム・リーダーシップ・モチベーション・組織形態・RACI
- `development-approach` — 予測型／適応型／ハイブリッド・スクラム・カンバン・XP
- `planning` — スコープ・WBS・スケジュール（PDM/CPM/PERT）・コスト・見積もり
- `project-work` — 統合管理（CCB）・調達（契約形態）・知識管理・コミュニケーション
- `delivery` — 価値実現・受入・品質
- `measurement` — EVM・KPI・パフォーマンス測定・予測
- `uncertainty` — リスク管理・機会管理
- `integration` — 統合・変更管理
- `governance` — ガバナンス・原則・PMO・ポートフォリオ
- `tailoring-models` — テーラリング・モデル・手法
- `service-management` — ITIL・SLA・運用引継ぎ・システム監査・法務

#### 重要: 一字一句引用ルール（F1.5-P4 と同じ）
- **OCR の誤認識は必ず元 PDF と目視照合して修正**
- 全角/半角の英数字、長音記号「ー」「－」、丸数字、ローマ数字（Ⅰ Ⅱ）は原文に合わせる
- 漢字の旧字/新字、送り仮名揺れも原文通り
- **図表が含まれる問題**（問題文中に「次の図」「次の表」等）の場合:
  - 本文に「[次の図参照（IPA原PDFを参照）]」と注記
  - `categoryId` 末尾に `(figure)` を付けておく（Claude が後工程で SVG/table 化判断）
  - `figure` フィールドは OCR フェーズでは設定しない（Claude が `docs/morning_question_authoring_rules.md` に従って生成）

### Step 8: ファイル更新

`src/data/officialMorningQuestions.ts` の `officialMorningQuestions` 配列に 25問を追記:
- 既存の R6 や他年度のデータの後ろに追加（順序は新しい年度 → 古い年度）
- ファイル冒頭コメントを更新（投入完了年度を反映）
- `MORNING_YEARS` 定数に当該年度を追加

### Step 9: 検証

```bash
npm run validate-data   # [OK] 期待
npm run build           # pass 期待
```

`validate-data` は `OfficialMorningQuestion` の構造を厳格チェックする（basic_design §5.9）。
- 件数（年度ごとに25問）
- id 重複なし
- correctIndex が 0-3 範囲内
- choices が4要素
- 必須フィールド非空

### Step 10: レビュー記録

`tasks/reviews/F2-P3_<年度>_codex_ocr.md` を新規作成。F1.5-P4 の `tasks/reviews/F1.5-P4_codex_ocr.md` のフォーマットに従い:
- 使用 OCR ツール
- ページ別誤認識箇所と修正内容
- 図表ありの問題リスト（番号・問題タイトル概要）
- 解答例 PDF との正解突合結果
- 推定 categoryId 分布

### Step 11: キュー更新
`tasks/codex/F2-P3_ocr_queue.md` で当該年度の状態を「完了（Codex / YYYY-MM-DD / commit <ハッシュ>）」に更新。

### Step 12: コミット & プッシュ
```bash
git add src/data/officialMorningQuestions.ts tasks/reviews/F2-P3_<年度>_codex_ocr.md tasks/codex/F2-P3_ocr_queue.md
git commit -m "[X] F2-P3 <年度> 午前II 25問 OCR 投入（解説は次工程）"
git push origin main
```

## 6. 完了条件（DoD）

- [ ] 対象年度の 25問が `officialMorningQuestions` 配列に追記されている（id 連番）
- [ ] 各問の `correctIndex` が解答例 PDF の正解と一致
- [ ] 各問の `questionText` / `choices` が IPA 原本と一字一句一致（OCR 誤認識を目視修正済み）
- [ ] `explanation` は全問 `''` 空文字（Claude が次工程で追記）
- [ ] `sourceUrl` は問題冊子の URL を指定
- [ ] `npm run validate-data` PASS
- [ ] `npm run build` PASS
- [ ] 図表が含まれる問題は `categoryId` 末尾に `(figure)` 注記済
- [ ] `tasks/reviews/F2-P3_<年度>_codex_ocr.md` 作成済
- [ ] `tasks/codex/F2-P3_ocr_queue.md` の状態が「完了」に更新済

## 7. 注意事項・禁止事項

- ❌ 問題文・選択肢の改変禁止（IPA 著作権規約違反）
- ❌ 推測で穴埋め禁止 — OCR が不明瞭な箇所は元 PDF を必ず目視確認
- ❌ Claude が担当する `explanation` の生成は禁止（次工程の Claude タスク）
- ❌ Claude が担当する `figure`（SVG/table）の生成は禁止（次工程の Claude タスク）
- ❌ 指示書外のファイルを編集しない（types/index.ts や他データファイル・ノートデータは変更禁止）
- ❌ 既存年度（投入済み）のデータ改変禁止
- ❌ 複数年度を1セッションで処理しない（コンフリクトリスク回避、1年度ずつ）
- ❌ `git push --force` 禁止

## 8. 次工程（Claude 担当 / 別タスク）

Codex push 完了後、Claude が以下を実施（**別セッションで対応**）:
- `tasks/reviews/F2-P3_<年度>_codex_ocr.md` を確認
- `git diff` で OCR 抽出内容を抜き取り検査
- 各問の `explanation` を独自作成して追記（PMBOK第6版＋第7版＋IPAシラバスベース）
- `categoryId` 未設定 or `(figure)` 注記分の振り分け判断
- `figure`（SVG/table）の生成 — `docs/morning_question_authoring_rules.md` §3-§4 厳守
  - SVG 白ハロー必須
  - Inkscape PNG セルフチェック
  - table 構造の整合性
- 数式マークアップ（^{} / frac{}{}）の波括弧バランス
- `build` / `validate-data` 再実行 → `[Review]` commit
- 完了後 `tasks/codex/F2-P3_<年度>_review.md` を作成して Codex に構造レビュー依頼

## 9. 参考

- F1.5-P4 OCR 指示書: `tasks/codex/F1.5-P4_ocr.md`（R6 秋期投入時のテンプレ）
- F1.5-P4 OCR レビュー記録: `tasks/reviews/F1.5-P4_codex_ocr.md`
- F1.5-P4 構造レビュー指示書: `tasks/codex/F1.5-P4_review.md`
- 午前II作成ルール: `docs/morning_question_authoring_rules.md` v1.0
- IPA 過去問本体: https://www.ipa.go.jp/shiken/mondai-kaiotu/
