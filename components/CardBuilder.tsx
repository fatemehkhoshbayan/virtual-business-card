"use client";

import { useRef, useState } from "react";
import { CardCanvas, type CardCanvasHandle } from "@/components/CardCanvas";
import { ThemeToggle } from "@/components/ThemeToggle";
import { defaultCardConfig, type CardConfig, type CardLayout } from "@/lib/types";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      {children}
    </label>
  );
}

const inputClassName =
  "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900";

export function CardBuilder() {
  const canvasRef = useRef<CardCanvasHandle>(null);
  const [config, setConfig] = useState<CardConfig>(defaultCardConfig);

  function updateField<K extends keyof CardConfig>(key: K, value: CardConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      updateField("logoDataUrl", null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoDataUrl", typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function setLayout(layout: CardLayout) {
    updateField("layout", layout);
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
              <Field label="First name">
                <input
                  className={inputClassName}
                  value={config.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  placeholder="Jane"
                />
              </Field>
              <Field label="Last name">
                <input
                  className={inputClassName}
                  value={config.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  placeholder="Smith"
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

            <Field label="Phone">
              <input
                className={inputClassName}
                type="tel"
                value={config.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+1 555 123 4567"
              />
            </Field>

            <Field label="Email">
              <input
                className={inputClassName}
                type="email"
                value={config.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="name@company.com"
              />
            </Field>

            <Field label="Website">
              <input
                className={inputClassName}
                value={config.website}
                onChange={(event) => updateField("website", event.target.value)}
                placeholder="www.company.com"
              />
            </Field>

            <Field label="Company logo (optional)">
              <input
                className={`${inputClassName} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-200`}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
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
              onClick={() => canvasRef.current?.download()}
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
