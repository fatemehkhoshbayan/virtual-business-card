"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import QRCode from "qrcode";
import { renderCard } from "@/lib/drawCard";
import type { CardConfig } from "@/lib/types";
import { buildVCard } from "@/lib/vcard";
import { getQrDarkColor } from "@/lib/colors";

export type CardCanvasHandle = {
  download: () => void;
};

type CardCanvasProps = {
  config: CardConfig;
};

export const CardCanvas = forwardRef<CardCanvasHandle, CardCanvasProps>(
  function CardCanvas({ config }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      download: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const firstName = config.firstName.trim() || "contact";
        const lastName = config.lastName.trim() || "card";
        const filename = `${firstName}-${lastName}-card.png`.toLowerCase();

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = filename;
        link.click();
      },
    }));

    useEffect(() => {
      let cancelled = false;

      async function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
          setError(null);
          const vCard = buildVCard(config);
          const qrDataUrl = await QRCode.toDataURL(vCard, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 600,
            color: {
              dark: getQrDarkColor(config.primaryColor),
              light: "#ffffff",
            },
          });

          if (cancelled) return;
          await renderCard(canvas, config, qrDataUrl);
        } catch (drawError) {
          if (!cancelled) {
            setError(
              drawError instanceof Error
                ? drawError.message
                : "Failed to render card preview.",
            );
          }
        }
      }

      void draw();

      return () => {
        cancelled = true;
      };
    }, [config]);

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-slate-600 dark:bg-slate-900">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live preview updates as you edit your details.
          </p>
        )}
      </div>
    );
  },
);
