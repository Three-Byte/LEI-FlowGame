import './GaugeRow.css'

interface GaugeItem {
  label: string
  value: number
}

interface GaugeRowProps {
  gauges: GaugeItem[]
  isOptimal: boolean
}

const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 175.93

export default function GaugeRow({ gauges, isOptimal }: GaugeRowProps) {
  return (
    <div className={`gauge-row${isOptimal ? ' gauge-row--optimal' : ''}`}>
      {gauges.map(gauge => {
        const offset = CIRCUMFERENCE * (1 - clamp(gauge.value, 0, 100) / 100)
        return (
          <div key={gauge.label} className="gauge-row__item">
            <svg
              className="gauge-row__svg"
              width="72"
              height="72"
              viewBox="0 0 72 72"
            >
              {/* Background track */}
              <circle
                className="gauge-track"
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                strokeWidth="6"
              />
              {/* Value arc */}
              <circle
                className="gauge-arc"
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                strokeWidth="6"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
              {/* Value label inside */}
              <text
                className="gauge-row__value-text"
                x="36"
                y="40"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
              >
                {Math.round(gauge.value)}
              </text>
            </svg>
            <span className="gauge-row__label">{gauge.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
