# Codex 作業指示書: F1-P0 Step 4-7 & 11-12

> 作成: Claude（2026-05-13）
> 対象タスク: F1-P0 スキャフォールド
> 想定所要時間: 1〜2時間（npm install 含む）
> 前提: 同セッションで F1-P0 Step 1, 2, 3, 8, 9, 10 は Claude 実施済み（コミット済み）

## 0. はじめに（毎回必ず読むこと）
- 本指示書は Codex 専用。Claude が並行して作業することはない
- 作業開始前に必ず `git pull origin main` する
- 作業完了後に必ず `git add → commit → push` する
- コミットメッセージのprefixは `[X]` を使用
- 不明点があれば**自己判断せず**、`tasks/questions/F1-P0.md` に記録して push（実装はそこで停止）
- `git add` は明示的にファイル指定（`-A` 禁止）

## 1. 作業概要

F1-P0 スキャフォールドのうち、機械作業中心の Step 4-7 + Step 11-12 を実施する。
- Step 4: tailwind.config.js にブランドカラー追加
- Step 5: vite.config.ts の PWA manifest を PM 用に更新
- Step 6: index.html のタイトル・theme-color 更新
- Step 7: LocalStorageキー prefix の機械置換（`nwsp:` → `pmap:`）
- Step 11: ロゴSVGから PWAアイコンPNG（192/512/32）を生成
- Step 12: 依存パッケージインストール + `npm run dev` 起動確認

## 2. 前提
- 関連ドキュメント:
  - `detailed_design.md` v0.15 §2.1（F1-P0 全体）
  - `detailed_design.md` v0.15 §3.2（storage.ts のキー定義）
  - `detailed_design.md` v0.15 §12（ブランド適用マップ）
  - `tasks/nw-readthrough.md`（F1-P-1 確定事項、特に D-UI-01）
- 必要な前タスク完了状況:
  - F1-P-1 NW実装精読: ✅ 完了済（コミット `490e294`）
  - F1-P0 Step 1（NW→PMコピー）: ✅ Claude 実施済
  - F1-P0 Step 2（NW固有ファイル削除）: ✅ Claude 実施済
  - F1-P0 Step 3（package.json）: ✅ Claude 実施済
  - F1-P0 Step 8（NotFound.tsx）: ✅ Claude 実施済
  - F1-P0 Step 9（App.tsx 書き換え）: ✅ Claude 実施済
  - F1-P0 Step 10（ロゴSVG `src/assets/logo.svg`）: ✅ Claude 実施済

## 3. 入力ファイル（読むだけ）
- `detailed_design.md` v0.15 §2.1 line 514-665（F1-P0 各 Step の詳細コード）
- `detailed_design.md` v0.15 §3.2（pmap:sidebar_open キー定義）
- `detailed_design.md` v0.15 §12.1, §12.2, §12.3（ブランド色置換表は F1-P6 で使うので参考のみ。本指示書では使わない）
- `tasks/nw-readthrough.md`（D-UI-01 「pmap:sidebar_open はコロン統一」を参照）
- `src/assets/logo.svg`（Step 11 で入力）

## 4. 出力ファイル（作成または編集）
- `tailwind.config.js`（編集）
- `vite.config.ts`（編集）
- `index.html`（編集）
- `src/lib/storage.ts`、`src/lib/tracker.ts`、`src/lib/activityLog.ts`、`src/lib/sync/adapters.ts`、`src/lib/sync/types.ts`、`src/lib/gamification.ts`、`src/auth/useAuth.ts`、`src/pages/AfternoonProblems.tsx`、`src/pages/AfternoonMyAnswer.tsx`、`src/components/Layout.tsx`、その他 `nwsp` を含む全ファイル（Step 7 置換対象）
- `public/pwa-192x192.png`（新規）
- `public/pwa-512x512.png`（新規）
- `public/favicon-32.png`（新規）
- `public/favicon.svg`（新規 = src/assets/logo.svg のコピー）

## 5. 作業手順

### Step 4: tailwind.config.js にブランドカラー追加

