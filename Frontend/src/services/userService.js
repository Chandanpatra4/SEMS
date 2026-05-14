import api from './api'

const getUsers = async () => {
  try {
    const response = await api.get('/users')
    return response.data.users
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch users')
  }
}

const createUser = async (payload) => {
  try {
    const response = await api.post('/users', payload)
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to create user')
  }
}

const updateUser = async (id, payload) => {
  try {
    const response = await api.put(`/users/${id}`, payload)
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to update user')
  }
}

const deleteUser = async (id) => {
  try {
    await api.delete(`/users/${id}`)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to delete user')
  }
}

export { getUsers, createUser, updateUser, deleteUser }
