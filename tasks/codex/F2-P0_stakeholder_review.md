# Codex 作業指示書: F2-P0 stakeholder ノート 第6版要素 遡及補完 レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P0（stakeholder ノートに PMBOK第6版要素を遡及補完）の Codex レビューフェーズ
> 想定所要時間: 1〜2h

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用（修正があれば `[X] F2-P0 stakeholder Codex review fixes`、指摘のみで修正なしは `[X] F2-P0 stakeholder Codex review notes`）
- 不明点があれば**自己判断せず**、`tasks/questions/F2-P0_stakeholder.md` に記録して push（実装はそこで停止）

## 1. 作業概要
Claude が投入した `src/pages/NoteDetail.tsx` の `NOTE_DB.stakeholder` への遡及補完（新規 §32/§33 追加 + 既存7セクションへの navyItems 補足追記 + 旧 §32-33 を §34-35 にリネーム）に対し、設計書 §2.7e.2 F2-P0 のレビューを実施する。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定（コンテンツ妥当性はユーザ最終確認担当）。

## 2. 前提
- 関連ドキュメント:
  - `detailed_design.md` v0.20 §2.7e.1（PMBOK版バランス方針）／§2.7e.2 F2-P0（フロー）／§2.7e.3 品質ゲート（マークアップ + インデント必須）
  - `tasks/F2-P0_stakeholder_supplement_outline.md`（章構成案）
  - `docs/note_markup_rules.md` v1.0（==赤字== / __ネイビー__ マークアップ規約・インデント運用・**正本**）
  - F2-P1 team のレビュー記録 `tasks/reviews/F2-P1_team_codex_review.md` を参考（同じテンプレート）
- 関連型定義: `src/pages/NoteDetail.tsx` line 20〜81

## 3. 入力ファイル（読むだけ）
- `src/pages/NoteDetail.tsx`（NOTE_DB.stakeholder ブロック / 約 line 415〜940）
- `scripts/validate-static-data.ts`
- `tasks/F2-P0_stakeholder_supplement_outline.md`

## 4. 出力ファイル（作成または編集）
- `tasks/reviews/F2-P0_stakeholder_codex_review.md`（新規・必須）— F2-P1 team と同じテンプレートで記録
- 修正が必要な場合のみ: `src/pages/NoteDetail.tsx`（NOTE_DB.stakeholder 内のみ）

## 5. 作業手順

### Step 1: 環境セットアップと現状確認
```bash
git pull origin main
git log --oneline -5              # F2-P0 投入の commit が見えるはず
npm install
npm run validate-data              # [OK] 全データの整合性確認完了 + 「投入済カテゴリ: 2件」を確認
npm run build                      # tsc + vite build pass を確認
```

### Step 2: 型整合性・セクション数チェック
- `NOTE_DB.stakeholder` 全体を読み、`NoteData` 型と `NoteSection` 型に完全準拠しているか確認
- 主なチェック項目:
  - [ ] `summary: string`（非空）
  - [ ] `sections: NoteSection[]`（**35要素**、F2-P0 で 33→35）
  - [ ] `exam_tips: string[]`（9 件以上、非空。第6版補足が追加されている）
  - [ ] 各 `section.heading` が「N. タイトル」形式の連番 1〜35
  - [ ] 旧 §32, §33 が §34, §35 にリネームされている（内容は変更なし）
  - [ ] 新規 §32, §33 が追加されている（F2-P0 で生成）

### Step 3a: インデント整合性 ★v0.20 必須
`docs/note_markup_rules.md` §5「インデント（階層構造）の運用」に従い、以下を確認:
- [ ] 包含関係のある列挙項目に **全角スペース `　`** が先頭に付いている（最大2階層）
- [ ] 「親見出し:」直後の列挙項目がインデント1（全角スペース1個）になっている
- [ ] §32 新規セクション: 4プロセス各々の主要インプット／主要ツール&技法／主要アウトプットがインデント1で揃っている
- [ ] §33 新規セクション: 両版の枠組み比較の2項目がインデント1
- [ ] §6（成果1-4）、§11（対策1-3）、§16（3属性）、§17（4方向）、§30（4対応）の既存インデントが維持されている
- [ ] §19、§24、§32（旧）→ §34 で既存の全角スペースインデントが破壊されていない
- [ ] 半角スペース・タブが混入していない

### Step 3b: 構造化トークン整合性
`docs/note_markup_rules.md` §3 / §6 のチェックリストを実施:
- [ ] 各 items 文字列について `__` の出現回数が偶数（または 0）
- [ ] 各 items 文字列について `==` の出現回数が偶数（または 0）
- [ ] 全角イコール `＝` が含まれない
- [ ] `===` / `___` / `====` / `____` のような連続記号がない
- [ ] `EmphasisToken.style` が `'red' | 'navy' | 'plain'` 以外を持たない
- [ ] `navyItems` の token は全て `style: 'navy'`

