import type { GanttRow } from '../lib/simulation'
import './GanttChart.css'

interface GanttChartProps {
  rows: GanttRow[]
  totalDurationSec: number
  isOptimal: boolean
}

// Visual colors per sub-station
const BAR_COLORS: Record<GanttRow['station'], string> = {
  'Assembly-Grill': '#EA661E',
  'Assembly-Cold':  '#1DB4F3',
  'Bag Pack':       '#6F7582',
  'Bag Pack-Reorg': '#f96f4d',
}

const BAR_LABELS: Record<GanttRow['station'], string> = {
  'Assembly-Grill': 'Grill',
  'Assembly-Cold':  'Cold Prep',
  'Bag Pack':       'Bag Pack',
  'Bag Pack-Reorg': 'Reorg',
}

const LEGEND_ITEMS: GanttRow['station'][] = ['Assembly-Grill', 'Assembly-Cold', 'Bag Pack', 'Bag Pack-Reorg']

export default function GanttChart({ rows, totalDurationSec, isOptimal }: GanttChartProps) {
  const orderIds = [...new Set(rows.map(r => r.orderId))].sort((a, b) => a - b)
  const maxEnd = rows.reduce((max, r) => Math.max(max, r.startSec + r.durationSec), totalDurationSec)

  return (
    <div className={`gantt${isOptimal ? ' gantt--optimal' : ''}`}>

      {/* Legend */}
      <div className="gantt__legend">
        {LEGEND_ITEMS.map(s => (
          <span key={s} className="gantt__legend-item">
            <span className="gantt__legend-dot" style={{ backgroundColor: BAR_COLORS[s] }} />
            {BAR_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Two-row layout per order */}
      <div className="gantt__rows">
        {orderIds.map(orderId => {
          const assemblyRows = rows.filter(r => r.orderId === orderId && r.station.startsWith('Assembly'))
          const bagRows      = rows.filter(r => r.orderId === orderId && r.station.startsWith('Bag Pack'))

          return (
            <div key={orderId} className="gantt__order">
              <span className="gantt__order-label">#{orderId}</span>
              <div className="gantt__tracks">

                {/* Assembly row: Grill + Cold Prep sub-bars */}
                <div className="gantt__track-wrap">
                  <span className="gantt__track-label">Assembly</span>
                  <div className="gantt__track">
                    {assemblyRows.map(r => {
                      const left  = (r.startSec / maxEnd) * 100
                      const width = (r.durationSec / maxEnd) * 100
                      return (
                        <div
                          key={r.station}
                          className="gantt__bar"
                          style={{
                            left:  `${left}%`,
                            width: `${Math.max(width, 0.5)}%`,
                            backgroundColor: BAR_COLORS[r.station],
                          }}
                          title={`${BAR_LABELS[r.station]}: ${r.durationSec}s`}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Bag Pack row: base + optional reorg */}
                <div className="gantt__track-wrap">
                  <span className="gantt__track-label">Bag Pack</span>
                  <div className="gantt__track">
                    {bagRows.map(r => {
                      const left  = (r.startSec / maxEnd) * 100
                      const width = (r.durationSec / maxEnd) * 100
                      return (
                        <div
                          key={r.station}
                          className={`gantt__bar${r.station === 'Bag Pack-Reorg' ? ' gantt__bar--reorg' : ''}`}
                          style={{
                            left:  `${left}%`,
                            width: `${Math.max(width, 0.5)}%`,
                            backgroundColor: BAR_COLORS[r.station],
                          }}
                          title={`${BAR_LABELS[r.station]}: ${r.durationSec}s`}
                        />
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
