# F2-P3 H25 午前II OCR 作業記録（Codex）

作業日: 2026-05-22
担当: Codex

## 対象

- 年度: H25 / 平成25（2013）春期
- 範囲: PM 午前II 問1〜問25
- 問題PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_am2_qs.pdf
- 解答PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000002e6g-att/2013h25h_pm_am2_ans.pdf

## 実施内容

- `src/data/officialMorningQuestions.ts` に H25 問1〜問25 を追加
- `MORNING_YEARS` に `H25` を追加
- H25 の IPA 公式PDF URL 定数を追加
- 図表がある問8・問10・問11・問12・問14・問15を `figure` として作成
- `explanation` は空欄のまま、Claude 解説生成待ち

## 照合方法

- IPA 公式問題PDFを取得し、PyMuPDFでページ画像化して問題文・図表を目視確認
- Windows OCR（`winsdk.windows.media.ocr` / 日本語）でページ画像から本文を抽出
- IPA 公式解答PDFを `pypdf` で抽出し、正解を照合
- PM試験ドットコムのH25午前IIページを補助資料として利用し、最終判断はIPA公式PDF画像と公式解答PDFに合わせた

## 図表

- 問8: アローダイアグラム（SVG）
- 問10: 作業リスト（table）
- 問11: EVM によるプロジェクト状況の候補グラフ（SVG）
- 問12: 機能種別の分類表（table）
- 問14: RACI チャート（table）
- 問15: ツール導入のデシジョンツリー（SVG）

SVG は `npx vite-node scripts/render-morning-figures.ts` で書き出し、Inkscape で PNG 化して目視確認した。

## 正解一覧

| 問 | 正解 | correctIndex |
|---:|:---:|---:|
| 1 | ウ | 2 |
| 2 | ア | 0 |
| 3 | イ | 1 |
| 4 | エ | 3 |
| 5 | ウ | 2 |
| 6 | ウ | 2 |
| 7 | ア | 0 |
| 8 | ア | 0 |
| 9 | ア | 0 |
| 10 | ウ | 2 |
| 11 | ウ | 2 |
| 12 | ウ | 2 |
| 13 | イ | 1 |
| 14 | エ | 3 |
| 15 | ウ | 2 |
| 16 | ア | 0 |
| 17 | ウ | 2 |
| 18 | イ | 1 |
| 19 | ウ | 2 |
| 20 | エ | 3 |
| 21 | ウ | 2 |
| 22 | ウ | 2 |
| 23 | イ | 1 |
| 24 | ウ | 2 |
| 25 | ア | 0 |

## 分類

| categoryId | 問数 | 問番号 |
|---|---:|---|
| planning | 6 | 5, 6, 7, 8, 9, 10 |
| governance | 4 | 22, 23, 24, 25 |
| delivery | 3 | 13, 16, 21 |
| measurement | 3 | 2, 11, 12 |
| development-approach | 2 | 17, 18 |
| service-management | 2 | 19, 20 |
| integration | 1 | 4 |
| project-work | 1 | 3 |
| stakeholder | 1 | 1 |
| team | 1 | 14 |
| uncertainty | 1 | 15 |

合計: 25問

## 注記

- 問2は公式PDFの上付き指数を既存データ表記に合わせて `E=5.2L^{0.98}` として格納した。
- 問11は公式PDFでは選択肢がグラフのみのため、選択肢文字列は「選択肢アのグラフ」形式とし、グラフ本体を `figure` に格納した。
- 問12は公式PDFでは選択肢が表のみのため、選択肢文字列は「選択肢アの分類」形式とし、分類表を `figure` に格納した。
- 問25は2013年当時の公式PDFに合わせて「日本工業標準調査会」「工業標準化法」の表記で格納した。

## 検証

- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK
- Inkscape PNGセルフチェック: OK（問8・問11・問15）
- `npm run build`: OK
- `git diff --check`: OK（既存のCRLF警告のみ）
