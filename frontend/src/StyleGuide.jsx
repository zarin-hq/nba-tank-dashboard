import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Token definitions ────────────────────────────────────────────────────────

const COLOR_TOKENS = [
  // Brand palette
  {
    group: 'Brand Palette',
    tokens: [
      { var: '--sch-black',      label: 'SCH Black',       default: '#000000', usage: 'Header background, table header, Jazz row border, modal header' },
      { var: '--sch-teal-bright',label: 'Teal Bright',     default: '#00ffb6', usage: 'Header bottom border, Run Lottery button, confetti, active accents' },
      { var: '--sch-teal',       label: 'Teal',            default: '#00d598', usage: 'Bar chart top-4 color label, accent-teal alias' },
      { var: '--sch-brand-blue', label: 'Brand Blue',      default: '#052065', usage: 'Jazz row tint, section headings, accent alias' },
      { var: '--sch-steel-blue', label: 'Steel Blue',      default: '#1d6daa', usage: 'Basketball Reference links, medium-intensity bar color, accent-2 alias' },
      { var: '--sch-dark-gray',  label: 'Dark Gray',       default: '#252627', usage: 'Body text, text alias' },
      { var: '--sch-med-gray',   label: 'Med Gray',        default: '#585a5c', usage: 'Muted text, table header labels, input placeholder' },
      { var: '--sch-light-gray', label: 'Light Gray',      default: '#b7b8bd', usage: 'Faint decorative elements' },
      { var: '--sch-smoke',      label: 'Smoke',           default: '#eceff1', usage: 'Row hover background' },
    ],
  },
  // Semantic tokens
  {
    group: 'Background',
    tokens: [
      { var: '--bg',        label: 'Page BG',    default: '#fafafa', usage: 'Page-level background' },
      { var: '--bg-card',   label: 'Card BG',    default: '#ffffff', usage: 'Card surfaces (TankTable, JazzPickOdds, TodayGames)' },
      { var: '--bg-raised', label: 'Raised BG',  default: '#f3f3f3', usage: 'Odd table rows, tooltip headers, skeleton loaders, disabled buttons' },
    ],
  },
  {
    group: 'Border',
    tokens: [
      { var: '--border',     label: 'Border',     default: '#e2e2e2', usage: 'Card outlines, table row dividers, tooltip border' },
      { var: '--border-med', label: 'Border Med', default: '#cccccc', usage: 'Zero-odds cell color, scrollbar thumb' },
    ],
  },
  {
    group: 'Text',
    tokens: [
      { var: '--text',       label: 'Text',       default: '#252627', usage: 'Primary body text, table cell values' },
      { var: '--text-muted', label: 'Text Muted', default: '#606263', usage: 'Secondary labels, table column headers overlay, pick number label' },
      { var: '--text-faint', label: 'Text Faint', default: '#606263', usage: 'Tertiary hints, "Updated …" timestamp, source labels' },
    ],
  },
  {
    group: 'Accent',
    tokens: [
      { var: '--accent',       label: 'Accent',       default: '#052065', usage: 'Section headings, Jazz team name, top accent bar' },
      { var: '--accent-2',     label: 'Accent 2',     default: '#1d6daa', usage: 'Basketball Reference link, medium bar color, SOS good color' },
      { var: '--accent-teal',  label: 'Accent Teal',  default: '#00d598', usage: 'Top-4 bar label color' },
    ],
  },
]

const TYPE_TOKENS = [
  { label: 'Page Title',      example: 'JAZZ TANK WATCH',            family: "'Archivo Black', Arial, sans-serif", size: '1.5rem', weight: 700,  color: '#ffffff',              usage: 'Header h1' },
  { label: 'Section Heading', example: 'Lottery Standings',          family: "'Archivo Black', Arial, sans-serif", size: '0.75rem', weight: 400, color: 'var(--accent)',        usage: 'Section h2 labels (font-display + uppercase + tracking-widest)' },
  { label: 'Card Title',      example: '2026 Draft Lottery Simulation', family: "'Archivo Black', Arial, sans-serif", size: '1rem', weight: 400, color: '#ffffff',             usage: 'Lottery modal header' },
  { label: 'Body',            example: 'Utah Jazz · 14–44 · W2',     family: "'Archivo', Arial, sans-serif",       size: '0.875rem', weight: 400, color: 'var(--text)',       usage: 'Default body text, table cells' },
  { label: 'Body Semibold',   example: 'New Orleans Pelicans',        family: "'Archivo', Arial, sans-serif",       size: '0.875rem', weight: 600, color: 'var(--text)',       usage: 'Team name in table, game card team name' },
  { label: 'Body Bold',       example: '14.2%  ·  TOP 4%',           family: "'Archivo', Arial, sans-serif",       size: '0.875rem', weight: 700, color: 'var(--text)',       usage: 'Top-4% odds, pick numbers in Jazz Pick Odds' },
  { label: 'Small',           example: 'Bottom 10 teams only',        family: "'Archivo', Arial, sans-serif",       size: '0.75rem',  weight: 400, color: 'var(--text-faint)', usage: 'Section subtitles, "Updated …" timestamp' },
  { label: 'Small Bold',      example: 'Today  ·  ↻ Refresh',        family: "'Archivo', Arial, sans-serif",       size: '0.75rem',  weight: 700, color: 'var(--text)',       usage: 'Date nav label, button text (xs buttons)' },
  { label: 'Micro Label',     example: 'NET RTG  ·  PPG  ·  P1',     family: "'Archivo', Arial, sans-serif",       size: '0.625rem', weight: 700, color: 'var(--text-muted)', usage: 'Table column headers, tooltip section labels (uppercase + tracking-widest)' },
  { label: 'Mono / Tabular',  example: '112–108  ·  +3.5  ·  .487',  family: "monospace",                          size: '0.875rem', weight: 400, color: 'var(--text)',       usage: 'Win–loss records, ratings, SOS' },
]

