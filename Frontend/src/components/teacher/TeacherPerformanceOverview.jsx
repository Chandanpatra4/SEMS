import { useEffect, useState } from 'react'
import { getExams } from '../../services/examService'
import { getExamResults } from '../../services/resultService'

function TeacherPerformanceOverview() {
  const [performance, setPerformance] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPerformance = async () => {
      setIsLoading(true)
      setError('')

      try {
        const exams = await getExams()

        const performanceData = await Promise.all(
          exams.slice(0, 6).map(async (exam) => {
            const results = await getExamResults(exam._id)
            const submittedCount = results.length
            const totalPercentage = results.reduce(
              (sum, result) => sum + Number(result.percentage || 0),
              0
            )
            const averagePercentage = submittedCount
              ? Number((totalPercentage / submittedCount).toFixed(1))
              : 0

            return {
              title: exam.title,
              status: new Date(exam.endTime) >= new Date() ? 'Active' : 'Completed',
              avg: submittedCount ? `${averagePercentage}%` : 'No submissions',
              avgNumber: averagePercentage,
            }
          })
        )

        setPerformance(performanceData.slice(0, 3))
      } catch (apiError) {
        setError(apiError.message)
        setPerformance([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPerformance()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Student Performance Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Aggregated results across current active and recent exams</p>
        </div>
        <button type="button" className="text-sm font-semibold text-[#1E3A8A] transition hover:text-[#17306f]">
          Detailed Reports
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading performance overview...</p>
        ) : null}

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        {!isLoading && !error && performance.length === 0 ? (
          <p className="text-sm text-slate-500">No exam performance data available.</p>
        ) : null}

        {performance.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-[#FCFDFE] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#14B8A6]"
                style={{ width: `${Math.max(0, Math.min(100, item.avgNumber || 0))}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#1E3A8A]">Average Score: {item.avg}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TeacherPerformanceOverview
