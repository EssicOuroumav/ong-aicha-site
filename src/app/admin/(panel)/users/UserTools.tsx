"use client";

import { useActionState } from "react";
import { createUser, resetUserPassword } from "@/actions/admin";

type S = { error?: string; password?: string };

export function UserTools({ mode, id, roles }: { mode: "create" | "reset"; id?: string; roles: string[][] }) {
  const [state, action, pending] = useActionState<S, FormData>(mode === "create" ? createUser : resetUserPassword, {});
  if (mode === "reset") {
    return (
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button disabled={pending} className="text-xs font-semibold text-green-700 underline">Réinitialiser le mot de passe</button>
        {state.password && <p role="status" className="mt-1 rounded bg-amber-50 p-2 text-xs">Mot de passe temporaire (à transmettre en privé) : <b className="select-all">{state.password}</b></p>}
      </form>
    );
  }
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <input name="name" placeholder="Nom" required className="field" aria-label="Nom" />
      <input name="email" type="email" placeholder="E-mail" required className="field" aria-label="E-mail" />
      <select name="role" className="field" aria-label="Rôle">{roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <button disabled={pending} className="btn btn-primary">Ajouter</button>
      {state.error && <p role="alert" className="text-sm text-red-700 sm:col-span-4">{state.error}</p>}
      {state.password && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm sm:col-span-4">Compte créé. Mot de passe temporaire (à transmettre en privé, à changer à la 1re connexion) : <b className="select-all">{state.password}</b></p>}
    </form>
  );
}
