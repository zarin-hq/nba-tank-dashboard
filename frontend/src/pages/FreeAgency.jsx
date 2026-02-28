import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useSimState from '../hooks/useSimState'
import CapOverview from '../components/free-agency/CapOverview'
import CurrentRoster from '../components/free-agency/CurrentRoster'
import DraftPick from '../components/free-agency/DraftPick'
import FreeAgentMarket from '../components/free-agency/FreeAgentMarket'
import DepthChart from '../components/free-agency/DepthChart'
import TradeBuilder from '../components/free-agency/TradeBuilder'
import ShareSection from '../components/free-agency/ShareImage'
import DRAFT_PROSPECTS from '../data/draft-prospects'

const headshotUrl = id => `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=48&h=35`

function PlayerPhoto({ espnId, photo, name, size = 24 }) {
  if (espnId) return <img src={headshotUrl(espnId)} alt="" className="rounded-full flex-shrink-0" style={{ width: size, height: size, objectFit: 'cover' }} />
  if (photo) return <img src={photo} alt="" className="rounded-full flex-shrink-0" style={{ width: size, height: size, objectFit: 'cover', objectPosition: 'top' }} />
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: 'var(--bg-raised)', color: 'var(--text-faint)', fontSize: size * 0.38, fontWeight: 700 }}>
      {initials}
    </div>
  )
}

const fmt = n => {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export default function FreeAgency() {
  const { state, dispatch, computed, roster, waivedPlayers } = useSimState()
  const [logoPopped, setLogoPopped] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  useEffect(() => { document.title = 'Jazz Free Agency Simulator | Salt City Hoops' }, [])
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        style={{ background: 'var(--sch-black)', borderBottom: '3px solid var(--sch-teal-bright)', height: 70, overflow: 'visible' }}
        className="px-6"
      >
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-5 h-full">
            <a href="https://www.saltcityhoops.com" target="_blank" rel="noopener noreferrer">
              <img
                src="/sch-logo.svg"
                alt="Salt City Hoops"
                style={{
                  width: 73, height: 64, flexShrink: 0, alignSelf: 'flex-start', marginTop: 19,
                  position: 'relative', zIndex: 1,
                  animation: logoPopped ? 'logo-pop 0.45s ease-out forwards' : undefined,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setLogoPopped(true)}
                onAnimationEnd={() => setLogoPopped(false)}
              />
            </a>
            <div>
              <h1
                className="text-sm sm:text-2xl tracking-tight leading-none text-white whitespace-nowrap"
                style={{ fontFamily: "'Archivo Black', Arial, sans-serif" }}
              >
                Jazz Free Agency Simulator
              </h1>

            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">Reset all?</span>
                <button
                  onClick={() => { dispatch({ type: 'RESET' }); setShowResetConfirm(false) }}
                  className="text-xs font-bold px-3 py-1.5 rounded btn-teal"
                  style={{ background: 'var(--sch-teal-bright)', color: 'var(--sch-black)', border: 'none', cursor: 'pointer' }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-xs font-bold px-3 py-1.5 rounded"
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs px-3 py-1.5 rounded"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                Reset Sim
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-only My Team sticky bar */}
      <div className="sm:hidden sticky" style={{ top: 73, zIndex: 20 }}>
        <button
          onClick={() => setTeamOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5"
          style={{ background: 'var(--sch-black)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
        >
          <span className="text-xs font-bold text-white">
            My Team &middot; {roster.length} Players &middot; {fmt(computed.totalPayroll)}
          </span>
          <svg
            style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)', transition: 'transform 0.2s', transform: teamOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {teamOpen && (
          <div className="overflow-y-auto" style={{ maxHeight: '50vh', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
            {[...roster].sort((a, b) => (b.salary || 0) - (a.salary || 0)).map(p => (
              <div
                key={p.name}
                className="px-4 py-2 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <PlayerPhoto espnId={p.espnId} photo={p.photo || DRAFT_PROSPECTS.find(d => d.name === p.name)?.photo} name={p.name} />
                  <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{p.name}</span>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{p.position}</span>
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                  {p.salary ? `$${(p.salary / 1_000_000).toFixed(1)}M` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8 flex gap-6">
        {/* Left column — main content */}
        <main className="flex-1 min-w-0 space-y-[22px]">
          <CollapsibleSection title="Cap Overview" subtitle="2026-27 salary cap projections">
            <CapOverview computed={computed} />
          </CollapsibleSection>

          <CollapsibleSection title="Current Roster" subtitle="Manage contracts, options & non-guaranteed deals">
            <CurrentRoster state={state} dispatch={dispatch} computed={computed} />
          </CollapsibleSection>

          <CollapsibleSection title="Draft Pick" subtitle={<>Select your rookie — <Link to="/" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>run the lottery</Link></>}>
            <DraftPick state={state} dispatch={dispatch} />
          </CollapsibleSection>

          <CollapsibleSection title="Free Agents" subtitle="Sign free agents via MLE, vet minimum, or custom salary">
            <FreeAgentMarket state={state} dispatch={dispatch} computed={computed} waivedPlayers={waivedPlayers} />
          </CollapsibleSection>

          <CollapsibleSection title="Trades" subtitle="Construct trades with salary matching">
            <TradeBuilder state={state} dispatch={dispatch} roster={roster} />
          </CollapsibleSection>

          <CollapsibleSection title="Depth Chart" subtitle="Drag and drop your projected lineup">
            <DepthChart state={state} dispatch={dispatch} roster={roster} />
          </CollapsibleSection>

          <CollapsibleSection title="Share" subtitle="Download or copy your offseason build">
            <ShareSection state={state} computed={computed} roster={roster} />
          </CollapsibleSection>
        </main>

        {/* Right column — My Team */}
        <aside
          className="hidden sm:flex flex-col flex-shrink-0 sticky top-4 self-start"
          style={{ width: 280, maxHeight: 'calc(100vh - 120px)' }}
        >
          <span className="font-display text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            My Team
          </span>

          <div
            className="rounded-xl flex-1 overflow-y-auto scrollbar-thin"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Summary header */}
            <div className="px-3 py-2.5 sticky top-0" style={{ background: 'var(--sch-black)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{roster.length} Players</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--sch-teal-bright)' }}>
                  {fmt(computed.totalPayroll)}
                </span>
              </div>
            </div>

            {/* Player list */}
            <div>
              {[...roster].sort((a, b) => (b.salary || 0) - (a.salary || 0)).map(p => (
                <div
                  key={p.name}
                  className="px-3 py-2 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <PlayerPhoto espnId={p.espnId} photo={p.photo || DRAFT_PROSPECTS.find(d => d.name === p.name)?.photo} name={p.name} />
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{p.name}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{p.position}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                    {p.salary ? `$${(p.salary / 1_000_000).toFixed(1)}M` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, subtitle, children }) {
  const [open, setOpen] = useState(true)
  return (
    <section>
      <button
        onClick={() => setOpen(o => !o)}
        className="mb-2 flex items-baseline gap-1.5 w-full cursor-pointer"
        style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
      >
        <span
          className="text-xs font-bold flex-shrink-0"
          style={{ color: 'var(--accent)', display: 'inline-block', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', position: 'relative', top: -2 }}
        >
          ▸
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs block sm:inline sm:ml-1.5" style={{ color: 'var(--text-faint)' }}>{subtitle}</span>
          )}
        </div>
      </button>
      {open && children}
    </section>
  )
}
