import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000/api'
})

// Automatically execute secure binding injecting native intercept headers securely into endpoints
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('hostel_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

export default apiClient
