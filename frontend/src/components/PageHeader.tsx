import { ReactNode } from 'react'
import clsx from 'clsx'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={clsx('flex flex-col md:flex-row md:items-center md:justify-between mb-8', className)}>
      <div>
        <h1 className="text-3xl font-bold uppercase text-headline">
          {title}
        </h1>
        {subtitle && (
          <p className="text-purdue-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 md:mt-0">
          {action}
        </div>
      )}
    </div>
  )
}
