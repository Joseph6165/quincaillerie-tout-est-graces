import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.client.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création des utilisateurs...");
  const passwordHash = await bcrypt.hash("motdepasse123", 10);

  const admin = await prisma.user.create({
    data: { name: "Eudes Houndakinnou", email: "admin@toutestgrace.bj", password: passwordHash, role: "ADMIN" },
  });
  const vendeur = await prisma.user.create({
    data: { name: "Alice Vendeuse", email: "vendeur@toutestgrace.bj", password: passwordHash, role: "VENDEUR" },
  });
  const magasinier = await prisma.user.create({
    data: { name: "Marc Magasinier", email: "magasinier@toutestgrace.bj", password: passwordHash, role: "MAGASINIER" },
  });

  console.log("Création des catégories...");
  const categories = await Promise.all(
    ["Outillage", "Électricité", "Plomberie", "Peinture", "Construction"].map((name) =>
      prisma.category.create({ data: { name } })
    )
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

 console.log("Création des produits...");
const products = await Promise.all([
  prisma.product.create({ data: { code: "OUT-0231", name: "Marteau charpentier 500g", categoryId: catByName["Outillage"], stock: 42, minStock: 10, purchasePrice: 2200, sellingPrice: 3500 } }),
  prisma.product.create({ data: { code: "ELE-0118", name: "Fil électrique 2.5mm (100m)", categoryId: catByName["Électricité"], stock: 8, minStock: 10, purchasePrice: 18500, sellingPrice: 24000 } }),
  prisma.product.create({ data: { code: "PLB-0304", name: "Tuyau PVC 100mm (3m)", categoryId: catByName["Plomberie"], stock: 15, minStock: 8, purchasePrice: 4200, sellingPrice: 6000 } }),
  prisma.product.create({ data: { code: "PEI-0022", name: "Peinture blanche mate 5L", categoryId: catByName["Peinture"], stock: 3, minStock: 6, purchasePrice: 11000, sellingPrice: 15500 } }),
  prisma.product.create({ data: { code: "CIM-0001", name: "Ciment CIM II 50kg", categoryId: catByName["Construction"], stock: 120, minStock: 30, purchasePrice: 4500, sellingPrice: 5500 } }),
]);

  console.log("Création des clients...");
  const clients = await Promise.all([
    prisma.client.create({ data: { name: "M. Adjovi", phone: "+229 90 11 22 33" } }),
    prisma.client.create({ data: { name: "Mme Houngbo", phone: "+229 91 22 33 44" } }),
    prisma.client.create({ data: { name: "Chantier Zogbo", phone: "+229 97 33 44 55" } }),
    prisma.client.create({ data: { name: "M. Dossou", phone: "+229 96 44 55 66" } }),
  ]);

  console.log("Création des fournisseurs...");
  await Promise.all([
    prisma.supplier.create({ data: { name: "SODEQUI SARL", contactName: "Kokou Mensah", phone: "+229 97 12 34 56", category: "Matériaux construction", lastDelivery: new Date("2026-08-12") } }),
    prisma.supplier.create({ data: { name: "Bénin Élec Distribution", contactName: "Awa Sanni", phone: "+229 96 45 67 89", category: "Électricité", lastDelivery: new Date("2026-08-10") } }),
    prisma.supplier.create({ data: { name: "Plomberie Import Cotonou", contactName: "Rachidi Alao", phone: "+229 95 78 90 12", category: "Plomberie", lastDelivery: new Date("2026-08-08") } }),
  ]);

  console.log("Création des mouvements de stock...");
  await prisma.stockMovement.create({
    data: { productId: products[1].id, type: "ENTREE", quantity: 120, reason: "Réception fournisseur", userId: magasinier.id },
  });
  await prisma.stockMovement.create({
    data: { productId: products[2].id, type: "SORTIE", quantity: 4, reason: "Casse", userId: magasinier.id },
  });

  console.log("Création d'une vente...");
  const sale = await prisma.sale.create({
    data: {
      number: "0231",
      clientId: clients[0].id,
      userId: vendeur.id,
      total: 3 * products[0].sellingPrice,
    },
  });
  await prisma.saleItem.create({
    data: { saleId: sale.id, productId: products[0].id, quantity: 3, unitPrice: products[0].sellingPrice },
  });

  console.log("Terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });