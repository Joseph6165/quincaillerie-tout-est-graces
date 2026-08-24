"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";

interface ReceptionItemInput {
  productId: string;
  quantity: number;
}

export async function createStockReception(input: {
  supplierId: string | null;
  newSupplier: { name: string; phone?: string } | null;
  items: ReceptionItemInput[];
}) {
  const user = await requirePermission("canManageStockMovements");

  if (input.items.length === 0) {
    throw new Error("Ajoutez au moins un produit reçu.");
  }
  if (!input.supplierId && !input.newSupplier?.name.trim()) {
    throw new Error("Indiquez le fournisseur.");
  }

  const supplier = input.supplierId
    ? await prisma.supplier.findUnique({ where: { id: input.supplierId } })
    : null;

  const supplierName = supplier?.name ?? input.newSupplier?.name.trim() ?? "Fournisseur";
  const supplierPhone = supplier?.phone ?? input.newSupplier?.phone?.trim() ?? null;

  await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("Produit introuvable.");

      const previousStock = product.stock;
      const newStock = previousStock + item.quantity;

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "ENTREE",
          quantity: item.quantity,
          reason: `Réception fournisseur : ${supplierName}`,
          previousStock,
          newStock,
          supplierName,
          supplierPhone,
          userId: user.id,
        },
      });

      await tx.product.update({ where: { id: item.productId }, data: { stock: newStock } });
    }
  });

  await notify(
    user.id,
    "Stock",
    "CREATE",
    `${user.name} a enregistré une réception de ${input.items.length} produit(s) de la part de "${supplierName}".`
  );

  revalidatePath("/stock");
  revalidatePath("/produits");
  revalidatePath("/dashboard");
}