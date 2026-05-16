# 公式午前II 問題 作成ルール（F1.5-P4 確立 / F2-P3 適用）

> 確立日: 2026-05-17（F1.5-P4 R6秋期 25問の試行で確定）
> 適用範囲: 公式午前II（`officialMorningQuestions`）。**F2-P3 全年度投入時にも厳守**
> 対象: Claude / Codex の双方（Codex 作業指示書で本ドキュメントを参照させる）

このドキュメントは「**何を、どう書けば PM 学習アプリの公式午前II として正しく動くか**」を
コードレベルで決めたものです。判断に迷ったら本書を真とし、本書がカバーしていない場合は
ユーザに確認してから本書を更新します。

---

## 1. データ型と必須フィールド

`OfficialMorningQuestion`（`src/types/index.ts`）。必須/任意を厳密に守る:

| フィールド | 型 | 必須 | 例 |
|---|---|---|---|
| `id` | string | ✅ | `'om-R6-1'` |
| `year` | string | ✅ | `'R6'` |
| `yearLabel` | string | ✅ | `'令和6（2024）'` |
| `number` | number | ✅ | `1`（1〜25） |
| `questionText` | string | ✅ | IPA verbatim（後述） |
| `choices` | `[string, string, string, string]` | ✅ | IPA verbatim（後述） |
| `correctIndex` | `0 \| 1 \| 2 \| 3` | ✅ | 解答例 PDF と一致 |
| `explanation` | string | ✅ | 独自著作物（後述） |
| `categoryId` | string | ✅ | 12カテゴリ ID（後述） |
| `sourceUrl` | string | ✅ | IPA PDF URL |
| `figure` | `QuestionFigure` | 任意 | 図表あり問題のみ |

**id 採番**: `om-<年度コード>-<期 a/h>-<問題番号>` を将来形式とする。
F1.5 段階の `om-R6-1`〜`om-R6-25` は秋期省略形式だが、F2-P3 で複数年度・期を扱う際は
`om-R6a-1`（R6秋期）/ `om-R6h-1`（R6春期）等に明示すること。

---

## 2. 問題文（questionText）

### 2.1 IPA verbatim ルール（厳守）

- IPA 公式 PDF の文字列を **一字一句そのまま** コピー
- 改変禁止対象: 句読点（，。）／全角・半角／長音記号「ー」「－」／ローマ数字（Ⅰ Ⅱ）／漢字の旧字新字
- 改行（`\n`）も IPA 原文の段落構造に従う
- OCR 誤認識は **必ず原 PDF と目視照合して補正** する

### 2.2 [図: ...] / [表: ...] のテキスト埋込み禁止

旧 F1-P4 では `questionText` に `[図: ...]` というプレーンテキスト注記を入れていたが、
**F1.5-P4 以降は廃止**。図・表は `figure` フィールドに構造化して保持し、レンダラーが
描画する（§5 §6 参照）。

### 2.3 数式記法（§4 参照）

`questionText` 内で指数や分数が必要な場合、`MathText` マークアップを使う。

---

## 3. 選択肢（choices）

### 3.1 IPA verbatim（§2.1 と同じ厳守）

- 接頭辞「ア．」「イ．」等は **含めない**（UI 側で `ANSWER_LABELS` から付与）
- 末尾の句読点は IPA 原文に従う

### 3.2 数式記法

`MathText` マークアップ（§4 参照）を使用してよい。
ただし元データの可読性も維持するため、複雑なものは **コメントで `MathText` 適用済み** と注記する。

### 3.3 シャッフル出題への配慮

UI で Fisher-Yates シャッフルされるため、選択肢間に位置依存の参照を入れない
（「**上記の**いずれでもない」等は不可）。

---

## 4. 数式マークアップ（MathText）

`src/components/MathText.tsx` が解釈する LaTeX サブセット。
`questionText` / `choices` / `explanation` のいずれにも適用可能。

| マークアップ | 表示 | 例 |
|---|---|---|
| `^{exp}` | 上付き（指数） | `L^{0.98}` → L のうしろに小さな 0.98 |
| `_{sub}` | 下付き | `H_{2}O` |
| `frac{num}{den}` | 縦積み分数（横線あり、ネスト可） | `frac{1}{X}` |

### 4.1 ネスト分数

`frac{}{}` の `num` や `den` の中にさらに `frac{}{}` を入れられる。

例: `frac{1}{frac{1}{X}＋frac{1}{Y}＋frac{1}{Z}}`

### 4.2 既知の落とし穴

