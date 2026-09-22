# 午後Ⅰ演習の仕組み 移植 引継ぎプロンプト（PM Learning App → ネスペ学習アプリ）

> 用途: **ネスペアプリ側**（`D:\Claude\NWSP`）で新しいセッションを開き、冒頭にこのファイルの内容をまるごと貼り付ける。
> 作成: 2026-09-22 ／ 方針確定を反映して更新: 2026-09-22 ／ 移植元 HEAD: `6924e82`
> 移植元を読める前提で書いている（同じPC上の `D:\Claude\PMpro\PM-learning_app-pro` を直接 Read してよい）。

---

ネスペ学習アプリ（NW-learning_app-pro）に、PM Learning App で作り込んだ**午後Ⅰ問題演習の仕組み**を移植します。以下が引継ぎ情報です。

## 0. 確定済みの方針（ユーザ決定。勝手に変えない）

| # | 決定事項 | 内容 |
|---|---|---|
| 1 | 対象区分 | **午後Ⅰ（G1）のみ**。午後Ⅱ（G2）は今回対象外。ただし型の `section` は `'G1' \| 'G2'` のまま書き、G2 は「データ未投入」状態にしておく |
| 2 | 対象問題 | **R6 午後Ⅰ 問1（`R6-G1-1`「コンテンツ配信ネットワーク」）の1問だけ**。全件展開は今回やらない |
| 3 | 既存への影響 | **既存ページを壊さない・干渉しない**。新規ページは**独立した別ルート・別フォルダ・別ストレージキー**として作る（§5-F） |
| 4 | データ同期 | **新規データは同期対象に含めない**。`src/lib/sync/adapters.ts` の `KEYS` に**新しいキーを登録しない**（同期は明示ホワイトリスト方式なので、登録しなければ自動的に対象外） |
| 5 | 公式設問文 | **IPA 原文をアプリ内に転記する**（§5-C）。R6 午後Ⅰ 問1 の設問文のみ |
| 6 | 図表 | **完璧に再現する**（§5-D）。ただし IPA の図を画像で取り込むのではなく、**同じ情報・同じ構造を自作 SVG で描き直す** |
| 7 | 問題本文 | **PDF を開いて読む前提のまま**。本文（長文プロローグ・〔 〕節の地の文）はアプリ内に転記しない（§5-E） |

この結果、アプリ内に載るのは **公式設問文＋図表＋解答欄＋解説**、PDF で読むのは **問題本文**、という分担になる。
NW の設問文は「図1中の(a)に入れる字句」のように図表参照が多いため、**5と6はセットで初めて成立する**（設問文だけ転記しても図が無いと解けない）。この組合せは整合している。

「闇雲に全件作らない」が移植元プロジェクトの原則です。器（UI・型・検証）を先に通し、**1問を完成させてユーザに見せ、OK が出てから次を考える**。

**未確定事項は §11 にある。着手前にそこを確認すること。**

---

## 1. 移植元・移植先

| | 移植元（PM） | 移植先（ネスペ） |
|---|---|---|
| ローカル | `D:\Claude\PMpro\PM-learning_app-pro` | `D:\Claude\NWSP` |
| GitHub | hmamiya52-bit/PM-learning_app-pro | hmamiya52-bit/NW-learning_app-pro |
| LocalStorage prefix | `pmap:` | 既存は `nwsp:` ／ **今回の新規分は `nwsp:a1:`**（同期非対象） |
| dev サーバ（Browser pane） | `vite-dev` | `nwsp-dev`（`.claude/launch.json`・port 5173） |
| 午後Ⅰの区分 | `PM1` のみ（37問・各50点） | `G1`（午後Ⅰ・37問・50点）／ G2 は今回対象外 |
| 既存ルート | `/afternoon/...` | `/afternoon/...`（**触らない**） |
| 今回の新規ルート | — | `/afternoon1/...`（既存 `/afternoon` とはパスセグメントが別なので衝突しない） |

技術スタックはほぼ同一（React 19 + TS 5.9 + Vite 8 + Tailwind v3 + react-router v7 + PWA、永続化は LocalStorage のみ、バックエンド無し）。

---

## 2. 作るものの全体像

