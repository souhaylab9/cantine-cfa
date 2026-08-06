import { prisma } from "@/lib/db";
import { EnTete } from "@/components/EnTete";
import { FeuilleBadges } from "@/components/FeuilleBadges";
import { genererQrDataUrl } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

export default async function PageBadges() {
  const apprentis = await prisma.apprenti.findMany({
    where: { actif: true },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  const badges = await Promise.all(
    apprentis.map(async (a) => ({
      id: a.id,
      nom: a.nom,
      prenom: a.prenom,
      identifiant: a.identifiant,
      groupe: a.groupe,
      qrDataUrl: await genererQrDataUrl(a.identifiant),
    })),
  );

  return (
    <>
      <EnTete pageActuelle="/badges" authentifie />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="no-print mb-6">
          <h1 className="font-titre text-3xl font-semibold text-encre mb-1">
            Badges
          </h1>
          <p className="text-neutre">
            Sélectionnez les apprentis puis imprimez la feuille de badges
            (format carte, prête à découper) ou une feuille A4 complète.
          </p>
        </div>
        <FeuilleBadges badges={badges} />
      </main>
    </>
  );
}
