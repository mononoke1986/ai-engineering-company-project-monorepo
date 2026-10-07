export type ClinicName =
  | "HealthCore Austin Central"
  | "HealthCore Austin North"
  | "HealthCore San Antonio"
  | "HealthCore Miami"
  | "HealthCore Orlando"
  | "HealthCore Atlanta";

export type ServiceType =
  | "Primary Care"
  | "Chronic Disease Management"
  | "Specialist Consultation"
  | "Preventive Health"
  | "Women's Health"
  | "Paediatric Care"
  | "Mental Health";

export type YesNo = "Yes" | "No";

export interface Clinic {
  name: ClinicName;
  city: string;
  state: "TX" | "FL" | "GA";
  phone: string;
  hours: string;
}

export interface PatientInquiry {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  preferred_language: "English" | "Spanish";
  preferred_clinic: ClinicName;
  preferred_date: string;
  preferred_time: "Morning" | "Afternoon" | "Evening";
  service_type: ServiceType;
  new_patient: YesNo;
  has_insurance: YesNo;
  insurance_provider?: string;
  insurance_member_id?: string;
  patient_id?: string;
  health_concern: string;
  contact_consent: boolean;
}