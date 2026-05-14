import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions } from '../../services/questionService'

function TeacherQuestionPanel() {
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
        setQuestions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">Recent Questions</h2>
        <button
          type="button"
          onClick={() => navigate('/teacher/questions/new')}
          className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17306f]"
        >
          + Add New Question
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Question Title</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                  Loading recent questions...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm font-medium text-red-600">
                  {error}
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                  No questions found. Create your first one.
                </td>
              </tr>
            ) : (
              questions.slice(0, 5).map((question) => (
                <tr key={question._id || question.id || question.questionText} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#1E3A8A]">{question.questionText}</p>
                    <p className="mt-1 text-xs text-slate-400">{getUpdatedLabel(question.updatedAt || question.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1E3A8A]">
                      {question.subject || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className={`h-1.5 w-4 rounded-full ${index < getDifficultyLevel(question.difficulty) ? 'bg-[#14B8A6]' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button type="button" className="transition hover:text-[#1E3A8A]" aria-label="Edit question">
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button type="button" className="transition hover:text-red-500" aria-label="Delete question">
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-6 py-4 text-center">
        <button
          type="button"
          onClick={() => navigate('/teacher/questions')}
          className="text-sm font-semibold text-[#1E3A8A] transition hover:text-[#17306f]"
        >
          View All {questions.length || 0} Questions
        </button>
      </div>
    </section>
  )
}

function getDifficultyLevel(difficulty = '') {
  const normalized = String(difficulty).toLowerCase()

  if (normalized === 'hard') {
    return 3
  }

  if (normalized === 'medium') {
    return 2
  }

  return 1
}

function getUpdatedLabel(dateString) {
  if (!dateString) {
    return 'Updated recently'
  }

  const updatedAt = new Date(dateString)
  const diffMs = Date.now() - updatedAt.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (Number.isNaN(diffHours) || diffHours < 1) {
    return 'Updated just now'
  }

  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `Updated ${diffDays}d ago`
}

function EditIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m3 17.25 9.06-9.06 3.75 3.75L6.75 21H3v-3.75Zm14.71-9.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0l-1.02 1.02 3.75 3.75 1.19-1.15Z" />
    </svg>
  )
}

function DeleteIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 12a2 2 0 0 1-2-2V7h16v12a2 2 0 0 1-2 2H6Z" />
    </svg>
  )
}

export default TeacherQuestionPanel
