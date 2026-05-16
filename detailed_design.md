# 詳細設計書: プロジェクトマネージャ試験 学習アプリ

> バージョン: 0.19（マークアップ規約のリポジトリ内集約：docs/note_markup_rules.md v1.0 を正本化、品質ゲート §2.7e.3 にマークアップ整合性チェックを必須項目化）
> 作成日: 2026-05-06（v0.14） / 2026-05-13（v0.15） / 2026-05-16（v0.16） / 2026-05-17（v0.17・v0.18・v0.19）
> 関連: [requirements.md v0.5](./requirements.md) / [basic_design.md v0.9](./basic_design.md)
> ベースアプリ: NW-learning_app-pro v1.3
> ステータス: D1〜D6 全章完成 + F1-P-1 反映済み

---

## 0. 本書について

### 0.1 位置づけ
要件定義書（v0.4）・基本設計書（v0.4）を受け、**実装担当者がコードを書く際に判断に詰まらない粒度**まで仕様を確定する。
ユーザ視点の操作・フロントエンド挙動・実装手順・技術スタックの組み合わせ方を一体で記述する。

### 0.2 対象読者
- 個人開発者（ユーザ本人）
- 実装支援AI（Claude等）

### 0.3 関連ドキュメント
| 文書 | 役割 | 参照優先度 |
|---|---|---|
| `requirements.md` v0.4 | スコープ・機能要件・確定事項 | 高（仕様の根拠） |
| `basic_design.md` v0.4 | 全体構成・データ設計・共通モジュールAPI契約 | 高（実装の骨格） |
| `color_samples.html` | ブランドカラー視覚プレビュー | 中（実装時の照合用） |
| **`detailed_design.md`（本書）** | 画面詳細・実装手順・QA | — |

### 0.4 章構成（段階提出 D1〜D6）

| Iter | 章 | 内容 | ステータス |
|---|---|---|---|
| D1 | 1〜2 | 本書について・フェーズ構成・実装フェーズ詳細化 | ✅ 完了（v0.3） |
| D2 | 3〜4 | 共通ライブラリ詳細（API契約・疑似コード）・ルーティング・グローバル状態 | ✅ 完了（v0.5） |
| D3 | 5 | ホーム・サイドバー・Layout・ノート系・検索（L2ワイヤフレーム込み） | ✅ 完了（v0.7） |
| D4 | 6〜7 | クイズ・公式午前IIモード詳細 | ✅ 完了（v0.9） |
| D5 | 8〜9 | 午後I・論述トレーニング詳細 | ✅ 完了（v0.11） |
| **D6** | 10〜14 | 履歴・バッジ・設定 / PWA・同期 / ブランド適用マップ / QAチェックリスト / デプロイ手順 | **本Iter** |

各Iter完了後にユーザレビュー → 修正 or 承認 → 次のIterへ進む。

### 0.5 凡例

#### 流用区分
- 🔵 完全流用（NWからコード変更なし）
- 🟡 部分改変
- 🟢 新規作成
- 🔴 削除

#### 完了条件
チェックボックス形式で記述。実装完了時に目視で消し込む。
- [ ] 期待される動作

#### 意思決定ポイント
`DP-<フェーズ>-<連番>` 形式でラベル付け。後で参照可能にする。

#### 推定所要時間
個人開発・フルタイム想定の概算。コンテンツ作成は除く工数を表記。

---

## 1. フェーズ構成

### 1.1 全体俯瞰

本プロジェクトは **3フェーズ構成**（v0.14でフェーズ1.5パイロット追加）:

```
┌─────────────────────────────────────────────┐
│ フェーズ1: 骨組み実装                        │
│  ・NW実装精読（F1-P-1）                     │
│  ・NWアプリの構造を流用しPMアプリの土台を構築 │
│  ・コンテンツは最小サンプルのみ              │
│  ・骨組み完成 → mamiya-pmapp.vercel.app 公開 │
│  ・バージョン: v0.1.x（Beta表記）           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ フェーズ1.5: パイロット運用 ★v0.14追加      │
│  ・1カテゴリ（ステークホルダー）だけ完成形を投入 │
│  ・ユーザが1〜2週間試用                      │
│  ・設計欠陥・コンテンツ品質を検証             │
│  ・フィードバックを反映                      │
│  ・バージョン: v0.5.x                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ フェーズ2: 残コンテンツ投入＋正式版          │
│  ・残り11カテゴリのノート＋クイズ            │
│  ・公式午前II 問題＋独自解説（全年度）        │
│  ・午後I 公式解答テキスト化＋配点マップ       │
│  ・午後II 論述問題インデックス               │
│  ・バッジ最終調整・QA・本番リリース          │
│  ・バージョン: v1.0.0（全コンテンツ完了で正式版） │
└─────────────────────────────────────────────┘
```

### 1.2 フェーズ別タスク一覧（再採番）

requirements.md / basic_design.md の P0〜P9 を、フェーズ単位で**再採番**して以下を確定。

#### フェーズ1（実装中心）— v0.14 工数細分化

担当ラベル: 🅒 = Claude単独 / 🅧 = Codex単独 / 🅒🅧 = 協業（§1.4参照）

| ID | タスク名 | 担当 | 工数（h: Claude時間 + 経過日数） | Go/No-Go判定基準 |
|---|---|---|---|---|
| **F1-P-1** | NW実装精読セッション ★v0.14新設 | 🅒 | C: 4h / 経過: 0.5d | NW実装の差分洗い出し完了、設計書修正のissue化 |
| **F1-P0** | スキャフォールド | 🅒🅧 | C: 6h + X: 4h / 経過: 1.5d | `npm run dev` 起動 + 全画面遷移可 + LocalStorage `pmap:` prefix |
| **F1-P1** | カテゴリ定義・サイドバー | 🅒🅧 | C: 2h + X: 2h / 経過: 0.5d | 12カテゴリ表示 + サイドバー15項目 + 「準備中」表示 |
| **F1-P2** | 重要マーク機能 | 🅒🅧 | C: 4h + X: 2h / 経過: 1d | ☆トグル動作 + 重要モード抽出 + S22動作 + チュートリアル表示（v0.14 U5追加） |
| **F1-P3** | 午後I 骨組み | 🅒🅧 | C: 2h + X: 2h / 経過: 0.5d | PM1のみ表示 + 自己採点UI動作 |
| **F1-P4** | 公式午前II 骨組み | 🅒🅧 | C: 8h + X: 4h / 経過: 2d | トップ→出題→サマリー一連動作 + 重要マーク統合 + 著作権表記 |
| **F1-P5** | 論述トレーニング 骨組み | 🅒🅧 | C: 10h + X: 3h / 経過: 2d | 設問→タイマー→解答→採点→振り返り一連動作 + **自動保存（v0.14 U2追加）** + 復帰モーダル |
| **F1-P6** | ブランド適用・初回デプロイ | 🅒🅧 | C: 2h + X: 2h / 経過: 0.5d | `bg-blue-` 等0件 + Vercel mamiya-pmapp.vercel.app 公開 + PWAインストール可 |

**フェーズ1合計（Claude時間ベース）**: 約 **38h** + Codex時間 **19h** / 経過日数 **約8.5日**（個人フルタイム前提）

> Claude時間: ユーザがClaudeセッションを実行する累積時間。Codex時間: Codexセッションの累積時間。経過日数: ターン制を考慮した実時間。

#### フェーズ1.5（パイロット運用）— v0.14新設

| ID | タスク名 | 担当 | 工数 | Go/No-Go判定基準 |
|---|---|---|---|---|
| **F1.5-P1** | パイロット用カテゴリ選定（ステークホルダー） | ユーザ | 0.5d | 選定確定 |
| **F1.5-P2** | パイロットノート作成（1カテゴリ） | 🅒+Codexレビュー | C: 8h + レビュー2h / 経過: 1.5d | 30セクション以上 + Codexレビュー + ユーザ最終確認 |
| **F1.5-P3** | パイロットクイズ作成（50問） | 🅒+Codexレビュー | C: 6h + レビュー1.5h / 経過: 1d | 50問 + 全choices正解含む + 解説あり |
| **F1.5-P4** | パイロット用公式午前IIサンプル（10〜25問） | 🅒🅧 | C: 4h / 経過: 1d | 10問以上の独自解説完成 |
| **F1.5-P5** | ユーザ試用 | ユーザ | 1〜2週間（カレンダー上） | 致命バグ無し + UX問題報告 |
| **F1.5-P6** | フィードバック反映 | 🅒🅧 | 可変 / 経過: 1〜3d | 致命バグ修正完了 |

**フェーズ1.5合計**: 経過日数 **約2〜3週間**（試用期間含む）。**ここでGo/No-Go判定**してフェーズ2着手判断。

#### フェーズ2（残コンテンツ投入）

| ID | タスク名 | 担当 | 工数（Claude時間 + 経過日数） | Go/No-Go判定基準 |
|---|---|---|---|---|
| **F2-P1** | 残り11カテゴリのノート | 🅒+Codexレビュー | C: 50〜80h / 経過: 7〜12d | 11カテゴリ全て + 検証スクリプトpass |
| **F2-P2** | 残り11カテゴリのクイズ（550問） | 🅒+Codexレビュー | C: 30〜50h / 経過: 5〜8d | 各カテゴリ50問 + 検証pass |
| **F2-P3** | 公式午前II 全年度（H25〜現行 約325問） | 🅒🅧 | C: 40〜60h + X: 20h / 経過: 7〜10d | 全年度の問題＋独自解説完成 |
| **F2-P4** | 午後I 全年度（公式解答＋配点マップ） | 🅒🅧 | C: 20〜35h + X: 10h / 経過: 4〜6d | 全年度の解答＋scoringMap完成 |
| **F2-P5** | 論述問題インデックス（H25〜） | 🅒🅧 | C: 4h + X: 4h / 経過: 1d | 全年度のEssayProblemデータ完成 |
| **F2-P6** | PMBOK第8版差分カテゴリ（pmbok8-diff） ★v0.14新設 | 🅒+Codexレビュー | C: 8h / 経過: 1.5d | 差分ノート完成 |
| **F2-P7** | バッジ再設計・QAチェックリスト消化・正式版リリース | 🅒🅧 | C: 8h + X: 4h / 経過: 2d | バッジ動作 + QA全項目pass + v1.0.0デプロイ |

**フェーズ2合計（Claude時間ベース）**: 約 **160〜245h** / 経過日数 **約27〜40日**

#### プロジェクト全体

| 項目 | 値 |
|---|---|
| Claude時間 | 約 **210〜290h**（フェーズ1: 38h、フェーズ1.5: 18h、フェーズ2: 160〜245h） |
| Codex時間 | 約 **65〜80h** |
| 経過日数（最短） | 約 **40日**（フルタイム前提） |
| 経過日数（現実的） | 約 **2〜4ヶ月**（並行プロジェクトを考慮） |

> 工数は**Claudeセッションでアプリを操作する時間ベース**。コンテンツレビュー時間（Codex/ユーザ）は別途加算。
> 個人開発で並行作業がある場合、経過日数は2〜3倍見込む。

### 1.3 タスク間の依存関係

```
F1-P0 (スキャフォールド)
   │
   ├─→ F1-P1 (カテゴリ・サイドバー)
   │        │
   │        ├─→ F1-P2 (重要マーク)
   │        │        │
   │        │        └─→ F1-P4 (公式午前II) ── ┐
   │        │
   │        └─→ F1-P3 (午後I骨組み) ───────────┤
   │
   └─→ F1-P5 (論述骨組み) ─────────────────────┤
                                                │
                                                ▼
                                        F1-P6 (ブランド適用・初回デプロイ)
                                                │
                                                ▼
                                         ┌────────────┐
                                         │ フェーズ1完了 │
                                         └────────────┘
                                                │
                                                ▼
F2-P1 (ノート) ─→ F2-P2 (クイズ)
                       │
F2-P3 (公式午前II) ────┤
F2-P4 (午後I) ─────────┤
F2-P5 (論述問題) ──────┤
                       ▼
                 F2-P6 (バッジ・QA・リリース)
                       │
                       ▼
                 ┌─────────────┐
                 │ プロジェクト完了 │
                 └─────────────┘
```

並列可能な箇所（同一AIによる並列ではなく**論理的な独立性**を示す。実際の作業は§1.5の通り直列）:
- **F1-P3, F1-P4, F1-P5** はそれぞれ独立しているため任意順で実装可能
- **F2-P1〜F2-P5** は相互依存が薄いため、F2-P1完了後はF2-P2〜F2-P5を任意順で進められる

---

### 1.4 Claude / Codex 役割分担

#### 1.4.1 基本方針

Claude（本AI）とCodex（下請けAI）で作業を分担し、Claude側のトークン消費を抑える。

| AI | 役割 | 得意分野 |
|---|---|---|
| **Claude** | アプリ開発の中核 | 設計判断・複雑なロジック実装・コンテンツ生成・コードレビュー・既存ファイル深層改修 |
| **Codex** | 機械的・反復的な実装作業 | 仕様が明確なファイル新規作成・mechanical置換・データファイル投入・テンプレ通りのコンポーネント実装 |

#### 1.4.2 担当区分（凡例）

各タスク・ステップに以下のラベルを付与:

| ラベル | 意味 |
|---|---|
| 🅒 | **Claude単独**: Claudeが調査・実装・確認まで一貫して担当 |
| 🅧 | **Codex単独**: Codexが指示書に従い実装。完了後にClaudeがレビュー |
| 🅒🅧 | **協業**: Claudeが指示書を作成 → Codexが実装 → Claudeがレビュー＋微修正 |

> Codex作業の**直後**は必ずClaudeレビューセッションを挟む（§1.4.4）。

#### 1.4.3 振り分け原則

#### Codex（🅧）が担当に向くもの
- ✅ 新規ファイル作成で**コード全文または明確なテンプレ**が指示書にあるもの
- ✅ Mechanical置換（grep/sed/全置換）
- ✅ 静的データファイル投入（categories.ts, types追加など）
- ✅ App.tsx へのRoute追記など追加だけの変更
- ✅ 単純なJSXコンポーネント（props/state少、表示中心）

#### Claude（🅒）が担当に向くもの
- ⚠️ **既存大規模ファイル**の部分改修（NoteDetail.tsx等、誤改変リスク高）
- ⚠️ ロジックを伴うlibモジュール（タイマー、active session管理）
- ⚠️ 状態遷移が複雑なページ（Quiz, EssayTraining, OfficialMorningSession）
- ⚠️ 設計判断を要する箇所（依存解決、エラー処理戦略）
- ⚠️ コンテンツ生成（ノート本文、クイズ問題、独自解説）— 知識・判断の質が重要
- ⚠️ Codex作業のレビュー
- ⚠️ デバッグ（不具合の原因究明）

#### 協業（🅒🅧）が向くもの
- 🔄 仕様は明確だが**既存コード読解が必要**な改修
- 🔄 中規模の新規コンポーネント（Claude設計→Codex実装→Claudeレビュー）

#### 1.4.4 作業フロー

```
   ┌─────────────────────────────────────────────┐
   │ 1. Claude セッション                         │
   │    - 次タスクを選定                          │
   │    - Codex 担当なら「Codex指示書」を作成      │
   │      → tasks/codex/<task-id>.md にコミット   │
   │    - Claude担当なら自分で実装                │
   │    - git push                                │
   └────────────┬────────────────────────────────┘
                │
                ▼ （Codex担当タスクの場合）
   ┌─────────────────────────────────────────────┐
   │ 2. Codex セッション                          │
   │    - git pull                                │
   │    - tasks/codex/<task-id>.md を読み実装      │
   │    - git add → commit（[X] prefix）→ push    │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ 3. Claude レビューセッション                 │
   │    - git pull                                │
   │    - 直近のCodex commit内容をレビュー         │
   │    - レビュー結果を tasks/reviews/ に記録    │
   │    - 必要なら追加修正コミット                │
   │    - git push                                │
   └────────────┬────────────────────────────────┘
                │
                ▼
              次のタスクへ
```

> **絶対ルール**: Claude と Codex が**同時にローカルファイルを編集することは禁止**。常にgit経由で作業を引き継ぐ。

---

### 1.5 Git ワークフロー

#### 1.5.1 リポジトリ
- **GitHub**: https://github.com/hmamiya52-bit/PM-learning_app-pro
- **ローカル**: `D:\Claude\PMpro\PM-learning_app-pro\`

#### 1.5.2 ブランチ戦略
**main 直接運用**（個人開発・AI協業のシンプル運用）。
- フィーチャーブランチは作らない
- PR運用なし
- main ブランチに直接commit & push

#### 1.5.3 セッション開始時（必須）

```bash
cd D:/Claude/PMpro/PM-learning_app-pro
git pull origin main
```

#### 1.5.4 セッション終了時（必須）

```bash
git status                                # 変更内容を確認
git add <変更ファイル>                     # ファイル単位で明示的に add（git add -A は避ける）
git commit -m "<prefix> <内容>"
git push origin main
```

#### 1.5.5 コミットメッセージ規約

```
<prefix> <タスクID> <内容>

例:
[C] F1-P0 add tailwind brand colors
[X] F1-P1 populate categories.ts with 12 PM categories
[Review] F1-P1 fix Layout.tsx sidebar order
```

| Prefix | 意味 |
|---|---|
| `[C]` | Claude 単独実装 |
| `[X]` | Codex 単独実装 |
| `[Review]` | Claude による Codex 作業のレビュー後追加修正 |
| `[Doc]` | ドキュメント更新（要件・基本設計・詳細設計） |
| `[Fix]` | バグ修正（C/X問わず） |

#### 1.5.6 タスク管理ファイル配置（PM repo内）

Codex指示書とレビュー記録は**リポジトリ内**に配置し、git経由で共有:

```
PM-learning_app-pro/
├── tasks/
│   ├── codex/
│   │   ├── F1-P0_step2_delete_files.md     ← Codex 指示書
│   │   ├── F1-P1_categories.md
│   │   ├── F1-P2_important_toggle.md
│   │   └── ...
│   └── reviews/
│       ├── F1-P0_step2_review.md            ← Claude レビュー記録
│       └── ...
```

#### 1.5.7 競合発生時の対応

万一 push が拒否された（同時編集が起きた）場合:
1. **作業を一旦止める**
2. `git pull --rebase origin main` で取り込む
3. コンフリクトがあれば解消
4. 再度 push

このルールがあるため、**Claude/Codex は厳密にターン制で作業**する必要がある。

---

## 2. 実装フェーズ詳細化

各フェーズについて以下の項目を網羅する:
- **目的**: フェーズ完了時に得られる価値
- **入力**: 前提となる成果物
- **出力**: 生成されるファイル・状態
- **タスク**: 順序付きの実装手順
- **コマンド**: 実行する具体的なコマンド
- **完了条件 (DoD)**: 目視確認するチェックリスト
- **意思決定ポイント (DP)**: 実装中に判断が必要な箇所
- **推定所要時間**

---

### 2.0 F1-P-1: NW実装精読セッション ★v0.14新設

**全体担当**: 🅒（Claude単独、ユーザは判断のみ）

#### 目的
NW-learning_app-proの実コードを精読し、設計書の前提と差分を洗い出す。実装中の「設計と違う」発見によるrework を防ぐ。

#### 入力
- `D:\Claude\PMpro\NW-learning_app-pro\` ソース全体
- `requirements.md` v0.5 / `basic_design.md` v0.9 / `detailed_design.md` v0.14

#### 出力
- `tasks/nw-readthrough.md` 🟢（読み合わせ結果のメモ、設計差分のリスト）

#### タスク

##### Step 1: 主要ファイルを読み込み
読む対象（優先度高）:
- `src/lib/storage.ts`（API契約・キー定数の正確性）
- `src/lib/gamification.ts`（applyAnswer 等の戻り値形式・XP計算式）
- `src/lib/tracker.ts`（PracticeRecord・getMaxScore戻り値）
- `src/lib/activityLog.ts`（イベント種別の構造）
- `src/lib/sync/adapters.ts`（マージ戦略・KEYS）
- `src/components/Layout.tsx`（サイドバー実装・isMobile判定方法）
- `src/pages/Quiz.tsx`（モード判定ロジック・出題シャッフル）
- `src/pages/AfternoonProblems.tsx`（buildRows・filterRows）
- `src/pages/AfternoonMyAnswer.tsx`（useTimer、myAnswer key）
- `src/pages/NoteDetail.tsx`（NOTE_DB構造・RedWordコンポーネント）
- `src/data/badges.ts`（バッジ定義の構造）

##### Step 2: 差分洗い出し
detailed_design.md の各セクションと NWの実コードを照合:
- API シグネチャ
- 型定義
- コンポーネントのprops契約
- LocalStorage操作の細部
- 設計書で「NWと同一」と書いた箇所の真偽

##### Step 3: 差分メモを作成
`tasks/nw-readthrough.md` に以下フォーマットで:
```markdown
# NW実装読み合わせ結果

## 設計書との差分
- §3.6 tracker.ts: getMaxScore は実際は `(section: 'G1' | 'G2') => 50 | 100` で…
- §3.7 gamification.ts: applyAnswer の戻り値に `answeredAt` が含まれる
- ...

## 実装時の注意
- NW Layout.tsx の isMobile は useEffect + window.matchMedia で実装
- ...
```

##### Step 4: 設計書修正
差分が大きい箇所は detailed_design.md を修正してコミット。

#### Go/No-Go判定基準
- [ ] `tasks/nw-readthrough.md` 作成完了
- [ ] 主要11ファイルの精読完了
- [ ] 設計書との差分10件以下に収束（残課題は実装中に対応）
- [ ] ユーザが内容を確認・承認

#### 推定所要時間: 0.5日（Claude時間 約4h）

---

### 2.1 F1-P0: スキャフォールド

**全体担当**: 🅒🅧（Claudeがオーケストレーション、Step単位でCodexに委譲）

#### 目的
PMリポジトリにNWアプリのコード構造をコピーし、PM固有の差分（不要ファイル除去・LocalStorageキー変更・認証無効化・ブランドカラー定義・ロゴ生成）を反映。`npm run dev` で空コンテンツのアプリが起動する状態にする。

#### 入力
- NWアプリのソース: `D:\Claude\PMpro\NW-learning_app-pro\`
- 空のPMリポジトリ: `D:\Claude\PMpro\PM-learning_app-pro\`（git initされた空ディレクトリ）
- ブランドカラー仕様（基本設計書 §6.1）
- ロゴテキスト仕様（基本設計書 §6.3）

#### 出力
- PMリポジトリにNWベースのコードベース
- `npm install` → `npm run dev` で起動可能な状態
- 認証なしで `/`（ホーム）が直接表示される
- 削除対象ファイル除去済み
- ブランドカラー `#9d5b8b` 系がTailwindと配色全般に反映
- PWAアイコン（PM版ロゴ）配置済み

#### タスク

##### Step 1: NW全ファイルをPMリポジトリにコピー  🅒
> Claude担当: gitignore設定や初回セットアップ判断を含むため
```bash
cd D:/Claude/PMpro
# .git, node_modules, dist は除外
rsync -av --exclude '.git' --exclude 'node_modules' --exclude 'dist' \
  NW-learning_app-pro/ PM-learning_app-pro/
# Windowsで rsync が無い場合: robocopy NW-learning_app-pro PM-learning_app-pro /E /XD .git node_modules dist
```

##### Step 2: NW固有ファイルの削除  🅧
> Codex担当: 削除リスト明確、機械作業
削除対象（basic_design §1.3 参照）:
```bash
cd D:/Claude/PMpro/PM-learning_app-pro
rm -f extracted_text.txt 令和7-8年.txt 復習ノート.pdf
rm -f STRUCTURE.md requirements.md  # NW版を削除（PM版で置き換え済み）
rm -rf scripts                       # NW固有Pythonスクリプト
rm -f src/pages/Protocols.tsx
rm -f src/pages/Column.tsx
rm -f src/data/protocols.ts
rm -f src/data/topics.ts
rm -f src/data/questions/protocol-review.ts
```

PMアプリのドキュメントは保持:
- `requirements.md` v0.4（既に作成済み）
- `basic_design.md` v0.4（既に作成済み）
- `detailed_design.md`（本書）
- `color_samples.html`

##### Step 3: package.json の更新  🅒
> Claude担当: peer依存解決方針（@zxing/library^0.22.0）の判断を含む
```json
{
  "name": "pmap",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { /* NW踏襲 */ },
  "dependencies": {
    "@zxing/browser": "^0.2.0",
    "@zxing/library": "^0.22.0",   // ← ^0.23.0 から下げる（peer依存整合 / DP-P0-1）
    /* ... 他はNW踏襲 ... */
  }
}
```

##### Step 4: tailwind.config.js にブランドカラー追加  🅧
> Codex担当: コード提示済み
```js
module.exports = {
  // ... 既存設定 ...
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9d5b8b',
          light:   '#f5e9f1',
          dark:    '#7d4570',
          darker:  '#5e3354',
        },
      },
    },
  },
}
```

##### Step 5: vite.config.ts のPWA manifest更新  🅧
> Codex担当: コード提示済み
```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'PM Learning App',
    short_name: 'PM Learn',
    description: 'プロジェクトマネージャ試験 学習アプリ',
    theme_color: '#9d5b8b',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  /* workbox 設定はNW踏襲 */
})
```

##### Step 6: index.html のタイトル・theme-color更新  🅧
```html
<title>PM Learning App</title>
<meta name="theme-color" content="#9d5b8b" />
```

##### Step 7: LocalStorageキー prefix の置換  🅧
> Codex担当: 機械置換、grep+sed
全ファイル一括置換:
```bash
# bash環境
grep -rl "nwsp:" src/ | xargs sed -i "s/nwsp:/pmap:/g"
```

対象ファイル（NWの実績から）:
- `src/lib/storage.ts`
- `src/lib/tracker.ts`
- `src/lib/activityLog.ts`
- `src/lib/sync/adapters.ts`
- `src/auth/useAuth.ts`
- 検索で出る他のすべて

##### Step 8: NotFound ページ作成  🅧
> Codex担当: 完全コード提示済み（§4.5 参照）。App.tsx の import 解決のため Step 9（App.tsx 書き換え）より前に作成必須。

`src/pages/NotFound.tsx` を §4.5 のコードで新規作成。

