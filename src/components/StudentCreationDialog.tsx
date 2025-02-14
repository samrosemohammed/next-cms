"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentFormData, studentSchema } from "@/lib/validator/zodValidation";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { trpc } from "@/app/_trpc/client";
export const StudentCreationDialog = () => {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState<boolean>(false);
  const { startUpload } = useUploadThing("imageUploader");
  const createStudent = trpc.createUserWithStudent.useMutation({
    onSuccess: (data) => {
      utils.getStudents.invalidate();
      setOpen(false);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      const file = Array.from(data.studentImage as FileList)[0];
      const res = await startUpload([file]);
      if (res && res[0]) {
        console.log(res[0].ufsUrl);
      }
      data.studentImage = res ? res[0].ufsUrl : null;
      await createStudent.mutateAsync(data);
      console.log("data: ", data);
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Enroll Student <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Enroll a student. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="student-id" className="w-full">
                ID
              </Label>
              <Input
                id="student-id"
                {...register("studentId")}
                className={cn("w-full", {
                  "border-destructive focus-visible:ring-destructive":
                    errors.studentId,
                  "border-input focus-visible:ring-ring": !errors.studentId,
                })}
                onChange={(e) => setValue("studentId", e.target.value)}
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm">
                  {errors.studentId.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-name" className="w-full">
                Name
              </Label>
              <Input
                id="student-name"
                {...register("studentName")}
                className="w-full"
                onChange={(e) => setValue("studentName", e.target.value)}
              />
              {errors.studentName && (
                <p className="text-red-500 text-sm">
                  {errors.studentName.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-email" className="w-full">
                Email
              </Label>
              <Input
                id="student-email"
                {...register("studentEmail")}
                className="w-full"
                onChange={(e) => setValue("studentEmail", e.target.value)}
              />
              {errors.studentEmail && (
                <p className="text-red-500 text-sm">
                  {errors.studentEmail.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-password" className="w-full">
                Password
              </Label>
              <Input
                id="student-password"
                {...register("studentPassword")}
                className="w-full"
                onChange={(e) => setValue("studentPassword", e.target.value)}
              />
              {errors.studentPassword && (
                <p className="text-red-500 text-sm">
                  {errors.studentPassword.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="student-img" className="w-full">
                Select Image
              </Label>
              <Input
                type="file"
                id="student-image"
                {...register("studentImage")}
                className="w-full"
              />
              {errors.studentImage && (
                <p className="text-red-500 text-sm">
                  {errors.studentImage.message?.toString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
