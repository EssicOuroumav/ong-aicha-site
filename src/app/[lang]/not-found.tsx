import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="font-display text-7xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-3xl font-bold text-green-800">Page introuvable · Not found · الصفحة غير موجودة</h1>
      <Link href="/" className="btn btn-primary mt-8">← ONG AICHA</Link>
    </div>
  );
}
