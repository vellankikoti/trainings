/**
 * WebSocket handler for browser-based terminal sessions.
 *
 * This module manages the WebSocket connection between the client's
 * xterm.js terminal and the Docker container. In production, this would
 * run as a separate WebSocket server (e.g., on Fly.io or Railway).
 *
 * Architecture:
 *   Client (xterm.js) <--> WebSocket Server <--> Docker Container (exec)
 *
 * For MVP, the WebSocket server is a separate process.
 * For Vercel deployment, use a separate WebSocket service since
 * Vercel serverless functions don't support persistent WebSocket connections.
 */

export interface WebSocketMessage {
  type: "input" | "resize" | "ping";
  data?: string;
  cols?: number;
  rows?: number;
}

export interface WebSocketResponse {
  type: "output" | "error" | "exit" | "pong" | "connected";
  data?: string;
  exitCode?: number;
}

/**
 * Configuration for the WebSocket terminal server.
 */
export interface TerminalServerConfig {
  /** Port for the WebSocket server */
  port: number;
  /** Maximum connections per server */
  maxConnections: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval: number;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
}

export const DEFAULT_CONFIG: TerminalServerConfig = {
  port: parseInt(process.env.LAB_WS_PORT || "3001", 10),
  maxConnections: 100,
  heartbeatInterval: 30_000,
  connectionTimeout: 5 * 60_000, // 5 minutes without heartbeat
};

/**
 * Validate a WebSocket message from the client.
 */
export function validateMessage(raw: string): WebSocketMessage | null {
  try {
    const msg = JSON.parse(raw) as WebSocketMessage;

    if (!msg.type) return null;

    if (msg.type === "input" && typeof msg.data !== "string") return null;
    if (msg.type === "resize" && (!msg.cols || !msg.rows)) return null;

    return msg;
  } catch {
    return null;
  }
}

/**
 * Create a serialized WebSocket response.
 */
export function createResponse(response: WebSocketResponse): string {
  return JSON.stringify(response);
}

/**
 * Create a connection response for when a terminal session starts.
 */
export function createConnectedResponse(sessionId: string): string {
  return createResponse({
    type: "connected",
    data: `Connected to lab session ${sessionId}\r\n`,
  });
}

/**
 * Create an error response.
 */
export function createErrorResponse(message: string): string {
  return createResponse({
    type: "error",
    data: message,
  });
}

/**
 * Create an exit response.
 */
export function createExitResponse(exitCode: number): string {
  return createResponse({
    type: "exit",
    exitCode,
  });
}
