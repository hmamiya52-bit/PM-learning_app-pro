# 午後Ⅰ演習の仕組み 移植 引継ぎプロンプト（PM Learning App → ネスペ学習アプリ）

> 用途: **ネスペアプリ側**（`D:\Claude\NWSP`）で新しいセッションを開き、冒頭にこのファイルの内容をまるごと貼り付ける。
> 作成: 2026-09-22 ／ 移植元 HEAD: `1eb2b33`
> 移植元を読める前提で書いている（同じPC上の `D:\Claude\PMpro\PM-learning_app-pro` を直接 Read してよい）。

---

ネスペ学習アプリ（NW-learning_app-pro）に、PM Learning App で作り込んだ**午後Ⅰ問題演習の仕組み**を移植します。以下が引継ぎ情報です。

## 0. 着手前に必ず確認すること（★空欄のまま進めない）

下の4点はユーザ判断が必要です。**未確定なら実装前に質問してください。**

```
Q1. 対象は午後Ⅰ（G1・37問）だけか、午後Ⅱ（G2・24問）も含めるか:
Q2. 解説を書く範囲（全年度 / 直近3年パイロットのみ / まず1問で型を見る）:
Q3. 公式設問文（IPA原文）をアプリ内に転記するか（§5-C の論点。NWは図表参照が多く PM より難しい）:
Q4. 問題本文の構成図をアプリ内で再現するか、PDFを開いて解く前提のままにするか（§5-D）:
```

推奨デフォルト: **Q1=G1のみ / Q2=まず1問で型を確定→パイロット3問→検証→展開 / Q3=保留（先に解説本体） / Q4=再現しない（PDF前提）**。
「闇雲に全件作らない」が移植元プロジェクトの原則です。器（UI・型・検証）を先に通し、コンテンツは1問ずつ検証しながら増やしてください。

---

## 1. 移植元・移植先

| | 移植元（PM） | 移植先（ネスペ） |
|---|---|---|
| ローカル | `D:\Claude\PMpro\PM-learning_app-pro` | `D:\Claude\NWSP` |
| GitHub | hmamiya52-bit/PM-learning_app-pro | hmamiya52-bit/NW-learning_app-pro |
| LocalStorage prefix | `pmap:` | `nwsp:` |
| dev サーバ（Browser pane） | `vite-dev` | `nwsp-dev`（`.claude/launch.json`・port 5173） |
| 午後Ⅰの区分 | `PM1` のみ（37問・各50点） | `G1`（午後Ⅰ・37問・50点）/ `G2`（午後Ⅱ・24問・100点） |

技術スタックはほぼ同一（React 19 + TS 5.9 + Vite 8 + Tailwind v3 + react-router v7 + PWA、永続化は LocalStorage のみ、バックエンド無し）。
**そのままコピーできる部分が多いが、§5 の NW 固有論点だけは単純コピーでは機能しない。**

---

## 2. 移植する「仕組み」の全体像

午後Ⅰ演習は4層でできている。ネスペ側には**①だけが既にあり、②〜④が無い**。

| 層 | 中身 | 学習上の役割 |
|---|---|---|
| ① 演習・自己採点 | 問題一覧／解答欄への記入／タイマー／○△✕の自己採点／配点計算／記録・学習計画日 | 解く |
| ② 行解説（答え合わせ用） | 各解答行の `point`（何を問うているか）/ `basis`（本文のどこが根拠か）/ `reasoning`（なぜその解答になるか）/ `pitfall?`（ありがちな失点） | **採点直後に「自分の解答のどこが足りないか」が分かる** |
| ③ 詳細解説ページ | 問題文のセクション別解説／図解（比較表・関係図）／設問別の「考え方のプロセス」／習得すべき知識／応用できる解法の型 | 腰を据えて復習する |
| ④ 公式設問文 | IPA 原文の設問文を解答欄の各行に折り畳みで表示 | PDFを行き来せずに解ける |

②と③が**この移植の本体**（最大の学習価値）。①は既存を活かす。

### 学習動線（PM側の完成形）

```
/afternoon（問題一覧：年度別・最高点・演習回数・学習計画日・「📖 解説ページ」ボタン）
  └ /afternoon/answers/:id                公式解答例の閲覧（→「詳細解説を読む」）
      └ /afternoon/answers/:id/myAnswer   解答欄（タイマー・記入・下書きメモ）
          → 「答え合わせ」を押すと checkMode に入り、
             各行に 自分の解答／公式解答例／行解説アコーディオン が縦に並ぶ
             ○△✕ を全行付けると配点計算→「記録する」で演習記録＋XP＋バッジ
      └ /afternoon/answers/:id/explanation 詳細解説ページ（?check=1 で解答欄に戻れる）
```

