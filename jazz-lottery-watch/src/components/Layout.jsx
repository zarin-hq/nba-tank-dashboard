import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const LayoutContext = createContext({})

export function useLayout() {
  return useContext(LayoutContext)
}

export function LayoutConfig({ title, headerRight }) {
  const { setTitle, setHeaderRight } = useLayout()
  useState(() => {
    setTitle(title)
    setHeaderRight(headerRight)
  })
  // Update on re-render (e.g. when headerRight content changes)
  setTitle(title)
  setHeaderRight(headerRight)
  return null
}

const NAV_ITEMS = [
  { to: '/jazz-lottery-watch', label: 'Lottery Watch' },
  { to: '/free-agency', label: 'Free Agency Simulator' },
]

function NavMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={menuRef} className="relative" style={{ zIndex: 30 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center"
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: open ? 'var(--sch-teal-bright)' : 'transparent',
          color: open ? 'var(--sch-black)' : '#fff',
          border: open ? 'none' : '1px solid rgba(255,255,255,0.25)',
          transition: 'background 0.15s, color 0.15s',
        }}
        aria-label="Navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            background: '#fff', borderRadius: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            minWidth: 220, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '12px 18px',
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '0.9rem', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent)' : 'var(--text)',
                  background: active ? 'var(--bg-raised)' : 'transparent',
                  textDecoration: 'none',
                  borderLeft: active ? '3px solid var(--sch-teal-bright)' : '3px solid transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-raised)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const [logoPopped, setLogoPopped] = useState(false)
  const [title, setTitle] = useState('')
  const [headerRight, setHeaderRight] = useState(null)

  return (
    <LayoutContext.Provider value={{ setTitle, setHeaderRight }}>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
                  {title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {headerRight}
              <NavMenu />
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </LayoutContext.Provider>
  )
}
