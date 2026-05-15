import { useState, useEffect, useCallback } from 'react'
import { isImportant, toggleImportant } from '../lib/importantMarks'

/**
 * 重要マークトグルボタン（☆）
 *
 * 設計書 v0.15 §2.3 Step 3 に基づく。クイズ問題ヘッダや公式午前II問題ヘッダの
 * 右上に配置し、ユーザがタップすることで重要マークの ON/OFF を切り替える。
 *
 * - sm: w-5 h-5（モバイル・ヘッダ右上向け）
 * - md: w-6 h-6（デスクトップ・通常向け、デフォルト）
 *
 * 状態：
 * - marked=true:  塗りつぶし（fill）+ brand 色
 * - marked=false: 輪郭のみ + slate-400
 *
 * 注意：内部 state を localStorage 値と同期するため `useEffect([questionId])`。
 *      Quiz セッション中に問題が切り替わる際にも追従する。
 */

interface Props {
  questionId: string
  size?: 'sm' | 'md'
  /** クリック時のコールバック（親で件数表示更新などに利用可） */
  onChange?: (marked: boolean) => void
}

export default function ImportantToggle({ questionId, size = 'md', onChange }: Props) {
  const [marked, setMarked] = useState<boolean>(false)

  useEffect(() => {
    setMarked(isImportant(questionId))
  }, [questionId])

  const handleClick = useCallback(() => {
    const next = toggleImportant(questionId)
    setMarked(next)
    onChange?.(next)
  }, [questionId, onChange])

  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={marked ? '重要マークを解除' : '重要マークを付ける'}
      aria-pressed={marked}
      title={marked ? '重要マーク解除' : '重要マーク'}
      className="p-1 rounded hover:bg-brand-light/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`${sizeClass} transition-colors ${
          marked ? 'fill-brand text-brand' : 'fill-none text-slate-400'
        }`}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  )
}
