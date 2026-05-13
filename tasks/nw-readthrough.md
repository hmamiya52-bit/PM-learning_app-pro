# NW実装読み合わせ結果 (F1-P-1)

> NW-learning_app-pro の実コードを精読し、設計書（detailed_design.md v0.14 / basic_design.md v0.9）との差分を洗い出した結果。
> 実装中の「設計と違う」発見による rework を防ぐ目的。

## 対象NWアプリ
- ローカル: `D:\Claude\PMpro\NW-learning_app-pro\`
- バージョン: v1.3（README参照）

## 精読対象ファイル（11本）

### lib層（5本）
- [x] `src/lib/storage.ts` — 238行、API契約・キー定数
- [x] `src/lib/gamification.ts` — 399行、XP計算・バッジ判定
- [x] `src/lib/tracker.ts` — 104行、PracticeRecord・getMaxScore
- [x] `src/lib/activityLog.ts` — 225行、イベント種別構造
- [x] `src/lib/sync/adapters.ts` — 416行、マージ戦略・KEYS

### UI層（6本）— 次セッションで実施
- [ ] `src/components/Layout.tsx` — サイドバー・isMobile判定
- [ ] `src/pages/Quiz.tsx` — モード判定・出題シャッフル
- [ ] `src/pages/AfternoonProblems.tsx` — buildRows・filterRows
- [ ] `src/pages/AfternoonMyAnswer.tsx` — useTimer・myAnswer key
- [ ] `src/pages/NoteDetail.tsx` — NOTE_DB構造・RedWord
- [ ] `src/data/badges.ts` — バッジ定義構造

## 設計書との差分（lib層）

### 🔴 D-LIB-01: gamification.ts の主要関数名がNWと不一致 — ✅ 方針確定
- **設計書 §3.7（line 2304-2305）**: `applyAnswer(event)` / `applyAfternoonRecord(score, problemId)`
- **NW実装 (`src/lib/gamification.ts` line 263, 341)**:
  - `recordGamificationAnswer(event: AnswerEvent): AnswerGamificationResult`
  - `recordAfternoonXp(section: 'G1' | 'G2', score: number): AfternoonGamificationResult`
- **影響**: 呼び出し側コード全箇所（Quiz, AfternoonMyAnswer 等）でAPI名が異なる
- **ユーザ判断（2026-05-13）**: 案B採用 — **設計書通り、PMで `applyAnswer` / `applyAfternoonRecord` / `applyEssayComplete` にリネームして実装**
- **実装時アクション**: NWロジックを流用しつつ、関数名と呼び出し側参照を新名に書き換え

### 🔴 D-LIB-02: `applyAfternoonRecord` のシグネチャ仕様 — ✅ 方針確定
- **設計書 §3.7 line 2305**: `applyAfternoonRecord(score: number, problemId: string): AfternoonGamificationResult`
- **NW実装 line 341**: `recordAfternoonXp(section: 'G1' | 'G2', score: number)`
- **PM実装での扱い**:
  - PMでは section が `'PM1'` のみなので XP テーブル1つで済む
  - `problemId` 引数はバッジ判定（`afternoonProblems` 参照）で必要
- **ユーザ判断（2026-05-13）**: **NW G2式（100点満点）をそのまま流用**
  ```ts
  function calcPm1Xp(score: number): number {
    if (score < 40)      return score * 3
    if (score < 60)      return score * 4
    if (score < 80)      return score * 8
    return Math.min(score * 15, 1500)
  }
  ```
- **設計書修正**: detailed_design.md §3.7 に PM1 XPテーブルを明記（次セッションで反映）

### 🟡 D-LIB-03: storage.ts の `clearLegacyProgress` IIFE が PM では不要
- **NW実装 (`src/lib/storage.ts` line 41-50)**: 旧スキーマ `nwsp:user_progress` を自動削除する IIFE
- **設計書 §3.2 line 1777**: `USER_PROGRESS_LEGACY: 'pmap:user_progress'` を KEYS に含めている
- **問題**: PM は新規アプリで「旧スキーマ」が存在しないため、`clearLegacyProgress()` 関数も `USER_PROGRESS_LEGACY` キーも不要
- **推奨**: 設計書から削除する、または「将来のスキーマ変更時に使う雛形として残す」と注記
- **影響度**: 低（実害なし、ただし無駄コード）

### 🟡 D-LIB-04: 副作用の記述漏れ
- **設計書 §3.2 `setNoteUnderstanding` の説明**: 副作用について明記なし
- **NW実装 (`src/lib/storage.ts` line 236)**: `touchNoteUnderstandingSyncMeta(categoryId, sectionIndex)` を内部で呼ぶ（同期メタ更新の副作用）
- **設計書 §3.6 `setPlan` / `removePlan` の説明**: 副作用について明記なし
- **NW実装 (`src/lib/tracker.ts` line 91, 98)**: `touchAfternoonPlanSyncMeta(problemId)` を内部で呼ぶ
- **推奨**: 設計書に「副作用: sync metaを更新」と1行追記。実装漏れ防止のため
- **影響度**: 中（実装時にこの副作用を見落とすと同期が壊れる）

### 🟡 D-LIB-05: sync/adapters.ts の `TRACKER_PLANS` 同期キー追加可否
- **設計書 §3.9 line 2528**: `TRACKER_PLANS: 'pmap:tracker:plans'` を KEYS に含めている
- **NW実装 (`src/lib/sync/adapters.ts` line 12-25)**: `TRACKER_PLANS` キーは含まれていない（`PLAN_META` のみ）
- **問題**: NWでは tracker:plans 本体は同期せず、PLAN_META（タイムスタンプ）のみで管理しているように見える
- **判断要**: 
  - 案A: NW踏襲（plans本体は同期せず、PLAN_META + 個別 plan は別経路）→ 設計書修正
  - 案B: PM では plans 本体も同期対象に追加する → 実装時にマージロジック追加
- **影響度**: 中（同期挙動が変わる）

### 🟢 D-LIB-06: gamification.ts の `applyNoteCheck` は PM 新規追加 — 既知差分
- 設計書 §3.7 line 2336 で明記されており、NW実装に存在しない（NWは addActivityEvent 内でXP加算）
- 「XP発生源単一化」原則のためPMで追加する設計
- **要対応**: 実装時に新規追加（差分ではなく既知の追加要件）

### 🟢 D-LIB-07: `AnswerEvent.mode` への `'morning'` 追加 — 既知差分
- 設計書 §3.7 line 2291 で明記、NW実装 (line 35) は `'multiple-choice' | 'written'` のみ
- **要対応**: 公式午前II対応のため PM で拡張（既知の追加要件）

### 🟢 D-LIB-08: `pmap:bookmarks` 運用整理 — 既知差分
- 設計書 §3.2 で「PMでは未使用、APIは残置」と明記済み
- **要対応**: PM UIからは `getBookmarks` / `toggleQuestionBookmark` を呼ばないことだけ徹底（コードは残す）

## 実装時の注意（lib層）

1. **XP発生源の単一化原則の徹底**: `gamification.ts` の `apply*` 関数のみが XP を加算する。`activityLog.addActivityEvent` 内では XP を加算しない。NWでは混在していた箇所があるので注意（設計書 §3.7 line 2402-2417 参照）

2. **`adapters.ts` の `rebuildProgress` / `rebuildGamification`**: マージ時に AnswerRecord から派生情報を再構築する。直接 GamificationState や UserProgress をマージするのではなく、AnswerRecord を真値として再計算する設計。PM実装でもこの方針を踏襲

3. **`MAX_EVENTS = 500` プルーニング** (`activityLog.ts` line 60, 83): ActivityEvent は最大500件で先頭から切り捨て。R4 LocalStorage 5MB制約のための工夫

4. **`adapters.ts` の依存ファイル**: `events.ts` (`getTotalXpFromSyncEvents`)、`device.ts` (`loadSyncMeta`) を import している。これらは 🔵 完全流用扱いだが、念のため次セッションで一読推奨

5. **`storage.ts` の `withDerived` パターン**: `StoredProgress`（永続化用）と `UserProgress`（派生フィールド含む）を区別。`totalAttempts` / `correctCount` は派生（保存しない）

6. **`question_mastery` の状態遷移** (`storage.ts` line 197-207):
   - 未→correct/incorrect
   - correct→correct時 consecutive 昇格
   - consecutive→correct で consecutive 維持
   - いずれも incorrect で incorrect にリセット
   - これは設計書 §3.2 に詳細記述なし → 設計書追記推奨

7. **`gamification.ts` の `countMasteredCategories`** (line 125-154): カテゴリ達成率は **どちらかのモード（multiple-choice / written）が consecutive** ならカウント。両方ではなくOR条件

## 設計書修正要否

| ID | 修正対象 | 必要度 | 内容 |
|---|---|---|---|
| D-LIB-02 | detailed_design.md §3.7 | 高 | PM1のXPテーブル定義を追記 |
| D-LIB-04 | detailed_design.md §3.2, §3.6 | 中 | 副作用（sync meta更新）を明記 |
| D-LIB-05 | detailed_design.md §3.9 | 中 | `TRACKER_PLANS` 同期方針の決定・記述 |
| D-LIB-03 | detailed_design.md §3.2 | 低 | `USER_PROGRESS_LEGACY` の意図を明記 or 削除 |
| 追加 | detailed_design.md §3.2 | 低 | question_mastery 状態遷移を表で明記 |

## 完了判定

- [x] lib層5ファイル精読完了
- [ ] UI層6ファイル精読完了（次セッション）
- [x] 差分洗い出し（lib層8件、うち要修正級2件、その他軽微）
- [ ] ユーザレビュー・承認

## 進捗ログ
- 2026-05-13: セッション開始、リポジトリ初期化、雛形作成、lib層5ファイル精読・突合完了
- 2026-05-13: ユーザ判断 — D-LIB-01「PMでリネーム実装」、D-LIB-02「NW G2式流用」確定
- 次セッション予定: UI層6ファイル精読 → 差分集計 → 設計書修正（D-LIB-02〜05反映） → ユーザ承認
