import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { apiUrl } from '../lib/api'

const BAR_AREA_H = 160 // px — height of the bar zone

function useBigBoard() {
  const [board, setBoard] = useState([])
  useEffect(() => {
    fetch(apiUrl('/api/big-board')).then(r => r.json()).then(setBoard).catch(() => {})
  }, [])
  return board
}

function useDraftHistory() {
  const [history, setHistory] = useState(null)
  useEffect(() => {
    fetch(apiUrl('/api/draft-history')).then(r => r.json()).then(setHistory).catch(() => {})
  }, [])
  return history
}

// Generic hover tooltip that portals to document.body
function HoverTooltip({ triggerRef, content, align = 'center', placement = 'below' }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const tooltipW = 188

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    function show() {
      const rect = el.getBoundingClientRect()
      let left
      if (align === 'center') {
        left = rect.left + window.scrollX + rect.width / 2 - tooltipW / 2
      } else if (align === 'left') {
        left = rect.left + window.scrollX
      } else {
        left = rect.right + window.scrollX - tooltipW
      }
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8))
      const above = placement === 'above'
      const top = above
        ? rect.top + window.scrollY
        : rect.bottom + window.scrollY + 6
      setPos({ top, left, above })
      setVisible(true)
    }
    function hide() { setVisible(false) }
    el.addEventListener('mouseenter', show)
    el.addEventListener('mouseleave', hide)
    return () => { el.removeEventListener('mouseenter', show); el.removeEventListener('mouseleave', hide) }
  }, [triggerRef, align, placement])

  if (!visible) return null

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: tooltipW,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
        transform: pos.above ? 'translateY(-100%) translateY(-12px)' : undefined,
        pointerEvents: 'none',
      }}
    >
      {content}
    </div>,
    document.body
  )
}

