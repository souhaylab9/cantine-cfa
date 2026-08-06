import { NextRequest, NextResponse } from "next/server";
import { obtenirLignesExport, LIBELLE_STATUT_EXPORT } from "@/lib/historique";
import { versCsv } from "@/lib/csv";
import { aujourdHui } from "@/lib/date";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mois = searchParams.get("mois") ?? aujourdHui().slice(0, 7);
  const apprentiId = searchParams.get("apprentiId") || undefined;

  const lignes = await obtenirLignesExport(mois, apprentiId);
  const colonnes = [
    { cle: "identifiant", libelle: "Identifiant" },
    { cle: "nom", libelle: "Nom" },
    { cle: "prenom", libelle: "Prénom" },
    { cle: "groupe", libelle: "Groupe" },
    { cle: "date", libelle: "Date" },
    { cle: "statut", libelle: "Statut" },
    { cle: "heurePointage", libelle: "Heure de pointage" },
    { cle: "methode", libelle: "Méthode" },
  ];

  const lignesFormattees = lignes.map((l) => ({
    ...l,
    statut: LIBELLE_STATUT_EXPORT[l.statut] ?? l.statut,
  }));

  const csv = versCsv(lignesFormattees, colonnes);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presences-${mois}.csv"`,
    },
  });
}
