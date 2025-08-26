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
      <nav className="bg-purdue-black shadow-lg">
        <div className="container-app">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-purdue-gold text-2xl text-headline">
                  Purdue App
                </span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className="text-white hover:text-purdue-gold px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-purdue-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-white text-sm">
                    Welcome, {user?.first_name || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="btn-primary text-sm"
                  >
                    {logout.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm">
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
      
      <footer className="bg-purdue-black text-white py-8 mt-12">
        <div className="container-app">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Purdue University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}