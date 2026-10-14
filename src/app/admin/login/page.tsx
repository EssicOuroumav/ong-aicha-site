import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";

async function login(formData: FormData) {
  "use server";
  const ip = await clientIp();
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!(await rateLimit(`login:${ip}`, 10, 10 * 60 * 1000)) || !(await rateLimit(`login-user:${email}`, 6, 10 * 60 * 1000))) {
    redirect("/admin/login?error=rate");
  }
  try {
    await signIn("credentials", { email, password: String(formData.get("password") ?? ""), redirectTo: "/admin" });
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login?error=credentials");
    throw e;
  }
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if ((await auth())?.user) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <Image src="/logo.png" alt="ONG AICHA" width={96} height={96} className="mx-auto h-24 w-24 object-contain" />
          <h1 className="mt-2 text-xl font-bold text-green-800">Espace administrateur</h1>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {error === "rate" ? "Trop de tentatives. Réessayez dans quelques minutes." : "E-mail ou mot de passe incorrect."}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <button className="btn btn-primary w-full" type="submit">Se connecter</button>
      </form>
    </main>
  );
}
