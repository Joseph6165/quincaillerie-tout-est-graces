import nodemailer from "nodemailer";
import { getSettings } from "./settings";

export async function sendReceiptEmail(opts: {
  to: string;
  subject: string;
  text: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  const settings = await getSettings();

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword || !settings.smtpFromEmail) {
    throw new Error("Configuration e-mail non renseignée dans Paramètres.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort ?? 587,
    secure: (settings.smtpPort ?? 587) === 465,
    auth: { user: settings.smtpUser, pass: settings.smtpPassword },
  });

  await transporter.sendMail({
    from: settings.smtpFromEmail,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    attachments: [{ filename: opts.filename, content: opts.pdfBuffer }],
  });
}