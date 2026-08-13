"use client";

import { useState, useEffect, FormEvent } from "react";
import { User, KeyRound } from "lucide-react";

export function MonCompte() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCoursProfil, setEnCoursProfil] = useState(false);
  const [erreurProfil, setErreurProfil] = useState<string | null>(null);
  const [succesProfil, setSuccesProfil] = useState(false);

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enCoursMdp, setEnCoursMdp] = useState(false);
  const [erreurMdp, setErreurMdp] = useState<string | null>(null);
  const [succesMdp, setSuccesMdp] = useState(false);

  useEffect(() => {
    fetch("/api/auth/profil")
      .then((res) => res.json())
      .then((data) => {
        setNom(data.nom ?? "");
        setEmail(data.email ?? "");
      })
      .finally(() => setChargement(false));
  }, []);

  async function handleSubmitProfil(e: FormEvent) {
    e.preventDefault();
    setErreurProfil(null);
    setSuccesProfil(false);
    setEnCoursProfil(true);

    const res = await fetch("/api/auth/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, email }),
    });

    if (res.ok) {
      setSuccesProfil(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setErreurProfil(data.erreur ?? "Une erreur est survenue.");
    }
    setEnCoursProfil(false);
  }

  async function handleSubmitMdp(e: FormEvent) {
    e.preventDefault();
    setErreurMdp(null);
    setSuccesMdp(false);

    if (nouveauMotDePasse !== confirmation) {
      setErreurMdp("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnCoursMdp(true);
    const res = await fetch("/api/auth/changer-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
    });

    if (res.ok) {
      setSuccesMdp(true);
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      setConfirmation("");
    } else {
      const data = await res.json().catch(() => ({}));
      setErreurMdp(data.erreur ?? "Une erreur est survenue.");
    }
    setEnCoursMdp(false);
  }

  if (chargement) {
    return <p className="text-sm text-encre-claire">Chargement…</p>;
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <div className="carte-cahier p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-present-clair text-present">
            <User size={18} />
          </span>
          <h2 className="font-titre text-lg font-semibold text-encre">Informations du compte</h2>
        </div>
        <form onSubmit={handleSubmitProfil} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex. Souhayla Boubekri"
              className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.fr"
              className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
            />
          </div>
          {erreurProfil && <p className="text-sm text-absent">{erreurProfil}</p>}
          {succesProfil && <p className="text-sm text-present">Informations mises à jour.</p>}
          <button
            type="submit"
            disabled={enCoursProfil}
            className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-clair disabled:opacity-60"
          >
            {enCoursProfil ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>

      <div className="carte-cahier p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-absent-clair text-absent">
            <KeyRound size={18} />
          </span>
          <h2 className="font-titre text-lg font-semibold text-encre">
            Changer le mot de passe
          </h2>
        </div>
        <form onSubmit={handleSubmitMdp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              required
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-encre-claire mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(122,42,53,0.18)]"
            />
          </div>
          {erreurMdp && <p className="text-sm text-absent">{erreurMdp}</p>}
          {succesMdp && <p className="text-sm text-present">Mot de passe mis à jour avec succès.</p>}
          <button
            type="submit"
            disabled={enCoursMdp}
            className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-clair disabled:opacity-60"
          >
            {enCoursMdp ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
