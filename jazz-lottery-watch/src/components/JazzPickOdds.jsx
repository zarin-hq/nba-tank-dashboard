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
function HoverTooltip({ triggerRef, content, align = 'center', placement = 'below', clickable = false }) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const tooltipW = 188
  const tooltipRef = useRef(null)
  const hideTimer = useRef(null)
  const visibleRef = useRef(false)
  useEffect(() => { visibleRef.current = visible }, [visible])

  // Animate in: mount first, then set visible on next frame
  // Animate out: set invisible first, then unmount after transition
  const unmountTimer = useRef(null)
  useEffect(() => {
    clearTimeout(unmountTimer.current)
    if (visible) {
      setMounted(true)
    } else {
      unmountTimer.current = setTimeout(() => setMounted(false), 120)
    }
    return () => clearTimeout(unmountTimer.current)
  }, [visible])

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    function show() {
      clearTimeout(hideTimer.current)
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
    function scheduleHide() {
      if (clickable) {
        hideTimer.current = setTimeout(() => setVisible(false), 400)
      } else {
        setVisible(false)
      }
    }
    function handleTouchStart() {
      if (visibleRef.current) { setVisible(false) } else { show() }
    }
    el.addEventListener('mouseenter', show)
    el.addEventListener('mouseleave', scheduleHide)
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    return () => {
      el.removeEventListener('mouseenter', show)
      el.removeEventListener('mouseleave', scheduleHide)
      el.removeEventListener('touchstart', handleTouchStart)
      clearTimeout(hideTimer.current)
    }
  }, [triggerRef, align, placement, clickable])

  // For clickable tooltips, keep open while hovering over tooltip itself
  useEffect(() => {
    if (!clickable || !mounted) return
    const el = tooltipRef.current
    if (!el) return
    function cancelHide() {
      clearTimeout(hideTimer.current)
      clearTimeout(unmountTimer.current)
      setVisible(true)
    }
    function scheduleHide() { hideTimer.current = setTimeout(() => setVisible(false), 150) }
    el.addEventListener('mouseenter', cancelHide)
    el.addEventListener('mouseleave', scheduleHide)
    return () => {
      el.removeEventListener('mouseenter', cancelHide)
      el.removeEventListener('mouseleave', scheduleHide)
    }
  }, [clickable, mounted])

  // Dismiss on outside touch when visible
  useEffect(() => {
    if (!visible) return
    function dismiss(e) {
      if (triggerRef.current?.contains(e.target)) return
      if (tooltipRef.current?.contains(e.target)) return
      setVisible(false)
    }
    const t = setTimeout(() => document.addEventListener('touchstart', dismiss, { passive: true }), 50)
    return () => { clearTimeout(t); document.removeEventListener('touchstart', dismiss) }
  }, [visible, triggerRef])

  if (!mounted) return null

  const baseTransform = pos.above ? 'translateY(-100%) translateY(18px)' : ''
  const slideOffset = pos.above ? 'translateY(6px)' : 'translateY(-6px)'

  return createPortal(
    <div
      ref={tooltipRef}
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
        transform: visible ? baseTransform : `${baseTransform} ${slideOffset}`,
        opacity: visible ? 1 : 0,
        transition: visible
          ? 'opacity 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'opacity 0.12s ease, transform 0.12s ease',
        pointerEvents: clickable ? 'auto' : 'none',
      }}
    >
      {content}
    </div>,
    document.body
  )
}

function PlayerStatsContent({ player }) {
  if (!player?.stats) return null
  const { ppg, rpg, apg, tpct } = player.stats
  return (
    <>
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-raised)' }}>
        {player.name}
      </div>
      <div className="flex justify-around px-2 py-2.5">
        {[['PPG', ppg, false], ['RPG', rpg, false], ['APG', apg, false], ['3P%', tpct, true]].map(([label, val, isPct]) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
              {val != null ? val.toFixed(1) + (isPct ? '%' : '') : '—'}
            </span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {player.bref_url && (
        <div className="px-3 pb-2.5" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <a
            href={player.bref_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold"
            style={{ color: 'var(--accent-2)', textDecoration: 'underline' }}
          >
            Basketball Reference ↗
          </a>
        </div>
      )}
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
          className="rounded-full object-cover object-top flex-shrink-0"
          style={{ width: 48, height: 48, background: 'var(--bg-raised)', border: '1px solid #d1d5db' }}
          onError={() => setImgOk(false)}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ width: 48, height: 48, background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid #d1d5db' }}
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
          clickable={!!player?.bref_url}
        />
      )}
    </div>
  )
}

