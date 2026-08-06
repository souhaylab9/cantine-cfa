import Link from "next/link";
import { BoutonDeconnexion } from "./BoutonDeconnexion";

const LIENS = [
  { href: "/appel", label: "Appel du jour" },
  { href: "/apprentis", label: "Apprentis" },
  { href: "/badges", label: "Badges" },
  { href: "/historique", label: "Historique" },
] as const;

export function EnTete({
  pageActuelle,
  authentifie,
}: {
  pageActuelle: string;
  authentifie: boolean;
}) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-encre/10 bg-papier/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
          <span className="font-titre text-lg font-semibold text-encre">
            Cantine CFA
          </span>
          <span className="hidden font-code text-xs text-neutre sm:inline">
            registre d&rsquo;appel
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {LIENS.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                pageActuelle === lien.href
                  ? "bg-accent text-papier shadow-[0_4px_14px_rgba(116,137,106,0.35)]"
                  : "text-encre-claire hover:bg-encre/8 hover:text-encre"
              }`}
            >
              {lien.label}
            </Link>
          ))}
          {authentifie ? (
            <BoutonDeconnexion />
          ) : (
            <Link
              href="/login"
              className="ml-1 text-sm text-neutre underline decoration-encre/20 underline-offset-4 hover:text-accent"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
