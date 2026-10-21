import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScholarLensLogo } from '../common/ScholarLensLogo';
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
  X,
  User,
  Shield,
  ShieldAlert,
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeView,
  setActiveView,
  onOpenAddModal,
  onExportCSV,
  onOpenVivaGuide,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const { user, logout, isAdmin } = useAuth();

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleMobileNavClick = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  const navItems = [
    { id: 'dashboard', label: '1. Overview', icon: LayoutDashboard, action: () => setActiveView('dashboard') },
    { id: 'records', label: '2. Opportunities', icon: GraduationCap, action: () => setActiveView('records') },
    { id: 'add', label: '3. Add Opportunity', icon: PlusCircle, action: onOpenAddModal, highlight: true },
    { id: 'import', label: '4. Import Dataset', icon: Upload, action: () => setActiveView('import') },
    { id: 'export', label: '5. Export Dataset', icon: Download, action: onExportCSV },
    { id: 'quality', label: '6. Data Quality', icon: ShieldCheck, action: () => setActiveView('quality') },
    { id: 'activity', label: '7. Activity Logs', icon: ScrollText, action: () => setActiveView('activity') },
    { id: 'settings', label: '8. Admin Settings', icon: Settings, action: () => setActiveView('settings') },
  ];

  return (
    <>
      {/* =========================================================================
          DESKTOP & TABLET SIDEBAR (md:flex, hidden on screens < 768px)
          Preserves the desktop layout and tablet icon-rail / expanded behavior
          ========================================================================= */}
      <aside
        className={`hidden md:flex relative bg-[#06101e] border-r border-slate-800 flex-col justify-between transition-all duration-200 z-40 select-none shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Lockup */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800">
            {!isCollapsed ? (
              <ScholarLensLogo size={34} withText showTagline theme="dark" />
            ) : (
              <div className="mx-auto">
                <ScholarLensLogo size={32} theme="dark" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition hidden md:block cursor-pointer"
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
                className={`w-full py-2 px-3 rounded-lg bg-[#12805c] hover:bg-[#0f6b4d] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
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
            <div
              className={`px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${
                isCollapsed ? 'hidden' : 'block'
              }`}
            >
              Admin Navigation
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-[#1ec992] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-[#1ec992]'
                        : item.highlight
                        ? 'text-emerald-400'
                        : item.id === 'export'
                        ? 'text-blue-400'
                        : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation (Items 9 & 10 + Viva Guide) */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={onOpenVivaGuide}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/30 transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Scholar Lens Technical Architecture Guide"
          >
            <BookOpen className="w-4 h-4 text-[#1ec992] shrink-0" />
            {!isCollapsed && <span>9. System Architecture</span>}
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
            {!isCollapsed && <span>10. Logout</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE COLLAPSIBLE NAVIGATION DRAWER (Below 768px / md:hidden)
          Full drawer overlay with backdrop, touch-friendly 48px targets,
          complete 10-destination catalog, user profile, and ESC/close controls
          ========================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Subtle backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#06101e] border-r border-slate-800 flex flex-col justify-between shadow-2xl z-10 animate-slideRight font-sans">
            <div className="flex-1 overflow-y-auto">
              {/* Drawer Header with Logo and Close Button */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <ScholarLensLogo size={28} withText showTagline theme="dark" />
                <button
                  onClick={onCloseMobile}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Close Navigation"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Banner inside Drawer */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {isAdmin ? (
                      <Shield className="w-3 h-3 text-[#1ec992]" />
                    ) : (
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                    )}
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-medium">
                      {user?.role} Role
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Action */}
              {isAdmin && (
                <div className="p-3 border-b border-slate-800/80">
                  <button
                    onClick={() => handleMobileNavClick(onOpenAddModal)}
                    className="w-full min-h-[46px] py-2.5 px-3 rounded-lg bg-[#12805c] hover:bg-[#0f6b4d] active:scale-[0.98] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>3. Add Opportunity</span>
                  </button>
                </div>
              )}

              {/* 10 Navigation Items */}
              <nav className="p-3 space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Navigation Destinations
                </div>

                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.action)}
                      className={`w-full min-h-[46px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-800 text-[#1ec992] font-semibold border-l-2 border-[#1ec992]'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-[#1ec992]'
                            : item.highlight
                            ? 'text-emerald-400'
                            : item.id === 'export'
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer: Destinations 9 & 10 */}
            <div className="p-3 border-t border-slate-800 space-y-2 bg-[#050c17]">
              {/* 9. System Architecture Guide */}
              <button
                onClick={() => handleMobileNavClick(onOpenVivaGuide)}
                className="w-full min-h-[46px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/30 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#1ec992] shrink-0" />
                <span>9. System Architecture</span>
              </button>

              {/* 10. Logout */}
              <button
                onClick={() => handleMobileNavClick(logout)}
                className="w-full min-h-[46px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span>10. Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
