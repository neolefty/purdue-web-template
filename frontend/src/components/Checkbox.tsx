/* global HTMLInputElement */
import { forwardRef, InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

/**
 * Reusable checkbox with label and optional hint text
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, hint, disabled, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`mr-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          <span className={`text-sm ${disabled ? 'text-purdue-gray-500' : 'text-purdue-gray-700'}`}>
            {label}
          </span>
        </label>
        {hint && (
          <p className="text-xs text-purdue-gray-500 mt-1 ml-6">{hint}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
