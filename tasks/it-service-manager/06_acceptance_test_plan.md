# ITサービスマネージャ 受入基準・テスト計画 v1.0

作成日: 2026-06-01

## 1. 目的

ITサービスマネージャ寄り道モードが、PMアプリの中に安全に同居し、既存PM機能へ影響を出さず、合格に必要な学習体験を満たしていることを確認する。

この文書は、設計レビュー、実装レビュー、リリース前確認の共通チェックリストとして使う。

## 2. 受入基準

### 2.1 既存PMへの影響なし

合格条件:

- トップページ以外の既存PM画面にITSM導線が増えない。
- 既存PMの検索結果にITSMデータが出ない。
- 既存PMの履歴にITSMイベントが出ない。
- 既存PMのバッジ、XP、レベルにITSM結果が反映されない。
- 既存PMの同期ペイロードに `pmap:sm:*` が入らない。
- 既存PMの重要マークにITSM問題が入らない。
- 既存PMのドキュメントは改変しない。

許容する変更:

- `src/pages/Home.tsx` にITサービスマネージャカードを1枚追加する。
- `src/App.tsx` にITSM専用ルートを追加する。

### 2.2 ITSM内完結

合格条件:

- `/it-service-manager` 以下で、ハブ、頻出テーマ、知識ノート、午前Ⅱ、午後Ⅰ、午後Ⅱ、専用履歴へ移動できる。
- ITSM内の保存キーは `pmap:sm:*` のみを使う。
- ITSM専用履歴はITSM内でだけ表示される。
- 学習時間計測は存在しない。
- ITSM重要マークは存在しない。

### 2.3 コンテンツ品質

合格条件:

- 直近10回調査に基づく頻出テーマが見える。
- 頻出テーマはS/A/Bで優先順位が分かる。
- 初回投入データは令和7年度春期の直近1年分に限定する。
- 午前Ⅱは公式PDF参照、答案入力、正答、復習メモを持つ。
- 午後Ⅰは公式PDF、自己採点、公式解答例の要点、独自採点ポイント、失点しやすい観点を持つ。
- 午後Ⅱは骨子、評価観点、参考答案2本を持つ。
- 午後Ⅱの参考答案はインフラエンジニア案件である。
- 50時間設計は静的ロードマップであり、時間計測機能ではない。

### 2.4 UI品質

合格条件:

- デスクトップで主要画面が崩れない。
- モバイルでカード、ナビ、入力欄、採点欄のテキストがはみ出さない。
- ITSMはPM本編と見分けがつくが、アプリ全体の品質感から浮かない。
- ボタンや入力の操作対象が十分に大きい。
- 公式PDFリンクが見失われない。

## 3. 静的確認

### 3.1 差分確認

確認コマンド:

```powershell
git diff --name-only
```

期待:

- 既存PMドキュメント配下の変更がない。
- 既存PMデータや既存PMノートの差分がない。
- 既存PM機能の変更は `Home.tsx` と `App.tsx` に限定される。

### 3.2 参照混入確認

確認コマンド:

```powershell
rg -n "it-service-manager|pmap:sm|SmMorning|SmAfternoon|SmEssay" src\pages src\lib src\data -S
rg -n "it-service-manager|pmap:sm|Sm" src\pages\Search.tsx src\pages\ActivityHistory.tsx src\data\badges.ts src\lib\gamification.ts src\lib\activityLog.ts src\lib\sync -S
```

期待:

- 1つ目はITSM専用ファイル、`App.tsx`、`Home.tsx` だけに出る。
- 2つ目はヒットしない。

### 3.3 保存キー確認

確認コマンド:

```powershell
rg -n "pmap:" src\data\sm src\lib\sm src\pages\sm src\pages\ItServiceManager.tsx -S
```

期待:

- `pmap:sm:morning:records`
- `pmap:sm:afternoon:records`
- `pmap:sm:essay:attempts`
- `pmap:sm:essay:drafts`
- `pmap:sm:events`
- 上記以外のITSM保存キーがある場合は設計文書へ追加されている。

## 4. ビルド・データ検証

