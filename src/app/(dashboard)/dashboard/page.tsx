import { getDashboardData } from "@/lib/dashboard-data";
import DashboardRouter from "@/components/dashboards/DashboardRouter";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardRouter data={data} />;
}