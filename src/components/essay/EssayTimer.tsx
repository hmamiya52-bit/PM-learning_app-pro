/**
 * 論述タイマー（HH:MM:SS 表示 + スタート/一時停止/再開ボタン）
 *
 * 設計書 v0.15 §2.6 line 1253 / basic_design §6.5.2 に従う。
 * setInterval ロジックは親（EssayTraining）に持たせ、本コンポーネントは
 * 「現在の経過秒・動作状態」を受け取って表示・ボタン発火するだけにする。
 */

interface Props {
  elapsedSec: number
  running: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
}

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function EssayTimer({ elapsedSec, running, onStart, onPause, onResume }: Props) {
  const isStarted = elapsedSec > 0 || running

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-4">
      <span className="text-2xl font-mono font-bold text-slate-800 tabular-nums">
        {fmt(elapsedSec)}
      </span>
      <div className="flex gap-2">
        {!isStarted ? (
          <button
            type="button"
            onClick={onStart}
            className="text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded px-3 py-1.5 transition-colors"
          >
            ▶ 開始
          </button>
        ) : running ? (
          <button
            type="button"
            onClick={onPause}
            className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded px-3 py-1.5 transition-colors"
          >
            ⏸ 一時停止
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded px-3 py-1.5 transition-colors"
          >
            ▶ 再開
          </button>
        )}
      </div>
      {!isStarted && (
        <p className="text-[10px] text-slate-400 ml-auto">解答開始前にタイマーを動かすか、入力で自動開始</p>
      )}
    </div>
  )
}
