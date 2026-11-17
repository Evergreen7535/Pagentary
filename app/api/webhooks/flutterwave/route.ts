import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function matchesSecret(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function GET() {
  return NextResponse.json({
    service: "Pagentary Flutterwave webhook",
    status: "endpoint_ready",
  });
}

export async function POST(request: NextRequest) {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = request.headers.get("verif-hash");

  if (!matchesSecret(signature, secretHash)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // Payment verification and idempotent vote allocation will be enabled
  // together with the checkout workflow. Do not credit votes from webhook
  // payloads alone.
  return NextResponse.json(
    { received: true, processing: false, message: "Payment processing is not enabled yet." },
    { status: 503 },
  );
}
