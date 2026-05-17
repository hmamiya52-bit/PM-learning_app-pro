# ノート図表（SVG / table）作成ルール v1.0

> 対象: `src/pages/NoteDetail.tsx` の `NoteSection.figures: QuestionFigure[]`
> 適用: F2-figures（ビジュアル化追加タスク）／F2-P1 残カテゴリ
> 作成: Claude（2026-05-17）
> 関連: `docs/morning_question_authoring_rules.md` v1.0 §3 SVG白ハロー（共通ルール）

## 1. 図表のタイプ

`QuestionFigure` 型（`src/types/index.ts` line 108 で定義）は **`svg` / `table`** の2タイプ。

```ts
type QuestionFigure =
  | { type: 'svg'; caption?: string; ariaLabel: string; viewBox: string; content: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: (string|number)[][]; rowHeaderFirstCol?: boolean }
```

| タイプ | 用途 | 例 |
|---|---|---|
| `svg` | 自由形状の図（ベン図・キューブ・フロー図・ネットワーク図・座標図） | サリエンスモデル3円ベン図、タックマン5段階線形、キルマン5モード座標 |
| `table` | 行列構造のマトリクス | 2軸×4象限マトリクス、5段階×N人エンゲージメント評価 |

**判断軸**: 行列の格子で表現できるなら `table`、それ以外（円・斜線・自由配置）は `svg`。

## 2. SVG 共通ルール

### 2.1 必須要素

- **viewBox**: 必須。例 `"0 0 600 400"`。座標系の基準。
- **ariaLabel**: 必須。スクリーンリーダー向け説明。10〜80文字。
- **content**: `<svg>` タグの**中身のみ**（`<svg>` `</svg>` は外側で自動付与）

### 2.2 白ハロー（テキスト可読性確保） ★必須

SVG 内のテキストは、背景色との重なりで読みにくくなる。**全テキスト要素**に `stroke="white" stroke-width="3"` を付けて白の縁取りを付ける。

```svg
<text x="100" y="50"
      fill="#1e293b"
      stroke="white" stroke-width="3" paint-order="stroke"
      font-size="14" font-weight="bold"
      text-anchor="middle">
  権力
</text>
```

`paint-order="stroke"` を必ず指定（縁取りを下、塗りを上に描画）。

### 2.3 色パレット（ブランドカラー準拠）

| 用途 | 色コード |
|---|---|
| メイン強調（赤系） | `#dc2626`, `#fee2e2` (薄赤) |
| ブランドネイビー | `#9d5b8b`, `#9d5b8b15` (薄紫) |
| 警告/注意 | `#f59e0b`, `#fef3c7` (薄橙) |
| OK/成功 | `#10b981`, `#dcfce7` (薄緑) |
| 中立/補助 | `#64748b`, `#f1f5f9` (薄灰) |
| 軸・グリッド線 | `#cbd5e1` |
| テキスト本体 | `#1e293b` |
| テキスト弱 | `#475569` |

### 2.4 アクセシビリティ

- `aria-label` は図の内容を端的に説明（例: 「Power/Interest Grid の4象限と対応戦略を示した図」）
- 色情報のみに依存しない（色 + テキストラベルの両方）
- 文字サイズは最小12px（`font-size="12"` 以上）

### 2.5 寸法

- `viewBox` は 1:1 〜 3:2 程度のアスペクト比を推奨
- 最大幅 `max-w-2xl`（約 672px）でレンダリングされる
- モバイル幅（360px）でも読めるサイズに調整

## 3. 図のタイプ別ガイド

### 3.1 ベン図（円の重なり）

例: サリエンスモデル（Power / Legitimacy / Urgency の3円）

```svg
<!-- 3円ベン図 viewBox="0 0 400 320" -->
<defs>
  <style>
    .circle-power { fill: #fee2e2; stroke: #dc2626; stroke-width: 2; fill-opacity: 0.5; }
    .circle-legit { fill: #dbeafe; stroke: #2563eb; stroke-width: 2; fill-opacity: 0.5; }
    .circle-urgent { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; fill-opacity: 0.5; }
    .label { font-size: 14px; font-weight: bold; text-anchor: middle; fill: #1e293b;
             stroke: white; stroke-width: 3; paint-order: stroke; }
  </style>
</defs>
<circle cx="150" cy="130" r="90" class="circle-power" />
<circle cx="250" cy="130" r="90" class="circle-legit" />
<circle cx="200" cy="210" r="90" class="circle-urgent" />
<text x="100" y="100" class="label">Power</text>
<text x="300" y="100" class="label">Legitimacy</text>
<text x="200" y="290" class="label">Urgency</text>
<!-- 中央 Definitive 表記 -->
<text x="200" y="170" class="label">Definitive</text>
```

### 3.2 2軸グリッド（マトリクス）

例: マネジリアル・グリッド（業績への関心 × 人間への関心）

`table` タイプを推奨。`svg` でも作れるが table の方がアクセシブル。

```ts
{
  type: 'table',
  caption: 'マネジリアル・グリッド（Blake & Mouton）— 5代表スタイル',
  headers: ['', '業績への関心 低', '業績への関心 中', '業績への関心 高'],
  rowHeaderFirstCol: true,
  rows: [
    ['人間への関心 高', '1,9 人間中心型', '', '9,9 チーム型'],
    ['人間への関心 中', '', '5,5 中道型', ''],
    ['人間への関心 低', '1,1 無関心型', '', '9,1 仕事中心型'],
  ],
}
```

