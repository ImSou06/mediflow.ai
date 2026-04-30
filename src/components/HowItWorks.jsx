const steps = [
  {
    number: 1,
    title: 'Hospital Integration',
    description: 'Connect your HMS with MediFlow via secure HIPAA-compliant API.',
  },
  {
    number: 2,
    title: 'Smart Tokening',
    description: 'Patients book tokens via app or kiosk, receiving AI-estimated ETAs.',
  },
  {
    number: 3,
    title: 'Dynamic Routing',
    description: 'AI manages the floor flow, updating wait times in real-time.',
  },
  {
    number: 4,
    title: 'Clinical Success',
    description: 'Reduced crowd density and improved patient satisfaction score.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-blue-600 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Process</span>
          <h2 className="text-[48px] lg:text-[56px] font-black mb-6 leading-[1.1] tracking-tighter text-slate-900">
            How It Works
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Seamless integration into your daily medical routine.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="absolute left-[12.5%] w-[75%] h-[2px] bg-gradient-to-r from-blue-100 via-blue-400 to-blue-100 hidden md:block top-10" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="flex flex-col items-center group">
                <div className="rounded-[24px] bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center text-3xl font-black mb-8 shadow-2xl shadow-blue-900/10 relative z-10 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 w-20 h-20 group-hover:rotate-[360deg]">
                  {number}
                </div>
                <div className="text-center px-4">
                  <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
