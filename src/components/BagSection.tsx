import type { ReactNode } from 'react'
import './BagSection.css'

interface BagSectionProps {
  maxUnits: string
  icon: ReactNode
}

export default function BagSection({ maxUnits, icon }: BagSectionProps) {
  return (
    <div className="bag-section">
      <div className="bag-section__header">
        <span className="bag-section__title">Bag Max: </span>
        <span className="bag-section__count">{maxUnits}</span>
      </div>

      <div className="bag-section__content">
        <div className="bag-section__icon-col">
          <div className="bag-section__icon-box">
            {icon}
          </div>
          <span className="bag-section__label">Bag</span>
        </div>
      </div>
    </div>
  )
}
