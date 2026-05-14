import { Outlet } from 'react-router-dom'
import TeacherHeader from '../components/teacher/TeacherHeader'
import TeacherSidebar from '../components/teacher/TeacherSidebar'

function TeacherLayout() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900 lg:flex">
      <TeacherSidebar />
      <div className="min-w-0 flex-1">
        <TeacherHeader />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TeacherLayout
