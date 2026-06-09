# F2-P9 午後II 参考答案 — 継続ブリーフ（R5以降）＝新セッション・キックオフ

> 作成: Claude（2026-06-06、R6-PM2-1/2 完成・scoringTips 実装後）
> 担当: **Claude 単独**（答案・designNote・pitfalls・scoringTips の文章は委譲不可）
> このファイルだけ読めば、同じ進め方で続きを作成できることを目標とする。
> 背景・初期決定は `tasks/F2-P9_essay_sample_answers_brief.md`、最新状態は `memory/phase_status.md` の F2-P9 行。

## 0. ゴールと現在地
- **ゴール**: 午後II 全24問（`essayProblems.ts` R6〜H25 各2問）に、Claude 著作の参考答案＋解説を付ける。
- **進捗（2/4 パイロット完了）**: ✅ **R6-PM2-1**（予測型コストマネジメント／クラウド移行）・✅ **R6-PM2-2**（リーダーシップ選択／NW基盤刷新）。
- **次にやること**: **R5-PM2-1 → R5-PM2-2**。これで**パイロット4本完成 → ユーザ価値検証ゲート**（ここで一旦止めてユーザ確認。OKで残20本=R4〜H25へ展開）。**闇雲に全件作らない。**
- UI・型・データ構造・導線は**実装済み**。新規問は**データを追加するだけ**で全機能が有効化される。

## 1. この案件の「型」（本セッションで確立。全答案で踏襲）
1. **立場＝インフラエンジニアのPM に固定**（全答案共通）。題材はインフラ種別で変えて重複させない。
   - 既出: R6-1=パブリッククラウド移行 / R6-2=全社ネットワーク基盤刷新。
   - 次の候補: データセンター統合、サーバ仮想化基盤更改、ゼロトラスト/セキュリティ基盤、ストレージ/バックアップ基盤刷新、社内認証基盤、等。テーマに合うものを選ぶ。
2. **一人称体験談・である体**（「私は〜」）。
3. **5軸自己採点で満点（25/25）を狙って書く**。書いた後に自分で採点し、満点でなければ作り直す。5軸＝**題意適合／構造／具体性／一貫性／字数達成**。
   - 題意適合: 各設問の小問要素を漏れなく回収（設問を分解しチェックリスト化）。
   - 構造: 「まず／次に／最後に」「一つ目／二つ目」等で導入→本文→結びを明確化。
   - 具体性: 業種・規模・固有名・数値・状況を具体に。経験に基づく感を出す。
   - 一貫性: 同じ事例・人物・数値・論点をア→イ→ウで一貫追跡。金額等を矛盾させない。
   - 字数達成: 上限寄り（後述）。
4. **段落は短め＋各段落の冒頭を全角1字下げ（`　` U+3000）**。1段落が長くなりすぎないよう分割（目安: ア3-4段落／イ5-6段落／ウ3-5段落）。
5. **字数は上限寄り**（やや上限寄り）。目安 **ア≒770-800／イ≒1400-1500／ウ≒1050-1130**。各問の `recommendedChars` 範囲を厳守（特に **アは≤800（上限ギリギリ注意）**、イ≥800、ウ≥600）。1字下げの全角空白も字数に含む。
6. **採点講評の弱点に正対する**。PDF精読で各問の出題趣旨・採点講評を掴み、講評が指摘する典型失点を避ける構成にする（例: R6-2は「PM管理活動とリーダーシップ行動の混同」を本文で明示的に切り分けた）。
7. **問題本文の逐語引用は禁止**（答案・designNote・pitfalls・scoringTips は独自著作。根拠は言い換え＋位置参照）。**例外: `preamble` はIPA問題文の引用（教育引用枠。pdfUrl出典明記済）**。

