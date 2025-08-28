import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Helper function to get cookie value by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue || null
  }
  
  return null
}

// Add CSRF token to requests
apiClient.interceptors.request.use((config) => {
  // Get CSRF token from cookie (since we're using SessionAuthentication)
  const csrfToken = getCookie('csrftoken')
  
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