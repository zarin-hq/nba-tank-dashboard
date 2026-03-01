import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from './lib/api'
import TankTable from './components/TankTable'
import TodayGames from './components/TodayGames'
import JazzPickOdds from './components/JazzPickOdds'
import LotterySimulator from './components/LotterySimulator'
import { LayoutConfig } from './components/Layout'

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
    <>
      <LayoutConfig
        title="Jazz Lottery Watch"
        headerRight={
          <>
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
          </>
        }
      />

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-[30px]">
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
                className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
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

        <section>
          <SectionHeader title="The Bottom Line" />
          <BottomLine standings={standings.data} jazzOdds={jazzOdds.data} />
        </section>
      </main>

      <footer className="flex max-w-[1600px] mx-auto px-4 py-6 justify-end gap-4">
        <Link to="/draft-history" className="text-xs" style={{ color: 'var(--border-med)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = 'var(--text-faint)'}
          onMouseLeave={e => e.target.style.color = 'var(--border-med)'}
        >
          draft history
        </Link>
        <Link to="/style-guide" className="text-xs" style={{ color: 'var(--border-med)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = 'var(--text-faint)'}
          onMouseLeave={e => e.target.style.color = 'var(--border-med)'}
        >
          style guide
        </Link>
      </footer>
    </>
  )
}

function BottomLine({ standings, jazzOdds }) {
  if (!standings || !jazzOdds?.odds) return null

  const jazz = standings.find(t => t.team_id === JAZZ_ID)
  if (!jazz) return null

  const gamesPlayed = jazz.wins + jazz.losses
  const gamesLeft = 82 - gamesPlayed
  const winPct = gamesPlayed > 0 ? jazz.wins / gamesPlayed : 0
  const projWins = Math.round(jazz.wins + gamesLeft * winPct)
  const projLosses = 82 - projWins

  const top4 = jazzOdds.top4_odds ?? 0
  const odds = jazzOdds.odds || {}
  const okcPct = (Number(odds['9'] || 0) + Number(odds['10'] || 0)).toFixed(1)

  const cards = [
    { label: 'Draft Position', value: `#${jazzOdds.slot}`, sub: jazzOdds.record },
    { label: 'Games Left', value: gamesLeft, sub: `${gamesPlayed} played` },
    { label: 'Projected Finish', value: `${projWins}-${projLosses}`, sub: `${(winPct * 100).toFixed(1)}% win rate` },
    { label: 'Top-4 Pick', value: `${top4.toFixed(1)}%`, sub: 'Lottery odds', accent: true },
    { label: 'Pick to OKC', value: `${okcPct}%`, sub: 'Picks 9-10 owed', warn: Number(okcPct) > 20 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl px-4 py-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            {c.label}
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{
            color: c.accent ? '#00CF94' : c.warn ? '#dc2626' : 'var(--text)',
          }}>
            {c.value}
          </div>
          {c.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{c.sub}</div>}
        </div>
      ))}
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
