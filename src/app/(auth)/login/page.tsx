"use client";
import Image from "next/image";
import type { Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Hammer,
  Zap,
  Droplets,
  PaintBucket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import BinLabel from "@/components/ui/BinLabel";

const CATEGORIES = [
  { icon: Hammer, label: "OUTILLAGE", title: "Chaque outil, sa place", text: "Suivez vos références d'outillage en temps réel, du marteau à la perceuse." },
  { icon: Droplets, label: "PLOMBERIE", title: "Zéro rupture de stock", text: "Des alertes automatiques avant que le tuyau de rechange ne manque." },
  { icon: Zap, label: "ÉLECTRICITÉ", title: "Traçabilité complète", text: "Chaque entrée, chaque sortie, chaque vente — horodatée et attribuée." },
];

const SLIDE_DURATION = 4500;

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };
export default function LoginPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % CATEGORIES.length), SLIDE_DURATION);
    return () => clearInterval(t);
  }, [slide]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Adresse e-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
  }

  const Active = CATEGORIES[slide].icon;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-ink overflow-hidden">
        {/* Formes flottantes en arrière-plan, inspirées d'une composition d'accueil */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.18, 0.3, 0.18] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-brand-500 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-700 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, #F2600A 0px, #F2600A 2px, transparent 2px, transparent 40px)" }} />

        {/* Icônes d'outils en filigrane */}
        <div className="absolute inset-0 pointer-events-none">
          <Hammer className="absolute top-16 left-14 text-white opacity-[0.07] -rotate-12" size={64} />
          <Wrench className="absolute top-1/3 right-16 text-white opacity-[0.07] rotate-12" size={56} />
          <Zap className="absolute bottom-32 left-24 text-white opacity-[0.07] -rotate-6" size={48} />
          <Droplets className="absolute bottom-20 right-20 text-white opacity-[0.07]" size={60} />
          <PaintBucket className="absolute top-1/2 left-8 text-white opacity-[0.06] rotate-6" size={44} />
        </div>

        {/* Cercle décoratif type "bouton" en bas à droite, écho de votre référence */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full border border-white/[0.06]" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border border-white/[0.08]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center gap-2">
            <Image src="/logo.png" alt="Tout Est Grâce" width={32} height={32} className="rounded" />
            <span className="text-white font-semibold tracking-tight">Tout Est Grâce</span>
          </motion.div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div key={slide} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                <BinLabel className="mb-6">{CATEGORIES[slide].label}</BinLabel>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-14 h-14 rounded-xl bg-brand-500/15 flex items-center justify-center mb-6">
                  <Active className="text-brand-400" size={26} />
                </motion.div>
                <h2 className="text-3xl font-semibold text-white mb-3 max-w-md">{CATEGORIES[slide].title}</h2>
                <p className="text-white/50 max-w-sm leading-relaxed">{CATEGORIES[slide].text}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-10">
              {CATEGORIES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className="relative h-1 w-9 rounded-full overflow-hidden bg-white/15" aria-label={`Voir la catégorie ${i + 1}`}>
                  {i === slide && (
                    <motion.div key={slide} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }} className="absolute inset-y-0 left-0 bg-brand-500" />
                  )}
                  {i < slide && <div className="absolute inset-0 bg-brand-500/40" />}
                </button>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs font-mono">SYSTEME.DE.GESTION — V1.0</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFAFA]">
        <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-sm">
          <motion.div variants={item} className="mb-10">
            <h1 className="text-2xl font-semibold text-ink mb-1.5">Connexion</h1>
            <p className="text-ink-soft text-sm">Accédez à votre espace de gestion.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={item}>
              <label htmlFor="email" className={`block text-xs font-medium mb-1.5 transition-colors ${emailFocused ? "text-brand-600" : "text-ink-soft"}`}>Adresse e-mail</label>
              <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 py-3 transition-all duration-200 bg-white ${emailFocused ? "border-brand-400 ring-4 ring-brand-100" : "border-black/10"}`}>
                <Mail size={17} className={emailFocused ? "text-brand-500" : "text-ink-faint"} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} placeholder="vous@toutestgrace.bj" className="flex-1 outline-none text-sm text-ink placeholder:text-ink-faint bg-transparent" required />
              </div>
            </motion.div>

            <motion.div variants={item}>
              <label htmlFor="password" className={`block text-xs font-medium mb-1.5 transition-colors ${passwordFocused ? "text-brand-600" : "text-ink-soft"}`}>Mot de passe</label>
              <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 py-3 transition-all duration-200 bg-white ${passwordFocused ? "border-brand-400 ring-4 ring-brand-100" : "border-black/10"}`}>
                <Lock size={17} className={passwordFocused ? "text-brand-500" : "text-ink-faint"} />
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} placeholder="••••••••" className="flex-1 outline-none text-sm text-ink placeholder:text-ink-faint bg-transparent" required />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-ink-faint hover:text-ink-soft transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-medium">{error}</motion.p>
            )}

            <motion.button variants={item} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="group w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium text-sm rounded-lg py-3 flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm shadow-brand-500/20">
              {loading ? "Connexion..." : "Se connecter"}
              {!loading && <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />}
            </motion.button>
          </form>

          <motion.p variants={item} className="text-center text-xs text-ink-faint mt-8 font-mono">TOUT-EST-GRACE / ACCES-INTERNE</motion.p>
        </motion.div>
      </div>
    </div>
  );
}