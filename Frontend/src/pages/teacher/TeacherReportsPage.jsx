import { Fragment, useEffect, useState } from 'react'
import { getTeacherExams } from '../../services/examService'
import { getExamResults } from '../../services/resultService'

function TeacherReportsPage() {
  const [reports, setReports] = useState([])
  const [expandedExamId, setExpandedExamId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true)
      setError('')

      try {
        const exams = await getTeacherExams()
        const reportData = await Promise.all(
          exams.map(async (exam) => {
            const results = await getExamResults(exam._id)
            const submissions = results.length
            const average = submissions
              ? (
                  results.reduce((sum, result) => sum + Number(result.percentage || 0), 0) /
                  submissions
                ).toFixed(2)
              : '0.00'

            return {
              id: exam._id,
              title: exam.title,
              subject: exam.subject,
              submissions,
              average,
              attempts: results.map((result) => ({
                id: result._id,
                studentName: result.studentId?.name || 'Unknown Student',
                studentEmail: result.studentId?.email || 'N/A',
                score: Number(result.score || 0),
                percentage: Number(result.percentage || 0),
                grade: result.grade || 'N/A',
                submittedAt: result.submittedAt,
              })),
            }
          })
        )

        setReports(reportData)
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
        <p className="text-sm text-slate-500">Submission and performance report by exam</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Submissions</th>
              <th className="px-5 py-3">Avg Score (%)</th>
              <th className="px-5 py-3">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  Loading reports...
                </td>
              </tr>
            ) : null}

            {!isLoading && error ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm font-medium text-red-600">
                  {error}
                </td>
              </tr>
            ) : null}

            {!isLoading && !error && reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  No report data available.
                </td>
              </tr>
            ) : null}

            {!isLoading && !error
              ? reports.map((report) => (
                  <Fragment key={report.id}>
                    <tr className="border-t border-slate-100">
                      <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{report.title}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{report.subject}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{report.submissions}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{report.average}</td>
                      <td className="px-5 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExamId((prev) => (prev === report.id ? '' : report.id))
                          }
                          className="font-semibold text-[#1E3A8A] transition hover:text-[#17306f]"
                        >
                          {expandedExamId === report.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {expandedExamId === report.id ? (
                      <tr>
                        <td colSpan={5} className="bg-slate-50 px-5 py-4">
                          {report.attempts.length === 0 ? (
                            <p className="text-sm text-slate-500">No students have attempted this exam yet.</p>
                          ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <table className="min-w-full">
                                <thead>
                                  <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-2.5">Student</th>
                                    <th className="px-4 py-2.5">Email</th>
                                    <th className="px-4 py-2.5">Score</th>
                                    <th className="px-4 py-2.5">Percentage</th>
                                    <th className="px-4 py-2.5">Grade</th>
                                    <th className="px-4 py-2.5">Submitted At</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.attempts.map((attempt) => (
                                    <tr key={attempt.id} className="border-t border-slate-100">
                                      <td className="px-4 py-3 text-sm font-semibold text-[#1E3A8A]">{attempt.studentName}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600">{attempt.studentEmail}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600">{attempt.score}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600">{attempt.percentage}%</td>
                                      <td className="px-4 py-3 text-sm text-slate-600">{attempt.grade}</td>
                                      <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(attempt.submittedAt)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDateTime(dateValue) {
  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

export default TeacherReportsPage
