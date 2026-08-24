"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Receipt, ArrowRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { useCurrentUser } from "@/context/UserContext";
import type { DashboardData } from "@/lib/dashboard-data";

export default function VendeurDashboard({ data }: { data: DashboardData }) {
  const { user } = useCurrentUser();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-xs font-mono text-ink-faint mb-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </p>
          <h1 className="text-2xl font-semibold text-ink">Bonjour, {user.name.split(" ")[0]}</h1>
        </div>
        <Link
          href="/ventes"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          Nouvelle vente
          <ArrowRight size={15} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard tag="VENTES.JOUR" label="Chiffre d'affaires réalisé" value={data.salesToday.toLocaleString("fr-FR") + " XOF"} icon={ShoppingCart} delay={0.05} />
        <StatCard tag="TRANSACTIONS" label="Ventes enregistrées aujourd'hui" value={String(data.salesTodayCount)} icon={Receipt} delay={0.1} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-black/[0.06] rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-black/[0.06]">
          <h2 className="text-sm font-semibold text-ink">Dernières ventes du magasin</h2>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {data.recentSales.length === 0 && (
            <p className="text-center text-sm text-ink-faint py-8">Aucune vente enregistrée pour le moment.</p>
          )}
          {data.recentSales.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{s.time}</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-brand-600 w-24 shrink-0">
                <Receipt size={12} />
                {s.label}
              </span>
              <span className="text-ink-soft flex-1 truncate">{s.detail}</span>
              <span className="font-mono text-xs text-ink font-medium shrink-0">{s.amount}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}