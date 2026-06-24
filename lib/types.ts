export type CardLayout = "vertical" | "horizontal";

export type CardConfig = {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  layout: CardLayout;
  logoDataUrl: string | null;
};

export type CardPalette = {
  bgTop: string;
  bgBottom: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  muted: string;
  panel: string;
  panelBorder: string;
  qrDark: string;
};

export const defaultCardConfig: CardConfig = {
  firstName: "",
  lastName: "",
  company: "",
  title: "",
  phone: "",
  email: "",
  website: "",
  primaryColor: "#0a1628",
  accentColor: "#d4a843",
  layout: "vertical",
  logoDataUrl: null,
};
