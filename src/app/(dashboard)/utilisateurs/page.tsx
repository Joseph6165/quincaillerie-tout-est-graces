import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import UtilisateursTable from "@/components/utilisateurs/UtilisateursTable";

export default async function UtilisateursPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canManageUsers) {
    return <AccessRestricted />;
  }

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader tag="EQUIPE" title="Utilisateurs" subtitle={`${users.length} comptes créés`} />
      <UtilisateursTable users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }))} />
    </div>
  );
}