import { addDays, endOfMonth, format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "./db";

const BASE_URL = "https://app.pennylane.com/api/external/v2";

export interface ResultatFacture {
  factureId: number;
  nombrePresences: number;
  montantTotal: number;
  prixRepas: string;
  lienFacture: string;
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export async function creerFactureBrouillon(mois: string): Promise<ResultatFacture> {
  const apiKey = process.env.PENNYLANE_API_KEY;
  const customerId = process.env.PENNYLANE_CUSTOMER_ID;
  const prixRepas = process.env.PENNYLANE_PRIX_REPAS;
  const vatRate = process.env.PENNYLANE_VAT_RATE ?? "exempt";

  if (!apiKey || !customerId || !prixRepas) {
    throw new Error(
      "Configuration Pennylane manquante : PENNYLANE_API_KEY, PENNYLANE_CUSTOMER_ID et PENNYLANE_PRIX_REPAS doivent être définis dans .env.",
    );
  }

  const debutMois = parse(mois, "yyyy-MM", new Date());
  const nombrePresences = await prisma.presence.count({
    where: { date: { startsWith: mois }, statut: "present" },
  });

  if (nombrePresences === 0) {
    throw new Error(`Aucune présence enregistrée pour ${mois}, rien à facturer.`);
  }

  const moisAnnee = capitaliser(format(debutMois, "MMMM yyyy", { locale: fr }));
  const label = `Repas apprentis - ${moisAnnee} - ${nombrePresences} présences x ${prixRepas}€`;

  const dateEmission = endOfMonth(debutMois);
  const dateEcheance = addDays(dateEmission, 30);

  const res = await fetch(`${BASE_URL}/customer_invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: Number(customerId),
      date: format(dateEmission, "yyyy-MM-dd"),
      deadline: format(dateEcheance, "yyyy-MM-dd"),
      draft: true,
      invoice_lines: [
        {
          label,
          quantity: nombrePresences,
          unit: "repas",
          raw_currency_unit_price: prixRepas,
          vat_rate: vatRate,
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Pennylane a refusé la création de la facture (${res.status}). ${detail}`,
    );
  }

  const data = await res.json();
  const lienFacture =
    data.public_file_url ??
    data.pdf_url ??
    data.file_url ??
    data.url ??
    `https://app.pennylane.com/customer_invoices/${data.id}`;

  return {
    factureId: data.id,
    nombrePresences,
    montantTotal: nombrePresences * Number(prixRepas),
    prixRepas,
    lienFacture,
  };
}
