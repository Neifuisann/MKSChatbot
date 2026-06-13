"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { evaluateResearchIdea } from "@/lib/research-ideas/evaluate";
import {
  createResearchIdea,
  deleteResearchIdea,
  isPendingResearchIdeaOwnedByUser,
  updateResearchIdea,
} from "@/lib/research-ideas/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  researchIdeaIdSchema,
  researchIdeaInputSchema,
  type ResearchIdeaInput,
} from "@/schemas/research-idea";

function redirectWithError(message: string): never {
  redirect(`/research-ideas?error=${encodeURIComponent(message)}`);
}

function parseIdea(formData: FormData): ResearchIdeaInput {
  const result = researchIdeaInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    field: formData.get("field"),
  });

  if (!result.success) {
    redirectWithError(result.error.issues[0].message);
  }

  return result.data;
}

async function requireUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user.id;
}

function researchIdeaErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.includes("RESEARCH_IDEA_LIMIT_REACHED")
  ) {
    return "Bạn đã có 3 ý tưởng đang chờ duyệt. Hãy chỉnh sửa hoặc xóa một ý tưởng trước khi gửi thêm.";
  }

  return "Không thể lưu thay đổi lúc này. Vui lòng thử lại.";
}

export async function submitResearchIdea(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const input = parseIdea(formData);
  const evaluation = await evaluateResearchIdea(input);

  try {
    await createResearchIdea({
      ...input,
      aiFeedback: evaluation.feedback,
      aiModel: evaluation.model,
      userId,
    });
  } catch (error) {
    redirectWithError(researchIdeaErrorMessage(error));
  }

  revalidatePath("/research-ideas");
  redirect("/research-ideas?saved=1");
}

export async function editResearchIdea(
  id: string,
  formData: FormData,
): Promise<void> {
  const userId = await requireUserId();
  const parsedId = researchIdeaIdSchema.safeParse(id);
  if (!parsedId.success) redirectWithError(parsedId.error.issues[0].message);

  if (!(await isPendingResearchIdeaOwnedByUser(parsedId.data, userId))) {
    redirectWithError("Ý tưởng đã được duyệt hoặc bạn không có quyền chỉnh sửa.");
  }

  const input = parseIdea(formData);
  const evaluation = await evaluateResearchIdea(input);

  try {
    const updated = await updateResearchIdea(parsedId.data, {
      ...input,
      aiFeedback: evaluation.feedback,
      aiModel: evaluation.model,
      userId,
    });

    if (!updated) {
      redirectWithError("Ý tưởng đã được duyệt hoặc bạn không có quyền chỉnh sửa.");
    }
  } catch (error) {
    redirectWithError(researchIdeaErrorMessage(error));
  }

  revalidatePath("/research-ideas");
  redirect("/research-ideas?updated=1");
}

export async function removeResearchIdea(id: string): Promise<void> {
  const userId = await requireUserId();
  const parsedId = researchIdeaIdSchema.safeParse(id);
  if (!parsedId.success) redirectWithError(parsedId.error.issues[0].message);

  try {
    const deleted = await deleteResearchIdea(parsedId.data, userId);
    if (!deleted) {
      redirectWithError("Ý tưởng đã được duyệt hoặc bạn không có quyền xóa.");
    }
  } catch {
    redirectWithError("Không thể xóa ý tưởng lúc này. Vui lòng thử lại.");
  }

  revalidatePath("/research-ideas");
  redirect("/research-ideas?deleted=1");
}
