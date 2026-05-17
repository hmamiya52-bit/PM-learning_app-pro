# F2-P3 R5 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、令和5年度 秋期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 データは削除・改変せず、`om-R5-1` 〜 `om-R5-25` の25件を追加した。
- `MORNING_YEARS` に `R5` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 令和5年秋期ページのリンク抽出 (`Invoke-WebRequest`)
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pdfplumber` / PyMuPDF (`fitz`)
- 問題冊子画像化: PyMuPDF (`fitz`) 4x scale PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - `pdfplumber` では問題冊子本文のテキスト抽出不可だったため、PNG OCRを使用
- 照合:
  - IPA 原 PDF 画像をページ単位で目視確認
  - OCR 差分確認用に PM試験ドットコム掲載テキストを補助参照

## OCR 誤認識と補正メモ

- 全般: Windows OCR が日本語の文字間に空白を挿入するため、原 PDF 画像を見ながら空白を除去した。
- 問1: OCR で欠落した `問1` 見出し、引用符 `“...”`、選択肢記号を原画像で確認した。
- 問2〜4: `JIS Q 21500:2018`、プロセス名の引用符、ステークホルダ関連選択肢の行順を原画像で確認した。
- 問5: EVM 表を `figure` に補完し、選択肢 `110 / 120 / 135 / 150` と正解 `エ` を確認した。
- 問6: 作業別の見積り表を `figure` に補完し、`HP－ABP`、`Highly Possible`、`Aggressive But Possible`、プロジェクトバッファ条件を原画像で確認した。
- 問7: PDM 図とアクティビティ表を `figure` に補完し、本文の `同じ専門チーム` を原画像で確認した。
- 問8: `合流バッファ`、`プロジェクトバッファ`、`クリティカルパス` を補正した。
- 問10: FP 表1〜表4を `figure` に補完し、`JIS X 0142:2010` と `IFPUG 4.1版` を確認した。
- 問13: レビュー手法の組合せ表を `figure` に補完し、選択肢として `a/b/c` の対応を確認した。
- 問18: TCO の4案表を `figure` に補完し、選択肢 `A案`〜`D案` と正解 `ウ` を確認した。
- 問21: 補助参照サイトでは法令名が更新後名称になっていたため、IPA 原 PDF に合わせて `プロバイダ責任制限法` とした。
- 問23: `ISO/IEC 15408`、`Evaluation Assurance Level : EAL` を原画像で確認した。
- 問25: `ファジング`、`セキュリティアドバイザリ` を原画像で確認した。

## 図表あり問題

- 問5: EVM 管理項目表
- 問6: 作業①〜④の担当者・所要日数見積り表
- 問7: PDM 依存関係図、アクティビティ支援期間表
- 問10: ファンクションポイント算出用の表1〜表4
- 問13: レビュー手法の組合せ表
- 問18: TCO 4案比較表

指摘対応として、上記6問は `figure` を補完済み。`categoryId` の `(figure)` suffix は外し、通常カテゴリに戻した。

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | イ | 1 |
| 2 | イ | 1 |
| 3 | ア | 0 |
| 4 | ア | 0 |
| 5 | エ | 3 |
| 6 | イ | 1 |
| 7 | イ | 1 |
| 8 | ア | 0 |
| 9 | ウ | 2 |
| 10 | ア | 0 |
| 11 | ア | 0 |
| 12 | イ | 1 |
| 13 | エ | 3 |
| 14 | イ | 1 |
| 15 | ア | 0 |
| 16 | エ | 3 |
| 17 | ア | 0 |
| 18 | ウ | 2 |
| 19 | ウ | 2 |
| 20 | ウ | 2 |
| 21 | イ | 1 |
| 22 | ウ | 2 |
| 23 | ア | 0 |
| 24 | エ | 3 |
| 25 | イ | 1 |

## 推定 categoryId 分布

- `planning`: 5件
- `measurement`: 4件
- `uncertainty`: 2件
- `development-approach`: 3件
- `stakeholder`: 1件
- `delivery`: 2件
- `tailoring-models`: 1件
- `project-work`: 1件
- `governance`: 2件
- `service-management`: 4件

## 検証結果

- 件数確認: R5 25件
- `explanation: ''`: R5 25件
- `sourceUrl`: R5 25件とも IPA 問題冊子 PDF URL
- `figure`: R5 6件（問5, 6, 7, 10, 13, 18）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
- `npx vite-node scripts/render-morning-figures.ts`: OK
- Inkscape PNG 出力: R5 問7・問10 を確認。欠けや枠外表示なし。
