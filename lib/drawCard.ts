import type { CardConfig, CardPalette } from "./types";
import { formatWebsiteDisplay } from "./vcard";
import { getAccentColor, getQrDarkColor, isLightColor } from "./colors";

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

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function adjustColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildPalette(config: CardConfig): CardPalette {
  const primary = config.primaryColor;
  const accent = config.accentColor;
  const lightBg = isLightColor(primary);

  if (lightBg) {
    return {
      bgTop: adjustColor(primary, -10),
      bgBottom: adjustColor(primary, 10),
      accent: getAccentColor(accent, true),
      accentSoft: "#64748b",
      textPrimary: "#0f172a",
      muted: "#334155",
      panel: "rgba(0, 0, 0, 0.05)",
      panelBorder: withAlpha(getAccentColor(accent, true), 0.4),
      qrDark: getQrDarkColor(primary),
    };
  }

  return {
    bgTop: adjustColor(primary, 18),
    bgBottom: adjustColor(primary, -18),
    accent,
    accentSoft: adjustColor(primary, 90),
    textPrimary: "#ffffff",
    muted: adjustColor(primary, 130),
    panel: "rgba(255, 255, 255, 0.06)",
    panelBorder: withAlpha(accent, 0.35),
    qrDark: getQrDarkColor(primary),
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: CardPalette,
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette.bgTop);
  gradient.addColorStop(1, palette.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: CardPalette,
) {
  ctx.strokeStyle = withAlpha(palette.accent, 0.18);
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(120, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - 120, height - 40);
  ctx.lineTo(width, height - 40);
  ctx.stroke();

  ctx.fillStyle = withAlpha(palette.accent, 0.08);
  ctx.beginPath();
  ctx.arc(width - 80, 80, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(90, height - 70, 90, 0, Math.PI * 2);
  ctx.fill();
}

type ContactRows = Array<{ label: string; value: string }>;

function getContactRows(config: CardConfig): ContactRows {
  const rows: ContactRows = [];

  if (config.phone.trim()) {
    rows.push({ label: "Phone", value: config.phone.trim() });
  }
  if (config.email.trim()) {
    rows.push({ label: "Email", value: config.email.trim() });
  }
  if (config.website.trim()) {
    rows.push({
      label: "Website",
      value: formatWebsiteDisplay(config.website),
    });
  }

  return rows;
}

async function loadLogo(logoDataUrl: string | null): Promise<HTMLImageElement | null> {
  if (!logoDataUrl) return null;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load logo"));
    image.src = logoDataUrl;
  });
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  centerX: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
): number {
  const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height, 1);
  const width = logo.width * scale;
  const height = logo.height * scale;
  const x = centerX - width / 2;

  ctx.drawImage(logo, x, y, width, height);
  return height;
}

type ContactBlockOptions = {
  anchorX: number;
  startY: number;
  align: "left" | "center";
  companyFontSize?: number;
  nameFontSize: number;
  titleFontSize: number;
  valueFontSize: number;
  logo: HTMLImageElement | null;
  logoMaxWidth: number;
  logoMaxHeight: number;
  logoPlacement?: "top" | "afterCompany" | "none";
  spacing?: {
    afterCompany?: number;
    afterLogo?: number;
    beforeName?: number;
    betweenNameLines?: number;
    afterName?: number;
    afterTitle?: number;
    afterLabel?: number;
    afterValue?: number;
    afterRow?: number;
  };
  contactRowLayout?: "stacked" | "inline";
  labelColumnWidth?: number;
};

const defaultSpacing = {
  afterCompany: 12,
  afterLogo: 36,
  beforeName: 24,
  betweenNameLines: 12,
  afterName: 24,
  afterTitle: 28,
  afterLabel: 20,
  afterValue: 32,
  afterRow: 24,
};