午後Ⅰ演習は4層でできている。ネスペ側には**①相当が既存ページとして既にあり、②〜④が無い**。
今回は**①も新規ページ側に自前で用意する**（既存ページに手を入れない＝§0-3 のため）。

| 層 | 中身 | 学習上の役割 |
|---|---|---|
| ① 演習・自己採点 | 解答欄への記入／タイマー／○△✕の自己採点／配点計算 | 解く |
| ② 行解説（答え合わせ用） | 各解答行の `point`（何を問うているか）／`basis`（本文のどこが根拠か）／`reasoning`（なぜその解答になるか）／`pitfall?`（ありがちな失点）／`knowledge?`（必要な技術知識・§5-B） | **採点直後に「自分の解答のどこが足りないか」が分かる** |
| ③ 詳細解説ページ | 問題文のセクション別解説／図解／設問別の「考え方のプロセス」／習得すべき知識／応用できる解法の型 | 腰を据えて復習する |
| ④ 公式設問文＋図表 | IPA 原文の設問文を解答欄の各行に折り畳みで表示。参照される図表を同じ画面に置く | PDF を行き来せずに設問を解ける |

②と③が**この移植の本体**（最大の学習価値）。

### 今回作る学習動線（既存 `/afternoon` とは完全に独立）

```
/afternoon1/R6-G1-1                （新規・この1問の入口。問題PDFへのリンク＋「解答欄へ」）
  └ /afternoon1/R6-G1-1/answer     解答欄（公式設問文の折り畳み・図表・タイマー・記入・下書きメモ）
       → 「答え合わせ」で checkMode に入り、
          各行に 自分の解答／公式解答例／行解説アコーディオン が縦に並ぶ
          ○△✕ を全行付けると配点計算（記録の扱いは §11-1）
  └ /afternoon1/R6-G1-1/explanation 詳細解説ページ（?check=1 で解答欄に戻れる）
```

**順序の設計が肝**: 解説は checkMode に入って初めて表示される（書く前は見えない）。答えを見てから書く流れにしない。

---

## 3. ネスペ側の現状

### そのまま読み取り専用で使う（変更しない）

- `src/data/afternoonProblems.ts`（60問・G1/G2。`R6-G1-1` は `questionPdfUrl` 付きで既にある）
- `src/data/officialAnswers.ts`（`R6-G1-1` は**11行**。行の形は §4 参照）
- `src/data/scoringMap.ts`（配点。`answers[]` と配列順で対応）
- `src/lib/answerTable.ts`（`processRows`：設問/小問の rowspan 計算。**PM版と完全に同一・localStorage 非依存＝安全に再利用可**）
- `src/lib/scoring.ts`（配点行数・満点の整合検証。**localStorage 非依存＝安全に再利用可**）
- `src/components/textbook/figures/figureTokens.ts`（色・線・余白の共通トークン。**図の見た目を既存と揃えるために import する**）

### 触らない（読むだけ・書き込み関数は呼ばない）

- `src/pages/AfternoonProblems.tsx` / `AfternoonAnswerDetail.tsx` / `AfternoonMyAnswer.tsx` — **1行も変更しない**
- `src/lib/tracker.ts` / `src/lib/gamification.ts` / `src/lib/activityLog.ts` — localStorage に書き、かつ**同期対象**。§0-4 のため**書き込み関数を呼ばない**
- `src/lib/sync/adapters.ts` — **`KEYS` に追記しない**
- `src/data/textbook/types.ts` の `Figure` 型と `FigureRenderer.tsx` — 既存教科書図の**閉じた判別共用体**。ここに `kind` を足すと既存に干渉するので**拡張しない**（§5-D）

### 今回新規に作るもの

- 解説データと型（`src/data/afternoon1/explanations.ts`）
- 公式設問文データ（`src/data/afternoon1/questionTexts/`）
- 図表コンポーネント（`src/components/afternoon1/figures/`）
- ページ3枚（`src/pages/afternoon1/`）
- 強調マークアップの描画（`src/components/afternoon1/MarkupText.tsx`）
- 静的データ検証（`scripts/validate-static-data.mjs` ＋ `npm run validate-data`）

---

## 4. 成果物（ファイル対応表）

