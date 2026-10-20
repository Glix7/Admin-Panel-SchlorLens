import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataQualityReport, Opportunity } from '../../types';
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
} from 'lucide-react';

interface Props {
  onSelectRecordToInspect: (id: string) => void;
}

export const DataQualityView: React.FC<Props> = ({ onSelectRecordToInspect }) => {
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">Data Quality & Metadata Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated compliance scanner for unverified links, stale audits, and deadline anomalies.
          </p>
        </div>
        <button
          onClick={loadReport}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
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
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center min-w-[120px]">
            <span className="text-slate-400 block text-[11px]">Unverified URLs</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums mt-0.5 block">
              {report.unverified_placeholder_urls}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center min-w-[120px]">
            <span className="text-slate-400 block text-[11px]">Null Deadlines</span>
            <span className="text-lg font-bold text-blue-400 tabular-nums mt-0.5 block">
              {report.null_deadlines}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center min-w-[120px]">
            <span className="text-slate-400 block text-[11px]">Expired Deadlines</span>
            <span className="text-lg font-bold text-rose-400 tabular-nums mt-0.5 block">
              {report.expired_deadlines}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center min-w-[120px]">
            <span className="text-slate-400 block text-[11px]">Stale Verifications</span>
            <span className="text-lg font-bold text-purple-400 tabular-nums mt-0.5 block">
              {report.stale_verifications}
            </span>
          </div>
        </div>
      </div>

      {/* Specific Heuristics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Placeholder URLs Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold font-serif">
            <Link2 className="w-4 h-4 text-amber-400" />
            <span>Unverified Link Heuristic (Section 0 Audit 1)</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            All 112 seed opportunities carry placeholder <code>example.com</code> URLs. The system tags them with an "Unverified Link" badge in the UI and excludes them from live applicant feeds until updated.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
            Current Status: {report.unverified_placeholder_urls} flagged records requiring real university links.
          </div>
        </div>

        {/* Deadlines Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold font-serif">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Dynamic Deadlines (Section 0 Audits 2 & 3)</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Deadline statuses are computed dynamically at query time against today's date:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
            <li><strong>Null Deadlines:</strong> {report.null_deadlines} opportunities with rolling or seasonal intakes.</li>
            <li><strong>Expired Deadlines:</strong> {report.expired_deadlines} past intakes requiring cycle renewal.</li>
          </ul>
        </div>

        {/* Stale Verifications Audit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold font-serif">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Stale Audit Heuristic (Section 0 Audit 5)</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Opportunities with <code>verified_on</code> older than 90 days are flagged to ensure funding amounts and eligibility criteria remain accurate for applicants.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-300">
            Records &gt;90 Days Unverified: {report.stale_verifications}
          </div>
        </div>

        {/* Duplicate Prevention */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold font-serif">
            <Copy className="w-4 h-4 text-[#1ec992]" />
            <span>Duplicate Opportunity Titles</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Scans for duplicate titles offered by the same provider institution to prevent duplicate entries during batch ingestions.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            {report.duplicate_titles.length === 0 ? (
              <span className="text-[#1ec992] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero duplicate titles identified across catalog.
              </span>
            ) : (
              <span className="text-amber-400">
                {report.duplicate_titles.length} potential duplicate titles flagged.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