## 2. データ構造（UIは実装済み。データを足すだけ）
### `src/data/essaySampleAnswers.ts` に新エントリを追加
```ts
'R5-PM2-1': {
  id: 'R5-PM2-1',
  byLabel: {
    'ア': ['　…段落1', '　…段落2', '　…段落3'].join('\n'),  // 強調なし・各段落1字下げ
    'イ': ['　…', '　…'].join('\n'),
    'ウ': ['　…', '　…'].join('\n'),
  },
  designNote: ['　…（150-300字。__navy__/==赤== は各2ペアまで）', '　…'].join('\n'),
  pitfalls: ['…ありがちな失点（2-4件）', '…'],
  scoringTips: ['…さらに高評価を得るためのポイント（IPA採点者視点・3-4件）', '…'],
},
```
- **byLabel**: 答案本文。**強調マークアップなし**（実際の答案を模す）。段落は `\n` 区切り、各段落の先頭に全角1字下げ。配列を `.join('\n')` で結合。
- **designNote**: 設計意図 150-300字。各段落1字下げ。`__navy__`/`==赤==` は1フィールド各2ペアまで。
- **pitfalls**: その問でありがちな失点 2-4件。
- **scoringTips**: IPA採点者視点で「さらに高評価を得るためのポイント」3-4件（参考答案ページと提出後リビューの最下部にエメラルドで表示される）。題材のシステム開発適合の補強・理想化の回避・講評弱点への対応・評価と対応結果の結合 等を、その問固有の論点に即して。

### `src/data/essayProblems.ts` の該当問に `preamble` を追加
```ts
preamble: [
  '　…IPA問題文の冒頭（前置き）段落1（全角読点「，」・全角句点「。」・各段落1字下げ）',
  '　…段落2',
  '　あなたの経験と考えに基づいて，設問ア～ウに従って論述せよ。',
].join('\n'),
```
- 型 `EssayProblem.preamble?:string` は実装済み。PDF本文の「問○ …について」直後〜「設問ア…」直前の前置き文を**正確に転記**（高解像度で精読）。

## 3. 1問あたりの進め方
0. `Set-Location D:\Claude\PMpro\PM-learning_app-pro` → `git pull`。`memory/phase_status.md` の F2-P9 行を確認。
1. **PDF精读**（PyMuPDF で `$env:TEMP` にPNG化→Readで視覚精読→**作業後PNG削除**）。読むもの: ①問題本文（冒頭の前置き＝preamble用、各設問文）②出題趣旨（answerPdfUrl）③採点講評（commentaryPdfUrl）。**R5のPDFは新規取得**（R6の `$env:TEMP\pm_r6_pm2` は流用不可）。年度1ファイルに問1・問2同梱、表紙/メモ用紙の白紙ページに注意。小さいページは dpi=300〜400 で再描画。
2. **架空PJ設定**（インフラPM視点・既出と重複しない題材）。
3. **設問分解→執筆**（ア→イ→ウ）。短い段落＋全角1字下げ。採点講評の失点を避ける。
4. **preamble 転記**（essayProblems該当問）。
5. **scoringTips 作成**（採点者視点・3-4件）。
6. **検証**（§4のコマンド）: 字数（範囲内・上限寄り）／マークアップ厳密（stray0・全角＝0・===0・偶数）／`npm run validate-data`(NG0)／`npm run build`(PASS=tsc含む)。
7. **実機**（Claude Preview, vite-dev/5173）: 参考答案ページ `/essay/:id/sample`（注記・冒頭文折りたたみ・各設問の参考答案・設計の意図・失点・**scoringTips最下部**）／解答画面 `/essay/:id`（冒頭文折りたたみ・PC左右分割・モバイル縦積み）。横スクロール無し・console error0・赤/ネイビー描画。※textarea背高で `preview_screenshot` はタイムアウトしがち→ `preview_eval` で要素・色・配置を数値検証。
8. **セルフレビュー**（毎問やる。ユーザも毎回求める）: 設問充足・一貫性・採点講評対応・読みやすさ・冗長/重複表現・コードを粗探しし、価値ある修正を適用。
9. **commit & push**: `[C] 午後II <id> 参考答案を新規作成`（＋preamble/scoringTips）。**git add は明示パスのみ**（§5参照）。push は毎問 or 区切りで。**4本目（R5-PM2-2）完成後はユーザ価値検証を依頼して一旦停止**。

