import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface SyncQrDisplayProps {
  value: string
}

export default function SyncQrDisplay({ value }: SyncQrDisplayProps) {
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'L',
      margin: 4,
      width: 360,
    })
      .then((url) => {
        if (!cancelled) {
          setError('')
          setDataUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('')
          setError('同期データが大きいためQRコードを作成できませんでした。同期文字列を使用してください。')
        }
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {error}
      </div>
    )
  }

  if (!dataUrl) {
    return (
      <div className="mx-auto h-[min(360px,calc(100vw-48px))] max-h-[360px] w-full max-w-[360px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-400">
        QRコードを作成しています...
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <img
        src={dataUrl}
        alt="同期用QRコード"
        className="aspect-square w-full max-w-[360px] rounded-xl border border-slate-200 bg-white shadow-sm"
      />
    </div>
  )
}
