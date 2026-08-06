import { NextRequest, NextResponse } from "next/server";
import { creerFactureBrouillon } from "@/lib/pennylane";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const mois = String(body.mois ?? "");

  if (!/^\d{4}-\d{2}$/.test(mois)) {
    return NextResponse.json({ erreur: "Mois invalide (format attendu YYYY-MM)." }, { status: 400 });
  }

  try {
    const resultat = await creerFactureBrouillon(mois);
    return NextResponse.json(resultat);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
