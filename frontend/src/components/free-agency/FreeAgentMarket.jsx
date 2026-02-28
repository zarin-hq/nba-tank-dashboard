import { useState, useMemo } from 'react'
import FREE_AGENTS from '../../data/free-agents'
import { CAP_NUMBERS, EXPIRING, getVetMin } from '../../data/jazz-contracts'
import useIsMobile from '../../hooks/useIsMobile'

const fmt = n => `$${(n / 1_000_000).toFixed(1)}M`
const shortName = name => { const parts = (name || '').split(' '); return parts.length < 2 ? name : `${parts[0][0]}. ${parts.slice(1).join(' ')}` }
const headshotUrl = id => `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=48&h=35`

function PlayerPhoto({ espnId, name, size = 28 }) {
  if (espnId) return <img src={headshotUrl(espnId)} alt="" className="rounded-full" style={{ width: size, height: size, objectFit: 'cover' }} />
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: 'var(--bg-raised)', color: 'var(--text-faint)', fontSize: size * 0.38, fontWeight: 700 }}>
      {initials}
    </div>
  )
}

function InfoTip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg style={{ width: 13, height: 13, color: 'var(--text-faint)' }} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
      {show && (
        <span
          className="absolute z-50 rounded-lg text-[11px] font-normal normal-case tracking-normal text-left leading-snug"
          style={{
            top: '100%', right: 0, marginTop: 6,
            width: 220, padding: '8px 10px',
            background: 'var(--sch-black)', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          {text}
        </span>
      )}
    </span>
  )
}

const POSITIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C']
const TYPES = ['All', 'UFA', 'RFA', 'PO', 'TO']

