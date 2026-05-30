# 午後I 独自解説 作成ルール（F2-P8 確立 / 量産用）

> 確立: 2026-05-29（R6-PM1-1 を雛形に策定）
> 正本データ: `src/data/afternoonExplanations.ts` ／ 設計: `docs/afternoon_explanation_design.md` §4 ／ detailed_design §2.7g
> 参照実装: R6-PM1-1（本ルールの全要素を満たす基準サンプル）
> **新セッションはこの文書だけ読めば量産に入れることを目標とする。**

---

## 0. 大前提（厳守）
- **文章生成は Claude が行う（委譲不可）**。Codex には型・検証ツール等の機械作業のみ。
- **本文の逐語引用は禁止**。根拠は「位置参照＋言い換え」（例「〔状況の分析と対策〕で〜と述べられている」）。
- **IPA 問題PDFはリポジトリに保存しない**（PNG化は ephemeral、作業後に削除）。
- `officialAnswers.ts` / `scoringMap.ts`（IPA引用データ）は**書き換えない**。解説は `afternoonExplanations.ts` のみ。
- セッション開始時 `git pull` / 終了時 `git push`、commit prefix は `[C]`。

---

## 1. 全体像：解説は2層構造

| 層 | 何を | どこに表示 | データ |
|---|---|---|---|
| **① 行解説（答え合わせ用）** | 設問ごとの要点（即時の答え合わせ支援） | `AfternoonMyAnswer` の checkMode、各解答例の直下にアコーディオン（折りたたみ） | `AfternoonExplanation.overview` ＋ `rows[]` |
| **② 詳細解説ページ（深掘り学習）** | 問題文の解説・考え方・習得知識 | `/afternoon/answers/:id/explanation`（専用ページ） | `AfternoonExplanation.detail` |

- ①は**必須**。②(`detail`)は任意だが、F2-P8 では**両方とも作成する**方針。
- UI・導線・ルーティングは実装済み（§7）。**新規問は本ファイルにデータを追加するだけ**で全導線が有効になる。

---

## 2. データ型（`src/data/afternoonExplanations.ts`）

```ts
AfternoonExplanation {
  id: string                       // officialAnswers.id と一致（例 'R6-PM1-2'）
  overview: string                 // 概要（100-200字）= checkMode 冒頭ブロック
  rows: AfternoonRowExplanation[]  // 行解説（officialAnswers.answers と rowKey で 1:1）
  detail?: {                       // 詳細解説ページ用
    problemSections: { heading, body }[]      // 問題文をセクションごとに紐解く
    questionDetails: AfternoonQuestionDetail[] // 設問ごとの考え方＋解説
    keyKnowledge: { term, description }[]      // 習得すべき知識
  }
}

AfternoonRowExplanation { rowKey, point, basis, reasoning, pitfall? }
AfternoonQuestionDetail { rowKey, heading, asked, thinkingProcess[], modelAnswer, commentary }
```

### rowKey の作り方（最重要・突合キー）
- `rowKey = \`${s}|${q ?? ''}|${t ?? ''}\`` （`makeRowKey(s, q, t)` と同一）。
- `officialAnswers.ts` の対象 id の `answers[]` の **各行 (s, q, t) と完全一致**させる。
- 例: `{ s:'1', q:'(1)' }` → `'1|(1)|'` ／ `{ s:'2' }` → `'2||'` ／ `{ s:'3', q:'(2)' }` → `'3|(2)|'`。
- `rows[]` は officialAnswers の**全行**に対応させる（欠落・余剰なし）。

---

## 3. 量産ワークフロー（1問あたり）

### Step 1. IPA 問題PDFを精読（PyMuPDF でPNG化 → 視覚で読む）
PDFは画像ベース（テキスト抽出不可）。年度ごとに1ファイルで3問入り（同一 `questionPdfUrl`）。
```bash
cd /tmp && curl -sL -o q.pdf "<afternoonProblems[].questionPdfUrl>"
python -c "import fitz; d=fitz.open('q.pdf'); [d[i].get_pixmap(dpi=150).save(f'p{i:02d}.png') for i in range(d.page_count)]; print(d.page_count)"
```
- 各PNGを Read ツール（マルチモーダル）で開いて読む。図表が細かい時は dpi=200〜210 で再描画。
- **対象問の本文ページを特定**（表紙・注意事項を除く。1問はおおむね本文4〜5ページ）。
- 読み取るもの: 題材／状況／各「〔…に関するプロジェクト計画〕」等のセクション／各設問文と字数条件。
- **作業後 `rm /tmp/*.png /tmp/q.pdf`**（著作権：画像を残さない）。

