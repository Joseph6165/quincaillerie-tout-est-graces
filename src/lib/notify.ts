import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type NotificationType = "CREATE" | "UPDATE" | "DELETE";

export async function notify(userId: string, entity: string, type: NotificationType, message: string) {
  await prisma.notification.create({ data: { userId, entity, type, message } });
  revalidatePath("/", "layout");
}