function PlayerStatsContent({ player }) {
  if (!player?.stats) return null
  const { ppg, rpg, apg } = player.stats
  return (
    <>
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-raised)' }}>
        {player.name}
      </div>
      <div className="flex justify-around px-2 py-2.5">
        {[['PPG', ppg], ['RPG', rpg], ['APG', apg]].map(([label, val]) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
              {val.toFixed(1)}
            </span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function DraftHistoryContent({ pick, history }) {
  if (!history) return null
  const years = Object.keys(history)
    .map(Number)
    .sort((a, b) => b - a)
  return (
    <>
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-raised)' }}>
        Pick #{pick} · last 10 years
      </div>
      <div className="py-1">
        {years.map((year, i) => (
          <div key={year}
            className="flex items-center justify-between px-3 py-1"
            style={{ borderBottom: i < years.length - 1 ? '1px solid var(--border)' : undefined }}>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--text-faint)', minWidth: 32 }}>
              {year}
            </span>
            <span className="text-xs font-medium text-right" style={{ color: 'var(--text)' }}>
              {history[year]}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function PlayerPhoto({ player }) {
  const [imgOk, setImgOk] = useState(true)
  const triggerRef = useRef(null)
  const initials = player?.name.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '?'

  return (
    <div className="flex flex-col items-center gap-0.5 w-full" ref={triggerRef} style={{ cursor: player?.stats ? 'default' : undefined }}>
      {imgOk && player?.photo ? (
        <img
          src={player.photo}
          alt={player?.name}
          className="rounded object-cover object-top flex-shrink-0"
          style={{ width: 48, height: 48, background: 'var(--bg-raised)' }}
          onError={() => setImgOk(false)}
        />
      ) : (
        <div
          className="rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ width: 48, height: 48, background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
        >
          {initials}
        </div>
      )}
      {player && (
        <>
          <span className="text-xs leading-tight text-center w-full px-0.5"
            style={{ color: 'var(--text)', marginTop: 4 }}>
            {player.name.split(' ')[0]}<br />{player.name.split(' ').slice(1).join(' ')}
          </span>
          <span className="text-xs leading-tight text-center" style={{ color: 'var(--text-faint)' }}>
            {player.pos} · {player.school}
          </span>
        </>
      )}
      {player?.stats && (
        <HoverTooltip
          triggerRef={triggerRef}
          content={<PlayerStatsContent player={player} />}
          align="center"
          placement="above"
        />
      )}
    </div>
  )
}

export default function JazzPickOdds({ data, loading, error }) {
  const bigBoard = useBigBoard()
  const draftHistory = useDraftHistory()

  if (loading) return (
    <div className="p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
      <div className="h-64 rounded animate-pulse" style={{ background: 'var(--bg-raised)' }} />
    </div>
  )

  if (error) return (
    <div className="rounded p-4 text-sm" style={{ background: '#ffdede', border: '1px solid #ea384c', color: '#ea384c' }}>
      Error: {error}
    </div>
  )

  if (!data?.odds) return null

  const picks = Object.entries(data.odds)
    .map(([pick, pct]) => ({ pick: Number(pick), pct: Number(pct) }))
    .sort((a, b) => a.pick - b.pick)

  const maxPct = Math.max(...picks.map(d => d.pct), 1)

  function barColor(pick, pct) {
    if (pick <= 4) return '#00FFB6'
    if (pct >= 20) return 'var(--accent)'
    if (pct >= 5) return 'var(--accent-2)'
    return 'var(--border-med)'
  }

  return (
    <div className="overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 16 }}>
      {/* Chart + player info */}
      <div className="px-5 py-5">
        {/* Bar chart row */}
        <div className="flex gap-1">
          {picks.map(({ pick, pct }, idx) => {
            const barH = Math.max(pct > 0 ? 6 : 0, (pct / maxPct) * BAR_AREA_H)
            const color = barColor(pick, pct)
            const isLotteryPick = pick <= 4
            const delay = `${idx * 30}ms`
            const barRef = { current: null }

            return (
              <BarColumn
                key={pick}
                pick={pick}
                pct={pct}
                barH={barH}
                color={color}
                isLotteryPick={isLotteryPick}
                delay={delay}
                draftHistory={draftHistory?.[String(pick)] ?? null}
              />
            )
          })}
        </div>

        {/* Border between bars and pick numbers */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Pick numbers row */}
        <div className="flex gap-1">
          {picks.map(({ pick }) => (
            <div key={pick} className="flex-1 flex flex-col items-center min-w-0">
              <div className="mt-1.5 text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text)' }}>
                #{pick}
              </div>
            </div>
          ))}
        </div>

        {/* Player photos row */}
        <div className="flex gap-1 pt-3">
          {picks.map(({ pick }) => {
            const player = bigBoard.find(p => p.rank === pick)
            return (
              <div key={pick} className="flex-1 flex flex-col items-center min-w-0">
                <PlayerPhoto player={player} />
              </div>
            )
          })}
        </div>

        {/* Source label */}
        <div className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
          2026 big board · tankathon.com
        </div>
      </div>
    </div>
  )
}

function BarColumn({ pick, pct, barH, color, isLotteryPick, delay, draftHistory }) {
  const barRef = useRef(null)

  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      <div className="w-full flex flex-col justify-end" style={{ height: BAR_AREA_H }}>
        <div
          className="text-center text-[11px] font-semibold mb-1 tabular-nums"
          style={{
            color: isLotteryPick ? '#00CF94' : pct >= 20 ? 'var(--accent)' : 'var(--text-muted)',
            lineHeight: 1,
            animation: `grow-up 0.5s ease-out ${delay} both`,
          }}
        >
          {pct >= 0.5 ? `${pct.toFixed(1)}%` : ''}
        </div>
        <div
          ref={barRef}
          className="w-full rounded-t"
          style={{
            height: barH,
            background: color,
            minHeight: pct > 0 ? 3 : 0,
            transformOrigin: 'bottom',
            animation: `grow-up 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay} both`,
            cursor: draftHistory ? 'default' : undefined,
          }}
        />
        {draftHistory && (
          <HoverTooltip
            triggerRef={barRef}
            content={<DraftHistoryContent pick={pick} history={draftHistory} />}
            align="center"
            placement="above"
          />
        )}
      </div>
    </div>
  )
}
