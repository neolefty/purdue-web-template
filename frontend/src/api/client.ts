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

// Custom fetch wrapper with interceptor-like functionality
class ApiClient {
  private baseURL: string
  
  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get CSRF token from cookie
    const csrfToken = getCookie('csrftoken')
    
    // Merge default options with provided options
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        ...options.headers,
      },
      credentials: 'include', // equivalent to axios withCredentials: true
    }
    
    try {
      const response = await fetch(url, config)
      
      // Handle authentication errors
      if (response.status === 401) {
        window.location.href = '/login'
        throw new Error('Unauthorized')
      }
      
      // Unlike axios, fetch doesn't throw for HTTP error statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          response: {
            status: response.status,
            data: errorData,
          },
          message: errorData.detail || errorData.message || `HTTP ${response.status} error`,
        }
      }
      
      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T
      }
      
      return await response.json()
    } catch (error) {
      // Re-throw the error for React Query to handle
      throw error
    }
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create and export the API client instance
const apiClient = new ApiClient()

export default apiClient