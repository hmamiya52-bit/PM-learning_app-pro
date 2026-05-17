# Codex 作業指示書: F2-P1 governance + tailoring-models 統合レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1 第10・11カテゴリ（governance + tailoring-models）の Codex レビュー
> 想定所要時間: 3〜4h

## 0. 共通ルール
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P1 governance+tailoring-models Codex review: <PASS or fixes>`
- 不明点は `tasks/questions/F2-P1_governance-tm.md` に記録（自己判断禁止）

## 1. 作業概要
2カテゴリを **一括レビュー**。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定。コンテンツ妥当性はユーザ最終確認。

| カテゴリ | セクション数 | 範囲（line） |
|---|---:|---|
| governance | 22 | 約 5844-6300 |
| tailoring-models | 22 | 約 6301-6780 |

## 2. 前提
- `detailed_design.md` v0.21 §2.7e
- `docs/note_markup_rules.md` v1.0（**§3.6 navyItems token text 内マークアップ禁止**、**§3.3b 赤字直後の `=` 禁止**、**§5.5b 子レベル `:` 直下は孫レベル**を特に注意）
- `tasks/F2-P1_governance_outline.md` / `tasks/F2-P1_tailoring-models_outline.md`
- 先行カテゴリのレビュー記録（F2-P1 uncertainty+integration）

## 3. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data    # 「投入済カテゴリ: 11件」を確認
npm run build
```

### Step 2: 型整合性・セクション数チェック
| カテゴリ | 確認 |
|---|---|
| governance | 22 sections, summary 非空, exam_tips 10件, 連番 1〜22 |
| tailoring-models | 22 sections, summary 非空, exam_tips 10件, 連番 1〜22 |
| 共通 | カテゴリキーは `governance` / `'tailoring-models'`（ハイフン含むため文字列リテラル） |

### Step 3a: インデント整合性 ★必須
`docs/note_markup_rules.md` §5 / §5.5b に従い:
- [ ] 包含関係に **全角スペース `　`** 付与（最大2階層）
- [ ] 「親見出し:」直後の列挙にインデント1
- [ ] **子レベル `:` の直下の列挙は孫レベル（全角2スペース）に落としている**
- [ ] 半角スペース・タブ混入なし

特に確認すべきセクション:
- governance §1 ガバナンス特徴、§2 フレームワーク要素、§3 PMBOK7 関連原則、§4 3階層、§5 OPM3、§6 戦略整合、§8 PMO 3類型詳細、§11 ステアリングコミッティ役割/構成、§13 意思決定階層、§14 COBIT、§15 JIS Q 38500 6原則/3タスク、§17 PMI倫理 4価値観、§19 監査種類、§20-21 頻出/ひっかけ
- tailoring-models §1 対象、§2 判断要素、§3 4ステップ、§4 5ステップ、§6 状況対応モデル群、§7 プロセスモデル群、§8 ADKAR/コッター8段階、§9 Cynefin/Stacey、§11 データ手法群、§12 見積もり手法、§13 会議・対人手法、§14 曖昧さ管理、§16-18 文書群、§19-20 ハイブリッド、§21-22 頻出/ひっかけ

### Step 3b: 構造化トークン整合性
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 5843; $i -lt 6780; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```
期待結果: **奇数行 0 件**。Claude は既に1次置換 163行 + 手動修正 3行で奇数行ゼロを達成。

- [ ] 全角イコール `＝` が含まれない（exam_tips 含む）
- [ ] `===` / `___` 等の連続記号なし（赤字直後の `=` で誘発しやすい）
- [ ] **`navyItems` token text 内に `==X==` / `__X__` がない**

### Step 4: 誤字脱字・表記揺れ

**governance 固有**:
- PMI 階層: 「ポートフォリオ」「プログラム」「プロジェクト」
- PMO 類型: 「支援型」「コントロール型」「指揮型」
- 標準名: 「COBIT」「JIS Q 38500」「ISO/IEC 27001」「ISO/IEC 20000」「ISO 9001」「ISO 31000」「ISO 21500」
- 「ステアリングコミッティ」（「ステアリング・コミッティ」中黒混在に注意）
- 「フェーズゲート」（「ステージゲート」「Stage Gate」併記は許容）
- 「OPM3」「PMMM」「P3M3」（成熟度モデル略語）
- 「ガバナンス」/「ガバナンスボディ」/「ガバナンス・フレームワーク」

**tailoring-models 固有**:
- 「テーラリング」（「テイラリング」混入なし）
- 「Cynefin」（「シネフィン」併記は許容）
- 「Stacey」マトリクス
- 改善モデル: 「PDCA」「DMAIC」「DMADV」「PDSA」「OODA」
- 変革モデル: 「ADKAR」「コッターの8段階」「Bridges Transition Model」
- 見積もり: 「類推見積もり」「パラメトリック見積もり」「ボトムアップ見積もり」「3点見積もり」「PERT」
- 「MVP」「プロトタイピング」「スパイク」（曖昧さ管理）
- 「ローリングウェーブ計画」（「ローリングウェーヴ」混入なし）

### Step 5: PMBOK 第6版／第7版 統合確認
- [ ] governance §3 で PMBOK7 12原則「スチュワードシップ」「価値」「リーダーシップ」が言及
- [ ] tailoring-models §3 で PMBOK7「テーラリング」12原則化、第6版との違い（付録 X1 + 章末）が明示
- [ ] 既存9カテゴリへの相互参照が正確（例: governance §22 で他カテゴリ参照／tailoring-models §6/§7/§9/§12 で他カテゴリ参照）

### Step 6: コードレベル整合性
- [ ] `NOTE_DB` の export 維持
- [ ] 既存9カテゴリへの意図しない変更なし
- [ ] `categories.ts` の governance（`name: 'ガバナンス・組織論'`）/ tailoring-models（`name: 'テーラリング・モデル'`）と整合

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data    # 「投入済カテゴリ: 11件」
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_governance_and_tailoring-models_codex_review.md` を新規作成。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・全角イコール・マークアップ/インデント不整合は同セッション内で修正可
- 修正範囲は `NOTE_DB.governance` / `NOTE_DB['tailoring-models']` 内のみ
- **コンテンツの中身に対する変更は禁止**

## 4. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_governance_and_tailoring-models_codex_review.md` 作成
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 11件）
- [ ] `npm run build` PASS
- [ ] サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれか明示
- [ ] マークアップ・インデント検査結果が明示

## 5. 注意事項・禁止事項
- ❌ 既存9カテゴリへの修正は禁止
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止
- ❌ 並行作業中の F2-P3 R3 OCR / F2-figures 追加候補との干渉禁止

## 6. 完了後の git 操作
```bash
git add tasks/reviews/F2-P1_governance_and_tailoring-models_codex_review.md
git add src/pages/NoteDetail.tsx
git commit -m "[X] F2-P1 governance+tailoring-models Codex review: <PASS or fixes>"
git push origin main
```

## 7. Claude が確認済の事項
- 検証スクリプト pass（11件のカテゴリ）
- typecheck/build pass
- governance 22 セクション / tailoring-models 22 セクション
- マークアップ `__` `==` 奇数行: 0件（範囲 L5843-6780）
- 正規表現置換: 1次 163行 + 2次 0回 + 手動 3行で奇数行ゼロを達成
- 相互参照多数: governance ↔ team/stakeholder/integration/project-work/service-management、tailoring-models ↔ team/stakeholder/development-approach/planning/uncertainty/delivery/measurement
- PMBOK第7版 12原則「スチュワードシップ」「テーラリング」を governance/tailoring-models で詳細扱い
