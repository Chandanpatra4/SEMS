import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

const requestCount = async (path, listKey, fallbackFilter) => {
  try {
    const response = await axios.get(`${baseURL}${path}`, {
      headers: getAuthHeaders(),
    })

    if (typeof response.data?.count === 'number') {
      if (fallbackFilter && Array.isArray(response.data?.[listKey])) {
        return response.data[listKey].filter(fallbackFilter).length
      }

      return response.data.count
    }

    const list = Array.isArray(response.data?.[listKey]) ? response.data[listKey] : []
    return fallbackFilter ? list.filter(fallbackFilter).length : list.length
  } catch {
    return 0
  }
}

const getStudentCount = async () => requestCount('/users?role=student', 'users', (user) => user.role === 'student')

const getTeacherCount = async () => requestCount('/users?role=teacher', 'users', (user) => user.role === 'teacher')

const getQuestionCount = async () => requestCount('/questions', 'questions')

const getExamCount = async () => requestCount('/exams', 'exams')

export { getStudentCount, getTeacherCount, getQuestionCount, getExamCount }
