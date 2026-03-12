// ---------------------------------------------------------------------------
// Simulation Engine — pure TypeScript, no React imports
// ---------------------------------------------------------------------------

export type CategoryId = 'sandwiches' | 'hot-sides' | 'cold-sides' | 'salads'
export type PriorityOrder = [CategoryId, CategoryId, CategoryId, CategoryId]

export interface ItemConfig {
  id: string
  name: string
  category: CategoryId
  bagUnits: number
  throughputPerHour: number
  leadTimeSec: number
  temp: 'hot' | 'cold' | 'ambient'
}

export interface SimulatedOrder {
  orderId: number
  items: ItemConfig[]
  leadTimeSec: number
  priorityPenaltySec: number
  totalTimeSec: number
}

export interface GanttRow {
  orderId: number
  // 'Assembly' covers grill + cold prep work shown as two sub-bars.
  // 'Assembly-Grill' and 'Assembly-Cold' are sub-segments rendered inside Assembly.
  // 'Bag Pack' and 'Bag Pack-Reorg' are the base pack time and any penalty reorg time.
  station: 'Assembly-Grill' | 'Assembly-Cold' | 'Bag Pack' | 'Bag Pack-Reorg'
  startSec: number
  durationSec: number
}

export interface SimulationResult {
  orders: SimulatedOrder[]
  ganttRows: GanttRow[]
  metrics: {
    flowEfficiency: number
    quality: number
    smoothness: number
    avgLeadTimeSec: number
    throughput: number
    totalParts: number
    totalTimeSec: number
    minLeadTimeSec: number
    maxLeadTimeSec: number
  }
  isOptimal: boolean
  explanationLines: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const OPTIMAL_ORDER: PriorityOrder = ['sandwiches', 'hot-sides', 'cold-sides', 'salads']

export const ITEM_CONFIG: ItemConfig[] = [
  { id: 'sando1',  name: 'Sando 1',  category: 'sandwiches', bagUnits: 2,  throughputPerHour: 40,  leadTimeSec: 90,  temp: 'hot' },
  { id: 'sando2',  name: 'Sando 2',  category: 'sandwiches', bagUnits: 2,  throughputPerHour: 40,  leadTimeSec: 90,  temp: 'hot' },
  { id: 'sando3',  name: 'Sando 3',  category: 'sandwiches', bagUnits: 2,  throughputPerHour: 35,  leadTimeSec: 100, temp: 'hot' },
  { id: 'hot1',    name: 'Hot 1',    category: 'hot-sides',   bagUnits: 4,  throughputPerHour: 60,  leadTimeSec: 60,  temp: 'hot' },
  { id: 'hot2',    name: 'Hot 2',    category: 'hot-sides',   bagUnits: 4,  throughputPerHour: 60,  leadTimeSec: 60,  temp: 'hot' },
  { id: 'hot3',    name: 'Hot 3',    category: 'hot-sides',   bagUnits: 4,  throughputPerHour: 55,  leadTimeSec: 65,  temp: 'hot' },
  { id: 'cold1',   name: 'Cold 1',   category: 'cold-sides',  bagUnits: 4,  throughputPerHour: 80,  leadTimeSec: 45,  temp: 'cold' },
  { id: 'cold2',   name: 'Cold 2',   category: 'cold-sides',  bagUnits: 4,  throughputPerHour: 80,  leadTimeSec: 45,  temp: 'cold' },
  { id: 'cold3',   name: 'Cold 3',   category: 'cold-sides',  bagUnits: 4,  throughputPerHour: 75,  leadTimeSec: 50,  temp: 'cold' },
  { id: 'salad1',  name: 'Salad 1',  category: 'salads',      bagUnits: 12, throughputPerHour: 100, leadTimeSec: 30,  temp: 'cold' },
  { id: 'salad2',  name: 'Salad 2',  category: 'salads',      bagUnits: 12, throughputPerHour: 100, leadTimeSec: 30,  temp: 'cold' },
]

// ---------------------------------------------------------------------------
// Seeded RNG (linear congruential generator — deterministic)
// ---------------------------------------------------------------------------

function makeLcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xFFFFFFFF
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/** Returns true if the given priorityOrder matches OPTIMAL_ORDER exactly */
function checkIsOptimal(priorityOrder: PriorityOrder): boolean {
  return priorityOrder.every((id, i) => id === OPTIMAL_ORDER[i])
}

/**
 * Count pairwise inversions relative to the optimal order (Kendall tau distance).
 * An inversion is a pair of categories that appear in the wrong relative order.
 * Range: 0 (perfect) to 6 (completely reversed, for 4 items).
 * This properly differentiates minor vs major reorderings — e.g. moving one
 * item to the front produces fewer inversions than swapping two groups.
 */
function countInversions(priorityOrder: PriorityOrder): number {
  const rank = (id: CategoryId) => OPTIMAL_ORDER.indexOf(id)
  let inversions = 0
  for (let i = 0; i < priorityOrder.length; i++) {
    for (let j = i + 1; j < priorityOrder.length; j++) {
      if (rank(priorityOrder[i]) > rank(priorityOrder[j])) inversions++
    }
  }
  return inversions
}

/**
 * Bag reorganisation penalty per order: each inversion in the priority sequence
 * forces the operator to resequence items in the bag, adding a fixed cost.
 * This is independent of how many items are in the order — it's the reorg effort
 * at the Bag Pack station that costs time.
 */
const BAG_REORG_SEC_PER_INVERSION = 15

function computeBagReorgPenalty(inversions: number): number {
  return inversions * BAG_REORG_SEC_PER_INVERSION
}

const CAT_TEMP: Record<CategoryId, 'hot' | 'cold'> = {
  'sandwiches': 'hot',
  'hot-sides':  'hot',
  'cold-sides': 'cold',
  'salads':     'cold',
}

/**
 * Count thermal position misplacements.
 * Top-of-bag positions (indices 0, 1 in priorityOrder) should be hot items.
 * Bottom-of-bag positions (indices 2, 3) should be cold items.
 * Cold items on top cool down the hot food; hot items buried at the bottom
 * lose heat quickly — both hurt customer satisfaction.
 * Returns 0 (perfect) to 4 (fully inverted).
 */
function countThermalMisplacements(priorityOrder: PriorityOrder): number {
  let misplaced = 0
  for (let i = 0; i < priorityOrder.length; i++) {
    const temp = CAT_TEMP[priorityOrder[i]]
    if (i < 2 && temp === 'cold') misplaced++
    if (i >= 2 && temp === 'hot') misplaced++
  }
  return misplaced
}

// ---------------------------------------------------------------------------
// Main simulation function
// ---------------------------------------------------------------------------

export function runSimulation(priorityOrder: PriorityOrder, seed = 42): SimulationResult {
  const rng = makeLcg(seed)
  const ORDER_COUNT = 25
  const GANTT_ORDERS = 15

  const inversionCount = countInversions(priorityOrder)

  // ---- Generate orders ----
  const orders: SimulatedOrder[] = []

  for (let i = 0; i < ORDER_COUNT; i++) {
    const itemCount = 3 + Math.floor(rng() * 3) // 3, 4, or 5
    const items: ItemConfig[] = []
    for (let j = 0; j < itemCount; j++) {
      const idx = Math.floor(rng() * ITEM_CONFIG.length)
      items.push(ITEM_CONFIG[idx])
    }

    const leadTimeSec = Math.max(...items.map(it => it.leadTimeSec))
    const priorityPenaltySec = computeBagReorgPenalty(inversionCount)
    const totalTimeSec = leadTimeSec + priorityPenaltySec

    orders.push({ orderId: i + 1, items, leadTimeSec, priorityPenaltySec, totalTimeSec })
  }

  // ---- Build Gantt rows for first GANTT_ORDERS orders ----
  // Two logical rows per order:
  //   Assembly row: Grill sub-bar (orange) + Cold Prep sub-bar (blue) — concurrent work
  //   Bag Pack row: base pack time + optional reorg time (shown as separate bar)
  //
  // Each row's cursor advances sequentially (one order at a time per row).
  let assemblyCursor = 0
  let bagCursor = 0

  const ganttRows: GanttRow[] = []
  const ganttOrders = orders.slice(0, GANTT_ORDERS)

  for (const order of ganttOrders) {
    const base = order.leadTimeSec

    // Assembly sub-bars: grill gets 58% of base lead time, cold prep 42%
    const grillDur = Math.round(base * 0.58)
    const coldDur  = base - grillDur  // remaining — ensures they sum exactly to base

    ganttRows.push({ orderId: order.orderId, station: 'Assembly-Grill', startSec: assemblyCursor,             durationSec: grillDur })
    ganttRows.push({ orderId: order.orderId, station: 'Assembly-Cold',  startSec: assemblyCursor + grillDur,  durationSec: coldDur })
    assemblyCursor += base

    // Bag Pack: base bag time, then penalty reorg time (if any)
    const bagBaseDur  = Math.round(base * 0.20)
    const bagReorgDur = order.priorityPenaltySec

    ganttRows.push({ orderId: order.orderId, station: 'Bag Pack',       startSec: bagCursor,                  durationSec: bagBaseDur })
    if (bagReorgDur > 0) {
      ganttRows.push({ orderId: order.orderId, station: 'Bag Pack-Reorg', startSec: bagCursor + bagBaseDur,   durationSec: bagReorgDur })
    }
    bagCursor += bagBaseDur + bagReorgDur
  }

  // ---- Compute metrics ----
  const totalTimes = orders.map(o => o.totalTimeSec)
  const leadTimes  = orders.map(o => o.leadTimeSec)

  const sumTotal  = totalTimes.reduce((a, b) => a + b, 0)
  const sumLead   = leadTimes.reduce((a, b) => a + b, 0)
  const avgTotal  = sumTotal / orders.length
  const cvTotal   = avgTotal > 0 ? stddev(totalTimes) / avgTotal : 0

  const flowEfficiency = clamp(Math.round((sumLead / sumTotal) * 100), 0, 100)
  // Quality: based on thermal position correctness.
  // Hot items should be on top of the bag (indices 0–1), cold on the bottom (2–3).
  const thermalMisplacements = countThermalMisplacements(priorityOrder)
  const quality = clamp(Math.round(100 * (1 - thermalMisplacements / 4)), 0, 100)
  const smoothness = clamp(Math.round(100 - cvTotal * 100), 0, 100)
  const avgLeadTimeSec = Math.round(avgTotal)
  const throughput = avgTotal > 0 ? Math.round((3600 / avgTotal) * 10) / 10 : 0
  const totalParts = orders.reduce((sum, o) => sum + o.items.length, 0)
  const totalTimeSec = sumTotal
  const minLeadTimeSec = Math.min(...totalTimes)
  const maxLeadTimeSec = Math.max(...totalTimes)

  const isOptimal = checkIsOptimal(priorityOrder)

  // ---- Build explanation lines ----
  const explanationLines: string[] = []

  if (isOptimal) {
    explanationLines.push('Priority order is optimal: Sandwiches → Hot Sides → Cold Sides → Salads.')
    explanationLines.push('No priority penalties were applied — all items flowed at optimal sequencing.')
    explanationLines.push(`Flow efficiency reached ${flowEfficiency}% with zero sequencing waste.`)
    explanationLines.push(`Quality is ${quality}/100 — hot items on top keep food warm for the customer.`)
    explanationLines.push(`Smoothness is ${smoothness}/100 — lead times were consistent across all orders.`)
  } else {
    const reorgSec = inversionCount * BAG_REORG_SEC_PER_INVERSION
    if (flowEfficiency < 90) {
      explanationLines.push(`Flow efficiency is ${flowEfficiency}% — each order spent +${reorgSec}s at Bag Pack reorganising items into the correct sequence.`)
    } else {
      explanationLines.push(`Flow efficiency is ${flowEfficiency}% — minor bag reorganisation delays were present.`)
    }
    if (quality < 100) {
      explanationLines.push(`Quality is ${quality}/100 — ${thermalMisplacements} item(s) are in the wrong thermal position. Hot items should be on top of the bag, cold items on the bottom.`)
    } else {
      explanationLines.push(`Quality is ${quality}/100 — hot items are on top, cold items on the bottom.`)
    }
    if (smoothness < 80) {
      explanationLines.push(`Smoothness is ${smoothness}/100 — lead times varied significantly across orders.`)
    } else {
      explanationLines.push(`Smoothness is ${smoothness}/100 — lead time variation was moderate.`)
    }
    explanationLines.push('Try reordering to: Sandwiches (top) → Hot Sides → Cold Sides → Salads (bottom) for optimal flow.')
  }

  explanationLines.push(`${totalParts} total items processed across ${ORDER_COUNT} orders.`)
  explanationLines.push(`Average order time: ${avgLeadTimeSec}s · Throughput: ${throughput} orders/hr.`)

  return {
    orders,
    ganttRows,
    metrics: {
      flowEfficiency,
      quality,
      smoothness,
      avgLeadTimeSec,
      throughput,
      totalParts,
      totalTimeSec,
      minLeadTimeSec,
      maxLeadTimeSec,
    },
    isOptimal,
    explanationLines,
  }
}
