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
1. 型 + 空マップ雛形作成（`afternoonExplanations.ts`）。【Codex 委譲可】
2. パイロット **R6 / R5 / R4（約22問）** を Claude が本文PDF精読の上で執筆。【委譲不可】
3. `AfternoonMyAnswer.tsx` checkMode に行解説アコーディオン（折りたたみ）＋ overview を統合。`rowKey` で `processRows` の行と突合。
4. `rowKey` 整合検証（officialAnswers の全行に対応解説があるか／余剰がないか）。【Codex 委譲可】
5. `npm run build` + 実機（モバイル375×812 / デスクトップ）確認 → commit `[C]`。
6. ユーザ価値検証 → OK なら残り15問へ展開。

## Codex 分担
| Claude（委譲不可） | Codex（委譲可） |
|---|---|
| 本文PDF精読、解説の内容そのもの、根拠付け、マークアップ判断、テンプレ確定、Codex成果物レビュー | 型定義追加、空マップ雛形、`rowKey` 整合チェックスクリプト、build/型検証 |

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
