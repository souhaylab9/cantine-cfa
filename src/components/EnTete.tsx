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
    <header className="no-print border-b border-encre/10 bg-papier/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
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
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                pageActuelle === lien.href
                  ? "bg-encre text-papier"
                  : "text-encre-claire hover:bg-encre/5"
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
              className="text-sm text-neutre underline hover:text-accent"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