##### Step 9: App.tsx を開発版ルート構成に書き換え  🅒
> Claude担当: 既存App.tsxの構造理解＋AuthGuard除去判断
basic_design §7.1 のルート構成に従う:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
// ...各ページのimport（Login/AuthGuardはimportしない or import残置で未使用）

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 没入型画面 */}
        <Route path="/quiz" element={<Quiz />} />
        {/* 公式午前II / 論述の没入型画面は F1-P4, F1-P5 で追加 */}

        {/* Layout付き画面 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* 各画面のRoute */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

> 開発版では `<AuthGuard>` ラップ・`<Login>` ルート登録は**しない**。

##### Step 10: ロゴSVG作成  🅒
> Claude担当: デザイン要素・配置調整
仕様（basic_design §6.3）:
- 文字色: `#9d5b8b`
- 背景: 白
- 正方形ビューボックス 512×512
- 内側に10%のpadding
- 3行テキスト:
  ```
  PM
  Project Manager
  Learning App by MAMIYA
  ```

```svg
<!-- src/assets/logo.svg または public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#ffffff"/>
  <g fill="#9d5b8b" text-anchor="middle" font-family="-apple-system, 'Segoe UI', sans-serif" font-weight="800">
    <text x="256" y="200" font-size="140">PM</text>
    <text x="256" y="280" font-size="48">Project Manager</text>
    <text x="256" y="340" font-size="28" font-weight="600">Learning App by MAMIYA</text>
  </g>
</svg>
```
※ フォントサイズ・y座標は実機で微調整。

##### Step 11: PWAアイコンPNG生成  🅧
> Codex担当: スクリプト実行
NW依存の `sharp` を利用:
```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('src/assets/logo.svg');
sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png');
sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png');
sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png');
"
# favicon.svg は logo.svg をコピー
cp src/assets/logo.svg public/favicon.svg
```

##### Step 12: 依存インストール＆起動確認  🅧
> Codex担当: コマンド実行＋目視確認。エラー発生時はClaudeにエスカレーション
```bash
cd D:/Claude/PMpro/PM-learning_app-pro
rm -f package-lock.json    # NW由来のロックファイルを破棄して再生成
npm install --no-fund --no-audit
npm run dev
```

ブラウザで `http://localhost:5173` を開いて動作確認。

#### 完了条件

- [ ] `npm run dev` がエラーなしで起動
- [ ] http://localhost:5173 でホーム画面が表示
- [ ] ヘッダのロゴが #9d5b8b で表示される
- [ ] サイドバーが #9d5b8b 系のアクセント色
- [ ] LocalStorage を確認すると `pmap:` プレフィックスのキーが作られる（または空状態）
- [ ] `/login` へのアクセスは404またはホームへリダイレクト（ルート未登録）
- [ ] 削除対象ファイル（Protocols.tsx, Column.tsx, protocols.ts等）が存在しない
- [ ] `npm run build` がエラーなしで完了
- [ ] PWA manifest の theme_color が `#9d5b8b`（DevTools → Application → Manifest で確認）

#### Go/No-Go判定基準（v0.14追加）
- 上記完了条件すべて満たす
- ローカル `npm run dev` で 5分以上の動作確認（コンソールエラーなし）
- F1-P-1 の `nw-readthrough.md` で大きな実装差分が無い
- **No-Go時**: F1-P-1に戻って差分再確認、または該当タスクのみrework

#### 意思決定ポイント

- **DP-P0-1**: peer依存解決方法
  - 採用: A案（package.jsonで `@zxing/library: ^0.22.0` に下げる）
  - 理由: クリーンに peerDependency を満たせる、`--legacy-peer-deps` フラグ不要
- **DP-P0-2**: ロゴSVGの作風
  - 採用: 白背景・テキストロゴのみ・装飾なし
  - 理由: PWAアイコンとして縮小しても視認性を確保するため
- **DP-P0-3**: パッケージマネージャ
  - 採用: npm（`npm install` / `npm run dev` / `npm run build`）
  - 理由: 動作確認済み、NW踏襲

#### 推定所要時間: 1〜2日

---

### 2.2 F1-P1: カテゴリ定義・サイドバー再構成

**全体担当**: 🅒🅧
- categories.ts投入: 🅧
- Layout.tsx サイドバー再構成: 🅒🅧（Claudeが指示書、Codex実装、Claudeレビュー）
- Home.tsx メニューカード: 🅒🅧
- Notes.tsx NOTE_CATEGORY_IDS: 🅧
- NoteDetail.tsx スタブ化: 🅒（既存大規模ファイルの慎重な改修）

#### 目的
PMアプリの中核データ「12カテゴリ」を定義し、Home/Layout/Notesの3画面のメニュー・カテゴリ表示をPM用に切り替える。

#### 入力
- F1-P0完了状態
- 12カテゴリ定義（基本設計書 §5.1）

#### 出力
- `src/data/categories.ts` （PM 12カテゴリ）
- `src/components/Layout.tsx` のサイドバーJSX更新
- `src/pages/Home.tsx` のメニューカード更新
- `src/pages/Notes.tsx` の `NOTE_CATEGORY_IDS` 更新
- `src/pages/NoteDetail.tsx` の `NOTE_DB` を空スタブに

#### タスク

##### Step 1: categories.ts を全置換
```ts
// src/data/categories.ts
import type { Category } from '../types'

export const categories: Category[] = [
  { id: 'stakeholder',          name: 'ステークホルダー',         order: 1,  description: '特定・分析・エンゲージメント計画' },
  { id: 'team',                 name: 'チーム',                  order: 2,  description: 'リーダーシップ・組織・要員管理' },
  { id: 'development-approach', name: '開発アプローチ',           order: 3,  description: '予測型／適応型／ハイブリッド・アジャイル' },
  { id: 'planning',             name: '計画',                    order: 4,  description: 'スコープ・WBS・スケジュール・コスト・見積' },
  { id: 'project-work',         name: 'プロジェクト作業',         order: 5,  description: '調達・契約・リソース・知識管理' },
  { id: 'delivery',             name: 'デリバリー',              order: 6,  description: '品質・要求・受入' },
  { id: 'measurement',          name: '測定',                    order: 7,  description: 'EVM・KPI・予測・パフォーマンス測定' },
  { id: 'uncertainty',          name: '不確かさ・リスク',         order: 8,  description: 'リスク特定・分析・対応・機会管理' },
  { id: 'integration',          name: '統合・変更管理',           order: 9,  description: '統合管理・変更要求・構成管理' },
  { id: 'governance',           name: 'ガバナンス・組織論',       order: 10, description: 'PMO・ポートフォリオ・プログラム・組織構造' },
  { id: 'tailoring-models',     name: 'テーラリング・モデル',     order: 11, description: 'PMBOK第7版モデル・手法・成果物' },
  { id: 'service-management',   name: 'サービスマネジメント',     order: 12, description: 'ITIL・SLA・運用引継ぎ・システム監査・法務' },
]
```

##### Step 2: Layout.tsx サイドバーの再構成
basic_design §2.3 の順序に従う:

| # | 画面名 | 遷移先 | アイコン (lucide推奨) |
|---|---|---|---|
| 1 | ホーム | `/` | `Home` |
| 2 | アプリの使い方 | `/how-to-use` | `HelpCircle` |
| 3 | ノートモード | `/notes` | `BookOpen` |
| 4 | 重要問題モード | `/quiz?mode=important` | `Star` |
| 5 | 弱点克服モード | `/quiz?mode=weakness` | `TrendingDown` |
| 6 | ランダム出題 | `/quiz?mode=random` | `Shuffle` |
| 7 | カテゴリ別学習 | `/notes` (カテゴリ選択経由) | `Layers` |
| 8 | 公式午前II問題 | `/morning` | `FileText` |
| 9 | 午後問題 | `/afternoon` | `ClipboardList` |
| 10 | 論述トレーニング | `/essay` | `PenLine` |
| 11 | 検索 | `/search` | `Search` |
| 12 | バッジ | `/badges` | `Award` |
| 13 | 学習履歴 | `/history` | `BarChart3` |
| 14 | デバイス同期 | `/sync` | `RefreshCw` |
| 15 | 設定 | `/settings` | `Settings` |

> 削除: 「プロトコル一覧」「コラム」項目とそのリンク
> アクセント色を `bg-brand`, `hover:bg-brand-dark` 系へ置換

##### Step 3: Home.tsx メニューカード再構成
NWのMENU_CARDS配列を上記サイドバー順（ただしホーム自身を除く）の14枚に作り替える。
カードのアクセント色を brand 系へ。

##### Step 4: Notes.tsx の NOTE_CATEGORY_IDS
```ts
export const NOTE_CATEGORY_IDS = [
  'stakeholder', 'team', 'development-approach', 'planning',
  'project-work', 'delivery', 'measurement', 'uncertainty',
  'integration', 'governance', 'tailoring-models', 'service-management',
] as const
```

##### Step 5: NoteDetail.tsx の NOTE_DB を空スタブに
```ts
// src/pages/NoteDetail.tsx の冒頭
const NOTE_DB: Record<string, NoteData> = {
  // フェーズ2 F2-P1 でカテゴリごとの NoteData を投入
}

// NOTE_SECTION_INDEX も空配列でエクスポート
export const NOTE_SECTION_INDEX: { categoryId: string; sectionIndex: number; heading: string }[] = []
```

ノート未投入時は「このカテゴリのノートは準備中です」表示で代替。

#### 完了条件

- [ ] `/notes` で12カテゴリのカードが表示される
- [ ] サイドバーに15項目（ホーム含む）が表示
- [ ] 「プロトコル一覧」「コラム」がサイドバー・Homeに無い
- [ ] 「公式午前II問題」「論述トレーニング」がサイドバーにある
- [ ] サイドバー色が brand 系
- [ ] `/notes/<categoryId>` で「準備中」メッセージ表示
- [ ] カテゴリリンク → `/quiz?mode=topic&category=<id>` で空問題画面に遷移（次フェーズで実装）

#### 意思決定ポイント

- **DP-P1-1**: 「カテゴリ別学習」メニューの動線
  - 採用: ノート一覧画面（`/notes`）に飛ばし、ユーザがカテゴリ選択 → クイズ起動
  - 理由: NW挙動踏襲（NWではカテゴリ選択UIは独立画面ではない）

#### 推定所要時間: 0.5日

---

### 2.3 F1-P2: 重要マーク機能（クロスカット）

**全体担当**: 🅒🅧
- types/index.ts isImportant削除: 🅧
- lib/importantMarks.ts: 🅒🅧（API完備されているがロジック新規のためClaudeがレビュー）
- ImportantToggle.tsx: 🅧（コード提示済み）
- Quiz画面の重要モードロジック: 🅒（既存ロジック改修）
- ImportantMarks.tsx: 🅒（新規ページ、UI判断）
- Settings.tsx リンク追加: 🅧
- App.tsx route追加: 🅧
- sync/adapters.ts: 🅧

#### 目的
クイズ・公式午前II の問題画面で共通利用される「重要マーク」機能を実装。`isImportant` 静的フラグを廃止し、ユーザ手動トグル方式に置き換える。

#### 入力
- F1-P0, F1-P1完了状態
- 重要マーク仕様（基本設計書 §3.3, §5.2）

#### 出力
- `src/lib/importantMarks.ts` 🟢
- `src/components/ImportantToggle.tsx` 🟢
- `src/pages/ImportantMarks.tsx` 🟢（設定配下、`/settings/important`）
- `src/pages/Quiz.tsx` の「重要モード」集計ロジック更新 🟡
- `src/types/index.ts` から `Question.isImportant` を削除 🟡
- `src/lib/sync/adapters.ts` の同期対象に追加 🟡

#### タスク

##### Step 1: types/index.ts から isImportant 削除
```ts
export interface Question {
  id: string
  topicId: string
  questionText: string
  correctAnswer: string
  choices: string[]
  explanation: string
  difficulty: 1 | 2 | 3
  excludeFromWritten?: boolean
  // ❌ isImportant フィールドは削除
}
```

##### Step 2: lib/importantMarks.ts 実装
```ts
const KEY = 'pmap:important_questions'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(ids: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function getImportantIds(): string[] { return load() }

export function isImportant(questionId: string): boolean {
  return load().includes(questionId)
}

export function toggleImportant(questionId: string): boolean {
  const ids = load()
  const idx = ids.indexOf(questionId)
  if (idx >= 0) {
    ids.splice(idx, 1)
    save(ids)
    return false
  } else {
    ids.push(questionId)
    save(ids)
    return true
  }
}

export function clearAllImportant(): void { save([]) }

export function clearImportantOfMode(prefix: 'q-' | 'om-'): void {
  save(load().filter(id => !id.startsWith(prefix)))
}
```

##### Step 3: components/ImportantToggle.tsx 実装
```tsx
import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { isImportant, toggleImportant } from '../lib/importantMarks'

interface Props {
  questionId: string
  size?: 'sm' | 'md'
}

export default function ImportantToggle({ questionId, size = 'md' }: Props) {
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    setMarked(isImportant(questionId))
  }, [questionId])

  const handleClick = () => {
    const next = toggleImportant(questionId)
    setMarked(next)
  }

  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <button
      onClick={handleClick}
      aria-label={marked ? '重要マーク解除' : '重要マーク'}
      className="p-1 rounded hover:bg-brand-light/50 transition-colors"
    >
      <Star
        className={`${sizeClass} ${marked ? 'fill-brand text-brand' : 'text-slate-400'}`}
      />
    </button>
  )
}
```

##### Step 4: Quiz画面で ImportantToggle を配置
NW `Quiz.tsx`（または `QuizQuestion.tsx`）の問題ヘッダ部に追加:
```tsx
<div className="flex items-center justify-between">
  <div className="text-sm text-slate-500">問題 {current + 1} / {total}</div>
  <ImportantToggle questionId={question.id} />
</div>
```

##### Step 5: Quiz.tsx の `?mode=important` ロジック更新
```ts
import { getImportantIds } from '../lib/importantMarks'

function getQuestionsForMode(mode: string, allQuestions: Question[]): Question[] {
  if (mode === 'important') {
    const importantIds = getImportantIds().filter(id => id.startsWith('q-'))
    return allQuestions.filter(q => importantIds.includes(q.id))
  }
  // 他のモード...
}
```

##### Step 6: pages/ImportantMarks.tsx 実装
- 全 `pmap:important_questions` を取得
- `q-*` と `om-*` を区別して2セクションに表示
- 各行: モードバッジ / 問題文抜粋 / 解除ボタン
- 上部に「クイズ全解除」「公式午前II全解除」「全解除」ボタン

##### Step 7: Settings.tsx に「重要マーク管理」リンク追加
```tsx
<Link to="/settings/important" className="...">
  <Star className="w-5 h-5 text-brand" />
  <span>重要マーク管理</span>
  <span className="text-xs text-slate-400">{count}件</span>
</Link>
```

##### Step 8: App.tsx に `/settings/important` ルート追加
##### Step 9: lib/sync/adapters.ts の同期対象キーに `pmap:important_questions` を追加

#### 完了条件

- [ ] クイズ画面の問題に☆ボタンが表示
- [ ] ☆クリックで状態切替（塗りつぶし⇄輪郭のみ）
- [ ] LocalStorage `pmap:important_questions` に正しく `q-001` 形式IDが保存
- [ ] 重要モードでマーク済み問題のみ出題される
- [ ] マーク0件で重要モード起動時は「マーク済み問題がありません」表示
- [ ] `/settings/important` で一覧・個別解除・部分全解除・全解除動作
- [ ] QR同期にマーク内容が含まれる（手動確認）
- [ ] 正解しても自動解除されない（DP-P2-1）

#### 意思決定ポイント

- **DP-P2-1**: 重要マーク自動解除しない（ユーザ確定）
- **DP-P2-2**: ☆ボタンの配置位置 → 問題ヘッダ右側
- **DP-P2-3**: マーク0件時のUI → 「マーク済み問題がありません。問題画面の☆をタップしてマークしてください」

#### 推定所要時間: 1日

---

### 2.4 F1-P3: 午後I 骨組み

**全体担当**: 🅒🅧
- types ProblemSection変更: 🅧
- afternoonProblems.ts / officialAnswers.ts / scoringMap.ts サンプル: 🅧
- AfternoonProblems.tsx G2タブ削除: 🅒（既存複雑ファイルの慎重な改修）

#### 目的
午後I（PM1）の一覧・公式解答・自己採点UIを稼働状態にする。データは最小サンプル（1〜2問）のみ投入し、本格データはF2-P4で対応。

#### 入力
- F1-P0完了状態
- 基本設計書 §4.2 の AfternoonProblem / OfficialAnswerSet / PracticeRecord型

#### 出力
- `src/types/index.ts` の `ProblemSection = 'PM1'` 化
- `src/data/afternoonProblems.ts` 🟡（PM版骨組み、サンプル2件）
- `src/data/officialAnswers.ts` 🟡（同上）
- `src/data/scoringMap.ts` 🟡（同上）
- `src/pages/AfternoonProblems.tsx` 🟡（G2タブ削除）
- `AfternoonMyAnswer.tsx`, `AfternoonAnswerDetail.tsx` の動作確認

#### タスク

##### Step 1: types/index.ts の ProblemSection を 'PM1' のみに
```ts
export type ProblemSection = 'PM1'
```

##### Step 2: data/afternoonProblems.ts を全置換（最小サンプル2件）
```ts
import type { AfternoonProblem } from '../types'

export const YEARS = ['R6'] as const   // フェーズ1サンプル（F2-P4で全年度に拡張）

export const afternoonProblems: AfternoonProblem[] = [
  {
    id: 'R6-PM1-1',
    year: 'R6',
    yearLabel: '令和6（2024）',
    era: 'reiwa',
    section: 'PM1',
    number: 1,
    title: 'サンプル問題1（フェーズ2で本格投入）',
    keywords: ['stakeholder'],
    questionPdfUrl: 'https://www.ipa.go.jp/...',
  },
  {
    id: 'R6-PM1-2',
    year: 'R6',
    yearLabel: '令和6（2024）',
    era: 'reiwa',
    section: 'PM1',
    number: 2,
    title: 'サンプル問題2（フェーズ2で本格投入）',
    keywords: ['planning'],
    questionPdfUrl: 'https://www.ipa.go.jp/...',
  },
]
```

##### Step 3: officialAnswers.ts, scoringMap.ts も同様にサンプル化

##### Step 4: AfternoonProblems.tsx の G2タブ削除
NW実装はG1/G2タブ切替UIがある。G1のみ表示する状態に簡素化:
```tsx
// G2 / 午後II タブを削除し、PM1の一覧のみ表示
// section='PM1' のみで filter
```

##### Step 5: tracker.ts のキーprefix再確認
F1-P0で全置換済み。動作確認のみ。

#### 完了条件

- [ ] `/afternoon` でPM1の一覧（サンプル2件）が表示
- [ ] G2タブが画面上に存在しない
- [ ] `/afternoon/answers/<id>` で公式解答画面が表示
- [ ] `/afternoon/answers/<id>/myAnswer` で自己採点UIが表示
- [ ] スコア入力 → LocalStorage `pmap:tracker:records` に保存
- [ ] 学習計画日設定が動作

#### 意思決定ポイント
特になし（全てNW流用）

#### 推定所要時間: 0.5日

---

### 2.5 F1-P4: 公式午前II モード骨組み

**全体担当**: 🅒🅧
- types追加（OfficialMorningQuestion, MorningRecord）: 🅧
- lib/morningRecords.ts: 🅒🅧
- data/officialMorningQuestions.ts サンプル: 🅧
- OfficialMorningQuiz.tsx（トップ画面）: 🅒（複合的UIロジック）
- OfficialMorningSession.tsx（出題画面・没入型）: 🅒（状態管理が複雑）
- OfficialMorningSummary.tsx: 🅧（単純なサマリー）
- App.tsx ルート追加: 🅧
- sync/adapters.ts: 🅧

#### 目的
公式午前IIモード（一覧・出題・サマリー）の全画面を稼働状態にする。データは最小サンプル（1年度×3問程度）のみ投入。

#### 入力
- F1-P0, F1-P1, F1-P2完了状態
- 基本設計書 §4.4, §4.2

#### 出力
- `src/types/index.ts` に `OfficialMorningQuestion` / `MorningRecord` 追加
- `src/lib/morningRecords.ts` 🟢
- `src/data/officialMorningQuestions.ts` 🟢（サンプル）
- `src/pages/OfficialMorningQuiz.tsx` 🟢（一覧・トップ）
- `src/pages/OfficialMorningSession.tsx` 🟢（出題、没入型）
- `src/pages/OfficialMorningSummary.tsx` 🟢（サマリー、没入型）
- `App.tsx` ルート追加
- `Layout.tsx` サイドバーリンクは F1-P1 で追加済み
- `lib/sync/adapters.ts` 同期対象追加

#### タスク

##### Step 1: types/index.ts に新規型追加
```ts
export interface OfficialMorningQuestion {
  id: string
  year: string
  yearLabel: string
  number: number
  questionText: string
  choices: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  categoryId?: string
  sourceUrl: string
}

export interface MorningRecord {
  id: string
  questionId: string
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
  answeredAt: string
}
```

##### Step 2: lib/morningRecords.ts 実装
basic_design §5.3 の API契約に従う。
> ⚠️ **D2にて疑似コード・実装詳細を確定**してから Codex 委譲する。D2未完了状態でこのステップを開始しないこと。

##### Step 3: data/officialMorningQuestions.ts サンプル投入
1年度×3問程度。本格投入はF2-P3。

##### Step 4: pages/OfficialMorningQuiz.tsx 実装（トップ画面）
- 上段: 「全範囲ランダム」ボタン + 問題数セレクタ（10/25/50/全問、デフォルト25）
- 中段: 年度カードのグリッド
- 下部: IPA出典フッタ

##### Step 5: pages/OfficialMorningSession.tsx 実装（出題画面）
- 4択選択
- 即時正誤判定
- 独自解説表示
- 重要マーク☆トグル
- 進捗バー

##### Step 6: pages/OfficialMorningSummary.tsx 実装
- 正答率
- 誤答リスト

##### Step 7: App.tsx ルート追加
```tsx
<Route path="/morning" element={<Layout />}>
  <Route index element={<OfficialMorningQuiz />} />
</Route>
<Route path="/morning/session" element={<OfficialMorningSession />} />
<Route path="/morning/summary" element={<OfficialMorningSummary />} />
```

##### Step 8: lib/sync/adapters.ts に `pmap:morning:records` 追加

#### 完了条件

- [ ] `/morning` トップで年度カードと「全範囲ランダム」が表示
- [ ] 問題数セレクタが動作（10/25/50/全問）
- [ ] 年度選択 → シャッフル出題（DP確定: D=ii シャッフル）
- [ ] 4択選択 → 正誤判定 → 独自解説表示
- [ ] ☆トグルが動作
- [ ] 全問終了 → サマリー画面
- [ ] LocalStorage `pmap:morning:records` に記録
- [ ] 画面下部にIPA出典表記
- [ ] トップ画面の「重要マークのみ」フィルタボタン押下で、マーク済み公式午前II問題（`om-*` プレフィックス）だけが出題対象になる

#### 意思決定ポイント

- **DP-P4-1**: 全範囲ランダムの問題数選択UI → ボタン横にラジオボタン4択（10/25/50/全問）デフォルト25問
- **DP-P4-2**: 年度選択時の出題順 → シャッフル（ユーザ確定）
- **DP-P4-3**: 「重要マークのみ」フィルタの位置 → トップ画面のフィルタボタン群

#### 推定所要時間: 2日

---

### 2.6 F1-P5: 論述トレーニング 骨組み

**全体担当**: 🅒🅧
- types追加（EssayProblem, EssayAttempt, EssayActiveSession 等）: 🅧
- lib/essay.ts: 🅒（タイマー復帰ロジック・active session管理が複雑）
- data/essayProblems.ts サンプル: 🅧
- components/essay/EssayTimer.tsx: 🅒（タイマー状態管理）
- components/essay/EssayCharCounter.tsx: 🅧（単純）
- components/essay/EssaySelfReview.tsx: 🅧（ラジオグループ）
- components/essay/EssayAttemptHistory.tsx: 🅧
- pages/EssayList.tsx: 🅧
- pages/EssayTraining.tsx: 🅒（複合ページ・タイマー連携・active復帰）
- pages/EssayAttemptDetail.tsx: 🅧
- gamification/activityLog/sync更新: 🅧

#### 目的
論述トレーニングの全画面（一覧・練習・履歴詳細）と関連コンポーネントを稼働状態に。データは最小サンプル（1〜2問）。

#### 入力
- F1-P0, F1-P1完了状態
- 基本設計書 §4.6, §4.2, §5.4, §6.5.2-6.5.4

#### 出力
- `src/types/index.ts` に EssayProblem / EssayAttempt / EssayActiveSession / EssaySetsumon / SetsumonLabel / EssaySelfReview 追加
- `src/lib/essay.ts` 🟢
- `src/data/essayProblems.ts` 🟢（サンプル）
- `src/components/essay/EssayTimer.tsx` 🟢
- `src/components/essay/EssayCharCounter.tsx` 🟢
- `src/components/essay/EssaySelfReview.tsx` 🟢
- `src/components/essay/EssayAttemptHistory.tsx` 🟢
- `src/pages/EssayList.tsx` 🟢
- `src/pages/EssayTraining.tsx` 🟢
- `src/pages/EssayAttemptDetail.tsx` 🟢
- App.tsx ルート追加
- `lib/gamification.ts` に essay_complete 加算追加 🟡
- `lib/activityLog.ts` に essay_complete 種別追加 🟡
- `lib/sync/adapters.ts` 同期対象追加 🟡

#### タスク

##### Step 1: 型追加（basic_design §4.2 から転記）
EssayProblem / EssayAttempt / EssayActiveSession / EssaySetsumon / SetsumonLabel / EssaySelfReview を `src/types/index.ts` に追加。

##### Step 2: lib/essay.ts 実装
> ⚠️ **D2にて疑似コード・実装詳細を確定**してから Codex 委譲する。タイマー一時停止・再開・離脱復帰の状態管理ロジックは慎重を要するためClaude担当（基本設計 §5.4）。

##### Step 3: data/essayProblems.ts サンプル投入
1〜2問のサンプルEssayProblemを投入（本格データはF2-P5）。
##### Step 4: components/essay/* 4ファイル実装
- `EssayTimer`: スタート/一時停止/再開ボタン、HH:MM:SS表示
- `EssayCharCounter`: 現在文字数 / 推奨レンジ表示
- `EssaySelfReview`: 5項目×5段階のラジオグループ
- `EssayAttemptHistory`: 同一問題の過去Attemptsを一覧表示

##### Step 5: pages/EssayList.tsx 実装
- 過去問一覧（年度×問番号）
- 各過去問の練習回数・最新練習日
- フィルタ: 全件/練習済み/未着手

##### Step 6: pages/EssayTraining.tsx 実装
レイアウト構成:
1. 設問パネル（折りたたみ可）
2. タイマー
3. 解答エリア（ア/イ/ウ）
4. **「下書き保存」ボタン（設問ごと、明示）**
5. **★自動保存（v0.14 U2追加）**: 解答エリアの onChange で、入力停止後 **3秒後** に `pmap:essay:active` へ自動的に書き込み（debounce）
6. 「採点へ進む」ボタン
7. 自己採点パネル
8. 振り返り入力
9. 「保存して終了」

> **DP-P5-1 改訂（v0.14）**: 当初「自動保存なし」だったが、3視点レビューで誤閉じ・クラッシュリスクが高いと判断。**明示的な「下書き保存」ボタン + 入力停止3秒後の自動保存** の2段構えに変更。
> 復帰時: 同じ問題に戻ると `pmap:essay:active` から下書き復元

##### Step 6.5: 自動保存の実装パターン（v0.14追加）

```ts
// useDebouncedAutoSave hook
import { useEffect, useRef } from 'react'

function useDebouncedAutoSave(value: string, label: SetsumonLabel, delayMs = 3000) {
  const timer = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const session = loadActive()
      if (session) {
        saveActive({
          ...session,
          bodyByLabel: { ...session.bodyByLabel, [label]: value },
        })
      }
    }, delayMs)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, label, delayMs])
}

// 使い方
const [bodyA, setBodyA] = useState('')
useDebouncedAutoSave(bodyA, 'ア', 3000)
```

> 「下書き保存」ボタンは即座保存（デバウンスなし）、自動保存は3秒debounce。
> ユーザが意識せずに入力を続けても、誤閉じで失われる範囲は最大3秒分。

##### Step 7: pages/EssayAttemptDetail.tsx 実装

##### Step 8: App.tsx ルート追加
##### Step 9: gamification.ts / activityLog.ts / sync/adapters.ts 更新

#### 完了条件

- [ ] `/essay` 一覧表示
- [ ] `/essay/<id>` で設問・タイマー・解答エリア表示
- [ ] タイマーがHH:MM:SS で更新される（1秒間隔）
- [ ] 一時停止・再開が動作
- [ ] 文字数カウンタが推奨レンジに応じて色変化
- [ ] 「下書き保存」で `pmap:essay:active` に保存
- [ ] **入力停止3秒後の自動保存**が動作（v0.14 U2追加）
- [ ] ブラウザ強制クローズ後の復帰で、自動保存分まで復元される
- [ ] 「採点へ進む」で5項目5段階評価UI表示
- [ ] 振り返り入力可
- [ ] 「保存して終了」で `pmap:essay:attempts` に追加、active削除
- [ ] XP+200加算（暫定値）
- [ ] activityLog `essay_complete` 追加
- [ ] `/essay/<id>/attempts/<attemptId>` で履歴詳細表示

#### 意思決定ポイント

- **DP-P5-1（v0.14改訂）**: 当初「自動保存なし」だったが、3視点レビューでデータ消失リスクが高いと判断、**明示的下書き保存ボタン + 入力停止3秒後のdebounce自動保存** の2段構えに変更
- **DP-P5-2**: 「下書き保存」ボタンの配置 → 各テキストエリアの下、目立つ位置
- **DP-P5-3**: 復帰時の確認モーダル → 「前回の下書きが残っています。続きから再開しますか？/破棄して新規」

#### 推定所要時間: 2日

---

### 2.7 F1-P6: ブランド適用・初回デプロイ

**全体担当**: 🅒🅧
- 青系クラス置換: 🅧（grep+sed機械置換）
- badges.ts のNW固有用語整理: 🅒（残す/削除の判断）
- Vercel初期セットアップ: 🅒（vercel login/link、初回のみ判断あり）
- 初回デプロイ＋動作確認: 🅒

#### 目的
NWの青系カラーを完全にPMの `#9d5b8b` 系に置換、Vercelに初回デプロイして `mamiya-pmapp.vercel.app` で動作確認。

#### 入力
- F1-P0〜F1-P5完了状態

#### 出力
- 全画面でNW青系クラスが残っていないこと（grepで確認）
- `mamiya-pmapp.vercel.app` での公開動作
- バッジ定義のNW固有用語整理（PM用に名称調整、論述バッジはF2-P6で追加）

#### タスク

##### Step 1: NW青系クラスのgrep検索
```bash
cd D:/Claude/PMpro/PM-learning_app-pro/src
grep -rE "(bg|text|border|ring|from|to)-blue-" .
grep -rE "#1e40af" .
```

##### Step 2: 機械置換
| NWクラス | PMクラス |
|---|---|
| `bg-blue-600` | `bg-brand` |
| `bg-blue-700` | `bg-brand-dark` |
| `bg-blue-50` | `bg-brand-light` |
| `text-blue-600` | `text-brand` |
| `text-blue-700` | `text-brand-dark` |
| `text-blue-900` | `text-brand-darker` |
| `border-blue-*` | `border-brand-*` |
| `ring-blue-*` | `ring-brand-*` |
| `from-blue-*` | `from-brand-*` |
| `#1e40af` | `#9d5b8b` |

> NWの他のTailwind色（emerald/amber/red/slate等）は機能色として保持。

##### Step 3: badges.ts のNW固有用語整理
- NW午後II関連のバッジ定義（あれば）削除
- カテゴリ参照が NW固有 ID を使っているバッジは PM 12カテゴリIDに置換 or 削除
- 論述系バッジは F2-P6 で新規追加（このフェーズでは行わない）

##### Step 4: Vercel連携セットアップ
```bash
# Vercel CLI（初回のみ）
npm i -g vercel
cd D:/Claude/PMpro/PM-learning_app-pro
vercel login          # ブラウザでログイン
vercel link           # プロジェクト紐付け（mamiya-pmapp）
vercel               # 初回デプロイ（プレビュー）
vercel --prod        # 本番デプロイ
```

##### Step 5: 動作確認
- `mamiya-pmapp.vercel.app` で各画面遷移
- PWAインストール（Chromeのインストールアイコン）
- LocalStorage動作

#### 完了条件

- [ ] grep で `bg-blue-`, `text-blue-` 等が0件
- [ ] `#1e40af` がコード内に残っていない
- [ ] `mamiya-pmapp.vercel.app` でアプリ表示
- [ ] PWAアイコンがブランドロゴ
- [ ] PWAインストール後にスタンドアロン表示
- [ ] サイドバー・ボタン・タグが全てbrand系で統一

#### 意思決定ポイント

- **DP-P6-1**: 機能色（emerald/amber/red）は維持
  - 理由: 成功・警告・エラーの慣習色は保ったほうがアクセシビリティ的に良い
- **DP-P6-2**: 初回デプロイは骨組みのみ（コンテンツ無し）でも公開
  - 理由: フェーズ2の進捗を継続的に反映するため、早期にVercel側のCI/CDを動かす

#### 推定所要時間: 0.5日

---

## 2.7b フェーズ1.5 パイロット運用（v0.14新設）

### 2.7b.1 目的
フェーズ1骨組み完成後、**1カテゴリ（ステークホルダー）だけ完成形コンテンツを投入**し、ユーザが実運用で1〜2週間試用。設計の致命欠陥・コンテンツ品質を検証してから残カテゴリへ着手。

### 2.7b.2 タスク詳細

#### F1.5-P1 パイロット用カテゴリ選定
- 選定: **ステークホルダー**（PM試験で出題頻度高、PMBOK第7版の中心トピック）
- 担当: ユーザ判断
- 工数: 0.5日

#### F1.5-P2 パイロットノート作成
- ステークホルダーカテゴリのノート本文をフルセット作成（30セクション以上）
- フロー（v0.16: 体制変更によりGeminiレビュー廃止）:
  1. **Claude生成**（PMBOK第7版＋IPAシラバス参照）
  2. **Codex レビュー**（構造化トークン整合性、誤字脱字、コードレベルの整合性）
  3. **ユーザ最終確認**（コンテンツ妥当性、PMBOKとの整合性、表現の自然さ） → 修正反映
- 完了条件: §5.9 検証スクリプト pass + Codex レビュー完了 + ユーザ確認

#### F1.5-P3 パイロットクイズ作成
- ステークホルダーカテゴリのクイズ50問
- フロー（v0.16: 体制変更によりGeminiレビュー廃止）:
  1. **Claude生成**（ノートのキーワードを穴埋め化、誤答3つ作成）
  2. **Codex レビュー**（型整合性、choices配列の正解含有確認）
  3. **ユーザ最終確認**（誤答の妥当性、難易度バランス、解説の正確性）
- 完了条件: 50問+検証pass

#### F1.5-P4 パイロット用 公式午前II サンプル投入
- 直近1〜2年度（R6・R5）の公式午前II 25〜50問
- 独自解説を作成
- 完了条件: 10問以上で動作確認可能

#### F1.5-P5 ユーザ試用期間
- 1〜2週間ユーザが実際にアプリで学習
- フィードバック収集:
  - UX問題（操作性・分かりにくさ）
  - コンテンツ品質（誤字・解説の妥当性・難易度）
  - パフォーマンス（読み込み速度・LocalStorage容量）
  - 致命バグ
- 担当: ユーザ単独

#### F1.5-P6 フィードバック反映
- 致命バグ・UX問題を修正
- コンテンツ品質改善
- 残カテゴリ着手前の方向性確定（カテゴリ作成順序・スタイルガイド）

### 2.7b.3 Go/No-Go判定基準（フェーズ2着手判断）
- [ ] パイロット試用で致命バグ（データ消失・画面破綻）が0件
- [ ] ノート1カテゴリ・クイズ50問・公式午前II 10〜50問が動作
- [ ] ユーザフィードバック反映完了
- [ ] **No-Go時**: パイロット延長 or 設計再検討。フェーズ2は着手しない

### 2.7b.4 メリット
- 設計欠陥を早期発見（残11カテゴリの手戻り防止）
- コンテンツ生成の品質ガイドライン確立
- ステーク試験範囲の最重要カテゴリで早期に学習開始可能（ユーザ自身がアプリを使って学習も同時進行）

### 2.7b.5 担当
- F1.5-P1: ユーザ
- F1.5-P2/P3/P4: 🅒（生成）+ Codex（レビュー） + ユーザ最終確認
- F1.5-P5: ユーザ
- F1.5-P6: 🅒🅧

---

## 2.7c テスト戦略（v0.14 E2追加）

### 2.7c.1 採用方針
当初「テストなし＋QAチェックリストのみ」だったが、3視点レビューで lib層のような壊れたら致命的な部分のテスト必要性が指摘された。

**採用: lib層のみ Vitest 導入**

### 2.7c.2 対象範囲

| 対象 | テスト | 理由 |
|---|---|---|
| `src/lib/storage.ts` | ✅ ユニット | LocalStorage CRUD破損は致命 |
| `src/lib/importantMarks.ts` | ✅ ユニット | 同上 |
| `src/lib/morningRecords.ts` | ✅ ユニット | 同上 |
| `src/lib/essay.ts` | ✅ ユニット | タイマー復帰ロジックは複雑 |
| `src/lib/tracker.ts` | ✅ ユニット | NW踏襲だがprefix変更後の動作確認 |
| `src/lib/gamification.ts` | ✅ ユニット | XP計算・バッジ判定の正確性 |
| `src/lib/sync/codec.ts` | ✅ ユニット | エンコード/デコード往復一致 |
| `src/components/*` | ❌ なし | UI触れば即発覚 |
| `src/pages/*` | ❌ なし | UI触れば即発覚 |

### 2.7c.3 セットアップ

```bash
# F1-P0 で導入
npm install -D vitest @testing-library/jest-dom jsdom
```

`vite.config.ts` にtest設定追加:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### 2.7c.4 テスト例

```ts
// src/lib/importantMarks.test.ts 🟢
import { describe, it, expect, beforeEach } from 'vitest'
import { toggleImportant, isImportant, clearAllImportant } from './importantMarks'

describe('importantMarks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggleImportant でマーク追加・削除', () => {
    expect(isImportant('q-001')).toBe(false)
    expect(toggleImportant('q-001')).toBe(true)
    expect(isImportant('q-001')).toBe(true)
    expect(toggleImportant('q-001')).toBe(false)
    expect(isImportant('q-001')).toBe(false)
  })

  it('clearImportantOfMode でprefix一致のみ削除', () => {
    toggleImportant('q-001')
    toggleImportant('om-r6-q3')
    clearImportantOfMode('q-')
    expect(isImportant('q-001')).toBe(false)
    expect(isImportant('om-r6-q3')).toBe(true)
  })
})
```

### 2.7c.5 担当
- 🅒（テスト設計）+ 🅧（テストコード作成）

### 2.7c.6 工数
- F1-P0 にVitest設定追加: 1h
- 各libテスト作成（7ファイル）: 各 1〜2h = 計 7〜14h
- → フェーズ1工数の見積りに含まれる（F1-P0 4hではなく+1h必要）

---

## 2.7d save系エラー処理方針（v0.14 E4追加）

### 2.7d.1 問題
LocalStorage 5MB上限到達時、`localStorage.setItem` は `QuotaExceededError` を投げる。
- 論述本文の自動保存中に容量超過 → 保存失敗 → ユーザに気付かれず喪失

### 2.7d.2 対策
全 lib の `save` 関数を try-catch で包み、失敗時はユーザに通知。

```ts
// src/lib/storageSafe.ts 🟢（新規）
export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unknown'; error: Error }

export function safeSetItem(key: string, value: string): SaveResult {
  try {
    localStorage.setItem(key, value)
    return { ok: true }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, reason: 'quota', error: e }
    }
    console.error('[storage] saveItem failed:', e)
    return { ok: false, reason: 'unknown', error: e as Error }
  }
}

// 既存の save 関数群を safeSetItem 経由に書き換え
function saveJson<T>(key: string, value: T): SaveResult {
  return safeSetItem(key, JSON.stringify(value))
}
```

### 2.7d.3 ユーザ通知
- 容量超過時: グローバルtoastで「容量上限です。設定→データリセット または不要な論述履歴を削除してください」
- 通常エラー時: コンソール出力のみ（NW踏襲）

### 2.7d.4 担当
- 🅒（設計） + 🅧（既存save関数の書き換え）

### 2.7d.5 工数
- F1-P0 で `storageSafe.ts` 作成 + 各libのsave関数書き換え: 2〜3h

---

## 2.7e フェーズ2 計画（v0.17 新設）

### 2.7e.1 目的・前提

#### 目的
フェーズ1.5 で確立した3点セット（stakeholder ノート33セクション・クイズ50問・公式午前II R6秋期25問）をベースに、残コンテンツを完成形まで投入し v1.0.0 をリリースする。

#### F1.5-P5/P6 スキップの判断（v0.17）
- F1.5-P2/P3/P4 の Codex 構造レビューがすべて PASS（P4 は問17解説のみ修正で完了）した時点で、設計欠陥リスクは十分に低減したと判断
- ユーザ判断により F1.5-P5（1〜2週間試用）と F1.5-P6（フィードバック反映）はスキップし、F2 へ直接着手
- スキップの代償リスク: 問17類似の解説品質問題が他コンテンツにも潜在し得る → **§2.7e.3 品質ゲートで対策**

#### PMBOK版バランス方針（v0.18 修正）
- **IPA PM試験は実態として PMBOK第6版が出題の中核**（プロセス群・10知識エリア・49プロセス・ITTO形式）。シラバスはVer7.1だが、午前II/午後Iの設問は第6版用語に依拠したものが多い。
- v0.17 までは「第7版＋IPAシラバス」を主軸としていたが、v0.18 で **第6版＋第7版を各カテゴリで統合的に記述する方針に修正**。
- 統合方針:
  - 第6版「10知識エリア・49プロセス・ITTO」を試験対策の主軸として記述
  - 第7版「12原則・8パフォーマンス領域・テーラリング」を並列で記述（出題されるケース増加）
  - 第6版プロセスと第7版パフォーマンス領域の対応関係を navyItems で補足
  - 第8版追加要素は `pmbok8-diff` カテゴリで別管理（変更なし、F2-P6）
- **影響**:
  - F2-P1 各カテゴリの章構成: 第6版要素統合により 30→35〜37 セクション程度に拡張
  - stakeholder ノート（F1.5-P2 投入済み）: 第6版「ステークホルダー・マネジメント」知識エリア4プロセスを遡及補完 → **F2-P0 新設**

#### スコープと期間
- スコープ: wbs.html フェーズ2（F2-P1〜F2-P7-S3）と一致
- 期間: 27〜40 日
- 成果物: v1.0.0 正式版（Vercel 本番デプロイ）

#### 前提となる F1.5 成果物（必読・必参照）
- `docs/morning_question_authoring_rules.md` v1.0 — F2-P3 の午前II作成ルール
- `src/components/MathText.tsx` — 数式レンダラー
- `src/lib/preferences.ts` — 文字サイズ切替
- `scripts/render-morning-figures.ts` + Inkscape — SVG セルフチェックフロー
- `scripts/validate-static-data.ts` — 全データ整合性検証（basic_design §5.9）
- `tasks/codex/F1.5-P2_review.md` / `F1.5-P3_review.md` / `F1.5-P4_review.md` — Codex 指示書テンプレ
- `memory/feedback_note_markup.md` — ==赤字== / __ネイビー__ マークアップ規約

---

### 2.7e.2 タスク詳細

#### F2-P0 stakeholder ノート 第6版要素 遡及補完（0.5〜1日）  🅒🅧 + ユーザ（v0.18 新設）
- F1.5-P2 で投入済みの stakeholder ノート33セクションに、PMBOK第6版「ステークホルダー・マネジメント」知識エリア4プロセスを補完追加
- 追加対象プロセス:
  - 13.1 ステークホルダーの特定
  - 13.2 ステークホルダー・エンゲージメントの計画
  - 13.3 ステークホルダー・エンゲージメントのマネジメント
  - 13.4 ステークホルダー・エンゲージメントの監視
- 補完方針:
  - 新規セクション 2〜3 を §A または §B に追加（プロセス概要・ITTO・第7版パフォーマンス領域との対応）
  - 既存セクションの `navyItems` に「第6版では○○プロセスに相当」と補足追記
- フロー: Claude生成 → Codex レビュー → ユーザレビュー → 修正反映
- 完了条件: stakeholder ノートが第6版＋第7版を統合的にカバー + `npm run validate-data` PASS

#### F2-P1 残り11カテゴリのノート本文（7〜12日）  🅒🅧 + ユーザ
- 対象順（**PMBOK第7版章順に確定**、v0.17）:
  1. team
  2. development-approach
  3. planning
  4. project-work
  5. delivery
  6. measurement
  7. uncertainty
  8. integration
  9. governance
  10. tailoring-models
  11. service-management
- 1カテゴリあたりのフロー（F1.5-P2 stakeholder と同じ）:
  1. **Claude生成**: 章構成案 → ユーザ承認 → 本文（**PMBOK第6版＋第7版＋IPAシラバスVer7.1**ベース、35〜37セクション目安）
  2. **Codex レビュー**: 構造・トークン整合性・誤字脱字・検証スクリプト pass
  3. **ユーザレビュー**: コンテンツ妥当性・PMBOK整合（第6版／第7版両方）・表現自然さ
  4. **修正反映**（[Review] commit）
- マークアップ規約: ==赤字==（暗記対象キーワード）／__ネイビー__（構造ラベル）厳守
- カテゴリごとに第6版該当知識エリアと第7版該当パフォーマンス領域を冒頭セクションで対応付け
- 完了条件: 11カテゴリすべてで上記4ステップ完了 + `npm run validate-data` PASS
- 工数: 1カテゴリあたり 0.8〜1.1日 × 11 = 9〜13日（v0.18: 第6版要素統合により上方修正）

#### F2-P2 残り11カテゴリのクイズ 550問（5〜8日）  🅒🅧 + ユーザ
- 1カテゴリあたり50問（stakeholder と同じ規模）
- 難易度分布の目安: stakeholder の 14/26/10（難1/2/3）を参考。各カテゴリの特性に応じて調整可
- `excludeFromWritten` 判定基準: 4択でしか成立しない設問（複数選択肢の組合せ問題など）に付与
- フロー: Claude生成 → Codex レビュー（型整合性・正解含有・選択肢空でない）→ ユーザレビュー（誤答妥当性・難易度・解説）
- 完了条件: 累計 600 問（既存50 + 新規550）+ `npm run validate-data` PASS
- 工数: 1カテゴリあたり 0.5〜0.7日 × 11 = 5〜8日

#### F2-P3 公式午前II 全年度 約325問（7〜10日）  🅒🅧 + ユーザ
- 対象: H25〜現行（13年 × 平均25問）
- 投入順: **R5 → R4 → R3 → ... → H25**（新しい年度から、より試験出題傾向に近い）
- フロー: Claude OCR → Claude 独自解説 → Codex 構造レビュー → ユーザ動作確認
- **`docs/morning_question_authoring_rules.md` v1.0 厳守**
- 解説品質ゲート（最重要）:
  - 正解選択肢の説明だけでなく、**誤答選択肢ごとに「なぜ不正解か」を実選択肢文と対応させて記述**（F1.5-P4 問17 事例の再発防止）
  - 問題が「条文や原則の改変版を見抜く」型の場合、改変箇所を具体的に明示
- 図表セルフチェック: SVG 白ハロー、Inkscape PNG 目視確認
- 数式マークアップ: `^{}` / `frac{}{}` の波括弧バランス
- カテゴリタグ: 12カテゴリ + 必要に応じて individual category tweak（F1.5-P4 の Q13=tailoring-models, Q21=project-work 方式）
- 完了条件: 全年度投入完了 + 全問の構造レビュー PASS + サンプル原文照合（各年度3〜5問）
- 工数: 1年度あたり 0.6〜0.8日 × 13 = 8〜10日（OCR効率次第で短縮可）

#### F2-P4 午後I 全年度（公式解答＋配点マップ）（4〜6日）  🅒🅧
- 対象: H25〜現行（13年 × 2〜3問）
- 成果物:
  - `AfternoonProblem` インデックス: 🅧（年度・問番号・テーマ列挙、PDFリンク）
  - `OfficialAnswerSet` テキスト化: 🅒🅧（OCR は Claude、TS整形は Codex）
  - 配点マップ: 🅧（NWルール踏襲、`memory/phase2_content_creation.md`）
- フロー: Claude OCR → Codex 整形 → ユーザ動作確認

#### F2-P5 論述問題インデックス（午後II H25〜）（1日）  🅒🅧
- スコープ確認: **論述採点機能は非対応**。本タスクは「インデックス + 推奨字数」までの実装
- 成果物:
  - `EssayProblem` 一覧: 🅧（年度・問番号・テーマ列挙）
  - 推奨字数: 🅒（IPA公式指示文からの抽出）
- 完了条件: 全年度のインデックスデータ + 検証スクリプト pass

#### F2-P6 PMBOK第8版差分カテゴリ（pmbok8-diff）（1.5日）  🅒🅧 + ユーザ
- 第7版から第8版での主要変更点のみを「差分カテゴリ」として独立に追加
- カテゴリID: `pmbok8-diff`（既存12カテゴリと並列）
- 成果物: ノート（差分要素のみ、10〜15セクション）+ クイズ（10〜20問）
- 既存12カテゴリのコンテンツは第7版ベースで維持、第8版要素は本カテゴリで明示的に隔離
- ユーザ判断: 第8版で取り込む変更点の選定はユーザレビュー必須

#### F2-P7-S1 バッジ条件 PM用に再設計（0.5日）  🅒🅧
- 既知保留事項: NW踏襲のバッジ名・条件を PM 文脈に整合
- 追加バッジ候補:
  - 論述初回完了 / 論述継続（5/10/30回）/ 全カテゴリ論述網羅 / 重要マーク活用
  - 午前II 年度コンプリート / 12カテゴリ網羅
- しきい値の最終調整: 全コンテンツ規模が確定してから判定

#### F2-P7-S2 QAチェックリスト全項目消化（1日）  🅒🅧
- F1 + F2 統合 QA
- 必須項目:
  - `npm run validate-data` PASS
  - `npm run build` PASS
  - PWA インストール確認
  - LocalStorage 容量見積もり再評価（5MB 上限への余裕度）
  - IPA著作権 R1 最終確認（問題文の原文維持・独自解説の独立性）
  - 全コンテンツから 3〜5% スポットサンプリング再チェック

#### F2-P7-S3 v1.0.0 リリース（0.5日）  🅒
- 致命バグ修正
- `vercel --prod` デプロイ
- README / requirements / basic_design / detailed_design の版番号確定（v1.0）

---

### 2.7e.3 品質ゲート（F1.5-P5/P6 スキップの代替策）

F1.5-P5（1〜2週間試用）と F1.5-P6（フィードバック反映）をスキップしたため、各 P 内に以下の品質ゲートを設ける。

#### 全タスク共通
- `npm run validate-data` PASS
- `npm run build` PASS
- コミット prefix 規約遵守（[C] / [X] / [Review] / [Doc] / [Fix]）
- ==赤字== / __ネイビー__ マークアップ規約遵守（**`docs/note_markup_rules.md` v1.0 が正本**）
- **マークアップ整合性チェック必須**（v0.19 追加）:
  - 各 items 文字列について `__` / `==` の出現回数が偶数（または 0）
  - 全角イコール `＝` の混入なし
  - `===` / `___` / `====` / `____` のような連続記号なし

#### F2-P1 ノート
- 章構成案を作成 → ユーザ承認 → 本文生成（stakeholder と同じプロセス）
- 1カテゴリ完成ごとにユーザが Vercel preview で動作確認
- Codex レビュー Step 3 で `docs/note_markup_rules.md` §5 のチェックリストを必ず実行

#### F2-P2 クイズ
- 各問の「誤答3つが実選択肢として成立しているか」を Codex がチェック
- **解説と正解／誤答の対応関係チェック**（F1.5-P4 問17 事例の防止）

#### F2-P3 公式午前II ★最重要ゲート
1. **正解インデックス**: IPA解答例と全問突合
2. **原文照合**: 各年度から 3〜5問サンプリングして PDF と目視照合
3. **解説品質**: 誤答選択肢の対応関係を必ず実選択肢文と照合（問17事例の再発防止）
4. **図表（SVG/table）**: 白ハロー、Inkscape PNG セルフチェック
5. **数式マークアップ**: 波括弧バランス検証
6. **カテゴリ分布**: 12カテゴリ + service-management に妥当分散

#### F2-P7-S2 横断
- 全コンテンツから 3〜5% スポットサンプリングして再チェック
- 特に F2-P3 の解説品質を重点確認

---

### 2.7e.4 Codex 委任戦略

#### 委任パッケージ粒度
| タスク | 1パッケージ単位 | パッケージ数 |
|---|---|---|
| F2-P1 ノート | 1カテゴリ（30セクション） | 11 |
| F2-P2 クイズ | 1カテゴリ（50問） | 11 |
| F2-P3 午前II | 1年度（約25問） | 13 |
| F2-P4 午後I | 1年度（2〜3問） | 13 |

#### 指示書テンプレ
- F1.5-P2/P3/P4 で確立した指示書フォーマット（detailed_design 付録A/B）を踏襲
- 配置:
  - 指示書: `tasks/codex/F2-P{n}_{category|year}.md`
  - レビュー記録: `tasks/reviews/F2-P{n}_{category|year}_codex_review.md`
- F2-P3 は **`docs/morning_question_authoring_rules.md` v1.0 への参照を必須記載**

#### コミットprefix（既存ルール踏襲）
- `[C]` Claude単独
- `[X]` Codex単独
- `[Review]` Codex作業のClaudeレビュー後修正
- `[Doc]` ドキュメント更新
- `[Fix]` バグ修正

---

### 2.7e.5 リスク

| ID | リスク | 影響 | 対策 |
|---|---|---|---|
| F2-R1 | IPA著作権（過去問の量がF1.5の13倍に） | 中 | 問題文・選択肢は原文維持、解説は独自生成、`sourceUrl` で IPA公式PDFへ誘導。`memory/risks.md` R1 継続。 |
| F2-R2 | コンテンツ品質問題が大量に潜在（F1.5-P5/P6 スキップの代償） | 中 | §2.7e.3 品質ゲート強化、各 P 完了時にユーザ動作確認必須、F2-P7-S2 で横断スポットチェック |
| F2-R3 | PMBOK第7版/第8版の混在による混乱 | 低 | 第7版ベースで統一、第8版は `pmbok8-diff` カテゴリで明示的に隔離 |
| F2-R4 | LocalStorage 5MB 上限到達 | 中 | F2-P7-S2 で容量見積もり再評価、超過時は §2.7d save系エラー処理で対応 |
| F2-R5 | Codex委任の偏り（Claude負荷集中） | 中 | F1.5 で確立した分担を維持（OCR・整形は Codex、知識生成は Claude） |
| F2-R6 | 工数オーバー | 中 | カテゴリ単位の中間完了で随時 vercel デプロイ可能（v0.x として段階公開） |
| F2-R7 | PMBOK改訂・IPAシラバス改訂の追従 | 低 | F2 完了時点でのスナップショット版を v1.0.0、改訂対応は v1.x で別途 |
| F2-R8 | PMBOK第6版／第7版の併記による情報過多・混乱（v0.18） | 中 | 各セクション冒頭で第6版／第7版どちらの観点かを明示。両版に共通の理論（タックマン・モチベーション理論等）は版を区別せず記述。試験頻出（==赤字==）は第6版用語を優先的に付与 |

---

## 2.8 フェーズ2 タスク概要

> v0.17 で §2.7e に詳細化済み。v0.18 で F2-P0 stakeholder 遡及補完を追加。本節は概要のみを残す。
> 詳細は [§2.7e フェーズ2 計画](#27e-フェーズ2-計画v017-新設) を参照。

- F2-P0: stakeholder ノート 第6版要素 遡及補完（0.5〜1日、v0.18 新設）
- F2-P1: 残り11カテゴリのノート（PMBOK第6版＋第7版、PMBOK第7版章順、9〜13日）
- F2-P2: 残り11カテゴリのクイズ 550問（5〜8日）
- F2-P3: 公式午前II 全年度 約325問（7〜10日）
- F2-P4: 午後I 全年度（公式解答＋配点マップ、4〜6日）
- F2-P5: 論述問題インデックス（午後II H25〜、1日）
- F2-P6: PMBOK第8版差分カテゴリ（pmbok8-diff、1.5日）
- F2-P7-S1: バッジ条件 PM用に再設計（0.5日）
- F2-P7-S2: QAチェックリスト全項目消化（1日）
- F2-P7-S3: v1.0.0 リリース（0.5日）

---

## 2.9 役割分担サマリー表

各タスクの担当区分を一覧化:

### フェーズ1

| タスク | Claude単独 | Codex単独 | 協業 |
|---|---|---|---|
| F1-P0 スキャフォールド | Step 1, 3, 8, 9 | Step 2, 4, 5, 6, 7, 10, 11 | — |
| F1-P1 カテゴリ・サイドバー | NoteDetail スタブ化 | categories, NOTE_CATEGORY_IDS | Layout, Home |
| F1-P2 重要マーク | Quiz改修, ImportantMarks | types, Toggle, Settings, App, sync | importantMarks.ts |
| F1-P3 午後I 骨組み | AfternoonProblems G2削除 | types, data 3ファイル | — |
| F1-P4 公式午前II 骨組み | Quiz, Session画面 | types, data, Summary, App, sync | morningRecords.ts |
| F1-P5 論述 骨組み | essay.ts, Timer, Training画面 | 型, data, 3 components, 2 pages | — |
| F1-P6 ブランド・デプロイ | badges整理, Vercel初期 | 青系置換 | — |

### フェーズ2

| タスク | Claude単独 | Codex単独 | 協業 |
|---|---|---|---|
| F2-P1 ノート | 全コンテンツ生成 | — | — |
| F2-P2 クイズ問題 | 全問題生成 | — | — |
| F2-P3 公式午前II データ | OCR, 解説生成, タグ付け | TS整形 | OCR→整形 |
| F2-P4 午後I データ | OCR | 配点マップ, インデックス | 公式解答テキスト化 |
| F2-P5 論述インデックス | 推奨字数抽出 | 一覧データ作成 | — |
| F2-P6 仕上げ | バッジ条件, デプロイ, バグ修正 | QA実行 | — |

### Codex作業 vs Claude作業 の比率（概算）

- **F1全体（骨組み）**: Codex 約 **60%** / Claude 約 **40%**
- **F2全体（コンテンツ）**: Codex 約 **20%** / Claude 約 **80%**
- **プロジェクト全体**: Codex 約 **35%** / Claude 約 **65%**

> 工数概算からの比率。Codexで節約できるトークンは主にフェーズ1の機械作業に集中。フェーズ2は知識生成中心のためClaude依存。

---

## 3. 共通ライブラリ詳細

`src/lib/` 配下のモジュール設計。NW流用部分は最小限の差分提示、PM新規部分は完全な疑似コード（または実装コード）を提示する。
F1-P0〜F1-P5のCodex/Claude委譲時、本章を「実装の根拠」として参照する。

### 3.1 lib モジュール一覧

| モジュール | 流用区分 | 担当 | NW実績行数 | 役割 |
|---|---|---|---|---|
| `storage.ts` | 🟡 部分改変 | 🅧 (mechanical) | 237 | 全体的なLocalStorage CRUD（answer_records/user_progress/study_sessions/bookmarks/note_understanding/question_mastery） |
| `tracker.ts` | 🟡 部分改変 | 🅧 (mechanical) | 103 | 午後I 採点記録・学習計画日 |
| `activityLog.ts` | 🟡 拡張 | 🅒🅧 | 224 | 学習活動ログ・日次集計 |
| `gamification.ts` | 🟡 拡張 | 🅒 | 398 | XP計算・バッジ判定・レベル算出 |
| `answerTable.ts` | 🔵 完全流用 | — | 63 | 解答記録のサマリ作成（NW踏襲） |
| `sync/adapters.ts` | 🟡 拡張 | 🅒🅧 | 415 | 同期対象キー一覧・マージロジック |
| `sync/codec.ts` | 🔵 完全流用 | — | 428 | lz-stringエンコード・QR分割 |
| `sync/device.ts` | 🔵 完全流用 | — | 110 | デバイスID管理 |
| `sync/events.ts` | 🔵 完全流用 | — | 124 | 同期イベント生成 |
| `sync/merge.ts` | 🔵 完全流用 | — | 69 | データマージユーティリティ |
| `sync/package.ts` | 🔵 完全流用 | — | 268 | 同期パッケージのまとめ |
| `sync/types.ts` | 🟡 部分改変 | 🅧 | 94 | NWSP-SYNC → PMAP-SYNC のprefix変更 |
| `importantMarks.ts` | 🟢 新規 | 🅒🅧 | 0 | 重要マーク CRUD |
| `morningRecords.ts` | 🟢 新規 | 🅒🅧 | 0 | 公式午前II 解答履歴 CRUD |
| `essay.ts` | 🟢 新規 | 🅒 | 0 | 論述 Attempts / Plans / Active Session CRUD |

### 3.2 `storage.ts` 🟡

#### 役割
クイズ系の中心LocalStorage CRUD。answer_records / user_progress / study_sessions / bookmarks / note_understanding / question_mastery を扱う。

#### 公開API（NWと同一シグネチャ）

```ts
// 解答記録
export function getAnswerRecords(): AnswerRecord[]
export function addAnswerRecord(record: AnswerRecord): void

// カテゴリ別進捗（4択／記述別カウント、派生フィールドあり）
export function getAllProgress(): UserProgress[]
export function getProgress(topicId: string): UserProgress
export function updateProgress(topicId: string, isCorrect: boolean, mode?: AnswerMode): void
export function toggleBookmark(topicId: string): void

// 学習セッション
export function getStudySessions(): StudySession[]
export function saveStudySession(session: StudySession): void

// ブックマーク（問題単位）
export function getBookmarks(): Bookmark[]
export function toggleQuestionBookmark(questionId: string): boolean

// 統計
export function calcCorrectRate(topicId: string): number
export function calcCorrectRateByMode(topicId: string, mode: AnswerMode): number | null

// リセット
export function resetAllData(): void

// 問題ごとの習得状態
export type MasteryState = 'consecutive' | 'correct' | 'incorrect'
export function getQuestionMastery(): Record<string, MasteryState>
export function updateQuestionMastery(questionId: string, mode: AnswerMode, isCorrect: boolean): void

// ノート理解度
export type UnderstandingLevel = 'green' | 'yellow' | 'red'
export function getNoteUnderstanding(): Record<string, UnderstandingLevel>
export function setNoteUnderstanding(categoryId: string, sectionIndex: number, level: UnderstandingLevel | null): void
```

#### 内部キー定数

```ts
const KEYS = {
  ANSWER_RECORDS: 'pmap:answer_records',
  USER_PROGRESS: 'pmap:user_progress_v2',
  STUDY_SESSIONS: 'pmap:study_sessions',
  BOOKMARKS: 'pmap:bookmarks',
  SIDEBAR_OPEN: 'pmap:sidebar_open',   // ★F1-P-1で追加。NWは 'nwsp_sidebar_open' (アンダースコア) だが PM はコロン統一
} as const

const QUESTION_MASTERY_KEY = 'pmap:question_mastery'
const NOTE_UNDERSTANDING_KEY = 'pmap:note_understanding'
```

> **NW の `USER_PROGRESS_LEGACY` / `clearLegacyProgress()` は PM では不要**（新規アプリのため旧スキーマが存在しない）。F1-P0 のNW→PMコピー時に削除する。
> 参考: NW `src/lib/storage.ts` line 11, 41-50

#### NWからの差分（🅧 機械置換 + 🅒 一部手動修正）

| 変更内容 | NW | PM |
|---|---|---|
| キーprefix | `nwsp:` | `pmap:` |
| サイドバー開閉状態キー | `nwsp_sidebar_open`（アンダースコア区切り） | `pmap:sidebar_open`（コロン統一）— F1-P0 で **Layout.tsx の STORAGE_KEY 定数を手動修正** |
| `USER_PROGRESS_LEGACY` キー | 存在（旧スキーマ削除用） | **削除**（PM新規アプリのため） |
| `AnswerMode` 型 | `'multiple-choice' \| 'written'` | （変更なし） |
| `resetAllData` で削除する追加キー | `'nwsp:note_understanding'` `'nwsp:question_mastery'` | `'pmap:note_understanding'` `'pmap:question_mastery'` + 新規 (§3.4-3.5) |

#### 副作用一覧（F1-P-1 で明文化）

| 関数 | 内部で呼ぶ副作用 | 用途 |
|---|---|---|
| `setNoteUnderstanding(categoryId, sectionIndex, level)` | `touchNoteUnderstandingSyncMeta(categoryId, sectionIndex)` | 同期メタの更新（同期時にこの key の updatedAt を見て差分マージ） |

> **重要**: PM 実装で `setNoteUnderstanding` をテスト stub 化する場合、`touch*SyncMeta` も併せてモックする必要がある。

#### `updateQuestionMastery` の状態遷移（F1-P-1 で明文化）

`questionId:mode` をキー、状態 `'consecutive' | 'correct' | 'incorrect'` を値として持つ Map。1解答ごとに以下のテーブルで遷移:

| 現在の状態 | 正解 (`isCorrect=true`) | 不正解 (`isCorrect=false`) |
|---|---|---|
| 未登録（初挑戦） | `correct` | `incorrect` |
| `correct` | `consecutive`（昇格） | `incorrect`（リセット） |
| `consecutive` | `consecutive`（維持） | `incorrect`（リセット） |
| `incorrect` | `correct`（復帰） | `incorrect`（維持） |

> NW `src/lib/storage.ts` line 197-207 のロジックそのまま。「2回連続正解で `consecutive`、以降は連続正解中のみ維持」がポイント。バッジ判定の「カテゴリ達成率」はこの状態を見る（§3.7 `countMasteredCategories` 参照）。

#### `pmap:bookmarks` の運用整理（basic_design.md §4.3 約束分の決着）

NWの `Bookmark` 機能と PMの「重要マーク」機能（§3.3）は役割が重複する。整理結果:

| 項目 | 扱い |
|---|---|
| `UserProgress.isBookmarked` （カテゴリ単位ブックマーク） | **PM版でも維持**。重要マークとは別概念（カテゴリレベルのお気に入り） |
| `pmap:bookmarks`（`Bookmark[]`、問題単位ブックマーク） | **PM版では実質的に未使用**。重要マーク機能 (`pmap:important_questions`) に統合される |
| `getBookmarks()` / `toggleQuestionBookmark()` API | **コードは残置**（`storage.ts` を大幅変更しないため）するが、PM のUIからは**呼び出さない** |
| 既存の問題ブックマーク用UI（NWに残存があれば） | 削除（F1-P2 で問題画面に置く `<ImportantToggle>` がブックマーク機能を兼ねる） |

**Why**: 重要マークと問題ブックマークが二重に存在するとユーザを混乱させる。一方、`UserProgress.isBookmarked`（カテゴリレベル）はカテゴリ別学習画面で「気になるカテゴリ」を印付ける用途として有効。
**Codex作業時の注意**: storage.ts 内の `getBookmarks` / `toggleQuestionBookmark` は型定義のため残し、削除しない。新規UIから参照しないことだけ徹底する。

#### 実装ノート

`resetAllData` は§3.4 morningRecords / §3.5 essay の追加後、それらのキーも削除リストに加える必要がある。F1-P4 / F1-P5 の最終ステップで追記。

```ts
export function resetAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  localStorage.removeItem(QUESTION_MASTERY_KEY)
  localStorage.removeItem(NOTE_UNDERSTANDING_KEY)
  localStorage.removeItem('pmap:tracker:records')
  localStorage.removeItem('pmap:tracker:plans')
  localStorage.removeItem('pmap:important_questions')   // F1-P2 で追加
  localStorage.removeItem('pmap:morning:records')        // F1-P4 で追加
  localStorage.removeItem('pmap:essay:attempts')         // F1-P5 で追加
  localStorage.removeItem('pmap:essay:plans')            // F1-P5 で追加
  localStorage.removeItem('pmap:essay:active')           // F1-P5 で追加
  localStorage.removeItem('pmap:activityLog')
  localStorage.removeItem('pmap:gamification')
  localStorage.removeItem('pmap:sync:daily_xp_ledger')
  localStorage.removeItem('pmap:sync:meta')
  localStorage.removeItem('pmap:sync:note_meta')
  localStorage.removeItem('pmap:sync:plan_meta')
}
```

### 3.3 `importantMarks.ts` 🟢

#### 役割
ユーザが手動で問題に重要マークを付ける機能のCRUD。クイズ問題（`q-*`）と公式午前II問題（`om-*`）の両方を1つの配列で管理する。

#### LocalStorageキー
- `pmap:important_questions` : `string[]` (questionId の配列)

#### 公開API

```ts
/** マーク済み全IDを取得（クイズ・公式午前II混在） */
export function getImportantIds(): string[]

/** 指定IDがマークされているか */
export function isImportant(questionId: string): boolean

/** トグル。戻り値=新状態（true=マーク中） */
export function toggleImportant(questionId: string): boolean

/** 全解除 */
export function clearAllImportant(): void

/** プレフィックス指定での部分解除（'q-' or 'om-'） */
export function clearImportantOfMode(prefix: 'q-' | 'om-'): void
```

#### 完全実装コード

```ts
const KEY = 'pmap:important_questions'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

function save(ids: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function getImportantIds(): string[] {
  return load()
}

export function isImportant(questionId: string): boolean {
  return load().includes(questionId)
}

export function toggleImportant(questionId: string): boolean {
  const ids = load()
  const idx = ids.indexOf(questionId)
  if (idx >= 0) {
    ids.splice(idx, 1)
    save(ids)
    return false
  }
  ids.push(questionId)
  save(ids)
  return true
}

export function clearAllImportant(): void {
  save([])
}

export function clearImportantOfMode(prefix: 'q-' | 'om-'): void {
  save(load().filter((id) => !id.startsWith(prefix)))
}
```

#### 担当
- ファイル新規作成: 🅧（コード提示済み、Codexがそのまま投入）
- 投入後Claudeレビュー必須（観点: 型・LocalStorageキー・配列重複ガード）

### 3.4 `morningRecords.ts` 🟢

#### 役割
公式午前II の解答履歴 CRUD。問題ごとの最新成績・年度別正答率を算出。

#### LocalStorageキー
- `pmap:morning:records` : `MorningRecord[]`

#### 公開API

```ts
import type { MorningRecord } from '../types'

/** 全記録読み込み */
export function loadMorningRecords(): MorningRecord[]

/** 記録追加（id/answeredAt はライブラリ側で生成） */
export function addMorningRecord(input: {
  questionId: string
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
}): MorningRecord

/** 全削除（resetAllDataから呼ばれる） */
export function clearMorningRecords(): void

/** 年度別正答率（未挑戦は null） */
export function getCorrectRateByYear(year: string, allQuestions: OfficialMorningQuestion[]): number | null

/** 全体正答率（未挑戦は null） */
export function getCorrectRateOverall(): number | null

/** 指定問題の最新記録（最大 limit 件） */
export function getRecentAttempts(questionId: string, limit?: number): MorningRecord[]

/** 指定問題の最新正誤（未挑戦は null） */
export function getLastResult(questionId: string): boolean | null
```

#### 完全実装コード

```ts
import type { MorningRecord, OfficialMorningQuestion } from '../types'

const KEY = 'pmap:morning:records'

function load(): MorningRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(records: MorningRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records))
}

export function loadMorningRecords(): MorningRecord[] {
  return load()
}

export function addMorningRecord(input: {
  questionId: string
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
}): MorningRecord {
  const record: MorningRecord = {
    id: crypto.randomUUID(),
    questionId: input.questionId,
    selectedIndex: input.selectedIndex,
    isCorrect: input.isCorrect,
    answeredAt: new Date().toISOString(),
  }
  const records = load()
  records.push(record)
  save(records)
  return record
}

export function clearMorningRecords(): void {
  save([])
}

export function getCorrectRateByYear(
  year: string,
  allQuestions: OfficialMorningQuestion[],
): number | null {
  const yearQids = new Set(
    allQuestions.filter((q) => q.year === year).map((q) => q.id)
  )
  const yearRecords = load().filter((r) => yearQids.has(r.questionId))
  if (yearRecords.length === 0) return null
  // 各問題は最新の解答を採用
  const latestByQ = new Map<string, MorningRecord>()
  for (const r of yearRecords) {
    const prev = latestByQ.get(r.questionId)
    if (!prev || r.answeredAt > prev.answeredAt) {
      latestByQ.set(r.questionId, r)
    }
  }
  const correct = Array.from(latestByQ.values()).filter((r) => r.isCorrect).length
  return Math.round((correct / latestByQ.size) * 100)
}

export function getCorrectRateOverall(): number | null {
  const records = load()
  if (records.length === 0) return null
  const latestByQ = new Map<string, MorningRecord>()
  for (const r of records) {
    const prev = latestByQ.get(r.questionId)
    if (!prev || r.answeredAt > prev.answeredAt) {
      latestByQ.set(r.questionId, r)
    }
  }
  const correct = Array.from(latestByQ.values()).filter((r) => r.isCorrect).length
  return Math.round((correct / latestByQ.size) * 100)
}

export function getRecentAttempts(questionId: string, limit = 10): MorningRecord[] {
  return load()
    .filter((r) => r.questionId === questionId)
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .slice(0, limit)
}

export function getLastResult(questionId: string): boolean | null {
  const recent = getRecentAttempts(questionId, 1)
  return recent.length > 0 ? recent[0].isCorrect : null
}
```

#### 担当
- ファイル新規作成: 🅒🅧（Codexがコード投入、Claudeが正答率計算ロジックをレビュー）
- レビュー観点: 「最新の解答を採用」のロジック整合・空配列ガード

### 3.5 `essay.ts` 🟢

#### 役割
論述トレーニングの3種データを扱う:
1. **EssayAttempt[]**: 完了した練習履歴
2. **Plans**: 学習計画日（problemId → YYYY-MM-DD）
3. **EssayActiveSession**: 練習中の下書き（離脱復帰用、明示保存により上書きされる）

#### LocalStorageキー
- `pmap:essay:attempts` : `EssayAttempt[]`
- `pmap:essay:plans` : `Record<string, string>`
- `pmap:essay:active` : `EssayActiveSession | null`

#### 公開API

```ts
import type { EssayAttempt, EssayActiveSession, SetsumonLabel } from '../types'

// === Attempts ===
export function loadAttempts(): EssayAttempt[]
export function getAttemptsByProblem(problemId: string): EssayAttempt[]
export function getAttempt(id: string): EssayAttempt | null
export function saveAttempt(attempt: EssayAttempt): void
export function deleteAttempt(id: string): void

// === Plans ===
export function loadPlans(): Record<string, string>
export function setPlan(problemId: string, dateYmd: string): void
export function removePlan(problemId: string): void

// === Active session（離脱復帰用、設問ごと「下書き保存」で更新） ===
export function loadActive(): EssayActiveSession | null
export function saveActive(session: EssayActiveSession): void
export function clearActive(): void

/**
 * アクティブセッションの累積経過秒を計算。
 * 一時停止中は accumulatedSec をそのまま返し、
 * 動作中は accumulatedSec + (now - startedAt再開時刻) を返す。
 */
export function elapsedSecOf(session: EssayActiveSession): number

/** 全削除（resetAllDataから） */
export function clearEssayAll(): void
```

#### 完全実装コード（タイマー復帰ロジック含む）

```ts
import type { EssayAttempt, EssayActiveSession, SetsumonLabel } from '../types'

const ATTEMPTS_KEY = 'pmap:essay:attempts'
const PLANS_KEY = 'pmap:essay:plans'
const ACTIVE_KEY = 'pmap:essay:active'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// === Attempts ===
export function loadAttempts(): EssayAttempt[] {
  const v = loadJson<unknown>(ATTEMPTS_KEY, [])
  return Array.isArray(v) ? (v as EssayAttempt[]) : []
}

export function getAttemptsByProblem(problemId: string): EssayAttempt[] {
  return loadAttempts()
    .filter((a) => a.problemId === problemId)
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
}

export function getAttempt(id: string): EssayAttempt | null {
  return loadAttempts().find((a) => a.id === id) ?? null
}

export function saveAttempt(attempt: EssayAttempt): void {
  const attempts = loadAttempts()
  const idx = attempts.findIndex((a) => a.id === attempt.id)
  if (idx >= 0) attempts[idx] = attempt
  else attempts.push(attempt)
  saveJson(ATTEMPTS_KEY, attempts)
}

export function deleteAttempt(id: string): void {
  saveJson(ATTEMPTS_KEY, loadAttempts().filter((a) => a.id !== id))
}

// === Plans ===
export function loadPlans(): Record<string, string> {
  const v = loadJson<unknown>(PLANS_KEY, {})
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {}
}

export function setPlan(problemId: string, dateYmd: string): void {
  const plans = loadPlans()
  plans[problemId] = dateYmd
  saveJson(PLANS_KEY, plans)
}

export function removePlan(problemId: string): void {
  const plans = loadPlans()
  delete plans[problemId]
  saveJson(PLANS_KEY, plans)
}

// === Active session ===
export function loadActive(): EssayActiveSession | null {
  return loadJson<EssayActiveSession | null>(ACTIVE_KEY, null)
}

export function saveActive(session: EssayActiveSession): void {
  saveJson(ACTIVE_KEY, session)
}

export function clearActive(): void {
  localStorage.removeItem(ACTIVE_KEY)
}

/**
 * 経過秒の計算ロジック。
 *
 * EssayActiveSession のフィールド意味（basic_design.md §4.2）:
 *   startedAt:     最初に開始した時刻（参考用、表示などに使用）
 *   accumulatedSec: 一時停止までの確定経過秒
 *   pausedAt:      現在一時停止中なら ISO8601、動作中なら null
 *   lastResumedAt: 最後の再開時刻（動作中の経過秒計算用）。初回開始時は startedAt と同値
 *
 * UI側のタイマー操作フロー:
 *   - 開始時: startedAt=now, lastResumedAt=now, accumulatedSec=0, pausedAt=null
 *   - 一時停止時:
 *       accumulatedSec += (now - lastResumedAt) [秒換算]
 *       pausedAt = now
 *       lastResumedAt = null
 *   - 再開時:
 *       lastResumedAt = now
 *       pausedAt = null
 */
export function elapsedSecOf(session: EssayActiveSession): number {
  if (session.pausedAt !== null || session.lastResumedAt === null) {
    // 一時停止中: 確定済みの累積秒のみ
    return session.accumulatedSec
  }
  // 動作中: lastResumedAt からの経過を accumulatedSec に加算
  const lastResumedMs = new Date(session.lastResumedAt).getTime()
  const additionalSec = Math.max(0, Math.floor((Date.now() - lastResumedMs) / 1000))
  return session.accumulatedSec + additionalSec
}

// === 全削除 ===
export function clearEssayAll(): void {
  localStorage.removeItem(ATTEMPTS_KEY)
  localStorage.removeItem(PLANS_KEY)
  localStorage.removeItem(ACTIVE_KEY)
}
```

#### EssayActiveSession 型（basic_design.md v0.6 で確定）

basic_design.md §4.2 で `lastResumedAt: string | null` を正式追加済み（v0.6）。
本 §3.5 の `elapsedSecOf` はこの型に準拠して実装する。

#### 担当
- 🅒（Claude単独）: タイマー復帰ロジック・active session管理は誤実装で経過時間ズレが起きやすい

### 3.6 `tracker.ts` 🟡

NW踏襲。LocalStorageキーを `nwsp:tracker:*` → `pmap:tracker:*` に置換 + F1-P-1 で新規ヘルパー1件追加。

#### 公開API（NW踏襲 + PM追加）

```ts
export interface PracticeRecord {
  id: string
  problemId: string
  date: string                  // 'YYYY-MM-DD'
  score: number
  memo?: string
}

export function loadRecords(): PracticeRecord[]
export function addRecord(data: Omit<PracticeRecord, 'id'>): PracticeRecord
export function deleteRecord(id: string): void

export function loadPlans(): Record<string, string>
export function setPlan(problemId: string, date: string): void
export function removePlan(problemId: string): void

export function getMaxScore(section: 'PM1'): number   // 午後I 満点

// ★PM追加（F1-P-1, D-UI-03 対応）
/** 採点完了時のスナップショット解答（pmap:savedAnswers:<recordId>）が存在するか */
export function savedAnswersExists(recordId: string): boolean
```

> **D-UI-03 対応**: NW の `AfternoonProblems.tsx` line 321 では `localStorage.getItem('nwsp:savedAnswers:${r.id}')` を直接呼んでいたが、設計原則「キー定義は lib に集約」のため PM では `savedAnswersExists` ヘルパーを tracker.ts に追加し、UI からはこれを呼ぶ。

#### 副作用一覧（F1-P-1 で明文化）

| 関数 | 内部で呼ぶ副作用 | 用途 |
|---|---|---|
| `setPlan(problemId, date)` | `touchAfternoonPlanSyncMeta(problemId)` | 同期メタの更新 |
| `removePlan(problemId)` | `touchAfternoonPlanSyncMeta(problemId)` | 同期メタの更新（削除も差分マージ対象） |

#### NWからの差分

| 変更内容 | NW | PM |
|---|---|---|
| キー | `nwsp:tracker:records` `nwsp:tracker:plans` | `pmap:tracker:records` `pmap:tracker:plans` |
| `getMaxScore` 引数 | `'G1' \| 'G2'` | `'PM1'` のみ |
| `getMaxScore` 戻り値 | G1=50, G2=100 | PM1=100（仮値、F2-P4で確認） |
| `savedAnswersExists` ヘルパー | 無し（UI 側で直接 `localStorage.getItem` を呼ぶ） | **新規追加**（キー定義の集約） |

#### 担当
- 🅧（キー prefix の機械置換）
- 🅒（`savedAnswersExists` ヘルパー追加・UI 側参照箇所の差し替え）

### 3.7 `gamification.ts` 🟡

#### 役割
XP計算・バッジ判定・レベル算出。NWロジックを踏襲し、PM固有の差分を適用。

#### NWからの主な差分

| 項目 | NW | PM |
|---|---|---|
| LocalStorageキー | `nwsp:gamification` | `pmap:gamification` |
| `AnswerEvent.isImportant` | 静的フラグ（`Question.isImportant`）由来 | **呼び出し側で `importantMarks.isImportant(questionId)` を実行し引数で渡す**（API互換維持・calcXpはpureに保つ） |
| カテゴリ参照 | NW 19カテゴリ | PM 12カテゴリ |
| 午後区分参照 | G1/G2 | PM1のみ |
| 公式午前II対応 | なし | **`AnswerEvent.mode = 'morning'` 追加** |
| 論述対応 | なし | **`applyEssayComplete(payload): EssayGamificationResult` 追加** |
| バッジ | 477行（NW固有） | NWからコピー後F2-P6で再設計 |

#### 公開API（NW踏襲＋追加）

```ts
import type { BadgeDefinition } from '../data/badges'

// === 既存（NW踏襲） ===
export interface GamificationState { /* NW踏襲 */ }
export interface AnswerEvent {
  questionId: string
  topicId: string
  isCorrect: boolean
  mode: 'multiple-choice' | 'written' | 'morning'   // ★PM拡張
  difficulty: number
  isImportant: boolean   // ★呼び出し側で importantMarks.isImportant(questionId) を実行して渡す
}
export interface AnswerGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

export function loadGamification(): GamificationState
export function applyAnswer(event: AnswerEvent): AnswerGamificationResult
export function applyAfternoonRecord(score: number, problemId: string): AfternoonGamificationResult

// === 新規（PM追加） ===
export interface EssayGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

/** 論述完了時にXP+200を加算、バッジ判定 */
export function applyEssayComplete(payload: {
  problemId: string
  attemptId: string
  categoryIds: string[]
}): EssayGamificationResult

export interface NoteCheckGamificationResult {
  xpGained: number
  newBadges: BadgeDefinition[]
  didLevelUp: boolean
  newLevel: number
  newXp: number
}

/**
 * ノート理解度設定時にXP加算、バッジ判定。
 * NWでは addActivityEvent 内でXP加算していたが、
 * D2-4 の「XP発生源単一化」原則のためここに集約する。
 */
export function applyNoteCheck(payload: {
  categoryId: string
  sectionIndex: number
  level: 'green' | 'yellow' | 'red'
}): NoteCheckGamificationResult
```

#### NoteCheck XPルール

| 理解度 | XP |
|---|---|
| `green`（理解した） | 5 |
| `yellow`（うろ覚え） | 3 |
| `red`（わからない） | 1 |

> 同一セクションで複数回設定変更してもXPは累積（NW踏襲）。バッジ判定はnoteセクション全体の覆い率を見る。

#### XP計算式（NW踏襲＋拡張）

```ts
function calcXp(event: AnswerEvent, newStreak: number): number {
  // ベースXP
  let xp: number
  if (event.mode === 'written') xp = 20      // 記述: 20
  else if (event.mode === 'morning') xp = 5  // ★公式午前II: 5（4択より少し高い）
  else xp = 3                                 // 4択: 3

  // 難易度ボーナス（公式午前IIには適用しない）
  if (event.mode !== 'morning') {
    if (event.difficulty === 2) xp += 2
    if (event.difficulty === 3) xp += 5
  }

  // 重要マークボーナス（呼び出し側で動的取得済み）
  if (event.isImportant) xp += 5

  // 連続正解ボーナス（NW踏襲）
  if (newStreak >= 75) xp += 200
  else if (newStreak >= 30) xp += 75
  else if (newStreak >= 10) xp += 20
  else if (newStreak >= 5)  xp += 10

  return xp
}

// 論述完了固定XP
const ESSAY_COMPLETE_XP = 200
```

#### PM1（午後I）XP計算式（F1-P-1 で確定、NW G2式を流用）

`applyAfternoonRecord(score, problemId)` 内で使用。NW の `recordAfternoonXp` 内 G2 ロジック（100点満点用）をそのまま採用。F2-P4 でコンテンツ確定後に再調整可能。

```ts
function calcPm1Xp(score: number): number {
  if (score < 40)      return score * 3     // 0-39点: ×3
  if (score < 60)      return score * 4     // 40-59点: ×4
  if (score < 80)      return score * 8     // 60-79点: ×8
  return Math.min(score * 15, 1500)         // 80点以上: ×15、上限 1500
}
```

| スコア帯 | 倍率 | 例（score=50） | 例（score=80） |
|---|---|---|---|
| 0-39点 | ×3 | — | — |
| 40-59点 | ×4 | 200 XP | — |
| 60-79点 | ×8 | — | — |
| 80点以上 | ×15（上限1500） | — | 1200 XP |

> NW参考: `src/lib/gamification.ts` line 341-352 の G2 分岐。PM ではこの式 1本のみ。

#### 呼び出し側パターン（参考）

```ts
// クイズ画面・公式午前II画面で applyAnswer を呼ぶときのテンプレ
import { applyAnswer } from '../lib/gamification'
import { isImportant } from '../lib/importantMarks'

const result = applyAnswer({
  questionId: q.id,
  topicId: q.topicId,
  isCorrect,
  mode,                           // 'multiple-choice' | 'written' | 'morning'
  difficulty: q.difficulty,
  isImportant: isImportant(q.id), // ★ここで動的取得
})
```

#### XP発生源の単一化（重要）

**XPを加算するのは `gamification.ts` の `apply*` 関数のみ**。
- `applyAnswer` / `applyAfternoonRecord` / `applyEssayComplete` の戻り値 `xpGained` がXP増分の真値
- `activityLog.addEvent({ ..., xp })` の `xp` フィールドは**UIサマリ表示用のスナップショット**であり、XP加算には**寄与しない**
- 実装パターン:
  ```ts
  const result = applyAnswer(event)              // ★XP加算はここで完結
  addActivityEvent({                              // 表示ログ記録（再加算なし）
    type: 'quiz-session',
    date, createdAt,
    xp: result.xpGained,                          // 表示用にコピー
    payload: ...,
  })
  ```
- レビュー観点: `addActivityEvent` 内で gamification 状態を更新していないか必ず確認

#### 担当
- 🅒（既存大規模ファイル改修。NWロジックの理解が必要）
- F1-P5 で `applyEssayComplete` を追加
- F2-P6 でバッジ条件を再設計

### 3.8 `activityLog.ts` 🟡

#### 役割
学習活動の時系列ログ。日次集計（`DaySummary`）を提供する。

#### イベント種別の拡張

```ts
// NW踏襲のイベント種別 + PM追加
export type ActivityEvent =
  | { id: string; type: 'quiz-session';     date: string; createdAt: string; xp: number; payload: QuizSessionPayload }
  | { id: string; type: 'note-check';       date: string; createdAt: string; xp: number; payload: NoteCheckPayload }
  | { id: string; type: 'badge-unlock';     date: string; createdAt: string; xp: number; payload: BadgePayload }
  | { id: string; type: 'afternoon-record'; date: string; createdAt: string; xp: number; payload: AfternoonPayload }
  | { id: string; type: 'morning-session';  date: string; createdAt: string; xp: number; payload: MorningSessionPayload }   // ★PM追加
  | { id: string; type: 'essay-complete';   date: string; createdAt: string; xp: number; payload: EssayCompletePayload }    // ★PM追加

export interface MorningSessionPayload {
  sessionId: string
  scope: 'random' | 'year' | 'important' | 'single'   // ★F1-P4「重要マーク」+ DP-D4-2「単一問題ジャンプ」対応
  yearLabel?: string                        // scope='year' のときのみ
  questionCount: number
  correctCount: number
}

export interface EssayCompletePayload {
  attemptId: string
  problemId: string
  yearLabel: string
  theme: string
  elapsedSec: number
  totalChars: number         // 設問ア・イ・ウの合計文字数
}
```

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| LocalStorageキー | `nwsp:activityLog` | `pmap:activityLog` |
| `QuizSessionPayload.mode` | `'topic' \| 'weakness' \| 'random' \| 'important'` | （変更なし） |
| `AfternoonPayload.section` | `'G1' \| 'G2'` | `'PM1'` のみ |
| イベント種別 | 4種類 | **6種類**（morning-session, essay-complete 追加） |

#### 担当
- 🅒🅧: types/イベント定義追加は🅧、既存loadActivityLog拡張動作確認は🅒

### 3.9 `sync/*` 🟡

#### 役割
QRコード経由のデバイス間同期。NWの実装ほぼ流用、PM用キー追加・prefix変更のみ。

#### 主な変更点

##### `sync/types.ts` 🟡

```ts
// NW
export const LEGACY_SYNC_PREFIX = 'NWSP-SYNC-v1:'
export const SYNC_PREFIX = 'NWSP-SYNC-v2:'
export const SYNC_APP_ID = 'nwsp-learning-app' as const

// PM
export const SYNC_PREFIX = 'PMAP-SYNC-v1:'              // ★PMでは v1 から開始
export const SYNC_APP_ID = 'pmap-learning-app' as const
// LEGACY_SYNC_PREFIX は不要（PMには旧バージョンが無いため削除）
```

`LocalSyncState` に PM固有のキーを追加:

```ts
export interface LocalSyncState {
  // === NW踏襲 ===
  answerRecords: AnswerRecord[]
  studySessions: StudySession[]
  bookmarks: Bookmark[]
  questionMastery: Record<string, MasteryState>
  trackerRecords: PracticeRecord[]
  gamification: GamificationState
  dailyXpLedger: DailyXpLedger

  // === PM追加 ===
  importantQuestions: string[]                                     // ★F1-P2
  morningRecords: MorningRecord[]                                  // ★F1-P4
  essayAttempts: EssayAttempt[]                                    // ★F1-P5（active session は同期しない）
  essayPlans: Record<string, string>                               // ★F1-P5
  savedAnswers: Record<string, Record<string, string>>             // ★午後I履歴用（recordId → questionPath → 解答文字列）
}
```

##### `sync/adapters.ts` 🟡

`KEYS` 定数に PM 用キーを追加:

```ts
const KEYS = {
  // === NW踏襲（prefix変更） ===
  ANSWER_RECORDS: 'pmap:answer_records',
  USER_PROGRESS: 'pmap:user_progress_v2',
  STUDY_SESSIONS: 'pmap:study_sessions',
  BOOKMARKS: 'pmap:bookmarks',
  QUESTION_MASTERY: 'pmap:question_mastery',
  NOTE_UNDERSTANDING: 'pmap:note_understanding',
  TRACKER_RECORDS: 'pmap:tracker:records',
  // TRACKER_PLANS: 'pmap:tracker:plans',   // ★F1 段階は同期対象外（NW踏襲）。F2-P4 で最終決定
  GAMIFICATION: 'pmap:gamification',
  ACTIVITY_LOG: 'pmap:activityLog',
  DAILY_XP_LEDGER: 'pmap:sync:daily_xp_ledger',
  NOTE_META: 'pmap:sync:note_meta',
  PLAN_META: 'pmap:sync:plan_meta',         // plans 本体ではなく更新タイムスタンプのみ同期

  // === PM追加 ===
  IMPORTANT_QUESTIONS: 'pmap:important_questions',
  MORNING_RECORDS: 'pmap:morning:records',
  ESSAY_ATTEMPTS: 'pmap:essay:attempts',
  ESSAY_PLANS: 'pmap:essay:plans',
} as const

// ★ F1-P-1 確定事項（D-LIB-05）:
//   NW実装 (src/lib/sync/adapters.ts line 12-25) は tracker:plans 本体を同期対象に含めず、
//   PLAN_META（タイムスタンプ）のみで管理している。
//   PM F1 段階も NW 踏襲とし、F2-P4（午後I コンテンツ揃え）で複数端末利用を試した結果を見て
//   plans 本体の同期を追加するか最終決定する。

// === ワイルドカードprefix（recordId / problemId別に無数のキーが生成される） ===
// 同期時は `localStorage` を走査して prefix一致するキーを集約
const WILDCARD_PREFIXES = {
  SAVED_ANSWERS: 'pmap:savedAnswers:',   // 同期対象（午後I採点完了時の解答スナップショット）
  // 'pmap:myAnswer:' は同期対象外（一時バッファ）
} as const
```

> **同期対象から除外**: `pmap:essay:active`（端末ローカル状態）、`pmap:auth:session`（認証情報）、`pmap:myAnswer:*`（一時バッファ）

#### マージ戦略

| キー | マージ方法 | 補足 |
|---|---|---|
| 配列キー（answer_records, important_questions, morning:records, essay:attempts） | **集合和（unique by id）** | NW踏襲 |
| Mapキー（progress, plans, mastery, note_understanding） | **タイムスタンプ新しい方優先** | NW踏襲 |
| GamificationState | XP/カウント/連続記録は **大きい方** を採用、unlockedBadgeIds は **集合和** | NW踏襲 |

#### 担当
- 🅧（型・キーリスト追加）+ 🅒（マージロジック検証）

### 3.10 `answerTable.ts` 🔵

NWそのまま流用。PM固有の差分なし。

---

## 4. ルーティング・グローバル状態

### 4.1 開発版 `App.tsx`（フェーズ1）

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import OfficialMorningQuiz from './pages/OfficialMorningQuiz'
import OfficialMorningSession from './pages/OfficialMorningSession'
import OfficialMorningSummary from './pages/OfficialMorningSummary'
import AfternoonProblems from './pages/AfternoonProblems'
import AfternoonAnswerDetail from './pages/AfternoonAnswerDetail'
import AfternoonMyAnswer from './pages/AfternoonMyAnswer'
import EssayList from './pages/EssayList'
import EssayTraining from './pages/EssayTraining'
import EssayAttemptDetail from './pages/EssayAttemptDetail'
import Notes from './pages/Notes'
import NoteDetail from './pages/NoteDetail'
import Search from './pages/Search'
import Settings from './pages/Settings'
import ImportantMarks from './pages/ImportantMarks'
import Badges from './pages/Badges'
import HowToUse from './pages/HowToUse'
import ActivityHistory from './pages/ActivityHistory'
import DeviceSync from './pages/DeviceSync'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 没入型画面（Layout なし、サイドバー非表示） */}
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/morning/session" element={<OfficialMorningSession />} />
        <Route path="/morning/summary" element={<OfficialMorningSummary />} />

        {/* Layout 付き画面 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:categoryId" element={<NoteDetail />} />

          {/* 公式午前II */}
          <Route path="/morning" element={<OfficialMorningQuiz />} />

          {/* 午後I（PM1のみ） */}
          <Route path="/afternoon" element={<AfternoonProblems />} />
          <Route path="/afternoon/problems" element={<Navigate to="/afternoon" replace />} />
          <Route path="/afternoon/answers/:id" element={<AfternoonAnswerDetail />} />
          <Route path="/afternoon/answers/:id/myAnswer" element={<AfternoonMyAnswer />} />

          {/* 論述（午後II） */}
          <Route path="/essay" element={<EssayList />} />
          <Route path="/essay/:id" element={<EssayTraining />} />
          <Route path="/essay/:id/attempts/:attemptId" element={<EssayAttemptDetail />} />

          {/* 共通機能 */}
          <Route path="/search" element={<Search />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/history" element={<ActivityHistory />} />
          <Route path="/sync" element={<DeviceSync />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/important" element={<ImportantMarks />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

> **意思決定**:
> - **DP-D2-1**: 没入型画面は3つ（`/quiz` `/morning/session` `/morning/summary`）。論述（`/essay/:id`）はLayout付きとする。理由: 論述は長時間練習で頻繁にサイドバーから他画面へ離脱する可能性があるため、Layoutを残す。
> - **DP-D2-2**: 404ページは Layout 内に配置（サイドバーがあった方が回復しやすい）。

#### 担当
- 🅒（既存App.tsxを完全書き換え、import順・Route順の判断あり）

### 4.2 正式版 `App.tsx`（リリース時に復活）

開発版に対して以下を追加:

```tsx
import AuthGuard from './auth/AuthGuard'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ★追加: ログイン画面（認証不要） */}
        <Route path="/login" element={<Login />} />

        {/* 没入型画面 — 要認証 */}
        <Route path="/quiz" element={
          <AuthGuard><Quiz /></AuthGuard>
        } />
        {/* ...同様に他の没入型もAuthGuardでラップ... */}

        {/* Layout 付き画面 — 要認証 */}
        <Route element={
          <AuthGuard><Layout /></AuthGuard>
        }>
          {/* ...各Routeは開発版と同じ... */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

#### 復活手順（F2-P6 で実施）

1. `App.tsx` を上記構成に書き換え
2. `<Login />` ロゴ・配色をブランドに揃える
3. `src/auth/credentials.ts` のSHA256ハッシュをPM用パスワードで更新
   ```bash
   node -e "
     const crypto = require('crypto');
     const pw = 'your-password-here';
     console.log(crypto.createHash('sha256').update(pw).digest('hex'));
   "
   ```
4. ローカル動作確認 → 本番デプロイ

#### 担当
- 🅒（認証復活作業はF2-P6でClaude単独）

### 4.3 グローバル状態管理戦略

#### 採用方針: **React Context は使用しない**

NW踏襲。状態はLocalStorageを唯一のソース・オブ・トゥルースとし、各コンポーネントが必要時に `lib/*` 経由で読み書きする。

#### 状態の分類

| 状態 | 永続化先 | 共有方法 |
|---|---|---|
| ユーザの学習データ | LocalStorage | 各画面でフックが `lib/*` を呼ぶ |
| 画面ローカル状態（フォーム入力など） | useState | 親→子へ props |
| URLクエリ・パラメータ | URL | `useSearchParams` / `useParams` |
| 認証状態（正式版のみ） | LocalStorage `pmap:auth:session` | `useAuth` フック |

#### 同期パターン（LocalStorage更新後の再描画）

LocalStorage更新後、同じセッション内の他コンポーネントには自動で伝播しない。NW実装でも以下のパターンを採用:

1. **画面マウント時に都度読み込み**（`useEffect(() => setState(load()), [])`）
2. **データ更新ハンドラ内で local state も更新**（書き込みと state set を同時実行）
3. **LocalStorage直接購読は行わない**（複雑になる）

例: `ImportantToggle.tsx` の場合
```tsx
const handleClick = () => {
  const next = toggleImportant(questionId)  // LocalStorage更新
  setMarked(next)                            // ローカルstate更新
}
```

#### 例外

- **gamification状態**: バッジ解錠通知は複数画面（バッジ画面、トースト）で共有が必要
  - NW実装: `BadgeUnlockToast` を Layout 内に配置 + イベントbus的にrenderTrigger
  - PM踏襲: 同じ手法
  - **詳細はD3で扱う**

#### 担当
- 設計判断: 🅒
- 実装: 各画面で🅒🅧（F1-P0時点でLayout内に既存BadgeUnlockToastが配置済み）

### 4.4 エラーバウンダリ

#### 採用方針: **最小限の Error Boundary を Layout 直下に配置**

NW実装には専用のError Boundaryコンポーネントは無い（確認済み）。PMでも本格運用までは不要だが、フェーズ2リリース時にひとつ追加するのが望ましい。

#### 設計（F2-P6で実装）

```tsx
// src/components/ErrorBoundary.tsx 🟢
import { Component, type ReactNode } from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

interface Props {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info)
  }

  retry = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }
      return (
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-red-600">エラーが発生しました</h1>
          <p className="text-slate-600 mt-2">{this.state.error.message}</p>
          <button onClick={this.retry} className="mt-4 px-4 py-2 bg-brand text-white rounded">
            再試行
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

`Layout.tsx` の主コンテンツ領域（`<Outlet />` 周辺）をラップ:
```tsx
<main>
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
</main>
```

#### 担当
- 🅒🅧
  - `ErrorBoundary.tsx` 新規ファイル作成: 🅧（コード提示済み）
  - `Layout.tsx` の `<Outlet />` 周辺をラップする改修: 🅒（既存大規模ファイルへの統合判断、レビューも兼ねる）

### 4.5 404ハンドリング

#### 設計

```tsx
// src/pages/NotFound.tsx 🟢
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-700">404 Not Found</h1>
      <p className="text-slate-500 mt-2">指定されたページは存在しません。</p>
      <Link
        to="/"
        className="inline-block mt-6 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
      >
        ホームへ戻る
      </Link>
    </div>
  )
}
```

`App.tsx` の Layout 内に `<Route path="*" element={<NotFound />} />` を最後に配置（§4.1 参照）。

#### 担当
- 🅧（**F1-P0 Step 8** で投入。App.tsx の import 解決のため Step 9 の前に必須）

### 4.6 PWAインストールプロンプト制御

#### 設計

NW `PwaInstallPrompt.tsx` をそのまま流用。表示条件:
- ブラウザがPWAインストール可能（`beforeinstallprompt` イベント取得済み）
- 過去にユーザが「閉じる」を選択していない（`pmap:install_prompt_dismissed=true` でない）
- アプリがまだスタンドアロン表示でない

LocalStorageキー:
- `pmap:install_prompt_dismissed` : `boolean`

#### 表示位置

NW踏襲: `Layout.tsx` 内の固定位置（画面下部）にバナー表示。

#### 担当
- 🔵（NWそのまま流用、配置済み）

---

## 5. 画面詳細（その1: ホーム・サイドバー・Layout・ノート・検索）

各画面で **L2レベル**（モバイル/デスクトップ別 ASCII ワイヤフレーム + props/state契約 + 状態遷移 + LocalStorage アクセス + 担当区分）を提示する。

### 5.0 共通設計原則

#### ブレイクポイント（NW踏襲）

| 区分 | 幅 | Tailwind |
|---|---|---|
| Mobile | 〜768px | デフォルト |
| Tablet 以上 | 768px〜 | `md:` |
| Desktop | 1024px〜 | `lg:` |

`Layout.tsx` 内では `useMediaQuery('(max-width: 767px)')` 相当の判定で `isMobile` を取得（NW実装踏襲）。

#### レスポンシブ表示の方針

- Tailwind `md:` プレフィックスで分岐
- モバイル優先（モバイルが基本、`md:` で上書き）
- メニューカードは モバイル1列、md以上 2列、lg以上 3列

#### 共通色（再掲）

| 用途 | クラス |
|---|---|
| ヘッダ・サイドバー背景 | `bg-brand`（`#9d5b8b`） |
| アクティブメニュー | `bg-brand-dark` (`#7d4570`) |
| ホバー | `bg-white/10`（半透明白） |
| 強調テキスト | `text-brand-darker` |
| カード背景（強調） | `bg-brand-light` (`#f5e9f1`) |

---

### 5.1 ホーム画面（S02 `/`）

#### 役割
アプリのトップ画面。学習開始の起点。レベル表示・最近の活動サマリ・学習モード選択メニュー。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  [PM] PMラーニング      ⚙     │ ← ヘッダ（fixed, h-12, bg-brand）
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐   │
│ │ レベル 12  [████░░░░] 320XP│   │ ← LevelWidget
│ │ 次のレベルまで 80XP         │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ 📖 アプリの使い方           │   │
│ │ 5つの学習モードの活用方法   │   │ ← MENU_CARDS[0]
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 📒 ノートモード             │   │
│ │ 分野別の重要知識まとめ      │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ⭐ 重要問題モード            │   │
│ │ マーク済み問題のみ          │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 📉 弱点克服モード            │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 🔀 ランダム出題             │   │
│ └────────────────────────────┘   │
│ … (続く: カテゴリ別/公式午前II/   │
│      午後問題/論述/検索/バッジ/    │
│      履歴/同期/設定)              │
│                                  │
│ ┌────────────────────────────┐   │
│ │ 直近7日のXP                 │   │
│ │ ▁▂▅▃▆█▄                    │   │ ← 学習履歴サマリ
│ └────────────────────────────┘   │
│                                  │
│        v1.0.0 (mamiya-pm)        │ ← フッタ
└──────────────────────────────────┘
```

#### ワイヤフレーム — デスクトップ（1024px〜）

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ☰  [PM] PMラーニング                                                ⚙      │
├──────────┬─────────────────────────────────────────────────────────────────┤
│ サイドバー │ ┌──────────────┐ ┌──────────────────────────────────────────┐  │
│          │ │ レベル 12     │ │ 直近7日のXP                              │  │
│ 🏠 ホーム  │ │ [████░░] 320XP│ │ ▁▂▅▃▆█▄                                  │  │
│ 📖 使い方  │ └──────────────┘ └──────────────────────────────────────────┘  │
│ 📒 ノート  │                                                                │
│ ⭐ 重要    │ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│ 📉 弱点    │ │📖使い方 │ │📒ノート │ │⭐重要   │                           │
│ 🔀 ランダム│ └─────────┘ └─────────┘ └─────────┘                           │
│ 🗂 カテゴリ│ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│ 📃 午前II  │ │📉弱点   │ │🔀ランダム│ │🗂カテゴリ│                          │
│ 📋 午後   │ └─────────┘ └─────────┘ └─────────┘                           │
│ ✍ 論述    │ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│ 🔍 検索    │ │📃午前II │ │📋午後   │ │✍論述    │                           │
│ 🏆 バッジ  │ └─────────┘ └─────────┘ └─────────┘                           │
│ 📊 履歴    │ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│ 🔄 同期    │ │🔍検索   │ │🏆バッジ │ │📊履歴   │                          │
│ ⚙ 設定    │ └─────────┘ └─────────┘ └─────────┘                           │
│          │ ┌─────────┐ ┌─────────┐                                         │
│ [PM] v1.0│ │🔄同期   │ │⚙設定    │                                         │
│          │ └─────────┘ └─────────┘                                         │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

#### コンポーネント構成

```
Home.tsx
├── LevelWidget                    （NW流用）
├── 学習履歴サマリ（直近7日のXPチャート）
└── MenuCardGrid
    └── MenuCard × 14              （NW流用、メニュー差し替え）
        - to: string
        - title: string
        - description: string
        - iconBg: string
        - icon: ReactNode
```

#### state / データ取得タイミング

```ts
function Home() {
  // マウント時に都度読み込み（NW踏襲）
  const progress = useMemo(() => getAllProgress(), [])
  const recentDays = useMemo(() => getRecentDaySummaries(7), [])
  const gamification = useMemo(() => loadGamification(), [])

  return (...)
}
```

`useMemo([])` で初回のみ読み込み。学習後にホームへ戻ったときは画面遷移で再マウントされるため最新データが反映される。

#### MENU_CARDS 配列（PM用、14項目）

| # | to | title | description |
|---|---|---|---|
| 1 | `/how-to-use` | アプリの使い方 | 5つの学習モードの活用方法 |
| 2 | `/notes` | ノートモード | 分野別の重要知識まとめ |
| 3 | `/quiz?mode=important` | 重要問題モード | マーク済み問題のみ |
| 4 | `/quiz?mode=weakness` | 弱点克服モード | 不正解の多い問題 |
| 5 | `/quiz?mode=random` | ランダム出題 | 全カテゴリから |
| 6 | `/notes` | カテゴリ別学習 | カテゴリを選んで学習 |
| 7 | `/morning` | 公式午前II問題 | 過去問25問×全年度 |
| 8 | `/afternoon` | 午後問題 | 自己採点・記録 |
| 9 | `/essay` | 論述トレーニング | 午後II対応 |
| 10 | `/search` | 検索 | 全コンテンツ検索 |
| 11 | `/badges` | バッジ | 解錠状況 |
| 12 | `/history` | 学習履歴 | 日次・週次サマリ |
| 13 | `/sync` | デバイス同期 | QRコードで他端末へ |
| 14 | `/settings` | 設定 | リセット・重要マーク管理 |

#### 担当
- 🅒🅧
  - メニューカード差し替え（NWからの編集）: 🅒（既存ファイルだがロジック単純なため Claude が安全に編集）
  - LevelWidget・学習履歴サマリ配置: 🔵（NW流用）

---

### 5.2 共通レイアウト（Layout.tsx）

#### 役割
全画面共通のヘッダ・サイドバー・コンテンツエリア・PWA インストールプロンプト・バッジ解錠トーストを提供。

#### ワイヤフレーム — モバイル（メニュー閉）

```
┌──────────────────────────────────┐
│ ☰  [PM] PMラーニング      ⚙     │ ← ヘッダ（h-12, fixed top）
├──────────────────────────────────┤
│                                  │
│   メインコンテンツ <Outlet />     │
│                                  │
│   （サイドバーは閉じてる）        │
│                                  │
│                                  │
│                                  │
└──────────────────────────────────┘
   ↓ 画面下部（条件次第で表示）
┌──────────────────────────────────┐
│ ⓘ ホーム画面に追加できます  [追加] │ ← PwaInstallPrompt
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（メニュー開）

```
┌──────────────────────────────────┐
│ ✕  [PM] PMラーニング      ⚙     │ ← ヘッダ（×アイコンに変化）
├─────────────┬────────────────────┤
│ 🏠 ホーム   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← 半透明backdrop
│ 📖 使い方   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   （タップで閉じる）
│ 📒 ノート   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ⭐ 重要     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 📉 弱点     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 🔀 ランダム ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 🗂 カテゴリ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 📃 午前II   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 📋 午後     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ✍ 論述      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 🔍 検索     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 🏆 バッジ   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 📊 履歴     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 🔄 同期     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ⚙ 設定     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ [PM] v1.0   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← フッタ（ロゴ + バージョン）
└─────────────┴────────────────────┘
   ←─ 240px ─→
```

#### ワイヤフレーム — デスクトップ（サイドバー固定表示）

```
┌────────────────────────────────────────────────────────────────────┐
│ ☰  [PM] PMラーニング                                          ⚙  │
├──────────┬─────────────────────────────────────────────────────────┤
│ 🏠 ホーム │                                                          │
│ 📖 使い方 │   メインコンテンツ <Outlet />                            │
│ 📒 ノート │                                                          │
│ ⭐ 重要    │                                                          │
│ 📉 弱点    │                                                          │
│ 🔀 ランダム│                                                          │
│ 🗂 カテゴリ│                                                          │
│ 📃 午前II  │                                                          │
│ 📋 午後   │                                                          │
│ ✍ 論述    │                                                          │
│ 🔍 検索    │                                                          │
│ 🏆 バッジ │                                                          │
│ 📊 履歴   │                                                          │
│ 🔄 同期   │                                                          │
│ ⚙ 設定   │                                                          │
│          │                                                          │
│ [PM] v1.0│                                                          │
│ mamiya-pm│                                                          │
└──────────┴─────────────────────────────────────────────────────────┘
   ↑ 240px固定
```

#### state / 振る舞い

```ts
function Layout() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [isOpen, setIsOpen] = useState(!isMobile)   // デスクトップは初期表示、モバイルは非表示
  const navigate = useNavigate()

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  // モバイル: メニュー項目クリック後に閉じる
  const handleNavClick = (to: string) => {
    if (isMobile) close()
    // クエリパラメータ付きRouteのときは明示的にnavigate
  }

  // デスクトップでのリサイズ時、モバイル化したら閉じる
  useEffect(() => {
    if (isMobile) setIsOpen(false)
    else setIsOpen(true)
  }, [isMobile])

  return (
    <div>
      <header>...</header>
      <div className="flex flex-1 pt-12">
        {isMobile && isOpen && <Backdrop onClick={close} />}
        <nav>...</nav>
        <main style={{ marginLeft: isMobile ? 0 : 240 }}>
          <ErrorBoundary>             {/* F2-P6で追加 */}
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <PwaInstallPrompt />
      <BadgeUnlockToast />
    </div>
  )
}
```

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| ヘッダ背景色 | `#1a3a5c` (NWダークブルー) | `bg-brand` (`#9d5b8b`) |
| サイドバー背景色 | `#1a3a5c` | `bg-brand` |
| アクティブメニュー | `bg-white/20` | `bg-brand-dark` |
| ヘッダ文字色 | `text-blue-200` | `text-white/85` |
| サブテキスト（タイトル横） | "試験学習" | "PMラーニング" |
| メニュー項目 | NW 17項目（プロトコル含） | **PM 15項目**（§5.3 で詳細） |

