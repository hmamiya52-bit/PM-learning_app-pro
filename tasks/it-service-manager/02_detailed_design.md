# ITサービスマネージャ寄り道モード 詳細設計 v1.0

作成日: 2026-06-01  
前提: `00_requirements.md` / `01_basic_design.md`

## 1. 詳細設計の目的

この文書は、ITSMモードを実装・レビュー・拡張するときの判断基準を定義する。
既存PM本編と混ざらないこと、頻出テーマを中心に短時間合格へ寄せることを最重要とする。

## 2. ルーティング詳細

```tsx
<Route path="/it-service-manager" element={<ItServiceManager />} />
<Route path="/it-service-manager/themes" element={<SmThemes />} />
<Route path="/it-service-manager/knowledge" element={<SmKnowledge />} />
<Route path="/it-service-manager/morning" element={<SmMorning />} />
<Route path="/it-service-manager/afternoon" element={<SmAfternoon />} />
<Route path="/it-service-manager/essay" element={<SmEssay />} />
<Route path="/it-service-manager/history" element={<SmHistory />} />
<Route path="/it-service-manager/report" element={<SmHistory />} />
```

`/it-service-manager/report` は初期実装では履歴画面へ向ける。
将来、テーマ別弱点レポートが必要になった時点で `SmReport` を分離する。

初回UIでは `/it-service-manager/report` への目立つ導線を出さない。
履歴画面を正式導線とし、`/report` は将来拡張または古い導線互換のためのエイリアスとして扱う。

## 3. コンポーネント詳細

### 3.1 `ItServiceManager`

責務:

- ITSMハブ画面。
- `getSmSummary()` でITSM専用進捗を集計する。
- 次アクションを提示する。
- 頻出テーマTop 5を表示する。

状態:

- React stateなし。
- LocalStorageから同期読み込み。

入力:

- `smMorningQuestions`
- `smAfternoonProblems`
- `smFrequentThemes`
- `smKnowledgeSections`
- `getSmSummary()`

表示ロジック:

```text
if 午前Ⅱの演習済み数 < 午前Ⅱ総数:
  午前Ⅱを提案
else if 午後Ⅰの着手問数 < 午後Ⅰ総数:
  午後Ⅰを提案
else if 午後Ⅱ練習本数 < 2:
  午後Ⅱを提案
else:
  履歴/レポート確認を提案
```

注意:

- 既存PMの `getAllProgress()`、`getRecentDaySummaries()`、`applyAnswer()` は呼ばない。

### 3.2 `SmPageChrome`

責務:

- ITSM内共通レイアウト。
- ヘッダー、戻りリンク、ITSM内ナビゲーションを提供。

ナビ項目:

- ハブ
- 頻出
- 知識
- 午前Ⅱ
- 午後Ⅰ
- 午後Ⅱ
- 履歴

注意:

- 既存Layoutは使うが、既存サイドバーにITSM項目は追加しない。
- ITSM内ナビゲーションはページ内に閉じる。

### 3.3 `SmThemes`

責務:

- 頻出テーマ一覧を表示する。

データ:

- `smFrequentThemes`

表示単位:

- 順位
- 頻出度
- 出題回
- 試験区分
- 要約
- まず覚えること
- 午前Ⅱ/午後Ⅰ/午後Ⅱでの出方
- インフラ案件例

将来:

- テーマ詳細ページを切る場合は `/it-service-manager/themes/:themeId` を追加する。

### 3.4 `SmKnowledge`

責務:

- 知識ノートを表示する。

状態:

- `openId: string`

データ:

- `smKnowledgeSections`
- `smFrequentThemes`

挙動:

- 左側/上部の章ボタンで表示章を切り替える。
- 章ごとに午前Ⅱ/午後Ⅰ/午後Ⅱへの使い方を表示する。

受入観点:

- ユーザが「この知識は午後でどう使うのか」を把握できること。

