import { useEffect, useMemo, useState } from 'react'

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  enrollmentId: '',
  branch: 'CSE',
  role: 'student',
  year: '1',
  status: 'Active',
}

function StudentRecordForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = '',
  initialValues = null,
  mode = 'create',
}) {
  const [formData, setFormData] = useState(initialFormState)
  const [validationError, setValidationError] = useState('')

  const academicSession = useMemo(() => {
    const year = new Date().getFullYear()
    return `${year}-${String(year + 1).slice(-2)}`
  }, [])

  useEffect(() => {
    if (!initialValues) {
      setFormData(initialFormState)
      return
    }

    setFormData({
      name: initialValues.name || '',
      email: initialValues.email || '',
      password: '',
      confirmPassword: '',
      enrollmentId: initialValues.enrollmentId || '',
      branch: initialValues.branch || 'CSE',
      role: 'student',
      year: String(initialValues.year || '1'),
      status: initialValues.status || 'Active',
    })
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setValidationError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('Please enter a valid institutional email address.')
      return
    }

    if (mode === 'create' && formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    if ((mode === 'create' || formData.password) && formData.password !== formData.confirmPassword) {
      setValidationError('Password and confirm password must match.')
      return
    }

    if (!['CSE', 'ECE', 'ME', 'CE', 'EEE'].includes(formData.branch)) {
      setValidationError('Please select a valid branch.')
      return
    }

    if (!['1', '2', '3', '4'].includes(formData.year)) {
      setValidationError('Please select a valid year.')
      return
    }

    await onSubmit({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student',
      enrollmentId: formData.enrollmentId,
      branch: formData.branch,
      year: Number(formData.year),
      status: formData.status,
    })
  }

  return (
    <div className="rounded-4xl bg-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.4)] ring-1 ring-slate-100">
      <div className="h-2 rounded-t-4xl bg-linear-to-r from-[#1E3A8A] via-[#133d8e] to-[#0A625D]" />

      <div className="px-8 py-8 sm:px-12 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1E3A8A]">
              {mode === 'edit' ? 'Edit Student Record' : 'Add New Student'}
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              {mode === 'edit'
                ? 'Update the student identity for the current academic session.'
                : 'Create a new student identity for the current academic session.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl bg-[#F4F7FB] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
            <InfoIcon className="h-4 w-4 text-[#1E3A8A]" />
            Session {academicSession}
          </div>
        </div>

        <form className="mt-10 space-y-10" onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-2">
            <Field
              label="Full Name"
              name="name"
              placeholder="e.g. Alexander Hamilton"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div>
              <Field
                label="Email Address"
                name="email"
                type="email"
                placeholder="alex.hamilton@institution.edu"
                value={formData.email}
                onChange={handleChange}
                required
                error={Boolean(validationError && validationError.toLowerCase().includes('email'))}
              />
              {validationError && validationError.toLowerCase().includes('email') ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
                  <ErrorIcon className="h-4 w-4" />
                  {validationError}
                </p>
              ) : null}
            </div>

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={mode === 'create'}
              placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'Enter temporary password'}
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={mode === 'create' || Boolean(formData.password)}
              placeholder={mode === 'edit' ? 'Re-enter new password if changed' : 'Confirm password'}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr_0.9fr]">
            <Field
              label="Enrollment ID"
              name="enrollmentId"
              placeholder="STU-2024-0082"
              value={formData.enrollmentId}
              onChange={handleChange}
              required
            />

            <SelectField
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              options={['CSE', 'ECE', 'ME', 'CE', 'EEE']}
            />

            <Field label="Role" name="role" value="Student" disabled />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <SelectField
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              options={['1', '2', '3', '4']}
            />

            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={['Active', 'Inactive']}
            />
          </div>

          {validationError && !validationError.toLowerCase().includes('email') ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {validationError}
            </div>
          ) : null}

          {submitError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-300 px-8 py-4 text-lg font-semibold text-[#1E3A8A] transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#1E3A8A] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_40px_-22px_rgba(30,58,138,0.75)] transition hover:bg-[#17306f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? mode === 'edit'
                  ? 'Updating Student...'
                  : 'Creating Student...'
                : mode === 'edit'
                  ? 'Save Student Record'
                  : 'Create Student Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-sm font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full rounded-2xl border bg-[#F8FAFC] px-5 py-4 text-xl text-slate-900 outline-none transition ${
          error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#14B8A6]'
        } ${disabled ? 'cursor-not-allowed text-slate-400' : ''}`}
      />
    </div>
  )
}

function PasswordField(props) {
  return (
    <div className="relative">
      <Field {...props} type="password" />
      <EyeIcon className="pointer-events-none absolute right-5 top-[3.45rem] h-5 w-5 text-slate-400" />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-sm font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 text-xl text-slate-900 outline-none transition focus:border-[#14B8A6]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}

function InfoIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  )
}

function ErrorIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
    </svg>
  )
}

function EyeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default StudentRecordForm
