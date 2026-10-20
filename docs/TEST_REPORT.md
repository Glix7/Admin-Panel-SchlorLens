# Scholar Lens: Automated Test Report
## B.Tech Final-Year Capstone Project Verification

---

## 1. Test Execution Summary

* **Execution Date:** 2026-10-19
* **Runtime Environment:** Node.js v22.14.0 + tsx v4.21.0
* **Test Runner:** Native Node.js Test Runner (`node:test`, `node:assert/strict`)
* **Execution Command:** `npm test` (`node --import tsx --test src/tests/unit.test.ts src/tests/api.test.ts`)
* **Total Tests Executed:** 20
* **Passed:** 20 (100%)
* **Failed:** 0 (0%)
* **Skipped:** 0
* **Duration:** 802 ms

---

## 2. Test Suites Breakdown

### Suite 1: API & Data Access Layer Integration Tests (`src/tests/api.test.ts`)
| Test ID | Test Description | Status | Duration |
|---|---|:---:|:---:|
| 1.1 | Authentication: Invalid credentials return null and write failure log | **PASS** | 92.4 ms |
| 1.2 | Database Seed: 112 seed records + 4 test fixtures are populated | **PASS** | 0.2 ms |
| 1.3 | Role Enforcement: Viewer is forbidden from creating records (403 check) | **PASS** | 2.6 ms |
| 1.4 | Role Enforcement: Admin can create, update, and delete opportunities | **PASS** | 7.2 ms |
| 1.5 | Query & Filters: Negative test fixtures for Indian eligibility and inactive status | **PASS** | 0.5 ms |
| 1.6 | Query & Filters: Pagination and search across 25 host nations | **PASS** | 0.8 ms |
| 1.7 | Data Quality Report: Accurately reflects unverified URLs and null deadlines | **PASS** | 1.3 ms |
| 1.8 | Activity Audit Log: Server writes non-repudiation entries | **PASS** | 0.3 ms |

### Suite 2: Deadline Computation Heuristics (`src/tests/unit.test.ts`)
| Test ID | Test Description | Status | Duration |
|---|---|:---:|:---:|
| 2.1 | Null or undefined deadline evaluates to `none` | **PASS** | 1.0 ms |
| 2.2 | Deadline in past evaluates to `expired` | **PASS** | 0.2 ms |
| 2.3 | Deadline within 30 days evaluates to `closing` | **PASS** | 0.1 ms |
| 2.4 | Deadline greater than 30 days evaluates to `open` | **PASS** | 0.2 ms |
| 2.5 | Stale verification heuristic identifies audits >90 days | **PASS** | 0.2 ms |
| 2.6 | Placeholder URL detector catches `example.com` and invalid protocols | **PASS** | 0.2 ms |

### Suite 3: CSV Parser, Exporter & Formula Injection Guard (`src/tests/unit.test.ts`)
| Test ID | Test Description | Status | Duration |
|---|---|:---:|:---:|
| 3.1 | Formula injection prefixes cells starting with `=`, `+`, `-`, `@` with a single quote | **PASS** | 0.4 ms |
| 3.2 | `escapeCSVCell` handles arrays, booleans, and quotes correctly | **PASS** | 0.4 ms |
| 3.3 | `exportOpportunitiesToCSV` outputs RFC 4180 format with UTF-8 BOM | **PASS** | 0.6 ms |
| 3.4 | `parseOpportunitiesCSV` rejects rows with missing mandatory headers | **PASS** | 1.0 ms |
| 3.5 | `parseOpportunitiesCSV` validates valid rows and catches per-row errors | **PASS** | 0.8 ms |

### Suite 4: Opportunity Completeness & Quality Scoring (`src/tests/unit.test.ts`)
| Test ID | Test Description | Status | Duration |
|---|---|:---:|:---:|
| 4.1 | `calculateOpportunityCompleteness` returns percentage of non-empty attributes | **PASS** | 0.3 ms |

---

## 3. Type Checking & Compilation Verification

* **Type Checker:** TypeScript (`tsc --noEmit`)
  * **Result:** Exit code 0 (0 errors)
* **Production Bundler:** Vite (`vite build`)
  * **Result:** Build succeeded, assets compiled cleanly.

---

## 4. Manual Verification & User Journey

1. **Login Flow:** Verified with Admin (`admin@scholarlens.edu` / `AdminPass#2026`) and Viewer (`viewer@scholarlens.edu` / `ViewerPass#2026`). Wrong passwords return a 401 error.
2. **Role Restrictions:** Logged in as Viewer; write buttons are disabled, and attempts to invoke POST/PUT/DELETE return 403 Forbidden.
3. **Database & Data Display:** 112 seed opportunities across 25 host nations render in table.
4. **Data Quality Warnings:** Unverified URLs (`example.com`), null deadlines, expired deadlines, and stale audits are surfaced.
5. **CSV Roundtrip:** Exported CSV downloads with formula-injection sanitization. Imported sample CSV parses and commits.
6. **Activity Log:** All authentication, create, update, and delete actions appear in `/activity`.
