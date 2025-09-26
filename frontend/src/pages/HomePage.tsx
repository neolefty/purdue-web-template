import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import Button from '@/components/Button'
import Card from '@/components/Card'
import StatCard from '@/components/StatCard'
import CodeBlock from '@/components/CodeBlock'
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

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthCheck>('/health/'),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  return (
    <div className="container-app py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl text-callout font-bold uppercase tracking-tight mb-6">
            Every giant leap starts with a web template
          </h1>
          <p className="text-xl text-purdue-gray-600 font-medium">
            A modern template for building Purdue web applications
          </p>
          <div className="mt-6 flex justify-center gap-8">
            <StatCard value="100%" label="Open Source" />
            <StatCard value="5" label="Database Options" />
            <StatCard value="2025" label="Latest Stack" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card badge="SECURITY" title="Purdue Authentication">
            <p className="text-purdue-gray-600">
              Built-in support for Purdue SAML SSO and email authentication
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              2FA Ready
            </div>
          </Card>

          <Card badge="TECHNOLOGY" title="Modern Stack">
            <p className="text-purdue-gray-600">
              Django backend with React frontend, TypeScript, and TailwindCSS
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              TypeScript First
            </div>
          </Card>

          <Card badge="DEPLOYMENT" title="Production Ready">
            <p className="text-purdue-gray-600">
              Docker support, multiple database options, and security best practices
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              CI/CD Compatible
            </div>
          </Card>
        </div>

        {/* Authenticated user sections */}
        {isAuthenticated && (
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Welcome Back */}
              <Card variant="highlighted">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-purdue-black">
                    Welcome back, {user?.first_name || user?.username}!
                  </h2>
                  <Button to="/profile" variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
                <InfoList
                  items={[
                    {
                      label: 'Account Type',
                      value: user && 'is_staff' in user && ((user as { is_staff?: boolean; is_superuser?: boolean }).is_staff || (user as { is_staff?: boolean; is_superuser?: boolean }).is_superuser) ?
                        <StatusBadge status="Admin" variant="info" /> :
                        <StatusBadge status="User" />
                    },
                    {
                      label: 'Last Login',
                      value: (() => {
                        // Mock last login - in a real app this would come from the API
                        const lastLogin = new Date(Date.now() - 7200000) // 2 hours ago
                        const now = new Date()
                        const diff = now.getTime() - lastLogin.getTime()
                        const hours = Math.floor(diff / (1000 * 60 * 60))
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

                        if (hours > 24) {
                          return `${Math.floor(hours / 24)} days ago`
                        } else if (hours > 0) {
                          return `${hours} hour${hours === 1 ? '' : 's'} ago`
                        } else if (minutes > 0) {
                          return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
                        } else {
                          return 'Just now'
                        }
                      })()
                    },
                    {
                      label: 'Member Since',
                      value: (() => {
                        if (user?.date_joined) {
                          const joined = new Date(user.date_joined)
                          const now = new Date()
                          const days = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24))
                          return `${days} days (${joined.toLocaleDateString()})`
                        }
                        return 'N/A'
                      })()
                    },
                    {
                      label: 'Recent Activity',
                      value: '3 actions today' // Mock data - would come from API
                    }
                  ]}
                />
              </Card>

              {/* System Status */}
              <Card subtitle="System Status">
                {health ? (
                  <>
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
                        { label: 'Auth Method', value: health.auth_method.toUpperCase() },
                        { label: 'Debug Mode', value: health.debug_mode ? 'Enabled' : 'Disabled' }
                      ]}
                    />
                    <div className="mt-4 pt-4 border-t border-purdue-gray-100">
                      <a
                        href="/api/swagger/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purdue-gold hover:text-purdue-gold-dark text-sm underline"
                      >
                        View API Documentation →
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-purdue-gray-500">Loading system status...</p>
                )}
              </Card>
            </div>
          </div>
        )}

        <div className="text-center">
          {!isAuthenticated && (
            <Button to="/login" variant="action">
              Get Started
            </Button>
          )}
        </div>

        <div className="mt-12 p-8 bg-white rounded-lg shadow-sm border border-purdue-gray-100">
          <h2 className="text-3xl text-headline mb-4">Why This Template?</h2>
          <p className="text-article text-purdue-gray-700 mb-4">
            Building web applications for Purdue University requires balancing modern development
            practices with institutional requirements. This template provides a foundation that has
            been carefully crafted to meet both needs.
          </p>
          <blockquote className="text-quote text-purdue-gray-600 border-l-4 border-purdue-gold pl-4 my-6">
            "A standardized approach that many developers are familiar with, reducing the learning
            curve while maintaining enterprise-grade security and scalability."
          </blockquote>
          <p className="text-article text-purdue-gray-700">
            Whether you're building a department portal, research tool, or campus-wide system,
            this template gives you a head start with authentication, database support, and
            deployment configurations already in place.
          </p>
        </div>

        <div className="mt-12 p-6 bg-purdue-gold bg-opacity-10 rounded-lg">
          <h2 className="text-2xl text-headline mb-4">
            Quick Start
          </h2>
          <CodeBlock
            code={`git clone [repository-url]
cd django-react-template
docker-compose up`}
          />
          <p className="mt-4 text-sm text-purdue-gray-600">
            Visit <span className="text-data bg-purdue-gray-100 px-2 py-1 rounded">localhost:5173</span> for the frontend
            and <span className="text-data bg-purdue-gray-100 px-2 py-1 rounded">localhost:5173/api</span> for the API
          </p>
        </div>
      </div>
    </div>
  )
}
