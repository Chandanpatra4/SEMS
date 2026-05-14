import { useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../services/authService'

const menuItems = [
  { label: 'Dashboard', to: '/teacher/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Question Bank', to: '/teacher/questions', icon: 'ri-questionnaire-line' },
  { label: 'Create Exam', to: '/teacher/exams/create', icon: 'ri-file-add-line' },
  { label: 'Manage Exams', to: '/teacher/exams/manage', icon: 'ri-task-line' },
  { label: 'Reports', to: '/teacher/reports', icon: 'ri-pie-chart-box-line' },
]

function TeacherSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getStoredUser()
  const displayName = user?.name?.trim() || formatDisplayName(user?.email)
  const departmentLabel = user?.department?.trim() || 'General'

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden w-70 flex-col border-r border-slate-200 bg-[#F1F5F9] lg:flex">
      <div className="border-b border-slate-200 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f2f82] text-white">
            <i className="ri-graduation-cap-line text-2xl" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1E3A8A]">Faculty Portal</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{departmentLabel} Department</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{displayName || 'Teacher'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === '/teacher/questions' && location.pathname.startsWith('/teacher/questions')) ||
            (item.to === '/teacher/exams/create' && location.pathname.startsWith('/teacher/exams/create')) ||
            (item.to === '/teacher/exams/manage' && location.pathname.startsWith('/teacher/exams/manage')) ||
            (item.to === '/teacher/reports' && location.pathname.startsWith('/teacher/reports'))

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:bg-white/80 hover:text-[#1E3A8A]'
              }`}
            >
              <i className={`${item.icon} text-lg`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-6 pb-8">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm font-semibold text-red-600 transition hover:text-red-700"
        >
          <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
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

export default TeacherSidebar
