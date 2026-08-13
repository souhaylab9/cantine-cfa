import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { envoyerBadgeParEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ erreur: "Aucun apprenti sélectionné." }, { status: 400 });
  }

  const apprentis = await prisma.apprenti.findMany({ where: { id: { in: ids } } });

  let envoyes = 0;
  let sansEmail = 0;
  const erreurs: string[] = [];

  for (const a of apprentis) {
    if (!a.email) {
      sansEmail++;
      continue;
    }
    try {
      await envoyerBadgeParEmail({
        nom: a.nom,
        prenom: a.prenom,
        identifiant: a.identifiant,
        email: a.email,
      });
      envoyes++;
    } catch (e) {
      erreurs.push(
        `${a.prenom} ${a.nom} : ${e instanceof Error ? e.message : "échec de l'envoi"}`,
      );
    }
  }

  return NextResponse.json({ envoyes, sansEmail, erreurs });
}
