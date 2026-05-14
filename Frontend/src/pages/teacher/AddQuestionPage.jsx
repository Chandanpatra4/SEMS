import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createQuestion } from '../../services/questionService'

const initialFormState = {
  questionText: '',
  subject: 'Computer Science',
  difficulty: 'Easy',
  marks: '1 Mark',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
}

function AddQuestionPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.questionText.trim() || !formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      setSubmitError('Please fill question text and all four options.')
      return
    }

    setIsSubmitting(true)

    try {
      await createQuestion({
        questionText: formData.questionText.trim(),
        optionA: formData.optionA.trim(),
        optionB: formData.optionB.trim(),
        optionC: formData.optionC.trim(),
        optionD: formData.optionD.trim(),
        correctAnswer: formData.correctAnswer,
        subject: formData.subject,
        difficulty: formData.difficulty.toLowerCase(),
        marks: Number(formData.marks.split(' ')[0]),
      })

      navigate('/teacher/dashboard', { replace: true, state: { questionCreated: true } })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-1 py-2">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Question Bank</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight text-[#1E3A8A]">Add Question</h1>
          <p className="mt-2 text-sm text-slate-600">Create a new multiple choice question for the question bank.</p>
        </div>
        <span className="rounded-xl bg-[#EEF2FF] px-3 py-2 text-xs font-semibold text-[#1E3A8A]">v4.2 BANK</span>
      </header>

      <form
        className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8"
        onSubmit={handleSubmit}
      >
        <SectionTitle title="Question Information" />

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-600">Question Text</span>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleChange}
            rows={5}
            placeholder="Enter the full question statement here..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6]"
          />
        </label>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SelectField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={['Computer Science', 'Physics', 'Mathematics', 'Chemistry']}
          />
          <SelectField
            label="Difficulty Level"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            options={['Easy', 'Medium', 'Hard']}
          />
          <SelectField
            label="Marks"
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            options={['1 Mark', '2 Marks', '5 Marks']}
          />
        </div>

        <SectionTitle className="mt-8" title="Answer Options" />

        <div className="mt-4 space-y-3">
          <OptionField
            letter="A"
            name="optionA"
            value={formData.optionA}
            onChange={handleChange}
            placeholder="Option A description"
          />
          <OptionField
            letter="B"
            name="optionB"
            value={formData.optionB}
            onChange={handleChange}
            placeholder="Option B description"
          />
          <OptionField
            letter="C"
            name="optionC"
            value={formData.optionC}
            onChange={handleChange}
            placeholder="Option C description"
          />
          <OptionField
            letter="D"
            name="optionD"
            value={formData.optionD}
            onChange={handleChange}
            placeholder="Option D description"
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Correct Answer Selection</p>
          <div className="mt-3 flex flex-wrap gap-6">
            {['A', 'B', 'C', 'D'].map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={option}
                  checked={formData.correctAnswer === option}
                  onChange={handleChange}
                  className="h-4 w-4 border-slate-300 text-[#1E3A8A]"
                />
                Option {option}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {submitError ? (
            <p className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 sm:mr-auto sm:w-auto">
              {submitError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-[#1E3A8A] transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_32px_-22px_rgba(30,58,138,0.75)] transition hover:bg-[#17306f]"
          >
            {isSubmitting ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </form>

      <footer className="mt-6 flex flex-col gap-3 pb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Faculty Guidelines</p>
        <p>Ethical Testing Standards</p>
        <p>Academic Monolith Institutional v24.01</p>
      </footer>

      <div className="pointer-events-none fixed bottom-6 right-6 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl lg:flex lg:items-center lg:gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#D6FCF7] bg-[#14B8A6] text-white">
          <ClockIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Bank Session Time</p>
          <p className="text-lg font-bold text-[#1E3A8A]">42:15</p>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ title, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BulletIcon className="h-4 w-4 text-[#1E3A8A]" />
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1E3A8A]">{title}</h2>
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-600">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function OptionField({ letter, name, value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-sm font-bold text-[#1E3A8A]">
        {letter}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6]"
      />
    </div>
  )
}

function BulletIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 4v2h8V8H8Zm0 4v2h6v-2H8Z" />
    </svg>
  )
}

function ClockIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  )
}

export default AddQuestionPage