**順序の設計が肝**: 解説は checkMode に入って初めて表示される（書く前は見えない）。答えを見てから書く流れにしない。

---

## 3. ネスペ側の現状（差分）

既にあるもの（そのまま使う・壊さない）:

- `src/data/afternoonProblems.ts`（60問・G1/G2）／`src/data/officialAnswers.ts`（61セット）／`src/data/scoringMap.ts`
- `src/lib/answerTable.ts`（`processRows`：設問/小問の rowspan 計算。**PM版と完全に同一**）
- `src/lib/tracker.ts`（演習記録・学習計画日・`getMaxScore('G1')=50 / 'G2'=100`）
- `src/lib/scoring.ts`（配点行数・満点の整合検証。PM には無い NW 固有の資産）
- `src/pages/AfternoonProblems.tsx` / `AfternoonAnswerDetail.tsx` / `AfternoonMyAnswer.tsx`（タイマー・checkMode・○△✕・記録まで動く）
- `src/components/textbook/figures/*`（TopologyView / SegmentMapFigure / SequenceFigure ほか多数。**§5-D で再利用する**）

無いもの（今回作る）:

- 独自解説データと型（`afternoonExplanations.ts`）
- 詳細解説ページ（`AfternoonExplanationDetail.tsx`）と図表描画（`AfternoonFigure.tsx`）
- 強調マークアップの描画（`MarkupText.tsx`：`==赤==` / `__ネイビー__`）
- 解答スナップショット（`afternoonSavedAnswers.ts`：過去の演習回の答案と採点を再表示する）
- 下書きメモ（`ScratchMemo.tsx`）
- 公式設問文（`afternoonQuestionTexts/`）
- 静的データ検証（`npm run validate-data`。ネスペ側には `validate-static-data.ts` 自体が無い）

---

## 4. 移植する成果物（ファイル対応表）

移植元のパスは `D:\Claude\PMpro\PM-learning_app-pro\` 配下。**読んでから、NW の型・prefix に読み替えて書く**（無編集コピーはしない）。

| 移植元 | 移植先 | 手当て |
|---|---|---|
| `src/components/MarkupText.tsx` | 同名 | ほぼ無編集。`==赤==`=赤太字 / `__x__`=`#9d5b8b` 太字 |
| `src/data/afternoonExplanations.ts`（先頭150行の**型定義だけ**） | 同名（データは空マップで開始） | §5-A/B の型拡張を検討。11,000行のデータ本体はコピーしない |
| `src/components/AfternoonFigure.tsx` | 同名 | `compare`（比較表）は流用。`diagram` は §5-D の判断次第 |
| `src/pages/AfternoonExplanationDetail.tsx` | 同名 | 見出し「午後Ⅰ 問N」「詳細解説」等を NW の配色・区分に合わせる |
| `src/pages/AfternoonMyAnswer.tsx` の checkMode 統合部分 | 既存 `AfternoonMyAnswer.tsx` に**追記** | 全面置換しない。既存のタイマー・採点・記録ロジックは NW 側のものを維持 |
| `src/lib/afternoonSavedAnswers.ts` | 同名（`nwsp:savedAnswers:` prefix） | 演習記録から当時の答案を開けるようにする |
| `src/components/ScratchMemo.tsx` | 同名 | その場限りの下書き（保存しない）。任意 |
| `src/data/afternoonQuestionTexts/` | 同名 | Q3 が Yes のときだけ |
| `scripts/validate-static-data.ts` の **午後Iブロック / runAfternoonExplanationStructureAudit / runMarkupValidation** | `scripts/validate-static-data.ts`（新規） | NW 版は既存 `src/lib/scoring.ts` の検証と統合する。NW には `vite-node` が入っていないので、**既存 `scripts/lint-*.mjs` と同じ素の Node スクリプト（`scripts/validate-static-data.mjs`）で書くのが第一候補**（依存追加なし・リポジトリの流儀に合う）。TS のまま移植したい場合のみ `vite-node` を devDependencies に追加する。いずれも `"validate-data"` として package.json に登録する |
| `scripts/audit-afternoon-asked.ts` | 同名 | Q3 が Yes のときだけ |
| `docs/afternoon_explanation_authoring_rules.md` | `docs/afternoon_explanation_authoring_rules.md`（**NW版に書き換え**） | §5 の判断を反映した NW 用ルールにする。量産セッションはこの1枚だけ読めば書ける状態を目標にする |
| `docs/afternoon_explanation_design.md` | 参考（移植先には不要） | 設計判断の経緯。読むだけ |

