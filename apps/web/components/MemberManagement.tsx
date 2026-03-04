"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface Props {
  entityType: "organization" | "institute";
  entityId: string;
  members: Member[];
  currentUserId: string;
  allowedRoles: { value: string; label: string }[];
  adminRole: string; // "org_admin" | "institute_admin"
}

export function MemberManagement({
  entityType,
  entityId,
  members: initialMembers,
  currentUserId,
  allowedRoles,
  adminRole,
}: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const basePath =
    entityType === "organization"
      ? `/api/organizations/${entityId}/members`
      : `/api/institutes/${entityId}/members`;

  const handleRoleChange = async (memberId: string, userId: string, newRole: string) => {
    setChangingRole(memberId);
    setStatus(null);

    const { error } = await api.patch(`${basePath}/${userId}`, { role: newRole });
    setChangingRole(null);

    if (error) {
      setStatus({ type: "error", text: error });
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setStatus({ type: "success", text: "Role updated" });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleRemove = async (memberId: string, userId: string, name: string) => {
    if (confirmRemove !== memberId) {
      setConfirmRemove(memberId);
      return;
    }

    setRemoving(memberId);
    setStatus(null);

    const { error } = await api.delete(`${basePath}/${userId}`);
    setRemoving(null);
    setConfirmRemove(null);

    if (error) {
      setStatus({ type: "error", text: error });
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setStatus({ type: "success", text: `${name} has been removed` });
    setTimeout(() => setStatus(null), 3000);
  };

  const adminCount = members.filter((m) => m.role === adminRole).length;

  return (
    <div>
      {status && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            status.type === "success"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => {
              const isCurrentUser = m.userId === currentUserId;
              const isLastAdmin = m.role === adminRole && adminCount <= 1;

              return (
                <tr key={m.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(m.displayName ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {m.displayName ?? "Unknown"}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        {m.username && (
                          <p className="text-xs text-muted-foreground">@{m.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {changingRole === m.id ? (
                      <span className="text-xs text-muted-foreground">Updating...</span>
                    ) : (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, m.userId, e.target.value)}
                        disabled={isLastAdmin || isCurrentUser}
                        className="rounded border bg-background px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          isLastAdmin
                            ? "Cannot change role of last admin"
                            : isCurrentUser
                              ? "Cannot change your own role"
                              : "Change role"
                        }
                      >
                        {allowedRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isLastAdmin ? (
                      <span className="text-xs text-muted-foreground">Last admin</span>
                    ) : confirmRemove === m.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRemove(m.id, m.userId, m.displayName ?? "Member")}
                          disabled={removing === m.id}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {removing === m.id ? "Removing..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmRemove(null)}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRemove(m.id, m.userId, m.displayName ?? "Member")}
                        className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {isCurrentUser ? "Leave" : "Remove"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
