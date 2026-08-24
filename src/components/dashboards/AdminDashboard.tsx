"use client";

import { motion } from "framer-motion";
import { Warehouse, Package, FileBarChart, Users2, ShoppingBag } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import type { DashboardData } from "@/lib/dashboard-data";
import HighlightStats from "./HighlightStats";
import RevenueChart from "./RevenueChart";
import WeeklySalesByProductChart from "./WeeklySalesByProductChart";
import TopProductsChart from "./TopProductsChart";
import ProductsPieChart from "./ProductsPieChart";
import CategoryRadialChart from "./CategoryRadialChart";
import StockBySupplierChart from "./StockBySupplierChart";
import QuickAccessCard from "./QuickAccessCard";

export default function AdminDashboard({ data }: { data: DashboardData }) {
  const { user } = useCurrentUser();

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }} className="space-y-6">
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
        <p className="text-xs font-mono text-ink-faint mb-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </p>
        <h1 className="text-2xl font-semibold text-ink">Bonjour, {user.name.split(" ")[0]}</h1>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
        <HighlightStats
          items={[
            { icon: Package, value: String(data.productCount), label: "Produits actifs" },
            { icon: Warehouse, value: String(data.lowStockCount), label: "Alertes de rupture" },
            { icon: ShoppingBag, value: String(data.totalSalesCount), label: "Ventes enregistrées" },
            { icon: Users2, value: String(data.clientCount), label: "Clients enregistrés" },
          ]}
        />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
        <QuickAccessCard href="/rapports" icon={FileBarChart} title="Rapports" subtitle="Voir l'analyse complète des performances" />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }}>
        <RevenueChart data={data.monthlyRevenue} totalThisMonth={data.totalThisMonth} monthTrend={data.monthTrend} />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }}>
        <WeeklySalesByProductChart data={data.weeklySalesByProduct} productNames={data.topProductNames} />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }}>
        <CategoryRadialChart data={data.categoryShares} />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart data={data.topProductsByRevenue} />
        <ProductsPieChart data={data.productsSoldPie} />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }}>
        <StockBySupplierChart data={data.stockBySupplierChart} suppliers={data.topSuppliers} />
      </motion.div>
    </motion.div>
  );
}