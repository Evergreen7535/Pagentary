import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import VotingSettingsForm from "./voting-settings-form";

export const dynamic = "force-dynamic";

export default async function VotingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const { data: settings, error } = await admin
    .from("voting_settings")
    .select("currency,price_per_vote_kobo,min_votes_per_transaction,max_votes_per_transaction,max_votes_per_voter,public_results_enabled,voting_enabled")
    .eq("singleton", true)
    .single();

  return (
    <main className="page-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#100d16]/90">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/admin" className="font-serif text-lg tracking-[.12em] text-[#f5e9d0]">PAGENTARY <span className="font-sans text-[9px] text-[#b9a47b]">ADMIN</span></Link>
          <Link href="/admin" className="text-xs text-[#c9c0ce] hover:text-white">Back to dashboard</Link>
        </div>
      </header>
      <div className="site-container py-10">
        <p className="eyebrow">Platform configuration</p>
        <h1 className="mt-3 font-serif text-4xl text-[#f8f1e7]">Voting settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9aebe]">Set the vote price, transaction limits and public results visibility. These settings apply platform-wide.</p>

        {params.saved === "1" && <p role="status" className="mt-6 rounded border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Voting settings saved successfully.</p>}
        {params.error && <p role="alert" className="mt-6 rounded border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{params.error === "validation" ? "Please check the price and vote limits. The maximum transaction votes cannot be lower than the minimum." : "We could not save the settings. Please try again."}</p>}

        {error || !settings ? (
          <p role="alert" className="mt-6 rounded border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">Voting settings could not be loaded. Please contact technical support before changing voting configuration.</p>
        ) : (
          <VotingSettingsForm settings={{
            currency: settings.currency,
            pricePerVote: (Number(settings.price_per_vote_kobo) / 100).toFixed(2),
            minVotes: settings.min_votes_per_transaction,
            maxVotesPerTransaction: settings.max_votes_per_transaction,
            maxVotesPerVoter: settings.max_votes_per_voter,
            publicResultsEnabled: settings.public_results_enabled,
            votingEnabled: settings.voting_enabled,
          }} />
        )}

        <p className="mt-6 max-w-3xl text-xs leading-5 text-[#9e93a5]">Important: enabling this switch stores the voting preference. Public vote checkout and verified payment processing will only become operational after the voting and Flutterwave payment workflows are completed and tested.</p>
      </div>
    </main>
  );
}
