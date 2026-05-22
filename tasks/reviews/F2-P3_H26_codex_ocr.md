# F2-P3 H26 午前II OCR 作業記録（Codex）

作業日: 2026-05-22
担当: Codex

## 対象

- 年度: H26 / 平成26（2014）春期
- 範囲: PM 午前II 問1〜問25
- 問題PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_am2_qs.pdf
- 解答PDF: https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000001dzu-att/2014h26h_pm_am2_ans.pdf

## 実施内容

- `src/data/officialMorningQuestions.ts` に H26 問1〜問25 を追加
- `MORNING_YEARS` に `H26` を追加
- H26 の IPA 公式PDF URL 定数を追加
- 図表がある問2・問8・問14・問18・問19・問20を `figure` として作成
- `explanation` は空欄のまま、Claude 解説生成待ち

## 照合方法

- IPA 公式問題PDFを取得し、PyMuPDFでページ画像化して問題文・図表を目視確認
- Windows OCR（`winsdk.windows.media.ocr` / 日本語）でページ画像から本文を抽出
- IPA 公式解答PDFを `pypdf` で抽出し、正解を照合
- PM試験ドットコムのH26午前IIページを補助資料として利用し、最終判断はIPA公式PDF画像と公式解答PDFに合わせた

## 図表

- 問2: プロジェクト期間に伴う要素の変動グラフ（SVG）
- 問8: 作業リストとアローダイアグラム（SVG）
- 問14: 開発規模と開発生産性の関係の候補グラフ（SVG）
- 問18: 開発方針と開発モデルの表（table）
- 問19: ITIL サービスライフサイクル図（SVG）
- 問20: 採点結果表・重み付け表（table）

SVG は `npx vite-node scripts/render-morning-figures.ts` で書き出し、Inkscape で PNG 化して目視確認した。

## 正解一覧

| 問 | 正解 | correctIndex |
|---:|:---:|---:|
| 1 | ア | 0 |
| 2 | ア | 0 |
| 3 | エ | 3 |
| 4 | イ | 1 |
| 5 | エ | 3 |
| 6 | ウ | 2 |
| 7 | ア | 0 |
| 8 | イ | 1 |
| 9 | エ | 3 |
| 10 | ウ | 2 |
| 11 | ウ | 2 |
| 12 | ア | 0 |
| 13 | ウ | 2 |
| 14 | エ | 3 |
| 15 | イ | 1 |
| 16 | ア | 0 |
| 17 | エ | 3 |
| 18 | イ | 1 |
| 19 | イ | 1 |
| 20 | ウ | 2 |
| 21 | ウ | 2 |
| 22 | ウ | 2 |
| 23 | ア | 0 |
| 24 | イ | 1 |
| 25 | イ | 1 |

## 分類

| categoryId | 問数 | 問番号 |
|---|---:|---|
| governance | 3 | 20, 21, 22 |
| measurement | 3 | 10, 11, 14 |
| planning | 3 | 6, 8, 9 |
| service-management | 3 | 19, 24, 25 |
| uncertainty | 3 | 12, 13, 23 |
| delivery | 2 | 15, 16 |
| development-approach | 2 | 17, 18 |
| stakeholder | 2 | 2, 5 |
| integration | 1 | 3 |
| project-work | 1 | 4 |
| tailoring-models | 1 | 1 |
| team | 1 | 7 |

合計: 25問

## 注記

- 問1は補助ページと公式PDFで選択肢表現に差異があったため、公式PDF画像・Windows OCRを優先した。
- 問8は補助ページでは「日程管理表」となっていたが、公式PDFの「作業リスト」「アローダイアグラム」に合わせた。
- 問14は既存の MathText 表記に合わせて指数を `^{1.12}` として格納した。
- 問18・問19は選択肢表を通常の4択文字列に展開し、問題中の表・流れ図を `figure` に格納した。
- 問20は公式PDF上の採点結果表と重み付け表を、1つのHTMLテーブルに統合して必要情報を保持した。
- 問22は公式PDFの法令名・用語（下請代金支払遅延等防止法、下請事業者、親事業者）に合わせた。

## 検証

- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK
- Inkscape PNGセルフチェック: OK（問2・問8・問14・問19）
- `npm run build`: OK
- `git diff --check`: OK（既存のCRLF警告のみ）
