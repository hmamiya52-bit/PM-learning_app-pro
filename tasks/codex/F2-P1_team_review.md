# Codex 作業指示書: F2-P1 team ノート構造レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1（11カテゴリのノート作成）の team カテゴリの Codex レビューフェーズ
> 想定所要時間: 2〜3h

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用（修正があれば `[X] F2-P1 team Codex review fixes`、指摘のみで修正なしは `[X] F2-P1 team Codex review notes`）
- 不明点があれば**自己判断せず**、`tasks/questions/F2-P1_team.md` に記録して push（実装はそこで停止）

## 1. 作業概要
Claude が投入した `src/pages/NoteDetail.tsx` の `NOTE_DB.team`（37 セクション）に対し、設計書 §2.7e.2 F2-P1 フロー2「Codex レビュー」を実施する。観点は **構造化トークン整合性・誤字脱字・コードレベルの整合性** に限定（コンテンツ妥当性はユーザ最終確認担当）。

**v0.18 で PMBOK第6版＋第7版を統合する方針に変更**された最初のカテゴリ。第6版要素統合のセクション（23/27/28/33）が4つ含まれる点に注意。

## 2. 前提
- 関連ドキュメント:
  - `detailed_design.md` v0.18 §2.7e.1（PMBOK版バランス方針）／§2.7e.2 F2-P1（フロー）／§2.7e.3 品質ゲート
  - `detailed_design.md` v0.18 §5.5（ノート詳細画面 / NoteData 構造）
  - `basic_design.md` v0.9 §5.9（静的データ検証スクリプト）
  - `tasks/F2-P1_team_outline.md`（章構成案、全37セクション）
  - `docs/note_markup_rules.md` v1.0（==赤字== / __ネイビー__ マークアップ規約・**正本**）
  - F1.5-P2 stakeholder のレビュー記録 `tasks/reviews/F1.5-P2_codex_review.md` を参考
- 前タスク: Claude commit `<TBD>` で team 37セクション投入済
- 関連型定義: `src/pages/NoteDetail.tsx` line 20〜81（`NoteData` / `NoteSection` / `EmphasisToken` / `HeaderDiagram` 等）

## 3. 入力ファイル（読むだけ）
- `src/pages/NoteDetail.tsx`（NOTE_DB.team ブロック / 約 line 884〜1430）
- `scripts/validate-static-data.ts`
- `tasks/F2-P1_team_outline.md`
- `src/data/categories.ts`（team エントリの categoryId と整合確認用）

