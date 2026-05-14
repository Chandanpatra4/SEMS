import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import PublicNavbar from '../components/layout/PublicNavbar'

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