推奨コマンド:
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 414; $i -lt 940; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```

### Step 4: 誤字脱字・表記揺れチェック
- 章番号と heading の整合: 1〜35 で重複・欠番なし
- 用語の揺れチェック:
  - [ ] 「ステークホルダー」（「ステイクホルダー」「ステイクホルダ」混入なし）
  - [ ] 「エンゲージメント」（「エンゲイジメント」混入なし）
  - [ ] 「マネジメント」（「マネージメント」混入なし）
  - [ ] PMBOK プロセス番号: `13.1` 〜 `13.4` の表記統一
  - [ ] PMBOK 版表記: 「PMBOK第6版」「PMBOK第7版」
- §32 新規セクションのプロセス英語名（Identify Stakeholders / Plan Stakeholder Engagement / Manage Stakeholder Engagement / Monitor Stakeholder Engagement）の表記確認

### Step 5: 既存セクションへの不要変更の有無
- [ ] §1, §7, §9, §18, §19, §29, §31 の navyItems に第6版補足が追加されている（追加のみで既存テキストは破壊されていない）
- [ ] それ以外の既存セクション §2-§31（§1, §7, §9, §18, §19, §29 除く）への意図しない変更がない
- [ ] 旧 §32, §33 の items 内容は変更されていない（heading の番号のみ §34, §35 にリネーム）
- [ ] 旧 §33 navyItems の文言が「第6版＋第7版を統合的に扱う」「第6版要素は §32-33 に集約」に更新されている

推奨確認:
```bash
git log -p --since="1 hour ago" -- src/pages/NoteDetail.tsx | head -200
```

### Step 6: コードレベルの整合性
- [ ] `NOTE_DB` の export が維持されているか
- [ ] team セクションへの意図しない変更なし
- [ ] NoteDetail.tsx の他箇所（NOTE_CATEGORY_IDS / 型定義 / コンポーネント）に意図しない変更なし
- [ ] `categories.ts` の stakeholder エントリと整合
- [ ] LocalStorage キーや brand カラー、`pmap:` prefix への影響なし

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P0_stakeholder_codex_review.md` を新規作成。F2-P1 team と同じテンプレートに従い、観点別に ○/△/✕ で記録。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・型外し・マークアップ不整合・インデント不整合など **明確な誤り** は同セッション内で修正してよい
- 修正範囲は `NOTE_DB.stakeholder` 内のみ
- **コンテンツの中身（PMBOK 解釈の妥当性・ITTO 主要項目の選定）に対する変更は禁止** → ユーザ最終確認で判定

## 6. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P0_stakeholder_codex_review.md` が存在し、F2-P1 team と同じテンプレートに沿って記入されている
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 2件）
- [ ] `npm run build` PASS
- [ ] レビュー結果サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれかで明示
- [ ] Step 3a / 3b の検証結果が「奇数行ゼロ」「インデント整合性 ○」で明示されている

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイルを編集しない
- ❌ team セクションへの修正は禁止（別タスク扱い、F2-P1 team レビューで対応済）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止（ユーザ最終確認担当）
- ⚠️ stakeholder セクション本体への大規模リファクタリング禁止

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P0_stakeholder_codex_review.md
# 修正があれば:
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P0 stakeholder Codex review: <PASS or fixes>"
git push origin main
```

## 9. レビュー
Codex push 後、Claude が `tasks/reviews/F2-P0_stakeholder_codex_review.md` の内容を確認。問題なければユーザ最終確認（コンテンツ妥当性レビュー）へ進む。

## 10. 参考: Claude が確認済の事項（Codex 二重チェック対象）
以下は Claude 投入時に確認済だが、Codex も独立に再確認すること:
- 検証スクリプト pass
- typecheck/build pass
- 35 セクション存在（A: 6 / B: 5 / C: 6 / D: 6 / E: 5 / F: 3 / F+: 2 / G: 2）
- 新規 §32 で 4プロセス × ITTO 主要項目をインデント1で記述
- 新規 §33 で第6版/第7版対応関係を記述
- 既存 §1, §7, §9, §18, §19, §29, §31 に第6版補足が navyItems で追記
- 旧 §32, §33 の heading 番号を §34, §35 にリネーム
- exam_tips に第6版要素2項目を追加
- マークアップ `__` `==` 奇数行: stakeholder 範囲（line 415-939）で 0件
