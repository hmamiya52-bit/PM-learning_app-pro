# F2-P3 H29 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、平成29年度 春期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 / R3 / R2 / R1 / H30 データは削除・改変せず、`om-H29-1` 〜 `om-H29-25` の25件を追加した。
- `MORNING_YEARS` に `H29` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- 公式図表がある問6・問10・問13・問15・問21は同時に `figure` として作成した。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 2017年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pypdf`
- 問題冊子画像化: PyMuPDF (`fitz`) PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - PM試験ドットコム掲載テキストを補助参照
  - IPA 原 PDF 画像をページ単位で目視確認
- 図表確認:
  - `npx vite-node scripts/render-morning-figures.ts`
  - Inkscape による `om-H29-10` の白背景 PNG 書き出し
  - PNG 目視確認

## OCR 誤認識と補正メモ

- 問1: `“クリティカルチェーン法”` の引用符と表記を IPA 原 PDF 画像で確認した。
- 問2〜問4: `PMBOK ガイド 第 5 版`、`変更要求`、`統合変更管理` などの PMBOK 表記を原 PDF に合わせた。
- 問6: RACI チャート表を原 PDF 画像で確認し、`C / A / I / R / －` の配置を table 化した。
- 問7: 補助テキストの `メンバー` を、IPA 原 PDF の `メンバ` に補正した。
- 問10: PDM 図と専門チーム支援期間の表を SVG 化した。`FS`、アクティビティ A〜D、所要日数、支援期間を原 PDF 画像で確認した。
- 問13: 選択肢が画像表で掲載されていたため、データファンクション / トランザクションファンクションの分類表を table 化した。
- 問14: 分数選択肢は MathText の `frac{}{}` で表示されるよう整形した。
- 問15: 開発要員投入計画を table 化した。1〜12月、設計者・プログラマ・テスタ・計の値を原 PDF 画像で確認した。
- 問16: 補助テキストの表現を、IPA 原 PDF の `出荷後の故障品数を減少させ，全体の費用を低減させたい` と `故障品の発見率` に補正した。
- 問21: `ベンダ X 社`、`“モデル契約”` の表記と、開発工程ごとの契約類型表を原 PDF 画像で確認し table 化した。

## 図表あり問題

- 問6: RACI チャート表（table `figure` 補完済み）
- 問10: PDM 図と専門チーム支援期間表（SVG `figure` 補完済み）
- 問13: FP 法の分類表（table `figure` 補完済み）
- 問15: 開発要員投入計画表（table `figure` 補完済み）
- 問21: 共通フレーム / モデル契約の契約類型表（table `figure` 補完済み）

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | エ | 3 |
| 2 | ア | 0 |
| 3 | イ | 1 |
| 4 | ウ | 2 |
| 5 | ウ | 2 |
| 6 | エ | 3 |
| 7 | エ | 3 |
| 8 | ウ | 2 |
| 9 | ア | 0 |
| 10 | イ | 1 |
| 11 | エ | 3 |
| 12 | ウ | 2 |
| 13 | ウ | 2 |
| 14 | エ | 3 |
| 15 | イ | 1 |
| 16 | ア | 0 |
| 17 | エ | 3 |
| 18 | ア | 0 |
| 19 | エ | 3 |
| 20 | イ | 1 |
| 21 | イ | 1 |
| 22 | ウ | 2 |
| 23 | エ | 3 |
| 24 | イ | 1 |
| 25 | エ | 3 |

## 推定 categoryId 分布

- `planning`: 6件
- `service-management`: 4件
- `development-approach`: 3件
- `governance`: 3件
- `measurement`: 3件
- `project-work`: 2件
- `team`: 2件
- `delivery`: 1件
- `integration`: 1件

## 検証結果

- 件数確認: H29 25件
- `id`: `om-H29-1` 〜 `om-H29-25`
- `explanation: ''`: H29 25件
- `sourceUrl`: H29 25件とも IPA 問題冊子 PDF URL
- `figure`: H29 5件（問6, 10, 13, 15, 21）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（H29 問10 SVG 出力確認）
- Inkscape PNG 書き出し: OK（`om-H29-10-white.png` を目視確認）
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
