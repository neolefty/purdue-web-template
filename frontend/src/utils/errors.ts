/**
 * Error handling utilities
 */

interface ApiErrorResponse {
  response?: {
    data?: Record<string, unknown>
  }
  message?: string
}

/**
 * Parse API error response into a readable format
 */
export function parseApiError(error: unknown): Record<string, string> {
  const err = error as ApiErrorResponse
  const errorData = err?.response?.data

  if (!errorData || typeof errorData !== 'object') {
    return {}
  }

  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(errorData)) {
    if (Array.isArray(value)) {
      result[key] = value.join(', ')
    } else if (typeof value === 'string') {
      result[key] = value
    } else {
      result[key] = String(value)
    }
  }
  return result
}

/**
 * Format API errors for display
 */
export function formatApiErrors(error: unknown): string {
  const err = error as ApiErrorResponse
  if (!err) return 'An error occurred'

  const errorData = err?.response?.data
  if (errorData && typeof errorData === 'object') {
    const messages = Object.entries(errorData)
      .map(([field, value]) => {
        // Handle non_field_errors specially
        if (field === 'non_field_errors') {
          return Array.isArray(value) ? value.join(', ') : String(value)
        }
        // For field-specific errors, make the field name user-friendly
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
        const message = Array.isArray(value) ? value.join(', ') : String(value)
        return `${fieldName}: ${message}`
      })
      .join('. ')
    return messages || err.message || 'An error occurred'
  }

  return err.message || 'An error occurred'
}

/**
 * Check if an error is related to email verification
 */
export function isVerificationError(error: unknown): boolean {
  if (!error) return false
  const errorData = (error as ApiErrorResponse)?.response?.data
  if (errorData && typeof errorData === 'object') {
    const errorMessages = Object.values(errorData).flat().join(' ').toLowerCase()
    return errorMessages.includes('verify') && errorMessages.includes('email')
  }
  return false
}
