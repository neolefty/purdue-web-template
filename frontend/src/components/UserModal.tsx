import React, { useState, useEffect } from 'react'
import { useCreateUser, useUpdateUser, type UserListItem, type CreateUserData } from '@/api/users'
import Modal, { ModalBody, ModalFooter } from './Modal'
import FormField from './FormField'
import Checkbox from './Checkbox'
import Button from './Button'

interface UserModalProps {
  isOpen: boolean
  onClose: (wasCreated?: boolean) => void
  user?: UserListItem | null
  mode: 'create' | 'edit'
  currentUserId?: number
  requireEmailVerification?: boolean
}

export default function UserModal({ isOpen, onClose, user, mode, currentUserId, requireEmailVerification }: UserModalProps) {
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

  const isEditingSelf = mode === 'edit' && user?.id === currentUserId

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={mode === 'create' ? 'Create New User' : 'Edit User'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Username *"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
            />

            <FormField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            <FormField
              label="First Name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              error={errors.first_name}
            />

            <FormField
              label="Last Name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              error={errors.last_name}
            />
          </div>

          {mode === 'create' && (
            <div className="mt-4 p-3 bg-purdue-gold bg-opacity-10 border border-purdue-gold border-opacity-30 rounded-md">
              <p className="text-sm text-purdue-gray-800">
                <strong>Note:</strong> The new user will receive an email with instructions to set their password.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {isEditingSelf && (
              <div className="p-3 bg-purdue-gray-50 border border-purdue-gray-300 rounded-md mb-3">
                <p className="text-sm text-purdue-gray-700">
                  <strong>Note:</strong> You cannot modify your own permissions or account status. Ask another administrator for assistance.
                </p>
              </div>
            )}

            <Checkbox
              label="Active Account"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isEditingSelf}
            />

            <Checkbox
              label="Staff Status (Can access admin features)"
              checked={formData.is_staff}
              onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
              disabled={isEditingSelf}
            />

            <Checkbox
              label="Superuser Status (Full system access)"
              checked={formData.is_superuser}
              onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
              disabled={isEditingSelf}
            />

            {mode === 'edit' && requireEmailVerification && (
              <Checkbox
                label="Email Verified"
                checked={formData.is_email_verified}
                onChange={(e) => setFormData({ ...formData, is_email_verified: e.target.checked })}
                disabled={isEditingSelf}
                hint={isEditingSelf ? "You cannot modify your own email verification status" : undefined}
              />
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
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
        </ModalFooter>
      </form>
    </Modal>
  )
}
