import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const motDePasse = process.argv[2];
  if (!motDePasse || motDePasse.length < 6) {
    console.error(
      "Usage: npm run set-admin-password -- <mot-de-passe> (6 caractères minimum)",
    );
    process.exit(1);
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const existant = await prisma.admin.findFirst();

  if (existant) {
    await prisma.admin.update({
      where: { id: existant.id },
      data: { motDePasseHash },
    });
  } else {
    await prisma.admin.create({ data: { motDePasseHash } });
  }

  console.log("Mot de passe administrateur mis à jour.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
