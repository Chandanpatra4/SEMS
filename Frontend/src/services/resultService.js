import api from './api'

const getMyResults = async () => {
  try {
    const response = await api.get('/results/my-results')
    return response.data.results || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch results')
  }
}

const getExamResults = async (examId) => {
  try {
    const response = await api.get(`/results/exam/${examId}`)
    return response.data.results || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch exam results')
  }
}

const submitExam = async (payload) => {
  try {
    const response = await api.post('/results/submit', payload)
    return response.data.result
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to submit exam')
  }
}

export { getMyResults, getExamResults, submitExam }
