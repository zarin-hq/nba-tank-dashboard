import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const JAZZ_ID = 1610612762

const STATUS_COLORS = {
  'Out':         { bg: 'rgba(220,38,38,0.1)',  text: '#dc2626', label: 'OUT' },
  'Doubtful':    { bg: 'rgba(202,138,4,0.12)',  text: '#b45309', label: 'DBT' },
  'Questionable':{ bg: 'rgba(202,138,4,0.12)',  text: '#b45309', label: 'GTD' },
  'Day-To-Day':  { bg: 'rgba(202,138,4,0.12)',  text: '#b45309', label: 'DTD' },
  'Suspension':  { bg: 'rgba(109,40,217,0.1)',  text: '#7c3aed', label: 'SUSP' },
}
const DEFAULT_STATUS = { bg: 'rgba(107,114,128,0.1)', text: 'var(--text-faint)', label: '?' }

function statusStyle(s) { return STATUS_COLORS[s] ?? DEFAULT_STATUS }

// Portal-based tooltip — renders on document.body to escape overflow:hidden parents
function InjuryTooltip({ injuries }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!injuries?.length) return null

  const outCount = injuries.filter(i => i.status === 'Out' || i.status === 'Suspension').length
  const gtdCount = injuries.length - outCount

  function handleClick() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const tooltipW = 260
      let left = rect.left + window.scrollX
      if (left + tooltipW > window.innerWidth - 8) {
        left = window.innerWidth - tooltipW - 8
      }
      setPos({ top: rect.bottom + window.scrollY + 4, left })
    }
    setOpen(v => !v)
  }

  const tooltip = open && createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: 260,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-raised)' }}>
        Injury Report
      </div>
      <div className="py-1 scrollbar-thin" style={{ maxHeight: 256, overflowY: 'auto' }}>
        {injuries.map((inj, i) => {
          const st = statusStyle(inj.status)
          return (
            <div key={i} className="flex items-center gap-2.5 px-3 py-1.5"
              style={{ borderBottom: i < injuries.length - 1 ? '1px solid var(--border)' : undefined }}>
              {inj.headshot ? (
                <img src={inj.headshot} alt={inj.name}
                  className="rounded-full flex-shrink-0 object-cover"
                  style={{ width: 28, height: 28, background: 'var(--bg-raised)' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={{ width: 28, height: 28, background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                  {inj.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{inj.name}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {inj.position && <span className="mr-1">{inj.position}</span>}
                  {inj.description}
                </div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: st.bg, color: st.text }}>
                {st.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>,
    document.body
  )

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
        style={{
          background: open ? 'var(--bg-raised)' : 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        🩹
        {outCount > 0 && <span>{outCount} out</span>}
        {outCount > 0 && gtdCount > 0 && <span>/</span>}
        {gtdCount > 0 && <span>{gtdCount} gtd</span>}
      </button>
      {tooltip}
    </>
  )
}

export default function TodayGames({ data, loading, error, standings }) {
  const slotMap = {}
  if (standings) standings.forEach(t => { slotMap[t.team_id] = t.lottery_slot })

  if (loading) return (
    <div className="flex gap-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex-shrink-0 w-56 h-48 animate-pulse"
          style={{ background: 'var(--bg-raised)', borderRadius: 16 }} />
      ))}
    </div>
  )

  if (error) return (
    <div className="text-xs" style={{ color: '#dc2626' }}>Error loading games: {error}</div>
  )

  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-5 text-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 16 }}>
        No games today involving the bottom 10 teams.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {data.map(game => <GameCard key={game.game_id} game={game} slotMap={slotMap} />)}
    </div>
  )
}

function GameCard({ game, slotMap }) {
  const isJazz = game.home_team_id === JAZZ_ID || game.away_team_id === JAZZ_ID
  const isTankBowl = game.both_bottom10
  const isLive = game.status_id === 2
  const isFinal = game.status_id === 3
  const hasScore = game.home_score != null && game.away_score != null
  const homeWin = hasScore && game.home_score > game.away_score
  const awayWin = hasScore && game.away_score > game.home_score

  const borderColor = isJazz ? 'var(--accent)' : isTankBowl ? '#d97706' : 'var(--border)'

  return (
    <div className="flex-shrink-0 w-56 overflow-hidden flex flex-col"
      style={{ background: 'var(--bg-card)', border: `1px solid ${borderColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 16 }}>
      {/* Status row */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <StatusBadge statusId={game.status_id} statusText={game.status_text} />
        <div className="flex gap-1 items-center">
          {isTankBowl && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(217,119,6,0.12)', color: '#b45309' }}>TANK BOWL</span>
          )}
          {isJazz && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(5,32,101,0.08)', color: 'var(--accent)' }}>JAZZ</span>
          )}
          {game.national_tv && (
            <span className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>{game.national_tv}</span>
          )}
        </div>
      </div>

      {/* Away */}
      <TeamRow
        teamId={game.away_team_id}
        name={game.away_team_name}
        record={game.away_record}
        score={game.away_score}
        lotterySlot={slotMap[game.away_team_id]}
        inBottom10={game.away_in_bottom10}
        isWinning={awayWin}
        showScore={isLive || isFinal}
        injuries={game.away_injuries}
      />

      <div className="mx-3" style={{ borderTop: '1px solid var(--border)' }} />

      {/* Home */}
      <TeamRow
        teamId={game.home_team_id}
        name={game.home_team_name}
        record={game.home_record}
        score={game.home_score}
        lotterySlot={slotMap[game.home_team_id]}
        inBottom10={game.home_in_bottom10}
        isWinning={homeWin}
        showScore={isLive || isFinal}
        injuries={game.home_injuries}
      />
    </div>
  )
}

function TeamRow({ teamId, name, record, score, lotterySlot, inBottom10, isWinning, showScore, injuries }) {
  const lastName = name.split(' ').slice(-1)[0]
  return (
    <div className="flex items-center px-3 py-3"
      style={{ background: isWinning ? 'var(--bg-raised)' : 'transparent' }}>
      <img
        src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
        alt=""
        style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }}
      />

      <div className="flex-1 min-w-0 ml-2.5">
        <div className="flex items-center gap-1 flex-wrap">
          {lotterySlot != null && (
            <span className="inline-flex items-center justify-center text-[10px] font-bold rounded"
              style={{
                height: 18, flexShrink: 0, padding: '0 4px',
                background: inBottom10 ? 'var(--accent)' : 'var(--bg-raised)',
                color: inBottom10 ? '#ffffff' : 'var(--text-muted)',
              }}>
              #{lotterySlot}
            </span>
          )}
          <span className="text-sm font-semibold" style={{ color: inBottom10 ? 'var(--text)' : 'var(--text-muted)' }}>
            {lastName}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{record}</span>
        </div>
        {injuries?.length > 0 && (
          <div className="mt-1">
            <InjuryTooltip injuries={injuries} />
          </div>
        )}
      </div>

      {showScore && score != null && (
        <span className="text-xl font-bold tabular-nums ml-2 flex-shrink-0"
          style={{ color: isWinning ? 'var(--text)' : 'var(--text-faint)' }}>
          {score}
        </span>
      )}
    </div>
  )
}

function StatusBadge({ statusId, statusText }) {
  if (statusId === 2) return (
    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#16a34a' }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#16a34a' }} />
      {statusText}
    </span>
  )
  if (statusId === 3) return <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>FINAL</span>
  return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{statusText}</span>
}
