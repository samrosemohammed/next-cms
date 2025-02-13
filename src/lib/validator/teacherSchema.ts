import z from "zod";

export const teacherSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  teacherName: z.string().min(1, "Teacher Name is required"),
  teacherEmail: z.string().email("Invalid email format"),
  teacherPassword: z.string().min(1, "Teacher Password is required"),
  teacherImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Please select an image")
    .refine(
      (files) => files[0]?.size < 5000000,
      "Image size should be less than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files[0]?.type),
      "Only JPEG and PNG images are allowed"
    ),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
