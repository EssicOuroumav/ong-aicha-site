"use client";

import { useState } from "react";

type Loc = { fr: string; en: string; ar: string };
export type FieldDef = { name: string; label: string; kind: "loc" | "text" | "image"; multiline?: boolean };
type Item = Record<string, string | Loc>;

const empty = (fields: FieldDef[]): Item => Object.fromEntries(fields.map((f) => [f.name, f.kind === "loc" ? { fr: "", en: "", ar: "" } : ""]));

function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true); setErr("");
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec");
      onChange(data.url);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-14 w-20 rounded-lg bg-white object-contain" />}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/partners/… ou https://…" className="field min-w-0 flex-1" />
        <label className="btn btn-outline cursor-pointer !py-2 text-sm text-green-700">
          {busy ? "Envoi…" : "Téléverser"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      {err && <p role="alert" className="mt-1 text-sm text-red-700">{err}</p>}
    </div>
  );
}

export function ListEditor({ listKey, fields, initial, saveAction, resetAction, itemLabel }: {
  listKey: string; fields: FieldDef[]; initial: Item[]; itemLabel: string;
  saveAction: (form: FormData) => void | Promise<void>; resetAction: (form: FormData) => void | Promise<void>;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const set = (i: number, name: string, value: string | Loc) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [name]: value } : it)));
  const move = (i: number, d: number) => setItems((arr) => {
    const j = i + d; if (j < 0 || j >= arr.length) return arr;
    const copy = [...arr]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  });

  return (
    <form action={saveAction} className="space-y-4">
      <input type="hidden" name="key" value={listKey} />
      <input type="hidden" name="data" value={JSON.stringify(items)} />
      {items.map((it, i) => (
        <fieldset key={i} className="space-y-3 rounded-xl border border-line bg-green-50/40 p-4">
          <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-green-900">
            {itemLabel} {i + 1}
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="rounded border border-line px-1.5 disabled:opacity-30">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre" className="rounded border border-line px-1.5 disabled:opacity-30">↓</button>
            <button type="button" onClick={() => { if (window.confirm("Supprimer cet élément ?")) setItems((arr) => arr.filter((_, idx) => idx !== i)); }} className="rounded border border-red-200 px-2 text-xs text-red-700">Supprimer</button>
          </legend>
          {fields.map((f) =>
            f.kind === "image" ? (
              <ImageInput key={f.name} label={f.label} value={(it[f.name] as string) ?? ""} onChange={(v) => set(i, f.name, v)} />
            ) : f.kind === "text" ? (
              <div key={f.name}>
                <label className="text-xs text-muted">{f.label}</label>
                <input value={(it[f.name] as string) ?? ""} onChange={(e) => set(i, f.name, e.target.value)} className="field max-w-xs" />
              </div>
            ) : (
              <div key={f.name} className="space-y-1">
                <p className="text-xs font-semibold text-green-900">{f.label}</p>
                {(["fr", "en", "ar"] as const).map((l) => {
                  const val = (it[f.name] as Loc)?.[l] ?? "";
                  const common = { value: val, dir: l === "ar" ? ("rtl" as const) : ("ltr" as const), "aria-label": `${f.label} (${l})`, className: "field", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(i, f.name, { ...(it[f.name] as Loc), [l]: e.target.value }) };
                  return f.multiline ? <textarea key={l} rows={3} {...common} placeholder={l.toUpperCase()} /> : <input key={l} {...common} placeholder={l.toUpperCase()} />;
                })}
              </div>
            ),
          )}
        </fieldset>
      ))}
      <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl bg-white/90 p-3 shadow backdrop-blur">
        <button type="button" onClick={() => setItems((arr) => [...arr, empty(fields)])} className="btn btn-outline text-green-700">+ Ajouter</button>
        <button className="btn btn-primary">Enregistrer</button>
        <button formAction={resetAction} formNoValidate onClick={(e) => { if (!window.confirm("Revenir à la liste d'origine ? Vos modifications seront perdues.")) e.preventDefault(); }} className="btn btn-outline text-red-700">Revenir à la liste d'origine</button>
      </div>
    </form>
  );
}