`tailwind.config.js` の `theme.extend` に `colors.brand` を追加。

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9d5b8b',
          light:   '#f5e9f1',
          dark:    '#7d4570',
          darker:  '#5e3354',
        },
      },
    },
  },
  plugins: [],
}
```

> NW の既存 `tailwind.config.js` をベースに `colors.brand` だけ追加する。他の設定（content など）は維持。

### Step 5: vite.config.ts の PWA manifest 更新

`vite.config.ts` の `VitePWA` 設定内の `manifest` を以下に書き換え。

```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'PM Learning App',
    short_name: 'PM Learn',
    description: 'プロジェクトマネージャ試験 学習アプリ',
    theme_color: '#9d5b8b',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  // workbox 設定は NW 踏襲（既存値を変更しない）
})
```

> workbox 設定はそのまま。NWの `name` / `short_name` / `description` / `theme_color` だけ書き換える。

### Step 6: index.html のタイトル・theme-color 更新

`index.html` の `<head>` 内を以下に変更。

```html
<title>PM Learning App</title>
<meta name="theme-color" content="#9d5b8b" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
```

> NW の既存 `<title>` `<meta name="theme-color">` `<link rel="icon">` 行を上書き。

### Step 7: LocalStorageキー prefix の置換

#### Step 7.1: `nwsp:` → `pmap:` の機械置換

`src/` 配下の全ファイルで `nwsp:` を `pmap:` に置換。Windows PowerShell では以下:

```powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx -File | ForEach-Object {
  (Get-Content $_.FullName -Raw -Encoding UTF8) -replace 'nwsp:','pmap:' | Set-Content $_.FullName -NoNewline -Encoding UTF8
}
```

Git Bash / WSL の場合:
```bash
grep -rl "nwsp:" src/ | xargs sed -i "s/nwsp:/pmap:/g"
```

#### Step 7.2: Layout.tsx の STORAGE_KEY 特例修正（F1-P-1 D-UI-01 確定事項）

`src/components/Layout.tsx` の以下を **手動で** 修正:

```tsx
// 修正前（NW実装）
const STORAGE_KEY = 'nwsp_sidebar_open'  // アンダースコア区切り

// 修正後（PM、コロン統一）
const STORAGE_KEY = 'pmap:sidebar_open'  // コロン統一（D-UI-01）
```

> Step 7.1 の機械置換では `nwsp_` (アンダースコア) は `pmap:` に変わらない。手動で `pmap:sidebar_open` にすること。

#### Step 7.3: sync/types.ts の SYNC_PREFIX / SYNC_APP_ID 修正

`src/lib/sync/types.ts` の以下を確認 + 修正:

```ts
// 修正前（NW）
export const LEGACY_SYNC_PREFIX = 'NWSP-SYNC-v1:'
export const SYNC_PREFIX = 'NWSP-SYNC-v2:'
export const SYNC_APP_ID = 'nwsp-learning-app' as const

// 修正後（PM）
// LEGACY_SYNC_PREFIX は削除（PMには旧バージョンが無いため）
export const SYNC_PREFIX = 'PMAP-SYNC-v1:'
export const SYNC_APP_ID = 'pmap-learning-app' as const
```

> `LEGACY_SYNC_PREFIX` 行は削除する。これを参照する箇所があれば併せて削除（grep で確認）。

#### Step 7.4: 残存確認

置換漏れがないか確認:
```bash
grep -rE "nwsp[:_]|NWSP-SYNC|nwsp-learning-app" src/
```

→ **0 件である必要がある**。

### Step 11: PWAアイコンPNG生成

`src/assets/logo.svg`（Claude が Step 10 で作成済み）から 3サイズの PNG を生成。

```powershell
# プロジェクトルートで実行
node -e "const sharp = require('sharp'); const fs = require('fs'); const svg = fs.readFileSync('src/assets/logo.svg'); Promise.all([sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png'), sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png'), sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png')]).then(() => console.log('OK'));"
```

PowerShell で複数行のときは `;` で繋ぐか、別ファイルで `node scripts/gen-icons.mjs` のように実行。
※ `sharp` は `package.json` の devDependencies に既に含まれている。

その後、`favicon.svg` を public/ にコピー:
```powershell
Copy-Item src/assets/logo.svg public/favicon.svg
```

### Step 12: 依存インストール & 起動確認

```powershell
# プロジェクトルートで
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue   # NW由来のロックファイルを破棄
npm install --no-fund --no-audit
npm run dev
```

ブラウザで `http://localhost:5173` を開く。確認項目:
- ヘッダが `#9d5b8b` 系の色で表示される（Step 7 で `bg-blue-*` が残っていても OK、F1-P6 で置換）
- ホーム画面が表示される
- LocalStorage を開いて何かしらのキーを書き込み、`pmap:` プレフィックスになっていることを確認
- コンソールエラーが出ていないこと（peer warning は許容）

> `npm install` で `@zxing/library` の peer dep warning が出る可能性あり。設計書 §2.1 Step 3 の `^0.22.0` への調整で解消する想定。warning は許容、error は NG。

