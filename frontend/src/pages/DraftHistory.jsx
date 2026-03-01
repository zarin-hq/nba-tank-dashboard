import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile'
import JAZZ_DRAFT_HISTORY, { TIERS, DRAFT_NIGHT_TRADES } from '../data/jazz-draft-history'

const headshotUrl = id => `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=96&h=70`

function PlayerPhoto({ espnId, name, size = 28 }) {
  const [failed, setFailed] = useState(false)
  if (espnId && !failed) {
    return (
      <img
        src={headshotUrl(espnId)}
        alt=""
        className="rounded-full flex-shrink-0"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => setFailed(true)}
      />
    )
  }
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: 'var(--border)', color: 'var(--text-muted)', fontSize: size * 0.38, fontWeight: 700 }}
    >
      {initials}
    </div>
  )
}

function TierBadge({ tier }) {
  const t = TIERS[tier] || TIERS.tbd
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: t.color, background: t.bg }}
    >
      {t.label}
    </span>
  )
}

const TIER_FILTERS = ['All', 'hof', 'all-nba', 'all-star', 'starter', 'rotation', 'bust', 'tbd']
const ROUNDS = ['All', '1', '2']

// Players still active in the NBA (as of 2024-25 season)
const ACTIVE_PLAYERS = new Set([
  'Ace Bailey', 'Walter Clayton Jr.',
  'Cody Williams', 'Isaiah Collier', 'Kyle Filipowski',
  'Taylor Hendricks', 'Keyonte George', 'Brice Sensabaugh',
  'Walker Kessler', 'Ochai Agbaji',
  'Grayson Allen', 'Donovan Mitchell',
  'Dante Exum', 'Rudy Gobert', 'Alec Burks',
])

