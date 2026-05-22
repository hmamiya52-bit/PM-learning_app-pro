# F2-P3 H27 午前II OCR 作業記録（Codex）

作業日: 2026-05-22
担当: Codex

## 対象

- 年度: H27 / 平成27（2015）春期
- 範囲: PM 午前II 問1〜問25
- 問題PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_am2_qs.pdf
- 解答PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000f52-att/2015h27h_pm_am2_ans.pdf

## 実施内容

- `src/data/officialMorningQuestions.ts` に H27 問1〜問25 を追加
- `MORNING_YEARS` に `H27` を追加
- H27 の IPA 公式PDF URL 定数を追加
- 図表がある問4・問5・問11・問20を `figure.type = 'table'` として作成
- `explanation` は空欄のまま、Claude 解説生成待ち

## 照合方法

- IPA 公式問題PDFを取得し、PyMuPDFでページ画像化して問題文・図表を目視確認
- IPA 公式解答PDFを `pypdf` で抽出し、正解を照合
- PM試験ドットコムのH27午前IIページを補助資料として利用し、最終判断はIPA公式PDF画像と公式解答PDFに合わせた

## 図表

- 問4: 作業配分モデル表
- 問5: RACIチャート表
- 問11: IFPUG法のファンクション種別分類表
- 問20: TCO比較表

いずれもHTMLテーブルとして `figure` に格納したため、SVG生成対象ではない。

## 正解一覧

| 問 | 正解 | correctIndex |
|---:|:---:|---:|
| 1 | エ | 3 |
| 2 | エ | 3 |
| 3 | ア | 0 |
| 4 | イ | 1 |
| 5 | エ | 3 |
| 6 | エ | 3 |
| 7 | イ | 1 |
| 8 | ウ | 2 |
| 9 | ア | 0 |
| 10 | ウ | 2 |
| 11 | ウ | 2 |
| 12 | エ | 3 |
| 13 | ウ | 2 |
| 14 | イ | 1 |
| 15 | イ | 1 |
| 16 | ア | 0 |
| 17 | イ | 1 |
| 18 | エ | 3 |
| 19 | イ | 1 |
| 20 | ウ | 2 |
| 21 | ア | 0 |
| 22 | ウ | 2 |
| 23 | ウ | 2 |
| 24 | ア | 0 |
| 25 | ア | 0 |

## 分類

| categoryId | 問数 | 問番号 |
|---|---:|---|
| governance | 4 | 1, 20, 22, 23 |
| measurement | 4 | 2, 4, 10, 11 |
| delivery | 4 | 13, 14, 16, 21 |
| planning | 3 | 7, 8, 9 |
| service-management | 3 | 19, 24, 25 |
| project-work | 2 | 3, 15 |
| team | 2 | 5, 6 |
| development-approach | 2 | 17, 18 |
| uncertainty | 1 | 12 |

合計: 25問

## 注記

- 問2の数式選択肢は、既存データの表記に合わせて `frac{...}{...}` 形式で格納した。
- 問4は公式PDFの作業配分モデル表をHTMLテーブル化した。
- 問5のRACI表では、空欄相当のセルを既存年度と同じく `－` で表記した。
- 問15は調達に関する箇条書き条件を問題文内に保持した。
- 問20は「単位 百万円」のTCO表として格納した。
- 問25の選択肢は公式表記に合わせて `ディジタル署名` とした。

## 検証

- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（H27はテーブル図表のみのため新規SVGなし）
- `npm run build`: OK
- `git diff --check`: OK（既存のCRLF警告のみ）
