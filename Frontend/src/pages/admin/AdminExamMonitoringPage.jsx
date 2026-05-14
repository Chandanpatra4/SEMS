import { useEffect, useMemo, useState } from 'react'
import { getExams } from '../../services/examService'

function AdminExamMonitoringPage() {
  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExams = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getExams()
        setExams(data)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()
  }, [])

  const activeExams = useMemo(() => {
    const now = Date.now()
    return exams.filter((exam) => {
      const start = new Date(exam.startTime).getTime()
      const end = new Date(exam.endTime).getTime()
      return start <= now && end >= now
    })
  }, [exams])

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Exam Monitoring</h1>
        <p className="text-sm text-slate-500">Live and scheduled exams from database</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Active Exams: <span className="font-semibold text-[#1E3A8A]">{activeExams.length}</span></p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Branch</th>
              <th className="px-5 py-3">Year</th>
              <th className="px-5 py-3">Window</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">Loading exam monitoring...</td></tr>
            ) : null}
            {!isLoading && error ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-sm font-medium text-red-600">{error}</td></tr>
            ) : null}
            {!isLoading && !error && exams.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">No exams available.</td></tr>
            ) : null}
            {!isLoading && !error
              ? exams.map((exam) => (
                  <tr key={exam._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{exam.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.subject}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.branch}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{exam.year}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}</td>
                    <td className="px-5 py-4 text-sm">{getStatusBadge(exam)}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function getStatusBadge(exam) {
  const now = Date.now()
  const start = new Date(exam.startTime).getTime()
  const end = new Date(exam.endTime).getTime()

  if (start <= now && end >= now) {
    return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
  }

  if (start > now) {
    return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Upcoming</span>
  }

  return <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">Completed</span>
}

function formatDateTime(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export default AdminExamMonitoringPage
