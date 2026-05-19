# F2-P3 公式午前II OCR 投入順キュー

> 作成: Claude（2026-05-17）
> 使用方法: 共通テンプレ `tasks/codex/F2-P3_ocr_template.md` と併用。Codex は本ファイルの「**未着手**」最上位の年度を1つ取って作業を開始する。
> 投入順方針: **新しい年度から**（試験出題傾向への近接度優先、`detailed_design.md` §2.7e.2 F2-P3）

## 投入状態の凡例
- **未着手**: 未だ作業されていない年度
- **進行中（Codex 担当 / YYYY-MM-DD）**: Codex が作業開始
- **完了（YYYY-MM-DD / commit <hash>）**: Codex OCR 完了、Claude 解説工程待ち
- **解説中（Claude / YYYY-MM-DD）**: Claude が `explanation` 生成中
- **レビュー中（Codex 構造レビュー / YYYY-MM-DD）**: Codex が構造レビュー中
- **完成**: Codex OCR + Claude 解説 + Codex 構造レビュー + ユーザレビュー まで完了

## 年度別キュー

| 優先 | 年度 | yearLabel | 試験年 | 状態 | 問題冊子 URL | 解答例 URL |
|---:|---|---|---|---|---|---|
| - | R6 | 令和6（2024） | 2024 | **完成（F1.5-P4 投入済み）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_am2_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_am2_ans.pdf |
| 1 | R5 | 令和5（2023） | 2023 | **完了（Codex / 2026-05-17 / commit 81cb5ad）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_am2_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_am2_ans.pdf |
| 2 | R4 | 令和4（2022） | 2022 | **完了（Codex / 2026-05-17 / commit 668ff28）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_am2_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000008smf-att/2022r04a_pm_am2_ans.pdf |
| 3 | R3 | 令和3（2021） | 2021 | **完了（Codex / 2026-05-18 / commit 7983448）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2021r03.html から取得 | 同上 |
| 4 | R2 | 令和2（2020） | 2020 | **完了（Codex / 2026-05-18 / commit 09f824e）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_am2_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d05l-att/2020r02o_pm_am2_ans.pdf |
| 5 | R1 | 令和元（2019） | 2019 | **進行中（Codex 担当 / 2026-05-20）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2019r01.html から取得 | 同上 |
| 6 | H30 | 平成30（2018） | 2018 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2018h30.html から取得 | 同上 |
| 7 | H29 | 平成29（2017） | 2017 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2017h29.html から取得 | 同上 |
| 8 | H28 | 平成28（2016） | 2016 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2016h28.html から取得 | 同上 |
| 9 | H27 | 平成27（2015） | 2015 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2015h27.html から取得 | 同上 |
| 10 | H26 | 平成26（2014） | 2014 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2014h26.html から取得 | 同上 |
| 11 | H25 | 平成25（2013） | 2013 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2013h25.html から取得 | 同上 |

## URL 取得方法（Codex 用）

各年度の IPA トップページ（上記 URL）に直接 PDF へのリンクがあります。
1. IPA トップページにアクセス
2. 「プロジェクトマネージャ試験」セクションを探す
3. 「午前II 試験問題」リンクから問題冊子 PDF URL を取得
4. 「解答例」リンクから解答例 PDF URL を取得

R6 の URL 命名規則: `2024r06a_pm_am2_qs.pdf` / `2024r06a_pm_am2_ans.pdf`
- 末尾 `_qs.pdf` = 問題冊子（Question Sheet）
- 末尾 `_ans.pdf` = 解答例（Answer）
- 命名規則は年度ごとに微妙に違う可能性あり（IPA が一貫していない）。リンク先 URL を直接確認すること。

## 進捗一覧（commit 履歴）

```
（Codex が完了するたびにここに追記）
```

- R5: 完了（2026-05-17 / commit 81cb5ad） → Claude 解説待ち
- R4: 完了（2026-05-17 / commit 668ff28） → Claude 解説待ち
- R3: 完了（2026-05-18 / commit 7983448） → Claude 解説待ち
- R2: 完了（2026-05-18 / commit 09f824e） → Claude 解説待ち（図表は Codex で同時作成済み）

例:
- R5: 完了（2026-05-XX / commit abcd1234） → Claude 解説待ち
- R4: 完了（2026-05-XX / commit efgh5678） → Claude 解説完了 / Codex 構造レビュー中
- ...

## 補足

### 投入順を変えたい場合
ユーザ判断で投入順を変更可能（例: H25 から逆順に進める等）。その場合は本ファイルを更新してから Codex に依頼すること。

### Codex 1セッションあたりの処理範囲
**1年度 = 25問** のみ。複数年度の一括処理は**禁止**（コンフリクトリスク・指示書粒度の理由から、F2-P3 共通テンプレ §0 / §7 で明示）。

### Claude 並行作業
Codex が n+1 年度の OCR を進める間、Claude は n 年度の `explanation` 生成 + `figure` 化を並行可能。ターン制を守りつつ、年度単位で並列パイプラインを回せる。

### 終了条件
全11年度（R5〜H25）が「完成」状態になれば F2-P3 完了。`detailed_design.md` §2.7e.2 F2-P3 の DoD を満たす。
