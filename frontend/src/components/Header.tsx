import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/auth'
import Button from './Button'
import { CloseIcon, MenuIcon } from './icons'
import { AdminBar, MobileDrawer } from './header-parts'

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

  const isAdmin = user?.is_staff || user?.is_superuser

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
    { to: '/manage/users', label: 'Manage Users' }
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
      <AdminBar adminNavItems={adminNavItems} logoSrc={logoSrc} />

      {/* Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={filteredNavItems}
        adminNavItems={adminNavItems}
        isAuthenticated={isAuthenticated}
        user={user ?? null}
        onLogout={handleLogout}
        isLoggingOut={logout.isPending}
      />
    </>
  )
}
