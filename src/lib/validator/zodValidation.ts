import z from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  bio: z.string().optional(),
  username: z.string().optional(),
  image: z.any().optional(),
});
export type ProfileFormData = z.infer<typeof profileSchema>;
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
  startDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
  endDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
});
export type ModuleFormData = z.infer<typeof moduleSchema>;

export const groupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  groupName: z
    .string()
    .min(1, "Group Name is required")
    .regex(
      /^[A-Z0-9]+$/,
      "Group Name must contain only capital letters and numbers"
    ),
});
export type GroupFormData = z.infer<typeof groupSchema>;

export const assignModuleSchema = z.object({
  teacher: z.string().min(1, "Teacher is required"),
  group: z.string().min(1, "Group is required"),
  moduleId: z.string().min(1, "Module is required"),
});
export type AssignModuleFormData = z.infer<typeof assignModuleSchema>;

export const resourceSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required").optional(),
  links: z.array(z.any()).optional(),
  files: z.array(z.any()).optional(),
  moduleId: z.string().min(1, "Module is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  groupId: z.string().min(1, "Group is required"),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

export const announcementSchema = z.object({
  description: z.string().min(5, "Description is required"),
  links: z.array(z.any()).optional(),
  files: z.array(z.any()).optional(),
  moduleId: z.string().min(1, "Module is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  groupId: z.string().min(1, "Group is required"),
});
export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const assignmentSchema = z.object({
  title: z.string().min(3, "Title is requried"),
  description: z.string().min(5, "Description is required").optional(),
  dueDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date({ required_error: "Due Date is required" }) // Custom error for missing field
  ),
  moduleId: z.string().min(1, "Module is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  groupId: z.string().min(1, "Group is required"),
  links: z.array(z.any()).optional(),
  files: z.array(z.any()).optional(),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  moduleId: z.string().min(1, "Module ID is required"),
  groupId: z.string().min(1, "Group ID is required"),
  files: z.array(z.any()).min(1, "Files are required"),
  links: z.array(z.any()).optional(),
});
export type SubmitAssignmentFormData = z.infer<typeof submitAssignmentSchema>;
