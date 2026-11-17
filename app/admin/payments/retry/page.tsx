import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tx_ref?: string; result?: string; votes?: string }>;
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
  const txRef = params.tx_ref || "PAG-676b102d-2629-40a8-95ff-c3dd2f80d30c";

  return (
    <main className="min-h-screen bg-[#100d1c] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Pagentary Admin</p>
        <h1 className="mt-3 text-3xl font-semibold">Retry payment verification</h1>
        <p className="mt-4 text-white/70">This checks the existing Flutterwave payment reference and credits votes only if Flutterwave independently confirms the payment. It does not charge the voter again.</p>
        {params.result === "success" ? (
          <p className="mt-6 rounded-lg bg-emerald-500/10 p-4 text-emerald-300">Verification completed. Votes credited: {params.votes || "1"}.</p>
        ) : params.result === "pending" ? (
          <p className="mt-6 rounded-lg bg-amber-500/10 p-4 text-amber-200">Flutterwave could not verify this reference yet. No votes were credited.</p>
        ) : null}
        <div className="mt-6 break-all rounded-lg bg-black/30 p-4 text-sm">{txRef}</div>
        <form action="/api/admin/payments/retry" method="post" className="mt-6">
          <input type="hidden" name="tx_ref" value={txRef} />
          <input type="hidden" name="transaction_id" value="10620396" />
          <button type="submit" className="w-full rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300">Verify existing payment</button>
        </form>
      </div>
    </main>
  );
}
