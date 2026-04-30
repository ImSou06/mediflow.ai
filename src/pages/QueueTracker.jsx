import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Icons (inline SVG, no emoji) ──────────────────────────────────────────────
const IconCheck = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="4 10 8 14 16 6" />
  </svg>
)
const IconStethoscope = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
)
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const IconDot = ({ className }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full ${className}`} />
)
const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// ── Crowd badge ───────────────────────────────────────────────────────────────
function CrowdBadge({ level, label }) {
  const styles = {
    high:   'bg-red-100 text-red-600',
    medium: 'bg-amber-100 text-amber-600',
    low:    'bg-green-100 text-green-600',
  }
  const dotStyles = {
    high:   'bg-red-500',
    medium: 'bg-amber-500',
    low:    'bg-green-500',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${styles[level] || styles.low}`}>
      <IconDot className={dotStyles[level] || dotStyles.low} />
      {label}
    </span>
  )
}

// ── Wait time color ───────────────────────────────────────────────────────────
function waitColor(mins) {
  if (mins >= 60) return 'text-red-600'
  if (mins >= 30) return 'text-amber-600'
  return 'text-green-600'
}

export default function QueueTracker() {
  const navigate = useNavigate()
  const [tokenInput, setTokenInput] = useState('')
  const [tokenData, setTokenData]   = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [deptOverview, setDeptOverview] = useState([])
  const [stats, setStats]           = useState(null)

  // Load department overview + stats on mount
  useEffect(() => {
    fetch('/api/departments/overview?hospital_id=1')
      .then(r => r.json())
      .then(data => setDeptOverview(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {})

    fetch('/api/dashboard/stats?hospital_id=1')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  const trackToken = () => {
    const val = tokenInput.trim()
    if (!val) return
    setLoading(true); setError(''); setTokenData(null)
    fetch(`/api/tokens/${encodeURIComponent(val)}`)
      .then(r => { if (!r.ok) throw new Error('Token not found'); return r.json() })
      .then(data => { setTokenData(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') trackToken() }

  // Derived display values
  const nowServing  = tokenData ? `${String.fromCharCode(64 + ((tokenData.dept_id % 26) || 1))}${100 + Math.max(0, (tokenData.position || 0) - 1)}` : '~'
  const yourToken   = tokenData ? tokenData.token_code : '~'
  const aheadCount  = tokenData ? (tokenData.position || 0) : null
  const waitMins    = tokenData ? (tokenData.ai_report?.wait_time ?? 0) : null
  const isEmergency = tokenData?.ai_report?.is_emergency
  const arriveTime  = tokenData ? (() => {
    const d = new Date(); d.setMinutes(d.getMinutes() + (waitMins || 0))
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })() : null
  const progressPct = tokenData && aheadCount != null
    ? Math.max(10, Math.min(95, 100 - (aheadCount / Math.max(aheadCount + 1, 10)) * 100))
    : 0
  const startTokenLabel = tokenData
    ? `${String.fromCharCode(64 + ((tokenData.dept_id % 26) || 1))}${100 + Math.max(0, (tokenData.position || 0) - 1)}`
    : '~'
  const endTokenLabel = tokenData ? tokenData.token_code : '~'

  // Live alerts (static contextual, updated when token tracked)
  const alerts = tokenData ? [
    {
      icon: <IconCheck />,
      iconBg: 'bg-green-100 text-green-600',
      title: `${nowServing} just got called`,
      sub: `${aheadCount} more token${aheadCount !== 1 ? 's' : ''} before yours`,
      time: '1m ago',
    },
    {
      icon: <IconStethoscope />,
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'Doctor assigned to your queue',
      sub: `${tokenData.ai_report?.doctor || 'Dr. Sharma'} — Counter 2`,
      time: '5m ago',
    },
    {
      icon: <IconAlert />,
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Wait time updated',
      sub: `AI predicted: ${waitMins} min`,
      time: '9m ago',
    },
  ] : []

  return (
    <section className="pt-[108px] pb-16 min-h-screen" style={{ background: '#f0f5ff', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-10">
        <div
          className="rounded-2xl overflow-hidden mb-7 flex items-center justify-between gap-8 relative"
          style={{ background: '#0f1e3d', minHeight: 200, padding: '2.75rem 3rem' }}
        >
          {/* decorative rings */}
          <div className="absolute pointer-events-none" style={{ top: -60, right: 200, width: 280, height: 280, borderRadius: '50%', border: '50px solid rgba(255,255,255,0.04)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: -80, right: 60, width: 220, height: 220, borderRadius: '50%', border: '36px solid rgba(255,255,255,0.035)' }} />

          {/* Left */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, letterSpacing: '2.5px', fontWeight: 700, textTransform: 'uppercase', color: '#93c5fd', fontFamily: 'DM Mono, monospace' }}>
              <IconPlay />
              <span>Live Tracking</span>
              <span style={{ color: '#4b6fa8' }}>·</span>
              <span>Queue System</span>
            </div>
            <h1 className="font-extrabold text-white mb-2.5" style={{ fontSize: 34, letterSpacing: '-1.2px', lineHeight: 1.15 }}>
              Queue <span style={{ color: '#93c5fd' }}>Tracker</span>
            </h1>
            <p style={{ fontSize: 14, color: '#bfdbfe', lineHeight: 1.65, maxWidth: 400 }}>
              Track your position in real-time and view your personalized AI Smart Report — know exactly when to arrive.
            </p>
          </div>

          {/* Right — search */}
          <div className="relative z-10 flex flex-col gap-3" style={{ minWidth: 380 }}>
            <div style={{ fontSize: 13, letterSpacing: '1.5px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>
              Enter your token
            </div>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Token ID or Number e.g. A-52"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 outline-none"
                style={{
                  padding: '13px 18px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'white', fontSize: 14.5, fontWeight: 500,
                }}
              />
              <button
                onClick={trackToken}
                className="flex items-center gap-2 font-bold"
                style={{
                  padding: '13px 24px', borderRadius: 12,
                  background: '#2563eb', color: 'white', fontSize: 14,
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
                }}
              >
                <IconSearch />
                Track
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono, monospace' }}>
              {loading ? 'Searching...' : error ? 'Token not found. Try a valid token ID' : tokenData ? `Tracking token ${yourToken} live` : ''}
            </div>
          </div>
        </div>

        {/* ── Token Dashboard ────────────────────────────────────────────────── */}
        <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>

          {/* Left — main token card */}
          <div className="rounded-2xl flex flex-col gap-6 overflow-hidden relative" style={{ background: '#A9D1FD', boxShadow: '0 4px 24px rgba(147,197,253,0.5)', padding: '2rem' }}>
            <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', border: '26px solid rgba(255,255,255,0.2)' }} />
            <div className="absolute pointer-events-none" style={{ bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.15)' }} />

            {/* Hospital header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold" style={{ fontSize: 23, color: '#0f1e3d', letterSpacing: '-0.5px' }}>City Hospital — OPD</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold font-mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.5)', color: '#1d4ed8' }}>
                    {tokenData?.ai_report?.department || 'General Medicine'}
                  </span>
                  <span className="flex items-center gap-1 font-bold" style={{ fontSize: 11, color: '#16a34a' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'blink 1.6s infinite' }} />
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Token boxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl" style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div className="font-bold font-mono mb-1.5" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1d4ed8' }}>Now Serving</div>
                <div className="font-extrabold font-mono leading-none" style={{ fontSize: 38, letterSpacing: '-2px', color: '#0f1e3d' }}>{nowServing}</div>
                <div className="font-mono mt-1" style={{ fontSize: 11, color: '#1e3a5f' }}>Counter 2</div>
              </div>
              <div className="rounded-2xl" style={{ padding: '1.25rem 1.5rem', background: '#3B82F6', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
                <div className="font-bold font-mono mb-1.5" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Your Token</div>
                <div className="font-extrabold font-mono leading-none" style={{ fontSize: 38, letterSpacing: '-2px', color: 'white' }}>{yourToken}</div>
                <div className="font-mono mt-1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                  {aheadCount != null ? `${aheadCount} ahead of you` : '~ ahead of you'}
                </div>
              </div>
            </div>

            {/* ETA block */}
            <div className="rounded-2xl flex items-center justify-between" style={{ background: '#0f1e3d', padding: '1.25rem 1.5rem' }}>
              <div>
                <div className="font-bold font-mono mb-1" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#93c5fd' }}>Estimated wait time</div>
                <div className="font-extrabold font-mono" style={{ fontSize: 30, letterSpacing: '-1.5px', color: 'white' }}>
                  {waitMins != null ? `${waitMins} min` : '~ min'}
                </div>
                <div style={{ fontSize: 12, color: '#bfdbfe', marginTop: 3 }}>
                  {arriveTime ? `Arrive by ${arriveTime} — AI predicted` : 'Enter a token to see ETA'}
                </div>
              </div>
              {isEmergency && (
                <div className="flex items-center gap-2 rounded-lg" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', padding: '8px 14px' }}>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" style={{ animation: 'blink 1s infinite' }} />
                  <span className="font-bold font-mono" style={{ fontSize: 12, color: '#fca5a5' }}>Emergency Priority Active</span>
                </div>
              )}
            </div>

            {/* Queue progress */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-bold" style={{ fontSize: 13, color: '#0f1e3d' }}>Queue Status</span>
                <span className="font-bold font-mono" style={{ fontSize: 13, color: '#1d4ed8' }}>
                  {aheadCount != null ? `${aheadCount} people ahead` : '~ people ahead'}
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 10, background: 'rgba(255,255,255,0.4)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: '#1d4ed8' }} />
              </div>
              <div className="flex justify-between font-mono mt-2" style={{ fontSize: 11.5, color: '#1e3a5f' }}>
                <span>{startTokenLabel}</span>
                <span>{endTokenLabel}</span>
              </div>
            </div>

            {/* AI Smart Report button */}
            <button
              onClick={() => tokenData && navigate(`/ai-report?token=${encodeURIComponent(tokenData.token_code)}&dept_id=${tokenData.dept_id}&age=${tokenData.age || 30}&symptoms=${encodeURIComponent(tokenData.symptoms || '')}`)}
              disabled={!tokenData}
              className="w-full flex items-center justify-between font-bold rounded-2xl transition-all"
              style={{
                padding: '1rem 1.5rem',
                background: tokenData ? 'linear-gradient(135deg, #1652cc 0%, #2563eb 100%)' : '#e2e8f0',
                color: tokenData ? 'white' : '#94a3b8',
                border: 'none', cursor: tokenData ? 'pointer' : 'not-allowed',
                boxShadow: tokenData ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: tokenData ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>
                  <IconBrain />
                </div>
                <div className="text-left">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>View AI Smart Report</div>
                  <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.75 }}>
                    {tokenData ? 'Personalized predictions for your token' : 'Track a token first to unlock'}
                  </div>
                </div>
              </div>
              <IconArrow />
            </button>
          </div>

          {/* Right — side cards */}
          <div className="flex flex-col gap-5" style={{ minHeight: '100%' }}>

            {/* Department Overview */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: '#93C5FD', boxShadow: '0 4px 24px rgba(147,197,253,0.5)' }}>
              <div className="absolute pointer-events-none" style={{ top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: '22px solid rgba(255,255,255,0.2)' }} />
              <div className="absolute pointer-events-none" style={{ bottom: -30, left: -15, width: 100, height: 100, borderRadius: '50%', border: '18px solid rgba(255,255,255,0.15)' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                      Live Data
                    </div>
                    <div className="font-bold" style={{ fontSize: 17, color: '#0f1e3d' }}>Department Overview</div>
                    <div style={{ fontSize: 12, color: '#1e3a5f', marginTop: 2 }}>Live crowd &amp; wait times</div>
                  </div>
                </div>
                {deptOverview.length === 0 ? (
                  <div className="text-center py-6" style={{ fontSize: 13, color: '#1e3a5f' }}>Loading departments...</div>
                ) : (
                  deptOverview.map((dept, i) => (
                    <div key={dept.dept_id} className="flex items-center justify-between" style={{ padding: '13px 1.5rem', borderBottom: i < deptOverview.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
                      <div>
                        <div className="font-bold" style={{ fontSize: 13.5, color: '#0f1e3d' }}>{dept.name}</div>
                        <div className="font-mono" style={{ fontSize: 11, color: '#1e3a5f' }}>{dept.waiting || 0} waiting · {dept.served || 0} served</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`font-bold font-mono ${waitColor(dept.wait_time)}`} style={{ fontSize: 13 }}>{dept.wait_time} min</div>
                        <CrowdBadge level={dept.crowd_level} label={dept.crowd} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Alerts */}
            <div className="rounded-2xl overflow-hidden flex flex-col flex-1 relative" style={{ background: '#93C5FD', boxShadow: '0 4px 24px rgba(147,197,253,0.5)' }}>
              <div className="absolute pointer-events-none" style={{ top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: '22px solid rgba(255,255,255,0.2)' }} />
              <div className="absolute pointer-events-none" style={{ bottom: -30, left: -15, width: 100, height: 100, borderRadius: '50%', border: '18px solid rgba(255,255,255,0.15)' }} />
              <div className="relative z-10 flex flex-col flex-1">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                  <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                    Live Updates
                  </div>
                  <div className="font-bold" style={{ fontSize: 17, color: '#0f1e3d' }}>Live Alerts</div>
                  <div style={{ fontSize: 12, color: '#1e3a5f', marginTop: 2 }}>Queue notifications</div>
                </div>
                {alerts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center py-6" style={{ fontSize: 13, color: '#1e3a5f' }}>Track a token to see live alerts</div>
                ) : (
                  alerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '12px 1.5rem', borderBottom: i < alerts.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.iconBg}`} style={{ minWidth: 32, background: 'rgba(255,255,255,0.4)' }}>
                        {alert.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold" style={{ fontSize: 13, color: '#0f1e3d' }}>{alert.title}</div>
                        <div style={{ fontSize: 11.5, color: '#1e3a5f' }}>{alert.sub}</div>
                      </div>
                      <div className="font-mono flex-shrink-0" style={{ fontSize: 11, color: '#1d4ed8' }}>{alert.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-5 mb-7">
          {[
            { label: 'Active Tokens',  val: stats ? stats.total_waiting  : '~', tag: 'hospital-wide today' },
            { label: 'Avg. Wait',      val: stats ? `${Math.round((deptOverview.reduce((s, d) => s + (d.wait_time || 0), 0) / Math.max(deptOverview.length, 1)))}m` : '~', tag: 'across all depts' },
            { label: 'Served Today',   val: stats ? stats.total_served   : '~', tag: 'patients completed' },
            { label: 'Doctors Active', val: stats ? stats.active_doctors : '~', tag: 'on duty right now' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl transition-transform hover:-translate-y-0.5" style={{ border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(37,99,235,0.08),0 4px 16px rgba(37,99,235,0.07)', padding: '1.25rem 1.5rem' }}>
              <div className="font-bold font-mono mb-1" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#94a3b8' }}>{card.label}</div>
              <div className="font-extrabold font-mono" style={{ fontSize: 26, letterSpacing: '-1.5px', color: '#0f172a', lineHeight: 1.2 }}>{card.val}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{card.tag}</div>
            </div>
          ))}
        </div>

        {/* ── How it works ───────────────────────────────────────────────────── */}
        <div style={{ fontSize: 13, letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', fontFamily: 'DM Mono, monospace', marginBottom: '1rem' }}>
          How queue tracking works
        </div>
        <div className="grid grid-cols-3 gap-5 mb-7">
          {[
            {
              n: '1',
              title: 'Book or walk in',
              desc: 'Get a token number when you book online via MediFlow AI or arrive at the hospital reception counter.',
            },
            {
              n: '2',
              title: 'Track in real-time',
              desc: 'Enter your token ID above. Our AI monitors queue movement live and predicts your exact wait time dynamically.',
            },
            {
              n: '3',
              title: 'Arrive right on time',
              desc: 'Get notified when you are 2 tokens away. No more waiting in the physical queue — arrive just in time for your turn.',
            },
          ].map(card => (
            <div key={card.n} className="bg-white rounded-2xl" style={{ border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(37,99,235,0.08),0 4px 16px rgba(37,99,235,0.07)', padding: '1.5rem 1.75rem' }}>
              <div className="flex items-center justify-center font-extrabold font-mono mb-4 rounded-xl" style={{ width: 36, height: 36, background: '#2563eb', color: 'white', fontSize: 16 }}>{card.n}</div>
              <div className="font-bold mb-1.5" style={{ fontSize: 15, color: '#0f172a' }}>{card.title}</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* blink keyframe */}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </section>
  )
}
