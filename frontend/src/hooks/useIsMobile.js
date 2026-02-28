import { useState, useEffect } from 'react'

export default function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
