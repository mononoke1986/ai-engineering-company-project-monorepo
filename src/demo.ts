import type { Appointment, Claim, Clinician, Location } from "./types";
import {
  filterAppointmentsByStatus,
  filterClaims,
  groupClaimsBy,
  sortAppointmentsByDate,
  sortClaimsById,
} from "./utils/collections";
import {
  binarySearchClaimById,
  findClaimById,
  findClinicianById,
} from "./utils/search";
import {
  calculateDenialRate,
  calculateNoShowCost,
  denialRateByLocation,
  denialRateByPayer,
  flagHighDenialPayers,
  flagHighNoShowLocations,
  generateCMEReport,
  getCliniciansAtRisk,
  getCliniciansWithExpiringLicences,
  noShowRateByLocation,
} from "./utils/transformations";
import {
  isDenialRateAboveThreshold,
  validateAppointment,
  validateClaim,
  validateClinician,
} from "./utils/validations";

const feesAustin = {
  primary_care: 180,
  chronic_disease: 220,
  preventive: 150,
  specialist: 320,
  womens_health: 240,
  paediatric: 175,
  mental_health: 200,
};
const feesMiami = {
  primary_care: 195,
  chronic_disease: 235,
  preventive: 160,
  specialist: 340,
  womens_health: 255,
  paediatric: 185,
  mental_health: 215,
};
const feesAtlanta = {
  primary_care: 170,
  chronic_disease: 210,
  preventive: 145,
  specialist: 310,
  womens_health: 230,
  paediatric: 165,
  mental_health: 190,
};

const sampleLocations: Location[] = [
  { locationId: "us-tx-001", name: "HealthCore Austin Central", city: "Austin", stateOrCountry: "TX", country: "US", phone: "(512) 340-8800", averageConsultationFee: feesAustin },
  { locationId: "us-fl-001", name: "HealthCore Miami", city: "Miami", stateOrCountry: "FL", country: "US", phone: "(305) 510-7700", averageConsultationFee: feesMiami },
  { locationId: "us-ga-001", name: "HealthCore Atlanta", city: "Atlanta", stateOrCountry: "GA", country: "US", phone: "(404) 330-9900", averageConsultationFee: feesAtlanta },
];

const sampleClaims: Claim[] = [
  { claimId: "CLM-000001", patientId: "HC-A3F291", locationId: "us-tx-001", serviceType: "primary_care", payerName: "BlueCross", payerId: "BC001", submissionDate: "2025-03-10", claimAmount: 180, status: "approved", resubmitted: false },
  { claimId: "CLM-000002", patientId: "HC-B7K442", locationId: "us-fl-001", serviceType: "specialist", payerName: "Aetna", payerId: "AET002", submissionDate: "2025-03-11", claimAmount: 340, status: "denied", denialReason: "missing_authorisation", resubmitted: false },
  { claimId: "CLM-000003", patientId: "HC-C2M881", locationId: "us-ga-001", serviceType: "chronic_disease", payerName: "Medicare", payerId: "MED003", submissionDate: "2025-03-12", claimAmount: 210, status: "approved", resubmitted: false },
  { claimId: "CLM-000004", patientId: "HC-D9P553", locationId: "us-tx-001", serviceType: "preventive", payerName: "BlueCross", payerId: "BC001", submissionDate: "2025-03-13", claimAmount: 150, status: "denied", denialReason: "coding_error", resubmitted: true },
  { claimId: "CLM-000005", patientId: "HC-E4Q117", locationId: "us-fl-001", serviceType: "mental_health", payerName: "Cigna", payerId: "CIG004", submissionDate: "2025-03-14", claimAmount: 215, status: "pending", resubmitted: false },
];

const sampleAppointments: Appointment[] = [
  { appointmentId: "APT-000001", patientId: "HC-A3F291", locationId: "us-tx-001", serviceType: "primary_care", scheduledDate: "2025-03-10", scheduledTime: "09:00", status: "completed", confirmedAt: "2025-03-09T14:00:00Z" },
  { appointmentId: "APT-000002", patientId: "HC-F6R228", locationId: "us-fl-001", serviceType: "specialist", scheduledDate: "2025-03-11", scheduledTime: "11:30", status: "no_show", noShowReason: "Patient did not call to cancel" },
  { appointmentId: "APT-000003", patientId: "HC-G1S774", locationId: "us-tx-001", serviceType: "chronic_disease", scheduledDate: "2025-03-12", scheduledTime: "14:00", status: "no_show", noShowReason: "Unreachable before appointment" },
  { appointmentId: "APT-000004", patientId: "HC-H8T390", locationId: "us-ga-001", serviceType: "preventive", scheduledDate: "2025-03-13", scheduledTime: "10:00", status: "completed", confirmedAt: "2025-03-12T09:30:00Z" },
  { appointmentId: "APT-000005", patientId: "HC-I5U661", locationId: "us-fl-001", serviceType: "mental_health", scheduledDate: "2025-03-14", scheduledTime: "16:00", status: "no_show", noShowReason: "Transportation issue reported" },
];

