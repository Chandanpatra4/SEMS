import api from './api'

const createExam = async (payload) => {
  try {
    const response = await api.post('/exams', payload)
    return response.data.exam
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to create exam')
  }
}

const getAvailableExams = async () => {
  try {
    const response = await api.get('/exams/available')
    return response.data.exams || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch available exams')
  }
}

const getTeacherExams = async () => {
  try {
    const response = await api.get('/exams')
    return response.data.exams || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch exams')
  }
}

const getExams = async () => {
  try {
    const response = await api.get('/exams')
    return response.data.exams || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch exams')
  }
}

const getExamById = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`)
    return response.data.exam
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch exam details')
  }
}

export { createExam, getAvailableExams, getExamById, getExams, getTeacherExams }
