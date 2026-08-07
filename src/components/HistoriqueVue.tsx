"use client";

import { Fragment, useEffect, useState, useTransition } from "react";

interface ApprentiLeger {
  id: string;
  nom: string;
  prenom: string;
  groupe: string | null;
}

interface JourPresence {
  date: string;
  statut: "present" | "absent" | "non_pointe";
  heurePointage: string | null;
}

interface LigneResume {
  apprenti: {
    id: string;
    identifiant: string;
    nom: string;
    prenom: string;
    groupe: string | null;
  };
  present: number;
  absent: number;
  jours: JourPresence[];
}

const LIBELLES_JOUR: Record<string, string> = {
  present: "Présent",
  absent: "Absent",
  non_pointe: "Non pointé",
};

export function HistoriqueVue({
  apprentis,
  moisInitial,
  resumeInitial,
}: {
  apprentis: ApprentiLeger[];
  moisInitial: string;
  resumeInitial: LigneResume[];
}) {
  const [mois, setMois] = useState(moisInitial);
  const [apprentiId, setApprentiId] = useState<string>("");
  const [resume, setResume] = useState<LigneResume[]>(resumeInitial);
  const [chargement, startChargement] = useTransition();
  const [deploye, setDeploye] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const params = new URLSearchParams({ mois });
    if (apprentiId) params.set("apprentiId", apprentiId);

    fetch(`/api/historique?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!annule) startChargement(() => setResume(data));
      });

    return () => {
      annule = true;
    };
  }, [mois, apprentiId]);

  const parametresExport = new URLSearchParams({ mois });
  if (apprentiId) parametresExport.set("apprentiId", apprentiId);

  return (
    <div>
      <div className="carte-cahier mb-5 flex flex-wrap items-end justify-between gap-4 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Mois
            </label>
            <input
              type="month"
              value={mois}
              onChange={(e) => setMois(e.target.value)}
              className="rounded-lg border border-bordure bg-papier px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(92,138,95,0.18)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Apprenti
            </label>
            <select
              value={apprentiId}
              onChange={(e) => setApprentiId(e.target.value)}
              className="rounded-lg border border-bordure bg-papier px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(92,138,95,0.18)]"
            >
              <option value="">Tous les apprentis</option>
              {apprentis.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export/csv?${parametresExport.toString()}`}
            className="rounded-xl border border-bordure px-4 py-2 text-sm font-medium text-encre-claire hover:bg-papier"
          >
            Export CSV
          </a>
          <a
            href={`/api/export/xlsx?${parametresExport.toString()}`}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-clair"
          >
            Export Excel
          </a>
        </div>
      </div>

      <div className={`carte-cahier overflow-hidden ${chargement ? "opacity-60" : ""}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bordure text-xs uppercase tracking-wide text-encre-claire">
              <th className="px-4 py-2.5 font-medium">Apprenti</th>
              <th className="px-4 py-2.5 font-medium">Groupe</th>
              <th className="px-4 py-2.5 font-medium text-center">Présences</th>
              <th className="px-4 py-2.5 font-medium text-center">Absences</th>
              <th className="px-4 py-2.5 font-medium text-right">Détail</th>
            </tr>
          </thead>
          <tbody>
            {resume.map((ligne) => (
              <Fragment key={ligne.apprenti.id}>
                <tr className="border-b border-bordure hover:bg-papier/60">
                  <td className="px-4 py-2.5 font-medium text-encre">
                    {ligne.apprenti.prenom} {ligne.apprenti.nom}
                    <span className="font-code ml-2 text-xs text-encre-claire">
                      {ligne.apprenti.identifiant}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-encre-claire">
                    {ligne.apprenti.groupe || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-present">
                    {ligne.present}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-absent">
                    {ligne.absent}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() =>
                        setDeploye((prev) =>
                          prev === ligne.apprenti.id ? null : ligne.apprenti.id,
                        )
                      }
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      {deploye === ligne.apprenti.id ? "Masquer" : "Voir le détail"}
                    </button>
                  </td>
                </tr>
                {deploye === ligne.apprenti.id && (
                  <tr className="border-b border-bordure bg-papier/60">
                    <td colSpan={5} className="px-4 py-3">
                      {ligne.jours.length === 0 ? (
                        <p className="text-sm text-encre-claire">
                          Aucun pointage ce mois-ci.
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {ligne.jours.map((j) => (
                            <li
                              key={j.date}
                              className={`font-code rounded-md px-2 py-1 text-xs ${
                                j.statut === "present"
                                  ? "bg-present-clair text-present"
                                  : "bg-absent-clair text-absent"
                              }`}
                            >
                              {j.date.slice(8, 10)}/{j.date.slice(5, 7)} ·{" "}
                              {LIBELLES_JOUR[j.statut]}
                              {j.heurePointage ? ` (${j.heurePointage})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {resume.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-encre-claire">
                  Aucune donnée pour cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
