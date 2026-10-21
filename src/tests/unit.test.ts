import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeDeadlineStatus, isVerificationStale, isPlaceholderUrl } from '../lib/deadline';
import {
  parseOpportunitiesCSV,
  exportOpportunitiesToCSV,
  sanitizeForFormulaInjection,
  escapeCSVCell,
} from '../lib/csvEngine';
import { calculateOpportunityCompleteness, generateDataQualityReport } from '../lib/dataQuality';
import { Opportunity } from '../types';

describe('Unit Tests: Deadline Computation Heuristics', () => {
  const refDate = new Date('2026-10-15T00:00:00.000Z');

  test('null or undefined deadline evaluates to "none"', () => {
    assert.equal(computeDeadlineStatus(null, refDate), 'none');
    assert.equal(computeDeadlineStatus(undefined, refDate), 'none');
    assert.equal(computeDeadlineStatus('', refDate), 'none');
  });

  test('deadline in past evaluates to "expired"', () => {
    assert.equal(computeDeadlineStatus('2026-09-01', refDate), 'expired');
    assert.equal(computeDeadlineStatus('2025-12-31', refDate), 'expired');
  });

  test('deadline within 30 days evaluates to "closing"', () => {
    assert.equal(computeDeadlineStatus('2026-10-25', refDate), 'closing');
    assert.equal(computeDeadlineStatus('2026-11-10', refDate), 'closing');
  });

  test('deadline greater than 30 days evaluates to "open"', () => {
    assert.equal(computeDeadlineStatus('2026-12-15', refDate), 'open');
    assert.equal(computeDeadlineStatus('2027-03-31', refDate), 'open');
  });

  test('stale verification heuristic identifies audits >90 days', () => {
    assert.equal(isVerificationStale('2026-06-01', 90, refDate), true);
    assert.equal(isVerificationStale('2026-09-20', 90, refDate), false);
    assert.equal(isVerificationStale(null, 90, refDate), true);
  });

  test('placeholder URL detector catches example.com and invalid protocols', () => {
    assert.equal(isPlaceholderUrl('https://example.com/scholarships/opp-001'), true);
    assert.equal(isPlaceholderUrl('http://localhost:3000/opp'), true);
    assert.equal(isPlaceholderUrl('https://www.daad.de/en/study-and-research/'), false);
    assert.equal(isPlaceholderUrl(''), true);
  });
});