const BUTTON_TOKENS = [
  {
    label: 'Primary (Teal)',
    bg: 'var(--sch-teal-bright)',
    color: 'var(--sch-black)',
    size: '0.75rem',
    weight: 700,
    padding: '6px 12px',
    radius: '6px',
    usage: '↻ Refresh, Run Lottery — main call-to-action buttons in header / section bar',
  },
  {
    label: 'Secondary (Raised)',
    bg: 'var(--bg-raised)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    size: '0.75rem',
    weight: 700,
    padding: '6px 16px',
    radius: '6px',
    usage: 'See more — subtle table expand button',
  },
  {
    label: 'Run Again (modal)',
    bg: 'var(--sch-teal-bright)',
    color: '#000',
    size: '0.875rem',
    weight: 700,
    padding: '6px 16px',
    radius: '6px',
    usage: 'Run Again inside lottery modal footer',
  },
  {
    label: 'Nav Arrow',
    bg: 'var(--bg-raised)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    size: '0.875rem',
    weight: 700,
    padding: '0',
    radius: '4px',
    width: '24px',
    height: '24px',
    usage: '‹ › date navigation arrows in Games section',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function setCssVar(name, value) {
  document.documentElement.style.setProperty(name, value)
}

function resolveColor(val) {
  // If it's already a hex, return as-is; if CSS var, read it
  if (val.startsWith('#') || val.startsWith('rgb')) return val
  if (val.startsWith('var(')) {
    const name = val.replace(/^var\(/, '').replace(/\)$/, '').trim()
    return readCssVar(name) || val
  }
  return val
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColorSwatch({ token }) {
  const [hex, setHex] = useState(() => readCssVar(token.var) || token.default)

  function handleChange(e) {
    setHex(e.target.value)
    setCssVar(token.var, e.target.value)
    // Persist to localStorage so refreshing keeps edits
    const saved = JSON.parse(localStorage.getItem('sg-overrides') || '{}')
    saved[token.var] = e.target.value
    localStorage.setItem('sg-overrides', JSON.stringify(saved))
  }

  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Color picker + swatch */}
      <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: hex,
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }} />
        <input
          type="color"
          value={hex.length === 7 ? hex : token.default}
          onChange={handleChange}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </label>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{token.label}</span>
          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-raised)', color: 'var(--accent-2)', fontFamily: 'monospace' }}>
            {token.var}
          </code>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{hex}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{token.usage}</p>
      </div>
    </div>
  )
}

