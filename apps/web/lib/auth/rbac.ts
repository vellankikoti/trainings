/**
 * Role-Based Access Control (RBAC) for the Career Transformation Engine.
 *
 * Defines roles, permissions, and helpers used by API routes and middleware
 * to enforce authorization. Clerk handles authentication; this module
 * handles authorization.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Role =
  | "learner"
  | "trainer"
  | "institute_admin"
  | "recruiter"
  | "org_admin"
  | "admin"
  | "super_admin";

export type Resource =
  | "profile"
  | "progress"
  | "lab_session"
  | "simulation"
  | "skill_score"
  | "batch"
  | "institute"
  | "organization"
  | "job_posting"
  | "candidate"
  | "report"
  | "content"
  | "system"
  | "event"
  | "invitation"
  | "membership"
  | "approval";

export type Action = "create" | "read" | "update" | "delete" | "export";

export type Scope = "own" | "batch" | "institute" | "organization" | "platform";

export interface Permission {
  resource: Resource;
  action: Action;
  scope: Scope;
}

export interface AuthContext {
  userId: string;       // Clerk user ID
  profileId: string;    // Supabase profile UUID
  role: Role;
  instituteId?: string; // Populated for trainer / institute_admin
  orgId?: string;       // Populated for recruiter / org_admin
}

// ---------------------------------------------------------------------------
// Role hierarchy — higher roles inherit lower role permissions
// ---------------------------------------------------------------------------

const ROLE_HIERARCHY: Record<Role, Role[]> = {
  learner: [],
  trainer: ["learner"],
  institute_admin: ["trainer", "learner"],
  recruiter: ["learner"],
  org_admin: ["recruiter", "learner"],
  admin: ["learner"],
  super_admin: ["admin", "learner"],
};

// ---------------------------------------------------------------------------
// Permission definitions per role (own permissions only — inherited via hierarchy)
// ---------------------------------------------------------------------------

const ROLE_OWN_PERMISSIONS: Record<Role, Permission[]> = {
  learner: [
    { resource: "profile", action: "read", scope: "own" },
    { resource: "profile", action: "update", scope: "own" },
    { resource: "progress", action: "read", scope: "own" },
    { resource: "lab_session", action: "create", scope: "own" },
    { resource: "lab_session", action: "read", scope: "own" },
    { resource: "simulation", action: "create", scope: "own" },
    { resource: "simulation", action: "read", scope: "own" },
    { resource: "skill_score", action: "read", scope: "own" },
    { resource: "job_posting", action: "read", scope: "platform" },
    { resource: "report", action: "export", scope: "own" },
    { resource: "event", action: "create", scope: "own" },
    { resource: "content", action: "read", scope: "platform" },
  ],

  trainer: [
    { resource: "progress", action: "read", scope: "batch" },
    { resource: "lab_session", action: "read", scope: "batch" },
    { resource: "simulation", action: "read", scope: "batch" },
    { resource: "skill_score", action: "read", scope: "batch" },
    { resource: "batch", action: "read", scope: "institute" },
    { resource: "batch", action: "update", scope: "institute" },
    { resource: "report", action: "read", scope: "batch" },
    { resource: "report", action: "export", scope: "batch" },
    { resource: "institute", action: "read", scope: "institute" },
  ],

  institute_admin: [
    { resource: "institute", action: "read", scope: "institute" },
    { resource: "institute", action: "update", scope: "institute" },
    { resource: "batch", action: "create", scope: "institute" },
    { resource: "batch", action: "read", scope: "institute" },
    { resource: "batch", action: "update", scope: "institute" },
    { resource: "batch", action: "delete", scope: "institute" },
    { resource: "report", action: "read", scope: "institute" },
    { resource: "report", action: "export", scope: "institute" },
    { resource: "invitation", action: "create", scope: "institute" },
    { resource: "invitation", action: "read", scope: "institute" },
    { resource: "invitation", action: "delete", scope: "institute" },
    { resource: "membership", action: "update", scope: "institute" },
    { resource: "membership", action: "delete", scope: "institute" },
  ],

  recruiter: [
    { resource: "candidate", action: "read", scope: "organization" },
    { resource: "job_posting", action: "create", scope: "organization" },
    { resource: "job_posting", action: "read", scope: "organization" },
    { resource: "job_posting", action: "update", scope: "organization" },
    { resource: "organization", action: "read", scope: "organization" },
  ],

  org_admin: [
    { resource: "organization", action: "read", scope: "organization" },
    { resource: "organization", action: "update", scope: "organization" },
    { resource: "job_posting", action: "delete", scope: "organization" },
    { resource: "candidate", action: "read", scope: "organization" },
    { resource: "report", action: "read", scope: "organization" },
    { resource: "invitation", action: "create", scope: "organization" },
    { resource: "invitation", action: "read", scope: "organization" },
    { resource: "invitation", action: "delete", scope: "organization" },
    { resource: "membership", action: "update", scope: "organization" },
    { resource: "membership", action: "delete", scope: "organization" },
  ],

  admin: [
    { resource: "content", action: "create", scope: "platform" },
    { resource: "content", action: "read", scope: "platform" },
    { resource: "content", action: "update", scope: "platform" },
    { resource: "content", action: "delete", scope: "platform" },
    { resource: "profile", action: "read", scope: "platform" },
    { resource: "profile", action: "update", scope: "platform" },
    { resource: "progress", action: "read", scope: "platform" },
    { resource: "report", action: "read", scope: "platform" },
    { resource: "institute", action: "read", scope: "platform" },
    { resource: "organization", action: "read", scope: "platform" },
    { resource: "system", action: "read", scope: "platform" },
    { resource: "approval", action: "read", scope: "platform" },
    { resource: "approval", action: "create", scope: "platform" },
    { resource: "invitation", action: "read", scope: "platform" },
    { resource: "invitation", action: "create", scope: "platform" },
    { resource: "invitation", action: "delete", scope: "platform" },
    { resource: "membership", action: "update", scope: "platform" },
    { resource: "membership", action: "delete", scope: "platform" },
  ],

  super_admin: [
    { resource: "system", action: "create", scope: "platform" },
    { resource: "system", action: "read", scope: "platform" },
    { resource: "system", action: "update", scope: "platform" },
    { resource: "system", action: "delete", scope: "platform" },
    { resource: "institute", action: "create", scope: "platform" },
    { resource: "institute", action: "delete", scope: "platform" },
    { resource: "organization", action: "create", scope: "platform" },
    { resource: "organization", action: "delete", scope: "platform" },
    { resource: "profile", action: "delete", scope: "platform" },
  ],
};

// ---------------------------------------------------------------------------
// Resolve effective permissions (own + inherited)
// ---------------------------------------------------------------------------

function getEffectivePermissions(role: Role): Permission[] {
  const own = ROLE_OWN_PERMISSIONS[role] ?? [];
  const inherited = (ROLE_HIERARCHY[role] ?? []).flatMap(
    (r) => ROLE_OWN_PERMISSIONS[r] ?? []
  );
  return [...own, ...inherited];
}

// ---------------------------------------------------------------------------
// Scope hierarchy — a broader scope satisfies narrower requirements
// ---------------------------------------------------------------------------

const SCOPE_ORDER: Record<Scope, number> = {
  own: 0,
  batch: 1,
  institute: 2,
  organization: 2,
  platform: 3,
};

function isScopeAllowed(
  grantedScope: Scope,
  requiredScope: Scope
): boolean {
  return SCOPE_ORDER[grantedScope] >= SCOPE_ORDER[requiredScope];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether a role has a specific permission.
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action,
  requiredScope: Scope = "own"
): boolean {
  const permissions = getEffectivePermissions(role);
  return permissions.some(
    (p) =>
      p.resource === resource &&
      p.action === action &&
      isScopeAllowed(p.scope, requiredScope)
  );
}

/**
 * Assert that a role has a specific permission. Returns an error response
 * object if the check fails, or `null` if the check passes.
 */
