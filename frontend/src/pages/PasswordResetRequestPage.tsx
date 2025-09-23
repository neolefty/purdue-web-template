import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import apiClient from '@/api/client'

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiClient.post('/auth/password-reset/', { email })
      setSuccess(true)
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Check Your Email</h2>
            <p className="text-purdue-gray-600 mb-6">
              If an account exists with the email address you provided, we've sent password reset instructions to your inbox.
            </p>
            <p className="text-sm text-purdue-gray-500 mb-6">
              The link will expire in 24 hours. If you don't see the email, please check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 text-purdue-gold-dark hover:text-purdue-gold"
            >
              Return to Login
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Reset Your Password</h2>
        <p className="text-purdue-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
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
              placeholder="your.email@purdue.edu"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-purdue-gold-dark hover:text-purdue-gold"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}
