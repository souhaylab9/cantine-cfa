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
    <aside
      className="no-print fixed inset-y-0 left-0 z-40 flex w-16 flex-col py-5 shadow-[4px_0_20px_rgba(38,20,20,0.15)] md:w-60"
      style={{
        background: "linear-gradient(180deg, var(--accent-fonce), #3d1218)",
      }}
    >
      <div className="mb-8 flex flex-col items-center px-2 md:items-start md:px-4">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-vsm.png"
            alt="VSM Académie"
            className="h-8 w-auto object-contain md:h-16"
          />
        </div>
        <span className="mt-3 h-px w-10 bg-or md:w-16" />
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
                  ? "bg-or text-[#3d1218] shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
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
