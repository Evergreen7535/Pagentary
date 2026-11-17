import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAndCreditPayment } from "@/lib/payments/flutterwave";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("admin_accounts")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account?.is_super_admin) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const form = await request.formData();
  const txRef = String(form.get("tx_ref") || "").trim();
  const transactionId = String(form.get("transaction_id") || "").trim();
  if (!/^PAG-[a-f0-9-]{36}$/i.test(txRef)) {
    return NextResponse.json({ error: "Invalid Pagentary transaction reference." }, { status: 400 });
  }

  try {
    const result = await verifyAndCreditPayment(txRef, transactionId);
    const destination = new URL("/admin/payments/retry", request.url);
    destination.searchParams.set("result", "success");
    destination.searchParams.set("votes", String(result.votesCredited));
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("Admin payment retry failed:", error);
    const destination = new URL("/admin/payments/retry", request.url);
    destination.searchParams.set("result", "pending");
    return NextResponse.redirect(destination);
  }
}
