import { z } from "zod";

export const groupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  groupName: z
    .string()
    .min(1, "Group Name is required")
    .regex(/^[A-Z]+$/, "Group Name must contain only capital letters"),
});

export type GroupFormData = z.infer<typeof groupSchema>;
