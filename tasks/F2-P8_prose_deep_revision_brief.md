# F2-P8 午後I 解説 文章「深い改訂」ブリーフ（1問1セッション・自己完結）

> 起票: 2026-05-30。図表(figures)・解法の型(solvingTips)・基準サンプルは投入済み。
> 本ブリーフは**文章そのものの深い書き直し**を、品質維持のため**1問ごとに新しいセッション**で行うための指示書。
> **このファイル＋ `docs/afternoon_explanation_authoring_rules.md` を読めば着手できる**ことを目標とする。

## ゴール
既存の解説（`src/data/afternoonExplanations.ts`）の**文章を、より分かりやすく・学習価値が高くなるよう書き直す**。
正しさ・公式解答・rowKey・図表・解法の型は壊さない（=リライトは表現と構成の質の向上に限る）。

## 1セッション=1問（この順）
R6-PM1-1 → R6-PM1-2 → R6-PM1-3 → R5-PM1-1 → R5-PM1-2 → R5-PM1-3 → R4-PM1-1 → R4-PM1-2 → R4-PM1-3
（1問終わるごとに commit `[C]` → push → そのセッションは終了。次の問は新セッションで。）

## 改訂する対象（表現・構成の質）
- `overview`: 題材と問われるPM観点を、初学者にも一読で像が結ぶ平易さに。冗長な一文を分割。
- `detail.problemSections[].body`: **物語として流れる**ように。専門語は初出で噛み砕く。各段落1メッセージ。末尾の「→ 設問X対応」は残す。
- `detail.questionDetails[]`:
  - `thinkingProcess[]`: 各ステップを「何を見て→どう判断するか」がより明瞭な短文に。冗長なら統合。
  - `commentary`: なぜその解答かに加え、**つまずきの言語化**（なぜ間違えやすいか）を一段深く。
- `detail.keyKnowledge[].description`: 定義＋本問での使われ方＋他問への一般化、を簡潔に。

## 変えてはいけない（厳守）
- `officialAnswers.ts` / `scoringMap.ts` は**触らない**。`modelAnswer` は公式解答例と一致のまま（逐語）。
- `rowKey` は officialAnswers の全行と一致（欠落・余剰なし）。
- 既存の `figures`（比較表・関係図）・`solvingTips`（解法の型）は**維持**。本文を直したら図の note や tips と齟齬がないか合わせる。
- 本文の**逐語引用は禁止**（位置参照＋言い換え）。IPA問題PDFはリポジトリに保存しない（PNG化はephemeral・作業後削除）。

## マークアップ（§6 厳守・量産で頻発した事故に注意）
- `==重要語==`（赤）/ `__構造ラベル__`（ネイビー）。**開閉は同記号で**（`==x==` / `__x__`）。`==x__` の不整合厳禁。
- **全角 `＝` 禁止**（「は」「：」等へ）。
- `detail` 配下は自動MK検査が走らない。執筆後に**必ず厳密検査**:
  ```bash
  python -c "import re;[print(i) for i,l in enumerate(open('src/data/afternoonExplanations.ts',encoding='utf-8'),1) if '==' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l)) or '__' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l))]"
  grep -c "＝" src/data/afternoonExplanations.ts   # 0
  ```
  （何も出力されなければ stray marker 0）

## 品質ゲート（その問の改訂ごと）
```bash
npm run validate-data   # [MARKUP] NG: 0
npx tsc --noEmit        # PASS
npm run build           # PASS
```
- 実機（Claude Preview / モバイル375）: 詳細ページ `/afternoon/answers/<id>/explanation` と checkMode `/afternoon/answers/<id>/myAnswer?check=1` を確認（赤/ネイビー描画・図表・解法の型・コンソールエラーなし）。
- 改訂前後で**意味（根拠・解答の方向）が変わっていない**ことを自分でレビュー。

## 進め方の型（1問）
1. `git pull`。officialAnswers / scoringMap で対象の解答・配点・難所を再確認。
2. （必要なら）IPA問題PDFをPyMuPDFでPNG化して本文を再読 → 作業後 `rm`。
3. 当該問の `afternoonExplanations[id]` の文章を上記方針で改訂。
4. 厳密検査 → validate-data / tsc / build → 実機確認。
5. commit `[C]`（例: `[C] 午後I R6-PM1-1 解説の文章を深く改訂`）→ push。

## 完了の定義
9問すべての文章改訂が完了し、各問 push 済み。ユーザ価値検証へ。
