import { ReactNode } from 'react'

interface MetadataItem {
  label: string
  value: string | ReactNode
  className?: string
}

interface ActionConfig {
  key: string
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface ResponsiveCardProps {
  /** Primary content shown on the left side */
  children: ReactNode
  /** Badges shown with primary content (top-right on wide cards) */
  badges?: ReactNode[]
  /** Metadata items shown below badges (bottom-right on wide cards) */
  metadata?: MetadataItem[]
  /** Action buttons shown at the bottom */
  actions?: ActionConfig[]
  /** Additional CSS classes for the card container */
  className?: string
}

export default function ResponsiveCard({
  children,
  badges = [],
  metadata = [],
  actions = [],
  className = '',
}: ResponsiveCardProps) {
  return (
    <div
      className={`bg-white border border-purdue-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-[500px]:flex min-[500px]:flex-col ${className}`}
    >
      {/* Main Content Area */}
      <div className={actions.length > 0 ? 'mb-4' : ''}>
        <div className="min-[500px]:flex min-[500px]:items-start min-[500px]:justify-between">
          {/* Left: Primary Content */}
          <div className="mb-3 min-[500px]:mb-0 min-[500px]:flex-1">{children}</div>

          {/* Right: Badges and Metadata (shown on wider cards) */}
          {(badges.length > 0 || metadata.length > 0) && (
            <div className="min-[500px]:text-right min-[500px]:ml-4">
              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 min-[500px]:justify-end">
                  {badges}
                </div>
              )}

              {/* Metadata */}
              {metadata.length > 0 && (
                <div className="flex flex-col gap-1 text-xs text-purdue-gray-500 min-[350px]:flex-row min-[350px]:gap-4 min-[500px]:flex-col min-[500px]:items-end">
                  {metadata.map((item, index) => (
                    <div key={index} className={item.className}>
                      <span className="font-medium">{item.label}:</span>{' '}
                      {typeof item.value === 'string' ? <span>{item.value}</span> : item.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-purdue-gray-200">
          {actions.map((action) => {
            // Determine button styling based on variant
            const buttonClass =
              action.variant === 'primary'
                ? 'flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-purdue-gold hover:bg-purdue-gold-dark rounded focus:outline-none focus:ring-2 focus:ring-purdue-gold'
                : action.variant === 'danger'
                ? 'flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500'
                : 'flex-1 min-w-[100px] px-4 py-2 text-sm font-medium text-purdue-gray-700 bg-purdue-gray-100 hover:bg-purdue-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purdue-gray-400'

            return (
              <button
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
