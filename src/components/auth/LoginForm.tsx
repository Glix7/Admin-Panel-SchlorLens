import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedPixelCanvas } from './AnimatedPixelCanvas';
import { ScholarLensLogo } from '../common/ScholarLensLogo';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function formatAuthError(err: unknown): string {
  if (!err) {
    return 'Invalid institutional credentials. Verify email and password.';
  }

  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed && trimmed !== '[object Object]') {
      return trimmed;
    }
    return 'Invalid institutional credentials. Verify email and password.';
  }

  if (typeof err === 'object') {
    const anyErr = err as any;

    if (typeof anyErr.message === 'string') {
      const msg = anyErr.message.trim();
      if (msg && msg !== '[object Object]') {
        return msg;
      }
    }

    if (typeof anyErr.error === 'string') {
      const msg = anyErr.error.trim();
      if (msg && msg !== '[object Object]') {
        return msg;
      }
    }

    if (anyErr.error && typeof anyErr.error === 'object') {
      if (typeof anyErr.error.message === 'string' && anyErr.error.message.trim()) {
        return anyErr.error.message.trim();
      }
      if (typeof anyErr.error.code === 'string' && anyErr.error.code.trim()) {
        return `Server error (${anyErr.error.code.trim()}). Please try again.`;
      }
    }

    if (typeof anyErr.detail === 'string' && anyErr.detail.trim()) {
      return anyErr.detail.trim();
    }
  }

  return 'Invalid institutional credentials. Verify email and password.';
}

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedEmail, password);
      // On success, AuthContext updates isAuthenticated -> App.tsx redirects to Dashboard
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-[#020d06] font-sans selection:bg-[#10b981] selection:text-white box-border md:h-screen md:h-[100dvh] md:overflow-hidden overflow-x-hidden">
      {/* =========================================================================
          LEFT / TOP PANEL: Dark forest-green & black background, animated pixel canvas,
          Scholar Lens brand.
          - Mobile (320px–767px): Sleek, compact top branding header bar with animated canvas.
          - Tablet & Desktop (768px+): Full split-screen hero panel with animated canvas,
            atmospheric glow, tagline, and footer note.
         ========================================================================= */}
      <section className="relative w-full flex flex-col justify-between overflow-hidden bg-[#020d06] text-white select-none shrink-0 border-b border-emerald-950/60 md:border-b-0 md:border-r md:h-full p-4 sm:p-5 md:p-8 lg:p-12 xl:p-14">
        {/* Animated Canvas Layer */}
        <div className="absolute inset-0 z-0">
          <AnimatedPixelCanvas />
        </div>

        {/* Ambient Dark Forest Overlay for deep visual contrast */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-[#020d06] via-transparent to-[#020d06]/75" />

        {/* Floating Accent Pixels (tablet & desktop) */}
        <div
          className="hidden md:block absolute top-1/4 right-8 w-4 h-4 rounded-xs bg-[#84cc16]/30 blur-xs pointer-events-none animate-pulse motion-reduce:animate-none z-1"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="hidden md:block absolute bottom-1/3 left-8 w-5 h-5 rounded-xs bg-[#06b6d4]/25 blur-xs pointer-events-none animate-pulse motion-reduce:animate-none z-1"
          style={{ animationDuration: '6s' }}
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <ScholarLensLogo
            variant="full"
            theme="dark"
            size={34}
            className="max-w-[180px] sm:max-w-[210px] md:max-w-[230px] lg:max-w-[260px] w-auto transition-transform hover:scale-102"
            alt="Scholar Lens"
          />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#34d399] text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping motion-reduce:animate-none" />
            Admin Portal
          </div>
        </div>

        {/* Center: Tagline & Title (shown on tablet & desktop 768px+) */}
        <div className="hidden md:flex relative z-10 my-auto py-4 md:py-6 lg:py-8 max-w-lg flex-col">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#34d399] text-[11px] font-semibold tracking-wider uppercase mb-3.5 backdrop-blur-xs w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping motion-reduce:animate-none" />
            ADMINISTRATIVE CONSOLE
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.25] font-sans">
            Discover Opportunities. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] via-[#84cc16] to-[#22d3ee]">
              Shape Your Future.
            </span>
          </h1>

          <p className="mt-3 text-xs md:text-sm text-emerald-100/75 leading-relaxed max-w-md">
            Centralized platform for curated graduate technology opportunities, fellowships, grants, and intelligence management.
          </p>
        </div>

        {/* Footer Note (shown on tablet & desktop 768px+) */}
        <footer className="hidden md:flex relative z-10 items-center justify-between text-[11px] text-emerald-200/40 pt-4 border-t border-emerald-900/30">
          <span>Scholar Lens Admin Console</span>
          <span className="font-mono">Secure Access</span>
        </footer>
      </section>

      {/* =========================================================================
          RIGHT PANEL: Plain white background, centered login form.
          - Mobile (320px–767px): Perfectly fitted single-column, touch-friendly,
            no overflow clipping, immediate accessibility to inputs & auto-fill.
          - Tablet & Desktop (768px+): Elegant split-screen card with full light logo.
         ========================================================================= */}
      <section className="relative w-full flex-1 flex flex-col justify-center items-center px-4 py-6 sm:px-8 sm:py-8 md:p-8 lg:p-12 xl:p-16 bg-white text-slate-900 box-border md:overflow-y-auto">
        <div className="w-full max-w-[350px] sm:max-w-[380px] mx-auto space-y-4 sm:space-y-5">
          {/* Form Header */}
          <div className="text-center space-y-1.5 flex flex-col items-center">
            {/* Logo on tablet/desktop */}
            <div className="hidden md:flex w-full justify-center pb-1">
              <ScholarLensLogo
                variant="full"
                theme="light"
                size={48}
                className="max-w-[240px] sm:max-w-[270px] w-auto h-auto transition-transform hover:scale-102"
                alt="Scholar Lens Admin Portal"
              />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#061426] tracking-tight font-sans">
              Log in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Scholar Lens Institutional Access
            </p>
          </div>

          {/* Authentication Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {/* Email Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                Email address or username
              </label>
              <input
                id="admin-email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@scholarlens.edu or admin"
                required
                className="w-full h-11 sm:h-12 px-3.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 sm:h-12 px-3.5 pr-11 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit / Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 h-11 sm:h-12 py-3 px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
