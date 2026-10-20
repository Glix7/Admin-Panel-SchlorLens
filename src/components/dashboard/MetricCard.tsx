import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  colorClass: string;
}

export const MetricCard: React.FC<MetricProps> = ({ label, value, subtext, icon: Icon, colorClass }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold text-white tabular-nums tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
};
