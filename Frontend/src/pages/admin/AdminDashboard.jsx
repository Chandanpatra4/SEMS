import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import UserTable from '../../components/user/UserTable'
import {
  getUsers,
  deleteUser as deleteUserRequest,
} from '../../services/userService'
import { getExamCount, getQuestionCount, getStudentCount, getTeacherCount } from '../../services/dashboardService'
import { getExams } from '../../services/examService'
import { getActivityLogs } from '../../services/activityService'

const activityColumns = [
  { key: 'user', label: 'User' },
  { key: 'activity', label: 'Activity' },
  { key: 'time', label: 'Time' },
  { key: 'status', label: 'Status' },
]


function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [userError, setUserError] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [monitoringSessions, setMonitoringSessions] = useState([])
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(true)
  const [activityLogs, setActivityLogs] = useState([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)
  const [activityError, setActivityError] = useState('')
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    questions: 0,
    exams: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      const [students, teachers, questions, exams] = await Promise.all([
        getStudentCount(),
        getTeacherCount(),
        getQuestionCount(),
        getExamCount(),
      ])

      setStats({ students, teachers, questions, exams })
    }

    loadStats()
  }, [])

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      setUserError('')

      try {
        const data = await getUsers()

        setUsers(
          data.map((user) => ({
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            status: user.status || 'Active',
            enrollmentId: user.enrollmentId || '',
            branch: user.branch || '',
            year: user.year || '',
            department: user.department || '',
            yearSemester: user.yearSemester || '',
          }))
        )
      } catch (error) {
        setUserError(error.message)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    const loadMonitoringSessions = async () => {
      setIsLoadingMonitoring(true)

      try {
        const exams = await getExams()
        const now = new Date()

        const activeSessions = exams
          .filter((exam) => {
            const startTime = new Date(exam.startTime)
            const endTime = new Date(exam.endTime)
            return startTime <= now && endTime >= now
          })
          .map((exam) => ({
            title: exam.title,
            cohort: `${exam.branch} Year ${exam.year}`,
            badge: `${Math.max(0, Math.ceil((new Date(exam.endTime) - now) / (1000 * 60)))}m LEFT`,
            progress: calculateExamProgress(exam.startTime, exam.endTime),
            status: 'active',
          }))

        setMonitoringSessions(activeSessions)
      } catch {
        setMonitoringSessions([])
      } finally {
        setIsLoadingMonitoring(false)
      }
    }

    loadMonitoringSessions()
  }, [])

  useEffect(() => {
    const loadActivity = async () => {
      setIsLoadingActivity(true)
      setActivityError('')

      try {
        const logs = await getActivityLogs()

        setActivityLogs(
          logs.map((log) => ({
            user: log.studentId?.name || log.studentId?.email || 'Unknown User',
            activity: formatActivityLabel(log),
            time: formatRelativeTime(log.timestamp || log.createdAt),
            status: String(log.severity || 'low').toUpperCase(),
            tone: mapSeverityToTone(log.severity),
          }))
        )
      } catch (error) {
        setActivityError(error.message)
        setActivityLogs([])
      } finally {
        setIsLoadingActivity(false)
      }
    }

    loadActivity()
  }, [])

  useEffect(() => {
    if (
      !location.state?.userCreated &&
      !location.state?.userUpdated &&
      !location.state?.teacherCreated &&
      !location.state?.teacherUpdated
    ) {
      return
    }

    navigate(location.pathname, { replace: true })
  }, [location.pathname, location.state, navigate])

  const handleAddTeacher = () => {
    navigate('/admin/teachers/new')
  }

  const handleAddStudent = () => {
    navigate('/admin/students/new')
  }

  const handleEditUser = (user) => {
    const normalizedRole = user.role?.toLowerCase()

    if (normalizedRole === 'teacher') {
      navigate(`/admin/teachers/${user.id}/edit`, {
        state: { teacher: user },
      })
      return
    }

    navigate(`/admin/students/${user.id}/edit`, {
      state: { student: user },
    })
  }

  const handleDeleteUser = async (user) => {
    try {
      await deleteUserRequest(user.id)
      setUsers((prev) => prev.filter((entry) => entry.id !== user.id))
    } catch (error) {
      setUserError(error.message)
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const roleMatches =
          userRoleFilter === 'all' || user.role.toLowerCase() === userRoleFilter
        const statusMatches =
          userStatusFilter === 'all' || user.status.toLowerCase() === userStatusFilter

        return roleMatches && statusMatches
      }),
    [userRoleFilter, userStatusFilter, users]
  )

  const handleExportUsersCsv = () => {
    const rows = filteredUsers.map((user) => ({
      Name: user.name || '',
      Email: user.email || '',
      Role: user.role || '',
      Status: user.status || '',
      EnrollmentId: user.enrollmentId || '',
      Branch: user.branch || '',
      Year: user.year || '',
      Department: user.department || '',
      YearSemester: user.yearSemester || '',
    }))

    const headers = [
      'Name',
      'Email',
      'Role',
      'Status',
      'EnrollmentId',
      'Branch',
      'Year',
      'Department',
      'YearSemester',
    ]

    const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr)_340px]">
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: 'Total Students',
                value: String(stats.students || 0),
                icon: <StudentsIcon className="h-7 w-7" />,
                badge: 'Live',
                badgeTone: 'success',
              },
              {
                title: 'Total Teachers',
                value: String(stats.teachers || 0),
                icon: <TeacherIcon className="h-7 w-7" />,
                badge: 'Live',
                badgeTone: 'neutral',
              },
              {
                title: 'Total Questions',
                value: String(stats.questions || 0),
                icon: <QuestionIcon className="h-7 w-7" />,
                badge: 'DB',
                badgeTone: 'live',
              },
              {
                title: 'Total Exams',
                value: String(stats.exams || 0),
                icon: <ActiveExamIcon className="h-7 w-7" />,
                badge: 'DB',
                badgeTone: 'neutral',
              },
            ].map((card) => (
              <Card key={card.title} {...card}>
                {null}
              </Card>
            ))}
          </div>

          <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#1E3A8A]">User Management</h2>
                <p className="mt-2 text-base text-slate-500">Manage academic credentials and roles</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={userRoleFilter}
                  onChange={(event) => setUserRoleFilter(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:border-[#1E3A8A] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(event) => setUserStatusFilter(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:border-[#1E3A8A] focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportUsersCsv}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#E2E8FF]"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="inline-flex items-center gap-3 rounded-2xl border border-[#1E3A8A] bg-white px-6 py-4 text-base font-semibold text-[#1E3A8A] transition hover:bg-[#EEF2FF]"
                >
                  <AddUserIcon className="h-5 w-5" />
                  Add Student
                </button>

                <button
                  type="button"
                  onClick={handleAddTeacher}
                  className="inline-flex items-center gap-3 rounded-2xl bg-[#064E3B] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#053c2d]"
                >
                  <AddUserIcon className="h-5 w-5" />
                  Add Teacher
                </button>
              </div>
            </div>

            <div className="mt-6">
              {userError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {userError}
                </div>
              ) : null}

              {location.state?.userCreated ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Student record created successfully.
                </div>
              ) : null}

              {location.state?.userUpdated ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Student record updated successfully.
                </div>
              ) : null}

              {location.state?.teacherCreated ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Teacher record created successfully.
                </div>
              ) : null}

              {location.state?.teacherUpdated ? (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Teacher record updated successfully.
                </div>
              ) : null}

              {isLoadingUsers ? (
                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-8 text-sm text-slate-500">
                  Loading users...
                </div>
              ) : (
                <UserTable users={filteredUsers} onEdit={handleEditUser} onDelete={handleDeleteUser} />
              )}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1E3A8A]">Active Monitoring</h2>
              <SignalIcon className="h-6 w-6 text-[#14B8A6]" />
            </div>

            <div className="mt-6 space-y-5">
              {isLoadingMonitoring ? (
                <p className="text-sm text-slate-500">Loading active sessions...</p>
              ) : null}

              {!isLoadingMonitoring && monitoringSessions.length === 0 ? (
                <p className="text-sm text-slate-500">No active exam sessions at the moment.</p>
              ) : null}

              {monitoringSessions.map((session) => (
                <article
                  key={session.title}
                  className={`rounded-3xl p-5 ${
                    session.status === 'paused' ? 'border-l-4 border-red-300 bg-[#FFF8F8]' : 'bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className={`text-xl font-semibold ${
                        session.status === 'paused' ? 'text-red-700' : 'text-[#1E3A8A]'
                      }`}
                    >
                      {session.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        session.status === 'paused' ? 'bg-red-600 text-white' : 'bg-[#14B8A6] text-white'
                      }`}
                    >
                      {session.badge}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 text-slate-600">
                    <p className="flex items-center gap-2">
                      <UsersTinyIcon className="h-4 w-4" />
                      {session.cohort}
                    </p>
                    {session.alert ? <p className="text-sm font-medium text-red-600">{session.alert}</p> : null}
                  </div>

                  <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        session.status === 'paused' ? 'bg-red-400' : 'bg-[#14B8A6]'
                      }`}
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-2xl border border-dashed border-slate-300 px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
            >
              View All Sessions
            </button>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-semibold text-[#1E3A8A]">System Activity Logs</h2>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-2xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#E2E8FF]"
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-2xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172d6e]"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="mt-6">
          <Table columns={activityColumns}>
            {isLoadingActivity ? (
              <tr>
                <td colSpan={4} className="border-b border-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                  Loading activity logs...
                </td>
              </tr>
            ) : null}

            {!isLoadingActivity && activityError ? (
              <tr>
                <td colSpan={4} className="border-b border-slate-100 px-4 py-6 text-center text-sm font-medium text-red-600">
                  {activityError}
                </td>
              </tr>
            ) : null}

            {!isLoadingActivity && !activityError && activityLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="border-b border-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                  No activity logs available.
                </td>
              </tr>
            ) : null}

            {!isLoadingActivity && !activityError
              ? activityLogs.map((log) => (
              <tr key={`${log.user}-${log.time}`}>
                <td className="border-b border-slate-100 px-4 py-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        log.tone === 'warning'
                          ? 'bg-red-500'
                          : log.tone === 'system'
                            ? 'bg-slate-300'
                            : 'bg-[#14B8A6]'
                      }`}
                    />
                    <span className="font-semibold text-[#1E3A8A]">{log.user}</span>
                  </div>
                </td>
                <td
                  className={`border-b border-slate-100 px-4 py-5 ${
                    log.tone === 'warning' ? 'italic text-red-600' : 'text-slate-700'
                  }`}
                >
                  {log.activity}
                </td>
                <td className="border-b border-slate-100 px-4 py-5 text-sm uppercase text-slate-400">{log.time}</td>
                <td className="border-b border-slate-100 px-4 py-5">
                  <span
                    className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                      log.tone === 'warning'
                        ? 'bg-red-50 text-red-600'
                        : log.tone === 'system'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-50 text-[#14B8A6]'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
                ))
              : null}
          </Table>
        </div>

        <button
          type="button"
          aria-label="Add action"
          className="fixed bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#064E3B] text-white shadow-[0_20px_40px_-18px_rgba(6,78,59,0.65)] transition hover:bg-[#053c2d]"
        >
          <PlusIcon className="h-8 w-8" />
        </button>
      </section>
    </>
  )
}

