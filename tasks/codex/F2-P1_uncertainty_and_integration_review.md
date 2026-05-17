# Codex 作業指示書: F2-P1 uncertainty + integration 統合レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1 第8・9カテゴリ（uncertainty + integration）の Codex レビュー
> 想定所要時間: 3〜4h

## 0. 共通ルール
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P1 uncertainty+integration Codex review: <PASS or fixes>`
- 不明点は `tasks/questions/F2-P1_uncertainty-integration.md` に記録（自己判断禁止）

## 1. 作業概要
2カテゴリを **一括レビュー**。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定。コンテンツ妥当性はユーザ最終確認。

| カテゴリ | セクション数 | 範囲（line） |
|---|---:|---|
| uncertainty | 27 | 約 4089-4690 |
| integration | 24 | 約 4690-5150 |

## 2. 前提
- `detailed_design.md` v0.20 §2.7e
- `docs/note_markup_rules.md` v1.0（**§3.6 navyItems token text 内マークアップ禁止**を特に注意）
- `tasks/F2-P1_uncertainty_outline.md` / `tasks/F2-P1_integration_outline.md`
- 先行カテゴリのレビュー記録（特に F2-P1 delivery+measurement）

## 3. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data    # 「投入済カテゴリ: 9件」を確認
npm run build
```

### Step 2: 型整合性・セクション数チェック
| カテゴリ | 確認 |
|---|---|
| uncertainty | 27 sections, summary 非空, exam_tips 10件, 連番 1〜27 |
| integration | 24 sections, summary 非空, exam_tips 10件, 連番 1〜24 |

### Step 3a: インデント整合性 ★必須
`docs/note_markup_rules.md` §5 に従い:
- [ ] 包含関係に **全角スペース `　`** 付与（最大2階層）
- [ ] 「親見出し:」直後の列挙にインデント1
- [ ] 半角スペース・タブ混入なし

**特に確認すべきセクション**:
- uncertainty §3 PMBOK6 7プロセス、§4 計画書構成、§5 特定技法群、§6 RBSカテゴリ、§7 確率影響度マトリクス、§9 EMV/決定木、§13 脅威5戦略、§14 機会5戦略、§17 リスク登録簿項目、§20 3階層、§26-27 頻出/ひっかけ
- integration §2 PMBOK6 7プロセス、§5 憲章構成、§13 統合変更管理、§14 変更要求4種、§15 CCB構成、§17 変更ワークフロー9ステップ、§19 ベースライン、§23-24 頻出/ひっかけ

### Step 3b: 構造化トークン整合性
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 4089; $i -lt 5150; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```
期待結果: **奇数行 0 件**。Claude は既に 234行の1次置換 + 3行の手動修正済。

- [ ] 全角イコール `＝` が含まれない
- [ ] `===` / `___` 等の連続記号なし
- [ ] **`navyItems` token text 内に `==X==` / `__X__` がない**

### Step 4: 誤字脱字・表記揺れ

**uncertainty 固有**:
- リスク戦略名: 脅威「==回避==／==転嫁==／==軽減==／==受容==／==エスカレーション==」、機会「==活用==／==共有==／==強化==／==受容==／==エスカレーション==」
- 「EMV」「RBS」「PESTLE」「TECOP」「VUCA」（略語の表記）
- 「モンテカルロ」（「モンテ・カルロ」中黒なし）
- 「トルネード図」（「トルネードチャート」混在に注意）
- 「リスク選好」「リスク許容度」「リスク・スレッショルド」

**integration 固有**:
- PMBOK 4.x プロセス名（4.1〜4.7 すべて正確）
- 「CCB」（変更管理委員会）
- 「ベースライン」（「ベース・ライン」混在なし）
- 「是正処置」「予防処置」「欠陥修正」
- 「構成項目」（CI）／「構成管理」
- 「セマンティック・バージョニング」「Git Flow」「GitHub Flow」

### Step 5: PMBOK 第6版／第7版 統合確認
- [ ] uncertainty §1, §3, §24, §27 で PMBOK6/7 対応関係が明示
- [ ] integration §1, §3, §24 で PMBOK6/7 対応関係が明示（特に第7版で独立領域消滅の点）
- [ ] 既存7カテゴリへの相互参照が正確（例: uncertainty §6 → planning §25、integration §11 → measurement §4-8、integration §21 → delivery §26）

### Step 6: コードレベル整合性
- [ ] `NOTE_DB` の export 維持
- [ ] 既存7カテゴリへの意図しない変更なし
- [ ] `categories.ts` の uncertainty（`name: '不確かさ・リスク'`）/ integration（`name: '統合・変更管理'`）と整合

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data    # 「投入済カテゴリ: 9件」
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_uncertainty_and_integration_codex_review.md` を新規作成。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・全角イコール・マークアップ/インデント不整合は同セッション内で修正可
- 修正範囲は `NOTE_DB.uncertainty` / `NOTE_DB.integration` 内のみ
- **コンテンツの中身に対する変更は禁止**

## 4. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_uncertainty_and_integration_codex_review.md` 作成
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 9件）
- [ ] `npm run build` PASS
- [ ] サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれか明示
- [ ] マークアップ・インデント検査結果が明示

## 5. 注意事項・禁止事項
- ❌ 既存7カテゴリへの修正は禁止
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止
- ❌ 並行作業中の F2-figures / F2-P3 OCR との干渉禁止

## 6. 完了後の git 操作
```bash
git add tasks/reviews/F2-P1_uncertainty_and_integration_codex_review.md
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P1 uncertainty+integration Codex review: <PASS or fixes>"
git push origin main
```

## 7. Claude が確認済の事項
- 検証スクリプト pass（9件のカテゴリ）
- typecheck/build pass
- uncertainty 27 セクション / integration 24 セクション
- マークアップ `__` `==` 奇数行: 0件（範囲 L4089-5150）
- 正規表現置換: 1次 234行 + 2次 0回 + 手動 3行 = 237回の自動修正で奇数行ゼロを達成
- 相互参照: uncertainty §6 → planning §25 / integration §11 → measurement §4-8 / integration §21 → delivery §26 / integration §9/§22 → project-work §5/§21
