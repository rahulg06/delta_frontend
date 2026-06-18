import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function DeltaClauseLogo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-7.5 h-7.5',
    md: 'w-9 h-9', // standard
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size] || 'w-9 h-9';

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }[size] || 'text-xl';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* High-Fidelity SVG of Bracket and Flame */}
      <svg
        className={`shrink-0 ${size === 'md' ? 'w-9 h-9' : size === 'sm' ? 'w-8 h-8' : size === 'xs' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'}`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Brace { (Slate charcoal gray) */}
        <path
          d="M 32 20 C 27 20 27 34 27 40 C 27 46 21 48 16 50 C 21 52 27 54 27 60 C 27 66 27 80 32 80"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#475569] dark:text-[#94a3b8]"
        />
        
        {/* Blue Flame Gradients */}
        <defs>
          <linearGradient id="flameGradPrimary" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="flameGradCore" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Flame Flame Path shape */}
        <path
          d="M 50 82 C 43 82 31 72 31 54 C 31 34 43 24 50 14 C 50 14 47 30 43 36 C 39 42 38 46 38 54 C 38 65 44 71 50 71 C 56 71 62 65 62 54 C 62 46 61 42 57 36 C 53 30 50 14 50 14 C 57 24 69 34 69 54 C 69 72 57 82 50 82 Z"
          fill="url(#flameGradPrimary)"
        />

        {/* Flame Inner light core */}
        <path
          d="M 50 75 C 46 75 39 69 39 57 C 39 45 46 39 50 31 C 47 39 45 42 45 47 C 45 54 47 60 50 60 C 53 60 55 54 55 47 C 55 42 53 39 50 31 C 54 39 61 45 61 57 C 61 69 54 75 50 75 Z"
          fill="url(#flameGradCore)"
        />

        {/* Right Brace } (Slate charcoal gray) */}
        <path
          d="M 68 20 C 73 20 73 34 73 40 C 73 46 79 48 84 50 C 79 52 73 54 73 60 C 73 66 73 80 68 80"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#475569] dark:text-[#94a3b8]"
        />
      </svg>

      {showText && (
        <span className={`font-sans tracking-tight font-extrabold ${textSizes} hidden min-[365px]:flex items-center`}>
          <span className="text-slate-805 dark:text-white font-extrabold font-semibold">Delta</span>
          <span className="text-blue-550 dark:text-[#3b82f6] font-bold">Clause</span>
        </span>
      )}
    </div>
  );
}
