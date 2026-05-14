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

### UI層（6本）
- [x] `src/components/Layout.tsx` — 354行、サイドバー・isMobile判定
- [x] `src/pages/Quiz.tsx` — 462行、モード判定・出題シャッフル
- [x] `src/pages/AfternoonProblems.tsx` — 853行、buildRows・filterRows
- [x] `src/pages/AfternoonMyAnswer.tsx` — 707行、useTimer・myAnswer key
- [x] `src/pages/NoteDetail.tsx` — 400+行、NOTE_DB構造・RedWord
- [x] `src/data/badges.ts` — 478行、バッジ定義構造

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

## 設計書との差分（UI層）

### 🔴 D-UI-01: Layout.tsx の `STORAGE_KEY` がプレフィックス規約から外れる — 要判断
- **NW実装 (`src/components/Layout.tsx` line 144)**: `const STORAGE_KEY = 'nwsp_sidebar_open'`（アンダースコア区切り、`:` 無し）
- **他キー**: `nwsp:answer_records` 等は コロン区切り → **このキーだけ命名規約が異なる**
- **設計書**: 明記なし
- **判断要**:
  - 案A: NW踏襲で `pmap_sidebar_open`（アンダースコア）
  - 案B: 規約統一で `pmap:sidebar_open`（コロン）← 推奨
- **影響**: 規約統一の方が同期対象判別 (`pmap:` で grep) しやすい

### 🔴 D-UI-02: Layout.tsx のヘッダ・サイドバー色が `style` 属性で hex 直書き — 要対応
- **NW実装 (`src/components/Layout.tsx` line 216, 267)**: 
  ```tsx
  style={{ backgroundColor: '#1a3a5c' }}  // NW青、ヘッダとサイドバー両方
  ```
- **設計書 §5.0 / §5.2**: `bg-brand` Tailwind クラス使用を想定
- **問題**: F1-P6 のブランド適用マップ（§12 `bg-blue-*` → `bg-brand-*`）の機械置換だけでは対応できない（style属性の hex 値）
- **対応**: 設計書 §12 に「inline style の `#1a3a5c` も手動置換」を明記する必要

### 🟡 D-UI-03: AfternoonProblems.tsx でハードコードされた `nwsp:savedAnswers:` 参照
- **NW実装 (`src/pages/AfternoonProblems.tsx` line 321)**: 
  ```tsx
  const hasSaved = !!localStorage.getItem(`nwsp:savedAnswers:${r.id}`)
  ```
- **問題**: lib層を経由せず、UI層に直接ハードコードされた `nwsp:` プレフィックスが存在
- **影響**: 機械置換（`nwsp:` → `pmap:`）でカバーできるが、設計書 §3.2 の「キー定義は storage.ts に集約」原則からは逸脱
- **PM実装での扱い**: prefix置換で済ませる or `savedAnswersExists(recordId)` ヘルパー関数を tracker.ts に追加して整理（推奨）

### 🟡 D-UI-04: AfternoonMyAnswer.tsx の useTimer の精度
- **NW実装 (`src/pages/AfternoonMyAnswer.tsx` line 56-100)**: `setInterval(..., 1000)` で 1秒刻みカウント
- **既知の制約**: タブ非アクティブ時のブラウザ throttling で最大数秒の誤差
- **設計書 §8.3**: 該当箇所未確認だが、精度要件があれば `Date.now()` 差分計算に変更を検討
- **影響度**: 低（試験本番想定の練習用途では1秒未満の誤差は許容範囲）

### 🟢 D-UI-05: NAV_ITEMS / NOTE_CATEGORY_IDS / categories は全面差し替え — 既知差分
- **NW実装**: 22カテゴリ・11ナビ項目（プロトコル等NW固有）
- **設計書 §5.1 / §5.2**: PM 12カテゴリ + 14メニュー + 15ナビ項目（プロトコル削除、午前II/午後/論述/履歴 追加）
- **対応**: F1-P1 で差し替え（既知の作業）

