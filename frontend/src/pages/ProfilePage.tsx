import { useAuth } from '@/hooks/useAuth'
import { formatRelativeDate } from '@/utils/date'
import Card from '@/components/Card'
import Button from '@/components/Button'
import InfoList from '@/components/InfoList'
import StatusBadge from '@/components/StatusBadge'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'

interface UserActivity {
  action: string
  timestamp: string
  details?: string
}

export default function ProfilePage() {
  const { user } = useAuth()

  // Mock activity data - in a real app, this would come from an API
  const activities: UserActivity[] = [
    { action: 'Profile updated', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Email address changed' },
    { action: 'Logged in', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { action: 'Password changed', timestamp: new Date(Date.now() - 604800000).toISOString() },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="My Profile"
        action={
          <div className="flex gap-3">
            <Button href="/profile/edit" size="sm">
              Edit Profile
            </Button>
            <Button href="/profile/change-password" size="sm" variant="outline">
              Change Password
            </Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="md:col-span-2">
          <Card subtitle="User Information">
            <InfoList
              items={[
                { label: 'Full Name', value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Not set' },
                { label: 'Username', value: user?.username || '' },
                { label: 'Email', value: user?.email || '' },
                { label: 'Member Since', value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '' },
              ]}
            />
          </Card>

          {/* Recent Activity Card */}
          <Card subtitle="Recent Activity" className="mt-6">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex justify-between items-start border-b border-purdue-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="text-purdue-gray-800 font-medium">{activity.action}</p>
                    {activity.details && (
                      <p className="text-sm text-purdue-gray-600 mt-1">{activity.details}</p>
                    )}
                  </div>
                  <span className="text-sm text-purdue-gray-500">
                    {formatRelativeDate(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card subtitle="Account Status">
            <InfoList
              items={[
                {
                  label: 'Account Type',
                  value: user && 'is_staff' in user && (user as { is_staff?: boolean }).is_staff ?
                    <StatusBadge status="Admin" variant="info" /> :
                    <StatusBadge status="Regular" />
                },
                {
                  label: 'Status',
                  value: <StatusBadge status="Active" variant="success" />
                },
                {
                  label: 'Email Verified',
                  value: '✅ Verified'
                }
              ]}
            />
          </Card>

          <Card variant="highlighted">
            <div className="text-sm text-purdue-gray-600">
              <p className="font-semibold mb-2">Need Help?</p>
              <p>
                <a
                  href="https://service.purdue.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purdue-gold hover:text-purdue-gold-dark underline"
                >
                  Contact IT support
                </a>
                {' '}for assistance with your account.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
