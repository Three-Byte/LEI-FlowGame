import './ExplanationCard.css'

interface ExplanationCardProps {
  lines: string[]
  isOptimal: boolean
}

export default function ExplanationCard({ lines, isOptimal }: ExplanationCardProps) {
  return (
    <div className={`explanation-card${isOptimal ? ' explanation-card--optimal' : ''}`}>
      <span className="explanation-card__heading">How did we do?</span>
      <ul className="explanation-card__list">
        {lines.map((line, i) => (
          <li key={i} className="explanation-card__line">{line}</li>
        ))}
      </ul>
    </div>
  )
}
