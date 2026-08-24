"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-role";
import { notify } from "@/lib/notify";
import { generateReceiptPDFBuffer } from "@/lib/receipt-pdf-server";
import { sendReceiptEmail } from "@/lib/mailer";
import { sendReceiptWhatsApp } from "@/lib/whatsapp-send";

interface SaleItemInput {
  productId: string;
  quantity: number;
}

interface NewClientInput {
  name: string;
  phone?: string;
  email?: string;
}

export async function createSale(input: {
  clientId: string | null;
  newClient: NewClientInput | null;
  items: SaleItemInput[];
}) {
  const user = await requirePermission("canRecordSales");

  if (input.items.length === 0) {
    throw new Error("Ajoutez au moins un article à la vente.");
  }
  if (!input.clientId && !input.newClient?.name.trim()) {
    throw new Error("Sélectionnez un client existant ou indiquez le nom du client.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
  });

  let total = 0;
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("Produit introuvable.");
    if (item.quantity > product.stock) {
      throw new Error(`Stock insuffisant pour ${product.name} (disponible : ${product.stock}).`);
    }
    total += product.sellingPrice * item.quantity;
  }

  const salesCount = await prisma.sale.count();
  const number = String(salesCount + 1).padStart(4, "0");

  const result = await prisma.$transaction(async (tx) => {
    let clientId = input.clientId;

    if (!clientId && input.newClient) {
      const created = await tx.client.create({
        data: {
          name: input.newClient.name.trim(),
          phone: input.newClient.phone?.trim() || null,
          email: input.newClient.email?.trim() || null,
        },
      });
      clientId = created.id;
    } else if (clientId && (input.newClient?.phone || input.newClient?.email)) {
      // Cas : client existant sélectionné, mais numéro/e-mail complété au comptoir
      await tx.client.update({
        where: { id: clientId },
        data: {
          phone: input.newClient?.phone?.trim() || undefined,
          email: input.newClient?.email?.trim() || undefined,
        },
      });
    }

    const sale = await tx.sale.create({ data: { number, clientId, userId: user.id, total } });

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      await tx.saleItem.create({ data: { saleId: sale.id, productId: item.productId, quantity: item.quantity, unitPrice: product.sellingPrice } });
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }

    return { saleId: sale.id, clientId };
  });

  const clientRecord = result.clientId ? await prisma.client.findUnique({ where: { id: result.clientId } }) : null;

  await notify(
    user.id,
    "Vente",
    "CREATE",
    `${user.name} a enregistré la vente #${number} pour ${clientRecord?.name ?? "un client"} (${total.toLocaleString("fr-FR")} XOF).`
  );

  revalidatePath("/ventes");
  revalidatePath("/clients");
  revalidatePath("/produits");
  revalidatePath("/dashboard");

  // Envoi automatique de la facture
  const receiptData = {
    number,
    date: new Date().toLocaleDateString("fr-FR"),
    client: clientRecord?.name ?? "Client comptoir",
       vendeur: user.name ?? "Vendeur",
    items: input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { name: product.name, quantity: item.quantity, unitPrice: product.sellingPrice };
    }),
    total,
  };

  const delivery = { emailSent: false, emailError: undefined as string | undefined, whatsappSent: false, whatsappError: undefined as string | undefined };
  const pdfBuffer = generateReceiptPDFBuffer(receiptData);

  if (clientRecord?.email) {
    try {
      await sendReceiptEmail({
        to: clientRecord.email,
        subject: `Votre facture N. ${number} - Tout Est Grâce`,
        text: `Bonjour ${clientRecord.name},\n\nVeuillez trouver ci-joint votre facture N. ${number} d'un montant de ${total.toLocaleString("fr-FR")} FCFA.\n\nMerci de votre confiance.`,
        pdfBuffer,
        filename: `facture-${number}.pdf`,
      });
      delivery.emailSent = true;
    } catch (e) {
      delivery.emailError = e instanceof Error ? e.message : "Échec de l'envoi e-mail.";
    }
  }

  if (clientRecord?.phone) {
    try {
      await sendReceiptWhatsApp({ to: clientRecord.phone, pdfBuffer, filename: `facture-${number}.pdf` });
      delivery.whatsappSent = true;
    } catch (e) {
      delivery.whatsappError = e instanceof Error ? e.message : "Échec de l'envoi WhatsApp.";
    }
  }

  return { id: result.saleId, number, clientName: clientRecord?.name ?? "Client comptoir", clientPhone: clientRecord?.phone ?? null, delivery };
}

export async function getSaleReceipt(saleId: string) {
  await requirePermission("canRecordSales");

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { client: true, user: true, items: { include: { product: true } } },
  });
  if (!sale) throw new Error("Vente introuvable.");

  return {
    number: sale.number,
    date: sale.createdAt.toLocaleDateString("fr-FR"),
    client: sale.client?.name ?? "Client comptoir",
    vendeur: sale.user.name,
    items: sale.items.map((i) => ({ name: i.product.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    total: sale.total,
  };
}