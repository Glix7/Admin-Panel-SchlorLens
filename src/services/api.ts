import {
  Opportunity,
  UserSession,
  ActivityLog,
  DataFilterOptions,
  PaginatedResult,
  OpportunityStats,
  DataQualityReport,
} from '../types';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (options.body && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include', // Ensure httpOnly session cookie is transmitted
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
    });

    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Authentication required');
    }

    if (response.status === 403) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Forbidden: Administrator privileges required for this action.');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth API
  public async login(email: string, pass: string): Promise<UserSession> {
    const res = await this.request<{ user: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    return res.user;
  }

  public async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
  }

  public async getSession(): Promise<UserSession | null> {
    const res = await this.request<{ user: UserSession | null }>('/api/auth/session');
    return res.user;
  }

  // Records API
  public async listRecords(filters: DataFilterOptions): Promise<PaginatedResult<Opportunity>> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.host_country && filters.host_country !== 'all') params.set('host_country', filters.host_country);
    if (filters.funding_type && filters.funding_type !== 'all') params.set('funding_type', filters.funding_type);
    if (filters.provider_type && filters.provider_type !== 'all') params.set('provider_type', filters.provider_type);
    if (filters.degree_level && filters.degree_level !== 'all') params.set('degree_level', filters.degree_level);
    if (filters.deadline_status && filters.deadline_status !== 'all') params.set('deadline_status', filters.deadline_status);
    if (filters.indian_eligible && filters.indian_eligible !== 'all') params.set('indian_eligible', filters.indian_eligible);
    if (filters.is_active && filters.is_active !== 'all') params.set('is_active', filters.is_active);
    if (filters.popularity_tier && filters.popularity_tier !== 'all') params.set('popularity_tier', filters.popularity_tier);
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_order) params.set('sort_order', filters.sort_order);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.page_size) params.set('page_size', String(filters.page_size));

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedResult<Opportunity>>(`/api/records${query}`);
  }

  public async getRecord(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`/api/records/${id}`);
  }

  public async createRecord(data: Omit<Opportunity, 'created_at' | 'updated_at'>): Promise<Opportunity> {
    return this.request<Opportunity>('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateRecord(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    return this.request<Opportunity>(`/api/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteRecord(id: string): Promise<void> {
    await this.request(`/api/records/${id}`, {
      method: 'DELETE',
    });
  }

  public async archiveRecord(id: string, archive: boolean): Promise<Opportunity> {
    return this.request<Opportunity>(`/api/records/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archive }),
    });
  }

  // Batch CSV Ingest
  public async importCSV(csvContent: string, onDuplicate: 'skip' | 'overwrite'): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    validationErrors: Array<{ row: number; reason: string }>;
    totalParsed: number;
  }> {
    return this.request('/api/records/import', {
      method: 'POST',
      body: JSON.stringify({ csvContent, onDuplicate }),
    });
  }

  // Trigger browser download for export
  public async downloadExportCSV(filters: DataFilterOptions): Promise<void> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.host_country && filters.host_country !== 'all') params.set('host_country', filters.host_country);
    if (filters.funding_type && filters.funding_type !== 'all') params.set('funding_type', filters.funding_type);
    if (filters.degree_level && filters.degree_level !== 'all') params.set('degree_level', filters.degree_level);
    if (filters.deadline_status && filters.deadline_status !== 'all') params.set('deadline_status', filters.deadline_status);

    const query = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `/api/records/export${query}`;
  }

  // Analytics & Quality
  public async getStats(): Promise<OpportunityStats> {
    return this.request<OpportunityStats>('/api/stats');
  }

  public async getActivityLogs(): Promise<ActivityLog[]> {
    return this.request<ActivityLog[]>('/api/activity');
  }

  public async getDataQualityReport(): Promise<DataQualityReport> {
    return this.request<DataQualityReport>('/api/data-quality');
  }

  public async resetSeed(): Promise<void> {
    await this.request('/api/admin/reset-seed', {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
  }
}

export const api = new ApiClient();
