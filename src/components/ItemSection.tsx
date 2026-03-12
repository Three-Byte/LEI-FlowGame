import type { ReactNode, PointerEvent } from 'react'
import './ItemSection.css'

interface Item {
  name: string
  priority: number
}

interface ItemSectionProps {
  title: string
  count: string
  items: Item[]
  icon: ReactNode
  isDragOver: boolean
  onHandlePointerDown: (e: PointerEvent<HTMLDivElement>) => void
}

interface DragHandleProps {
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void
}

function DragHandle({ onPointerDown }: DragHandleProps) {
  return (
    <div
      className="drag-handle"
      onPointerDown={onPointerDown}
    >
      <span className="drag-handle__line" />
      <span className="drag-handle__line" />
    </div>
  )
}

export default function ItemSection({
  title,
  count,
  items,
  icon,
  isDragOver,
  onHandlePointerDown,
}: ItemSectionProps) {
  return (
    <div className={`item-section${isDragOver ? ' item-section--drag-over' : ''}`}>
      <div className="item-section__title-row">
        <div className="item-section__title-text">
          <span className="item-section__title">{title} : </span>
          <span className="item-section__count">{count}</span>
        </div>
        <DragHandle onPointerDown={onHandlePointerDown} />
      </div>

      <div className="item-section__units">
        {items.map((item, i) => (
          <div key={i} className="item-card">
            <div className="item-card__icon-box">
              {icon}
            </div>
            <div className="item-card__info">
              <span className="item-card__name">{item.name}</span>
              <span className="item-card__priority">Priority: {item.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
