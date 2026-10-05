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