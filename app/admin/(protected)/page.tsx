import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowUpRight, Crown, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <main className="page-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#100d16]/90">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b56d]/60 bg-[#d8b56d]/10 text-[#f1d99d]"><Crown size={19} /></span>
            <span className="font-serif text-lg tracking-[.12em] text-[#f5e9d0]">PAGENTARY <span className="font-sans text-[9px] tracking-[.2em] text-[#b9a47b]">ADMIN</span></span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-2 rounded border border-white/10 px-4 py-2 text-xs text-[#c9c0ce] transition hover:border-[#d8b56d]/40 hover:text-white">
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="site-container py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Control centre</p>
            <h1 className="mt-4 font-serif text-4xl text-[#f8f1e7]">Dashboard</h1>
            <p className="mt-2 text-sm text-[#b9aebe]">Your competition management workspace.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[10px] font-semibold tracking-wide text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> SUPER ADMIN SESSION
          </span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { title: "Contestants", detail: "Register and manage contestant profiles.", icon: Users, href: "/admin/contestants", ready: true },
            { title: "Competition", detail: "Set competition details and voting dates.", icon: Crown, href: "#coming-soon" },
            { title: "Voting settings", detail: "Configure pricing, limits and results visibility.", icon: Settings, href: "#coming-soon" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="rounded-xl border border-white/10 bg-[#191421] p-6 transition hover:border-[#d8b56d]/35">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d8b56d]/20 bg-[#d8b56d]/10 text-[#e8cb8a]"><Icon size={20} /></div>
                <h2 className="mt-6 text-lg font-semibold text-[#f5e9d0]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#b9aebe]">{item.detail}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#e1c27e]">{item.ready ? "Open workspace" : "Coming next"} <ArrowUpRight size={14} /></span>
              </Link>
            );
          })}
        </div>

        <section id="coming-soon" className="mt-8 rounded-xl border border-dashed border-[#d8b56d]/25 bg-[#191421]/60 p-7">
          <div className="flex items-center gap-3 text-[#e8cb8a]"><LayoutDashboard size={19} /><h2 className="font-semibold">Platform setup</h2></div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b9aebe]">
            Administrator authentication is connected to Supabase, and contestant management is available now. Competition editing, voting settings, payment verification and the live voting dashboard are being developed in stages.
          </p>
        </section>
      </div>
    </main>
  );
}
