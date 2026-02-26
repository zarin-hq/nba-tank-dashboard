import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from './lib/api'
import TankTable from './components/TankTable'
import TodayGames from './components/TodayGames'
import JazzPickOdds from './components/JazzPickOdds'
import LotterySimulator from './components/LotterySimulator'

const JAZZ_ID = 1610612762

const MT = 'America/Denver'

function toDateStr(d) {
  // Extract the calendar date in Mountain Time
  return d.toLocaleDateString('en-CA', { timeZone: MT })
}

function offsetDate(dateStr, days) {
  // Parse as UTC noon (avoids DST/tz ambiguity) then shift by days
  const [y, m, day] = dateStr.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, day, 12, 0, 0) + days * 86_400_000
  return toDateStr(new Date(ms))
}

function formatDateLabel(dateStr) {
  const today = toDateStr(new Date())
  if (dateStr === today) return 'Today'
  if (dateStr === offsetDate(today, -1)) return 'Yesterday'
  if (dateStr === offsetDate(today, 1)) return 'Tomorrow'
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0))
  return d.toLocaleDateString('en-US', { timeZone: MT, month: 'short', day: 'numeric' })
}

function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl(url))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { fetch_() }, [fetch_])
  return { data, loading, error, refetch: fetch_ }
}

export default function App() {
  const [gamesDate, setGamesDate] = useState(() => toDateStr(new Date()))
  const [logoPopped, setLogoPopped] = useState(false)
  const today = toDateStr(new Date())

  const standings = useApi('/api/standings')
  const games     = useApi(`/api/today-games?game_date=${gamesDate}`)
  const jazzOdds  = useApi('/api/jazz-pick-odds')

  const lastUpdated = new Date().toLocaleTimeString()

  function refetchAll() {
    standings.refetch()
    games.refetch()
    jazzOdds.refetch()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'var(--accent)' }} />

      {/* Header */}
      <header style={{ background: 'var(--sch-black)', borderBottom: '3px solid var(--sch-teal-bright)', height: 70, overflow: 'visible' }}
        className="px-6">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-5 h-full">
            <img
              src="/sch-logo.svg"
              alt="Salt City Hoops"
              style={{
                width: 73, height: 64, flexShrink: 0, alignSelf: 'flex-start', marginTop: 15, position: 'relative', zIndex: 1,
                animation: logoPopped ? 'logo-pop 0.45s ease-out forwards' : undefined,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setLogoPopped(true)}
              onAnimationEnd={() => setLogoPopped(false)}
            />
            <div>
              <h1 className="text-lg sm:text-2xl tracking-tight leading-none text-white whitespace-nowrap"
                style={{ fontFamily: "'Archivo Black', Arial, sans-serif" }}>
                Jazz Tank Watch
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Updated {lastUpdated}
            </span>
            <button
              onClick={refetchAll}
              className="hidden sm:block"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1, padding: 0 }}
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-10">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Games
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Bottom 10 teams only</span>
            </div>
            <div className="flex items-center" style={{ gap: 6 }}>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {formatDateLabel(gamesDate)}
              </span>
              <button
                onClick={() => setGamesDate(d => offsetDate(d, -1))}
                className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              >‹</button>
              <button
                onClick={() => setGamesDate(d => offsetDate(d, 1))}
                disabled={gamesDate >= offsetDate(today, 1)}
                className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors"
                style={{
                  background: 'var(--bg-raised)',
                  color: gamesDate >= offsetDate(today, 1) ? 'var(--text-faint)' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: gamesDate >= offsetDate(today, 1) ? 'default' : 'pointer',
                }}
                onMouseEnter={e => { if (gamesDate < offsetDate(today, 1)) e.currentTarget.style.background = 'var(--border)' }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              >›</button>
            </div>
          </div>
          <TodayGames data={games.data} loading={games.loading} error={games.error} standings={standings.data} />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              Lottery Standings
            </h2>
            <LotterySimulator />
          </div>
          <TankTable data={standings.data} loading={standings.loading} error={standings.error} />
        </section>

        <section>
          <SectionHeader title="Jazz Pick Odds" subtitle="Probability of landing each draft slot" />
          <JazzPickOdds data={jazzOdds.data} loading={jazzOdds.loading} error={jazzOdds.error} />
        </section>
      </main>

      <footer className="hidden max-w-[1600px] mx-auto px-4 py-6 justify-end">
        <Link to="/style-guide" className="text-xs" style={{ color: 'var(--border-med)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = 'var(--text-faint)'}
          onMouseLeave={e => e.target.style.color = 'var(--border-med)'}
        >
          style guide
        </Link>
      </footer>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2 flex items-baseline gap-3">
      <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
        {title}
      </h2>
      {subtitle && (
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{subtitle}</span>
      )}
    </div>
  )
}
