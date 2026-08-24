import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import ActivityLogTable from "@/components/rapports/ActivityLogTable";

export default async function RapportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canViewReports) {
    return <AccessRestricted />;
  }

  const notifications = await prisma.notification.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows = notifications.map((n) => ({
    date: n.createdAt.toLocaleDateString("fr-FR"),
    heure: n.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    utilisateur: n.user.name,
    action: n.message,
  }));

  return (
    <div>
      <PageHeader tag="JOURNAL" title="Rapports" subtitle={`${rows.length} activité(s) enregistrée(s)`} />
      <ActivityLogTable rows={rows} />
    </div>
  );
}