function calculateExamProgress(startTime, endTime) {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const now = Date.now()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }

  const elapsed = now - start
  const total = end - start
  const percentage = (elapsed / total) * 100

  return Math.max(0, Math.min(100, Number(percentage.toFixed(1))))
}

function formatRelativeTime(dateValue) {
  const timestamp = new Date(dateValue).getTime()

  if (!Number.isFinite(timestamp)) {
    return 'Unknown time'
  }

  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hours ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

function mapSeverityToTone(severity = '') {
  const normalizedSeverity = String(severity).toLowerCase()

  if (normalizedSeverity === 'high') {
    return 'warning'
  }

  if (normalizedSeverity === 'medium') {
    return 'system'
  }

  return 'success'
}

function formatActivityLabel(log) {
  const examTitle = log.examId?.title ? ` in ${log.examId.title}` : ''
  return `${String(log.activityType || 'Activity').replaceAll('_', ' ')}${examTitle}`
}

function StudentsIcon({ className = '' }) {
  return <i className={`ri-group-line ${className}`} aria-hidden="true" />
}

function TeacherIcon({ className = '' }) {
  return <i className={`ri-user-star-line ${className}`} aria-hidden="true" />
}

function QuestionIcon({ className = '' }) {
  return <i className={`ri-questionnaire-line ${className}`} aria-hidden="true" />
}

function ActiveExamIcon({ className = '' }) {
  return <i className={`ri-timer-flash-line ${className}`} aria-hidden="true" />
}

function AlertIcon({ className = '' }) {
  return <i className={`ri-alert-line ${className}`} aria-hidden="true" />
}

function AddUserIcon({ className = '' }) {
  return <i className={`ri-user-add-line ${className}`} aria-hidden="true" />
}

function SignalIcon({ className = '' }) {
  return <i className={`ri-radar-line ${className}`} aria-hidden="true" />
}

function UsersTinyIcon({ className = '' }) {
  return <i className={`ri-team-line ${className}`} aria-hidden="true" />
}

function PlusIcon({ className = '' }) {
  return <i className={`ri-add-line ${className}`} aria-hidden="true" />
}

export default AdminDashboard
