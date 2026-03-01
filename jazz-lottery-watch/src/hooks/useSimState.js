import { useReducer, useEffect, useMemo } from 'react'
import { CAP_NUMBERS, GUARANTEED, NON_GUARANTEED, RFA_DECISIONS, TEAM_OPTIONS } from '../data/jazz-contracts'

const STORAGE_KEY = 'jazz-fa-sim'

// Default state
function defaultState() {
  // Non-guaranteed: all kept by default
  const nonGuaranteedDecisions = {}
  NON_GUARANTEED.forEach(p => { nonGuaranteedDecisions[p.name] = 'keep' })

  // Team options: all exercised by default
  const teamOptionDecisions = {}
  TEAM_OPTIONS.forEach(p => { teamOptionDecisions[p.name] = 'exercise' })

  // RFA re-sign decisions: default to don't sign
  const rfaDecisions = {}
  RFA_DECISIONS.forEach(p => { rfaDecisions[p.name] = { decision: 'dont_sign', salary: 0 } })

  return {
    nonGuaranteedDecisions,   // { playerName: 'keep' | 'waive' }
    teamOptionDecisions,      // { playerName: 'exercise' | 'decline' }
    rfaDecisions,             // { playerName: { decision: 'resign' | 'dont_sign', salary: number } }
    draftPick: null,          // { pick: number, name: string, salary: number }
    signedFAs: [],            // [{ name, position, salary, signingType: 'mle'|'vet_min'|'custom', age?, team?, type? }]
    trades: [],               // [{ id, jazzOut: [...], otherTeam: string, otherOut: [...] }]
    depthChart: {             // { PG: [name,name,name], SG: [...], SF: [...], PF: [...], C: [...] }
      PG: [null, null, null],
      SG: [null, null, null],
      SF: [null, null, null],
      PF: [null, null, null],
      C:  [null, null, null],
    },
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with defaults to handle newly added fields
      const defaults = defaultState()
      return { ...defaults, ...parsed }
    }
  } catch { /* ignore parse errors */ }
  return defaultState()
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_NON_GUARANTEED': {
      const current = state.nonGuaranteedDecisions[action.player]
      return {
        ...state,
        nonGuaranteedDecisions: {
          ...state.nonGuaranteedDecisions,
          [action.player]: current === 'keep' ? 'waive' : 'keep',
        },
      }
    }
    case 'TOGGLE_TEAM_OPTION': {
      const current = state.teamOptionDecisions[action.player]
      return {
        ...state,
        teamOptionDecisions: {
          ...state.teamOptionDecisions,
          [action.player]: current === 'exercise' ? 'decline' : 'exercise',
        },
      }
    }
    case 'SET_RFA_DECISION':
      return {
        ...state,
        rfaDecisions: {
          ...state.rfaDecisions,
          [action.player]: { decision: action.decision, salary: action.salary || 0 },
        },
      }
    case 'SET_DRAFT_PICK':
      return { ...state, draftPick: action.payload }
    case 'SIGN_FA':
      return { ...state, signedFAs: [...state.signedFAs, action.payload] }
    case 'REMOVE_FA':
      return { ...state, signedFAs: state.signedFAs.filter((_, i) => i !== action.index) }
    case 'ADD_TRADE':
      return { ...state, trades: [...state.trades, { ...action.payload, id: Date.now() }] }
    case 'REMOVE_TRADE':
      return { ...state, trades: state.trades.filter(t => t.id !== action.id) }
    case 'UPDATE_DEPTH_CHART':
      return { ...state, depthChart: action.payload }
    case 'RESET':
      return defaultState()
    default:
      return state
  }
}

