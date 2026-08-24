import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import ClientsTable from "@/components/clients/ClientsTable";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canManageClients) {
    return <AccessRestricted />;
  }

  const clients = await prisma.client.findMany({
    include: { sales: true },
    orderBy: { name: "asc" },
  });

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    achats: c.sales.length,
    total: c.sales.reduce((sum, s) => sum + s.total, 0),
  }));

  return (
    <div>
      <PageHeader tag="RELATION CLIENT" title="Clients" subtitle={`${rows.length} clients enregistrés`} />
      <ClientsTable clients={rows} />
    </div>
  );
}