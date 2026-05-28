# 午後I 解説 / 午後II 模範解答 設計書（方針確定版）

> 作成: Claude（2026-05-29）
> ステータス: **方針確定のみ。実装は次セッション**
> 関連: `memory/project_scope.md`（論述採点非対応）, `src/data/officialAnswers.ts`, `src/data/essayProblems.ts`, `detailed_design.md §2.4 / §2.6`

## 0. 確定事項（ユーザ決定 2026-05-29）

| 項目 | 決定 |
|---|---|
| 今回の作業範囲 | **方針確定のみ。実コンテンツ生成・実装は次セッション** |
| 午後I 解説の深さ | **本文PDFを読んで根拠付き**（Claude が問題本文 PDF を読み、根拠箇所・出題意図まで踏み込む） |
| 午後II 模範解答の形式 | **フル参考答案を1テーマ1本**（各 EssayProblem に完成答案 1 本、「論述例の一つ」と明示） |

## 1. 背景・目的

- **午後I**: 現状 `officialAnswers.ts` に IPA 公式「解答例」(37問)はあるが、**「なぜその解答か」の解説が皆無**。自己採点後に学習者が「自分の部分点解答のどこが足りないか／本文のどこが根拠か」を理解できない。最大の学習ギャップ。
- **午後II**: 現状 `essayProblems.ts` にテーマ・設問・推奨字数・PDFリンクのみ。**参考答案が一切ない**。自己採点（5軸自己評価＋振り返り）の「答え合わせ材料」が不在。

## 2. 著作権の整理（両方クリア）

- IPA は午後I「解答例」は公開するが **「解説」は非公開** → 解説は 100% Claude 独自著作。
- IPA は午後II の **模範解答を一切非公開**（公開物は「出題趣旨」「採点講評」のみ）→ 模範解答も 100% Claude 独自著作。
- **禁止事項**: 解説・模範解答内で IPA 問題本文を長文逐語引用しない。根拠は **言い換え＋位置参照**（例「問題文 第2段落で〜と述べられている」）に留める。pdfUrl は IPA 公式を指す（既存方針踏襲）。

## 3. スコープ整合性（論述採点非対応との関係）

`project_scope.md` の「論述採点機能は非対応」が禁じるのは **添削・複雑な自動評価**。
模範解答（参考として読む答案例）は **採点機能ではなく参考読み物** → スコープ内。
ただし論述の性質上「唯一の正解」と誤認させない設計が必須:

- ラベルは **「参考答案（論述例の一つ）」** とし「模範解答」という断定語をUIで多用しない。
- 自己評価（5軸）の点数を参考答案が自動補正することはしない（採点はあくまで自己申告のまま）。

## 4. 午後I 解説 設計

### 4.1 データ構造（IPA引用データと独自解説を分離）

`officialAnswers.ts`（IPA 引用の純粋データ）は**汚さない**。独自解説は新規ファイルに分離する。

新規ファイル: `src/data/afternoonExplanations.ts`

```ts
/** 午後I 独自解説（Claude 著作。IPA 解答例 officialAnswers.ts と 1:1 対応） */
export interface AfternoonRowExplanation {
  rowKey: string     // `${s}|${q ?? ''}|${t ?? ''}` で officialAnswers の行と対応
  point: string      // この設問が問う力点（30-60字）
  basis: string      // 本文中の根拠（位置参照＋言い換え。逐語引用しない。40-90字）
  reasoning: string  // なぜこの解答例になるか（60-120字）
  pitfall?: string   // ありがちな失点・誤答パターン（40-80字、任意）
}

export interface AfternoonExplanation {
  id: string                       // officialAnswers.id と一致 'R6-PM1-1'
  overview: string                 // 問題全体の趣旨・題材・問われるPMBOK観点（100-200字）
  rows: AfternoonRowExplanation[]  // 行ごとの解説（officialAnswers.answers と対応）
}

export const afternoonExplanations: Record<string, AfternoonExplanation> = { /* ... */ }
```

