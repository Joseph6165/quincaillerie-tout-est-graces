"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CHECK_EVERY_MS = 10 * 60 * 1000;

// Vérifie régulièrement les ruptures ; le serveur n'émet une notification que toutes les 5 heures.
export default function StockRuptureWatcher() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/stock-alerts", { method: "POST" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.created) router.refresh();
      } catch {
        // réseau indisponible : nouvelle tentative au prochain cycle
      }
    }
    check();
    const id = setInterval(check, CHECK_EVERY_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router]);

  return null;
}
