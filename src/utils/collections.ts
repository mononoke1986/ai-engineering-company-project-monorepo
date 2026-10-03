import type { PatientInquiry, ClinicName, ServiceType } from "../types/models";

export function filterInquiriesByClinic(
  inquiries: PatientInquiry[],
  clinic: ClinicName
): PatientInquiry[] {
  return inquiries.filter(inquiry => inquiry.preferred_clinic === clinic);
}

export function filterByService(
  inquiries: PatientInquiry[],
  service: ServiceType
): PatientInquiry[] {
  return inquiries.filter(inquiry => inquiry.service_type === service);
  
}