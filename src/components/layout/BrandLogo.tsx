interface Props {
  className?: string
  title?: string
}

/**
 * Lumina Wealth mark: firefly (Lumina/萤火) in a focus ring above portfolio bars.
 * Inline SVG so sidebar color/size stay crisp without extra asset requests.
 */
export default function BrandLogo({ className = 'w-7 h-7', title = 'Lumina Wealth' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <radialGradient id="lw-glow" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lw-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="lw-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0b1220" />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="15.5"
        fill="none"
        stroke="#1f2937"
        strokeWidth="1"
      />
      <circle cx="32" cy="30" r="18" fill="none" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 5" />
      <circle cx="32" cy="30" r="12" fill="url(#lw-glow)" />
      <ellipse cx="32" cy="30" rx="5.5" ry="7" fill="url(#lw-body)" />
      <path d="M26.5 27.5c-4-1.5-7-0.5-8.5 2.5 3.5 1 6.5 0.5 8.5-2.5z" fill="#fde68a" fillOpacity="0.85" />
      <path d="M37.5 27.5c4-1.5 7-0.5 8.5 2.5-3.5 1-6.5 0.5-8.5-2.5z" fill="#fde68a" fillOpacity="0.85" />
      <circle cx="32" cy="24" r="2" fill="#fff7ed" />
      <rect x="20" y="46" width="6" height="8" rx="1.5" fill="url(#lw-bar)" opacity="0.9" />
      <rect x="29" y="42" width="6" height="12" rx="1.5" fill="url(#lw-bar)" />
      <rect x="38" y="38" width="6" height="16" rx="1.5" fill="url(#lw-bar)" />
    </svg>
  )
}