function drawInlineContactRow(
  ctx: CanvasRenderingContext2D,
  row: { label: string; value: string },
  palette: CardPalette,
  options: {
    anchorX: number;
    y: number;
    align: "left" | "center";
    valueFontSize: number;
    labelColumnWidth: number;
  },
) {
  const { anchorX, y, align, valueFontSize, labelColumnWidth } = options;
  const labelText = row.label.toUpperCase();
  const labelFont = "600 13px Helvetica, Arial, sans-serif";
  const valueFont = `400 ${valueFontSize}px Helvetica, Arial, sans-serif`;
  const gap = 12;

  ctx.font = valueFont;
  const valueWidth = ctx.measureText(row.value).width;

  let labelX = anchorX;
  let valueX = anchorX + labelColumnWidth + gap;

  if (align === "center") {
    const totalWidth = labelColumnWidth + gap + valueWidth;
    labelX = anchorX - totalWidth / 2;
    valueX = labelX + labelColumnWidth + gap;
  }

  ctx.textAlign = "left";
  ctx.font = labelFont;
  ctx.fillStyle = palette.accentSoft;
  ctx.fillText(labelText, labelX, y);

  ctx.font = valueFont;
  ctx.fillStyle = palette.muted;
  ctx.fillText(row.value, valueX, y);
}

function getContactRowHeight(
  options: ContactBlockOptions,
  spacing: typeof defaultSpacing,
): number {
  if (options.contactRowLayout === "inline") {
    return Math.max(13, options.valueFontSize) + spacing.afterRow;
  }

  return spacing.afterLabel + options.valueFontSize + spacing.afterValue;
}

function getLogoDimensions(
  logo: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height, 1);
  return {
    width: logo.width * scale,
    height: logo.height * scale,
  };
}

function measureContactBlockHeight(
  config: CardConfig,
  options: ContactBlockOptions,
): number {
  const spacing = { ...defaultSpacing, ...options.spacing };
  const {
    startY,
    companyFontSize = 22,
    nameFontSize,
    titleFontSize,
    valueFontSize,
    logo,
    logoMaxWidth,
    logoMaxHeight,
    logoPlacement = "top",
  } = options;

  let y = startY;

  if (logo && logoPlacement === "top") {
    const logoHeight = logo
      ? getLogoDimensions(logo, logoMaxWidth, logoMaxHeight).height
      : 0;
    y += logoHeight + 24;
  }

  if (config.company.trim()) {
    y += companyFontSize + spacing.afterCompany;
    if (logo && logoPlacement === "afterCompany") {
      const logoHeight = getLogoDimensions(logo, logoMaxWidth, logoMaxHeight).height;
      y += logoHeight + spacing.afterLogo;
    }
  } else if (logo && logoPlacement === "afterCompany") {
    const logoHeight = getLogoDimensions(logo, logoMaxWidth, logoMaxHeight).height;
    y += logoHeight + spacing.afterLogo;
  }

  y += spacing.beforeName;
  y += nameFontSize + spacing.betweenNameLines;
  y += nameFontSize + spacing.afterName;

  if (config.title.trim()) {
    y += titleFontSize + spacing.afterTitle;
  } else {
    y += 16;
  }

  getContactRows(config).forEach(() => {
    y += getContactRowHeight(options, spacing);
  });

  return y;
}