- 波括弧 `{` `}` をテキスト中で文字としては使わない（半角に限る）
- 全角の `＾`／`＿`／全角波括弧 `｛｝` はマークアップとして認識しない（避ける）
- マークアップを使う場合、IPA 原文の `／` 等は **削除して `frac{}{}` に置換** してよい
  （視覚的に IPA 原本の縦積み分数により忠実になるため。これは "verbatim" の精神を満たす）

---

## 5. 図（SVG）

### 5.1 データ構造

```ts
figure: {
  type: 'svg',
  ariaLabel: '...',      // スクリーンリーダー向け短文
  caption?: '図　...',    // 図の下に表示する任意のキャプション
  viewBox: '0 0 W H',    // viewBox を必ず指定
  content: `...`,        // <svg> タグの内側のみ（外側タグは含めない）
}
```

### 5.2 必須スタイル: テキスト白ハロー

すべての `<text>` 要素は線（矢印・軸など）と重なる可能性がある。
**必ず以下のスタイルブロックを `<defs>` に含める**:

```svg
<style>text { paint-order: stroke fill; stroke: white; stroke-width: 3px; stroke-linejoin: round; }</style>
```

これでテキストの背面に白いハローが描かれ、線の上でも読めるようになる。

### 5.3 推奨デザイン規範

- 線色: `#475569`（slate-600）／矢印用 `#1e293b`（slate-900）
- フィルタなしの単色アウトライン
- ノード（円）の半径: 16px
- ノード塗り: `white` / 枠線 `#1e293b` / `stroke-width: 1.5`
- フォント: 作業名は `font-size="13"` `font-weight="bold"`、所要日数は `font-size="12"` 通常
- 矢印マーカー: `<marker id="amN" ...>` で問題ごとに ID をユニーク化（`am4`, `am5`, `am6`...）

### 5.4 viewBox とモバイル幅

- viewBox の幅は 360〜620 を目安に（縦は内容次第）
- `QuestionFigureView` は `max-w-2xl w-full` で自動スケール
- 細かいテキストでも 360px 幅で読めるよう、`font-size` は **10 未満を使わない**

### 5.5 **セルフチェック必須**（重要）

SVG を新規作成・修正したら、**必ず PNG にレンダリングして目視確認**する:

```bash
# 1. SVG を tmp/figures/ に書き出す
npx vite-node scripts/render-morning-figures.ts

# 2. Inkscape で PNG 化
for f in tmp/figures/*.svg; do
  name=$(basename "$f" .svg)
  inkscape "$f" --export-type=png --export-filename="tmp/figures/${name}.png" --export-width=800
done

# 3. Claude セッションでは Read ツールで PNG を開いて目視チェック
```

チェック項目:
- [ ] 数字・ラベルが線に被って読めなくなっていない
- [ ] ラベル同士が重なっていない
- [ ] 矢印先端がノードに到達している
- [ ] ノードがラベル/線で隠れていない
- [ ] 軸の上下・左右の見切れがない
- [ ] 360px 表示時に細部が潰れていない（必要なら export-width=400 でも確認）

問題があれば SVG を修正 → 再レンダリング → 再確認を **可読性 OK までイテレーション**。

### 5.6 Codex に SVG 作成を委任する場合

- Codex 指示書で本ドキュメント §5 全文への参照を必須化
- セルフチェックを工程として明記し、その結果を `tasks/reviews/<task>_codex_*.md` に記録
- 「目視チェック結果」のスクショ無しの完了報告は不可

---

## 6. 表（HTML table）

### 6.1 データ構造

```ts
figure: {
  type: 'table',
  caption?: '〔...〕',
  headers: string[],            // 1行目（行ラベル列の corner cell + データ列の見出し）
  rows: (string | number)[][],  // 各行のセル値
  rowHeaderFirstCol?: boolean,  // true なら各行の最初のセルを <th> 扱い
}
```

### 6.2 モバイル幅対応の規範

13列以上の表でも 360px 幅で **横スクロールせずに収まる** こと。
`QuestionFigureView` は以下の最適化を実装済み:
- `table-fixed` + `colgroup` でデータ列を均等配分
- 1列目（行ラベル）: 4.5em
- データ列: `calc((100% - 4.5em) / 列数)`
- フォント: `text-[11px]`、`tabular-nums`、最小パディング

データ側の規範:
- 列見出しは可能な限り短縮（例: `'1月'` → `'1'`、caption に「列は月」を補足）
- corner cell は短く（例: `'要員 ＼ 月'`）
- 数値セルは `number` 型で（プレーン文字列より右揃え/`tabular-nums` が効きやすい）

### 6.3 セルフチェック

ブラウザ DevTools で 360px / 414px / 768px の各幅で確認。
横スクロールが発生するなら見出しを更に短縮するか、列を統合できないか検討。

