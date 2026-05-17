# Codex 作業指示書: F2-P1 delivery + measurement 統合レビュー

> 作成: Claude（2026-05-17）
> 対象タスク: F2-P1 第6・7カテゴリ（delivery + measurement）の Codex レビュー
> 想定所要時間: 3〜4h

## 0. 共通ルール
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 完了後に必ず `git add → commit → push` する
- コミットプリフィックス: `[X] F2-P1 delivery+measurement Codex review: <PASS or fixes>`
- 不明点は `tasks/questions/F2-P1_delivery-measurement.md` に記録（自己判断禁止）

## 1. 作業概要
2カテゴリを **一括レビュー**。観点は **構造化トークン整合性・インデント整合性・誤字脱字・コードレベルの整合性** に限定。コンテンツ妥当性はユーザ最終確認。

| カテゴリ | セクション数 | 範囲（line） |
|---|---:|---|
| delivery | 29 | 約 3050-3580 |
| measurement | 24 | 約 3580-4090 |

## 2. 前提
- `detailed_design.md` v0.20 §2.7e
- `docs/note_markup_rules.md` v1.0（**§3.6 navyItems token text 内マークアップ禁止**を特に注意）
- `tasks/F2-P1_delivery_outline.md` / `tasks/F2-P1_measurement_outline.md`
- 先行カテゴリのレビュー記録（特に F2-P1 planning+project-work）

