"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f3ec] px-4 py-12 text-[#171614]">
          <div className="w-full max-w-md rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm sm:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-3 w-24 rounded bg-[#e7e0d7]" />
              <div className="h-9 w-40 rounded bg-[#efe9e1]" />
              <div className="h-11 rounded bg-[#efe9e1]" />
              <div className="h-11 rounded bg-[#efe9e1]" />
              <div className="h-12 rounded bg-[#e7e0d7]" />
            </div>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const accessDeniedMessage =
    searchParams.get("error") ===
    "dashboard_access_denied"
      ? "Your account does not have dashboard access."
      : "";

  const messageToDisplay =
    accessDeniedMessage || errorMessage;

  useEffect(() => {
    let isCurrent = true;

    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isCurrent || !user) {
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (
        profile &&
        ["owner", "admin"].includes(
          profile.role
        )
      ) {
        router.replace("/dashboard");
      }
    };

    checkSession();

    return () => {
      isCurrent = false;
    };
  }, [router]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const {
      data,
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (signInError || !data.user) {
      setErrorMessage(
        "Unable to sign in. Please check your credentials."
      );
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      !["owner", "admin"].includes(
        profile.role
      )
    ) {
      await supabase.auth.signOut();
      setErrorMessage(
        "Your account does not have dashboard access."
      );
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ec] px-4 py-12 text-[#171614]">
      <div className="w-full max-w-md rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">
            Utsav Spaces & Banquets
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">
            Business access
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#183d34]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              placeholder="owner@utsavspaces.com"
              className="w-full rounded-lg border border-[#d8d0c1] bg-[#f9f7f3] px-4 py-3 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfe9e0] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#183d34]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[#d8d0c1] bg-[#f9f7f3] px-4 py-3 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfe9e0] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {messageToDisplay && (
            <div
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {messageToDisplay}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#183d34] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#122d2a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