### データ型の核（`afternoonExplanations.ts`）

```ts
AfternoonExplanation {
  id: string                       // officialAnswers.id と一致（NW は 'R7-G1-1' 形式）
  overview: string                 // 問題全体の趣旨（目安100-200字）
  rows: AfternoonRowExplanation[]  // 解答行と rowKey で 1:1
  detail?: {
    problemSections: { heading, body }[]        // 問題本文をセクションごとに紐解く
    figures?: AfternoonFigure[]                 // 比較表 or 関係図
    questionDetails: AfternoonQuestionDetail[]  // 設問ごとの考え方＋解説
    keyKnowledge: { term, description }[]       // 習得すべき知識 4-6件
    solvingTips?: string[]                      // 他問にも転用できる解法の型 3件前後
  }
}
AfternoonRowExplanation  { rowKey, point, basis, reasoning, pitfall? }
AfternoonQuestionDetail  { rowKey, heading, asked, thinkingProcess[], modelAnswer, commentary }
```

**`rowKey` が全体の要**: `rowKey = s + '|' + (q ?? '') + '|' + (t ?? '')`（`makeRowKey(s,q,t)` と同一）。
`officialAnswers[id].answers[]` の各行と**完全一致**させる（欠落も余剰も不可）。
例: `{s:'1',q:'(1)',t:'a'}` → `'1|(1)|a'` ／ `{s:'2'}` → `'2||'`。
NW は `t` に `'a'` `'大阪本社'` のようなラベルが入る行が多く、**PM より rowKey がぶれやすい**。検証スクリプト（§8）で必ず突合すること。

---

## 5. NW 固有の設計判断（★単純コピーが効かない箇所）

PM 午後Ⅰは「ほぼ全行が記述式・根拠は問題本文の中だけ」。NW 午後Ⅰは性質が違うので、以下は**移植ではなく設計し直し**になる。

### A. 穴埋め行と記述行で解説の厚みを変える

NW の `answers[]` には `{s:'1',q:'(1)',t:'a', a:'バックボーン'}` のような**用語穴埋め**（`essay` 無し）と、`essay: true` の記述式が混在する。
PM のルール（全行に point/basis/reasoning）をそのまま当てると、穴埋め行の解説が冗長で読みにくくなる。

→ **推奨**: `essay: true` の行はフル3点セット＋難所に `pitfall`。穴埋め行は `point` を省略可とし `reasoning` に「何の知識を問うているか」を1〜2文で。
→ 型は変えずに**執筆ルール側で分ける**（`docs/afternoon_explanation_authoring_rules.md` に明記）。

### B. 根拠が「本文」と「プロトコル知識」の二本立て

PM の `basis` は常に問題本文の位置参照で足りる。NW は「本文のこの記述＋OSPF/VRRP/TLS の仕様知識」の**両方**が根拠になる行が大半。

→ **推奨**: `AfternoonRowExplanation` に `knowledge?: string`（この行を解くのに要る技術知識。40-80字）を**追加**する。
→ UI は `basis` の下に「必要な知識」として表示。既存ノート/教科書の該当章へのリンクを張れるとなお良い（`src/data/textbook/chapters/*` と `src/data/notes/*` が使える）。
→ 型を足したら検証スクリプトと執筆ルールも同時に更新すること。

### C. 公式設問文の転記（Q3）

PM では IPA 原文の設問文を年度別ファイルに転記して解答欄に表示している（PDFは画像スキャンでテキスト抽出不可のため、ページを画像化して目視転記）。
NW の設問文は「図1中の(a)に入れる字句」「表2の設定を踏まえ〜」のように**本文の図表を指す参照**を多く含み、設問文だけ転記しても図が無いと成立しない行がある。

→ **推奨**: 先送り。②③の解説を先に作り、価値が出たら「図表参照を含まない設問だけ転記」から始める。
→ やる場合は PM の `src/data/afternoonQuestionTexts/types.ts` と年度別ファイルの形（`rowKey` / `heading` / `lead?` / `text`）をそのまま踏襲する。**原文を改変・要約しない**こと（要約は別フィールド `asked` の役割）。

