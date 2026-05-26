# 応用情報リフレッシュモード Claude レビュー記録

> 実施: Claude（2026-05-26）
> 対象 commit: `1f051a2` (追加) + `85ad99f` (拡充) + `1358d1d` (強調表示) — Codex 担当
> 対象ファイル:
> - `src/data/appliedRefresh.ts`（813 行）
> - `src/pages/AppliedRefresh.tsx`（753 行）
> - `src/App.tsx`（ルート追加）
> - `src/pages/Home.tsx`（メニュー導線追加）

## 結論

**追加修正なし**。Codex 投入分は要件・UX・データ品質・スコープ整合の全観点で良好。Home 導線も適切。`[Review]` commit は不要。

## 機能要件レビュー（F2 計画外の追加機能として）

### スコープ妥当性
- 「PM 学習に入る前の助走モード」として PM 本編とは独立した位置付け
- 応用情報レベルの前提知識を 5 日で復習するロードマップ提示
- 試験範囲は応用情報の **PM 試験に効く 8 領域**（要件定義 / PM 基礎 / 開発プロセス / 品質テスト / セキュリティリスク / データネットワーク / サービス運用 / 業務契約）に絞り込み
- スコープ判断は妥当。`memory/project_scope.md`（PM 試験対策専念）と矛盾しない補助機能

### 4 画面構成
| 画面 | 役割 |
|---|---|
| `diagnostic` | 8 問の初回診断（各トピック 1 問） → 弱点トピックを自動抽出 |
| `refresh` | 弱点別リフレッシュ（8 テーマ × 7〜9 分 / 深掘りノート + シナリオ + ミニ演習 + フラッシュカード + 確認問題） |
| `quiz` | 確認テスト 10 問（各 topic.check + 統合問題 2 問） |
| `roadmap` | 5 日ロードマップ + 推奨復習トピックの直接ジャンプ |

UX フロー（diagnostic → 推奨復習 → refresh → quiz → PM 本編）が自然。

## データ品質レビュー（自動検証）

### 整合性（errors=0）
- 8 トピック × 8 詳細（lessonBlocks + scenario + traps + miniDrill）が完全対応
- 診断 8 問の `topicId` は全て有効トピックを指す
- 各問の `choices.length === 4`、`answerIndex` 範囲内
- 総まとめ 10 問 = 各トピックの check（8）+ 追加統合問題（2: project-basics / requirements）

### トピック構成の均衡（warnings=0）
全 8 トピックが以下の均衡構造で揃っており、UI でも見栄えが安定:
- `minutes`: 7〜9 分（バラつき小）
- `keyPoints`: 3 つ
- `pmBridge`: 2 つ
- `flashcards`: 2 枚
- `lessonBlocks`: 3 ブロック
- `traps`: 3 つ

### 診断問題のトピックカバレッジ
全 8 トピック × 1 問ずつ → **弱点抽出ロジック（誤答 → topicId）が全トピックで効く**。

## UI / UX レビュー

### Home 導線
- メニュー 6 → 7 項目化、位置は「アプリの使い方」の次（2 番目）
- カラー：エメラルド（PM 本編の brand/teal/indigo/purple/pink/sky と被らず識別性 OK）
- アイコン：`IconSeed`（若葉）で「助走モード」感が伝わる
- 説明文：「PM学習前の基礎復習」で立ち位置が明確

### ハイライト機能（RichText）
4 グループの色分けでフレーズを強調:
- emerald: PM 試験／PM 本編／午後Ⅰ／午前Ⅱ／PM
- indigo: 専門用語（WBS / EVM / RTO / RPO / SLA / 認証 / 認可 / ...）
- rose: 警戒語（確認不足 / 合意不足 / 漏れ / 遅延 / 不具合 / 障害 / ...）
- amber: 行動語（最初 / まず / 確認 / 合意 / 分析 / 承認 / ...）

長語優先の `sort` 適用で「影響分析」が「分析」より先にマッチする実装。過剰ハイライトの傾向はあるが「リフレッシュ」目的としては許容範囲。

### 状態管理
- LocalStorage キー `pmap:appliedRefresh:v1` で**他データと完全分離**
- `diagnosticAnswers` / `finalAnswers` / `topicCheckAnswers` / `completedTopicIds` を独立管理
- リセット機能あり
- `topic.check.id` と `appliedRefreshFinalQuestions` の id 共有は `topicCheckAnswers` と `finalAnswers` が別 Record のため**競合しない**（仕様どおり）

### アクセシビリティ
- `aria-labelledby` / `aria-label` を主要セクションに付与
- `details/summary` でフラッシュカード・ミニ演習の解答開閉
- ボタンに `type="button"` 明示

## ノート規約整合性

- PM 本編のノート規約（`==X==` 赤太字 / `__X__` ネイビー太字）は**意図的に流用していない**
- 応用情報リフレッシュは PM 本編とは別系統の独自スタイル（4 色ハイライト + bg-* tinted span）
- PM 本編との視覚的混同を避ける設計として妥当。スコープが独立しているため規約の二重適用は不要

## 検証結果

- `npm run build` PASS
- `npm run validate-data` PASS（既存データに影響なし、本機能は独立データ）
- データ整合性スクリプト（一時）: Errors 0 / Warnings 0

## 申し送り

特筆事項なし。応用情報リフレッシュは**本レビューで完了とする**。

ただし次の点は将来検討の余地あり（今回は対応不要）:
- 確認テスト 10 問の出題順固定（ランダム化はなし）
- フラッシュカードは details/summary 開閉のみ（並べ替え・暗記モード等は無）
- パイロット試用後のフィードバック反映用に v1 → v2 の拡張余地あり
