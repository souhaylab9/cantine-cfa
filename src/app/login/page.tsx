"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse }),
    });

    if (res.ok) {
      const suite = searchParams.get("suite") ?? "/apprentis";
      router.push(suite);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setErreur(data.erreur ?? "Une erreur est survenue.");
      setEnCours(false);
    }
  }

  return (
    <div className="carte-cahier w-full max-w-sm p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent font-titre text-sm font-bold text-white">
          C
        </span>
        <div>
          <p className="font-code text-[11px] uppercase tracking-widest text-encre-claire">
            Cantine CFA
          </p>
          <h1 className="font-titre text-lg font-semibold text-encre">
            Accès administration
          </h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="motDePasse"
            className="block text-sm font-medium text-encre-claire mb-1"
          >
            Mot de passe
          </label>
          <input
            id="motDePasse"
            type="password"
            autoFocus
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-xl border border-bordure bg-papier px-3 py-2 text-encre outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(92,138,95,0.18)]"
          />
        </div>
        {erreur && <p className="text-sm text-absent">{erreur}</p>}
        <button
          type="submit"
          disabled={enCours}
          className="w-full rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-clair disabled:opacity-60"
        >
          {enCours ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-encre-claire">
        <a href="/appel" className="underline hover:text-accent">
          Retour à l&rsquo;appel du jour
        </a>
      </p>
    </div>
  );
}

export default function PageConnexion() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <FormulaireConnexion />
      </Suspense>
    </main>
  );
}
