export { hasPermission, assertPermission, isValidRole, getDashboardPath, DASHBOARD_ACCESS } from "./rbac";
export type { Role, Resource, Action, Scope, Permission, AuthContext } from "./rbac";
export { getAuthContext, requireAuth, requireRole, AuthError } from "./get-auth-context";
