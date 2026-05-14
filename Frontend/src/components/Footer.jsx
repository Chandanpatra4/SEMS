function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-base font-semibold text-slate-900">SEMS</p>
          <p className="mt-1">Secure Online Examination Management System</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/#about" className="transition hover:text-[#1E3A8A]">
            Institutional Privacy
          </a>
          <a href="/#features" className="transition hover:text-[#1E3A8A]">
            Accessibility
          </a>
          <a href="/#contact" className="transition hover:text-[#1E3A8A]">
            Academic Integrity
          </a>
          <a href="/#home" className="transition hover:text-[#1E3A8A]">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
