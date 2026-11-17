import { createAdminClient } from "@/lib/supabase/admin";
import ContestantsManager from "./contestants-manager";

export const dynamic = "force-dynamic";

export default async function ContestantsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [{ data: competitions, error: competitionsError }, { data: contestants, error: contestantsError }] = await Promise.all([
    admin.from("competitions").select("id,name,slug,status").order("created_at", { ascending: false }),
    admin.from("contestants").select("id,competition_id,contestant_number,full_name,stage_name,biography,photo_path,is_active,display_order").order("display_order").order("created_at"),
  ]);
  if (competitionsError || contestantsError) throw new Error("Unable to load contestant management data.");
  const rows = await Promise.all((contestants ?? []).map(async contestant => {
    let photo_url: string | null = null;
    if (contestant.photo_path) {
      const { data } = admin.storage.from("contestant-photos").getPublicUrl(contestant.photo_path);
      photo_url = data.publicUrl;
    }
    return { ...contestant, photo_url };
  }));
  return <ContestantsManager competitions={competitions ?? []} contestants={rows} error={params.error} saved={params.saved} />;
}
