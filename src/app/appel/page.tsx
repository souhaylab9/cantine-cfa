import { prisma } from "@/lib/db";
import { EnTete } from "@/components/EnTete";
import { AppelDuJour } from "@/components/AppelDuJour";
import { getSession } from "@/lib/session";
import { aujourdHui } from "@/lib/date";

export default async function PageAppel() {
  const session = await getSession();
  const date = aujourdHui();

  const apprentis = await prisma.apprenti.findMany({
    where: { actif: true },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    include: {
      presences: { where: { date } },
    },
  });

  const donnees = apprentis.map((a) => {
    const presence = a.presences[0];
    return {
      id: a.id,
      identifiant: a.identifiant,
      nom: a.nom,
      prenom: a.prenom,
      groupe: a.groupe,
      statut: (presence?.statut ?? "non_pointe") as
        | "present"
        | "absent"
        | "non_pointe",
      heurePointage: presence?.heurePointage ?? null,
    };
  });

  return (
    <>
      <EnTete pageActuelle="/appel" authentifie={Boolean(session.authentifie)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <AppelDuJour apprentisInitiaux={donnees} date={date} />
      </main>
    </>
  );
}
