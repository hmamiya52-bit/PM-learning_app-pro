import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SyncPreview from '../components/sync/SyncPreview'
import SyncQrDisplay from '../components/sync/SyncQrDisplay'
import SyncQrScanner from '../components/sync/SyncQrScanner'
import { decodeSyncString } from '../lib/sync/codec'
import { loadSyncMeta } from '../lib/sync/device'
import { applySyncPackage, buildImportPreview } from '../lib/sync/merge'
import { createSyncPackage, type CreatedSyncPackage } from '../lib/sync/package'
import type { ImportPreview, ImportResult, SyncPackage } from '../lib/sync/types'

type GeneratedKind = 'send' | 'return'
type DeviceRole = 'phone' | 'pc'

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!copied) {
    throw new Error('copy-failed')
  }
}

async function shareOrCopySyncText(text: string): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'PC・スマホ同期データ',
        text,
      })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
    }
  }

  await copyTextToClipboard(text)
  return 'copied'
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

function formatLastSyncAt(value: string | undefined): string {
  if (!value) return '----/--/-- --:--'
  return formatDate(value)
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (message === 'copy-failed') {
    return '同期文字列をコピーできませんでした。下の同期文字列を選択してコピーしてください。'
  }
  if (message === 'unsupported-version') {
    return 'この同期データは現在のアプリでは読み込めません。アプリを最新版に更新してください。'
  }
  if (message === 'checksum-mismatch') {
    return '同期データが破損している可能性があります。もう一度同期データを作成してください。'
  }
  return '同期データを読み込めませんでした。文字列が正しいか確認してください。'
}