移植元のパスは `D:\Claude\PMpro\PM-learning_app-pro\` 配下。**読んでから、NW の型・prefix・独立フォルダに読み替えて書く**（無編集コピーはしない）。

| 移植元 | 移植先（すべて新規ファイル） | 手当て |
|---|---|---|
| `src/components/MarkupText.tsx` | `src/components/afternoon1/MarkupText.tsx` | ほぼ無編集。`==赤==`＝赤太字 ／ `__x__`＝`#9d5b8b` 太字 |
| `src/data/afternoonExplanations.ts` の**先頭150行の型定義だけ** | `src/data/afternoon1/explanations.ts` | §5-B の `knowledge?` を追加。**11,000行のデータ本体はコピーしない**。データは `R6-G1-1` の1件のみ |
| `src/components/AfternoonFigure.tsx` | `src/components/afternoon1/AfternoonFigure.tsx` | `compare`（比較表）は流用。構成図は §5-D の自作 SVG 方式にする |
| `src/pages/AfternoonExplanationDetail.tsx` | `src/pages/afternoon1/ExplanationDetail.tsx` | 見出しと配色を NW に合わせる |
| `src/pages/AfternoonMyAnswer.tsx` | `src/pages/afternoon1/MyAnswer.tsx`（**新規。既存を改造しない**） | タイマー・記入・checkMode・○△✕・配点計算を自前で持つ。`processRows` と `getRowScores` は既存の純関数を import して再利用 |
| （PM に無い） | `src/pages/afternoon1/Entry.tsx` | この1問の入口。PDF リンクと解答欄への導線 |
| `src/lib/afternoonSavedAnswers.ts` | `src/lib/afternoon1/savedAnswers.ts`（prefix `nwsp:a1:savedAnswers:`） | 任意。§11-1 の判断次第 |
| `src/components/ScratchMemo.tsx` | `src/components/afternoon1/ScratchMemo.tsx` | その場限りの下書き（保存しない）。任意 |
| `src/data/afternoonQuestionTexts/types.ts` ＋ 年度別ファイル1枚 | `src/data/afternoon1/questionTexts/types.ts` ＋ `r6.ts` | **形（`rowKey` / `heading` / `lead?` / `text`）をそのまま踏襲**。§5-C |
| `scripts/validate-static-data.ts` の **午後Iブロック / runAfternoonExplanationStructureAudit / runMarkupValidation** | `scripts/validate-static-data.mjs`（新規） | NW には `vite-node` が無い。**既存 `scripts/lint-note-red.mjs` `lint-figure-motion.mjs` と同じ素の Node スクリプトで書くのが第一候補**（依存追加なし・リポジトリの流儀に合う）。`"validate-data"` として package.json に登録 |
| `scripts/audit-afternoon-asked.ts` | 同等の検査を `validate-static-data.mjs` に内包 | 公式設問文の rowKey が解答行と1:1か突合する（§5-C） |
| `docs/afternoon_explanation_authoring_rules.md` | `docs/afternoon1_authoring_rules.md`（**NW版に書き換え**） | §5 の判断を反映。次の量産セッションはこの1枚だけ読めば書ける状態を目標にする |
| `docs/afternoon_explanation_design.md` | 参考（移植先には不要） | 設計判断の経緯。読むだけ |

### データ型の核（`src/data/afternoon1/explanations.ts`）

```ts
AfternoonExplanation {
  id: string                       // officialAnswers.id と一致（今回は 'R6-G1-1'）
  overview: string                 // 問題全体の趣旨（目安100-200字）
  rows: AfternoonRowExplanation[]  // 解答行と rowKey で 1:1
  detail?: {
    problemSections: { heading, body }[]        // 問題本文をセクションごとに紐解く
    figures?: AfternoonFigure[]                 // 比較表 or 自作構成図
    questionDetails: AfternoonQuestionDetail[]  // 設問ごとの考え方＋解説
    keyKnowledge: { term, description }[]       // 習得すべき知識 4-6件
    solvingTips?: string[]                      // 他問にも転用できる解法の型 3件前後
  }
}
AfternoonRowExplanation  { rowKey, point, basis, reasoning, pitfall?, knowledge? }
AfternoonQuestionDetail  { rowKey, heading, asked, thinkingProcess[], modelAnswer, commentary }
```