## 4. 検証コマンド（コピペ可。すべて `Set-Location D:\Claude\PMpro\PM-learning_app-pro` 後に実行）
**字数カウント**（一時 `scripts/_count_essay.ts` を作り `npx vite-node` で実行→終わったら削除）:
```ts
import { essaySampleAnswers } from '../src/data/essaySampleAnswers'
import { essayProblems } from '../src/data/essayProblems'
for (const [id, s] of Object.entries(essaySampleAnswers)) {
  const p = essayProblems.find(x => x.id === id); let line = id + ': '
  for (const l of ['ア','イ','ウ'] as const) {
    const n = s.byLabel[l].replace(/\n/g,'').length
    const rc = p?.setsumons.find(q => q.label===l)?.recommendedChars
    line += `${l}=${n}(${rc && n>=rc.min && n<=rc.max ? 'OK':'OUT'}) `
  }
  console.log(line)
}
```
**マークアップ厳密検査**（essaySampleAnswers はvalidatorが未走査→手動必須）:
```bash
python -c "import re; s=open('src/data/essaySampleAnswers.ts',encoding='utf-8').read(); lines=s.splitlines(); stray=[i+1 for i,l in enumerate(lines) if '==' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l)) or '__' in re.sub(r'__[^_]+__','',re.sub(r'==[^=]+==','',l))]; print('stray:', stray, '/ zenkaku=:', s.count(chr(0xFF1D)), '/ ===:', s.count('==='), '/ even:', s.count('==')%2==0 and s.count('__')%2==0)"
```
→ stray=[] ・ zenkaku= 0 ・ === 0 ・ even True であること。
**ゲート**: `npm run validate-data`（`[OK] 全データの整合性確認完了`・各NG:0）／`npm run build`（`✓ built`・tsc含む）。

## 5. 環境の落とし穴（重要）
- **gitルートはサブディレクトリ** `D:\Claude\PMpro\PM-learning_app-pro`。ハーネスの作業ディレクトリは親 `D:\Claude\PMpro`。**各 PowerShell コマンドの先頭で `Set-Location D:\Claude\PMpro\PM-learning_app-pro`**（cwdは呼び出し間で持続しないことがある）。git は `git -C D:\Claude\PMpro\PM-learning_app-pro …` でも可。Bashツールは git-bash（`cd /d` は不可）。
- **`git add -A` 禁止**。作業ツリーに**別ストリーム（ITSM学習モード: `src/data/sm*`・`src/pages/Sm*`・`src/pages/ItServiceManager*`・`App.tsx` 等）の未コミット変更が共存**する。**自分が触ったファイルのみ明示パスで add** する。
- preview は `mcp__Claude_Preview__preview_start` で name=`vite-dev`（ルート側 `D:\Claude\PMpro\.claude\launch.json` の `npm --prefix PM-learning_app-pro run dev`・port5173）。
- `validate-data` は essaySampleAnswers を走査しない（Codexのチェッカー拡張は未実施）→ マークアップ・字数は**手動検証**で担保。
- commit prefix は `[C]`（Claude）。末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

## 6. 触るファイル一覧（新規問あたり）
- `src/data/essaySampleAnswers.ts`（参考答案エントリ追加）
- `src/data/essayProblems.ts`（該当問に preamble 追加）
- これだけ。UI（`src/pages/EssaySampleAnswerView.tsx`・`EssayTraining.tsx`・`EssayList.tsx`・`EssayAttemptDetail.tsx`・`App.tsx` ルート）は実装済みで触らない。

## 7. 次の2問（パイロット完成まで）
| id | テーマ | 系統 | インフラPM題材の方向（PDF精読後に確定） |
|---|---|---|---|
| R5-PM2-1 | プロジェクトマネジメント計画の修整（テーラリング） | tailoring-models 系 | 時間・コスト・品質以外に重要としたPM対象（可用性／セキュリティ／移行リスク等）を、その特性に合わせてマネジメント方法を修整。例: DC統合や認証基盤で「可用性」を重点にプロセスをテーラリング |
| R5-PM2-2 | 組織のPM能力向上につながるプロジェクト終結時の評価 | measurement/governance 系 | 目標未達（性能未達・稼働遅延・移行トラブル等）→直接原因→根本原因の究明→PM観点の再発防止策→組織への定着の工夫。インフラPJで具体化 |

→ **R5-PM2-1 → R5-PM2-2 を作成 → 4本でユーザ価値検証を依頼して停止**。

## 8. 参照
- 初期方針・決定の背景: `tasks/F2-P9_essay_sample_answers_brief.md`
- 設計: `docs/afternoon_explanation_design.md` §5（午後II参考答案）
- マークアップ規約: `docs/afternoon_explanation_authoring_rules.md` §6（`==赤==`/`__navy__`・厳密検査）
- 最新の実装状態・教訓: `memory/phase_status.md` の F2-P9 行（本ブリーフはその要約＋手順化）
- 既存の完成サンプル（品質基準）: `essaySampleAnswers.ts` の `R6-PM2-1` / `R6-PM2-2`
