export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return false;
  }
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(trimmed);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^\+\d{1,3}[\s-]?\d[\d\s-]{5,13}\d$/.test(phone.trim());
}

export function isValidDateOfBirth(
  dateOfBirth: string,
  today: Date
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return false;
  }
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return false;
  }
  if (birth > today) {
    return false;
  }
  const oldestAllowed = new Date(today);
  oldestAllowed.setFullYear(today.getFullYear() - 120);
  return birth >= oldestAllowed;
}

function getNextBusinessDay(from: Date): Date {
  const next = new Date(from);
  next.setHours(0, 0, 0, 0);
  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDay() === 0 || next.getDay() === 6);
  return next;
}

export function isValidPreferredDate(
  preferredDate: string,
  today: Date
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return false;
  }
  const [year, month, day] = preferredDate.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }
  const chosen = new Date(year, month - 1, day);
  if (Number.isNaN(chosen.getTime())) {
    return false;
  }
  const earliest = getNextBusinessDay(today);
  const latest = new Date(today);
  latest.setHours(0, 0, 0, 0);
  latest.setDate(latest.getDate() + 60);
  return chosen >= earliest && chosen <= latest;
}

export function isValidHealthConcern(text: string): boolean {
  const length = text.trim().length;
  return length >= 20 && length <= 500;
}

export function isValidInsuranceMemberId(memberId: string): boolean {
  return /^[A-Za-z0-9]{6,20}$/.test(memberId.trim());
}

export function isUnder18(dateOfBirth: string, today: Date): boolean {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return false;
  }
  const eighteenthBirthday = new Date(birth);
  eighteenthBirthday.setFullYear(birth.getFullYear() + 18);
  return eighteenthBirthday > today;
}