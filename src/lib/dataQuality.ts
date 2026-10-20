import { Opportunity, DataQualityReport } from '../types';
import { computeDeadlineStatus, isVerificationStale, isPlaceholderUrl } from './deadline';

export function calculateOpportunityCompleteness(opp: Partial<Opportunity>): number {
  const fieldsToCheck: Array<keyof Opportunity> = [
    'title',
    'provider_name',
    'provider_type',
    'host_country',
    'host_institution',
    'degree_level',
    'funding_type',
    'funding_summary',
    'funding_amount_note',
    'fields_of_study',
    'eligibility_summary',
    'indian_applicants_eligible',
    'min_gpa_note',
    'language_requirements',
    'application_deadline',
    'deadline_note',
    'official_url',
    'tags',
    'popularity_tier',
    'curated_by',
    'verified_on',
  ];

  let filledCount = 0;
  for (const field of fieldsToCheck) {
    const val = opp[field];
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && val.trim().length > 0) filledCount++;
    else if (Array.isArray(val) && val.length > 0) filledCount++;
    else if (typeof val === 'boolean') filledCount++;
  }

  return Math.round((filledCount / fieldsToCheck.length) * 100);
}

export function generateDataQualityReport(
  records: Opportunity[],
  referenceDate: Date = new Date()
): DataQualityReport {
  let unverifiedUrls = 0;
  let nullDeadlines = 0;
  let expiredDeadlines = 0;
  let staleVerifications = 0;

  const titleCounts: Record<string, number> = {};
  const missingRequired: Array<{ id: string; title: string; missing: string[] }> = [];

  for (const r of records) {
    if (isPlaceholderUrl(r.official_url)) {
      unverifiedUrls++;
    }

    const deadlineStatus = computeDeadlineStatus(r.application_deadline, referenceDate);
    if (deadlineStatus === 'none') {
      nullDeadlines++;
    } else if (deadlineStatus === 'expired') {
      expiredDeadlines++;
    }

    if (isVerificationStale(r.verified_on, 90, referenceDate)) {
      staleVerifications++;
    }

    // Duplicate title check
    const normalizedTitle = `${r.title.toLowerCase().trim()}::${r.provider_name.toLowerCase().trim()}`;
    titleCounts[normalizedTitle] = (titleCounts[normalizedTitle] || 0) + 1;

    // Check essential fields
    const missing: string[] = [];
    if (!r.title) missing.push('title');
    if (!r.provider_name) missing.push('provider_name');
    if (!r.host_country) missing.push('host_country');
    if (!r.fields_of_study || r.fields_of_study.length === 0) missing.push('fields_of_study');
    if (!r.funding_summary) missing.push('funding_summary');

    if (missing.length > 0) {
      missingRequired.push({ id: r.id, title: r.title || 'Untitled', missing });
    }
  }

  const duplicates = Object.entries(titleCounts)
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => ({ title: key.split('::')[0], count }));

  // Score calculation: start at 100, deduct penalties
  let score = 100;
  if (records.length > 0) {
    // Penalty for placeholder URLs (up to 30 pts)
    const urlPenalty = Math.min(30, Math.round((unverifiedUrls / records.length) * 30));
    // Penalty for expired or missing deadlines without notes (up to 20 pts)
    const deadlinePenalty = Math.min(20, Math.round((nullDeadlines / records.length) * 20));
    // Penalty for stale verifications (up to 20 pts)
    const stalePenalty = Math.min(20, Math.round((staleVerifications / records.length) * 20));
    // Penalty for duplicates (up to 15 pts)
    const dupPenalty = Math.min(15, duplicates.length * 5);

    score = Math.max(10, 100 - urlPenalty - deadlinePenalty - stalePenalty - dupPenalty);
  }

  return {
    total_checked: records.length,
    unverified_placeholder_urls: unverifiedUrls,
    null_deadlines: nullDeadlines,
    expired_deadlines: expiredDeadlines,
    stale_verifications: staleVerifications,
    duplicate_titles: duplicates,
    missing_required_fields: missingRequired,
    overall_health_score: score,
  };
}