#### 担当
- 🅒（既存大規模ファイル改修）
- 配色・メニュー差分の機械置換部分は内部的に Codex 委譲しても可（🅒🅧）

---

### 5.3 サイドバー詳細

#### NAV_ITEMS 配列（PM用、15項目）

```ts
import {
  Home, HelpCircle, BookOpen, Star, TrendingDown, Shuffle, Layers,
  FileText, ClipboardList, PenLine, Search, Award, BarChart3, RefreshCw, Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',                          label: 'ホーム',         icon: <Home className="w-5 h-5" /> },
  { to: '/how-to-use',                label: 'アプリの使い方', icon: <HelpCircle className="w-5 h-5" /> },
  { to: '/notes',                     label: 'ノートモード',   icon: <BookOpen className="w-5 h-5" /> },
  { to: '/quiz?mode=important',       label: '重要問題モード', icon: <Star className="w-5 h-5" /> },
  { to: '/quiz?mode=weakness',        label: '弱点克服モード', icon: <TrendingDown className="w-5 h-5" /> },
  { to: '/quiz?mode=random',          label: 'ランダム出題',   icon: <Shuffle className="w-5 h-5" /> },
  { to: '/notes',                     label: 'カテゴリ別学習', icon: <Layers className="w-5 h-5" /> },
  { to: '/morning',                   label: '公式午前II問題', icon: <FileText className="w-5 h-5" /> },
  { to: '/afternoon',                 label: '午後問題',       icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/essay',                     label: '論述トレーニング', icon: <PenLine className="w-5 h-5" /> },
  { to: '/search',                    label: '検索',           icon: <Search className="w-5 h-5" /> },
  { to: '/badges',                    label: 'バッジ',         icon: <Award className="w-5 h-5" /> },
  { to: '/history',                   label: '学習履歴',       icon: <BarChart3 className="w-5 h-5" /> },
  { to: '/sync',                      label: 'デバイス同期',   icon: <RefreshCw className="w-5 h-5" /> },
  { to: '/settings',                  label: '設定',           icon: <Settings className="w-5 h-5" /> },
]
```