確認コマンド:

```powershell
npm run build
npm run validate-data
```

期待:

- buildが成功する。
- validate-dataが既存既知警告以外で失敗しない。
- ITSM追加によって既存PMデータ検証が壊れない。

## 5. 手動ブラウザ確認

対象:

- `/`
- `/it-service-manager`
- `/it-service-manager/themes`
- `/it-service-manager/knowledge`
- `/it-service-manager/morning`
- `/it-service-manager/afternoon`
- `/it-service-manager/essay`
- `/it-service-manager/history`
- `/search`
- `/history`
- `/badges`
- `/sync`

確認観点:

- トップページの学習メニューにITサービスマネージャカードが1枚だけある。
- ITSMカードの位置はPM本編カードの後、デバイス同期の前である。
- ITSM内の各画面にPMホームへ戻る導線がある。
- PM検索、PM履歴、PMバッジ、同期画面にITSMのデータが出ない。
- モバイル幅でナビや入力欄が重ならない。

## 6. LocalStorage操作確認

手順:

1. ブラウザでLocalStorageをクリアする。
2. PM本編で午前Ⅱを1問解く。
3. ITSM午前Ⅱを1問解く。
4. ITSM午後Ⅰを1件記録する。
5. ITSM午後Ⅱの下書き保存と練習完了を行う。
6. LocalStorageキー一覧を見る。

期待:

- PM操作は既存PMキーにだけ保存される。
- ITSM操作は `pmap:sm:*` にだけ保存される。
- ITSM操作後にPM履歴、PMバッジ、PM同期対象が増えない。

## 7. 同期無影響確認

確認観点:

- 同期対象キーを列挙する関数に `pmap:sm:*` が含まれていない。
- 同期ペイロード生成処理にITSM専用キーが入っていない。
- 同期画面にITSMの件数や履歴が表示されない。

実装確認方法:

```powershell
rg -n "localStorage|pmap:|sync|payload|export|import" src\lib src\pages\Sync.tsx -S
```

期待:

- ITSMキーが既存同期コードから参照されない。
- もし将来ITSM同期を追加する場合は、既存PM同期とは別の明示的な設計変更として扱う。

## 8. コンテンツ受入

### 8.1 頻出テーマ

確認:

- `07_10round_research_matrix.md` の集計結果が、アプリの `smFrequentThemes` に反映されている。
- Sランクはハブ、頻出テーマ、知識ノートのすべてで目立つ。
- Aランクは知識ノートに章を持つ。
- Bランクは頻出テーマ画面に補足として出る。

### 8.2 午前Ⅱ

確認:

- 令和7年度春期の問番号、正答、テーマ、復習メモが登録されている。
- 公式PDFリンクがある。
- 問題文全文がアプリ内データに入っていない。
- 正答率、未演習、直近不正解、頻出Sフィルタが動く。

### 8.3 午後Ⅰ

確認:

- 令和7年度春期の3問が登録されている。
- 問ごとに公式問題PDF、解答例PDF、採点講評PDFへ行ける。
- 自己採点は0-50点で保存できる。
- 公式解答例の扱いは `05_source_policy.md` に従う。
- 採点ポイントと失点ポイントは独自整理になっている。

### 8.4 午後Ⅱ

確認:

- 令和7年度春期の2問が登録されている。
- 各テーマに骨子がある。
- 各テーマに評価観点がある。
- 各テーマにインフラ案件の参考答案が2本ある。
- 参考答案が唯一の正解ではないことを表示する。
- 下書き保存と練習完了がITSM専用履歴に残る。

## 9. リリース判定

初回リリース可能条件:

- 2章から8章の合格条件を満たす。
- 既存PM機能の無影響確認が完了している。
- 公式出典の最終確認日が実装データに入っている。
- ユーザーが直近1年分の作り込みを確認できる状態である。

5年分拡張へ進める条件:

- ユーザーから初回版OKが出ている。
- 直近10回マトリクスが最新公式情報で再確認されている。
- 5年分に拡張しても既存PM機能へ影響しない設計が維持されている。

