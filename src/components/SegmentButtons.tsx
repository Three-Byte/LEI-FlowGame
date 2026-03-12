import { useState } from 'react'
import './SegmentButtons.css'

interface SegmentButtonsProps {
  tabs: string[]
  active: string
  onTabChange?: (tab: string) => void
}

export default function SegmentButtons({ tabs, active: defaultActive, onTabChange }: SegmentButtonsProps) {
  const [active, setActive] = useState(defaultActive)

  function handleClick(tab: string) {
    setActive(tab)
    onTabChange?.(tab)
  }

  return (
    <div className="segment-container">
      <div className="segment-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`segment-btn ${active === tab ? 'segment-btn--active' : ''}`}
            onClick={() => handleClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
