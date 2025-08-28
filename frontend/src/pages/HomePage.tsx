import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

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
          {/* United Sans callout for key statistics */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <span className="text-stat text-purdue-gold">100%</span>
              <span className="text-caption text-purdue-gray-600 block">Open Source</span>
            </div>
            <div className="text-center">
              <span className="text-stat text-purdue-gold">5</span>
              <span className="text-caption text-purdue-gray-600 block">Database Options</span>
            </div>
            <div className="text-center">
              <span className="text-stat text-purdue-gold">2025</span>
              <span className="text-caption text-purdue-gray-600 block">Latest Stack</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <span className="text-caption text-purdue-gold mb-2 block">SECURITY</span>
            <h3 className="text-xl text-subhead mb-3">
              Purdue Authentication
            </h3>
            <p className="text-purdue-gray-600">
              Built-in support for Purdue SAML SSO and email authentication
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              2FA Ready
            </div>
          </div>

          <div className="card">
            <span className="text-caption text-purdue-gold mb-2 block">TECHNOLOGY</span>
            <h3 className="text-xl text-subhead mb-3">
              Modern Stack
            </h3>
            <p className="text-purdue-gray-600">
              Django backend with React frontend, TypeScript, and TailwindCSS
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              TypeScript First
            </div>
          </div>

          <div className="card">
            <span className="text-caption text-purdue-gold mb-2 block">DEPLOYMENT</span>
            <h3 className="text-xl text-subhead mb-3">
              Production Ready
            </h3>
            <p className="text-purdue-gray-600">
              Docker support, multiple database options, and security best practices
            </p>
            <div className="mt-3 text-callout text-purdue-gold-dark">
              CI/CD Compatible
            </div>
          </div>
        </div>

        <div className="text-center">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary btn-action">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary btn-action">
              Get Started
            </Link>
          )}
        </div>

        {/* Source Serif Pro example - longer form content */}
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
          <pre className="bg-purdue-black text-white p-4 rounded-md overflow-x-auto font-mono">
            <code>{`git clone [repository-url]
cd django-react-template
docker-compose up`}</code>
          </pre>
          <p className="mt-4 text-sm text-purdue-gray-600">
            Visit <span className="text-data bg-purdue-gray-100 px-2 py-1 rounded">localhost:5173</span> for the frontend
            and <span className="text-data bg-purdue-gray-100 px-2 py-1 rounded">localhost:8000/api</span> for the API
          </p>
        </div>
      </div>
    </div>
  )
}
