import { Loading } from "@/components/Loading";

// Vérification du paiement auprès de PayDunya : l'attente est annoncée (page non indexée, donc sans risque pour le SEO)
export default function LoadingResult() {
  return <Loading label="Vérification du paiement · Checking payment · جارٍ التحقق" />;
}
