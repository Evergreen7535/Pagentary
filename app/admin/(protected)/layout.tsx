import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminClient = createAdminClient();
  const { data: administrator, error } = await adminClient
    .from("admin_accounts")
    .select("user_id, is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !administrator?.is_super_admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?access=restricted");
  }

  return <>{children}</>;
}
