import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataQualityReport, DataFilterOptions } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  Link2,
  Calendar,
  Clock,
  Copy,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onSelectRecordToInspect: (id: string) => void;
  onFilterRecords?: (filters: Partial<DataFilterOptions>) => void;
}

export const DataQualityView: React.FC<Props> = ({ onSelectRecordToInspect, onFilterRecords }) => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDataQualityReport();
      setReport(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (isLoading || !report) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-[#12805c] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Scanning repository against data quality heuristics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">Data Quality & Metadata Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated compliance scanner for unverified links, stale audits, and deadline anomalies.
          </p>
        </div>
        <button
          onClick={loadReport}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1ec992]" />
          <span>Re-scan Catalog</span>
        </button>
      </div>

      {/* Health Score Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Repository Data Health Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold text-white font-serif tabular-nums">
              {report.overall_health_score}
            </span>
            <span className="text-slate-500 text-sm">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculated across {report.total_checked} opportunities using weighted completeness heuristics.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Unverified URLs */}
          <button
            onClick={() => onFilterRecords?.({ search: 'example.com' })}
            className="p-3 bg-slate-950 hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-amber-700/60 text-center min-w-[120px] transition cursor-pointer group"
            title="Filter records with placeholder URLs"
          >
            <span className="text-slate-400 block text-[11px] group-hover:text-amber-300">Unverified URLs</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums mt-0.5 block">
              {report.unverified_placeholder_urls}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center justify-center gap-1 mt-1">
              View records <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* 2. Null Deadlines */}
          <button
            onClick={() => onFilterRecords?.({ deadline_status: 'none' })}
            className="p-3 bg-slate-950 hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-blue-700/60 text-center min-w-[120px] transition cursor-pointer group"
            title="Filter rolling / no deadline records"
          >
            <span className="text-slate-400 block text-[11px] group-hover:text-blue-300">Null Deadlines</span>
            <span className="text-lg font-bold text-blue-400 tabular-nums mt-0.5 block">
              {report.null_deadlines}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center justify-center gap-1 mt-1">
              View records <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* 3. Expired Deadlines */}
          <button
            onClick={() => onFilterRecords?.({ deadline_status: 'expired' })}
            className="p-3 bg-slate-950 hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-rose-700/60 text-center min-w-[120px] transition cursor-pointer group"
            title="Filter passed deadline records"
          >
            <span className="text-slate-400 block text-[11px] group-hover:text-rose-300">Expired Deadlines</span>
            <span className="text-lg font-bold text-rose-400 tabular-nums mt-0.5 block">
              {report.expired_deadlines}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center justify-center gap-1 mt-1">
              View records <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* 4. Stale Verifications */}
          <button
            onClick={() => onFilterRecords?.({ sort_by: 'verified_on', sort_order: 'asc' })}
            className="p-3 bg-slate-950 hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-purple-700/60 text-center min-w-[120px] transition cursor-pointer group"
            title="Sort records by oldest verification date"
          >
            <span className="text-slate-400 block text-[11px] group-hover:text-purple-300">Stale Verifications</span>
            <span className="text-lg font-bold text-purple-400 tabular-nums mt-0.5 block">
              {report.stale_verifications}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center justify-center gap-1 mt-1">
              Sort by audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      </div>

      {/* Specific Heuristics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Placeholder URLs Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold font-serif">
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>Unverified Link Heuristic</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              All {report.unverified_placeholder_urls} opportunities carry placeholder <code>example.com</code> URLs. The system tags them with an "Unverified Link" badge in the UI and excludes them from live applicant feeds until updated.
            </p>
          </div>
          <button
            onClick={() => onFilterRecords?.({ search: 'example.com' })}
            className="w-full py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 text-amber-300 font-mono text-[11px] flex items-center justify-between transition cursor-pointer"
          >
            <span>{report.unverified_placeholder_urls} flagged records</span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-sans font-semibold">
              Filter in table <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* Deadlines Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold font-serif">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Dynamic Deadlines Heuristic</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Application deadline status is dynamically computed relative to today's date:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
              <li><strong>Null Deadlines:</strong> {report.null_deadlines} opportunities with rolling or seasonal intakes.</li>
              <li><strong>Expired Deadlines:</strong> {report.expired_deadlines} past intakes requiring cycle renewal.</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterRecords?.({ deadline_status: 'expired' })}
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[11px] text-center transition cursor-pointer"
            >
              Filter Expired ({report.expired_deadlines})
            </button>
            <button
              onClick={() => onFilterRecords?.({ deadline_status: 'none' })}
              className="flex-1 py-1.5 px-2 rounded-lg bg-blue-950/40 hover:bg-blue-950/70 border border-blue-800/60 text-blue-300 text-[11px] text-center transition cursor-pointer"
            >
              Filter Null ({report.null_deadlines})
            </button>
          </div>
        </div>

        {/* Stale Verifications Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold font-serif">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Stale Verification Heuristic (&gt;90 Days)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Opportunities with <code>verified_on</code> older than 90 days are flagged to ensure funding amounts and eligibility criteria remain accurate for applicants.
            </p>
          </div>
          <button
            onClick={() => onFilterRecords?.({ sort_by: 'verified_on', sort_order: 'asc' })}
            className="w-full py-2 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-950/70 border border-purple-800/60 text-purple-300 font-mono text-[11px] flex items-center justify-between transition cursor-pointer"
          >
            <span>{report.stale_verifications} records &gt;90d unverified</span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-sans font-semibold">
              Sort by oldest audit <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* Duplicate Prevention */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold font-serif">
              <Copy className="w-4 h-4 text-[#1ec992]" />
              <span>Duplicate Candidate Detection</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Scans for identical opportunity titles offered by the same provider institution to prevent accidental duplicate entries during batch ingestions.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            {report.duplicate_titles.length === 0 ? (
              <span className="text-[#1ec992] flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero duplicate candidates identified across current catalog.
              </span>
            ) : (
              <div className="space-y-1">
                <span className="text-amber-400 font-semibold block">
                  {report.duplicate_titles.length} potential duplicate titles flagged:
                </span>
                {report.duplicate_titles.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => onFilterRecords?.({ search: d.title })}
                    className="block text-slate-300 hover:text-white underline text-left cursor-pointer"
                  >
                    • {d.title} ({d.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
