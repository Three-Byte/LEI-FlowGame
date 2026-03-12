import './ComingSoon.css'

function ComingSoon() {
  return (
    <main className="coming-soon" aria-labelledby="coming-soon-title">
      <div className="coming-soon__glow" aria-hidden="true" />
      <section className="coming-soon__content">
        <span className="coming-soon__signal" aria-hidden="true">
          <span className="coming-soon__signal-dot" />
          Launching quietly
        </span>
        <h1 id="coming-soon-title">Coming Soon</h1>
        <p>Something new is being built.</p>
      </section>
      <footer className="coming-soon__footer">© 2026 3-Byte</footer>
    </main>
  )
}

export default ComingSoon