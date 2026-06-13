"use server";

import { revalidatePath } from "next/cache";

import {
  createMakerspaceBooking,
  getMakerspaceAvailability,
  type MakerspaceAvailability,
} from "@/lib/makerspace/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  makerspaceAvailabilityInputSchema,
  makerspaceBookingInputSchema,
  type MakerspaceBookingInput,
} from "@/schemas/makerspace-booking";

export type MakerspaceActionResult = {
  error?: string;
  success?: string;
};

async function requireUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");
  return user.id;
}

function bookingErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("MAKERSPACE_SLOT_UNAVAILABLE")) {
      return "Khung giờ này vừa được người khác đăng ký. Vui lòng kiểm tra lịch trống lại.";
    }
    if (error.message.includes("MAKERSPACE_CAPACITY_EXCEEDED")) {
      return "Số lượng hoặc số người vượt quá giới hạn của tài nguyên.";
    }
  }

  return "Không thể gửi đăng ký lúc này. Vui lòng thử lại.";
}

export async function checkMakerspaceAvailability(
  input: unknown,
): Promise<MakerspaceAvailability & { error?: string }> {
  await requireUserId();
  const parsed = makerspaceAvailabilityInputSchema.safeParse(input);

  if (!parsed.success) {
    return { available: 0, error: parsed.error.issues[0].message, isAvailable: false, requested: 0 };
  }

  try {
    return await getMakerspaceAvailability(parsed.data);
  } catch {
    return {
      available: 0,
      error: "Không thể kiểm tra lịch trống lúc này.",
      isAvailable: false,
      requested: parsed.data.quantity,
    };
  }
}

export async function submitMakerspaceBooking(
  input: MakerspaceBookingInput,
): Promise<MakerspaceActionResult> {
  const userId = await requireUserId();
  const parsed = makerspaceBookingInputSchema.safeParse(input);

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (new Date(parsed.data.startsAt) <= new Date()) {
    return { error: "Thời gian bắt đầu phải ở trong tương lai." };
  }

  try {
    await createMakerspaceBooking({ ...parsed.data, userId });
  } catch (error) {
    return { error: bookingErrorMessage(error) };
  }

  revalidatePath("/makerspace");
  return { success: "Đăng ký đã được gửi. Trạng thái duyệt được cập nhật bên dưới." };
}
