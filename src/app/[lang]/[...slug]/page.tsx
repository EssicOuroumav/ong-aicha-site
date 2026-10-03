import { notFound } from "next/navigation";

// Toute adresse inconnue sous /fr, /en, /ar affiche la page 404 personnalisée (dans la mise en page du site).
export default function CatchAll() {
  notFound();
}
