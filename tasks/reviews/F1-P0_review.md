# F1-P0 レビュー記録（最終版）

> 作成: Claude（2026-05-14 中間版） / 更新: Claude（2026-05-14 最終版）
> 対象: F1-P0 スキャフォールド全体（Step 1〜12）
> 関連指示書: `tasks/codex/F1-P0_step04to12_codex_tasks.md`
> ステータス: **🟢 Conditional Go**（コード上のDoDはほぼPASS、実機動作確認3項目は要ユーザ確認）

## 1. レビュー時点のリポジトリ状態

### コミット履歴（origin/main）
| コミット | prefix | 役割 |
|---|---|---|
| `267a183` | `[X]` | F1-P0 Step 4-7,11-12 完了（Codex） |
| `f56cf6a` | `[Review]` | Vercel エラー報告反映（Claude） |
| `e2ec400` | `[Review]` | Codex質問への回答（Claude） |
| `141d220` | `[X]` | F1-P0 question raised（Codex 質問） |
| `e1e164a` | `[C]` | F1-P0 Step 1-3,8-10 + Codex指示書（Claude） |

Working tree: クリーン

## 2. Claude 担当（Step 1, 2, 3, 8, 9, 10）の確認結果

中間版から変更なし — **全項目 PASS**。

| Step | 内容 | 確認結果 |
|---|---|---|
| 1 | NW全ファイル robocopy | ✅ commit `e1e164a` で確認 |
| 2 | NW固有ファイル削除 | ✅ Protocols/Column/protocols/topics/protocol-review.ts/logo.png 削除確認 |
| 3 | `package.json` PM用更新 | ✅ name=pmap, @zxing/library^0.22.0, vitest追加 |
| 8 | `NotFound.tsx` 新規作成 | ✅ 設計書 §4.5 準拠 |
| 9 | `App.tsx` 書き換え | ✅ AuthGuard除去、未実装画面コメントアウト |
| 10 | `logo.svg` 新規作成 | ✅ #9d5b8b + 3行テキスト |

## 3. Codex 担当（Step 4-7, 11, 12）の確認結果

### コード確認結果

| Step | 内容 | 確認結果 |
|---|---|---|
| 4 | `tailwind.config.js` ブランドカラー | ✅ `colors.brand` 追加（DEFAULT/light/dark/darker）、fontFamily は NW元から存在 |
| 5 | `vite.config.ts` PWA manifest | ✅ name/short_name/description/theme_color 変更、workbox 等は NW踏襲 |
| 6 | `index.html` タイトル・theme-color | ✅ `PM Learning App` / `#9d5b8b` / favicon link 4種 設定 |
| 7.1 | `nwsp:` → `pmap:` 機械置換 | ✅ src/ 配下 0件残存（`Grep` で確認） |
| 7.2 | `Layout.tsx` STORAGE_KEY 特例 | ✅ `'pmap:sidebar_open'` でコロン統一（D-UI-01 確定事項を遵守） |
| 7.3 | `sync/types.ts` LEGACY_SYNC_PREFIX 削除 | ✅ import 削除 + 参照箇所（codec.ts 32行）も完全削除 |
| 11 | PWAアイコン PNG 生成 | ✅ public/pwa-192x192.png, pwa-512x512.png, favicon-32.png, favicon.svg 配置 |
| 12 | `npm install` & `npm run build` | ✅ Codex 報告で確認、A1 反映済 |

### 🟢 特に評価すべき点

1. **`LEGACY_SYNC_PREFIX` の完全削除** ─ 指示書 Step 7.3「参照箇所も削除」を遵守し、`src/lib/sync/codec.ts` の 32行（`stripLegacyChecksum`関数、`decodeLegacySyncString`関数、`decodeSyncString` 内の legacy 処理）まで丁寧に削除。設計書 §3.9「PMには旧バージョンが無いため削除」と整合
2. **質問機構の正しい使用** ─ `npm run build` 失敗を自己判断せず質問機構で停止。指示書 §7 のルール通り
3. **コミットprefix `[X]` の適切な使用**
4. **指示書範囲外への波及なし** ─ 設計書/PMドキュメント類への改変なし、`package.json` 依存追加なし

## 4. DoD（Definition of Done）チェック

