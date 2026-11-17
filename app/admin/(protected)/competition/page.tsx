import { createAdminClient } from "@/lib/supabase/admin";
import CompetitionManager from "./competition-manager";

export const dynamic = "force-dynamic";

export default async function CompetitionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("competitions")
    .select("id,name,slug,description,status,starts_at,ends_at,created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load competition management data.");

  return (
    <CompetitionManager
      competitions={data ?? []}
      error={params.error}
      saved={params.saved}
    />
  );
}
