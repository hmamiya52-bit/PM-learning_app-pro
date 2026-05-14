import type { ImportPreview } from '../../lib/sync/types'

interface SyncPreviewProps {
  preview: ImportPreview
  onConfirm: () => void
  onCancel: () => void
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function SyncPreview({ preview, onConfirm, onCancel }: SyncPreviewProps) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-4">
      <div>
        <p className="text-xs font-bold text-indigo-500 mb-1">読み込み前の確認</p>
        <h2 className="text-lg font-bold text-slate-900">この同期データを取り込みますか？</h2>
        <p className="text-xs text-slate-500 mt-1">
          作成端末: <span className="font-mono">{preview.fromDeviceId}</span>
          <span className="mx-2">/</span>
          {formatDate(preview.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Info label="XP更新" value={`${preview.newEventCount}件`} />
        <Info label="スキップ" value={`${preview.skippedEventCount}件`} />
        <Info label="問題記録" value={`${preview.addedAnswerRecordCount}件`} />
        <Info label="午後記録" value={`${preview.addedAfternoonRecordCount}件`} />
        <Info label="日別XP" value={`${preview.updatedDailyXpDayCount}日`} />
        <Info label="追加XP" value={`${preview.addedXp.toLocaleString()} XP`} />
        <Info label="追加勲章" value={`${preview.addedBadgeCount}個`} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          キャンセル
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          同期する
        </button>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 border border-white/80">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  )
}
