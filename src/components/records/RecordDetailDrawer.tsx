import React from 'react';
import { Opportunity } from '../../types';
import { computeDeadlineStatus, isVerificationStale, isPlaceholderUrl } from '../../lib/deadline';
import {
  X,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Building,
  GraduationCap,
  Globe,
  Tag,
  CheckCircle2,
  Clock,
  Edit3,
} from 'lucide-react';

interface Props {
  record: Opportunity | null;
  onClose: () => void;
  onEdit: (record: Opportunity) => void;
  canEdit: boolean;
}

export const RecordDetailDrawer: React.FC<Props> = ({ record, onClose, onEdit, canEdit }) => {
  if (!record) return null;

  const now = new Date();
  const deadlineStatus = computeDeadlineStatus(record.application_deadline, now);
  const isStale = isVerificationStale(record.verified_on, 90, now);
  const isPlaceholder = isPlaceholderUrl(record.official_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>{record.host_country}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{record.degree_level.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#1ec992]">{record.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white font-serif leading-snug">{record.title}</h2>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{record.host_institution} ({record.provider_name})</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical Alerts Banner (Placeholder URL / Expired / Stale) */}
        <div className="space-y-2">
          {isPlaceholder && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong>Unverified Link Notice:</strong> The official portal URL contains an <code>example.com</code> placeholder. Verification against provider circular required before publishing to applicants.
              </div>
            </div>
          )}

          {deadlineStatus === 'expired' && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <strong>Application Deadline Passed:</strong> The scheduled intake deadline ({record.application_deadline}) has expired for this cycle.
              </div>
            </div>
          )}

          {isStale && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <strong>Stale Verification:</strong> Last audited on {record.verified_on} (&gt;90 days ago). Re-audit recommended.
              </div>
            </div>
          )}
        </div>

        {/* Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Deadline Status</span>
            <span
              className={`font-semibold mt-0.5 block ${
                deadlineStatus === 'open'
                  ? 'text-[#1ec992]'
                  : deadlineStatus === 'closing'
                  ? 'text-amber-400'
                  : deadlineStatus === 'expired'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {deadlineStatus === 'open' && 'Open (>30d)'}
              {deadlineStatus === 'closing' && 'Closing Soon (≤30d)'}
              {deadlineStatus === 'expired' && 'Expired'}
              {deadlineStatus === 'none' && 'Rolling / None'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Funding Tier</span>
            <span className="font-semibold text-white mt-0.5 block capitalize">
              {record.funding_type.replace('_', ' ')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Indian Applicants</span>
            <span className={`font-semibold mt-0.5 block ${record.indian_applicants_eligible ? 'text-[#1ec992]' : 'text-rose-400'}`}>
              {record.indian_applicants_eligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Catalog Status</span>
            <span className={`font-semibold mt-0.5 block ${record.is_active ? 'text-[#1ec992]' : 'text-slate-500'}`}>
              {record.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Fields of Study */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block mb-1.5">Target Disciplines & Fields:</span>
          <div className="flex flex-wrap gap-1.5">
            {record.fields_of_study.map((field, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Funding & Eligibility Descriptions */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-300">Financial Coverage & Value:</span>
            <p className="text-slate-300 leading-relaxed">{record.funding_summary}</p>
            <p className="text-[11px] font-mono text-[#1ec992] pt-1">Amount Note: {record.funding_amount_note}</p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-300">Eligibility Criteria:</span>
            <p className="text-slate-300 leading-relaxed">{record.eligibility_summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <div>GPA Note: {record.min_gpa_note}</div>
              <div>Language: {record.language_requirements}</div>
            </div>
          </div>
        </div>

        {/* Official URL & Tags */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <div className="truncate pr-3">
            <span className="text-slate-400 block text-[10px]">Official Opportunity URL:</span>
            <span className="font-mono text-slate-200 truncate block">{record.official_url}</span>
          </div>
          <a
            href={record.official_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer Meta */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
          <span>Curated by: {record.curated_by}</span>
          <span>Verified: {record.verified_on}</span>
          <span>Updated: {new Date(record.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
          {canEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-4 py-2 bg-[#12805c] hover:bg-[#0f6b4d] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Opportunity</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