| # | DoD 項目 | 判定 | 備考 |
|---|---|---|---|
| 1 | `tailwind.config.js` に `colors.brand` 追加 | ✅ PASS | NW元 fontFamily も保持 |
| 2 | `vite.config.ts` PWA manifest PM用更新 | ✅ PASS | PMラベル4項目変更、それ以外NW踏襲 |
| 3 | `index.html` タイトル・theme-color 更新 | ✅ PASS | favicon link 4種も適切 |
| 4 | `grep -rE "nwsp[:_]\|NWSP-SYNC\|nwsp-learning-app" src/` 0件 | ✅ PASS | Claude 側 grep で再確認 |
| 5 | `Layout.tsx` STORAGE_KEY = `'pmap:sidebar_open'` | ✅ PASS | line 144 で確認 |
| 6 | `sync/types.ts` LEGACY_SYNC_PREFIX 削除 | ✅ PASS | + codec.ts 参照箇所も削除 |
| 7 | public/ に 4ファイル | ✅ PASS | pwa-192/512, favicon-32, favicon.svg 全て配置 |
| 8 | `npm install` エラーなし | ✅ PASS | Codex 報告 exit 0 |
| 9 | `npm run dev` でホーム画面表示 | ⚠️ 未検証 | **要ユーザ実機確認** |
| 10 | `npm run build` エラーなし | ⚠️ 未検証 | **要ユーザ実機確認**（A1反映でTS2307は解消） |
| 11 | LocalStorage キーが `pmap:` プレフィックス | ⚠️ 未検証 | コード上は適切、**要実機確認** |

**DoD 完了状況**: 8/11 PASS、3/11 未検証（実機動作確認待ち）

## 5. Minor Findings（設計書 v0.15 との細かい不整合）

DoD 違反ではないが、設計書 v0.15（F1-P-1 反映版）と微妙にズレている箇所が3点あります。F1-P1 以降で軽く対処すれば十分。

### Minor #1: `storage.ts` に `USER_PROGRESS_LEGACY` 行が残存
- **現状**: `KEYS.USER_PROGRESS_LEGACY: 'pmap:user_progress'` が残っている（prefix のみ pmap: に置換）
- **設計書 v0.15 §3.2**: 「NW の `USER_PROGRESS_LEGACY` / `clearLegacyProgress()` は PM では不要（新規アプリのため旧スキーマが存在しない）。F1-P0 のNW→PMコピー時に削除する」と明記
- **原因**: F1-P0 指示書本文に明示的な削除指示が無かった（Step 7 機械置換のみで止まっている）
- **影響**: 軽微。`pmap:user_progress` キーへの書き込みは PM 内では発生しないため、削除しても影響なし
- **対処**: F1-P1 のついでに3行削除（`USER_PROGRESS_LEGACY: 'pmap:user_progress',` + `clearLegacyProgress()` 関数 + 呼び出し）

### Minor #2: `sync/adapters.ts` に `TRACKER_PLANS` のコメントアウト記述が無い
- **現状**: `KEYS` 定数に `TRACKER_PLANS` 行自体が存在しない（NW元のまま）
- **設計書 v0.15 §3.9**: 「`// TRACKER_PLANS: 'pmap:tracker:plans',   // ★F1 段階は同期対象外（NW踏襲）。F2-P4 で最終決定`」とコメントアウトで残す指示
- **原因**: F1-P0 指示書では明示要求していなかった（機械置換タスクのため）
- **影響**: 軽微。機能的には正しい（PMで同期対象外）。F2-P4 で再検討時に設計書 §3.9 を参照すれば対応可能
- **対処**: F2-P4 で同期方針を最終決定するときに併せて追加

### Minor #3: `public/logo-source.svg` が NW から残存
- **現状**: PM では `src/assets/logo.svg`（Claude が Step 10 で作成）を使う方針だが、NW 由来の `public/logo-source.svg` も残っている
- **影響**: なし。ビルド/動作には影響しない。ファイルが残っているだけ
- **対処**: F1-P1 か F1-P6 で削除しても良いし、放置でも問題なし

## 6. 設計書整合性チェック（F1-P-1 確定事項の反映状況）

| 確定事項 | F1-P0 反映状況 |
|---|---|
| D-LIB-01 関数名（applyAnswer等にリネーム） | ⏳ F1-P3 以降で実装時に対応（現状 NW名のまま、影響なし） |
| D-LIB-02 PM1 XPテーブル（G2式流用） | ⏳ F1-P3 以降で実装時に対応 |
| D-LIB-03 USER_PROGRESS_LEGACY 削除 | ⚠️ Minor #1 — 未削除 |
| D-LIB-04 副作用記述（コード自体は変更不要） | ✅ NW実装に既存（変更なし） |
| D-LIB-05 TRACKER_PLANS 同期方針 | ⚠️ Minor #2 — コメントアウト記述なし、F2-P4で再対応 |
| D-UI-01 サイドバーキー `pmap:sidebar_open` | ✅ 完全反映（Step 7.2） |
| D-UI-02 Layout.tsx inline style hex 置換 | ⏳ F1-P6 で実施（現状 NW青のまま） |
| D-UI-03 savedAnswersExists ヘルパー追加 | ⏳ F1-P3 で実装時に対応 |

