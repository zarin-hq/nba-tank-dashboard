import { GUARANTEED, NON_GUARANTEED, RFA_DECISIONS, TEAM_OPTIONS } from '../../data/jazz-contracts'
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

function SegmentedControl({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => { if (!active) onChange(opt.value) }}
            className={`text-[10px] font-bold uppercase px-2 py-0.5 cursor-pointer ${active ? '' : 'btn-secondary'}`}
            style={{
              background: active ? 'var(--sch-black)' : 'var(--bg-raised)',
              color: active ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function CurrentRoster({ state, dispatch }) {
  const isMobile = useIsMobile()
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Table header */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--sch-black)' }}>
              <Th sticky>Player</Th>
              <Th align="center">Pos</Th>
              <Th align="right">Salary</Th>
              <Th align="center">Status</Th>
              <Th align="center">Decision</Th>
            </tr>
          </thead>
          <tbody>
            {/* Guaranteed contracts */}
            <GroupLabel label="Guaranteed" />
            {GUARANTEED.map(p => (
              <Row key={p.name} player={p} status="Guaranteed" statusColor="var(--sch-teal)" isMobile={isMobile} />
            ))}

            {/* Non-guaranteed */}
            <GroupLabel label="Non-Guaranteed" />
            {NON_GUARANTEED.map(p => {
              const kept = state.nonGuaranteedDecisions[p.name] === 'keep'
              return (
                <Row key={p.name} player={p} status={kept ? 'Guaranteed' : 'Declined'} statusColor={kept ? 'var(--sch-teal)' : 'var(--text-muted)'} isMobile={isMobile}>
                  <SegmentedControl
                    value={state.nonGuaranteedDecisions[p.name]}
                    options={[
                      { value: 'keep', label: 'Guarantee', activeColor: 'teal' },
                      { value: 'waive', label: 'Decline', activeColor: 'red' },
                    ]}
                    onChange={() => dispatch({ type: 'TOGGLE_NON_GUARANTEED', player: p.name })}
                  />
                  {p.deadline && (
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-faint)' }}>by {p.deadline}</span>
                  )}
                </Row>
              )
            })}

            {/* RFA Re-sign Decisions */}
            <GroupLabel label="Restricted Free Agents" />
            {RFA_DECISIONS.map(p => {
              const d = state.rfaDecisions?.[p.name] || { decision: 'dont_sign', salary: 0 }
              const signed = d.decision === 'resign'
              return (
                <tr
                  key={p.name}
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
                  <td data-sticky className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text)', position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '2px 0 4px rgba(0,0,0,0.06)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div className="flex items-center gap-2">
                      <PlayerPhoto espnId={p.espnId} name={p.name} />
                      {isMobile ? shortName(p.name) : p.name}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    {p.position}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold" style={{ color: 'var(--text)' }}>
                    {signed && d.salary > 0 ? fmt(d.salary) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-center font-semibold" style={{ color: signed ? 'var(--sch-teal)' : '#dc2626' }}>
                    {signed ? 'Re-signed' : "Not signed"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="inline-flex items-center gap-2">
                      <SegmentedControl
                        value={d.decision}
                        options={[
                          { value: 'resign', label: 'Re-sign', activeColor: 'teal' },
                          { value: 'dont_sign', label: "Don't Sign", activeColor: 'red' },
                        ]}
                        onChange={val => dispatch({
                          type: 'SET_RFA_DECISION',
                          player: p.name,
                          decision: val,
                          salary: val === 'resign' ? (d.salary || 30_000_000) : 0,
                        })}
                      />
                      {signed && (
                        <div className="inline-flex items-center gap-1">
                          <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>$</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={d.salary > 0 ? +(d.salary / 1_000_000).toFixed(1) : ''}
                            onChange={e => dispatch({
                              type: 'SET_RFA_DECISION',
                              player: p.name,
                              decision: 'resign',
                              salary: Number(e.target.value) * 1_000_000,
                            })}
                            placeholder="M"
                            className="px-1.5 py-0.5 rounded text-xs tabular-nums w-16"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
                          />
                          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>M/yr</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, align = 'left', sticky }) {
  return (
    <th
      className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ color: 'rgba(255,255,255,0.7)', textAlign: align, ...(sticky ? { position: 'sticky', left: 0, zIndex: 3, background: 'var(--sch-black)' } : {}) }}
    >
      {children}
    </th>
  )
}

function Row({ player, status, statusColor, children, isMobile }) {
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
      <td data-sticky className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text)', position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '2px 0 4px rgba(0,0,0,0.06)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <div className="flex items-center gap-2">
          <PlayerPhoto espnId={player.espnId} name={player.name} />
          {isMobile ? shortName(player.name) : player.name}
        </div>
      </td>
      <td className="px-3 py-2.5 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        {player.position}
      </td>
      <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold" style={{ color: 'var(--text)' }}>
        {fmt(player.salary)}
      </td>
      <td className="px-3 py-2.5 text-xs text-center font-semibold" style={{ color: statusColor }}>
        {status}
      </td>
      <td className="px-3 py-2.5 text-center">
        {children || <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
      </td>
    </tr>
  )
}

function GroupLabel({ label }) {
  return (
    <tr>
      <td colSpan={5} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'var(--bg-raised)', color: 'var(--accent)' }}>
        {label}
      </td>
    </tr>
  )
}
