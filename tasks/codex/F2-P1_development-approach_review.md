# Codex 作業指示書: F2-P1 development-approach ノート構造レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1（11カテゴリのノート作成）の development-approach カテゴリの Codex レビューフェーズ
> 想定所要時間: 2〜3h

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用（修正があれば `[X] F2-P1 development-approach Codex review fixes`、指摘のみで修正なしは `[X] F2-P1 development-approach Codex review notes`）
- 不明点があれば**自己判断せず**、`tasks/questions/F2-P1_development-approach.md` に記録して push（実装はそこで停止）

## 1. 作業概要
Claude が投入した `src/pages/NoteDetail.tsx` の `NOTE_DB.['development-approach']`（32 セクション）に対し、設計書 §2.7e.2 F2-P1 フロー2「Codex レビュー」を実施する。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定（コンテンツ妥当性はユーザ最終確認担当）。

PMBOK第6版「アジャイル実務ガイド」＋第7版「開発アプローチとライフサイクル」パフォーマンス領域の統合カテゴリ。アジャイルマニフェスト・スクラム・カンバン・XP・スケーリングが主要トピック。

## 2. 前提
- 関連ドキュメント:
  - `detailed_design.md` v0.20 §2.7e.1（PMBOK版バランス方針）／§2.7e.2 F2-P1（フロー）／§2.7e.3 品質ゲート（マークアップ + インデント必須）
  - `tasks/F2-P1_development-approach_outline.md`（章構成案、全32セクション）
  - `docs/note_markup_rules.md` v1.0（==赤字== / __ネイビー__ マークアップ規約・インデント運用・**正本**）
    - 特に **§3.6 navyItems token text 内マークアップ禁止**（F2-P0 教訓）
  - F2-P1 team のレビュー記録 `tasks/reviews/F2-P1_team_codex_review.md` / F2-P0 stakeholder の `tasks/reviews/F2-P0_stakeholder_codex_review.md` を参考
- 関連型定義: `src/pages/NoteDetail.tsx` line 20〜81

## 3. 入力ファイル（読むだけ）
- `src/pages/NoteDetail.tsx`（NOTE_DB.['development-approach'] ブロック / 約 line 1480〜2020）
- `scripts/validate-static-data.ts`
- `tasks/F2-P1_development-approach_outline.md`
- `docs/note_markup_rules.md`

## 4. 出力ファイル（作成または編集）
- `tasks/reviews/F2-P1_development-approach_codex_review.md`（新規・必須）— F2-P1 team / F2-P0 と同じテンプレートで記録
- 修正が必要な場合のみ: `src/pages/NoteDetail.tsx`（NOTE_DB['development-approach'] 内のみ）

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -5              # development-approach 投入の commit が見えるはず
npm install
npm run validate-data              # 「投入済カテゴリ: 3件 (stakeholder, team, development-approach)」を確認
npm run build                      # tsc + vite build pass を確認
```

### Step 2: 型整合性・セクション数チェック
- `NOTE_DB['development-approach']` 全体を読み、`NoteData` 型と `NoteSection` 型に完全準拠しているか確認
- 主なチェック項目:
  - [ ] `summary: string`（非空）
  - [ ] `sections: NoteSection[]`（**32要素**）
  - [ ] `exam_tips: string[]`（10件、非空）
  - [ ] 各 `section.heading` が「N. タイトル」形式の連番 1〜32
  - [ ] カテゴリキーが文字列 `'development-approach'`（ハイフン含む、`categories.ts` と整合）

### Step 3a: インデント整合性 ★v0.20 必須
`docs/note_markup_rules.md` §5「インデント（階層構造）の運用」に従い、以下を確認:
- [ ] 包含関係のある列挙項目に **全角スペース `　`** が先頭に付いている（最大2階層）
- [ ] 「親見出し:」直後の列挙項目がインデント1（全角スペース1個）になっている
- [ ] §2 3類型の子3つ、§5 選定軸の子6つ、§9 メリット/デメリットの子各4つ、§10 適/不適の子各5つ、§12 4価値の子4つ・12原則の子8つ、§16 比較項目の子8つ、§18 役割の子3つ＋各責務、§19 5イベントの子5つ＋詳細、§20 3成果物の子3つ＋詳細、§21 INVEST の子6つ、§23 カンバン要素の子5つ、§24 XPプラクティスの子8つ、§25 4手法、§26 5フレームワーク、§27 4パターン、§29 5契約形態、§30 DevOps関連、§31 頻出論点10、§32 ひっかけ10 — それぞれインデント1で揃っている
- [ ] 3層構造（§19 イベント詳細、§20 成果物詳細）がある場合は孫レベルが全角2個
- [ ] 半角スペース・タブが混入していない

### Step 3b: 構造化トークン整合性
`docs/note_markup_rules.md` §3 / §6 のチェックリストを実施:
- [ ] 各 items 文字列について `__` の出現回数が偶数（または 0）
- [ ] 各 items 文字列について `==` の出現回数が偶数（または 0）
- [ ] 全角イコール `＝` が含まれない
- [ ] `===` / `___` / `====` / `____` のような連続記号がない
- [ ] `EmphasisToken.style` が `'red' | 'navy' | 'plain'` 以外を持たない
- [ ] `navyItems` の token は全て `style: 'navy'`
- [ ] **`navyItems` の token text 内に `==X==` / `__X__` が含まれていない**（F2-P0 教訓、§3.6）

推奨コマンド:
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 1477; $i -lt 2020; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```

