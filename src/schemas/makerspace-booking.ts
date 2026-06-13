import { z } from "zod";

export const makerspaceResourceCategories = [
  "space",
  "equipment",
  "tool",
  "fabrication",
] as const;

export const makerspaceBookingStatuses = [
  "pending",
  "approved",
  "cancelled",
  "completed",
] as const;

const makerspaceBookingBaseSchema = z.object({
  attendeeCount: z.number().int().min(1).max(100),
  endsAt: z.iso.datetime(),
  notes: z.string().trim().max(1000).optional(),
  purpose: z.string().trim().min(10).max(1000),
  quantity: z.number().int().min(1).max(100),
  resourceId: z.uuid(),
  startsAt: z.iso.datetime(),
});

export const makerspaceBookingInputSchema = makerspaceBookingBaseSchema
  .superRefine((input, context) => {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    const duration = endsAt.getTime() - startsAt.getTime();

    if (endsAt <= startsAt) {
      context.addIssue({
        code: "custom",
        message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
        path: ["endsAt"],
      });
    }

    if (duration > 8 * 60 * 60 * 1000) {
      context.addIssue({
        code: "custom",
        message: "Mỗi lượt đăng ký không được dài quá 8 giờ.",
        path: ["endsAt"],
      });
    }
  });

export const makerspaceAvailabilityInputSchema = makerspaceBookingBaseSchema
  .pick({
    endsAt: true,
    quantity: true,
    resourceId: true,
    startsAt: true,
  })
  .refine((input) => new Date(input.endsAt) > new Date(input.startsAt), {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
    path: ["endsAt"],
  });

export type MakerspaceBookingInput = z.infer<typeof makerspaceBookingInputSchema>;
export type MakerspaceResourceCategory =
  (typeof makerspaceResourceCategories)[number];
export type MakerspaceBookingStatus =
  (typeof makerspaceBookingStatuses)[number];
