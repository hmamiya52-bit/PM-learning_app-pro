import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'

interface SyncQrScannerProps {
  active: boolean
  onScan: (value: string) => void
  onClose: () => void
}

export default function SyncQrScanner({ active, onScan, onClose }: SyncQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(true)

  useEffect(() => {
    if (!active || !videoRef.current) return

    let cancelled = false
    const reader = new BrowserQRCodeReader()

    async function startScanner() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia-unavailable')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const controls = await reader.decodeFromStream(stream, videoRef.current ?? undefined, (result, _err, scannerControls) => {
          if (scannerControls && !controlsRef.current) {
            controlsRef.current = scannerControls
          }
          if (result && !cancelled) {
            scannerControls.stop()
            controlsRef.current = null
            streamRef.current?.getTracks().forEach((track) => track.stop())
            streamRef.current = null
            onScan(result.getText())
          }
        })
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
        setIsStarting(false)
      } catch (e) {
        if (!cancelled) {
          const name = e instanceof DOMException ? e.name : ''
          const detail = name ? `（${name}）` : ''
          setError(`カメラを使用できません${detail}。同期文字列を貼り付けて読み込んでください。`)
          setIsStarting(false)
        }
      }
    }

    startScanner()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [active, onScan])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">QRコードを読み取る</h2>
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-800"
          >
            閉じる
          </button>
        </div>
        <div className="p-4 space-y-3">
          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : (
            <>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full aspect-square rounded-xl bg-slate-900 object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                {isStarting && (
                  <div className="absolute inset-0 rounded-xl bg-slate-900/70 flex items-center justify-center text-sm font-bold text-white">
                    カメラを起動しています...
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center">
                相手端末に表示された同期QRコードを枠内に映してください。
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
