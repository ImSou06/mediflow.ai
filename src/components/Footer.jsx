const footerLinks = {
  Platform: ['For Hospitals', 'For Patients'],
  Company: ['About Us', 'Contact Us'],
  Legal: ['Privacy Policy', 'Terms of Service'],
}

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto py-10 px-8">
        {/* Top grid — brand takes 2 cols, link columns pushed right */}
        <div className="grid grid-cols-5 gap-8 mb-8">
          {/* Brand — spans 2 cols so link columns sit further right */}
          <div className="col-span-2">
            <span className="font-bold text-slate-900 text-base block mb-3">MediFlow AI</span>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Building the future of patient experience with clinical precision and smart automation.
            </p>
          </div>

          {/* Link columns — each 1 col, naturally pushed to the right half */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h5 className="text-xs font-semibold text-slate-900 mb-4 tracking-wide uppercase">{heading}</h5>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-slate-200 gap-4">
          <span className="text-xs font-medium text-slate-400">
            © 2026 MediFlow AI. All copyrights reserved.
          </span>
          <div className="flex items-center gap-3">
            {[
              { icon: <IconTwitter />, label: 'Twitter' },
              { icon: <IconLinkedIn />, label: 'LinkedIn' },
              { icon: <IconMail />, label: 'Email' },
            ].map(({ icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex items-center justify-center rounded-lg transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                style={{ width: 28, height: 28 }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
