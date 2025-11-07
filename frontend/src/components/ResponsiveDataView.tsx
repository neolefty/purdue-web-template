import { ReactNode } from 'react'
import ResponsiveCard from './ResponsiveCard'
import TableContainer from './TableContainer'
import ActionMenu from './ActionMenu'

export interface ActionConfig {
  /** Unique key for the action */
  key: string
  /** Label text for the action */
  label: string
  /** Click handler for the action */
  onClick: () => void
  /** Visual style variant */
  variant: 'primary' | 'secondary' | 'danger'
  /** Whether the action is disabled */
  disabled?: boolean
  /** Priority level - 'normal' (default) always visible in table view, 'low' goes in menu */
  priority?: 'normal' | 'low'
}

export interface ColumnConfig<T> {
  /** Unique key for the column */
  key: string
  /** Column header label */
  label: string
  /** Render function for table cell content */
  render: (item: T) => ReactNode
  /** Whether this column should be shown prominently in card view (e.g., as title) */
  primary?: boolean
  /** Whether this is a badge column (will be grouped with other badges in card view) */
  badge?: boolean
  /** CSS classes for the table header */
  headerClassName?: string
  /** CSS classes for the table cell */
  cellClassName?: string
}

export interface ResponsiveDataViewProps<T> {
  /** Array of data items to display */
  data: T[]
  /** Column configurations */
  columns: ColumnConfig<T>[]
  /** Function to extract unique key from each item */
  getItemKey: (item: T) => string | number
  /** Optional function to generate metadata for card view */
  getMetadata?: (item: T) => Array<{ label: string; value: string | ReactNode; className?: string }>
  /** Optional function to generate actions for each item */
  getActions?: (item: T) => ActionConfig[]
  /** Breakpoint for switching from cards to table (default: 'lg' = 1024px) */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
  /** Empty state message */
  emptyMessage?: string
  /** Whether data is currently loading */
  isLoading?: boolean
  /** Loading message */
  loadingMessage?: string
  /** Additional CSS classes for the container */
  className?: string
}

export default function ResponsiveDataView<T>({
  data,
  columns,
  getItemKey,
  getMetadata,
  getActions,
  breakpoint = 'lg',
  emptyMessage = 'No data available.',
  isLoading = false,
  loadingMessage = 'Loading...',
  className = '',
}: ResponsiveDataViewProps<T>) {
  // Breakpoint classes for responsive switching
  const breakpointClasses = {
    sm: { cards: 'sm:hidden', table: 'hidden sm:block' },
    md: { cards: 'md:hidden', table: 'hidden md:block' },
    lg: { cards: 'lg:hidden', table: 'hidden lg:block' },
    xl: { cards: 'xl:hidden', table: 'hidden xl:block' },
  }

  const { cards: cardsClass, table: tableClass } = breakpointClasses[breakpoint]

  // Find primary column for card view
  const primaryColumn = columns.find(col => col.primary) || columns[0]

  // Find badge columns for card view
  const badgeColumns = columns.filter(col => col.badge)

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border border-purdue-gray-100 ${className}`}>
        <p className="text-purdue-gray-500 text-center">{loadingMessage}</p>
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border border-purdue-gray-100 ${className}`}>
        <p className="text-purdue-gray-500 text-center">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Card View (Mobile/Tablet) */}
      <div className={`${cardsClass} space-y-4`}>
        {data.map((item) => {
          const badges = badgeColumns.map((col) => col.render(item))
          const metadata = getMetadata ? getMetadata(item) : []
          const actionConfigs = getActions ? getActions(item) : []

          return (
            <ResponsiveCard
              key={getItemKey(item)}
              badges={badges}
              metadata={metadata}
              actions={actionConfigs}
            >
              {primaryColumn.render(item)}
            </ResponsiveCard>
          )
        })}
      </div>

      {/* Table View (Desktop) */}
      <div className={tableClass}>
        <TableContainer isEmpty={false}>
          <table className="min-w-full divide-y divide-purdue-gray-200">
            <thead className="bg-purdue-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-purdue-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {getActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-purdue-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purdue-gray-200">
              {data.map((item) => (
                <tr key={getItemKey(item)} className="hover:bg-purdue-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.cellClassName || ''}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                  {getActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex gap-4 justify-end items-center">
                        {(() => {
                          const allActions = getActions(item)
                          // Split actions by priority (default to 'normal' if not specified)
                          const normalActions = allActions.filter(a => a.priority !== 'low')
                          const lowActions = allActions.filter(a => a.priority === 'low')

                          return (
                            <>
                              {/* Normal priority actions - stacked vertically on narrow table (lg), horizontal on wide (xl+) */}
                              <div className="flex flex-col xl:flex-row gap-2 xl:gap-4">
                                {normalActions.map((action) => {
                                  // Determine text color based on variant
                                  // primary: Modification actions (Edit, Make Public) → black
                                  // secondary: Read-only actions (View, Download, Preview) → purdue-aged
                                  // danger: Destructive actions (Delete) → red
                                  const colorClass =
                                    action.variant === 'danger'
                                      ? 'text-red-600 hover:text-red-900'
                                      : action.variant === 'primary'
                                      ? 'text-purdue-gray-900 hover:text-black'
                                      : 'text-purdue-aged hover:text-purdue-aged-dark'

                                  return (
                                    <button
                                      key={action.key}
                                      onClick={action.onClick}
                                      disabled={action.disabled}
                                      className={`${colorClass} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center h-5`}
                                    >
                                      {action.label}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Low priority actions - in menu, or spacer to maintain alignment */}
                              {lowActions.length > 0 ? (
                                <ActionMenu actions={lowActions} />
                              ) : (
                                <div className="w-5" aria-hidden="true" />
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </div>
    </div>
  )
}
