import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { verifyAndCreditPayment } from "@/lib/payments/flutterwave";

export const runtime = "nodejs";

function matchesSecret(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function GET() {
  return NextResponse.json({ service: "Pagentary Flutterwave webhook", status: "endpoint_ready" });
}

export async function POST(request: NextRequest) {
  if (!matchesSecret(request.headers.get("verif-hash"), process.env.FLW_SECRET_HASH)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const payload = await request.json() as {
      event?: string;
      data?: { id?: string | number; tx_ref?: string; status?: string };
    };
    const txRef = payload.data?.tx_ref;

    if (payload.event !== "charge.completed" || !txRef) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    await verifyAndCreditPayment(txRef);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Flutterwave webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed; retry delivery." }, { status: 500 });
  }
}
