import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminResearchIdea = {
  adminResponse: string | null;
  createdAt: string;
  description: string;
  field: string;
  id: string;
  ownerEmail: string;
  ownerName: string;
  status: "approved" | "pending";
  title: string;
};

export type AdminResource = {
  autoApprove: boolean;
  capacity: number;
  category: string;
  description: string;
  id: string;
  isActive: boolean;
  location: string;
  maxPeople: number;
  name: string;
};

export type AdminPrompt = {
  category: string;
  code: string;
  content: string;
  id: string;
  isActive: boolean;
  purpose: string;
  sortOrder: number;
  tip: string;
  title: string;
};

export type AdminManagedUser = {
  createdAt: string;
  email: string;
  fullName: string | null;
  id: string;
  lastSignInAt: string | null;
  learningField: string | null;
  role: string;
  studentEmail: string | null;
  studentId: string | null;
};

export async function getAdminDashboardCounts(): Promise<{
  activeResources: number;
  prompts: number;
  researchIdeas: number;
  users: number;
}> {
  const admin = createSupabaseAdminClient();
  const [ideas, prompts, resources, users] = await Promise.all([
    admin.from("research_ideas").select("*", { count: "exact", head: true }),
    admin.from("prompts").select("*", { count: "exact", head: true }),
    admin
      .from("makerspace_resources")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
  ]);

  if (ideas.error) throw ideas.error;
  if (prompts.error) throw prompts.error;
  if (resources.error) throw resources.error;
  if (users.error) throw users.error;

  return {
    activeResources: resources.count ?? 0,
    prompts: prompts.count ?? 0,
    researchIdeas: ideas.count ?? 0,
    users: users.data.total ?? users.data.users.length,
  };
}

export async function listAdminResearchIdeas(): Promise<AdminResearchIdea[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: ideas, error }, { data: profiles, error: profileError }] =
    await Promise.all([
      admin
        .from("research_ideas")
        .select("id, user_id, title, description, field, status, admin_response, created_at")
        .order("created_at", { ascending: false }),
      admin.from("profiles").select("user_id, full_name, student_email"),
    ]);

  if (error) throw error;
  if (profileError) throw profileError;
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));

  return (ideas ?? []).map((idea) => {
    const profile = profileMap.get(idea.user_id);
    return {
      adminResponse: idea.admin_response,
      createdAt: idea.created_at,
      description: idea.description,
      field: idea.field,
      id: idea.id,
      ownerEmail: profile?.student_email || "Chưa có email hồ sơ",
      ownerName: profile?.full_name || "Học sinh chưa khai báo hồ sơ",
      status: idea.status,
      title: idea.title,
    };
  });
}

export async function listAdminResources(): Promise<AdminResource[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("makerspace_resources")
    .select("id, name, category, description, location, capacity, max_people, auto_approve, is_active")
    .order("is_active", { ascending: false })
    .order("category")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((resource) => ({
    autoApprove: resource.auto_approve,
    capacity: resource.capacity,
    category: resource.category,
    description: resource.description,
    id: resource.id,
    isActive: resource.is_active,
    location: resource.location,
    maxPeople: resource.max_people,
    name: resource.name,
  }));
}

export async function listAdminPrompts(): Promise<AdminPrompt[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("prompts")
    .select("id, code, category, title, purpose, content, tip, sort_order, is_active")
    .order("sort_order")
    .order("code");
  if (error) throw error;
  return (data ?? []).map((prompt) => ({
    category: prompt.category,
    code: prompt.code,
    content: prompt.content,
    id: prompt.id,
    isActive: prompt.is_active,
    purpose: prompt.purpose,
    sortOrder: prompt.sort_order,
    tip: prompt.tip,
    title: prompt.title,
  }));
}

export async function listAdminUsers(): Promise<AdminManagedUser[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: authData, error }, { data: profiles, error: profileError }] =
    await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("profiles").select("user_id, student_id, full_name, learning_field, student_email"),
    ]);
  if (error) throw error;
  if (profileError) throw profileError;
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));

  return authData.users.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      createdAt: user.created_at,
      email: user.email || "Không có email",
      fullName: profile?.full_name ?? null,
      id: user.id,
      lastSignInAt: user.last_sign_in_at ?? null,
      learningField: profile?.learning_field ?? null,
      role: typeof user.app_metadata.role === "string" ? user.app_metadata.role : "student",
      studentEmail: profile?.student_email ?? null,
      studentId: profile?.student_id ?? null,
    };
  });
}
