import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Opportunity, DataFilterOptions, OpportunityStats } from '../../types';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { MetricCard } from './MetricCard';
import { RecordsTable } from '../records/RecordsTable';
import { RecordDetailDrawer } from '../records/RecordDetailDrawer';
import {
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  PlusCircle,
  Upload,
  Download,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Globe,
  Award,
  Check,
  XCircle,
  Layers,
} from 'lucide-react';

// ==============================================================================
// Code Splitting: Lazy-load Heavy Analytical Visualizations & Admin Modules
// ==============================================================================
const DeadlinesTimelineChart = lazy(() =>
  import('./OpportunitiesCharts').then(m => ({ default: m.DeadlinesTimelineChart }))
);
const CountryDistributionChart = lazy(() =>
  import('./OpportunitiesCharts').then(m => ({ default: m.CountryDistributionChart }))
);
const FundingTypeDistributionChart = lazy(() =>
  import('./OpportunitiesCharts').then(m => ({ default: m.FundingTypeDistributionChart }))
);
const DegreeLevelDistributionChart = lazy(() =>
  import('./OpportunitiesCharts').then(m => ({ default: m.DegreeLevelDistributionChart }))
);
const StudyFieldDistributionChart = lazy(() =>
  import('./OpportunitiesCharts').then(m => ({ default: m.StudyFieldDistributionChart }))
);

const CsvImportView = lazy(() =>
  import('../import/CsvImportView').then(m => ({ default: m.CsvImportView }))
);
const DataQualityView = lazy(() =>
  import('../quality/DataQualityView').then(m => ({ default: m.DataQualityView }))
);
const ActivityLogView = lazy(() =>
  import('../activity/ActivityLogView').then(m => ({ default: m.ActivityLogView }))
);
const AdminSettingsView = lazy(() =>
  import('../settings/AdminSettingsView').then(m => ({ default: m.AdminSettingsView }))
);
const VivaPackModal = lazy(() =>
  import('../viva/VivaPackModal').then(m => ({ default: m.VivaPackModal }))
);
const RecordUpsertModal = lazy(() =>
  import('../records/RecordUpsertModal').then(m => ({ default: m.RecordUpsertModal }))
);

const ViewSkeleton: React.FC = () => (
  <div className="p-8 text-center text-xs text-slate-400 space-y-3">
    <div className="w-6 h-6 border-2 border-[#12805c] border-t-transparent rounded-full animate-spin mx-auto"></div>
    <p>Loading module...</p>
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="h-72 sm:h-80 rounded-xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
    Loading visualization...
  </div>
);

interface Props {}

