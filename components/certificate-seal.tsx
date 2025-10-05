interface CertificateSealProps {
  size?: number
  className?: string
}

export default function CertificateSeal({ size = 140, className = "" }: CertificateSealProps) {
  return (
    <div className={`inline-block ${className}`}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="60" cy="60" r="58" fill="#0d2340" stroke="#a37e37" strokeWidth="2" />

        {/* Inner decorative circle */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="#a37e37" strokeWidth="1" strokeDasharray="2 2" />

        {/* Center circle background */}
        <circle cx="60" cy="60" r="42" fill="#a37e37" />

        {/* Inner circle */}
        <circle cx="60" cy="60" r="40" fill="#0d2340" />

        {/* Decorative stars */}
        <g fill="#a37e37">
          {/* Top star */}
          <polygon points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31" transform="translate(0, 5)" />

          {/* Bottom star */}
          <polygon
            points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
            transform="translate(0, 45) rotate(180 60 35)"
          />

          {/* Left star */}
          <polygon
            points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
            transform="translate(-25, 25) rotate(270 60 35)"
          />

          {/* Right star */}
          <polygon
            points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
            transform="translate(25, 25) rotate(90 60 35)"
          />
        </g>

        {/* Text */}
        <text x="60" y="55" textAnchor="middle" fill="#a37e37" fontSize="11" fontWeight="bold" fontFamily="serif">
          GSPA
        </text>

        <text x="60" y="70" textAnchor="middle" fill="#a37e37" fontSize="9" fontWeight="bold" fontFamily="serif">
          CERTIFIED
        </text>

        {/* Decorative ribbon elements */}
        <path d="M35 85 L45 80 L55 85 L45 90 Z" fill="#a37e37" />
        <path d="M65 85 L75 80 L85 85 L75 90 Z" fill="#a37e37" />
      </svg>
    </div>
  )
}
