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
    { to: '/', label: 'Home' }
  ],
  logoSrc = '/purdue-logo.svg',
  logoAlt = 'Purdue University',
  logoHref = 'https://www.purdue.edu'
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth()
  const logout = useLogout()

  // Check if user is admin (staff or superuser)
  type UserWithStaff = { is_staff?: boolean; is_superuser?: boolean }
  const isAdmin = user && 'is_staff' in user && ((user as UserWithStaff).is_staff || (user as UserWithStaff).is_superuser)

  const handleLogout = () => {
    logout.mutate()
  }

  // Add admin menu items if user is admin
  const allNavItems = [...navItems]
  if (isAdmin) {
    allNavItems.push({ to: '/manage/users', label: 'Manage Users', requiresAuth: true })
  }

  const filteredNavItems = allNavItems.filter(
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

          <div className="flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''} text-purdue-black font-acumin font-medium text-base`
                  }
                >
                  Welcome, {user?.first_name || user?.username}
                </NavLink>
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
