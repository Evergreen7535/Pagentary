"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdministrator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_accounts")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_super_admin", true)
    .maybeSingle();
  if (error || !data) redirect("/admin/login?access=restricted");
  return admin;
}

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function dateValue(input: string) {
  if (!input) return null;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? "invalid" : parsed.toISOString();
}

function refreshCompetitionPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/competition");
  revalidatePath("/admin/contestants");
  revalidatePath("/");
}

export async function createCompetition(formData: FormData) {
  const admin = await requireAdministrator();
  const name = value(formData, "name");
  const slug = value(formData, "slug").toLowerCase();
  const description = value(formData, "description");
  if (name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    redirect("/admin/competition?error=details");
  }
  const { error } = await admin.from("competitions").insert({
    name, slug, description: description || null, status: "draft",
  });
  if (error) redirect("/admin/competition?error=save");
  refreshCompetitionPages();
  redirect("/admin/competition?saved=created");
}

export async function saveCompetition(formData: FormData) {
  const admin = await requireAdministrator();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const slug = value(formData, "slug").toLowerCase();
  const description = value(formData, "description");
  const status = value(formData, "status");
  const startsAt = dateValue(value(formData, "starts_at"));
  const endsAt = dateValue(value(formData, "ends_at"));
  const allowedStatuses = ["draft", "live", "closed", "archived"];

  if (!id || name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !allowedStatuses.includes(status) || startsAt === "invalid" || endsAt === "invalid" ||
      (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt))) {
    redirect("/admin/competition?error=details");
  }

  const { data, error } = await admin.from("competitions").update({
    name, slug, description: description || null, status,
    starts_at: startsAt, ends_at: endsAt,
  }).eq("id", id).select("id").maybeSingle();

  if (error || !data) redirect("/admin/competition?error=save");
  refreshCompetitionPages();
  redirect("/admin/competition?saved=updated");
}

export async function deleteCompetition(formData: FormData) {
  const admin = await requireAdministrator();
  const id = value(formData, "id");
  const confirmation = value(formData, "confirm_name");
  if (!id) redirect("/admin/competition?error=details");

  const { data: competition, error: competitionError } = await admin
    .from("competitions").select("id,name").eq("id", id).maybeSingle();
  if (competitionError || !competition || confirmation !== competition.name) {
    redirect("/admin/competition?error=confirmation");
  }

  const { data: contestants, error: contestantError } = await admin
    .from("contestants").select("id,photo_path").eq("competition_id", id);
  if (contestantError) redirect("/admin/competition?error=delete");

  const contestantIds = (contestants ?? []).map((contestant) => contestant.id);
  if (contestantIds.length) {
    const { count, error: paymentError } = await admin
      .from("payments").select("id", { count: "exact", head: true })
      .in("contestant_id", contestantIds);
    if (paymentError) redirect("/admin/competition?error=delete");
    if ((count ?? 0) > 0) redirect("/admin/competition?error=has_history");
  }

  // The payments foreign key is RESTRICT, so the database remains the final
  // safeguard against deleting a competition that gains payment history.
  const { data: deleted, error } = await admin
    .from("competitions").delete().eq("id", id).select("id").maybeSingle();
  if (error || !deleted) redirect("/admin/competition?error=delete");

  const photoPaths = (contestants ?? [])
    .map((contestant) => contestant.photo_path)
    .filter((path): path is string => Boolean(path));
  if (photoPaths.length) {
    await admin.storage.from("contestant-photos").remove(photoPaths);
  }

  refreshCompetitionPages();
  redirect("/admin/competition?saved=deleted");
}
