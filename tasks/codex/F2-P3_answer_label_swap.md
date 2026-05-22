# Codex 作業指示書: 午前II 選択肢ラベルの解答前後切替対応

> 作成: Claude（2026-05-22）
> 対象タスク: `OfficialMorningSession.tsx` の選択肢ラベル表示切替
> 想定所要時間: 1〜1.5h

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミット prefix は `[X]`（`[X] 午前II 選択肢ラベル解答前後切替` など）
- 不明点は `tasks/questions/F2-P3_answer_labels.md` に記録して停止

## 1. 背景・問題

### 問題発生メカニズム
- 午前II 演習画面（`OfficialMorningSession.tsx`）では，F1-P4 のユーザフィードバック対応として **4 択を Fisher-Yates シャッフル** して表示している（L97-109）
- 一方，解説は元の `choices` 配列順序（IPA 公式の選択肢順）に基づき「ア XX，イ YY，ウ ZZ，エ WW」と書かれている
- 結果，表示されたラベル（シャッフル後のア/イ/ウ/エ）と解説中で参照される「ア」「イ」「ウ」「エ」がズレる

### 実例（平成 27 問 12）
- データ: `choices = ['期待金額価値分析', '感度分析', 'デシジョンツリー分析', '発生確率・影響度マトリックス']`，`correctIndex = 3`
- 解説: 「ア 感度分析・イ EMV・ウ デシジョンツリー分析はいずれも定量的リスク分析の手法で，数値的な影響を計算する。」
  - ※「感度分析」はデータ的にはイ（index=1）だが，解説では「ア」として参照されている可能性。実際の解説本文は要確認だが，いずれにせよ **元順序参照が前提**
- 表示: シャッフルされて「ウ. 発生確率・影響度マトリックス」が正解として表示
- 結果: 解説の「ア」「イ」「ウ」と実際の表示ラベルが不一致でユーザ混乱

## 2. ユーザ指示による解決方針

**出題中は数字記号（①②③④），解答後は元順序のア/イ/ウ/エに切り替える。**

| 状態 | 選択肢ラベル | 例 |
|---|---|---|
| 解答前（出題中） | ①②③④（**表示順**＝シャッフル後の displayIdx） | ①. 感度分析 ②. 期待金額価値分析 ③. デシジョンツリー分析 ④. 発生確率・影響度マトリックス |
| 解答後（解説表示時） | ア/イ/ウ/エ（**元順序**＝originalIndex） | イ. 感度分析 ア. 期待金額価値分析 ウ. デシジョンツリー分析 エ. 発生確率・影響度マトリックス |

注: 解答後はラベルが ア/イ/ウ/エ に変わるが，**画面上の選択肢の並び順は変更しない**（ユーザが「自分が選んだ位置」を見失わないため）。同じ位置にラベルだけ差し替える。

## 3. 仕様詳細

### 3.1 表示ラベルの定義
- 解答前: `DISPLAY_LABELS = ['①','②','③','④']`（displayIdx に対応）
- 解答後: `ANSWER_LABELS = ['ア','イ','ウ','エ']`（originalIndex に対応，既存定数）

### 3.2 切替条件
- `showExplanation === false`: 解答前ラベル（①②③④, displayIdx ベース）
- `showExplanation === true`: 解答後ラベル（ア/イ/ウ/エ, originalIndex ベース）

### 3.3 「あなたの解答 / 正解」表示の整合
- 不正解時の補足表示（L444）「あなたの解答: 〇 / 正解: 〇」も **解答後のラベル（元順序のア/イ/ウ/エ）** で統一
  - 例: 不正解時「あなたの解答: ア / 正解: エ」（ユーザは選択肢の元順序を知る）

### 3.4 DEBUG 表示の整合
- L457 の DEBUG 表示「正解==〇」も元順序ラベル（ア/イ/ウ/エ）で表示
- これにより解説の参照ラベルと一致する

## 4. 実装方針

### 修正対象: `src/pages/OfficialMorningSession.tsx`

#### Step 1: 定数定義の追加（L28 付近）
```ts
const ANSWER_LABELS = ['ア', 'イ', 'ウ', 'エ'] as const
const DISPLAY_LABELS = ['①', '②', '③', '④'] as const  // 新規追加
```

#### Step 2: 選択肢ボタン表示（L421）
```tsx
// Before
<span className="inline-block text-xs font-bold text-brand-dark mr-2">{ANSWER_LABELS[displayIdx]}.</span>

// After
<span className="inline-block text-xs font-bold text-brand-dark mr-2">
  {showExplanation ? ANSWER_LABELS[originalIdx] : DISPLAY_LABELS[displayIdx]}.
</span>
```

#### Step 3: 「あなたの解答 / 正解」表示（L444）
```tsx
// Before
あなたの解答: {ANSWER_LABELS[selectedDisplayIndex]} / 正解: {ANSWER_LABELS[correctDisplayIndex]}

// After（元順序の選択肢 index で取得）
あなたの解答: {selectedIndex !== null ? ANSWER_LABELS[selectedIndex] : '-'} / 正解: {ANSWER_LABELS[currentQuestion.correctIndex]}
```

