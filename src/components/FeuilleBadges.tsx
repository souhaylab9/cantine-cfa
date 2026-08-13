"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";

interface Badge {
  id: string;
  nom: string;
  prenom: string;
  identifiant: string;
  groupe: string | null;
  email: string | null;
  qrDataUrl: string;
}

type ResultatEnvoi = { envoyes: number; sansEmail: number; erreurs: string[] };

export function FeuilleBadges({ badges }: { badges: Badge[] }) {
  const [selection, setSelection] = useState<Set<string>>(
    () => new Set(badges.map((b) => b.id)),
  );
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [resultatEnvoi, setResultatEnvoi] = useState<ResultatEnvoi | null>(null);

  const badgesSelectionnes = useMemo(
    () => badges.filter((b) => selection.has(b.id)),
    [badges, selection],
  );

  function basculer(id: string) {
    setSelection((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      return suivant;
    });
  }

  function toutSelectionner() {
    setSelection(new Set(badges.map((b) => b.id)));
  }

  function toutDeselectionner() {
    setSelection(new Set());
  }

  async function envoyerParEmail() {
    setEnvoiEnCours(true);
    setResultatEnvoi(null);
    try {
      const res = await fetch("/api/apprentis/envoyer-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selection) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResultatEnvoi({ envoyes: 0, sansEmail: 0, erreurs: [data.erreur ?? "Échec de l'envoi."] });
        return;
      }
      setResultatEnvoi(data);
    } catch {
      setResultatEnvoi({ envoyes: 0, sansEmail: 0, erreurs: ["Échec de l'envoi."] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div>
      <div className="no-print carte-cahier mb-6 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-encre-claire">
            {badgesSelectionnes.length} / {badges.length} apprenti(s) sélectionné(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={toutSelectionner}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-encre-claire hover:bg-papier"
            >
              Tout sélectionner
            </button>
            <button
              onClick={toutDeselectionner}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-encre-claire hover:bg-papier"
            >
              Tout désélectionner
            </button>
            <button
              onClick={envoyerParEmail}
              disabled={envoiEnCours || badgesSelectionnes.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-bordure px-3.5 py-1.5 text-sm font-medium text-encre-claire transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <Mail size={16} />
              {envoiEnCours ? "Envoi…" : "Envoyer par e-mail"}
            </button>
            <button
              onClick={() => window.print()}
              disabled={badgesSelectionnes.length === 0}
              className="rounded-xl bg-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-clair disabled:opacity-50"
            >
              Imprimer la feuille (A4)
            </button>
          </div>
        </div>
        {resultatEnvoi && (
          <div className="mb-3 rounded-lg border border-bordure p-3 text-sm">
            <p className="text-encre">
              <span className="font-medium text-present">{resultatEnvoi.envoyes} badge(s) envoyé(s)</span>
              {resultatEnvoi.sansEmail > 0 && (
                <span className="text-encre-claire">
                  {" "}
                  · {resultatEnvoi.sansEmail} sans adresse e-mail (ignoré(s))
                </span>
              )}
            </p>
            {resultatEnvoi.erreurs.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-absent">
                {resultatEnvoi.erreurs.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {badges.map((b) => (
            <label
              key={b.id}
              className="flex items-center gap-2 rounded-lg border border-bordure px-2 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selection.has(b.id)}
                onChange={() => basculer(b.id)}
                className="accent-accent"
              />
              <span className="truncate">
                {b.prenom} {b.nom}
              </span>
              {b.email && <Mail size={12} className="ml-auto shrink-0 text-encre-claire" />}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[4mm] print:grid-cols-2">
        {badgesSelectionnes.map((b) => (
          <div
            key={b.id}
            className="badge-carte carte-cahier flex w-full items-center gap-3 p-3 print:h-[54mm] print:w-[90mm] print:break-inside-avoid print:rounded-none print:shadow-none"
          >
            <div className="flex-1">
              <p className="font-code text-[10px] uppercase tracking-widest text-accent">
                Cantine CFA
              </p>
              <p className="font-titre text-lg font-semibold leading-tight text-encre">
                {b.prenom}
                <br />
                {b.nom.toUpperCase()}
              </p>
              {b.groupe && (
                <p className="mt-1 text-xs text-neutre">{b.groupe}</p>
              )}
              <p className="font-code mt-2 text-xs text-encre-claire">
                {b.identifiant}
              </p>
            </div>
            <div className="shrink-0 rounded-lg bg-white p-1.5 print:rounded-none print:p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.qrDataUrl}
                alt={`QR code ${b.identifiant}`}
                className="h-16 w-16 print:h-[22mm] print:w-[22mm]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
