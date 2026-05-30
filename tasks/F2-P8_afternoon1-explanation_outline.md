# F2-P8 午後I 独自解説 アウトライン

> 設計書正本: `docs/afternoon_explanation_design.md`（方針確定版＋2026-05-29 第2回細部確定）
> detailed_design: §2.7g.2 / フェーズ表 F2-P8
> 要件確定: 2026-05-29（AskUserQuestion でユーザ合意）
> **F2-P7（仕上げ）より先行**

## ゴール
午後I 公式解答例（`officialAnswers.ts` 37問）に、Claude が問題本文PDFを精読した根拠付きの独自解説を付与し、答え合わせ画面で学習できるようにする。

## 確定要件
- **粒度**: 全解答行に `point/basis/reasoning`。`pitfall` は難所（部分点が割れやすい/高配点）のみ任意。
- **表示動線**: `src/pages/AfternoonMyAnswer.tsx` の checkMode に統合。各行の「解答例」ボックス直下に行解説アコーディオン（`<details>`、**デフォルト折りたたみ**）。`overview` は別途1ブロック。
- **著作権**: 本文の逐語引用禁止。根拠は位置参照＋言い換え（例「問題文 第2段落で〜」）。
- **マークアップ**: 解説本文は原則プレーン。本当に効く重要語のみ `==赤==`、構造ラベルに `__navy__`（1文1-2語まで）。

## データ構造（新規 `src/data/afternoonExplanations.ts`）
```ts
export interface AfternoonRowExplanation {
  rowKey: string     // `${s}|${q ?? ''}|${t ?? ''}` で officialAnswers の行と対応
  point: string      // この設問が問う力点（30-60字）
  basis: string      // 本文中の根拠（位置参照＋言い換え。40-90字）
  reasoning: string  // なぜこの解答例になるか（60-120字）
  pitfall?: string   // ありがちな失点（40-80字、難所のみ）
}
export interface AfternoonExplanation {
  id: string                       // officialAnswers.id と一致
  overview: string                 // 問題全体の趣旨・題材・PMBOK観点（100-200字）
  rows: AfternoonRowExplanation[]
}
export const afternoonExplanations: Record<string, AfternoonExplanation> = { /* ... */ }
```
- `officialAnswers.ts`（IPA引用データ）は**汚さない**。
- 未投入問は `afternoonExplanations[id]` が `undefined` → checkMode で「解説準備中」フォールバック（段階投入を許容）。

## 実装ステップ
1. 型 + 空マップ雛形作成（`afternoonExplanations.ts`）。【済】
2. checkMode 用の行解説（overview＋rows）を Claude が本文PDF精読の上で執筆。【委譲不可】
3. `AfternoonMyAnswer.tsx` checkMode に行解説アコーディオン（折りたたみ）＋ overview を統合。`rowKey` で `processRows` の行と突合。【済】
4. **詳細解説ページ**（`AfternoonExplanationDetail.tsx`・ルート `/afternoon/answers/:id/explanation`）。`AfternoonExplanation.detail`（問題文の解説／設問別の考え方プロセス＋詳細解説／習得すべき知識）を執筆。解答例画面・答え合わせ画面から導線。【委譲不可・ユーザ要望で追加】
5. `npm run build` + 実機確認 → commit `[C]`。
6. ユーザ価値検証 → OK なら残り問へ展開。

## 進捗（2026-05-29）
- R6-PM1-1: checkMode 行解説（overview＋8行）＋詳細解説（detail：問題文6セクション＋設問別＋習得知識）執筆・UI 実装・実機確認 済。基準サンプル。
- UI・導線・強調表示（MarkupText）すべて実装済。新規問は `afternoonExplanations.ts` にデータ追加するだけで全導線が有効化。
- 次: R6-PM1-2 / R6-PM1-3 → R5 → R4。各問とも「行解説」と「詳細解説」の両方を執筆する。

## ★量産ルール（必読・正本）
**`docs/afternoon_explanation_authoring_rules.md`**（2026-05-29 確立）に、データ型・PDF精読ワークフロー・各フィールド執筆基準・問題文セクション解説の作り方・マークアップ規約・検証・1問チェックリストを集約。**新セッションはこの文書だけ読めば量産に入れる。**

## 担当（2026-05-29 確定: Claude 単独 🅒）
**F2-P8 は Codex と分担せず Claude 単独で実施**。理由:
- 委譲可能な機械作業が極小（〜5%。型/空マップは作成済、残るは PNG化スクリプト・rowKey検証のみ）。
- ターン制では分担しても並列化されず、効果は「Claudeトークン節約」だけ。だがその節約対象（PDF精読＋執筆≒100k超）はそもそも委譲不可。委譲可能な小タスクは指示書＋レビューの調整コストが自作を上回る → オフロードが逆効果。
- F2-P1〜P4 のような大量OCR/整形が無く、コンテンツ純度が高い領域のため Codex の比較優位が出ない。

| Claude（全工程） |
|---|
| 本文PDF精読、解説執筆、checkMode UI統合、PNG化スクリプト、rowKey整合検証、build/型検証 |

## PDF 取得手順（画像ベースPDF対応）
- IPA 午後I 問題PDFは**画像ベース（テキスト抽出0文字）** → PyMuPDF でページPNG化して精読。
  ```
  pip install pymupdf
  python -c "import fitz; d=fitz.open('qs.pdf'); [d[i].get_pixmap(dpi=150).save(f'p{i}.png') for i in range(d.page_count)]"
  ```
- 150DPI で日本語判読可を実機確認済。
- **著作権**: IPA ページ画像（PNG/PDF）はリポジトリにコミットしない。毎セッション ephemeral 生成し作業後に削除。

## 品質ゲート
- `npm run build` PASS / マークアップ整合（`__`/`==` 偶数、全角`＝`混入なし）。
- 本文逐語引用なし（著作権 R1）。
- `rowKey` 欠落・余剰なし。
- 実機で checkMode の折りたたみ初期状態・モバイル縦長化なしを確認。

## パイロット対象（R6/R5/R4 = 約22問）
- R6: PM1-1 / PM1-2 / PM1-3
- R5: PM1-1 / PM1-2 / PM1-3
- R4: PM1-1 / PM1-2 / PM1-3
（実 id は `officialAnswers.ts` で要確認。各年度の問数も同ファイル基準）
