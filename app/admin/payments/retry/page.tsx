import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tx_ref?: string; transaction_id?: string; result?: string; votes?: string }>;
};

export default async function RetryPaymentPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("admin_accounts")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account?.is_super_admin) redirect("/");

  const params = await searchParams;
  const txRef = params.tx_ref || "PAG-48c72d7b-5f92-45ea-95e4-2c338ac45dab";
  const transactionId = params.transaction_id || "";

  return (
    <main className="min-h-screen bg-[#100d1c] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Pagentary Admin</p>
        <h1 className="mt-3 text-3xl font-semibold">Retry payment verification</h1>
        <p className="mt-4 text-white/70">This checks the existing Flutterwave payment reference and credits votes only if Flutterwave independently confirms the payment. It does not charge the voter again.</p>
        {params.result === "success" ? (
          <p className="mt-6 rounded-lg bg-emerald-500/10 p-4 text-emerald-300">Verification completed. Votes credited: {params.votes || "0"}.</p>
        ) : params.result === "pending" ? (
          <p className="mt-6 rounded-lg bg-amber-500/10 p-4 text-amber-200">Flutterwave could not verify this reference yet. No votes were credited.</p>
        ) : null}
        <form action="/api/admin/payments/retry" method="post" className="mt-6 space-y-4">
          <label className="block text-sm text-white/80">
            Pagentary payment reference
            <input name="tx_ref" required defaultValue={txRef} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
          </label>
          <label className="block text-sm text-white/80">
            Flutterwave transaction ID
            <input name="transaction_id" required defaultValue={transactionId} placeholder="Enter the transaction ID from the Flutterwave email" className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300">Verify existing payment</button>
        </form>
      </div>
    </main>
  );
}
