import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions } from '../../services/questionService'
import { createExam } from '../../services/examService'

const branches = ['CSE', 'ECE', 'ME', 'CE', 'EEE']
const years = [1, 2, 3, 4]

const initialFormState = {
  title: '',
  subject: '',
  branch: 'CSE',
  year: '1',
  totalMarks: '20',
  duration: '60',
  startTime: '',
  endTime: '',
}

function CreateExamPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormState)
  const [subjectOptions, setSubjectOptions] = useState([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoadingSubjects(true)

      try {
        const questions = await getQuestions()
        const uniqueSubjects = Array.from(
          new Set(
            questions
              .map((question) => question.subject?.trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b))

        setSubjectOptions(uniqueSubjects)
        if (!formData.subject && uniqueSubjects.length > 0) {
          setFormData((prev) => ({
            ...prev,
            subject: uniqueSubjects[0],
          }))
        }
      } catch {
        setSubjectOptions([])
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    loadSubjects()
  }, [])

  useEffect(() => {
    if (!formData.startTime) {
      setFormData((prev) => ({
        ...prev,
        endTime: '',
      }))
      return
    }

    const durationMinutes = Number(formData.duration)

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setFormData((prev) => ({
        ...prev,
        endTime: '',
      }))
      return
    }

    const startDate = new Date(formData.startTime)

    if (Number.isNaN(startDate.getTime())) {
      return
    }

    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    const autoEndTime = toDateTimeLocal(endDate)

    setFormData((prev) => {
      if (prev.endTime === autoEndTime) {
        return prev
      }

      return {
        ...prev,
        endTime: autoEndTime,
      }
    })
  }, [formData.startTime, formData.duration])

  const minEndTime = useMemo(() => formData.startTime || '', [formData.startTime])

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
    setSubmitSuccess('')

    if (!formData.title.trim() || !formData.subject || !formData.startTime || !formData.endTime) {
      setSubmitError('Please fill title, subject, start time, and end time.')
      return
    }

    setIsSubmitting(true)

    try {
      await createExam({
        title: formData.title.trim(),
        subject: formData.subject,
        totalMarks: Number(formData.totalMarks),
        duration: Number(formData.duration),
        branch: formData.branch,
        year: Number(formData.year),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      })

      setSubmitSuccess('Exam created successfully and saved to the database.')
      setFormData((prev) => ({
        ...initialFormState,
        subject: prev.subject,
      }))

      setTimeout(() => {
        navigate('/teacher/dashboard', { replace: true, state: { examCreated: true } })
      }, 900)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-2 py-3">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-[#0B278A]">Create Exam</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure exam details. Questions are selected automatically based on subject and total marks.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] sm:p-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0B278A]">Basic Details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Exam Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Mid-Term Assessment" />
              <SelectField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                options={subjectOptions}
                disabled={isLoadingSubjects || subjectOptions.length === 0}
                emptyLabel={isLoadingSubjects ? 'Loading subjects...' : 'No subject found'}
              />
              <SelectField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                options={branches}
              />
              <SelectField
                label="Academic Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                options={years.map(String)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#0B278A]">Marks and Duration</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Total Marks"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                type="number"
                min="1"
              />
              <Field
                label="Duration (Minutes)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                type="number"
                min="1"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Questions are auto-selected from the question bank to match total marks.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#0B278A]">Schedule</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Start Date and Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
              />
              <Field
                label="End Date and Time"
                name="endTime"
                type="datetime-local"
                min={minEndTime}
                value={formData.endTime}
                onChange={handleChange}
                readOnly
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">End time is auto-calculated from start time and duration.</p>
          </div>
        </div>

        {submitError ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{submitError}</p>
        ) : null}

        {submitSuccess ? (
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {submitSuccess}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-[#0B278A] transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingSubjects || subjectOptions.length === 0}
            className="rounded-xl bg-[#0B278A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1538a3] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Field({ label, name, value, onChange, placeholder, type = 'text', min = '', readOnly = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        min={min}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6] read-only:cursor-not-allowed read-only:bg-slate-100"
      />
    </label>
  )
}

function toDateTimeLocal(dateValue) {
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  const hours = String(dateValue.getHours()).padStart(2, '0')
  const minutes = String(dateValue.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function SelectField({ label, name, value, onChange, options, disabled = false, emptyLabel = 'No options' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#14B8A6] disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.length === 0 ? <option>{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CreateExamPage
