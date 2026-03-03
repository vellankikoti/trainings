"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";

// ── Types ────────────────────────────────────────────────────────────────────

interface EditorFile {
  name: string;
  language: string;
  content: string;
}

export interface LabEditorProps {
  /** Initial files to display in the editor */
  files?: EditorFile[];
  /** Called when file content changes */
  onContentChange?: (filename: string, content: string) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
}

// ── Language detection ───────────────────────────────────────────────────────

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    yaml: "yaml",
    yml: "yaml",
    json: "json",
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "shell",
    bash: "shell",
    dockerfile: "dockerfile",
    tf: "hcl",
    hcl: "hcl",
    toml: "ini",
    ini: "ini",
    conf: "ini",
    md: "markdown",
    xml: "xml",
    html: "html",
    css: "css",
    sql: "sql",
    go: "go",
    rs: "rust",
    rb: "ruby",
    nginx: "nginx",
  };
  return langMap[ext] ?? "plaintext";
}

// ── Default files ────────────────────────────────────────────────────────────

const DEFAULT_FILES: EditorFile[] = [
  {
    name: "docker-compose.yml",
    language: "yaml",
    content: `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
`,
  },
  {
    name: "Dockerfile",
    language: "dockerfile",
    content: `FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \\
    curl \\
    vim \\
    git

WORKDIR /app

CMD ["/bin/bash"]
`,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function LabEditor({
  files = DEFAULT_FILES,
  onContentChange,
  readOnly = false,
}: LabEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [fileContents, setFileContents] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const f of files) {
        map[f.name] = f.content;
      }
      return map;
    },
  );

  const currentFile = files[activeFile];

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!value || !currentFile) return;

      setFileContents((prev) => ({
        ...prev,
        [currentFile.name]: value,
      }));

      onContentChange?.(currentFile.name, value);
    },
    [currentFile, onContentChange],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-border/60">
      {/* File tabs */}
      <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border/60 bg-[#1e1e1e] px-2">
        {files.map((file, i) => (
          <button
            key={file.name}
            onClick={() => setActiveFile(i)}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
              i === activeFile
                ? "bg-[#1e1e1e] text-white border-t border-x border-border/30"
                : "text-[#808080] hover:text-[#cccccc]"
            }`}
          >
            <FileIcon language={file.language} />
            {file.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {currentFile && (
          <Editor
            height="100%"
            language={currentFile.language}
            value={fileContents[currentFile.name] ?? currentFile.content}
            onChange={handleChange}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
              lineHeight: 20,
              padding: { top: 8 },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              automaticLayout: true,
              lineNumbers: "on",
              renderLineHighlight: "line",
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ language }: { language: string }) {
  const colors: Record<string, string> = {
    yaml: "#cb171e",
    json: "#f5c451",
    javascript: "#f0db4f",
    typescript: "#3178c6",
    python: "#3776ab",
    shell: "#89e051",
    dockerfile: "#2496ed",
    markdown: "#ffffff",
    hcl: "#7b42bc",
  };

  return (
    <div
      className="h-2 w-2 rounded-sm"
      style={{ backgroundColor: colors[language] ?? "#808080" }}
    />
  );
}
