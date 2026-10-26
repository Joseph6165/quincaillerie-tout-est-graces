import { prisma } from "@/lib/prisma";

export const RUPTURE_ENTITY = "Rupture de stock";
export const RUPTURE_INTERVAL_MS = 5 * 60 * 60 * 1000;

// Crée une notification de rupture pour chaque administrateur, au plus une fois toutes les 5 heures.
export async function notifyStockRuptures(): Promise<{ created: boolean; count: number }> {
  const out = await prisma.product.findMany({
    where: { archived: false, stock: { lte: 0 } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  if (out.length === 0) return { created: false, count: 0 };

  const last = await prisma.notification.findFirst({
    where: { entity: RUPTURE_ENTITY },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < RUPTURE_INTERVAL_MS) {
    return { created: false, count: out.length };
  }

  const admins = await prisma.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } });
  if (admins.length === 0) return { created: false, count: out.length };

  const names = out.slice(0, 5).map((p) => p.name).join(", ");
  const more = out.length > 5 ? ` et ${out.length - 5} autre(s)` : "";
  const message =
    out.length === 1
      ? `Rupture de stock : ${names}. Pensez à réapprovisionner.`
      : `Rupture de stock sur ${out.length} produits : ${names}${more}. Pensez à réapprovisionner.`;

  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, entity: RUPTURE_ENTITY, type: "ALERT", message })),
  });
  return { created: true, count: out.length };
}
