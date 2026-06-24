# Virtual Business Card

A web app for creating scannable QR business cards. Fill in your contact details, customize colors and layout, preview the card live, and download it as a PNG. Scanning the QR code adds your vCard contact to a phone.

## Features

- **Live preview** — see your card update as you type
- **vCard QR code** — encodes name, company, title, phone, email, and website
- **Custom branding** — primary and accent colors, optional company logo
- **Two layouts** — vertical or horizontal
- **Dark mode** — toggle light/dark UI theme
- **Download PNG** — export a ready-to-share image

## Getting started

### Prerequisites

- Node.js 18+ (Node.js 24 recommended)
- npm

### Install and run

```bash
git clone git@github.com:fatemehkhoshbayan/virtual-business-card.git
cd virtual-business-card
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [QRCode](https://www.npmjs.com/package/qrcode) — QR generation
- HTML Canvas — card rendering and PNG export

## Deploy

This project is configured for [Vercel](https://vercel.com). Connect your GitHub repo and deploy, or use the Vercel CLI:

```bash
npx vercel
```

## License

ISC
