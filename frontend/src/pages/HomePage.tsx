import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="container-app py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold mb-4">
            Welcome to Purdue Web Application
          </h1>
          <p className="text-xl text-purdue-gray-600">
            A modern template for building Purdue web applications
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <h3 className="text-xl font-heading font-semibold mb-2">
              Purdue Authentication
            </h3>
            <p className="text-purdue-gray-600">
              Built-in support for Purdue SAML SSO and email authentication
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-heading font-semibold mb-2">
              Modern Stack
            </h3>
            <p className="text-purdue-gray-600">
              Django backend with React frontend, TypeScript, and TailwindCSS
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-heading font-semibold mb-2">
              Production Ready
            </h3>
            <p className="text-purdue-gray-600">
              Docker support, multiple database options, and security best practices
            </p>
          </div>
        </div>
        
        <div className="text-center">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
          )}
        </div>
        
        <div className="mt-12 p-6 bg-purdue-gold bg-opacity-10 rounded-lg">
          <h2 className="text-2xl font-heading font-semibold mb-4">
            Quick Start
          </h2>
          <pre className="bg-purdue-black text-white p-4 rounded-md overflow-x-auto">
            <code>{`git clone [repository-url]
cd django-react-template
docker-compose up`}</code>
          </pre>
          <p className="mt-4 text-sm text-purdue-gray-600">
            Visit <span className="font-mono">http://localhost:5173</span> for the frontend
            and <span className="font-mono">http://localhost:8000/api</span> for the API
          </p>
        </div>
      </div>
    </div>
  )
}