export default function FreeAgentMarket({ state, dispatch, computed, waivedPlayers }) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState('salary') // 'salary' | 'age'
  const [sortDir, setSortDir] = useState('desc')  // 'asc' | 'desc'
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customPlayer, setCustomPlayer] = useState({ name: '', position: 'PG', salary: '' })

  // Combine curated list + Jazz expiring + waived players (not already signed)
  const allAgents = useMemo(() => {
    const signedNames = new Set(state.signedFAs.map(fa => fa.name))
    const agents = [...FREE_AGENTS]

    // Add Jazz's own free agents
    EXPIRING.forEach(p => {
      if (!agents.some(a => a.name === p.name)) {
        agents.push({ name: p.name, espnId: p.espnId, position: p.position, age: null, team: 'UTA', type: p.faType, estimatedSalary: 5_000_000, yearsExp: p.yearsExp })
      }
    })

    // Add waived players
    waivedPlayers.forEach(p => {
      if (!agents.some(a => a.name === p.name)) {
        agents.push({ name: p.name, espnId: p.espnId, position: p.position, age: null, team: 'UTA', type: p.faType, estimatedSalary: Math.round(p.salary * 0.7), yearsExp: p.yearsExp })
      }
    })

    return agents.filter(a => !signedNames.has(a.name))
  }, [state.signedFAs, waivedPlayers])

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
    setShowAll(false)
  }

  const filtered = useMemo(() => {
    return allAgents.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (posFilter !== 'All' && !a.position.includes(posFilter)) return false
      if (typeFilter !== 'All' && a.type !== typeFilter) return false
      return true
    }).sort((a, b) => {
      const key = sortBy === 'salary' ? 'estimatedSalary' : 'age'
      const av = a[key] || 0, bv = b[key] || 0
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [allAgents, search, posFilter, typeFilter, sortBy, sortDir])

  const VISIBLE_LIMIT = 20
  const visibleAgents = showAll ? filtered : filtered.slice(0, VISIBLE_LIMIT)
  const hasMore = filtered.length > VISIBLE_LIMIT

  function signPlayer(player, signingType, customSalary) {
    let salary = player.estimatedSalary
    if (signingType === 'vet_min') salary = getVetMin(player.yearsExp ?? 3)
    else if (signingType === 'mle') salary = customSalary || Math.min(player.estimatedSalary, CAP_NUMBERS.mle)

    dispatch({
      type: 'SIGN_FA',
      payload: {
        name: player.name,
        position: player.position,
        salary,
        signingType,
        age: player.age,
        team: player.team,
        originalType: player.type,
        espnId: player.espnId,
      },
    })
  }

  function addCustomPlayer() {
    if (!customPlayer.name || !customPlayer.salary) return
    dispatch({
      type: 'SIGN_FA',
      payload: {
        name: customPlayer.name,
        position: customPlayer.position,
        salary: Number(customPlayer.salary) * 1_000_000,
        signingType: 'custom',
      },
    })
    setCustomPlayer({ name: '', position: 'PG', salary: '' })
    setShowCustomForm(false)
  }

  return (
    <div className="space-y-3">
      {/* Your Signings */}
      {state.signedFAs.length > 0 && (
        <div className="rounded-xl px-4 py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Your Signings
          </div>
          <div className="flex flex-wrap gap-2">
            {state.signedFAs.map((fa, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{fa.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fa.position}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--sch-black)' }}>{fmt(fa.salary)}</span>
                <span className="text-[10px] uppercase inline-flex items-center" style={{ color: 'var(--text-faint)', lineHeight: 1 }}>
                  {fa.signingType === 'mle' ? 'MLE' : fa.signingType === 'vet_min' ? 'MIN' : 'CUSTOM'}
                </span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_FA', index: i })}
                  className="text-xs ml-1 leading-none btn-x"
                  style={{ color: 'var(--sch-black)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 700, padding: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="flex flex-wrap items-center gap-3 mb-3 px-4">
          <div className="relative flex-1" style={{ minWidth: 150 }}>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowAll(false) }}
              placeholder="Search players..."
              className="px-3 py-1.5 rounded text-sm w-full"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', paddingRight: search ? 28 : 12 }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setShowAll(false) }}
                className="absolute right-1.5 top-1/2 flex items-center justify-center"
                style={{ transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: '50%', background: 'var(--text-muted)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                ×
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {POSITIONS.map(p => (
              <button key={p} onClick={() => { setPosFilter(p); setShowAll(false) }}
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${posFilter === p ? '' : 'btn-secondary'}`}
                style={{
                  background: posFilter === p ? 'var(--sch-black)' : 'var(--bg-raised)',
                  color: posFilter === p ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${posFilter === p ? 'var(--sch-black)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setShowAll(false) }}
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${typeFilter === t ? '' : 'btn-secondary'}`}
                style={{
                  background: typeFilter === t ? 'var(--sch-black)' : 'var(--bg-raised)',
                  color: typeFilter === t ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${typeFilter === t ? 'var(--sch-black)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Agent list */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sch-black)' }}>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-left" style={{ color: 'rgba(255,255,255,0.7)', position: 'sticky', left: 0, zIndex: 3, background: 'var(--sch-black)' }}>Player</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>Pos</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: sortBy === 'age' ? '#fff' : 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => toggleSort('age')}>
                  Age {sortBy === 'age' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>Team</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>Type</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: sortBy === 'salary' ? '#fff' : 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => toggleSort('salary')}>
                  <span className="inline-flex items-center gap-1 justify-center">
                    Est. Salary {sortBy === 'salary' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    <InfoTip text="Estimated annual salary based on projections from Spotrac, Hoops Rumors, and Basketball Reference. These are rough estimates — actual contracts will vary." />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span className="inline-flex items-center gap-1 justify-center">
                    Sign
                    <InfoTip text="The Jazz project to be over the salary cap, so their primary signing tools are the Mid-Level Exception (MLE) and veteran minimum contracts." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleAgents.map(agent => (
                <AgentRow key={agent.name} agent={agent} onSign={signPlayer} isMobile={isMobile} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No matching free agents</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && !showAll && (
          <div className="px-4 mt-2">
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs font-semibold py-2 rounded btn-secondary"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Show all {filtered.length} players
            </button>
          </div>
        )}

        {/* Custom player */}
        <div className="mt-3 px-4">
          {showCustomForm ? (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input type="text" value={customPlayer.name} onChange={e => setCustomPlayer(p => ({ ...p, name: e.target.value }))}
                  className="px-3 py-1.5 rounded text-sm" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Position</label>
                <select value={customPlayer.position} onChange={e => setCustomPlayer(p => ({ ...p, position: e.target.value }))}
                  className="px-3 py-1.5 rounded text-sm" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
                  {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Salary ($M)</label>
                <input type="number" step="0.1" min="0" value={customPlayer.salary}
                  onChange={e => setCustomPlayer(p => ({ ...p, salary: e.target.value }))}
                  className="px-3 py-1.5 rounded text-sm w-20" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
              </div>
              <button onClick={addCustomPlayer}
                className="text-xs font-bold px-3 py-1.5 rounded btn-teal"
                style={{ background: 'var(--sch-teal)', color: 'var(--sch-black)', border: 'none', cursor: 'pointer' }}>
                Add
              </button>
              <button onClick={() => setShowCustomForm(false)}
                className="text-xs px-3 py-1.5 rounded btn-secondary"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowCustomForm(true)}
              className="text-xs font-semibold btn-link"
              style={{ color: 'var(--accent-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
              + Add Custom Player
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentRow({ agent, onSign, isMobile }) {
  const [showMle, setShowMle] = useState(false)
  const [mleSalary, setMleSalary] = useState('')

  const mleMax = +(CAP_NUMBERS.mle / 1_000_000).toFixed(1)

  function handleMleClick() {
    setShowMle(true)
    setMleSalary(mleMax)
  }

  function handleMleSign() {
    if (!mleSalary || Number(mleSalary) <= 0) return
    onSign(agent, 'mle', Number(mleSalary) * 1_000_000)
  }

  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)' }}
      className="transition-colors"
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--sch-smoke)'
        const sticky = e.currentTarget.querySelector('[data-sticky]')
        if (sticky) sticky.style.background = 'var(--sch-smoke)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ''
        const sticky = e.currentTarget.querySelector('[data-sticky]')
        if (sticky) sticky.style.background = 'var(--bg-card)'
      }}
    >
      <td data-sticky className="px-3 py-2 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text)', position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '2px 0 4px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <PlayerPhoto espnId={agent.espnId} name={agent.name} />
          {isMobile ? shortName(agent.name) : agent.name}
        </div>
      </td>
      <td className="px-3 py-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>{agent.position}</td>
      <td className="px-3 py-2 text-xs text-center tabular-nums" style={{ color: 'var(--text-muted)' }}>{agent.age || '—'}</td>
      <td className="px-3 py-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>{agent.team}</td>
      <td className="px-3 py-2 text-center">
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{
            background: agent.type === 'UFA' ? 'rgba(5,32,101,0.08)' : agent.type === 'RFA' ? 'rgba(29,109,170,0.1)' : 'rgba(245,158,11,0.1)',
            color: agent.type === 'UFA' ? 'var(--accent)' : agent.type === 'RFA' ? 'var(--accent-2)' : '#b45309',
          }}>
          {agent.type}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-center tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {fmt(agent.estimatedSalary)}
      </td>
      <td className="px-3 py-2 text-center">
        <div className="inline-flex items-center gap-2">
          {showMle ? (
            <div className="inline-flex items-center gap-1">
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={mleSalary}
                onChange={e => { const v = e.target.value; setMleSalary(v === '' ? '' : Math.min(Number(v), mleMax)) }}
                max={mleMax}
                placeholder="M"
                className="px-1.5 py-0.5 rounded text-xs tabular-nums w-16"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>M</span>
              <button
                onClick={handleMleSign}
                className="text-[10px] font-bold px-3 py-1 rounded cursor-pointer btn-dark"
                style={{ background: 'var(--sch-black)', color: 'white', border: 'none' }}
              >
                Sign
              </button>
              <button
                onClick={() => setShowMle(false)}
                className="text-[10px] font-bold px-1 py-1 cursor-pointer btn-x"
                style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onSign(agent, 'vet_min')}
                className="text-[10px] font-bold uppercase px-2 rounded cursor-pointer inline-flex items-center justify-center btn-secondary"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', height: 24, lineHeight: 1 }}
              >
                + Min
              </button>
              <button
                onClick={handleMleClick}
                className="text-[10px] font-bold uppercase px-2 rounded cursor-pointer inline-flex items-center justify-center btn-secondary"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', height: 24, lineHeight: 1 }}
              >
                + MLE
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
