export function versCsv(
  lignes: Record<string, string>[],
  colonnes: { cle: string; libelle: string }[],
): string {
  const echapper = (v: string) => {
    if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };

  const entetes = colonnes.map((c) => echapper(c.libelle)).join(";");
  const corps = lignes.map((ligne) =>
    colonnes.map((c) => echapper(String(ligne[c.cle] ?? ""))).join(";"),
  );

  return "﻿" + [entetes, ...corps].join("\r\n");
}
