import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { obtenirLignesExport, LIBELLE_STATUT_EXPORT } from "@/lib/historique";
import { aujourdHui } from "@/lib/date";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mois = searchParams.get("mois") ?? aujourdHui().slice(0, 7);
  const apprentiId = searchParams.get("apprentiId") || undefined;

  const lignes = await obtenirLignesExport(mois, apprentiId);

  const workbook = new ExcelJS.Workbook();
  const feuille = workbook.addWorksheet(`Présences ${mois}`);
  feuille.columns = [
    { header: "Identifiant", key: "identifiant", width: 16 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Groupe", key: "groupe", width: 16 },
    { header: "Date", key: "date", width: 12 },
    { header: "Statut", key: "statut", width: 12 },
    { header: "Heure de pointage", key: "heurePointage", width: 16 },
    { header: "Méthode", key: "methode", width: 10 },
  ];
  feuille.getRow(1).font = { bold: true };
  feuille.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF22303F" },
  };
  feuille.getRow(1).font = { bold: true, color: { argb: "FFFBF7EF" } };

  for (const l of lignes) {
    feuille.addRow({ ...l, statut: LIBELLE_STATUT_EXPORT[l.statut] ?? l.statut });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="presences-${mois}.xlsx"`,
    },
  });
}
