"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { sendSentryTest, type SaveState } from "@/actions/admin";

export function SentryTest({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<SaveState | null>(() => sendSentryTest(), null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${configured ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{configured ? "Sentry actif" : "Sentry non configuré"}</span>
      <button disabled={pending} className="btn btn-outline !py-2 text-sm text-green-800">{pending ? "Envoi…" : "Envoyer un test à Sentry"}</button>
      <span role="status" aria-live="polite" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${state?.ok ? "text-green-700" : "text-red-700"}`}>{!pending && state && (state.ok ? <CheckCircle2 size={16} aria-hidden /> : <AlertCircle size={16} aria-hidden />)}{pending ? "" : state?.message}</span>
    </form>
  );
}
