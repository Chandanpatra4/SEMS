import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import TeacherRecordForm from '../../components/user/TeacherRecordForm'
import { createUser, updateUser } from '../../services/userService'

function AddTeacherPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const editingTeacher = location.state?.teacher || null
  const isEditMode = Boolean(id && editingTeacher)

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (payload) => {
    setSubmitError('')
    setIsSubmitting(true)

    try {
      if (isEditMode) {
        await updateUser(id, payload)
        navigate('/admin/dashboard', {
          replace: true,
          state: { teacherUpdated: true },
        })
      } else {
        await createUser(payload)
        navigate('/admin/dashboard', {
          replace: true,
          state: { teacherCreated: true },
        })
      }
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-2 py-3">
      <TeacherRecordForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/dashboard')}
        isSubmitting={isSubmitting}
        submitError={submitError}
        initialValues={editingTeacher}
        mode={isEditMode ? 'edit' : 'create'}
      />

      <footer className="mt-10 flex flex-col gap-4 px-2 pb-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright 2024 Academic Monolith | Faculty Information Management System</p>
        <div className="flex flex-wrap items-center gap-6 uppercase tracking-[0.22em]">
          <span>Privacy</span>
          <span>Audit Log</span>
          <span>Support</span>
        </div>
      </footer>
    </section>
  )
}

export default AddTeacherPage