- `rowKey` で `officialAnswers` の `AnswerRow`（s/q/t）と機械的に対応付け、欠落検証を可能にする。
- 解説が未投入の問は `afternoonExplanations[id]` が `undefined` → UI は「解説準備中」フォールバック（段階投入を許容）。

### 4.2 解説の中身（本文PDF根拠付き）

Claude が各年度の問題本文 PDF（`afternoonProblems[].questionPdfUrl`）を読み、以下を満たす:

1. `overview`: 題材（業種・プロジェクト状況）と、この問題が問う PM 観点（例: ステークホルダ調整／リスク対応）を要約。
2. `point`: 各小問が**何を答えさせたいか**（解答の方向性）。
3. `basis`: 本文の根拠段落を**位置で示し言い換え**（逐語引用しない）。
4. `reasoning`: 解答例の各要素がなぜ妥当か。
5. `pitfall`: 字数オーバー／観点ズレ／主語の取り違え等、ありがちな失点。

### 4.3 マークアップ規約

- ノート規約 `==赤==`（重要語）/ `__navy__`（構造ラベル）を**踏襲可だが過剰強調禁止**（応用情報 M2 の教訓: 1文に1-2語まで）。
- 機械的にハイライトせず、本当に効く語のみ。

### 4.4 UI 配置（`src/pages/AfternoonAnswerDetail.tsx`）

- 解答テーブルの**下**に「解説」セクションを追加。
- 冒頭に `overview` ブロック（brand 系の囲み）。
- 各 `設問` 単位で **アコーディオン（`<details>`）** にして行解説を格納。モバイルで縦長化しない（応用情報 M4 の教訓）。
- 自己採点（`/afternoon/answers/:id/myAnswer`）からの遷移後に解説を見られる導線。**自分で解いてから解説**の順序を崩さない。

### 4.5 分量・段階投入

- **パイロット: 直近3年 R6 / R5 / R4（約22問）を先行投入** → 価値検証 → 残り全37問へ展開。
- 闇雲に全件作らない（ユーザ原則）。

## 5. 午後II 模範解答（参考答案）設計

### 5.1 データ構造（独自著作を分離）

`essayProblems.ts`（IPA 設問・推奨字数の引用データ）は**汚さない**。新規ファイルに分離:

新規ファイル: `src/data/essaySampleAnswers.ts`

```ts
import type { SetsumonLabel } from '../types'

/** 午後II 参考答案（Claude 著作。論述例の一つであり唯一の正解ではない） */
export interface EssaySampleAnswer {
  id: string                                  // essayProblems.id と一致 'R6-PM2-1'
  byLabel: Record<SetsumonLabel, string>      // 設問ア/イ/ウ それぞれの完成答案本文
  designNote: string                          // この答案の設計意図（章立て・骨子・狙い 150-300字）
  pitfalls: string[]                          // この問でありがちな失点 2-4件
}

export const essaySampleAnswers: Record<string, EssaySampleAnswer> = { /* ... */ }
```

- フル参考答案 1テーマ1本＝**24本**（R6〜H25 各年度2問）。
- 各 `byLabel` は推奨字数（`essayProblems[].setsumons[].recommendedChars`）の範囲内で執筆（ア≤800 / イ800-1600 / ウ600-1200）。
- `designNote`/`pitfalls` で「なぜこの構成か」を補い、丸暗記でなく**設計の型**を学ばせる。

### 5.2 「論述例の一つ」framing（必須）

- UI ラベルは **「参考答案」**。本文冒頭に **「これは論述例の一つです。唯一の正解ではありません」** の注記。
- 採点（5軸自己評価）には一切介入しない（自己申告のまま）。

### 5.3 UI 配置

- **主配置: `src/pages/EssayAttemptDetail.tsx`（解答提出後の振り返り画面）**。
  - 学習者が自分の答案を書き終えた後に「参考答案を見る」リビールを配置。**書く前に見せない**（コピー防止・トレーニング価値保持）。
  - 自分の答案（ア/イ/ウ）と参考答案を**並置/切替**で比較。
