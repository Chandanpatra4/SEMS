import { useEffect, useState } from 'react'
import TeacherPerformanceOverview from '../../components/teacher/TeacherPerformanceOverview'
import TeacherQuestionPanel from '../../components/teacher/TeacherQuestionPanel'
import TeacherQuickCreateExamCard from '../../components/teacher/TeacherQuickCreateExamCard'
import TeacherStatCard from '../../components/teacher/TeacherStatCard'
import { getExamCount, getQuestionCount, getStudentCount, getTeacherCount } from '../../services/dashboardService'

function TeacherDashboard() {
  const user = getStoredUser()
  const teacherName = user?.name?.trim() || formatDisplayName(user?.email) || 'Teacher'
  const teacherDepartment = user?.department?.trim() || 'General'
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

  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Welcome Back</p>
        <h2 className="mt-2 text-2xl font-bold text-[#1E3A8A]">{teacherName}</h2>
      
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Total Students',
            value: String(stats.students || 0),
            accent: 'blue',
            icon: <StudentsIcon className="h-5 w-5" />,
          },
          {
            title: 'Total Teachers',
            value: String(stats.teachers || 0),
            accent: 'mint',
            icon: <TeachersIcon className="h-5 w-5" />,
          },
          {
            title: 'Total Questions',
            value: String(stats.questions || 0),
            accent: 'blue',
            icon: <QuestionIcon className="h-5 w-5" />,
          },
          {
            title: 'Total Exams',
            value: String(stats.exams || 0),
            accent: 'red',
            icon: <ExamIcon className="h-5 w-5" />,
          },
        ].map((card) => (
          <TeacherStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <TeacherQuestionPanel />
        <TeacherQuickCreateExamCard />
      </div>

      <TeacherPerformanceOverview />
    </section>
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

function QuestionIcon({ className = '' }) {
  return <i className={`ri-questionnaire-line ${className}`} aria-hidden="true" />
}

function ExamIcon({ className = '' }) {
  return <i className={`ri-file-list-3-line ${className}`} aria-hidden="true" />
}

function StudentsIcon({ className = '' }) {
  return <i className={`ri-group-line ${className}`} aria-hidden="true" />
}

function TeachersIcon({ className = '' }) {
  return <i className={`ri-user-star-line ${className}`} aria-hidden="true" />
}

export default TeacherDashboard
