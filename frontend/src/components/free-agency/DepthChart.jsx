import { useState, useRef } from 'react'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']
const DEPTH_LABELS = ['Starters', '2nd Unit', 'Reserves']

export default function DepthChart({ state, dispatch, roster }) {
  const { depthChart } = state
  const dragItem = useRef(null)
  const dragOver = useRef(null)
  const [dragSource, setDragSource] = useState(null)

  // All assigned player names
  const assigned = new Set()
  POSITIONS.forEach(pos => {
    depthChart[pos].forEach(name => { if (name) assigned.add(name) })
  })

  // Unassigned players
  const unassigned = roster.filter(p => !assigned.has(p.name))

  function handleDragStart(playerName, source) {
    dragItem.current = playerName
    setDragSource(source)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleDropOnSlot(pos, slotIdx) {
    const playerName = dragItem.current
    if (!playerName) return

    const newChart = {}
    POSITIONS.forEach(p => { newChart[p] = [...depthChart[p]] })

    // Remove player from old position if assigned
    POSITIONS.forEach(p => {
      newChart[p] = newChart[p].map(n => n === playerName ? null : n)
    })

    // Place in new slot
    newChart[pos][slotIdx] = playerName
    dispatch({ type: 'UPDATE_DEPTH_CHART', payload: newChart })
    dragItem.current = null
    setDragSource(null)
  }

  function handleDropOnPool() {
    const playerName = dragItem.current
    if (!playerName) return

    // Remove from chart
    const newChart = {}
    POSITIONS.forEach(p => {
      newChart[p] = depthChart[p].map(n => n === playerName ? null : n)
    })
    dispatch({ type: 'UPDATE_DEPTH_CHART', payload: newChart })
    dragItem.current = null
    setDragSource(null)
  }

  function removeFromSlot(pos, slotIdx) {
    const newChart = {}
    POSITIONS.forEach(p => { newChart[p] = [...depthChart[p]] })
    newChart[pos][slotIdx] = null
    dispatch({ type: 'UPDATE_DEPTH_CHART', payload: newChart })
  }

  return (
    <div className="space-y-3">
      {/* Depth chart grid */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'var(--sch-black)' }}>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-left" style={{ color: 'rgba(255,255,255,0.7)', width: 80 }}>Depth</th>
                {POSITIONS.map(pos => (
                  <th key={pos} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {pos}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPTH_LABELS.map((label, slotIdx) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </td>
                  {POSITIONS.map(pos => {
                    const playerName = depthChart[pos][slotIdx]
                    return (
                      <td
                        key={pos}
                        className="px-2 py-2 text-center"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropOnSlot(pos, slotIdx)}
                        style={{ minHeight: 44 }}
                      >
                        {playerName ? (
                          <div
                            draggable
                            onDragStart={() => handleDragStart(playerName, `${pos}-${slotIdx}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-grab"
                            style={{
                              background: 'var(--bg-raised)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                            }}
                          >
                            <span style={{ cursor: 'grab', color: 'var(--text-faint)', fontSize: 10 }}>⠿</span>
                            {playerName}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFromSlot(pos, slotIdx) }}
                              style={{ color: 'var(--text-faint)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 12, fontWeight: 700, marginLeft: 2 }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            className="inline-block px-4 py-1.5 rounded-lg text-[10px]"
                            style={{ border: '1.5px dashed var(--border)', color: 'var(--text-faint)' }}
                          >
                            Drop here
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned player pool */}
      <div
        className="rounded-xl px-4 py-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        onDragOver={handleDragOver}
        onDrop={handleDropOnPool}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Unassigned Players ({unassigned.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {unassigned.map(p => (
            <div
              key={p.name}
              draggable
              onDragStart={() => handleDragStart(p.name, 'pool')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-grab"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <span style={{ cursor: 'grab', color: 'var(--text-faint)', fontSize: 10 }}>⠿</span>
              {p.name}
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{p.position}</span>
            </div>
          ))}
          {unassigned.length === 0 && (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>All players assigned</span>
          )}
        </div>
      </div>
    </div>
  )
}
