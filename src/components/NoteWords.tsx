// ─────────────────────────────────────────────
// ノート本文の強調ワード コンポーネント
//
// 2026-07-20: NoteDetail.tsx から抽出。午後Ⅰ定石一覧（AfternoonTips）でも
// 同じ赤字マスク／ネイビー強調を使うため共通化した。
// 描画ヘルパー（renderText / renderTokens）は NoteMarkup.tsx 側にある
// （Fast Refresh の制約でコンポーネントと関数を同居させない）。
// ─────────────────────────────────────────────
import { useState, useEffect, useContext, useId } from 'react'
import { MaskProgressContext } from './noteMaskProgress'

// ─────────────────────────────────────────────
// 赤字ワードのトグルコンポーネント
// ─────────────────────────────────────────────
interface RedWordProps {
  text: string
  masked: boolean
  version: number // この値が変わると revealed がリセットされる
}

export function RedWord({ text, masked, version }: RedWordProps) {
  const [revealed, setRevealed] = useState(false)
  const progress = useContext(MaskProgressContext)
  const instanceId = useId()

  // マスクモードが再度 ON になったらリセット
  useEffect(() => {
    if (masked) setRevealed(false)
  }, [masked, version])

  // 開封状況を集計コンテキストへ通知（Provider が無ければ何もしない）
  useEffect(() => {
    progress?.report(instanceId, masked, revealed)
  }, [progress, instanceId, masked, revealed])

  useEffect(() => {
    if (!progress) return
    return () => progress.unregister(instanceId)
  }, [progress, instanceId])

  if (!masked) {
    return <span className="text-red-600 font-bold">{text}</span>
  }
  if (revealed) {
    return (
      <span
        role="button"
        tabIndex={0}
        className="text-red-600 font-bold cursor-pointer underline decoration-dotted"
        title="クリックで再び隠す"
        onClick={() => setRevealed(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(false) } }}
      >
        {text}
      </span>
    )
  }
  return (
    <span
      role="button"
      tabIndex={0}
      className="rounded px-0.5 cursor-pointer select-none"
      style={{ backgroundColor: '#c0392b', color: 'transparent' }}
      title="クリックで表示"
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRevealed(true) } }}
    >
      {text}
    </span>
  )
}

// ─────────────────────────────────────────────
// ネイビー強調（隠す機能なし）
// ─────────────────────────────────────────────
export function NavyWord({ text }: { text: string }) {
  return (
    <span className="font-bold" style={{ color: '#9d5b8b' }}>
      {text}
    </span>
  )
}
