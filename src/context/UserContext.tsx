"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Role, ROLE_LABELS, PERMISSIONS, Permissions } from "@/lib/roles";

interface CurrentUser {
  name: string;
  initials: string;
  role: Role;
  roleLabel: string;
  permissions: Permissions;
}

interface UserContextValue {
  user: CurrentUser;
}

const UserContext = createContext<UserContextValue | null>(null);

function buildUser(name: string, role: Role): CurrentUser {
  const parts = name.trim().split(" ");
  const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "US";
  return {
    name,
    initials,
    role,
    roleLabel: ROLE_LABELS[role],
    permissions: PERMISSIONS[role],
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-ink-faint font-mono">
        CHARGEMENT...
      </div>
    );
  }

  if (!session?.user) {
    return null; // le middleware redirige déjà vers /login
  }

  const user = buildUser(session.user.name ?? "Utilisateur", session.user.role);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useCurrentUser doit être appelé à l'intérieur de UserProvider");
  }
  return ctx;
}