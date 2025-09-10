import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import apiClient from '@/api/client'

export default function PasswordResetPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/auth/password-reset-confirm/', {
        uid,
        token,
        new_password: password
      })
      setSuccess(true)
      window.setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Failed to reset password. The link may be expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Password Reset Successful!</h2>
            <p className="text-purdue-gray-600">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purdue-gray-50">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Set Your Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                required
                minLength={8}
              />
            </div>
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
            {loading ? 'Setting Password...' : 'Set Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