### Step 4: 誤字脱字・表記揺れチェック
- 章番号と heading の整合: 1〜32 で重複・欠番なし
- 用語の揺れチェック（以下の用語は表記固定）:
  - [ ] 「アジャイル」（「アジャイル」「アジャイル」の表記揺れなし、「Agile」との混在に注意）
  - [ ] 「スクラム」（「Scrum」との混在は意図的な英語名併記のみ許容）
  - [ ] 「プロダクトオーナー」（「プロダクト・オーナー」と中黒の混在なし）
  - [ ] 「スクラムマスター」（「スクラム・マスター」混在なし）
  - [ ] 「ウォーターフォール」（「ウォータフォール」混入なし）
  - [ ] 「マニフェスト」（「マニフェスト」「マニフェスト」の揺れなし）
  - [ ] 「ライフサイクル」（「ライフ・サイクル」混在なし）
  - [ ] PMBOK 版表記: 「PMBOK第6版」「PMBOK第7版」「アジャイル実務ガイド」
  - [ ] スクラムイベント英語名: Sprint Planning / Daily Scrum / Sprint Review / Sprint Retrospective
  - [ ] アジャイル手法名: XP, Scrum, FDD, DSDM, Crystal, Lean, Kanban
  - [ ] スケーリングフレームワーク: SAFe, LeSS, Nexus, Scrum@Scale, DAD
- 半角/全角の揺れ:
  - [ ] 英数字は半角、括弧は文脈に合わせる
  - [ ] 中黒「・」と読点「、」の使い分けが一貫しているか

### Step 5: PMBOK 第6版／第7版 統合確認 ★v0.20 観点
本カテゴリは PMBOK第6版「アジャイル実務ガイド」＋第7版「開発アプローチとライフサイクル」パフォーマンス領域の統合。以下を確認:
- [ ] §3 で PMBOK第7版の領域名「開発アプローチとライフサイクル」が明示されている
- [ ] §4 で PMBOK第6版のアジャイル実務ガイドの位置づけが説明されている
- [ ] §32 ひっかけパターンで「PMBOK6 vs PMBOK7」の混同が言及されている
- [ ] navyItems の出典記述が PMBOK6（章番号付き）または PMBOK7（領域名）を明示している
- [ ] 試験頻出キーワード（赤字）が PMBOK6 用語を優先付与している（例: スクラム成果物名、INVEST 観点）

### Step 6: コードレベルの整合性
- [ ] `NOTE_DB` の export が維持されているか
- [ ] development-approach 以外のカテゴリ（stakeholder, team）への意図しない変更なし
- [ ] NoteDetail.tsx の他箇所（NOTE_CATEGORY_IDS / 型定義 / コンポーネント）に意図しない変更なし
- [ ] `categories.ts` の development-approach エントリ（`id: 'development-approach'`, `name: '開発アプローチ'`）と整合
- [ ] LocalStorage キーや brand カラー、`pmap:` prefix への影響なし

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_development-approach_codex_review.md` を新規作成。F2-P1 team / F2-P0 と同じテンプレートに従い、観点別に ○/△/✕ で記録。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・型外し・マークアップ不整合・インデント不整合など **明確な誤り** は同セッション内で修正してよい
- 修正範囲は `NOTE_DB['development-approach']` 内のみ
- **コンテンツの中身（アジャイル理論の解釈・スクラム公式ガイドとの整合）に対する変更は禁止** → ユーザ最終確認で判定

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_development-approach_codex_review.md` が存在し、F2-P1 team と同じテンプレートに沿って記入されている
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 3件）
- [ ] `npm run build` PASS
- [ ] レビュー結果サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれかで明示
- [ ] Step 3a / 3b の検証結果が「奇数行ゼロ」「インデント整合性 ○」「navyItems token text 内マークアップなし」で明示されている

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない
- ❌ stakeholder / team セクションへの修正は禁止（別タスク扱い）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止（ユーザ最終確認担当）
- ⚠️ development-approach セクション本体への大規模リファクタリング禁止（構造を保ったまま誤字・マークアップ不整合の修正のみ）

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P1_development-approach_codex_review.md
# 修正があれば:
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P1 development-approach Codex review: <PASS or fixes>"
git push origin main
```

## 9. レビュー
Codex push 後、Claude が `tasks/reviews/F2-P1_development-approach_codex_review.md` の内容を確認。問題なければユーザ最終確認（コンテンツ妥当性レビュー）へ進む。

## 10. 参考: Claude が確認済の事項（Codex 二重チェック対象）
以下は Claude 投入時に確認済だが、Codex も独立に再確認すること:
- 検証スクリプト pass（3件のカテゴリ）
- typecheck/build pass
- 32 セクション存在（A: 5 / B: 5 / C: 6 / D: 6 / E: 4 / F: 4 / G: 2 = 32）
- マークアップ `__` `==` 奇数行: 0件（development-approach 範囲 line 1478-2019）
- 正規表現置換: Claude は `__([^_=]+?)==` で92行を一次置換、その後二次不整合パターン `__X__: ... __Y==` を18件自動修正、最後にユーザストーリーフォーマット1行を手動修正
- §12 アジャイルマニフェスト 4価値が R6秋期 問17 と一致
- §21 INVEST 6要素が R6秋期 問16 と整合
- 第7版「開発アプローチとライフサイクル」パフォーマンス領域と第6版アジャイル実務ガイドを統合的に記述
