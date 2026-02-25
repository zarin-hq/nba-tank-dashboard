import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { apiUrl } from '../lib/api'

const JAZZ_ID = 1610612762
const CONFETTI_COLORS = ['#00FFB6', '#052065', '#ffffff', '#00d598', '#1d6daa', '#00FFB6', '#ffffff']

function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const particles = Array.from({ length: 220 }, (_, i) => {
    const fromSide = i < 40  // first 40 shoot from sides
    const side = i < 20 ? -1 : 1
    return {
      x: fromSide ? (side === -1 ? 0 : canvas.width) : canvas.width * (0.2 + Math.random() * 0.6),
      y: fromSide ? canvas.height * 0.35 : -10 - Math.random() * 60,
      w: 7 + Math.random() * 9,
      h: 3 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      circle: Math.random() < 0.25,
      vx: fromSide ? side * (4 + Math.random() * 6) : (Math.random() - 0.5) * 5,
      vy: fromSide ? -(4 + Math.random() * 5) : 1.5 + Math.random() * 3.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
      gravity: 0.12 + Math.random() * 0.08,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.06 + Math.random() * 0.06,
    }
  })

  const DURATION = 4200
  let start = null

  function frame(ts) {
    if (!start) start = ts
    const elapsed = ts - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.wobble += p.wobbleSpeed
      p.x += p.vx + Math.sin(p.wobble) * 0.8
      p.y += p.vy
      p.vy += p.gravity
      p.rot += p.rotV
      const alpha = elapsed > DURATION * 0.65
        ? Math.max(0, 1 - (elapsed - DURATION * 0.65) / (DURATION * 0.35))
        : 1

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.circle) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    })

    if (elapsed < DURATION) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }

  requestAnimationFrame(frame)
}

// Reveal order: 14 → 5 quickly, then 4 → 1 dramatically
const REVEAL_SEQUENCE = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

function PickRow({ pick, entry }) {
  const isTop4 = pick <= 4
  const jump = entry ? entry.slot - pick : 0

  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: 52,
        borderBottom: pick < 14 ? '1px solid var(--border)' : undefined,
        background: isTop4 && entry ? 'rgba(0,255,182,0.04)' : undefined,
      }}
    >
      {/* Pick badge */}
      <div
        className="text-xs font-bold flex items-center justify-center flex-shrink-0"
        style={{
          width: 28, height: 28, borderRadius: 6,
          background: isTop4 ? '#00FFB6' : 'var(--bg-raised)',
          color: isTop4 ? '#000' : 'var(--text-muted)',
        }}
      >
        {pick}
      </div>

      {entry ? (
        <div
          className="flex items-center gap-3 flex-1 min-w-0"
          style={{ animation: 'pick-reveal 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <img
            src={`https://cdn.nba.com/logos/nba/${entry.team_id}/primary/L/logo.svg`}
            alt=""
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
              {entry.team_name}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
              {entry.wins}–{entry.losses} · Seed #{entry.slot}
            </div>
          </div>
          <div
            className="text-xs font-bold flex-shrink-0 tabular-nums"
            style={{ color: jump > 0 ? '#16a34a' : jump < 0 ? '#dc2626' : 'var(--text-faint)', minWidth: 36, textAlign: 'right' }}
          >
            {jump > 0 ? `↑ +${jump}` : jump < 0 ? `↓ ${jump}` : '—'}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex-shrink-0 animate-pulse" style={{ background: 'var(--bg-raised)' }} />
          <div className="h-3 rounded flex-1 animate-pulse" style={{ background: 'var(--bg-raised)', maxWidth: 160 }} />
        </div>
      )}
    </div>
  )
}

export default function LotterySimulator() {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState(null)
  const [revealed, setRevealed] = useState(new Set())
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [jazzFirst, setJazzFirst] = useState(false)
  const timers = useRef([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  async function runLottery() {
    clearTimers()
    setRevealed(new Set())
    setDone(false)
    setJazzFirst(false)
    setRunning(true)
    try {
      const data = await fetch(apiUrl('/api/sim-lottery')).then(r => r.json())
      setResults(data)
      const jazzEntry = data.find(r => r.team_id === JAZZ_ID)
      const jazzIsTop4 = jazzEntry && jazzEntry.pick <= 4
      const jazzGetsOne = jazzEntry && jazzEntry.pick === 1
      let delay = 300
      REVEAL_SEQUENCE.forEach(pick => {
        delay += pick <= 4 ? 850 : 160
        const t = setTimeout(() => {
          setRevealed(prev => new Set([...prev, pick]))
          if (pick === 1) { setRunning(false); setDone(true) }
          if (jazzIsTop4 && jazzEntry.pick === pick) launchConfetti()
          if (jazzGetsOne && pick === 1) setJazzFirst(true)
        }, delay)
        timers.current.push(t)
      })
    } catch {
      setRunning(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    setResults(null)
    setRevealed(new Set())
    setDone(false)
    setJazzFirst(false)
    clearTimers()
    runLottery()
  }

  function handleClose() {
    clearTimers()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const byPick = results ? Object.fromEntries(results.map(r => [r.pick, r])) : {}

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide"
        style={{ background: '#00FFB6', color: '#000', border: 'none', cursor: 'pointer' }}
      >
        Run Lottery
      </button>

      {open && createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000 }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 440,
              maxHeight: '90vh',
              zIndex: 10001,
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: 'var(--sch-black)', borderBottom: '3px solid #00FFB6' }}
            >
              <div className="text-white text-base tracking-tight" style={{ fontFamily: "'Archivo Black', Arial, sans-serif" }}>
                2026 Draft Lottery Simulation
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 22, lineHeight: 1, padding: '0 2px' }}
              >
                ×
              </button>
            </div>

            {/* Column labels */}
            <div
              className="flex items-center gap-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-raised)' }}
            >
              <div style={{ width: 28 }}>Pick</div>
              <div style={{ width: 32 }} />
              <div className="flex-1">Team</div>
              <div style={{ minWidth: 36, textAlign: 'right' }}>Move</div>
            </div>

            {/* Pick list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {Array.from({ length: 14 }, (_, i) => i + 1).map(pick => (
                <PickRow
                  key={pick}
                  pick={pick}
                  entry={revealed.has(pick) ? byPick[pick] : null}
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {done ? 'Simulation complete' : 'Drawing picks…'}
              </span>
              <button
                onClick={running ? undefined : runLottery}
                disabled={running}
                className="text-sm font-bold px-4 py-1.5 rounded uppercase tracking-wide"
                style={{
                  background: running ? 'var(--bg-raised)' : '#00FFB6',
                  color: running ? 'var(--text-muted)' : '#000',
                  border: 'none',
                  cursor: running ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {running ? 'Simulating…' : 'Run Again'}
              </button>
            </div>

            {/* Jazz #1 gif overlay */}
            {jazzFirst && (
              <div
                onClick={() => setJazzFirst(false)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.82)',
                  borderRadius: 16,
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <img
                  src="/jazz-win.gif"
                  alt="Jazz #1 pick!"
                  style={{ width: 260, borderRadius: 8, display: 'block' }}
                />
                <div
                  className="text-white font-bold mt-4 text-lg tracking-tight"
                  style={{ fontFamily: "'Archivo Black', Arial, sans-serif", color: '#00FFB6' }}
                >
                  #1 PICK!!
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  click to dismiss
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