**`rowKey` が全体の要**: `rowKey = s + '|' + (q ?? '') + '|' + (t ?? '')`（`makeRowKey(s,q,t)` と同一）。
`officialAnswers['R6-G1-1'].answers[]` の**11行と完全一致**させる（欠落も余剰も不可）。この問の実際の行:

```
1|(1)|      1|(2)|ア    1|(2)|イ    1|(3)|
2|(1)|ウ    2|(1)|エ    2|(2)|      2|(3)|    2|(4)|
3|(1)|      3|(2)|
```

うち `essay: true`（記述式）は `1|(1)|` `2|(4)|` `3|(1)|` `3|(2)|` の4行、残り7行は用語・数値の穴埋め。**この内訳が §5-A の厚み分けに直結する**。

---

## 5. 設計判断（★単純コピーが効かない箇所）

PM 午後Ⅰは「ほぼ全行が記述式・根拠は問題本文の中だけ」。NW 午後Ⅰは性質が違うので、以下は**移植ではなく設計し直し**になる。

### A. 穴埋め行と記述行で解説の厚みを変える

`R6-G1-1` は11行中7行が用語穴埋め（`essay` 無し）。PM のルール（全行に point/basis/reasoning）をそのまま当てると穴埋め行の解説が冗長で読みにくい。

→ **確定**: `essay: true` の4行はフル3点セット＋難所に `pitfall`。穴埋め行は `point` を省略可とし、`reasoning` に「何の知識を問うているか」を1〜2文で。
→ 型は変えずに**執筆ルール側で分ける**（`docs/afternoon1_authoring_rules.md` に明記）。

### B. 根拠が「本文」と「プロトコル知識」の二本立て

PM の `basis` は常に問題本文の位置参照で足りる。NW は「本文のこの記述＋HTTP/DNS/BGP の仕様知識」の**両方**が根拠になる行が大半。

→ **確定**: `AfternoonRowExplanation` に `knowledge?: string`（この行を解くのに要る技術知識。40-80字）を**追加**する。
→ UI は `basis` の下に「必要な知識」として表示。既存の教科書/ノートの該当章へリンクできるとなお良い（`src/data/textbook/chapters/*` と `src/data/notes/*` を**読み取りのみ**で参照）。
→ 型を足したら検証スクリプトと執筆ルールも同時に更新すること。

### C. 公式設問文の転記（§0-5 = やる）

PM と同じく、IPA 原文の設問文を年度別ファイルに転記して解答欄の各行に折り畳みで出す。PDF は画像スキャンでテキスト抽出できないため、**ページを画像化して目視転記**する。

- 形は PM の `src/data/afternoonQuestionTexts/types.ts` と年度別ファイルを**そのまま踏襲**（`rowKey` / `heading` / `lead?` / `text`）。
- **原文を改変・要約しない**。要約は別フィールド `asked` の役割。
- **転記するのは設問文（設問1〜3の問いの文）だけ**。問題本文（プロローグ・〔 〕節の地の文）は §0-7 のとおり転記しない。
- 図表参照（「図1中の(a)」等）はそのまま原文どおり書く。参照先の図は §5-D で同じ画面に用意するので成立する。
- 転記後、**設問文の `rowKey` が解答行11件と1:1で対応しているか**を検証スクリプトで突合する（PM の `scripts/audit-afternoon-asked.ts` が同じことをしている。参考にする）。

### D. 図表の完璧な再現（§0-6 = やる）

**方針: IPA の図をビットマップで取り込まない（著作権）。同じ情報・同じ構造・同じラベルを自作 SVG で描き直す。**

既存 `src/components/textbook/figures/` の再利用可否を整理すると:

- `figureTokens.ts`（色・線・余白の共通トークン、54行）→ **import して使う**。既存図と見た目が揃う。
- `FigureRenderer.tsx` と `src/data/textbook/types.ts` の `Figure` 型 → **拡張しない**。これは `kind` で分岐する**閉じた判別共用体**で、ここに試験図用の `kind` を足すと既存教科書側に干渉する（§0-3 違反）。
- `TopologyView` / `SegmentMapFigure` / `SequenceFigure` 等の個別コンポーネント → **試験図を「完璧に」再現するには汎用レンダラでは表現力が足りない**。参考に読むのは有用だが、無理に流し込まない。

