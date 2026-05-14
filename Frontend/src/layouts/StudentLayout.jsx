import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import SessionCountdownCard from '../components/student/SessionCountdownCard'
import StudentFooter from '../components/student/StudentFooter'
import StudentHeader from '../components/student/StudentHeader'

function StudentLayout() {
  const location = useLocation()
  const isExamRuntimeRoute = location.pathname.startsWith('/student/exams/')

  if (isExamRuntimeRoute) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <StudentHeader />
      <main>
        <Outlet />
      </main>
      <StudentFooter />
      <SessionCountdownCard />
    </div>
  )
}

export default StudentLayout
