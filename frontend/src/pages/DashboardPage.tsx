import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

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
  
  // Check if we're in development mode
  const isDevelopment = window.__DJANGO_CONTEXT__?.debug ?? false
  
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthCheck>('/health/').then(res => res.data),
    // Refetch every 5 seconds in dev, every 60 seconds in prod
    refetchInterval: isDevelopment ? 5000 : 60000,
  })
  
  return (
    <div className="container-app py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-heading font-semibold mb-4">User Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-purdue-gray-500">Name</dt>
                <dd className="text-lg">
                  {user?.first_name} {user?.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-purdue-gray-500">Username</dt>
                <dd className="text-lg">{user?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-purdue-gray-500">Email</dt>
                <dd className="text-lg">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-purdue-gray-500">Member Since</dt>
                <dd className="text-lg">
                  {user?.date_joined && new Date(user.date_joined).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-heading font-semibold mb-4">System Status</h2>
            {health ? (
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-purdue-gray-500">Status</dt>
                  <dd className="text-lg">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        health.status === 'healthy'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {health.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-purdue-gray-500">Database</dt>
                  <dd className="text-lg">
                    {health.database.connected ? '✅ Connected' : '❌ Disconnected'}
                    <span className="text-sm text-purdue-gray-500 ml-2">
                      ({health.database.engine.split('.').pop()})
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-purdue-gray-500">Django Version</dt>
                  <dd className="text-lg">{health.django_version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-purdue-gray-500">Auth Method</dt>
                  <dd className="text-lg uppercase">{health.auth_method}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-purdue-gray-500">Debug Mode</dt>
                  <dd className="text-lg">{health.debug_mode ? 'Enabled' : 'Disabled'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-purdue-gray-500">Loading system status...</p>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <div className="card">
            <h2 className="text-xl font-heading font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="btn-outline">
                Edit Profile
              </button>
              <button className="btn-outline">
                Change Password
              </button>
              <a href="/api/swagger/" target="_blank" rel="noopener noreferrer" className="btn-outline text-center">
                View API Docs
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="card bg-purdue-gold bg-opacity-10 border-purdue-gold">
            <h2 className="text-xl font-heading font-semibold mb-2">
              Welcome to Your Dashboard
            </h2>
            <p className="text-purdue-gray-600">
              This is a starting point for your Purdue web application. 
              You can customize this dashboard to display relevant information for your users.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}