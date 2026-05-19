# F2-P3 R1 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、平成31年度 春期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 / R3 / R2 データは削除・改変せず、`om-R1-1` 〜 `om-R1-25` の25件を追加した。
- `MORNING_YEARS` に `R1` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- ユーザの前回方針に合わせ、公式図表がある問2・問8・問10・問13は同時に `figure` として作成した。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 2019年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pypdf`
- 問題冊子画像化: PyMuPDF (`fitz`) PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - PM試験ドットコム掲載テキストを補助参照
  - IPA 原 PDF 画像をページ単位で目視確認
- 図表確認:
  - `npx vite-node scripts/render-morning-figures.ts`
  - Inkscape による `om-R1-10` の白背景 PNG 書き出し
  - PNG 目視確認

## OCR 誤認識と補正メモ

- 問1: 補助テキストの `手引き` を、IPA 原 PDF の `手引` に補正した。
- 問2: `RACI チャート`、`責任分担マトリクス`、表内の `C / A / I / R / －` の配置を原 PDF 画像で確認し、table 化した。
- 問5: `JIS Q 21500:2018（プロジェクトマネジメントの手引）` と対象群 `“リスク”`、プロセス `“リスクへの対応”` の表記を確認した。
- 問8: 表1の見積工数と表2の要員割当てを統合 table として補完した。
- 問9: 分数選択肢は MathText の `frac{}{}` で表示されるよう整形した。
- 問10: トルネード図を SVG 化した。補助テキストの `デシジョンツリーダーイアグラム` は、IPA 原 PDF の `デシジョンツリーダイアグラム` に補正した。
- 問13: 開発要員投入計画を table 化した。1〜12月、設計者・プログラマ・テスタ・計の値を原 PDF 画像で確認した。
- 問22: 補助テキスト側は法令名が新名称に置換されていたため、IPA 原 PDF の `下請代金支払遅延等防止法` に戻した。
- 問24〜25: `NIST`、`AES`、`DNSSEC`、`DNS キャッシュサーバ`、`リソースレコード` の表記を原 PDF 画像で確認した。

## 図表あり問題

- 問2: RACI チャート表（table `figure` 補完済み）
- 問8: 見積工数・要員割当て表（table `figure` 補完済み）
- 問10: 感度分析のトルネード図（SVG `figure` 補完済み）
- 問13: 開発要員投入計画表（table `figure` 補完済み）

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | ウ | 2 |
| 2 | エ | 3 |
| 3 | ウ | 2 |
| 4 | ア | 0 |
| 5 | イ | 1 |
| 6 | ウ | 2 |
| 7 | ア | 0 |
| 8 | エ | 3 |
| 9 | エ | 3 |
| 10 | ウ | 2 |
| 11 | ウ | 2 |
| 12 | ウ | 2 |
| 13 | イ | 1 |
| 14 | エ | 3 |
| 15 | ウ | 2 |
| 16 | ア | 0 |
| 17 | エ | 3 |
| 18 | ウ | 2 |
| 19 | ウ | 2 |
| 20 | ア | 0 |
| 21 | イ | 1 |
| 22 | ウ | 2 |
| 23 | エ | 3 |
| 24 | ア | 0 |
| 25 | イ | 1 |

## 推定 categoryId 分布

- `planning`: 5件
- `governance`: 4件
- `service-management`: 4件
- `measurement`: 3件
- `project-work`: 3件
- `uncertainty`: 2件
- `team`: 1件
- `stakeholder`: 1件
- `delivery`: 1件
- `development-approach`: 1件

## 検証結果

- 件数確認: R1 25件
- `id`: `om-R1-1` 〜 `om-R1-25`
- `explanation: ''`: R1 25件
- `sourceUrl`: R1 25件とも IPA 問題冊子 PDF URL
- `figure`: R1 4件（問2, 8, 10, 13）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（R1 問10 SVG 出力確認）
- Inkscape PNG 書き出し: OK（`om-R1-10-white.png` を目視確認）
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
