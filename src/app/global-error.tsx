"use client";

import { useEffect } from "react";

// Dernier filet de sécurité : s'affiche si l'application entière plante (layout racine compris).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch(() => {});
    fetch("/api/log-error", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: error.message, digest: error.digest, path: window.location.pathname }) }).catch(() => {});
  }, [error]);
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fcfcf9", color: "#101c12", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div role="alert" style={{ maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 16, background: "#1e7b35", color: "#fff", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
          <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Une erreur est survenue · An error occurred · حدث خطأ</h1>
          <p style={{ color: "#566a5e" }}>Le site a rencontré un problème. L'équipe technique en est informée.</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#1e7b35", color: "#fff", border: 0, borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>Réessayer · Try again · إعادة المحاولة</button>
        </div>
      </body>
    </html>
  );
}
