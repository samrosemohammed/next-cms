import z from "zod";
export const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});
export type ModuleFormData = z.infer<typeof moduleSchema>;
