import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  badge?: string
  badgeColor?: 'gold' | 'green' | 'red'
  variant?: 'default' | 'highlighted'
  className?: string
}

export default function Card({
  children,
  title,
  subtitle,
  badge,
  badgeColor = 'gold',
  variant = 'default',
  className = ''
}: CardProps) {
  const badgeColors = {
    gold: 'text-purdue-gold',
    green: 'text-green-600',
    red: 'text-red-600'
  }

  const variantClasses = {
    default: 'card',
    highlighted: 'card bg-purdue-gold bg-opacity-10 border-purdue-gold'
  }

  return (
    <div className={`${variantClasses[variant]} ${className}`.trim()}>
      {badge && (
        <span className={`text-caption ${badgeColors[badgeColor]} mb-2 block`}>
          {badge}
        </span>
      )}
      {title && (
        <h3 className="text-xl text-subhead mb-3">
          {title}
        </h3>
      )}
      {subtitle && (
        <h2 className="text-xl text-subhead mb-4">
          {subtitle}
        </h2>
      )}
      {children}
    </div>
  )
}
