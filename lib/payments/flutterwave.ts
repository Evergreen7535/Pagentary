import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type FlutterwaveVerification = {
  status?: string;
  message?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
    charged_amount?: number;
    customer?: { email?: string };
  };
};

export async function verifyAndCreditPayment(txRef: string, transactionId: string) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error("Flutterwave secret key is not configured.");

  const admin = createAdminClient();
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("id,tx_ref,amount_kobo,currency,votes_to_credit,status")
    .eq("tx_ref", txRef)
    .maybeSingle();

  if (paymentError || !payment) throw new Error("Payment reference was not found.");
  if (payment.status === "successful") {
    return { alreadyProcessed: true, votesCredited: payment.votes_to_credit };
  }

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
    { headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" }, cache: "no-store" },
  );
  if (!response.ok) throw new Error("Flutterwave transaction verification failed.");

  const result = (await response.json()) as FlutterwaveVerification;
  const transaction = result.data;
  if (
    result.status !== "success" ||
    !transaction ||
    String(transaction.id) !== String(transactionId) ||
    transaction.tx_ref !== payment.tx_ref ||
    transaction.status !== "successful" ||
    transaction.currency !== payment.currency ||
    typeof transaction.amount !== "number" ||
    Math.round(transaction.amount * 100) < Number(payment.amount_kobo)
  ) {
    throw new Error("The payment could not be verified against the expected transaction.");
  }

  const { data: credited, error: creditError } = await admin.rpc(
    "finalize_flutterwave_payment",
    {
      p_tx_ref: payment.tx_ref,
      p_transaction_id: String(transaction.id),
      p_gateway_payload: result as unknown as Record<string, unknown>,
    },
  );

  if (creditError) throw new Error("Payment was verified but vote allocation needs review.");
  const row = Array.isArray(credited) ? credited[0] : credited;
  return {
    alreadyProcessed: Boolean(row?.already_processed),
    votesCredited: Number(row?.votes_credited ?? payment.votes_to_credit),
  };
}
