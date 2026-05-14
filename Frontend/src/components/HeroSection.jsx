function HeroSection({ onGetStarted, onLogin }) {
  return (
    <section id="home" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-[#1E3A8A] sm:text-5xl lg:text-6xl">
            Secure Online <span className="text-[#0f7669]">Examination</span> Management System
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
            A web-based platform designed for conducting secure MCQ examinations with automatic evaluation and role-based access for students, teachers, and administrators.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-xl border border-[#0b5e53] bg-[#0f7669] px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#115e59]"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Login
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-[#1e3a8a]/40 bg-gradient-to-b from-[#092048] to-[#071937] p-8 shadow-[0_20px_45px_-18px_rgba(15,23,42,0.55)]">
            <div className="flex h-[360px] items-center justify-center rounded-xl border border-[#14b8a6]/30 bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.25),_transparent_60%)]">
              <div className="relative h-52 w-52 rounded-full border border-[#14B8A6]/40 bg-[#0b2f64]/80">
                <svg
                  viewBox="0 0 160 160"
                  className="absolute inset-0 m-auto h-40 w-40"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="shieldGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M80 18l48 18v36c0 30-18 56-48 70-30-14-48-40-48-70V36l48-18z"
                    fill="url(#shieldGradient)"
                    stroke="#99f6e4"
                    strokeWidth="3"
                  />
                  <rect x="59" y="65" width="42" height="26" rx="4" fill="#0f172a" opacity="0.75" />
                  <path d="M80 48l14 10H66l14-10z" fill="#0f172a" opacity="0.9" />
                </svg>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-slate-500/40 bg-slate-100 px-4 py-3 shadow-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-[#14B8A6]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Time Remaining
                </p>
                <p className="text-sm font-bold text-[#1E3A8A]">00:00:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
