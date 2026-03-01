/**
 * Container Manager for browser-based lab environments.
 *
 * Manages Docker containers for lab sessions. Each user gets an isolated
 * container with configurable tools based on the lab type.
 *
 * For MVP, this runs on a single server. For scale, move to a managed
 * container service (Railway, Fly.io, or dedicated Kubernetes cluster).
 */

export interface ContainerConfig {
  /** Docker image to use */
  image: string;
  /** Lab type identifier */
  labType: string;
  /** Memory limit (e.g., "256m") */
  memoryLimit: string;
  /** CPU limit (e.g., "0.5") */
  cpuLimit: string;
  /** Environment variables to inject */
  envVars?: Record<string, string>;
  /** Commands to run on startup */
  startupCommands?: string[];
}

export interface LabSession {
  sessionId: string;
  userId: string;
  containerId: string | null;
  labType: string;
  status: "creating" | "running" | "stopped" | "expired" | "error";
  wsUrl: string | null;
  createdAt: string;
  lastActivityAt: string;
  exercisesCompleted: string[];
}

/**
 * Lab configurations by type.
 * Maps lab type slugs to Docker container configurations.
 */
export const LAB_CONFIGS: Record<string, ContainerConfig> = {
  "linux-basics": {
    image: "devops-engineers/lab-linux:latest",
    labType: "linux-basics",
    memoryLimit: "256m",
    cpuLimit: "0.5",
    envVars: { LAB_TYPE: "linux-basics" },
  },
  "linux-admin": {
    image: "devops-engineers/lab-linux:latest",
    labType: "linux-admin",
    memoryLimit: "256m",
    cpuLimit: "0.5",
    envVars: { LAB_TYPE: "linux-admin" },
  },
  "shell-scripting": {
    image: "devops-engineers/lab-shell:latest",
    labType: "shell-scripting",
    memoryLimit: "256m",
    cpuLimit: "0.5",
    envVars: { LAB_TYPE: "shell-scripting" },
  },
  "git-basics": {
    image: "devops-engineers/lab-git:latest",
    labType: "git-basics",
    memoryLimit: "256m",
    cpuLimit: "0.5",
    envVars: { LAB_TYPE: "git-basics" },
  },
  "docker-basics": {
    image: "devops-engineers/lab-docker:latest",
    labType: "docker-basics",
    memoryLimit: "512m",
    cpuLimit: "1.0",
    envVars: { LAB_TYPE: "docker-basics" },
  },
  "docker-compose": {
    image: "devops-engineers/lab-docker:latest",
    labType: "docker-compose",
    memoryLimit: "512m",
    cpuLimit: "1.0",
    envVars: { LAB_TYPE: "docker-compose" },
  },
};

/** Maximum session duration in milliseconds (30 minutes) */
export const MAX_SESSION_DURATION_MS = 30 * 60 * 1000;

/** Inactivity timeout in milliseconds (30 minutes) */
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * In-memory session store.
 * For production at scale, replace with Redis.
 */
const sessions = new Map<string, LabSession>();

/**
 * Generate a unique session ID.
 */
function generateSessionId(): string {
  return `lab_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Create a new lab session for a user.
 */
export async function createLabSession(
  userId: string,
  labType: string,
): Promise<LabSession> {
  const config = LAB_CONFIGS[labType];
  if (!config) {
    throw new Error(`Unknown lab type: ${labType}`);
  }

  // Check for existing active session
  const existingSession = getActiveSessionForUser(userId);
  if (existingSession) {
    throw new Error(
      "You already have an active lab session. Please stop it before starting a new one.",
    );
  }

  const sessionId = generateSessionId();
  const now = new Date().toISOString();

  // Determine WebSocket URL based on environment
  const wsHost = process.env.LAB_WS_HOST || "localhost:3001";
  const wsProtocol = process.env.NODE_ENV === "production" ? "wss" : "ws";

  const session: LabSession = {
    sessionId,
    userId,
    containerId: null, // Will be set when container is created
    labType,
    status: "creating",
    wsUrl: `${wsProtocol}://${wsHost}/ws/${sessionId}`,
    createdAt: now,
    lastActivityAt: now,
    exercisesCompleted: [],
  };

  sessions.set(sessionId, session);

  // In production, this would call Docker API to create a container.
  // For now, we simulate container creation and mark as running.
  try {
    // Simulate container creation (replace with actual Docker API call)
    session.containerId = `container_${sessionId}`;
    session.status = "running";
    sessions.set(sessionId, session);
  } catch (error) {
    session.status = "error";
    sessions.set(sessionId, session);
    throw error;
  }

  return session;
}

/**
 * Get a lab session by ID.
 */
export function getLabSession(sessionId: string): LabSession | null {
  return sessions.get(sessionId) ?? null;
}

/**
 * Get the active session for a user.
 */
export function getActiveSessionForUser(userId: string): LabSession | null {
  for (const session of sessions.values()) {
    if (
      session.userId === userId &&
      (session.status === "running" || session.status === "creating")
    ) {
      return session;
    }
  }
  return null;
}

/**
 * Update session activity timestamp (for inactivity tracking).
 */
export function touchSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActivityAt = new Date().toISOString();
    sessions.set(sessionId, session);
  }
}

/**
 * Mark an exercise as completed in a session.
 */
export function markExerciseCompleted(
  sessionId: string,
  exerciseId: string,
): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.status !== "running") {
    return false;
  }

  if (!session.exercisesCompleted.includes(exerciseId)) {
    session.exercisesCompleted.push(exerciseId);
    sessions.set(sessionId, session);
  }

  return true;
}

/**
 * Stop and destroy a lab session.
 */
export async function destroyLabSession(sessionId: string): Promise<boolean> {
  const session = sessions.get(sessionId);
  if (!session) return false;

  // In production, this would call Docker API to stop and remove the container
  session.status = "stopped";
  session.containerId = null;
  sessions.set(sessionId, session);

  // Clean up after a delay
  setTimeout(() => {
    sessions.delete(sessionId);
  }, 60_000);

  return true;
}

/**
 * Clean up expired and inactive sessions.
 * Should be called periodically (e.g., every 5 minutes).
 */
export function cleanupSessions(): { cleaned: number } {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of sessions) {
    const lastActivity = new Date(session.lastActivityAt).getTime();
    const created = new Date(session.createdAt).getTime();

    // Check inactivity timeout
    if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
      destroyLabSession(sessionId);
      cleaned++;
      continue;
    }

    // Check max session duration
    if (now - created > MAX_SESSION_DURATION_MS) {
      destroyLabSession(sessionId);
      cleaned++;
    }
  }

  return { cleaned };
}

// Run cleanup every 5 minutes
const cleanupInterval = setInterval(cleanupSessions, 5 * 60 * 1000);
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  cleanupInterval.unref();
}
