# Codex 作業指示書: F2-P3 午前II 解説への改行追加

> 作成: Claude（2026-05-22）
> 対象タスク: F2-P3 既存解説（R6〜H28 の 225問）の改行整形
> 想定所要時間: 1.5〜2.5h

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミット prefix は `[X]`（`[X] F2-P3 解説改行整形: 225問 適用` など）
- 不明点は `tasks/questions/F2-P3_line_breaks.md` に記録して停止

## 1. 背景・作業概要
午前II 解説が改行なし 1 段落で書かれており，特に選択肢別説明（ア／イ／ウ／エ）が連結されて読みづらいというユーザ指摘あり。

UI 側は本セッションで Claude が `OfficialMorningSession.tsx` の解説 `<p>` に `whitespace-pre-wrap` を追加済み。これでデータ側に `\n` を入れれば改行として表示される。

**本タスクは `src/data/officialMorningQuestions.ts` の R6〜H28 計 225 問の `explanation` フィールドに，下記ルールで `\n` を機械的に挿入する**。

## 2. 前提・対象
- 対象ファイル: `src/data/officialMorningQuestions.ts` のみ
- 対象 ID: `om-R6-1`〜`om-H28-25`（225 問。H27/H26/H25 はまだ解説未生成のため対象外）
- 各エントリの `explanation: '〜'` 文字列内の改行のみが対象
- `questionText` / `choices` / `figure` には触らない

## 3. 改行ルール

### ルール A（必須）: 選択肢別解説の前で改行
パターン: 句点（「。」）または読点（「，」）の直後に「ア 」「イ 」「ウ 」「エ 」（選択肢記号 + 半角空白）が来る場合，その直前で改行する。

正規表現（JavaScript）:
```js
text.replace(/([。，])([アイウエ] )/g, '$1\n$2')
```

**例: テンペスト攻撃の解説**

Before:
> テンペスト攻撃（TEMPEST）は，…を解析する攻撃。対策は電磁シールドで電磁波を遮断するのが基本。ア は中間者攻撃（MITM），ウ はマクロウイルス対策，エ は無線 LAN 盗聴対策の説明で，それぞれ別概念。

After:
> テンペスト攻撃（TEMPEST）は，…を解析する攻撃。対策は電磁シールドで電磁波を遮断するのが基本。
> ア は中間者攻撃（MITM），
> ウ はマクロウイルス対策，
> エ は無線 LAN 盗聴対策の説明で，それぞれ別概念。

### ルール B（任意・推奨）: EVM 等の計算問題で式ステップの間で改行
パターン: `「= 数字。」「= 式。」` の連続や `「→」` の前後など，計算手順が複数ステップに渡る場合，読みやすい位置で改行を入れる。

**例: H29 問16 全数検査**

Before:
> 検査なしの費用 = 出荷後修理 500×3%×200 = 3,000 万円。検査ありの費用 = 検査費 500×1 + 出荷前修理 500×2%×50 + 出荷後修理 500×1%×200 = 500+500+1,000 = 2,000 万円。低減額 = 3,000 − 2,000 = 1,000 万円。

After:
> 検査なしの費用 = 出荷後修理 500×3%×200 = 3,000 万円。
> 検査ありの費用 = 検査費 500×1 + 出荷前修理 500×2%×50 + 出荷後修理 500×1%×200 = 500+500+1,000 = 2,000 万円。
> 低減額 = 3,000 − 2,000 = 1,000 万円。

このルールは機械処理が難しいので **ルール A のみ自動適用** とし，計算問題の改行は時間が許す範囲で手動補正してよい（最小限の介入）。

### ルール C（禁止）: 過剰な改行を避ける
- 1〜2 文で完結する短い解説（80 文字以下程度）には改行を入れない
- 文中の「，」のすべてで改行するような過剰整形は不可
- ルール A の正規表現で機械的に変換した結果，自然に「読みやすくなった」状態をゴールとする

## 4. 実装方法（推奨）

Node.js（vite-node）スクリプトで src ファイルを読み込み・置換・書き出しする例:

```ts
// scripts/format-morning-explanations.ts（一時スクリプト，作業後削除）
import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/data/officialMorningQuestions.ts'
const original = readFileSync(path, 'utf8')

// 各 explanation: '...' を抽出して中身だけ置換する
const updated = original.replace(
  /(explanation:\s*')((?:\\'|[^'])*)(')/g,
  (_match, head, body, tail) => {
    const replaced = body.replace(/([。，])([アイウエ] )/g, '$1\\n$2')
    return `${head}${replaced}${tail}`
  },
)

writeFileSync(path, updated)
console.log('done')
```

