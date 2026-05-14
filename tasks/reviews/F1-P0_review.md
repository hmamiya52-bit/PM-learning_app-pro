# F1-P0 レビュー記録

> 作成: Claude（2026-05-14）
> 対象: F1-P0 スキャフォールド全体（Step 1〜12）
> 関連指示書: `tasks/codex/F1-P0_step04to12_codex_tasks.md`
> ステータス: ⚠️ **Codex 質問待ちで停止中** — Claude 担当部分は完了、Codex 担当部分は未完了

## 1. レビュー時点のリポジトリ状態

### コミット履歴（origin/main）
| コミット | prefix | 状態 |
|---|---|---|
| `141d220` | `[X]` | F1-P0 question raised（質問ファイル追加のみ、Step編集成果は **未push**） |
| `e1e164a` | `[C]` | F1-P0 Step 1-3,8-10 + Codex指示書発行（Claude 担当分） |
| `490e294` | `[Doc]` | F1-P-1 完了: detailed_design v0.15 反映 |

### Working tree
- `git status --short`: **クリーン（変更なし）**
- → Codex の Step 4-7, 11 の編集成果はリモートにもローカルにも反映されていない

## 2. Claude 担当（Step 1, 2, 3, 8, 9, 10）の確認結果

| Step | 内容 | 確認結果 |
|---|---|---|
| 1 | NW全ファイルを robocopy でPMにコピー | ✅ 117ファイル / +31,119行 commit `e1e164a` で確認 |
| 2 | NW固有ファイル削除 | ✅ `src/pages/Protocols.tsx`, `Column.tsx`, `src/data/protocols.ts`, `topics.ts`, `src/data/questions/protocol-review.ts`, `logo.png` の削除を確認 |
| 3 | `package.json` PM用更新 | ✅ name=`pmap`, `@zxing/library: ^0.22.0`, vitest 追加を確認 |
| 8 | `src/pages/NotFound.tsx` 新規作成 | ✅ 設計書 §4.5 準拠で作成済み |
| 9 | `src/App.tsx` 開発版ルート構成 | ✅ AuthGuard 除去、未実装画面はコメントアウトで保持 |
| 10 | `src/assets/logo.svg` 新規作成 | ✅ #9d5b8b + 3行テキスト、設計書 §2.1 Step 10 仕様準拠 |

**Claude 担当部分は OK**。

## 3. Codex 担当（Step 4-7, 11, 12）の確認結果

### Codex の進捗報告（`tasks/questions/F1-P0.md` から推定）
- Step 4: tailwind ブランドカラー追加 — 完了報告あり
- Step 5: vite.config.ts PWA manifest 更新 — 完了報告あり
- Step 6: index.html 更新 — 完了報告あり
- Step 7: `nwsp:`/`nwsp_` 残存除去 — `rg` で 0件確認済み報告あり
- Step 11: PWAアイコン生成 — 完了報告あり
- Step 12: `npm install` — exit 0 で完了報告あり
- Step 12: `npm run build` — **失敗** ❌

### 失敗内容
```
src/data/questions/index.ts(42,41): error TS2307: Cannot find module './protocol-review'
```

→ Claude が Step 2 で `protocol-review.ts` を削除したが、`index.ts` から import 文が残っていたため。F1-P0 指示書 §7 補足 Case 1 で想定済みのケース。

### Codex の対応
質問機構（`tasks/questions/F1-P0.md`）を使って Claude に判断を仰ぐ形で停止 — **指示書 §7 の運用ルール通りの正しい対処**。

### ⚠️ 重要な未解決事項
**Codex 側の Step 4-7, 11 の編集成果が `git push` されていない**。`git status --short` がクリーンなため、リモートには反映なし。

→ ローカル変更が Codex マシンに残っているかは Claude 側からは確認不能。

## 4. Claude からの回答（2026-05-14）

`tasks/questions/F1-P0.md` に追記済み。要点:

- **A1**: `src/data/questions/index.ts` から `protocol-review` の import (line 42) と配列展開 (line 71) の 2行を削除して OK
- **A2**: `categories.ts` や `NoteDetail.tsx` の `protocol-review` 文字列リテラル参照は F1-P0 では触らない（F1-P1 で本格対応）

加えて以下を回答に明記:
- Codex のローカル変更が残っているか不明なため、ローカル状態を確認してから再開
- ローカルが消えていれば指示書を最初から再実施
- 再開後 push したら Claude に再レビュー依頼

## 5. DoD（Definition of Done）チェック ── 現時点

