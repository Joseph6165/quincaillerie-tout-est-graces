"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";

export async function updateIntegrationSettings(formData: FormData) {
  await requirePermission("canManageSettings");

  const smtpPortRaw = formData.get("smtpPort") as string;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      whatsappPhoneNumberId: (formData.get("whatsappPhoneNumberId") as string)?.trim() || null,
      whatsappAccessToken: (formData.get("whatsappAccessToken") as string)?.trim() || null,
      whatsappTemplateName: (formData.get("whatsappTemplateName") as string)?.trim() || null,
      smtpHost: (formData.get("smtpHost") as string)?.trim() || null,
      smtpPort: smtpPortRaw ? Number(smtpPortRaw) : null,
      smtpUser: (formData.get("smtpUser") as string)?.trim() || null,
      smtpPassword: (formData.get("smtpPassword") as string)?.trim() || null,
      smtpFromEmail: (formData.get("smtpFromEmail") as string)?.trim() || null,
    },
    create: {
      id: "singleton",
      whatsappPhoneNumberId: (formData.get("whatsappPhoneNumberId") as string)?.trim() || null,
      whatsappAccessToken: (formData.get("whatsappAccessToken") as string)?.trim() || null,
      whatsappTemplateName: (formData.get("whatsappTemplateName") as string)?.trim() || null,
      smtpHost: (formData.get("smtpHost") as string)?.trim() || null,
      smtpPort: smtpPortRaw ? Number(smtpPortRaw) : null,
      smtpUser: (formData.get("smtpUser") as string)?.trim() || null,
      smtpPassword: (formData.get("smtpPassword") as string)?.trim() || null,
      smtpFromEmail: (formData.get("smtpFromEmail") as string)?.trim() || null,
    },
  });

  revalidatePath("/parametres");
}
export async function markNotificationsRead() {
  await requirePermission("canManageSettings");
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}