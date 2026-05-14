import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../services/authService'

function TeacherHeader() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const displayName = user?.name?.trim() || formatDisplayName(user?.email)
  const roleLabel = user?.role ? capitalize(user.role) : 'Teacher'
  const departmentLabel = user?.department?.trim()
    ? `${user.department.trim()} Department`
    : 'Faculty Member'

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-col gap-4 px-5 py-4 sm:px-7 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E3A8A]">Academic Monolith</h1>
            <span className="hidden text-sm text-slate-400 md:inline">|</span>
            <p className="hidden text-sm font-medium text-slate-500 md:block">{roleLabel} Dashboard</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
              <i className="ri-notification-3-line text-lg" aria-hidden="true" />
            </button>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#1E3A8A]">{displayName || 'Teacher'}</p>
              <p className="text-xs text-slate-500">{departmentLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#FDEDED] px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-[#fbd7d7]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="relative max-w-md">
          <i
            className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search questions or exams..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6]"
          />
        </div>
      </div>
    </header>
  )
}

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function formatDisplayName(email = '') {
  const localPart = email.split('@')[0]

  if (!localPart) {
    return ''
  }

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function capitalize(value = '') {
  if (!value) {
    return ''
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default TeacherHeader
