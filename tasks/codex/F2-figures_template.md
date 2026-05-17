# Codex 作業指示書: F2-figures ノート図表（SVG / table）作成（共通テンプレ）

> 作成: Claude（2026-05-17）
> 対象タスク: F2-figures（既存ノートカテゴリへの図表追加、ビジュアル化）
> 想定所要時間: 1セクションあたり 30〜90分（SVG作成 + 検証）
> **本指示書は「全セクション共通の手順」**。各回の対象は `tasks/codex/F2-figures_queue.md` を参照。

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-figures <カテゴリ>/§<番号> 図表追加`
- 不明点があれば**自己判断せず**、`tasks/questions/F2-figures.md` に記録して push（実装はそこで停止）

## 1. 作業概要

NoteSection に **`figures: QuestionFigure[]`** フィールドを追加し、SVG/table 図表をノートに組み込む。基盤は Claude が実装済み（type 追加・レンダリング）。Codex は **コンテンツ作成（SVG content / table データ）に集中**。

### 対象セクションの選定方法
1. `tasks/codex/F2-figures_queue.md` を開く
2. **状態が「未着手」の最上位の項目**を1つ選ぶ
3. 該当セクションの図表を `docs/note_figure_rules.md` に従って作成
4. 作業開始時に queue.md の状態を「進行中（Codex 担当 / YYYY-MM-DD）」に更新してコミット
5. 作業完了時に状態を「完了」に更新（最終 commit）

**1セッションで1〜3セクション**処理可（コンフリクトリスク回避、図表は独立性が高い）。

## 2. 前提

### 関連ドキュメント（必読）
- `docs/note_figure_rules.md` v1.0 ★必読 — SVG/table 作成ルール、白ハロー必須、ブランドカラー、アクセシビリティ
- `docs/note_markup_rules.md` v1.0 — マークアップ規約（items 用、figures とは別だが参考）
- `src/types/index.ts` line 108: `QuestionFigure` 型定義
- `src/components/QuestionFigureView.tsx`: レンダリングコンポーネント
- 既存例: `NoteDetail.tsx` の `stakeholder` §13（Power/Interest Grid, `headerDiagrams`）・§18（エンゲージメント評価マトリクス, `headerDiagrams`）

### NoteSection 型（既存に figures フィールドが追加済み）
```ts
interface NoteSection {
  heading: string
  items?: string[]
  // ... 他フィールド
  figures?: QuestionFigure[]  // 本タスクで追加する図表
}
```

## 3. 入力データ

`tasks/codex/F2-figures_queue.md` の対象セクション行に記載された:
- **カテゴリ ID**（例: `stakeholder`, `team`）
- **セクション番号**（例: `§14`）
- **セクション見出し**（例: `権力／影響度グリッド（Power/Influence Grid）`）
- **推奨図タイプ**（svg / table）
- **推奨内容の概要**

## 4. 出力ファイル

- `src/pages/NoteDetail.tsx`（編集）— 該当セクションに `figures` フィールドを追加
  - 既存の `items` / `navyItems` / `headerDiagrams` の**改変は禁止**
  - figures フィールドのみ追加
- `tasks/codex/F2-figures_queue.md`（編集）— 状態を「完了」に更新

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
git log --oneline -5
```

### Step 2: 対象セクション選定
`tasks/codex/F2-figures_queue.md` で「未着手」の最上位を選定。状態を「進行中」に更新してコミット:
```bash
git add tasks/codex/F2-figures_queue.md
git commit -m "[X] F2-figures <カテゴリ>/§<番号> 着手"
git push origin main
```

### Step 3: 既存セクションの内容を確認
`src/pages/NoteDetail.tsx` の該当カテゴリ・該当 heading を探す:
```bash
grep -n "heading: '<番号>\. " src/pages/NoteDetail.tsx
```

既存の items を読んで図の意味を理解（特に**横軸/縦軸の説明**・**4象限の対応戦略**・**段階の順序**等）。

### Step 4: 図の設計

`docs/note_figure_rules.md` §3 のタイプ別ガイドを参照。

#### SVG の場合
- viewBox 決定（例: `"0 0 600 400"`、1:1〜3:2推奨）
- レイアウト草案（ペーパー or 別ファイル）
- ariaLabel 文（10〜80文字、図の内容を端的に）
- caption（任意、図下に表示される説明）
- **白ハロー必須**（`stroke="white" stroke-width="3" paint-order="stroke"`）
- **ブランドカラー使用**（`docs/note_figure_rules.md` §2.3 パレット参照）
- 文字サイズ12px以上

#### Table の場合
- headers 設計（最初の空文字列含めて10列以下推奨）
- rows データ作成
- rowHeaderFirstCol 判定
- セル内容はプレーンテキストのみ（`==` / `__` 使用禁止）

### Step 5: SVG/Table データを TS 形式に整形