---

## 7. 解説（explanation）

### 7.1 独自著作物（PMBOK第7版 + IPAシラバス Ver7.1 ベース）

- IPA 解答例 PDF から **引用しない**（解答例は「ア」「イ」のみで解説なし、安全）
- 自分で書くこと。PMBOK 用語は正式表記を使う

### 7.2 構成

- 第1文: なぜ正解が正解か（核心）
- 第2文以降: 他選択肢の誤答理由 or 補足知識

### 7.3 計算問題

- 式を明示（例: `TCPI = (BAC − EV) / (BAC − AC)`）
- 数値代入の手順を 1 ステップで完結に
- `MathText` マークアップで指数・分数を表示

---

## 8. カテゴリ付与（categoryId）

`src/data/categories.ts` の 12カテゴリのいずれかを **必ず** 付ける（任意フィールドだが運用上必須）。

| categoryId | 適用例 |
|---|---|
| `stakeholder` | ステークホルダー識別/分析/エンゲージメント |
| `team` | チーム/リーダーシップ/RACI |
| `development-approach` | 予測型/適応型/アジャイル/INVEST |
| `planning` | スコープ/スケジュール/コスト計画/CPM/PDM |
| `project-work` | 調達/契約/リソース/知識管理 |
| `delivery` | 価値実現/受入/品質 |
| `measurement` | EVM/KPI/予測/生産性 |
| `uncertainty` | リスク管理 |
| `integration` | 統合/変更管理/移行 |
| `governance` | ガバナンス/原則/倫理/コンプライアンス |
| `tailoring-models` | テーラリング/モデル/手法/成果物（GoF等） |
| `service-management` | ITIL/SLA/運用/監査/法務/セキュリティ運用 |

判断に迷う場合:
- 出題の主軸が何かを問う（例: 用語定義系 → その用語が属するカテゴリ）
- それでも迷ったらコメントで候補を併記してユーザに確認

---

## 9. フォントサイズ対応

- ユーザは Session 画面で **文字サイズを 2 段階切替**できる（`compact` / `comfortable`）
- 切替は `lib/preferences.ts` の `getMorningFontSize` / `setMorningFontSize`
- 表示時は `textClass = fontSize === 'comfortable' ? 'text-base' : 'text-[13px]'` を適用

データ作成者の対応事項:
- 問題文・選択肢・解説は **どちらのサイズでも読める** 設計に
- 図中の文字も最低 10px 以上に保つ（モバイル拡大時に縮んでも視認可）

---

## 10. IPA 著作権遵守チェックリスト

- [ ] 問題文・選択肢は IPA 原 PDF と完全一致
- [ ] 出典明記: `sourceUrl` に IPA 公式 URL
- [ ] 解説は自分で書いた（PMBOK/IPA 解説書の文章コピーなし）
- [ ] 図表は IPA 原本の情報を「再現」する範囲で、装飾は独自
- [ ] 同じ年度・期の問題を **25 問全て** 投入（部分投入で見栄えだけ良くしない）

---

## 11. Codex 委任時のチェックリスト

Codex に F2-P3 等で問題投入を委任する際、指示書に以下を含めること:

1. 本ドキュメント（`docs/morning_question_authoring_rules.md`）への参照を冒頭に明記
2. OCR 段階の作業範囲（問題文・選択肢・正解の verbatim 抽出）
3. **Codex は `explanation` を生成しない**（Claude 担当）
4. 図表は SVG / table の構造化データに変換（`[図: ...]` 注記は禁止）
5. SVG 作成セッションがある場合は §5.5 セルフチェックを必須工程に
6. レビュー記録: `tasks/reviews/<task>_codex_*.md` に
   - 使用した OCR ツール
   - 誤認識補正履歴
   - SVG セルフチェック結果（PNG 確認の有無）
   - validate-data / build pass の出力

---

## 12. 検証コマンド一覧

```bash
# 静的データ検証
npm run validate-data

# 型/ビルド
npm run build

# 図のレンダリング（セルフチェック用）
npx vite-node scripts/render-morning-figures.ts
for f in tmp/figures/*.svg; do
  name=$(basename "$f" .svg)
  inkscape "$f" --export-type=png --export-filename="tmp/figures/${name}.png" --export-width=800
done
```

---

## 改訂履歴

- 2026-05-17 v1.0 初版（F1.5-P4 R6秋期 25問の経験を反映）
  - SVG 白ハロー必須・セルフチェック手順を確立
  - フォントサイズ 2段階切替対応
  - 数式マークアップ MathText 仕様
  - 表のモバイル幅対応規範
