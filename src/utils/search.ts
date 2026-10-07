import type { PatientInquiry, Clinic, ClinicName } from "../types/models";

export function findInquiryByEmail(
  inquiries: PatientInquiry[],
  email: string
): number {
  const target = email.toLowerCase();
  for (let i = 0; i < inquiries.length; i++) {
    const inquiry = inquiries[i];
    if (inquiry !== undefined && inquiry.email.toLowerCase() === target) {
      return i;
    }
  }
  return -1;
}

export function binarySearchClinicByName(
  clinics: Clinic[],
  name: ClinicName
): number {
  let low = 0;
  let high = clinics.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const current = clinics[mid];
    if (current === undefined) {
      return -1;
    }
    const comparison = current.name.localeCompare(name);
    if (comparison === 0) {
      return mid;
    }
    if (comparison < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}
