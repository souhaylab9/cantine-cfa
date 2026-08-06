import { addDays, endOfMonth, format, parse } from "date-fns";
import { obtenirResumeMois } from "./historique";

const BASE_URL = "https://app.pennylane.com/api/external/v2";

interface LigneFacturePennylane {
  label: string;
  quantity: number;
  unit: string;
  raw_currency_unit_price: string;
  vat_rate: string;
}

export interface ResultatFacture {
  factureId: number;
  nombreLignes: number;
  montantTotal: number;
}

export async function creerFactureBrouillon(mois: string): Promise<ResultatFacture> {
  const apiKey = process.env.PENNYLANE_API_KEY;
  const customerId = process.env.PENNYLANE_CUSTOMER_ID;
  const prixRepas = process.env.PENNYLANE_PRIX_REPAS ?? "4.50";
  const vatRate = process.env.PENNYLANE_VAT_RATE ?? "exempt";

  if (!apiKey || !customerId) {
    throw new Error(
      "Configuration Pennylane manquante : PENNYLANE_API_KEY et PENNYLANE_CUSTOMER_ID doivent être définis dans .env.",
    );
  }

  const resume = await obtenirResumeMois(mois);
  const lignesFacturables = resume.filter((ligne) => ligne.present > 0);

  if (lignesFacturables.length === 0) {
    throw new Error(`Aucune présence enregistrée pour ${mois}, rien à facturer.`);
  }

  const invoiceLines: LigneFacturePennylane[] = lignesFacturables.map((ligne) => ({
    label: `Repas cantine — ${ligne.apprenti.prenom} ${ligne.apprenti.nom} (${ligne.apprenti.identifiant})`,
    quantity: ligne.present,
    unit: "repas",
    raw_currency_unit_price: prixRepas,
    vat_rate: vatRate,
  }));

  const dateEmission = endOfMonth(parse(mois, "yyyy-MM", new Date()));
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
      invoice_lines: invoiceLines,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Pennylane a refusé la création de la facture (${res.status}). ${detail}`,
    );
  }

  const data = await res.json();
  const montantTotal = lignesFacturables.reduce(
    (total, ligne) => total + ligne.present * Number(prixRepas),
    0,
  );

  return {
    factureId: data.id,
    nombreLignes: invoiceLines.length,
    montantTotal,
  };
}
