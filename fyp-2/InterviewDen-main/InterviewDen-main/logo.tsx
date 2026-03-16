export const InterviewDenLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="16" fill="url(#paint0_linear)" />
        <path d="M25 20H32V60H25V20Z" fill="white" />
        <path d="M38 20H45V60H38V20Z" fill="white" fillOpacity="0.8" />
        <path d="M51 20H58V60H51V20Z" fill="white" fillOpacity="0.6" />
        <path d="M20 32H62V39H20V32Z" fill="white" fillOpacity="0.9" />
        <path d="M20 45H62V52H20V45Z" fill="white" fillOpacity="0.7" />
        <circle cx="40" cy="40" r="12" fill="url(#paint1_radial)" fillOpacity="0.6" />
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <radialGradient
            id="paint1_radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(40 40) rotate(90) scale(16)"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
