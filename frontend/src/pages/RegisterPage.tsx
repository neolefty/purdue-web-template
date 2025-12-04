import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useRegister, RegisterData } from '@/api/auth'
import { validationRules } from '@/utils/validation'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import FormError from '@/components/FormError'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, authConfig } = useAuth()
  const [verificationSent, setVerificationSent] = useState(false)

  const register = useRegister()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData>()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // If registration is disabled, redirect to login
  if (authConfig && !authConfig.allow_registration) {
    return <Navigate to="/login" replace />
  }

  const onSubmit = (data: RegisterData) => {
    register.mutate(data, {
      onSuccess: (response) => {
        // Check if email verification is required
        const requiresVerification = (response as { requires_verification?: boolean }).requires_verification
        if (requiresVerification) {
          setVerificationSent(true)
        } else {
          navigate('/')
        }
      },
    })
  }

  if (verificationSent) {
    return (
      <div className="container-app py-12">
        <div className="max-w-md mx-auto">
          <div className="card">
            <h2 className="text-2xl font-heading font-bold mb-6 text-green-600">
              Check Your Email
            </h2>
            <p className="text-purdue-gray-700 mb-4">
              Thank you for registering! We've sent a verification email to your email address.
            </p>
            <p className="text-purdue-gray-600 mb-6">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <Link to="/login" className="btn-primary w-full text-center block">
              Back to Login
            </Link>
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
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              {...registerField('username', validationRules.username)}
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              error={errors.username?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                {...registerField('first_name')}
                label="First Name"
                type="text"
                autoComplete="given-name"
                placeholder="John"
              />
              <FormField
                {...registerField('last_name')}
                label="Last Name"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
              />
            </div>

            <FormField
              {...registerField('email', validationRules.email)}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="john@purdue.edu"
              error={errors.email?.message}
            />

            <PasswordInput
              {...registerField('password', validationRules.password)}
              label="Password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              showRequirements
            />

            <PasswordInput
              {...registerField('password_confirm', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watch('password') || 'Passwords do not match',
              })}
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password_confirm?.message}
            />

            <FormError error={register.error} />

            <button
              type="submit"
              disabled={register.isPending}
              className="btn-primary w-full"
            >
              {register.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-purdue-gold-dark hover:text-purdue-gold"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
