import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserCircle } from "lucide-react";
import { BoutonDeconnexion } from "./BoutonDeconnexion";

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function BarreSuperieure({
  titre,
  authentifie,
}: {
  titre: string;
  authentifie: boolean;
}) {
  const dateAffichee = capitaliser(
    format(new Date(), "EEEE d MMMM yyyy", { locale: fr }),
  );

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-bordure bg-papier/90 px-5 py-4 backdrop-blur sm:px-8">
      <div>
        <h1 className="font-titre text-xl font-semibold text-encre sm:text-2xl">
          {titre}
        </h1>
        <p className="text-xs text-encre-claire sm:text-sm">{dateAffichee}</p>
      </div>
      {authentifie ? (
        <div className="flex items-center gap-4">
          <Link
            href="/compte"
            className="flex items-center gap-1.5 text-sm font-medium text-encre-claire hover:text-accent"
          >
            <UserCircle size={18} />
            <span className="hidden sm:inline">Mon compte</span>
          </Link>
          <BoutonDeconnexion />
        </div>
      ) : (
        <Link
          href="/login"
          className="text-sm font-medium text-encre-claire underline decoration-encre-claire/30 underline-offset-4 hover:text-accent"
        >
          Connexion
        </Link>
      )}
    </header>
  );
}
