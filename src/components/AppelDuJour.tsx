"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Statut = "present" | "absent" | "non_pointe";

interface LigneApprenti {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  groupe: string | null;
  statut: Statut;
  heurePointage: string | null;
}

const LIBELLES_STATUT: Record<Statut, string> = {
  present: "Présent",
  absent: "Absent",
  non_pointe: "Non pointé",
};

export function AppelDuJour({
  apprentisInitiaux,
}: {
  apprentisInitiaux: LigneApprenti[];
  date: string;
}) {
  const [apprentis, setApprentis] = useState(apprentisInitiaux);
  const [saisie, setSaisie] = useState("");
  const [erreurScan, setErreurScan] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [tampon, setTampon] = useState<{ cle: number; nom: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const compteurTamponRef = useRef(0);

  const refocaliser = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    refocaliser();
  }, [refocaliser]);

  useEffect(() => {
    if (!erreurScan) return;
    const t = setTimeout(() => setErreurScan(null), 3000);
    return () => clearTimeout(t);
  }, [erreurScan]);

  useEffect(() => {
    if (!tampon) return;
    const t = setTimeout(() => setTampon(null), 1300);
    return () => clearTimeout(t);
  }, [tampon]);

  const compteurs = useMemo(() => {
    const present = apprentis.filter((a) => a.statut === "present").length;
    const absent = apprentis.filter((a) => a.statut === "absent").length;
    const nonPointe = apprentis.filter((a) => a.statut === "non_pointe").length;
    return { present, absent, nonPointe, total: apprentis.length };
  }, [apprentis]);

  const apprentisFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return apprentis;
    return apprentis.filter((a) =>
      `${a.nom} ${a.prenom} ${a.groupe ?? ""}`.toLowerCase().includes(q),
    );
  }, [apprentis, recherche]);

  function appliquerResultat(apprenti: {
    id: string;
    nom: string;
    prenom: string;
  }, presence: { statut: Statut; heurePointage: string | null }) {
    setApprentis((prev) =>
      prev.map((a) =>
        a.id === apprenti.id
          ? { ...a, statut: presence.statut, heurePointage: presence.heurePointage }
          : a,
      ),
    );
    if (presence.statut === "present") {
      compteurTamponRef.current += 1;
      setTampon({ cle: compteurTamponRef.current, nom: `${apprenti.prenom} ${apprenti.nom}` });
    }
  }

  async function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = saisie.trim();
    setSaisie("");
    if (!code) return;

    try {
      const res = await fetch("/api/pointage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreurScan(data.erreur ?? "Code non reconnu.");
      } else {
        setErreurScan(null);
        appliquerResultat(data.apprenti, data.presence);
      }
    } catch {
      setErreurScan("Erreur réseau, réessayez.");
    } finally {
      refocaliser();
    }
  }

  async function pointerManuellement(a: LigneApprenti, statut: "present" | "absent") {
    const res = await fetch("/api/pointage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apprentiId: a.id, statut }),
    });
    if (res.ok) {
      const data = await res.json();
      appliquerResultat(data.apprenti, data.presence);
    }
    refocaliser();
  }

  function gererClicFond(e: React.MouseEvent<HTMLDivElement>) {
    const cible = e.target as HTMLElement;
    if (cible.closest("button, a, input, textarea, select")) return;
    refocaliser();
  }

  return (
    <div onClick={gererClicFond}>
      <div className="mb-5 grid grid-cols-3 gap-3 sm:max-w-md">
        <CompteurCarte valeur={compteurs.present} libelle="Présents" couleur="text-present" />
        <CompteurCarte valeur={compteurs.absent} libelle="Absents" couleur="text-absent" />
        <CompteurCarte valeur={compteurs.nonPointe} libelle="Non pointés" couleur="text-neutre" />
      </div>

      <form onSubmit={handleScanSubmit} className="carte-cahier mb-5 p-4 sm:p-5">
        <label
          htmlFor="scan"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-encre-claire"
        >
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Scanner le badge d&rsquo;un apprenti (ou saisir son identifiant puis
          Entrée)
        </label>
        <input
          ref={inputRef}
          id="scan"
          type="text"
          autoFocus
          autoComplete="off"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onBlur={() => setTimeout(refocaliser, 50)}
          placeholder="En attente d'un scan…"
          className="font-code w-full rounded-xl border border-bordure bg-papier px-4 py-3 text-lg tracking-wide text-encre outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
        />
        {erreurScan && (
          <p className="mt-2 text-sm font-medium text-absent">{erreurScan}</p>
        )}
      </form>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-titre text-base font-semibold text-encre">
          Liste de secours — pointage manuel
        </h2>
        <input
          type="text"
          placeholder="Filtrer…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-[180px] rounded-lg border border-bordure bg-carte px-3 py-1.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
        />
      </div>

      <div className="carte-cahier overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bordure text-xs uppercase tracking-wide text-encre-claire">
              <th className="px-4 py-2.5 font-medium">Apprenti</th>
              <th className="px-4 py-2.5 font-medium">Identifiant</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {apprentisFiltres.map((a) => (
              <tr key={a.id} className="border-b border-bordure last:border-0 hover:bg-papier/60">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-encre">
                    {a.prenom} {a.nom}
                  </p>
                  {a.groupe && <p className="text-xs text-encre-claire">{a.groupe}</p>}
                </td>
                <td className="px-4 py-2.5">
                  <p className="font-code text-xs text-encre-claire">{a.identifiant}</p>
                  {a.heurePointage && (
                    <p className="text-xs text-encre-claire">{a.heurePointage}</p>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <StatutBadge statut={a.statut} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => pointerManuellement(a, "present")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        a.statut === "present"
                          ? "bg-present text-white"
                          : "bg-present-clair text-present hover:brightness-95"
                      }`}
                    >
                      Présent
                    </button>
                    <button
                      onClick={() => pointerManuellement(a, "absent")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        a.statut === "absent"
                          ? "bg-absent text-white"
                          : "bg-absent-clair text-absent hover:brightness-95"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {apprentisFiltres.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-encre-claire">
                  Aucun apprenti ne correspond à ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tampon && (
        <div
          key={tampon.cle}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        >
          <div className="tampon rounded-2xl border-2 border-present/50 bg-carte px-10 py-6 text-center shadow-[0_20px_50px_rgba(38,48,42,0.18)]">
            <p className="font-titre text-4xl font-bold uppercase tracking-wider text-present">
              Présent ✓
            </p>
            <p className="font-code mt-1 text-sm text-encre-claire">{tampon.nom}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompteurCarte({
  valeur,
  libelle,
  couleur,
}: {
  valeur: number;
  libelle: string;
  couleur: string;
}) {
  return (
    <div className="carte-cahier px-4 py-3">
      <p className={`font-titre text-2xl font-bold ${couleur}`}>{valeur}</p>
      <p className="text-xs text-encre-claire">{libelle}</p>
    </div>
  );
}

function StatutBadge({ statut }: { statut: Statut }) {
  const styles: Record<Statut, string> = {
    present: "bg-present-clair text-present",
    absent: "bg-absent-clair text-absent",
    non_pointe: "bg-neutre-clair text-neutre",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[statut]}`}>
      {LIBELLES_STATUT[statut]}
    </span>
  );
}
