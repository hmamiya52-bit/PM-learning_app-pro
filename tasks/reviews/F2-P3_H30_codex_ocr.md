# F2-P3 H30 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、平成30年度 春期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 / R3 / R2 / R1 データは削除・改変せず、`om-H30-1` 〜 `om-H30-25` の25件を追加した。
- `MORNING_YEARS` に `H30` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- 公式図表がある問6・問7・問8・問9は同時に `figure` として作成した。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 2018年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pypdf`
- 問題冊子画像化: PyMuPDF (`fitz`) PNG 出力
- OCR 補助:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - PM試験ドットコム掲載テキストを補助参照
  - IPA 原 PDF 画像をページ単位で目視確認
- 図表確認:
  - `npx vite-node scripts/render-morning-figures.ts`
  - Inkscape による `om-H30-6` / `om-H30-8` / `om-H30-9` の白背景 PNG 書き出し
  - PNG 目視確認

## OCR 誤認識と補正メモ

- 全般: 補助テキストを基に初期入力し、IPA 原 PDF 画像で問題文・選択肢・記号・数値を確認した。
- 問1: 選択肢の余分な空白を除去し、`計画，実行` / `実行，終結` の表記に補正した。
- 問6: 図1・図2のアローダイアグラムを SVG 化した。作業 A〜J、作業 C の遅延後 12日、G1/G2、ダミー作業を原 PDF 画像で確認した。
- 問7: 作業配分モデル表を table 化した。工数比・期間比の各値を原 PDF 画像で確認した。
- 問8: COCOMO の式と4候補グラフを SVG 化した。縦軸 `開発生産性`、横軸 `開発規模`、選択肢ア〜エの曲線形状を確認した。
- 問9: EMV のデシジョンツリーを SVG 化した。ツールA/Bの費用、60%/40%、効果額 `X` / `90` / `120` / `60` 万円を確認した。
- 問21: 補助テキストの `ベンダー` を IPA 原 PDF の `ベンダ` に補正し、`取リ決める` を `取り決める` に補正した。
- 問24: 分数と下付き文字の選択肢は MathText の `frac{}{}` / `_{}` で表示されるよう整形した。
- 問25: 補助テキストの `デジタル署名` を IPA 原 PDF の `ディジタル署名` に補正し、`無線 LAN` の空白を確認した。

## 図表あり問題

- 問6: プロジェクト活動ネットワーク図1・図2（SVG `figure` 補完済み）
- 問7: 作業配分モデル表（table `figure` 補完済み）
- 問8: COCOMO の開発規模・開発生産性グラフ候補（SVG `figure` 補完済み）
- 問9: EMV デシジョンツリー（SVG `figure` 補完済み）

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | イ | 1 |
| 2 | エ | 3 |
| 3 | イ | 1 |
| 4 | ア | 0 |
| 5 | ウ | 2 |
| 6 | ウ | 2 |
| 7 | イ | 1 |
| 8 | エ | 3 |
| 9 | ウ | 2 |
| 10 | ウ | 2 |
| 11 | エ | 3 |
| 12 | イ | 1 |
| 13 | エ | 3 |
| 14 | ウ | 2 |
| 15 | ア | 0 |
| 16 | エ | 3 |
| 17 | エ | 3 |
| 18 | イ | 1 |
| 19 | エ | 3 |
| 20 | ア | 0 |
| 21 | ア | 0 |
| 22 | イ | 1 |
| 23 | イ | 1 |
| 24 | イ | 1 |
| 25 | イ | 1 |

## 推定 categoryId 分布

- `integration`: 3件
- `team`: 2件
- `planning`: 1件
- `measurement`: 2件
- `uncertainty`: 4件
- `delivery`: 3件
- `project-work`: 2件
- `development-approach`: 2件
- `service-management`: 3件
- `governance`: 3件

## 検証結果

- 件数確認: H30 25件
- `id`: `om-H30-1` 〜 `om-H30-25`
- `explanation: ''`: H30 25件
- `sourceUrl`: H30 25件とも IPA 問題冊子 PDF URL
- `figure`: H30 4件（問6, 7, 8, 9）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（H30 3 SVG 出力確認）
- Inkscape PNG 書き出し: OK（`om-H30-6-white.png`, `om-H30-8-white.png`, `om-H30-9-white.png` を目視確認）
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
