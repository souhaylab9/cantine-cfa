import { prisma } from "@/lib/db";
import { CoquilleApp } from "@/components/CoquilleApp";
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
      email: a.email,
      qrDataUrl: await genererQrDataUrl(a.identifiant),
    })),
  );

  return (
    <CoquilleApp section="/apprentis" titre="Badges" authentifie>
      <p className="no-print mb-5 text-sm text-encre-claire">
        Sélectionnez les apprentis puis imprimez la feuille de badges (format
        carte, prête à découper) ou une feuille A4 complète.
      </p>
      <FeuilleBadges badges={badges} />
    </CoquilleApp>
  );
}
