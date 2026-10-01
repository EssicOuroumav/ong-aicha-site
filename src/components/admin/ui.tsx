import type { ReactNode } from "react";

export function Title({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-green-900">{children}</h1>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-green-50 text-start text-xs uppercase tracking-wide text-green-900">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 text-start font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

const tones: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800", APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800", NEW: "bg-blue-100 text-blue-800", IN_PROGRESS: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800", CANCELLED: "bg-stone-200 text-stone-700", REJECTED: "bg-red-100 text-red-800",
};
export const statusLabels: Record<string, string> = {
  COMPLETED: "Réussi", PENDING: "En attente", FAILED: "Échoué", CANCELLED: "Annulé",
  NEW: "Nouveau", IN_PROGRESS: "En cours", APPROVED: "Validé", REJECTED: "Refusé",
};
export function Badge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] ?? "bg-stone-100"}`}>{statusLabels[status] ?? status}</span>;
}

export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
export const dt = (d: Date) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);

export function StatusSelect({ name = "status", value, options }: { name?: string; value: string; options: string[] }) {
  return (
    <select name={name} defaultValue={value} className="rounded-lg border border-line bg-white px-2 py-1 text-sm">
      {options.map((o) => <option key={o} value={o}>{statusLabels[o]}</option>)}
    </select>
  );
}

const langs = [["fr", "Français"], ["en", "English"], ["ar", "العربية"]] as const;

export function TrilingualField({ name, label, value, rows = 0 }: { name: string; label: string; value?: unknown; rows?: number }) {
  const v = (value ?? {}) as Record<string, string>;
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold text-green-900">{label}</legend>
      {langs.map(([code, lname]) => (
        <div key={code}>
          <label htmlFor={`${name}_${code}`} className="text-xs text-muted">{lname}</label>
          {rows ? (
            <textarea id={`${name}_${code}`} name={`${name}_${code}`} rows={rows} defaultValue={v[code] ?? ""} dir={code === "ar" ? "rtl" : "ltr"} className="field" />
          ) : (
            <input id={`${name}_${code}`} name={`${name}_${code}`} defaultValue={v[code] ?? ""} dir={code === "ar" ? "rtl" : "ltr"} className="field" />
          )}
        </div>
      ))}
    </fieldset>
  );
}
