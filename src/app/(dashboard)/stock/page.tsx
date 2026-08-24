import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import StockPageClient from "@/components/stock/StockPageClient";
import StockAnalyticsClient from "@/components/stock/StockAnalyticsClient";

export default async function StockPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canManageStockMovements) {
    return <AccessRestricted />;
  }

  if (session.user.role === "MAGASINIER") {
    const [movements, products, suppliers] = await Promise.all([
      prisma.stockMovement.findMany({ where: { type: "ENTREE" }, include: { product: true, user: true }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.product.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
      prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    ]);

    const rows = movements.map((m) => ({
      id: m.id,
      date: m.createdAt.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      code: m.product.code,
      produit: m.product.name,
      qte: m.quantity,
      previousStock: m.previousStock,
      newStock: m.newStock,
      fournisseur: m.supplierName ?? "—",
      auteur: m.user.name,
    }));

    return (
      <div>
        <PageHeader tag="RÉCEPTIONS" title="Gestion des stocks" subtitle="Historique des réceptions fournisseur" />
        <StockPageClient
          movements={rows}
          products={products.map((p) => ({ id: p.id, code: p.code, name: p.name, stock: p.stock }))}
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name, phone: s.phone }))}
        />
      </div>
    );
  }

  // Vue Admin — graphiques
  const now = new Date();
  const monthWindows = Array.from({ length: 6 }, (_, i) => {
    const idx = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - idx, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - idx + 1, 1);
    return { start, end, label: start.toLocaleDateString("fr-FR", { month: "short" }) };
  });

  const receptions = await prisma.stockMovement.findMany({
    where: { type: "ENTREE", supplierName: { not: null } },
    select: { quantity: true, supplierName: true, createdAt: true },
  });

  const supplierTotals: Record<string, number> = {};
  receptions.forEach((r) => {
    const s = r.supplierName ?? "Inconnu";
    supplierTotals[s] = (supplierTotals[s] ?? 0) + r.quantity;
  });
  const topSuppliers = Object.entries(supplierTotals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);

  const supplierData = monthWindows.map((w) => {
    const row: Record<string, string | number> = { month: w.label };
    const monthReceptions = receptions.filter((r) => r.createdAt >= w.start && r.createdAt < w.end);
    topSuppliers.forEach((s) => {
      row[s] = monthReceptions.filter((r) => (r.supplierName ?? "Inconnu") === s).reduce((sum, r) => sum + r.quantity, 0);
    });
    return row;
  });

  const weekWindows = Array.from({ length: 6 }, (_, i) => {
    const idx = 5 - i;
    const end = new Date(now.getTime() - idx * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end, label: `S. ${6 - idx}` };
  });

  const saleItems = await prisma.saleItem.findMany({
    select: { quantity: true, sale: { select: { createdAt: true } } },
  });

  const flowData = weekWindows.map((w) => ({
    week: w.label,
    entrees: receptions.filter((r) => r.createdAt >= w.start && r.createdAt < w.end).reduce((sum, r) => sum + r.quantity, 0),
    sorties: saleItems.filter((it) => it.sale.createdAt >= w.start && it.sale.createdAt < w.end).reduce((sum, it) => sum + it.quantity, 0),
  }));

  return (
    <div>
      <PageHeader tag="ANALYSE" title="Gestion des stocks" subtitle="Évolution des livraisons et des ventes" />
      <StockAnalyticsClient supplierData={supplierData} suppliers={topSuppliers} flowData={flowData} />
    </div>
  );
}