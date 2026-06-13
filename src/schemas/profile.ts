import { z } from "zod";

export const learningFields = [
  "Khoa học tự nhiên",
  "Khoa học xã hội",
  "Công nghệ thông tin",
  "Kinh tế và quản lý",
  "Ngôn ngữ và văn hóa",
  "Nghệ thuật và thiết kế",
  "Khác",
] as const;

export const profileSchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(3, "Mã học sinh cần ít nhất 3 ký tự.")
    .max(40, "Mã học sinh không được vượt quá 40 ký tự.")
    .regex(/^[A-Za-z0-9_-]+$/, "Mã học sinh chỉ gồm chữ, số, _ hoặc -."),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên cần ít nhất 2 ký tự.")
    .max(120, "Họ và tên không được vượt quá 120 ký tự."),
  learningField: z.enum(learningFields, {
    error: "Vui lòng chọn lĩnh vực học tập.",
  }),
  studentEmail: z
    .email("Email học sinh không hợp lệ.")
    .trim()
    .toLowerCase()
    .max(254, "Email học sinh không hợp lệ."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
