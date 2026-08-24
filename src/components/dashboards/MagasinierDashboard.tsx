"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Warehouse, AlertTriangle, Truck, ArrowRight, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { useCurrentUser } from "@/context/UserContext";
import type { DashboardData } from "@/lib/dashboard-data";

export default function MagasinierDashboard({ data }: { data: DashboardData }) {
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
          href="/stock"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          Nouveau mouvement
          <ArrowRight size={15} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard tag="STOCK" label="Alertes de rupture" value={String(data.lowStockCount)} icon={Warehouse} delay={0.05} trend={data.lowStockCount > 0 ? { value: "À traiter", positive: false } : undefined} />
        <StatCard tag="FOURNISSEURS" label="Livraisons à relancer" value={String(data.suppliersNeedingAttention.length)} icon={Truck} delay={0.1} />
      </div>

      {data.lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white border border-black/[0.06] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-black/[0.06] flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500" />
            <h2 className="text-sm font-semibold text-ink">Produits en rupture imminente</h2>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {data.lowStockProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-[#FAFAFA] transition-colors"
              >
                <span className="font-mono text-xs text-brand-600 font-medium w-24 shrink-0">{p.code}</span>
                <span className="text-ink font-medium flex-1 truncate">{p.name}</span>
                <span className="font-mono text-xs text-red-500 font-medium">{p.stock} / {p.minStock} u</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-black/[0.06] rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-black/[0.06]">
          <h2 className="text-sm font-semibold text-ink">Derniers mouvements de stock</h2>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {data.recentMovements.length === 0 && (
            <p className="text-center text-sm text-ink-faint py-8">Aucun mouvement enregistré pour le moment.</p>
          )}
          {data.recentMovements.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{m.time}</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium w-32 shrink-0">
                {m.type === "ENTREE" ? (
                  <span className="flex items-center gap-1 text-emerald-600"><ArrowDownCircle size={12} /> ENTREE</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500"><ArrowUpCircle size={12} /> SORTIE</span>
                )}
              </span>
              <span className="text-ink-soft flex-1 truncate">{m.detail}</span>
              <span className="font-mono text-xs text-ink font-medium shrink-0">{m.amount}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}