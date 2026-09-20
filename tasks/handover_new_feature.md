# PM Learning App 新機能実装 引継ぎプロンプト

> 用途: 別セッションの冒頭にこのファイルの内容をまるごと貼り付ける。
> 更新: 2026-09-20 時点（HEAD `7a96d1a`）。構成が変わったら追記すること。

---

PM Learning App に新機能を実装します。以下が引継ぎ情報です。

## 0. 今回実装したい機能（★ここを埋めてから貼り付ける）

```
機能名:
解決したい課題（誰の、どんな困りごとか）:
やること:
やらないこと（スコープ外）:
既存のどの画面・データと関係するか:
完了の判定条件:
```

上が空欄のまま渡された場合は、**実装に着手する前に質問して埋めてください**。
埋まっている場合でも、既存機能と重複していないか（§3 の画面一覧）を先に確認してから設計に入ること。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| 名称 | PM Learning App（プロジェクトマネージャ試験対策学習アプリ） |
| ローカル | `D:\Claude\PMpro\PM-learning_app-pro` |
| GitHub | https://github.com/hmamiya52-bit/PM-learning_app-pro （ブランチ `main`） |
| デプロイ | Vercel https://mamiya-pmapp.vercel.app/ |
| バージョン | `src/version.ts` の `APP_VERSION`（現在 1.0.2・正式版） |
| 対象ユーザ | 実務経験の浅いインフラエンジニア1名（PM試験受験者） |
| 学習の主目的 | **午後Ⅰの得点**が最優先、午後Ⅱが次点。午前Ⅱはほぼ解ける状態 |

機能の採否・設計判断は常に「**合格に最短で必要十分か**」で決める。

## 2. 技術スタックと環境

- React 19 + TypeScript 5.9 + Vite 8 + Tailwind v3 + PWA（`vite-plugin-pwa`）
- ルーティング: `react-router-dom` v7（`BrowserRouter`）
- アイコン: `lucide-react`（ただし `Layout.tsx` は自前の inline SVG も使用）
- その他: `lz-string`（同期パッケージ圧縮）、`qrcode` / `@zxing/*`（デバイス同期のQR）
- 永続化: **LocalStorage のみ**。バックエンド・DB・API サーバは無い
- OS: Windows 10 / Git Bash と PowerShell 併用。**ファイルは CRLF**

### 実行コマンド

```bash
npm run dev            # 開発サーバ（:5173）
npm run validate-data  # 静的データ整合性チェック（scripts/validate-static-data.ts）
npm run build          # tsc -b && vite build
npm run lint           # eslint（src は 0 error を維持）
npm run gen:meta       # questionMeta 再生成（問題データを増減したときのみ）
```

Browser pane で確認する場合は `.claude/launch.json` の `vite-dev`（port 5173）を使う。
**`npm run dev` を Bash で直接起動しないこと。**

## 3. 画面構成（`src/App.tsx`）

`/login` 以外はすべて `<AuthGuard><Layout /></AuthGuard>` の配下。
Login / Home / NotFound 以外は `React.lazy` で遅延読み込み（Suspense 境界は `Layout` 側）。

| 領域 | ルート |
|---|---|
| ホーム | `/` |
| ノートモード | `/notes`, `/notes/afternoon-tips`, `/notes/:categoryId` |
| ランダム出題 | `/quiz` |
| 午前Ⅱ | `/morning`, `/morning/session`, `/morning/summary` |
| 午後Ⅰ | `/afternoon`, `/afternoon/answers/:id`（`/myAnswer`, `/explanation`） |
| 午後Ⅱ（論述） | `/essay`, `/essay/guide`, `/essay/:id`（`/outline`, `/sample`, `/attempts/:attemptId`） |
| 応用情報リフレッシュ | `/applied-refresh` |
| ITサービスマネージャ | `/it-service-manager/*`（16ルート・別試験区分のサブアプリ） |
| 共通 | `/search`, `/badges`, `/history`, `/sync`, `/settings`, `/settings/important`, `/how-to-use` |

### 新しい画面を足すときの手順

1. `src/pages/Xxx.tsx` を作る
2. `src/App.tsx` に `const Xxx = lazy(() => import('./pages/Xxx'))` と `<Route path="/xxx" element={<Xxx />} />` を追加（`:param` ルートより静的セグメントを先に置く）
3. サイドバーに出すなら `src/components/Layout.tsx` の `NAV_ITEMS`（169行目付近）に `{ label, to, icon }` を追加
4. ホームからの導線が要るなら `src/pages/Home.tsx` にもカードを追加