→ **確定**: `src/components/afternoon1/figures/` に**図ごとの専用 SVG コンポーネント**を手で書く（例 `R6G1-1Fig1.tsx`）。スタイルは `figureTokens` に揃える。
→ `AfternoonFigure` の `compare`（3列までの比較表）は PM から流用する（「キャッシュヒット↔ミス」「Anycast↔Unicast」等の対比は NW でも効く）。
→ **最初に PDF を画像化して図表を棚卸しし、「図番号・何を表す図か・設問との対応」の一覧をユーザに見せてから描き始める**（描く量がここで決まるため）。
→ SVG の注意: モバイル375px で崩れないこと。同一ページに複数図を置くと `<marker id>` 等が衝突するので id はページ内一意にする。

### E. 問題本文は PDF 前提（§0-7）

入口ページ（`Entry.tsx`）と解答欄に `afternoonProblems` の `questionPdfUrl` へのリンクを置き、**「本文は PDF で読む」旨を明示**する。
本文をアプリ内に持たないぶん、詳細解説ページの `problemSections` が本文理解の受け皿になる。ここは**本文のセクション構成どおりに区切り、各ブロック末尾に「→ 設問2(1)はここが根拠」と対応を明記**する（詳細ページの学習価値の核心）。

### F. 既存への非干渉を守るための具体ルール（§0-3・§0-4）

1. **既存ファイルを1行も変更しない**。新規追加のみ。例外は §11-2 の `App.tsx`（ルート追加）だけ。
2. 新規ルートは `/afternoon1/...`。既存 `/afternoon/...` とはセグメントが別。
3. 新規 LocalStorage キーは `nwsp:a1:` で始める。**`src/lib/sync/adapters.ts` の `KEYS` に登録しない**。
4. `tracker.ts` / `gamification.ts` / `activityLog.ts` の**書き込み関数を呼ばない**（既存の演習記録・XP・バッジ・同期に影響させない）。
5. 既存の純関数（`processRows` / `getRowScores`）は **import して読み取り再利用**してよい。localStorage 非依存なので副作用が無い。
6. 既存の型 `Figure` / `FigureRenderer` を拡張しない（§5-D）。
7. **作業後に `git status` と `git diff --stat` で、既存ファイルの変更が0件であることを確認する**（§8）。

---

## 6. 実装フェーズ（この順で進める）

### P0: 棚卸し（コードを書く前）
1. `R6-G1-1` の問題 PDF を画像化して精読（§7-1 の手順）。
2. **図表の一覧**（図番号／何を表す図か／どの設問が参照するか）と、**設問文の分量**をユーザに報告し、§5-D で描く図の範囲を確定する。
3. `officialAnswers['R6-G1-1']` の11行と `scoringMap` の配点を突合して、rowKey 一覧を確定する。

### P1: 器を通す（コード。コンテンツ0件でも動く状態）
4. `src/components/afternoon1/MarkupText.tsx` を移植。
5. `src/data/afternoon1/explanations.ts` を**型定義＋空マップ**で新規作成（§5-B の `knowledge?` を含める）。
6. `src/data/afternoon1/questionTexts/types.ts` と空の `r6.ts`。
7. `src/components/afternoon1/AfternoonFigure.tsx`（compare のみ）。
8. ページ3枚（`Entry.tsx` / `MyAnswer.tsx` / `ExplanationDetail.tsx`）を新規作成し、ルート `/afternoon1/:id`・`/answer`・`/explanation` を `React.lazy` で追加。
9. **データ未投入でも「準備中」フォールバックで動くこと**を確認（解説が空でも解答欄は機能する）。
10. `scripts/validate-static-data.mjs` と `npm run validate-data` を整備。
11. §8 の品質ゲート（非干渉チェック含む）を通して commit & push。

### P2: 1問を書き切る（R6-G1-1）
12. 公式設問文を転記（§5-C）→ rowKey 突合。
13. 図表を自作 SVG で再現（§5-D）→ 375px で確認。
14. `rows[]` 11行の行解説（§5-A の厚み分け）。
15. `detail`（`problemSections` / `questionDetails` / `keyKnowledge` 4-6件 / `solvingTips` 3件前後）。
16. §8 を通して commit & push し、**ユーザに見てもらう**。型・分量・粒度をここで確定する。

