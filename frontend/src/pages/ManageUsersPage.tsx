import { useState } from 'react'
import { useUsers, useUpdateUser, type UserListItem } from '@/api/users'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth()
  const { data: usersResponse, isLoading, error } = useUsers()
  const updateUser = useUpdateUser()
  const [searchTerm, setSearchTerm] = useState('')

  // Ensure users is always an array
  const users = Array.isArray(usersResponse) ? usersResponse : []

  // Check if current user is admin
  const isAdmin = currentUser && 'is_staff' in currentUser && (currentUser as { is_staff?: boolean }).is_staff

  if (!isAdmin) {
    return (
      <div className="container-app py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You must be an administrator to access this page.</p>
          </Card>
        </div>
      </div>
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

  if (error) {
    return (
      <div className="container-app py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <p className="text-red-600">Error loading users. Please try again later.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-headline mb-8">Manage Users</h1>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
              />
            </div>
            <div className="text-sm text-purdue-gray-600">
              Total users: {users.length}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card>
            <p className="text-purdue-gray-500">Loading users...</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purdue-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={user.is_active ? 'Active' : 'Inactive'}
                        variant={user.is_active ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purdue-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUser?.id}
                          className="text-purdue-blue-600 hover:text-purdue-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers?.length === 0 && (
              <div className="p-8 text-center text-purdue-gray-500">
                No users found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
