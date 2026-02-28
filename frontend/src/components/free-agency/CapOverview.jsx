import { useState, useEffect } from 'react'
import { CAP_NUMBERS } from '../../data/jazz-contracts'

const fmt = n => {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export default function CapOverview({ computed }) {
  const { totalPayroll, capSpace, taxSpace, rosterCount } = computed
  const { salaryCap, luxuryTax, firstApron, secondApron } = CAP_NUMBERS

  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t) }, [])

  // Extend bar $10M past the 2nd apron
  const barMax = secondApron + 10_000_000
  const payrollPct = mounted ? Math.min((totalPayroll / barMax) * 100, 100) : 0
  const capLinePct = (salaryCap / barMax) * 100
  const taxLinePct = (luxuryTax / barMax) * 100
  const apron1Pct = (firstApron / barMax) * 100
  const apron2Pct = (secondApron / barMax) * 100

  const cards = [
    { label: 'Total Payroll', value: fmt(totalPayroll), color: 'var(--sch-black)' },
    { label: 'Cap Space', value: fmt(capSpace), sub: capSpace < 0 ? 'Over cap' : 'Under cap', color: 'var(--sch-black)', tip: 'How much room the team has before reaching the salary cap. Teams over the cap can still sign players using exceptions like the MLE and vet minimum.' },
    { label: 'Tax Space', value: fmt(taxSpace), sub: taxSpace < 0 ? 'Over tax' : 'Under tax', color: taxSpace >= 0 ? 'var(--sch-black)' : '#dc2626', tip: 'How much room the team has before hitting the luxury tax line. Teams over the tax pay a progressive dollar-for-dollar penalty that increases with repeat offenses.' },
    { label: 'Roster Spots', value: `${rosterCount}/15`, sub: rosterCount > 15 ? 'Over limit' : `${15 - rosterCount} open`, color: rosterCount > 15 ? '#dc2626' : 'var(--text)' },
  ]

  return (
    <div className="space-y-3">
      {/* Cap bar */}
      <div className="rounded-xl py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', paddingLeft: 16, paddingRight: 16, overflow: 'visible', position: 'relative', zIndex: 10 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Salary</span>
        </div>
        <div className="relative h-6 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
          {/* Payroll fill */}
          <div
            className="h-full rounded-full"
            style={{ width: `${payrollPct}%`, background: 'var(--sch-teal-bright)', minWidth: mounted ? 4 : 0, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
          {/* Cap line */}
          <div className="absolute top-0 h-full" style={{ left: `${capLinePct}%`, width: 2, background: 'var(--sch-black)', opacity: 0.6 }} />
          {/* Tax line */}
          <div className="absolute top-0 h-full" style={{ left: `${taxLinePct}%`, width: 2, background: 'var(--sch-black)', opacity: 0.6 }} />
          {/* 1st Apron line */}
          <div className="absolute top-0 h-full hidden sm:block" style={{ left: `${apron1Pct}%`, width: 2, background: 'var(--sch-black)', opacity: 0.6 }} />
          {/* 2nd Apron line */}
          <div className="absolute top-0 h-full hidden sm:block" style={{ left: `${apron2Pct}%`, width: 2, background: 'var(--sch-black)', opacity: 0.6 }} />
        </div>
        {/* Labels below */}
        <div className="relative mt-1" style={{ height: 24 }}>
          <CapLabel left={capLinePct} label="Cap" value={fmt(salaryCap)} tip="The salary cap is the soft limit on team spending. Teams can exceed it using exceptions like Bird rights, the MLE, and vet minimums." />
          <CapLabel left={taxLinePct} label="Tax" value={fmt(luxuryTax)} tip="The luxury tax threshold. Teams exceeding this line pay a progressive tax penalty on every dollar over." />
          <span className="hidden sm:inline"><CapLabel left={apron1Pct} label="1st" value={fmt(firstApron)} tip="The first apron restricts teams from using certain exceptions and limits trade flexibility." /></span>
          <span className="hidden sm:inline"><CapLabel left={apron2Pct} label="2nd" value={fmt(secondApron)} tip="The second (hard) apron imposes the strictest restrictions — teams above this cannot aggregate salaries in trades, use the bi-annual exception, or send cash in trades." /></span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl px-4 py-4 relative"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              {c.label}
            </div>
            {c.tip && <CardTip text={c.tip} />}
            <div className="text-2xl font-bold tabular-nums" style={{ color: c.color }}>
              {c.value}
            </div>
            {c.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CapLabel({ left, label, value, tip }) {
  const [show, setShow] = useState(false)
  const alignRight = left > 60
  return (
    <span
      className="absolute text-[9px] font-bold text-center leading-tight cursor-help"
      style={{ left: `${left}%`, transform: 'translateX(-50%)', color: 'var(--sch-black)', whiteSpace: 'nowrap' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {label}<br />{value}
      {show && (
        <span
          className="absolute z-50 rounded-lg text-[11px] font-normal normal-case tracking-normal text-left leading-snug"
          style={{
            bottom: '100%', marginBottom: 6,
            ...(alignRight ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' }),
            width: 200, padding: '8px 10px', whiteSpace: 'normal',
            background: 'var(--sch-black)', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          {tip}
        </span>
      )}
    </span>
  )
}

function CardTip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="absolute cursor-help"
      style={{ top: 12, right: 12 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg style={{ width: 14, height: 14, color: 'var(--text-faint)' }} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
      {show && (
        <span
          className="absolute z-50 rounded-lg text-[11px] font-normal normal-case tracking-normal text-left leading-snug"
          style={{
            bottom: '100%', right: 0, marginBottom: 6,
            width: 220, padding: '8px 10px',
            background: 'var(--sch-black)', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none', whiteSpace: 'normal',
          }}
        >
          {text}
        </span>
      )}
    </span>
  )
}
