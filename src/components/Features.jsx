const features = [
  {
    icon: 'confirmation_number',
    title: 'Smart Booking',
    description:
      'Intelligent scheduling that balances emergency loads with routine appointments automatically.',
  },
  {
    icon: 'map',
    title: 'Real-time Tracker',
    description:
      'GPS-linked arrivals and live queue dashboards for both hospital staff and visiting patients.',
  },
  {
    icon: 'emergency',
    title: 'Priority Handling',
    description:
      'Dynamic triaging that ensures critical cases bypass regular flow without disrupting the overall queue.',
  },
  {
    icon: 'monitoring',
    title: 'Hospital Analytics',
    description:
      'Deep insights into bottleneck regions and peak-hour performance metrics for administrators.',
  },
  {
    icon: 'account_balance',
    title: 'Civic Ready',
    description:
      'Enterprise-grade API integrations for government health platforms and insurance providers.',
  },
  {
    icon: 'psychology',
    title: 'AI Predictions',
    description:
      'Machine learning models that predict surges days in advance, allowing for optimized staffing.',
  },
]

export default function Features() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-[1440px] mx-auto px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="text-blue-600 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Capabilities</span>
          <h2 className="text-[48px] lg:text-[56px] font-black text-slate-900 mb-6 leading-[1.1] tracking-tighter">
            Precision Flow Management
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Engineered for hospitals that value patient experience and clinical efficiency above all else.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="group p-10 glass-card rounded-[32px] hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 border-white/80"
            >
              <div className="w-14 h-14 bg-white shadow-lg text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
