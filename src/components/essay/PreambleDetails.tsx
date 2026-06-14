/**
 * 問題文（冒頭）の折りたたみ表示。
 *
 * IPA 問題文の前置き（preamble, 教育引用枠）を `<details>` で既定折りたたみ表示する。
 * 参考答案ページ（EssaySampleAnswerView）と解答画面（EssayTraining）で共通利用。
 */
export function PreambleDetails({ preamble }: { preamble: string }) {
  return (
    <details className="bg-white border border-slate-200 rounded-xl group">
      <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">問題文（冒頭）を読む</span>
        <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="px-4 pb-4 border-t border-slate-100">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pt-2">{preamble}</p>
      </div>
    </details>
  )
}

export default PreambleDetails
