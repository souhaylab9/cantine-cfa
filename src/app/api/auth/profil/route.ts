import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.authentifie) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const admin = await prisma.admin.findFirst();
  return NextResponse.json({ nom: admin?.nom ?? "", email: admin?.email ?? "" });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session.authentifie) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const { nom, email } = await request.json();

  if (typeof nom !== "string" || typeof email !== "string") {
    return NextResponse.json({ erreur: "Champs requis." }, { status: 400 });
  }

  if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erreur: "Adresse e-mail invalide." }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst();

  if (!admin) {
    return NextResponse.json(
      { erreur: "Aucun compte administrateur n'est configuré." },
      { status: 500 },
    );
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { nom: nom.trim() || null, email: email.trim() || null },
  });

  return NextResponse.json({ ok: true });
}
