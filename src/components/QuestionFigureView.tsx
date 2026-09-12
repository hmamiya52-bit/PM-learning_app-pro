import type { QuestionFigure } from '../types'

/**
 * 図表（SVG / table）の表示コンポーネント。
 *
 * 仕様:
 * - svg: viewBox で自動スケール、`max-w-full` でモバイル幅に追従
 *   ただし viewBox の幅を超えて拡大はしない（等倍が上限）。
 *   拡大すると SVG 内の font-size がそのまま倍率ぶん大きく描画され、
 *   本文（14px）より図の文字が大きくなってバランスが崩れるため。
 * - table: 横スクロール対応ラッパで12列以上の表もモバイルで閲覧可
 * - 共通: aria-label / caption をアクセシビリティのため必須/任意で受ける
 */

/** viewBox の幅（3番目の値）を取り出す。取れなければ null */
function viewBoxWidth(viewBox: string): number | null {
  const parts = viewBox.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  return parts[2] > 0 ? parts[2] : null
}

export function QuestionFigureView({ figure }: { figure: QuestionFigure }) {
  if (figure.type === 'svg') {
    const intrinsicWidth = viewBoxWidth(figure.viewBox)
    return (
      <figure className="my-4 flex flex-col items-center" aria-label={figure.ariaLabel}>
        <div className="w-full max-w-full overflow-x-auto">
          <svg
            viewBox={figure.viewBox}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={figure.ariaLabel}
            className={`block mx-auto w-full h-auto${intrinsicWidth ? '' : ' max-w-2xl'}`}
            style={intrinsicWidth ? { maxWidth: `${intrinsicWidth}px` } : undefined}
            dangerouslySetInnerHTML={{ __html: figure.content }}
          />
        </div>
        {figure.caption && (
          <figcaption className="text-[11px] text-slate-500 mt-1.5 text-center">
            {figure.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  // table
  const dataColCount = Math.max(0, figure.headers.length - (figure.rowHeaderFirstCol ? 1 : 0))
  const rowHeaderCharCount = figure.rowHeaderFirstCol
    ? Math.max(
        String(figure.headers[0] ?? '').length,
        ...figure.rows.map((row) => String(row[0] ?? '').length),
      )
    : 0
  const rowHeaderWidth =
    rowHeaderCharCount <= 3 ? '3.25rem' : dataColCount <= 1 ? '55%' : dataColCount <= 4 ? '40%' : '8rem'
  const tableMinWidth = dataColCount > 4 ? `${Math.max(32, 8 + dataColCount * 3.25)}rem` : undefined
  return (
    <figure className="my-4">
      {figure.caption && (
        <figcaption className="text-[11px] font-bold text-slate-700 mb-1.5">
          {figure.caption}
        </figcaption>
      )}
      <div className="w-full overflow-x-auto">
        <table
          className="w-full table-fixed border-collapse text-[11px] text-slate-800 leading-tight"
          style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
        >
          {figure.rowHeaderFirstCol && dataColCount > 0 && (
            <colgroup>
              <col style={{ width: rowHeaderWidth }} />
              {Array.from({ length: dataColCount }).map((_, i) => (
                <col key={i} style={{ width: `calc((100% - ${rowHeaderWidth}) / ${dataColCount})` }} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr>
              {figure.headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-slate-300 bg-slate-100 px-1 py-1 font-semibold text-center whitespace-normal break-words"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {figure.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isRowHeader = figure.rowHeaderFirstCol && ci === 0
                  const Tag = isRowHeader ? 'th' : 'td'
                  return (
                    <Tag
                      key={ci}
                      className={
                        isRowHeader
                          ? 'border border-slate-300 bg-slate-50 px-1 py-1 font-semibold text-left whitespace-normal break-words'
                          : 'border border-slate-300 px-1 py-1 text-center tabular-nums break-words'
                      }
                      style={isRowHeader ? { overflowWrap: 'anywhere' } : undefined}
                    >
                      {cell}
                    </Tag>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