ビルド確認:
```powershell
npm run build
```
→ エラーなしで完了すること。

## 6. 完了条件（DoD）

- [ ] `tailwind.config.js` に `colors.brand` が追加されている
- [ ] `vite.config.ts` の PWA manifest が PM 用に更新されている
- [ ] `index.html` のタイトル・theme-color が PM 用に更新されている
- [ ] `grep -rE "nwsp[:_]|NWSP-SYNC|nwsp-learning-app" src/` が 0 件
- [ ] `src/components/Layout.tsx` の `STORAGE_KEY` が `'pmap:sidebar_open'` になっている
- [ ] `src/lib/sync/types.ts` の `LEGACY_SYNC_PREFIX` 行が削除されている
- [ ] `public/pwa-192x192.png`、`pwa-512x512.png`、`favicon-32.png`、`favicon.svg` が作成されている
- [ ] `npm install` がエラーなしで完了
- [ ] `npm run dev` で `http://localhost:5173` 起動、ホーム画面表示
- [ ] `npm run build` がエラーなしで完了
- [ ] LocalStorage に書き込まれるキーが `pmap:` プレフィックス

## 7. 注意事項・禁止事項

- ❌ 指示書外のファイル（特に `requirements.md`、`basic_design.md`、`detailed_design.md`、`memory/*`、`tasks/codex/*` 以外の tasks/）を編集しない
- ❌ `npm install` で **新規パッケージを追加しない**（既存の `package.json` の依存のみ使用）。必要なら §A.3 の質問機構に記録
- ❌ `git push --force` 禁止
- ❌ Layout.tsx のヘッダ色 hex（`#1a3a5c`）の置換はやらない。これは F1-P6 で実施
- ❌ Tailwind `bg-blue-*` → `bg-brand` の置換はやらない。これは F1-P6 で実施
- ⚠️ Step 7 の機械置換は `src/` 配下のみ対象。`tasks/`、`memory/`、設計ドキュメント（ルート直下の .md）は触らない
- ⚠️ ビルドエラーが出た場合、`src/data/categories.ts` から削除済みファイル（protocols.ts, topics.ts 等）への import が残っている可能性。エラーログを `tasks/questions/F1-P0.md` に貼って質問

## 8. 完了後のgit操作

```bash
git add tailwind.config.js vite.config.ts index.html \
  src/lib/storage.ts src/lib/tracker.ts src/lib/activityLog.ts \
  src/lib/sync/adapters.ts src/lib/sync/types.ts src/lib/gamification.ts \
  src/auth/useAuth.ts src/pages/AfternoonProblems.tsx src/pages/AfternoonMyAnswer.tsx \
  src/components/Layout.tsx \
  public/pwa-192x192.png public/pwa-512x512.png public/favicon-32.png public/favicon.svg \
  package-lock.json

# 他に置換対象ファイルがあれば（grep結果に応じて）追加 add

git commit -m "[X] F1-P0 Step 4-7,11-12: スキャフォールド機械作業（prefix置換・PWA設定・アイコン生成・依存インストール）"
git push origin main
```

## 9. レビュー

完了push後、Claudeがレビューする。
- DoD 全項目を確認
- 残存 `nwsp` パターンが無いか再 grep
- `npm run build` の出力をローカルで再確認
- 設計書との整合性を再確認

レビュー結果は `tasks/reviews/F1-P0_review.md` に記録される。

---

## 補足: ビルドエラー対処（よくあるケース）

### Case 1: `Cannot find module './data/protocols'` 等
- Step 2 で削除されたファイルへの import が `src/data/categories.ts` 等に残っている可能性
- 該当の import 行を削除する。配列要素もあれば削除
- 直前に Claude に確認すること（`tasks/questions/F1-P0.md` に記録）

### Case 2: `src/pages/Login.tsx` 等の認証関連で型エラー
- Login は App.tsx で参照していないが、ファイルは残っている
- 削除はしない（正式版 F2-P6 で復活）。型エラーが出る場合は `tsconfig.json` の `exclude` に `src/pages/Login.tsx`、`src/auth/**` を追加するか質問

### Case 3: 削除済みファイルが NoteDetail.tsx や Quiz.tsx で参照
- NoteDetail.tsx の `NOTE_CATEGORY_IDS` 配列に `protocol-review` 等が含まれている可能性
- Quiz.tsx で `categories` から削除済みカテゴリを参照している可能性
- これらは F1-P1（カテゴリ・サイドバー）で本格対応する。F1-P0 段階では import エラーになる箇所をコメントアウトする程度で OK
- 大きな改修になりそうなら質問機構に記録
