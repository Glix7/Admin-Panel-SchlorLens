export interface Opportunity {
  id: string; // "opp-lt-001" (long-tail) | "opp-wk-001" (well-known)
  title: string;
  provider_name: string;
  provider_type: 'university' | 'foundation' | 'government' | 'corporate';
  host_country: string; // 25 distinct values in seed
  host_institution: string;
  degree_level: 'masters' | 'masters_or_phd';
  funding_type: 'full' | 'partial' | 'stipend_only' | 'tuition_waiver' | 'travel_grant';
  funding_summary: string;
  funding_amount_note: string;
  fields_of_study: string[];
  eligibility_summary: string;
  indian_applicants_eligible: boolean;
  min_gpa_note: string;
  language_requirements: string;
  application_deadline: string | null; // ISO date, null in 11 seed rows
  deadline_note: string;
  official_url: string;
  tags: string[];
  popularity_tier: 'long_tail' | 'well_known';
  curated_by: string;
  verified_on: string; // ISO date
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string;
}

export type DeadlineStatus = 'open' | 'closing' | 'expired' | 'none';

export type UserRole = 'admin' | 'viewer';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'RESET';
  record_id?: string;
  summary: string;
  changed_fields?: string[];
}

export interface DataFilterOptions {
  search?: string;
  host_country?: string;
  funding_type?: string;
  provider_type?: string;
  degree_level?: string;
  deadline_status?: DeadlineStatus | 'all';
  indian_eligible?: 'all' | 'true' | 'false';
  is_active?: 'all' | 'true' | 'false';
  popularity_tier?: 'all' | 'long_tail' | 'well_known';
  sort_by?: 'application_deadline' | 'title' | 'host_country' | 'created_at' | 'verified_on';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OpportunityStats {
  total_records: number;
  active_count: number;
  inactive_count: number;
  full_funding_count: number;
  partial_funding_count: number;
  tuition_waiver_count: number;
  distinct_countries_count: number;
  indian_eligible_count: number;
  created_today: number;
  closing_in_30_days: number;
  deadline_passed: number;
  no_deadline: number;
  suspicious_missing_count: number;
  avg_completeness_pct: number;
  by_country: Array<{ country: string; count: number }>;
  by_funding_type: Array<{ type: string; count: number }>;
  by_provider_type: Array<{ type: string; count: number }>;
  by_degree_level: Array<{ degree: string; count: number }>;
  by_field: Array<{ field: string; count: number }>;
  by_deadline_month: Array<{ month: string; count: number }>;
  unverified_urls_count: number;
  stale_verifications_count: number;
}

export interface DataQualityReport {
  total_checked: number;
  unverified_placeholder_urls: number;
  null_deadlines: number;
  expired_deadlines: number;
  stale_verifications: number;
  duplicate_titles: Array<{ title: string; count: number }>;
  missing_required_fields: Array<{ id: string; title: string; missing: string[] }>;
  overall_health_score: number;
}
