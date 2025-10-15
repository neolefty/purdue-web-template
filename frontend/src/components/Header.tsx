import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if user is admin (staff or superuser)
  type UserWithStaff = { is_staff?: boolean; is_superuser?: boolean }
  const isAdmin = user && 'is_staff' in user && ((user as UserWithStaff).is_staff || (user as UserWithStaff).is_superuser)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    logout.mutate()
  }

  // Separate admin menu items from regular items
  const regularNavItems = navItems.filter(
    item => !item.requiresAuth || isAuthenticated
  )

  const adminNavItems = isAdmin ? [
    { to: '/manage/users', label: 'Manage Users', requiresAuth: true }
  ] : []

  const filteredNavItems = [...regularNavItems]

  return (
    <>
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

              {/* Desktop Navigation */}
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
                {/* Admin items on desktop */}
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''} text-purdue-black font-acumin font-medium text-base`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center space-x-4">
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

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-purdue-black hover:text-purdue-gold focus:outline-none focus:ring-2 focus:ring-purdue-gold rounded"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-4 border-b border-purdue-gray-200">
            <h2 className="text-lg font-bold text-purdue-black">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-purdue-black hover:text-purdue-gold focus:outline-none focus:ring-2 focus:ring-purdue-gold rounded"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Info Section */}
            {isAuthenticated && (
              <div className="p-4 bg-purdue-gray-50 border-b border-purdue-gray-200">
                <NavLink
                  to="/profile"
                  className="block text-purdue-black font-medium"
                >
                  {user?.first_name || user?.username}
                </NavLink>
                <p className="text-sm text-purdue-gray-600">{user?.email}</p>
              </div>
            )}

            {/* Main Navigation */}
            <div className="py-2">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-6 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-purdue-gold-light text-purdue-black border-l-4 border-purdue-gold'
                        : 'text-purdue-gray-700 hover:bg-purdue-gray-50'
                    }`
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Admin Section */}
            {adminNavItems.length > 0 && (
              <div className="border-t border-purdue-gray-200">
                <div className="px-6 py-2 bg-purdue-gray-50">
                  <p className="text-xs font-semibold text-purdue-gray-500 uppercase tracking-wider">
                    Admin Tools
                  </p>
                </div>
                <div className="py-2">
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-6 py-3 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-purdue-gold-light text-purdue-black border-l-4 border-purdue-gold'
                            : 'text-purdue-gray-700 hover:bg-purdue-gray-50'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-purdue-gray-200">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                disabled={logout.isPending}
                variant="secondary"
                className="w-full"
              >
                {logout.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            ) : (
              <Link to="/login" className="btn-primary w-full text-center block">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