### 3.5 `SmMorning`

責務:

- 午前Ⅱの答案入力・採点・復習。

状態:

- `records: SmMorningRecord[]`
- `filter: 'all' | 'unattempted' | 'wrong' | 's'`
- `visibleCount: number`

主な関数:

- `loadSmMorningRecords()`
- `addSmMorningRecord(questionId, selected)`
- `clearSmMorningRecords()`

データ:

- `smMorningQuestions`
- `smFrequentThemes`

表示:

- 問番号
- 公式PDFリンク
- テーマ
- 頻出度
- フォーカス
- 選択肢ボタン
- 正答/直近回答
- 復習メモ

採点:

```text
selected === question.correct
```

履歴:

- 解答ごとに `pmap:sm:morning:records` へ追加。
- イベントとして `pmap:sm:events` へ追加。
- 既存PM履歴には追加しない。

注意:

- 問題文全文は保持しない。
- PDFのページ指定は補助的であり、PDFビューア側の挙動には依存しない。

### 3.6 `SmAfternoon`

責務:

- 午後Ⅰの自己採点。

状態:

- `selectedId`
- `records`
- `answerMemo`
- `reflection`
- `score`

主な関数:

- `loadSmAfternoonRecords()`
- `addSmAfternoonRecord()`
- `deleteSmAfternoonRecord()`

データ:

- `smAfternoonProblems`
- `smFrequentThemes`

保存:

```ts
{
  problemId,
  score,
  answerMemo,
  reflection,
  recordedAt
}
```

バリデーション:

- scoreは0から50。
- scoreが数値でない場合は保存しない。

表示:

- 問題一覧
- 最新点
- 問題PDF/解答例PDF/採点講評PDF
- 自分の解答メモ
- 公式解答例/要点
- 採点ポイント
- 採点講評要旨
- 罠
- 50点満点入力
- 履歴

注意:

- PM本編の `tracker.ts` は使わない。
- `pmap:tracker:*` へ書かない。

### 3.7 `SmEssay`

責務:

- 午後Ⅱの骨子作成、論述、自己評価、参考答案確認。

状態:

- `selectedId`
- `outline`
- `bodyByLabel`
- `attempts`
- `review`

主な関数:

- `loadSmEssayDrafts()`
- `saveSmEssayDraft()`
- `addSmEssayAttempt()`
- `markSmEssaySampleViewed()`

データ:

- `smEssayProblems`
- `smFrequentThemes`

保存:

下書き:

```ts
{
  problemId,
  outline,
  bodyByLabel,
  updatedAt
}
```

完了記録:

```ts
{
  problemId,
  outline,
  bodyByLabel,
  review,
  recordedAt
}
```

自己評価:

- `relevance`
- `specificity`
- `serviceManagement`
- `structure`
- `reflection`

文字数:

- 空白を除いた文字数を表示する。
- 合否判定はしない。

参考答案:

- `<details>` で閉じる。
- 開いたときにITSM専用イベントを記録する。
- 冒頭に「論述例の一つ」を表示する。

注意:

- 既存PMの `essay.ts` は使わない。
- 既存PM論述履歴には混ぜない。

### 3.8 `SmHistory`

責務:

- ITSM専用履歴を表示する。

データ:

- `getSmSummary()`
- `loadSmEvents()`
- `loadSmMorningRecords()`
- `loadSmAfternoonRecords()`
- `loadSmEssayAttempts()`

表示:

- 午前Ⅱ正答率
- 午後Ⅰ記録回数
- 午後Ⅱ記録本数
- 最近のイベント
- 午後Ⅰ記録
- 午後Ⅱ記録
- 午前Ⅱ直近記録

注意:

- 既存 `ActivityHistory` へは接続しない。

## 4. データ型詳細

### 4.1 `SmFrequentTheme`

