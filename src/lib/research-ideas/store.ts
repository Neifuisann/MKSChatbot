import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ResearchIdeaFeedback,
  ResearchIdeaInput,
} from "@/schemas/research-idea";

export type ResearchIdeaStatus = "approved" | "pending";

export type ResearchIdea = ResearchIdeaInput & {
  adminResponse: string | null;
  aiFeedback: ResearchIdeaFeedback;
  approvedAt: string | null;
  createdAt: string;
  id: string;
  status: ResearchIdeaStatus;
  updatedAt: string;
};

type IdeaWriteInput = ResearchIdeaInput & {
  aiFeedback: ResearchIdeaFeedback;
  aiModel: string;
  userId: string;
};

function mapIdea(row: Record<string, unknown>): ResearchIdea {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    field: row.field as ResearchIdeaInput["field"],
    status: row.status as ResearchIdeaStatus,
    aiFeedback: row.ai_feedback as ResearchIdeaFeedback,
    adminResponse: (row.admin_response as string | null) ?? null,
    approvedAt: (row.approved_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listResearchIdeas(userId: string): Promise<ResearchIdea[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("research_ideas")
    .select(
      "id, title, description, field, status, ai_feedback, admin_response, approved_at, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapIdea(row));
}

export async function createResearchIdea(input: IdeaWriteInput): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("research_ideas").insert({
    user_id: input.userId,
    title: input.title,
    description: input.description,
    field: input.field,
    ai_feedback: input.aiFeedback,
    ai_model: input.aiModel,
  });

  if (error) throw error;
}

export async function isPendingResearchIdeaOwnedByUser(
  id: string,
  userId: string,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("research_ideas")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function updateResearchIdea(
  id: string,
  input: IdeaWriteInput,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("research_ideas")
    .update({
      title: input.title,
      description: input.description,
      field: input.field,
      ai_feedback: input.aiFeedback,
      ai_model: input.aiModel,
    })
    .eq("id", id)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function deleteResearchIdea(
  id: string,
  userId: string,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("research_ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
