import type { CardConfig } from "./types";

function normalizeWebsiteUrl(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizePhoneRaw(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function buildVCard(config: CardConfig): string {
  const fullName = `${config.firstName.trim()} ${config.lastName.trim()}`.trim();
  const websiteUrl = normalizeWebsiteUrl(config.website);
  const phoneRaw = normalizePhoneRaw(config.phone);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${config.lastName.trim()};${config.firstName.trim()};;;`,
    `FN:${fullName}`,
  ];

  if (config.company.trim()) {
    lines.push(`ORG:${config.company.trim()}`);
  }

  if (config.title.trim()) {
    lines.push(`TITLE:${config.title.trim()}`);
  }

  if (phoneRaw) {
    lines.push(`TEL;TYPE=CELL:${phoneRaw}`);
  }

  if (config.email.trim()) {
    lines.push(`EMAIL:${config.email.trim()}`);
  }

  if (websiteUrl) {
    lines.push(`URL:${websiteUrl}`);
  }

  lines.push("END:VCARD");
  return lines.join("\n");
}

export function formatWebsiteDisplay(website: string): string {
  return website.trim().replace(/^https?:\/\//i, "");
}

export { normalizeWebsiteUrl, normalizePhoneRaw };