> **DP-D3-1**: 「ノートモード」と「カテゴリ別学習」は同じ `/notes` だが意味的に区別したいため2項目残す（NW踏襲）。
> **DP-D3-2**: 「重要問題」「弱点」「ランダム」はクエリパラメータRoute（NWの `isQueryRoute` 分岐ロジック踏襲）。

#### 担当
- 🅧（NAV_ITEMS 配列の差し替えは機械作業）

---

### 5.4 ノート一覧画面（S04 `/notes`）

#### 役割
12カテゴリのカード一覧を表示。各カテゴリの理解度（緑/黄/赤）バッジを表示し、ノート閲覧画面へのエントリポイント。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  ノートモード                  │
├──────────────────────────────────┤
│                                  │
│ 🔍 [検索ボックス__________]       │
│                                  │
│ ┌────────────────────────────┐   │
│ │ 1. ステークホルダー   ▶    │   │
│ │ 特定・分析・エンゲージメント│   │
│ │ 🟢2  🟡1  🔴0              │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 2. チーム             ▶    │   │
│ │ リーダーシップ・組織       │   │
│ │ 🟢0  🟡0  🔴0              │   │
│ └────────────────────────────┘   │
│ … (12カテゴリ)                   │
└──────────────────────────────────┘
```

#### ワイヤフレーム — デスクトップ（2列グリッド）

```
┌────────────────────────────────────────────────────────────────┐
│ ノートモード                                                     │
├────────────────────────────────────────────────────────────────┤
│ 🔍 [検索ボックス___________________________________]            │
│                                                                │
│ ┌──────────────────┐  ┌──────────────────┐                    │
│ │1. ステークホルダー│  │2. チーム         │                    │
│ │特定・分析…        │  │リーダーシップ…    │                    │
│ │🟢2 🟡1 🔴0        │  │🟢0 🟡0 🔴0        │                    │
│ └──────────────────┘  └──────────────────┘                    │
│ ┌──────────────────┐  ┌──────────────────┐                    │
│ │3. 開発アプローチ  │  │4. 計画           │                    │
│ │予測型／適応型…    │  │スコープ・WBS…     │                    │
│ │🟢0 🟡0 🔴0        │  │🟢0 🟡0 🔴0        │                    │
│ └──────────────────┘  └──────────────────┘                    │
│ … (12カテゴリ、2列で6行)                                       │
└────────────────────────────────────────────────────────────────┘
```

#### コンポーネント構成

```
Notes.tsx
├── 検索ボックス（インクリメンタル検索、カテゴリ名/説明にマッチ）
└── CategoryCardList
    └── CategoryCard × 12              （NW流用）
        ├── カテゴリ名・説明
        ├── UnderstandingBadges        （理解度バッジ、NW流用）
        └── 進捗バー（任意）
