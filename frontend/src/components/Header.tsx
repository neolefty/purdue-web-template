import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/auth'
import Button from './Button'
import { CloseIcon, ExternalLinkIcon, MenuIcon } from './icons'

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
                {isMobileMenuOpen ? (
                  <CloseIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Admin Bar */}
      {adminNavItems.length > 0 && (
        <div className="hidden md:block bg-purdue-black shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-9">
              {/* Invisible logo to match width of logo above */}
              <div className="relative">
                <img
                  src={logoSrc}
                  alt=""
                  className="h-10 w-auto opacity-0 pointer-events-none"
                  aria-hidden="true"
                />
                <span className="absolute inset-0 flex items-center justify-end text-purdue-gold font-acumin font-semibold text-sm uppercase tracking-wide">
                  Admin
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `admin-nav-link font-acumin font-semibold text-base px-3 py-1 rounded transition-colors text-purdue-dust ${
                        isActive
                          ? 'bg-purdue-dust bg-opacity-20'
                          : 'hover:bg-purdue-dust hover:bg-opacity-20'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <a
                  href="/admin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-nav-link font-acumin font-semibold text-base text-purdue-dust hover:bg-purdue-dust hover:bg-opacity-20 px-3 py-1 rounded transition-colors inline-flex items-center gap-1"
                >
                  Django Admin
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <CloseIcon className="w-6 h-6" />
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
                    `mobile-nav-link block px-6 py-3 text-base transition-colors ${
                      isActive
                        ? 'bg-purdue-black text-purdue-dust border-l-4 border-purdue-gold font-semibold'
                        : 'text-purdue-aged-dark hover:bg-purdue-gray-50 font-medium'
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
                        `mobile-nav-link block px-6 py-3 text-base transition-colors ${
                          isActive
                            ? 'bg-purdue-black text-purdue-dust border-l-4 border-purdue-gold font-semibold'
                            : 'text-purdue-aged-dark hover:bg-purdue-gray-50 font-medium'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <a
                    href="/admin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-nav-link flex items-center gap-2 px-6 py-3 text-base font-medium text-purdue-aged-dark hover:bg-purdue-gray-50 transition-colors"
                  >
                    Django Admin
                    <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                  </a>
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
