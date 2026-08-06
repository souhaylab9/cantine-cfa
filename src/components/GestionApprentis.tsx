"use client";

import { useMemo, useState } from "react";
import type { Apprenti } from "@/generated/prisma/client";

type Brouillon = { nom: string; prenom: string; groupe: string };
const BROUILLON_VIDE: Brouillon = { nom: "", prenom: "", groupe: "" };

export function GestionApprentis({
  apprentisInitiaux,
}: {
  apprentisInitiaux: Apprenti[];
}) {
  const [apprentis, setApprentis] = useState(apprentisInitiaux);
  const [recherche, setRecherche] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [apprentiEnEdition, setApprentiEnEdition] = useState<Apprenti | null>(null);
  const [brouillon, setBrouillon] = useState<Brouillon>(BROUILLON_VIDE);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const apprentisFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return apprentis;
    return apprentis.filter((a) =>
      `${a.nom} ${a.prenom} ${a.identifiant} ${a.groupe ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [apprentis, recherche]);

  function ouvrirAjout() {
    setApprentiEnEdition(null);
    setBrouillon(BROUILLON_VIDE);
    setErreur(null);
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(a: Apprenti) {
    setApprentiEnEdition(a);
    setBrouillon({ nom: a.nom, prenom: a.prenom, groupe: a.groupe ?? "" });
    setErreur(null);
    setFormulaireOuvert(true);
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setApprentiEnEdition(null);
  }

  async function enregistrer() {
    if (!brouillon.nom.trim() || !brouillon.prenom.trim()) {
      setErreur("Nom et prénom requis.");
      return;
    }
    setEnCours(true);
    setErreur(null);

    try {
      if (apprentiEnEdition) {
        const res = await fetch(`/api/apprentis/${apprentiEnEdition.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brouillon),
        });
        if (!res.ok) throw new Error();
        const maj = await res.json();
        setApprentis((prev) =>
          prev.map((a) => (a.id === maj.id ? maj : a)),
        );
      } else {
        const res = await fetch("/api/apprentis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brouillon),
        });
        if (!res.ok) throw new Error();
        const cree = await res.json();
        setApprentis((prev) =>
          [...prev, cree].sort((a, b) => a.nom.localeCompare(b.nom)),
        );
      }
      fermerFormulaire();
    } catch {
      setErreur("Impossible d'enregistrer. Vérifiez les champs et réessayez.");
    } finally {
      setEnCours(false);
    }
  }

  async function basculerActif(a: Apprenti) {
    const res = await fetch(`/api/apprentis/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !a.actif }),
    });
    if (res.ok) {
      const maj = await res.json();
      setApprentis((prev) => prev.map((x) => (x.id === maj.id ? maj : x)));
    }
  }

  async function supprimer(a: Apprenti) {
    if (
      !confirm(
        `Supprimer définitivement ${a.prenom} ${a.nom} (${a.identifiant}) ainsi que son historique de présence ?`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/apprentis/${a.id}`, { method: "DELETE" });
    if (res.ok) {
      setApprentis((prev) => prev.filter((x) => x.id !== a.id));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Rechercher un apprenti…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-xs rounded-md border border-encre/20 bg-carte px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          onClick={ouvrirAjout}
          className="rounded-md bg-encre px-4 py-2 text-sm font-medium text-papier hover:bg-encre-claire"
        >
          + Ajouter un apprenti
        </button>
      </div>

      <div className="carte-cahier overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-encre/10 text-neutre">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Prénom</th>
              <th className="px-4 py-3 font-medium">Identifiant</th>
              <th className="px-4 py-3 font-medium">Groupe</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apprentisFiltres.map((a) => (
              <tr key={a.id} className="border-b border-encre/5 last:border-0">
                <td className="px-4 py-3 font-medium text-encre">{a.nom}</td>
                <td className="px-4 py-3">{a.prenom}</td>
                <td className="px-4 py-3 font-code text-xs text-encre-claire">
                  {a.identifiant}
                </td>
                <td className="px-4 py-3 text-neutre">{a.groupe || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => basculerActif(a)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      a.actif
                        ? "bg-present-clair text-present"
                        : "bg-neutre-clair text-neutre"
                    }`}
                  >
                    {a.actif ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => ouvrirEdition(a)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Modifier
                  </button>
                  <span className="mx-2 text-encre/15">|</span>
                  <button
                    onClick={() => supprimer(a)}
                    className="text-xs font-medium text-absent hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {apprentisFiltres.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutre">
                  Aucun apprenti ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-encre/40 px-4">
          <div className="carte-cahier w-full max-w-md p-6">
            <h2 className="font-titre text-xl font-semibold text-encre mb-4">
              {apprentiEnEdition ? "Modifier l'apprenti" : "Ajouter un apprenti"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-encre-claire mb-1">
                  Nom
                </label>
                <input
                  autoFocus
                  value={brouillon.nom}
                  onChange={(e) =>
                    setBrouillon((b) => ({ ...b, nom: e.target.value }))
                  }
                  className="w-full rounded-md border border-encre/20 bg-papier px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-encre-claire mb-1">
                  Prénom
                </label>
                <input
                  value={brouillon.prenom}
                  onChange={(e) =>
                    setBrouillon((b) => ({ ...b, prenom: e.target.value }))
                  }
                  className="w-full rounded-md border border-encre/20 bg-papier px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-encre-claire mb-1">
                  Groupe / classe (optionnel)
                </label>
                <input
                  value={brouillon.groupe}
                  onChange={(e) =>
                    setBrouillon((b) => ({ ...b, groupe: e.target.value }))
                  }
                  className="w-full rounded-md border border-encre/20 bg-papier px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
              {apprentiEnEdition && (
                <p className="font-code text-xs text-neutre">
                  Identifiant : {apprentiEnEdition.identifiant}
                </p>
              )}
              {erreur && <p className="text-sm text-absent">{erreur}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={fermerFormulaire}
                className="rounded-md px-4 py-2 text-sm font-medium text-neutre hover:bg-encre/5"
              >
                Annuler
              </button>
              <button
                onClick={enregistrer}
                disabled={enCours}
                className="rounded-md bg-encre px-4 py-2 text-sm font-medium text-papier hover:bg-encre-claire disabled:opacity-60"
              >
                {enCours ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
