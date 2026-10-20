import { Opportunity } from '../types';

export interface CSVParseResult {
  validRecords: Opportunity[];
  errors: Array<{ row: number; reason: string }>;
  totalRows: number;
}

export const MANDATORY_CSV_HEADERS = [
  'id',
  'title',
  'provider_name',
  'host_country',
  'degree_level',
  'funding_type',
  'official_url',
];

export const VALID_PROVIDER_TYPES = ['university', 'foundation', 'government', 'corporate'];
export const VALID_DEGREE_LEVELS = ['masters', 'masters_or_phd'];
export const VALID_FUNDING_TYPES = ['full', 'partial', 'stipend_only', 'tuition_waiver', 'travel_grant'];
export const VALID_POPULARITY_TIERS = ['long_tail', 'well_known'];

/**
 * Sanitizes cell values to guard against CSV Formula Injection Attacks
 * Prefixes cells beginning with =, +, -, @, or \t with a single quote.
 */
export function sanitizeForFormulaInjection(value: string): string {
  if (!value) return '';
  const firstChar = value.charAt(0);
  if (['=', '+', '-', '@', '\t', '\r'].includes(firstChar)) {
    return `'${value}`;
  }
  return value;
}

export function escapeCSVCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = '';
  if (Array.isArray(val)) {
    str = val.join('; ');
  } else if (typeof val === 'boolean') {
    str = val ? 'true' : 'false';
  } else {
    str = String(val);
  }
  str = sanitizeForFormulaInjection(str);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export function exportOpportunitiesToCSV(records: Opportunity[]): string {
  const headers: Array<keyof Opportunity> = [
    'id',
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
    'is_active',
    'created_at',
    'updated_at',
  ];

  const headerRow = headers.map(h => `"${h}"`).join(',');
  const dataRows = records.map(r => headers.map(h => escapeCSVCell(r[h])).join(','));

  // UTF-8 with BOM (\uFEFF) for proper Excel character encoding
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

export function parseOpportunitiesCSV(rawText: string): CSVParseResult {
  const cleanText = rawText.replace(/^\uFEFF/, ''); // Strip BOM if present
  const lines = splitCSVLines(cleanText);
  const result: CSVParseResult = { validRecords: [], errors: [], totalRows: 0 };

  if (lines.length < 2) {
    result.errors.push({ row: 1, reason: 'File is empty or missing data rows.' });
    return result;
  }

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

  // Verify all mandatory columns exist
  for (const req of MANDATORY_CSV_HEADERS) {
    if (!rawHeaders.includes(req.toLowerCase())) {
      result.errors.push({
        row: 1,
        reason: `Missing mandatory CSV column: '${req}'. Found: [${rawHeaders.join(', ')}]`,
      });
      return result;
    }
  }

  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    result.totalRows++;
    const rowNum = i + 1;
    const tokens = parseCSVLine(rawLine);

    if (tokens.length < rawHeaders.length) {
      result.errors.push({
        row: rowNum,
        reason: `Column count mismatch: Expected at least ${rawHeaders.length} columns, found ${tokens.length}.`,
      });
      continue;
    }

    const id = tokens[headerMap['id']]?.trim();
    const title = tokens[headerMap['title']]?.trim();
    const providerName = tokens[headerMap['provider_name']]?.trim();
    const hostCountry = tokens[headerMap['host_country']]?.trim();
    const degreeLevel = (tokens[headerMap['degree_level']]?.trim().toLowerCase() || 'masters') as Opportunity['degree_level'];
    const fundingType = (tokens[headerMap['funding_type']]?.trim().toLowerCase() || 'full') as Opportunity['funding_type'];
    const officialUrl = tokens[headerMap['official_url']]?.trim() || '';

    // Validations
    if (!id || id.length < 3) {
      result.errors.push({ row: rowNum, reason: `Invalid ID '${id}'. Must be at least 3 characters.` });
      continue;
    }

    if (seenIds.has(id.toLowerCase())) {
      result.errors.push({ row: rowNum, reason: `Duplicate record ID '${id}' in upload payload.` });
      continue;
    }
    seenIds.add(id.toLowerCase());

    if (!title || title.length < 5) {
      result.errors.push({ row: rowNum, reason: `Title is empty or too short (< 5 chars).` });
      continue;
    }

    if (!providerName) {
      result.errors.push({ row: rowNum, reason: `Provider name is mandatory.` });
      continue;
    }

    if (!hostCountry) {
      result.errors.push({ row: rowNum, reason: `Host country is mandatory.` });
      continue;
    }

    if (!VALID_DEGREE_LEVELS.includes(degreeLevel)) {
      result.errors.push({
        row: rowNum,
        reason: `Invalid degree_level '${degreeLevel}'. Allowed: ${VALID_DEGREE_LEVELS.join(', ')}`,
      });
      continue;
    }

    if (!VALID_FUNDING_TYPES.includes(fundingType)) {
      result.errors.push({
        row: rowNum,
        reason: `Invalid funding_type '${fundingType}'. Allowed: ${VALID_FUNDING_TYPES.join(', ')}`,
      });
      continue;
    }

    const providerType = (tokens[headerMap['provider_type']]?.trim().toLowerCase() || 'university') as Opportunity['provider_type'];
    const hostInstitution = tokens[headerMap['host_institution']]?.trim() || providerName;
    const fundingSummary = tokens[headerMap['funding_summary']]?.trim() || `${fundingType} funding for technical graduate students.`;
    const fundingAmountNote = tokens[headerMap['funding_amount_note']]?.trim() || 'See official portal for breakdown.';
    const eligibilitySummary = tokens[headerMap['eligibility_summary']]?.trim() || 'Eligible technical degree required.';
    const minGpaNote = tokens[headerMap['min_gpa_note']]?.trim() || 'Minimum 7.0 CGPA recommended.';
    const languageRequirements = tokens[headerMap['language_requirements']]?.trim() || 'IELTS 6.5+ or TOEFL 90+.';

    const rawDeadline = tokens[headerMap['application_deadline']]?.trim() || null;
    const applicationDeadline = rawDeadline && !isNaN(Date.parse(rawDeadline)) ? rawDeadline.split('T')[0] : null;
    const deadlineNote = tokens[headerMap['deadline_note']]?.trim() || (applicationDeadline ? 'Subject to timezone deadlines.' : 'Rolling admission.');

    const fieldsRaw = tokens[headerMap['fields_of_study']]?.trim() || 'Computer Science';
    const fieldsOfStudy = fieldsRaw.split(/[;,]/).map(f => f.trim()).filter(Boolean);

    const tagsRaw = tokens[headerMap['tags']]?.trim() || '';
    const tags = tagsRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean);

    const popularityTier = (tokens[headerMap['popularity_tier']]?.trim().toLowerCase() || 'long_tail') as Opportunity['popularity_tier'];
    const curatedBy = tokens[headerMap['curated_by']]?.trim() || 'Admin Ingest';
    const verifiedOn = tokens[headerMap['verified_on']]?.trim() || new Date().toISOString().split('T')[0];
    const rawEligible = tokens[headerMap['indian_applicants_eligible']]?.trim().toLowerCase();
    const indianApplicantsEligible = rawEligible === 'false' ? false : true;
    const rawActive = tokens[headerMap['is_active']]?.trim().toLowerCase();
    const isActive = rawActive === 'false' ? false : true;

    result.validRecords.push({
      id,
      title,
      provider_name: providerName,
      provider_type: VALID_PROVIDER_TYPES.includes(providerType) ? providerType : 'university',
      host_country: hostCountry,
      host_institution: hostInstitution,
      degree_level: degreeLevel,
      funding_type: fundingType,
      funding_summary: fundingSummary,
      funding_amount_note: fundingAmountNote,
      fields_of_study: fieldsOfStudy.length > 0 ? fieldsOfStudy : ['Computer Science'],
      eligibility_summary: eligibilitySummary,
      indian_applicants_eligible: indianApplicantsEligible,
      min_gpa_note: minGpaNote,
      language_requirements: languageRequirements,
      application_deadline: applicationDeadline,
      deadline_note: deadlineNote,
      official_url: officialUrl || `https://example.com/scholarships/${id}`,
      tags: tags.length > 0 ? tags : [hostCountry.toLowerCase(), fundingType],
      popularity_tier: VALID_POPULARITY_TIERS.includes(popularityTier) ? popularityTier : 'long_tail',
      curated_by: curatedBy,
      verified_on: verifiedOn,
      is_active: isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return result;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (current.trim().length > 0) {
        lines.push(current);
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current);
  }
  return lines;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function downloadSampleCSV(): void {
  const sampleData: Opportunity[] = [
    {
      id: 'opp-lt-113',
      title: 'Heidelberg Research Fellowship in Medical Informatics',
      provider_name: 'Heidelberg University',
      provider_type: 'university',
      host_country: 'Germany',
      host_institution: 'Heidelberg University',
      degree_level: 'masters',
      funding_type: 'full',
      funding_summary: 'Full tuition waiver and €1,000 monthly stipend.',
      funding_amount_note: '€1,000/month stipend + health insurance',
      fields_of_study: ['Computer Science', 'Artificial Intelligence'],
      eligibility_summary: 'B.Tech CS/IT with 7.5+ CGPA',
      indian_applicants_eligible: true,
      min_gpa_note: 'Minimum 7.5 CGPA',
      language_requirements: 'IELTS 6.5+',
      application_deadline: '2026-12-15',
      deadline_note: 'Winter semester intake deadline.',
      official_url: 'https://example.com/scholarships/opp-lt-113',
      tags: ['germany', 'full-funding', 'ai'],
      popularity_tier: 'long_tail',
      curated_by: 'Admin Sample',
      verified_on: '2026-08-01',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const csvContent = exportOpportunitiesToCSV(sampleData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'scholar_lens_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
