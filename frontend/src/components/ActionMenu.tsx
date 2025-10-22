import { useState, useRef, useEffect } from 'react'

interface ActionMenuItem {
  key: string
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface ActionMenuProps {
  actions: ActionMenuItem[]
}

export default function ActionMenu({ actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as globalThis.HTMLElement)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Find nearest scrollable parent
  const findScrollableParent = (element: globalThis.HTMLElement | null): globalThis.HTMLElement | null => {
    if (!element) return null

    const { overflow, overflowY } = window.getComputedStyle(element)
    const isScrollable = overflow === 'auto' || overflow === 'scroll' ||
                        overflowY === 'auto' || overflowY === 'scroll'

    if (isScrollable && element.scrollHeight > element.clientHeight) {
      return element
    }

    return findScrollableParent(element.parentElement)
  }

  // Determine menu direction and position when opening
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const estimatedMenuHeight = actions.length * 40 + 16 // ~40px per item + padding

      // Find scrollable parent container
      const scrollContainer = findScrollableParent(buttonRef.current.parentElement)

      let spaceBelow: number
      let spaceAbove: number

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        spaceBelow = containerRect.bottom - buttonRect.bottom
        spaceAbove = buttonRect.top - containerRect.top
      } else {
        // Fallback to window if no scrollable parent found
        spaceBelow = window.innerHeight - buttonRect.bottom
        spaceAbove = buttonRect.top
      }

      // Determine if menu should open upward
      const shouldOpenUpward = spaceBelow < estimatedMenuHeight && spaceAbove > estimatedMenuHeight

      // Calculate fixed position
      // Position from the right edge of the button
      const rightPosition = window.innerWidth - buttonRect.right
      const topPosition = shouldOpenUpward
        ? buttonRect.top - estimatedMenuHeight - 8 // 8px margin
        : buttonRect.bottom + 8 // 8px margin

      setMenuPosition({ top: topPosition, right: rightPosition })
    }
    setIsOpen(!isOpen)
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="relative h-5" ref={menuRef}>
      {/* More button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="text-purdue-gray-700 hover:text-purdue-gray-900"
        aria-label="More actions"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>

      {/* Dropdown menu - using fixed positioning to avoid overflow clipping */}
      {isOpen && (
        <div
          className="fixed z-50 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
        >
          <div className="py-1">
            {actions.map((action) => {
              // Determine text color based on variant
              const colorClass =
                action.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : action.variant === 'primary'
                  ? 'text-purdue-gray-900 hover:bg-purdue-gray-50'
                  : 'text-purdue-aged hover:bg-purdue-gray-50'

              return (
                <button
                  key={action.key}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                  disabled={action.disabled}
                  className={`${colorClass} block w-full text-left px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
