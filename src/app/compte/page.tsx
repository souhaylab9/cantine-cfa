import { CoquilleApp } from "@/components/CoquilleApp";
import { MonCompte } from "@/components/MonCompte";

export default function PageCompte() {
  return (
    <CoquilleApp section="/compte" titre="Mon compte" authentifie>
      <MonCompte />
    </CoquilleApp>
  );
}