```

#### state

```ts
function Notes() {
  const [query, setQuery] = useState('')
  const filteredCategories = useMemo(
    () => categories.filter(c =>
      !query ||
      c.name.includes(query) ||
      c.description.includes(query)
    ),
    [query]
  )
  return (...)
}
```

#### LocalStorageアクセス
- `getNoteUnderstanding()` — 各カテゴリの理解度バッジ表示用（マウント時1回）

#### 担当
- 🅧（NWの`Notes.tsx`を `NOTE_CATEGORY_IDS` 差し替えのみで動作。F1-P1で対応済み）

---

### 5.5 ノート詳細画面（S05 `/notes/:categoryId`）

#### 役割
カテゴリ別の知識ノート本文を表示。赤字隠しトグル・セクション単位の理解度設定・前後カテゴリへのナビ。
**ノート本文はフェーズ2 (F2-P1) で投入**するため、フェーズ1段階では「準備中」表示で代替。

#### ワイヤフレーム — モバイル（フェーズ2投入後）

```
┌──────────────────────────────────┐
│ ☰  1. ステークホルダー           │
├──────────────────────────────────┤
│ ◀ 前  [赤字隠し: ON]   次 ▶     │ ← 上部ナビ + マスクトグル
├──────────────────────────────────┤
│                                  │
│ ## ステークホルダーの定義         │
│                                  │
│ プロジェクトに影響を与える、       │
│ または影響を受ける【████】や      │ ← 赤字: マスク中（クリックで開示）
│ 【███████】の総称である。         │
│                                  │
│ - 内部 / 外部                     │
│ - 顕在 / 潜在                     │
│                                  │
│ 【理解度】 🟢 🟡 🔴               │ ← セクション末尾、3択選択
│                                  │
│ ─────────────                   │
│                                  │
│ ## ステークホルダー登録簿         │
│ …                                 │
│                                  │
│ ◀ 前  [赤字隠し: ON]   次 ▶     │ ← 下部にも同じナビ
│                                  │
│ ┌────────────────────────────┐   │
│ │ 🎯 このカテゴリのクイズに挑戦 │   │ ← v0.14 U3追加: ノート→クイズ導線
│ │              [挑戦する →]    │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

> **v0.14 U3対応**: ノートを読み終えたユーザが1タップでカテゴリ別クイズに挑戦できるよう、ノート詳細下部に **「このカテゴリのクイズに挑戦」ボタン** を配置。`/quiz?mode=topic&category=<categoryId>` へ遷移。学習サイクル（読む→解く）を高速化。

#### state

```ts
function NoteDetail() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [masked, setMasked] = useState(true)              // 赤字マスク状態
  const [maskVersion, setMaskVersion] = useState(0)       // マスクOFF→ON時のリセット用
  const [understanding, setUnderstanding] = useState(getNoteUnderstanding())
  const noteData = NOTE_DB[categoryId ?? '']              // フェーズ2で投入

  if (!noteData) {
    return <PreparingNotice />                            // 「準備中」表示
  }

  const handleSetUnderstanding = (
    sectionIndex: number,
    level: UnderstandingLevel | null
  ) => {
    setNoteUnderstanding(categoryId!, sectionIndex, level)
    setUnderstanding(getNoteUnderstanding())              // 即時反映

    if (level !== null) {
      // XP加算（gamification を真値とする / D2-4 原則）
      const result = applyNoteCheck({
        categoryId: categoryId!,
        sectionIndex,
        level,
      })

      // ログ記録（XPは表示用スナップショット）
      addActivityEvent({
        type: 'note-check',
        date, createdAt,
        xp: result.xpGained,                              // applyNoteCheck の戻り値をコピー
        payload: { noteId, noteName, level, sectionLabel },
      })

      // バッジ解錠通知（あれば）
      if (result.newBadges.length > 0) {
        // BadgeUnlockToast に通知（NW踏襲）
      }
    }
  }

  const toggleMask = () => {
    if (masked) {
      setMasked(false)
    } else {
      setMasked(true)
      setMaskVersion(v => v + 1)                          // 各 RedWord をリセット
    }
  }

  return (...)
}
```

#### NW流用要素

- `RedWord` コンポーネント（赤字マスク・クリックで個別開示）— NWからそのまま流用
- `EmphasisToken` `RichProtocolTable` `HeaderDiagram` 等の構造化型 — NW流用（PMでは「プロトコル表」は使わないが「観点表」「比較表」として再利用）

#### 「準備中」表示（フェーズ1）

```tsx
function PreparingNotice() {
  return (
    <div className="p-8 text-center">
      <BookOpen className="w-12 h-12 text-brand mx-auto mb-4" />
      <h1 className="text-lg font-bold">このカテゴリのノートは準備中です</h1>
      <p className="text-sm text-slate-600 mt-2">
        フェーズ2でコンテンツを投入予定です
      </p>
      <Link to="/notes" className="inline-block mt-4 text-brand">
        ← ノート一覧へ戻る
      </Link>
    </div>
  )
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:note_understanding` | read |
| 理解度変更時 | `pmap:note_understanding` | write |
| 理解度変更時 | `pmap:gamification` | write（XP加算・バッジ判定、`applyNoteCheck` 経由） |
| 理解度変更時 | `pmap:activityLog` | append (`note-check`、xp は applyNoteCheck の戻り値) |

#### 担当
- 🅒（既存大規模ファイル `NoteDetail.tsx` 5,368行の改修。フェーズ1ではNOTE_DBスタブ化＋準備中表示の追加のみ、フェーズ2で本文投入）

---

### 5.6 アプリの使い方（S03 `/how-to-use`）

#### 役割
新規ユーザ向けの説明ページ。各モードの使い方・推奨学習フロー。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  アプリの使い方                │
├──────────────────────────────────┤
│                                  │
│ ## 学習モード（5種）              │
│                                  │
│ ### 📒 ノートモード               │
│ PMBOK第7版とIPAシラバスに         │
│ 沿った12カテゴリの知識まとめ      │
│ [ノート一覧へ →]                  │
│                                  │
│ ### 🎯 クイズモード               │
│ ノートで学んだ知識を4択／         │
│ 記述で問う確認問題                │
│ [ランダム出題へ →]                │
│                                  │
│ ### 📃 公式午前II問題             │
│ IPA公式の午前II過去問を年度別／    │
│ 全範囲ランダムで挑戦              │
│ [公式午前IIへ →]                  │
│                                  │
│ ### 📋 午後I問題                  │
│ 過去問の自己採点・記録            │
│ [午後問題へ →]                    │
│                                  │
│ ### ✍ 論述トレーニング            │
│ 設問確認 → タイマー →             │
│ 解答 → 自己採点 → 振り返り         │
│ [論述へ →]                        │
│                                  │
│ ## 推奨学習フロー                 │
│ 1. ノートで知識インプット          │
│ 2. クイズで確認                   │
│ 3. 公式午前II で実戦              │
│ 4. 午後I・論述に挑戦              │
└──────────────────────────────────┘
```

#### コンポーネント構成
- 静的なJSXコンテンツのみ（state なし、LocalStorage アクセス なし）

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| 文言 | NW固有 | PM試験文脈に書き直し |
| モード説明 | 4種（ノート・クイズ・午後・コラム） | **5種**（ノート・クイズ・公式午前II・午後I・論述） |
| 推奨フロー | NW向け | PM向けに書き直し |

#### 担当
- 🅒（PM試験文脈の文言判断が必要）

---

### 5.7 検索画面（S17 `/search`）

#### 役割
ノート本文・クイズ問題・公式午前II問題を横断的に全文検索。タブで対象を切り替え。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  検索                          │
├──────────────────────────────────┤
│ 🔍 [検索ボックス_________] [×]   │ ← クリアボタン
│                                  │
│ [全件] [クイズ] [ノート] [午前II] │ ← タブ
│                                  │
│ ─── ノート（5件） ───              │
│ ┌────────────────────────────┐   │
│ │ 4. 計画 › スコープ管理      │   │
│ │ ...プロジェクトスコープを    │   │
│ │ 【明確化】する活動である。   │   │ ← マッチ部分ハイライト
│ │ → ノートへ                  │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 1. ステークホルダー › ...   │   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│                                  │
│ ─── クイズ（12件） ───              │
│ ┌────────────────────────────┐   │
│ │ q-042: 【スコープ】ベース…  │   │
│ │ → クイズで挑戦              │   │
│ └────────────────────────────┘   │
│ …                                │
│                                  │
│ ─── 公式午前II（3件） ───          │
│ ┌────────────────────────────┐   │
│ │ om-r6-q12: スコープクリープ │   │
│ │ → 個別に挑戦                │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

#### state

```ts
type SearchTab = 'all' | 'quiz' | 'note' | 'morning'

function Search() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('all')

  const debouncedQuery = useDebounce(query, 300)   // インクリメンタル検索（過剰検索防止）

  const results = useMemo(() => {
    if (!debouncedQuery) return { quiz: [], note: [], morning: [] }
    return {
      quiz: searchQuestions(debouncedQuery),
      note: searchNotes(debouncedQuery),
      morning: searchMorningQuestions(debouncedQuery),
    }
  }, [debouncedQuery])

  return (...)
}
```

#### 検索ロジック（NW踏襲＋拡張）

| 対象 | 検索フィールド | 表示 |
|---|---|---|
| クイズ問題 | `id`, `questionText`, `correctAnswer`, `explanation` | 問題文抜粋＋ハイライト → クリックで `/quiz?mode=single&q=<id>`（**単一問題出題モード**、D4で詳細化） |
| ノート本文 | `categoryId`, `sectionHeading`, セクション本文の文字列化 | セクション抜粋 → `/notes/<categoryId>#section-<index>` でノート詳細＋アンカージャンプ |
| 公式午前II | `id`, `questionText`, `choices` 全文, `explanation` | 問題文抜粋 → `/morning/session?q=<id>` で個別出題（**単一問題モード**、D4で詳細化） |

ノート本文の検索は `NOTE_DB` の構造化トークン（`EmphasisToken[]`）を平文化して全文検索。

> **D4 で扱う追加要件**:
> - クイズ画面 (`Quiz.tsx`) の `?mode=single&q=<id>` 解釈 — 1問だけ出題するモードを §6 で詳細化
> - 公式午前II 出題画面 (`OfficialMorningSession.tsx`) の `?q=<id>` 解釈 — §7 で詳細化
> - ノート詳細のアンカージャンプ実装 — `id="section-N"` を各セクションに付与する形でD4でも触れる（NoteDetailは大規模ファイルで既存改修困難なため、後フェーズでの対応も可）

#### マッチハイライト

NWの `highlight(text, query)` 関数を流用。

#### 担当
- 🅒🅧
  - 検索UI骨組み: 🅧（NW流用＋タブ追加）
  - 検索ロジック実装: 🅒（ノート構造化データの検索アルゴリズムが複雑）

---

### 5.8 D3 まとめ — 画面別担当配分

| 画面 | 主担当 | 主な作業 |
|---|---|---|
| S02 ホーム | 🅒🅧 | MENU_CARDS 差し替え |
| Layout | 🅒🅧 | 配色変更・NAV_ITEMS差し替え |
| S03 アプリの使い方 | 🅒 | 文言再執筆 |
| S04 ノート一覧 | 🅧 | NOTE_CATEGORY_IDS差し替えのみ |
| S05 ノート詳細 | 🅒 | スタブ化＋PreparingNotice追加 |
| S17 検索 | 🅒🅧 | UI骨組み🅧＋検索ロジック🅒 |

---

## 6. クイズモード詳細

クイズモード（S06 出題画面 / S07 サマリー）の全画面と4モードの出題ロジックを定義する。

### 6.1 クイズ起点（モード選択動線）

クイズには独立した「トップ画面」を設けない。動線:

```
[ホーム or サイドバー]
   ├─ 🗂 カテゴリ別学習      → /notes → カテゴリ選択 → /quiz?mode=topic&category=<id>
   ├─ ⭐ 重要問題モード       → /quiz?mode=important
   ├─ 📉 弱点克服モード       → /quiz?mode=weakness
   ├─ 🔀 ランダム出題         → /quiz?mode=random
   └─ 🔍 検索からのジャンプ   → /quiz?mode=single&q=<questionId>
```

> NW踏襲: クイズトップ画面は不要。サイドバーまたはホームから直接クエリパラメータ付きで `/quiz` へ遷移する。

#### 担当
- 🔵（NW踏襲、新規UIなし）

---

### 6.2 クイズ出題画面（S06 `/quiz`）— 没入型

#### 役割
4択モード・記述モードを切り替えながら問題を出題。1セッションは複数問題を順番に出題し、最後にサマリー画面（S07）へ遷移。

#### ワイヤフレーム — モバイル（4択モード・回答前）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/15  ⭐(マーク)    │ ← 没入型ヘッダ
├──────────────────────────────────┤
│ [4択] [記述]                     │ ← モード切替トグル（NW踏襲）
├──────────────────────────────────┤
│                                  │
│ プロジェクトに影響を与える、       │
│ または影響を受ける【     】や      │
│ 【     】の総称である。           │ ← 穴埋め問題
│                                  │
│ ┌────────────────────────────┐   │
│ │ ア  ステークホルダー        │   │ ← 4択（タップで選択）
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ イ  受益者                  │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ウ  スポンサー              │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ エ  プロジェクトマネージャ  │   │
│ └────────────────────────────┘   │
│                                  │
│ [カテゴリ: ステークホルダー / 難易度2] │ ← メタ情報（小さく）
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（4択モード・回答後）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/15  ⭐(マーク済)  │
├──────────────────────────────────┤
│ [4択] [記述]                     │
├──────────────────────────────────┤
│                                  │
│ プロジェクトに影響を与える、       │
│ または影響を受ける【ステークホルダ│
│ ー】や【スポンサー】の総称である。 │ ← 正解で空欄を埋めて表示
│                                  │
│ ┌────────────────────────────┐   │
│ │ ア  ステークホルダー  ✓    │   │ ← 選択した正解（緑）
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ イ  受益者                  │   │ ← 通常表示
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ウ  スポンサー              │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ エ  プロジェクトマネージャ  │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌─ 解説 ─────────────────────┐   │
│ │ ステークホルダーとは…       │   │
│ │ プロジェクト管理においては…  │   │
│ └────────────────────────────┘   │
│                                  │
│ [+10 XP 獲得]                    │ ← XpGain（NW流用）
│                                  │
│        [次の問題へ →]             │ ← 次へ進むボタン
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（記述モード・回答前）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/15  ⭐            │
├──────────────────────────────────┤
│ [4択] [記述]                     │
├──────────────────────────────────┤
│                                  │
│ プロジェクトに影響を与える、       │
│ または影響を受ける【  ?  】や      │
│ 【  ?  】の総称である。           │
│                                  │
│ 解答を入力:                      │
│ ┌────────────────────────────┐   │
│ │                            │   │ ← textarea（自由記述）
│ │                            │   │
│ └────────────────────────────┘   │
│                                  │
│        [採点する]                 │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（記述モード・回答後・自己判定）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/15  ⭐            │
├──────────────────────────────────┤
│                                  │
│ あなたの解答:                    │
│  ステークホルダ・スポンサー       │
│                                  │
│ 模範解答:                        │
│  ステークホルダー、スポンサー     │
│                                  │
│ ┌─ 解説 ─────────────────────┐   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│                                  │
│ 自己判定:                        │
│ [○ 正解とする]   [✕ 不正解とする] │ ← NW踏襲（自己採点）
└──────────────────────────────────┘
```

#### state / 主要ロジック

```ts
type QuizMode = 'topic' | 'random' | 'important' | 'weakness' | 'single'
type AnswerMode = 'multiple-choice' | 'written'

interface QuizState {
  questions: Question[]               // セッション内の出題リスト
  currentIndex: number                // 現在の問題位置
  answerMode: AnswerMode              // 4択 or 記述
  selectedChoice: number | null       // 4択モードでの選択
  writtenAnswer: string               // 記述モードの入力
  isAnswered: boolean                 // 回答済みフラグ
  isCorrect: boolean | null           // 正誤判定結果
  results: { qid: string; mode: AnswerMode; isCorrect: boolean }[]
}

function Quiz() {
  const [searchParams] = useSearchParams()
  const mode = (searchParams.get('mode') ?? 'random') as QuizMode
  const categoryId = searchParams.get('category')
  const singleQuestionId = searchParams.get('q')   // ?mode=single&q=<id>

  const [state, setState] = useState<QuizState>(() =>
    initQuizState(mode, categoryId, singleQuestionId)
  )

  // モード別の出題リスト構築は §6.4 参照

  const handleSelect = (choiceIdx: number) => {
    const q = state.questions[state.currentIndex]
    const isCorrect = q.choices[choiceIdx] === q.correctAnswer

    // gamification 経由でXP加算
    const result = applyAnswer({
      questionId: q.id,
      topicId: q.topicId,
      isCorrect,
      mode: state.answerMode,
      difficulty: q.difficulty,
      isImportant: isImportant(q.id),
    })

    // ストレージ更新
    addAnswerRecord({ ... })
    updateProgress(q.topicId, isCorrect, state.answerMode)
    updateQuestionMastery(q.id, state.answerMode, isCorrect)

    // バッジ通知（result.newBadgesがあれば）

    setState(prev => ({ ...prev, selectedChoice: choiceIdx, isAnswered: true, isCorrect }))
  }

  const handleNext = () => {
    if (state.currentIndex + 1 >= state.questions.length) {
      // セッション完了 → サマリーへ
      const session: StudySession = { ... }
      saveStudySession(session)
      addActivityEvent({ type: 'quiz-session', payload: { ... }, xp: totalXp })
      navigate('/quiz/summary', { state: session })
    } else {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, isAnswered: false, ... }))
    }
  }

  const handleSelfGrade = (isCorrect: boolean) => {
    // 記述モードの自己判定
    // handleSelect と同様の処理
  }

  return (...)
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:question_mastery` | read（弱点モード用） |
| マウント時 | `pmap:important_questions` | read（重要モード用 + ☆初期表示） |
| 回答時 | `pmap:answer_records` | append |
| 回答時 | `pmap:user_progress_v2` | update |
| 回答時 | `pmap:question_mastery` | update |
| 回答時 | `pmap:gamification` | update（applyAnswer経由） |
| ☆トグル時 | `pmap:important_questions` | update |
| セッション完了時 | `pmap:study_sessions` | append |
| セッション完了時 | `pmap:activityLog` | append (`quiz-session`、xp は積算値) |

#### NW流用要素
- `<QuizQuestion>` — 問題表示・選択肢UI
- `<ResultMultipleChoice>` — 4択結果表示
- `<ResultWritten>` — 記述結果（自己判定）
- `<ModeSelect>` — 4択/記述切替トグル
- `<XpGain>` — XP獲得表示

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| 重要マーク取得 | `Question.isImportant`（静的） | `isImportant(qid)`（動的、§3.3） |
| `?mode=important` 抽出 | 静的フラグ | `pmap:important_questions ∩ q-*` |
| `?mode=single` | 未対応 | **新規対応**（§6.6） |
| ☆ボタン | なし | **`<ImportantToggle>` をヘッダ右に配置** |

#### 担当
- 🅒（既存大規模ファイル `Quiz.tsx` 461行の改修。重要マーク統合・single モード追加・既存ロジック保全）

---

### 6.3 クイズサマリー画面（S07 `/quiz/summary` 相当）— 没入型

> NW実装ではS07は独立ルートではなく、Quiz内部のステート遷移でサマリービュー表示。本書では概念上「S07」と呼ぶ。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│  ✓ お疲れさまでした！             │
├──────────────────────────────────┤
│                                  │
│  【セッション結果】                │
│                                  │
│  正答数  12 / 15                  │
│  正答率  80%                      │
│  獲得XP  +145                     │
│                                  │
│  ┌─ 苦手だった問題 ──────────┐   │
│  │ ・q-042 リスク特定の手法… │   │
│  │ ・q-088 EVMの計算式…      │   │
│  │ ・q-103 ステークホルダー…  │   │
│  └─────────────────────────┘     │
│                                  │
│  [もう一度] [ホームへ戻る]        │
│                                  │
│  🎉 バッジ解錠: 連続10問正解      │ ← 新バッジ獲得時のみ
└──────────────────────────────────┘
```

#### state

```ts
function QuizSummary() {
  const location = useLocation()
  const session = location.state as StudySession      // 前画面から受け取る
  const wrongQuestions = useMemo(() =>
    session.results.filter(r => !r.isCorrect)
      .map(r => questions.find(q => q.id === r.qid))
      .filter(Boolean),
    [session]
  )

  return (...)
}
```

#### 担当
- 🔵（NW踏襲）

---

### 6.4 4モード（+single）の出題ロジック詳細

#### `mode=topic` カテゴリ別学習

```ts
function buildTopicQuestions(categoryId: string): Question[] {
  return shuffle(allQuestions.filter(q => q.topicId === categoryId))
}
```

カテゴリ別の全問題をシャッフルして出題。

#### `mode=random` ランダム出題

```ts
function buildRandomQuestions(): Question[] {
  return shuffle(allQuestions).slice(0, 15)   // 15問
}
```

全問題からランダム15問。**問題数固定（15問）はNW踏襲**。設定で変更可とする拡張は将来検討。

#### `mode=important` 重要問題モード（**ユーザマーク基準**、PM固有）

```ts
function buildImportantQuestions(): Question[] {
  const importantIds = getImportantIds().filter(id => id.startsWith('q-'))
  if (importantIds.length === 0) {
    return []   // 空状態画面（「マーク済み問題がありません」）
  }
  return shuffle(allQuestions.filter(q => importantIds.includes(q.id)))
}
```

#### `mode=weakness` 弱点克服モード（A案 採用済み: ユーザ確定）

ユーザ確定: **直近で間違えた問題＋連続不正解の問題を優先**

```ts
function buildWeaknessQuestions(): Question[] {
  const mastery = getQuestionMastery()    // Record<string, MasteryState>

  // mastery state ごとに分類（'consecutive' は連続正解=克服済みなので除外）
  const incorrect: Question[] = []         // 直近不正解
  const correct: Question[] = []           // 直近正解（再確認候補）
  const untouched: Question[] = []         // 未挑戦

  for (const q of allQuestions) {
    const mc = mastery[`${q.id}:multiple-choice`]
    const wr = mastery[`${q.id}:written`]
    if (mc === 'incorrect' || wr === 'incorrect') {
      incorrect.push(q)
    } else if (mc === 'consecutive' || wr === 'consecutive') {
      continue   // 連続正解は除外（克服済み）
    } else if (mc === 'correct' || wr === 'correct') {
      correct.push(q)
    } else {
      untouched.push(q)
    }
  }

  // 優先順: incorrect → untouched → correct
  return [
    ...shuffle(incorrect),
    ...shuffle(untouched),
    ...shuffle(correct),
  ].slice(0, 15)
}
```

