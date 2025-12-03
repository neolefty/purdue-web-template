interface IconProps {
  className?: string
}

export default function CloseIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
