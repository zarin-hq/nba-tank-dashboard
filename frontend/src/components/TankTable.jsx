import { useState } from 'react'

const JAZZ_ID = 1610612762
const PICKS = Array.from({ length: 14 }, (_, i) => i + 1)

// team_id → which team receives that pick (pick is owed to them)
const PICK_OWED_TO = {
  1610612740: 'ATL',  // New Orleans Pelicans → Atlanta Hawks
  1610612746: 'OKC',  // LA Clippers → Oklahoma City Thunder
  1610612737: 'SAS',  // Atlanta Hawks → San Antonio Spurs
}

function fmt(val, d = 1) {
  return val == null ? '—' : Number(val).toFixed(d)
}

function TeamLogo({ teamId }) {
  return (
    <img
      src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
      alt="" className="w-6 h-6 object-contain flex-shrink-0"
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

function Th({ children, divider = false, compact = false, className = '' }) {
  return (
    <th
      className={`${compact ? 'px-1.5 py-2' : 'px-2.5 py-2'} text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${className}`}
      style={{
        color: 'rgba(255,255,255,0.6)',
        borderLeft: divider ? '1px solid rgba(255,255,255,0.1)' : undefined,
        paddingLeft: divider ? (compact ? 6 : 12) : undefined,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, divider = false, compact = false, className = '', extraStyle = {} }) {
  return (
    <td
      className={`${compact ? 'px-1.5 py-2' : 'px-2.5 py-2'} text-sm whitespace-nowrap ${className}`}
      style={{
        borderLeft: divider ? '1px solid var(--border)' : undefined,
        paddingLeft: divider ? (compact ? 6 : 12) : undefined,
        ...extraStyle,
      }}
    >
      {children}
    </td>
  )
}

export default function TankTable({ data, loading, error }) {
  const [showAll, setShowAll] = useState(false)

  if (loading) return (
    <div className="overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
      <div className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--bg-raised)' }} />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="rounded p-4 text-sm" style={{ background: '#ffdede', border: '1px solid #ea384c', color: '#ea384c' }}>
      Error: {error}
    </div>
  )

  if (!data?.length) return null

  return (
    <div className="overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 16 }}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1300px]">
          <thead>
            <tr style={{ background: 'var(--sch-black)' }}>
              <Th>#</Th>
              <Th className="min-w-[160px]">Team</Th>
              <Th>W–L</Th>
              <Th>GB</Th>
              <Th>L10</Th>
              <Th>STRK</Th>
              <Th>NET RTG</Th>
              <Th>OFF</Th>
              <Th>DEF</Th>
              <Th>REM SOS</Th>
              <Th>TOP 4%</Th>
              <Th divider compact>P1</Th>
              {PICKS.slice(1).map(p => <Th key={p} compact>P{p}</Th>)}
            </tr>
          </thead>
          <tbody>
            {(showAll ? data : data.slice(0, 10)).map((team, i) => {
              const isJazz = team.team_id === JAZZ_ID
              const isEven = i % 2 === 0
              const rowBg = isJazz
                ? 'rgba(5,32,101,0.05)'
                : isEven ? 'var(--bg-card)' : 'var(--bg-raised)'

              return (
                <tr key={team.team_id}
                  style={{
                    background: rowBg,
                    borderTop: isJazz ? '1px solid var(--sch-black)' : undefined,
                    borderBottom: isJazz ? '1px solid var(--sch-black)' : '1px solid var(--border)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--sch-smoke)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = rowBg }}
                >
                  <Td extraStyle={isJazz ? { borderLeft: '1px solid var(--sch-black)' } : {}}>
                    <span style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{team.lottery_slot}</span>
                  </Td>

                  <Td extraStyle={{ paddingRight: 26 }}>
                    <div className="flex items-center gap-2">
                      <TeamLogo teamId={team.team_id} />
                      <span className="font-semibold"
                        style={{ color: isJazz ? 'var(--accent)' : 'var(--text)' }}>
                        {team.team_city} {team.team_name}
                      </span>
                      {PICK_OWED_TO[team.team_id] && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}
                          title={`This pick is owed to ${PICK_OWED_TO[team.team_id]}`}
                        >
                          → {PICK_OWED_TO[team.team_id]}
                        </span>
                      )}
                    </div>
                  </Td>

                  <Td>
                    <span className="font-mono" style={{ color: 'var(--text)' }}>
                      {team.wins}–{team.losses}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-mono" style={{ color: 'var(--text)' }}>
                      {team.gb === 0
                        ? <span style={{ fontWeight: 700 }}>—</span>
                        : `+${fmt(team.gb)}`}
                    </span>
                  </Td>

                  <Td><span style={{ color: 'var(--text)' }}>{team.l10 || '—'}</span></Td>

                  <Td>
                    <span style={{ color: team.streak ? (team.streak.startsWith('W') ? '#16a34a' : '#dc2626') : 'var(--text)' }}>
                      {team.streak || '—'}
                    </span>
                  </Td>

                  <Td>
                    <span style={{ color: 'var(--text)' }}>
                      {team.net_rtg != null ? (team.net_rtg > 0 ? '+' : '') + fmt(team.net_rtg) : '—'}
                    </span>
                  </Td>

                  <Td><span className="font-mono" style={{ color: 'var(--text)' }}>
                    {team.off_rtg_rank ? <span title={`OFF: ${fmt(team.off_rtg)}`}>#{team.off_rtg_rank}</span> : '—'}
                  </span></Td>

                  <Td><span className="font-mono" style={{ color: 'var(--text)' }}>
                    {team.def_rtg_rank ? <span title={`DEF: ${fmt(team.def_rtg)}`}>#{team.def_rtg_rank}</span> : '—'}
                  </span></Td>

                  <Td>
                    {team.sos != null
                      ? <span className="font-mono" style={{ color: team.sos > 0.5 ? '#dc2626' : 'var(--accent-2)' }}>
                          .{String(Math.round(team.sos * 1000)).padStart(3, '0')}
                        </span>
                      : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                  </Td>

                  <Td>
                    <span className="font-bold" style={{ color: 'var(--text)' }}>
                      {team.top4_odds != null ? `${fmt(team.top4_odds)}%` : '—'}
                    </span>
                  </Td>

                  {PICKS.map((p, idx) => (
                    <Td key={p} divider={idx === 0} compact
                      extraStyle={isJazz && idx === PICKS.length - 1 ? { borderRight: '1px solid var(--sch-black)' } : {}}>
                      <OddsCell pct={team.pick_odds?.[String(p)]} />
                    </Td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!showAll && data.length > 10 && (
        <div className="flex justify-center py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wide"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            See more
          </button>
        </div>
      )}
    </div>
  )
}


function OddsCell({ pct }) {
  if (!pct) return <span className="text-xs" style={{ color: 'var(--border-med)' }}>—</span>
  const intensity = Math.min(1, pct / 15)
  const alpha = 0.25 + intensity * 0.75
  return (
    <span className="font-mono text-xs"
      style={{ color: `rgba(0,0,0,${alpha})`, fontWeight: pct >= 10 ? 600 : 400 }}>
      {Number(pct).toFixed(1)}%
    </span>
  )
}
