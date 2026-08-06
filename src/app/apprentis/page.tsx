import { prisma } from "@/lib/db";
import { EnTete } from "@/components/EnTete";
import { GestionApprentis } from "@/components/GestionApprentis";

export const dynamic = "force-dynamic";

export default async function PageApprentis() {
  const apprentis = await prisma.apprenti.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  return (
    <>
      <EnTete pageActuelle="/apprentis" authentifie />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-titre text-3xl font-semibold text-encre mb-1">
          Apprentis
        </h1>
        <p className="text-neutre mb-6">
          Ajoutez, modifiez ou désactivez les apprentis inscrits à la cantine.
        </p>
        <GestionApprentis apprentisInitiaux={apprentis} />
      </main>
    </>
  );
}
