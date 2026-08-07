"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

export function FacturationPennylane({ moisInitial }: { moisInitial: string }) {
  const [mois, setMois] = useState(moisInitial);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<
    { type: "succes" | "erreur"; texte: string; lien?: string } | null
  >(null);

  async function genererFacture() {
    const confirmation = confirm(
      `Générer la facture brouillon Pennylane pour ${mois} ?\n\nElle regroupera toutes les présences du mois en une seule ligne, restera en brouillon (non envoyée) et devra être validée manuellement dans Pennylane.`,
    );
    if (!confirmation) return;

    setEnCours(true);
    setMessage(null);

    try {
      const res = await fetch("/api/facturation/pennylane", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mois }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "erreur", texte: data.erreur ?? "Échec de la création." });
      } else {
        setMessage({
          type: "succes",
          texte: `Facture brouillon créée : ${data.nombrePresences} présences × ${data.prixRepas}€ = ${data.montantTotal.toFixed(2)} € HT.`,
          lien: data.lienFacture,
        });
      }
    } catch {
      setMessage({ type: "erreur", texte: "Erreur réseau, réessayez." });
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="carte-cahier p-5">
        <p className="text-sm font-medium text-encre">Facture mensuelle Pennylane</p>
        <p className="mt-1 text-sm text-encre-claire">
          Regroupe le total des présences du mois choisi en une seule ligne de
          facture brouillon, à valider ensuite manuellement dans Pennylane.
          L&rsquo;app ne finalise ni n&rsquo;envoie jamais de facture elle-même.
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-encre-claire mb-1">
            Mois à facturer
          </label>
          <input
            type="month"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            className="rounded-lg border border-bordure bg-papier px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(92,138,95,0.18)]"
          />
        </div>

        <button
          onClick={genererFacture}
          disabled={enCours}
          className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-clair disabled:opacity-60"
        >
          {enCours ? "Génération…" : "Générer la facture du mois"}
        </button>

        {message && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm font-medium ${
              message.type === "succes"
                ? "bg-present-clair text-present"
                : "bg-absent-clair text-absent"
            }`}
          >
            <p>{message.texte}</p>
            {message.lien && (
              <a
                href={message.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 underline hover:no-underline"
              >
                Ouvrir la facture dans Pennylane
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