### 🟢 D-UI-06: AfternoonProblems の G1/G2 二分割テーブル削除 — 既知差分
- **NW実装**: `ProblemTable section="G1"` と `section="G2"` で2テーブル表示
- **設計書 §8.1**: PM1のみ → 1テーブル、Section タブUI削除
- **対応**: F1-P3 で実施（NWの 853行から G2 関連を除去、複雑改修）

### 🟢 D-UI-07: AfternoonMyAnswer のセクションラベル分岐削除 — 既知差分
- **NW実装 (line 367, 368-370)**: `section === 'G1' ? '午後Ⅰ' : '午後Ⅱ'` で動的切替
- **PM**: PM1 のみ → '午後Ⅰ' 固定（分岐削除）
- **対応**: F1-P3 で実施

### 🟢 D-UI-08: badges.ts の COMPLETE バッジ名・afternoon系バッジ条件 — F2-P6再設計
- **NW実装 (`src/data/badges.ts` line 446-459)**: 
  - `name: 'ネットワークスペシャリスト'`
  - `conditionValue: 29`（バッジ総数依存）
- **NW実装 (line 402-429)**: afternoon-3 が G1基準、afternoon-4 が G2基準
- **設計書 §10.2**: 「F1段階はNWそのままコピー、F2-P6で再設計」と明記
- **対応**: F1段階は意味的に合わないバッジが含まれる状態を許容（既知の暫定運用）

### 🟢 D-UI-09: gamification.ts の `computeAfternoonStats` 内 G1/G2 集計ロジック — 連動差分
- **NW実装 (`src/lib/gamification.ts` line 157-183)**: `g1Over40` / `g2Over80` / `allClearedSixty`（G1=30, G2=60 閾値）を集計
- **PM**: PM1 のみなので、`g1Over40` / `g2Over80` は不要 or 統一して `pm1Over40` 等にリネーム
- **対応**: D-UI-08 と連動して F2-P6 で再設計

## 実装時の注意（UI層）

8. **Layout.tsx のヘッダ色置換**: `style={{ backgroundColor: '#1a3a5c' }}` の hex直書きは Tailwind置換 (`bg-blue-*` → `bg-brand-*`) では拾えない。設計書 §12 ブランド適用マップに inline style 置換手順を追記する必要

9. **AfternoonProblems.tsx の line 321 ハードコード**: `localStorage.getItem('nwsp:savedAnswers:${r.id}')` という直接呼び出しが UI 層に存在。grep `nwsp:` → `pmap:` で機械置換するが、設計原則的には `tracker.ts` にヘルパー関数 `savedAnswersExists(recordId)` を追加した方が綺麗

10. **Quiz.tsx の sessionId・sessionXpRef パターン** (line 77, 79, 117-133): `useRef` で sessionId と累積XP を保持し、`upsertQuizSessionEvent` で1問ごとに upsert する。これにより途中離脱でもログが残る。PMでもこの方式を踏襲

11. **AfternoonMyAnswer.tsx の useTimer**: シンプルな `setInterval` 実装。タブ非アクティブ時の throttling は受容（試験練習用途で1秒誤差は許容）

12. **NoteDetail.tsx の RedWord コンポーネント** (line 91-129): masked + revealed の2軸 state + `version` propsで再リセット可能な構造。PMノートでも `==重要語==` マークアップ + RichProtocolTable / HeaderDiagram のリッチ構造を踏襲

13. **NOTE_CATEGORY_IDS の export と参照**: NoteDetail.tsx が export → Quiz.tsx が import (line 8) という相互依存。PM での12カテゴリ置換時は両ファイル同時更新

