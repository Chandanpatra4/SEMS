import { useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../services/authService'

const menuItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Students', to: '/admin/students/new', icon: 'ri-group-line' },
  { label: 'Faculty', to: '/admin/teachers/new', icon: 'ri-user-star-line' },
  { label: 'Exam Monitoring', to: '/admin/exam-monitoring', icon: 'ri-radar-line' },
  { label: 'Reports', to: '/admin/reports', icon: 'ri-bar-chart-box-line' },
  { label: 'Activity Logs', to: '/admin/activity-logs', icon: 'ri-file-list-3-line' },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-[#F5F8FC] lg:w-[320px] lg:border-b-0 lg:border-r">
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B278A] text-white">
            <i className="ri-shield-star-line text-3xl" aria-hidden="true" />
          </div>

          <div>
            <p className="text-[1.05rem] font-bold leading-tight text-[#0B278A]">SEMS AUTHORITY</p>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">Academic Monolith</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 lg:py-6">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition sm:px-6 lg:gap-4 lg:px-10 lg:py-5 lg:text-[1rem] ${
              location.pathname === item.to ||
              (item.to === '/admin/teachers/new' && location.pathname.startsWith('/admin/teachers')) ||
              (item.to === '/admin/students/new' && location.pathname.startsWith('/admin/students'))
                ? 'border-r-4 border-[#14B8A6] bg-white text-[#0B278A]'
                : 'text-slate-500 hover:bg-white/80 hover:text-[#0B278A]'
            }`}
          >
            <i className={`${item.icon} text-lg`} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-5 sm:px-6 lg:px-8 lg:pb-8">
        <button
          type="button"
          className="mb-4 flex items-center gap-3 text-sm font-medium text-slate-500 transition hover:text-[#0B278A] lg:text-[1rem]"
        >
          <i className="ri-question-line text-lg" aria-hidden="true" />
          Help Center
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm font-medium text-[#DC2626] transition hover:text-[#B91C1C] lg:text-[1rem]"
        >
          <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
