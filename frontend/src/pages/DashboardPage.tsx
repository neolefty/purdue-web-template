import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import Card from '@/components/Card'
import Button from '@/components/Button'
import InfoList from '@/components/InfoList'
import StatusBadge from '@/components/StatusBadge'

interface HealthCheck {
  status: string
  database: {
    connected: boolean
    engine: string
  }
  django_version: string
  python_version: string
  auth_method: string
  debug_mode: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthCheck>('/health/'),
    // Refetch every 30 seconds
    refetchInterval: 30000,
  })

  return (
    <div className="container-app py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-headline mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card subtitle="User Information">
            <InfoList
              items={[
                { label: 'Name', value: `${user?.first_name} ${user?.last_name}` },
                { label: 'Username', value: user?.username || '' },
                { label: 'Email', value: user?.email || '' },
                {
                  label: 'Member Since',
                  value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : ''
                }
              ]}
            />
          </Card>

          <Card subtitle="System Status">
            {health ? (
              <InfoList
                items={[
                  {
                    label: 'Status',
                    value: <StatusBadge
                      status={health.status}
                      variant={health.status === 'healthy' ? 'success' : 'error'}
                    />
                  },
                  {
                    label: 'Database',
                    value: (
                      <>
                        {health.database.connected ? '✅ Connected' : '❌ Disconnected'}
                        <span className="text-sm text-purdue-gray-500 ml-2">
                          ({health.database.engine.split('.').pop()})
                        </span>
                      </>
                    )
                  },
                  { label: 'Django Version', value: health.django_version },
                  { label: 'Auth Method', value: health.auth_method.toUpperCase() },
                  { label: 'Debug Mode', value: health.debug_mode ? 'Enabled' : 'Disabled' }
                ]}
              />
            ) : (
              <p className="text-purdue-gray-500">Loading system status...</p>
            )}
          </Card>
        </div>

        <div className="mt-8">
          <Card subtitle="Quick Actions">
            <div className="grid md:grid-cols-3 gap-4">
              <Button href="/profile/edit" variant="outline">
                Edit Profile
              </Button>
              <Button href="/profile/change-password" variant="outline">
                Change Password
              </Button>
              <Button href="/api/swagger/" external variant="outline">
                View API Docs
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card variant="highlighted" subtitle="Welcome to Your Dashboard">
            <p className="text-purdue-gray-600 font-united">
              This is a starting point for your Purdue web application.
              You can customize this dashboard to display relevant information for your users.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