注: `selectedIndex` / `currentQuestion.correctIndex` は **元順序の index**（0〜3）なので，そのまま `ANSWER_LABELS[]` に渡せる。`selectedDisplayIndex` / `correctDisplayIndex` を使うとシャッフル後の位置になるため，**元順序を直接参照する**。

#### Step 4: DEBUG 表示の正解ラベル（L457）
```tsx
// Before
解説{debugMode && <span className="ml-2 text-yellow-700">（DEBUG: 正解=={ANSWER_LABELS[correctDisplayIndex]}）</span>}

// After
解説{debugMode && <span className="ml-2 text-yellow-700">（DEBUG: 正解=={ANSWER_LABELS[currentQuestion.correctIndex]}）</span>}
```

### 補足: 関連変数の整理
- `displayIdx`: シャッフル後の表示位置（0〜3）
- `originalIdx` / `currentQuestion.correctIndex` / `selectedIndex`: 元順序の index（0〜3）
- `selectedDisplayIndex` / `correctDisplayIndex`: シャッフル後の表示位置を求めるための変数。**本タスクでは Step 2 のみで使用し，Step 3 と Step 4 では使わない**

## 5. 検証方法

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 修正適用
上記 Step 1〜4 を `OfficialMorningSession.tsx` に適用。

### Step 3: 機械検証
```bash
npm run validate-data
npm run build
```

### Step 4: 目視動作確認（重要）
```bash
npm run dev
```
ブラウザで `http://localhost:5173` 等を開き，以下を確認:

1. **平成 27 問 12 を表示**（午前II → H27 → 問 12）
   - [ ] 解答前: 選択肢ラベルが ①②③④ で表示される
   - [ ] 適当な選択肢を選んで解答
   - [ ] 解答後: ラベルが ア/イ/ウ/エ に切り替わる
   - [ ] 「発生確率・影響度マトリックス」が **エ** として表示される（元順序の correctIndex=3 → エ）
   - [ ] 解説本文の「ア 感度分析・イ EMV・ウ デシジョンツリー分析…」と表示ラベルが一致する

2. **平成 27 問 13 を表示**
   - [ ] 解答後「品質保証教育訓練費」が **ア** として表示（correctIndex=0 → ア）
   - [ ] 解説「ア クレーム調査費・イ 損害賠償費…」← 元データの correctIndex とラベルが一致するか確認

3. **不正解時の補足表示**
   - [ ] わざと不正解を選択
   - [ ] 「あなたの解答: 〇 / 正解: 〇」のラベルが ア/イ/ウ/エ で表示される

4. **DEBUG モード**
   - [ ] 設定でデバッグモード ON
   - [ ] 「DEBUG: 正解==〇」のラベルが元順序の ア/イ/ウ/エ で表示される

5. **前/次の問題への移動**
   - [ ] 次の問題に進むと再び ①②③④ に戻る
   - [ ] 前に戻った問題（解答済）はラベルが ア/イ/ウ/エ で表示される

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P3_answer_labels_codex_review.md` を新規作成し，目視確認結果を記録
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK
- [ ] 上記 Step 4 のチェック項目すべて pass
- [ ] スクリーンショット（解答前 / 解答後）を 1 〜 2 枚レビュー記録に添付推奨

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル（データ側 / 他の画面）を編集しない
- ❌ シャッフル機能（`shuffledChoices`）の挙動は **変更しない**（表示順のランダム化は維持）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ⚠️ 解説本文（`explanation`）は **触らない**（ラベル表記が元順序前提のまま機能するように UI で吸収）

## 8. 完了後の git 操作
```bash
git add src/pages/OfficialMorningSession.tsx
git add tasks/reviews/F2-P3_answer_labels_codex_review.md
git commit -m "[X] 午前II 選択肢ラベル解答前後切替: 解答前①②③④ / 解答後アイウエ"
git push origin main
```

## 9. レビュー記録テンプレート

`tasks/reviews/F2-P3_answer_labels_codex_review.md`:

```md
# 午前II 選択肢ラベル切替 Codex 作業メモ

## 実施内容
- OfficialMorningSession.tsx に DISPLAY_LABELS 定数を追加
- 解答前/解答後でラベルを切替（①②③④ ↔ ア/イ/ウ/エ）
- 「あなたの解答 / 正解」「DEBUG 正解==」表示も元順序ラベルに統一

## 変更箇所
- L28 付近: DISPLAY_LABELS 定数追加
- L421: 選択肢ボタンラベル切替
- L444: 「あなたの解答 / 正解」を元順序ラベルに修正
- L457: DEBUG 表示を元順序ラベルに修正

## 検証結果
- npm run validate-data: OK
- npm run build: OK
- 目視: 平成27 問12 で改善確認
  - 解答前: ①②③④
  - 解答後: ア/イ/ウ/エ（解説の参照と一致）
- 目視: 平成27 問13 で改善確認
- 目視: 不正解時の「あなたの解答 / 正解」表示も整合
- 目視: DEBUG モードの「正解==」も整合

## スクリーンショット
- （添付）
```
