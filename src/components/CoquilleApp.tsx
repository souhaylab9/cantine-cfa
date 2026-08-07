import { BarreLaterale } from "./BarreLaterale";
import { BarreSuperieure } from "./BarreSuperieure";

export function CoquilleApp({
  section,
  titre,
  authentifie,
  children,
}: {
  section: string;
  titre: string;
  authentifie: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BarreLaterale section={section} />
      <div className="ml-16 flex min-h-screen flex-col md:ml-60">
        <BarreSuperieure titre={titre} authentifie={authentifie} />
        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