export function assertPermission(
  role: Role,
  resource: Resource,
  action: Action,
  requiredScope: Scope = "own"
): { status: 403; body: { error: string } } | null {
  if (hasPermission(role, resource, action, requiredScope)) {
    return null;
  }
  return {
    status: 403,
    body: {
      error: `Forbidden: role '${role}' cannot ${action} ${resource} at scope '${requiredScope}'`,
    },
  };
}

/**
 * Validate that a value is a known role.
 */
export function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    [
      "learner",
      "trainer",
      "institute_admin",
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    ].includes(value)
  );
}

/**
 * List of roles that have access to each dashboard area.
 */
export const DASHBOARD_ACCESS: Record<string, Role[]> = {
  learner: ["learner", "trainer", "institute_admin", "recruiter", "org_admin", "admin", "super_admin"],
  trainer: ["trainer", "institute_admin", "admin", "super_admin"],
  institute: ["institute_admin", "admin", "super_admin"],
  organization: ["recruiter", "org_admin", "admin", "super_admin"],
  admin: ["admin", "super_admin"],
};

/**
 * Get the primary dashboard path for a role.
 */
export function getDashboardPath(role: Role): string {
  switch (role) {
    case "trainer":
      return "/trainer";
    case "institute_admin":
      return "/institute";
    case "recruiter":
    case "org_admin":
      return "/organization";
    case "admin":
    case "super_admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}
