"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema } from "@/schemas/profile";

export async function saveProfile(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    redirect(
      `/profile?error=${encodeURIComponent("Không thể kiểm tra hồ sơ lúc này. Vui lòng thử lại.")}`,
    );
  }

  if (existingProfile) {
    redirect(
      `/profile?error=${encodeURIComponent("Hồ sơ đã được lưu và không thể thay đổi.")}`,
    );
  }

  const result = profileSchema.safeParse({
    studentId: formData.get("studentId"),
    fullName: formData.get("fullName"),
    learningField: formData.get("learningField"),
    studentEmail: formData.get("studentEmail"),
  });

  if (!result.success) {
    redirect(`/profile?error=${encodeURIComponent(result.error.issues[0].message)}`);
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    student_id: result.data.studentId,
    full_name: result.data.fullName,
    learning_field: result.data.learningField,
    student_email: result.data.studentEmail,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "Hồ sơ đã tồn tại, hoặc mã học sinh/email học sinh đã được sử dụng."
        : "Không thể lưu hồ sơ lúc này. Vui lòng thử lại.";
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
