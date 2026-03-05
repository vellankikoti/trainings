"use client";

import { useState } from "react";

/* ─── CourseIcon ─────────────────────────────────────────────────────────────── */
/** Primary colorful icon — displayed in a white container on gradient banners */

export function CourseIcon({ iconUrl, alt }: { iconUrl: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={alt}
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── WatermarkIcon ──────────────────────────────────────────────────────────── */
/** Background watermark icon — large, subtle, adds depth to gradient banners */

export function WatermarkIcon({ iconUrl }: { iconUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt=""
      width={200}
      height={200}
      className="pointer-events-none absolute -bottom-8 -right-8 h-[200px] w-[200px] select-none object-contain brightness-0 invert opacity-[0.07]"
      loading="lazy"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}
