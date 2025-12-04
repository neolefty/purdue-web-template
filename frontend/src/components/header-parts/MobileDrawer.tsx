import { Link, NavLink } from 'react-router-dom'
import type { User } from '@/api/auth'
import Button from '../Button'
import { CloseIcon, ExternalLinkIcon } from '../icons'

interface NavItem {
  to: string
  label: string
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  adminNavItems: NavItem[]
  isAuthenticated: boolean
  user: User | null
  onLogout: () => void
  isLoggingOut: boolean
}

export default function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  adminNavItems,
  isAuthenticated,
  user,
  onLogout,
  isLoggingOut,
}: MobileDrawerProps) {
  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-4 border-b border-purdue-gray-200">
            <h2 className="text-lg font-bold text-purdue-black">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-purdue-black hover:text-purdue-gold focus:outline-none focus:ring-2 focus:ring-purdue-gold rounded"
              aria-label="Close menu"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Info Section */}
            {isAuthenticated && user && (
              <div className="p-4 bg-purdue-gray-50 border-b border-purdue-gray-200">
                <NavLink
                  to="/profile"
                  className="block text-purdue-black font-medium"
                >
                  {user.first_name || user.username}
                </NavLink>
                <p className="text-sm text-purdue-gray-600">{user.email}</p>
              </div>
            )}

            {/* Main Navigation */}
            <div className="py-2">
              {navItems.map((item) => (
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
                onClick={onLogout}
                disabled={isLoggingOut}
                variant="secondary"
                className="w-full"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
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
