import React, { useState } from 'react';
import { Opportunity, DataFilterOptions } from '../../types';
import { SEED_COUNTRIES } from '../../services/mockData';
import { computeDeadlineStatus, isPlaceholderUrl } from '../../lib/deadline';
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Building,
  Archive,
  ArchiveRestore,
  LayoutList,
  Table as TableIcon,
  Globe,
  Award,
} from 'lucide-react';

interface Props {
  records: Opportunity[];
  total: number;
  filters: DataFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<DataFilterOptions>>;
  onViewRecord: (record: Opportunity) => void;
  onEditRecord: (record: Opportunity) => void;
  onDeleteRecord: (id: string) => void;
  onToggleArchive: (id: string, archive: boolean) => void;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

export const RecordsTable: React.FC<Props> = ({
  records,
  total,
  filters,
  setFilters,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onToggleArchive,
  canEdit,
  canDelete,
  isLoading,
}) => {
  const pageSize = filters.page_size || 10;
  const page = filters.page || 1;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const now = new Date();

  // Mobile layout mode: 'cards' on mobile (<768px), or 'table' on desktop
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const handleResetFilters = () => {
    setFilters({
      search: '',
      host_country: 'all',
      funding_type: 'all',
      provider_type: 'all',
      degree_level: 'all',
      deadline_status: 'all',
      indian_eligible: 'all',
      is_active: 'all',
      popularity_tier: 'all',
      sort_by: 'application_deadline',
      sort_order: 'asc',
      page: 1,
      page_size: pageSize,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans">
      {/* Controls Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3 bg-[#06101e]/60">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search by title, provider, fields of study, tags..."
              className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-[#12805c] text-xs text-slate-200 rounded-lg outline-none transition"
            />
          </div>

          {/* Quick Clear and View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* View Mode Toggle (visible on screens below 1024px) */}
            <div className="flex lg:hidden items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={`min-h-[38px] px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  mobileViewMode === 'cards'
                    ? 'bg-slate-800 text-[#1ec992] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cards View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={`min-h-[38px] px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  mobileViewMode === 'table'
                    ? 'bg-slate-800 text-[#1ec992] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Table</span>
              </button>
            </div>

            {(filters.search ||
              filters.host_country !== 'all' ||
              filters.funding_type !== 'all' ||
              filters.deadline_status !== 'all' ||
              filters.indian_eligible !== 'all' ||
              filters.is_active !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2 text-xs">
          {/* Host Country */}
          <select
            value={filters.host_country || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, host_country: e.target.value, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Countries</option>
            {SEED_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Funding Type */}
          <select
            value={filters.funding_type || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, funding_type: e.target.value, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Funding</option>
            <option value="full">Full Funding</option>
            <option value="partial">Partial Funding</option>
            <option value="stipend_only">Stipend Only</option>
            <option value="tuition_waiver">Tuition Waiver</option>
            <option value="travel_grant">Travel Grant</option>
          </select>

          {/* Provider Type */}
          <select
            value={filters.provider_type || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, provider_type: e.target.value, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Providers</option>
            <option value="university">University</option>
            <option value="foundation">Foundation</option>
            <option value="government">Government</option>
            <option value="corporate">Corporate</option>
            <option value="ngo">NGO / Non-Profit</option>
          </select>

          {/* Degree Level */}
          <select
            value={filters.degree_level || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, degree_level: e.target.value, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Degrees</option>
            <option value="masters">Master's Only</option>
            <option value="masters_or_phd">Master's or PhD</option>
            <option value="phd">PhD Only</option>
          </select>

          {/* Deadline Status */}
          <select
            value={filters.deadline_status || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, deadline_status: e.target.value as any, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Deadlines</option>
            <option value="open">Open (&gt;30d)</option>
            <option value="closing">Closing Soon (≤30d)</option>
            <option value="expired">Expired</option>
            <option value="none">No Deadline / Rolling</option>
          </select>

          {/* Indian Eligibility */}
          <select
            value={filters.indian_eligible || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, indian_eligible: e.target.value as any, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">Indian Eligibility</option>
            <option value="true">Eligible Only</option>
            <option value="false">Non-Eligible</option>
          </select>

          {/* Active Status */}
          <select
            value={filters.is_active || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, is_active: e.target.value as any, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">Catalog Status</option>
            <option value="true">Active Records</option>
            <option value="false">Inactive / Archived</option>
          </select>

          {/* Popularity Tier */}
          <select
            value={filters.popularity_tier || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, popularity_tier: e.target.value as any, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="all">All Tiers</option>
            <option value="long_tail">Long-Tail Only</option>
            <option value="well_known">Well-Known Brands</option>
          </select>

          {/* Sorting */}
          <select
            value={filters.sort_by || 'application_deadline'}
            onChange={e => setFilters(prev => ({ ...prev, sort_by: e.target.value as any, page: 1 }))}
            className="min-h-[42px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none focus:border-[#12805c] truncate"
          >
            <option value="application_deadline">Sort: Deadline</option>
            <option value="title">Sort: Title</option>
            <option value="host_country">Sort: Country</option>
            <option value="verified_on">Sort: Verified Date</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MOBILE CARDS VIEW (Clean, touch-friendly, cards below 1024px when selected)
          ========================================================================= */}
      <div className={`${mobileViewMode === 'cards' ? 'block lg:hidden' : 'hidden'} divide-y divide-slate-800/80`}>
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-[#12805c] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading opportunities...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm font-semibold text-slate-400">No matching scholarship records found</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
            >
              Clear Active Filters
            </button>
          </div>
        ) : (
          records.map(record => {
            const deadlineStatus = computeDeadlineStatus(record.application_deadline, now);
            const isPlaceholder = isPlaceholderUrl(record.official_url);

            return (
              <div key={record.id} className="p-4 space-y-3 hover:bg-slate-800/20 transition">
                {/* Header: Title & Badges */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-[#1ec992] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                      {record.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        deadlineStatus === 'open'
                          ? 'bg-emerald-950/60 border-emerald-800 text-[#1ec992]'
                          : deadlineStatus === 'closing'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                          : deadlineStatus === 'expired'
                          ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      {deadlineStatus === 'open' && 'Open'}
                      {deadlineStatus === 'closing' && 'Closing Soon'}
                      {deadlineStatus === 'expired' && 'Expired'}
                      {deadlineStatus === 'none' && 'Rolling'}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewRecord(record)}
                    className="font-semibold text-slate-100 hover:text-[#1ec992] text-left transition font-serif text-sm leading-snug cursor-pointer block"
                  >
                    {record.title}
                  </button>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{record.host_institution}</span>
                    <span>·</span>
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300 font-medium">{record.host_country}</span>
                  </div>
                </div>

                {/* Badges strip */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 capitalize">
                    {record.funding_type.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 capitalize">
                    {record.degree_level.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded border ${
                      record.indian_applicants_eligible
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    {record.indian_applicants_eligible ? 'Indian Eligible' : 'Non-Eligible'}
                  </span>
                </div>

                {/* Portal link / unverified badge */}
                <div className="text-xs pt-1 flex items-center justify-between border-t border-slate-800/60">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Deadline: <strong className="text-slate-200">{record.application_deadline || 'Rolling'}</strong>
                  </div>

                  {isPlaceholder ? (
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unverified Link</span>
                    </span>
                  ) : (
                    <a
                      href={record.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1ec992] hover:underline flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => onViewRecord(record)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-slate-300" />
                    <span>View</span>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEditRecord(record)}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => {
                        const msg = record.is_active
                          ? `Archive opportunity "${record.title}"?\n\n(Soft delete: Hides record from active view without permanent deletion)`
                          : `Restore opportunity "${record.title}" to active status?`;
                        if (window.confirm(msg)) {
                          onToggleArchive(record.id, record.is_active);
                        }
                      }}
                      className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg transition text-xs font-medium cursor-pointer ${
                        record.is_active
                          ? 'bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-400'
                          : 'bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400'
                      }`}
                    >
                      {record.is_active ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                      <span>{record.is_active ? 'Archive' : 'Restore'}</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`PERMANENT HARD DELETE:\n\nAre you sure you want to PERMANENTLY remove "${record.title}" from the database?\n\nThis action CANNOT be undone.`)) {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VIEW 2: FULL DATA TABLE (Always shown on desktop lg:block; or when table mode selected on mobile)
          Preserves original table structure with horizontal scroll container & visual scroll cues
          ========================================================================= */}
      <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden lg:block'} overflow-x-auto relative`}>
        {/* Subtle mobile scroll hint */}
        <div className="lg:hidden px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>← Swipe horizontally to view all columns →</span>
          <span className="text-[#1ec992]">7 Columns</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#06101e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
            <tr>
              <th className="py-3 px-4 min-w-[220px]">Opportunity & Institution</th>
              <th className="py-3 px-4 min-w-[130px]">Country & Degree</th>
              <th className="py-3 px-4 min-w-[130px]">Funding</th>
              <th className="py-3 px-4 min-w-[120px]">Deadline Status</th>
              <th className="py-3 px-4 min-w-[110px]">Eligibility</th>
              <th className="py-3 px-4 min-w-[100px]">Official Portal</th>
              <th className="py-3 px-4 text-right min-w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-4 bg-slate-800 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                  </td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-sm font-semibold text-slate-400">No matching scholarship records found</p>
                    <p className="text-xs text-slate-500">
                      Try clearing search parameters or adjusting country/funding filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 min-h-[42px] px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
                    >
                      Clear Active Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              records.map(record => {
                const deadlineStatus = computeDeadlineStatus(record.application_deadline, now);
                const isPlaceholder = isPlaceholderUrl(record.official_url);

                return (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition">
                    {/* Title & Institution */}
                    <td className="py-3 px-4 max-w-xs">
                      <button
                        onClick={() => onViewRecord(record)}
                        className="font-semibold text-slate-100 hover:text-[#1ec992] text-left transition truncate block max-w-full font-serif cursor-pointer"
                      >
                        {record.title}
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{record.host_institution}</span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-slate-500">{record.id}</span>
                      </div>
                    </td>

                    {/* Country & Degree */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{record.host_country}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {record.degree_level.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Funding */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium capitalize">
                        {record.funding_type.replace('_', ' ')}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={record.funding_amount_note}>
                        {record.funding_amount_note}
                      </div>
                    </td>

                    {/* Computed Deadline Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold block ${
                          deadlineStatus === 'open'
                            ? 'text-[#1ec992]'
                            : deadlineStatus === 'closing'
                            ? 'text-amber-400'
                            : deadlineStatus === 'expired'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {deadlineStatus === 'open' && 'Open'}
                        {deadlineStatus === 'closing' && 'Closing Soon'}
                        {deadlineStatus === 'expired' && 'Expired'}
                        {deadlineStatus === 'none' && 'Rolling'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {record.application_deadline ? record.application_deadline : 'No set date'}
                      </span>
                    </td>

                    {/* Eligibility & Active */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium block ${
                          record.indian_applicants_eligible ? 'text-[#1ec992]' : 'text-rose-400'
                        }`}
                      >
                        {record.indian_applicants_eligible ? 'Indian Eligible' : 'Non-Eligible'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {record.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Official Portal with Unverified Warning */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {isPlaceholder ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px]" title="Placeholder URL (example.com)">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Unverified</span>
                        </span>
                      ) : (
                        <a
                          href={record.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1ec992] hover:underline flex items-center gap-1"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewRecord(record)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="View Opportunity Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEditRecord(record)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title="Edit Opportunity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => {
                              const msg = record.is_active
                                ? `Archive opportunity "${record.title}"?\n\n(Soft delete: This hides the record from active lists but does NOT permanently delete it. You can restore it anytime.)`
                                : `Restore opportunity "${record.title}" to active status?`;
                              if (window.confirm(msg)) {
                                onToggleArchive(record.id, record.is_active);
                              }
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded transition cursor-pointer ${
                              record.is_active
                                ? 'bg-slate-800 hover:bg-amber-950 text-slate-400 hover:text-amber-400'
                                : 'bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400'
                            }`}
                            title={record.is_active ? 'Archive Opportunity (Soft Delete)' : 'Restore Opportunity'}
                          >
                            {record.is_active ? (
                              <Archive className="w-3.5 h-3.5" />
                            ) : (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`PERMANENT HARD DELETE:\n\nAre you sure you want to PERMANENTLY remove "${record.title}" from the database?\n\nThis action CANNOT be undone.`)) {
                                onDeleteRecord(record.id);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Permanent Hard Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-[#06101e]/60">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] sm:text-xs">
            Showing <strong className="text-white tabular-nums">{records.length}</strong> of{' '}
            <strong className="text-white tabular-nums">{total}</strong>
          </span>
          <select
            value={pageSize}
            onChange={e => setFilters(prev => ({ ...prev, page_size: Number(e.target.value), page: 1 }))}
            className="min-h-[36px] px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs outline-none"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setFilters(prev => ({ ...prev, page: page - 1 }))}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-slate-800 disabled:opacity-30 hover:bg-slate-700 text-white transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs px-1">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setFilters(prev => ({ ...prev, page: page + 1 }))}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-slate-800 disabled:opacity-30 hover:bg-slate-700 text-white transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
