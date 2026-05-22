import api from './api'

const getActivityLogs = async () => {
  try {
    const response = await api.get('/activity', { params: { t: Date.now() } })
    return response.data.activityLogs || []
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to fetch activity logs')
  }
}

const logActivity = async (payload) => {
  try {
    const response = await api.post('/activity/log', payload)
    return response.data.activityLog
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to log activity')
  }
}

export { getActivityLogs, logActivity }