const sampleClinicians: Clinician[] = [
  { clinicianId: "CLN-000001", firstName: "Marcus", lastName: "Reid", role: "physician", locationId: "us-tx-001", licenceState: "TX", licenceExpiryDate: "2026-06-30", cmeHoursRequired: 40, cmeHoursLogged: 28, cmeYearStartDate: "2025-01-01" },
  { clinicianId: "CLN-000002", firstName: "Sandra", lastName: "Flores", role: "nurse_practitioner", locationId: "us-fl-001", licenceState: "FL", licenceExpiryDate: "2025-05-15", cmeHoursRequired: 30, cmeHoursLogged: 6, cmeYearStartDate: "2025-01-01" },
  { clinicianId: "CLN-000003", firstName: "David", lastName: "Okafor", role: "physician", locationId: "us-ga-001", licenceState: "GA", licenceExpiryDate: "2027-01-01", cmeHoursRequired: 40, cmeHoursLogged: 40, cmeYearStartDate: "2025-01-01" },
];

const knownLocationIds = sampleLocations.map((location) => location.locationId);
const austin = sampleLocations[0];
const asOfDate = "2025-09-01";
const fixedNow = new Date("2025-03-15");

console.log("--- Colecciones ---");
console.log("Claims denegados:", filterClaims(sampleClaims, { status: "denied" }).length);
console.log("Claims BlueCross en Austin:", filterClaims(sampleClaims, { payerName: "BlueCross", locationId: "us-tx-001" }).length);
console.log("Citas no_show:", filterAppointmentsByStatus(sampleAppointments, ["no_show"]).length);
console.log("Claims desc:", sortClaimsById(sampleClaims, "desc").map((c) => c.claimId));
console.log("Citas desc:", sortAppointmentsByDate(sampleAppointments, "desc").map((a) => a.scheduledDate));
console.log("Agrupar por payer:", Object.keys(groupClaimsBy(sampleClaims, "payerName")));

console.log("--- Búsquedas ---");
const sortedClaims = sortClaimsById(sampleClaims, "asc");
console.log("Lineal CLM-000003:", findClaimById(sampleClaims, "CLM-000003")?.payerName);
console.log("Lineal CLM-999999:", findClaimById(sampleClaims, "CLM-999999"));
console.log("Clínico CLN-000002:", findClinicianById(sampleClinicians, "CLN-000002")?.lastName);
console.log("Binaria CLM-000004:", binarySearchClaimById(sortedClaims, "CLM-000004"));
console.log("Binaria CLM-999999:", binarySearchClaimById(sortedClaims, "CLM-999999"));

console.log("--- Denegaciones ---");
console.log("Tasa total:", calculateDenialRate(sampleClaims));
console.log("Por payer:", denialRateByPayer(sampleClaims));
console.log("Por sede:", denialRateByLocation(sampleClaims));
console.log("Payers en alerta:", flagHighDenialPayers(sampleClaims));
console.log("¿40% supera el umbral?", isDenialRateAboveThreshold(40));

console.log("--- No-shows ---");
if (austin) {
  console.log("Costo Austin semana 14-mar:", calculateNoShowCost(sampleAppointments, austin, "2025-03-14"));
}
console.log("Tasa por sede:", noShowRateByLocation(sampleAppointments));
console.log("Sedes en alerta:", flagHighNoShowLocations(sampleAppointments));

console.log("--- CME ---");
console.table(generateCMEReport(sampleClinicians, asOfDate));
console.log("En riesgo:", getCliniciansAtRisk(sampleClinicians, asOfDate).map((c) => c.lastName));
console.log("Licencias por vencer (90 días desde 15-mar):", getCliniciansWithExpiringLicences(sampleClinicians, "2025-03-15", 90).map((c) => c.lastName));

console.log("--- Validaciones ---");
sampleClaims.forEach((claim) => console.log(claim.claimId, validateClaim(claim, knownLocationIds, fixedNow)));
console.log("Cita 2:", validateAppointment(sampleAppointments[1] ?? ({} as Appointment), knownLocationIds));
sampleClinicians.forEach((c) => console.log(c.lastName, validateClinician(c, fixedNow)));