> **DP-D4-1**: 「連続不正解の問題優先」という確認A(iii) の解釈は、`mastery=incorrect` を最優先で抽出することで満たす。NWのMasteryState は `incorrect → correct → consecutive` の遷移なので、`incorrect` 状態にあるのは「直近で間違えた」または「連続不正解（一度も正解できていない）」のいずれか。両者を区別する追加フィールドは導入しない。

#### `mode=single` 単一問題モード（PM固有・新規）

```ts
function buildSingleQuestion(questionId: string): Question[] {
  const q = allQuestions.find(q => q.id === questionId)
  return q ? [q] : []
}
```

検索から個別問題にジャンプする用途。1問だけ出題し、回答後は即サマリーへ（または「もう一度／検索に戻る」ボタン）。

#### Codexの実装観点

`Quiz.tsx` の `getQuestionsForMode(mode, ...)` を以下のswitchに統合:
```ts
function getQuestionsForMode(...): Question[] {
  switch (mode) {
    case 'topic':     return buildTopicQuestions(categoryId!)
    case 'random':    return buildRandomQuestions()
    case 'important': return buildImportantQuestions()
    case 'weakness':  return buildWeaknessQuestions()
    case 'single':    return buildSingleQuestion(qid!)
    default:          return []
  }
}
```

#### 担当
- 🅒（弱点モードの判定基準は実装慎重）
- 🅒🅧 で `buildSingleQuestion` だけは Codex 委譲可能

---

### 6.5 重要問題管理画面（S22 `/settings/important`）

#### 役割
ユーザがマーク済みの問題（クイズ・公式午前II混在）を一覧表示。個別解除・部分全解除・全解除を提供。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  重要マーク管理                │
├──────────────────────────────────┤
│                                  │
│  全 24件                         │
│  [クイズ全解除] [午前II全解除]    │
│  [すべて解除]                    │
│                                  │
│ ─── クイズ問題（18件） ───         │
│ ┌────────────────────────────┐   │
│ │ ⭐ q-042: スコープベース…  │   │
│ │ カテゴリ: 計画              │   │
│ │              [解除]         │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ⭐ q-088: EVM…              │   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│                                  │
│ ─── 公式午前II（6件） ───          │
│ ┌────────────────────────────┐   │
│ │ ⭐ om-r6-q12: スコープクリープ │ │
│ │              [解除]         │   │
│ └────────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
```

#### state

```ts
function ImportantMarks() {
  const [ids, setIds] = useState(getImportantIds())

  const quizMarks = useMemo(() =>
    ids.filter(id => id.startsWith('q-'))
       .map(id => allQuestions.find(q => q.id === id))
       .filter(Boolean),
    [ids]
  )
  const morningMarks = useMemo(() =>
    ids.filter(id => id.startsWith('om-'))
       .map(id => allMorningQuestions.find(q => q.id === id))
       .filter(Boolean),
    [ids]
  )

  const handleRemove = (qid: string) => {
    toggleImportant(qid)
    setIds(getImportantIds())
  }

  const handleClearQuiz = () => {
    if (confirm('クイズの重要マークをすべて解除しますか？')) {
      clearImportantOfMode('q-')
      setIds(getImportantIds())
    }
  }

  const handleClearMorning = () => {
    if (confirm('公式午前IIの重要マークをすべて解除しますか？')) {
      clearImportantOfMode('om-')
      setIds(getImportantIds())
    }
  }

  const handleClearAll = () => {
    if (confirm('すべての重要マークを解除しますか？')) {
      clearAllImportant()
      setIds([])
    }
  }

  return (...)
}
```

#### LocalStorageアクセス
- マウント時: `pmap:important_questions` read
- 解除時: `pmap:important_questions` write

#### 担当
- 🅒（新規ページのUI判断）

---

### 6.6 単一問題出題モード（`/quiz?mode=single&q=<id>`）

検索画面（§5.7）からの個別ジャンプ用。

#### 動作仕様

| 項目 | 内容 |
|---|---|
| 出題数 | 1問のみ |
| ヘッダ表示 | 「問題 1/1」（NW踏襲） |
| 回答後の遷移 | NWと同じく解説表示→「次の問題へ」ボタン押下で**サマリー画面**へ |
| サマリー画面の特殊化 | 「もう一度」「検索に戻る」ボタンを追加表示 |
| XP・進捗更新 | 通常通り `applyAnswer` 経由 |

#### Quiz.tsx の `?q=<id>` 解釈

```ts
const singleQid = searchParams.get('q')
if (mode === 'single' && singleQid) {
  // build with single question
}
```

`q` が無効（存在しないID等）の場合は「問題が見つかりません」表示 + ホームへのリンク。

#### 担当
- 🅒（既存`Quiz.tsx`に追加実装）

---

### 6.7 §6 まとめ — クイズモード担当配分

| 画面・機能 | 主担当 | 主な作業 |
|---|---|---|
| S06 出題画面（4択/記述） | 🅒 | 既存Quiz.tsx改修、☆配置、single対応 |
| S07 サマリー | 🔵 | NW踏襲 |
| 4モード出題ロジック | 🅒 | 弱点モード実装、importantMarks連携 |
| S22 重要マーク管理 | 🅒 | 新規ページ |
| `?mode=single` | 🅒 | Quiz.tsxに分岐追加 |

---

## 7. 公式午前IIモード詳細

### 7.1 公式午前II トップ画面（S08 `/morning`）

#### 役割
公式午前IIモードのエントリポイント。年度別出題・全範囲ランダム出題・重要マークのみ出題のフィルタを提供。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  公式午前II問題                │
├──────────────────────────────────┤
│                                  │
│  IPA公式の午前II過去問を解く       │
│                                  │
│ ┌────────────────────────────┐   │
│ │ 全範囲ランダム             │   │
│ │ 問題数: ⚪10 ⚫25 ⚪50 ⚪全問 │ ← ラジオボタン4択
│ │                            │   │
│ │      [挑戦する]             │   │
│ └────────────────────────────┘   │
│                                  │
│  フィルタ:                       │
│  [⭐ 重要マークのみ]              │ ← トグル
│  [✓ 未挑戦のみ]                  │
│                                  │
│  ─── 年度別 ───                   │
│  ┌──────────────────────────┐    │
│  │ R6（2024） 80% (20/25)   │    │ ← 正答率付きカード
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ R5（2023） — (未挑戦)    │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ R4（2022） 64% (16/25)   │    │
│  └──────────────────────────┘    │
│  …                                │
│  ┌──────────────────────────┐    │
│  │ H25（2013） — (未挑戦)   │    │
│  └──────────────────────────┘    │
│                                  │
├──────────────────────────────────┤
│ 出典: 独立行政法人情報処理推進機構  │ ← フッタ（小さく）
│ （IPA）プロジェクトマネージャ試験   │
│ 午前II 過去問題                   │
└──────────────────────────────────┘
```

#### state

```ts
function OfficialMorningQuiz() {
  const [count, setCount] = useState<10 | 25 | 50 | 'all'>(25)   // デフォルト25
  const [filterImportant, setFilterImportant] = useState(false)
  const [filterUntouched, setFilterUntouched] = useState(false)

  const yearStats = useMemo(() => {
    const allQs = allMorningQuestions
    return YEARS.map(year => ({
      year,
      yearLabel: ...,
      total: allQs.filter(q => q.year === year).length,
      correctRate: getCorrectRateByYear(year, allQs),  // null = 未挑戦
    }))
  }, [])

  const handleStartRandom = () => {
    const ids = filterImportant
      ? getImportantIds().filter(id => id.startsWith('om-'))
      : allMorningQuestions.map(q => q.id)
    const filteredIds = filterUntouched
      ? ids.filter(id => getLastResult(id) === null)
      : ids

    const targetCount = count === 'all' ? filteredIds.length : Math.min(count, filteredIds.length)
    const shuffled = shuffle(filteredIds).slice(0, targetCount)

    navigate(`/morning/session`, {
      state: { questionIds: shuffled, scope: filterImportant ? 'important' : 'random' }
    })
  }

  const handleStartYear = (year: string) => {
    const yearQs = allMorningQuestions.filter(q => q.year === year)
    const filteredQs = filterImportant
      ? yearQs.filter(q => isImportant(q.id))
      : filterUntouched
        ? yearQs.filter(q => getLastResult(q.id) === null)
        : yearQs
    const shuffled = shuffle(filteredQs).map(q => q.id)   // 年度内シャッフル（要件 確認D: ユーザ確定）

    navigate(`/morning/session`, {
      state: { questionIds: shuffled, scope: 'year', yearLabel: ... }
    })
  }

  return (...)
}
```

#### LocalStorageアクセス
- マウント時: `pmap:morning:records` read（年度別正答率算出）
- マウント時: `pmap:important_questions` read（フィルタ用）

#### 担当
- 🅒（複合的UIロジック・フィルタ組み合わせ）

---

### 7.2 公式午前II 出題画面（S09 `/morning/session`）— 没入型

#### 役割
4択選択 → 即時正誤判定 → 独自解説表示 → 次の問題へ。

#### ワイヤフレーム — モバイル（回答前）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/25  ⭐(マーク)    │
├──────────────────────────────────┤
│                                  │
│ プロジェクトマネジメントにおける、 │
│ ステークホルダ・エンゲージメント・ │
│ アセスメント・マトリックスを使う   │
│ 目的はどれか。                   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ ア  現在の支持度と目標支持度 │   │
│ │     のギャップを分析する    │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ イ  プロジェクトの予算消化…  │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ウ  プロジェクトリスクを…    │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ エ  ステークホルダの…        │   │
│ └────────────────────────────┘   │
│                                  │
│  R6 問3 / カテゴリ: ステークホルダー │ ← メタ情報
│                                  │
├──────────────────────────────────┤
│ 出典: IPA…                       │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（回答後）

```
┌──────────────────────────────────┐
│  [×終了] 問題 3/25  ⭐(マーク済)  │
├──────────────────────────────────┤
│                                  │
│ プロジェクトマネジメントにおける、 │
│ …                                 │
│                                  │
│ ┌────────────────────────────┐   │
│ │ ア  ...                  ✓  │   │ ← 正解（緑）
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ イ  ...                  ✕ │   │ ← 自分が選んだ（赤）
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ ウ  ...                     │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ エ  ...                     │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌─ 独自解説 ──────────────────┐  │
│ │ ステークホルダ・エンゲージ… │  │
│ │ アセスメントマトリックスは… │  │
│ │ 現状の支持度と目標支持度を… │  │
│ └────────────────────────────┘   │
│                                  │
│ [+5 XP 獲得]                     │
│                                  │
│        [次の問題へ →]             │
│                                  │
├──────────────────────────────────┤
│ 出典: IPA…                       │
└──────────────────────────────────┘
```

#### state

```ts
interface MorningSessionState {
  questionIds: string[]
  scope: 'random' | 'year' | 'important' | 'single'   // ★DP-D4-2: 検索/誤答リストからの単一問題ジャンプ対応
  yearLabel?: string
  currentIndex: number
  selectedIndex: 0 | 1 | 2 | 3 | null
  isAnswered: boolean
  results: { qid: string; selectedIdx: number; isCorrect: boolean }[]
}

function OfficialMorningSession() {
  const location = useLocation()
  const init = location.state as { questionIds: string[]; scope: ...; yearLabel?: string }
  const [state, setState] = useState<MorningSessionState>({ ...init, currentIndex: 0, ... })

  const currentQ = allMorningQuestions.find(q => q.id === state.questionIds[state.currentIndex])!

  const handleSelect = (idx: 0 | 1 | 2 | 3) => {
    const isCorrect = idx === currentQ.correctIndex

    addMorningRecord({ questionId: currentQ.id, selectedIndex: idx, isCorrect })

    // applyAnswer 経由でXP加算（mode='morning'）
    // 注意: 公式午前IIでは updateProgress / updateQuestionMastery / addAnswerRecord は呼ばない。
    //       進捗は pmap:morning:records に記録（addMorningRecord 経由、§3.4）。
    //       applyAnswer の責務は XP計算とバッジ判定のみ（§3.7、updateProgressは内部で呼ばない）。
    const result = applyAnswer({
      questionId: currentQ.id,
      // categoryId 未割当の問題でも XP計算・バッジ判定は影響しないため
      // 形式的な topicId として 'unclassified' を渡す（categories.tsには登録しない）
      topicId: currentQ.categoryId ?? 'unclassified',
      isCorrect,
      mode: 'morning',
      difficulty: 1,                                // 公式午前IIには難易度なし → 1固定
      isImportant: isImportant(currentQ.id),
    })

    setState(prev => ({
      ...prev,
      selectedIndex: idx,
      isAnswered: true,
      results: [...prev.results, { qid: currentQ.id, selectedIdx: idx, isCorrect }],
    }))
  }

  const handleNext = () => {
    if (state.currentIndex + 1 >= state.questionIds.length) {
      // セッション完了
      const correctCount = state.results.filter(r => r.isCorrect).length
      addActivityEvent({
        type: 'morning-session',
        date, createdAt,
        xp: ...,
        payload: {
          sessionId, scope: state.scope, yearLabel: state.yearLabel,
          questionCount: state.questionIds.length,
          correctCount,
        },
      })
      navigate('/morning/summary', { state })
    } else {
      setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, isAnswered: false, selectedIndex: null }))
    }
  }

  return (...)
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| 回答時 | `pmap:morning:records` | append |
| 回答時 | `pmap:gamification` | update（applyAnswer経由） |
| ☆トグル時 | `pmap:important_questions` | update |
| セッション完了時 | `pmap:activityLog` | append (`morning-session`) |

#### 担当
- 🅒（複合的UIロジック・状態管理）

---

### 7.3 公式午前II サマリー画面（S10 `/morning/summary`）— 没入型

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│  ✓ お疲れさまでした！             │
├──────────────────────────────────┤
│                                  │
│  【セッション結果】                │
│  範囲: R6（2024） 25問           │
│                                  │
│  正答数  20 / 25                  │
│  正答率  80%                      │
│  獲得XP  +135                     │
│                                  │
│  ┌─ 誤答リスト ──────────────┐   │
│  │ ・om-r6-q3 …              │   │ ← クリックでもう一度個別出題
│  │ ・om-r6-q12 …             │   │   （?q=<id>）
│  │ ・om-r6-q18 …             │   │
│  │ ・om-r6-q21 …             │   │
│  │ ・om-r6-q24 …             │   │
│  └─────────────────────────┘     │
│                                  │
│  [もう一度]  [トップへ戻る]       │
│                                  │
├──────────────────────────────────┤
│ 出典: IPA…                       │
└──────────────────────────────────┘
```

#### state

```ts
function OfficialMorningSummary() {
  const location = useLocation()
  const session = location.state as MorningSessionState
  const correctCount = session.results.filter(r => r.isCorrect).length
  const wrongResults = session.results.filter(r => !r.isCorrect)

  return (...)
}
```

#### 担当
- 🅧（単純なサマリー表示）

---

### 7.4 著作権表記の表示

#### 表示画面と位置
| 画面 | 表示位置 | フォント |
|---|---|---|
| S08 トップ | 画面下部フッタ（コンテンツの最後） | text-xs text-slate-500 |
| S09 出題画面 | 画面下部フッタ（没入型でもbottom固定） | text-xs text-slate-500 |
| S10 サマリー | 画面下部フッタ | text-xs text-slate-500 |

#### 表記文言（共通）

```
出典: 独立行政法人情報処理推進機構（IPA）プロジェクトマネージャ試験 午前II 過去問題
```

#### コンポーネント

```tsx
// src/components/IpaCopyrightFooter.tsx 🟢
export default function IpaCopyrightFooter() {
  return (
    <footer className="text-xs text-slate-500 text-center py-2 px-4 border-t border-slate-200">
      出典: 独立行政法人情報処理推進機構（IPA）プロジェクトマネージャ試験 午前II 過去問題
    </footer>
  )
}
```

S08/S09/S10 の各ページに `<IpaCopyrightFooter />` を配置。

#### 担当
- 🅧（新規ファイル、コード提示済み）

---

### 7.5 単一問題出題モード（`/morning/session?q=<id>`）

検索（§5.7）または S10 サマリーの誤答リストからの個別ジャンプ用。

#### 動作仕様

| 項目 | 内容 |
|---|---|
| 出題数 | 1問のみ |
| ヘッダ | 「問題 1/1」 |
| 回答後 | 解説表示 → 「次の問題へ」 → S10 サマリー（特殊化: 1問のみのサマリー） |
| サマリー特殊化 | 「もう一度」「公式午前IIトップへ」「検索に戻る」（来歴によって切替） |

#### OfficialMorningSession.tsx の `?q=<id>` 解釈

```ts
const [searchParams] = useSearchParams()
const singleQid = searchParams.get('q')

useEffect(() => {
  if (singleQid) {
    setState({
      questionIds: [singleQid],
      scope: 'single',                  // ★ MorningSessionPayload.scope に追加検討
      currentIndex: 0,
      ...
    })
  } else {
    // location.state から復元（通常フロー）
  }
}, [singleQid])
```

> **DP-D4-2**: `MorningSessionPayload.scope` に `'single'` を追加するか、'random'扱いにするか。
> 採用: **`'single'` を追加**。activityLog で誤答リストからのジャンプを区別できる方が学習履歴の解釈に有用。
> → §3.8 `MorningSessionPayload.scope = 'random' | 'year' | 'important' | 'single'` へ拡張（D2-5の拡張）。

#### 担当
- 🅒（既存`OfficialMorningSession.tsx`に分岐追加、scope拡張）

---

### 7.6 §7 まとめ — 公式午前IIモード担当配分

| 画面・機能 | 主担当 | 主な作業 |
|---|---|---|
| S08 トップ | 🅒 | 複合UI（フィルタ・問題数セレクタ） |
| S09 出題 | 🅒 | 状態管理・applyAnswer連携 |
| S10 サマリー | 🅧 | 単純表示 |
| 著作権フッタ | 🅧 | 新規コンポーネント |
| `?q=<id>` 単一モード | 🅒 | 分岐追加・scope拡張 |

---

## 8. 午後Iモード詳細

午後I（PM1）の3画面（S11 一覧 / S12 公式解答 / S13 自己採点）と関連ロジックを詳細化する。
**フェーズ1ではサンプル1〜2問のみ動作確認**、本格データ投入はフェーズ2 F2-P4。

### 8.0 LocalStorageキー追補（NW踏襲＋PM固有）

NW実装では以下のキーが `AfternoonMyAnswer.tsx` で使われている。**basic_design §4.3 で未記載だったため、ここで明文化**:

| キー | 型 | 内容 | 同期対象 |
|---|---|---|---|
| `pmap:myAnswer:<problemId>` | `Record<questionPath, string>` | 自己採点中のユーザ解答（保存ボタン押下までの一時バッファ） | × |
| `pmap:savedAnswers:<recordId>` | `Record<questionPath, string>` | 採点完了時に確定保存される解答スナップショット（履歴閲覧用） | ○ |

> basic_design.md v0.8 で §4.3 LocalStorage表に上記2キーを正式記載済み（D5セルフレビューで反映）。

### 8.1 午後I 一覧画面（S11 `/afternoon`）

#### 役割
PM試験 午後I（PM1）の過去問一覧。年度×問番号のグリッド表示、スコア記録・学習計画日設定・問題詳細展開。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  午後I問題                      │
├──────────────────────────────────┤
│                                  │
│  フィルタ: [全件] [演習済] [未演習] │
│  ソート:   [スコア降順] [年度順]   │
│                                  │
│  ┌──────────────────────────┐    │
│  │ R6（2024）               │    │
│  │ ┌────────┐ ┌────────┐    │    │
│  │ │ 問1    │ │ 問2    │    │    │ ← 問題ボタン（タップで展開）
│  │ │ 65/100 │ │ — 計画 │    │    │
│  │ │ 11/15  │ │ 11/20  │    │    │
│  │ └────────┘ └────────┘    │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ R5（2023）               │    │
│  │ ┌────────┐ ┌────────┐    │    │
│  │ │ 問1    │ │ 問2    │    │    │
│  │ │ 80/100 │ │ — 未演 │    │    │
│  │ └────────┘ └────────┘    │    │
│  └──────────────────────────┘    │
│  …                                │
│  ┌──────────────────────────┐    │
│  │ H25（2013）              │    │
│  │ …                         │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（問題タップ展開時）

```
┌──────────────────────────────────┐
│ ☰  午後I問題                      │
├──────────────────────────────────┤
│  ┌──────────────────────────┐    │
│  │ R6（2024） 問1            │    │
│  │ タイトル: ステークホルダー │    │
│  │           マネジメントの…  │    │
│  │ キーワード: stakeholder, … │    │
│  │                            │    │
│  │ [問題PDF ↗]                │    │ ← IPA公式PDFリンク
│  │ [模範解答を見る]            │    │ → S12へ遷移
│  │ [自己採点する]              │    │ → S13へ遷移
│  │                            │    │
│  │ 過去のスコア:              │    │
│  │  ・2026/04/18  65点        │    │
│  │  ・2026/03/22  52点        │    │
│  │ [+スコア記録]               │    │
│  │                            │    │
│  │ 学習計画日: 2026/05/15  [編集] │ │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

#### state

```ts
type FilterMode = 'all' | 'studied' | 'unstudied'
type SortMode = 'score' | 'year'

function AfternoonProblems() {
  const [records, setRecords] = useState<PracticeRecord[]>(() => loadRecords())
  const [plans, setPlans] = useState<Record<string, string>>(() => loadPlans())
  const [filter, setFilter] = useState<FilterMode>('all')
  const [sort, setSort] = useState<SortMode>('year')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(
    () => buildRows('PM1', records, plans, sort),    // section: 'PM1' のみ
    [records, plans, sort]
  )
  const filteredRows = useMemo(() => filterRows(rows, filter), [rows, filter])

  const handleAddRecord = (problemId: string, score: number, memo?: string) => {
    const record = addRecord({ problemId, date: today(), score, memo })
    setRecords(loadRecords())

    // 問題情報は afternoonProblems から取得（ヘルパー関数は作らず find で簡素に）
    const problem = afternoonProblems.find(p => p.id === problemId)
    if (!problem) return   // 念のための防御

    // 採点完了でXP加算（applyAfternoonRecord）
    const result = applyAfternoonRecord(score, problemId)
    addActivityEvent({
      type: 'afternoon-record',
      payload: {
        problemId,
        year: problem.year,
        section: problem.section,        // 'PM1'
        number: problem.number,
        title: problem.title,
        score,
        recordId: record.id,
      },
      xp: result.xpGained,
    })
  }

  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId)
    setRecords(loadRecords())
  }

  const handleSetPlan = (problemId: string, dateYmd: string) => {
    setPlan(problemId, dateYmd)
    setPlans(loadPlans())
  }

  return (...)
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:tracker:records` | read |
| マウント時 | `pmap:tracker:plans` | read |
| スコア記録時 | `pmap:tracker:records` | append |
| スコア記録時 | `pmap:gamification` | update（applyAfternoonRecord経由） |
| スコア記録時 | `pmap:activityLog` | append (`afternoon-record`) |
| 計画日変更時 | `pmap:tracker:plans` | update |

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| Section タブ | G1 / G2 切替 | **PM1のみ**（タブUI削除） |
| `buildRows(section, ...)` | G1 or G2 | `'PM1'` 固定渡し |
| 満点 | G1=50, G2=100 | **PM1=100**（午後I 100点満点、F2-P4で要確認） |
| 年度ラベル | NWのH25〜R7 | **PM版H25〜現行**（F2-P4で投入） |

#### 担当
- 🅒（NWの`AfternoonProblems.tsx` 852行から G2タブ・G2スコア計算を除去。複雑な改修）

---

### 8.2 午後I 公式解答表示画面（S12 `/afternoon/answers/:id`）

#### 役割
IPA公式の解答例を表で表示。設問構造（大問→小問→記号）に沿った見やすいテーブル。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  R6 PM1 問1 公式解答            │
├──────────────────────────────────┤
│ ◀ 戻る                            │
│                                  │
│ タイトル: ステークホルダーマネジメント │
│                                  │
│ ┌── 設問1 ──────────────────────┐│
│ │ (1)                            ││
│ │  a: 影響度                     ││ ← essay=false → そのまま表示
│ │  b: 関心度                     ││
│ │ (2)                            ││
│ │  ステークホルダの支持を得て、   ││ ← essay=true → 文字数カウント
│ │  プロジェクトの推進を加速する… ││   表示
│ │  （42文字）                    ││
│ │ (3)                            ││
│ │  対立を早期に検知し、エンゲージ ││
│ │  メント計画を見直すため。      ││
│ │  （32文字）                    ││
│ └────────────────────────────────┘│
│ ┌── 設問2 ──────────────────────┐│
│ │ (1) リスク登録簿               ││
│ │ (2) … （45文字）               ││
│ └────────────────────────────────┘│
│                                  │
│ [自己採点する →]                  │ ← S13へ遷移
└──────────────────────────────────┘
```

#### state

```ts
function AfternoonAnswerDetail() {
  const { id } = useParams<{ id: string }>()        // 'R6-PM1-1'
  const answerSet = officialAnswers.find(a => a.id === id)
  const problem = afternoonProblems.find(p => p.id === id)

  if (!answerSet || !problem) {
    return <NotFound />
  }

  return (...)
}
```

#### コンポーネント構成

```
AfternoonAnswerDetail.tsx
├── 戻るリンク
├── 問題タイトル表示
├── AnswerTable（NW流用、setsumon階層で表示）
│   └── 各 AnswerRow を essay/symbol/number で表示分け
└── 「自己採点する」ボタン → /afternoon/answers/:id/myAnswer
```

#### LocalStorageアクセス
- なし（静的データの表示のみ）

#### 担当
- 🔵（NWそのまま流用、`section: 'PM1'` 一択になるだけ）

---

### 8.3 午後I 自己採点画面（S13 `/afternoon/answers/:id/myAnswer`）

#### 役割
ユーザが自分の解答を入力 → 公式解答と並べて比較 → 各設問に○△✕を入力 → 合計スコアを自動算出。

#### ワイヤフレーム — モバイル（解答入力フェーズ）

```
┌──────────────────────────────────┐
│ ☰  R6 PM1 問1 自己採点            │
├──────────────────────────────────┤
│ 経過時間: 23:45  [一時停止]        │ ← タイマー（NW踏襲、useTimer）
│                                  │
│ ┌── 設問1 ──────────────────────┐│
│ │ (1)                            ││
│ │  a: [_______________]          ││ ← 自分の解答入力
│ │  b: [_______________]          ││
│ │ (2)                            ││
│ │  ┌────────────────────────┐    ││
│ │  │                        │    ││ ← textarea（記述）
│ │  │                        │    ││
│ │  └────────────────────────┘    ││
│ │  現在 0文字                    ││
│ └────────────────────────────────┘│
│ ┌── 設問2 ──────────────────────┐│
│ │ …                               ││
│ └────────────────────────────────┘│
│                                  │
│ [一時保存]  [採点へ進む →]         │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（採点フェーズ）

```
┌──────────────────────────────────┐
│ ☰  R6 PM1 問1 採点                │
├──────────────────────────────────┤
│ 経過時間: 27:12（停止中）          │
│                                  │
│ ┌── 設問1 ──────────────────────┐│
│ │ (1)                            ││
│ │  a:                            ││
│ │   公式: 影響度                 ││
│ │   自分: 影響力                 ││
│ │   判定: [○] [△] [✕]            ││ ← 3択ボタン
│ │  b:                            ││
│ │   公式: 関心度                 ││
│ │   自分: 関心レベル             ││
│ │   判定: [○] [△] [✕]            ││
│ │ (2)                            ││
│ │   公式: ステークホルダの支持を…│
│ │   自分: ...                    ││
│ │   判定: [○] [△] [✕]            ││
│ └────────────────────────────────┘│
│                                  │
│ 集計:                            │
│  設問1: 8/10                     │
│  設問2: 9/15                     │
│  …                                │
│  合計: 65 / 100                  │
│                                  │
│ メモ:                            │
│ ┌────────────────────────────┐   │
│ │                            │   │ ← フリーテキスト
│ └────────────────────────────┘   │
│                                  │
│ [スコアを保存]                    │
└──────────────────────────────────┘
```

#### state

```ts
type Verdict = 'maru' | 'sankaku' | 'batsu'   // ○△✕
type MyAnswers = Record<string, string>        // questionPath -> answer
type Verdicts = Record<string, Verdict>        // questionPath -> verdict

interface PageState {
  phase: 'answering' | 'grading' | 'saved'
  myAnswers: MyAnswers
  verdicts: Verdicts
  memo: string
  startedAt: string
  elapsedSec: number
  timerRunning: boolean
}

