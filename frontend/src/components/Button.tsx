import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'action' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  to?: string
  external?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  external = false,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    action: 'btn-primary btn-action',
    danger: 'btn-danger'
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'px-8 py-3 text-lg'
  }

  const buttonClasses = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}
