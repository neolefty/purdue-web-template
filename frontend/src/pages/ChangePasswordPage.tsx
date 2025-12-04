/* global HTMLInputElement */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChangePassword } from '@/api/auth'
import { PASSWORD_MIN_LENGTH } from '@/utils/validation'
import { parseApiError } from '@/utils/errors'
import Card from '@/components/Card'
import Button from '@/components/Button'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'
import PasswordInput from '@/components/PasswordInput'
import FormError, { FormSuccess } from '@/components/FormError'

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
    if (formData.new_password.length < PASSWORD_MIN_LENGTH) {
      setErrors({ new_password: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` })
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
            navigate('/profile')
          }, 2000)
        },
        onError: (error: unknown) => {
          const parsedErrors = parseApiError(error)
          if (Object.keys(parsedErrors).length > 0) {
            setErrors(parsedErrors)
          } else {
            setErrors({ non_field_errors: 'An error occurred' })
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
            <FormSuccess message="Password changed successfully! Redirecting..." />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordInput
                id="old_password"
                name="old_password"
                label="Current Password"
                value={formData.old_password}
                onChange={handleChange}
                error={errors.old_password}
                required
              />

              <PasswordInput
                id="new_password"
                name="new_password"
                label="New Password"
                value={formData.new_password}
                onChange={handleChange}
                error={errors.new_password}
                showRequirements
                required
              />

              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                label="Confirm New Password"
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                required
              />

              {errors.non_field_errors && (
                <FormError error={null}>
                  {errors.non_field_errors}
                </FormError>
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
                  onClick={() => navigate('/profile')}
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