## 4. データ層（`src/data/`）

すべて**静的 TS ファイル**。ビルド時にバンドルされる。

| ファイル | 中身 |
|---|---|
| `categories.ts` | 12カテゴリの定義（id・名称・サブタイトル） |
| `noteDb.ts` | ノート本文 `NOTE_DB: Record<string, NoteData>`（約5,000行） |
| `noteSectionMigration.ts` | ノートのセクション統合に伴う理解度記録の移行表 |
| `questions.ts` / `questions/` | 自作クイズ 600問 |
| `officialMorningQuestions.ts` | IPA公式 午前Ⅱ 300問（12年度×25問） |
| `afternoonProblems.ts` / `officialAnswers.ts` / `scoringMap.ts` | 午後Ⅰ 37問（3ファイル協調・id と行数が一致している必要あり） |
| `afternoonExplanations.ts` / `afternoonQuestionTexts/` | 午後Ⅰ詳細解説・公式設問文（年度別） |
| `essayProblems.ts` / `essaySampleAnswers.ts` | 午後Ⅱ |
| `questionMeta.ts` | 自動生成。`npm run gen:meta` で再生成 |
| `badges.ts` / `levels.ts` | ゲーミフィケーション定義 |
| `sm/content.ts` | ITサービスマネージャ用データ |

`npm run validate-data` が id 一致・行数一致・マークアップ整合などを自動検査する。
**データを触ったら必ず実行すること。**

## 5. 永続化と同期（新機能で状態を持つなら必読）

### LocalStorage キー

すべて `pmap:` プレフィックス。既存キー（抜粋）:

```
pmap:auth                  認証セッション
pmap:answer_records        解答履歴        pmap:user_progress_v2   進捗
pmap:question_mastery      問題ごとの習熟   pmap:important_questions 重要マーク
pmap:morning:records       午前Ⅱ履歴       pmap:essay:attempts     論述履歴
pmap:note_understanding    ノート理解度（キーは `{categoryId}:{sectionIndex}`）
pmap:note_section_schema   ノート移行スキーマ版
pmap:gamification          XP・バッジ      pmap:tracker:records    演習記録
pmap:sync:meta / events / checkpoint / note_meta / plan_meta
pmap:sm:*                  ITサービスマネージャ系
```

読み書きは `src/lib/storage.ts` の `load<T>()` / `save<T>()` の型（try/catch でフォールバック）に合わせる。
**`localStorage` への直接アクセスは必ず try/catch で囲むこと**（プライベートウィンドウ等で例外になる）。

### デバイス間同期（`src/lib/sync/`）

QRコード経由の端末間同期がある。新機能の状態を**同期対象にするかどうかは必ず決めること**。

- `types.ts` の `LocalSyncState` に永続フィールドを定義
- `adapters.ts` の `readLocalSyncState()` / `mergeLocalSyncState()` に読み書きとマージ規則を追加
- `SYNC_SCHEMA_VERSION`（現在 2）を上げる必要があるか検討する
- 同期しない場合も、その判断を実装コメントに残す

同期対象にしないなら端末ローカル限定で構わない（例: 表示設定・下書き）。

### ゲーミフィケーション / 学習履歴

- XP・バッジ: `src/lib/gamification.ts` の `applyAnswer()` / `applyAfternoonRecord()` / `applyEssayComplete()`
- 学習履歴グラフ: `src/lib/activityLog.ts` の `addActivityEvent()`。`ActivityEvent` のユニオン型に新種別を足す形

新機能が「学習行為」ならこの2つに接続するか判断する。不要なら接続しない（無闇に XP を増やさない）。

## 6. 表示系の共通部品

| 部品 | 用途 |
|---|---|
| `components/QuestionFigureView.tsx` | SVG / table の図表表示。**viewBox 幅を超えて拡大しない**（等倍が上限）。図内 font-size がそのまま CSS px になる |
| `components/MarkupText.tsx` / `NoteMarkup.tsx` / `NoteWords.tsx` | `==赤字==` / `__ネイビー__` のレンダリング |
| `components/MathText.tsx` | 数式（`frac{}{}` / `^{}` / `_{}`）＋強調マークアップ |
| `components/Layout.tsx` | サイドバー・ヘッダー。`/quiz` `/morning/session` `/morning/summary` はサイドバーを既定で最小化 |
| `components/ScratchMemo.tsx` | 下書きメモ |

