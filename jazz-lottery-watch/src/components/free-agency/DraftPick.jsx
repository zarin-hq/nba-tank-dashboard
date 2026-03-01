import { useState } from 'react'
import ROOKIE_SCALE from '../../data/rookie-scale'
import DRAFT_PROSPECTS from '../../data/draft-prospects'

const fmt = n => `$${(n / 1_000_000).toFixed(1)}M`
const PICKS = ROOKIE_SCALE.filter(r => r.pick <= 8)

export default function DraftPick({ state, dispatch }) {
  const [selectedPick, setSelectedPick] = useState(state.draftPick?.pick || '')
  const [selectedProspect, setSelectedProspect] = useState(state.draftPick?.name || '')

  function handlePickChange(e) {
    const pick = Number(e.target.value)
    setSelectedPick(pick || '')
    if (!pick) {
      dispatch({ type: 'SET_DRAFT_PICK', payload: null })
      return
    }
    const entry = ROOKIE_SCALE.find(r => r.pick === pick)
    if (entry) {
      const pr = DRAFT_PROSPECTS.find(p => p.name === selectedProspect)
      dispatch({ type: 'SET_DRAFT_PICK', payload: { pick, name: selectedProspect, salary: entry.salary, photo: pr?.photo } })
    }
  }

  function handleProspectChange(e) {
    const name = e.target.value
    setSelectedProspect(name)
    if (selectedPick) {
      const entry = ROOKIE_SCALE.find(r => r.pick === Number(selectedPick))
      if (entry) {
        const pr = DRAFT_PROSPECTS.find(p => p.name === name)
        dispatch({ type: 'SET_DRAFT_PICK', payload: { pick: Number(selectedPick), name, salary: entry.salary, photo: pr?.photo } })
      }
    }
  }

  const currentSalary = state.draftPick?.salary
  const prospect = DRAFT_PROSPECTS.find(p => p.name === selectedProspect)

  return (
    <div className="rounded-xl px-4 py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex flex-wrap items-end gap-4">
        {/* Pick selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Pick Slot
          </label>
          <select
            value={selectedPick}
            onChange={handlePickChange}
            className="px-3 rounded text-sm"
            style={{
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 120,
              height: 38,
            }}
          >
            <option value="">No pick</option>
            {PICKS.map(r => (
              <option key={r.pick} value={r.pick}>#{r.pick}</option>
            ))}
          </select>
        </div>

        {/* Prospect selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Prospect
          </label>
          <select
            value={selectedProspect}
            onChange={handleProspectChange}
            className="px-3 rounded text-sm"
            style={{
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 220,
              height: 38,
            }}
          >
            <option value="">Select prospect...</option>
            {DRAFT_PROSPECTS.map(p => (
              <option key={p.rank} value={p.name}>{p.name} — {p.pos}, {p.school}</option>
            ))}
          </select>
        </div>

        {/* Prospect photo + salary */}
        {(prospect || currentSalary) && (
          <div className="flex items-center gap-3">
            {prospect && (
              <img
                src={prospect.photo}
                alt={prospect.name}
                className="rounded-full object-cover object-top"
                style={{ width: 38, height: 38, background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              />
            )}
            {currentSalary && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Salary</div>
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--sch-black)' }}>{fmt(currentSalary)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
