import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { genererIdentifiant } from "@/lib/identifiant";
import { envoyerBadgeParEmail } from "@/lib/email";

export async function GET() {
  const apprentis = await prisma.apprenti.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
  return NextResponse.json(apprentis);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nom = String(body.nom ?? "").trim();
  const prenom = String(body.prenom ?? "").trim();
  const groupe = body.groupe ? String(body.groupe).trim() : null;
  const email = body.email ? String(body.email).trim() : null;

  if (!nom || !prenom) {
    return NextResponse.json({ erreur: "Nom et prénom requis." }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "Adresse e-mail invalide." }, { status: 400 });
  }

  const identifiant = await genererIdentifiant();

  const apprenti = await prisma.apprenti.create({
    data: { nom, prenom, groupe, email, identifiant },
  });

  let emailEnvoye = false;
  let erreurEmail: string | null = null;
  if (email) {
    try {
      await envoyerBadgeParEmail({ nom, prenom, identifiant, email });
      emailEnvoye = true;
    } catch (e) {
      erreurEmail = e instanceof Error ? e.message : "Échec de l'envoi du badge.";
    }
  }

  return NextResponse.json({ ...apprenti, emailEnvoye, erreurEmail }, { status: 201 });
}
