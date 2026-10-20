import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, Shield, User, ShieldAlert, Download } from 'lucide-react';

interface Props {
  activeView: string;
  onOpenVivaGuide: () => void;
}

export const Header: React.FC<Props> = ({ activeView, onOpenVivaGuide }) => {
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
    <header className="h-16 border-b border-slate-800 bg-[#081524]/90 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Scholar Lens</span>
        <span className="text-slate-600">/</span>
        <span className="text-white font-semibold">{getViewTitle(activeView)}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Direct Project ZIP Download */}
        <a
          href="/api/download-project-zip"
          download="scholar-lens-project.zip"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800 hover:text-white transition cursor-pointer"
          title="Download complete project source code (.zip)"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Download ZIP</span>
        </a>

        <button
          onClick={onOpenVivaGuide}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b3223] border border-[#12805c]/60 text-[#1ec992] text-xs font-semibold hover:bg-[#0f432f] transition cursor-pointer"
          title="Open System Architecture Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#1ec992]" />
          <span>System Guide</span>
        </button>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 text-[#1ec992]" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-slate-300 font-medium uppercase font-mono text-[11px]">
            {user?.role}
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-800 transition cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
