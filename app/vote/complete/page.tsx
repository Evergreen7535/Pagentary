import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default async function VoteCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string; votes?: string }>;
}) {
  const params = await searchParams;
  const success = params.result === "success";
  const pending = params.result === "pending" || params.result === "unconfirmed";
  const votes = Number(params.votes);

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-5 py-16">
      <section className="w-full max-w-lg rounded-xl border border-white/10 bg-[#191421] p-8 text-center sm:p-10">
        {success ? <CheckCircle2 size={54} className="mx-auto text-[#d8b56d]" /> :
          pending ? <Clock3 size={54} className="mx-auto text-[#d8b56d]" /> :
          <XCircle size={54} className="mx-auto text-[#b9aebe]" />}
        <h1 className="mt-6 font-serif text-3xl text-[#f5e9d0]">
          {success ? "Payment verified" : pending ? "Payment confirmation pending" : "Payment not completed"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#b9aebe]">
          {success && Number.isSafeInteger(votes) && votes > 0
            ? `${votes} vote(s) have been credited successfully.`
            : pending
              ? "We could not confirm the payment yet. Please allow a moment and contact the organiser if the status does not update. Do not pay again until your transaction is checked."
              : "No votes have been credited. You can return to the competition and try again when voting is open."}
        </p>
        <Link href="/" className="gold-button mt-8 inline-flex">Return to Pagentary</Link>
      </section>
    </main>
  );
}
