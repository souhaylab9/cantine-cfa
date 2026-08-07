import { prisma } from "@/lib/db";
import { CoquilleApp } from "@/components/CoquilleApp";
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
    <CoquilleApp section="/historique" titre="Suivi & export" authentifie>
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
    </CoquilleApp>
  );
}
