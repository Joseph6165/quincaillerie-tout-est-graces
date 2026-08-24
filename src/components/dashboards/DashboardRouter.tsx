"use client";

import { useCurrentUser } from "@/context/UserContext";
import type { DashboardData } from "@/lib/dashboard-data";
import AdminDashboard from "./AdminDashboard";
import VendeurDashboard from "./VendeurDashboard";
import MagasinierDashboard from "./MagasinierDashboard";

export default function DashboardRouter({ data }: { data: DashboardData }) {
  const { user } = useCurrentUser();

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard data={data} />;
    case "VENDEUR":
      return <VendeurDashboard data={data} />;
    case "MAGASINIER":
      return <MagasinierDashboard data={data} />;
    default:
      return <AdminDashboard data={data} />;
  }
}