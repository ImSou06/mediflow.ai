const metrics = [
  {
    icon: 'group',
    value: '1200+',
    description: 'Patients helped across regional clinics this month.',
  },
  {
    icon: 'add_box',
    value: '18',
    description: 'Public hospitals currently integrated into the MediFlow network.',
  },
  {
    icon: 'timer_off',
    value: '45%',
    description: 'Average reduction in physical queue waiting times.',
  },
]

export default function Metrics() {
  return (
    <section className="py-14 lg:py-20 bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map(({ icon, value, description }) => (
            <div
              key={value}
              className="p-8 bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-start text-left transition-all duration-300 hover:shadow-md"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">{icon}</span>
              </div>
              <span className="text-[40px] font-bold text-slate-900 mb-2 tracking-tight">{value}</span>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
