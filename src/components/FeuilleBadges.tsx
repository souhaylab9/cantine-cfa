"use client";

import { useMemo, useState } from "react";

interface Badge {
  id: string;
  nom: string;
  prenom: string;
  identifiant: string;
  groupe: string | null;
  qrDataUrl: string;
}

export function FeuilleBadges({ badges }: { badges: Badge[] }) {
  const [selection, setSelection] = useState<Set<string>>(
    () => new Set(badges.map((b) => b.id)),
  );

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

  return (
    <div>
      <div className="no-print carte-cahier mb-6 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutre">
            {badgesSelectionnes.length} / {badges.length} apprenti(s) sélectionné(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={toutSelectionner}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-encre-claire hover:bg-encre/8"
            >
              Tout sélectionner
            </button>
            <button
              onClick={toutDeselectionner}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-encre-claire hover:bg-encre/8"
            >
              Tout désélectionner
            </button>
            <button
              onClick={() => window.print()}
              disabled={badgesSelectionnes.length === 0}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-papier shadow-[0_0_18px_rgba(242,179,61,0.3)] transition hover:brightness-110 disabled:opacity-50"
            >
              Imprimer la feuille (A4)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {badges.map((b) => (
            <label
              key={b.id}
              className="flex items-center gap-2 rounded-md border border-encre/10 px-2 py-1.5 text-sm"
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