export default function JazzPickOdds({ data, loading, error }) {
  const bigBoard = useBigBoard()
  const draftHistory = useDraftHistory()
  const [playerOrder, setPlayerOrder] = useState(null)
  const [showReorder, setShowReorder] = useState(false)
  const [expandedPick, setExpandedPick] = useState(null)
  const effectiveBoard = playerOrder ?? bigBoard

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
    .filter(d => d.pick <= 10)
    .sort((a, b) => a.pick - b.pick)

  const maxPct = Math.max(...picks.map(d => d.pct), 1)

  function barColor(pick, pct) {
    if (pick <= 4) return '#00FFB6'
    if (pick <= 8) return 'var(--accent)'
    return 'var(--border-med)'
  }

  return (
    <div className="overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 16 }}>

      {/* Mobile vertical list — hidden on sm+ */}
      <div className="sm:hidden px-4 py-4 space-y-3">
        {picks.map(({ pick, pct }) => {
          const player = effectiveBoard[pick - 1]
          const barW = Math.round((pct / maxPct) * 100)
          const color = barColor(pick, pct)
          const isLottery = pick <= 4
          return (
            <div key={pick} className="flex flex-col gap-1">
              <div
                className="flex items-center gap-2"
                onClick={() => player?.stats && setExpandedPick(expandedPick === pick ? null : pick)}
                style={{ cursor: player?.stats ? 'pointer' : undefined }}
              >
                <span className="text-xs font-bold tabular-nums flex-shrink-0"
                  style={{ width: 22, color: 'var(--text-muted)' }}>
                  #{pick}
                </span>
                {player?.photo && (
                  <img src={player.photo} alt={player.name}
                    className="w-6 h-6 rounded object-cover object-top flex-shrink-0"
                    style={{ background: 'var(--bg-raised)' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  {player ? (
                    <span className="text-xs font-semibold truncate block" style={{ color: 'var(--text)' }}>
                      {player.name}
                      <span className="font-normal ml-1" style={{ color: 'var(--text-faint)' }}>
                        {player.pos} · {player.school}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Pick {pick}</span>
                  )}
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0"
                  style={{ width: 40, textAlign: 'right', color: isLottery ? '#00CF94' : pick <= 8 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {pct >= 0.5 ? `${pct.toFixed(1)}%` : '—'}
                </span>
                {player?.stats && (
                  <span style={{ fontSize: 10, color: 'var(--border-med)', flexShrink: 0, lineHeight: 1 }}>
                    {expandedPick === pick ? '▲' : '▼'}
                  </span>
                )}
              </div>
              {expandedPick === pick && player?.stats && (
                <div className="flex items-center gap-4 rounded-lg px-3 py-2"
                  style={{ background: 'var(--bg-raised)', marginLeft: 46 }}>
                  {[['PPG', player.stats.ppg, false], ['RPG', player.stats.rpg, false], ['APG', player.stats.apg, false], ['3P%', player.stats.tpct, true]].map(([label, val, isPct]) => (
                    <div key={label} className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>{val != null ? val.toFixed(1) + (isPct ? '%' : '') : '—'}</span>
                      <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{label}</span>
                    </div>
                  ))}
                  {player.bref_url && (
                    <a href={player.bref_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-semibold ml-auto"
                      style={{ color: 'var(--accent-2)', textDecoration: 'underline' }}
                      onClick={e => e.stopPropagation()}>
                      BRef ↗
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <div style={{ width: 22, flexShrink: 0 }} />
                <div style={{ width: 24, flexShrink: 0 }} /> {/* photo spacer */}
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: 'var(--bg-raised)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${barW}%`, background: color, minWidth: pct > 0 ? 3 : 0 }} />
                </div>
                <div style={{ width: 40, flexShrink: 0 }} />
              </div>
              {(pick === 9 || pick === 10) && (
                <div className="flex items-center gap-2">
                  <div style={{ width: 22, flexShrink: 0 }} />
                  <div style={{ width: 24, flexShrink: 0 }} />
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }}>
                    → OKC
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop bar chart — hidden on mobile */}
      <div className="hidden sm:block px-5 py-5">
        {/* Bar chart row */}
        <div className="flex gap-1">
          {picks.map(({ pick, pct }, idx) => {
            const barH = Math.max(pct > 0 ? 6 : 0, (pct / maxPct) * BAR_AREA_H)
            const color = barColor(pick, pct)
            const isLotteryPick = pick <= 4
            const delay = `${idx * 30}ms`

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
              <div className="mt-1.5 text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                #{pick}
              </div>
              {(pick === 9 || pick === 10) && (
                <div className="mt-1 text-[9px] font-bold px-1 py-0.5 rounded text-center"
                  style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                  → OKC
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Player photos row */}
        <div className="flex gap-1 pt-3">
          {picks.map(({ pick }) => {
            const player = effectiveBoard[pick - 1]
            return (
              <div key={pick} className="flex-1 flex flex-col items-center min-w-0">
                <PlayerPhoto player={player} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Change player order */}
      <div className="flex justify-end px-5 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => bigBoard.length > 0 && setShowReorder(true)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'underline' }}
        >
          Change player order
        </button>
      </div>

      {showReorder && (
        <ReorderModal
          initialOrder={playerOrder ?? bigBoard}
          defaultOrder={bigBoard}
          onApply={order => { setPlayerOrder(order); setShowReorder(false) }}
          onClose={() => setShowReorder(false)}
        />
      )}
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
            color: isLotteryPick ? '#00CF94' : pick <= 8 ? 'var(--accent)' : 'var(--text-muted)',
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

function ReorderModal({ initialOrder, defaultOrder, onApply, onClose }) {
  const [order, setOrder] = useState([...initialOrder])
  const [draggingIdx, setDraggingIdx] = useState(null)
  const dragIdx = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Non-passive touchmove so we can call preventDefault and block scroll while dragging
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    function onTouchMove(e) {
      if (dragIdx.current === null) return
      e.preventDefault()
      const touch = e.touches[0]
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      const row = target?.closest('[data-row-idx]')
      if (!row) return
      const targetIdx = parseInt(row.dataset.rowIdx, 10)
      if (isNaN(targetIdx) || targetIdx === dragIdx.current) return
      const src = dragIdx.current
      dragIdx.current = targetIdx
      setDraggingIdx(targetIdx)
      setOrder(prev => {
        const next = [...prev]
        const [moved] = next.splice(src, 1)
        next.splice(targetIdx, 0, moved)
        return next
      })
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  // Mouse drag handlers
  function handleDragStart(i) { dragIdx.current = i; setDraggingIdx(i) }
  function handleDragEnter(i) {
    if (dragIdx.current === null || dragIdx.current === i) return
    const src = dragIdx.current
    dragIdx.current = i
    setDraggingIdx(i)
    setOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(src, 1)
      next.splice(i, 0, moved)
      return next
    })
  }
  function handleDragEnd() { dragIdx.current = null; setDraggingIdx(null) }

  // Touch drag handlers — only triggered from the drag handle
  function handleTouchStart(i) { dragIdx.current = i; setDraggingIdx(i) }
  function handleTouchEnd() { dragIdx.current = null; setDraggingIdx(null) }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(380px, calc(100vw - 24px))',
        maxHeight: '90dvh',
        zIndex: 10001,
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--sch-black)', borderBottom: '3px solid #00FFB6', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ color: '#fff', fontFamily: "'Archivo Black', Arial, sans-serif", fontSize: 15 }}>Player Order</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 22, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>

        {/* Sub-header */}
        <div style={{ padding: '6px 16px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Drag handle to reorder · First 10 shown in chart
          </span>
        </div>

        {/* List */}
        <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
          {order.map((player, i) => (
            <div
              key={player?.rank ?? i}
              data-row-idx={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                borderBottom: '1px solid var(--border)',
                background: i >= 10 ? 'var(--bg-raised)' : '#fff',
                userSelect: 'none',
                opacity: draggingIdx === i ? 0.4 : 1,
                transition: 'opacity 0.1s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                background: i < 10 ? '#00FFB6' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: i < 10 ? '#000' : 'var(--text-faint)',
              }}>
                {i + 1}
              </div>
              {/* Drag handle — mouse + touch entry point */}
              <span
                onTouchStart={() => handleTouchStart(i)}
                onTouchEnd={handleTouchEnd}
                style={{ color: 'var(--border-med)', fontSize: 16, lineHeight: 1, flexShrink: 0, cursor: 'grab', touchAction: 'none', padding: '4px 2px' }}
              >⠿</span>
              {player?.photo ? (
                <img src={player.photo} alt={player.name}
                  style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-raised)', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: 4, background: 'var(--bg-raised)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {player?.name ?? '—'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                  {player ? `${player.pos} · ${player.school}` : ''}
                </div>
              </div>
              {i >= 10 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                  Not shown
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button
            onClick={() => setOrder([...defaultOrder])}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'underline' }}
          >
            Reset to default
          </button>
          <button
            onClick={() => onApply(order)}
            style={{ background: '#00FFB6', color: '#000', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
