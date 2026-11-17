import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import VoteForm from "./vote-form";

export const dynamic = "force-dynamic";

export default async function ContestantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contestant } = await supabase
    .from("contestants")
    .select("id,competition_id,contestant_number,full_name,stage_name,biography,photo_path")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!contestant) notFound();

  const { data: competition } = await supabase
    .from("competitions")
    .select("id,name,description")
    .eq("id", contestant.competition_id)
    .eq("status", "live")
    .maybeSingle();

  if (!competition) notFound();

  const { data: votingSettings } = await supabase
    .from("voting_settings")
    .select("voting_enabled,price_per_vote_kobo,min_votes_per_transaction,max_votes_per_transaction")
    .eq("singleton", true)
    .maybeSingle();

  const photoUrl = contestant.photo_path
    ? supabase.storage.from("contestant-photos").getPublicUrl(contestant.photo_path).data.publicUrl
    : null;

  return (
    <main className="page-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#100d16]/90">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b56d]/60 bg-[#d8b56d]/10 text-[#f1d99d]"><Crown size={20} /></span>
            <span className="font-serif text-xl font-semibold tracking-[0.12em] text-[#f5e9d0]">PAGENTARY</span>
          </Link>
          <Link href="/#contestants" className="text-xs text-[#c9c0ce] hover:text-[#f1d99d]">All contestants</Link>
        </div>
      </header>

      <section className="site-container py-10 sm:py-16">
        <Link href="/#contestants" className="inline-flex items-center gap-2 text-sm text-[#c9c0ce] hover:text-[#f1d99d]"><ArrowLeft size={16} /> Back to contestants</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border border-white/10 bg-[#191421]">
            <div className="aspect-[4/5] bg-[#241b2d]">
              {photoUrl ? <img src={photoUrl} alt={contestant.full_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#d8b56d]"><Crown size={76} strokeWidth={1} /></div>}
            </div>
          </div>

          <div className="pt-2">
            <p className="eyebrow">{competition.name}</p>
            {contestant.contestant_number && <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#d8b56d] uppercase">Contestant {contestant.contestant_number}</p>}
            <h1 className="mt-4 font-serif text-4xl leading-tight text-[#f8f1e7] sm:text-6xl">{contestant.stage_name || contestant.full_name}</h1>
            {contestant.stage_name && <p className="mt-3 text-base text-[#b9aebe]">{contestant.full_name}</p>}
            <div className="my-8 h-px w-24 bg-[#d8b56d]/60" />
            <h2 className="font-serif text-2xl text-[#f5e9d0]">Contestant profile</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#c4b9cb]">{contestant.biography || "The contestant's biography will be published soon."}</p>
            <div className="mt-10 rounded-lg border border-[#d8b56d]/25 bg-[#191421] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f5e9d0]"><ShieldCheck size={17} className="text-[#d8b56d]" /> Voting information</div>
              {votingSettings?.voting_enabled ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-[#b9aebe]">Support this contestant with a secure Flutterwave payment. Votes are credited only after payment verification.</p>
                  <VoteForm
                    contestantId={contestant.id}
                    pricePerVote={Number(votingSettings.price_per_vote_kobo) / 100}
                    minVotes={votingSettings.min_votes_per_transaction}
                    maxVotes={votingSettings.max_votes_per_transaction}
                  />
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[#b9aebe]">Voting is not yet open. The official voting button will appear here once the organiser enables voting after payment testing is complete.</p>
              )}
            </div>
            <Link href="/#contestants" className="outline-button mt-8 inline-flex">Explore other contestants</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0b0910] py-8 text-center text-xs text-[#82798a]">© {new Date().getFullYear()} Pagentary. All rights reserved.</footer>
    </main>
  );
}
