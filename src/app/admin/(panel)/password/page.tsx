import { requireUser } from "@/lib/guard";
import { PasswordForm } from "./PasswordForm";
import { Title } from "@/components/admin/ui";

export default async function PasswordPage() {
  const user = await requireUser();
  return (
    <>
      <Title>Changer mon mot de passe</Title>
      {user.mustChangePw && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-amber-900">Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.</p>}
      <PasswordForm />
    </>
  );
}