### Step 2. 公式解答・配点を確認
- `officialAnswers.ts` の対象 id の `answers[]`（解答例・s/q/t）。
- `scoringMap.ts` の対象 id（`[correct, partial]` の配列、行順は answers と一致）。高配点・部分点が割れる設問が **pitfall を付ける難所**。

### Step 3. ① 行解説（overview + rows）を執筆 → §4
### Step 4. ② 詳細解説（detail）を執筆 → §5
### Step 5. `afternoonExplanations.ts` に追加（既存問の後に追記）
### Step 6. 検証（§8）→ 実機確認 → commit `[C]` → push

---

## 4. ① 行解説の執筆基準

各フィールドの役割と字数目安（answer-check の折りたたみ内に出る短文）:

| フィールド | 役割 | 字数目安 |
|---|---|---|
| `overview` | 問題全体の趣旨・題材・問われるPM観点 | 100-200字 |
| `point` | この設問が**何を問うているか**（力点・解答の方向） | 30-60字 |
| `basis` | **本文のどこが根拠か**（位置参照＋言い換え。逐語引用しない） | 40-90字 |
| `reasoning` | **なぜその解答例になるか**（論理） | 60-120字 |
| `pitfall?` | ありがちな失点・誤答（**難所＝高配点/部分点が割れる設問のみ**） | 40-80字 |

- `basis` の位置参照は本文のセクション名や段落で示す（例「〔UX実現の検討方針〕で〜」「離脱者の声で〜」）。
- 二つ挙げる設問・高配点設問は pitfall を必ず付け、「片方のみ／一般論は失点」等を明示。

---

## 5. ② 詳細解説（detail）の執筆基準

### 5.1 problemSections（問題文の解説）— **本文の構造どおりに紐解く**
- 問題本文の**セクション単位**で1ブロックずつ作る。R6 午後I の典型構成（6ブロック）:
  1. `冒頭：事業の背景と課題`（題材・登場人物・抱える問題）
  2. `〔状況の分析と対策〕`（インタビュー・分析・打ち手）
  3. `〔○○の検討方針〕 ★最重要`（PMの方針＝各設問の根拠が集中。最重要と明示）
  4. `〔要件定義に関するプロジェクト計画〕`
  5. `〔設計に関するプロジェクト計画〕`
  6. `〔総合テストに関するプロジェクト計画〕`
  ※セクション名・数は問題ごとに本文に合わせる（上記は雛形）。
- 各 `body` は本文をかみ砕いて解説。段落区切りは `\n`。
- **各ブロック末尾に関連設問を明記**: 例「→ 設問1(1)は③、設問2は④に対応」「→ 設問3(1)(2) の舞台」。
  どの段落がどの設問につながるかを示すのが学習価値の核心。

### 5.2 questionDetails（設問ごとの詳細）
officialAnswers の各行に1つ。フィールド:
- `rowKey`: §2 と同じ（行解説と同じキー）。
- `heading`: 「設問1(1)」等の表示見出し。
- `asked`: 設問文の要点＋字数条件（例「〜は何か（35字以内）」）。
- `thinkingProcess[]`: **解答に至る思考のステップ列**（3〜5個）。「設問が問うのは何か→本文のどこを見るか→どう導くか→解答表現」の順で。
- `modelAnswer`: 解答例（officialAnswers と一致。二つ解答は「A／B」で連結）。
- `commentary`: 根拠・なぜその解答か・部分点や失点の機微（行解説より深く）。

### 5.3 keyKnowledge（習得すべき知識）
- その問題で学ぶべきPM概念を `term`（用語）＋`description`（説明）で 4〜6項目。
- 設問解法のテクニック（例「設問の限定語を読む」）も含めてよい。
- 例（R6-PM1-1）: 価値駆動の要件定義／ステークホルダ選定／段階的・反復的検証／本番に近い環境での検証／予測型での品質作り込み／設問の限定語の読解。

---

## 6. マークアップ規約（強調）