function AfternoonMyAnswer() {
  const { id } = useParams<{ id: string }>()
  const answerSet = officialAnswers.find(a => a.id === id)!
  const scoringEntries = scoringMap[id] ?? []         // 設問ごとの配点

  const [state, setState] = useState<PageState>(() => ({
    phase: 'answering',
    myAnswers: loadMyAnswers(id!),                    // pmap:myAnswer:<id>
    verdicts: {},
    memo: '',
    startedAt: new Date().toISOString(),
    elapsedSec: 0,
    timerRunning: true,
  }))

  // タイマー
  useEffect(() => {
    if (!state.timerRunning) return
    const tick = setInterval(() => {
      setState(prev => ({ ...prev, elapsedSec: prev.elapsedSec + 1 }))
    }, 1000)
    return () => clearInterval(tick)
  }, [state.timerRunning])

  // 自動保存（onChange）
  const handleAnswerChange = (questionPath: string, value: string) => {
    setState(prev => {
      const next = { ...prev.myAnswers, [questionPath]: value }
      saveMyAnswers(id!, next)                        // pmap:myAnswer:<id> に都度保存
      return { ...prev, myAnswers: next }
    })
  }

  const handleStartGrading = () => {
    setState(prev => ({ ...prev, phase: 'grading', timerRunning: false }))
  }

  const handleVerdict = (questionPath: string, verdict: Verdict) => {
    setState(prev => ({ ...prev, verdicts: { ...prev.verdicts, [questionPath]: verdict } }))
  }

  const totalScore = useMemo(
    () => calcTotalScore(scoringEntries, state.verdicts),
    [scoringEntries, state.verdicts]
  )

  const handleSaveRecord = () => {
    const record = addRecord({
      problemId: id!,
      date: today(),
      score: totalScore,
      memo: state.memo,
    })
    saveSavedAnswers(record.id, state.myAnswers)      // pmap:savedAnswers:<recordId>

    const result = applyAfternoonRecord(totalScore, id!)
    addActivityEvent({
      type: 'afternoon-record',
      payload: { ... },
      xp: result.xpGained,
    })

    setState(prev => ({ ...prev, phase: 'saved' }))
    navigate(`/afternoon`)
  }

  return (...)
}
```

#### スコア算出ロジック（§8.4 で詳細化）

```ts
function calcTotalScore(
  entries: ScoringEntry[],   // 各設問の配点定義
  verdicts: Verdicts,
): number {
  let total = 0
  for (const entry of entries) {
    const v = verdicts[entry.questionPath]
    if (v === 'maru') total += entry.maxScore
    else if (v === 'sankaku') total += entry.partialScore
    // batsu / 未判定 は 0
  }
  return total
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:myAnswer:<problemId>` | read（前回中断分の復元） |
| 解答入力時（onChange） | `pmap:myAnswer:<problemId>` | write（自動保存） |
| スコア保存時 | `pmap:tracker:records` | append |
| スコア保存時 | `pmap:savedAnswers:<recordId>` | write（履歴用スナップショット） |
| スコア保存時 | `pmap:gamification` | update（applyAfternoonRecord経由） |
| スコア保存時 | `pmap:activityLog` | append (`afternoon-record`) |

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| キー prefix | `nwsp:myAnswer:*` `nwsp:savedAnswers:*` | `pmap:myAnswer:*` `pmap:savedAnswers:*` |
| section参照 | G1 / G2 | PM1 のみ |
| scoringMap 構造 | NW固有 | **F2-P4 で NWルール踏襲 (memory 参照)** |

#### 担当
- 🔵（NW `AfternoonMyAnswer.tsx` 706行をそのまま流用、key prefix 置換のみ）
- F1-P0 のkey prefix一括置換で対応済み

---

### 8.4 配点マップ（scoringMap）の活用

#### データ形式（NW踏襲）

```ts
// src/data/scoringMap.ts
export interface ScoringEntry {
  questionPath: string         // 'q1.(2)' or 'q2.(1).a' 等
  type: 'symbol' | 'number' | 'essay'
  maxScore: number             // ○のときの加点
  partialScore: number         // △のときの加点
  charCount?: number           // type='essay' のとき: 公式解答の文字数
}

export const scoringMap: Record<string, ScoringEntry[]> = {
  'R6-PM1-1': [
    { questionPath: 'q1.(1).a', type: 'symbol', maxScore: 2, partialScore: 1 },
    { questionPath: 'q1.(1).b', type: 'symbol', maxScore: 2, partialScore: 1 },
    { questionPath: 'q1.(2)',   type: 'essay',  maxScore: 8, partialScore: 4, charCount: 42 },
    // ...
  ],
  // ...
}
```

#### NWルール（フェーズ2 F2-P4で機械適用）

`memory/phase2_content_creation.md` 参照。要約:

| カテゴリ | 午後I 〇 | 午後I △ |
|---|---|---|
| 記号・単語 | 2点 | 1点 |
| 数字（数字・カンマ・小数点・スラッシュ・範囲記号、IPアドレス含む） | 3点 | 1点 |
| 論述（記述問題） | 文字数比例: max(5, min(10, ⌊essay文字数 / 10⌋)) | ⌊○の半分⌋ |

> PM試験の午後Iは100点満点で出題数は1問あたり12〜18設問程度。配点合計が100点になるよう調整が必要。F2-P4で実データから配点割り当てを行う。

#### 自動配点アルゴリズム（フェーズ2で実装）

```ts
function determineEntry(
  questionPath: string,
  officialAnswer: AnswerRow,   // OfficialAnswerSet.answers の各行
  section: 'PM1',
): ScoringEntry {
  const text = officialAnswer.a

  if (officialAnswer.essay) {
    const charCount = text.length
    const maxScore = Math.max(5, Math.min(10, Math.floor(charCount / 10)))
    return {
      questionPath,
      type: 'essay',
      maxScore,
      partialScore: Math.floor(maxScore / 2),
      charCount,
    }
  }

  // 数字判定（IPアドレス含む）
  if (/^[\d.,/\-〜～]+$/.test(text)) {
    return { questionPath, type: 'number', maxScore: 3, partialScore: 1 }
  }

  // それ以外は記号・単語
  return { questionPath, type: 'symbol', maxScore: 2, partialScore: 1 }
}
```

#### 担当
- F1段階: 🅧（型定義・空マップ・サンプル投入）
- F2-P4: 🅧（NWルール機械適用、`memory/phase2_content_creation.md` 参照）

---

### 8.5 §8 まとめ — 午後Iモード担当配分

| 画面・機能 | 主担当 | 主な作業 |
|---|---|---|
| S11 一覧画面 | 🅒 | G2タブ削除・PM1のみ表示 |
| S12 公式解答表示 | 🔵 | NW踏襲 |
| S13 自己採点画面 | 🔵 | NW踏襲（key prefix置換のみ） |
| scoringMap.ts | 🅧 | F1=空マップ、F2-P4で本投入 |

---

## 9. 論述トレーニング詳細

論述トレーニングモード（S14 一覧 / S15 練習 / S16 履歴詳細）は PM固有の新規機能。
※ 自動保存なし、設問ごとに明示的「下書き保存」ボタン（要件 確認B(iii) ユーザ確定）。

### 9.1 論述一覧画面（S14 `/essay`）

#### 役割
午後II 過去問の一覧表示。各問の練習履歴・最新練習日・学習計画日を表示。フィルタで未着手/練習済みを絞り込み。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  論述トレーニング               │
├──────────────────────────────────┤
│                                  │
│  フィルタ: [全件] [練習済] [未着手] │
│                                  │
│  ┌──────────────────────────┐    │
│  │ R6（2024）               │    │
│  │ ┌──────────────────────┐ │    │
│  │ │ 問1: 組織として確保…  │ │    │
│  │ │ 練習 3回 / 最新 4/18  │ │    │
│  │ │ 計画 5/15             │ │    │
│  │ └──────────────────────┘ │    │
│  │ ┌──────────────────────┐ │    │
│  │ │ 問2: 業務プロセス…   │ │    │
│  │ │ 練習 0回（未着手）    │ │    │
│  │ └──────────────────────┘ │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ R5（2023）               │    │
│  │ …                         │    │
│  └──────────────────────────┘    │
│  …（H25 まで）                   │
└──────────────────────────────────┘
```

#### state

```ts
type EssayFilter = 'all' | 'practiced' | 'untouched'

function EssayList() {
  const [filter, setFilter] = useState<EssayFilter>('all')
  const [attempts, setAttempts] = useState<EssayAttempt[]>(() => loadAttempts())
  const [plans, setPlans] = useState<Record<string, string>>(() => loadEssayPlans())

  const rows = useMemo(() =>
    essayProblems.map(problem => {
      // getAttemptsByProblem が endedAt 降順ソート済みを返す（§3.5）
      const problemAttempts = getAttemptsByProblem(problem.id)
      return {
        problem,
        attemptCount: problemAttempts.length,
        latestDate: problemAttempts[0]?.endedAt.slice(0, 10) ?? null,   // 降順なので [0] が最新
        plannedDate: plans[problem.id] ?? null,
      }
    }),
    [attempts, plans]
  )

  const filtered = useMemo(() => filterRows(rows, filter), [rows, filter])

  // 計画日変更等のハンドラ

  return (...)
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:essay:attempts` | read |
| マウント時 | `pmap:essay:plans` | read |
| 計画日変更時 | `pmap:essay:plans` | update |

#### 担当
- 🅧（新規ページ、シンプルな一覧UI）

---

### 9.2 論述練習画面（S15 `/essay/:id`）— Layout付き

#### 役割
論述問題の設問確認 → タイマー操作 → 解答入力（設問ア・イ・ウ） → 採点 → 振り返り入力 → 保存。
**離脱復帰機能**あり（`pmap:essay:active`）。

#### ワイヤフレーム — モバイル（writingフェーズ）

```
┌──────────────────────────────────┐
│ ☰  R6 PM2 問1 論述練習             │
├──────────────────────────────────┤
│ ┌─ 設問 ─────────────────────┐   │
│ │ テーマ: 組織として確保する  │   │
│ │ チーム要員の調達            │   │
│ │ [設問詳細を表示 ▼]          │   │
│ │ [問題PDF ↗]                 │   │
│ └────────────────────────────┘   │
│                                  │
│ ⏱ 経過時間: 01:23:45 [一時停止]   │ ← EssayTimer
│                                  │
│ ─── 設問ア（800字以内） ───        │
│ ┌────────────────────────────┐   │
│ │                            │   │ ← textarea
│ │                            │   │
│ └────────────────────────────┘   │
│ 462 / 800字 (推奨内 🟢)           │ ← EssayCharCounter
│ [💾 設問アを下書き保存]            │ ← 明示保存ボタン
│                                  │
│ ─── 設問イ（800〜1600字） ───       │
│ ┌────────────────────────────┐   │
│ │                            │   │
│ │                            │   │
│ └────────────────────────────┘   │
│ 0 / 800〜1600字 (不足 🔴)         │
│ [💾 設問イを下書き保存]            │
│                                  │
│ ─── 設問ウ（600〜1200字） ───       │
│ ┌────────────────────────────┐   │
│ │                            │   │
│ │                            │   │
│ └────────────────────────────┘   │
│ 0 / 600〜1200字 (不足 🔴)         │
│ [💾 設問ウを下書き保存]            │
│                                  │
│        [採点へ進む →]              │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（reviewingフェーズ）

```
┌──────────────────────────────────┐
│ ☰  R6 PM2 問1 自己採点             │
├──────────────────────────────────┤
│ 経過時間: 02:15:32（停止中）       │
│                                  │
│ あなたの解答:                    │
│ [設問ア: 462字]                  │
│ [設問イ: 1432字]                 │
│ [設問ウ: 985字]                  │
│ （各タップで内容確認）            │
│                                  │
│ 自己採点（5項目×5段階）:           │
│ ─── 題意適合 ───                  │
│   ⭐⭐⭐⭐⚪ (4)                    │
│ ─── 構造 ───                     │
│   ⭐⭐⭐⚪⚪ (3)                    │
│ ─── 具体性 ───                   │
│   ⭐⭐⭐⭐⚪ (4)                    │
│ ─── 一貫性 ───                   │
│   ⭐⭐⭐⭐⚪ (4)                    │
│ ─── 字数達成 ───                  │
│   ⭐⭐⭐⭐⭐ (5)                    │
│                                  │
│        [振り返りへ進む →]          │
└──────────────────────────────────┘
```

#### ワイヤフレーム — モバイル（reflectingフェーズ）

```
┌──────────────────────────────────┐
│ ☰  R6 PM2 問1 振り返り             │
├──────────────────────────────────┤
│                                  │
│ 振り返りメモ:                    │
│ ┌────────────────────────────┐   │
│ │ 設問イで具体的なエピソード │   │
│ │ が薄かった。次回はステーク  │   │
│ │ ホルダー会議の事例を追加。  │   │
│ │                            │   │
│ └────────────────────────────┘   │
│                                  │
│ 自己採点合計: 20/25              │
│                                  │
│        [保存して終了]              │
└──────────────────────────────────┘
```

#### state

```ts
function EssayTraining() {
  const { id } = useParams<{ id: string }>()
  const problem = essayProblems.find(p => p.id === id)!

  // 離脱復帰: pmap:essay:active から復元
  // 別問題のアクティブセッションが残っている場合は警告モーダル表示
  const [active, setActive] = useState<EssayActiveSession | null>(() => {
    const existing = loadActive()
    if (existing && existing.problemId === id) {
      // 同じ問題のアクティブセッションがある → ResumeConfirmModal で確認
      return existing
    }
    if (existing && existing.problemId !== id) {
      // ★別問題の進行中セッションを上書きする前に警告（DP-D5-3）
      return null   // null = OverwriteWarningModal を表示
    }
    return createFreshSession(id!)
  })

  // 別問題上書き警告モーダル（active === null のとき表示）
  const [_showOverwriteWarning] = useState(active === null)

  function createFreshSession(problemId: string): EssayActiveSession {
    const now = new Date().toISOString()
    const fresh: EssayActiveSession = {
      problemId,
      startedAt: now,
      pausedAt: null,
      lastResumedAt: now,
      accumulatedSec: 0,
      bodyByLabel: {},
      step: 'writing',
    }
    saveActive(fresh)
    return fresh
  }

  // タイマー描画用 1秒tick
  const [_tick, setTick] = useState(0)
  useEffect(() => {
    if (active.pausedAt !== null) return   // 一時停止中はtick不要
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [active.pausedAt])

  const elapsed = elapsedSecOf(active)

  // タイマー操作
  const handlePause = () => {
    const now = new Date().toISOString()
    const newAccum = elapsedSecOf(active)
    const next: EssayActiveSession = {
      ...active,
      pausedAt: now,
      lastResumedAt: null,
      accumulatedSec: newAccum,
    }
    setActive(next)
    saveActive(next)
  }

  const handleResume = () => {
    const next: EssayActiveSession = {
      ...active,
      pausedAt: null,
      lastResumedAt: new Date().toISOString(),
    }
    setActive(next)
    saveActive(next)
  }

  // 設問ごと「下書き保存」（明示的・自動保存なし）
  const handleSaveDraft = (label: SetsumonLabel, body: string) => {
    const next: EssayActiveSession = {
      ...active,
      bodyByLabel: { ...active.bodyByLabel, [label]: body },
    }
    setActive(next)
    saveActive(next)
  }

  // 採点フェーズへ移行
  const handleStartGrading = () => {
    const next: EssayActiveSession = { ...active, step: 'reviewing' }
    setActive(next)
    saveActive(next)
  }

  const [selfReview, setSelfReview] = useState<EssaySelfReview>({
    relevance: 3, structure: 3, concreteness: 3, consistency: 3, charCount: 3,
  })
  const [reflection, setReflection] = useState('')

  // 最終保存
  const handleFinish = () => {
    const finalElapsed = elapsedSecOf(active)
    const attempt: EssayAttempt = {
      id: crypto.randomUUID(),
      problemId: id!,
      startedAt: active.startedAt,
      endedAt: new Date().toISOString(),
      elapsedSec: finalElapsed,
      bodyByLabel: active.bodyByLabel as Record<SetsumonLabel, string>,
      selfReview,
      reflection,
    }
    saveAttempt(attempt)
    clearActive()

    // XP加算 (essay_complete)
    const result = applyEssayComplete({
      problemId: id!,
      attemptId: attempt.id,
      categoryIds: problem.categoryIds,
    })

    // ログ
    const totalChars = Object.values(attempt.bodyByLabel).reduce((sum, s) => sum + s.length, 0)
    addActivityEvent({
      type: 'essay-complete',
      payload: {
        attemptId: attempt.id,
        problemId: id!,
        yearLabel: problem.yearLabel,
        theme: problem.theme,
        elapsedSec: finalElapsed,
        totalChars,
      },
      xp: result.xpGained,
    })

    navigate(`/essay/${id}/attempts/${attempt.id}`)
  }

  return (...)
}
```

#### selfReview / reflection の永続化方針（仕様確定）

| state | 保存タイミング | 離脱時の挙動 |
|---|---|---|
| `active.bodyByLabel` （設問ア・イ・ウの解答） | **設問ごと「下書き保存」ボタン押下時** | 保存済みは復帰時に復元 |
| `selfReview` （5項目評価） | **「保存して終了」ボタン押下時のみ** | 離脱で初期値（全3）にリセット |
| `reflection` （振り返りメモ） | **「保存して終了」ボタン押下時のみ** | 離脱で空文字にリセット |
| `active.step` （writing/reviewing/reflecting） | 各遷移ボタン押下時 | 保存済み（writingに戻る場合は手動で `active.step='writing'` を更新） |

> **DP-D5-2**: selfReview/reflectionに自動保存を入れない理由は、要件定義書 確認B(iii) 「自動保存はしない、明示的な保存のみ」のユーザ確定方針に準拠。reviewing/reflectingフェーズで離脱した場合、再開時は writing フェーズの body は残るが、selfReview/reflection は最初から入力し直す仕様。

#### 確認モーダル2種

##### 1. ResumeConfirmModal（DP-P5-3、同一問題の復帰時）

```tsx
function ResumeConfirmModal({
  onResume,
  onDiscard,
}: {
  onResume: () => void                    // existing をそのまま使う
  onDiscard: () => void                   // clearActive() → 新規セッション
}) {
  return (
    <Modal>
      <h2>前回の下書きが残っています</h2>
      <p>続きから再開しますか？</p>
      <button onClick={onResume} className="bg-brand text-white">続きから再開</button>
      <button onClick={onDiscard} className="bg-slate-200">破棄して新規</button>
    </Modal>
  )
}
```

##### 2. OverwriteWarningModal（DP-D5-3、別問題の進行中セッション上書き警告）

```tsx
function OverwriteWarningModal({
  existingProblem,
  onContinueExisting,                     // 既存セッションの問題ページへ遷移
  onOverwrite,                            // clearActive() → 新規セッション
}: {
  existingProblem: EssayProblem
  onContinueExisting: () => void
  onOverwrite: () => void
}) {
  return (
    <Modal>
      <h2>別の問題で練習中です</h2>
      <p>
        現在「{existingProblem.yearLabel} 問{existingProblem.number}」の練習を
        中断中です。新しい問題を開始すると、その下書きは破棄されます。
      </p>
      <button onClick={onContinueExisting} className="bg-brand text-white">
        中断中の問題に戻る
      </button>
      <button onClick={onOverwrite} className="bg-red-500 text-white">
        破棄して新しい問題を開始
      </button>
    </Modal>
  )
}
```

> **DP-D5-3**: 別問題のアクティブセッションが残っている場合、警告なしで上書きせず、ユーザに選択肢を提示する。
> 採用: 上書き警告モーダル表示。デフォルトのCTAは「中断中の問題に戻る」（誤って破棄しないため）。

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:essay:active` | read（離脱復帰用） |
| 開始時（新規） | `pmap:essay:active` | write |
| 一時停止/再開 | `pmap:essay:active` | update（accumulatedSec, lastResumedAt） |
| 「下書き保存」ボタン押下時 | `pmap:essay:active` | update（bodyByLabel） |
| 「保存して終了」時 | `pmap:essay:attempts` | append |
| 「保存して終了」時 | `pmap:essay:active` | clear |
| 「保存して終了」時 | `pmap:gamification` | update（applyEssayComplete経由） |
| 「保存して終了」時 | `pmap:activityLog` | append (`essay-complete`) |

#### 担当
- 🅒（タイマー復帰ロジック・複合UI・状態遷移が複雑）

---

### 9.3 論述履歴詳細画面（S16 `/essay/:id/attempts/:attemptId`）

#### 役割
過去のEssayAttempt 1件を詳細表示。当時の解答全文・自己採点・振り返り・経過時間を閲覧。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  R6 PM2 問1 練習履歴             │
├──────────────────────────────────┤
│ ◀ 戻る                            │
│                                  │
│ 練習日: 2026/04/18               │
│ 経過時間: 02:15:32               │
│                                  │
│ ─── 設問ア ───                   │
│ ┌────────────────────────────┐   │
│ │ プロジェクトマネージャと     │   │ ← 当時の解答（read-only）
│ │ して、私は…                  │   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│ 462文字                          │
│                                  │
│ ─── 設問イ ───                   │
│ ┌────────────────────────────┐   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│ 1432文字                         │
│                                  │
│ ─── 設問ウ ───                   │
│ ┌────────────────────────────┐   │
│ │ ...                         │   │
│ └────────────────────────────┘   │
│ 985文字                          │
│                                  │
│ 自己採点:                        │
│  題意適合 4/5                    │
│  構造     3/5                    │
│  具体性   4/5                    │
│  一貫性   4/5                    │
│  字数達成 5/5                    │
│  合計     20/25                  │
│                                  │
│ 振り返り:                        │
│ 設問イで具体的なエピソードが…    │
│                                  │
│ [削除]   [一覧へ戻る]             │
└──────────────────────────────────┘
```

#### state

```ts
function EssayAttemptDetail() {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>()
  const attempt = getAttempt(attemptId!)
  const problem = essayProblems.find(p => p.id === id)!

  if (!attempt) return <NotFound />

  const handleDelete = () => {
    if (confirm('この練習履歴を削除しますか？')) {
      deleteAttempt(attemptId!)
      navigate(`/essay/${id}`)
    }
  }

  return (...)
}
```

#### LocalStorageアクセス

| イベント | キー | 操作 |
|---|---|---|
| マウント時 | `pmap:essay:attempts` | read |
| 削除時 | `pmap:essay:attempts` | update |

#### 担当
- 🅧（読み取り中心、シンプル）

---

### 9.4 タイマー復帰ロジック詳細

§3.5 essay.ts `elapsedSecOf` の挙動を画面側でどう使うかを補足。

#### タイマー状態遷移

```
[新規開始]
   startedAt = lastResumedAt = now
   accumulatedSec = 0
   pausedAt = null
        │
        ▼
[動作中]                        ┌──────────────┐
   表示: accumulatedSec +       │             │
         (now - lastResumedAt)  │   一時停止   │
        │                       │      ↓      │
        ├─[一時停止] ───────────┤ accumulatedSec += │
        │                       │   (now - lastResumed) │
        │                       │ pausedAt = now │
        │                       │ lastResumedAt = null │
        │                       └─────┬────────┘
        │                             │
        │                       ┌─────▼────────┐
        │                       │   再開        │
        │                       │ pausedAt = null │
        │←──[再開] ─────────────┤ lastResumedAt = now │
        │                       └──────────────┘
        ▼
[終了]
   accumulatedSec = elapsedSecOf(active) [終了時の値]
   pmap:essay:active 削除
   pmap:essay:attempts に追加
```

#### 離脱パターン

| 離脱パターン | 復帰時の挙動 |
|---|---|
| ブラウザ閉じ → 再度`/essay/:id`へ | `pmap:essay:active` から復元、ResumeConfirmModal表示 |
| 別画面へ遷移 → 戻る | 同上（`pmap:essay:active` は永続） |
| ブラウザクラッシュ | 同上（onunloadではsave不要、各操作で逐次保存済み） |
| 別の `/essay/:id'` へ遷移 | `existing.problemId !== id` の判定で新規セッション扱い。**前のセッションは `pmap:essay:active` に残るため、後で戻れば復帰可能** |

> **DP-D5-1**: 同時に複数の論述問題のアクティブセッションは持てない（`pmap:essay:active` は1つのみ）。問題切り替え時は前のセッションが上書きされる。
> 採用: **そのまま**（NW午後I `myAnswer` も同じ思想 1問1セッション）。複数並行ニーズが出たら拡張検討。

#### 担当
- 🅒（テスト含めた実装慎重）

---

### 9.5 §9 まとめ — 論述トレーニング担当配分

| 画面・機能 | 主担当 | 主な作業 |
|---|---|---|
| S14 一覧 | 🅧 | シンプルな一覧UI |
| S15 練習画面 | 🅒 | 複合UI・タイマー復帰・3フェーズ遷移 |
| S16 履歴詳細 | 🅧 | 読み取り中心 |
| タイマー復帰ロジック | 🅒 | elapsedSecOf 統合 |

---

## 10. 周辺機能詳細

D5までで扱わなかった周辺機能（履歴・バッジ・同期・設定）の画面詳細。

### 10.1 学習履歴画面（S19 `/history`）

#### 役割
日次/週次のXP獲得・学習活動を時系列で可視化。NWの `ActivityHistory.tsx` を流用。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  学習履歴                       │
├──────────────────────────────────┤
│                                  │
│ 直近30日のXP                     │
│ ┌────────────────────────────┐   │
│ │   ▁ ▂ ▃ ▅ ▇ █ ▅ ▃ ▂…       │   │ ← XpChart（NW流用）
│ └────────────────────────────┘   │
│                                  │
│ 累計XP: 12,450  Lv.18            │
│                                  │
│ ─── 直近の活動 ───                │
│ ┌────────────────────────────┐   │
│ │ 2026/05/05                  │   │
│ │   ✏ クイズセッション完了    │   │ ← ActivityEvent列挙
│ │      +145 XP（12/15正解）   │   │
│ │   📃 公式午前II R6セッション │   │
│ │      +60 XP（10/15正解）    │   │
│ │   📒 ノート理解度: stakeholder │ │
│ │      +5 XP                   │   │
│ ├────────────────────────────┤   │
│ │ 2026/05/04                  │   │
│ │   ✍ 論述完了 R5 PM2 問1     │   │
│ │      +200 XP                 │   │
│ │   ...                        │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

#### NW流用要素
- `<XpChart>` — 日次XPバーチャート
- `<StudyHistoryList>` — 活動イベント一覧

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| イベント種別表示 | 4種（quiz/note/badge/afternoon） | **6種**（+ morning-session, essay-complete） |
| アイコン | NW用 | morning用📃, essay用✍ を追加 |
| 文言 | NW固有 | PM文脈 |

#### LocalStorageアクセス
- マウント時: `pmap:activityLog` read
- マウント時: `pmap:gamification` read（累計XP・Lv表示）

#### 担当
- 🅒（NW `ActivityHistory.tsx` の改修。新イベント種別の表示追加）

---

### 10.2 バッジ画面（S18 `/badges`）

#### 役割
解錠済み・未解錠バッジを一覧表示。各バッジの解錠条件・進捗を表示。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  バッジ                         │
├──────────────────────────────────┤
│                                  │
│ 解錠 18 / 全 45                   │
│ [████░░░░░░] 40%                 │
│                                  │
│ ─── ブロンズ（解錠 8/15） ───      │
│ ┌────────────────────────────┐   │
│ │ 🥉 初挑戦                   │   │ ← 解錠済み
│ │ クイズに1問挑戦            │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 🥉 ノート読破              │   │
│ │ 1カテゴリ理解度全🟢         │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ 🔒 連続正解10               │   │ ← 未解錠（グレー）
│ │ 連続10問正解  [7/10]        │   │   進捗バー
│ └────────────────────────────┘   │
│                                  │
│ ─── シルバー（解錠 6/15） ───      │
│ …                                │
│                                  │
│ ─── ゴールド（解錠 4/15） ───      │
│ …                                │
└──────────────────────────────────┘
```

#### NW流用要素
- `<BadgeMedal>` — バッジアイコン表示
- バッジ階層（Bronze/Silver/Gold）はNW踏襲

#### NWからの差分（フェーズ2 F2-P6 で再設計）

| 項目 | NW | PM (F2-P6後) |
|---|---|---|
| バッジ総数 | 45（NW固有） | 同等程度（要再設計） |
| 削除対象 | — | NW午後II関連（直接ない可能性大） |
| 新規追加 | — | 論述系（初回完了/5回/10回/30回/全カテゴリ網羅） |
| しきい値 | NW学習量基準 | PM学習量基準（要調整） |

> F1段階では NWの `badges.ts` をそのままコピーし、画面表示は動くが**条件は NW固有のため意味的に合わないものが含まれる**状態。F2-P6 で再設計。

#### LocalStorageアクセス
- マウント時: `pmap:gamification` read（unlockedBadgeIds）

#### 担当
- 🔵（NW `Badges.tsx` 流用、F1段階は変更不要）
- F2-P6: 🅒（バッジ条件再設計）

---

### 10.3 デバイス同期画面（S20 `/sync`）

#### 役割
QRコード経由で別端末へデータを移行・受領。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  デバイス同期                   │
├──────────────────────────────────┤
│                                  │
│ [📤 送信]  [📥 受信]              │ ← タブ切替
│                                  │
│ ─── 送信 ───                     │
│ このデバイスの学習データをQRコード  │
│ で送信します。                   │
│                                  │
│ デバイスID: pm-aB3xY9...         │
│ データサイズ: 推定 12 KB          │
│                                  │
│   ┌────────────────────┐         │
│   │ ████ ▓▓ ███▓▓▓ ██  │         │ ← QRコード
│   │ ▓▓ ████ ██ ▓▓▓ ██ │         │   （複数枚に分割される
│   │ ████ ▓▓ ████ ███▓ │         │    ことあり）
│   └────────────────────┘         │
│   1 / 3                          │
│   [前へ]   [次へ]                 │
│                                  │
│ [QRを保存] [一覧へ戻る]           │
└──────────────────────────────────┘
```

#### NW流用要素
- `<SyncQrDisplay>` — QRコード表示・分割
- `<SyncQrScanner>` — カメラスキャン
- `<SyncPreview>` — 受信データのプレビュー
- `lib/sync/codec.ts` — エンコード・デコード
- `lib/sync/package.ts` — パッケージング
- `lib/sync/merge.ts` — マージ

#### NWからの差分
- `lib/sync/types.ts` の SYNC_PREFIX を `PMAP-SYNC-v1:` に変更（§3.9）
- `lib/sync/adapters.ts` の同期対象キーリストにPM固有キーを追加（§3.9）

#### LocalStorageアクセス
- 送信時: 全 `pmap:*` の同期対象キーをread
- 受信時: 同上をmerge後write

#### 担当
- 🔵（NWそのまま流用）

---

### 10.4 設定画面（S21 `/settings`）

#### 役割
データリセット・重要マーク管理リンク・アプリバージョン表示・統計サマリ。

#### ワイヤフレーム — モバイル

```
┌──────────────────────────────────┐
│ ☰  設定                           │
├──────────────────────────────────┤
│                                  │
│ ─── マーク管理 ───                 │
│ ⭐ 重要マーク管理                  │ ← /settings/important
│   24件 [→]                        │
│                                  │
│ ─── 統計 ───                     │
│ クイズ解答数: 235問              │
│ クイズ正答率: 78%                │
│ 公式午前II挑戦: 50問              │
│ 公式午前II正答率: 64%            │
│ 午後I 演習回数: 8回              │
│ 論述 練習回数: 5回               │
│ 解錠バッジ: 18 / 45              │
│ 累計XP: 12,450                   │
│ レベル: 18                       │
│                                  │
│ ─── データ管理 ───                 │
│ ⚠ すべてのデータをリセット         │ ← 確認モーダル付き
│                                  │
│ ─── アプリ情報 ───                 │
│ バージョン: v0.0.0                │
│ デプロイ: mamiya-pmapp.vercel.app │
│                                  │
└──────────────────────────────────┘
```

#### state

```ts
function Settings() {
  const importantCount = useMemo(() => getImportantIds().length, [])
  const stats = useMemo(() => {
    const records = getAnswerRecords()
    const quizRecords = records.filter(r => r.questionId.startsWith('q-'))
    const quizCorrect = quizRecords.filter(r => r.isCorrect).length
    const game = loadGamification()
    return {
      quizAnswered: quizRecords.length,
      quizCorrectRate: quizRecords.length > 0
        ? Math.round((quizCorrect / quizRecords.length) * 100)
        : null,
      morningAnswered: loadMorningRecords().length,
      morningCorrectRate: getCorrectRateOverall(),    // null = 未挑戦（UI側で表示分岐）
      afternoonRecordCount: loadRecords().length,
      essayAttemptCount: loadAttempts().length,
      badgeUnlocked: game.unlockedBadgeIds.length,
      totalXp: game.xp,
      level: getLevelFromXp(game.xp),
    }
  }, [])

  const handleReset = () => {
    if (confirm('本当にすべてのデータをリセットしますか？\nこの操作は取り消せません。')) {
      resetAllData()
      window.location.reload()
    }
  }

  return (...)
}
```

#### LocalStorageアクセス
- マウント時: 各種統計取得のため複数キーをread
- リセット時: `resetAllData()` で全 `pmap:*` 削除（§3.2）

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| 統計 | NW観点 | **morning/essay 追加** |
| 重要マーク管理 | なし | **`/settings/important` リンク追加** |
| バージョン表示 | NW VERSION_LABEL | PM VERSION_LABEL |

#### 担当
- 🅒（既存`Settings.tsx`の改修、新統計追加）

---

### 10.5 §10 まとめ — 周辺機能担当配分

| 画面・機能 | 主担当 | 主な作業 |
|---|---|---|
| S19 学習履歴 | 🅒 | 新イベント種別追加 |
| S18 バッジ | 🔵 | NW踏襲（F2-P6で再設計） |
| S20 デバイス同期 | 🔵 | NWそのまま流用 |
| S21 設定 | 🅒 | 統計拡張・重要マーク管理リンク追加 |

---

## 11. PWA・同期詳細

### 11.1 PwaInstallPrompt 実装詳細

#### 動作仕様

```
[ページロード]
   ↓
[beforeinstallprompt イベント取得]
   - event.preventDefault()
   - event を state に保持
        ↓
[条件チェック]
   - localStorage 'pmap:install_prompt_dismissed' === true でない
   - aleady standalone でない（matchMedia '(display-mode: standalone)'）
        ↓
[バナー表示]
   ┌───────────────────────┐
   │ ホーム画面に追加        │
   │ [追加] [閉じる]         │
   └───────────────────────┘
        ↓
[追加クリック]
   - event.prompt() を呼ぶ
   - userChoice を待つ
   - 結果に関わらずバナー閉じる

[閉じるクリック]
   - localStorage に dismissed=true を保存（再表示しない）
```

#### コード（NW流用）

```tsx
// src/components/PwaInstallPrompt.tsx 🔵
function PwaInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)

      const dismissed = localStorage.getItem('pmap:install_prompt_dismissed') === 'true'
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!dismissed && !isStandalone) {
        setShow(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ...
}
```

#### 担当
- 🔵（NW流用、LocalStorageキーprefixのみ変更）

---

### 11.2 QR同期の流れ・コーデック

#### 送信フロー

```
[Send タブ起動]
   ↓
[全LocalStorage読み込み]
   - `pmap:*` で同期対象キーを集約（§3.9 KEYS定数）
   - LocalSyncState オブジェクト構築
        ↓
[SyncPackage 生成]
   - device_id 付与
   - vector / events 計算
   - createdAt
   - checksum
        ↓
[lz-string で圧縮]
   ↓
[QRコード分割]
   - ペイロード長で複数QRに分割（NW実装）
   - 各QRに連番付与（1/3, 2/3, 3/3）
        ↓
[<SyncQrDisplay> で順次表示]
   - ユーザが受信端末でスキャン
```

#### 受信フロー

```
[Receive タブ起動]
   ↓
[<SyncQrScanner> でカメラ起動]
   ↓
[QR連続スキャン]
   - 1/3 → 2/3 → 3/3 までデータ集約
   - 全部揃ったら復号
        ↓
[lz-string で展開]
   ↓
[SyncPackage 検証]
   - checksum 確認
   - schemaVersion 確認
   - app id 確認 ('pmap-learning-app')
        ↓
[<SyncPreview> でプレビュー]
   - 追加される answer_records 件数
   - 追加される afternoon_record 件数
   - 追加される morning_record 件数（PM追加）
   - 追加される essay_attempt 件数（PM追加）
   - 追加される important_questions 件数（PM追加）
   - 追加される XP 量
        ↓
[ユーザ確認 → 取り込み]
   - mergeLocalState() 実行
   - 配列キー: 集合和（unique by id）
   - Mapキー: タイムスタンプ新しい方
   - GamificationState: 大きい方優先
```

#### NWからの差分

| 項目 | NW | PM |
|---|---|---|
| `SYNC_PREFIX` | `NWSP-SYNC-v2:` | `PMAP-SYNC-v1:` |
| `app id` | `'nwsp-learning-app'` | `'pmap-learning-app'` |
| 同期対象キー（固定キー） | NW 13種 | **PM 17種**（important_questions / morning:records / essay:attempts / essay:plans 追加） |
| 同期対象キー（ワイルドカード） | NW 1種（savedAnswers） | **PM 1種**（savedAnswers、prefix置換のみ） |
| プレビュー項目 | NW 4種 | **PM 7種**（morning_record / essay_attempt / important_questions 加算） |

#### 担当
- 🅒🅧（型・キーリスト追加は🅧、マージロジック検証は🅒）

---

## 12. ブランド適用マップ（NW青→PM紫の機械置換表）

F1-P6 で実施する機械置換の対象一覧。Codexがgrep+sedで一括置換できるよう完全形で記載。

### 12.1 Tailwind色クラス置換表

| NW（置換前） | PM（置換後） | 用途 |
|---|---|---|
| `bg-blue-50` | `bg-brand-light` | 淡い背景・タグ |
| `bg-blue-100` | `bg-brand-light` | 同上（NWで100を使ってる箇所） |
| `bg-blue-500` | `bg-brand` | プライマリボタン |
| `bg-blue-600` | `bg-brand` | プライマリボタン（NWの主要色） |
| `bg-blue-700` | `bg-brand-dark` | hover状態 |
| `bg-blue-800` | `bg-brand-dark` | アクティブ状態 |
| `bg-blue-900` | `bg-brand-darker` | 最暗 |
| `text-blue-50` | `text-brand-light` | （ヘッダ上の薄文字） |
| `text-blue-100` | `text-white/80` | ヘッダ上の薄文字（白系へ変更が自然） |
| `text-blue-200` | `text-white/85` | 同上 |
| `text-blue-500` | `text-brand` | リンク・強調 |
| `text-blue-600` | `text-brand` | 同上 |
| `text-blue-700` | `text-brand-dark` | 暗めリンク |
| `text-blue-900` | `text-brand-darker` | 強調テキスト |
| `border-blue-200` | `border-brand-light` | 淡い枠線 |
| `border-blue-300` | `border-brand-light` | |
| `border-blue-400` | `border-brand` | |
| `border-blue-500` | `border-brand` | |
| `border-blue-600` | `border-brand-dark` | |
| `ring-blue-*` | `ring-brand` | フォーカスリング |
| `from-blue-*` | `from-brand` | グラデーション開始 |
| `to-blue-*` | `to-brand-dark` | グラデーション終了 |
| `decoration-blue-*` | `decoration-brand` | 下線色 |

### 12.2 ハードコードされた色値置換表

| NW | PM |
|---|---|
| `#1e40af` | `#9d5b8b` |
| `#1a3a5c`（NWヘッダ・サイドバー） | `#9d5b8b` |
| `#3b82f6`（NWボタン系） | `#9d5b8b` |
| `#1d4ed8` | `#7d4570` |
| `#dbeafe`（NWバナー背景） | `#f5e9f1` |

> **★F1-P-1 追加注意（D-UI-02）**: NW の `src/components/Layout.tsx` line 216, 267 では `style={{ backgroundColor: '#1a3a5c' }}` の形で **inline style に hex を直書き** している。`sed` での hex 置換だけで `#9d5b8b` に変わるが、できれば F1-P6 機械置換後に **Tailwind クラス `bg-brand` に手動でリライト** することを推奨（保守性向上）。
>
> ```tsx
> // F1-P6 機械置換直後（最低限の動作）
> style={{ backgroundColor: '#9d5b8b' }}
>
> // F1-P6 Step 4（推奨形、手動リライト）
> className="bg-brand text-white shadow-md"
> ```
>
> 該当箇所:
> - `src/components/Layout.tsx` line 216（ヘッダ）
> - `src/components/Layout.tsx` line 267（サイドバー）

### 12.3 機械置換手順（F1-P6 Step 2 詳細）

```bash
cd D:/Claude/PMpro/PM-learning_app-pro/src

# Tailwind クラス置換（順次）
sed -i 's/bg-blue-50/bg-brand-light/g' $(grep -rl "bg-blue-50" .)
sed -i 's/bg-blue-100/bg-brand-light/g' $(grep -rl "bg-blue-100" .)
sed -i 's/bg-blue-500/bg-brand/g' $(grep -rl "bg-blue-500" .)
sed -i 's/bg-blue-600/bg-brand/g' $(grep -rl "bg-blue-600" .)
sed -i 's/bg-blue-700/bg-brand-dark/g' $(grep -rl "bg-blue-700" .)
sed -i 's/bg-blue-800/bg-brand-dark/g' $(grep -rl "bg-blue-800" .)
sed -i 's/bg-blue-900/bg-brand-darker/g' $(grep -rl "bg-blue-900" .)
# text-blue-* も同様
sed -i 's/text-blue-100/text-white\\/80/g' $(grep -rl "text-blue-100" .)
sed -i 's/text-blue-200/text-white\\/85/g' $(grep -rl "text-blue-200" .)
sed -i 's/text-blue-500/text-brand/g' $(grep -rl "text-blue-500" .)
sed -i 's/text-blue-600/text-brand/g' $(grep -rl "text-blue-600" .)
sed -i 's/text-blue-700/text-brand-dark/g' $(grep -rl "text-blue-700" .)
sed -i 's/text-blue-900/text-brand-darker/g' $(grep -rl "text-blue-900" .)
# border / ring / from / to / decoration も同様
sed -i 's/#1e40af/#9d5b8b/g' $(grep -rl "#1e40af" .)
sed -i 's/#1a3a5c/#9d5b8b/g' $(grep -rl "#1a3a5c" .)
sed -i 's/#3b82f6/#9d5b8b/g' $(grep -rl "#3b82f6" .)
sed -i 's/#1d4ed8/#7d4570/g' $(grep -rl "#1d4ed8" .)
sed -i 's/#dbeafe/#f5e9f1/g' $(grep -rl "#dbeafe" .)

# 残存確認（0件になるべき）
grep -rE "bg-blue-|text-blue-|border-blue-|ring-blue-|from-blue-|to-blue-|decoration-blue-|#1e40af|#1a3a5c" .
```

### 12.4 機能色（変更しないもの）

以下のNW固有色は **意味的色（機能色）** として残す:

| 色 | 用途 | 残す理由 |
|---|---|---|
| `emerald-*` (緑系) | 成功・正解・🟢理解度 | アクセシビリティ慣習色 |
| `amber-*` (黄系) | 警告・推奨内・🟡理解度 | 同上 |
| `red-*` (赤系) | エラー・不正解・🔴理解度 | 同上 |
| `slate-*` (灰系) | 中立・サブテキスト | デザインシステム色 |

### 12.5 担当
- 🅧（機械置換、Codex指示書で実施）
- 🅒（実施後の目視確認・例外ケース対応）

---

## 13. QA動作確認チェックリスト

実装完了後・本番デプロイ前に実施する目視チェックリスト。
本ドキュメントを `tasks/qa/` 配下にコピーして、消し込みながら使う。

### 13.1 F1段階 QA（骨組み完了後）

#### F1-P0 スキャフォールド
- [ ] `npm install` がエラーなし
- [ ] `npm run dev` で http://localhost:5173 起動
- [ ] ホーム画面が表示される
- [ ] サイドバーにブランドカラー（`#9d5b8b`）が反映
- [ ] ロゴ（PWAアイコン）がヘッダに表示
- [ ] LocalStorage を DevTools で確認、`pmap:*` プレフィックスのキーが空状態
- [ ] `/login` にアクセスすると 404 or ホームへリダイレクト
- [ ] `npm run build` がエラーなし

#### F1-P1 カテゴリ・サイドバー
- [ ] サイドバーに 15項目（プロトコル/コラムなし）
- [ ] サイドバーから「公式午前II問題」「論述トレーニング」リンクあり
- [ ] `/notes` で 12カテゴリのカードが表示
- [ ] `/notes/<categoryId>` で「準備中」表示

#### F1-P2 重要マーク
- [ ] クイズ画面で☆ボタンが表示・トグル可能
- [ ] LocalStorage `pmap:important_questions` に `q-001` 形式IDが保存される
- [ ] 重要モード起動でマーク済みのみ出題
- [ ] マーク0件で重要モード起動時「マーク済み問題がありません」表示
- [ ] `/settings/important` で一覧・解除動作
- [ ] 重要マーク済みでも正解で自動解除されない（DP-P2-1）

#### F1-P3 午後I 骨組み
- [ ] `/afternoon` でPM1のサンプル2件表示
- [ ] G2タブが画面上に存在しない
- [ ] `/afternoon/answers/<id>` で公式解答画面
- [ ] `/afternoon/answers/<id>/myAnswer` で自己採点UI
- [ ] スコア記録 → `pmap:tracker:records` に保存

#### F1-P4 公式午前II 骨組み
- [ ] `/morning` で年度カードと「全範囲ランダム」ボタン
- [ ] 問題数セレクタ動作（10/25/50/全問、デフォルト25）
- [ ] 「重要マークのみ」フィルタが動作
- [ ] 年度選択 → シャッフル出題
- [ ] 4択選択 → 正誤判定 → 独自解説表示
- [ ] ☆トグル動作
- [ ] サマリー表示・`pmap:morning:records` 記録
- [ ] 画面下部にIPA出典表記

#### F1-P5 論述トレーニング 骨組み
- [ ] `/essay` 一覧表示
- [ ] `/essay/<id>` 設問・タイマー・解答エリア表示
- [ ] タイマー1秒間隔更新
- [ ] 一時停止・再開動作
- [ ] 文字数カウンタ表示・色変化
- [ ] 「下書き保存」で `pmap:essay:active` 保存
- [ ] **オートセーブ無し**（手動保存のみ）
- [ ] 「採点へ進む」で5項目評価UI
- [ ] 「保存して終了」で `pmap:essay:attempts` 追加・active削除
- [ ] XP+200 加算
- [ ] 履歴詳細画面表示
- [ ] 別問題のアクティブセッションがあると警告モーダル表示（DP-D5-3）

#### F1-P6 ブランド適用・初回デプロイ
- [ ] grep `bg-blue-` `text-blue-` `#1e40af` 等が0件
- [ ] mamiya-pmapp.vercel.app で表示
- [ ] PWAインストール後にスタンドアロン表示
- [ ] 全画面でbrand色統一

### 13.2 横断確認

#### LocalStorage整合
- [ ] DevTools → Application → Local Storage で `pmap:*` プレフィックス統一
- [ ] `nwsp:` プレフィックスが残存していない
- [ ] resetAllData で全 `pmap:*` 削除

#### XP整合
- [ ] クイズ正解で +XP（4択 vs 記述で異なる）
- [ ] 公式午前II正解で +5XP
- [ ] 午後I採点完了で +XP
- [ ] 論述完了で +200XP
- [ ] ノート理解度設定で +XP（green=5/yellow=3/red=1）
- [ ] **二重加算なし**（activityLog.xp と gamification.xp が乖離していない）

#### バッジ
- [ ] バッジ画面でNW固有用語の不自然な表記なし（F1段階では多少残るが、F2-P6で再設計）

#### QR同期
- [ ] 同期送信→QR表示
- [ ] 同期受信→プレビュー→マージ
- [ ] マージ後 `pmap:important_questions` `pmap:morning:records` `pmap:essay:attempts` `pmap:essay:plans` が反映

#### PWA
- [ ] manifest.json の name `PM Learning App`
- [ ] theme_color `#9d5b8b`
- [ ] アイコン2サイズ（192/512）配置済み
- [ ] オフラインで動作

### 13.3 F2段階 QA（コンテンツ投入後）

#### F2-P1 ノート
- [ ] 12カテゴリ全てに本文表示
- [ ] 赤字マスク機能動作
- [ ] セクション理解度設定動作

#### F2-P2 クイズ問題
- [ ] 各カテゴリ50問以上
- [ ] 4択モード正常動作
- [ ] 記述モード自己判定動作
- [ ] 全問題のchoicesに正解含む

#### F2-P3 公式午前II データ
- [ ] H25〜現行 全年度のカード表示
- [ ] 各年度25問が解ける
- [ ] 全問に独自解説あり
- [ ] IPA出典表記の文言正確

#### F2-P4 午後I データ
- [ ] H25〜現行 全年度の午後I表示
- [ ] 自己採点が正常動作
- [ ] 配点マップで合計100点

#### F2-P5 論述問題
- [ ] H25〜現行 全年度の午後II問題表示
- [ ] 設問ごとに推奨字数が設定済み

#### F2-P6 仕上げ
- [ ] バッジ条件がPMコンテキストで意味を持つ
- [ ] 論述系バッジ動作
- [ ] 本番デプロイ成功
- [ ] mamiya-pmapp.vercel.app で全機能動作
- [ ] PWAインストールで本番動作確認

### 13.4 担当
- QA実行: 🅧（チェックリスト消化）
- 不具合判定・修正: 🅒

---

## 14. デプロイ手順

### 14.1 初回セットアップ（F1-P6 で実施）

```bash
# 1. Vercel CLI インストール（初回のみ、グローバル）
npm i -g vercel

# 2. ログイン（初回のみ）
cd D:/Claude/PMpro/PM-learning_app-pro
vercel login
# ブラウザでGitHubアカウント等でログイン

# 3. プロジェクト紐付け（初回のみ）
vercel link
# プロジェクト名: mamiya-pmapp
# scope: 個人アカウント

# 4. 初回デプロイ（プレビュー環境）
vercel
# ランダムなURLが発行される
```

### 14.2 本番デプロイ

```bash
# vercel.json は NWからコピー済みなので追加設定不要
vercel --prod
# → mamiya-pmapp.vercel.app に公開
```

### 14.3 GitHub連携（推奨、自動デプロイ）

```bash
# 1. Vercelダッシュボードで GitHub リポジトリと連携
# 2. mainブランチへのpushで自動デプロイ
# 3. PRごとにプレビュー環境が立つ
```

連携後は `git push origin main` で自動デプロイ。`vercel --prod` 手動実行は不要。

### 14.4 環境変数

PMアプリは環境変数を必要としない（API Key等なし、純粋クライアントSPA）。

ただし正式版で認証パスワードを変更する場合は:
- `src/auth/credentials.ts` に SHA256 ハッシュを直接記載（環境変数化はしない）

### 14.5 ロールバック

```bash
# Vercel CLI で過去のデプロイを再有効化
vercel ls                       # デプロイ一覧
vercel promote <deployment-url> # 指定デプロイを本番化
```

または Vercel ダッシュボードから操作可能。

### 14.6 PWA動作確認（デプロイ後）

1. `https://mamiya-pmapp.vercel.app/` を Chrome で開く
2. アドレスバー右の「インストール」アイコンを確認
3. インストール → ホーム画面アイコンで起動
4. オフライン状態でも各画面が表示されることを確認
5. theme_color (`#9d5b8b`) がスタートアップ画面に反映

### 14.7 デプロイチェックリスト

- [ ] `npm run build` がエラーなし
- [ ] `dist/` のサイズが妥当（NW実績程度）
- [ ] manifest.json が正しい
- [ ] PWAアイコンが配置されている
- [ ] vercel.json の設定正常
- [ ] vercel --prod 成功
- [ ] mamiya-pmapp.vercel.app でアクセス可能
- [ ] PWAインストール可能
- [ ] LocalStorage動作確認

### 14.8 担当
- 🅒（Vercel初期セットアップ、本番デプロイ判断）

---

## 付録 A: Codex 作業指示書テンプレート

Claudeセッションで「Codex担当」と判断したタスクは、以下のテンプレートで指示書を作成し `tasks/codex/<task-id>.md` にコミットする。Codexは指示書を読んで作業し、PRなしでmainに直接pushする。

### A.1 テンプレート

```markdown
# Codex 作業指示書: <タスクID> <タスク名>

> 作成: Claude（YYYY-MM-DD）
> 対象タスク: <F1-PX or F2-PX>
> 想定所要時間: <概算>

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用
- 不明点があれば**自己判断せず**、`tasks/questions/<task-id>.md` に記録して push（実装はそこで停止）

## 1. 作業概要
<1〜3行で目的を記述>

## 2. 前提
- 関連ドキュメント:
  - `requirements.md` v0.4 §<該当章>
  - `basic_design.md` v0.4 §<該当章>
  - `detailed_design.md` v0.x §<該当章>
- 必要な前タスク完了状況: <列挙>

## 3. 入力ファイル（読むだけ）
- `<path1>`
- `<path2>`

## 4. 出力ファイル（作成または編集）
- `<path1>`（新規）
- `<path2>`（編集）

## 5. 作業手順

### Step 1: <内容>
具体的なコマンド or コード片を提示。

```bash
# コマンド例
```

```ts
// コード例
```

### Step 2: ...

## 6. 完了条件（DoD）
- [ ] <ファイルが存在する／変更されている>
- [ ] `npm run build` がエラーなく完了
- [ ] `npm run dev` で起動して<該当画面>が表示
- [ ] 期待される動作が確認できる

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない
- ❌ `npm install` で新規パッケージを追加しない（既存の依存のみ使用）。必要なら §A.3 の質問機構に記録
- ❌ `git push --force` 禁止
- ⚠️ 既存コードの大規模リファクタリングは禁止（指示書の範囲だけ変更）

## 8. 完了後のgit操作
```bash
git add <変更ファイル>
git commit -m "[X] <タスクID> <短い内容>"
git push origin main
```

## 9. レビュー
完了push後、Claudeがレビューする。
レビュー結果は `tasks/reviews/<task-id>_review.md` に記録される。
```

### A.2 指示書ファイル名規約

- `tasks/codex/<task-id>_<short-desc>.md`
- 例: `tasks/codex/F1-P0_step02_delete_files.md`
- 例: `tasks/codex/F1-P1_categories.md`

### A.3 Codexが質問できる仕組み

不明点はCodexが自己判断せず、`tasks/questions/<task-id>.md` を作成してpush。Claudeは次のレビューセッションで質問に回答し、追記された指示書を再度Codexに渡す。

```markdown
# 質問: <タスクID>

## Codexからの質問
- Q1: <質問>
- Q2: <質問>

## Claudeからの回答（後追記）
- A1: <回答>
- A2: <回答>
```

---

## 付録 B: Claude レビュー観点チェックリスト

Codexが`[X]` commitをpushした直後、Claudeがレビューセッションを開始。以下の観点でチェック:

### B.1 git diff レビュー手順

```bash
git pull origin main
git log --oneline -5                           # 直近のCodex commitを特定
git show <Codex commit hash>                  # 変更内容を表示
# または
git diff HEAD~1 HEAD                          # 直前commitとの差分
```

### B.2 レビュー観点（5カテゴリ）

#### B.2.1 仕様適合
- [ ] 指示書の「完了条件」を全て満たしているか
- [ ] 指示書の範囲外のファイルが変更されていないか
- [ ] 指示書のステップが全て実施されているか
- [ ] 出力されるべきファイルが全て存在するか

#### B.2.2 コード品質
- [ ] TypeScriptの型エラーが残っていないか（`npm run build` の結果）
- [ ] ESLintエラーが残っていないか
- [ ] NWアプリの命名・スタイル規約を踏襲しているか
- [ ] 既存ファイルの不要なフォーマット変更（インデント揺れ等）が無いか

#### B.2.3 既存コードとの整合
- [ ] importパスが正しいか
- [ ] 型定義の重複・矛盾がないか（types/index.ts と各ファイルで二重定義など）
- [ ] LocalStorageキーが `pmap:` prefixで統一されているか（NW由来の `nwsp:` が残っていないか）
- [ ] ブランドカラー（`bg-brand` 等）が正しく使われているか

#### B.2.4 動作確認
- [ ] `npm run dev` で起動するか
- [ ] 該当画面の表示・遷移が期待通りか
- [ ] LocalStorageに想定通りのデータが書かれるか
- [ ] コンソールエラー・警告が無いか

#### B.2.5 セキュリティ・PII
- [ ] APIキー・パスワード等の秘密情報がハードコードされていないか
- [ ] `.env`等の環境変数ファイルがコミットされていないか
- [ ] `dangerouslySetInnerHTML` 等の危険APIが使われていないか

### B.3 レビュー記録テンプレート

`tasks/reviews/<task-id>_review.md` に記録:

```markdown
# レビュー: <タスクID> <タスク名>

> レビュー日時: YYYY-MM-DD
> レビュー対象commit: <hash>
> レビューア: Claude

## 結果サマリー
- 🟢 PASS: 仕様適合・追加修正不要
- 🟡 PASS with fixes: 軽微な修正をClaudeが追加コミット
- 🔴 RESTART: 指示書に問題があったため再作業が必要

## 観点別評価

### 仕様適合
- 完了条件: <○/△/✕> <コメント>
- 範囲遵守: <○/△/✕>

### コード品質
- 型エラー: <○/△/✕>
- ESLint: <○/△/✕>
- 命名規約: <○/△/✕>

### 既存コードとの整合
- import: <○/△/✕>
- LocalStorageキー: <○/△/✕>

### 動作確認
- npm run dev: <○/△/✕>
- 画面表示: <○/△/✕>

## 指摘事項

### 致命（修正必須）
- <なし>

### 改善推奨
- <なし>

## Claudeによる追加修正
- <あれば commit hash と内容>

## 次のタスクへの教訓
- <あれば、次回の指示書改善案>
```

### B.4 不合格時の対応

- 🔴 **RESTART** 判定の場合: 指示書を改訂して `tasks/codex/<task-id>_v2.md` を作成し、再度Codexに依頼
- 🟡 **PASS with fixes** の場合: Claudeが `[Review]` prefix で追加commit
- 🟢 **PASS** の場合: 次のタスクへ

---

## 詳細設計完了

D1〜D6 全章の詳細設計が完了しました。以降は実装フェーズに移行可能です。

### 実装着手の準備
1. tasks/ ディレクトリの作成（codex/ reviews/ questions/）
2. F1-P0 から順に実施
3. Claudeセッションごとに git pull origin main → 作業 → push を厳守
4. Codexタスクは tasks/codex/ に指示書をコミットしてからCodexセッション開始

### フェーズ移行のチェック
- [ ] 要件定義書 v0.4
- [ ] 基本設計書 v0.8
- [ ] 詳細設計書 v0.12
- [ ] memory/ にプロジェクト方針記録済み
- [ ] color_samples.html 確認済み
- [ ] npm 動作確認済み（D1着手前に完了）

---

> **D6終了（v0.13）。詳細設計完了。実装フェーズへ。**

---

## 変更履歴
- 2026-05-16 v0.16 体制変更反映:
  - Gemini レビューを廃止（プロジェクト体制変更によりGemini使用なし）
  - コンテンツレビュー体制を「Claude生成 → Codex レビュー → ユーザ最終確認」に簡素化
  - §2.7b F1.5-P2/P3 フローからGeminiステップ削除、コンテンツ妥当性レビューをユーザに集約
  - §2.x 工数表 担当列を `🅒+Codex+Geminiレビュー` → `🅒+Codexレビュー` に置換（F1.5-P2/P3、F2-P1/P2/P6）
  - §2.7b.5 担当 / §1.2 工数注記 から Gemini を削除
- 2026-05-06 v0.1 D1初版（章0〜2）
- 2026-05-06 v0.2 D1: §1.4 Claude/Codex役割分担, §1.5 Gitワークフロー追加 / 各タスクに担当ラベル付与 / §2.9 役割分担サマリ表追加 / 付録A（Codex指示書テンプレート）, 付録B（Claudeレビュー観点）追加
- 2026-05-06 v0.3 D1セルフレビュー反映:
  - 章番号階層修正（§1.4/§1.5 を `###` に降格、§2.x → §2.8、§2.8 → §2.9）
  - §1.2 担当列を 🅒🅧 表記に統一
  - §2.4 F1-P3 サンプルを2件に修正
  - §2.5 F1-P4 完了条件文言修正（`?mode=important` 表現を「フィルタボタン」表現に）
  - §2.5/§2.6 の薄いステップに D2/D5 詳細化前提の注記追加
  - 付録A.1 の不要記述（Co-Authored-By注意）削除
  - 関連: basic_design.md v0.5（S09 URL `/morning/quiz` → `/morning/session`、ディレクトリ構成に OfficialMorningSession.tsx / OfficialMorningSummary.tsx 追加）
- 2026-05-06 v0.13 D6セルフレビュー反映:
  - **D6-1**: §3.9 sync/adapters.ts KEYS 定数に `pmap:savedAnswers:` をワイルドカードprefixとして追加（D5で追加した savedAnswers が同期対象なのに同期できない不整合を修正）。`LocalSyncState` 型に `savedAnswers` フィールド追加
  - **D6-2**: §10.4 設定画面 stats 計算で未定義 `calcQuizCorrectRate()` を、インライン計算（getAnswerRecords().filter→correctCount/length）に書き換え。未挑戦時 null を返す形に
  - **D6-3**: §11.2 同期対象キー数の数え誤り修正（NW 11種→13種、PM 15種→17種）。ワイルドカードprefixを別行で追記
- 2026-05-06 v0.12 D6追加:
  - §10 周辺機能詳細
    - §10.1 学習履歴 S19（新イベント種別 morning-session/essay-complete 表示）
    - §10.2 バッジ S18（F1=NW踏襲、F2-P6で再設計）
    - §10.3 デバイス同期 S20
    - §10.4 設定 S21（統計拡張・重要マーク管理リンク追加）
  - §11 PWA・同期詳細
    - §11.1 PwaInstallPrompt 実装フロー + コード
    - §11.2 QR同期 送受信フロー + NWからの差分（PMAP-SYNC-v1）
  - §12 ブランド適用マップ
    - §12.1 Tailwindクラス置換表（22種）
    - §12.2 ハードコード色値置換表（5種）
    - §12.3 機械置換コマンド完全形（F1-P6 Step 2）
    - §12.4 機能色（emerald/amber/red/slate）保持の明文化
  - §13 QA動作確認チェックリスト
    - §13.1 F1段階 QA（P0〜P6 各タスク完了条件）
    - §13.2 横断確認（LocalStorage整合・XP整合・バッジ・QR同期・PWA）
    - §13.3 F2段階 QA（コンテンツ投入後）
  - §14 デプロイ手順
    - §14.1 初回セットアップ（vercel CLI）
    - §14.2-14.3 本番デプロイ・GitHub連携
    - §14.4 環境変数（不要）
    - §14.5-14.6 ロールバック・PWA動作確認
    - §14.7 デプロイチェックリスト
  - **詳細設計（D1〜D6）完了**
- 2026-05-06 v0.11 D5セルフレビュー反映:
  - **D5-1**: §8.0 で約束した basic_design.md §4.3 LocalStorage表に `pmap:myAnswer:*` `pmap:savedAnswers:*` を正式追加（basic_design.md v0.7 → v0.8）
  - **D5-2**: §8.1 未定義ヘルパー関数 `getProblemYear`/`getProblemNumber`/`getProblemTitle` を `afternoonProblems.find()` 経由に書き換え
  - **D5-3**: §9.1 latestDate ソート漏れ修正。`getAttemptsByProblem(problem.id)` を使用（降順ソート済み）
  - **D5-4**: §9.2 selfReview/reflection の永続化方針を仕様確定（DP-D5-2）。離脱時の挙動を表で明示
  - **D5-5**: §9.2 別問題のアクティブセッション上書き警告モーダル `OverwriteWarningModal` 追加（DP-D5-3）。安全側のデフォルトCTA「中断中の問題に戻る」
- 2026-05-06 v0.10 D5追加:
  - §8 午後Iモード詳細
    - §8.0 LocalStorageキー追補（`pmap:myAnswer:*` `pmap:savedAnswers:*` ※basic_design未記載分の明文化）
    - §8.1 午後I 一覧画面 S11: モバイル一覧+展開ワイヤフレーム + state設計
    - §8.2 公式解答表示 S12: 設問階層表示
    - §8.3 自己採点画面 S13: writingフェーズ/gradingフェーズ ワイヤフレーム + state + LocalStorageアクセス + NW流用
    - §8.4 配点マップ詳細: NWルール踏襲 + 自動配点アルゴリズム提示（F2-P4）
    - §8.5 §8まとめ
  - §9 論述トレーニング詳細
    - §9.1 論述一覧 S14
    - §9.2 論述練習画面 S15: writing/reviewing/reflecting 3フェーズワイヤフレーム + タイマー復帰ロジック + state設計
    - §9.3 論述履歴詳細 S16
    - §9.4 タイマー復帰ロジック詳細（状態遷移図 + 離脱パターン表）
    - §9.5 §9まとめ
  - DP-D5-1: 同時に複数の論述アクティブセッションは持たない（NW午後I myAnswer同思想）
- 2026-05-06 v0.9 D4セルフレビュー反映:
  - **D4-1**: §7.2 `MorningSessionState.scope` に `'single'` 追加（DP-D4-2 拡張の波及）
  - **D4-2**: 関連: basic_design.md v0.7 で `StudySession.mode` に `'single'` を追加（クイズ単一問題モード対応）
  - **D4-3**: §6.4 `buildWeaknessQuestions` のデッドコード（未使用 `consecutive` 配列）を削除し、`continue` で明示
  - **D4-4**: §7.1 `handleStartYear` のコメント `（DP-D4-2）` を `（要件 確認D: ユーザ確定）` に修正（誤参照解消）
  - **D4-5**: §7.2 `applyAnswer` 呼び出しに「公式午前IIではupdateProgress等を呼ばない」注記、`'unclassified'` topicId の意図を明記
- 2026-05-06 v0.8 D4追加:
  - §6 クイズモード詳細
    - 6.1 クイズ起点（モード選択動線、独立トップ画面なし）
    - 6.2 クイズ出題画面 S06: モバイル4択回答前/回答後・記述モード回答前/自己判定の4枚ワイヤフレーム + state設計 + LocalStorageアクセス表
    - 6.3 クイズサマリー S07
    - 6.4 4モード出題ロジック詳細（topic/random/important/weakness）+ single モード追加
    - 6.5 重要問題管理画面 S22
    - 6.6 単一問題出題モード `?mode=single&q=<id>`（D3-5で約束）
    - 6.7 §6まとめ
  - §7 公式午前IIモード詳細
    - 7.1 トップ画面 S08: 全範囲ランダム + 問題数セレクタ + フィルタ + 年度カード
    - 7.2 出題画面 S09: 回答前/回答後の2枚ワイヤフレーム + applyAnswer連携
    - 7.3 サマリー画面 S10: 誤答リストから個別ジャンプ
    - 7.4 著作権表記: `<IpaCopyrightFooter>` コンポーネント定義 + 配置画面表
    - 7.5 単一問題出題モード `?q=<id>`（D3-5で約束）+ DP-D4-2 (scope='single' 追加)
    - 7.6 §7まとめ
  - 関連: §3.8 `MorningSessionPayload.scope` に `'single'` 追加（DP-D4-2）
  - DP-D4-1: 弱点モードは mastery=incorrect を最優先（連続不正解と直近不正解を区別しない）
  - DP-D4-2: 単一問題ジャンプ時は scope='single' で activityLog 区別
- 2026-05-06 v0.7 D3セルフレビュー反映:
  - **D3-1**: D3挿入時に消失していた `## 付録 A: Codex 作業指示書テンプレート` ヘッダを復元
  - **D3-2**: §3.7 gamification.ts に `applyNoteCheck` API を追加（D2-4 「XP発生源単一化」原則準拠）。NoteCheck XPルール表（green=5, yellow=3, red=1）追加。§5.5 の state コードを `applyNoteCheck` 経由に書き換え
  - **D3-3**: §5.5 LocalStorage アクセス表に `pmap:gamification` を追加
  - **D3-4**: §5.6 ワイヤフレーム見出し「3つのモード + 論述」→「学習モード（5種）」に修正。§5.1 MENU_CARDS の同関連description「3つのモードの活用方法」→「5つの学習モードの活用方法」も併せて修正
  - **D3-5**: §5.7 検索結果ジャンプURLを `?mode=single&q=<id>` 形式に整理し、Quiz/OfficialMorningSessionの「単一問題出題モード」をD4で詳細化する旨を明記。ノート詳細はアンカージャンプ `#section-<index>` 形式を明記
- 2026-05-06 v0.6 D3追加:
  - §5 画面詳細（その1: ホーム・サイドバー・Layout・ノート・検索）
  - §5.0 共通設計原則（ブレイクポイント・レスポンシブ方針・共通色）
  - §5.1 ホーム画面: モバイル/デスクトップASCIIワイヤフレーム + MENU_CARDS 14項目 + state設計
  - §5.2 共通レイアウト: モバイル開閉ワイヤフレーム + デスクトップ固定サイドバー + state/振る舞い + NWからの差分表
  - §5.3 サイドバー詳細: NAV_ITEMS 15項目（lucide アイコン指定込み）
  - §5.4 ノート一覧: カードグリッド・検索ボックス・理解度バッジ
  - §5.5 ノート詳細: 赤字マスクトグル・セクション理解度設定・PreparingNotice（フェーズ1スタブ）
  - §5.6 アプリの使い方: PM試験文脈の文言・推奨学習フロー
  - §5.7 検索: 4タブ（全件/クイズ/ノート/午前II）・debounce検索・ハイライト
  - §5.8 D3画面別担当配分まとめ
  - DP-D3-1: ノートモードとカテゴリ別学習を別項目として残す（NW踏襲）
  - DP-D3-2: クエリパラメータRouteの分岐ロジック踏襲
- 2026-05-06 v0.5 D2セルフレビュー反映:
  - **D2-1**: F1-P0 に Step 8 「NotFound.tsx 作成」を追加（既存Step 8〜11 を 9〜12 に繰り下げ）。§4.5 担当を「F1-P0 Step 8 で投入」に確定
  - **D2-2**: §3.5 essay.ts `elapsedSecOf` を `lastResumedAt` 正式参照に書き換え。型拡張提案セクションを「v0.6で確定」と明記。関連: basic_design.md v0.6（`EssayActiveSession.lastResumedAt: string \| null` 追加）
  - **D2-3**: §3.2 storage.ts に `pmap:bookmarks` 運用整理セクションを追加（カテゴリブックマークは維持、問題ブックマークは未使用化、コードは残置）
  - **D2-4**: §3.7 gamification.ts に「XP発生源の単一化」セクションを追加。activityLog.xp は表示用スナップショット
  - **D2-5**: §3.8 `MorningSessionPayload.scope` に 'important' 追加
  - **D2-6**: §3.7 `AnswerEvent.isImportant: boolean` を引数で残し、calcXp をpureに保つ。呼び出し側パターンサンプル追加
  - **D2-7**: §4.4 ErrorBoundary 担当を 🅒🅧 に変更（Layout統合は🅒）
- 2026-05-06 v0.4 D2追加:
  - §3 共通ライブラリ詳細（lib一覧表 + 各モジュールのAPI契約・疑似コード）
    - storage.ts / importantMarks.ts / morningRecords.ts / essay.ts / tracker.ts / gamification.ts / activityLog.ts / sync/* / answerTable.ts
    - importantMarks.ts / morningRecords.ts / essay.ts は完全実装コードを掲載
    - gamification.ts のXP計算式拡張（morning=5、essay_complete=200）
  - §4 ルーティング・グローバル状態
    - 開発版App.tsx 完全コード
    - 正式版App.tsx 復活手順
    - グローバル状態管理戦略（Context不使用、LocalStorage直接読み書き）
    - エラーバウンダリ設計（F2-P6で実装）
    - 404ハンドリング設計
    - PWAインストールプロンプト制御
  - 提案事項: basic_design.md `EssayActiveSession` に `lastResumedAt` 追加（v0.6 で反映予定）
