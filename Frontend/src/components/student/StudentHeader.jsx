import { useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../services/authService'

const navItems = [
  { label: 'Dashboard', to: '/student/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Exams', to: '/student/exams', icon: 'ri-file-list-3-line' },
  { label: 'Results', to: '/student/results', icon: 'ri-award-line' },
]

const formatDisplayName = (email = '') => {
  const localPart = email.split('@')[0]

  if (!localPart) {
    return 'Student User'
  }

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function StudentHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  const displayName = user?.name || formatDisplayName(user?.email)
  const studentId = user?.enrollmentId || 'N/A'

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-400 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 lg:py-5">
        <div className="flex min-w-0 items-center gap-5 lg:gap-14">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="text-[1.6rem] font-bold tracking-tight text-[#0B278A] sm:text-[1.9rem] lg:text-[2.05rem]"
          >
            SEMS
          </button>

          <nav className="hidden items-center gap-5 lg:flex lg:gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-2 border-b-[3px] pb-3 text-sm font-medium transition lg:text-[1rem] ${
                  location.pathname === item.to
                    ? 'border-[#65E4D5] text-[#152248]'
                    : 'border-transparent text-slate-700 hover:text-[#152248]'
                }`}
              >
                <i className={`${item.icon} text-base`} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#102B82] lg:text-[1.05rem]">{displayName}</p>
            <p className="text-sm text-slate-500">Student ID: {studentId}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#CBD4FF] bg-[#6D7BD7] text-base font-semibold text-white lg:h-13 lg:w-13 lg:text-lg">
            {displayName.charAt(0) || 'S'}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-[#0B278A] lg:text-lg"
          >
            <i className="ri-logout-box-r-line text-base" aria-hidden="true" />
            Logout
          </button>
        </div>

        <nav className="flex w-full items-center gap-3 overflow-x-auto border-t border-slate-100 pt-3 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                location.pathname === item.to
                  ? 'bg-[#EEF2FF] text-[#152248]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className={`${item.icon} text-sm`} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default StudentHeader