### D. 図解（Q4）

PM の `AfternoonFigure` は `compare`（3列までの比較表）と `diagram`（グリッド配置の関係図。`col` は 0〜1 に制限＝モバイル375px 対応）の2種類。
NW の午後Ⅰはネットワーク構成図が理解の中心なので、`diagram` のグリッド関係図では表現力が足りない場面がある。

→ **推奨**: `compare`（比較表）はそのまま移植（「OSPF↔BGP」「アクティブ/スタンバイ↔ロードシェア」等の対比は NW でも最頻出で効く）。
→ 構成図は**既存の `src/components/textbook/figures/`（TopologyView / SegmentMapFigure / SequenceFigure / PacketFlowFigure など）を再利用**する。新規に描画系を作らない。
→ IPA の問題図を画像として取り込むことはしない（著作権）。解説用に**要点だけ抽象化した自作図**にする。

### E. G2（午後Ⅱ・100点）を含めるか（Q1）

NW の午後Ⅱは記述式（PM の論述とは別物）なので、**同じ仕組みがそのまま使える**。ただし1問あたりの分量が2倍近い。
→ **推奨**: まず G1 で型を確立し、G2 は後追い。`section` 分岐は最初から `'G1' | 'G2'` で書いておき、データ投入だけ後回しにする。

---

## 6. 実装フェーズ（この順で進める）

### P1: 器を通す（コード。コンテンツ0件でも動く状態）
1. `MarkupText.tsx` を移植。
2. `afternoonExplanations.ts` を**型定義＋空マップ**で新規作成（§5-B の `knowledge?` 追加を判断）。
3. `AfternoonFigure.tsx`（compare のみ、または §5-D の判断に沿って）。
4. `AfternoonExplanationDetail.tsx` を追加し、`App.tsx` に `/afternoon/answers/:id/explanation` を追加（`React.lazy`）。
5. 既存 `AfternoonMyAnswer.tsx` の checkMode に、行解説アコーディオン（`<details>`・**既定は閉じる**）と overview ブロックを追記。
6. `AfternoonProblems.tsx` / `AfternoonAnswerDetail.tsx` に「解説ページ」導線を追加（`detail` がある問だけ表示）。
7. **未投入の問は自動で「準備中」フォールバック**になることを確認（データが1件も無くても既存動線が壊れないこと）。
8. `validate-static-data.ts` と `npm run validate-data` を整備。
9. ここで一度 commit & push。

### P2: パイロット（コンテンツ1問→3問）
10. **まず1問**（推奨: 最新年度 `R7-G1-1`）を書き切り、ユーザに見てもらう。型・分量・粒度をここで確定する。
11. OK が出たら同年度の残り2問。3問そろった時点で `docs/afternoon_explanation_authoring_rules.md`（NW版）を確定させる。

### P3: 量産
12. 年度単位で展開（1年度ぶんのPDFを1回読んで3問まとめて書くのが効率的）。
13. 1問ごとに §8 の品質ゲートを通して commit & push。

---

## 7. 解説の書き方（NW版に読み替えたルール）

1問あたりの手順:

1. **問題PDFを精読**。PDFは画像ベースでテキスト抽出できないので、ページを画像化して読む:
   ```bash
   cd /tmp && curl -sL -o q.pdf "<afternoonProblems[].questionPdfUrl>"
   python -c "import fitz; d=fitz.open('q.pdf'); [d[i].get_pixmap(dpi=150).save(f'p{i:02d}.png') for i in range(d.page_count)]; print(d.page_count)"
   ```
   構成図は細かいので dpi=200〜210 で描き直して読む。**読み終えたら `/tmp` の png と pdf を削除**（著作権：画像をリポジトリに残さない）。
2. `officialAnswers` の解答例と `scoringMap` の配点を確認。**高配点・部分点が割れる行が `pitfall` を付ける難所**。
3. `overview` → 「状況 → ぶつかる難所 → 何が問われるか」の流れで書く。設問の平板な列挙にしない。
4. `rows[]` を書く（§5-A の厚み分け）。`basis` は**位置参照＋言い換え**（例「〔ルータ更改の検討〕で〜と述べている」）。
5. `detail` を書く。`problemSections` は**本文のセクション構成どおり**に区切り、**各ブロックの末尾に「→ 設問2(1)はここが根拠」と対応を明記**する（これが詳細ページの学習価値の核心）。
6. `keyKnowledge` 4〜6件、`solvingTips` 3件前後（他の問にも転用できる汎用テクニックに限る）。

