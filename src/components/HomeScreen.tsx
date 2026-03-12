import React, { useState, useRef, useCallback, useEffect, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomeScreen.css'
import Header from './Header'
import SegmentButtons from './SegmentButtons'
import ItemSection from './ItemSection'
import BagSection from './BagSection'
import { type PriorityOrder } from '../lib/simulation'
import sandwichSrc from '../assets/icons/icon-sandwiches.svg'
import hotSideSrc from '../assets/icons/icon-hotSides.svg'
import coldSideSrc from '../assets/icons/icon-coldSides.svg'
import saladSrc from '../assets/icons/icon-salad.svg'
import bagSrc from '../assets/icons/icon-bag.svg'

function SandwichIcon() {
  return <img src={sandwichSrc} alt="sandwich" width={32} height={24} />
}

function HotSideIcon() {
  return <img src={hotSideSrc} alt="hot side" width={30} height={25} />
}

function ColdSideIcon() {
  return <img src={coldSideSrc} alt="cold side" width={30} height={25} />
}

function SaladIcon() {
  return <img src={saladSrc} alt="salad" width={36} height={18} />
}

function BagIcon() {
  return <img src={bagSrc} alt="bag" width={71} height={81} />
}

interface SectionItem {
  name: string
}

interface Section {
  id: string
  title: string
  count: string
  Icon: () => React.ReactElement
  items: SectionItem[]
  priority: number
}

type SectionWithoutPriority = Omit<Section, 'priority'>

const INITIAL_SECTIONS: SectionWithoutPriority[] = [
  {
    id: 'salads',
    title: 'Salads',
    count: '12 units',
    Icon: SaladIcon,
    items: [
      { name: 'Salad 1' },
      { name: 'Salad 2' },
    ],
  },
  {
    id: 'sandwiches',
    title: 'Sandwiches',
    count: '2 units',
    Icon: SandwichIcon,
    items: [
      { name: 'Sando 1' },
      { name: 'Sando 2' },
      { name: 'Sando 3' },
    ],
  },
  {
    id: 'hot-sides',
    title: 'Hot Sides',
    count: '4 units',
    Icon: HotSideIcon,
    items: [
      { name: 'Hot 1' },
      { name: 'Hot 2' },
      { name: 'Hot 3' },
    ],
  },
  {
    id: 'cold-sides',
    title: 'Cold Sides',
    count: '4 units',
    Icon: ColdSideIcon,
    items: [
      { name: 'Cold 1' },
      { name: 'Cold 2' },
      { name: 'Cold 3' },
    ],
  },
]

function withPriorities(sections: SectionWithoutPriority[]): Section[] {
  const total = sections.length
  return sections.map((s, i) => ({ ...s, priority: total - i }))
}

function getIndexAtY(containerRef: React.RefObject<HTMLDivElement | null>, y: number): number | null {
  if (!containerRef.current) return null
  const cards = containerRef.current.querySelectorAll('.item-section')
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect()
    if (y >= rect.top && y <= rect.bottom) return i
  }
  if (cards.length > 0) {
    const last = cards[cards.length - 1].getBoundingClientRect()
    if (y > last.bottom) return cards.length - 1
    const first = cards[0].getBoundingClientRect()
    if (y < first.top) return 0
  }
  return null
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<Section[]>(() => withPriorities(INITIAL_SECTIONS))

  function handleRun() {
    const order = sections.map(s => s.id) as PriorityOrder
    sessionStorage.setItem('simulation-priority-order', JSON.stringify(order))
    navigate('/stats')
  }
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const dragIndexRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ghostRef = useRef<HTMLElement | null>(null)
  const offsetYRef = useRef(0)

  const removeGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove()
      ghostRef.current = null
    }
  }, [])

  const createGhost = useCallback((sourceEl: Element, clientY: number) => {
    removeGhost()
    const rect = sourceEl.getBoundingClientRect()
    offsetYRef.current = clientY - rect.top

    const ghost = sourceEl.cloneNode(true) as HTMLElement
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      pointer-events: none;
      opacity: 0.85;
      z-index: 1000;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      transition: none;
    `
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }, [removeGhost])

  const moveGhost = useCallback((clientY: number) => {
    if (!ghostRef.current) return
    ghostRef.current.style.top = `${clientY - offsetYRef.current}px`
  }, [])

  const handlePointerDown = useCallback((index: number, e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return

    dragIndexRef.current = index

    const card = containerRef.current?.querySelectorAll('.item-section')[index]
    if (card) createGhost(card, e.clientY)

    e.preventDefault()
  }, [createGhost])

  useEffect(() => {
    function onPointerMove(e: globalThis.PointerEvent) {
      if (dragIndexRef.current === null) return
      moveGhost(e.clientY)
      const overIndex = getIndexAtY(containerRef, e.clientY)
      if (overIndex !== null) setDragOverIndex(overIndex)
    }

    function onPointerUp(e: globalThis.PointerEvent) {
      if (dragIndexRef.current === null) return

      const fromIndex = dragIndexRef.current
      const toIndex = getIndexAtY(containerRef, e.clientY)

      removeGhost()
      dragIndexRef.current = null
      setDragOverIndex(null)

      if (toIndex !== null && toIndex !== fromIndex) {
        setSections(prev => {
          const next = [...prev]
          const [moved] = next.splice(fromIndex, 1)
          next.splice(toIndex, 0, moved)
          return withPriorities(next)
        })
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [moveGhost, removeGhost])

  return (
    <div className="homescreen">
      <div className="homescreen__body">
        <Header onRun={handleRun} />
        <SegmentButtons
          active="Items"
          tabs={['Items', 'Metrics', 'About']}
          onTabChange={(tab) => {
            if (tab === 'Metrics') navigate('/stats')
            if (tab === 'About') navigate('/about')
          }}
        />
        <div className="items-container" ref={containerRef}>
          {sections.map((section, index) => (
            <ItemSection
              key={section.id}
              title={section.title}
              count={section.count}
              items={section.items.map(item => ({ ...item, priority: section.priority }))}
              icon={<section.Icon />}
              isDragOver={dragOverIndex === index}
              onHandlePointerDown={(e) => handlePointerDown(index, e)}
            />
          ))}
        </div>
        <BagSection maxUnits="48 units" icon={<BagIcon />} />
        <footer className="source-footer">
          <a href="https://github.com/Three-Byte/LEI-FlowGame" target="_blank" rel="noopener noreferrer">Source Code</a>
        </footer>
      </div>
    </div>
  )
}