## 4. 出力ファイル（作成または編集）
- `tasks/reviews/F2-P1_team_codex_review.md`（新規・必須）— F1.5-P2/P3/P4 と同じテンプレートで記録
- 修正が必要な場合のみ: `src/pages/NoteDetail.tsx`（NOTE_DB.team 内のみ。他カテゴリの追加・編集は禁止）

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -5              # team 投入の commit が見えるはず
npm install                        # 念のため
npm run validate-data              # [OK] 全データの整合性確認完了 + 「NOTE_DB 投入済カテゴリ: 2件 (stakeholder, team)」を確認
npm run build                      # tsc + vite build pass を確認
```

### Step 2: 型整合性チェック（コードレベル）
- `NOTE_DB.team` 全体を読み、`NoteData` 型と `NoteSection` 型に完全準拠しているか確認
- 主なチェック項目:
  - [ ] `summary: string`（非空）
  - [ ] `sections: NoteSection[]`（37要素）
  - [ ] `exam_tips: string[]`（9 件以上、非空）
  - [ ] 各 `section.heading` が「N. タイトル」形式（連番）で 1〜37 連続
  - [ ] `items` 配列のすべての要素が string
  - [ ] `navyItems` の要素が `EmphasisToken[]`（= `{text, style}[]`） で style は `'navy'` のみ（赤字は item 内 `==X==` で表現する設計）
  - [ ] `EmphasisToken.style` が `'red' | 'navy' | 'plain'` 以外を持たない
- team セクションには `headerDiagrams` は**未使用**（章構成案では §B/§E/§F で使用予定だったが、初版は items 中心。診断時に headerDiagrams が存在する場合は構造を検証、無くてもOK）

### Step 3: 構造化トークン整合性 ★最重要（F2-P1 で大量に問題が発生した）
本タスクで Claude が初回生成時に `__X==` 不整合（`__` で開いて `==` で閉じる）を大量発生させ、正規表現置換で修正済。再発・残存を確実に検出すること。

- 各 items 文字列について次のパターンを検出して報告:
  - [ ] **`__` 出現回数が奇数**の行（マークアップが閉じていない）
  - [ ] **`==` 出現回数が奇数**の行（赤字マークアップが閉じていない）
  - [ ] 片側のみの `==`（閉じ忘れ）
  - [ ] 連続 3 つ以上の `=`（例: `===`）または `_`（例: `___`）
  - [ ] 全角イコール（＝）の混入
  - [ ] `__X==Y__` のような不整合（開閉のマークアップ種類が違う）
- 推奨コマンド:
  ```powershell
  # __ 出現回数が奇数の行
  $content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
  for ($i = 883; $i -lt 1430; $i++) {
    $line = $content[$i]
    $usCount = ([regex]::Matches($line, '__')).Count
    $eqCount = ([regex]::Matches($line, '==')).Count
    if (($usCount -gt 0 -and $usCount % 2 -ne 0) -or
        ($eqCount -gt 0 -and $eqCount % 2 -ne 0)) {
      "L$($i+1): __[$usCount] ==[$eqCount]"
    }
  }
  ```
- マークアップ規約（`memory/feedback_note_markup.md`）の遵守:
  - [ ] 暗記対象キーワード（プロセス名・成果物名・ツール名・段階の正式名称）は `==X==`
  - [ ] 番号ラベル・役割名・観点見出し・一般語の構造強調は `__X__`
  - [ ] `__N.__ 〜` 形式の番号付きラベルが §31〜34（紛争解決優先順位 §34 含む）で多用されている。Each label closed properly.

### Step 4: 誤字脱字・表記揺れチェック
- 章番号と heading の整合: 「N. xxx」の N が 1〜37 で重複・欠番なし
- 用語の揺れチェック（以下の用語は表記固定）:
  - [ ] 「リーダーシップ」（「リーダシップ」混入なし）
  - [ ] 「マネジメント」（「マネージメント」混入なし）
  - [ ] 「モチベーション」（「モーチベーション」混入なし）
  - [ ] 「マネジリアル・グリッド」（中黒で統一、「マネージリアルグリッド」等の揺れなし）
  - [ ] 「サーバントリーダーシップ」（「サーヴァント」混入なし）
  - [ ] 「タックマンモデル」（「タックマン・モデル」「タックマンのモデル」混入なし）
  - [ ] 「マトリクス」（「マトリックス」との混在なし。本ノートは「マトリクス」採用）
  - [ ] 「コンフリクト」（「衝突」「対立」との並記時は意図的か確認）
  - [ ] 「グランドルール」（「グラウンドルール」混入なし）
  - [ ] 「コロケーション」（「co-location」と並記がある場合の表記揺れ）
  - [ ] PMBOK プロセス番号: `9.1` `9.2` `9.3` `9.4` `9.5` `9.6` の表記統一
  - [ ] PMBOK 版表記: 「PMBOK第6版」「PMBOK第7版」（「PMBOK 第6版」「PMBOK 6版」等の揺れなし）
- 半角/全角の揺れ:
  - [ ] 英数字は半角、括弧は文脈に合わせる（学術用語の英表記は半角丸括弧 `(...)`）
  - [ ] 中黒「・」と読点「、」の使い分けが一貫しているか
  - [ ] ハイフン／ダッシュ（`—`／`-`／`―`）の統一

### Step 5: コードレベルの整合性
- [ ] `NOTE_DB` の export が維持されているか（line 411 付近）
- [ ] team 以外のカテゴリが追加されていないか（F2-P1 単一カテゴリスコープ違反）
- [ ] NoteDetail.tsx の他箇所（NOTE_CATEGORY_IDS / NoteData 型 / RedWord等のコンポーネント）に意図しない変更が無いか
- [ ] `categories.ts` の team エントリ（`id: 'team', name: 'チーム'`）と heading 整合
- [ ] LocalStorage キーや brand カラー、`pmap:` prefix への影響なし
- [ ] stakeholder セクション（line 415〜881）への意図しない変更が無いか（特に diff で stakeholder 部分が変わっていないこと）

### Step 6: PMBOK 第6版／第7版 統合確認 ★v0.18 新観点
本カテゴリは PMBOK 第6版＋第7版を統合した最初のノート。以下を確認:
- [ ] 第6版要素のセクション（§23 「チームの育成」9.4、§27 「資源マネジメント計画」9.1、§28 「9.2/9.3/9.6」、§33 「チームのマネジメント」9.5）が存在
- [ ] §6「PMBOK第6版と第7版の対応関係」が存在し、両版の枠組み説明がある
- [ ] §37「ひっかけパターン」で「PMBOK6 vs PMBOK7 用語」の混同が言及されている
- [ ] navyItems の出典記述が PMBOK6（章番号付き）または PMBOK7（領域名）を明示している
- ※ 内容妥当性の判断はしない（ユーザ最終確認担当）。「枠組みとして両版が言及されているか」のみ確認

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data
npm run build
```
両方 pass で完了条件達成。

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_team_codex_review.md` を新規作成。F1.5-P2/P3 と同じテンプレートに従い、観点別に ○/△/✕ で記録。指摘事項は致命／改善推奨に分けて列挙。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・型外し・マークアップ不整合（`__` `==` 個数奇数）など **明確な誤り** は同セッション内で修正してよい
- 修正範囲は `NOTE_DB.team` 内のみ
- コミットは指摘 + 修正をまとめて 1 つの `[X]` コミットでよい
- **コンテンツの中身（PMBOK 解釈・出題傾向の妥当性・第6版／第7版併記バランス）に対する変更は禁止** → ユーザ最終確認で判定

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_team_codex_review.md` が存在し、F1.5-P2 と同じテンプレートに沿って記入されている
- [ ] `npm run validate-data` が `[OK] 全データの整合性確認完了` + 「NOTE_DB 投入済カテゴリ: 2件」で終了
- [ ] `npm run build` がエラーなく完了
- [ ] レビュー結果サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれかで明示されている
- [ ] 致命指摘がある場合は具体的な行番号・該当文字列が記載されている
- [ ] Step 3（マークアップ整合性）の検証結果が「__/== 奇数行ゼロ」または「修正済み」で明示されている

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない（他カテゴリのノート追加・design doc 更新等は禁止）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止（ユーザ最終確認担当）
- ❌ stakeholder セクションへの修正は禁止（F2-P0 で別途扱う）
- ⚠️ team セクション本体への大規模リファクタリング禁止（構造を保ったまま誤字・マークアップ不整合の修正のみ）

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P1_team_codex_review.md
# 修正があれば:
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P1 team Codex review: <PASS or fixes>"
git push origin main
```

## 9. レビュー
Codex push 後、Claude が `tasks/reviews/F2-P1_team_codex_review.md` の内容を確認。問題なければユーザ最終確認（コンテンツ妥当性レビュー）へ進む。

## 10. 参考: Claude が確認済の事項（Codex 二重チェック対象）
以下は Claude 投入時に確認済だが、Codex も独立に再確認すること:
- 検証スクリプト pass
- typecheck/build pass
- 37 セクション存在（A: 6 / B: 6 / C: 5 / D: 6 / E: 7 / F: 5 / G: 2 = 37）
- §895-897 / §955-956 / §969 / §971 で正規表現置換時の二次不整合が発生したが手動修正済（再発見した場合は致命扱いせず情報共有のみ）
- マークアップ正規表現置換: Claude は `__([^_=]+?)==` → `__$1__` で129行を一括変換、その後の `__X__: __Y==` 二重不整合を 7 行手動修正で解消
