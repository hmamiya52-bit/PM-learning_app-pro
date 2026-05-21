# F2-P3 H28 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、平成28年度 春期 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 / R3 / R2 / R1 / H30 / H29 データは削除・改変せず、`om-H28-1` 〜 `om-H28-25` の25件を追加した。
- `MORNING_YEARS` に `H28` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- 公式図表がある問8・問11・問12は同時に `figure` として作成した。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## H28 問2の例外対応

- IPA 解答例 PDF では問2の正解が「（注）」となっており、注記に「誤りにより問題として成立しない」と記載されている。
- IPA 問題冊子 PDF 側にも「問2は問題誤りにつき受験者全員正解の措置済み」と明記されている。
- 現行の `OfficialMorningQuestion.correctIndex` は `0 | 1 | 2 | 3` 必須のため、いったん `tasks/questions/F2-P3_H28.md` に質問を作成した。
- ユーザ回答「注釈をつけた上で問題が成り立つように改題して作ってください。」に従い、問2は `questionText` 先頭に公式誤問である旨の注記を付け、選択肢イ（スコープベースライン）が一意に正解となる学習用改題版として投入した。
- 問2の `correctIndex` は改題版に対して `1`（イ）とした。

## 使用ツール

- PDF URL 取得: IPA 2016年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pypdf`
- 問題冊子画像化: PyMuPDF (`fitz`) PNG 出力
- OCR:
  - Windows OCR (`winsdk.windows.media.ocr`, 日本語)
  - PM試験ドットコム掲載テキストを補助参照
  - IPA 原 PDF 画像をページ単位で目視確認
- 図表確認:
  - `npx vite-node scripts/render-morning-figures.ts`
  - Inkscape による `om-H28-8` / `om-H28-11` / `om-H28-12` の白背景 PNG 書き出し
  - PNG 目視確認

## OCR 誤認識と補正メモ

- 問1: 補助テキスト側は説明文が異なっていたため、IPA 原 PDF の `どの程度の能力水準にあり` を採用した。
- 問2: 公式誤問のため注記付き改題。元選択肢は IPA 原 PDF の `人的資源計画書` / `スコープベースライン` / `ステークホルダ登録簿` / `品質尺度` を維持した。
- 問6: `RACIチャート`、`責任分担表（RAM）`、各選択肢の `リスク管理` の有無を原 PDF 画像で確認した。
- 問8: EVM の四つのグラフ選択肢を SVG 化した。現在時点で `EV > PV` かつ `EV > AC` となる選択肢ウを正解として公式解答と突合した。
- 問10: 補助テキストの `この会社が，1人で開発すると...` 周辺を、IPA 原 PDF の `社員が週に40時間働くソフトウェア会社がある。` から始まる表記に補正した。
- 問11: COCOMO の式 `MM=3.0×(KDSI)^{1.12}` と四つのグラフ選択肢を SVG 化した。
- 問12: EMV のデシジョンツリーを SVG 化した。ツールA/Bの費用、60%/40%、効果額 X / 90 / 120 / 60 万円を原 PDF 画像で確認した。
- 問13: `メンバ`、`PMO のメンバ` の表記を原 PDF 画像で確認した。
- 問17: 補助テキストの `コントローラー` を、IPA 原 PDF の `コントローラ` に補正した。
- 問22: 補助テキストの NPV 説明を、IPA 原 PDF の `将来発生するものは割引率を設定して現在価値に換算` に補正した。

## 図表あり問題

- 問8: EVM グラフ選択肢（SVG `figure` 補完済み）
- 問11: COCOMO の開発規模・開発生産性グラフ選択肢（SVG `figure` 補完済み）
- 問12: EMV デシジョンツリー（SVG `figure` 補完済み）

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex | 備考 |
|---:|---|---:|---|
| 1 | ア | 0 |  |
| 2 | イ | 1 | 公式は「（注）問題として成立しない」。学習用改題版の正解 |
| 3 | イ | 1 |  |
| 4 | イ | 1 |  |
| 5 | ウ | 2 |  |
| 6 | ア | 0 |  |
| 7 | ウ | 2 |  |
| 8 | ウ | 2 |  |
| 9 | ウ | 2 |  |
| 10 | ウ | 2 |  |
| 11 | エ | 3 |  |
| 12 | ウ | 2 |  |
| 13 | イ | 1 |  |
| 14 | エ | 3 |  |
| 15 | ウ | 2 |  |
| 16 | エ | 3 |  |
| 17 | イ | 1 |  |
| 18 | ウ | 2 |  |
| 19 | エ | 3 |  |
| 20 | ア | 0 |  |
| 21 | ウ | 2 |  |
| 22 | エ | 3 |  |
| 23 | イ | 1 |  |
| 24 | イ | 1 |  |
| 25 | イ | 1 |  |

## 推定 categoryId 分布

- `planning`: 5件
- `development-approach`: 4件
- `uncertainty`: 4件
- `measurement`: 3件
- `service-management`: 3件
- `delivery`: 2件
- `governance`: 2件
- `integration`: 1件
- `team`: 1件

## 検証結果

- 件数確認: H28 25件
- `id`: `om-H28-1` 〜 `om-H28-25`
- `explanation: ''`: H28 25件
- `sourceUrl`: H28 25件とも IPA 問題冊子 PDF URL
- `figure`: H28 3件（問8, 11, 12）
- `correctIndex`: 問2を除き IPA 解答例 PDF と一致。問2は公式誤問のため、注記付き改題版としてユーザ指示に基づき `1` を設定
- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（H28 問8・問11・問12 SVG 出力確認）
- Inkscape PNG 書き出し: OK（`om-H28-8-white.png`, `om-H28-11-white.png`, `om-H28-12-white.png` を目視確認）
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
