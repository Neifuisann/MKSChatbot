"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  adminIdSchema,
  adminIdeaReviewSchema,
  adminProfileSchema,
  adminPromptSchema,
  adminResourceSchema,
} from "@/schemas/admin";

function redirectMessage(path: string, type: "error" | "saved", message: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function numberValue(formData: FormData, name: string): number {
  return Number(formData.get(name));
}

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message || "Dữ liệu không hợp lệ.";
}

export async function reviewResearchIdea(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsedId = adminIdSchema.safeParse(id);
  const parsed = adminIdeaReviewSchema.safeParse({
    adminResponse: formData.get("adminResponse"),
    status: formData.get("status"),
  });
  if (!parsedId.success || !parsed.success) {
    redirectMessage("/admin/research-ideas", "error", "Thông tin duyệt không hợp lệ.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("research_ideas")
    .update({
      admin_response: parsed.data.adminResponse || null,
      status: parsed.data.status,
    })
    .eq("id", parsedId.data)
    .eq("status", "pending");
  if (error) redirectMessage("/admin/research-ideas", "error", "Không thể cập nhật ý tưởng.");
  revalidatePath("/admin/research-ideas");
  redirectMessage("/admin/research-ideas", "saved", "Đã cập nhật ý tưởng nghiên cứu.");
}

export async function deleteResearchIdeaAsAdmin(id: string, formData?: FormData): Promise<void> {
  void formData;
  await requireAdmin();
  const parsed = adminIdSchema.safeParse(id);
  if (!parsed.success) redirectMessage("/admin/research-ideas", "error", parsed.error.issues[0].message);
  const { error } = await createSupabaseAdminClient().from("research_ideas").delete().eq("id", parsed.data);
  if (error) redirectMessage("/admin/research-ideas", "error", "Không thể xóa ý tưởng.");
  revalidatePath("/admin/research-ideas");
  redirectMessage("/admin/research-ideas", "saved", "Đã xóa ý tưởng.");
}

export async function saveResource(id: string | null, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = adminResourceSchema.safeParse({
    autoApprove: checkbox(formData, "autoApprove"),
    capacity: numberValue(formData, "capacity"),
    category: formData.get("category"),
    description: formData.get("description"),
    isActive: checkbox(formData, "isActive"),
    location: formData.get("location"),
    maxPeople: numberValue(formData, "maxPeople"),
    name: formData.get("name"),
  });
  if (!parsed.success) redirectMessage("/admin/makerspace", "error", firstIssue(parsed.error));
  const row = {
    auto_approve: parsed.data.autoApprove,
    capacity: parsed.data.capacity,
    category: parsed.data.category,
    description: parsed.data.description,
    is_active: parsed.data.isActive,
    location: parsed.data.location,
    max_people: parsed.data.maxPeople,
    name: parsed.data.name,
  };
  const admin = createSupabaseAdminClient();
  const result = id
    ? await admin.from("makerspace_resources").update(row).eq("id", adminIdSchema.parse(id))
    : await admin.from("makerspace_resources").insert(row);
  if (result.error) redirectMessage("/admin/makerspace", "error", "Không thể lưu tài nguyên Makerspace.");
  revalidatePath("/admin/makerspace");
  revalidatePath("/makerspace");
  redirectMessage("/admin/makerspace", "saved", "Đã lưu tài nguyên Makerspace.");
}

export async function deleteResource(id: string, formData?: FormData): Promise<void> {
  void formData;
  await requireAdmin();
  const parsed = adminIdSchema.safeParse(id);
  if (!parsed.success) redirectMessage("/admin/makerspace", "error", parsed.error.issues[0].message);
  const { error } = await createSupabaseAdminClient().from("makerspace_resources").delete().eq("id", parsed.data);
  if (error) redirectMessage("/admin/makerspace", "error", "Không thể xóa tài nguyên đang có lịch đặt. Hãy tắt hoạt động thay vì xóa.");
  revalidatePath("/admin/makerspace");
  revalidatePath("/makerspace");
  redirectMessage("/admin/makerspace", "saved", "Đã xóa tài nguyên Makerspace.");
}

export async function savePrompt(id: string | null, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = adminPromptSchema.safeParse({
    category: formData.get("category"),
    code: formData.get("code"),
    content: formData.get("content"),
    isActive: checkbox(formData, "isActive"),
    purpose: formData.get("purpose"),
    sortOrder: numberValue(formData, "sortOrder"),
    tip: formData.get("tip"),
    title: formData.get("title"),
  });
  if (!parsed.success) redirectMessage("/admin/prompts", "error", firstIssue(parsed.error));
  const row = {
    category: parsed.data.category,
    code: parsed.data.code,
    content: parsed.data.content,
    is_active: parsed.data.isActive,
    purpose: parsed.data.purpose,
    sort_order: parsed.data.sortOrder,
    tip: parsed.data.tip,
    title: parsed.data.title,
  };
  const admin = createSupabaseAdminClient();
  const result = id
    ? await admin.from("prompts").update(row).eq("id", adminIdSchema.parse(id))
    : await admin.from("prompts").insert(row);
  if (result.error) redirectMessage("/admin/prompts", "error", "Không thể lưu prompt. Kiểm tra mã prompt có bị trùng không.");
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
  redirectMessage("/admin/prompts", "saved", "Đã lưu prompt.");
}

export async function deletePrompt(id: string, formData?: FormData): Promise<void> {
  void formData;
  await requireAdmin();
  const parsed = adminIdSchema.safeParse(id);
  if (!parsed.success) redirectMessage("/admin/prompts", "error", parsed.error.issues[0].message);
  const { error } = await createSupabaseAdminClient().from("prompts").delete().eq("id", parsed.data);
  if (error) redirectMessage("/admin/prompts", "error", "Không thể xóa prompt.");
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
  redirectMessage("/admin/prompts", "saved", "Đã xóa prompt.");
}

export async function updateUserProfile(userId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsedId = adminIdSchema.safeParse(userId);
  const parsed = adminProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    learningField: formData.get("learningField"),
    studentEmail: formData.get("studentEmail"),
    studentId: formData.get("studentId"),
  });
  if (!parsedId.success || !parsed.success) {
    redirectMessage("/admin/users", "error", "Thông tin hồ sơ không hợp lệ.");
  }
  const { error } = await createSupabaseAdminClient()
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      learning_field: parsed.data.learningField,
      student_email: parsed.data.studentEmail,
      student_id: parsed.data.studentId,
    })
    .eq("user_id", parsedId.data);
  if (error) redirectMessage("/admin/users", "error", "Không thể cập nhật hồ sơ người dùng.");
  revalidatePath("/admin/users");
  redirectMessage("/admin/users", "saved", "Đã cập nhật hồ sơ người dùng.");
}

export async function deleteUser(userId: string, formData?: FormData): Promise<void> {
  void formData;
  const currentAdmin = await requireAdmin();
  const parsed = adminIdSchema.safeParse(userId);
  if (!parsed.success) redirectMessage("/admin/users", "error", parsed.error.issues[0].message);
  if (parsed.data === currentAdmin.id) {
    redirectMessage("/admin/users", "error", "Bạn không thể tự xóa tài khoản admin đang đăng nhập.");
  }
  const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(parsed.data);
  if (error) redirectMessage("/admin/users", "error", "Không thể xóa người dùng.");
  revalidatePath("/admin/users");
  redirectMessage("/admin/users", "saved", "Đã xóa người dùng và dữ liệu liên quan.");
}