### 厳守事項

- **問題本文の逐語引用は禁止**。根拠は必ず「位置参照＋言い換え」。
- `officialAnswers.ts` / `scoringMap.ts`（IPA引用データ）は**書き換えない**。解説は別ファイルに分離する。
- 強調マークアップ: `==重要語==`（赤・解答の核心）/ `__構造ラベル__`（ネイビー・本文の参照箇所や段階名）。
  **1フィールドあたり各2ペアまで**。開閉は必ずペア。**全角 `＝` は使わない**。`===` も禁止。
- `modelAnswer` は `officialAnswers` の解答例と一致させる（複数解答は `／` 連結）。

---

## 8. 品質ゲート（この順で全部通してから commit）

```bash
npm run build          # = tsc -b && vite build（型検査はこれで行う）
npm run validate-data
npm run lint
npm run lint:figures   # §5-D で textbook 図を再利用した場合のみ
```

- **`npx tsc --noEmit` は使わない**。NW 側は composite 構成のため `--noEmit` が実質無検査になる（NW リポジトリで既に明文化済み）。型検査は `tsc -b`＝`npm run build` で行う。
- `build` はエラー 0、`validate-data` は解説の rowKey 突合・図表制約・マークアップ均衡が NG 0、`lint` は src 配下 error 0。
- 全角イコールの混入チェック（0件であること）:

```bash
grep -c "＝" src/data/afternoonExplanations.ts
```

マークアップの開閉ミスマッチは検証スクリプトの穴（移植元では `detail` 配下を走査しない実装だった）で頻発した。移植時に**`detail` 配下も走査するよう拡張**するか、下記の厳密検査を毎回回すこと:

```bash
python -c "import re;[print(i) for i,l in enumerate(open('src/data/afternoonExplanations.ts',encoding='utf-8'),1) if '==' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l)) or '__' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l))]"
```

何も出力されなければ開閉が全行で整合している。

加えて **Browser pane（`nwsp-dev`）で実機確認**。モバイル375px と通常幅の両方で、答え合わせの折り畳み・詳細ページ・赤/ネイビーの描画・コンソールエラー0 を見る。

---

## 9. 落とし穴（移植元で実際に踏んだもの）

- **rowKey のズレ**: `officialAnswers` の行を増減・並べ替えると、解説も配点も黙ってズレる。NW は `t` ラベル付きの行が多いぶん危険。触ったら必ず `validate-data`。
- **配点の行数ズレ**: `scoringMap[id]` は `answers[]` と**配列の並び順**で対応している（`src/lib/scoring.ts` が既に検証しているので、解説側も同じ思想で検証を足す）。
- **解説を先に見せてしまう UI**: `checkMode` の外に解説を出すと演習が成立しない。「書く→採点→解説」の順序を崩さない。
- **モバイルで縦に伸びすぎる**: 解説は必ず `<details>` の**既定閉じ**。比較表は3列まで。
- **CRLF**: 一部データファイルが CRLF。スクリプトで一括置換するときは CRLF を LF に正規化してから処理し、書き戻し時に復元する。
- **一時スクリプト**: `scripts/_*.ts` に置き、**commit 前に必ず削除**（lint が拾ってエラーになる）。
- **Windows で `/dev/stdin` が使えない**: 一時 JSON ファイル経由にする。
- **SVG の id 衝突**: 同一ページに図が並ぶと `<marker id>` 等が衝突する。ページ内で一意にする。

## 10. 運用ルール

- **コミット prefix は移植先（NW）の流儀に従う**: Conventional Commits（`feat(afternoon): ...` / `fix(afternoon): ...` / `docs(afternoon): ...` / `chore: ...`）。移植元 PM の `[C]` `[Doc]` 形式は持ち込まない
- **`git add` は明示パス指定**（`-A` や `.` を使わない）
- **変更したら確認を待たずに commit & push**（ユーザはデプロイ版で動作確認する）
- セッション開始時に `git pull origin main`
- コミットメッセージ末尾に `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

引継ぎは以上です。§0 の Q1〜Q4 を確認してから P1 に着手してください。
