import { z } from "zod";

import { makerspaceResourceCategories } from "@/schemas/makerspace-booking";
import { learningFields } from "@/schemas/profile";

export const adminIdSchema = z.uuid("Mã dữ liệu không hợp lệ.");

export const adminPromptSchema = z.object({
  category: z.string().trim().min(2).max(120),
  code: z.string().trim().regex(/^P[0-9]{2,}$/, "Mã prompt phải có dạng P01."),
  content: z.string().trim().min(10).max(10000),
  isActive: z.boolean(),
  purpose: z.string().trim().min(2).max(500),
  sortOrder: z.number().int().min(0).max(100000),
  tip: z.string().trim().max(1000),
  title: z.string().trim().min(2).max(200),
});

export const adminResourceSchema = z.object({
  autoApprove: z.boolean(),
  capacity: z.number().int().min(1).max(100),
  category: z.enum(makerspaceResourceCategories),
  description: z.string().trim().min(10).max(500),
  isActive: z.boolean(),
  location: z.string().trim().min(2).max(120),
  maxPeople: z.number().int().min(1).max(100),
  name: z.string().trim().min(2).max(120),
});

export const adminProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  learningField: z.enum(learningFields),
  studentEmail: z.email().trim().toLowerCase().max(254),
  studentId: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/),
});

export const adminIdeaReviewSchema = z.object({
  adminResponse: z.string().trim().max(5000),
  status: z.enum(["pending", "approved"]),
});
