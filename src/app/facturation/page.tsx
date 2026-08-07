import { CoquilleApp } from "@/components/CoquilleApp";
import { FacturationPennylane } from "@/components/FacturationPennylane";
import { aujourdHui } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function PageFacturation() {
  const moisCourant = aujourdHui().slice(0, 7);

  return (
    <CoquilleApp section="/facturation" titre="Facturation" authentifie>
      <FacturationPennylane moisInitial={moisCourant} />
    </CoquilleApp>
  );
}