export default function DeviceSync() {
  const navigate = useNavigate()
  const [sendGenerated, setSendGenerated] = useState<CreatedSyncPackage | null>(null)
  const [returnGenerated, setReturnGenerated] = useState<CreatedSyncPackage | null>(null)
  const [input, setInput] = useState('')
  const [pendingPackage, setPendingPackage] = useState<SyncPackage | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const [copiedTarget, setCopiedTarget] = useState<GeneratedKind | null>(null)
  const [sharedTarget, setSharedTarget] = useState<GeneratedKind | null>(null)
  const [shareCopiedTarget, setShareCopiedTarget] = useState<GeneratedKind | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [deviceRole, setDeviceRole] = useState<DeviceRole | null>(null)
  const [busy, setBusy] = useState(false)
  const [autoSendRequested, setAutoSendRequested] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(() => loadSyncMeta().lastImportedAt)

  const shouldOfferReturn = deviceRole === 'pc' && Boolean(result && pendingPackage && !pendingPackage.targetVector)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleSelectRole = useCallback((role: DeviceRole) => {
    setDeviceRole(role)
    setInput('')
    setPendingPackage(null)
    setPreview(null)
    setResult(null)
    setError('')
    setSendGenerated(null)
    setReturnGenerated(null)
    setCopiedTarget(null)
    setSharedTarget(null)
    setShareCopiedTarget(null)
    setAutoSendRequested(false)
  }, [])

  const handleResetRole = useCallback(() => {
    setDeviceRole(null)
    setInput('')
    setPendingPackage(null)
    setPreview(null)
    setResult(null)
    setError('')
    setSendGenerated(null)
    setReturnGenerated(null)
    setCopiedTarget(null)
    setSharedTarget(null)
    setShareCopiedTarget(null)
    setAutoSendRequested(false)
  }, [])

  const handleCreate = useCallback(async (kind: GeneratedKind, targetPackage?: Pick<SyncPackage, 'baseVector' | 'fromVector' | 'state'>) => {
    setBusy(true)
    setError('')
    setCopiedTarget(null)
    setSharedTarget(null)
    setShareCopiedTarget(null)
    try {
      const created = await createSyncPackage(targetPackage)
      if (kind === 'send') {
        setSendGenerated(created)
      } else {
        setReturnGenerated(created)
      }
    } catch (e) {
      setScannerOpen(false)
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (deviceRole !== 'phone' || sendGenerated || busy || autoSendRequested) return
    setAutoSendRequested(true)
    void handleCreate('send')
  }, [autoSendRequested, busy, deviceRole, handleCreate, sendGenerated])

  const handleReadText = useCallback(async (text: string) => {
    setBusy(true)
    setError('')
    setResult(null)
    setReturnGenerated(null)
    try {
      const pkg = await decodeSyncString(text)
      const nextPreview = buildImportPreview(pkg)
      setPendingPackage(pkg)
      setPreview(nextPreview)
      setInput(text)
      setScannerOpen(false)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }, [])

  const handleConfirmImport = useCallback(() => {
    if (!pendingPackage) return
    setError('')
    try {
      const imported = applySyncPackage(pendingPackage)
      setResult(imported)
      setLastSyncAt(loadSyncMeta().lastImportedAt)
      setPreview(null)
      setReturnGenerated(null)
      if (deviceRole === 'pc' && !pendingPackage.targetVector) {
        void handleCreate('return', pendingPackage)
      }
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [deviceRole, handleCreate, pendingPackage])

  const handleCopy = useCallback(async (generated: CreatedSyncPackage, kind: GeneratedKind) => {
    setError('')
    try {
      await copyTextToClipboard(generated.text)
      setCopiedTarget(kind)
    } catch (e) {
      setCopiedTarget(null)
      setError(errorMessage(e))
    }
  }, [])

  const handleShare = useCallback(async (generated: CreatedSyncPackage, kind: GeneratedKind) => {
    setError('')
    setSharedTarget(null)
    setShareCopiedTarget(null)
    try {
      const result = await shareOrCopySyncText(generated.text)
      if (result === 'shared') {
        setSharedTarget(kind)
      } else if (result === 'copied') {
        setCopiedTarget(kind)
        setShareCopiedTarget(kind)
      }
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
            aria-label="前の画面へ戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="font-bold text-sm">PC・スマホ同期</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-16 space-y-5">
        <IntroSection lastSyncAt={lastSyncAt} />

        <UsageGuide
          open={showGuide}
          onToggle={() => setShowGuide((prev) => !prev)}
        />

        <RoleSelector
          selectedRole={deviceRole}
          onSelect={handleSelectRole}
          onReset={handleResetRole}
        />

        {deviceRole === 'phone' && (
          <>
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StepBadge step="STEP 1" />
                  <h1 className="text-xl font-bold text-slate-900">スマホの同期データを作成</h1>
                </div>
                <DeviceBadge label="スマホ側" />
              </div>
              {sendGenerated && (
                <GeneratedSyncData
                  generated={sendGenerated}
                  copied={copiedTarget === 'send'}
                  shared={sharedTarget === 'send'}
                  shareCopied={shareCopiedTarget === 'send'}
                  onCopy={() => handleCopy(sendGenerated, 'send')}
                  onShare={() => handleShare(sendGenerated, 'send')}
                  note="同期用QRコード①をPC側のSTEP 2で読み取ってください。"
                  qrLabel="同期用QRコード①"
                  fallbackLabel="PCでQRコードが読み取れないとき（同期文字列の生成）"
                />
              )}
              {!sendGenerated && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
                  {busy || !autoSendRequested ? (
                    '同期データを作成中...'
                  ) : (
                    <div className="space-y-3">
                      <p>同期用QRコード①を作成できませんでした。</p>
                      <button
                        onClick={() => {
                          void handleCreate('send')
                        }}
                        className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                      >
                        もう一度作成する
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <OtherDeviceNotice
              lines={[
                'STEP2: PC側で操作（同期用QRコード①の読み込み）',
                'STEP3: PC側で操作（同期用QRコード②の生成）',
              ]}
            />

            <ImportStepSection
              step="STEP 4"
              title="同期用QRコード②を読み込む"
              description={[
                'PC側のSTEP 3で同期用QRコード②が表示されたら、スマホ側で読み取ります。',
                'これでスマホにもPC側の学習データが入ります。',
              ]}
              badgeLabel="スマホ側"
              scanButtonLabel="同期用QRコード②を読み取る（カメラ起動）"
              input={input}
              busy={busy}
              onInputChange={setInput}
              onOpenScanner={() => setScannerOpen(true)}
              onReadText={handleReadText}
            />
          </>
        )}

        {deviceRole === 'pc' && (
          <>
            {!result && (
              <OtherDeviceNotice
                title="先にスマホ側のSTEP 1を完了してください"
                text="スマホ側に表示された同期QRコード、または同期文字列を用意してから進めます。"
              />
            )}
            {!result && (
              <ImportStepSection
                step="STEP 2"
                title="スマホの同期データを読み込む"
                description={[
                  'スマホ側のSTEP 1で表示された同期用QRコード①をPC側で読み取ります。',
                  'カメラが使えない場合は、同期文字列を貼り付けてください。',
                ]}
                badgeLabel="PC側"
                scanButtonLabel="同期用QRコード①を読み取る（カメラ起動）"
                input={input}
                busy={busy}
                onInputChange={setInput}
                onOpenScanner={() => setScannerOpen(true)}
                onReadText={handleReadText}
              />
            )}
          </>
        )}

        {deviceRole && preview && (
          <SyncPreview
            preview={preview}
            onConfirm={handleConfirmImport}
            onCancel={() => {
              setPreview(null)
              setPendingPackage(null)
            }}
          />
        )}

        {deviceRole && result && (
          <>
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {shouldOfferReturn ? 'STEP 1・STEP 2が完了しました' : 'データを統合しました'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {shouldOfferReturn
                    ? 'スマホからのデータを統合しました。'
                    : 'これでこの端末にも相手側の学習データが入りました。'}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <Info label="XP更新" value={`${result.newEventCount}件`} />
                <Info label="午後記録" value={`${result.addedAfternoonRecordCount}件`} />
                <Info label="追加XP" value={`${result.addedXp.toLocaleString()} XP`} />
                <Info label="勲章" value={`${result.addedBadgeCount}個`} />
              </div>
            </section>
            {shouldOfferReturn && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <StepBadge step="STEP 3" />
                      <p className="text-sm text-slate-600">
                        PC側の学習データをスマホ側に連携するため、同期用QRコード②を表示します。
                      </p>
                    </div>
                    <DeviceBadge label="PC側" />
                  </div>
                </div>
                {returnGenerated && (
                  <GeneratedSyncData
                    generated={returnGenerated}
                    copied={copiedTarget === 'return'}
                    shared={sharedTarget === 'return'}
                    shareCopied={shareCopiedTarget === 'return'}
                    onCopy={() => handleCopy(returnGenerated, 'return')}
                    onShare={() => handleShare(returnGenerated, 'return')}
                    note="同期用QRコード②をスマホ側のSTEP 4で読み取ってください。"
                    qrLabel="同期用QRコード②"
                    fallbackLabel="スマホでQRコードが読み取れないとき（同期文字列の生成）"
                  />
                )}
                {!returnGenerated && (
                  <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700">
                    同期用QRコード②を作成中...
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
      </main>

      {scannerOpen && (
        <SyncQrScanner
          active
          onClose={() => setScannerOpen(false)}
          onScan={handleReadText}
        />
      )}
    </div>
  )
}

function IntroSection({ lastSyncAt }: { lastSyncAt: string | undefined }) {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">
          最終同期日時：{formatLastSyncAt(lastSyncAt)}
        </p>
        {!lastSyncAt && (
          <p className="text-xs font-bold text-red-500 mb-2">
            初回のQRコードは非常に読み取りづらいので、文字列コピペを推奨。二回目から多少読み取りやすくなります。
          </p>
        )}
        <h1 className="text-xl font-bold text-slate-900">PC＆スマホの学習記録連携</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          PC版アプリとスマホ版アプリのそれぞれの学習状況を、QRコードまたは同期文字列で統合します。
        </p>
      </div>
    </section>
  )
}

function UsageGuide({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-bold text-slate-900">使い方</span>
          <span className="block text-xs text-slate-500 mt-0.5">スマホ → PC → スマホの順に進めます</span>
        </span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true">›</span>
      </button>

      {open && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4 space-y-4 text-sm text-slate-700">
          <FlowSummary />
          <div className="rounded-lg bg-white border border-blue-100 px-3 py-2 text-xs text-slate-500 leading-relaxed">
            スマホ側ではSTEP 1の後にPC側の作業を待ちます。PC側ではスマホ側のSTEP 1が終わってからSTEP 2を開始します。
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-white border border-blue-100 px-3 py-2">
              <h2 className="font-bold text-slate-900 mb-1">同期される記録</h2>
              <p className="text-xs leading-relaxed">
                問題の正解記録、午後問題の点数記録、日別XP、経験値、勲章
              </p>
            </div>
            <div className="rounded-lg bg-white border border-blue-100 px-3 py-2">
              <h2 className="font-bold text-slate-900 mb-1">同期しない記録</h2>
              <p className="text-xs leading-relaxed">
                ノート理解度、午後問題の次回計画日、午後問題の解答欄、ログイン状態、画面の開閉状態
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function RoleSelector({
  selectedRole,
  onSelect,
  onReset,
}: {
  selectedRole: DeviceRole | null
  onSelect: (role: DeviceRole) => void
  onReset: () => void
}) {
  if (selectedRole) {
    const label = selectedRole === 'phone' ? 'スマホ側' : 'PC側'
    const description = selectedRole === 'phone'
      ? 'STEP 1で同期用QRコード①を作り、PC側の作業後にSTEP 4で同期用QRコード②を読み込みます。'
      : ''

    return (
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{label}の操作を表示中</h1>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onReset}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white"
          >
            選び直す
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-5">
      <div>
        <p className="text-xs font-bold text-blue-600 mb-1">端末選択</p>
        <h1 className="text-xl font-bold text-slate-900">この端末はどちらですか？</h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={() => onSelect('phone')}
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-left hover:bg-blue-100 transition-colors"
        >
          <span className="block text-base font-bold text-blue-900">スマホ側</span>
          <span className="block text-sm text-blue-800 mt-1">
            最初に同期用QRコード①を作り、最後に同期用QRコード②を読み込みます。
          </span>
        </button>
        <button
          onClick={() => onSelect('pc')}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-left hover:bg-indigo-100 transition-colors"
        >
          <span className="block text-base font-bold text-indigo-900">PC側</span>
          <span className="block text-sm text-indigo-800 mt-1">
            同期用QRコード①を読み込み、同期用QRコード②を作ります。
          </span>
        </button>
      </div>
    </section>
  )
}

function FlowSummary() {
  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
      <h2 className="text-sm font-bold text-slate-900 mb-2">同期の順番</h2>
      <ol className="space-y-2 text-sm text-slate-700">
        <GuideStep number="1" text="スマホ側で同期データを作成" />
        <GuideStep number="2" text="PC側で同期用QRコード①を読み込み" />
        <GuideStep number="3" text="PC側で同期用QRコード②を作成" />
        <GuideStep number="4" text="スマホ側で同期用QRコード②を読み込み" />
      </ol>
    </div>
  )
}

function StepBadge({ step }: { step: string }) {
  return (
    <p className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-sm font-bold text-blue-700 mb-2">
      {step}
    </p>
  )
}

function OtherDeviceNotice({
  title,
  text,
  lines,
}: {
  title?: string
  text?: string
  lines?: string[]
}) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      {title && <p className="text-sm font-bold text-amber-900">{title}</p>}
      {text && <p className="text-xs text-amber-800 leading-relaxed mt-1">{text}</p>}
      {lines && (
        <div className="space-y-1 mt-2">
          {lines.map((line) => (
            <p key={line} className="text-xs font-bold text-amber-800 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}

function ImportStepSection({
  step,
  title,
  description,
  badgeLabel,
  scanButtonLabel,
  input,
  busy,
  onInputChange,
  onOpenScanner,
  onReadText,
}: {
  step: string
  title: string
  description: string[]
  badgeLabel: string
  scanButtonLabel: string
  input: string
  busy: boolean
  onInputChange: (value: string) => void
  onOpenScanner: () => void
  onReadText: (value: string) => void
}) {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StepBadge step={step} />
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {description.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <DeviceBadge label={badgeLabel} />
      </div>
      <button
        onClick={onOpenScanner}
        className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
      >
        {scanButtonLabel}
      </button>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="QRコードが読み取れない場合は、同期文字列を貼り付けてください。"
        className="w-full h-32 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        onClick={() => onReadText(input)}
        disabled={!input.trim() || busy}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        内容を確認
      </button>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 border border-slate-100 px-2 sm:px-3 py-2">
      <p className="text-[10px] sm:text-[11px] leading-tight text-slate-400 whitespace-nowrap">{label}</p>
      <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight mt-1">{value}</p>
    </div>
  )
}

function ArrowHint({ text, centered = false }: { text: string; centered?: boolean }) {
  return (
    <p className={`flex items-start gap-2 text-xs font-bold text-slate-600 ${centered ? 'justify-center text-center' : ''}`}>
      <span className="text-base leading-none text-blue-600" aria-hidden="true">↓</span>
      <span className="leading-relaxed">{text}</span>
      {centered && <span className="text-base leading-none text-blue-600" aria-hidden="true">↓</span>}
    </p>
  )
}

function DeviceBadge({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
      {label}
    </span>
  )
}

function GeneratedSyncData({
  generated,
  copied,
  shared,
  shareCopied,
  onCopy,
  onShare,
  note,
  qrLabel,
  fallbackLabel,
}: {
  generated: CreatedSyncPackage
  copied: boolean
  shared: boolean
  shareCopied: boolean
  onCopy: () => void
  onShare: () => void
  note: string
  qrLabel: string
  fallbackLabel: string
}) {
  const summary = generated.pkg.summary
  const [fallbackOpen, setFallbackOpen] = useState(false)

  return (
    <div className="border-t border-slate-200 pt-4 space-y-4">
      <div>
        <p className="text-sm text-slate-500">
          作成日時: {formatDate(generated.pkg.createdAt)}
        </p>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-sm">
        <Info label="イベント" value={`${summary.eventCount}件`} />
        <Info label="問題記録" value={`${summary.answerRecordCount}件`} />
        <Info label="午後記録" value={`${summary.afternoonRecordCount}件`} />
        <Info label="日別XP" value={`${summary.dailyXpDayCount}日`} />
        <Info label="XP" value={`${summary.xpTotalInPayload.toLocaleString()}`} />
      </div>
      <ArrowHint text={note} centered />
      <div className="space-y-2">
        <SyncQrDisplay value={generated.text} />
        <p className="text-center text-sm font-bold text-blue-700">{qrLabel}</p>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => setFallbackOpen((prev) => !prev)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          aria-expanded={fallbackOpen}
        >
          {fallbackLabel}
        </button>
        {fallbackOpen && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              QRコードで同期できる場合は、この操作は不要です。読み取れない場合だけ、同期文字列を共有またはコピーして相手の端末に貼り付けてください。
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                onClick={onShare}
                className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50"
              >
                {shared ? '共有を開きました' : shareCopied ? 'コピーしました' : '他のアプリで共有'}
              </button>
              <button
                onClick={onCopy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white"
              >
                {copied ? 'コピーしました' : '同期文字列をコピー'}
              </button>
            </div>
            {shareCopied && (
              <p className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800 leading-relaxed">
                この端末では共有画面を開けなかったため、同期文字列をコピーしました。LINEやメールに貼り付けて送ってください。
              </p>
            )}
            <textarea
              readOnly
              value={generated.text}
              className="w-full h-28 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function GuideStep({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex gap-2">
      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <span className="leading-relaxed pt-0.5">{text}</span>
    </li>
  )
}
