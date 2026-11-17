import { NextRequest, NextResponse } from "next/server";
import { verifyAndCreditPayment } from "@/lib/payments/flutterwave";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const txRef = params.get("tx_ref");
  const transactionId = params.get("transaction_id");

  if (status !== "successful" || !txRef || !transactionId) {
    return NextResponse.redirect(new URL("/vote/complete?result=unconfirmed", request.url));
  }

  try {
    const result = await verifyAndCreditPayment(txRef, transactionId);
    const destination = new URL("/vote/complete", request.url);
    destination.searchParams.set("result", "success");
    destination.searchParams.set("votes", String(result.votesCredited));
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("Flutterwave return verification failed:", error);
    return NextResponse.redirect(new URL("/vote/complete?result=pending", request.url));
  }
}
