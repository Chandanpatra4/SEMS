import { useEffect, useState } from 'react'
import { getTeacherExams } from '../../services/examService'

function TeacherManageExamsPage() {
  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExams = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getTeacherExams()
        setExams(data)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()
  }, [])

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Manage Exams</h1>
        <p className="text-sm text-slate-500">All exams created by you</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Branch</th>
              <th className="px-5 py-3">Year</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  Loading exams...
                </td>
              </tr>
            ) : null}

            {!isLoading && error ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm font-medium text-red-600">
                  {error}
                </td>
              </tr>
            ) : null}

            {!isLoading && !error && exams.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  No exams created yet.
                </td>
              </tr>
            ) : null}

            {!isLoading && !error
              ? exams.map((exam) => (
                  <tr key={exam._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{exam.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.subject}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.branch}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.year}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.duration} min</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDateTime(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export default TeacherManageExamsPage
