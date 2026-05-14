import api from './api'

const createQuestion = async (payload) => {
  try {
    const response = await api.post('/questions', payload)
    return response.data.question
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to save question')
  }
}

const getQuestions = async () => {
  try {
    const response = await api.get('/questions')
    return response.data.questions || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch questions')
  }
}

export { createQuestion, getQuestions }
