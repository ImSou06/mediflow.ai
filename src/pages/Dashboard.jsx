
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconStethoscope = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
  </svg>
)
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconAlertFill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconDot = ({ color }) => (
  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
)

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONO = { fontFamily: 'DM Mono, monospace' }
const LABEL_STYLE = { fontSize: 13, letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', ...MONO }
const HERO_LABEL_STYLE = { fontSize: 13, letterSpacing: '2.5px', fontWeight: 700, textTransform: 'uppercase', color: '#93c5fd', ...MONO }

function crowdConfig(color) {
  if (color === 'red')    return { label: 'High',     bg: '#fee2e2', fg: '#dc2626', dot: '#dc2626', border: '#fecaca', bar: '#dc2626' }
  if (color === 'yellow') return { label: 'Moderate', bg: '#fef3c7', fg: '#d97706', dot: '#d97706', border: '#fde68a', bar: '#d97706' }
  return                         { label: 'Low',      bg: '#dcfce7', fg: '#16a34a', dot: '#16a34a', border: '#bbf7d0', bar: '#16a34a' }
}

function waitStyle(mins) {
  if (mins >= 60) return '#dc2626'
  if (mins >= 30) return '#d97706'
  return '#16a34a'
}

function initials(name = '') {
  return name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Sub-components ────────────────────────────────────────────────────────────
function HeroStatRow({ iconBg, icon, label, value, sub }) {
  return (
    <div className="flex items-center justify-between rounded-xl" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 500 }}>{label}</div>
          <div className="font-extrabold" style={{ fontSize: 22, color: 'white', letterSpacing: '-1px', lineHeight: 1, ...MONO }}>{value}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#93c5fd', ...MONO }}>{sub}</div>
    </div>
  )
}

