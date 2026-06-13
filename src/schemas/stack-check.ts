import { z } from "zod";

export const stackCheckSchema = z.object({
  question: z.string().trim().min(2, "Enter at least two characters."),
});

export type StackCheckInput = z.infer<typeof stackCheckSchema>;
