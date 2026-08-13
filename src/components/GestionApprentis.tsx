"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IdCard, Upload } from "lucide-react";
import type { Apprenti } from "@/generated/prisma/client";

type Brouillon = { nom: string; prenom: string; groupe: string };
const BROUILLON_VIDE: Brouillon = { nom: "", prenom: "", groupe: "" };

type ResultatImport = { importes: number; ignores: number; erreurs: string[] };

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
  const [importEnCours, setImportEnCours] = useState(false);
  const [resultatImport, setResultatImport] = useState<ResultatImport | null>(null);
  const inputFichierRef = useRef<HTMLInputElement>(null);

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

  function declencherImport() {
    setResultatImport(null);
    inputFichierRef.current?.click();
  }

  async function handleFichierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setImportEnCours(true);
    setResultatImport(null);

    try {
      const formData = new FormData();
      formData.append("fichier", fichier);
      const res = await fetch("/api/apprentis/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setResultatImport({ importes: 0, ignores: 0, erreurs: [data.erreur ?? "Échec de l'import."] });
        return;
      }

      setResultatImport(data);
      const listeRes = await fetch("/api/apprentis");
      if (listeRes.ok) {
        setApprentis(await listeRes.json());
      }
    } catch {
      setResultatImport({ importes: 0, ignores: 0, erreurs: ["Échec de l'import."] });
    } finally {
      setImportEnCours(false);
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
          className="w-full max-w-xs rounded-xl border border-bordure bg-carte px-3.5 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
        />
        <div className="flex items-center gap-2">
          <Link
            href="/badges"
            className="flex items-center gap-1.5 rounded-xl border border-bordure bg-carte px-3.5 py-2 text-sm font-medium text-encre-claire transition hover:border-accent hover:text-accent"
          >
            <IdCard size={16} />
            Voir les badges
          </Link>
          <input
            ref={inputFichierRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFichierChange}
          />
          <button
            onClick={declencherImport}
            disabled={importEnCours}
            className="flex items-center gap-1.5 rounded-xl border border-bordure bg-carte px-3.5 py-2 text-sm font-medium text-encre-claire transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <Upload size={16} />
            {importEnCours ? "Import…" : "Importer un Excel"}
          </button>
          <button
            onClick={ouvrirAjout}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-clair"
          >
            + Ajouter un apprenti
          </button>
        </div>
      </div>

      {resultatImport && (
        <div className="carte-cahier mb-4 p-4 text-sm">
          <p className="text-encre">
            <span className="font-medium text-present">{resultatImport.importes} importé(s)</span>
            {resultatImport.ignores > 0 && (
              <span className="text-encre-claire"> · {resultatImport.ignores} déjà existant(s) ignoré(s)</span>
            )}
          </p>
          {resultatImport.erreurs.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-absent">
              {resultatImport.erreurs.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mb-3 text-xs text-encre-claire">
        Le fichier Excel doit avoir des colonnes Nom, Prénom et (optionnel) Groupe/Classe — avec ou
        sans ligne d&rsquo;en-tête.
      </p>

      <div className="carte-cahier overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bordure text-xs uppercase tracking-wide text-encre-claire">
              <th className="px-4 py-2.5 font-medium">Nom</th>
              <th className="px-4 py-2.5 font-medium">Prénom</th>
              <th className="px-4 py-2.5 font-medium">Identifiant</th>
              <th className="px-4 py-2.5 font-medium">Groupe</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apprentisFiltres.map((a) => (
              <tr key={a.id} className="border-b border-bordure last:border-0 hover:bg-papier/60">
                <td className="px-4 py-2.5 font-medium text-encre">{a.nom}</td>
                <td className="px-4 py-2.5">{a.prenom}</td>
                <td className="px-4 py-2.5 font-code text-xs text-encre-claire">
                  {a.identifiant}
                </td>
                <td className="px-4 py-2.5 text-encre-claire">{a.groupe || "—"}</td>
                <td className="px-4 py-2.5">
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
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => ouvrirEdition(a)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Modifier
                  </button>
                  <span className="mx-2 text-bordure">|</span>
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
                <td colSpan={6} className="px-4 py-8 text-center text-encre-claire">
                  Aucun apprenti ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
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
                  className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
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
                  className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
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
                  className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
                />
              </div>
              {apprentiEnEdition && (
                <p className="font-code text-xs text-encre-claire">
                  Identifiant : {apprentiEnEdition.identifiant}
                </p>
              )}
              {erreur && <p className="text-sm text-absent">{erreur}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={fermerFormulaire}
                className="rounded-xl px-4 py-2 text-sm font-medium text-encre-claire hover:bg-papier"
              >
                Annuler
              </button>
              <button
                onClick={enregistrer}
                disabled={enCours}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-clair disabled:opacity-60"
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