- 補助導線: `src/pages/EssayList.tsx` から「参考答案あり」バッジ表示。
- 未投入問は `essaySampleAnswers[id]` が `undefined` → 「参考答案準備中」フォールバック。

### 5.4 マークアップ

- 参考答案**本文は強調なし**（実際の答案を模すため。色付けは答案らしさを損なう）。
- `designNote`/`pitfalls` のみ `__navy__` ラベル等を軽く使用可。

### 5.5 分量・段階投入・品質リスク

- フル答案 24本＝約48,000字の独自長文。**最大の品質リスク**（弱い答案は害）。
- **パイロット: 直近2年 R6 / R5（4本）を先行執筆 → ユーザがコンテンツ妥当性を確認 → 合格後に残り20本へ展開**。
- 1本ずつ Claude が執筆し、論理一貫性・PMBOK 整合・字数を自己検証。

## 6. Codex 分担（単純作業 vs Claude 判断）

| Claude（委譲不可・品質の核心） | Codex（単純作業・委譲可） |
|---|---|
| 本文PDF精読、解説/参考答案の**内容そのもの**、根拠付け、章立て設計、マークアップ判断、テンプレ確定、Codex 成果物の正確性レビュー | Claude 確定構造＋見本＋厳密テンプレに沿った**型定義ファイルの雛形作成**、データ整形、`rowKey` 整合チェックスクリプト、build/型検証、PDFリンク転記 |

- 解説・参考答案の**文章生成は Claude が行う**（品質が機能価値の本体のため委譲不可）。
- Codex には「型定義の追加」「空マップの雛形生成」「整合検証ツール」「ビルド確認」など機械的作業を割り当てる。

## 7. 実装タスク順序（次セッション）

1. `src/types` or 各 data ファイルに型追加（`AfternoonExplanation` / `EssaySampleAnswer`）。
2. `src/data/afternoonExplanations.ts` 雛形作成（空マップ＋型）。
3. 午後I 解説 **パイロット R6/R5/R4（22問）** を Claude が本文PDF精読の上で執筆。
4. `AfternoonAnswerDetail.tsx` に解説セクション（overview＋設問アコーディオン）実装。
5. build＋実機（モバイル/デスクトップ）確認 → commit `[C]`。
6. ユーザ価値検証 → OK なら残り15問へ展開。
7. （午後II）`src/data/essaySampleAnswers.ts` 雛形作成。
8. 午後II 参考答案 **パイロット R6/R5（4本）** を Claude が執筆。
9. `EssayAttemptDetail.tsx` に「参考答案を見る」リビール実装（書く前は非表示）。
10. build＋実機確認 → commit → ユーザ妥当性確認 → 残り20本へ展開。

## 8. リスクと対策

| リスク | 対策 |
|---|---|
| 解説が本文なしで浅くなる | Claude が問題本文 PDF を精読してから執筆（本決定）。 |
| 参考答案の品質不足が学習を害する | パイロット先行＋ユーザ妥当性確認ゲート。1本ずつ自己検証。 |
| 「唯一の正解」誤認 | UIで「論述例の一つ」明示。採点に介入しない。 |
| 模範解答を書く前に見てコピー | `EssayAttemptDetail`（提出後）にリビール配置。書く前は非表示。 |
| 著作権（本文逐語引用） | 根拠は位置参照＋言い換え。逐語引用禁止。 |
| 闇雲な分量増 | 直近年度パイロット → 検証 → 段階展開。 |

## 9. detailed_design.md への反映（次セッション着手時）

- §2.4（午後I）に「独自解説」サブ項、§2.6（午後II）に「参考答案」サブ項を追記。
- フェーズ番号: F2-P7 仕上げとは別の **F2-P8（午後I解説）/ F2-P9（午後II参考答案）** として起票するか、F2-P7 内サブタスク化するかは次セッションでユーザ判断。
