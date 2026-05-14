import { useEffect, useState } from 'react'

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  employeeId: '',
  department: 'Computer Science',
  qualification: '',
  experienceYears: '0',
  status: 'Active',
}

function TeacherRecordForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = '',
  initialValues = null,
  mode = 'create',
}) {
  const [formData, setFormData] = useState(initialFormState)
  const [validationError, setValidationError] = useState('')

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
      employeeId: initialValues.employeeId || '',
      department: initialValues.department || 'Computer Science',
      qualification: initialValues.qualification || '',
      experienceYears: initialValues.experienceYears || '0',
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
      setValidationError('Please enter a valid email address.')
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

    await onSubmit({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'teacher',
      employeeId: formData.employeeId,
      department: formData.department,
      qualification: formData.qualification,
      experienceYears: Number(formData.experienceYears || 0),
      status: formData.status,
    })
  }

  return (
    <div className="rounded-[2rem] bg-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.4)] ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-8 py-8 sm:px-12 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1E3A8A]">
              {mode === 'edit' ? 'Edit Teacher' : 'Add Teacher'}
            </h1>
            <p className="mt-2 text-base text-slate-500">
              {mode === 'edit'
                ? 'Update teacher details and account credentials.'
                : 'Enter teacher details to create account.'}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#064E3B]">
            <UsersPlusIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <form className="space-y-8 px-8 py-8 sm:px-12 sm:py-10" onSubmit={handleSubmit}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Basic Information</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Field
              label="Full Name"
              name="name"
              placeholder="e.g. Dr. Jonathan Smith"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="j.smith@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
              error={Boolean(validationError && validationError.toLowerCase().includes('email'))}
            />

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
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Professional Details</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Field
              label="Employee ID"
              name="employeeId"
              placeholder="EMP-2024-001"
              value={formData.employeeId}
              onChange={handleChange}
              required
            />

            <SelectField
              label="Department / Subject"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={[
                'Computer Science',
                'Mathematics',
                'Physics',
                'Chemistry',
                'Biology',
                'English',
              ]}
            />

            <Field
              label="Qualification"
              name="qualification"
              placeholder="Ph.D. in Computer Science"
              value={formData.qualification}
              onChange={handleChange}
              required
            />

            <Field
              label="Experience in years"
              name="experienceYears"
              type="number"
              min="0"
              placeholder="0"
              value={formData.experienceYears}
              onChange={handleChange}
              required
            />

            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={['Active', 'Inactive']} />

            <Field label="Role" name="role" value="Teacher" disabled />
          </div>
        </div>

        {validationError ? (
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
            {isSubmitting ? (mode === 'edit' ? 'Updating Teacher...' : 'Creating Teacher...') : mode === 'edit' ? 'Save Teacher' : 'Create Teacher'}
          </button>
        </div>
      </form>
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
  min,
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full rounded-2xl border bg-[#F8FAFC] px-5 py-4 text-base text-slate-900 outline-none transition ${
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
      <EyeIcon className="pointer-events-none absolute right-5 top-[3.3rem] h-5 w-5 text-slate-400" />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 text-base text-slate-900 outline-none transition focus:border-[#14B8A6]"
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

function UsersPlusIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-6 1.8-6 4v2h8v-2c0-1.5.6-2.9 1.7-4A8.67 8.67 0 0 0 9 13Zm9-1V9h-2V7h-2v2h-2v3h2v2h2v-2Zm-1 3h-4a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4Z" />
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

export default TeacherRecordForm