export default function DraftHistory() {
  const [logoPopped, setLogoPopped] = useState(false)
  const [tierFilter, setTierFilter] = useState('All')
  const [roundFilter, setRoundFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [insightsRound, setInsightsRound] = useState('All')
  const [pickMin, setPickMin] = useState(1)
  const [pickMax, setPickMax] = useState(10)
  const isMobile = useIsMobile()

  useEffect(() => { document.title = 'Jazz Draft History | Salt City Hoops' }, [])

  // ── Insights (filtered by insights round / range) ──
  const insights = useMemo(() => {
    let all
    if (insightsRound === 'Range') {
      all = JAZZ_DRAFT_HISTORY.filter(p => p.pick >= pickMin && p.pick <= pickMax)
    } else if (insightsRound === 'All') {
      all = JAZZ_DRAFT_HISTORY
    } else {
      all = JAZZ_DRAFT_HISTORY.filter(p => p.round === Number(insightsRound))
    }
    const r1 = all.filter(p => p.round === 1)
    const nonTbd = all.filter(p => p.peakTier !== 'tbd')
    const allStarPlus = all.filter(p => ['all-star', 'all-nba', 'hof'].includes(p.peakTier))
    const hofs = all.filter(p => p.peakTier === 'hof')
    const pickPool = insightsRound === 'All' ? r1 : all
    const avgPick = pickPool.length ? (pickPool.reduce((s, p) => s + p.pick, 0) / pickPool.length).toFixed(1) : '—'
    const avgCareer = nonTbd.length ? (nonTbd.reduce((s, p) => s + p.yearsNba, 0) / nonTbd.length).toFixed(1) : '—'
    const avgJazz = nonTbd.length ? (nonTbd.reduce((s, p) => s + p.yearsWithJazz, 0) / nonTbd.length).toFixed(1) : '—'
    const hitRate = nonTbd.length ? ((allStarPlus.length / nonTbd.length) * 100).toFixed(0) : 0
    const r1NonTbd = r1.filter(p => p.peakTier !== 'tbd')
    const r1AllStar = r1.filter(p => ['all-star', 'all-nba', 'hof'].includes(p.peakTier))
    const r1HitRate = r1NonTbd.length ? ((r1AllStar.length / r1NonTbd.length) * 100).toFixed(0) : 0

    const tierCounts = {}
    for (const key of Object.keys(TIERS)) tierCounts[key] = 0
    for (const p of nonTbd) tierCounts[p.peakTier] = (tierCounts[p.peakTier] || 0) + 1

    const isFiltered = insightsRound !== 'All'
    return { total: all.length, avgPick, allStarCount: allStarPlus.length, hitRate, r1HitRate, hofCount: hofs.length, avgCareer, avgJazz, tierCounts, nonTbdCount: nonTbd.length, isFiltered }
  }, [insightsRound, pickMin, pickMax])

  // ── Filtered + sorted data ──
  const filtered = useMemo(() => {
    let data = [...JAZZ_DRAFT_HISTORY]
    if (tierFilter !== 'All') data = data.filter(p => p.peakTier === tierFilter)
    if (roundFilter !== 'All') data = data.filter(p => p.round === Number(roundFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(q) || (p.college || '').toLowerCase().includes(q))
    }

    data.sort((a, b) => {
      let av, bv
      switch (sortCol) {
        case 'year': av = a.year * 100 + a.pick; bv = b.year * 100 + b.pick; break
        case 'round': av = a.round; bv = b.round; break
        case 'pick': av = a.pick; bv = b.pick; break
        case 'name': return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        case 'college': return sortDir === 'asc' ? (a.college || '').localeCompare(b.college || '') : (b.college || '').localeCompare(a.college || '')
        case 'age': av = a.ageAtDraft || 0; bv = b.ageAtDraft || 0; break
        case 'yearsNba': av = a.yearsNba; bv = b.yearsNba; break
        case 'yearsWithJazz': av = a.yearsWithJazz; bv = b.yearsWithJazz; break
        case 'tier': {
          const rank = { hof: 7, 'all-nba': 6, 'all-star': 5, starter: 4, rotation: 3, bust: 2, tbd: 1 }
          av = rank[a.peakTier] || 0; bv = rank[b.peakTier] || 0; break
        }
        case 'note': return sortDir === 'asc' ? (a.note || '').localeCompare(b.note || '') : (b.note || '').localeCompare(a.note || '')
        default: av = a.year; bv = b.year
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return data
  }, [tierFilter, roundFilter, search, sortCol, sortDir])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir(col === 'name' || col === 'college' || col === 'note' ? 'asc' : 'desc') }
  }

  const sortArrow = col => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  const TABLE_COLS = [
    { key: 'year', label: 'Year' },
    { key: 'round', label: 'Rd' },
    { key: 'pick', label: 'Pick' },
    { key: 'name', label: 'Player' },
    { key: 'college', label: 'College' },
    { key: 'age', label: 'Age' },
    { key: 'yearsNba', label: 'NBA Yrs' },
    { key: 'yearsWithJazz', label: 'Jazz Yrs' },
    { key: 'tier', label: 'Tier' },
    { key: 'note', label: 'Notes' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        style={{ background: 'var(--sch-black)', height: 70, overflow: 'visible' }}
        className="px-6 border-b-[3px] border-[var(--sch-teal-bright)]"
      >
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-5 h-full">
            <a href="https://www.saltcityhoops.com" target="_blank" rel="noopener noreferrer">
              <img
                src="/sch-logo.svg"
                alt="Salt City Hoops"
                style={{
                  width: 73, height: 64, flexShrink: 0, alignSelf: 'flex-start', marginTop: 19,
                  position: 'relative', zIndex: 21,
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
                Jazz Draft History
              </h1>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs font-semibold px-3 py-1.5 rounded"
            style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
        {/* ── Insights Section ── */}
        <section>
          <div className="mb-3 flex flex-wrap items-baseline gap-3 justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Draft Insights
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>1974–2025 · New Orleans / Utah Jazz</span>
            </div>
            <InsightsRoundFilter value={insightsRound} onChange={setInsightsRound} pickMin={pickMin} pickMax={pickMax} onPickMin={setPickMin} onPickMax={setPickMax} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InsightCard label="Total Picks" value={insights.total} />
            <InsightCard label={insightsRound === 'All' ? 'Avg 1st Rd Pick' : 'Avg Pick #'} value={`#${insights.avgPick}`} mono />
            <InsightCard label="All-Stars Drafted" value={insights.allStarCount} sub={insights.isFiltered ? `${insights.hitRate}% hit rate` : `${insights.hitRate}% overall · ${insights.r1HitRate}% 1st round`} />
            <InsightCard label="Hall of Famers" value={insights.hofCount} sub="Drafted by Jazz" />
            <InsightCard label="Avg NBA Career" value={`${insights.avgCareer} yrs`} mono />
            <InsightCard label="Avg Years on Jazz" value={`${insights.avgJazz} yrs`} mono />
            <div
              className="rounded-xl px-4 py-4 col-span-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Tier Breakdown
              </div>
              <TierBar tierCounts={insights.tierCounts} nonTbdCount={insights.nonTbdCount} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {Object.entries(TIERS).filter(([k]) => k !== 'tbd').map(([key, t]) => (
                  <span key={key} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: t.bg, border: `1px solid ${t.color}` }} />
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter Bar ── */}
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <FilterGroup
              label="Tier"
              options={TIER_FILTERS}
              value={tierFilter}
              onChange={setTierFilter}
              renderLabel={o => o === 'All' ? 'All' : (TIERS[o]?.label || o)}
            />
            <FilterGroup label="Round" options={ROUNDS} value={roundFilter} onChange={setRoundFilter} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Player or college…"
                className="text-xs rounded-lg px-3 py-1.5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', width: isMobile ? 140 : 180 }}
              />
            </div>
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
            Showing {filtered.length} of {JAZZ_DRAFT_HISTORY.length} picks
          </div>
        </section>

        {/* ── Draft Table / Cards ── */}
        <section>
          <div className="mb-2 flex items-baseline gap-3">
            <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              All Picks
            </h2>
          </div>

          {!isMobile ? (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sch-black)' }}>
                    {TABLE_COLS.map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-[10px] font-bold uppercase tracking-widest text-left px-3 py-2.5 select-none"
                        style={{ color: sortCol === col.key ? 'var(--sch-teal-bright)' : 'white', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
                      >
                        {col.label}{sortArrow(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={`${p.year}-${p.round}-${p.pick}`}
                      style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--text)' }}>{p.year}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{p.round}</td>
                      <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--text)' }}>{p.pick}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <PlayerPhoto espnId={p.espnId} name={p.name} size={28} />
                          <div>
                            <span className="font-semibold" style={{ color: 'var(--text)' }}>{p.name}</span>
                            <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-faint)' }}>{p.position}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{p.college}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{p.ageAtDraft ? p.ageAtDraft.toFixed(1) : '—'}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-flex items-center gap-1.5">
                          {p.yearsNba}
                          {ACTIVE_PLAYERS.has(p.name) && <ActiveDot />}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{p.yearsWithJazz}</td>
                      <td className="px-3 py-2"><TierBadge tier={p.peakTier} /></td>
                      <td className="px-3 py-2 text-[10px]" style={{ color: 'var(--text-faint)', maxWidth: 200 }}>{p.note}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center" style={{ color: 'var(--text-faint)' }}>
                        No picks match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <div
                  key={`${p.year}-${p.round}-${p.pick}`}
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      {p.year} · Rd {p.round} · Pick {p.pick}
                    </span>
                    <TierBadge tier={p.peakTier} />
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayerPhoto espnId={p.espnId} name={p.name} size={32} />
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{p.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.position} · {p.college}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1.5 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {p.ageAtDraft && <span>Age: {p.ageAtDraft.toFixed(1)}</span>}
                    <span className="inline-flex items-center gap-1">
                      NBA: {p.yearsNba} yrs
                      {ACTIVE_PLAYERS.has(p.name) && <ActiveDot />}
                    </span>
                    <span>Jazz: {p.yearsWithJazz} yrs</span>
                    {p.stillOnTeam && <span style={{ color: 'var(--accent-teal)' }}>On roster</span>}
                  </div>
                  {p.note && <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>{p.note}</div>}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-xs" style={{ color: 'var(--text-faint)' }}>No picks match your filters.</div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-faint)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sch-teal)' }} />
              Active Player
            </span>
          </div>
        </section>

        {/* ── Draft Trivia Section ── */}
        <InterestingStats />
      </main>
    </div>
  )
}

function ActiveDot() {
  const [show, setShow] = useState(false)
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: 16, height: 16, cursor: 'default' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--sch-teal)' }} />
      {show && (
        <span
          className="absolute z-50 rounded-lg text-[11px] font-normal whitespace-nowrap"
          style={{
            bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6,
            padding: '8px 10px',
            background: 'var(--sch-black)', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          Active Player
        </span>
      )}
    </span>
  )
}

function TierBar({ tierCounts, nonTbdCount }) {
  const [animated, setAnimated] = useState(false)
  const [hoveredTier, setHoveredTier] = useState(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex rounded overflow-hidden h-7">
      {Object.entries(TIERS).filter(([k]) => k !== 'tbd').map(([key, t]) => {
        const pct = nonTbdCount ? (tierCounts[key] / nonTbdCount) * 100 : 0
        if (pct === 0) return null
        return (
          <div
            key={key}
            className="relative flex items-center justify-center"
            style={{
              width: animated ? `${pct}%` : '0%',
              background: t.bg,
              borderRight: '1px solid white',
              minWidth: animated && pct > 0 ? 2 : 0,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'visible',
            }}
            onMouseEnter={() => setHoveredTier(key)}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <span className="text-[9px] font-bold" style={{ color: t.color, opacity: animated ? 1 : 0, transition: 'opacity 0.4s 0.6s' }}>
              {pct.toFixed(0)}%
            </span>
            {hoveredTier === key && (
              <span
                className="absolute z-50 rounded-lg text-[11px] font-normal whitespace-nowrap"
                style={{
                  bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6,
                  padding: '8px 10px',
                  background: 'var(--sch-black)', color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                }}
              >
                {t.label}: {tierCounts[key]} picks ({pct.toFixed(0)}%)
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InsightCard({ label, value, sub, mono }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${mono ? 'tabular-nums' : ''}`}
        style={{ color: 'var(--text)', fontFamily: mono ? 'monospace' : undefined }}
      >
        {value}
      </div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</div>}
    </div>
  )
}

function InsightsRoundFilter({ value, onChange, pickMin, pickMax, onPickMin, onPickMax }) {
  const opts = ['All', '1', '2', 'Range']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>Round</span>
      {opts.map(val => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${value === val ? '' : 'btn-secondary'}`}
          style={{
            background: value === val ? 'var(--sch-black)' : 'var(--bg-raised)',
            color: value === val ? 'white' : 'var(--text-muted)',
            border: `1px solid ${value === val ? 'var(--sch-black)' : 'var(--border)'}`,
            cursor: 'pointer',
          }}
        >
          {val}
        </button>
      ))}
      {value === 'Range' && (
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Picks</span>
          <input
            type="number" min={1} max={60} value={pickMin}
            onChange={e => onPickMin(Math.max(1, Number(e.target.value) || 1))}
            className="text-[11px] font-mono font-bold rounded text-center"
            style={{ width: 38, padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>–</span>
          <input
            type="number" min={1} max={60} value={pickMax}
            onChange={e => onPickMax(Math.max(1, Number(e.target.value) || 1))}
            className="text-[11px] font-mono font-bold rounded text-center"
            style={{ width: 38, padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
          />
        </div>
      )}
    </div>
  )
}

const POSITION_COLORS = {
  PG: { color: '#1d4ed8', bg: '#dbeafe' },
  SG: { color: '#7c3aed', bg: '#ede9fe' },
  SF: { color: '#15803d', bg: '#dcfce7' },
  PF: { color: '#b45309', bg: '#fef3c7' },
  C:  { color: '#dc2626', bg: '#fee2e2' },
}

function InterestingStats() {
  const stats = useMemo(() => {
    const all = JAZZ_DRAFT_HISTORY

    // Top 5 colleges
    const collegeCounts = {}
    for (const p of all) {
      if (p.college) collegeCounts[p.college] = (collegeCounts[p.college] || 0) + 1
    }
    const topColleges = Object.entries(collegeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // Position breakdown
    const posCounts = {}
    for (const p of all) posCounts[p.position] = (posCounts[p.position] || 0) + 1

    // Shortest & tallest
    const withHeight = all.filter(p => p.heightIn)
    const shortest = withHeight.length ? [...withHeight].sort((a, b) => a.heightIn - b.heightIn)[0] : null
    const tallest = withHeight.length ? [...withHeight].sort((a, b) => b.heightIn - a.heightIn)[0] : null

    // Best college stats
    const withStats = all.filter(p => p.collegeStats)
    const bestPpg = withStats.length ? [...withStats].sort((a, b) => (b.collegeStats.ppg || 0) - (a.collegeStats.ppg || 0))[0] : null
    const bestRpg = withStats.length ? [...withStats].sort((a, b) => (b.collegeStats.rpg || 0) - (a.collegeStats.rpg || 0))[0] : null
    const bestApg = withStats.length ? [...withStats].sort((a, b) => (b.collegeStats.apg || 0) - (a.collegeStats.apg || 0))[0] : null
    const best3p = withStats.filter(p => p.collegeStats.threePct).length
      ? [...withStats].filter(p => p.collegeStats.threePct).sort((a, b) => b.collegeStats.threePct - a.collegeStats.threePct)[0] : null

    // Countries
    const countryCounts = {}
    for (const p of all) {
      const c = p.country || 'USA'
      countryCounts[c] = (countryCounts[c] || 0) + 1
    }
    const countries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])
    const intlCount = all.filter(p => p.country && p.country !== 'USA').length

    return { topColleges, posCounts, shortest, tallest, bestPpg, bestRpg, bestApg, best3p, countries, intlCount }
  }, [])

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          Draft Trivia
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Top 5 Colleges */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Top Colleges
          </div>
          <div className="space-y-1.5">
            {stats.topColleges.map(([college, count], i) => (
              <div key={college} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono w-4" style={{ color: 'var(--text-faint)' }}>{i + 1}.</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{college}</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Position Breakdown */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Position Breakdown
          </div>
          <div className="space-y-1.5">
            {['PG', 'SG', 'SF', 'PF', 'C'].map(pos => {
              const count = stats.posCounts[pos] || 0
              const pct = JAZZ_DRAFT_HISTORY.length ? (count / JAZZ_DRAFT_HISTORY.length * 100).toFixed(0) : 0
              const colors = POSITION_COLORS[pos]
              return (
                <div key={pos} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: colors.color, background: colors.bg, minWidth: 28, textAlign: 'center' }}>{pos}</span>
                  <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                    <div className="h-full rounded" style={{ width: `${pct}%`, background: colors.bg, transition: 'width 0.6s ease' }} />
                  </div>
                  <span className="text-[10px] font-bold font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Height Extremes */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Height Extremes
          </div>
          {stats.shortest && stats.tallest ? (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Shortest</div>
                <div className="flex items-center gap-2">
                  <PlayerPhoto espnId={stats.shortest.espnId} name={stats.shortest.name} size={24} />
                  <div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{stats.shortest.name}</span>
                    <span className="text-xs font-mono font-bold ml-1.5" style={{ color: 'var(--accent)' }}>{stats.shortest.height}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Tallest</div>
                <div className="flex items-center gap-2">
                  <PlayerPhoto espnId={stats.tallest.espnId} name={stats.tallest.name} size={24} />
                  <div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{stats.tallest.name}</span>
                    <span className="text-xs font-mono font-bold ml-1.5" style={{ color: 'var(--accent)' }}>{stats.tallest.height}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Loading…</div>
          )}
        </div>

        {/* Best College Stats */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Best College Stats
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'PPG', player: stats.bestPpg, val: stats.bestPpg?.collegeStats?.ppg },
              { label: 'RPG', player: stats.bestRpg, val: stats.bestRpg?.collegeStats?.rpg },
              { label: 'APG', player: stats.bestApg, val: stats.bestApg?.collegeStats?.apg },
              { label: '3P%', player: stats.best3p, val: stats.best3p?.collegeStats?.threePct },
            ].map(({ label, player, val }) => player ? (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold uppercase w-7 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{label}</span>
                  <PlayerPhoto espnId={player.espnId} name={player.name} size={20} />
                  <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{player.name}</span>
                </div>
                <span className="text-xs font-bold font-mono flex-shrink-0 ml-2" style={{ color: 'var(--text)' }}>
                  {label === '3P%' ? `${val.toFixed(1)}%` : val.toFixed(1)}
                </span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Countries */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Countries Drafted From
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>{stats.countries.length}</div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>{stats.intlCount} international picks</div>
          <div className="flex flex-wrap gap-1">
            {stats.countries.filter(([c]) => c !== 'USA').map(([country, count]) => (
              <span key={country} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {country} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Draft Night Trades */}
        <div className="rounded-xl px-4 py-4" style={cardStyle}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Draft Night Trades
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
            {DRAFT_NIGHT_TRADES.map((t, i) => (
              <div key={i} className="text-xs" style={{ borderBottom: i < DRAFT_NIGHT_TRADES.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: 6 }}>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{t.year}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.type === 'out' ? '' : ''}`}
                    style={{ background: t.type === 'out' ? '#fee2e2' : '#dcfce7', color: t.type === 'out' ? '#dc2626' : '#15803d' }}>
                    {t.type === 'out' ? 'TRADED AWAY' : 'ACQUIRED'}
                  </span>
                </div>
                <div className="font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
                  {t.player} <span style={{ color: 'var(--text-faint)' }}>#{t.pick}</span>
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{t.details}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

function FilterGroup({ label, options, value, onChange, renderLabel }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {options.map(o => {
        const active = value === o
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${active ? '' : 'btn-secondary'}`}
            style={{
              background: active ? 'var(--sch-black)' : 'var(--bg-raised)',
              color: active ? 'white' : 'var(--text-muted)',
              border: `1px solid ${active ? 'var(--sch-black)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
          >
            {renderLabel ? renderLabel(o) : o}
          </button>
        )
      })}
    </div>
  )
}
