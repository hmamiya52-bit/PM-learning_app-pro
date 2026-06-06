# F2-P9 午後II 参考答案（模範解答・解説）作成ブリーフ ＝ 新セッション用キックオフ

> 作成: Claude（2026-06-06、F2-P8 午後I独自解説 37/37完了後）
> 担当: **Claude 単独**（文章=委譲不可。Codex は型/検証/雛形の機械作業のみ）
> このブリーフは**新セッションがこれだけ読めば着手できる**ことを目標とする。

## 0. ゴールと現在地
- **ゴール**: 午後II 論述問題（`essayProblems.ts` 全24本＝R6〜H25 各2問）に、Claude 著作の**フル参考答案（模範解答）＋解説**を付ける。
- **現在地**: 午後IIは現状 `essayProblems.ts` にテーマ・設問・推奨字数・PDFリンクのみ。**参考答案がゼロ**＝自己採点（5軸自己評価）の答え合わせ材料が無い。
- **このフェーズの着手範囲（ユーザ確定 2026-06-06）**: まず **パイロット R6/R5 の4本**（R6-PM2-1 / R6-PM2-2 / R5-PM2-1 / R5-PM2-2）を先行作成 → **ユーザ価値検証** → OK で残り20本へ展開。**闇雲に全件作らない**（ユーザ原則）。
- **計画順序（ユーザ変更 2026-06-06）**: **F2-P9（本フェーズ）→ F2-P7（仕上げ: バッジ再設計/QA/v1.0.0）** の順。F2-P9 を F2-P7 より先行。
- 並行して **Codex が午後I（F2-P8）の機械QA**を実施中（`tasks/codex/F2-P8_afternoon1_QA.md`）。その結果レポート（`tasks/reviews/F2-P8_afternoon1_codex_QA.md`）が出ていたら着手前に確認し、NG があれば午後I側を先に対応するか判断。

## 1. 最初に読むもの
- **`docs/afternoon_explanation_design.md` §5（午後II 模範解答設計）と §0.1/§0.2**（細部の確定・推奨デフォルト。**本ブリーフはそれを反映済**）。
- `src/data/essayProblems.ts` のパイロット4本（テーマ・設問ア/イ/ウ本文・`recommendedChars`・各PDFリンク）。
- `docs/afternoon_explanation_authoring_rules.md`（マークアップ規約・厳密検査の型。午後IIでも `designNote`/`pitfalls` のマークアップ均衡検査に流用）。
- `src/types/index.ts`（`EssayProblem` / `SetsumonLabel='ア'|'イ'|'ウ'` / `EssaySelfReview` 5軸）。
- `src/pages/EssayAttemptDetail.tsx`（提出後の振り返り画面＝参考答案リビールの主配置）/ `src/pages/EssayList.tsx`（一覧）。

## 2. 確定事項（ユーザ決定。迷ったらこれに従う）
| 項目 | 決定 |
|---|---|
| 形式 | フル参考答案を**1テーマ1本**（各 EssayProblem に完成答案1本）。「論述例の一つ」と明示。 |
| 文体 | **一人称体験談形式**（「私は〜のプロジェクトで〜」）。実際のPM論述に倣う。 |
| 事例 | 各答案に**架空PJ設定（業種・規模・期間・状況）を2〜3文で具体化**。4本（最終的に24本）で業種/論点が重複しないよう配分。 |
| 字数 | **やや上限寄り**。目安 **ア≒750 / イ≒1400 / ウ≒1100字**（各問の `recommendedChars` 範囲内に必ず収める）。 |
| 解説 | 各本に **`designNote`（設計意図・章立て/骨子/狙い 150-300字）＋ `pitfalls`（この問でありがちな失点 2-4件）**。丸暗記でなく**設計の型**を学ばせる。 |
| 「唯一の正解」誤認防止 | リビール冒頭に固定文言 **「これは論述例の一つです。唯一の正解ではありません」**。5軸自己評価には一切介入しない（採点は自己申告のまま）。 |
| 著作権 | 模範解答も100% Claude独自著作。**問題本文の長文逐語引用は禁止**（根拠は言い換え＋位置参照）。pdfUrl は IPA公式を指す（既存踏襲）。 |

## 3. データ構造（IPA引用データと独自著作を分離）
`essayProblems.ts`（IPA設問の引用）は**汚さない**。新規ファイルに分離する。

