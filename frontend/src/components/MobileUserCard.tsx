import type { UserListItem } from '@/api/users'
import StatusBadge from './StatusBadge'
import ResponsiveCard from './ResponsiveCard'

interface MobileUserCardProps {
  user: UserListItem
  currentUserId?: number
  requireEmailVerification?: boolean
  onEdit: () => void
  onToggleActive: () => void
  onToggleStaff: () => void
  onDelete: () => void
  formatLastLogin: (lastLogin: string | null) => string
}

export default function MobileUserCard({
  user,
  currentUserId,
  requireEmailVerification,
  onEdit,
  onToggleActive,
  onToggleStaff,
  onDelete,
  formatLastLogin,
}: MobileUserCardProps) {
  // Build badges array
  const badges = [
    <StatusBadge
      key="status"
      status={user.is_active ? 'Active' : 'Inactive'}
      variant={user.is_active ? 'success' : 'warning'}
    />,
  ]

  if (user.is_superuser) {
    badges.push(<StatusBadge key="role" status="Super Admin" variant="info" />)
  } else if (user.is_staff) {
    badges.push(<StatusBadge key="role" status="Staff" variant="info" />)
  } else {
    badges.push(<StatusBadge key="role" status="User" />)
  }

  // Build metadata array
  const metadata = [
    {
      label: 'Last login',
      value: (
        <span className={user.last_login ? '' : 'italic text-purdue-gray-400'}>
          {formatLastLogin(user.last_login)}
        </span>
      ),
    },
    {
      label: 'Joined',
      value: new Date(user.date_joined).toLocaleDateString(),
    },
  ]

  // Build actions array
  const actions = [
    <button
      key="edit"
      onClick={onEdit}
      className="flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-purdue-gold hover:bg-purdue-gold-dark rounded focus:outline-none focus:ring-2 focus:ring-purdue-gold"
    >
      Edit
    </button>,
    <button
      key="toggle-active"
      onClick={onToggleActive}
      disabled={user.id === currentUserId}
      className="flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-purdue-gray-700 bg-purdue-gray-100 hover:bg-purdue-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purdue-gray-400"
    >
      {user.is_active ? 'Deactivate' : 'Activate'}
    </button>,
  ]

  if (!user.is_superuser) {
    actions.push(
      <button
        key="toggle-staff"
        onClick={onToggleStaff}
        disabled={user.id === currentUserId}
        className="flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-purdue-gray-700 bg-purdue-gray-100 hover:bg-purdue-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purdue-gray-400"
      >
        {user.is_staff ? 'Remove Staff' : 'Make Staff'}
      </button>
    )
  }

  if (user.id !== currentUserId && !user.is_superuser) {
    actions.push(
      <button
        key="delete"
        onClick={onDelete}
        className="flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Delete
      </button>
    )
  }

  return (
    <ResponsiveCard badges={badges} metadata={metadata} actions={actions}>
      <h3 className="text-lg font-semibold text-purdue-gray-900">
        {user.first_name} {user.last_name}
      </h3>
      <p className="text-sm text-purdue-gray-500 mb-2">@{user.username}</p>
      <p className="text-sm text-purdue-gray-900">{user.email}</p>
      {requireEmailVerification && !user.is_email_verified && (
        <p className="text-xs text-purdue-gray-400 italic">Unverified</p>
      )}
    </ResponsiveCard>
  )
}
