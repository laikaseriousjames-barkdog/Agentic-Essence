import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in — Agentic Essence" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;
  return <AuthForm mode="login" error={error} message={message} next={next} />;
}
