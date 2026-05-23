# F2-P4 午後I 投入順キュー

> 作成: Claude（2026-05-23）
> 使用方法: 共通テンプレ `tasks/codex/F2-P4_template.md` と併用。Codex は本ファイルの「**未着手**」最上位の年度を 1 つ取って作業を開始する。
> 投入順方針: **新しい年度から**（試験出題傾向への近接度優先、`detailed_design.md` §2.7e.2 F2-P4）

## 投入状態の凡例

- **未着手**: 未だ作業されていない年度
- **進行中（Codex 担当 / YYYY-MM-DD）**: Codex が作業開始
- **完了（YYYY-MM-DD / commit <hash>）**: Codex 投入完了、Claude レビュー工程待ち
- **レビュー中（Claude / YYYY-MM-DD）**: Claude が合計点調整 / 妥当性確認中
- **完成**: Codex 投入 + Claude レビュー + ユーザレビュー まで完了

## 1 問あたりの目安

- 年度ごとに **2〜3 問**（IPA が午後I で出題する問数。多くは 3 問）
- 1 問あたり **設問 12〜18 行**
- 1 問あたり配点合計 **50 点**（午後I は 2 問選択 × 50 点 = 100 点満点）

## 年度別キュー

| 優先 | 年度 | yearLabel | era | 試験年 | 状態 | 問題冊子 URL | 解答例 URL |
|---:|---|---|---|---|---|---|---|
| - | R6 | 令和6（2024） | reiwa | 2024 | **完了（Codex / 2026-05-23 / commit c2d91aa）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06a_pm_pm1_ans.pdf |
| 1 | R5 | 令和5（2023） | reiwa | 2023 | **完了（Codex / 2026-05-23 / commit ba1724d）** | https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_qs.pdf | https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05a_pm_pm1_ans.pdf |
| 2 | R4 | 令和4（2022） | reiwa | 2022 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2022r04.html から取得 | 同上 |
| 3 | R3 | 令和3（2021） | reiwa | 2021 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2021r03.html から取得 | 同上 |
| 4 | R2 | 令和2（2020） | reiwa | 2020 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2020r02.html から取得 | 同上 |
| 5 | R1 | 令和元（2019） | reiwa | 2019 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2019h31h.html から取得 | 同上 |
| 6 | H30 | 平成30（2018） | heisei | 2018 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2018h30h.html から取得 | 同上 |
| 7 | H29 | 平成29（2017） | heisei | 2017 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2017h29h.html から取得 | 同上 |
| 8 | H28 | 平成28（2016） | heisei | 2016 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2016h28h.html から取得 | 同上 |
| 9 | H27 | 平成27（2015） | heisei | 2015 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2015h27h.html から取得 | 同上 |
| 10 | H26 | 平成26（2014） | heisei | 2014 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2014h26h.html から取得 | 同上 |
| 11 | H25 | 平成25（2013） | heisei | 2013 | **未着手** | https://www.ipa.go.jp/shiken/mondai-kaiotu/2013h25h.html から取得 | 同上 |

## URL 取得方法（Codex 用）

各年度の IPA ページ（上記 URL）に問題冊子 / 解答例の直リンクがあります。

1. IPA の年度別ページにアクセス
2. 「プロジェクトマネージャ試験」セクションを探す
3. 「午後I 試験問題」リンクから問題冊子 PDF URL を取得
4. 「解答例」リンクから解答例 PDF URL を取得

R6 午前II の URL 命名規則: `2024r06a_pm_am2_qs.pdf` / `2024r06a_pm_am2_ans.pdf`
午後I は **`_pm_pm1_qs.pdf` / `_pm_pm1_ans.pdf`** が推定だが、IPA の命名は年度ごとに揺れるため必ず実 URL を確認。

`tasks/codex/F2-P4_queue.md` を更新する際、取得した実 URL を記入してから着手すること。

## 進捗一覧（commit 履歴）

```
（Codex が完了するたびにここに追記）
- R6: 完了（2026-05-23 / commit c2d91aa） → Claude レビュー待ち
- R5: 完了（2026-05-23 / commit ba1724d） → Claude レビュー待ち
```

例:
- R6: 完了（2026-05-XX / commit abcd1234） → Claude レビュー待ち
- R5: 完了（2026-05-XX / commit efgh5678） → Claude レビュー完了
- ...

## 補足

### 投入順を変えたい場合

ユーザ判断で投入順を変更可能（例: H25 から逆順に進める等）。その場合は本ファイルを更新してから Codex に依頼すること。

### F1 サンプル（R6-PM1-1 / R6-PM1-2）の扱い

`src/data/afternoonProblems.ts` / `officialAnswers.ts` / `scoringMap.ts` に F1 段階のサンプル 2 件（`R6-PM1-1`, `R6-PM1-2`）が入っている。これらはダミーなので、**R6 を本タスクで投入する際に本データへ置き換えてよい**（追記ではなく上書き）。

ただし他年度の作業時には R6 サンプルを残したまま当該年度を追記する（R6 着手まで R6 サンプルを保持）。

### Codex 1 セッションあたりの処理範囲

**1 年度 = 2〜3 問** のみ。複数年度の一括処理は**禁止**（コンフリクトリスク・指示書粒度の理由から、共通テンプレ §0 / §7 で明示）。

### Claude 並行作業

Codex が n+1 年度の OCR + 投入を進める間、Claude は n 年度の合計点調整 + 妥当性レビューを並行可能。ターン制を守りつつ、年度単位で並列パイプラインを回せる。

### 終了条件

全 12 年度（R6〜H25）が「完成」状態になれば F2-P4 完了。`detailed_design.md` §2.7e.2 F2-P4 の DoD を満たす。
