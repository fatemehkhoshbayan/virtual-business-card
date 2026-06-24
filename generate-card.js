const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");

const contact = {
  firstName: "Loloa",
  lastName: "Alkasawat",
  fullName: "Loloa Alkasawat",
  company: "SPAN",
  title: "Founder, Chair and Treasurer",
  phone: "+1 416 876 1509",
  phoneRaw: "+14168761509",
  email: "loloa@span-ea.ca",
  website: "www.span-ea.ca",
  websiteUrl: "https://www.span-ea.ca",
};

const vCard = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  `N:${contact.lastName};${contact.firstName};;;`,
  `FN:${contact.fullName}`,
  `ORG:${contact.company}`,
  `TITLE:${contact.title}`,
  `TEL;TYPE=CELL:${contact.phoneRaw}`,
  `EMAIL:${contact.email}`,
  `URL:${contact.websiteUrl}`,
  "END:VCARD",
].join("\n");

const WIDTH = 675;
const OUTPUT = path.join(__dirname, "loloa-card.png");

const colors = {
  bgTop: "#0a1628",
  bgBottom: "#0f2044",
  accent: "#d4a843",
  accentSoft: "#8ea4c7",
  white: "#ffffff",
  muted: "#b8c7de",
  panel: "rgba(255, 255, 255, 0.06)",
  panelBorder: "rgba(212, 168, 67, 0.35)",
};

function drawGradientBackground(ctx, height) {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, height);
  gradient.addColorStop(0, colors.bgTop);
  gradient.addColorStop(1, colors.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, height);
}

function drawDecorations(ctx, height) {
  ctx.strokeStyle = "rgba(212, 168, 67, 0.18)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(120, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(WIDTH - 120, height - 40);
  ctx.lineTo(WIDTH, height - 40);
  ctx.stroke();

  ctx.fillStyle = "rgba(212, 168, 67, 0.08)";
  ctx.beginPath();
  ctx.arc(WIDTH - 80, 80, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(90, height - 70, 90, 0, Math.PI * 2);
  ctx.fill();
}

function drawContactInfo(ctx) {
  const centerX = WIDTH / 2;
  let y = 72;

  ctx.textAlign = "center";

  ctx.fillStyle = colors.accent;
  ctx.font = "600 18px Helvetica, Arial, sans-serif";
  ctx.fillText(contact.company, centerX, y);

  y += 48;
  ctx.fillStyle = colors.white;
  ctx.font = "700 44px Helvetica, Arial, sans-serif";
  ctx.fillText(contact.firstName, centerX, y);

  y += 52;
  ctx.fillText(contact.lastName, centerX, y);

  y += 36;
  ctx.fillStyle = colors.accent;
  ctx.font = "500 20px Helvetica, Arial, sans-serif";
  ctx.fillText(contact.title, centerX, y);

  y += 40;
  const rows = [
    { label: "Phone", value: contact.phone },
    { label: "Email", value: contact.email },
    { label: "Website", value: contact.website },
  ];

  rows.forEach((row) => {
    ctx.fillStyle = colors.accentSoft;
    ctx.font = "600 13px Helvetica, Arial, sans-serif";
    ctx.fillText(row.label.toUpperCase(), centerX, y);

    y += 22;
    ctx.fillStyle = colors.muted;
    ctx.font = "400 22px Helvetica, Arial, sans-serif";
    ctx.fillText(row.value, centerX, y);

    y += 28;
  });

  ctx.textAlign = "left";
  return y;
}

function drawQrSection(ctx, qrImage, startY) {
  const qrSize = 320;
  const padding = 18;
  const frameSize = qrSize + padding * 2;
  const x = (WIDTH - frameSize) / 2;
  const y = startY + 32;

  ctx.fillStyle = colors.panel;
  ctx.strokeStyle = colors.panelBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, x - 24, y - 24, frameSize + 48, frameSize + 92, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.white;
  roundRect(ctx, x, y, frameSize, frameSize, 12);
  ctx.fill();

  ctx.drawImage(qrImage, x + padding, y + padding, qrSize, qrSize);

  ctx.fillStyle = colors.muted;
  ctx.font = "500 18px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  const label = "Scan to save contact";
  ctx.fillText(label, WIDTH / 2, y + frameSize + 42);
  ctx.textAlign = "left";

  return y + frameSize + 72;
}

function getContactBottomY() {
  let y = 72 + 48 + 52 + 52 + 36 + 40;
  y += 3 * (22 + 28);
  return y;
}

function roundRect(ctx, x, y, width, height, radius) {
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

async function generateCard() {
  const qrBuffer = await QRCode.toBuffer(vCard, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 600,
    color: {
      dark: "#0a1628",
      light: "#ffffff",
    },
  });

  const qrImage = await loadImage(qrBuffer);

  const contactBottom = getContactBottomY();
  const qrBottom = contactBottom + 32 + 356 + 72;
  const finalHeight = qrBottom + 48;

  const canvas = createCanvas(WIDTH, finalHeight);
  const ctx = canvas.getContext("2d");

  drawGradientBackground(ctx, finalHeight);
  drawDecorations(ctx, finalHeight);
  drawContactInfo(ctx);
  drawQrSection(ctx, qrImage, contactBottom);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(OUTPUT, buffer);

  console.log(`Card saved to ${OUTPUT}`);
}

generateCard().catch((error) => {
  console.error("Failed to generate card:", error);
  process.exit(1);
});