### P3: ルール確定（次の量産セッションへの引継ぎ）
17. OK が出たら `docs/afternoon1_authoring_rules.md` を確定させる。**次の問はこの1枚だけ読めば書ける状態**にする。
18. 既存ページとの統合（入口リンク・演習記録連携）をやるかどうかは、ここで改めてユーザに確認する。

---

## 7. 解説の書き方

1問あたりの手順:

1. **問題PDFを精読**。PDFは画像ベースでテキスト抽出できないので、ページを画像化して読む:
   ```bash
   cd /tmp && curl -sL -o q.pdf "<afternoonProblems[].questionPdfUrl>"
   python -c "import fitz; d=fitz.open('q.pdf'); [d[i].get_pixmap(dpi=150).save(f'p{i:02d}.png') for i in range(d.page_count)]; print(d.page_count)"
   ```
   構成図と設問文の転記は細部が要るので dpi=200〜210 で描き直して読む。**読み終えたら `/tmp` の png と pdf を削除**（著作権：画像をリポジトリに残さない）。
2. `officialAnswers` の解答例と `scoringMap` の配点を確認。**高配点・部分点が割れる行が `pitfall` を付ける難所**。
3. `overview` → 「状況 → ぶつかる難所 → 何が問われるか」の流れで書く。設問の平板な列挙にしない。
4. `rows[]` を書く（§5-A の厚み分け、§5-B の `knowledge`）。`basis` は**位置参照＋言い換え**（例「〔CDN の導入検討〕で〜と述べている」）。
5. `detail` を書く。`problemSections` は**本文のセクション構成どおり**に区切り、**各ブロックの末尾に「→ 設問2(1)はここが根拠」と対応を明記**する。
6. `keyKnowledge` 4〜6件、`solvingTips` 3件前後（他の問にも転用できる汎用テクニックに限る）。

### 厳守事項

- **問題本文の逐語引用は禁止**。根拠は必ず「位置参照＋言い換え」。**ただし公式設問文（§5-C）は原文転記が目的なので例外**。両者を混同しない。
- `officialAnswers.ts` / `scoringMap.ts`（IPA引用データ）は**書き換えない**。解説は別ファイルに分離する。
- 強調マークアップ: `==重要語==`（赤・解答の核心）／ `__構造ラベル__`（ネイビー・本文の参照箇所や段階名）。
  **1フィールドあたり各2ペアまで**。開閉は必ずペア。**全角 `＝` は使わない**。`===` も禁止。
- `modelAnswer` は `officialAnswers` の解答例と一致させる（複数解答は `／` 連結）。

---

## 8. 品質ゲート（この順で全部通してから commit）

```bash
npm run build          # = tsc -b && vite build（型検査はこれで行う）
npm run validate-data
npm run lint
```

- **`npx tsc --noEmit` は使わない**。NW 側は composite 構成のため `--noEmit` が実質無検査になる（NW リポジトリで既に明文化済み）。型検査は `tsc -b`＝`npm run build` で行う。
- `build` はエラー 0、`validate-data` は rowKey 突合・図表制約・マークアップ均衡が NG 0、`lint` は src 配下 error 0。

### 非干渉チェック（§0-3・§0-4。毎回やる）

```bash
git status --short
git diff --stat HEAD
```

- **既存ファイルの変更が0件**であること（新規追加のみ。例外は §11-2 の `App.tsx` 1ファイルだけ）。
- 次の diff が**空**であること:

```bash
git diff HEAD -- src/lib/sync/adapters.ts src/lib/tracker.ts src/lib/gamification.ts src/pages/AfternoonMyAnswer.tsx src/pages/AfternoonProblems.tsx src/pages/AfternoonAnswerDetail.tsx src/data/textbook/types.ts
```

- 新規コードが `tracker` / `gamification` / `activityLog` の書き込み関数を呼んでいないこと（grep で確認）。

### 全角イコールの混入チェック（0件であること）

```bash
grep -c "＝" src/data/afternoon1/explanations.ts
```

マークアップの開閉ミスマッチは検証スクリプトの穴（移植元では `detail` 配下を走査しない実装だった）で頻発した。移植時に**`detail` 配下も走査するよう拡張**するか、下記の厳密検査を毎回回すこと:

