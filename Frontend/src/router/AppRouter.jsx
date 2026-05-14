import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AddStudentPage from '../pages/admin/AddStudentPage'
import AddTeacherPage from '../pages/admin/AddTeacherPage'
import MainLayout from '../layouts/MainLayout'
import StudentLayout from '../layouts/StudentLayout'
import TeacherLayout from '../layouts/TeacherLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminExamMonitoringPage from '../pages/admin/AdminExamMonitoringPage'
import AdminActivityLogsPage from '../pages/admin/AdminActivityLogsPage'
import AdminReportsPage from '../pages/admin/AdminReportsPage'
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentExamPage from '../pages/student/StudentExamPage'
import StudentExamsPage from '../pages/student/StudentExamsPage'
import StudentResultsPage from '../pages/student/StudentResultsPage'
import AddQuestionPage from '../pages/teacher/AddQuestionPage'
import CreateExamPage from '../pages/teacher/CreateExamPage'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import TeacherManageExamsPage from '../pages/teacher/TeacherManageExamsPage'
import TeacherQuestionsPage from '../pages/teacher/TeacherQuestionsPage'
import TeacherReportsPage from '../pages/teacher/TeacherReportsPage'

const getStoredRole = () => localStorage.getItem('role')
const getStoredToken = () => localStorage.getItem('token')

function ProtectedRoute({ allowedRole, children }) {
  const token = getStoredToken()
  const role = getStoredRole()

  if (!token || !role) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    return <Navigate to={`/${role}/dashboard`} replace />
  }

  return children
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="exam-monitoring" element={<AdminExamMonitoringPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="activity-logs" element={<AdminActivityLogsPage />} />
          <Route path="teachers/new" element={<AddTeacherPage />} />
          <Route path="teachers/:id/edit" element={<AddTeacherPage />} />
          <Route path="students/new" element={<AddStudentPage />} />
          <Route path="students/:id/edit" element={<AddStudentPage />} />
        </Route>
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="exams" element={<StudentExamsPage />} />
          <Route path="exams/:id/start" element={<StudentExamPage />} />
          <Route path="results" element={<StudentResultsPage />} />
        </Route>
        <Route
          path="teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="questions/new" element={<AddQuestionPage />} />
          <Route path="questions" element={<TeacherQuestionsPage />} />
          <Route path="exams/create" element={<CreateExamPage />} />
          <Route path="exams/manage" element={<TeacherManageExamsPage />} />
          <Route path="reports" element={<TeacherReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
