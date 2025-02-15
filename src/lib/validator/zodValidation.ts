import z from "zod";

export const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().min(1, "Student Name is required"),
  studentEmail: z.string().email("Invalid email format"),
  studentPassword: z.string().min(1, "Student Password is required"),
  studentGroup: z.string().min(1, "Student Group is required"),
  studentImage: z.any().optional(),
});
export type StudentFormData = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  teacherName: z.string().min(1, "Teacher Name is required"),
  teacherEmail: z.string().email("Invalid email format"),
  teacherPassword: z.string().min(1, "Teacher Password is required"),
  teacherImage: z.any().optional(),
});
export type TeacherFormData = z.infer<typeof teacherSchema>;

export const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});
export type ModuleFormData = z.infer<typeof moduleSchema>;

export const groupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  groupName: z
    .string()
    .min(1, "Group Name is required")
    .regex(/^[A-Z]+$/, "Group Name must contain only capital letters"),
});
export type GroupFormData = z.infer<typeof groupSchema>;

export const assignModuleSchema = z.object({
  studentGroup: z.string().min(1, "Student Group is required"),
  teacher: z.string().min(1, "Teacher is required"),
});
export type AssignModuleFormData = z.infer<typeof assignModuleSchema>;
