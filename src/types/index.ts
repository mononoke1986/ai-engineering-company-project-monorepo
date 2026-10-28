// ===== Tipos simples (las "opciones permitidas") =====

export type ClaimStatus =
  | "submitted"
  | "approved"
  | "denied"
  | "pending"
  | "appealed";

export type DenialReason =
  | "missing_authorisation"
  | "coding_error"
  | "duplicate_claim"
  | "patient_not_covered"
  | "service_not_covered"
  | "incomplete_documentation";

export type ServiceType =
  | "primary_care"
  | "chronic_disease"
  | "preventive"
  | "specialist"
  | "womens_health"
  | "paediatric"
  | "mental_health";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

export type ClinicianRole =
  | "physician"
  | "nurse_practitioner"
  | "nurse"
  | "medical_assistant";

export type CMEStatus = "on_track" | "at_risk" | "overdue" | "complete";

// ===== Entidades de negocio (las "fichas") =====

export interface Claim {
  claimId: string; // "CLM-XXXXXX"
  patientId: string; // "HC-XXXXXX"
  locationId: string;
  serviceType: ServiceType;
  payerName: string;
  payerId: string;
  submissionDate: string; // ISO 8601
  claimAmount: number; // USD, debe ser > 0
  status: ClaimStatus;
  denialReason?: DenialReason; // solo cuando status === "denied"
  resubmitted: boolean;
}

export interface Appointment {
  appointmentId: string; // "APT-XXXXXX"
  patientId: string;
  locationId: string;
  serviceType: ServiceType;
  scheduledDate: string; // ISO 8601
  scheduledTime: string; // "HH:MM" (24 horas)
  status: AppointmentStatus;
  noShowReason?: string; // solo cuando status === "no_show"
  confirmedAt?: string; // ISO 8601 datetime
}

export interface Clinician {
  clinicianId: string; // "CLN-XXXXXX"
  firstName: string;
  lastName: string;
  role: ClinicianRole;
  locationId: string;
  licenceState: string; // "TX" o "UK"
  licenceExpiryDate: string; // ISO 8601
  cmeHoursRequired: number;
  cmeHoursLogged: number;
  cmeYearStartDate: string; // ISO 8601
}

export interface Location {
  locationId: string;
  name: string;
  city: string;
  stateOrCountry: string;
  country: "US" | "UK";
  phone: string;
  averageConsultationFee: Record<ServiceType, number>;
}

// ===== Reportes y resultados =====

export interface CMEReport {
  clinicianId: string;
  fullName: string;
  role: ClinicianRole;
  locationId: string;
  hoursRequired: number;
  hoursLogged: number;
  hoursRemaining: number;
  percentComplete: number;
  daysRemainingInCycle: number;
  complianceStatus: CMEStatus;
  licenceExpiryDate: string;
  licenceDaysRemaining: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AppointmentValidationResult extends ValidationResult {
  warnings: string[];
}
