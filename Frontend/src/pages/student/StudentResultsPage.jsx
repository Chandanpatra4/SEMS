import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyResults } from '../../services/resultService'

function StudentResultsPage() {
  const location = useLocation()
  const [results, setResults] = useState([])
  const [expandedResultId, setExpandedResultId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getMyResults()
        setResults(data)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [])

  const averageScore = useMemo(() => {
    if (!results.length) {
      return '--'
    }

    const total = results.reduce((sum, result) => sum + Number(result.percentage || 0), 0)
    return `${(total / results.length).toFixed(2)}%`
  }, [results])

  return (
    <section className="mx-auto max-w-400 space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#121826] sm:text-4xl">My Results</h1>
          <p className="mt-2 text-sm text-slate-600">Exam submissions and performance from database records.</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Average Score</p>
          <p className="text-xl font-bold text-[#1E3A8A]">{averageScore}</p>
        </div>
      </div>

      {location.state?.alreadyAttempted ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          You have already attempted this exam. Re-attempt is not allowed.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Exam</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3">Percentage</th>
              <th className="px-5 py-3">Grade</th>
              <th className="px-5 py-3">Submitted At</th>
              <th className="px-5 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  Loading results...
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

            {!isLoading && !error && results.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  No results found yet.
                </td>
              </tr>
            ) : null}

            {!isLoading && !error
              ? results.map((result) => (
                  <Fragment key={result._id}>
                    <tr className="border-t border-slate-100">
                      <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{result.examId?.title || 'Exam'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{result.score}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{result.percentage}%</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{result.grade}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(result.submittedAt)}</td>
                      <td className="px-5 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedResultId((prev) => (prev === result._id ? '' : result._id))
                          }
                          className="font-semibold text-[#1E3A8A] transition hover:text-[#17306f]"
                        >
                          {expandedResultId === result._id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {expandedResultId === result._id ? (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-5 py-4">
                          <ResultBreakdown result={result} />
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

function ResultBreakdown({ result }) {
  const questions = result.examId?.questions || []
  const answerMap = new Map(
    (result.answers || []).map((answer) => [String(answer.questionId), answer.selectedOption])
  )

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1E3A8A]">Question-wise Breakdown</p>

      {questions.length === 0 ? (
        <p className="text-sm text-slate-500">Question details are not available for this exam.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((question, index) => {
            const selectedOption = answerMap.get(String(question._id))
            const status = !selectedOption
              ? 'Not Attempted'
              : selectedOption === question.correctAnswer
                ? 'Correct'
                : 'Wrong'

            return (
              <div key={question._id} className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Q{index + 1}. {question.questionText}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      status === 'Correct'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'Wrong'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Selected: {selectedOption || 'Not Attempted'} | Correct: {question.correctAnswer} | Marks:{' '}
                  {question.marks || 0}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentResultsPage
