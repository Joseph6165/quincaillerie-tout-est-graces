import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import FournisseursGrid from "@/components/fournisseurs/FournisseursGrid";

export default async function FournisseursPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canManageSuppliers) {
    return <AccessRestricted />;
  }

  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  const rows = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    contactName: s.contactName,
    phone: s.phone,
    category: s.category,
    lastDeliveryLabel: s.lastDelivery ? s.lastDelivery.toLocaleDateString("fr-FR") : "Jamais",
    lastDeliveryISO: s.lastDelivery ? s.lastDelivery.toISOString().split("T")[0] : null,
  }));

  return (
    <div>
      <PageHeader tag="PARTENAIRES" title="Fournisseurs" subtitle={`${rows.length} fournisseurs actifs`} />
      <FournisseursGrid suppliers={rows} />
    </div>
  );
}