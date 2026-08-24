import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: "singleton" } });
}