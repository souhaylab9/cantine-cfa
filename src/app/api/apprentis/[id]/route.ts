import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const data: {
    nom?: string;
    prenom?: string;
    groupe?: string | null;
    actif?: boolean;
  } = {};

  if (typeof body.nom === "string") data.nom = body.nom.trim();
  if (typeof body.prenom === "string") data.prenom = body.prenom.trim();
  if ("groupe" in body) data.groupe = body.groupe ? String(body.groupe).trim() : null;
  if (typeof body.actif === "boolean") data.actif = body.actif;

  const apprenti = await prisma.apprenti.update({ where: { id }, data });
  return NextResponse.json(apprenti);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.apprenti.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
