# Codex 作業指示書: F2-P2 governance クイズ50問 構造レビュー

> 作成: Claude（2026-05-19）
> 対象タスク: F2-P2 governance カテゴリの Codex レビューフェーズ
> 想定所要時間: 1.5〜2.5h
> ベース指示書: `tasks/codex/F2-P2_integration_review.md`

## 0. はじめに
- Codex 専用
- 作業開始前に `git pull origin main`，完了後に `git add → commit → push`
- コミット prefix は `[X]`（`[X] F2-P2 governance Codex review: PASS` 等）
- 不明点は `tasks/questions/F2-P2_governance.md` に記録して停止

## 1. 作業概要
Claude が投入した `src/data/questions/governance.ts`（50問）の構造レビューを実施。

## 2. 前提
- 関連: `src/types/index.ts` / `src/data/categories.ts` / `src/pages/NoteDetail.tsx` の NOTE_DB.governance（5844〜6304行）
- 対象commit: 本セッションの `[C] F2-P2 governance ...` commit

## 3. 入力ファイル
- `src/data/questions/governance.ts`（50問・新規）
- `src/data/questions/index.ts`（governanceQuestions の import/spread）

## 4. 出力ファイル
- `tasks/reviews/F2-P2_governance_codex_review.md`（新規・必須）
- 修正があれば: `src/data/questions/governance.ts`

## 5. 作業手順

### Step 1: 環境セットアップ
```bash
git pull origin main
npm install
npm run validate-data
npm run build
```

### Step 2: 件数・採番チェック
- [ ] 50件（pm-gv-001〜050 連続，重複なし）
- [ ] 全 id `^pm-gv-\d{3}$`
- [ ] 全 `topicId === 'governance'`

### Step 3: 型整合性チェック
他カテゴリと同じ Question 型フィールドチェック。

### Step 4: choices 品質チェック
- 誤答3つの相互独立性
- 紛らわしすぎる誤答なし（特に COBIT/ITIL/TOGAF 等のフレームワーク混同）
- 空文字・プレースホルダ混入なし

### Step 5: 難易度分布チェック
- [ ] diff 1 = 14
- [ ] diff 2 = 26
- [ ] diff 3 = 10

### Step 6: 構造的整合性
- [ ] excludeFromWritten 該当 11件:
  `pm-gv-010, 011, 016, 020, 023, 027, 028, 030, 032, 034, 043`

### Step 7: 誤字脱字・表記揺れ
governance 特有の表記統一チェック:
- [ ] 「ガバナンス」「マネジメント」の使い分け
- [ ] 「ステアリングコミッティ」表記統一（中黒の有無）
- [ ] フレームワーク略語: COBIT / ITIL / TOGAF / OPM / OPM3 / PMBOK
- [ ] ISO/JIS 規格表記: `ISO/IEC 27001`，`ISO/IEC 27002`，`JIS Q 38500`，`ISO 9001`，`ISO 14001`，`ISO 20000`
- [ ] 「ポートフォリオ」「プログラム」「プロジェクト」表記統一
- [ ] 「PMO 3類型」: 支援型・管理型・指揮型 の表記
- [ ] 「J-SOX」表記統一
- [ ] PMI 倫理4価値観: 責任・尊重・公正・誠実 の表記
- [ ] `{{blank}}` の前後にスペース不要

### Step 8: ノート整合性チェック
- [ ] ガバナンス vs マネジメント の役割分担（pm-gv-002）
- [ ] スチュワードシップ原則 / 価値原則（pm-gv-005, 006）
- [ ] ポートフォリオ / プログラム / プロジェクト の階層（pm-gv-007〜010）
- [ ] OPM / OPM3（pm-gv-011, 012）
- [ ] PMO 3類型の影響力レベル（pm-gv-016〜019）
- [ ] ステアリングコミッティ vs CCB（pm-gv-022, 023）
- [ ] COBIT 5原則 / JIS Q 38500 6原則の構成（pm-gv-029, 031）
- [ ] PMI 倫理4価値観（pm-gv-034〜038）
- [ ] 内部監査 vs 外部監査（pm-gv-042, 043）
- [ ] 個人情報保護法 / 不正競争防止法 / J-SOX（pm-gv-047〜049）

### Step 9: 検証スクリプト・ビルド
```bash
npm run validate-data
npm run build
```

### Step 10: レビュー記録の作成
`tasks/reviews/F2-P2_governance_codex_review.md` を作成。

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
git add tasks/reviews/F2-P2_governance_codex_review.md
# 修正があれば: git add src/data/questions/governance.ts
git commit -m "[X] F2-P2 governance Codex review: <PASS or PASS with fixes>"
git push origin main
```

## 9. 参考: Claude 確認済事項
- 50問存在（pm-gv-001〜050）
- 難易度分布: diff 1 = 14 / diff 2 = 26 / diff 3 = 10
- excludeFromWritten 付与: 11件
- ノート §1〜§22 をカバー（§20-21 過去問頻出・ひっかけは F2-P3 と重複のため除外）
