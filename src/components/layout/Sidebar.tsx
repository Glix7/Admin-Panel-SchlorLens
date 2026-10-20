import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
  Upload,
  Download,
  ScrollText,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onOpenVivaGuide: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeView,
  setActiveView,
  onOpenAddModal,
  onExportCSV,
  onOpenVivaGuide,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { logout, isAdmin } = useAuth();

  // The 10 sections from Section 4:
  // 1. Overview
  // 2. Opportunities
  // 3. Add Opportunity
  // 4. Import Dataset
  // 5. Export Dataset
  // 6. Data Quality
  // 7. Activity Logs
  // 8. Admin Settings
  // 9. Return to Homepage
  // 10. Logout

  return (
    <aside
      className={`relative bg-[#06101e] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 z-40 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Lockup */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#12805c]/20 border border-[#12805c]/40 flex items-center justify-center text-[#1ec992] font-black text-sm">
                SL
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-white block">
                  SCHOLAR<span className="text-[#1ec992]">LENS</span>
                </span>
                <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-medium">
                  Admin Platform
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-[#12805c]/20 border border-[#12805c]/40 flex items-center justify-center text-[#1ec992] font-bold text-sm">
              SL
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition hidden md:block"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action: Add Opportunity */}
        <div className="p-3 border-b border-slate-800/80">
          {isAdmin ? (
            <button
              onClick={onOpenAddModal}
              className={`w-full py-2 px-3 rounded-lg bg-[#12805c] hover:bg-[#0f6b4d] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                isCollapsed ? 'px-0' : ''
              }`}
              title="3. Add Opportunity"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Add Opportunity</span>}
            </button>
          ) : (
            <div className={`text-[11px] text-slate-500 text-center py-1 ${isCollapsed ? 'hidden' : 'block'}`}>
              Viewer (Read-Only)
            </div>
          )}
        </div>

        {/* Primary Navigation Sections (Items 1 to 8) */}
        <nav className="p-3 space-y-1">
          <div className={`px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
            Admin Navigation
          </div>

          {/* 1. Overview */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'dashboard'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="1. Overview"
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeView === 'dashboard' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>1. Overview</span>}
          </button>

          {/* 2. Opportunities */}
          <button
            onClick={() => setActiveView('records')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'records'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="2. Opportunities"
          >
            <GraduationCap className={`w-4 h-4 shrink-0 ${activeView === 'records' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>2. Opportunities</span>}
          </button>

          {/* 3. Add Opportunity (Trigger modal or switch view) */}
          <button
            onClick={onOpenAddModal}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-900 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="3. Add Opportunity"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            {!isCollapsed && <span>3. Add Opportunity</span>}
          </button>

          {/* 4. Import Dataset */}
          <button
            onClick={() => setActiveView('import')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'import'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="4. Import Dataset"
          >
            <Upload className={`w-4 h-4 shrink-0 ${activeView === 'import' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>4. Import Dataset</span>}
          </button>

          {/* 5. Export Dataset */}
          <button
            onClick={onExportCSV}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-900 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="5. Export Dataset (RFC 4180 CSV)"
          >
            <Download className="w-4 h-4 shrink-0 text-blue-400" />
            {!isCollapsed && <span>5. Export Dataset</span>}
          </button>

          {/* 6. Data Quality */}
          <button
            onClick={() => setActiveView('quality')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'quality'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="6. Data Quality"
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${activeView === 'quality' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>6. Data Quality</span>}
          </button>

          {/* 7. Activity Logs */}
          <button
            onClick={() => setActiveView('activity')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'activity'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="7. Activity Logs"
          >
            <ScrollText className={`w-4 h-4 shrink-0 ${activeView === 'activity' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>7. Activity Logs</span>}
          </button>

          {/* 8. Admin Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              activeView === 'settings'
                ? 'bg-slate-800 text-[#1ec992] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="8. Admin Settings"
          >
            <Settings className={`w-4 h-4 shrink-0 ${activeView === 'settings' ? 'text-[#1ec992]' : 'text-slate-400'}`} />
            {!isCollapsed && <span>8. Admin Settings</span>}
          </button>
        </nav>
      </div>

      {/* Footer Navigation (Items 9 & 10 + Viva Guide) */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onOpenVivaGuide}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/30 transition ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Scholar Lens Technical Architecture Guide"
        >
          <BookOpen className="w-4 h-4 text-[#1ec992] shrink-0" />
          {!isCollapsed && <span>System Architecture</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
