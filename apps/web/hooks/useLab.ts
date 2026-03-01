"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface LabSession {
  sessionId: string;
  status: string;
  wsUrl: string | null;
  labType: string;
  createdAt: string;
  exercisesCompleted: string[];
}

interface UseLabReturn {
  session: LabSession | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  startSession: (labType: string) => Promise<void>;
  stopSession: () => Promise<void>;
  validateExercise: (exerciseId: string) => Promise<boolean>;
  sendInput: (data: string) => void;
  onOutput: (callback: (data: string) => void) => void;
}

/**
 * React hook for managing lab sessions and WebSocket terminal connections.
 */
export function useLab(): UseLabReturn {
  const [session, setSession] = useState<LabSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const outputCallbackRef = useRef<((data: string) => void) | null>(null);

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  /**
   * Connect to the WebSocket terminal server.
   */
  const connectWebSocket = useCallback((wsUrl: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "output" && msg.data && outputCallbackRef.current) {
          outputCallbackRef.current(msg.data);
        } else if (msg.type === "error") {
          setError(msg.data);
        } else if (msg.type === "exit") {
          setIsConnected(false);
        }
      } catch {
        // Raw text output
        if (outputCallbackRef.current) {
          outputCallbackRef.current(event.data);
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, []);

  /**
   * Start a new lab session.
   */
  const startSession = useCallback(
    async (labType: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/labs/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labType }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to start lab session");
          return;
        }

        const newSession: LabSession = {
          sessionId: data.sessionId,
          status: data.status,
          wsUrl: data.wsUrl,
          labType: data.labType,
          createdAt: data.createdAt,
          exercisesCompleted: [],
        };

        setSession(newSession);

        // Connect WebSocket if URL is available
        if (data.wsUrl) {
          connectWebSocket(data.wsUrl);
        }
      } catch {
        setError("Failed to start lab session");
      } finally {
        setIsLoading(false);
      }
    },
    [connectWebSocket],
  );

  /**
   * Stop the current lab session.
   */
  const stopSession = useCallback(async () => {
    if (!session) return;

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      await fetch(`/api/labs/${session.sessionId}`, {
        method: "DELETE",
      });
    } catch {
      // Session cleanup is best-effort
    }

    setSession(null);
    setIsConnected(false);
  }, [session]);

  /**
   * Validate an exercise in the current session.
   */
  const validateExercise = useCallback(
    async (exerciseId: string): Promise<boolean> => {
      if (!session) return false;

      try {
        const res = await fetch(
          `/api/labs/${session.sessionId}/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId }),
          },
        );

        const data = await res.json();

        if (data.passed) {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  exercisesCompleted: data.exercisesCompleted || [
                    ...prev.exercisesCompleted,
                    exerciseId,
                  ],
                }
              : null,
          );
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [session],
  );

  /**
   * Send terminal input via WebSocket.
   */
  const sendInput = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "input", data }));
    }
  }, []);

  /**
   * Register a callback for terminal output.
   */
  const onOutput = useCallback((callback: (data: string) => void) => {
    outputCallbackRef.current = callback;
  }, []);

  return {
    session,
    isLoading,
    error,
    isConnected,
    startSession,
    stopSession,
    validateExercise,
    sendInput,
    onOutput,
  };
}
