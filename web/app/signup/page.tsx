import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create account — Agentic Essence" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return <AuthForm mode="signup" error={error} next={next} />;
}
