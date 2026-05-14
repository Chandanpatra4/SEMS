function StudentFooter() {
  return (
    <footer className="mx-auto mt-14 flex max-w-[1600px] items-end justify-between gap-10 px-10 pb-12">
      <div>
        <p className="text-[1.15rem] font-semibold text-[#0B278A]">SEMS Academic Monolith</p>
        <p className="mt-4 text-[0.92rem] text-slate-600">© 2026 SEMS Academic Monolith. All rights reserved.</p>
      </div>

      <div className="flex flex-wrap items-center gap-10 text-[0.98rem] text-slate-700">
        <a href="#" className="transition hover:text-[#0B278A]">
          Privacy Policy
        </a>
        <a href="#" className="transition hover:text-[#0B278A]">
          Terms of Service
        </a>
        <a href="#" className="transition hover:text-[#0B278A]">
          Support
        </a>
        <a href="#" className="transition hover:text-[#0B278A]">
          Institutional Guidelines
        </a>
      </div>
    </footer>
  )
}

export default StudentFooter
