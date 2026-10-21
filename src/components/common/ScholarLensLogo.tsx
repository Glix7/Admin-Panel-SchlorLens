import React, { useState } from 'react';

export interface LogoProps {
  variant?: 'full' | 'emblem';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  withText?: boolean;
  showTagline?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
  alt?: string;
}

export const ScholarLensLogo: React.FC<LogoProps> = ({
  variant = 'emblem',
  size = 'md',
  withText = false,
  showTagline = false,
  theme = 'dark',
  className = '',
  onClick,
  alt = 'Scholar Lens',
}) => {
  const [imgError, setImgError] = useState(false);

  const getPixelHeight = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 40;
    }
  };

  const px = getPixelHeight();

  // Paths to primary official assets
  const fullLogoSrc =
    theme === 'light'
      ? '/assets/branding/scholar-lens-logo-light.png'
      : '/assets/branding/scholar-lens-logo-dark.png';

  const emblemSrc =
    theme === 'light'
      ? '/assets/branding/scholar-lens-emblem-light.png'
      : '/assets/branding/scholar-lens-emblem-dark.png';

  const [attemptedFallback, setAttemptedFallback] = useState(false);

  // 1. Full Horizontal Logo Mode
  if (variant === 'full') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center select-none ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        {!imgError ? (
          <img
            src={
              attemptedFallback
                ? '/assets/aistudio/Scholar_Lens__Neon_Academic_Emblem_4f4648e3.png'
                : fullLogoSrc
            }
            alt={alt}
            onError={() => {
              if (!attemptedFallback) {
                setAttemptedFallback(true);
              } else {
                setImgError(true);
              }
            }}
            style={{ height: `${px}px`, width: 'auto', maxHeight: '100%' }}
            className="object-contain block transition-transform duration-200 hover:scale-[1.02]"
            loading="eager"
          />
        ) : (
          // Vector / Typography Fallback if PNG asset is unavailable
          <div className="flex items-center gap-2.5">
            <div
              style={{ width: `${px}px`, height: `${px}px` }}
              className="rounded-xl bg-gradient-to-br from-[#061426] to-[#0b2847] border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold shadow-sm"
            >
              SL
            </div>
            <span
              className={`font-sans font-extrabold tracking-tight ${
                theme === 'light' ? 'text-[#061426]' : 'text-white'
              }`}
              style={{ fontSize: `${Math.round(px * 0.45)}px` }}
            >
              Scholar <span className="text-[#10b981]">Lens</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. Standalone Emblem (with optional companion text lockup)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Emblem Graphic */}
      <div
        style={{ width: `${px}px`, height: `${px}px` }}
        className="shrink-0 relative flex items-center justify-center"
      >
        {!imgError ? (
          <img
            src={emblemSrc}
            alt={alt}
            onError={() => setImgError(true)}
            style={{ width: `${px}px`, height: `${px}px` }}
            className="w-full h-full object-contain rounded-lg drop-shadow-sm transition-transform duration-200 hover:scale-105"
            loading="eager"
          />
        ) : (
          <div
            style={{ width: `${px}px`, height: `${px}px` }}
            className={`rounded-xl flex items-center justify-center font-bold text-xs ${
              theme === 'light'
                ? 'bg-slate-100 text-emerald-700 border border-slate-300'
                : 'bg-[#061426] text-emerald-400 border border-emerald-600/30'
            }`}
          >
            SL
          </div>
        )}
      </div>

      {/* Accompanying Wordmark & Tagline (if requested) */}
      {withText && (
        <div className="flex flex-col justify-center leading-tight">
          <div
            className={`font-bold tracking-tight font-sans transition-colors ${
              theme === 'light' ? 'text-[#061426]' : 'text-white'
            }`}
            style={{ fontSize: `${Math.max(14, Math.round(px * 0.44))}px` }}
          >
            Scholar <span className="text-[#10b981] font-extrabold">Lens</span>
          </div>
          {showTagline && (
            <div
              className={`font-mono uppercase tracking-widest text-[9px] mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-emerald-400/80'
              }`}
            >
              Academic Intelligence
            </div>
          )}
        </div>
      )}
    </div>
  );
};
