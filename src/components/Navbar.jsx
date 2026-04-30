import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Queue', to: '/queue' },
  { label: 'Bookings', to: '/bookings' },
  { label: 'Emergency', to: '/emergency' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] z-50 bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl h-[68px] shadow-xl shadow-slate-700/10 overflow-hidden">
      <nav className="flex justify-between items-center px-6 h-full">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 rounded-lg bg-white px-2 flex items-center justify-center shadow-sm border border-blue-50">
            <img src="/logo.jpg" alt="MediFlow AI" className="h-6 object-contain" />
          </div>
          <span className="text-3xl font-bold text-blue-700 tracking-tight">
            MediFlow <span className="text-slate-700">AI</span>
          </span>
        </Link>

        {/* Nav + Actions */}
        <div className="flex items-center gap-6">
          {/* Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-all hover:text-blue-700 relative py-1 ${
                  pathname === to ? 'text-blue-700' : 'text-slate-800'
                }`}
              >
                {label}
                {pathname === to && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              to="/bookings"
              className="bg-blue-700 text-white pl-5 pr-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-700/20"
            >
              Book Token
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
