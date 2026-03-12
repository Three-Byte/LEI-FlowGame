import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StatsScreen.css'
import Header from './Header'
import SegmentButtons from './SegmentButtons'
import GaugeRow from './GaugeRow'
import ExplanationCard from './ExplanationCard'
import {
  runSimulation,
  ITEM_CONFIG,
  OPTIMAL_ORDER,
  type PriorityOrder,
  type SimulationResult,
} from '../lib/simulation'
import ComposedBag from './ComposedBag'

// ---------------------------------------------------------------------------
// Helpers to derive per-category stats from simulation result
// ---------------------------------------------------------------------------

interface CategoryStat {
  id: string
  label: string
  color: string
  bagUnitsEach: number  // bag units consumed per serving of this category
  priority: number
  itemsSimulated: number  // total items picked from this category across all orders
}

const CATEGORY_META: { id: string; label: string; color: string }[] = [
  { id: 'sandwiches', label: 'Sandwiches', color: '#EA661E' },
  { id: 'hot-sides',  label: 'Hot Sides',  color: '#EA661E' },
  { id: 'cold-sides', label: 'Cold Sides', color: '#1DB4F3' },
  { id: 'salads',     label: 'Salads',     color: '#1DB4F3' },
]

function deriveCategoryStats(orders: SimulationResult['orders'], priorityOrder: PriorityOrder): CategoryStat[] {
  return CATEGORY_META.map(meta => {
    const configItems = ITEM_CONFIG.filter(it => it.category === meta.id)
    const bagUnitsEach = configItems[0]?.bagUnits ?? 1
    const rank = priorityOrder.indexOf(meta.id as PriorityOrder[number])
    const priority = priorityOrder.length - rank  // top of list = highest number, matches HomeScreen
    // Sum all items picked from this category across every simulated order
    const itemsSimulated = orders.reduce(
      (sum, order) => sum + order.items.filter(it => it.category === meta.id).length,
      0
    )
    return {
      id: meta.id,
      label: meta.label,
      color: meta.color,
      bagUnitsEach,
      priority,
      itemsSimulated,
    }
  })
}

// ---------------------------------------------------------------------------
// StatsScreen
// ---------------------------------------------------------------------------

export default function StatsScreen() {
  const navigate = useNavigate()
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [priorityOrder, setPriorityOrder] = useState<PriorityOrder>(OPTIMAL_ORDER)

  useEffect(() => {
    const raw = sessionStorage.getItem('simulation-priority-order')
    const order: PriorityOrder = raw
      ? (JSON.parse(raw) as PriorityOrder)
      : OPTIMAL_ORDER
    setPriorityOrder(order)
    setResult(runSimulation(order))
  }, [])

  function handleTabChange(tab: string) {
    if (tab === 'Items') navigate('/homescreen')
    if (tab === 'About') navigate('/about')
  }

  if (!result) {
    return (
      <div className="stats-screen">
        <div className="stats-screen__body">
          <Header
            centerContent={
              <ComposedBag priorityOrder={priorityOrder} className="header__center-bag" />
            }
            workerQuality={100}
          />
          <SegmentButtons
            tabs={['Items', 'Metrics', 'About']}
            active="Metrics"
            onTabChange={handleTabChange}
          />
          <div className="stats-loading">Simulating…</div>
        </div>
      </div>
    )
  }

  const { metrics, orders, isOptimal, explanationLines } = result
  const quality = metrics.quality
  // Sort by priority descending so card order mirrors the user's item screen sequence
  const categoryStats = deriveCategoryStats(orders, priorityOrder)
    .sort((a, b) => b.priority - a.priority)

  return (
    <div className={`stats-screen${isOptimal ? ' is-optimal' : ''}`}>
      <div className="stats-screen__body">

        <Header
          centerContent={
            <ComposedBag priorityOrder={priorityOrder} className="header__center-bag" />
          }
          quality={quality}
          workerQuality={quality}
        />

        {/* Repack section — shown when order is not optimal */}
        {!isOptimal && (
          <div className="repack-section">
            <span className="stats-section-heading">Repack Bag</span>
            <div className="repack-section__bags">
              <div className="repack-section__bag-wrapper">
                <span className="repack-section__bag-label">Current</span>
                <ComposedBag priorityOrder={priorityOrder} className="repack-section__bag" />
              </div>
              <span className="repack-section__arrow">→</span>
              <div className="repack-section__bag-wrapper">
                <span className="repack-section__bag-label">Optimal</span>
                <ComposedBag priorityOrder={OPTIMAL_ORDER} className="repack-section__bag" />
              </div>
            </div>
            <button
              className="repack-section__btn"
              onClick={() => {
                setPriorityOrder(OPTIMAL_ORDER)
                setResult(runSimulation(OPTIMAL_ORDER))
                sessionStorage.setItem(
                  'simulation-priority-order',
                  JSON.stringify(OPTIMAL_ORDER),
                )
              }}
            >
              Repack Bag
            </button>
          </div>
        )}

        <SegmentButtons
          tabs={['Items', 'Metrics', 'About']}
          active="Metrics"
          onTabChange={handleTabChange}
        />

        {/* Three circular gauges */}
        <GaugeRow
          gauges={[
            { label: 'Flow Efficiency', value: metrics.flowEfficiency },
            { label: 'Quality',         value: metrics.quality },
            { label: 'Smoothness',      value: metrics.smoothness },
          ]}
          isOptimal={isOptimal}
        />

        {/* Two stat cards */}
        <div className="stats-summary-grid" style={{ marginTop: 16 }}>
          <div className="stats-summary-card">
            <span className="stats-summary-card__label">Avg Lead Time</span>
            <div className="stats-summary-card__value-row">
              <span className="stats-summary-card__value">{metrics.avgLeadTimeSec}</span>
              <span className="stats-summary-card__unit">s</span>
            </div>
          </div>
          <div className="stats-summary-card">
            <span className="stats-summary-card__label">Throughput</span>
            <div className="stats-summary-card__value-row">
              <span className="stats-summary-card__value">{metrics.throughput}</span>
              <span className="stats-summary-card__unit">orders/hr</span>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <span className="stats-section-heading" style={{ marginTop: 20 }}>
          Category Breakdown
        </span>

        <div className="stats-categories">
          {categoryStats.map(cat => (
            <div key={cat.id} className="stats-cat-card">
              <div className="stats-cat-card__header">
                <span
                  className="stats-cat-card__dot"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="stats-cat-card__label">{cat.label}</span>
              </div>
              <div className="stats-cat-card__row">
                <div className="stats-cat-card__stat">
                  <span className="stats-cat-card__stat-value">{cat.bagUnitsEach}</span>
                  <span className="stats-cat-card__stat-label">Bag Units</span>
                </div>
                <div className="stats-cat-card__stat">
                  <span className="stats-cat-card__stat-value">{cat.priority}</span>
                  <span className="stats-cat-card__stat-label">Priority</span>
                </div>
                <div className="stats-cat-card__stat">
                  <span className="stats-cat-card__stat-value">{cat.itemsSimulated}</span>
                  <span className="stats-cat-card__stat-label">Items</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation card */}
        <div style={{ marginTop: 20 }}>
          <ExplanationCard lines={explanationLines} isOptimal={isOptimal} />
        </div>

        <footer className="source-footer">
          <a href="https://github.com/Three-Byte/LEI-FlowGame" target="_blank" rel="noopener noreferrer">Source Code</a>
        </footer>

      </div>
    </div>
  )
}
