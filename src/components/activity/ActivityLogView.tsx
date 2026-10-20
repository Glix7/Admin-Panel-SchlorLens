import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ActivityLog } from '../../types';
import { ScrollText, Shield, RefreshCw } from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getActivityLogs();
      setLogs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="font-mono text-[10px] font-bold text-[#1ec992]">CREATE</span>;
      case 'UPDATE':
        return <span className="font-mono text-[10px] font-bold text-blue-400">UPDATE</span>;
      case 'DELETE':
        return <span className="font-mono text-[10px] font-bold text-rose-400">DELETE</span>;
      case 'IMPORT':
        return <span className="font-mono text-[10px] font-bold text-purple-400">IMPORT</span>;
      case 'LOGIN':
        return <span className="font-mono text-[10px] font-bold text-emerald-400">AUTH_IN</span>;
      case 'LOGOUT':
        return <span className="font-mono text-[10px] font-bold text-slate-400">AUTH_OUT</span>;
      case 'FAILED_LOGIN':
        return <span className="font-mono text-[10px] font-bold text-amber-400">AUTH_FAIL</span>;
      case 'RESET':
        return <span className="font-mono text-[10px] font-bold text-orange-400">RESET</span>;
      default:
        return <span className="font-mono text-[10px] text-slate-400">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">Server Audit Trail & Activity Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable server-written log stream tracking all authentication, curation, and import events.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1ec992]" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
          <span className="font-bold text-white flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#1ec992]" />
            <span>Event Records ({logs.length})</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Storage: data/logs.json</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading audit log records...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No activity logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map(log => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-semibold text-slate-200">{log.actor}</span>
                    <span className="text-[10px] text-slate-500 font-mono">[{log.role}]</span>
                    {log.record_id && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                        {log.record_id}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs">{log.summary}</p>
                  {log.changed_fields && log.changed_fields.length > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Mutated fields: {log.changed_fields.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono shrink-0 sm:text-right">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
