# Codex 作業指示書: F2-P2 service-management クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 service-management カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_tailoring-models_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 service-management Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_service-management.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/service-management.ts`（50問）の構造レビューを実施。**これで F2-P2 全 12 カテゴリ × 50問 = 600問の最後のレビュー**。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB['service-management']（6780〜7413行）
- 対象commit: 本セッションの `[C] F2-P2 service-management ...` commit

## 3. 入力ファイル
- `src/data/questions/service-management.ts`（50問・新規）
- `src/data/questions/index.ts`（serviceManagementQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_service-management_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/service-management.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-sm-001〜050 連続，重複なし）
- [ ] 全 id `^pm-sm-\d{3}$`
- [ ] 全 `topicId === 'service-management'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし（特に SLA/OLA/UC，RPO/RTO，MTBF/MTTR，CMDB/KEDB/DML の混同問題）
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-sm-005, 011, 012, 013, 014, 015, 017, 025, 037, 038, 047`

### Step 7: 誤字脱字・表記揺れ
service-management 特有の表記統一チェック:
- [ ] ITIL 略語表記: SVS / SVC / CSI / SLA / OLA / UC / SLM / KEDB / CMDB / DML / DPMO
- [ ] ITIL v3 ライフサイクル: 「サービス戦略・サービス設計・サービス移行・サービス運用・継続的サービス改善」表記
- [ ] ITIL 4 用語: 「サービスバリューシステム」「サービスバリューチェーン」「4側面」「ガイディング原則」
- [ ] ISO/IEC 20000-1 / JIS Q 20000-1 / ISO/IEC 27001 表記
- [ ] RPO / RTO / MTBF / MTTR 略語表記
- [ ] 「インシデント管理」「問題管理」「変更管理」「リリース管理」「構成管理」表記統一
- [ ] 「個人情報保護法」「サイバーセキュリティ基本法」「不正アクセス禁止法」「不正競争防止法」「著作権法」表記
- [ ] GDPR / CCPA / PIPL 表記
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] ITIL v3 ライフサイクル 5フェーズ（pm-sm-006〜010）
- [ ] ITIL 4 SVS / SVC / 4側面 / 7ガイディング原則（pm-sm-012〜015）
- [ ] SLA / OLA / UC の階層関係（pm-sm-016〜019）
- [ ] インシデント管理（早期復旧）vs 問題管理（根本原因究明）（pm-sm-023〜025）
- [ ] KEDB / CMDB / DML の用途の違い（pm-sm-027, 030, 033）
- [ ] 変更管理 3 分類: 標準/通常/緊急（pm-sm-029）
- [ ] 可用性 = MTBF / (MTBF + MTTR) 計算（pm-sm-036: 100/(100+1)≒99.0%）
- [ ] RPO（データ損失）vs RTO（停止時間）（pm-sm-038）
- [ ] システム監査 4ステップ: 計画/予備調査/本調査/監査報告（pm-sm-045）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_service-management_codex_review.md` を作成。
**これで F2-P2 全12カテゴリ × 50問 = 600問の最後の Codex レビュー完了報告**となるため，全体総括のコメントを末尾に追記することを推奨。

### Step 11（任意）: 軽微な修正
- 誤字・表記揺れ・型外しの修正可
- コンテンツの妥当性判断はユーザ担当

## 6. 完了条件
- [ ] レビュー記録，🟢/🟡/🔴 明示
- [ ] `npm run validate-data` OK
- [ ] `npm run build` OK

## 7. 注意事項・禁止事項
- ❌ 指示書外のファイル編集禁止
- ❌ コンテンツの正確性判断は禁止

## 8. 完了後のgit操作
```bash
git add tasks/reviews/F2-P2_service-management_codex_review.md
# 修正があれば: git add src/data/questions/service-management.ts
git commit -m "[X] F2-P2 service-management Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-sm-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§27 をカバー（§28-29 過去問頻出・ひっかけは F2-P3 と重複のため除外）
- 可用性計算問題（pm-sm-036）は数値検算済み: 100 / (100 + 1) = 0.9901 ≒ 99.0%
