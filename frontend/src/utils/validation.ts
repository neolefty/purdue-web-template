/**
 * Form validation utilities
 */

export const PASSWORD_MIN_LENGTH = 8

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
}

/**
 * Validate password meets minimum requirements
 */
export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH
}

/**
 * Validate passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword
}

/**
 * React Hook Form validation rules
 */
export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    },
  },
  username: {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters',
    },
  },
}