export default function useSimState() {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Persist to localStorage on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Compute derived values
  const computed = useMemo(() => {
    // Guaranteed contracts always count
    let totalPayroll = GUARANTEED.reduce((sum, p) => sum + p.salary, 0)

    // Non-guaranteed: add if kept
    NON_GUARANTEED.forEach(p => {
      if (state.nonGuaranteedDecisions[p.name] === 'keep') {
        totalPayroll += p.salary
      }
    })

    // Team options: add if exercised
    TEAM_OPTIONS.forEach(p => {
      if (state.teamOptionDecisions[p.name] === 'exercise') {
        totalPayroll += p.salary
      }
    })

    // RFA re-signs: add custom salary if re-signed
    RFA_DECISIONS.forEach(p => {
      const d = state.rfaDecisions?.[p.name]
      if (d && d.decision === 'resign') {
        totalPayroll += d.salary
      }
    })

    // Draft pick salary
    if (state.draftPick) {
      totalPayroll += state.draftPick.salary
    }

    // Signed free agents
    state.signedFAs.forEach(fa => {
      totalPayroll += fa.salary
    })

    // Trades: subtract outgoing, add incoming
    state.trades.forEach(trade => {
      trade.jazzOut.forEach(p => { totalPayroll -= (p.salary || 0) })
      trade.otherOut.forEach(p => { totalPayroll += (p.salary || 0) })
    })

    const capSpace = CAP_NUMBERS.salaryCap - totalPayroll
    const taxSpace = CAP_NUMBERS.luxuryTax - totalPayroll

    // Count roster spots
    let rosterCount = GUARANTEED.length
    NON_GUARANTEED.forEach(p => {
      if (state.nonGuaranteedDecisions[p.name] === 'keep') rosterCount++
    })
    TEAM_OPTIONS.forEach(p => {
      if (state.teamOptionDecisions[p.name] === 'exercise') rosterCount++
    })
    RFA_DECISIONS.forEach(p => {
      const d = state.rfaDecisions?.[p.name]
      if (d && d.decision === 'resign') rosterCount++
    })
    if (state.draftPick) rosterCount++
    rosterCount += state.signedFAs.length
    // Adjust for trades
    state.trades.forEach(trade => {
      rosterCount -= trade.jazzOut.filter(p => p.name).length
      rosterCount += trade.otherOut.filter(p => p.name).length
    })

    const hasMLE = state.signedFAs.some(fa => fa.signingType === 'mle')

    return { totalPayroll, capSpace, taxSpace, rosterCount, hasMLE }
  }, [state])

  // Build roster list (all players currently on the team)
  const roster = useMemo(() => {
    const players = []

    GUARANTEED.forEach(p => players.push({ ...p, status: 'guaranteed' }))

    NON_GUARANTEED.forEach(p => {
      if (state.nonGuaranteedDecisions[p.name] === 'keep') {
        players.push({ ...p, status: 'non-guaranteed (kept)' })
      }
    })

    TEAM_OPTIONS.forEach(p => {
      if (state.teamOptionDecisions[p.name] === 'exercise') {
        players.push({ ...p, status: 'team option (exercised)' })
      }
    })

    RFA_DECISIONS.forEach(p => {
      const d = state.rfaDecisions?.[p.name]
      if (d && d.decision === 'resign') {
        players.push({ ...p, salary: d.salary, status: 're-signed (RFA)' })
      }
    })

    if (state.draftPick) {
      players.push({
        name: state.draftPick.name || `2026 Pick #${state.draftPick.pick}`,
        position: '-',
        salary: state.draftPick.salary,
        status: 'draft pick',
        photo: state.draftPick.photo,
      })
    }

    state.signedFAs.forEach(fa => {
      players.push({
        ...fa,
        status: `signed (${fa.signingType === 'mle' ? 'MLE' : fa.signingType === 'vet_min' ? 'Vet Min' : 'Custom'})`,
      })
    })

    // Trades: remove outgoing, add incoming
    const tradedOut = new Set()
    state.trades.forEach(trade => {
      trade.jazzOut.forEach(p => { if (p.name) tradedOut.add(p.name) })
      trade.otherOut.forEach(p => {
        if (p.name) players.push({ name: p.name, position: '-', salary: p.salary || 0, status: 'traded for' })
      })
    })

    return players.filter(p => !tradedOut.has(p.name))
  }, [state])

  // Waived players that become free agents
  const waivedPlayers = useMemo(() => {
    const waived = []
    NON_GUARANTEED.forEach(p => {
      if (state.nonGuaranteedDecisions[p.name] === 'waive') {
        waived.push(p)
      }
    })
    TEAM_OPTIONS.forEach(p => {
      if (state.teamOptionDecisions[p.name] === 'decline') {
        waived.push(p)
      }
    })
    RFA_DECISIONS.forEach(p => {
      const d = state.rfaDecisions?.[p.name]
      if (!d || d.decision === 'dont_sign') {
        waived.push({ ...p, salary: p.qualifyingOffer })
      }
    })
    return waived
  }, [state])

  return { state, dispatch, computed, roster, waivedPlayers }
}
