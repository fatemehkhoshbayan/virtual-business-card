import type { CardConfig } from "./types";
import { normalizePhoneRaw } from "./vcard";

export type ValidatedField = "firstName" | "lastName" | "phone" | "email" | "website";

export type ValidationErrors = Partial<Record<ValidatedField, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 200;
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

function isValidWebsite(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function validateField(
  key: ValidatedField,
  value: string,
): string | undefined {
  switch (key) {
    case "firstName": {
      const trimmed = value.trim();
      if (!trimmed) return "First name is required";
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `First name must be ${MAX_NAME_LENGTH} characters or fewer`;
      }
      return undefined;
    }
    case "lastName": {
      const trimmed = value.trim();
      if (!trimmed) return "Last name is required";
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `Last name must be ${MAX_NAME_LENGTH} characters or fewer`;
      }
      return undefined;
    }
    case "phone": {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const digits = normalizePhoneRaw(trimmed).replace(/\D/g, "");
      if (digits.length < 7) return "Enter a valid phone number";
      return undefined;
    }
    case "email": {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (trimmed.length > MAX_TEXT_LENGTH) {
        return `Email must be ${MAX_TEXT_LENGTH} characters or fewer`;
      }
      return EMAIL_REGEX.test(trimmed) ? undefined : "Enter a valid email address";
    }
    case "website": {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (trimmed.length > MAX_TEXT_LENGTH) {
        return `Website must be ${MAX_TEXT_LENGTH} characters or fewer`;
      }
      return isValidWebsite(trimmed)
        ? undefined
        : "Enter a valid website (e.g. www.company.com)";
    }
  }
}

export function validateConfig(config: CardConfig): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const field of ["firstName", "lastName", "phone", "email", "website"] as const) {
    const error = validateField(field, config[field]);
    if (error) errors[field] = error;
  }

  const hasValidPhone = config.phone.trim() && !errors.phone;
  const hasValidEmail = config.email.trim() && !errors.email;

  if (!hasValidPhone && !hasValidEmail) {
    if (!config.phone.trim() && !config.email.trim()) {
      errors.phone = "Add a phone number or email address";
      errors.email = "Add an email address or phone number";
    }
  }

  return errors;
}

export function validateLogoFile(file: File): string | undefined {
  if (!file.type.startsWith("image/")) {
    return "Logo must be an image file";
  }
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return "Logo must be 2 MB or smaller";
  }
  return undefined;
}
