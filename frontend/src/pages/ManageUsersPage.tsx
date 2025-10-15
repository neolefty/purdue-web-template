import { useState } from 'react'
import { useUsers, useUpdateUser, useDeleteUser, type UserListItem } from '@/api/users'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import UserModal from '@/components/UserModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import TableContainer from '@/components/TableContainer'
import MobileUserCard from '@/components/MobileUserCard'

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

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never logged in'
    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

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

      {isLoading ? (
        <Card>
          <p className="text-purdue-gray-500">Loading users...</p>
        </Card>
      ) : (
        <>
          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers?.length === 0 ? (
              <Card>
                <p className="text-purdue-gray-500 text-center">
                  No users found matching your search.
                </p>
              </Card>
            ) : (
              filteredUsers?.map((user) => (
                <MobileUserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUser?.id}
                  requireEmailVerification={authConfig?.require_email_verification}
                  onEdit={() => handleEditUser(user)}
                  onToggleActive={() => handleToggleActive(user)}
                  onToggleStaff={() => handleToggleStaff(user)}
                  onDelete={() => setUserToDelete(user)}
                  formatLastLogin={formatLastLogin}
                />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <TableContainer
              isEmpty={filteredUsers?.length === 0}
              emptyMessage="No users found matching your search."
            >
              <table className="min-w-full divide-y divide-purdue-gray-200">
                <thead className="bg-purdue-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purdue-gray-200">
                  {filteredUsers?.map((user) => (
                      <tr key={user.id} className="hover:bg-purdue-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-purdue-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-purdue-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-purdue-gray-900">
                              {user.email}
                            </div>
                            {authConfig?.require_email_verification && !user.is_email_verified && (
                              <div className="text-xs text-purdue-gray-400 italic">
                                Unverified
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={user.is_active ? 'Active' : 'Inactive'}
                            variant={user.is_active ? 'success' : 'warning'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex gap-2 mb-1">
                              {user.is_superuser && (
                                <StatusBadge status="Super Admin" variant="info" />
                              )}
                              {user.is_staff && !user.is_superuser && (
                                <StatusBadge status="Staff" variant="info" />
                              )}
                              {!user.is_staff && !user.is_superuser && (
                                <StatusBadge status="User" />
                              )}
                            </div>
                            <div className={`text-xs ${user.last_login ? 'text-purdue-gray-500' : 'text-purdue-gray-400 italic'}`}>
                              {formatLastLogin(user.last_login)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purdue-gray-500">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-purdue-blue-600 hover:text-purdue-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              disabled={user.id === currentUser?.id}
                              className="text-purdue-green-600 hover:text-purdue-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {!user.is_superuser && (
                              <button
                                onClick={() => handleToggleStaff(user)}
                                disabled={user.id === currentUser?.id}
                                className="text-purdue-gold-600 hover:text-purdue-gold-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                              </button>
                            )}
                            {user.id !== currentUser?.id && !user.is_superuser && (
                              <button
                                onClick={() => setUserToDelete(user)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>
          </div>
        </>
      )}

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
