import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import InputField from '../../components/common/InputField'
import { loginUser } from '../../services/authService'

const getDashboardPath = (role) => {
  if (role === 'admin') {
    return '/admin/dashboard'
  }

  if (role === 'teacher') {
    return '/teacher/dashboard'
  }

  return '/student/dashboard'
}

const requestStudentCameraPermission = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera is not supported in this browser. Please use a modern browser.')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  })

  stream.getTracks().forEach((track) => track.stop())
}

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const authMessage = sessionStorage.getItem('authMessage')

    if (authMessage) {
      setError(authMessage)
      sessionStorage.removeItem('authMessage')
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await loginUser(formData)
      const { token, user } = data

      if (user.role === 'student') {
        await requestStudentCameraPermission()
        sessionStorage.setItem('cameraPermissionPrimed', 'true')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)
      localStorage.setItem('user', JSON.stringify(user))

      navigate(getDashboardPath(user.role), { replace: true })
    } catch (apiError) {
      setError(apiError.message || 'Login failed. Camera permission is required for student exams.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_55px_-30px_rgba(15,23,42,0.45)] sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A8A]">SEMS Login</h1>
        <p className="mt-2 text-sm text-slate-600">Secure Online Examination Management System</p>

        <form className="mt-8 space-y-5" aria-label="Login form" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center text-xs font-medium text-slate-500">
            Student login requests camera access in advance to prevent exam time loss.
          </p>

          <p className="text-center text-xs font-medium text-slate-500">Accounts are created by Admin only.</p>
        </form>
      </div>
    </section>
  )
}

export default Login
