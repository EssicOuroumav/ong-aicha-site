"use client";

import { useActionState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { SaveState } from "@/actions/admin";

/** Formulaire d'admin avec confirmation visible (icône verte) ou erreur (rouge) à côté du bouton. */
export function SaveForm({ action, children, className = "space-y-4", label = "Enregistrer", resetAction, resetLabel, resetConfirm }: {
  action: (prev: SaveState | null, form: FormData) => Promise<SaveState>;
  children: ReactNode; className?: string; label?: string;
  resetAction?: (form: FormData) => void | Promise<void>; resetLabel?: string; resetConfirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
        <button disabled={pending} className="btn btn-primary">{pending ? "Enregistrement…" : label}</button>
        {resetAction && (
          <button formAction={resetAction} formNoValidate onClick={(e) => { if (resetConfirm && !window.confirm(resetConfirm)) e.preventDefault(); }} className="btn btn-outline text-red-700">{resetLabel}</button>
        )}
        <span role="status" aria-live="polite" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${state?.ok ? "text-green-700" : "text-red-700"}`}>{!pending && state && (state.ok ? <CheckCircle2 size={16} aria-hidden /> : <AlertCircle size={16} aria-hidden />)}{pending ? "" : state?.message}</span>
      </div>
    </form>
  );
}
