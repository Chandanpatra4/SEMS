function Navbar() {
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const displayName = formatDisplayName(user?.email) || 'Admin User'

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1E3A8A]">SEMS Admin</h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden max-w-xl flex-1 items-center rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 lg:flex">
            <i className="ri-search-line text-lg text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search resources, students, or logs..."
              className="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-100"
          >
            <i className="ri-notification-3-line text-lg" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-100"
          >
            <i className="ri-settings-3-line text-lg" aria-hidden="true" />
          </button>

          <div className="hidden h-10 w-px bg-slate-200 lg:block" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-semibold text-[#1E3A8A]">{displayName}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">Super Admin</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#D8E0F8] bg-[#0F172A] text-sm font-semibold text-white">
              {displayName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function formatDisplayName(email = '') {
  const localPart = email.split('@')[0]

  if (!localPart) {
    return 'Admin User'
  }

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default Navbar
