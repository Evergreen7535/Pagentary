import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      contestantId?: string;
      votes?: number;
      email?: string;
      name?: string;
      phone?: string;
    };
    const contestantId = body.contestantId?.trim();
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();
    const phone = body.phone?.trim() || undefined;
    const votes = Number(body.votes);

    if (!contestantId || !email || !/^\S+@\S+\.\S+$/.test(email) ||
        !name || name.length > 120 || !Number.isSafeInteger(votes) || votes < 1) {
      return NextResponse.json({ error: "Enter a valid name, email and vote quantity." }, { status: 400 });
    }

    const secretKey = process.env.FLW_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!secretKey || !appUrl) {
      return NextResponse.json({ error: "Payment service is not configured." }, { status: 503 });
    }

    const admin = createAdminClient();
    const [{ data: settings, error: settingsError }, { data: contestant, error: contestantError }] = await Promise.all([
      admin.from("voting_settings").select("*").eq("singleton", true).single(),
      admin.from("contestants").select("id,full_name,competition_id,is_active,competitions!inner(id,name,status)").eq("id", contestantId).maybeSingle(),
    ]);

    if (settingsError || !settings || contestantError || !contestant ||
        !contestant.is_active || (contestant.competitions as any)?.status !== "live") {
      return NextResponse.json({ error: "This contestant is not currently available for voting." }, { status: 400 });
    }
    if (!settings.voting_enabled) {
      return NextResponse.json({ error: "Voting is not open yet." }, { status: 403 });
    }
    if (votes < settings.min_votes_per_transaction ||
        (settings.max_votes_per_transaction && votes > settings.max_votes_per_transaction)) {
      return NextResponse.json({ error: "The selected vote quantity is outside the allowed limits." }, { status: 400 });
    }

    const amountKobo = Number(settings.price_per_vote_kobo) * votes;
    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    if (settings.max_votes_per_voter) {
      const { data: previous, error: previousError } = await admin
        .from("payments")
        .select("votes_to_credit")
        .eq("voter_email", email)
        .eq("status", "successful");
      if (previousError) throw previousError;
      const alreadyVoted = (previous ?? []).reduce((sum, payment) => sum + payment.votes_to_credit, 0);
      if (alreadyVoted + votes > settings.max_votes_per_voter) {
        return NextResponse.json({ error: "This email address has reached the voting limit." }, { status: 400 });
      }
    }

    const txRef = `PAG-${randomUUID()}`;
    const { error: insertError } = await admin.from("payments").insert({
      contestant_id: contestant.id,
      voter_email: email,
      tx_ref: txRef,
      amount_kobo: amountKobo,
      currency: "NGN",
      votes_to_credit: votes,
      status: "pending",
    });
    if (insertError) throw insertError;

    const checkoutResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: (amountKobo / 100).toFixed(2),
        currency: "NGN",
        redirect_url: `${appUrl.replace(/\/$/, "")}/api/payments/flutterwave/callback`,
        customer: { email, name, ...(phone ? { phonenumber: phone } : {}) },
        customizations: { title: "Pagentary Vote", description: `Votes for ${contestant.full_name}` },
        configuration: { session_duration: 15, max_retry_attempt: 3 },
        meta: { contestant_id: contestant.id, votes },
      }),
      cache: "no-store",
    });

    const checkout = await checkoutResponse.json() as { status?: string; message?: string; data?: { link?: string } };
    if (!checkoutResponse.ok || checkout.status !== "success" || !checkout.data?.link) {
      await admin.from("payments").update({ status: "failed" }).eq("tx_ref", txRef);
      return NextResponse.json({ error: "Flutterwave could not create the checkout session." }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl: checkout.data.link });
  } catch (error) {
    console.error("Flutterwave checkout initialization failed:", error);
    return NextResponse.json({ error: "Unable to start payment. Please try again." }, { status: 500 });
  }
}