### 3.3 線形フロー（段階モデル）

例: タックマンモデル5段階（形成 → 混乱 → 規範 → 遂行 → 解散）

```svg
<!-- 5段階線形フロー viewBox="0 0 600 120" -->
<defs>
  <style>
    .stage { font-size: 13px; font-weight: bold; text-anchor: middle; fill: #1e293b;
             stroke: white; stroke-width: 3; paint-order: stroke; }
    .desc { font-size: 11px; text-anchor: middle; fill: #475569; }
    .arrow { stroke: #64748b; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
  </style>
  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
  </marker>
</defs>
<!-- 5つのボックス -->
<rect x="10" y="30" width="100" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
<text x="60" y="55" class="stage">形成</text>
<text x="60" y="72" class="desc">Forming</text>
<!-- arrow -->
<line x1="115" y1="55" x2="135" y2="55" class="arrow" />
<!-- ... 同じパターンで 混乱・規範・遂行・解散 -->
```

### 3.4 キューブ・四方向図

例: 方向性キューブ（Upward / Downward / Outward / Sideward）

```svg
<!-- 4方向キューブ viewBox="0 0 400 400" -->
<defs>
  <style>
    .center { fill: #9d5b8b; stroke: white; stroke-width: 2; }
    .arrow-up { stroke: #dc2626; stroke-width: 3; marker-end: url(#ah-up); }
    .label { font-size: 13px; font-weight: bold; text-anchor: middle; fill: #1e293b;
             stroke: white; stroke-width: 3; paint-order: stroke; }
  </style>
</defs>
<!-- 中央 PM -->
<rect x="170" y="170" width="60" height="60" class="center" rx="6" />
<text x="200" y="205" class="label" fill="white">PM</text>
<!-- 上下左右の矢印とラベル -->
<line x1="200" y1="170" x2="200" y2="80" class="arrow-up" />
<text x="200" y="60" class="label">Upward 経営層</text>
<!-- ... 同じパターンで Downward / Outward / Sideward -->
```

## 4. テーブル共通ルール

### 4.1 構造

```ts
{
  type: 'table',
  caption?: string,           // 表上に表示される説明
  headers: string[],          // ヘッダ行（最初の空文字列も含む）
  rows: (string|number)[][],  // 行データ
  rowHeaderFirstCol?: boolean // true なら各行の最初のセルを行ヘッダ扱い
}
```

### 4.2 セル内容のガイドライン

- 短いラベル（10文字以内）が読みやすい
- 改行が必要なら `\n` を含めるか、内容を分割して別行
- 数値は半角、単位は別カラムや caption で示す
- 「==」「__」マークアップは **使えない**（プレーンテキストのみ）

### 4.3 13列以上の大型テーブル

レンダリング側で `table-fixed` + 横スクロール対応済み。ただし列が多すぎると可読性が落ちるため、**最大10列程度**を推奨。

## 5. レビュー時のチェックリスト

Codex または Claude がレビュー時に確認する項目:

### SVG
- [ ] `viewBox` が指定されている
- [ ] `ariaLabel` が10文字以上の説明文
- [ ] 全テキスト要素に `stroke="white" stroke-width="3" paint-order="stroke"` が付いている（白ハロー）
- [ ] 文字サイズが12px以上
- [ ] 色情報のみに依存していない（色 + ラベル）
- [ ] ブランドカラー（#9d5b8b 等）が適切に使われている
- [ ] `<svg>` `</svg>` タグは content に**含まれていない**

### Table
- [ ] `headers` の最初に空文字列が必要なら入っている
- [ ] `rows` の各行の長さが `headers` と一致
- [ ] `rowHeaderFirstCol: true` の場合、各行の最初が行ヘッダになっている
- [ ] セル内容に `==` / `__` マークアップが含まれていない（プレーンテキスト）
- [ ] 列数が10列以下（モバイル可読性）

### 共通
- [ ] `caption` がある場合、図の内容と整合している
- [ ] ノートのコンテキスト（前後の items）と図の意味が一致

## 6. セルフチェック手順

### SVG の場合
1. `viewBox` の数値とコンテンツのスケール感を確認
2. ブラウザでローカル表示確認: `npm run dev` → 該当ノートにアクセス
3. （重要図のみ）Inkscape で PNG エクスポートして印刷品質を確認
4. モバイル幅（360px）でも文字が読めるか確認

### Table の場合
1. ブラウザでローカル表示確認
2. モバイル幅で横スクロールが機能するか確認
3. ヘッダ行と行ヘッダ列の見た目が区別できているか

## 7. 関連ドキュメント

- `src/types/index.ts` line 108: `QuestionFigure` 型定義
- `src/components/QuestionFigureView.tsx`: 共通レンダリングコンポーネント
- `docs/morning_question_authoring_rules.md` v1.0 §3: 午前II問題用の SVG ルール（白ハロー等共通）
- `docs/note_markup_rules.md` v1.0: マークアップ規約（items 用、figures とは別）
