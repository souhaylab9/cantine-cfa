import { prisma } from "@/lib/db";
import { CoquilleApp } from "@/components/CoquilleApp";
import { GestionApprentis } from "@/components/GestionApprentis";

export const dynamic = "force-dynamic";

export default async function PageApprentis() {
  const apprentis = await prisma.apprenti.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  return (
    <CoquilleApp section="/apprentis" titre="Apprentis" authentifie>
      <GestionApprentis apprentisInitiaux={apprentis} />
    </CoquilleApp>
  );
}
