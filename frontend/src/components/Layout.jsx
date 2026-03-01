import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'

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
            {headerRight && (
              <div className="flex items-center gap-3">
                {headerRight}
              </div>
            )}
          </div>
        </header>
        <Outlet />
      </div>
    </LayoutContext.Provider>
  )
}
