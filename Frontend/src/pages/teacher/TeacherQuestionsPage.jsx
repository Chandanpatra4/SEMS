import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions } from '../../services/questionService'

function TeacherQuestionsPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getQuestions()
        setQuestions(data)
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">All Questions</h1>
          <p className="text-sm text-slate-500">Questions from your database records</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/teacher/questions/new')}
          className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17306f]"
        >
          + Add New Question
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Question</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Difficulty</th>
              <th className="px-5 py-3">Marks</th>
              <th className="px-5 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  Loading questions...
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

            {!isLoading && !error && questions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  No questions available.
                </td>
              </tr>
            ) : null}

            {!isLoading && !error
              ? questions.map((question) => (
                  <tr key={question._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1E3A8A]">{question.questionText}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{question.subject || 'General'}</td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-600">{question.difficulty || 'easy'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{question.marks || 0}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(question.updatedAt || question.createdAt)}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDate(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed)
}

export default TeacherQuestionsPage