```ts
interface SmFrequentTheme {
  id: string
  title: string
  rank: number
  frequency: 'S' | 'A' | 'B'
  appearsIn: SmExamPart[]
  years: string[]
  summary: string
  mustKnow: string[]
  morningPattern: string
  afternoonPattern: string
  essayPattern: string
  infraExamples: string[]
  relatedProblemIds: string[]
  evidenceNote: string
}
```

設計意図:

- 頻出テーマをすべての学習モードの接続点にする。
- `relatedProblemIds` により、R7問題や将来の年度問題へつなぐ。

### 4.2 `SmKnowledgeSection`

```ts
interface SmKnowledgeSection {
  id: string
  title: string
  themeId: string
  frequency: 'S' | 'A' | 'B'
  minutes: number
  summary: string
  keyPoints: string[]
  morningUse: string
  afternoonUse: string
  essayUse: string
  miniCheck: { question: string; answer: string }
}
```

設計意図:

- 1章が1つの頻出テーマに紐づく。
- 午前/午後への利用方法を必ず持つ。

### 4.3 `SmMorningQuestion`

```ts
interface SmMorningQuestion {
  id: string
  yearLabel: string
  number: number
  correct: 'ア' | 'イ' | 'ウ' | 'エ'
  themeId: string
  topic: string
  focus: string
  reviewNote: string
  source: SmSourceLinks
}
```

設計意図:

- 問題文全文を保持せず、公式PDF参照型とする。
- 復習価値を `focus` と `reviewNote` に持たせる。

### 4.4 `SmAfternoonProblem`

```ts
interface SmAfternoonProblem {
  id: string
  yearLabel: string
  number: number
  title: string
  themeIds: string[]
  purpose: string
  source: SmSourceLinks
  answerItems: SmAfternoonAnswerItem[]
  commentary: string[]
  traps: string[]
  evidenceNote: string
}
```

設計意図:

- 公式解答例/要点と独自解説を分けて持つ。
- 採点講評は長文転載ではなく、学習上の注意に要約する。

### 4.5 `SmEssayProblem`

```ts
interface SmEssayProblem {
  id: string
  yearLabel: string
  number: number
  title: string
  themeIds: string[]
  promptSummary: string
  source: SmSourceLinks
  expectedViewpoints: string[]
  outlineSamples: { title: string; bullets: string[] }[]
  evaluationCriteria: string[]
  sampleAnswers: SmEssaySampleAnswer[]
  evidenceNote: string
}
```

設計意図:

- 午後Ⅱに必要な骨子、評価観点、参考答案を1テーマ単位で持つ。
- 将来、5年分拡張時もテーマ一覧から選べる。

## 5. LocalStorage詳細

### 5.1 読み込み

全読み込み関数はJSON parse失敗時に空配列/空オブジェクトを返す。
既存PMの保存処理へ例外を伝播させない。

### 5.2 書き込み

各書き込みはITSM専用キーだけを対象にする。

イベント追加:

```text
addSmMorningRecord -> addEvent('morning-answer')
addSmAfternoonRecord -> addEvent('afternoon-record')
addSmEssayAttempt -> addEvent('essay-attempt')
markSmEssaySampleViewed -> addEvent('essay-sample-view')
```

### 5.3 サマリー

`getSmSummary()` が集計する。

午前Ⅱ:

- 最新回答を問題単位で集計する。
- 解答履歴が複数ある場合、直近を採用する。

午後Ⅰ:

- 問題別着手数
- 記録数
- 最高点

午後Ⅱ:

- テーマ別着手数
- 練習本数
- 自己評価平均

## 6. 画面別受入テスト

### 6.1 ハブ

- `/it-service-manager` が表示される。
- `午前Ⅱ`、`午後Ⅰ`、`午後Ⅱ` のカードがある。
- 頻出テーマTop 5がある。
- PMホームへ戻るリンクがある。
- 既存PMホームの進捗は変化しない。

### 6.2 頻出テーマ

- `インシデント管理と問題管理` が表示される。
- 頻出度S/A/Bが表示される。
- 午前Ⅱ、午後Ⅰ、午後Ⅱでの出方が表示される。
- インフラ案件例が表示される。

### 6.3 知識ノート

- 章切り替えができる。
- 午前Ⅱ、午後Ⅰ、午後Ⅱの使い方がある。
- ミニ確認がある。

### 6.4 午前Ⅱ

- R7春期25問が扱える。
- `ア/イ/ウ/エ` を選ぶと採点される。
- 正答と直近回答が表示される。
- 未演習、直近不正解、頻出Sでフィルタできる。
- 解答後、既存PM履歴にイベントが出ない。

### 6.5 午後Ⅰ

- 3問を切り替えられる。
- 公式PDFリンクがある。
- 自分の解答メモを書ける。
- 点数0-50で記録できる。
- 50点超過は保存不可。
- 記録後、ITSM専用履歴に出る。
- 既存PM午後Ⅰ履歴には出ない。

### 6.6 午後Ⅱ

- 2テーマを切り替えられる。
- 骨子例がある。
- 自分の骨子と本文を書ける。
- 字数が表示される。
- 自己評価を入力できる。
- 下書き保存できる。
- 練習完了記録できる。
- 参考答案2本がある。
- 参考答案閲覧がITSM専用履歴に残る。

### 6.7 履歴

- 午前Ⅱ、午後Ⅰ、午後Ⅱのサマリーが表示される。
- 最近のITSMイベントが表示される。
- 既存PM履歴と別である。

## 7. 既存PM無影響テスト

確認対象:

- `/`
- `/morning`
- `/afternoon`
- `/essay`
- `/search`
- `/history`
- `/badges`
- `/sync`

期待:

- 既存PM画面にITSMデータが出ない。
- 既存PM履歴にITSMイベントが出ない。
- 既存PMバッジ/XPに変化がない。
- 既存同期ペイロードに `pmap:sm:*` が含まれない。

## 8. 実装上の注意

### 8.1 既存差分を壊さない

作業時点で `Home.tsx` と `AppliedRefresh.tsx` に既存変更がある場合がある。
それらはユーザ変更として扱い、勝手に戻さない。

### 8.2 公式情報の再確認

実装・拡張のたびにIPA公式を確認する。

確認対象:

- 直近年度の問題/解答例/採点講評URL
- CBT移行後の名称・時間・形式
- シラバス改訂

出典管理は `05_source_policy.md` を正とする。
各問題データは `source.checkedAt` を持つ。

### 8.3 著作権・出典

- 公式PDFへのリンクを明示する。
- 問題文全文のアプリ内保持は避ける。
- 解説・骨子・参考答案は独自作成とする。
- 公式解答例/要点は出典を明示し、学習上必要な範囲で扱う。

## 9. 既知の初回実装ギャップ

設計上は将来必要だが、初回で必須ではないもの:

- 本番形式90分の午後Ⅰ2問選択
- テーマ別弱点レポート
- 年度別フィルタ
- 5年分データ分割
- 10回分すべての午前Ⅱ問題別UI投入

これらは初回レビュー後、5年分拡張フェーズで追加する。

午後Ⅱ120分タイマーは、学習時間計測ではなく本番形式支援である。
ただし初回では、骨子・本文・自己評価・参考答案比較の品質を優先し、タイマーは必須にしない。
画面上には「本番は120分」の静的表示だけを置ければよい。

## 10. 実装前デザインゲート

実装前に満たす条件:

- `07_10round_research_matrix.md` のランクS/Aを `smFrequentThemes` に反映する。
- `05_source_policy.md` に従い、問題文全文を保持しない。
- `06_acceptance_test_plan.md` の既存PM無影響テストを実装レビューに組み込む。
- `/report` は初回の主要導線に出さない。
- 公式出典の `checkedAt` を全問題データに入れる。