function drawContactBlock(
  ctx: CanvasRenderingContext2D,
  config: CardConfig,
  palette: CardPalette,
  options: ContactBlockOptions,
): number {
  const {
    anchorX,
    startY,
    align,
    companyFontSize = 22,
    nameFontSize,
    titleFontSize,
    valueFontSize,
    logo,
    logoMaxWidth,
    logoMaxHeight,
    logoPlacement = "top",
    contactRowLayout = "inline",
    labelColumnWidth = 72,
  } = options;
  const spacing = { ...defaultSpacing, ...options.spacing };

  ctx.textAlign = align;
  let y = startY;

  if (logo && logoPlacement === "top") {
    const logoHeight = drawLogo(
      ctx,
      logo,
      align === "center" ? anchorX : anchorX + logoMaxWidth / 2,
      y,
      logoMaxWidth,
      logoMaxHeight,
    );
    y += logoHeight + 24;
  }

  if (config.company.trim()) {
    ctx.fillStyle = palette.accent;
    ctx.font = `600 ${companyFontSize}px Helvetica, Arial, sans-serif`;
    ctx.fillText(config.company.trim(), anchorX, y);
    y += companyFontSize + spacing.afterCompany;

    if (logo && logoPlacement === "afterCompany") {
      const logoHeight = drawLogo(
        ctx,
        logo,
        align === "center" ? anchorX : anchorX + logoMaxWidth / 2,
        y,
        logoMaxWidth,
        logoMaxHeight,
      );
      y += logoHeight + spacing.afterLogo;
    }
  } else if (logo && logoPlacement === "afterCompany") {
    const logoHeight = drawLogo(
      ctx,
      logo,
      align === "center" ? anchorX : anchorX + logoMaxWidth / 2,
      y,
      logoMaxWidth,
      logoMaxHeight,
    );
    y += logoHeight + spacing.afterLogo;
  }

  y += spacing.beforeName;

  const firstName = config.firstName.trim() || "First";
  const lastName = config.lastName.trim() || "Last";

  ctx.fillStyle = palette.textPrimary;
  ctx.font = `700 ${nameFontSize}px Helvetica, Arial, sans-serif`;
  ctx.fillText(firstName, anchorX, y);
  y += nameFontSize + spacing.betweenNameLines;
  ctx.fillText(lastName, anchorX, y);
  y += nameFontSize + spacing.afterName;

  if (config.title.trim()) {
    ctx.fillStyle = palette.accent;
    ctx.font = `500 ${titleFontSize}px Helvetica, Arial, sans-serif`;
    ctx.fillText(config.title.trim(), anchorX, y);
    y += titleFontSize + spacing.afterTitle;
  } else {
    y += 16;
  }

  const rows = getContactRows(config);
  rows.forEach((row) => {
    if (contactRowLayout === "inline") {
      drawInlineContactRow(ctx, row, palette, {
        anchorX,
        y,
        align,
        valueFontSize,
        labelColumnWidth,
      });
      y += getContactRowHeight(options, spacing);
      return;
    }

    ctx.fillStyle = palette.accentSoft;
    ctx.font = "600 13px Helvetica, Arial, sans-serif";
    ctx.fillText(row.label.toUpperCase(), anchorX, y);
    y += spacing.afterLabel;
    ctx.fillStyle = palette.muted;
    ctx.font = `400 ${valueFontSize}px Helvetica, Arial, sans-serif`;
    ctx.fillText(row.value, anchorX, y);
    y += valueFontSize + spacing.afterValue;
  });

  ctx.textAlign = "left";
  return y;
}

function drawQrSection(
  ctx: CanvasRenderingContext2D,
  qrImage: HTMLImageElement,
  palette: CardPalette,
  options: {
    x: number;
    y: number;
    qrSize: number;
    labelCenterX: number;
  },
): number {
  const { x, y, qrSize, labelCenterX } = options;
  const padding = 18;
  const frameSize = qrSize + padding * 2;

  ctx.fillStyle = palette.panel;
  ctx.strokeStyle = palette.panelBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, x - 24, y - 24, frameSize + 48, frameSize + 92, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, frameSize, frameSize, 12);
  ctx.fill();

  ctx.drawImage(qrImage, x + padding, y + padding, qrSize, qrSize);

  ctx.fillStyle = palette.muted;
  ctx.font = "500 18px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Scan to save contact", labelCenterX, y + frameSize + 42);
  ctx.textAlign = "left";

  return y + frameSize + 72;
}

async function loadQrImage(qrDataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load QR code"));
    image.src = qrDataUrl;
  });
}

function estimateVerticalHeight(
  config: CardConfig,
  logo: HTMLImageElement | null,
  options: ContactBlockOptions,
): number {
  const contactBottom = measureContactBlockHeight(config, {
    ...options,
    logo,
    startY: 64,
  });
  const qrGap = 56;
  const qrSectionHeight = 356 + 72;
  return contactBottom + qrGap + qrSectionHeight + 56;
}

