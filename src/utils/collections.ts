import type { Appointment, AppointmentStatus, Claim } from "../types";

export type ClaimFilters = Partial<
  Pick<Claim, "locationId" | "status" | "payerName" | "serviceType">
>;

export type SortDirection = "asc" | "desc";

export type ClaimGroupKey = "locationId" | "payerName" | "status" | "serviceType";

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function filterClaims(claims: Claim[], filters: ClaimFilters): Claim[] {
  return claims.filter(
    (claim) =>
      (filters.locationId === undefined || claim.locationId === filters.locationId) &&
      (filters.status === undefined || claim.status === filters.status) &&
      (filters.payerName === undefined || claim.payerName === filters.payerName) &&
      (filters.serviceType === undefined || claim.serviceType === filters.serviceType)
  );
}

export function filterAppointmentsByStatus(
  appointments: Appointment[],
  statuses: AppointmentStatus[]
): Appointment[] {
  return appointments.filter((appointment) => statuses.includes(appointment.status));
}

export function sortClaimsById(claims: Claim[], direction: SortDirection): Claim[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...claims].sort((a, b) => sign * compareStrings(a.claimId, b.claimId));
}

export function sortAppointmentsByDate(
  appointments: Appointment[],
  direction: SortDirection
): Appointment[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...appointments].sort(
    (a, b) => sign * compareStrings(a.scheduledDate, b.scheduledDate)
  );
}

export function groupClaimsBy(
  claims: Claim[],
  key: ClaimGroupKey
): Record<string, Claim[]> {
  const groups: Record<string, Claim[]> = {};
  for (const claim of claims) {
    const groupName = claim[key];
    const group = groups[groupName] ?? [];
    group.push(claim);
    groups[groupName] = group;
  }
  return groups;
}
