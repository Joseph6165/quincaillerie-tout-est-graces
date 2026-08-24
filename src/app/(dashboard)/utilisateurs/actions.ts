"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";
import type { Role } from "@/lib/roles";

export async function createUser(formData: FormData) {
  const admin = await requirePermission("canManageUsers");

  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const role = formData.get("role") as Role;
  const password = formData.get("password") as string;

  if (password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { name, email, role, password: passwordHash } });
  await notify(admin.id, "Utilisateur", "CREATE", `${admin.name} a créé le compte "${name}" (${role}).`);
  revalidatePath("/utilisateurs");
}

export async function updateUser(id: string, formData: FormData) {
  const admin = await requirePermission("canManageUsers");

  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const role = formData.get("role") as Role;
  const active = formData.get("active") === "on";
  const password = (formData.get("password") as string)?.trim();

  const data: { name: string; email: string; role: Role; active: boolean; password?: string } = { name, email, role, active };

  if (password) {
    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    }
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });
  await notify(admin.id, "Utilisateur", "UPDATE", `${admin.name} a modifié le compte "${name}".`);
  revalidatePath("/utilisateurs");
}

export async function deleteUser(id: string) {
  const admin = await requirePermission("canManageUsers");

  if (id === admin.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Impossible de supprimer le dernier administrateur.");
    }
  }

  await prisma.user.delete({ where: { id } });
  await notify(admin.id, "Utilisateur", "DELETE", `${admin.name} a supprimé le compte "${target?.name ?? id}".`);
  revalidatePath("/utilisateurs");
}