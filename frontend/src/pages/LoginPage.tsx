import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useLogin, useRegister, LoginCredentials, RegisterData } from '@/api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, authConfig } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const login = useLogin()
  const register = useRegister()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginCredentials & RegisterData>()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = (data: LoginCredentials & RegisterData) => {
    if (isRegisterMode) {
      register.mutate(data, {
        onSuccess: () => navigate('/dashboard'),
      })
    } else {
      login.mutate({ username_or_email: data.username_or_email, password: data.password }, {
        onSuccess: () => navigate('/dashboard'),
      })
    }
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
          <h2 className="text-2xl font-heading font-bold mb-6">
            {isRegisterMode ? 'Create Account' : 'Login'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label htmlFor="username" className="label">
                    Username
                  </label>
                  <input
                    {...registerField('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters',
                      },
                    })}
                    type="text"
                    id="username"
                    autoComplete="username"
                    className="input"
                    placeholder="johndoe"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="label">
                      First Name
                    </label>
                    <input
                      {...registerField('first_name')}
                      type="text"
                      id="first_name"
                      autoComplete="given-name"
                      className="input"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="label">
                      Last Name
                    </label>
                    <input
                      {...registerField('last_name')}
                      type="text"
                      id="last_name"
                      autoComplete="family-name"
                      className="input"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </>
            )}

            {isRegisterMode ? (
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  {...registerField('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="input"
                  placeholder="john@purdue.edu"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            ) : (
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
            )}

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                {...registerField('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                type="password"
                id="password"
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {isRegisterMode && (
              <div>
                <label htmlFor="password_confirm" className="label">
                  Confirm Password
                </label>
                <input
                  {...registerField('password_confirm', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
                  })}
                  type="password"
                  id="password_confirm"
                  autoComplete="new-password"
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password_confirm && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password_confirm.message}
                  </p>
                )}
              </div>
            )}

            {(login.error || register.error) && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {(() => {
                  const error = login.error || register.error
                  if (!error) return 'An error occurred'

                  // Check if we have field-specific errors in the response
                  const errorData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
                  if (errorData && typeof errorData === 'object') {
                    // Format field-specific errors
                    const messages = Object.entries(errorData)
                      .map(([field, value]) => {
                        // Handle non_field_errors specially
                        if (field === 'non_field_errors') {
                          return Array.isArray(value) ? value.join(', ') : value
                        }
                        // For field-specific errors, make the field name user-friendly
                        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
                        const message = Array.isArray(value) ? value.join(', ') : value
                        return `${fieldName}: ${message}`
                      })
                      .join('. ')
                    return messages || error.message || 'An error occurred'
                  }

                  return error.message || 'An error occurred'
                })()}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending || register.isPending}
              className="btn-primary w-full"
            >
              {login.isPending || register.isPending
                ? 'Processing...'
                : isRegisterMode
                ? 'Create Account'
                : 'Login'}
            </button>
          </form>

          {authConfig?.allow_registration && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-sm text-purdue-gold-dark hover:text-purdue-gold"
              >
                {isRegisterMode
                  ? 'Already have an account? Login'
                  : "Don't have an account? Register"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
