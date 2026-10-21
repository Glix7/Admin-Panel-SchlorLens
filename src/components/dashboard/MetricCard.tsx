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
    <div className="p-3.5 sm:p-4 lg:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${colorClass}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
          {value}
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400 truncate">
          {subtext}
        </p>
      </div>
    </div>
  );
};
