import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLogin, useResendVerification, LoginCredentials } from '@/api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, authConfig } = useAuth()

  const login = useLogin()
  const resendVerification = useResendVerification()
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = (data: LoginCredentials) => {
    setLastAttemptedEmail(data.username_or_email)
    setResendSuccess(false)
    login.mutate(data, {
      onSuccess: () => navigate('/'),
    })
  }

  const handleResendVerification = () => {
    if (!lastAttemptedEmail) return

    resendVerification.mutate(lastAttemptedEmail, {
      onSuccess: () => {
        setResendSuccess(true)
      },
    })
  }

  // Check if the error is about email verification
  const isVerificationError = () => {
    if (!login.error) return false
    const errorData = (login.error as { response?: { data?: Record<string, unknown> } })?.response
      ?.data
    if (errorData && typeof errorData === 'object') {
      const errorMessages = Object.values(errorData).flat().join(' ').toLowerCase()
      return errorMessages.includes('verify') && errorMessages.includes('email')
    }
    return false
  }

  if (authConfig?.auth_method === 'saml') {
    return (
      <div className="container-app py-12">
        <div className="max-w-md mx-auto">
          <div className="card">
            <h2 className="text-2xl font-heading font-bold mb-6">Purdue Login</h2>
            <p className="text-purdue-gray-600 mb-6">
              Please use your Purdue credentials to sign in.
            </p>
            <a
              href={authConfig.saml_login_url || '/api/auth/saml/login/'}
              className="btn-primary w-full text-center"
            >
              Login with Purdue Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-12">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-heading font-bold mb-6">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username_or_email" className="label">
                Username or Email
              </label>
              <input
                {...registerField('username_or_email', {
                  required: 'Username or email is required',
                })}
                type="text"
                id="username_or_email"
                autoComplete="username email"
                className="input"
                placeholder="johndoe or john@purdue.edu"
              />
              {errors.username_or_email && (
                <p className="text-red-500 text-sm mt-1">{errors.username_or_email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                {...registerField('password', {
                  required: 'Password is required',
                })}
                type="password"
                id="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-purdue-gold-dark hover:text-purdue-gold"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {login.error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                <div>
                  {(() => {
                    const error = login.error
                    if (!error) return 'An error occurred'

                    // Check if we have field-specific errors in the response
                    const errorData = (error as { response?: { data?: Record<string, unknown> } })
                      ?.response?.data
                    if (errorData && typeof errorData === 'object') {
                      // Format field-specific errors
                      const messages = Object.entries(errorData)
                        .map(([field, value]) => {
                          // Handle non_field_errors specially
                          if (field === 'non_field_errors') {
                            return Array.isArray(value) ? value.join(', ') : value
                          }
                          // For field-specific errors, make the field name user-friendly
                          const fieldName =
                            field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
                          const message = Array.isArray(value) ? value.join(', ') : value
                          return `${fieldName}: ${message}`
                        })
                        .join('. ')
                      return messages || error.message || 'An error occurred'
                    }

                    return error.message || 'An error occurred'
                  })()}
                </div>
                {isVerificationError() && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendVerification.isPending}
                      className="text-purdue-aged hover:text-purdue-aged-dark underline font-medium"
                    >
                      {resendVerification.isPending
                        ? 'Sending...'
                        : 'Resend verification email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                Verification email sent! Please check your inbox.
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full"
            >
              {login.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {authConfig?.allow_registration && (
            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-sm text-purdue-gold-dark hover:text-purdue-gold"
              >
                Don't have an account? Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
