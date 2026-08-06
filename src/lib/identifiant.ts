import { prisma } from "./db";

export async function genererIdentifiant(): Promise<string> {
  const annee = new Date().getFullYear();
  const prefixe = `CFA-${annee}-`;

  const dernier = await prisma.apprenti.findFirst({
    where: { identifiant: { startsWith: prefixe } },
    orderBy: { identifiant: "desc" },
  });

  const dernierNumero = dernier
    ? parseInt(dernier.identifiant.slice(prefixe.length), 10)
    : 0;
  const prochainNumero = dernierNumero + 1;

  return `${prefixe}${String(prochainNumero).padStart(4, "0")}`;
}