新規ファイル: `src/data/essaySampleAnswers.ts`
```ts
import type { SetsumonLabel } from '../types'

/** 午後II 参考答案（Claude 著作。論述例の一つであり唯一の正解ではない） */
export interface EssaySampleAnswer {
  id: string                                  // essayProblems.id と一致 'R6-PM2-1'
  byLabel: Record<SetsumonLabel, string>      // 設問ア/イ/ウ それぞれの完成答案本文（素文字列・マークアップなし）
  designNote: string                          // 設計意図（章立て・骨子・狙い 150-300字。__navy__ ラベル軽く可）
  pitfalls: string[]                          // この問でありがちな失点 2-4件（__navy__ 軽く可）
}

export const essaySampleAnswers: Record<string, EssaySampleAnswer> = { /* ... */ }
```
- パイロットは **4エントリ**（R6-PM2-1 / R6-PM2-2 / R5-PM2-1 / R5-PM2-2）。最終的に24本。
- `byLabel` の各本文は `essayProblems[].setsumons[].recommendedChars` の範囲内（やや上限寄り）。
- 未投入問は `essaySampleAnswers[id] === undefined` → UI は「参考答案準備中」フォールバック（段階投入を許容）。
- **答案本文（byLabel）は強調なし**（実際の答案を模すため。色付けは答案らしさを損なう）。`designNote`/`pitfalls` のみ `__navy__` 等を軽く可。

## 4. 執筆基準（パイロット品質）
1. **PDF精読**: 各問の `questionPdfUrl`（問題本文）＋ `answerPdfUrl`（**出題趣旨**）＋ `commentaryPdfUrl`（**採点講評**）を読み、「採点者が何を見るか／合格答案の要件」を掴む。午後Iと同じく PyMuPDF で PNG化→視覚精読→**作業後に削除**（リポジトリに残さない）。
2. **架空PJ設定**: 設問アで業種・規模・期間・体制・状況を2〜3文で具体化。設問イ/ウはそのPJで一貫させる（人物・数値・固有名を最後まで矛盾させない）。
3. **設問対応の厳守**: 設問ア/イ/ウが問う要素を**漏れなく**織り込む（例 R6-PM2-1なら ア=コスト要求事項/不確かさ/影響認識の共有、イ=予測活動/再見積りタイミング条件/協力/差異対応方針、ウ=実行段階の再見積りタイミング/差異内容/承認を得た対応策）。各設問本文を分解してチェックリスト化してから書く。
4. **PMBOK整合**: 用語・プロセスは PMBOK第7版＋IPA午後IIの語彙に整合（[[project_scope]] PMBOK+IPA）。背伸びした造語を避ける。
5. **字数**: 目安 ア≒750/イ≒1400/ウ≒1100。各問の min/max を**厳守**（特に下限。イは800以上、ウは600以上等）。
6. **designNote**: なぜこの章立て・骨子にしたか、どの設問要素にどう答えたかの設計の型（150-300字）。
7. **pitfalls**: その問で受験者が陥りやすい失点（題意ズレ・抽象論・字数不足・設問要素の取りこぼし等）2-4件。
8. **「論述例の一つ」注記**はUI側で固定表示（§5）。本文には埋め込まない。

## 5. UI 実装（午後IIは導線が未実装。本フェーズで作る）
午後I（checkMode統合済）と違い、**午後IIの参考答案リビールは未実装**。本フェーズで以下を実装する：
- **型追加**: `EssaySampleAnswer` を `src/types/index.ts`（または `essaySampleAnswers.ts` 内 export）に定義。
- **主配置**: `src/pages/EssayAttemptDetail.tsx`（提出後の振り返り画面）に**「参考答案を見る」リビール**（デフォルト折りたたみ `<details>`）。
  - **書く前は非表示**（コピー防止・トレーニング価値保持）。提出後＝この画面でのみ出す。
  - リビール冒頭に固定文言「これは論述例の一つです。唯一の正解ではありません」。
  - 自分の答案（ア/イ/ウ）と参考答案を**並置/切替**で比較。`designNote`/`pitfalls` も表示。
  - 5軸自己評価（`EssaySelfReview`）には介入しない（点数を自動補正しない）。
- **補助導線**: `src/pages/EssayList.tsx` に「参考答案あり」バッジ（`essaySampleAnswers[id]` がある問のみ）。
- 未投入問は「参考答案準備中」フォールバック。
- **モバイル375最優先**（縦長化防止＝デフォルト折りたたみ。応用情報M4教訓）。