```bash
python -c "import re;[print(i) for i,l in enumerate(open('src/data/afternoon1/explanations.ts',encoding='utf-8'),1) if '==' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l)) or '__' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l))]"
```

何も出力されなければ開閉が全行で整合している。

加えて **Browser pane（`nwsp-dev`）で実機確認**。モバイル375px と通常幅の両方で、答え合わせの折り畳み・詳細ページ・自作SVG図・赤/ネイビーの描画・コンソールエラー0 を見る。
**既存 `/afternoon` の動線が従来どおり動くことも併せて確認**する（非干渉の実機確認）。

---

## 9. 落とし穴（移植元で実際に踏んだもの）

- **rowKey のズレ**: `officialAnswers` の行を増減・並べ替えると、解説も配点も設問文も黙ってズレる。NW は `t` ラベル付きの行が多いぶん危険（`R6-G1-1` も `ア`〜`エ` がある）。触ったら必ず `validate-data`。
- **配点の行数ズレ**: `scoringMap[id]` は `answers[]` と**配列の並び順**で対応している（`src/lib/scoring.ts` が既に検証しているので、解説側も同じ思想で検証を足す）。
- **解説を先に見せてしまう UI**: `checkMode` の外に解説を出すと演習が成立しない。「書く→採点→解説」の順序を崩さない。
- **公式設問文を要約してしまう**: 原文転記が目的。要約は `asked` フィールドの役割。混ぜない。
- **モバイルで縦に伸びすぎる**: 解説は必ず `<details>` の**既定閉じ**。比較表は3列まで。
- **SVG の id 衝突**: 同一ページに図が並ぶと `<marker id>` 等が衝突する。ページ内で一意にする。
- **CRLF**: 一部データファイルが CRLF。スクリプトで一括置換するときは CRLF を LF に正規化してから処理し、書き戻し時に復元する。
- **一時スクリプト**: `scripts/_*` に置き、**commit 前に必ず削除**（lint が拾ってエラーになる）。
- **Windows で `/dev/stdin` が使えない**: 一時 JSON ファイル経由にする。
- **PDF 由来の画像をリポジトリに残す**: 著作権。読み終えたら消す。

---

## 10. 運用ルール

- **コミット prefix は移植先（NW）の流儀に従う**: Conventional Commits（`feat(afternoon1): ...` / `fix(afternoon1): ...` / `docs(afternoon1): ...` / `chore: ...`）。移植元 PM の `[C]` `[Doc]` 形式は持ち込まない
- **`git add` は明示パス指定**（`-A` や `.` を使わない）
- **変更したら確認を待たずに commit & push**（ユーザはデプロイ版で動作確認する）
- セッション開始時に `git pull origin main`
- コミットメッセージ末尾に `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

## 11. 未確定事項（着手前にユーザに確認する）

### 11-1. 新規ページの演習結果を、既存の演習記録・XP・バッジに反映するか

§0-3（干渉しない）と §0-4（同期に含まない）を厳密に守ると、**新規ページの採点結果は既存の演習記録に残らず、XP もバッジも付かない**（`tracker.ts` / `gamification.ts` が同期対象のため）。

→ **推奨**: 反映しない。新規ページは `nwsp:a1:` 配下に**自前の記録**（最高点・演習回数・答案スナップショット）だけ持つ。既存と二重管理になるが、1問だけの試作なので害は小さい。統合は §6-P3 で判断する。
→ もし「XP は付けたい」なら §0-3/§0-4 の一部を緩める判断が必要なので、**実装前に確認**する。

### 11-2. 新規ページへの入口をどこに置くか

独立性を厳密に守ると、既存の問題一覧（`AfternoonProblems.tsx`）にボタンを足すこと自体が「既存ファイルの変更」になる。

→ **推奨**: まず **URL 直打ち**（`/afternoon1/R6-G1-1`）で作り切る。`App.tsx` へのルート追加だけは必要（これは実質避けられないので §0-3 の唯一の例外として扱う）。
→ 見せる段階で「既存一覧に1リンク足すか」をユーザに確認する。

---

引継ぎは以上です。§11 を確認してから §6-P0 に着手してください。