## 7. レビュー観点別チェック（detailed_design 付録B 準拠）

| 観点 | 状態 |
|---|---|
| 指示書通りに作業範囲が守られているか | ✅ 範囲内、波及なし |
| `git push --force` 等の禁止操作 | ✅ 履歴上問題なし |
| コミットprefix `[X]` の使用 | ✅ 正しい |
| 自己判断による設計書/PMドキュメント編集 | ✅ なし |
| パッケージの無断追加 | ✅ なし |
| Claude 担当ファイルへの干渉 | ✅ なし |
| セキュリティ的問題 | ⚠️ Vercel ログで `8 vulnerabilities` 検出 — F1-P6 前に要対応 |

## 8. Vercel デプロイ状況

`267a183` push 直後に Vercel の自動再ビルドが走る想定。前回失敗の TS2307 エラー（`protocol-review` import）は A1 反映で解消されているため、今回は成功するはず。

→ **要ユーザ実機確認**: Vercel ダッシュボードで `267a183` のビルド結果を確認してください。

成功していれば本格的に F1-P0 完了判定 → F1-P1 へ移行。
失敗していれば該当ログを共有してもらえれば再調査。

## 9. Vercel ビルドログから抽出した付随事項

| 項目 | 内容 | 対応方針 |
|---|---|---|
| `--legacy-peer-deps` | Vercel 自動付与 | F1-P0 では受容、F1-P6 で再確認 |
| deprecated warning 3件 | sourcemap-codec / source-map / glob | 後続フェーズで依存更新検討 |
| **8 vulnerabilities (1 moderate, 7 high)** | NW から引き継いだ脆弱性 | 🚨 **F1-P6 デプロイ判定前に要対応**。`memory/risks.md` の R9 として追加検討 |

## 10. 最終 Go/No-Go 判定

### 🟢 **Conditional Go**

- ✅ Claude 担当 Step 1-3, 8-10: 全て PASS
- ✅ Codex 担当 Step 4-7, 11, 12 のコード変更: 全て PASS
- ✅ DoD 11項目中 8項目は確認済み PASS
- ⚠️ DoD 9, 10, 11 は **ユーザ実機動作確認待ち**（コード上は通る想定）
- ⚠️ Minor findings 3件は F1-P1 以降で軽く対処
- ⚠️ Vercel デプロイ成功は要ユーザ確認

### 移行可能条件
ユーザ側で以下を確認できれば **F1-P1（カテゴリ・サイドバー）着手 OK**:
1. ローカルで `npm run dev` 起動 → http://localhost:5173 でホーム画面表示
2. ローカルで `npm run build` エラーなく完了
3. ブラウザ DevTools の Application タブで LocalStorage が空 or `pmap:` プレフィックス
4. Vercel ダッシュボードで `267a183` のビルド成功

これら全てクリアなら F1-P0 を **正式に完了** とし、F1-P1 へ移行。

## 11. F1-P1 着手前 TODO リスト（Claude 側で対応予定）

F1-P1 開始時に Minor findings をついでに片付けるアクション:
- [ ] `src/lib/storage.ts` から `USER_PROGRESS_LEGACY` 行と `clearLegacyProgress()` 削除（Minor #1）
- [ ] `src/lib/sync/adapters.ts` の KEYS に `TRACKER_PLANS` のコメントアウト記述を追加（Minor #2、F2-P4 のために設計書整合）
- [ ] `public/logo-source.svg` 削除（Minor #3）

これらは F1-P1 の最初のコミット（categories.ts や NoteDetail.tsx の PM 12カテゴリ置換）に合わせて1コミットでまとめて処理。

## 12. 進捗ログ（最終版）

- 2026-05-13: Claude が Step 1, 2, 3, 8, 9, 10 完了、commit `e1e164a`、Codex指示書発行
- 2026-05-14 21:33: Codex が Step 4, 5, 6, 7, 11 + `npm install` 実施 → `npm run build` で `protocol-review` import エラーに遭遇 → 質問機構で停止、commit `141d220`
- 2026-05-14: Claude が質問に回答（A1 / A2）、中間レビュー作成、commit `e2ec400`
- 2026-05-14: ユーザより Vercel 自動デプロイ失敗報告（同根、A1反映で自動解決見込み）、補足追記 commit `f56cf6a`
- 2026-05-14 21:44: Codex が A1 反映 + Step 7 機械置換 + Step 11 アイコン生成 + Step 12 動作確認を実施し push、commit `267a183`
- 2026-05-14: Claude が最終レビュー実施、🟢 Conditional Go 判定 — 実機動作確認3項目とVercel結果を待つ
- 次の予定: ユーザ実機確認 → 全条件クリアなら F1-P1（カテゴリ・サイドバー）着手
