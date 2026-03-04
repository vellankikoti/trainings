/**
 * Client-side API helper — typed fetch wrapper for frontend components.
 *
 * Usage:
 *   const { data, error } = await api.get<MyType>("/api/institutes");
 *   const { data, error } = await api.post("/api/invitations", { email, role, ... });
 */

export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        return { data: null, error: `Request failed (${res.status})`, status: res.status };
      }
      return { data: null, error: null, status: res.status };
    }

    const json = await res.json();

    if (!res.ok) {
      const message =
        typeof json.error === "string"
          ? json.error
          : json.error?.message ?? `Request failed (${res.status})`;
      return { data: null, error: message, status: res.status };
    }

    // Some endpoints wrap in { data: ... }, others return data directly
    const payload = json.data !== undefined ? json.data : json;
    return { data: payload as T, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}

export const api = {
  get: <T = unknown>(url: string, init?: RequestInit) =>
    request<T>(url, { method: "GET", ...init }),

  post: <T = unknown>(url: string, body?: unknown, init?: RequestInit) =>
    request<T>(url, {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
      ...init,
    }),

  patch: <T = unknown>(url: string, body?: unknown, init?: RequestInit) =>
    request<T>(url, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined,
      ...init,
    }),

  delete: <T = unknown>(url: string, init?: RequestInit) =>
    request<T>(url, { method: "DELETE", ...init }),
};
