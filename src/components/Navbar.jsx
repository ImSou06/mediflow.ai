import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Queue', to: '/queue' },
  { label: 'Bookings', to: '/bookings' },
  { label: 'Emergency', to: '/emergency' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] z-50 bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl h-[68px] shadow-xl shadow-slate-700/10 overflow-visible">
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

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-6">
            <Link
              to="/bookings"
              className="bg-blue-700 text-white pl-5 pr-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-700/20"
            >
              Book Token
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </Link>

            {/* Hamburger menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Open menu"
                className="w-8 h-8 flex justify-center items-center rounded-md bg-white border border-blue-50 hover:bg-blue-50 transition-all shadow-sm shrink-0"
              >
                {menuOpen ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="1" y1="1" x2="13" y2="13" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="13" y1="1" x2="1" y2="13" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="1" x2="14" y2="1" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="5" x2="14" y2="5" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="9" x2="14" y2="9" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-2xl shadow-slate-700/15 py-2 overflow-hidden">
                  {navLinks.map(({ label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all hover:bg-blue-50 hover:text-blue-700 ${
                        pathname === to ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      {pathname === to && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                      {label}
                    </Link>
                  ))}
                  <div className="mx-3 my-2 border-t border-slate-100" />
                  <Link
                    to="/bookings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    Book Token
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
