import { AuthForm } from "@/components/whatsboard-public/auth-placeholder-form";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("pages.login.title"),
    description: t("pages.login.description"),
  };
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] items-center justify-center px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-14rem)] lg:justify-start lg:px-8 lg:py-14">
      <AuthForm mode="login" />
    </main>
  );
}