function TypeRow({ t }) {
  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-start gap-4 flex-wrap">
        <div style={{ minWidth: 200, flexShrink: 0 }}>
          <div className="text-xs font-bold mb-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.label}</div>
          <div className="text-xs" style={{ color: 'var(--text-faint)', fontFamily: 'monospace' }}>
            {t.size} · {t.weight} · {t.family.split(',')[0].replace(/'/g, '')}
          </div>
        </div>
        <div
          className="flex-1"
          style={{ fontFamily: t.family, fontSize: t.size, fontWeight: t.weight, color: resolveColor(t.color), background: t.color === '#ffffff' ? 'var(--sch-black)' : undefined, padding: t.color === '#ffffff' ? '4px 10px' : undefined, borderRadius: t.color === '#ffffff' ? 4 : undefined }}
        >
          {t.example}
        </div>
        <div className="text-xs w-64 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{t.usage}</div>
      </div>
    </div>
  )
}

function ButtonRow({ b }) {
  return (
    <div className="flex items-center gap-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ minWidth: 200, flexShrink: 0 }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>{b.label}</div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{b.usage}</div>
      </div>
      <button
        style={{
          background: b.bg,
          color: b.color,
          border: b.border || 'none',
          fontSize: b.size,
          fontWeight: b.weight,
          padding: b.padding,
          borderRadius: b.radius,
          width: b.width,
          height: b.height,
          cursor: 'pointer',
          fontFamily: "'Archivo', Arial, sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}
      >
        {b.label === 'Nav Arrow' ? '‹' : b.label}
      </button>
      <code className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {b.size} · {b.weight} · pad {b.padding}
      </code>
    </div>
  )
}

function Annotation({ label, children }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <div
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{
          position: 'absolute', bottom: '-22px', left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--accent-2)', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function HeaderPreview() {
  const [logoPopped, setLogoPopped] = useState(false)
  const time = new Date().toLocaleTimeString()

  return (
    <div className="py-6">
      {/* Spec notes */}
      <div className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
        Full-width header · height 70px · black bg · 3px teal-bright bottom border · 1px accent top bar
      </div>

      {/* Live preview, constrained to the content column */}
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: 'var(--accent)' }} />

        {/* Header */}
        <header
          className="px-6"
          style={{ background: 'var(--sch-black)', borderBottom: '3px solid var(--sch-teal-bright)', height: 70, overflow: 'visible' }}
        >
          <div className="h-full flex items-center justify-between">
            {/* Left: logo + title */}
            <div className="flex items-center gap-8 h-full">
              <img
                src="/sch-logo.svg"
                alt="Salt City Hoops"
                style={{
                  width: 81, height: 71, flexShrink: 0,
                  alignSelf: 'flex-start', marginTop: 15,
                  position: 'relative', zIndex: 1, cursor: 'pointer',
                  animation: logoPopped ? 'logo-pop 0.45s ease-out forwards' : undefined,
                }}
                onMouseEnter={() => setLogoPopped(true)}
                onAnimationEnd={() => setLogoPopped(false)}
              />
              <h1
                className="text-2xl tracking-tight leading-none text-white"
                style={{ fontFamily: "'Archivo Black', Arial, sans-serif" }}
              >
                JAZZ TANK WATCH
              </h1>
            </div>

            {/* Right: timestamp + refresh */}
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Updated {time}
              </span>
              <button
                className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide"
                style={{ background: 'var(--sch-teal-bright)', color: 'var(--sch-black)', border: 'none', cursor: 'pointer' }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Token callouts */}
      <div className="mt-6 grid gap-2" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {[
          ['Background',    '--sch-black'],
          ['Bottom border', '3px solid --sch-teal-bright'],
          ['Top bar',       '4px solid --accent'],
          ['Title font',    'Archivo Black · 1.5rem · 700 · white'],
          ['Button',        '--sch-teal-bright bg · --sch-black text · text-xs font-bold uppercase'],
          ['Timestamp',     'text-xs · rgba(255,255,255,0.35)'],
          ['Logo hover',    'logo-pop keyframe → scale 1→1.08→1.02→1'],
        ].map(([label, value]) => (
          <div key={label} className="contents">
            <span className="text-xs font-bold pr-4 py-1" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            <code className="text-xs py-1" style={{ color: 'var(--accent-2)', fontFamily: 'monospace' }}>{value}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2
        className="text-sm uppercase tracking-widest font-display mb-1"
        style={{ color: 'var(--accent)' }}
      >
        {title}
      </h2>
      <div style={{ borderTop: '2px solid var(--sch-black)', marginBottom: 0 }} />
      {children}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StyleGuide() {
  // Apply any saved overrides on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sg-overrides') || '{}')
    Object.entries(saved).forEach(([k, v]) => setCssVar(k, v))
  }, [])

  function resetAll() {
    localStorage.removeItem('sg-overrides')
    // Remove all inline overrides so stylesheet defaults take over
    COLOR_TOKENS.flatMap(g => g.tokens).forEach(t => {
      document.documentElement.style.removeProperty(t.var)
    })
    window.location.reload()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="h-1 w-full" style={{ background: 'var(--accent)' }} />
      <header style={{ background: 'var(--sch-black)', borderBottom: '3px solid var(--sch-teal-bright)', height: 70 }} className="px-6 flex items-center">
        <div className="max-w-[900px] mx-auto w-full flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              ← Jazz Tank Watch
            </Link>
            <h1 className="text-white text-xl tracking-tight leading-none mt-1" style={{ fontFamily: "'Archivo Black', Arial, sans-serif" }}>
              Style Guide
            </h1>
          </div>
          <button
            onClick={resetAll}
            className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
          >
            Reset to defaults
          </button>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-10">
        <p className="text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
          Click any color swatch to edit it. Changes apply live across the page and are saved in your browser. Use <strong>Reset to defaults</strong> to revert. To make a change permanent, copy the hex value into <code style={{ fontFamily: 'monospace', fontSize: '0.8em', background: 'var(--bg-raised)', padding: '1px 4px', borderRadius: 3 }}>src/index.css</code>.
        </p>

        {/* ── Colors ── */}
        {COLOR_TOKENS.map(group => (
          <Section key={group.group} title={group.group}>
            {group.tokens.map(token => (
              <ColorSwatch key={token.var} token={token} />
            ))}
          </Section>
        ))}

        {/* ── Typography ── */}
        <Section title="Typography">
          {TYPE_TOKENS.map(t => (
            <TypeRow key={t.label} t={t} />
          ))}
        </Section>

        {/* ── Buttons ── */}
        <Section title="Buttons">
          {BUTTON_TOKENS.map(b => (
            <ButtonRow key={b.label} b={b} />
          ))}
        </Section>

        {/* ── Components ── */}
        <Section title="Components">
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              Header Bar
            </div>
            <HeaderPreview />
          </div>
        </Section>
      </main>
    </div>
  )
}
