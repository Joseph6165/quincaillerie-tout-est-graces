"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import { updateIntegrationSettings } from "@/app/(dashboard)/parametres/actions";

export interface SettingsValues {
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappTemplateName: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
}

export default function IntegrationsSettings({ initial }: { initial: SettingsValues }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateIntegrationSettings(formData);
      setSaved(true);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-black/[0.06] rounded-xl p-5 max-w-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-ink">Envoi automatique des factures</h2>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-mono font-medium text-ink-faint mb-2 flex items-center gap-1.5">
            <MessageCircle size={12} /> WHATSAPP BUSINESS API
          </p>
          <div className="grid gap-3">
            <input name="whatsappPhoneNumberId" defaultValue={initial.whatsappPhoneNumberId} placeholder="Phone Number ID" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
            <input name="whatsappAccessToken" defaultValue={initial.whatsappAccessToken} type="password" placeholder="Jeton d'accès (Access Token)" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
            <input name="whatsappTemplateName" defaultValue={initial.whatsappTemplateName} placeholder="Nom du modèle approuvé (ex: facture_client)" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
          </div>
        </div>

        <div>
          <p className="text-xs font-mono font-medium text-ink-faint mb-2 flex items-center gap-1.5">
            <Mail size={12} /> ENVOI E-MAIL (SMTP)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input name="smtpHost" defaultValue={initial.smtpHost} placeholder="Hôte (ex: smtp.gmail.com)" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
            <input name="smtpPort" defaultValue={initial.smtpPort} type="number" placeholder="Port (ex: 587)" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
            <input name="smtpUser" defaultValue={initial.smtpUser} placeholder="Adresse e-mail d'envoi" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 col-span-2" />
            <input name="smtpPassword" defaultValue={initial.smtpPassword} type="password" placeholder="Mot de passe d'application" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 col-span-2" />
            <input name="smtpFromEmail" defaultValue={initial.smtpFromEmail} placeholder="Adresse affichée comme expéditeur" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 col-span-2" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
          {saved && <span className="text-xs text-emerald-600 font-medium">Enregistré.</span>}
        </div>
      </form>
    </motion.div>
  );
}