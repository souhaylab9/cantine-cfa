import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aujourdHui, heureActuelle } from "@/lib/date";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const date = aujourdHui();

  let apprentiId: string | undefined = body.apprentiId;
  const statut: "present" | "absent" =
    body.statut === "absent" ? "absent" : "present";
  const methode: "scan" | "manuel" = body.identifiant ? "scan" : "manuel";

  if (methode === "scan") {
    const identifiant = String(body.identifiant ?? "").trim();
    if (!identifiant) {
      return NextResponse.json({ erreur: "Code vide." }, { status: 400 });
    }
    const apprenti = await prisma.apprenti.findUnique({ where: { identifiant } });
    if (!apprenti || !apprenti.actif) {
      return NextResponse.json(
        { erreur: `Code inconnu : ${identifiant}` },
        { status: 404 },
      );
    }
    apprentiId = apprenti.id;
  }

  if (!apprentiId) {
    return NextResponse.json({ erreur: "Apprenti requis." }, { status: 400 });
  }

  const apprenti = await prisma.apprenti.findUnique({ where: { id: apprentiId } });
  if (!apprenti || !apprenti.actif) {
    return NextResponse.json({ erreur: "Apprenti introuvable." }, { status: 404 });
  }

  const presence = await prisma.presence.upsert({
    where: { apprentiId_date: { apprentiId, date } },
    create: {
      apprentiId,
      date,
      statut,
      heurePointage: statut === "present" ? heureActuelle() : null,
      methode,
    },
    update: {
      statut,
      heurePointage: statut === "present" ? heureActuelle() : null,
      methode,
    },
  });

  return NextResponse.json({ apprenti, presence });
}
