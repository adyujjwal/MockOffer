import React from 'react';

interface MockOfferLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MockOfferLogo: React.FC<MockOfferLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-12',
    md: 'w-48 h-16', 
    lg: 'w-64 h-20',
    xl: 'w-80 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F5E862" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" opacity="0.8" />
            <stop offset="100%" stopColor="#D4AF37" opacity="0.2" />
          </linearGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background geometric elements */}
        <rect x="0" y="20" width="30" height="30" rx="4" fill="url(#accentGradient)" opacity="0.3" />
        <polygon points="290,10 310,20 300,35 285,25" fill="url(#accentGradient)" opacity="0.4" />
        
        {/* Coding brackets accent */}
        <text x="15" y="15" fontSize="16" fill="url(#logoGradient)" fontFamily="var(--font-jetbrains-mono)" opacity="0.7">{'{'}</text>
        <text x="300" y="70" fontSize="16" fill="url(#logoGradient)" fontFamily="var(--font-jetbrains-mono)" opacity="0.7">{'}'}</text>

        {/* Main logo text */}
        <g filter="url(#neonGlow)">
          <text
            x="50"
            y="45"
            fontSize="28"
            fontWeight="700"
            fill="url(#logoGradient)"
            fontFamily="var(--font-neue-haas)"
            letterSpacing="0.05em"
          >
            Mock
          </text>
          <text
            x="140"
            y="45"
            fontSize="28"
            fontWeight="300"
            fill="#F5F5F5"
            fontFamily="var(--font-neue-haas)"
            letterSpacing="0.05em"
          >
            Offer
          </text>
        </g>

        {/* Underline accent */}
        <line 
          x1="50" 
          y1="55" 
          x2="230" 
          y2="55" 
          stroke="url(#logoGradient)" 
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Binary/code dots pattern */}
        <circle cx="240" cy="35" r="2" fill="url(#logoGradient)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="250" cy="35" r="2" fill="url(#logoGradient)" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="35" r="2" fill="url(#logoGradient)" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Tagline */}
        <text
          x="50"
          y="68"
          fontSize="10"
          fill="#A0A0A0"
          fontFamily="var(--font-neue-haas)"
          letterSpacing="0.1em"
        >
          AI-POWERED CODING INTERVIEWS
        </text>
      </svg>
    </div>
  );
};