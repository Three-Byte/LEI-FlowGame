import type { PriorityOrder } from '../lib/simulation'

// ---------------------------------------------------------------------------
// SVG path data for each food-category icon (extracted from icon-*.svg files)
// Each entry stores the native width/height and the <g> children (paths).
// ---------------------------------------------------------------------------

interface ItemDef {
  width: number
  height: number
  paths: { d: string; fill: string }[]
}

const ITEM_DEFS: Record<string, ItemDef> = {
  sandwiches: {
    width: 26,
    height: 19,
    paths: [
      { d: 'M25.4273 7.92782V8.66752H0.572388V7.92782C0.572388 3.90142 3.93547 0.624882 8.07141 0.624882H17.928C22.0629 0.624882 25.4273 3.90174 25.4273 7.92782Z', fill: '#EA661E' },
      { d: 'M25.4273 13.8704V15.3757C25.4273 17.3722 23.7553 19 21.7077 19H4.29359C2.24457 19 0.573975 17.3721 0.573975 15.3757V13.8704H25.4273Z', fill: '#EA661E' },
      { d: 'M26 11.3557C26 11.994 25.4642 12.516 24.8091 12.516H1.19083C0.535761 12.516 0 11.994 0 11.3557C0 10.7138 0.535728 10.1917 1.19083 10.1917H24.8091C25.4642 10.1917 26 10.7137 26 11.3557Z', fill: '#EA661E' },
    ],
  },
  'hot-sides': {
    width: 23,
    height: 19,
    paths: [
      { d: 'M1.41748 0.252169H23.0929L20.3794 18.6899H4.13097L1.41748 0.252169Z', fill: '#EA661E' },
    ],
  },
  'cold-sides': {
    width: 23,
    height: 19,
    paths: [
      { d: 'M1.41748 0.252167H23.0929L20.3794 18.6899H4.13097L1.41748 0.252167Z', fill: '#1DB4F3' },
    ],
  },
  salads: {
    width: 45,
    height: 22,
    paths: [
      { d: 'M44.1711 3.08983C43.989 10.2431 40.39 16.8517 34.4553 20.8965H9.49927C3.56445 16.8518 -0.0333509 10.243 -0.215576 3.08983H44.1711ZM44.4817 2.45311H0.134033V0.494125H44.4817V2.45311Z', fill: '#1DB4F3' },
    ],
  },
}

// ---------------------------------------------------------------------------
// Slot positions inside the bag (88×100 viewBox).
// 4 slots arranged in a 2×2 grid. Index 0 = bottom-left (lowest priority),
// index 3 = top-right (highest priority).
// Items are placed bottom-to-top: the last items in the priority array
// (lowest priority numbers) go at the bottom of the bag.
// ---------------------------------------------------------------------------

const LEFT_CX = 20
const RIGHT_CX = 60
const BOTTOM_CY = 84
const TOP_CY = 63

const SLOTS = [
  { cx: LEFT_CX, cy: BOTTOM_CY },
  { cx: RIGHT_CX, cy: BOTTOM_CY },
  { cx: LEFT_CX, cy: TOP_CY },
  { cx: RIGHT_CX, cy: TOP_CY },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ComposedBagProps {
  priorityOrder: PriorityOrder
  className?: string
}

export default function ComposedBag({ priorityOrder, className }: ComposedBagProps) {
  return (
    <svg
      width="88"
      height="100"
      viewBox="0 0 88 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bag outline */}
      <path
        d="M84.6064 21.3652H69.8894C66.4788 9.52371 56.1814 0.91658 44.001 0.91658C31.8205 0.91658 21.5204 9.5241 18.1126 21.3652H3.39555C2.05589 21.3652 0.966553 22.4508 0.966553 23.7903V97.0346C0.966553 98.3781 2.05215 99.4636 3.39555 99.4636H84.6045C85.948 99.4636 87.0335 98.3742 87.0335 97.0346V23.7903C87.0335 22.4507 85.944 21.3652 84.6045 21.3652H84.6064ZM44.002 5.00827C54.042 5.00827 62.5988 11.8181 65.8598 21.3612H22.1452C25.4057 11.8183 33.958 5.00827 44.002 5.00827Z"
        fill="#606673"
      />

      {/* Food items placed inside the bag, lowest priority at the bottom */}
      {[...priorityOrder].reverse().map((categoryId, i) => {
        const item = ITEM_DEFS[categoryId]
        if (!item || i >= SLOTS.length) return null
        const slot = SLOTS[i]
        const tx = slot.cx - item.width / 2
        const ty = slot.cy - item.height / 2
        return (
          <g key={categoryId} transform={`translate(${tx},${ty})`}>
            {item.paths.map((p, j) => (
              <path key={j} d={p.d} fill={p.fill} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
