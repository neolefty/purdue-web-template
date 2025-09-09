import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/auth'
import Button from './Button'

interface NavItem {
  to: string
  label: string
  requiresAuth?: boolean
}

interface HeaderProps {
  navItems?: NavItem[]
  logoSrc?: string
  logoAlt?: string
  logoHref?: string
}

export default function Header({
  navItems = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard', requiresAuth: true }
  ],
  logoSrc = '/purdue-logo.svg',
  logoAlt = 'Purdue University',
  logoHref = 'https://www.purdue.edu'
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
  }

  const filteredNavItems = navItems.filter(
    item => !item.requiresAuth || isAuthenticated
  )

  return (
    <nav className="bg-white border-b-2 border-purdue-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <a
              href={logoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-10 w-auto"
              />
            </a>

            <div className="hidden md:flex items-center space-x-8">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''} text-purdue-black font-acumin font-medium text-base`
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-purdue-gray-600 text-sm">
                  Welcome, {user?.first_name || user?.username}
                </span>
                <Button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  variant="secondary"
                  size="sm"
                >
                  {logout.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <Link to="/login" className="btn-secondary btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
