import { ReactNode } from 'react'
import clsx from 'clsx'

interface TableContainerProps {
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
  className?: string
}

export default function TableContainer({
  children,
  emptyMessage = 'No data found',
  isEmpty = false,
  className = ''
}: TableContainerProps) {
  return (
    <div className={clsx('overflow-x-auto bg-white rounded-lg shadow', className)}>
      {children}
      {isEmpty && (
        <div className="p-8 text-center text-purdue-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