```ts
// SVG 例
figures: [
  {
    type: 'svg',
    caption: 'Power/Influence Grid — 公式権威と非公式影響力の2軸',
    ariaLabel: 'Power と Influence の2軸グリッドを示した図',
    viewBox: '0 0 500 400',
    content: `
      <defs>
        <style>
          .axis { stroke: #cbd5e1; stroke-width: 1.5; }
          .label { font-size: 13px; font-weight: bold; text-anchor: middle; fill: #1e293b;
                   stroke: white; stroke-width: 3; paint-order: stroke; }
        </style>
      </defs>
      <line x1="80" y1="350" x2="450" y2="350" class="axis" />
      <line x1="80" y1="350" x2="80" y2="50" class="axis" />
      <text x="265" y="385" class="label">Influence（影響力）→</text>
      <text x="40" y="200" class="label" transform="rotate(-90 40 200)">Power（権力）→</text>
      <!-- 4象限のラベルなど -->
    `,
  },
],

// Table 例
figures: [
  {
    type: 'table',
    caption: 'マネジリアル・グリッド — 5つの代表スタイル',
    headers: ['', '業績への関心 低', '業績への関心 高'],
    rowHeaderFirstCol: true,
    rows: [
      ['人間への関心 高', '1,9 人間中心型', '9,9 チーム型（理想）'],
      ['人間への関心 低', '1,1 無関心型', '9,1 仕事中心型'],
    ],
  },
],
```

### Step 6: NoteDetail.tsx に追加

該当セクションの末尾（navyItems の前 or 後ろ）に `figures` フィールドを追加:

```ts
{
  heading: '14. 権力／影響度グリッド（Power/Influence Grid）',
  items: [
    /* 既存 items はそのまま */
  ],
  navyItems: [/* 既存 navyItems はそのまま */],
  figures: [
    {
      type: 'svg',
      // ...上記設計内容
    },
  ],
},
```

### Step 7: 検証

```bash
npm run validate-data   # [OK] 期待
npm run build           # pass 期待
npm run dev             # ローカル確認推奨（dev サーバ起動）
```

`npm run dev` で `http://localhost:5173` にアクセス → 該当ノート画面で図表が正しく表示されるか確認:
- SVG が viewBox 通りスケーリングされているか
- テキストに白ハローが効いているか（背景色との重なりで読みやすいか）
- モバイル幅（DevTools で 360px）でも読めるか

### Step 8: レビュー記録（簡易）

`tasks/codex/F2-figures_queue.md` の該当行に「完了」状態と commit hash を記載。詳細なレビュー記録は不要。

### Step 9: コミット & プッシュ
```bash
git add src/pages/NoteDetail.tsx tasks/codex/F2-figures_queue.md
git commit -m "[X] F2-figures <カテゴリ>/§<番号> 図表追加"
git push origin main
```

## 6. 完了条件（DoD）

- [ ] 対象セクションに `figures: QuestionFigure[]` フィールドが追加された
- [ ] SVG の場合、白ハロー（stroke="white" stroke-width="3" paint-order="stroke"）が全テキストに付与されている
- [ ] `viewBox` / `ariaLabel` が指定されている（SVG の場合）
- [ ] `npm run validate-data` PASS
- [ ] `npm run build` PASS
- [ ] `npm run dev` でローカル確認、図が意図通り表示されている
- [ ] `tasks/codex/F2-figures_queue.md` の状態を「完了」に更新

## 7. 注意事項・禁止事項

- ❌ 既存の `items` / `navyItems` / `headerDiagrams` / `richItems` 等の改変禁止
- ❌ 他カテゴリ・他セクションへの変更禁止
- ❌ NoteSection 型定義の変更禁止（既に Claude が figures フィールドを追加済み）
- ❌ `<svg>` タグを content に含めない（外側で自動付与される）
- ❌ 全角イコール `＝` をテキスト内に使わない
- ❌ ブランドカラー以外の派手な色は使わない（docs/note_figure_rules.md §2.3）
- ❌ 文字サイズ12px未満禁止（アクセシビリティ）
- ❌ 色情報のみに依存する図禁止（色 + ラベルの両方）
- ❌ `git push --force` 禁止

## 8. 完了後のgit操作
```bash
git add src/pages/NoteDetail.tsx tasks/codex/F2-figures_queue.md
git commit -m "[X] F2-figures <カテゴリ>/§<番号> 図表追加"
git push origin main
```

## 9. 参考

- 既存例（headerDiagrams は本タスクと別仕組みだが、図表のサンプルとして参考）:
  - `NoteDetail.tsx` の `stakeholder` §13 Power/Interest Grid
  - `NoteDetail.tsx` の `stakeholder` §18 エンゲージメント評価マトリクス
- 既存例（公式午前II の QuestionFigure サンプル）:
  - `src/data/officialMorningQuestions.ts` の R6 秋期 §4 / §5 / §6（SVG）
  - 同上 §12（table）
- 図表作成ルール: `docs/note_figure_rules.md` v1.0
- レンダリング実装: `src/components/QuestionFigureView.tsx`
