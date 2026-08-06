import { prisma } from "@/lib/db";
import { EnTete } from "@/components/EnTete";
import { HistoriqueVue } from "@/components/HistoriqueVue";
import { obtenirResumeMois } from "@/lib/historique";
import { aujourdHui } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function PageHistorique() {
  const moisCourant = aujourdHui().slice(0, 7);

  const [apprentis, resume] = await Promise.all([
    prisma.apprenti.findMany({
      where: { actif: true },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    }),
    obtenirResumeMois(moisCourant),
  ]);

  return (
    <>
      <EnTete pageActuelle="/historique" authentifie />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-titre text-3xl font-semibold text-encre mb-1">
          Historique
        </h1>
        <p className="text-neutre mb-6">
          Consultez les présences par mois et exportez la base pour la
          facturation OPCO.
        </p>
        <HistoriqueVue
          apprentis={apprentis.map((a) => ({
            id: a.id,
            nom: a.nom,
            prenom: a.prenom,
            groupe: a.groupe,
          }))}
          moisInitial={moisCourant}
          resumeInitial={resume}
        />
      </main>
    </>
  );
}
