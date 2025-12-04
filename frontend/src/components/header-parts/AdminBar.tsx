import { NavLink } from 'react-router-dom'
import { ExternalLinkIcon } from '../icons'

interface AdminNavItem {
  to: string
  label: string
}

interface AdminBarProps {
  adminNavItems: AdminNavItem[]
  logoSrc: string
}

export default function AdminBar({ adminNavItems, logoSrc }: AdminBarProps) {
  if (adminNavItems.length === 0) return null

  return (
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
  )
}
