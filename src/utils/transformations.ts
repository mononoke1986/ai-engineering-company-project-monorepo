import type { PatientInquiry, ClinicName, ServiceType } from "../types/models";

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

export function countInquiriesByService(
  inquiries: PatientInquiry[]
): Partial<Record<ServiceType, number>> {
  return inquiries.reduce<Partial<Record<ServiceType, number>>>(
    (counts, inquiry) => {
      const current = counts[inquiry.service_type] ?? 0;
      return { ...counts, [inquiry.service_type]: current + 1 };
    },
    {}
  );
}

export function percentageWithInsurance(
  inquiries: PatientInquiry[]
): number {
  if (inquiries.length === 0) {
    return 0;
  }
  const withInsurance = inquiries.filter(
    inquiry => inquiry.has_insurance === "Yes"
  ).length;
  return (withInsurance / inquiries.length) * 100;
}