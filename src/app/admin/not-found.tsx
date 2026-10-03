import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-32 text-center">
      <p className="font-display text-8xl font-extrabold text-green-700" aria-hidden>404</p>
      <h1 className="mt-4 text-3xl text-green-950">Page introuvable</h1>
      <p className="mt-3 text-muted">Cette page de l'espace administrateur n'existe pas.</p>
      <Link href="/admin" className="btn btn-primary btn-caps mt-8">Retour au tableau de bord</Link>
    </main>
  );
}