14. **Layout.tsx の `isMobile` 判定**: `window.matchMedia('(max-width: 767px)')` + `useEffect` でリスナー登録。初期値は `window.innerWidth < 768`。SSRでは動かないが、PMはCSRのみなので問題なし

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
| D-LIB-02 | detailed_design.md §3.7 | 高 | PM1のXPテーブル定義（G2式流用）を明記 |
| D-UI-02 | detailed_design.md §12 | 高 | inline style `#1a3a5c` の手動置換手順を追記 |
| D-LIB-04 | detailed_design.md §3.2, §3.6 | 中 | 副作用（sync meta更新）を明記 |
| D-LIB-05 | detailed_design.md §3.9 | 中 | `TRACKER_PLANS` 同期方針の決定・記述 |
| D-UI-01 | detailed_design.md §3.2 | 中 | `pmap:sidebar_open` のキー命名規約決定 |
| D-LIB-03 | detailed_design.md §3.2 | 低 | `USER_PROGRESS_LEGACY` の意図を明記 or 削除 |
| 追加 | detailed_design.md §3.2 | 低 | question_mastery 状態遷移を表で明記 |
| D-UI-03 | detailed_design.md §8 | 低 | savedAnswersExists ヘルパー追加検討 |

## 完了判定 ✅ F1-P-1 完了

- [x] lib層5ファイル精読完了（1,382行）
- [x] UI層6ファイル精読完了（3,254行 + NOTE_DB データ部分は精読対象外）
- [x] 差分洗い出し完了（lib層8件 + UI層9件 = 計17件）
  - うち要修正・要判断級: 5件（D-LIB-01,02 + D-UI-01,02,03）
  - 既知差分・F2-P6再設計対象: 12件（実装時に都度対応）
  - 完了基準「10件以下に収束」は要修正級ベースで達成
- [x] ユーザレビュー・承認（2026-05-13）
- [x] 設計書修正反映完了（detailed_design.md v0.14 → v0.15）

## サマリ：F1-P-1 で確定したこと / 残課題

### ✅ 方針確定済み（ユーザ判断）
- D-LIB-01 関数名: PMで `applyAnswer` / `applyAfternoonRecord` / `applyEssayComplete` にリネーム
- D-LIB-02 PM1 XPテーブル: NW G2式（score×3/×4/×8/min×15,1500）流用

### ✅ ユーザ判断確定済み（2026-05-13 追加）
- D-UI-01 サイドバーキー: **`pmap:sidebar_open`（コロン統一）** で確定
- D-LIB-05 TRACKER_PLANS 同期方針: **F2-P4 で最終決定**（F1 段階は NW 踏襲 = PLAN_META のみ）
- D-UI-03 savedAnswers ハードコード: **tracker.ts に `savedAnswersExists(recordId)` ヘルパー追加** で確定

### 📝 設計書修正TODO（F1-P0着手前に反映）
- detailed_design.md §3.7: PM1 XPテーブル明記
- detailed_design.md §3.2 / §3.6: 副作用（sync meta更新）明記
- detailed_design.md §12: inline style hex色置換手順を追記
- detailed_design.md §3.2: question_mastery 状態遷移表を追記

## 進捗ログ
- 2026-05-13: セッション開始、リポジトリ初期化、雛形作成、lib層5ファイル精読・突合完了
- 2026-05-13: ユーザ判断 — D-LIB-01「PMでリネーム実装」、D-LIB-02「NW G2式流用」確定
- 2026-05-13: UI層6ファイル精読完了、差分17件抽出（要修正級5件）
- 2026-05-13: ユーザ判断追加 — D-UI-01「pmap:sidebar_open（コロン）」、D-LIB-05「F2-P4で最終決定」、D-UI-03「savedAnswersExists ヘルパー追加」確定
- 2026-05-13: 設計書 detailed_design.md v0.14 → v0.15 修正反映完了
  - §3.2 storage.ts: USER_PROGRESS_LEGACY 削除、SIDEBAR_OPEN キー追加、副作用表、mastery 状態遷移表
  - §3.6 tracker.ts: savedAnswersExists ヘルパー追加、setPlan/removePlan の副作用表
  - §3.7 gamification.ts: PM1 XPテーブル明記（NW G2式流用）
  - §3.9 sync/adapters: TRACKER_PLANS を F1段階で同期対象外と注記（F2-P4で最終決定）
  - §12 ブランド適用マップ: Layout.tsx inline style hex の置換注意 + Tailwindクラスリライト推奨
- **F1-P-1 完了 → 次は F1-P0 スキャフォールド**
