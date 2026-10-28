import type {
  Appointment,
  AppointmentValidationResult,
  Claim,
  Clinician,
  ClinicianRole,
  ValidationResult,
} from "../types";
import { DEFAULT_DENIAL_THRESHOLD, DEFAULT_NO_SHOW_THRESHOLD } from "./constants";
import { parseIsoDate, todayIsoDate } from "./dates";

const PATIENT_ID_FORMAT = /^HC-[A-Za-z0-9]{6}$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_ROLES: ClinicianRole[] = [
  "physician",
  "nurse_practitioner",
  "nurse",
  "medical_assistant",
];

function buildResult(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

export function validateClaim(
  claim: Claim,
  knownLocationIds: string[],
  now: Date = new Date()
): ValidationResult {
  const errors: string[] = [];

  if (!(claim.claimAmount > 0)) {
    errors.push("claimAmount debe ser mayor que 0");
  }

  if (parseIsoDate(claim.submissionDate) === null) {
    errors.push("submissionDate no es una fecha válida");
  } else if (claim.submissionDate.slice(0, 10) > todayIsoDate(now)) {
    errors.push("submissionDate no puede ser una fecha futura");
  }

  if (!knownLocationIds.includes(claim.locationId)) {
    errors.push(`locationId "${claim.locationId}" no es una clínica conocida`);
  }

  if (claim.status === "denied" && claim.denialReason === undefined) {
    errors.push("denialReason es obligatorio cuando status es \"denied\"");
  }

  if (!PATIENT_ID_FORMAT.test(claim.patientId)) {
    errors.push("patientId debe tener el formato HC- seguido de 6 caracteres alfanuméricos");
  }

  return buildResult(errors);
}

export function validateAppointment(
  appointment: Appointment,
  knownLocationIds: string[]
): AppointmentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!TIME_FORMAT.test(appointment.scheduledTime)) {
    errors.push("scheduledTime debe tener el formato HH:MM de 24 horas");
  }

  if (!knownLocationIds.includes(appointment.locationId)) {
    errors.push(`locationId "${appointment.locationId}" no es una clínica conocida`);
  }

  if (appointment.status === "no_show" && !appointment.noShowReason) {
    warnings.push("Falta noShowReason en una cita no_show");
  }

  return { ...buildResult(errors), warnings };
}

export function validateClinician(
  clinician: Clinician,
  now: Date = new Date()
): ValidationResult {
  const errors: string[] = [];

  if (!(clinician.cmeHoursRequired >= 0)) {
    errors.push("cmeHoursRequired debe ser mayor o igual a 0");
  }

  if (!(clinician.cmeHoursLogged >= 0)) {
    errors.push("cmeHoursLogged debe ser mayor o igual a 0");
  }

  if (parseIsoDate(clinician.licenceExpiryDate) === null) {
    errors.push("licenceExpiryDate no es una fecha válida");
  } else if (clinician.licenceExpiryDate.slice(0, 10) < todayIsoDate(now)) {
    errors.push("La licencia está vencida (licenceExpiryDate está en el pasado)");
  }

  if (!VALID_ROLES.includes(clinician.role)) {
    errors.push(`role debe ser uno de: ${VALID_ROLES.join(", ")}`);
  }

  return buildResult(errors);
}

export function isDenialRateAboveThreshold(
  rate: number,
  threshold: number = DEFAULT_DENIAL_THRESHOLD
): boolean {
  return rate > threshold;
}

export function isNoShowRateAboveThreshold(
  rate: number,
  threshold: number = DEFAULT_NO_SHOW_THRESHOLD
): boolean {
  return rate > threshold;
}
