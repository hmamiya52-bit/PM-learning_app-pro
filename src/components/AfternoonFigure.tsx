import { MarkupText } from './MarkupText'
import type {
  AfternoonFigure as Figure,
  AfternoonDiagramNode,
  AfternoonDiagramEdge,
  AfternoonFigureAccent,
} from '../data/afternoonExplanations'

/** アクセント配色（関係図ノード／比較表の強調列） */
const ACCENT: Record<AfternoonFigureAccent, { fill: string; stroke: string; text: string }> = {
  brand: { fill: '#f6e9f2', stroke: '#9d5b8b', text: '#6b3a5e' },
  indigo: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
  emerald: { fill: '#d1fae5', stroke: '#0d9488', text: '#065f46' },
  amber: { fill: '#fef3c7', stroke: '#d97706', text: '#92400e' },
  rose: { fill: '#ffe4e6', stroke: '#e11d48', text: '#9f1239' },
  slate: { fill: '#f1f5f9', stroke: '#94a3b8', text: '#334155' },
}

/* ── 関係図（SVG）ジオメトリ ─────────────────────────── */
const NODE_W = 150
const NODE_H = 52
const GAP_X = 36
const GAP_Y = 46
const PAD = 12

function clipToBox(cx: number, cy: number, tx: number, ty: number) {
  // (cx,cy) のノード中心から (tx,ty) 方向へ進み、ノード矩形の境界で止めた点を返す
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const sx = NODE_W / 2 / Math.max(Math.abs(dx), 1e-6)
  const sy = NODE_H / 2 / Math.max(Math.abs(dy), 1e-6)
  const s = Math.min(sx, sy)
  return { x: cx + dx * s, y: cy + dy * s }
}

function Diagram({
  nodes,
  edges = [],
}: {
  nodes: AfternoonDiagramNode[]
  edges?: AfternoonDiagramEdge[]
}) {
  const maxCol = Math.max(...nodes.map((n) => n.col))
  const maxRow = Math.max(...nodes.map((n) => n.row))
  const cellW = NODE_W + GAP_X
  const cellH = NODE_H + GAP_Y
  const width = PAD * 2 + NODE_W + maxCol * cellW
  const height = PAD * 2 + NODE_H + maxRow * cellH

  const center = (n: AfternoonDiagramNode) => ({
    x: PAD + NODE_W / 2 + n.col * cellW,
    y: PAD + NODE_H / 2 + n.row * cellH,
  })
  const byId: Record<string, AfternoonDiagramNode> = {}
  nodes.forEach((n) => (byId[n.id] = n))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ height: 'auto', maxWidth: width, display: 'block', margin: '0 auto' }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      <defs>
        <marker
          id="afig-arrow"
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
        </marker>
      </defs>

      {/* エッジ（線） */}
      {edges.map((e, i) => {
        const a = byId[e.from]
        const b = byId[e.to]
        if (!a || !b) return null
        const ca = center(a)
        const cb = center(b)
        const start = clipToBox(ca.x, ca.y, cb.x, cb.y)
        const end = clipToBox(cb.x, cb.y, ca.x, ca.y)
        return (
          <line
            key={`e${i}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#64748b"
            strokeWidth={1.6}
            strokeDasharray={e.dashed ? '5 4' : undefined}
            markerEnd="url(#afig-arrow)"
            markerStart={e.bidirectional ? 'url(#afig-arrow)' : undefined}
          />
        )
      })}

      {/* ノード */}
      {nodes.map((n) => {
        const c = center(n)
        const col = ACCENT[n.accent ?? 'slate']
        const lines = n.label.split('\n')
        const startY = c.y - ((lines.length - 1) * 13) / 2
        return (
          <g key={n.id}>
            <rect
              x={c.x - NODE_W / 2}
              y={c.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={9}
              fill={col.fill}
              stroke={col.stroke}
              strokeWidth={1.6}
            />
            <text
              x={c.x}
              y={startY + 4}
              textAnchor="middle"
              fontSize={11.5}
              fontWeight={700}
              fill={col.text}
            >
              {lines.map((ln, li) => (
                <tspan key={li} x={c.x} dy={li === 0 ? 0 : 13}>
                  {ln}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}

      {/* エッジのラベル（ノードより前面に重ねる） */}
      {edges.map((e, i) => {
        if (!e.label) return null
        const a = byId[e.from]
        const b = byId[e.to]
        if (!a || !b) return null
        const ca = center(a)
        const cb = center(b)
        const start = clipToBox(ca.x, ca.y, cb.x, cb.y)
        const end = clipToBox(cb.x, cb.y, ca.x, ca.y)
        const mx = (start.x + end.x) / 2
        const my = (start.y + end.y) / 2
        const w = e.label.length * 11 + 8
        return (
          <g key={`l${i}`}>
            <rect
              x={mx - w / 2}
              y={my - 9}
              width={w}
              height={18}
              rx={4}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth={0.8}
            />
            <text
              x={mx}
              y={my + 4}
              textAnchor="middle"
              fontSize={10.5}
              fill="#475569"
              fontWeight={700}
            >
              {e.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function CompareTable({
  columns,
  rows,
  highlightCols = [],
}: {
  columns: string[]
  rows: { label: string; cells: string[] }[]
  highlightCols?: number[]
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full border-collapse text-[11.5px]">
        <thead>
          <tr>
            {columns.map((col, ci) => (
              <th
                key={ci}
                className={[
                  'border border-slate-200 px-2 py-1.5 font-bold text-left align-top leading-snug',
                  ci === 0
                    ? 'bg-slate-100 text-slate-600'
                    : highlightCols.includes(ci)
                      ? 'bg-brand-light text-brand-dark'
                      : 'bg-indigo-50 text-indigo-800',
                ].join(' ')}
              >
                <MarkupText text={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              <th
                scope="row"
                className="border border-slate-200 px-2 py-1.5 font-bold text-left align-top bg-slate-50 text-slate-600 leading-snug"
              >
                <MarkupText text={r.label} />
              </th>
              {r.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className={[
                    'border border-slate-200 px-2 py-1.5 align-top text-slate-700 leading-snug',
                    highlightCols.includes(ci + 1) ? 'bg-brand-light/40' : '',
                  ].join(' ')}
                >
                  <MarkupText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 図表1つを描画（比較表 or 関係図） */
export function AfternoonFigureView({ figure }: { figure: Figure }) {
  return (
    <figure className="rounded-lg border border-slate-200 bg-white px-3 py-3">
      <figcaption className="text-[12px] font-black text-indigo-800 mb-2 flex items-center gap-1.5">
        <span className="text-[10px]">{figure.kind === 'compare' ? '📊' : '🔗'}</span>
        {figure.title}
      </figcaption>
      {figure.kind === 'compare' ? (
        <CompareTable columns={figure.columns} rows={figure.rows} highlightCols={figure.highlightCols} />
      ) : (
        <Diagram nodes={figure.nodes} edges={figure.edges} />
      )}
      {figure.note && (
        <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
          <MarkupText text={figure.note} />
        </p>
      )}
    </figure>
  )
}
