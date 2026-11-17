"use client";

import { saveVotingSettings } from "./actions";

type Settings = {
  currency: string;
  pricePerVote: string;
  minVotes: number;
  maxVotesPerTransaction: number | null;
  maxVotesPerVoter: number | null;
  publicResultsEnabled: boolean;
  votingEnabled: boolean;
};

export default function VotingSettingsForm({ settings }: { settings: Settings }) {
  return (
    <form action={saveVotingSettings} className="mt-8 max-w-3xl rounded-xl border border-[#d8b56d]/25 bg-[#191421] p-6 sm:p-8">
      <section>
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-2 font-serif text-2xl text-[#f5e9d0]">Vote price</h2>
        <label className="mt-5 block text-xs text-[#e7dcc8]">Price per vote ({settings.currency})
          <div className="mt-2 flex items-center rounded border border-white/10 bg-[#100d16]">
            <span className="border-r border-white/10 px-4 py-3 text-sm text-[#d8b56d]">₦</span>
            <input name="price_per_vote" type="number" min="0.01" step="0.01" required defaultValue={settings.pricePerVote} className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" />
          </div>
        </label>
        <p className="mt-2 text-xs text-[#9e93a5]">Example: at ₦100 per vote, a ₦5,000 verified payment represents 50 votes.</p>
      </section>

      <div className="my-7 border-t border-white/10" />
      <section>
        <p className="eyebrow">Transaction limits</p>
        <h2 className="mt-2 font-serif text-2xl text-[#f5e9d0]">Vote limits</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[#e7dcc8]">Minimum votes per transaction
            <input name="min_votes_per_transaction" type="number" min="1" step="1" required defaultValue={settings.minVotes} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
          </label>
          <label className="text-xs text-[#e7dcc8]">Maximum votes per transaction
            <input name="max_votes_per_transaction" type="number" min={settings.minVotes} step="1" defaultValue={settings.maxVotesPerTransaction ?? ""} placeholder="No limit" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
          </label>
          <label className="text-xs text-[#e7dcc8] sm:col-span-2">Maximum votes per voter (optional)
            <input name="max_votes_per_voter" type="number" min="1" step="1" defaultValue={settings.maxVotesPerVoter ?? ""} placeholder="No limit" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
          </label>
        </div>
        <p className="mt-2 text-xs text-[#9e93a5]">Leave an optional maximum blank to allow unlimited votes under that limit.</p>
      </section>

      <div className="my-7 border-t border-white/10" />
      <section>
        <p className="eyebrow">Availability and visibility</p>
        <h2 className="mt-2 font-serif text-2xl text-[#f5e9d0]">Voting controls</h2>
        <label className="mt-5 flex items-start gap-3 rounded-lg border border-white/10 bg-[#100d16]/70 p-4">
          <input name="voting_enabled" type="checkbox" defaultChecked={settings.votingEnabled} className="mt-1 h-4 w-4 accent-[#d8b56d]" />
          <span><span className="block text-sm font-semibold text-[#f5e9d0]">Enable voting</span><span className="mt-1 block text-xs leading-5 text-[#9e93a5]">Master switch for accepting votes when the voting and payment workflow is ready.</span></span>
        </label>
        <label className="mt-3 flex items-start gap-3 rounded-lg border border-white/10 bg-[#100d16]/70 p-4">
          <input name="public_results_enabled" type="checkbox" defaultChecked={settings.publicResultsEnabled} className="mt-1 h-4 w-4 accent-[#d8b56d]" />
          <span><span className="block text-sm font-semibold text-[#f5e9d0]">Show public leaderboard</span><span className="mt-1 block text-xs leading-5 text-[#9e93a5]">Allow visitors to see public voting results when the results feature is connected.</span></span>
        </label>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="submit" className="gold-button">Save voting settings</button>
        <a href="/admin" className="outline-button">Cancel</a>
      </div>
    </form>
  );
}
