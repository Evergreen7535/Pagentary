"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdministrator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_accounts")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_super_admin", true)
    .maybeSingle();

  if (error || !data) redirect("/admin/login?access=restricted");
  return admin;
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function saveVotingSettings(formData: FormData) {
  const admin = await requireAdministrator();
  const priceText = field(formData, "price_per_vote");
  const minText = field(formData, "min_votes_per_transaction");
  const maxTransactionText = field(formData, "max_votes_per_transaction");
  const maxVoterText = field(formData, "max_votes_per_voter");

  if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
    redirect("/admin/voting-settings?error=validation");
  }

  const priceKobo = Math.round(Number(priceText) * 100);
  const minVotes = positiveInteger(minText);
  const maxTransaction = maxTransactionText ? positiveInteger(maxTransactionText) : null;
  const maxVoter = maxVoterText ? positiveInteger(maxVoterText) : null;

  if (!Number.isSafeInteger(priceKobo) || priceKobo <= 0 || !minVotes ||
      (maxTransactionText && !maxTransaction) ||
      (maxVoterText && !maxVoter) ||
      (maxTransaction !== null && maxTransaction < minVotes)) {
    redirect("/admin/voting-settings?error=validation");
  }

  const { error } = await admin.from("voting_settings").update({
    currency: "NGN",
    price_per_vote_kobo: priceKobo,
    min_votes_per_transaction: minVotes,
    max_votes_per_transaction: maxTransaction,
    max_votes_per_voter: maxVoter,
    public_results_enabled: formData.get("public_results_enabled") === "on",
    voting_enabled: formData.get("voting_enabled") === "on",
  }).eq("singleton", true);

  if (error) redirect("/admin/voting-settings?error=save");

  revalidatePath("/admin/voting-settings");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/voting-settings?saved=1");
}
