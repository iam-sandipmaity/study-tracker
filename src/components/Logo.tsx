import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 16 },
    md: { container: 'w-10 h-10', icon: 20 },
    lg: { container: 'w-12 h-12', icon: 24 },
  };

  return (
    <div className={`${sizes[size].container} rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg 
        width={sizes[size].icon} 
        height={sizes[size].icon} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book shape */}
        <path 
          d="M4 7C4 6.44772 4.44772 6 5 6H10V18H5C4.44772 18 4 17.5523 4 17V7Z" 
          fill="white" 
          opacity="0.95"
        />
        <path 
          d="M14 6H19C19.5523 6 20 6.44772 20 7V17C20 17.5523 19.5523 18 19 18H14V6Z" 
          fill="white" 
          opacity="0.95"
        />
        {/* Center spine */}
        <rect x="10" y="6" width="4" height="12" fill="#F59E0B"/>
        {/* Clock overlay */}
        <circle cx="12" cy="12" r="3.5" fill="#F59E0B" stroke="white" strokeWidth="1.5"/>
        <line x1="12" y1="12" x2="12" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="12" x2="13.5" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
};
