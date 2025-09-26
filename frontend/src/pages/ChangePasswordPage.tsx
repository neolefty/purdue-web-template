/* global HTMLInputElement */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChangePassword } from '@/api/auth'
import Card from '@/components/Card'
import Button from '@/components/Button'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const changePassword = useChangePassword()

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' })
      return
    }

    // Validate password strength
    if (formData.new_password.length < 8) {
      setErrors({ new_password: 'Password must be at least 8 characters long' })
      return
    }

    changePassword.mutate(
      {
        old_password: formData.old_password,
        new_password: formData.new_password,
      },
      {
        onSuccess: () => {
          setSuccess(true)
          window.setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: string | Record<string, string> } }
          if (err.response?.data) {
            if (typeof err.response.data === 'string') {
              setErrors({ non_field_errors: err.response.data })
            } else {
              setErrors(err.response.data)
            }
          }
        }
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <PageLayout width="default">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Change Password" />

        <Card>
          {success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">Password changed successfully! Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-purdue-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="old_password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                />
                {errors.old_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.old_password}</p>
                )}
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-purdue-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
                <p className="mt-1 text-xs text-purdue-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-purdue-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>

              {errors.non_field_errors && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.non_field_errors}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}
