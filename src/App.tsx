import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardMaster } from './components/dashboard/DashboardMaster';

const MainRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#081524] flex flex-col items-center justify-center text-slate-300">
        <div className="w-9 h-9 border-2 border-[#12805c] border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#1ec992]">
          Initializing Scholar Lens Platform...
        </span>
      </div>
    );
  }

  // SCREEN 2: ADMIN PANEL (After successful authentication)
  if (isAuthenticated) {
    return <DashboardMaster />;
  }

  // SCREEN 1: ADMIN LOGIN (Default / First screen shown when app opens)
  return <LoginForm />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
};

export default App;
