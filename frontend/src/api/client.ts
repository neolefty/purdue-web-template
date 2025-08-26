import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add CSRF token to requests
apiClient.interceptors.request.use((config) => {
  const csrfToken = window.__DJANGO_CONTEXT__?.csrfToken || 
    document.querySelector<HTMLMetaElement>('[name="csrf-token"]')?.content
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  
  return config
})

// Handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient