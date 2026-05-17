# Codex 作業指示書: F2-P1 planning + project-work 統合レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1 第4・5カテゴリ（planning + project-work）の Codex レビュー
> 想定所要時間: 3〜4h

## 0. 共通ルール
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P1 planning+project-work Codex review: <PASS or fixes>`
- 不明点は `tasks/questions/F2-P1_planning-pw.md` に記録（自己判断禁止）

## 1. 作業概要
2カテゴリを **一括レビュー**（Claude が「2カテゴリずつ作成」方針）。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定。コンテンツ妥当性はユーザ最終確認。

| カテゴリ | セクション数 | 範囲（line） |
|---|---:|---|
| planning | 33 | 約 1997-2548 |
| project-work | 27 | 約 2549-3046 |

## 2. 前提
- `detailed_design.md` v0.20 §2.7e
- `docs/note_markup_rules.md` v1.0（**§3.6 navyItems token text 内マークアップ禁止**を特に注意）
- `tasks/F2-P1_planning_outline.md` / `tasks/F2-P1_project-work_outline.md`（章構成案）
- 先行カテゴリのレビュー記録: F2-P1 team / F2-P0 stakeholder / F2-P1 development-approach

## 3. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data    # 「投入済カテゴリ: 5件」を確認
npm run build
```

### Step 2: 型整合性・セクション数チェック
| カテゴリ | 確認 |
|---|---|
| planning | 33 sections, summary 非空, exam_tips 10件, 連番 1〜33 |
| project-work | 27 sections, summary 非空, exam_tips 10件, 連番 1〜27 |
| 共通 | `NoteData` / `NoteSection` 型準拠, `navyItems` style 全て `'navy'` |

カテゴリキー: `planning` / `'project-work'`（ハイフン含むため文字列リテラル必須）

### Step 3a: インデント整合性 ★必須
`docs/note_markup_rules.md` §5 に従い:
- [ ] 包含関係のある列挙項目に **全角スペース `　`** 先頭付与（最大2階層）
- [ ] 「親見出し:」直後の列挙にインデント1
- [ ] 同階層の項目が同じ深度で揃っている
- [ ] 半角スペース・タブ混入なし

特に確認すべきセクション:
- planning §2 サブシディアリー10種類、§6 要求事項収集技法群、§9 WBS階層、§10 妥当性確認/コントロール、§15 見積もり4技法、§16 CPM要素、§17 短縮2手法、§20 見積もり4技法、§22 予算構成、§23 EVM要素、§24 経済性4指標、§28 make-or-buy判断軸、§32-33 頻出/ひっかけ
- project-work §2 PMBOK6対応知識エリア、§9 契約3類型、§10 FP3派生、§11 CR3派生、§12 調達技法、§13 入札3方式、§14 調達コントロール技法、§15 コミュニケーション技法、§18 報告書4種、§20 SECI 4プロセス、§23 法令、§24 請負vs準委任、§25 NDA、§26-27 頻出/ひっかけ

### Step 3b: 構造化トークン整合性
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 1997; $i -lt 3046; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```
期待結果: **奇数行 0 件**。Claude は既に `__([^_=]+?)==` で223行を一次置換、`__X__: ... __Y==` パターンで28回二次修正済。

- [ ] 全角イコール `＝` が含まれない
- [ ] `===` / `___` 等の連続記号なし
- [ ] **`navyItems` token text 内に `==X==` / `__X__` がない**（F2-P0 教訓 §3.6）

### Step 4: 誤字脱字・表記揺れ

**共通**:
- PMBOK 版表記: 「PMBOK第6版」/「PMBOK第7版」（空白なし）
- プロセス番号: §X.Y 形式

**planning 固有**:
- 「WBS」「PDM」「CPM」「PERT」「EVM」（英略語の表記統一）
- 「クリティカルパス」（「クリティカル・パス」中黒混在なし）
- 「ベースライン」（「ベース・ライン」混在なし）
- 「ベータ分布」/「三角分布」
- 「アクティビティ」/「アクティビティー」混在なし

**project-work 固有**:
- 「契約形態」/「契約タイプ」混在なし
- 「請負」「準委任」（民法用語）
- 「下請法」（正式名: 下請代金支払遅延等防止法）
- 「職務著作」「法人著作」
- 「FFP」「FPIF」「FP-EPA」「CPFF」「CPIF」「CPAF」（契約略語）
- 「RFP」「RFQ」「RFI」「SOW」（調達文書略語）
- 「CCB」（変更管理委員会）

### Step 5: PMBOK 第6版／第7版 統合確認
- [ ] planning §30, §31 で PMBOK6/7 対応関係が明示
- [ ] project-work §1, §2 で PMBOK6/7 対応関係が明示
- [ ] navyItems の出典記述が PMBOK6（章番号付き）または PMBOK7（領域名）を明示
- [ ] team / stakeholder / development-approach カテゴリへの相互参照が正確（例: planning §27 → stakeholder §32, project-work §19 → team §28）

### Step 6: コードレベル整合性
- [ ] `NOTE_DB` の export 維持
- [ ] 既存4カテゴリ（stakeholder, team, development-approach）への意図しない変更なし
- [ ] `NOTE_CATEGORY_IDS` 変更なし
- [ ] `categories.ts` の planning（`name: '計画'`）/ project-work（`name: 'プロジェクト作業'`）と整合

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data    # 「投入済カテゴリ: 5件」
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_planning_and_project-work_codex_review.md` を新規作成。F2-P1 team と同じテンプレートに従い、**両カテゴリを並列に評価**。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・全角イコール・マークアップ/インデント不整合は同セッション内で修正可
- 修正範囲は `NOTE_DB.planning` / `NOTE_DB['project-work']` 内のみ
- **コンテンツの中身（理論解釈・契約形態・法令解釈）に対する変更は禁止**

## 4. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_planning_and_project-work_codex_review.md` 作成
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 5件）
- [ ] `npm run build` PASS
- [ ] サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれか明示
- [ ] マークアップ・インデント検査結果（奇数行・全角イコール・navyItems token text）が明示

## 5. 注意事項・禁止事項
- ❌ 既存4カテゴリへの修正は禁止（別タスク扱い）
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止

## 6. 完了後の git 操作
```bash
git add tasks/reviews/F2-P1_planning_and_project-work_codex_review.md
git add src/pages/NoteDetail.tsx   # 修正があれば
git commit -m "[X] F2-P1 planning+project-work Codex review: <PASS or fixes>"
git push origin main
```

## 7. Claude が確認済の事項
- 検証スクリプト pass（5件のカテゴリ）
- typecheck/build pass
- planning 33 セクション / project-work 27 セクション
- マークアップ `__` `==` 奇数行: 0件（planning+project-work 範囲 L1998-3046）
- 正規表現置換: 1次 223行 + 2次 28回 = 251回の自動修正で奇数行ゼロを達成
- 相互参照: planning §27 → stakeholder §32 / project-work §2/§19 → team §28
