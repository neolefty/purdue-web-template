import React, { useState, useEffect } from 'react'
import { useCreateUser, useUpdateUser, type UserListItem, type CreateUserData } from '@/api/users'
import Button from './Button'

interface UserModalProps {
  isOpen: boolean
  onClose: (wasCreated?: boolean) => void
  user?: UserListItem | null
  mode: 'create' | 'edit'
  currentUserId?: number
}

export default function UserModal({ isOpen, onClose, user, mode, currentUserId }: UserModalProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [formData, setFormData] = useState<CreateUserData & { is_email_verified?: boolean }>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    is_email_verified: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        is_email_verified: user.is_email_verified,
      })
    } else {
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        is_email_verified: false,
      })
    }
    setErrors({})
  }, [user, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.first_name) newErrors.first_name = 'First name is required'
    if (!formData.last_name) newErrors.last_name = 'Last name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (mode === 'create') {
        await createUser.mutateAsync(formData)
        onClose(true)
      } else if (user) {
        const updateData: Partial<UserListItem> = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_active: formData.is_active,
          is_staff: formData.is_staff,
          is_superuser: formData.is_superuser,
          is_email_verified: formData.is_email_verified,
        }
        await updateUser.mutateAsync({ id: user.id, data: updateData })
        onClose()
      }
    } catch (error) {
      const err = error as { response?: { data?: Record<string, string> } }
      if (err.response?.data) {
        setErrors(err.response.data)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {mode === 'create' && (
            <div className="mt-4 p-3 bg-purdue-blue-50 border border-purdue-blue-200 rounded-md">
              <p className="text-sm text-purdue-blue-800">
                <strong>Note:</strong> The new user will receive an email with instructions to set their password.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {mode === 'edit' && user?.id === currentUserId && (
              <div className="p-3 bg-purdue-gray-50 border border-purdue-gray-300 rounded-md mb-3">
                <p className="text-sm text-purdue-gray-700">
                  <strong>Note:</strong> You cannot modify your own permissions or account status. Ask another administrator for assistance.
                </p>
              </div>
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={mode === 'edit' && user?.id === currentUserId}
                className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${mode === 'edit' && user?.id === currentUserId ? 'text-purdue-gray-500' : 'text-purdue-gray-700'}`}>
                Active Account
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                disabled={mode === 'edit' && user?.id === currentUserId}
                className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${mode === 'edit' && user?.id === currentUserId ? 'text-purdue-gray-500' : 'text-purdue-gray-700'}`}>
                Staff Status (Can access admin features)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_superuser}
                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                disabled={mode === 'edit' && user?.id === currentUserId}
                className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${mode === 'edit' && user?.id === currentUserId ? 'text-purdue-gray-500' : 'text-purdue-gray-700'}`}>
                Superuser Status (Full system access)
              </span>
            </label>

            {mode === 'edit' && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_email_verified}
                    onChange={(e) => setFormData({ ...formData, is_email_verified: e.target.checked })}
                    disabled={user?.id === currentUserId}
                    className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`text-sm ${user?.id === currentUserId ? 'text-purdue-gray-500' : 'text-purdue-gray-700'}`}>
                    Email Verified (Skip email verification requirement)
                  </span>
                </label>
                {user?.id === currentUserId && (
                  <p className="text-xs text-purdue-gray-500 mt-1 ml-6">
                    You cannot modify your own email verification status
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending || updateUser.isPending}
            >
              {createUser.isPending || updateUser.isPending ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
