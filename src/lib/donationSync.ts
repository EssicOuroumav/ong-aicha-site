/** Fenêtre de rattrapage des dons « en attente » : on laisse d'abord 30 minutes à l'IPN et à la page de retour, puis on abandonne après 30 jours. */
export const MIN_AGE_MIN = 30;
export const MAX_AGE_DAYS = 30;
export const MAX_PER_RUN = 50;

export function donationWindow(now: Date = new Date()) {
  return { olderThan: new Date(now.getTime() - MIN_AGE_MIN * 60_000), newerThan: new Date(now.getTime() - MAX_AGE_DAYS * 86_400_000) };
}
