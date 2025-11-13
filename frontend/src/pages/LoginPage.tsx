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
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
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
    setResendSuccess(false)
    setShowResendForm(false)
    login.mutate(data, {
      onSuccess: () => navigate('/'),
    })
  }

  const handleResendVerification = () => {
    if (!resendEmail) return

    resendVerification.mutate(resendEmail, {
      onSuccess: () => {
        setResendSuccess(true)
        setShowResendForm(false)
        setResendEmail('')
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
                  <div className="mt-3">
                    {!showResendForm ? (
                      <button
                        type="button"
                        onClick={() => setShowResendForm(true)}
                        className="text-purdue-aged hover:text-purdue-aged-dark underline font-medium"
                      >
                        Resend verification email
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <label htmlFor="resend-email" className="block text-sm font-medium">
                          Enter your email address:
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="resend-email"
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="your.email@purdue.edu"
                            className="flex-1 px-3 py-1.5 border border-purdue-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                          />
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendVerification.isPending || !resendEmail}
                            className="px-3 py-1.5 bg-purdue-aged text-white rounded-md text-sm font-medium hover:bg-purdue-aged-dark disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendVerification.isPending ? 'Sending...' : 'Send'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowResendForm(false)
                              setResendEmail('')
                            }}
                            className="px-3 py-1.5 bg-purdue-gray-200 text-purdue-gray-700 rounded-md text-sm font-medium hover:bg-purdue-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                        {resendVerification.error && (
                          <p className="text-red-700 text-sm">
                            {(() => {
                              const error = resendVerification.error
                              const errorData = (
                                error as { response?: { data?: Record<string, unknown> } }
                              )?.response?.data
                              if (errorData && typeof errorData === 'object') {
                                const messages = Object.values(errorData)
                                  .flat()
                                  .join(', ')
                                return messages || 'Failed to send verification email'
                              }
                              return 'Failed to send verification email'
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm space-y-2">
                <p className="font-medium">If an unverified account exists with that email, we've sent a verification link.</p>
                <div className="text-xs space-y-1">
                  <p>• Check your inbox and spam folder</p>
                  <p>• If you don't receive an email, the address may already be verified or not associated with an account</p>
                  <p>• <strong>Tip:</strong> Try logging in again - if it works, your email is already verified!</p>
                </div>
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
