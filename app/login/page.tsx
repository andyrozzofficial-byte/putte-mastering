import { LoginForm } from "@/components/auth/login-form";
import { createStudioServerClient } from "@/lib/supabase/studio-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Studio",
  description: "Admin sign-in for First Listen Mastering Studio.",
};

function safeStudioRedirect(nextParam: string | undefined): string {
  if (
    nextParam &&
    nextParam.startsWith("/studio") &&
    !nextParam.startsWith("//")
  ) {
    return nextParam;
  }
  return "/studio";
}

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createStudioServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/studio");
  }

  const { next: nextParam } = await searchParams;
  const redirectTo = safeStudioRedirect(nextParam);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-black"
          >
            First Listen Mastering
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-center text-xl font-semibold tracking-tight text-black sm:text-2xl">
            Sign in
          </h1>
          <p className="mt-2 text-center text-[13px] text-gray-500 sm:text-sm">
            Studio — admins only
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </main>
    </div>
  );
}