export async function renderVerticalCard(
  canvas: HTMLCanvasElement,
  config: CardConfig,
  qrDataUrl: string,
): Promise<void> {
  const palette = buildPalette(config);
  const logo = await loadLogo(config.logoDataUrl);
  const qrImage = await loadQrImage(qrDataUrl);

  const width = 675;
  const blockOptions: ContactBlockOptions = {
    anchorX: width / 2,
    startY: 64,
    align: "center",
    companyFontSize: 24,
    nameFontSize: 42,
    titleFontSize: 20,
    valueFontSize: 21,
    logo,
    logoMaxWidth: 160,
    logoMaxHeight: 72,
    logoPlacement: "afterCompany",
    contactRowLayout: "inline",
    labelColumnWidth: 80,
    spacing: {
      afterCompany: 14,
      afterLogo: 40,
      beforeName: 28,
      betweenNameLines: 10,
      afterName: 22,
      afterTitle: 24,
      afterRow: 22,
    },
  };

  const height = estimateVerticalHeight(config, logo, blockOptions);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawGradientBackground(ctx, width, height, palette);
  drawDecorations(ctx, width, height, palette);

  const contactBottom = drawContactBlock(ctx, config, palette, blockOptions);

  drawQrSection(ctx, qrImage, palette, {
    x: (width - 356) / 2,
    y: contactBottom + 56,
    qrSize: 320,
    labelCenterX: width / 2,
  });
}

export async function renderHorizontalCard(
  canvas: HTMLCanvasElement,
  config: CardConfig,
  qrDataUrl: string,
): Promise<void> {
  const palette = buildPalette(config);
  const logo = await loadLogo(config.logoDataUrl);
  const qrImage = await loadQrImage(qrDataUrl);

  const width = 1200;
  const height = 675;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawGradientBackground(ctx, width, height, palette);
  drawDecorations(ctx, width, height, palette);

  const qrSize = 280;
  const frameSize = qrSize + 36;
  const qrX = width - frameSize - 64;
  const qrY = (height - frameSize - 56) / 2;

  const blockOptions: ContactBlockOptions = {
    anchorX: 64,
    startY: 0,
    align: "left",
    companyFontSize: 24,
    nameFontSize: 46,
    titleFontSize: 20,
    valueFontSize: 22,
    logo: null,
    logoMaxWidth: 140,
    logoMaxHeight: 56,
    logoPlacement: "none",
    contactRowLayout: "inline",
    labelColumnWidth: 72,
    spacing: {
      afterCompany: 14,
      afterLogo: 36,
      beforeName: 24,
      betweenNameLines: 8,
      afterName: 18,
      afterTitle: 22,
      afterRow: 18,
    },
  };

  const contentHeight = measureContactBlockHeight(config, blockOptions);
  blockOptions.startY = Math.max(56, (height - contentHeight) / 2);

  drawContactBlock(ctx, config, palette, blockOptions);

  if (logo) {
    const logoMaxWidth = 240;
    const logoMaxHeight = 180;
    const { height: logoHeight } = getLogoDimensions(logo, logoMaxWidth, logoMaxHeight);
    const middleCenterX = width / 2;
    const logoY = (height - logoHeight) / 2;
    drawLogo(ctx, logo, middleCenterX, logoY, logoMaxWidth, logoMaxHeight);
  }

  drawQrSection(ctx, qrImage, palette, {
    x: qrX,
    y: qrY,
    qrSize,
    labelCenterX: qrX + frameSize / 2,
  });
}

export async function renderCard(
  canvas: HTMLCanvasElement,
  config: CardConfig,
  qrDataUrl: string,
): Promise<void> {
  if (config.layout === "horizontal") {
    await renderHorizontalCard(canvas, config, qrDataUrl);
    return;
  }

  await renderVerticalCard(canvas, config, qrDataUrl);
}
