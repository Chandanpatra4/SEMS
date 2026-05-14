import { useEffect, useState } from 'react'

const initialFormState = {
  name: '',
  email: '',
  role: 'student',
  password: '',
}

function UserForm({ isOpen, onClose, onSubmit, initialUser = null }) {
  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name,
        email: initialUser.email,
        role: initialUser.role.toLowerCase(),
        password: '',
      })
      return
    }

    setFormData(initialFormState)
  }, [initialUser, isOpen])

  if (!isOpen) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#0F172A]">{initialUser ? 'Edit User' : 'Add User'}</h3>
            <p className="mt-2 text-sm text-slate-500">Create academic credentials for students and teachers.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#14B8A6]"
              placeholder={initialUser ? 'Leave blank to keep current password' : 'Enter temporary password'}
              required={!initialUser}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#073B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#052d28]"
            >
              {initialUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  )
}

export default UserForm