### ノート本文のマークアップ規約（`docs/note_markup_rules.md`）

- `==X==` → 赤字太字（暗記対象。「赤字を隠す」でマスクされる）
- `__X__` → ネイビー太字（構造ラベル。マスクされない）
- **禁止**: `===` / `___` / 全角 `＝` / 一方を他方の内側に入れ子 / 半角スペース字下げ / 全角スペース3段以上
- 開閉ミスマッチ（`==X__`）が過去に多発している。データを触ったら必ず検査すること

図のルールは `docs/note_figure_rules.md`。**新規の図は `viewBox "0 0 400 H"` の縦積みレイアウト**で作る（モバイル優先）。

## 7. 運用ルール（厳守）

- コミット prefix: `[C]` Claude単独 / `[X]` Codex単独 / `[Review]` レビュー後修正 / `[Doc]` ドキュメント / `[Fix]` バグ修正
- **`git add` は明示パス指定**（`-A` や `.` を使わない）
- **変更したら確認を待たずに commit & push する**（ユーザはデプロイ版で動作確認するため）
- セッション開始時に `git pull origin main`
- 秘密情報・API キーはハードコードしない
- コミットメッセージ末尾に `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

### 実装完了の判定（この順で全部通すこと）

1. `npx tsc --noEmit -p tsconfig.app.json` → エラー 0
2. `npm run validate-data` → `[OK] 全データの整合性確認完了`
3. `npm run lint` → src 配下 error 0（warning は既存13件のみ）
4. `npm run build` → 成功
5. **Browser pane で実機確認**（375px のモバイル幅と通常幅の両方）。コンソールエラー 0
6. 一時スクリプトを削除してから commit

## 8. 既知の落とし穴

- **CRLF**: `noteDb.ts` などは CRLF。スクリプトで一括置換するときは `\r\n` → `\n` に正規化してから処理し、書き戻し時に復元する
- **`/dev/stdin` が使えない**: Windows では `node script.js /dev/stdin` が ENOENT になる。一時 JSON ファイル経由にする
- **一時スクリプトは `scripts/_*.ts`** に置き、**commit 前に必ず削除**する（`npm run lint` が拾ってエラーになる）
- **SVG の id 衝突**: 同一ページに複数の図が並ぶと `<marker id>` `<linearGradient id>` が衝突する。カテゴリ内で一意にする
- **理解度記録のインデックス**: `pmap:note_understanding` のキーが `{categoryId}:{sectionIndex}` なので、**ノートのセクションを増減・並べ替えすると既存の学習記録が壊れる**。やむを得ず変える場合は `noteSectionMigration.ts` に移行表を追加し、`main.tsx` の `migrateNoteUnderstanding()` で移行させる
- **論述の自動採点は非対応**（スコープ外。`memory/` 参照）

## 9. 参照ドキュメント

| ファイル | 内容 |
|---|---|
| `requirements.md` / `basic_design.md` / `detailed_design.md` | 要件・基本設計・詳細設計 |
| `docs/note_markup_rules.md` | ノート本文マークアップ規約 v1.0 |
| `docs/note_figure_rules.md` | SVG / table 図表ルール v1.0 |
| `docs/morning_question_authoring_rules.md` | 午前Ⅱ 作成ルール v1.0 |
| `docs/afternoon_explanation_authoring_rules.md` | 午後Ⅰ 解説作成ルール |
| `memory/risks.md` | リスクレジスタ（IPA著作権など8件） |
| `tasks/handover_2026-05-25.md` | 旧引継ぎ（F2フェーズ当時。経緯の参照用） |
| `tasks/note_content_revision_diagnosis.md` | ノート全面改訂の診断と実施記録 |

## 10. 直近の作業（2026-07〜09）

- ノート12カテゴリの**全面改訂**（361節 → 190節に統合。断片的なセクションを論点単位にまとめ、図をモバイル優先で作り直した）
- ノートの**出題実績レビュー**（引用していた年度・問番号を午前Ⅱデータ300問と突き合わせ、誤引用3件と「頻出」の誤った主張を訂正）
- 午後Ⅰに**公式設問文（IPA原文）**を導入（全12年度・296行）
- 図の文字が本文より大きくなる不具合を修正（`QuestionFigureView` の拡大上限を等倍に）

---

引継ぎは以上です。§0 の機能仕様を確認し、不明点があれば着手前に質問してください。
