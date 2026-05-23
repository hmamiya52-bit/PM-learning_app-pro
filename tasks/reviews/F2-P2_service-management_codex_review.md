# レビュー: F2-P2 service-management クイズ50問 構造レビュー

> レビュー日時: 2026-05-23
> レビュー対象commit: e57742f
> レビューア: Codex

## 結果サマリー
- 🟡 PASS with fixes: `src/data/questions/service-management.ts` の50問は、採番・型・選択肢・難易度分布・`excludeFromWritten` 設計・主要表記・ノート照合の観点で致命問題なし。
- 追加修正として、`pm-sm-045` の `{{blank}}` 前スペース1件を削除済み。
- これで F2-P2 の全12カテゴリ、計600問の Codex 構造レビューが完了。

## 観点別評価

### 仕様適合
- 完了条件: ○ `tasks/reviews/F2-P2_service-management_codex_review.md` を作成し、`npm run validate-data` / `npm run build` は成功。
- 範囲遵守: ○ 修正は `src/data/questions/service-management.ts` と本レビュー記録のみ。
- 対象カテゴリ: ○ `topicId` は全件 `service-management`。
- import / spread: ○ `src/data/questions/index.ts` で `serviceManagementQuestions` の import と展開を確認。
- カテゴリ定義: ○ `src/data/categories.ts` の `id: 'service-management'`, `name: 'サービスマネジメント'` と一致。

### 件数・採番
- 設問数: ○ 50件。
- id範囲: ○ `pm-sm-001` 〜 `pm-sm-050`。
- id連番: ○ 欠番・重複なし。
- idパターン: ○ 全件 `^pm-sm-\d{3}$` に準拠。

### 型・選択肢
- `questionText`: ○ 全件 `{{blank}}` が1個。
- `correctAnswer`: ○ 全件非空。
- `choices`: ○ 全件4択。
- 正解含有: ○ 全件 `choices` に `correctAnswer` を含む。
- 重複選択肢: ○ 全件なし。
- 空文字選択肢: ○ 全件なし。
- `explanation`: ○ 全件非空。
- `difficulty`: ○ 全件 `1 | 2 | 3`。
- `excludeFromWritten`: ○ 省略または boolean。
- プレースホルダ: ○ `TODO` / `TBD` / `FIXME` の混入なし。
- 誤答品質: ○ SLA/OLA/UC、RPO/RTO、MTBF/MTTR、CMDB/KEDB/DML の混同を誘う選択肢はあるが、正答と誤答の役割は構造上区別されている。

### 難易度分布
- difficulty 1: ○ 14問。
- difficulty 2: ○ 26問。
- difficulty 3: ○ 10問。
- 設計目標: ○ 14 / 26 / 10 と一致。

### excludeFromWritten
- 件数: ○ 11件。
- 対象id: ○ `pm-sm-005, pm-sm-011, pm-sm-012, pm-sm-013, pm-sm-014, pm-sm-015, pm-sm-017, pm-sm-025, pm-sm-037, pm-sm-038, pm-sm-047`。
- 設計との差分: ○ なし。

### 表記揺れ・誤字脱字
- `{{blank}}` 前後スペース: ○ 修正後は混入なし。
- ITIL 略語: ○ `SVS` / `SVC` / `CSI` / `SLA` / `OLA` / `UC` / `SLM` / `KEDB` / `CMDB` / `DML` を確認。`DPMO` は対象設問内では未使用。
- ITIL v3: ○ `サービス戦略` / `サービス設計` / `サービス移行` / `サービス運用` / `継続的サービス改善` を確認。
- ITIL 4: ○ `サービスバリューシステム` / `サービスバリューチェーン` / `4側面` / `ガイディング原則` を確認。
- 規格表記: ○ `ISO/IEC 20000-1` / `JIS Q 20000-1` / `ISO/IEC 27001` を確認。
- 運用指標: ○ `RPO` / `RTO` / `MTBF` / `MTTR` を確認。
- 管理プロセス: ○ `インシデント管理` / `問題管理` / `変更管理` / `リリース管理` / `構成管理` を確認。
- 法令表記: ○ `個人情報保護法` / `サイバーセキュリティ基本法` / `不正アクセス禁止法` / `不正競争防止法` / `著作権法` を確認。
- 海外法令略語: ○ `GDPR` / `CCPA` / `PIPL` を確認。

### ノート整合性
- pm-sm-006 〜 010: ○ ITIL v3 ライフサイクル 5フェーズは NoteDetail §4〜§8 と整合。
- pm-sm-012 〜 015: ○ ITIL 4 SVS / SVC / 4側面 / 7ガイディング原則は NoteDetail §9〜§12 と整合。
- pm-sm-016 〜 019: ○ SLA / OLA / UC の階層関係は NoteDetail §13〜§15 と整合。
- pm-sm-023 〜 025: ○ インシデント管理と問題管理の目的差は NoteDetail §16 と整合。
- pm-sm-027 / 030 / 033: ○ KEDB / CMDB / DML の用途の違いは NoteDetail §16 / §18 / §19 と整合。
- pm-sm-029: ○ 変更管理の標準/通常/緊急分類は NoteDetail §17 と整合。
- pm-sm-036: ○ 可用性 `100/(100+1)=99.0099%`、正答 `約 99.0%` と整合。
- pm-sm-038: ○ RPO（データ損失）と RTO（停止時間）の違いは NoteDetail §21 と整合。
- pm-sm-045: ○ システム監査の計画/予備調査/本調査/監査報告は NoteDetail §24 と整合。

### 動作確認
- git pull: ○ `Already up to date.`。
- npm install: ○ `up to date`、脆弱性 0。
- npm run validate-data: ○ `[OK] 全データの整合性確認完了`。
- npm run build: ○ 成功。Vite の chunk size warning のみ。
- npm run dev: - 静的構造レビューのため未実行。
- 画面表示: - 指示書DoD対象外のため未実行。

## 指摘事項

### 致命（修正必須）
- なし。

### 軽微（修正済み）
- `pm-sm-045`: `{{blank}}` 前のスペースを削除。

## Codexによる追加修正
- `src/data/questions/service-management.ts` の1箇所を、指示書のプレースホルダ規約に合わせて修正。

## F2-P2 総括
- `stakeholder` から `service-management` まで、全12カテゴリ × 50問 = 600問の Codex 構造レビューを完了。
- 今回の service-management で、F2-P2 レビューフェーズは Codex 側の担当分として完了扱い。
