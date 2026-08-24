import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AccessRestricted from "@/components/ui/AccessRestricted";
import NotificationsList from "@/components/parametres/NotificationsList";
import IntegrationsSettings from "@/components/parametres/IntegrationsSettings";
import MarkNotificationsRead from "@/components/parametres/MarkNotificationsRead";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !PERMISSIONS[session.user.role].canManageSettings) {
    return <AccessRestricted />;
  }

  const [notifications, settings] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const rows = notifications.map((n) => ({
    id: n.id,
    entity: n.entity,
    type: n.type as "CREATE" | "UPDATE" | "DELETE",
    message: n.message,
    time: n.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
  }));

  return (
    <div className="space-y-6">
      <MarkNotificationsRead />
      <PageHeader tag="CONFIGURATION" title="Paramètres" subtitle="Réservé à l'administrateur" />
      <IntegrationsSettings
        initial={{
          whatsappPhoneNumberId: settings?.whatsappPhoneNumberId ?? "",
          whatsappAccessToken: settings?.whatsappAccessToken ?? "",
          whatsappTemplateName: settings?.whatsappTemplateName ?? "",
          smtpHost: settings?.smtpHost ?? "",
          smtpPort: settings?.smtpPort ? String(settings.smtpPort) : "",
          smtpUser: settings?.smtpUser ?? "",
          smtpPassword: settings?.smtpPassword ?? "",
          smtpFromEmail: settings?.smtpFromEmail ?? "",
        }}
      />
      <NotificationsList notifications={rows} />
    </div>
  );
}