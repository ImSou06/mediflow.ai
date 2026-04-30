export default function CTABanner() {
  return (
    <section className="py-24 px-8 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto bg-slate-900 rounded-[48px] p-12 md:p-20 relative overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          <span className="text-blue-400 font-black text-sm uppercase tracking-[0.3em] mb-6">Get Started Today</span>
          <h2 className="text-[48px] lg:text-[64px] font-black text-white mb-8 leading-[1.1] tracking-tighter">
            Ready to Optimize Your <br />
            <span className="text-blue-400">Hospital Flow?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl font-medium">
            Join over 120 leading medical institutions using MediFlow AI to deliver precision
            healthcare experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="px-12 py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
              Partner With Us
            </button>
            <button className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/20 transition-all active:scale-95">
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