## 3. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data    # 「投入済カテゴリ: 7件」を確認
npm run build
```

### Step 2: 型整合性・セクション数チェック
| カテゴリ | 確認 |
|---|---|
| delivery | 29 sections, summary 非空, exam_tips 10件, 連番 1〜29 |
| measurement | 24 sections, summary 非空, exam_tips 10件, 連番 1〜24 |

### Step 3a: インデント整合性 ★必須
`docs/note_markup_rules.md` §5 に従い:
- [ ] 包含関係に **全角スペース `　`** 付与（最大2階層）
- [ ] 「親見出し:」直後の列挙にインデント1
- [ ] 半角スペース・タブ混入なし

**特に確認すべきセクション**:
- delivery §3 品質哲学の系譜、§7-9 品質3プロセスの ITTO、§10 計画書構成、§12 品質コスト2大カテゴリ、§13 7QC、§14 新7QC、§15 PDCA+デミング、§16 DMAIC、§17 統計、§18 ISO 7原則、§19 CMMI レベル、§21-23 アジャイル品質、§28-29 頻出/ひっかけ
- measurement §2 メトリクス分類、§4-8 EVM 全式、§11 バーンダウン2種、§12 リーン3指標、§13 ベロシティ、§17 BSC 4視点、§18 OKR、§23-24 頻出/ひっかけ

### Step 3b: 構造化トークン整合性
```powershell
$content = Get-Content src/pages/NoteDetail.tsx -Encoding UTF8
for ($i = 3050; $i -lt 4090; $i++) {
  $line = $content[$i]
  $us = ([regex]::Matches($line, '__')).Count
  $eq = ([regex]::Matches($line, '==')).Count
  if (($us -gt 0 -and $us % 2 -ne 0) -or ($eq -gt 0 -and $eq % 2 -ne 0)) {
    "L$($i+1): __[$us] ==[$eq]"
  }
}
```
期待結果: **奇数行 0 件**。Claude は既に正規表現置換で 204+3=207 件修正済。

- [ ] 全角イコール `＝` が含まれない
- [ ] `===` / `___` 等の連続記号なし
- [ ] **`navyItems` token text 内に `==X==` / `__X__` がない**（F2-P0 教訓 §3.6）

### Step 4: 誤字脱字・表記揺れ

**共通**:
- PMBOK 版表記: 「PMBOK第6版」/「PMBOK第7版」

**delivery 固有**:
- 「品質マネジメント」/「品質管理」の使い分け（PMBOK は「マネジメント」）
- 「ヒストグラム」/「パレート図」/「特性要因図」/「散布図」/「管理図」/「チェックシート」/「層別」（7QC道具）
- 「親和図」/「連関図」/「系統図」/「マトリクス図」/「PDPC」/「アローダイアグラム」/「マトリクスデータ解析」（新7QC道具）
- 「DMAIC」/「DMADV」/「PDCA」/「PDSA」
- 「ISO 9001:2015」/「JIS Q 9001:2015」
- 「DoD」「TDD」「BDD」「UAT」「CSAT」「NPS」（略語の表記統一）

**measurement 固有**:
- EVM 略語: PV / EV / AC / BAC / CV / SV / CPI / SPI / EAC / ETC / VAC / TCPI / ES
- 「アーンドバリュー」/「アーンドスケジュール」/「バーンダウン」/「バーンアップ」
- 「リードタイム」/「サイクルタイム」/「スループット」/「ベロシティ」
- 「BSC」/「OKR」/「KPI」/「KRI」
- 「リトルの法則」（「リトル」/「リトル氏の」表記揺れなし）

### Step 5: PMBOK 第6版／第7版 統合確認
- [ ] delivery §3, §29 で PMBOK6/7 対応関係が明示
- [ ] measurement §1, §24 で PMBOK6/7 対応関係が明示
- [ ] navyItems の出典記述が PMBOK6（章番号付き）または PMBOK7（領域名）を明示
- [ ] 既存5カテゴリへの相互参照が正確（例: delivery §22 → development-approach §30, measurement §11 → development-approach §22, measurement §19 → planning §24）

### Step 6: コードレベル整合性
- [ ] `NOTE_DB` の export 維持
- [ ] 既存5カテゴリへの意図しない変更なし
- [ ] `categories.ts` の delivery（`name: 'デリバリー'`）/ measurement（`name: '測定'`）と整合

### Step 7: 検証スクリプト・ビルド再実行
```bash
npm run validate-data    # 「投入済カテゴリ: 7件」
npm run build
```

### Step 8: レビュー記録の作成
`tasks/reviews/F2-P1_delivery_and_measurement_codex_review.md` を新規作成（F2-P1 team / F2-P1 planning+project-work と同テンプレ）。

### Step 9（任意）: 軽微な修正
- 誤字・表記揺れ・全角イコール・マークアップ/インデント不整合は同セッション内で修正可
- 修正範囲は `NOTE_DB.delivery` / `NOTE_DB.measurement` 内のみ
- **コンテンツの中身（品質理論・EVM計算式・BSC視点等）に対する変更は禁止**

## 4. 完了条件（DoD）
- [ ] `tasks/reviews/F2-P1_delivery_and_measurement_codex_review.md` 作成
- [ ] `npm run validate-data` PASS（投入済カテゴリ: 7件）
- [ ] `npm run build` PASS
- [ ] サマリーが 🟢 PASS / 🟡 PASS with fixes / 🔴 RESTART のいずれか明示
- [ ] マークアップ・インデント検査結果が明示

## 5. 注意事項・禁止事項
- ❌ 既存5カテゴリへの修正は禁止
- ❌ `npm install` で新規パッケージを追加しない
- ❌ `git push --force` 禁止
- ❌ コンテンツの正確性・妥当性に対する判断・修正は禁止
- ❌ 並行作業中の F2-figures（NoteSection.figures フィールド追加）への干渉禁止
  - F2-figures は別タスクで Codex が figures フィールドを追加する。delivery/measurement の items/navyItems への変更は本タスクの範囲外

## 6. 完了後の git 操作
```bash
git add tasks/reviews/F2-P1_delivery_and_measurement_codex_review.md
git add src/pages/NoteDetail.tsx   # 修正があれば
git commit -m "[X] F2-P1 delivery+measurement Codex review: <PASS or fixes>"
git push origin main
```

## 7. Claude が確認済の事項
- 検証スクリプト pass（7件のカテゴリ）
- typecheck/build pass
- delivery 29 セクション / measurement 24 セクション
- マークアップ `__` `==` 奇数行: 0件（範囲 L3050-4090）
- 正規表現置換: 1次 204行 + 2次 3回 = 207回の自動修正で奇数行ゼロを達成
- 相互参照: delivery §22 → dev-approach §30 / measurement §11 → dev-approach §22 / measurement §19 → planning §24 / measurement §20 → project-work §18 / delivery §6 → planning §6 / delivery §15-17 共通: シックスシグマ・統計
