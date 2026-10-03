import type { PatientInquiry } from "../types/models";

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