## 6. 進め方（このフェーズ）
0. `cd /d/Claude/PMpro/PM-learning_app-pro && git pull`。Codex の午後I QA レポートがあれば確認。
1. **型＋雛形**: `EssaySampleAnswer` 型 ＋ `src/data/essaySampleAnswers.ts`（4本ぶんの空/下書きマップ）を用意（Codex に雛形・整合スクリプトを委譲可。文章は不可）。
2. **UI実装**: `EssayAttemptDetail.tsx` リビール＋`EssayList.tsx` バッジ＋フォールバック。build＋実機（モバイル375）で「書く前は非表示／提出後に表示／折りたたみ」を確認。
3. **執筆**: R6-PM2-1 → R6-PM2-2 → R5-PM2-1 → R5-PM2-2 の順に、PDF精読→架空PJ設定→ア/イ/ウ執筆→`designNote`/`pitfalls`→自己検証。**1本＝1コミット**（`[C] 午後II <id> 参考答案を新規作成`）。
4. **自己検証（各本）**: ①各設問の字数が min/max 内（ア750/イ1400/ウ1100目安）②設問要素の網羅③PJ設定の一貫性④PMBOK/語彙整合⑤問題本文の逐語引用なし（言い換え）⑥`designNote`/`pitfalls` のマークアップ均衡（`==`/`__` 偶数・全角`＝`なし・stray markerなし＝午後Iと同じ python チェック）。
5. **ゲート**: `npm run validate-data`（essaySampleAnswers の整合を Codex がチェッカー拡張していれば NG:0）／`npx tsc --noEmit`(exit0)／`npm run build`(PASS)。
6. **実機**: Claude Preview（"vite-dev" port5173、`preview_list`→無ければ`preview_start`）。`preview_resize mobile`→ EssayAttemptDetail で「提出前は参考答案ボタン非表示／提出後にリビール表示／折りたたみ→展開で全文・designNote・pitfalls・固定注記が出る／横スクロールなし(scrollW==clientW==375)／console error0」を確認。`EssayList` のバッジ表示も確認。
7. **4本完成・push 後にユーザ価値検証** → OK なら残り20本（R4〜H25 各2問）へ展開。PDF/PNGは**4本完成＋検証後に一括削除**（午後Iと同じ運用）。

## 7. 完了の定義（パイロット）
- 型＋`essaySampleAnswers.ts`＋リビールUI（EssayAttemptDetail/EssayList）実装済。
- R6-PM2-1/2・R5-PM2-1/2 の**4本**を作成・push（各 byLabel ア/イ/ウ＋designNote＋pitfalls、字数範囲内、設問要素網羅、PJ一貫、逐語引用なし）。
- 各本 tsc/build/validate-data PASS・モバイル375実機（書く前非表示／提出後リビール／折りたたみ／注記固定）確認。
- ユーザ価値検証を依頼 → 合否を受けて残り20本展開かを判断。

## 8. パイロット4本のテーマ（着手対象）
| id | number | theme | categoryIds |
|---|---|---|---|
| R6-PM2-1 | 1 | 予測型のシステム開発プロジェクトにおけるコストのマネジメント | planning/measurement/uncertainty/stakeholder |
| R6-PM2-2 | 2 | メンバーの状況に応じたリーダーシップの選択 | team 系 |
| R5-PM2-1 | 1 | プロジェクトマネジメント計画の修整（テーラリング） | tailoring-models 系 |
| R5-PM2-2 | 2 | 組織のプロジェクトマネジメント能力の向上につながるプロジェクト終結時の評価 | measurement/governance 系 |
（各設問ア/イ/ウの正確な本文・字数条件・PDFリンクは `essayProblems.ts` を参照。業種は4本で重複させない＝例: 製造/小売/金融/公共 等に振り分ける。）

## 9. 役割分担
- **文章生成（参考答案本文・designNote・pitfalls）は Claude が行う（委譲不可）**。最も判断密度が高く、弱い答案は学習を害するため。
- Codex には「型定義の追加」「`essaySampleAnswers.ts` の雛形/整合チェッカー（id一致・SetsumonLabel網羅・字数レンジ検査）」「build/tsc/lint」など機械作業のみ委譲可。
