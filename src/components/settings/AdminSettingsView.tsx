import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  RotateCcw,
  Database,
  Lock,
  User,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

interface Props {
  onResetSeedSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminSettingsView: React.FC<Props> = ({ onResetSeedSuccess, showToast }) => {
  const { user, isAdmin } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!isAdmin) {
      showToast('Forbidden: Administrator role required to reset repository.', 'error');
      return;
    }

    const confirm = window.confirm(
      'Are you sure you want to restore the default dataset? This resets the database to the verified 112 seed opportunities and 4 test fixtures.'
    );
    if (!confirm) return;

    try {
      setIsResetting(true);
      await api.resetSeed();
      showToast('Database reset successfully to original 112 seed opportunities.');
      onResetSeedSuccess();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">Platform Administration & Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage system sessions, persistence parameters, and curation audit baselines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#0b3223] border border-[#12805c]/60 text-[#1ec992] text-xs font-mono font-medium">
            Active Role: {user?.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session & Identity */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-[#1ec992]" />
            <h2 className="text-sm font-bold text-white font-serif">Current Session Authentication</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Authenticated User:</span>
              <span className="font-semibold text-slate-200">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Institutional Email:</span>
              <span className="font-mono text-slate-300">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Role Authority:</span>
              <span className={`font-mono font-semibold ${isAdmin ? 'text-[#1ec992]' : 'text-amber-400'}`}>
                {user?.role === 'admin' ? 'Administrator (Full Read / Write / Delete)' : 'Viewer (Read-Only Public / Audit)'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Session Security:</span>
              <span className="text-slate-300 font-mono">httpOnly, SameSite=Lax Cookie</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Password Hashing:</span>
              <span className="text-slate-300 font-mono">bcryptjs (Salt rounds: 10)</span>
            </div>
          </div>
        </div>

        {/* Persistence Engine */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Database className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white font-serif">Persistence & Storage Engine</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Storage Architecture:</span>
              <span className="text-slate-200 font-medium">Atomic JSON Store with In-Memory Fast Cache</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Database Directory:</span>
              <span className="font-mono text-slate-300">data/opportunities.json</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Audit Trail Directory:</span>
              <span className="font-mono text-slate-300">data/logs.json</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Formula Injection Guard:</span>
              <span className="text-emerald-400 font-medium">Active (Enforces single-quote prefix on =, +, -, @)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Hot-Reload & State Sync:</span>
              <span className="text-slate-300">Shared single source of truth across public and admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Reset Action */}
      <div className="p-5 rounded-xl bg-slate-900 border border-rose-950/60 space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white font-serif">Restore Default Dataset (112 Records)</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          If you have added test records, updated deadlines, or imported external CSV files during a demonstration,
          you can restore the initial verified baseline of 112 curated opportunities and 4 negative test fixtures at any time.
        </p>

        <div className="pt-2">
          <button
            onClick={handleReset}
            disabled={!isAdmin || isResetting}
            className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Restoring Baseline Data...' : 'Reset to Default 112 Curated Opportunities'}</span>
          </button>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Lock className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white font-serif">Role-Based Access Control (RBAC) Matrix</h2>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">System Operation</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Public Visitor</th>
                <th className="py-2.5 px-3">Viewer Role</th>
                <th className="py-2.5 px-3">Admin Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">View Public Opportunities & Stats</td>
                <td className="py-2.5 px-3 text-slate-400">GET /api/records, GET /api/stats</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Export Opportunities to RFC 4180 CSV</td>
                <td className="py-2.5 px-3 text-slate-400">GET /api/records/export</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Curate New Opportunity</td>
                <td className="py-2.5 px-3 text-slate-400">POST /api/records</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-rose-400">403 Forbidden</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed (Admin)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Update Opportunity Fields</td>
                <td className="py-2.5 px-3 text-slate-400">PUT /api/records/:id</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-rose-400">403 Forbidden</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed (Admin)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Expunge Opportunity</td>
                <td className="py-2.5 px-3 text-slate-400">DELETE /api/records/:id</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-rose-400">403 Forbidden</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed (Admin)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Batch Ingest CSV</td>
                <td className="py-2.5 px-3 text-slate-400">POST /api/records/import</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-rose-400">403 Forbidden</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed (Admin)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-200">Reset Repository Seed Baseline</td>
                <td className="py-2.5 px-3 text-slate-400">POST /api/admin/reset-seed</td>
                <td className="py-2.5 px-3 text-rose-400">401 Auth Required</td>
                <td className="py-2.5 px-3 text-rose-400">403 Forbidden</td>
                <td className="py-2.5 px-3 text-emerald-400">Allowed (Admin)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
