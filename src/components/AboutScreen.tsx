import { useNavigate } from 'react-router-dom'
import './AboutScreen.css'
import Header from './Header'
import SegmentButtons from './SegmentButtons'

export default function AboutScreen() {
  const navigate = useNavigate()

  function handleTabChange(tab: string) {
    if (tab === 'Items') navigate('/homescreen')
    if (tab === 'Metrics') navigate('/stats')
    // About stays here
  }

  return (
    <div className="about-screen">
      <div className="about-screen__body">

        <Header onRun={() => navigate('/stats')} />

        <SegmentButtons
          tabs={['Items', 'Metrics', 'About']}
          active="About"
          onTabChange={handleTabChange}
        />

        {/* Overview card */}
        <div className="about-overview-card">
          <h2 className="about-overview-card__title">Overview</h2>

          <p className="about-body-text">
            This app simulates how item sequencing affects order assembly speed and food quality. You arrange four food categories in priority order, run a simulation of 25 orders, and see how that sequence impacts flow, quality, and consistency.
          </p>

          <p className="about-body-text">
            <span className="about-highlight">Priority ordering</span> — on the Items screen, drag the four categories (Sandwiches, Hot Sides, Cold Sides, Salads) into the sequence you want. The top category is assembled first, the bottom last. This order determines how items are layered into the bag and directly affects both speed and food temperature.
          </p>

          <p className="about-body-text">
            <span className="about-highlight">Thermal layering</span> — hot items (Sandwiches, Hot Sides) should sit on top of the bag and cold items (Cold Sides, Salads) on the bottom. When items end up in the wrong thermal position, quality drops because hot food loses heat and cold items warm up.
          </p>

          <p className="about-body-text">
            <span className="about-highlight">Bag reorganisation penalty</span> — when categories are out of optimal order, each misplaced category adds 8 seconds of reorganisation time at the Bag Pack station. More misplacements mean more wasted time per order, compounding across all 25 orders.
          </p>

          <p className="about-body-text about-body-text--spaced">
            The Metrics screen shows three core gauges and supporting stats:
          </p>

          {/* Gauges */}
          <div className="about-section">
            <span className="about-section__label">Gauges</span>
            <ul className="about-bullet-list">
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  <span className="about-highlight">Flow Efficiency</span> — the ratio of pure assembly lead time to total order time (including any bag reorganisation penalties). 100% means zero sequencing waste.
                </span>
              </li>
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  <span className="about-highlight">Quality</span> — based on thermal position correctness. Each category in the wrong thermal zone (hot item on the bottom or cold item on top) reduces quality by 25%.
                </span>
              </li>
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  <span className="about-highlight">Smoothness</span> — how consistent lead times are across all orders. Low variation means predictable output; high variation signals instability.
                </span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="about-section">
            <span className="about-section__label">Stats</span>
            <ul className="about-bullet-list">
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  <span className="about-highlight">Avg Lead Time</span> — the average seconds per order, including any reorganisation penalties.
                </span>
              </li>
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  <span className="about-highlight">Throughput</span> — estimated orders per hour based on average lead time.
                </span>
              </li>
            </ul>
          </div>

          {/* Optimal order */}
          <div className="about-section">
            <span className="about-section__label">Optimal order</span>
            <ul className="about-bullet-list">
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  The optimal sequence is <span className="about-highlight">Sandwiches → Hot Sides → Cold Sides → Salads</span>. This eliminates bag reorganisation penalties and places hot items on top, cold on the bottom.
                </span>
              </li>
              <li className="about-bullet-item">
                <span className="about-bullet-dot">•</span>
                <span className="about-bullet-body">
                  When the current order is suboptimal, a <span className="about-highlight">Repack Bag</span> button lets you instantly switch to the optimal sequence and re-run the simulation.
                </span>
              </li>
            </ul>
          </div>

          <p className="about-body-text about-body-text--spaced">
            The simulation generates each order with 3–5 random items drawn from the 11 menu items across all four categories. Every item has a defined lead time, throughput rate, and bag unit size. The same random seed is used each run so results are deterministic and comparable.
          </p>
        </div>

        <footer className="source-footer">
          <a href="https://github.com/Three-Byte/LEI-FlowGame" target="_blank" rel="noopener noreferrer">Source Code</a>
        </footer>

      </div>
    </div>
  )
}
