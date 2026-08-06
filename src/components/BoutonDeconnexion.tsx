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
      className="text-sm text-neutre underline hover:text-absent"
    >
      Déconnexion
    </button>
  );
}
