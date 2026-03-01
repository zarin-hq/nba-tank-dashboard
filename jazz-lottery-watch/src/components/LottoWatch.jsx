import { PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, ResponsiveContainer } from 'recharts'

const JAZZ_ID = 1610612762

function TeamLogo({ teamId, size = 10 }) {
  return (
    <img
      src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
      alt=""
      className={`w-${size} h-${size} object-contain`}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

function LotteryPie({ pct, isJazz }) {
  const filled = Math.min(100, pct)
  const color = isJazz ? 'var(--sch-gold)' : 'var(--sch-purple)'
  return (
    <div className="relative flex justify-center">
      <PieChart width={96} height={56}>
        <Pie
          data={[{ value: filled }, { value: 100 - filled }]}
          cx={48} cy={52}
          startAngle={180} endAngle={0}
          innerRadius={30} outerRadius={46}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={isJazz ? '#f9a01b' : '#5c2d91'} />
          <Cell fill="#1e1e1e" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
        <span className="text-sm font-bold" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

function SosBar({ sos }) {
  if (sos == null) return <span className="text-xs" style={{ color: '#444' }}>N/A</span>
  const pct = sos * 100
  const deviation = (sos - 0.5) * 100
  return (
    <div>
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ v: deviation }]} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <ReferenceLine y={0} stroke="#2a2a2a" strokeDasharray="3 3" />
            <Bar dataKey="v" fill={deviation > 0 ? '#f87171' : '#60a5fa'} radius={[2, 2, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-xs font-mono" style={{ color: '#666' }}>
        .{String(Math.round(pct)).padStart(3, '0')}
      </div>
    </div>
  )
}

function TeamCard({ team }) {
  const isJazz = team.team_id === JAZZ_ID
  const borderColor = isJazz ? 'var(--sch-gold)' : 'var(--sch-border)'
  const topBar = isJazz
    ? 'linear-gradient(90deg, var(--sch-purple), var(--sch-gold))'
    : 'var(--sch-purple)'

  return (
    <div
      className="flex-shrink-0 w-44 rounded-lg overflow-hidden flex flex-col"
      style={{ background: 'var(--sch-surface)', border: `1px solid ${borderColor}` }}
    >
      <div className="h-0.5 flex-shrink-0" style={{ background: topBar }} />

      {/* Header */}
      <div className="px-3 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--sch-border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold" style={{ color: '#555' }}>#{team.lottery_slot}</span>
          {isJazz && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(249,160,27,0.15)', color: 'var(--sch-gold)' }}>
              JAZZ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TeamLogo teamId={team.team_id} size={8} />
          <div>
            <div className="text-xs font-bold leading-tight" style={{ color: '#e5e5e5' }}>{team.team_city}</div>
            <div className="text-xs leading-tight" style={{ color: '#888' }}>{team.team_name}</div>
          </div>
        </div>
        <div className="mt-1.5 text-center font-bold text-sm" style={{ color: '#e5e5e5' }}>
          {team.wins}–{team.losses}
        </div>
      </div>

      {/* GB */}
      <div className="px-3 py-2 text-center" style={{ borderBottom: '1px solid var(--sch-border)' }}>
        {team.lottery_slot === 1 ? (
          <span className="text-xs font-bold" style={{ color: 'var(--sch-gold)' }}>Lottery Leader</span>
        ) : (
          <span className="font-mono text-sm" style={{ color: '#aaa' }}>+{team.gb.toFixed(1)} GB</span>
        )}
      </div>

      {/* Net Rating */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--sch-border)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-center mb-1" style={{ color: '#444' }}>Net Rtg</div>
        <div className="text-center">
          <span className="text-lg font-bold"
            style={{ color: team.net_rtg == null ? '#444' : team.net_rtg < 0 ? '#f87171' : '#4ade80' }}>
            {team.net_rtg != null ? (team.net_rtg > 0 ? '+' : '') + team.net_rtg.toFixed(1) : '—'}
          </span>
          {team.off_rtg_rank && (
            <div className="text-[10px] mt-0.5" style={{ color: '#555' }}>
              #{team.off_rtg_rank} O · #{team.def_rtg_rank} D
            </div>
          )}
        </div>
      </div>

      {/* Lottery odds */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--sch-border)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-center mb-1" style={{ color: '#444' }}>% Top 4</div>
        <LotteryPie pct={team.top4_odds ?? 0} isJazz={isJazz} />
      </div>

      {/* SOS */}
      <div className="px-3 py-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-center mb-1" style={{ color: '#444' }}>Rem. SOS</div>
        <SosBar sos={team.sos} />
      </div>
    </div>
  )
}

export default function LottoWatch({ data, loading, error }) {
  if (loading) return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-44 h-80 rounded-lg animate-pulse"
          style={{ background: 'var(--sch-surface)', border: '1px solid var(--sch-border)' }} />
      ))}
    </div>
  )

  if (error) return (
    <div className="rounded-lg p-4 text-sm" style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', color: '#f87171' }}>
      Error: {error}
    </div>
  )

  if (!data?.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
      {data.map(team => <TeamCard key={team.team_id} team={team} />)}
    </div>
  )
}
