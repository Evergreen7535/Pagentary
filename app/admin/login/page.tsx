"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage("We could not sign you in. Check your email and password.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Administrator sign-in is not configured yet. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-xs text-[#b9aebe] transition hover:text-[#f1d99d]">
          <ArrowLeft size={14} /> Back to public website
        </a>
        <section className="rounded-xl border border-[#d8b56d]/20 bg-[#191421] p-7 shadow-2xl sm:p-9">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b56d]/35 bg-[#d8b56d]/10 text-[#f1d99d]">
            <Crown size={27} strokeWidth={1.4} />
          </div>
          <p className="eyebrow">Restricted access</p>
          <h1 className="mt-4 font-serif text-3xl text-[#f8f1e7]">Administrator sign in</h1>
          <p className="mt-3 text-sm leading-6 text-[#b9aebe]">
            Sign in with the authorised Pagentary administrator account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#e7dcc8]">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-md border border-white/10 bg-[#100d16] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d8b56d]/60"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#e7dcc8]">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full w-full rounded-md border border-white/10 bg-[#100d16] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d8b56d]/60"
                placeholder="Enter your password"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-200">{errorMessage}</p>
            )}

            <button type="submit" disabled={loading} className="gold-button w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {loading ? "Signing in..." : "Sign in securely"}
            </button>
          </form>
          <p className="mt-6 text-center text-[11px] leading-5 text-[#82798a]">
            Access is limited to the single administrator approved for this platform.
          </p>
        </section>
      </div>
    </main>
  );
}
