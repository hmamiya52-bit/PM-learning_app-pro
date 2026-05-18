# F2-P3 R3 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、令和3年度 秋期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 データは削除・改変せず、`om-R3-1` 〜 `om-R3-25` の25件を追加した。
- `MORNING_YEARS` に `R3` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 令和3年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: PyMuPDF (`fitz`)
- 問題冊子画像化: PyMuPDF (`fitz`) 2.8x scale PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - 問題冊子は画像PDFであり、PyMuPDF / pdfplumber の通常テキスト抽出は不可
- 照合:
  - IPA 原 PDF 画像をページ単位で目視確認
  - OCR 差分確認用に PM試験ドットコム掲載テキストを補助参照

## OCR 誤認識と補正メモ

- 全般: Windows OCR が日本語の文字間に空白を挿入するため、補助テキストと原 PDF 画像を見ながら空白を除去した。
- 問1〜3: `JIS Q 21500:2018`、`PMBOK ガイド第6版`、`組織のプロセス資産` の表記を原 PDF 画像で確認した。
- 問2: RACI 表を `figure.table` として補完し、`A / R / C / I / －` の配置を原 PDF 画像で確認した。
- 問4: PDM 図は次工程図表化対象として、PDF 参照注記と `planning(figure)` を付けた。
- 問7: `“クリティカルチェーン法”`、`合流バッファ`、`プロジェクトバッファ` を確認した。
- 問8: `メンバ` 表記、`0.5 か月間`、`1 人月当たり 100 万円` を確認した。
- 問9: `①～③`、`COSMIC 法`、`読込み及び書込み` を確認した。
- 問11: トルネード図は次工程図表化対象として、PDF 参照注記と `uncertainty(figure)` を付けた。選択肢 `デシジョンツリーダイアグラム` を原 PDF 画像で確認した。
- 問13: 開発要員投入計画表を `figure.table` として補完した。R6 問12と同系統の表で、R3 原 PDF の月別人数と一致することを確認した。
- 問18: 採点結果表と重み付け表を一つの `figure.table` に統合して補完した。総合評価点の式と案1〜4の選択肢を確認した。
- 問21: `常時 10 名以上`、就業規則・個別合意の選択肢を確認した。
- 問23〜25: `ElGamal 暗号`、`テンペスト攻撃`、`DNSSEC`、`権威 DNS サーバ` を確認した。

## 図表あり問題

- 問2: RACI チャート表（`figure.table` 補完済み）
- 問4: PDM 図（`planning(figure)`、次工程で図表化予定）
- 問11: 感度分析のトルネード図（`uncertainty(figure)`、次工程で図表化予定）
- 問13: 開発要員投入計画表（`figure.table` 補完済み）
- 問18: 採点結果表・重み付け表（`figure.table` 補完済み）

SVG の新規作成は行っていないため、SVG PNG レンダリングセルフチェックは対象外。

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | ウ | 2 |
| 2 | エ | 3 |
| 3 | ア | 0 |
| 4 | ウ | 2 |
| 5 | ウ | 2 |
| 6 | ア | 0 |
| 7 | ア | 0 |
| 8 | ウ | 2 |
| 9 | イ | 1 |
| 10 | イ | 1 |
| 11 | ウ | 2 |
| 12 | ウ | 2 |
| 13 | イ | 1 |
| 14 | イ | 1 |
| 15 | ウ | 2 |
| 16 | イ | 1 |
| 17 | エ | 3 |
| 18 | ウ | 2 |
| 19 | ウ | 2 |
| 20 | ウ | 2 |
| 21 | ア | 0 |
| 22 | ウ | 2 |
| 23 | ア | 0 |
| 24 | イ | 1 |
| 25 | イ | 1 |

## 推定 categoryId 分布

- `planning`: 4件
- `service-management`: 4件
- `governance`: 3件
- `project-work`: 3件
- `measurement`: 3件
- `development-approach`: 3件
- `team`: 1件
- `planning(figure)`: 1件
- `uncertainty`: 1件
- `uncertainty(figure)`: 1件
- `delivery`: 1件

## 検証結果

- 件数確認: R3 25件
- `id`: `om-R3-1` 〜 `om-R3-25`
- `explanation: ''`: R3 25件
- `sourceUrl`: R3 25件とも IPA 問題冊子 PDF URL
- `figure`: R3 3件（問2, 13, 18）
- `categoryId` の `(figure)` suffix: R3 2件（問4, 11）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
