import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ProduitsTable from "@/components/produits/ProduitsTable";

export default async function ProduitsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { archived: false }, include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = products.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    categoryId: p.categoryId,
    category: p.category.name,
    stock: p.stock,
    minStock: p.minStock,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
  }));

  return (
    <div>
      <PageHeader tag="CATALOGUE" title="Produits" subtitle={`${rows.length} références enregistrées`} />
      <ProduitsTable products={rows} categories={categories} />
    </div>
  );
}