import type {
  Appointment,
  Claim,
  Clinician,
  CMEReport,
  CMEStatus,
  Location,
} from "../types";
import { groupClaimsBy } from "./collections";
import {
  CME_AT_RISK_GAP_POINTS,
  DEFAULT_DENIAL_THRESHOLD,
  DEFAULT_NO_SHOW_THRESHOLD,
} from "./constants";
import { addDays, addYears, daysBetween, requireIsoDate, parseIsoDate } from "./dates";

// ---------- Ayudantes pequeños ----------

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return roundTo((part / total) * 100, 2);
}

// ---------- Tasas de denegación ----------

export function calculateDenialRate(claims: Claim[]): number {
  if (claims.length === 0) {
    throw new Error("No se puede calcular la tasa de denegación de una lista vacía.");
  }
  const denied = claims.filter((claim) => claim.status === "denied").length;
  return percentage(denied, claims.length);
}

export function denialRateByPayer(claims: Claim[]): Record<string, number> {
  const groups = groupClaimsBy(claims, "payerName");
  const rates: Record<string, number> = {};
  for (const [payerName, payerClaims] of Object.entries(groups)) {
    rates[payerName] = calculateDenialRate(payerClaims);
  }
  return rates;
}

export function denialRateByLocation(claims: Claim[]): Record<string, number> {
  const groups = groupClaimsBy(claims, "locationId");
  const rates: Record<string, number> = {};
  for (const [locationId, locationClaims] of Object.entries(groups)) {
    rates[locationId] = calculateDenialRate(locationClaims);
  }
  return rates;
}

export function flagHighDenialPayers(
  claims: Claim[],
  threshold: number = DEFAULT_DENIAL_THRESHOLD
): string[] {
  return Object.entries(denialRateByPayer(claims))
    .filter(([, rate]) => rate > threshold)
    .map(([payerName]) => payerName);
}

// ---------- No-shows ----------

export function calculateNoShowCost(
  appointments: Appointment[],
  location: Location,
  weekEndingDate: string
): number {
  const weekEnd = requireIsoDate(weekEndingDate);
  const weekStart = addDays(weekEnd, -6); // 7 días, el último inclusive

  const total = appointments
    .filter((appointment) => {
      if (appointment.status !== "no_show") return false;
      if (appointment.locationId !== location.locationId) return false;
      const day = parseIsoDate(appointment.scheduledDate);
      return day !== null && day >= weekStart && day <= weekEnd;
    })
    .reduce(
      (sum, appointment) => sum + location.averageConsultationFee[appointment.serviceType],
      0
    );

  return roundTo(total, 2);
}

export function noShowRateByLocation(
  appointments: Appointment[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  const noShows: Record<string, number> = {};

  for (const appointment of appointments) {
    const id = appointment.locationId;
    totals[id] = (totals[id] ?? 0) + 1;
    if (appointment.status === "no_show") {
      noShows[id] = (noShows[id] ?? 0) + 1;
    }
  }

  const rates: Record<string, number> = {};
  for (const [locationId, total] of Object.entries(totals)) {
    rates[locationId] = percentage(noShows[locationId] ?? 0, total);
  }
  return rates;
}

export function flagHighNoShowLocations(
  appointments: Appointment[],
  threshold: number = DEFAULT_NO_SHOW_THRESHOLD
): string[] {
  return Object.entries(noShowRateByLocation(appointments))
    .filter(([, rate]) => rate > threshold)
    .map(([locationId]) => locationId);
}

// ---------- Cumplimiento CME ----------

export function getCMEStatus(clinician: Clinician, asOfDate: string): CMEStatus {
  if (clinician.cmeHoursLogged >= clinician.cmeHoursRequired) return "complete";

  const asOf = requireIsoDate(asOfDate);
  const cycleStart = requireIsoDate(clinician.cmeYearStartDate);
  const nextCycleStart = addYears(cycleStart, 1);
  const cycleLastDay = addDays(nextCycleStart, -1);

  if (asOf > cycleLastDay) return "overdue";

  const cycleLength = daysBetween(cycleStart, nextCycleStart);
  const elapsedPercent = Math.min(
    100,
    Math.max(0, (daysBetween(cycleStart, asOf) / cycleLength) * 100)
  );
  // Aquí cmeHoursRequired > 0, porque logged < required y logged >= 0.
  const donePercent = (clinician.cmeHoursLogged / clinician.cmeHoursRequired) * 100;

  return donePercent < elapsedPercent - CME_AT_RISK_GAP_POINTS ? "at_risk" : "on_track";
}

export function generateCMEReport(
  clinicians: Clinician[],
  asOfDate: string
): CMEReport[] {
  const asOf = requireIsoDate(asOfDate);

  return clinicians.map((clinician) => {
    const cycleStart = requireIsoDate(clinician.cmeYearStartDate);
    const cycleLastDay = addDays(addYears(cycleStart, 1), -1);
    const licenceExpiry = requireIsoDate(clinician.licenceExpiryDate);
    const required = clinician.cmeHoursRequired;
    const logged = clinician.cmeHoursLogged;

    return {
      clinicianId: clinician.clinicianId,
      fullName: `${clinician.firstName} ${clinician.lastName}`,
      role: clinician.role,
      locationId: clinician.locationId,
      hoursRequired: required,
      hoursLogged: logged,
      hoursRemaining: Math.max(0, required - logged),
      percentComplete: required === 0 ? 100 : roundTo((logged / required) * 100, 1),
      daysRemainingInCycle: daysBetween(asOf, cycleLastDay),
      complianceStatus: getCMEStatus(clinician, asOfDate),
      licenceExpiryDate: clinician.licenceExpiryDate,
      licenceDaysRemaining: daysBetween(asOf, licenceExpiry),
    };
  });
}

export function getCliniciansAtRisk(
  clinicians: Clinician[],
  asOfDate: string
): Clinician[] {
  return clinicians.filter((clinician) => {
    const status = getCMEStatus(clinician, asOfDate);
    return status === "at_risk" || status === "overdue";
  });
}

export function getCliniciansWithExpiringLicences(
  clinicians: Clinician[],
  asOfDate: string,
  daysThreshold: number
): Clinician[] {
  const asOf = requireIsoDate(asOfDate);

  return clinicians.filter((clinician) => {
    const daysLeft = daysBetween(asOf, requireIsoDate(clinician.licenceExpiryDate));
    return daysLeft >= 0 && daysLeft <= daysThreshold;
  });
}
