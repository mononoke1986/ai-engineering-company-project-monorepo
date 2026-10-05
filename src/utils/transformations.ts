import type { PatientInquiry, ClinicName } from "../types/models";

export function countInquiriesByClinic(
  inquiries: PatientInquiry[]
): Partial<Record<ClinicName, number>> {
  return inquiries.reduce<Partial<Record<ClinicName, number>>>(
    (counts, inquiry) => {
      const current = counts[inquiry.preferred_clinic] ?? 0;
      return { ...counts, [inquiry.preferred_clinic]: current + 1 };
    },
    {}
  );
}