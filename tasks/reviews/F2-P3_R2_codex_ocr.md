# F2-P3 R2 Codex OCR 作業メモ

## 実施内容

- IPA 公式 PDF を取得し、令和2年度 10月 プロジェクトマネージャ試験 午前II 25問を `src/data/officialMorningQuestions.ts` に追記した。
- 既存の R6 / R5 / R4 / R3 データは削除・改変せず、`om-R2-1` 〜 `om-R2-25` の25件を追加した。
- `MORNING_YEARS` に `R2` を追加した。
- `explanation` は全問 `''` のまま。解説作成は次工程 Claude 担当。
- ユーザ指示により、公式図表がある問7・問9・問10は同時に SVG `figure` として作成した。
- `sourceUrl` は全問、IPA 問題冊子 PDF URL に統一した。

## 使用ツール

- PDF URL 取得: IPA 令和2年度ページの PM 午前II リンク確認
- PDF 取得: `Invoke-WebRequest`
- 解答例抽出: `pypdf`
- 問題冊子画像化: PyMuPDF (`fitz`) PNG 出力
- OCR 補助:
  - PM試験ドットコム掲載テキストを補助参照
  - 問題冊子は IPA 原 PDF 画像をページ単位で目視確認
- 図表確認:
  - `npx vite-node scripts/render-morning-figures.ts`
  - Inkscape による `om-R2-7` / `om-R2-9` / `om-R2-10` の白背景 PNG 書き出し
  - PNG 目視確認

## OCR 誤認識と補正メモ

- 全般: 補助テキストを基に初期入力し、IPA 原 PDF 画像で問題文・選択肢・記号・数値を確認した。
- 問1〜3: `JIS Q 21500:2018`、`プロジェクト憲章`、プロセス群の表記を確認した。
- 問7: アローダイアグラムを SVG 化した。作業 A〜I、所要日数、ダミー作業、凡例を原 PDF 画像と照合した。
- 問9: COCOMO の式と4候補グラフを SVG 化した。縦軸 `開発生産性`、横軸 `開発規模`、選択肢ア〜エの曲線形状を確認した。
- 問10: EMV のデシジョンツリーを SVG 化した。ツールA/Bの費用、60%/40%、効果額 `X` / `90` / `120` / `60` 万円を確認した。
- 問12: 選択肢の括弧付き式を原 PDF 画像で確認した。
- 問13: 契約条件の (1)〜(4)、目標コスト、インセンティブフィー、70% の条件を確認した。
- 問15: カークパトリックモデルの `Reaction` / `Learning` / `Behavior` / `Results` と a〜d の対応を確認した。
- 問21〜25: 個人情報保護法、労働者派遣、SSO、CVSS、ファジングの選択肢順を確認した。
- PM試験ドットコム側に表示される説明用画像は、公式問題冊子の図ではないため figure 化対象から除外した。

## 図表あり問題

- 問7: アローダイアグラム（SVG `figure` 補完済み）
- 問9: COCOMO の開発規模・開発生産性グラフ候補（SVG `figure` 補完済み）
- 問10: EMV デシジョンツリー（SVG `figure` 補完済み）

## 解答例 PDF との正解突合

| 問 | 正解 | correctIndex |
|---:|---|---:|
| 1 | イ | 1 |
| 2 | エ | 3 |
| 3 | エ | 3 |
| 4 | ア | 0 |
| 5 | イ | 1 |
| 6 | ア | 0 |
| 7 | エ | 3 |
| 8 | ア | 0 |
| 9 | エ | 3 |
| 10 | ウ | 2 |
| 11 | ア | 0 |
| 12 | イ | 1 |
| 13 | エ | 3 |
| 14 | エ | 3 |
| 15 | エ | 3 |
| 16 | ウ | 2 |
| 17 | エ | 3 |
| 18 | イ | 1 |
| 19 | エ | 3 |
| 20 | ウ | 2 |
| 21 | ウ | 2 |
| 22 | エ | 3 |
| 23 | エ | 3 |
| 24 | イ | 1 |
| 25 | イ | 1 |

## 推定 categoryId 分布

- `integration`: 3件
- `team`: 1件
- `measurement`: 2件
- `planning`: 3件
- `uncertainty`: 2件
- `delivery`: 2件
- `project-work`: 2件
- `development-approach`: 3件
- `governance`: 2件
- `service-management`: 5件

## 検証結果

- 件数確認: R2 25件
- `id`: `om-R2-1` 〜 `om-R2-25`
- `explanation: ''`: R2 25件
- `sourceUrl`: R2 25件とも IPA 問題冊子 PDF URL
- `figure`: R2 3件（問7, 9, 10）
- `correctIndex`: IPA 解答例 PDF と25問全件一致
- `npm run validate-data`: OK
- `npx vite-node scripts/render-morning-figures.ts`: OK（R2 3 SVG 出力確認）
- Inkscape PNG 書き出し: OK（`om-R2-7-white.png`, `om-R2-9-white.png`, `om-R2-10-white.png` を目視確認）
- `npm run build`: OK
  - Vite の chunk size warning は既存のビルド警告として表示されたが、ビルド自体は成功。
