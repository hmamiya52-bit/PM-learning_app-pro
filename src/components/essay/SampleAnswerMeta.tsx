import { MarkupText } from '../MarkupText'
import type { EssaySampleAnswer } from '../../data/essaySampleAnswers'

/**
 * 参考答案の解説3ブロック（設計の意図／ありがちな失点／さらに高評価を得るためのポイント）。
 *
 * 参考答案ページ（EssaySampleAnswerView）と提出後リビュー（EssayAttemptDetail）で
 * 共通利用する。`==赤==`/`__navy__` は MarkupText で描画。
 * - compact=false（既定）: 参考答案ページ用（やや大きめ・rounded-xl/p-4）
 * - compact=true: リビュー内（details の中）用（小さめ・rounded-lg/p-3）
 */
export function SampleAnswerMeta({
  sample,
  compact = false,
}: {
  sample: EssaySampleAnswer
  compact?: boolean
}) {
  const pad = compact ? 'rounded-lg p-3' : 'rounded-xl p-4'
  const bodyText = compact ? 'text-[13px]' : 'text-sm'
  const listGap = compact ? 'space-y-1.5' : 'space-y-2'

  return (
    <>
      {/* 設計の意図 */}
      <div className={pad} style={{ backgroundColor: '#faf5f9' }}>
        <p className={`text-xs font-bold ${compact ? 'mb-1' : 'mb-1.5'}`} style={{ color: '#9d5b8b' }}>
          設計の意図
        </p>
        <p className={`${bodyText} text-slate-700 leading-relaxed whitespace-pre-wrap`}>
          <MarkupText text={sample.designNote} />
        </p>
      </div>

      {/* ありがちな失点 */}
      {sample.pitfalls.length > 0 && (
        <div className={`${pad} bg-rose-50 border border-rose-100`}>
          <p className={`text-xs font-bold text-rose-700 ${compact ? 'mb-1.5' : 'mb-2'}`}>ありがちな失点</p>
          <ul className={listGap}>
            {sample.pitfalls.map((pf, i) => (
              <li key={i} className={`${bodyText} text-slate-700 leading-relaxed flex gap-1.5`}>
                <span className="text-rose-400 flex-shrink-0" aria-hidden="true">•</span>
                <span><MarkupText text={pf} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* さらに高評価を得るためのポイント（IPA採点者視点） */}
      {sample.scoringTips && sample.scoringTips.length > 0 && (
        <div className={`${pad} bg-emerald-50 border border-emerald-100`}>
          <p className="text-xs font-bold text-emerald-800 mb-0.5">さらに高評価を得るためのポイント</p>
          <p className={`text-[10px] text-emerald-600 ${compact ? 'mb-1.5' : 'mb-2'}`}>
            IPA採点者の視点で、この答案をより上位の評価へ近づける着眼点です。
          </p>
          <ul className={listGap}>
            {sample.scoringTips.map((tip, i) => (
              <li key={i} className={`${bodyText} text-slate-700 leading-relaxed flex gap-1.5`}>
                <span className="text-emerald-500 flex-shrink-0" aria-hidden="true">▲</span>
                <span><MarkupText text={tip} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default SampleAnswerMeta
