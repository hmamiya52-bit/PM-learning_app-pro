# Codex 作業指示書: F2-P1 service-management レビュー（★F2-P1 最終カテゴリ）

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1 第12カテゴリ（service-management）の Codex レビュー — **F2-P1 ノート最後の1カテゴリ**
> 想定所要時間: 2〜3h

## 0. 共通ルール
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P1 service-management Codex review: <PASS or fixes>`
- 不明点は `tasks/questions/F2-P1_service-management.md` に記録（自己判断禁止）

## 1. 作業概要
**F2-P1 最後のカテゴリ**。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定。コンテンツ妥当性はユーザ最終確認。

| カテゴリ | セクション数 | 範囲（line） |
|---|---:|---|
| service-management | 29 | 約 6780-7420 |

**特徴**: 本カテゴリは ==PMBOK 外==（ITIL v3/v4・ISO/IEC 20000・関連法令）。

## 2. 前提
- `detailed_design.md` v0.21 §2.7e
- `docs/note_markup_rules.md` v1.0（**§3.6 navyItems token text 内マークアップ禁止**、**§3.3b 赤字直後の `=` 禁止**、**§5.5b 子レベル `:` 直下は孫レベル**を特に注意）
- `tasks/F2-P1_service-management_outline.md`
- 先行カテゴリのレビュー記録（F2-P1 governance+tailoring-models）

## 3. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data    # 「投入済カテゴリ: 12件」を確認（★F2-P1 全件投入完了）
npm run build
```

### Step 2: 型整合性・セクション数チェック
- [ ] sections は **29 要素**、heading は `1. ` 〜 `29. ` の連番
- [ ] `exam_tips: string[]` 10件、非空
- [ ] `summary: string` 非空
- [ ] カテゴリキーは `'service-management'`（ハイフン含むため文字列リテラル）
- [ ] `categories.ts` の `id: 'service-management', name: 'サービスマネジメント'` と整合

### Step 3a: インデント整合性 ★必須
`docs/note_markup_rules.md` §5 / §5.5b に従い:
- [ ] 包含関係に **全角スペース `　`** 付与（最大2階層）
- [ ] 「親見出し:」直後の列挙にインデント1
- [ ] **子レベル `:` の直下の列挙は孫レベル（全角2スペース）に落としている**

特に確認すべきセクション:
- §3 ISO/IEC 20000 Part 群、§4 サービス戦略主要プロセス、§5 サービス設計 4P/プロセス、§6 サービス移行プロセス、§7 サービス運用プロセス/機能、§8 CSI 7ステップ、§10 SVC 6活動、§11 4側面、§12 ガイディング原則 7、§13 SLA/OLA/UC 階層、§14 SLA 主要項目、§15 SLM 活動、§16 インシデント vs 問題、§17 変更管理3類型、§18 CI 例、§19 リリース3類型、§20 キャパシティ/可用性プロセス、§21 ITSCM、§22 引継ぎ項目、§23 監査種類、§24 監査3独立性/4段階、§25-27 法令、§28-29 頻出/ひっかけ

### Step 3b: 構造化トークン整合性
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 6779; $i -lt 7420; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```
期待結果: **奇数行 0 件**。Claude は既に1次置換 123行 + 手動修正 4行で奇数行ゼロを達成。

- [ ] 全角イコール `＝` が含まれない（exam_tips 含む）
- [ ] `===` / `___` 等の連続記号なし
- [ ] **`navyItems` token text 内に `==X==` / `__X__` がない**

### Step 4: 誤字脱字・表記揺れ

**service-management 固有**:
- 「ITIL」「ITIL v3」「ITIL v4」「ITIL 4」（表記）
- 「ISO/IEC 20000」「ISO/IEC 27001」「JIS Q 20000」（規格番号）
- 「サービスマネジメント」（「サービス・マネジメント」中黒混在なし）
- 「SLA」「OLA」「UC」「SLM」「SLR」（略語）
- 「インシデント管理」「問題管理」「変更管理」「構成管理」「リリース管理」（プロセス名）
- 「CMDB」「KEDB」「DML」（DB 略語）
- 「MTTR」「MTBF」「RPO」「RTO」「RLO」（指標略語）
- 「CSI」「SVS」「SVC」「CAB」「ECAB」「PIR」（ITIL 略語）
- 「CSF」「KPI」「CISO」「DPO」「NISC」（関連略語）
- 法令名: 「個人情報保護法」「サイバーセキュリティ基本法」「不正アクセス禁止法」「不正競争防止法」「著作権法」「GDPR」
- 「サービスバリューシステム」「サービスバリューチェーン」（ITIL 4 用語）
- 「ガイディング原則」「4側面」（ITIL 4）

### Step 5: 既存カテゴリへの相互参照確認
- [ ] §17 で「PMBOK 統合変更管理（integration §13）と別物」言及
- [ ] §18 で「PMBOK 構成管理（integration §18）と類似だが運用フェーズ」言及
- [ ] §19 で「DevOps（development-approach §30）と密接」言及
- [ ] §22 で「PMBOK プロジェクト終結（integration §21）と接点」言及
- [ ] §27 で「project-work §23 / §25 参照」言及

### Step 6: コードレベル整合性
- [ ] `NOTE_DB` の export 維持
- [ ] 既存11カテゴリへの意図しない変更なし
- [ ] `NOTE_CATEGORY_IDS` 変更なし

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data    # 「投入済カテゴリ: 12件」(★F2-P1 全件投入完了)
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_service-management_codex_review.md` を新規作成。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・全角イコール・マークアップ/インデント不整合は同セッション内で修正可
- 修正範囲は `NOTE_DB['service-management']` 内のみ
- **コンテンツの中身に対する変更は禁止**

## 4. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_service-management_codex_review.md` 作成
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 12件）
- [ ] `npm run build` PASS
- [ ] サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれか明示
- [ ] マークアップ・インデント検査結果が明示

## 5. 注意事項・禁止事項
- ❌ 既存11カテゴリへの修正は禁止
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止
- ❌ 並行作業中の F2-P3 R3 OCR / F2-figures 追加候補との干渉禁止

## 6. 完了後の git 操作
```bash
git add tasks/reviews/F2-P1_service-management_codex_review.md
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P1 service-management Codex review: <PASS or fixes>"
git push origin main
```

## 7. Claude が確認済の事項
- 検証スクリプト pass（12件のカテゴリ、★F2-P1 ノート全件投入完了）
- typecheck/build pass
- service-management 29 セクション
- マークアップ `__` `==` 奇数行: 0件（範囲 L6779-7420）
- 正規表現置換: 1次 123行 + 2次 0回 + 手動 4行で奇数行ゼロを達成
- 相互参照: §17 → integration §13、§18 → integration §18、§19 → development-approach §30、§22 → integration §21、§27 → project-work §23/§25
- 既出 R6 秋期 問18（ISO/IEC 20000）が本カテゴリで詳細扱い

## 8. F2-P1 全体完了マイルストーン
本レビュー完了で **F2-P1 ノート全12カテゴリの Codex レビュー完了**。
- F2-P0 stakeholder ✅
- F2-P1: team ✅ / development-approach ✅ / planning ✅ / project-work ✅ / delivery ✅ / measurement ✅ / uncertainty ✅ / integration ✅ / governance ✅ / tailoring-models ✅ / **service-management ← 本タスク**

ユーザレビューを残すのみとなり、F2 全体は F2-P2/P3/P4/P5/P6/P7 のフェーズへ進める。
