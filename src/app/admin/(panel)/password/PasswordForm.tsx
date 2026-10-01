"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/admin";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as { error?: string });
  return (
    <form action={action} className="max-w-md space-y-4 rounded-2xl border border-line bg-white p-6">
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <div><label htmlFor="current" className="mb-1 block text-sm font-semibold">Mot de passe actuel</label><input id="current" name="current" type="password" required autoComplete="current-password" className="field" /></div>
      <div><label htmlFor="next" className="mb-1 block text-sm font-semibold">Nouveau mot de passe (10 caractères min.)</label><input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
      <div><label htmlFor="confirm" className="mb-1 block text-sm font-semibold">Confirmer</label><input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="field" /></div>
      <button disabled={pending} className="btn btn-primary">Enregistrer</button>
    </form>
  );
}
