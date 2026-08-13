import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { genererIdentifiant } from "@/lib/identifiant";
import { envoyerBadgeParEmail } from "@/lib/email";

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
const ENTETES_EMAIL = ["email", "e-mail", "mail", "adresse mail", "adresse e-mail"];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const indexEmail = cellulesTexte.findIndex((c) => ENTETES_EMAIL.includes(c));

  const aUneEntete = indexNom !== -1 && indexPrenom !== -1;
  const colNom = aUneEntete ? indexNom + 1 : 1;
  const colPrenom = aUneEntete ? indexPrenom + 1 : 2;
  const colGroupe = aUneEntete ? (indexGroupe !== -1 ? indexGroupe + 1 : null) : 3;
  const colEmail = aUneEntete && indexEmail !== -1 ? indexEmail + 1 : null;
  const premiereLigneDonnees = aUneEntete ? 2 : 1;

  const existants = await prisma.apprenti.findMany({
    select: { nom: true, prenom: true },
  });
  const clesExistantes = new Set(
    existants.map((a) => `${normaliser(a.nom)}|${normaliser(a.prenom)}`),
  );

  let importes = 0;
  let ignores = 0;
  let emailsEnvoyes = 0;
  const erreurs: string[] = [];

  for (let i = premiereLigneDonnees; i <= feuille.rowCount; i++) {
    const ligne = feuille.getRow(i);
    const brutNom = ligne.getCell(colNom).text?.trim() ?? "";
    const brutPrenom = ligne.getCell(colPrenom).text?.trim() ?? "";
    const brutGroupe = colGroupe ? ligne.getCell(colGroupe).text?.trim() ?? "" : "";
    const brutEmail = colEmail ? ligne.getCell(colEmail).text?.trim() ?? "" : "";

    if (!brutNom && !brutPrenom) continue;

    if (!brutNom || !brutPrenom) {
      erreurs.push(`Ligne ${i} : nom ou prénom manquant.`);
      continue;
    }

    if (brutEmail && !REGEX_EMAIL.test(brutEmail)) {
      erreurs.push(`Ligne ${i} : adresse e-mail invalide (ignorée).`);
    }

    const cle = `${normaliser(brutNom)}|${normaliser(brutPrenom)}`;
    if (clesExistantes.has(cle)) {
      ignores++;
      continue;
    }

    const emailValide = brutEmail && REGEX_EMAIL.test(brutEmail) ? brutEmail : null;
    const identifiant = await genererIdentifiant();
    await prisma.apprenti.create({
      data: {
        nom: brutNom,
        prenom: brutPrenom,
        groupe: brutGroupe || null,
        email: emailValide,
        identifiant,
      },
    });
    clesExistantes.add(cle);
    importes++;

    if (emailValide) {
      try {
        await envoyerBadgeParEmail({ nom: brutNom, prenom: brutPrenom, identifiant, email: emailValide });
        emailsEnvoyes++;
      } catch (e) {
        erreurs.push(
          `${brutPrenom} ${brutNom} : badge non envoyé par e-mail (${e instanceof Error ? e.message : "échec"}).`,
        );
      }
    }
  }

  return NextResponse.json({ importes, ignores, emailsEnvoyes, erreurs });
}
