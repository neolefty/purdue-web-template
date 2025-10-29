import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function TurfResearchIndexPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Turf Research System</h1>
        <p className="text-lg text-gray-600 mb-8">
          Please <Link to="/login" className="text-purdue-gold hover:underline">log in</Link> to access the turf research management system.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Turf Research Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
        <Link
          to="/turf-research/plots"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-4">
            <svg className="w-12 h-12 text-purdue-gold mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Research Plots</h2>
          </div>
          <p className="text-gray-600">
            Manage research plots with mapping, location, size, grass type, and other plot details.
          </p>
        </Link>

        <Link
          to="/turf-research/treatments"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-4">
            <svg className="w-12 h-12 text-purdue-gold mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Treatments</h2>
          </div>
          <p className="text-gray-600">
            Track water, fertilizer, chemical, and mowing treatments applied to multiple research plots.
          </p>
        </Link>

        <Link
          to="/turf-research/reports"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-4">
            <svg className="w-12 h-12 text-purdue-gold mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          </div>
          <p className="text-gray-600">
            View plot maps and treatment history with interactive reporting and visualization.
          </p>
        </Link>

        <Link
          to="/turf-research/reports/print"
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center mb-4">
            <svg className="w-12 h-12 text-purdue-gold mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Print Reports</h2>
          </div>
          <p className="text-gray-600">
            Generate printable reports with filters and export options for treatment data.
          </p>
        </Link>
      </div>

      <div className="mt-12 bg-purdue-gray-50 rounded-lg p-6 max-w-4xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Track multiple research plots with detailed information</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Record water treatments with amount, duration, and method</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Document fertilizer applications with NPK ratios and rates</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Log chemical treatments including pesticides, herbicides, and fungicides</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Record mowing treatments with height and pattern information</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Filter and search treatments by plot, type, and date</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Draw plot boundaries on Google Maps</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply treatments to multiple plots at once</span>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-purdue-gold mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Interactive reports with map visualization and treatment history</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
