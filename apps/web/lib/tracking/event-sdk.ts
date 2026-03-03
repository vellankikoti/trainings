/**
 * Client-side event tracking SDK for the Career Transformation Engine.
 *
 * Buffers events and sends them in batches via POST /api/events/batch.
 * Tracks active time using the Page Visibility API.
 *
 * Usage:
 *   import { tracker } from "@/lib/tracking/event-sdk";
 *   tracker.track({ type: "lesson.viewed", entityType: "lesson", entityId: "01-linux-story" });
 */

"use client";

interface TrackingEvent {
  type: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}

interface QueuedEvent extends TrackingEvent {
  timestamp: number;
}

const FLUSH_INTERVAL_MS = 10_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 50;

class EventTracker {
  private queue: QueuedEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private activeTimeStart: number | null = null;
  private totalActiveSeconds = 0;
  private currentEntity: { type: string; id: string } | null = null;
  private sessionId: string;
  private initialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize the tracker. Call once when the app mounts (e.g. in a provider).
   * Safe to call multiple times — only the first call has effect.
   */
  init(): void {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Start flush timer
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    // Track active time via visibility API
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.activeTimeStart = Date.now();
      } else {
        this.recordActiveTime();
      }
    });

    window.addEventListener("focus", () => {
      this.activeTimeStart = Date.now();
    });

    window.addEventListener("blur", () => {
      this.recordActiveTime();
    });

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      this.sendHeartbeat();
      this.flush();
    });

    // Mark as active right now
    this.activeTimeStart = Date.now();
  }

  /**
   * Track a single event. Events are queued and sent in batches.
   */
  track(event: TrackingEvent): void {
    this.queue.push({
      ...event,
      timestamp: Date.now(),
    });

    // Flush immediately if batch is full
    if (this.queue.length >= MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Set the current entity being interacted with (for heartbeat tracking).
   * Call this when the user starts a lesson, lab, etc.
   */
  setCurrentEntity(entityType: string, entityId: string): void {
    // If switching entities, send final heartbeat for the previous one
    if (
      this.currentEntity &&
      (this.currentEntity.type !== entityType ||
        this.currentEntity.id !== entityId)
    ) {
      this.sendHeartbeat();
    }

    this.currentEntity = { type: entityType, id: entityId };
    this.totalActiveSeconds = 0;
    this.activeTimeStart = Date.now();

    // Start heartbeat timer
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      HEARTBEAT_INTERVAL_MS
    );
  }

  /**
   * Clear the current entity (e.g. when navigating away from a lesson).
   */
  clearCurrentEntity(): void {
    this.sendHeartbeat();
    this.currentEntity = null;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send a heartbeat with accumulated active time.
   */
  private sendHeartbeat(): void {
    this.recordActiveTime();
    if (this.currentEntity && this.totalActiveSeconds > 0) {
      this.track({
        type: "time.heartbeat",
        entityType: this.currentEntity.type,
        entityId: this.currentEntity.id,
        data: { activeSeconds: this.totalActiveSeconds },
      });
      this.totalActiveSeconds = 0;
    }
  }

  private recordActiveTime(): void {
    if (this.activeTimeStart) {
      const elapsed = Math.floor((Date.now() - this.activeTimeStart) / 1000);
      if (elapsed >= 1) {
        this.totalActiveSeconds += elapsed;
      }
      this.activeTimeStart = null;
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);

    try {
      const response = await fetch("/api/events/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: batch,
          sessionId: this.sessionId,
        }),
        keepalive: true,
      });

      if (!response.ok) {
        // Re-queue on server error (not client errors like 400)
        if (response.status >= 500) {
          this.queue.unshift(...batch);
        }
      }
    } catch {
      // Re-queue on network error
      this.queue.unshift(...batch);
    }
  }

  /**
   * Clean up timers. Call when unmounting the app.
   */
  destroy(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.sendHeartbeat();
    this.flush();
    this.initialized = false;
  }

  private generateSessionId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

// Singleton instance
export const tracker = new EventTracker();
