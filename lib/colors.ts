function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** QR modules must stay dark — never use a light card color as QR ink. */
export function getQrDarkColor(primaryColor: string): string {
  return getLuminance(primaryColor) > 0.55 ? "#0a1628" : primaryColor;
}

export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.55;
}

export function getAccentColor(accent: string, onLightBackground: boolean): string {
  if (!onLightBackground) return accent;
  return getLuminance(accent) > 0.55 ? "#92400e" : accent;
}
