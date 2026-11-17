import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatMoney(amountKobo: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(amountKobo / 100);
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("admin_accounts")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!account?.is_super_admin) redirect("/admin/login?access=restricted");

  const { data: payments, error } = await admin
    .from("payments")
    .select("id, contestant_id, voter_email, gateway, gateway_transaction_id, tx_ref, amount_kobo, currency, votes_to_credit, status, created_at, verified_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const contestantIds = [...new Set((payments ?? []).map((payment) => payment.contestant_id))];
  const { data: contestants } = contestantIds.length
    ? await admin.from("contestants").select("id, full_name, stage_name, contestant_number").in("id", contestantIds)
    : { data: [] as { id: string; full_name: string; stage_name: string | null; contestant_number: string | null }[] };
  const contestantMap = new Map((contestants ?? []).map((contestant) => [contestant.id, contestant]));

  const successful = (payments ?? []).filter((payment) => payment.status === "successful").length;
  const pending = (payments ?? []).filter((payment) => payment.status === "pending").length;
  const failed = (payments ?? []).filter((payment) => payment.status === "failed").length;

  return (
    <main className="page-shell min-h-screen">
      <div className="site-container py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#c9b9d0] hover:text-white"><ArrowLeft size={16} /> Admin dashboard</Link>
        <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Transactions</p>
            <h1 className="mt-3 font-serif text-4xl text-[#f8f1e7]">Payments</h1>
            <p className="mt-2 text-sm text-[#b9aebe]">Latest 100 payment records. Only verified successful payments should result in credited votes.</p>
          </div>
          <Link href="/admin/payments/retry" className="w-fit rounded-lg border border-[#d8b56d]/40 px-4 py-2.5 text-xs font-semibold text-[#e8cb8a] hover:bg-[#d8b56d]/10">Retry a payment verification</Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5"><p className="text-xs text-emerald-200/80">Successful</p><p className="mt-2 text-3xl font-semibold text-emerald-200">{successful}</p></div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5"><p className="text-xs text-amber-100/80">Pending</p><p className="mt-2 text-3xl font-semibold text-amber-100">{pending}</p></div>
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5"><p className="text-xs text-rose-200/80">Failed</p><p className="mt-2 text-3xl font-semibold text-rose-200">{failed}</p></div>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#191421]">
          <div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold text-[#f5e9d0]">Payment history</h2></div>
          {error ? <p className="p-6 text-sm text-rose-300">Unable to load payment records. Please refresh or contact the system administrator.</p> : !(payments ?? []).length ? <p className="p-6 text-sm text-[#b9aebe]">No payment records found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-black/20 text-[11px] uppercase tracking-wider text-[#b9aebe]"><tr><th className="px-5 py-3">Contestant / voter</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Votes</th><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {(payments ?? []).map((payment) => {
                    const contestant = contestantMap.get(payment.contestant_id);
                    const status = payment.status?.toLowerCase();
                    const StatusIcon = status === "successful" ? CheckCircle2 : status === "pending" ? Clock3 : XCircle;
                    const statusClass = status === "successful" ? "text-emerald-300" : status === "pending" ? "text-amber-200" : "text-rose-300";
                    return <tr key={payment.id} className="align-top text-[#e9e1ec]">
                      <td className="px-5 py-4"><p className="font-medium">{contestant?.stage_name || contestant?.full_name || "Unknown contestant"}</p><p className="mt-1 text-xs text-[#a99eaf]">{payment.voter_email || "No email"}{contestant?.contestant_number ? ` · #${contestant.contestant_number}` : ""}</p></td>
                      <td className="whitespace-nowrap px-5 py-4">{formatMoney(Number(payment.amount_kobo), payment.currency || "NGN")}</td>
                      <td className="px-5 py-4">{payment.votes_to_credit}</td>
                      <td className="max-w-[220px] break-all px-5 py-4 text-xs text-[#b9aebe]">{payment.tx_ref}<p className="mt-1">{payment.gateway_transaction_id ? `Gateway ID: ${payment.gateway_transaction_id}` : "No gateway transaction ID"}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#b9aebe]">{new Date(payment.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                      <td className={`whitespace-nowrap px-5 py-4 text-xs font-semibold ${statusClass}`}><span className="inline-flex items-center gap-1.5"><StatusIcon size={14} />{payment.status}</span>{payment.verified_at ? <p className="mt-1 font-normal text-[#9d91a4]">Verified</p> : null}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
