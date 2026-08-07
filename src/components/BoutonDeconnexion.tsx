"use client";

import { useRouter } from "next/navigation";

export function BoutonDeconnexion() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/appel");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="text-sm text-encre-claire underline decoration-encre-claire/30 underline-offset-4 hover:text-encre"
    >
      Déconnexion
    </button>
  );
}
