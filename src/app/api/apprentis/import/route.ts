import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { genererIdentifiant } from "@/lib/identifiant";

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const ENTETES_NOM = ["nom", "nom de famille"];
const ENTETES_PRENOM = ["prenom", "prénom"];
const ENTETES_GROUPE = ["groupe", "classe", "formation", "section"];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fichier = formData.get("fichier");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  try {
    const buffer = await fichier.arrayBuffer();
    await workbook.xlsx.load(buffer as ArrayBuffer);
  } catch {
    return NextResponse.json(
      { erreur: "Fichier illisible. Envoyez un fichier Excel (.xlsx)." },
      { status: 400 },
    );
  }

  const feuille = workbook.worksheets[0];
  if (!feuille || feuille.rowCount === 0) {
    return NextResponse.json({ erreur: "Le fichier est vide." }, { status: 400 });
  }

  const premiereLigne = feuille.getRow(1).values as (string | number | undefined)[];
  const cellulesTexte = premiereLigne
    .slice(1)
    .map((v) => (v === undefined || v === null ? "" : normaliser(String(v))));

  const indexNom = cellulesTexte.findIndex((c) => ENTETES_NOM.includes(c));
  const indexPrenom = cellulesTexte.findIndex((c) => ENTETES_PRENOM.includes(c));
  const indexGroupe = cellulesTexte.findIndex((c) => ENTETES_GROUPE.includes(c));

  const aUneEntete = indexNom !== -1 && indexPrenom !== -1;
  const colNom = aUneEntete ? indexNom + 1 : 1;
  const colPrenom = aUneEntete ? indexPrenom + 1 : 2;
  const colGroupe = aUneEntete ? (indexGroupe !== -1 ? indexGroupe + 1 : null) : 3;
  const premiereLigneDonnees = aUneEntete ? 2 : 1;

  const existants = await prisma.apprenti.findMany({
    select: { nom: true, prenom: true },
  });
  const clesExistantes = new Set(
    existants.map((a) => `${normaliser(a.nom)}|${normaliser(a.prenom)}`),
  );

  let importes = 0;
  let ignores = 0;
  const erreurs: string[] = [];

  for (let i = premiereLigneDonnees; i <= feuille.rowCount; i++) {
    const ligne = feuille.getRow(i);
    const brutNom = ligne.getCell(colNom).text?.trim() ?? "";
    const brutPrenom = ligne.getCell(colPrenom).text?.trim() ?? "";
    const brutGroupe = colGroupe ? ligne.getCell(colGroupe).text?.trim() ?? "" : "";

    if (!brutNom && !brutPrenom) continue;

    if (!brutNom || !brutPrenom) {
      erreurs.push(`Ligne ${i} : nom ou prénom manquant.`);
      continue;
    }

    const cle = `${normaliser(brutNom)}|${normaliser(brutPrenom)}`;
    if (clesExistantes.has(cle)) {
      ignores++;
      continue;
    }

    const identifiant = await genererIdentifiant();
    await prisma.apprenti.create({
      data: {
        nom: brutNom,
        prenom: brutPrenom,
        groupe: brutGroupe || null,
        identifiant,
      },
    });
    clesExistantes.add(cle);
    importes++;
  }

  return NextResponse.json({ importes, ignores, erreurs });
}
