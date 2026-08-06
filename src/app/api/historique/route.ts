import { NextRequest, NextResponse } from "next/server";
import { obtenirResumeMois } from "@/lib/historique";
import { aujourdHui } from "@/lib/date";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mois = searchParams.get("mois") ?? aujourdHui().slice(0, 7);
  const apprentiId = searchParams.get("apprentiId") || undefined;

  const resume = await obtenirResumeMois(mois, apprentiId);
  return NextResponse.json(resume);
}
