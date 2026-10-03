import type { PatientInquiry, ClinicName } from "../types/models";

export function filterInquiriesByClinic(
  inquiries: PatientInquiry[],
  clinic: ClinicName
): PatientInquiry[] {
  return inquiries.filter(inquiry => inquiry.preferred_clinic === clinic);
}