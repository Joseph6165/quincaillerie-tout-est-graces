"use server";

import { prisma } from "@/lib/prisma";

export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  type: "PRODUIT" | "CLIENT";
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [products, clients] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ name: { contains: q } }, { code: { contains: q } }] },
      take: 5,
    }),
    prisma.client.findMany({
      where: { name: { contains: q } },
      take: 5,
    }),
  ]);

  return [
    ...products.map((p) => ({ id: p.id, label: p.name, sublabel: p.code, href: "/produits", type: "PRODUIT" as const })),
    ...clients.map((c) => ({ id: c.id, label: c.name, sublabel: c.phone ?? "Client", href: "/clients", type: "CLIENT" as const })),
  ];
}