"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";

function readSupplierData(formData: FormData) {
  const lastDelivery = formData.get("lastDelivery") as string;
  return {
    name: (formData.get("name") as string).trim(),
    contactName: (formData.get("contactName") as string)?.trim() || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || null,
    lastDelivery: lastDelivery ? new Date(lastDelivery) : null,
  };
}

export async function createSupplier(formData: FormData) {
  const user = await requirePermission("canManageSuppliers");
  const data = readSupplierData(formData);
  await prisma.supplier.create({ data });
  await notify(user.id, "Fournisseur", "CREATE", `${user.name} a ajouté le fournisseur "${data.name}".`);
  revalidatePath("/fournisseurs");
}

export async function updateSupplier(id: string, formData: FormData) {
  const user = await requirePermission("canManageSuppliers");
  const data = readSupplierData(formData);
  await prisma.supplier.update({ where: { id }, data });
  await notify(user.id, "Fournisseur", "UPDATE", `${user.name} a modifié le fournisseur "${data.name}".`);
  revalidatePath("/fournisseurs");
}

export async function deleteSupplier(id: string) {
  const user = await requirePermission("canManageSuppliers");
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  await prisma.supplier.delete({ where: { id } });
  await notify(user.id, "Fournisseur", "DELETE", `${user.name} a supprimé le fournisseur "${supplier?.name ?? id}".`);
  revalidatePath("/fournisseurs");
}