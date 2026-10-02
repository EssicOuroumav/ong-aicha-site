// Intégration PayDunya (Orange Money, MTN, Moov, Wave, cartes).
// Docs : https://developers.paydunya.com — mode "test" = sandbox.
const base = () =>
  process.env.PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

const authHeaders = () => ({
  "Content-Type": "application/json",
  "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY ?? "",
  "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY ?? "",
  "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN ?? "",
});

export const paydunyaConfigured = () =>
  Boolean(process.env.PAYDUNYA_MASTER_KEY && process.env.PAYDUNYA_PRIVATE_KEY && process.env.PAYDUNYA_TOKEN);

export async function createInvoice(opts: {
  amount: number;
  description: string;
  reference: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
}): Promise<{ token: string; url: string }> {
  const res = await fetch(`${base()}/checkout-invoice/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      invoice: { total_amount: opts.amount, description: opts.description },
      store: { name: "ONG AICHA", tagline: "Soutenir pour soulager", website_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ongaicha.org" },
      actions: { cancel_url: opts.cancelUrl, return_url: opts.returnUrl, callback_url: opts.callbackUrl },
      custom_data: { reference: opts.reference },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json().catch(() => null);
  if (!data || data.response_code !== "00") {
    throw new Error(`PayDunya: ${data?.response_text ?? res.status}`);
  }
  return { token: data.token, url: data.response_text };
}

/** Vérifie le statut réel auprès de PayDunya (source de vérité, jamais le navigateur). */
export async function confirmInvoice(token: string): Promise<{ status: string; reference?: string; amount?: number }> {
  const res = await fetch(`${base()}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
    headers: authHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json().catch(() => null);
  if (!data || data.response_code !== "00") throw new Error("PayDunya: confirmation impossible");
  return {
    status: data.status,
    reference: data.custom_data?.reference,
    amount: Number(data.invoice?.total_amount),
  };
}
