export function Loading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-green-800">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700 motion-reduce:animate-none" aria-hidden />
      <span className="text-sm font-semibold uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}
