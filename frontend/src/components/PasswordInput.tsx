/* global HTMLInputElement */
import { forwardRef, InputHTMLAttributes, useState, ReactNode } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: string
  showRequirements?: boolean
  rightContent?: ReactNode
}

/**
 * Password input with show/hide toggle and optional requirements display
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, showRequirements = false, rightContent, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || props.name

    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={inputId} className="label">
            {label}
          </label>
          {rightContent}
        </div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`input pr-16 ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purdue-gray-500 hover:text-purdue-gray-700"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {showRequirements && !error && (
          <p className="mt-1 text-xs text-purdue-gray-500">
            Password must be at least 8 characters long
          </p>
        )}
        {hint && !error && !showRequirements && (
          <p className="mt-1 text-xs text-purdue-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
