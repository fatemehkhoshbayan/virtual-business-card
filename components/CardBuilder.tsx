"use client";

import { useEffect, useRef, useState } from "react";
import { CardCanvas, type CardCanvasHandle } from "@/components/CardCanvas";
import { ThemeToggle } from "@/components/ThemeToggle";
import { defaultCardConfig, type CardConfig, type CardLayout } from "@/lib/types";
import {
  validateConfig,
  validateLogoFile,
  type ValidatedField,
  type ValidationErrors,
} from "@/lib/validation";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-normal text-red-600 dark:text-red-400">{error}</span>
      ) : null}
    </label>
  );
}

const inputClassName =
  "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900";

const inputErrorClassName =
  "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-950";

function inputClass(hasError: boolean) {
  return `${inputClassName}${hasError ? ` ${inputErrorClassName}` : ""}`;
}

export function CardBuilder() {
  const canvasRef = useRef<CardCanvasHandle>(null);
  const [config, setConfig] = useState<CardConfig>(defaultCardConfig);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ValidatedField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [logoError, setLogoError] = useState<string | undefined>();

  const shouldValidate =
    submitAttempted || Object.values(touched).some(Boolean);

  useEffect(() => {
    if (!shouldValidate) return;
    setErrors(validateConfig(config));
  }, [config, shouldValidate]);

  function updateField<K extends keyof CardConfig>(key: K, value: CardConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function handleFieldBlur(key: ValidatedField) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setLogoError(undefined);
      updateField("logoDataUrl", null);
      return;
    }

    const fileError = validateLogoFile(file);
    if (fileError) {
      setLogoError(fileError);
      updateField("logoDataUrl", null);
      event.target.value = "";
      return;
    }

    setLogoError(undefined);

    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoDataUrl", typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function setLayout(layout: CardLayout) {
    updateField("layout", layout);
  }

  function handleDownload() {
    setSubmitAttempted(true);
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      website: true,
    });

    const nextErrors = validateConfig(config);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    canvasRef.current?.download();
  }

  function fieldError(key: ValidatedField) {
    return submitAttempted || touched[key] ? errors[key] : undefined;
  }

  const layoutButtonClass = (active: boolean) =>
    `rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
      active
        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            QR Business Card
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create a scannable contact card and download it as a PNG.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *" error={fieldError("firstName")}>
                <input
                  className={inputClass(Boolean(fieldError("firstName")))}
                  value={config.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  onBlur={() => handleFieldBlur("firstName")}
                  placeholder="Jane"
                  aria-invalid={Boolean(fieldError("firstName"))}
                />
              </Field>
              <Field label="Last name *" error={fieldError("lastName")}>
                <input
                  className={inputClass(Boolean(fieldError("lastName")))}
                  value={config.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  onBlur={() => handleFieldBlur("lastName")}
                  placeholder="Smith"
                  aria-invalid={Boolean(fieldError("lastName"))}
                />
              </Field>
            </div>

            <Field label="Company">
              <input
                className={inputClassName}
                value={config.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Acme Inc."
              />
            </Field>

            <Field label="Title / Role">
              <input
                className={inputClassName}
                value={config.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Marketing Director"
              />
            </Field>

            <Field label="Phone" error={fieldError("phone")}>
              <input
                className={inputClass(Boolean(fieldError("phone")))}
                type="tel"
                value={config.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                onBlur={() => handleFieldBlur("phone")}
                placeholder="+1 555 123 4567"
                aria-invalid={Boolean(fieldError("phone"))}
              />
            </Field>

            <Field label="Email" error={fieldError("email")}>
              <input
                className={inputClass(Boolean(fieldError("email")))}
                type="email"
                value={config.email}
                onChange={(event) => updateField("email", event.target.value)}
                onBlur={() => handleFieldBlur("email")}
                placeholder="name@company.com"
                aria-invalid={Boolean(fieldError("email"))}
              />
            </Field>

            <Field label="Website" error={fieldError("website")}>
              <input
                className={inputClass(Boolean(fieldError("website")))}
                value={config.website}
                onChange={(event) => updateField("website", event.target.value)}
                onBlur={() => handleFieldBlur("website")}
                placeholder="www.company.com"
                aria-invalid={Boolean(fieldError("website"))}
              />
            </Field>

            <Field label="Company logo (optional)" error={logoError}>
              <input
                className={`${inputClass(Boolean(logoError))} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-200`}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                aria-invalid={Boolean(logoError)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Card color">
                <input
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900"
                  type="color"
                  value={config.primaryColor}
                  onChange={(event) => updateField("primaryColor", event.target.value)}
                />
              </Field>
              <Field label="Accent color">
                <input
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900"
                  type="color"
                  value={config.accentColor}
                  onChange={(event) => updateField("accentColor", event.target.value)}
                />
              </Field>
            </div>

            <Field label="Layout">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={layoutButtonClass(config.layout === "vertical")}
                  onClick={() => setLayout("vertical")}
                >
                  Vertical
                </button>
                <button
                  type="button"
                  className={layoutButtonClass(config.layout === "horizontal")}
                  onClick={() => setLayout("horizontal")}
                >
                  Horizontal
                </button>
              </div>
            </Field>

            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
              onClick={handleDownload}
            >
              Download PNG
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Scan the QR code to add this contact to a phone.
            </p>
          </div>
          <CardCanvas ref={canvasRef} config={config} />
        </section>
      </div>
    </div>
  );
}
