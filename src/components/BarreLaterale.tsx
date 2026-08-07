import Link from "next/link";
import { ClipboardCheck, Users, LineChart, Receipt } from "lucide-react";

const LIENS = [
  { href: "/appel", label: "Appel du jour", icone: ClipboardCheck },
  { href: "/apprentis", label: "Apprentis", icone: Users },
  { href: "/historique", label: "Suivi & export", icone: LineChart },
  { href: "/facturation", label: "Facturation", icone: Receipt },
] as const;

export function BarreLaterale({ section }: { section: string }) {
  return (
    <aside className="no-print fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-bordure bg-carte py-5 md:w-60">
      <div className="mb-6 flex items-center gap-2.5 px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-titre text-sm font-bold text-white">
          C
        </span>
        <span className="hidden font-titre text-sm font-semibold leading-tight text-encre md:inline">
          Cantine
          <br />
          CFA
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2.5">
        {LIENS.map((lien) => {
          const Icone = lien.icone;
          const actif = section === lien.href;
          return (
            <Link
              key={lien.href}
              href={lien.href}
              title={lien.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                actif
                  ? "bg-accent text-white"
                  : "text-encre-claire hover:bg-papier hover:text-encre"
              }`}
            >
              <Icone size={18} className="shrink-0" strokeWidth={2} />
              <span className="hidden md:inline">{lien.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
