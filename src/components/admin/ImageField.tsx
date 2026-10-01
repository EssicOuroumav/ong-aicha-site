"use client";

import { useState } from "react";

export function ImageField({ name, label, initial }: { name: string; label: string; initial?: string | null }) {
  const [url, setUrl] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setBusy(true); setErr("");
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec");
      setUrl(data.url);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-semibold text-green-900">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-20 w-28 rounded-lg object-cover" />}
        <input id={name} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… ou /images/…" className="field min-w-0 flex-1" />
        <label className="btn btn-outline cursor-pointer !py-2 text-sm text-green-700">
          {busy ? "Envoi…" : "Téléverser"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      {err && <p role="alert" className="mt-1 text-sm text-red-700">{err}</p>}
    </div>
  );
}
