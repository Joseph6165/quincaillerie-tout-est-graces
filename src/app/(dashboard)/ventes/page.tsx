import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import VentesPageClient from "@/components/ventes/VentesPageClient";

export default async function VentesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canRecordSales) {
    return <AccessRestricted />;
  }

  const canViewAll = PERMISSIONS[session.user.role].canViewAllSales;

  const [sales, clients, products, categories] = await Promise.all([
    prisma.sale.findMany({
      where: canViewAll ? {} : { userId: session.user.id },
      include: { client: true, user: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = sales.map((s) => ({
    id: s.id,
    num: s.number,
    date: s.createdAt.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    client: s.client?.name ?? "Client comptoir",
    vendeur: s.user.name,
    articles: s.items.length,
    total: s.total,
  }));

  return (
    <div>
      <PageHeader tag="CAISSE" title="Ventes" subtitle={`${rows.length} vente${rows.length > 1 ? "s" : ""} enregistrée${rows.length > 1 ? "s" : ""}`} />
      <VentesPageClient
        sales={rows}
        clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone, email: c.email }))}
        products={products.map((p) => ({ id: p.id, code: p.code, name: p.name, stock: p.stock, sellingPrice: p.sellingPrice }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        currentUserName={session.user.name ?? "Vendeur"}
      />
    </div>
  );
}