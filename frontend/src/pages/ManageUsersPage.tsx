import { useState } from 'react'
import { useUsers, useUpdateUser, useDeleteUser, type UserListItem } from '@/api/users'
import { useAuth } from '@/hooks/useAuth'
import { formatTimeAgo } from '@/utils/date'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import UserModal from '@/components/UserModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import ResponsiveDataView, { type ColumnConfig, type ActionConfig } from '@/components/ResponsiveDataView'

export default function ManageUsersPage() {
  const { user: currentUser, authConfig } = useAuth()
  const { data: usersResponse, isLoading, error } = useUsers()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null)

  // Ensure users is always an array
  const users = Array.isArray(usersResponse) ? usersResponse : []

  // Check if current user is admin
  const isAdmin = currentUser && 'is_staff' in currentUser && (currentUser as { is_staff?: boolean }).is_staff

  if (!isAdmin) {
    return (
      <PageLayout>
        <Card>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You must be an administrator to access this page.</p>
        </Card>
      </PageLayout>
    )
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleActive = (user: UserListItem) => {
    updateUser.mutate({
      id: user.id,
      data: { is_active: !user.is_active }
    })
  }

  const handleToggleStaff = (user: UserListItem) => {
    updateUser.mutate({
      id: user.id,
      data: { is_staff: !user.is_staff }
    })
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalMode('create')
    setModalOpen(true)
    setSuccessMessage('')
  }

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeleteUser = async () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id)
      setUserToDelete(null)
    }
  }

  if (error) {
    return (
      <PageLayout>
        <Card>
          <p className="text-red-600">Error loading users. Please try again later.</p>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Manage Users"
        action={
          <Button onClick={handleCreateUser} variant="primary">
            Add New User
          </Button>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <Card className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search users..."
          rightContent={
            <div className="text-sm text-purdue-gray-600">
              Total users: {users.length}
            </div>
          }
        />
      </Card>

      <ResponsiveDataView
        data={filteredUsers}
        columns={[
          {
            key: 'user',
            label: 'User',
            primary: true,
            render: (user) => (
              <div>
                <div className="text-sm font-medium text-purdue-gray-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-purdue-gray-500">
                  @{user.username}
                </div>
              </div>
            ),
            cellClassName: 'whitespace-nowrap',
          },
          {
            key: 'email',
            label: 'Email',
            render: (user) => (
              <div>
                <div className="text-sm text-purdue-gray-900">{user.email}</div>
                {authConfig?.require_email_verification && !user.is_email_verified && (
                  <div className="text-xs text-purdue-gray-400 italic">Unverified</div>
                )}
              </div>
            ),
            cellClassName: 'whitespace-nowrap',
          },
          {
            key: 'status',
            label: 'Status',
            badge: true,
            render: (user) => (
              <StatusBadge
                key="status"
                status={user.is_active ? 'Active' : 'Inactive'}
                variant={user.is_active ? 'success' : 'warning'}
              />
            ),
            cellClassName: 'whitespace-nowrap',
          },
          {
            key: 'role',
            label: 'Role',
            badge: true,
            render: (user) => {
              if (user.is_superuser) {
                return <StatusBadge key="role" status="Super Admin" variant="info" />
              }
              if (user.is_staff) {
                return <StatusBadge key="role" status="Staff" variant="info" />
              }
              return <StatusBadge key="role" status="User" />
            },
            cellClassName: 'whitespace-nowrap',
          },
          {
            key: 'joined',
            label: 'Joined',
            render: (user) => (
              <span className="text-sm text-purdue-gray-500">
                {new Date(user.date_joined).toLocaleDateString()}
              </span>
            ),
            cellClassName: 'whitespace-nowrap',
          },
        ] as ColumnConfig<UserListItem>[]}
        getItemKey={(user) => user.id}
        getMetadata={(user) => [
          {
            label: 'Last login',
            value: (
              <span className={user.last_login ? '' : 'italic text-purdue-gray-400'}>
                {user.last_login ? formatTimeAgo(user.last_login) : 'Never logged in'}
              </span>
            ),
          },
          {
            label: 'Joined',
            value: new Date(user.date_joined).toLocaleDateString(),
          },
        ]}
        getActions={(user) => {
          const actions: ActionConfig[] = [
            {
              key: 'edit',
              label: 'Edit',
              onClick: () => handleEditUser(user),
              variant: 'primary',
            },
            {
              key: 'toggle-active',
              label: user.is_active ? 'Deactivate' : 'Activate',
              onClick: () => handleToggleActive(user),
              variant: 'secondary',
              disabled: user.id === currentUser?.id,
              priority: 'low',
            },
          ]

          if (!user.is_superuser) {
            actions.push({
              key: 'toggle-staff',
              label: user.is_staff ? 'Remove Staff' : 'Make Staff',
              onClick: () => handleToggleStaff(user),
              variant: 'secondary',
              disabled: user.id === currentUser?.id,
              priority: 'low',
            })
          }

          if (user.id !== currentUser?.id && !user.is_superuser) {
            actions.push({
              key: 'delete',
              label: 'Delete',
              onClick: () => setUserToDelete(user),
              variant: 'danger',
              priority: 'low',
            })
          }

          return actions
        }}
        breakpoint="lg"
        emptyMessage="No users found matching your search."
        isLoading={isLoading}
        loadingMessage="Loading users..."
      />

      <UserModal
        isOpen={modalOpen}
        onClose={(wasCreated?: boolean) => {
          setModalOpen(false)
          if (modalMode === 'create' && wasCreated) {
            setSuccessMessage('User created successfully. A password reset email has been sent.')
            window.setTimeout(() => setSuccessMessage(''), 5000)
          }
        }}
        user={selectedUser}
        mode={modalMode}
        currentUserId={currentUser?.id}
        requireEmailVerification={authConfig?.require_email_verification}
      />

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.username}?`}
        details={
          userToDelete && (
            <div className="p-3 bg-purdue-gray-50 rounded">
              <p className="text-sm font-medium text-purdue-gray-900">
                {userToDelete.first_name} {userToDelete.last_name}
              </p>
              <p className="text-xs text-purdue-gray-600 mt-1">
                {userToDelete.email}
              </p>
            </div>
          )
        }
        confirmText={deleteUser.isPending ? 'Deleting...' : 'Delete User'}
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteUser.isPending}
      />
    </PageLayout>
  )
}
