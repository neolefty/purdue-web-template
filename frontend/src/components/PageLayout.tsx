import { ReactNode } from 'react'
import clsx from 'clsx'

interface PageLayoutProps {
  children: ReactNode
  width?: 'default' | 'wide' | 'full'
  className?: string
}

export default function PageLayout({
  children,
  width = 'default',
  className = ''
}: PageLayoutProps) {
  const widthClasses = {
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={clsx('container-app py-12', className)}>
      <div className={clsx(widthClasses[width], 'mx-auto')}>
        {children}
      </div>
    </div>
  )
}
