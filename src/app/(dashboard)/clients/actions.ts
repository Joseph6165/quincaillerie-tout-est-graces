"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";

function readClientData(formData: FormData) {
  const phone = (formData.get("phone") as string)?.trim();
  return {
    name: (formData.get("name") as string).trim(),
    phone: phone ? phone : null,
  };
}

export async function createClient(formData: FormData) {
  const user = await requirePermission("canManageClients");
  const data = readClientData(formData);
  await prisma.client.create({ data });
  await notify(user.id, "Client", "CREATE", `${user.name} a ajouté le client "${data.name}".`);
  revalidatePath("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const user = await requirePermission("canManageClients");
  const data = readClientData(formData);
  await prisma.client.update({ where: { id }, data });
  await notify(user.id, "Client", "UPDATE", `${user.name} a modifié le client "${data.name}".`);
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const user = await requirePermission("canManageClients");
  const client = await prisma.client.findUnique({ where: { id } });
  await prisma.client.delete({ where: { id } });
  await notify(user.id, "Client", "DELETE", `${user.name} a supprimé le client "${client?.name ?? id}".`);
  revalidatePath("/clients");
}