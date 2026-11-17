"use client";

import { useMemo, useState } from "react";

export default function VoteForm({
  contestantId,
  pricePerVote,
  minVotes,
  maxVotes,
}: {
  contestantId: string;
  pricePerVote: number;
  minVotes: number;
  maxVotes: number | null;
}) {
  const [votes, setVotes] = useState(String(minVotes));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const amount = useMemo(() => {
    const quantity = Number(votes);
    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity * pricePerVote : 0;
  }, [votes, pricePerVote]);

  async function startPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const quantity = Number(votes);
    if (!Number.isSafeInteger(quantity) || quantity < minVotes || (maxVotes !== null && quantity > maxVotes)) {
      setError("Enter a vote quantity within the permitted limits.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/payments/flutterwave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestantId, votes: quantity, name, email, phone }),
      });
      const result = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Unable to start checkout.");
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={startPayment} className="mt-6 space-y-4">
      <label className="block text-xs text-[#c4b9cb]">Number of votes
        <input type="number" min={minVotes} max={maxVotes ?? undefined} step="1" required value={votes}
          onChange={(event) => setVotes(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/15 bg-[#100d16] px-4 py-3 text-sm text-white outline-none focus:border-[#d8b56d]" />
      </label>
      <p className="text-sm text-[#e5c77f]">Total: ₦{amount.toLocaleString("en-NG")}</p>
      <label className="block text-xs text-[#c4b9cb]">Your full name
        <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/15 bg-[#100d16] px-4 py-3 text-sm text-white outline-none focus:border-[#d8b56d]" />
      </label>
      <label className="block text-xs text-[#c4b9cb]">Email address
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/15 bg-[#100d16] px-4 py-3 text-sm text-white outline-none focus:border-[#d8b56d]" />
      </label>
      <label className="block text-xs text-[#c4b9cb]">Phone number (optional)
        <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/15 bg-[#100d16] px-4 py-3 text-sm text-white outline-none focus:border-[#d8b56d]" />
      </label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="gold-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "Preparing secure checkout..." : "Continue to secure payment"}
      </button>
    </form>
  );
}
