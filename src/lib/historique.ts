import { prisma } from "./db";

export async function obtenirResumeMois(mois: string, apprentiId?: string) {
  const apprentis = await prisma.apprenti.findMany({
    where: { actif: true, ...(apprentiId ? { id: apprentiId } : {}) },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  const presences = await prisma.presence.findMany({
    where: {
      date: { startsWith: mois },
      apprentiId: { in: apprentis.map((a) => a.id) },
    },
  });

  const parApprenti = new Map<string, typeof presences>();
  for (const p of presences) {
    const liste = parApprenti.get(p.apprentiId) ?? [];
    liste.push(p);
    parApprenti.set(p.apprentiId, liste);
  }

  return apprentis.map((a) => {
    const liste = (parApprenti.get(a.id) ?? []).sort((x, y) =>
      x.date.localeCompare(y.date),
    );
    return {
      apprenti: {
        id: a.id,
        identifiant: a.identifiant,
        nom: a.nom,
        prenom: a.prenom,
        groupe: a.groupe,
      },
      present: liste.filter((p) => p.statut === "present").length,
      absent: liste.filter((p) => p.statut === "absent").length,
      jours: liste.map((p) => ({
        date: p.date,
        statut: p.statut,
        heurePointage: p.heurePointage,
      })),
    };
  });
}

export async function obtenirLignesExport(mois: string, apprentiId?: string) {
  const presences = await prisma.presence.findMany({
    where: {
      date: { startsWith: mois },
      ...(apprentiId ? { apprentiId } : {}),
    },
    include: { apprenti: true },
    orderBy: [{ date: "asc" }],
  });

  return presences
    .filter((p) => p.statut !== "non_pointe")
    .map((p) => ({
      identifiant: p.apprenti.identifiant,
      nom: p.apprenti.nom,
      prenom: p.apprenti.prenom,
      groupe: p.apprenti.groupe ?? "",
      date: p.date,
      statut: p.statut,
      heurePointage: p.heurePointage ?? "",
      methode: p.methode ?? "",
    }));
}

export const LIBELLE_STATUT_EXPORT: Record<string, string> = {
  present: "Présent",
  absent: "Absent",
};
