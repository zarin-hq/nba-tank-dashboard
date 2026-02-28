import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NON_GUARANTEED, RFA_DECISIONS, TEAM_OPTIONS } from '../../data/jazz-contracts'
import DRAFT_PROSPECTS from '../../data/draft-prospects'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const W = 1200
const TEAL = '#00FFB6'
const BLACK = '#1a1a2e'
const DARK_BG = '#12121e'
const CARD_BG = '#1e1e32'

function fmt(n) {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

async function loadImage(url) {
  const isLocal = url.startsWith('/') || url.startsWith('data:')

  // Try direct fetch first (works for same-origin and CORS-enabled like ESPN)
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    return createImageBitmap(blob)
  } catch {
    // For external URLs without CORS, proxy through wsrv.nl
    if (!isLocal) {
      try {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`
        const res = await fetch(proxyUrl, { mode: 'cors' })
        if (!res.ok) throw new Error()
        const blob = await res.blob()
        return createImageBitmap(blob)
      } catch {}
    }
    // Final fallback: Image element
    return new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = url
    })
  }
}

async function loadSvgAsImage(url, width, height) {
  // Load SVG and render at target resolution for crisp output
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const svgText = await res.text()
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        // Draw SVG to an offscreen canvas at target resolution
        const c = document.createElement('canvas')
        c.width = width
        c.height = height
        const cctx = c.getContext('2d')
        cctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(blobUrl)
        createImageBitmap(c).then(resolve).catch(() => resolve(img))
      }
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null) }
      img.src = blobUrl
    })
  } catch {
    return null
  }
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCircularImage(ctx, img, cx, cy, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  // Cover-fit: use the smaller dimension to avoid warping
  const size = radius * 2
  const scale = Math.max(size / img.width, size / img.height)
  const sw = size / scale
  const sh = size / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, cx - radius, cy - radius, size, size)
  ctx.restore()
}

function drawInitials(ctx, name, cx, cy, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = '#2a2a42'
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `bold ${radius * 0.8}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  ctx.fillText(initials, cx, cy)
  ctx.restore()
}

function truncName(name, maxLen = 11) {
  if (!name) return ''
  if (name.length <= maxLen) return name
  return name.slice(0, maxLen - 1) + '.'
}

function buildKeyMoves(state) {
  const moves = []

  // Draft pick
  if (state.draftPick) {
    moves.push({ icon: '+', text: `Drafted ${state.draftPick.name} (#${state.draftPick.pick})` })
  }

  // RFA re-signs
  RFA_DECISIONS.forEach(p => {
    const d = state.rfaDecisions?.[p.name]
    if (d && d.decision === 'resign') {
      moves.push({ icon: '+', text: `Re-signed ${p.name} (${fmt(d.salary)})` })
    } else {
      moves.push({ icon: '-', text: `Let ${p.name} walk` })
    }
  })

  // Non-guaranteed waives
  NON_GUARANTEED.forEach(p => {
    if (state.nonGuaranteedDecisions[p.name] === 'waive') {
      moves.push({ icon: '-', text: `Waived ${p.name}` })
    }
  })

  // Team option declines
  TEAM_OPTIONS.forEach(p => {
    if (state.teamOptionDecisions[p.name] === 'decline') {
      moves.push({ icon: '-', text: `Declined ${p.name} option` })
    }
  })

  // FA signings
  state.signedFAs.forEach(fa => {
    const type = fa.signingType === 'mle' ? 'MLE' : fa.signingType === 'vet_min' ? 'Vet Min' : 'Custom'
    moves.push({ icon: '+', text: `Signed ${fa.name} (${type}, ${fmt(fa.salary)})` })
  })

  // Trades
  state.trades.forEach(trade => {
    const out = trade.jazzOut.map(p => p.name).filter(Boolean).join(', ')
    const inn = trade.otherOut.map(p => p.name).filter(Boolean).join(', ')
    if (out && inn) {
      moves.push({ icon: '↔', text: `Traded ${out} for ${inn}` })
    }
  })

  return moves.slice(0, 8)
}

export async function generateShareImage(state, computed, roster) {
  const headshotUrl = id => `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=350&h=254`
  const photoMap = new Map()

  // Build list of player images needed (from depth chart — all 3 rows)
  const depthPlayers = []
  for (const pos of POSITIONS) {
    const slots = state.depthChart[pos] || []
    for (let i = 0; i < 3; i++) {
      const name = slots[i]
      if (name) depthPlayers.push(name)
    }
  }

  // Find espnId or photo for each depth chart player
  const imagePromises = depthPlayers.map(name => {
    const rosterPlayer = roster.find(p => p.name === name)
    const draftProspect = DRAFT_PROSPECTS.find(d => d.name === name)
    const espnId = rosterPlayer?.espnId
    const photo = draftProspect?.photo || rosterPlayer?.photo
    const url = espnId ? headshotUrl(espnId) : photo
    if (!url) return Promise.resolve([name, null])
    return loadImage(url).then(img => [name, img])
  })

  // Load logo as hi-res SVG (rendered at 2x for crisp output)
  const logoPromise = loadSvgAsImage('/sch-logo.svg', 256, 256)

  const results = await Promise.all([...imagePromises, logoPromise])
  const logoImg = results[results.length - 1]
  results.slice(0, -1).forEach(([name, img]) => { if (img) photoMap.set(name, img) })

  // Layout: 1200x1200 square, fill all space
  const PAD = 40
  const HEADER_H = 130
  const LOGO_SIZE = 110
  const LOGO_OVERHANG = 20
  const BOTTOM_PAD = 24

  const keyMoves = buildKeyMoves(state)

  const H = W
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = DARK_BG
  ctx.fillRect(0, 0, W, H)

  // ── Section 1: Header ──
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, W, HEADER_H)
  ctx.fillStyle = TEAL
  ctx.fillRect(0, HEADER_H - 5, W, 5)

  if (logoImg) {
    const logoAspect = logoImg.width / logoImg.height
    const logoDrawH = LOGO_SIZE + LOGO_OVERHANG
    const logoDrawW = logoDrawH * logoAspect
    const logoY = (HEADER_H - LOGO_SIZE) / 2
    ctx.drawImage(logoImg, 36, logoY, logoDrawW, logoDrawH)
  }

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('JAZZ FREE AGENCY SIMULATOR', 36 + LOGO_SIZE + 56, HEADER_H / 2)

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('saltcityhoops.com', W - 36, HEADER_H / 2)

  // ── Section 2: Cap Stats ──
  const statsY = HEADER_H + 30
  const statsH = 120
  const cardGap = 20
  const cardW = (W - PAD * 2 - cardGap * 3) / 4
  const stats = [
    { label: 'PAYROLL', value: fmt(computed.totalPayroll) },
    { label: 'CAP SPACE', value: fmt(computed.capSpace) },
    { label: 'TAX SPACE', value: fmt(computed.taxSpace) },
    { label: 'ROSTER', value: `${computed.rosterCount}/15` },
  ]

  stats.forEach((stat, i) => {
    const x = PAD + i * (cardW + cardGap)
    ctx.fillStyle = CARD_BG
    drawRoundedRect(ctx, x, statsY, cardW, statsH, 14)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(stat.label, x + cardW / 2, statsY + 22)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(stat.value, x + cardW / 2, statsY + 76)
  })

  // ── Calculate key moves zone (anchored to bottom) ──
  const movesPerCol = keyMoves.length > 4 ? Math.ceil(keyMoves.length / 2) : keyMoves.length
  const moveLineH = 44
  const movesHeaderH = 46
  const movesContentH = Math.max(movesPerCol * moveLineH, 54)
  const movesSectionH = movesHeaderH + movesContentH
  const movesY = H - BOTTOM_PAD - movesSectionH

  // ── Section 3: Depth Chart (fills between stats and key moves) ──
  const depthY = statsY + statsH + 28
  const depthEnd = movesY - 12
  const depthAvail = depthEnd - depthY
  const posHeaderH = 30
  const rowHeight = (depthAvail - posHeaderH) / 3
  const colW = (W - PAD * 2) / 5
  const photoRadius = Math.min(Math.floor((rowHeight - 50) / 2), 50)
  const nameFontSize = 16

  function drawPlayerName(name, cx, topY) {
    ctx.fillStyle = '#fff'
    ctx.font = `${nameFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const parts = name.split(' ')
    if (parts.length === 1) {
      ctx.fillText(name, cx, topY)
    } else {
      ctx.fillText(parts[0], cx, topY)
      ctx.fillText(parts.slice(1).join(' '), cx, topY + nameFontSize + 2)
    }
  }

  for (let row = 0; row < 3; row++) {
    const rowY = depthY + posHeaderH + row * rowHeight

    for (let col = 0; col < 5; col++) {
      const pos = POSITIONS[col]
      const cx = PAD + col * colW + colW / 2
      const cy = rowY + photoRadius + 2

      if (row === 0) {
        ctx.fillStyle = TEAL
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(pos, cx, depthY + posHeaderH - 6)
      }

      const name = state.depthChart[pos]?.[row] || null
      if (name) {
        const img = photoMap.get(name)
        if (img) {
          drawCircularImage(ctx, img, cx, cy, photoRadius)
        } else {
          drawInitials(ctx, name, cx, cy, photoRadius)
        }
        drawPlayerName(name, cx, cy + photoRadius + 6)
      } else {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, photoRadius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('Empty', cx, cy + photoRadius + 6)
      }
    }
  }

  // ── Section 4: Key Moves (anchored to bottom) ──
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(PAD, movesY, W - PAD * 2, 2)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('KEY MOVES', PAD, movesY + 16)

  const movesContentY = movesY + movesHeaderH

  if (keyMoves.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText('No moves made yet', PAD, movesContentY + 10)
  } else {
    const useTwoCols = keyMoves.length > 4
    const moveColW = useTwoCols ? (W - PAD * 2 - 40) / 2 : W - PAD * 2

    keyMoves.forEach((move, i) => {
      const col = useTwoCols ? Math.floor(i / movesPerCol) : 0
      const rowIdx = useTwoCols ? i % movesPerCol : i
      const x = PAD + col * (moveColW + 40)
      const y = movesContentY + rowIdx * moveLineH

      const iconColor = move.icon === '+' ? TEAL : move.icon === '-' ? '#ef4444' : '#f59e0b'
      ctx.fillStyle = iconColor
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      const iconChar = move.icon === '+' ? '✓' : move.icon === '-' ? '✗' : '↔'
      ctx.fillText(iconChar, x + 4, y)

      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(move.text, x + 38, y + 1)
    })
  }

  return canvas
}

function TiltPreview({ tilt, hovering }) {
  // Shimmer position follows the tilt — light comes from the opposite direction
  const shimmerX = 50 + tilt.y * 3  // 0-100% based on Y rotation
  const shimmerY = 50 + tilt.x * -3
  const shimmerOpacity = hovering ? 0.1 : 0

  return (
    <div style={{ perspective: 800 }}>
      <div
        className="rounded-xl"
        style={{
          position: 'relative',
          overflow: 'hidden',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.04 : 1})`,
          transition: hovering ? 'transform 0.15s cubic-bezier(0.03, 0.98, 0.52, 0.99)' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)',
          willChange: 'transform',
        }}
      >
        <img
          src="/share-preview.png"
          alt="Share preview"
          className="w-full"
          style={{ display: 'block' }}
        />
        {/* Shimmer overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${shimmerX}% ${shimmerY}%, rgba(255,255,255,${shimmerOpacity}) 0%, transparent 60%)`,
            transition: 'opacity 0.3s ease-out',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

function ShareModal({ canvas, onClose }) {
  const [copied, setCopied] = useState(false)
  const dataUrl = canvas.toDataURL('image/png')

  function handleDownload() {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'jazz-offseason-build.png'
    a.click()
  }

  async function handleCopy() {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      handleDownload()
    }
  }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(680px, calc(100vw - 32px))',
        maxHeight: '90dvh',
        zIndex: 10001,
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          background: 'var(--sch-black)',
          borderBottom: `3px solid ${TEAL}`,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Share Your Build</span>
          <button
            className="btn-x"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}
          >
            ×
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: 16, background: '#f5f5f5' }}>
          <img src={dataUrl} alt="Jazz offseason build" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
        </div>
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e5e5',
        }}>
          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{
              padding: '8px 20px', borderRadius: 8,
              border: '1px solid #d1d5db', background: '#fff',
              color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy Image'}
          </button>
          <button
            className="btn-teal"
            onClick={handleDownload}
            style={{
              padding: '8px 20px', borderRadius: 8,
              border: 'none', background: TEAL,
              color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Download PNG
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export default function ShareSection({ state, computed, roster }) {
  const [canvas, setCanvas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const cardRef = useRef(null)

  async function handleGenerate() {
    setLoading(true)
    try {
      const c = await generateShareImage(state, computed, roster)
      setCanvas(c)
    } finally {
      setLoading(false)
    }
  }

  const PROXIMITY = 200

  const handleGlobalMove = useCallback((e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const expanded = {
      left: rect.left - PROXIMITY,
      right: rect.right + PROXIMITY,
      top: rect.top - PROXIMITY,
      bottom: rect.bottom + PROXIMITY,
    }
    const inside = e.clientX >= expanded.left && e.clientX <= expanded.right &&
                   e.clientY >= expanded.top && e.clientY <= expanded.bottom
    if (inside) {
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setTilt({ x: y * -17, y: x * 17 })
      setHovering(true)
    } else if (hovering) {
      setHovering(false)
      setTilt({ x: 0, y: 0 })
    }
  }, [hovering])

  useEffect(() => {
    document.addEventListener('mousemove', handleGlobalMove)
    return () => document.removeEventListener('mousemove', handleGlobalMove)
  }, [handleGlobalMove])

  return (
    <>
      <div
        ref={cardRef}
        className="rounded-xl p-6 sm:p-12"
        style={{
          background: 'var(--sch-teal-bright)',
          backgroundImage: 'url(/dark-teal-stripes.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'calc(50% + 160px) center',
          backgroundSize: 'auto 100%',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-20">
          {/* Left: static preview with tilt effect */}
          <div className="sm:w-[260px] flex-shrink-0">
            <TiltPreview tilt={tilt} hovering={hovering} />
          </div>

          {/* Right: heading + button */}
          <div className="flex-1 flex flex-col justify-center items-center sm:items-start">
            <img src="/share-illustration.svg" alt="" style={{ height: 32, width: 'auto', marginBottom: 12 }} />
            <h3
              className="text-3xl font-bold mb-5 text-center sm:text-left"
              style={{ color: 'var(--sch-black)', fontFamily: "'Archivo Black', Arial, sans-serif" }}
            >
              Share Your Results
            </h3>
            <div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-sm font-bold px-6 py-3 rounded-lg btn-dark"
                style={{
                  background: 'var(--sch-black)', color: '#fff',
                  border: 'none', cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Generating…' : 'Generate Image'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {canvas && <ShareModal canvas={canvas} onClose={() => setCanvas(null)} />}
    </>
  )
}
