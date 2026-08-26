export const revalidate = 5;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock-alerts";
import { UserProvider } from "@/context/UserContext";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  let lowStock = 0;
  let unread = 0;

  if (session?.user) {
    const products = await prisma.product.findMany({ select: { stock: true, minStock: true } });
    lowStock = products.filter((p) => getStockStatus(p.stock, p.minStock) === "critique").length;

    if (session.user.role === "ADMIN") {
      unread = await prisma.notification.count({ where: { read: false } });
    }
  }

  return (
    <UserProvider>
      <DashboardShell badges={{ lowStock, notifications: unread }} unreadCount={unread}>
        {children}
      </DashboardShell>
    </UserProvider>
  );
}