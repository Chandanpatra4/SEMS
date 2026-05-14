import { useEffect, useState } from 'react'
import { getExams } from '../../services/examService'
import { getExamResults } from '../../services/resultService'

function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true)
      setError('')

      try {
        const exams = await getExams()
        const data = await Promise.all(
          exams.map(async (exam) => {
            const results = await getExamResults(exam._id)
            const submissions = results.length
            const avg = submissions
              ? (results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / submissions).toFixed(2)
              : '0.00'

            return {
              id: exam._id,
              title: exam.title,
              subject: exam.subject,
              submissions,
              average: avg,
              topScore: submissions ? Math.max(...results.map((item) => Number(item.percentage || 0))).toFixed(2) : '0.00',
            }
          })
        )

        setReports(data)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [])

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Reports</h1>
        <p className="text-sm text-slate-500">Exam performance analytics from live database</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Submissions</th>
              <th className="px-5 py-3">Avg (%)</th>
              <th className="px-5 py-3">Top (%)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">Loading reports...</td></tr> : null}
            {!isLoading && error ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm font-medium text-red-600">{error}</td></tr> : null}
            {!isLoading && !error && reports.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">No report data available.</td></tr> : null}
            {!isLoading && !error
              ? reports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{report.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{report.subject}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{report.submissions}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{report.average}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{report.topScore}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminReportsPage
