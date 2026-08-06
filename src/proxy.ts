import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const CHEMINS_PROTEGES = ["/apprentis", "/badges", "/historique"];
const API_PROTEGES = ["/api/apprentis", "/api/export", "/api/historique", "/api/facturation"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const estPageProtegee = CHEMINS_PROTEGES.some(
    (chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`),
  );
  const estApiProtegee = API_PROTEGES.some(
    (chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`),
  );

  if (!estPageProtegee && !estApiProtegee) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (session.authentifie) {
    return response;
  }

  if (estApiProtegee) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("suite", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/apprentis/:path*", "/badges/:path*", "/historique/:path*", "/api/:path*"],
};
