"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Menu,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Contestants", href: "#contestants" },
  { label: "How to vote", href: "#how-to-vote" },
  { label: "Leaderboard", href: "#leaderboard" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="page-shell">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#100d16]/90 backdrop-blur-xl">
        <div className="site-container flex h-[76px] items-center justify-between">
          <a href="#home" className="flex items-center gap-3" aria-label="Pagentary home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b56d]/60 bg-[#d8b56d]/10 text-[#f1d99d]">
              <Crown size={20} strokeWidth={1.6} />
            </span>
            <span>
              <span className="block font-serif text-xl font-semibold tracking-[0.12em] text-[#f5e9d0]">
                PAGENTARY
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.28em] text-[#b9a47b]">
                THE OFFICIAL VOTING PORTAL
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-[#c9c0ce] transition hover:text-[#f1d99d]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#contestants" className="gold-button hidden min-h-10 md:inline-flex">
            Vote now <ArrowRight size={14} />
          </a>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/15 text-white md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#17121e] px-4 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="site-container flex flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-3 py-3 text-sm text-[#e6ddeb] hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <a href="#contestants" onClick={() => setMenuOpen(false)} className="gold-button mt-2">
                Explore contestants <ArrowRight size={14} />
              </a>
            </div>
          </nav>
        )}
      </header>

      <section id="home" className="relative isolate">
        <div className="absolute inset-0 -z-10 hero-glow" />
        <div className="site-container grid min-h-[610px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="eyebrow">A celebration of excellence</div>
            <h1 className="mt-7 font-serif text-5xl leading-[1.08] font-medium tracking-[-0.035em] text-[#fbf6ed] sm:text-6xl lg:text-[76px]">
              The crown
              <br />
              <span className="italic gold-text">awaits.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#c4b9cb] sm:text-lg">
              Discover remarkable contestants, celebrate confidence and
              individuality, and support the person who inspires you.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contestants" className="gold-button">
                Meet the contestants <ArrowRight size={15} />
              </a>
              <a href="#how-to-vote" className="outline-button">
                How voting works
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-[#b9aebe]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#d8b56d]" /> Secure payments
              </span>
              <span className="inline-flex items-center gap-2">
                <Trophy size={16} className="text-[#d8b56d]" /> Live results
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center">
            <div className="hero-ornament relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-t-[48%] rounded-b-[8px] bg-[radial-gradient(ellipse_at_50%_38%,#4b3454_0%,#241b2d_48%,#17121e_78%)]">
              <div className="absolute inset-5 rounded-t-[48%] rounded-b-[4px] border border-[#e4c987]/25" />
              <div className="absolute inset-9 rounded-t-[48%] rounded-b-[4px] border border-[#e4c987]/10" />
              <div className="absolute top-[17%] h-48 w-48 rounded-full bg-[#d8b56d]/10 blur-3xl" />
              <div className="relative flex flex-col items-center px-8 text-center">
                <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#e6ca88]/40 bg-[#d8b56d]/10 text-[#f1d99d] shadow-[0_0_70px_rgba(216,181,109,0.12)]">
                  <Crown size={52} strokeWidth={1} />
                </div>
                <Sparkles size={17} className="mb-4 text-[#d8b56d]" />
                <p className="font-serif text-3xl leading-tight text-[#f5e9d0] sm:text-4xl">
                  Your Pageant
                  <br />
                  <span className="italic text-[#e0c17f]">Title Here</span>
                </p>
                <div className="my-6 h-px w-20 bg-[#d8b56d]/60" />
                <p className="max-w-[230px] text-[10px] leading-6 tracking-[0.2em] text-[#c6b7c9] uppercase">
                  Beauty · Confidence · Purpose
                </p>
                <span className="mt-8 rounded-full border border-[#e6ca88]/25 px-4 py-2 text-[9px] tracking-[0.2em] text-[#e5d1a3] uppercase">
                  Competition branding placeholder
                </span>
              </div>
              <div className="absolute bottom-8 left-0 right-0 text-center text-[9px] tracking-[0.3em] text-[#b9a47b]/80 uppercase">
                An unforgettable journey begins
              </div>
            </div>
            <div className="absolute -right-3 top-[18%] hidden rounded-full border border-[#d8b56d]/25 bg-[#17121e]/90 p-4 text-[#e8cb8a] shadow-xl sm:block">
              <Crown size={21} />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-full border border-[#d8b56d]/25 bg-[#17121e]/90 p-4 text-[#e8cb8a] shadow-xl sm:block">
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      </section>

      <div className="section-line" />

      <section id="contestants" className="site-container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">The faces of the competition</div>
          <h2 className="mt-5 font-serif text-4xl font-medium text-[#f8f1e7] sm:text-5xl">
            Meet the <span className="italic gold-text">contestants</span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#b9aebe]">
            Get to know the people behind the aspirations. Contestant profiles
            and official photographs will appear here when published by the organiser.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-dashed border-[#d8b56d]/30 bg-[#191421]/65 px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b56d]/25 bg-[#d8b56d]/10 text-[#e6c77f]">
            <Crown size={25} strokeWidth={1.3} />
          </div>
          <h3 className="mt-5 font-serif text-2xl text-[#f5e9d0]">Contestants will be revealed soon</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#b9aebe]">
            The organiser has not published contestant profiles yet. Please
            check back for official contestant details and voting availability.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#d8c9ac] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8b56d]" />
            Awaiting contestant publication
          </span>
        </div>
      </section>

      <section id="how-to-vote" className="border-y border-white/10 bg-[#17121e] py-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Simple, secure and transparent</div>
            <h2 className="mt-5 font-serif text-4xl text-[#f8f1e7] sm:text-5xl">
              How to <span className="italic gold-text">vote</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#b9aebe]">
              Supporting your favourite contestant will be straightforward.
              Votes will be allocated after successful payment verification.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Choose your contestant",
                description: "Explore the published profiles and select the contestant you want to support.",
              },
              {
                number: "02",
                title: "Choose your votes",
                description: "Enter the amount you wish to pay. The current vote price determines your vote quantity.",
              },
              {
                number: "03",
                title: "Pay securely",
                description: "Complete payment through Flutterwave. Votes are credited only after server-side verification.",
              },
            ].map((step) => (
              <article key={step.number} className="rounded-lg border border-white/10 bg-[#100d16] p-7">
                <span className="font-serif text-4xl italic text-[#d8b56d]">{step.number}</span>
                <h3 className="mt-6 text-lg font-semibold text-[#f5e9d0]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#b9aebe]">{step.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-md border border-[#d8b56d]/20 bg-[#d8b56d]/5 p-4 text-xs leading-6 text-[#d4c5a6]">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#e2c47e]" />
            Payments will be processed by Flutterwave. A payment return page alone does not confirm a vote; the platform will verify each transaction before allocating votes.
          </div>
        </div>
      </section>

      <section id="leaderboard" className="site-container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">The race for the crown</div>
          <h2 className="mt-5 font-serif text-4xl text-[#f8f1e7] sm:text-5xl">
            Live <span className="italic gold-text">leaderboard</span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#b9aebe]">
            Follow the standings as verified votes are recorded during the competition.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-white/10 bg-[#191421] p-8 text-center">
          <Trophy size={34} className="mx-auto text-[#d8b56d]" strokeWidth={1.2} />
          <p className="mt-4 font-serif text-2xl text-[#f5e9d0]">Leaderboard coming soon</p>
          <p className="mt-2 text-sm text-[#b9aebe]">
            Verified contestant rankings will be displayed here when voting is configured and opened.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[linear-gradient(120deg,#21182b,#15111c)] py-16">
        <div className="site-container flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div>
            <div className="eyebrow">The journey starts here</div>
            <h2 className="mt-4 font-serif text-3xl text-[#f8f1e7] sm:text-4xl">
              Every vote tells a story.
            </h2>
            <p className="mt-3 text-sm text-[#b9aebe]">
              Stay tuned for contestant announcements and voting updates.
            </p>
          </div>
          <a href="#contestants" className="gold-button">
            Explore contestants <ArrowRight size={15} />
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0b0910] py-9">
        <div className="site-container flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <a href="#home" className="flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-[#ead9b5]">
            <Crown size={17} className="text-[#d8b56d]" /> PAGENTARY
          </a>
          <p className="text-xs text-[#82798a]">
            © {new Date().getFullYear()} Pagentary. All rights reserved.
          </p>
          <a href="#home" className="inline-flex items-center gap-2 text-xs text-[#b9aebe] transition hover:text-[#f1d99d]">
            Back to top <ChevronDown size={14} className="rotate-180" />
          </a>
        </div>
      </footer>
    </main>
  );
}
