import React from 'react'

type LogoProps = {
  variant?: 'gold' | 'white'
  size?: number
  spin?: boolean
  spinFast?: boolean
  /** Simplified mark (gear + "120" only) for small sizes like the admin nav / favicon. */
  markOnly?: boolean
  className?: string
  title?: string
}

// Inline SVG recreation of the 120 Customs gear mark. Colour is driven by
// `currentColor` (set via the .logo--gold / .logo--white classes) so the same
// component renders the gold or white variant, and it spins via CSS when `spin`.
export function Logo({
  variant = 'gold',
  size = 44,
  spin = false,
  spinFast = false,
  markOnly = false,
  className = '',
  title = '120 Customs',
}: LogoProps) {
  const teeth = Array.from({ length: 12 }, (_, i) => i * 30)
  const dots = Array.from({ length: 12 }, (_, i) => i * 30)

  return (
    <span
      className={`logo logo--${variant} ${className}`.trim()}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox="-7 -7 114 114"
        width={size}
        height={size}
        className={spin ? `logo-spin${spinFast ? ' logo-spin--fast' : ''}` : ''}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* gear teeth */}
        <g fill="currentColor">
          {teeth.map((deg) => (
            <rect
              key={deg}
              x="46"
              y="1.5"
              width="8"
              height="14"
              rx="1.5"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>
        {/* outer ring — transparent center in mark-only mode so it reads at tiny sizes */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill={markOnly ? 'none' : 'var(--bg, #070708)'}
          stroke="currentColor"
          strokeWidth="4"
        />

        {!markOnly && (
          <>
            {/* inner double rings */}
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.7"
            />
            {/* bolt dots */}
            <g fill="currentColor">
              {dots.map((deg) => (
                <circle key={deg} cx="50" cy="24" r="1.3" transform={`rotate(${deg} 50 50)`} />
              ))}
            </g>
          </>
        )}

        {/* wordmark — textLength forces "120" to a fixed width so it fits even when
            the brand fonts aren't loaded (e.g. inside the Payload admin). */}
        <text
          x="50"
          y={markOnly ? 60 : 52}
          textAnchor="middle"
          fontFamily="Anton, 'Roboto Mono', sans-serif"
          fontSize={markOnly ? 30 : 22}
          fontWeight={markOnly ? 700 : undefined}
          textLength={markOnly ? 46 : undefined}
          lengthAdjust="spacingAndGlyphs"
          fill="currentColor"
        >
          120
        </text>

        {!markOnly && (
          <>
            <line x1="34" y1="58" x2="66" y2="58" stroke="currentColor" strokeWidth="1.2" />
            <text
              x="50"
              y="69"
              textAnchor="middle"
              fontFamily="'Roboto Mono', monospace"
              fontWeight="700"
              fontSize="9"
              letterSpacing="1.5"
              fill="currentColor"
            >
              CUSTOMS
            </text>
            <text
              x="50"
              y="78"
              textAnchor="middle"
              fontFamily="'Roboto Mono', monospace"
              fontSize="4.5"
              letterSpacing="1.8"
              fill="currentColor"
              opacity="0.85"
            >
              EST. 2012
            </text>
          </>
        )}
      </svg>
    </span>
  )
}

export default Logo