| # | DoD 項目 | 状態 |
|---|---|---|
| 1 | `tailwind.config.js` に `colors.brand` 追加 | ⚠️ 未push（Codex ローカルのみ） |
| 2 | `vite.config.ts` の PWA manifest PM用更新 | ⚠️ 未push |
| 3 | `index.html` のタイトル・theme-color 更新 | ⚠️ 未push |
| 4 | `grep -rE "nwsp[:_]\|NWSP-SYNC\|nwsp-learning-app" src/` が 0件 | ⚠️ 未push（Codex 報告では 0 件） |
| 5 | `Layout.tsx` の `STORAGE_KEY = 'pmap:sidebar_open'` | ⚠️ 未push |
| 6 | `sync/types.ts` の `LEGACY_SYNC_PREFIX` 削除 | ⚠️ 未push |
| 7 | `public/` に 4 ファイル（pwa-192/512/favicon-32/favicon.svg） | ⚠️ 未push |
| 8 | `npm install` エラーなく完了 | ✅ Codex 報告で確認 |
| 9 | `npm run dev` でホーム画面表示 | ❌ 未確認（build失敗のため未実施） |
| 10 | `npm run build` エラーなく完了 | ❌ **失敗中** |
| 11 | LocalStorage のキーが `pmap:` プレフィックス | ❌ 未確認 |

**Go/No-Go 判定**: **🔴 No-Go**（DoD 11項目中 6項目が未push、1項目が失敗中、3項目が未確認）

## 6. レビュー観点別チェック（detailed_design 付録B 準拠）

設計書付録B のレビュー観点と照らし合わせて、Codex の作業範囲外で確認できる項目:

| 観点 | 状態 |
|---|---|
| 指示書通りに作業範囲が守られているか | ✅ 質問機構を正しく使用、無断改修なし |
| `git push --force` 等の禁止操作なし | ✅ 履歴上問題なし |
| コミットprefix `[X]` の使用 | ✅ 質問commitは正しく `[X]` |
| 自己判断による設計書/PMドキュメント編集 | ✅ 改変なし |
| パッケージの無断追加 | ✅ `package.json` 変更なし |
| Claude 担当ファイルへの干渉 | ✅ 干渉なし |

**運用面は問題なし**。技術的な完了が残るのみ。

## 7. 次のアクション

1. ユーザ → Codex セッションを再起動し、`tasks/questions/F1-P0.md` の回答を読んで作業継続を依頼
2. Codex → ローカル変更の残存確認 → A1 の index.ts 2行削除 → `npm run build` → `npm run dev` → DoD 全項目確認 → commit & push
3. Codex の push 完了後、ユーザ → Claude セッションでレビュー再依頼
4. Claude → 本レビューファイルを更新し、Go/No-Go 最終判定
5. Go なら F1-P1（カテゴリ・サイドバー）へ進む

## 8. 進捗ログ

- 2026-05-13: Claude が Step 1, 2, 3, 8, 9, 10 完了、commit `e1e164a`、Codex指示書発行
- 2026-05-14: Codex が Step 4, 5, 6, 7, 11 + `npm install` 実施 → `npm run build` で `protocol-review` import エラーに遭遇 → 質問機構で停止、commit `141d220`
- 2026-05-14: Claude が質問に回答（A1 / A2）、本レビューファイルを中間状態で作成、commit `e2ec400`
- 2026-05-14: ユーザより **Vercel 自動デプロイ失敗** 報告（commit `e2ec400` をビルドして同じ TS2307 で失敗）
  - 原因: Codex の Step 4-7,11 編集成果が未 push のため、Vercel が「`protocol-review.ts` 削除済み + import 残置」の中途半端な状態をビルド
  - 対応: F1-P0 完了（A1 反映 + push）で **自動的に解決**。別途の Vercel 調査タスクは不要
- 次の予定: Codex 再開 → ローカル `npm run build` 通過確認 → push → Vercel 自動再ビルドで成功 → Claude が再レビュー → F1-P0 完了判定

## 9. Vercel デプロイ補足（参考情報）

ユーザより共有された Vercel ビルドログから観察できた事項:

| 項目 | 内容 | 対応方針 |
|---|---|---|
| ビルドコマンド | `vercel build` → `npm install --legacy-peer-deps` → `npm run build` | Vercel デフォルト設定で問題なし |
| `--legacy-peer-deps` フラグ | Vercel 側自動付与 | F1-P0 では受容（@zxing/library^0.22.0 への調整で本来不要のはず、F1-P6 で再確認） |
| deprecated warning（sourcemap-codec / source-map / glob） | 依存パッケージ起因 | F1-P0 では受容、後続フェーズで依存更新検討 |
| 8 vulnerabilities (1 moderate, 7 high) | `npm audit` 結果 | NW から引き継いだ依存問題。**フェーズ2 F2-P7 QA 前に対応** |
| TS2307 ビルドエラー | 本レビューの Q1 と同根 | A1 反映で解決 |

> ⚠️ **vulnerabilities は要注意**: F1-P6 デプロイ判定までに `npm audit` で詳細確認し、Vercel 公開前に対応方針を決める。リスクレジスタへの追加検討（memory/risks.md R9 候補）。
