import { useNavigate } from 'react-router-dom'

function TeacherQuickCreateExamCard() {
  const navigate = useNavigate()

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#102f84] px-5 py-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Quick Create Exam</h2>
        <p className="mt-1 text-xs text-slate-200">Initialize a new assessment draft</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Open the full Create Exam form to set subject, branch, year, marks, and schedule. Questions will be auto-selected from your question bank.
        </p>
        <button
          type="button"
          onClick={() => navigate('/teacher/exams/create')}
          className="w-full rounded-xl bg-[#065f50] py-3 text-sm font-semibold text-white transition hover:bg-[#055044]"
        >
          OPEN CREATE EXAM
        </button>
      </div>
    </section>
  )
}

export default TeacherQuickCreateExamCard
