import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentExamCard from '../../components/student/StudentExamCard'
import StudentStatCard from '../../components/student/StudentStatCard'
import { getAvailableExams } from '../../services/examService'
import { getMyResults } from '../../services/resultService'

function StudentDashboard() {
  const navigate = useNavigate()
  const [availableExams, setAvailableExams] = useState([])
  const [myResults, setMyResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadAvailableExams = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const [exams, results] = await Promise.all([
          getAvailableExams(),
          getMyResults(),
        ])
        setAvailableExams(exams)
        setMyResults(results)
      } catch (error) {
        setLoadError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAvailableExams()
  }, [])

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isInactiveStudent = String(user?.status || '').toLowerCase() === 'inactive'
  const displayName = user?.name || formatDisplayName(user?.email)
  const averageScore =
    myResults.length > 0
      ? (myResults.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / myResults.length).toFixed(1)
      : '--'

  const attemptedExamIds = useMemo(
    () =>
      new Set(
        myResults
          .map((result) => result.examId?._id || result.examId)
          .filter(Boolean)
          .map(String)
      ),
    [myResults]
  )

  const statCards = useMemo(
    () => [
      {
        title: 'Available Exams',
        value: String(availableExams.length),
        meta: availableExams.length ? 'Upcoming and active exams available' : 'No upcoming or active exams right now',
        accent: 'blue',
        icon: <i className="ri-clipboard-line text-3xl" aria-hidden="true" />,
      },
      {
        title: 'Completed Exams',
        value: String(myResults.length),
        meta: myResults.length ? 'Based on your submitted exams' : 'Result history will appear here',
        accent: 'neutral',
        highlight: true,
        icon: <i className="ri-checkbox-circle-line text-3xl" aria-hidden="true" />,
      },
      {
        title: 'Average Score',
        value: averageScore === '--' ? '--' : `${averageScore}%`,
        meta: myResults.length ? 'Calculated from your submissions' : 'Performance available after submissions',
        accent: 'mint',
        icon: <i className="ri-medal-line text-3xl" aria-hidden="true" />,
      },
    ],
    [availableExams.length, averageScore, myResults.length]
  )

  const examCards = useMemo(
    () => {
      const now = Date.now()

      return availableExams.map((exam) => {
        const examStartMs = new Date(exam.startTime).getTime()
        const isUpcoming = Number.isFinite(examStartMs) && examStartMs > now
        const isAttempted = attemptedExamIds.has(String(exam._id))

        return {
          id: exam._id,
          title: exam.title,
          subject: exam.subject,
          duration: `${exam.duration} Minutes`,
          dateTime: formatDateTime(exam.startTime),
          status: isAttempted
            ? 'Attempted'
            : isInactiveStudent
              ? 'Inactive'
              : isUpcoming
                ? 'Upcoming'
                : 'Active',
          actionLabel: isAttempted
            ? 'Attempted'
            : isInactiveStudent
              ? 'Not Allowed Now'
              : isUpcoming
                ? 'Starts Soon'
                : 'Start Exam',
          actionDisabled: isAttempted || isInactiveStudent || isUpcoming,
          icon: <i className="ri-file-list-3-line text-4xl" aria-hidden="true" />,
        }
      })
    },
    [attemptedExamIds, availableExams, isInactiveStudent]
  )

  const handleStartExam = async (examId) => {
    if (attemptedExamIds.has(String(examId)) || isInactiveStudent) {
      return
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Browser may reject fullscreen without direct gesture.
    }

    navigate(`/student/exams/${examId}/start`)
  }

  return (
    <section className="mx-auto max-w-400 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-[#121826] sm:text-5xl lg:text-[3.6rem]">
            Welcome, {displayName || 'Student'}!
          </h1>
          <p className="mt-4 max-w-4xl text-[1.1rem] text-slate-600">
            View upcoming and active exams, then track your performance across the academic monolith.
          </p>
        </div>

        <div className="inline-flex items-center gap-4 rounded-[22px] bg-white px-5 py-4 sm:px-8 sm:py-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.34)]">
          <i className="ri-calendar-2-line text-2xl text-[#0B278A] sm:text-3xl" aria-hidden="true" />
          <span className="text-[1.15rem] font-medium text-slate-700">{today}</span>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {statCards.map((card) => (
          <StudentStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-16 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-5">
          <h2 className="text-3xl font-bold tracking-tight text-[#121826] sm:text-4xl lg:text-[2.6rem]">Available Exams</h2>
          <span className="rounded-full bg-[#D8DEFF] px-5 py-2 text-[1rem] font-semibold text-[#23348F]">
            New Session
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-2xl bg-[#EDF1F6] px-7 py-3 text-[1rem] font-semibold text-[#0B278A] transition hover:bg-[#E5EBF3]"
          >
            Filter
          </button>
          <button
            type="button"
            className="rounded-2xl bg-[#EDF1F6] px-7 py-3 text-[1rem] font-semibold text-[#0B278A] transition hover:bg-[#E5EBF3]"
          >
            Sort By
          </button>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        {isInactiveStudent ? (
          <p className="text-sm font-medium text-amber-700">
            Your account is inactive. You can login, but exam attempts are currently not allowed.
          </p>
        ) : null}
        {isLoading ? <p className="text-sm text-slate-500">Loading available exams...</p> : null}
        {loadError ? <p className="text-sm font-medium text-red-600">{loadError}</p> : null}
        {!isLoading && !loadError && examCards.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming or active exams are available for your branch and year at this time.</p>
        ) : null}
        {examCards.map((exam) => (
          <StudentExamCard
            key={`${exam.id}-${exam.dateTime}`}
            {...exam}
            onAction={() => handleStartExam(exam.id)}
          />
        ))}
      </div>
    </section>
  )
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return 'Schedule unavailable'
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Schedule unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

function formatDisplayName(email = '') {
  const localPart = email.split('@')[0]

  if (!localPart) {
    return 'Student'
  }

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default StudentDashboard
