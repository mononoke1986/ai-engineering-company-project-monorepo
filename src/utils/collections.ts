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

export function sortByLastName(
  inquiries: PatientInquiry[],
  order: "asc" | "desc"
): PatientInquiry[] {
  return [...inquiries].sort((a, b) => {
    const result = a.last_name.localeCompare(b.last_name);
    return order === "asc" ? result : -result;
  });
}

export function sortByPreferredDate(
  inquiries: PatientInquiry[],
  order: "asc" | "desc"
): PatientInquiry[] {
  return [...inquiries].sort((a, b) => {
    const result = a.preferred_date.localeCompare(b.preferred_date);
    return order === "asc" ? result : -result;
  });
}