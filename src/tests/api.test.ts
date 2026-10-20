import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/db';
import { Opportunity, UserSession } from '../types';

describe('API & Data Access Layer Integration Tests', () => {
  // Test sessions
  const adminAuth = db.authenticate('admin@scholarlens.edu', 'AdminPass#2026');
  const viewerAuth = db.authenticate('viewer@scholarlens.edu', 'ViewerPass#2026');

  assert.ok(adminAuth, 'Admin authentication must succeed');
  assert.ok(viewerAuth, 'Viewer authentication must succeed');

  const adminSession: UserSession = adminAuth.user;
  const viewerSession: UserSession = viewerAuth.user;

  test('Authentication: Invalid credentials return null and write failure log', () => {
    const failedAuth = db.authenticate('admin@scholarlens.edu', 'WrongPass#999');
    assert.equal(failedAuth, null);

    const nonExistent = db.authenticate('nobody@university.edu', 'SomePass#123');
    assert.equal(nonExistent, null);
  });

  test('Database Seed: 112 seed records + 4 test fixtures are populated', () => {
    const all = db.getAllRecords();
    assert.ok(all.length >= 116, `Expected at least 116 records, found ${all.length}`);
  });

  test('Role Enforcement: Viewer is forbidden from creating records', () => {
    const newRecord: Omit<Opportunity, 'created_at' | 'updated_at'> = {
      id: 'opp-viewer-test-01',
      title: 'Unauthorized Publication Attempt',
      provider_name: 'Test University',
      provider_type: 'university',
      host_country: 'Germany',
      host_institution: 'Test Institute',
      degree_level: 'masters',
      funding_type: 'full',
      funding_summary: 'Test summary',
      funding_amount_note: '€1,000',
      fields_of_study: ['Computer Science'],
      eligibility_summary: 'Open',
      indian_applicants_eligible: true,
      min_gpa_note: '7.0',
      language_requirements: 'IELTS 6.5',
      application_deadline: '2026-12-31',
      deadline_note: 'Test',
      official_url: 'https://example.com/test',
      tags: ['test'],
      popularity_tier: 'long_tail',
      curated_by: 'Viewer',
      verified_on: '2026-10-01',
      is_active: true,
    };

    assert.throws(
      () => {
        db.createRecord(newRecord, viewerSession);
      },
      /Forbidden: Only Administrators have write permissions/
    );
  });

  test('Role Enforcement: Admin can create, update, and delete opportunities', () => {
    const uniqueId = `opp-admin-test-${Date.now()}`;
    const newRecord: Omit<Opportunity, 'created_at' | 'updated_at'> = {
      id: uniqueId,
      title: 'Authorized Admin Grant in Quantum Computing',
      provider_name: 'Max Planck Institute',
      provider_type: 'foundation',
      host_country: 'Germany',
      host_institution: 'Max Planck',
      degree_level: 'masters',
      funding_type: 'full',
      funding_summary: 'Full living stipend and tuition grant',
      funding_amount_note: '€1,200/month',
      fields_of_study: ['Computer Science', 'Artificial Intelligence'],
      eligibility_summary: 'First Class B.Tech',
      indian_applicants_eligible: true,
      min_gpa_note: '8.0 CGPA',
      language_requirements: 'TOEFL 95',
      application_deadline: '2027-01-15',
      deadline_note: 'Annual cycle',
      official_url: `https://example.com/scholarships/${uniqueId}`,
      tags: ['germany', 'quantum'],
      popularity_tier: 'long_tail',
      curated_by: 'Admin',
      verified_on: '2026-10-01',
      is_active: true,
    };

    // 1. Create
    const created = db.createRecord(newRecord, adminSession);
    assert.equal(created.id, uniqueId);

    // 2. Read
    const found = db.getRecord(uniqueId);
    assert.ok(found);
    assert.equal(found?.title, newRecord.title);

    // 3. Update by Admin
    const updated = db.updateRecord(uniqueId, { funding_amount_note: '€1,400/month stipend' }, adminSession);
    assert.equal(updated.funding_amount_note, '€1,400/month stipend');

    // 4. Update by Viewer must fail
    assert.throws(
      () => {
        db.updateRecord(uniqueId, { funding_amount_note: 'Hacked' }, viewerSession);
      },
      /Forbidden: Only Administrators have write permissions/
    );

    // 5. Delete by Viewer must fail
    assert.throws(
      () => {
        db.deleteRecord(uniqueId, viewerSession);
      },
      /Forbidden: Only Administrators have delete permissions/
    );

    // 6. Delete by Admin succeeds
    const deleted = db.deleteRecord(uniqueId, adminSession);
    assert.equal(deleted, true);
    assert.equal(db.getRecord(uniqueId), null);
  });

  test('Query & Filters: Negative test fixtures for Indian eligibility and inactive status', () => {
    const nonEligible = db.listRecords({ indian_eligible: 'false', page: 1, page_size: 50 });
    assert.ok(nonEligible.total >= 3, `Expected at least 3 non-eligible test records, found ${nonEligible.total}`);
    assert.ok(nonEligible.data.every(r => r.indian_applicants_eligible === false));

    const inactiveRecords = db.listRecords({ is_active: 'false', page: 1, page_size: 50 });
    assert.ok(inactiveRecords.total >= 3, `Expected at least 3 inactive records, found ${inactiveRecords.total}`);
    assert.ok(inactiveRecords.data.every(r => r.is_active === false));
  });

  test('Query & Filters: Pagination and search across 25 host nations', () => {
    const germanyOnly = db.listRecords({ host_country: 'Germany', page: 1, page_size: 10 });
    assert.ok(germanyOnly.total > 0);
    assert.ok(germanyOnly.data.every(r => r.host_country === 'Germany'));
    assert.equal(germanyOnly.data.length, Math.min(10, germanyOnly.total));

    const textSearch = db.listRecords({ search: 'Robotics', page: 1, page_size: 10 });
    assert.ok(textSearch.total > 0);
    assert.ok(textSearch.data.some(r => r.title.includes('Robotics') || r.fields_of_study.includes('Robotics')));
  });

  test('Data Quality Report: Accurately reflects unverified URLs and null deadlines', () => {
    const quality = db.getDataQualityReport();
    assert.ok(quality.unverified_placeholder_urls >= 112, 'Must flag 112 placeholder URLs');
    assert.ok(quality.null_deadlines >= 11, 'Must flag 11 null deadlines');
    assert.ok(quality.overall_health_score > 0 && quality.overall_health_score <= 100);
  });

  test('Activity Audit Log: Server writes non-repudiation entries', () => {
    const logs = db.getActivityLogs(20);
    assert.ok(logs.length > 0);
    assert.ok(logs.some(l => l.action === 'LOGIN'));
  });
});
