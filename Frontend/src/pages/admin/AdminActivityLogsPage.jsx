import { useCallback, useEffect, useState } from 'react'
import { getActivityLogs } from '../../services/activityService'

function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getActivityLogs()
      const sortedLogs = [...data].sort((first, second) => {
        const firstTime = new Date(first?.timestamp || first?.createdAt || 0).getTime()
        const secondTime = new Date(second?.timestamp || second?.createdAt || 0).getTime()
        return secondTime - firstTime
      })
      setLogs(sortedLogs)
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()

    const intervalId = window.setInterval(() => {
      loadLogs()
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [loadLogs])

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Activity Logs</h1>
          <p className="text-sm text-slate-500">System proctoring and student activity events</p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">Loading activity logs...</td></tr> : null}
            {!isLoading && error ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm font-medium text-red-600">{error}</td></tr> : null}
            {!isLoading && !error && logs.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">No activity logs available.</td></tr> : null}
            {!isLoading && !error
              ? logs.map((log) => (
                  <tr key={log._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{log.studentId?.name || log.studentId?.email || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{log.examId?.title || 'Exam'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{String(log.activityType || '').replaceAll('_', ' ')}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{String(log.severity || 'low').toUpperCase()}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(log.timestamp || log.createdAt)}</td>
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(parsed)
}

export default AdminActivityLogsPage
