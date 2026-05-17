# F2-P3 R4 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、令和4年度 秋期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 データは削除・改変せず、`om-R4-1` 〜 `om-R4-25` の25件を追加した。
- `MORNING_YEARS` に `R4` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 令和4年度ページのリンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: IPA 解答例 PDF / web 抽出結果
- 問題冊子画像化: PyMuPDF (`fitz`) 4x scale PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - 問題冊子は画像PDFであり、PyMuPDF / pdfplumber の通常テキスト抽出は不可
- 照合:
  - IPA 原 PDF 画像をページ単位で目視確認
  - OCR 差分確認用に PM試験ドットコム掲載テキストを補助参照

## OCR 誤認識と補正メモ

- 全般: Windows OCR が日本語の文字間に空白を挿入するため、補助テキストと原 PDF 画像を見ながら空白を除去した。
- 問1〜3: `JIS Q 21500:2018`、プロセス群名、`WBS` を原 PDF と補助テキストで確認した。
- 問4〜6: RACI / Tuckman / 資源の管理の各選択肢を原 PDF と照合した。
- 問7: EVM 指標値 `CPI 0.9 / SPI 1.1 / TCPI 1.2` を確認した。
- 問9: アローダイアグラム問題。図表は OCR フェーズでは作成せず、`questionText` に PDF 参照注記を付け、`categoryId` を `planning(figure)` とした。
- 問10: COCOMO の指数式を `開発工数＝3.0×(開発規模)^{1.12}` として補正した。選択肢はグラフのため、PDF 参照注記と `measurement(figure)` を付けた。
- 問11: 数式選択肢は既存 R6 の同系統表記に合わせ、`frac{...}{...}` 形式で構造化した。
- 問12: 選択肢表を原 PDF 画像で確認し、`46 / 96 / 41 / 130` 億円を補完した。
- 問13: 開発規模・指摘件数表は後工程図表化対象として、PDF 参照注記と `delivery(figure)` を付けた。
- 問18: システム化案比較表は後工程図表化対象として、PDF 参照注記と `measurement(figure)` を付けた。
- 問21: OCR の `ISO 14N1` を原 PDF と補助テキストで `ISO 14001` に補正した。
- 問22: OCR の `呼吸源` を原 PDF の文意・補助テキストに基づき `吸収源` に補正した。

## 図表あり問題

- 問9: アローダイアグラム
- 問10: 開発規模と開発生産性のグラフ選択肢
- 問13: 開発規模の見積り値と指摘件数の実績値の表
- 問18: システム化案の初期費用・運用費・削減業務費の表

OCR フェーズでは `figure` フィールドは設定していない。上記は `categoryId` に `(figure)` suffix を付け、Claude の次工程で SVG/table 化する。

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | イ | 1 |
| 2 | エ | 3 |
| 3 | ア | 0 |
| 4 | ア | 0 |
| 5 | エ | 3 |
| 6 | エ | 3 |
| 7 | イ | 1 |
| 8 | エ | 3 |
| 9 | ウ | 2 |
| 10 | エ | 3 |
| 11 | エ | 3 |
| 12 | ア | 0 |
| 13 | ア | 0 |
| 14 | ウ | 2 |
| 15 | エ | 3 |
| 16 | エ | 3 |
| 17 | エ | 3 |
| 18 | エ | 3 |
| 19 | エ | 3 |
| 20 | ウ | 2 |
| 21 | イ | 1 |
| 22 | エ | 3 |
| 23 | イ | 1 |
| 24 | エ | 3 |
| 25 | ウ | 2 |

## 推定 categoryId 分布

- `integration`: 2件
- `planning`: 2件
- `planning(figure)`: 1件
- `team`: 3件
- `measurement`: 2件
- `measurement(figure)`: 2件
- `uncertainty`: 1件
- `delivery`: 1件
- `delivery(figure)`: 1件
- `development-approach`: 3件
- `project-work`: 1件
- `governance`: 2件
- `service-management`: 4件

## 検証結果

- 件数確認: R4 25件
- `explanation: ''`: R4 25件
- `sourceUrl`: R4 25件とも IPA 問題冊子 PDF URL
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
