import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentExamCard from '../../components/student/StudentExamCard'
import { getAvailableExams } from '../../services/examService'
import { getMyResults } from '../../services/resultService'

function StudentExamsPage() {
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const isInactiveStudent = String(user?.status || '').toLowerCase() === 'inactive'

  useEffect(() => {
    const loadExams = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [examData, resultData] = await Promise.all([getAvailableExams(), getMyResults()])
        setExams(examData)
        setResults(resultData)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()
  }, [])

  const attemptedExamIds = useMemo(
    () =>
      new Set(
        results
          .map((result) => result.examId?._id || result.examId)
          .filter(Boolean)
          .map(String)
      ),
    [results]
  )

  const examCards = useMemo(
    () => {
      const now = Date.now()

      return exams.map((exam) => {
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
        }
      })
    },
    [attemptedExamIds, exams, isInactiveStudent]
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
      // Browser may reject fullscreen request.
    }

    navigate(`/student/exams/${examId}/start`)
  }

  return (
    <section className="mx-auto max-w-400 space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#121826] sm:text-4xl">My Exams</h1>
        <p className="mt-2 text-sm text-slate-600">Upcoming and active exams for your branch and year.</p>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading exams...</p> : null}
      {isInactiveStudent ? (
        <p className="text-sm font-medium text-amber-700">
          Your account is inactive. Exam attempts are not allowed now.
        </p>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {!isLoading && !error && examCards.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming or active exams available right now.</p>
      ) : null}

      <div className="space-y-5">
        {examCards.map((exam) => (
          <StudentExamCard
            key={exam.id}
            {...exam}
            onAction={() => handleStartExam(exam.id)}
          />
        ))}
      </div>
    </section>
  )
}

function formatDateTime(dateValue) {
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

export default StudentExamsPage
