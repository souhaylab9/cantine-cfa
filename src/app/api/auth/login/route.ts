import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { motDePasse } = await request.json();

  if (typeof motDePasse !== "string" || motDePasse.length === 0) {
    return NextResponse.json({ erreur: "Mot de passe requis." }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst();

  if (!admin) {
    return NextResponse.json(
      { erreur: "Aucun mot de passe administrateur n'est configuré." },
      { status: 500 },
    );
  }

  const valide = await bcrypt.compare(motDePasse, admin.motDePasseHash);

  if (!valide) {
    return NextResponse.json({ erreur: "Mot de passe incorrect." }, { status: 401 });
  }

  const session = await getSession();
  session.authentifie = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
