import api from './api'

const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
}

const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)

    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to login')
  }
}

const logoutUser = async () => {
  try {
    await api.post('/auth/logout')
  } finally {
    clearAuthStorage()
  }
}

export { clearAuthStorage, loginUser, logoutUser }