描画は `src/components/MarkupText.tsx`（マスク無し版）。記法は `docs/note_markup_rules.md` 共通。
- `==重要語==` → **赤太字**（暗記対象・解答の核心キーワード）
- `__構造ラベル__` → **ネイビー(紫#9d5b8b)太字**（本文中の参照箇所・段階名・登場概念のラベル）
- 適用先: `overview` / `rows`(point/basis/reasoning/pitfall) / `detail` の全テキスト（problemSections.body, asked, thinkingProcess, commentary, keyKnowledge.description）。`modelAnswer` は素のまま。

### 強調の量（過剰禁止・応用情報M2の教訓）
- **1フィールド（文字列）あたり `==` ペアは2個まで、`__` ペアは2個まで**を目安（3個以上で MK6 WARN）。
- 開閉は必ずペア（`==x==` / `__x__`）。`__x==` のような開閉ミスマッチ厳禁。
- **全角イコール `＝` は使わない**（「は」「：」等に置換）。半角 `=` の連続（`===`）も禁止。

### 検査の穴に注意（重要）
- マークアップ検査（`validate-data` の MK1〜MK7）は **`rows` と `overview` のみ走査**し、**`detail` 配下は走査しない**。
- → `detail` の `==`/`__`/`＝` は**手動で**均衡・回避すること。目視＋下記の簡易チェックを使う:
  ```bash
  grep -c "＝" src/data/afternoonExplanations.ts          # 0 であること
  echo $(grep -o "==" src/data/afternoonExplanations.ts | wc -l)  # 偶数であること
  echo $(grep -o "__" src/data/afternoonExplanations.ts | wc -l)  # 偶数であること
  ```
- （将来候補: 検査を `detail` にも拡張する。）

---

## 7. UI・導線（実装済み。新規問はデータ追加だけで有効化）
- **問題一覧** `/afternoon`: 展開パネルに「📖 解説ページ」ボタン（`detail` がある問のみ表示）。
- **公式解答画面** `/afternoon/answers/:id`: 「詳細解説を読む」ボタン（`detail` がある問のみ）。
- **答え合わせ画面** `/afternoon/answers/:id/myAnswer`: checkMode で各行に「解説を見る」＋冒頭に「この問題の解説（概要）」＋「詳細解説ページ」リンク。
- **詳細解説ページ** `/afternoon/answers/:id/explanation`: 問題文の解説（セクション）／設問別詳細／習得知識。`?check=1` 付きで答え合わせ画面へ戻ると checkMode 状態で開く。
- 未投入問は自動で「準備中」フォールバック（ボタンも出ない）。

---

## 8. 品質ゲート・検証コマンド
```bash
npm run validate-data   # [MARKUP] NG: 0 を確認（rows/overview の均衡）＋既存整合
npm run build           # PASS
npx tsc --noEmit        # PASS
grep -c "＝" src/data/afternoonExplanations.ts   # 0
```
- 加えて**実機確認**（Claude Preview、モバイル375）: 答え合わせの折りたたみ・詳細ページのセクション・赤/ネイビー描画。
- `rowKey` が officialAnswers の全行と一致（欠落・余剰なし）。

---

## 9. 1問あたりチェックリスト
- [ ] PDF精読（PyMuPDF）→ 本文ページ特定 → 読了 → PNG/PDF削除
- [ ] officialAnswers / scoringMap で解答・配点・難所を確認
- [ ] `overview`（100-200字）
- [ ] `rows[]`: 全行に point/basis/reasoning、難所に pitfall。rowKey 完全一致
- [ ] `detail.problemSections`: 本文セクションごと＋各ブロック末尾に「→ 設問X」対応明記
- [ ] `detail.questionDetails`: 全設問に asked/thinkingProcess/modelAnswer/commentary
- [ ] `detail.keyKnowledge`: 4-6項目
- [ ] マークアップ均衡（==/__偶数・全角＝なし・1フィールド≤2ペア）／逐語引用なし
- [ ] `validate-data`(MARKUP NG 0) / `build` / `tsc` PASS ／ 実機確認
- [ ] commit `[C]` → push

---

## 10. 段階投入計画
- パイロット: **R6 → R5 → R4**（各3問＝9問）。年度単位でPDF読込を共有すると効率的。
- R6-PM1-1 完了済（基準サンプル）。次は **R6-PM1-2 → R6-PM1-3 → R5 → R4**。
- 9問完了でユーザ価値検証 → OK なら残り全年度へ展開。

---

## 改訂履歴
- 2026-05-29 v1.0 初版（R6-PM1-1 を雛形に F2-P8 で確立）。
