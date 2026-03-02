"use client";

import React, { useRef, useState, isValidElement } from "react";

/* ── Language display names ─────────────────────────────── */
const LANG_DISPLAY: Record<string, { label: string; color: string }> = {
  bash:       { label: "Bash",       color: "#4EAA25" },
  sh:         { label: "Shell",      color: "#4EAA25" },
  shell:      { label: "Shell",      color: "#4EAA25" },
  zsh:        { label: "Zsh",        color: "#4EAA25" },
  javascript: { label: "JavaScript", color: "#F7DF1E" },
  js:         { label: "JavaScript", color: "#F7DF1E" },
  typescript: { label: "TypeScript", color: "#3178C6" },
  ts:         { label: "TypeScript", color: "#3178C6" },
  tsx:        { label: "TSX",        color: "#3178C6" },
  jsx:        { label: "JSX",        color: "#61DAFB" },
  python:     { label: "Python",     color: "#3776AB" },
  py:         { label: "Python",     color: "#3776AB" },
  go:         { label: "Go",         color: "#00ADD8" },
  rust:       { label: "Rust",       color: "#DEA584" },
  yaml:       { label: "YAML",       color: "#CB171E" },
  yml:        { label: "YAML",       color: "#CB171E" },
  json:       { label: "JSON",       color: "#5B5EA6" },
  dockerfile: { label: "Dockerfile", color: "#2496ED" },
  docker:     { label: "Dockerfile", color: "#2496ED" },
  sql:        { label: "SQL",        color: "#CC7832" },
  html:       { label: "HTML",       color: "#E34F26" },
  css:        { label: "CSS",        color: "#1572B6" },
  hcl:        { label: "HCL",        color: "#844FBA" },
  terraform:  { label: "Terraform",  color: "#844FBA" },
  toml:       { label: "TOML",       color: "#9C4121" },
  ini:        { label: "INI",        color: "#9B9B9B" },
  nginx:      { label: "Nginx",      color: "#009639" },
  plaintext:  { label: "Text",       color: "#9B9B9B" },
  text:       { label: "Text",       color: "#9B9B9B" },
  makefile:   { label: "Makefile",   color: "#427819" },
  c:          { label: "C",          color: "#A8B9CC" },
  cpp:        { label: "C++",        color: "#00599C" },
  java:       { label: "Java",       color: "#ED8B00" },
  ruby:       { label: "Ruby",       color: "#CC342D" },
  php:        { label: "PHP",        color: "#777BB4" },
};

/* ── Helpers ───────────────────────────────────────────── */
function extractLanguage(children: React.ReactNode): string {
  if (!isValidElement(children)) return "";
  const props = children.props as Record<string, unknown>;

  // rehype-pretty-code sets data-language on the <code> element
  if (props["data-language"]) return String(props["data-language"]);

  // Fallback: className like "language-bash"
  const cls = String(props.className || "");
  const match = cls.match(/language-(\w+)/);
  return match ? match[1] : "";
}

function extractTitle(props: Record<string, unknown>): string {
  // rehype-pretty-code puts a data-rehype-pretty-code-title sibling,
  // but for the pre override we check the "data-language" attr
  return "";
}

/* ── Component ─────────────────────────────────────────── */
export function CodePre(props: React.ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const language = extractLanguage(props.children);
  const langInfo = LANG_DISPLAY[language] || null;
  const displayLang = langInfo?.label || (language ? language.toUpperCase() : "");
  const dotColor = langInfo?.color || "#9B9B9B";

  async function handleCopy() {
    if (!preRef.current) return;
    const text = preRef.current.textContent || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="code-editor-block not-prose group relative my-8 overflow-hidden rounded-xl bg-[hsl(220,13%,10%)] shadow-lg ring-1 ring-white/[0.06]">
      {/* ── VS Code-style title bar ── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[hsl(220,13%,14%)] px-4 py-2.5">
        {/* Left: traffic lights + language */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]/80 transition-colors group-hover:bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]/80 transition-colors group-hover:bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]/80 transition-colors group-hover:bg-[#28c840]" />
          </div>
          {displayLang && (
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: dotColor }}
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] font-medium tracking-wide text-[hsl(220,10%,54%)]">
                {displayLang}
              </span>
            </div>
          )}
        </div>

        {/* Right: copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[hsl(220,10%,50%)] transition-all hover:bg-white/[0.06] hover:text-[hsl(220,10%,72%)]"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* ── Code area ── */}
      <pre
        ref={preRef}
        {...props}
        className="!my-0 !rounded-none !bg-transparent !shadow-none !ring-0"
      />
    </div>
  );
}
