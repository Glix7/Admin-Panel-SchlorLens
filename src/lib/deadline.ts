import { DeadlineStatus } from '../types';

export function computeDeadlineStatus(
  deadline: string | null | undefined,
  referenceDate: Date = new Date()
): DeadlineStatus {
  if (!deadline) {
    return 'none';
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return 'none';
  }

  // Normalize to midnight UTC for clean calendar day comparisons
  const refMidnight = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  )).getTime();

  const deadlineMidnight = new Date(Date.UTC(
    deadlineDate.getUTCFullYear(),
    deadlineDate.getUTCMonth(),
    deadlineDate.getUTCDate()
  )).getTime();

  const diffMs = deadlineMidnight - refMidnight;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  }
  if (diffDays <= 30) {
    return 'closing';
  }
  return 'open';
}

export function isVerificationStale(
  verifiedOn: string | null | undefined,
  thresholdDays: number = 90,
  referenceDate: Date = new Date()
): boolean {
  if (!verifiedOn) return true;
  const verifiedDate = new Date(verifiedOn);
  if (isNaN(verifiedDate.getTime())) return true;

  const diffMs = referenceDate.getTime() - verifiedDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > thresholdDays;
}

export function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const clean = url.toLowerCase().trim();
  return (
    clean.includes('example.com') ||
    clean.includes('placeholder') ||
    clean.includes('localhost') ||
    !clean.startsWith('http')
  );
}
