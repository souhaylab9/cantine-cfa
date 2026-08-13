import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.authentifie) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { ancienMotDePasse, nouveauMotDePasse } = await request.json();

  if (typeof ancienMotDePasse !== "string" || typeof nouveauMotDePasse !== "string") {
    return NextResponse.json({ erreur: "Champs requis." }, { status: 400 });
  }

  if (nouveauMotDePasse.length < 6) {
    return NextResponse.json(
      { erreur: "Le nouveau mot de passe doit contenir au moins 6 caractères." },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findFirst();

  if (!admin) {
    return NextResponse.json(
      { erreur: "Aucun mot de passe administrateur n'est configuré." },
      { status: 500 },
    );
  }

  const valide = await bcrypt.compare(ancienMotDePasse, admin.motDePasseHash);

  if (!valide) {
    return NextResponse.json({ erreur: "Mot de passe actuel incorrect." }, { status: 401 });
  }

  const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { motDePasseHash } });

  return NextResponse.json({ ok: true });
}
