import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS, Permissions } from "@/lib/roles";

export async function requirePermission(permission: keyof Permissions) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non authentifié.");
  }
  const permissions = PERMISSIONS[session.user.role];
  if (!permissions[permission]) {
    throw new Error("Action non autorisée pour votre rôle.");
  }
  return session.user;
}