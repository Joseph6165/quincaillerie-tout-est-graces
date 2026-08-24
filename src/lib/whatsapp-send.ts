import { getSettings } from "./settings";

export async function sendReceiptWhatsApp(opts: {
  to: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  const settings = await getSettings();

  if (!settings.whatsappPhoneNumberId || !settings.whatsappAccessToken || !settings.whatsappTemplateName) {
    throw new Error("Configuration WhatsApp Business non renseignée dans Paramètres.");
  }

  const digits = opts.to.replace(/\D/g, "");

  // 1. Envoi du fichier vers les serveurs Meta
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(opts.pdfBuffer)], { type: "application/pdf" }), opts.filename);
  form.append("type", "application/pdf");
  form.append("messaging_product", "whatsapp");

  const uploadRes = await fetch(`https://graph.facebook.com/v20.0/${settings.whatsappPhoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.whatsappAccessToken}` },
    body: form,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(uploadData.error?.message ?? "Échec de l'envoi du fichier vers WhatsApp.");
  }

  // 2. Envoi du message avec le document, via le modèle approuvé
  const sendRes = await fetch(`https://graph.facebook.com/v20.0/${settings.whatsappPhoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.whatsappAccessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digits,
      type: "template",
      template: {
        name: settings.whatsappTemplateName,
        language: { code: "fr" },
        components: [
          { type: "header", parameters: [{ type: "document", document: { id: uploadData.id, filename: opts.filename } }] },
        ],
      },
    }),
  });
  const sendData = await sendRes.json();
  if (!sendRes.ok) {
    throw new Error(sendData.error?.message ?? "Échec de l'envoi du message WhatsApp.");
  }
}