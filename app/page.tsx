import { createClient } from "@/lib/supabase/server";
import { Crown, ArrowRight, Trophy, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Contestant = {
  id: string;
  contestant_number: string | null;
  full_name: string;
  stage_name: string | null;
  biography: string | null;
  photo_path: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: competition } = await supabase
    .from("competitions")
    .select("id,name,description")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let contestants: Contestant[] = [];
  if (competition) {
    const { data } = await supabase
      .from("contestants")
      .select("id,contestant_number,full_name,stage_name,biography,photo_path")
      .eq("competition_id", competition.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    contestants = (data ?? []) as Contestant[];
  }

  const contestantCards = contestants.map((contestant) => ({
    ...contestant,
    photoUrl: contestant.photo_path
      ? supabase.storage.from("contestant-photos").getPublicUrl(contestant.photo_path).data.publicUrl
      : null,
  }));

  return (
    <main className="page-shell min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#100d16]/90 backdrop-blur-xl">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-3" aria-label="Pagentary home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b56d]/60 bg-[#d8b56d]/10 text-[#f1d99d]"><Crown size={20} /></span>
            <span><span className="block font-serif text-xl font-semibold tracking-[0.12em] text-[#f5e9d0]">PAGENTARY</span><span className="block text-[9px] font-semibold tracking-[0.28em] text-[#b9a47b]">THE OFFICIAL VOTING PORTAL</span></span>
          </a>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-xs text-[#c9c0ce] sm:gap-7" aria-label="Main navigation">
            <a href="#home" className="hover:text-[#f1d99d]">Home</a>
            <a href="#contestants" className="hover:text-[#f1d99d]">Contestants</a>
            <a href="#how-to-vote" className="hover:text-[#f1d99d]">How to vote</a>
            <a href="#leaderboard" className="hover:text-[#f1d99d]">Leaderboard</a>
          </nav>
        </div>
      </header>

      <section id="home" className="relative isolate">
        <div className="absolute inset-0 -z-10 hero-glow" />
        <div className="site-container grid min-h-[520px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="eyebrow">A celebration of excellence</div>
            <h1 className="mt-7 font-serif text-5xl leading-[1.08] font-medium tracking-[-0.035em] text-[#fbf6ed] sm:text-6xl lg:text-[76px]">The crown<br /><span className="italic gold-text">awaits.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#c4b9cb] sm:text-lg">Discover remarkable contestants, celebrate confidence and individuality, and support the person who inspires you.</p>
            {competition && <p className="mt-5 text-sm font-semibold tracking-wide text-[#e5c77f]">{competition.name}</p>}
            <div className="mt-9 flex flex-wrap gap-3"><a href="#contestants" className="gold-button">Meet the contestants <ArrowRight size={15} /></a><a href="#how-to-vote" className="outline-button">How voting works</a></div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-[#b9aebe]"><span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#d8b56d]" /> Secure payments</span><span className="inline-flex items-center gap-2"><Trophy size={16} className="text-[#d8b56d]" /> Live results</span></div>
          </div>
          <div className="hero-ornament relative mx-auto flex aspect-[4/5] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-t-[48%] rounded-b-lg bg-[radial-gradient(ellipse_at_50%_38%,#4b3454_0%,#241b2d_48%,#17121e_78%)]">
            <div className="absolute inset-5 rounded-t-[48%] border border-[#e4c987]/25" />
            <div className="relative px-8 text-center"><Crown size={62} className="mx-auto mb-7 text-[#f1d99d]" strokeWidth={1} /><p className="font-serif text-3xl text-[#f5e9d0] sm:text-4xl">{competition?.name ?? "Your Pageant Title"}</p><div className="mx-auto my-6 h-px w-20 bg-[#d8b56d]/60" /><p className="text-[10px] tracking-[0.2em] text-[#c6b7c9] uppercase">Beauty · Confidence · Purpose</p></div>
          </div>
        </div>
      </section>

      <div className="section-line" />
      <section id="contestants" className="site-container py-24">
        <div className="mx-auto max-w-2xl text-center"><div className="eyebrow">The faces of the competition</div><h2 className="mt-5 font-serif text-4xl text-[#f8f1e7] sm:text-5xl">Meet the <span className="italic gold-text">contestants</span></h2><p className="mt-5 text-sm leading-7 text-[#b9aebe]">{competition ? "Meet the officially published contestants in this competition." : "Contestant profiles will appear here when the organiser publishes a live competition."}</p></div>
        {contestantCards.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contestantCards.map((contestant) => (
              <article key={contestant.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#191421] transition hover:border-[#d8b56d]/50">
                <div className="aspect-[4/5] overflow-hidden bg-[#241b2d]">
                  {contestant.photoUrl ? <img src={contestant.photoUrl} alt={contestant.full_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#d8b56d]"><Crown size={54} strokeWidth={1} /></div>}
                </div>
                <div className="p-6">
                  {contestant.contestant_number && <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d8b56d] uppercase">Contestant {contestant.contestant_number}</p>}
                  <h3 className="mt-2 font-serif text-2xl text-[#f5e9d0]">{contestant.stage_name || contestant.full_name}</h3>
                  {contestant.stage_name && <p className="mt-1 text-xs text-[#b9aebe]">{contestant.full_name}</p>}
                  {contestant.biography && <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#b9aebe]">{contestant.biography}</p>}
                  <Link href={`/contestants/${contestant.id}`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#e5c77f] hover:text-[#fff0bd]">View full profile <ArrowRight size={14} /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-dashed border-[#d8b56d]/30 bg-[#191421]/65 px-6 py-14 text-center"><Crown size={35} className="mx-auto text-[#e6c77f]" /><h3 className="mt-5 font-serif text-2xl text-[#f5e9d0]">{competition ? "Contestants will be revealed soon" : "Competition coming soon"}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#b9aebe]">Official contestant profiles and photographs will appear here once published by the organiser.</p></div>
        )}
      </section>

      <section id="how-to-vote" className="border-y border-white/10 bg-[#17121e] py-24"><div className="site-container"><div className="mx-auto max-w-2xl text-center"><div className="eyebrow">Simple, secure and transparent</div><h2 className="mt-5 font-serif text-4xl text-[#f8f1e7] sm:text-5xl">How to <span className="italic gold-text">vote</span></h2><p className="mt-5 text-sm leading-7 text-[#b9aebe]">Choose a contestant, select your votes and complete payment. Votes will be allocated only after successful payment verification.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{[{n:"01",t:"Choose your contestant",d:"Explore published profiles and select who you want to support."},{n:"02",t:"Choose your votes",d:"The vote price determines the number of votes for your payment."},{n:"03",t:"Pay securely",d:"Complete payment through Flutterwave. Votes are credited after verification."}].map(step=><article key={step.n} className="rounded-lg border border-white/10 bg-[#100d16] p-7"><span className="font-serif text-4xl italic text-[#d8b56d]">{step.n}</span><h3 className="mt-6 text-lg font-semibold text-[#f5e9d0]">{step.t}</h3><p className="mt-3 text-sm leading-7 text-[#b9aebe]">{step.d}</p></article>)}</div></div></section>

      <section id="leaderboard" className="site-container py-24"><div className="mx-auto max-w-2xl text-center"><div className="eyebrow">The race for the crown</div><h2 className="mt-5 font-serif text-4xl text-[#f8f1e7] sm:text-5xl">Live <span className="italic gold-text">leaderboard</span></h2><p className="mt-5 text-sm leading-7 text-[#b9aebe]">Verified contestant rankings will be displayed here when voting and public results are enabled.</p></div><div className="mx-auto mt-10 max-w-3xl rounded-lg border border-white/10 bg-[#191421] p-8 text-center"><Trophy size={34} className="mx-auto text-[#d8b56d]" strokeWidth={1.2} /><p className="mt-4 font-serif text-2xl text-[#f5e9d0]">Leaderboard coming soon</p><p className="mt-2 text-sm text-[#b9aebe]">Rankings will be published from verified votes.</p></div></section>

      <footer className="border-t border-white/10 bg-[#0b0910] py-9"><div className="site-container flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><a href="#home" className="flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-[#ead9b5]"><Crown size={17} className="text-[#d8b56d}" /> PAGENTARY</a><p className="text-xs text-[#82798a]">© {new Date().getFullYear()} Pagentary. All rights reserved.</p><a href="#home" className="text-xs text-[#b9aebe] hover:text-[#f1d99d]">Back to top ↑</a></div></footer>
    </main>
  );
}
