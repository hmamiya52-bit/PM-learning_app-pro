# 実装着手前 チェックリスト（IMPLEMENTATION_KICKOFF）

> 詳細設計（detailed_design.md v0.14）を参照しながら使う、**1ページ実装着手前確認シート**。
> 6,000行超の詳細設計を毎回参照しなくても、ここを見れば次に何をすべきかわかる。

---

## 🎯 プロジェクト概要

| 項目 | 値 |
|---|---|
| プロジェクト名 | PM Learning App |
| GitHub | https://github.com/hmamiya52-bit/PM-learning_app-pro |
| ローカル | `D:\Claude\PMpro\PM-learning_app-pro\` |
| Vercel | `https://mamiya-pmapp.vercel.app/`（準備中） |
| ベースアプリ | NW-learning_app-pro v1.3 |
| 技術スタック | React 19 + TypeScript + Vite 8 + Tailwind v3 + PWA |

## 📚 関連ドキュメント

| 文書 | バージョン | 役割 |
|---|---|---|
| `requirements.md` | v0.5 | スコープ・機能要件・確定事項 |
| `basic_design.md` | v0.9 | 全体構成・データ設計・共通モジュールAPI |
| `detailed_design.md` | v0.14 | 画面詳細・実装手順・QA |
| `color_samples.html` | — | ブランドカラー視覚プレビュー |
| `IMPLEMENTATION_KICKOFF.md` | — | **本書（実装着手前チェック）** |
| `memory/risks.md` | — | リスクレジスタ |
| `memory/MEMORY.md` | — | プロジェクト方針記録（自動メモリ） |

## ✅ 着手前 必須チェック5項目

### 1. NW実装精読（F1-P-1）完了
- [ ] `tasks/nw-readthrough.md` 作成済み
- [ ] 主要11ファイルの精読完了
- [ ] 設計書との差分10件以下に収束

### 2. 開発環境確認
- [ ] `node --version` で v24以降が表示
- [ ] `npm --version` で v11以降が表示
- [ ] `cd D:/Claude/PMpro/PM-learning_app-pro && git status` で問題なし

### 3. tasks/ ディレクトリ作成
- [ ] `tasks/codex/` 作成済み
- [ ] `tasks/reviews/` 作成済み
- [ ] `tasks/questions/` 作成済み
- [ ] `tasks/nw-readthrough.md` 作成済み

### 4. Vercelプロジェクト紐付け（F1-P6で実施）
- [ ] `vercel login` 完了
- [ ] `vercel link` で `mamiya-pmapp` プロジェクト紐付け完了

### 5. パイロットカテゴリ選定
- [ ] パイロット対象 = **ステークホルダー**（ユーザ確定済み）
- [ ] フェーズ1.5 開始タイミングのユーザ合意

---

## 🚀 実装フェーズの全体フロー

```
F1-P-1（NW精読）
   ↓
F1-P0（スキャフォールド）→ Vitest導入もここで
   ↓
F1-P1（カテゴリ・サイドバー）
   ↓
F1-P2（重要マーク + チュートリアル）
   ↓
F1-P3（午後I 骨組み）  ─┐
F1-P4（公式午前II 骨組み）├─→ 並列可能
F1-P5（論述 骨組み + 自動保存）─┘
   ↓
F1-P6（ブランド適用・初回デプロイ）
   ↓ ===== フェーズ1完了（v0.1.x） =====
   ↓
F1.5-P1〜P6（パイロット運用、1〜2週間）
   ↓ ===== フェーズ1.5完了（v0.5.x）、Go/No-Go判定 =====
   ↓
F2-P1（残11カテゴリのノート）─┐
F2-P2（残11カテゴリのクイズ）  ├─→ 並列可能
F2-P3（公式午前II 全年度）    │
F2-P4（午後I 全年度）         │
F2-P5（論述問題インデックス）  │
F2-P6（PMBOK第8版差分）       ─┘
   ↓
F2-P7（バッジ・QA・正式版リリース）
   ↓ ===== 正式版リリース（v1.0.0） =====
```

---

## 📋 各フェーズ Go/No-Go判定基準（要約）

| フェーズ | 判定基準 |
|---|---|
| F1-P-1 | NW読み合わせメモ完成、差分10件以下 |
| F1-P0 | `npm run dev` 動作 + LocalStorage prefix `pmap:` + Vitestセットアップ完了 |
| F1-P1 | 12カテゴリ表示 + サイドバー15項目 |
| F1-P2 | ☆トグル動作 + チュートリアル表示 |
| F1-P3 | 午後I PM1のみ表示 + 自己採点UI |
| F1-P4 | トップ→出題→サマリー一連動作 + 著作権表記 |
| F1-P5 | 論述5フェーズ動作 + 自動保存3秒debounce + 復帰モーダル |
| F1-P6 | 青系クラス0件 + Vercel公開 + PWAインストール可 |
| **フェーズ1.5** | **致命バグ0件 + 1カテゴリ完成 + ユーザ試用1〜2週間完了** |
| F2-P1〜P6 | 各カテゴリ・全年度のコンテンツ+検証スクリプトpass |
| F2-P7 | バッジ動作 + QA全項目pass + v1.0.0デプロイ成功 |

---

## ⚠️ 必須運用ルール（必ず守る）

### ターン制
- Claude セッションと Codex セッションは **絶対に同時に動かさない**
- セッション開始時: 必ず `git pull origin main`
- セッション終了時: 必ず `git add → commit → push`

### コミットprefix
- `[C]` Claude単独
- `[X]` Codex単独
- `[Review]` ClaudeによるCodex作業のレビュー後追加修正
- `[Doc]` ドキュメント更新
- `[Fix]` バグ修正

### コンテンツレビューフロー（フェーズ1.5以降）
```
Claude生成 → Codex レビュー → Gemini レビュー → ユーザ最終確認 → 反映
```

### バージョン表記
- v0.1〜v0.4: フェーズ1（骨組み）
- v0.5〜v0.9: フェーズ1.5（パイロット）
- v1.0.0: 正式版（全コンテンツ投入完了）
- それ以前は **「Beta」または「v0.x（開発中）」と画面表示**

---

## 🔧 トラブル時の参照先

| 状況 | 参照先 |
|---|---|
| API契約・型定義 | `basic_design.md` §4.2, §5 |
| 画面の挙動 | `detailed_design.md` §5〜§9 |
| 実装手順 | `detailed_design.md` §2 |
| Codex指示書テンプレート | `detailed_design.md` 付録A |
| Claudeレビュー観点 | `detailed_design.md` 付録B |
| QAチェックリスト | `detailed_design.md` §13 |
| デプロイ手順 | `detailed_design.md` §14 |
| リスク・対策 | `memory/risks.md` |

---

## 🚦 着手判断

**全5項目のチェックが完了したら F1-P-1（NW実装精読）から着手する。**

不明点があれば実装前にユーザに確認、自己判断で進めない。
