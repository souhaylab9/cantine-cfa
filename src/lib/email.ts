import nodemailer from "nodemailer";
import { genererQrDataUrl } from "./qrcode";

export interface DestinataireBadge {
  nom: string;
  prenom: string;
  identifiant: string;
  email: string;
}

function creerTransporteur() {
  const utilisateur = process.env.GMAIL_USER;
  const motDePasse = process.env.GMAIL_APP_PASSWORD;

  if (!utilisateur || !motDePasse) {
    throw new Error(
      "Envoi d'e-mail non configuré : définissez GMAIL_USER et GMAIL_APP_PASSWORD.",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: utilisateur, pass: motDePasse },
  });
}

export async function envoyerBadgeParEmail(destinataire: DestinataireBadge): Promise<void> {
  const transporteur = creerTransporteur();
  const qrDataUrl = await genererQrDataUrl(destinataire.identifiant);
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  await transporteur.sendMail({
    from: `"Cantine CFA" <${process.env.GMAIL_USER}>`,
    to: destinataire.email,
    subject: "Votre badge cantine CFA",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <p>Bonjour ${destinataire.prenom},</p>
        <p>Voici votre badge cantine. Présentez ce QR code (à l'écran ou imprimé) lors du passage à la cantine.</p>
        <div style="border: 1px solid #e4e4d6; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-weight: 600; margin: 0 0 4px;">${destinataire.prenom} ${destinataire.nom.toUpperCase()}</p>
          <p style="font-family: monospace; color: #74806f; margin: 0 0 12px;">${destinataire.identifiant}</p>
          <img src="cid:qr-badge" alt="QR code" width="200" height="200" />
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `badge-${destinataire.identifiant}.png`,
        content: qrBuffer,
        cid: "qr-badge",
      },
    ],
  });
}