describe('Unit Tests: CSV Parser, Exporter & Formula Injection Guard', () => {
  test('formula injection prefixes cells starting with =, +, -, @ with a single quote', () => {
    assert.equal(sanitizeForFormulaInjection('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.equal(sanitizeForFormulaInjection('+cmd|calc'), "'+cmd|calc");
    assert.equal(sanitizeForFormulaInjection('-500'), "'-500");
    assert.equal(sanitizeForFormulaInjection('@evil.com'), "'@evil.com");
    assert.equal(sanitizeForFormulaInjection('Safe Academic Title'), 'Safe Academic Title');
  });

  test('escapeCSVCell handles arrays, booleans, and quotes correctly', () => {
    assert.equal(escapeCSVCell(['CS', 'AI']), '"CS; AI"');
    assert.equal(escapeCSVCell(true), '"true"');
    assert.equal(escapeCSVCell('Quoted "Value"'), '"Quoted ""Value"""');
  });

  test('exportOpportunitiesToCSV outputs RFC 4180 format with UTF-8 BOM', () => {
    const dummyRecord: Opportunity = {
      id: 'test-opp-001',
      title: 'DAAD Master Fellowship',
      provider_name: 'DAAD',
      provider_type: 'government',
      host_country: 'Germany',
      host_institution: 'TUM',
      degree_level: 'masters',
      funding_type: 'full',
      funding_summary: 'Full funding coverage',
      funding_amount_note: '€934/mo',
      fields_of_study: ['Computer Science'],
      eligibility_summary: '7.5 CGPA',
      indian_applicants_eligible: true,
      min_gpa_note: '7.5 CGPA',
      language_requirements: 'IELTS 6.5',
      application_deadline: '2026-12-01',
      deadline_note: 'Winter deadline',
      official_url: 'https://example.com/test',
      tags: ['germany', 'full'],
      popularity_tier: 'well_known',
      curated_by: 'Curator',
      verified_on: '2026-08-01',
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const csvOutput = exportOpportunitiesToCSV([dummyRecord]);
    assert.ok(csvOutput.startsWith('\uFEFF"id","title"'));
    assert.ok(csvOutput.includes('"test-opp-001"'));
    assert.ok(csvOutput.includes('"DAAD Master Fellowship"'));
  });

  test('parseOpportunitiesCSV rejects rows with missing mandatory headers', () => {
    const invalidCSV = `name,country,amount\nTest Title,Germany,1000`;
    const res = parseOpportunitiesCSV(invalidCSV);
    assert.equal(res.validRecords.length, 0);
    assert.ok(res.errors.length > 0);
    assert.ok(res.errors[0].reason.includes('Missing mandatory CSV column'));
  });

  test('parseOpportunitiesCSV validates valid rows and catches per-row errors', () => {
    const validCSV = `id,title,provider_name,host_country,degree_level,funding_type,official_url
opp-valid-01,Valid Fellowship in Robotics,Max Planck,Germany,masters,full,https://example.com/1
opp-bad-02,,Max Planck,Germany,masters,full,https://example.com/2`;

    const res = parseOpportunitiesCSV(validCSV);
    assert.equal(res.validRecords.length, 1);
    assert.equal(res.validRecords[0].id, 'opp-valid-01');
    assert.equal(res.errors.length, 1);
    assert.equal(res.errors[0].row, 3); // Second data row is line 3
    assert.ok(res.errors[0].reason.includes('Title is empty or too short'));
  });

  test('parseOpportunitiesCSV accepts ngo provider_type and phd degree_level', () => {
    const csv = `id,title,provider_name,provider_type,host_country,degree_level,funding_type,official_url
opp-ngo-phd-01,Climate Tech Doctoral Fellowship,GreenEarth Foundation,ngo,Germany,phd,full,https://example.com/ngo-phd`;
    const res = parseOpportunitiesCSV(csv);
    assert.equal(res.validRecords.length, 1);
    assert.equal(res.validRecords[0].provider_type, 'ngo');
    assert.equal(res.validRecords[0].degree_level, 'phd');
    assert.equal(res.errors.length, 0);
  });
});

describe('Unit Tests: Opportunity Completeness & Quality Scoring', () => {
  test('calculateOpportunityCompleteness returns percentage of non-empty attributes', () => {
    const fullRecord: Partial<Opportunity> = {
      title: 'Stanford Graduate Fellowship',
      provider_name: 'Stanford University',
      provider_type: 'university',
      host_country: 'United States',
      host_institution: 'Stanford',
      degree_level: 'masters',
      funding_type: 'full',
      funding_summary: 'Full tuition and living stipend',
      funding_amount_note: '$40,000/year',
      fields_of_study: ['Artificial Intelligence'],
      eligibility_summary: 'B.Tech CS',
      indian_applicants_eligible: true,
      min_gpa_note: '8.0 CGPA',
      language_requirements: 'TOEFL 100',
      application_deadline: '2026-11-01',
      deadline_note: 'Annual cycle',
      official_url: 'https://example.com/stanford',
      tags: ['stanford', 'ai'],
      popularity_tier: 'well_known',
      curated_by: 'Admin',
      verified_on: '2026-08-01',
    };

    const completeness = calculateOpportunityCompleteness(fullRecord);
    assert.equal(completeness, 100);

    const sparseRecord: Partial<Opportunity> = {
      title: 'Sparse Record',
      provider_name: 'Unknown',
    };
    const sparseCompleteness = calculateOpportunityCompleteness(sparseRecord);
    assert.ok(sparseCompleteness < 20);
  });
});

describe('Unit Tests: Authentication Error Formatting (Anti [object Object])', async () => {
  const { formatAuthError } = await import('../components/auth/LoginForm');

  test('Error instance with "[object Object]" message falls back to institutional error', () => {
    const err = new Error('[object Object]');
    const formatted = formatAuthError(err);
    assert.notEqual(formatted, '[object Object]');
    assert.equal(formatted, 'Invalid institutional credentials. Verify email and password.');
  });

  test('Nested API error object { error: { message: "Invalid credentials" } } is extracted cleanly', () => {
    const err = { error: { message: 'Incorrect institutional credentials' } };
    assert.equal(formatAuthError(err), 'Incorrect institutional credentials');
  });

  test('Vercel serverless error { error: { code: "FUNCTION_INVOCATION_FAILED" } } is parsed cleanly', () => {
    const err = { error: { code: 'FUNCTION_INVOCATION_FAILED' } };
    assert.equal(formatAuthError(err), 'Server error (FUNCTION_INVOCATION_FAILED). Please try again.');
  });

  test('Standard string error is preserved without [object Object]', () => {
    assert.equal(formatAuthError('Rate limit exceeded'), 'Rate limit exceeded');
    assert.equal(formatAuthError('[object Object]'), 'Invalid institutional credentials. Verify email and password.');
  });

  test('Null, undefined, or empty object returns safe fallback', () => {
    assert.equal(formatAuthError(null), 'Invalid institutional credentials. Verify email and password.');
    assert.equal(formatAuthError(undefined), 'Invalid institutional credentials. Verify email and password.');
    assert.equal(formatAuthError({}), 'Invalid institutional credentials. Verify email and password.');
  });
});

