"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";

function readProductData(formData: FormData) {
  return {
    code: (formData.get("code") as string).trim(),
    name: (formData.get("name") as string).trim(),
    categoryId: formData.get("categoryId") as string,
    stock: Number(formData.get("stock")),
    minStock: Number(formData.get("minStock")),
    purchasePrice: Number(formData.get("purchasePrice")),
    sellingPrice: Number(formData.get("sellingPrice")),
  };
}

export async function createProduct(formData: FormData) {
  const user = await requirePermission("canManageProducts");
  const data = readProductData(formData);
  const product = await prisma.product.create({ data });
  await notify(user.id, "Produit", "CREATE", `${user.name} a ajouté le produit "${data.name}".`);
  revalidatePath("/produits");
  revalidatePath("/ventes");
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await requirePermission("canManageProducts");
  const data = readProductData(formData);
  await prisma.product.update({ where: { id }, data });
  await notify(user.id, "Produit", "UPDATE", `${user.name} a modifié le produit "${data.name}".`);
  revalidatePath("/produits");
}

export async function deleteProduct(id: string) {
  const user = await requirePermission("canManageProducts");
  const product = await prisma.product.update({ where: { id }, data: { archived: true } });
  await notify(user.id, "Produit", "DELETE", `${user.name} a supprimé le produit "${product.name}".`);
  revalidatePath("/produits");
}