注意:
- TypeScript ソース上での改行表現は **エスケープされた `\\n`**（リテラル中で `\n` を生成する）。grep する場合は `\\n` を探す
- 既に `\n` が入っている解説（直前に Claude が手動で入れた場合）は重複適用しない。`([。，])(?!\\n)([アイウエ] )` のように負の先読みで防ぐと安全
- スクリプトは tmp 等に置き，最終 commit 前に削除する（残置 NG）

## 5. 検証方法

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: スクリプト実行
- 上記の置換スクリプトを実行
- diff で変更量が想定どおり（数百行）か確認

### Step 3: 機械検証
```bash
npm run validate-data
npm run build
```

両方 pass で完了条件達成。

### Step 4: 目視サンプリング（5 〜 10 問）
diff から無作為に 5〜10 問の explanation を選び，以下を確認:
- [ ] 改行位置がルール A に従っている
- [ ] 過剰改行（ルール C 違反）がない
- [ ] 数式記号（frac/^/_）が壊れていない
- [ ] 解説の意味が変わっていない

### Step 5: 改行後の表示確認（任意）
`npm run dev` で起動し，午前II 演習画面で R6 問1 などを表示し，改行が反映されているか確認。

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P3_line_breaks_codex_review.md` を新規作成し，下記を記録
  - 適用問題数（うち改行が挿入された問題数）
  - 適用したルール（A のみか / A+B の手動補正含むか）
  - 目視確認した問題 ID 一覧
  - `validate-data` / `build` の結果
- [ ] `npm run validate-data` が OK
- [ ] `npm run build` が OK
- [ ] 一時スクリプトはコミットに含めない（または完了後に削除コミットを追加）

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル（UI / 別カテゴリの問題集）を編集しない
- ❌ `questionText` / `choices` / `figure` の改行や内容には触らない
- ❌ H27/H26/H25 の `explanation: ''` は対象外（後で Claude が解説生成時に最初から改行入りで書く）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止（ユーザ最終確認担当）
- ⚠️ MathText 記号（`frac{}{}` / `^{}` / `_{}`）を破壊しないこと
- ⚠️ ルール B（計算式の改行）を手動補正する場合は，対象問題 ID を Step 4 のサンプリング欄に明示

## 8. 完了後の git 操作
```bash
git add src/data/officialMorningQuestions.ts
git add tasks/reviews/F2-P3_line_breaks_codex_review.md
git commit -m "[X] F2-P3 解説改行整形: 225問にルールA適用"
git push origin main
```

## 9. 参考: ルール A 適用前後の置換例リスト

| ID | Before（抜粋） | After（抜粋） |
|---|---|---|
| om-R6-2 | …割り当てる。「リスク管理」を含む… | …割り当てる。\n「リスク管理」を… |
| om-R5-1 | …整合する。アは「変更を拒否」する点が原則に反し，ウは「対面…」原則に反し，エは「動くソフトウェア」より進捗率報告を優先しており不適切。 | …整合する。\nアは「変更を拒否」する点が原則に反し，\nウは「対面…」原則に反し，\nエは「動くソフトウェア」より進捗率報告を優先しており不適切。 |
| om-H30-25 | …遮断するのが基本。ア は中間者攻撃（MITM），ウ はマクロウイルス対策，エ は無線 LAN 盗聴対策の説明で，それぞれ別概念。 | …遮断するのが基本。\nア は中間者攻撃（MITM），\nウ はマクロウイルス対策，\nエ は無線 LAN 盗聴対策の説明で，それぞれ別概念。 |

注: 一部の解説では「ア」と書かずに「アは」と続くため，正規表現は `[アイウエ] ` の半角空白に依存する。一字ずつの選択肢記号がない解説（例: H28 問1 SPA）はそのまま改行が入らない。

## 10. レビュー記録テンプレート

`tasks/reviews/F2-P3_line_breaks_codex_review.md`:

```md
# F2-P3 解説改行整形 Codex 作業メモ

## 実施内容
- 対象: src/data/officialMorningQuestions.ts の R6〜H28 全 225 問
- ルール A（選択肢別解説の前で改行）を機械的に適用
- ルール B（計算問題の式間改行）の手動補正: 対象問題 X 件（後述）

## 変更統計
- 改行が挿入された問題数: NNN / 225
- 挿入された `\n` の総数: MMM 個

## 手動補正した問題（ルール B 適用）
- om-XX-Y: 計算式の間で改行追加
- ...

## 目視確認した問題（ランダムサンプリング）
- om-R6-2: OK
- om-R5-1: OK
- om-R4-7: OK
- ...

## 検証結果
- npm run validate-data: OK
- npm run build: OK
- 数式表示が壊れていないか: OK（om-R4-10 の COCOMO 式等で確認）

## 一時スクリプト
- scripts/format-morning-explanations.ts を作成し，実行後に削除
```
