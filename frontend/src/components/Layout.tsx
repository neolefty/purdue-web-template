import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/api/auth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth()
  const logout = useLogout()
  
  const handleLogout = () => {
    logout.mutate()
  }
  
  return (
    <div className="min-h-screen bg-purdue-gray-50">
      <nav className="bg-white border-b-2 border-purdue-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              {/* Purdue Logo */}
              <a 
                href="https://www.purdue.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src="/purdue-logo.svg" 
                  alt="Purdue University" 
                  className="h-10 w-auto"
                />
              </a>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  to="/" 
                  className="nav-link text-purdue-black font-acumin font-medium text-base"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/dashboard" 
                    className="nav-link text-purdue-black font-acumin font-medium text-base"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <span className="text-purdue-gray-600 text-sm">
                    Welcome, {user?.first_name || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="btn-secondary btn-sm"
                  >
                    {logout.isPending ? 'Logging out...' : 'Logout'}
                  </button>
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
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-purdue-black text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <img 
                src="/purdue-logo-vertical.svg" 
                alt="Purdue University" 
                className="h-24 w-auto"
              />
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-sm text-purdue-gray-300">
                © {new Date().getFullYear()} Purdue University. All rights reserved.
              </p>
              <p className="text-xs text-purdue-gray-400 mt-1">
                An equal access/equal opportunity university
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}