export const DashboardMaster: React.FC<Props> = () => {
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Data State
  const [stats, setStats] = useState<OpportunityStats | null>(null);
  const [records, setRecords] = useState<Opportunity[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<DataFilterOptions>({
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
    page_size: 10,
  });

  // Modals & Drawers
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<Opportunity | null>(null);
  const [editingRecord, setEditingRecord] = useState<Opportunity | null>(null);
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isVivaGuideOpen, setIsVivaGuideOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, recordsData] = await Promise.all([
        api.getStats().catch(() => null),
        api.listRecords(filters).catch(() => ({ data: [], total: 0, page: 1, page_size: 10, total_pages: 1 })),
      ]);

      if (statsData) setStats(statsData);
      setRecords(recordsData.data);
      setTotalRecords(recordsData.total);
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSaveRecord = async (payload: any) => {
    try {
      if (editingRecord) {
        await api.updateRecord(editingRecord.id, payload);
        showToast('Scholarship opportunity updated successfully.');
      } else {
        await api.createRecord(payload);
        showToast('New opportunity curated and indexed.');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save opportunity', 'error');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!isAdmin) {
      showToast('Forbidden: Administrator authorization required.', 'error');
      return;
    }

    try {
      await api.deleteRecord(id);
      showToast('Opportunity permanently removed from repository.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  const handleToggleArchive = async (id: string, archive: boolean) => {
    if (!isAdmin) {
      showToast('Forbidden: Administrator authorization required.', 'error');
      return;
    }

    try {
      await api.archiveRecord(id, archive);
      showToast(`Opportunity ${archive ? 'archived' : 'restored'} successfully.`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleResetData = async () => {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      'Reset database to default seed state? This restores the 112 curated opportunities and 4 test fixtures.'
    );
    if (!confirmed) return;

    try {
      await api.resetSeed();
      showToast('Database reset to default 112 seed opportunities.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#081524] text-slate-100 flex font-sans overflow-x-hidden">
      {/* Sidebar (Desktop permanent / collapsible rail; Mobile slide-over drawer) */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsUpsertOpen(true);
        }}
        onExportCSV={() => api.downloadExportCSV(filters)}
        onResetData={handleResetData}
        onOpenVivaGuide={() => setIsVivaGuideOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Compact Header with Mobile Menu Trigger */}
        <Header
          activeView={activeView}
          onOpenVivaGuide={() => setIsVivaGuideOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Global Alert / Toast Notification */}
        {toast && (
          <div className="px-3.5 sm:px-6 pt-3">
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-fadeIn shadow-md ${
                toast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-800 text-rose-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-auto text-slate-400 hover:text-white text-xs pl-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
          {/* VIEW: DASHBOARD OVERVIEW */}
          {activeView === 'dashboard' && stats && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              {/* Header Action Strip */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white font-serif">
                    Scholarship Intelligence Overview
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live database metrics for funded technical graduate study for Indian candidates.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingRecord(null);
                        setIsUpsertOpen(true);
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#12805c] hover:bg-[#0f6b4d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Curate Opportunity</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setActiveView('import')}
                      className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#1ec992]" />
                      <span>Batch Ingest</span>
                    </button>
                  )}

                  <button
                    onClick={() => api.downloadExportCSV(filters)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 10 Dashboard Summary Cards: Single/2-col mobile, 3-col tablet, 5-col desktop */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Dataset Metric Cards (10 Core Indicators)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Calculated from current database state
                  </span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  <MetricCard
                    label="Total Opportunities"
                    value={stats.total_records}
                    subtext="Total database rows"
                    icon={GraduationCap}
                    colorClass="bg-emerald-500/10 text-[#1ec992] border border-emerald-500/20"
                  />

                  <MetricCard
                    label="Active Opportunities"
                    value={stats.active_count}
                    subtext="Open and verified"
                    icon={Check}
                    colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  />

                  <MetricCard
                    label="Inactive Opportunities"
                    value={stats.inactive_count}
                    subtext="Archived or fixtures"
                    icon={XCircle}
                    colorClass="bg-slate-800 text-slate-400 border border-slate-700"
                  />

                  <MetricCard
                    label="Full Funding"
                    value={stats.full_funding_count}
                    subtext="100% Tuition + Stipend"
                    icon={Award}
                    colorClass="bg-emerald-500/10 text-[#1ec992] border border-emerald-500/20"
                  />

                  <MetricCard
                    label="Partial Funding"
                    value={stats.partial_funding_count}
                    subtext="Fee reductions & bursaries"
                    icon={Layers}
                    colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  />

                  <MetricCard
                    label="Tuition Waivers"
                    value={stats.tuition_waiver_count}
                    subtext="100% Academic fee grants"
                    icon={Building}
                    colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  />

                  <MetricCard
                    label="Host Countries"
                    value={stats.distinct_countries_count}
                    subtext="Global research destinations"
                    icon={Globe}
                    colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  />

                  <MetricCard
                    label="Indian Eligible"
                    value={stats.indian_eligible_count}
                    subtext="Technical degree verified"
                    icon={ShieldCheck}
                    colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  />

                  <MetricCard
                    label="Upcoming Deadlines"
                    value={stats.closing_in_30_days}
                    subtext="Closing in ≤30 days"
                    icon={Clock}
                    colorClass="bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  />

                  <MetricCard
                    label="Quality / Flagged"
                    value={stats.suspicious_missing_count}
                    subtext="Placeholder URLs / missing"
                    icon={AlertTriangle}
                    colorClass="bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  />
                </div>
              </div>

              {/* 5 Analytical Visualizations (Recharts, lazy-loaded) */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Interactive Dataset Visualizations (Recharts)
                </span>

                {/* Row 1: Deadlines & Country Distribution (side-by-side on tablet/desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Suspense fallback={<ChartSkeleton />}>
                    <DeadlinesTimelineChart stats={stats} />
                  </Suspense>
                  <Suspense fallback={<ChartSkeleton />}>
                    <CountryDistributionChart stats={stats} />
                  </Suspense>
                </div>

                {/* Row 2: Funding Type, Degree Level, and Study Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Suspense fallback={<ChartSkeleton />}>
                    <FundingTypeDistributionChart stats={stats} />
                  </Suspense>
                  <Suspense fallback={<ChartSkeleton />}>
                    <DegreeLevelDistributionChart stats={stats} />
                  </Suspense>
                  <Suspense fallback={<ChartSkeleton />}>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <StudyFieldDistributionChart stats={stats} />
                    </div>
                  </Suspense>
                </div>
              </div>

              {/* Data Quality Overview Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-white font-serif">Data Quality Audit & Compliance</h3>
                  </div>
                  <button
                    onClick={() => setActiveView('quality')}
                    className="min-h-[38px] text-[#1ec992] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Open Full Quality Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Unverified URLs:</span>
                    <span className="text-base font-bold text-amber-400 tabular-nums">
                      {stats.unverified_urls_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Flagged example.com domains</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Rolling / No Deadline:</span>
                    <span className="text-base font-bold text-blue-400 tabular-nums">
                      {stats.no_deadline}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Continuous evaluation</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Stale Verifications:</span>
                    <span className="text-base font-bold text-purple-400 tabular-nums">
                      {stats.stale_verifications_count}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">&gt;90 days since audit</span>
                  </div>
                </div>

                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All seed opportunities are cataloged with transparent quality compliance. Inspect the Data Quality scanner to audit heuristic rules.
                </p>
              </div>

              {/* Records Preview Table */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-serif">Curated Opportunities Catalog</h3>
                    <p className="text-xs text-slate-400">Search and filter active scholarships</p>
                  </div>
                  <button
                    onClick={() => setActiveView('records')}
                    className="min-h-[38px] text-xs text-[#1ec992] hover:underline font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>View All Opportunities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <RecordsTable
                  records={records}
                  total={totalRecords}
                  filters={filters}
                  setFilters={setFilters}
                  onViewRecord={r => setSelectedRecordForDetail(r)}
                  onEditRecord={r => {
                    setEditingRecord(r);
                    setIsUpsertOpen(true);
                  }}
                  onDeleteRecord={handleDeleteRecord}
                  onToggleArchive={handleToggleArchive}
                  canEdit={isAdmin}
                  canDelete={isAdmin}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: RECORDS CATALOG */}
          {activeView === 'records' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white font-serif">Scholarship Opportunities Catalog</h1>
                  <p className="text-xs text-slate-400">
                    Curated technical master's and fellowship opportunities for Indian applicants across 25 nations.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingRecord(null);
                        setIsUpsertOpen(true);
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#12805c] hover:bg-[#0f6b4d] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Curate Opportunity</span>
                    </button>
                  )}
                  <button
                    onClick={() => api.downloadExportCSV(filters)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <RecordsTable
                records={records}
                total={totalRecords}
                filters={filters}
                setFilters={setFilters}
                onViewRecord={r => setSelectedRecordForDetail(r)}
                onEditRecord={r => {
                  setEditingRecord(r);
                  setIsUpsertOpen(true);
                }}
                onDeleteRecord={handleDeleteRecord}
                onToggleArchive={handleToggleArchive}
                canEdit={isAdmin}
                canDelete={isAdmin}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* VIEW 4: CSV IMPORT (Lazy Loaded) */}
          {activeView === 'import' && (
            <div className="animate-fadeIn">
              <Suspense fallback={<ViewSkeleton />}>
                <CsvImportView
                  onImportComplete={() => {
                    loadData();
                    showToast('Import completed. Dashboard metrics updated.');
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* VIEW 6: QUALITY SCANNER (Lazy Loaded) */}
          {activeView === 'quality' && (
            <div className="animate-fadeIn">
              <Suspense fallback={<ViewSkeleton />}>
                <DataQualityView
                  onSelectRecordToInspect={id => {
                    api.getRecord(id).then(r => setSelectedRecordForDetail(r));
                  }}
                  onFilterRecords={newFilters => {
                    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
                    setActiveView('records');
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* VIEW 7: ACTIVITY LOGS (Lazy Loaded) */}
          {activeView === 'activity' && (
            <div className="animate-fadeIn">
              <Suspense fallback={<ViewSkeleton />}>
                <ActivityLogView />
              </Suspense>
            </div>
          )}

          {/* VIEW 8: ADMIN SETTINGS (Lazy Loaded) */}
          {activeView === 'settings' && (
            <div className="animate-fadeIn">
              <Suspense fallback={<ViewSkeleton />}>
                <AdminSettingsView
                  onResetSeedSuccess={loadData}
                  showToast={showToast}
                />
              </Suspense>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <RecordDetailDrawer
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onEdit={r => {
          setEditingRecord(r);
          setIsUpsertOpen(true);
        }}
        onToggleArchive={handleToggleArchive}
        canEdit={isAdmin}
      />

      <Suspense fallback={null}>
        {isUpsertOpen && (
          <RecordUpsertModal
            isOpen={isUpsertOpen}
            onClose={() => {
              setIsUpsertOpen(false);
              setEditingRecord(null);
            }}
            onSubmit={handleSaveRecord}
            initialRecord={editingRecord}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {isVivaGuideOpen && (
          <VivaPackModal isOpen={isVivaGuideOpen} onClose={() => setIsVivaGuideOpen(false)} />
        )}
      </Suspense>
    </div>
  );
};
