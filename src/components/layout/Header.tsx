import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScholarLensLogo } from '../common/ScholarLensLogo';
import { LogOut, BookOpen, Shield, User, ShieldAlert, Menu } from 'lucide-react';

interface Props {
  activeView: string;
  onOpenVivaGuide: () => void;
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<Props> = ({ activeView, onOpenVivaGuide, onOpenMobileNav }) => {
  const { user, logout, isAdmin } = useAuth();

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'dashboard':
        return 'Overview & Analytics';
      case 'records':
        return 'Scholarship Opportunities';
      case 'import':
        return 'Batch Ingestion';
      case 'quality':
        return 'Data Quality & Governance';
      case 'activity':
        return 'Audit Logs';
      case 'settings':
        return 'Admin Settings & Governance';
      default:
        return 'Console';
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-slate-800 bg-[#081524]/95 px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left: Branding & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs min-w-0">
        <ScholarLensLogo size={22} theme="dark" />
        <span className="hidden xs:inline text-slate-300 font-semibold tracking-tight whitespace-nowrap">
          Scholar Lens
        </span>
        <span className="hidden xs:inline text-slate-600">/</span>
        <span className="text-emerald-400 font-medium truncate max-w-[130px] sm:max-w-none">
          {getViewTitle(activeView)}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* System Architecture Guide (Desktop/Tablet) */}
        <button
          onClick={onOpenVivaGuide}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b3223] border border-[#12805c]/60 text-[#1ec992] text-xs font-semibold hover:bg-[#0f432f] transition cursor-pointer"
          title="Open System Architecture Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#1ec992]" />
          <span>System Guide</span>
        </button>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1 text-xs">
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 text-[#1ec992]" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-slate-300 font-medium uppercase font-mono text-[10px] sm:text-[11px]">
            {user?.role}
          </span>
        </div>

        {/* User Profile (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
          </div>
        </div>

        {/* Logout (Desktop/Tablet) */}
        <button
          onClick={logout}
          className="hidden md:flex p-2 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-800 transition cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Mobile Navigation Trigger Button (Visible only below 768px / md) */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer ml-1"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-[#1ec992]" />
        </button>
      </div>
    </header>
  );
};
