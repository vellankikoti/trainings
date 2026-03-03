"use client";

import { useEffect, useRef, useCallback } from "react";
import "@xterm/xterm/css/xterm.css";
import type { Terminal as XTermTerminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type {
  WebSocketMessage,
  WebSocketResponse,
} from "@/lib/labs/websocket-handler";

// ── Types ────────────────────────────────────────────────────────────────────

export interface XTerminalProps {
  /** WebSocket URL to connect to (from lab session) */
  wsUrl: string | null;
  /** Session ID for reconnection */
  sessionId: string;
  /** Called when the terminal connects */
  onConnected?: () => void;
  /** Called when the terminal disconnects */
  onDisconnected?: () => void;
  /** Called on connection error */
  onError?: (error: string) => void;
  /** Additional CSS class names */
  className?: string;
}

// ── Terminal theme ───────────────────────────────────────────────────────────

const TERMINAL_THEME = {
  background: "#0f1419",
  foreground: "#e6e1cf",
  cursor: "#f5e0dc",
  cursorAccent: "#0f1419",
  selectionBackground: "#264f78",
  selectionForeground: "#ffffff",
  black: "#0f1419",
  red: "#ff3333",
  green: "#b8cc52",
  yellow: "#e7c547",
  blue: "#36a3d9",
  magenta: "#f07178",
  cyan: "#95e6cb",
  white: "#e6e1cf",
  brightBlack: "#3e4b59",
  brightRed: "#ff6565",
  brightGreen: "#c2d94c",
  brightYellow: "#ffee99",
  brightBlue: "#6871ff",
  brightMagenta: "#ffa3aa",
  brightCyan: "#a8e6cf",
  brightWhite: "#ffffff",
};

// ── Reconnection config ──────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;

// ── Component ────────────────────────────────────────────────────────────────

export function XTerminal({
  wsUrl,
  sessionId,
  onConnected,
  onDisconnected,
  onError,
  className,
}: XTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Send WebSocket message ─────────────────────────────────────────────────

  const sendMessage = useCallback((msg: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ── Connect WebSocket ──────────────────────────────────────────────────────

  const connectWebSocket = useCallback(
    (terminal: XTermTerminal) => {
      if (!wsUrl) return;

      // Clean up existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        terminal.writeln("\x1b[32m● Connected to lab environment\x1b[0m\r");
        onConnected?.();
      };

      ws.onmessage = (event) => {
        try {
          const response: WebSocketResponse = JSON.parse(event.data);

          switch (response.type) {
            case "output":
              if (response.data) {
                terminal.write(response.data);
              }
              break;
            case "connected":
              if (response.data) {
                terminal.write(response.data);
              }
              break;
            case "error":
              terminal.writeln(
                `\r\n\x1b[31mError: ${response.data}\x1b[0m\r`,
              );
              onError?.(response.data ?? "Unknown error");
              break;
            case "exit":
              terminal.writeln(
                `\r\n\x1b[33mProcess exited with code ${response.exitCode}\x1b[0m\r`,
              );
              break;
            case "pong":
              break;
          }
        } catch {
          // Raw output (non-JSON) — write directly
          terminal.write(event.data);
        }
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          // Abnormal close — attempt reconnection
          terminal.writeln(
            "\r\n\x1b[33m● Connection lost. Reconnecting...\x1b[0m\r",
          );
          onDisconnected?.();

          if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
            const delay =
              INITIAL_RECONNECT_DELAY *
              Math.pow(2, reconnectAttemptRef.current);
            reconnectAttemptRef.current++;

            reconnectTimerRef.current = setTimeout(() => {
              connectWebSocket(terminal);
            }, delay);
          } else {
            terminal.writeln(
              "\r\n\x1b[31m● Failed to reconnect. Please refresh.\x1b[0m\r",
            );
          }
        } else {
          terminal.writeln(
            "\r\n\x1b[90m● Session ended.\x1b[0m\r",
          );
          onDisconnected?.();
        }
      };

      ws.onerror = () => {
        onError?.("WebSocket connection error");
      };
    },
    [wsUrl, onConnected, onDisconnected, onError],
  );

  // ── Initialize terminal ────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    let terminal: XTermTerminal;
    let fitAddon: FitAddon;
    let disposed = false;

    async function init() {
      const [
        { Terminal },
        { FitAddon: FitAddonClass },
        { WebLinksAddon: WebLinksAddonClass },
      ] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
        import("@xterm/addon-web-links"),
      ]);

      if (disposed || !containerRef.current) return;

      terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
        lineHeight: 1.3,
        theme: TERMINAL_THEME,
        scrollback: 5000,
        allowProposedApi: true,
        convertEol: true,
      });

      fitAddon = new FitAddonClass();
      const webLinksAddon = new WebLinksAddonClass();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);

      terminal.open(containerRef.current);
      fitAddon.fit();

      termRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Handle user input → send to WebSocket
      terminal.onData((data) => {
        sendMessage({ type: "input", data });
      });

      // Handle terminal resize → send to WebSocket
      terminal.onResize(({ cols, rows }) => {
        sendMessage({ type: "resize", cols, rows });
      });

      // Welcome message
      terminal.writeln(
        "\x1b[1;36m╭─────────────────────────────────────╮\x1b[0m",
      );
      terminal.writeln(
        "\x1b[1;36m│     DevOps Engineers Lab Terminal    │\x1b[0m",
      );
      terminal.writeln(
        "\x1b[1;36m╰─────────────────────────────────────╯\x1b[0m",
      );
      terminal.writeln("");

      // Connect WebSocket if URL provided
      if (wsUrl) {
        terminal.writeln("\x1b[90mConnecting to lab environment...\x1b[0m\r");
        connectWebSocket(terminal);
      } else {
        terminal.writeln(
          "\x1b[33mNo WebSocket server available.\x1b[0m\r",
        );
        terminal.writeln(
          "\x1b[90mStart the lab environment to connect.\x1b[0m\r",
        );
      }
    }

    init();

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch {
          // Ignore fit errors during rapid resize
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);

      // Clear reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }

      // Dispose terminal
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [wsUrl, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ping to keep connection alive ──────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 25_000);

    return () => clearInterval(interval);
  }, [sendMessage]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: TERMINAL_THEME.background }}
    />
  );
}
