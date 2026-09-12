import { useCallback, useState } from 'react'
import ScratchCalculator from './ScratchCalculator'
import ScratchMemo from '../ScratchMemo'

/**
 * 演習画面のサイドパネル（PC 版のみ・保存なし）
 *
 * 問題を解いている「その場」でだけ使う計算用スペース。
 * - 上: 自由記入メモ（下書き・図の書き写し・途中計算）
 * - 下: 式が書ける電卓（重み付け計算などを 1 行で）
 *
 * 設計上の割り切り（ユーザ要望）:
 * - LocalStorage 等への永続化はしない
 * - 問題が切り替わったら破棄する（呼び出し側で key に questionId を渡して再マウントする）
 * - 画面幅が狭い端末では表示しない（呼び出し側の xl: ブレークポイントで制御）
 */
export default function QuizScratchPanel() {
  const [memo, setMemo] = useState('')

  /** 電卓の「結果をメモへ」からの追記（末尾へ 1 行足す） */
  const appendToMemo = useCallback((line: string) => {
    setMemo((prev) => (prev === '' ? line : prev.replace(/\n+$/, '') + '\n' + line))
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* メモ欄。高さは画面の高さに追従（電卓の高さ 約 620px = 履歴表示時の実測 を差し引いた
          残りを 120〜250px の範囲で使う）。低い画面でも電卓の = ボタンまで一画面に収めるため。 */}
      <ScratchMemo
        value={memo}
        onChange={setMemo}
        textareaClassName="h-[clamp(120px,calc(100vh-620px),250px)]"
      />

      {/* 電卓 */}
      <ScratchCalculator onSendToMemo={appendToMemo} />
    </div>
  )
}
