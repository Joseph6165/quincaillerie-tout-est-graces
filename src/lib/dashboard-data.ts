import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock-alerts";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export async function getDashboardData() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [products, clientCount, salesTodayAgg, salesTodayList, recentSales, recentMovements, suppliers] =
    await Promise.all([
      prisma.product.findMany({ where: { archived: false }, select: { id: true, code: true, name: true, stock: true, minStock: true } }),
      prisma.client.count(),
      prisma.sale.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfToday } } }),
      prisma.sale.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.sale.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.stockMovement.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.supplier.findMany({ orderBy: { lastDelivery: "asc" } }),
    ]);

  const lowStockProducts = products
    .filter((p) => getStockStatus(p.stock, p.minStock) === "critique")
    .map((p) => ({ id: p.id, code: p.code, name: p.name, stock: p.stock, minStock: p.minStock }));

  const saleRows = recentSales.map((s) => ({
    date: s.createdAt,
    time: s.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    type: "VENTE" as const,
    label: `VENTE #${s.number}`,
    detail: s.client?.name ?? "Client comptoir",
    amount: formatXOF(s.total),
  }));

  const movementRows = recentMovements.map((m) => ({
    date: m.createdAt,
    time: m.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    type: m.type as "ENTREE" | "SORTIE",
    label: m.type === "ENTREE" ? "ENTREE STOCK" : "SORTIE STOCK",
    detail: `${m.product.name} — ${m.reason}`,
    amount: `${m.type === "ENTREE" ? "+" : "-"}${m.quantity} u`,
  }));

  const daysAgo = (d: Date | null) => (d ? Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)) : null);
  const suppliersNeedingAttention = suppliers
    .map((s) => ({ name: s.name, category: s.category ?? "—", daysSinceDelivery: daysAgo(s.lastDelivery) }))
    .filter((s) => s.daysSinceDelivery === null || s.daysSinceDelivery > 20)
    .slice(0, 4);

  // --- Fenêtres des 6 derniers mois ---
  const now = new Date();
  const monthWindows = Array.from({ length: 6 }, (_, i) => {
    const idx = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - idx, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - idx + 1, 1);
    return { start, end, label: start.toLocaleDateString("fr-FR", { month: "short" }) };
  });

  // --- Évolution mensuelle du chiffre d'affaires ---
  const monthlyRevenue = await Promise.all(
    monthWindows.map(async (w) => {
      const agg = await prisma.sale.aggregate({ _sum: { total: true }, where: { createdAt: { gte: w.start, lt: w.end } } });
      return { month: w.label, total: agg._sum.total ?? 0 };
    })
  );
  const totalThisMonth = monthlyRevenue[monthlyRevenue.length - 1]?.total ?? 0;
  const totalLastMonth = monthlyRevenue[monthlyRevenue.length - 2]?.total ?? 0;
  const monthTrend = totalLastMonth > 0 ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100) : null;

  // --- Produits vendus : chiffre d'affaires et quantités ---
   const allItems = await prisma.saleItem.findMany({
    select: { productId: true, quantity: true, unitPrice: true, product: { select: { name: true } }, sale: { select: { createdAt: true } } },
  });
  const allItemsWithDate = allItems;
  const productAgg: Record<string, { name: string; qty: number; revenue: number }> = {};
  allItems.forEach((it) => {
    if (!productAgg[it.productId]) productAgg[it.productId] = { name: it.product.name, qty: 0, revenue: 0 };
    productAgg[it.productId].qty += it.quantity;
    productAgg[it.productId].revenue += it.quantity * it.unitPrice;
  });

  const sortedByRevenue = Object.values(productAgg).sort((a, b) => b.revenue - a.revenue);
  const topProductsByRevenue = sortedByRevenue.slice(0, 5).map((p) => ({ name: p.name, revenue: p.revenue }));
  const othersRevenue = sortedByRevenue.slice(5).reduce((s, p) => s + p.revenue, 0);
  if (othersRevenue > 0) topProductsByRevenue.push({ name: "Autres", revenue: othersRevenue });

  const sortedByQty = Object.values(productAgg).sort((a, b) => b.qty - a.qty);
  const productsSoldPie = sortedByQty.slice(0, 5).map((p) => ({ name: p.name, value: p.qty }));
  const othersQty = sortedByQty.slice(5).reduce((s, p) => s + p.qty, 0);
  if (othersQty > 0) productsSoldPie.push({ name: "Autres", value: othersQty });

  // --- Stock reçu par mois et par fournisseur ---
  const receptions = await prisma.stockMovement.findMany({
    where: { type: "ENTREE", supplierName: { not: null } },
    select: { quantity: true, supplierName: true, createdAt: true },
  });
  const supplierTotals: Record<string, number> = {};
  receptions.forEach((r) => {
    const s = r.supplierName ?? "Inconnu";
    supplierTotals[s] = (supplierTotals[s] ?? 0) + r.quantity;
  });
  const topSuppliers = Object.entries(supplierTotals).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name);

  const stockBySupplierChart = monthWindows.map((w) => {
    const row: Record<string, string | number> = { month: w.label };
    const monthReceptions = receptions.filter((r) => r.createdAt >= w.start && r.createdAt < w.end);
    topSuppliers.forEach((s) => {
      row[s] = monthReceptions.filter((r) => (r.supplierName ?? "Inconnu") === s).reduce((sum, r) => sum + r.quantity, 0);
    });
    return row;
  });
  const totalSalesCount = await prisma.sale.count();
    // --- Ventes par produit, par semaine (4 dernières semaines) ---
  const weekWindows = Array.from({ length: 4 }, (_, i) => {
    const idx = 3 - i;
    const end = new Date(now.getTime() - idx * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end, label: `Sem. ${4 - idx}` };
  });

  // const allItemsWithDate = await prisma.saleItem.findMany({
  //   select: { productId: true, quantity: true, product: { select: { name: true } }, sale: { select: { createdAt: true } } },
  // });

  const topProductNames = Object.entries(
    allItemsWithDate.reduce((acc, it) => {
      acc[it.product.name] = (acc[it.product.name] ?? 0) + it.quantity;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const weeklySalesByProduct = weekWindows.map((w) => {
    const row: Record<string, string | number> = { week: w.label };
    topProductNames.forEach((name) => {
      row[name] = allItemsWithDate
        .filter((it) => it.product.name === name && it.sale.createdAt >= w.start && it.sale.createdAt < w.end)
        .reduce((sum, it) => sum + it.quantity, 0);
    });
    return row;
  });
    // --- Répartition du chiffre d'affaires par catégorie ---
  const itemsWithCategory = await prisma.saleItem.findMany({
    select: { quantity: true, unitPrice: true, product: { select: { category: { select: { name: true } } } } },
  });
  const categoryRevenue: Record<string, number> = {};
  itemsWithCategory.forEach((it) => {
    const cat = it.product.category.name;
    categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + it.quantity * it.unitPrice;
  });
  const totalCategoryRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0);
  const categoryShares = Object.entries(categoryRevenue)
    .map(([name, revenue]) => ({ name, value: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  return {
    productCount: products.length,
    clientCount,
    salesToday: salesTodayAgg._sum.total ?? 0,
    salesTodayCount: salesTodayList,
    lowStockProducts,
    lowStockCount: lowStockProducts.length,
    recentSales: saleRows.map(({ date, ...rest }) => rest),
    recentMovements: movementRows.map(({ date, ...rest }) => rest),
    suppliersNeedingAttention,
    monthlyRevenue,
    totalThisMonth,
    totalLastMonth,
    monthTrend,
    topProductsByRevenue,
    productsSoldPie,
    stockBySupplierChart,
    topSuppliers,
        totalSalesCount,
            weeklySalesByProduct,
    topProductNames,
        categoryShares,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;