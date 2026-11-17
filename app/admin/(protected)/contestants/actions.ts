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

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createCompetition(formData: FormData) {
  const admin = await requireAdministrator();
  const name = textValue(formData, "name");
  const slug = textValue(formData, "slug").toLowerCase();
  const description = textValue(formData, "description");
  if (name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    redirect("/admin/contestants?error=competition");
  }
  const { error } = await admin.from("competitions").insert({ name, slug, description: description || null, status: "draft" });
  if (error) redirect("/admin/contestants?error=competition");
  revalidatePath("/admin/contestants");
  redirect("/admin/contestants?created=competition");
}

export async function saveContestant(formData: FormData) {
  const admin = await requireAdministrator();
  const id = textValue(formData, "id");
  const competitionId = textValue(formData, "competition_id");
  const fullName = textValue(formData, "full_name");
  const stageName = textValue(formData, "stage_name");
  const number = textValue(formData, "contestant_number");
  const biography = textValue(formData, "biography");
  const order = Number(textValue(formData, "display_order") || "0");
  const isActive = textValue(formData, "is_active") === "on";
  if (!competitionId || fullName.length < 2 || !Number.isInteger(order) || order < 0) {
    redirect("/admin/contestants?error=details");
  }

  let photoPath: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(photo.type) || photo.size > 5 * 1024 * 1024) {
      redirect("/admin/contestants?error=photo");
    }
    const extension = photo.type === "image/jpeg" ? "jpg" : photo.type === "image/png" ? "png" : "webp";
    const path = `${competitionId}/${crypto.randomUUID()}.${extension}`;
    const bytes = Buffer.from(await photo.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("contestant-photos").upload(path, bytes, {
      contentType: photo.type,
      upsert: false,
      cacheControl: "3600",
    });
    if (uploadError) redirect("/admin/contestants?error=upload");
    photoPath = path;
  }

  const values = {
    competition_id: competitionId,
    full_name: fullName,
    stage_name: stageName || null,
    contestant_number: number || null,
    biography: biography || null,
    display_order: order,
    is_active: isActive,
    ...(photoPath ? { photo_path: photoPath } : {}),
  };

  const result = id
    ? await admin.from("contestants").update(values).eq("id", id)
    : await admin.from("contestants").insert(values);
  if (result.error) redirect("/admin/contestants?error=save");
  revalidatePath("/admin/contestants");
  revalidatePath("/");
  redirect("/admin/contestants?saved=1");
}

export async function toggleContestant(formData: FormData) {
  const admin = await requireAdministrator();
  const id = textValue(formData, "id");
  const active = textValue(formData, "active") === "true";
  if (!id) redirect("/admin/contestants?error=details");
  const { error } = await admin.from("contestants").update({ is_active: active }).eq("id", id);
  if (error) redirect("/admin/contestants?error=save");
  revalidatePath("/admin/contestants");
  revalidatePath("/");
  redirect("/admin/contestants?saved=1");
}
