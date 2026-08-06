"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

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
  date,
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

  const dateAffichee = format(parseISO(date), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <div onClick={gererClicFond}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-code text-xs uppercase tracking-widest text-neutre">
            Appel du jour
          </p>
          <h1 className="font-titre text-3xl font-semibold capitalize text-encre">
            {dateAffichee}
          </h1>
        </div>
        <div className="flex gap-3">
          <CompteurCarte valeur={compteurs.present} libelle="Présents" couleur="text-present" />
          <CompteurCarte valeur={compteurs.absent} libelle="Absents" couleur="text-absent" />
          <CompteurCarte valeur={compteurs.nonPointe} libelle="Non pointés" couleur="text-neutre" />
        </div>
      </div>

      <form
        onSubmit={handleScanSubmit}
        className="carte-cahier mb-6 border-accent/20 p-4 sm:p-6"
      >
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
          className="font-code w-full rounded-xl border-2 border-accent/25 bg-papier px-4 py-3.5 text-lg tracking-wide text-encre outline-none transition focus:border-accent focus:shadow-[0_0_0_4px_rgba(116,137,106,0.18)]"
        />
        {erreurScan && (
          <p className="mt-2 text-sm font-medium text-absent">{erreurScan}</p>
        )}
      </form>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-titre text-lg font-semibold text-encre">
          Liste de secours — pointage manuel
        </h2>
        <input
          type="text"
          placeholder="Filtrer…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-[180px] rounded-full border border-encre/15 bg-carte px-3.5 py-1.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(116,137,106,0.18)]"
        />
      </div>

      <div className="carte-cahier overflow-hidden">
        <ul className="divide-y divide-encre/5">
          {apprentisFiltres.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-encre">
                  {a.prenom} {a.nom}
                  {a.groupe && (
                    <span className="ml-2 text-xs font-normal text-neutre">
                      {a.groupe}
                    </span>
                  )}
                </p>
                <p className="font-code text-xs text-neutre">
                  {a.identifiant}
                  {a.heurePointage ? ` · pointé à ${a.heurePointage}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatutBadge statut={a.statut} />
                <button
                  onClick={() => pointerManuellement(a, "present")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    a.statut === "present"
                      ? "bg-present text-papier shadow-[0_2px_10px_rgba(95,125,82,0.35)]"
                      : "bg-present-clair text-present hover:brightness-95"
                  }`}
                >
                  Présent
                </button>
                <button
                  onClick={() => pointerManuellement(a, "absent")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    a.statut === "absent"
                      ? "bg-absent text-papier shadow-[0_2px_10px_rgba(28,28,24,0.3)]"
                      : "bg-absent-clair text-absent hover:brightness-95"
                  }`}
                >
                  Absent
                </button>
              </div>
            </li>
          ))}
          {apprentisFiltres.length === 0 && (
            <li className="px-4 py-8 text-center text-neutre">
              Aucun apprenti ne correspond à ce filtre.
            </li>
          )}
        </ul>
      </div>

      {tampon && (
        <div
          key={tampon.cle}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        >
          <div className="tampon rounded-2xl border-2 border-present/50 bg-carte px-10 py-6 text-center shadow-[0_20px_50px_rgba(23,23,19,0.18)]">
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
    <div className="carte-cahier min-w-[96px] px-4 py-3 text-center">
      <p className={`font-titre text-2xl font-bold ${couleur}`}>{valeur}</p>
      <p className="text-xs text-neutre">{libelle}</p>
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
