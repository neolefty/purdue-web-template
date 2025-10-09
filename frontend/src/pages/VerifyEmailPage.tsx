import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { useVerifyEmail, useResendVerification } from '@/api/auth'

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const verifyEmail = useVerifyEmail()
  const resendVerification = useResendVerification()
  const [email, setEmail] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      // Automatically verify on component mount
      verifyEmail.mutate(token, {
        onSuccess: () => {
          setSuccess(true)
          window.setTimeout(() => {
            navigate('/login')
          }, 3000)
        },
        onError: (err) => {
          const error = err as { response?: { data?: { token?: string[] } } }
          const errorMsg = error.response?.data?.token?.[0] || 'Failed to verify email. The link may be expired or invalid.'
          setError(errorMsg)
          setShowResendForm(true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendSuccess(false)

    resendVerification.mutate(email, {
      onSuccess: () => {
        setResendSuccess(true)
        setEmail('')
      },
      onError: (err) => {
        const error = err as { response?: { data?: { email?: string[] } } }
        const errorMsg = error.response?.data?.email?.[0] || 'Failed to resend verification email.'
        setError(errorMsg)
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Email Verified!</h2>
            <p className="text-purdue-gray-600 mb-4">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <p className="text-sm text-purdue-gray-500">
              Redirecting to login...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">
          {verifyEmail.isPending ? 'Verifying Email...' : 'Email Verification'}
        </h2>

        {verifyEmail.isPending && (
          <div className="text-center">
            <p className="text-purdue-gray-600">Please wait while we verify your email...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showResendForm && (
          <>
            <p className="text-purdue-gray-600 mb-4">
              Need a new verification link? Enter your email address below:
            </p>

            <form onSubmit={handleResend}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {resendSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">
                    If an account with that email exists and is unverified, a verification email has been sent.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={resendVerification.isPending}
              >
                {resendVerification.isPending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-purdue-gold hover:text-purdue-gold-dark">
                Back to Login
              </Link>
            </div>
          </>
        )}

        {!showResendForm && !verifyEmail.isPending && (
          <div className="text-center">
            <Link to="/login" className="text-purdue-gold hover:text-purdue-gold-dark">
              Back to Login
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