function AlertRow({ iconBg, iconColor, icon, title, sub, time }) {
  return (
    <div className="flex items-start gap-3" style={{ padding: '13px 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.4)', color: iconColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold" style={{ fontSize: 13, color: '#0f1e3d' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: '#1e3a5f' }}>{sub}</div>
      </div>
      <div className="flex-shrink-0" style={{ fontSize: 11, color: '#1d4ed8', paddingTop: 2, ...MONO }}>{time}</div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [doctors, setDoctors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [hospitalId, setHospitalId] = useState(1)

  const hospitalOptions = [
    { id: 1, name: 'City Hospital' },
    { id: 2, name: 'District Hospital' },
    { id: 3, name: 'Apollo Lifeline' },
  ]
  const selectedName = hospitalOptions.find(h => h.id === hospitalId)?.name || 'City Hospital'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/dashboard/stats?hospital_id=${hospitalId}`).then(r => r.json()),
      fetch(`/api/doctors?hospital_id=${hospitalId}`).then(r => r.json()),
    ]).then(([statsData, doctorsData]) => {
      setStats(statsData)
      setDoctors(Array.isArray(doctorsData) ? doctorsData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hospitalId])

  // Derived stats
  const avgWait = stats?.departments?.length
    ? Math.round(stats.departments.reduce((s, d) => s + (d.est_wait || 0), 0) / stats.departments.length)
    : 0

  // Live alerts derived from dept data
  const alerts = stats?.departments ? (() => {
    const out = []
    const crowded = stats.departments.filter(d => d.crowd_color === 'red')
    if (crowded.length) out.push({
      iconBg: '#fee2e2', iconColor: '#dc2626', icon: <IconAlertFill />,
      title: `${crowded[0].name} at high capacity`,
      sub: `${crowded[0].waiting} patients waiting — ${crowded[0].est_wait} min wait`,
      time: '2m ago',
    })
    const spiked = stats.departments.find(d => d.crowd_color === 'yellow')
    if (spiked) out.push({
      iconBg: '#fef3c7', iconColor: '#d97706', icon: <IconAlert />,
      title: `${spiked.name} wait time elevated`,
      sub: `Currently ${spiked.est_wait} min — ${spiked.waiting} in queue`,
      time: '9m ago',
    })
    out.push({
      iconBg: '#dbeafe', iconColor: '#2563eb', icon: <IconStethoscope />,
      title: `${stats.active_doctors} doctors clocked in`,
      sub: 'Full coverage across active departments',
      time: '24m ago',
    })
    return out.slice(0, 3)
  })() : []

  return (
    <section className="pt-[108px] pb-16 min-h-screen" style={{ background: '#f0f5ff', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
      <div className="max-w-[1360px] mx-auto px-10">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-6 flex items-center justify-between gap-8 relative" style={{ background: '#0f1e3d', minHeight: 180, padding: '2.5rem 3rem' }}>
          {/* decorative circles — identical to AI Smart Report */}
          <div className="absolute pointer-events-none" style={{ top: -60, right: 200, width: 280, height: 280, borderRadius: '50%', border: '50px solid rgba(255,255,255,0.04)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: -80, right: 60, width: 220, height: 220, borderRadius: '50%', border: '36px solid rgba(255,255,255,0.035)' }} />

          {/* Left content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3" style={HERO_LABEL_STYLE}>
              <IconPlay />
              <span>Live Monitor</span>
              <span style={{ color: '#4b6fa8' }}>·</span>
              <span>{selectedName}</span>
            </div>
            <h1 className="font-extrabold text-white mb-2" style={{ fontSize: 34, letterSpacing: '-1.2px', lineHeight: 1.15 }}>
              Hospital <span style={{ color: '#93c5fd' }}>Dashboard</span>
            </h1>
            <p style={{ fontSize: 14, color: '#bfdbfe', lineHeight: 1.65, maxWidth: 420 }}>
              Real-time queue analytics, department capacity, and live doctor availability — all in one place.
            </p>
          </div>

          {/* Right — hospital selector styled like AI Smart Report TOKEN card + button */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '1rem 2rem', minWidth: 160 }}>
              <div className="font-bold font-mono mb-1" style={{ fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Selected Hospital</div>
              <div className="font-extrabold" style={{ fontSize: 18, letterSpacing: '-0.5px', color: 'white', lineHeight: 1.2 }}>{selectedName}</div>
            </div>
            <div className="relative">
              <select
                value={hospitalId}
                onChange={e => setHospitalId(Number(e.target.value))}
                className="font-bold cursor-pointer outline-none"
                style={{
                  padding: '11px 40px 11px 20px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  appearance: 'none', WebkitAppearance: 'none',
                }}
                aria-label="Switch hospital"
              >
                {hospitalOptions.map(h => <option key={h.id} value={h.id} style={{ background: '#0f1e3d', color: 'white' }}>{h.name}</option>)}
              </select>
              {/* chevron icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, pointerEvents: 'none', opacity: 0.6 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Stats bar removed ────────────────────────────────────────────── */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p style={{ fontSize: 13, color: '#94a3b8', ...MONO }}>Loading dashboard...</p>
          </div>
        ) : !stats ? (
          <div className="bg-white rounded-2xl flex flex-col items-center gap-3 py-20" style={{ border: '1px solid #bfdbfe' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#fee2e2', color: '#dc2626' }}><IconAlert /></div>
            <p className="font-bold" style={{ fontSize: 15, color: '#0f172a' }}>Could not connect to the server</p>
            <p style={{ fontSize: 13, color: '#475569' }}>Make sure the backend is running on port 5000.</p>
          </div>
        ) : (
          <>
            {/* ── Dept table + side col ──────────────────────────────────── */}
            <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)' }}>

              {/* Department table card */}
              <div className="rounded-2xl overflow-hidden relative" style={{ background: '#A9D1FD', boxShadow: '0 4px 24px rgba(147,197,253,0.5)' }}>
                <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', border: '28px solid rgba(255,255,255,0.2)' }} />
                <div className="absolute pointer-events-none" style={{ bottom: -40, left: -20, width: 130, height: 130, borderRadius: '50%', border: '22px solid rgba(255,255,255,0.15)' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', ...MONO }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                        Live Data
                      </div>
                      <div className="font-bold" style={{ fontSize: 17, color: '#0f1e3d' }}>Department Status</div>
                      <div style={{ fontSize: 12, color: '#1e3a5f', marginTop: 2 }}>Live queue and capacity data per wing</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.2)' }}>
                          {['Department', 'Waiting', 'Served', 'Load', 'Est. Wait', 'Peak', 'Crowd'].map(h => (
                            <th key={h} style={{ padding: '10px 1.25rem', textAlign: h === 'Department' ? 'left' : 'center', fontSize: 11, letterSpacing: '1.5px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', ...MONO, borderBottom: '1px solid rgba(255,255,255,0.3)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.departments.map(dept => {
                          const cc = crowdConfig(dept.crowd_color)
                          const loadPct = Math.min(100, Math.round((dept.waiting / Math.max(dept.waiting + dept.completed, 1)) * 100))
                          return (
                            <tr key={dept.dept_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.25)', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '14px 1.25rem' }}>
                                <span className="font-bold" style={{ fontSize: 12.5, color: '#0f1e3d' }}>{dept.name}</span>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center' }}>
                                <span className="font-bold" style={{ fontSize: 13.5, color: '#0f1e3d', ...MONO }}>{dept.waiting}</span>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center' }}>
                                <span className="font-bold" style={{ fontSize: 13.5, color: '#0f1e3d', ...MONO }}>{dept.completed}</span>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center', minWidth: 100 }}>
                                <div className="flex items-center gap-2">
                                  <div style={{ flex: 1, height: 5, borderRadius: 10, background: 'rgba(255,255,255,0.4)', overflow: 'hidden', minWidth: 50 }}>
                                    <div style={{ height: '100%', borderRadius: 10, background: cc.bar, width: `${loadPct}%` }} />
                                  </div>
                                  <span style={{ fontSize: 11, color: '#1d4ed8', ...MONO }}>{loadPct}%</span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center' }}>
                                <span className="font-bold" style={{ fontSize: 13.5, color: waitStyle(dept.est_wait), ...MONO }}>{dept.est_wait} min</span>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center' }}>
                                <span style={{ fontSize: 12, color: '#1e3a5f', ...MONO }}>{dept.peak_hour}</span>
                              </td>
                              <td style={{ padding: '14px 1.25rem', textAlign: 'center' }}>
                                <span className="inline-flex items-center gap-1.5 font-bold" style={{ fontSize: 11.5, padding: '4px 11px', borderRadius: 20, background: cc.bg, color: cc.fg, border: `1px solid ${cc.border}`, ...MONO }}>
                                  <IconDot color={cc.dot} />
                                  {cc.label}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Side column */}
              <div className="flex flex-col gap-5">

                {/* Quick Book card */}
                <div className="rounded-2xl overflow-hidden relative" style={{ background: '#93C5FD', padding: '2rem 1.75rem', boxShadow: '0 4px 24px rgba(147,197,253,0.5)' }}>
                  <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', border: '24px solid rgba(255,255,255,0.2)' }} />
                  <div className="absolute pointer-events-none" style={{ bottom: -40, left: -20, width: 110, height: 110, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.15)' }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2.5" style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', ...MONO }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                      Skip the queue
                    </div>
                    <div className="font-extrabold mb-2" style={{ fontSize: 24, letterSpacing: '-0.5px', color: '#0f1e3d' }}>Book Your<br />Token Online</div>
                    <div style={{ fontSize: 12.5, color: '#1e3a5f', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      Reserve your spot digitally and arrive right on time — no waiting in line.
                    </div>
                    <div className="flex flex-col gap-2 mb-5">
                      {['Choose department', 'Pick a time slot', 'Get your token & ETA'].map((step, i) => (
                        <div key={i} className="flex items-center gap-2.5" style={{ fontSize: 12.5, color: '#1e3a5f' }}>
                          <div className="flex items-center justify-center font-extrabold flex-shrink-0" style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', fontSize: 11, color: '#1d4ed8', ...MONO }}>{i + 1}</div>
                          {step}
                        </div>
                      ))}
                    </div>
                    <Link to="/bookings" className="flex items-center justify-center gap-2 font-extrabold w-full" style={{ padding: 12, borderRadius: 10, background: '#1d4ed8', color: 'white', fontSize: 13.5, textDecoration: 'none', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}>
                      <IconCalendar />Book a Token Now
                    </Link>
                  </div>
                </div>

                {/* Live Alerts card */}
                <div className="rounded-2xl overflow-hidden relative" style={{ background: '#93C5FD', boxShadow: '0 4px 24px rgba(147,197,253,0.5)' }}>
                  <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', border: '24px solid rgba(255,255,255,0.2)' }} />
                  <div className="absolute pointer-events-none" style={{ bottom: -20, left: -20, width: 110, height: 110, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.15)' }} />
                  <div className="relative z-10">
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                      <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', ...MONO }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                        Live Updates
                      </div>
                      <div className="font-bold" style={{ fontSize: 17, color: '#0f1e3d' }}>Live Alerts</div>
                      <div style={{ fontSize: 12, color: '#1e3a5f', marginTop: 2 }}>Queue &amp; system notifications</div>
                    </div>
                    {alerts.map((a, i) => (
                      <div key={i} style={{ borderBottom: i < alerts.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
                        <AlertRow {...a} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bottom stats row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-5 mb-5">
              {[
                { label: 'Bookings Today',    val: stats.total_waiting + stats.total_served, tag: 'across all depts' },
                { label: 'Avg. Wait Time',    val: `${avgWait}m`,                            tag: 'hospital-wide' },
                { label: 'Served Today',      val: stats.total_served,                       tag: 'patients completed' },
                { label: 'Doctors Active',    val: stats.active_doctors,                     tag: 'on duty right now' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl transition-transform hover:-translate-y-0.5" style={{ border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(37,99,235,0.08),0 4px 16px rgba(37,99,235,0.07)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ ...LABEL_STYLE, marginBottom: 4 }}>{card.label}</div>
                  <div className="font-extrabold" style={{ fontSize: 26, letterSpacing: '-1.5px', color: '#0f172a', lineHeight: 1.2, ...MONO }}>{card.val}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{card.tag}</div>
                </div>
              ))}
            </div>

            {/* ── How it works ─────────────────────────────────────────────── */}
            <div style={{ fontSize: 13, letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', fontFamily: 'DM Mono, monospace', marginBottom: '1rem' }}>
              How the dashboard works
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                {
                  n: '1',
                  title: 'Live department tracking',
                  desc: 'Monitor every department in real-time — waiting count, served patients, load percentage, and estimated wait time update automatically.',
                },
                {
                  n: '2',
                  title: 'AI-powered alerts',
                  desc: 'The system automatically flags high-capacity departments and elevated wait times so staff can act before queues become critical.',
                },
                {
                  n: '3',
                  title: 'Switch hospitals instantly',
                  desc: 'Use the hospital selector to jump between facilities and compare queue loads, doctor availability, and department status across the network.',
                },
              ].map(card => (
                <div key={card.n} className="bg-white rounded-2xl" style={{ border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(37,99,235,0.08),0 4px 16px rgba(37,99,235,0.07)', padding: '1.5rem 1.75rem' }}>
                  <div className="flex items-center justify-center font-extrabold font-mono mb-4 rounded-xl" style={{ width: 36, height: 36, background: '#2563eb', color: 'white', fontSize: 16 }}>{card.n}</div>
                  <div className="font-bold mb-1.5" style={{ fontSize: 15, color: '#0f172a' }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </section>
  )
}
